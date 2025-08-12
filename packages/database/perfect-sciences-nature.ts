#!/usr/bin/env tsx

/**
 * CREATE THE TRULY PERFECT SCIENCES DE LA NATURE LRP
 * Based on how 6-year-olds actually learn science
 * Hands-on, concrete, PEI-focused
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function createPerfectSciences() {
  console.log('🔬 CREATING THE TRULY PERFECT SCIENCES DE LA NATURE LRP\n');
  console.log('Based on Grade 1 hands-on discovery learning\n');
  console.log('==========================================\n');
  
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });
  
  if (!emily) {
    console.log('ERROR: Emily not found');
    return;
  }
  
  const lrp = await prisma.longRangePlan.findFirst({
    where: {
      subject: 'Sciences de la nature',
      academicYear: '2025-2026',
      userId: emily.id
    }
  });
  
  if (!lrp) {
    console.log('ERROR: Sciences LRP not found');
    return;
  }
  
  // Get all science expectations
  const expectations = await prisma.curriculumExpectation.findMany({
    where: {
      subject: 'Sciences de la nature',
      grade: 1
    },
    orderBy: { code: 'asc' }
  });
  
  console.log(`Found ${expectations.length} science expectations to link\n`);
  
  // Link ALL expectations to LRP
  await prisma.longRangePlanExpectation.deleteMany({
    where: { longRangePlanId: lrp.id }
  });
  
  for (const exp of expectations) {
    await prisma.longRangePlanExpectation.create({
      data: {
        longRangePlanId: lrp.id,
        expectationId: exp.id
      }
    });
    console.log(`✓ Linked expectation ${exp.code}`);
  }
  
  console.log('\n📅 SCIENCE SCHEDULE REALITY:\n');
  console.log('90 hours total across 181 days');
  console.log('= 3 science blocks per 6-day cycle');
  console.log('= 30 minutes of hands-on exploration\n');
  
  // Update LRP with REALITY
  await prisma.longRangePlan.update({
    where: { id: lrp.id },
    data: {
      title: 'Sciences de la nature - Grade 1 Discovery Journey',
      
      goals: `REALISTIC 90-HOUR SCIENCE EXPLORATION:

SEPTEMBER (8 hours): SCIENCE ROUTINES & WONDER
- Learning to observe (using senses, not writing)
- Science safety and materials
- "Je me demande..." (I wonder) questions
- Exploring schoolyard nature

OCTOBER (10 hours): FALL IN PEI
- Observing fall changes (leaves, weather)
- Collecting and sorting natural materials
- Animals preparing for winter
- Simple weather observations

NOVEMBER (10 hours): NEEDS OF LIVING THINGS
- What plants need (water, light experiments)
- What animals need (including us!)
- Classroom plant care
- Observing growth and change

DECEMBER (7 hours): MATERIALS & OBJECTS
- Properties of materials (hard/soft, rough/smooth)
- Floating and sinking
- Building and testing
- Holiday science (ice, snow if we have it!)

JANUARY (10 hours): FORCES & MOVEMENT
- Push and pull explorations
- How things move
- Ramps and rolling
- Simple machines in our classroom

FEBRUARY (10 hours): LIGHT & SHADOWS
- Shadow explorations
- Light sources
- Colors and rainbows
- Day and night

MARCH (8 hours): SOUND & VIBRATIONS
- Making sounds
- Musical instruments from materials
- Loud and soft, high and low
- How we hear

APRIL (10 hours): SPRING CHANGES
- New growth observations
- Baby animals
- Planting seeds
- PEI beach exploration

MAY (12 hours): WATER & WEATHER
- Water cycle (simple)
- Rain and clouds
- Water in our lives
- Ocean connections

JUNE (5 hours): CELEBRATING DISCOVERIES
- Science fair (show and tell level)
- Favorite experiments
- Summer science ideas
- Looking back at growth

DAILY STRUCTURE (30-minute blocks):
- 5 min: Review/wonder question
- 20 min: Hands-on exploration
- 5 min: Share discoveries (oral, drawing)

REALITY NOTES:
- NO written lab reports
- Drawing observations, not writing
- French vocabulary kept simple
- Always concrete, hands-on
- PEI context throughout`,
      
      themes: [
        'Observation skills',
        'Living things',
        'Materials and objects',
        'Forces and movement',
        'Light and sound',
        'Weather and seasons',
        'Water and ocean',
        'Plants and animals',
        'Scientific thinking',
        'Environmental awareness'
      ],
      
      overarchingQuestions: `QUESTIONS FOR 6-YEAR-OLDS:
Qu'est-ce que c'est? (What is it?)
Pourquoi? (Why?)
Qu'est-ce qui se passe si...? (What happens if...?)
Comment ça marche? (How does it work?)
Est-ce vivant? (Is it alive?)`,
      
      assessmentOverview: `REALISTIC SCIENCE ASSESSMENT:

WHAT WORKS:
- Photo documentation of explorations
- Drawing observations
- Oral explanations in simple French
- "Show me" demonstrations
- Group discussions

WHAT DOESN'T WORK:
- Written observations (can't write well)
- Science tests
- Abstract concepts
- Long-term projects

MONTHLY FOCUS:
- One big idea per month
- Repeated hands-on experiences
- Building vocabulary slowly
- Celebrating curiosity over correctness`,
      
      resourceNeeds: `REALISTIC SCIENCE MATERIALS:

ESSENTIAL & AVAILABLE:
- Magnifying glasses
- Collection containers
- Natural materials (free!)
- Water table or bins
- Simple balance scale
- Flashlights
- Mirrors
- Magnets
- Ramps (boards)
- Balls and objects that roll

OUTDOOR RESOURCES:
- School yard
- Local beach (field trips)
- Weather observation area
- Garden space

NOT NEEDED:
- Science textbooks
- Worksheets
- Microscopes (too advanced)
- Complex equipment`
    }
  });
  
  console.log('✅ Updated LRP with reality-based science framework\n');
  
  // Update units to EXACTLY 90 hours
  const units = await prisma.unitPlan.findMany({
    where: { longRangePlanId: lrp.id },
    orderBy: { startDate: 'asc' }
  });
  
  const realUnits = [
    {
      title: 'Devenir scientifique / Becoming Scientists',
      hours: 8,
      start: new Date('2025-09-03'),
      end: new Date('2025-09-30'),
      description: 'SEPT: Science routines, wonder questions, observing with senses',
      expectations: ['1.1.1'] // Scientific thinking
    },
    {
      title: 'L\'automne à l\'Î.-P.-É. / Fall in PEI',
      hours: 10,
      start: new Date('2025-10-01'),
      end: new Date('2025-10-31'),
      description: 'OCT: Fall changes, collecting, sorting, weather observations',
      expectations: ['1.3.1'] // Seasons and weather
    },
    {
      title: 'Les êtres vivants / Living Things',
      hours: 10,
      start: new Date('2025-11-03'),
      end: new Date('2025-11-28'),
      description: 'NOV: Needs of plants and animals, growth, classroom plants',
      expectations: ['1.2.1'] // Living things
    },
    {
      title: 'Matériaux et objets / Materials and Objects',
      hours: 7,
      start: new Date('2025-12-01'),
      end: new Date('2025-12-19'),
      description: 'DEC: Properties, floating/sinking, building, holiday science',
      expectations: ['1.1.2'] // Properties of materials
    },
    {
      title: 'Forces et mouvement / Forces and Movement',
      hours: 10,
      start: new Date('2026-01-06'),
      end: new Date('2026-01-30'),
      description: 'JAN: Push/pull, ramps, rolling, simple machines',
      expectations: ['1.3.2'] // Forces
    },
    {
      title: 'Lumière et ombres / Light and Shadows',
      hours: 10,
      start: new Date('2026-02-02'),
      end: new Date('2026-02-27'),
      description: 'FEB: Shadows, light sources, colors, day/night',
      expectations: ['1.1.2', '1.3.2'] // Light properties
    },
    {
      title: 'Sons et vibrations / Sounds and Vibrations',
      hours: 8,
      start: new Date('2026-03-02'),
      end: new Date('2026-03-20'),
      description: 'MAR: Making sounds, instruments, loud/soft, how we hear',
      expectations: ['1.3.2'] // Sound and vibrations
    },
    {
      title: 'Le printemps arrive / Spring Arrives',
      hours: 10,
      start: new Date('2026-04-01'),
      end: new Date('2026-04-30'),
      description: 'APR: New growth, baby animals, planting, beach exploration',
      expectations: ['1.2.1', '1.3.1'] // Living things and seasons
    },
    {
      title: 'L\'eau et la météo / Water and Weather',
      hours: 12,
      start: new Date('2026-05-01'),
      end: new Date('2026-05-29'),
      description: 'MAY: Water cycle, rain, ocean, outdoor explorations',
      expectations: ['1.3.1', '1.3.2'] // Water and weather
    },
    {
      title: 'Célébration scientifique / Science Celebration',
      hours: 5,
      start: new Date('2026-06-01'),
      end: new Date('2026-06-25'),
      description: 'JUNE: Science fair, favorite experiments, summer science',
      expectations: ['1.1.1'] // Scientific thinking review
    }
  ];
  
  // Verify total
  const totalHours = realUnits.reduce((sum, u) => sum + u.hours, 0);
  console.log(`Total hours planned: ${totalHours}/90\n`);
  
  // Update existing units
  for (let i = 0; i < Math.min(units.length, realUnits.length); i++) {
    const spec = realUnits[i];
    
    await prisma.unitPlan.update({
      where: { id: units[i].id },
      data: {
        title: spec.title,
        titleFr: spec.title.split(' / ')[0],
        estimatedHours: spec.hours,
        startDate: spec.start,
        endDate: spec.end,
        description: spec.description,
        bigIdeas: 'Exploration through hands-on discovery',
        assessmentPlan: 'Observation, photos, oral sharing, drawings'
      }
    });
    
    // Update expectations
    await prisma.unitPlanExpectation.deleteMany({
      where: { unitPlanId: units[i].id }
    });
    
    for (const expCode of spec.expectations) {
      const exp = expectations.find(e => e.code === expCode);
      if (exp) {
        await prisma.unitPlanExpectation.create({
          data: {
            unitPlanId: units[i].id,
            expectationId: exp.id
          }
        });
      }
    }
    
    console.log(`✅ Unit ${i+1}: ${spec.title} (${spec.hours}h)`);
    console.log(`   ${spec.description}`);
  }
  
  // Handle extra units
  if (units.length > realUnits.length) {
    for (let i = realUnits.length; i < units.length; i++) {
      await prisma.unitPlan.delete({ where: { id: units[i].id } });
      console.log(`Removed extra unit ${i+1}`);
    }
  } else if (realUnits.length > units.length) {
    for (let i = units.length; i < realUnits.length; i++) {
      const spec = realUnits[i];
      const newUnit = await prisma.unitPlan.create({
        data: {
          userId: emily.id,
          longRangePlanId: lrp.id,
          title: spec.title,
          titleFr: spec.title.split(' / ')[0],
          estimatedHours: spec.hours,
          startDate: spec.start,
          endDate: spec.end,
          description: spec.description,
          bigIdeas: 'Exploration through hands-on discovery',
          assessmentPlan: 'Observation, photos, oral sharing, drawings'
        }
      });
      
      for (const expCode of spec.expectations) {
        const exp = expectations.find(e => e.code === expCode);
        if (exp) {
          await prisma.unitPlanExpectation.create({
            data: {
              unitPlanId: newUnit.id,
              expectationId: exp.id
            }
          });
        }
      }
      
      console.log(`✅ Created Unit ${i+1}: ${spec.title} (${spec.hours}h)`);
    }
  }
  
  console.log('\n🎯 KEY FEATURES OF THIS PERFECT SCIENCE LRP:');
  console.log('  ✓ EXACTLY 90 hours (matches allocation)');
  console.log('  ✓ All 5 expectations linked and distributed');
  console.log('  ✓ PEI context (beaches, seasons, ocean)');
  console.log('  ✓ Hands-on only (no worksheets)');
  console.log('  ✓ September = routines, not content');
  console.log('  ✓ June = celebration (only 5 hours)');
  console.log('  ✓ Assessment through observation/photos');
  console.log('  ✓ French vocabulary kept simple');
  
  console.log('\n✨ SCIENCES DE LA NATURE IS NOW THE HIGHEST TRUTH!');
  console.log('Based on how 6-year-olds actually explore science.\n');
  
  await prisma.$disconnect();
}

createPerfectSciences().catch(console.error);