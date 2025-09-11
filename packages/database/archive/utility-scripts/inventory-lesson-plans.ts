#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';

interface LessonInventory {
  file: string;
  subject: string;
  estimatedLessons: number;
  dateRange?: { start: string; end: string };
  unitReferences?: string[];
}

async function createLessonInventory() {
  console.log('📚 LESSON PLAN INVENTORY ANALYSIS');
  console.log('==================================\n');
  
  const seedDir = path.join(__dirname, 'prisma');
  const inventory: LessonInventory[] = [];
  
  // Get all lesson seed files
  const lessonFiles = fs.readdirSync(seedDir)
    .filter(f => f.includes('lesson') && f.endsWith('.ts'))
    .sort();
  
  console.log(`Found ${lessonFiles.length} lesson plan seed files\n`);
  
  // Analyze each file
  for (const file of lessonFiles) {
    const filePath = path.join(seedDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Determine subject from filename
    let subject = 'Unknown';
    if (file.includes('french')) subject = 'Français';
    else if (file.includes('math')) subject = 'Mathématiques';
    else if (file.includes('science')) subject = 'Sciences';
    else if (file.includes('arts')) subject = 'Arts';
    else if (file.includes('music')) subject = 'Music';
    else if (file.includes('pe-') || file.includes('physique')) subject = 'Éducation physique';
    else if (file.includes('health') || file.includes('fps')) subject = 'Formation personnelle et sociale';
    else if (file.includes('bienvenue')) subject = 'Français';
    else if (file.includes('social')) subject = 'Sciences humaines';
    
    // Count lessons (various patterns)
    let lessonCount = 0;
    
    // Check for explicit lesson counts in comments
    const lessonCountMatch = content.match(/(\d+)\s+lessons?/i);
    if (lessonCountMatch) {
      lessonCount = parseInt(lessonCountMatch[1]);
    } else {
      // Count lessonPlans.push occurrences
      const pushMatches = content.match(/lessonPlans\.push/g);
      if (pushMatches) lessonCount = pushMatches.length;
      
      // Count createMany data arrays
      const createManyMatch = content.match(/data:\s*\[([\s\S]*?)\]/);
      if (createManyMatch && lessonCount === 0) {
        const dataContent = createManyMatch[1];
        const objectMatches = dataContent.match(/\{[\s\S]*?\}/g);
        if (objectMatches) lessonCount = objectMatches.length;
      }
    }
    
    // Extract date range
    const dates = content.match(/new Date\(['"](\d{4}-\d{2}-\d{2})['"]\)/g);
    let dateRange = undefined;
    if (dates && dates.length > 0) {
      const dateStrings = dates.map(d => d.match(/\d{4}-\d{2}-\d{2}/)[0]).sort();
      dateRange = {
        start: dateStrings[0],
        end: dateStrings[dateStrings.length - 1]
      };
    }
    
    // Extract unit references
    const unitRefs: string[] = [];
    const unitMatches = content.match(/unit.*?:.*?['"]([^'"]+)['"]/gi);
    if (unitMatches) {
      unitMatches.forEach(match => {
        const unitName = match.match(/['"]([^'"]+)['"]/)[1];
        if (!unitRefs.includes(unitName)) unitRefs.push(unitName);
      });
    }
    
    inventory.push({
      file,
      subject,
      estimatedLessons: lessonCount,
      dateRange,
      unitReferences: unitRefs.length > 0 ? unitRefs : undefined
    });
  }
  
  // Summary by subject
  console.log('📊 SUMMARY BY SUBJECT:');
  console.log('======================\n');
  
  const bySubject: { [key: string]: { files: number; lessons: number } } = {};
  
  inventory.forEach(item => {
    if (!bySubject[item.subject]) {
      bySubject[item.subject] = { files: 0, lessons: 0 };
    }
    bySubject[item.subject].files++;
    bySubject[item.subject].lessons += item.estimatedLessons;
  });
  
  Object.entries(bySubject).forEach(([subject, data]) => {
    console.log(`${subject}:`);
    console.log(`  Files: ${data.files}`);
    console.log(`  Estimated lessons: ${data.lessons}`);
    console.log();
  });
  
  const totalLessons = Object.values(bySubject).reduce((sum, data) => sum + data.lessons, 0);
  console.log(`TOTAL ESTIMATED LESSONS: ${totalLessons}\n`);
  
  // Detailed inventory
  console.log('📋 DETAILED INVENTORY:');
  console.log('======================\n');
  
  inventory.forEach(item => {
    console.log(`📄 ${item.file}`);
    console.log(`   Subject: ${item.subject}`);
    console.log(`   Lessons: ${item.estimatedLessons}`);
    if (item.dateRange) {
      console.log(`   Dates: ${item.dateRange.start} to ${item.dateRange.end}`);
    }
    if (item.unitReferences && item.unitReferences.length > 0) {
      console.log(`   Units: ${item.unitReferences.join(', ')}`);
    }
    console.log();
  });
  
  // Save inventory to JSON
  const inventoryPath = path.join(__dirname, 'lesson-plan-inventory.json');
  fs.writeFileSync(inventoryPath, JSON.stringify(inventory, null, 2));
  console.log(`✅ Inventory saved to: ${inventoryPath}\n`);
  
  // Recommendations
  console.log('🎯 RESTORATION RECOMMENDATIONS:');
  console.log('================================\n');
  console.log('Priority order for restoration:');
  console.log('1. Français - Core subject, September start');
  console.log('2. Mathématiques - Core subject, daily lessons');
  console.log('3. Sciences - Hands-on learning opportunities');
  console.log('4. Formation personnelle - Social-emotional development');
  console.log('5. Arts - Creative expression');
  console.log('6. Éducation physique - Already comprehensive (108 lessons)');
  console.log('7. Music - Already comprehensive (72 lessons)');
  
  return inventory;
}

// Run the inventory
createLessonInventory()
  .then(() => console.log('\n✅ Lesson inventory complete!'))
  .catch(error => {
    console.error('❌ Error creating inventory:', error);
    process.exit(1);
  });