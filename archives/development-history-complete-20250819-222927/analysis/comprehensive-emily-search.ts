#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function comprehensiveEmilySearch() {
  console.log('🔍 COMPREHENSIVE SEARCH: All Emily McIsaac Data\n');
  console.log('==============================================================\n');
  
  try {
    // Find Emily's user ID
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    if (!emily) {
      console.log('❌ Emily McIsaac not found');
      return;
    }

    console.log(`✅ Found Emily McIsaac (ID: ${emily.id})\n`);

    // Check ALL lesson types in the database
    console.log('📊 ALL LESSON TYPES FOR EMILY:');
    console.log('==============================');

    // 1. ETFO Lesson Plans
    const etfoLessons = await prisma.eTFOLessonPlan.findMany({
      where: { userId: emily.id }
    });
    console.log(`   ETFO Lesson Plans: ${etfoLessons.length}`);

    // Group ETFO lessons by subject
    const etfoBySubject = etfoLessons.reduce((acc, lesson) => {
      const subject = lesson.subject || 'Unknown';
      acc[subject] = (acc[subject] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('   ETFO Lessons by Subject:');
    Object.entries(etfoBySubject)
      .sort(([, a], [, b]) => b - a)
      .forEach(([subject, count]) => {
        console.log(`      ${subject}: ${count} lessons`);
      });

    // 2. Check if there's a legacy LessonPlan table
    try {
      const legacyLessons = await prisma.lessonPlan.findMany({
        where: { userId: emily.id }
      });
      console.log(`   Legacy Lesson Plans: ${legacyLessons.length}`);
      
      if (legacyLessons.length > 0) {
        const legacyBySubject = legacyLessons.reduce((acc, lesson) => {
          const subject = (lesson as any).subject || 'Unknown';
          acc[subject] = (acc[subject] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        console.log('   Legacy Lessons by Subject:');
        Object.entries(legacyBySubject)
          .sort(([, a], [, b]) => b - a)
          .forEach(([subject, count]) => {
            console.log(`      ${subject}: ${count} lessons`);
          });
      }
    } catch (error) {
      console.log('   Legacy Lesson Plans: Table does not exist');
    }

    // 3. Unit Plans
    const unitPlans = await prisma.unitPlan.findMany({
      where: { userId: emily.id },
      include: {
        longRangePlan: true,
        lessonPlans: true
      }
    });
    console.log(`   Unit Plans: ${unitPlans.length}`);

    if (unitPlans.length > 0) {
      const unitsBySubject = unitPlans.reduce((acc, unit) => {
        const subject = unit.longRangePlan.subject || 'Unknown';
        acc[subject] = (acc[subject] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      console.log('   Unit Plans by Subject:');
      Object.entries(unitsBySubject)
        .sort(([, a], [, b]) => b - a)
        .forEach(([subject, count]) => {
          console.log(`      ${subject}: ${count} units`);
        });

      // Count lessons within units
      const lessonCountBySubject = unitPlans.reduce((acc, unit) => {
        const subject = unit.longRangePlan.subject || 'Unknown';
        acc[subject] = (acc[subject] || 0) + unit.lessonPlans.length;
        return acc;
      }, {} as Record<string, number>);

      console.log('   Lessons within Units by Subject:');
      Object.entries(lessonCountBySubject)
        .sort(([, a], [, b]) => b - a)
        .forEach(([subject, count]) => {
          console.log(`      ${subject}: ${count} lessons`);
        });
    }

    // 4. Long Range Plans
    const longRangePlans = await prisma.longRangePlan.findMany({
      where: { userId: emily.id }
    });
    console.log(`   Long Range Plans: ${longRangePlans.length}`);

    if (longRangePlans.length > 0) {
      console.log('   Long Range Plans by Subject:');
      longRangePlans.forEach(lrp => {
        console.log(`      ${lrp.subject} (Grade ${lrp.grade}): "${lrp.title}"`);
      });
    }

    // 5. Search for any French-related content with broader patterns
    console.log('\n🇫🇷 FRENCH CONTENT SEARCH:');
    console.log('===========================');

    const allFrenchKeywords = [
      'français', 'Français', 'FRANÇAIS',
      'french', 'French', 'FRENCH',
      'immersion', 'Immersion', 'IMMERSION',
      'FI', 'fi', 'Fr', 'fr'
    ];

    // Search in ETFO lessons
    for (const keyword of allFrenchKeywords) {
      const etfoMatches = await prisma.eTFOLessonPlan.findMany({
        where: {
          userId: emily.id,
          OR: [
            { subject: { contains: keyword } },
            { title: { contains: keyword } },
            { titleFr: { contains: keyword } }
          ]
        }
      });

      if (etfoMatches.length > 0) {
        console.log(`   ETFO lessons containing "${keyword}": ${etfoMatches.length}`);
      }
    }

    // Search in Long Range Plans
    for (const keyword of allFrenchKeywords) {
      const lrpMatches = await prisma.longRangePlan.findMany({
        where: {
          userId: emily.id,
          OR: [
            { subject: { contains: keyword } },
            { title: { contains: keyword } },
            { titleFr: { contains: keyword } }
          ]
        }
      });

      if (lrpMatches.length > 0) {
        console.log(`   LRP containing "${keyword}": ${lrpMatches.length}`);
      }
    }

    // 6. Check all unique subjects in Emily's data
    console.log('\n📋 ALL UNIQUE SUBJECTS FOR EMILY:');
    console.log('==================================');

    const allSubjects = new Set<string>();
    
    etfoLessons.forEach(lesson => {
      if (lesson.subject) allSubjects.add(lesson.subject);
    });

    longRangePlans.forEach(lrp => {
      if (lrp.subject) allSubjects.add(lrp.subject);
    });

    Array.from(allSubjects)
      .sort()
      .forEach(subject => {
        const etfoCount = etfoLessons.filter(l => l.subject === subject).length;
        const lrpCount = longRangePlans.filter(l => l.subject === subject).length;
        console.log(`   ${subject}: ${etfoCount} ETFO lessons, ${lrpCount} LRPs`);
      });

    // 7. Look for any French lessons created this year
    const thisYear = new Date().getFullYear();
    const frenchLessonsThisYear = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        date: {
          gte: new Date(`${thisYear}-01-01`),
          lte: new Date(`${thisYear}-12-31`)
        },
        OR: [
          { subject: { contains: 'Français' } },
          { subject: { contains: 'French' } },
          { subject: { contains: 'français' } },
          { subject: { contains: 'immersion' } }
        ]
      },
      orderBy: { date: 'desc' }
    });

    console.log(`\n📅 FRENCH LESSONS IN ${thisYear}: ${frenchLessonsThisYear.length}`);

    if (frenchLessonsThisYear.length > 0) {
      console.log('   Recent French lessons:');
      frenchLessonsThisYear.slice(0, 5).forEach(lesson => {
        console.log(`      ${lesson.date.toDateString()}: "${lesson.title}" (${lesson.subject})`);
      });
    }

    // 8. Total lesson count across all subjects
    console.log(`\n📊 TOTAL COUNTS FOR EMILY:
   Total ETFO Lessons: ${etfoLessons.length}
   Total Unit Plans: ${unitPlans.length}
   Total Long Range Plans: ${longRangePlans.length}`);

    console.log('\n✅ Comprehensive search complete!');

  } catch (error) {
    console.error('❌ Error in comprehensive search:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

comprehensiveEmilySearch()
  .then(() => console.log('🎉 Comprehensive search completed successfully!'))
  .catch((error) => {
    console.error('💥 Comprehensive search failed:', error);
    process.exit(1);
  });