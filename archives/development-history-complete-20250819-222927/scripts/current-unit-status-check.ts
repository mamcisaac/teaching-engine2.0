import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCurrentUnitStatus() {
  console.log('📋 CHECKING CURRENT UNIT PLAN STATUS FOR EMILY\\n');
  
  // Find Emily's user ID
  const emily = await prisma.user.findFirst({
    where: {
      OR: [
        { email: { contains: 'emily' } },
        { name: { contains: 'Emily' } }
      ]
    }
  });
  
  if (!emily) {
    console.log('❌ Emily user not found');
    return;
  }
  
  console.log(`👤 Found Emily: ${emily.name} (ID: ${emily.id})\\n`);
  
  // Get all LRPs
  const lrps = await prisma.longRangePlan.findMany({
    where: { userId: emily.id },
    include: {
      unitPlans: {
        orderBy: { startDate: 'asc' }
      }
    },
    orderBy: { subject: 'asc' }
  });
  
  console.log('📚 SUBJECTS AND UNIT COUNTS:\\n');
  
  function countSchoolDays(start: Date, end: Date): number {
    let count = 0;
    const current = new Date(start);
    const holidays = [
      '2025-10-13', '2025-11-11', 
      '2025-12-22', '2025-12-23', '2025-12-24', '2025-12-25', '2025-12-26',
      '2025-12-29', '2025-12-30', '2025-12-31', '2026-01-01', '2026-01-02',
      '2026-02-16', '2026-03-09', '2026-03-10', '2026-03-11', '2026-03-12', '2026-03-13',
      '2026-04-10', '2026-04-13', '2026-05-18'
    ];
    
    while (current <= end) {
      const day = current.getDay();
      const dateStr = current.toISOString().split('T')[0];
      
      if (day !== 0 && day !== 6 && !holidays.includes(dateStr)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  }
  
  for (const lrp of lrps) {
    const isDaily = !lrp.subject.includes('Sciences humaines') && !lrp.subject.includes('Formation personnelle');
    const expectedUnits = lrp.subject.includes('Formation personnelle') ? 5 : 'varies';
    const expectedLessons = isDaily ? 195 : (lrp.subject.includes('Sciences humaines') ? 97 : 98);
    
    let totalSchoolDays = 0;
    let totalHours = 0;
    
    console.log(`${lrp.subject}:`);
    console.log(`  Units: ${lrp.unitPlans.length} (expected: ${expectedUnits})`);
    
    for (const unit of lrp.unitPlans) {
      const schoolDays = countSchoolDays(unit.startDate, unit.endDate);
      totalSchoolDays += schoolDays;
      totalHours += unit.estimatedHours || 0;
      
      console.log(`    ${unit.title}: ${schoolDays} school days, ${unit.estimatedHours}h`);
    }
    
    const status = Math.abs(totalSchoolDays - expectedLessons) <= 5 ? '✅' : '❌';
    console.log(`  ${status} Total: ${totalSchoolDays} days (expected: ${expectedLessons}), ${totalHours}h\\n`);
  }
  
  // Check missing fields in Health/FPS Unit 6
  const healthLrp = lrps.find(lrp => lrp.subject.includes('Formation personnelle'));
  if (healthLrp && healthLrp.unitPlans.length >= 6) {
    const unit6 = healthLrp.unitPlans[5];
    console.log('🔍 CHECKING HEALTH/FPS UNIT 6 COMPLETENESS:\\n');
    
    const fields = [
      'description', 'assessmentPlan', 'differentiationStrategies', 'indigenousPerspectives'
    ];
    
    for (const field of fields) {
      const value = unit6[field as keyof typeof unit6];
      const status = value ? '✅' : '❌';
      console.log(`  ${status} ${field}: ${value ? 'Present' : 'Missing'}`);
    }
  }
  
  await prisma.$disconnect();
}

checkCurrentUnitStatus().catch(console.error);