import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixUnit7Flexibility() {
  console.log('🌍 Fixing Unit 7 with June flexibility...\n');

  try {
    // Get all units to find Unit 7
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98s0007vjr1v0a2ibp5' },
      orderBy: { startDate: 'asc' }
    });

    if (units.length >= 7) {
      const unit7 = units[6]; // 0-indexed, so Unit 7 is at index 6
      
      await prisma.unitPlan.update({
        where: { id: unit7.id },
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
    }

    console.log('🎉 ALL UNITS NOW HAVE REAL FLEXIBILITY!');
    console.log('=========================================');
    console.log('✅ Every unit can expand or contract based on reality');
    console.log('✅ Built-in buffers for disruptions');
    console.log('✅ Weather contingencies included');
    console.log('✅ Seasonal realities acknowledged');
    console.log('✅ Teacher wellness considered');
    console.log('✅ Student engagement prioritized over coverage');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUnit7Flexibility().catch(console.error);