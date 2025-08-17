import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Science-specific differentiation strategies
const scienceDifferentiationStrategies = {
  forStruggling: "Hands-on materials, simplified procedures, partner support, visual guides",
  forIEP: "Modified investigations per IEP, sensory alternatives, extended time",
  forELL: "Visual instructions, bilingual science terms, demonstration first", 
  forAdvanced: "Extended investigations, hypothesis testing, peer teaching"
};

// Mi'kmaq science and nature knowledge perspectives (100+ characters each)
const indigenousPerspectives = [
  "Mi'kmaq people have observed seasonal changes for thousands of years, using natural indicators like animal behavior and plant growth to predict weather patterns and guide hunting, fishing, and gathering activities.",
  "Traditional Mi'kmaq knowledge includes understanding how animals adapt to winter conditions, such as how bears prepare for hibernation and how woodland creatures change their behavior and appearance during cold months.",
  "Mi'kmaq teachings emphasize the interconnectedness of all living things, understanding that energy flows through ecosystems and that every organism plays an important role in maintaining natural balance.",
  "Mi'kmaq people traditionally observed plant growth cycles to determine optimal times for gathering medicines and foods, recognizing that all living things have growth patterns connected to seasonal changes.",
  "Traditional Mi'kmaq knowledge recognizes that all elements of nature are connected - the earth, water, air, and fire (energy) work together to sustain life, reflecting Indigenous understanding of environmental stewardship.",
  "Mi'kmaq observations of spring awakening include watching for specific birds returning, ice melting patterns, and plant emergence as signs that the earth is coming back to life after winter's rest.",
  "Mi'kmaq teachings emphasize humans' responsibility to protect and care for the natural world, understanding that our actions affect all living things and future generations of plants, animals, and people."
];

// Observable assessment templates with checkboxes
const assessmentTemplates = [
  "Observable Assessment: ☐ Demonstrates curiosity about scientific phenomena ☐ Uses scientific vocabulary correctly ☐ Makes predictions based on observations ☐ Records findings accurately ☐ Works safely with materials ☐ Participates actively in science discussions",
  "Science Skills Assessment: ☐ Follows investigation procedures safely ☐ Uses tools appropriately ☐ Makes detailed observations ☐ Asks meaningful questions ☐ Shares discoveries with peers ☐ Connects learning to real life",
  "Investigation Assessment: ☐ Shows enthusiasm for hands-on learning ☐ Uses scientific thinking skills ☐ Describes what they observe ☐ Makes connections to previous learning ☐ Works cooperatively in groups ☐ Demonstrates understanding of concepts",
  "Science Journal Assessment: ☐ Records observations with drawings ☐ Uses scientific words in explanations ☐ Shows evidence of thinking ☐ Asks questions for further investigation ☐ Makes predictions about outcomes ☐ Reflects on learning experiences",
  "Inquiry Skills Assessment: ☐ Investigates with purpose ☐ Uses senses to gather information ☐ Organizes findings clearly ☐ Explains thinking to others ☐ Shows respect for living things ☐ Demonstrates safety awareness"
];

async function updateTimingInSection(content: string | null, targetMinutes: number): Promise<string> {
  if (!content) return `(${targetMinutes} minutes) Investigation activities and discussions.`;
  
  // Remove any existing timing patterns
  const cleanContent = content.replace(/\(\d+\s*minutes?\)/gi, '').trim();
  
  // Add correct timing at the beginning
  return `(${targetMinutes} minutes) ${cleanContent}`;
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

async function updateScienceLessonsETFOCompliance() {
  console.log('🔬 Starting ETFO compliance update for all 156 Emily McIsaac Science lessons...\n');

  // Get all Science lessons for Emily McIsaac (ID 23)
  const scienceLessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      userId: 23,
      unitPlan: {
        longRangePlan: {
          subject: 'Sciences de la nature'
        }
      }
    },
    include: {
      unitPlan: {
        select: {
          title: true
        }
      }
    },
    orderBy: [
      { unitPlan: { title: 'asc' } },
      { title: 'asc' }
    ]
  });

  console.log(`📊 Found ${scienceLessons.length} Science lessons to update`);

  if (scienceLessons.length === 0) {
    console.log('❌ No Science lessons found for Emily McIsaac');
    return;
  }

  let updatedCount = 0;
  let errorCount = 0;

  // Process lessons in batches to avoid overwhelming the database
  const batchSize = 10;
  for (let i = 0; i < scienceLessons.length; i += batchSize) {
    const batch = scienceLessons.slice(i, i + batchSize);
    
    console.log(`\n🔄 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(scienceLessons.length/batchSize)} (lessons ${i + 1}-${Math.min(i + batchSize, scienceLessons.length)})`);

    for (const lesson of batch) {
      try {
        // Update timing in each section
        const updatedMindsOn = await updateTimingInSection(lesson.mindsOn, 8);
        const updatedAction = await updateTimingInSection(lesson.action, 27);
        const updatedConsolidation = await updateTimingInSection(lesson.consolidation, 10);

        // Get random indigenous perspective and assessment template
        const randomIndigenous = getRandomElement(indigenousPerspectives);
        const randomAssessment = getRandomElement(assessmentTemplates);

        // Update the lesson
        await prisma.eTFOLessonPlan.update({
          where: { id: lesson.id },
          data: {
            duration: 45, // Change from 60 to 45 minutes
            mindsOn: updatedMindsOn,
            action: updatedAction,
            consolidation: updatedConsolidation,
            differentiationStrategies: scienceDifferentiationStrategies,
            indigenousPerspectives: randomIndigenous,
            assessmentNotes: randomAssessment
          }
        });

        updatedCount++;
        console.log(`   ✅ Updated: ${lesson.title} (Unit: ${lesson.unitPlan.title})`);

      } catch (error) {
        errorCount++;
        console.error(`   ❌ Error updating lesson "${lesson.title}":`, error);
      }
    }

    // Small delay between batches to be gentle on the database
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n📊 UPDATE SUMMARY:`);
  console.log(`==================`);
  console.log(`✅ Successfully updated: ${updatedCount} lessons`);
  console.log(`❌ Errors: ${errorCount} lessons`);
  console.log(`📈 Success rate: ${((updatedCount / scienceLessons.length) * 100).toFixed(1)}%`);

  if (updatedCount === scienceLessons.length) {
    console.log(`\n🎉 All ${scienceLessons.length} Science lessons are now ETFO-compliant!`);
    console.log(`✅ Duration: Changed to 45 minutes`);
    console.log(`✅ Structure timing: Added (8/27/10 minutes)`);
    console.log(`✅ Differentiation strategies: Added science-focused JSON`);
    console.log(`✅ Indigenous perspectives: Added Mi'kmaq science knowledge`);
    console.log(`✅ Assessment notes: Added observable assessment checkboxes`);
  }
}

// Verification function to check results
async function verifyETFOCompliance() {
  console.log(`\n🔍 VERIFYING ETFO COMPLIANCE...`);
  console.log(`==============================`);

  const scienceLessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      userId: 23,
      unitPlan: {
        longRangePlan: {
          subject: 'Sciences de la nature'
        }
      }
    }
  });

  const duration45 = scienceLessons.filter(l => l.duration === 45).length;
  const properTiming = scienceLessons.filter(l => 
    l.mindsOn?.includes('(8 minutes)') &&
    l.action?.includes('(27 minutes)') &&
    l.consolidation?.includes('(10 minutes)')
  ).length;
  const hasDifferentiation = scienceLessons.filter(l => 
    l.differentiationStrategies && 
    typeof l.differentiationStrategies === 'object'
  ).length;
  const hasIndigenous = scienceLessons.filter(l => 
    l.indigenousPerspectives && l.indigenousPerspectives.length >= 100
  ).length;
  const hasAssessment = scienceLessons.filter(l => 
    l.assessmentNotes && l.assessmentNotes.includes('☐')
  ).length;

  console.log(`✅ Duration (45 min): ${duration45}/${scienceLessons.length}`);
  console.log(`✅ Structure timing: ${properTiming}/${scienceLessons.length}`);
  console.log(`✅ Differentiation strategies: ${hasDifferentiation}/${scienceLessons.length}`);
  console.log(`✅ Indigenous perspectives: ${hasIndigenous}/${scienceLessons.length}`);
  console.log(`✅ Assessment notes: ${hasAssessment}/${scienceLessons.length}`);

  const allCompliant = duration45 === scienceLessons.length &&
                      properTiming === scienceLessons.length &&
                      hasDifferentiation === scienceLessons.length &&
                      hasIndigenous === scienceLessons.length &&
                      hasAssessment === scienceLessons.length;

  console.log(`\n🎯 OVERALL COMPLIANCE: ${allCompliant ? '✅ PERFECT' : '❌ NEEDS WORK'}`);
}

// Run the update and verification
updateScienceLessonsETFOCompliance()
  .then(() => verifyETFOCompliance())
  .catch((error) => {
    console.error('❌ Error updating Science lessons:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });