import { PrismaClient } from '@teaching-engine/database';

const prisma = new PrismaClient();

interface ResourceSuggestion {
  title: string;
  type: 'worksheet' | 'link' | 'audio' | 'video';
  url: string;
  rationale?: string;
}

export async function getResourceSuggestions(activityId: number): Promise<ResourceSuggestion[]> {
  const suggestions: ResourceSuggestion[] = [];

  // Get activity with its relationships
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: {
      milestone: {
        include: {
          subject: true,
        },
      },
      outcomes: {
        include: {
          outcome: true,
        },
      },
    },
  });

  if (!activity) {
    return [];
  }

  const title = activity.title.toLowerCase();
  const subject = activity.milestone.subject.name.toLowerCase();

  // Process outcomes first (higher priority)
  for (const activityOutcome of activity.outcomes) {
    const outcomeCode = activityOutcome.outcome.code;
    const outcomeDesc = activityOutcome.outcome.description.toLowerCase();

    // Oral Communication outcomes (CO)
    if (outcomeCode.startsWith('CO.')) {
      suggestions.push({
        title: 'French Audio Story: Les Animaux de la Ferme',
        type: 'audio',
        url: 'https://www.iletaitunehistoire.com/genres/contes-legendes/lire/les-animaux-de-la-ferme-biblidcon_012',
        rationale: `Audio story for oral comprehension practice (${outcomeCode})`,
      });
      suggestions.push({
        title: 'Interactive French Speaking Activities',
        type: 'link',
        url: 'https://www.digitaldialects.com/French.htm',
        rationale: `Interactive exercises for oral communication practice (${outcomeCode})`,
      });
    }

    // Reading outcomes (CL)
    if (outcomeCode.startsWith('CL.') || outcomeDesc.includes('reading')) {
      suggestions.push({
        title: 'French Reading Videos',
        type: 'video',
        url: 'https://www.youtube.com/playlist?list=PLwwL7zPWwLXX_mL5kscJe1dXIGkJNS9xl',
        rationale: `Video stories for reading comprehension (${outcomeCode})`,
      });
      suggestions.push({
        title: 'French Reading Comprehension Guide',
        type: 'link',
        url: 'https://www.education.gouv.qc.ca/fileadmin/site_web/documents/education/jeunes/pfeq/PFEQ_francais-langue-enseignement-primaire.pdf',
        rationale: `Reading practice aligned with curriculum (${outcomeCode})`,
      });
    }

    // Writing outcomes (CE or PE)
    if (outcomeCode.startsWith('CE.') || outcomeCode.startsWith('PE.')) {
      suggestions.push({
        title: 'French Handwriting Practice Sheets',
        type: 'worksheet',
        url: 'https://www.fiche-maternelle.com/ecriture-maternelle.html',
        rationale: `Handwriting practice for French writing skills (${outcomeCode})`,
      });
    }
  }

  // Subject-based suggestions (lower priority)
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
