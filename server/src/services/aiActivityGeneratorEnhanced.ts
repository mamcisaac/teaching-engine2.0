import { prisma } from '../prisma';
import { openai } from './llmService';
import { z } from 'zod';
import logger from '../logger';

// Enhanced schemas for AI generation
const ActivityGenerationSchema = z.object({
  title: z.string(),
  descriptionFr: z.string(),
  descriptionEn: z.string().optional(),
  materials: z.array(z.string()),
  duration: z.number().min(5).max(120),
  theme: z.string().optional(),
  qualityScore: z.number().min(0).max(1).optional(),
  complexity: z.enum(['simple', 'moderate', 'complex']).optional(),
  groupSize: z.enum(['individual', 'pairs', 'small-group', 'whole-class']).optional(),
});

const ActivitySeriesSchema = z.object({
  seriesTitle: z.string(),
  seriesDescription: z.string(),
  activities: z.array(ActivityGenerationSchema),
  totalDuration: z.number(),
  theme: z.string().optional(),
  progression: z.enum(['linear', 'spiral', 'thematic']).optional(),
});

export interface GenerateActivityParams {
  outcomeIds: string[]; // Now supports multiple outcomes
  userId: number;
  theme?: string;
  languageLevel?: string;
  existingActivities?: string[];
  complexity?: 'simple' | 'moderate' | 'complex';
  generateSeries?: boolean;
  seriesSize?: number;
}

export interface GenerateWeeklyPlanParams {
  userId: number;
  weekStart: string;
  subjectHours: Record<string, number>; // e.g., { "Mathematics": 5, "Language Arts": 7 }
  priorities?: string[]; // Outcome IDs to prioritize
  includeAssessments?: boolean;
  respectBuffer?: boolean;
}

export class EnhancedAIActivityGeneratorService {
  /**
   * Generate activities for multiple outcomes with quality scoring
   */
  async generateActivities(params: GenerateActivityParams) {
    const { outcomeIds, userId, theme, languageLevel = 'early immersion', generateSeries = false, seriesSize = 3 } = params;

    // Fetch all outcomes with their subjects
    const outcomes = await prisma.outcome.findMany({
      where: { id: { in: outcomeIds } },
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

    if (outcomes.length === 0) {
      throw new Error('No outcomes found');
    }

    // Group outcomes by subject for better activity generation
    const outcomesBySubject = this.groupOutcomesBySubject(outcomes);

    if (generateSeries) {
      return this.generateActivitySeries(outcomesBySubject, params, seriesSize);
    } else {
      return this.generateIndividualActivities(outcomesBySubject, params);
    }
  }

  /**
   * Generate a series of related activities that build on each other
   */
  private async generateActivitySeries(
    outcomesBySubject: Map<string, any[]>,
    params: GenerateActivityParams,
    seriesSize: number
  ) {
    const { userId, theme, languageLevel = 'early immersion' } = params;
    const results = [];

    for (const [subject, subjectOutcomes] of outcomesBySubject.entries()) {
      const systemPrompt = `You are an expert Grade 1 French Immersion teacher creating a series of connected activities.
The series should:
- Progress from simple to complex
- Build on previous activities
- Maintain thematic coherence
- Support French language acquisition at ${languageLevel} level
- Be developmentally appropriate for ages 6-7

Generate a series of ${seriesSize} activities that work together as a learning progression.
Respond in valid JSON format matching the schema provided.`;

      const outcomeDescriptions = subjectOutcomes
        .map(o => `${o.code}: ${o.description}`)
        .join('\n');

      const userPrompt = `Create a series of ${seriesSize} connected Grade 1 French Immersion activities for:
Subject: ${subject}
Outcomes:
${outcomeDescriptions}
${theme ? `Theme: ${theme}` : ''}

The series should:
1. Start with simple exploration
2. Progress to guided practice
3. End with independent application
4. Each activity 15-45 minutes
5. Use consistent materials across activities where possible

Provide the response in this JSON format:
{
  "seriesTitle": "Title for the entire series in French",
  "seriesDescription": "Brief description of the learning progression",
  "activities": [
    {
      "title": "Activity 1 title in French",
      "descriptionFr": "Detailed description in French",
      "descriptionEn": "English translation",
      "materials": ["list", "of", "materials"],
      "duration": 20,
      "complexity": "simple",
      "groupSize": "whole-class",
      "qualityScore": 0.9
    }
  ],
  "totalDuration": 60,
  "theme": "${theme || ''}",
  "progression": "linear"
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
          max_tokens: 2000,
          response_format: { type: 'json_object' },
        });

        const responseContent = completion.choices[0]?.message?.content;
        if (!responseContent) {
          throw new Error('No response from AI');
        }

        const parsedResponse = JSON.parse(responseContent);
        const validatedSeries = ActivitySeriesSchema.parse(parsedResponse);

        // Create activity series record
        const seriesId = await this.createActivitySeries(
          userId,
          validatedSeries,
          subjectOutcomes.map(o => o.id)
        );

        // Save each activity in the series
        const savedActivities = [];
        for (const [index, activity] of validatedSeries.activities.entries()) {
          const saved = await prisma.aISuggestedActivity.create({
            data: {
              outcomeId: subjectOutcomes[index % subjectOutcomes.length].id,
              userId,
              title: activity.title,
              descriptionFr: activity.descriptionFr,
              descriptionEn: activity.descriptionEn,
              materials: JSON.stringify(activity.materials),
              duration: activity.duration,
              theme: activity.theme || theme,
              qualityScore: activity.qualityScore || 0.8,
              seriesId,
            },
            include: {
              outcome: true,
            },
          });
          savedActivities.push({
            ...saved,
            materials: activity.materials,
            complexity: activity.complexity,
            groupSize: activity.groupSize,
          });
        }

        results.push({
          subject,
          seriesId,
          seriesTitle: validatedSeries.seriesTitle,
          seriesDescription: validatedSeries.seriesDescription,
          activities: savedActivities,
          totalDuration: validatedSeries.totalDuration,
          progression: validatedSeries.progression,
        });

      } catch (error) {
        logger.error('Error generating activity series:', error);
        // Fallback to individual activities if series generation fails
        const fallbackActivities = await this.generateIndividualActivities(
          new Map([[subject, subjectOutcomes]]),
          params
        );
        results.push(...fallbackActivities);
      }
    }

    return results;
  }

  /**
   * Generate individual activities for outcomes
   */
  private async generateIndividualActivities(
    outcomesBySubject: Map<string, any[]>,
    params: GenerateActivityParams
  ) {
    const { userId, theme, languageLevel = 'early immersion', complexity } = params;
    const results = [];

    for (const [subject, subjectOutcomes] of outcomesBySubject.entries()) {
      for (const outcome of subjectOutcomes) {
        const systemPrompt = `You are an expert Grade 1 French Immersion teacher.
Create an activity that:
- Aligns with the curriculum outcome
- Supports ${languageLevel} French language acquisition
- Is ${complexity || 'moderate'} in complexity
- Uses developmentally appropriate methods for ages 6-7
- Includes quality scoring (0-1) based on alignment and engagement potential

Respond in valid JSON format.`;

        const userPrompt = `Create a Grade 1 French Immersion activity:
Subject: ${subject}
Outcome: ${outcome.code} - ${outcome.description}
${theme ? `Theme: ${theme}` : ''}
Complexity: ${complexity || 'moderate'}

Format:
{
  "title": "French title",
  "descriptionFr": "Detailed French description",
  "descriptionEn": "English translation",
  "materials": ["materials", "in", "French"],
  "duration": 30,
  "complexity": "${complexity || 'moderate'}",
  "groupSize": "small-group",
  "qualityScore": 0.85
}`;

        try {
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
          if (!responseContent) continue;

          const parsedResponse = JSON.parse(responseContent);
          const validatedActivity = ActivityGenerationSchema.parse(parsedResponse);

          const saved = await prisma.aISuggestedActivity.create({
            data: {
              outcomeId: outcome.id,
              userId,
              title: validatedActivity.title,
              descriptionFr: validatedActivity.descriptionFr,
              descriptionEn: validatedActivity.descriptionEn,
              materials: JSON.stringify(validatedActivity.materials),
              duration: validatedActivity.duration,
              theme: validatedActivity.theme || theme,
              qualityScore: validatedActivity.qualityScore || 0.75,
            },
            include: {
              outcome: true,
            },
          });

          results.push({
            ...saved,
            materials: validatedActivity.materials,
            complexity: validatedActivity.complexity,
            groupSize: validatedActivity.groupSize,
            subject,
          });

        } catch (error) {
          logger.error(`Error generating activity for outcome ${outcome.id}:`, error);
        }
      }
    }

    return results;
  }

  /**
   * Analyze curriculum coverage and suggest activities for gaps
   */
  async analyzeCurriculumGaps(userId: number, subjectId?: number) {
    // Get all outcomes for the user's grade level
    const allOutcomes = await prisma.outcome.findMany({
      include: {
        milestones: {
          include: {
            milestone: {
              include: {
                subject: true,
                activities: {
                  where: { userId },
                  include: {
                    outcomes: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Filter by subject if specified
    const relevantOutcomes = subjectId
      ? allOutcomes.filter(o => 
          o.milestones.some(m => m.milestone.subjectId === subjectId)
        )
      : allOutcomes;

    // Calculate coverage metrics
    const coverageAnalysis = relevantOutcomes.map(outcome => {
      const activities = outcome.milestones.flatMap(m => 
        m.milestone.activities.filter(a => 
          a.outcomes.some(ao => ao.outcomeId === outcome.id)
        )
      );

      const coverageScore = activities.length > 0 ? 1 : 0;
      const lastActivityDate = activities
        .filter(a => a.completedAt)
        .sort((a, b) => b.completedAt!.getTime() - a.completedAt!.getTime())[0]?.completedAt;

      return {
        outcome,
        coverageScore,
        activityCount: activities.length,
        lastActivityDate,
        priority: this.calculatePriority(outcome, activities.length, lastActivityDate),
      };
    });

    // Sort by priority (uncovered outcomes first)
    coverageAnalysis.sort((a, b) => b.priority - a.priority);

    // Get existing AI suggestions for uncovered outcomes
    const uncoveredOutcomeIds = coverageAnalysis
      .filter(ca => ca.coverageScore === 0)
      .map(ca => ca.outcome.id);

    const existingSuggestions = await prisma.aISuggestedActivity.findMany({
      where: {
        userId,
        outcomeId: { in: uncoveredOutcomeIds },
      },
    });

    return {
      totalOutcomes: relevantOutcomes.length,
      coveredOutcomes: coverageAnalysis.filter(ca => ca.coverageScore > 0).length,
      coveragePercentage: (coverageAnalysis.filter(ca => ca.coverageScore > 0).length / relevantOutcomes.length) * 100,
      priorityGaps: coverageAnalysis.slice(0, 10), // Top 10 priority gaps
      existingSuggestions: existingSuggestions.length,
    };
  }

  /**
   * Update quality scores based on teacher acceptance/rejection
   */
  async updateQualityScore(suggestionId: number, accepted: boolean) {
    const suggestion = await prisma.aISuggestedActivity.findUnique({
      where: { id: suggestionId },
    });

    if (!suggestion) return;

    // Simple acceptance rate calculation
    const currentRate = suggestion.acceptanceRate || 0.5;
    const newRate = accepted 
      ? Math.min(currentRate + 0.1, 1.0)
      : Math.max(currentRate - 0.1, 0.0);

    await prisma.aISuggestedActivity.update({
      where: { id: suggestionId },
      data: { acceptanceRate: newRate },
    });
  }

  // Helper methods

  private groupOutcomesBySubject(outcomes: any[]) {
    const grouped = new Map<string, any[]>();
    
    for (const outcome of outcomes) {
      const subject = outcome.milestones[0]?.milestone.subject.name || 'General';
      if (!grouped.has(subject)) {
        grouped.set(subject, []);
      }
      grouped.get(subject)!.push(outcome);
    }

    return grouped;
  }

  private async createActivitySeries(
    userId: number,
    series: any,
    outcomeIds: string[]
  ): Promise<string> {
    const created = await prisma.activitySeries.create({
      data: {
        userId,
        title: series.seriesTitle,
        description: series.seriesDescription,
        theme: series.theme,
        outcomeIds: JSON.stringify(outcomeIds),
        activityCount: series.activities.length,
        metadata: JSON.stringify({
          totalDuration: series.totalDuration,
          progression: series.progression,
        }),
      },
    });

    return created.id;
  }

  private calculatePriority(
    outcome: any,
    activityCount: number,
    lastActivityDate?: Date | null
  ): number {
    let priority = 0;

    // Uncovered outcomes get highest priority
    if (activityCount === 0) {
      priority += 100;
    }

    // Recently neglected outcomes get priority
    if (lastActivityDate) {
      const daysSinceLastActivity = Math.floor(
        (Date.now() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      priority += Math.min(daysSinceLastActivity, 30);
    }

    // Core subjects get slight priority boost
    const subject = outcome.milestones[0]?.milestone.subject.name || '';
    if (['Mathematics', 'Language Arts', 'Sciences'].includes(subject)) {
      priority += 10;
    }

    return priority;
  }
}

export const aiActivityGeneratorEnhanced = new EnhancedAIActivityGeneratorService();