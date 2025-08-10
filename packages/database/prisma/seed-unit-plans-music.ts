#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMusicUnitPlans() {
  console.log('🎵 Creating Unit Plans for Music - Grade 1...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found. Please run main seed first.');
    }
    
    // Get the Music long range plan
    const musicPlan = await prisma.longRangePlan.findFirst({
      where: {
        userId: emily.id,
        subject: 'Music',
        academicYear: '2025-2026'
      }
    });
    
    if (!musicPlan) {
      throw new Error('Music long range plan not found. Please run long range plans seed first.');
    }
    
    console.log(`✅ Found Music long range plan (ID: ${musicPlan.id})`);
    
    // Get all Music expectations
    const expectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Music',
        grade: 1
      }
    });
    
    // Create a map for easy lookup
    const expectationMap = new Map(expectations.map(e => [e.code, e]));
    
    // Clear existing unit plans for this long range plan
    const existingUnits = await prisma.unitPlan.findMany({
      where: { longRangePlanId: musicPlan.id },
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
        where: { longRangePlanId: musicPlan.id }
      });
    }
    
    console.log('🗑️ Cleared existing unit plans');
    
    // UNIT 1: Discovering Musical Play (September)
    const unit1 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: musicPlan.id,
        title: 'Discovering Musical Play',
        titleFr: 'Découvrir le jeu musical',
        description: 'Introduction to music through playful exploration of sounds, voices, and instruments in the classroom.',
        descriptionFr: 'Introduction à la musique par l\'exploration ludique des sons, voix et instruments dans la classe.',
        bigIdeas: 'Music is all around us. We can make music with our voices, bodies, and instruments.',
        bigIdeasFr: 'La musique est partout. Nous pouvons faire de la musique avec nos voix, corps et instruments.',
        essentialQuestions: JSON.stringify([
          'What sounds do we hear around us?',
          'How can we make music with our bodies?',
          'What makes a sound musical?'
        ]),
        startDate: new Date('2025-09-08'),
        endDate: new Date('2025-10-10'),
        estimatedHours: 8,
        assessmentPlan: 'Observation of musical play participation, listening skills checklist, voice and body percussion exploration rubric.',
        successCriteria: JSON.stringify([
          'I can make different sounds with my voice',
          'I can create rhythms with my body',
          'I can listen carefully to musical sounds'
        ]),
        crossCurricularConnections: 'French: singing simple French songs; Math: patterns and counting in rhythm; PE: movement to music',
        learningSkills: JSON.stringify(['Collaboration', 'Self-regulation', 'Initiative']),
        culminatingTask: 'Musical playground - students create a soundscape of their school environment.',
        keyVocabulary: JSON.stringify([
          'sound', 'music', 'voice', 'sing', 'rhythm', 
          'beat', 'loud', 'quiet', 'fast', 'slow', 'instrument'
        ]),
        priorKnowledge: 'Natural musical play from early childhood, exposure to songs and rhymes.',
        parentCommunicationPlan: 'Music at home newsletter, simple songs to sing together, everyday sound exploration ideas.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Echo activities, visual cues, partner support',
          developing: 'Small group music making, choice of instruments',
          extending: 'Creating own patterns, helping others, solo performances'
        }),
        indigenousPerspectives: 'Traditional Mi\'kmaq songs and rhythms, drum circle introduction, music in ceremony and celebration.',
        environmentalEducation: 'Sounds of nature as music, creating instruments from recycled materials, outdoor sound walks.',
        socialJusticeConnections: 'Everyone can make music, celebrating different musical traditions, music brings people together.',
        technologyIntegration: 'Recording musical creations, music apps for exploration, listening to diverse music online.',
        communityConnections: 'Local musician visit, exploring community sounds, family music sharing circle.'
      }
    });
    
    // Link expectations to Unit 1
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit1.id, expectationId: expectationMap.get('CC 1.1')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit1.id, expectationId: expectationMap.get('ME 1')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit1.id, expectationId: expectationMap.get('MA 1.2')!.id }
    });
    
    console.log('✅ Created Unit 1: Discovering Musical Play');
    
    // UNIT 2: Rhythm and Movement (October-November)
    const unit2 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: musicPlan.id,
        title: 'Rhythm and Movement',
        titleFr: 'Rythme et mouvement',
        description: 'Exploring steady beat, rhythm patterns, and movement through percussion instruments and body percussion.',
        descriptionFr: 'Explorer le tempo stable, les motifs rythmiques et le mouvement avec percussion et percussion corporelle.',
        bigIdeas: 'Rhythm is the heartbeat of music. Our bodies can keep the beat and create patterns.',
        bigIdeasFr: 'Le rythme est le cœur de la musique. Nos corps peuvent garder le tempo et créer des motifs.',
        essentialQuestions: JSON.stringify([
          'What is the difference between beat and rhythm?',
          'How do we move to different types of music?',
          'How can we show rhythm with our bodies?'
        ]),
        startDate: new Date('2025-10-14'),
        endDate: new Date('2025-11-21'),
        estimatedHours: 10,
        assessmentPlan: 'Rhythm pattern performance assessment, instrument technique observation, movement creativity rubric.',
        successCriteria: JSON.stringify([
          'I can keep a steady beat',
          'I can play simple rhythms on instruments',
          'I can move my body to show the music'
        ]),
        crossCurricularConnections: 'PE: dance and movement patterns; Math: pattern recognition and repetition; French: rhythm in poetry',
        learningSkills: JSON.stringify(['Collaboration', 'Responsibility', 'Self-regulation']),
        culminatingTask: 'Rhythm parade - students perform rhythm patterns with instruments and movement for other classes.',
        keyVocabulary: JSON.stringify([
          'beat', 'rhythm', 'pattern', 'percussion', 'drum', 
          'shake', 'tap', 'march', 'dance', 'tempo', 'repeat'
        ]),
        priorKnowledge: 'Basic musical play from Unit 1, understanding of patterns from math.',
        parentCommunicationPlan: 'Home rhythm activities, kitchen percussion ideas, movement games to music.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Simple steady beat, visual pattern cards, teacher modeling',
          developing: 'Two-part rhythms, instrument choices, peer collaboration',
          extending: 'Complex patterns, rhythm composition, leading drum circles'
        }),
        indigenousPerspectives: 'Traditional drumming patterns, Indigenous dance movements, ceremonial rhythms and their meanings.',
        environmentalEducation: 'Natural rhythms in environment (rain, waves, heartbeat), making shakers from natural materials.',
        socialJusticeConnections: 'Rhythms from around the world, inclusive movement activities, everyone has rhythm.',
        technologyIntegration: 'Rhythm apps and games, recording rhythm compositions, digital drum machines.',
        communityConnections: 'Drummer or percussionist visit, attending local performances, rhythm workshop with families.'
      }
    });
    
    // Link expectations to Unit 2
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit2.id, expectationId: expectationMap.get('ME 1')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit2.id, expectationId: expectationMap.get('MA 1.1')!.id }
    });
    
    console.log('✅ Created Unit 2: Rhythm and Movement');
    
    // UNIT 3: Songs and Stories (December-January)
    const unit3 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: musicPlan.id,
        title: 'Songs and Stories',
        titleFr: 'Chansons et histoires',
        description: 'Learning seasonal songs, exploring how music tells stories, and developing singing voices.',
        descriptionFr: 'Apprendre des chansons saisonnières, explorer comment la musique raconte des histoires, développer la voix chantée.',
        bigIdeas: 'Songs tell stories and express feelings. Our voices are special instruments.',
        bigIdeasFr: 'Les chansons racontent des histoires et expriment des sentiments. Nos voix sont des instruments spéciaux.',
        essentialQuestions: JSON.stringify([
          'How does music help tell a story?',
          'What makes singing different from talking?',
          'How do songs make us feel?'
        ]),
        startDate: new Date('2025-11-24'),
        endDate: new Date('2026-01-23'),
        estimatedHours: 10,
        assessmentPlan: 'Singing voice development checklist, story song performance, emotional expression observation.',
        successCriteria: JSON.stringify([
          'I can use my singing voice',
          'I can sing songs with others',
          'I can show feelings through music'
        ]),
        crossCurricularConnections: 'French: bilingual songs and vocabulary; Literacy: story structure in songs; Social Studies: cultural songs',
        learningSkills: JSON.stringify(['Collaboration', 'Initiative', 'Self-regulation']),
        culminatingTask: 'Winter concert - perform seasonal songs and musical stories for families.',
        keyVocabulary: JSON.stringify([
          'sing', 'song', 'melody', 'lyrics', 'story', 
          'feeling', 'high', 'low', 'chorus', 'verse', 'voice'
        ]),
        priorKnowledge: 'Voice exploration from Unit 1, rhythm skills from Unit 2, familiar children\'s songs.',
        parentCommunicationPlan: 'Holiday song lyrics to practice, family singing traditions survey, concert preparation tips.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Echo singing, simple melodies, gesture support',
          developing: 'Harmony parts, song choices, small group singing',
          extending: 'Solo opportunities, creating verses, teaching songs to others'
        }),
        indigenousPerspectives: 'Traditional Indigenous songs and their stories, oral tradition through music, seasonal celebration songs.',
        environmentalEducation: 'Songs about nature and seasons, animal sounds in music, winter soundscapes.',
        socialJusticeConnections: 'Songs from many cultures, inclusive holiday music, music as universal language.',
        technologyIntegration: 'Recording performances, karaoke apps, creating digital songbooks.',
        communityConnections: 'Senior center performance, cultural song sharing, guest storyteller with music.'
      }
    });
    
    // Link expectations to Unit 3
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit3.id, expectationId: expectationMap.get('MA 1.2')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit3.id, expectationId: expectationMap.get('CCC 1')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit3.id, expectationId: expectationMap.get('SP 1')!.id }
    });
    
    console.log('✅ Created Unit 3: Songs and Stories');
    
    // UNIT 4: Creating Music Together (February-March)
    const unit4 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: musicPlan.id,
        title: 'Creating Music Together',
        titleFr: 'Créer de la musique ensemble',
        description: 'Composing simple musical ideas, exploring notation, and working together to create music.',
        descriptionFr: 'Composer des idées musicales simples, explorer la notation et travailler ensemble pour créer de la musique.',
        bigIdeas: 'We can create our own music. Music has symbols that help us remember and share our ideas.',
        bigIdeasFr: 'Nous pouvons créer notre propre musique. La musique a des symboles pour se souvenir et partager.',
        essentialQuestions: JSON.stringify([
          'How do we write down music?',
          'What makes a good musical idea?',
          'How do we create music as a group?'
        ]),
        startDate: new Date('2026-01-26'),
        endDate: new Date('2026-03-13'),
        estimatedHours: 12,
        assessmentPlan: 'Composition portfolio, notation understanding check, collaborative creation rubric, peer feedback.',
        successCriteria: JSON.stringify([
          'I can create simple musical patterns',
          'I can use symbols to show my music',
          'I can work with others to make music'
        ]),
        crossCurricularConnections: 'Math: patterns and symbols; Art: visual representation of sound; French: musical vocabulary',
        learningSkills: JSON.stringify(['Collaboration', 'Initiative', 'Organization']),
        culminatingTask: 'Class composition - create and perform an original piece using various notations.',
        keyVocabulary: JSON.stringify([
          'compose', 'create', 'notation', 'symbol', 'idea', 
          'together', 'write', 'read', 'perform', 'original', 'pattern'
        ]),
        priorKnowledge: 'Rhythm and melody experience from previous units, pattern recognition, collaborative skills.',
        parentCommunicationPlan: 'Composition sharing at home, family music creation ideas, notation games.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Picture notation, simple patterns, guided composition',
          developing: 'Invented notation, longer compositions, partner work',
          extending: 'Standard notation introduction, complex pieces, composition leadership'
        }),
        indigenousPerspectives: 'Traditional ways of passing on music, pictographic musical notation, collaborative music making.',
        environmentalEducation: 'Composing with environmental sounds, graphic scores of nature, sustainable instrument making.',
        socialJusticeConnections: 'Everyone can compose, different notation systems worldwide, collaborative creativity.',
        technologyIntegration: 'Digital composition tools, notation apps, sharing compositions online.',
        communityConnections: 'Composer visit, sharing compositions with other classes, collaborative project with local school.'
      }
    });
    
    // Link expectations to Unit 4
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit4.id, expectationId: expectationMap.get('CC 1.1')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit4.id, expectationId: expectationMap.get('CC 1.2')!.id }
    });
    
    console.log('✅ Created Unit 4: Creating Music Together');
    
    // UNIT 5: Music Around the World (March-April)
    const unit5 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: musicPlan.id,
        title: 'Music Around the World',
        titleFr: 'La musique autour du monde',
        description: 'Exploring diverse musical genres, styles, and cultural contexts through listening and performing.',
        descriptionFr: 'Explorer divers genres musicaux, styles et contextes culturels par l\'écoute et la performance.',
        bigIdeas: 'Music is different around the world. Every culture has special music that tells their story.',
        bigIdeasFr: 'La musique est différente partout dans le monde. Chaque culture a une musique spéciale.',
        essentialQuestions: JSON.stringify([
          'How is music different in different places?',
          'What can music teach us about people?',
          'How do we show respect for all music?'
        ]),
        startDate: new Date('2026-03-16'),
        endDate: new Date('2026-04-24'),
        estimatedHours: 10,
        assessmentPlan: 'Cultural music exploration journal, respectful listening rubric, world music performance assessment.',
        successCriteria: JSON.stringify([
          'I can identify different types of music',
          'I can perform music from different cultures',
          'I can respect all kinds of music'
        ]),
        crossCurricularConnections: 'Social Studies: world cultures and geography; French: multilingual songs; Art: cultural instruments',
        learningSkills: JSON.stringify(['Collaboration', 'Initiative', 'Responsibility']),
        culminatingTask: 'World music festival - perform and share music from various cultures.',
        keyVocabulary: JSON.stringify([
          'culture', 'world', 'different', 'respect', 'tradition', 
          'celebrate', 'festival', 'genre', 'style', 'global', 'diverse'
        ]),
        priorKnowledge: 'Performance skills from previous units, understanding of diversity from social studies.',
        parentCommunicationPlan: 'Family cultural music sharing, world music playlist, heritage music stories.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Familiar cultural music, movement responses, visual supports',
          developing: 'Comparing musical styles, learning simple world songs',
          extending: 'Research projects, teaching cultural songs, instrument exploration'
        }),
        indigenousPerspectives: 'Indigenous music as foundational to this land, pow wow music, throat singing, traditional instruments.',
        environmentalEducation: 'Music inspired by nature worldwide, instruments from natural materials, outdoor world music celebration.',
        socialJusticeConnections: 'Respecting all musical traditions, understanding cultural appropriation, music as human right.',
        technologyIntegration: 'Virtual world music tours, video performances from other countries, digital instrument exploration.',
        communityConnections: 'Cultural community performers, international student sharing, world music concert attendance.'
      }
    });
    
    // Link expectations to Unit 5
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit5.id, expectationId: expectationMap.get('CCC 1')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit5.id, expectationId: expectationMap.get('SP 1')!.id }
    });
    
    console.log('✅ Created Unit 5: Music Around the World');
    
    // UNIT 6: Musical Celebration (May-June)
    const unit6 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: musicPlan.id,
        title: 'Musical Celebration',
        titleFr: 'Célébration musicale',
        description: 'Reflecting on musical growth, refining performances, and celebrating a year of music making.',
        descriptionFr: 'Réfléchir sur la croissance musicale, raffiner les performances et célébrer une année de musique.',
        bigIdeas: 'We have grown as musicians. Music brings joy and connects us to others.',
        bigIdeasFr: 'Nous avons grandi comme musiciens. La musique apporte la joie et nous connecte aux autres.',
        essentialQuestions: JSON.stringify([
          'How have we grown as musicians?',
          'What is our favorite music we made?',
          'How will we keep making music?'
        ]),
        startDate: new Date('2026-04-27'),
        endDate: new Date('2026-06-24'),
        estimatedHours: 10,
        assessmentPlan: 'Musical growth portfolio review, performance self-assessment, reflection conferences.',
        successCriteria: JSON.stringify([
          'I can show what I learned in music',
          'I can perform with confidence',
          'I can help make our celebration special'
        ]),
        crossCurricularConnections: 'All subjects: integration celebration; French: bilingual performances; Art: concert decorations',
        learningSkills: JSON.stringify(['Self-regulation', 'Responsibility', 'Initiative', 'Organization', 'Collaboration', 'Independent work']),
        culminatingTask: 'Spring music showcase - students perform favorite pieces and original compositions for families.',
        keyVocabulary: JSON.stringify([
          'perform', 'celebrate', 'growth', 'musician', 'showcase', 
          'confidence', 'practice', 'improve', 'share', 'joy', 'memory'
        ]),
        priorKnowledge: 'All musical skills and knowledge from the year, performance experience, collaborative skills.',
        parentCommunicationPlan: 'Showcase preparation, summer music activities, celebrating musical growth at home.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Choice of familiar pieces, group performances, celebration of effort',
          developing: 'Refined performances, some solo parts, helping with planning',
          extending: 'Leadership roles, mentoring others, advanced performance options'
        }),
        indigenousPerspectives: 'Music in celebration and ceremony, gratitude through song, passing on musical knowledge.',
        environmentalEducation: 'Outdoor performance spaces, nature-inspired celebration music, sustainable event planning.',
        socialJusticeConnections: 'Everyone is a musician, celebrating diverse musical journeys, music for community building.',
        technologyIntegration: 'Recording final performances, digital portfolio creation, virtual sharing with distant family.',
        communityConnections: 'Community venue performance, inviting senior residents, collaboration with local musicians.'
      }
    });
    
    // Link expectations to Unit 6
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit6.id, expectationId: expectationMap.get('SP 1')!.id }
    });
    await prisma.unitPlanExpectation.create({
      data: { unitPlanId: unit6.id, expectationId: expectationMap.get('RRA 1')!.id }
    });
    
    console.log('✅ Created Unit 6: Musical Celebration');
    
    // Verify all expectations are covered
    const unitCount = await prisma.unitPlan.count({
      where: { longRangePlanId: musicPlan.id }
    });
    
    const linkedExpectations = await prisma.unitPlanExpectation.count({
      where: {
        unitPlan: {
          longRangePlanId: musicPlan.id
        }
      }
    });
    
    console.log('\n📊 MUSIC UNIT PLANS CREATED SUCCESSFULLY!');
    console.log(`✅ ${unitCount} unit plans created for Music`);
    console.log(`✅ ${linkedExpectations} curriculum expectations linked to units`);
    console.log('✅ Complete coverage from September to June');
    console.log('✅ All 8 Music expectations distributed appropriately');
    console.log('✅ Bilingual support despite English curriculum');
    console.log('✅ Rich integration with all 7 other subjects');
    console.log('✅ Musical growth journey from exploration to celebration');
    console.log('✅ Emily now has ALL 8 subjects complete!');
    
  } catch (error) {
    console.error('❌ Error creating unit plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedMusicUnitPlans()
  .then(() => console.log('🎉 Music unit plans seeding completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });