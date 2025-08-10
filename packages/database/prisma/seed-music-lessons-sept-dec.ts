#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMusicLessons() {
  console.log('🎵 Seeding Music Lessons September-December 2025...\n');

  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    if (!emily) throw new Error('Emily not found');

    // Find Music long-range plan and create unit plan
    const musicLongRangePlan = await prisma.longRangePlan.findFirst({
      where: {
        userId: emily.id,
        subject: 'Music'
      }
    });

    if (!musicLongRangePlan) throw new Error('Music Long Range Plan not found');

    // Create Music unit plan for Sept-Dec
    let musicUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        longRangePlanId: musicLongRangePlan.id,
        title: 'Musical Foundations - Fall Semester'
      }
    });

    if (!musicUnit) {
      musicUnit = await prisma.unitPlan.create({
        data: {
          title: 'Musical Foundations - Fall Semester',
          longRangePlanId: musicLongRangePlan.id,
          description: 'Introduction to rhythm, melody, singing, and musical expression for Grade 1 students.',
          startDate: new Date('2025-09-01'),
          endDate: new Date('2025-12-20'),
          userId: emily.id
        }
      });
    }

    const lessons: any[] = [];

    // Helper functions for dates
    const septDate = (day: number) => {
      const date = new Date(2025, 8, day);
      if (date.getDay() === 0) return new Date(2025, 8, day + 1);
      if (date.getDay() === 6) return new Date(2025, 8, day + 2);
      return date;
    };

    const octDate = (day: number) => {
      const date = new Date(2025, 9, day);
      if (date.getDay() === 0) return new Date(2025, 9, day + 1);
      if (date.getDay() === 6) return new Date(2025, 9, day + 2);
      return date;
    };

    const novDate = (day: number) => {
      const date = new Date(2025, 10, day);
      if (date.getDay() === 0) return new Date(2025, 10, day + 1);
      if (date.getDay() === 6) return new Date(2025, 10, day + 2);
      return date;
    };

    const decDate = (day: number) => {
      const date = new Date(2025, 11, day);
      if (date.getDay() === 0) return new Date(2025, 11, day + 1);
      if (date.getDay() === 6) return new Date(2025, 11, day + 2);
      return date;
    };

    // === SEPTEMBER MUSIC LESSONS ===
    
    lessons.push({
      title: 'Exploring Sounds Around Us',
      titleFr: 'Explorer les sons autour de nous',
      date: septDate(12),
      subject: 'Music',
      duration: 35,
      learningGoals: 'Students will identify and categorize different sounds in their environment and understand the difference between sound and silence.',
      mindsOn: 'Sound walk: Listen carefully and identify sounds in our school.',
      action: 'Sound sorting activity: natural vs. human-made sounds. Create sound maps of our classroom.',
      consolidation: 'Share favorite sounds discovered and demonstrate making them.',
      materials: JSON.stringify(['Recording device', 'sound identification cards', 'chart paper', 'various sound makers']),
      grouping: 'Whole class sound walk, partner sound sorting, individual sharing',
      accommodations: JSON.stringify(['Visual sound cards', 'amplified sounds for hearing support']),
      differentiationStrategies: JSON.stringify({
        support: 'Picture sound cards, simplified categories',
        extension: 'Create sound stories, identify sound sources',
        multiModal: 'Listening, visual cards, kinesthetic exploration'
      }),
      assessmentNotes: 'Observe listening skills and ability to distinguish different sounds',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: musicUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Finding the Beat',
      titleFr: 'Trouver le rythme',
      date: septDate(19),
      subject: 'Music',
      duration: 35,
      learningGoals: 'Students will feel and identify steady beat in music and demonstrate beat through movement and clapping.',
      mindsOn: 'Heartbeat exploration: Feel your heartbeat and march to its rhythm.',
      action: 'Beat activities with simple songs: clapping, tapping, walking to the beat.',
      consolidation: 'Beat circle where each student adds a beat pattern.',
      materials: JSON.stringify(['Rhythm sticks', 'drums', 'upbeat music', 'metronome']),
      grouping: 'Whole class movement, partner beat matching, individual beat patterns',
      accommodations: JSON.stringify(['Visual beat patterns', 'tactile rhythm instruments']),
      differentiationStrategies: JSON.stringify({
        support: 'Slow tempos, visual beat markers',
        extension: 'Complex beat patterns, beat conducting',
        multiModal: 'Movement, clapping, instruments, visual patterns'
      }),
      assessmentNotes: 'Track ability to maintain steady beat and rhythm accuracy',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: musicUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Our First Songs',
      titleFr: 'Nos premières chansons',
      date: septDate(26),
      subject: 'Music',
      duration: 35,
      learningGoals: 'Students will learn simple songs and practice singing together as a group.',
      mindsOn: 'Vocal warm-up: Siren sounds and animal voices to prepare for singing.',
      action: 'Learn "Hello Song" and "Cleanup Song" for daily routines. Practice singing together.',
      consolidation: 'Performance circle where each student sings their favorite line.',
      materials: JSON.stringify(['Song charts', 'simple instruments for accompaniment', 'microphone prop']),
      grouping: 'Whole class singing, small group practice, individual performances',
      accommodations: JSON.stringify(['Song picture books', 'signing support for non-verbal']),
      differentiationStrategies: JSON.stringify({
        support: 'Humming option, picture song support',
        extension: 'Harmony parts, song leadership',
        multiModal: 'Singing, movement, visual song charts'
      }),
      assessmentNotes: 'Observe singing participation and pitch exploration',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: musicUnit.id,
      userId: emily.id
    });

    // === OCTOBER MUSIC LESSONS ===

    lessons.push({
      title: 'High and Low Sounds',
      titleFr: 'Sons aigus et sons graves',
      date: octDate(3),
      subject: 'Music',
      duration: 35,
      learningGoals: 'Students will distinguish between high and low pitches and demonstrate understanding through voice and movement.',
      mindsOn: 'Animal voice exploration: Which animals have high voices? Low voices?',
      action: 'Pitch exploration with voice, xylophones, and movement (high = reach up, low = crouch down).',
      consolidation: 'High-low pitch story using voices and movements.',
      materials: JSON.stringify(['Xylophones', 'animal pictures', 'scarves for movement', 'pitch pipes']),
      grouping: 'Partner animal voices, small group instrument play, whole class story',
      accommodations: JSON.stringify(['Visual pitch representations', 'simplified high/low concepts']),
      differentiationStrategies: JSON.stringify({
        support: 'Clear visual models, exaggerated pitch differences',
        extension: 'Middle pitches, pitch patterns',
        multiModal: 'Voice, movement, instruments, visual cues'
      }),
      assessmentNotes: 'Assess understanding of pitch concepts and vocal exploration',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: musicUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Instrument Exploration',
      titleFr: 'Exploration des instruments',
      date: octDate(10),
      subject: 'Music',
      duration: 35,
      learningGoals: 'Students will explore different classroom instruments and learn proper care and playing techniques.',
      mindsOn: 'Mystery instrument game: Listen and guess which instrument is playing.',
      action: 'Instrument stations: shakers, drums, triangles, bells. Learn proper holding and playing.',
      consolidation: 'Instrument orchestra where everyone plays together.',
      materials: JSON.stringify(['Classroom instruments set', 'instrument care posters', 'conducting wand']),
      grouping: 'Station rotations, partner instrument sharing, whole class orchestra',
      accommodations: JSON.stringify(['Adapted grips for instruments', 'visual instrument guides']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple instruments first, guided practice',
        extension: 'Complex rhythms, instrument leadership',
        multiModal: 'Tactile exploration, auditory play, visual instruction'
      }),
      assessmentNotes: 'Observe instrument handling skills and musical exploration',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: musicUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Halloween Music and Movement',
      titleFr: 'Musique et mouvement d\'Halloween',
      date: octDate(24),
      subject: 'Music',
      duration: 35,
      learningGoals: 'Students will express creativity through Halloween-themed music and movement activities.',
      mindsOn: 'Spooky sounds creation: How can we make Halloween sounds with our voices?',
      action: 'Halloween song learning, spooky sound effects with instruments, costume movement dance.',
      consolidation: 'Halloween musical show for other classes.',
      materials: JSON.stringify(['Halloween music', 'sound effect instruments', 'simple costumes/props']),
      grouping: 'Creative individual expression, small group song practice, performance sharing',
      accommodations: JSON.stringify(['Non-scary alternatives', 'costume participation options']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple movements, familiar melodies',
        extension: 'Original spooky compositions, performance leadership',
        multiModal: 'Music, movement, dramatic play, instruments'
      }),
      assessmentNotes: 'Track creative expression and musical participation',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: musicUnit.id,
      userId: emily.id
    });

    // === NOVEMBER MUSIC LESSONS ===

    lessons.push({
      title: 'Loud and Soft Music',
      titleFr: 'Musique forte et douce',
      date: novDate(7),
      subject: 'Music',
      duration: 35,
      learningGoals: 'Students will understand dynamics (loud and soft) in music and demonstrate control in their musical expression.',
      mindsOn: 'Volume exploration: When do we use loud voices? Soft voices?',
      action: 'Dynamic activities: loud and soft singing, instrument volume control, movement to different dynamics.',
      consolidation: 'Dynamic story telling with musical accompaniment.',
      materials: JSON.stringify(['Various instruments', 'volume level cards', 'story book', 'dynamic symbols']),
      grouping: 'Whole class dynamics practice, partner volume matching, individual expression',
      accommodations: JSON.stringify(['Visual volume indicators', 'hearing support for volume levels']),
      differentiationStrategies: JSON.stringify({
        support: 'Clear visual cues, exaggerated dynamics',
        extension: 'Gradual volume changes, conducting dynamics',
        multiModal: 'Voice, instruments, movement, visual symbols'
      }),
      assessmentNotes: 'Observe understanding and control of musical dynamics',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: musicUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Thanksgiving Songs',
      titleFr: 'Chansons de l\'Action de grâce',
      date: novDate(14),
      subject: 'Music',
      duration: 35,
      learningGoals: 'Students will learn gratitude songs and express thankfulness through musical performance.',
      mindsOn: 'Gratitude circle: Share something you\'re thankful for with a musical voice.',
      action: 'Learn thanksgiving songs, create gratitude rhythm patterns, practice for family performance.',
      consolidation: 'Thanksgiving concert preparation and dress rehearsal.',
      materials: JSON.stringify(['Thanksgiving song books', 'rhythm instruments', 'gratitude props']),
      grouping: 'Circle sharing, whole class singing, small group rhythm sections',
      accommodations: JSON.stringify(['Gratitude expression alternatives', 'performance participation options']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple gratitude expressions, humming alternatives',
        extension: 'Harmony parts, gratitude song creation',
        multiModal: 'Singing, rhythm, movement, emotional expression'
      }),
      assessmentNotes: 'Assess musical expression of gratitude and performance skills',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: musicUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Fast and Slow Music',
      titleFr: 'Musique rapide et lente',
      date: novDate(21),
      subject: 'Music',
      duration: 35,
      learningGoals: 'Students will identify and demonstrate tempo (fast and slow) through movement and instrument play.',
      mindsOn: 'Tempo body exploration: Show me fast movements! Show me slow movements!',
      action: 'Tempo activities: fast and slow songs, instrument tempos, movement to different speeds.',
      consolidation: 'Tempo conducting game where students lead class tempo changes.',
      materials: JSON.stringify(['Songs of different tempos', 'metronome', 'conducting batons', 'tempo cards']),
      grouping: 'Individual tempo exploration, partner tempo matching, whole class conducting',
      accommodations: JSON.stringify(['Clear tempo demonstrations', 'visual tempo indicators']),
      differentiationStrategies: JSON.stringify({
        support: 'Exaggerated tempo differences, simple songs',
        extension: 'Gradual tempo changes, tempo composition',
        multiModal: 'Movement, instruments, voice, visual cues'
      }),
      assessmentNotes: 'Track understanding of tempo and ability to adjust to tempo changes',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: musicUnit.id,
      userId: emily.id
    });

    // === DECEMBER MUSIC LESSONS ===

    lessons.push({
      title: 'Holiday Songs Around the World',
      titleFr: 'Chansons de fête autour du monde',
      date: decDate(5),
      subject: 'Music',
      duration: 35,
      learningGoals: 'Students will learn holiday songs from different cultures and explore musical traditions.',
      mindsOn: 'Holiday music listening: What different holiday music can you recognize?',
      action: 'Learn simple holiday songs from various cultures, explore different instruments used in celebrations.',
      consolidation: 'Cultural holiday music sharing and appreciation circle.',
      materials: JSON.stringify(['Multicultural holiday music', 'world instrument pictures', 'globe/map']),
      grouping: 'Whole class listening, small group song learning, cultural sharing circle',
      accommodations: JSON.stringify(['Cultural sensitivity accommodations', 'participation alternatives']),
      differentiationStrategies: JSON.stringify({
        support: 'Familiar melody patterns, simple cultural concepts',
        extension: 'Cultural research, teach others about traditions',
        multiModal: 'Music, geography, cultural artifacts, singing'
      }),
      assessmentNotes: 'Observe cultural appreciation and musical learning',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: musicUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Winter Concert Preparation',
      titleFr: 'Préparation du concert d\'hiver',
      date: decDate(12),
      subject: 'Music',
      duration: 35,
      learningGoals: 'Students will prepare and practice for their winter concert performance, developing performance skills.',
      mindsOn: 'Performance readiness: What makes a good musical performance?',
      action: 'Concert song rehearsal, stage presence practice, audience etiquette learning.',
      consolidation: 'Dress rehearsal with feedback and encouragement.',
      materials: JSON.stringify(['Concert songs', 'performance props', 'microphones', 'stage area']),
      grouping: 'Whole class rehearsal, individual performance moments, audience practice',
      accommodations: JSON.stringify(['Performance alternatives', 'stage fright support']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple performance roles, buddy support',
        extension: 'Solo opportunities, performance leadership',
        multiModal: 'Singing, movement, stage presence, audience skills'
      }),
      assessmentNotes: 'Assess performance skills and musical growth over semester',
      assessmentType: 'summative',
      isSubFriendly: true,
      unitPlanId: musicUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Musical Memories and Growth',
      titleFr: 'Souvenirs musicaux et croissance',
      date: decDate(19),
      subject: 'Music',
      duration: 35,
      learningGoals: 'Students will reflect on their musical learning and growth throughout the semester.',
      mindsOn: 'Musical memory sharing: What is your favorite musical moment from this semester?',
      action: 'Musical portfolio creation, favorite song performances, musical goals for winter break.',
      consolidation: 'Musical celebration and sharing of growth with families.',
      materials: JSON.stringify(['Portfolio materials', 'musical memory books', 'celebration props']),
      grouping: 'Individual reflection, partner sharing, family celebration',
      accommodations: JSON.stringify(['Memory support materials', 'growth visualization aids']),
      differentiationStrategies: JSON.stringify({
        support: 'Guided reflection, simple growth identification',
        extension: 'Detailed musical analysis, goal setting',
        multiModal: 'Reflection, performance, visual portfolios, celebration'
      }),
      assessmentNotes: 'Document musical growth and enthusiasm for continued learning',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: musicUnit.id,
      userId: emily.id
    });

    // Insert all lessons
    console.log(`🎵 Creating ${lessons.length} Music lessons...`);
    
    let created = 0;
    for (const lesson of lessons) {
      try {
        await prisma.eTFOLessonPlan.create({
          data: lesson
        });
        created++;
        console.log(`✅ Created: ${lesson.titleFr} - ${lesson.date.toDateString()}`);
      } catch (error: any) {
        console.error(`❌ Failed to create ${lesson.titleFr}: ${error.message}`);
      }
    }

    console.log('\n✅ Music lesson seeding complete!');
    console.log(`📊 Total created: ${created}/${lessons.length} lessons`);
    console.log('📅 Coverage: September-December 2025');
    console.log('🎯 Focus: Rhythm, melody, singing, instruments, musical expression');
    console.log('⏰ Duration: 35 minutes each (appropriate for Grade 1)');

  } catch (error) {
    console.error('❌ Error seeding Music lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedMusicLessons()
  .then(() => {
    console.log('✅ All Music lessons seeded successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Music seeding failed:', error);
    process.exit(1);
  });