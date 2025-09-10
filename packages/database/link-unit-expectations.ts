#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import * as path from 'path';

// Use the correct database path
const databaseUrl = `file:${path.resolve(process.cwd(), 'prisma/prisma/dev.db')}`;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

async function linkUnitExpectations() {
  console.log('🔗 LINKING CURRICULUM EXPECTATIONS TO UNIT PLANS\n');
  
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });

  if (!emily) throw new Error('Emily not found');

  // Get all expectations and units
  const expectations = await prisma.curriculumExpectation.findMany({
    orderBy: [{ subject: 'asc' }, { code: 'asc' }]
  });
  
  const units = await prisma.unitPlan.findMany({
    where: { userId: emily.id },
    include: {
      expectations: true,
      longRangePlan: true
    },
    orderBy: { startDate: 'asc' }
  });

  console.log(`Found ${expectations.length} curriculum expectations`);
  console.log(`Found ${units.length} unit plans`);
  
  // Organize expectations by subject
  const expectationsBySubject: Record<string, any[]> = {};
  expectations.forEach(e => {
    if (!expectationsBySubject[e.subject]) expectationsBySubject[e.subject] = [];
    expectationsBySubject[e.subject].push(e);
  });

  console.log('\nExpectations by subject:');
  Object.entries(expectationsBySubject).forEach(([subject, exps]) => {
    console.log(`  ${subject}: ${exps.length} expectations`);
  });

  let linked = 0;
  const linkingRules = {
    'Français (Immersion)': [
      { keywords: ['communication', 'oral', 'écouter', 'parler', 'dialogue'], priority: 3 },
      { keywords: ['lecture', 'lire', 'compréhension', 'texte'], priority: 3 },
      { keywords: ['écriture', 'écrire', 'message', 'phrase'], priority: 3 },
      { keywords: ['vocabulaire', 'mots', 'lexique'], priority: 2 },
      { keywords: ['phonétique', 'sons', 'syllabe'], priority: 2 }
    ],
    'Mathématiques': [
      { keywords: ['nombre', 'compter', 'addition', 'soustraction', 'calcul'], priority: 3 },
      { keywords: ['forme', 'géométrie', 'espace', 'position'], priority: 3 },
      { keywords: ['mesure', 'longueur', 'temps', 'masse'], priority: 3 },
      { keywords: ['régularité', 'suite', 'modèle'], priority: 2 },
      { keywords: ['données', 'graphique', 'tableau'], priority: 2 }
    ],
    'Sciences de la nature': [
      { keywords: ['vivant', 'animal', 'plante', 'croissance'], priority: 3 },
      { keywords: ['saison', 'automne', 'hiver', 'printemps', 'été'], priority: 3 },
      { keywords: ['matière', 'matériau', 'propriété'], priority: 2 },
      { keywords: ['énergie', 'lumière', 'chaleur', 'force'], priority: 2 },
      { keywords: ['environnement', 'protection', 'responsabilité'], priority: 3 }
    ],
    'Sciences humaines': [
      { keywords: ['communauté', 'école', 'famille', 'quartier'], priority: 3 },
      { keywords: ['identité', 'culture', 'tradition', 'patrimoine'], priority: 3 },
      { keywords: ['citoyen', 'rôle', 'responsabilité'], priority: 2 },
      { keywords: ['diversité', 'respect', 'inclusion'], priority: 2 }
    ],
    'Arts visuels': [
      { keywords: ['créer', 'création', 'œuvre', 'artistique'], priority: 3 },
      { keywords: ['couleur', 'forme', 'ligne', 'texture'], priority: 3 },
      { keywords: ['technique', 'matériau', 'outil'], priority: 2 },
      { keywords: ['expression', 'sentiment', 'émotion'], priority: 2 }
    ],
    'Formation personnelle et sociale': [
      { keywords: ['santé', 'corps', 'hygiène', 'sécurité'], priority: 3 },
      { keywords: ['émotion', 'sentiment', 'bien-être'], priority: 3 },
      { keywords: ['ami', 'relation', 'coopération'], priority: 2 },
      { keywords: ['nutrition', 'alimentation', 'exercice'], priority: 2 }
    ]
  };

  // Link expectations to units based on content matching
  for (const unit of units) {
    const unitSubject = unit.longRangePlan?.subject;
    if (!unitSubject) continue;
    
    // Skip if unit already has expectations linked
    if (unit.expectations.length > 0) {
      console.log(`⏭️  ${unit.title}: Already has ${unit.expectations.length} expectations`);
      continue;
    }

    const subjectExpectations = expectationsBySubject[unitSubject] || [];
    if (subjectExpectations.length === 0) {
      console.log(`⚠️  ${unit.title}: No expectations for subject ${unitSubject}`);
      continue;
    }

    // Find matching expectations based on unit content
    const matchingExpectations: Array<{expectation: any, score: number}> = [];
    
    for (const expectation of subjectExpectations) {
      let score = 0;
      const unitContent = `${unit.title} ${unit.description || ''} ${unit.keyVocabulary || ''} ${unit.crossCurricularConnections || ''}`.toLowerCase();
      
      // Check against linking rules
      const rules = linkingRules[unitSubject] || [];
      for (const rule of rules) {
        for (const keyword of rule.keywords) {
          if (unitContent.includes(keyword.toLowerCase()) || 
              expectation.description.toLowerCase().includes(keyword.toLowerCase())) {
            score += rule.priority;
          }
        }
      }
      
      // Additional scoring based on description matching
      const expectationWords = expectation.description.toLowerCase().split(' ');
      const unitWords = unitContent.split(' ');
      
      for (const word of expectationWords) {
        if (word.length > 4 && unitWords.includes(word)) {
          score += 1;
        }
      }
      
      if (score > 0) {
        matchingExpectations.push({ expectation, score });
      }
    }

    // Sort by score and take top matches
    matchingExpectations.sort((a, b) => b.score - a.score);
    const topMatches = matchingExpectations.slice(0, 3); // Link up to 3 expectations per unit

    // If no matches found, link the most general expectations for the subject
    if (topMatches.length === 0 && subjectExpectations.length > 0) {
      // Find the most fundamental expectations (usually numbered .1)
      const fundamentalExpectations = subjectExpectations.filter(e => e.code.endsWith('.1'));
      if (fundamentalExpectations.length > 0) {
        topMatches.push({ 
          expectation: fundamentalExpectations[0],
          score: 0 
        });
      } else {
        topMatches.push({ 
          expectation: subjectExpectations[0],
          score: 0 
        });
      }
    }

    // Create the links
    for (const match of topMatches) {
      try {
        // Check if link already exists to avoid duplicates
        const existingLink = await prisma.unitPlanExpectation.findUnique({
          where: {
            unitPlanId_expectationId: {
              unitPlanId: unit.id,
              expectationId: match.expectation.id
            }
          }
        });

        if (!existingLink) {
          await prisma.unitPlanExpectation.create({
            data: {
              unitPlanId: unit.id,
              expectationId: match.expectation.id
            }
          });
          
          linked++;
          console.log(`✅ Linked ${unit.title}: ${match.expectation.code} (score: ${match.score})`);
        }
      } catch (error) {
        console.error(`❌ Failed to link ${unit.title} to ${match.expectation.code}:`, error);
      }
    }
  }

  // Check final coverage
  const finalCoverage = await prisma.unitPlan.findMany({
    where: { userId: emily.id },
    select: {
      expectations: {
        select: {
          expectationId: true
        }
      }
    }
  });
  
  const uniqueExpectationIds = new Set();
  finalCoverage.forEach(unit => {
    unit.expectations.forEach(exp => {
      uniqueExpectationIds.add(exp.expectationId);
    });
  });

  console.log(`\n📊 RESULTS:`);
  console.log(`New links created: ${linked}`);
  console.log(`Total unique expectations now covered: ${uniqueExpectationIds.size}/${expectations.length}`);
  console.log(`Coverage: ${Math.round((uniqueExpectationIds.size / expectations.length) * 100)}%`);

  await prisma.$disconnect();
  
  return {
    linked,
    totalExpectations: expectations.length,
    uniqueCoverage: uniqueExpectationIds.size
  };
}

linkUnitExpectations()
  .then((result) => {
    console.log(`\n✅ Unit expectation linking complete: ${result.linked} new links`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Linking failed:', error);
    process.exit(1);
  });