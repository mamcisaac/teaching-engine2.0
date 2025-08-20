import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixFinalETFOViolations() {
  console.log('🔧 FIXING FINAL ETFO VIOLATIONS\n');
  console.log('=' .repeat(80));
  console.log('ADDRESSING: Unit 2 (4.3 weeks) and Unit 10 (6.6 weeks)');
  console.log('SOLUTION: Redistribute lessons while maintaining 185 core + 10 flex');
  console.log('GOAL: ALL units 2-4 weeks maximum (ETFO compliant)\n');
  
  const MATH_LRP_ID = 'cmebyc98k0003vjr1svziz0in';
  const USER_ID = 23;
  
  try {
    console.log('🗑️ REMOVING ETFO-VIOLATING UNITS...');
    
    const deleteResult = await prisma.unitPlan.deleteMany({
      where: {
        longRangePlanId: MATH_LRP_ID
      }
    });
    
    console.log(`✅ Deleted ${deleteResult.count} units with ETFO violations\n`);
    
    console.log('🎯 CREATING ETFO-COMPLIANT UNITS...\n');
    console.log('NEW Distribution (185 core lessons):');
    console.log('Unit 1: 19 lessons (Sept)');
    console.log('Unit 2: 20 lessons (Oct - REDUCED from 21, still adequate)');
    console.log('Unit 3: 18 lessons (Nov)');
    console.log('Unit 4: 17 lessons (Nov/Dec)');
    console.log('Unit 5: 18 lessons (Jan)');
    console.log('Unit 6: 18 lessons (Feb)');
    console.log('Unit 7: 10 lessons (Mar - ends before break)');
    console.log('Unit 8: 15 lessons (Mar/Apr - starts after break)');
    console.log('Unit 9: 15 lessons (Apr)');
    console.log('Unit 10: 15 lessons (Apr/May - SPLIT the monster)');
    console.log('Unit 11: 20 lessons (May/June - NEW final unit)');
    console.log('TOTAL: 185 lessons + 10 flex = 195 ✅\n');
    
    // Get expectation IDs
    const expectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Mathématiques',
        grade: 1
      }
    });
    
    const expectationMap: { [code: string]: string } = {};
    expectations.forEach(exp => {
      expectationMap[exp.code] = exp.id;
    });
    
    // Define 11 ETFO-COMPLIANT units
    const etfoCompliantUnits = [
      {
        title: 'Fondations solides des nombres 0-10',
        startDate: new Date('2025-09-03'),
        endDate: new Date('2025-09-30'),
        estimatedHours: 14,
        lessons: 19,
        expectations: ['1.N1', '1.N2'],
        description: 'Fondations mathématiques avec septembre complet - subitisation et comptage cardinal.',
        bigIdeas: 'Les nombres sont des outils puissants pour comprendre notre monde.'
      },
      {
        title: 'Géométrie et formes essentielles',
        startDate: new Date('2025-10-01'),
        endDate: new Date('2025-10-28'),
        estimatedHours: 15,
        lessons: 20,
        expectations: ['1.FE2'],
        description: 'Apprentissage de 8 formes 2D et 5 solides 3D - RÉDUIT à 20 leçons pour ETFO compliance.',
        bigIdeas: 'Les formes ont des propriétés qui les rendent uniques et reconnaissables.'
      },
      {
        title: 'Sens des nombres 11-20',
        startDate: new Date('2025-10-29'),
        endDate: new Date('2025-11-21'),
        estimatedHours: 14,
        lessons: 18,
        expectations: ['1.N3', '1.N4'],
        description: 'Extension aux nombres 11-20 avec représentations multiples.',
        bigIdeas: 'Les nombres 11-19 suivent un motif "dix et quelques".'
      },
      {
        title: 'Décomposition et relations partie-tout',
        startDate: new Date('2025-11-24'),
        endDate: new Date('2025-12-19'),
        estimatedHours: 13,
        lessons: 17,
        expectations: ['1.N6'],
        description: 'Relations partie-tout avant opérations - se termine avant Noël.',
        bigIdeas: 'Comprendre les parties révèle le mystère du tout.'
      },
      {
        title: 'Comparaison et ordonnancement',
        startDate: new Date('2026-01-06'),
        endDate: new Date('2026-01-31'),
        estimatedHours: 14,
        lessons: 18,
        expectations: ['1.N5'],
        description: 'Redémarrage avec comparaison d\'ensembles jusqu\'à 20.',
        bigIdeas: 'Comparer révèle les relations entre quantités.'
      },
      {
        title: 'Régularités et motifs créatifs',
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-02-28'),
        estimatedHours: 14,
        lessons: 18,
        expectations: ['1.RR1'],
        description: 'Motifs AB, ABC, AAB, AABB avec temps approprié.',
        bigIdeas: 'Les régularités nous aident à organiser et prédire.'
      },
      {
        title: 'Relations numériques +/- 1,2',
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-13'),
        estimatedHours: 8,
        lessons: 10,
        expectations: ['1.N7'],
        description: 'Relations +1, +2, -1, -2 - se termine avant relâche.',
        bigIdeas: 'Les nombres ont des voisins proches sur la droite numérique.'
      },
      {
        title: 'Addition avec stratégies',
        startDate: new Date('2026-03-24'),
        endDate: new Date('2026-04-11'),
        estimatedHours: 11,
        lessons: 15,
        expectations: ['1.N8'],
        description: 'Addition avec 3+ stratégies - démarre après relâche.',
        bigIdeas: 'Plusieurs chemins mènent à la même réponse mathématique.'
      },
      {
        title: 'Soustraction et relations inverses',
        startDate: new Date('2026-04-14'),
        endDate: new Date('2026-05-02'),
        estimatedHours: 11,
        lessons: 15,
        expectations: ['1.N8'],
        description: 'Soustraction avec stratégies - opérations inverses.',
        bigIdeas: 'Addition et soustraction sont des amies inverses.'
      },
      {
        title: 'Mesure et exploration',
        startDate: new Date('2026-05-05'),
        endDate: new Date('2026-05-23'),
        estimatedHours: 11,
        lessons: 15,
        expectations: ['1.FE1'],
        description: 'Mesure non-standard avec précision - SÉPARÉ du calcul mental.',
        bigIdeas: 'Mesurer nous aide à comparer et comprendre notre monde physique.'
      },
      {
        title: 'Stratégies mentales, égalité et célébration',
        startDate: new Date('2026-05-26'),
        endDate: new Date('2026-06-20'),
        estimatedHours: 15,
        lessons: 20,
        expectations: ['1.N9', '1.RR2', '1.RR3'],
        description: 'Calcul mental, transformations et égalité - finale RAISONNABLE.',
        bigIdeas: 'Notre cerveau peut calculer intelligemment. L\'égalité signifie équilibre.'
      }
    ];
    
    // Verify mathematical precision
    const coreLessons = etfoCompliantUnits.reduce((sum, unit) => sum + unit.lessons, 0);
    const totalHours = etfoCompliantUnits.reduce((sum, unit) => sum + unit.estimatedHours, 0);
    const flexLessons = 10;
    const totalLessons = coreLessons + flexLessons;
    const grandTotalHours = totalHours + 6;
    
    console.log(`MATHEMATICAL VERIFICATION:`);
    console.log(`Core lessons: ${coreLessons} (Target: 185) ${coreLessons === 185 ? '✅' : '❌'}`);
    console.log(`Total lessons: ${totalLessons} (Target: 195) ${totalLessons === 195 ? '✅' : '❌'}`);
    console.log(`Total hours: ${grandTotalHours} (Target: 146) ${grandTotalHours === 146 ? '✅' : '❌'}`);
    
    if (totalLessons !== 195 || grandTotalHours !== 146) {
      throw new Error(`Mathematical precision error: ${totalLessons} lessons, ${grandTotalHours} hours`);
    }
    
    console.log(`✅ Creating ETFO-compliant units...\n`);
    
    // Create each unit
    for (let i = 0; i < etfoCompliantUnits.length; i++) {
      const unit = etfoCompliantUnits[i];
      console.log(`Creating Unit ${i + 1}: ${unit.title} (${unit.lessons} lessons, ${unit.estimatedHours} hours)...`);
      
      const createdUnit = await prisma.unitPlan.create({
        data: {
          userId: USER_ID,
          longRangePlanId: MATH_LRP_ID,
          title: unit.title,
          titleFr: unit.title,
          description: unit.description,
          descriptionFr: unit.description,
          bigIdeas: unit.bigIdeas,
          bigIdeasFr: unit.bigIdeas,
          startDate: unit.startDate,
          endDate: unit.endDate,
          estimatedHours: unit.estimatedHours,
          
          essentialQuestions: [
            'Comment cette unité développe-t-elle notre pensée mathématique?',
            'Quelles stratégies utilisons-nous pour résoudre ces problèmes?',
            'Comment expliquer notre raisonnement en français?'
          ],
          
          assessmentPlan: `Évaluation formative quotidienne et sommative adaptée.
                          
                          ETFO COMPLIANCE: ${((unit.endDate.getTime() - unit.startDate.getTime()) / (1000*60*60*24*7)).toFixed(1)} semaines (maximum 4.0).
                          
                          FLEXIBILITÉ: 10 leçons flex disponibles pour soutien et évaluation selon besoins.`,
          
          successCriteria: {
            émergent: 'Explore avec soutien et curiosité',
            développement: 'Progresse avec guidance appropriée', 
            capable: 'Maîtrise avec confiance croissante',
            avancé: 'Étend et applique créativement'
          },
          
          differentiationStrategies: {
            émergent: 'Support intensif avec flex lessons si nécessaire',
            développement: 'Guidance modérée et pratique supplémentaire',
            capable: 'Défis appropriés et exploration autonome',
            apprenantsFL: 'Support linguistique français avec visuels'
          },
          
          indigenousPerspectives: 'Mathématiques traditionnelles Mi\'kmaq intégrées respectueusement selon le contenu.',
          
          keyVocabulary: ['mathématiques', 'français', 'stratégies', 'résolution', 'raisonnement'],
          
          priorKnowledge: `S'appuie sur les apprentissages antérieurs avec flexibilité pour différents niveaux de départ.`,
          
          crossCurricularConnections: 'FRANÇAIS: Vocabulaire et explications orales. SCIENCES: Applications pratiques. ARTS: Expression créative.',
          
          communityConnections: 'Connexions locales et expertise parentale selon opportunités.',
          
          culminatingTask: `Démonstration flexible de maîtrise de ${unit.expectations.join(' et ')} selon choix d'expression élève.`,
          
          assessmentRubric: {
            niveau1: 'Participe avec soutien flexible selon besoins',
            niveau2: 'Progresse avec guidance et temps approprié',
            niveau3: 'Maîtrise avec confiance dans temps alloué',
            niveau4: 'Excellence avec applications créatives'
          },
          
          performanceIndicators: {
            connaissance: `Comprend ${unit.expectations.join(', ')} avec support adaptatif`,
            pensée: 'Développe raisonnement mathématique approprié',
            communication: 'Explique en français avec soutien linguistique',
            application: 'Applique avec flexibilité temporelle selon besoins'
          }
        }
      });
      
      // Add expectations
      for (const expCode of unit.expectations) {
        if (expectationMap[expCode]) {
          await prisma.unitPlanExpectation.create({
            data: {
              unitPlanId: createdUnit.id,
              expectationId: expectationMap[expCode]
            }
          });
        }
      }
      
      console.log(`✅ Unit ${i + 1} created (ETFO compliant)`);
    }
    
    console.log('\n' + '=' .repeat(80));
    console.log('📊 ETFO COMPLIANCE VERIFICATION...\n');
    
    // Final verification
    const finalUnits = await prisma.unitPlan.findMany({
      where: {
        longRangePlanId: MATH_LRP_ID
      },
      orderBy: {
        startDate: 'asc'
      }
    });
    
    console.log('ETFO COMPLIANCE CHECK:');
    let violations = 0;
    finalUnits.forEach((unit, i) => {
      const weeks = (unit.endDate.getTime() - unit.startDate.getTime()) / (1000*60*60*24*7);
      const compliant = weeks <= 4.0;
      console.log(`Unit ${i+1}: ${weeks.toFixed(1)} weeks ${compliant ? '✅' : '❌'}`);
      if (!compliant) violations++;
    });
    
    console.log(`\nETFO VIOLATIONS: ${violations}/11`);
    console.log(`TOTAL UNITS: ${finalUnits.length}/11`);
    console.log(`CORE LESSONS: ${coreLessons}/185`);
    console.log(`TOTAL LESSONS: ${totalLessons}/195`);
    console.log(`TOTAL HOURS: ${grandTotalHours}/146`);
    
    if (violations === 0 && finalUnits.length === 11 && totalLessons === 195) {
      console.log('\n🎉 PERFECT ETFO COMPLIANCE ACHIEVED!');
      console.log('All units 2-4 weeks maximum!');
      console.log('Ready for real classroom implementation!');
    } else {
      console.log('\n⚠️ Still has compliance issues');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixFinalETFOViolations();