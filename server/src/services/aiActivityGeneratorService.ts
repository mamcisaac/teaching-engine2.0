import { ExternalActivity } from '@teaching-engine/database';
import { prisma } from '../prisma';
import { AnthropicService } from './anthropicService';
import { SearchParams } from './activityDiscoveryService';

interface GenerateActivityParams {
  searchResults?: ExternalActivity[];
  lessonContext?: {
    title: string;
    grade: number;
    subject: string;
    learningGoals: string[];
    duration: number;
    section?: 'mindsOn' | 'action' | 'consolidation';
  };
  specificRequirements?: {
    activityType?: string;
    materials?: string[];
    groupSize?: string;
    language?: string;
    curriculumExpectations?: string[];
  };
}

interface GeneratedActivity {
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

export class AIActivityGeneratorService {
  private anthropic: AnthropicService;

  constructor() {
    this.anthropic = new AnthropicService();
  }

  /**
   * Generate an AI-powered activity based on search results and lesson context
   */
  async generateActivity(params: GenerateActivityParams): Promise<GeneratedActivity> {
    const prompt = this.buildGenerationPrompt(params);
    
    try {
      const response = await this.anthropic.generateCompletion({
        prompt,
        systemPrompt: this.getSystemPrompt(),
        maxTokens: 2000,
        temperature: 0.8
      });

      return this.parseGeneratedActivity(response);
    } catch (error) {
      console.error('Error generating activity:', error);
      throw new Error('Failed to generate activity');
    }
  }

  /**
   * Generate multiple activity variations
   */
  async generateActivityVariations(
    params: GenerateActivityParams, 
    count: number = 3
  ): Promise<GeneratedActivity[]> {
    const variations: GeneratedActivity[] = [];
    
    for (let i = 0; i < count; i++) {
      const activity = await this.generateActivity({
        ...params,
        specificRequirements: {
          ...params.specificRequirements,
          // Add variation hints
          activityType: i === 0 ? 'handson' : i === 1 ? 'game' : 'collaborative'
        }
      });
      variations.push(activity);
    }
    
    return variations;
  }

  /**
   * Enhance an existing activity with AI suggestions
   */
  async enhanceActivity(
    activity: ExternalActivity,
    enhancements: {
      addDifferentiation?: boolean;
      addAssessment?: boolean;
      adaptForGrade?: number;
      translateTo?: string;
      alignToCurriculum?: string[];
    }
  ): Promise<Partial<GeneratedActivity>> {
    const prompt = this.buildEnhancementPrompt(activity, enhancements);
    
    try {
      const response = await this.anthropic.generateCompletion({
        prompt,
        systemPrompt: this.getSystemPrompt(),
        maxTokens: 1500,
        temperature: 0.7
      });

      return this.parseEnhancement(response);
    } catch (error) {
      console.error('Error enhancing activity:', error);
      throw new Error('Failed to enhance activity');
    }
  }

  private buildGenerationPrompt(params: GenerateActivityParams): string {
    let prompt = 'Generate an engaging educational activity with the following requirements:\n\n';
    
    if (params.lessonContext) {
      prompt += `Lesson Context:
- Title: ${params.lessonContext.title}
- Grade: ${params.lessonContext.grade}
- Subject: ${params.lessonContext.subject}
- Learning Goals: ${params.lessonContext.learningGoals.join(', ')}
- Duration: ${params.lessonContext.duration} minutes
- Section: ${params.lessonContext.section || 'main activity'}\n\n`;
    }
    
    if (params.specificRequirements) {
      prompt += `Specific Requirements:
- Activity Type: ${params.specificRequirements.activityType || 'any'}
- Materials Available: ${params.specificRequirements.materials?.join(', ') || 'standard classroom materials'}
- Group Size: ${params.specificRequirements.groupSize || 'flexible'}
- Language: ${params.specificRequirements.language || 'fr'}
- Curriculum Expectations: ${params.specificRequirements.curriculumExpectations?.join(', ') || 'Ontario curriculum'}\n\n`;
    }
    
    if (params.searchResults && params.searchResults.length > 0) {
      prompt += `Consider these similar activities for inspiration:
${params.searchResults.slice(0, 3).map(a => `- ${a.title}: ${a.description}`).join('\n')}\n\n`;
    }
    
    prompt += `Please provide a complete activity plan in JSON format with the following structure:
{
  "title": "Activity title in French",
  "description": "Brief description",
  "detailedInstructions": ["Step 1...", "Step 2...", ...],
  "duration": number in minutes,
  "activityType": "handson|game|worksheet|experiment|project|etc",
  "materials": ["material 1", "material 2", ...],
  "groupSize": "individual|pairs|small group|whole class",
  "learningGoals": ["goal 1", "goal 2", ...],
  "assessmentSuggestions": ["suggestion 1", "suggestion 2", ...],
  "differentiation": {
    "support": ["support strategy 1", ...],
    "extension": ["extension activity 1", ...]
  },
  "safetyConsiderations": ["if applicable"],
  "technologyRequirements": ["if applicable"]
}`;
    
    return prompt;
  }

  private buildEnhancementPrompt(
    activity: ExternalActivity,
    enhancements: any
  ): string {
    let prompt = `Enhance the following activity:\n
Title: ${activity.title}
Description: ${activity.description}
Grade: ${activity.gradeMin}-${activity.gradeMax}
Subject: ${activity.subject}
Duration: ${activity.duration} minutes\n\n`;
    
    prompt += 'Please provide the following enhancements:\n';
    
    if (enhancements.addDifferentiation) {
      prompt += '- Differentiation strategies for diverse learners\n';
    }
    
    if (enhancements.addAssessment) {
      prompt += '- Assessment strategies and success criteria\n';
    }
    
    if (enhancements.adaptForGrade) {
      prompt += `- Adaptations for grade ${enhancements.adaptForGrade}\n`;
    }
    
    if (enhancements.translateTo) {
      prompt += `- Translation to ${enhancements.translateTo}\n`;
    }
    
    if (enhancements.alignToCurriculum) {
      prompt += `- Alignment with curriculum expectations: ${enhancements.alignToCurriculum.join(', ')}\n`;
    }
    
    prompt += '\nProvide the enhancements in JSON format.';
    
    return prompt;
  }

  private getSystemPrompt(): string {
    return `You are an expert elementary school teacher specializing in creating engaging, curriculum-aligned activities for French immersion classrooms in Ontario. 

Your activities should:
1. Be developmentally appropriate and engaging for the specified grade level
2. Align with Ontario curriculum expectations
3. Include clear, step-by-step instructions in French
4. Consider classroom management and safety
5. Provide differentiation for diverse learners
6. Include formative assessment opportunities
7. Be practical with commonly available materials
8. Follow ETFO best practices for lesson planning

Always respond with valid JSON that matches the requested format exactly.`;
  }

  private parseGeneratedActivity(response: string): GeneratedActivity {
    try {
      // Extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (!parsed.title || !parsed.description || !parsed.detailedInstructions) {
        throw new Error('Missing required fields in generated activity');
      }
      
      return {
        title: parsed.title,
        description: parsed.description,
        detailedInstructions: parsed.detailedInstructions || [],
        duration: parsed.duration || 30,
        activityType: parsed.activityType || 'handson',
        materials: parsed.materials || [],
        groupSize: parsed.groupSize || 'flexible',
        learningGoals: parsed.learningGoals || [],
        assessmentSuggestions: parsed.assessmentSuggestions || [],
        differentiation: {
          support: parsed.differentiation?.support || [],
          extension: parsed.differentiation?.extension || []
        },
        safetyConsiderations: parsed.safetyConsiderations,
        technologyRequirements: parsed.technologyRequirements
      };
    } catch (error) {
      console.error('Error parsing generated activity:', error);
      throw new Error('Failed to parse generated activity');
    }
  }

  private parseEnhancement(response: string): Partial<GeneratedActivity> {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error parsing enhancement:', error);
      throw new Error('Failed to parse enhancement');
    }
  }

  /**
   * Save a generated activity as an external activity
   */
  async saveGeneratedActivity(
    activity: GeneratedActivity,
    userId: number,
    metadata?: {
      lessonPlanId?: string;
      basedOnActivities?: string[];
    }
  ): Promise<ExternalActivity> {
    const externalActivity = await prisma.externalActivity.create({
      data: {
        source: 'ai_generated',
        externalId: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url: '#', // AI generated activities don't have external URLs
        title: activity.title,
        description: activity.description,
        duration: activity.duration,
        activityType: activity.activityType,
        gradeMin: 1, // Default, should be passed in context
        gradeMax: 8, // Default, should be passed in context
        subject: 'General', // Default, should be passed in context
        language: 'fr',
        materials: activity.materials,
        groupSize: activity.groupSize,
        learningGoals: activity.learningGoals,
        metadata: {
          detailedInstructions: activity.detailedInstructions,
          assessmentSuggestions: activity.assessmentSuggestions,
          differentiation: activity.differentiation,
          safetyConsiderations: activity.safetyConsiderations,
          technologyRequirements: activity.technologyRequirements,
          generatedBy: userId,
          generatedAt: new Date(),
          basedOnActivities: metadata?.basedOnActivities
        },
        isFree: true,
        isActive: true
      }
    });

    // Auto-import for the user who generated it
    if (metadata?.lessonPlanId) {
      await prisma.activityImport.create({
        data: {
          userId,
          activityId: externalActivity.id,
          lessonPlanId: parseInt(metadata.lessonPlanId)
        }
      });
    }

    return externalActivity;
  }
}