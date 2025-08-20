import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function exploreEmilyUnits() {
  try {
    console.log('🔍 Exploring all of Emily\'s units and lesson plans...\n');

    // First, get Emily's user ID
    const emily = await prisma.user.findFirst({
      where: {
        name: {
          contains: 'Emily'
        }
      }
    });

    if (!emily) {
      console.log('❌ Emily not found in database');
      return;
    }

    console.log(`✅ Found Emily (ID: ${emily.id})\n`);

    // Get all Emily's long range plans
    const longRangePlans = await prisma.longRangePlan.findMany({
      where: {
        userId: emily.id
      },
      select: {
        id: true,
        title: true,
        subject: true,
        grade: true,
        academicYear: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📚 Emily's Long Range Plans (${longRangePlans.length}):`);
    for (const lrp of longRangePlans) {
      console.log(`  - ${lrp.title} | ${lrp.subject} | Grade ${lrp.grade} | ${lrp.academicYear}`);
    }

    // Get all Emily's unit plans
    const unitPlans = await prisma.unitPlan.findMany({
      where: {
        userId: emily.id
      },
      include: {
        longRangePlan: {
          select: {
            title: true,
            subject: true,
            grade: true
          }
        },
        lessonPlans: {
          select: {
            id: true,
            title: true,
            titleFr: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    console.log(`\n📋 Emily's Unit Plans (${unitPlans.length}):`);
    for (const unit of unitPlans) {
      console.log(`\n📚 ${unit.title}`);
      console.log(`   📖 LRP: ${unit.longRangePlan.title}`);
      console.log(`   📝 Subject: ${unit.longRangePlan.subject}`);
      console.log(`   🎓 Grade: ${unit.longRangePlan.grade}`);
      console.log(`   🗓️ Period: ${unit.startDate.toDateString()} - ${unit.endDate.toDateString()}`);
      console.log(`   📝 Lessons: ${unit.lessonPlans.length}`);
      
      if (unit.lessonPlans.length > 0) {
        console.log(`   📋 Sample Lessons:`);
        for (let i = 0; i < Math.min(3, unit.lessonPlans.length); i++) {
          const lesson = unit.lessonPlans[i];
          console.log(`     - ${lesson.title || lesson.titleFr || 'No title'}`);
        }
        if (unit.lessonPlans.length > 3) {
          console.log(`     ... and ${unit.lessonPlans.length - 3} more`);
        }
      }
    }

    // Look specifically for French-related content
    const frenchUnits = unitPlans.filter(unit => 
      unit.longRangePlan.subject.toLowerCase().includes('français') ||
      unit.longRangePlan.subject.toLowerCase().includes('french') ||
      unit.title.toLowerCase().includes('français') ||
      unit.title.toLowerCase().includes('french')
    );

    console.log(`\n🇫🇷 French-Related Units (${frenchUnits.length}):`);
    for (const unit of frenchUnits) {
      console.log(`  - ${unit.title} (${unit.lessonPlans.length} lessons)`);
    }

    // Look for Grade 1 units
    const grade1Units = unitPlans.filter(unit => unit.longRangePlan.grade === 1);
    
    console.log(`\n👶 Grade 1 Units (${grade1Units.length}):`);
    for (const unit of grade1Units) {
      console.log(`  - ${unit.title} | ${unit.longRangePlan.subject} (${unit.lessonPlans.length} lessons)`);
    }

    // Summary
    const totalLessons = unitPlans.reduce((sum, unit) => sum + unit.lessonPlans.length, 0);
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`- Total LRPs: ${longRangePlans.length}`);
    console.log(`- Total Units: ${unitPlans.length}`);
    console.log(`- Total Lessons: ${totalLessons}`);
    console.log(`- French Units: ${frenchUnits.length}`);
    console.log(`- Grade 1 Units: ${grade1Units.length}`);

  } catch (error) {
    console.error('❌ Error exploring Emily\'s units:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exploreEmilyUnits().catch(console.error);