#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

interface RestorationOptions {
  subject?: string;
  dryRun?: boolean;
  limitPerUnit?: number;
}

async function restoreLessonPlans(options: RestorationOptions = {}) {
  console.log('🔄 LESSON PLAN RESTORATION SYSTEM');
  console.log('==================================\n');
  
  const { subject, dryRun = false, limitPerUnit } = options;
  
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
  }
  
  try {
    // Get Emily's user
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found');
    }
    
    // Get current unit plans
    const currentUnits = await prisma.unitPlan.findMany({
      where: subject ? {
        longRangePlan: {
          subject
        }
      } : {},
      include: {
        longRangePlan: true,
        expectations: {
          include: {
            expectation: true
          }
        }
      }
    });
    
    console.log(`Found ${currentUnits.length} current unit plans${subject ? ` for ${subject}` : ''}\n`);
    
    // Restoration statistics
    let totalRestored = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    
    // Process each unit
    for (const unit of currentUnits) {
      console.log(`\n📚 Unit: ${unit.title || unit.titleFr}`);
      console.log(`   Subject: ${unit.longRangePlan.subject}`);
      console.log(`   Dates: ${unit.startDate.toISOString().split('T')[0]} to ${unit.endDate.toISOString().split('T')[0]}`);
      
      // Find matching lesson seed files
      const seedFiles = findMatchingSeedFiles(unit);
      
      if (seedFiles.length === 0) {
        console.log('   ⚠️ No matching lesson seed files found');
        continue;
      }
      
      console.log(`   📄 Found ${seedFiles.length} matching seed file(s)`);
      
      // Clear existing lessons for this unit (if not dry run)
      if (!dryRun) {
        const deleted = await prisma.eTFOLessonPlan.deleteMany({
          where: { unitPlanId: unit.id }
        });
        if (deleted.count > 0) {
          console.log(`   🗑️ Cleared ${deleted.count} existing lessons`);
        }
      }
      
      // Process each seed file
      for (const seedFile of seedFiles) {
        console.log(`   📄 Processing: ${seedFile}`);
        
        try {
          const lessons = await extractLessonsFromSeed(seedFile, unit, emily.id);
          
          if (lessons.length === 0) {
            console.log(`      ⚠️ No lessons extracted`);
            continue;
          }
          
          // Apply limit if specified
          const lessonsToRestore = limitPerUnit ? lessons.slice(0, limitPerUnit) : lessons;
          
          console.log(`      📝 Found ${lessons.length} lessons, restoring ${lessonsToRestore.length}`);
          
          if (!dryRun) {
            // Create lessons in batches
            const batchSize = 10;
            for (let i = 0; i < lessonsToRestore.length; i += batchSize) {
              const batch = lessonsToRestore.slice(i, i + batchSize);
              
              // Create each lesson individually to handle any duplicates
              for (const lesson of batch) {
                try {
                  await prisma.eTFOLessonPlan.create({ data: lesson });
                } catch (error: any) {
                  if (!error.message.includes('Unique constraint')) {
                    console.error(`      ⚠️ Failed to create lesson: ${error.message}`);
                  }
                }
              }
              
              console.log(`      ✅ Restored batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(lessonsToRestore.length/batchSize)}`);
            }
            
            totalRestored += lessonsToRestore.length;
          } else {
            console.log(`      🔍 Would restore ${lessonsToRestore.length} lessons`);
            totalSkipped += lessonsToRestore.length;
          }
          
        } catch (error) {
          console.error(`      ❌ Error processing seed file: ${error.message}`);
          totalErrors++;
        }
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESTORATION SUMMARY');
    console.log('='.repeat(60));
    
    if (dryRun) {
      console.log(`Lessons that would be restored: ${totalSkipped}`);
    } else {
      console.log(`Lessons restored: ${totalRestored}`);
    }
    
    console.log(`Errors encountered: ${totalErrors}`);
    
    // Verify restoration
    if (!dryRun && totalRestored > 0) {
      const lessonCount = await prisma.eTFOLessonPlan.count();
      console.log(`\nTotal lessons in database: ${lessonCount}`);
    }
    
  } catch (error) {
    console.error('❌ Restoration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function findMatchingSeedFiles(unit: any): string[] {
  const seedDir = path.join(__dirname, 'prisma');
  const subject = unit.longRangePlan.subject.toLowerCase();
  const unitTitle = (unit.titleFr || unit.title).toLowerCase();
  const startMonth = unit.startDate.toISOString().split('-')[1];
  const monthNames = ['', 'january', 'february', 'march', 'april', 'may', 'june', 
                       'july', 'august', 'september', 'october', 'november', 'december'];
  const monthName = monthNames[parseInt(startMonth)];
  
  const files: string[] = [];
  const allFiles = fs.readdirSync(seedDir);
  
  // Subject-specific keyword mapping
  const subjectKeywords: { [key: string]: string[] } = {
    'français langue première': ['french', 'français', 'bienvenue'],
    'mathématiques': ['math'],
    'sciences': ['science'],
    'sciences humaines': ['social'],
    'arts': ['arts', 'art'],
    'music': ['music'],
    'éducation physique': ['pe-', 'physique'],
    'formation personnelle et sociale': ['health', 'fps', 'personal'],
    'english language arts': ['english', 'ela']
  };
  
  // Get keywords for this subject
  const keywords = subjectKeywords[subject] || [subject.split(' ')[0]];
  
  // First, try to find subject-specific files for this month
  for (const keyword of keywords) {
    // Pattern 1: seed-lesson-plans-{keyword}-{month}.ts
    const monthPattern = new RegExp(`seed-lesson-plans-${keyword}-${monthName}`, 'i');
    // Pattern 2: seed-{keyword}-lessons-{month}
    const altPattern = new RegExp(`seed-${keyword}.*${monthName}`, 'i');
    // Pattern 3: unit-specific files
    const unitPattern = new RegExp(`seed-.*${unitTitle.split(' ')[0]}`, 'i');
    
    const matches = allFiles.filter(f => {
      if (!f.endsWith('.ts')) return false;
      // Check if file matches keyword AND month
      const hasKeyword = f.toLowerCase().includes(keyword);
      const hasMonth = f.toLowerCase().includes(monthName);
      
      // Prioritize files that match both subject and month
      if (hasKeyword && hasMonth) return true;
      
      // For comprehensive files, check keyword only
      if (hasKeyword && f.includes('comprehensive')) return true;
      if (hasKeyword && f.includes('master')) return true;
      
      // Check specific patterns
      return monthPattern.test(f) || altPattern.test(f) || unitPattern.test(f);
    });
    
    matches.forEach(m => {
      const fullPath = path.join(seedDir, m);
      if (!files.includes(fullPath)) {
        files.push(fullPath);
      }
    });
  }
  
  // Special case: For units that might use generic "all subjects" files
  if (files.length === 0) {
    const genericPattern = new RegExp(`seed-lesson-plans-${monthName}`, 'i');
    const genericMatches = allFiles.filter(f => 
      genericPattern.test(f) && f.endsWith('.ts') && f.includes('all')
    );
    genericMatches.forEach(m => {
      const fullPath = path.join(seedDir, m);
      if (!files.includes(fullPath)) {
        files.push(fullPath);
      }
    });
  }
  
  // Special comprehensive file handling
  if (subject.includes('physique')) {
    const peFiles = [
      'seed-pe-comprehensive-108-lessons.ts',
      'seed-pe-lessons-sept-dec.ts'
    ];
    peFiles.forEach(fileName => {
      const fullPath = path.join(seedDir, fileName);
      if (fs.existsSync(fullPath) && !files.includes(fullPath)) {
        files.push(fullPath);
      }
    });
  }
  
  if (subject.includes('music')) {
    const musicFiles = [
      'seed-music-master-72-lessons.ts',
      'seed-music-lessons-comprehensive-72.ts'
    ];
    musicFiles.forEach(fileName => {
      const fullPath = path.join(seedDir, fileName);
      if (fs.existsSync(fullPath) && !files.includes(fullPath)) {
        files.push(fullPath);
      }
    });
  }
  
  return files;
}

async function extractLessonsFromSeed(seedFile: string, unit: any, userId: number): Promise<any[]> {
  const content = fs.readFileSync(seedFile, 'utf-8');
  const lessons: any[] = [];
  
  // Calculate date range for unit
  const unitStart = new Date(unit.startDate);
  const unitEnd = new Date(unit.endDate);
  const unitDays = Math.ceil((unitEnd.getTime() - unitStart.getTime()) / (1000 * 60 * 60 * 24));
  
  // Try to extract lessons using different patterns
  // Pattern 1: lessonPlans.push({...})
  const pushPattern = /lessonPlans\.push\(\{[\s\S]*?\}\);/g;
  // Pattern 2: lessons array with objects
  const arrayPattern = /(?:const|let|var)\s+\w*[lL]essons?\w*\s*=\s*\[([\s\S]*?)\];/g;
  // Pattern 3: createMany with data array
  const createManyPattern = /createMany\(\{[\s]*data:\s*\[([\s\S]*?)\][\s]*\}/g;
  // Pattern 4: lesson objects in templates
  const templatePattern = /\{[^{}]*title[Fr]*:\s*['"][^'"]+['"][^{}]*learningGoals[^{}]*\}/g;
  
  let extractedData: string[] = [];
  
  // Try each pattern
  let matches = content.match(pushPattern);
  if (matches) extractedData.push(...matches);
  
  matches = content.match(templatePattern);
  if (matches) extractedData.push(...matches);
  
  // Also look for lesson template objects
  const lessonTemplateMatch = content.match(/lessonTemplates\s*=\s*\{([\s\S]*?)\};/);
  if (lessonTemplateMatch) {
    const templates = lessonTemplateMatch[1].match(/\{[^{}]*title[Fr]*:\s*['"][^'"]+['"][^{}]*\}/g);
    if (templates) extractedData.push(...templates);
  }
  
  // Process each extracted lesson
  extractedData.forEach((lessonData, index) => {
    try {
      // Extract all fields using careful regex
      const extractField = (fieldName: string): string | null => {
        const patterns = [
          new RegExp(`${fieldName}:\\s*['"]([^'"]*?)['"]`, 'i'),
          new RegExp(`${fieldName}:\\s*\`([^\`]*?)\``, 'i'),
          new RegExp(`${fieldName}:\\s*JSON\\.stringify\\(([^)]+)\\)`, 'i')
        ];
        
        for (const pattern of patterns) {
          const match = lessonData.match(pattern);
          if (match) return match[1];
        }
        return null;
      };
      
      const title = extractField('title') || extractField('titleFr');
      if (!title) return; // Skip if no title found
      
      // Calculate lesson date (distribute evenly across unit)
      const lessonDate = new Date(unitStart);
      const daysToAdd = Math.floor((index / extractedData.length) * unitDays);
      lessonDate.setDate(lessonDate.getDate() + daysToAdd);
      
      // Skip weekends
      while (lessonDate.getDay() === 0 || lessonDate.getDay() === 6) {
        lessonDate.setDate(lessonDate.getDate() + 1);
      }
      
      // Extract rich content from seed
      const learningGoals = extractField('learningGoals') || 
        `Students will ${title.toLowerCase().includes('explore') ? 'explore' : 'learn'} ${title.toLowerCase()}`;
      
      const mindsOn = extractField('mindsOn') || 'Engaging introduction activity';
      const action = extractField('action') || 'Main learning activities with hands-on practice';
      const consolidation = extractField('consolidation') || 'Reflection and sharing of learning';
      
      // Extract or generate materials
      let materials = extractField('materials');
      if (!materials) {
        materials = JSON.stringify(['Chart paper', 'Markers', 'Learning materials']);
      } else if (!materials.startsWith('[')) {
        // Convert to JSON array if it's not already
        materials = JSON.stringify(materials.split(',').map(m => m.trim()));
      }
      
      // Extract other fields
      const duration = parseInt(extractField('duration') || '60');
      const grouping = extractField('grouping') || 'Whole class, small groups, partners';
      const accommodations = extractField('accommodations') || 
        JSON.stringify(['Visual supports', 'Modified tasks', 'Peer support']);
      
      // Build differentiation strategies
      let diffStrategies = extractField('differentiationStrategies');
      if (!diffStrategies) {
        diffStrategies = JSON.stringify({
          support: 'Simplified tasks, visual aids, peer assistance',
          extension: 'Advanced challenges, leadership roles',
          multiModal: 'Visual, auditory, kinesthetic approaches'
        });
      }
      
      const assessmentNotes = extractField('assessmentNotes') || 
        'Observe student engagement, understanding, and skill development';
      
      const curriculumExpectations = extractField('curriculumExpectations') || 
        unit.expectations?.map((e: any) => e.expectation.code).join(', ') || '';
      
      // Create comprehensive lesson object
      const lesson = {
        userId,
        unitPlanId: unit.id,
        title: title,
        titleFr: extractField('titleFr') || title,
        date: lessonDate,
        duration,
        grade: 1,
        subject: unit.longRangePlan.subject,
        language: unit.longRangePlan.subject === 'Music' || unit.longRangePlan.subject === 'English Language Arts' ? 'en' : 'fr',
        learningGoals,
        mindsOn: JSON.stringify({ 
          activities: [mindsOn], 
          duration: Math.floor(duration * 0.25) 
        }),
        action: JSON.stringify({ 
          activities: [action], 
          duration: Math.floor(duration * 0.5) 
        }),
        consolidation: JSON.stringify({ 
          activities: [consolidation], 
          duration: Math.floor(duration * 0.25) 
        }),
        materials,
        grouping,
        accommodations,
        differentiationStrategies: diffStrategies,
        assessmentNotes,
        assessmentType: extractField('assessmentType') || 'formative',
        curriculumExpectations,
        isSubFriendly: true
      };
      
      lessons.push(lesson);
      
    } catch (error) {
      // Skip malformed lessons silently
    }
  });
  
  // If no lessons found with rich extraction, fall back to basic extraction
  if (lessons.length === 0) {
    console.log('      ⚠️ Using fallback extraction method');
    const basicMatches = content.match(/title[Fr]*:\s*['"]([^'"]+)['"]/g) || [];
    basicMatches.forEach((match, index) => {
      const title = match.match(/['"]([^'"]+)['"]/)?.[1];
      if (title) {
        const lessonDate = new Date(unitStart);
        lessonDate.setDate(lessonDate.getDate() + Math.floor((index / basicMatches.length) * unitDays));
        
        while (lessonDate.getDay() === 0 || lessonDate.getDay() === 6) {
          lessonDate.setDate(lessonDate.getDate() + 1);
        }
        
        lessons.push({
          userId,
          unitPlanId: unit.id,
          title,
          titleFr: title,
          date: lessonDate,
          duration: 60,
          grade: 1,
          subject: unit.longRangePlan.subject,
          language: unit.longRangePlan.subject === 'Music' ? 'en' : 'fr',
          learningGoals: `Students will engage with ${title}`,
          mindsOn: JSON.stringify({ activities: ['Introduction activity'], duration: 15 }),
          action: JSON.stringify({ activities: ['Main learning activities'], duration: 30 }),
          consolidation: JSON.stringify({ activities: ['Reflection and sharing'], duration: 15 }),
          materials: JSON.stringify(['Learning materials']),
          grouping: 'Varied grouping strategies',
          accommodations: JSON.stringify(['Inclusive supports']),
          differentiationStrategies: JSON.stringify({
            support: 'Guided support',
            extension: 'Extended challenges'
          }),
          assessmentNotes: 'Observe student learning',
          assessmentType: 'formative',
          curriculumExpectations: '',
          isSubFriendly: true
        });
      }
    });
  }
  
  return lessons;
}

// Command line interface
const args = process.argv.slice(2);
const options: RestorationOptions = {};

if (args.includes('--dry-run')) {
  options.dryRun = true;
}

if (args.includes('--subject')) {
  const subjectIndex = args.indexOf('--subject');
  if (subjectIndex !== -1 && args[subjectIndex + 1]) {
    options.subject = args[subjectIndex + 1];
  }
}

if (args.includes('--limit')) {
  const limitIndex = args.indexOf('--limit');
  if (limitIndex !== -1 && args[limitIndex + 1]) {
    options.limitPerUnit = parseInt(args[limitIndex + 1]);
  }
}

// Help text
if (args.includes('--help')) {
  console.log(`
Lesson Plan Restoration Tool

Usage:
  npx tsx restore-lesson-plans.ts [options]

Options:
  --dry-run          Preview what would be restored without making changes
  --subject <name>   Restore lessons for a specific subject only
  --limit <number>   Limit number of lessons per unit
  --help            Show this help message

Examples:
  npx tsx restore-lesson-plans.ts --dry-run
  npx tsx restore-lesson-plans.ts --subject "Français (Immersion)"
  npx tsx restore-lesson-plans.ts --subject "Mathématiques" --limit 10
`);
  process.exit(0);
}

// Run restoration
restoreLessonPlans(options)
  .then(() => console.log('\n✅ Restoration process complete!'))
  .catch(error => {
    console.error('💥 Restoration failed:', error);
    process.exit(1);
  });