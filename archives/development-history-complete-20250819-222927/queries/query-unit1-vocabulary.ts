#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function queryUnit1Vocabulary() {
  console.log('🔍 Checking Unit 1 "Bienvenue à l\'école!" vocabulary for progression...\n');
  
  try {
    // Find Emily's user ID
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    if (!emily) {
      console.log('❌ Emily McIsaac not found');
      return;
    }

    // Get Unit 1 "Bienvenue à l'école!"
    const unit1 = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        title: { contains: 'Bienvenue' },
        startDate: {
          gte: new Date('2025-09-01'),
          lte: new Date('2025-09-10')
        }
      },
      include: {
        expectations: {
          include: {
            expectation: true
          }
        }
      }
    });

    if (!unit1) {
      console.log('❌ Unit 1 "Bienvenue à l\'école!" not found');
      return;
    }

    console.log('🏫 UNIT 1 "BIENVENUE À L\'ÉCOLE!" VOCABULARY ANALYSIS');
    console.log('==================================================\n');
    
    console.log(`📅 Unit Overview:`);
    console.log(`Title: ${unit1.title}`);
    console.log(`Period: ${unit1.startDate?.toISOString().split('T')[0]} to ${unit1.endDate?.toISOString().split('T')[0]}\n`);

    console.log(`📚 Current Key Vocabulary:`);
    if (unit1.keyVocabulary) {
      const vocab = Array.isArray(unit1.keyVocabulary) ? 
        unit1.keyVocabulary : [unit1.keyVocabulary];
      vocab.forEach((v, i) => console.log(`${i + 1}. ${v}`));
      console.log(`\nTotal vocabulary words: ${vocab.length}`);
    } else {
      console.log('❌ No vocabulary defined in Unit 1');
    }

    console.log('\n🔍 VOCABULARY PROGRESSION ANALYSIS:');
    console.log('===================================');
    console.log('\n✅ Unit 1 should have established:');
    console.log('• Basic greetings (bonjour, au revoir, bonsoir)');
    console.log('• School spaces (classe, bureau, bibliothèque, gymnase)');
    console.log('• School people (enseignant(e), élève, directeur/directrice, ami(e))');
    console.log('• Basic emotions (content(e), nerveux/nerveuse, excité(e))');
    console.log('• School supplies (crayon, livre, sac à dos, cahier)');
    
    console.log('\n🎯 Unit 2 "Ma famille et moi" should build with:');
    console.log('• Family members vocabulary (12-15 new words)');
    console.log('• Home spaces (building on school spaces concept)');
    console.log('• Family activities (building on school activities)');
    console.log('• Emotional connections (building on basic emotions)');

    console.log('\n📝 RECOMMENDED UNIT 2 VOCABULARY LIST:');
    console.log('=====================================');
    console.log('Family Members (8 words):');
    console.log('1. maman - mommy');
    console.log('2. papa - daddy');
    console.log('3. grand-maman - grandma');
    console.log('4. grand-papa - grandpa');
    console.log('5. frère - brother');
    console.log('6. sœur - sister');
    console.log('7. bébé - baby');
    console.log('8. famille - family');
    
    console.log('\nHome Spaces (4 words):');
    console.log('9. maison - house');
    console.log('10. chambre - bedroom');
    console.log('11. cuisine - kitchen');
    console.log('12. salon - living room');
    
    console.log('\nFamily Actions (4 words):');
    console.log('13. aider - to help');
    console.log('14. jouer - to play');
    console.log('15. cuisiner - to cook');
    console.log('16. lire - to read');
    
    console.log('\nFamily Feelings (3 words):');
    console.log('17. aimer - to love');
    console.log('18. heureux/heureuse - happy');
    console.log('19. en sécurité - safe');

    console.log('\n📊 VOCABULARY PROGRESSION STRATEGY:');
    console.log('===================================');
    console.log('• TOTAL NEW WORDS: 19 (exceeds 12-15 target for variety)');
    console.log('• BUILDS ON UNIT 1: Uses same patterns (spaces, people, emotions)');
    console.log('• AGE-APPROPRIATE: Concrete, observable family concepts');
    console.log('• CULTURALLY SENSITIVE: Honors diverse family structures');
    console.log('• FRENCH IMMERSION: Emphasizes oral language first');

  } catch (error) {
    console.error('❌ Error analyzing Unit 1 vocabulary:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

queryUnit1Vocabulary()
  .then(() => console.log('\n🎉 Vocabulary analysis completed!'))
  .catch((error) => {
    console.error('💥 Vocabulary analysis failed:', error);
    process.exit(1);
  });