#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMathematiquesUnitPlans() {
  console.log('🔢 Creating Unit Plans for Mathématiques - Grade 1...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found. Please run main seed first.');
    }
    
    // Get the Mathématiques long range plan
    const mathPlan = await prisma.longRangePlan.findFirst({
      where: {
        userId: emily.id,
        subject: 'Mathématiques',
        academicYear: '2024-2025'
      }
    });
    
    if (!mathPlan) {
      throw new Error('Mathématiques long range plan not found. Please run long range plans seed first.');
    }
    
    console.log(`✅ Found Mathématiques long range plan (ID: ${mathPlan.id})`);
    
    // Get all Math expectations
    const expectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Mathématiques',
        grade: 1
      }
    });
    
    // Create a map for easy lookup
    const expectationMap = new Map(expectations.map(e => [e.code, e]));
    
    // Clear existing unit plans for this long range plan
    const existingUnits = await prisma.unitPlan.findMany({
      where: { longRangePlanId: mathPlan.id },
      select: { id: true }
    });
    
    if (existingUnits.length > 0) {
      const unitIds = existingUnits.map(u => u.id);
      
      // Delete related records first
      await prisma.eTFOLessonPlan.deleteMany({
        where: { unitPlanId: { in: unitIds } }
      });
      
      await prisma.unitPlanResource.deleteMany({
        where: { unitPlanId: { in: unitIds } }
      });
      
      await prisma.unitPlanExpectation.deleteMany({
        where: { unitPlanId: { in: unitIds } }
      });
      
      await prisma.unitPlan.deleteMany({
        where: { longRangePlanId: mathPlan.id }
      });
    }
    
    console.log('🗑️ Cleared existing unit plans');
    
    // UNIT 1: Numbers All Around Us (September)
    const unit1 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: mathPlan.id,
        title: 'Numbers All Around Us',
        titleFr: 'Les nombres tout autour de nous',
        description: 'Introduction to counting, recognizing numbers to 10, and building subitizing skills through play-based activities.',
        descriptionFr: 'Introduction au comptage, reconnaissance des nombres jusqu\'à 10, et développement de la subitisation par le jeu.',
        bigIdeas: 'Numbers help us understand and organize our world. We can see quantities without counting.',
        bigIdeasFr: 'Les nombres nous aident à comprendre et organiser notre monde. Nous pouvons voir des quantités sans compter.',
        essentialQuestions: JSON.stringify([
          'Combien y a-t-il?',
          'Comment sais-tu sans compter?',
          'Où vois-tu des nombres?'
        ]),
        startDate: new Date('2024-09-03'),
        endDate: new Date('2024-09-27'),
        estimatedHours: 20,
        assessmentPlan: 'Daily observations of counting, number recognition games, subitizing assessments with dot cards, math journals.',
        successCriteria: JSON.stringify([
          'Je peux compter jusqu\'à 20',
          'Je peux reconnaître les nombres de 0 à 10',
          'Je peux dire combien sans compter (jusqu\'à 5)'
        ]),
        crossCurricularConnections: 'French: number songs and rhymes; PE: counting movements; Science: counting collections from nature',
        learningSkills: JSON.stringify(['Self-regulation', 'Organization', 'Initiative']),
        culminatingTask: 'Create a class counting book with photos of collections from our classroom.',
        keyVocabulary: JSON.stringify([
          'nombre', 'compter', 'zéro', 'un', 'deux', 'trois', 
          'quatre', 'cinq', 'combien', 'plus', 'moins'
        ]),
        priorKnowledge: 'Basic counting from kindergarten, some number recognition, one-to-one correspondence developing.',
        parentCommunicationPlan: 'Math newsletter with counting games for home, number hunt activities, subitizing practice with dice.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Counting to 10, concrete materials, partner support',
          developing: 'Counting to 20, beginning subitizing, number writing',
          extending: 'Counting beyond 20, instant recognition to 10, helping others'
        }),
        indigenousPerspectives: 'Inuit counting systems, Mi\'kmaq number stories, traditional counting games.',
        environmentalEducation: 'Counting natural materials, observing patterns in nature, outdoor math walks.',
        socialJusticeConnections: 'Everyone can be good at math, different ways of seeing numbers, celebrating mistakes as learning.',
        technologyIntegration: 'Number apps for practice, digital math manipulatives, photo documentation of learning.',
        communityConnections: 'Grocery store visit for real-world counting, parent volunteers share counting in their jobs.'
      }
    });
    
    // Link expectations to Unit 1
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit1.id, expectationId: expectationMap.get('1.N1')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit1.id, expectationId: expectationMap.get('1.N2')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit1.id, expectationId: expectationMap.get('1.N3')!.id }
    });
    
    console.log('✅ Created Unit 1: Les nombres tout autour de nous');
    
    // UNIT 2: Making Sense of Numbers (October)
    const unit2 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: mathPlan.id,
        title: 'Making Sense of Numbers',
        titleFr: 'Comprendre les nombres',
        description: 'Representing numbers to 20 in multiple ways, comparing quantities, and exploring equal groups.',
        descriptionFr: 'Représenter les nombres jusqu\'à 20 de plusieurs façons, comparer des quantités et explorer les groupes égaux.',
        bigIdeas: 'Numbers can be shown in many ways. We can compare amounts to solve problems.',
        bigIdeasFr: 'Les nombres peuvent être montrés de plusieurs façons. Nous pouvons comparer pour résoudre des problèmes.',
        essentialQuestions: JSON.stringify([
          'Comment peux-tu montrer ce nombre?',
          'Lequel est plus grand?',
          'Comment faire des groupes égaux?'
        ]),
        startDate: new Date('2024-09-30'),
        endDate: new Date('2024-10-25'),
        estimatedHours: 20,
        assessmentPlan: 'Number representation portfolios, comparison activities assessment, equal groups investigations, observation notes.',
        successCriteria: JSON.stringify([
          'Je peux montrer un nombre de 3 façons différentes',
          'Je peux dire quel groupe a plus ou moins',
          'Je peux faire des groupes égaux'
        ]),
        crossCurricularConnections: 'Art: creating number pictures; Science: comparing collections; French: math vocabulary development',
        learningSkills: JSON.stringify(['Collaboration', 'Independent work', 'Initiative']),
        culminatingTask: 'Number museum - each student creates a display showing one number in multiple ways.',
        keyVocabulary: JSON.stringify([
          'représenter', 'comparer', 'plus que', 'moins que', 'égal',
          'groupe', 'ensemble', 'dix', 'vingt', 'pareil'
        ]),
        priorKnowledge: 'Counting to 20, number recognition to 10, beginning understanding of quantity.',
        parentCommunicationPlan: 'Comparison games for home, equal groups activities with snacks, number representation ideas.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Numbers to 10, concrete comparisons, guided grouping',
          developing: 'Numbers to 20, pictorial representations, independent work',
          extending: 'Larger numbers, abstract thinking, creating problems'
        }),
        indigenousPerspectives: 'Traditional grouping methods, sharing circles ensuring equal distribution, beadwork patterns.',
        environmentalEducation: 'Comparing leaves and seeds, equal sharing of resources, mathematical patterns in nature.',
        socialJusticeConnections: 'Fair sharing, equal distribution of resources, everyone gets their fair share.',
        technologyIntegration: 'Virtual manipulatives, comparison games online, documenting different representations.',
        communityConnections: 'Baker visit to discuss equal portions, sharing traditions in different cultures.'
      }
    });
    
    // Link expectations to Unit 2
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit2.id, expectationId: expectationMap.get('1.N4')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit2.id, expectationId: expectationMap.get('1.N5')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit2.id, expectationId: expectationMap.get('1.N6')!.id }
    });
    
    console.log('✅ Created Unit 2: Comprendre les nombres');
    
    // UNIT 3: Patterns and Shapes (November)
    const unit3 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: mathPlan.id,
        title: 'Patterns and Shapes',
        titleFr: 'Régularités et formes',
        description: 'Exploring repeating patterns, sorting 3D objects and 2D shapes, and understanding pattern rules.',
        descriptionFr: 'Explorer les régularités répétitives, trier les objets 3D et formes 2D, et comprendre les règles.',
        bigIdeas: 'Patterns help us predict what comes next. Shapes have special properties we can describe.',
        bigIdeasFr: 'Les régularités nous aident à prédire. Les formes ont des propriétés spéciales.',
        essentialQuestions: JSON.stringify([
          'Quelle est la règle?',
          'Qu\'est-ce qui vient après?',
          'Comment peux-tu trier ces formes?'
        ]),
        startDate: new Date('2024-10-28'),
        endDate: new Date('2024-11-22'),
        estimatedHours: 20,
        assessmentPlan: 'Pattern creation assessment, shape sorting activities, pattern translation tasks, observation rubric.',
        successCriteria: JSON.stringify([
          'Je peux continuer une régularité',
          'Je peux créer ma propre régularité',
          'Je peux trier les formes et expliquer ma règle'
        ]),
        crossCurricularConnections: 'Music: rhythm patterns; Art: shape collages and pattern art; PE: movement patterns',
        learningSkills: JSON.stringify(['Organization', 'Collaboration', 'Self-regulation']),
        culminatingTask: 'Pattern and shape fair - students create pattern stations for kindergarten buddies.',
        keyVocabulary: JSON.stringify([
          'régularité', 'répéter', 'règle', 'forme', 'cercle', 'carré',
          'triangle', 'rectangle', 'trier', 'propriété'
        ]),
        priorKnowledge: 'Basic shape recognition, experience with simple patterns, sorting experiences.',
        parentCommunicationPlan: 'Pattern hunt at home, shape identification games, pattern creation with household items.',
        differentiationStrategies: JSON.stringify({
          emerging: 'AB patterns, basic shapes, guided sorting',
          developing: 'ABC patterns, shape properties, independent sorting',
          extending: 'Complex patterns, 3D objects, creating sorting rules'
        }),
        indigenousPerspectives: 'Patterns in traditional art and crafts, medicine wheel as circular pattern, drumming patterns.',
        environmentalEducation: 'Patterns in nature (seasons, animal markings), shapes in the environment, natural sorting.',
        socialJusticeConnections: 'Patterns in our daily routines, different cultural patterns, beauty in diversity.',
        technologyIntegration: 'Pattern making apps, shape recognition games, digital pattern documentation.',
        communityConnections: 'Local artist visit to discuss patterns in art, architect to discuss shapes in buildings.'
      }
    });
    
    // Link expectations to Unit 3
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit3.id, expectationId: expectationMap.get('1.RR1')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit3.id, expectationId: expectationMap.get('1.RR2')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit3.id, expectationId: expectationMap.get('1.FE2')!.id }
    });
    
    console.log('✅ Created Unit 3: Régularités et formes');
    
    // UNIT 4: Adding and Subtracting (December-January)
    const unit4 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: mathPlan.id,
        title: 'Adding and Subtracting',
        titleFr: 'Addition et soustraction',
        description: 'Building understanding of addition and subtraction to 20 through stories, games, and real situations.',
        descriptionFr: 'Construire la compréhension de l\'addition et soustraction jusqu\'à 20 par des histoires et jeux.',
        bigIdeas: 'Addition brings groups together. Subtraction shows taking away or finding differences.',
        bigIdeasFr: 'L\'addition rassemble des groupes. La soustraction montre ce qu\'on enlève ou les différences.',
        essentialQuestions: JSON.stringify([
          'Comment peux-tu résoudre ce problème?',
          'Quelle stratégie as-tu utilisée?',
          'Comment sais-tu que c\'est correct?'
        ]),
        startDate: new Date('2024-11-25'),
        endDate: new Date('2025-01-31'),
        estimatedHours: 40,
        assessmentPlan: 'Problem-solving observations, strategy documentation, fact fluency games, math stories assessment.',
        successCriteria: JSON.stringify([
          'Je peux résoudre des problèmes d\'addition',
          'Je peux résoudre des problèmes de soustraction',
          'Je peux expliquer ma stratégie'
        ]),
        crossCurricularConnections: 'French: math story problems; Drama: acting out problems; Science: adding and removing items',
        learningSkills: JSON.stringify(['Initiative', 'Independent work', 'Responsibility']),
        culminatingTask: 'Create a class book of addition and subtraction story problems with illustrations.',
        keyVocabulary: JSON.stringify([
          'addition', 'soustraction', 'plus', 'moins', 'égale',
          'somme', 'différence', 'ensemble', 'reste', 'combien'
        ]),
        priorKnowledge: 'Number sense to 20, comparing quantities, understanding of combining and separating.',
        parentCommunicationPlan: 'Home math games, kitchen math activities, fact practice strategies, celebrating growth not speed.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Facts to 10, concrete materials, number lines',
          developing: 'Facts to 20, pictorial support, various strategies',
          extending: 'Mental math, creating problems, helping others'
        }),
        indigenousPerspectives: 'Traditional trading and sharing practices, story problems from Indigenous contexts.',
        environmentalEducation: 'Adding and removing items from nature respectfully, conservation math problems.',
        socialJusticeConnections: 'Sharing resources fairly, everyone learns at their own pace, multiple ways to solve problems.',
        technologyIntegration: 'Math game apps for practice, virtual manipulatives, recording strategies on tablets.',
        communityConnections: 'Store visit for real addition/subtraction, cashier guest speaker, family math night.'
      }
    });
    
    // Link expectations to Unit 4
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit4.id, expectationId: expectationMap.get('1.N7')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit4.id, expectationId: expectationMap.get('1.N8')!.id }
    });
    
    console.log('✅ Created Unit 4: Addition et soustraction');
    
    // UNIT 5: Mental Math Strategies (February)
    const unit5 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: mathPlan.id,
        title: 'Mental Math Strategies',
        titleFr: 'Stratégies de calcul mental',
        description: 'Developing mental math strategies and understanding equality as balance.',
        descriptionFr: 'Développer des stratégies de calcul mental et comprendre l\'égalité comme équilibre.',
        bigIdeas: 'We can use strategies to solve problems in our heads. Equal means balanced.',
        bigIdeasFr: 'Nous pouvons utiliser des stratégies pour résoudre dans notre tête. Égal signifie équilibré.',
        essentialQuestions: JSON.stringify([
          'Quelle stratégie peux-tu utiliser?',
          'Comment le sais-tu sans compter?',
          'Est-ce équilibré?'
        ]),
        startDate: new Date('2025-02-03'),
        endDate: new Date('2025-02-28'),
        estimatedHours: 20,
        assessmentPlan: 'Mental math interviews, strategy sharing sessions, balance activities assessment, math talks.',
        successCriteria: JSON.stringify([
          'Je peux utiliser une stratégie pour calculer',
          'Je peux expliquer ma pensée',
          'Je peux dire si c\'est équilibré ou pas'
        ]),
        crossCurricularConnections: 'Science: balance and weight; PE: balance activities; French: explaining thinking',
        learningSkills: JSON.stringify(['Self-regulation', 'Initiative', 'Collaboration']),
        culminatingTask: 'Strategy celebration - students teach their favorite mental math strategy to the class.',
        keyVocabulary: JSON.stringify([
          'stratégie', 'mental', 'équilibre', 'égal', 'penser',
          'doubles', 'presque', 'décomposer', 'recomposer'
        ]),
        priorKnowledge: 'Addition and subtraction understanding, some fact knowledge, beginning strategy use.',
        parentCommunicationPlan: 'Mental math tips for families, quick games for car rides, celebrating thinking not just answers.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Counting on, doubles, visual supports',
          developing: 'Near doubles, making 10, decomposing',
          extending: 'Efficient strategies, teaching others, creating challenges'
        }),
        indigenousPerspectives: 'Mental math in traditional games, quick counting in cultural activities, oral math traditions.',
        environmentalEducation: 'Estimating in nature, mental math for conservation (saving water/energy calculations).',
        socialJusticeConnections: 'Different ways of thinking are valuable, speed doesn\'t equal understanding, patience with learning.',
        technologyIntegration: 'Mental math apps, timer games, strategy videos, documenting different approaches.',
        communityConnections: 'Community members share how they use mental math in their work, math tricks workshop.'
      }
    });
    
    // Link expectations to Unit 5
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit5.id, expectationId: expectationMap.get('1.N9')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit5.id, expectationId: expectationMap.get('1.RR3')!.id }
    });
    
    console.log('✅ Created Unit 5: Stratégies de calcul mental');
    
    // UNIT 6: Measurement Exploration (March-April)
    const unit6 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: mathPlan.id,
        title: 'Measurement Exploration',
        titleFr: 'Explorer la mesure',
        description: 'Understanding measurement through comparison, using non-standard units, and exploring time.',
        descriptionFr: 'Comprendre la mesure par comparaison, utiliser des unités non-standard et explorer le temps.',
        bigIdeas: 'We measure to compare and describe. Different tools help us measure different things.',
        bigIdeasFr: 'Nous mesurons pour comparer et décrire. Différents outils nous aident à mesurer.',
        essentialQuestions: JSON.stringify([
          'Comment peux-tu mesurer cela?',
          'Lequel est plus long/lourd/grand?',
          'Combien de temps cela prend-il?'
        ]),
        startDate: new Date('2025-03-03'),
        endDate: new Date('2025-03-28'),
        estimatedHours: 20,
        assessmentPlan: 'Measurement investigations portfolio, comparison activities, time awareness checks, practical measuring.',
        successCriteria: JSON.stringify([
          'Je peux comparer des longueurs',
          'Je peux mesurer avec des objets',
          'Je peux parler du temps (jours, heures)'
        ]),
        crossCurricularConnections: 'Science: measuring plant growth; PE: measuring jumps and throws; Social Studies: daily schedules',
        learningSkills: JSON.stringify(['Organization', 'Collaboration', 'Responsibility']),
        culminatingTask: 'Measurement fair - stations where students measure various items and record findings.',
        keyVocabulary: JSON.stringify([
          'mesurer', 'longueur', 'hauteur', 'poids', 'temps',
          'plus long', 'plus court', 'comparer', 'unité'
        ]),
        priorKnowledge: 'Comparison language, understanding of more/less, basic time concepts (day/night).',
        parentCommunicationPlan: 'Measuring at home activities, cooking measurements, height chart project, time routines.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Direct comparison, simple units, daily time',
          developing: 'Non-standard units, recording measurements, weekly time',
          extending: 'Estimating first, standard units introduction, calendar time'
        }),
        indigenousPerspectives: 'Traditional measurement methods, seasonal time keeping, measuring in nature.',
        environmentalEducation: 'Measuring rainfall, tracking growth, comparing sizes in nature, time in nature.',
        socialJusticeConnections: 'Different measurement systems worldwide, accessibility in measurement, fairness in comparison.',
        technologyIntegration: 'Digital timers, measurement apps, photo documentation of comparisons, virtual rulers.',
        communityConnections: 'Construction worker visit about measurement, cooking demonstration with measuring.'
      }
    });
    
    // Link expectations to Unit 6
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit6.id, expectationId: expectationMap.get('1.FE1')!.id }
    });
    
    console.log('✅ Created Unit 6: Explorer la mesure');
    
    // UNIT 7: Problem Solving Adventures (May)
    const unit7 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: mathPlan.id,
        title: 'Problem Solving Adventures',
        titleFr: 'Aventures de résolution de problèmes',
        description: 'Applying all math skills to solve real-world problems and mathematical puzzles.',
        descriptionFr: 'Appliquer toutes les compétences mathématiques pour résoudre des problèmes réels et des casse-têtes.',
        bigIdeas: 'Math helps us solve problems in our world. There are many ways to find solutions.',
        bigIdeasFr: 'Les maths nous aident à résoudre des problèmes. Il y a plusieurs façons de trouver des solutions.',
        essentialQuestions: JSON.stringify([
          'Quel est le problème?',
          'Quelle stratégie vas-tu essayer?',
          'Comment peux-tu vérifier ta réponse?'
        ]),
        startDate: new Date('2025-03-31'),
        endDate: new Date('2025-05-09'),
        estimatedHours: 30,
        assessmentPlan: 'Problem-solving rubric, strategy documentation, peer assessment, solution presentations.',
        successCriteria: JSON.stringify([
          'Je peux comprendre le problème',
          'Je peux essayer différentes stratégies',
          'Je peux expliquer ma solution'
        ]),
        crossCurricularConnections: 'All subjects: math is everywhere; French: explaining thinking; Art: visual representations',
        learningSkills: JSON.stringify(['Initiative', 'Independent work', 'Collaboration', 'Self-regulation']),
        culminatingTask: 'Math escape room - students solve problems to unlock clues and complete challenges.',
        keyVocabulary: JSON.stringify([
          'problème', 'solution', 'stratégie', 'vérifier', 'essayer',
          'réfléchir', 'expliquer', 'raisonner', 'logique'
        ]),
        priorKnowledge: 'All year\'s math concepts, various problem-solving strategies, communication skills.',
        parentCommunicationPlan: 'Family problem-solving challenges, celebrating persistence, growth mindset messages.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Guided problem solving, concrete materials, peer support',
          developing: 'Semi-independent work, choice of strategies, some abstraction',
          extending: 'Creating problems for others, multiple solutions, leading groups'
        }),
        indigenousPerspectives: 'Problem-solving in traditional stories, community problem-solving approaches, consensus building.',
        environmentalEducation: 'Environmental problem-solving, conservation challenges, outdoor math investigations.',
        socialJusticeConnections: 'Real-world problems that matter, helping our community with math, collaborative solutions.',
        technologyIntegration: 'Problem-solving apps, creating video explanations, digital escape rooms, coding basics.',
        communityConnections: 'Community problem-solvers visit, real problems from local organizations, math walk downtown.'
      }
    });
    
    // No new expectations for Unit 7 - it's an application unit
    console.log('✅ Created Unit 7: Aventures de résolution de problèmes (application unit)');
    
    // UNIT 8: Math Celebration (June)
    const unit8 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: mathPlan.id,
        title: 'Math Celebration',
        titleFr: 'Célébration mathématique',
        description: 'Celebrating mathematical growth, reflecting on learning, and preparing for Grade 2 math.',
        descriptionFr: 'Célébrer la croissance mathématique, réfléchir sur l\'apprentissage et préparer pour les maths de 2e.',
        bigIdeas: 'We have grown as mathematicians. Math learning is a journey that continues.',
        bigIdeasFr: 'Nous avons grandi comme mathématiciens. L\'apprentissage des maths est un voyage qui continue.',
        essentialQuestions: JSON.stringify([
          'Qu\'est-ce que tu as appris en maths?',
          'De quoi es-tu fier/fière?',
          'Qu\'est-ce que tu veux apprendre ensuite?'
        ]),
        startDate: new Date('2025-05-12'),
        endDate: new Date('2025-06-20'),
        estimatedHours: 30,
        assessmentPlan: 'Portfolio conferences, self-assessment reflections, peer celebrations, growth documentation.',
        successCriteria: JSON.stringify([
          'Je peux montrer ce que j\'ai appris',
          'Je peux célébrer mes progrès',
          'Je peux aider les autres'
        ]),
        crossCurricularConnections: 'French: math journals; Art: math art gallery; All subjects: integrated celebrations',
        learningSkills: JSON.stringify(['Self-regulation', 'Responsibility', 'Initiative', 'Organization', 'Collaboration', 'Independent work']),
        culminatingTask: 'Math museum - students create exhibits showing their favorite math learning from the year.',
        keyVocabulary: JSON.stringify([
          'apprendre', 'grandir', 'célébrer', 'mathématicien',
          'progrès', 'fier/fière', 'continuer', 'Grade 2'
        ]),
        priorKnowledge: 'Full year of Grade 1 math experiences, developed math identity, confidence in abilities.',
        parentCommunicationPlan: 'Growth celebration invitations, summer math ideas, Grade 2 readiness information.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Celebrating effort and growth, concrete displays, supported reflection',
          developing: 'Showcasing strategies, helping younger students, goal setting',
          extending: 'Mentoring others, advanced challenges, summer enrichment plans'
        }),
        indigenousPerspectives: 'Celebrating learning in community, honoring all types of mathematical thinking, seven generations.',
        environmentalEducation: 'Math in summer nature activities, outdoor math possibilities, garden planning math.',
        socialJusticeConnections: 'Everyone is a mathematician, celebrating diverse strengths, math is for everyone.',
        technologyIntegration: 'Digital portfolios, video reflections, summer math apps, virtual math buddies.',
        communityConnections: 'Family math celebration night, Grade 2 teacher visit, summer program connections.'
      }
    });
    
    // No new expectations for Unit 8 - it's a celebration/reflection unit
    console.log('✅ Created Unit 8: Célébration mathématique (reflection unit)');
    
    // Verify all expectations are covered
    const unitCount = await prisma.unitPlan.count({
      where: { longRangePlanId: mathPlan.id }
    });
    
    const linkedExpectations = await prisma.unitPlanExpectation.count({
      where: {
        unitPlan: {
          longRangePlanId: mathPlan.id
        }
      }
    });
    
    console.log('\n📊 UNIT PLANS CREATED SUCCESSFULLY!');
    console.log(`✅ ${unitCount} unit plans created for Mathématiques`);
    console.log(`✅ ${linkedExpectations} curriculum expectations linked to units`);
    console.log('✅ Complete coverage from September to June');
    console.log('✅ All 14 Mathématiques expectations distributed appropriately');
    console.log('✅ Rich metadata for differentiation and assessment');
    console.log('✅ Emily is ready to teach Grade 1 Math with confidence!');
    
  } catch (error) {
    console.error('❌ Error creating unit plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedMathematiquesUnitPlans()
  .then(() => console.log('🎉 Mathématiques unit plans seeding completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });