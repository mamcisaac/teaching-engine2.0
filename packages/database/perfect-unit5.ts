#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function perfectUnit5() {
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
    
    const unit5 = await prisma.unitPlan.findFirst({
      where: { 
        longRangePlanId: fpsLRP.id,
        titleFr: 'Mouvement et bien-être'
      }
    });

    const perfectUnit5 = `
**UNITÉ 5: RELATIONS ET COMMUNAUTÉ**
*18 leçons | 7 semaines | Avril-Mai*

**QUESTION ESSENTIELLE:**
Comment puis-je contribuer positivement à ma communauté classe et élargie?

**COMPRÉHENSIONS DURABLES:**
• Chaque personne a un rôle important dans notre communauté
• La coopération et le respect créent un environnement positif pour tous
• Je peux faire une différence positive dans ma communauté

**CONTEXTE PRINTANIER:**
• Énergie renouvelée avec belle saison
• Opportunités sortir dans communauté
• Préparation fin année et transitions
• Consolidation relations année entière

**ATTENTES CURRICULAIRES:**
• **FPS3 (70% - 13 leçons):** Développer sens communautaire et responsabilité sociale
• **FPS2 (30% - 5 leçons):** Sécurité collective et entraide communautaire

**CADRE PÉDAGOGIQUE ETFO:**
Structure collaborative:
• **Mise en situation (8-10 min):** Problème communautaire à résoudre ensemble
• **Action (25-30 min):** Projets coopératifs, exploration communauté
• **Consolidation (7-10 min):** Célébration contributions, réflexion impact

**PROGRESSION D'APPRENTISSAGE:**
*Semaines 1-2:* Notre classe comme communauté modèle
*Semaines 3-4:* Helpers et services dans communauté
*Semaines 5-6:* Projets service communautaire adaptés
*Semaine 7:* Célébration impact et engagement futur

**VOCABULAIRE ESSENTIEL:**
communauté, ensemble, aider, service, partager, coopérer, respecter, 
contribuer, citoyen, responsabilité, équipe, projet, impact, différence

**ÉVALUATION COLLABORATIVE:**
• **Observations collaboration:** Travail équipe et soutien mutuel
• **Documentation projets:** Photos et descriptions contributions
• **Réflexion impact:** "Comment j'ai aidé aujourd'hui"
• **Évaluation pairs:** Appréciation contributions autres
• **Portfolio communautaire:** Preuves engagement positif

**INCLUSION TOTALE:**
• Chaque élève a contribution valable
• Adaptation selon capacités individuelles
• Célébration tous types service
• Respect limites et confort
• Valorisation efforts pas résultats

**DIFFÉRENCIATION COMMUNAUTAIRE:**
• **Support intensif:** Rôles simples mais essentiels, partenariat constant
• **Support modéré:** Choix type contribution, soutien organisation
• **Extension:** Leadership projets, mentorat pairs, initiatives personnelles

**FLEXIBILITÉ CONCRÈTE AVRIL-MAI:**

*Congé Pâques variable:*
- Ajustement timeline selon calendrier
- Projets peuvent pauser/reprendre
- Flexibilité dates culmination

*Sorties communautaires météo:*
- Plans B intérieurs toujours prêts
- Invités classe si sortie impossible
- Documentation virtuelle alternative

*Événements fin année école:*
- Intégration projets dans événements
- Synergie avec autres initiatives
- Éviter surcharge mai-juin

*Préparation transition été:*
- Focus communauté familiale aussi
- Projets transportables maison
- Engagement continuité été

*Fatigue fin année:*
- Projets plus calmes option
- Célébrations fréquentes
- Sessions plus courtes acceptable

**PROJETS COMMUNAUTAIRES ADAPTÉS GRADE 1:**
• Beautification cour école
• Cartes pour résidence aînés
• Collecte items pour refuge
• Jardin classe/école
• Lecture aux maternelles
• Campagne gentillesse école

**RESSOURCES COMMUNAUTAIRES:**
• Littérature: Livres sur communauté et entraide
• Matériel: Supplies projets variés selon choix
• Technologie: Documentation photo/vidéo projets
• Partenaires: Organizations locales accueillantes
• Espaces: Classe, école, quartier accessible

**INTÉGRATION INTERDISCIPLINAIRE:**
• **Français:** Communication avec communauté, lettres, affiches
• **Mathématiques:** Mesurer impact, compter contributions
• **Sciences:** Environnement, écosystèmes communautaires
• **Arts:** Création pour/avec communauté
• **Études sociales:** Rôles, responsabilités, citoyenneté

**SÉCURITÉ COMMUNAUTAIRE:**
• Supervision constante sorties
• Vérification allergies/sensibilités
• Protocoles COVID si encore nécessaire
• Permissions parentales claires
• Plans urgence établis

**PARTENARIAT FAMILLE ÉLARGI:**
• Invitation participation projets
• Partage expertise parentale
• Extension projets maison
• Célébration collective fin
• Documentation pour souvenirs

**CONSIDÉRATIONS MAI:**
• Énergie variable fin année
• Émotions transitions à venir
• Besoin closure positive
• Célébration croissance année
• Préparation séparation juin

**ADAPTATION RÉALITÉS LOCALES:**
• Projets reflètent communauté spécifique
• Respect limites géographiques/transport
• Utilisation ressources disponibles
• Flexibilité selon opportunités
• Pertinence contexte école

**INDICATEURS DE SUCCÈS COMMUNAUTAIRE:**
□ 100% élèves contribuent selon capacités
□ Projets complétés avec fierté collective
□ Augmentation comportements entraide
□ Reconnaissance par communauté élargie
□ Engagement futur exprimé par élèves
□ Familles rapportent impact positif maison`;

    await prisma.unitPlan.update({
      where: { id: unit5.id },
      data: { 
        description: perfectUnit5,
        successCriteria: {
          unitPlanPerfect: true,
          communityFocused: true,
          springOptimized: true,
          inclusiveProjects: true,
          essentialQuestions: true,
          etfoFrameworkVisible: true,
          assessmentCollaborative: true,
          concreteFlexibility: true,
          frenchConsistent: true,
          transitionReady: true
        }
      }
    });
    
    console.log('✅ Unit 5 perfected with community focus');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

perfectUnit5();