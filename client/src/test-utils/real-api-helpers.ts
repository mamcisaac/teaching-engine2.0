/**
 * Real API Test Helpers
 * Utilities for testing with actual API calls instead of mocks
 */

import { QueryClient } from '@tanstack/react-query';
import { testAPI, TEST_CONFIG } from './real-backend-setup';
import type { AuthTestContext } from './auth-test-utils';

// Real data factory for consistent test data
export const testDataFactory = {
  longRangePlan: (overrides = {}) => ({
    title: `Test Long Range Plan ${Date.now()}`,
    grade: 3,
    subject: 'Mathematics',
    description: 'Test description for long range plan',
    totalHours: 100,
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    ...overrides,
  }),

  unitPlan: (longRangePlanId: string, overrides = {}) => ({
    title: `Test Unit Plan ${Date.now()}`,
    description: 'Test description for unit plan',
    longRangePlanId,
    grade: 3,
    subjects: ['Mathematics'],
    bigIdeas: 'Test big ideas for unit plan',
    totalHours: 20,
    startDate: '2024-01-01',
    endDate: '2024-01-15',
    ...overrides,
  }),

  etfoLessonPlan: (unitPlanId: string, overrides = {}) => ({
    title: `Test ETFO Lesson Plan ${Date.now()}`,
    date: '2024-01-02',
    unitPlanId,
    duration: 60,
    groupingStrategies: 'Whole class',
    learningGoals: 'Students will understand basic concepts',
    successCriteria: 'Students can explain the concept',
    priorKnowledge: 'Basic math skills',
    introduction: 'Start with a warm-up activity',
    bodyOfLesson: 'Main teaching content',
    consolidation: 'Review and practice',
    materials: 'Whiteboard, worksheets',
    ...overrides,
  }),

  daybookEntry: (overrides = {}) => ({
    date: '2024-01-02',
    morningReflection: 'Test morning reflection',
    teachingNotes: 'Test teaching notes',
    afternoonReflection: 'Test afternoon reflection',
    ...overrides,
  }),

  curriculumExpectation: (overrides = {}) => ({
    code: `M3.${Date.now().toString().slice(-3)}`,
    description: 'Test curriculum expectation',
    grade: 3,
    subject: 'Mathematics',
    strand: 'Number Sense',
    ...overrides,
  }),

  user: (overrides = {}) => ({
    email: `test-${Date.now()}@example.com`,
    name: 'Test User',
    password: 'TestPassword123!',
    role: 'USER',
    ...overrides,
  }),
};

// API test helpers that make real calls
export const realApiHelpers = {
  // Long Range Plans
  async createLongRangePlan(authContext: AuthTestContext, data = {}) {
    const planData = testDataFactory.longRangePlan(data);
    return await testAPI.post('/long-range-plans', planData);
  },

  async getLongRangePlans(authContext: AuthTestContext, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await testAPI.get(`/long-range-plans?${queryString}`);
  },

  async getLongRangePlan(authContext: AuthTestContext, id: string) {
    return await testAPI.get(`/long-range-plans/${id}`);
  },

  async updateLongRangePlan(authContext: AuthTestContext, id: string, data: any) {
    return await testAPI.put(`/long-range-plans/${id}`, data);
  },

  async deleteLongRangePlan(authContext: AuthTestContext, id: string) {
    return await testAPI.delete(`/long-range-plans/${id}`);
  },

  // Unit Plans
  async createUnitPlan(authContext: AuthTestContext, longRangePlanId: string, data = {}) {
    const planData = testDataFactory.unitPlan(longRangePlanId, data);
    return await testAPI.post('/unit-plans', planData);
  },

  async getUnitPlans(authContext: AuthTestContext, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await testAPI.get(`/unit-plans?${queryString}`);
  },

  async getUnitPlan(authContext: AuthTestContext, id: string) {
    return await testAPI.get(`/unit-plans/${id}`);
  },

  async updateUnitPlan(authContext: AuthTestContext, id: string, data: any) {
    return await testAPI.put(`/unit-plans/${id}`, data);
  },

  async deleteUnitPlan(authContext: AuthTestContext, id: string) {
    return await testAPI.delete(`/unit-plans/${id}`);
  },

  // ETFO Lesson Plans
  async createETFOLessonPlan(authContext: AuthTestContext, unitPlanId: string, data = {}) {
    const planData = testDataFactory.etfoLessonPlan(unitPlanId, data);
    return await testAPI.post('/etfo-lesson-plans', planData);
  },

  async getETFOLessonPlans(authContext: AuthTestContext, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await testAPI.get(`/etfo-lesson-plans?${queryString}`);
  },

  async getETFOLessonPlan(authContext: AuthTestContext, id: string) {
    return await testAPI.get(`/etfo-lesson-plans/${id}`);
  },

  async updateETFOLessonPlan(authContext: AuthTestContext, id: string, data: any) {
    return await testAPI.put(`/etfo-lesson-plans/${id}`, data);
  },

  async deleteETFOLessonPlan(authContext: AuthTestContext, id: string) {
    return await testAPI.delete(`/etfo-lesson-plans/${id}`);
  },

  // Daybook Entries
  async createDaybookEntry(authContext: AuthTestContext, data = {}) {
    const entryData = testDataFactory.daybookEntry(data);
    return await testAPI.post('/daybook-entries', entryData);
  },

  async getDaybookEntries(authContext: AuthTestContext, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await testAPI.get(`/daybook-entries?${queryString}`);
  },

  async updateDaybookEntry(authContext: AuthTestContext, id: string, data: any) {
    return await testAPI.put(`/daybook-entries/${id}`, data);
  },

  // Curriculum Expectations
  async getCurriculumExpectations(authContext: AuthTestContext, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await testAPI.get(`/curriculum-expectations?${queryString}`);
  },

  async createCurriculumExpectation(authContext: AuthTestContext, data = {}) {
    const expectationData = testDataFactory.curriculumExpectation(data);
    return await testAPI.post('/curriculum-expectations', expectationData);
  },

  // Notifications
  async getNotifications(authContext: AuthTestContext) {
    return await testAPI.get('/notifications');
  },

  async markNotificationRead(authContext: AuthTestContext, id: string) {
    return await testAPI.put(`/notifications/${id}/read`);
  },
};

// Test data seeding utilities
export const testDataSeeder = {
  async seedBasicPlanningData(authContext: AuthTestContext) {
    // Create long range plan
    const longRangePlan = await realApiHelpers.createLongRangePlan(authContext, {
      title: 'Grade 3 Mathematics - Full Year',
    });

    // Create unit plan
    const unitPlan = await realApiHelpers.createUnitPlan(authContext, longRangePlan.id, {
      title: 'Fractions Unit',
    });

    // Create lesson plan
    const lessonPlan = await realApiHelpers.createETFOLessonPlan(authContext, unitPlan.id, {
      title: 'Introduction to Fractions',
    });

    // Create daybook entry
    const daybookEntry = await realApiHelpers.createDaybookEntry(authContext, {
      date: '2024-01-02',
    });

    return {
      longRangePlan,
      unitPlan,
      lessonPlan,
      daybookEntry,
    };
  },

  async seedCurriculumData(authContext: AuthTestContext) {
    const expectations = [];
    
    // Create several curriculum expectations
    for (let i = 0; i < 5; i++) {
      const expectation = await realApiHelpers.createCurriculumExpectation(authContext, {
        code: `M3.${i + 1}`,
        description: `Mathematics expectation ${i + 1}`,
      });
      expectations.push(expectation);
    }

    return { expectations };
  },

  async seedLargePlanningData(authContext: AuthTestContext, count = 10) {
    const data: any = {
      longRangePlans: [],
      unitPlans: [],
      lessonPlans: [],
    };

    // Create multiple long range plans
    for (let i = 0; i < count; i++) {
      const longRangePlan = await realApiHelpers.createLongRangePlan(authContext, {
        title: `Long Range Plan ${i + 1}`,
        subject: i % 2 === 0 ? 'Mathematics' : 'Language Arts',
      });
      data.longRangePlans.push(longRangePlan);

      // Create unit plans for each long range plan
      for (let j = 0; j < 3; j++) {
        const unitPlan = await realApiHelpers.createUnitPlan(authContext, longRangePlan.id, {
          title: `Unit Plan ${i + 1}.${j + 1}`,
        });
        data.unitPlans.push(unitPlan);

        // Create lesson plans for each unit plan
        for (let k = 0; k < 2; k++) {
          const lessonPlan = await realApiHelpers.createETFOLessonPlan(authContext, unitPlan.id, {
            title: `Lesson Plan ${i + 1}.${j + 1}.${k + 1}`,
          });
          data.lessonPlans.push(lessonPlan);
        }
      }
    }

    return data;
  },
};

// Test assertions for real API responses
export const realApiAssertions = {
  assertValidLongRangePlan(plan: any) {
    expect(plan).toHaveProperty('id');
    expect(plan).toHaveProperty('title');
    expect(plan).toHaveProperty('grade');
    expect(plan).toHaveProperty('subject');
    expect(plan).toHaveProperty('createdAt');
    expect(plan).toHaveProperty('updatedAt');
    expect(typeof plan.id).toBe('string');
    expect(typeof plan.title).toBe('string');
    expect(typeof plan.grade).toBe('number');
  },

  assertValidUnitPlan(plan: any) {
    expect(plan).toHaveProperty('id');
    expect(plan).toHaveProperty('title');
    expect(plan).toHaveProperty('longRangePlanId');
    expect(plan).toHaveProperty('createdAt');
    expect(plan).toHaveProperty('updatedAt');
    expect(typeof plan.id).toBe('string');
    expect(typeof plan.title).toBe('string');
    expect(typeof plan.longRangePlanId).toBe('string');
  },

  assertValidETFOLessonPlan(plan: any) {
    expect(plan).toHaveProperty('id');
    expect(plan).toHaveProperty('title');
    expect(plan).toHaveProperty('unitPlanId');
    expect(plan).toHaveProperty('date');
    expect(plan).toHaveProperty('createdAt');
    expect(plan).toHaveProperty('updatedAt');
    expect(typeof plan.id).toBe('string');
    expect(typeof plan.title).toBe('string');
    expect(typeof plan.unitPlanId).toBe('string');
  },

  assertValidDaybookEntry(entry: any) {
    expect(entry).toHaveProperty('id');
    expect(entry).toHaveProperty('date');
    expect(entry).toHaveProperty('createdAt');
    expect(entry).toHaveProperty('updatedAt');
    expect(typeof entry.id).toBe('string');
    expect(typeof entry.date).toBe('string');
  },

  assertValidUser(user: any) {
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('role');
    expect(typeof user.id).toBe('number');
    expect(typeof user.email).toBe('string');
    expect(typeof user.name).toBe('string');
  },
};

// Performance testing helpers
export const performanceHelpers = {
  async measureApiCallTime(apiCall: () => Promise<any>) {
    const start = performance.now();
    const result = await apiCall();
    const end = performance.now();
    return {
      result,
      timeMs: end - start,
    };
  },

  async testApiPerformance(authContext: AuthTestContext, iterations = 10) {
    const results: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const { timeMs } = await this.measureApiCallTime(() =>
        realApiHelpers.getLongRangePlans(authContext)
      );
      results.push(timeMs);
    }

    const average = results.reduce((sum, time) => sum + time, 0) / results.length;
    const min = Math.min(...results);
    const max = Math.max(...results);

    return { average, min, max, results };
  },
};

// Error testing helpers
export const errorTestHelpers = {
  async testUnauthorizedAccess(endpoint: string) {
    try {
      await testAPI.get(endpoint);
      throw new Error('Expected unauthorized error');
    } catch (error: any) {
      expect(error.response?.status).toBe(401);
    }
  },

  async testNotFoundError(authContext: AuthTestContext, endpoint: string) {
    try {
      await testAPI.get(endpoint);
      throw new Error('Expected not found error');
    } catch (error: any) {
      expect(error.response?.status).toBe(404);
    }
  },

  async testValidationError(authContext: AuthTestContext, endpoint: string, invalidData: any) {
    try {
      await testAPI.post(endpoint, invalidData);
      throw new Error('Expected validation error');
    } catch (error: any) {
      expect(error.response?.status).toBe(400);
    }
  },
};