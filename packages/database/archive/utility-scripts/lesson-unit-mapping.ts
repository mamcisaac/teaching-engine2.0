#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapping of lesson seed files to current unit plans
const LESSON_TO_UNIT_MAPPING = {
  'Français (Immersion)': {
    currentUnits: [
      { id: 'cmebyc9dp0001vjr8fmooh70p', title: 'Bienvenue à l\'école!', start: '2025-09-04', end: '2025-09-17' },
      { id: 'cmebyc9dt0003vjr89qvjzg0k', title: 'Ma famille et moi', start: '2025-10-01', end: '2025-10-20' },
      { id: 'cmebyc9dv0005vjr8y5a7vxbp', title: 'Les fêtes d\'automne', start: '2025-11-03', end: '2025-11-20' },
      { id: 'cmebyc9dx0007vjr8res8mwma', title: 'L\'hiver magique', start: '2026-01-05', end: '2026-01-22' },
      { id: 'cmebyc9dx0009vjr8bsht2fp2', title: 'Nos amis les animaux', start: '2026-02-02', end: '2026-02-21' },
      { id: 'cmebyc9dz000bvjr8sqrc4svh', title: 'Ma communauté', start: '2026-03-02', end: '2026-03-20' },
      { id: 'cmebyc9e0000dvjr8j06kw9u9', title: 'Le printemps en fleurs', start: '2026-03-23', end: '2026-04-11' },
      { id: 'cmebyc9e2000fvjr8tayiwyam', title: 'Célébrons nos apprentissages', start: '2026-05-19', end: '2026-06-05' }
    ],
    lessonSeeds: [
      { file: 'seed-lesson-plans-bienvenue.ts', mapTo: 'Bienvenue à l\'école!', lessons: 13 },
      { file: 'seed-lesson-plans-french-october.ts', mapTo: 'Ma famille et moi', lessons: 20 },
      { file: 'seed-lesson-plans-french-november.ts', mapTo: 'Les fêtes d\'automne', lessons: 20 },
      { file: 'seed-lesson-plans-french-december.ts', mapTo: 'L\'hiver magique', lessons: 20 },
      { file: 'seed-french-lessons-january-june.ts', mapTo: 'multiple', lessons: 100 }
    ]
  },
  
  'Mathématiques': {
    currentUnits: [
      { id: 'cmebyc9ii0001vjrfkhn13dd1', title: 'Les nombres tout autour de nous', start: '2025-09-04', end: '2025-09-23' },
      { id: 'cmebyc9im0003vjrf4bfhlo1z', title: 'Comprendre les nombres', start: '2025-10-01', end: '2025-10-20' },
      { id: 'cmebyc9io0005vjrfypcwi41t', title: 'Régularités et formes', start: '2025-11-03', end: '2025-11-22' },
      { id: 'cmebyc9iq0007vjrfjbgwmvcv', title: 'Addition et soustraction', start: '2025-12-01', end: '2025-12-20' },
      { id: 'cmebyc9ir0009vjrf5bl8l49w', title: 'Stratégies de calcul mental', start: '2026-02-02', end: '2026-02-21' },
      { id: 'cmebyc9is000bvjrfmge2bn8k', title: 'Explorer la mesure', start: '2026-03-02', end: '2026-03-20' },
      { id: 'cmebyc9it000dvjrfyiqtwj9b', title: 'Aventures de résolution de problèmes', start: '2026-03-23', end: '2026-04-11' },
      { id: 'cmebyc9iu000fvjrfjz3ykc52', title: 'Célébration mathématique', start: '2026-05-11', end: '2026-05-25' }
    ],
    lessonSeeds: [
      { file: 'seed-lesson-plans-math-september.ts', mapTo: 'Les nombres tout autour de nous', lessons: 20 },
      { file: 'seed-lesson-plans-math-october.ts', mapTo: 'Comprendre les nombres', lessons: 20 },
      { file: 'seed-lesson-plans-math-november.ts', mapTo: 'Régularités et formes', lessons: 20 },
      { file: 'seed-lesson-plans-math-december.ts', mapTo: 'Addition et soustraction', lessons: 20 },
      { file: 'seed-lesson-plans-math-february.ts', mapTo: 'Stratégies de calcul mental', lessons: 20 },
      { file: 'seed-lesson-plans-math-march.ts', mapTo: 'Explorer la mesure', lessons: 20 },
      { file: 'seed-lesson-plans-math-april.ts', mapTo: 'Aventures de résolution de problèmes', lessons: 20 },
      { file: 'seed-lesson-plans-math-may.ts', mapTo: 'Célébration mathématique', lessons: 15 }
    ]
  },
  
  'Music': {
    currentUnits: [
      { id: 'cmec0i16s0007vjenvfs8bccr', title: 'Rhythm & Expression', start: '2025-11-10', end: '2025-12-08' },
      { id: 'cmec0i16t0009vjentg5pv2qr', title: 'Musical Stories', start: '2026-03-09', end: '2026-04-06' }
    ],
    lessonSeeds: [
      { file: 'seed-music-master-72-lessons.ts', mapTo: 'both', lessons: 72 },
      { file: 'seed-music-lessons-comprehensive-72.ts', mapTo: 'both', lessons: 72 }
    ]
  },
  
  'Éducation physique': {
    currentUnits: [
      { id: 'cmec0i16k0001vjenhzdno8m4', title: 'Mouvement et jeux', start: '2025-09-15', end: '2025-10-03' },
      { id: 'cmec0i16o0003vjenirx652j8', title: 'Activités et habiletés d\'hiver', start: '2026-01-12', end: '2026-01-30' },
      { id: 'cmec0i16q0005vjenqkwygszd', title: 'Sports printaniers et travail d\'équipe', start: '2026-04-13', end: '2026-05-01' }
    ],
    lessonSeeds: [
      { file: 'seed-pe-comprehensive-108-lessons.ts', mapTo: 'all', lessons: 108 },
      { file: 'seed-pe-lessons-sept-dec.ts', mapTo: 'Mouvement et jeux', lessons: 40 }
    ]
  }
};

async function createLessonUnitMapping() {
  console.log('🗺️ LESSON PLAN TO UNIT MAPPING');
  console.log('================================\n');
  
  // Verify current units exist
  for (const [subject, mapping] of Object.entries(LESSON_TO_UNIT_MAPPING)) {
    console.log(`\n📚 ${subject}`);
    console.log('=' .repeat(50));
    
    // Check each unit exists
    console.log('\nCurrent Units:');
    for (const unit of mapping.currentUnits) {
      const exists = await prisma.unitPlan.findUnique({
        where: { id: unit.id }
      });
      
      const status = exists ? '✅' : '❌';
      console.log(`  ${status} ${unit.title}`);
      console.log(`     ${unit.start} to ${unit.end}`);
    }
    
    // Show lesson seed mappings
    console.log('\nLesson Seeds → Unit Mappings:');
    for (const seed of mapping.lessonSeeds) {
      console.log(`  📄 ${seed.file}`);
      console.log(`     → ${seed.mapTo} (${seed.lessons} lessons)`);
    }
    
    // Calculate totals
    const totalLessons = mapping.lessonSeeds.reduce((sum, s) => sum + s.lessons, 0);
    const totalDays = mapping.currentUnits.reduce((sum, u) => {
      const days = Math.ceil((new Date(u.end).getTime() - new Date(u.start).getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total units: ${mapping.currentUnits.length}`);
    console.log(`   Total days: ${totalDays}`);
    console.log(`   Total lessons available: ${totalLessons}`);
    console.log(`   Lessons per day: ${(totalLessons / totalDays).toFixed(1)}`);
  }
  
  // Save mapping to JSON
  const mappingData = {
    generated: new Date().toISOString(),
    subjects: LESSON_TO_UNIT_MAPPING,
    summary: {
      totalSubjects: Object.keys(LESSON_TO_UNIT_MAPPING).length,
      totalUnits: Object.values(LESSON_TO_UNIT_MAPPING).reduce((sum, m) => sum + m.currentUnits.length, 0),
      totalLessonFiles: Object.values(LESSON_TO_UNIT_MAPPING).reduce((sum, m) => sum + m.lessonSeeds.length, 0),
      estimatedTotalLessons: Object.values(LESSON_TO_UNIT_MAPPING).reduce(
        (sum, m) => sum + m.lessonSeeds.reduce((s, seed) => s + seed.lessons, 0), 0
      )
    }
  };
  
  const fs = require('fs');
  const path = require('path');
  const mappingPath = path.join(__dirname, 'lesson-unit-mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(mappingData, null, 2));
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 MAPPING SUMMARY');
  console.log('='.repeat(60));
  console.log(`Subjects mapped: ${mappingData.summary.totalSubjects}`);
  console.log(`Total units: ${mappingData.summary.totalUnits}`);
  console.log(`Lesson seed files: ${mappingData.summary.totalLessonFiles}`);
  console.log(`Estimated total lessons: ${mappingData.summary.estimatedTotalLessons}`);
  console.log(`\n✅ Mapping saved to: ${mappingPath}`);
  
  await prisma.$disconnect();
}

// Run the mapping
createLessonUnitMapping()
  .then(() => console.log('\n✅ Lesson-unit mapping complete!'))
  .catch(error => {
    console.error('❌ Error creating mapping:', error);
    process.exit(1);
  });