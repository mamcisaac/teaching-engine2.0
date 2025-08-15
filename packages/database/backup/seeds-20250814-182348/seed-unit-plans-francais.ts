#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedFrancaisUnitPlans() {
  console.log('📚 Creating Unit Plans for Français langue première - Grade 1...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found. Please run main seed first.');
    }
    
    // Get the Français langue première long range plan
    const francaisPlan = await prisma.longRangePlan.findFirst({
      where: {
        userId: emily.id,
        subject: 'Français langue première',
        academicYear: '2025-2026'
      }
    });
    
    if (!francaisPlan) {
      throw new Error('Français langue première long range plan not found. Please run long range plans seed first.');
    }
    
    console.log(`✅ Found Français long range plan (ID: ${francaisPlan.id})`);
    
    // Get all Français expectations
    const expectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Français (Immersion)',
        grade: 1
      }
    });
    
    // Create a map for easy lookup
    const expectationMap = new Map(expectations.map(e => [e.code, e]));
    
    // Clear existing unit plans for this long range plan
    const existingUnits = await prisma.unitPlan.findMany({
      where: { longRangePlanId: francaisPlan.id },
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
        where: { longRangePlanId: francaisPlan.id }
      });
    }
    
    console.log('🗑️ Cleared existing unit plans');
    
    // UNIT 1: Bienvenue à l'école! (September)
    const unit1 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: francaisPlan.id,
        title: 'Welcome to School!',
        titleFr: 'Bienvenue à l\'école!',
        description: 'Introduction to French Immersion classroom, establishing routines, and building phonological awareness.',
        descriptionFr: 'Introduction à la classe d\'immersion française, établissement des routines et développement de la conscience phonologique.',
        bigIdeas: 'We communicate through sounds and words. Our classroom is a French-speaking community.',
        bigIdeasFr: 'Nous communiquons par des sons et des mots. Notre classe est une communauté francophone.',
        essentialQuestions: JSON.stringify([
          'Comment dit-on bonjour en français?',
          'Quels sons entends-tu?',
          'Comment écoute-t-on bien?'
        ]),
        startDate: new Date('2025-09-04'),
        endDate: new Date('2025-09-30'),
        estimatedHours: 20,
        assessmentPlan: 'Daily observations of oral French use, phonological awareness games assessment, listening behavior checklists.',
        successCriteria: JSON.stringify([
          'Je peux dire bonjour et au revoir en français',
          'Je peux identifier les sons au début des mots',
          'Je peux écouter attentivement mes amis'
        ]),

        learningSkills: JSON.stringify(['Self-regulation', 'Responsibility', 'Collaboration']),
        culminatingTask: 'Create a class book of "Nos amis de la classe" with photos and recorded greetings.',
        keyVocabulary: JSON.stringify([
          'bonjour', 'au revoir', 'merci', 's\'il vous plaît',
          'je m\'appelle', 'comment ça va?', 'ami(e)', 'école'
        ]),
        priorKnowledge: 'Basic social awareness, some exposure to French sounds (kindergarten French)',
        parentCommunicationPlan: 'Welcome letter explaining immersion approach, weekly French phrases to practice at home.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Picture supports, gestures, repetition, buddy system',
          developing: 'Simple sentence frames, choice of responses',
          extending: 'Additional vocabulary, helping others, French reading corner'
        }),
        indigenousPerspectives: 'Mi\'kmaq welcome protocols and greetings, importance of oral tradition.',
        environmentalEducation: 'Classroom as our learning environment, caring for shared spaces.',
        socialJusticeConnections: 'Everyone\'s name is important, respecting different ways of saying hello.',
        technologyIntegration: 'Recording greetings on tablets, listening center with French songs.',
        communityConnections: 'Invite French-speaking community members to share greetings from different francophone cultures.'
      }
    });
    
    // Link expectations to Unit 1
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit1.id, expectationId: expectationMap.get('1CO.0')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit1.id, expectationId: expectationMap.get('1CO.1')!.id }
    });
    
    console.log('✅ Created Unit 1: Bienvenue à l\'école!');
    
    // UNIT 2: Ma famille et moi (October)
    const unit2 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: francaisPlan.id,
        title: 'My Family and Me',
        titleFr: 'Ma famille et moi',
        description: 'Exploring family vocabulary, sharing personal stories, and developing listening comprehension strategies.',
        descriptionFr: 'Explorer le vocabulaire de la famille, partager des histoires personnelles et développer des stratégies de compréhension orale.',
        bigIdeas: 'Families are unique and special. We can share our stories in French.',
        bigIdeasFr: 'Les familles sont uniques et spéciales. Nous pouvons partager nos histoires en français.',
        essentialQuestions: JSON.stringify([
          'Qui est dans ta famille?',
          'Comment décris-tu ta famille?',
          'Qu\'est-ce que tu aimes faire avec ta famille?'
        ]),
        startDate: new Date('2025-10-01'),
        endDate: new Date('2025-10-31'),
        estimatedHours: 20,
        assessmentPlan: 'Oral presentations about family, comprehension checks during read-alouds, observation of strategy use.',
        successCriteria: JSON.stringify([
          'Je peux nommer les membres de ma famille',
          'Je peux comprendre une histoire simple sur la famille',
          'Je peux choisir des livres qui m\'intéressent'
        ]),

        learningSkills: JSON.stringify(['Initiative', 'Independent work', 'Collaboration']),
        culminatingTask: 'Family presentation with photos or drawings, sharing favorite family activity.',
        keyVocabulary: JSON.stringify([
          'maman', 'papa', 'frère', 'sœur', 'grand-mère', 'grand-père',
          'bébé', 'famille', 'maison', 'aimer', 'jouer', 'ensemble'
        ]),
        priorKnowledge: 'Understanding of family concept, some French greetings and basic vocabulary from Unit 1.',
        parentCommunicationPlan: 'Family vocabulary sheet, invitation to share family photos, family stories in any language welcome.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Family photo support, simple yes/no questions, partner support',
          developing: 'Sentence starters, vocabulary cards, guided practice',
          extending: 'Extended family vocabulary, creating family trees, bilingual books'
        }),
        indigenousPerspectives: 'Extended family and community as family, Seven Generations teaching.',
        environmentalEducation: 'Families caring for the Earth together, family gardens and outdoor activities.',
        socialJusticeConnections: 'All families are different and valuable, chosen families, single-parent families.',
        technologyIntegration: 'Digital family albums, recording family interviews, video calls with extended family.',
        communityConnections: 'Grandparents/Elders as guest readers, family cultural celebrations sharing.'
      }
    });
    
    // Link expectations to Unit 2
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit2.id, expectationId: expectationMap.get('1CO.2')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit2.id, expectationId: expectationMap.get('1L.1')!.id }
    });
    
    console.log('✅ Created Unit 2: Ma famille et moi');
    
    // UNIT 3: Les fêtes d'automne (November-December)
    const unit3 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: francaisPlan.id,
        title: 'Fall Celebrations',
        titleFr: 'Les fêtes d\'automne',
        description: 'Exploring autumn celebrations, developing interpretive listening skills, and beginning the writing process.',
        descriptionFr: 'Explorer les célébrations d\'automne, développer l\'écoute interprétative et commencer le processus d\'écriture.',
        bigIdeas: 'Celebrations bring communities together. Stories help us understand traditions.',
        bigIdeasFr: 'Les célébrations rassemblent les communautés. Les histoires nous aident à comprendre les traditions.',
        essentialQuestions: JSON.stringify([
          'Comment célèbre-t-on l\'automne?',
          'Quelles histoires raconte-t-on?',
          'Comment puis-je écrire mes idées?'
        ]),
        startDate: new Date('2025-11-03'),
        endDate: new Date('2025-12-19'),
        estimatedHours: 30,
        assessmentPlan: 'Story retelling rubric, writing samples portfolio, guided reading observations, seasonal vocabulary assessment.',
        successCriteria: JSON.stringify([
          'Je peux raconter une histoire d\'automne',
          'Je peux comprendre le message d\'une histoire',
          'Je peux écrire des mots et des phrases simples'
        ]),

        learningSkills: JSON.stringify(['Organization', 'Collaboration', 'Initiative']),
        culminatingTask: 'Create and present a class book of "Nos traditions d\'automne" with illustrations and simple sentences.',
        keyVocabulary: JSON.stringify([
          'automne', 'feuilles', 'citrouille', 'Halloween', 'Action de grâce',
          'récolte', 'thanksgiving', 'novembre', 'décembre', 'fête', 'célébrer'
        ]),
        priorKnowledge: 'Family vocabulary, basic writing concepts (letters, sounds), listening strategies from Units 1-2.',
        parentCommunicationPlan: 'Share family traditions survey, writing development information, home writing opportunities.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Labeled drawings, shared writing, predictable texts',
          developing: 'Sentence frames, word walls, guided writing',
          extending: 'Story innovation, author studies, publishing center'
        }),
        indigenousPerspectives: 'Harvest ceremonies and gratitude practices, seasonal rounds, Elder storytelling traditions.',
        environmentalEducation: 'Seasonal cycles, preparing for winter, animal adaptations, reducing Halloween waste.',
        socialJusticeConnections: 'Inclusive celebrations, understanding different cultural traditions, sharing and caring.',
        technologyIntegration: 'Digital storytelling apps, recording story retellings, virtual author visits.',
        communityConnections: 'Local harvest festival participation, food bank contributions, Elder storytellers visit.'
      }
    });
    
    // Link expectations to Unit 3
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit3.id, expectationId: expectationMap.get('1CO.3')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit3.id, expectationId: expectationMap.get('1L.2')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit3.id, expectationId: expectationMap.get('1É.1')!.id }
    });
    
    console.log('✅ Created Unit 3: Les fêtes d\'automne');
    
    // UNIT 4: L'hiver magique (January)
    const unit4 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: francaisPlan.id,
        title: 'Magical Winter',
        titleFr: 'L\'hiver magique',
        description: 'Winter exploration bridging Term 1 and Term 2, consolidating skills and introducing new challenges.',
        descriptionFr: 'Exploration hivernale reliant les trimestres 1 et 2, consolidation et nouveaux défis.',
        bigIdeas: 'Winter transforms our world. We can describe changes we observe.',
        bigIdeasFr: 'L\'hiver transforme notre monde. Nous pouvons décrire les changements observés.',
        essentialQuestions: JSON.stringify([
          'Comment l\'hiver change-t-il notre environnement?',
          'Quelles activités faisons-nous en hiver?',
          'Comment raconter nos aventures d\'hiver?'
        ]),
        startDate: new Date('2026-01-05'),
        endDate: new Date('2026-01-30'),
        estimatedHours: 18,
        assessmentPlan: 'Mid-year reading assessment, winter journal entries, oral storytelling rubric.',
        successCriteria: JSON.stringify([
          'Je peux décrire l\'hiver avec des détails',
          'Je peux lire des textes sur l\'hiver',
          'Je peux écrire dans mon journal d\'hiver'
        ]),

        learningSkills: JSON.stringify(['Self-regulation', 'Responsibility', 'Organization']),
        culminatingTask: 'Winter celebration with songs, poems, and sharing of winter journals.',
        keyVocabulary: JSON.stringify([
          'neige', 'glace', 'froid', 'bonhomme de neige', 'mitaines',
          'tuque', 'manteau', 'patiner', 'glisser', 'flocons'
        ]),
        priorKnowledge: 'All Term 1 vocabulary and skills, experience with PEI winters.',
        parentCommunicationPlan: 'Mid-year progress updates, winter reading challenge, outdoor learning notice.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Picture dictionaries, repeated readings, peer support',
          developing: 'Graphic organizers, choice in topics, scaffolded writing',
          extending: 'Learning projects, poetry writing, leading activities'
        }),
        indigenousPerspectives: 'Winter teachings and stories, traditional winter activities, respect for winter\'s power.',
        environmentalEducation: 'Winter wildlife needs, energy conservation, winter safety and preparation.',
        socialJusticeConnections: 'Access to winter clothing and activities, helping others in winter, warming centers.',
        technologyIntegration: 'Weather tracking apps, virtual field trips to winter locations, digital winter books.',
        communityConnections: 'Winter carnival participation, local hockey team visit, winter safety presentation.'
      }
    });
    
    // No new expectations for Unit 4 - it's a consolidation unit
    console.log('✅ Created Unit 4: L\'hiver magique (consolidation unit)');
    
    // UNIT 5: Nos amis les animaux (February)
    const unit5 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: francaisPlan.id,
        title: 'Our Animal Friends',
        titleFr: 'Nos amis les animaux',
        description: 'Exploring animal themes through critical listening and interpretive reading of both fiction and non-fiction.',
        descriptionFr: 'Explorer le thème des animaux par l\'écoute critique et la lecture interprétative.',
        bigIdeas: 'Animals have unique characteristics and needs. We can learn from observing and reading about animals.',
        bigIdeasFr: 'Les animaux ont des caractéristiques et besoins uniques. Nous apprenons en observant et lisant sur les animaux.',
        essentialQuestions: JSON.stringify([
          'Qu\'est-ce qui rend chaque animal spécial?',
          'Comment les animaux vivent-ils?',
          'Comment prendre soin des animaux?'
        ]),
        startDate: new Date('2026-02-02'),
        endDate: new Date('2026-02-27'),
        estimatedHours: 20,
        assessmentPlan: 'Animal research presentations, reading comprehension activities, critical thinking discussions.',
        successCriteria: JSON.stringify([
          'Je peux poser des questions sur les animaux',
          'Je peux comprendre les idées importantes d\'un texte',
          'Je peux partager mes découvertes sur un animal'
        ]),

        learningSkills: JSON.stringify(['Initiative', 'Independent work', 'Collaboration']),
        culminatingTask: 'Animal expert presentations - each student becomes an expert on one animal.',
        keyVocabulary: JSON.stringify([
          'animal', 'domestique', 'sauvage', 'habitat', 'nourriture',
          'mammifère', 'oiseau', 'poisson', 'voler', 'nager', 'courir'
        ]),
        priorKnowledge: 'Reading strategies from Term 1, research skills beginning to develop, animal knowledge from life experience.',
        parentCommunicationPlan: 'Animal research support at home, library visit encouragement, pet sharing opportunities.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Picture books, paired research, simple facts',
          developing: 'Guided research, fact sheets, group work',
          extending: 'Independent research, comparison studies, habitat dioramas'
        }),
        indigenousPerspectives: 'Animals as teachers and relations, traditional animal stories, respect for all living things.',
        environmentalEducation: 'Endangered animals, habitat protection, local wildlife, responsible pet ownership.',
        socialJusticeConnections: 'Animal rights and welfare, service animals, cultural views of animals.',
        technologyIntegration: 'Virtual zoo visits, animal webcams, research using safe websites, creating digital books.',
        communityConnections: 'Veterinarian visit, SPCA presentation, local farm visit if possible.'
      }
    });
    
    // Link expectations to Unit 5
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit5.id, expectationId: expectationMap.get('1CO.4')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit5.id, expectationId: expectationMap.get('1L.3')!.id }
    });
    
    console.log('✅ Created Unit 5: Nos amis les animaux');
    
    // UNIT 6: Ma communauté (March)
    const unit6 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: francaisPlan.id,
        title: 'My Community',
        titleFr: 'Ma communauté',
        description: 'Discovering community helpers and places, expressing ideas clearly, and developing analytical reading.',
        descriptionFr: 'Découvrir les aidants et lieux communautaires, exprimer clairement ses idées et développer la lecture analytique.',
        bigIdeas: 'Communities work together. Many people help make our community safe and happy.',
        bigIdeasFr: 'Les communautés travaillent ensemble. Plusieurs personnes aident notre communauté.',
        essentialQuestions: JSON.stringify([
          'Qui aide dans notre communauté?',
          'Quels endroits visitons-nous?',
          'Comment pouvons-nous aider notre communauté?'
        ]),
        startDate: new Date('2026-03-02'),
        endDate: new Date('2026-03-20'),
        estimatedHours: 15,
        assessmentPlan: 'Community helper interviews, map reading skills, analytical questioning rubric, speaking assessments.',
        successCriteria: JSON.stringify([
          'Je peux expliquer le travail des aidants communautaires',
          'Je peux poser des questions pour mieux comprendre',
          'Je peux présenter mes idées clairement'
        ]),

        learningSkills: JSON.stringify(['Responsibility', 'Organization', 'Collaboration']),
        culminatingTask: 'Community helper fair - students role-play different community helpers.',
        keyVocabulary: JSON.stringify([
          'communauté', 'pompier', 'policier', 'médecin', 'enseignant',
          'bibliothèque', 'hôpital', 'école', 'magasin', 'parc', 'aider'
        ]),
        priorKnowledge: 'Neighborhood awareness, some community helper knowledge, developing reading and speaking skills.',
        parentCommunicationPlan: 'Community walk permission, parent career sharing invitation, community service ideas.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Picture walks, role play, visual schedules',
          developing: 'Interview practice, map skills, guided presentations',
          extending: 'Community improvement ideas, letter writing, discovery projects'
        }),
        indigenousPerspectives: 'Traditional roles in Indigenous communities, Elders as knowledge keepers, community circles.',
        environmentalEducation: 'Green jobs in the community, waste management, community gardens, sustainable transportation.',
        socialJusticeConnections: 'Appreciation for all jobs, fair wages, accessibility in community spaces, helping neighbors.',
        technologyIntegration: 'Virtual field trips, video interviews with helpers, digital community maps, safety apps.',
        communityConnections: 'Walking field trips, community helper visits, fire station tour, library programs.'
      }
    });
    
    // Link expectations to Unit 6
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit6.id, expectationId: expectationMap.get('1CO.5')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit6.id, expectationId: expectationMap.get('1L.4')!.id }
    });
    
    console.log('✅ Created Unit 6: Ma communauté');
    
    // UNIT 7: Le printemps en fleurs (April-May)
    const unit7 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: francaisPlan.id,
        title: 'Spring in Bloom',
        titleFr: 'Le printemps en fleurs',
        description: 'Celebrating spring through self-reflection, varied writing genres, and metacognitive awareness.',
        descriptionFr: 'Célébrer le printemps par la réflexion, divers genres d\'écriture et la conscience métacognitive.',
        bigIdeas: 'Spring brings growth and change. We are growing as learners and writers.',
        bigIdeasFr: 'Le printemps apporte croissance et changement. Nous grandissons comme apprenants et scripteurs.',
        essentialQuestions: JSON.stringify([
          'Comment la nature change-t-elle au printemps?',
          'Comment ai-je grandi comme apprenant?',
          'Quelles histoires puis-je raconter?'
        ]),
        startDate: new Date('2026-03-23'),
        endDate: new Date('2026-05-15'),
        estimatedHours: 30,
        assessmentPlan: 'Self-assessment portfolios, writing conferences, reading growth documentation, reflection journals.',
        successCriteria: JSON.stringify([
          'Je peux réfléchir sur mon apprentissage',
          'Je peux écrire différents types de textes',
          'Je peux choisir des stratégies de lecture'
        ]),

        learningSkills: JSON.stringify(['Self-regulation', 'Initiative', 'Independent work']),
        culminatingTask: 'Spring showcase - author\'s celebration with multiple genres of writing displayed.',
        keyVocabulary: JSON.stringify([
          'printemps', 'fleur', 'pousser', 'jardin', 'pluie', 'soleil',
          'papillon', 'abeille', 'vert', 'grandir', 'changer', 'beau'
        ]),
        priorKnowledge: 'Full year of literacy development, metacognitive language from teacher modeling, writing process understanding.',
        parentCommunicationPlan: 'Growth celebration invitations, home garden connections, summer reading preparation.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Scribing support, choice in topics, celebrating small wins',
          developing: 'Writing conferences, peer editing, genre exploration',
          extending: 'Publishing opportunities, mentoring others, advanced genres'
        }),
        indigenousPerspectives: 'Spring ceremonies and renewal, traditional plant knowledge, gratitude for the Earth\'s gifts.',
        environmentalEducation: 'School garden project, pollinators importance, spring cleaning and recycling, Earth Day.',
        socialJusticeConnections: 'Growth mindset for all, celebrating diverse strengths, environmental justice, food security.',
        technologyIntegration: 'Digital portfolios, blog posts, time-lapse videos of growth, online publishing.',
        communityConnections: 'Local greenhouse visit, community garden participation, Earth Day activities, poetry café.'
      }
    });
    
    // Link expectations to Unit 7
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit7.id, expectationId: expectationMap.get('1CO.6')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit7.id, expectationId: expectationMap.get('1L.5')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit7.id, expectationId: expectationMap.get('1É.2')!.id }
    });
    
    console.log('✅ Created Unit 7: Le printemps en fleurs');
    
    // UNIT 8: Célébrons nos apprentissages (June)
    const unit8 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: francaisPlan.id,
        title: 'Celebrating Our Learning',
        titleFr: 'Célébrons nos apprentissages',
        description: 'Year-end celebration focusing on reflection, showcasing growth, and preparing for Grade 2.',
        descriptionFr: 'Célébration de fin d\'année axée sur la réflexion, la démonstration des progrès et la préparation pour la 2e année.',
        bigIdeas: 'We have grown as French speakers, readers, and writers. Our learning journey continues.',
        bigIdeasFr: 'Nous avons grandi comme francophones, lecteurs et scripteurs. Notre voyage d\'apprentissage continue.',
        essentialQuestions: JSON.stringify([
          'Qu\'est-ce que j\'ai appris cette année?',
          'De quoi suis-je fier/fière?',
          'Qu\'est-ce que je veux apprendre en 2e année?'
        ]),
        startDate: new Date('2026-05-19'),
        endDate: new Date('2026-06-25'),
        estimatedHours: 18,
        assessmentPlan: 'Final portfolio conferences, growth documentation, peer feedback, self-reflection presentations.',
        successCriteria: JSON.stringify([
          'Je peux montrer ce que j\'ai appris',
          'Je peux réfléchir sur mes progrès en écriture',
          'Je peux célébrer mes succès et ceux des autres'
        ]),

        learningSkills: JSON.stringify(['Self-regulation', 'Responsibility', 'Initiative', 'Organization', 'Collaboration', 'Independent work']),
        culminatingTask: 'Learning celebration event with portfolios, performances, and memory books for families.',
        keyVocabulary: JSON.stringify([
          'apprendre', 'grandir', 'fier/fière', 'souvenir', 'ami',
          'réussir', 'effort', 'progrès', 'célébrer', 'été', 'Grade 2'
        ]),
        priorKnowledge: 'Full year of French Immersion experience, complete literacy foundation, classroom community bonds.',
        parentCommunicationPlan: 'Celebration invitations, summer learning resources, Grade 2 preparation tips, portfolio sharing.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Visual timelines, celebration of effort, supported reflection',
          developing: 'Choice in presentation format, peer support, guided reflection',
          extending: 'Leadership roles, helping others reflect, planning next steps'
        }),
        indigenousPerspectives: 'Celebration ceremonies, honoring growth and learning, Seven Generations - looking forward.',
        environmentalEducation: 'Outdoor celebration, summer nature exploration ideas, continuing environmental stewardship.',
        socialJusticeConnections: 'Celebrating all types of growth, inclusive celebrations, summer learning equity.',
        technologyIntegration: 'Digital yearbooks, video messages to Grade 2, summer learning apps, virtual pen pals.',
        communityConnections: 'Grade 2 teacher visit, summer library programs promotion, community celebration participation.'
      }
    });
    
    // Link expectations to Unit 8
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit8.id, expectationId: expectationMap.get('1É.3')!.id }
    });
    
    console.log('✅ Created Unit 8: Célébrons nos apprentissages');
    
    // Verify all expectations are covered
    const unitCount = await prisma.unitPlan.count({
      where: { longRangePlanId: francaisPlan.id }
    });
    
    const linkedExpectations = await prisma.unitPlanExpectation.count({
      where: {
        unitPlan: {
          longRangePlanId: francaisPlan.id
        }
      }
    });
    
    console.log('\n📊 UNIT PLANS CREATED SUCCESSFULLY!');
    console.log(`✅ ${unitCount} unit plans created for Français langue première`);
    console.log(`✅ ${linkedExpectations} curriculum expectations linked to units`);
    console.log('✅ Complete coverage from September to June');
    console.log('✅ All 15 Français expectations distributed appropriately');
    console.log('✅ Rich metadata for differentiation and assessment');
    console.log('✅ Emily is ready to create detailed lesson plans!');
    
  } catch (error) {
    console.error('❌ Error creating unit plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedFrancaisUnitPlans()
  .then(() => console.log('🎉 Français unit plans seeding completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });