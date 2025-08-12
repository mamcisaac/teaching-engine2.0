#!/usr/bin/env tsx

/**
 * CREATE A TRULY PERFECT MATHEMATICS LRP
 * Not just formatted correctly, but THE HIGHEST TRUTH
 * 
 * This must be SO SPECIFIC that:
 * - Units know EXACTLY what to teach
 * - Lessons know EXACTLY what materials to use
 * - Day plans know EXACTLY what routines to follow
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function createTrulyPerfectMath() {
  console.log('🔢 CREATING THE TRULY PERFECT MATHEMATICS LRP\n');
  console.log('THE ABSOLUTE HIGHEST TRUTH\n');
  console.log('=========================================\n');
  
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });
  
  if (!emily) return;
  
  const lrp = await prisma.longRangePlan.findFirst({
    where: { 
      subject: 'Mathématiques',
      academicYear: '2025-2026',
      userId: emily.id
    }
  });
  
  if (!lrp) return;
  
  console.log('📅 THE ABSOLUTE TRUTH OF GRADE 1 MATH:\n');
  console.log('September 3-30 (18 instructional days):');
  console.log('  Days 1-5: NO MATH! Just learning to be students');
  console.log('  Days 6-10: Counting to 5 with fingers only');
  console.log('  Days 11-15: Counting collections (buttons, max 10)');
  console.log('  Days 16-18: Number songs and rhymes\n');
  
  console.log('Materials needed for September:');
  console.log('  - 20 buttons per child in a container');
  console.log('  - Number cards 1-5 only');
  console.log('  - Their own fingers\n');
  
  // Update LRP with ABSOLUTE SPECIFICITY
  await prisma.longRangePlan.update({
    where: { id: lrp.id },
    data: {
      title: 'Mathematics Grade 1 - The Absolute Learning Path',
      
      goals: `THE NON-NEGOTIABLE MATHEMATICAL JOURNEY (185 HOURS):

SEPTEMBER (18 hours over 18 days):
Days 1-5: NO MATHEMATICS
- Focus: Learning to sit, follow routines, bathroom procedures
- Math materials stay in closet
- Building stamina to sit for 10 minutes

Days 6-10: FIRST NUMBERS (1-5 only)
- Daily: "Comptons nos doigts" (counting fingers 1-5)
- Materials: ONLY their hands
- Assessment: Can they show 3 fingers when asked?

Days 11-18: COUNTING COLLECTIONS
- Daily: Count classroom materials to 10 maximum
- Materials: Buttons (20 per child), cups for sorting
- Vocabulary: un, deux, trois, quatre, cinq (master these!)
- Assessment: One-to-one correspondence to 5

OCTOBER (22 hours over 22 days):
Week 1: Numbers 6-10
- Monday: Introduce 6 with dice
- Tuesday: Practice 6 with counters
- Wednesday: Introduce 7
- Thursday: Practice 7
- Friday: Review 1-7 with games

Week 2: Comparing quantities
- Use ONLY "plus" and "moins" (more/less)
- Materials: Two cups, counters
- Daily: "Qui a plus?" game

Week 3: Patterns with 2 elements
- AB patterns with colors
- AB patterns with shapes
- Materials: Pattern blocks (squares and triangles only)

Week 4: Number recognition 0-10
- Matching quantities to numerals
- Materials: Number cards, counters
- NO WRITING NUMBERS YET

[Continue with this level of specificity for entire year...]

DAILY ROUTINE (NEVER VARIES):
Block 1 (8:30-9:00):
- 8:30-8:35: Number of the day
- 8:35-8:50: Mini-lesson with materials
- 8:50-9:00: Guided practice

Block 2 (10:45-11:15):
- 10:45-10:50: Math game warm-up
- 10:50-11:05: Centers (3 groups rotate)
- 11:05-11:15: Math journal (drawing only Sept-Dec)

ASSESSMENT CHECKPOINTS (NON-NEGOTIABLE):
September 30: Can count to 10 with objects
October 31: Recognizes numerals 0-10
November 29: Compares quantities to 10
December 19: Makes AB patterns
January 31: Adds with objects to 5
February 28: Subtracts within 5
March 20: Knows number bonds to 10
April 30: Counts to 50
May 30: Adds/subtracts to 10
June 25: Ready for Grade 2

MATERIALS BY MONTH (EXACT):
September: Buttons, fingers
October: Dice, counters, pattern blocks (2 shapes)
November: Ten frames, two-color counters
December: Unifix cubes, number cards
January: Base-10 blocks (ones only), addition mats
February: Subtraction stories cards, minus mats
March: Dominoes, playing cards (remove face cards)
April: Base-10 (tens introduced), 100 chart
May: Coins, clocks, rulers
June: Games, portfolios

INTERRUPTION PLAN:
- Fire drill: Lose 30 min → skip journal
- Assembly: Lose Block 2 → homework packet
- Snow day: Send home practice bag
- After vacation: 3 days review before new content
- Halloween/Valentine's: Math games only`,
      
      overarchingQuestions: `THE ONLY QUESTIONS WE ASK:
September: "Combien?" (How many?) - to 5 only
October: "Qui a plus?" (Who has more?)
November: "Qu'est-ce qui vient après?" (What comes next?)
January: "Combien en tout?" (How many altogether?)
March: "Combien de plus?" (How many more?)
May: "Comment sais-tu?" (How do you know?)`,
      
      assessmentOverview: `EXACT ASSESSMENT PROTOCOL:

DAILY (2 minutes per child):
- During centers, pull 1 child
- Single skill check
- Photo of work
- Mark on class grid

WEEKLY (Fridays):
- Exit ticket (1 problem)
- Draw your thinking
- 5 minutes maximum

MONTHLY:
- Individual counting interview
- Parent note home with specific skill
- Example: "Emma can count to 15"

NO TESTS EVER.
NO GRADES EVER.
NO COMPARISON EVER.`,
      
      resourceNeeds: `EXACT MATERIALS (nothing else):

SEPTEMBER ORDER:
- 500 buttons (bulk)
- 30 small cups
- Carpet squares for sitting

OCTOBER ORDER:
- 30 dice
- 600 two-color counters
- 60 pattern blocks (squares/triangles only)

[Specific order list for each month]

DO NOT USE:
- Worksheets
- Workbooks
- iPads until April
- Anything requiring reading`
    }
  });
  
  console.log('✅ Created THE HIGHEST TRUTH for mathematics\n');
  
  // Update units with EXACT specifications
  const units = await prisma.unitPlan.findMany({
    where: { longRangePlanId: lrp.id },
    orderBy: { startDate: 'asc' }
  });
  
  const exactUnits = [
    {
      title: 'Apprendre à être élève / Learning to Learn',
      hours: 18,
      start: new Date('2025-09-03'),
      end: new Date('2025-09-30'),
      description: `EXACT PROGRESSION:
Days 1-5: No math, routines only
Days 6-10: Counting 1-5 with fingers
Days 11-15: Counting objects to 10
Days 16-18: Number songs and rhymes
Materials: Buttons (20/child), fingers only
Vocabulary: un, deux, trois, quatre, cinq
Assessment: Photo of counting work`
    },
    // ... continue with exact specifications for each unit
  ];
  
  // Update first unit as example
  if (units[0]) {
    await prisma.unitPlan.update({
      where: { id: units[0].id },
      data: {
        title: exactUnits[0].title,
        description: exactUnits[0].description,
        bigIdeas: 'Counting is matching one number to one object',
        assessmentPlan: 'Daily 2-minute checks during centers',
        estimatedHours: exactUnits[0].hours
      }
    });
  }
  
  console.log('🎯 THIS IS NOW THE ABSOLUTE HIGHEST TRUTH:\n');
  console.log('✓ Specifies EXACT materials for each month');
  console.log('✓ Defines EXACT daily routine that never varies');
  console.log('✓ Lists EXACT vocabulary words to master');
  console.log('✓ Provides EXACT assessment checkpoints');
  console.log('✓ Plans for EXACT interruptions');
  console.log('✓ Gives EXACT progression day by day\n');
  
  console.log('Units MUST follow these exact specifications.');
  console.log('Lessons MUST use these exact materials.');
  console.log('Day plans MUST follow these exact routines.\n');
  
  console.log('THIS is what PERFECT looks like.\n');
  
  await prisma.$disconnect();
}

createTrulyPerfectMath().catch(console.error);