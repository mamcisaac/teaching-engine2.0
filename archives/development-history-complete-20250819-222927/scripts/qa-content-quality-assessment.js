// Content Quality and Developmental Appropriateness Assessment
// Examine actual lesson content for Grade 1 appropriateness and differentiation

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${__dirname}/packages/database/prisma/dev.db`
    }
  }
});

async function main() {
  console.log('\n🔍 CONTENT QUALITY & DEVELOPMENTAL APPROPRIATENESS ASSESSMENT');
  console.log('==============================================================\n');

  try {
    const emily = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { contains: 'emily' } },
          { name: { contains: 'Emily' } }
        ]
      }
    });

    if (!emily) {
      const allUsers = await prisma.user.findMany();
      emily = allUsers[0];
    }

    // Sample lessons from each subject for detailed content analysis
    const subjects = [
      'Français (Immersion)',
      'Mathématiques',
      'Sciences de la nature', 
      'Sciences humaines',
      'Arts visuels',
      'Formation personnelle et sociale'
    ];

    for (const subject of subjects) {
      console.log(`\n${'='.repeat(70)}`);
      console.log(`📚 ${subject.toUpperCase()} - CONTENT ANALYSIS`);
      console.log(`${'='.repeat(70)}`);

      // Get sample lessons
      const sampleLessons = await prisma.eTFOLessonPlan.findMany({
        where: {
          userId: emily.id,
          unitPlan: {
            longRangePlan: {
              subject: subject
            }
          }
        },
        include: {
          unitPlan: {
            include: {
              longRangePlan: true
            }
          }
        },
        take: 2
      });

      if (sampleLessons.length === 0) {
        console.log(`❌ No lessons found for ${subject}`);
        continue;
      }

      for (let i = 0; i < sampleLessons.length; i++) {
        const lesson = sampleLessons[i];
        console.log(`\n📝 LESSON ${i + 1}: ${lesson.title}`);
        console.log(`Duration: ${lesson.duration} minutes`);
        console.log(`Date: ${new Date(lesson.date).toLocaleDateString()}`);

        // Analyze Minds On for Grade 1 appropriateness
        console.log(`\n🧠 MINDS ON ANALYSIS:`);
        if (lesson.mindsOn) {
          console.log(`Content Length: ${lesson.mindsOn.length} characters`);
          console.log(`Content Sample: "${lesson.mindsOn.substring(0, 200)}..."`);
          
          // Check for Grade 1 indicators
          const grade1Indicators = {
            'interactive': /(song|game|hands-on|movement|gesture|show and tell|circle time)/i.test(lesson.mindsOn),
            'visual': /(picture|visual|card|poster|chart|color)/i.test(lesson.mindsOn),
            'short_activities': /(2 min|3 min|1 min|quick|brief)/i.test(lesson.mindsOn),
            'engaging': /(fun|exciting|explore|discover|play)/i.test(lesson.mindsOn)
          };
          
          console.log(`Grade 1 Appropriateness Indicators:`);
          Object.entries(grade1Indicators).forEach(([indicator, present]) => {
            console.log(`  ${indicator}: ${present ? '✅' : '❌'}`);
          });
        }

        // Analyze Action for hands-on learning
        console.log(`\n🎯 ACTION ANALYSIS:`);
        if (lesson.action) {
          console.log(`Content Length: ${lesson.action.length} characters`);
          console.log(`Content Sample: "${lesson.action.substring(0, 200)}..."`);
          
          const actionQuality = {
            'scaffolded_instruction': /(direct instruction|guided practice|independent)/i.test(lesson.action),
            'hands_on': /(manipulative|concrete|touch|build|create|draw)/i.test(lesson.action),
            'collaborative': /(partner|group|peer|together|share)/i.test(lesson.action),
            'differentiated': /(choice|level|support|challenge|accommodate)/i.test(lesson.action),
            'age_appropriate': /(6.year|grade 1|simple|basic|beginning)/i.test(lesson.action)
          };
          
          console.log(`Action Quality Indicators:`);
          Object.entries(actionQuality).forEach(([indicator, present]) => {
            console.log(`  ${indicator}: ${present ? '✅' : '❌'}`);
          });
        }

        // Analyze Consolidation for reflection
        console.log(`\n🤔 CONSOLIDATION ANALYSIS:`);
        if (lesson.consolidation) {
          console.log(`Content Length: ${lesson.consolidation.length} characters`);
          console.log(`Content Sample: "${lesson.consolidation.substring(0, 150)}..."`);
          
          const consolidationQuality = {
            'reflection': /(reflect|think|share|discuss|what did you learn)/i.test(lesson.consolidation),
            'summary': /(review|remember|today we|what we learned)/i.test(lesson.consolidation),
            'connection': /(tomorrow|next|connect|relate|apply)/i.test(lesson.consolidation),
            'celebration': /(celebrate|proud|great job|well done)/i.test(lesson.consolidation)
          };
          
          console.log(`Consolidation Quality Indicators:`);
          Object.entries(consolidationQuality).forEach(([indicator, present]) => {
            console.log(`  ${indicator}: ${present ? '✅' : '❌'}`);
          });
        }

        // Check differentiation data
        console.log(`\n🎨 DIFFERENTIATION ANALYSIS:`);
        const diffFields = [
          'accommodations',
          'modifications', 
          'extensions',
          'differentiationStrategies'
        ];
        
        diffFields.forEach(field => {
          if (lesson[field]) {
            console.log(`  ${field}: ✅ Present`);
            try {
              const data = JSON.parse(lesson[field]);
              if (typeof data === 'object') {
                console.log(`    Categories: ${Object.keys(data).length}`);
              }
            } catch (e) {
              console.log(`    Format: Raw text`);
            }
          } else {
            console.log(`  ${field}: ❌ Missing`);
          }
        });
      }

      // Unit-level analysis
      console.log(`\n\n🏗️ UNIT-LEVEL QUALITY ANALYSIS`);
      console.log('==============================');

      const unitPlan = await prisma.unitPlan.findFirst({
        where: {
          userId: emily.id,
          longRangePlan: {
            subject: subject
          }
        }
      });

      if (unitPlan) {
        console.log(`Sample Unit: ${unitPlan.title}`);
        
        // Analyze big ideas for grade 1
        if (unitPlan.bigIdeas) {
          console.log(`\n📋 Big Ideas Analysis:`);
          console.log(`Length: ${unitPlan.bigIdeas.length} characters`);
          console.log(`Content: "${unitPlan.bigIdeas.substring(0, 300)}..."`);
          
          const bigIdeasQuality = {
            'age_appropriate': /(simple|basic|explore|discover|learn about)/i.test(unitPlan.bigIdeas),
            'concrete': /(see|touch|feel|hear|experience|real|everyday)/i.test(unitPlan.bigIdeas),
            'relevant': /(my|our|home|school|family|community)/i.test(unitPlan.bigIdeas)
          };
          
          console.log(`Grade 1 Appropriateness:`);
          Object.entries(bigIdeasQuality).forEach(([indicator, present]) => {
            console.log(`  ${indicator}: ${present ? '✅' : '❌'}`);
          });
        }

        // Analyze essential questions
        if (unitPlan.essentialQuestions) {
          try {
            const questions = JSON.parse(unitPlan.essentialQuestions);
            console.log(`\n❓ Essential Questions Analysis:`);
            console.log(`Number of Questions: ${questions.length}`);
            
            if (questions.length > 0) {
              console.log(`Sample Question: "${questions[0]}"`);
              
              const questionQuality = {
                'open_ended': /\?(.*how|what|why|when|where)/i.test(questions[0]),
                'age_appropriate': /(simple|my|our|can|do|will)/i.test(questions[0]),
                'engaging': /(discover|explore|find|learn|see)/i.test(questions[0])
              };
              
              console.log(`Question Quality:`);
              Object.entries(questionQuality).forEach(([indicator, present]) => {
                console.log(`  ${indicator}: ${present ? '✅' : '❌'}`);
              });
            }
          } catch (e) {
            console.log(`Essential Questions: Present (parsing error)`);
          }
        }

        // Cultural connections analysis
        console.log(`\n🌍 CULTURAL CONNECTIONS ANALYSIS:`);
        const culturalFields = ['indigenousPerspectives', 'communityConnections'];
        culturalFields.forEach(field => {
          if (unitPlan[field]) {
            console.log(`${field}: ✅ Present`);
            console.log(`  Content: "${unitPlan[field].substring(0, 200)}..."`);
            
            // Check for authenticity indicators
            const authenticityChecks = {
              'respectful': /(respect|honor|acknowledge|appreciate)/i.test(unitPlan[field]),
              'specific': /(Mi.kmaq|First Nations|Indigenous|local|community)/i.test(unitPlan[field]),
              'meaningful': /(story|tradition|practice|knowledge|wisdom)/i.test(unitPlan[field])
            };
            
            console.log(`  Authenticity Indicators:`);
            Object.entries(authenticityChecks).forEach(([indicator, present]) => {
              console.log(`    ${indicator}: ${present ? '✅' : '❌'}`);
            });
          } else {
            console.log(`${field}: ❌ Missing`);
          }
        });
      }
    }

    // OVERALL DEVELOPMENTAL APPROPRIATENESS SUMMARY
    console.log(`\n\n${'='.repeat(70)}`);
    console.log(`🎯 OVERALL DEVELOPMENTAL APPROPRIATENESS SUMMARY`);
    console.log(`${'='.repeat(70)}`);

    // Get lesson count and duration stats
    const allLessons = await prisma.eTFOLessonPlan.findMany({
      where: { userId: emily.id }
    });

    const durationStats = allLessons.reduce((stats, lesson) => {
      stats.total += lesson.duration;
      stats.count++;
      if (lesson.duration <= 45) stats.appropriate++;
      if (lesson.duration > 60) stats.tooLong++;
      return stats;
    }, { total: 0, count: 0, appropriate: 0, tooLong: 0 });

    console.log(`\n⏱️ DURATION APPROPRIATENESS:`);
    console.log(`Total Lessons: ${durationStats.count}`);
    console.log(`Average Duration: ${Math.round(durationStats.total / durationStats.count)} minutes`);
    console.log(`45 minutes or less: ${durationStats.appropriate} (${Math.round(durationStats.appropriate/durationStats.count*100)}%)`);
    console.log(`Over 60 minutes: ${durationStats.tooLong} (${Math.round(durationStats.tooLong/durationStats.count*100)}%)`);
    console.log(`Duration Appropriateness: ${durationStats.tooLong === 0 ? '✅ Excellent' : '⚠️ Some lessons too long'}`);

    // Academic year timing
    const firstLesson = await prisma.eTFOLessonPlan.findFirst({
      where: { userId: emily.id },
      orderBy: { date: 'asc' }
    });
    
    const lastLesson = await prisma.eTFOLessonPlan.findFirst({
      where: { userId: emily.id },
      orderBy: { date: 'desc' }
    });

    if (firstLesson && lastLesson) {
      const startDate = new Date(firstLesson.date);
      const endDate = new Date(lastLesson.date);
      const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      const totalWeeks = Math.ceil(totalDays / 7);

      console.log(`\n📅 ACADEMIC YEAR COVERAGE:`);
      console.log(`Start Date: ${startDate.toLocaleDateString()}`);
      console.log(`End Date: ${endDate.toLocaleDateString()}`);
      console.log(`Total Coverage: ${totalWeeks} weeks`);
      console.log(`School Year Appropriateness: ${totalWeeks >= 36 && totalWeeks <= 42 ? '✅ Perfect' : '⚠️ Review needed'}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);