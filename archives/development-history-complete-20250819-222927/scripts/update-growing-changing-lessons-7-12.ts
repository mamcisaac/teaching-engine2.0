#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateGrowingChangingLessons7to12() {
  console.log('🔬 Updating Growing and Changing unit lessons 7-12 with safety protocols and comprehensive enhancements...\n');
  
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
    
    // Get lessons 7-12 for this unit
    const lessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        unitPlanId: growthUnit.id
      },
      orderBy: {
        date: 'asc'
      },
      skip: 6, // Skip first 6 lessons
      take: 6  // Take next 6 lessons
    });
    
    console.log(`📚 Found ${lessons.length} lessons to update (7-12):\n`);
    
    // Enhanced safety protocols for advanced growing activities
    const advancedSafetyProtocols = [
      '🔍 ENHANCED ALLERGY MONITORING: Daily allergy status check for students with known sensitivities',
      '🧼 DEEP HANDWASHING PROTOCOL: 20-second handwashing with soap before and after all activities',
      '🌱 ADVANCED SOIL SAFETY: Soil testing for pH and contaminants, organic soil only',
      '☘️ PLANT TOXICITY VERIFICATION: Double-check all plants against PEI Education poisonous plant database',
      '🌾 SMALL PARTS SUPERVISION: Enhanced monitoring for seeds, tools, and plant parts',
      '🧤 PROTECTIVE GEAR STANDARD: Mandatory gloves for soil activities if students have skin sensitivities',
      '☀️ OUTDOOR SAFETY EXPANSION: UV protection, hydration breaks, insect awareness protocols',
      '💧 ADVANCED WATER SAFETY: Controlled water access, spill prevention mats, immediate cleanup',
      '🚨 EMERGENCY PREPAREDNESS: EpiPen location review, staff emergency training verification',
      '📋 ENHANCED PARENT COMMUNICATION: Weekly allergy updates and activity previews',
      '🏥 ALTERNATIVE ACTIVITY EXPANSION: Multiple engaging options for students with plant/soil allergies',
      '🔬 TOOL SAFETY ADVANCEMENT: Proper handling of measurement tools, microscopes, and documentation equipment'
    ];
    
    const expandedAllergyManagement = [
      '📝 Daily allergy review before each lesson begins',
      '🚫 Immediate activity modification for any allergic symptoms',
      '📱 Direct communication line with parents for allergy concerns',
      '🏥 School nurse partnership for allergy management strategies',
      '🔄 Advanced alternative activities matching learning objectives',
      '🧴 Emergency allergy medication accessibility check',
      '👥 Peer support training for classmates of allergic students',
      '📋 Detailed incident documentation with time, symptoms, and response',
      '🌟 Positive inclusion strategies for students unable to participate in plant activities'
    ];
    
    // Expanded French vocabulary for intermediate growing concepts
    const advancedFrenchVocabulary = {
      humanGrowth: ['grandir', 'développer', 'mesurer', 'comparer', 'santé', 'corps', 'taille'],
      seedsSprouting: ['germer', 'pousser', 'racine', 'tige', 'arroser', 'soleil', 'croissance'],
      metamorphosis: ['transformation', 'chenille', 'chrysalide', 'papillon', 'changer', 'étape'],
      growthNeeds: ['besoin', 'eau', 'lumière', 'nourriture', 'soins', 'environnement', 'aide'],
      measuring: ['mesurer', 'règle', 'long', 'court', 'grand', 'petit', 'comparer'],
      caring: ['soigner', 'aider', 'protéger', 'nourrir', 'observer', 'respecter', 'responsabilité']
    };
    
    // Update each lesson with comprehensive enhancements
    let updatedCount = 0;
    
    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      const lessonNumber = i + 7; // Lessons 7-12
      
      console.log(`\n🔄 Updating Lesson ${lessonNumber}: ${lesson.title}`);
      
      // Determine French vocabulary based on lesson title
      let frenchVocab = [];
      if (lesson.title.includes('Human Growth')) {
        frenchVocab = advancedFrenchVocabulary.humanGrowth;
      } else if (lesson.title.includes('Seeds') || lesson.title.includes('Sprouting')) {
        frenchVocab = advancedFrenchVocabulary.seedsSprouting;
      } else if (lesson.title.includes('Butterfly') || lesson.title.includes('Metamorphosis')) {
        frenchVocab = advancedFrenchVocabulary.metamorphosis;
      } else if (lesson.title.includes('Growth Needs') || lesson.title.includes('Needs')) {
        frenchVocab = advancedFrenchVocabulary.growthNeeds;
      } else if (lesson.title.includes('Measuring')) {
        frenchVocab = advancedFrenchVocabulary.measuring;
      } else {
        frenchVocab = advancedFrenchVocabulary.caring;
      }
      
      // Generate enhanced French titles
      const enhancedFrenchTitles = {
        'Growing & Changing: Human Growth': 'Grandir et changer : Croissance humaine',
        'Growth Science: Growth Observations': 'Sciences croissance : Observations de croissance',
        'Growing & Changing: Seeds and Sprouting': 'Grandir et changer : Graines et germination',
        'Growth Science: Measuring Growth': 'Sciences croissance : Mesurer la croissance',
        'Growing & Changing: Butterfly Metamorphosis': 'Grandir et changer : Métamorphose papillon',
        'Growth Science: Recording Changes': 'Sciences croissance : Enregistrer les changements'
      };
      
      const titleFr = enhancedFrenchTitles[lesson.title] || `Sciences croissance : Leçon ${lessonNumber}`;
      
      // Create enhanced action section with advanced safety protocols
      const enhancedAction = `
🔬 ADVANCED SCIENCE LEARNING ACTIVITIES:
${lesson.action || 'Conduct detailed growth investigations with enhanced measurement and observation techniques'}

🛡️ ADVANCED MANDATORY SAFETY PROTOCOLS:
${advancedSafetyProtocols.join('\n')}

🚨 EXPANDED ALLERGY MANAGEMENT PROCEDURES:
${expandedAllergyManagement.join('\n')}

📓 ENHANCED SCIENCE JOURNAL INTEGRATION:
• Detailed daily growth measurements with metric units
• Hypothesis formation and testing documentation
• Time-lapse photo documentation of growth changes
• Comparative analysis between different growing conditions
• Scientific vocabulary development in both languages
• Growth pattern prediction and verification
• Reflection on scientific method application

🇫🇷 ADVANCED FRENCH VOCABULARY FOCUS:
${frenchVocab.join(', ')}

🧪 COMPREHENSIVE MATERIALS LIST (ENHANCED SAFETY):
• VERIFIED NON-TOXIC plants with species identification cards
• STERILIZED, ORGANIC soil in labeled, sealed containers
• MEASUREMENT TOOLS: metric rulers, flexible measuring tape, digital calipers
• HIGH-QUALITY magnifying glasses with LED lights
• SCIENCE JOURNALS with graph paper for data recording
• DIGITAL CAMERAS with macro lens capability
• HAND WASHING STATION with antibacterial soap and paper towels
• DISPOSABLE NITRILE GLOVES (latex-free, multiple sizes)
• COMPREHENSIVE FIRST AID KIT with allergy emergency supplies
• ALLERGY EMERGENCY CONTACT LIST prominently displayed
• FRENCH VOCABULARY CARDS with pronunciation guides
• MULTIPLE ALTERNATIVE ACTIVITIES for allergic students
• WATERPROOF TABLE MATS and protective coverings
• CONTROLLED WATERING SYSTEMS with measured output
• GROWTH TRACKING CHARTS and data recording sheets`;
      
      // Create enhanced observable assessment criteria
      const enhancedAssessmentNotes = `
🎯 ADVANCED GROWTH LEARNING ASSESSMENT:
□ Demonstrates sophisticated understanding of growth processes
□ Uses precise scientific vocabulary in both English and French
□ Makes accurate, detailed observations and measurements
□ Records comprehensive findings in organized science journal
□ Analyzes growth patterns and makes logical predictions
□ Collaborates effectively and leads scientific discussions

🛡️ ENHANCED SAFETY COMPLIANCE ASSESSMENT:
□ Consistently follows all advanced plant/soil handling protocols
□ Demonstrates proper handwashing technique and timing
□ Uses all tools safely with minimal supervision
□ Immediately reports any allergic reactions or concerns
□ Shows exceptional care and respect for living things
□ Maintains clean, organized, and safe work environment
□ Assists classmates in following safety protocols

🇫🇷 ADVANCED FRENCH INTEGRATION ASSESSMENT:
□ Uses advanced French growth vocabulary accurately and naturally
□ Describes complex observations in simple but precise French
□ Shows confidence in bilingual science communication
□ Helps peers with French vocabulary development

📝 Advanced Observable Indicators:
- Independent scientific investigation skills
- Precision in measurement and data recording
- Leadership in safety protocol implementation
- Sophisticated understanding of growth concepts
- Natural integration of French scientific vocabulary
- Mentoring of peers in safe scientific practices

🌟 MASTERY INDICATORS:
- Designs independent growth experiments
- Teaches safety protocols to younger students
- Uses French vocabulary spontaneously in science contexts
- Demonstrates advanced scientific thinking and reasoning`;
      
      // Update the lesson with comprehensive enhancements
      await prisma.eTFOLessonPlan.update({
        where: { id: lesson.id },
        data: {
          titleFr: titleFr,
          action: enhancedAction,
          assessmentNotes: enhancedAssessmentNotes,
          
          // Enhanced materials list with advanced equipment
          materials: JSON.stringify([
            'VERIFIED NON-TOXIC PLANTS with species identification',
            'ORGANIC, STERILIZED SOIL in sealed, labeled containers',
            'PRECISION SEEDS (size-appropriate, no choking hazards)',
            'ADVANCED MEASUREMENT TOOLS (metric rulers, calipers)',
            'LED MAGNIFYING GLASSES for detailed observation',
            'SCIENCE JOURNALS with graph paper and data tables',
            'DIGITAL CAMERAS with macro photography capability',
            'ENHANCED HAND WASHING STATION (antibacterial soap)',
            'NITRILE GLOVES (latex-free, hypoallergenic)',
            'COMPREHENSIVE FIRST AID KIT with allergy emergency supplies',
            'PROMINENTLY DISPLAYED allergy emergency contact information',
            'FRENCH VOCABULARY CARDS with pronunciation guides',
            'MULTIPLE ALTERNATIVE ACTIVITIES for students with allergies',
            'WATERPROOF PROTECTIVE TABLE COVERINGS',
            'CONTROLLED WATERING SYSTEMS with measurement capability',
            'GROWTH TRACKING CHARTS and data recording templates',
            'UV PROTECTION SUPPLIES for outdoor activities',
            'SPILL CLEANUP KITS and absorbent materials',
            'MICROSCOPES for detailed plant structure examination'
          ]),
          
          // Advanced accommodations including sophisticated allergy alternatives
          accommodations: JSON.stringify([
            'ADVANCED visual growth charts with detailed diagrams',
            'COMPREHENSIVE allergy-free observation activities',
            'DIGITAL and virtual reality plant exploration options',
            'PEER SUPPORT SYSTEMS for measurement assistance',
            'EXTENDED TIME for detailed scientific observation',
            'MULTIPLE MODALITIES for demonstrating understanding',
            'SENSORY-FRIENDLY tools and adaptive equipment',
            'WHEELCHAIR-ACCESSIBLE planting and observation stations',
            'LARGE-PRINT observation sheets and data tables',
            'AUDIO DESCRIPTIONS for visual scientific phenomena',
            'TACTILE exploration alternatives for visual learners'
          ]),
          
          // Advanced differentiation strategies
          differentiationStrategies: JSON.stringify({
            forStruggling: [
              'SIMPLIFIED observation sheets with visual step-by-step guides',
              'PRE-MEASURED materials with guided setup procedures',
              'DEDICATED peer buddy support throughout activities',
              'VISUAL safety protocol cards with pictorial instructions',
              'CONCRETE examples before introducing abstract concepts',
              'ADDITIONAL processing time with scaffolded support'
            ],
            forAdvanced: [
              'INDEPENDENT growth experiment design opportunities',
              'RESEARCH projects on unusual plant and animal life cycles',
              'MENTORING ROLE with younger students in school',
              'ADVANCED measurement techniques and data analysis',
              'CREATION of teaching materials for other classes',
              'CROSS-CURRICULAR connections to mathematics and art'
            ],
            forAllergic: [
              'OBSERVATION-BASED activities without direct plant/soil contact',
              'DIGITAL plant exploration using tablets and virtual reality',
              'GROWTH PATTERN analysis using photographs and videos',
              'LIFE CYCLE sequencing activities with laminated cards',
              'SCIENCE VOCABULARY building through interactive games',
              'MEASUREMENT practice using non-plant objects and models'
            ],
            frenchSupport: [
              'VISUAL vocabulary cards with photographs and pronunciations',
              'BILINGUAL observation sheets with French-English transitions',
              'FRENCH vocabulary practice sessions before each activity',
              'PEER TRANSLATION support from bilingual classmates',
              'FRENCH science songs, chants, and rhymes for vocabulary',
              'HOME LANGUAGE connections and family vocabulary sharing'
            ]
          }),
          
          // Update learning goals to emphasize advanced safety and bilingual development
          learningGoals: `Students will conduct advanced growth investigations using sophisticated observation and measurement techniques while developing comprehensive French science vocabulary. ENHANCED SAFETY: All activities include rigorous allergy protocols, advanced plant/soil safety measures, and emergency preparedness procedures.`,
          learningGoalsFr: `Les élèves mèneront des investigations avancées de croissance en utilisant des techniques sophistiquées d'observation et de mesure tout en développant un vocabulaire scientifique français complet. SÉCURITÉ RENFORCÉE : Toutes les activités incluent des protocoles d'allergie rigoureux, des mesures de sécurité avancées avec les plantes/terre, et des procédures de préparation d'urgence.`
        }
      });
      
      updatedCount++;
      console.log(`✅ Updated Lesson ${lessonNumber}: Enhanced with advanced safety protocols and sophisticated French integration`);
    }
    
    console.log(`\n🌟 LESSONS 7-12 UPDATE COMPLETE!`);
    console.log(`✅ ${updatedCount} lessons enhanced with:`);
    console.log('  🛡️ ADVANCED plant/soil safety protocols with enhanced monitoring');
    console.log('  🚨 EXPANDED allergy management with daily status checks');
    console.log('  📓 SOPHISTICATED science journal integration with data analysis');
    console.log('  🇫🇷 ADVANCED French vocabulary (7+ terms per lesson)');
    console.log('  📦 COMPREHENSIVE materials lists with precision equipment');
    console.log('  📋 DETAILED observable assessment with mastery indicators');
    console.log('  🔄 MULTIPLE alternative activities for allergic students');
    console.log('  👥 ADVANCED differentiation including mentoring opportunities');
    console.log('  🌱 SOPHISTICATED activities appropriate for developing 6-year-olds\n');
    
  } catch (error) {
    console.error('❌ Error updating lessons 7-12:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateGrowingChangingLessons7to12()
  .then(() => console.log('🏆 Lessons 7-12 update completed successfully!'))
  .catch((error) => {
    console.error('💥 Update failed:', error);
    process.exit(1);
  });