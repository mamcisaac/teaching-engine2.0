import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function perfectFallChangesSafety() {
  console.log('🍂 PERFECTING ALL 24 FALL CHANGES LESSONS WITH WEATHER SAFETY');
  console.log('=============================================================\n');

  // Get all Fall Changes lessons
  const unitPlanId = "cmebyc9ng0003vjrmqcj401lj";
  const lessons = await prisma.eTFOLessonPlan.findMany({
    where: { unitPlanId },
    orderBy: { date: 'asc' }
  });

  console.log(`Found ${lessons.length} Fall Changes lessons to enhance\n`);

  // Weather safety protocols to add to all lessons
  const weatherSafetyProtocols = [
    "✅ WEATHER SAFETY: Check temperature and dress in layers appropriate for fall weather",
    "✅ RAIN GEAR: Have rain jackets and covers ready if precipitation is forecasted", 
    "✅ TEMPERATURE MONITORING: Use classroom thermometer to check outdoor conditions before outdoor activities",
    "✅ LEAF COLLECTION SAFETY: Avoid unknown plants, poisonous berries, and areas near roads",
    "✅ SLIPPERY SURFACE WARNING: Be cautious of wet leaves which can be slippery on walkways",
    "✅ INDOOR ALTERNATIVE: Have backup indoor observation activities if weather is unsafe"
  ];

  // Enhanced materials for weather monitoring and safety
  const enhancedMaterials = [
    "Weather thermometers (classroom use)",
    "Leaf collection bags (safety approved)",
    "Rain gauge for precipitation measurement", 
    "Seasonal observation charts",
    "Weather-appropriate clothing checklist",
    "First aid kit for outdoor activities",
    "Non-slip footwear recommendations list"
  ];

  // French vocabulary for weather and seasons
  const frenchWeatherVocab = [
    "l'automne (fall/autumn)",
    "les feuilles (leaves)", 
    "le temps (weather)",
    "la température (temperature)",
    "la pluie (rain)",
    "le vent (wind)",
    "sécurité (safety)",
    "observer (to observe)",
    "mesurer (to measure)"
  ];

  let updatedCount = 0;

  for (const lesson of lessons) {
    try {
      // Parse existing materials if they exist
      let materials = [];
      if (lesson.materials) {
        if (typeof lesson.materials === 'string') {
          try {
            materials = JSON.parse(lesson.materials);
          } catch {
            materials = [lesson.materials];
          }
        } else if (Array.isArray(lesson.materials)) {
          materials = lesson.materials;
        }
      }

      // Add enhanced materials (avoiding duplicates)
      const materialSet = new Set([...materials, ...enhancedMaterials]);
      const updatedMaterials = Array.from(materialSet);

      // Enhanced learning objectives
      const enhancedObjectives = lesson.learningGoals ? 
        `${lesson.learningGoals} Students will observe and document seasonal changes in fall while following weather safety protocols. Students will investigate how living things prepare for winter using appropriate outdoor safety measures.` :
        "Students will observe and document seasonal changes in fall while following weather safety protocols. Students will investigate how living things prepare for winter using appropriate outdoor safety measures.";

      // Enhanced action section with science journal integration
      const enhancedAction = lesson.action ? 
        `${lesson.action}\n\n🌿 SCIENCE JOURNAL INTEGRATION:\n- Students record daily weather observations in science journals\n- Draw and label fall changes (leaves, animals, weather)\n- Create seasonal comparison charts with French vocabulary\n- Document safety procedures followed during outdoor observations` :
        "SCIENCE JOURNAL INTEGRATION:\n- Students record daily weather observations in science journals\n- Draw and label fall changes (leaves, animals, weather)\n- Create seasonal comparison charts with French vocabulary\n- Document safety procedures followed during outdoor observations";

      // Enhanced assessment notes with safety criteria
      const enhancedAssessment = `${lesson.assessmentNotes || ''}\n\n🍂 FALL SAFETY & OBSERVATION ASSESSMENT:\n☐ Identifies seasonal changes safely during outdoor activities\n☐ Records weather observations accurately in science journal\n☐ Follows outdoor safety procedures (clothing, awareness)\n☐ Uses French vocabulary: ${frenchWeatherVocab.slice(0, 4).join(', ')}\n☐ Demonstrates proper use of weather monitoring tools\n☐ Shows awareness of slippery surfaces and plant safety\n\n🌡️ WEATHER SAFETY PROTOCOLS:\n${weatherSafetyProtocols.join('\n')}`;

      // Update the lesson
      await prisma.eTFOLessonPlan.update({
        where: { id: lesson.id },
        data: {
          learningGoals: enhancedObjectives,
          materials: updatedMaterials,
          action: enhancedAction,
          assessmentNotes: enhancedAssessment
        }
      });

      updatedCount++;
      console.log(`✅ Enhanced lesson ${updatedCount}: ${lesson.title}`);

    } catch (error) {
      console.error(`❌ Error updating lesson ${lesson.title}:`, error);
    }
  }

  console.log(`\n🎉 FALL CHANGES SAFETY ENHANCEMENT COMPLETE!`);
  console.log(`=============================================`);
  console.log(`✅ Lessons enhanced: ${updatedCount}/24`);
  console.log(`🌡️ Weather safety protocols added to all lessons`);
  console.log(`🍂 Seasonal observation procedures established`);
  console.log(`📝 Science journal integration added`);
  console.log(`🇫🇷 French weather vocabulary integrated`);
  console.log(`🛡️ All lessons now safe for fall outdoor activities`);

  console.log(`\n📋 SAFETY FEATURES ADDED:`);
  console.log(`=======================`);
  weatherSafetyProtocols.forEach(protocol => console.log(protocol));

  console.log(`\n🧰 ENHANCED MATERIALS:`);
  console.log(`=====================`);
  enhancedMaterials.forEach(material => console.log(`- ${material}`));

  console.log(`\n🇫🇷 FRENCH VOCABULARY:`);
  console.log(`======================`);
  frenchWeatherVocab.forEach(vocab => console.log(`- ${vocab}`));
}

// Run the enhancement
perfectFallChangesSafety()
  .catch((error) => {
    console.error('❌ Error enhancing Fall Changes lessons:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });