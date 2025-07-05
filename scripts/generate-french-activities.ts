import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function generateFrenchImmersionActivities() {
  console.log('🎯 Generating Grade 1 French Immersion activities for Emily...');

  // Get Emily's user ID
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });

  if (!emily) {
    console.error('Emily McIsaac user not found!');
    return;
  }

  // Create external activities representing resources from Teachers Pay Teachers, educational websites, etc.
  const externalActivities = [
    // Welcome to French Theme Activities
    {
      externalId: 'tpt_french_greetings_001',
      source: 'Teachers Pay Teachers',
      url: 'https://www.teacherspayteachers.com/Product/French-Greetings-Grade-1',
      title: 'French Greetings Interactive Cards',
      description: 'Colorful greeting cards with common French phrases for Grade 1 students. Includes "Bonjour", "Au revoir", "Comment ça va?", and responses.',
      thumbnailUrl: 'https://example.com/french-greetings-thumb.jpg',
      duration: 20,
      activityType: 'vocabulary cards',
      gradeMin: 1,
      gradeMax: 1,
      subject: 'French',
      language: 'fr',
      materials: JSON.stringify(['Laminated cards', 'Velcro for matching', 'Storage container']),
      technology: JSON.stringify(['Optional: Interactive whiteboard for whole group']),
      groupSize: 'pairs or small group',
      sourceRating: 4.8,
      sourceReviews: 156,
      curriculumTags: JSON.stringify(['CO1.1', 'CO1.2']),
      learningGoals: JSON.stringify([
        'Students will greet others in French',
        'Students will respond to basic questions in French',
        'Students will practice French pronunciation'
      ]),
      isFree: false,
      price: 3.50,
      license: 'Single classroom use',
      isActive: true,
    },
    {
      externalId: 'tpt_classroom_vocab_002',
      source: 'Teachers Pay Teachers',
      url: 'https://www.teacherspayteachers.com/Product/French-Classroom-Objects-Grade-1',
      title: 'Classroom Objects in French - Picture Dictionary',
      description: 'Visual dictionary with 25 common classroom objects labeled in French. Perfect for immersion classrooms.',
      duration: 30,
      activityType: 'picture dictionary',
      gradeMin: 1,
      gradeMax: 2,
      subject: 'French',
      language: 'fr',
      materials: JSON.stringify(['Printed picture cards', 'Word labels', 'Pocket chart']),
      groupSize: 'whole class',
      sourceRating: 4.9,
      sourceReviews: 203,
      curriculumTags: JSON.stringify(['L1.1', 'CO1.1']),
      learningGoals: JSON.stringify([
        'Identify classroom objects in French',
        'Match pictures to French words',
        'Use classroom vocabulary in sentences'
      ]),
      isFree: false,
      price: 4.25,
      isActive: true,
    },
    // Numbers and Colors Theme Activities
    {
      externalId: 'first_grade_frenchies_numbers',
      source: 'First Grade Frenchies Blog',
      url: 'https://www.firstgradefrenchies.com/numbers-1-20-activities',
      title: 'Numbers 1-20 French Song and Movement',
      description: 'Engaging song with actions to help students learn and remember French numbers 1-20. Includes video demonstration.',
      duration: 15,
      activityType: 'song and movement',
      gradeMin: 1,
      gradeMax: 2,
      subject: 'French Mathematics',
      language: 'fr',
      materials: JSON.stringify(['Audio file', 'Action cards', 'Number props']),
      groupSize: 'whole class',
      sourceRating: 4.7,
      sourceReviews: 89,
      curriculumTags: JSON.stringify(['N1.1', 'CO1.1']),
      learningGoals: JSON.stringify([
        'Count from 1-20 in French',
        'Associate numbers with quantities',
        'Practice French pronunciation through song'
      ]),
      isFree: true,
      isActive: true,
    },
    {
      externalId: 'tpt_color_games_003',
      source: 'Teachers Pay Teachers',
      url: 'https://www.teacherspayteachers.com/Product/French-Colors-Games-Grade-1',
      title: 'French Colors Memory Game and Bingo',
      description: 'Memory matching game and bingo cards featuring French color words. Great for centers or whole group fun!',
      duration: 25,
      activityType: 'game',
      gradeMin: 1,
      gradeMax: 2,
      subject: 'French',
      language: 'fr',
      materials: JSON.stringify(['Game cards', 'Bingo boards', 'Calling cards', 'Counters']),
      groupSize: 'small group',
      sourceRating: 4.6,
      sourceReviews: 134,
      curriculumTags: JSON.stringify(['L1.1', 'CO1.1']),
      learningGoals: JSON.stringify([
        'Recognize French color words',
        'Practice color vocabulary through play',
        'Follow game instructions in French'
      ]),
      isFree: false,
      price: 2.75,
      isActive: true,
    },
    // Family Theme Activities
    {
      externalId: 'canadian_french_resources_family',
      source: 'Canadian French Resources',
      url: 'https://www.canadianfrenchresources.com/family-tree-french',
      title: 'My French Family Tree Project',
      description: 'Student-friendly family tree template with French vocabulary labels. Includes extension activities for diverse family structures.',
      duration: 45,
      activityType: 'project',
      gradeMin: 1,
      gradeMax: 3,
      subject: 'French Social Studies',
      language: 'fr',
      materials: JSON.stringify(['Family tree template', 'Family photos', 'French vocabulary cards', 'Crayons/markers']),
      groupSize: 'individual',
      sourceRating: 4.8,
      sourceReviews: 76,
      curriculumTags: JSON.stringify(['SS1.1', 'E1.1']),
      learningGoals: JSON.stringify([
        'Describe family members in French',
        'Use possessive adjectives',
        'Create a visual representation of family'
      ]),
      isFree: true,
      isActive: true,
    },
    // Science Activities in French
    {
      externalId: 'tpt_living_nonliving_004',
      source: 'Teachers Pay Teachers',
      url: 'https://www.teacherspayteachers.com/Product/French-Living-Non-Living-Sort',
      title: 'Living and Non-Living Things Sort (French)',
      description: 'Hands-on sorting activity to classify living and non-living things using French scientific vocabulary.',
      duration: 30,
      activityType: 'sorting activity',
      gradeMin: 1,
      gradeMax: 2,
      subject: 'French Science',
      language: 'fr',
      materials: JSON.stringify(['Picture cards', 'Sorting mats', 'Recording sheets']),
      groupSize: 'pairs',
      sourceRating: 4.5,
      sourceReviews: 92,
      curriculumTags: JSON.stringify(['SV1.1', 'L1.1']),
      learningGoals: JSON.stringify([
        'Classify objects as living or non-living',
        'Use French science vocabulary',
        'Justify classification choices'
      ]),
      isFree: false,
      price: 3.00,
      isActive: true,
    },
    // Phonics and Reading Activities
    {
      externalId: 'for_french_immersion_phonics',
      source: 'For French Immersion',
      url: 'https://www.forfrenchimmersion.com/french-phonics-activities',
      title: 'French Alphabet Sounds and Actions',
      description: 'Multi-sensory approach to learning French letter sounds with corresponding actions and visual cues.',
      duration: 20,
      activityType: 'phonics instruction',
      gradeMin: 1,
      gradeMax: 1,
      subject: 'French Language Arts',
      language: 'fr',
      materials: JSON.stringify(['Alphabet cards', 'Action prompts', 'Mirror for mouth positions']),
      groupSize: 'whole class',
      sourceRating: 4.9,
      sourceReviews: 167,
      curriculumTags: JSON.stringify(['L1.2', 'CO1.1']),
      learningGoals: JSON.stringify([
        'Recognize French letter sounds',
        'Associate letters with actions',
        'Practice correct pronunciation'
      ]),
      isFree: false,
      price: 5.50,
      isActive: true,
    },
    // Math Activities in French
    {
      externalId: 'tpt_french_math_centers_005',
      source: 'Teachers Pay Teachers',
      url: 'https://www.teacherspayteachers.com/Product/French-Math-Centers-Grade-1',
      title: 'Grade 1 French Math Centers Bundle',
      description: 'Six ready-to-use math centers entirely in French: counting, addition, subtraction, shapes, patterns, and measurement.',
      duration: 120,
      activityType: 'center activities',
      gradeMin: 1,
      gradeMax: 1,
      subject: 'French Mathematics',
      language: 'fr',
      materials: JSON.stringify(['Center cards', 'Manipulatives', 'Recording sheets', 'Answer keys']),
      groupSize: 'small group',
      sourceRating: 4.7,
      sourceReviews: 198,
      curriculumTags: JSON.stringify(['N1.1', 'N1.2', 'G1.1', 'M1.1']),
      learningGoals: JSON.stringify([
        'Practice math skills in French',
        'Work independently at centers',
        'Apply mathematical vocabulary'
      ]),
      isFree: false,
      price: 12.00,
      isActive: true,
    },
    // Art and Culture Activities
    {
      externalId: 'french_culture_kids_art',
      source: 'French Culture for Kids',
      url: 'https://www.frenchcultureforkids.com/art-projects-grade-1',
      title: 'French Flag Art Project with Cultural Learning',
      description: 'Learn about French culture while creating flag art. Includes simple facts about France appropriate for Grade 1.',
      duration: 40,
      activityType: 'art project',
      gradeMin: 1,
      gradeMax: 3,
      subject: 'French Arts',
      language: 'fr',
      materials: JSON.stringify(['Construction paper', 'Glue', 'Scissors', 'Crayons', 'France fact cards']),
      groupSize: 'individual',
      sourceRating: 4.4,
      sourceReviews: 55,
      curriculumTags: JSON.stringify(['A1.1', 'SS1.1']),
      learningGoals: JSON.stringify([
        'Learn about French culture',
        'Create art using French colors',
        'Follow instructions in French'
      ]),
      isFree: true,
      isActive: true,
    },
    // French Immersion Songs and Rhymes
    {
      externalId: 'tpt_french_songs_006',
      source: 'Teachers Pay Teachers',
      url: 'https://www.teacherspayteachers.com/Product/French-Songs-Rhymes-Grade-1',
      title: 'Traditional French Songs and Rhymes Collection',
      description: 'Collection of 15 traditional French songs and nursery rhymes with lyrics, audio, and simple actions.',
      duration: 180,
      activityType: 'song collection',
      gradeMin: 1,
      gradeMax: 2,
      subject: 'French Language Arts',
      language: 'fr',
      materials: JSON.stringify(['Song lyrics', 'Audio files', 'Action cards', 'Sheet music']),
      groupSize: 'whole class',
      sourceRating: 4.8,
      sourceReviews: 145,
      curriculumTags: JSON.stringify(['CO1.1', 'M1.1']),
      learningGoals: JSON.stringify([
        'Learn traditional French songs',
        'Practice rhythm and pronunciation',
        'Build cultural connections'
      ]),
      isFree: false,
      price: 8.00,
      isActive: true,
    }
  ];

  // Create all external activities
  let createdActivities = 0;
  for (const activity of externalActivities) {
    try {
      await prisma.externalActivity.create({
        data: activity,
      });
      createdActivities++;
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`Skipping existing activity: ${activity.title}`);
      } else {
        console.error(`Error creating activity ${activity.title}:`, error);
      }
    }
  }

  console.log(`✅ Created ${createdActivities} external activities`);

  // Create activity collections for organizing resources by theme
  const collections = [
    {
      userId: emily.id,
      name: 'Welcome to French - September Activities',
      description: 'Activities for introducing students to French greetings, classroom vocabulary, and basic phrases',
    },
    {
      userId: emily.id,
      name: 'Numbers and Colors - October Focus',
      description: 'Hands-on activities for learning French numbers 1-20 and basic color vocabulary',
    },
    {
      userId: emily.id,
      name: 'Family and Friends - November Theme',
      description: 'Activities exploring family structures and relationships using French vocabulary',
    },
    {
      userId: emily.id,
      name: 'French Math Centers',
      description: 'Mathematics activities conducted entirely in French for immersion learning',
    },
    {
      userId: emily.id,
      name: 'French Science Explorations',
      description: 'Science activities with French vocabulary for Grade 1 immersion students',
    },
    {
      userId: emily.id,
      name: 'French Songs and Culture',
      description: 'Traditional French songs, rhymes, and cultural activities for young learners',
    }
  ];

  // Create activity collections
  for (const collection of collections) {
    try {
      await prisma.activityCollection.create({
        data: collection,
      });
    } catch (error: any) {
      console.log(`Collection may already exist: ${collection.name}`);
    }
  }

  console.log(`✅ Created ${collections.length} activity collections`);

  // Create some sample activity ratings from Emily's perspective
  const createdActivities_db = await prisma.externalActivity.findMany({
    where: { isActive: true },
    take: 5
  });

  for (const activity of createdActivities_db) {
    try {
      await prisma.activityRating.create({
        data: {
          userId: emily.id,
          activityId: activity.id,
          rating: Math.floor(Math.random() * 2) + 4, // Random rating between 4-5
          review: `Great resource for French immersion! My Grade 1 students really engaged with this activity.`,
          wouldRecommend: true,
          gradeUsed: 1,
          subjectUsed: activity.subject,
          workedWell: 'Students loved the visual supports and hands-on elements',
          challenges: 'Some students needed extra support with pronunciation initially'
        }
      });
    } catch (error: any) {
      // Rating may already exist
    }
  }

  console.log('✅ Added sample activity ratings');

  // Generate some AI-powered lesson ideas (simulated for now)
  const aiGeneratedActivities = [
    {
      title: 'French Weather Circle Time',
      description: 'Daily weather observation activity conducted entirely in French with visual weather cards and simple phrases.',
      detailedInstructions: [
        'Gather students in a circle with weather cards visible',
        'Look outside together and observe the weather',
        'Teacher models: "Aujourd\'hui, il fait..." with appropriate weather card',
        'Students repeat the phrase together',
        'Individual students take turns describing weather using cards',
        'Chart the weather on French calendar'
      ],
      duration: 15,
      activityType: 'circle time',
      materials: ['Weather cards with French labels', 'Classroom calendar in French', 'Window for observation'],
      groupSize: 'whole class',
      learningGoals: ['Describe weather in French', 'Use daily routine vocabulary', 'Practice oral expression'],
      assessmentSuggestions: ['Observe student participation', 'Note correct use of weather vocabulary', 'Track confidence in speaking'],
      differentiation: {
        support: ['Visual weather cards with pictures', 'Sentence stems on board', 'Partner buddies for shy students'],
        extension: ['Add temperature vocabulary', 'Discuss seasonal clothing', 'Compare weather to yesterday']
      },
      safetyConsiderations: ['Ensure safe seating in circle'],
      technologyRequirements: []
    },
    {
      title: 'French Math Story Problems with Bears',
      description: 'Simple addition and subtraction story problems using counting bears and French mathematical language.',
      detailedInstructions: [
        'Distribute counting bears to each pair of students',
        'Present story problem in French with visual supports',
        'Students manipulate bears to solve problem',
        'Record answer using French number words',
        'Share solutions with French mathematical vocabulary',
        'Create own story problems with bears'
      ],
      duration: 30,
      activityType: 'hands-on math',
      materials: ['Counting bears (various colors)', 'Simple story problem cards in French', 'Recording sheets', 'French number cards'],
      groupSize: 'pairs',
      learningGoals: ['Solve simple addition/subtraction', 'Use French mathematical vocabulary', 'Explain thinking in French'],
      assessmentSuggestions: ['Observe problem-solving strategies', 'Listen to French mathematical language use', 'Check recording sheets'],
      differentiation: {
        support: ['Start with smaller numbers', 'Provide sentence frames', 'Use visual story cards'],
        extension: ['Create three-number problems', 'Write own story problems', 'Use different colored bears for variables']
      },
      safetyConsiderations: ['Supervise small manipulative use'],
      technologyRequirements: []
    },
    {
      title: 'French Feelings and Emotions Role Play',
      description: 'Students practice expressing feelings in French through role-play scenarios and emotion cards.',
      detailedInstructions: [
        'Introduce emotion vocabulary with facial expressions',
        'Model simple phrases: "Je suis..." + emotion',
        'Present scenario cards (lost toy, new friend, etc.)',
        'Students role-play appropriate emotional responses',
        'Practice asking "Comment te sens-tu?" and responding',
        'Create class book of emotions with drawings'
      ],
      duration: 25,
      activityType: 'role play',
      materials: ['Emotion cards with French labels', 'Scenario picture cards', 'Mirrors for facial expressions', 'Paper for class book'],
      groupSize: 'pairs and whole class',
      learningGoals: ['Express emotions in French', 'Ask and answer about feelings', 'Connect emotions to situations'],
      assessmentSuggestions: ['Note vocabulary acquisition', 'Observe social interactions', 'Check emotional expression'],
      differentiation: {
        support: ['Start with basic happy/sad', 'Use clear facial expression pictures', 'Allow pointing with verbal attempts'],
        extension: ['Add intensity words (très, un peu)', 'Discuss what causes different emotions', 'Connect to story characters']
      },
      safetyConsiderations: ['Create safe emotional environment', 'Respect all feelings expressed'],
      technologyRequirements: []
    }
  ];

  // Save AI-generated activities (simulated by creating detailed lesson plan resources)
  let aiCount = 0;
  for (const aiActivity of aiGeneratedActivities) {
    try {
      // Find an existing lesson plan to attach these as resources
      const sampleLesson = await prisma.eTFOLessonPlan.findFirst({
        where: { userId: emily.id }
      });

      if (sampleLesson) {
        await prisma.eTFOLessonPlanResource.create({
          data: {
            lessonPlanId: sampleLesson.id,
            title: aiActivity.title,
            type: 'ai-generated-activity',
            content: JSON.stringify(aiActivity),
          }
        });
        aiCount++;
      }
    } catch (error) {
      console.log(`Error saving AI activity: ${error}`);
    }
  }

  console.log(`✅ Generated ${aiCount} AI-powered activity ideas`);
  console.log('🎉 Phase 3 Complete: External resources and AI content generated!');
  console.log(`📚 Emily now has access to:
  - ${createdActivities} external activity resources from Teachers Pay Teachers and educational blogs
  - ${collections.length} organized activity collections by theme
  - ${aiCount} AI-generated activity ideas
  - Activity ratings and reviews to guide selection
  - French Immersion specific content for all major themes`);
}

generateFrenchImmersionActivities()
  .catch((e) => {
    console.error('Error generating activities:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });