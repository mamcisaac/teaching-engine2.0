#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function perfectUnit4() {
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
    
    const unit4 = await prisma.unitPlan.findFirst({
      where: { 
        longRangePlanId: fpsLRP.id,
        titleFr: 'Nutrition et énergie'
      }
    });

    const perfectUnit4 = `
**UNITÉ 4: NUTRITION ET MOUVEMENT**
*15 leçons | 6 semaines | Février-Avril*

**QUESTION ESSENTIELLE:**
Comment mes choix alimentaires et mon activité physique m'aident-ils à avoir de l'énergie pour apprendre et jouer?

**COMPRÉHENSIONS DURABLES:**
• Différents aliments donnent différents types d'énergie à mon corps
• Bouger mon corps me rend plus fort et plus heureux
• Chaque famille a ses propres traditions alimentaires précieuses

**PRINCIPE FONDAMENTAL - AUCUN FOOD SHAMING:**
• Tous les aliments ont une place
• Respect total des choix familiaux
• Aucun jugement sur lunch/collations
• Célébration de la diversité alimentaire
• Focus sur énergie et bien-être, pas restriction

**ATTENTES CURRICULAIRES:**
• **FPS1 (70% - 11 leçons):** Comprendre nutrition et mouvement pour santé
• **FPS3 (30% - 4 leçons):** Aspects sociaux et culturels de l'alimentation

**CADRE PÉDAGOGIQUE ETFO:**
Structure inclusive et flexible:
• **Mise en situation (8-10 min):** Exploration positive sans jugement
• **Action (25-30 min):** Découverte active, respect des différences
• **Consolidation (7-10 min):** Célébration apprentissages sans comparaison

**PROGRESSION D'APPRENTISSAGE:**
*Semaines 1-2:* Exploration couleurs et variété (sans hiérarchie)
*Semaines 3-4:* Énergie du corps et mouvement joyeux
*Semaines 5-6:* Traditions alimentaires familiales et culturelles

**VOCABULAIRE ESSENTIEL:**
énergie, force, grandir, couleur, variété, bouger, courir, sauter, 
partager, tradition, famille, célébrer, ensemble, différent, spécial

**ÉVALUATION SANS JUGEMENT:**
• **Observations positives:** Participation aux activités mouvement
• **Portfolio créatif:** Dessins "aliments qui me donnent énergie"
• **Célébration diversité:** Documentation traditions familiales
• **Auto-réflexion:** "Comment je me sens quand je bouge"
• **Communication famille:** Partage activités, pas surveillance alimentaire

**GESTION ALLERGIES/RESTRICTIONS:**
• Liste allergies affichée et respectée
• Alternatives visuelles pour toute exploration
• Aucune dégustation obligatoire
• Matériel factice prioritaire
• Vérification triple avant activités

**DIFFÉRENCIATION CULTURELLE:**
• **Support intensif:** Respect restrictions alimentaires, focus mouvement si alimentation sensible
• **Support modéré:** Choix modalités participation, alternatives créatives
• **Extension:** Recherche traditions mondiales, création ressources inclusives

**FLEXIBILITÉ CONCRÈTE MARS-AVRIL:**

*Semaine relâche mars:*
- Condensation naturelle unité
- Focus activités printemps retour
- Pas d'évaluation immédiate post-relâche

*Carême/Ramadan/Observances:*
- Sensibilité restrictions temporaires
- Adaptation respectueuse activités
- Focus mouvement si alimentation limitée
- Célébration patience et discipline

*Pâques/Printemps:*
- Intégration traditions diverses
- Éviter focus chocolat/sucreries
- Célébration renouveau et énergie

*Allergies saisonnières:*
- Activités intérieures alternatives
- Considération fatigue allergique
- Adaptation mouvement selon capacités

*Budget familial serré (fin année):*
- Aucune demande contribution alimentaire
- Focus aliments accessibles tous
- Valorisation créativité vs coût

**RESSOURCES INCLUSIVES:**
• Littérature: Livres célébrant diversité alimentaire mondiale
• Matériel: Aliments factices, images diverses cuisines
• Mouvement: Équipement varié pour tous niveaux
• Visuels: Affiches traditions multiples
• Invités: Familles partageant traditions (optionnel)

**INTÉGRATION INTERDISCIPLINAIRE:**
• **Français:** Vocabulaire alimentaire et mouvement
• **Mathématiques:** Couleurs, formes, patterns alimentaires
• **Sciences:** Énergie, croissance, corps humain
• **Arts:** Création artistique thème nourriture/mouvement
• **Études sociales:** Traditions familiales et culturelles

**SENSIBILITÉS CRITIQUES:**
• Troubles alimentaires: Aucune discussion poids/apparence
• Insécurité alimentaire: Respect situations familiales
• Préférences sensorielles: Acceptation totale
• Capacités physiques: Mouvement adapté pour tous
• Religion/Culture: Respect complet restrictions

**APPROCHE PRINTEMPS:**
• Énergie renouvelée avec saison
• Activités extérieures progressives
• Célébration croissance depuis septembre
• Préparation transition vers été

**COMMUNICATION FAMILLE SENSIBLE:**
• Focus partage traditions, pas surveillance
• Suggestions activités famille mouvement
• Ressources communautaires si besoin
• Aucun jugement implicite ou explicite

**INDICATEURS DE SUCCÈS INCLUSIFS:**
□ Tous élèves participent confortablement selon capacités
□ Aucun incident food shaming classe
□ Augmentation mouvement joyeux observé
□ Célébration authentique diversité alimentaire
□ Familles rapportent discussions positives maison
□ Respect total différences maintenu`;

    await prisma.unitPlan.update({
      where: { id: unit4.id },
      data: { 
        description: perfectUnit4,
        successCriteria: {
          unitPlanPerfect: true,
          noFoodShaming: true,
          culturallySensitive: true,
          allergyProtocols: true,
          essentialQuestions: true,
          etfoFrameworkVisible: true,
          assessmentInclusive: true,
          concreteFlexibility: true,
          frenchConsistent: true,
          springTransition: true
        }
      }
    });
    
    console.log('✅ Unit 4 perfected with extreme food sensitivity');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

perfectUnit4();