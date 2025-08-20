import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixCriticalUnitIssues() {
  console.log('🔧 FIXING CRITICAL UNIT PLAN ISSUES FOR TRUE PERFECTION\n');
  console.log('═'.repeat(80));
  
  try {
    // STEP 1: Complete missing vocabulary fields
    console.log('📝 STEP 1: COMPLETING MISSING VOCABULARY FIELDS\n');
    
    const vocabularyData = {
      'Mon corps et ma sécurité': [
        {"word": "corps", "definition": "toutes les parties physiques de notre être", "category": "anatomie", "grade_level": "1"},
        {"word": "sécurité", "definition": "être protégé du danger", "category": "bien-être", "grade_level": "1"},
        {"word": "danger", "definition": "quelque chose qui peut nous blesser", "category": "sécurité", "grade_level": "1"},
        {"word": "règles", "definition": "instructions à suivre pour être en sécurité", "category": "sécurité", "grade_level": "1"},
        {"word": "propre", "definition": "sans saleté, lavé", "category": "hygiène", "grade_level": "1"}
      ],
      'Mes émotions et sentiments': [
        {"word": "émotions", "definition": "ce que nous ressentons dans notre cœur", "category": "sentiments", "grade_level": "1"},
        {"word": "content", "definition": "sentiment de joie et bonheur", "category": "sentiments", "grade_level": "1"},
        {"word": "triste", "definition": "sentiment de peine ou chagrin", "category": "sentiments", "grade_level": "1"},
        {"word": "calme", "definition": "sentiment de paix et tranquillité", "category": "sentiments", "grade_level": "1"},
        {"word": "respirer", "definition": "prendre de l'air pour se calmer", "category": "stratégies", "grade_level": "1"}
      ],
      'Amitiés et relations positives': [
        {"word": "ami", "definition": "personne qu'on aime et qui nous aime", "category": "relations", "grade_level": "1"},
        {"word": "gentil", "definition": "qui est bon et aimable avec les autres", "category": "qualités", "grade_level": "1"},
        {"word": "partager", "definition": "donner une partie de ce qu'on a", "category": "actions", "grade_level": "1"},
        {"word": "écouter", "definition": "faire attention à ce que dit quelqu'un", "category": "actions", "grade_level": "1"},
        {"word": "respecter", "definition": "traiter les autres avec politesse", "category": "valeurs", "grade_level": "1"}
      ],
      'Nutrition et mode de vie sain': [
        {"word": "nutrition", "definition": "bien manger pour être en santé", "category": "santé", "grade_level": "1"},
        {"word": "légumes", "definition": "plantes qu'on mange pour être fort", "category": "aliments", "grade_level": "1"},
        {"word": "fruits", "definition": "aliments sucrés qui poussent sur les arbres", "category": "aliments", "grade_level": "1"},
        {"word": "exercice", "definition": "bouger son corps pour être en forme", "category": "activité", "grade_level": "1"},
        {"word": "sommeil", "definition": "dormir pour reposer notre corps", "category": "bien-être", "grade_level": "1"}
      ]
    };
    
    // Find units missing vocabulary
    const incompleteUnits = await prisma.unitPlan.findMany({
      where: {
        longRangePlan: {
          subject: { contains: 'Formation personnelle' },
          userId: 23
        },
        OR: [
          { keyVocabulary: null },
          { keyVocabulary: { equals: [] } }
        ]
      }
    });
    
    console.log(\`Found \${incompleteUnits.length} units with missing vocabulary\`);
    
    for (const unit of incompleteUnits) {
      const vocab = vocabularyData[unit.title as keyof typeof vocabularyData];
      
      if (vocab) {
        await prisma.unitPlan.update({
          where: { id: unit.id },
          data: {
            keyVocabulary: vocab as any
          }
        });
        
        console.log(\`✅ Completed vocabulary for: \${unit.title}\`);
      }
    }
    
    // STEP 2: Perfect hour precision for daily subjects
    console.log('\n⚖️ STEP 2: PERFECTING HOUR PRECISION\n');
    
    const dailySubjects = [
      { lrpSubject: 'Français (Immersion)', expectedHours: 146.25 },
      { lrpSubject: 'Mathématiques', expectedHours: 146.25 },
      { lrpSubject: 'Sciences de la nature', expectedHours: 146.25 },
      { lrpSubject: 'Arts visuels', expectedHours: 146.25 }
    ];
    
    for (const subject of dailySubjects) {
      const units = await prisma.unitPlan.findMany({
        where: {
          longRangePlan: {
            subject: { contains: subject.lrpSubject },
            userId: 23
          }
        },
        orderBy: { startDate: 'asc' }
      });
      
      // Perfect distribution for 146.25 hours across 10 units
      // 14.625h per unit = 14.6h base + distribute 0.25h across first 2 units
      const hourDistribution = [14.725, 14.725, 14.6, 14.6, 14.6, 14.6, 14.6, 14.6, 14.6, 14.6];
      
      for (let i = 0; i < units.length && i < hourDistribution.length; i++) {
        const unit = units[i];
        const exactHours = hourDistribution[i];
        
        await prisma.unitPlan.update({
          where: { id: unit.id },
          data: {
            estimatedHours: exactHours
          }
        });
        
        console.log(\`✅ \${subject.lrpSubject} Unit \${i+1}: \${exactHours}h\`);
      }
    }
    
    // STEP 3: Perfect hour precision for alternating subjects
    console.log('\n📚 STEP 3: PERFECTING ALTERNATING SUBJECT HOURS\n');
    
    // Social Studies: 72.75 hours across 5 units
    const ssUnits = await prisma.unitPlan.findMany({
      where: {
        longRangePlan: {
          subject: { contains: 'Sciences humaines' },
          userId: 23
        }
      },
      orderBy: { startDate: 'asc' }
    });
    
    // Perfect distribution: 14.55h per unit = 72.75 / 5
    const ssHourDistribution = [14.55, 14.55, 14.55, 14.55, 14.55];
    
    for (let i = 0; i < ssUnits.length; i++) {
      const unit = ssUnits[i];
      const exactHours = ssHourDistribution[i];
      
      await prisma.unitPlan.update({
        where: { id: unit.id },
        data: {
          estimatedHours: exactHours
        }
      });
      
      console.log(\`✅ Social Studies Unit \${i+1}: \${exactHours}h\`);
    }
    
    // Health/FPS: 73.5 hours across 5 units
    const healthUnits = await prisma.unitPlan.findMany({
      where: {
        longRangePlan: {
          subject: { contains: 'Formation personnelle' },
          userId: 23
        }
      },
      orderBy: { startDate: 'asc' }
    });
    
    // Perfect distribution: 14.7h per unit = 73.5 / 5
    const healthHourDistribution = [14.7, 14.7, 14.7, 14.7, 14.7];
    
    for (let i = 0; i < healthUnits.length; i++) {
      const unit = healthUnits[i];
      const exactHours = healthHourDistribution[i];
      
      await prisma.unitPlan.update({
        where: { id: unit.id },
        data: {
          estimatedHours: exactHours
        }
      });
      
      console.log(\`✅ Health/FPS Unit \${i+1}: \${exactHours}h\`);
    }
    
    // STEP 4: Verification
    console.log('\n🔍 STEP 4: FINAL VERIFICATION\n');
    
    const allLRPs = await prisma.longRangePlan.findMany({
      where: { userId: 23 },
      include: {
        unitPlans: {
          orderBy: { startDate: 'asc' }
        }
      },
      orderBy: { subject: 'asc' }
    });
    
    const expectedTotals = {
      'Arts visuels': 146.25,
      'Français (Immersion)': 146.25,
      'Mathématiques': 146.25,
      'Sciences de la nature': 146.25,
      'Sciences humaines': 72.75,
      'Formation personnelle et sociale': 73.5
    };
    
    let allHoursPerfect = true;
    
    for (const lrp of allLRPs) {
      const totalHours = lrp.unitPlans.reduce((sum, u) => sum + (u.estimatedHours || 0), 0);
      const expected = expectedTotals[lrp.subject] || 0;
      const gap = Math.abs(totalHours - expected);
      
      const status = gap < 0.01 ? '✅' : '❌';
      if (gap >= 0.01) allHoursPerfect = false;
      
      console.log(\`\${status} \${lrp.subject}: \${totalHours}h (expected: \${expected}h, gap: \${gap.toFixed(3)}h)\`);
    }
    
    // Check field completeness
    const allUnits = await prisma.unitPlan.findMany({
      where: {
        longRangePlan: { userId: 23 }
      }
    });
    
    let missingFields = 0;
    for (const unit of allUnits) {
      if (!unit.keyVocabulary || (Array.isArray(unit.keyVocabulary) && unit.keyVocabulary.length === 0)) {
        missingFields++;
        console.log(\`❌ Missing vocabulary: \${unit.title}\`);
      }
    }
    
    console.log('\n' + '═'.repeat(80));
    if (allHoursPerfect && missingFields === 0) {
      console.log('🎉 CRITICAL ISSUES RESOLVED!');
      console.log('✅ Perfect hour precision achieved');
      console.log('✅ 100% field completeness achieved');
      console.log('\n⚠️ NOTE: Alternating schedule date ranges still need compact periods');
      console.log('   (This requires separate date range rewrite)');
    } else {
      console.log('❌ ISSUES REMAIN:');
      if (!allHoursPerfect) console.log('  • Hour precision not achieved');
      if (missingFields > 0) console.log(\`  • \${missingFields} units missing vocabulary\`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixCriticalUnitIssues().catch(console.error);
