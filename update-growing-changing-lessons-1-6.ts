#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateGrowingChangingLessons1to6() {
  console.log('🔬 Updating Growing and Changing unit lessons 1-6 with safety protocols and comprehensive enhancements...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found.');
    }
    
    // Get the Growing and Changing unit plan
    const growthUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        titleFr: 'Grandir et changer'
      }
    });
    
    if (!growthUnit) {
      throw new Error('Growing and Changing unit plan not found.');
    }
    
    // Get lessons 1-6 for this unit
    const lessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        unitPlanId: growthUnit.id
      },
      orderBy: {
        date: 'asc'
      },
      take: 6
    });
    
    console.log(`📚 Found ${lessons.length} lessons to update (1-6):\n`);
    
    // Safety protocols to add to ALL lessons
    const baseSafetyProtocols = [
      '🔍 PRE-ACTIVITY ALLERGY CHECK: Verify student allergy lists before any plant/soil contact',
      '🧼 MANDATORY HANDWASHING: Before and after all plant/soil handling activities',
      '🌱 SOIL SAFETY: No soil ingestion - constant supervision during soil handling',
      '☘️ PLANT IDENTIFICATION: Only use verified non-toxic plants - check PEI poisonous plant list',
      '🌾 SEED SAFETY: Monitor for choking hazards with small seeds (supervision under age 7)',
      '🧤 PROTECTIVE EQUIPMENT: Optional gardening gloves available for sensitive students',
      '☀️ SUN PROTECTION: Sunscreen and hats for outdoor planting activities',
      '💧 WATER SAFETY: Supervised water use, no standing water, immediate cleanup of spills',
      '🚨 EPIPEN AWARENESS: Location of EpiPens clearly posted, staff trained in emergency procedures',
      '📋 PARENT NOTIFICATION: Inform families 48 hours before plant/soil activities',
      '🏥 ALTERNATIVE ACTIVITIES: Non-allergenic alternatives ready for affected students',
      '🔬 TOOL SAFETY: Age-appropriate garden tools only, proper handling instruction'
    ];
    
    const allergyManagementProcedures = [
      '📝 Pre-lesson allergy verification from student health records',
      '🚫 Immediate removal from plant/soil contact for allergic students',
      '📱 Parent contact for any allergic reactions or concerns',
      '🏥 School nurse notification before plant activities',
      '🔄 Alternative observation and recording activities for allergic students',
      '🧴 Emergency allergy medications readily accessible',
      '👥 Buddy system for students with severe allergies',
      '📋 Documentation of any allergic incidents for health records'
    ];
    
    // French vocabulary by lesson type
    const frenchVocabularyByTopic = {
      lifeCycles: ['cycle de vie', 'grandir', 'changer', 'naître', 'vivre', 'reproduire'],
      plantGrowth: ['plante', 'graine', 'racine', 'tige', 'feuille', 'fleur', 'pousser'],
      animalDevelopment: ['animal', 'bébé', 'petit', 'adulte', 'développer', 'soigner'],
      humanGrowth: ['humain', 'enfant', 'grandir', 'mesurer', 'comparer', 'santé'],
      seedsGermination: ['graine', 'germer', 'planter', 'arroser', 'terre', 'lumière'],
      observations: ['observer', 'regarder', 'mesurer', 'noter', 'comparer', 'découvrir']
    };
    
    // Update each lesson with comprehensive enhancements
    let updatedCount = 0;
    
    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      const lessonNumber = i + 1;
      
      console.log(`\n🔄 Updating Lesson ${lessonNumber}: ${lesson.title}`);
      
      // Determine French vocabulary based on lesson title
      let frenchVocab = [];
      if (lesson.title.includes('Life Cycles')) {
        frenchVocab = frenchVocabularyByTopic.lifeCycles;
      } else if (lesson.title.includes('Plant')) {
        frenchVocab = frenchVocabularyByTopic.plantGrowth;
      } else if (lesson.title.includes('Animal')) {
        frenchVocab = frenchVocabularyByTopic.animalDevelopment;
      } else if (lesson.title.includes('Human')) {
        frenchVocab = frenchVocabularyByTopic.humanGrowth;
      } else if (lesson.title.includes('Seed')) {
        frenchVocab = frenchVocabularyByTopic.seedsGermination;
      } else {
        frenchVocab = frenchVocabularyByTopic.observations;
      }
      
      // Generate French title
      const frenchTitles = {
        'Growing & Changing: Life Cycles': 'Grandir et changer : Cycles de vie',
        'Growth Science: Plant Life Cycles': 'Sciences croissance : Cycles vie plantes',
        'Growing & Changing: Plant Growth': 'Grandir et changer : Croissance plantes',
        'Growth Science: Animal Life Cycles': 'Sciences croissance : Cycles vie animaux',
        'Growing & Changing: Animal Development': 'Grandir et changer : Développement animaux',
        'Growth Science: Seed Germination': 'Sciences croissance : Germination graines'
      };
      
      const titleFr = frenchTitles[lesson.title] || `Sciences croissance : Leçon ${lessonNumber}`;
      
      // Create enhanced action section with safety protocols
      const enhancedAction = `
🔬 SCIENCE LEARNING ACTIVITIES:
${lesson.action || 'Investigate growth and development through hands-on exploration'}

🛡️ MANDATORY SAFETY PROTOCOLS:
${baseSafetyProtocols.join('\n')}

🚨 ALLERGY MANAGEMENT PROCEDURES:
${allergyManagementProcedures.join('\n')}

📓 SCIENCE JOURNAL INTEGRATION:
• Daily growth observations with measurements and drawings
• Hypothesis formation about growth patterns
• Photo documentation of changes over time
• Vocabulary recording in both English and French
• Reflection on scientific discoveries

🇫🇷 FRENCH VOCABULARY FOCUS:
${frenchVocab.join(', ')}

🧪 MATERIALS LIST (INCLUDING SAFETY EQUIPMENT):
• Non-toxic plants and seeds (verified safe list)
• Sterilized soil and planting containers
• Measuring tools (rulers, tape measures)
• Magnifying glasses for detailed observation
• Science journals and recording sheets
• Digital cameras for documentation
• Hand washing station setup
• Disposable gloves (optional)
• First aid kit accessible
• Allergy emergency contact list
• French vocabulary cards
• Alternative activities for allergic students`;
      
      // Create observable assessment criteria with safety checkboxes
      const assessmentNotes = `
🎯 GROWTH LEARNING ASSESSMENT:
□ Demonstrates understanding of growth concepts
□ Uses appropriate scientific vocabulary (English & French)
□ Makes accurate observations and measurements
□ Records findings in science journal
□ Collaborates effectively in investigations

🛡️ SAFETY COMPLIANCE ASSESSMENT:
□ Follows all plant/soil handling safety protocols
□ Properly washes hands before and after activities
□ Uses tools safely and appropriately
□ Reports any allergic reactions immediately
□ Demonstrates care for living things
□ Keeps work area clean and organized

🇫🇷 FRENCH INTEGRATION ASSESSMENT:
□ Uses French growth vocabulary correctly
□ Describes observations in simple French
□ Shows enthusiasm for bilingual science learning

📝 Observable Indicators:
- Active participation in growth investigations
- Accurate use of measurement tools
- Respect for safety protocols
- Positive interaction with plants and soil (when safe)
- Clear communication of scientific discoveries`;
      
      // Update the lesson with comprehensive enhancements
      await prisma.eTFOLessonPlan.update({
        where: { id: lesson.id },
        data: {
          titleFr: titleFr,
          action: enhancedAction,
          assessmentNotes: assessmentNotes,
          
          // Add comprehensive materials list
          materials: JSON.stringify([
            'NON-TOXIC PLANTS (verified safe for Grade 1)',
            'STERILIZED SOIL in sealed containers',
            'SEEDS (age-appropriate size - no choking hazards)',
            'MEASUREMENT TOOLS (rulers, measuring tape)',
            'MAGNIFYING GLASSES (plastic, unbreakable)',
            'SCIENCE JOURNALS for growth tracking',
            'DIGITAL CAMERAS for documentation',
            'HAND WASHING STATION (soap, towels)',
            'DISPOSABLE GLOVES (optional, various sizes)',
            'FIRST AID KIT readily accessible',
            'ALLERGY EMERGENCY CONTACT LIST posted',
            'FRENCH VOCABULARY CARDS with visuals',
            'ALTERNATIVE ACTIVITIES for allergic students',
            'WATERPROOF TABLE COVERINGS',
            'PLASTIC CONTAINERS for plant observations',
            'WATERING BOTTLES with controlled flow',
            'PAPER TOWELS for cleanup',
            'GERMINATION TRACKING CHARTS'
          ]),
          
          // Enhanced accommodations including allergy alternatives
          accommodations: JSON.stringify([
            'Visual growth charts and observation guides',
            'ALLERGY-FREE observation activities for affected students',
            'Picture-based recording options',
            'Partner support for measurements',
            'Extended time for detailed observations',
            'Multiple ways to demonstrate understanding',
            'Sensory-friendly tools and materials',
            'Wheelchair accessible planting stations',
            'Large-print observation sheets',
            'Audio descriptions of visual phenomena'
          ]),
          
          // Enhanced differentiation strategies
          differentiationStrategies: JSON.stringify({
            forStruggling: [
              'Simplified observation sheets with pictures',
              'Pre-measured materials and guided setup',
              'Peer buddy support for activities',
              'Visual step-by-step safety protocol cards',
              'Concrete examples before abstract concepts',
              'Additional processing time for observations'
            ],
            forAdvanced: [
              'Independent growth experiment design',
              'Research on unusual plant life cycles',
              'Teaching role with younger students',
              'Advanced measurement and data analysis',
              'Creation of growth teaching materials',
              'Cross-curricular connections to other subjects'
            ],
            forAllergic: [
              'Observation-based activities without direct contact',
              'Digital plant exploration and virtual growth',
              'Growth pattern analysis using photos/videos',
              'Life cycle sequencing activities',
              'Science vocabulary building games',
              'Measurement practice with non-plant objects'
            ],
            frenchSupport: [
              'Visual vocabulary cards with pictures',
              'Bilingual observation sheets',
              'French vocabulary practice before activities',
              'Peer translation support',
              'French science songs and chants',
              'Home language connection encouragement'
            ]
          }),
          
          // Update learning goals to include safety and French
          learningGoals: `Students will safely investigate growth and development through guided scientific exploration while building French science vocabulary. SAFETY FIRST: All activities include comprehensive allergy protocols and plant/soil safety measures.`,
          learningGoalsFr: `Les élèves investigueront de façon sécuritaire la croissance et le développement par l'exploration scientifique guidée tout en développant le vocabulaire scientifique français. SÉCURITÉ D'ABORD : Toutes les activités incluent des protocoles complets pour les allergies et la sécurité avec les plantes/terre.`
        }
      });
      
      updatedCount++;
      console.log(`✅ Updated Lesson ${lessonNumber}: Enhanced with safety protocols, allergy management, and French integration`);
    }
    
    console.log(`\n🌟 LESSONS 1-6 UPDATE COMPLETE!`);
    console.log(`✅ ${updatedCount} lessons enhanced with:`);
    console.log('  🛡️ Comprehensive plant/soil safety protocols');
    console.log('  🚨 Complete allergy management procedures');
    console.log('  📓 Science journal integration with growth observations');
    console.log('  🇫🇷 French vocabulary (2-6 terms per lesson)');
    console.log('  📦 Complete materials lists including safety equipment');
    console.log('  📋 Observable assessment with safety compliance checkboxes');
    console.log('  🔄 Alternative activities for students with allergies');
    console.log('  👥 Differentiation for all learning needs');
    console.log('  🌱 Age-appropriate activities for 6-year-olds\n');
    
  } catch (error) {
    console.error('❌ Error updating lessons 1-6:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateGrowingChangingLessons1to6()
  .then(() => console.log('🏆 Lessons 1-6 update completed successfully!'))
  .catch((error) => {
    console.error('💥 Update failed:', error);
    process.exit(1);
  });