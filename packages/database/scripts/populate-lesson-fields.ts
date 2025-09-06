#!/usr/bin/env tsx
/**
 * Script to populate scheduledDate and searchContent fields for all lessons
 * This will:
 * 1. Calculate scheduledDate based on lessonNumber and school year
 * 2. Build searchContent from all text fields for full-text search
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PEI School Year 2025-2026 dates
const SCHOOL_START = new Date('2025-09-03'); // First Wednesday of September
const SCHOOL_END = new Date('2026-06-26'); // Last Friday of June

// Holidays and PD days (simplified for now)
const HOLIDAYS = [
  // September
  { start: new Date('2025-09-01'), end: new Date('2025-09-02') }, // Labour Day weekend
  
  // October
  { start: new Date('2025-10-13'), end: new Date('2025-10-13') }, // Thanksgiving
  
  // November 
  { start: new Date('2025-11-11'), end: new Date('2025-11-11') }, // Remembrance Day
  
  // December - Winter Break
  { start: new Date('2025-12-22'), end: new Date('2026-01-02') }, // Winter break
  
  // February
  { start: new Date('2026-02-16'), end: new Date('2026-02-20') }, // February break
  
  // March
  { start: new Date('2026-03-16'), end: new Date('2026-03-20') }, // March break
  
  // April
  { start: new Date('2026-04-03'), end: new Date('2026-04-06') }, // Easter weekend
  
  // May
  { start: new Date('2026-05-18'), end: new Date('2026-05-18') }, // Victoria Day
];

function isSchoolDay(date: Date): boolean {
  // Check if weekend
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return false;
  
  // Check if holiday
  for (const holiday of HOLIDAYS) {
    if (date >= holiday.start && date <= holiday.end) return false;
  }
  
  return true;
}

function getSchoolDays(): Date[] {
  const schoolDays: Date[] = [];
  const currentDate = new Date(SCHOOL_START);
  
  while (currentDate <= SCHOOL_END) {
    if (isSchoolDay(currentDate)) {
      schoolDays.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return schoolDays;
}

function buildSearchContent(lesson: any): string {
  const parts: string[] = [];
  
  // Add all text fields
  if (lesson.title) parts.push(lesson.title);
  if (lesson.titleFr) parts.push(lesson.titleFr);
  if (lesson.mindsOn) parts.push(lesson.mindsOn);
  if (lesson.mindsOnFr) parts.push(lesson.mindsOnFr);
  if (lesson.action) parts.push(lesson.action);
  if (lesson.actionFr) parts.push(lesson.actionFr);
  if (lesson.consolidation) parts.push(lesson.consolidation);
  if (lesson.consolidationFr) parts.push(lesson.consolidationFr);
  if (lesson.learningGoals) parts.push(lesson.learningGoals);
  if (lesson.learningGoalsFr) parts.push(lesson.learningGoalsFr);
  if (lesson.assessmentNotes) parts.push(lesson.assessmentNotes);
  if (lesson.subNotes) parts.push(lesson.subNotes);
  if (lesson.indigenousPerspectives) parts.push(lesson.indigenousPerspectives);
  if (lesson.performanceOpportunities) parts.push(lesson.performanceOpportunities);
  if (lesson.priorKnowledgeCheck) parts.push(lesson.priorKnowledgeCheck);
  
  // Add JSON fields as text
  if (lesson.materials) {
    try {
      const materials = typeof lesson.materials === 'string' 
        ? JSON.parse(lesson.materials) 
        : lesson.materials;
      if (Array.isArray(materials)) {
        parts.push(...materials);
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
  }
  
  // Add unit and subject info if available
  if (lesson.subject) parts.push(lesson.subject);
  if (lesson.unitPlan?.title) parts.push(lesson.unitPlan.title);
  if (lesson.unitPlan?.titleFr) parts.push(lesson.unitPlan.titleFr);
  
  return parts.filter(Boolean).join(' ').toLowerCase();
}

async function populateLessonFields() {
  console.log('Starting to populate lesson fields...');
  
  // Get all lessons with their unit plans
  const lessons = await prisma.eTFOLessonPlan.findMany({
    include: {
      unitPlan: true
    },
    orderBy: [
      { unitPlanId: 'asc' },
      { lessonNumber: 'asc' }
    ]
  });
  
  console.log(`Found ${lessons.length} lessons to update`);
  
  // Get school days for scheduling
  const schoolDays = getSchoolDays();
  console.log(`Found ${schoolDays.length} school days in 2025-2026`);
  
  // Calculate lessons per day (5 subjects per day)
  const lessonsPerDay = 5;
  let currentDayIndex = 0;
  let lessonsOnCurrentDay = 0;
  
  // Update each lesson
  for (const lesson of lessons) {
    // Calculate scheduled date based on lesson distribution
    if (lessonsOnCurrentDay >= lessonsPerDay) {
      currentDayIndex++;
      lessonsOnCurrentDay = 0;
    }
    
    const scheduledDate = schoolDays[currentDayIndex] || schoolDays[schoolDays.length - 1];
    lessonsOnCurrentDay++;
    
    // Determine time slot based on position in day
    const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM'];
    const scheduledTime = timeSlots[lessonsOnCurrentDay - 1] || '9:00 AM';
    
    // Build search content
    const searchContent = buildSearchContent(lesson);
    
    // Update the lesson
    await prisma.eTFOLessonPlan.update({
      where: { id: lesson.id },
      data: {
        scheduledDate,
        scheduledTime,
        searchContent,
        status: 'PLANNED'
      }
    });
    
    console.log(`Updated lesson "${lesson.title}" - scheduled for ${scheduledDate.toISOString().split('T')[0]} at ${scheduledTime}`);
  }
  
  console.log('✅ Successfully populated all lesson fields!');
}

// Run the script
populateLessonFields()
  .catch((error) => {
    console.error('Error populating lesson fields:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });