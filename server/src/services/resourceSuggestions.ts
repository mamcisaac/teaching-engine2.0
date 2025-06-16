import { prisma } from '../prisma';

export type ResourceSuggestion = {
  title: string;
  type: 'worksheet' | 'video' | 'audio' | 'link';
  description?: string;
  url: string;
  rationale: string;
};

export async function getResourceSuggestions(activityId: number): Promise<ResourceSuggestion[]> {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: {
      outcomes: {
        include: {
          outcome: true,
        },
      },
      milestone: {
        include: {
          subject: true,
        },
      },
    },
  });

  if (!activity) {
    return [];
  }

  const suggestions: ResourceSuggestion[] = [];
  const subject = activity.milestone.subject.name.toLowerCase();
  const title = activity.title.toLowerCase();
  const outcomesCodes = activity.outcomes.map(
    (ao: { outcome: { code: string } }) => ao.outcome.code,
  );

  // Hardcoded rules for French Immersion Grade 1
  for (const outcomeCode of outcomesCodes) {
    // Oral communication outcomes
    if (outcomeCode.startsWith('CO.')) {
      suggestions.push({
        title: 'French Listening Song – Les Animaux',
        type: 'audio',
        url: 'https://www.youtube.com/watch?v=8eSgTKJx2f8',
        rationale: `This supports oral comprehension (${outcomeCode})`,
      });

      suggestions.push({
        title: 'Interactive French Vocabulary Game',
        type: 'link',
        url: 'https://www.logicieleducatif.fr/francais/vocabulaire/vocabulaire.php',
        rationale: `Interactive vocabulary practice for oral communication (${outcomeCode})`,
      });
    }

    // Reading outcomes
    if (outcomeCode.startsWith('CL.')) {
      suggestions.push({
        title: 'French Alphabet Song',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=UsEz58b86Ho',
        rationale: `Supports letter recognition and reading skills (${outcomeCode})`,
      });

      suggestions.push({
        title: 'Simple French Reading Comprehension Worksheets',
        type: 'worksheet',
        url: 'https://www.education.gouv.qc.ca/fileadmin/site_web/documents/education/jeunes/pfeq/PFEQ_francais-langue-enseignement-primaire.pdf',
        rationale: `Reading practice aligned with curriculum (${outcomeCode})`,
      });
    }

    // Writing outcomes
    if (outcomeCode.startsWith('CE.')) {
      suggestions.push({
        title: 'French Handwriting Practice Sheets',
        type: 'worksheet',
        url: 'https://www.fiche-maternelle.com/ecriture-maternelle.html',
        rationale: `Handwriting practice for French writing skills (${outcomeCode})`,
      });
    }
  }

  // Subject-based suggestions
  if (subject.includes('français') || subject.includes('francais') || subject.includes('french')) {
    // Title keyword-based suggestions
    if (title.includes('syllable') || title.includes('syllabe')) {
      suggestions.push({
        title: 'Syllable Clapping Game (PDF)',
        type: 'worksheet',
        url: 'https://www.teacher.org/worksheets/french/phonics/syllables.pdf',
        rationale: 'Perfect for syllable awareness activities',
      });
    }

    if (title.includes('song') || title.includes('chanson')) {
      suggestions.push({
        title: "French Children's Songs Collection",
        type: 'audio',
        url: 'https://www.youtube.com/playlist?list=PLwwL7zPWwLXX8Q8kGEzY2s2KVxYxvQ7Qi',
        rationale: 'Collection of age-appropriate French songs',
      });
    }

    if (title.includes('number') || title.includes('nombre')) {
      suggestions.push({
        title: 'French Numbers 1-20 Interactive Game',
        type: 'link',
        url: 'https://www.digitaldialects.com/French/Numbers.htm',
        rationale: 'Interactive number practice in French',
      });
    }
  }

  // Remove duplicates by URL
  const uniqueSuggestions = suggestions.filter(
    (suggestion, index, self) => index === self.findIndex((s) => s.url === suggestion.url),
  );

  // Limit to 5 suggestions
  return uniqueSuggestions.slice(0, 5);
}
