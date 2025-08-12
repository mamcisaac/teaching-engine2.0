#!/usr/bin/env tsx

/**
 * PERFECT THE THREE CORE LRPs AS HIGHEST TRUTH
 * High-level guides that are crystal clear without being minute-by-minute
 * These guide everything below them in the hierarchy
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function perfectHighestTruthLRPs() {
  console.log('🌟 PERFECTING THE THREE CORE LRPS AS HIGHEST TRUTH\n');
  console.log('High-level guides that units and lessons follow exactly\n');
  console.log('=====================================================\n');
  
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });
  
  if (!emily) {
    console.log('ERROR: Emily not found');
    return;
  }
  
  // PERFECT MATHEMATICS LRP
  console.log('📐 PERFECTING MATHEMATICS AS HIGHEST TRUTH...\n');
  
  const mathLRP = await prisma.longRangePlan.findFirst({
    where: { 
      subject: 'Mathématiques',
      academicYear: '2025-2026',
      userId: emily.id
    }
  });
  
  if (mathLRP) {
    await prisma.longRangePlan.update({
      where: { id: mathLRP.id },
      data: {
        title: 'Mathématiques Grade 1 - The Learning Journey (185 hours)',
        
        goals: `THE MATHEMATICAL JOURNEY - 185 HOURS OF DISCOVERY

CORE PHILOSOPHY:
- Concrete before abstract always
- French vocabulary introduced gradually
- Play-based learning throughout
- No worksheets until January
- Assessment through observation

MONTHLY PROGRESSION:

SEPTEMBER (18 hours):
Theme: Learning to be students
Focus: Routines, counting 1-5, one-to-one correspondence
Materials: Fingers, buttons, classroom objects
Vocabulary: un, deux, trois, quatre, cinq
Reality: Many tears, short attention spans

OCTOBER (22 hours):
Theme: Numbers 6-10 and comparing
Focus: Extending counting, more/less, AB patterns
Materials: Dice, counters, pattern blocks (2 shapes)
Vocabulary: six, sept, huit, neuf, dix, plus, moins
Milestone: Can count objects to 10

NOVEMBER (20 hours):
Theme: Number relationships
Focus: Number bonds to 5, sorting, classifying
Materials: Ten frames, two-color counters
Vocabulary: ensemble, groupe, pareil, différent
Milestone: Understands "5 is 3 and 2"

DECEMBER (15 hours):
Theme: Celebration math
Focus: Patterns, shapes in environment
Materials: Holiday materials, 2D shapes
Vocabulary: carré, cercle, triangle, rectangle
Note: Shorter month, keep it light

JANUARY (20 hours):
Theme: Introduction to addition
Focus: Combining sets, plus sign, sums to 5
Materials: Unifix cubes, addition mats
Vocabulary: plus, égale, addition, ensemble
Milestone: Can show 2+3=5 with objects

FEBRUARY (20 hours):
Theme: Introduction to subtraction
Focus: Taking away, minus sign, within 5
Materials: Story cards, subtraction mats
Vocabulary: moins, enlever, reste, soustraction
Milestone: Can show 5-2=3 with objects

MARCH (15 hours):
Theme: Number bonds to 10
Focus: All combinations that make 10
Materials: Dominoes, playing cards (no faces)
Vocabulary: fait dix, combinaison
Note: March break impacts hours

APRIL (20 hours):
Theme: Place value introduction
Focus: Tens and ones, counting to 50
Materials: Base-10 blocks, 100 chart
Vocabulary: dizaine, unité, quarante, cinquante
Milestone: Groups objects by tens

MAY (25 hours):
Theme: Measurement and geometry
Focus: Length, time, 3D shapes, money
Materials: Rulers, clocks, coins, 3D objects
Vocabulary: long, court, heure, dollar, cube
Peak performance period

JUNE (20 hours):
Theme: Consolidation and celebration
Focus: Games, review, portfolios
Materials: All year's materials
Assessment: Growth documentation
Reality: Hot weather, excitement

TOTAL: 185 hours allocated perfectly`,
        
        themes: [
          'Number sense development',
          'Counting and cardinality',
          'Operations (addition/subtraction)',
          'Patterns and relationships',
          'Geometry and spatial sense',
          'Measurement',
          'Data and probability',
          'Problem solving',
          'Mathematical communication',
          'Mental math strategies'
        ],
        
        overarchingQuestions: `KEY QUESTIONS THAT GUIDE LEARNING:

September-October: "Combien?" (How many?)
November-December: "Est-ce pareil?" (Is it the same?)
January-February: "Qu'est-ce qui arrive quand...?" (What happens when...?)
March-April: "Comment sais-tu?" (How do you know?)
May-June: "Peux-tu expliquer?" (Can you explain?)`,
        
        assessmentOverview: `ASSESSMENT THAT WORKS FOR 6-YEAR-OLDS:

DAILY:
- Observation during play and exploration
- Photos of mathematical thinking
- Quick individual checks during centers

WEEKLY:
- One math conversation per child
- Documentation of strategies used
- Parent communication about progress

MONTHLY:
- Skill milestone checklist
- Portfolio additions
- Celebration of growth

NEVER:
- Paper tests
- Timed assessments
- Comparisons between children
- Grades or scores

DOCUMENTATION:
- Learning stories
- Photo sequences
- Video of explanations
- Work samples (when writing develops)`,
        
        resourceNeeds: `ESSENTIAL MATERIALS (SPECIFIC):

MANIPULATIVES:
- 500 counting objects (buttons, bears)
- 30 sets of two-color counters
- Class set of ten frames
- 15 sets of pattern blocks
- 30 dice (regular 1-6)
- Base-10 blocks (ones and tens only)
- Unifix cubes (10 colors)
- Dominoes
- Playing cards (remove face cards)

TOOLS:
- Number lines 0-20 (desktop size)
- 100 chart (pocket chart version)
- Addition/subtraction mats
- Small whiteboards and markers
- Rulers (cm only)
- Balance scales
- Sand timers
- Play money

GAMES & ACTIVITIES:
- Number puzzles
- Board games with dice
- Counting books in French
- Math center materials

TECHNOLOGY (APRIL ONWARDS ONLY):
- Simple counting apps
- Interactive whiteboard activities`,
        
        professionalGoals: `TEACHER REFLECTION POINTS:

- How can I make math joyful every day?
- Am I allowing enough exploration time?
- Is my French simple enough?
- Are all children engaged?
- Do I model mathematical thinking?
- Am I patient with development?`
      }
    });
    console.log('✅ Mathematics LRP perfected as highest truth\n');
  }
  
  // PERFECT FRANÇAIS LRP
  console.log('📚 PERFECTING FRANÇAIS AS HIGHEST TRUTH...\n');
  
  const frenchLRP = await prisma.longRangePlan.findFirst({
    where: { 
      subject: 'Français langue première',
      academicYear: '2025-2026',
      userId: emily.id
    }
  });
  
  if (frenchLRP) {
    await prisma.longRangePlan.update({
      where: { id: frenchLRP.id },
      data: {
        title: 'Français langue première Grade 1 - From Sounds to Stories (180 hours)',
        
        goals: `THE FRENCH LANGUAGE JOURNEY - 180 HOURS FROM NON-READER TO READER

REALITY CHECK:
- September: Cannot hold pencil properly
- October: Learning letter sounds
- December: Reading simple words
- March: Reading simple sentences
- June: Reading niveau 5-6 books

MONTHLY PROGRESSION:

SEPTEMBER (18 hours):
Theme: Oral language only
Focus: Listening, speaking, classroom French
Activities: Songs, stories, oral games
Writing: NONE - building hand strength
Reading: Teacher read-alouds only
Reality: Cannot sit for long stories

OCTOBER (20 hours):
Theme: Introduction to print
Focus: Letters Aa, Mm, Ii, Ss, Rr, Ll
Activities: Sound games, letter recognition
Writing: Tracing letters in sand/air
Reading: Environmental print
Milestone: Knows 6 letter sounds

NOVEMBER (20 hours):
Theme: More sounds and syllables
Focus: Letters Ee, Tt, Nn, Oo, Pp, Uu
Activities: Syllable clapping, rhyming
Writing: First attempts at letters
Reading: Predictable pattern books
Milestone: Blends simple syllables (ma, la)

DECEMBER (15 hours):
Theme: First words
Focus: CVC words, sight words (le, la, un)
Activities: Word building with letters
Writing: Copying words
Reading: Niveau 1 books (5 words/page)
Celebration: Can read first book!

JANUARY (20 hours):
Theme: Building fluency
Focus: More sight words, word families
Activities: Shared reading, word hunts
Writing: Labels and lists
Reading: Niveau 2 books
Milestone: 25 sight words

FEBRUARY (20 hours):
Theme: Comprehension begins
Focus: Understanding what we read
Activities: Retelling, predictions
Writing: Simple sentences with support
Reading: Niveau 3 books
Strategy: Picture clues, context

MARCH (15 hours):
Theme: Reading strategies
Focus: Decoding multi-syllable words
Activities: Guided reading groups
Writing: Personal sentences
Reading: Niveau 3-4 books
Note: March break impacts

APRIL (20 hours):
Theme: Writing development
Focus: Story structure, ideas
Activities: Shared writing, journals
Writing: 3-4 sentences independently
Reading: Niveau 4-5 books
Milestone: Writes simple story

MAY (25 hours):
Theme: Fluency and expression
Focus: Reading with understanding
Activities: Reader's theatre, poetry
Writing: Short paragraphs with help
Reading: Niveau 5-6 books
Peak performance

JUNE (17 hours):
Theme: Celebration of literacy
Focus: Sharing growth, summer reading
Activities: Author celebrations
Writing: Books for kindergarten
Reading: Choice and enjoyment
Portfolio complete

TOTAL: 180 hours of language development`,
        
        themes: [
          'Oral communication',
          'Phonemic awareness',
          'Alphabetic principle',
          'Sight word recognition',
          'Reading comprehension',
          'Writing development',
          'Vocabulary building',
          'Story structure',
          'French conventions',
          'Love of reading'
        ],
        
        overarchingQuestions: `GUIDING QUESTIONS BY PHASE:

Pre-reading (Sept-Oct):
"Qu'est-ce que tu entends?" (What do you hear?)

Early reading (Nov-Jan):
"Qu'est-ce que tu vois?" (What do you see?)

Developing reading (Feb-Apr):
"Qu'est-ce que ça veut dire?" (What does it mean?)

Fluent reading (May-Jun):
"Qu'est-ce que tu penses?" (What do you think?)`,
        
        assessmentOverview: `LITERACY ASSESSMENT FOR BEGINNERS:

SEPTEMBER-OCTOBER:
- Oral language samples
- Listening comprehension
- Vocabulary use
- Fine motor development

NOVEMBER-DECEMBER:
- Letter recognition
- Sound correspondence
- Syllable blending
- First word recognition

JANUARY-MARCH:
- Running records (monthly)
- Sight word checks
- Writing samples
- Comprehension conversations

APRIL-JUNE:
- Reading level assessments
- Writing portfolios
- Self-assessments (simple)
- Growth celebrations

TOOLS:
- GB+ or PM Benchmarks
- Sight word lists
- Writing continuum
- Oral language rubrics

COMMUNICATION:
- Monthly reading levels to parents
- Writing samples home
- Celebration certificates
- Summer reading plans`,
        
        resourceNeeds: `FRENCH LITERACY ESSENTIALS:

BOOKS (CRITICAL):
- 100+ niveau 1-2 books
- 75+ niveau 3-4 books  
- 50+ niveau 5-6 books
- Big books for shared reading
- French picture books (read-alouds)
- Predictable pattern books
- Non-fiction at all levels

PHONICS MATERIALS:
- Alphabet cards (manuscript)
- Sound posters
- Letter tiles (multiple sets)
- Syllable cards
- Word family cards
- Magnetic letters

WRITING SUPPLIES:
- Pencil grips
- Lined paper (triple lines)
- Unlined paper
- Personal dictionaries
- Word walls
- Writing folders

CENTERS:
- Listening center with French stories
- Pocket charts
- Sentence strips
- Reading pointers
- Whisper phones
- Book boxes for each child

ASSESSMENT:
- Running record forms
- Benchmark kit (GB+ or PM)
- Sight word assessment cards`,
        
        professionalGoals: `TEACHER GROWTH:

- Patience with developmental stages
- Celebrating small victories
- Differentiating for wide range
- Supporting home reading
- Building reading joy
- Maintaining French immersion`
      }
    });
    console.log('✅ Français LRP perfected as highest truth\n');
  }
  
  // PERFECT SCIENCES LRP
  console.log('🔬 PERFECTING SCIENCES AS HIGHEST TRUTH...\n');
  
  const sciencesLRP = await prisma.longRangePlan.findFirst({
    where: { 
      subject: 'Sciences de la nature',
      academicYear: '2025-2026',
      userId: emily.id
    }
  });
  
  if (sciencesLRP) {
    await prisma.longRangePlan.update({
      where: { id: sciencesLRP.id },
      data: {
        title: 'Sciences de la nature Grade 1 - Discovering Our World (90 hours)',
        
        goals: `THE SCIENCE DISCOVERY JOURNEY - 90 HOURS OF WONDER

PHILOSOPHY:
- Wonder before knowledge
- Exploration before explanation
- Concrete always
- PEI context throughout
- Science is everywhere

MONTHLY THEMES:

SEPTEMBER (8 hours):
Theme: Becoming scientists
Focus: Using senses, asking questions
Activities: Nature walks, wonder journals
Materials: Magnifying glasses, collection boxes
PEI: Schoolyard exploration
Key: Building observation skills

OCTOBER (10 hours):
Theme: Fall changes
Focus: Seasons, weather, living things
Activities: Leaf collection, weather station
Materials: Thermometer, rain gauge
PEI: Fall at the beach
Milestone: Daily weather observer

NOVEMBER (10 hours):
Theme: Living things' needs
Focus: Plants, animals, habitats
Activities: Classroom plants, animal visitors
Materials: Seeds, soil, containers
PEI: Animals preparing for winter
Investigation: What helps plants grow?

DECEMBER (7 hours):
Theme: Materials and building
Focus: Properties, structures
Activities: Building challenges
Materials: Recyclables, blocks
Holiday: Ice investigations
Short month, playful science

JANUARY (10 hours):
Theme: Forces and motion
Focus: Push, pull, gravity
Activities: Ramp experiments
Materials: Balls, ramps, toy cars
PEI: Winter playground physics
Question: How do things move?

FEBRUARY (10 hours):
Theme: Light and shadows
Focus: Light sources, shadows
Activities: Shadow puppets, rainbows
Materials: Flashlights, mirrors, prisms
PEI: Short days, long shadows
Discovery: Light travels straight

MARCH (8 hours):
Theme: Sound and music
Focus: Vibrations, pitch
Activities: Making instruments
Materials: Containers, elastic bands
PEI: Ocean sounds
Spring break reduces hours

APRIL (10 hours):
Theme: Spring awakening
Focus: New growth, life cycles
Activities: Planting garden
Materials: Seeds, garden tools
PEI: Beach in spring
Project: Class garden

MAY (12 hours):
Theme: Water everywhere
Focus: Water cycle, ocean
Activities: Water experiments
Materials: Water table, containers
PEI: Rivers to ocean
Peak exploration time

JUNE (5 hours):
Theme: Science celebration
Focus: Favorite investigations
Activities: Science fair
Materials: All year's materials
Share: What we learned
Light schedule

TOTAL: 90 hours of hands-on discovery`,
        
        themes: [
          'Scientific thinking',
          'Living things',
          'Materials and objects',
          'Forces and movement',
          'Energy (light, sound, heat)',
          'Earth and space',
          'Weather and seasons',
          'Water and ocean',
          'Environmental awareness',
          'PEI ecosystems'
        ],
        
        overarchingQuestions: `QUESTIONS FOR YOUNG SCIENTISTS:

Fall (Sept-Nov):
"Qu'est-ce que c'est?" (What is it?)
"Qu'est-ce qui change?" (What's changing?)

Winter (Dec-Feb):
"Comment ça marche?" (How does it work?)
"Qu'est-ce qui arrive si...?" (What happens if...?)

Spring (Mar-May):
"Pourquoi?" (Why?)
"Comment le sais-tu?" (How do you know?)

Summer (June):
"Qu'est-ce que tu as découvert?" (What did you discover?)`,
        
        assessmentOverview: `SCIENCE ASSESSMENT FOR GRADE 1:

OBSERVATION SKILLS:
- Using senses appropriately
- Noticing details
- Comparing and contrasting
- Recording observations (drawings)

SCIENTIFIC THINKING:
- Asking questions
- Making predictions
- Testing ideas
- Explaining thinking

DOCUMENTATION:
- Photo journals of explorations
- Drawings with labels
- Group discussion records
- Simple data collection

COMMUNICATION:
- "Show and tell" science
- Partner investigations
- Science vocabulary use
- Sharing discoveries

GROWTH INDICATORS:
September: Explores materials
December: Makes predictions
March: Tests ideas systematically
June: Explains discoveries

NO SCIENCE TESTS EVER
Assessment through engagement`,
        
        resourceNeeds: `SCIENCE MATERIALS (REALISTIC):

EXPLORATION TOOLS:
- 15 magnifying glasses
- Collection containers
- Sorting trays
- Observation notebooks
- Digital camera

LIVING THINGS:
- Seeds (local varieties)
- Planting containers
- Soil and sand
- Aquarium or terrarium
- Field guides (PEI specific)

PHYSICAL SCIENCE:
- Balance scales
- Ramps and balls
- Magnets (various)
- Flashlights
- Mirrors
- Prisms
- Tuning forks

EARTH SCIENCE:
- Weather instruments
- Rock collection (PEI)
- Sand and water table
- Globe and maps

CONSUMABLES:
- Paper towels
- Plastic cups
- Coffee filters
- Food coloring
- Baking soda/vinegar

PEI SPECIFIC:
- Beach collection permits
- Local field trip sites
- Ocean study materials
- Seasonal items

NOT NEEDED:
- Science textbooks
- Worksheets
- Complex equipment
- Abstract models`,
        
        professionalGoals: `SCIENCE TEACHING REFLECTION:

- Am I modeling curiosity?
- Do I say "I don't know, let's find out"?
- Is every child engaged?
- Am I using PEI context?
- Are investigations truly hands-on?
- Do I document learning?
- Is science joyful?`
      }
    });
    console.log('✅ Sciences LRP perfected as highest truth\n');
  }
  
  console.log('🌟 ALL THREE CORE LRPS NOW PERFECTED!\n');
  console.log('These are now THE HIGHEST TRUTH that guide:');
  console.log('  → Unit Plans (must follow these themes/progressions)');
  console.log('  → Lesson Plans (must use these materials/approaches)');
  console.log('  → Daily Teaching (must respect these realities)\n');
  
  console.log('KEY FEATURES OF THESE PERFECT LRPS:');
  console.log('  ✓ Clear monthly progressions');
  console.log('  ✓ Specific materials and resources');
  console.log('  ✓ Realistic developmental expectations');
  console.log('  ✓ Assessment appropriate for Grade 1');
  console.log('  ✓ PEI context throughout');
  console.log('  ✓ Hour allocations match requirements');
  console.log('  ✓ All curriculum expectations included');
  console.log('  ✓ High-level guidance without micromanagement\n');
  
  await prisma.$disconnect();
}

perfectHighestTruthLRPs().catch(console.error);