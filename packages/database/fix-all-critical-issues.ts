#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixAllCriticalIssues() {
  console.log('🔧 FIXING ALL CRITICAL ISSUES\n');
  console.log('=' + '='.repeat(60) + '\n');
  
  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) throw new Error('Emily not found');
    
    // 1. FIX DUPLICATE DATES - Multiple lessons same subject same day
    console.log('📅 FIXING DUPLICATE DATES...');
    
    const duplicates = await prisma.$queryRaw`
      SELECT date, subject, COUNT(*) as count
      FROM ETFOLessonPlan
      WHERE userId = ${emily.id}
      GROUP BY date, subject
      HAVING COUNT(*) > 1
    ` as any[];
    
    console.log(`Found ${duplicates.length} duplicate date/subject combinations\n`);
    
    for (const dup of duplicates) {
      // Get all lessons for this date/subject
      const lessons = await prisma.eTFOLessonPlan.findMany({
        where: {
          userId: emily.id,
          date: new Date(dup.date),
          subject: dup.subject
        },
        orderBy: { createdAt: 'asc' }
      });
      
      console.log(`📅 ${dup.subject} on ${new Date(dup.date).toDateString()} has ${lessons.length} lessons`);
      
      // Keep the first one, move others
      for (let i = 1; i < lessons.length; i++) {
        // Move duplicates to next available weekday
        let newDate = new Date(dup.date);
        let daysAdded = 0;
        let foundSlot = false;
        
        while (!foundSlot && daysAdded < 30) {
          daysAdded++;
          newDate.setDate(newDate.getDate() + 1);
          
          // Skip weekends
          while (newDate.getDay() === 0 || newDate.getDay() === 6) {
            newDate.setDate(newDate.getDate() + 1);
            daysAdded++;
          }
          
          // Check if this date is available for this subject
          const existing = await prisma.eTFOLessonPlan.findFirst({
            where: {
              userId: emily.id,
              date: newDate,
              subject: dup.subject
            }
          });
          
          if (!existing) {
            foundSlot = true;
            console.log(`  → Moving "${lessons[i].titleFr}" to ${newDate.toDateString()}`);
            
            await prisma.eTFOLessonPlan.update({
              where: { id: lessons[i].id },
              data: { date: newDate }
            });
          }
        }
      }
    }
    
    // 2. FIX OVERLOADED DAYS - More than 5 lessons per day
    console.log('\n⚖️ FIXING OVERLOADED DAYS...');
    
    const allLessons = await prisma.eTFOLessonPlan.findMany({
      where: { userId: emily.id },
      orderBy: { date: 'asc' }
    });
    
    const lessonsByDate = new Map();
    allLessons.forEach(lesson => {
      const dateKey = lesson.date.toDateString();
      if (!lessonsByDate.has(dateKey)) {
        lessonsByDate.set(dateKey, []);
      }
      lessonsByDate.get(dateKey).push(lesson);
    });
    
    let redistributed = 0;
    
    for (const [dateKey, lessons] of lessonsByDate.entries()) {
      if (lessons.length > 5) {
        console.log(`\n📅 ${dateKey} has ${lessons.length} lessons (TOO MANY)`);
        
        // Keep first 4 lessons, redistribute others
        const toMove = lessons.slice(4);
        
        for (const lesson of toMove) {
          // Find a nearby day with fewer lessons
          const currentDate = new Date(lesson.date);
          let targetDate = null;
          
          // Check previous and next weekdays
          for (let offset = -2; offset <= 2; offset++) {
            if (offset === 0) continue;
            
            const checkDate = new Date(currentDate);
            checkDate.setDate(checkDate.getDate() + offset);
            
            // Skip weekends
            if (checkDate.getDay() === 0 || checkDate.getDay() === 6) continue;
            
            const checkKey = checkDate.toDateString();
            const checkLessons = lessonsByDate.get(checkKey) || [];
            
            // Check if this subject already exists on this day
            const subjectExists = checkLessons.some(l => l.subject === lesson.subject);
            
            if (checkLessons.length < 4 && !subjectExists) {
              targetDate = checkDate;
              break;
            }
          }
          
          if (targetDate) {
            console.log(`  → Moving "${lesson.titleFr}" to ${targetDate.toDateString()}`);
            
            await prisma.eTFOLessonPlan.update({
              where: { id: lesson.id },
              data: { date: targetDate }
            });
            
            // Update our map
            const targetKey = targetDate.toDateString();
            if (!lessonsByDate.has(targetKey)) {
              lessonsByDate.set(targetKey, []);
            }
            lessonsByDate.get(targetKey).push(lesson);
            redistributed++;
          }
        }
      }
    }
    
    console.log(`\n✅ Redistributed ${redistributed} lessons`);
    
    // 3. IMPROVE FRENCH INTEGRATION
    console.log('\n🇫🇷 IMPROVING FRENCH INTEGRATION...');
    
    const nonFrenchLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        NOT: {
          subject: 'Français langue première'
        }
      }
    });
    
    let updatedCount = 0;
    
    for (const lesson of nonFrenchLessons) {
      // Check if it already has French integration
      const hasFrench = lesson.learningGoals?.toLowerCase().includes('french') || 
                       lesson.learningGoals?.toLowerCase().includes('français');
      
      if (!hasFrench && lesson.subject) {
        // Add natural French integration based on subject
        let frenchConnection = '';
        
        switch (lesson.subject) {
          case 'Mathématiques':
            frenchConnection = ' Natural French connection: Use French number vocabulary throughout.';
            break;
          case 'Sciences de la nature':
            frenchConnection = ' Natural French connection: Use French observation vocabulary (observer, comparer, mesurer).';
            break;
          case 'Arts':
            frenchConnection = ' Natural French connection: Describe artwork in French (couleur, forme, créer).';
            break;
          case 'Éducation physique':
            frenchConnection = ' Natural French connection: Give instructions in French (bouger, sauter, courir).';
            break;
          default:
            frenchConnection = ' Natural French connection: Reinforce daily French vocabulary.';
        }
        
        const updatedGoals = (lesson.learningGoals || '') + frenchConnection;
        
        await prisma.eTFOLessonPlan.update({
          where: { id: lesson.id },
          data: { 
            learningGoals: updatedGoals
          }
        });
        
        updatedCount++;
      }
    }
    
    console.log(`✅ Added French integration to ${updatedCount} lessons`);
    
    // 4. FIX WEEKEND LESSONS (if any remain)
    console.log('\n📅 CHECKING FOR WEEKEND LESSONS...');
    
    const weekendLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        OR: [
          { date: { equals: new Date('2025-09-06') } }, // Saturday
          { date: { equals: new Date('2025-09-07') } }, // Sunday
          { date: { equals: new Date('2025-09-13') } }, // Saturday
          { date: { equals: new Date('2025-09-14') } }, // Sunday
          { date: { equals: new Date('2025-09-20') } }, // Saturday
          { date: { equals: new Date('2025-09-21') } }, // Sunday
          { date: { equals: new Date('2025-09-27') } }, // Saturday
          { date: { equals: new Date('2025-09-28') } }, // Sunday
          { date: { equals: new Date('2025-10-04') } }, // Saturday
          { date: { equals: new Date('2025-10-05') } }, // Sunday
          { date: { equals: new Date('2025-10-11') } }, // Saturday
          { date: { equals: new Date('2025-10-12') } }, // Sunday
          { date: { equals: new Date('2025-10-18') } }, // Saturday
          { date: { equals: new Date('2025-10-19') } }, // Sunday
          { date: { equals: new Date('2025-10-25') } }, // Saturday
          { date: { equals: new Date('2025-10-26') } }, // Sunday
        ]
      }
    });
    
    if (weekendLessons.length > 0) {
      console.log(`Found ${weekendLessons.length} weekend lessons to fix`);
      
      for (const lesson of weekendLessons) {
        const currentDay = lesson.date.getDay();
        const newDate = new Date(lesson.date);
        
        if (currentDay === 0) { // Sunday
          newDate.setDate(newDate.getDate() + 1); // Move to Monday
        } else if (currentDay === 6) { // Saturday
          newDate.setDate(newDate.getDate() + 2); // Move to Monday
        }
        
        console.log(`  → Moving "${lesson.titleFr}" from ${lesson.date.toDateString()} to ${newDate.toDateString()}`);
        
        await prisma.eTFOLessonPlan.update({
          where: { id: lesson.id },
          data: { date: newDate }
        });
      }
    } else {
      console.log('✅ No weekend lessons found');
    }
    
    // 5. FINAL VERIFICATION
    console.log('\n📊 VERIFYING FIXES...');
    
    // Check duplicates again
    const remainingDuplicates = await prisma.$queryRaw`
      SELECT date, subject, COUNT(*) as count
      FROM ETFOLessonPlan
      WHERE userId = ${emily.id}
      GROUP BY date, subject
      HAVING COUNT(*) > 1
    ` as any[];
    
    // Check overloaded days again
    const finalLessons = await prisma.eTFOLessonPlan.findMany({
      where: { userId: emily.id }
    });
    
    const finalByDate = new Map();
    finalLessons.forEach(lesson => {
      const dateKey = lesson.date.toDateString();
      finalByDate.set(dateKey, (finalByDate.get(dateKey) || 0) + 1);
    });
    
    let overloadedDays = 0;
    finalByDate.forEach((count, date) => {
      if (count > 5) {
        overloadedDays++;
        console.log(`⚠️  ${date} still has ${count} lessons`);
      }
    });
    
    // Check French integration
    const finalNonFrench = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        NOT: { subject: 'Français langue première' }
      }
    });
    
    let frenchIntegrated = 0;
    finalNonFrench.forEach(lesson => {
      if (lesson.learningGoals?.toLowerCase().includes('french') || 
          lesson.learningGoals?.toLowerCase().includes('français')) {
        frenchIntegrated++;
      }
    });
    
    const integrationPercent = Math.round((frenchIntegrated / finalNonFrench.length) * 100);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 FIX RESULTS SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Duplicate dates remaining: ${remainingDuplicates.length}`);
    console.log(`✅ Overloaded days remaining: ${overloadedDays}`);
    console.log(`✅ French integration: ${integrationPercent}%`);
    console.log(`✅ Total lessons: ${finalLessons.length}`);
    
    if (remainingDuplicates.length === 0 && overloadedDays === 0 && integrationPercent >= 70) {
      console.log('\n🎉 ALL CRITICAL ISSUES FIXED!');
      return true;
    } else {
      console.log('\n⚠️  Some issues remain - may need manual intervention');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run fixes
fixAllCriticalIssues()
  .then(success => {
    console.log('\n✅ Fix process complete');
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Fix failed:', error);
    process.exit(1);
  });