#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function enhanceRemainingUnitPlans() {
  console.log('📚 ENHANCING REMAINING FUTURE UNIT PLANS\n');

  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    if (!emily) throw new Error('Emily not found');

    // Get all unit plans without lessons that still need enhancement
    const allUnits = await prisma.unitPlan.findMany({
      where: { userId: emily.id },
      include: { lessonPlans: true },
      orderBy: { startDate: 'asc' }
    });

    const futureUnits = allUnits.filter(unit => unit.lessonPlans.length === 0);
    
    console.log(`Found ${futureUnits.length} total future units:`);
    futureUnits.forEach(unit => {
      console.log(`- ${unit.title} (${unit.startDate?.toDateString() || 'No date'} to ${unit.endDate?.toDateString() || 'No date'})`);
    });

    // Find units that still need enhancement (missing cross-curricular connections)
    const unitsToEnhance = futureUnits.filter(unit => 
      !unit.crossCurricularConnections || unit.crossCurricularConnections.length < 50
    );

    console.log(`\nUnits needing enhancement: ${unitsToEnhance.length}`);
    unitsToEnhance.forEach(unit => console.log(`- ${unit.title}`));

    const enhancements: Array<{
      id: string;
      title: string;
      description: string;
      bigIdeas: string;
      bigIdeasFr: string;
      crossCurricularConnections: string;
      essentialQuestions: string[];
      keyVocabulary: string[];
      assessmentPlan: string;
      successCriteria: string[];
      learningSkills: string[];
      culminatingTask: string;
      differentiationStrategies: any;
      indigenousPerspectives: string;
      environmentalEducation: string;
      socialJusticeConnections: string;
      technologyIntegration: string;
      communityConnections: string;
      parentCommunicationPlan: string;
    }> = [];

    // === REMAINING UNITS TO ENHANCE ===

    // Problem Solving Adventures (Math)
    enhancements.push({
      id: futureUnits.find(u => u.title === 'Problem Solving Adventures')?.id || '',
      title: 'Problem Solving Adventures',
      description: 'Developing problem-solving strategies across mathematical contexts while integrating French mathematical vocabulary and real-world applications from other subjects.',
      bigIdeas: 'Problems can be solved using different strategies. Mathematical thinking applies to many situations. We can explain our problem-solving process.',
      bigIdeasFr: 'Les problèmes peuvent être résolus avec différentes stratégies. La pensée mathématique s\'applique à de nombreuses situations.',
      crossCurricularConnections: 'Science: Solving measurement problems in experiments, calculating plant growth data, animal counting challenges. French: Problem-solving vocabulary, explanation strategies in French, word problems in French contexts. Arts: Proportional problems in art projects, color mixing ratios, symmetry problem solving. Social Studies: Community problem-solving scenarios, fair sharing problems.',
      essentialQuestions: [
        'What strategy should I use for this problem?',
        'Comment expliquer ma stratégie en français?',
        'How do I know if my answer makes sense?',
        'Where do we solve problems in real life?'
      ],
      keyVocabulary: [
        'problème', 'stratégie', 'solution', 'raisonnable', 'expliquer',
        'étape', 'méthode', 'vérifier', 'essayer', 'réfléchir'
      ],
      assessmentPlan: 'Problem-solving strategy demonstrations, explanation recordings, real-world problem applications, strategy choice justifications.',
      successCriteria: [
        'I can use different strategies to solve problems',
        'Je peux expliquer ma stratégie en français',
        'I can check if my answer is reasonable',
        'I can solve problems from other subjects using math'
      ],
      learningSkills: ['Initiative', 'Self-regulation', 'Independent work'],
      culminatingTask: 'Problem Solving Fair: Students create problem-solving challenges for other classes, demonstrate strategies, and solve real community problems.',
      differentiationStrategies: {
        emerging: 'Visual problem-solving steps, concrete manipulatives, guided practice',
        developing: 'Strategy choice charts, peer collaboration, structured problem formats',
        extending: 'Complex multi-step problems, strategy comparison, creating problems for others'
      },
      indigenousPerspectives: 'Traditional Indigenous problem-solving approaches, community-based decision making, practical life problem solving.',
      environmentalEducation: 'Environmental problem-solving scenarios, conservation challenges, sustainability calculations.',
      socialJusticeConnections: 'Fair problem-solving processes, equal access to problem-solving tools and support.',
      technologyIntegration: 'Problem-solving apps, digital manipulatives, online collaborative problem solving.',
      communityConnections: 'Real community problems to solve, business problem-solving visits, community helper problem scenarios.',
      parentCommunicationPlan: 'Home problem-solving activities, family daily life math problems, problem-solving strategy practice.'
    });

    // Spring in Bloom (Science)
    enhancements.push({
      id: futureUnits.find(u => u.title === 'Spring in Bloom')?.id || '',
      title: 'Spring in Bloom',
      description: 'Exploring spring changes in nature through scientific observation, incorporating measurement skills, French seasonal vocabulary, and artistic documentation of spring phenomena.',
      bigIdeas: 'Spring brings predictable changes to living and non-living things. We can observe and document these changes. Spring changes affect communities and individuals.',
      bigIdeasFr: 'Le printemps apporte des changements prévisibles aux êtres vivants et non-vivants. Nous pouvons observer et documenter ces changements.',
      crossCurricularConnections: 'Math: Measuring temperature changes, graphing daylight hours, counting spring elements, measuring plant growth. French: Spring vocabulary, weather descriptions, seasonal change expressions. Arts: Spring nature drawings, seasonal color palettes, growth documentation art. Social Studies: Spring activities in different communities, seasonal celebrations.',
      essentialQuestions: [
        'What changes do we notice in spring?',
        'Comment décrire les changements du printemps?',
        'How do spring changes affect living things?',
        'Why do these changes happen in spring?'
      ],
      keyVocabulary: [
        'printemps', 'changer', 'grandir', 'fleurir', 'bourgeon',
        'température', 'plus chaud', 'soleil', 'observer', 'documenter'
      ],
      assessmentPlan: 'Spring observation journals, change documentation projects, temperature tracking charts, spring phenomena explanations.',
      successCriteria: [
        'I can identify spring changes in nature',
        'Je peux décrire le printemps en français',
        'I can record and measure spring changes',
        'I can explain why spring changes happen'
      ],
      learningSkills: ['Organization', 'Responsibility', 'Collaboration'],
      culminatingTask: 'Spring Science Exhibition: Students present spring observation studies, growth measurements, and spring change explanations to families.',
      differentiationStrategies: {
        emerging: 'Picture spring change cards, guided observations, simple recording templates',
        developing: 'Spring change organizers, measurement recording support, prediction activities',
        extending: 'Detailed scientific observations, hypothesis formation, comparative studies'
      },
      indigenousPerspectives: 'Traditional Indigenous spring knowledge, seasonal harvesting practices, spring ceremonies and teachings.',
      environmentalEducation: 'Spring ecosystem changes, environmental protection during growing season, sustainable spring practices.',
      socialJusticeConnections: 'Equal access to spring outdoor learning, spring gardening opportunities for all students.',
      technologyIntegration: 'Time-lapse spring videos, digital temperature tracking, spring identification apps.',
      communityConnections: 'Greenhouse visits, community garden partnerships, local naturalist presentations.',
      parentCommunicationPlan: 'Home spring observation activities, family nature walks, spring vocabulary practice at home.'
    });

    // Stories in Art (Arts)
    enhancements.push({
      id: futureUnits.find(u => u.title === 'Stories in Art')?.id || '',
      title: 'Stories in Art',
      description: 'Creating and interpreting visual narratives through art while developing French storytelling vocabulary and mathematical sequencing concepts.',
      bigIdeas: 'Art can tell stories without words. Different art techniques create different story moods. We can sequence story events visually.',
      bigIdeasFr: 'L\'art peut raconter des histoires sans mots. Nous pouvons séquencer les événements visuellement.',
      crossCurricularConnections: 'French: Storytelling vocabulary, narrative descriptions, story sequence expressions in French. Math: Story sequencing, counting story elements, pattern recognition in visual narratives. Science: Life cycle stories, seasonal change narratives, animal behavior stories. Social Studies: Community stories, historical narratives, family tradition stories.',
      essentialQuestions: [
        'How can art tell a story?',
        'Comment raconter une histoire avec l\'art?',
        'What makes a good visual story?',
        'How do artists show sequence in their work?'
      ],
      keyVocabulary: [
        'histoire', 'raconter', 'séquence', 'début', 'milieu', 'fin',
        'personnage', 'action', 'émotion', 'couleur', 'expression'
      ],
      assessmentPlan: 'Story art creations, narrative explanations, sequence arrangements, story interpretation activities.',
      successCriteria: [
        'I can create art that tells a story',
        'Je peux raconter une histoire d\'art en français',
        'I can arrange story elements in sequence',
        'I can interpret stories in other people\'s artwork'
      ],
      learningSkills: ['Initiative', 'Collaboration', 'Organization'],
      culminatingTask: 'Story Art Gallery: Students create visual narratives and present their stories to audiences in both French and English.',
      differentiationStrategies: {
        emerging: 'Simple story templates, picture story supports, guided narrative development',
        developing: 'Story planning organizers, sequence supports, vocabulary frames',
        extending: 'Complex narratives, multiple story perspectives, teaching story techniques to others'
      },
      indigenousPerspectives: 'Traditional Indigenous storytelling through art, pictographic narratives, cultural story preservation.',
      environmentalEducation: 'Environmental stories through art, conservation narratives, nature protection stories.',
      socialJusticeConnections: 'Diverse story representation, equal access to storytelling materials and techniques.',
      technologyIntegration: 'Digital storytelling tools, animation basics, online story galleries.',
      communityConnections: 'Local artists sharing story techniques, community story collection projects.',
      parentCommunicationPlan: 'Home family story art projects, story sharing activities, narrative vocabulary practice.'
    });

    // Spring Awakening (Science)
    enhancements.push({
      id: futureUnits.find(u => u.title === 'Spring Awakening')?.id || '',
      title: 'Spring Awakening',
      description: 'Investigating how animals and plants awaken and become active in spring, incorporating measurement and data collection with French scientific vocabulary.',
      bigIdeas: 'Living things respond to seasonal changes. Spring triggers growth and activity in nature. We can observe and measure spring awakening patterns.',
      bigIdeasFr: 'Les êtres vivants répondent aux changements saisonniers. Le printemps déclenche la croissance et l\'activité dans la nature.',
      crossCurricularConnections: 'Math: Measuring growth rates, counting spring activities, graphing temperature and growth data, time measurements for spring events. French: Scientific observation vocabulary, spring activity descriptions, animal and plant awakening terms. Arts: Spring awakening illustrations, growth documentation art, animal activity drawings. Social Studies: Human spring activities, community spring events.',
      essentialQuestions: [
        'How do animals know spring is coming?',
        'Comment les plantes se réveillent-elles au printemps?',
        'What triggers spring awakening in nature?',
        'How can we measure spring awakening?'
      ],
      keyVocabulary: [
        'réveil', 'activité', 'énergie', 'croissance', 'mouvement',
        'température', 'lumière', 'nourrir', 'nid', 'migration'
      ],
      assessmentPlan: 'Animal activity observations, plant awakening documentation, spring awakening timelines, measurement recording activities.',
      successCriteria: [
        'I can identify signs of spring awakening in nature',
        'Je peux décrire le réveil printanier en français',
        'I can measure and record spring awakening data',
        'I can explain what triggers spring awakening'
      ],
      learningSkills: ['Organization', 'Responsibility', 'Self-regulation'],
      culminatingTask: 'Spring Awakening Science Report: Students present research on spring awakening with data, observations, and French scientific explanations.',
      differentiationStrategies: {
        emerging: 'Simple observation tasks, picture awakening signs, guided data collection',
        developing: 'Awakening prediction activities, structured observation templates, measurement supports',
        extending: 'Complex awakening studies, hypothesis testing, comparative awakening research'
      },
      indigenousPerspectives: 'Traditional Indigenous knowledge of spring signs, seasonal awakening teachings, natural calendar understanding.',
      environmentalEducation: 'Protecting spring awakening habitats, conservation during sensitive awakening periods.',
      socialJusticeConnections: 'Equal access to spring nature experiences, awakening observation opportunities for all.',
      technologyIntegration: 'Spring awakening webcams, digital observation tools, awakening tracking apps.',
      communityConnections: 'Nature center spring programs, wildlife awakening observations, park naturalist visits.',
      parentCommunicationPlan: 'Home spring awakening observations, family nature awakening activities, scientific vocabulary practice.'
    });

    // Math Celebration (Math)
    enhancements.push({
      id: futureUnits.find(u => u.title === 'Math Celebration')?.id || '',
      title: 'Math Celebration',
      description: 'Celebrating mathematical learning through cross-curricular applications, French mathematical presentations, and community math connections.',
      bigIdeas: 'Mathematics is everywhere in our world. We can celebrate our mathematical growth and learning. Math connects to all subjects and real life.',
      bigIdeasFr: 'Les mathématiques sont partout dans notre monde. Nous pouvons célébrer notre croissance mathématique.',
      crossCurricularConnections: 'Science: Mathematical applications in scientific observations and measurements. French: Mathematical presentations in French, number celebrations, measurement vocabulary. Arts: Mathematical art patterns, geometric celebrations, proportion in art. Social Studies: Community mathematics, celebration planning mathematics, cultural number traditions.',
      essentialQuestions: [
        'Where do we see mathematics in our daily lives?',
        'Comment célébrer les mathématiques en français?',
        'How has our mathematical thinking grown this year?',
        'How do we use math to solve real problems?'
      ],
      keyVocabulary: [
        'célébrer', 'mathématiques', 'croissance', 'progrès', 'réussir',
        'partager', 'démontrer', 'appliquer', 'créer', 'résoudre'
      ],
      assessmentPlan: 'Mathematical portfolio presentations, real-world math applications, growth documentation, celebration project planning.',
      successCriteria: [
        'I can show how I use math in different subjects',
        'Je peux présenter mes apprentissages mathématiques en français',
        'I can demonstrate my mathematical growth',
        'I can plan and organize a mathematical celebration'
      ],
      learningSkills: ['Initiative', 'Collaboration', 'Self-regulation'],
      culminatingTask: 'Mathematical Learning Celebration: Students organize and present a celebration showcasing mathematical learning, applications, and growth.',
      differentiationStrategies: {
        emerging: 'Simple math application examples, guided celebration planning, visual growth displays',
        developing: 'Math connection organizers, structured presentation formats, celebration role choices',
        extending: 'Complex math applications, leadership in celebration planning, teaching math concepts to others'
      },
      indigenousPerspectives: 'Traditional Indigenous mathematical thinking, cultural number systems, mathematical celebrations in different cultures.',
      environmentalEducation: 'Mathematical applications in environmental projects, conservation calculations, sustainable celebration planning.',
      socialJusticeConnections: 'Fair celebration participation, equal access to mathematical celebration activities.',
      technologyIntegration: 'Digital mathematical presentations, math celebration videos, online mathematical sharing.',
      communityConnections: 'Community members sharing math careers, mathematical applications in local businesses.',
      parentCommunicationPlan: 'Family mathematical celebration activities, home math application sharing, mathematical growth discussions.'
    });

    // Continue with remaining units...
    enhancements.push({
      id: futureUnits.find(u => u.title === 'Celebrating Our Learning')?.id || '',
      title: 'Celebrating Our Learning',
      description: 'Reflecting on the entire year of learning across all subjects while creating presentations that showcase growth, French language development, and cross-curricular connections.',
      bigIdeas: 'We have grown and learned in many ways this year. Learning connects across all subjects. We can celebrate and share our learning journey.',
      bigIdeasFr: 'Nous avons grandi et appris de nombreuses façons cette année. L\'apprentissage connecte tous les sujets.',
      crossCurricularConnections: 'All subjects: Portfolio creation showing growth in French, Math, Science, Arts, and other areas. Measurement of learning progress, artistic displays of learning, scientific documentation of growth, mathematical analysis of improvement.',
      essentialQuestions: [
        'How have I grown as a learner this year?',
        'Comment puis-je partager mes apprentissages en français?',
        'What connections do I see between different subjects?',
        'How can I celebrate learning with my community?'
      ],
      keyVocabulary: [
        'célébrer', 'apprendre', 'grandir', 'progrès', 'partager',
        'réfléchir', 'démontrer', 'fierté', 'accomplir', 'futur'
      ],
      assessmentPlan: 'Learning portfolios, growth documentation, presentation assessments, reflection activities, peer appreciation.',
      successCriteria: [
        'I can show examples of my learning growth',
        'Je peux présenter mes apprentissages en français',
        'I can explain connections between subjects',
        'I can participate in celebrating our class learning'
      ],
      learningSkills: ['Self-regulation', 'Responsibility', 'Initiative'],
      culminatingTask: 'Year-End Learning Celebration: Students present portfolios, perform learning demonstrations, and celebrate with families and community.',
      differentiationStrategies: {
        emerging: 'Simple learning examples, guided reflection activities, visual growth displays',
        developing: 'Learning connection organizers, structured presentation formats, celebration participation choices',
        extending: 'Complex learning analysis, leadership in celebration planning, mentoring other students'
      },
      indigenousPerspectives: 'Traditional Indigenous learning celebrations, honoring learning in community contexts, seasonal learning completion.',
      environmentalEducation: 'Celebrating environmental learning, sustainable celebration practices, learning about environmental stewardship.',
      socialJusticeConnections: 'Equal celebration participation, diverse learning recognition, inclusive celebration planning.',
      technologyIntegration: 'Digital portfolios, learning celebration videos, online learning sharing with families.',
      communityConnections: 'Family and community participation in learning celebrations, sharing learning with community members.',
      parentCommunicationPlan: 'Family involvement in celebration planning, home learning celebration activities, summer learning continuation.'
    });

    enhancements.push({
      id: futureUnits.find(u => u.title === 'Our Impact on Nature')?.id || '',
      title: 'Our Impact on Nature',
      description: 'Exploring how human actions affect the natural environment while developing French environmental vocabulary and mathematical concepts related to conservation.',
      bigIdeas: 'Human actions have positive and negative impacts on nature. We can make choices that help protect the environment. Small actions can make big differences.',
      bigIdeasFr: 'Les actions humaines ont des impacts positifs et négatifs sur la nature. Nous pouvons faire des choix qui protègent l\'environnement.',
      crossCurricularConnections: 'Math: Measuring environmental impact, counting conservation actions, graphing environmental data, calculating waste reduction. French: Environmental vocabulary, action descriptions, conservation expressions. Arts: Environmental awareness art, recycled material projects, nature protection posters. Social Studies: Community environmental efforts, global environmental connections.',
      essentialQuestions: [
        'How do our actions affect the environment?',
        'Comment pouvons-nous protéger la nature?',
        'What small changes can make a big difference?',
        'How can we measure our environmental impact?'
      ],
      keyVocabulary: [
        'environnement', 'protéger', 'recycler', 'économiser', 'nature',
        'pollution', 'conservation', 'réduire', 'réutiliser', 'respecter'
      ],
      assessmentPlan: 'Environmental impact assessments, conservation action plans, environmental improvement projects, impact measurement activities.',
      successCriteria: [
        'I can identify ways humans impact the environment',
        'Je peux décrire la protection de l\'environnement en français',
        'I can suggest actions to help the environment',
        'I can measure environmental improvements'
      ],
      learningSkills: ['Responsibility', 'Initiative', 'Collaboration'],
      culminatingTask: 'Environmental Action Fair: Students present environmental impact studies and lead conservation action projects for the school community.',
      differentiationStrategies: {
        emerging: 'Simple environmental actions, picture impact examples, guided conservation activities',
        developing: 'Environmental impact organizers, conservation choice activities, measurement supports',
        extending: 'Complex environmental analysis, leadership in conservation projects, community environmental advocacy'
      },
      indigenousPerspectives: 'Traditional Indigenous environmental stewardship, traditional ecological knowledge, respect for all living things.',
      environmentalEducation: 'Comprehensive environmental impact education, conservation action implementation, sustainability practices.',
      socialJusticeConnections: 'Environmental justice, equal access to healthy environments, fair environmental responsibility.',
      technologyIntegration: 'Environmental monitoring tools, conservation tracking apps, digital environmental presentations.',
      communityConnections: 'Environmental organizations, community conservation projects, environmental career presentations.',
      parentCommunicationPlan: 'Home environmental action activities, family conservation projects, environmental vocabulary practice.'
    });

    enhancements.push({
      id: futureUnits.find(u => u.title === 'Our Art Gallery')?.id || '',
      title: 'Our Art Gallery',
      description: 'Creating and curating a year-end art exhibition that showcases artistic growth, French artistic vocabulary, and connections between art and other subjects.',
      bigIdeas: 'Art can be displayed and shared with others. We have grown as artists throughout the year. Art connects to many subjects and experiences.',
      bigIdeasFr: 'L\'art peut être exposé et partagé avec les autres. Nous avons grandi comme artistes. L\'art se connecte à de nombreux sujets.',
      crossCurricularConnections: 'Math: Gallery space measurement, artwork arrangement planning, visitor counting, artwork pricing concepts. French: Art presentation vocabulary, artwork descriptions, gallery visitor interactions. Science: Color science in artwork, material properties in art, light and shadow in gallery display. Social Studies: Art in different cultures, community art appreciation, art career exploration.',
      essentialQuestions: [
        'How do we display art for others to enjoy?',
        'Comment présenter notre art en français?',
        'What have we learned through creating art?',
        'How does art connect to other subjects we study?'
      ],
      keyVocabulary: [
        'galerie', 'exposition', 'artiste', 'création', 'présenter',
        'admirer', 'technique', 'couleur', 'forme', 'inspiration'
      ],
      assessmentPlan: 'Art portfolio curation, gallery presentation skills, artistic growth documentation, peer art appreciation activities.',
      successCriteria: [
        'I can select and display my best artwork',
        'Je peux présenter mon art en français',
        'I can explain how I have grown as an artist',
        'I can appreciate and discuss other students\' artwork'
      ],
      learningSkills: ['Organization', 'Initiative', 'Collaboration'],
      culminatingTask: 'Year-End Art Gallery Exhibition: Students curate and present a professional art gallery showcasing their year-long artistic journey.',
      differentiationStrategies: {
        emerging: 'Simple gallery organization, guided art descriptions, visual presentation supports',
        developing: 'Gallery planning organizers, art description templates, presentation choice options',
        extending: 'Complex gallery curation, detailed art analysis, gallery tour leadership roles'
      },
      indigenousPerspectives: 'Traditional Indigenous art forms and gallery practices, community art sharing traditions, cultural art appreciation.',
      environmentalEducation: 'Sustainable gallery practices, recycled display materials, environmental themes in artwork.',
      socialJusticeConnections: 'Inclusive art representation, equal gallery participation opportunities, diverse art appreciation.',
      technologyIntegration: 'Digital gallery components, online art portfolio sharing, virtual gallery tours.',
      communityConnections: 'Local art gallery partnerships, community artist presentations, family and community gallery opening.',
      parentCommunicationPlan: 'Family involvement in gallery opening, home art appreciation activities, summer art continuation projects.'
    });

    let enhanced = 0;
    console.log('\nEnhancing remaining unit plans with cross-curricular connections...\n');

    for (const enhancement of enhancements) {
      if (enhancement.id) {
        try {
          await prisma.unitPlan.update({
            where: { id: enhancement.id },
            data: {
              description: enhancement.description,
              bigIdeas: enhancement.bigIdeas,
              bigIdeasFr: enhancement.bigIdeasFr,
              crossCurricularConnections: enhancement.crossCurricularConnections,
              essentialQuestions: JSON.stringify(enhancement.essentialQuestions),
              keyVocabulary: JSON.stringify(enhancement.keyVocabulary),
              assessmentPlan: enhancement.assessmentPlan,
              successCriteria: JSON.stringify(enhancement.successCriteria),
              learningSkills: JSON.stringify(enhancement.learningSkills),
              culminatingTask: enhancement.culminatingTask,
              differentiationStrategies: JSON.stringify(enhancement.differentiationStrategies),
              indigenousPerspectives: enhancement.indigenousPerspectives,
              environmentalEducation: enhancement.environmentalEducation,
              socialJusticeConnections: enhancement.socialJusticeConnections,
              technologyIntegration: enhancement.technologyIntegration,
              communityConnections: enhancement.communityConnections,
              parentCommunicationPlan: enhancement.parentCommunicationPlan
            }
          });

          enhanced++;
          console.log(`✅ Enhanced: ${enhancement.title}`);
          console.log(`   Cross-curricular: ${enhancement.crossCurricularConnections.substring(0, 100)}...`);
          console.log();
        } catch (error: any) {
          console.error(`❌ Failed to enhance ${enhancement.title}: ${error.message}`);
        }
      } else {
        console.log(`⚠️ Could not find unit: ${enhancement.title}`);
      }
    }

    console.log(`📊 REMAINING ENHANCEMENT SUMMARY:`);
    console.log(`Enhanced unit plans: ${enhanced}/${enhancements.length}`);
    console.log(`\nAll remaining future unit plans now include:`);
    console.log(`✅ Comprehensive cross-curricular connections`);
    console.log(`✅ Essential questions in French and English`);
    console.log(`✅ Detailed assessment plans`);
    console.log(`✅ Indigenous perspectives integration`);
    console.log(`✅ Environmental education connections`);
    console.log(`✅ Social justice considerations`);
    console.log(`✅ Technology integration opportunities`);
    console.log(`✅ Community and parent engagement plans`);

  } catch (error) {
    console.error('❌ Error enhancing remaining unit plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

enhanceRemainingUnitPlans()
  .then(() => {
    console.log('✅ All remaining future unit plans enhanced with cross-curricular opportunities');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Enhancement failed:', error);
    process.exit(1);
  });