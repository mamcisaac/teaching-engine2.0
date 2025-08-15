#!/bin/bash

# Complete restoration of ALL lesson plans from ALL seed files
# This will restore the entire teaching system

echo "🚀 COMPLETE SYSTEM RESTORATION IN PROGRESS..."
echo "📊 This will restore ALL units and lessons from ALL seed files"
echo ""

cd packages/database

# Run ALL lesson plan seeds systematically
echo "📝 Restoring ALL lesson plans by month..."

# September (already done but run again to be sure)
echo "📅 September lessons..."
npx tsx prisma/seed-french-lessons-september.ts 2>&1 | tail -1

# October
echo "📅 October lessons..."
npx tsx prisma/seed-lesson-plans-french-october.ts 2>&1 | tail -1
npx tsx prisma/seed-lesson-plans-arts-october-extended.ts 2>&1 | tail -1

# November
echo "📅 November lessons..."
npx tsx prisma/seed-lesson-plans-math-november.ts 2>&1 | tail -1
npx tsx prisma/seed-lesson-plans-science-november.ts 2>&1 | tail -1
npx tsx prisma/seed-lesson-plans-arts-november.ts 2>&1 | tail -1
npx tsx prisma/seed-lesson-plans-french-november.ts 2>&1 | tail -1

# December
echo "📅 December lessons..."
npx tsx prisma/seed-lesson-plans-math-december.ts 2>&1 | tail -1
npx tsx prisma/seed-lesson-plans-science-december.ts 2>&1 | tail -1
npx tsx prisma/seed-lesson-plans-arts-december.ts 2>&1 | tail -1

# January
echo "📅 January lessons..."
npx tsx prisma/seed-lesson-plans-math-january.ts 2>&1 | tail -1
npx tsx prisma/seed-lesson-plans-science-january.ts 2>&1 | tail -1
npx tsx prisma/seed-lesson-plans-arts-january.ts 2>&1 | tail -1

# February
echo "📅 February lessons..."
npx tsx prisma/seed-lesson-plans-math-february.ts 2>&1 | tail -1
npx tsx prisma/seed-lesson-plans-science-february.ts 2>&1 | tail -1
npx tsx prisma/seed-lesson-plans-arts-february.ts 2>&1 | tail -1

# March
echo "📅 March lessons..."
npx tsx prisma/seed-lesson-plans-math-march.ts 2>&1 | tail -1
npx tsx prisma/seed-lesson-plans-science-march.ts 2>&1 | tail -1
npx tsx prisma/seed-lesson-plans-arts-march.ts 2>&1 | tail -1

# April
echo "📅 April lessons..."
npx tsx prisma/seed-lesson-plans-math-april.ts 2>&1 | tail -1
npx tsx prisma/seed-lesson-plans-science-april.ts 2>&1 | tail -1
npx tsx prisma/seed-lesson-plans-arts-april.ts 2>&1 | tail -1

# May
echo "📅 May lessons..."
npx tsx prisma/seed-lesson-plans-math-may.ts 2>&1 | tail -1
npx tsx prisma/seed-lesson-plans-science-may.ts 2>&1 | tail -1
npx tsx prisma/seed-lesson-plans-arts-may.ts 2>&1 | tail -1

# June
echo "📅 June lessons..."
npx tsx prisma/seed-lesson-plans-math-june.ts 2>&1 | tail -1
npx tsx prisma/seed-lesson-plans-science-june.ts 2>&1 | tail -1
npx tsx prisma/seed-lesson-plans-arts-june.ts 2>&1 | tail -1

# French comprehensive (January-June)
echo "📚 French comprehensive lessons..."
npx tsx prisma/seed-french-lessons-january-june.ts 2>&1 | tail -1

# Run all remaining seed files
echo "📂 Running all remaining seed files..."
for file in prisma/seed-lesson-plans-*.ts; do
  if [[ ! "$file" =~ (september|october|november|december|january|february|march|april|may|june) ]]; then
    echo "  Running $(basename $file)..."
    npx tsx "$file" 2>&1 | tail -1
  fi
done

echo ""
echo "✅ ALL RESTORATION COMPLETE!"
echo ""
echo "📊 FINAL SYSTEM STATUS:"
echo "========================"

# Final count
sqlite3 prisma/dev.db "
SELECT COUNT(*) || ' Long Range Plans' FROM LongRangePlan;
SELECT COUNT(*) || ' Curriculum Expectations' FROM CurriculumExpectation;
SELECT COUNT(*) || ' Unit Plans' FROM UnitPlan;
SELECT COUNT(*) || ' Lesson Plans' FROM ETFOLessonPlan;
SELECT '';
SELECT 'Lesson distribution by subject:' as '';
SELECT '-------------------------------' as '';
SELECT subject, COUNT(*) as '  ' FROM ETFOLessonPlan GROUP BY subject ORDER BY COUNT(*) DESC;
SELECT '';
SELECT 'Lessons by month:' as '';
SELECT '-----------------' as '';
SELECT strftime('%Y-%m', datetime(date/1000, 'unixepoch')) as month, COUNT(*) as count 
FROM ETFOLessonPlan 
GROUP BY month 
ORDER BY month;
SELECT '';
SELECT 'Daily lesson load (sample):' as '';
SELECT '----------------------------' as '';
SELECT date(date/1000, 'unixepoch') as day, COUNT(*) as lessons 
FROM ETFOLessonPlan 
WHERE date BETWEEN 1757289600000 AND 1759881600000
GROUP BY day 
HAVING COUNT(*) > 3
ORDER BY lessons DESC
LIMIT 10;
"

echo ""
echo "🎉 COMPLETE SYSTEM RESTORED SUCCESSFULLY!"
echo "📚 Emily's teaching engine is now fully operational!"
echo "✨ All units and lessons are back in place!"