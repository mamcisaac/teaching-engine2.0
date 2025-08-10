#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifySeptemberSchedule() {
  console.log('🔍 Verifying September 2025 Lesson Schedule...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found.');
    }
    
    // Get all September lesson plans
    const septemberLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        date: {
          gte: new Date('2025-09-01'),
          lte: new Date('2025-09-30')
        }
      },
      orderBy: { date: 'asc' },
      include: {
        unitPlan: {
          include: {
            longRangePlan: true
          }
        }
      }
    });
    
    console.log(`Found ${septemberLessons.length} total lessons for September\n`);
    
    // Group lessons by date
    const lessonsByDate = new Map<string, any[]>();
    
    septemberLessons.forEach(lesson => {
      const dateKey = lesson.date.toISOString().split('T')[0];
      if (!lessonsByDate.has(dateKey)) {
        lessonsByDate.set(dateKey, []);
      }
      lessonsByDate.get(dateKey)!.push(lesson);
    });
    
    // Check each day
    console.log('📅 Daily Schedule Analysis:');
    console.log('============================\n');
    
    const subjectCounts = new Map<string, number>();
    const issues: string[] = [];
    
    // Sort dates
    const sortedDates = Array.from(lessonsByDate.keys()).sort();
    
    sortedDates.forEach(dateKey => {
      const lessons = lessonsByDate.get(dateKey)!;
      const date = new Date(dateKey);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      
      console.log(`${dateKey} (${dayName}):`);
      
      // Check for conflicts
      const subjects = new Set<string>();
      
      lessons.forEach(lesson => {
        const subject = lesson.subject || 'Unknown';
        
        // Count total lessons per subject
        subjectCounts.set(subject, (subjectCounts.get(subject) || 0) + 1);
        
        if (subjects.has(subject)) {
          issues.push(`❌ DUPLICATE: ${subject} scheduled twice on ${dateKey}`);
          console.log(`  ❌ DUPLICATE: ${subject} - "${lesson.titleFr}"`);
        } else {
          subjects.add(subject);
          console.log(`  ✅ ${subject}: "${lesson.titleFr}" (${lesson.duration} min)`);
        }
      });
      
      // Check total daily hours
      const totalMinutes = lessons.reduce((sum, l) => sum + (l.duration || 0), 0);
      const totalHours = totalMinutes / 60;
      
      if (totalHours > 6) {
        issues.push(`⚠️ WARNING: ${totalHours} hours scheduled on ${dateKey} (max should be ~5-6)`);
        console.log(`  ⚠️ Total: ${totalHours} hours (might be too much for Grade 1)`);
      } else {
        console.log(`  📊 Total: ${totalHours} hours`);
      }
      
      console.log('');
    });
    
    // Summary by subject
    console.log('\n📊 Subject Summary for September:');
    console.log('==================================');
    
    const expectedHours = {
      'Français langue première': 20,
      'Mathématiques': 20,
      'Sciences de la nature': 20,
      'Arts': 8,
      'Sciences humaines': 10,
      'Éducation physique': 10,
      'Formation personnelle et sociale': 8,
      'Music': 4
    };
    
    Array.from(subjectCounts.entries()).sort().forEach(([subject, count]) => {
      const expected = expectedHours[subject] || 'Unknown';
      const status = count === expected ? '✅' : '⚠️';
      console.log(`${status} ${subject}: ${count} lessons (expected: ${expected})`);
      
      if (count !== expected && expected !== 'Unknown') {
        issues.push(`${subject} has ${count} lessons but should have ${expected}`);
      }
    });
    
    // Check for missing subjects
    console.log('\n🔍 Missing Subjects:');
    console.log('===================');
    Object.keys(expectedHours).forEach(subject => {
      if (!subjectCounts.has(subject)) {
        console.log(`❌ ${subject} - No lessons found`);
        issues.push(`${subject} has no lessons for September`);
      }
    });
    
    // Report issues
    if (issues.length > 0) {
      console.log('\n⚠️ Issues Found:');
      console.log('================');
      issues.forEach(issue => console.log(`- ${issue}`));
    } else {
      console.log('\n✅ No scheduling issues found!');
    }
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    console.log('===================');
    console.log('1. Each day should have 4-5 hours of instruction for Grade 1');
    console.log('2. Core subjects (French, Math) should be in the morning');
    console.log('3. Arts, PE, Music typically 2-3 times per week');
    console.log('4. No subject should be scheduled twice on the same day');
    console.log('5. Consider energy levels - active subjects after lunch');
    
    // Check curriculum coverage
    console.log('\n📚 Curriculum Coverage Check:');
    console.log('=============================');
    
    const lessonsWithExpectations = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        date: {
          gte: new Date('2025-09-01'),
          lte: new Date('2025-09-30')
        }
      },
      include: {
        expectations: {
          include: {
            expectation: true
          }
        }
      }
    });
    
    const expectationsCovered = new Set<string>();
    lessonsWithExpectations.forEach(lesson => {
      lesson.expectations.forEach(link => {
        expectationsCovered.add(link.expectation.code);
      });
    });
    
    console.log(`✅ ${expectationsCovered.size} curriculum expectations covered in September`);
    console.log(`   Expectations: ${Array.from(expectationsCovered).sort().join(', ')}`);
    
  } catch (error) {
    console.error('❌ Error verifying schedule:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
verifySeptemberSchedule()
  .then(() => console.log('\n✅ Schedule verification complete!'))
  .catch((error) => {
    console.error('💥 Verification failed:', error);
    process.exit(1);
  });