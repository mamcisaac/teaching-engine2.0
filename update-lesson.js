import { PrismaClient } from './packages/database/dist/index.js';

const prisma = new PrismaClient();

async function updateLesson2() {
  try {
    const lessonId = "cmef0b1cx0003vj433uqee6mu";
    
    // Enhanced materials with outdoor safety
    const enhancedMaterials = [
      "Journaux de sciences",
      "Loupes plastiques sécuritaires",
      "Balances",
      "Thermomètres",
      "Bacs d'eau",
      "Objets de test",
      "Vocabulaire visuel français",
      "Tapis d'exploration",
      "Trousse de premiers soins",
      "Écran solaire",
      "Chapeaux pour protection solaire",
      "Sacs de collecte (pas d'êtres vivants)",
      "Planches à pince pour extérieur",
      "Cartes vocabulaire: vivant, non-vivant, l'environnement"
    ];

    // Enhanced learning goals with outdoor safety
    const enhancedLearningGoals = `OBJECTIFS D'APPRENTISSAGE SPÉCIFIQUES:
• Les élèves exploreront les êtres vivants et non-vivants dans l'environnement scolaire extérieur
• Les élèves différencieront vivant vs non-vivant par l'observation directe
• Les élèves suivront rigoureusement les protocoles de sécurité extérieure
• Les élèves utiliseront leur journal de sciences pour documenter les découvertes extérieures
• Les élèves maîtriseront le vocabulaire français: "vivant", "non-vivant", "bouger", "grandir"

PROTOCOLES DE SÉCURITÉ EXTÉRIEURE OBLIGATOIRES:
• Système de partenaires - aucun élève seul
• Vêtements longs recommandés (protection contre plantes)
• Chapeaux et écran solaire obligatoires
• Limites d'exploration clairement marquées
• INTERDICTION: toucher plantes inconnues, insectes, déchets
• Allergies aux pollens - inhalateur disponible
• Signal de retour immédiat en cas d'urgence`;

    // Enhanced action with science journal integration
    const enhancedAction = `(27 minutes) EXPLORATION EXTÉRIEURE STRUCTURÉE ET SÉCURITAIRE:

PHASE 1 - Préparation sécuritaire (5 min):
• Révision des règles de sécurité extérieure
• Vérification partenaires et équipement
• Distribution des journaux scientifiques et planches à pince

PHASE 2 - Investigation extérieure guidée (15 min):
• Zone 1: Cour d'école - recherche d'êtres vivants/non-vivants
• Zone 2: Jardins scolaires - observation des plantes SANS toucher
• Zone 3: Terrain de jeu - classification des matériaux
• Zone 4: Arbres et arbustes - observation à distance sécuritaire

JOURNAL SCIENTIFIQUE EN ACTION:
• Dessins détaillés des découvertes dans chaque zone
• Tableaux "Vivant" vs "Non-vivant" avec preuves
• Utilisation du vocabulaire français: "grandir", "bouger", "respirer"
• Questions de curiosité pour investigations futures

PHASE 3 - Consolidation sécuritaire (7 min):
• Retour au point de rassemblement
• Nettoyage des mains (lingettes désinfectantes)
• Vérification: tous les partenaires présents`;

    // Enhanced assessment with outdoor safety criteria
    const enhancedAssessment = `ÉVALUATION CRITIQUE - SÉCURITÉ EXTÉRIEURE ET CLASSIFICATION:

SÉCURITÉ EXTÉRIEURE OBLIGATOIRE:
☐ Respecte RIGOUREUSEMENT le système de partenaires
☐ Suit toutes les consignes de sécurité sans rappel
☐ Évite de toucher plantes et insectes inconnus
☐ Reste dans les limites d'exploration définies
☐ Signale immédiatement tout problème de sécurité

CLASSIFICATION VIVANT/NON-VIVANT:
☐ Différencie correctement vivant vs non-vivant
☐ Explique ses critères de classification
☐ Identifie les caractéristiques des êtres vivants
☐ Utilise des preuves observables pour justifier

JOURNAL SCIENTIFIQUE EXTÉRIEUR:
☐ Enregistre observations détaillées dans chaque zone
☐ Dessine avec précision les découvertes extérieures
☐ Complète les tableaux de classification
☐ Formule des questions scientifiques pertinentes

VOCABULAIRE FRANÇAIS MAÎTRISÉ:
☐ Utilise "vivant", "non-vivant", "grandir", "bouger" correctement
☐ Décrit les observations en français
☐ Pose des questions d'investigation en français`;

    const result = await prisma.eTFOLessonPlan.update({
      where: { id: lessonId },
      data: {
        learningGoals: enhancedLearningGoals,
        materials: enhancedMaterials,
        action: enhancedAction,
        assessmentNotes: enhancedAssessment
      }
    });

    console.log('Lesson 2 updated successfully:', result.title);
    
  } catch (error) {
    console.error('Error updating lesson 2:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateLesson2();