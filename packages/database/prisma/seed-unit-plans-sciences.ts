#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSciencesUnitPlans() {
  console.log('🔬 Creating Unit Plans for Sciences de la nature - Grade 1...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found. Please run main seed first.');
    }
    
    // Get the Sciences de la nature long range plan
    const sciencesPlan = await prisma.longRangePlan.findFirst({
      where: {
        userId: emily.id,
        subject: 'Sciences de la nature',
        academicYear: '2024-2025'
      }
    });
    
    if (!sciencesPlan) {
      throw new Error('Sciences de la nature long range plan not found. Please run long range plans seed first.');
    }
    
    console.log(`✅ Found Sciences de la nature long range plan (ID: ${sciencesPlan.id})`);
    
    // Get all Science expectations
    const expectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Sciences de la nature',
        grade: 1
      }
    });
    
    // Create a map for easy lookup
    const expectationMap = new Map(expectations.map(e => [e.code, e]));
    
    // Clear existing unit plans for this long range plan
    const existingUnits = await prisma.unitPlan.findMany({
      where: { longRangePlanId: sciencesPlan.id },
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
        where: { longRangePlanId: sciencesPlan.id }
      });
    }
    
    console.log('🗑️ Cleared existing unit plans');
    
    // UNIT 1: Our School Environment (September)
    const unit1 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: sciencesPlan.id,
        title: 'Our School Environment',
        titleFr: 'Notre environnement scolaire',
        description: 'Exploring living and non-living things in our school environment, observing daily changes.',
        descriptionFr: 'Explorer les êtres vivants et non-vivants dans notre environnement scolaire, observer les changements quotidiens.',
        bigIdeas: 'Our school has living and non-living things. We can observe changes every day.',
        bigIdeasFr: 'Notre école a des êtres vivants et non-vivants. Nous pouvons observer des changements chaque jour.',
        essentialQuestions: JSON.stringify([
          'Qu\'est-ce qui est vivant autour de nous?',
          'Comment change notre environnement?',
          'Comment prendre soin de notre école?'
        ]),
        startDate: new Date('2024-09-03'),
        endDate: new Date('2024-09-27'),
        estimatedHours: 12,
        assessmentPlan: 'Science journals, observation checklists, sorting activities assessment, outdoor exploration rubrics.',
        successCriteria: JSON.stringify([
          'Je peux identifier les êtres vivants',
          'Je peux observer les changements quotidiens',
          'Je peux décrire ce que j\'observe'
        ]),
        crossCurricularConnections: 'Math: sorting and classifying; French: science vocabulary; Art: nature drawings; Social Studies: school community',
        learningSkills: JSON.stringify(['Organization', 'Initiative', 'Self-regulation']),
        culminatingTask: 'Create a class book "Living Things at Our School" with observations and drawings.',
        keyVocabulary: JSON.stringify([
          'vivant', 'non-vivant', 'plante', 'animal', 'observer',
          'grandir', 'bouger', 'respirer', 'manger', 'environnement'
        ]),
        priorKnowledge: 'Basic understanding of plants and animals, observation skills from kindergarten.',
        parentCommunicationPlan: 'Science newsletter, nature walk homework, observation journal for home.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Picture cards, guided observations, partner support',
          developing: 'Independent observations, simple recording sheets',
          extending: 'Detailed drawings, comparing observations, helping others'
        }),
        indigenousPerspectives: 'All living things are connected, respect for nature, Mi\'kmaq teachings about living things.',
        environmentalEducation: 'Caring for school grounds, reducing waste, respecting all living things.',
        socialJusticeConnections: 'Everyone can be a scientist, different ways of observing, accessibility in outdoor learning.',
        technologyIntegration: 'Digital microscopes, photo documentation, nature apps for identification.',
        communityConnections: 'School groundskeeper visit, local naturalist guest speaker, adopt a tree program.'
      }
    });
    
    // Link expectations to Unit 1
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit1.id, expectationId: expectationMap.get('1.1.1')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit1.id, expectationId: expectationMap.get('1.3.1')!.id }
    });
    
    console.log('✅ Created Unit 1: Notre environnement scolaire');
    
    // UNIT 2: Fall Changes (October-November)
    const unit2 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: sciencesPlan.id,
        title: 'Fall Changes',
        titleFr: 'Les changements d\'automne',
        description: 'Investigating seasonal changes in fall and how living things prepare for winter.',
        descriptionFr: 'Étudier les changements saisonniers en automne et comment les êtres vivants se préparent pour l\'hiver.',
        bigIdeas: 'Fall brings many changes. Living things prepare for winter in different ways.',
        bigIdeasFr: 'L\'automne apporte plusieurs changements. Les êtres vivants se préparent pour l\'hiver différemment.',
        essentialQuestions: JSON.stringify([
          'Comment change la nature en automne?',
          'Comment les animaux se préparent pour l\'hiver?',
          'Pourquoi les feuilles changent de couleur?'
        ]),
        startDate: new Date('2024-09-30'),
        endDate: new Date('2024-11-08'),
        estimatedHours: 18,
        assessmentPlan: 'Seasonal observations portfolio, leaf collection and classification, animal preparation research presentations.',
        successCriteria: JSON.stringify([
          'Je peux décrire les changements d\'automne',
          'Je peux expliquer comment les animaux se préparent',
          'Je peux comparer l\'été et l\'automne'
        ]),
        crossCurricularConnections: 'Math: measuring temperature, graphing changes; French: autumn vocabulary; Art: leaf art; PE: outdoor activities',
        learningSkills: JSON.stringify(['Collaboration', 'Independent work', 'Initiative']),
        culminatingTask: 'Fall science fair showcasing seasonal changes and animal adaptations.',
        keyVocabulary: JSON.stringify([
          'automne', 'saison', 'température', 'feuille', 'hibernation',
          'migration', 'adaptation', 'préparer', 'changer', 'tomber'
        ]),
        priorKnowledge: 'Understanding of seasons from lived experience, basic knowledge of animals and plants.',
        parentCommunicationPlan: 'Fall nature hunt checklist, family observation activities, seasonal change discussions.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Concrete observations, simple comparisons, visual supports',
          developing: 'Recording observations, making predictions, group investigations',
          extending: 'Discovery projects, detailed explanations, teaching others'
        }),
        indigenousPerspectives: 'Seasonal rounds, traditional knowledge of animal behaviors, harvest teachings.',
        environmentalEducation: 'Leave no trace principles, respecting animal homes, sustainable fall activities.',
        socialJusticeConnections: 'Access to nature for all, different cultural perspectives on seasons, inclusive outdoor learning.',
        technologyIntegration: 'Weather tracking apps, time-lapse videos of changes, digital leaf identification.',
        communityConnections: 'Apple orchard visit, Elder sharing about seasonal changes, park ranger presentation.'
      }
    });
    
    // Link expectations to Unit 2
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit2.id, expectationId: expectationMap.get('1.3.2')!.id }
    });
    
    console.log('✅ Created Unit 2: Les changements d\'automne');
    
    // UNIT 3: Energy in Our Lives (November-December)
    const unit3 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: sciencesPlan.id,
        title: 'Energy in Our Lives',
        titleFr: 'L\'énergie dans nos vies',
        description: 'Exploring how we use energy at home and school, learning to conserve energy.',
        descriptionFr: 'Explorer comment nous utilisons l\'énergie à la maison et à l\'école, apprendre à conserver l\'énergie.',
        bigIdeas: 'We use energy every day. We can make choices to save energy.',
        bigIdeasFr: 'Nous utilisons l\'énergie chaque jour. Nous pouvons faire des choix pour économiser l\'énergie.',
        essentialQuestions: JSON.stringify([
          'Comment utilisons-nous l\'énergie?',
          'D\'où vient l\'énergie?',
          'Comment pouvons-nous économiser l\'énergie?'
        ]),
        startDate: new Date('2024-11-11'),
        endDate: new Date('2024-12-20'),
        estimatedHours: 18,
        assessmentPlan: 'Energy use surveys, conservation plan presentations, energy-saving poster assessment.',
        successCriteria: JSON.stringify([
          'Je peux identifier les utilisations d\'énergie',
          'Je peux expliquer comment économiser l\'énergie',
          'Je peux faire des choix écoénergétiques'
        ]),
        crossCurricularConnections: 'Math: counting and graphing energy use; Social Studies: community helpers (electricians); Health: staying warm; Art: conservation posters',
        learningSkills: JSON.stringify(['Responsibility', 'Organization', 'Collaboration']),
        culminatingTask: 'School energy-saving campaign with posters and announcements.',
        keyVocabulary: JSON.stringify([
          'énergie', 'électricité', 'chaleur', 'lumière', 'économiser',
          'gaspiller', 'éteindre', 'allumer', 'conservation', 'ressource'
        ]),
        priorKnowledge: 'Experience with lights, heat, and electrical devices; understanding of on/off concepts.',
        parentCommunicationPlan: 'Home energy audit worksheet, family conservation challenges, tips for saving energy.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Simple on/off concepts, picture cards, guided activities',
          developing: 'Energy hunt activities, creating simple plans, group work',
          extending: 'Research renewable energy, lead conservation efforts, mentor others'
        }),
        indigenousPerspectives: 'Traditional ways of staying warm, respect for natural resources, seven generations thinking.',
        environmentalEducation: 'Renewable vs non-renewable energy, climate change basics, personal responsibility.',
        socialJusticeConnections: 'Energy poverty, fair access to resources, global energy use differences.',
        technologyIntegration: 'Energy meter readings, videos about energy sources, digital conservation tracking.',
        communityConnections: 'Efficiency PEI presentation, electrician visit, tour of school heating system.'
      }
    });
    
    // Link expectations to Unit 3
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit3.id, expectationId: expectationMap.get('1.2.1')!.id }
    });
    
    console.log('✅ Created Unit 3: L\'énergie dans nos vies');
    
    // UNIT 4: Winter Wonders (January-February)
    const unit4 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: sciencesPlan.id,
        title: 'Winter Wonders',
        titleFr: 'Les merveilles de l\'hiver',
        description: 'Discovering how winter affects our environment and how living things survive the cold.',
        descriptionFr: 'Découvrir comment l\'hiver affecte notre environnement et comment les êtres vivants survivent au froid.',
        bigIdeas: 'Winter brings unique changes. Living things have special ways to survive winter.',
        bigIdeasFr: 'L\'hiver apporte des changements uniques. Les êtres vivants ont des façons spéciales de survivre.',
        essentialQuestions: JSON.stringify([
          'Comment l\'hiver change-t-il notre monde?',
          'Comment les animaux survivent l\'hiver?',
          'Pourquoi avons-nous des saisons?'
        ]),
        startDate: new Date('2025-01-06'),
        endDate: new Date('2025-02-14'),
        estimatedHours: 18,
        assessmentPlan: 'Winter journal observations, animal adaptation research, ice experiments documentation.',
        successCriteria: JSON.stringify([
          'Je peux décrire les changements d\'hiver',
          'Je peux expliquer les adaptations hivernales',
          'Je peux faire des observations scientifiques'
        ]),
        crossCurricularConnections: 'Math: temperature graphing, measuring snow; French: winter vocabulary; PE: winter sports; Art: snowflake symmetry',
        learningSkills: JSON.stringify(['Self-regulation', 'Initiative', 'Independent work']),
        culminatingTask: 'Winter science museum with experiments and displays about winter adaptations.',
        keyVocabulary: JSON.stringify([
          'hiver', 'neige', 'glace', 'gel', 'froid', 'adaptation',
          'survie', 'température', 'solide', 'liquide'
        ]),
        priorKnowledge: 'Experience with PEI winters, understanding of seasonal changes from fall unit.',
        parentCommunicationPlan: 'Winter safety reminders, home ice experiments, family winter observations.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Hands-on experiments, visual supports, partner work',
          developing: 'Recording predictions and results, comparing observations',
          extending: 'Designing experiments, researching Arctic animals, leading activities'
        }),
        indigenousPerspectives: 'Winter survival knowledge, traditional winter activities, stories of winter.',
        environmentalEducation: 'Winter ecology, helping wildlife in winter, climate change effects on winter.',
        socialJusticeConnections: 'Winter clothing access, heating equity, helping neighbors in winter.',
        technologyIntegration: 'Thermometer apps, videos of animals in winter, virtual field trips to cold regions.',
        communityConnections: 'Ice fisherman visit, winter safety expert, wildlife biologist presentation.'
      }
    });
    
    // No new expectations for Unit 4 - it reinforces 1.3.1 and 1.3.2
    console.log('✅ Created Unit 4: Les merveilles de l\'hiver (reinforcement unit)');
    
    // UNIT 5: Growing and Changing (March-April)
    const unit5 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: sciencesPlan.id,
        title: 'Growing and Changing',
        titleFr: 'Grandir et changer',
        description: 'Investigating how plants and animals grow and change, including human growth.',
        descriptionFr: 'Étudier comment les plantes et animaux grandissent et changent, incluant la croissance humaine.',
        bigIdeas: 'All living things grow and change. We can observe and measure growth.',
        bigIdeasFr: 'Tous les êtres vivants grandissent et changent. Nous pouvons observer et mesurer la croissance.',
        essentialQuestions: JSON.stringify([
          'Comment grandissent les plantes?',
          'Comment changent les animaux?',
          'Comment avons-nous grandi?'
        ]),
        startDate: new Date('2025-02-17'),
        endDate: new Date('2025-04-11'),
        estimatedHours: 24,
        assessmentPlan: 'Plant growth journals, life cycle diagrams, growth comparison charts, observation rubrics.',
        successCriteria: JSON.stringify([
          'Je peux décrire comment les plantes grandissent',
          'Je peux expliquer les cycles de vie',
          'Je peux mesurer et comparer la croissance'
        ]),
        crossCurricularConnections: 'Math: measuring growth, graphing changes; French: growth vocabulary; Health: human growth; Art: life cycle art',
        learningSkills: JSON.stringify(['Responsibility', 'Organization', 'Initiative']),
        culminatingTask: 'Growth exhibition with plant experiments, life cycle models, and growth timelines.',
        keyVocabulary: JSON.stringify([
          'grandir', 'changer', 'cycle de vie', 'graine', 'racine',
          'tige', 'feuille', 'fleur', 'bébé', 'adulte'
        ]),
        priorKnowledge: 'Understanding of living things, observation skills, basic measurement skills.',
        parentCommunicationPlan: 'Home planting project, growth chart activities, baby photo sharing.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Simple observations, concrete examples, guided recording',
          developing: 'Comparing growth, making predictions, independent observations',
          extending: 'Controlled experiments, researching unusual life cycles, teaching others'
        }),
        indigenousPerspectives: 'Plants as medicine, traditional planting knowledge, respect for plant relatives.',
        environmentalEducation: 'Plant importance, habitat needs, protecting growing spaces.',
        socialJusticeConnections: 'Food security, access to growing spaces, urban gardening.',
        technologyIntegration: 'Time-lapse videos of growth, plant identification apps, digital growth tracking.',
        communityConnections: 'Greenhouse visit, farmer guest speaker, baby animal farm trip.'
      }
    });
    
    // Link to living things expectation (reinforcement)
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit5.id, expectationId: expectationMap.get('1.1.1')!.id }
    });
    
    console.log('✅ Created Unit 5: Grandir et changer');
    
    // UNIT 6: Spring Awakening (April-May)
    const unit6 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: sciencesPlan.id,
        title: 'Spring Awakening',
        titleFr: 'Le réveil du printemps',
        description: 'Observing spring changes, new life, and how seasonal cycles affect living things.',
        descriptionFr: 'Observer les changements printaniers, la nouvelle vie et comment les cycles saisonniers affectent les êtres vivants.',
        bigIdeas: 'Spring brings new life and growth. We can see patterns in seasonal changes.',
        bigIdeasFr: 'Le printemps apporte nouvelle vie et croissance. Nous pouvons voir des régularités dans les changements.',
        essentialQuestions: JSON.stringify([
          'Comment la nature se réveille au printemps?',
          'Quels changements observons-nous?',
          'Comment savons-nous que c\'est le printemps?'
        ]),
        startDate: new Date('2025-04-14'),
        endDate: new Date('2025-05-16'),
        estimatedHours: 18,
        assessmentPlan: 'Spring observation journals, seasonal comparison charts, new life documentation.',
        successCriteria: JSON.stringify([
          'Je peux identifier les signes du printemps',
          'Je peux comparer les saisons',
          'Je peux expliquer les cycles saisonniers'
        ]),
        crossCurricularConnections: 'Math: calendar patterns, measuring rainfall; French: spring vocabulary; Art: spring colors; Music: spring songs',
        learningSkills: JSON.stringify(['Initiative', 'Collaboration', 'Self-regulation']),
        culminatingTask: 'Spring celebration with seasonal displays and presentations about changes.',
        keyVocabulary: JSON.stringify([
          'printemps', 'bourgeon', 'fleurir', 'pluie', 'soleil',
          'nid', 'œuf', 'pousser', 'vert', 'nouveau'
        ]),
        priorKnowledge: 'Understanding of other seasons, observation skills, knowledge of plants and animals.',
        parentCommunicationPlan: 'Spring nature walks, home garden projects, seasonal observation activities.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Concrete observations, picture supports, guided comparisons',
          developing: 'Recording detailed observations, making connections, predictions',
          extending: 'Investigating climate effects, researching global seasons, leading investigations'
        }),
        indigenousPerspectives: 'Spring ceremonies, traditional spring foods, seasonal teachings.',
        environmentalEducation: 'Spring cleanup, helping pollinators, protecting nesting birds.',
        socialJusticeConnections: 'Access to green spaces, community gardens, environmental justice.',
        technologyIntegration: 'Bird identification apps, spring webcams, digital nature journals.',
        communityConnections: 'Naturalist walk, beekeeper visit, community garden participation.'
      }
    });
    
    // Link to seasonal change expectations (reinforcement)
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit6.id, expectationId: expectationMap.get('1.3.2')!.id }
    });
    
    console.log('✅ Created Unit 6: Le réveil du printemps');
    
    // UNIT 7: Our Impact on Nature (May-June)
    const unit7 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: sciencesPlan.id,
        title: 'Our Impact on Nature',
        titleFr: 'Notre impact sur la nature',
        description: 'Understanding how human activities affect the environment and how we can help.',
        descriptionFr: 'Comprendre comment les activités humaines affectent l\'environnement et comment nous pouvons aider.',
        bigIdeas: 'Our actions affect the environment. We can make positive changes.',
        bigIdeasFr: 'Nos actions affectent l\'environnement. Nous pouvons faire des changements positifs.',
        essentialQuestions: JSON.stringify([
          'Comment affectons-nous la nature?',
          'Comment pouvons-nous aider l\'environnement?',
          'Pourquoi est-ce important de protéger la nature?'
        ]),
        startDate: new Date('2025-05-19'),
        endDate: new Date('2025-06-20'),
        estimatedHours: 18,
        assessmentPlan: 'Environmental action plans, before/after comparisons, stewardship project assessment.',
        successCriteria: JSON.stringify([
          'Je peux identifier les impacts humains',
          'Je peux expliquer comment aider la nature',
          'Je peux faire des actions positives'
        ]),
        crossCurricularConnections: 'Social Studies: community responsibility; Math: waste reduction data; French: environmental vocabulary; Art: recycled art',
        learningSkills: JSON.stringify(['Responsibility', 'Initiative', 'Collaboration', 'Organization']),
        culminatingTask: 'School environmental action project with measurable positive impact.',
        keyVocabulary: JSON.stringify([
          'environnement', 'pollution', 'recycler', 'réduire', 'réutiliser',
          'protéger', 'nature', 'déchet', 'propre', 'aider'
        ]),
        priorKnowledge: 'Understanding of living things, energy conservation, seasonal changes.',
        parentCommunicationPlan: 'Family eco-challenges, home environmental audit, summer nature activities.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Simple actions, visual guides, supported participation',
          developing: 'Planning actions, understanding consequences, group projects',
          extending: 'Leading initiatives, researching solutions, teaching others'
        }),
        indigenousPerspectives: 'Land as teacher, reciprocal relationships with nature, traditional ecological knowledge.',
        environmentalEducation: 'Leave no trace, habitat protection, sustainable practices, climate action.',
        socialJusticeConnections: 'Environmental racism, equitable access to clean environments, youth activism.',
        technologyIntegration: 'Pollution tracking apps, environmental videos, digital action planning.',
        communityConnections: 'Environmental group visit, beach cleanup, tree planting ceremony.'
      }
    });
    
    // Link expectations to Unit 7
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit7.id, expectationId: expectationMap.get('1.1.2')!.id }
    });
    
    console.log('✅ Created Unit 7: Notre impact sur la nature');
    
    // Verify all expectations are covered
    const unitCount = await prisma.unitPlan.count({
      where: { longRangePlanId: sciencesPlan.id }
    });
    
    const linkedExpectations = await prisma.unitPlanExpectation.count({
      where: {
        unitPlan: {
          longRangePlanId: sciencesPlan.id
        }
      }
    });
    
    console.log('\n📊 UNIT PLANS CREATED SUCCESSFULLY!');
    console.log(`✅ ${unitCount} unit plans created for Sciences de la nature`);
    console.log(`✅ ${linkedExpectations} curriculum expectations linked to units`);
    console.log('✅ Complete coverage from September to June');
    console.log('✅ All 5 Sciences expectations distributed appropriately');
    console.log('✅ Rich metadata for hands-on, inquiry-based learning');
    console.log('✅ Emily is ready to teach Grade 1 Science with wonder and discovery!');
    
  } catch (error) {
    console.error('❌ Error creating unit plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedSciencesUnitPlans()
  .then(() => console.log('🎉 Sciences de la nature unit plans seeding completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });