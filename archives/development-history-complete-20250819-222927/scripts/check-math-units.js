const Database = require('better-sqlite3');
const db = new Database('packages/database/dev.db', { readonly: true });

console.log('\n📐 CHECKING MATH UNITS FOR EMILY MCISAAC (ID 23)\n');
console.log('='.repeat(60));

// Find all Math units
const mathUnits = db.prepare(`
  SELECT 
    id,
    title,
    startDate,
    endDate
  FROM UnitPlan
  WHERE userId = 23
    AND (title LIKE '%Math%' 
         OR title LIKE '%mathématiques%' 
         OR title LIKE '%Mathématiques%')
  ORDER BY startDate
`).all();

console.log(`\nFound ${mathUnits.length} Math units:\n`);

let totalLessons = 0;
let lessonsWithIssues = {
  missingETFO: 0,
  noDifferentiation: 0,
  noVocabularyFr: 0,
  noIndigenous: 0,
  shortIndigenous: 0
};

mathUnits.forEach((unit, i) => {
  // Count lessons for this unit
  const lessonCount = db.prepare(`
    SELECT COUNT(*) as count
    FROM ETFOLessonPlan
    WHERE unitPlanId = ?
  `).get(unit.id);
  
  console.log(`${i + 1}. ${unit.title}`);
  console.log(`   Dates: ${unit.startDate} to ${unit.endDate}`);
  console.log(`   Lessons: ${lessonCount.count}`);
  
  totalLessons += lessonCount.count;
  
  // Get sample lessons to check quality
  const sampleLessons = db.prepare(`
    SELECT 
      title,
      mindsOn,
      action,
      consolidation,
      differentiationStrategies,
      vocabularyFr,
      indigenousPerspectives
    FROM ETFOLessonPlan
    WHERE unitPlanId = ?
    LIMIT 3
  `).all(unit.id);
  
  // Check each lesson for issues
  const allLessons = db.prepare(`
    SELECT 
      mindsOn,
      differentiationStrategies,
      vocabularyFr,
      indigenousPerspectives
    FROM ETFOLessonPlan
    WHERE unitPlanId = ?
  `).all(unit.id);
  
  allLessons.forEach(lesson => {
    // Check ETFO timing format
    if (!lesson.mindsOn || !lesson.mindsOn.includes('(8 minutes)')) {
      lessonsWithIssues.missingETFO++;
    }
    
    // Check differentiation
    if (!lesson.differentiationStrategies) {
      lessonsWithIssues.noDifferentiation++;
    } else if (typeof lesson.differentiationStrategies === 'string') {
      try {
        const diff = JSON.parse(lesson.differentiationStrategies);
        if (!diff.forStruggling || !diff.forIEP || !diff.forELL || !diff.forAdvanced) {
          lessonsWithIssues.noDifferentiation++;
        }
      } catch {
        lessonsWithIssues.noDifferentiation++;
      }
    }
    
    // Check French vocabulary
    if (!lesson.vocabularyFr) {
      lessonsWithIssues.noVocabularyFr++;
    }
    
    // Check Indigenous perspectives
    if (!lesson.indigenousPerspectives) {
      lessonsWithIssues.noIndigenous++;
    } else if (lesson.indigenousPerspectives.length < 100) {
      lessonsWithIssues.shortIndigenous++;
    }
  });
});

console.log('\n' + '='.repeat(60));
console.log('📊 MATH LESSONS SUMMARY');
console.log('='.repeat(60));
console.log(`Total Math lessons: ${totalLessons}`);
console.log(`Target: 188 lessons at 95%+ quality\n`);

console.log('❌ QUALITY ISSUES FOUND:');
console.log(`- Missing ETFO timing format: ${lessonsWithIssues.missingETFO} lessons`);
console.log(`- No/incorrect differentiation: ${lessonsWithIssues.noDifferentiation} lessons`);
console.log(`- No French vocabulary: ${lessonsWithIssues.noVocabularyFr} lessons`);
console.log(`- No Indigenous perspectives: ${lessonsWithIssues.noIndigenous} lessons`);
console.log(`- Short Indigenous perspectives (<100 chars): ${lessonsWithIssues.shortIndigenous} lessons`);

const totalIssuePoints = Object.values(lessonsWithIssues).reduce((a, b) => a + b, 0);
const maxIssuePoints = totalLessons * 5; // 5 criteria per lesson
const qualityScore = Math.round((1 - (totalIssuePoints / maxIssuePoints)) * 100);

console.log(`\n🎯 ESTIMATED QUALITY SCORE: ${qualityScore}%`);
console.log(`   Required: 95%+`);
console.log(`   Gap to close: ${95 - qualityScore}%`);

if (totalLessons === 0) {
  console.log('\n⚠️ NO MATH LESSONS FOUND - NEED TO CREATE ALL 188 LESSONS');
} else if (qualityScore < 95) {
  console.log('\n🔧 ACTION REQUIRED: Enhance all Math lessons to meet ETFO standards');
  console.log('   Priority fixes:');
  if (lessonsWithIssues.missingETFO > 0) console.log('   1. Add ETFO timing structure');
  if (lessonsWithIssues.noDifferentiation > 0) console.log('   2. Add JSON differentiation');
  if (lessonsWithIssues.noVocabularyFr > 0) console.log('   3. Add French vocabulary');
  if (lessonsWithIssues.noIndigenous > 0) console.log('   4. Add Indigenous perspectives');
}

db.close();