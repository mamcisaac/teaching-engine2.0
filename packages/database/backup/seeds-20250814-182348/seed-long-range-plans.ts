#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedLongRangePlans() {
  console.log('🎯 Creating Long Range Plans for Emily\'s Grade 1 French Immersion Class...');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found. Please run main seed first.');
    }
    
    console.log(`✅ Found Emily\'s account (ID: ${emily.id})`);
    
    // Clear existing long range plans for Emily
    // Need to delete all related records first due to foreign key constraints
    const existingPlans = await prisma.longRangePlan.findMany({
      where: { userId: emily.id },
      select: { id: true }
    });
    
    if (existingPlans.length > 0) {
      const planIds = existingPlans.map(p => p.id);
      
      // Delete all related records in proper order
      // First delete lesson plans that reference unit plans
      await prisma.eTFOLessonPlan.deleteMany({
        where: {
          unitPlan: {
            longRangePlanId: { in: planIds }
          }
        }
      });
      
      // Delete unit plan resources
      await prisma.unitPlanResource.deleteMany({
        where: {
          unitPlan: {
            longRangePlanId: { in: planIds }
          }
        }
      });
      
      // Delete unit plan expectations
      await prisma.unitPlanExpectation.deleteMany({
        where: {
          unitPlan: {
            longRangePlanId: { in: planIds }
          }
        }
      });
      
      // Delete unit plans
      await prisma.unitPlan.deleteMany({
        where: {
          longRangePlanId: { in: planIds }
        }
      });
      
      // Delete long range plan expectations
      await prisma.longRangePlanExpectation.deleteMany({
        where: {
          longRangePlanId: { in: planIds }
        }
      });
      
      // Finally delete the long range plans
      await prisma.longRangePlan.deleteMany({
        where: { userId: emily.id }
      });
    }
    
    console.log('🗑️ Cleared existing long range plans');
    
    // Get all Grade 1 expectations grouped by subject
    const expectations = await prisma.curriculumExpectation.findMany({
      where: { grade: 1 }
    });
    
    const expectationsBySubject = expectations.reduce((acc, exp) => {
      if (!acc[exp.subject]) {
        acc[exp.subject] = [];
      }
      acc[exp.subject].push(exp);
      return acc;
    }, {} as Record<string, typeof expectations>);
    
    console.log('📚 Found curriculum expectations for all subjects');
    
    // 1. FRANÇAIS LANGUE PREMIÈRE - 15 expectations
    const francaisExpectations = expectationsBySubject['Français langue première'] || [];
    const francaisPlan = await prisma.longRangePlan.create({
      data: {
        userId: emily.id,
        title: 'Français langue première - Grade 1 French Immersion',
        titleFr: 'Français langue première - 1re année immersion',
        academicYear: '2025-2026',
        term: 'Full Year',
        grade: 1,
        subject: 'Français langue première',
        description: 'A comprehensive French language arts program focusing on oral communication, reading, and writing development in an immersion context.',
        descriptionFr: 'Un programme complet d\'arts langagiers axé sur la communication orale, la lecture et l\'écriture en contexte d\'immersion.',
        goals: 'Students will develop foundational French literacy skills through phonological awareness, sight word recognition, guided reading, and emergent writing.',
        goalsFr: 'Les élèves développeront des compétences de base en littératie française par la conscience phonologique, la reconnaissance de mots fréquents, la lecture guidée et l\'écriture émergente.',
        themes: JSON.stringify([
          'Ma famille et moi',
          'Mon école',
          'Les saisons et les fêtes',
          'Les animaux',
          'Ma communauté'
        ]),
        overarchingQuestions: 'Comment puis-je communiquer mes idées en français? Comment les livres nous aident-ils à apprendre?',
        assessmentOverview: 'Ongoing observation, portfolio assessment, running records, and developmental writing samples.',
        resourceNeeds: 'Leveled French readers, alphabet resources, writing journals, phonics materials, French picture books',
        professionalGoals: 'Strengthen differentiated literacy instruction and incorporate more authentic French literature.'
      }
    });
    
    // Distribute French expectations across terms
    const frenchTerm1 = ['1CO.0', '1CO.1', '1CO.2', '1CO.3', '1L.1', '1L.2', '1É.1']; // Focus on oral and early reading
    const frenchTerm2 = ['1CO.4', '1CO.5', '1CO.6', '1L.3', '1L.4', '1L.5', '1É.2', '1É.3']; // Advanced skills
    
    for (const exp of francaisExpectations) {
      await prisma.longRangePlanExpectation.create({
        data: {
          longRangePlanId: francaisPlan.id,
          expectationId: exp.id,
          plannedTerm: frenchTerm1.includes(exp.code) ? 'Term 1' : 'Term 2'
        }
      });
    }
    
    console.log('✅ Created Français langue première long range plan');
    
    // 2. MATHÉMATIQUES - 14 expectations
    const mathExpectations = expectationsBySubject['Mathématiques'] || [];
    const mathPlan = await prisma.longRangePlan.create({
      data: {
        userId: emily.id,
        title: 'Mathematics - Grade 1 French Immersion',
        titleFr: 'Mathématiques - 1re année immersion',
        academicYear: '2025-2026',
        term: 'Full Year',
        grade: 1,
        subject: 'Mathématiques',
        description: 'A hands-on mathematics program building number sense, pattern recognition, and spatial reasoning through concrete and visual learning experiences.',
        descriptionFr: 'Un programme de mathématiques pratique développant le sens du nombre, la reconnaissance de régularités et le raisonnement spatial.',
        goals: 'Students will develop number sense to 20, understand basic operations, recognize patterns, and explore 2D/3D shapes.',
        goalsFr: 'Les élèves développeront le sens du nombre jusqu\'à 20, comprendront les opérations de base, reconnaîtront des régularités et exploreront les formes.',
        themes: JSON.stringify([
          'Les collections de la classe',
          'Les régularités autour de nous',
          'Les nombres dans notre vie',
          'La géométrie dans notre monde'
        ]),
        overarchingQuestions: 'Comment les mathématiques nous aident-elles à comprendre notre monde? Où voyons-nous des nombres et des formes?',
        assessmentOverview: 'Observation during math centers, problem-solving tasks, math journals, and hands-on demonstrations.',
        resourceNeeds: 'Manipulatives (counters, base-10 blocks), number lines, pattern blocks, 2D/3D shapes, math games',
        professionalGoals: 'Implement more open-ended problem solving and strengthen math talk routines.'
      }
    });
    
    // Distribute Math expectations across terms
    const mathTerm1 = ['1.N1', '1.N2', '1.N3', '1.N4', '1.N5', '1.RR1']; // Number sense and early patterns
    const mathTerm2 = ['1.N6', '1.N7', '1.N8', '1.N9', '1.RR2', '1.RR3', '1.FE1', '1.FE2']; // Operations and geometry
    
    for (const exp of mathExpectations) {
      await prisma.longRangePlanExpectation.create({
        data: {
          longRangePlanId: mathPlan.id,
          expectationId: exp.id,
          plannedTerm: mathTerm1.includes(exp.code) ? 'Term 1' : 'Term 2'
        }
      });
    }
    
    console.log('✅ Created Mathématiques long range plan');
    
    // 3. SCIENCES DE LA NATURE - 5 expectations
    const scienceExpectations = expectationsBySubject['Sciences de la nature'] || [];
    const sciencePlan = await prisma.longRangePlan.create({
      data: {
        userId: emily.id,
        title: 'Natural Sciences - Grade 1 French Immersion',
        titleFr: 'Sciences de la nature - 1re année immersion',
        academicYear: '2025-2026',
        term: 'Full Year',
        grade: 1,
        subject: 'Sciences de la nature',
        description: 'An inquiry-based science program exploring living things, energy, and seasonal changes through hands-on investigations.',
        descriptionFr: 'Un programme de sciences basé sur l\'enquête explorant les êtres vivants, l\'énergie et les changements saisonniers.',
        goals: 'Students will observe and classify living things, explore energy uses, and understand seasonal patterns and their effects.',
        goalsFr: 'Les élèves observeront et classifieront les êtres vivants, exploreront les utilisations de l\'énergie et comprendront les cycles saisonniers.',
        themes: JSON.stringify([
          'Les êtres vivants',
          'Notre environnement',
          'L\'énergie autour de nous',
          'Les saisons et leurs changements'
        ]),
        overarchingQuestions: 'Qu\'est-ce qui est vivant? Comment les saisons affectent-elles notre vie? Comment utilisons-nous l\'énergie?',
        assessmentOverview: 'Science journals, observational drawings, simple experiments, and oral explanations of findings.',
        resourceNeeds: 'Magnifying glasses, plant seeds, seasonal materials, simple energy demonstrations, science journals',
        professionalGoals: 'Increase outdoor learning opportunities and integrate Indigenous perspectives on nature.'
      }
    });
    
    // Distribute Science expectations across terms
    const scienceTerm1 = ['1.1.1', '1.1.2']; // Living things focus
    const scienceTerm2 = ['1.2.1', '1.3.1', '1.3.2']; // Energy and seasons
    
    for (const exp of scienceExpectations) {
      await prisma.longRangePlanExpectation.create({
        data: {
          longRangePlanId: sciencePlan.id,
          expectationId: exp.id,
          plannedTerm: scienceTerm1.includes(exp.code) ? 'Term 1' : 'Term 2'
        }
      });
    }
    
    console.log('✅ Created Sciences de la nature long range plan');
    
    // 4. SCIENCES HUMAINES - 7 expectations
    const socialExpectations = expectationsBySubject['Sciences humaines'] || [];
    const socialPlan = await prisma.longRangePlan.create({
      data: {
        userId: emily.id,
        title: 'Social Studies - Grade 1 French Immersion',
        titleFr: 'Sciences humaines - 1re année immersion',
        academicYear: '2025-2026',
        term: 'Full Year',
        grade: 1,
        subject: 'Sciences humaines',
        description: 'A community-centered program exploring identity, citizenship, geography, and relationships in family, school, and community contexts.',
        descriptionFr: 'Un programme centré sur la communauté explorant l\'identité, la citoyenneté, la géographie et les relations.',
        goals: 'Students will understand their roles and responsibilities, appreciate diversity, develop mapping skills, and explore needs vs wants.',
        goalsFr: 'Les élèves comprendront leurs rôles et responsabilités, apprécieront la diversité, développeront des compétences cartographiques.',
        themes: JSON.stringify([
          'Moi et ma famille',
          'Notre école',
          'Ma communauté',
          'Les cartes et les lieux',
          'Besoins et désirs'
        ]),
        overarchingQuestions: 'Qui suis-je? Comment vivons-nous ensemble? Qu\'est-ce qui rend notre communauté spéciale?',
        assessmentOverview: 'Community projects, family presentations, map creation, role-playing activities, and class discussions.',
        resourceNeeds: 'Maps, globes, community photos, diversity books, digital citizenship resources',
        professionalGoals: 'Strengthen connections with local community and integrate more PEI-specific content.'
      }
    });
    
    // Distribute Social Studies expectations across terms
    const socialTerm1 = ['1C.1', '1ICC.1', '1PA.1', '1ER.1']; // Identity and community
    const socialTerm2 = ['1LT.1', '1LT.2', '1C.2']; // Geography and digital citizenship
    
    for (const exp of socialExpectations) {
      await prisma.longRangePlanExpectation.create({
        data: {
          longRangePlanId: socialPlan.id,
          expectationId: exp.id,
          plannedTerm: socialTerm1.includes(exp.code) ? 'Term 1' : 'Term 2'
        }
      });
    }
    
    console.log('✅ Created Sciences humaines long range plan');
    
    // 5. ARTS VISUELS - 4 expectations
    const artsExpectations = expectationsBySubject['Arts visuels'] || [];
    const artsPlan = await prisma.longRangePlan.create({
      data: {
        userId: emily.id,
        title: 'Visual Arts - Grade 1 French Immersion',
        titleFr: 'Arts visuels - 1re année immersion',
        academicYear: '2025-2026',
        term: 'Full Year',
        grade: 1,
        subject: 'Arts visuels',
        description: 'A creative arts program developing artistic expression, technique exploration, and cultural appreciation through hands-on art making.',
        descriptionFr: 'Un programme d\'arts créatifs développant l\'expression artistique, l\'exploration de techniques et l\'appréciation culturelle.',
        goals: 'Students will explore various art materials and techniques, express ideas through art, and appreciate art in their culture.',
        goalsFr: 'Les élèves exploreront divers matériaux et techniques, exprimeront des idées par l\'art et apprécieront l\'art dans leur culture.',
        themes: JSON.stringify([
          'Les couleurs et les formes',
          'L\'art dans la nature',
          'Exprimer mes sentiments',
          'L\'art de ma communauté'
        ]),
        overarchingQuestions: 'Comment l\'art nous aide-t-il à communiquer? Où voyons-nous l\'art dans notre vie?',
        assessmentOverview: 'Portfolio development, artist statements, peer feedback, and process observations.',
        resourceNeeds: 'Various art supplies (paint, crayons, pastels), clay, collage materials, art prints, cultural art examples',
        professionalGoals: 'Integrate more cross-curricular art projects and explore local PEI artists.'
      }
    });
    
    // Visual Arts expectations integrated throughout the year
    for (const exp of artsExpectations) {
      await prisma.longRangePlanExpectation.create({
        data: {
          longRangePlanId: artsPlan.id,
          expectationId: exp.id,
          plannedTerm: 'Full Year' // Art is integrated throughout
        }
      });
    }
    
    console.log('✅ Created Arts visuels long range plan');
    
    // 6. FORMATION PERSONNELLE ET SOCIALE - 4 expectations
    const healthExpectations = expectationsBySubject['Formation personnelle et sociale'] || [];
    const healthPlan = await prisma.longRangePlan.create({
      data: {
        userId: emily.id,
        title: 'Personal and Social Development - Grade 1 French Immersion',
        titleFr: 'Formation personnelle et sociale - 1re année immersion',
        academicYear: '2025-2026',
        term: 'Full Year',
        grade: 1,
        subject: 'Formation personnelle et sociale',
        description: 'A comprehensive wellness program focusing on personal health, safety, relationships, and self-awareness.',
        descriptionFr: 'Un programme de bien-être complet axé sur la santé personnelle, la sécurité, les relations et la conscience de soi.',
        goals: 'Students will develop healthy habits, understand safety practices, build positive relationships, and recognize their strengths.',
        goalsFr: 'Les élèves développeront des habitudes saines, comprendront les pratiques sécuritaires et construiront des relations positives.',
        themes: JSON.stringify([
          'Mon corps en santé',
          'La sécurité à l\'école et à la maison',
          'Les amis et les sentiments',
          'Mes forces et mes talents'
        ]),
        overarchingQuestions: 'Comment puis-je prendre soin de moi? Comment être un bon ami? Qu\'est-ce qui me rend unique?',
        assessmentOverview: 'Self-reflections, safety demonstrations, social scenarios, and health habit tracking.',
        resourceNeeds: 'Health and safety posters, emotion cards, friendship books, mindfulness resources',
        professionalGoals: 'Implement more social-emotional learning strategies and mindfulness practices.'
      }
    });
    
    // Health expectations revisited throughout the year
    for (const exp of healthExpectations) {
      await prisma.longRangePlanExpectation.create({
        data: {
          longRangePlanId: healthPlan.id,
          expectationId: exp.id,
          plannedTerm: 'Full Year' // Health topics spiral throughout
        }
      });
    }
    
    console.log('✅ Created Formation personnelle et sociale long range plan');
    
    // 7. ÉDUCATION PHYSIQUE - 16 expectations
    const peExpectations = expectationsBySubject['Éducation physique'] || [];
    const pePlan = await prisma.longRangePlan.create({
      data: {
        userId: emily.id,
        title: 'Physical Education - Grade 1 French Immersion',
        titleFr: 'Éducation physique - 1re année immersion',
        academicYear: '2025-2026',
        term: 'Full Year',
        grade: 1,
        subject: 'Éducation physique',
        description: 'A developmental PE program building fundamental movement skills, cooperation, and healthy active living habits.',
        descriptionFr: 'Un programme d\'éducation physique développant les habiletés motrices fondamentales, la coopération et les habitudes de vie active.',
        goals: 'Students will master basic locomotor and manipulative skills, work cooperatively, and understand the importance of physical activity.',
        goalsFr: 'Les élèves maîtriseront les habiletés locomotrices et de manipulation de base, travailleront en coopération.',
        themes: JSON.stringify([
          'Mouvements fondamentaux',
          'Jeux coopératifs',
          'Manipulation d\'objets',
          'Vie active et santé'
        ]),
        overarchingQuestions: 'Comment mon corps bouge-t-il? Comment jouer ensemble? Pourquoi l\'activité physique est-elle importante?',
        assessmentOverview: 'Movement skill checklists, peer cooperation rubrics, self-assessments, and participation observations.',
        resourceNeeds: 'Various PE equipment (balls, hoops, ropes), gymnasium space, outdoor play area, music for movement',
        professionalGoals: 'Increase inclusive practices and integrate more Indigenous games and activities.'
      }
    });
    
    // PE expectations distributed by skill progression
    const peTerm1 = ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9']; // Fundamental movements
    const peTerm2 = ['2.1', '2.2', '2.3', '2.4', '2.6', '3.1', '3.2']; // Social and personal
    
    for (const exp of peExpectations) {
      await prisma.longRangePlanExpectation.create({
        data: {
          longRangePlanId: pePlan.id,
          expectationId: exp.id,
          plannedTerm: peTerm1.includes(exp.code) ? 'Term 1' : 'Term 2'
        }
      });
    }
    
    console.log('✅ Created Éducation physique long range plan');
    
    // 8. MUSIC (English) - 8 expectations
    const musicExpectations = expectationsBySubject['Music'] || [];
    const musicPlan = await prisma.longRangePlan.create({
      data: {
        userId: emily.id,
        title: 'Music - Grade 1',
        titleFr: 'Musique - 1re année',
        academicYear: '2025-2026',
        term: 'Full Year',
        grade: 1,
        subject: 'Music',
        description: 'An exploratory music program developing musical literacy, performance skills, and cultural appreciation through active music-making.',
        descriptionFr: 'Un programme de musique exploratoire développant la littératie musicale, les compétences de performance et l\'appréciation culturelle.',
        goals: 'Students will create music, develop performance skills, understand musical elements, and appreciate diverse musical styles.',
        goalsFr: 'Les élèves créeront de la musique, développeront des compétences de performance et apprécieront divers styles musicaux.',
        themes: JSON.stringify([
          'Exploring sounds',
          'Rhythm and beat',
          'Singing together',
          'Music from many cultures'
        ]),
        overarchingQuestions: 'How can we make music? What makes music special? How does music make us feel?',
        assessmentOverview: 'Performance assessments, creative compositions, listening reflections, and participation in musical activities.',
        resourceNeeds: 'Classroom instruments (percussion), audio equipment, diverse music recordings, songbooks',
        professionalGoals: 'Collaborate with French teacher to integrate French songs and support language learning through music.'
      }
    });
    
    // Music expectations distributed across terms
    const musicTerm1 = ['CC 1.1', 'CC 1.2', 'ME 1', 'MA 1.1']; // Creating and exploring
    const musicTerm2 = ['MA 1.2', 'CCC 1', 'SP 1', 'RRA 1']; // Performance and response
    
    for (const exp of musicExpectations) {
      await prisma.longRangePlanExpectation.create({
        data: {
          longRangePlanId: musicPlan.id,
          expectationId: exp.id,
          plannedTerm: musicTerm1.includes(exp.code) ? 'Term 1' : 'Term 2'
        }
      });
    }
    
    console.log('✅ Created Music long range plan');
    
    // Final summary
    const planCount = await prisma.longRangePlan.count({
      where: { userId: emily.id }
    });
    
    const expectationCount = await prisma.longRangePlanExpectation.count({
      where: {
        longRangePlan: {
          userId: emily.id
        }
      }
    });
    
    console.log('\n📊 LONG RANGE PLANS CREATED SUCCESSFULLY!');
    console.log(`✅ ${planCount} subject plans created`);
    console.log(`✅ ${expectationCount} curriculum expectations linked`);
    console.log('✅ All 73 expectations distributed across the 2025-2026 school year');
    console.log('✅ Emily is ready to start planning units and lessons!');
    
  } catch (error) {
    console.error('❌ Error creating long range plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedLongRangePlans()
  .then(() => console.log('🎉 Long range plans seeding completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });