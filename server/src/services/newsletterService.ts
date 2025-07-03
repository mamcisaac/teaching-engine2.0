import { DaybookEntry, CalendarEvent } from '@teaching-engine/database';
import { prisma } from '../prisma';
import OpenAI from 'openai';

// Newsletter types
export type NewsletterTone = 'friendly' | 'formal' | 'informative';
export type TemplateType = 'weekly' | 'monthly' | 'special';

export interface NewsletterSection {
  id: string;
  title: string;
  titleFr: string;
  content: string;
  contentFr: string;
  isEditable: boolean;
  order: number;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

interface NewsletterGenerationOptions {
  userId: number;
  dateFrom: Date;
  dateTo: Date;
  tone: NewsletterTone;
  focusAreas?: string[];
  includeUpcomingEvents?: boolean;
  templateType?: TemplateType;
  existingSections?: NewsletterSection[];
}

export async function generateNewsletterContent({
  userId,
  dateFrom,
  dateTo,
  tone,
  focusAreas = [],
  includeUpcomingEvents = true,
  templateType = 'weekly',
  existingSections = [],
}: NewsletterGenerationOptions) {
  const dateRange = `${dateFrom.toLocaleDateString()} to ${dateTo.toLocaleDateString()}`;

  // Get teacher's lesson plans and activities for the period
  const daybookEntries = await prisma.daybookEntry.findMany({
    where: {
      userId,
      date: {
        gte: dateFrom,
        lte: dateTo,
      },
    },
    include: {
      lessonPlan: true,
    },
    orderBy: { date: 'asc' },
  });

  // Get upcoming events if requested
  let upcomingEvents: CalendarEvent[] = [];
  if (includeUpcomingEvents) {
    upcomingEvents = await prisma.calendarEvent.findMany({
      where: {
        userId,
        date: {
          gte: dateTo,
          lte: new Date(dateTo.getTime() + 14 * 24 * 60 * 60 * 1000), // Next 2 weeks
        },
      },
      orderBy: { date: 'asc' },
      take: 5,
    });
  }

  // Prepare context for AI
  const learningActivities = daybookEntries.map(entry => ({
    date: entry.date,
    subject: entry.lessonPlan?.subject || 'General',
    topics: entry.lessonPlan?.learningGoals || [],
    activities: entry.actualActivities || entry.lessonPlan?.activities || 'Regular classroom activities',
  }));

  const toneDescriptions = {
    friendly: 'warm, conversational, and approachable',
    formal: 'professional, respectful, and structured',
    informative: 'clear, educational, and detailed',
  };

  const templateDescriptions = {
    weekly: 'a weekly update covering the past week\'s learning activities',
    monthly: 'a comprehensive monthly overview of learning progress and achievements',
    special: 'a special announcement or themed newsletter',
  };

  const prompt = `Create a ${templateType} newsletter template for parents in both English and French.
This is a general template that teachers can customize for their classroom communication.

Context:
- Date range: ${dateRange}
- Tone: ${toneDescriptions[tone]}
- Template type: ${templateDescriptions[templateType]}
${focusAreas.length > 0 ? `- Focus areas: ${focusAreas.join(', ')}` : ''}

Recent classroom activities:
${learningActivities.map(a => `- ${a.date.toLocaleDateString()}: ${a.subject} - ${a.topics.join(', ')}`).join('\n')}

${includeUpcomingEvents && upcomingEvents.length > 0 ? `
Upcoming events:
${upcomingEvents.map(e => `- ${e.date.toLocaleDateString()}: ${e.title}`).join('\n')}
` : ''}

Generate newsletter sections with the following structure:
1. Welcome/Introduction section
2. Learning highlights from the period
3. Skills development focus
4. Home connection ideas (activities parents can do at home)
${includeUpcomingEvents ? '5. Upcoming events and reminders' : ''}
6. Closing message

For each section, provide:
- A title in English and French
- Content in English and French
- Make content general enough that teachers can adapt it to their specific classroom

Return the response in this JSON format:
{
  "sections": [
    {
      "id": "unique-id",
      "title": "English title",
      "titleFr": "French title",
      "content": "English content",
      "contentFr": "French content",
      "isEditable": true,
      "order": 1
    }
  ]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an educational newsletter writer creating templates for elementary school teachers to communicate with parents. Create general, adaptable content that teachers can customize.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const response = JSON.parse(completion.choices[0].message.content || '{}');
    
    // Merge with existing sections if provided
    if (existingSections.length > 0) {
      const editableSectionIds = response.sections
        .filter((s: NewsletterSection) => s.isEditable)
        .map((s: NewsletterSection) => s.id);
      
      // Keep non-editable sections and replace editable ones
      const mergedSections = [
        ...existingSections.filter(s => !editableSectionIds.includes(s.id)),
        ...response.sections,
      ].sort((a, b) => a.order - b.order);
      
      response.sections = mergedSections;
    }

    return {
      sections: response.sections,
      metadata: {
        dateRange: { from: dateFrom.toISOString(), to: dateTo.toISOString() },
        tone,
        templateType,
        generatedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Error generating newsletter content:', error);
    throw new Error('Failed to generate newsletter content');
  }
}

// Get suggested focus areas based on recent teaching activities
export async function getSuggestedFocusAreas(userId: number): Promise<string[]> {
  const recentEntries = await prisma.daybookEntry.findMany({
    where: { userId },
    include: { lessonPlan: true },
    orderBy: { date: 'desc' },
    take: 10,
  });

  const subjects = new Set<string>();
  const skills = new Set<string>();

  recentEntries.forEach(entry => {
    if (entry.lessonPlan?.subject) {
      subjects.add(entry.lessonPlan.subject);
    }
    if (entry.lessonPlan?.learningGoals) {
      entry.lessonPlan.learningGoals.forEach(goal => {
        // Extract key skills from learning goals
        const skillKeywords = ['reading', 'writing', 'math', 'science', 'social', 'art', 'music', 'physical'];
        skillKeywords.forEach(keyword => {
          if (goal.toLowerCase().includes(keyword)) {
            skills.add(keyword.charAt(0).toUpperCase() + keyword.slice(1));
          }
        });
      });
    }
  });

  return [
    ...Array.from(subjects).slice(0, 3),
    ...Array.from(skills).slice(0, 2),
  ];
}