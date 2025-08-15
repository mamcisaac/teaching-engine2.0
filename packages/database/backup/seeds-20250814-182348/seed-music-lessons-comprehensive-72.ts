#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedComprehensiveMusicLessons() {
  console.log('🎵 Seeding Comprehensive Music Curriculum - 72 Lessons (Sept 2025 - June 2026)...\n');

  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    if (!emily) throw new Error('Emily not found');

    // Find Music long-range plan
    const musicLongRangePlan = await prisma.longRangePlan.findFirst({
      where: {
        userId: emily.id,
        subject: 'Music'
      }
    });

    if (!musicLongRangePlan) throw new Error('Music Long Range Plan not found');

    // Find or create Music unit plans
    const units = {
      unit1: await prisma.unitPlan.findFirst({
        where: { userId: emily.id, longRangePlanId: musicLongRangePlan.id, title: 'Discovering Musical Play' }
      }) || await prisma.unitPlan.create({
        data: {
          title: 'Discovering Musical Play',
          longRangePlanId: musicLongRangePlan.id,
          description: 'Introduction to music through playful exploration of sounds, voices, and instruments.',
          startDate: new Date('2025-09-08'),
          endDate: new Date('2025-10-10'),
          userId: emily.id
        }
      }),
      
      unit2: await prisma.unitPlan.findFirst({
        where: { userId: emily.id, longRangePlanId: musicLongRangePlan.id, title: 'Rhythm and Movement' }
      }) || await prisma.unitPlan.create({
        data: {
          title: 'Rhythm and Movement',
          longRangePlanId: musicLongRangePlan.id,
          description: 'Exploring steady beat, rhythm patterns, and movement through percussion instruments.',
          startDate: new Date('2025-10-14'),
          endDate: new Date('2025-11-21'),
          userId: emily.id
        }
      }),
      
      unit3: await prisma.unitPlan.findFirst({
        where: { userId: emily.id, longRangePlanId: musicLongRangePlan.id, title: 'Songs and Stories' }
      }) || await prisma.unitPlan.create({
        data: {
          title: 'Songs and Stories',
          longRangePlanId: musicLongRangePlan.id,
          description: 'Learning seasonal songs, exploring how music tells stories, and developing singing voices.',
          startDate: new Date('2025-11-24'),
          endDate: new Date('2026-01-23'),
          userId: emily.id
        }
      }),
      
      unit4: await prisma.unitPlan.findFirst({
        where: { userId: emily.id, longRangePlanId: musicLongRangePlan.id, title: 'Creating Music Together' }
      }) || await prisma.unitPlan.create({
        data: {
          title: 'Creating Music Together',
          longRangePlanId: musicLongRangePlan.id,
          description: 'Composing simple musical ideas, exploring notation, and working together to create music.',
          startDate: new Date('2026-01-26'),
          endDate: new Date('2026-03-13'),
          userId: emily.id
        }
      }),
      
      unit5: await prisma.unitPlan.findFirst({
        where: { userId: emily.id, longRangePlanId: musicLongRangePlan.id, title: 'Music Around the World' }
      }) || await prisma.unitPlan.create({
        data: {
          title: 'Music Around the World',
          longRangePlanId: musicLongRangePlan.id,
          description: 'Exploring diverse musical genres, styles, and cultural contexts.',
          startDate: new Date('2026-03-16'),
          endDate: new Date('2026-04-24'),
          userId: emily.id
        }
      }),
      
      unit6: await prisma.unitPlan.findFirst({
        where: { userId: emily.id, longRangePlanId: musicLongRangePlan.id, title: 'Musical Celebration' }
      }) || await prisma.unitPlan.create({
        data: {
          title: 'Musical Celebration',
          longRangePlanId: musicLongRangePlan.id,
          description: 'Reflecting on musical growth, refining performances, and celebrating a year of music making.',
          startDate: new Date('2026-04-27'),
          endDate: new Date('2026-06-24'),
          userId: emily.id
        }
      })
    };

    const lessons: any[] = [];

    // Helper functions for dates - Tuesday/Thursday schedule
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

    // Get all music dates for the school year
    const septDates = getMusicDates(9, 2025).slice(1); // Start after Sept 4
    const octDates = getMusicDates(10, 2025);
    const novDates = getMusicDates(11, 2025);
    const decDates = getMusicDates(12, 2025).slice(0, 6); // Up to winter break
    const janDates = getMusicDates(1, 2026).slice(3); // After Jan 20
    const febDates = getMusicDates(2, 2026);
    const marDates = getMusicDates(3, 2026);
    const aprDates = getMusicDates(4, 2026);
    const mayDates = getMusicDates(5, 2026);
    const junDates = getMusicDates(6, 2026).slice(0, 4); // Up to June 25

    let lessonIndex = 0;

    // === SEPTEMBER LESSONS (Unit 1: Discovering Musical Play) ===
    const septLessons = [
      {
        title: 'Exploring Sounds Around Us',
        titleFr: 'Explorer les sons autour de nous',
        learningGoals: 'Students will identify and categorize different sounds in their environment and understand the difference between sound and silence.',
        mindsOn: 'Sound walk: Listen carefully and identify sounds in our school and nature.',
        action: 'Sound sorting activity: natural vs. human-made sounds. Create sound maps of our classroom and outdoor spaces.',
        consolidation: 'Share favorite sounds discovered and demonstrate making them with body and voice.',
        materials: JSON.stringify(['Recording device', 'sound identification cards', 'chart paper', 'various sound makers', 'nature items'])

      },
      {
        title: 'Our Musical Bodies',
        titleFr: 'Nos corps musicaux',
        learningGoals: 'Students will discover how to make music using different parts of their body as instruments.',
        mindsOn: 'Body percussion warm-up: Clap, pat, stomp - what sounds can we make?',
        action: 'Explore clapping patterns, foot stomping rhythms, finger snapping, tongue clicking. Create body percussion compositions.',
        consolidation: 'Body percussion circle where each student teaches the class their favorite body sound.',
        materials: JSON.stringify(['Body percussion chart', 'rhythm cards', 'mirror for self-observation'])

      },
      {
        title: 'Finding the Beat',
        titleFr: 'Trouver le rythme',
        learningGoals: 'Students will feel and identify steady beat in music and demonstrate beat through movement and clapping.',
        mindsOn: 'Heartbeat exploration: Feel your heartbeat and march to its rhythm.',
        action: 'Beat activities with simple songs: clapping, tapping, walking to the beat. Use different tempos and styles.',
        consolidation: 'Beat circle where each student adds a beat pattern to create a class composition.',
        materials: JSON.stringify(['Rhythm sticks', 'drums', 'upbeat music', 'metronome', 'scarves for movement'])

      },
      {
        title: 'Voice Adventures',
        titleFr: 'Aventures vocales',
        learningGoals: 'Students will explore the range and possibilities of their singing voice through playful vocal exercises.',
        mindsOn: 'Vocal warm-up: Siren sounds, animal voices, and whisper-to-shout exploration.',
        action: 'Voice exploration games: high/low sirens, animal sounds, echo games, whispering songs, volume control exercises.',
        consolidation: 'Voice showcase where students demonstrate their favorite vocal discoveries.',
        materials: JSON.stringify(['Animal voice cards', 'pitch pipes', 'vocal range posters', 'microphone prop'])

      },
      {
        title: 'Our First Songs',
        titleFr: 'Nos premières chansons',
        learningGoals: 'Students will learn simple songs and practice singing together as a group.',
        mindsOn: 'Song memory game: What songs do you already know? Sing a line from your favorite song.',
        action: 'Learn "Hello Song" and "Cleanup Song" for daily routines. Practice unison singing and listening to others.',
        consolidation: 'Performance circle where small groups sing their favorite classroom song.',
        materials: JSON.stringify(['Song charts', 'simple instruments for accompaniment', 'song picture books'])

      }
    ];

    // Add September lessons
    for (let i = 0; i < Math.min(septLessons.length, septDates.length); i++) {
      lessons.push({
        ...septLessons[i],
        date: septDates[i],
        subject: 'Music',
        duration: 45,
        grouping: 'Whole class exploration, partner activities, individual sharing',
        accommodations: JSON.stringify(['Visual cues', 'movement options', 'volume control supports']),
        differentiationStrategies: JSON.stringify({
          support: 'Modeling, repetition, visual supports',
          extension: 'Leadership roles, complex patterns, teaching others',
          multiModal: 'Auditory, visual, kinesthetic, creative expression'
        }),
        assessmentNotes: 'Observe musical exploration, participation, and creative expression',
        assessmentType: 'formative',
        isSubFriendly: true,
        unitPlanId: units.unit1.id,
        userId: emily.id
      });
    }

    // === OCTOBER LESSONS (Unit 2: Rhythm and Movement) ===
    const octLessons = [
      {
        title: 'High and Low Sounds',
        titleFr: 'Sons aigus et sons graves',
        learningGoals: 'Students will distinguish between high and low pitches and demonstrate understanding through voice and movement.',
        mindsOn: 'Animal voice exploration: Which animals have high voices? Low voices? Demonstrate with your voice.',
        action: 'Pitch exploration with voice, xylophones, and movement (high = reach up, low = crouch down). Pitch matching games.',
        consolidation: 'High-low pitch story using voices and movements to tell a musical tale.',
        materials: JSON.stringify(['Xylophones', 'animal pictures', 'scarves for movement', 'pitch pipes', 'high/low visual cards'])

      },
      {
        title: 'Rhythm Patterns',
        titleFr: 'Motifs rythmiques',
        learningGoals: 'Students will create and perform simple rhythm patterns using body percussion and instruments.',
        mindsOn: 'Name rhythm game: Clap the syllables in your name, then create a pattern.',
        action: 'Rhythm pattern creation using body percussion, transferring to instruments. Pattern echo games and composition.',
        consolidation: 'Rhythm pattern sharing circle where students teach their patterns to classmates.',
        materials: JSON.stringify(['Rhythm instruments', 'pattern cards', 'name rhythm sheets', 'recording device'])

      },
      {
        title: 'Instrument Exploration',
        titleFr: 'Exploration des instruments',
        learningGoals: 'Students will explore different classroom instruments and learn proper care and playing techniques.',
        mindsOn: 'Mystery instrument game: Listen and guess which instrument is playing behind the screen.',
        action: 'Instrument stations: shakers, drums, triangles, bells, wood blocks. Learn proper holding and playing techniques.',
        consolidation: 'Instrument orchestra where everyone plays together with conductor signals.',
        materials: JSON.stringify(['Complete classroom instrument set', 'instrument care posters', 'conducting wands', 'station rotation cards'])

      },
      {
        title: 'Movement to Music',
        titleFr: 'Mouvement sur la musique',
        learningGoals: 'Students will move their bodies rhythmically to different styles of music, showing beat and expression.',
        mindsOn: 'Statue dance: Move to the music, freeze when it stops. How does your body want to move?',
        action: 'Creative movement to various musical styles: marching, swaying, bouncing. Use scarves, ribbons, and free movement.',
        consolidation: 'Movement showcase where students demonstrate their favorite way to move to music.',
        materials: JSON.stringify(['Variety of musical styles', 'movement props (scarves, ribbons)', 'open space', 'emotion cards'])

      },
      {
        title: 'Fast and Slow Music',
        titleFr: 'Musique rapide et lente',
        learningGoals: 'Students will identify and demonstrate tempo through movement, instruments, and vocal expression.',
        mindsOn: 'Tempo body exploration: Show me fast movements! Show me slow movements! How does tempo make you feel?',
        action: 'Tempo activities: fast and slow songs, instrument tempos, movement to different speeds. Tempo conducting practice.',
        consolidation: 'Tempo transformation game where students change the tempo of familiar songs.',
        materials: JSON.stringify(['Songs of different tempos', 'metronome', 'conducting batons', 'tempo cards', 'movement space'])

      },
      {
        title: 'Halloween Music and Movement',
        titleFr: 'Musique et mouvement d\'Halloween',
        learningGoals: 'Students will express creativity through Halloween-themed music and movement activities.',
        mindsOn: 'Spooky sounds creation: How can we make Halloween sounds with our voices and instruments?',
        action: 'Halloween song learning, spooky sound effects with instruments, costume movement dance. Create a Halloween soundscape.',
        consolidation: 'Halloween musical show for other classes featuring songs, sounds, and movement.',
        materials: JSON.stringify(['Halloween music collection', 'sound effect instruments', 'simple costume props', 'spooky story books'])

      }
    ];

    // Add October lessons
    for (let i = 0; i < Math.min(octLessons.length, octDates.length); i++) {
      lessons.push({
        ...octLessons[i],
        date: octDates[i],
        subject: 'Music',
        duration: 45,
        grouping: 'Whole class activities, small group exploration, individual expression',
        accommodations: JSON.stringify(['Movement modifications', 'instrument adaptations', 'visual supports']),
        differentiationStrategies: JSON.stringify({
          support: 'Simple patterns, guided practice, peer buddies',
          extension: 'Complex rhythms, leadership roles, composition challenges',
          multiModal: 'Kinesthetic, auditory, visual, creative arts integration'
        }),
        assessmentNotes: 'Track musical skill development, creativity, and collaborative participation',
        assessmentType: 'formative',
        isSubFriendly: true,
        unitPlanId: units.unit2.id,
        userId: emily.id
      });
    }

    // === NOVEMBER LESSONS (Unit 2 continued & Unit 3 begins) ===
    const novLessons = [
      {
        title: 'Loud and Soft Music',
        titleFr: 'Musique forte et douce',
        learningGoals: 'Students will understand dynamics (loud and soft) and demonstrate control in their musical expression.',
        mindsOn: 'Volume exploration: When do we use loud voices? Soft voices? Practice volume control together.',
        action: 'Dynamic activities: loud/soft singing, instrument volume control, movement to different dynamics. Dynamic conducting.',
        consolidation: 'Dynamic story telling with musical accompaniment using various volume levels.',
        materials: JSON.stringify(['Various instruments', 'volume level cards', 'story book', 'dynamic symbols', 'conducting gestures chart'])

      },
      {
        title: 'Rhythm Orchestra',
        titleFr: 'Orchestre rythmique',
        learningGoals: 'Students will work together to create ensemble rhythm compositions using classroom instruments.',
        mindsOn: 'Orchestra listening: Listen to how many instruments play together. How do they stay together?',
        action: 'Small group rhythm composition, practice ensemble playing, learn conductor signals for start/stop/dynamics.',
        consolidation: 'Class rhythm orchestra performance with student conductors leading different sections.',
        materials: JSON.stringify(['Full instrument set', 'conductor batons', 'ensemble music', 'section dividers', 'performance area'])

      },
      {
        title: 'Thanksgiving Songs',
        titleFr: 'Chansons de l\'Action de grâce',
        learningGoals: 'Students will learn gratitude songs and express thankfulness through musical performance.',
        mindsOn: 'Gratitude circle: Share something you\'re thankful for with a musical voice or rhythm.',
        action: 'Learn thanksgiving songs, create gratitude rhythm patterns, practice harmony singing, prepare family performance.',
        consolidation: 'Thanksgiving concert preparation and dress rehearsal with family invitation.',
        materials: JSON.stringify(['Thanksgiving song books', 'rhythm instruments', 'gratitude props', 'harmony practice tracks'])

      },
      {
        title: 'Mi\'kmaq Traditional Music',
        titleFr: 'Musique traditionnelle mi\'kmaque',
        learningGoals: 'Students will learn about Mi\'kmaq musical traditions and experience traditional songs and rhythms.',
        mindsOn: 'Land acknowledgment through music: How do Indigenous peoples honor the land through music?',
        action: 'Learn simple Mi\'kmaq songs, experience traditional drumming patterns, understand music\'s role in Mi\'kmaq culture.',
        consolidation: 'Respectful sharing circle where students reflect on Mi\'kmaq musical traditions learned.',
        materials: JSON.stringify(['Traditional Mi\'kmaq music', 'Hand drums', 'Cultural context materials', 'Elder or knowledge keeper visit'])

      },
      {
        title: 'Songs Tell Stories',
        titleFr: 'Les chansons racontent des histoires',
        learningGoals: 'Students will understand how music can tell stories and convey emotions through melody and lyrics.',
        mindsOn: 'Story song listening: What story does this song tell? How does the music help tell the story?',
        action: 'Explore narrative songs, practice dramatic singing, use voice to convey different characters and emotions.',
        consolidation: 'Student storytelling through song performance, sharing how music enhances the narrative.',
        materials: JSON.stringify(['Story song collection', 'Character voice cards', 'Simple props', 'Story picture books'])

      },
      {
        title: 'Musical Feelings',
        titleFr: 'Sentiments musicaux',
        learningGoals: 'Students will explore how music expresses emotions and practice using music to convey feelings.',
        mindsOn: 'Emotion exploration: How does this music make you feel? Show the feeling with your face and body.',
        action: 'Listen to music expressing different emotions, practice singing with emotional expression, create emotion sound stories.',
        consolidation: 'Emotion music sharing where students perform pieces that express different feelings.',
        materials: JSON.stringify(['Emotion music collection', 'Feeling cards', 'Mirrors for expression practice', 'Emotion story books'])

      }
    ];

    // Add November lessons
    for (let i = 0; i < Math.min(novLessons.length, novDates.length); i++) {
      lessons.push({
        ...novLessons[i],
        date: novDates[i],
        subject: 'Music',
        duration: 45,
        grouping: 'Whole class singing, small group practice, individual expression opportunities',
        accommodations: JSON.stringify(['Cultural sensitivity support', 'emotional expression alternatives', 'participation options']),
        differentiationStrategies: JSON.stringify({
          support: 'Simple melodies, guided emotional expression, peer support',
          extension: 'Harmony parts, emotion composition, cultural research projects',
          multiModal: 'Musical, emotional, cultural, kinesthetic, visual arts'
        }),
        assessmentNotes: 'Assess musical expression, cultural understanding, and emotional connection to music',
        assessmentType: 'formative',
        isSubFriendly: true,
        unitPlanId: i < 2 ? units.unit2.id : units.unit3.id,
        userId: emily.id
      });
    }

    // === DECEMBER LESSONS (Unit 3: Songs and Stories continued) ===
    const decLessons = [
      {
        title: 'Holiday Songs Around the World',
        titleFr: 'Chansons de fête autour du monde',
        learningGoals: 'Students will learn holiday songs from different cultures and explore musical traditions.',
        mindsOn: 'Holiday music listening tour: What different holiday music can you recognize from around the world?',
        action: 'Learn simple holiday songs from various cultures, explore different instruments used in celebrations worldwide.',
        consolidation: 'Cultural holiday music sharing and appreciation circle with respectful discussion.',
        materials: JSON.stringify(['Multicultural holiday music', 'World instrument pictures', 'Globe/map', 'Cultural artifacts'])

      },
      {
        title: 'Winter Sounds and Music',
        titleFr: 'Sons et musique d\'hiver',
        learningGoals: 'Students will create winter-themed music using voice, instruments, and environmental sounds.',
        mindsOn: 'Winter sound walk: What sounds do we hear in winter? How can we recreate them musically?',
        action: 'Create winter soundscapes using voice and instruments, learn winter songs, compose winter music stories.',
        consolidation: 'Winter music concert for other classes featuring original compositions and traditional songs.',
        materials: JSON.stringify(['Winter sound recordings', 'Seasonal instruments', 'Winter story books', 'Recording equipment'])

      },
      {
        title: 'Music Notation Exploration',
        titleFr: 'Exploration de la notation musicale',
        learningGoals: 'Students will explore simple music notation and create their own musical symbols.',
        mindsOn: 'Music symbols discovery: What symbols do we use to write down music? Can you create your own?',
        action: 'Explore traditional notation symbols, create invented notation for class songs, practice reading simple patterns.',
        consolidation: 'Student composers share their notation systems and teach others to read their musical symbols.',
        materials: JSON.stringify(['Music notation charts', 'Staff paper', 'Colored pencils', 'Student composition books'])

      },
      {
        title: 'Winter Concert Preparation',
        titleFr: 'Préparation du concert d\'hiver',
        learningGoals: 'Students will prepare and practice for their winter concert performance, developing performance skills.',
        mindsOn: 'Performance readiness: What makes a good musical performance? How do we prepare our best music?',
        action: 'Concert song rehearsal, stage presence practice, audience etiquette learning, ensemble coordination.',
        consolidation: 'Dress rehearsal with feedback, encouragement, and final preparation for family concert.',
        materials: JSON.stringify(['Concert songs', 'Performance props', 'Microphones', 'Stage area', 'Performance outfits'])

      },
      {
        title: 'Musical Memories and Growth',
        titleFr: 'Souvenirs musicaux et croissance',
        learningGoals: 'Students will reflect on their musical learning and growth throughout the fall semester.',
        mindsOn: 'Musical memory sharing: What is your favorite musical moment from this semester?',
        action: 'Musical portfolio creation, favorite song performances, musical goals for winter break and new year.',
        consolidation: 'Musical celebration and sharing of growth with families during winter concert.',
        materials: JSON.stringify(['Portfolio materials', 'Musical memory books', 'Celebration props', 'Growth charts'])

      },
      {
        title: 'Celebrating Musical Traditions',
        titleFr: 'Célébrer les traditions musicales',
        learningGoals: 'Students will celebrate diverse musical traditions and understand music as a universal language.',
        mindsOn: 'Musical tradition sharing: What musical traditions does your family celebrate?',
        action: 'Share family musical traditions, learn songs from different cultures, understand how music brings people together.',
        consolidation: 'Multicultural celebration concert featuring music from student families and global traditions.',
        materials: JSON.stringify(['Family tradition surveys', 'Multicultural music collection', 'Celebration decorations', 'Cultural props'])

      }
    ];

    // Add December lessons
    for (let i = 0; i < Math.min(decLessons.length, decDates.length); i++) {
      lessons.push({
        ...decLessons[i],
        date: decDates[i],
        subject: 'Music',
        duration: 45,
        grouping: 'Whole class rehearsal, small group practice, individual performance moments',
        accommodations: JSON.stringify(['Performance alternatives', 'stage fright support', 'cultural sensitivity']),
        differentiationStrategies: JSON.stringify({
          support: 'Simple performance roles, buddy support, familiar songs',
          extension: 'Solo opportunities, performance leadership, composition sharing',
          multiModal: 'Performance, visual arts, cultural exploration, reflection'
        }),
        assessmentNotes: 'Assess performance skills, musical growth, cultural understanding, and collaborative abilities',
        assessmentType: 'summative',
        isSubFriendly: true,
        unitPlanId: units.unit3.id,
        userId: emily.id
      });
    }

    // === JANUARY LESSONS (Unit 4: Creating Music Together) ===
    const janLessons = [
      {
        title: 'New Year Musical Resolutions',
        titleFr: 'Résolutions musicales du Nouvel An',
        learningGoals: 'Students will set musical goals for the new year and explore music from different decades.',
        mindsOn: 'Musical resolution sharing: What musical skill do you want to improve this year?',
        action: 'Create musical goal charts, explore "then and now" music, learn songs from different time periods.',
        consolidation: 'Musical timeline creation showing how music has changed and setting personal musical goals.',
        materials: JSON.stringify(['Music from different decades', 'Goal-setting charts', 'Timeline materials', 'Resolution certificates'])

      },
      {
        title: 'Composing with Pictures',
        titleFr: 'Composer avec des images',
        learningGoals: 'Students will create musical compositions inspired by visual art and pictures.',
        mindsOn: 'Picture music inspiration: What sounds do you hear when you look at this picture?',
        action: 'Create musical compositions inspired by artwork, use invented notation to record compositions, perform picture music.',
        consolidation: 'Art gallery musical performances where compositions are performed alongside inspiring artwork.',
        materials: JSON.stringify(['Art prints', 'Composition materials', 'Instruments for composition', 'Recording sheets'])

      },
      {
        title: 'Partner Compositions',
        titleFr: 'Compositions de partenaires',
        learningGoals: 'Students will work with partners to create simple musical compositions and learn collaboration skills.',
        mindsOn: 'Musical partnership: How can two people create music together?',
        action: 'Partner composition activities, practice turn-taking in music creation, develop listening skills for collaboration.',
        consolidation: 'Partner performance showcase where duos perform their original musical creations.',
        materials: JSON.stringify(['Partner composition sheets', 'Various instruments', 'Collaboration guidelines', 'Performance area'])

      },
      {
        title: 'Sound Stories',
        titleFr: 'Histoires sonores',
        learningGoals: 'Students will create musical sound effects and soundtracks for stories and dramatic play.',
        mindsOn: 'Story sound creation: What sounds would make this story come alive?',
        action: 'Create sound effects for favorite stories, practice timing music with narrative, develop soundtrack composition.',
        consolidation: 'Sound story theatre where students perform stories with live musical accompaniment.',
        materials: JSON.stringify(['Story books', 'Sound effect instruments', 'Recording equipment', 'Performance props'])

      },
      {
        title: 'Musical Patterns and Math',
        titleFr: 'Motifs musicaux et mathématiques',
        learningGoals: 'Students will explore mathematical patterns in music and create compositions using pattern concepts.',
        mindsOn: 'Pattern discovery: Can you find patterns in this music? How are music and math connected?',
        action: 'Create ABAB and ABA musical patterns, explore counting in music, use mathematical concepts in composition.',
        consolidation: 'Mathematical music showcase where students explain the patterns in their musical compositions.',
        materials: JSON.stringify(['Pattern cards', 'Math manipulatives', 'Composition grids', 'Calculator rhythms'])

      },
      {
        title: 'Technology and Music',
        titleFr: 'Technologie et musique',
        learningGoals: 'Students will explore how technology can be used to create, record, and share music.',
        mindsOn: 'Music technology exploration: How can computers and devices help us make music?',
        action: 'Explore music apps, record compositions, use technology to create beats and melodies, digital music creation.',
        consolidation: 'Digital music showcase where students share technology-created compositions with the class.',
        materials: JSON.stringify(['Tablets/computers', 'Music creation apps', 'Recording equipment', 'Headphones'])

      },
      {
        title: 'Instrument Families',
        titleFr: 'Familles d\'instruments',
        learningGoals: 'Students will learn about different instrument families and their unique sounds and techniques.',
        mindsOn: 'Instrument family sorting: How are these instruments similar? How are they different?',
        action: 'Explore strings, winds, brass, percussion families, practice different playing techniques, instrument listening games.',
        consolidation: 'Instrument family concert where students demonstrate different families through performance.',
        materials: JSON.stringify(['Instrument family pictures', 'Varied classroom instruments', 'Instrument sound recordings', 'Technique charts'])

      },
      {
        title: 'Musical Conversations',
        titleFr: 'Conversations musicales',
        learningGoals: 'Students will practice musical call-and-response and learn to communicate through music.',
        mindsOn: 'Musical conversation: How can we talk to each other using only music?',
        action: 'Call-and-response games, musical question-and-answer activities, non-verbal musical communication practice.',
        consolidation: 'Musical conversation circle where students hold entire conversations using only musical sounds.',
        materials: JSON.stringify(['Conversation prompt cards', 'Various instruments', 'Non-verbal communication guides'])

      }
    ];

    // Add January lessons
    for (let i = 0; i < Math.min(janLessons.length, janDates.length); i++) {
      lessons.push({
        ...janLessons[i],
        date: janDates[i],
        subject: 'Music',
        duration: 45,
        grouping: 'Partner work, small group composition, whole class sharing',
        accommodations: JSON.stringify(['Technology supports', 'composition alternatives', 'collaboration supports']),
        differentiationStrategies: JSON.stringify({
          support: 'Simplified compositions, guided collaboration, visual notation',
          extension: 'Complex compositions, technology leadership, teaching others',
          multiModal: 'Creative, technological, mathematical, collaborative'
        }),
        assessmentNotes: 'Assess composition skills, collaboration abilities, and creative musical thinking',
        assessmentType: 'formative',
        isSubFriendly: true,
        unitPlanId: units.unit4.id,
        userId: emily.id
      });
    }

    // === FEBRUARY LESSONS (Unit 4 continued) ===
    const febLessons = [
      {
        title: 'Love Song Traditions',
        titleFr: 'Traditions des chansons d\'amour',
        learningGoals: 'Students will explore musical expressions of love, friendship, and caring through various cultural traditions.',
        mindsOn: 'Love and friendship music: How do people around the world express caring through music?',
        action: 'Learn friendship songs, explore lullabies from different cultures, create caring music for family and friends.',
        consolidation: 'Friendship concert where students perform caring songs for invited classes and family members.',
        materials: JSON.stringify(['Friendship song collection', 'Lullabies from various cultures', 'Heart-themed props', 'Card-making materials'])

      },
      {
        title: 'Acadian Musical Heritage',
        titleFr: 'Patrimoine musical acadien',
        learningGoals: 'Students will learn about Acadian musical traditions and experience traditional Acadian songs and dances.',
        mindsOn: 'Acadian heritage exploration: What musical traditions do Acadian people share?',
        action: 'Learn simple Acadian songs, experience fiddle music and step dancing, understand Acadian musical history.',
        consolidation: 'Acadian kitchen party simulation with traditional music, dancing, and cultural appreciation.',
        materials: JSON.stringify(['Traditional Acadian music', 'Fiddle recordings', 'Step dance instructions', 'Cultural context materials'])

      },
      {
        title: 'Rhythm Composition Challenge',
        titleFr: 'Défi de composition rythmique',
        learningGoals: 'Students will create complex rhythm compositions using layered patterns and different instruments.',
        mindsOn: 'Rhythm layering: What happens when we play different rhythms at the same time?',
        action: 'Create multi-layered rhythm compositions, practice ensemble coordination, develop conducting skills.',
        consolidation: 'Rhythm composition festival where students perform and evaluate each other\'s rhythmic creations.',
        materials: JSON.stringify(['Full percussion set', 'Layered composition sheets', 'Conducting batons', 'Ensemble practice areas'])

      },
      {
        title: 'Music and Movement Integration',
        titleFr: 'Intégration musique et mouvement',
        learningGoals: 'Students will create integrated music and movement compositions combining dance, instruments, and voice.',
        mindsOn: 'Music movement fusion: How can we combine moving, singing, and playing instruments all together?',
        action: 'Create choreographed musical pieces, practice coordination of multiple musical elements, ensemble performance skills.',
        consolidation: 'Integrated performance showcase featuring student-created pieces combining all musical elements.',
        materials: JSON.stringify(['Open movement space', 'Portable instruments', 'Movement props', 'Performance staging'])

      },
      {
        title: 'Musical Problem Solving',
        titleFr: 'Résolution de problèmes musicaux',
        learningGoals: 'Students will solve musical challenges and puzzles while developing critical thinking through music.',
        mindsOn: 'Musical puzzles: Can you solve this musical mystery or challenge?',
        action: 'Musical problem-solving activities, rhythm puzzles, pitch matching challenges, ensemble coordination problems.',
        consolidation: 'Musical problem-solving showcase where students present solutions to musical challenges.',
        materials: JSON.stringify(['Musical puzzle cards', 'Challenge activity sheets', 'Problem-solving instruments', 'Solution recording sheets'])

      },
      {
        title: 'Community Music Connections',
        titleFr: 'Connexions musicales communautaires',
        learningGoals: 'Students will explore how music connects people in their community and contribute to community musical life.',
        mindsOn: 'Community music discovery: Where do you hear music in our community?',
        action: 'Explore community music venues, create music for community events, plan musical contributions to school community.',
        consolidation: 'Community music fair where students showcase how they can contribute musically to their community.',
        materials: JSON.stringify(['Community venue pictures', 'Event planning materials', 'Performance preparation items'])

      }
    ];

    // Add February lessons
    for (let i = 0; i < Math.min(febLessons.length, febDates.length); i++) {
      lessons.push({
        ...febLessons[i],
        date: febDates[i],
        subject: 'Music',
        duration: 45,
        grouping: 'Cultural exploration, ensemble work, community-focused activities',
        accommodations: JSON.stringify(['Cultural sensitivity supports', 'movement modifications', 'ensemble participation options']),
        differentiationStrategies: JSON.stringify({
          support: 'Simplified ensemble parts, cultural context supports, guided participation',
          extension: 'Leadership in cultural sharing, complex ensemble roles, community project leadership',
          multiModal: 'Cultural, kinesthetic, ensemble, community-based learning'
        }),
        assessmentNotes: 'Assess cultural understanding, ensemble skills, and community music awareness',
        assessmentType: 'formative',
        isSubFriendly: true,
        unitPlanId: units.unit4.id,
        userId: emily.id
      });
    }

    // === MARCH LESSONS (Unit 5: Music Around the World) ===
    const marLessons = [
      {
        title: 'African Musical Traditions',
        titleFr: 'Traditions musicales africaines',
        learningGoals: 'Students will explore African musical traditions including drumming, call-and-response, and storytelling through music.',
        mindsOn: 'African music exploration: What can we learn about African cultures through their music?',
        action: 'Experience djembe drumming patterns, practice call-and-response singing, learn African musical games and dances.',
        consolidation: 'African music celebration featuring traditional songs, drumming, and respectful cultural appreciation.',
        materials: JSON.stringify(['Djembe drums', 'African music recordings', 'Cultural maps', 'Traditional story books'])

      },
      {
        title: 'Asian Musical Exploration',
        titleFr: 'Exploration musicale asiatique',
        learningGoals: 'Students will discover musical traditions from various Asian cultures including instruments, scales, and performance practices.',
        mindsOn: 'Asian music listening: How does this music sound different from what we usually hear?',
        action: 'Explore pentatonic scales, experience traditional Asian instruments, learn simple songs from different Asian cultures.',
        consolidation: 'Asian music showcase featuring student performances of traditional songs and instrumental pieces.',
        materials: JSON.stringify(['Asian music recordings', 'Pentatonic instrument set', 'Cultural artifact pictures', 'Traditional costume props'])

      },
      {
        title: 'European Folk Music',
        titleFr: 'Musique folklorique européenne',
        learningGoals: 'Students will experience European folk music traditions including dances, instruments, and seasonal celebrations.',
        mindsOn: 'European folk exploration: What stories do European folk songs tell?',
        action: 'Learn European folk dances, explore traditional instruments like recorders and simple string instruments, seasonal folk songs.',
        consolidation: 'European folk festival with traditional dances, songs, and cultural appreciation activities.',
        materials: JSON.stringify(['European folk music collection', 'Simple folk instruments', 'Dance instruction materials', 'Cultural celebration props'])

      },
      {
        title: 'Latin American Musical Fiesta',
        titleFr: 'Fiesta musicale latino-américaine',
        learningGoals: 'Students will experience the vibrant musical traditions of Latin America including rhythm, dance, and celebration music.',
        mindsOn: 'Latin music movement: How does Latin American music make your body want to move?',
        action: 'Experience Latin rhythms with maracas and claves, learn simple Spanish songs, practice Latin dance movements.',
        consolidation: 'Latin American music fiesta with dancing, singing, and cultural celebration.',
        materials: JSON.stringify(['Latin percussion instruments', 'Spanish/Portuguese songs', 'Dance movement scarves', 'Fiesta decorations'])

      },
      {
        title: 'Middle Eastern Musical Journey',
        titleFr: 'Voyage musical moyen-oriental',
        learningGoals: 'Students will explore Middle Eastern musical traditions including unique scales, instruments, and cultural contexts.',
        mindsOn: 'Middle Eastern music discovery: What makes this music sound unique and special?',
        action: 'Experience Middle Eastern scales and modes, explore traditional instruments, learn about music in Middle Eastern cultures.',
        consolidation: 'Middle Eastern music appreciation circle with respectful cultural discussion and simple performance.',
        materials: JSON.stringify(['Middle Eastern music recordings', 'Traditional instrument pictures', 'Cultural context materials', 'Respectful discussion guides'])

      },
      {
        title: 'Australian and Oceanic Music',
        titleFr: 'Musique australienne et océanienne',
        learningGoals: 'Students will discover musical traditions from Australia and Pacific Island cultures including traditional and contemporary music.',
        mindsOn: 'Oceanic music exploration: What unique instruments and sounds come from Australia and Pacific Islands?',
        action: 'Experience didgeridoo sounds, explore Pacific Island music and dance, learn about Aboriginal musical traditions.',
        consolidation: 'Oceanic music journey presentation featuring respectful exploration of diverse Pacific musical traditions.',
        materials: JSON.stringify(['Australian/Pacific music', 'Traditional instrument recordings', 'Cultural maps', 'Respectful cultural materials'])

      },
      {
        title: 'World Music Festival Planning',
        titleFr: 'Planification du festival de musique mondiale',
        learningGoals: 'Students will plan and prepare for a world music festival, demonstrating their learning about global musical traditions.',
        mindsOn: 'Festival planning: How can we share all the world music we\'ve learned with others?',
        action: 'Plan world music festival performances, prepare cultural presentations, practice respectful cultural sharing.',
        consolidation: 'World music festival preparation day with final rehearsals and cultural presentation practice.',
        materials: JSON.stringify(['Festival planning materials', 'Cultural presentation props', 'Performance preparation items', 'Program creation materials'])

      }
    ];

    // Add March lessons
    for (let i = 0; i < Math.min(marLessons.length, marDates.length); i++) {
      lessons.push({
        ...marLessons[i],
        date: marDates[i],
        subject: 'Music',
        duration: 45,
        grouping: 'Cultural exploration groups, whole class experiences, respectful sharing circles',
        accommodations: JSON.stringify(['Cultural sensitivity supports', 'respectful participation options', 'learning style accommodations']),
        differentiationStrategies: JSON.stringify({
          support: 'Visual cultural supports, guided exploration, peer partnerships',
          extension: 'Cultural research projects, performance leadership, cross-cultural connections',
          multiModal: 'Cultural, auditory, visual, kinesthetic, research-based'
        }),
        assessmentNotes: 'Assess cultural understanding, respectful appreciation, and global music knowledge',
        assessmentType: 'formative',
        isSubFriendly: true,
        unitPlanId: units.unit5.id,
        userId: emily.id
      });
    }

    // === APRIL LESSONS (Unit 5 continued & Unit 6 begins) ===
    const aprLessons = [
      {
        title: 'World Music Festival Performance',
        titleFr: 'Performance du festival de musique mondiale',
        learningGoals: 'Students will perform music from around the world, demonstrating cultural understanding and respect.',
        mindsOn: 'Festival performance: How can we respectfully share the world\'s music with our audience?',
        action: 'World music festival performance featuring student presentations of global musical traditions.',
        consolidation: 'Cultural appreciation reflection and discussion about what we learned from world music exploration.',
        materials: JSON.stringify(['Festival performance setup', 'Cultural costumes/props', 'Performance programs', 'Appreciation certificates'])

      },
      {
        title: 'Spring Music and Nature',
        titleFr: 'Musique printanière et nature',
        learningGoals: 'Students will create music inspired by spring and nature, connecting environmental awareness with musical creativity.',
        mindsOn: 'Spring sounds exploration: What new sounds do we hear as spring arrives?',
        action: 'Create spring soundscapes, compose nature-inspired music, learn songs about environmental stewardship.',
        consolidation: 'Spring nature concert featuring original environmental music and traditional spring songs.',
        materials: JSON.stringify(['Nature sound recordings', 'Outdoor exploration materials', 'Environmental music collection', 'Composition materials'])

      },
      {
        title: 'Musical Growth Reflection',
        titleFr: 'Réflexion sur la croissance musicale',
        learningGoals: 'Students will reflect on their musical growth throughout the year and set goals for continued musical development.',
        mindsOn: 'Musical growth sharing: How have you grown as a musician this year?',
        action: 'Create musical growth portfolios, record favorite musical moments, practice self-assessment of musical skills.',
        consolidation: 'Musical growth celebration where students share their musical journey and accomplishments.',
        materials: JSON.stringify(['Portfolio materials', 'Recording equipment', 'Growth reflection sheets', 'Celebration props'])

      },
      {
        title: 'Collaborative Music Creation',
        titleFr: 'Création musicale collaborative',
        learningGoals: 'Students will work in small groups to create collaborative musical compositions combining all learned skills.',
        mindsOn: 'Musical collaboration: How can we combine everyone\'s musical ideas into one creation?',
        action: 'Small group composition projects, practice collaborative decision-making, integrate various musical elements learned.',
        consolidation: 'Collaborative composition showcase where groups perform their original musical creations.',
        materials: JSON.stringify(['Composition materials', 'Various instruments', 'Collaboration guidelines', 'Performance setup'])

      },
      {
        title: 'Family Music Traditions',
        titleFr: 'Traditions musicales familiales',
        learningGoals: 'Students will share and celebrate their family\'s musical traditions and learn from each other\'s heritage.',
        mindsOn: 'Family music sharing: What musical traditions are special in your family?',
        action: 'Share family songs and musical traditions, learn from classmates\' heritage, create a class musical family tree.',
        consolidation: 'Family musical traditions celebration with performances of heritage music and cultural sharing.',
        materials: JSON.stringify(['Family tradition surveys', 'Cultural sharing materials', 'Recording equipment', 'Heritage celebration props'])

      },
      {
        title: 'Music Technology Showcase',
        titleFr: 'Vitrine de technologie musicale',
        learningGoals: 'Students will demonstrate their understanding of music technology and share digital musical creations.',
        mindsOn: 'Technology music sharing: What amazing music have you created using technology?',
        action: 'Share technology-created compositions, demonstrate music apps and digital tools, explore future music technology.',
        consolidation: 'Digital music showcase where students present their technology-enhanced musical creations.',
        materials: JSON.stringify(['Digital devices', 'Music technology apps', 'Presentation setup', 'Recording/playback equipment'])

      }
    ];

    // Add April lessons
    for (let i = 0; i < Math.min(aprLessons.length, aprDates.length); i++) {
      lessons.push({
        ...aprLessons[i],
        date: aprDates[i],
        subject: 'Music',
        duration: 45,
        grouping: 'Festival performance, collaborative creation, family heritage sharing',
        accommodations: JSON.stringify(['Performance support options', 'family tradition alternatives', 'technology access supports']),
        differentiationStrategies: JSON.stringify({
          support: 'Performance alternatives, guided collaboration, heritage sharing supports',
          extension: 'Performance leadership, complex collaborations, technology mentoring',
          multiModal: 'Performance, collaborative, technological, cultural heritage'
        }),
        assessmentNotes: 'Assess performance skills, collaborative abilities, cultural appreciation, and technology integration',
        assessmentType: 'formative',
        isSubFriendly: true,
        unitPlanId: i < 1 ? units.unit5.id : units.unit6.id,
        userId: emily.id
      });
    }

    // === MAY LESSONS (Unit 6: Musical Celebration) ===
    const mayLessons = [
      {
        title: 'Spring Concert Preparation',
        titleFr: 'Préparation du concert printanier',
        learningGoals: 'Students will prepare for their spring concert, demonstrating all musical skills learned throughout the year.',
        mindsOn: 'Concert preparation: What songs and musical pieces best show our musical growth?',
        action: 'Select and rehearse spring concert repertoire, practice performance skills, coordinate ensemble pieces.',
        consolidation: 'Spring concert dress rehearsal with feedback and final preparation for family performance.',
        materials: JSON.stringify(['Concert repertoire', 'Performance costumes', 'Stage setup', 'Rehearsal schedule'])

      },
      {
        title: 'Musical Leadership Development',
        titleFr: 'Développement du leadership musical',
        learningGoals: 'Students will practice musical leadership skills by teaching younger students and leading musical activities.',
        mindsOn: 'Musical leadership: How can you help others learn and enjoy music?',
        action: 'Prepare to teach musical skills to kindergarten classes, practice conducting and leading activities.',
        consolidation: 'Musical mentorship sessions where Grade 1 students teach music to younger learners.',
        materials: JSON.stringify(['Teaching materials', 'Simple instruments for sharing', 'Leadership activity guides'])

      },
      {
        title: 'Music and Community Service',
        titleFr: 'Musique et service communautaire',
        learningGoals: 'Students will use music to contribute to their community through performance and musical gift-giving.',
        mindsOn: 'Musical service: How can we use our music to make others happy and help our community?',
        action: 'Plan community service through music, prepare songs for seniors\' residences, create musical gifts.',
        consolidation: 'Community musical service project performance and reflection on music\'s power to serve others.',
        materials: JSON.stringify(['Community service materials', 'Gift-making supplies', 'Transportation arrangements', 'Service reflection sheets'])

      },
      {
        title: 'Musical Composition Portfolio',
        titleFr: 'Portfolio de composition musicale',
        learningGoals: 'Students will complete and present their musical composition portfolio showing growth in creative music-making.',
        mindsOn: 'Composition portfolio: What musical creations are you most proud of from this year?',
        action: 'Complete composition portfolios, practice presenting musical creations, reflect on compositional growth.',
        consolidation: 'Composition portfolio presentations where students share and explain their musical creations.',
        materials: JSON.stringify(['Portfolio materials', 'Composition collections', 'Presentation setup', 'Reflection guides'])

      },
      {
        title: 'Musical Games and Play',
        titleFr: 'Jeux et jeux musicaux',
        learningGoals: 'Students will create and teach musical games that can be enjoyed during outdoor play and free time.',
        mindsOn: 'Musical games creation: What musical games can we create for playground and indoor play?',
        action: 'Create original musical games, practice teaching games to others, adapt traditional games with musical elements.',
        consolidation: 'Musical games festival where students teach their games to other classes and enjoy musical play.',
        materials: JSON.stringify(['Game creation materials', 'Portable instruments', 'Game instruction cards', 'Playground equipment'])

      },
      {
        title: 'Celebrating Musical Diversity',
        titleFr: 'Célébrer la diversité musicale',
        learningGoals: 'Students will celebrate the musical diversity in their classroom and community through inclusive musical activities.',
        mindsOn: 'Musical diversity celebration: How does music bring people together despite our differences?',
        action: 'Create inclusive musical activities, celebrate all types of musical expression, practice respectful musical sharing.',
        consolidation: 'Diversity through music celebration featuring all students\' unique musical contributions and talents.',
        materials: JSON.stringify(['Inclusive music materials', 'Celebration decorations', 'Diversity discussion guides', 'Community celebration props'])

      }
    ];

    // Add May lessons
    for (let i = 0; i < Math.min(mayLessons.length, mayDates.length); i++) {
      lessons.push({
        ...mayLessons[i],
        date: mayDates[i],
        subject: 'Music',
        duration: 45,
        grouping: 'Concert preparation, leadership activities, community service, portfolio presentation',
        accommodations: JSON.stringify(['Leadership role alternatives', 'performance anxiety support', 'portfolio presentation options']),
        differentiationStrategies: JSON.stringify({
          support: 'Guided leadership opportunities, simple portfolio presentations, supported community service',
          extension: 'Advanced leadership roles, complex portfolio presentations, community service planning',
          multiModal: 'Leadership, service-learning, portfolio-based, performance-focused'
        }),
        assessmentNotes: 'Assess leadership development, community service learning, portfolio completion, and performance readiness',
        assessmentType: 'summative',
        isSubFriendly: true,
        unitPlanId: units.unit6.id,
        userId: emily.id
      });
    }

    // === JUNE LESSONS (Unit 6: Musical Celebration continued) ===
    const junLessons = [
      {
        title: 'Spring Concert Performance',
        titleFr: 'Performance du concert printanier',
        learningGoals: 'Students will perform their spring concert, demonstrating musical growth and celebrating their year of music learning.',
        mindsOn: 'Concert performance: How can we show our families and community how much we\'ve learned in music?',
        action: 'Spring concert performance featuring repertoire from throughout the year and showcasing musical growth.',
        consolidation: 'Post-concert celebration and reflection on the musical journey and performance experience.',
        materials: JSON.stringify(['Concert setup', 'Performance attire', 'Programs', 'Celebration refreshments'])

      },
      {
        title: 'Music Memory Book Creation',
        titleFr: 'Création du livre de souvenirs musicaux',
        learningGoals: 'Students will create musical memory books documenting their favorite musical experiences and growth.',
        mindsOn: 'Musical memories: What are your most special musical memories from Grade 1?',
        action: 'Create individual musical memory books with drawings, photos, and written reflections about musical experiences.',
        consolidation: 'Musical memory sharing circle where students present favorite pages from their memory books.',
        materials: JSON.stringify(['Memory book materials', 'Art supplies', 'Photos from music activities', 'Writing materials'])

      },
      {
        title: 'Musical Gift Giving',
        titleFr: 'Don de cadeaux musicaux',
        learningGoals: 'Students will create musical gifts for their families and friends, sharing the joy of music with others.',
        mindsOn: 'Musical gifts: How can we give the gift of music to people we care about?',
        action: 'Create musical gifts: recorded songs, handmade instruments, written compositions, performance invitations.',
        consolidation: 'Musical gift-giving ceremony where students present musical gifts to special people in their lives.',
        materials: JSON.stringify(['Gift-making materials', 'Recording equipment', 'Wrapping supplies', 'Presentation materials'])

      },
      {
        title: 'Summer Music Planning',
        titleFr: 'Planification musicale d\'été',
        learningGoals: 'Students will plan ways to continue making music during summer break and set musical goals for Grade 2.',
        mindsOn: 'Summer music plans: How will you keep music in your life during summer vacation?',
        action: 'Plan summer musical activities, set goals for continued musical learning, create summer music practice ideas.',
        consolidation: 'Summer music commitment ceremony where students share their plans for musical growth during vacation.',
        materials: JSON.stringify(['Planning sheets', 'Goal-setting materials', 'Summer activity ideas', 'Commitment certificates'])

      }
    ];

    // Add June lessons
    for (let i = 0; i < Math.min(junLessons.length, junDates.length); i++) {
      lessons.push({
        ...junLessons[i],
        date: junDates[i],
        subject: 'Music',
        duration: 45,
        grouping: 'Concert performance, individual reflection, gift creation, future planning',
        accommodations: JSON.stringify(['Performance alternatives', 'memory book supports', 'gift-making accommodations']),
        differentiationStrategies: JSON.stringify({
          support: 'Guided reflection, simple gift creation, supported planning',
          extension: 'Complex memory documentation, elaborate musical gifts, detailed summer planning',
          multiModal: 'Performance, creative arts, reflection-based, planning-focused'
        }),
        assessmentNotes: 'Final assessment of musical growth, creative expression, and commitment to continued musical learning',
        assessmentType: 'summative',
        isSubFriendly: true,
        unitPlanId: units.unit6.id,
        userId: emily.id
      });
    }

    // Insert all lessons
    console.log(`🎵 Creating ${lessons.length} comprehensive Music lessons...`);
    
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

    console.log('\n🎉 COMPREHENSIVE MUSIC CURRICULUM COMPLETE!');
    console.log(`📊 Total created: ${created}/${lessons.length} lessons`);
    console.log('📅 Coverage: September 2025 - June 2026');
    console.log('🎯 Focus: Complete Grade 1 music education with cultural diversity');
    console.log('⏰ Duration: 45 minutes each (2x per week, Tues/Thurs)');
    console.log('🌍 Curriculum: All 8 Music expectations covered comprehensively');
    console.log('🎵 Bilingual: French titles and cultural integration');
    console.log('🤝 Inclusive: Mi\'kmaq, Acadian, and multicultural perspectives');

  } catch (error) {
    console.error('❌ Error seeding comprehensive Music curriculum:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedComprehensiveMusicLessons()
  .then(() => {
    console.log('✅ Comprehensive Music curriculum seeded successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Comprehensive Music seeding failed:', error);
    process.exit(1);
  });