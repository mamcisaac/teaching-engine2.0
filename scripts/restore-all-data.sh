#!/bin/bash

# Restore ALL unit plans and lesson plans from existing seed files
# This will recreate the complete system that was accidentally deleted

echo "🚀 Starting complete data restoration..."
echo "📊 This will restore all units and lessons from seed files"

cd packages/database

# First, run the base seeds
echo "📚 Step 1: Base setup (users, curriculum, long range plans)..."
npx tsx prisma/seed.ts
npx tsx prisma/seed-grade1-curriculum.ts
npx tsx prisma/seed-long-range-plans.ts

# Seed all unit plans
echo "📖 Step 2: Restoring all unit plans..."
npx tsx prisma/seed-unit-plans-francais.ts
npx tsx prisma/seed-unit-plans-mathematiques.ts
npx tsx prisma/seed-unit-plans-sciences.ts
npx tsx prisma/seed-unit-plans-sciences-humaines.ts
npx tsx prisma/seed-unit-plans-arts-visuels.ts
npx tsx prisma/seed-unit-plans-education-physique.ts
npx tsx prisma/seed-unit-plans-formation-personnelle-sociale.ts
npx tsx prisma/seed-unit-plans-music.ts

# Seed all lesson plans (37 files)
echo "📝 Step 3: Restoring all lesson plans..."
echo "  September lessons..."
npx tsx prisma/seed-lesson-plans-math-september.ts
npx tsx prisma/seed-lesson-plans-science-september.ts
npx tsx prisma/seed-lesson-plans-arts-september.ts
npx tsx prisma/seed-french-lessons-september.ts

echo "  October lessons..."
npx tsx prisma/seed-lesson-plans-math-october.ts
npx tsx prisma/seed-lesson-plans-science-october.ts
npx tsx prisma/seed-lesson-plans-arts-october.ts
npx tsx prisma/seed-lesson-plans-arts-october-extended.ts
npx tsx prisma/seed-lesson-plans-french-october.ts

echo "  November lessons..."
npx tsx prisma/seed-lesson-plans-math-november.ts
npx tsx prisma/seed-lesson-plans-science-november.ts
npx tsx prisma/seed-lesson-plans-arts-november.ts
npx tsx prisma/seed-lesson-plans-french-november.ts

echo "  December lessons..."
npx tsx prisma/seed-lesson-plans-math-december.ts
npx tsx prisma/seed-lesson-plans-science-december.ts
npx tsx prisma/seed-lesson-plans-arts-december.ts

echo "  January lessons..."
npx tsx prisma/seed-lesson-plans-math-january.ts
npx tsx prisma/seed-lesson-plans-science-january.ts
npx tsx prisma/seed-lesson-plans-arts-january.ts

echo "  February lessons..."
npx tsx prisma/seed-lesson-plans-math-february.ts
npx tsx prisma/seed-lesson-plans-science-february.ts
npx tsx prisma/seed-lesson-plans-arts-february.ts

echo "  March lessons..."
npx tsx prisma/seed-lesson-plans-math-march.ts
npx tsx prisma/seed-lesson-plans-science-march.ts
npx tsx prisma/seed-lesson-plans-arts-march.ts

echo "  April lessons..."
npx tsx prisma/seed-lesson-plans-math-april.ts
npx tsx prisma/seed-lesson-plans-science-april.ts
npx tsx prisma/seed-lesson-plans-arts-april.ts

echo "  May lessons..."
npx tsx prisma/seed-lesson-plans-math-may.ts
npx tsx prisma/seed-lesson-plans-science-may.ts
npx tsx prisma/seed-lesson-plans-arts-may.ts

echo "  June lessons..."
npx tsx prisma/seed-lesson-plans-math-june.ts
npx tsx prisma/seed-lesson-plans-science-june.ts
npx tsx prisma/seed-lesson-plans-arts-june.ts

# Additional comprehensive seeds
echo "  Additional comprehensive lessons..."
npx tsx prisma/seed-health-fps-comprehensive-36-lessons.ts
npx tsx prisma/seed-music-lessons-comprehensive-72.ts
npx tsx prisma/seed-pe-comprehensive-108-lessons.ts
npx tsx prisma/seed-french-lessons-january-june.ts

echo "✅ Data restoration complete!"
echo "📊 Checking restored data..."

# Count what was restored
sqlite3 prisma/dev.db "
SELECT 'Summary of restored data:' as '';
SELECT '------------------------' as '';
SELECT COUNT(*) || ' Long Range Plans' FROM LongRangePlan;
SELECT COUNT(*) || ' Curriculum Expectations' FROM CurriculumExpectation;
SELECT COUNT(*) || ' Unit Plans' FROM UnitPlan;
SELECT COUNT(*) || ' Lesson Plans' FROM ETFOLessonPlan;
SELECT '';
SELECT 'Lesson distribution by subject:' as '';
SELECT subject, COUNT(*) as count FROM ETFOLessonPlan GROUP BY subject ORDER BY count DESC;
"

echo "🎉 All data has been restored from seed files!"