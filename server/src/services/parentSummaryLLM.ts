import { generateContent } from './llmService';
import type {
  Student,
  StudentArtifact,
  StudentReflection,
} from '../prisma';

interface StudentWithData extends Student {
  artifacts: StudentArtifact[];
  reflections: StudentReflection[];
}

interface GenerateParentSummaryParams {
  student: StudentWithData;
  fromDate: Date;
  toDate: Date;
  focusAreas?: string[];
}

interface RegenerateParentSummaryParams {
  originalFrench: string;
  originalEnglish: string;
  student: Student;
  fromDate: Date;
  toDate: Date;
  focusAreas?: string[];
  tone: 'formal' | 'informal';
}

export interface ParentSummaryGeneration {
  french: string;
  english: string;
}

export async function generateParentSummary({
  student,
  fromDate,
  toDate,
  focusAreas,
}: GenerateParentSummaryParams): Promise<ParentSummaryGeneration> {
  const formatDate = (date: Date) => date.toLocaleDateString('en-CA');

  // Assessment functionality removed
  const assessmentSummary: Array<Record<string, unknown>> = [];

  // Prepare artifacts data
  const artifactsSummary = student.artifacts.map((artifact) => ({
    title: artifact.title,
    description: artifact.description,
    createdAt: artifact.createdAt.toLocaleDateString('en-CA'),
  }));

  // Prepare reflections data
  const reflectionsSummary = student.reflections.map((reflection) => ({
    content: reflection.content,
    createdAt: reflection.createdAt.toLocaleDateString('en-CA'),
  }));

  const focusText =
    focusAreas && focusAreas.length > 0
      ? `\n\nPLEASE FOCUS PARTICULARLY ON: ${focusAreas.join(', ')}`
      : '';

  const prompt = `You are an expert elementary school teacher writing a progress summary for parents. 

STUDENT: ${student.firstName} ${student.lastName} (Grade ${student.grade})
PERIOD: ${formatDate(fromDate)} to ${formatDate(toDate)}

ASSESSMENT RESULTS:
No assessments recorded for this period

STUDENT ARTIFACTS:
${
  artifactsSummary.length > 0
    ? artifactsSummary
        .map((a) => `- ${a.title} (${a.createdAt})${a.description ? `: ${a.description}` : ''}`)
        .join('\n')
    : 'No artifacts recorded for this period'
}

REFLECTIONS:
${
  reflectionsSummary.length > 0
    ? reflectionsSummary.map((r) => `- ${r.createdAt}: ${r.content}`).join('\n')
    : 'No reflections recorded for this period'
}${focusText}

Please write a comprehensive progress summary in BOTH French and English. The summary should:

1. Be warm, positive, and encouraging while being honest about areas for growth
2. Highlight specific achievements and progress made during this period
3. Include concrete examples from the data provided
4. Mention next steps or areas of continued focus
5. Be approximately 150-200 words in each language
6. Use appropriate French Immersion teacher terminology

Respond with a JSON object containing:
{
  "french": "French summary text here...",
  "english": "English summary text here..."
}

Make sure the JSON is properly formatted and the content is meaningful, specific, and helpful for parents.`;

  try {
    const response = await generateContent(prompt);

    // Try to parse the JSON response
    try {
      const parsed = JSON.parse(response);
      if (parsed.french && parsed.english) {
        return {
          french: parsed.french,
          english: parsed.english,
        };
      }
    } catch (parseError) {
      console.warn('Failed to parse LLM JSON response, falling back to text parsing');
    }

    // Fallback: try to extract French and English from text
    const frenchMatch = response.match(/["']french["']\s*:\s*["'](.*?)["']/s);
    const englishMatch = response.match(/["']english["']\s*:\s*["'](.*?)["']/s);

    if (frenchMatch && englishMatch) {
      return {
        french: frenchMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'),
        english: englishMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'),
      };
    }

    // Final fallback
    throw new Error('Could not parse summary from LLM response');
  } catch (error) {
    console.error('Error generating parent summary:', error);

    // Provide fallback content
    return {
      french: `Résumé de progrès pour ${student.firstName} ${student.lastName}\n\nPériode: ${formatDate(fromDate)} au ${formatDate(toDate)}\n\n${student.firstName} continue de progresser dans ses apprentissages. Des données détaillées ont été collectées durant cette période et seront utilisées pour supporter son développement continu. Nous continuons à travailler ensemble pour assurer sa réussite académique.`,
      english: `Progress Summary for ${student.firstName} ${student.lastName}\n\nPeriod: ${formatDate(fromDate)} to ${formatDate(toDate)}\n\n${student.firstName} continues to make progress in their learning. Detailed data has been collected during this period and will be used to support their continued development. We continue to work together to ensure their academic success.`,
    };
  }
}

export async function regenerateParentSummary({
  originalFrench,
  originalEnglish,
  student,
  fromDate,
  toDate,
  focusAreas,
  tone,
}: RegenerateParentSummaryParams): Promise<ParentSummaryGeneration> {
  const formatDate = (date: Date) => date.toLocaleDateString('en-CA');

  const focusText =
    focusAreas && focusAreas.length > 0
      ? `\n\nPLEASE MAINTAIN FOCUS ON: ${focusAreas.join(', ')}`
      : '';

  const toneInstructions =
    tone === 'formal'
      ? 'Keep the tone professional and formal.'
      : 'Make the tone slightly more conversational and warm while maintaining professionalism.';

  const prompt = `You are an expert elementary school teacher. I need you to regenerate a parent progress summary with some variations while keeping the core message and accuracy.

STUDENT: ${student.firstName} ${student.lastName} (Grade ${student.grade})
PERIOD: ${formatDate(fromDate)} to ${formatDate(toDate)}

ORIGINAL FRENCH SUMMARY:
${originalFrench}

ORIGINAL ENGLISH SUMMARY:
${originalEnglish}

Please create NEW versions of both summaries that:
1. Maintain the same factual information and key points
2. Use different wording and sentence structures
3. ${toneInstructions}
4. Keep the same approximate length
5. Remain equally helpful and informative for parents${focusText}

Respond with a JSON object containing:
{
  "french": "New French summary here...",
  "english": "New English summary here..."
}

Make sure the JSON is properly formatted and the new content maintains the quality and accuracy of the original.`;

  try {
    const response = await generateContent(prompt);

    // Try to parse the JSON response
    try {
      const parsed = JSON.parse(response);
      if (parsed.french && parsed.english) {
        return {
          french: parsed.french,
          english: parsed.english,
        };
      }
    } catch (parseError) {
      console.warn('Failed to parse LLM JSON response, falling back to text parsing');
    }

    // Fallback: try to extract French and English from text
    const frenchMatch = response.match(/["']french["']\s*:\s*["'](.*?)["']/s);
    const englishMatch = response.match(/["']english["']\s*:\s*["'](.*?)["']/s);

    if (frenchMatch && englishMatch) {
      return {
        french: frenchMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'),
        english: englishMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'),
      };
    }

    // If parsing fails, return the original content
    console.warn('Could not parse regenerated summary, returning original');
    return {
      french: originalFrench,
      english: originalEnglish,
    };
  } catch (error) {
    console.error('Error regenerating parent summary:', error);

    // Return original content on error
    return {
      french: originalFrench,
      english: originalEnglish,
    };
  }
}
