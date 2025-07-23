/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * AI Activity Generator Service
 * Generates educational activities using AI
 */

import type { ExternalActivity } from '@teaching-engine/database';

import { safeJsonParse } from '../utils/type-guards.js';

export interface LessonContext {
  title?: string;
  grade?: number;
  subject?: string;
  learningGoals?: string[];
  duration?: number;
  section?: 'mindsOn' | 'action' | 'consolidation';
}

export interface SpecificRequirements {
  activityType?: string;
  materials?: string[];
  groupSize?: string;
  language?: string;
  curriculumExpectations?: string[];
}

export interface GeneratedActivity {
  title: string;
  description: string;
  detailedInstructions: string[];
  duration: number;
  activityType: string;
  materials: string[];
  groupSize: string;
  learningGoals: string[];
  assessmentSuggestions: string[];
  differentiation: {
    support: string[];
    extension: string[];
  };
  safetyConsiderations?: string[];
  technologyRequirements?: string[];
}

export interface GenerationParams {
  lessonContext?: LessonContext;
  specificRequirements?: SpecificRequirements;
  searchResults?: ExternalActivity[];
}

export class AIActivityGeneratorService {
  /**
   * Generate a single activity based on provided parameters
   */
  generateActivity(params: GenerationParams): GeneratedActivity {
    // For now, return a template-based activity
    // In a full implementation, this would call an LLM service
    return this.generateTemplateActivity(params);
  }

  /**
   * Generate multiple activity variations
   */
  async generateActivityVariations(
    params: GenerationParams,
    count = 3,
  ): Promise<GeneratedActivity[]> {
    const variations: GeneratedActivity[] = [];

    for (let i = 0; i < count; i++) {
      const variation = this.generateActivity(params);
      // Add variation suffix to make each unique
      variation.title = `${variation.title} - Variation ${i + 1}`;
      variations.push(variation);
    }

    return variations;
  }

  /**
   * Save a generated activity to the database
   */
  saveGeneratedActivity(
    activity: GeneratedActivity,
    userId: number,
    metadata?: { lessonPlanId?: string; basedOnActivities?: string[] },
  ): { id: string; activity: GeneratedActivity } {
    // In a full implementation, this would save to database
    // For now, return a mock saved activity
    const savedActivity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      activity,
      userId,
      metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return {
      id: savedActivity.id,
      activity: savedActivity.activity,
    };
  }

  // Method reserved for future LLM integration
  private _buildGenerationPrompt(params: GenerationParams): string {
    let prompt = 'Generate an engaging educational activity.\n\n';

    if (params.lessonContext) {
      const context = params.lessonContext;
      prompt += 'Lesson Context:\n';
      if (context.title && context.title !== '') {
prompt += `Title: ${context.title}\n`;
}
      if (context.grade && context.grade !== 0) {
prompt += `Grade: ${context.grade}\n`;
}
      if (context.subject && context.subject !== '') {
prompt += `Subject: ${context.subject}\n`;
}
      if (context.learningGoals && context.learningGoals.length > 0) {
prompt += `Learning Goals: ${context.learningGoals.join(', ')}\n`;
}
      if (context.duration && context.duration !== 0) {
prompt += `Duration: ${context.duration} minutes\n`;
}
      if (context.section) {
prompt += `Section: ${context.section}\n`;
}
      prompt += '\n';
    }

    if (params.specificRequirements) {
      const reqs = params.specificRequirements;
      prompt += 'Requirements:\n';
      if (reqs.activityType && reqs.activityType !== '') {
prompt += `Activity Type: ${reqs.activityType}\n`;
}
      if (reqs.materials && reqs.materials.length > 0) {
prompt += `Materials Available: ${reqs.materials.join(', ')}\n`;
}
      if (reqs.groupSize && reqs.groupSize !== '') {
prompt += `Group Size: ${reqs.groupSize}\n`;
}
      if (reqs.language && reqs.language !== '') {
prompt += `Language: ${reqs.language}\n`;
}
      if (reqs.curriculumExpectations && reqs.curriculumExpectations.length > 0) {
prompt += `Curriculum Expectations: ${reqs.curriculumExpectations.join(', ')}\n`;
}
      prompt += '\n';
    }

    if (params.searchResults && params.searchResults.length > 0) {
      prompt += 'Consider these similar activities for inspiration:\n';
      const limitedResults = params.searchResults.slice(0, 3);
      limitedResults.forEach((result) => {
        prompt += `${result.title}: ${result.description}\n`;
      });
      prompt += '\n';
    }

    prompt +=
      'Please provide a complete activity plan in JSON format with the following structure:\n';
    prompt += '{\n';
    prompt += '  "title": "string",\n';
    prompt += '  "description": "string",\n';
    prompt += '  "detailedInstructions": ["string"],\n';
    prompt += '  "duration": number,\n';
    prompt += '  "activityType": "string",\n';
    prompt += '  "materials": ["string"],\n';
    prompt += '  "groupSize": "string",\n';
    prompt += '  "learningGoals": ["string"],\n';
    prompt += '  "assessmentSuggestions": ["string"],\n';
    prompt += '  "differentiation": {\n';
    prompt += '    "support": ["string"],\n';
    prompt += '    "extension": ["string"]\n';
    prompt += '  },\n';
    prompt += '  "safetyConsiderations": ["string"],\n';
    prompt += '  "technologyRequirements": ["string"]\n';
    prompt += '}';

    return prompt;
  }

  // Method reserved for future LLM integration
  private _parseGeneratedActivity(response: string): GeneratedActivity {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = safeJsonParse(jsonMatch[0], {});

      // Ensure parsed is valid and has the expected structure
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid JSON structure in response');
      }

      // Type assertion for the parsed object
      const activity = parsed as any;

      // Validate required fields
      if (!activity.title || 
          !activity.description || 
          !activity.detailedInstructions) {
        throw new Error('Missing required fields');
      }

      // Apply defaults for missing optional fields
      return {
        title: activity.title,
        description: activity.description,
        detailedInstructions: activity.detailedInstructions ?? [],
        duration: activity.duration ?? 30,
        activityType: activity.activityType ?? 'handson',
        materials: activity.materials ?? [],
        groupSize: activity.groupSize ?? 'flexible',
        learningGoals: activity.learningGoals ?? [],
        assessmentSuggestions: activity.assessmentSuggestions ?? [],
        differentiation: {
          support: activity.differentiation?.support ?? [],
          extension: activity.differentiation?.extension ?? [],
        },
        safetyConsiderations: activity.safetyConsiderations,
        technologyRequirements: activity.technologyRequirements,
      };
    } catch (error) {
      throw new Error('Failed to parse generated activity');
    }
  }

  private generateTemplateActivity(params: GenerationParams): GeneratedActivity {
    const context = params.lessonContext ?? {};
    const reqs = params.specificRequirements ?? {};

    const grade = context.grade ?? 1;
    const subject = context.subject ?? 'Learning';
    const title = context.title ?? 'Exploration';
    const duration = context.duration ?? 30;

    return {
      title: `${subject} Activity - ${title}`,
      description: `An engaging ${subject.toLowerCase()} activity designed for Grade ${grade} students.`,
      detailedInstructions: [
        'Introduce the activity and learning goals to students',
        'Provide necessary materials and set up workspace',
        'Guide students through the main activity',
        'Facilitate discussion and reflection',
        'Assess understanding and provide feedback',
      ],
      duration,
      activityType: reqs.activityType ?? 'hands-on',
      materials: reqs.materials ?? ['paper', 'pencils', 'whiteboard'],
      groupSize: reqs.groupSize ?? 'individual or small groups',
      learningGoals: context.learningGoals ?? ['Students will explore new concepts'],
      assessmentSuggestions: [
        'Observe student participation and engagement',
        'Ask questions to check understanding',
        'Review completed work for accuracy',
      ],
      differentiation: {
        support: [
          'Provide visual aids',
          'Offer one-on-one assistance',
          'Break tasks into smaller steps',
        ],
        extension: [
          'Provide additional challenges',
          'Encourage peer teaching',
          'Offer independent research opportunities',
        ],
      },
      safetyConsiderations: [
        'Ensure proper use of materials',
        'Maintain safe classroom environment',
      ],
      technologyRequirements: [],
    };
  }

  // Method reserved for future LLM integration
  private _getSystemPrompt(): string {
    return `You are an expert elementary school teacher with extensive experience in French immersion education and the Ontario curriculum. You specialize in creating engaging, developmentally appropriate learning activities that follow ETFO best practices.

Your activities should be:
- Aligned with Ontario curriculum expectations
- Developmentally appropriate for the specified grade level
- Include clear differentiation strategies
- Provide comprehensive assessment suggestions
- Follow ETFO pedagogical best practices
- Include safety considerations when relevant

Always respond with valid JSON format only.`;
  }
}
