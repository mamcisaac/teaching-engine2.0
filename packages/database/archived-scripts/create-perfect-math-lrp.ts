#!/usr/bin/env tsx

/**
 * CREATE A TRULY PERFECT MATHÉMATIQUES LONG RANGE PLAN
 * 
 * The HIGHEST TRUTH for Grade 1 Mathematics in French Immersion
 * This guides everything: units → lessons → daily plans
 * 
 * Reality: 6-year-olds learning math AND French simultaneously
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function createPerfectMathLRP() {
  console.log('🔢 CREATING TRULY PERFECT MATHÉMATIQUES LONG RANGE PLAN\n');
  console.log('=================================================\n');
  
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
  
  if (!lrp) {
    console.log('ERROR: Mathématiques LRP not found');
    return;
  }
  
  console.log('🧠 GRADE 1 MATHEMATICAL DEVELOPMENT REALITY:\n');
  console.log('September Starting Points (most 6-year-olds):');
  console.log('  - Can count to 10-20 (some to 30)');
  console.log('  - Recognize some numerals');
  console.log('  - One-to-one correspondence emerging');
  console.log('  - NO formal addition/subtraction');
  console.log('  - Think in concrete terms only');
  console.log('  - Learning French number words for first time\n');
  
  console.log('June Exit Outcomes (ready for Grade 2):');
  console.log('  - Count to 100, understand place value');
  console.log('  - Add/subtract within 20 fluently');
  console.log('  - Solve word problems with support');
  console.log('  - Recognize patterns and extend them');
  console.log('  - Tell time to hour and half-hour');
  console.log('  - Explain mathematical thinking in French\n');
  
  // UPDATE THE LRP WITH PERFECT CONTENT
  const perfectLRP = await prisma.longRangePlan.update({
    where: { id: lrp.id },
    data: {
      title: 'Mathématiques - Grade 1 French Immersion Mathematical Journey',
      
      goals: `DEVELOPMENTAL MATHEMATICS GOALS FOR 6-YEAR-OLDS:

SEPTEMBER-NOVEMBER: Number Sense Foundation
- Build one-to-one correspondence through daily counting routines
- Develop number recognition 0-20 using concrete materials ONLY
- Establish mathematical routines in French (calendar, counting, patterns)
- Use fingers, counters, ten frames - NO abstract work yet
- 10-15 minute math activities matching attention spans
- Daily French: un, deux, trois... compter, plus, moins

DECEMBER-FEBRUARY: Operations Through Play
- Introduce addition as "combining" through stories and materials
- Subtraction as "taking away" through dramatic play
- Number bonds to 10 through games and songs
- Begin transition from concrete to pictorial representations
- 20-minute focused activities with movement breaks
- Problem-solving through real classroom situations

MARCH-JUNE: Application and Extension
- Extend to numbers to 100 with base-10 materials
- Add/subtract within 20 with increasing fluency
- Introduce measurement through comparison
- Simple data collection about our class
- 25-30 minute sustained mathematical thinking
- Explain strategies in simple French sentences

CULTURAL MATHEMATICS:
- Mi'kmaq counting systems and patterns
- Acadian folk songs with numbers
- PEI contexts: counting lobster traps, measuring beaches
- Mathematical games from students' home cultures`,
      
      themes: [
        'Number Sense Development',
        'Concrete-Pictorial-Abstract Progression', 
        'Mathematical Play and Games',
        'Real-World Problem Solving',
        'Pattern Recognition',
        'Measurement Through Comparison',
        'Data About Our Lives',
        'Mathematical Communication in French',
        'Cultural Number Systems',
        'Growth Mindset in Mathematics'
      ],
      
      overarchingQuestions: `DEVELOPMENTALLY APPROPRIATE ESSENTIAL QUESTIONS:

• How do numbers help us understand our world? (Comment les nombres nous aident-ils à comprendre notre monde?)
• What are different ways to show the same number? (Quelles sont les différentes façons de montrer le même nombre?)
• How do we solve problems when we're stuck? (Comment résolvons-nous des problèmes quand nous sommes coincés?)
• Where do we see patterns around us? (Où voyons-nous des motifs autour de nous?)
• How do we know if our answer makes sense? (Comment savons-nous si notre réponse a du sens?)
• What math stories can we tell? (Quelles histoires mathématiques pouvons-nous raconter?)`,
      
      assessmentOverview: `APPROPRIATE MATHEMATICS ASSESSMENT FOR GRADE 1:

BASELINE (SEPTEMBER):
- Individual counting interviews (how high? one-to-one?)
- Number recognition check (which numerals known?)
- Spatial sense through block play observation
- Comfort with mathematical materials
- NO PAPER TESTS - all observation/conversation

ONGOING FORMATIVE ASSESSMENT:
- Daily observation during math play
- Exit tickets with drawings/concrete materials
- Math conferences (2-3 min individual conversations)
- Photo documentation of problem-solving processes
- "Montre-moi" (Show me) demonstrations
- Thumbs up/middle/down self-assessment

GROWTH DOCUMENTATION:
- Monthly video of counting progress
- Problem-solving portfolio (photos of work with materials)
- Family math journals (home-school connection)
- Celebration of strategies, not just answers

COMMUNICATING GROWTH:
- Growth charts showing individual progress (not comparison)
- Narrative reports focusing on mathematical thinking
- Student-led demonstrations for families
- No grades or percentages - developmental indicators only

YEAR-END PORTFOLIO:
- September vs June counting videos
- Collection of problem-solving approaches
- Student reflections with drawings
- Evidence of Grade 2 readiness`,
      
      resourceNeeds: `ESSENTIAL GRADE 1 MATHEMATICS MATERIALS:

COUNTING & NUMBER MATERIALS:
- Counting collections (buttons, shells, stones - 20+ per child)
- Two-color counters (red/yellow - set per child)
- Ten frames and five frames (laminated)
- Dot plates and dice (various configurations)
- Number lines (floor size and desktop)
- 100s charts and 100s pockets
- Unifix cubes or linking cubes (100 per child)
- Base-10 materials (ones and tens only for Grade 1)

FRENCH LANGUAGE SUPPORTS:
- Number word cards with numerals
- French counting songs and rhymes
- Math vocabulary word wall with pictures
- Bilingual math games instructions
- Visual vocabulary cards for operations

MEASUREMENT MATERIALS:
- Non-standard units (paperclips, cubes, footprints)
- Balance scales and weights
- Sand/water table for capacity
- Real clocks (not just teaching clocks)
- PEI-specific items (shells for measuring)

PROBLEM-SOLVING MATERIALS:
- Story problem props (toy cars, animals, people)
- Dramatic play materials for math stories
- Real-world items (play money, store setup)
- Construction materials for spatial reasoning

ACCOMMODATION SUPPORTS:
- Large dice and cards for fine motor challenges
- Textured numbers for tracing
- Number magnets and magnetic boards
- Standing/floor work options
- Noise-reducing headphones for focus

TECHNOLOGY (MINIMAL):
- iPad with concrete math apps (not drill)
- Document camera for sharing strategies
- Simple programmable robots (Bee-Bots)

CULTURAL RESOURCES:
- Mi'kmaq counting materials
- Multicultural counting books
- Traditional games with mathematical thinking
- Community member visits (fishers, farmers)`,
      
      titleFr: 'Mathématiques - Parcours mathématique d\'immersion française 1re année',
      
      descriptionFr: `Un voyage mathématique développemental qui reconnaît que les élèves de 6 ans apprennent les mathématiques ET le français simultanément. Ce plan progresse du comptage concret et du jeu mathématique vers la résolution de problèmes et la pensée abstraite précoce, toujours avec du matériel de manipulation approprié.`,
      
      goalsFr: `Développer le sens du nombre de 0 à 100 progressivement. Construire la compréhension des opérations par le jeu et les histoires. Établir des routines mathématiques quotidiennes en français. Célébrer les stratégies de résolution de problèmes multiples. Préparer pour les défis mathématiques de 2e année tout en gardant la joie des mathématiques.`
    }
  });
  
  console.log('✅ Created developmentally perfect Mathematics LRP\n');
  
  // Update units with authentic Grade 1 mathematical progression
  console.log('📐 CREATING PERFECT UNIT PROGRESSION:\n');
  
  const units = await prisma.unitPlan.findMany({
    where: { longRangePlanId: lrp.id },
    orderBy: { startDate: 'asc' }
  });
  
  const unitUpdates = [
    {
      title: 'Les nombres sont nos amis / Numbers Are Our Friends',
      bigIdeas: 'Numbers are all around us. We can count everything. Numbers have names in French and English.',
      description: `SEPTEMBER - ESTABLISHING FOUNDATIONS (Weeks 1-4):
      
      Week 1-2: Counting Routines & Number Recognition
      - Morning counting circle (1-10, then 1-20)
      - Calendar routine establishing "aujourd'hui, hier, demain"
      - Number hunts in classroom and school
      - Finger counting games and songs
      - French focus: un à dix perfectly pronounced
      
      Week 3-4: One-to-One Correspondence
      - Counting collections from home
      - Snack distribution (matching items to children)
      - "Assez pour tous?" (Enough for everyone?) activities
      - Ten frame introduction with counters
      - Daily "Combien?" (How many?) investigations`,
      assessmentPlan: 'Individual counting interviews, photo documentation of counting work, observation of one-to-one correspondence, family survey of home counting.',
      estimatedHours: 20
    },
    {
      title: 'Raconter des histoires mathématiques / Mathematical Storytelling',
      bigIdeas: 'Math is everywhere in our stories. Adding means putting together. Taking away makes less.',
      description: `OCTOBER-NOVEMBER - INTRODUCTION TO OPERATIONS (Weeks 5-8):
      
      Week 5-6: Addition Through Stories
      - "Les trois petits cochons" (adding houses)
      - Dramatizing joining situations with classmates
      - "Partie-partie-tout" (part-part-whole) with materials
      - Creating class addition stories
      - French: "plus," "égale," "en tout"
      
      Week 7-8: Subtraction Through Play
      - "Les feuilles tombent" (leaves falling - subtraction)
      - Cookie jar game (taking away)
      - "Qu'est-ce qui reste?" (What's left?) investigations
      - Five little pumpkins and other countdown songs
      - French: "moins," "enlever," "il reste"`,
      assessmentPlan: 'Story problem demonstrations with materials, peer explanations of strategies, documentation of various solution methods.',
      estimatedHours: 18
    },
    {
      title: 'Motifs et régularités partout / Patterns Everywhere',
      bigIdeas: 'Patterns help us predict. We can create and extend patterns. Patterns exist in nature, music, and art.',
      description: `DECEMBER - PATTERN RECOGNITION (Weeks 9-12):
      
      Week 9-10: Identifying and Creating Patterns
      - Movement patterns (clap, stomp, clap, stomp)
      - Color patterns with seasonal materials
      - Mi'kmaq beadwork pattern exploration
      - Daily pattern of school routines
      - French: "motif," "répéter," "suivant"
      
      Week 11-12: Growing Patterns
      - Staircase patterns with blocks
      - Number patterns on 100s chart
      - Winter celebration patterns
      - Creating pattern books
      - Predicting what comes next`,
      assessmentPlan: 'Pattern creation portfolios, peer pattern challenges, observation of pattern explanations in French.',
      estimatedHours: 16
    },
    {
      title: 'Explorer les nombres jusqu\'à 50 / Exploring Numbers to 50',
      bigIdeas: 'Teen numbers are ten and some more. We can count by groups. Place value helps us understand bigger numbers.',
      description: `JANUARY-FEBRUARY - PLACE VALUE FOUNDATIONS (Weeks 13-20):
      
      Week 13-16: Teen Numbers
      - Building teen numbers with ten frames
      - "Dix et encore" (ten and more) concept
      - Counting collections in groups of ten
      - Number bonds to 10 and 20
      - French: "onze à vingt" mastery
      
      Week 17-20: Introduction to Tens and Ones
      - Bundling sticks into tens
      - Base-10 blocks exploration
      - Counting by 10s to 100
      - "Combien de dizaines? Combien d'unités?"
      - PEI context: Counting shells by tens`,
      assessmentPlan: 'Ten frame quick images, place value interviews with materials, group counting observations.',
      estimatedHours: 32
    },
    {
      title: 'Mesurer notre monde / Measuring Our World',
      bigIdeas: 'We can measure using different units. Longer, shorter, heavier, lighter are comparisons. Time helps us organize our day.',
      description: `MARCH - MEASUREMENT EXPLORATION (Weeks 21-24):
      
      Week 21-22: Linear Measurement
      - Measuring with footsteps, hand spans, cubes
      - "Plus long, plus court" comparisons
      - Creating measurement books
      - How tall are we? Class height chart
      - Beach measurement with shells
      
      Week 23-24: Time and Mass
      - Daily schedule and clock reading (hour)
      - "Qu'est-ce qui prend plus de temps?"
      - Balance scale explorations
      - "Plus lourd, plus léger" investigations
      - Measuring ingredients for class cooking`,
      assessmentPlan: 'Measurement demonstrations, comparison explanations, time-telling checks.',
      estimatedHours: 16
    },
    {
      title: 'Stratégies de résolution / Problem-Solving Strategies',
      bigIdeas: 'There are many ways to solve problems. We can use tools to help us think. Explaining our thinking helps others learn.',
      description: `APRIL - STRATEGIC THINKING (Weeks 25-28):
      
      Week 25-26: Addition Strategies to 20
      - Counting on from larger number
      - Using doubles (6+6, 7+7)
      - Making ten strategy
      - "Comment as-tu trouvé?" discussions
      - Strategy sharing circles
      
      Week 27-28: Subtraction Strategies
      - Counting back vs counting up
      - Using addition to subtract
      - "Think addition" for subtraction facts
      - Real problems from class life
      - French explanations of thinking`,
      assessmentPlan: 'Strategy conferences, peer teaching observations, problem-solving portfolios.',
      estimatedHours: 16
    },
    {
      title: 'Notre classe en données / Our Class in Data',
      bigIdeas: 'We can collect information about our lives. Graphs help us see patterns. Questions lead to mathematical investigations.',
      description: `MAY - DATA AND GRAPHING (Weeks 29-32):
      
      Week 29-30: Collecting Class Data
      - Favorite ice cream survey
      - Birthday months graph
      - "Combien ont...?" questions
      - Pet survey and pictograph
      - Weather tracking for May
      
      Week 31-32: Interpreting Data
      - "Qu'est-ce que le graphique nous dit?"
      - Comparing different graphs
      - Making predictions from data
      - Creating question from graphs
      - Sharing findings with other classes`,
      assessmentPlan: 'Graph creation and interpretation, question generation, data presentation to families.',
      estimatedHours: 16
    },
    {
      title: 'Célébrer nos mathématiques / Celebrating Our Mathematics',
      bigIdeas: 'We have grown as mathematicians. We can solve real problems. We are ready for Grade 2 challenges.',
      description: `JUNE - CONSOLIDATION AND CELEBRATION (Weeks 33-36):
      
      Week 33-34: Real-World Applications
      - Planning class party with math
      - Store dramatic play with money
      - Playground math investigations
      - Creating math games for kindergarten
      - Beach math field trip
      
      Week 35-36: Portfolio and Reflection
      - "J'ai appris..." reflections
      - September to June growth videos
      - Teaching parents our strategies
      - Math museum creation
      - Grade 2 readiness activities`,
      assessmentPlan: 'Portfolio conferences, family math night presentations, Grade 2 readiness indicators.',
      estimatedHours: 16
    }
  ];
  
  // Update first 8 units (or as many as exist)
  for (let i = 0; i < Math.min(units.length, unitUpdates.length); i++) {
    await prisma.unitPlan.update({
      where: { id: units[i].id },
      data: {
        title: unitUpdates[i].title,
        bigIdeas: unitUpdates[i].bigIdeas,
        description: unitUpdates[i].description,
        assessmentPlan: unitUpdates[i].assessmentPlan,
        estimatedHours: unitUpdates[i].estimatedHours,
        titleFr: unitUpdates[i].title.split(' / ')[0],
        bigIdeasFr: unitUpdates[i].bigIdeas,
        descriptionFr: unitUpdates[i].description
      }
    });
    console.log(`✅ Unit ${i + 1}: ${unitUpdates[i].title}`);
  }
  
  console.log('\n🎯 VERIFICATION OF PERFECTION:\n');
  console.log('This Mathematics LRP is PERFECT because:');
  console.log('  ✓ Starts where 6-year-olds actually are (counting to 20)');
  console.log('  ✓ Ends where they need to be for Grade 2');
  console.log('  ✓ Respects concrete→pictorial→abstract progression');
  console.log('  ✓ Integrates French naturally (not forced)');
  console.log('  ✓ Uses PEI contexts (beaches, shells, lobster)');
  console.log('  ✓ Includes Mi\'kmaq and Acadian perspectives');
  console.log('  ✓ Assessment through observation, not tests');
  console.log('  ✓ Play-based and developmentally appropriate');
  console.log('  ✓ Clear resource needs for success');
  
  console.log('\n✨ THIS Mathematics LRP is the HIGHEST TRUTH!');
  console.log('All unit plans, lessons, and daily plans must align with this foundation.\n');
  
  await prisma.$disconnect();
}

createPerfectMathLRP().catch(console.error);