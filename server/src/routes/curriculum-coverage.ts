import type { Response } from 'express';
import { Router } from 'express';

import { logger } from '../logger';
import { prisma } from '../prisma';
import { getUserId } from '../utils/authHelpers';
import { getErrorMessage } from '../utils/type-guards';

import type { AuthenticatedRequest } from './base/middleware';

const router = Router();

interface CoverageStats {
  subject: string;
  strand?: string;
  total: number;
  covered: number;
  percentage: number;
  uncoveredExpectations: Array<{
    id: string;
    code: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

/**
 * Calculate priority score for uncovered expectations
 */
function calculatePriority(expectation: any): 'high' | 'medium' | 'low' {
  // Core subjects get higher priority
  const coreSubjects = ['Français (Immersion)', 'Mathématiques'];
  if (coreSubjects.includes(expectation.subject)) {
    return 'high';
  }
  
  // Check if it's an overall expectation (usually more important)
  if (expectation.type === 'overall' || expectation.code.includes('.1')) {
    return 'medium';
  }
  
  return 'low';
}

/**
 * GET /api/curriculum-coverage
 * Get comprehensive curriculum coverage statistics
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { grade, subject, startDate, endDate } = req.query as Record<string, string>;
    
    // Build filters
    const filters: any = {};
    if (grade) filters.grade = parseInt(grade, 10);
    if (subject && subject !== 'all') filters.subject = subject;

    // Get all curriculum expectations with their coverage
    const expectations = await prisma.curriculumExpectation.findMany({
      where: filters,
      include: {
        lessonPlans: {
          where: {
            lessonPlan: {
              userId,
              ...(startDate && endDate ? {
                date: {
                  gte: new Date(startDate),
                  lte: new Date(endDate),
                }
              } : {})
            }
          },
          select: {
            lessonPlanId: true,
            lessonPlan: {
              select: {
                id: true,
                title: true,
                date: true,
              }
            }
          }
        },
        unitPlans: {
          where: {
            unitPlan: {
              userId,
            }
          },
          select: {
            unitPlanId: true,
            unitPlan: {
              select: {
                id: true,
                title: true,
              }
            }
          }
        },
        daybookEntries: {
          where: {
            daybookEntry: {
              userId,
              ...(startDate && endDate ? {
                date: {
                  gte: new Date(startDate),
                  lte: new Date(endDate),
                }
              } : {})
            }
          },
          select: {
            daybookEntryId: true,
            coverage: true,
          }
        }
      },
    });

    // Calculate coverage statistics
    const coverageBySubject: Map<string, CoverageStats> = new Map();
    const coverageByStrand: Map<string, CoverageStats> = new Map();
    
    expectations.forEach(exp => {
      const isCovered = exp.lessonPlans.length > 0 || 
                       exp.unitPlans.length > 0 || 
                       exp.daybookEntries.length > 0;
      
      // By subject
      if (!coverageBySubject.has(exp.subject)) {
        coverageBySubject.set(exp.subject, {
          subject: exp.subject,
          total: 0,
          covered: 0,
          percentage: 0,
          uncoveredExpectations: [],
        });
      }
      const subjectStats = coverageBySubject.get(exp.subject)!;
      subjectStats.total++;
      if (isCovered) {
        subjectStats.covered++;
      } else {
        subjectStats.uncoveredExpectations.push({
          id: exp.id,
          code: exp.code,
          description: exp.description,
          priority: calculatePriority(exp),
        });
      }
      
      // By strand
      const strandKey = `${exp.subject}:${exp.strand}`;
      if (!coverageByStrand.has(strandKey)) {
        coverageByStrand.set(strandKey, {
          subject: exp.subject,
          strand: exp.strand,
          total: 0,
          covered: 0,
          percentage: 0,
          uncoveredExpectations: [],
        });
      }
      const strandStats = coverageByStrand.get(strandKey)!;
      strandStats.total++;
      if (isCovered) {
        strandStats.covered++;
      } else {
        strandStats.uncoveredExpectations.push({
          id: exp.id,
          code: exp.code,
          description: exp.description,
          priority: calculatePriority(exp),
        });
      }
    });

    // Calculate percentages and sort uncovered by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    
    coverageBySubject.forEach(stats => {
      stats.percentage = stats.total > 0 ? Math.round((stats.covered / stats.total) * 100) : 0;
      stats.uncoveredExpectations.sort((a, b) => 
        priorityOrder[a.priority] - priorityOrder[b.priority]
      );
    });
    
    coverageByStrand.forEach(stats => {
      stats.percentage = stats.total > 0 ? Math.round((stats.covered / stats.total) * 100) : 0;
      stats.uncoveredExpectations.sort((a, b) => 
        priorityOrder[a.priority] - priorityOrder[b.priority]
      );
    });

    // Overall statistics
    const totalExpectations = expectations.length;
    const coveredExpectations = expectations.filter(exp => 
      exp.lessonPlans.length > 0 || 
      exp.unitPlans.length > 0 || 
      exp.daybookEntries.length > 0
    ).length;
    const overallPercentage = totalExpectations > 0 
      ? Math.round((coveredExpectations / totalExpectations) * 100) 
      : 0;

    res.json({
      success: true,
      data: {
        overall: {
          total: totalExpectations,
          covered: coveredExpectations,
          uncovered: totalExpectations - coveredExpectations,
          percentage: overallPercentage,
        },
        bySubject: Array.from(coverageBySubject.values()),
        byStrand: Array.from(coverageByStrand.values()),
        dateRange: startDate && endDate ? { startDate, endDate } : null,
      },
    });
  } catch (error) {
    logger.error('Error fetching curriculum coverage:', getErrorMessage(error));
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch curriculum coverage' 
    });
  }
});

/**
 * GET /api/curriculum-coverage/uncovered
 * Get list of uncovered expectations with smart prioritization
 */
router.get('/uncovered', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { 
      grade, 
      subject, 
      limit = '20',
      priorityFilter 
    } = req.query as Record<string, string>;
    
    const filters: any = {};
    if (grade) filters.grade = parseInt(grade, 10);
    if (subject && subject !== 'all') filters.subject = subject;

    // Get expectations without coverage
    const expectations = await prisma.curriculumExpectation.findMany({
      where: {
        ...filters,
        lessonPlans: {
          none: {
            lessonPlan: { userId }
          }
        },
        unitPlans: {
          none: {
            unitPlan: { userId }
          }
        },
        daybookEntries: {
          none: {
            daybookEntry: { userId }
          }
        },
      },
      orderBy: [
        { subject: 'asc' },
        { strand: 'asc' },
        { code: 'asc' },
      ],
    });

    // Enrich with priority and suggestions
    const uncoveredWithPriority = expectations.map(exp => ({
      id: exp.id,
      code: exp.code,
      description: exp.description,
      descriptionFr: exp.descriptionFr,
      subject: exp.subject,
      grade: exp.grade,
      strand: exp.strand,
      substrand: exp.substrand,
      priority: calculatePriority(exp),
      suggestedDuration: 45, // Default 45 minutes for Grade 1
      suggestedActivities: getSuggestedActivities(exp),
    }));

    // Filter by priority if requested
    let filtered = uncoveredWithPriority;
    if (priorityFilter && priorityFilter !== 'all') {
      filtered = uncoveredWithPriority.filter(exp => exp.priority === priorityFilter);
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    // Apply limit
    const limitNum = Math.min(parseInt(limit, 10), 100);
    const results = filtered.slice(0, limitNum);

    res.json({
      success: true,
      data: {
        expectations: results,
        total: filtered.length,
        hasMore: filtered.length > limitNum,
      },
    });
  } catch (error) {
    logger.error('Error fetching uncovered expectations:', getErrorMessage(error));
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch uncovered expectations' 
    });
  }
});

/**
 * POST /api/curriculum-coverage/quick-plan
 * Generate a quick lesson plan for an uncovered expectation
 */
router.post('/quick-plan', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { expectationId, unitPlanId, date } = req.body;

    if (!expectationId) {
      res.status(400).json({ 
        success: false, 
        error: 'Expectation ID is required' 
      });
      return;
    }

    // Get the expectation details
    const expectation = await prisma.curriculumExpectation.findUnique({
      where: { id: expectationId },
    });

    if (!expectation) {
      res.status(404).json({ 
        success: false, 
        error: 'Expectation not found' 
      });
      return;
    }

    // Generate quick lesson plan template
    const quickPlan = {
      title: generateLessonTitle(expectation),
      titleFr: generateLessonTitleFr(expectation),
      duration: 45, // Standard Grade 1 lesson duration
      date: date || new Date().toISOString(),
      unitPlanId: unitPlanId || null,
      learningGoals: generateLearningGoals(expectation),
      learningGoalsFr: generateLearningGoalsFr(expectation),
      mindsOn: generateMindsOn(expectation),
      mindsOnFr: generateMindsOnFr(expectation),
      action: generateAction(expectation),
      actionFr: generateActionFr(expectation),
      consolidation: generateConsolidation(expectation),
      consolidationFr: generateConsolidationFr(expectation),
      materials: generateMaterials(expectation),
      assessmentNotes: generateAssessmentNotes(expectation),
      differentiationStrategies: {
        forStruggling: ["Utiliser des supports visuels", "Travail en petit groupe avec soutien"],
        forAdvanced: ["Défis supplémentaires", "Rôle de mentor pour les pairs"],
        forELL: ["Support visuel bilingue", "Vocabulaire pré-enseigné"],
        forIEP: ["Adaptations selon le PEI", "Temps supplémentaire si nécessaire"],
      },
      expectations: [expectationId],
    };

    res.json({
      success: true,
      data: quickPlan,
    });
  } catch (error) {
    logger.error('Error generating quick plan:', getErrorMessage(error));
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate quick plan' 
    });
  }
});

// Helper functions for generating lesson content
function getSuggestedActivities(expectation: any): string[] {
  const activities: Record<string, string[]> = {
    'Français (Immersion)': [
      "Lecture partagée avec discussion",
      "Activité d'écriture guidée",
      "Jeux de vocabulaire interactifs",
      "Cercle de lecture",
    ],
    'Mathématiques': [
      "Manipulation de matériel concret",
      "Résolution de problèmes en équipe",
      "Jeux mathématiques",
      "Exploration avec blocs et formes",
    ],
    'Sciences de la nature': [
      "Expérience pratique simple",
      "Observation et documentation",
      "Exploration sensorielle",
      "Projet de recherche guidé",
    ],
    'Sciences humaines': [
      "Discussion en cercle",
      "Création de carte ou timeline",
      "Jeu de rôle",
      "Projet communautaire",
    ],
    'Arts visuels': [
      "Création artistique libre",
      "Exploration de techniques",
      "Projet collaboratif",
      "Galerie d'art de classe",
    ],
    'Formation personnelle et sociale': [
      "Cercle de partage",
      "Jeux coopératifs",
      "Pratique de compétences sociales",
      "Réflexion personnelle guidée",
    ],
  };

  return activities[expectation.subject] || [
    "Discussion guidée",
    "Activité pratique",
    "Travail en équipe",
    "Réflexion individuelle",
  ];
}

function generateLessonTitle(expectation: any): string {
  const titles: Record<string, string> = {
    'Français (Immersion)': `Exploring: ${expectation.strand}`,
    'Mathématiques': `Math Discovery: ${expectation.strand}`,
    'Sciences de la nature': `Science Investigation: ${expectation.strand}`,
    'Sciences humaines': `Social Studies: ${expectation.strand}`,
    'Arts visuels': `Art Creation: ${expectation.strand}`,
    'Formation personnelle et sociale': `Personal Growth: ${expectation.strand}`,
  };
  return titles[expectation.subject] || `Learning: ${expectation.code}`;
}

function generateLessonTitleFr(expectation: any): string {
  const titles: Record<string, string> = {
    'Français (Immersion)': `Exploration : ${expectation.strandFr || expectation.strand}`,
    'Mathématiques': `Découverte mathématique : ${expectation.strandFr || expectation.strand}`,
    'Sciences de la nature': `Investigation scientifique : ${expectation.strandFr || expectation.strand}`,
    'Sciences humaines': `Études sociales : ${expectation.strandFr || expectation.strand}`,
    'Arts visuels': `Création artistique : ${expectation.strandFr || expectation.strand}`,
    'Formation personnelle et sociale': `Croissance personnelle : ${expectation.strandFr || expectation.strand}`,
  };
  return titles[expectation.subject] || `Apprentissage : ${expectation.code}`;
}

function generateLearningGoals(expectation: any): string {
  return `Students will be able to: ${expectation.description}`;
}

function generateLearningGoalsFr(expectation: any): string {
  return `Les élèves seront capables de : ${expectation.descriptionFr || expectation.description}`;
}

function generateMindsOn(expectation: any): string {
  const mindsOn: Record<string, string> = {
    'Français (Immersion)': "Begin with a picture walk through today's book. Students predict what the story might be about based on images.",
    'Mathématiques': "Number talk: Show a collection of objects and have students count in different ways.",
    'Sciences de la nature': "Mystery box: Students use their senses to guess what's inside without looking.",
    'Sciences humaines': "Think-Pair-Share: What do you know about this topic already?",
    'Arts visuels': "Art gallery walk: Look at examples and share what you notice.",
    'Formation personnelle et sociale': "Circle time: Share one feeling you had today.",
  };
  return mindsOn[expectation.subject] || "Activate prior knowledge through discussion and sharing.";
}

function generateMindsOnFr(expectation: any): string {
  const mindsOn: Record<string, string> = {
    'Français (Immersion)': "Commencer par une promenade d'images dans le livre d'aujourd'hui. Les élèves prédisent l'histoire.",
    'Mathématiques': "Causerie mathématique : Montrer une collection d'objets et compter de différentes façons.",
    'Sciences de la nature': "Boîte mystère : Les élèves utilisent leurs sens pour deviner le contenu.",
    'Sciences humaines': "Pense-Parle-Partage : Que savez-vous déjà sur ce sujet?",
    'Arts visuels': "Visite de galerie : Observer des exemples et partager vos observations.",
    'Formation personnelle et sociale': "Cercle de partage : Partager un sentiment ressenti aujourd'hui.",
  };
  return mindsOn[expectation.subject] || "Activer les connaissances antérieures par la discussion.";
}

function generateAction(expectation: any): string {
  const action: Record<string, string> = {
    'Français (Immersion)': "Guided reading in small groups while others work at literacy centers. Focus on decoding strategies and comprehension.",
    'Mathématiques': "Hands-on exploration with manipulatives. Students work in pairs to solve problems and explain their thinking.",
    'Sciences de la nature': "Conduct simple investigation. Record observations in science journals using pictures and words.",
    'Sciences humaines': "Create a class book or map about our community. Each student contributes one page.",
    'Arts visuels': "Art creation time using demonstrated technique. Teacher circulates to provide feedback.",
    'Formation personnelle et sociale': "Role-play scenarios in small groups. Practice using kind words and problem-solving.",
  };
  return action[expectation.subject] || "Engage in hands-on learning activities with peer collaboration.";
}

function generateActionFr(expectation: any): string {
  const action: Record<string, string> = {
    'Français (Immersion)': "Lecture guidée en petits groupes. Les autres travaillent aux centres de littératie.",
    'Mathématiques': "Exploration pratique avec matériel de manipulation. Travail en équipes pour résoudre et expliquer.",
    'Sciences de la nature': "Mener une investigation simple. Documenter les observations dans le journal scientifique.",
    'Sciences humaines': "Créer un livre ou une carte de classe sur notre communauté.",
    'Arts visuels': "Temps de création artistique avec la technique démontrée.",
    'Formation personnelle et sociale': "Jeux de rôle en petits groupes. Pratiquer la gentillesse et la résolution de problèmes.",
  };
  return action[expectation.subject] || "Participer à des activités d'apprentissage pratiques avec collaboration.";
}

function generateConsolidation(expectation: any): string {
  return "Students share their learning with a partner. Exit ticket: Draw or write one thing you learned today.";
}

function generateConsolidationFr(expectation: any): string {
  return "Les élèves partagent leur apprentissage avec un partenaire. Billet de sortie : Dessiner ou écrire une chose apprise.";
}

function generateMaterials(expectation: any): string[] {
  const materials: Record<string, string[]> = {
    'Français (Immersion)': [
      "Livres nivelés",
      "Tableau d'ancrage",
      "Cahiers d'écriture",
      "Cartes de vocabulaire",
    ],
    'Mathématiques': [
      "Matériel de manipulation",
      "Tableau de 100",
      "Dés et jetons",
      "Cahiers de math",
    ],
    'Sciences de la nature': [
      "Matériel d'expérience",
      "Journaux scientifiques",
      "Loupes",
      "Affiches de sécurité",
    ],
    'Sciences humaines': [
      "Cartes et globes",
      "Photos de la communauté",
      "Papier de construction",
      "Marqueurs",
    ],
    'Arts visuels': [
      "Peinture et pinceaux",
      "Papier de différentes textures",
      "Ciseaux sécuritaires",
      "Colle",
    ],
    'Formation personnelle et sociale': [
      "Cartes de sentiments",
      "Affiches de règles",
      "Livres sur les émotions",
      "Marionnettes",
    ],
  };
  return materials[expectation.subject] || ["Tableau blanc", "Marqueurs", "Papier", "Crayons"];
}

function generateAssessmentNotes(expectation: any): string {
  return "Observe student participation and understanding during activities. Use checklist to track skill development. Collect work samples for portfolio.";
}

export { router };