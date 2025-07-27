import { faker } from '@faker-js/faker';
import { User, LessonPlan, Curriculum, Assessment } from '@teaching-engine/database';

// User Factory
export const createTestUser = (overrides: Partial<User> = {}): User => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  name: faker.person.fullName(),
  role: 'teacher',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

// Student Factory removed - app does not store student data

// Lesson Plan Factory
export const createTestLessonPlan = (overrides: Partial<LessonPlan> = {}): LessonPlan => ({
  id: faker.string.uuid(),
  title: faker.lorem.sentence(5),
  subject: faker.helpers.arrayElement(['Math', 'Science', 'English', 'Social Studies', 'Art']),
  gradeLevel: faker.helpers.arrayElement(['1', '2', '3', '4', '5', '6']),
  duration: faker.helpers.arrayElement([30, 45, 60, 90]),
  objectives: Array(3).fill(null).map(() => faker.lorem.sentence()),
  materials: Array(5).fill(null).map(() => faker.commerce.productName()),
  activities: Array(3).fill(null).map(() => ({
    name: faker.lorem.words(3),
    duration: faker.number.int({ min: 10, max: 30 }),
    description: faker.lorem.paragraph(),
    materials: Array(2).fill(null).map(() => faker.commerce.productName())
  })),
  assessment: {
    formative: Array(2).fill(null).map(() => faker.lorem.sentence()),
    summative: faker.lorem.sentence()
  },
  standards: Array(3).fill(null).map(() => 
    `${faker.number.int({ min: 1, max: 6 })}.${faker.helpers.arrayElement(['NF', 'MD', 'G'])}.${faker.number.int({ min: 1, max: 5 })}`
  ),
  createdAt: new Date(),
  updatedAt: new Date(),
  teacherId: faker.string.uuid(),
  ...overrides
});

// Curriculum Factory
export const createTestCurriculum = (overrides: Partial<Curriculum> = {}): Curriculum => ({
  id: faker.string.uuid(),
  title: faker.lorem.sentence(4),
  subject: faker.helpers.arrayElement(['Math', 'Science', 'English', 'Social Studies']),
  gradeLevel: faker.helpers.arrayElement(['1', '2', '3', '4', '5', '6']),
  standards: Array(10).fill(null).map(() => ({
    code: `${faker.number.int({ min: 1, max: 6 })}.${faker.helpers.arrayElement(['NF', 'MD', 'G'])}.${faker.number.int({ min: 1, max: 5 })}`,
    description: faker.lorem.sentence(),
    category: faker.helpers.arrayElement(['Number & Operations', 'Measurement & Data', 'Geometry'])
  })),
  units: Array(5).fill(null).map(() => ({
    title: faker.lorem.words(3),
    duration: `${faker.number.int({ min: 2, max: 4 })} weeks`,
    topics: Array(3).fill(null).map(() => faker.lorem.words(2))
  })),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

// Assessment Factory
export const createTestAssessment = (overrides: Partial<Assessment> = {}): Assessment => ({
  id: faker.string.uuid(),
  title: faker.lorem.sentence(3),
  type: faker.helpers.arrayElement(['quiz', 'test', 'project', 'presentation']),
  subject: faker.helpers.arrayElement(['Math', 'Science', 'English', 'Social Studies']),
  gradeLevel: faker.helpers.arrayElement(['1', '2', '3', '4', '5', '6']),
  totalPoints: faker.number.int({ min: 10, max: 100 }),
  questions: Array(10).fill(null).map(() => ({
    id: faker.string.uuid(),
    question: faker.lorem.sentence() + '?',
    type: faker.helpers.arrayElement(['multiple-choice', 'short-answer', 'essay']),
    points: faker.number.int({ min: 1, max: 10 }),
    correctAnswer: faker.lorem.word()
  })),
  rubric: {
    criteria: Array(4).fill(null).map(() => ({
      name: faker.lorem.words(2),
      description: faker.lorem.sentence(),
      points: faker.number.int({ min: 5, max: 25 })
    }))
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  teacherId: faker.string.uuid(),
  ...overrides
});

// Batch creation utilities
export const createTestUsers = (count: number, overrides: Partial<User> = {}) => 
  Array(count).fill(null).map(() => createTestUser(overrides));

// createTestStudents removed - app does not store student data

export const createTestLessonPlans = (count: number, overrides: Partial<LessonPlan> = {}) => 
  Array(count).fill(null).map(() => createTestLessonPlan(overrides));

// Relationship builders
// createTeacherWithStudents removed - app does not store student data

export const createCurriculumWithLessons = (lessonCount: number = 10) => {
  const curriculum = createTestCurriculum();
  const lessons = createTestLessonPlans(lessonCount, {
    curriculumId: curriculum.id,
    subject: curriculum.subject,
    gradeLevel: curriculum.gradeLevel
  });
  return { curriculum, lessons };
};

// Test data scenarios
export const createClassroomScenario = () => {
  const teacher = createTestUser({ role: 'teacher' });
  // Students removed - app does not store student data
  const curriculum = createTestCurriculum({ gradeLevel: '3', subject: 'Math' });
  const lessons = createTestLessonPlans(20, {
    teacherId: teacher.id,
    curriculumId: curriculum.id,
    gradeLevel: '3',
    subject: 'Math'
  });
  const assessments = Array(5).fill(null).map(() => 
    createTestAssessment({
      teacherId: teacher.id,
      gradeLevel: '3',
      subject: 'Math'
    })
  );
  
  return { teacher, curriculum, lessons, assessments };
};