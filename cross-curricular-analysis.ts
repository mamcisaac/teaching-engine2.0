#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeCrossCurricularConnections() {
  console.log('🔍 Analyzing Cross-Curricular Connections Across All Unit Plans...\n');
  
  try {
    // Get all unit plans with their associated data
    const unitPlans = await prisma.unitPlan.findMany({
      include: {
        longRangePlan: {
          select: {
            subject: true,
            grade: true,
            academicYear: true
          }
        },
        expectations: {
          include: {
            expectation: {
              select: {
                code: true,
                description: true,
                subject: true,
                strand: true
              }
            }
          }
        }
      },
      orderBy: [
        { longRangePlan: { subject: 'asc' } },
        { startDate: 'asc' }
      ]
    });

    console.log(`Found ${unitPlans.length} unit plans across ${new Set(unitPlans.map(u => u.longRangePlan.subject)).size} subjects\n`);

    // Analyze by subject
    const subjectMap = new Map();
    const timeOverlapMap = new Map();
    const vocabularyMap = new Map();
    const themeMap = new Map();
    const skillsMap = new Map();

    unitPlans.forEach(unit => {
      const subject = unit.longRangePlan.subject;
      
      if (!subjectMap.has(subject)) {
        subjectMap.set(subject, []);
      }
      subjectMap.set(subject, [...subjectMap.get(subject), unit]);

      // Analyze timing overlaps
      const monthKey = `${unit.startDate.getFullYear()}-${String(unit.startDate.getMonth() + 1).padStart(2, '0')}`;
      if (!timeOverlapMap.has(monthKey)) {
        timeOverlapMap.set(monthKey, []);
      }
      timeOverlapMap.get(monthKey).push({
        subject,
        title: unit.title,
        titleFr: unit.titleFr,
        startDate: unit.startDate,
        endDate: unit.endDate,
        keyVocabulary: unit.keyVocabulary,
        crossCurricularConnections: unit.crossCurricularConnections
      });

      // Extract vocabulary
      if (unit.keyVocabulary) {
        const vocab = JSON.parse(unit.keyVocabulary as string);
        vocab.forEach((word: string) => {
          if (!vocabularyMap.has(word.toLowerCase())) {
            vocabularyMap.set(word.toLowerCase(), []);
          }
          vocabularyMap.get(word.toLowerCase()).push({ subject, unit: unit.title });
        });
      }

      // Extract themes from titles and big ideas
      const themes = [unit.title, unit.titleFr, unit.bigIdeas, unit.bigIdeasFr]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      
      const commonThemes = ['family', 'famille', 'season', 'saison', 'community', 'communauté', 'environment', 'environnement', 'celebration', 'fête', 'numbers', 'nombres', 'nature', 'school', 'école'];
      
      commonThemes.forEach(theme => {
        if (themes.includes(theme)) {
          if (!themeMap.has(theme)) {
            themeMap.set(theme, []);
          }
          themeMap.get(theme).push({ subject, unit: unit.title, titleFr: unit.titleFr });
        }
      });
    });

    // Generate comprehensive analysis
    console.log('📊 CROSS-CURRICULAR CONNECTIONS ANALYSIS\n');
    console.log('='*60);
    
    // 1. Subject Overview
    console.log('\n1. SUBJECT OVERVIEW\n');
    subjectMap.forEach((units, subject) => {
      console.log(`${subject}: ${units.length} units`);
      units.forEach(unit => {
        console.log(`   • ${unit.title} (${unit.startDate.toISOString().slice(0, 10)} to ${unit.endDate.toISOString().slice(0, 10)})`);
      });
      console.log();
    });

    // 2. Timing Overlaps
    console.log('\n2. UNIT TIMING OVERLAPS BY MONTH\n');
    Array.from(timeOverlapMap.keys()).sort().forEach(month => {
      const units = timeOverlapMap.get(month);
      if (units.length > 1) {
        console.log(`📅 ${month}:`);
        units.forEach(unit => {
          console.log(`   ${unit.subject}: ${unit.title}`);
          if (unit.crossCurricularConnections) {
            console.log(`     Cross-curricular: ${unit.crossCurricularConnections.slice(0, 150)}...`);
          }
        });
        console.log();
      }
    });

    // 3. Shared Vocabulary
    console.log('\n3. SHARED VOCABULARY ACROSS SUBJECTS\n');
    const sharedVocab = Array.from(vocabularyMap.entries())
      .filter(([word, uses]) => uses.length > 1)
      .sort((a, b) => b[1].length - a[1].length);
    
    sharedVocab.slice(0, 20).forEach(([word, uses]) => {
      console.log(`📝 "${word}" appears in:`);
      uses.forEach(use => {
        console.log(`   • ${use.subject}: ${use.unit}`);
      });
      console.log();
    });

    // 4. Common Themes
    console.log('\n4. COMMON THEMES ACROSS SUBJECTS\n');
    Array.from(themeMap.entries())
      .filter(([theme, uses]) => uses.length > 1)
      .sort((a, b) => b[1].length - a[1].length)
      .forEach(([theme, uses]) => {
        console.log(`🎯 Theme: "${theme.toUpperCase()}" appears in:`);
        uses.forEach(use => {
          console.log(`   • ${use.subject}: ${use.unit}`);
        });
        console.log();
      });

    // 5. Explicit Cross-Curricular Connections
    console.log('\n5. EXPLICIT CROSS-CURRICULAR CONNECTIONS\n');
    unitPlans.forEach(unit => {
      if (unit.crossCurricularConnections) {
        console.log(`🔗 ${unit.longRangePlan.subject} - ${unit.title}:`);
        console.log(`   ${unit.crossCurricularConnections}\n`);
      }
    });

    console.log('\n✅ Analysis complete! Check the output above for comprehensive cross-curricular opportunities.');

  } catch (error) {
    console.error('Error analyzing cross-curricular connections:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeCrossCurricularConnections();