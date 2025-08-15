#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedFrenchLessons() {
  console.log('📚 Creating French lesson plans for September - Welcome to School unit...');
  
  try {
    // Find the Welcome to School unit plan
    const welcomeUnit = await prisma.unitPlan.findFirst({
      where: {
        title: 'Welcome to School!',
        longRangePlan: {
          subject: 'Français langue première'
        }
      }
    });

    if (!welcomeUnit) {
      console.error('❌ Welcome to School unit not found');
      return;
    }

    console.log(`✅ Found Welcome to School unit (ID: ${welcomeUnit.id})`);

    // Clear existing lessons for this unit
    await prisma.eTFOLessonPlan.deleteMany({
      where: { unitPlanId: welcomeUnit.id }
    });

    // Create September French lessons
    const frenchLessons = [
      {
        title: 'Bonjour, je m\'appelle...',
        titleFr: 'Bonjour, je m\'appelle...',
        date: new Date('2025-09-04'),
        duration: 60,
        learningGoals: 'Students will introduce themselves in French and learn basic greetings',
        learningGoalsFr: 'Les élèves se présenteront en français et apprendront les salutations de base',
        mindsOn: 'Greeting song and name game with gestures',
        action: 'Practice introductions, create name tags, partner greetings',
        consolidation: 'Circle time with everyone saying their name in French',
        materials: ['Name tags', 'Markers', 'Greeting posters', 'French music'],
        accommodations: 'Visual supports, repetition, buddy system for new French speakers',
      },
      {
        title: 'Les sons du français',
        titleFr: 'Les sons du français',
        date: new Date('2025-09-05'),
        duration: 60,
        learningGoals: 'Students will identify and produce basic French sounds',
        learningGoalsFr: 'Les élèves identifieront et produiront les sons de base du français',
        mindsOn: 'Sound hunt around the classroom',
        action: 'Sound stations, phonological awareness games, tongue twisters',
        consolidation: 'Sound celebration with favorite French sounds',
        materials: ['Sound cards', 'Picture cards', 'Audio recordings', 'Mirrors'],
        accommodations: 'Extra practice time, visual cues, peer support',
      },
      {
        title: 'Notre classe française',
        titleFr: 'Notre classe française',
        date: new Date('2025-09-08'),
        duration: 60,
        learningGoals: 'Students will learn classroom vocabulary in French',
        learningGoalsFr: 'Les élèves apprendront le vocabulaire de la classe en français',
        mindsOn: 'Classroom tour with French labels',
        action: 'Label classroom objects, vocabulary games, scavenger hunt',
        consolidation: 'Create classroom dictionary with drawings',
        materials: ['Labels', 'Vocabulary cards', 'Classroom objects', 'Drawing paper'],
        accommodations: 'Picture supports, hands-on exploration, repetition',
      },
      {
        title: 'Les règles de notre classe',
        titleFr: 'Les règles de notre classe',
        date: new Date('2025-09-09'),
        duration: 60,
        learningGoals: 'Students will understand classroom rules and routines in French',
        learningGoalsFr: 'Les élèves comprendront les règles et routines de classe en français',
        mindsOn: 'Act out positive classroom behaviors',
        action: 'Create class rules poster, practice routines, role play',
        consolidation: 'Sign class agreement with handprints',
        materials: ['Poster board', 'Paint', 'Rule cards', 'Camera'],
        accommodations: 'Visual schedule, practice opportunities, positive reinforcement',
      },
      {
        title: 'Les amis de la classe',
        titleFr: 'Les amis de la classe',
        date: new Date('2025-09-10'),
        duration: 60,
        learningGoals: 'Students will learn friend vocabulary and social phrases',
        learningGoalsFr: 'Les élèves apprendront le vocabulaire des amis et phrases sociales',
        mindsOn: 'Friendship circle with compliments',
        action: 'Partner activities, friendship crafts, sharing games',
        consolidation: 'Class friendship book creation',
        materials: ['Friendship cards', 'Craft supplies', 'Photo album', 'Stickers'],
        accommodations: 'Partner support, visual cues, structured interactions',
      }
    ];

    // Create all lessons
    for (const lesson of frenchLessons) {
      await prisma.eTFOLessonPlan.create({
        data: {
          ...lesson,
          unitPlanId: welcomeUnit.id,
          userId: welcomeUnit.userId,
          isSubFriendly: true,
          subNotes: 'All materials labeled in French. Use gestures and visuals. Encourage attempts at French.',
          assessmentType: 'Formative',
          assessmentNotes: 'Observation, anecdotal notes, audio recordings of student French',
          modifications: {
            emerging: 'Focus on listening and gestures, single words',
            developing: 'Simple phrases, partner support',
            extending: 'Complete sentences, help others'
          },
        }
      });
    }

    console.log(`✅ Created ${frenchLessons.length} French lesson plans for September`);
    
    // Update counts
    const lessonCount = await prisma.eTFOLessonPlan.count({
      where: { unitPlanId: welcomeUnit.id }
    });
    
    console.log(`📊 Welcome to School unit now has ${lessonCount} lessons`);
    
  } catch (error) {
    console.error('❌ Error creating French lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedFrenchLessons()
  .then(() => console.log('🎉 French lessons seeding completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });