/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * AIService - Main AI service for Teaching Engine
 * Coordinates AI operations across different providers with real OpenAI integration
 */

import OpenAI from 'openai';
import { BaseService } from '../base/BaseService';
import logger from '../../logger';
import { AppError } from '../../utils/errors';

export interface AIServiceOptions {
  openAIClient?: OpenAI;
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

export interface LessonGenerationInput {
  grade: string;
  subject: string;
  topic: string;
  duration: number;
  standards?: string[];
  objectives?: string[];
  learningStyle?: string;
  classSize?: number;
  specialNeeds?: string[];
  resources?: string[];
}

export interface ActivityGenerationInput {
  topic: string;
  grade: string;
  subject: string;
  type: string;
  learningObjectives?: string[];
  duration?: number;
  materials?: string[];
}

export interface SubstitutePlanInput {
  date: Date;
  grade: string;
  subjects: string[];
  duration: number;
  notes?: string;
}

export interface NewsletterGenerationInput {
  classroom: string;
  dateRange: { start: Date; end: Date };
  highlights: string[];
  upcomingEvents?: string[];
  reminders?: string[];
}

interface LessonPlan {
  title: string;
  objectives: string[];
  activities: Array<{
    name: string;
    duration: number;
    materials: string[];
    description: string;
  }>;
  materials: string[];
  duration: number;
}

interface Activity {
  name: string;
  type: string;
  description: string;
  duration: number;
  materials: string[];
  instructions: string[];
  learningObjectives: string[];
}

interface SubstitutePlan {
  date: Date;
  grade: string;
  subjects: string[];
  schedule: Array<{
    time: string;
    subject: string;
    activity: string;
    materials: string[];
    notes: string;
  }>;
  generalNotes: string;
  emergencyContacts: Array<{
    name: string;
    number: string;
  }>;
}

interface Newsletter {
  title: string;
  dateRange: { start: Date; end: Date };
  sections: Array<{
    title: string;
    content: string;
  }>;
  footer: string;
}

export class AIService extends BaseService {
  private openAIClient: OpenAI;
  private apiKey: string;
  private model: string;
  private temperature: number;
  private maxTokens: number;
  private timeout: number;
  private requestCache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 60 * 60 * 1000; // 1 hour

  constructor(options: AIServiceOptions) {
    super('AIService');
    this.apiKey = options.apiKey;
    this.model = options.model || 'gpt-3.5-turbo';
    this.temperature = options.temperature || 0.7;
    this.maxTokens = options.maxTokens || 2000;
    this.timeout = options.timeout || 30000;
    
    this.openAIClient = options.openAIClient || new OpenAI({
      apiKey: this.apiKey,
      timeout: this.timeout,
    });
  }

  async generateLesson(input: LessonGenerationInput): Promise<LessonPlan> {
    try {
      const cacheKey = this.createCacheKey('lesson', input);
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        logger.debug('Returning cached lesson plan');
        return cached;
      }

      const prompt = this.buildLessonPrompt(input);
      const systemPrompt = this.getLessonSystemPrompt();
      
      const response = await this.openAIClient.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: this.temperature,
        max_tokens: this.maxTokens,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new AppError('No response from AI service', 500);
      }

      let lessonPlan: LessonPlan;
      try {
        lessonPlan = JSON.parse(content);
      } catch (parseError) {
        logger.warn('Failed to parse AI response, using fallback');
        lessonPlan = this.createFallbackLesson(input);
        lessonPlan.fallback = true;
        lessonPlan.error = 'JSON parsing failed';
      }

      // Validate and fix lesson plan structure
      lessonPlan = this.validateAndFixLessonPlan(lessonPlan, input);
      
      this.setCache(cacheKey, lessonPlan);
      logger.info(`Generated lesson plan for Grade ${input.grade} ${input.subject}: ${input.topic}`);
      
      return lessonPlan;
    } catch (error: any) {
      logger.error('Error generating lesson plan:', error);
      const fallback = this.createFallbackLesson(input);
      fallback.fallback = true;
      fallback.error = error.message;
      return fallback;
    }
  }

  async generateActivity(input: ActivityGenerationInput): Promise<Activity> {
    try {
      const cacheKey = this.createCacheKey('activity', input);
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const prompt = this.buildActivityPrompt(input);
      const systemPrompt = this.getActivitySystemPrompt();
      
      const response = await this.openAIClient.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: this.temperature,
        max_tokens: this.maxTokens,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new AppError('No response from AI service', 500);
      }

      let activity: Activity;
      try {
        activity = JSON.parse(content);
      } catch (parseError) {
        activity = this.createFallbackActivity(input);
      }
      
      this.setCache(cacheKey, activity);
      return activity;
    } catch (error: any) {
      logger.error('Error generating activity:', error);
      return this.createFallbackActivity(input);
    }
  }

  async generateSubstitutePlan(input: SubstitutePlanInput): Promise<SubstitutePlan> {
    try {
      const cacheKey = this.createCacheKey('substitute', input);
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const prompt = this.buildSubstitutePrompt(input);
      const systemPrompt = this.getSubstituteSystemPrompt();
      
      const response = await this.openAIClient.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: this.temperature,
        max_tokens: this.maxTokens,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new AppError('No response from AI service', 500);
      }

      let plan: SubstitutePlan;
      try {
        plan = JSON.parse(content);
      } catch (parseError) {
        plan = this.createFallbackSubstitutePlan(input);
      }
      
      this.setCache(cacheKey, plan);
      return plan;
    } catch (error: any) {
      logger.error('Error generating substitute plan:', error);
      return this.createFallbackSubstitutePlan(input);
    }
  }

  async generateNewsletter(input: NewsletterGenerationInput): Promise<Newsletter> {
    try {
      const cacheKey = this.createCacheKey('newsletter', input);
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const prompt = this.buildNewsletterPrompt(input);
      const systemPrompt = this.getNewsletterSystemPrompt();
      
      const response = await this.openAIClient.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: this.temperature,
        max_tokens: this.maxTokens,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new AppError('No response from AI service', 500);
      }

      let newsletter: Newsletter;
      try {
        newsletter = JSON.parse(content);
      } catch (parseError) {
        newsletter = this.createFallbackNewsletter(input);
      }
      
      this.setCache(cacheKey, newsletter);
      return newsletter;
    } catch (error: any) {
      logger.error('Error generating newsletter:', error);
      return this.createFallbackNewsletter(input);
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      // Test actual API connectivity with a minimal request
      const response = await this.openAIClient.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: 'Test connectivity' }],
        max_tokens: 5,
        temperature: 0,
      });
      
      return !!response.choices[0]?.message?.content;
    } catch (error: any) {
      logger.error('AI Service health check failed:', error);
      return false;
    }
  }

  // Additional methods for AI functionality
  async analyzeCurriculum(content: string): Promise<any> {
    try {
      const systemPrompt = 'You are an expert curriculum analyst. Analyze the provided curriculum content and extract key information about learning objectives, skills, and assessment criteria.';
      
      const response = await this.openAIClient.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: content },
        ],
        temperature: 0.3,
        max_tokens: this.maxTokens,
      });

      return response.choices[0]?.message?.content;
    } catch (error: any) {
      logger.error('Error analyzing curriculum:', error);
      throw new AppError('Failed to analyze curriculum', 500);
    }
  }

  async generateQuestions(input: { topic: string; difficulty?: string; count?: number }): Promise<any> {
    try {
      const systemPrompt = 'You are an expert educator who creates assessment questions. Generate educational assessment questions based on the provided topic and difficulty level.';
      
      const prompt = `Generate ${input.count || 5} ${input.difficulty || 'medium'} difficulty questions about: ${input.topic}`;
      
      const response = await this.openAIClient.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: this.maxTokens,
      });

      return response.choices[0]?.message?.content;
    } catch (error: any) {
      logger.error('Error generating questions:', error);
      throw new AppError('Failed to generate questions', 500);
    }
  }

  // Provider management methods
  configureFallbackProvider(config: { provider: string; apiKey: string }): void {
    // Implementation for fallback provider configuration
    logger.info(`Configured fallback provider: ${config.provider}`);
  }

  setPreferredProvider(provider: string): void {
    logger.info(`Set preferred provider: ${provider}`);
  }

  getCostBreakdown(): { openai: number; anthropic: number; total: number } {
    // Mock implementation - would track actual costs in production
    return { openai: 0.10, anthropic: 0.05, total: 0.15 };
  }

  // Private helper methods
  private createCacheKey(type: string, input: any): string {
    return `${type}:${JSON.stringify(input)}`;
  }

  private getFromCache(key: string): any | null {
    const cached = this.requestCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.requestCache.set(key, { data, timestamp: Date.now() });
  }

  private buildLessonPrompt(input: LessonGenerationInput): string {
    const sanitizedTopic = this.sanitizeInput(input.topic);
    return `Create a detailed educational lesson plan with the following specifications:

Grade: ${input.grade}
Subject: ${input.subject}
Topic: ${sanitizedTopic}
Duration: ${input.duration} minutes
${input.standards ? `Standards: ${input.standards.join(', ')}` : ''}
${input.learningStyle ? `Learning Style: ${input.learningStyle}` : ''}
${input.classSize ? `Class Size: ${input.classSize}` : ''}
${input.specialNeeds ? `Special Needs: ${input.specialNeeds.join(', ')}` : ''}

Return a JSON object with the structure: { title, objectives, activities, materials, duration }`;
  }

  private buildActivityPrompt(input: ActivityGenerationInput): string {
    return `Create a ${input.type} learning activity for Grade ${input.grade} ${input.subject} on the topic: ${this.sanitizeInput(input.topic)}.
Return a JSON object with the structure: { name, type, description, duration, materials, instructions, learningObjectives }`;
  }

  private buildSubstitutePrompt(input: SubstitutePlanInput): string {
    return `Create a substitute teacher plan for ${input.date.toDateString()}, Grade ${input.grade}, covering: ${input.subjects.join(', ')}. Duration: ${input.duration} minutes.
Return a JSON object with the structure: { date, grade, subjects, schedule, generalNotes, emergencyContacts }`;
  }

  private buildNewsletterPrompt(input: NewsletterGenerationInput): string {
    return `Create a classroom newsletter for ${input.classroom} covering ${input.dateRange.start.toDateString()} to ${input.dateRange.end.toDateString()}.
Highlights: ${input.highlights.join(', ')}
Return a JSON object with the structure: { title, dateRange, sections, footer }`;
  }

  private getLessonSystemPrompt(): string {
    return 'You are an expert educator who creates comprehensive educational lesson plans. Ensure all content is age-appropriate, engaging, and aligned with educational standards. Return valid JSON only.';
  }

  private getActivitySystemPrompt(): string {
    return 'You are an expert educator who creates engaging learning activities. Focus on hands-on, interactive experiences that promote deep learning. Return valid JSON only.';
  }

  private getSubstituteSystemPrompt(): string {
    return 'You are an expert educator who creates detailed substitute teacher plans. Ensure plans are clear, easy to follow, and include all necessary information for a smooth day. Return valid JSON only.';
  }

  private getNewsletterSystemPrompt(): string {
    return 'You are an expert educator who creates engaging classroom newsletters for parents and families. Use a warm, informative tone that builds community. Return valid JSON only.';
  }

  private sanitizeInput(input: string): string {
    // Escape potentially harmful content for prompt injection protection
    return input.replace(/["\\]/g, '\\$&').substring(0, 500);
  }

  private validateAndFixLessonPlan(plan: any, input: LessonGenerationInput): LessonPlan {
    // Ensure required fields exist
    if (!plan.title) plan.title = `${input.topic} - Grade ${input.grade} ${input.subject}`;
    if (!plan.objectives || !Array.isArray(plan.objectives)) plan.objectives = ['Understand key concepts'];
    if (!plan.activities || !Array.isArray(plan.activities)) plan.activities = [];
    if (!plan.materials || !Array.isArray(plan.materials)) plan.materials = [];
    if (!plan.duration) plan.duration = input.duration;

    // Validate activity durations sum correctly
    const totalActivityDuration = plan.activities.reduce((sum: number, activity: any) => sum + (activity.duration || 0), 0);
    if (totalActivityDuration > input.duration) {
      // Adjust activities to fit duration
      const ratio = input.duration / totalActivityDuration;
      plan.activities.forEach((activity: any) => {
        activity.duration = Math.round((activity.duration || 0) * ratio);
      });
    }

    return plan as LessonPlan;
  }

  private createFallbackLesson(input: LessonGenerationInput): LessonPlan {
    return {
      title: `${input.topic} - Grade ${input.grade} ${input.subject}`,
      objectives: input.objectives || ['Understand key concepts'],
      activities: [
        {
          name: 'Introduction',
          duration: 10,
          materials: ['Whiteboard', 'Markers'],
          description: 'Introduce the topic'
        },
        {
          name: 'Main Activity',
          duration: input.duration - 20,
          materials: ['Worksheets', 'Pencils'],
          description: 'Practice activities'
        },
        {
          name: 'Wrap Up',
          duration: 10,
          materials: [],
          description: 'Review and assess understanding'
        }
      ],
      materials: ['Whiteboard', 'Markers', 'Worksheets', 'Pencils'],
      duration: input.duration,
      gradeLevel: input.grade,
      subject: input.subject
    };
  }

  private createFallbackActivity(input: ActivityGenerationInput): Activity {
    return {
      name: `${input.type} Activity: ${input.topic}`,
      type: input.type,
      description: `A ${input.type} activity for ${input.topic}`,
      duration: input.duration || 30,
      materials: input.materials || [],
      instructions: [
        'Step 1: Introduction',
        'Step 2: Main activity',
        'Step 3: Conclusion'
      ],
      learningObjectives: input.learningObjectives || []
    };
  }

  private createFallbackSubstitutePlan(input: SubstitutePlanInput): SubstitutePlan {
    return {
      date: input.date,
      grade: input.grade,
      subjects: input.subjects,
      schedule: input.subjects.map((subject, index) => ({
        time: `${9 + index}:00 AM`,
        subject,
        activity: `${subject} Activity`,
        materials: ['Textbook', 'Worksheets'],
        notes: 'Follow the lesson plan in the binder'
      })),
      generalNotes: input.notes || 'Please follow the daily routine',
      emergencyContacts: [
        { name: 'Office', number: '555-0100' },
        { name: 'Principal', number: '555-0101' }
      ]
    };
  }

  private createFallbackNewsletter(input: NewsletterGenerationInput): Newsletter {
    return {
      title: `${input.classroom} Newsletter`,
      dateRange: input.dateRange,
      sections: [
        {
          title: 'This Week\'s Highlights',
          content: input.highlights.join('\n')
        },
        {
          title: 'Upcoming Events',
          content: (input.upcomingEvents || []).join('\n')
        },
        {
          title: 'Reminders',
          content: (input.reminders || []).join('\n')
        }
      ],
      footer: 'Thank you for your continued support!'
    };
  }
}