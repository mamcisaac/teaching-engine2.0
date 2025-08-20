// Analysis of optimal unit count for Grade 1 Math

console.log('🔍 OPTIMAL UNIT ANALYSIS FOR GRADE 1 MATH\n');
console.log('=' .repeat(60));

const totalLessons = 195;
const totalHours = 146.25;
const lessonsPerWeek = 5; // Math is taught daily

console.log('GIVEN CONSTRAINTS:');
console.log(`- Total Lessons: ${totalLessons}`);
console.log(`- Total Hours: ${totalHours}`);
console.log(`- ETFO Guideline: Units should be 2-4 weeks`);
console.log(`- Curriculum Expectations: 14 total\n`);

console.log('=' .repeat(60));
console.log('UNIT COUNT SCENARIOS:\n');

for (let units = 9; units <= 12; units++) {
  const lessonsPerUnit = totalLessons / units;
  const hoursPerUnit = totalHours / units;
  const weeksPerUnit = lessonsPerUnit / lessonsPerWeek;
  const etfoCompliant = weeksPerUnit >= 2 && weeksPerUnit <= 4;
  
  console.log(`📊 With ${units} Units:`);
  console.log(`   Lessons per unit: ${lessonsPerUnit.toFixed(1)}`);
  console.log(`   Hours per unit: ${hoursPerUnit.toFixed(1)}`);
  console.log(`   Weeks per unit: ${weeksPerUnit.toFixed(1)}`);
  console.log(`   ETFO Compliant: ${etfoCompliant ? '✅ YES' : '❌ NO'}`);
  console.log(`   Expectation coverage: ~${(14/units).toFixed(1)} expectations per unit\n`);
}

console.log('=' .repeat(60));
console.log('RECOMMENDATION:\n');

console.log('🎯 OPTIMAL: 12 Units');
console.log('   - 16.25 lessons per unit (3.25 weeks) - PERFECT for ETFO');
console.log('   - 12.2 hours per unit');
console.log('   - 1-2 expectations per unit (focused learning)');
console.log('   - Allows for proper pacing and assessment\n');

console.log('🎯 ALSO GOOD: 11 Units');
console.log('   - 17.7 lessons per unit (3.5 weeks) - Within ETFO');
console.log('   - 13.3 hours per unit');
console.log('   - 1-2 expectations per unit');

console.log('\n' + '=' .repeat(60));
console.log('PROPOSED 12-UNIT STRUCTURE:\n');

const proposedUnits = [
  { month: 'September', unit: 'Unit 1: Number Sense Foundations', expectations: '1.N1, 1.N2', weeks: 3 },
  { month: 'Sept/Oct', unit: 'Unit 2: Counting and Cardinality', expectations: '1.N3', weeks: 3 },
  { month: 'October', unit: 'Unit 3: Comparing Numbers', expectations: '1.N4, 1.N5', weeks: 3 },
  { month: 'Nov', unit: 'Unit 4: Introduction to Patterns', expectations: '1.RR1', weeks: 3 },
  { month: 'Nov/Dec', unit: 'Unit 5: Shapes and Sorting', expectations: '1.FE2', weeks: 3.5 },
  { month: 'December', unit: 'Unit 6: Early Addition', expectations: '1.N8', weeks: 3 },
  { month: 'January', unit: 'Unit 7: Early Subtraction', expectations: '1.N7', weeks: 3.5 },
  { month: 'Jan/Feb', unit: 'Unit 8: Number Relationships', expectations: '1.N6', weeks: 3 },
  { month: 'February', unit: 'Unit 9: Mental Math Strategies', expectations: '1.N9', weeks: 3.5 },
  { month: 'March', unit: 'Unit 10: Measurement Basics', expectations: '1.FE1', weeks: 3.5 },
  { month: 'Apr/May', unit: 'Unit 11: Pattern Extensions', expectations: '1.RR2', weeks: 3.5 },
  { month: 'May/June', unit: 'Unit 12: Equality and Data', expectations: '1.RR3', weeks: 3 }
];

proposedUnits.forEach((unit, index) => {
  console.log(`${unit.month.padEnd(10)} | ${unit.unit.padEnd(35)} | ${unit.expectations.padEnd(12)} | ${unit.weeks} weeks`);
});

console.log('\n' + '=' .repeat(60));
console.log('BENEFITS OF 12-UNIT STRUCTURE:\n');
console.log('✅ All units are 3-3.5 weeks (ETFO compliant)');
console.log('✅ Each expectation gets focused attention');
console.log('✅ Natural assessment points every 3 weeks');
console.log('✅ Aligns with monthly reporting cycles');
console.log('✅ No excessive repetition needed');
console.log('✅ Strategic spiraling still possible');
console.log('✅ Manageable chunks for 6-year-olds');

console.log('\n' + '=' .repeat(60));
console.log('CONCLUSION:');
console.log('The current 9-unit structure forces units to be 4-5 weeks,');
console.log('which exceeds ETFO guidelines and creates pacing problems.');
console.log('Restructuring to 12 units would achieve true perfection.');