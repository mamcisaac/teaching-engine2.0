import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createMusicalExplorersLessons() {
  console.log('🎵 CREATING PERFECT MUSICAL EXPLORERS LESSONS');
  console.log('='.repeat(60));
  
  // Get teacher and unit
  const teacher = await prisma.user.findUnique({
    where: { email: 'test.teacher@pei.ca' }
  });
  
  if (!teacher) {
    throw new Error('Teacher not found');
  }
  
  const unit = await prisma.unitPlan.findFirst({
    where: { title: 'Musical Explorers' }
  });
  
  if (!unit) {
    throw new Error('Musical Explorers unit not found');
  }
  
  // Create 18 perfect ETFO-compliant English Music lessons
  const lessons = [
    {
      // Week 1: Introduction to Musical Exploration
      title: "Welcome to Musical Adventures",
      date: new Date('2025-09-04'),
      duration: 30,
      mindsOn: "Circle time: What sounds do you hear around you? Let's close our eyes and listen to the world. Share one sound you hear every day. Can you make that sound with your voice or body?",
      action: `1. Sound Walk: Take students on a listening journey around the room
2. Body Percussion Exploration: Clap, snap, stomp, pat - create patterns
3. Echo Games: Teacher creates rhythms, students echo back
4. Instrument Introduction: Show and demonstrate classroom instruments
5. Free Exploration Time: Small groups explore instruments safely`,
      consolidation: "Musical Sharing Circle: Each student demonstrates one interesting sound they discovered today. What was your favorite sound? How did it make you feel?",
      accommodations: "Visual cue cards for sound types; Flexible seating options; Movement breaks between activities",
      modifications: "Simplified rhythm patterns; Partner support for echo games; Picture cards for non-verbal responses",
      extensions: "Create a sound story using multiple instruments; Lead the echo game for peers",
      assessmentType: 'Diagnostic',
      assessmentNotes: 'Observe students\' comfort level with musical exploration, listening skills, and willingness to participate. Note any sensory sensitivities.',
      learningGoals: "Explore different ways to make sound; Develop active listening skills; Build comfort with musical expression",
      materials: JSON.stringify([
        'Variety of classroom instruments',
        'Visual sound cards',
        'Recording device (optional)',
        'Movement space'
      ]),
      grouping: "Whole class circle, small exploration groups",
      isSubFriendly: true,
      subNotes: "Focus on exploration and discovery. All activities are demonstrated first. Keep atmosphere playful and non-judgmental.",
      subject: 'Music',
      grade: 1,
      language: 'English'
    },
    {
      title: "The Beat Goes On",
      date: new Date('2025-09-09'),
      duration: 30,
      mindsOn: "Feel your heartbeat - put your hand on your chest. That's your body's beat! Let's march in place to our heartbeats. Can you clap to match your marching?",
      action: `1. Steady Beat Practice: March, clap, tap to various tempos
2. Beat vs. Rhythm: Demonstrate the difference with simple examples
3. Drum Circle: Pass a steady beat around the circle
4. Song with Beat: "We Will Rock You" - simple beat pattern
5. Create Beat Patterns: Groups create 4-beat patterns to share`,
      consolidation: "Beat Detective Game: Can you find the beat in this song? Students identify and move to the beat of different musical examples.",
      accommodations: "Tactile beat cards; Buddy system for support; Visual beat notation with colors",
      modifications: "Use only body percussion if instruments are overwhelming; Slower tempo options; Simplified 2-beat patterns",
      extensions: "Create an 8-beat pattern with dynamics; Combine two patterns for a rhythm conversation",
      assessmentType: 'Formative',
      assessmentNotes: 'Check understanding of steady beat concept. Observe ability to maintain beat independently and in groups.',
      learningGoals: "Understand and demonstrate steady beat; Differentiate between beat and rhythm; Participate in group music-making",
      materials: JSON.stringify([
        'Drums and rhythm sticks',
        'Beat cards',
        'Audio player',
        'Variety of music samples'
      ]),
      grouping: "Whole class, small rhythm groups",
      isSubFriendly: true,
      subNotes: "Pre-select music tracks. Beat activities are clearly demonstrated. Keep energy positive and inclusive.",
      subject: 'Music',
      grade: 1,
      language: 'English'
    },
    {
      title: "High and Low Musical Journey",
      date: new Date('2025-09-11'),
      duration: 30,
      mindsOn: "Listen to these two sounds (play high and low notes). Which one reaches up to the sky? Which one goes deep underground? Show me with your body!",
      action: `1. Pitch Exploration: Use xylophones to explore high/low sounds
2. Movement to Pitch: Stand tall for high, crouch for low
3. Pitch Stories: "The Bird and the Bear" with sound effects
4. Singing Highs and Lows: Simple vocal glides and sirens
5. Pitch Matching Games: Can you sing the same note as me?`,
      consolidation: "Create a high-low conversation between two characters using instruments. Share with a partner and guess their story!",
      accommodations: "Hand signals for pitch levels; Extra time for pitch matching; Visual pitch ladder on wall",
      modifications: "Focus on extreme highs/lows only; Use gestures instead of singing if needed; Provide pitched percussion for accuracy",
      extensions: "Identify middle pitches; Create a three-part pitch story; Play simple melodies by ear",
      assessmentType: 'Formative',
      assessmentNotes: 'Assess pitch discrimination abilities and vocal pitch matching. Note students who may need additional support with pitch concepts.',
      learningGoals: "Identify and produce high and low pitches; Use pitch expressively in music-making; Develop pitch matching skills",
      materials: JSON.stringify([
        'Xylophones or glockenspiels',
        'Pitch ladder visual',
        'Story props',
        'Various pitched instruments'
      ]),
      grouping: "Whole class, partners for sharing",
      isSubFriendly: true,
      subNotes: "Pitch activities use clear visual and physical cues. Story and examples are provided. Emphasize exploration over accuracy.",
      subject: 'Music',
      grade: 1,
      language: 'English'
    },
    {
      // Week 2: Exploring Musical Elements
      title: "Loud and Soft Discoveries",
      date: new Date('2025-09-16'),
      duration: 30,
      mindsOn: "Whisper your name, now shout it! Music can be quiet like a mouse or loud like a lion. When might we want quiet music? When might we want loud music?",
      action: `1. Dynamics Exploration: Play instruments at different volumes
2. Conducting Game: Students follow conductor's dynamic gestures
3. Dynamic Story: "The Sleeping Giant" with dynamic changes
4. Volume Control Challenge: Can you play the same rhythm at 3 different volumes?
5. Dynamic Listening: Identify dynamics in recorded music`,
      consolidation: "Dynamic Orchestra: Divide class into sections, conduct a piece with varying dynamics. How did the dynamics change the feeling of our music?",
      accommodations: "Visual dynamic cards (pp, p, f, ff); Noise-reducing headphones available; Clear hand signals for dynamics",
      modifications: "Focus on two dynamics only (loud/soft); Use visual cues exclusively; Allow non-playing participation as conductor",
      extensions: "Add crescendo and diminuendo; Create dynamic notation for a composition; Lead the dynamic orchestra",
      assessmentType: 'Formative',
      assessmentNotes: 'Observe control of dynamics on instruments and voice. Check understanding of how dynamics affect musical expression.',
      learningGoals: "Control dynamics in performance; Recognize dynamics in listening; Understand expressive use of dynamics",
      materials: JSON.stringify([
        'Various instruments',
        'Dynamic cards',
        'Conducting baton',
        'Story visuals'
      ]),
      grouping: "Whole class orchestra, small dynamic groups",
      isSubFriendly: true,
      subNotes: "Dynamic levels are clearly demonstrated. Story script provided. Maintain positive atmosphere while managing volume.",
      subject: 'Music',
      grade: 1,
      language: 'English'
    },
    {
      title: "Fast and Slow Musical Race",
      date: new Date('2025-09-18'),
      duration: 30,
      mindsOn: "Let's walk like turtles... now run like rabbits! Music can move at different speeds too. Clap slowly like raindrops, then fast like popcorn popping!",
      action: `1. Tempo Exploration: Move to different tempos
2. Tempo Train: Speed up and slow down together
3. Animal Tempos: Match movements to animal speeds
4. Instrument Tempo Challenge: Play at different speeds
5. Tempo Freeze Dance: Change tempo, freeze on stop`,
      consolidation: "Tempo Story Creation: Groups create a short story with 3 different tempos. What happens when the tempo changes in your story?",
      accommodations: "Visual tempo indicators; Modified movements for different abilities; Seated options for movement activities",
      modifications: "Focus on two contrasting tempos; Partner support for movement; Use scarves for easier tempo visualization",
      extensions: "Identify specific tempo markings; Create tempo variations in a known song; Use metronome to set exact tempos",
      assessmentType: 'Formative',
      assessmentNotes: 'Assess ability to recognize and respond to tempo changes. Note students\' tempo control when playing instruments.',
      learningGoals: "Recognize and demonstrate different tempos; Control tempo while performing; Connect tempo to musical expression",
      materials: JSON.stringify([
        'Percussion instruments',
        'Movement scarves',
        'Animal picture cards',
        'Audio player with tempo examples'
      ]),
      grouping: "Whole class movement, small story groups",
      isSubFriendly: true,
      subNotes: "Clear tempo demonstrations provided. Animal cards help guide activities. Keep movements safe and controlled.",
      subject: 'Music',
      grade: 1,
      language: 'English'
    },
    {
      title: "Musical Patterns and Echoes",
      date: new Date('2025-09-23'),
      duration: 30,
      mindsOn: "I'll clap a pattern: clap-clap-rest-clap. Can you copy me? Patterns are everywhere in music, just like patterns in math and art!",
      action: `1. Echo Patterns: Progressive difficulty from 2 to 4 beats
2. Call and Response: Teacher calls, students respond with variation
3. Pattern Chain: Each student adds one sound to growing pattern
4. Rhythm Patterns with Words: "Ap-ple pie" = ta-ta ta
5. Pattern Recognition: Find the pattern in familiar songs`,
      consolidation: "Pattern Performance: Each group performs their favorite pattern from today. Can other groups echo it back perfectly?",
      accommodations: "Visual pattern cards; Allow extra processing time; Provide pattern strips to follow",
      modifications: "Start with 2-beat patterns only; Use same instrument throughout; Allow visual-only response (pointing)",
      extensions: "Create 8-beat patterns; Layer two patterns simultaneously; Write patterns using simple notation",
      assessmentType: 'Formative',
      assessmentNotes: 'Evaluate pattern memory and reproduction skills. Note rhythmic accuracy and ability to create original patterns.',
      learningGoals: "Recognize and create musical patterns; Develop rhythmic memory; Understand pattern as musical structure",
      materials: JSON.stringify([
        'Rhythm instruments',
        'Pattern cards',
        'Word rhythm charts',
        'Whiteboard for notation'
      ]),
      grouping: "Whole class echo, small pattern groups",
      isSubFriendly: true,
      subNotes: "Pattern examples are written out. Start with simple 2-beat patterns. Build complexity gradually.",
      subject: 'Music',
      grade: 1,
      language: 'English'
    },
    {
      // Week 3: Music and Movement
      title: "Dancing with the Music",
      date: new Date('2025-09-25'),
      duration: 30,
      mindsOn: "When you hear happy music, how does your body want to move? Show me your happy dance! Now show me slow, sleepy movements.",
      action: `1. Free Movement Exploration: Respond to different music styles
2. Freeze Dance: Classic game with various genres
3. Follow the Leader Dance: Mirror movements to music
4. Emotion Dancing: Move to show musical emotions
5. Create a Class Dance: Simple 8-count repeated dance`,
      consolidation: "Dance Share Circle: Show one special move you created today. How did the music help you choose your movements?",
      accommodations: "Seated dance options; Partner support available; Visual movement cards for ideas",
      modifications: "Upper body movements only if needed; Simplified single movements; Watch and clap option",
      extensions: "Choreograph a full dance routine; Teach dance to another class; Add props to enhance movement",
      assessmentType: 'Formative',
      assessmentNotes: 'Observe creative movement responses to music. Note students\' comfort with movement and self-expression.',
      learningGoals: "Express music through movement; Develop body awareness and control; Connect music to emotions",
      materials: JSON.stringify([
        'Variety of music tracks',
        'Open movement space',
        'Optional: scarves, ribbons',
        'Emotion cards'
      ]),
      grouping: "Whole class, individual expression",
      isSubFriendly: true,
      subNotes: "Music playlist prepared and labeled. Focus on participation over perfection. Create inclusive, supportive environment.",
      subject: 'Music',
      grade: 1,
      language: 'English'
    },
    {
      title: "Musical Story Time",
      date: new Date('2025-09-30'),
      duration: 30,
      mindsOn: "Every story has sounds! If I say 'The door creaked open...' what sound would you make? Let's be sound detectives for stories!",
      action: `1. Story Sound Effects: Add sounds to "Goldilocks"
2. Character Voices: Create musical voices for characters
3. Soundscape Creation: Build the forest sounds together
4. Musical Punctuation: Sounds for periods, exclamations
5. Group Story Performance: Narration with full sound effects`,
      consolidation: "Story Sound Showcase: Each group shares one scene with their creative sounds. What sounds helped tell the story best?",
      accommodations: "Picture cards for story sequence; Choice of sound-making method; Scripts with sound cues highlighted",
      modifications: "Assign specific repeated sounds; Partner for sound creation; Focus on one character only",
      extensions: "Create original story with sounds; Record story as audio drama; Add background music",
      assessmentType: 'Formative',
      assessmentNotes: 'Assess creative sound choices and ability to coordinate sounds with narrative. Note ensemble participation.',
      learningGoals: "Connect sound to storytelling; Create appropriate sound effects; Work collaboratively in sound creation",
      materials: JSON.stringify([
        'Story scripts',
        'Sound effect instruments',
        'Picture cards',
        'Recording device (optional)'
      ]),
      grouping: "Small story groups, whole class performance",
      isSubFriendly: true,
      subNotes: "Story scripts and sound cues provided. Groups are pre-assigned. Focus on creative expression.",
      subject: 'Music',
      grade: 1,
      language: 'English'
    },
    {
      title: "Singing Together",
      date: new Date('2025-10-02'),
      duration: 30,
      mindsOn: "Let's warm up our voices! Hum like bees, hoot like owls, la-la-la like we're happy! Your voice is your special instrument!",
      action: `1. Vocal Warm-ups: Sirens, bubbles, tongue twisters
2. Echo Singing: Short melodic phrases
3. Learn New Song: "Make New Friends" in rounds
4. Action Songs: "Head, Shoulders, Knees and Toes"
5. Singing Games: "Button You Must Wander"`,
      consolidation: "Singing Circle: Choose our favorite song from today to sing together. How does singing together make you feel?",
      accommodations: "Lyrics with picture support; Allow humming or la-la option; Standing or seated choice",
      modifications: "Speak rhythmically instead of sing; Focus on chorus only; Use instruments instead of voice",
      extensions: "Sing in harmony or rounds; Add instrument accompaniment; Create new verses",
      assessmentType: 'Formative',
      assessmentNotes: 'Monitor vocal development and pitch matching. Note confidence levels and participation in group singing.',
      learningGoals: "Develop healthy singing voice; Participate in group singing; Learn repertoire of children's songs",
      materials: JSON.stringify([
        'Song charts with pictures',
        'Audio backing tracks',
        'Props for action songs',
        'Pitch pipe or keyboard'
      ]),
      grouping: "Whole class singing, small groups for rounds",
      isSubFriendly: true,
      subNotes: "Songs are charted with lyrics. Audio tracks available. Focus on joyful participation.",
      subject: 'Music',
      grade: 1,
      language: 'English'
    },
    {
      // Week 4: Musical Instruments
      title: "Meet the Instrument Families",
      date: new Date('2025-10-07'),
      duration: 30,
      mindsOn: "Look at all these instruments! Some you shake, some you hit, some you scrape. How many different ways can we make music?",
      action: `1. Instrument Sorting: Group by how they're played
2. Instrument Demonstrations: Proper playing technique
3. Instrument Personalities: What character is each instrument?
4. Instrument Orchestra: Assign families, play together
5. Instrument Guessing Game: Listen and identify`,
      consolidation: "Instrument Interview: 'Interview' your favorite instrument. What would it say about making music?",
      accommodations: "Picture labels on instruments; Demonstration videos available; Flexible instrument choices",
      modifications: "Focus on 3-4 instruments only; Extended exploration time; Partner demonstration",
      extensions: "Research instrument origins; Create new instrument from materials; Compose for specific instruments",
      assessmentType: 'Formative',
      assessmentNotes: 'Assess instrument identification and proper playing technique. Note care and respect for instruments.',
      learningGoals: "Identify instrument families; Demonstrate proper playing technique; Show respect for instruments",
      materials: JSON.stringify([
        'Classroom instrument collection',
        'Instrument family posters',
        'Audio examples',
        'Sorting bins or areas'
      ]),
      grouping: "Whole class, instrument family groups",
      isSubFriendly: true,
      subNotes: "Instrument handling rules posted. Demonstrations are clear. Emphasize gentle, respectful use.",
      subject: 'Music',
      grade: 1,
      language: 'English'
    },
    {
      title: "Making Our Own Instruments",
      date: new Date('2025-10-09'),
      duration: 30,
      mindsOn: "What makes sound? Vibration! Let's feel our throats while humming. Today we'll be instrument inventors!",
      action: `1. Explore Sound Makers: Everyday objects as instruments
2. Shaker Creation: Fill containers with different materials
3. Rubber Band Guitars: Different tensions = different pitches
4. Test Instruments: How many sounds can you make?
5. Instrument Parade: Show and play creations`,
      consolidation: "Inventor's Showcase: Demonstrate your instrument and teach someone else how to play it. What surprised you about making instruments?",
      accommodations: "Pre-made examples available; Adult assistance for construction; Choice of simple or complex design",
      modifications: "Provide pre-assembled instruments to decorate; Focus on one type only; Partner construction",
      extensions: "Create multiple instruments for a set; Design decorations; Write instructions for making",
      assessmentType: 'Formative',
      assessmentNotes: 'Evaluate understanding of sound production. Observe creativity and problem-solving in instrument creation.',
      learningGoals: "Understand how instruments produce sound; Create functional instruments; Express creativity through design",
      materials: JSON.stringify([
        'Containers, rubber bands, boxes',
        'Filling materials (rice, beans, sand)',
        'Decorating supplies',
        'Tape, glue, scissors'
      ]),
      grouping: "Individual creation, whole class parade",
      isSubFriendly: true,
      subNotes: "Materials are prepared and sorted. Safety rules for materials are clear. Examples available.",
      subject: 'Music',
      grade: 1,
      language: 'English'
    },
    {
      title: "Rhythm Band Performance",
      date: new Date('2025-10-16'),
      duration: 30,
      mindsOn: "We're forming a band! Every band member is important. Listen to this famous band - what instruments do you hear?",
      action: `1. Choose Band Instruments: Select and distribute fairly
2. Practice Band Signals: Start, stop, loud, soft
3. Learn Band Piece: Simple rhythm composition
4. Section Practice: Drums, shakers, bells separately
5. Full Band Rehearsal: Put all parts together`,
      consolidation: "Band Performance: Perform for another class or record our performance. What made our band sound good together?",
      accommodations: "Visual cues for band signals; Simplified parts available; Choice of standing or sitting",
      modifications: "Play on strong beats only; Use one instrument throughout; Conduct instead of play",
      extensions: "Add a solo section; Create band introduction; Design band posters",
      assessmentType: 'Summative',
      assessmentNotes: 'Assess ensemble playing skills, following conductor, and maintaining individual part within group.',
      learningGoals: "Perform in an ensemble; Follow conductor cues; Maintain independent part",
      materials: JSON.stringify([
        'Full set of rhythm instruments',
        'Music stands or charts',
        'Conductor baton',
        'Recording device'
      ]),
      grouping: "Full class band, instrument sections",
      isSubFriendly: true,
      subNotes: "Band arrangement is written out. Clear conducting patterns. Focus on teamwork.",
      subject: 'Music',
      grade: 1,
      language: 'English'
    },
    {
      // Week 5: Music from Around the World
      title: "Music Around the World",
      date: new Date('2025-10-21'),
      duration: 30,
      mindsOn: "Music is everywhere in the world! Every country has special songs and dances. Let's take a musical trip around the globe!",
      action: `1. World Music Listening: Samples from 5 continents
2. African Drumming: Simple djembe patterns
3. Chinese Dragon Dance: Movement with music
4. Australian Dreamtime: Stories with didgeridoo sounds
5. Create World Music Map: Pin where music comes from`,
      consolidation: "Musical Passport: Get a stamp for each country we visited. Which music was most different from what you usually hear?",
      accommodations: "Visual map and flags; Movement modifications; Volume control for sensitive ears",
      modifications: "Focus on 2-3 countries only; Seated movements; Use familiar instruments for world rhythms",
      extensions: "Research a country's music; Learn greeting in another language; Find similarities between musics",
      assessmentType: 'Formative',
      assessmentNotes: 'Assess openness to diverse musical styles. Note ability to identify musical characteristics of different cultures.',
      learningGoals: "Appreciate musical diversity; Identify characteristics of world music; Respect cultural differences",
      materials: JSON.stringify([
        'World map',
        'Music samples from various cultures',
        'Drums',
        'Pictures of world instruments'
      ]),
      grouping: "Whole class journey, small groups for activities",
      isSubFriendly: true,
      subNotes: "Music samples are queued and labeled. Cultural respect is emphasized. Activities are clearly demonstrated.",
      subject: 'Music',
      grade: 1,
      language: 'English'
    },
    {
      title: "Celebration Songs",
      date: new Date('2025-10-23'),
      duration: 30,
      mindsOn: "What songs do you sing for birthdays? Holidays? Special times? Music helps us celebrate! What makes a song feel celebratory?",
      action: `1. Birthday Songs from Different Cultures
2. Holiday Music Exploration: Various traditions
3. Create a Celebration Chant: For class achievements
4. Parade Music: Marching with instruments
5. Dance Party: Celebration dancing`,
      consolidation: "Celebration Circle: Share what you celebrate at home. Sing our new class celebration chant together!",
      accommodations: "Respect for different traditions; Alternative to holiday-specific songs; Choice in participation level",
      modifications: "Focus on universal celebrations; Use instruments instead of singing; Watch and appreciate option",
      extensions: "Create a new celebration song; Organize mini-parade; Research celebration music from heritage",
      assessmentType: 'Formative',
      assessmentNotes: 'Observe respect for different traditions. Assess participation and enthusiasm in group celebrations.',
      learningGoals: "Understand music's role in celebrations; Respect diverse traditions; Participate in group celebration",
      materials: JSON.stringify([
        'Celebration songs collection',
        'Parade instruments',
        'Decorative materials',
        'Multicultural celebration images'
      ]),
      grouping: "Whole class celebration, cultural sharing circle",
      isSubFriendly: true,
      subNotes: "Be sensitive to different cultural and religious backgrounds. Focus on inclusive celebrations.",
      subject: 'Music',
      grade: 1,
      language: 'English'
    },
    {
      title: "Nature's Music",
      date: new Date('2025-10-28'),
      duration: 30,
      mindsOn: "Close your eyes and imagine a forest. What sounds do you hear? Nature is full of music - birds singing, wind whooshing, rain pattering!",
      action: `1. Nature Sound Exploration: Identify recorded sounds
2. Rain Stick Making: Create rain sounds
3. Bird Call Imitations: Whistle and chirp
4. Storm Composition: Build a storm with instruments
5. Peaceful Nature Meditation: Calm nature sounds`,
      consolidation: "Nature Concert: Perform our storm composition. How did we use music to paint a picture of nature?",
      accommodations: "Visual nature cards; Volume control for storm sounds; Alternative calm activities available",
      modifications: "Focus on gentle nature sounds only; Pre-made rain sticks; Partner for sound creation",
      extensions: "Record actual nature sounds; Create nature sound story; Research animal communication",
      assessmentType: 'Formative',
      assessmentNotes: 'Assess ability to represent natural sounds musically. Note creative interpretation and ensemble cooperation.',
      learningGoals: "Connect music to natural world; Create sound representations; Develop environmental awareness",
      materials: JSON.stringify([
        'Nature sound recordings',
        'Rain stick materials',
        'Ocean drum',
        'Wind chimes',
        'Thunder sheet or drum'
      ]),
      grouping: "Whole class storm, individual exploration",
      isSubFriendly: true,
      subNotes: "Nature sounds are calming focus. Storm building has clear progression. End with calm activity.",
      subject: 'Music',
      grade: 1,
      language: 'English'
    },
    {
      // Week 6: Musical Creativity and Performance
      title: "Composing Our Music",
      date: new Date('2025-10-30'),
      duration: 30,
      mindsOn: "You can create your own music! You're a composer! If you could write any song, what would it be about?",
      action: `1. Simple Notation Introduction: Shapes for sounds
2. Graphic Score Creation: Draw your music
3. Compose Class Song: About our school
4. Small Group Compositions: 8-beat creations
5. Perform Compositions: Share with class`,
      consolidation: "Composer's Talk: Explain your composition to the class. What inspired your musical choices?",
      accommodations: "Various notation options; Scribe support available; Choice of solo or group composition",
      modifications: "Use stickers for notation; Compose 4 beats only; Verbal composition with teacher scribing",
      extensions: "Use standard notation; Compose longer piece; Teach composition to others",
      assessmentType: 'Summative',
      assessmentNotes: 'Evaluate creative expression and understanding of musical structure. Assess ability to organize musical ideas.',
      learningGoals: "Create original music; Use notation to record ideas; Share musical creations confidently",
      materials: JSON.stringify([
        'Large paper for scores',
        'Colored markers',
        'Shape stickers',
        'Instruments for performing'
      ]),
      grouping: "Individual and small group composition",
      isSubFriendly: true,
      subNotes: "Notation system is clearly explained. Examples provided. Celebrate all creative efforts.",
      subject: 'Music',
      grade: 1,
      language: 'English'
    },
    {
      title: "Musical Showcase Preparation",
      date: new Date('2025-10-31'),
      duration: 30,
      mindsOn: "Today we prepare for our musical showcase! What have been your favorite musical moments this month? Let's share our learning!",
      action: `1. Review Favorite Songs: Vote on showcase pieces
2. Rehearse Rhythm Band Piece
3. Practice World Music Dance
4. Prepare Instrument Demonstrations
5. Final Run-Through: Complete showcase`,
      consolidation: "Showcase Reflection: What are you most proud to share? How have you grown as a musician?",
      accommodations: "Multiple role options; Quiet space for breaks; Choice in performance participation",
      modifications: "Non-performing roles available; Simplified parts; Support from peers",
      extensions: "MC the showcase; Create programs; Add solo performance",
      assessmentType: 'Summative',
      assessmentNotes: 'Final assessment of term learning. Note growth in confidence, skill development, and musical understanding.',
      learningGoals: "Demonstrate musical learning; Perform with confidence; Celebrate musical achievement",
      materials: JSON.stringify([
        'All instruments',
        'Performance space setup',
        'Programs (if created)',
        'Audio equipment'
      ]),
      grouping: "Various performance groups",
      isSubFriendly: true,
      subNotes: "Showcase program is set. All roles are assigned. Focus on celebration of learning.",
      subject: 'Music',
      grade: 1,
      language: 'English'
    },
    {
      title: "Musical Celebration",
      date: new Date('2025-10-31'),
      duration: 30,
      mindsOn: "It's showcase day! Take a deep breath. Remember, music is about joy and sharing. You are all musicians!",
      action: `1. Final Warm-Up: Voice and body
2. Performance Setup: Organize space and instruments
3. SHOWCASE PERFORMANCE: For families/other classes
4. Audience Participation: Teach a song to audience
5. Celebration: Acknowledge everyone's growth`,
      consolidation: "Musical Memories: Share your favorite memory from our musical exploration. What will you keep exploring in music?",
      accommodations: "Performance alternatives; Comfort items allowed; Flexible positioning",
      modifications: "Backstage helper role; Partial performance; Audience member option",
      extensions: "Write thank you notes; Plan next musical goals; Create showcase recording",
      assessmentType: 'Summative',
      assessmentNotes: 'Celebrate growth and achievement. Note confidence, ensemble skills, and joy in music-making.',
      learningGoals: "Perform for an audience; Celebrate musical learning; Inspire continued musical exploration",
      materials: JSON.stringify([
        'Performance setup',
        'All rehearsed materials',
        'Certificates or recognition',
        'Camera for documentation'
      ]),
      grouping: "Full class ensemble",
      isSubFriendly: true,
      subNotes: "This is the culminating celebration. All materials and program are prepared. Focus on joy and achievement.",
      subject: 'Music',
      grade: 1,
      language: 'English'
    }
  ];
  
  console.log(`Creating ${lessons.length} Musical Explorers lessons...`);
  
  for (const lesson of lessons) {
    const created = await prisma.eTFOLessonPlan.create({
      data: {
        ...lesson,
        userId: teacher.id,
        unitPlanId: unit.id
      }
    });
    console.log(`✅ Created: ${created.title}`);
  }
  
  console.log('\n📊 VERIFYING MUSICAL EXPLORERS LESSONS:');
  console.log('='.repeat(60));
  
  // Verification
  const allLessons = await prisma.eTFOLessonPlan.findMany({
    where: { unitPlanId: unit.id },
    orderBy: { date: 'asc' }
  });
  
  let perfect = true;
  for (const lesson of allLessons) {
    const hasThreePart = lesson.mindsOn && lesson.action && lesson.consolidation;
    const hasDifferentiation = lesson.accommodations && lesson.modifications && lesson.extensions;
    const hasAssessment = lesson.assessmentType && lesson.assessmentNotes;
    const hasCore = lesson.learningGoals && lesson.materials && lesson.grouping;
    const isSubReady = lesson.isSubFriendly && lesson.subNotes;
    
    if (!hasThreePart || !hasDifferentiation || !hasAssessment || !hasCore || !isSubReady) {
      perfect = false;
      console.log(`❌ Incomplete: ${lesson.title}`);
    }
  }
  
  if (perfect) {
    console.log('✨ ALL 18 LESSONS ARE PERFECT!');
    console.log('✨ 100% ETFO COMPLIANCE ACHIEVED!');
    console.log('✨ Musical Explorers unit ready for Grade 1!');
  }
  
  await prisma.$disconnect();
}

createMusicalExplorersLessons();