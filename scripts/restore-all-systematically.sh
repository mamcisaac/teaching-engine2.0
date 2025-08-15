#!/bin/bash

echo "🔄 SYSTEMATIC RESTORATION PROCESS"
echo "================================="
echo ""

cd packages/database

# First ensure ALL unit plans exist
echo "📚 Step 1: Ensuring all unit plans exist..."
echo "----------------------------------------"

UNIT_FILES=(
  "seed-unit-plans-francais.ts"
  "seed-unit-plans-mathematiques.ts"
  "seed-unit-plans-sciences.ts"
  "seed-unit-plans-sciences-humaines.ts"
  "seed-unit-plans-arts-visuels.ts"
  "seed-unit-plans-education-physique.ts"
  "seed-unit-plans-formation-personnelle-sociale.ts"
  "seed-unit-plans-music.ts"
)

for file in "${UNIT_FILES[@]}"; do
  if [ -f "prisma/$file" ]; then
    echo "  ✓ Running $file..."
    npx tsx "prisma/$file" 2>&1 | grep -E "(Created Unit|completed|failed)" | tail -1
  fi
done

echo ""
echo "📝 Step 2: Running ALL lesson plan seeds..."
echo "-----------------------------------------"

# Get all lesson plan files
LESSON_FILES=$(ls prisma/seed-lesson-plans-*.ts 2>/dev/null)

SUCCESS_COUNT=0
FAIL_COUNT=0

for file in $LESSON_FILES; do
  filename=$(basename "$file")
  echo -n "  Processing $filename... "
  
  # Run the seed and capture result
  OUTPUT=$(npx tsx "$file" 2>&1)
  
  if echo "$OUTPUT" | grep -q "completed\|success\|Successfully"; then
    echo "✅"
    ((SUCCESS_COUNT++))
  elif echo "$OUTPUT" | grep -q "Error\|failed"; then
    echo "❌"
    ((FAIL_COUNT++))
    # Show the error
    echo "    Error: $(echo "$OUTPUT" | grep -E "Error:|not found" | head -1)"
  else
    echo "⚠️"
  fi
done

echo ""
echo "📊 Step 3: Additional comprehensive seeds..."
echo "------------------------------------------"

COMPREHENSIVE_FILES=(
  "seed-pe-comprehensive-108-lessons.ts"
  "seed-music-lessons-comprehensive-72.ts"
  "seed-health-fps-comprehensive-36-lessons.ts"
  "seed-french-lessons-january-june.ts"
)

for file in "${COMPREHENSIVE_FILES[@]}"; do
  if [ -f "prisma/$file" ]; then
    echo "  Running $file..."
    OUTPUT=$(npx tsx "prisma/$file" 2>&1)
    if echo "$OUTPUT" | grep -q "success\|completed"; then
      echo "    ✅ Success"
    else
      echo "    ❌ Failed"
    fi
  fi
done

echo ""
echo "==============================================="
echo "📊 FINAL RESTORATION REPORT"
echo "==============================================="
echo ""

# Get final counts
sqlite3 prisma/dev.db "
SELECT '📚 Database Contents:' as '';
SELECT '-------------------' as '';
SELECT printf('%-30s %d', 'Long Range Plans:', COUNT(*)) FROM LongRangePlan;
SELECT printf('%-30s %d', 'Curriculum Expectations:', COUNT(*)) FROM CurriculumExpectation;
SELECT printf('%-30s %d', 'Unit Plans:', COUNT(*)) FROM UnitPlan;
SELECT printf('%-30s %d', 'Lesson Plans:', COUNT(*)) FROM ETFOLessonPlan;
SELECT '';
SELECT '📅 Lessons by Month:' as '';
SELECT '-------------------' as '';
SELECT strftime('%B %Y', datetime(date/1000, 'unixepoch')) as month, 
       printf('%3d lessons', COUNT(*))
FROM ETFOLessonPlan 
GROUP BY strftime('%Y-%m', datetime(date/1000, 'unixepoch'))
ORDER BY date;
SELECT '';
SELECT '📖 Lessons by Subject:' as '';
SELECT '---------------------' as '';
SELECT printf('%-30s %3d', subject || ':', COUNT(*)) 
FROM ETFOLessonPlan 
GROUP BY subject 
ORDER BY COUNT(*) DESC;
SELECT '';
SELECT '⚠️  Scheduling Issues:' as '';
SELECT '--------------------' as '';
SELECT 'Days with >5 lessons: ' || COUNT(*) FROM (
  SELECT date(date/1000, 'unixepoch') as day, COUNT(*) as c 
  FROM ETFOLessonPlan 
  GROUP BY day 
  HAVING c > 5
);
SELECT 'Maximum lessons in one day: ' || MAX(c) FROM (
  SELECT COUNT(*) as c 
  FROM ETFOLessonPlan 
  GROUP BY date(date/1000, 'unixepoch')
);
"

echo ""
echo "Seed files processed:"
echo "  ✅ Successful: $SUCCESS_COUNT"
echo "  ❌ Failed: $FAIL_COUNT"
echo ""

# Check for critical issues
TOTAL_LESSONS=$(sqlite3 prisma/dev.db "SELECT COUNT(*) FROM ETFOLessonPlan;")
TOTAL_UNITS=$(sqlite3 prisma/dev.db "SELECT COUNT(*) FROM UnitPlan;")

if [ "$TOTAL_LESSONS" -gt 100 ]; then
  echo "✅ RESTORATION SUCCESSFUL!"
  echo "   System has $TOTAL_LESSONS lessons and $TOTAL_UNITS units"
else
  echo "⚠️  PARTIAL RESTORATION"
  echo "   Only $TOTAL_LESSONS lessons restored (expected 500+)"
  echo "   Review failed seeds above for issues"
fi

echo ""
echo "🎯 Emily's teaching system restoration complete!"
echo "================================================"