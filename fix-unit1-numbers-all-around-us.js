const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixUnit1NumbersAllAroundUs() {
  console.log('🔧 Fixing Unit 1: Numbers All Around Us - Making all 12 lessons ETFO-compliant...\n');

  // Get all lessons in this unit
  const lessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      userId: 23,
      subject: 'Mathématiques',
      unitPlan: {
        title: 'Numbers All Around Us'
      }
    },
    orderBy: { date: 'asc' }
  });

  console.log(`Found ${lessons.length} lessons in Numbers All Around Us unit`);

  const differentiation = {
    forStruggling: "Visual supports with number cards, concrete manipulatives (counters, blocks), simplified counting problems, peer assistance for number recognition",
    forIEP: "Modified expectations per IEP, alternative counting tools (ten frames, number lines), extended time for number formation, adapted writing materials",
    forELL: "Bilingual number vocabulary cards (English/French), visual number representations, peer translation support, number songs in both languages",
    forAdvanced: "Extension to counting beyond 10, creating number patterns, peer tutoring for counting strategies, challenge problems with larger numbers"
  };

  // Lesson-specific content
  const lessonUpdates = [
    {
      title: "Numbers Exploration: Counting to 10",
      mindsOn: "(8 minutes) Number warm-up with counting songs in French. Explore counting to 10 with manipulatives (cubes, counters). Students share what they know about counting.",
      action: "(27 minutes) Hands-on investigation of counting to 10 using concrete materials. Students work with partners to count objects, play counting games, and solve problems involving quantities 1-10. Use ten frames for visual organization.",
      consolidation: "(10 minutes) Share discoveries about counting to 10. Math journal reflection on favorite counting strategy. Connect counting to daily life situations.",
      indigenousPerspectives: "Explore traditional Indigenous counting systems and the significance of the number 10 in some Indigenous cultures. Discuss how different cultures use counting in daily life, connecting to Indigenous teachings about observing and counting in nature (seasons, moon phases).",
      assessmentNotes: "☐ Student accurately counts objects 1-10\n☐ Uses one-to-one correspondence when counting\n☐ Can identify when counting sequence is incorrect\n☐ Explains counting strategy clearly\n☐ Connects counting to real-world situations"
    },
    {
      title: "Numbers Exploration: Number Recognition",
      mindsOn: "(8 minutes) Number warm-up with number identification games. Show number cards 0-10 and have students identify them. Discuss where they see numbers in their environment.",
      action: "(27 minutes) Hands-on investigation of number recognition using number cards, games, and environmental number hunts. Students match numerals to quantities, play number matching games, and create number books.",
      consolidation: "(10 minutes) Share discoveries about number recognition. Math journal reflection on numbers they found around the classroom. Connect to daily life number usage.",
      indigenousPerspectives: "Learn about Indigenous number systems and how numbers appear in traditional artwork and beadwork patterns. Explore how Indigenous peoples have traditionally recorded numbers through symbols, notches, and natural markers.",
      assessmentNotes: "☐ Student recognizes numerals 0-10 accurately\n☐ Can match numerals to corresponding quantities\n☐ Identifies numbers in environmental contexts\n☐ Explains what each number represents\n☐ Shows confidence in number identification"
    },
    {
      title: "Numbers Exploration: Number Formation",
      mindsOn: "(8 minutes) Number warm-up with finger tracing of numbers in the air. Practice writing numbers 0-5 with large arm movements. Review proper number formation.",
      action: "(27 minutes) Hands-on investigation of number formation using sand trays, finger painting, and paper. Students practice forming numbers 0-10, focusing on proper starting points and direction. Use multi-sensory approaches.",
      consolidation: "(10 minutes) Share discoveries about number formation. Math journal reflection on which numbers are easiest/hardest to write. Connect to daily writing needs.",
      indigenousPerspectives: "Explore how Indigenous peoples have traditionally marked numbers through carving, painting, and symbols. Learn about petroglyphs and how numbers appear in traditional Indigenous art and record-keeping.",
      assessmentNotes: "☐ Student forms numbers 0-10 with correct starting point\n☐ Uses proper direction when writing numbers\n☐ Numbers are recognizable and well-formed\n☐ Shows improvement with practice\n☐ Demonstrates fine motor control in number writing"
    },
    {
      title: "Numbers Exploration: Comparing Numbers",
      mindsOn: "(8 minutes) Number warm-up with 'more or less' games using manipulatives. Compare small sets of objects and discuss which has more, less, or the same amount.",
      action: "(27 minutes) Hands-on investigation of comparing numbers using concrete materials, number lines, and comparison activities. Students use language like 'more than,' 'less than,' and 'equal to' while working with quantities.",
      consolidation: "(10 minutes) Share discoveries about comparing numbers. Math journal reflection on comparison strategies. Connect to daily life situations where we compare quantities.",
      indigenousPerspectives: "Learn about traditional Indigenous practices of measuring and comparing quantities in nature - comparing harvests, tracking animal populations, and seasonal observations. Discuss balance and equity in Indigenous worldviews.",
      assessmentNotes: "☐ Student accurately compares quantities 0-10\n☐ Uses comparison language correctly (more, less, same)\n☐ Can order numbers from least to greatest\n☐ Explains reasoning for comparisons\n☐ Applies comparison skills to real situations"
    },
    {
      title: "Numbers Exploration: Numbers in Our World",
      mindsOn: "(8 minutes) Number warm-up with a number walk around the classroom. Find and identify numbers in the environment. Discuss why numbers are important in our daily lives.",
      action: "(27 minutes) Hands-on investigation of numbers in our world through number hunts, creating number collages, and discussing how numbers help us. Students explore house numbers, clock numbers, and calendar numbers.",
      consolidation: "(10 minutes) Share discoveries about numbers in our world. Math journal reflection on the most interesting numbers they found. Connect to how numbers help organize our lives.",
      indigenousPerspectives: "Explore how Indigenous communities use numbers in traditional practices - counting days in ceremonies, tracking seasonal changes, and organizing community events. Learn about the importance of cycles and patterns in Indigenous knowledge.",
      assessmentNotes: "☐ Student identifies numbers in various contexts\n☐ Explains how numbers are used in daily life\n☐ Shows curiosity about environmental numbers\n☐ Makes connections between numbers and their purposes\n☐ Demonstrates understanding of number importance"
    },
    {
      title: "Numbers Exploration: Number Patterns",
      mindsOn: "(8 minutes) Number warm-up with simple counting patterns (1,2,3... or 2,4,6...). Use manipulatives to create visual patterns. Discuss what makes a pattern.",
      action: "(27 minutes) Hands-on investigation of number patterns using manipulatives, number lines, and pattern activities. Students create, extend, and identify simple number patterns. Focus on counting by 1s, 2s, and 5s.",
      consolidation: "(10 minutes) Share discoveries about number patterns. Math journal reflection on their favorite pattern. Connect to patterns they see in daily life.",
      indigenousPerspectives: "Learn about patterns in Indigenous art, beadwork, and traditional designs. Explore how number patterns appear in nature and how Indigenous peoples have traditionally observed and used these patterns in their daily lives and ceremonies.",
      assessmentNotes: "☐ Student identifies simple number patterns\n☐ Can extend given patterns correctly\n☐ Creates their own number patterns\n☐ Explains the rule for their patterns\n☐ Connects patterns to real-world examples"
    }
  ];

  let updatedCount = 0;

  for (const lesson of lessons) {
    // Find the appropriate lesson update based on the main concept in the title
    let lessonUpdate;
    if (lesson.title.includes('Counting to 10')) {
      lessonUpdate = lessonUpdates[0];
    } else if (lesson.title.includes('Number Recognition')) {
      lessonUpdate = lessonUpdates[1];
    } else if (lesson.title.includes('Number Formation')) {
      lessonUpdate = lessonUpdates[2];
    } else if (lesson.title.includes('Comparing Numbers')) {
      lessonUpdate = lessonUpdates[3];
    } else if (lesson.title.includes('Numbers in Our World')) {
      lessonUpdate = lessonUpdates[4];
    } else if (lesson.title.includes('Number Patterns')) {
      lessonUpdate = lessonUpdates[5];
    } else {
      // Default to the first lesson update if no match
      lessonUpdate = lessonUpdates[0];
    }

    try {
      await prisma.eTFOLessonPlan.update({
        where: { id: lesson.id },
        data: {
          duration: 45,
          mindsOn: lessonUpdate.mindsOn,
          action: lessonUpdate.action,
          consolidation: lessonUpdate.consolidation,
          differentiationStrategies: differentiation,
          indigenousPerspectives: lessonUpdate.indigenousPerspectives,
          assessmentNotes: lessonUpdate.assessmentNotes
        }
      });

      updatedCount++;
      console.log(`✅ Updated lesson ${updatedCount}: ${lesson.title}`);
    } catch (error) {
      console.error(`❌ Error updating lesson ${lesson.title}:`, error.message);
    }
  }

  console.log(`\n🎉 Successfully updated ${updatedCount} lessons in Numbers All Around Us unit!`);
  console.log('All lessons now have:');
  console.log('- 45-minute duration (ETFO compliant)');
  console.log('- Explicit timing in mindsOn (8 min), action (27 min), consolidation (10 min)');
  console.log('- Comprehensive differentiation strategies for all learner types');
  console.log('- Meaningful Indigenous perspectives connecting math to traditional knowledge');
  console.log('- Observable assessment criteria with checkboxes');

  await prisma.$disconnect();
}

// Run the function
fixUnit1NumbersAllAroundUs().catch(console.error);