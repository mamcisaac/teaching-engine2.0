import BaseService from './base/BaseService';
import OpenAI from 'openai';
import { prisma } from '../prisma';

export interface PlanningContext {
  level: 'long-range' | 'unit' | 'lesson' | 'daybook';
  subject?: string;
  grade?: number;
  curriculumExpectations?: string[];
  previousContent?: Record<string, unknown>;
}

export interface AISuggestion {
  type: 'goals' | 'bigIdeas' | 'activities' | 'materials' | 'assessments' | 'reflections';
  suggestions: string[];
  rationale?: string;
}

export class AIPlanningAssistantService extends BaseService {
  private openai: OpenAI | null = null;

  constructor() {
    super('AIPlanningAssistantService');
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    } else {
      this.logger.warn('OpenAI API key not found - AI planning assistance will be disabled');
    }
  }

  /**
   * Generate suggestions for long-range plan goals
   */
  async generateLongRangeGoals(context: {
    subject: string;
    grade: number;
    termLength: number;
    focusAreas?: string[];
  }): Promise<AISuggestion> {
    if (!this.openai) {
      return { type: 'goals', suggestions: [] };
    }

    try {
      const prompt = `You are an experienced elementary teacher creating long-range plans for Grade ${context.grade} ${context.subject}.

The term is ${context.termLength} weeks long.
${context.focusAreas ? `Focus areas: ${context.focusAreas.join(', ')}` : ''}

Generate 3-5 SMART goals for this term that:
1. Are specific, measurable, achievable, relevant, and time-bound
2. Align with elementary curriculum expectations
3. Consider developmental appropriateness for Grade ${context.grade}
4. Support student growth and engagement

Return ONLY a JSON object with this structure:
{
  "suggestions": [
    "Goal 1 text",
    "Goal 2 text",
    "Goal 3 text"
  ],
  "rationale": "Brief explanation of why these goals are appropriate"
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an expert elementary education curriculum planner.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      const parsed = JSON.parse(content);
      return {
        type: 'goals',
        suggestions: parsed.suggestions || [],
        rationale: parsed.rationale,
      };
    } catch (error) {
      this.logger.error({ error }, 'Failed to generate long-range goals');
      return { type: 'goals', suggestions: [] };
    }
  }

  /**
   * Generate big ideas for unit plans
   */
  async generateUnitBigIdeas(context: {
    unitTitle: string;
    subject: string;
    grade: number;
    curriculumExpectations: string[];
    duration: number;
  }): Promise<AISuggestion> {
    if (!this.openai) {
      return { type: 'bigIdeas', suggestions: [] };
    }

    try {
      const prompt = `You are creating a unit plan for Grade ${context.grade} ${context.subject}.

Unit: ${context.unitTitle}
Duration: ${context.duration} weeks
Curriculum expectations to address:
${context.curriculumExpectations.join('\n')}

Generate 3-4 "Big Ideas" that:
1. Are conceptual understandings students should develop
2. Connect multiple curriculum expectations
3. Are expressed in student-friendly language
4. Promote deep thinking and transfer of learning

Return ONLY a JSON object with this structure:
{
  "suggestions": [
    "Big idea 1",
    "Big idea 2",
    "Big idea 3"
  ],
  "rationale": "Brief explanation of how these connect to the curriculum"
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in Understanding by Design and elementary education.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      const parsed = JSON.parse(content);
      return {
        type: 'bigIdeas',
        suggestions: parsed.suggestions || [],
        rationale: parsed.rationale,
      };
    } catch (error) {
      this.logger.error({ error }, 'Failed to generate unit big ideas');
      return { type: 'bigIdeas', suggestions: [] };
    }
  }

  /**
   * Generate lesson activities based on learning goals
   */
  async generateLessonActivities(context: {
    lessonTitle: string;
    learningGoals: string[];
    subject: string;
    grade: number;
    duration: number;
    materials?: string[];
  }): Promise<AISuggestion> {
    if (!this.openai) {
      return { type: 'activities', suggestions: [] };
    }

    try {
      const prompt = `You are planning a ${context.duration}-minute lesson for Grade ${context.grade} ${context.subject}.

Lesson: ${context.lessonTitle}
Learning Goals:
${context.learningGoals.join('\n')}
${context.materials ? `Available materials: ${context.materials.join(', ')}` : ''}

Generate a sequence of 4-6 engaging activities that:
1. Progress from introduction to practice to consolidation
2. Include a variety of learning modalities (visual, auditory, kinesthetic)
3. Promote student engagement and participation
4. Can realistically fit within ${context.duration} minutes
5. Are developmentally appropriate for Grade ${context.grade}

Return ONLY a JSON object with this structure:
{
  "suggestions": [
    "Activity 1: Brief description (X minutes)",
    "Activity 2: Brief description (X minutes)",
    "Activity 3: Brief description (X minutes)"
  ],
  "rationale": "Brief explanation of the activity sequence"
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an experienced elementary teacher skilled in lesson planning.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 1200,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      const parsed = JSON.parse(content);
      return {
        type: 'activities',
        suggestions: parsed.suggestions || [],
        rationale: parsed.rationale,
      };
    } catch (error) {
      this.logger.error({ error }, 'Failed to generate lesson activities');
      return { type: 'activities', suggestions: [] };
    }
  }

  /**
   * Generate materials list for lessons
   */
  async generateMaterialsList(context: {
    activities: string[];
    subject: string;
    grade: number;
    classSize: number;
  }): Promise<AISuggestion> {
    if (!this.openai) {
      return { type: 'materials', suggestions: [] };
    }

    try {
      const prompt = `Based on these Grade ${context.grade} ${context.subject} activities for a class of ${context.classSize} students:

${context.activities.join('\n')}

Generate a comprehensive materials list that includes:
1. Essential materials needed for each activity
2. Quantities appropriate for ${context.classSize} students
3. Common classroom supplies and specialized items separately
4. Any prep materials for the teacher

Return ONLY a JSON object with this structure:
{
  "suggestions": [
    "Chart paper (2 sheets)",
    "Markers (1 set per group of 4)",
    "Base-10 blocks (1 set per pair)"
  ],
  "rationale": "Brief note about material choices"
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a practical elementary teacher who knows classroom management.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.6,
        max_tokens: 800,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      const parsed = JSON.parse(content);
      return {
        type: 'materials',
        suggestions: parsed.suggestions || [],
        rationale: parsed.rationale,
      };
    } catch (error) {
      this.logger.error({ error }, 'Failed to generate materials list');
      return { type: 'materials', suggestions: [] };
    }
  }

  /**
   * Generate assessment strategies
   */
  async generateAssessmentStrategies(context: {
    learningGoals: string[];
    activities: string[];
    subject: string;
    grade: number;
  }): Promise<AISuggestion> {
    if (!this.openai) {
      return { type: 'assessments', suggestions: [] };
    }

    try {
      const prompt = `For a Grade ${context.grade} ${context.subject} lesson with these learning goals:

${context.learningGoals.join('\n')}

And these activities:
${context.activities.join('\n')}

Generate 3-5 assessment strategies that:
1. Include both formative and summative assessments
2. Use a variety of assessment methods (observation, conversation, product)
3. Are manageable for the teacher
4. Provide meaningful feedback to students
5. Align with the learning goals

Return ONLY a JSON object with this structure:
{
  "suggestions": [
    "Exit ticket: Students draw and label...",
    "Observation checklist for group work focusing on...",
    "Student self-assessment using thumbs up/down for..."
  ],
  "rationale": "Brief explanation of assessment choices"
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in educational assessment and elementary teaching.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      const parsed = JSON.parse(content);
      return {
        type: 'assessments',
        suggestions: parsed.suggestions || [],
        rationale: parsed.rationale,
      };
    } catch (error) {
      this.logger.error({ error }, 'Failed to generate assessment strategies');
      return { type: 'assessments', suggestions: [] };
    }
  }

  /**
   * Generate reflection prompts for daybook entries
   */
  async generateReflectionPrompts(context: {
    date: Date;
    activities: string[];
    subject: string;
    grade: number;
    previousReflections?: string[];
  }): Promise<AISuggestion> {
    if (!this.openai) {
      return { type: 'reflections', suggestions: [] };
    }

    try {
      const prompt = `You are reflecting on today's Grade ${context.grade} ${context.subject} lessons.

Today's activities:
${context.activities.join('\n')}

${context.previousReflections ? `Recent reflection themes:\n${context.previousReflections.slice(0, 3).join('\n')}` : ''}

Generate 4-5 reflection prompts that:
1. Focus on student learning and engagement
2. Consider what worked well and challenges faced
3. Think about next steps and adjustments
4. Are specific enough to generate meaningful insights
5. Vary in focus (student progress, teaching strategies, classroom management, etc.)

Return ONLY a JSON object with this structure:
{
  "suggestions": [
    "How did students demonstrate understanding of... today?",
    "What adjustments could improve the... activity?",
    "Which students need additional support with...?"
  ],
  "rationale": "Brief note about reflection focus"
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a reflective practitioner in elementary education.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      const parsed = JSON.parse(content);
      return {
        type: 'reflections',
        suggestions: parsed.suggestions || [],
        rationale: parsed.rationale,
      };
    } catch (error) {
      this.logger.error({ error }, 'Failed to generate reflection prompts');
      return { type: 'reflections', suggestions: [] };
    }
  }

  /**
   * Get curriculum-aligned suggestions based on selected expectations
   */
  async getCurriculumAlignedSuggestions(
    expectationIds: string[],
    suggestionType: 'activities' | 'assessments' | 'resources',
  ): Promise<string[]> {
    if (!this.openai || expectationIds.length === 0) {
      return [];
    }

    try {
      // Fetch the actual expectations
      const expectations = await prisma.curriculumExpectation.findMany({
        where: { id: { in: expectationIds } },
      });

      if (expectations.length === 0) {
        return [];
      }

      const expectationTexts = expectations.map((e) => `${e.code}: ${e.description}`);

      const typePrompts = {
        activities: 'learning activities that directly address',
        assessments: 'assessment strategies to evaluate student achievement of',
        resources: 'teaching resources and materials to support',
      };

      const prompt = `For these curriculum expectations:
${expectationTexts.join('\n')}

Suggest 3-5 ${typePrompts[suggestionType]} these expectations.
Be specific and practical for elementary teachers.

Return ONLY a JSON array of strings:
["Suggestion 1", "Suggestion 2", "Suggestion 3"]`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an elementary curriculum expert.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 600,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return [];
      }

      const suggestions = JSON.parse(content);
      return Array.isArray(suggestions) ? suggestions : [];
    } catch (error) {
      this.logger.error({ error }, 'Failed to get curriculum-aligned suggestions');
      return [];
    }
  }
}

export const aiPlanningAssistant = new AIPlanningAssistantService();
