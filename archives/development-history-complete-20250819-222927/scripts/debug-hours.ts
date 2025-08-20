import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugHours() {
  console.log('🔍 DEBUGGING HOUR UPDATE ISSUE\\n');
  
  const frenchLRP = await prisma.longRangePlan.findFirst({
    where: { subject: { contains: 'Français' } }
  });
  
  const units = await prisma.unitPlan.findMany({
    where: { longRangePlanId: frenchLRP.id },
    orderBy: { startDate: 'asc' }
  });
  
  console.log('📊 DETAILED CURRENT STATE:');
  units.forEach((unit, i) => {
    console.log(`Unit ${i+1}: ID=${unit.id.substring(0,8)}... Hours=${unit.estimatedHours} (type: ${typeof unit.estimatedHours})`);
  });
  
  // Try updating just one unit to test
  console.log('\\n🧪 TESTING SINGLE UPDATE:');
  const testUnit = units[5]; // Unit 6
  console.log(`Updating Unit 6 (${testUnit.id}) from ${testUnit.estimatedHours} to 14.25`);
  
  const result = await prisma.unitPlan.update({
    where: { id: testUnit.id },
    data: { estimatedHours: 14.25 }
  });
  
  console.log(`Update result: ${result.estimatedHours} (type: ${typeof result.estimatedHours})`);
  
  // Fetch fresh to verify
  const fresh = await prisma.unitPlan.findUnique({
    where: { id: testUnit.id }
  });
  
  console.log(`Fresh fetch result: ${fresh.estimatedHours} (type: ${typeof fresh.estimatedHours})`);
  
  // Check if it's a database type issue
  console.log('\\n🔍 INVESTIGATING DATABASE TYPE CONSTRAINTS:');
  
  // Try various decimal values
  const testValues = [14.25, 14.5, 14.75, 15.0];
  
  for (const value of testValues) {
    try {
      const testResult = await prisma.unitPlan.update({
        where: { id: testUnit.id },
        data: { estimatedHours: value }
      });
      console.log(`✅ Value ${value} successfully saved as: ${testResult.estimatedHours}`);
    } catch (error) {
      console.log(`❌ Value ${value} failed: ${error.message}`);
    }
  }
  
  await prisma.$disconnect();
}

debugHours().catch(console.error);