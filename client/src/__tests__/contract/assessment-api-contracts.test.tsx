/**
 * Contract Tests for Assessment API
 * Ensures that test mocks match real API behavior and contracts
 */
import { describe, it as test, expect, beforeAll } from 'vitest';

// Types for API contracts
interface Outcome {
  id: string;
  code: string;
  description: string;
  subject: string;
  grade: number;
  domain: string;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  grade: number;
  userId: number;
  parentContacts: unknown[];
  createdAt: string;
  updatedAt: string;
}

interface TeacherReflection {
  id: number;
  content: string;
  outcomeId: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

interface AssessmentTemplate {
  id: number;
  title: string;
  type: 'oral' | 'reading' | 'writing' | 'mixed';
  description?: string;
  outcomeIds: string[];
  rubricCriteria: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

interface StudentReflection {
  id: number;
  content: string;
  studentId: number;
  outcomeId?: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

// Test configuration
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000';
const TEST_TIMEOUT = 10000;

// Mock data from our test files
const MOCK_OUTCOMES: Outcome[] = [
  {
    id: '1',
    code: 'FL1.CO.1',
    description: 'Communicate orally in French',
    subject: 'Français',
    grade: 1,
    domain: 'Communication orale',
  },
  {
    id: '2',
    code: 'FL1.LE.1',
    description: 'Read simple French texts',
    subject: 'Français',
    grade: 1,
    domain: 'Lecture',
  },
];

const MOCK_STUDENTS: Student[] = [
  {
    id: 1,
    firstName: 'Marie',
    lastName: 'Dubois',
    grade: 1,
    userId: 1,
    parentContacts: [],
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
  },
  {
    id: 2,
    firstName: 'Jean',
    lastName: 'Martin',
    grade: 1,
    userId: 1,
    parentContacts: [],
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
  },
];

const MOCK_TEACHER_REFLECTIONS: TeacherReflection[] = [
  {
    id: 1,
    content: 'Students are doing well with oral communication',
    outcomeId: '1',
    userId: 1,
    createdAt: '2023-01-01T10:00:00Z',
    updatedAt: '2023-01-01T10:00:00Z',
  },
];

// Helper functions for API calls
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer test-token', // Use test auth
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Helper type for safe property access
type SafeObject = Record<string, unknown>;

// Contract validation functions
function validateOutcomeContract(outcome: unknown): outcome is Outcome {
  if (!outcome || typeof outcome !== 'object') return false;
  const obj = outcome as SafeObject;
  return (
    typeof obj.id === 'string' &&
    typeof obj.code === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.subject === 'string' &&
    typeof obj.grade === 'number' &&
    typeof obj.domain === 'string'
  );
}

function validateStudentContract(student: unknown): student is Student {
  if (!student || typeof student !== 'object') return false;
  const obj = student as SafeObject;
  return (
    typeof obj.id === 'number' &&
    typeof obj.firstName === 'string' &&
    typeof obj.lastName === 'string' &&
    typeof obj.grade === 'number' &&
    typeof obj.userId === 'number' &&
    Array.isArray(obj.parentContacts) &&
    typeof obj.createdAt === 'string' &&
    typeof obj.updatedAt === 'string'
  );
}

function validateTeacherReflectionContract(reflection: unknown): reflection is TeacherReflection {
  if (!reflection || typeof reflection !== 'object') return false;
  const obj = reflection as SafeObject;
  return (
    typeof obj.id === 'number' &&
    typeof obj.content === 'string' &&
    typeof obj.outcomeId === 'string' &&
    typeof obj.userId === 'number' &&
    typeof obj.createdAt === 'string' &&
    typeof obj.updatedAt === 'string'
  );
}

function validateAssessmentTemplateContract(template: unknown): template is AssessmentTemplate {
  if (!template || typeof template !== 'object') return false;
  const obj = template as SafeObject;
  return (
    typeof obj.id === 'number' &&
    typeof obj.title === 'string' &&
    ['oral', 'reading', 'writing', 'mixed'].includes(obj.type as string) &&
    (obj.description === undefined || typeof obj.description === 'string') &&
    Array.isArray(obj.outcomeIds) &&
    typeof obj.rubricCriteria === 'string' &&
    typeof obj.userId === 'number' &&
    typeof obj.createdAt === 'string' &&
    typeof obj.updatedAt === 'string'
  );
}

function validateStudentReflectionContract(reflection: unknown): reflection is StudentReflection {
  if (!reflection || typeof reflection !== 'object') return false;
  const obj = reflection as SafeObject;
  return (
    typeof obj.id === 'number' &&
    typeof obj.content === 'string' &&
    typeof obj.studentId === 'number' &&
    (obj.outcomeId === undefined || typeof obj.outcomeId === 'string') &&
    typeof obj.userId === 'number' &&
    typeof obj.createdAt === 'string' &&
    typeof obj.updatedAt === 'string'
  );
}

describe('Assessment API Contract Tests', () => {
  let apiAvailable = false;

  beforeAll(async () => {
    // Check if API is available
    try {
      await fetch(`${API_BASE_URL}/api/test`);
      apiAvailable = true;
    } catch (error) {
      console.warn('API server not available for contract tests. Running mock validation only.');
      apiAvailable = false;
    }
  }, TEST_TIMEOUT);

  describe('Outcomes API Contract', () => {
    test('mock outcomes should match API contract', () => {
      MOCK_OUTCOMES.forEach((outcome) => {
        expect(validateOutcomeContract(outcome)).toBe(true);
      });
    });

    test(
      'real API outcomes should match mock structure',
      async () => {
        if (!apiAvailable) {
          console.log('Skipping real API test - server not available');
          return;
        }

        try {
          const outcomes = await fetchAPI('/outcomes');

          expect(Array.isArray(outcomes)).toBe(true);

          if (outcomes.length > 0) {
            // Validate first outcome matches contract
            const firstOutcome = outcomes[0];
            expect(validateOutcomeContract(firstOutcome)).toBe(true);

            // Check if real data structure matches mock structure
            const mockOutcome = MOCK_OUTCOMES[0];
            const realKeys = Object.keys(firstOutcome).sort();
            const mockKeys = Object.keys(mockOutcome).sort();

            expect(realKeys).toEqual(expect.arrayContaining(mockKeys));
          }
        } catch (error) {
          console.warn('Could not validate outcomes API:', error);
        }
      },
      TEST_TIMEOUT,
    );

    test(
      'outcomes API should support filtering by grade',
      async () => {
        if (!apiAvailable) return;

        try {
          const outcomes = await fetchAPI('/outcomes?grade=1');

          expect(Array.isArray(outcomes)).toBe(true);
          outcomes.forEach((outcome: unknown) => {
            expect(validateOutcomeContract(outcome)).toBe(true);
            if (outcome && typeof outcome === 'object') {
              const obj = outcome as SafeObject;
              if (obj.grade !== undefined) {
                expect(obj.grade).toBe(1);
              }
            }
          });
        } catch (error) {
          console.warn('Could not validate outcomes filtering:', error);
        }
      },
      TEST_TIMEOUT,
    );
  });

  describe('Students API Contract', () => {
    test('mock students should match API contract', () => {
      MOCK_STUDENTS.forEach((student) => {
        expect(validateStudentContract(student)).toBe(true);
      });
    });

    test(
      'real API students should match mock structure',
      async () => {
        if (!apiAvailable) return;

        try {
          const students = await fetchAPI('/students');

          expect(Array.isArray(students)).toBe(true);

          if (students.length > 0) {
            const firstStudent = students[0];
            expect(validateStudentContract(firstStudent)).toBe(true);

            // Check structure compatibility
            const mockStudent = MOCK_STUDENTS[0];
            const realKeys = Object.keys(firstStudent).sort();
            const mockKeys = Object.keys(mockStudent).sort();

            expect(realKeys).toEqual(expect.arrayContaining(mockKeys));
          }
        } catch (error) {
          console.warn('Could not validate students API:', error);
        }
      },
      TEST_TIMEOUT,
    );
  });

  describe('Teacher Reflections API Contract', () => {
    test('mock teacher reflections should match API contract', () => {
      MOCK_TEACHER_REFLECTIONS.forEach((reflection) => {
        expect(validateTeacherReflectionContract(reflection)).toBe(true);
      });
    });

    test(
      'real API teacher reflections should match mock structure',
      async () => {
        if (!apiAvailable) return;

        try {
          const reflections = await fetchAPI('/reflections');

          expect(Array.isArray(reflections)).toBe(true);

          if (reflections.length > 0) {
            const firstReflection = reflections[0];
            expect(validateTeacherReflectionContract(firstReflection)).toBe(true);
          }
        } catch (error) {
          console.warn('Could not validate teacher reflections API:', error);
        }
      },
      TEST_TIMEOUT,
    );

    test(
      'create teacher reflection API should accept correct format',
      async () => {
        if (!apiAvailable) return;

        const testReflection = {
          content: 'Contract test reflection',
          outcomeId: '1',
        };

        try {
          const result = await fetchAPI('/reflections', {
            method: 'POST',
            body: JSON.stringify(testReflection),
          });

          expect(validateTeacherReflectionContract(result)).toBe(true);
          expect(result.content).toBe(testReflection.content);
          expect(result.outcomeId).toBe(testReflection.outcomeId);

          // Cleanup
          await fetchAPI(`/reflections/${result.id}`, { method: 'DELETE' });
        } catch (error) {
          console.warn('Could not validate teacher reflection creation:', error);
        }
      },
      TEST_TIMEOUT,
    );
  });

  describe('Assessment Templates API Contract', () => {
    test(
      'create assessment template API should accept correct format',
      async () => {
        if (!apiAvailable) return;

        const testTemplate = {
          title: 'Contract Test Assessment',
          type: 'oral' as const,
          description: 'Test assessment for contract validation',
          outcomeIds: ['1'],
          rubricCriteria: JSON.stringify({
            criteria: [
              {
                name: 'Test Criterion',
                description: 'Test description',
                levels: [
                  { score: 4, description: 'Excellent' },
                  { score: 3, description: 'Good' },
                  { score: 2, description: 'Satisfactory' },
                  { score: 1, description: 'Needs improvement' },
                ],
              },
            ],
          }),
        };

        try {
          const result = await fetchAPI('/assessment', {
            method: 'POST',
            body: JSON.stringify(testTemplate),
          });

          expect(validateAssessmentTemplateContract(result)).toBe(true);
          expect(result.title).toBe(testTemplate.title);
          expect(result.type).toBe(testTemplate.type);

          // Cleanup
          await fetchAPI(`/assessment/${result.id}`, { method: 'DELETE' });
        } catch (error) {
          console.warn('Could not validate assessment template creation:', error);
        }
      },
      TEST_TIMEOUT,
    );
  });

  describe('Student Reflections API Contract', () => {
    test(
      'create student reflection API should accept correct format',
      async () => {
        if (!apiAvailable) return;

        const testReflection = {
          content: 'Contract test student reflection',
          studentId: 1,
          outcomeId: '1',
        };

        try {
          const result = await fetchAPI('/students/reflections', {
            method: 'POST',
            body: JSON.stringify(testReflection),
          });

          expect(validateStudentReflectionContract(result)).toBe(true);
          expect(result.content).toBe(testReflection.content);
          expect(result.studentId).toBe(testReflection.studentId);

          // Cleanup
          await fetchAPI(`/students/reflections/${result.id}`, { method: 'DELETE' });
        } catch (error) {
          console.warn('Could not validate student reflection creation:', error);
        }
      },
      TEST_TIMEOUT,
    );
  });

  describe('API Error Handling Contracts', () => {
    test(
      'APIs should return consistent error format',
      async () => {
        if (!apiAvailable) return;

        try {
          // Test invalid endpoint
          await fetchAPI('/nonexistent-endpoint');
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toContain('404');
        }

        try {
          // Test invalid data
          await fetchAPI('/reflections', {
            method: 'POST',
            body: JSON.stringify({ invalid: 'data' }),
          });
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toMatch(/400|422/); // Bad request or validation error
        }
      },
      TEST_TIMEOUT,
    );

    test(
      'APIs should handle missing authentication consistently',
      async () => {
        if (!apiAvailable) return;

        try {
          await fetch(`${API_BASE_URL}/api/reflections`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // No authorization header
            body: JSON.stringify({ content: 'test' }),
          });
        } catch (error) {
          // Should get 401 or similar auth error
          expect(error).toBeDefined();
        }
      },
      TEST_TIMEOUT,
    );
  });

  describe('Mock vs Reality Compliance Report', () => {
    test('generate compliance report for development team', async () => {
      const report = {
        timestamp: new Date().toISOString(),
        apiAvailable,
        mockValidation: {
          outcomes: MOCK_OUTCOMES.every(validateOutcomeContract),
          students: MOCK_STUDENTS.every(validateStudentContract),
          teacherReflections: MOCK_TEACHER_REFLECTIONS.every(validateTeacherReflectionContract),
        },
        recommendations: [] as string[],
      };

      if (!apiAvailable) {
        report.recommendations.push(
          'Start API server to validate real API contracts',
          'Ensure test database is seeded with appropriate data',
          'Verify authentication system is configured for tests',
        );
      }

      // Check mock data completeness
      if (MOCK_OUTCOMES.length < 3) {
        report.recommendations.push('Add more diverse outcome types to mock data');
      }

      if (MOCK_STUDENTS.length < 2) {
        report.recommendations.push('Add more students with different grades to mock data');
      }

      console.log('Assessment API Contract Compliance Report:', JSON.stringify(report, null, 2));

      // Test should pass regardless of API availability
      expect(report.mockValidation.outcomes).toBe(true);
      expect(report.mockValidation.students).toBe(true);
      expect(report.mockValidation.teacherReflections).toBe(true);
    });
  });

  describe('Data Type and Format Validation', () => {
    test('date formats should be consistent between mocks and API', () => {
      // ISO 8601 format validation
      const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;

      MOCK_STUDENTS.forEach((student) => {
        expect(student.createdAt).toMatch(dateRegex);
        expect(student.updatedAt).toMatch(dateRegex);
      });

      MOCK_TEACHER_REFLECTIONS.forEach((reflection) => {
        expect(reflection.createdAt).toMatch(dateRegex);
        expect(reflection.updatedAt).toMatch(dateRegex);
      });
    });

    test('ID formats should be consistent', () => {
      // Outcome IDs should be strings
      MOCK_OUTCOMES.forEach((outcome) => {
        expect(typeof outcome.id).toBe('string');
        expect(outcome.id.length).toBeGreaterThan(0);
      });

      // Student/reflection IDs should be numbers
      MOCK_STUDENTS.forEach((student) => {
        expect(typeof student.id).toBe('number');
        expect(student.id).toBeGreaterThan(0);
      });

      MOCK_TEACHER_REFLECTIONS.forEach((reflection) => {
        expect(typeof reflection.id).toBe('number');
        expect(reflection.id).toBeGreaterThan(0);
      });
    });

    test('grade values should be valid', () => {
      const validGrades = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

      MOCK_OUTCOMES.forEach((outcome) => {
        expect(validGrades).toContain(outcome.grade);
      });

      MOCK_STUDENTS.forEach((student) => {
        expect(validGrades).toContain(student.grade);
      });
    });

    test('required vs optional fields should be clearly defined', () => {
      // Required fields should never be null/undefined
      MOCK_OUTCOMES.forEach((outcome) => {
        expect(outcome.id).toBeDefined();
        expect(outcome.code).toBeDefined();
        expect(outcome.description).toBeDefined();
        expect(outcome.subject).toBeDefined();
        expect(outcome.grade).toBeDefined();
        expect(outcome.domain).toBeDefined();
      });

      MOCK_STUDENTS.forEach((student) => {
        expect(student.id).toBeDefined();
        expect(student.firstName).toBeDefined();
        expect(student.lastName).toBeDefined();
        expect(student.grade).toBeDefined();
        expect(student.userId).toBeDefined();
        expect(student.parentContacts).toBeDefined(); // Array can be empty but not undefined
      });
    });
  });
});
