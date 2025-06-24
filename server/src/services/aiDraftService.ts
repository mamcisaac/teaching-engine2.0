import OpenAI from 'openai';
import { z } from 'zod';
import { config } from 'dotenv';

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

// Types
export interface CurriculumExpectation {
  code: string;
  description: string;
  type: 'overall' | 'specific';
  strand: string;
  substrand?: string;
  subject: string;
  grade: number;
}

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
  const prompt = `
You are an expert curriculum planner for Grade ${input.grade} ${input.subject}. Create a long-range plan for the ${input.academicYear} academic year using a ${input.termStructure} structure.

Based on the following curriculum expectations, design 4-6 instructional units that:
- Cover all provided expectations
- Follow logical sequence and build on each other
- Are appropriately distributed across the year
- Include meaningful big ideas for each unit

Curriculum Expectations:
${input.expectations.map(exp => `${exp.code} (${exp.type}): ${exp.description}`).join('\n')}

Return a JSON object with the following structure:
{
  "units": [
    {
      "title": "Unit Name",
      "term": "Fall|Winter|Spring|Term 1|Term 2|Term 3",
      "expectedDurationWeeks": 4,
      "bigIdeas": ["Big idea 1", "Big idea 2"],
      "linkedExpectations": [
        {"code": "S1.1", "type": "specific"},
        {"code": "O1", "type": "overall"}
      ]
    }
  ]
}

Ensure all expectations are covered across units and the sequence makes pedagogical sense.
  `;

  const client = getOpenAIClient();
  if (!client) {
    console.warn('OpenAI API key not configured - returning empty draft');
    return {
      units: []
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an expert elementary school curriculum planner following the ETFO Planning for Student Learning framework.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    const parsed = JSON.parse(content);
    return LongRangePlanDraftSchema.parse(parsed);
  } catch (error) {
    console.error('Error generating long-range plan draft:', error);
    throw new Error('Failed to generate long-range plan draft');
  }
}

export async function generateUnitPlanDraft(input: UnitPlanDraftInput) {
  const prompt = `
You are creating a detailed unit plan for Grade ${input.grade} ${input.subject}, specifically for the unit "${input.unitTitle}".

This unit should address the following curriculum expectations:
${input.expectations.map(exp => `${exp.code} (${exp.type}): ${exp.description}`).join('\n')}

${input.longRangePlanContext ? `Context from long-range plan: ${input.longRangePlanContext}` : ''}

Create a comprehensive unit plan following the ETFO framework with:
- Clear big ideas that connect to the expectations
- Essential questions that drive inquiry
- Specific learning goals for students
- Success criteria students can understand
- Assessment strategies for For/As/Of learning
- Cross-curricular connections where appropriate
- Realistic timeline estimate

Return a JSON object with this structure:
{
  "title": "Unit Title",
  "bigIdeas": ["Big idea 1", "Big idea 2"],
  "essentialQuestions": ["Question 1", "Question 2"],
  "learningGoals": ["Goal 1", "Goal 2"],
  "successCriteria": ["Criteria 1", "Criteria 2"],
  "assessmentFor": ["Diagnostic strategy 1"],
  "assessmentAs": ["Formative strategy 1"],
  "assessmentOf": ["Summative strategy 1"],
  "crossCurricularLinks": ["Connection 1"],
  "timelineEstimateWeeks": 3
}

Focus on Grade ${input.grade} appropriate language and activities.
  `;

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
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an expert elementary school teacher and curriculum designer following ETFO best practices.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    const parsed = JSON.parse(content);
    return UnitPlanDraftSchema.parse(parsed);
  } catch (error) {
    console.error('Error generating unit plan draft:', error);
    throw new Error('Failed to generate unit plan draft');
  }
}

export async function generateLessonPlanDraft(input: LessonPlanDraftInput) {
  const prompt = `
Create a detailed lesson plan for Grade ${input.grade} ${input.subject} as part of the unit "${input.unitTitle}".

This ${input.duration}-minute lesson should address:
${input.expectations.map(exp => `${exp.code}: ${exp.description}`).join('\n')}

${input.unitContext ? `Unit context: ${input.unitContext}` : ''}
${input.lessonNumber ? `This is lesson ${input.lessonNumber} in the unit.` : ''}

Use the ETFO three-part lesson structure:
- Minds On (engage students, activate prior knowledge)
- Action (main learning activities, student exploration)
- Consolidation (reflect on learning, make connections)

Return a JSON object with this structure:
{
  "title": "Lesson Title",
  "learningGoals": ["Goal 1", "Goal 2"],
  "successCriteria": ["I can...", "I can..."],
  "mindsOnDescription": "Opening activity description",
  "mindsOnDuration": 10,
  "actionDescription": "Main activity description",
  "actionDuration": 25,
  "consolidationDescription": "Closing activity description", 
  "consolidationDuration": 10,
  "resources": ["Resource 1", "Resource 2"],
  "accommodations": "Specific accommodations for diverse learners",
  "assessmentStrategy": "How learning will be assessed"
}

Ensure activities are age-appropriate and engaging for Grade ${input.grade} students.
  `;

  const client = getOpenAIClient();
  if (!client) {
    console.warn('OpenAI API key not configured - returning empty draft');
    return {
      title: input.unitTitle || 'Generated Lesson Plan',
      learningGoals: [],
      successCriteria: [],
      mindsOnDescription: '',
      mindsOnMaterials: [],
      mindsOnTimeMinutes: 0,
      actionDescription: '',
      actionMaterials: [],
      actionTimeMinutes: 0,
      consolidationDescription: '',
      consolidationMaterials: [],
      consolidationTimeMinutes: 0,
      accommodations: [],
      extensions: [],
      assessmentStrategies: []
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an experienced elementary school teacher creating engaging, age-appropriate lessons following ETFO guidelines.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    const parsed = JSON.parse(content);
    return LessonPlanDraftSchema.parse(parsed);
  } catch (error) {
    console.error('Error generating lesson plan draft:', error);
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