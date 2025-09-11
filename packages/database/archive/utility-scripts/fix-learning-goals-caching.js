#!/usr/bin/env node

/**
 * FIX FOR LEARNING GOALS CACHING ISSUE
 * 
 * Problem Identified:
 * 1. Database has correct learning objectives ✅
 * 2. Server's toLessonView() function includes learningGoals field ✅  
 * 3. Client's localStorage cache persists old "Développer les compétences" ❌
 * 
 * Root Cause:
 * The Zustand store with persist middleware (lessonPlanStore.ts line 415) 
 * caches data indefinitely in localStorage under key 'lesson-plan-storage'
 * 
 * Solution:
 * Force cache invalidation by:
 * 1. Clearing browser localStorage
 * 2. Forcing a version bump in the store name
 * 3. Adding cache expiry logic
 */

console.log(`
🔧 IMMEDIATE FIX - Run this in browser console:
================================================

localStorage.removeItem('lesson-plan-storage');
localStorage.removeItem('lesson-plans-cache');
localStorage.removeItem('lesson-plans-all-all');
location.reload();

================================================

📊 DATABASE CHECK - Verify objectives are correct:
`);

const { PrismaClient } = require('@prisma/client');
const path = require('path');

const databaseUrl = `file:${path.resolve(__dirname, 'prisma/prisma/dev.db')}`;
const prisma = new PrismaClient({
  datasources: {
    db: { url: databaseUrl }
  }
});

async function checkDatabase() {
  // Check a sample lesson
  const lesson = await prisma.eTFOLessonPlan.findFirst({
    where: { id: 'cmf43u3t5006xvj9tcs0fj7y4' }
  });
  
  console.log('Sample lesson from DB:');
  console.log(`  Title: ${lesson.title}`);
  console.log(`  Learning Goals: ${lesson.learningGoals}`);
  
  // Check how many still have generic objectives
  const genericCount = await prisma.eTFOLessonPlan.count({
    where: { learningGoals: 'Développer les compétences' }
  });
  
  const totalCount = await prisma.eTFOLessonPlan.count();
  
  console.log(`\n📈 Statistics:`);
  console.log(`  Total lessons: ${totalCount}`);
  console.log(`  With generic objectives: ${genericCount}`);
  console.log(`  With specific objectives: ${totalCount - genericCount}`);
  
  if (genericCount === 0) {
    console.log('\n✅ DATABASE IS CORRECT - All lessons have specific objectives!');
    console.log('❌ PROBLEM: Client cache is stale. Clear localStorage as shown above.');
  } else {
    console.log('\n⚠️ Some lessons still have generic objectives in database');
  }
  
  await prisma.$disconnect();
}

checkDatabase().catch(console.error);