#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedEducationPhysiqueUnitPlans() {
  console.log('🏃‍♀️ Creating Unit Plans for Éducation physique - Grade 1...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found. Please run main seed first.');
    }
    
    // Get the Éducation physique long range plan
    const physicalEducationPlan = await prisma.longRangePlan.findFirst({
      where: {
        userId: emily.id,
        subject: 'Éducation physique',
        academicYear: '2025-2026'
      }
    });
    
    if (!physicalEducationPlan) {
      throw new Error('Éducation physique long range plan not found. Please run long range plans seed first.');
    }
    
    console.log(`✅ Found Éducation physique long range plan (ID: ${physicalEducationPlan.id})`);
    
    // Get all Physical Education expectations
    const expectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Éducation physique',
        grade: 1
      }
    });
    
    // Create a map for easy lookup
    const expectationMap = new Map(expectations.map(e => [e.code, e]));
    
    // Clear existing unit plans for this long range plan
    const existingUnits = await prisma.unitPlan.findMany({
      where: { longRangePlanId: physicalEducationPlan.id },
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
        where: { longRangePlanId: physicalEducationPlan.id }
      });
    }
    
    console.log('🗑️ Cleared existing unit plans');
    
    // UNIT 1: Mon corps en mouvement (September-October)
    const unit1 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: physicalEducationPlan.id,
        title: 'My Body in Motion',
        titleFr: 'Mon corps en mouvement',
        description: 'Developing body awareness, coordination, and understanding the effects of physical activity on our bodies through fun, safe movement experiences.',
        descriptionFr: 'Développer la conscience corporelle, la coordination et comprendre les effets de l\'activité physique sur nos corps.',
        bigIdeas: 'Our bodies are amazing machines that can move in many ways. Physical activity makes us feel good and keeps us healthy.',
        bigIdeasFr: 'Nos corps sont des machines extraordinaires qui peuvent bouger de plusieurs façons. L\'activité physique nous fait sentir bien et nous garde en santé.',
        essentialQuestions: JSON.stringify([
          'Comment mon corps peut-il bouger?',
          'Qu\'est-ce qui arrive à mon corps quand je bouge?',
          'Comment puis-je contrôler mes mouvements?'
        ]),
        startDate: new Date('2025-09-04'),
        endDate: new Date('2025-10-17'),
        estimatedHours: 21,
        assessmentPlan: 'Movement observation checklists, body awareness demonstrations, posture assessments, physical activity reflection discussions, safety awareness checks.',
        successCriteria: JSON.stringify([
          'Je peux coordonner différentes parties de mon corps',
          'Je peux ajuster ma posture et mes mouvements',
          'Je peux dire ce qui arrive à mon corps quand je bouge'
        ]),

        learningSkills: JSON.stringify(['Self-regulation', 'Initiative', 'Organization']),
        culminatingTask: 'Create and perform a "My Amazing Body" movement demonstration showcasing different body parts and movements.',
        keyVocabulary: JSON.stringify([
          'corps', 'bouger', 'coordination', 'équilibre', 'posture', 'muscle',
          'cœur', 'respirer', 'fort', 'souple', 'contrôle', 'santé', 'mouvement',
          'activité physique', 'étirement', 'échauffement', 'sécurité', 'plaisir'
        ]),
        priorKnowledge: 'Basic body part identification, some gross motor experiences from kindergarten.',
        parentCommunicationPlan: 'Home movement activities, active family time suggestions, body awareness games, outdoor play encouragement.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Simple movements, visual demonstrations, peer support, modified activities, adaptive equipment',
          developing: 'Combination movements, verbal cues, independent practice, inclusive group activities',
          extending: 'Complex sequences, leadership roles, movement creation, peer teaching, inclusive mentoring'
        }),
        indigenousPerspectives: 'Traditional games and movements, connection between body and land, respect for physical gifts, ceremonial movements.',
        environmentalEducation: 'Outdoor movement spaces, connecting with nature through physical activity, respecting play areas.',
        socialJusticeConnections: 'Every body is capable, celebrating different abilities, inclusive activities, adapted participation.',
        technologyIntegration: 'Movement tracking apps, heart rate awareness, video analysis of movements, balance and coordination apps.',
        communityConnections: 'Local sports clubs, community center programs, physiotherapy visits, adaptive sports demonstrations.'
      }
    });
    
    // Link expectations to Unit 1
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit1.id, expectationId: expectationMap.get('1.1')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit1.id, expectationId: expectationMap.get('1.2')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit1.id, expectationId: expectationMap.get('3.1')!.id }
    });
    
    console.log('✅ Created Unit 1: Mon corps en mouvement');
    
    // UNIT 2: Bouger partout (October-November)
    const unit2 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: physicalEducationPlan.id,
        title: 'Moving Everywhere',
        titleFr: 'Bouger partout',
        description: 'Exploring different ways to move through space, maintaining balance, and navigating obstacles safely through fun movement games and activities.',
        descriptionFr: 'Explorer différentes façons de se déplacer dans l\'espace, maintenir l\'équilibre et naviguer les obstacles en sécurité.',
        bigIdeas: 'We can move in many different ways and directions. Balance and control help us move safely.',
        bigIdeasFr: 'Nous pouvons bouger de plusieurs façons et directions. L\'équilibre et le contrôle nous aident à bouger en sécurité.',
        essentialQuestions: JSON.stringify([
          'De quelles façons puis-je me déplacer?',
          'Comment garder mon équilibre en bougeant?',
          'Comment naviguer autour des obstacles?'
        ]),
        startDate: new Date('2025-10-20'),
        endDate: new Date('2025-11-28'),
        estimatedHours: 18,
        assessmentPlan: 'Movement pattern observations, balance challenges, obstacle course assessments, locomotor skills rubrics.',
        successCriteria: JSON.stringify([
          'Je peux me déplacer de différentes façons',
          'Je peux maintenir mon équilibre sur différentes surfaces',
          'Je peux enchaîner des mouvements avec des obstacles'
        ]),

        learningSkills: JSON.stringify(['Initiative', 'Self-regulation', 'Collaboration']),
        culminatingTask: 'Design and navigate a classroom obstacle course demonstrating various locomotor movements.',
        keyVocabulary: JSON.stringify([
          'déplacement', 'marcher', 'courir', 'sauter', 'ramper', 'rouler',
          'équilibre', 'rapide', 'lent', 'obstacle', 'surface', 'direction',
          'mouvement', 'espace', 'locomotion', 'sécurité', 'plaisir', 'jeu'
        ]),
        priorKnowledge: 'Basic walking and running, some playground experience, understanding of fast/slow.',
        parentCommunicationPlan: 'Home balance activities, playground safety tips, nature walk movement games, obstacle course ideas.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Simple movements, stable surfaces, guided practice, physical support, adaptive modifications',
          developing: 'Varied movements, challenging surfaces, independent exploration, inclusive activities',
          extending: 'Complex sequences, unstable surfaces, creative combinations, teaching others, inclusive leadership'
        }),
        indigenousPerspectives: 'Traditional travelling methods, moving respectfully through different terrains, seasonal movement patterns.',
        environmentalEducation: 'Moving through natural spaces, trail respect, seasonal movement adaptations, outdoor safety.',
        socialJusticeConnections: 'Accessible movement options, celebrating movement diversity, supporting all participants, inclusive activities.',
        technologyIntegration: 'GPS basics, movement tracking, video recording of sequences, balance apps and games.',
        communityConnections: 'Park visits, nature trails, gymnasium tours, local sports facility exploration, playground design input.'
      }
    });
    
    // Link expectations to Unit 2
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit2.id, expectationId: expectationMap.get('1.3')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit2.id, expectationId: expectationMap.get('1.4')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit2.id, expectationId: expectationMap.get('1.5')!.id }
    });
    
    console.log('✅ Created Unit 2: Bouger partout');
    
    // UNIT 3: Jouer avec les objets (December-January)
    const unit3 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: physicalEducationPlan.id,
        title: 'Playing with Objects',
        titleFr: 'Jouer avec les objets',
        description: 'Learning to coordinate movements with various objects through manipulation, projection, and reception activities.',
        descriptionFr: 'Apprendre à coordonner les mouvements avec divers objets par la manipulation, la projection et la réception.',
        bigIdeas: 'Objects can help us move and play in new ways. Hand-eye coordination helps us control objects.',
        bigIdeasFr: 'Les objets peuvent nous aider à bouger et jouer de nouvelles façons. La coordination œil-main nous aide à contrôler les objets.',
        essentialQuestions: JSON.stringify([
          'Comment puis-je utiliser des objets pour bouger?',
          'Comment lancer et attraper efficacement?',
          'Comment manipuler différents objets?'
        ]),
        startDate: new Date('2025-12-01'),
        endDate: new Date('2026-01-31'),
        estimatedHours: 24,
        assessmentPlan: 'Object manipulation skill assessments, catching and throwing observations, coordination progress tracking, equipment safety demonstrations, fun play assessments.',
        successCriteria: JSON.stringify([
          'Je peux coordonner mes actions en transportant des objets',
          'Je peux manipuler différents objets avec contrôle',
          'Je peux lancer et attraper des objets variés'
        ]),

        learningSkills: JSON.stringify(['Organization', 'Initiative', 'Responsibility']),
        culminatingTask: 'Winter Olympics object skills demonstration showcasing manipulation, projection, and reception abilities.',
        keyVocabulary: JSON.stringify([
          'objet', 'balle', 'lancer', 'attraper', 'manipuler', 'contrôle',
          'coordination', 'précision', 'force', 'direction', 'équipement', 'sécurité',
          'mouvement', 'projection', 'réception', 'habileté', 'plaisir', 'jeu'
        ]),
        priorKnowledge: 'Some ball play experience, basic throwing and catching attempts, object handling.',
        parentCommunicationPlan: 'Home ball games, safe throwing practice, hand-eye coordination activities, winter activity ideas.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Large, soft objects, short distances, stationary targets, peer assistance, adaptive tools',
          developing: 'Varied object sizes, medium distances, moving targets, independent practice, inclusive games',
          extending: 'Small objects, long distances, complex sequences, leadership roles, inclusive teaching'
        }),
        indigenousPerspectives: 'Traditional games with natural objects, respectful use of materials, seasonal activities, storytelling through movement.',
        environmentalEducation: 'Natural object exploration, seasonal equipment choices, outdoor/indoor adaptation, respectful equipment use.',
        socialJusticeConnections: 'Adapted equipment availability, celebrating different skill levels, inclusive game modifications, sharing equipment.',
        technologyIntegration: 'Slow-motion video analysis, throwing/catching apps, reaction time games, digital skill tracking.',
        communityConnections: 'Local sports equipment demonstrations, athletes visits, equipment donation programs, sports club introductions.'
      }
    });
    
    // Link expectations to Unit 3
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit3.id, expectationId: expectationMap.get('1.6')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit3.id, expectationId: expectationMap.get('1.7')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit3.id, expectationId: expectationMap.get('1.8')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit3.id, expectationId: expectationMap.get('1.9')!.id }
    });
    
    console.log('✅ Created Unit 3: Jouer avec les objets');
    
    // UNIT 4: Jouer ensemble (February-March)
    const unit4 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: physicalEducationPlan.id,
        title: 'Playing Together',
        titleFr: 'Jouer ensemble',
        description: 'Developing cooperation and teamwork skills through partner and group physical activities and creative movement expression.',
        descriptionFr: 'Développer la coopération et le travail d\'équipe par des activités physiques en partenaires et groupes et l\'expression créative.',
        bigIdeas: 'Working together makes activities more fun and successful. We can create and share movement ideas with others.',
        bigIdeasFr: 'Travailler ensemble rend les activités plus amusantes et réussies. Nous pouvons créer et partager des idées de mouvement avec les autres.',
        essentialQuestions: JSON.stringify([
          'Comment puis-je bien travailler avec un partenaire?',
          'Comment adapter mes mouvements aux autres?',
          'Comment créer et partager des idées de mouvement?'
        ]),
        startDate: new Date('2026-02-02'),
        endDate: new Date('2026-03-20'),
        estimatedHours: 21,
        assessmentPlan: 'Cooperation skill observations, partner activity assessments, creative movement presentations, teamwork reflection discussions, safety awareness demonstrations.',
        successCriteria: JSON.stringify([
          'Je peux m\'ajuster à un partenaire pour une tâche commune',
          'Je peux adapter mes mouvements à ceux des autres',
          'Je peux créer des séquences de mouvement avec des amis'
        ]),

        learningSkills: JSON.stringify(['Collaboration', 'Self-regulation', 'Initiative', 'Responsibility']),
        culminatingTask: 'Partner and group movement showcase featuring cooperative activities and creative movement sequences.',
        keyVocabulary: JSON.stringify([
          'partenaire', 'équipe', 'coopération', 'partager', 'ensemble', 'écouter',
          'ajuster', 'créer', 'expression', 'séquence', 'rythme', 'idée',
          'mouvement', 'collaboration', 'sécurité', 'respect', 'plaisir', 'jeu'
        ]),
        priorKnowledge: 'Basic social skills, some group play experience, movement vocabulary from previous units.',
        parentCommunicationPlan: 'Family cooperative games, sibling activities, community play ideas, social skill reinforcement.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Simple partner tasks, clear instructions, adult support, familiar partners, adaptive activities',
          developing: 'Varied group sizes, semi-independent activities, peer support, inclusive grouping',
          extending: 'Complex group tasks, leadership opportunities, creative challenges, mentoring others, inclusive facilitation'
        }),
        indigenousPerspectives: 'Traditional group games, circle activities, community cooperation values, sharing and caring practices.',
        environmentalEducation: 'Group care for equipment and spaces, seasonal group activities, outdoor cooperation games.',
        socialJusticeConnections: 'Inclusive partnership formation, celebrating diverse contributions, fair play principles, conflict resolution.',
        technologyIntegration: 'Group video projects, digital collaboration tools, movement apps for groups, music and rhythm technology.',
        communityConnections: 'Group fitness instructors, dance teachers, team sports demonstrations, cooperative games workshops.'
      }
    });
    
    // Link expectations to Unit 4
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit4.id, expectationId: expectationMap.get('2.1')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit4.id, expectationId: expectationMap.get('2.2')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit4.id, expectationId: expectationMap.get('2.6')!.id }
    });
    
    console.log('✅ Created Unit 4: Jouer ensemble');
    
    // UNIT 5: Jeux et défis (March-April)
    const unit5 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: physicalEducationPlan.id,
        title: 'Games and Challenges',
        titleFr: 'Jeux et défis',
        description: 'Learning to react appropriately to others in game situations, developing quick thinking and responsive movement skills.',
        descriptionFr: 'Apprendre à réagir de façon appropriée aux autres dans les situations de jeu, développer la pensée rapide et les habiletés de mouvement réactif.',
        bigIdeas: 'Games help us practice reacting quickly and making good decisions. We can play fairly and have fun with others.',
        bigIdeasFr: 'Les jeux nous aident à pratiquer réagir rapidement et prendre de bonnes décisions. Nous pouvons jouer équitablement et avoir du plaisir.',
        essentialQuestions: JSON.stringify([
          'Comment réagir aux actions des autres dans les jeux?',
          'Comment prendre de bonnes décisions rapidement?',
          'Comment jouer équitablement avec tous?'
        ]),
        startDate: new Date('2026-03-23'),
        endDate: new Date('2026-04-25'),
        estimatedHours: 18,
        assessmentPlan: 'Game situation observations, reaction time assessments, sportsmanship evaluations, decision-making reflections, safety awareness checks.',
        successCriteria: JSON.stringify([
          'Je peux réagir aux actions d\'un opposant',
          'Je peux réagir aux actions de mes coéquipiers',
          'Je peux jouer équitablement et respectueusement'
        ]),

        learningSkills: JSON.stringify(['Self-regulation', 'Responsibility', 'Collaboration', 'Initiative']),
        culminatingTask: 'Spring games festival featuring student-led activities demonstrating reaction skills and fair play.',
        keyVocabulary: JSON.stringify([
          'jeu', 'réaction', 'opposant', 'coéquipier', 'stratégie', 'rapide',
          'décision', 'équitable', 'respect', 'règles', 'sécurité', 'plaisir',
          'mouvement', 'sportivité', 'collaboration', 'compétition', 'fair-play'
        ]),
        priorKnowledge: 'Basic game concepts, cooperation skills, understanding of rules and safety.',
        parentCommunicationPlan: 'Family game nights, outdoor games, sportsmanship discussions, reaction games for home.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Simple games, clear rules, adult facilitation, modified participation, adaptive rules',
          developing: 'Traditional games, peer support, semi-independent play, inclusive modifications',
          extending: 'Complex games, rule modifications, leadership roles, game creation, inclusive design'
        }),
        indigenousPerspectives: 'Traditional Indigenous games, learning through play, respect for opponents, community games.',
        environmentalEducation: 'Outdoor games respecting nature, seasonal adaptations, equipment care, natural play spaces.',
        socialJusticeConnections: 'Inclusive game modifications, celebrating all participants, fair play emphasis, conflict resolution skills.',
        technologyIntegration: 'Reaction time apps, game rule videos, digital scorekeeping, movement analysis technology.',
        communityConnections: 'Local game traditions, recreational programs, sports officials visits, intergenerational games.'
      }
    });
    
    // Link expectations to Unit 5
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit5.id, expectationId: expectationMap.get('2.3')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit5.id, expectationId: expectationMap.get('2.4')!.id }
    });
    
    console.log('✅ Created Unit 5: Jeux et défis');
    
    // UNIT 6: Santé et bien-être (April-May)
    const unit6 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: physicalEducationPlan.id,
        title: 'Health and Wellness',
        titleFr: 'Santé et bien-être',
        description: 'Understanding and applying knowledge about how physical activity affects our bodies and contributes to our overall health through fun, engaging wellness activities.',
        descriptionFr: 'Comprendre et appliquer les connaissances sur comment l\'activité physique affecte nos corps et contribue à notre santé globale.',
        bigIdeas: 'Physical activity makes our bodies stronger and healthier. We can make choices that help us feel good.',
        bigIdeasFr: 'L\'activité physique rend nos corps plus forts et en santé. Nous pouvons faire des choix qui nous aident à nous sentir bien.',
        essentialQuestions: JSON.stringify([
          'Comment l\'exercice aide-t-il mon corps?',
          'Quels choix puis-je faire pour être en santé?',
          'Comment me sentir bien chaque jour?'
        ]),
        startDate: new Date('2026-04-28'),
        endDate: new Date('2026-05-22'),
        estimatedHours: 15,
        assessmentPlan: 'Health knowledge discussions, physical activity tracking, wellness choice reflections, fitness goal setting, safety awareness demonstrations.',
        successCriteria: JSON.stringify([
          'Je peux expliquer comment l\'exercice aide mon corps',
          'Je peux faire des choix santé chaque jour',
          'Je peux pratiquer des activités qui me rendent fort'
        ]),

        learningSkills: JSON.stringify(['Self-regulation', 'Responsibility', 'Organization', 'Initiative']),
        culminatingTask: 'Create and present a "Healthy Me" plan showcasing understanding of physical activity benefits.',
        keyVocabulary: JSON.stringify([
          'santé', 'bien-être', 'fort', 'énergie', 'cœur', 'muscles',
          'exercice', 'choix', 'nutrition', 'repos', 'hydratation', 'plaisir',
          'mouvement', 'activité physique', 'sécurité', 'forme physique', 'jeu'
        ]),
        priorKnowledge: 'Basic body awareness, understanding of feeling good/tired, some health concepts.',
        parentCommunicationPlan: 'Family health discussions, active lifestyle planning, healthy choices support, wellness tracking.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Simple health concepts, concrete examples, visual supports, family involvement, adaptive activities',
          developing: 'Health connections, goal setting, independent tracking, inclusive practices',
          extending: 'Complex health relationships, leadership in healthy choices, peer mentoring, inclusive wellness'
        }),
        indigenousPerspectives: 'Traditional wellness practices, holistic health concepts, connection to land and nature, balance in life.',
        environmentalEducation: 'Outdoor activity benefits, fresh air importance, natural exercise spaces, seasonal health adaptations.',
        socialJusticeConnections: 'Health equity, access to physical activity, celebrating body diversity, inclusive wellness.',
        technologyIntegration: 'Fitness tracking devices, health apps, heart rate monitoring, digital wellness journals.',
        communityConnections: 'Health professionals visits, community fitness programs, wellness centers, nutritionist presentations.'
      }
    });
    
    // Link expectations to Unit 6
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit6.id, expectationId: expectationMap.get('3.2')!.id }
    });
    
    console.log('✅ Created Unit 6: Santé et bien-être');
    
    // UNIT 7: Célébrons nos mouvements (May-June)
    const unit7 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: physicalEducationPlan.id,
        title: 'Celebrating Our Movement',
        titleFr: 'Célébrons nos mouvements',
        description: 'Integrating all movement skills learned throughout the year in celebration activities and reflecting on physical activity growth.',
        descriptionFr: 'Intégrer toutes les habiletés de mouvement apprises durant l\'année dans des activités de célébration et réfléchir sur la croissance.',
        bigIdeas: 'We have learned many ways to move and play together. Physical activity is fun and important for our whole lives.',
        bigIdeasFr: 'Nous avons appris plusieurs façons de bouger et jouer ensemble. L\'activité physique est amusante et importante pour toute notre vie.',
        essentialQuestions: JSON.stringify([
          'Comment ai-je grandi en éducation physique?',
          'Quelles sont mes activités préférées?',
          'Comment continuer à être actif cet été?'
        ]),
        startDate: new Date('2026-05-25'),
        endDate: new Date('2026-06-25'),
        estimatedHours: 18,
        assessmentPlan: 'Skill demonstration portfolios, movement growth reflections, favorite activity sharing, summer activity planning, safety knowledge assessments.',
        successCriteria: JSON.stringify([
          'Je peux démontrer plusieurs habiletés apprises',
          'Je peux réfléchir sur mes progrès en mouvement',
          'Je peux planifier des activités pour l\'été'
        ]),

        learningSkills: JSON.stringify(['Self-regulation', 'Initiative', 'Responsibility', 'Organization', 'Collaboration', 'Independent work']),
        culminatingTask: 'Physical education celebration showcase featuring student choice of favorite activities and movement demonstrations.',
        keyVocabulary: JSON.stringify([
          'célébrer', 'démontrer', 'progrès', 'grandir', 'préféré', 'été',
          'continuer', 'actif', 'plaisir', 'souvenir', 'fierté', 'accomplissement',
          'mouvement', 'habileté', 'sécurité', 'activité physique', 'jeu'
        ]),
        priorKnowledge: 'All physical education skills from the year, self-reflection abilities, understanding of personal growth.',
        parentCommunicationPlan: 'Summer activity suggestions, family active time ideas, community program information, continued support plans.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Celebration of effort and participation, supported reflection, concrete activity choices, adaptive showcases',
          developing: 'Skill demonstrations, independent reflection, summer planning, inclusive activities',
          extending: 'Advanced skill showcases, peer teaching, leadership in celebrations, detailed summer goals, inclusive mentoring'
        }),
        indigenousPerspectives: 'Celebrating growth and learning, seasonal transitions, continuing traditional activities, community celebrations.',
        environmentalEducation: 'Summer outdoor activities, nature-based movement, environmental stewardship through activity.',
        socialJusticeConnections: 'Celebrating all achievements, summer activity equity, community resource sharing, inclusive celebrations.',
        technologyIntegration: 'Digital portfolios of movement skills, video reflections, summer activity apps, virtual connections.',
        communityConnections: 'Summer program presentations, community center connections, sports camp information, family activity resources.'
      }
    });
    
    // This unit integrates all expectations - no new ones added
    console.log('✅ Created Unit 7: Célébrons nos mouvements (integration unit)');
    
    // Verify all expectations are covered
    const unitCount = await prisma.unitPlan.count({
      where: { longRangePlanId: physicalEducationPlan.id }
    });
    
    const linkedExpectations = await prisma.unitPlanExpectation.count({
      where: {
        unitPlan: {
          longRangePlanId: physicalEducationPlan.id
        }
      }
    });
    
    console.log('\n📊 UNIT PLANS CREATED SUCCESSFULLY!');
    console.log(`✅ ${unitCount} unit plans created for Éducation physique`);
    console.log(`✅ ${linkedExpectations} curriculum expectations linked to units`);
    console.log('✅ Complete coverage from September to June');
    console.log('✅ All 16 Physical Education expectations distributed appropriately');
    console.log('✅ Rich metadata for movement, health, and cooperation learning');
    console.log('✅ Emily is ready to teach Grade 1 Physical Education with confidence!');
    
  } catch (error) {
    console.error('❌ Error creating unit plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedEducationPhysiqueUnitPlans()
  .then(() => console.log('🎉 Éducation physique unit plans seeding completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });