#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function perfectUnit3() {
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
    
    const unit3 = await prisma.unitPlan.findFirst({
      where: { 
        longRangePlanId: fpsLRP.id,
        titleFr: 'Émotions et relations'
      }
    });

    const perfectUnit3 = `
**UNITÉ 3: ÉMOTIONS ET RELATIONS**
*18 leçons | 7 semaines | Janvier-Février (Post-vacances)*

**QUESTION ESSENTIELLE:**
Comment puis-je comprendre mes émotions et construire des relations saines avec les autres?

**COMPRÉHENSIONS DURABLES:**
• Toutes les émotions sont valides et j'ai des moyens sains de les exprimer
• L'empathie et l'écoute sont essentielles pour des amitiés positives
• Les conflits peuvent être résolus pacifiquement avec respect mutuel

**CONTEXTE POST-VACANCES:**
Cette unité reconnaît explicitement:
• Anxiété possible du retour après 2 semaines d'absence
• Besoin de reconstruire routines et relations
• Variations d'énergie et d'émotions en janvier
• Importance de reconnecter la communauté classe

**ATTENTES CURRICULAIRES:**
• **FPS3 (70% - 13 leçons):** Développer des habiletés relationnelles saines
• **FPS1 (30% - 5 leçons):** Comprendre le lien entre émotions et bien-être physique

**CADRE PÉDAGOGIQUE ETFO:**
Structure adaptée post-vacances:
• **Mise en situation (10 min):** Reconnexion douce, météo émotionnelle
• **Action (25-28 min):** Activités interactives, expression créative
• **Consolidation (7-10 min):** Cercle de partage, validation émotions

**PROGRESSION D'APPRENTISSAGE POST-VACANCES:**
*Semaine 1 (6-10 jan):* Reconnexion et expression émotionnelle
*Semaine 2:* Reconnaissance émotions chez soi et autres
*Semaines 3-4:* Stratégies gestion émotions saines
*Semaines 5-6:* Habiletés amitié et collaboration
*Semaine 7:* Résolution conflits et célébration relations

**VOCABULAIRE ESSENTIEL:**
émotions, sentiments, content, triste, fâché, inquiet, excité, calme, ami, 
partager, écouter, comprendre, empathie, conflit, solution, pardon, ensemble

**ÉVALUATION SENSIBLE POST-VACANCES:**
• **Observations discrètes:** Ajustement émotionnel au retour
• **Expression multiple:** Dessin, mouvement, ou mots selon confort
• **Portfolio émotions:** Documentation progression janvier-février
• **Auto-évaluation adaptée:** Thermomètre émotionnel quotidien
• **Communication famille:** Stratégies continuité maison-école

**ADAPTATIONS JANVIER SPÉCIFIQUES:**
• Routine prévisible pour sécurité émotionnelle
• Temps supplémentaire pour transitions
• Activités calmes si énergie basse
• Validation fatigue hivernale normale
• Flexibilité selon météo et moral

**DIFFÉRENCIATION POST-VACANCES:**
• **Soutien intensif:** Préparation individuelle retour, buddy constant, expression non-verbale acceptée
• **Soutien modéré:** Check-ins fréquents, choix activités, temps processing émotionnel
• **Extension:** Rôle mentor émotionnel, création ressources classe

**FLEXIBILITÉ CONCRÈTE JANVIER-FÉVRIER:**

*Première semaine janvier (réajustement):*
- Leçons 1-2 peuvent s'étendre sur 3 jours si nécessaire
- Focus reconnexion avant contenu académique
- Permission émotions variées sans jugement

*Tempête neige/fermeture:*
- Reprendre avec activité reconnexion
- Condenser stratégies similaires
- Reporter évaluations formelles

*Saint-Valentin (14 février):*
- Intégration naturelle thème amitié
- Sensibilité exclusion potentielle
- Focus amitié inclusive vs romance

*Fatigue mi-février:*
- Activités plus calmes
- Intégration mouvement énergisant
- Sessions plus courtes si nécessaire

*Cas grippe/absences multiples:*
- Maintenir routine pour présents
- Matériel rattrapage simple
- Focus bien-être collectif

**RESSOURCES ESSENTIELLES:**
• Littérature: Livres émotions et amitié en français
• Matériel: Cartes émotions, thermomètre classe, coussin calme
• Musique: Playlist relaxation, énergisation
• Visuels: Affiches stratégies, photos expressions
• Espace: Coin calme désigné, espace cercle

**INTÉGRATION INTERDISCIPLINAIRE:**
• **Français:** Expression orale émotions, vocabulaire relationnel
• **Mathématiques:** Graphique émotions classe, patterns relationnels
• **Sciences:** Corps et émotions, stress et relaxation
• **Arts:** Expression créative émotions, art collaboratif

**STRATÉGIES TRAUMA-INFORMED:**
• Prévisibilité routine pour sécurité
• Choix dans participation niveau
• Aucune pression partage personnel
• Validation toutes expériences vacances
• Protocole si révélations difficiles

**CONSIDÉRATIONS HIVER:**
• Impact manque lumière sur humeur
• Activités lumineuses pour énergie
• Reconnaissance blues janvier normal
• Célébration petites victoires quotidiennes

**PARTENARIAT FAMILLE RENFORCÉ:**
• Communication pré-retour (fin décembre)
• Stratégies cohérentes maison-école
• Partage outils gestion émotions
• Suggestions activités famille

**INDICATEURS DE SUCCÈS POST-VACANCES:**
□ 100% élèves réintégrés confortablement fin janvier
□ Utilisation spontanée vocabulaire émotionnel
□ Diminution conflits cour récréation
□ Augmentation comportements empathiques observés
□ Participation active cercles partage
□ Familles rapportent amélioration expression émotions`;

    await prisma.unitPlan.update({
      where: { id: unit3.id },
      data: { 
        description: perfectUnit3,
        successCriteria: {
          unitPlanPerfect: true,
          postBreakOptimized: true,
          essentialQuestions: true,
          etfoFrameworkVisible: true,
          assessmentSensitive: true,
          concreteFlexibility: true,
          frenchConsistent: true,
          winterConsiderations: true,
          traumaInformed: true,
          familyPartnership: true
        }
      }
    });
    
    console.log('✅ Unit 3 perfected with post-winter break focus');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

perfectUnit3();