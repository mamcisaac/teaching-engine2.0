#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMeasurementLessons() {
  console.log('📏 Creating 12 PERFECT Measurement Exploration Lessons for Emily McIsaac...\n');
  console.log('🎯 Grade 1 French Immersion - January 2026');
  console.log('⏱️ Each lesson: EXACTLY 45 minutes');
  console.log('🏗️ ETFO Structure: Minds On (8min) + Action (27min) + Consolidation (10min)\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found. Please run main seed first.');
    }
    
    console.log(`✅ Found Emily: ${emily.name} (ID: ${emily.id})`);
    
    // Get the measurement unit plan
    const measurementUnit = await prisma.unitPlan.findUnique({
      where: { id: 'cmectx0p2000pvj4pyw3hgsbz' }
    });
    
    if (!measurementUnit) {
      throw new Error('Measurement unit "Exploration de la mesure" not found.');
    }
    
    console.log(`✅ Found unit: ${measurementUnit.titleFr} (ID: ${measurementUnit.id})`);
    
    // Get measurement curriculum expectations
    const expectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Mathématiques',
        grade: 1,
        OR: [
          { code: '1.FE1' },  // Understanding measurement as comparison
          { code: '1.FE2' },  // Sort 3D objects and 2D figures
          { code: '1.N5' }    // Compare sets up to 20
        ]
      }
    });
    
    console.log(`✅ Found ${expectations.length} relevant curriculum expectations\n`);
    
    // Clear existing measurement lessons for January dates
    await prisma.eTFOLessonPlan.deleteMany({
      where: {
        unitPlanId: measurementUnit.id,
        date: {
          gte: new Date('2026-01-05'),
          lte: new Date('2026-01-23')
        }
      }
    });
    
    console.log('🗑️ Cleared existing measurement lessons for January 5-23\n');
    
    // === WEEK 1: LENGTH & HEIGHT (Jan 5-9) ===
    const lessons = [];
    
    // LESSON 1: Monday Jan 5 - Introduction to Measurement
    lessons.push({
      userId: emily.id,
      unitPlanId: measurementUnit.id,
      title: 'Introduction to Measurement',
      titleFr: 'Introduction à la mesure',
      date: new Date('2026-01-05'),
      duration: 45,
      grade: 1,
      subject: 'Mathématiques',
      language: 'fr',
      
      // ETFO Structure - EXACTLY 45 minutes
      mindsOn: `**MINDS ON (8 minutes) - Exploring Measurement Around Us**

🎯 **Hook Activity: Measurement Detective** (3 min)
- Show mystery box with objects of different sizes
- Ask: "Comment peut-on comparer ces objets?" (How can we compare these objects?)
- Students share initial ideas about comparing sizes

🔍 **Prior Knowledge Activation** (3 min)  
- Quick gallery walk around classroom
- Point to different objects: "Lequel est plus grand?" (Which is bigger?)
- Students use gestures (hands apart) to show size

📋 **Learning Goals Preview** (2 min)
- Share today's mission: "Nous allons devenir des experts en mesure!" (We'll become measurement experts!)
- Show learning goal poster with visuals`,

      action: `**ACTION (27 minutes) - Hands-On Measurement Exploration**

🔬 **Investigation Station 1: Comparing Heights** (9 min)
- Partner work: Compare student heights using vocabulary
- Practice: "Je suis plus grand(e) que...", "Tu es plus petit(e) que..."
- Record findings with simple drawings and French labels

🎯 **Investigation Station 2: Length Detectives** (9 min)  
- Compare classroom objects: pencils, books, desks
- Use hands, feet, or paper clips as non-standard units
- Introduction to key vocabulary: "longueur", "largeur", "hauteur"

🧩 **Investigation Station 3: Sorting by Size** (9 min)
- Sort collection of objects from smallest to largest
- Create visual size sequence with French labels
- Discuss strategies: "Comment avez-vous décidé?" (How did you decide?)

📝 **Mi'kmaq Knowledge Integration** (Throughout)
- Share how Mi'kmaq people used natural objects for measuring
- Traditional units like arm spans, hand widths for canoe building
- Connect to mathematical thinking across cultures`,

      consolidation: `**CONSOLIDATION (10 minutes) - Sharing Mathematical Thinking**

🗣️ **Strategy Sharing Circle** (5 min)
- Groups share their favorite measurement discovery
- Demonstrate one measurement technique learned
- Use French vocabulary: "Nous avons découvert que..."

🎯 **Assessment Checkpoint** (3 min)
☐ Students can identify which object is longer/shorter
☐ Students can use comparison vocabulary in French  
☐ Students can explain their measurement thinking
☐ Students show understanding through demonstrations

🔮 **Preview Connection** (2 min)
- Tomorrow we'll measure with "unités non-standard" (non-standard units)
- Challenge: Find 3 objects at home to compare sizes`,

      learningGoals: JSON.stringify([
        'I can compare the size of different objects',
        'I can use French words to describe size differences',
        'I can explain why measurement helps us'
      ]),
      
      learningGoalsFr: JSON.stringify([
        'Je peux comparer la taille d\'objets différents',
        'Je peux utiliser des mots français pour décrire les différences',
        'Je peux expliquer pourquoi la mesure nous aide'
      ]),
      
      materials: JSON.stringify([
        'Mystery box with varied-size objects',
        'Measuring tools (rulers, tape measures for demonstration)',
        'Collection of classroom objects',
        'Chart paper and markers',
        'Comparison vocabulary cards',
        'Mi\'kmaq measurement story props'
      ]),
      
      grouping: 'whole class discussion, partner work, small group investigations',
      
      differentiationStrategies: JSON.stringify({
        forStruggling: 'Visual comparison cards, peer buddies for vocabulary practice, concrete objects only, simplified vocabulary with gestures and pictures',
        forAdvanced: 'Challenge to find objects that are "almost the same" size, leadership roles in group work, create measurement riddles for classmates',
        forELL: 'Bilingual vocabulary cards, visual cues and gestures, first language connections to measurement concepts, peer translation support',
        forIEP: 'Modified recording methods (drawings vs writing), sensory-friendly materials, choice of participation level, alternative ways to show understanding'
      }),
      
      assessmentType: 'formative',
      assessmentNotes: `**Observable Assessment Criteria:**
☐ Demonstrates understanding of size relationships through concrete comparisons
☐ Uses French measurement vocabulary appropriately (grand/petit, long/court)  
☐ Explains measurement thinking using concrete examples
☐ Shows curiosity and engagement with measurement concepts
☐ Collaborates effectively in measurement investigations`,
      
      indigenousPerspectives: 'Explore traditional Mi\'kmaq measurement methods using natural objects like arm spans and hand widths. Learn how Indigenous peoples measured canoe lengths using body parts and developed mathematical systems connected to the natural world. This honors Indigenous mathematical knowledge and shows measurement as universal human problem-solving.',
      
      isSubFriendly: true,
      subNotes: 'All materials organized in labeled bins. Visual schedule posted. Backup indoor measurement activities ready. Emergency contact information available.'
    });

    // LESSON 2: Tuesday Jan 6 - Comparing Lengths  
    lessons.push({
      userId: emily.id,
      unitPlanId: measurementUnit.id,
      title: 'Comparing Lengths',
      titleFr: 'Comparer les longueurs',
      date: new Date('2026-01-06'),
      duration: 45,
      grade: 1,
      subject: 'Mathématiques',
      language: 'fr',
      
      mindsOn: `**MINDS ON (8 minutes) - Length Exploration Warm-Up**

🎵 **Measurement Song & Movement** (3 min)
- Sing "Long et court" song with arm movements
- Students show "long" (arms wide) and "court" (hands close)
- Add vocabulary: "très long", "un peu court"

🔍 **Length Hunt Challenge** (3 min)
- Find something in classroom that is "plus long que ton crayon"
- Quick sharing in French: "J'ai trouvé..."
- Build excitement for deeper length exploration

📊 **Problem Presentation** (2 min)
- Show two ribbons of different lengths
- Ask: "Comment peut-on savoir lequel est plus long?" (How can we know which is longer?)
- Students predict strategies`,

      action: `**ACTION (27 minutes) - Direct Length Comparison Investigations**

🧪 **Station 1: Direct Comparison** (9 min)
- Compare objects by placing them side by side
- Practice vocabulary: "Le crayon rouge est plus long que le crayon bleu"
- Record findings with French labels and drawings

🔧 **Station 2: Indirect Comparison** (9 min)
- Use string or paper strips to compare lengths
- Compare things that can't be moved (desk width vs window width)
- Discover that we can "transfer" measurements

📐 **Station 3: Ordering by Length** (9 min)
- Arrange 5-7 objects from shortest to longest
- Use vocabulary: "le plus court", "le plus long", "au milieu"
- Create visual length sequences with labels

🌟 **Mi'kmaq Connection Throughout**
- Traditional measuring using nature items
- Compare "un pas" (one step) measurements like ancestors did
- Understand measuring as problem-solving across cultures`,

      consolidation: `**CONSOLIDATION (10 minutes) - Mathematical Communication**

🎯 **Length Championship** (4 min)
- Each group presents their longest and shortest objects
- Use sentence frame: "Dans notre groupe, _____ est le plus long"
- Celebrate mathematical discoveries

📋 **Assessment Gallery Walk** (4 min)
☐ Students can identify longer/shorter objects accurately
☐ Students use French comparison vocabulary correctly
☐ Students can arrange objects in length order
☐ Students explain their comparison strategies

🔮 **Tomorrow's Preview** (2 min)
- Tomorrow: "Nous allons mesurer avec des trombones!" (We'll measure with paperclips!)
- Challenge: How many steps from your bedroom to kitchen?`,

      learningGoals: JSON.stringify([
        'I can directly compare lengths of objects',
        'I can put objects in order from shortest to longest',
        'I can use French words for length comparisons'
      ]),
      
      learningGoalsFr: JSON.stringify([
        'Je peux comparer directement les longueurs',
        'Je peux mettre les objets en ordre',
        'Je peux utiliser des mots français pour comparer'
      ]),
      
      materials: JSON.stringify([
        'Ribbons and strings of various lengths',
        'Classroom objects for comparison',
        'Paper strips for indirect measuring',
        'Length vocabulary anchor chart',
        'Recording sheets with French sentence frames',
        'Objects representing traditional Mi\'kmaq tools'
      ]),
      
      grouping: 'whole class warm-up, small group stations, partner recording',
      
      differentiationStrategies: JSON.stringify({
        forStruggling: 'Start with very different lengths for easy comparison, use concrete objects only, provide sentence frames with picture supports, allow gestural responses',
        forAdvanced: 'Challenge with objects of similar lengths, introduce estimation before measuring, create comparison problems for others, use precise vocabulary',
        forELL: 'Visual vocabulary cards with English/French, demonstration before practice, bilingual peer support, graphic organizers for recording',
        forIEP: 'Flexible seating options, alternative recording methods, choice in objects to compare, extended time as needed, calm workspace available'
      }),
      
      assessmentType: 'formative',
      assessmentNotes: `**Observable Learning Evidence:**
☐ Accurately identifies longer and shorter objects through direct comparison  
☐ Successfully arranges 3-5 objects in order by length
☐ Uses French vocabulary (long, court, plus long que) appropriately
☐ Demonstrates understanding of indirect comparison using tools
☐ Explains comparison strategies with concrete examples`,
      
      indigenousPerspectives: 'Learn how Mi\'kmaq people compared lengths using natural standards like the length of a hand or foot. Traditional canoe builders needed to compare wood pieces for construction. This mathematical thinking helped create transportation and tools essential for survival, showing measurement as practical problem-solving.',
      
      isSubFriendly: true,
      subNotes: 'Station materials in clearly labeled containers. Visual directions posted at each station. Backup activities prepared for different group sizes.'
    });

    // LESSON 3: Thursday Jan 8 - Measuring with Non-standard Units
    lessons.push({
      userId: emily.id,
      unitPlanId: measurementUnit.id,
      title: 'Measuring with Non-standard Units',
      titleFr: 'Mesurer avec unités non-standard',
      date: new Date('2026-01-08'),
      duration: 45,
      grade: 1,
      subject: 'Mathématiques',
      language: 'fr',
      
      mindsOn: `**MINDS ON (8 minutes) - Non-standard Unit Discovery**

🎲 **Unit Guessing Game** (3 min)
- Show desk measured with paperclips: "Mon bureau mesure 12 trombones"
- Students guess what we used to measure
- Introduction to "unité de mesure" concept

🏃 **Body Unit Warm-up** (3 min)
- Measure distances using "pas" (steps), "empans" (hand spans)
- Quick: How many steps across the classroom?
- Discover bodies as measuring tools

🤔 **Problem Introduction** (2 min)
- Challenge: "Comment mesurer sans règle?" (How to measure without ruler?)
- Show collection of potential measuring units
- Build anticipation for unit exploration`,

      action: `**ACTION (27 minutes) - Non-standard Unit Investigations**

📎 **Station 1: Paperclip Measuring** (9 min)
- Measure desk length, book width, pencil length
- Record: "La table mesure ___ trombones"
- Discover importance of unit consistency (no gaps/overlaps)

🧮 **Station 2: Block Measuring** (9 min)
- Use linking cubes or wooden blocks as units
- Measure and compare different objects
- Practice: "Mon livre mesure 4 blocs"

👋 **Station 3: Hand Span Measuring** (9 min)
- Measure using hand spans (empans)
- Compare measurements between partners
- Discover that different hands give different measurements!

🌿 **Mi'kmaq Integration Throughout**
- Traditional units: beaver tail length, bow length
- Natural measuring tools from forest and shore
- Mathematics as universal human need across cultures`,

      consolidation: `**CONSOLIDATION (10 minutes) - Unit Understanding & Reflection**

🔍 **Measurement Detective Discussion** (5 min)
- Share surprising discoveries about units
- Discuss: "Pourquoi avons-nous des résultats différents?" (Why different results?)
- Understand need for standard units

📊 **Assessment Documentation** (3 min)
☐ Students can measure using non-standard units correctly
☐ Students record measurements with appropriate French vocabulary
☐ Students understand units must be consistent (no gaps/overlaps)
☐ Students recognize why different units give different results

🎯 **Measurement Challenge Preview** (2 min)
- Tomorrow: Order objects by length using measurements
- Home challenge: Measure your bed using shoes, then socks - compare!`,

      learningGoals: JSON.stringify([
        'I can measure objects using non-standard units',
        'I can record measurements in French',
        'I understand why we need consistent units'
      ]),
      
      learningGoalsFr: JSON.stringify([
        'Je peux mesurer avec des unités non-standard',
        'Je peux noter les mesures en français',
        'Je comprends pourquoi il faut des unités régulières'
      ]),
      
      materials: JSON.stringify([
        'Large collection of paperclips',
        'Linking cubes or wooden blocks',
        'Various classroom objects to measure',
        'Recording sheets with French measurement vocabulary',
        'Measuring tools anchor chart',
        'Examples of traditional Mi\'kmaq measuring tools'
      ]),
      
      grouping: 'whole class introduction, small group stations, partner measuring',
      
      differentiationStrategies: JSON.stringify({
        forStruggling: 'Start with very short objects (2-3 units), demonstrate proper unit placement, provide visual guides for lining up units, use larger units like blocks first',
        forAdvanced: 'Measure longer objects requiring more units, compare measurements using different units, predict before measuring, explain why measurements differ',
        forELL: 'Bilingual measurement vocabulary cards, demonstration with think-alouds, visual recording templates, peer support for French vocabulary',
        forIEP: 'Choice of measuring tools based on motor skills, alternative recording methods, flexible grouping, movement breaks between measuring activities'
      }),
      
      assessmentType: 'formative',
      assessmentNotes: `**Measurement Competency Indicators:**
☐ Correctly aligns units end-to-end without gaps or overlaps
☐ Records measurements using numbers and unit names in French
☐ Understands that different units produce different numerical results
☐ Demonstrates careful, systematic approach to measuring
☐ Can explain their measuring process to others`,
      
      indigenousPerspectives: 'Explore how Mi\'kmaq people used natural objects as consistent measuring units - beaver tail lengths for canoe construction, arm spans for wigwam sizing. Traditional knowledge shows how Indigenous mathematics solved practical problems using available materials, honoring the mathematical thinking of First Peoples.',
      
      isSubFriendly: true,
      subNotes: 'All measuring materials counted and organized in bins. Clear visual instructions at each station. Alternative activities ready for early finishers.'
    });

    // LESSON 4: Friday Jan 9 - Ordering by Length
    lessons.push({
      userId: emily.id,
      unitPlanId: measurementUnit.id,
      title: 'Ordering by Length',
      titleFr: 'Ordonner par longueur',
      date: new Date('2026-01-09'),
      duration: 45,
      grade: 1,
      subject: 'Mathématiques',
      language: 'fr',
      
      mindsOn: `**MINDS ON (8 minutes) - Length Ordering Warm-Up**

🎪 **The Great Length Lineup** (4 min)
- 5 students line up by height
- Use vocabulary: "le plus petit", "le plus grand", "au milieu"
- Rearrange from tallest to shortest

🔍 **Object Mystery Sequence** (3 min)
- Show 3 ribbons of different lengths (mixed order)
- Challenge: "Mettez-les en ordre!" (Put them in order!)
- Students predict before hands-on exploration

🎯 **Learning Goal Connection** (1 min)
- Today's mission: Become "experts en ordre" (ordering experts)
- Preview measuring and ordering activities`,

      action: `**ACTION (27 minutes) - Length Ordering Investigations**

📏 **Station 1: Ribbon Ordering Challenge** (9 min)
- 5-7 ribbons of different lengths to order
- Measure each using paperclips, then arrange
- Record sequence using French ordinal numbers

🔤 **Station 2: Mixed Object Ordering** (9 min)
- Collection of various classroom objects
- Measure and create length sequence
- Practice: "Le crayon est plus long que la gomme"

📊 **Station 3: Create Your Own Sequence** (9 min)
- Choose any 5 objects to measure and order
- Create display with measurements and French labels
- Challenge others to guess the ordering rule

🍃 **Cultural Connection Throughout**
- Mi'kmaq ordering of materials by size for different uses
- Smallest twigs for kindling, largest logs for structure
- Mathematical thinking in traditional resource management`,

      consolidation: `**CONSOLIDATION (10 minutes) - Ordering Mastery Celebration**

🏆 **Sequence Showcase** (5 min)
- Groups present their most interesting length sequence
- Explain ordering strategy: "Nous avons commencé par..."
- Celebrate mathematical discoveries and precision

📝 **Week 1 Reflection Assessment** (4 min)
☐ Students can order 5+ objects by length accurately
☐ Students measure objects to verify ordering
☐ Students use French sequencing vocabulary correctly
☐ Students can explain their ordering strategy

🎉 **Week 1 Celebration** (1 min)
- Measurement expert certificates for everyone!
- Preview: "La semaine prochaine - lourd et léger!" (Next week - heavy and light!)`,

      learningGoals: JSON.stringify([
        'I can put objects in order from shortest to longest',
        'I can use measurements to check my ordering',
        'I can use French words for ordering and position'
      ]),
      
      learningGoalsFr: JSON.stringify([
        'Je peux mettre les objets en ordre de longueur',
        'Je peux utiliser les mesures pour vérifier',
        'Je peux utiliser des mots français pour l\'ordre'
      ]),
      
      materials: JSON.stringify([
        'Ribbons of various lengths',
        'Collection of measurable classroom objects',
        'Paperclips and other measuring units',
        'Ordering vocabulary chart',
        'Recording sheets with sequence templates',
        'Measurement expert certificates'
      ]),
      
      grouping: 'whole class demonstration, small group investigations, individual recording',
      
      differentiationStrategies: JSON.stringify({
        forStruggling: 'Start with 3 very different lengths, provide pre-measured objects option, use visual sequence template, allow peer assistance for vocabulary',
        forAdvanced: 'Challenge with 7+ objects of similar lengths, create sequences for others to solve, use precise measurements, explain ordering strategies in detail',
        forELL: 'Bilingual sequence vocabulary, visual sequence examples, partnership with bilingual peer, graphic organizers for recording',
        forIEP: 'Choice in number of objects to order, alternative ways to show sequence understanding, flexible work space, extra time as needed'
      }),
      
      assessmentType: 'formative',
      assessmentNotes: `**Length Ordering Competency Evidence:**
☐ Successfully orders 5+ objects from shortest to longest using direct comparison
☐ Uses measurements to verify and correct ordering when needed
☐ Demonstrates understanding of relative position vocabulary (premier, dernier, au milieu)
☐ Can articulate ordering strategy in French with support
☐ Shows persistence and accuracy in measurement and ordering tasks`,
      
      indigenousPerspectives: 'Learn how Mi\'kmaq people ordered materials by size for different purposes - from smallest birchbark pieces for detail work to largest pieces for canoe hulls. This practical mathematical ordering ensured efficient use of natural resources and successful completion of essential tasks for community survival.',
      
      isSubFriendly: true,
      subNotes: 'Week 1 materials organized and accessible. Visual sequence examples posted. Celebration materials ready. Assessment notes prepared for each student.'
    });

    // === WEEK 2: MASS & WEIGHT (Jan 12-16) ===

    // LESSON 5: Monday Jan 12 - Heavy and Light
    lessons.push({
      userId: emily.id,
      unitPlanId: measurementUnit.id,
      title: 'Heavy and Light',
      titleFr: 'Lourd et léger',
      date: new Date('2026-01-12'),
      duration: 45,
      grade: 1,
      subject: 'Mathématiques',
      language: 'fr',
      
      mindsOn: `**MINDS ON (8 minutes) - Mass Exploration Introduction**

🎒 **Mystery Weight Backpack** (3 min)
- Pass around backpack with hidden heavy objects
- Students predict: "C'est lourd ou léger?" (Heavy or light?)
- Build curiosity about weight/mass concepts

💪 **Body Weight Discovery** (3 min)
- Hold different objects in each hand
- Compare: book vs feather, rock vs cotton ball
- Introduction to "masse" and weight vocabulary

🤔 **Problem Presentation** (2 min)
- Show two identical boxes (one empty, one filled)
- Challenge: "Comment savoir lequel est lourd sans regarder dedans?"
- Preview week's mass exploration`,

      action: `**ACTION (27 minutes) - Heavy and Light Investigations**

⚖️ **Station 1: Hand Balance Scale** (9 min)
- Use hands as balance scale with various objects
- Practice vocabulary: "plus lourd que", "plus léger que"
- Record discoveries with drawings and French labels

🏋️ **Station 2: Lifting Test** (9 min)
- Safely lift different objects (books, toys, materials)
- Order from lightest to heaviest by feel
- Use vocabulary: "très lourd", "un peu léger", "moyen"

🔍 **Station 3: Mass Detective** (9 min)
- Predict mass before testing
- Compare predictions to actual lifting experience
- Discover that size doesn't always predict mass!

🌊 **Mi'kmaq Connection Throughout**
- Traditional knowledge of carrying capacity for travels
- Selecting stones for different uses by weight
- Understanding mass for practical survival tasks`,

      consolidation: `**CONSOLIDATION (10 minutes) - Mass Understanding & Communication**

🎯 **Weight Champion Sharing** (5 min)
- Groups share most surprising mass discovery
- Demonstrate comparison techniques
- Use sentence frames: "Nous avons découvert que..."

📊 **Assessment Check** (3 min)
☐ Students can identify heavier/lighter objects accurately
☐ Students use French mass vocabulary appropriately
☐ Students understand that size doesn't determine mass
☐ Students can explain their mass-testing strategies

🔮 **Tomorrow's Preview** (2 min)
- Tomorrow: Real balance scales for precise comparison!
- Challenge: Find two objects at home that look similar but feel different`,

      learningGoals: JSON.stringify([
        'I can identify which objects are heavier or lighter',
        'I can use French words to describe mass differences',
        'I understand that size and weight are different things'
      ]),
      
      learningGoalsFr: JSON.stringify([
        'Je peux identifier les objets lourds et légers',
        'Je peux utiliser des mots français pour la masse',
        'Je comprends que taille et poids sont différents'
      ]),
      
      materials: JSON.stringify([
        'Collection of objects with varying mass-to-size ratios',
        'Mystery backpack with heavy items',
        'Recording sheets for mass predictions',
        'Mass vocabulary anchor chart',
        'Safety guidelines for lifting',
        'Traditional Indigenous carrying tools examples'
      ]),
      
      grouping: 'whole class exploration, small group stations, partner comparisons',
      
      differentiationStrategies: JSON.stringify({
        forStruggling: 'Start with very obvious weight differences, provide hand-over-hand support for lifting, use simple vocabulary with gestures, allow pointing responses',
        forAdvanced: 'Challenge with subtle weight differences, predict and test multiple objects, use precise vocabulary, explain strategies to others',
        forELL: 'Bilingual mass vocabulary cards, demonstration with clear think-alouds, visual recording templates, peer translation support',
        forIEP: 'Adapted objects for different motor abilities, alternative testing methods, choice in participation level, sensory considerations for materials'
      }),
      
      assessmentType: 'formative',
      assessmentNotes: `**Mass Concept Understanding Indicators:**
☐ Accurately identifies heavier and lighter objects through direct comparison
☐ Uses appropriate French vocabulary (lourd, léger, plus lourd que) in context
☐ Demonstrates understanding that objects can be large but light, small but heavy
☐ Shows safe and careful handling when testing mass
☐ Can communicate mass comparisons using concrete examples`,
      
      indigenousPerspectives: 'Explore how Mi\'kmaq people understood the importance of weight when packing for seasonal moves. They needed to balance carrying capacity with essential items, understanding mass distribution for canoe travel and portaging. This mathematical thinking ensured successful journeys and family survival.',
      
      isSubFriendly: true,
      subNotes: 'All objects checked for safety. Weight limits established for student lifting. Visual safety guidelines posted. Alternative activities for students who cannot lift.'
    });

    // LESSON 6: Tuesday Jan 13 - Comparing Mass with Balance
    lessons.push({
      userId: emily.id,
      unitPlanId: measurementUnit.id,
      title: 'Comparing Mass with Balance',
      titleFr: 'Comparer la masse',
      date: new Date('2026-01-13'),
      duration: 45,
      grade: 1,
      subject: 'Mathématiques',
      language: 'fr',
      
      mindsOn: `**MINDS ON (8 minutes) - Balance Scale Introduction**

⚖️ **Human Balance Scale** (4 min)
- Two students hold hands, compare different objects in their free hands
- Observe which side goes down: "Plus lourd fait descendre!"
- Introduction to balance concept

🤹 **Predict and Test** (3 min)
- Show apple and toy car
- Students predict which is heavier before testing
- Build excitement for balance scale investigations

🔍 **Balance Problem** (1 min)
- How can we compare objects that are too small for hands?
- Preview balance scale tools`,

      action: `**ACTION (27 minutes) - Balance Scale Investigations**

⚖️ **Station 1: Simple Balance Scale** (9 min)
- Use balance scale to compare pairs of objects
- Practice vocabulary: "égal", "plus lourd", "plus léger"
- Record results with pictures and French labels

🧮 **Station 2: Multi-object Balancing** (9 min)
- Try to balance one object with multiple smaller objects
- Example: How many pennies to balance a crayon?
- Discover that many light things can equal one heavy thing

⚖️ **Station 3: Create Equal Masses** (9 min)
- Challenge to make both sides of balance equal
- Use various combinations of classroom objects
- Practice saying "C'est égal!" when balanced

🏛️ **Mi'kmaq Integration Throughout**
- Traditional balance concepts for trading
- Understanding fair exchange using mass comparison
- Mathematics in traditional commerce and resource sharing`,

      consolidation: `**CONSOLIDATION (10 minutes) - Balance Mastery**

⚖️ **Balance Challenge Championship** (5 min)
- Groups demonstrate their most impressive balance
- Explain their strategy: "Pour équilibrer, nous avons..."
- Celebrate precision and discovery

📊 **Assessment Checkpoint** (3 min)
☐ Students can use balance scales correctly
☐ Students predict which side will go down
☐ Students understand concept of equal mass
☐ Students use French balance vocabulary

🔮 **Preview Tomorrow** (2 min)
- Tomorrow: Order objects by mass using balance
- Challenge: Find items at home that balance each other`,

      learningGoals: JSON.stringify([
        'I can use a balance scale to compare masses',
        'I can predict which object will be heavier',
        'I can create equal masses using different objects'
      ]),
      
      learningGoalsFr: JSON.stringify([
        'Je peux utiliser une balance pour comparer',
        'Je peux prédire quel objet sera plus lourd',
        'Je peux créer des masses égales'
      ]),
      
      materials: JSON.stringify([
        'Simple balance scales',
        'Collection of objects with various masses',
        'Recording sheets for balance results',
        'Prediction and testing charts',
        'Balance vocabulary cards',
        'Traditional Mi\'kmaq trading scale examples'
      ]),
      
      grouping: 'whole class demonstration, small group balance investigations, partner predictions',
      
      differentiationStrategies: JSON.stringify({
        forStruggling: 'Start with very obvious mass differences, provide demonstration before independent work, use concrete vocabulary with gestures',
        forAdvanced: 'Challenge to predict exact balance points, create complex balancing problems, explain balance physics concepts',
        forELL: 'Visual balance vocabulary, demonstration with think-alouds, bilingual prediction charts, peer support',
        forIEP: 'Adapted balance tools if needed, alternative ways to show predictions, choice in complexity level'
      }),
      
      assessmentType: 'formative',
      assessmentNotes: `**Balance Scale Competency Indicators:**
☐ Correctly places objects on balance scale and interprets results
☐ Makes accurate predictions about which objects will be heavier
☐ Understands that equal masses create balance
☐ Uses French vocabulary (égal, plus lourd, plus léger) accurately
☐ Demonstrates systematic approach to mass comparison`,
      
      indigenousPerspectives: 'Learn how Mi\'kmaq people used balance concepts in traditional trading, ensuring fair exchanges of goods. Understanding equal value through mass comparison was essential for maintaining peaceful relationships between communities and fair resource distribution.',
      
      isSubFriendly: true,
      subNotes: 'Balance scales secured and checked for safety. Clear instructions for proper use posted. Backup activities for scale maintenance issues.'
    });

    // LESSON 7: Thursday Jan 15 - Ordering by Mass
    lessons.push({
      userId: emily.id,
      unitPlanId: measurementUnit.id,
      title: 'Ordering by Mass',
      titleFr: 'Ordonner par masse',
      date: new Date('2026-01-15'),
      duration: 45,
      grade: 1,
      subject: 'Mathématiques',
      language: 'fr',
      
      mindsOn: `**MINDS ON (8 minutes) - Mass Ordering Warm-Up**

🏆 **Mass Olympics Lineup** (4 min)
- 5 students hold different objects, arrange by mass
- Use vocabulary: "le plus lourd", "le plus léger", "au milieu"
- Rearrange from lightest to heaviest

🎯 **Mystery Mass Challenge** (3 min)
- Show 4 wrapped objects of different masses
- Students predict ordering before unwrapping
- Build anticipation for systematic ordering

📊 **Ordering Strategy Discussion** (1 min)
- How can we put many objects in mass order?
- Preview systematic comparison strategies`,

      action: `**ACTION (27 minutes) - Mass Ordering Investigations**

⚖️ **Station 1: 5-Object Mass Sequence** (9 min)
- Use balance scale to order 5 objects by mass
- Create mass sequence from lightest to heaviest
- Record sequence with French ordinal numbers

📊 **Station 2: Mass Comparison Chart** (9 min)
- Compare every object with every other object
- Fill in comparison chart: A vs B, A vs C, etc.
- Use results to determine final ordering

🔍 **Station 3: Mass Detective Challenge** (9 min)
- Given scrambled set of 6+ objects
- Use systematic strategy to create mass ordering
- Challenge others to verify your sequence

🌿 **Cultural Connection Throughout**
- Traditional ordering of materials by mass for construction
- Heaviest support beams, lighter roof materials
- Mathematical thinking in traditional building`,

      consolidation: `**CONSOLIDATION (10 minutes) - Mass Ordering Expertise**

🎯 **Sequence Presentation** (5 min)
- Groups present their mass ordering strategy
- Demonstrate systematic comparison approach
- Use French vocabulary: "D'abord... ensuite... finalement..."

📋 **Assessment Documentation** (4 min)
☐ Students can order 5+ objects by mass accurately
☐ Students use systematic comparison strategies
☐ Students verify ordering using balance scales
☐ Students use French sequencing vocabulary correctly

🔮 **Preview Tomorrow** (1 min)
- Tomorrow: Estimating weight before measuring!
- Challenge: Order 3 family members by weight (safely!)`,

      learningGoals: JSON.stringify([
        'I can put objects in order from lightest to heaviest',
        'I can use balance scales to check my ordering',
        'I can use systematic strategies for mass comparison'
      ]),
      
      learningGoalsFr: JSON.stringify([
        'Je peux mettre les objets en ordre de masse',
        'Je peux utiliser la balance pour vérifier',
        'Je peux utiliser des stratégies systématiques'
      ]),
      
      materials: JSON.stringify([
        'Balance scales for verification',
        'Collections of objects with subtle mass differences',
        'Mass comparison recording charts',
        'Sequencing vocabulary anchor chart',
        'Ordinal number cards in French',
        'Traditional building material examples'
      ]),
      
      grouping: 'whole class strategy discussion, small group investigations, individual recording',
      
      differentiationStrategies: JSON.stringify({
        forStruggling: 'Start with 3 very different masses, provide systematic comparison template, use visual sequence guides',
        forAdvanced: 'Challenge with 7+ objects of similar masses, create mass ordering problems for others, explain strategies in detail',
        forELL: 'Bilingual sequence vocabulary, visual strategy guides, peer support for French ordinal numbers',
        forIEP: 'Choice in number of objects to order, alternative recording methods, extended time for systematic comparison'
      }),
      
      assessmentType: 'formative',
      assessmentNotes: `**Mass Ordering Competency Evidence:**
☐ Successfully orders multiple objects by mass using systematic comparison
☐ Verifies ordering using balance scales when needed
☐ Uses French ordinal vocabulary (premier, deuxième, dernier) appropriately
☐ Demonstrates understanding of transitivity (if A>B and B>C, then A>C)
☐ Shows persistence and accuracy in complex ordering tasks`,
      
      indigenousPerspectives: 'Explore how Mi\'kmaq builders ordered materials by mass for construction projects. Understanding proper weight distribution ensured stable longhouses and wigwams. This mathematical ordering was crucial for creating safe shelters that could withstand seasonal weather changes.',
      
      isSubFriendly: true,
      subNotes: 'Multiple balance scales available. Clear strategy charts posted. Alternative activities for different group sizes prepared.'
    });

    // LESSON 8: Friday Jan 16 - Estimating Weight
    lessons.push({
      userId: emily.id,
      unitPlanId: measurementUnit.id,
      title: 'Estimating Weight',
      titleFr: 'Estimer le poids',
      date: new Date('2026-01-16'),
      duration: 45,
      grade: 1,
      subject: 'Mathématiques',
      language: 'fr',
      
      mindsOn: `**MINDS ON (8 minutes) - Weight Estimation Warm-Up**

🎒 **Estimation Game Show** (4 min)
- Hold up mystery bag, students guess: "lourd ou léger?"
- Reveal contents, discuss estimation strategies
- Introduction to "estimer" vocabulary

💭 **Quick Estimation Round** (3 min)
- Show 3 different objects, students make quick predictions
- Compare predictions to actual testing
- Build estimation skills and vocabulary

🤔 **Estimation Problem** (1 min)
- How can we get better at predicting weight?
- Preview estimation strategies and practice`,

      action: `**ACTION (27 minutes) - Weight Estimation Practice**

🔮 **Station 1: Prediction Olympics** (9 min)
- Collection of 10 objects to estimate
- Predict "lourd", "moyen", or "léger" before testing
- Record predictions and actual results

📊 **Station 2: Benchmark Training** (9 min)
- Use known objects as references (100g weight, etc.)
- Compare unknown objects to benchmarks
- Develop "feels like" estimation strategies

🎯 **Station 3: Estimation Challenge** (9 min)
- Partner challenges: one hides objects in bags
- Other partner estimates based on lifting
- Switch roles and compare estimation accuracy

🌊 **Mi'kmaq Connection Throughout**
- Traditional estimation skills for traveling
- Estimating pack weight for long journeys
- Mathematical survival skills in traditional life`,

      consolidation: `**CONSOLIDATION (10 minutes) - Estimation Mastery & Week 2 Celebration**

🏆 **Estimation Expert Recognition** (4 min)
- Share best estimation strategies discovered
- Demonstrate benchmark comparison techniques
- Celebrate improved estimation accuracy

📊 **Week 2 Assessment Reflection** (4 min)
☐ Students can estimate object masses with improving accuracy
☐ Students use benchmark objects for comparison
☐ Students understand that estimation improves with practice
☐ Students use French estimation vocabulary confidently

🎉 **Mass Week Celebration** (2 min)
- Mass measurement expert certificates!
- Preview: "La semaine prochaine - capacité et volume!"`,

      learningGoals: JSON.stringify([
        'I can estimate whether objects are heavy or light',
        'I can use benchmark objects to help estimate',
        'I can improve my estimation with practice'
      ]),
      
      learningGoalsFr: JSON.stringify([
        'Je peux estimer si les objets sont lourds ou légers',
        'Je peux utiliser des objets de référence',
        'Je peux améliorer mes estimations avec la pratique'
      ]),
      
      materials: JSON.stringify([
        'Mystery bags and containers',
        'Collection of objects for estimation practice',
        'Benchmark objects (standard masses)',
        'Estimation recording sheets',
        'Prediction and results comparison charts',
        'Traditional Mi\'kmaq pack examples'
      ]),
      
      grouping: 'whole class estimation game, partner challenges, individual reflection',
      
      differentiationStrategies: JSON.stringify({
        forStruggling: 'Start with very obvious mass differences, provide benchmark comparison support, use simplified vocabulary',
        forAdvanced: 'Challenge with subtle mass differences, develop personal estimation strategies, teach techniques to others',
        forELL: 'Bilingual estimation vocabulary, visual prediction charts, peer support for strategy explanation',
        forIEP: 'Choice in estimation complexity, alternative ways to show predictions, flexible participation options'
      }),
      
      assessmentType: 'formative',
      assessmentNotes: `**Weight Estimation Development Indicators:**
☐ Makes reasonable initial estimates based on visual cues
☐ Uses benchmark objects effectively to improve estimation accuracy
☐ Shows improvement in estimation accuracy over multiple trials
☐ Can explain estimation strategies using concrete examples
☐ Demonstrates understanding that estimation is a valuable mathematical skill`,
      
      indigenousPerspectives: 'Learn how Mi\'kmaq travelers developed accurate weight estimation skills essential for successful journeys. Estimating pack weight prevented overloading and ensured proper load distribution for canoe travel and portaging between waterways.',
      
      isSubFriendly: true,
      subNotes: 'Week 2 celebration materials ready. Assessment summary prepared for each student. All estimation materials checked and organized.'
    });

    // === WEEK 3: CAPACITY & VOLUME (Jan 19-23) ===

    // LESSON 9: Monday Jan 19 - Full and Empty
    lessons.push({
      userId: emily.id,
      unitPlanId: measurementUnit.id,
      title: 'Full and Empty',
      titleFr: 'Plein et vide',
      date: new Date('2026-01-19'),
      duration: 45,
      grade: 1,
      subject: 'Mathématiques',
      language: 'fr',
      
      mindsOn: `**MINDS ON (8 minutes) - Capacity Exploration Introduction**

🥤 **Full or Empty Game** (3 min)
- Show various containers: some full, some empty, some half
- Students identify: "plein", "vide", "à moitié plein"
- Quick vocabulary building with gestures

💧 **Water Wonder** (3 min)
- Pour water between different shaped containers
- Students predict: "Y aura-t-il assez d'eau?"
- Build curiosity about capacity concepts

🤔 **Capacity Problem** (2 min)
- Which container holds more water?
- How can we find out without spilling?
- Preview week's capacity exploration`,

      action: `**ACTION (27 minutes) - Full and Empty Investigations**

🫙 **Station 1: Container Comparison** (9 min)
- Fill containers with rice/beans to compare capacity
- Practice vocabulary: "plus de place", "moins de place"
- Record which containers hold more

💧 **Station 2: Water Transfer** (9 min)
- Use measuring cups to fill containers
- Count how many cups to fill each container
- Discover different capacities through measurement

🥛 **Station 3: Estimation Challenge** (9 min)
- Predict how many small cups will fill large container
- Test predictions with actual pouring
- Practice: "Je pense que... tasses vont remplir..."

🏞️ **Mi'kmaq Connection Throughout**
- Traditional water containers from birchbark
- Understanding capacity for water storage
- Mathematical thinking in traditional container making`,

      consolidation: `**CONSOLIDATION (10 minutes) - Capacity Understanding**

💧 **Container Champion Sharing** (5 min)
- Groups share surprising capacity discoveries
- Demonstrate filling techniques
- Use vocabulary: "Ce contenant peut tenir..."

📊 **Assessment Check** (3 min)
☐ Students can identify full, empty, and partial states
☐ Students understand that different containers hold different amounts
☐ Students use French capacity vocabulary appropriately
☐ Students can compare container capacities

🔮 **Tomorrow's Preview** (2 min)
- Tomorrow: Compare capacity more precisely!
- Challenge: Find different sized containers at home`,

      learningGoals: JSON.stringify([
        'I can identify when containers are full, empty, or partly full',
        'I can compare how much different containers hold',
        'I can use French words to describe capacity'
      ]),
      
      learningGoalsFr: JSON.stringify([
        'Je peux identifier plein, vide et à moitié',
        'Je peux comparer ce que les contenants peuvent tenir',
        'Je peux utiliser des mots français pour la capacité'
      ]),
      
      materials: JSON.stringify([
        'Various containers of different shapes and sizes',
        'Rice, beans, or other safe filling materials',
        'Measuring cups and spoons',
        'Water table or contained pouring area',
        'Capacity vocabulary cards',
        'Traditional birchbark container examples'
      ]),
      
      grouping: 'whole class exploration, small group stations, partner pouring activities',
      
      differentiationStrategies: JSON.stringify({
        forStruggling: 'Start with very different sized containers, provide spill-proof materials, use simple full/empty vocabulary',
        forAdvanced: 'Challenge with similar-sized containers, predict exact amounts, explain capacity differences',
        forELL: 'Bilingual capacity vocabulary, visual demonstration, concrete comparison activities',
        forIEP: 'Adapted pouring tools, choice in materials, sensory-friendly options, flexible participation'
      }),
      
      assessmentType: 'formative',
      assessmentNotes: `**Capacity Concept Indicators:**
☐ Accurately identifies full, empty, and partially filled states
☐ Demonstrates understanding that containers have different capacities
☐ Uses French capacity vocabulary (plein, vide, contenant) appropriately
☐ Shows careful and safe handling of materials during capacity exploration
☐ Can explain capacity differences using concrete examples`,
      
      indigenousPerspectives: 'Explore how Mi\'kmaq people created containers from natural materials like birchbark, understanding the capacity needed for water storage during travels. Traditional knowledge included making containers of specific sizes for different purposes, showing mathematical thinking in practical applications.',
      
      isSubFriendly: true,
      subNotes: 'All pouring materials contained and safe. Spill cleanup supplies ready. Clear boundaries for water activities. Backup materials prepared.'
    });

    // LESSON 10: Tuesday Jan 20 - Comparing Capacity
    lessons.push({
      userId: emily.id,
      unitPlanId: measurementUnit.id,
      title: 'Comparing Capacity',
      titleFr: 'Comparer la capacité',
      date: new Date('2026-01-20'),
      duration: 45,
      grade: 1,
      subject: 'Mathématiques',
      language: 'fr',
      
      mindsOn: `**MINDS ON (8 minutes) - Capacity Comparison Warm-Up**

🥛 **Capacity Magic Show** (4 min)
- Two different shaped containers (tall thin vs short wide)
- Same amount of water poured into each
- Students predict which holds more: surprise reveal!

🔍 **Quick Capacity Challenges** (3 min)
- Show pairs of containers
- Students predict: "Lequel peut tenir plus?"
- Build anticipation for systematic comparison

📊 **Comparison Strategy Preview** (1 min)
- How can we fairly compare capacities?
- Preview measurement techniques`,

      action: `**ACTION (27 minutes) - Systematic Capacity Comparison**

📏 **Station 1: Standard Unit Measuring** (9 min)
- Use small cups as units to measure container capacity
- Record: "Ce pot peut tenir ___ petites tasses"
- Compare capacities using number of units

⚖️ **Station 2: Direct Comparison** (9 min)
- Pour from one container to another
- Determine which holds more through transfer
- Practice: "A peut tenir plus que B"

📊 **Station 3: Capacity Ordering** (9 min)
- Order 5 containers from smallest to largest capacity
- Use measurement to verify ordering
- Create capacity sequence with French labels

🛶 **Mi'kmaq Integration Throughout**
- Traditional container sizing for different purposes
- Water storage capacity for seasonal camps
- Mathematical precision in container creation`,

      consolidation: `**CONSOLIDATION (10 minutes) - Capacity Comparison Mastery**

📊 **Capacity Championship** (5 min)
- Groups present their capacity measurement discoveries
- Demonstrate systematic comparison techniques
- Use vocabulary: "Pour comparer, nous avons..."

📋 **Assessment Documentation** (4 min)
☐ Students can measure capacity using standard units
☐ Students can directly compare container capacities
☐ Students can order containers by capacity
☐ Students use French comparison vocabulary correctly

🔮 **Preview Tomorrow** (1 min)
- Tomorrow: Measuring with different container units!
- Challenge: Which holds more - cereal bowl or soup can?`,

      learningGoals: JSON.stringify([
        'I can measure capacity using small units',
        'I can compare capacities of different containers',
        'I can put containers in order by how much they hold'
      ]),
      
      learningGoalsFr: JSON.stringify([
        'Je peux mesurer la capacité avec petites unités',
        'Je peux comparer les capacités',
        'Je peux ordonner les contenants par capacité'
      ]),
      
      materials: JSON.stringify([
        'Variety of containers for comparison',
        'Small measuring cups as standard units',
        'Large measuring containers for pouring',
        'Capacity recording sheets',
        'Ordering templates and labels',
        'Traditional Mi\'kmaq container examples'
      ]),
      
      grouping: 'whole class demonstration, small group measuring, partner comparisons',
      
      differentiationStrategies: JSON.stringify({
        forStruggling: 'Start with very different capacities, provide measurement templates, use concrete comparison only',
        forAdvanced: 'Challenge with similar capacities, create measurement problems, explain capacity relationships',
        forELL: 'Bilingual measurement vocabulary, visual recording sheets, demonstration with clear explanations',
        forIEP: 'Choice in measuring tools, alternative recording methods, flexible participation in pouring activities'
      }),
      
      assessmentType: 'formative',
      assessmentNotes: `**Capacity Comparison Competency Evidence:**
☐ Accurately measures container capacity using consistent units
☐ Makes valid comparisons between different container capacities
☐ Successfully orders multiple containers from smallest to largest capacity
☐ Uses systematic measurement strategies consistently
☐ Communicates capacity relationships using appropriate French vocabulary`,
      
      indigenousPerspectives: 'Learn how Mi\'kmaq people needed to compare capacities when creating containers for different purposes - small containers for medicines, medium for personal water, large for community use. Understanding capacity relationships was essential for efficient resource management.',
      
      isSubFriendly: true,
      subNotes: 'Multiple measuring tools available. Clear measurement procedures posted. Cleanup stations organized. Extra containers ready for replacement.'
    });

    // LESSON 11: Thursday Jan 22 - Measuring with Containers
    lessons.push({
      userId: emily.id,
      unitPlanId: measurementUnit.id,
      title: 'Measuring with Containers',
      titleFr: 'Mesurer avec contenants',
      date: new Date('2026-01-22'),
      duration: 45,
      grade: 1,
      subject: 'Mathématiques',
      language: 'fr',
      
      mindsOn: `**MINDS ON (8 minutes) - Container Unit Exploration**

🥄 **Container Unit Game** (4 min)
- Show large bowl and small cup
- Challenge: "Combien de tasses pour remplir le bol?"
- Students make predictions before testing

📊 **Unit Size Matters** (3 min)
- Demonstrate measuring same container with different sized units
- Discover that smaller units give bigger numbers!
- Build understanding of unit relationships

🎯 **Measurement Mission** (1 min)
- Today's challenge: become container measurement experts
- Preview systematic measuring techniques`,

      action: `**ACTION (27 minutes) - Container Unit Measuring**

🥛 **Station 1: Multi-Unit Measuring** (9 min)
- Measure same large container with 3 different sized units
- Record all three measurements
- Compare results: "Avec des petites tasses: ___, avec des grandes: ___"

📊 **Station 2: Container Conversion** (9 min)
- Find how many small units equal one large unit
- Example: How many teaspoons in a cup?
- Create conversion charts with visual representations

🔍 **Station 3: Measurement Detective** (9 min)
- Given measurement results, predict original container
- Use clues like "8 small cups" or "2 large bowls"
- Develop measurement reasoning skills

🏘️ **Cultural Connection Throughout**
- Traditional Mi'kmaq measuring with natural containers
- Shells, gourds, and bowls for different measurements
- Mathematical thinking in traditional cooking and storage`,

      consolidation: `**CONSOLIDATION (10 minutes) - Container Measuring Expertise**

🏆 **Measurement Discovery Sharing** (5 min)
- Groups share their most interesting measurement discovery
- Demonstrate container unit relationships
- Use vocabulary: "Nous avons découvert que..."

📋 **Assessment Check** (4 min)
☐ Students can measure using different container units
☐ Students understand that smaller units give larger numbers
☐ Students can create simple unit conversions
☐ Students record measurements with appropriate French labels

🔮 **Tomorrow's Preview** (1 min)
- Tomorrow: Water play measurement celebration!
- Final capacity and volume exploration`,

      learningGoals: JSON.stringify([
        'I can measure the same container using different units',
        'I understand that smaller units give bigger numbers',
        'I can record measurements using container units'
      ]),
      
      learningGoalsFr: JSON.stringify([
        'Je peux mesurer avec différentes unités',
        'Je comprends que petites unités donnent grands nombres',
        'Je peux noter les mesures avec unités contenants'
      ]),
      
      materials: JSON.stringify([
        'Nested measuring containers of different sizes',
        'Large containers to be measured',
        'Recording sheets for multiple measurements',
        'Unit conversion visual charts',
        'Measurement vocabulary reference cards',
        'Traditional natural measuring containers'
      ]),
      
      grouping: 'whole class discovery, small group measuring, individual recording',
      
      differentiationStrategies: JSON.stringify({
        forStruggling: 'Start with 2 very different unit sizes, provide measurement templates, use concrete recording methods',
        forAdvanced: 'Challenge with 4+ different units, create measurement problems, explain unit relationships',
        forELL: 'Bilingual unit vocabulary, visual measurement guides, peer support for recording',
        forIEP: 'Choice in number of units to compare, alternative recording methods, adapted measuring tools'
      }),
      
      assessmentType: 'formative',
      assessmentNotes: `**Container Measuring Competency Indicators:**
☐ Successfully measures containers using multiple different units
☐ Demonstrates understanding of inverse relationship between unit size and measurement number
☐ Records measurements accurately with appropriate units and French vocabulary
☐ Shows systematic approach to measuring and recording
☐ Can explain why different units produce different numerical results`,
      
      indigenousPerspectives: 'Explore how Mi\'kmaq people used various natural containers as measuring units - mussel shells for small amounts, birchbark containers for larger quantities. Understanding these relationships helped in cooking, medicine preparation, and resource distribution within communities.',
      
      isSubFriendly: true,
      subNotes: 'All measuring containers checked and organized. Clear measurement procedures posted. Recording materials ready. Water cleanup supplies available.'
    });

    // LESSON 12: Friday Jan 23 - Water Play Measurement
    lessons.push({
      userId: emily.id,
      unitPlanId: measurementUnit.id,
      title: 'Water Play Measurement',
      titleFr: 'Mesure avec l\'eau',
      date: new Date('2026-01-23'),
      duration: 45,
      grade: 1,
      subject: 'Mathématiques',
      language: 'fr',
      
      mindsOn: `**MINDS ON (8 minutes) - Water Measurement Celebration Setup**

💧 **Water Music Welcome** (3 min)
- Pour water between containers to create musical tones
- Different water levels create different sounds
- Introduction to water as measurement medium

🌊 **Prediction Pool** (3 min)
- Show interesting shaped containers for water measurement
- Students predict capacities before water testing
- Build excitement for final measurement celebration

🎯 **Celebration Mission** (2 min)
- Today: Celebrate 3 weeks of measurement mastery!
- Use all measurement skills with water activities`,

      action: `**ACTION (27 minutes) - Water Measurement Celebration Centers**

💧 **Center 1: Water Transfer Olympics** (9 min)
- Race to transfer water using different sized containers
- Measure and record transfer amounts
- Practice all French measurement vocabulary

🌊 **Center 2: Capacity Art Creation** (9 min)
- Use different containers to create water art patterns
- Measure each container's contribution to artwork
- Combine creativity with mathematical measuring

🏆 **Center 3: Measurement Challenge Station** (9 min)
- Complete measurement challenges using water
- "Fill this container with exactly 5 small cups"
- Demonstrate mastery of all measurement concepts

🌊 **Cultural Celebration Throughout**
- Water ceremonies in Mi'kmaq tradition
- Understanding water as precious resource requiring careful measurement
- Mathematics in traditional water management`,

      consolidation: `**CONSOLIDATION (10 minutes) - Measurement Unit Celebration & Reflection**

🎉 **Measurement Expert Celebration** (6 min)
- Each student shares their favorite measurement discovery
- Demonstrate one measurement skill learned
- Celebrate growth using French vocabulary

📊 **Unit Assessment Reflection** (3 min)
☐ Students demonstrate understanding of length, mass, and capacity
☐ Students use French measurement vocabulary confidently
☐ Students can compare and order objects by measurable attributes
☐ Students appreciate measurement as useful mathematical tool

🏆 **Measurement Master Certificates** (1 min)
- Celebration of 3 weeks of measurement exploration!
- Recognition of French vocabulary growth and mathematical thinking`,

      learningGoals: JSON.stringify([
        'I can use all measurement skills with water activities',
        'I can celebrate my measurement learning journey',
        'I can demonstrate measurement mastery through play'
      ]),
      
      learningGoalsFr: JSON.stringify([
        'Je peux utiliser toutes mes compétences de mesure',
        'Je peux célébrer mon voyage d\'apprentissage',
        'Je peux démontrer ma maîtrise par le jeu'
      ]),
      
      materials: JSON.stringify([
        'Water tables or large containers for water play',
        'Complete collection of measuring tools from unit',
        'Various containers for water measurement',
        'Towels and cleanup materials',
        'Measurement mastery certificates',
        'Celebration music and decorations'
      ]),
      
      grouping: 'whole class celebration, rotating centers, individual reflection',
      
      differentiationStrategies: JSON.stringify({
        forStruggling: 'Celebration of individual growth, choice in participation level, concrete demonstration of learning, peer support',
        forAdvanced: 'Leadership roles in celebration, complex measurement challenges, teaching others, creating new measurement problems',
        forELL: 'Celebration vocabulary support, visual demonstration opportunities, bilingual celebration phrases, cultural connection sharing',
        forIEP: 'Flexible celebration participation, choice in demonstration methods, sensory considerations for water play, alternative celebration activities'
      }),
      
      assessmentType: 'summative',
      assessmentNotes: `**Measurement Unit Mastery Evidence - 3-Week Assessment:**
☐ Demonstrates understanding of length, mass, and capacity concepts
☐ Uses measurement tools appropriately and safely
☐ Compares and orders objects using multiple measurable attributes  
☐ Uses French measurement vocabulary accurately and confidently
☐ Shows appreciation for measurement as practical mathematical tool
☐ Integrates measurement skills in creative and playful contexts
☐ Communicates mathematical thinking using concrete examples`,
      
      indigenousPerspectives: 'Celebrate the mathematical wisdom of Mi\'kmaq people who understood water as sacred and requiring careful measurement for survival. Traditional knowledge included water storage, distribution, and conservation - mathematical thinking that honored the natural world while meeting community needs.',
      
      isSubFriendly: true,
      subNotes: 'Water play area fully prepared and safe. All cleanup materials ready. Celebration certificates printed. Unit assessment summary completed for each student. Backup indoor activities prepared.'
    });

    console.log(`\n🎯 Creating ${lessons.length} lesson plans in database...`);
    
    let lessonCount = 0;
    for (const lessonData of lessons) {
      const lesson = await prisma.eTFOLessonPlan.create({
        data: lessonData
      });
      
      lessonCount++;
      console.log(`✅ Created Lesson ${lessonCount}: ${lesson.titleFr}`);
      
      // Link curriculum expectations
      for (const exp of expectations) {
        await prisma.eTFOLessonPlanExpectation.create({
          data: {
            lessonPlanId: lesson.id,
            expectationId: exp.id
          }
        });
      }
    }
    
    console.log('\n📊 MEASUREMENT LESSONS COMPLETION STATUS:');
    console.log(`✅ ${lessonCount} perfect ETFO lesson plans created`);
    console.log('✅ January 5-23, 2026 measurement unit planned');
    console.log('✅ 45-minute lessons with precise ETFO structure');
    console.log('✅ Rich differentiation and assessment built in');
    console.log('✅ Indigenous perspectives authentically integrated');
    console.log('✅ French vocabulary development throughout');
    console.log('\n🎉 Ready for PERFECT measurement exploration!');
    
  } catch (error) {
    console.error('❌ Error creating measurement lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedMeasurementLessons()
  .then(() => console.log('\n🎉 Measurement lesson creation completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });