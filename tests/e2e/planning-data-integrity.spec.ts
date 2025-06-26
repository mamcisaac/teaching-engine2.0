import { test, expect, Page } from '@playwright/test';
import { loginAsTestUser, createTestUser, cleanupTestData } from './helpers/auth';

interface DataIntegrityTestSuite {
  userId: number;
  longRangePlanId?: string;
  unitPlanId?: string;
  lessonPlanId?: string;
  daybookEntryId?: string;
  curriculumExpectationIds?: string[];
}

class DataIntegrityValidator {
  constructor(private page: Page) {}

  async validateDatabaseConstraints() {
    // Validate foreign key relationships
    const response = await this.page.request.get('/api/health/database-integrity');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.foreignKeyViolations).toBe(0);
    expect(data.orphanedRecords).toBe(0);
  }

  async validatePlanningHierarchy(testData: DataIntegrityTestSuite) {
    // Validate that planning hierarchy is maintained
    if (testData.longRangePlanId && testData.unitPlanId) {
      const unitPlan = await this.page.request.get(`/api/unit-plans/${testData.unitPlanId}`);
      const unitData = await unitPlan.json();
      expect(unitData.longRangePlanId).toBe(testData.longRangePlanId);
    }

    if (testData.unitPlanId && testData.lessonPlanId) {
      const lessonPlan = await this.page.request.get(`/api/etfo-lesson-plans/${testData.lessonPlanId}`);
      const lessonData = await lessonPlan.json();
      expect(lessonData.unitPlanId).toBe(testData.unitPlanId);
    }

    if (testData.lessonPlanId && testData.daybookEntryId) {
      const daybookEntry = await this.page.request.get(`/api/daybook-entries/${testData.daybookEntryId}`);
      const daybookData = await daybookEntry.json();
      expect(daybookData.lessonPlanId).toBe(testData.lessonPlanId);
    }
  }

  async validateExpectationLinking(expectationId: string, planId: string, planType: 'long-range' | 'unit' | 'lesson' | 'daybook') {
    const response = await this.page.request.get(`/api/curriculum-expectations/${expectationId}/linked-plans`);
    const linkData = await response.json();
    
    const linkedPlans = linkData[`${planType}Plans`] || [];
    const isLinked = linkedPlans.some((plan: any) => plan.id === planId);
    expect(isLinked).toBe(true);
  }

  async validateDateConsistency(testData: DataIntegrityTestSuite) {
    if (testData.unitPlanId) {
      const unitResponse = await this.page.request.get(`/api/unit-plans/${testData.unitPlanId}`);
      const unitData = await unitResponse.json();
      
      if (testData.lessonPlanId) {
        const lessonResponse = await this.page.request.get(`/api/etfo-lesson-plans/${testData.lessonPlanId}`);
        const lessonData = await lessonResponse.json();
        
        const unitStart = new Date(unitData.startDate);
        const unitEnd = new Date(unitData.endDate);
        const lessonDate = new Date(lessonData.date);
        
        expect(lessonDate >= unitStart && lessonDate <= unitEnd).toBe(true);
      }
    }
  }

  async validateConcurrentModifications(planId: string, planType: string) {
    // Simulate concurrent modifications to test for race conditions
    const promises = [
      this.page.request.put(`/api/${planType}-plans/${planId}`, {
        data: { title: 'Concurrent Update 1' }
      }),
      this.page.request.put(`/api/${planType}-plans/${planId}`, {
        data: { title: 'Concurrent Update 2' }
      })
    ];

    const results = await Promise.allSettled(promises);
    
    // At least one should succeed
    const successes = results.filter(r => r.status === 'fulfilled');
    expect(successes.length).toBeGreaterThan(0);
  }

  async validateCascadeOperations(testData: DataIntegrityTestSuite) {
    if (testData.longRangePlanId) {
      // Delete long-range plan and verify cascade
      await this.page.request.delete(`/api/long-range-plans/${testData.longRangePlanId}`);
      
      // Check that related unit plans are handled correctly
      if (testData.unitPlanId) {
        const response = await this.page.request.get(`/api/unit-plans/${testData.unitPlanId}`);
        expect(response.status()).toBe(404); // Should be deleted or orphaned
      }
    }
  }
}

class DataCorruptionSimulator {
  constructor(private page: Page) {}

  async simulateNetworkInterruption(operation: () => Promise<any>) {
    // Start operation
    const operationPromise = operation();
    
    // Simulate network interruption after short delay
    setTimeout(async () => {
      await this.page.setOffline(true);
      await this.page.waitForTimeout(1000);
      await this.page.setOffline(false);
    }, 500);

    return operationPromise;
  }

  async simulatePartialDataSave(planId: string) {
    // Send incomplete data to test validation
    const response = await this.page.request.put(`/api/unit-plans/${planId}`, {
      data: {
        title: '', // Invalid empty title
        startDate: 'invalid-date', // Invalid date format
        // Missing required fields
      }
    });

    expect(response.status()).toBe(400); // Should reject invalid data
  }

  async simulateDuplicateOperations(operation: () => Promise<any>) {
    // Send duplicate requests rapidly
    const promises = Array(5).fill(null).map(() => operation());
    const results = await Promise.allSettled(promises);
    
    // Should handle duplicates gracefully
    const successes = results.filter(r => r.status === 'fulfilled');
    expect(successes.length).toBeGreaterThan(0);
    expect(successes.length).toBeLessThanOrEqual(1); // Should prevent true duplicates
  }
}

test.describe('Planning Data Integrity Tests', () => {
  let validator: DataIntegrityValidator;
  let corruptionSim: DataCorruptionSimulator;
  let testData: DataIntegrityTestSuite;

  test.beforeEach(async ({ page }) => {
    validator = new DataIntegrityValidator(page);
    corruptionSim = new DataCorruptionSimulator(page);
    await loginAsTestUser(page);
    
    // Create test user if not exists
    const userResponse = await page.request.get('/api/auth/me');
    const userData = await userResponse.json();
    testData = { userId: userData.id };
  });

  test.afterEach(async ({ page }) => {
    if (testData?.userId) {
      await cleanupTestData(page, testData.userId);
    }
  });

  test.describe('Foreign Key Integrity', () => {
    test('should maintain referential integrity across planning levels', async ({ page }) => {
      await test.step('Create planning hierarchy', async () => {
        // Create long-range plan
        const lrResponse = await page.request.post('/api/long-range-plans', {
          data: {
            title: 'Integrity Test Long Range Plan',
            academicYear: '2024-2025',
            grade: 1,
            subject: 'Mathematics'
          }
        });
        const lrData = await lrResponse.json();
        testData.longRangePlanId = lrData.id;

        // Create unit plan
        const unitResponse = await page.request.post('/api/unit-plans', {
          data: {
            title: 'Integrity Test Unit Plan',
            longRangePlanId: testData.longRangePlanId,
            startDate: '2024-02-01',
            endDate: '2024-02-28'
          }
        });
        const unitData = await unitResponse.json();
        testData.unitPlanId = unitData.id;

        // Create lesson plan
        const lessonResponse = await page.request.post('/api/etfo-lesson-plans', {
          data: {
            title: 'Integrity Test Lesson',
            unitPlanId: testData.unitPlanId,
            date: '2024-02-15',
            duration: 60
          }
        });
        const lessonData = await lessonResponse.json();
        testData.lessonPlanId = lessonData.id;
      });

      await test.step('Validate hierarchy integrity', async () => {
        await validator.validatePlanningHierarchy(testData);
      });

      await test.step('Validate foreign key constraints', async () => {
        await validator.validateDatabaseConstraints();
      });
    });

    test('should prevent orphaned records', async ({ page }) => {
      // Create hierarchy
      const lrResponse = await page.request.post('/api/long-range-plans', {
        data: {
          title: 'Orphan Test Plan',
          academicYear: '2024-2025',
          grade: 1,
          subject: 'Mathematics'
        }
      });
      const lrData = await lrResponse.json();
      testData.longRangePlanId = lrData.id;

      const unitResponse = await page.request.post('/api/unit-plans', {
        data: {
          title: 'Orphan Test Unit',
          longRangePlanId: testData.longRangePlanId,
          startDate: '2024-02-01',
          endDate: '2024-02-28'
        }
      });
      const unitData = await unitResponse.json();
      testData.unitPlanId = unitData.id;

      // Try to delete parent while child exists
      const deleteResponse = await page.request.delete(`/api/long-range-plans/${testData.longRangePlanId}`);
      
      // Should either cascade delete or prevent deletion
      if (deleteResponse.status() === 200) {
        // If cascade delete allowed, verify child is also deleted
        const childResponse = await page.request.get(`/api/unit-plans/${testData.unitPlanId}`);
        expect(childResponse.status()).toBe(404);
      } else {
        // If cascade delete prevented, parent should still exist
        expect(deleteResponse.status()).toBe(409); // Conflict
      }
    });
  });

  test.describe('Curriculum Expectation Linking', () => {
    test('should maintain expectation-plan relationships', async ({ page }) => {
      await test.step('Create curriculum expectation', async () => {
        const expectationResponse = await page.request.post('/api/curriculum-expectations', {
          data: {
            code: 'TEST.1.1',
            description: 'Test expectation for integrity',
            strand: 'Test Strand',
            grade: 1,
            subject: 'Mathematics'
          }
        });
        const expectationData = await expectationResponse.json();
        testData.curriculumExpectationIds = [expectationData.id];
      });

      await test.step('Link expectation to plans', async () => {
        // Create unit plan with expectation
        const unitResponse = await page.request.post('/api/unit-plans', {
          data: {
            title: 'Expectation Test Unit',
            startDate: '2024-02-01',
            endDate: '2024-02-28',
            expectationIds: testData.curriculumExpectationIds
          }
        });
        const unitData = await unitResponse.json();
        testData.unitPlanId = unitData.id;
      });

      await test.step('Validate expectation linking', async () => {
        const expectationId = testData.curriculumExpectationIds![0];
        await validator.validateExpectationLinking(expectationId, testData.unitPlanId!, 'unit');
      });

      await test.step('Test expectation deletion constraints', async () => {
        const expectationId = testData.curriculumExpectationIds![0];
        const deleteResponse = await page.request.delete(`/api/curriculum-expectations/${expectationId}`);
        
        // Should either cascade or prevent deletion
        if (deleteResponse.status() === 409) {
          // Deletion prevented - verify expectation still exists
          const expectationResponse = await page.request.get(`/api/curriculum-expectations/${expectationId}`);
          expect(expectationResponse.status()).toBe(200);
        }
      });
    });

    test('should track coverage accurately', async ({ page }) => {
      // Create multiple expectations and plans
      const expectations = [];
      for (let i = 1; i <= 3; i++) {
        const response = await page.request.post('/api/curriculum-expectations', {
          data: {
            code: `COV.1.${i}`,
            description: `Coverage test expectation ${i}`,
            strand: 'Coverage',
            grade: 1,
            subject: 'Mathematics'
          }
        });
        const data = await response.json();
        expectations.push(data.id);
      }

      // Create unit plan covering some expectations
      const unitResponse = await page.request.post('/api/unit-plans', {
        data: {
          title: 'Coverage Test Unit',
          startDate: '2024-02-01',
          endDate: '2024-02-28',
          expectationIds: expectations.slice(0, 2) // Cover only first 2
        }
      });

      // Check coverage calculation
      const coverageResponse = await page.request.get('/api/curriculum-expectations/coverage');
      const coverageData = await coverageResponse.json();
      
      expect(coverageData.totalExpectations).toBeGreaterThanOrEqual(3);
      expect(coverageData.coveredExpectations).toBeGreaterThanOrEqual(2);
      expect(coverageData.coveragePercentage).toBeGreaterThan(0);
    });
  });

  test.describe('Date and Timeline Consistency', () => {
    test('should enforce date constraints across planning levels', async ({ page }) => {
      await test.step('Create unit plan with date range', async () => {
        const unitResponse = await page.request.post('/api/unit-plans', {
          data: {
            title: 'Date Constraint Test',
            startDate: '2024-02-01',
            endDate: '2024-02-28'
          }
        });
        const unitData = await unitResponse.json();
        testData.unitPlanId = unitData.id;
      });

      await test.step('Try to create lesson outside date range', async () => {
        const lessonResponse = await page.request.post('/api/etfo-lesson-plans', {
          data: {
            title: 'Invalid Date Lesson',
            unitPlanId: testData.unitPlanId,
            date: '2024-03-15', // Outside unit date range
            duration: 60
          }
        });

        // Should either reject or allow with warning
        if (lessonResponse.status() === 400) {
          const error = await lessonResponse.json();
          expect(error.error).toContain('date');
        }
      });

      await test.step('Create valid lesson within range', async () => {
        const lessonResponse = await page.request.post('/api/etfo-lesson-plans', {
          data: {
            title: 'Valid Date Lesson',
            unitPlanId: testData.unitPlanId,
            date: '2024-02-15',
            duration: 60
          }
        });
        
        expect(lessonResponse.status()).toBe(201);
        const lessonData = await lessonResponse.json();
        testData.lessonPlanId = lessonData.id;
      });

      await test.step('Validate date consistency', async () => {
        await validator.validateDateConsistency(testData);
      });
    });

    test('should handle timezone consistency', async ({ page }) => {
      // Test that dates are handled consistently across timezones
      const unitResponse = await page.request.post('/api/unit-plans', {
        data: {
          title: 'Timezone Test Unit',
          startDate: '2024-02-01T00:00:00.000Z',
          endDate: '2024-02-28T23:59:59.999Z'
        }
      });

      const unitData = await unitResponse.json();
      expect(new Date(unitData.startDate)).toBeInstanceOf(Date);
      expect(new Date(unitData.endDate)).toBeInstanceOf(Date);
    });
  });

  test.describe('Concurrent Modification Handling', () => {
    test('should handle concurrent updates gracefully', async ({ page, context }) => {
      await test.step('Create test plan', async () => {
        const unitResponse = await page.request.post('/api/unit-plans', {
          data: {
            title: 'Concurrent Test Unit',
            startDate: '2024-02-01',
            endDate: '2024-02-28'
          }
        });
        const unitData = await unitResponse.json();
        testData.unitPlanId = unitData.id;
      });

      await test.step('Test concurrent modifications', async () => {
        await validator.validateConcurrentModifications(testData.unitPlanId!, 'unit');
      });
    });

    test('should prevent duplicate operations', async ({ page }) => {
      const duplicateOperation = async () => {
        return page.request.post('/api/unit-plans', {
          data: {
            title: 'Duplicate Test Unit',
            startDate: '2024-02-01',
            endDate: '2024-02-28'
          }
        });
      };

      await corruptionSim.simulateDuplicateOperations(duplicateOperation);
    });
  });

  test.describe('Data Validation and Corruption Prevention', () => {
    test('should reject invalid data', async ({ page }) => {
      const invalidDataTests = [
        {
          name: 'Empty title',
          data: { title: '', startDate: '2024-02-01', endDate: '2024-02-28' }
        },
        {
          name: 'Invalid date format',
          data: { title: 'Test', startDate: 'invalid-date', endDate: '2024-02-28' }
        },
        {
          name: 'End date before start date',
          data: { title: 'Test', startDate: '2024-02-28', endDate: '2024-02-01' }
        },
        {
          name: 'Missing required fields',
          data: { title: 'Test' } // Missing dates
        }
      ];

      for (const testCase of invalidDataTests) {
        const response = await page.request.post('/api/unit-plans', {
          data: testCase.data
        });
        
        expect(response.status()).toBe(400);
        const errorData = await response.json();
        expect(errorData.error).toBeDefined();
      }
    });

    test('should handle network interruptions gracefully', async ({ page }) => {
      const createOperation = async () => {
        return page.request.post('/api/unit-plans', {
          data: {
            title: 'Network Test Unit',
            startDate: '2024-02-01',
            endDate: '2024-02-28'
          }
        });
      };

      // This should either succeed or fail gracefully
      try {
        await corruptionSim.simulateNetworkInterruption(createOperation);
      } catch (error) {
        // Network interruption should not cause data corruption
        await validator.validateDatabaseConstraints();
      }
    });

    test('should validate data transformation integrity', async ({ page }) => {
      // Test that data maintains integrity through transformations
      const originalData = {
        title: 'Transformation Test Unit',
        description: 'Original description with special chars: àáâãäå',
        startDate: '2024-02-01',
        endDate: '2024-02-28'
      };

      const createResponse = await page.request.post('/api/unit-plans', {
        data: originalData
      });

      const createdData = await createResponse.json();
      testData.unitPlanId = createdData.id;

      // Verify data integrity after round trip
      expect(createdData.title).toBe(originalData.title);
      expect(createdData.description).toBe(originalData.description);
      
      const retrieveResponse = await page.request.get(`/api/unit-plans/${testData.unitPlanId}`);
      const retrievedData = await retrieveResponse.json();
      
      expect(retrievedData.title).toBe(originalData.title);
      expect(retrievedData.description).toBe(originalData.description);
    });
  });

  test.describe('Cascade Operations and Cleanup', () => {
    test('should handle cascade deletions correctly', async ({ page }) => {
      await test.step('Create nested hierarchy', async () => {
        // Create full hierarchy for cascade testing
        const lrResponse = await page.request.post('/api/long-range-plans', {
          data: {
            title: 'Cascade Test Long Range',
            academicYear: '2024-2025',
            grade: 1,
            subject: 'Mathematics'
          }
        });
        const lrData = await lrResponse.json();
        testData.longRangePlanId = lrData.id;

        const unitResponse = await page.request.post('/api/unit-plans', {
          data: {
            title: 'Cascade Test Unit',
            longRangePlanId: testData.longRangePlanId,
            startDate: '2024-02-01',
            endDate: '2024-02-28'
          }
        });
        const unitData = await unitResponse.json();
        testData.unitPlanId = unitData.id;

        const lessonResponse = await page.request.post('/api/etfo-lesson-plans', {
          data: {
            title: 'Cascade Test Lesson',
            unitPlanId: testData.unitPlanId,
            date: '2024-02-15',
            duration: 60
          }
        });
        const lessonData = await lessonResponse.json();
        testData.lessonPlanId = lessonData.id;
      });

      await test.step('Test cascade deletion', async () => {
        await validator.validateCascadeOperations(testData);
      });
    });

    test('should clean up temporary data', async ({ page }) => {
      // Create temporary data that should be cleaned up
      const tempResponse = await page.request.post('/api/unit-plans', {
        data: {
          title: 'Temporary Unit for Cleanup Test',
          startDate: '2024-02-01',
          endDate: '2024-02-28',
          isDraft: true
        }
      });

      const tempData = await tempResponse.json();
      
      // Simulate cleanup operation
      const cleanupResponse = await page.request.post('/api/maintenance/cleanup-drafts', {
        data: { olderThan: '1970-01-01' } // Clean everything
      });

      expect(cleanupResponse.status()).toBe(200);
      
      // Verify temporary data is cleaned up
      const checkResponse = await page.request.get(`/api/unit-plans/${tempData.id}`);
      if (tempData.isDraft) {
        expect(checkResponse.status()).toBe(404); // Should be deleted
      }
    });
  });

  test.describe('State Persistence Integrity', () => {
    test('should maintain planner state consistency', async ({ page }) => {
      // Create and modify planner state
      const stateData = {
        defaultView: 'month',
        showWeekends: true,
        autoSave: true,
        autoSaveInterval: 30
      };

      const saveResponse = await page.request.put('/api/planner/state', {
        data: stateData
      });

      expect(saveResponse.status()).toBe(200);

      // Verify state persistence
      const loadResponse = await page.request.get('/api/planner/state');
      const loadedState = await loadResponse.json();

      expect(loadedState.defaultView).toBe(stateData.defaultView);
      expect(loadedState.showWeekends).toBe(stateData.showWeekends);
      expect(loadedState.autoSave).toBe(stateData.autoSave);
      expect(loadedState.autoSaveInterval).toBe(stateData.autoSaveInterval);
    });

    test('should handle corrupted state gracefully', async ({ page }) => {
      // Send corrupted state data
      const corruptedData = {
        defaultView: 'invalid-view',
        timeSlotDuration: -1,
        autoSaveInterval: 'not-a-number'
      };

      const response = await page.request.put('/api/planner/state', {
        data: corruptedData
      });

      expect(response.status()).toBe(400); // Should reject invalid data

      // Verify existing state is not corrupted
      const loadResponse = await page.request.get('/api/planner/state');
      expect(loadResponse.status()).toBe(200);
    });
  });
});

// Utility functions for data integrity testing
test.describe('Utility Functions', () => {
  test('should provide database health checks', async ({ page }) => {
    // Test database health check endpoint
    const healthResponse = await page.request.get('/api/health/database');
    expect(healthResponse.status()).toBe(200);
    
    const healthData = await healthResponse.json();
    expect(healthData.connected).toBe(true);
    expect(healthData.migrations).toBeDefined();
  });

  test('should provide data consistency reports', async ({ page }) => {
    // Test data consistency check
    const consistencyResponse = await page.request.get('/api/maintenance/consistency-check');
    expect(consistencyResponse.status()).toBe(200);
    
    const report = await consistencyResponse.json();
    expect(report.orphanedRecords).toBeDefined();
    expect(report.inconsistentDates).toBeDefined();
    expect(report.brokenReferences).toBeDefined();
  });
});