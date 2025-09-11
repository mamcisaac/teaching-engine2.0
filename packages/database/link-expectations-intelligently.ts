#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

// Use the correct database path
const databaseUrl = `file:${path.resolve(process.cwd(), 'prisma/prisma/dev.db')}`;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

interface LessonForAnalysis {
  id: string;
  title: string;
  titleFr: string;
  learningGoals: string | null;
  mindsOn: string | null;
  action: string | null;
  consolidation: string | null;
  subject: string;
  unitTitle: string;
  unitExpectations: string[];
}

interface ExpectationMatch {
  lessonId: string;
  expectationId: string;
  rationale: string;
}

async function linkExpectationsIntelligently() {
  console.log('🧠 INTELLIGENT CURRICULUM EXPECTATION LINKING\n');
  console.log('This process will read each lesson and match appropriate expectations\n');
  
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });

  if (!emily) throw new Error('Emily not found');

  // Get all lessons without expectations
  const lessonsWithoutExpectations = await prisma.eTFOLessonPlan.findMany({
    where: {
      userId: emily.id,
      expectations: {
        none: {}
      }
    },
    include: {
      unitPlan: {
        include: {
          longRangePlan: true,
          expectations: {
            include: {
              expectation: true
            }
          }
        }
      }
    },
    orderBy: [
      { unitPlanId: 'asc' },
      { lessonNumber: 'asc' }
    ]
  });

  console.log(`📚 Found ${lessonsWithoutExpectations.length} lessons without expectations\n`);

  // Get all curriculum expectations organized by subject
  const expectations = await prisma.curriculumExpectation.findMany({
    orderBy: [{ subject: 'asc' }, { code: 'asc' }]
  });

  const expectationsBySubject: Record<string, any[]> = {};
  expectations.forEach(e => {
    if (!expectationsBySubject[e.subject]) expectationsBySubject[e.subject] = [];
    expectationsBySubject[e.subject].push(e);
  });

  // Group lessons by subject for batch processing
  const lessonsBySubject: Record<string, LessonForAnalysis[]> = {};
  
  for (const lesson of lessonsWithoutExpectations) {
    const subject = lesson.unitPlan?.longRangePlan?.subject;
    if (!subject) continue;

    if (!lessonsBySubject[subject]) lessonsBySubject[subject] = [];
    
    lessonsBySubject[subject].push({
      id: lesson.id,
      title: lesson.title || '',
      titleFr: lesson.titleFr || '',
      learningGoals: lesson.learningGoals,
      mindsOn: lesson.mindsOn,
      action: lesson.action,
      consolidation: lesson.consolidation,
      subject: subject,
      unitTitle: lesson.unitPlan?.title || '',
      unitExpectations: lesson.unitPlan?.expectations?.map(e => e.expectation.code) || []
    });
  }

  // Process each subject group
  let totalLinked = 0;
  const results: ExpectationMatch[] = [];

  for (const [subject, lessons] of Object.entries(lessonsBySubject)) {
    console.log(`\n📖 Processing ${subject}: ${lessons.length} lessons`);
    
    const subjectExpectations = expectationsBySubject[subject] || [];
    if (subjectExpectations.length === 0) {
      console.log(`  ⚠️  No expectations available for ${subject}`);
      continue;
    }

    // Create a batch analysis prompt for the agent
    const batchSize = 10; // Process 10 lessons at a time
    for (let i = 0; i < lessons.length; i += batchSize) {
      const batch = lessons.slice(i, Math.min(i + batchSize, lessons.length));
      
      console.log(`  🔍 Analyzing lessons ${i + 1}-${Math.min(i + batchSize, lessons.length)}...`);
      
      // Analyze each lesson in the batch
      for (const lesson of batch) {
        const matches = analyzeLesson(lesson, subjectExpectations);
        results.push(...matches);
      }
    }
  }

  // Write results to a JSON file for review
  const outputPath = path.join(process.cwd(), 'expectation-matches.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log(`\n💾 Analysis complete! ${results.length} matches found`);
  console.log(`   Results saved to: ${outputPath}`);
  console.log(`\n📋 Next steps:`);
  console.log(`   1. Review the matches in expectation-matches.json`);
  console.log(`   2. Run 'npx tsx apply-expectation-matches.ts' to apply them`);

  await prisma.$disconnect();
}

function analyzeLesson(lesson: LessonForAnalysis, expectations: any[]): ExpectationMatch[] {
  const matches: ExpectationMatch[] = [];
  
  // Combine all lesson text for analysis
  const lessonContent = [
    lesson.title,
    lesson.titleFr,
    lesson.learningGoals,
    lesson.mindsOn,
    lesson.action,
    lesson.consolidation
  ].filter(Boolean).join(' ').toLowerCase();

  // Prioritize unit-level expectations if they exist
  const unitExpCodes = lesson.unitExpectations;
  const unitExpectations = expectations.filter(e => unitExpCodes.includes(e.code));
  
  // Score each expectation based on content match
  const scores: Map<string, number> = new Map();
  
  for (const exp of expectations) {
    let score = 0;
    const expKeywords = extractKeywords(exp.description.toLowerCase());
    
    // Check for keyword matches
    for (const keyword of expKeywords) {
      if (lessonContent.includes(keyword)) {
        score += 2;
      }
    }
    
    // Bonus for unit-level expectations
    if (unitExpCodes.includes(exp.code)) {
      score += 5;
    }
    
    // Check code patterns (e.g., if lesson is about writing and exp is E1.x)
    if (matchesCodePattern(lessonContent, exp.code)) {
      score += 3;
    }
    
    if (score > 0) {
      scores.set(exp.id, score);
    }
  }
  
  // Select top 1-2 expectations
  const sortedExpectations = Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);
  
  for (const [expId, score] of sortedExpectations) {
    const exp = expectations.find(e => e.id === expId);
    if (exp) {
      matches.push({
        lessonId: lesson.id,
        expectationId: expId,
        rationale: `Matched based on content alignment (score: ${score})`
      });
    }
  }
  
  // If no matches found, use the first unit expectation as fallback
  if (matches.length === 0 && unitExpectations.length > 0) {
    matches.push({
      lessonId: lesson.id,
      expectationId: unitExpectations[0].id,
      rationale: 'Default to primary unit expectation'
    });
  }
  
  return matches;
}

function extractKeywords(text: string): string[] {
  // Extract meaningful keywords (3+ characters, not common words)
  const commonWords = new Set(['the', 'and', 'for', 'with', 'dans', 'pour', 'avec', 'les', 'des', 'une']);
  return text
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word))
    .slice(0, 5); // Top 5 keywords
}

function matchesCodePattern(content: string, code: string): boolean {
  // Match content patterns to expectation codes
  const patterns: Record<string, string[]> = {
    'CO': ['parler', 'oral', 'écouter', 'communication', 'dire', 'speaking', 'listening'],
    'E': ['écrire', 'écriture', 'writing', 'write', 'lettres', 'mots'],
    'L': ['lire', 'lecture', 'reading', 'read', 'texte', 'histoire'],
    'N': ['nombre', 'number', 'compter', 'count', 'addition', 'soustraction'],
    'G': ['forme', 'shape', 'géométrie', 'geometry', 'espace'],
    'M': ['mesure', 'measure', 'longueur', 'temps', 'heure'],
    'S': ['données', 'data', 'graphique', 'tableau', 'statistique'],
    'SC': ['science', 'observer', 'expérience', 'nature', 'vivant'],
    'ES': ['communauté', 'famille', 'société', 'culture', 'tradition'],
    'AV': ['art', 'dessiner', 'créer', 'couleur', 'visual'],
    'AM': ['musique', 'chanson', 'rythme', 'son', 'chanter'],
    'AD': ['drame', 'théâtre', 'jouer', 'rôle', 'mouvement'],
    'FPS': ['santé', 'sécurité', 'émotion', 'ami', 'corps']
  };
  
  const prefix = code.split(/\d/)[0]; // Get letter prefix
  const keywords = patterns[prefix] || [];
  
  for (const keyword of keywords) {
    if (content.includes(keyword)) {
      return true;
    }
  }
  
  return false;
}

linkExpectationsIntelligently()
  .then(() => {
    console.log('\n✅ Analysis complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Analysis failed:', error);
    process.exit(1);
  });