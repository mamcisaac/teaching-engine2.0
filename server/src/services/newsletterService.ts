import { Student, DaybookEntry, StudentArtifact, StudentReflection } from '@teaching-engine/database';
import OpenAI from 'openai';

// Newsletter types
export type NewsletterTone = 'friendly' | 'formal' | 'informative';

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
  students: (Student & { artifacts: StudentArtifact[]; reflections: StudentReflection[] })[];
  daybookEntries: DaybookEntry[];
  fromDate: Date;
  toDate: Date;
  tone: NewsletterTone;
  focusAreas?: string[];
  options: {
    includeArtifacts: boolean;
    includeReflections: boolean;
    includeLearningGoals: boolean;
    includeUpcomingEvents: boolean;
  };
}

export async function generateNewsletterContent({
  students,
  daybookEntries,
  fromDate,
  toDate,
  tone,
  focusAreas = [],
  options,
}: NewsletterGenerationOptions) {
  const dateRange = `${fromDate.toLocaleDateString()} to ${toDate.toLocaleDateString()}`;
  const studentNames = students.map(s => s.firstName).join(', ');

  // Prepare context for AI
  const learningActivities = daybookEntries.map(entry => ({
    date: entry.date,
    notes: entry.notes,
    whatWorked: entry.whatWorked,
    studentEngagement: entry.studentEngagement,
    studentSuccesses: entry.studentSuccesses,
  }));

  const studentProgress = students.map(student => ({
    name: student.firstName,
    artifacts: options.includeArtifacts ? student.artifacts : [],
    reflections: options.includeReflections ? student.reflections : [],
  }));

  const toneDescriptions = {
    friendly: 'warm, approachable, and conversational',
    formal: 'professional, structured, and detailed',
    informative: 'clear, factual, and educational',
  };

  const systemPrompt = `You are an elementary school teacher creating a newsletter for parents. 
Your tone should be ${toneDescriptions[tone]}. 
Create bilingual content (English and French) for each section.
Focus on: ${focusAreas.length > 0 ? focusAreas.join(', ') : 'overall student progress and activities'}.`;

  const userPrompt = `Create a parent newsletter for the period ${dateRange} for students: ${studentNames}.

Learning Activities:
${JSON.stringify(learningActivities, null, 2)}

${options.includeArtifacts || options.includeReflections ? `Student Progress:
${JSON.stringify(studentProgress, null, 2)}` : ''}

Please create the following sections:
1. Introduction/Overview
2. Academic Highlights
3. Learning Activities & Projects
${options.includeArtifacts ? '4. Student Work Showcase' : ''}
${options.includeReflections ? '5. Student Reflections' : ''}
${options.includeLearningGoals ? '6. Upcoming Learning Goals' : ''}
${options.includeUpcomingEvents ? '7. Important Dates & Events' : ''}
8. Home Support Tips
9. Closing Message

For each section, provide:
- title (English)
- titleFr (French)
- content (English, using simple HTML for formatting)
- contentFr (French, using simple HTML for formatting)

Format the response as a JSON array of sections.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: tone === 'friendly' ? 0.8 : tone === 'formal' ? 0.5 : 0.6,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated');
    }

    const parsed = JSON.parse(content);
    const sections: NewsletterSection[] = (parsed.sections || []).map((section: { title?: string; titleFr?: string; content?: string; contentFr?: string }, index: number) => ({
      id: `section-${Date.now()}-${index}`,
      title: section.title || 'Section',
      titleFr: section.titleFr || 'Section',
      content: section.content || '',
      contentFr: section.contentFr || '',
      isEditable: true,
      order: index,
    }));

    return { sections };
  } catch (error) {
    console.error('Error generating newsletter content:', error);
    
    // Fallback to template-based generation
    return generateFallbackNewsletter({
      dateRange,
      studentNames,
      tone,
      focusAreas,
      options,
    });
  }
}

function generateFallbackNewsletter({
  dateRange,
  studentNames,
  tone: _tone,
  focusAreas,
  options,
}: {
  dateRange: string;
  studentNames: string;
  tone: NewsletterTone;
  focusAreas: string[];
  options: {
    includeArtifacts: boolean;
    includeReflections: boolean;
    includeLearningGoals: boolean;
    includeUpcomingEvents: boolean;
  };
}): { sections: NewsletterSection[] } {
  const sections: NewsletterSection[] = [];
  let order = 0;

  // Introduction
  sections.push({
    id: `section-intro-${Date.now()}`,
    title: 'Newsletter Introduction',
    titleFr: 'Introduction du bulletin',
    content: `<p>Dear Parents and Guardians,</p>
<p>Welcome to our classroom newsletter for ${dateRange}. This update covers the learning journey of ${studentNames}.</p>`,
    contentFr: `<p>Chers parents et tuteurs,</p>
<p>Bienvenue à notre bulletin de classe pour ${dateRange}. Cette mise à jour couvre le parcours d'apprentissage de ${studentNames}.</p>`,
    isEditable: true,
    order: order++,
  });

  // Academic Highlights
  sections.push({
    id: `section-highlights-${Date.now()}`,
    title: 'Academic Highlights',
    titleFr: 'Points saillants académiques',
    content: `<p>This period, our students have been working on various subjects and activities. ${focusAreas.length > 0 ? `We particularly focused on: ${focusAreas.join(', ')}.` : ''}</p>`,
    contentFr: `<p>Au cours de cette période, nos élèves ont travaillé sur divers sujets et activités. ${focusAreas.length > 0 ? `Nous nous sommes particulièrement concentrés sur : ${focusAreas.join(', ')}.` : ''}</p>`,
    isEditable: true,
    order: order++,
  });

  // Learning Activities
  sections.push({
    id: `section-activities-${Date.now()}`,
    title: 'Learning Activities & Projects',
    titleFr: 'Activités d\'apprentissage et projets',
    content: `<p>Students engaged in hands-on learning experiences including group projects, individual assignments, and collaborative activities.</p>`,
    contentFr: `<p>Les élèves ont participé à des expériences d'apprentissage pratiques comprenant des projets de groupe, des devoirs individuels et des activités collaboratives.</p>`,
    isEditable: true,
    order: order++,
  });

  if (options.includeLearningGoals) {
    sections.push({
      id: `section-goals-${Date.now()}`,
      title: 'Upcoming Learning Goals',
      titleFr: 'Objectifs d\'apprentissage à venir',
      content: `<p>In the coming weeks, we will be focusing on developing key skills and exploring new concepts across our curriculum.</p>`,
      contentFr: `<p>Dans les semaines à venir, nous nous concentrerons sur le développement de compétences clés et l'exploration de nouveaux concepts dans notre programme.</p>`,
      isEditable: true,
      order: order++,
    });
  }

  // Home Support
  sections.push({
    id: `section-support-${Date.now()}`,
    title: 'How You Can Help at Home',
    titleFr: 'Comment vous pouvez aider à la maison',
    content: `<p>You can support your child's learning by:</p>
<ul>
  <li>Reading together daily</li>
  <li>Practicing math facts during everyday activities</li>
  <li>Encouraging questions and curiosity</li>
  <li>Providing a quiet study space</li>
</ul>`,
    contentFr: `<p>Vous pouvez soutenir l'apprentissage de votre enfant en :</p>
<ul>
  <li>Lisant ensemble tous les jours</li>
  <li>Pratiquant les faits mathématiques lors des activités quotidiennes</li>
  <li>Encourageant les questions et la curiosité</li>
  <li>Fournissant un espace d'étude calme</li>
</ul>`,
    isEditable: true,
    order: order++,
  });

  // Closing
  sections.push({
    id: `section-closing-${Date.now()}`,
    title: 'Closing Message',
    titleFr: 'Message de clôture',
    content: `<p>Thank you for your continued support. Please don't hesitate to reach out if you have any questions or concerns.</p>
<p>Best regards,<br>Your Teaching Team</p>`,
    contentFr: `<p>Merci pour votre soutien continu. N'hésitez pas à nous contacter si vous avez des questions ou des préoccupations.</p>
<p>Cordialement,<br>Votre équipe enseignante</p>`,
    isEditable: true,
    order: order++,
  });

  return { sections };
}