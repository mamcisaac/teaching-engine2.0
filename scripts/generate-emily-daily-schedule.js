#!/usr/bin/env node

/**
 * Generate Emily's Perfect Daily Schedule
 * 
 * This script assigns all 975 lessons to 195 school days (Sept 3, 2025 - June 20, 2026)
 * Following the optimal distribution:
 * - French: 1 lesson/day (195 total)
 * - Math: 1 lesson/day (195 total) 
 * - Science: 1 lesson/day (195 total)
 * - Arts: 1 lesson/day (195 total)
 * - Social Studies/Health: alternating days (97/98 total)
 * 
 * 5 lessons per day × 195 days = 975 lessons total
 */

const sqlite3 = require('sqlite3').verbose();
const { addDays, format, isWeekend, isWithinInterval, parseISO } = require('date-fns');

// School year configuration
const SCHOOL_START = new Date('2025-09-03');
const SCHOOL_END = new Date('2026-06-20');

// PEI Holidays 2025-2026
const HOLIDAYS = [
  '2025-10-13', // Thanksgiving
  '2025-11-11', // Remembrance Day
  '2025-12-22', '2025-12-23', '2025-12-24', '2025-12-25', '2025-12-26', 
  '2025-12-29', '2025-12-30', '2025-12-31', // Winter Break
  '2026-01-01', '2026-01-02', // New Year
  '2026-02-16', '2026-02-17', '2026-02-18', '2026-02-19', '2026-02-20', // February Break
  '2026-04-03', // Good Friday
  '2026-04-06', // Easter Monday
  '2026-05-18', // Victoria Day
];

// Daily schedule template (45-minute blocks)
const DAILY_SCHEDULE = [
  { time: '08:45', subject: 'Français (Immersion)', block: 1 },
  { time: '09:30', subject: 'Mathématiques', block: 2 },
  { time: '10:30', subject: 'Sciences de la nature', block: 3 },
  { time: '11:15', subject: 'Arts visuels', block: 4 },
  { time: '13:00', subject: 'rotating', block: 5 } // Social Studies/Health alternate
];

async function main() {
  const db = new sqlite3.Database('./packages/database/prisma/prisma/dev.db');
  
  // Get all school days
  const schoolDays = getSchoolDays();
  console.log(`Total school days: ${schoolDays.length}`);
  
  // Get all lessons organized by subject
  const lessonsBySubject = await getLessonsBySubject(db);
  
  // Create daily assignments
  const assignments = createDailyAssignments(schoolDays, lessonsBySubject);
  
  // Save to database
  await saveAssignments(db, assignments);
  
  console.log('✅ Daily schedule generation complete!');
  console.log(`📚 ${assignments.length} lessons assigned to ${schoolDays.length} days`);
  
  db.close();
}

function getSchoolDays() {
  const days = [];
  let currentDate = SCHOOL_START;
  
  while (currentDate <= SCHOOL_END) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    
    // Skip weekends and holidays
    if (!isWeekend(currentDate) && !HOLIDAYS.includes(dateStr)) {
      days.push(new Date(currentDate));
    }
    
    currentDate = addDays(currentDate, 1);
  }
  
  return days;
}

function getLessonsBySubject(db) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        elp.id,
        elp.title,
        elp.titleFr,
        elp.unitPlanId,
        lrp.subject
      FROM ETFOLessonPlan elp
      JOIN UnitPlan up ON elp.unitPlanId = up.id
      JOIN LongRangePlan lrp ON up.longRangePlanId = lrp.id
      ORDER BY lrp.subject, up.startDate, elp.title
    `;
    
    db.all(query, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      // Organize by subject
      const bySubject = {};
      rows.forEach(row => {
        if (!bySubject[row.subject]) {
          bySubject[row.subject] = [];
        }
        bySubject[row.subject].push(row);
      });
      
      console.log('\nLessons by subject:');
      Object.entries(bySubject).forEach(([subject, lessons]) => {
        console.log(`- ${subject}: ${lessons.length} lessons`);
      });
      
      resolve(bySubject);
    });
  });
}

function createDailyAssignments(schoolDays, lessonsBySubject) {
  const assignments = [];
  
  // Track lesson indices for each subject
  const indices = {
    'Français (Immersion)': 0,
    'Mathématiques': 0,
    'Sciences de la nature': 0,
    'Arts visuels': 0,
    'Sciences humaines': 0,
    'Formation personnelle et sociale': 0
  };
  
  let rotatingDay = 0; // 0 = Social Studies, 1 = Health
  
  schoolDays.forEach((day, dayIndex) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    
    // Assign daily lessons
    DAILY_SCHEDULE.forEach((slot, slotIndex) => {
      let subject = slot.subject;
      
      // Handle rotating block
      if (subject === 'rotating') {
        subject = rotatingDay === 0 ? 'Sciences humaines' : 'Formation personnelle et sociale';
        rotatingDay = 1 - rotatingDay; // Toggle
      }
      
      // Get next lesson for this subject
      const subjectLessons = lessonsBySubject[subject] || [];
      const lessonIndex = indices[subject] || 0;
      
      if (lessonIndex < subjectLessons.length) {
        const lesson = subjectLessons[lessonIndex];
        
        assignments.push({
          lessonId: lesson.id,
          date: dateStr,
          timeSlot: slot.time,
          block: slot.block,
          subject: subject,
          title: lesson.titleFr || lesson.title,
          dayNumber: dayIndex + 1
        });
        
        indices[subject]++;
      }
    });
  });
  
  return assignments;
}

function saveAssignments(db, assignments) {
  return new Promise((resolve, reject) => {
    // First, update all lesson dates in ETFOLessonPlan table
    const updateStmt = db.prepare(`
      UPDATE ETFOLessonPlan 
      SET date = ? 
      WHERE id = ?
    `);
    
    let completed = 0;
    
    assignments.forEach(assignment => {
      const isoDate = new Date(assignment.date).toISOString();
      
      updateStmt.run(isoDate, assignment.lessonId, (err) => {
        if (err) {
          console.error(`Error updating lesson ${assignment.lessonId}:`, err);
        }
        
        completed++;
        if (completed === assignments.length) {
          updateStmt.finalize();
          
          // Also save a summary file
          const fs = require('fs');
          fs.writeFileSync(
            'emily-daily-schedule.json',
            JSON.stringify(assignments, null, 2)
          );
          
          console.log('\n✅ Schedule saved to database and emily-daily-schedule.json');
          resolve();
        }
      });
    });
  });
}

// Run the script
main().catch(console.error);