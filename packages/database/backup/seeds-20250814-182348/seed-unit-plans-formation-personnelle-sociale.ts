#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedFormationPersonnelleSocialeUnitPlans() {
  console.log('🌟 Creating Unit Plans for Formation personnelle et sociale - Grade 1...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found. Please run main seed first.');
    }
    
    // Get the Formation personnelle et sociale long range plan
    const fpsPlan = await prisma.longRangePlan.findFirst({
      where: {
        userId: emily.id,
        subject: 'Formation personnelle et sociale',
        academicYear: '2025-2026'
      }
    });
    
    if (!fpsPlan) {
      throw new Error('Formation personnelle et sociale long range plan not found. Please run long range plans seed first.');
    }
    
    console.log(`✅ Found Formation personnelle et sociale long range plan (ID: ${fpsPlan.id})`);
    
    // Get all Formation personnelle et sociale expectations
    const expectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Formation personnelle et sociale',
        grade: 1
      }
    });
    
    // Create a map for easy lookup
    const expectationMap = new Map(expectations.map(e => [e.code, e]));
    
    // Clear existing unit plans for this long range plan
    const existingUnits = await prisma.unitPlan.findMany({
      where: { longRangePlanId: fpsPlan.id },
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
        where: { longRangePlanId: fpsPlan.id }
      });
    }
    
    console.log('🗑️ Cleared existing unit plans');
    
    // UNIT 1: Me, Myself, and I (September)
    const unit1 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: fpsPlan.id,
        title: 'Me, Myself, and I',
        titleFr: 'Moi, moi-même et je',
        description: 'Discovering personal identity, strengths, feelings, and self-awareness. Building foundation for personal growth and self-care.',
        descriptionFr: 'Découvrir son identité personnelle, ses forces, ses sentiments et la conscience de soi. Bâtir les fondations pour la croissance personnelle.',
        bigIdeas: 'I am unique and special. Understanding myself helps me grow and learn.',
        bigIdeasFr: 'Je suis unique et spécial. Me comprendre m\'aide à grandir et apprendre.',
        essentialQuestions: JSON.stringify([
          'Qui suis-je?',
          'Qu\'est-ce qui me rend unique?',
          'Comment puis-je prendre soin de moi?'
        ]),
        startDate: new Date('2025-09-05'),
        endDate: new Date('2025-10-03'),
        estimatedHours: 12,
        assessmentPlan: 'Self-reflection journals, personal strength inventories, feeling identification activities, self-portrait assessments.',
        successCriteria: JSON.stringify([
          'Je peux identifier mes forces personnelles',
          'Je peux nommer et exprimer mes sentiments',
          'Je peux décrire ce qui me rend unique'
        ]),

        learningSkills: JSON.stringify(['Self-regulation', 'Initiative', 'Organization']),
        culminatingTask: 'Create an "All About Me" portfolio showcasing personal identity, strengths, and growth.',
        keyVocabulary: JSON.stringify([
          'identité', 'unique', 'force', 'sentiment', 'émotions', 'confiance',
          'fierté', 'capable', 'spécial', 'grandir', 'apprendre', 'moi-même'
        ]),
        priorKnowledge: 'Basic self-awareness from kindergarten, understanding of feelings, some personal preferences.',
        parentCommunicationPlan: 'Family identity activities, strength identification at home, emotional support strategies, self-care routines.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Visual feeling cards, supported self-reflection, concrete examples',
          developing: 'Independent journaling, peer sharing, goal setting',
          extending: 'Complex emotion exploration, mentoring others, leadership opportunities'
        }),
        indigenousPerspectives: 'Understanding self in relation to community, traditional teachings about personal gifts, connection to ancestors.',
        environmentalEducation: 'Personal connection to nature, outdoor self-reflection, environmental responsibility as self-care.',
        socialJusticeConnections: 'Celebrating all identities, respecting differences, equity in self-expression, inclusive communities.',
        technologyIntegration: 'Digital portfolios, emotion apps, self-reflection videos, growth tracking tools.',
        communityConnections: 'Role model visits, community helper identity connections, cultural identity celebrations.'
      }
    });
    
    // Link expectations to Unit 1
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit1.id, expectationId: expectationMap.get('FPS4')!.id }
    });
    
    console.log('✅ Created Unit 1: Moi, moi-même et je');
    
    // UNIT 2: Healthy Me (October-November)
    const unit2 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: fpsPlan.id,
        title: 'Healthy Me',
        titleFr: 'Moi en santé',
        description: 'Learning about personal health practices including hygiene, nutrition, sleep, and physical activity for overall wellness.',
        descriptionFr: 'Apprendre les pratiques de santé personnelle incluant l\'hygiène, la nutrition, le sommeil et l\'activité physique.',
        bigIdeas: 'Healthy habits help us feel good and grow strong. We can make choices that keep us healthy.',
        bigIdeasFr: 'Les habitudes saines nous aident à nous sentir bien et devenir forts. Nous pouvons faire des choix santé.',
        essentialQuestions: JSON.stringify([
          'Comment puis-je garder mon corps en santé?',
          'Quelles habitudes m\'aident à me sentir bien?',
          'Pourquoi la santé est-elle importante?'
        ]),
        startDate: new Date('2025-10-06'),
        endDate: new Date('2025-11-14'),
        estimatedHours: 15,
        assessmentPlan: 'Healthy habits tracking charts, hygiene routine demonstrations, nutrition choice activities, wellness goal setting.',
        successCriteria: JSON.stringify([
          'Je peux pratiquer une bonne hygiène personnelle',
          'Je peux faire des choix alimentaires sains',
          'Je peux expliquer l\'importance du sommeil et de l\'exercice'
        ]),

        learningSkills: JSON.stringify(['Self-regulation', 'Responsibility', 'Organization']),
        culminatingTask: 'Design a "Healthy Day" plan showing good health practices from morning to night.',
        keyVocabulary: JSON.stringify([
          'santé', 'hygiène', 'nutrition', 'sommeil', 'exercice', 'propre',
          'germes', 'énergie', 'fort', 'grandir', 'choix', 'habitude'
        ]),
        priorKnowledge: 'Basic hygiene awareness, some nutrition concepts, understanding of exercise from PE.',
        parentCommunicationPlan: 'Healthy habits at home, family wellness activities, bedtime routines, healthy snack ideas.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Visual routine cards, hands-on practice, simple choices',
          developing: 'Habit tracking, peer modeling, goal setting',
          extending: 'Research projects, teaching others, family wellness plans'
        }),
        indigenousPerspectives: 'Traditional medicines and healing, holistic health concepts, connection between land and health.',
        environmentalEducation: 'Clean environment for health, outdoor activities for wellness, sustainable health practices.',
        socialJusticeConnections: 'Access to healthcare, healthy food equity, cultural health practices, wellness for all.',
        technologyIntegration: 'Health tracking apps, hygiene videos, nutrition games, digital wellness journals.',
        communityConnections: 'Public health nurse visit, dentist presentation, nutritionist workshop, local farm visit.'
      }
    });
    
    // Link expectations to Unit 2
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit2.id, expectationId: expectationMap.get('FPS1')!.id }
    });
    
    console.log('✅ Created Unit 2: Moi en santé');
    
    // UNIT 3: Safe and Sound (November-January)
    const unit3 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: fpsPlan.id,
        title: 'Safe and Sound',
        titleFr: 'Sain et sauf',
        description: 'Understanding safety practices at home, school, and in the community. Learning about personal safety and responsibility.',
        descriptionFr: 'Comprendre les pratiques de sécurité à la maison, à l\'école et dans la communauté. Apprendre la sécurité personnelle.',
        bigIdeas: 'Safety rules help protect us. We can make safe choices and help others stay safe too.',
        bigIdeasFr: 'Les règles de sécurité nous protègent. Nous pouvons faire des choix sécuritaires et aider les autres.',
        essentialQuestions: JSON.stringify([
          'Comment puis-je rester en sécurité?',
          'Quelles sont les règles de sécurité importantes?',
          'Comment puis-je aider les autres à être en sécurité?'
        ]),
        startDate: new Date('2025-11-17'),
        endDate: new Date('2026-01-23'),
        estimatedHours: 18,
        assessmentPlan: 'Safety rule demonstrations, emergency procedure practice, safe choice scenarios, responsibility reflections.',
        successCriteria: JSON.stringify([
          'Je peux suivre les règles de sécurité importantes',
          'Je peux identifier les situations dangereuses',
          'Je peux demander de l\'aide quand j\'en ai besoin'
        ]),

        learningSkills: JSON.stringify(['Responsibility', 'Self-regulation', 'Organization']),
        culminatingTask: 'Create a safety guide for home and school with important rules and procedures.',
        keyVocabulary: JSON.stringify([
          'sécurité', 'danger', 'règles', 'urgence', 'aide', 'prudent',
          'attention', 'arrêter', 'regarder', 'écouter', 'protéger', 'responsable'
        ]),
        priorKnowledge: 'Basic safety rules from home, understanding of danger, some emergency awareness.',
        parentCommunicationPlan: 'Home safety audit, emergency contact review, online safety discussions, community safety walks.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Visual safety signs, role play practice, buddy system',
          developing: 'Safety scenarios, problem-solving, peer teaching',
          extending: 'Safety leadership roles, creating safety materials, mentoring'
        }),
        indigenousPerspectives: 'Traditional safety teachings, community protection practices, Elder wisdom about safety.',
        environmentalEducation: 'Weather safety, outdoor safety skills, environmental hazards, nature awareness.',
        socialJusticeConnections: 'Safety for all, accessible safety practices, community responsibility, protective factors.',
        technologyIntegration: 'Safety videos, emergency call practice apps, digital safety rules, online safety basics.',
        communityConnections: 'Police officer visit, firefighter presentation, crossing guard interaction, safety patrol program.'
      }
    });
    
    // Link expectations to Unit 3
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit3.id, expectationId: expectationMap.get('FPS2')!.id }
    });
    
    console.log('✅ Created Unit 3: Sain et sauf');
    
    // UNIT 4: Friends and Feelings (February-March)
    const unit4 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: fpsPlan.id,
        title: 'Friends and Feelings',
        titleFr: 'Amis et sentiments',
        description: 'Developing healthy relationships, understanding emotions, practicing empathy, and resolving conflicts peacefully.',
        descriptionFr: 'Développer des relations saines, comprendre les émotions, pratiquer l\'empathie et résoudre les conflits pacifiquement.',
        bigIdeas: 'Healthy friendships make us happy. We can understand and manage our feelings and help others with theirs.',
        bigIdeasFr: 'Les amitiés saines nous rendent heureux. Nous pouvons comprendre nos sentiments et aider les autres.',
        essentialQuestions: JSON.stringify([
          'Comment être un bon ami?',
          'Comment gérer mes sentiments?',
          'Comment résoudre les conflits pacifiquement?'
        ]),
        startDate: new Date('2026-01-26'),
        endDate: new Date('2026-03-13'),
        estimatedHours: 16,
        assessmentPlan: 'Friendship skills observations, emotion regulation strategies, conflict resolution role plays, empathy activities.',
        successCriteria: JSON.stringify([
          'Je peux être un bon ami',
          'Je peux identifier et gérer mes émotions',
          'Je peux résoudre les conflits avec des mots'
        ]),

        learningSkills: JSON.stringify(['Self-regulation', 'Collaboration', 'Responsibility', 'Initiative']),
        culminatingTask: 'Friendship fair showcasing healthy relationship skills and emotion management strategies.',
        keyVocabulary: JSON.stringify([
          'ami', 'amitié', 'sentiment', 'empathie', 'partager', 'écouter',
          'respect', 'gentil', 'conflit', 'solution', 'calme', 'ensemble'
        ]),
        priorKnowledge: 'Basic social skills, emotion vocabulary, some friendship experiences, conflict situations.',
        parentCommunicationPlan: 'Emotion coaching at home, friendship support strategies, conflict resolution practice, empathy building.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Social scripts, visual emotion cards, supported interactions',
          developing: 'Peer problem-solving, emotion journals, friendship goals',
          extending: 'Peer mediation, emotion mentoring, complex social situations'
        }),
        indigenousPerspectives: 'Circle teachings about relationships, traditional conflict resolution, community harmony practices.',
        environmentalEducation: 'Caring for environment as caring for others, outdoor cooperation activities, nature calming strategies.',
        socialJusticeConnections: 'Inclusion in friendships, standing up for others, equity in relationships, anti-bullying.',
        technologyIntegration: 'Social story apps, emotion regulation videos, friendship games, digital kindness.',
        communityConnections: 'Guidance counselor workshops, peer mentor program, community friendship activities.'
      }
    });
    
    // Link expectations to Unit 4
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit4.id, expectationId: expectationMap.get('FPS3')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit4.id, expectationId: expectationMap.get('FPS4')!.id }
    });
    
    console.log('✅ Created Unit 4: Amis et sentiments');
    
    // UNIT 5: Growing and Learning (April-May)
    const unit5 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: fpsPlan.id,
        title: 'Growing and Learning',
        titleFr: 'Grandir et apprendre',
        description: 'Recognizing personal growth, developing learning skills, setting goals, and building confidence for future challenges.',
        descriptionFr: 'Reconnaître sa croissance personnelle, développer des compétences d\'apprentissage, fixer des objectifs et bâtir la confiance.',
        bigIdeas: 'We grow and learn every day. Setting goals helps us improve and celebrating growth builds confidence.',
        bigIdeasFr: 'Nous grandissons et apprenons chaque jour. Fixer des objectifs nous aide à nous améliorer.',
        essentialQuestions: JSON.stringify([
          'Comment ai-je grandi cette année?',
          'Quelles sont mes forces d\'apprentissage?',
          'Quels sont mes objectifs pour le futur?'
        ]),
        startDate: new Date('2026-03-16'),
        endDate: new Date('2026-05-01'),
        estimatedHours: 14,
        assessmentPlan: 'Growth portfolios, learning style assessments, goal setting conferences, confidence building activities.',
        successCriteria: JSON.stringify([
          'Je peux identifier comment j\'ai grandi',
          'Je peux reconnaître mes forces d\'apprentissage',
          'Je peux fixer et travailler vers des objectifs'
        ]),

        learningSkills: JSON.stringify(['Initiative', 'Self-regulation', 'Organization', 'Independent work']),
        culminatingTask: 'Personal growth celebration showcasing learning journey and future goals.',
        keyVocabulary: JSON.stringify([
          'grandir', 'apprendre', 'objectif', 'améliorer', 'progrès', 'effort',
          'confiance', 'capable', 'essayer', 'réussir', 'persévérer', 'fierté'
        ]),
        priorKnowledge: 'Year of learning experiences, understanding of personal change, goal awareness.',
        parentCommunicationPlan: 'Growth celebration preparation, goal setting support, confidence building at home, summer learning plans.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Concrete growth examples, visual progress tracking, supported goals',
          developing: 'Self-assessment tools, peer feedback, challenging goals',
          extending: 'Complex goal setting, mentoring others, leadership in learning'
        }),
        indigenousPerspectives: 'Seven generations thinking, learning from Elders, traditional growth ceremonies, gifts and responsibilities.',
        environmentalEducation: 'Growth in nature, seasonal cycles of learning, environmental stewardship as growth.',
        socialJusticeConnections: 'Equity in learning opportunities, celebrating diverse strengths, growth mindset for all.',
        technologyIntegration: 'Digital growth portfolios, learning apps, goal tracking tools, reflection videos.',
        communityConnections: 'Successful learner visits, transition to Grade 2 activities, community celebration of growth.'
      }
    });
    
    // Link expectations to Unit 5
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit5.id, expectationId: expectationMap.get('FPS4')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit5.id, expectationId: expectationMap.get('FPS1')!.id }
    });
    
    console.log('✅ Created Unit 5: Grandir et apprendre');
    
    // UNIT 6: Our Wonderful World (May-June)
    const unit6 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: fpsPlan.id,
        title: 'Our Wonderful World',
        titleFr: 'Notre monde merveilleux',
        description: 'Celebrating our classroom community, reflecting on relationships, and preparing for summer with health and safety awareness.',
        descriptionFr: 'Célébrer notre communauté de classe, réfléchir sur les relations et se préparer pour l\'été avec conscience de santé et sécurité.',
        bigIdeas: 'We are part of a caring community. Everything we learned helps us be healthy, safe, and kind.',
        bigIdeasFr: 'Nous faisons partie d\'une communauté bienveillante. Tout ce qu\'on a appris nous aide à être en santé, en sécurité et gentils.',
        essentialQuestions: JSON.stringify([
          'Comment notre classe est-elle une communauté?',
          'Comment utiliser ce que j\'ai appris?',
          'Comment rester en santé et sécurité cet été?'
        ]),
        startDate: new Date('2026-05-04'),
        endDate: new Date('2026-06-24'),
        estimatedHours: 16,
        assessmentPlan: 'Community contribution reflections, summer safety plans, health habit maintenance, relationship celebrations.',
        successCriteria: JSON.stringify([
          'Je peux contribuer à notre communauté',
          'Je peux appliquer mes apprentissages',
          'Je peux planifier un été sain et sécuritaire'
        ]),

        learningSkills: JSON.stringify(['Collaboration', 'Responsibility', 'Initiative', 'Organization', 'Self-regulation']),
        culminatingTask: 'Community celebration and summer wellness fair showcasing all learning.',
        keyVocabulary: JSON.stringify([
          'communauté', 'ensemble', 'célébrer', 'été', 'continuer', 'appliquer',
          'souvenir', 'gratitude', 'au revoir', 'bonnes vacances', 'sécurité', 'santé'
        ]),
        priorKnowledge: 'Full year of FPS learning, community experiences, health and safety knowledge.',
        parentCommunicationPlan: 'Year-end celebration invitations, summer safety resources, health maintenance tips, community connections.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Supported reflection, concrete summer plans, celebration participation',
          developing: 'Independent planning, peer appreciation, goal setting for summer',
          extending: 'Leadership in celebrations, complex integration, mentoring for next year'
        }),
        indigenousPerspectives: 'Community celebration traditions, gratitude practices, summer teachings, continuing the learning journey.',
        environmentalEducation: 'Summer outdoor safety, environmental health, nature appreciation, sustainable summer practices.',
        socialJusticeConnections: 'Inclusive celebrations, summer access equity, community support networks, helping others.',
        technologyIntegration: 'Digital yearbooks, summer safety apps, health tracking tools, virtual connections.',
        communityConnections: 'Community summer programs, library summer reading, recreation opportunities, health services.'
      }
    });
    
    // Link all expectations for review
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit6.id, expectationId: expectationMap.get('FPS1')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit6.id, expectationId: expectationMap.get('FPS2')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit6.id, expectationId: expectationMap.get('FPS3')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit6.id, expectationId: expectationMap.get('FPS4')!.id }
    });
    
    console.log('✅ Created Unit 6: Notre monde merveilleux');
    
    // Verify all expectations are covered
    const unitCount = await prisma.unitPlan.count({
      where: { longRangePlanId: fpsPlan.id }
    });
    
    const linkedExpectations = await prisma.unitPlanExpectation.count({
      where: {
        unitPlan: {
          longRangePlanId: fpsPlan.id
        }
      }
    });
    
    console.log('\n📊 UNIT PLANS CREATED SUCCESSFULLY!');
    console.log(`✅ ${unitCount} unit plans created for Formation personnelle et sociale`);
    console.log(`✅ ${linkedExpectations} curriculum expectation linkages`);
    console.log('✅ Complete coverage from September to June');
    console.log('✅ All 4 FPS expectations covered comprehensively');
    console.log('✅ Focus on personal growth, health, safety, and relationships');
    console.log('✅ Developmentally appropriate for Grade 1');
    console.log('✅ Strong French immersion support');
    console.log('✅ Emily is ready to support whole child development!');
    
  } catch (error) {
    console.error('❌ Error creating unit plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedFormationPersonnelleSocialeUnitPlans()
  .then(() => console.log('🎉 Formation personnelle et sociale unit plans seeding completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });