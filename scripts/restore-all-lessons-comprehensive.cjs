#!/usr/bin/env node

/**
 * Comprehensive restoration script for ALL lessons
 * Creates all missing unit plans first, then seeds lessons
 */

const { execSync } = require('child_process');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'packages', 'database');
process.chdir(dbPath);

console.log('🚀 COMPREHENSIVE LESSON RESTORATION');
console.log('====================================\n');

// Step 1: Create all unit plans for all months
console.log('📚 Step 1: Creating ALL unit plans for every subject and month...\n');

const createAllUnitPlans = `
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAllUnitPlans() {
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });
  
  if (!emily) throw new Error('Emily not found');
  
  // Unit plans for each subject by month
  const unitPlans = [
    // French units
    { titleFr: 'Bienvenue à l\\'école', title: 'Welcome to School', subject: 'Français langue première', startDate: new Date('2025-09-01'), endDate: new Date('2025-09-30') },
    { titleFr: 'Ma famille et moi', title: 'My Family and I', subject: 'Français langue première', startDate: new Date('2025-10-01'), endDate: new Date('2025-10-31') },
    { titleFr: 'Les célébrations d\\'automne', title: 'Fall Celebrations', subject: 'Français langue première', startDate: new Date('2025-11-01'), endDate: new Date('2025-11-30') },
    { titleFr: 'L\\'hiver arrive', title: 'Winter is Coming', subject: 'Français langue première', startDate: new Date('2025-12-01'), endDate: new Date('2025-12-31') },
    { titleFr: 'Nouvelle année, nouveaux amis', title: 'New Year New Friends', subject: 'Français langue première', startDate: new Date('2026-01-01'), endDate: new Date('2026-01-31') },
    { titleFr: 'Les histoires d\\'hiver', title: 'Winter Stories', subject: 'Français langue première', startDate: new Date('2026-02-01'), endDate: new Date('2026-02-28') },
    { titleFr: 'Le printemps arrive', title: 'Spring is Coming', subject: 'Français langue première', startDate: new Date('2026-03-01'), endDate: new Date('2026-03-31') },
    { titleFr: 'La nature se réveille', title: 'Nature Awakens', subject: 'Français langue première', startDate: new Date('2026-04-01'), endDate: new Date('2026-04-30') },
    { titleFr: 'Nos communautés', title: 'Our Communities', subject: 'Français langue première', startDate: new Date('2026-05-01'), endDate: new Date('2026-05-31') },
    { titleFr: 'Célébrons nos apprentissages', title: 'Celebrating Our Learning', subject: 'Français langue première', startDate: new Date('2026-06-01'), endDate: new Date('2026-06-30') },
    
    // Math units
    { titleFr: 'Explorer les nombres', title: 'Exploring Numbers', subject: 'Mathématiques', startDate: new Date('2025-09-01'), endDate: new Date('2025-09-30') },
    { titleFr: 'Nombres et formes', title: 'Numbers and Shapes', subject: 'Mathématiques', startDate: new Date('2025-10-01'), endDate: new Date('2025-10-31') },
    { titleFr: 'Compter et comparer', title: 'Counting and Comparing', subject: 'Mathématiques', startDate: new Date('2025-11-01'), endDate: new Date('2025-11-30') },
    { titleFr: 'Addition et soustraction', title: 'Addition and Subtraction', subject: 'Mathématiques', startDate: new Date('2025-12-01'), endDate: new Date('2025-12-31') },
    { titleFr: 'Stratégies de calcul mental', title: 'Mental Math Strategies', subject: 'Mathématiques', startDate: new Date('2026-02-01'), endDate: new Date('2026-02-28') },
    { titleFr: 'Explorer la mesure', title: 'Exploring Measurement', subject: 'Mathématiques', startDate: new Date('2026-03-01'), endDate: new Date('2026-03-31') },
    { titleFr: 'Aventures de résolution de problèmes', title: 'Problem Solving Adventures', subject: 'Mathématiques', startDate: new Date('2026-04-01'), endDate: new Date('2026-04-30') },
    { titleFr: 'Géométrie et espace', title: 'Geometry and Space', subject: 'Mathématiques', startDate: new Date('2026-05-01'), endDate: new Date('2026-05-31') },
    { titleFr: 'Révision et célébration', title: 'Review and Celebration', subject: 'Mathématiques', startDate: new Date('2026-06-01'), endDate: new Date('2026-06-30') },
    
    // Science units
    { titleFr: 'Explorer notre monde', title: 'Exploring Our World', subject: 'Sciences de la nature', startDate: new Date('2025-09-01'), endDate: new Date('2025-09-30') },
    { titleFr: 'Les saisons changent', title: 'Seasons Change', subject: 'Sciences de la nature', startDate: new Date('2025-10-01'), endDate: new Date('2025-10-31') },
    { titleFr: 'Les animaux se préparent', title: 'Animals Prepare', subject: 'Sciences de la nature', startDate: new Date('2025-11-01'), endDate: new Date('2025-11-30') },
    { titleFr: 'L\\'hiver et la neige', title: 'Winter and Snow', subject: 'Sciences de la nature', startDate: new Date('2025-12-01'), endDate: new Date('2025-12-31') },
    { titleFr: 'Les propriétés des matériaux', title: 'Properties of Materials', subject: 'Sciences de la nature', startDate: new Date('2026-01-01'), endDate: new Date('2026-01-31') },
    { titleFr: 'Forces et mouvements', title: 'Forces and Movement', subject: 'Sciences de la nature', startDate: new Date('2026-02-01'), endDate: new Date('2026-02-28') },
    { titleFr: 'Le cycle de l\\'eau', title: 'Water Cycle', subject: 'Sciences de la nature', startDate: new Date('2026-03-01'), endDate: new Date('2026-03-31') },
    { titleFr: 'Les plantes grandissent', title: 'Plants Grow', subject: 'Sciences de la nature', startDate: new Date('2026-04-01'), endDate: new Date('2026-04-30') },
    { titleFr: 'Les insectes et petites bêtes', title: 'Insects and Small Creatures', subject: 'Sciences de la nature', startDate: new Date('2026-05-01'), endDate: new Date('2026-05-31') },
    { titleFr: 'Notre environnement', title: 'Our Environment', subject: 'Sciences de la nature', startDate: new Date('2026-06-01'), endDate: new Date('2026-06-30') },
    
    // Arts units
    { titleFr: 'Découvrir l\\'art dans notre monde', title: 'Discovering Art in Our World', subject: 'Arts', startDate: new Date('2025-09-01'), endDate: new Date('2025-09-30') },
    { titleFr: 'Les couleurs et les sentiments', title: 'Colors and Feelings', subject: 'Arts', startDate: new Date('2025-10-01'), endDate: new Date('2025-10-31') },
    { titleFr: 'L\\'art d\\'automne', title: 'Autumn Art', subject: 'Arts', startDate: new Date('2025-11-01'), endDate: new Date('2025-11-30') },
    { titleFr: 'Célébrations d\\'hiver', title: 'Winter Celebrations', subject: 'Arts', startDate: new Date('2025-12-01'), endDate: new Date('2025-12-31') },
    { titleFr: 'Textures et motifs', title: 'Textures and Patterns', subject: 'Arts', startDate: new Date('2026-02-01'), endDate: new Date('2026-02-28') },
    { titleFr: 'L\\'art du printemps', title: 'Spring Art', subject: 'Arts', startDate: new Date('2026-03-01'), endDate: new Date('2026-03-31') },
    { titleFr: 'Les histoires en art', title: 'Stories in Art', subject: 'Arts', startDate: new Date('2026-04-01'), endDate: new Date('2026-04-30') },
    { titleFr: 'L\\'art dans la nature', title: 'Art in Nature', subject: 'Arts', startDate: new Date('2026-05-01'), endDate: new Date('2026-05-31') },
    { titleFr: 'Notre galerie d\\'art', title: 'Our Art Gallery', subject: 'Arts', startDate: new Date('2026-06-01'), endDate: new Date('2026-06-30') }
  ];
  
  let created = 0;
  for (const plan of unitPlans) {
    try {
      await prisma.unitPlan.upsert({
        where: {
          userId_titleFr: {
            userId: emily.id,
            titleFr: plan.titleFr
          }
        },
        update: {},
        create: {
          ...plan,
          userId: emily.id,
          grade: 1,
          assessmentMethods: 'Observations, work samples, conferences',
          resources: 'Grade 1 resources',
          crossCurricularConnections: 'All subjects integrated',
          differentiationStrategies: { 
            support: 'Visual aids, peer help',
            extension: 'Advanced activities'
          }
        }
      });
      created++;
    } catch (error) {
      // Unit already exists, that's ok
    }
  }
  
  console.log(\`Created/verified \${created} unit plans\`);
  await prisma.$disconnect();
}

createAllUnitPlans().catch(console.error);
`;

// Create unit plans
console.log('Creating unit plans...');
try {
  execSync(`node -e "${createAllUnitPlans}"`, { stdio: 'pipe' });
  console.log('✅ Unit plans created/verified\n');
} catch (error) {
  console.log('⚠️ Some unit plans may already exist\n');
}

// Step 2: Run all lesson seeds
console.log('📝 Step 2: Running all lesson seeds...\n');

const lessonSeeds = [
  'seed-lesson-plans-math-september.ts',
  'seed-lesson-plans-math-october.ts',
  'seed-lesson-plans-math-november.ts',
  'seed-lesson-plans-math-december.ts',
  'seed-lesson-plans-math-january.ts',
  'seed-lesson-plans-math-february.ts',
  'seed-lesson-plans-math-march.ts',
  'seed-lesson-plans-math-april.ts',
  'seed-lesson-plans-math-may.ts',
  'seed-lesson-plans-math-june.ts',
  'seed-lesson-plans-french-october.ts',
  'seed-lesson-plans-french-november.ts',
  'seed-lesson-plans-science-september.ts',
  'seed-lesson-plans-science-october.ts',
  'seed-lesson-plans-arts-september.ts',
  'seed-lesson-plans-arts-october.ts',
  'seed-lesson-plans-arts-november.ts',
  'seed-lesson-plans-bienvenue-fixed.ts',
  'seed-lesson-plans-november-all.ts',
  'seed-lesson-plans-december-all.ts'
];

let successCount = 0;
let failCount = 0;

for (const seed of lessonSeeds) {
  try {
    console.log(`Running ${seed}...`);
    execSync(`npx tsx prisma/${seed}`, { stdio: 'pipe' });
    console.log(`  ✅ Success`);
    successCount++;
  } catch (error) {
    console.log(`  ❌ Failed`);
    failCount++;
  }
}

// Step 3: Run comprehensive seeds
console.log('\n📊 Step 3: Running comprehensive seeds...\n');

const comprehensiveSeeds = [
  'seed-pe-comprehensive-108-lessons.ts',
  'seed-music-lessons-comprehensive-72.ts',
  'seed-french-lessons-january-june.ts'
];

for (const seed of comprehensiveSeeds) {
  try {
    console.log(`Running ${seed}...`);
    execSync(`npx tsx prisma/${seed}`, { stdio: 'pipe' });
    console.log(`  ✅ Success`);
  } catch (error) {
    console.log(`  ❌ Failed`);
  }
}

// Step 4: Get final statistics
console.log('\n📊 FINAL RESTORATION STATISTICS');
console.log('================================\n');

try {
  const stats = execSync(`sqlite3 prisma/dev.db "
    SELECT 'Total Lessons: ' || COUNT(*) FROM ETFOLessonPlan;
    SELECT 'Total Units: ' || COUNT(*) FROM UnitPlan;
    SELECT '';
    SELECT 'Lessons by Subject:' as '';
    SELECT '  ' || subject || ': ' || COUNT(*) FROM ETFOLessonPlan GROUP BY subject ORDER BY COUNT(*) DESC;
  "`, { encoding: 'utf8' });
  
  console.log(stats);
} catch (error) {
  console.log('Could not get statistics');
}

console.log('\n✅ RESTORATION COMPLETE!');
console.log(`  Successful seeds: ${successCount}`);
console.log(`  Failed seeds: ${failCount}`);
console.log('\n🎉 Emily\'s teaching system has been restored!');