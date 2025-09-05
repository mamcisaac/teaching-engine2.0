import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';

const prisma = new PrismaClient();

// Grade 1 French Immersion students
const students = [
  { firstName: 'Amélie', lastName: 'Bouchard', studentId: 'AM001', dateOfBirth: '2018-03-15', hasIEP: false },
  { firstName: 'Baptiste', lastName: 'Lavoie', studentId: 'BA001', dateOfBirth: '2018-05-22', hasIEP: false },
  { firstName: 'Charlotte', lastName: 'Dubois', studentId: 'CH001', dateOfBirth: '2018-07-08', hasIEP: true, iepGoals: ['Reading support', 'Speech therapy'] },
  { firstName: 'David', lastName: 'Martin', studentId: 'DA001', dateOfBirth: '2018-09-14', hasIEP: false },
  { firstName: 'Emma', lastName: 'Roy', studentId: 'EM001', dateOfBirth: '2018-11-03', hasIEP: false },
  { firstName: 'Félix', lastName: 'Tremblay', studentId: 'FE001', dateOfBirth: '2018-01-28', hasIEP: false },
  { firstName: 'Gabrielle', lastName: 'Gagnon', studentId: 'GA001', dateOfBirth: '2018-04-17', hasIEP: true, iepGoals: ['Attention support', 'Sensory breaks'] },
  { firstName: 'Hugo', lastName: 'Bergeron', studentId: 'HU001', dateOfBirth: '2018-06-30', hasIEP: false },
  { firstName: 'Isabelle', lastName: 'Côté', studentId: 'IS001', dateOfBirth: '2018-08-25', hasIEP: false },
  { firstName: 'Jacob', lastName: 'Gauthier', studentId: 'JA001', dateOfBirth: '2018-10-12', hasIEP: false },
  { firstName: 'Karine', lastName: 'Morin', studentId: 'KA001', dateOfBirth: '2018-02-09', hasIEP: false },
  { firstName: 'Liam', lastName: 'Leblanc', studentId: 'LI001', dateOfBirth: '2018-12-18', hasIEP: true, iepGoals: ['Fine motor support', 'OT consultation'] },
  { firstName: 'Marie', lastName: 'Fortin', studentId: 'MA001', dateOfBirth: '2018-03-05', hasIEP: false },
  { firstName: 'Nicolas', lastName: 'Simard', studentId: 'NI001', dateOfBirth: '2018-05-11', hasIEP: false },
  { firstName: 'Olivia', lastName: 'Lapointe', studentId: 'OL001', dateOfBirth: '2018-07-27', hasIEP: false },
  { firstName: 'Pierre', lastName: 'Bélanger', studentId: 'PI001', dateOfBirth: '2018-09-08', hasIEP: false },
  { firstName: 'Quinn', lastName: 'Pelletier', studentId: 'QU001', dateOfBirth: '2018-11-15', hasIEP: false },
  { firstName: 'Raphaël', lastName: 'Landry', studentId: 'RA001', dateOfBirth: '2018-01-20', hasIEP: true, iepGoals: ['Behavioral support', 'Social skills'] },
  { firstName: 'Sophie', lastName: 'Girard', studentId: 'SO001', dateOfBirth: '2018-04-02', hasIEP: false },
  { firstName: 'Thomas', lastName: 'Caron', studentId: 'TH001', dateOfBirth: '2018-06-14', hasIEP: false },
  { firstName: 'Ulysses', lastName: 'Beaulieu', studentId: 'UL001', dateOfBirth: '2018-08-19', hasIEP: false },
  { firstName: 'Victoria', lastName: 'Cloutier', studentId: 'VI001', dateOfBirth: '2018-10-30', hasIEP: false },
  { firstName: 'William', lastName: 'Nadeau', studentId: 'WI001', dateOfBirth: '2018-02-25', hasIEP: true, iepGoals: ['Math support', 'Extra time'] },
  { firstName: 'Xavier', lastName: 'Fournier', studentId: 'XA001', dateOfBirth: '2018-12-07', hasIEP: false },
  { firstName: 'Yasmine', lastName: 'Poirier', studentId: 'YA001', dateOfBirth: '2018-03-19', hasIEP: false },
  { firstName: 'Zachary', lastName: 'Savard', studentId: 'ZA001', dateOfBirth: '2018-05-31', hasIEP: false },
  { firstName: 'Alice', lastName: 'Mercier', studentId: 'AL001', dateOfBirth: '2018-07-13', hasIEP: false },
  { firstName: 'Benjamin', lastName: 'Dufour', studentId: 'BE001', dateOfBirth: '2018-09-22', hasIEP: false },
  { firstName: 'Camille', lastName: 'Rousseau', studentId: 'CA001', dateOfBirth: '2018-11-28', hasIEP: false },
  { firstName: 'Daniel', lastName: 'Lemieux', studentId: 'DA002', dateOfBirth: '2018-01-07', hasIEP: false }
];

const subjects = [
  'Français (Immersion)',
  'Mathématiques',
  'Sciences de la nature',
  'Sciences humaines',
  'Arts visuels',
  'Formation personnelle et sociale'
];

const expectations = [
  { subject: 'Français (Immersion)', expectation: 'Can count to 10 in French', code: 'FR-1.1' },
  { subject: 'Français (Immersion)', expectation: 'Recognizes French alphabet letters', code: 'FR-1.2' },
  { subject: 'Français (Immersion)', expectation: 'Understands basic classroom instructions', code: 'FR-1.3' },
  { subject: 'Mathématiques', expectation: 'Counts objects to 20', code: 'MA-1.1' },
  { subject: 'Mathématiques', expectation: 'Recognizes basic shapes', code: 'MA-1.2' },
  { subject: 'Mathématiques', expectation: 'Sorts objects by attribute', code: 'MA-1.3' },
  { subject: 'Sciences de la nature', expectation: 'Identifies living vs non-living', code: 'SC-1.1' },
  { subject: 'Sciences de la nature', expectation: 'Observes seasonal changes', code: 'SC-1.2' },
  { subject: 'Sciences humaines', expectation: 'Knows family members', code: 'SS-1.1' },
  { subject: 'Sciences humaines', expectation: 'Understands community helpers', code: 'SS-1.2' },
  { subject: 'Arts visuels', expectation: 'Uses primary colors', code: 'AR-1.1' },
  { subject: 'Arts visuels', expectation: 'Creates simple patterns', code: 'AR-1.2' },
  { subject: 'Formation personnelle et sociale', expectation: 'Manages emotions appropriately', code: 'PE-1.1' },
  { subject: 'Formation personnelle et sociale', expectation: 'Works cooperatively with peers', code: 'PE-1.2' }
];

const levels = ['NOT_YET', 'APPROACHING', 'MEETING', 'EXCEEDING'];
const evidenceTypes = ['OBSERVATION', 'CONVERSATION', 'PRODUCT'];

async function seedAssessmentData() {
  logger.info('🌱 Seeding assessment data for Grade 1 French Immersion...');

  try {
    // Clear existing data
    await prisma.$executeRaw`DELETE FROM assessments WHERE 1=1`;
    await prisma.$executeRaw`DELETE FROM artifacts WHERE 1=1`;
    await prisma.$executeRaw`DELETE FROM students WHERE 1=1`;

    // Create teacher account
    const teacher = await prisma.user.upsert({
      where: { email: 'emily.mcisaac@edu.pe.ca' },
      update: {},
      create: {
        email: 'emily.mcisaac@edu.pe.ca',
        name: 'Emily McIsaac',
        password: '$2a$10$K5X.m9VWznCpNG.H6cThj.wNxkUubvRhY3J./fGrDtZT9aOZQRAoS', // Default password: 'password123'
        role: 'TEACHER',
        grade: '1',
        program: 'French Immersion'
      }
    });

    logger.info('✅ Created teacher: Emily McIsaac');

    // Create students
    const createdStudents = [];
    for (const student of students) {
      const created = await prisma.student.create({
        data: {
          ...student,
          grade: 1,
          program: 'French Immersion',
          userId: teacher.id,
          status: 'active'
        }
      });
      createdStudents.push(created);
    }

    logger.info(`✅ Created ${createdStudents.length} students`);

    // Generate assessments for each student
    const assessments = [];
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    for (const student of createdStudents) {
      // Generate 10-20 assessments per student over the past 30 days
      const assessmentCount = Math.floor(Math.random() * 11) + 10;
      
      for (let i = 0; i < assessmentCount; i++) {
        const randomExpectation = expectations[Math.floor(Math.random() * expectations.length)];
        if (!randomExpectation) {
          logger.warn('No expectations found, skipping assessment creation');
          continue;
        }
        const randomLevel = levels[Math.floor(Math.random() * levels.length)];
        if (!randomLevel) {
          logger.warn('No levels found, skipping assessment creation');
          continue;
        }
        const randomEvidenceType = evidenceTypes[Math.floor(Math.random() * evidenceTypes.length)];
        if (!randomEvidenceType) {
          logger.warn('No evidence types found, skipping assessment creation');
          continue;
        }
        
        // Random date within the past 30 days
        const randomDate = new Date(
          thirtyDaysAgo.getTime() + 
          Math.random() * (now.getTime() - thirtyDaysAgo.getTime())
        );

        const assessment = await prisma.assessment.create({
          data: {
            studentId: student.id,
            teacherId: teacher.id,
            subject: randomExpectation.subject,
            expectation: randomExpectation.expectation,
            expectationCode: randomExpectation.code,
            level: randomLevel,
            evidenceType: randomEvidenceType,
            description: `Assessment for ${randomExpectation.expectation}`,
            notes: Math.random() > 0.5 ? 'Shows good progress' : undefined,
            date: randomDate
          }
        });
        
        assessments.push(assessment);
      }
    }

    logger.info(`✅ Created ${assessments.length} assessments`);

    // Create some sample artifacts
    const artifacts = [];
    for (let i = 0; i < 20; i++) {
      const randomStudent = createdStudents[Math.floor(Math.random() * createdStudents.length)];
      if (!randomStudent) {
        logger.warn('No students found, skipping artifact creation');
        continue;
      }
      const randomAssessment = assessments.find(a => a.studentId === randomStudent.id);
      
      const artifact = await prisma.artifact.create({
        data: {
          filename: `artifact-${Date.now()}-${i}.jpg`,
          originalName: `student-work-${i + 1}.jpg`,
          mimeType: 'image/jpeg',
          size: Math.floor(Math.random() * 5000000) + 100000, // 100KB to 5MB
          url: `/uploads/artifact-${Date.now()}-${i}.jpg`,
          thumbnailUrl: `/uploads/thumb-artifact-${Date.now()}-${i}.jpg`,
          studentId: randomStudent.id,
          assessmentId: randomAssessment?.id,
          uploadedBy: teacher.id,
          processingStatus: 'completed',
          tags: ['student-work', randomAssessment?.subject || 'general'].filter(Boolean)
        }
      });
      
      artifacts.push(artifact);
    }

    logger.info(`✅ Created ${artifacts.length} artifacts`);

    // Create some reports
    const reports = [];
    for (let i = 0; i < 5; i++) {
      const randomStudent = createdStudents[Math.floor(Math.random() * createdStudents.length)];
      if (!randomStudent) {
        logger.warn('No students found, skipping report creation');
        continue;
      }
      
      const reportTypes = ['progress', 'summary', 'parent', 'term', 'individual'];
      const reportTypeLabels = ['Progress', 'Summary', 'Parent', 'Term', 'Individual'];
      const reportType = reportTypes[i % 5] || 'progress';
      const reportLabel = reportTypeLabels[i % 5] || 'Progress';
      
      const report = await prisma.report.create({
        data: {
          type: reportType,
          title: `${reportLabel} Report - ${randomStudent.firstName} ${randomStudent.lastName}`,
          studentId: randomStudent.id,
          teacherId: teacher.id,
          dateRangeStart: thirtyDaysAgo,
          dateRangeEnd: now,
          subjects: subjects.slice(0, 3),
          format: 'pdf',
          status: i < 2 ? 'final' : 'draft',
          url: `/reports/report-${Date.now()}-${i}.pdf`
        }
      });
      
      reports.push(report);
    }

    logger.info(`✅ Created ${reports.length} reports`);

    logger.info('');
    logger.info('🎉 Assessment data seeding complete!');
    logger.info('');
    logger.info('Summary:');
    logger.info(`  👩‍🏫 Teacher: Emily McIsaac`);
    logger.info(`  👥 Students: ${createdStudents.length}`);
    logger.info(`  📊 Assessments: ${assessments.length}`);
    logger.info(`  📁 Artifacts: ${artifacts.length}`);
    logger.info(`  📄 Reports: ${reports.length}`);
    logger.info('');
    logger.info('You can now run the E2E tests with: npm run test:e2e');

  } catch (error: unknown) {
    logger.error({ error }, '❌ Error seeding assessment data:');
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedAssessmentData()
  .catch((error) => {
    logger.error({ error }, 'Failed to seed assessment data:');
    process.exit(1);
  });