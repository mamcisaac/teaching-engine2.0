#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedEnhancedMusicLessons() {
  console.log('🎵 Seeding ENHANCED Music Lessons September-December 2025 (45-minute format)...\n');

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

    // Create or find Music unit plan for Sept-Dec
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

    // Helper functions for Tuesday/Thursday schedule
    const getMusicDates = (month: number, year: number = 2025) => {
      const dates = [];
      const daysInMonth = new Date(year, month, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        // Tuesday = 2, Thursday = 4
        if (date.getDay() === 2 || date.getDay() === 4) {
          dates.push(new Date(date));
        }
      }
      return dates;
    };

    // Get music dates for fall semester
    const septDates = getMusicDates(9, 2025).slice(1); // Start after Sept 4
    const octDates = getMusicDates(10, 2025);
    const novDates = getMusicDates(11, 2025);
    const decDates = getMusicDates(12, 2025).slice(0, 6); // Up to winter break

    // === SEPTEMBER MUSIC LESSONS (Unit 1: Discovering Musical Play) ===
    
    lessons.push({
      title: 'Exploring Sounds Around Us',
      titleFr: 'Explorer les sons autour de nous',
      date: septDates[0],
      subject: 'Music',
      duration: 45,
      learningGoals: 'Students will identify and categorize different sounds in their environment and understand the difference between sound and silence.',
      mindsOn: 'Sound walk exploration: Listen carefully and identify sounds in our school, nature, and community. Practice active listening.',
      action: 'Extended sound sorting activity: natural vs. human-made sounds. Create detailed sound maps of classroom and outdoor spaces. Sound memory game and sound storytelling.',
      consolidation: 'Share favorite sounds discovered and demonstrate making them with body, voice, and simple instruments. Create class sound story.',
      materials: JSON.stringify(['Recording device', 'sound identification cards', 'chart paper', 'various sound makers', 'nature exploration materials', 'sound story props']),
      grouping: 'Whole class sound exploration, partner sound sorting, individual sharing, small group sound stories',
      accommodations: JSON.stringify(['Visual sound cards', 'amplified sounds for hearing support', 'tactile sound exploration options']),
      differentiationStrategies: JSON.stringify({
        support: 'Picture sound cards, simplified categories, guided exploration',
        extension: 'Create complex sound stories, identify sound sources and environments, sound classification systems',
        multiModal: 'Listening, visual cards, kinesthetic exploration, dramatic sound play'
      }),
      assessmentNotes: 'Observe listening skills, ability to distinguish different sounds, and creative sound expression',
      assessmentType: 'formative',
      isSubFriendly: true,
      curriculumExpectations: 'CC 1.1, ME 1 - Create music using voice and body, demonstrate musical elements through play',
      unitPlanId: musicUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Our Musical Bodies',
      titleFr: 'Nos corps musicaux',
      date: septDates[1],
      subject: 'Music',
      duration: 45,
      learningGoals: 'Students will discover how to make music using different parts of their body as instruments and explore body percussion techniques.',
      mindsOn: 'Extended body percussion warm-up: Clap, pat, stomp, snap - explore all the sounds our bodies can make. Body sound scavenger hunt.',
      action: 'Comprehensive body percussion exploration: clapping patterns, foot stomping rhythms, finger snapping, tongue clicking, chest patting. Create individual body percussion compositions and practice ensemble coordination.',
      consolidation: 'Body percussion concert where students perform solo and ensemble pieces. Teach body percussion patterns to each other.',
      materials: JSON.stringify(['Body percussion chart', 'rhythm cards', 'mirrors for self-observation', 'body percussion notation sheets', 'recording equipment']),
      grouping: 'Individual exploration, partner body percussion, small group ensembles, whole class coordination',
      accommodations: JSON.stringify(['Modified movement options', 'visual rhythm supports', 'alternative body percussion adaptations']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple body sounds, visual modeling, guided practice with peer support',
        extension: 'Complex body percussion compositions, teach others, create notation systems for body percussion',
        multiModal: 'Kinesthetic, auditory, visual notation, creative composition'
      }),
      assessmentNotes: 'Assess body percussion skills, rhythm accuracy, and creative musical expression using the body',
      assessmentType: 'formative',
      isSubFriendly: true,
      curriculumExpectations: 'CC 1.1, ME 1 - Create music using body as instrument, demonstrate rhythm and musical elements',
      unitPlanId: musicUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Finding the Beat',
      titleFr: 'Trouver le rythme',
      date: septDates[2],
      subject: 'Music',
      duration: 45,
      learningGoals: 'Students will feel and identify steady beat in music, demonstrate beat through movement and clapping, and understand tempo variations.',
      mindsOn: 'Extended heartbeat exploration: Feel heartbeat, march to its rhythm, explore how heartbeat changes with activity. Compare to musical beats.',
      action: 'Comprehensive beat activities with multiple songs of different styles: clapping, tapping, walking to beat. Practice maintaining beat during tempo changes. Use instruments to reinforce steady beat.',
      consolidation: 'Beat mastery circle where each student demonstrates steady beat proficiency and adds creative beat patterns to class composition.',
      materials: JSON.stringify(['Rhythm sticks', 'drums', 'varied tempo music', 'metronome', 'scarves for movement', 'beat tracking charts', 'heart rate monitors (optional)']),
      grouping: 'Whole class movement activities, partner beat matching, individual beat mastery demonstration, ensemble coordination',
      accommodations: JSON.stringify(['Visual beat patterns', 'tactile rhythm instruments', 'movement modifications', 'beat visualization tools']),
      differentiationStrategies: JSON.stringify({
        support: 'Slow tempos, visual beat markers, guided practice with physical support',
        extension: 'Complex beat patterns, beat conducting, polyrhythmic exploration, teaching beat to others',
        multiModal: 'Movement, clapping, instruments, visual patterns, mathematical beat counting'
      }),
      assessmentNotes: 'Track ability to maintain steady beat, adapt to tempo changes, and demonstrate rhythm accuracy',
      assessmentType: 'formative',
      isSubFriendly: true,
      curriculumExpectations: 'ME 1, MA 1.1 - Demonstrate musical elements through beat, proper percussion instrument technique',
      unitPlanId: musicUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Voice Adventures',
      titleFr: 'Aventures vocales',
      date: septDates[3],
      subject: 'Music',
      duration: 45,
      learningGoals: 'Students will explore the full range and possibilities of their singing voice through comprehensive vocal exercises and creative expression.',
      mindsOn: 'Extended vocal warm-up: Siren sounds, animal voices, whisper-to-shout exploration, vocal range discovery. Breathing exercises for singing.',
      action: 'Comprehensive voice exploration: high/low sirens, animal sound stories, echo games with varied dynamics, whispering songs, volume control exercises, pitch matching games. Explore singing vs. speaking voice.',
      consolidation: 'Voice showcase performance where students demonstrate their vocal discoveries and teach favorite vocal techniques to classmates.',
      materials: JSON.stringify(['Animal voice cards', 'pitch pipes', 'vocal range posters', 'microphone props', 'breathing exercise guides', 'voice exploration recording sheets']),
      grouping: 'Individual vocal exploration, partner voice games, small group animal voice stories, whole class singing circle',
      accommodations: JSON.stringify(['Alternative vocal expression options', 'volume control supports', 'breathing assistance techniques']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple vocal sounds, guided breathing, visual pitch representations, peer voice modeling',
        extension: 'Advanced vocal techniques, voice teaching leadership, creative vocal compositions, extended range exploration',
        multiModal: 'Vocal, visual pitch representation, kinesthetic breathing, creative dramatic expression'
      }),
      assessmentNotes: 'Observe vocal exploration, pitch accuracy, creative vocal expression, and singing voice development',
      assessmentType: 'formative',
      isSubFriendly: true,
      curriculumExpectations: 'MA 1.2, CC 1.1 - Demonstrate voice in various contexts through musical play, create music using voice',
      unitPlanId: musicUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Our First Songs',
      titleFr: 'Nos premières chansons',
      date: septDates[4],
      subject: 'Music',
      duration: 45,
      learningGoals: 'Students will learn multiple simple songs, practice unison singing, and develop ensemble singing skills while building classroom musical community.',
      mindsOn: 'Extended song memory exploration: Share known songs, sing favorite lines, explore different types of songs (lullabies, work songs, play songs).',
      action: 'Learn comprehensive set of classroom routine songs: "Hello Song," "Cleanup Song," "Transition Song," and "Goodbye Song." Practice unison singing, listening while singing, and basic harmony introduction.',
      consolidation: 'Classroom song concert where small groups perform different routine songs and teach songs to other classes.',
      materials: JSON.stringify(['Comprehensive song charts', 'simple instruments for accompaniment', 'song picture books', 'harmony practice recordings', 'microphone props', 'song notation examples']),
      grouping: 'Whole class unison singing, small group song practice, partner harmony attempts, individual song leadership',
      accommodations: JSON.stringify(['Song picture books', 'signing support for non-verbal students', 'humming alternatives', 'rhythm instrument participation']),
      differentiationStrategies: JSON.stringify({
        support: 'Humming participation, picture song support, echo singing with teacher support',
        extension: 'Simple harmony parts, song leadership roles, teaching songs to others, creating additional verses',
        multiModal: 'Singing, movement to songs, visual song charts, instrumental accompaniment'
      }),
      assessmentNotes: 'Observe singing participation, pitch exploration, unison singing skills, and musical community building',
      assessmentType: 'formative',
      isSubFriendly: true,
      curriculumExpectations: 'MA 1.2, SP 1 - Demonstrate voice in variety of contexts, perform musical pieces for audiences',
      unitPlanId: musicUnit.id,
      userId: emily.id
    });

    // === OCTOBER MUSIC LESSONS (Unit 2: Rhythm and Movement) ===

    lessons.push({
      title: 'High and Low Sounds',
      titleFr: 'Sons aigus et sons graves',
      date: octDates[0],
      subject: 'Music',
      duration: 45,
      learningGoals: 'Students will distinguish between high and low pitches, demonstrate understanding through voice and movement, and explore pitch relationships.',
      mindsOn: 'Extended animal voice exploration: Comprehensive study of animal voices - elephants, mice, birds, whales. Create animal voice stories and pitch comparisons.',
      action: 'Comprehensive pitch exploration with voice, xylophones, and movement (high = reach up, low = crouch down). Pitch matching games, vocal glides, pitch pattern creation, and instrument pitch exploration.',
      consolidation: 'High-low pitch story performance using voices and movements to tell musical tales. Pitch discovery showcase.',
      materials: JSON.stringify(['Xylophones', 'comprehensive animal pictures', 'scarves for movement', 'pitch pipes', 'high/low visual cards', 'pitch notation introduction sheets']),
      grouping: 'Partner animal voice exploration, small group instrument pitch play, whole class story creation, individual pitch discovery',
      accommodations: JSON.stringify(['Visual pitch representations', 'simplified high/low concepts', 'movement adaptations', 'pitch visualization tools']),
      differentiationStrategies: JSON.stringify({
        support: 'Clear visual models, exaggerated pitch differences, guided vocal exploration',
        extension: 'Middle pitches exploration, pitch patterns creation, pitch interval recognition, teaching pitch concepts',
        multiModal: 'Voice, movement, instruments, visual cues, dramatic animal expression'
      }),
      assessmentNotes: 'Assess pitch discrimination, vocal exploration, and understanding of high/low pitch concepts',
      assessmentType: 'formative',
      isSubFriendly: true,
      curriculumExpectations: 'ME 1, MA 1.2 - Demonstrate musical elements through pitch exploration, voice in various contexts',
      unitPlanId: musicUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Rhythm Patterns Creation',
      titleFr: 'Création de motifs rythmiques',
      date: octDates[1],
      subject: 'Music',
      duration: 45,
      learningGoals: 'Students will create, perform, and teach simple rhythm patterns using body percussion, voice, and instruments.',
      mindsOn: 'Extended name rhythm exploration: Clap syllables in full names, family names, favorite foods. Create rhythm pattern families.',
      action: 'Comprehensive rhythm pattern creation using body percussion, transfer to various instruments. Pattern echo games, rhythm composition, rhythm pattern layering, and ensemble coordination.',
      consolidation: 'Rhythm pattern festival where students teach their patterns to classmates and create class rhythm compositions.',
      materials: JSON.stringify(['Complete rhythm instrument set', 'pattern notation cards', 'name rhythm sheets', 'recording equipment', 'rhythm composition books', 'pattern layering charts']),
      grouping: 'Individual pattern creation, partner rhythm sharing, small group pattern ensembles, whole class rhythm orchestras',
      accommodations: JSON.stringify(['Visual rhythm patterns', 'simplified rhythm notation', 'alternative rhythm expression methods']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple rhythm patterns, visual rhythm supports, guided pattern creation',
        extension: 'Complex rhythm compositions, teaching others, rhythm pattern conducting, polyrhythmic exploration',
        multiModal: 'Kinesthetic rhythm, auditory pattern recognition, visual notation, creative composition'
      }),
      assessmentNotes: 'Track rhythm pattern creation, performance accuracy, and teaching abilities',
      assessmentType: 'formative',
      isSubFriendly: true,
      curriculumExpectations: 'CC 1.1, ME 1, MA 1.1 - Create music with instruments, demonstrate rhythm elements, percussion technique',
      unitPlanId: musicUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Instrument Exploration',
      titleFr: 'Exploration des instruments',
      date: octDates[2],
      subject: 'Music',
      duration: 45,
      learningGoals: 'Students will explore different classroom instruments, learn proper care and advanced playing techniques, and understand instrument families.',
      mindsOn: 'Extended mystery instrument game: Listen and guess instruments, explore how instruments make sounds, discuss instrument care and respect.',
      action: 'Comprehensive instrument station exploration: shakers, drums, triangles, bells, wood blocks, xylophones. Learn proper holding, playing techniques, instrument care, and creative sound exploration.',
      consolidation: 'Grand instrument orchestra where everyone plays together with advanced conductor signals, dynamics, and ensemble coordination.',
      materials: JSON.stringify(['Complete classroom instrument set', 'instrument care posters', 'conducting wands', 'station rotation cards', 'instrument family charts', 'technique instruction cards']),
      grouping: 'Station rotations with extended time, partner instrument exploration, small group instrument families, whole class orchestra',
      accommodations: JSON.stringify(['Adapted grips for instruments', 'visual instrument guides', 'alternative playing techniques']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple instruments first, guided practice, peer instrument buddies',
        extension: 'Complex rhythms, instrument leadership, advanced techniques, teaching instrument care',
        multiModal: 'Tactile exploration, auditory experimentation, visual instruction, kinesthetic technique'
      }),
      assessmentNotes: 'Observe instrument handling skills, musical exploration creativity, and ensemble participation',
      assessmentType: 'formative',
      isSubFriendly: true,
      curriculumExpectations: 'MA 1.1, CC 1.1 - Demonstrate proper percussion technique, create music with instruments',
      unitPlanId: musicUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Movement to Music',
      titleFr: 'Mouvement sur la musique',
      date: octDates[3],
      subject: 'Music',
      duration: 45,
      learningGoals: 'Students will move their bodies rhythmically to different styles of music, showing beat, expression, and cultural understanding.',
      mindsOn: 'Extended movement exploration: Statue dance with multiple music styles, body movement discovery, cultural movement introduction.',
      action: 'Comprehensive creative movement to various musical styles: marching, swaying, bouncing, cultural dances. Use movement props, explore different cultural movement styles, and create original movement compositions.',
      consolidation: 'Movement showcase where students demonstrate favorite movements and teach movement styles to classmates.',
      materials: JSON.stringify(['Diverse musical styles collection', 'movement props (scarves, ribbons, bells)', 'open space setup', 'emotion cards', 'cultural movement guides']),
      grouping: 'Individual movement exploration, partner movement creation, cultural movement groups, whole class movement celebration',
      accommodations: JSON.stringify(['Movement modifications', 'alternative expression methods', 'seating movement options']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple movements, guided exploration, movement modeling',
        extension: 'Complex choreography, movement leadership, cultural movement research, teaching others',
        multiModal: 'Kinesthetic expression, musical listening, cultural exploration, creative choreography'
      }),
      assessmentNotes: 'Track musical movement skills, creative expression, and cultural movement understanding',
      assessmentType: 'formative',
      isSubFriendly: true,
      curriculumExpectations: 'ME 1, CCC 1 - Demonstrate musical elements through movement, understand diverse musical styles',
      unitPlanId: musicUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Fast and Slow Music',
      titleFr: 'Musique rapide et lente',
      date: octDates[4],
      subject: 'Music',
      duration: 45,
      learningGoals: 'Students will identify and demonstrate tempo variations through movement, instruments, vocal expression, and conducting.',
      mindsOn: 'Extended tempo body exploration: Show fast/slow movements, explore how tempo affects emotions, practice gradual tempo changes.',
      action: 'Comprehensive tempo activities: fast and slow songs, instrument tempo exploration, movement to different speeds, tempo conducting practice, gradual tempo changes (accelerando/ritardando).',
      consolidation: 'Tempo mastery demonstration where students conduct class tempo changes and create tempo transformation performances.',
      materials: JSON.stringify(['Songs of different tempos', 'metronome', 'conducting batons', 'tempo cards', 'movement space', 'tempo change music examples']),
      grouping: 'Individual tempo exploration, partner tempo matching, small group tempo conducting, whole class tempo coordination',
      accommodations: JSON.stringify(['Clear tempo demonstrations', 'visual tempo indicators', 'movement adaptations']),
      differentiationStrategies: JSON.stringify({
        support: 'Exaggerated tempo differences, simple songs, visual tempo cues',
        extension: 'Gradual tempo changes, tempo composition, advanced conducting, teaching tempo concepts',
        multiModal: 'Movement, instruments, voice, visual cues, conducting gestures'
      }),
      assessmentNotes: 'Track understanding of tempo, ability to adjust to tempo changes, and conducting skills',
      assessmentType: 'formative',
      isSubFriendly: true,
      curriculumExpectations: 'ME 1, MA 1.1, MA 1.2 - Demonstrate tempo elements, instrument technique, voice variety',
      unitPlanId: musicUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Halloween Music and Movement',
      titleFr: 'Musique et mouvement d\'Halloween',
      date: octDates[5],
      subject: 'Music',
      duration: 45,
      learningGoals: 'Students will express creativity through Halloween-themed music and movement while exploring cultural traditions and creative composition.',
      mindsOn: 'Extended spooky sounds creation: How can we make Halloween sounds with voices, instruments, and body? Explore cultural Halloween traditions through music.',
      action: 'Comprehensive Halloween musical experience: learn Halloween songs from different cultures, create elaborate spooky sound effects with instruments, costume movement dance, compose Halloween soundscapes.',
      consolidation: 'Grand Halloween musical show for multiple classes featuring songs, sounds, movement, and student-created compositions.',
      materials: JSON.stringify(['Multicultural Halloween music collection', 'comprehensive sound effect instruments', 'costume props', 'spooky story books', 'composition materials']),
      grouping: 'Creative individual expression, small group song practice, cultural exploration groups, large performance sharing',
      accommodations: JSON.stringify(['Non-scary alternatives', 'costume participation options', 'cultural sensitivity supports']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple movements, familiar melodies, non-frightening participation options',
        extension: 'Original spooky compositions, performance leadership, cultural Halloween research, advanced sound effects',
        multiModal: 'Music, movement, dramatic play, instruments, cultural exploration, creative composition'
      }),
      assessmentNotes: 'Track creative expression, cultural understanding, musical participation, and composition skills',
      assessmentType: 'formative',
      isSubFriendly: true,
      curriculumExpectations: 'CC 1.1, SP 1, CCC 1 - Create music creatively, perform for audiences, understand cultural contexts',
      unitPlanId: musicUnit.id,
      userId: emily.id
    });

    // === NOVEMBER MUSIC LESSONS (Unit 2 continued & Unit 3 begins) ===

    lessons.push({
      title: 'Loud and Soft Music',
      titleFr: 'Musique forte et douce',
      date: novDates[0],
      subject: 'Music',
      duration: 45,
      learningGoals: 'Students will understand dynamics (loud and soft) and demonstrate advanced control in their musical expression through voice, instruments, and movement.',
      mindsOn: 'Extended volume exploration: When do we use loud/soft voices in daily life? Explore natural dynamics, practice gradual volume changes (crescendo/diminuendo).',
      action: 'Comprehensive dynamic activities: loud/soft singing with emotional expression, instrument volume control mastery, movement to different dynamics, dynamic conducting, storytelling with dynamic musical accompaniment.',
      consolidation: 'Dynamic mastery concert featuring dynamic story telling with sophisticated musical accompaniment and student-led dynamic conducting.',
      materials: JSON.stringify(['Various instruments', 'volume level cards', 'story books', 'dynamic symbols', 'conducting gestures chart', 'dynamic practice recordings']),
      grouping: 'Whole class dynamics practice, partner volume matching, individual dynamic expression, ensemble dynamic coordination',
      accommodations: JSON.stringify(['Visual volume indicators', 'hearing support for volume levels', 'alternative dynamic expression methods']),
      differentiationStrategies: JSON.stringify({
        support: 'Clear visual cues, exaggerated dynamics, guided practice',
        extension: 'Gradual volume changes, conducting dynamics, creating dynamic compositions, teaching dynamic concepts',
        multiModal: 'Voice, instruments, movement, visual symbols, conducting gestures'
      }),
      assessmentNotes: 'Observe understanding and sophisticated control of musical dynamics in various contexts',
      assessmentType: 'formative',
      isSubFriendly: true,
      curriculumExpectations: 'ME 1, MA 1.1, MA 1.2 - Demonstrate dynamic elements, instrument control, voice variety',
      unitPlanId: musicUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Thanksgiving Songs',
      titleFr: 'Chansons de l\'Action de grâce',
      date: novDates[1],
      subject: 'Music',
      duration: 45,
      learningGoals: 'Students will learn gratitude songs, express thankfulness through musical performance, and understand Thanksgiving traditions through music from various cultures.',
      mindsOn: 'Extended gratitude circle: Share thankfulness with musical voices, explore gratitude traditions from different cultures, practice expressing emotions through music.',
      action: 'Comprehensive Thanksgiving musical experience: learn traditional and multicultural gratitude songs, create gratitude rhythm patterns, practice harmony singing, prepare elaborate family performance with staging.',
      consolidation: 'Grand Thanksgiving concert with full staging, harmony parts, and cultural gratitude celebration for families and community.',
      materials: JSON.stringify(['Multicultural Thanksgiving song books', 'rhythm instruments', 'gratitude props', 'harmony practice tracks', 'staging materials', 'cultural gratitude materials']),
      grouping: 'Circle sharing, whole class harmony singing, small group rhythm sections, cultural gratitude exploration groups',
      accommodations: JSON.stringify(['Gratitude expression alternatives', 'performance participation options', 'cultural sensitivity supports']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple gratitude expressions, humming alternatives, guided participation',
        extension: 'Complex harmony parts, gratitude song creation, cultural gratitude research, performance leadership',
        multiModal: 'Singing, rhythm, movement, emotional expression, cultural exploration'
      }),
      assessmentNotes: 'Assess musical expression of gratitude, performance skills, and cultural understanding',
      assessmentType: 'formative',
      isSubFriendly: true,
      curriculumExpectations: 'MA 1.2, SP 1, CCC 1 - Voice demonstration, performance for audiences, cultural contexts',
      unitPlanId: musicUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Musical Memories and Growth',
      titleFr: 'Souvenirs musicaux et croissance',
      date: novDates[2],
      subject: 'Music',
      duration: 45,
      learningGoals: 'Students will reflect on their musical learning and growth, create musical portfolios, and set goals for continued musical development.',
      mindsOn: 'Extended musical memory sharing: What are your favorite musical moments? How have you grown as a musician? What musical goals do you have?',
      action: 'Comprehensive musical portfolio creation: collect favorite song recordings, rhythm compositions, musical drawings, growth reflections. Practice favorite song performances and set musical goals.',
      consolidation: 'Musical growth celebration and portfolio sharing with families, featuring performance demonstrations of musical growth.',
      materials: JSON.stringify(['Portfolio materials', 'musical memory books', 'celebration props', 'recording equipment', 'growth charts', 'goal-setting materials']),
      grouping: 'Individual reflection, partner sharing, small group portfolio review, family celebration presentation',
      accommodations: JSON.stringify(['Memory support materials', 'growth visualization aids', 'alternative portfolio formats']),
      differentiationStrategies: JSON.stringify({
        support: 'Guided reflection, simple growth identification, portfolio creation assistance',
        extension: 'Detailed musical analysis, advanced goal setting, peer portfolio mentoring, musical growth presentations',
        multiModal: 'Reflection, performance, visual portfolios, celebration, goal-setting'
      }),
      assessmentNotes: 'Document comprehensive musical growth, enthusiasm for continued learning, and self-reflection skills',
      assessmentType: 'formative',
      isSubFriendly: true,
      curriculumExpectations: 'RRA 1, SP 1 - Refine performances using creative process, perform growth for audiences',
      unitPlanId: musicUnit.id,
      userId: emily.id
    });

    // === DECEMBER MUSIC LESSONS (Unit 3: Songs and Stories) ===

    lessons.push({
      title: 'Holiday Songs Around the World',
      titleFr: 'Chansons de fête autour du monde',
      date: decDates[0],
      subject: 'Music',
      duration: 45,
      learningGoals: 'Students will learn holiday songs from different cultures, explore musical traditions, and develop cultural appreciation through music.',
      mindsOn: 'Extended holiday music listening tour: Comprehensive exploration of holiday music from around the world, cultural context discussions, respectful tradition sharing.',
      action: 'Learn diverse holiday songs from various cultures, explore different instruments used in global celebrations, understand cultural significance of holiday music, practice respectful cultural sharing.',
      consolidation: 'Multicultural holiday music celebration and appreciation circle with respectful cultural discussion and global holiday music concert.',
      materials: JSON.stringify(['Comprehensive multicultural holiday music', 'world instrument pictures', 'globe/map', 'cultural artifacts', 'holiday tradition materials']),
      grouping: 'Whole class listening, cultural exploration groups, small group song learning, respectful cultural sharing circles',
      accommodations: JSON.stringify(['Cultural sensitivity accommodations', 'participation alternatives', 'inclusive holiday options']),
      differentiationStrategies: JSON.stringify({
        support: 'Familiar melody patterns, simple cultural concepts, guided cultural exploration',
        extension: 'Cultural research projects, teach others about traditions, advanced cultural music analysis',
        multiModal: 'Music, geography, cultural artifacts, singing, respectful cultural exploration'
      }),
      assessmentNotes: 'Observe cultural appreciation, musical learning, and respectful cultural understanding',
      assessmentType: 'formative',
      isSubFriendly: true,
      curriculumExpectations: 'CCC 1, MA 1.2, SP 1 - Cultural contexts understanding, voice variety, performance',
      unitPlanId: musicUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Winter Concert Preparation',
      titleFr: 'Préparation du concert d\'hiver',
      date: decDates[1],
      subject: 'Music',
      duration: 45,
      learningGoals: 'Students will prepare and practice for their winter concert performance, developing advanced performance skills and stage presence.',
      mindsOn: 'Extended performance readiness discussion: What makes an excellent musical performance? How do we prepare our best music? Practice performance anxiety management.',
      action: 'Comprehensive concert preparation: song rehearsal with staging, advanced stage presence practice, audience etiquette learning, ensemble coordination, technical rehearsal with sound system.',
      consolidation: 'Full dress rehearsal with complete staging, feedback sessions, encouragement circle, and final preparation for family concert.',
      materials: JSON.stringify(['Concert songs', 'performance props', 'microphones', 'stage area', 'performance outfits', 'staging equipment', 'sound system']),
      grouping: 'Whole class rehearsal, individual performance moments, small group staging practice, audience etiquette practice',
      accommodations: JSON.stringify(['Performance alternatives', 'stage fright support', 'alternative participation options']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple performance roles, buddy support, familiar songs, stage comfort techniques',
        extension: 'Solo opportunities, performance leadership, advanced staging, concert production assistance',
        multiModal: 'Singing, movement, stage presence, technical production, audience skills'
      }),
      assessmentNotes: 'Assess comprehensive performance skills, musical growth demonstration, and concert readiness',
      assessmentType: 'summative',
      isSubFriendly: true,
      curriculumExpectations: 'SP 1, MA 1.2, RRA 1 - Perform for audiences, voice demonstration, refine performances',
      unitPlanId: musicUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Musical Gift Creation',
      titleFr: 'Création de cadeaux musicaux',
      date: decDates[2],
      subject: 'Music',
      duration: 45,
      learningGoals: 'Students will create musical gifts for families and friends, understanding music as a way to express care and bring joy to others.',
      mindsOn: 'Extended musical gift exploration: How can we give the gift of music? What musical gifts can we create for people we care about?',
      action: 'Comprehensive musical gift creation: record personalized songs, create handmade instruments, compose musical greeting cards, prepare surprise musical performances.',
      consolidation: 'Musical gift-giving celebration where students present their musical gifts and share the joy of musical giving.',
      materials: JSON.stringify(['Recording equipment', 'instrument-making materials', 'greeting card supplies', 'gift wrapping materials', 'performance setup']),
      grouping: 'Individual gift creation, partner gift collaboration, small group gift projects, family gift-giving celebration',
      accommodations: JSON.stringify(['Alternative gift creation options', 'assistance with recording/creating', 'various gift format options']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple gift creation, guided recording, gift-making assistance',
        extension: 'Complex musical gifts, multiple gift creation, gift presentation leadership, teaching gift-making',
        multiModal: 'Creative arts, recording technology, performance, caring expression'
      }),
      assessmentNotes: 'Assess creative musical expression, gift-giving understanding, and musical care for others',
      assessmentType: 'formative',
      isSubFriendly: true,
      curriculumExpectations: 'CC 1.1, SP 1, CC 1.2 - Create meaningful music, perform as gifts, compose musical ideas',
      unitPlanId: musicUnit.id,
      userId: emily.id
    });

    // Insert all lessons
    console.log(`🎵 Creating ${lessons.length} enhanced Music lessons for fall semester...`);
    
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

    console.log('\n✅ Enhanced Music lesson seeding complete!');
    console.log(`📊 Total created: ${created}/${lessons.length} lessons`);
    console.log('📅 Coverage: September-December 2025 (Enhanced)');
    console.log('🎯 Focus: Comprehensive music education with expanded activities');
    console.log('⏰ Duration: 45 minutes each (upgraded from 35 minutes)');
    console.log('🌍 Curriculum: Covers CC 1.1, CC 1.2, ME 1, MA 1.1, MA 1.2, CCC 1, SP 1, RRA 1');
    console.log('🎵 Features: Bilingual titles, cultural integration, comprehensive activities');

  } catch (error) {
    console.error('❌ Error seeding enhanced Music lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedEnhancedMusicLessons()
  .then(() => {
    console.log('✅ All enhanced Music lessons seeded successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Enhanced Music seeding failed:', error);
    process.exit(1);
  });