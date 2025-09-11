#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function implementCoreExtensionUnit1() {
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
    
    const unit1 = await prisma.unitPlan.findFirst({
      where: { 
        longRangePlanId: fpsLRP.id,
        titleFr: 'Moi et ma santé'
      }
    });

    const coreExtensionUnit1 = `**UNITÉ 1: MOI ET MA SANTÉ**
*17 leçons | 7 semaines | 2 septembre - 17 octobre*

**QUESTION ESSENTIELLE:**
Comment puis-je développer des habitudes quotidiennes qui gardent mon corps et mon esprit en santé?

**COMPRÉHENSIONS DURABLES:**
• Mon corps grandit et change, et j'ai le pouvoir de l'aider à rester fort et en santé
• Les habitudes que je développe maintenant m'aideront toute ma vie  
• Prendre soin de moi me donne plus d'énergie pour apprendre et jouer

**🎯 MODÈLE CŒUR + EXTENSION (TRAUMA-INFORMED)**

**CŒUR UNIVERSEL (70% - 12 leçons):**
Contenu accessible à TOUS les élèves, indépendamment de la situation familiale:

*Leçons 1-3: Connaissance corporelle personnelle*
- CŒUR: Mon corps unique, croissance individuelle, parties du corps
- Aucune comparaison familiale requise, focus sur l'individu

*Leçons 4-6: Hygiène personnelle autonome*
- CŒUR: Techniques brossage, lavage mains, soins personnels de base
- Utilisation matériel école, démonstrations individuelles

*Leçons 7-9: Nutrition et énergie personnelle*
- CŒUR: Aliments énergie vs repos, écouter son corps, choix individuels
- Exploration sans référence aux lunch familiaux ou restrictions

*Leçons 10-12: Sécurité corporelle et limites*
- CŒUR: Limites personnelles, toucher approprié, dire non
- Protocoles sécuritaires universels sans divulgation familiale

**EXTENSIONS OPTIONNELLES (30% - 5 leçons):**
Connexions enrichissantes pour élèves pouvant engager famille/communauté:

*Leçon Extension 1: Traditions santé familiales*
- Partage VOLONTAIRE coutumes familiales santé
- Alternatives pour élèves sans traditions stables

*Leçon Extension 2: Helpers santé communautaires*
- Exploration métiers santé, invités potentiels
- Participation selon confort et disponibilité

*Leçons Extension 3-5: Applications avancées et projets*
- Création projets personnels, recherche approfondie
- Mentorship pairs, initiatives personnelles

**ATTENTES CURRICULAIRES (SELON LRP PROTÉGÉ):**
• **FPS1 (70% - 12 leçons):** Démontrer compréhension pratiques santé physique
• **FPS4 (30% - 5 leçons):** Utiliser connaissances développer compétences personnelles

**STRUCTURE ALTERNÉE INTÉGRÉE (EVERY-OTHER-DAY):**

*Semaine 1 (2 leçons): Ma + Je*
- Ma (Lundi): Exploration corps personnel, identité physique unique
- Je (Mercredi): Reconnaissance croissance individuelle, capacités personnelles

*Semaine 2 (2 leçons): Moi + Mon*  
- Moi (Lundi): Techniques hygiène de base, démonstrations individuelles
- Mon (Mercredi): Routines personnelles, choix autonomes quotidiens

*Semaine 3 (3 leçons): Corps + Santé + Énergie*
- Corps (Lundi): Nutrition énergie personnelle, écoute corporelle
- Santé (Mercredi): Choix alimentaires individuels, besoins personnels
- Énergie (Vendredi): [Semaine 3 jours - Action Grâce]

*Semaines 4-5 (4 leçons): Sécurité + Limites + Autonomie + Compétences*
- Alternance focus sécurité personnelle et développement autonomie

*Semaines 6-7 (6 leçons): Extensions optionnelles + Consolidation*
- Cœur + Extension selon capacités et confort élèves

**CADRE PÉDAGOGIQUE ETFO ADAPTÉ ALTERNANCE:**

**Structure 45 minutes optimisée pour retention sur 2 jours:**
• **Mise en situation (10 min):** Reconnexion douce + rappel concept précédent
• **Action (25 min):** Apprentissage cœur + extension selon capacités
• **Consolidation (10 min):** Ancrage personnel + préparation prochaine fois

**VOCABULAIRE ESSENTIEL INTÉGRÉ:**
santé, corps, grandir, fort, hygiène, propre, brosser, laver, nutritif,
énergie, bouger, repos, habitude, routine, choisir, capable, autonome, responsable

**ÉVALUATION TRAUMA-INFORMED AUTHENTIQUE:**

**CŒUR (Accessible tous):**
• **Observations individuelles:** Application habitudes hygiène personnelle
• **Portefeuille d'apprentissage individuel:** Photos progrès SANS famille
• **Auto-évaluation adaptée:** Outils visuels réflexion personnelle
• **Démonstrations individuelles:** Techniques acquises, progression personnelle

**EXTENSIONS (Optionnelles):**
• **Projets familiaux VOLONTAIRES:** Partage traditions SI confortable
• **Connexions communautaires:** Exploration helpers SI possible
• **Applications avancées:** Recherche approfondie SI intérêt

**DIFFÉRENCIATION CŒUR + EXTENSION SYSTÉMATIQUE:**

**Soutien intensif:**
- Focus EXCLUSIF contenu cœur, extensions complètement optionnelles
- Partenaire d'aide constant, supports visuels permanents
- Objectifs simplifiés (3 habitudes vs 5), temps supplémentaire

**Soutien modéré:**  
- Contenu cœur maîtrisé + extensions selon confort
- Choix modalités participation, aide ponctuelle
- Adaptations selon besoins révélés

**Extension enrichissement:**
- Maîtrise cœur rapide + engagement extensions multiples  
- Mentorat pairs contenu cœur, création ressources classe
- Projets personnels approfondis, connexions avancées

**PROTOCOLES TRAUMA-INFORMED PERFECTIONNÉS:**

**CŒUR SÉCURITAIRE GARANTI:**
- Aucune obligation partage informations familiales
- Apprentissages basés ressources école exclusivement
- Validation expériences INDIVIDUELLES sans comparaison
- Support inconditionnel indépendamment situation maison

**EXTENSIONS VOLONTAIRES SEULEMENT:**
- Invitations douces sans pression participation
- Alternatives automatiques pour non-participants
- Célébration engagement ET non-engagement
- Respect total limites individuelles

**FLEXIBILITÉ ALTERNANCE CONCRÈTE:**

*Jour "off" inattendu (maladie, fermeture):*
- Matériel de révision envoyé selon capacités familiales
- Rattrapage naturel focus cœur vs extension manquée
- Aucune pression performance malgré interruption
- Adaptation timeline selon disruptions réelles

*Élève absent plusieurs jours alternance:*
- Focus exclusif contenu cœur au retour
- Extensions reportées selon confort et récupération
- Rattrapage individualisé sans stress groupe
- Maintien relations positives malgré absences

*Fatigue collective fin alternance:*
- Réduction à contenu cœur essentiel seulement
- Extensions transformées en activités reposantes  
- Permission sessions plus courtes sans culpabilité
- Bien-être priorité sur couverture exhaustive

**CONSIDÉRATIONS DÉVELOPPEMENTALES GRADE 1 ALTERNANCE:**

• **Attention span 15-20 min max:** Segments courts avec mouvement
• **Retention sur 2 jours:** Rappels visuels et kinesthésiques fréquents  
• **Besoin routine prévisible:** Structure identique chaque alternance
• **Apprentissage expérientiel:** Manipulation, exploration, découverte
• **Validation constante:** Efforts célébrés vs perfection résultats

**INTÉGRATION INTERDISCIPLINAIRE NATURELLE CŒUR:**

• **Français:** Vocabulaire corps/santé personnel, expression besoins individuels
• **Mathématiques:** Compter minutes brossage, mesurer croissance personnelle
• **Sciences:** Corps humain individuel, besoins vivants universels
• **Arts:** Autoportraits, création personnelle, expression individuelle

**SENSIBILITÉS ÉCONOMIQUES INTÉGRÉES:**

**CŒUR (Coût zéro):**
- Toutes ressources fournies école
- Techniques applicables avec matériel minimal
- Alternatives économiques pour toutes recommandations
- Aucune demande ressources familiales

**EXTENSIONS (Participation volontaire):**
- Contributions familiales STRICTEMENT volontaires
- Alternatives créatives si ressources limitées
- Célébration effort vs ressources disponibles
- Support discret selon besoins identifiés

**INDICATEURS SUCCÈS CŒUR + EXTENSION:**

**CŒUR (Tous élèves):**
□ 100% élèves maîtrisent 3+ habitudes hygiène autonomes
□ Portefeuille d'apprentissage démontre croissance personnelle septembre-octobre
□ Vocabulaire santé utilisé spontanément conversations individuelles
□ Auto-évaluation positive: "Je suis capable prendre soin de moi"

**EXTENSIONS (Participation volontaire):**
□ Élèves participants partagent traditions familiales avec respect
□ Connexions communautaires établies selon possibilités
□ Projets personnels complétés selon intérêts individuels
□ Mentorship positif entre élèves engagés extensions`;

    await prisma.unitPlan.update({
      where: { id: unit1.id },
      data: { 
        description: coreExtensionUnit1
      }
    });
    
    console.log('✅ Unit 1 enhanced with Core + Extension model:');
    console.log('   • Core (70% - 12 lessons): Universal health content accessible to ALL');
    console.log('   • Extensions (30% - 5 lessons): Optional family/community connections');
    console.log('   • Alternating schedule structure integrated');
    console.log('   • Trauma-informed protocols perfected');
    console.log('   • Developmental appropriateness maximized for Grade 1');
    
  } catch (error) {
    console.error('❌ Error implementing Core + Extension model:', error);
  } finally {
    await prisma.$disconnect();
  }
}

implementCoreExtensionUnit1();