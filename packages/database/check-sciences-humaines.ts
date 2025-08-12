import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSciencesHumaines() {
  console.log('🔍 CHECKING SCIENCES HUMAINES LRP');
  console.log('===================================');
  
  // Get Sciences humaines LRP
  const lrp = await prisma.longRangePlan.findFirst({
    where: {
      subject: 'Sciences humaines'
    },
    include: {
      expectations: {
        include: {
          expectation: true
        }
      }
    }
  });
  
  if (!lrp) {
    console.log('❌ No Sciences humaines LRP found');
    return;
  }
  
  console.log(`Found LRP: ${lrp.title}`);
  console.log(`ID: ${lrp.id}`);
  console.log(`Grade: ${lrp.grade}`);
  console.log(`Academic Year: ${lrp.academicYear}`);
  console.log(`Total Expectations: ${lrp.expectations.length}`);
  
  console.log('\n📚 CURRICULUM EXPECTATIONS:');
  console.log('============================');
  
  const byStrand: Record<string, any[]> = {};
  
  lrp.expectations.forEach(exp => {
    const e = exp.expectation;
    const strand = e.strand || 'General';
    if (!byStrand[strand]) byStrand[strand] = [];
    byStrand[strand].push({
      code: e.code,
      description: e.description,
      descriptionFr: e.descriptionFr
    });
  });
  
  Object.keys(byStrand).forEach(strand => {
    console.log(`\n${strand}:`);
    byStrand[strand].forEach(exp => {
      console.log(`  - ${exp.code}: ${exp.descriptionFr || exp.description}`);
    });
  });
}

checkSciencesHumaines().catch(console.error).finally(() => prisma.$disconnect());