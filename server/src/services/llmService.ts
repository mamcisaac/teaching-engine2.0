/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * LLM Service - Large Language Model operations for Teaching Engine 2.0
 * Handles OpenAI integration and content generation
 */

// eslint-disable-next-line import/no-named-as-default
import OpenAI from 'openai';

import { BaseService } from './base/BaseService.js';
// import logger from '../logger.js';

export interface ContentGenerationRequest {
  prompt: string;
  type?: 'lesson' | 'unit' | 'activity' | 'assessment' | 'general';
  context?: {
    subject?: string;
    grade?: number;
    duration?: number;
    language?: 'english' | 'french' | 'bilingual';
  };
  maxTokens?: number;
  temperature?: number;
}

export interface BilingualContent {
  english: string;
  french: string;
}

export interface GenerationResult {
  content: string;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
  model: string;
  finishReason: string;
}

export interface BilingualGenerationResult {
  content: BilingualContent;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
  model: string;
  finishReason: string;
}

/**
 * LLM Service for content generation using OpenAI
 */
export class LLMService extends BaseService {
  private static instance: LLMService;
  private openaiClient: OpenAI | null = null;
  private readonly defaultModel = 'gpt-4o-mini';
  private readonly maxRetries = 3;
  // @ts-expect-error Reserved for future retry implementation
  private readonly _retryDelay = 1000; // 1 second

  private constructor() {
    super('LLMService');
    this.initializeOpenAI();
  }

  /**
   * Service initialization override
   */
  protected async initialize(): Promise<void> {
    await super.initialize();
    // OpenAI initialization is already done in constructor
  }

  public static getInstance(): LLMService {
    if (LLMService.instance === null || LLMService.instance === undefined) {
      LLMService.instance = new LLMService();
    }
    return LLMService.instance;
  }

  /**
   * Initialize OpenAI client
   */
  private initializeOpenAI(): void {
    try {
      const apiKey = process.env.OPENAI_API_KEY;

      if (apiKey === null || apiKey === undefined || apiKey === '') {
        this.logger.warn('OpenAI API key not provided. LLM features will be disabled.');
        return;
      }

      this.openaiClient = new OpenAI({
        apiKey,
        timeout: 30000, // 30 second timeout
        maxRetries: this.maxRetries,
      });

      this.logger.info('OpenAI client initialized successfully');
    } catch (error) {
      this.logger.error(`Failed to initialize OpenAI client: ${error}`);
      this.openaiClient = null;
    }
  }

  /**
   * Get OpenAI client instance (for testing and direct access)
   */
  public get openai(): OpenAI | null {
    return this.openaiClient;
  }

  /**
   * Check if the service is ready for content generation
   */
  public isReady(): boolean {
    return this.openaiClient !== null;
  }

  /**
   * Generate content based on a prompt
   */
  public async generateContent(request: ContentGenerationRequest): Promise<string> {
    return this.executeWithMetrics(async () => {
      if (!this.isReady()) {
        throw new Error('LLM service not initialized. Please check OpenAI API key.');
      }

      const enhancedPrompt = this.enhancePrompt(request);

      this.logger.debug(
        `Generating content with prompt - type: ${request.type}, promptLength: ${enhancedPrompt.length}`,
      );

      if (this.openaiClient === null || this.openaiClient === undefined) {
        throw new Error('OpenAI client is not available');
      }
      
      const response = await this.openaiClient.chat.completions.create({
        model: this.defaultModel,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(request.type ?? 'general'),
          },
          {
            role: 'user',
            content: enhancedPrompt,
          },
        ],
        max_tokens: request.maxTokens ?? 2000,
        temperature: request.temperature ?? 0.7,
      });

      const content = response.choices[0]?.message?.content ?? '';

      if (content === null || content === undefined || content === '') {
        throw new Error('No content generated from OpenAI');
      }

      this.logger.debug(
        `Content generated successfully - length: ${content.length}, tokens: ${response.usage?.total_tokens ?? 'unknown'}`,
      );

      return content;
    }, 'generateContent');
  }

  /**
   * Generate bilingual content (English and French)
   */
  public async generateBilingualContent(
    request: ContentGenerationRequest,
  ): Promise<BilingualContent> {
    return this.executeWithMetrics(async () => {
      if (!this.isReady()) {
        throw new Error('LLM service not initialized. Please check OpenAI API key.');
      }

      // Generate English content first
      const englishRequest = {
        ...request,
        context: { ...request.context, language: 'english' as const },
      };
      const englishContent = await this.generateContent(englishRequest);

      // Generate French content
      const frenchRequest = {
        ...request,
        context: { ...request.context, language: 'french' as const },
      };
      const frenchContent = await this.generateContent(frenchRequest);

      return {
        english: englishContent,
        french: frenchContent,
      };
    }, 'generateBilingualContent');
  }

  /**
   * Generate content with detailed response information
   */
  public async generateContentDetailed(
    request: ContentGenerationRequest,
  ): Promise<GenerationResult> {
    return this.executeWithMetrics(async () => {
      if (!this.isReady()) {
        throw new Error('LLM service not initialized. Please check OpenAI API key.');
      }

      const enhancedPrompt = this.enhancePrompt(request);

      if (this.openaiClient === null || this.openaiClient === undefined) {
        throw new Error('OpenAI client is not available');
      }
      
      const response = await this.openaiClient.chat.completions.create({
        model: this.defaultModel,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(request.type ?? 'general'),
          },
          {
            role: 'user',
            content: enhancedPrompt,
          },
        ],
        max_tokens: request.maxTokens ?? 2000,
        temperature: request.temperature ?? 0.7,
      });

      const content = response.choices[0]?.message?.content ?? '';

      if (content === null || content === undefined || content === '') {
        throw new Error('No content generated from OpenAI');
      }

      return {
        content,
        tokensUsed: {
          prompt: response.usage?.prompt_tokens ?? 0,
          completion: response.usage?.completion_tokens ?? 0,
          total: response.usage?.total_tokens ?? 0,
        },
        model: response.model,
        finishReason: response.choices[0]?.finish_reason ?? 'unknown',
      };
    }, 'generateContentDetailed');
  }

  /**
   * Enhance the prompt with context and formatting
   */
  private enhancePrompt(request: ContentGenerationRequest): string {
    let {prompt} = request;

    // Add context if provided
    if (request.context !== null && request.context !== undefined) {
      const contextParts: string[] = [];

      if (request.context.subject !== null && request.context.subject !== undefined && request.context.subject !== '') {
        contextParts.push(`Subject: ${request.context.subject}`);
      }

      if (request.context.grade !== null && request.context.grade !== undefined && request.context.grade !== 0) {
        contextParts.push(`Grade Level: ${request.context.grade}`);
      }

      if (request.context.duration !== null && request.context.duration !== undefined && request.context.duration !== 0) {
        contextParts.push(`Duration: ${request.context.duration} minutes`);
      }

      if (request.context.language !== null && request.context.language !== undefined) {
        contextParts.push(`Language: ${request.context.language}`);
      }

      if (contextParts.length > 0) {
        prompt = `Context:\n${contextParts.join('\n')}\n\nRequest:\n${prompt}`;
      }
    }

    return prompt;
  }

  /**
   * Get system prompt based on content type
   */
  private getSystemPrompt(type: string): string {
    const basePrompt = `You are an AI assistant specialized in educational content creation for elementary school teachers in Prince Edward Island, Canada. You understand the local curriculum expectations and ETFO (Elementary Teachers' Federation of Ontario) best practices.`;

    const typePrompts: Record<string, string> = {
      lesson: `${basePrompt} Focus on creating engaging, age-appropriate lesson plans with clear learning objectives, varied activities, and assessment strategies.`,
      unit: `${basePrompt} Focus on creating comprehensive unit plans that connect multiple lessons around central themes and big ideas.`,
      activity: `${basePrompt} Focus on creating hands-on, engaging activities that support specific learning goals and accommodate different learning styles.`,
      assessment: `${basePrompt} Focus on creating fair, meaningful assessment strategies that support student learning and provide actionable feedback.`,
      general: basePrompt,
    };

    return typePrompts[type] ?? typePrompts.general;
  }

  /**
   * Check service dependencies
   */
  protected checkDependencies(): Record<string, boolean> {
    return {
      ...super.checkDependencies(),
      openai: this.isReady(),
    };
  }

  /**
   * Get service health status
   */
  protected getHealthStatus(): 'healthy' | 'degraded' | 'unhealthy' {
    const baseHealth = super.getHealthStatus();

    if (!this.isReady()) {
      return 'degraded'; // Service works but AI features unavailable
    }

    return baseHealth;
  }

  /**
   * Validate content generation request
   */
  // @ts-expect-error Method reserved for future request validation
  private _validateRequest(request: ContentGenerationRequest): void {
    if (request.prompt === null || request.prompt === undefined || request.prompt.trim().length === 0) {
      throw new Error('Prompt is required and cannot be empty');
    }

    if (request.maxTokens !== null && request.maxTokens !== undefined && (request.maxTokens < 1 || request.maxTokens > 4000)) {
      throw new Error('Max tokens must be between 1 and 4000');
    }

    if (request.temperature !== null && request.temperature !== undefined && (request.temperature < 0 || request.temperature > 2)) {
      throw new Error('Temperature must be between 0 and 2');
    }
  }

  /**
   * Clean shutdown
   */
  public async shutdown(): Promise<void> {
    await super.shutdown();
    this.openaiClient = null;
  }
}

// Export singleton instance
export const llmService = LLMService.getInstance();

// Export individual functions for backward compatibility and ease of use
export const generateContent = (request: ContentGenerationRequest): Promise<string> =>
  llmService.generateContent(request);

export const generateBilingualContent = (
  request: ContentGenerationRequest,
): Promise<BilingualContent> => llmService.generateBilingualContent(request);

export const generateContentDetailed = (
  request: ContentGenerationRequest,
): Promise<GenerationResult> => llmService.generateContentDetailed(request);

// Export OpenAI client for direct access (used by tests and other services)
export const {openai} = llmService;
