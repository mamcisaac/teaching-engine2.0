#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAutumnFetesUnit() {
  console.log('🔍 Checking Agent 4 progress on "Les fêtes d\'automne" unit...\n');
  
  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    if (!emily) {
      console.log('❌ Emily not found');
      return;
    }

    const fetesUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        title: { contains: 'fêtes' },
        startDate: { gte: new Date('2025-10-20') }
      }
    });

    if (fetesUnit) {
      console.log('✅ FOUND "LES FÊTES D\'AUTOMNE" UNIT');
      console.log('================================');
      console.log(`Title: ${fetesUnit.title}`);
      console.log(`Period: ${fetesUnit.startDate?.toISOString().split('T')[0]} to ${fetesUnit.endDate?.toISOString().split('T')[0]}`);
      console.log(`Last Updated: ${fetesUnit.updatedAt?.toISOString()}`);
      console.log(`Has Key Vocabulary: ${!!fetesUnit.keyVocabulary}`);
      console.log(`Has Assessment Plan: ${!!fetesUnit.assessmentPlan}`);
      console.log(`Has Differentiation: ${!!fetesUnit.differentiationStrategies}`);
      console.log(`Has Parent Communication: ${!!fetesUnit.parentCommunicationPlan}`);
      console.log(`Has Community Connections: ${!!fetesUnit.communityConnections}`);
      console.log(`Has Indigenous Perspectives: ${!!fetesUnit.indigenousPerspectives}`);
      
      // Check if recently updated (within last 10 minutes)
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const recentlyUpdated = fetesUnit.updatedAt && fetesUnit.updatedAt > tenMinutesAgo;
      
      if (recentlyUpdated) {
        console.log('\n🎯 AGENT 4 COMPLETION STATUS: ✅ RECENTLY UPDATED');
        console.log('Unit appears to have been perfected by Agent 4!');
      } else {
        console.log('\n⏳ AGENT 4 COMPLETION STATUS: ⏳ NEEDS PERFECTION');
        console.log('Unit exists but may need Agent 4 perfection work.');
      }

    } else {
      console.log('❌ "Les fêtes d\'automne" unit not found');
      console.log('Checking all units for Emily...\n');
      
      const allUnits = await prisma.unitPlan.findMany({
        where: { userId: emily.id },
        orderBy: { startDate: 'asc' }
      });
      
      console.log(`Found ${allUnits.length} total units:`);
      allUnits.forEach((unit, i) => {
        console.log(`${i + 1}. "${unit.title}" - ${unit.startDate?.toISOString().split('T')[0]}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking fêtes unit:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAutumnFetesUnit()
  .then(() => console.log('\n✅ Check completed'))
  .catch(error => {
    console.error('❌ Check failed:', error);
    process.exit(1);
  });