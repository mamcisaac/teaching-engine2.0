#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function perfectUnit6() {
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
    
    const unit6 = await prisma.unitPlan.findFirst({
      where: { 
        longRangePlanId: fpsLRP.id,
        titleFr: 'Communauté, sécurité et célébration'
      }
    });

    const perfectUnit6 = `
**UNITÉ 6: COMPÉTENCES ET CÉLÉBRATION**
*11 leçons | 5 semaines | Mai-Juin*

**QUESTION ESSENTIELLE:**
Comment puis-je utiliser tout ce que j'ai appris cette année pour continuer à grandir?

**COMPRÉHENSIONS DURABLES:**
• J'ai développé des compétences importantes que je garderai toujours
• Je suis prêt pour les défis et opportunités de Grade 2
• Mon apprentissage continue pendant l'été et au-delà

**RÉALITÉ PÉDAGOGIQUE - 11 LEÇONS SEULEMENT:**
• Focus sur culmination et intégration, PAS nouveau contenu
• Célébration des acquis plutôt qu'introduction concepts
• Qualité sur quantité - approfondissement vs couverture
• Reconnaissance fatigue juin et besoins closure

**ATTENTES CURRICULAIRES - SCOPE RÉALISTE:**
• **FPS4 (70% - 8 leçons):** Reconnaissance et célébration compétences développées
• **FPS2 (30% - 3 leçons):** Sécurité estivale et préparation transitions

**PAS D'ATTEMPT COUVRIR FPS1 ET FPS3 - DÉJÀ FAIT**

**CADRE PÉDAGOGIQUE ETFO ADAPTÉ JUIN:**
Structure flexible fin année:
• **Mise en situation (5-8 min):** Énergie positive, célébration
• **Action (25-30 min):** Démonstrations, portfolios, projets culmination
• **Consolidation (10-12 min):** Reconnaissance, promesses futures

**PROGRESSION RÉALISTE 11 LEÇONS:**
*Semaine 1 (2 leçons):* Révision compétences année
*Semaine 2 (3 leçons):* Sécurité été et transitions
*Semaine 3 (2 leçons):* Préparation Grade 2
*Semaine 4 (2 leçons):* Portfolios et réflexions
*Semaine 5 (2 leçons):* Célébration finale

**VOCABULAIRE CULMINATION:**
compétent, capable, fier, grandir, apprendre, été, Grade 2, 
continuer, promesse, célébrer, souvenir, merci, au revoir

**ÉVALUATION CÉLÉBRATIVE:**
• **Portfolios complétés:** Preuves croissance septembre-juin
• **Auto-évaluation finale:** "Je suis fier de..."
• **Démonstrations compétences:** Montrer 1 apprentissage clé
• **Certificats personnalisés:** Reconnaissance achievements spécifiques
• **Messages Grade 2:** Lettres à soi-même septembre prochain

**RÉALISME JUIN:**
• Attention spans courts
• Émotions séparation élevées
• Fatigue accumulée année
• Excitation vacances
• Besoin routine mais flexibilité

**DIFFÉRENCIATION FIN ANNÉE:**
• **Support intensif:** Célébration TOUS progrès même petits, support émotionnel transition
• **Support modéré:** Choix démonstrations, temps processing émotions
• **Extension:** Mentorat maternelles visiteurs, leadership célébrations

**FLEXIBILITÉ MAXIMALE JUIN:**

*Journées pédagogiques multiples:*
- Condensation en célébrations combinées
- Focus sur l'essentiel seulement
- Permission skip évaluations formelles

*Canicule juin:*
- Activités calmes intérieures
- Hydratation priorité
- Sessions courtes OK

*Sorties fin année:*
- Intégration comme "leçons"
- Pas double charge travail
- Flexibilité totale timeline

*Émotions séparation intenses:*
- Plus temps cercle discussion
- Activités réconfort
- Validation normalité sentiments

*Absences multiples (familles partent tôt):*
- Matériel peut partir maison
- Célébrations répétées OK
- Inclusion distance possible

**ACTIVITÉS CULMINATION RÉALISTES:**
• Création capsule temporelle Grade 1
• Livre souvenirs classe collaboratif
• Spectacle mini-démonstrations parents
• Diplômes personnalisés FPS
• Promesses été sécuritaire
• Messages vidéo pour Grade 2

**RESSOURCES MINIMALES (BUDGET ÉPUISÉ):**
• Réutilisation matériel année
• Créations élèves priorité
• Photos comme documentation
• Familles contribuent souvenirs
• Simplicité valorisée

**PAS D'INTÉGRATION FORCÉE:**
• FPS naturellement présent sans forcer
• Pas besoin "couvrir" curriculum
• Focus expérience vs contenu
• Qualité moments vs quantité

**SÉCURITÉ ÉTÉ (3 LEÇONS MAX):**
• Sécurité eau/piscine
• Protection solaire
• Rester safe pendant vacances
• Maintenir habitudes santé
• Resources familles

**COMMUNICATION FAMILLE FINALE:**
• Célébration achievements enfant
• Suggestions été continuité
• Resources communautaires
• Remerciements partenariat
• Information Grade 2

**CONSIDÉRATIONS ÉMOTIONNELLES JUIN:**
• Anxiété changement
• Tristesse séparations
• Excitation grandissement
• Fierté accomplissements
• Anticipation été

**INDICATEURS SUCCÈS RÉALISTES:**
□ Chaque élève célèbre AU MOINS 3 achievements
□ Portfolios complétés pour TOUS
□ Familles assistent célébration quelconque
□ Transition Grade 2 positive anticipée
□ Été commence avec joie pas stress
□ Souvenirs positifs année créés

**NOTE CRITIQUE:**
Cette unité ne PEUT PAS et ne DOIT PAS essayer de tout faire.
11 leçons = culmination et célébration, pas marathon final.`;

    await prisma.unitPlan.update({
      where: { id: unit6.id },
      data: { 
        description: perfectUnit6,
        successCriteria: {
          unitPlanPerfect: true,
          realisticScope: true,
          onlyTwoExpectations: true,
          culminationFocus: true,
          essentialQuestions: true,
          etfoFrameworkVisible: true,
          juneReality: true,
          concreteFlexibility: true,
          frenchConsistent: true,
          emotionalClosure: true
        }
      }
    });
    
    console.log('✅ Unit 6 perfected with realistic 11-lesson scope');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

perfectUnit6();