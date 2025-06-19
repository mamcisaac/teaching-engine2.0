import { prisma } from '../prisma';

export interface ActivityTemplate {
  id: number;
  titleFr: string;
  titleEn: string;
  descriptionFr: string;
  descriptionEn: string;
  domain: string;
  subject: string;
  outcomeIds: string[];
  materialsFr?: string | null;
  materialsEn?: string | null;
  prepTimeMin?: number | null;
  groupType: string;
  theme?: {
    id: number;
    title: string;
    titleEn?: string | null;
    titleFr?: string | null;
  } | null;
  relevanceScore?: number;
  createdBy?: {
    id: number;
    name: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ActivitySuggestionRequest {
  userId: number;
  outcomeIds?: string[];
  themeId?: number;
  domain?: string;
  subject?: string;
  limit?: number;
}

export interface ActivityTemplateFilter {
  userId: number;
  domain?: string;
  subject?: string;
  outcomeId?: string;
  themeId?: number;
  groupType?: string;
  search?: string;
}

export interface ActivityTemplateInput {
  titleFr: string;
  titleEn: string;
  descriptionFr: string;
  descriptionEn: string;
  domain: string;
  subject: string;
  outcomeIds?: string[];
  themeId?: number;
  materialsFr?: string;
  materialsEn?: string;
  prepTimeMin?: number;
  groupType?: string;
  createdBy: number;
}

/**
 * Get activity suggestions based on current context
 */
export async function getActivitySuggestions(
  request: ActivitySuggestionRequest,
): Promise<ActivityTemplate[]> {
  const { userId, outcomeIds = [], themeId, domain, subject, limit = 10 } = request;

  try {
    // Build dynamic where clause
    const where: Record<string, unknown> = {
      createdBy: userId,
    };

    // Filter by domain
    if (domain) {
      where.domain = domain;
    }

    // Filter by subject
    if (subject) {
      where.subject = subject;
    }

    // Filter by theme
    if (themeId) {
      where.themeId = themeId;
    }

    // Filter by outcomes (this is more complex since we store as JSON)
    if (outcomeIds.length > 0) {
      // For SQLite, we need to use string matching for JSON arrays
      const outcomeQueries = outcomeIds.map((id) => ({
        outcomeIds: {
          contains: `"${id}"`,
        },
      }));

      if (outcomeQueries.length > 0) {
        where.OR = outcomeQueries;
      }
    }

    const templates = await prisma.activityTemplate.findMany({
      where,
      include: {
        theme: {
          select: {
            id: true,
            title: true,
            titleEn: true,
            titleFr: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
      take: limit,
    });

    // Transform and rank the suggestions
    const suggestions = templates.map((template) => {
      let outcomeIdsArray: string[] = [];
      try {
        outcomeIdsArray = JSON.parse(template.outcomeIds || '[]');
      } catch (e) {
        console.warn('Failed to parse outcomeIds:', template.outcomeIds);
      }

      // Calculate relevance score based on matching outcomes
      let relevanceScore = 0;
      if (outcomeIds.length > 0) {
        const matchingOutcomes = outcomeIdsArray.filter((id) => outcomeIds.includes(id));
        relevanceScore = matchingOutcomes.length / Math.max(outcomeIds.length, 1);
      }

      return {
        id: template.id,
        titleFr: template.titleFr,
        titleEn: template.titleEn,
        descriptionFr: template.descriptionFr,
        descriptionEn: template.descriptionEn,
        domain: template.domain,
        subject: template.subject,
        outcomeIds: outcomeIdsArray,
        materialsFr: template.materialsFr,
        materialsEn: template.materialsEn,
        prepTimeMin: template.prepTimeMin,
        groupType: template.groupType,
        theme: template.theme,
        relevanceScore,
        createdBy: template.createdByUser,
      };
    });

    // Sort by relevance score (highest first)
    suggestions.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return suggestions;
  } catch (error) {
    console.error('Error getting activity suggestions:', error);
    throw new Error('Failed to get activity suggestions');
  }
}

/**
 * Get activity templates with filtering
 */
export async function getActivityTemplates(
  filter: ActivityTemplateFilter,
): Promise<ActivityTemplate[]> {
  const { userId, domain, subject, outcomeId, themeId, groupType, search } = filter;

  try {
    const where: Record<string, unknown> = {
      createdBy: userId,
    };

    if (domain) {
      where.domain = domain;
    }

    if (subject) {
      where.subject = subject;
    }

    if (themeId) {
      where.themeId = themeId;
    }

    if (groupType) {
      where.groupType = groupType;
    }

    if (outcomeId) {
      where.outcomeIds = {
        contains: `"${outcomeId}"`,
      };
    }

    if (search) {
      where.OR = [
        { titleFr: { contains: search, mode: 'insensitive' } },
        { titleEn: { contains: search, mode: 'insensitive' } },
        { descriptionFr: { contains: search, mode: 'insensitive' } },
        { descriptionEn: { contains: search, mode: 'insensitive' } },
      ];
    }

    const templates = await prisma.activityTemplate.findMany({
      where,
      include: {
        theme: {
          select: {
            id: true,
            title: true,
            titleEn: true,
            titleFr: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ updatedAt: 'desc' }],
    });

    return templates.map((template) => {
      let outcomeIdsArray: string[] = [];
      try {
        outcomeIdsArray = JSON.parse(template.outcomeIds || '[]');
      } catch (e) {
        console.warn('Failed to parse outcomeIds:', template.outcomeIds);
      }

      return {
        id: template.id,
        titleFr: template.titleFr,
        titleEn: template.titleEn,
        descriptionFr: template.descriptionFr,
        descriptionEn: template.descriptionEn,
        domain: template.domain,
        subject: template.subject,
        outcomeIds: outcomeIdsArray,
        materialsFr: template.materialsFr,
        materialsEn: template.materialsEn,
        prepTimeMin: template.prepTimeMin,
        groupType: template.groupType,
        theme: template.theme,
        createdBy: template.createdByUser,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      };
    });
  } catch (error) {
    console.error('Error getting activity templates:', error);
    throw new Error('Failed to get activity templates');
  }
}

/**
 * Create a new activity template
 */
export async function createActivityTemplate(
  input: ActivityTemplateInput,
): Promise<ActivityTemplate> {
  try {
    const outcomeIdsJson = JSON.stringify(input.outcomeIds || []);

    const template = await prisma.activityTemplate.create({
      data: {
        titleFr: input.titleFr,
        titleEn: input.titleEn,
        descriptionFr: input.descriptionFr,
        descriptionEn: input.descriptionEn,
        domain: input.domain,
        subject: input.subject,
        outcomeIds: outcomeIdsJson,
        themeId: input.themeId,
        materialsFr: input.materialsFr,
        materialsEn: input.materialsEn,
        prepTimeMin: input.prepTimeMin,
        groupType: input.groupType || 'Whole class',
        createdBy: input.createdBy,
      },
      include: {
        theme: {
          select: {
            id: true,
            title: true,
            titleEn: true,
            titleFr: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    let outcomeIdsArray: string[] = [];
    try {
      outcomeIdsArray = JSON.parse(template.outcomeIds || '[]');
    } catch (e) {
      console.warn('Failed to parse outcomeIds:', template.outcomeIds);
    }

    return {
      id: template.id,
      titleFr: template.titleFr,
      titleEn: template.titleEn,
      descriptionFr: template.descriptionFr,
      descriptionEn: template.descriptionEn,
      domain: template.domain,
      subject: template.subject,
      outcomeIds: outcomeIdsArray,
      materialsFr: template.materialsFr,
      materialsEn: template.materialsEn,
      prepTimeMin: template.prepTimeMin,
      groupType: template.groupType,
      theme: template.theme,
      createdBy: template.createdByUser,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  } catch (error) {
    console.error('Error creating activity template:', error);
    throw new Error('Failed to create activity template');
  }
}
