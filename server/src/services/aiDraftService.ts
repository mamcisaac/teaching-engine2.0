import OpenAI from 'openai';
import { z } from 'zod';
import { config } from 'dotenv';
import { aiPromptTemplateService, PromptContext, CurriculumExpectation } from './aiPromptTemplateService';

// Load environment variables
config();

// Lazy initialization of OpenAI client
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

// Response schemas for validation
const LongRangePlanDraftSchema = z.object({
  units: z.array(z.object({
    title: z.string(),
    term: z.string(),
    expectedDurationWeeks: z.number(),
    bigIdeas: z.array(z.string()),
    linkedExpectations: z.array(z.object({
      code: z.string(),
      type: z.enum(['overall', 'specific']),
    })),
  })),
});

const UnitPlanDraftSchema = z.object({
  title: z.string(),
  bigIdeas: z.array(z.string()),
  essentialQuestions: z.array(z.string()),
  learningGoals: z.array(z.string()),
  successCriteria: z.array(z.string()),
  assessmentFor: z.array(z.string()),
  assessmentAs: z.array(z.string()),
  assessmentOf: z.array(z.string()),
  crossCurricularLinks: z.array(z.string()),
  timelineEstimateWeeks: z.number(),
});

const LessonPlanDraftSchema = z.object({
  title: z.string(),
  learningGoals: z.array(z.string()),
  successCriteria: z.array(z.string()),
  mindsOnDescription: z.string(),
  mindsOnDuration: z.number(),
  actionDescription: z.string(),
  actionDuration: z.number(),
  consolidationDescription: z.string(),
  consolidationDuration: z.number(),
  resources: z.array(z.string()),
  accommodations: z.string(),
  assessmentStrategy: z.string(),
});

const DaybookDraftSchema = z.object({
  weeklyBigIdeas: z.array(z.string()),
  dailyReflectionPrompts: z.array(z.string()),
  substituteNotes: z.string(),
  weeklyInsights: z.string(),
});

// Re-export types from prompt template service for compatibility
export type { CurriculumExpectation, PromptContext } from './aiPromptTemplateService';

export interface LongRangePlanDraftInput {
  expectations: CurriculumExpectation[];
  subject: string;
  grade: number;
  academicYear: string;
  termStructure: 'semester' | 'trimester' | 'quarterly';
}

export interface UnitPlanDraftInput {
  unitTitle: string;
  subject: string;
  grade: number;
  expectations: CurriculumExpectation[];
  longRangePlanContext?: string;
}

export interface LessonPlanDraftInput {
  unitTitle: string;
  subject: string;
  grade: number;
  expectations: CurriculumExpectation[];
  unitContext?: string;
  duration: number;
  lessonNumber?: number;
}

export interface DaybookDraftInput {
  lessons: Array<{
    title: string;
    subject: string;
    duration: number;
    learningGoals: string[];
  }>;
  weekStartDate: string;
  specialEvents?: string[];
}

// AI Draft Generation Functions

export async function generateLongRangePlanDraft(input: LongRangePlanDraftInput) {
  const client = getOpenAIClient();
  if (!client) {
    console.warn('OpenAI API key not configured - returning empty draft');
    return {
      units: []
    };
  }

  try {
    // Use the new prompt template service
    const promptContext: PromptContext = {
      grade: input.grade,
      subject: input.subject,
      academicYear: input.academicYear,
      term: input.termStructure
    };

    const { prompt, systemPrompt, temperature } = aiPromptTemplateService.generateLongRangePlanPrompt(
      promptContext,
      input.expectations
    );

    const response = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    const parsed = JSON.parse(content);
    const result = LongRangePlanDraftSchema.parse(parsed);
    
    // Record successful usage
    aiPromptTemplateService.recordPromptUsage('lrp-v2.0', true);
    
    return result;
  } catch (error) {
    console.error('Error generating long-range plan draft:', error);
    aiPromptTemplateService.recordPromptUsage('lrp-v2.0', false, error instanceof Error ? error.message : 'Unknown error');
    throw new Error('Failed to generate long-range plan draft');
  }
}

export async function generateUnitPlanDraft(input: UnitPlanDraftInput) {
  const client = getOpenAIClient();
  if (!client) {
    console.warn('OpenAI API key not configured - returning empty draft');
    return {
      title: input.unitTitle || 'Generated Unit Plan',
      bigIdeas: [],
      essentialQuestions: [],
      learningGoals: [],
      successCriteria: [],
      assessmentFor: [],
      assessmentAs: [],
      assessmentOf: [],
      crossCurricularLinks: [],
      timelineEstimateWeeks: 0
    };
  }

  try {
    // Use the new prompt template service
    const promptContext: PromptContext = {
      grade: input.grade,
      subject: input.subject
    };

    const { prompt, systemPrompt, temperature } = aiPromptTemplateService.generateUnitPlanPrompt(
      promptContext,
      input.unitTitle,
      input.expectations,
      3, // default 3 weeks
      input.longRangePlanContext
    );

    const response = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    const parsed = JSON.parse(content);
    const result = UnitPlanDraftSchema.parse(parsed);
    
    // Record successful usage
    aiPromptTemplateService.recordPromptUsage('up-v2.0', true);
    
    return result;
  } catch (error) {
    console.error('Error generating unit plan draft:', error);
    aiPromptTemplateService.recordPromptUsage('up-v2.0', false, error instanceof Error ? error.message : 'Unknown error');
    throw new Error('Failed to generate unit plan draft');
  }
}

export async function generateLessonPlanDraft(input: LessonPlanDraftInput) {
  const client = getOpenAIClient();
  if (!client) {
    console.warn('OpenAI API key not configured - returning empty draft');
    return {
      title: input.unitTitle || 'Generated Lesson Plan',
      learningGoals: [],
      successCriteria: [],
      mindsOnDescription: '',
      mindsOnDuration: 0,
      actionDescription: '',
      actionDuration: 0,
      consolidationDescription: '',
      consolidationDuration: 0,
      resources: [],
      accommodations: '',
      assessmentStrategy: ''
    };
  }

  try {
    // Use the new prompt template service
    const promptContext: PromptContext = {
      grade: input.grade,
      subject: input.subject
    };

    const { prompt, systemPrompt, temperature } = aiPromptTemplateService.generateLessonPlanPrompt(
      promptContext,
      input.unitTitle,
      input.expectations,
      input.duration,
      input.unitContext,
      input.lessonNumber
    );

    const response = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    const parsed = JSON.parse(content);
    const result = LessonPlanDraftSchema.parse(parsed);
    
    // Record successful usage
    aiPromptTemplateService.recordPromptUsage('lp-v2.0', true);
    
    return result;
  } catch (error) {
    console.error('Error generating lesson plan draft:', error);
    aiPromptTemplateService.recordPromptUsage('lp-v2.0', false, error instanceof Error ? error.message : 'Unknown error');
    throw new Error('Failed to generate lesson plan draft');
  }
}

export async function generateDaybookDraft(input: DaybookDraftInput) {
  const prompt = `
Create a weekly daybook summary and substitute plan for the week starting ${input.weekStartDate}.

Scheduled lessons:
${input.lessons.map(lesson => 
  `- ${lesson.title} (${lesson.subject}, ${lesson.duration} min): ${lesson.learningGoals.join(', ')}`
).join('\n')}

${input.specialEvents ? `Special events this week: ${input.specialEvents.join(', ')}` : ''}

Generate:
- Weekly big ideas that connect the lessons
- Daily reflection prompts for the teacher
- Clear substitute teacher notes
- Weekly insights for planning ahead

Return a JSON object with this structure:
{
  "weeklyBigIdeas": ["Big idea connecting the week's learning"],
  "dailyReflectionPrompts": ["What went well?", "What challenges arose?"],
  "substituteNotes": "Clear, step-by-step instructions for a substitute teacher",
  "weeklyInsights": "Observations and suggestions for next week"
}

Focus on practical, actionable content that supports both teaching and reflection.
  `;

  const client = getOpenAIClient();
  if (!client) {
    console.warn('OpenAI API key not configured - returning empty draft');
    return {
      weeklyBigIdeas: [],
      dailyReflectionPrompts: [],
      substituteNotes: '',
      weeklyInsights: ''
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a supportive mentor teacher helping with weekly planning and reflection.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    const parsed = JSON.parse(content);
    return DaybookDraftSchema.parse(parsed);
  } catch (error) {
    console.error('Error generating daybook draft:', error);
    throw new Error('Failed to generate daybook draft');
  }
}

// Helper function to generate suggestions for existing content
export async function generatePlanSuggestions(
  type: 'long-range' | 'unit' | 'lesson' | 'daybook',
  existingContent: string,
  context?: string
) {
  const prompt = `
As an expert educator, provide 3-5 specific suggestions to improve this ${type} plan:

Current content:
${existingContent}

${context ? `Additional context: ${context}` : ''}

Focus on:
- Alignment with curriculum expectations
- Age-appropriate activities and language
- Assessment strategies
- Engagement and differentiation
- ETFO best practices

Provide practical, actionable suggestions.
  `;

  const client = getOpenAIClient();
  if (!client) {
    console.warn('OpenAI API key not configured - returning empty suggestions');
    return [];
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an experienced teacher mentor providing constructive feedback on lesson plans.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating plan suggestions:', error);
    throw new Error('Failed to generate suggestions');
  }
}