import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/*
🔍 INVESTIGATION: Emily's Complete Structure
═══════════════════════════════════════════════

Investigate Emily's complete unit and lesson structure to understand 
why no French units were found and locate Units 9-16.
*/

async function investigateEmilyStructure() {
  try {
    console.log('🔍 INVESTIGATING EMILY\'S COMPLETE STRUCTURE\n');
    console.log('══════════════════════════════════════════════════════════\n');

    // Get Emily
    const emily = await prisma.user.findFirst({
      where: { name: { contains: 'Emily' } }
    });

    if (!emily) {
      console.log('❌ Emily not found');
      return;
    }

    console.log(`📋 Found Emily: ${emily.name} (ID: ${emily.id})\n`);

    // Get all Long Range Plans for Emily
    const allLRPs = await prisma.longRangePlan.findMany({
      where: {
        userId: emily.id
      },
      include: {
        unitPlans: {
          include: {
            lessonPlans: {
              select: {
                id: true,
                title: true,
                titleFr: true,
                date: true
              },
              orderBy: { date: 'asc' }
            }
          },
          orderBy: { startDate: 'asc' }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    console.log(`📚 LONG RANGE PLANS OVERVIEW:`);
    console.log(`   Total LRPs found: ${allLRPs.length}\n`);

    // Display all LRPs with details
    for (let i = 0; i < allLRPs.length; i++) {
      const lrp = allLRPs[i];
      const totalUnits = lrp.unitPlans.length;
      const totalLessons = lrp.unitPlans.reduce((sum, unit) => sum + unit.lessonPlans.length, 0);
      
      console.log(`📖 LRP ${i + 1}: ${lrp.title}`);
      console.log(`   📋 Subject: ${lrp.subject}`);
      console.log(`   📅 Academic Year: ${lrp.academicYear}`);
      console.log(`   📊 Grade: ${lrp.grade}`);
      console.log(`   📚 Units: ${totalUnits}`);
      console.log(`   📝 Total Lessons: ${totalLessons}\n`);

      if (lrp.subject.toLowerCase().includes('français') || lrp.subject.toLowerCase().includes('french')) {
        console.log(`   🇫🇷 FRENCH LRP FOUND! Detailed analysis:\n`);
        
        lrp.unitPlans.forEach((unit, unitIndex) => {
          console.log(`      Unit ${unitIndex + 1}: ${unit.title}`);
          console.log(`         📝 Lessons: ${unit.lessonPlans.length}`);
          console.log(`         📅 Start: ${unit.startDate.toISOString().split('T')[0]}`);
          console.log(`         📅 End: ${unit.endDate.toISOString().split('T')[0]}`);
          
          if (unit.lessonPlans.length > 0) {
            const firstLesson = unit.lessonPlans[0];
            console.log(`         📋 First Lesson: "${firstLesson.title}"`);
            console.log(`         🇫🇷 French Title: "${firstLesson.titleFr || 'Missing'}"`);
          }
          console.log('');
        });
      }
    }

    // Look specifically for French subject variations
    console.log(`🔍 SUBJECT ANALYSIS:`);
    const subjects = [...new Set(allLRPs.map(lrp => lrp.subject))];
    subjects.forEach(subject => {
      const lrpsWithSubject = allLRPs.filter(lrp => lrp.subject === subject);
      const totalUnits = lrpsWithSubject.reduce((sum, lrp) => sum + lrp.unitPlans.length, 0);
      const totalLessons = lrpsWithSubject.reduce((sum, lrp) => 
        sum + lrp.unitPlans.reduce((unitSum, unit) => unitSum + unit.lessonPlans.length, 0), 0);
      
      console.log(`   📋 "${subject}": ${lrpsWithSubject.length} LRP(s), ${totalUnits} units, ${totalLessons} lessons`);
    });

    // Check for any units that might be French-related by title
    console.log(`\n🇫🇷 FRENCH-RELATED UNITS BY TITLE:`);
    const allUnits = allLRPs.flatMap(lrp => lrp.unitPlans.map(unit => ({ ...unit, lrpSubject: lrp.subject })));
    const frenchUnits = allUnits.filter(unit => 
      unit.title.toLowerCase().includes('français') ||
      unit.title.toLowerCase().includes('french') ||
      unit.titleFr ||
      unit.title.includes('école') ||
      unit.title.includes('famille') ||
      unit.title.includes('couleurs') ||
      unit.title.includes('automne') ||
      unit.title.includes('hiver')
    );

    if (frenchUnits.length > 0) {
      console.log(`   Found ${frenchUnits.length} potentially French units:\n`);
      frenchUnits.forEach((unit, index) => {
        console.log(`   Unit ${index + 1}: ${unit.title}`);
        console.log(`      LRP Subject: ${unit.lrpSubject}`);
        console.log(`      French Title: ${unit.titleFr || 'None'}`);
        console.log(`      Lessons: ${unit.lessonPlans.length}`);
        console.log(`      Date Range: ${unit.startDate.toISOString().split('T')[0]} to ${unit.endDate.toISOString().split('T')[0]}\n`);
      });
    } else {
      console.log(`   No French-related units found by title.\n`);
    }

    // Check recent status files for context
    console.log(`📋 RECENT STATUS CONTEXT:`);
    console.log(`   Check project files for recent Phase 2 Part 1 completion status...`);

  } catch (error) {
    console.error('❌ Error investigating Emily\'s structure:', error);
  } finally {
    await prisma.$disconnect();
  }
}

investigateEmilyStructure().catch(console.error);