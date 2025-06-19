import { PrismaClient, Outcome, AISuggestedActivity } from '@teaching-engine/database';
import OpenAI from 'openai';

export class AIActivitySuggestionService {
  private prisma: PrismaClient;
  private openai: OpenAI | null;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.openai = process.env.OPENAI_API_KEY
      ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      : null;
  }

  async generateActivitySuggestion(
    outcomeId: string,
    userId: number,
    options: {
      theme?: string;
      languageLevel?: string;
    } = {},
  ): Promise<AISuggestedActivity> {
    // Get the outcome details
    const outcome = await this.prisma.outcome.findUnique({
      where: { id: outcomeId },
    });

    if (!outcome) {
      throw new Error('Outcome not found');
    }

    // Generate activity using AI or use mock for development
    const suggestion = this.openai
      ? await this.generateWithOpenAI(outcome, options)
      : await this.generateMockSuggestion(outcome, options);

    // Save to database
    const savedActivity = await this.prisma.aISuggestedActivity.create({
      data: {
        outcomeId,
        userId,
        title: suggestion.title,
        descriptionFr: suggestion.descriptionFr,
        descriptionEn: suggestion.descriptionEn,
        materials: JSON.stringify(suggestion.materials),
        duration: suggestion.duration,
        theme: options.theme,
      },
    });

    return savedActivity;
  }

  private async generateWithOpenAI(
    outcome: Outcome,
    options: { theme?: string; languageLevel?: string },
  ) {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `
      Generate a Grade 1 French Immersion activity for the following outcome:
      
      Subject: ${outcome.subject}
      Code: ${outcome.code}
      Description: ${outcome.description}
      ${options.theme ? `Theme: ${options.theme}` : ''}
      
      The activity should:
      - Be appropriate for Grade 1 students (ages 6-7)
      - Support early French immersion with visual/oral scaffolding
      - Take 20-40 minutes
      - Include simple, accessible materials
      - Be engaging and hands-on
      
      Provide the response in JSON format with:
      {
        "title": "Activity name in French",
        "descriptionFr": "Detailed description in French",
        "descriptionEn": "Brief description in English for teacher reference",
        "materials": ["list", "of", "materials", "needed"],
        "duration": number (in minutes)
      }
    `;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert elementary French immersion teacher creating developmentally appropriate activities.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(response);
  }

  private async generateMockSuggestion(
    outcome: Outcome,
    options: { theme?: string; languageLevel?: string },
  ) {
    // Mock suggestions for development/testing
    const mockActivities = [
      {
        title: 'Cherchons le printemps!',
        descriptionFr:
          "Les élèves explorent les signes du printemps à travers une promenade guidée, suivie d'une discussion en petits groupes sur leurs découvertes.",
        descriptionEn:
          'Students explore signs of spring through a guided walk, followed by small group discussions about their discoveries.',
        materials: ['liste de vérification illustrée', 'crayons de couleur', 'tableau collectif'],
        duration: 30,
      },
      {
        title: 'Mon livre des saisons',
        descriptionFr:
          "Création d'un petit livre illustré sur les quatre saisons avec des mots simples et des dessins personnels.",
        descriptionEn:
          'Creating a small illustrated book about the four seasons with simple words and personal drawings.',
        materials: ['papier plié', 'crayons', 'images des saisons', 'colle'],
        duration: 35,
      },
      {
        title: 'Le jeu des nombres vivants',
        descriptionFr:
          'Activité kinesthésique où les élèves forment des nombres avec leurs corps et pratiquent le comptage en français.',
        descriptionEn:
          'Kinesthetic activity where students form numbers with their bodies and practice counting in French.',
        materials: ['cartes de nombres', 'cerceaux', 'musique rythmée'],
        duration: 25,
      },
    ];

    // Select a random activity and customize it slightly based on the outcome
    const baseActivity = mockActivities[Math.floor(Math.random() * mockActivities.length)];

    // If a theme is provided, incorporate it into the title
    if (options.theme) {
      baseActivity.title = `${baseActivity.title} - ${options.theme}`;
    }

    return baseActivity;
  }

  async getUncoveredOutcomes(
    userId: number,
    options: {
      startDate?: Date;
      endDate?: Date;
      theme?: string;
      limit?: number;
    } = {},
  ) {
    // Get all outcomes for Grade 1
    const allOutcomes = await this.prisma.outcome.findMany({
      where: { grade: 1 },
    });

    // Get covered outcomes (those linked to activities in the date range)
    const coveredOutcomes = await this.prisma.activityOutcome.findMany({
      where: {
        activity: {
          userId,
          ...(options.startDate || options.endDate
            ? {
                milestone: {
                  AND: [
                    options.startDate ? { startDate: { gte: options.startDate } } : {},
                    options.endDate ? { endDate: { lte: options.endDate } } : {},
                  ],
                },
              }
            : {}),
        },
      },
      select: {
        outcomeId: true,
      },
      distinct: ['outcomeId'],
    });

    const coveredOutcomeIds = new Set(coveredOutcomes.map((co) => co.outcomeId));

    // Filter to get uncovered outcomes
    const uncoveredOutcomes = allOutcomes.filter((outcome) => !coveredOutcomeIds.has(outcome.id));

    // Get any existing AI suggestions for these outcomes
    const suggestions = await this.prisma.aISuggestedActivity.findMany({
      where: {
        userId,
        outcomeId: {
          in: uncoveredOutcomes.map((o) => o.id),
        },
        ...(options.theme ? { theme: options.theme } : {}),
      },
      include: {
        outcome: true,
      },
    });

    // Combine outcomes with their suggestions
    const result = uncoveredOutcomes.map((outcome) => ({
      outcome,
      suggestion: suggestions.find((s) => s.outcomeId === outcome.id),
    }));

    return options.limit ? result.slice(0, options.limit) : result;
  }

  async convertToActivity(
    suggestionId: number,
    milestoneId: number,
    options: {
      title?: string;
      durationMins?: number;
      publicNote?: string;
    } = {},
  ): Promise<number> {
    // Get the suggestion
    const suggestion = await this.prisma.aISuggestedActivity.findUnique({
      where: { id: suggestionId },
      include: { outcome: true },
    });

    if (!suggestion) {
      throw new Error('Suggestion not found');
    }

    // Create the activity
    const activity = await this.prisma.activity.create({
      data: {
        title: options.title || suggestion.title,
        titleFr: suggestion.title,
        milestoneId,
        userId: suggestion.userId,
        durationMins: options.durationMins || suggestion.duration,
        publicNote: options.publicNote || suggestion.descriptionFr,
        publicNoteFr: suggestion.descriptionFr,
        publicNoteEn: suggestion.descriptionEn || undefined,
        materialsTextFr: suggestion.materials,
        activityType: 'LESSON',
        isSubFriendly: true,
      },
    });

    // Link the activity to the outcome
    await this.prisma.activityOutcome.create({
      data: {
        activityId: activity.id,
        outcomeId: suggestion.outcomeId,
      },
    });

    return activity.id;
  }
}
