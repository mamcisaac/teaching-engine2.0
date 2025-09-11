#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function perfectUnit2() {
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

    const perfectUnit2 = `
**UNITÉ 2: SÉCURITÉ ET PROTECTION**
*19 leçons | 7.5 semaines | Octobre-Décembre*

**QUESTION ESSENTIELLE:**
Comment puis-je reconnaître les situations sécuritaires et prendre des décisions qui me protègent?

**COMPRÉHENSIONS DURABLES:**
• Je peux identifier les dangers et faire des choix sécuritaires dans différents environnements
• Les adultes de confiance sont là pour m'aider et me protéger
• Mes limites personnelles sont importantes et doivent être respectées

**ATTENTES CURRICULAIRES:**
• **FPS2 (70% - 13 leçons):** Reconnaître les situations potentiellement dangereuses et les moyens de se protéger
• **FPS4 (30% - 6 leçons):** Développer les compétences décisionnelles pour la sécurité personnelle

**CADRE PÉDAGOGIQUE ETFO:**
Structure constante de 45 minutes:
• **Mise en situation (8-10 min):** Scénario sécurité, activation connaissances préalables
• **Action (25-30 min):** Pratique guidée, jeux de rôle, exploration sécuritaire
• **Consolidation (7-10 min):** Engagement sécurité, réflexion personnelle

**PROGRESSION D'APPRENTISSAGE:**
*Semaines 1-2:* Sécurité à l'école et identification des dangers
*Semaines 3-4:* Adultes de confiance et demande d'aide
*Semaines 5-6:* Limites personnelles et dire non
*Semaine 7:* Sécurité communautaire et transport
*Semaine 7.5:* Intégration et préparation vacances sécuritaires

**VOCABULAIRE ESSENTIEL:**
sécurité, danger, prudent, attention, aide, confiance, adulte, non, limite, 
permission, urgence, protéger, règle, respecter, signaler, éviter, reconnaître

**ÉVALUATION AUTHENTIQUE:**
• **Observations comportementales:** Application règles sécurité dans contextes réels
• **Simulations pratiques:** Démonstration réponses appropriées aux scénarios
• **Portfolio sécurité:** Documentation choix sécuritaires avec justifications
• **Auto-évaluation guidée:** Identification situations confortables vs inconfortables
• **Communication famille:** Partage stratégies sécurité pour renforcement maison

**APPROCHE TRAUMA-INFORMED:**
• Aucun scénario effrayant ou traumatisant
• Focus sur empowerment et capacité d'agir
• Validation de tous les sentiments exprimés
• Options multiples pour expression (verbal, dessin, geste)
• Protocole clair si élève partage situation préoccupante

**DIFFÉRENCIATION INTÉGRÉE:**
• **Soutien intensif:** Scripts visuels pour demande aide, pratique répétée en petit groupe
• **Soutien modéré:** Partenaire pour jeux de rôle, choix de modalité expression
• **Extension:** Responsabilités leader sécurité, création ressources pour classe

**FLEXIBILITÉ CONCRÈTE:**

*Exercice feu durant unité:*
- Transformer en leçon pratique immédiate sur évacuation
- Débrief émotions et renforcement procédures
- Ajuster séquence pour capitaliser sur expérience vécue

*Incident sécurité dans école:*
- Adaptation sensible selon nature incident
- Focus sur stratégies positives et ressources aide
- Collaboration étroite avec équipe soutien

*Congé neige imprévu:*
- Condensation leçons transport en 1 session
- Focus sur sécurité hivernale comme priorité
- Report évaluations portfolio

*Sensibilité culturelle accrue (événement communautaire):*
- Adaptation exemples pour refléter diversité
- Inclusion perspectives multiples sur sécurité
- Respect variations familiales dans règles

*Préparation vacances décembre:*
- Leçons finales adaptées pour sécurité vacances
- Révision règles maison vs école
- Création guide sécurité vacances personnalisé

**RESSOURCES ESSENTIELLES:**
• Littérature: Livres sur sécurité adaptés 6-7 ans
• Matériel: Panneaux sécurité, téléphone jouet, marionnettes
• Visuels: Affiches adultes confiance, cartes scénarios
• Technologie: Vidéos courtes sécurité (pré-approuvées)
• Communauté: Agent communautaire, pompier (si disponible)

**INTÉGRATION INTERDISCIPLINAIRE:**
• **Français:** Vocabulaire sécurité, phrases pour demander aide
• **Mathématiques:** Numéros urgence, distance sécuritaire
• **Sciences:** Identification dangers environnementaux
• **Arts:** Création affiches sécurité, dramatisation

**PROTOCOLES SPÉCIAUX:**
• Collaboration étroite avec conseiller si révélations
• Documentation professionnelle situations préoccupantes
• Communication immédiate administration si nécessaire
• Respect confidentialité tout en assurant sécurité

**ADAPTATIONS NOVEMBRE-DÉCEMBRE:**
• Intégration sécurité hivernale naturelle
• Préparation transitions vacances
• Sensibilité stress pré-vacances
• Flexibilité accrue dernière semaine

**INDICATEURS DE SUCCÈS:**
□ 100% élèves identifient 3+ adultes de confiance
□ Démonstration dire "non" avec confiance
□ Application règles sécurité observée quotidiennement
□ Familles rapportent discussions sécurité maison
□ Aucun élève en situation dangereuse évitable`;

    await prisma.unitPlan.update({
      where: { id: unit2.id },
      data: { 
        description: perfectUnit2,
        successCriteria: {
          unitPlanPerfect: true,
          essentialQuestions: true,
          etfoFrameworkVisible: true,
          assessmentFramework: true,
          concreteFlexibility: true,
          frenchConsistent: true,
          traumaInformed: true,
          differentiationClear: true,
          protocolsIncluded: true,
          seasonalAdaptations: true
        }
      }
    });
    
    console.log('✅ Unit 2 perfected with trauma-informed approach');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

perfectUnit2();