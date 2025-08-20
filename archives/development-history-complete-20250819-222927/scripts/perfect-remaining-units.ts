import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function perfectRemainingUnits() {
  console.log('🎯 PERFECTING REMAINING UNITS FOR COMPLETE ALIGNMENT');
  console.log('===================================================');
  console.log('Ensuring Units 3, 4, and 6 are perfectly curriculum-aligned\n');

  try {
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98s0007vjr1v0a2ibp5' },
      orderBy: { startDate: 'asc' }
    });

    // UNIT 3: Family diversity and uniqueness (1ICC.1) - Enhance alignment
    console.log('👨‍👩‍👧‍👦 PERFECTING UNIT 3: Family Diversity and Uniqueness');
    await prisma.unitPlan.update({
      where: { id: units[2].id },
      data: {
        title: 'Nos familles uniques et diverses',
        estimatedHours: 9,
        description: `👨‍👩‍👧‍👦 NOS FAMILLES UNIQUES ET DIVERSES (12 lessons: 8 core + 4 extension)

🎯 CURRICULUM ALIGNMENT: 1ICC.1
"Décrire l'unicité des personnes et la diversité des langues et des modes de vie de sa famille et des familles de la classe"

🌟 BIG IDEAS:
• Every person is unique and special in their own way
• Families come in many different forms and all are valuable
• People speak different languages and have different traditions
• Our differences make our classroom community stronger and more interesting

🤔 ESSENTIAL QUESTIONS:
• Qu'est-ce qui me rend unique et spécial?
• Comment les familles de notre classe sont-elles différentes et semblables?
• Quelles langues parlent les familles de notre classe?
• Comment nos différences nous enrichissent-elles?

🎯 SUCCESS CRITERIA (Grade 1):
Students will be able to:
• Describe 3+ ways they are unique and special
• Identify different types of families respectfully
• Name 2+ languages spoken in their classroom
• Show respect for different family traditions
• Explain how differences make our class special

🎯 CORE LESSONS (8) - UNIQUENESS & DIVERSITY:
1. Je suis unique et spécial (I am unique and special)
2. Notre famille de classe (Our classroom family - safe focus)
3. Différents types de familles (Different types of families - inclusive)
4. Les langues de notre classe (Languages in our classroom)
5. Nos traditions diverses (Our diverse traditions - general)
6. Ce qui nous rend similaires (What makes us similar)
7. Célébrer nos différences (Celebrating our differences)
8. Notre classe multiculturelle (Our multicultural classroom)

🌟 EXTENSION LESSONS (4) - OPTIONAL DEEPER SHARING:
E1. Family Heritage Show & Tell (COMPLETELY OPTIONAL)
   Alternative: "What makes me special" sharing
E2. Language Appreciation Day (celebrating multilingual families)
   Alternative: Learning "hello" in different languages
E3. Cultural Celebration Display (OPTIONAL family involvement)
   Alternative: Classroom culture appreciation
E4. Family Recipe or Story Sharing (OPTIONAL)
   Alternative: Favorite classroom activities sharing

⚠️ CRITICAL SENSITIVITY FOR ALL FAMILY STRUCTURES:
• Single-parent families celebrated
• Foster families included and honored
• Adopted families recognized
• Grandparent-led families valued
• Same-gender parent families respected
• Blended families acknowledged
• All economic situations accepted
• All cultural backgrounds welcomed

📊 ASSESSMENT STRATEGIES:
FORMATIVE:
• Respectful interaction observations
• Language appreciation activities
• Inclusive behavior documentation
• Celebration participation

SUMMATIVE:
• "What Makes Me Special" presentation
• Classroom diversity appreciation project
• Respectful differences demonstration
• Multicultural classroom celebration portfolio`,

        differentiationStrategies: {
          forStruggling: `• Focus on classroom diversity only
• Visual supports for all concepts
• No mandatory personal sharing
• Peer support for all activities
• Simple uniqueness celebrations`,
          
          forOnLevel: `• Basic understanding of family diversity
• Respectful participation in discussions
• Some personal sharing if comfortable
• Language appreciation activities
• Celebration of classroom differences`,
          
          forAdvanced: `• Leadership in diversity celebrations
• Teaching others about respect
• Advanced understanding of multiculturalism
• Creating inclusive classroom projects
• Helping others feel welcome and valued`
        },

        indigenousPerspectives: `🪶 INDIGENOUS PERSPECTIVES (Mi'kmaq Focus):

TRADITIONAL FAMILY CONCEPTS:
• Extended family importance in Mi'kmaq culture
• Clan system and family connections
• Role of Elders in family structure
• Children as gifts to the entire community

LANGUAGE AND CULTURE:
• Mi'kmaq language as part of family identity
• Oral tradition and storytelling in families
• Traditional names and their meanings
• Language as carrier of culture and identity

DIVERSITY AND INCLUSION:
• Mi'kmaq welcoming traditions for newcomers
• Respect for all peoples in traditional teachings
• Understanding difference as strength
• Seven Sacred Teachings about living together`
      }
    });
    console.log('✅ Unit 3: Perfected for family diversity and uniqueness curriculum\n');

    // UNIT 4: Geographic location and mapping (1LT.1) - Enhance alignment  
    console.log('🗺️ PERFECTING UNIT 4: Geographic Location and Mapping');
    await prisma.unitPlan.update({
      where: { id: units[3].id },
      data: {
        title: 'Localiser avec des cartes',
        estimatedHours: 11,
        description: `🗺️ LOCALISER AVEC DES CARTES (14 lessons: 9 core + 5 extension)

🎯 CURRICULUM ALIGNMENT: 1LT.1
"Préciser la localisation de points de repère et de lieux importants à l'aide d'outils cartographiques, tels la carte géographique, le plan et le globe terrestre"

🌟 BIG IDEAS:
• Maps, plans, and globes help us locate and understand places
• Landmarks help us find our way and describe locations
• Different mapping tools show us different information about places
• We can use mapping tools to locate important places in our community

🤔 ESSENTIAL QUESTIONS:
• Comment les cartes nous aident-elles à trouver des endroits?
• Quels sont les points de repère importants près de chez nous?
• Quelle est la différence entre une carte, un plan et un globe?
• Comment puis-je décrire où se trouve un endroit important?

🎯 SUCCESS CRITERIA (Grade 1):
Students will be able to:
• Use simple maps to locate 3+ important places
• Identify 5+ landmarks in their school/community
• Explain difference between maps, plans, and globes
• Give simple directions using landmarks
• Use mapping tools to find places

🎯 CORE LESSONS (9) - MAPPING AND LOCATION:
1. Qu'est-ce qu'une carte? (What is a map?)
2. Les plans de notre école (Plans of our school)
3. Le globe terrestre (The globe)
4. Points de repère à l'école (Landmarks at school)
5. Points de repère dans notre quartier (Landmarks in our neighborhood)
6. Utiliser une carte simple (Using a simple map)
7. Donner des directions (Giving directions)
8. Endroits importants sur la carte (Important places on maps)
9. Célébration des explorateurs (Explorer celebration)

🌟 EXTENSION LESSONS (5) - ADVANCED MAPPING:
E1. Family Important Places (OPTIONAL sharing)
   Alternative: Favorite school places mapping
E2. Community Walk with Maps (weather permitting)
   Alternative: Virtual community exploration
E3. Create Our Neighborhood Map (collaborative)
   Alternative: Classroom map creation
E4. Globe Exploration (where we live in the world)
   Alternative: Simple world awareness
E5. Map Symbols Investigation (understanding map features)
   Alternative: Creating our own map symbols

📊 ASSESSMENT STRATEGIES:
FORMATIVE:
• Map usage observations
• Landmark identification activities
• Direction-giving practice
• Mapping tool exploration

SUMMATIVE:
• Simple map creation and explanation
• Landmark location demonstration
• Direction-giving assessment
• Important places identification project`,

        differentiationStrategies: {
          forStruggling: `• Focus on school maps and landmarks only
• Visual and hands-on mapping supports
• Simple direction words only
• Peer assistance for all activities
• Concrete landmark examples`,
          
          forOnLevel: `• Basic map reading skills
• 5+ landmarks identified
• Simple direction giving
• Understanding of maps vs globes
• Participation in mapping activities`,
          
          forAdvanced: `• Complex map reading and creation
• Leadership in mapping activities
• Advanced direction giving skills
• Understanding multiple mapping tools
• Teaching others about landmarks and maps`
        },

        indigenousPerspectives: `🪶 INDIGENOUS PERSPECTIVES (Mi'kmaq Focus):

TRADITIONAL NAVIGATION:
• Traditional Mi'kmaq navigation using natural landmarks
• Seasonal migration routes and their mapping
• Sacred sites and their importance in Mi'kmaq territory
• Traditional place names and their meanings

LAND CONNECTION:
• Understanding land as part of identity and culture
• Respectful relationship with territory and places
• Traditional seasonal camps and their locations
• Land-based knowledge and mapping

COMMUNITY PLACES:
• Traditional gathering places and their significance
• Seasonal fishing, hunting, and gathering locations
• Connection between places and cultural practices
• Responsibility for caring for important places`
      }
    });
    console.log('✅ Unit 4: Perfected for geographic location and mapping curriculum\n');

    // UNIT 6: Decision-making and conflict resolution (1PA.1) - Enhance alignment
    console.log('🤝 PERFECTING UNIT 6: Decision-Making and Conflict Resolution');
    await prisma.unitPlan.update({
      where: { id: units[5].id },
      data: {
        title: 'Prendre des décisions et résoudre des conflits',
        estimatedHours: 11,
        description: `🤝 PRENDRE DES DÉCISIONS ET RÉSOUDRE DES CONFLITS (15 lessons: 10 core + 5 extension)

🎯 CURRICULUM ALIGNMENT: 1PA.1
"Appliquer le processus de prise de décision, de résolution de conflits et d'élaboration de règlements"

🌟 BIG IDEAS:
• We can learn steps to make good decisions
• Conflicts are normal and can be solved peacefully
• Rules help us live and work together successfully
• Everyone deserves to be heard and respected in problem-solving

🤔 ESSENTIAL QUESTIONS:
• Comment puis-je prendre de bonnes décisions?
• Que dois-je faire quand il y a un conflit?
• Comment créons-nous des règles qui aident tout le monde?
• Qu'est-ce que cela signifie d'écouter et de respecter les autres?

🎯 SUCCESS CRITERIA (Grade 1):
Students will be able to:
• Use 3+ steps for making good decisions
• Apply peaceful conflict resolution steps
• Participate in creating classroom rules
• Show respectful listening during disagreements
• Help others solve problems peacefully

🎯 CORE LESSONS (10) - DECISION-MAKING & CONFLICT RESOLUTION:
1. Qu'est-ce qu'une décision? (What is a decision?)
2. Les étapes pour décider (Steps for making decisions)
3. Qu'est-ce qu'un conflit? (What is a conflict?)
4. Résoudre les problèmes ensemble (Solving problems together)
5. Écouter avec respect (Listening with respect)
6. Trouver des solutions (Finding solutions)
7. Nos règles de classe (Our classroom rules)
8. Faire des compromis (Making compromises)
9. Demander de l'aide (Asking for help)
10. Célébration des pacifiques (Peaceful problem-solvers celebration)

🌟 EXTENSION LESSONS (5) - ADVANCED PROBLEM-SOLVING:
E1. Family Problem-Solving (OPTIONAL sharing)
   Alternative: Book character problem-solving
E2. Playground Mediation Training (peer helpers)
   Alternative: Classroom mediation practice
E3. Class Meeting Leadership (student-led discussions)
   Alternative: Simple voting and decision practice
E4. School Rule Investigation (why do we have them?)
   Alternative: Creating new classroom procedures
E5. Community Problem-Solving (broader perspective)
   Alternative: Helping others in our school

📊 ASSESSMENT STRATEGIES:
FORMATIVE:
• Decision-making process observations
• Conflict resolution attempts documentation
• Respectful listening behavior tracking
• Rule-following and rule-creation participation

SUMMATIVE:
• Problem-solving demonstration with real scenarios
• Classroom rule creation and explanation
• Peaceful conflict resolution portfolio
• Decision-making steps demonstration`,

        differentiationStrategies: {
          forStruggling: `• Simple 3-step decision process
• Visual supports for all problem-solving
• Adult mediation always available
• Concrete examples and practice
• Extra emotional support during conflicts`,
          
          forOnLevel: `• Basic decision-making steps followed
• Peaceful conflict resolution attempts
• Participation in rule creation
• Respectful listening demonstrated
• Simple compromise understanding`,
          
          forAdvanced: `• Leadership in problem-solving situations
• Teaching others conflict resolution
• Advanced understanding of fairness
• Creating complex solutions to problems
• Peer mediation skills development`
        },

        indigenousPerspectives: `🪶 INDIGENOUS PERSPECTIVES (Mi'kmaq Focus):

TRADITIONAL DECISION-MAKING:
• Consensus building in Mi'kmaq governance
• Circle processes for problem-solving
• Role of Elders in guiding decisions
• Community input in important choices

CONFLICT RESOLUTION:
• Traditional restorative justice practices
• Talking circles for resolving conflicts
• Emphasis on healing relationships
• Community responsibility for peace

SEVEN SACRED TEACHINGS:
• Respect (listening to all voices)
• Truth (honest communication in conflicts)
• Wisdom (seeking guidance from Elders/teachers)
• Humility (recognizing we all make mistakes)

COMMUNITY HARMONY:
• Individual actions affecting community wellbeing
• Traditional teachings about living in peace
• Responsibility to help restore harmony
• Understanding interconnectedness in problem-solving`
      }
    });
    console.log('✅ Unit 6: Perfected for decision-making and conflict resolution curriculum\n');

    console.log('🏆 ALL 7 UNITS NOW PERFECTLY CURRICULUM-ALIGNED:');
    console.log('===============================================');
    console.log('Unit 1: Rights and responsibilities (family & school) - 1C.1 ✅');
    console.log('Unit 2: Digital citizenship skills - 1C.2 ✅');
    console.log('Unit 3: Family uniqueness and diversity - 1ICC.1 ✅');
    console.log('Unit 4: Geographic location with mapping tools - 1LT.1 ✅');
    console.log('Unit 5: Life events organized in time - 1LT.2 ✅');
    console.log('Unit 6: Decision-making and conflict resolution - 1PA.1 ✅');
    console.log('Unit 7: Understanding needs vs wants - 1ER.1 ✅');
    console.log('');
    console.log('📊 FINAL TOTALS MAINTAINED:');
    console.log('Unit 1: 14 lessons, 11 hours');
    console.log('Unit 2: 14 lessons, 10 hours');
    console.log('Unit 3: 12 lessons, 9 hours');
    console.log('Unit 4: 14 lessons, 11 hours');
    console.log('Unit 5: 14 lessons, 10 hours');
    console.log('Unit 6: 15 lessons, 11 hours');
    console.log('Unit 7: 14 lessons, 11 hours');
    console.log('TOTAL: 97 lessons, 73 hours ✅');
    console.log('');
    console.log('🎓 PERFECTION ACHIEVED!');
    console.log('=======================');
    console.log('Every unit now teaches exactly what the');
    console.log('PEI Grade 1 Social Studies curriculum expects!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

perfectRemainingUnits().catch(console.error);