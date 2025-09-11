#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

// Use the correct database path
const databaseUrl = `file:${path.resolve(process.cwd(), 'prisma/prisma/dev.db')}`;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

interface ExpectationMatch {
  lessonId: string;
  expectationId: string;
  rationale: string;
}

async function applyExpectationMatches() {
  console.log('📚 APPLYING CURRICULUM EXPECTATION MATCHES\n');
  
  // Read the matches file
  const matchesPath = path.join(process.cwd(), 'expectation-matches.json');
  if (!fs.existsSync(matchesPath)) {
    throw new Error('expectation-matches.json not found. Run link-expectations-intelligently.ts first.');
  }
  
  const matches: ExpectationMatch[] = JSON.parse(fs.readFileSync(matchesPath, 'utf-8'));
  console.log(`📊 Found ${matches.length} expectation matches to apply\n`);
  
  // Group by lesson for efficient processing
  const matchesByLesson = new Map<string, ExpectationMatch[]>();
  for (const match of matches) {
    if (!matchesByLesson.has(match.lessonId)) {
      matchesByLesson.set(match.lessonId, []);
    }
    matchesByLesson.get(match.lessonId)!.push(match);
  }
  
  console.log(`📝 Processing ${matchesByLesson.size} lessons...\n`);
  
  let successCount = 0;
  let errorCount = 0;
  let duplicateCount = 0;
  
  // Process each lesson
  for (const [lessonId, lessonMatches] of matchesByLesson) {
    try {
      // Check existing expectations
      const existing = await prisma.eTFOLessonPlanExpectation.findMany({
        where: { lessonPlanId: lessonId },
        select: { expectationId: true }
      });
      
      const existingIds = new Set(existing.map(e => e.expectationId));
      
      // Filter out duplicates
      const newMatches = lessonMatches.filter(m => !existingIds.has(m.expectationId));
      
      if (newMatches.length === 0) {
        duplicateCount += lessonMatches.length;
        continue;
      }
      
      // Create new expectation links
      await prisma.eTFOLessonPlanExpectation.createMany({
        data: newMatches.map(match => ({
          lessonPlanId: match.lessonId,
          expectationId: match.expectationId
        }))
      });
      
      successCount += newMatches.length;
      duplicateCount += lessonMatches.length - newMatches.length;
      
      // Progress indicator
      if (successCount % 50 === 0) {
        console.log(`  ✅ Applied ${successCount} matches...`);
      }
      
    } catch (error: any) {
      console.error(`  ❌ Error processing lesson ${lessonId}: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log('\n📊 RESULTS SUMMARY:');
  console.log(`  ✅ Successfully applied: ${successCount} matches`);
  console.log(`  ⏭️  Skipped duplicates: ${duplicateCount} matches`);
  console.log(`  ❌ Errors: ${errorCount} lessons`);
  
  // Verify final coverage
  console.log('\n🔍 Verifying final coverage...\n');
  
  const coverageStats = await prisma.$queryRaw`
    SELECT 
      l.subject,
      COUNT(DISTINCT e.id) as total_lessons,
      COUNT(DISTINCT CASE WHEN lpe.lessonPlanId IS NOT NULL THEN e.id END) as lessons_with_expectations,
      ROUND(COUNT(DISTINCT CASE WHEN lpe.lessonPlanId IS NOT NULL THEN e.id END) * 100.0 / COUNT(DISTINCT e.id), 1) as coverage_percentage
    FROM ETFOLessonPlan e
    JOIN UnitPlan u ON e.unitPlanId = u.id
    JOIN LongRangePlan l ON u.longRangePlanId = l.id
    LEFT JOIN ETFOLessonPlanExpectation lpe ON e.id = lpe.lessonPlanId
    GROUP BY l.subject
    ORDER BY l.subject;
  ` as any[];
  
  console.log('📈 Coverage by Subject:');
  for (const stat of coverageStats) {
    const emoji = stat.coverage_percentage === 100 ? '✅' : '⚠️';
    console.log(`  ${emoji} ${stat.subject}: ${stat.coverage_percentage}% (${stat.lessons_with_expectations}/${stat.total_lessons} lessons)`);
  }
  
  // Overall coverage
  const overall = await prisma.$queryRaw`
    SELECT 
      COUNT(DISTINCT e.id) as total_lessons,
      COUNT(DISTINCT CASE WHEN lpe.lessonPlanId IS NOT NULL THEN e.id END) as lessons_with_expectations,
      ROUND(COUNT(DISTINCT CASE WHEN lpe.lessonPlanId IS NOT NULL THEN e.id END) * 100.0 / COUNT(DISTINCT e.id), 1) as coverage_percentage
    FROM ETFOLessonPlan e
    LEFT JOIN ETFOLessonPlanExpectation lpe ON e.id = lpe.lessonPlanId;
  ` as any[];
  
  console.log(`\n🎯 OVERALL COVERAGE: ${overall[0].coverage_percentage}% (${overall[0].lessons_with_expectations}/${overall[0].total_lessons} lessons)`);
  
  if (overall[0].coverage_percentage === 100) {
    console.log('\n🎉 PERFECT! All lessons now have curriculum expectations linked!');
  }
  
  await prisma.$disconnect();
}

applyExpectationMatches()
  .then(() => {
    console.log('\n✅ Application complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Application failed:', error);
    process.exit(1);
  });