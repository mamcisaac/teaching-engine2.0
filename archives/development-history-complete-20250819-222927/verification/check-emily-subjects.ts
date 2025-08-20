import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkEmilySubjects() {
  try {
    console.log('=== CHECKING EMILY\'S SUBJECTS ===\n');
    
    // Get Emily's user record
    const emily = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { contains: 'emily' } },
          { name: { contains: 'Emily' } }
        ]
      }
    });
    
    if (!emily) {
      console.log('❌ Emily not found in database');
      return;
    }
    
    console.log('✅ Found Emily:', emily.name, '(ID:', emily.id + ')');
    
    // Get all long range plans for Emily
    const lrps = await prisma.longRangePlan.findMany({
      where: {
        userId: emily.id
      },
      select: {
        id: true,
        title: true,
        subject: true,
        academicYear: true,
        grade: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('\n=== EMILY\'S LONG RANGE PLANS ===');
    console.log('Total LRPs:', lrps.length);
    
    if (lrps.length === 0) {
      console.log('❌ No Long Range Plans found for Emily');
      return;
    }
    
    // Group by subject
    const subjectGroups = lrps.reduce((groups, lrp) => {
      if (!groups[lrp.subject]) {
        groups[lrp.subject] = [];
      }
      groups[lrp.subject].push(lrp);
      return groups;
    }, {} as Record<string, typeof lrps>);
    
    console.log('\n=== SUBJECTS BREAKDOWN ===');
    Object.entries(subjectGroups).forEach(([subject, plans]) => {
      console.log(`\n${subject}: ${plans.length} plans`);
      plans.forEach(plan => {
        console.log(`  - ${plan.title} (Grade ${plan.grade}, ${plan.academicYear})`);
      });
    });
    
    // Now check unit plans for each LRP
    console.log('\n=== UNIT PLANS BY SUBJECT ===');
    for (const [subject, plans] of Object.entries(subjectGroups)) {
      console.log(`\n=== ${subject.toUpperCase()} UNIT PLANS ===`);
      
      for (const lrp of plans) {
        const units = await prisma.unitPlan.findMany({
          where: {
            longRangePlanId: lrp.id
          },
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            createdAt: true
          },
          orderBy: {
            startDate: 'asc'
          }
        });
        
        console.log(`\nLRP: ${lrp.title} - ${units.length} units`);
        units.forEach((unit, index) => {
          console.log(`  Unit ${index + 1}: ${unit.title}`);
          console.log(`    Dates: ${unit.startDate.toISOString().split('T')[0]} to ${unit.endDate.toISOString().split('T')[0]}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkEmilySubjects().catch(console.error);