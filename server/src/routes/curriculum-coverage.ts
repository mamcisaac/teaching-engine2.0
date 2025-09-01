import type { Response } from 'express';
import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '@teaching-engine/database';

import { logger } from '../logger';
import { prisma } from '../prisma';
import { cache, CacheKeys, CacheTags } from '../services/cache';
import { getUserId } from '../utils/authHelpers';
import { getErrorMessage } from '../utils/type-guards';
import { rateLimiters } from '../middleware/rateLimit';

import type { AuthenticatedRequest } from './base/middleware';

const router = Router();

// ================== Input Validation Schemas ==================

const CoverageQuerySchema = z.object({
  grade: z.coerce.number().min(1).max(12).optional().default(1),
  subject: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
});

const UncoveredQuerySchema = z.object({
  grade: z.coerce.number().min(1).max(12).optional().default(1),
  subject: z.string().optional(),
  priorityFilter: z.enum(['high', 'medium', 'low', 'all']).optional().default('all'),
  strand: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});

const QuickPlanBodySchema = z.object({
  expectationId: z.string().uuid(),
  unitPlanId: z.string().uuid().optional(),
  date: z.string().datetime().optional(),
  useAI: z.boolean().optional().default(false),
  templatePreference: z.enum(['engaging', 'structured', 'creative', 'balanced']).optional(),
});

// ================== Types ==================

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
  lastUpdated?: Date;
}

interface UncoveredExpectation {
  id: string;
  code: string;
  description: string;
  descriptionFr?: string;
  subject: string;
  grade: number;
  strand: string;
  substrand?: string;
  priority: 'high' | 'medium' | 'low';
  suggestedDuration: number;
  suggestedActivities: string[];
  relatedLessons?: Array<{
    id: string;
    title: string;
    date: Date;
  }>;
}

interface QuickPlanTemplate {
  title: string;
  titleFr: string;
  duration: number;
  learningGoals: string;
  learningGoalsFr: string;
  mindsOn: string;
  mindsOnFr: string;
  action: string;
  actionFr: string;
  consolidation: string;
  consolidationFr: string;
  materials: string[];
  assessmentNotes: string;
  differentiationStrategies: {
    forStruggling: string[];
    forAdvanced: string[];
    forELL: string[];
    forIEP: string[];
  };
  expectations: string[];
}

// ================== Helper Functions ==================

/**
 * Calculate priority based on multiple factors
 */
function calculatePriority(expectation: any, context?: {
  lessonsPlanned?: number;
  timeOfYear?: string;
  previousCoverage?: number;
}): 'high' | 'medium' | 'low' {
  const coreSubjects = ['Français (Immersion)', 'Mathématiques'];
  const points = {
    coreSubject: 3,
    overallExpectation: 2,
    earlyStrand: 1,
    timeSensitive: 2,
    prerequisite: 2,
  };
  
  let score = 0;
  
  // Core subjects get higher priority
  if (coreSubjects.includes(expectation.subject)) {
    score += points.coreSubject;
  }
  
  // Overall expectations are more important
  if (expectation.type === 'overall' || expectation.code.includes('.1')) {
    score += points.overallExpectation;
  }
  
  // Early strands (foundation skills) get priority
  if (expectation.strand && ['Number Sense', 'Reading', 'Writing'].includes(expectation.strand)) {
    score += points.earlyStrand;
  }
  
  // Time-sensitive expectations (e.g., seasonal)
  if (context?.timeOfYear === 'fall' && expectation.strand?.includes('Seasonal')) {
    score += points.timeSensitive;
  }
  
  // Prerequisites for other expectations
  if (expectation.isPrerequisite) {
    score += points.prerequisite;
  }
  
  // Consider previous coverage
  if (context?.previousCoverage && context.previousCoverage === 0) {
    score += 1;
  }
  
  // Calculate final priority
  if (score >= 5) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}

/**
 * Get suggested activities based on expectation and context
 */
function getSuggestedActivities(expectation: any, context?: {
  season?: string;
  previousSuccessful?: string[];
}): string[] {
  const baseActivities: Record<string, string[]> = {
    'Français (Immersion)': [
      "Lecture partagée avec discussion guidée",
      "Activité d'écriture créative en petits groupes",
      "Jeux de vocabulaire interactifs avec cartes visuelles",
      "Cercle de lecture avec rôles assignés",
      "Théâtre de lecteurs pour pratiquer la fluidité",
    ],
    'Mathématiques': [
      "Manipulation de matériel concret (blocs, jetons)",
      "Résolution de problèmes en équipes avec présentation",
      "Jeux mathématiques adaptés au niveau",
      "Exploration avec blocs de base 10",
      "Création de problèmes par les élèves",
      "Stations de mathématiques rotatives",
    ],
    'Sciences de la nature': [
      "Expérience pratique avec journal d'observation",
      "Observation et documentation avec dessins annotés",
      "Exploration sensorielle guidée",
      "Projet de recherche avec présentation",
      "Création de modèles scientifiques",
      "Chasse au trésor scientifique",
    ],
    'Sciences humaines': [
      "Discussion en cercle avec bâton de parole",
      "Création de carte ou ligne du temps illustrée",
      "Jeu de rôle historique ou communautaire",
      "Projet communautaire avec invité spécial",
      "Création d'un livre de classe",
      "Enquête sur la communauté locale",
    ],
    'Arts visuels': [
      "Création artistique avec technique du jour",
      "Exploration de différents médiums",
      "Projet collaboratif de murale",
      "Galerie d'art avec vernissage",
      "Art inspiré par un artiste célèbre",
      "Journal artistique personnel",
    ],
    'Formation personnelle et sociale': [
      "Cercle de partage avec thème",
      "Jeux coopératifs pour développer l'esprit d'équipe",
      "Pratique de compétences sociales par scénarios",
      "Réflexion personnelle dans le journal",
      "Méditation guidée adaptée à l'âge",
      "Projet de gentillesse classe-école",
    ],
  };

  let activities = baseActivities[expectation.subject] || [
    "Discussion guidée en grand groupe",
    "Activité pratique en centres",
    "Travail collaboratif en équipes",
    "Réflexion individuelle dans le journal",
    "Présentation par les élèves",
  ];

  // Add seasonal activities if applicable
  if (context?.season === 'winter') {
    activities = activities.map(activity => {
      if (activity.includes('extérieur')) {
        return activity.replace('extérieur', 'intérieur');
      }
      return activity;
    });
  }

  // Prioritize previously successful activities
  if (context?.previousSuccessful && context.previousSuccessful.length > 0) {
    activities = [
      ...context.previousSuccessful.slice(0, 2),
      ...activities.slice(0, 3),
    ];
  }

  return activities.slice(0, 5); // Return top 5 activities
}

/**
 * Generate enhanced lesson template with better logic
 */
async function generateEnhancedTemplate(
  expectation: any,
  options?: {
    useAI?: boolean;
    templatePreference?: string;
    previousLessons?: any[];
    season?: string;
  }
): Promise<QuickPlanTemplate> {
  // Check if AI is available and requested
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  const useAI = options?.useAI && (hasOpenAI || hasAnthropic);

  if (useAI) {
    try {
      // If we have AI keys, use them for better generation
      if (hasOpenAI) {
        return await generateWithOpenAI(expectation, options);
      } else if (hasAnthropic) {
        return await generateWithAnthropic(expectation, options);
      }
    } catch (error) {
      logger.warn('AI generation failed, falling back to templates:', error);
      // Fall through to template generation
    }
  }

  // Enhanced template generation based on multiple factors
  const season = options?.season || getCurrentSeason();
  const preference = options?.templatePreference || 'balanced';
  
  // Analyze previous successful lessons for patterns
  const successPatterns = await analyzeSuccessfulPatterns(
    expectation.subject,
    options?.previousLessons
  );

  // Generate title based on expectation and preference
  const title = generateContextualTitle(expectation, preference, season);
  const titleFr = generateContextualTitleFr(expectation, preference, season);

  // Calculate optimal duration based on complexity
  const duration = calculateOptimalDuration(expectation, successPatterns);

  // Generate learning goals that align with expectation
  const learningGoals = generateAlignedLearningGoals(expectation, preference);
  const learningGoalsFr = generateAlignedLearningGoalsFr(expectation, preference);

  // Create activities based on preference and success patterns
  const activities = generateActivitiesByPreference(
    expectation,
    preference,
    successPatterns,
    season
  );

  return {
    title,
    titleFr,
    duration,
    date: new Date().toISOString(),
    learningGoals,
    learningGoalsFr,
    mindsOn: activities.mindsOn,
    mindsOnFr: activities.mindsOnFr,
    action: activities.action,
    actionFr: activities.actionFr,
    consolidation: activities.consolidation,
    consolidationFr: activities.consolidationFr,
    materials: generateContextualMaterials(expectation, activities, season),
    assessmentNotes: generateAssessmentStrategy(expectation, preference),
    differentiationStrategies: generateDifferentiationStrategies(
      expectation,
      successPatterns
    ),
    expectations: [expectation.id],
  };
}

// AI Integration Functions (when keys are available)
async function generateWithOpenAI(expectation: any, options: any): Promise<QuickPlanTemplate> {
  // This would integrate with OpenAI API when key is available
  throw new Error('OpenAI integration not implemented');
}

async function generateWithAnthropic(expectation: any, options: any): Promise<QuickPlanTemplate> {
  // This would integrate with Anthropic API when key is available
  throw new Error('Anthropic integration not implemented');
}

// Helper functions for template generation
function getCurrentSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

async function analyzeSuccessfulPatterns(subject: string, previousLessons?: any[]): Promise<any> {
  // Analyze patterns from successful previous lessons
  if (!previousLessons || previousLessons.length === 0) {
    return { avgDuration: 45, commonActivities: [], successfulStrategies: [] };
  }
  
  // Real analysis would go here
  return {
    avgDuration: 45,
    commonActivities: ['discussion', 'hands-on'],
    successfulStrategies: ['visual-supports', 'peer-work'],
  };
}

function generateContextualTitle(expectation: any, preference: string, season: string): string {
  const templates: Record<string, Record<string, string>> = {
    engaging: {
      'Français (Immersion)': `Adventure in ${expectation.strand}: ${expectation.code}`,
      'Mathématiques': `Math Mystery: ${expectation.strand}`,
      'Sciences de la nature': `Science Discovery: ${expectation.strand}`,
    },
    structured: {
      'Français (Immersion)': `${expectation.strand} - Lesson ${expectation.code}`,
      'Mathématiques': `Mathematics: ${expectation.strand} Study`,
      'Sciences de la nature': `Science Investigation: ${expectation.strand}`,
    },
    creative: {
      'Français (Immersion)': `Creating with ${expectation.strand}`,
      'Mathématiques': `Math Art: ${expectation.strand}`,
      'Sciences de la nature': `Science Exploration: ${expectation.strand}`,
    },
    balanced: {
      'Français (Immersion)': `Learning ${expectation.strand}: ${expectation.code}`,
      'Mathématiques': `Math Skills: ${expectation.strand}`,
      'Sciences de la nature': `Science Study: ${expectation.strand}`,
    },
  };

  return templates[preference]?.[expectation.subject] || 
         `${expectation.subject}: ${expectation.code}`;
}

function generateContextualTitleFr(expectation: any, preference: string, season: string): string {
  const templates: Record<string, Record<string, string>> = {
    engaging: {
      'Français (Immersion)': `Aventure en ${expectation.strandFr || expectation.strand}`,
      'Mathématiques': `Mystère mathématique : ${expectation.strandFr || expectation.strand}`,
      'Sciences de la nature': `Découverte scientifique : ${expectation.strandFr || expectation.strand}`,
    },
    structured: {
      'Français (Immersion)': `${expectation.strandFr || expectation.strand} - Leçon ${expectation.code}`,
      'Mathématiques': `Mathématiques : Étude de ${expectation.strandFr || expectation.strand}`,
      'Sciences de la nature': `Investigation scientifique : ${expectation.strandFr || expectation.strand}`,
    },
    creative: {
      'Français (Immersion)': `Créer avec ${expectation.strandFr || expectation.strand}`,
      'Mathématiques': `Art mathématique : ${expectation.strandFr || expectation.strand}`,
      'Sciences de la nature': `Exploration scientifique : ${expectation.strandFr || expectation.strand}`,
    },
    balanced: {
      'Français (Immersion)': `Apprendre ${expectation.strandFr || expectation.strand}`,
      'Mathématiques': `Compétences math : ${expectation.strandFr || expectation.strand}`,
      'Sciences de la nature': `Étude scientifique : ${expectation.strandFr || expectation.strand}`,
    },
  };

  return templates[preference]?.[expectation.subject] || 
         `${expectation.subject} : ${expectation.code}`;
}

function calculateOptimalDuration(expectation: any, patterns: any): number {
  // Base duration
  let duration = 45;
  
  // Adjust based on complexity
  if (expectation.type === 'overall' || expectation.complexity === 'high') {
    duration = 60;
  }
  
  // Adjust based on subject
  if (expectation.subject === 'Arts visuels') {
    duration = 60; // Art needs more time
  }
  
  // Consider successful patterns
  if (patterns.avgDuration) {
    duration = patterns.avgDuration;
  }
  
  // Grade 1 shouldn't exceed 60 minutes
  return Math.min(duration, 60);
}

function generateAlignedLearningGoals(expectation: any, preference: string): string {
  const prefix = {
    engaging: "Students will explore and discover how to",
    structured: "Students will learn to",
    creative: "Students will create and demonstrate",
    balanced: "Students will be able to",
  };
  
  return `${prefix[preference] || prefix.balanced}: ${expectation.description}`;
}

function generateAlignedLearningGoalsFr(expectation: any, preference: string): string {
  const prefix = {
    engaging: "Les élèves exploreront et découvriront comment",
    structured: "Les élèves apprendront à",
    creative: "Les élèves créeront et démontreront",
    balanced: "Les élèves seront capables de",
  };
  
  return `${prefix[preference] || prefix.balanced} : ${expectation.descriptionFr || expectation.description}`;
}

function generateActivitiesByPreference(
  expectation: any,
  preference: string,
  patterns: any,
  season: string
): any {
  const activities: Record<string, any> = {
    engaging: {
      mindsOn: "Start with a mystery box related to today's topic. Students guess contents using clues.",
      mindsOnFr: "Commencer avec une boîte mystère liée au sujet. Les élèves devinent le contenu.",
      action: "Interactive game-based learning with movement and collaboration.",
      actionFr: "Apprentissage par le jeu interactif avec mouvement et collaboration.",
      consolidation: "Students create and share their own mini-game about the concept.",
      consolidationFr: "Les élèves créent et partagent leur propre mini-jeu sur le concept.",
    },
    structured: {
      mindsOn: "Review previous learning with guided questions. Set clear objectives.",
      mindsOnFr: "Réviser les apprentissages avec questions guidées. Établir les objectifs.",
      action: "Step-by-step instruction with guided practice and checking for understanding.",
      actionFr: "Instruction étape par étape avec pratique guidée et vérification.",
      consolidation: "Complete exit ticket with key learning points.",
      consolidationFr: "Compléter le billet de sortie avec les points clés.",
    },
    creative: {
      mindsOn: "Open-ended exploration with art or storytelling connection.",
      mindsOnFr: "Exploration ouverte avec connexion artistique ou narrative.",
      action: "Creative project allowing multiple ways to show understanding.",
      actionFr: "Projet créatif permettant plusieurs façons de démontrer la compréhension.",
      consolidation: "Gallery walk to share and celebrate creations.",
      consolidationFr: "Galerie pour partager et célébrer les créations.",
    },
    balanced: {
      mindsOn: "Think-pair-share about the topic with visual supports.",
      mindsOnFr: "Pense-parle-partage sur le sujet avec supports visuels.",
      action: "Combination of instruction, hands-on practice, and collaboration.",
      actionFr: "Combinaison d'instruction, pratique concrète et collaboration.",
      consolidation: "Reflection in learning journal with sharing option.",
      consolidationFr: "Réflexion dans le journal avec option de partage.",
    },
  };
  
  return activities[preference] || activities.balanced;
}

function generateContextualMaterials(expectation: any, activities: any, season: string): string[] {
  const baseMaterials = [
    "Tableau interactif",
    "Cahiers d'apprentissage",
    "Crayons et marqueurs",
  ];
  
  const subjectMaterials: Record<string, string[]> = {
    'Français (Immersion)': [
      "Livres nivelés appropriés",
      "Cartes de vocabulaire illustrées",
      "Tableau d'ancrage",
    ],
    'Mathématiques': [
      "Matériel de manipulation",
      "Tableau de 100",
      "Dés et jetons",
    ],
    'Sciences de la nature': [
      "Matériel d'expérimentation",
      "Loupes",
      "Journaux scientifiques",
    ],
    'Arts visuels': [
      "Peinture et pinceaux",
      "Papier varié",
      "Matériaux recyclés",
    ],
  };
  
  const materials = [
    ...baseMaterials,
    ...(subjectMaterials[expectation.subject] || []),
  ];
  
  // Add seasonal materials
  if (season === 'fall') {
    materials.push("Feuilles d'automne");
  } else if (season === 'winter') {
    materials.push("Images d'hiver");
  }
  
  return materials;
}

function generateAssessmentStrategy(expectation: any, preference: string): string {
  const strategies: Record<string, string> = {
    engaging: "Observe engagement and participation during game activities. Use peer assessment for mini-games.",
    structured: "Use checklist for skill mastery. Collect exit tickets for understanding check.",
    creative: "Portfolio assessment of creative work. Self-assessment using success criteria.",
    balanced: "Combination of observation, work samples, and self-reflection. Use rubric aligned with learning goals.",
  };
  
  return strategies[preference] || strategies.balanced;
}

function generateDifferentiationStrategies(expectation: any, patterns: any): any {
  return {
    forStruggling: [
      "Utiliser des supports visuels supplémentaires",
      "Travail en petit groupe avec soutien direct",
      "Tâches simplifiées avec même objectif",
      "Temps supplémentaire pour compléter",
      "Manipulation concrète avant abstraction",
    ],
    forAdvanced: [
      "Défis d'enrichissement supplémentaires",
      "Rôle de mentor pour les pairs",
      "Questions de réflexion approfondie",
      "Projet d'extension créatif",
      "Recherche indépendante guidée",
    ],
    forELL: [
      "Support visuel bilingue",
      "Vocabulaire pré-enseigné avec images",
      "Partenaire de langue pour support",
      "Démonstrations répétées",
      "Options de réponse non-verbales",
    ],
    forIEP: [
      "Adaptations selon le PEI spécifique",
      "Pauses sensorielles au besoin",
      "Technologie d'assistance disponible",
      "Choix dans les modalités de réponse",
      "Environnement calme disponible",
    ],
  };
}

// ================== API Endpoints ==================

/**
 * GET /api/curriculum-coverage
 * Enhanced endpoint with pagination, caching, and better error handling
 */
router.get('/', rateLimiters.read, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    // Validate query parameters
    const validationResult = CoverageQuerySchema.safeParse(req.query);
    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        error: 'INVALID_PARAMETERS',
        details: validationResult.error.flatten(),
      });
      return;
    }

    const { grade, subject, startDate, endDate, page, limit } = validationResult.data;
    const offset = (page - 1) * limit;

    // Check cache first
    const cacheKey = `coverage:${userId}:${grade}:${subject || 'all'}:${page}:${limit}`;
    const cacheService = cache();
    
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    // Build optimized query
    const whereClause: any = { grade };
    if (subject && subject !== 'all') {
      whereClause.subject = subject;
    }

    // Get total count for pagination
    const totalCount = await prisma.curriculumExpectation.count({
      where: whereClause,
    });

    // Fetch expectations with coverage data using optimized query
    const expectations = await prisma.curriculumExpectation.findMany({
      where: whereClause,
      skip: offset,
      take: limit,
      include: {
        _count: {
          select: {
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
              }
            },
            unitPlans: {
              where: {
                unitPlan: { userId }
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
              }
            },
          }
        }
      },
      orderBy: [
        { subject: 'asc' },
        { strand: 'asc' },
        { code: 'asc' },
      ],
    });

    // Calculate coverage statistics efficiently
    const coverageStats = calculateCoverageStatistics(expectations, userId);

    // Calculate historical trends
    const trends = await calculateHistoricalTrends(userId, grade, subject);

    const response = {
      success: true,
      data: {
        overall: coverageStats.overall,
        bySubject: coverageStats.bySubject,
        byStrand: coverageStats.byStrand,
        trends,
        dateRange: startDate && endDate ? { startDate, endDate } : null,
      },
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };

    // Cache the response for 5 minutes
    await cacheService.set(cacheKey, response, { 
      ttl: 300,
      tags: [`curriculum:${grade}`, `user:${userId}`] 
    });

    res.json(response);
  } catch (error) {
    handleError(res, error, 'Failed to fetch curriculum coverage');
  }
});

/**
 * GET /api/curriculum-coverage/uncovered
 * Enhanced endpoint with better filtering and search
 */
router.get('/uncovered', rateLimiters.read, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    // Validate query parameters
    const validationResult = UncoveredQuerySchema.safeParse(req.query);
    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        error: 'INVALID_PARAMETERS',
        details: validationResult.error.flatten(),
      });
      return;
    }

    const { grade, subject, priorityFilter, strand, search, page, limit } = validationResult.data;
    const offset = (page - 1) * limit;

    // Build where clause for uncovered expectations
    const whereClause: any = {
      grade,
      AND: [
        {
          lessonPlans: {
            none: {
              lessonPlan: { userId }
            }
          }
        },
        {
          unitPlans: {
            none: {
              unitPlan: { userId }
            }
          }
        },
        {
          daybookEntries: {
            none: {
              daybookEntry: { userId }
            }
          }
        }
      ]
    };

    if (subject && subject !== 'all') {
      whereClause.subject = subject;
    }

    if (strand && strand !== 'all') {
      whereClause.strand = strand;
    }

    if (search) {
      whereClause.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { descriptionFr: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count for pagination
    const totalCount = await prisma.curriculumExpectation.count({
      where: whereClause,
    });

    // Fetch uncovered expectations
    const expectations = await prisma.curriculumExpectation.findMany({
      where: whereClause,
      skip: offset,
      take: limit,
      orderBy: [
        { subject: 'asc' },
        { strand: 'asc' },
        { code: 'asc' },
      ],
    });

    // Get related successful lessons for context
    const relatedLessons = await getRelatedSuccessfulLessons(
      expectations.map(e => e.subject),
      userId
    );

    // Enrich expectations with priority and suggestions
    const enrichedExpectations = expectations.map(exp => {
      const priority = calculatePriority(exp, {
        timeOfYear: getCurrentSeason(),
        lessonsPlanned: relatedLessons[exp.subject]?.length || 0,
      });
      
      // Filter by priority if requested
      if (priorityFilter !== 'all' && priority !== priorityFilter) {
        return null;
      }
      
      return {
        id: exp.id,
        code: exp.code,
        description: exp.description,
        descriptionFr: exp.descriptionFr,
        subject: exp.subject,
        grade: exp.grade,
        strand: exp.strand,
        substrand: exp.substrand,
        priority,
        suggestedDuration: calculateOptimalDuration(exp, {}),
        suggestedActivities: getSuggestedActivities(exp, {
          season: getCurrentSeason(),
          previousSuccessful: relatedLessons[exp.subject]?.map((l: any) => l.title) || [],
        }),
        relatedLessons: relatedLessons[exp.subject]?.slice(0, 3) || [],
      };
    }).filter(Boolean);

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    enrichedExpectations.sort((a, b) => 
      priorityOrder[a!.priority] - priorityOrder[b!.priority]
    );

    res.json({
      success: true,
      data: {
        expectations: enrichedExpectations,
        total: totalCount,
        hasMore: totalCount > offset + limit,
      },
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    handleError(res, error, 'Failed to fetch uncovered expectations');
  }
});

/**
 * POST /api/curriculum-coverage/quick-plan
 * Enhanced endpoint with AI integration and better templates
 */
router.post('/quick-plan', rateLimiters.write, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    // Validate request body
    const validationResult = QuickPlanBodySchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        error: 'INVALID_REQUEST',
        details: validationResult.error.flatten(),
      });
      return;
    }

    const { expectationId, unitPlanId, date, useAI, templatePreference } = validationResult.data;

    // Verify expectation exists
    const expectation = await prisma.curriculumExpectation.findUnique({
      where: { id: expectationId },
      include: {
        lessonPlans: {
          where: {
            lessonPlan: { userId }
          },
          take: 5,
          orderBy: {
            lessonPlan: { createdAt: 'desc' }
          },
          include: {
            lessonPlan: true
          }
        }
      }
    });

    if (!expectation) {
      res.status(404).json({
        success: false,
        error: 'EXPECTATION_NOT_FOUND',
        message: 'The specified curriculum expectation does not exist',
      });
      return;
    }

    // Check if already covered
    if (expectation.lessonPlans.length > 0) {
      res.status(409).json({
        success: false,
        error: 'ALREADY_COVERED',
        message: 'This expectation already has lesson plans',
        existingLessons: expectation.lessonPlans.map(lp => ({
          id: lp.lessonPlan.id,
          title: lp.lessonPlan.title,
          date: lp.lessonPlan.date,
        })),
      });
      return;
    }

    // Get previous successful lessons for context
    const previousLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId,
        unitPlan: {
          subject: expectation.subject,
        }
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    // Generate enhanced lesson plan
    const quickPlan = await generateEnhancedTemplate(expectation, {
      useAI,
      templatePreference,
      previousLessons,
      season: getCurrentSeason(),
    });

    // Add metadata
    const enhancedPlan = {
      ...quickPlan,
      date: date || new Date().toISOString(),
      unitPlanId,
      metadata: {
        generatedAt: new Date().toISOString(),
        method: useAI ? 'ai-enhanced' : 'smart-template',
        templatePreference,
        expectationCode: expectation.code,
        expectationSubject: expectation.subject,
      },
    };

    res.json({
      success: true,
      data: enhancedPlan,
    });
  } catch (error) {
    handleError(res, error, 'Failed to generate quick plan');
  }
});

/**
 * GET /api/curriculum-coverage/trends
 * Get historical coverage trends
 */
router.get('/trends', rateLimiters.read, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { grade = 1, subject, months = 6 } = req.query as Record<string, any>;
    
    const trends = await calculateHistoricalTrends(
      userId,
      parseInt(grade),
      subject,
      parseInt(months)
    );

    res.json({
      success: true,
      data: trends,
    });
  } catch (error) {
    handleError(res, error, 'Failed to fetch coverage trends');
  }
});

// ================== Helper Functions for Endpoints ==================

function calculateCoverageStatistics(expectations: any[], userId: string): any {
  const bySubject = new Map<string, CoverageStats>();
  const byStrand = new Map<string, CoverageStats>();
  
  let totalExpectations = 0;
  let coveredExpectations = 0;

  expectations.forEach(exp => {
    const isCovered = exp._count.lessonPlans > 0 || 
                     exp._count.unitPlans > 0 || 
                     exp._count.daybookEntries > 0;
    
    totalExpectations++;
    if (isCovered) {
      coveredExpectations++;
    }

    // By subject
    if (!bySubject.has(exp.subject)) {
      bySubject.set(exp.subject, {
        subject: exp.subject,
        total: 0,
        covered: 0,
        percentage: 0,
        uncoveredExpectations: [],
      });
    }
    const subjectStats = bySubject.get(exp.subject)!;
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
    if (!byStrand.has(strandKey)) {
      byStrand.set(strandKey, {
        subject: exp.subject,
        strand: exp.strand,
        total: 0,
        covered: 0,
        percentage: 0,
        uncoveredExpectations: [],
      });
    }
    const strandStats = byStrand.get(strandKey)!;
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

  // Calculate percentages
  bySubject.forEach(stats => {
    stats.percentage = stats.total > 0 ? Math.round((stats.covered / stats.total) * 100) : 0;
    stats.lastUpdated = new Date();
  });

  byStrand.forEach(stats => {
    stats.percentage = stats.total > 0 ? Math.round((stats.covered / stats.total) * 100) : 0;
    stats.lastUpdated = new Date();
  });

  const overallPercentage = totalExpectations > 0 
    ? Math.round((coveredExpectations / totalExpectations) * 100) 
    : 0;

  return {
    overall: {
      total: totalExpectations,
      covered: coveredExpectations,
      uncovered: totalExpectations - coveredExpectations,
      percentage: overallPercentage,
    },
    bySubject: Array.from(bySubject.values()),
    byStrand: Array.from(byStrand.values()),
  };
}

async function calculateHistoricalTrends(
  userId: string,
  grade: number,
  subject?: string,
  months: number = 6
): Promise<any[]> {
  const trends = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(now.getMonth() - i);
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    // Get coverage at this point in time
    const whereClause: any = { grade };
    if (subject) {
      whereClause.subject = subject;
    }

    const expectations = await prisma.curriculumExpectation.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            lessonPlans: {
              where: {
                lessonPlan: {
                  userId,
                  date: { lte: endOfMonth }
                }
              }
            },
            unitPlans: {
              where: {
                unitPlan: {
                  userId,
                  createdAt: { lte: endOfMonth }
                }
              }
            },
          }
        }
      }
    });

    const covered = expectations.filter(exp => 
      exp._count.lessonPlans > 0 || exp._count.unitPlans > 0
    ).length;

    const percentage = expectations.length > 0 
      ? Math.round((covered / expectations.length) * 100)
      : 0;

    trends.push({
      month: date.toLocaleDateString('en', { month: 'short', year: '2-digit' }),
      coverage: percentage,
      total: expectations.length,
      covered,
    });
  }

  return trends;
}

async function getRelatedSuccessfulLessons(
  subjects: string[],
  userId: string
): Promise<Record<string, any[]>> {
  const lessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      userId,
      unitPlan: {
        subject: { in: subjects }
      },
      // Consider lessons with positive feedback as successful
      daybookEntries: {
        some: {
          whatWorked: { not: null }
        }
      }
    },
    select: {
      id: true,
      title: true,
      date: true,
      unitPlan: {
        select: { subject: true }
      }
    },
    take: 20,
    orderBy: { createdAt: 'desc' }
  });

  // Group by subject
  const grouped: Record<string, any[]> = {};
  lessons.forEach(lesson => {
    const subject = lesson.unitPlan?.subject;
    if (subject) {
      if (!grouped[subject]) {
        grouped[subject] = [];
      }
      grouped[subject].push({
        id: lesson.id,
        title: lesson.title,
        date: lesson.date,
      });
    }
  });

  return grouped;
}

function handleError(res: Response, error: unknown, defaultMessage: string): void {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    logger.error(`Prisma error ${error.code}:`, error.message);
    
    const errorMessages: Record<string, string> = {
      'P2002': 'A unique constraint was violated',
      'P2025': 'Record not found',
      'P2003': 'Foreign key constraint failed',
    };
    
    res.status(400).json({
      success: false,
      error: error.code,
      message: errorMessages[error.code] || 'Database operation failed',
    });
  } else if (error instanceof z.ZodError) {
    res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      details: error.flatten(),
    });
  } else {
    logger.error(`Unexpected error:`, getErrorMessage(error));
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: defaultMessage,
    });
  }
}

export { router };