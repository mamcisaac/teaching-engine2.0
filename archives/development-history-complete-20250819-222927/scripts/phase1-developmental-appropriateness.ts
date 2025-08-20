import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function phase1DevelopmentalAppropriateness() {
  try {
    console.log('🎯 PHASE 1: MAKING UNITS DEVELOPMENTALLY APPROPRIATE FOR GRADE 1\n');
    
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98h0001vjr1cvh4knsh' },
      orderBy: { startDate: 'asc' }
    });

    // Unit 1: Bienvenue à l'école française
    await prisma.unitPlan.update({
      where: { id: units[0].id },
      data: {
        essentialQuestions: [
          "Semaine 1: Comment dire bonjour à mes amis?",
          "Semaine 2: Quels mots français j'utilise chaque jour?", 
          "Semaine 3: Comment demander de l'aide en français?",
          "Semaine 4: Qu'est-ce que j'aime dans ma classe française?"
        ],
        keyVocabulary: ["bonjour", "au revoir", "merci", "s'il vous plaît", "oui", "non", "école", "ami", "professeur", "livre", "crayon", "eau", "toilette", "aide", "Je m'appelle"]
      }
    });
    console.log('✅ Unit 1: Simplified questions to concrete, daily experiences');

    // Unit 2: Les merveilles de l'automne  
    await prisma.unitPlan.update({
      where: { id: units[1].id },
      data: {
        essentialQuestions: [
          "Semaine 1: Qu'est-ce que je vois dehors en automne?",
          "Semaine 2: Quelles couleurs d'automne puis-je nommer?",
          "Semaine 3: Comment les animaux se préparent-ils pour l'hiver?",
          "Semaine 4: Qu'est-ce que j'ai appris sur l'automne?"
        ],
        keyVocabulary: ["automne", "feuille", "arbre", "rouge", "orange", "jaune", "brun", "vent", "froid", "écureuil", "oiseau", "pomme", "citrouille", "tomber", "changer"]
      }
    });
    console.log('✅ Unit 2: Reduced from 40+ words to 15 core autumn terms');

    // Unit 3: Contes et traditions automnales
    await prisma.unitPlan.update({
      where: { id: units[2].id },
      data: {
        essentialQuestions: [
          "Semaine 1: Quelles histoires aimons-nous en automne?",
          "Semaine 2: Qui sont les personnages dans nos histoires?",
          "Semaine 3: Comment notre famille célèbre-t-elle l'automne?",
          "Semaine 4: Quelle est mon histoire d'automne préférée?"
        ],
        keyVocabulary: ["histoire", "conte", "personnage", "début", "fin", "famille", "tradition", "Halloween", "Thanksgiving", "célébrer", "partager", "écouter", "raconter", "aimer", "préféré"]
      }
    });
    console.log('✅ Unit 3: Questions focus on personal connections to stories');

    // Unit 4: Ma famille et mes racines
    await prisma.unitPlan.update({
      where: { id: units[3].id },
      data: {
        essentialQuestions: [
          "Semaine 1: Qui fait partie de ma famille?",
          "Semaine 2: Qu'est-ce qui rend ma famille spéciale?",
          "Semaine 3: Quelles traditions fait ma famille?",
          "Semaine 4: Comment présenter ma famille à mes amis?"
        ],
        keyVocabulary: ["famille", "maman", "papa", "frère", "sœur", "grand-mère", "grand-père", "bébé", "maison", "amour", "spécial", "tradition", "photo", "ensemble", "fier"]
      }
    });
    console.log('✅ Unit 4: Simplified to concrete family experiences');

    // Unit 5: Célébrations d'hiver
    await prisma.unitPlan.update({
      where: { id: units[4].id },
      data: {
        essentialQuestions: [
          "Semaine 1: Comment ma famille a-t-elle célébré les vacances?",
          "Semaine 2: Quelles fêtes d'hiver connaissons-nous?",
          "Semaine 3: Qu'est-ce qui rend les fêtes amusantes?",
          "Semaine 4: Comment partager nos célébrations avec respect?"
        ],
        keyVocabulary: ["hiver", "fête", "célébration", "Noël", "cadeau", "famille", "neige", "lumière", "joie", "partager", "tradition", "vacances", "amusant", "respect", "ensemble"]
      }
    });
    console.log('✅ Unit 5: Questions about personal celebration experiences');

    // Unit 6: Poésie et rythmes français
    await prisma.unitPlan.update({
      where: { id: units[5].id },
      data: {
        essentialQuestions: [
          "Semaine 1: Quels sons français puis-je entendre?",
          "Semaine 2: Comment chanter mes chansons françaises préférées?",
          "Semaine 3: Quels mots riment ensemble?",
          "Semaine 4: Comment créer ma propre chanson française?"
        ],
        keyVocabulary: ["chanson", "poème", "rimer", "son", "voix", "chanter", "écouter", "répéter", "rythme", "fort", "doux", "ensemble", "amusant", "créer", "préféré"]
      }
    });
    console.log('✅ Unit 6: Focused on enjoyable sound exploration');

    // Unit 7: Histoires qui grandissent
    await prisma.unitPlan.update({
      where: { id: units[6].id },
      data: {
        essentialQuestions: [
          "Semaine 1: Qu'est-ce qui arrive dans mes histoires préférées?",
          "Semaine 2: Comment les personnages changent-ils?",
          "Semaine 3: Qu'est-ce qui va arriver ensuite?",
          "Semaine 4: Comment ai-je grandi comme lecteur?"
        ],
        keyVocabulary: ["histoire", "personnage", "début", "milieu", "fin", "changer", "grandir", "ensuite", "prédire", "lire", "comprendre", "apprendre", "livre", "page", "favorit"]
      }
    });
    console.log('✅ Unit 7: Questions about story understanding');

    // Unit 8: Jeunes auteurs créatifs
    await prisma.unitPlan.update({
      where: { id: units[7].id },
      data: {
        essentialQuestions: [
          "Semaine 1: Qu'est-ce que je veux écrire?",
          "Semaine 2: Comment créer des personnages intéressants?",
          "Semaine 3: Comment améliorer mon histoire?",
          "Semaine 4: Comment partager mon histoire avec fierté?"
        ],
        keyVocabulary: ["écrire", "histoire", "idée", "personnage", "créer", "améliorer", "réviser", "partager", "fier", "auteur", "livre", "dessiner", "publier", "présenter", "bravo"]
      }
    });
    console.log('✅ Unit 8: Writing process simplified for Grade 1');

    // Unit 9: Explorateurs de textes  
    await prisma.unitPlan.update({
      where: { id: units[8].id },
      data: {
        essentialQuestions: [
          "Semaine 1: Comment poser de bonnes questions?",
          "Semaine 2: Où trouver des réponses à mes questions?",
          "Semaine 3: Qu'est-ce que j'ai découvert de nouveau?",
          "Semaine 4: Comment enseigner aux autres ce que j'ai appris?"
        ],
        keyVocabulary: ["question", "réponse", "chercher", "trouver", "apprendre", "découvrir", "livre", "information", "enseigner", "partager", "nouveau", "intéressant", "vrai", "expliquer", "savoir"]
      }
    });
    console.log('✅ Unit 9: Research simplified to questioning and discovering');

    // Unit 10: Notre odyssée française
    await prisma.unitPlan.update({
      where: { id: units[9].id },
      data: {
        essentialQuestions: [
          "Semaine 1: Qu'est-ce que j'ai appris en français cette année?",
          "Semaine 2: De quoi suis-je le plus fier?",
          "Semaine 3: Comment puis-je aider d'autres enfants?",
          "Semaine 4: Qu'est-ce que je veux apprendre en 2e année?"
        ],
        keyVocabulary: ["apprendre", "français", "année", "fier", "grandir", "aider", "enseigner", "partager", "futur", "2e année", "continuer", "réussir", "célébrer", "merci", "au revoir"]
      }
    });
    console.log('✅ Unit 10: Celebration and reflection questions for Grade 1');

    console.log('\n🎉 PHASE 1 COMPLETE:');
    console.log('✅ All essential questions simplified for 6-year-old comprehension');
    console.log('✅ Vocabulary reduced to 15-20 core terms per unit');
    console.log('✅ Questions focus on concrete experiences and personal connections');
    console.log('✅ Language appropriate for Grade 1 French Immersion students');

  } catch (error) {
    console.error('Error in Phase 1:', error);
  } finally {
    await prisma.$disconnect();
  }
}

phase1DevelopmentalAppropriateness();