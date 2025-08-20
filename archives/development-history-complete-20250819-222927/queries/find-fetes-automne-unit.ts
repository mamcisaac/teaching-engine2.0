import { PrismaClient } from '@teaching-engine/database';

const prisma = new PrismaClient();

async function findFetesAutomneUnit() {
  try {
    console.log('🔍 Searching for Emily\'s "Les fêtes d\'automne" unit...\n');

    // First find Emily's user ID
    const emily = await prisma.user.findFirst({
      where: { name: 'Emily McIsaac' },
      select: { id: true, name: true }
    });

    if (!emily) {
      console.log('❌ Emily McIsaac not found in users');
      return null;
    }

    console.log(`✅ Found Emily McIsaac (ID: ${emily.id})`);

    // Check what Long Range Plans Emily has
    const emilyLRPs = await prisma.longRangePlan.findMany({
      where: {
        userId: emily.id
      },
      select: {
        id: true,
        title: true,
        subject: true,
        grade: true,
        academicYear: true
      }
    });

    console.log(`📚 Emily's Long Range Plans (${emilyLRPs.length} found):`);
    emilyLRPs.forEach(lrp => {
      console.log(`- "${lrp.title}" (${lrp.subject}, Grade ${lrp.grade}, ${lrp.academicYear})`);
    });

    // Find Emily's unit plans, specifically looking for autumn celebrations
    const emilyFetesUnits = await prisma.unitPlan.findMany({
      where: {
        userId: emily.id,
        title: {
          contains: 'fêtes'
        }
      },
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        endDate: true,
        bigIdeas: true,
        essentialQuestions: true,
        keyVocabulary: true,
        differentiationStrategies: true,
        culminatingTask: true,
        assessmentPlan: true,
        parentCommunicationPlan: true,
        communityConnections: true,
        indigenousPerspectives: true,
        longRangePlanId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (emilyFetesUnits.length === 0) {
      console.log('❌ No "Les fêtes d\'automne" unit found for Emily.');
      
      // Let's search more broadly for autumn/fall units
      const autumnUnits = await prisma.unitPlan.findMany({
        where: {
          userId: emily.id,
          OR: [
            { title: { contains: 'automne' } },
            { title: { contains: 'fête' } },
            { title: { contains: 'célébra' } }
          ]
        },
        select: {
          id: true,
          title: true,
          description: true,
          startDate: true,
          endDate: true
        }
      });

      console.log('🍂 Found these autumn-related units:');
      autumnUnits.forEach(unit => {
        console.log(`- "${unit.title}" (${unit.startDate} - ${unit.endDate})`);
      });

      // Also check all units for Emily to see the sequence
      console.log('\n📚 All units for Emily:');
      const allUnits = await prisma.unitPlan.findMany({
        where: {
          userId: emily.id
        },
        select: {
          id: true,
          title: true,
          description: true,
          startDate: true,
          endDate: true,
          longRangePlanId: true
        },
        orderBy: {
          startDate: 'asc'
        }
      });

      allUnits.forEach(unit => {
        console.log(`- "${unit.title}" (${unit.startDate} - ${unit.endDate}) [LRP: ${unit.longRangePlanId}]`);
      });

      return null;
    }

    console.log(`✅ Found ${emilyFetesUnits.length} "fêtes" unit(s)!\n`);
    
    const unit = emilyFetesUnits[0];
    
    console.log('📋 CURRENT UNIT DETAILS:');
    console.log('='.repeat(50));
    console.log(`ID: ${unit.id}`);
    console.log(`Title: ${unit.title}`);
    console.log(`Description: ${unit.description || 'No description'}`);
    console.log(`Start Date: ${unit.startDate}`);
    console.log(`End Date: ${unit.endDate}`);
    console.log(`Created: ${unit.createdAt}`);
    console.log(`Updated: ${unit.updatedAt}`);
    
    console.log('\n🎯 BIG IDEAS:');
    if (unit.bigIdeas) {
      console.log(unit.bigIdeas);
    } else {
      console.log('❌ No big ideas defined');
    }
    
    console.log('\n❓ ESSENTIAL QUESTIONS:');
    if (unit.essentialQuestions) {
      if (Array.isArray(unit.essentialQuestions)) {
        (unit.essentialQuestions as string[]).forEach((question: string, index: number) => {
          console.log(`${index + 1}. ${question}`);
        });
      } else {
        console.log(JSON.stringify(unit.essentialQuestions, null, 2));
      }
    } else {
      console.log('❌ No essential questions defined');
    }
    
    console.log('\n📚 KEY VOCABULARY:');
    if (unit.keyVocabulary) {
      console.log(JSON.stringify(unit.keyVocabulary, null, 2));
    } else {
      console.log('❌ No key vocabulary defined');
    }

    console.log('\n🎨 DIFFERENTIATION:');
    if (unit.differentiationStrategies) {
      console.log(JSON.stringify(unit.differentiationStrategies, null, 2));
    } else {
      console.log('❌ No differentiation strategies defined');
    }

    console.log('\n🎭 CULMINATING TASK:');
    console.log(unit.culminatingTask || '❌ No culminating task defined');

    console.log('\n📊 ASSESSMENT PLAN:');
    console.log(unit.assessmentPlan || '❌ No assessment plan defined');

    console.log('\n👨‍👩‍👧‍👦 PARENT COMMUNICATION:');
    console.log(unit.parentCommunicationPlan || '❌ No parent communication defined');

    console.log('\n🏘️ COMMUNITY CONNECTIONS:');
    console.log(unit.communityConnections || '❌ No community connections defined');

    console.log('\n🪶 INDIGENOUS PERSPECTIVES:');
    console.log(unit.indigenousPerspectives || '❌ No indigenous perspectives defined');

    return unit;

  } catch (error) {
    console.error('Error finding unit:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

findFetesAutomneUnit().then(() => {
  console.log('\n✅ Search completed!');
});