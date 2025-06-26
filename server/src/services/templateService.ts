import { prisma } from '../prisma';
import { Prisma } from '../prisma';

export interface TemplateSearchOptions {
  type?: 'UNIT_PLAN' | 'LESSON_PLAN';
  category?: 'BY_SUBJECT' | 'BY_GRADE' | 'BY_THEME' | 'BY_SEASON' | 'BY_SKILL' | 'CUSTOM';
  subject?: string;
  gradeMin?: number;
  gradeMax?: number;
  isSystem?: boolean;
  isPublic?: boolean;
  createdByUserId?: number;
  search?: string;
  tags?: string[];
  sortBy?: 'title' | 'usageCount' | 'averageRating' | 'createdAt' | 'lastUsedAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface TemplateCreateData {
  title: string;
  titleFr?: string;
  description?: string;
  descriptionFr?: string;
  type: 'UNIT_PLAN' | 'LESSON_PLAN';
  category: 'BY_SUBJECT' | 'BY_GRADE' | 'BY_THEME' | 'BY_SEASON' | 'BY_SKILL' | 'CUSTOM';
  subject?: string;
  gradeMin?: number;
  gradeMax?: number;
  tags?: string[];
  keywords?: string[];
  isPublic?: boolean;
  content: Record<string, unknown>;
  estimatedWeeks?: number;
  unitStructure?: Record<string, unknown>;
  estimatedMinutes?: number;
  lessonStructure?: Record<string, unknown>;
}

export interface AppliedTemplateData {
  template: {
    id: string;
    title: string;
    type: string;
    content: Record<string, unknown>;
    unitStructure?: Record<string, unknown>;
    lessonStructure?: Record<string, unknown>;
    estimatedWeeks?: number;
    estimatedMinutes?: number;
  };
  appliedContent: Record<string, unknown>;
}

/**
 * Template Service
 * Handles business logic for template management, including creation, search, and application
 */
export class TemplateService {
  /**
   * Search and filter templates based on criteria
   */
  static async searchTemplates(userId: number, options: TemplateSearchOptions) {
    const {
      type,
      category,
      subject,
      gradeMin,
      gradeMax,
      isSystem,
      isPublic,
      createdByUserId,
      search,
      tags,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = 20,
      offset = 0,
    } = options;

    const where: Prisma.PlanTemplateWhereInput = {
      OR: [
        { isSystem: true }, // System templates visible to all
        { isPublic: true }, // Public templates visible to all
        { createdByUserId: userId }, // User's own templates
      ],
    };

    // Apply filters
    if (type) where.type = type;
    if (category) where.category = category;
    if (subject) where.subject = subject;
    if (gradeMin !== undefined || gradeMax !== undefined) {
      where.AND = [];
      if (gradeMin !== undefined) {
        where.AND.push({
          OR: [
            { gradeMin: { lte: gradeMin } },
            { gradeMin: null },
          ],
        });
      }
      if (gradeMax !== undefined) {
        where.AND.push({
          OR: [
            { gradeMax: { gte: gradeMax } },
            { gradeMax: null },
          ],
        });
      }
    }
    if (isSystem !== undefined) where.isSystem = isSystem;
    if (isPublic !== undefined) where.isPublic = isPublic;
    if (createdByUserId !== undefined) where.createdByUserId = createdByUserId;

    // Text search with database-specific case handling
    if (search) {
      const mode = process.env.DATABASE_URL?.includes('postgresql') 
        ? { mode: 'insensitive' as const } 
        : {};
        
      where.OR = [
        { title: { contains: search, ...mode } },
        { description: { contains: search, ...mode } },
        { titleFr: { contains: search, ...mode } },
        { descriptionFr: { contains: search, ...mode } },
      ];
    }

    // Tag filtering - Using JSON array contains for tags
    if (tags && tags.length > 0) {
      where.tags = {
        path: [],
        array_contains: tags
      } as Prisma.JsonFilter<"PlanTemplate">; // Type assertion for JSON array operations
    }

    // Sorting
    const orderBy: Prisma.PlanTemplateOrderByWithRelationInput = {};
    if (sortBy === 'title') orderBy.title = sortOrder;
    else if (sortBy === 'usageCount') orderBy.usageCount = sortOrder;
    else if (sortBy === 'averageRating') orderBy.averageRating = sortOrder;
    else if (sortBy === 'createdAt') orderBy.createdAt = sortOrder;
    else if (sortBy === 'lastUsedAt') orderBy.lastUsedAt = sortOrder;

    const [templates, total] = await Promise.all([
      prisma.planTemplate.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
        include: {
          createdByUser: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              ratings: true,
              variations: true,
            },
          },
        },
      }),
      prisma.planTemplate.count({ where }),
    ]);

    return {
      templates,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  /**
   * Get a template by ID with full details
   */
  static async getTemplateById(userId: number, templateId: string) {
    const template = await prisma.planTemplate.findFirst({
      where: {
        id: templateId,
        OR: [
          { isSystem: true },
          { isPublic: true },
          { createdByUserId: userId },
        ],
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
          },
        },
        ratings: {
          select: {
            id: true,
            userId: true,
            rating: true,
            comment: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        variations: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            ratings: true,
          },
        },
      },
    });

    return template;
  }

  /**
   * Create a new template
   */
  static async createTemplate(userId: number, data: TemplateCreateData) {
    const {
      tags = [],
      keywords = [],
      isPublic = false,
      content,
      unitStructure,
      lessonStructure,
      ...templateData
    } = data;

    // Validate grade range
    if (templateData.gradeMin && templateData.gradeMax && templateData.gradeMin > templateData.gradeMax) {
      throw new Error('Minimum grade cannot be greater than maximum grade');
    }

    const template = await prisma.planTemplate.create({
      data: {
        ...templateData,
        createdByUserId: userId,
        tags,
        keywords,
        isPublic,
        content: content as Prisma.JsonValue,
        unitStructure: unitStructure as Prisma.JsonValue || null,
        lessonStructure: lessonStructure as Prisma.JsonValue || null,
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            ratings: true,
            variations: true,
          },
        },
      },
    });

    return template;
  }

  /**
   * Update an existing template
   */
  static async updateTemplate(userId: number, templateId: string, data: Partial<TemplateCreateData>) {
    // Verify ownership (only creator can edit)
    const existing = await prisma.planTemplate.findFirst({
      where: {
        id: templateId,
        createdByUserId: userId,
        isSystem: false, // System templates cannot be edited
      },
    });

    if (!existing) {
      throw new Error('Template not found or not editable');
    }

    const { gradeMin, gradeMax, ...updateData } = data;

    // Validate grade range if provided
    if (gradeMin && gradeMax && gradeMin > gradeMax) {
      throw new Error('Minimum grade cannot be greater than maximum grade');
    }

    const template = await prisma.planTemplate.update({
      where: { id: templateId },
      data: {
        ...updateData,
        gradeMin,
        gradeMax,
        content: updateData.content ? updateData.content as Prisma.JsonValue : undefined,
        unitStructure: updateData.unitStructure ? updateData.unitStructure as Prisma.JsonValue : undefined,
        lessonStructure: updateData.lessonStructure ? updateData.lessonStructure as Prisma.JsonValue : undefined,
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
          },
        },
        variations: true,
        _count: {
          select: {
            ratings: true,
          },
        },
      },
    });

    return template;
  }

  /**
   * Delete a template
   */
  static async deleteTemplate(userId: number, templateId: string) {
    // Verify ownership
    const template = await prisma.planTemplate.findFirst({
      where: {
        id: templateId,
        createdByUserId: userId,
        isSystem: false, // System templates cannot be deleted
      },
    });

    if (!template) {
      throw new Error('Template not found or not deletable');
    }

    await prisma.planTemplate.delete({
      where: { id: templateId },
    });

    return true;
  }

  /**
   * Duplicate a template
   */
  static async duplicateTemplate(userId: number, templateId: string, title?: string, isPublic = false) {
    const original = await prisma.planTemplate.findFirst({
      where: {
        id: templateId,
        OR: [
          { isSystem: true },
          { isPublic: true },
          { createdByUserId: userId },
        ],
      },
    });

    if (!original) {
      throw new Error('Template not found');
    }

    const duplicated = await prisma.planTemplate.create({
      data: {
        title: title || `${original.title} (Copy)`,
        titleFr: original.titleFr ? `${original.titleFr} (Copie)` : null,
        description: original.description,
        descriptionFr: original.descriptionFr,
        type: original.type,
        category: original.category,
        subject: original.subject,
        gradeMin: original.gradeMin,
        gradeMax: original.gradeMax,
        tags: original.tags,
        keywords: original.keywords,
        createdByUserId: userId,
        isSystem: false,
        isPublic,
        content: original.content as Prisma.JsonValue,
        estimatedWeeks: original.estimatedWeeks,
        unitStructure: original.unitStructure as Prisma.JsonValue,
        estimatedMinutes: original.estimatedMinutes,
        lessonStructure: original.lessonStructure as Prisma.JsonValue,
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            ratings: true,
            variations: true,
          },
        },
      },
    });

    return duplicated;
  }

  /**
   * Apply a template to create new plan data
   */
  static async applyTemplate(userId: number, templateId: string, customizations: Record<string, unknown> = {}): Promise<AppliedTemplateData> {
    const template = await prisma.planTemplate.findFirst({
      where: {
        id: templateId,
        OR: [
          { isSystem: true },
          { isPublic: true },
          { createdByUserId: userId },
        ],
      },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    // Update usage tracking
    await prisma.planTemplate.update({
      where: { id: template.id },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });

    // Merge template content with user customizations
    const appliedContent = {
      ...(template.content as Record<string, unknown>),
      ...(customizations || {}),
    };

    return {
      template: {
        id: template.id,
        title: template.title,
        type: template.type,
        content: appliedContent,
        unitStructure: template.unitStructure as Record<string, unknown> || undefined,
        lessonStructure: template.lessonStructure as Record<string, unknown> || undefined,
        estimatedWeeks: template.estimatedWeeks,
        estimatedMinutes: template.estimatedMinutes,
      },
      appliedContent,
    };
  }

  /**
   * Rate a template
   */
  static async rateTemplate(userId: number, templateId: string, rating: number, comment?: string) {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Check if template exists and is accessible
    const template = await prisma.planTemplate.findFirst({
      where: {
        id: templateId,
        OR: [
          { isSystem: true },
          { isPublic: true },
          { createdByUserId: userId },
        ],
      },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    // Upsert rating
    const templateRating = await prisma.templateRating.upsert({
      where: {
        templateId_userId: {
          templateId,
          userId,
        },
      },
      update: {
        rating,
        comment,
      },
      create: {
        templateId,
        userId,
        rating,
        comment,
      },
    });

    // Recalculate average rating
    const ratings = await prisma.templateRating.findMany({
      where: { templateId },
      select: { rating: true },
    });

    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
      : 0;

    await prisma.planTemplate.update({
      where: { id: templateId },
      data: { averageRating },
    });

    return templateRating;
  }

  /**
   * Get filter options for template search
   */
  static async getFilterOptions(userId: number) {
    const [subjects, grades, categories, tags] = await Promise.all([
      prisma.planTemplate.findMany({
        where: {
          OR: [
            { isSystem: true },
            { isPublic: true },
            { createdByUserId: userId },
          ],
          subject: { not: null },
        },
        select: { subject: true },
        distinct: ['subject'],
      }),
      prisma.planTemplate.findMany({
        where: {
          AND: [
            {
              OR: [
                { isSystem: true },
                { isPublic: true },
                { createdByUserId: userId },
              ],
            },
            {
              OR: [
                { gradeMin: { not: null } },
                { gradeMax: { not: null } },
              ],
            },
          ],
        },
        select: { gradeMin: true, gradeMax: true },
      }),
      prisma.planTemplate.findMany({
        select: { category: true },
        distinct: ['category'],
      }),
      prisma.planTemplate.findMany({
        where: {
          OR: [
            { isSystem: true },
            { isPublic: true },
            { createdByUserId: userId },
          ],
        },
        select: { tags: true },
      }),
    ]);

    const uniqueSubjects = subjects
      .map(t => t.subject)
      .filter(s => s !== null)
      .sort();

    const gradeRange = grades.reduce(
      (range, template) => {
        if (template.gradeMin) range.min = Math.min(range.min, template.gradeMin);
        if (template.gradeMax) range.max = Math.max(range.max, template.gradeMax);
        return range;
      },
      { min: 12, max: 1 }
    );

    const allTags = tags
      .flatMap(t => Array.isArray(t.tags) ? t.tags : [])
      .filter((tag, index, array) => array.indexOf(tag) === index)
      .sort();

    return {
      subjects: uniqueSubjects,
      grades: Array.from({ length: gradeRange.max - gradeRange.min + 1 }, (_, i) => gradeRange.min + i),
      categories: categories.map(c => c.category),
      tags: allTags,
    };
  }

  /**
   * Create system starter templates
   */
  static async createStarterTemplates() {
    const starterTemplates = [
      {
        title: 'Grade 1 Math - Number Sense Unit',
        titleFr: 'Mathématiques 1re année - Unité de sens du nombre',
        description: 'A comprehensive 2-week unit exploring numbers 1-20 with hands-on activities and assessment opportunities.',
        descriptionFr: 'Une unité complète de 2 semaines explorant les nombres 1-20 avec des activités pratiques et des opportunités d\'évaluation.',
        type: 'UNIT_PLAN' as const,
        category: 'BY_SUBJECT' as const,
        subject: 'Mathematics',
        gradeMin: 1,
        gradeMax: 1,
        isSystem: true,
        isPublic: true,
        estimatedWeeks: 2,
        tags: ['number-sense', 'hands-on', 'primary', 'counting', 'place-value'],
        keywords: ['numbers', 'counting', 'math', 'grade-1', 'manipulatives'],
        content: {
          overview: 'Students will develop number sense by exploring numbers 1-20 through various concrete, pictorial, and abstract activities.',
          bigIdeas: 'Numbers have relationships and patterns. Quantities can be represented in multiple ways.',
          learningGoals: [
            'Count forward and backward from 1 to 20',
            'Recognize and represent numbers in different ways',
            'Compare quantities using more than, less than, equal to',
            'Solve simple addition and subtraction problems using concrete materials'
          ],
          essentialQuestions: [
            'How do we use numbers in our daily lives?',
            'What different ways can we show the same quantity?',
            'How do numbers help us compare amounts?'
          ],
          keyVocabulary: ['number', 'count', 'more', 'less', 'equal', 'add', 'subtract', 'altogether'],
          assessments: [
            {
              type: 'diagnostic',
              description: 'Number recognition and counting assessment',
              timing: 'Beginning of unit'
            },
            {
              type: 'formative',
              description: 'Daily number talks and manipulative explorations',
              timing: 'Throughout unit'
            },
            {
              type: 'summative',
              description: 'Number representation portfolio',
              timing: 'End of unit'
            }
          ],
          differentiationStrategies: {
            forStruggling: [
              'Use concrete manipulatives for all activities',
              'Start with smaller number ranges (1-10)',
              'Provide visual number lines and hundreds charts',
              'Use peer buddies for support'
            ],
            forAdvanced: [
              'Extend to numbers beyond 20',
              'Introduce skip counting patterns',
              'Explore number relationships and patterns',
              'Create their own number problems'
            ],
            forELL: [
              'Use visual supports and gestures',
              'Provide number vocabulary cards with pictures',
              'Use home language connections where possible',
              'Focus on mathematical language development'
            ]
          }
        },
        unitStructure: {
          phases: [
            {
              name: 'Number Recognition & Counting',
              description: 'Building foundational counting skills and number recognition',
              estimatedDays: 4,
              learningGoals: ['Count objects accurately', 'Recognize written numerals 1-20']
            },
            {
              name: 'Number Representations',
              description: 'Exploring different ways to show quantities',
              estimatedDays: 3,
              learningGoals: ['Show numbers using manipulatives, pictures, and symbols']
            },
            {
              name: 'Comparing Quantities',
              description: 'Understanding more than, less than, equal to',
              estimatedDays: 2,
              learningGoals: ['Compare sets of objects', 'Use comparison vocabulary']
            },
            {
              name: 'Adding and Subtracting',
              description: 'Introduction to operations with concrete materials',
              estimatedDays: 3,
              learningGoals: ['Solve simple addition and subtraction problems using objects']
            }
          ],
          resources: [
            { title: 'Counting Bears', type: 'manipulative', notes: '10 bears per student' },
            { title: 'Number Cards 1-20', type: 'printable', notes: 'Laminate for durability' },
            { title: 'Ten Frames', type: 'printable', notes: 'Print on cardstock' }
          ]
        }
      },
      {
        title: 'Grade 3 Language - Poetry Unit',
        titleFr: 'Français 3e année - Unité de poésie',
        description: 'A creative 1-week exploration of poetry forms, writing techniques, and performance.',
        descriptionFr: 'Une exploration créative d\'une semaine des formes poétiques, des techniques d\'écriture et de la performance.',
        type: 'UNIT_PLAN' as const,
        category: 'BY_SUBJECT' as const,
        subject: 'Language Arts',
        gradeMin: 3,
        gradeMax: 3,
        isSystem: true,
        isPublic: true,
        estimatedWeeks: 1,
        tags: ['poetry', 'writing', 'language-arts', 'creative', 'performance'],
        keywords: ['poems', 'rhyme', 'rhythm', 'writing', 'language'],
        content: {
          overview: 'Students will explore various forms of poetry, learn about poetic devices, and create their own poems.',
          bigIdeas: 'Poetry is a form of expression that uses language creatively. Words can create images, emotions, and experiences.',
          learningGoals: [
            'Identify different types of poems and their characteristics',
            'Use poetic devices like rhyme, rhythm, and alliteration',
            'Write original poems using various forms',
            'Present poetry with expression and confidence'
          ],
          essentialQuestions: [
            'How do poets use words to create images and feelings?',
            'What makes a poem different from other types of writing?',
            'How can we share poetry to connect with others?'
          ],
          keyVocabulary: ['poem', 'rhyme', 'rhythm', 'stanza', 'verse', 'alliteration', 'metaphor', 'simile'],
          crossCurricularConnections: 'Music (rhythm and beat), Visual Arts (illustrating poems), Drama (performance)'
        },
        unitStructure: {
          phases: [
            {
              name: 'Poetry Exploration',
              description: 'Reading and analyzing different types of poems',
              estimatedDays: 2,
              learningGoals: ['Identify poem characteristics', 'Recognize poetic devices']
            },
            {
              name: 'Writing Workshop',
              description: 'Creating original poems using different forms',
              estimatedDays: 2,
              learningGoals: ['Write haiku, acrostic, and free verse poems']
            },
            {
              name: 'Poetry Café',
              description: 'Sharing and performing student-created poems',
              estimatedDays: 1,
              learningGoals: ['Present poems with expression', 'Give constructive feedback']
            }
          ]
        }
      },
      {
        title: 'Grade 5 Science - Simple Machines',
        titleFr: 'Sciences 5e année - Machines simples',
        description: 'A 3-week investigation into simple machines, their functions, and applications in daily life.',
        descriptionFr: 'Une enquête de 3 semaines sur les machines simples, leurs fonctions et leurs applications dans la vie quotidienne.',
        type: 'UNIT_PLAN' as const,
        category: 'BY_SUBJECT' as const,
        subject: 'Science',
        gradeMin: 5,
        gradeMax: 5,
        isSystem: true,
        isPublic: true,
        estimatedWeeks: 3,
        tags: ['simple-machines', 'science', 'inquiry', 'STEM', 'investigation'],
        keywords: ['machines', 'lever', 'pulley', 'wheel', 'inclined-plane', 'wedge', 'screw'],
        content: {
          overview: 'Students will investigate the six types of simple machines through hands-on experiments and real-world applications.',
          bigIdeas: 'Simple machines make work easier by changing the direction or amount of force needed. They are found everywhere in our daily lives.',
          learningGoals: [
            'Identify and classify the six types of simple machines',
            'Explain how simple machines make work easier',
            'Conduct investigations to test how simple machines work',
            'Design and build a compound machine using simple machines'
          ],
          essentialQuestions: [
            'How do simple machines make our lives easier?',
            'Where do we find simple machines in our daily lives?',
            'How can we use simple machines to solve problems?'
          ],
          keyVocabulary: ['force', 'work', 'lever', 'fulcrum', 'pulley', 'wheel and axle', 'inclined plane', 'wedge', 'screw', 'mechanical advantage'],
          crossCurricularConnections: 'Mathematics (measuring forces, angles), Technology (design process), Social Studies (history of inventions)'
        },
        unitStructure: {
          phases: [
            {
              name: 'Introduction to Simple Machines',
              description: 'Identifying and classifying simple machines',
              estimatedDays: 5,
              learningGoals: ['Identify six types of simple machines', 'Find examples in the environment']
            },
            {
              name: 'Investigating Forces',
              description: 'Hands-on experiments with each type of machine',
              estimatedDays: 8,
              learningGoals: ['Measure and compare forces', 'Test how machines change force direction']
            },
            {
              name: 'Design Challenge',
              description: 'Creating compound machines to solve problems',
              estimatedDays: 5,
              learningGoals: ['Apply design process', 'Combine simple machines effectively']
            }
          ]
        }
      },
      {
        title: 'Cross-Curricular Community Helpers Project',
        titleFr: 'Projet interdisciplinaire sur les aides communautaires',
        description: 'A month-long integrated project exploring community helpers across multiple subject areas.',
        descriptionFr: 'Un projet intégré d\'un mois explorant les aides communautaires dans plusieurs matières.',
        type: 'UNIT_PLAN' as const,
        category: 'BY_THEME' as const,
        subject: 'Integrated Studies',
        gradeMin: 1,
        gradeMax: 3,
        isSystem: true,
        isPublic: true,
        estimatedWeeks: 4,
        tags: ['community-helpers', 'cross-curricular', 'integrated', 'project-based', 'social-studies'],
        keywords: ['community', 'helpers', 'jobs', 'careers', 'integrated-learning'],
        content: {
          overview: 'Students will explore different community helpers, their roles, and contributions while integrating language arts, mathematics, science, and social studies.',
          bigIdeas: 'Communities are made up of people who work together to help each other. Everyone has a role to play in making their community a better place.',
          crossCurricularConnections: 'Language Arts (reading about jobs, writing thank you letters), Mathematics (counting, sorting, graphing community helpers), Science (tools and safety), Social Studies (community roles and responsibilities), Arts (creating helper portraits)',
          communityConnections: 'Guest speakers from local community (firefighters, police, nurses, teachers), field trips to community locations (fire station, library, post office)'
        }
      },
      {
        title: 'Math Problem Solving Lesson',
        titleFr: 'Leçon de résolution de problèmes mathématiques',
        description: 'A 60-minute lesson focused on developing problem-solving strategies using the three-part lesson structure.',
        descriptionFr: 'Une leçon de 60 minutes axée sur le développement de stratégies de résolution de problèmes en utilisant la structure de leçon en trois parties.',
        type: 'LESSON_PLAN' as const,
        category: 'BY_SKILL' as const,
        subject: 'Mathematics',
        gradeMin: 2,
        gradeMax: 6,
        isSystem: true,
        isPublic: true,
        estimatedMinutes: 60,
        tags: ['problem-solving', 'mathematics', 'three-part-lesson', 'strategies', 'reasoning'],
        keywords: ['problem-solving', 'math', 'strategies', 'thinking', 'reasoning'],
        content: {
          objectives: [
            'Apply problem-solving strategies to solve multi-step problems',
            'Communicate mathematical thinking clearly',
            'Make connections between different problem-solving approaches'
          ],
          materials: [
            'Chart paper and markers',
            'Math manipulatives (blocks, counters)',
            'Problem-solving strategy posters',
            'Student journals'
          ],
          mindsOn: 'Present a visual problem scenario and have students share what they notice and wonder. Activate prior knowledge about problem-solving strategies.',
          action: 'Students work in pairs to solve a multi-step problem using various strategies. Teacher conferences with groups, asking probing questions to extend thinking.',
          consolidation: 'Groups share their solutions and strategies. Class discusses different approaches and makes connections between methods.',
          grouping: 'pairs',
          accommodations: [
            'Provide manipulatives for concrete representation',
            'Offer problems with varying complexity levels',
            'Use visual supports and graphic organizers'
          ],
          assessmentType: 'formative',
          assessmentNotes: 'Observe student strategy use, communication, and reasoning during problem solving'
        },
        lessonStructure: {
          duration: 60,
          sections: [
            {
              name: 'Minds On',
              description: 'Activate prior knowledge and introduce problem',
              timeAllocation: 10,
              activities: ['Visual problem presentation', 'Notice and wonder', 'Strategy review']
            },
            {
              name: 'Action',
              description: 'Collaborative problem solving',
              timeAllocation: 35,
              activities: ['Partner problem solving', 'Teacher conferencing', 'Strategy application']
            },
            {
              name: 'Consolidation',
              description: 'Share solutions and make connections',
              timeAllocation: 15,
              activities: ['Solution sharing', 'Strategy comparison', 'Reflection']
            }
          ]
        }
      }
    ];

    const createdTemplates = [];
    for (const templateData of starterTemplates) {
      try {
        const existing = await prisma.planTemplate.findFirst({
          where: { title: templateData.title, isSystem: true }
        });

        if (!existing) {
          const created = await prisma.planTemplate.create({
            data: {
              ...templateData,
              content: templateData.content as Prisma.JsonValue,
              unitStructure: templateData.unitStructure as Prisma.JsonValue || null,
              lessonStructure: templateData.lessonStructure as Prisma.JsonValue || null,
            },
          });
          createdTemplates.push(created);
        }
      } catch (error) {
        console.error(`Error creating template "${templateData.title}":`, error);
      }
    }

    return createdTemplates;
  }
}

export default TemplateService;