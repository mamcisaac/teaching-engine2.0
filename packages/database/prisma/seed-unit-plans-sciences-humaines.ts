#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSciencesHumainesUnitPlans() {
  console.log('🏛️ Creating Unit Plans for Sciences humaines - Grade 1...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found. Please run main seed first.');
    }
    
    // Get the Sciences humaines long range plan
    const socialStudiesPlan = await prisma.longRangePlan.findFirst({
      where: {
        userId: emily.id,
        subject: 'Sciences humaines',
        academicYear: '2025-2026'
      }
    });
    
    if (!socialStudiesPlan) {
      throw new Error('Sciences humaines long range plan not found. Please run long range plans seed first.');
    }
    
    console.log(`✅ Found Sciences humaines long range plan (ID: ${socialStudiesPlan.id})`);
    
    // Get all Social Studies expectations
    const expectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Sciences humaines',
        grade: 1
      }
    });
    
    // Create a map for easy lookup
    const expectationMap = new Map(expectations.map(e => [e.code, e]));
    
    // Clear existing unit plans for this long range plan
    const existingUnits = await prisma.unitPlan.findMany({
      where: { longRangePlanId: socialStudiesPlan.id },
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
        where: { longRangePlanId: socialStudiesPlan.id }
      });
    }
    
    console.log('🗑️ Cleared existing unit plans');
    
    // UNIT 1: Ma famille et notre classe (September-October)
    const unit1 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: socialStudiesPlan.id,
        title: 'My Family and Our Class',
        titleFr: 'Ma famille et notre classe',
        description: 'Exploring the uniqueness of people, celebrating diversity in families, and understanding needs vs wants.',
        descriptionFr: 'Explorer l\'unicité des personnes, célébrer la diversité dans les familles et comprendre les besoins et les désirs.',
        bigIdeas: 'Every person is unique and special. Families are different and wonderful. We all have needs and wants.',
        bigIdeasFr: 'Chaque personne est unique et spéciale. Les familles sont différentes et merveilleuses. Nous avons tous des besoins et des désirs.',
        essentialQuestions: JSON.stringify([
          'Qu\'est-ce qui me rend unique?',
          'Comment les familles sont-elles différentes?',
          'Quelle est la différence entre un besoin et un désir?'
        ]),
        startDate: new Date('2025-09-04'),
        endDate: new Date('2025-10-10'),
        estimatedHours: 18,
        assessmentPlan: 'Family diversity portfolio, needs vs wants sorting activities, uniqueness self-portraits, sharing circles observations.',
        successCriteria: JSON.stringify([
          'Je peux décrire ce qui me rend unique',
          'Je peux expliquer comment les familles sont différentes',
          'Je peux distinguer mes besoins de mes désirs'
        ]),
        crossCurricularConnections: 'French: family vocabulary, storytelling; Math: counting family members, graphing differences; Art: family portraits, cultural art',
        learningSkills: JSON.stringify(['Collaboration', 'Self-regulation', 'Initiative']),
        culminatingTask: 'Create a class museum of family diversity with photos, artifacts, and stories from each family.',
        keyVocabulary: JSON.stringify([
          'unique', 'famille', 'diversité', 'langue', 'culture', 'tradition',
          'besoin', 'désir', 'différent', 'spécial', 'partager', 'respecter'
        ]),
        priorKnowledge: 'Basic understanding of family concept, some awareness of differences among people.',
        parentCommunicationPlan: 'Family heritage sharing invitation, cultural artifact requests, home language celebration, photo sharing project.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Picture supports, simple comparisons, family photos for discussion',
          developing: 'Graphic organizers, family tree creation, guided sharing',
          extending: 'Cultural research projects, family heritage presentations, peer teaching'
        }),
        indigenousPerspectives: 'Extended family concepts, traditional family structures, Elders\' important role, land as family.',
        environmentalEducation: 'Families caring for the land together, traditional environmental practices, respecting our Earth home.',
        socialJusticeConnections: 'Celebrating all family types, linguistic diversity as strength, newcomer family support, equity in sharing opportunities.',
        technologyIntegration: 'Digital family albums, virtual cultural tours, online family connections, recording family stories.',
        communityConnections: 'Family heritage fair, multicultural potluck, Elder storytellers, immigrant support services, cultural associations.'
      }
    });
    
    // Link expectations to Unit 1
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit1.id, expectationId: expectationMap.get('1ICC.1')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit1.id, expectationId: expectationMap.get('1ER.1')!.id }
    });
    
    console.log('✅ Created Unit 1: Ma famille et notre classe');
    
    // UNIT 2: Nos droits et responsabilités (October-November)
    const unit2 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: socialStudiesPlan.id,
        title: 'Our Rights and Responsibilities',
        titleFr: 'Nos droits et responsabilités',
        description: 'Learning about rights and responsibilities in family and school, plus decision-making and peaceful conflict resolution.',
        descriptionFr: 'Apprendre nos droits et responsabilités dans la famille et à l\'école, ainsi que la prise de décision et la résolution pacifique de conflits.',
        bigIdeas: 'We have rights and responsibilities. Good decisions help everyone. We can solve problems peacefully.',
        bigIdeasFr: 'Nous avons des droits et des responsabilités. De bonnes décisions aident tout le monde. Nous pouvons résoudre les problèmes pacifiquement.',
        essentialQuestions: JSON.stringify([
          'Quels sont mes droits et mes responsabilités?',
          'Comment prendre de bonnes décisions?',
          'Comment résoudre les conflits pacifiquement?'
        ]),
        startDate: new Date('2025-10-14'),
        endDate: new Date('2025-11-28'),
        estimatedHours: 20,
        assessmentPlan: 'Rights and responsibilities charts, decision-making scenarios, conflict resolution role-plays, classroom rule creation assessment.',
        successCriteria: JSON.stringify([
          'Je peux nommer mes droits et responsabilités',
          'Je peux utiliser des étapes pour prendre des décisions',
          'Je peux résoudre des conflits en parlant calmement'
        ]),
        crossCurricularConnections: 'French: discussion vocabulary, problem-solving language; Drama: conflict resolution skits; Health: emotional regulation',
        learningSkills: JSON.stringify(['Responsibility', 'Collaboration', 'Self-regulation']),
        culminatingTask: 'Create and present a classroom charter of rights and responsibilities with peaceful problem-solving guidelines.',
        keyVocabulary: JSON.stringify([
          'droit', 'responsabilité', 'décision', 'conflit', 'résolution', 'règlement',
          'écouter', 'respecter', 'partager', 'aider', 'problème', 'solution'
        ]),
        priorKnowledge: 'Basic understanding of rules, some experience with sharing and taking turns.',
        parentCommunicationPlan: 'Home rules discussion, family decision-making sharing, conflict resolution practice tips, rights and responsibilities at home.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Picture charts, simple scenarios, guided practice with support',
          developing: 'Written scenarios, peer problem-solving, rule creation participation',
          extending: 'Complex scenarios, peer mediation roles, teaching conflict resolution'
        }),
        indigenousPerspectives: 'Traditional council decision-making, consensus building, community responsibility, restorative justice practices.',
        environmentalEducation: 'Our responsibility to care for the Earth, environmental stewardship rights, sustainable decision-making.',
        socialJusticeConnections: 'Fair treatment for all, standing up for others, inclusive decision-making, addressing discrimination.',
        technologyIntegration: 'Digital citizenship introduction, online respectful communication, technology rules creation.',
        communityConnections: 'Police community liaison visit, student council participation, peer mediation training, community problem-solving examples.'
      }
    });
    
    // Link expectations to Unit 2
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit2.id, expectationId: expectationMap.get('1C.1')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit2.id, expectationId: expectationMap.get('1PA.1')!.id }
    });
    
    console.log('✅ Created Unit 2: Nos droits et responsabilités');
    
    // UNIT 3: Mon histoire dans le temps (December-January)
    const unit3 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: socialStudiesPlan.id,
        title: 'My Story Through Time',
        titleFr: 'Mon histoire dans le temps',
        description: 'Organizing important life events in chronological order and understanding the concept of time and personal history.',
        descriptionFr: 'Organiser les événements importants de la vie en ordre chronologique et comprendre le concept du temps et de l\'histoire personnelle.',
        bigIdeas: 'Everyone has a personal story. Events happen in order through time. We can remember and organize our memories.',
        bigIdeasFr: 'Chacun a une histoire personnelle. Les événements arrivent en ordre dans le temps. Nous pouvons nous souvenir et organiser nos souvenirs.',
        essentialQuestions: JSON.stringify([
          'Quelle est mon histoire personnelle?',
          'Comment organiser les événements dans le temps?',
          'Comment ai-je changé en grandissant?'
        ]),
        startDate: new Date('2025-12-01'),
        endDate: new Date('2026-01-31'),
        estimatedHours: 24,
        assessmentPlan: 'Personal timeline creation, memory box presentations, before/after comparisons, time sequence activities.',
        successCriteria: JSON.stringify([
          'Je peux organiser mes souvenirs en ordre de temps',
          'Je peux créer une ligne du temps de ma vie',
          'Je peux expliquer comment j\'ai grandi et changé'
        ]),
        crossCurricularConnections: 'Math: sequencing, measuring growth; French: storytelling, time vocabulary; Science: human growth and development',
        learningSkills: JSON.stringify(['Organization', 'Initiative', 'Independent work']),
        culminatingTask: 'Create a personal history museum with timelines, artifacts, and recorded stories to share with families.',
        keyVocabulary: JSON.stringify([
          'temps', 'histoire', 'souvenir', 'passé', 'présent', 'futur',
          'bébé', 'grandir', 'changer', 'avant', 'après', 'maintenant'
        ]),
        priorKnowledge: 'Basic understanding of before/after, some personal memories, concept of growing up.',
        parentCommunicationPlan: 'Baby photo requests, family story sharing, memory artifact collection, growth measurement tracking.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Picture timelines, simple before/after, family support for memories',
          developing: 'Written timelines, memory organization, independent story creation',
          extending: 'Detailed timelines, family history connections, interviewing relatives'
        }),
        indigenousPerspectives: 'Oral history traditions, seven generations thinking, ceremony marking life stages, connection to ancestors.',
        environmentalEducation: 'Seasonal changes over time, environmental history, caring for places that matter to us.',
        socialJusticeConnections: 'Everyone\'s story matters, diverse family histories, honoring different cultural traditions.',
        technologyIntegration: 'Digital timelines, recorded interviews, photo organization, video storytelling.',
        communityConnections: 'Local history museum visit, Elder interviews, historical society partnership, family history sharing.'
      }
    });
    
    // Link expectations to Unit 3
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit3.id, expectationId: expectationMap.get('1LT.2')!.id }
    });
    
    console.log('✅ Created Unit 3: Mon histoire dans le temps');
    
    // UNIT 4: Explorer notre monde (February-April)
    const unit4 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: socialStudiesPlan.id,
        title: 'Exploring Our World',
        titleFr: 'Explorer notre monde',
        description: 'Using maps, plans, and globes to locate landmarks and important places, developing spatial thinking and geographic awareness.',
        descriptionFr: 'Utiliser des cartes, plans et globes pour localiser des points de repère et des lieux importants, développer la pensée spatiale.',
        bigIdeas: 'We can find places using maps and directions. Our world has many special places. We belong to different communities.',
        bigIdeasFr: 'Nous pouvons trouver des lieux avec des cartes et des directions. Notre monde a plusieurs endroits spéciaux. Nous appartenons à différentes communautés.',
        essentialQuestions: JSON.stringify([
          'Comment utiliser une carte pour trouver des lieux?',
          'Où sont les endroits importants pour moi?',
          'Comment décrire où je vis?'
        ]),
        startDate: new Date('2026-02-02'),
        endDate: new Date('2026-04-11'),
        estimatedHours: 28,
        assessmentPlan: 'Map reading activities, landmark identification, direction following tasks, community place investigations.',
        successCriteria: JSON.stringify([
          'Je peux utiliser une carte simple pour trouver des lieux',
          'Je peux nommer des endroits importants dans ma communauté',
          'Je peux donner des directions simples'
        ]),
        crossCurricularConnections: 'Math: shapes, directions, measurement; Art: map making, aerial view drawings; PE: directional games',
        learningSkills: JSON.stringify(['Initiative', 'Organization', 'Collaboration']),
        culminatingTask: 'Create a giant floor map of our community with important landmarks and present guided tours.',
        keyVocabulary: JSON.stringify([
          'carte', 'globe', 'plan', 'direction', 'nord', 'sud', 'est', 'ouest',
          'lieu', 'endroit', 'communauté', 'près', 'loin', 'entre'
        ]),
        priorKnowledge: 'Basic spatial awareness, familiarity with neighborhood, understanding of near/far.',
        parentCommunicationPlan: 'Neighborhood walk homework, important places sharing, family map activities, community exploration.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Simple classroom maps, concrete landmarks, guided exploration',
          developing: 'School and neighborhood maps, independent place finding, direction giving',
          extending: 'Detailed community maps, advanced directions, creating maps for others'
        }),
        indigenousPerspectives: 'Traditional navigation methods, sacred places, land as teacher, traditional territory acknowledgment.',
        environmentalEducation: 'Natural landmarks, protecting special places, sustainable transportation, respecting the land.',
        socialJusticeConnections: 'Access to community spaces, safe places for everyone, inclusive community design.',
        technologyIntegration: 'Simple GPS activities, aerial photo exploration, digital mapping games, virtual field trips.',
        communityConnections: 'Community walks, local landmark visits, map-making workshop with city planners, transportation authority visit.'
      }
    });
    
    // Link expectations to Unit 4
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit4.id, expectationId: expectationMap.get('1LT.1')!.id }
    });
    
    console.log('✅ Created Unit 4: Explorer notre monde');
    
    // UNIT 5: Citoyens numériques responsables (April-June)
    const unit5 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: socialStudiesPlan.id,
        title: 'Responsible Digital Citizens',
        titleFr: 'Citoyens numériques responsables',
        description: 'Developing age-appropriate digital citizenship skills, understanding online safety, and learning responsible technology use.',
        descriptionFr: 'Développer des compétences de citoyenneté numérique appropriées, comprendre la sécurité en ligne et apprendre l\'usage responsable de la technologie.',
        bigIdeas: 'Technology can help us learn and connect. We must be safe and kind online. Digital citizens follow good rules.',
        bigIdeasFr: 'La technologie peut nous aider à apprendre et nous connecter. Nous devons être en sécurité et gentils en ligne. Les citoyens numériques suivent de bonnes règles.',
        essentialQuestions: JSON.stringify([
          'Comment utiliser la technologie de façon sécuritaire?',
          'Comment être gentil en ligne?',
          'Quelles sont les règles importantes pour la technologie?'
        ]),
        startDate: new Date('2026-04-14'),
        endDate: new Date('2026-06-25'),
        estimatedHours: 30,
        assessmentPlan: 'Digital citizenship scenarios, online safety demonstrations, technology rules creation, responsible use reflections.',
        successCriteria: JSON.stringify([
          'Je peux utiliser la technologie de façon sécuritaire',
          'Je peux être respectueux avec la technologie',
          'Je peux suivre les règles pour les ordinateurs et tablettes'
        ]),
        crossCurricularConnections: 'All subjects: technology integration; Health: online safety; French: digital communication vocabulary',
        learningSkills: JSON.stringify(['Responsibility', 'Self-regulation', 'Collaboration', 'Organization']),
        culminatingTask: 'Create and present digital citizenship pledges and safety demonstrations for younger students.',
        keyVocabulary: JSON.stringify([
          'technologie', 'ordinateur', 'tablette', 'sécurité', 'mot de passe', 'internet',
          'respectueux', 'gentil', 'règles', 'responsable', 'privé', 'partager'
        ]),
        priorKnowledge: 'Some experience with devices, basic understanding of rules and safety.',
        parentCommunicationPlan: 'Home technology agreements, family screen time discussions, digital safety tips, responsible use modeling.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Simple device rules, concrete safety examples, guided practice',
          developing: 'Technology scenarios, independent rule following, peer support',
          extending: 'Advanced safety concepts, helping others, creating digital content responsibly'
        }),
        indigenousPerspectives: 'Traditional knowledge sharing methods, storytelling through technology, cultural preservation online, connecting with Elders virtually.',
        environmentalEducation: 'Reducing electronic waste, energy conservation, choosing eco-friendly technology options.',
        socialJusticeConnections: 'Digital equity, cyberbullying prevention, inclusive online spaces, supporting others online.',
        technologyIntegration: 'Hands-on device practice, safe browsing activities, creative digital projects, communication tools exploration.',
        communityConnections: 'IT specialist visit, digital library programs, coding workshop, online safety presentations from police.'
      }
    });
    
    // Link expectations to Unit 5
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit5.id, expectationId: expectationMap.get('1C.2')!.id }
    });
    
    console.log('✅ Created Unit 5: Citoyens numériques responsables');
    
    // Verify all expectations are covered
    const unitCount = await prisma.unitPlan.count({
      where: { longRangePlanId: socialStudiesPlan.id }
    });
    
    const linkedExpectations = await prisma.unitPlanExpectation.count({
      where: {
        unitPlan: {
          longRangePlanId: socialStudiesPlan.id
        }
      }
    });
    
    console.log('\n📊 UNIT PLANS CREATED SUCCESSFULLY!');
    console.log(`✅ ${unitCount} unit plans created for Sciences humaines`);
    console.log(`✅ ${linkedExpectations} curriculum expectations linked to units`);
    console.log('✅ Complete coverage from September to June');
    console.log('✅ All 7 Social Studies expectations distributed appropriately');
    console.log('✅ Rich metadata for citizenship, geography, and social skills learning');
    console.log('✅ Emily is ready to teach Grade 1 Social Studies with confidence!');
    
  } catch (error) {
    console.error('❌ Error creating unit plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedSciencesHumainesUnitPlans()
  .then(() => console.log('🎉 Sciences humaines unit plans seeding completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });