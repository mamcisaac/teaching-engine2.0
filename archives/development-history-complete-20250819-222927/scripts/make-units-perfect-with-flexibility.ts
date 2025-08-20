import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeUnitsPerfectWithFlexibility() {
  console.log('🧠 MAKING UNITS PERFECT WITH REAL FLEXIBILITY');
  console.log('==============================================');
  console.log('Using teacher wisdom, not mathematical precision\n');

  try {
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98s0007vjr1v0a2ibp5' },
      include: { lessonPlans: true },
      orderBy: { startDate: 'asc' }
    });

    console.log('🎯 TRANSFORMING EACH UNIT WITH REAL FLEXIBILITY:\n');

    // UNIT 1: September chaos needs massive flexibility
    console.log('📚 UNIT 1: Notre école - Building in September Reality');
    await prisma.unitPlan.update({
      where: { id: units[0].id },
      data: {
        estimatedHours: 10.5, // Adding 30% buffer
        description: `🏫 FLEXIBLE IMPLEMENTATION FRAMEWORK

REALITY: September is chaos. Kids are crying, routines don't exist, everything takes 3x longer.

TARGET: 2-3 Social Studies moments per week, whenever they naturally fit
ACTUAL LESSONS: 14 on paper → 10-14 in reality (based on class readiness)

WEEK 1-2 (Sept 8-19): SURVIVAL MODE
• Integrate Social Studies into tour/orientation
• "Who helps us?" during actual moments (nurse visit, meeting janitor)
• No formal lessons - just exposure and vocabulary
• If kids are crying: Skip Social Studies entirely

WEEK 3-4 (Sept 22-Oct 3): GENTLE START  
• 1-2 actual lessons if class is settled
• Rest integrated into daily routines
• School helper visits when THEY can come
• Flexibility: Can extend into Week 5 if needed

WEEK 5-6 (Oct 6-17): NORMAL RHYTHM
• 2-3 lessons per week as energy allows
• Can compress if ahead, extend if behind
• October assessment: "Do kids know school helpers?" Yes? Success!

BUFFER STRATEGIES:
• Lessons 1-3 can be one extended exploration
• Lessons 4-6 are "helper visits" - whenever helpers available
• Lessons 7-10 can merge into "appreciation week"
• Lessons 11-14 are bonus if time allows

DISRUPTION PROTOCOL:
• Fire drill? That's our safety lesson!
• Assembly? Count it as community gathering lesson
• Kids melting down? Stop and try tomorrow
• Sick day? Unit has 2-week buffer built in`,

        parentCommunicationPlan: `Dear Families,

September is about settling in! Social Studies happens naturally as we:
• Meet school helpers during real moments
• Learn French words slowly and gently
• Build comfort before content

No pressure, no homework, just gentle exploration when kids are ready.`
      }
    });
    console.log('✅ Unit 1: Added 2-week buffer + survival mode plan\n');

    // UNIT 2: October-November needs weather flexibility
    console.log('🦸 UNIT 2: Community Helpers - Weather & Energy Flexibility');
    await prisma.unitPlan.update({
      where: { id: units[1].id },
      data: {
        estimatedHours: 10.5,
        description: `🚒 FLEXIBLE HELPER EXPLORATION

REALITY: October/November weather is unpredictable, kids getting tired, Halloween disruption.

TARGET: Meet 5 heroes through whatever works
ACTUAL LESSONS: 14 planned → 10-14 delivered flexibly

STRUCTURE: Each hero gets 2-3 sessions (flexible)
• Firefighter (Lessons 1-3): Can be 1 visit or 3 activities
• Police (Lessons 4-6): Adjust based on visitor availability  
• Doctor/Nurse (Lessons 7-9): Can use school nurse anytime
• Librarian (Lessons 10-11): Can be daily library visits
• Review/Celebrate (Lessons 12-14): Optional extension

WEATHER FLEXIBILITY:
• Outdoor walks? Great! 
• Raining? Videos and dress-up play
• Snowing? Heroes who help in snow!
• Cold? Indoor helper stations

HALLOWEEN WEEK:
• Expect disruption Oct 27-31
• Heroes can wear costumes too!
• Reduce to 1 lesson or skip entirely

VISITOR FLEXIBILITY:
• Real visitor available? Expand to 3 lessons
• Visitor cancelled? Compress to 1 lesson with video
• No visitors? Teacher dress-up works perfectly

NOVEMBER TIREDNESS:
• Week of Nov 17: Expect exhaustion
• Can reduce to videos and coloring
• "Helper of the Day" is enough`
      }
    });
    console.log('✅ Unit 2: Added weather contingencies + visitor flexibility\n');

    // UNIT 3: December needs massive Christmas flexibility
    console.log('🎄 UNIT 3: Families - December Survival Mode');
    await prisma.unitPlan.update({
      where: { id: units[2].id },
      data: {
        estimatedHours: 9,
        description: `🎅 DECEMBER REALITY FRAMEWORK

TRUTH: December is not for new learning. It's for survival.

TARGET: 1-2 gentle family activities per week MAX
ACTUAL LESSONS: 12 planned → 7-10 if lucky

WEEK 1 (Dec 1-5): GENTLE START
• 1-2 lessons max while energy exists
• Focus on "classroom family" only
• No pressure for home sharing

WEEK 2 (Dec 8-12): CONCERT WEEK
• Probably NO Social Studies
• If time: Quick "families celebrate" discussion
• Everything optional

WEEK 3 (Dec 15-19): CHRISTMAS CHAOS
• Parties, movies, crafts
• Social Studies = making cards for families
• No new content AT ALL

CRITICAL FLEXIBILITY:
• Can start this unit in late November if ahead
• Can finish in January if behind
• Can reduce to 7 core lessons
• Can be entirely "classroom family" focused

SENSITIVE ACCOMMODATIONS:
• All family sharing OPTIONAL
• Focus on school family
• Celebrate ANY tradition or none
• When in doubt: Make snowflakes

CONCERT/ASSEMBLY PROTOCOL:
• Lost 3 days to practice? Normal!
• Kids too excited to focus? Expected!
• Parent volunteers everywhere? Hide!
• Solution: This unit can shrink to fit`
      }
    });
    console.log('✅ Unit 3: Built for December chaos with 40% reduction option\n');

    // UNIT 4: January needs fresh start flexibility
    console.log('🏘️ UNIT 4: Neighborhood - January Fresh Start');
    await prisma.unitPlan.update({
      where: { id: units[4].id },
      data: {
        estimatedHours: 10.5,
        description: `🏠 JANUARY RESET FRAMEWORK

REALITY: Kids forgot everything over break. Start fresh. Cold weather limits outdoor exploration.

TARGET: Re-establish routines, then explore
ACTUAL LESSONS: 14 planned → 10-14 based on weather

WEEK 1 (Jan 5-9): GENTLE RETURN
• Review school/classroom first
• No new content for 3 days
• Lesson 1 can wait until Week 2

WEEK 2-3: NEIGHBORHOOD (IF POSSIBLE)
• Bundle up for walks IF weather allows
• Otherwise: Virtual tours, photos, maps
• Each "walk" can be 1-3 lessons

WINTER WEATHER PROTOCOL:
• -20°C? Indoor neighborhood with photos
• Blizzard? Build neighborhood with blocks
• Ice storm? Snow day packet ready
• January thaw? OUTSIDE IMMEDIATELY!

FLEXIBLE STRUCTURE:
• Lessons 1-4: School neighborhood (always accessible)
• Lessons 5-8: Community places (weather dependent)
• Lessons 9-11: Mapping (indoor activity)
• Lessons 12-14: Review/extend if time

CABIN FEVER ACCOMMODATIONS:
• Extra movement breaks
• Neighborhood dance party
• Virtual field trips
• Build and rebuild block neighborhoods`
      }
    });
    console.log('✅ Unit 4: Weather-proof with indoor alternatives\n');

    // UNIT 5: February-March needs report card flexibility
    console.log('🗺️ UNIT 5: Maps - Report Card Season Flexibility');
    await prisma.unitPlan.update({
      where: { id: units[5].id },
      data: {
        estimatedHours: 11,
        description: `🏴‍☠️ FLEXIBLE TREASURE HUNTING

REALITY: Report cards due, March break coming, cabin fever peak, attention spans gone.

TARGET: Make it ALL games and fun
ACTUAL LESSONS: 14 planned → 10-14 through play

REPORT CARD WEEKS (Feb 16-27):
• Teacher stressed? Simple treasure hunts
• Can run same hunt 3 times - kids won't care
• Lesson planning = hide treasures, let kids find

MARCH BREAK DISRUPTION:
• Week before: Kids unfocused
• Week after: Forgot everything
• Solution: Each lesson is standalone

GAME-BASED FLEXIBILITY:
• Every lesson is a treasure hunt
• Bad day? 10-minute hunt is enough
• Good day? Extend to 45 minutes
• Kids love repetition - use it!

ATTENTION SPAN PROTOCOL:
• 15 minutes focus = full lesson credit
• Rest is "free exploration"
• Treasure finding = learning
• No formal assessment needed

CABIN FEVER SOLUTIONS:
• Gym treasure hunts
• Hallway adventures (with permission)
• Playground maps when weather breaks
• Everything is movement-based`
      }
    });
    console.log('✅ Unit 5: Game-based flexibility for late winter doldrums\n');

    // UNIT 6: April-May needs spring fever flexibility
    console.log('🤝 UNIT 6: Citizenship - Spring Reality');
    await prisma.unitPlan.update({
      where: { id: units[6].id },
      data: {
        estimatedHours: 11.25, // Reduced from 15 lessons
        description: `🌸 SPRING FEVER FRAMEWORK

REALITY: Nice weather = lost focus. Kids want OUTSIDE. Energy is chaos.

TARGET: Integrate citizenship into daily life
ACTUAL LESSONS: 15 planned → 12 realistic (merge lessons 1-3, 7-9, 13-15)

APRIL (Spring Fever Starts):
• First nice day? OUTSIDE for outdoor citizenship
• Rainy? Indoor classroom jobs
• Assessment? Kids being kind = success

MAY (Peak Chaos):
• Field day practice interruptions
• Mother's Day craft time
• Random assemblies
• Solution: 3-minute citizenship moments

INTEGRATED FLEXIBILITY:
• Citizenship = classroom jobs (all day)
• No separate lessons needed
• Being kind = doing Social Studies
• Helping = learning objective met

NICE WEATHER PROTOCOL:
• Take EVERYTHING outside
• Outdoor classroom helpers
• Playground citizenship
• Nature cleanup = civic responsibility

REDUCED LESSON PLAN:
• Lessons 1-3 merge: "What is helping?"
• Lessons 4-6: Classroom jobs (ongoing)
• Lessons 7-9 merge: "Kindness week"
• Lessons 10-12: Sharing and turns
• Lessons 13-15 merge: Celebration

15 becomes 12 naturally!`
      }
    });
    console.log('✅ Unit 6: Integrated with daily routines, reduced to 12 lessons\n');

    // UNIT 7: June needs end-of-year flexibility
    console.log('🌍 UNIT 7: Connections - June Survival');
    await prisma.unitPlan.update({
      where: { id: units[7].id },
      data: {
        estimatedHours: 10.5,
        description: `🎓 JUNE SURVIVAL GUIDE

REALITY: June is not for teaching. It's for celebrating and surviving.

TARGET: Fun connections while managing chaos
ACTUAL LESSONS: 14 planned → 7-10 realistic

JUNE REALITY:
• Week 1: Field day prep
• Week 2: Report cards due
• Week 3: Class parties
• Week 4: Cleanup and goodbye

FLEXIBLE IMPLEMENTATION:
• Each "lesson" = 20 minutes max
• Can be during snack time
• Videos are perfectly fine
• Crafts count as lessons

END-OF-YEAR PROTOCOL:
• Lost 3 days to field day? Expected!
• Class party instead? That's cultural connection!
• Watching a movie? Global awareness!
• Cleaning classroom? Community service!

SIMPLIFIED STRUCTURE:
• Lessons 1-5: Pen pals (if energy exists)
• Lessons 6-10: Videos about other places
• Lessons 11-14: Summer planning (optional)

JUNE HEAT PLAN:
• Too hot? Videos with popsicles
• Nice day? Outdoor cultural games
• Raining? Indoor dance party
• Give up? Photo slideshow of year

FINAL WEEK:
• No new content after June 15
• Celebration and reflection only
• Having fun = meeting objectives
• Survival = success!`
      }
    });
    console.log('✅ Unit 7: June-proof with 50% reduction option\n');

    console.log('🎉 UNITS NOW HAVE REAL FLEXIBILITY!');
    console.log('=====================================');
    console.log('✅ September survival mode built in');
    console.log('✅ December can shrink by 40%');
    console.log('✅ Weather contingencies throughout');
    console.log('✅ Report card stress accommodated');
    console.log('✅ Spring fever expected and planned for');
    console.log('✅ June survival mode activated');
    console.log('✅ Every unit can shrink or expand as needed');
    console.log('✅ 20-30% time buffers everywhere');
    console.log('\n🎓 Emily can now teach with REAL confidence!');
    console.log('These units will survive the beautiful chaos of Grade 1!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeUnitsPerfectWithFlexibility().catch(console.error);