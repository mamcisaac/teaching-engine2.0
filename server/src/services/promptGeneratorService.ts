import { BaseService } from './base/BaseService';
import { generateContent } from './llmService';

export interface PromptGenerationRequest {
  outcomeId: string;
  language: 'en' | 'fr';
  grade?: number;
  subject?: string;
}

export interface GeneratedPrompt {
  type: 'open_question' | 'sentence_stem' | 'discussion' | 'metacognitive';
  text: string;
  context?: string;
}

export interface PromptGenerationResult {
  outcomeId: string;
  outcome: {
    code: string;
    description: string;
    subject: string;
    grade: number;
  };
  prompts: GeneratedPrompt[];
  language: string;
}

export class PromptGeneratorService extends BaseService {
  // Curated few-shot examples for different prompt types
  private readonly promptExamples = {
    en: {
      open_question: [
        'How do you know your answer is correct?',
        'What would happen if you changed this part?',
        'Why do you think this strategy worked?',
        'What connections can you make to your own experience?',
        'How would you explain this to a friend?',
      ],
      sentence_stem: [
        'I think this because...',
        'This reminds me of...',
        'I wonder what would happen if...',
        'The most important thing I learned is...',
        'This strategy works because...',
      ],
      discussion: [
        'Share your thinking with your partner.',
        'Compare your answer with someone near you.',
        'Ask your group a question about this.',
        'Explain your reasoning to the class.',
        'Listen to another perspective and share what you heard.',
      ],
      metacognitive: [
        'What was challenging about this task?',
        'How did you solve this problem?',
        'What would you do differently next time?',
        'How does this connect to what you already know?',
        'What questions do you still have?',
      ],
    },
    fr: {
      open_question: [
        'Comment sais-tu que ta réponse est correcte?',
        'Que se passerait-il si tu changeais cette partie?',
        'Pourquoi penses-tu que cette stratégie a fonctionné?',
        'Quels liens peux-tu faire avec ton expérience?',
        'Comment expliqueras-tu cela à un ami?',
      ],
      sentence_stem: [
        'Je pense cela parce que...',
        'Cela me rappelle...',
        'Je me demande ce qui arriverait si...',
        "La chose la plus importante que j'ai apprise est...",
        'Cette stratégie fonctionne parce que...',
      ],
      discussion: [
        'Partage tes idées avec ton partenaire.',
        "Compare ta réponse avec quelqu'un près de toi.",
        'Pose une question à ton groupe à ce sujet.',
        'Explique ton raisonnement à la classe.',
        'Écoute une autre perspective et partage ce que tu as entendu.',
      ],
      metacognitive: [
        "Qu'est-ce qui était difficile dans cette tâche?",
        'Comment as-tu résolu ce problème?',
        'Que ferais-tu différemment la prochaine fois?',
        'Comment cela se connecte-t-il à ce que tu sais déjà?',
        'Quelles questions as-tu encore?',
      ],
    },
  };

  constructor() {
    super('PromptGeneratorService');
  }

  /**
   * Generate pedagogical prompts for a specific curriculum outcome
   */
  async generatePrompts(request: PromptGenerationRequest): Promise<PromptGenerationResult> {
    const startTime = Date.now();

    try {
      this.logger.info(
        { outcomeId: request.outcomeId, language: request.language },
        'Starting prompt generation',
      );

      // Get the outcome details
      const outcome = await this.prisma.outcome.findUnique({
        where: { id: request.outcomeId },
        select: {
          id: true,
          code: true,
          description: true,
          subject: true,
          grade: true,
          domain: true,
        },
      });

      if (!outcome) {
        throw new Error(`Outcome not found: ${request.outcomeId}`);
      }

      // Check if we have cached prompts first
      const cachedPrompts = await this.getCachedPrompts(request.outcomeId, request.language);
      if (cachedPrompts.length > 0) {
        this.logger.debug({ outcomeId: request.outcomeId }, 'Using cached prompts');
        return {
          outcomeId: request.outcomeId,
          outcome,
          prompts: cachedPrompts,
          language: request.language,
        };
      }

      // Generate new prompts using AI
      const prompts = await this.generatePromptsWithAI(outcome, request.language);

      // Cache the generated prompts
      await this.cachePrompts(request.outcomeId, request.language, prompts);

      const result: PromptGenerationResult = {
        outcomeId: request.outcomeId,
        outcome,
        prompts,
        language: request.language,
      };

      this.logger.info(
        {
          outcomeId: request.outcomeId,
          promptCount: prompts.length,
          duration: Date.now() - startTime,
        },
        'Prompt generation completed',
      );

      return result;
    } catch (error) {
      this.logger.error({ error, outcomeId: request.outcomeId }, 'Prompt generation failed');
      throw new Error('Failed to generate prompts');
    }
  }

  /**
   * Get cached prompts from the database
   */
  private async getCachedPrompts(outcomeId: string, language: string): Promise<GeneratedPrompt[]> {
    try {
      const cachedPrompts = await this.prisma.outcomePrompt.findMany({
        where: {
          outcomeId,
          language,
          isSystem: true, // Only get system-generated prompts
        },
        orderBy: { type: 'asc' },
      });

      return cachedPrompts.map((prompt) => ({
        type: prompt.type as GeneratedPrompt['type'],
        text: prompt.text,
      }));
    } catch (error) {
      this.logger.error({ error, outcomeId, language }, 'Failed to get cached prompts');
      return [];
    }
  }

  /**
   * Cache generated prompts in the database
   */
  private async cachePrompts(
    outcomeId: string,
    language: string,
    prompts: GeneratedPrompt[],
  ): Promise<void> {
    try {
      // Delete existing prompts for this outcome and language
      await this.prisma.outcomePrompt.deleteMany({
        where: {
          outcomeId,
          language,
          isSystem: true,
        },
      });

      // Insert new prompts
      await this.prisma.outcomePrompt.createMany({
        data: prompts.map((prompt) => ({
          outcomeId,
          type: prompt.type,
          language,
          text: prompt.text,
          isSystem: true,
        })),
      });

      this.logger.debug(
        { outcomeId, language, promptCount: prompts.length },
        'Prompts cached successfully',
      );
    } catch (error) {
      this.logger.error({ error, outcomeId, language }, 'Failed to cache prompts');
      // Don't throw - caching failure shouldn't break the main flow
    }
  }

  /**
   * Generate prompts using AI with few-shot examples
   */
  private async generatePromptsWithAI(
    outcome: { id: string; description: string; grade?: number; subject: string },
    language: 'en' | 'fr',
  ): Promise<GeneratedPrompt[]> {
    const promptTypes: GeneratedPrompt['type'][] = [
      'open_question',
      'sentence_stem',
      'discussion',
      'metacognitive',
    ];
    const examples = this.promptExamples[language];

    const systemMessage =
      language === 'fr'
        ? `Tu es un expert en pédagogie élémentaire. Génère des invites pédagogiques appropriées pour l'âge qui aident les enseignants à soutenir l'apprentissage des élèves et l'évaluation formative.

Règles importantes:
- Utilise un langage adapté à l'âge (niveau ${outcome.grade || 'élémentaire'})
- Les invites doivent être claires et actionnables
- Concentre-toi sur la compréhension et la réflexion
- Évite les questions fermées oui/non
- Assure-toi que les invites correspondent au résultat d'apprentissage

Types d'invites:
1. Questions ouvertes: encouragent la pensée critique
2. Amorces de phrases: fournissent une structure linguistique
3. Discussion: favorisent l'apprentissage collaboratif
4. Métacognitives: encouragent la réflexion sur l'apprentissage`
        : `You are an expert in elementary pedagogy. Generate age-appropriate pedagogical prompts that help teachers support student learning and formative assessment.

Important rules:
- Use age-appropriate language (grade ${outcome.grade || 'elementary'} level)
- Prompts should be clear and actionable
- Focus on understanding and reflection
- Avoid yes/no closed questions
- Ensure prompts align with the learning outcome

Prompt types:
1. Open questions: encourage critical thinking
2. Sentence stems: provide linguistic scaffolds
3. Discussion: promote collaborative learning
4. Metacognitive: encourage reflection on learning`;

    const results: GeneratedPrompt[] = [];

    for (const type of promptTypes) {
      try {
        const typeExamples = examples[type].slice(0, 3).join('\n- ');

        const prompt =
          language === 'fr'
            ? `Résultat d'apprentissage: ${outcome.description}
Sujet: ${outcome.subject}
Niveau: ${outcome.grade || 'Élémentaire'}

Type d'invite: ${type}

Exemples d'invites de ce type:
- ${typeExamples}

Génère 2 nouvelles invites pédagogiques de ce type qui sont spécifiquement alignées sur ce résultat d'apprentissage. Assure-toi qu'elles soient:
- Adaptées à l'âge et au niveau scolaire
- Spécifiques au contenu du résultat
- Engageantes pour les élèves

Réponds avec SEULEMENT les 2 invites, une par ligne, sans numérotation ni formatage supplémentaire.`
            : `Learning outcome: ${outcome.description}
Subject: ${outcome.subject}
Grade: ${outcome.grade || 'Elementary'}

Prompt type: ${type}

Examples of this type:
- ${typeExamples}

Generate 2 new pedagogical prompts of this type that are specifically aligned to this learning outcome. Ensure they are:
- Age-appropriate for the grade level
- Specific to the outcome content
- Engaging for students

Respond with ONLY the 2 prompts, one per line, with no numbering or extra formatting.`;

        const response = await generateContent(prompt, systemMessage);

        // Parse the response and add prompts
        const generatedPrompts = response
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0 && !line.match(/^\d+\.?\s*$/))
          .slice(0, 2); // Take only first 2

        generatedPrompts.forEach((text) => {
          if (text.length > 10) {
            // Basic validation
            results.push({
              type,
              text,
              context: `Grade ${outcome.grade || 'Elementary'} ${outcome.subject}`,
            });
          }
        });
      } catch (error) {
        this.logger.warn(
          { error, type, outcomeId: outcome.id },
          'Failed to generate prompts for type',
        );

        // Fallback to curated examples if AI generation fails
        const fallbackPrompts = examples[type].slice(0, 2);
        fallbackPrompts.forEach((text) => {
          results.push({
            type,
            text,
            context: `Fallback for ${outcome.subject}`,
          });
        });
      }
    }

    return results;
  }

  /**
   * Get prompt statistics for analytics
   */
  async getPromptStats(): Promise<{
    totalPrompts: number;
    promptsByType: Record<string, number>;
    promptsByLanguage: Record<string, number>;
    recentlyGenerated: number;
  }> {
    try {
      const totalPrompts = await this.prisma.outcomePrompt.count();

      const promptsByType = await this.prisma.outcomePrompt.groupBy({
        by: ['type'],
        _count: { type: true },
      });

      const promptsByLanguage = await this.prisma.outcomePrompt.groupBy({
        by: ['language'],
        _count: { language: true },
      });

      // Recent prompts (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentlyGenerated = await this.prisma.outcomePrompt.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      });

      return {
        totalPrompts,
        promptsByType: promptsByType.reduce(
          (acc, item) => {
            acc[item.type] = item._count.type;
            return acc;
          },
          {} as Record<string, number>,
        ),
        promptsByLanguage: promptsByLanguage.reduce(
          (acc, item) => {
            acc[item.language] = item._count.language;
            return acc;
          },
          {} as Record<string, number>,
        ),
        recentlyGenerated,
      };
    } catch (error) {
      this.logger.error({ error }, 'Failed to get prompt statistics');
      throw error;
    }
  }

  /**
   * Delete prompts for a specific outcome
   */
  async deletePromptsForOutcome(outcomeId: string): Promise<void> {
    try {
      await this.prisma.outcomePrompt.deleteMany({
        where: { outcomeId },
      });

      this.logger.info({ outcomeId }, 'Prompts deleted for outcome');
    } catch (error) {
      this.logger.error({ error, outcomeId }, 'Failed to delete prompts for outcome');
      throw error;
    }
  }
}

export default PromptGeneratorService;
