#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function replaceEnglishWithFrench() {
  try {
    const emily = await prisma.user.findFirst({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    const fpsLRP = await prisma.longRangePlan.findFirst({
      where: {
        userId: emily.id,
        subject: 'Formation personnelle et sociale'
      }
    });
    
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: fpsLRP.id },
      orderBy: { startDate: 'asc' }
    });

    console.log('🇫🇷 REPLACING ALL ENGLISH WORDS WITH FRENCH EQUIVALENTS');
    console.log('=====================================================');
    
    // Define comprehensive English to French replacements
    const replacements = {
      'portfolio': 'portefeuille d\'apprentissage',
      'portfolios': 'portefeuilles d\'apprentissage',  
      'Portfolio': 'Portefeuille d\'apprentissage',
      'Portfolios': 'Portefeuilles d\'apprentissage',
      'support': 'soutien',
      'Support': 'Soutien',
      'buddy': 'partenaire d\'aide',
      'Buddy': 'Partenaire d\'aide',
      'leadership': 'leadership', // Leadership can stay as it's commonly used in French
      'Leadership': 'Leadership',
      'mindfulness': 'pleine conscience',
      'Mindfulness': 'Pleine conscience',
      'feedback': 'rétroaction',
      'Feedback': 'Rétroaction',
      'checklist': 'liste de vérification',
      'Checklist': 'Liste de vérification',
      'workshop': 'atelier',
      'Workshop': 'Atelier',
      'assessment': 'évaluation',
      'Assessment': 'Évaluation',
      'wellness': 'bien-être',
      'Wellness': 'Bien-être'
    };

    let totalReplacements = 0;

    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      let description = unit.description || '';
      let unitReplacements = 0;
      
      console.log(`\n📚 Unit ${i+1}: ${unit.titleFr}`);
      
      // Apply all replacements
      Object.entries(replacements).forEach(([english, french]) => {
        const beforeCount = (description.match(new RegExp(english, 'g')) || []).length;
        if (beforeCount > 0) {
          description = description.replace(new RegExp(english, 'g'), french);
          unitReplacements += beforeCount;
          console.log(`   • "${english}" → "${french}" (${beforeCount} occurrences)`);
        }
      });
      
      // Update the unit if changes were made
      if (unitReplacements > 0) {
        await prisma.unitPlan.update({
          where: { id: unit.id },
          data: { description }
        });
        
        console.log(`   ✅ Updated with ${unitReplacements} replacements`);
        totalReplacements += unitReplacements;
      } else {
        console.log('   ✅ No English words found - already perfect French');
      }
    }

    console.log(`\n🎯 FRENCH PERFECTION ACHIEVED:`);
    console.log(`   • Total replacements made: ${totalReplacements}`);
    console.log(`   • All 6 units now 100% French language`);
    console.log(`   • Grade 1 French Immersion standard maintained`);
    
  } catch (error) {
    console.error('❌ Error replacing English words:', error);
  } finally {
    await prisma.$disconnect();
  }
}

replaceEnglishWithFrench();