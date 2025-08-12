#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSubjects() {
  console.log('🎯 CREATING SUBJECTS FOR EMILY\n');

  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    if (!emily) throw new Error('Emily not found');

    // Grade 1 French Immersion subjects
    const subjects = [
      {
        name: 'Français langue première',
        nameFr: 'Français langue première',
        nameEn: 'French Language Arts',
        userId: emily.id
      },
      {
        name: 'Mathématiques',
        nameFr: 'Mathématiques',
        nameEn: 'Mathematics',
        userId: emily.id
      },
      {
        name: 'Sciences de la nature',
        nameFr: 'Sciences de la nature',
        nameEn: 'Natural Sciences',
        userId: emily.id
      },
      {
        name: 'Sciences humaines',
        nameFr: 'Sciences humaines',
        nameEn: 'Social Studies',
        userId: emily.id
      },
      {
        name: 'Arts visuels',
        nameFr: 'Arts visuels',
        nameEn: 'Visual Arts',
        userId: emily.id
      },
      {
        name: 'Éducation physique',
        nameFr: 'Éducation physique',
        nameEn: 'Physical Education',
        userId: emily.id
      },
      {
        name: 'Music',
        nameFr: 'Musique',
        nameEn: 'Music',
        userId: emily.id
      },
      {
        name: 'English Language Arts',
        nameFr: 'Anglais',
        nameEn: 'English Language Arts',
        userId: emily.id
      }
    ];

    console.log('Creating subjects...\n');

    for (const subject of subjects) {
      const created = await prisma.subject.create({
        data: subject
      });
      console.log(`✅ Created: ${created.name}`);
    }

    // Verify subjects are associated
    const updatedEmily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' },
      include: {
        subjects: true
      }
    });

    console.log(`\n📚 Total subjects for Emily: ${updatedEmily?.subjects?.length || 0}`);

    // Now also check if the UI issue might be related to the onboarding state
    // Let's check localStorage keys that might need to be set
    console.log('\n💡 IMPORTANT: The app may use localStorage for subject selection.');
    console.log('   If subjects still don\'t show, check browser console and run:');
    console.log('   localStorage.setItem("teacher-subjects", JSON.stringify([');
    console.log('     "Français langue première",');
    console.log('     "Mathématiques",');
    console.log('     "Sciences de la nature",');
    console.log('     "Arts visuels",');
    console.log('     "Éducation physique",');
    console.log('     "Music"');
    console.log('   ]));');
    console.log('   Then refresh the page.');

  } catch (error) {
    console.error('❌ Error creating subjects:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createSubjects()
  .then(() => {
    console.log('\n✅ Subjects created successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Subject creation failed:', error);
    process.exit(1);
  });