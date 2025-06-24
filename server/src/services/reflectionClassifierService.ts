import { BaseService } from './base/BaseService';
import { EmbeddingService } from './embeddingService';
import { generateContent } from './llmService';

export interface ClassificationResult {
  expectations: Array<{
    id: string;
    confidence: number;
    rationale: string;
  }>;
  selTags: string[];
}

export interface ReflectionClassificationRequest {
  studentId: number;
  text: string;
  existingExpectationId?: string; // If already linked to an expectation
}

export class ReflectionClassifierService extends BaseService {
  private embeddingService: EmbeddingService;

  // SEL tags taxonomy - developmentally appropriate for elementary students
  private readonly selTagsVocabulary = [
    'perseverance',
    'collaboration',
    'curiosity',
    'creativity',
    'leadership',
    'empathy',
    'self-reflection',
    'problem-solving',
    'communication',
    'responsibility',
    'risk-taking',
    'independence',
    'organization',
    'goal-setting',
    'resilience',
    'cultural-awareness',
  ];

  constructor() {
    super('ReflectionClassifierService');
    this.embeddingService = new EmbeddingService();
  }

  /**
   * Classify a student reflection to suggest curriculum outcomes and SEL tags
   */
  async classifyReflection(
    request: ReflectionClassificationRequest,
  ): Promise<ClassificationResult> {
    const startTime = Date.now();

    try {
      this.logger.info({ studentId: request.studentId }, 'Starting reflection classification');

      // Get expectation suggestions using embedding similarity
      const expectationSuggestions = await this.findSimilarExpectations(request.text);

      // Extract SEL tags using LLM
      const selTags = await this.extractSELTags(request.text);

      const result: ClassificationResult = {
        expectations: expectationSuggestions,
        selTags,
      };

      this.logger.info(
        {
          studentId: request.studentId,
          expectationCount: result.expectations.length,
          selTagCount: result.selTags.length,
          duration: Date.now() - startTime,
        },
        'Reflection classification completed',
      );

      return result;
    } catch (error) {
      this.logger.error(
        { error, studentId: request.studentId },
        'Reflection classification failed',
      );
      throw new Error('Failed to classify reflection');
    }
  }

  /**
   * Find similar curriculum expectations using embedding similarity
   */
  private async findSimilarExpectations(reflectionText: string): Promise<
    Array<{
      id: string;
      confidence: number;
      rationale: string;
    }>
  > {
    try {
      // Generate embedding for the reflection text
      const reflectionEmbedding =
        await this.embeddingService.generateEmbeddingVector(reflectionText);

      if (!reflectionEmbedding) {
        this.logger.warn('Could not generate embedding for reflection text');
        return [];
      }

      // Find similar expectations using cosine similarity
      // Note: In a production system, you'd use a vector database like Pinecone or Qdrant
      // For now, we'll use a simplified approach with the existing embeddings
      const expectationEmbeddings = await this.prisma.expectationEmbedding.findMany({
        include: {
          expectation: {
            select: {
              id: true,
              code: true,
              description: true,
              subject: true,
              grade: true,
            },
          },
        },
        take: 50, // Limit for performance
      });

      const similarities = expectationEmbeddings
        .map((ee) => {
          const similarity = this.cosineSimilarity(reflectionEmbedding, ee.embedding as number[]);

          return {
            id: ee.expectationId,
            similarity,
            expectation: ee.expectation,
          };
        })
        .sort((a, b) => b.similarity - a.similarity);

      // Take top 3 with confidence > 0.6
      const topExpectations = similarities.filter((s) => s.similarity > 0.6).slice(0, 3);

      // Generate rationales for the top expectations
      const results = await Promise.all(
        topExpectations.map(async (expectation) => {
          const rationale = await this.generateExpectationRationale(
            reflectionText,
            expectation.expectation.description,
          );

          return {
            id: expectation.id,
            confidence: Math.round(expectation.similarity * 100) / 100,
            rationale,
          };
        }),
      );

      return results;
    } catch (error) {
      this.logger.error({ error }, 'Failed to find similar expectations');
      return [];
    }
  }

  /**
   * Extract SEL (Social Emotional Learning) tags from reflection text
   */
  private async extractSELTags(reflectionText: string): Promise<string[]> {
    try {
      const systemMessage = `You are an expert in Social Emotional Learning (SEL) for elementary school students. 
      Analyze the following student reflection and identify which SEL competencies are demonstrated.
      
      Available SEL tags: ${this.selTagsVocabulary.join(', ')}
      
      Rules:
      - Only use tags from the provided vocabulary
      - Return 1-4 most relevant tags
      - Consider both explicit mentions and implicit demonstrations
      - Focus on what the student actually demonstrated, not what they might learn
      
      Respond with ONLY a comma-separated list of tags, no other text.`;

      const prompt = `Student reflection: "${reflectionText}"`;

      const response = await generateContent(prompt, systemMessage);

      // Parse and validate the response
      const extractedTags = response
        .split(',')
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => this.selTagsVocabulary.includes(tag))
        .slice(0, 4); // Limit to 4 tags maximum

      this.logger.debug({ extractedTags, originalResponse: response }, 'SEL tags extracted');

      return extractedTags;
    } catch (error) {
      this.logger.error({ error }, 'Failed to extract SEL tags');
      return [];
    }
  }

  /**
   * Generate a rationale for why an expectation matches a reflection
   */
  private async generateExpectationRationale(
    reflectionText: string,
    expectationDescription: string,
  ): Promise<string> {
    try {
      const systemMessage = `You are an educational expert. Explain in 1-2 concise sentences why a student reflection demonstrates evidence of a specific curriculum expectation.`;

      const prompt = `Student reflection: "${reflectionText}"
      
      Curriculum expectation: "${expectationDescription}"
      
      Explain why this reflection provides evidence of the expectation:`;

      const rationale = await generateContent(prompt, systemMessage);
      return rationale.length > 200 ? rationale.substring(0, 200) + '...' : rationale;
    } catch (error) {
      this.logger.error({ error }, 'Failed to generate expectation rationale');
      return 'Demonstrates relevant skills and understanding.';
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Update a student reflection with classification results
   */
  async updateReflectionWithClassification(
    reflectionId: number,
    classification: ClassificationResult,
  ): Promise<void> {
    try {
      await this.prisma.studentReflection.update({
        where: { id: reflectionId },
        data: {
          suggestedExpectationIds: JSON.stringify(classification.expectations.map((e) => e.id)),
          selTags: JSON.stringify(classification.selTags),
          classificationConfidence: classification.expectations[0]?.confidence || 0,
          classificationRationale: classification.expectations[0]?.rationale || '',
          classifiedAt: new Date(),
        },
      });

      this.logger.info({ reflectionId }, 'Reflection updated with classification results');
    } catch (error) {
      this.logger.error({ error, reflectionId }, 'Failed to update reflection with classification');
      throw error;
    }
  }

  /**
   * Get classification statistics for analytics
   */
  async getClassificationStats(userId: number): Promise<{
    totalClassified: number;
    averageConfidence: number;
    topSELTags: Array<{ tag: string; count: number }>;
    recentClassifications: number;
  }> {
    try {
      // Get all student reflections for the user that have been classified
      const classifiedReflections = await this.prisma.studentReflection.findMany({
        where: {
          student: {
            userId: userId,
          },
          classifiedAt: {
            not: null,
          },
        },
        select: {
          classificationConfidence: true,
          selTags: true,
          classifiedAt: true,
        },
      });

      const totalClassified = classifiedReflections.length;
      const averageConfidence =
        totalClassified > 0
          ? classifiedReflections.reduce((acc, r) => acc + (r.classificationConfidence || 0), 0) /
            totalClassified
          : 0;

      // Count SEL tags
      const tagCounts: Record<string, number> = {};
      classifiedReflections.forEach((reflection) => {
        if (reflection.selTags) {
          try {
            const tags = JSON.parse(reflection.selTags) as string[];
            tags.forEach((tag) => {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
          } catch (error) {
            // Skip invalid JSON
          }
        }
      });

      const topSELTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Recent classifications (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentClassifications = classifiedReflections.filter(
        (r) => r.classifiedAt && r.classifiedAt > thirtyDaysAgo,
      ).length;

      return {
        totalClassified,
        averageConfidence: Math.round(averageConfidence * 100) / 100,
        topSELTags,
        recentClassifications,
      };
    } catch (error) {
      this.logger.error({ error, userId }, 'Failed to get classification stats');
      throw error;
    }
  }
}

export default ReflectionClassifierService;
