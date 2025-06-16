import { prisma } from '../prisma';

interface CognateSuggestion {
  wordFr: string;
  wordEn: string;
  confidence: 'exact' | 'partial' | 'potential';
  notes?: string;
}

// Static database of common French-English cognates for Grade 1
const COMMON_COGNATES = [
  { wordFr: 'animal', wordEn: 'animal', confidence: 'exact' as const },
  { wordFr: 'nature', wordEn: 'nature', confidence: 'exact' as const },
  { wordFr: 'famille', wordEn: 'family', confidence: 'partial' as const },
  { wordFr: 'couleur', wordEn: 'color', confidence: 'partial' as const },
  { wordFr: 'musique', wordEn: 'music', confidence: 'partial' as const },
  { wordFr: 'sport', wordEn: 'sport', confidence: 'exact' as const },
  { wordFr: 'art', wordEn: 'art', confidence: 'exact' as const },
  { wordFr: 'science', wordEn: 'science', confidence: 'exact' as const },
  { wordFr: 'histoire', wordEn: 'history', confidence: 'partial' as const },
  { wordFr: 'géographie', wordEn: 'geography', confidence: 'partial' as const },
  { wordFr: 'mathématiques', wordEn: 'mathematics', confidence: 'partial' as const },
  { wordFr: 'français', wordEn: 'French', confidence: 'partial' as const },
  { wordFr: 'anglais', wordEn: 'English', confidence: 'partial' as const },
  {
    wordFr: 'école',
    wordEn: 'school',
    confidence: 'partial' as const,
    notes: 'Different pronunciation',
  },
  { wordFr: 'classe', wordEn: 'class', confidence: 'partial' as const },
  { wordFr: 'étudiant', wordEn: 'student', confidence: 'partial' as const },
  { wordFr: 'professeur', wordEn: 'professor', confidence: 'partial' as const },
  {
    wordFr: 'livre',
    wordEn: 'library',
    confidence: 'potential' as const,
    notes: 'False friend - livre = book',
  },
  { wordFr: 'bibliothèque', wordEn: 'library', confidence: 'partial' as const },
  { wordFr: 'restaurant', wordEn: 'restaurant', confidence: 'exact' as const },
  { wordFr: 'hôtel', wordEn: 'hotel', confidence: 'exact' as const },
  { wordFr: 'parc', wordEn: 'park', confidence: 'exact' as const },
  { wordFr: 'centre', wordEn: 'center', confidence: 'partial' as const },
  { wordFr: 'ville', wordEn: 'village', confidence: 'partial' as const },
  { wordFr: 'maison', wordEn: 'mansion', confidence: 'partial' as const },
  { wordFr: 'forêt', wordEn: 'forest', confidence: 'partial' as const },
  { wordFr: 'océan', wordEn: 'ocean', confidence: 'partial' as const },
  { wordFr: 'montagne', wordEn: 'mountain', confidence: 'partial' as const },
  { wordFr: 'rivière', wordEn: 'river', confidence: 'partial' as const },
  { wordFr: 'saison', wordEn: 'season', confidence: 'partial' as const },
  { wordFr: 'température', wordEn: 'temperature', confidence: 'partial' as const },
  { wordFr: 'orange', wordEn: 'orange', confidence: 'exact' as const },
  { wordFr: 'rose', wordEn: 'rose', confidence: 'exact' as const },
  { wordFr: 'bleu', wordEn: 'blue', confidence: 'partial' as const },
  { wordFr: 'rouge', wordEn: 'rouge', confidence: 'exact' as const },
  { wordFr: 'vert', wordEn: 'verdant', confidence: 'partial' as const },
  {
    wordFr: 'blanc',
    wordEn: 'blank',
    confidence: 'potential' as const,
    notes: 'Different meanings',
  },
  { wordFr: 'noir', wordEn: 'noir', confidence: 'exact' as const },
  { wordFr: 'grand', wordEn: 'grand', confidence: 'exact' as const },
  { wordFr: 'petit', wordEn: 'petite', confidence: 'exact' as const },
  { wordFr: 'bon', wordEn: 'bonus', confidence: 'partial' as const },
  { wordFr: 'mauvais', wordEn: 'malevolent', confidence: 'partial' as const },
  { wordFr: 'facile', wordEn: 'facile', confidence: 'exact' as const },
  { wordFr: 'difficile', wordEn: 'difficult', confidence: 'partial' as const },
  { wordFr: 'nouveau', wordEn: 'novel', confidence: 'partial' as const },
  { wordFr: 'vieux', wordEn: 'vintage', confidence: 'partial' as const },
  { wordFr: 'jeune', wordEn: 'juvenile', confidence: 'partial' as const },
  { wordFr: 'âgé', wordEn: 'aged', confidence: 'partial' as const },
];

/**
 * Extract keywords from outcome description for cognate matching
 */
function extractKeywords(text: string): string[] {
  // Remove common words and focus on content words
  const commonWords = [
    'le',
    'la',
    'les',
    'un',
    'une',
    'des',
    'de',
    'du',
    'dans',
    'pour',
    'avec',
    'sur',
    'par',
    'à',
    'et',
    'ou',
    'est',
    'sont',
    'être',
    'avoir',
  ];

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
    .split(/\s+/)
    .filter((word) => word.length > 2 && !commonWords.includes(word))
    .slice(0, 10); // Limit to first 10 keywords
}

/**
 * Find potential cognates based on similarity
 */
function findSimilarCognates(keyword: string): CognateSuggestion[] {
  const suggestions: CognateSuggestion[] = [];

  for (const cognate of COMMON_COGNATES) {
    // Exact match
    if (cognate.wordFr.toLowerCase() === keyword.toLowerCase()) {
      suggestions.push(cognate);
      continue;
    }

    // Partial match (contains keyword or keyword contains cognate)
    if (
      cognate.wordFr.toLowerCase().includes(keyword.toLowerCase()) ||
      keyword.toLowerCase().includes(cognate.wordFr.toLowerCase())
    ) {
      suggestions.push({
        ...cognate,
        confidence: 'partial' as const,
      });
      continue;
    }

    // Similarity based on first few characters
    if (keyword.length >= 4 && cognate.wordFr.length >= 4) {
      const keywordPrefix = keyword.toLowerCase().substring(0, 3);
      const cognatePrefix = cognate.wordFr.toLowerCase().substring(0, 3);

      if (keywordPrefix === cognatePrefix) {
        suggestions.push({
          ...cognate,
          confidence: 'potential' as const,
          notes: 'Similar prefix - verify relevance',
        });
      }
    }
  }

  return suggestions;
}

/**
 * Suggest cognates for a given outcome based on its description
 */
export async function suggestCognatesForOutcome(outcomeId: string): Promise<CognateSuggestion[]> {
  try {
    // Fetch the outcome
    const outcome = await prisma.outcome.findUnique({
      where: { id: outcomeId },
      select: { description: true },
    });

    if (!outcome) {
      throw new Error('Outcome not found');
    }

    // Extract keywords from the outcome description
    const keywords = extractKeywords(outcome.description);

    // Find cognate suggestions for each keyword
    const allSuggestions: CognateSuggestion[] = [];

    for (const keyword of keywords) {
      const suggestions = findSimilarCognates(keyword);
      allSuggestions.push(...suggestions);
    }

    // Remove duplicates and sort by confidence
    const uniqueSuggestions = allSuggestions.reduce((acc, suggestion) => {
      const key = `${suggestion.wordFr}-${suggestion.wordEn}`;
      if (!acc.has(key)) {
        acc.set(key, suggestion);
      }
      return acc;
    }, new Map<string, CognateSuggestion>());

    const sortedSuggestions = Array.from(uniqueSuggestions.values()).sort((a, b) => {
      const confidenceOrder = { exact: 3, partial: 2, potential: 1 };
      return confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
    });

    return sortedSuggestions.slice(0, 10); // Return top 10 suggestions
  } catch (error) {
    console.error('Error suggesting cognates for outcome:', error);
    return [];
  }
}

/**
 * Get all cognates for a specific user
 */
export async function getUserCognates(userId: number) {
  return await prisma.cognatePair.findMany({
    where: { userId },
    include: {
      linkedOutcomes: {
        include: {
          outcome: true,
        },
      },
      linkedActivities: {
        include: {
          activity: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Search cognates by French or English word
 */
export async function searchCognates(query: string, userId?: number) {
  const searchCondition = {
    AND: [
      ...(userId ? [{ userId }] : []),
      {
        OR: [
          { wordFr: { contains: query, mode: 'insensitive' } },
          { wordEn: { contains: query, mode: 'insensitive' } },
        ],
      },
    ],
  };

  return await prisma.cognatePair.findMany({
    where: searchCondition,
    include: {
      linkedOutcomes: {
        include: {
          outcome: true,
        },
      },
      linkedActivities: {
        include: {
          activity: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Get cognates associated with specific activities
 */
export async function getCognatesForActivities(activityIds: number[]) {
  return await prisma.cognatePair.findMany({
    where: {
      linkedActivities: {
        some: {
          activityId: {
            in: activityIds,
          },
        },
      },
    },
    include: {
      linkedOutcomes: {
        include: {
          outcome: true,
        },
      },
      linkedActivities: {
        include: {
          activity: true,
        },
        where: {
          activityId: {
            in: activityIds,
          },
        },
      },
    },
  });
}
