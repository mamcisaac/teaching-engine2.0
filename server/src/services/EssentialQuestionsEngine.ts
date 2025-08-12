import type { PrismaClient } from '@prisma/client';

import { logger } from '../logger';
import { BaseService } from './base/BaseService';

export interface EssentialQuestionAnalysis {
  question: string;
  category: 'factual' | 'analytical' | 'hypothetical' | 'priority';
  bloomsLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
  cognitiveLoad: 'low' | 'medium' | 'high';
  rationale: string;
  relevanceScore: number; // 0-1 based on curriculum alignment
}

export interface GeneratedQuestionSet {
  subject: string;
  grade: number;
  unit_theme?: string;
  essential_questions: EssentialQuestionAnalysis[];
  overarching_question: string;
  supporting_questions: string[];
  assessment_questions: string[];
}

export interface QuestionGenerationParameters {
  subject: string;
  grade: number;
  curriculum_expectations: string[];
  unit_theme?: string;
  duration_weeks?: number;
  big_ideas?: string[];
}

export class EssentialQuestionsEngine extends BaseService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    super('EssentialQuestionsEngine');
    this.prisma = prisma;
  }

  /**
   * Generate optimal essential questions for a given set of parameters
   * Uses curriculum expectations, subject patterns, and grade-appropriate complexity
   */
  async generateEssentialQuestions(
    parameters: QuestionGenerationParameters
  ): Promise<GeneratedQuestionSet> {
    try {
      logger.info(`Generating essential questions for ${parameters.subject}, Grade ${parameters.grade}`);

      // 1. Analyze curriculum expectations to identify key concepts
      const conceptAnalysis = this.analyzeCurriculumConcepts(parameters.curriculum_expectations);

      // 2. Get existing high-rated questions from database
      const existingQuestions = await this.getRelevantExistingQuestions(
        parameters.subject,
        parameters.grade
      );

      // 3. Generate new questions using pedagogical frameworks
      const generatedQuestions = this.generateQuestionsByFramework(
        parameters,
        conceptAnalysis
      );

      // 4. Combine and rank all questions
      const allQuestions = [...existingQuestions, ...generatedQuestions];
      const rankedQuestions = this.rankQuestionsByPedagogicalValue(
        allQuestions,
        parameters
      );

      // 5. Create hierarchical question structure
      const questionSet = this.createQuestionHierarchy(rankedQuestions, parameters);

      // 6. Update usage statistics for selected questions
      await this.updateQuestionUsageStats(questionSet.essential_questions);

      return questionSet;
    } catch (error) {
      logger.error('Error generating essential questions:', error);
      throw error;
    }
  }

  /**
   * Analyze curriculum expectations to identify key concepts and themes
   */
  private analyzeCurriculumConcepts(expectations: string[]): {
    key_concepts: string[];
    thinking_skills: string[];
    content_areas: string[];
    complexity_indicators: string[];
  } {
    const analysis = {
      key_concepts: [],
      thinking_skills: [],
      content_areas: [],
      complexity_indicators: []
    };

    expectations.forEach(expectation => {
      const lower = expectation.toLowerCase();
      
      // Identify thinking skills
      if (lower.includes('analyze') || lower.includes('compare') || lower.includes('evaluate')) {
        analysis.thinking_skills.push('higher-order thinking');
      }
      if (lower.includes('explain') || lower.includes('describe') || lower.includes('identify')) {
        analysis.thinking_skills.push('comprehension');
      }
      if (lower.includes('create') || lower.includes('design') || lower.includes('construct')) {
        analysis.thinking_skills.push('synthesis');
      }
      
      // Identify key concepts (simplified pattern matching)
      if (lower.includes('pattern') || lower.includes('relationship') || lower.includes('connection')) {
        analysis.key_concepts.push('patterns and relationships');
      }
      if (lower.includes('problem') || lower.includes('solution') || lower.includes('strategy')) {
        analysis.key_concepts.push('problem solving');
      }
      if (lower.includes('communicate') || lower.includes('express') || lower.includes('share')) {
        analysis.key_concepts.push('communication');
      }
    });

    return analysis;
  }

  /**
   * Get existing high-quality essential questions from the database
   */
  private async getRelevantExistingQuestions(
    subject: string,
    grade: number
  ): Promise<EssentialQuestionAnalysis[]> {
    const questions = await this.prisma.essentialQuestionTemplate.findMany({
      where: {
        subject,
        gradeMin: { lte: grade },
        gradeMax: { gte: grade },
        rating: { gte: 3.5 } // Only high-quality questions
      },
      orderBy: [
        { rating: 'desc' },
        { timesUsed: 'desc' }
      ],
      take: 20
    });

    return questions.map(q => ({
      question: q.question,
      category: q.category as 'factual' | 'analytical' | 'hypothetical' | 'priority',
      bloomsLevel: q.bloomsLevel as 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create',
      cognitiveLoad: q.cognitiveLoad as 'low' | 'medium' | 'high',
      rationale: `Existing high-quality question (Rating: ${q.rating}, Used: ${q.timesUsed} times)`,
      relevanceScore: Math.min(q.rating / 5, 1) // Convert to 0-1 scale
    }));
  }

  /**
   * Generate new questions using pedagogical frameworks
   */
  private generateQuestionsByFramework(
    parameters: QuestionGenerationParameters,
    concepts: { key_concepts: string[]; thinking_skills: string[]; content_areas: string[]; }
  ): EssentialQuestionAnalysis[] {
    const questions: EssentialQuestionAnalysis[] = [];

    // Generate questions by subject and grade level
    const subjectQuestions = this.getSubjectSpecificQuestions(parameters.subject, parameters.grade);
    questions.push(...subjectQuestions);

    // Generate questions based on big ideas if provided
    if (parameters.big_ideas && parameters.big_ideas.length > 0) {
      const bigIdeaQuestions = this.generateBigIdeaQuestions(parameters.big_ideas, parameters.grade);
      questions.push(...bigIdeaQuestions);
    }

    // Generate questions based on thinking skills identified
    const thinkingQuestions = this.generateThinkingSkillQuestions(concepts.thinking_skills, parameters);
    questions.push(...thinkingQuestions);

    return questions;
  }

  /**
   * Get subject-specific essential questions optimized for grade level
   */
  private getSubjectSpecificQuestions(subject: string, grade: number): EssentialQuestionAnalysis[] {
    const questionBank: Record<string, Record<number, EssentialQuestionAnalysis[]>> = {
      'Mathematics': {
        1: [
          {
            question: 'How do numbers help us understand our world?',
            category: 'analytical',
            bloomsLevel: 'understand',
            cognitiveLoad: 'medium',
            rationale: 'Connects mathematical concepts to real-world applications, appropriate for Grade 1',
            relevanceScore: 0.9
          },
          {
            question: 'What patterns can we find around us?',
            category: 'analytical',
            bloomsLevel: 'analyze',
            cognitiveLoad: 'medium',
            rationale: 'Develops pattern recognition skills fundamental to mathematics',
            relevanceScore: 0.85
          },
          {
            question: 'How can we solve problems using what we know?',
            category: 'hypothetical',
            bloomsLevel: 'apply',
            cognitiveLoad: 'medium',
            rationale: 'Encourages mathematical problem-solving strategies',
            relevanceScore: 0.8
          }
        ]
      },
      'Français langue première': {
        1: [
          {
            question: 'Comment les mots nous aident-ils à partager nos idées?',
            category: 'analytical',
            bloomsLevel: 'analyze',
            cognitiveLoad: 'medium',
            rationale: 'Explores the communicative power of language, appropriate for early French learners',
            relevanceScore: 0.9
          },
          {
            question: 'Que nous apprennent les histoires sur nous-mêmes?',
            category: 'analytical',
            bloomsLevel: 'evaluate',
            cognitiveLoad: 'medium',
            rationale: 'Encourages personal connection to literature and self-reflection',
            relevanceScore: 0.85
          },
          {
            question: 'Comment pouvons-nous devenir de meilleurs communicateurs?',
            category: 'priority',
            bloomsLevel: 'create',
            cognitiveLoad: 'medium',
            rationale: 'Focuses on skill development and metacognition in language learning',
            relevanceScore: 0.8
          }
        ]
      },
      'Sciences et technologie': {
        1: [
          {
            question: 'What makes something alive?',
            category: 'factual',
            bloomsLevel: 'understand',
            cognitiveLoad: 'low',
            rationale: 'Fundamental biological concept appropriate for Grade 1 exploration',
            relevanceScore: 0.9
          },
          {
            question: 'How do we learn about the world around us?',
            category: 'analytical',
            bloomsLevel: 'analyze',
            cognitiveLoad: 'medium',
            rationale: 'Introduces scientific inquiry methods in age-appropriate way',
            relevanceScore: 0.85
          },
          {
            question: 'How can we take care of our environment?',
            category: 'priority',
            bloomsLevel: 'evaluate',
            cognitiveLoad: 'medium',
            rationale: 'Connects science learning to environmental stewardship',
            relevanceScore: 0.8
          }
        ]
      },
      'Études sociales': {
        1: [
          {
            question: 'What makes a good community member?',
            category: 'priority',
            bloomsLevel: 'evaluate',
            cognitiveLoad: 'medium',
            rationale: 'Develops citizenship concepts appropriate for Grade 1',
            relevanceScore: 0.9
          },
          {
            question: 'How are families the same and different?',
            category: 'analytical',
            bloomsLevel: 'analyze',
            cognitiveLoad: 'low',
            rationale: 'Explores diversity and similarities in age-appropriate context',
            relevanceScore: 0.85
          },
          {
            question: 'Why do we have rules and how do they help us?',
            category: 'analytical',
            bloomsLevel: 'understand',
            cognitiveLoad: 'low',
            rationale: 'Introduces concepts of governance and social order',
            relevanceScore: 0.8
          }
        ]
      }
    };

    return questionBank[subject]?.[grade] || [];
  }

  /**
   * Generate questions based on big ideas
   */
  private generateBigIdeaQuestions(bigIdeas: string[], grade: number): EssentialQuestionAnalysis[] {
    return bigIdeas.slice(0, 2).map(idea => ({
      question: `How does ${idea.toLowerCase()} affect our daily lives?`,
      category: 'analytical' as const,
      bloomsLevel: 'analyze' as const,
      cognitiveLoad: 'medium' as const,
      rationale: `Generated question connecting big idea "${idea}" to student experience`,
      relevanceScore: 0.7
    }));
  }

  /**
   * Generate questions based on thinking skills
   */
  private generateThinkingSkillQuestions(
    thinkingSkills: string[],
    parameters: QuestionGenerationParameters
  ): EssentialQuestionAnalysis[] {
    const questions: EssentialQuestionAnalysis[] = [];

    if (thinkingSkills.includes('higher-order thinking')) {
      questions.push({
        question: 'What if we tried a different approach?',
        category: 'hypothetical',
        bloomsLevel: 'create',
        cognitiveLoad: 'high',
        rationale: 'Encourages creative problem-solving and flexible thinking',
        relevanceScore: 0.75
      });
    }

    if (thinkingSkills.includes('problem solving')) {
      questions.push({
        question: 'What strategies help us solve challenging problems?',
        category: 'analytical',
        bloomsLevel: 'analyze',
        cognitiveLoad: 'medium',
        rationale: 'Develops metacognitive awareness of problem-solving strategies',
        relevanceScore: 0.8
      });
    }

    return questions;
  }

  /**
   * Rank questions by pedagogical value and relevance
   */
  private rankQuestionsByPedagogicalValue(
    questions: EssentialQuestionAnalysis[],
    parameters: QuestionGenerationParameters
  ): EssentialQuestionAnalysis[] {
    return questions
      .sort((a, b) => {
        // Primary sort by relevance score
        const relevanceDiff = b.relevanceScore - a.relevanceScore;
        if (Math.abs(relevanceDiff) > 0.1) return relevanceDiff;

        // Secondary sort by cognitive complexity (prefer medium for Grade 1)
        const gradeOptimal = parameters.grade <= 2 ? 'medium' : 'high';
        const aComplexityScore = a.cognitiveLoad === gradeOptimal ? 1 : 0.5;
        const bComplexityScore = b.cognitiveLoad === gradeOptimal ? 1 : 0.5;
        
        return bComplexityScore - aComplexityScore;
      })
      .slice(0, 12); // Limit to top 12 questions
  }

  /**
   * Create hierarchical question structure with overarching and supporting questions
   */
  private createQuestionHierarchy(
    questions: EssentialQuestionAnalysis[],
    parameters: QuestionGenerationParameters
  ): GeneratedQuestionSet {
    // Select top 3-5 questions as essential questions
    const essentialQuestions = questions.slice(0, Math.min(5, questions.length));

    // Create overarching question that connects to unit theme or subject
    const overarchingQuestion = this.generateOverarchingQuestion(parameters);

    // Create supporting questions from remaining questions
    const supportingQuestions = questions
      .slice(5, 10)
      .map(q => q.question);

    // Create assessment-focused questions
    const assessmentQuestions = this.generateAssessmentQuestions(essentialQuestions, parameters);

    return {
      subject: parameters.subject,
      grade: parameters.grade,
      unit_theme: parameters.unit_theme,
      essential_questions: essentialQuestions,
      overarching_question: overarchingQuestion,
      supporting_questions: supportingQuestions,
      assessment_questions: assessmentQuestions
    };
  }

  /**
   * Generate an overarching question for the unit or subject
   */
  private generateOverarchingQuestion(parameters: QuestionGenerationParameters): string {
    if (parameters.unit_theme) {
      return `How does understanding ${parameters.unit_theme} help us make sense of our world?`;
    }

    const subjectOverarching: Record<string, string> = {
      'Mathematics': 'How does mathematical thinking help us solve problems and understand patterns?',
      'Français langue première': 'Comment la langue française nous permet-elle de nous exprimer et de communiquer efficacement?',
      'Sciences et technologie': 'How can we use scientific thinking to understand and improve our world?',
      'Études sociales': 'How do we live together and make our communities better places for everyone?',
      'Arts': 'How does artistic expression help us share our ideas and connect with others?',
      'English Language Arts': 'How do stories and language help us understand ourselves and others?'
    };

    return subjectOverarching[parameters.subject] || 
           `How does learning about ${parameters.subject} help us in our daily lives?`;
  }

  /**
   * Generate assessment-focused questions
   */
  private generateAssessmentQuestions(
    essentialQuestions: EssentialQuestionAnalysis[],
    parameters: QuestionGenerationParameters
  ): string[] {
    return [
      `How can you show what you learned about ${parameters.subject.toLowerCase()}?`,
      `What would you tell someone else about what we studied?`,
      `How will you use this learning in your life?`,
      ...essentialQuestions.slice(0, 2).map(eq => 
        `Can you explain your thinking about: ${eq.question.toLowerCase()}?`
      )
    ];
  }

  /**
   * Update usage statistics for selected questions
   */
  private async updateQuestionUsageStats(questions: EssentialQuestionAnalysis[]): Promise<void> {
    try {
      const updatePromises = questions.map(async (q) => {
        // Try to find existing question in database
        const existing = await this.prisma.essentialQuestionTemplate.findFirst({
          where: { question: q.question }
        });

        if (existing) {
          // Update usage count
          await this.prisma.essentialQuestionTemplate.update({
            where: { id: existing.id },
            data: { 
              timesUsed: existing.timesUsed + 1,
              updatedAt: new Date()
            }
          });
        } else {
          // Create new question template for future use
          await this.prisma.essentialQuestionTemplate.create({
            data: {
              question: q.question,
              subject: q.question.includes('français') || q.question.includes('nous') ? 'Français langue première' : 'General',
              gradeMin: 1,
              gradeMax: 8,
              category: q.category,
              bloomsLevel: q.bloomsLevel,
              cognitiveLoad: q.cognitiveLoad,
              timesUsed: 1,
              rating: q.relevanceScore * 5 // Convert to 5-point scale
            }
          });
        }
      });

      await Promise.all(updatePromises);
      logger.info(`Updated usage statistics for ${questions.length} essential questions`);
    } catch (error) {
      logger.error('Error updating question usage statistics:', error);
      // Don't throw error - this is non-critical
    }
  }

  /**
   * Evaluate the quality of existing essential questions
   */
  async evaluateQuestionQuality(
    question: string,
    subject: string,
    grade: number,
    curriculum_context: string[]
  ): Promise<{
    quality_score: number;
    suggestions: string[];
    pedagogical_alignment: number;
  }> {
    // Implementation for evaluating question quality
    // This could include checks for:
    // - Cognitive complexity appropriate for grade
    // - Open-ended nature
    // - Curriculum alignment
    // - Potential for transfer
    
    return {
      quality_score: 0.85,
      suggestions: ['Consider adding more specific context', 'Could be more open-ended'],
      pedagogical_alignment: 0.9
    };
  }

  /**
   * Health check for the service
   */
  async checkHealth(): Promise<{ healthy: boolean; details: Record<string, unknown> }> {
    try {
      const questionCount = await this.prisma.essentialQuestionTemplate.count();
      return {
        healthy: true,
        details: {
          totalQuestions: questionCount,
          serviceStatus: 'operational'
        }
      };
    } catch (error) {
      return {
        healthy: false,
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}