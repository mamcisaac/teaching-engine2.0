/**
 * Comprehensive Test Data Generator
 * Creates realistic classroom data for Emily's Grade 1 French Immersion class
 */

import { PrismaClient } from '@teaching-engine/database';
import bcrypt from 'bcryptjs';
import { logger } from '../logger';

const prisma = new PrismaClient();

export interface TestClassroom {
  teacher: {
    id: number;
    email: string;
    password: string; // Plain text for testing
    name: string;
  };
  students: Array<{
    id: string;
    firstName: string;
    lastName: string;
    studentNumber: string;
    grade: number;
  }>;
  artifacts: Array<{
    id: string;
    studentId: string;
    artifactType: string;
    title: string;
    description: string;
  }>;
  outcomes: Array<{
    id: string;
    subject: string;
    code: string;
    description: string;
  }>;
}

/**
 * Grade 1 French Immersion student names (realistic mix)
 */
const GRADE1_STUDENTS = [
  { firstName: 'Amélie', lastName: 'Bouchard' },
  { firstName: 'Xavier', lastName: 'Leblanc' },
  { firstName: 'Sophie', lastName: 'Tremblay' },
  { firstName: 'Gabriel', lastName: 'Cormier' },
  { firstName: 'Camille', lastName: 'Arsenault' },
  { firstName: 'Lucas', lastName: 'Gallant' },
  { firstName: 'Élise', lastName: 'MacDonald' },
  { firstName: 'Noah', lastName: 'Richard' },
  { firstName: 'Léa', lastName: 'Poirier' },
  { firstName: 'Étienne', lastName: 'Murphy' },
  { firstName: 'Chloé', lastName: 'LeClair' },
  { firstName: 'Benjamin', lastName: 'Doiron' },
  { firstName: 'Juliette', lastName: 'Bourgeois' },
  { firstName: 'Samuel', lastName: 'Comeau' },
  { firstName: 'Emma', lastName: 'Cormier' },
  { firstName: 'Thomas', lastName: 'Hébert' },
  { firstName: 'Zoé', lastName: 'Landry' },
  { firstName: 'Louis', lastName: 'Blanchard' },
  { firstName: 'Clara', lastName: 'Robichaud' },
  { firstName: 'Raphaël', lastName: 'Savoie' },
  { firstName: 'Mathilde', lastName: 'Légère' },
  { firstName: 'Antoine', lastName: 'Després' },
  { firstName: 'Lila', lastName: 'Chiasson' },
  { firstName: 'William', lastName: 'Mazerolle' },
  { firstName: 'Rosalie', lastName: 'Babineau' }
];

/**
 * Realistic artifact titles and descriptions for Grade 1
 */
const ARTIFACT_TEMPLATES = {
  PHOTO: [
    {
      title: 'Centre de mathématiques - Manipulation des blocs',
      description: 'L\'élève explore les formes géométriques avec les blocs de construction.'
    },
    {
      title: 'Lecture partagée - Identification des lettres',
      description: 'L\'élève pointe et nomme les lettres dans notre livre collectif.'
    },
    {
      title: 'Centre d\'écriture - Formation des lettres',
      description: 'L\'élève pratique l\'écriture des lettres minuscules au tableau blanc.'
    },
    {
      title: 'Sciences - Exploration des saisons',
      description: 'L\'élève trie les images selon les saisons automne et hiver.'
    }
  ],
  VIDEO: [
    {
      title: 'Lecture à voix haute - Fluidité',
      description: 'L\'élève lit un livre de niveau débutant avec expression.'
    },
    {
      title: 'Présentation orale - Mon animal préféré',
      description: 'L\'élève présente son animal préféré devant la classe en français.'
    },
    {
      title: 'Mathématiques - Stratégies de comptage',
      description: 'L\'élève explique sa stratégie pour compter jusqu\'à 20.'
    }
  ],
  AUDIO: [
    {
      title: 'Phonologie - Sons des lettres',
      description: 'L\'élève produit les sons des lettres b, p, d, t correctement.'
    },
    {
      title: 'Conversation - Routine du matin',
      description: 'Discussion avec l\'élève sur ses activités de fin de semaine.'
    },
    {
      title: 'Chanson française - Les jours de la semaine',
      description: 'L\'élève chante la chanson des jours de la semaine.'
    }
  ],
  DOCUMENT: [
    {
      title: 'Écriture créative - Mon histoire',
      description: 'L\'élève écrit une histoire simple avec images et mots.'
    },
    {
      title: 'Mathématiques - Résolution de problèmes',
      description: 'L\'élève résout des problèmes de soustraction avec manipulation.'
    },
    {
      title: 'Sciences humaines - Ma famille',
      description: 'L\'élève dessine et décrit les membres de sa famille.'
    }
  ],
  NOTE: [
    {
      title: 'Observation - Travail en équipe',
      description: 'L\'élève collabore bien avec ses pairs lors du projet de sciences.'
    },
    {
      title: 'Conférence - Stratégies de lecture',
      description: 'Discussion sur les stratégies utilisées pour décoder les mots nouveaux.'
    },
    {
      title: 'Auto-évaluation - Apprentissage français',
      description: 'L\'élève réfléchit sur ses progrès en communication orale française.'
    }
  ]
};

/**
 * Grade 1 curriculum outcomes (PE French Immersion)
 */
const CURRICULUM_OUTCOMES = [
  {
    subject: 'Français',
    code: 'F1.CO.1',
    description: 'L\'élève peut écouter et comprendre des consignes simples en français.'
  },
  {
    subject: 'Français', 
    code: 'F1.CO.2',
    description: 'L\'élève peut s\'exprimer oralement en français dans des situations familières.'
  },
  {
    subject: 'Français',
    code: 'F1.L.1', 
    description: 'L\'élève peut lire des textes simples adaptés à son niveau.'
  },
  {
    subject: 'Français',
    code: 'F1.E.1',
    description: 'L\'élève peut écrire des phrases simples en français.'
  },
  {
    subject: 'Mathématiques',
    code: 'M1.N.1',
    description: 'L\'élève peut compter, lire et écrire les nombres de 0 à 100.'
  },
  {
    subject: 'Mathématiques', 
    code: 'M1.N.2',
    description: 'L\'élève peut résoudre des problèmes d\'addition et de soustraction jusqu\'à 20.'
  },
  {
    subject: 'Mathématiques',
    code: 'M1.G.1', 
    description: 'L\'élève peut identifier et décrire des formes géométriques 2D et 3D.'
  },
  {
    subject: 'Sciences',
    code: 'S1.VT.1',
    description: 'L\'élève peut observer et décrire les caractéristiques des êtres vivants.'
  },
  {
    subject: 'Sciences',
    code: 'S1.TM.1',
    description: 'L\'élève peut identifier les propriétés des matériaux.'
  },
  {
    subject: 'Sciences humaines',
    code: 'SH1.CC.1', 
    description: 'L\'élève peut décrire sa famille et sa communauté.'
  }
];

/**
 * Create a complete test classroom
 */
export const createTestClassroom = async (teacherName = 'Emily Rousseau'): Promise<TestClassroom> => {
  logger.info(`Creating test classroom for ${teacherName}`);

  // Create teacher
  const teacherEmail = `${teacherName.toLowerCase().replace(' ', '.')}@test.school.pe.ca`;
  const teacherPassword = 'TestPassword123!';
  const hashedPassword = await bcrypt.hash(teacherPassword, 10);

  const teacher = await prisma.user.create({
    data: {
      email: teacherEmail,
      password: hashedPassword,
      name: teacherName,
      role: 'teacher',
      preferredLanguage: 'fr'
    }
  });

  // Create curriculum outcomes first
  const outcomes = [];
  for (const outcome of CURRICULUM_OUTCOMES) {
    try {
      const created = await prisma.curriculumExpectation.upsert({
        where: { code: outcome.code },
        update: {},
        create: {
          code: outcome.code,
          subject: outcome.subject,
          description: outcome.description,
          grade: '1',
          strand: 'Communication orale', // Default strand
          overallExpectation: outcome.description,
          specificExpectation: outcome.description
        }
      });
      outcomes.push(created);
    } catch (error) {
      logger.warn(`Failed to create outcome ${outcome.code}:`, error);
    }
  }

  // Create 25 students (Emily's class)
  const students = [];
  for (let i = 0; i < 25; i++) {
    const studentData = GRADE1_STUDENTS[i];
    const studentNumber = `FI1${(i + 1).toString().padStart(3, '0')}`;
    
    const student = await prisma.student.create({
      data: {
        userId: teacher.id,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        studentNumber,
        grade: 1,
        isActive: true,
        notes: `Élève de 1re année immersion française. Parent contact: ${studentData.firstName.toLowerCase()}.parent@email.pe.ca`
      }
    });

    students.push(student);
  }

  // Create diverse artifacts for each student
  const artifacts = [];
  const artifactTypes = Object.keys(ARTIFACT_TEMPLATES);

  for (const student of students) {
    // Create 3-8 artifacts per student (realistic classroom)
    const numArtifacts = Math.floor(Math.random() * 6) + 3;
    
    for (let i = 0; i < numArtifacts; i++) {
      const artifactType = artifactTypes[Math.floor(Math.random() * artifactTypes.length)];
      const templates = ARTIFACT_TEMPLATES[artifactType as keyof typeof ARTIFACT_TEMPLATES];
      const template = templates[Math.floor(Math.random() * templates.length)];
      
      // Random date within last 60 days
      const dateCollected = new Date();
      dateCollected.setDate(dateCollected.getDate() - Math.floor(Math.random() * 60));
      
      const artifact = await prisma.studentArtifact.create({
        data: {
          studentId: student.id,
          userId: teacher.id,
          artifactType,
          title: template.title,
          description: template.description,
          dateCollected,
          processingStatus: 'COMPLETED',
          fileName: `${artifactType.toLowerCase()}_${student.firstName}_${i + 1}.${getFileExtension(artifactType)}`,
          filePath: `/fake/path/${artifactType.toLowerCase()}_${student.firstName}_${i + 1}.${getFileExtension(artifactType)}`,
          fileSize: Math.floor(Math.random() * 5000000) + 100000, // 100KB to 5MB
          mimeType: getMimeType(artifactType),
          isArchived: false
        }
      });

      artifacts.push(artifact);

      // Link some artifacts to outcomes with evidence triangulation
      if (Math.random() > 0.3) { // 70% chance of linking to outcome
        const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
        const evidenceTypes = ['OBSERVATION', 'CONVERSATION', 'PRODUCT'];
        const evidenceType = evidenceTypes[Math.floor(Math.random() * evidenceTypes.length)];
        
        await prisma.studentArtifactOutcome.create({
          data: {
            artifactId: artifact.id,
            outcomeId: randomOutcome.id,
            evidenceType,
            teacherNote: `Démonstration ${evidenceType.toLowerCase()} de la compétence`,
            confidenceLevel: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)],
            dateAssessed: dateCollected
          }
        });
      }
    }

    // Create progress records for each student
    const studentOutcomes = outcomes.slice(0, Math.floor(Math.random() * 5) + 3); // 3-8 outcomes per student
    
    for (const outcome of studentOutcomes) {
      const masteryLevels = ['NOT_YET', 'APPROACHING', 'MEETING', 'EXCEEDING'];
      // Weight towards meeting expectations for Grade 1
      const weights = [0.1, 0.3, 0.5, 0.1];
      const randomLevel = masteryLevels[weightedRandom(weights)];
      
      await prisma.studentOutcomeProgress.create({
        data: {
          studentId: student.id,
          outcomeId: outcome.id,
          userId: teacher.id,
          currentLevel: randomLevel,
          lastAssessmentDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
          teacherNotes: `Observations régulières montrent ${randomLevel === 'EXCEEDING' ? 'excellence' : randomLevel === 'MEETING' ? 'maîtrise' : 'progrès'} dans cette compétence.`,
          areasForGrowth: randomLevel !== 'EXCEEDING' ? 'Continuer la pratique quotidienne et le soutien individualisé.' : null,
          nextSteps: 'Intégrer dans les activités d\'enrichissement du centre d\'apprentissage.',
          parentShared: false
        }
      });
    }
  }

  logger.info(`Test classroom created: ${students.length} students, ${artifacts.length} artifacts, ${outcomes.length} outcomes`);

  return {
    teacher: {
      id: teacher.id,
      email: teacherEmail,
      password: teacherPassword,
      name: teacherName
    },
    students: students.map(s => ({
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      studentNumber: s.studentNumber!,
      grade: s.grade
    })),
    artifacts: artifacts.map(a => ({
      id: a.id,
      studentId: a.studentId,
      artifactType: a.artifactType,
      title: a.title,
      description: a.description
    })),
    outcomes: outcomes.map(o => ({
      id: o.id,
      subject: o.subject,
      code: o.code,
      description: o.description
    }))
  };
};

/**
 * Clean up test data
 */
export const cleanupTestClassroom = async (teacherId: number) => {
  logger.info(`Cleaning up test classroom for teacher ${teacherId}`);
  
  // Delete in reverse dependency order
  await prisma.studentArtifactOutcome.deleteMany({
    where: {
      artifact: {
        userId: teacherId
      }
    }
  });

  await prisma.studentOutcomeProgress.deleteMany({
    where: { userId: teacherId }
  });

  await prisma.studentArtifact.deleteMany({
    where: { userId: teacherId }
  });

  await prisma.student.deleteMany({
    where: { userId: teacherId }
  });

  await prisma.user.delete({
    where: { id: teacherId }
  });

  logger.info('Test classroom cleanup completed');
};

// Helper functions
function getFileExtension(artifactType: string): string {
  switch (artifactType) {
    case 'PHOTO': return 'jpg';
    case 'VIDEO': return 'mp4';
    case 'AUDIO': return 'mp3';
    case 'DOCUMENT': return 'pdf';
    case 'NOTE': return 'txt';
    default: return 'txt';
  }
}

function getMimeType(artifactType: string): string {
  switch (artifactType) {
    case 'PHOTO': return 'image/jpeg';
    case 'VIDEO': return 'video/mp4';
    case 'AUDIO': return 'audio/mpeg';
    case 'DOCUMENT': return 'application/pdf';
    case 'NOTE': return 'text/plain';
    default: return 'text/plain';
  }
}

function weightedRandom(weights: number[]): number {
  const random = Math.random();
  let sum = 0;
  
  for (let i = 0; i < weights.length; i++) {
    sum += weights[i];
    if (random < sum) return i;
  }
  
  return weights.length - 1;
}

export default {
  createTestClassroom,
  cleanupTestClassroom
};