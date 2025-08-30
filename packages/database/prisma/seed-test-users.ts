/**
 * Test User Seeder for E2E Testing
 * Creates test users for Emily, Sophie, Marie, and Admin
 * These users are used by the multi-agent E2E testing system
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedTestUsers() {
  console.log('🌱 Seeding test users for E2E testing...');

  try {
    // Test passwords for test users
    const emilyPassword = await bcrypt.hash('TeachingGrade1!', 12);
    const testPassword = await bcrypt.hash('TestPass123!', 12);
    const adminPassword = await bcrypt.hash('AdminPass123!', 12);

    // Create Emily (Primary Teacher)
    const emily = await prisma.user.upsert({
      where: { email: 'emily.mcisaac@teachingengine.test' },
      update: {
        password: emilyPassword,
        name: 'Emily McIsaac',
        role: 'teacher',
        preferredLanguage: 'fr',
      },
      create: {
        email: 'emily.mcisaac@teachingengine.test',
        name: 'Emily McIsaac',
        password: emilyPassword,
        role: 'teacher',
        preferredLanguage: 'fr',
      },
    });
    console.log('✅ Created test user: Emily McIsaac (Primary Teacher)');

    // Create Sophie (Educational Assistant)
    const sophie = await prisma.user.upsert({
      where: { email: 'sophie.assistant@teachingengine.test' },
      update: {},
      create: {
        email: 'sophie.assistant@teachingengine.test',
        name: 'Sophie Lafleur',
        password: testPassword,
        role: 'teacher', // Using teacher role but will act as EA in tests
        preferredLanguage: 'fr',
      },
    });
    console.log('✅ Created test user: Sophie Lafleur (Educational Assistant)');

    // Create Marie (Specialist Teacher)
    const marie = await prisma.user.upsert({
      where: { email: 'marie.specialist@teachingengine.test' },
      update: {},
      create: {
        email: 'marie.specialist@teachingengine.test',
        name: 'Marie Dubois',
        password: testPassword,
        role: 'teacher',
        preferredLanguage: 'fr',
      },
    });
    console.log('✅ Created test user: Marie Dubois (Specialist Teacher)');

    // Create Admin user for test setup
    const admin = await prisma.user.upsert({
      where: { email: 'admin@teachingengine.test' },
      update: {},
      create: {
        email: 'admin@teachingengine.test',
        name: 'Admin User',
        password: adminPassword,
        role: 'admin',
        preferredLanguage: 'en',
      },
    });
    console.log('✅ Created test user: Admin User');

    // Create subjects for Emily's class
    const subjects = [
      { name: 'Français (Immersion)', nameFr: 'Français (Immersion)', nameEn: 'French Immersion' },
      { name: 'Mathématiques', nameFr: 'Mathématiques', nameEn: 'Mathematics' },
      { name: 'Sciences de la nature', nameFr: 'Sciences de la nature', nameEn: 'Natural Sciences' },
      { name: 'Sciences humaines', nameFr: 'Sciences humaines', nameEn: 'Social Studies' },
      { name: 'Arts visuels', nameFr: 'Arts visuels', nameEn: 'Visual Arts' },
      { name: 'Musique', nameFr: 'Musique', nameEn: 'Music' },
      { name: 'Formation personnelle et sociale', nameFr: 'Formation personnelle et sociale', nameEn: 'Personal and Social Development' },
    ];

    for (const subject of subjects) {
      // Check if subject exists for Emily
      const existing = await prisma.subject.findFirst({
        where: {
          name: subject.name,
          userId: emily.id,
        }
      });

      if (!existing) {
        await prisma.subject.create({
          data: {
            ...subject,
            userId: emily.id,
          },
        });
      }
    }
    console.log(`✅ Created ${subjects.length} subjects for Emily's class`);

    // Create some curriculum expectations if they don't exist
    const expectationCount = await prisma.curriculumExpectation.count();
    if (expectationCount === 0) {
      console.log('Creating sample curriculum expectations...');
      
      // Sample expectations for testing
      const expectations = [
        {
          code: 'FI1.1',
          description: 'Communicate in French using simple sentences',
          descriptionFr: 'Communiquer en français en utilisant des phrases simples',
          strand: 'Communication orale',
          strandFr: 'Communication orale',
          subject: 'Français (Immersion)',
          grade: 1,
        },
        {
          code: 'MATH1.1',
          description: 'Count to 100 by 1s, 2s, 5s, and 10s',
          descriptionFr: 'Compter jusqu\'à 100 par 1, 2, 5 et 10',
          strand: 'Number Sense',
          strandFr: 'Sens du nombre',
          subject: 'Mathématiques',
          grade: 1,
        },
        {
          code: 'SCI1.1',
          description: 'Identify and describe characteristics of living things',
          descriptionFr: 'Identifier et décrire les caractéristiques des êtres vivants',
          strand: 'Life Systems',
          strandFr: 'Systèmes vivants',
          subject: 'Sciences de la nature',
          grade: 1,
        },
      ];

      for (const exp of expectations) {
        await prisma.curriculumExpectation.create({ data: exp });
      }
      console.log(`✅ Created ${expectations.length} sample curriculum expectations`);
    }

    console.log('\n🎉 Test users seeded successfully!');
    console.log('You can now run E2E tests with these credentials:');
    console.log('  Emily: emily.mcisaac@teachingengine.test / TeachingGrade1!');
    console.log('  Sophie: sophie.assistant@teachingengine.test / TestPass123!');
    console.log('  Marie: marie.specialist@teachingengine.test / TestPass123!');
    console.log('  Admin: admin@teachingengine.test / AdminPass123!');

    return {
      emily,
      sophie,
      marie,
      admin,
    };
  } catch (error) {
    console.error('❌ Error seeding test users:', error);
    throw error;
  }
}

// Run the seeder
seedTestUsers()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });