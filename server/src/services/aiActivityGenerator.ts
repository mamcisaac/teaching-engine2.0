import { prisma } from '../prisma';
import { openai } from './llmService';
import { z } from 'zod';

export interface GenerateActivityParams {
  outcomeId: string;
  userId: number;
  theme?: string;
  languageLevel?: string;
  existingActivities?: string[];
}

const ActivityGenerationSchema = z.object({
  title: z.string(),
  descriptionFr: z.string(),
  descriptionEn: z.string().optional(),
  materials: z.array(z.string()),
  duration: z.number().min(5).max(120),
  theme: z.string().optional(),
});

export class AIActivityGeneratorService {
  async generateActivity(params: GenerateActivityParams) {
    const { outcomeId, userId, theme, languageLevel = 'early immersion' } = params;

    // Fetch the outcome details
    const outcome = await prisma.outcome.findUnique({
      where: { id: outcomeId },
      include: {
        milestones: {
          include: {
            milestone: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    });

    if (!outcome) {
      throw new Error('Outcome not found');
    }

    // Get the subject from the first milestone
    const subject = outcome.milestones[0]?.milestone.subject.name || 'General';

    // Construct the prompt for AI
    const systemPrompt = `You are an expert Grade 1 French Immersion teacher creating developmentally appropriate activities. 
Your activities must:
- Be suitable for 6-7 year old children
- Support French language acquisition through oral scaffolding
- Use simple, concrete materials readily available in classrooms
- Align with the given curriculum outcome
- Be engaging and hands-on
- Consider the ${languageLevel} proficiency level

Always respond in valid JSON format matching the schema provided.`;

    const userPrompt = `Create a Grade 1 French Immersion activity for the following outcome:
Subject: ${subject}
Outcome Code: ${outcome.code}
Outcome Description: ${outcome.description}
${theme ? `Theme: ${theme}` : ''}
${params.existingActivities?.length ? `Avoid duplicating these existing activities: ${params.existingActivities.join(', ')}` : ''}

The activity should:
1. Be developmentally appropriate for Grade 1 (ages 6-7)
2. Support French language learning through oral practice
3. Be hands-on and engaging
4. Use simple materials
5. Take between 15-45 minutes

Provide the response in this JSON format:
{
  "title": "Activity title in French",
  "descriptionFr": "Detailed description in French (2-3 sentences)",
  "descriptionEn": "English translation of the description",
  "materials": ["list", "of", "materials", "in", "French"],
  "duration": 30,
  "theme": "${theme || ''}"
}`;

    try {
      if (!openai) {
        throw new Error('OpenAI not configured');
      }

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
        response_format: { type: 'json_object' },
      });

      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error('No response from AI');
      }

      // Parse and validate the response
      const parsedResponse = JSON.parse(responseContent);
      const validatedActivity = ActivityGenerationSchema.parse(parsedResponse);

      // Save the suggestion to database
      const savedActivity = await prisma.aISuggestedActivity.create({
        data: {
          outcomeId,
          userId,
          title: validatedActivity.title,
          descriptionFr: validatedActivity.descriptionFr,
          descriptionEn: validatedActivity.descriptionEn,
          materials: JSON.stringify(validatedActivity.materials),
          duration: validatedActivity.duration,
          theme: validatedActivity.theme || theme,
        },
        include: {
          outcome: true,
        },
      });

      return {
        ...savedActivity,
        materials: validatedActivity.materials, // Return parsed array instead of JSON string
      };
    } catch (error) {
      console.error('Error generating activity:', error);

      // Fallback to a simple template-based generation if AI fails
      return this.generateFallbackActivity(outcome, theme, userId);
    }
  }

  private async generateFallbackActivity(
    outcome: { id: string; description: string },
    theme: string | undefined,
    userId: number,
  ) {
    const baseActivities = {
      communication: {
        title: 'Cercle de partage',
        descriptionFr:
          'Les élèves partagent leurs idées en petit groupe avec des supports visuels.',
        descriptionEn: 'Students share their ideas in small groups with visual supports.',
        materials: ['images', 'cartes de vocabulaire', 'tableau'],
        duration: 20,
      },
      reading: {
        title: 'Lecture guidée',
        descriptionFr: "Exploration d'un texte simple avec des images et discussion en groupe.",
        descriptionEn: 'Exploration of a simple text with images and group discussion.',
        materials: ['livre illustré', 'cartes de mots', 'tableau'],
        duration: 25,
      },
      writing: {
        title: 'Écriture collective',
        descriptionFr: "Création d'une histoire de classe avec des dessins et des mots simples.",
        descriptionEn: 'Creating a class story with drawings and simple words.',
        materials: ['papier', 'crayons', 'tableau', 'cartes de mots'],
        duration: 30,
      },
      math: {
        title: 'Manipulation mathématique',
        descriptionFr: 'Exploration de concepts mathématiques avec du matériel concret.',
        descriptionEn: 'Exploring mathematical concepts with concrete materials.',
        materials: ['cubes', 'jetons', 'cartes numériques', 'tableau'],
        duration: 30,
      },
      default: {
        title: "Activité d'exploration",
        descriptionFr:
          'Les élèves explorent le concept à travers des activités pratiques et ludiques.',
        descriptionEn: 'Students explore the concept through practical and playful activities.',
        materials: ['matériel varié', 'images', 'cartes'],
        duration: 25,
      },
    };

    // Determine activity type based on outcome description
    let activityType = 'default';
    const desc = outcome.description.toLowerCase();
    if (desc.includes('communiqu') || desc.includes('oral')) {
      activityType = 'communication';
    } else if (desc.includes('lire') || desc.includes('lecture')) {
      activityType = 'reading';
    } else if (desc.includes('écri')) {
      activityType = 'writing';
    } else if (desc.includes('math') || desc.includes('nombre') || desc.includes('calcul')) {
      activityType = 'math';
    }

    const template = baseActivities[activityType] || baseActivities.default;

    // Save the fallback activity
    const savedActivity = await prisma.aISuggestedActivity.create({
      data: {
        outcomeId: outcome.id,
        userId,
        title: theme ? `${template.title} - ${theme}` : template.title,
        descriptionFr: template.descriptionFr,
        descriptionEn: template.descriptionEn,
        materials: JSON.stringify(template.materials),
        duration: template.duration,
        theme,
      },
      include: {
        outcome: true,
      },
    });

    return {
      ...savedActivity,
      materials: template.materials,
    };
  }

  async getUncoveredOutcomes(userId: number, theme?: string, limit?: number) {
    // Get all outcomes
    const allOutcomes = await prisma.outcome.findMany({
      include: {
        milestones: {
          include: {
            milestone: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    });

    // Get outcomes that have activities linked
    const coveredOutcomes = await prisma.activity.findMany({
      where: {
        userId,
        outcomes: {
          some: {},
        },
      },
      select: {
        outcomes: {
          select: {
            outcomeId: true,
          },
        },
      },
    });

    const coveredOutcomeIds = new Set(
      coveredOutcomes.flatMap((a) => a.outcomes.map((o) => o.outcomeId)),
    );

    // Filter to get uncovered outcomes
    const uncoveredOutcomes = allOutcomes.filter((outcome) => !coveredOutcomeIds.has(outcome.id));

    // Get existing suggestions for these outcomes
    const suggestions = await prisma.aISuggestedActivity.findMany({
      where: {
        userId,
        outcomeId: {
          in: uncoveredOutcomes.map((o) => o.id),
        },
        ...(theme && { theme }),
      },
      include: {
        outcome: true,
      },
    });

    // Map suggestions by outcome ID for easy lookup
    const suggestionsByOutcome = new Map(suggestions.map((s) => [s.outcomeId, s]));

    const result = uncoveredOutcomes.map((outcome) => ({
      outcome,
      suggestion: suggestionsByOutcome.get(outcome.id) || null,
    }));

    // Apply limit if specified
    return limit ? result.slice(0, limit) : result;
  }

  async convertToActivity(
    suggestionId: number,
    userId: number,
    customData?: {
      milestoneId?: number;
      title?: string;
      durationMins?: number;
      publicNote?: string;
      scheduleData?: {
        date: string;
        startTime: string;
        endTime: string;
      };
    },
  ) {
    const suggestion = await prisma.aISuggestedActivity.findUnique({
      where: { id: suggestionId },
      include: {
        outcome: {
          include: {
            milestones: {
              include: {
                milestone: true,
              },
            },
          },
        },
      },
    });

    if (!suggestion || suggestion.userId !== userId) {
      throw new Error('Suggestion not found or unauthorized');
    }

    // Parse materials from JSON
    const materials = JSON.parse(suggestion.materials) as string[];

    // Get the first milestone associated with this outcome or use custom milestoneId
    const milestoneId =
      customData?.milestoneId || suggestion.outcome.milestones[0]?.milestoneId || 1;

    // Create the activity with custom data if provided
    const activity = await prisma.activity.create({
      data: {
        title: customData?.title || suggestion.title,
        titleFr: customData?.title || suggestion.title,
        titleEn: suggestion.descriptionEn ? customData?.title || suggestion.title : undefined,
        publicNote: customData?.publicNote || suggestion.descriptionFr,
        publicNoteFr: customData?.publicNote || suggestion.descriptionFr,
        publicNoteEn: suggestion.descriptionEn || undefined,
        materialsText: materials.join(', '),
        materialsTextFr: materials.join(', '),
        durationMins: customData?.durationMins || suggestion.duration,
        userId,
        milestoneId,
        outcomes: {
          create: {
            outcomeId: suggestion.outcomeId,
          },
        },
      },
      include: {
        outcomes: {
          include: {
            outcome: true,
          },
        },
      },
    });

    return activity;
  }
}

export const aiActivityGenerator = new AIActivityGeneratorService();
