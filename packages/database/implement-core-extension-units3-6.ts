#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function implementCoreExtensionUnits3to6() {
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

    // Unit 3: Emotions and Relations (18 lessons = 13 core + 5 extension)
    const coreExtensionUnit3 = `**UNITÉ 3: ÉMOTIONS ET RELATIONS**
*18 leçons | 7 semaines | 6 janvier - 21 février (POST-VACANCES)*

**QUESTION ESSENTIELLE:**
Comment puis-je comprendre mes émotions et créer des relations positives avec les autres?

**COMPRÉHENSIONS DURABLES:**
• Toutes mes émotions sont normales et j'ai des moyens respectueux de les exprimer
• Je peux développer des amitiés saines en pratiquant l'écoute et la gentillesse
• Les conflits font partie de la vie et je peux apprendre à les résoudre paisiblement

**🎯 MODÈLE CŒUR + EXTENSION (POST-WINTER BREAK)**

**CŒUR UNIVERSEL (72% - 13 leçons):**
Compétences émotionnelles et relationnelles essentielles pour TOUS:

*Leçons 1-4: Reconnaissance et expression émotionnelles personnelles*
- CŒUR: Identifier émotions de base, expressions faciales, corps émotionnel
- Techniques expression individuelle sans obligation partage personnel

*Leçons 5-7: Autorégulation et stratégies calme individuelles*
- CŒUR: Respiration calme, techniques apaisement, espace personnel
- Outils utilisables indépendamment de support familial

*Leçons 8-10: Habiletés sociales de base et communication*
- CŒUR: Écouter, attendre son tour, politesse, respect personnel
- Compétences applicables avec pairs école

*Leçons 11-13: Résolution conflits et médiation simple*
- CŒUR: Stratégies "je" message, compromis, demander aide adulte
- Techniques utilisables dans contexte scolaire sécuritaire

**EXTENSIONS OPTIONNELLES (28% - 5 leçons):**
Connexions relationnelles enrichissantes selon situations familiales:

*Leçon Extension 1: Émotions familiales et traditions*
- Partage VOLONTAIRE façons familles gèrent émotions
- Alternatives pour situations familiales instables

*Leçon Extension 2: Amitiés extrascolaires et communautaires*
- Exploration amitiés quartier, clubs, activités
- Selon accessibilité et stabilité situation

*Leçons Extension 3-5: Projets empathie et leadership relationnel*
- Création projets gentillesse, mentorat émotionnel
- Initiatives selon maturité et intérêts individuels

**STRUCTURE POST-VACANCES ALTERNÉE:**
*Semaines 1-2: Reconnexion + Expression*
*Semaines 3-4: Autorégulation + Communication*
*Semaines 5-6: Relations + Résolution conflits*
*Semaine 7: Extensions + Consolidation*`;

    // Unit 4: Nutrition and Energy (15 lessons = 11 core + 4 extension)
    const coreExtensionUnit4 = `**UNITÉ 4: NUTRITION ET ÉNERGIE**
*15 leçons | 6 semaines | 24 février - 4 avril*

**QUESTION ESSENTIELLE:**
Comment puis-je faire des choix qui donnent de l'énergie à mon corps pour apprendre et grandir?

**COMPRÉHENSIONS DURABLES:**
• Mon corps a besoin de différents types de nourriture pour avoir de l'énergie
• Le mouvement et le repos m'aident à me sentir fort et heureux
• Je peux faire des choix santé même quand les options sont limitées

**🎯 MODÈLE CŒUR + EXTENSION (NO FOOD SHAMING)**

**CŒUR UNIVERSEL (73% - 11 leçons):**
Concepts nutritionnels et énergie accessibles INDÉPENDAMMENT des ressources familiales:

*Leçons 1-3: Énergie corporelle et signaux corps*
- CŒUR: Faim, soif, fatigue, énergie - signaux universels
- Écoute corporelle personnelle sans référence repas spécifiques

*Leçons 4-6: Groupes alimentaires et fonction énergie*
- CŒUR: Types aliments (fruits, légumes, grains, protéines) pour énergie
- Exploration visuelle/tactile sans exigence consommation

*Leçons 7-8: Mouvement énergie et repos équilibre*
- CŒUR: Comment mouvement donne énergie, importance repos
- Activités classe utilisables par tous

*Leçons 9-11: Choix santé personnels et accessibles*
- CŒUR: Stratégies choix santé avec options limitées
- Focus sur contrôle personnel vs circonstances

**EXTENSIONS OPTIONNELLES (27% - 4 leçons):**
Connexions nutritionnelles selon ressources familiales disponibles:

*Leçon Extension 1: Traditions alimentaires familiales*
- Partage VOLONTAIRE cultures culinaires si confortable
- Respect situations alimentaires diverses

*Leçon Extension 2: Jardinage et production alimentaire*
- Exploration origine aliments si ressources permettent
- Alternatives urbaines selon environnement

*Leçons Extension 3-4: Préparation simple et créativité culinaire*
- Activités selon ressources cuisine disponibles
- Focus créativité vs équipement coûteux

**SENSIBILITÉ ÉCONOMIQUE INTÉGRÉE:**
- Aucune activité nécessitant achats familiaux
- Célébration débrouillardise et créativité
- Focus fonction vs coût ou apparence`;

    // Unit 5: Movement and Wellbeing (18 lessons = 13 core + 5 extension)
    const coreExtensionUnit5 = `**UNITÉ 5: MOUVEMENT ET BIEN-ÊTRE**
*18 leçons | 7 semaines | 7 avril - 23 mai*

**QUESTION ESSENTIELLE:**
Comment le mouvement et l'activité m'aident-ils à me sentir bien dans mon corps et mon esprit?

**COMPRÉHENSIONS DURABLES:**
• Mon corps est fait pour bouger et le mouvement me rend plus heureux
• Il y a beaucoup de façons différentes d'être actif et de prendre soin de soi
• Je peux adapter l'activité à mes capacités et mes intérêts personnels

**🎯 MODÈLE CŒUR + EXTENSION (INCLUSIVE MOVEMENT)**

**CŒUR UNIVERSEL (72% - 13 leçons):**
Concepts mouvement et bien-être accessibles à TOUTES les capacités physiques:

*Leçons 1-4: Mouvement corporel de base et conscience corporelle*
- CŒUR: Étirements, marche, mouvement doux accessible tous
- Adaptation automatique capacités individuelles

*Leçons 5-7: Activité joyeuse et jeux inclusifs*
- CŒUR: Jeux adaptables, mouvement créatif, danse libre
- Sans équipement spécialisé ou espaces spécifiques

*Leçons 8-10: Repos, relaxation et récupération*
- CŒUR: Techniques relaxation, sommeil, temps calme
- Stratégies applicables dans environnements variés

*Leçons 11-13: Bien-être global et choix personnels*
- CŒUR: Connection mouvement-émotions, choix individuels
- Focus autonomie personnelle vs comparaison

**EXTENSIONS OPTIONNELLES (28% - 5 leçons):**
Applications mouvement selon ressources et intérêts familiaux:

*Leçon Extension 1: Activités familiales et traditions*
- Partage VOLONTAIRE activités familiales si approprié
- Respect situations familiales diverses

*Leçon Extension 2: Sports et activités communautaires*
- Exploration options selon disponibilité et accessibilité
- Aucune pression participation coûteuse

*Leçons Extension 3-5: Leadership mouvement et projets bien-être*
- Création activités pairs, initiatives personnelles
- Selon maturité et intérêts individuels`;

    // Unit 6: Community and Celebration (11 lessons = 8 core + 3 extension)
    const coreExtensionUnit6 = `**UNITÉ 6: COMMUNAUTÉ, SÉCURITÉ ET CÉLÉBRATION**
*11 leçons | 4 semaines | 26 mai - 19 juin*

**QUESTION ESSENTIELLE:**
Comment puis-je utiliser mes apprentissages pour contribuer à ma communauté et célébrer ma croissance?

**COMPRÉHENSIONS DURABLES:**
• J'ai appris beaucoup cette année et je peux partager mes compétences
• Je fais partie de plusieurs communautés et je peux contribuer positivement
• Célébrer nos apprentissages nous aide à nous préparer pour l'avenir

**🎯 MODÈLE CŒUR + EXTENSION (END-OF-YEAR REALISTIC)**

**CŒUR UNIVERSEL (73% - 8 leçons):**
Célébration et contributions accessibles à TOUS indépendamment situation familiale:

*Leçons 1-3: Reconnaissance apprentissages personnels année*
- CŒUR: Portefeuille d'apprentissage individuel, croissance personnelle
- Célébration réussites sans comparaison familiale

*Leçons 4-5: Sécurité été et transitions*
- CŒUR: Sécurité vacances, maintien habitudes santé
- Messages universels indépendamment plans familiaux

*Leçons 6-8: Contributions communauté classe et école*
- CŒUR: Aide classe, reconnaissance pairs, gentillesse
- Actions réalisables contexte scolaire pour tous

**EXTENSIONS OPTIONNELLES (27% - 3 leçons):**
Connexions communautaires selon possibilités familiales:

*Leçon Extension 1: Contributions familiales et reconnaissance*
- Partage VOLONTAIRE façons aider famille si approprié
- Alternatives pour situations instables

*Leçon Extension 2: Projets communautaires et service*
- Initiatives selon ressources et intérêts
- Participation volontaire sans pression

*Leçon Extension 3: Célébrations et traditions*
- Reconnaissance diversité célébrations
- Inclusion totale indépendamment ressources`;

    console.log('🔄 Implementing Core + Extension model for Units 3-6...\n');

    // Apply Unit 3
    await prisma.unitPlan.update({
      where: { id: units[2].id }, // Unit 3
      data: { description: coreExtensionUnit3 }
    });
    console.log('✅ Unit 3 enhanced: Core (72% - 13 lessons) + Extensions (28% - 5 lessons)');

    // Apply Unit 4
    await prisma.unitPlan.update({
      where: { id: units[3].id }, // Unit 4
      data: { description: coreExtensionUnit4 }
    });
    console.log('✅ Unit 4 enhanced: Core (73% - 11 lessons) + Extensions (27% - 4 lessons)');

    // Apply Unit 5
    await prisma.unitPlan.update({
      where: { id: units[4].id }, // Unit 5
      data: { description: coreExtensionUnit5 }
    });
    console.log('✅ Unit 5 enhanced: Core (72% - 13 lessons) + Extensions (28% - 5 lessons)');

    // Apply Unit 6
    await prisma.unitPlan.update({
      where: { id: units[5].id }, // Unit 6
      data: { description: coreExtensionUnit6 }
    });
    console.log('✅ Unit 6 enhanced: Core (73% - 8 lessons) + Extensions (27% - 3 lessons)');

    console.log(`\n🎯 CORE + EXTENSION MODEL IMPLEMENTATION COMPLETED:`);
    console.log(`   • All 6 units now have 70-73% core + 27-30% extension structure`);
    console.log(`   • Core content accessible to ALL students regardless of family situation`);
    console.log(`   • Extensions completely optional and trauma-informed`);
    console.log(`   • Daily consecutive instruction structure integrated`);
    console.log(`   • Maximum pedagogical flexibility achieved for Emily`);
    
  } catch (error) {
    console.error('❌ Error implementing Core + Extension models:', error);
  } finally {
    await prisma.$disconnect();
  }
}

implementCoreExtensionUnits3to6();