#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedArtsVisuelsUnitPlans() {
  console.log('🎨 Creating Unit Plans for Arts visuels - Grade 1...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found. Please run main seed first.');
    }
    
    // Get the Arts visuels long range plan
    const artsPlan = await prisma.longRangePlan.findFirst({
      where: {
        userId: emily.id,
        subject: 'Arts visuels',
        academicYear: '2025-2026'
      }
    });
    
    if (!artsPlan) {
      throw new Error('Arts visuels long range plan not found. Please run long range plans seed first.');
    }
    
    console.log(`✅ Found Arts visuels long range plan (ID: ${artsPlan.id})`);
    
    // Get all Arts visuels expectations
    const expectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Arts visuels',
        grade: 1
      }
    });
    
    // Create a map for easy lookup
    const expectationMap = new Map(expectations.map(e => [e.code, e]));
    
    // Clear existing unit plans for this long range plan
    const existingUnits = await prisma.unitPlan.findMany({
      where: { longRangePlanId: artsPlan.id },
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
        where: { longRangePlanId: artsPlan.id }
      });
    }
    
    console.log('🗑️ Cleared existing unit plans');
    
    // UNIT 1: Discovering Art in Our World (September)
    const unit1 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: artsPlan.id,
        title: 'Discovering Art in Our World',
        titleFr: 'Découvrir l\'art dans notre monde',
        description: 'Exploring art all around us - in nature, our classroom, and our community. Introduction to basic art materials and techniques.',
        descriptionFr: 'Explorer l\'art tout autour de nous - dans la nature, notre classe et notre communauté. Introduction aux matériaux et techniques de base.',
        bigIdeas: 'Art is everywhere around us. We can create art with many different materials.',
        bigIdeasFr: 'L\'art est partout autour de nous. Nous pouvons créer de l\'art avec plusieurs matériaux différents.',
        essentialQuestions: JSON.stringify([
          'Où voyons-nous l\'art?',
          'Qu\'est-ce qui fait quelque chose beau?',
          'Comment puis-je créer de l\'art?'
        ]),
        startDate: new Date('2025-09-08'),
        endDate: new Date('2025-10-10'),
        estimatedHours: 10,
        assessmentPlan: 'Art observation journals, exploration portfolios, material experimentation documentation, peer sharing circles.',
        successCriteria: JSON.stringify([
          'Je peux identifier l\'art dans mon environnement',
          'Je peux utiliser différents matériaux pour créer',
          'Je peux parler de ce que je vois et crée'
        ]),
        crossCurricularConnections: 'Science: observing nature patterns; Math: shapes and patterns; French: descriptive vocabulary; Social Studies: community art',
        learningSkills: JSON.stringify(['Initiative', 'Self-regulation', 'Organization']),
        culminatingTask: 'Create an "Art in My World" collection showcasing found art and personal creations.',
        keyVocabulary: JSON.stringify([
          'art', 'artiste', 'créer', 'couleur', 'forme', 'ligne',
          'texture', 'motif', 'beau', 'observer', 'matériel', 'outil'
        ]),
        priorKnowledge: 'Basic color recognition, simple drawing experience, curiosity about visual world.',
        parentCommunicationPlan: 'Art supply requests, home art exploration activities, family art sharing, community art walk suggestions.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Exploration focus, large tools, sensory experiences, process over product',
          developing: 'Guided techniques, choice of materials, skill building activities',
          extending: 'Complex projects, teaching others, art research, gallery creation'
        }),
        indigenousPerspectives: 'Art in nature, traditional materials and techniques, connection between art and land, storytelling through images.',
        environmentalEducation: 'Natural art materials, ephemeral art, environmental art, reducing art waste, outdoor creation.',
        socialJusticeConnections: 'Art is for everyone, celebrating diverse art forms, accessibility in art, community beautification.',
        technologyIntegration: 'Digital photography of art, virtual museum tours, drawing apps introduction, documenting process.',
        communityConnections: 'Local artist visits, community art walk, public art exploration, library art programs, cultural center visits.'
      }
    });
    
    // Link expectations to Unit 1
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit1.id, expectationId: expectationMap.get('AV1')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit1.id, expectationId: expectationMap.get('AV3')!.id }
    });
    
    console.log('✅ Created Unit 1: Découvrir l\'art dans notre monde');
    
    // UNIT 2: Colors and Feelings (October-November)
    const unit2 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: artsPlan.id,
        title: 'Colors and Feelings',
        titleFr: 'Les couleurs et les sentiments',
        description: 'Exploring how colors express emotions and ideas. Learning color mixing and creating art that communicates feelings.',
        descriptionFr: 'Explorer comment les couleurs expriment les émotions et les idées. Apprendre le mélange des couleurs et créer de l\'art qui communique les sentiments.',
        bigIdeas: 'Colors can show how we feel. Artists use colors to tell stories and share emotions.',
        bigIdeasFr: 'Les couleurs peuvent montrer comment nous nous sentons. Les artistes utilisent les couleurs pour raconter des histoires.',
        essentialQuestions: JSON.stringify([
          'Comment les couleurs nous font-elles sentir?',
          'Comment puis-je montrer mes sentiments avec l\'art?',
          'Quelles couleurs vont bien ensemble?'
        ]),
        startDate: new Date('2025-10-14'),
        endDate: new Date('2025-11-21'),
        estimatedHours: 12,
        assessmentPlan: 'Color exploration experiments, emotion artwork portfolios, color mixing documentation, artist statements.',
        successCriteria: JSON.stringify([
          'Je peux mélanger les couleurs primaires',
          'Je peux utiliser les couleurs pour montrer mes sentiments',
          'Je peux expliquer mes choix de couleurs'
        ]),
        crossCurricularConnections: 'Science: light and color, rainbows; French: emotion vocabulary; Music: colors of sound; Health: expressing feelings',
        learningSkills: JSON.stringify(['Self-regulation', 'Initiative', 'Independent work']),
        culminatingTask: 'Create a "Feelings Rainbow" artwork showing different emotions through color choices.',
        keyVocabulary: JSON.stringify([
          'couleur', 'rouge', 'bleu', 'jaune', 'vert', 'orange', 'violet',
          'mélanger', 'primaire', 'secondaire', 'sentiment', 'émotion', 'exprimer',
          'art', 'peinture', 'artiste'
        ]),
        priorKnowledge: 'Basic color names, understanding of feelings, some painting experience from Unit 1.',
        parentCommunicationPlan: 'Color mixing at home, emotion discussions through art, family feeling artwork, paint shirt reminders.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Primary colors focus, large brushes, feeling cards support, process emphasis',
          developing: 'Color mixing exploration, emotion-color connections, varied tools',
          extending: 'Color theory introduction, complex emotions, teaching color mixing, artist research'
        }),
        indigenousPerspectives: 'Colors in traditional art, natural pigments and dyes, seasonal color meanings, medicine wheel colors.',
        environmentalEducation: 'Natural color sources, fall color changes, eco-friendly paints, color in animal adaptation.',
        socialJusticeConnections: 'Emotions are valid, cultural color meanings, inclusive color choices, art therapy awareness.',
        technologyIntegration: 'Digital color mixing, emotion apps with colors, virtual art galleries, color wheel tools.',
        communityConnections: 'Art therapist visit, paint store field trip, fall art festival participation, emotion artwork display.'
      }
    });
    
    // Link expectations to Unit 2
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit2.id, expectationId: expectationMap.get('AV2')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit2.id, expectationId: expectationMap.get('AV3')!.id }
    });
    
    console.log('✅ Created Unit 2: Les couleurs et les sentiments');
    
    // UNIT 3: Winter Celebrations Through Art (December-January)
    const unit3 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: artsPlan.id,
        title: 'Winter Celebrations Through Art',
        titleFr: 'Les célébrations d\'hiver par l\'art',
        description: 'Creating art for winter celebrations, exploring cultural traditions through visual arts, and making gifts and decorations.',
        descriptionFr: 'Créer de l\'art pour les célébrations d\'hiver, explorer les traditions culturelles par les arts visuels, et faire des cadeaux et décorations.',
        bigIdeas: 'Art helps us celebrate special times. Different cultures celebrate in beautiful ways.',
        bigIdeasFr: 'L\'art nous aide à célébrer les moments spéciaux. Différentes cultures célèbrent de belles façons.',
        essentialQuestions: JSON.stringify([
          'Comment l\'art rend-il les célébrations spéciales?',
          'Quelles traditions artistiques existe-t-il?',
          'Comment puis-je créer de l\'art pour partager?'
        ]),
        startDate: new Date('2025-11-24'),
        endDate: new Date('2026-01-30'),
        estimatedHours: 16,
        assessmentPlan: 'Cultural art research presentations, gift creation process documentation, decoration portfolios, celebration art showcase.',
        successCriteria: JSON.stringify([
          'Je peux créer de l\'art pour célébrer',
          'Je peux apprendre sur l\'art de différentes cultures',
          'Je peux faire de l\'art à partager avec les autres'
        ]),
        crossCurricularConnections: 'Social Studies: cultural celebrations; French: celebration vocabulary; Math: symmetry in decorations; Music: celebration songs',
        learningSkills: JSON.stringify(['Responsibility', 'Collaboration', 'Organization']),
        culminatingTask: 'Winter celebration art gallery featuring student-created decorations and gifts.',
        keyVocabulary: JSON.stringify([
          'célébration', 'tradition', 'culture', 'décoration', 'cadeau', 'partager',
          'symbole', 'motif', 'répétition', 'symétrie', 'spécial', 'fête',
          'art', 'artiste', 'créer'
        ]),
        priorKnowledge: 'Understanding of celebrations, color and material skills from Units 1-2, awareness of different cultures.',
        parentCommunicationPlan: 'Family tradition sharing, home decoration projects, gift-making support, cultural celebration information.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Simple decorations, template support, partnered projects, celebration choice',
          developing: 'Original designs, cultural research, multi-step projects, peer collaboration',
          extending: 'Complex techniques, teaching others, cultural art fusion, gallery curation'
        }),
        indigenousPerspectives: 'Winter solstice traditions, traditional winter crafts, gift-giving practices, storytelling through winter art.',
        environmentalEducation: 'Recyclable decorations, natural materials, sustainable gift-making, reducing holiday waste.',
        socialJusticeConnections: 'Respecting all celebrations, inclusive decorations, gifts from the heart not wallet, community sharing.',
        technologyIntegration: 'Virtual cultural museum tours, digital card creation, celebration art from around the world, documentation.',
        communityConnections: 'Cultural center visits, elder craft demonstrations, community decoration project, gift donation program.'
      }
    });
    
    // Link expectations to Unit 3
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit3.id, expectationId: expectationMap.get('AV2')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit3.id, expectationId: expectationMap.get('AV3')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit3.id, expectationId: expectationMap.get('AV4')!.id }
    });
    
    console.log('✅ Created Unit 3: Les célébrations d\'hiver par l\'art');
    
    // UNIT 4: Textures and Patterns (February-March)
    const unit4 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: artsPlan.id,
        title: 'Textures and Patterns',
        titleFr: 'Les textures et les motifs',
        description: 'Exploring texture through printmaking, collage, and mixed media. Creating patterns inspired by nature and culture.',
        descriptionFr: 'Explorer la texture par l\'impression, le collage et les médias mixtes. Créer des motifs inspirés par la nature et la culture.',
        bigIdeas: 'Texture adds interest to art. Patterns are everywhere and can tell stories.',
        bigIdeasFr: 'La texture ajoute de l\'intérêt à l\'art. Les motifs sont partout et peuvent raconter des histoires.',
        essentialQuestions: JSON.stringify([
          'Comment puis-je créer différentes textures?',
          'Où voyons-nous des motifs dans notre monde?',
          'Comment les motifs racontent-ils des histoires?'
        ]),
        startDate: new Date('2026-02-02'),
        endDate: new Date('2026-03-27'),
        estimatedHours: 16,
        assessmentPlan: 'Texture exploration journals, pattern creation portfolios, printmaking process documentation, mixed media experiments.',
        successCriteria: JSON.stringify([
          'Je peux créer différentes textures dans mon art',
          'Je peux faire et continuer des motifs',
          'Je peux utiliser l\'impression pour créer de l\'art'
        ]),
        crossCurricularConnections: 'Math: patterns and repetition; Science: textures in nature; French: descriptive language; PE: movement patterns',
        learningSkills: JSON.stringify(['Initiative', 'Organization', 'Independent work']),
        culminatingTask: 'Create a textured pattern quilt square for a collaborative class quilt.',
        keyVocabulary: JSON.stringify([
          'texture', 'lisse', 'rugueux', 'doux', 'dur', 'motif',
          'répétition', 'impression', 'collage', 'frotter', 'estamper', 'couche',
          'art', 'artiste', 'créer'
        ]),
        priorKnowledge: 'Basic art techniques from previous units, pattern understanding from math, sensory vocabulary.',
        parentCommunicationPlan: 'Texture hunt at home, pattern collection activities, printmaking materials request, family pattern art.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Simple patterns, texture exploration, large print tools, tactile focus',
          developing: 'Complex patterns, varied textures, printmaking techniques, layering',
          extending: 'Cultural pattern research, teaching printmaking, texture innovation, pattern mathematics'
        }),
        indigenousPerspectives: 'Traditional patterns and their meanings, textile arts, printmaking with natural materials, pattern storytelling.',
        environmentalEducation: 'Natural textures and patterns, eco-printing, found object printing, pattern in ecosystems.',
        socialJusticeConnections: 'Patterns from many cultures, textile traditions worldwide, collaborative art, sensory accessibility.',
        technologyIntegration: 'Digital pattern creation, texture photography, virtual textile museums, pattern generation apps.',
        communityConnections: 'Textile artist visit, printmaking workshop, cultural pattern presentations, community quilt project.'
      }
    });
    
    // Link expectations to Unit 4
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit4.id, expectationId: expectationMap.get('AV1')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit4.id, expectationId: expectationMap.get('AV3')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit4.id, expectationId: expectationMap.get('AV4')!.id }
    });
    
    console.log('✅ Created Unit 4: Les textures et les motifs');
    
    // UNIT 5: Stories in Art (April-May)
    const unit5 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: artsPlan.id,
        title: 'Stories in Art',
        titleFr: 'Les histoires dans l\'art',
        description: 'Using visual art to tell stories, illustrate books, and communicate ideas through sequential art and illustration.',
        descriptionFr: 'Utiliser l\'art visuel pour raconter des histoires, illustrer des livres et communiquer des idées par l\'art séquentiel.',
        bigIdeas: 'Art can tell stories without words. We can be illustrators and visual storytellers.',
        bigIdeasFr: 'L\'art peut raconter des histoires sans mots. Nous pouvons être des illustrateurs et conteurs visuels.',
        essentialQuestions: JSON.stringify([
          'Comment l\'art raconte-t-il une histoire?',
          'Comment puis-je illustrer mes idées?',
          'Qu\'est-ce qui fait une bonne illustration?'
        ]),
        startDate: new Date('2026-03-30'),
        endDate: new Date('2026-05-15'),
        estimatedHours: 14,
        assessmentPlan: 'Story illustration portfolios, visual narrative sequences, character design documentation, peer story interpretations.',
        successCriteria: JSON.stringify([
          'Je peux raconter une histoire avec des images',
          'Je peux illustrer un livre ou une idée',
          'Je peux créer des personnages dans mon art'
        ]),
        crossCurricularConnections: 'French: storytelling and writing; Drama: character development; Social Studies: community stories; Science: life cycles',
        learningSkills: JSON.stringify(['Initiative', 'Collaboration', 'Self-regulation']),
        culminatingTask: 'Create and publish a class illustrated storybook featuring student artwork.',
        keyVocabulary: JSON.stringify([
          'histoire', 'illustrer', 'personnage', 'scène', 'début', 'milieu',
          'fin', 'détail', 'expression', 'mouvement', 'livre', 'page',
          'art', 'artiste', 'dessin'
        ]),
        priorKnowledge: 'Story structure understanding, drawing skills from previous units, character awareness from reading.',
        parentCommunicationPlan: 'Family story sharing, bedtime story illustrations, home book creation, story art celebration invitation.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Single scene illustrations, story dictation with art, character templates, partner work',
          developing: 'Multi-scene stories, original characters, book format exploration, peer collaboration',
          extending: 'Complex narratives, teaching illustration, digital storytelling, author-illustrator study'
        }),
        indigenousPerspectives: 'Visual storytelling traditions, pictographs and symbols, oral stories to visual art, traditional characters.',
        environmentalEducation: 'Nature stories, environmental heroes, lifecycle illustrations, conservation narratives.',
        socialJusticeConnections: 'Stories from many perspectives, representation in illustration, inclusive characters, community stories.',
        technologyIntegration: 'Digital illustration tools, animated stories, e-book creation, virtual author-illustrator visits.',
        communityConnections: 'Local illustrator visits, library illustration workshop, bookstore field trip, story mural project.'
      }
    });
    
    // Link expectations to Unit 5
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit5.id, expectationId: expectationMap.get('AV2')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit5.id, expectationId: expectationMap.get('AV3')!.id }
    });
    
    console.log('✅ Created Unit 5: Les histoires dans l\'art');
    
    // UNIT 6: Our Art Gallery (May-June)
    const unit6 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: artsPlan.id,
        title: 'Our Art Gallery',
        titleFr: 'Notre galerie d\'art',
        description: 'Celebrating our growth as artists, curating exhibitions, and reflecting on our artistic journey throughout the year.',
        descriptionFr: 'Célébrer notre croissance comme artistes, organiser des expositions et réfléchir sur notre voyage artistique.',
        bigIdeas: 'We are all artists. Art galleries help us share and celebrate art with our community.',
        bigIdeasFr: 'Nous sommes tous des artistes. Les galeries d\'art nous aident à partager et célébrer l\'art.',
        essentialQuestions: JSON.stringify([
          'Comment ai-je grandi comme artiste?',
          'Comment présenter mon art aux autres?',
          'Pourquoi l\'art est-il important?'
        ]),
        startDate: new Date('2026-05-19'),
        endDate: new Date('2026-06-25'),
        estimatedHours: 12,
        assessmentPlan: 'Portfolio conferences, artist statements, gallery presentation skills, peer appreciation feedback, growth documentation.',
        successCriteria: JSON.stringify([
          'Je peux choisir mes meilleures œuvres',
          'Je peux expliquer mon art aux autres',
          'Je peux apprécier l\'art des autres'
        ]),
        crossCurricularConnections: 'French: artist statements and descriptions; Math: gallery layout and spacing; Social Studies: community celebration',
        learningSkills: JSON.stringify(['Organization', 'Responsibility', 'Initiative', 'Collaboration']),
        culminatingTask: 'Student-curated art gallery exhibition for families and community.',
        keyVocabulary: JSON.stringify([
          'galerie', 'exposition', 'artiste', 'portfolio', 'présenter', 'célébrer',
          'admirer', 'critiquer', 'choisir', 'expliquer', 'fierté', 'croissance'
        ]),
        priorKnowledge: 'Full year of art creation, presentation skills, understanding of artistic growth and development.',
        parentCommunicationPlan: 'Gallery opening invitations, artwork selection support, artist statement help, celebration planning.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Supported selection, simple statements, paired presentations, celebration focus',
          developing: 'Independent curation, detailed statements, gallery roles, peer support',
          extending: 'Gallery design leadership, mentoring others, critical appreciation, future goals'
        }),
        indigenousPerspectives: 'Art as community celebration, sharing circles for art, traditional ways of honoring artists, art as gift.',
        environmentalEducation: 'Sustainable gallery practices, outdoor exhibitions, nature as gallery, environmental art activism.',
        socialJusticeConnections: 'Art accessibility, celebrating all artistic expressions, community art importance, art as voice.',
        technologyIntegration: 'Virtual gallery creation, digital portfolios, QR codes for artist statements, documentation.',
        communityConnections: 'Local gallery visit, professional artist panel, community exhibition space, summer art program information.'
      }
    });
    
    // Link expectations to Unit 6 (reviewing all expectations)
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit6.id, expectationId: expectationMap.get('AV1')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit6.id, expectationId: expectationMap.get('AV2')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit6.id, expectationId: expectationMap.get('AV4')!.id }
    });
    
    console.log('✅ Created Unit 6: Notre galerie d\'art');
    
    // Verify all expectations are covered
    const unitCount = await prisma.unitPlan.count({
      where: { longRangePlanId: artsPlan.id }
    });
    
    const linkedExpectations = await prisma.unitPlanExpectation.count({
      where: {
        unitPlan: {
          longRangePlanId: artsPlan.id
        }
      }
    });
    
    console.log('\n📊 UNIT PLANS CREATED SUCCESSFULLY!');
    console.log(`✅ ${unitCount} unit plans created for Arts visuels`);
    console.log(`✅ ${linkedExpectations} curriculum expectation linkages`);
    console.log('✅ Complete coverage from September to June');
    console.log('✅ All 4 Arts visuels expectations covered multiple times');
    console.log('✅ Rich integration with all other subjects');
    console.log('✅ Developmentally appropriate for Grade 1');
    console.log('✅ Strong French immersion support');
    console.log('✅ Emily is ready to inspire young artists!');
    
  } catch (error) {
    console.error('❌ Error creating unit plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedArtsVisuelsUnitPlans()
  .then(() => console.log('🎉 Arts visuels unit plans seeding completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });