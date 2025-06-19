import OpenAI from 'openai';
import logger from '../logger';
import type {
  Outcome,
  Activity,
  AssessmentResult,
  StudentAssessmentResult,
  StudentArtifact,
  StudentReflection,
} from '@teaching-engine/database';

let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

interface StudentData {
  studentName: string;
  grade: number;
  activities: Array<Activity & { outcomes: Array<{ outcome: Outcome }> }>;
  assessments: Array<{
    studentResult: StudentAssessmentResult;
    assessment: AssessmentResult & {
      template: { title: string; type: string; outcomeIds: string };
    };
  }>;
  artifacts: StudentArtifact[];
  reflections: Array<StudentReflection & { activity: Activity | null }>;
}

interface GenerateSummaryParams {
  studentData: StudentData;
  dateFrom: Date;
  dateTo: Date;
  focus?: string[];
}

const formatDateRange = (from: Date, to: Date): { fr: string; en: string } => {
  const optionsFr: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
  const optionsEn: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };

  const fromFr = from.toLocaleDateString('fr-CA', optionsFr);
  const toFr = to.toLocaleDateString('fr-CA', optionsFr);
  const fromEn = from.toLocaleDateString('en-CA', optionsEn);
  const toEn = to.toLocaleDateString('en-CA', optionsEn);

  return {
    fr: `${fromFr} à ${toFr}`,
    en: `${fromEn} to ${toEn}`,
  };
};

const prepareStudentContext = (params: GenerateSummaryParams): string => {
  const { studentData, dateFrom, dateTo, focus } = params;
  const dateRange = formatDateRange(dateFrom, dateTo);

  // Group outcomes by subject
  const outcomesBySubject = new Map<string, Set<string>>();
  studentData.activities.forEach((activity) => {
    activity.outcomes.forEach(({ outcome }) => {
      if (!outcomesBySubject.has(outcome.subject)) {
        outcomesBySubject.set(outcome.subject, new Set());
      }
      outcomesBySubject.get(outcome.subject)!.add(outcome.description);
    });
  });

  // Format assessment results
  const assessmentSummary = studentData.assessments
    .map(({ studentResult, assessment }) => {
      const score = studentResult.score !== null ? `${studentResult.score}%` : 'not scored';
      return `- ${assessment.template.title} (${assessment.template.type}): ${score}`;
    })
    .join('\n');

  // Format outcomes by subject
  const outcomeSummary = Array.from(outcomesBySubject.entries())
    .map(([subject, outcomes]) => {
      const outcomeList = Array.from(outcomes).slice(0, 5).join('; ');
      return `${subject}: ${outcomeList}`;
    })
    .join('\n');

  // Include artifacts and reflections count
  const artifactCount = studentData.artifacts.length;
  const reflectionCount = studentData.reflections.length;

  const context = `
Student: ${studentData.studentName}, Grade ${studentData.grade}
Period: ${dateRange.en}
${focus?.length ? `Focus areas: ${focus.join(', ')}` : ''}

Activities completed: ${studentData.activities.length}
${artifactCount > 0 ? `Artifacts created: ${artifactCount}` : ''}
${reflectionCount > 0 ? `Reflections recorded: ${reflectionCount}` : ''}

Learning outcomes addressed:
${outcomeSummary}

${assessmentSummary ? 'Assessment results:\n' + assessmentSummary : 'No formal assessments during this period'}

${studentData.reflections.length > 0 ? 'Sample reflection: ' + studentData.reflections[0].content.slice(0, 100) + '...' : ''}
`;

  return context;
};

export async function generateParentSummary(
  params: GenerateSummaryParams,
): Promise<{ french: string; english: string }> {
  const fallbackResponse = {
    french: `Pendant cette période, ${params.studentData.studentName} a participé à diverses activités d'apprentissage. Des progrès ont été observés dans plusieurs domaines.`,
    english: `During this period, ${params.studentData.studentName} participated in various learning activities. Progress was observed in several areas.`,
  };

  if (!openai || !process.env.ENABLE_LLM) {
    return fallbackResponse;
  }

  try {
    const context = prepareStudentContext(params);
    const systemPrompt = `You are a helpful elementary school teacher writing progress summaries for parents. Write warm, encouraging, and specific summaries that:
- Highlight the student's achievements and growth
- Reference specific learning outcomes in plain language
- Mention areas of strength and areas for continued growth
- Use a professional but friendly tone
- Are approximately 3-5 sentences long
- Avoid educational jargon
- Never imply formal grades unless explicitly mentioned in assessments`;

    const userPrompt = `Based on the following student data, write a progress summary in both French and English.
${params.focus?.length ? `Focus particularly on: ${params.focus.join(', ')}` : ''}

${context}

Format your response as:
FRENCH:
[French summary]

ENGLISH:
[English summary]`;

    const chat = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const response = chat.choices[0]?.message?.content?.trim() || '';

    if (chat.usage?.total_tokens) {
      logger.info({ tokens: chat.usage.total_tokens }, 'Parent summary LLM tokens used');
    }

    // Parse the response
    const frenchMatch = response.match(/FRENCH:\s*(.+?)(?=ENGLISH:|$)/s);
    const englishMatch = response.match(/ENGLISH:\s*(.+?)$/s);

    const french = frenchMatch?.[1]?.trim() || fallbackResponse.french;
    const english = englishMatch?.[1]?.trim() || fallbackResponse.english;

    return { french, english };
  } catch (err) {
    logger.error({ err }, 'Parent summary generation failed');
    return fallbackResponse;
  }
}

export async function regenerateSummaryWithVariation(
  originalSummary: { french: string; english: string },
  params: GenerateSummaryParams,
  tone: 'formal' | 'informal' = 'formal',
): Promise<{ french: string; english: string }> {
  if (!openai || !process.env.ENABLE_LLM) {
    return originalSummary;
  }

  try {
    const systemPrompt = `You are a helpful elementary school teacher. Rewrite the given progress summary with slight variations while maintaining the same key information. Use a ${tone} tone.`;

    const userPrompt = `Rewrite these summaries with variation:

FRENCH: ${originalSummary.french}
ENGLISH: ${originalSummary.english}

Keep the same information but vary the wording and structure. Format as:
FRENCH:
[New French summary]

ENGLISH:
[New English summary]`;

    const chat = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.9,
      max_tokens: 600,
    });

    const response = chat.choices[0]?.message?.content?.trim() || '';

    // Parse the response
    const frenchMatch = response.match(/FRENCH:\s*(.+?)(?=ENGLISH:|$)/s);
    const englishMatch = response.match(/ENGLISH:\s*(.+?)$/s);

    return {
      french: frenchMatch?.[1]?.trim() || originalSummary.french,
      english: englishMatch?.[1]?.trim() || originalSummary.english,
    };
  } catch (err) {
    logger.error({ err }, 'Summary regeneration failed');
    return originalSummary;
  }
}
