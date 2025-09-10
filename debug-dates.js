// Debug script to understand date issues
const { startOfWeek, addDays, format } = require('date-fns');

// Simulate what WeekView is doing
const currentWeek = new Date('2025-09-10T12:00:00'); // Wednesday Sep 10
const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday

console.log('Current week:', currentWeek.toISOString());
console.log('Week start:', weekStart.toISOString());
console.log('Week start (local):', weekStart.toString());

// Generate dates for each day
for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
  const date = addDays(weekStart, dayOffset);
  console.log(`\nDay ${dayOffset}:`);
  console.log('  Date object:', date.toString());
  console.log('  ISO string:', date.toISOString());
  console.log('  Local format:', format(date, 'yyyy-MM-dd'));
  console.log('  UTC components:', 
    `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`);
}

// Check a lesson date
const lessonDate = new Date(1757516400000); // Sep 10, 2025 at 15:00 UTC
console.log('\n\nLesson date (Sep 10 @ 15:00 UTC):');
console.log('  Timestamp:', 1757516400000);
console.log('  Date object:', lessonDate.toString());
console.log('  ISO string:', lessonDate.toISOString());
console.log('  UTC date key:', 
  `${lessonDate.getUTCFullYear()}-${String(lessonDate.getUTCMonth() + 1).padStart(2, '0')}-${String(lessonDate.getUTCDate()).padStart(2, '0')}`);

// Friday lesson
const fridayLesson = new Date('2025-09-12T15:00:00Z');
console.log('\n\nFriday lesson (Sep 12 @ 15:00 UTC):');
console.log('  Date object:', fridayLesson.toString());
console.log('  ISO string:', fridayLesson.toISOString());
console.log('  UTC date key:', 
  `${fridayLesson.getUTCFullYear()}-${String(fridayLesson.getUTCMonth() + 1).padStart(2, '0')}-${String(fridayLesson.getUTCDate()).padStart(2, '0')}`);