#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function implementCoreExtensionUnit2() {
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
    
    const unit2 = await prisma.unitPlan.findFirst({
      where: { 
        longRangePlanId: fpsLRP.id,
        titleFr: 'Sécurité et protection'
      }
    });

    const coreExtensionUnit2 = `**UNITÉ 2: SÉCURITÉ ET PROTECTION**
*19 leçons | 8 semaines | 20 octobre - 12 décembre*

**QUESTION ESSENTIELLE:**
Comment puis-je rester en sécurité et protéger mon bien-être dans différentes situations?

**COMPRÉHENSIONS DURABLES:**
• Je peux apprendre des stratégies pour me garder en sécurité partout où je vais
• Demander de l'aide à un adulte de confiance est toujours la bonne chose à faire
• Mon corps m'appartient et j'ai le droit de dire non si quelque chose ne me semble pas sûr

**🎯 MODÈLE CŒUR + EXTENSION (TRAUMA-INFORMED SAFETY)**

**CŒUR UNIVERSEL (68% - 13 leçons):**
Compétences sécuritaires essentielles accessibles à TOUS, indépendamment de la situation familiale:

*Leçons 1-3: Sécurité corporelle personnelle*
- CŒUR: Parties privées, toucher approprié vs inapproprié, dire NON
- Protocoles universels sans référence aux situations familiales spécifiques

*Leçons 4-6: Sécurité école et transport*
- CŒUR: Règles classe, corridors, autobus scolaire, terrains de jeu
- Procédures standardisées applicables à tous les élèves

*Leçons 7-9: Urgences de base et premiers soins*
- CŒUR: Qu'est-ce qu'une urgence, qui appeler (911), premiers soins simples
- Connaissances universelles sans dépendance situation familiale

*Leçons 10-11: Adultes de confiance et demande d'aide*
- CŒUR: Identifier adultes sécuritaires école, quand/comment demander aide
- Focus ressources école disponibles pour tous

*Leçons 12-13: Prévention et sensibilisation*
- CŒUR: Reconnaître situations dangereuses, stratégies évitement
- Compétences individuelles d'auto-protection

**EXTENSIONS OPTIONNELLES (32% - 6 leçons):**
Connexions sécuritaires enrichissantes selon possibilités familiales/communautaires:

*Leçon Extension 1: Plans familiaux urgence*
- Partage VOLONTAIRE arrangements familiaux si stable
- Alternatives pour élèves situations familiales incertaines

*Leçon Extension 2: Helpers communautaires sécurité*
- Exploration métiers sécurité, invités potentiels (policiers, pompiers)
- Participation selon disponibilité et confort

*Leçons Extension 3-4: Applications avancées sécurité*
- Sécurité internet/technologie si accessible
- Scénarios complexes sécurité pour élèves prêts

*Leçons Extension 5-6: Projets et leadership sécurité*
- Création affiches sécurité, mentorat pairs
- Initiatives personnelles selon intérêts

**ATTENTES CURRICULAIRES (SELON LRP PROTÉGÉ):**
• **FPS2 (84% - 16 leçons):** Développer sens sécurité personnelle et responsabilité
• **FPS4 (16% - 3 leçons):** Utiliser compétences personnelles pour situations sécuritaires

**STRUCTURE ALTERNÉE SÉCURITAIRE (DAILY CONSECUTIVE):**

*Semaine 1 (2 leçons): Corps + Limites*
- Corps (Lundi): Mon corps m'appartient, parties privées personnelles
- Limites (Mercredi): Toucher ok vs pas ok, dire non avec force

*Semaine 2 (2 leçons): École + Règles*
- École (Lundi): Sécurité classe, matériel sécuritaire, procédures
- Règles (Mercredi): Corridors, escaliers, récréation sécuritaires

*Semaine 3 (3 leçons): Urgences + 911 + Aide*
- Urgences (Lundi): Qu'est-ce qu'une vraie urgence?
- 911 (Mercredi): Comment appeler, quoi dire, rester calme
- Aide (Vendredi): [Semaine 3 jours - possibilité congé]

*Semaines 4-5 (4 leçons): Adultes + Confiance + Prévention + Sensibilisation*
- Focus identification ressources sécuritaires école
- Stratégies reconnaissance situations dangereuses

*Semaines 6-7 (4 leçons): Extensions optionnelles selon capacités*
- Cœur consolidation + extensions volontaires

*Semaine 8 (4 leçons): Applications + Révision + Célébration + Préparation vacances*
- Intégration apprentissages + sécurité vacances Noël

**CADRE PÉDAGOGIQUE ETFO SÉCURITÉ-FIRST:**

**Structure 45 minutes trauma-informed:**
• **Mise en situation (8 min):** Check-in sécurité émotionnelle, validation
• **Action (27 min):** Apprentissage cœur sécuritaire + extension selon confort
• **Consolidation (10 min):** Ancrage personnel, ressources disponibles rappelées

**VOCABULAIRE SÉCURITAIRE ESSENTIEL:**
sécurité, protection, danger, urgence, aide, adulte, confiance, non, 
oui, toucher, privé, respect, limite, règle, soin, attention, prudent

**ÉVALUATION SÉCURITAIRE SENSIBLE:**

**CŒUR (Tous élèves - évaluation sécurisée):**
• **Observations sécuritaires:** Application règles sécurité école
• **Jeux rôles contrôlés:** Situations sécurité préprogrammées
• **Auto-évaluation sécuritaire:** "Je sais comment rester en sécurité"
• **Démonstrations procedures:** Urgences, premiers soins de base

**EXTENSIONS (Strictement volontaires):**
• **Projets familiaux sécurité:** SI famille stable et consentante
• **Présentations communautaires:** SI ressources disponibles
• **Leadership sécurité:** Mentorat pairs SI élève confortable

**DIFFÉRENCIATION SÉCURITAIRE INCLUSIVE:**

**Soutien intensif:**
- Focus EXCLUSIF cœur sécuritaire, aucune pression extensions
- Répétition messages sécurité jusqu'à automatisme
- Support visuel constant, pratique guidée répétée
- Aucune révélation personnelle requise

**Soutien modéré:**
- Maîtrise cœur + extensions selon confort révélé
- Choix participation, aucune pression performance
- Adaptation selon besoins sécuritaires identifiés

**Extension enrichissement:**
- Maîtrise rapide cœur + leadership extensions
- Mentorat pairs concepts sécurité, création ressources
- Projets approfondis selon intérêts sécuritaires

**PROTOCOLES TRAUMA-INFORMED CRITIQUES:**

**RÉVÉLATIONS POTENTIELLES:**
- Formation équipe reconnaissance signaux détresse
- Protocoles signalement établis et affichés discrètement
- Collaboration immédiate direction si inquiétudes
- Documentation factuelle sans interrogation intrusive

**SÉCURITÉ ÉMOTIONNELLE ABSOLUE:**
- Aucune pression partage expériences personnelles négatives
- Validation toutes émotions sans jugement situation
- Ressources soutien affichées et accessibles constamment
- Respect complet limites participation individuelle

**FLEXIBILITÉ SÉCURITAIRE CONCRÈTE:**

*Révélation inquiétante durant leçon:*
- Protocole activé discrètement, classe continue normalement
- Élève accompagné ressources appropriées immédiatement
- Équipe informée selon procédures établies
- Suivi professionnel assuré sans disruption classe

*Parent préoccupé contenu sécurité:*
- Discussion privée immédiate, transparence complète
- Adaptation respectueuse préoccupations légitimes
- Collaboration pour messages cohérents maison-école
- Respect valeurs familiales dans limites sécuritaires

*Élève anxieux suite leçons sécurité:*
- Support individuel immédiat, validation émotions
- Messages rassurance équilibrés avec information
- Collaboration famille pour soutien maison si possible
- Ressources soutien supplémentaires si nécessaire

**CONSIDÉRATIONS DÉVELOPPEMENTALES SÉCURITÉ GRADE 1:**

• **Information vs peur:** Messages sécuritaires rassurants
• **Concret vs abstrait:** Situations réelles pratiques
• **Autonomie graduelle:** Compétences appropriées âge
• **Support adulte constant:** Rassurance disponibilité aide

**INTÉGRATION INTERDISCIPLINAIRE SÉCURITAIRE:**

• **Français:** Vocabulaire sécurité, communication claire besoins
• **Mathématiques:** Numéros urgence, comptage situations
• **Sciences:** Sécurité science, manipulation matériel
• **Arts:** Expression sécuritaire, création affiches prévention

**SENSIBILITÉS CULTURELLES SÉCURITÉ:**

**CŒUR (Universel):**
- Messages sécurité respectant toutes cultures
- Protocoles applicables indépendamment origine
- Respect différences familiales dans limites légales
- Inclusion totale sans discrimination

**EXTENSIONS (Adaptées culture):**
- Reconnaissance diversité approches sécuritaires
- Respect traditions familiales compatibles sécurité
- Adaptation activités selon sensibilités culturelles
- Célébration contributions diverses communautés

**PROTOCOLES URGENCE INTÉGRÉS:**

• **Signalement obligatoire:** Procédures claires équipe
• **Ressources immédiatement disponibles:** Contacts affichés
• **Formation continue:** Mise à jour protocoles régulière
• **Collaboration interdisciplinaire:** Équipe coordonnée

**INDICATEURS SUCCÈS SÉCURITAIRES:**

**CŒUR (Tous élèves):**
□ 100% élèves identifient adultes confiance école
□ Tous démontrent stratégies de base demande aide
□ Utilisation spontanée vocabulaire sécuritaire approprié
□ Application règles sécurité école de façon autonome

**EXTENSIONS (Participation volontaire):**
□ Élèves participants créent ressources sécurité pairs
□ Connexions famille/communauté établies selon possibilités
□ Leadership positif sécurité démontré par volontaires
□ Projets sécurité complétés selon intérêts individuels

**PRÉPARATION VACANCES NOËL SÉCURITAIRES:**
- Messages sécurité vacances adaptés réalités familiales diverses
- Ressources communautaires partagées selon besoins
- Aucune hypothèse situations familiales stables
- Focus bien-être individuel durant pause scolaire`;

    await prisma.unitPlan.update({
      where: { id: unit2.id },
      data: { 
        description: coreExtensionUnit2
      }
    });
    
    console.log('✅ Unit 2 enhanced with Core + Extension model:');
    console.log('   • Core (68% - 13 lessons): Universal safety skills for ALL students');
    console.log('   • Extensions (32% - 6 lessons): Optional family/community safety connections');
    console.log('   • Daily consecutive instruction structure');
    console.log('   • Enhanced trauma-informed safety protocols');
    console.log('   • Mandatory reporting procedures integrated');
    
  } catch (error) {
    console.error('❌ Error implementing Core + Extension model Unit 2:', error);
  } finally {
    await prisma.$disconnect();
  }
}

implementCoreExtensionUnit2();