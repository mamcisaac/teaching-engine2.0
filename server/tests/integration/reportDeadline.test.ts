/**
 * Report Deadline Integration Tests
 * 
 * Tests the report deadline tracking and reminder system
 * for important school reporting deadlines
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { app } from '../../src/index';
import { authRequest } from '../test-auth-helper';
import { getTestPrismaClient, createTestData } from '../jest.setup';
import { addDays, subDays, format } from 'date-fns';

const auth = authRequest(app);

describe('Report Deadline API', () => {
  let testStudent: any;

  beforeAll(async () => {
    await auth.setup();
  });

  beforeEach(async () => {
    // Create test student for each test
    testStudent = await createTestData(async (prisma) => {
      return await prisma.student.create({
        data: {
          firstName: 'Test',
          lastName: 'Student',
          grade: 5,
          userId: auth.userId!,
        },
      });
    });
  });

  describe('Deadline Management', () => {
    it('should create a new report deadline', async () => {
      const deadlineData = {
        title: 'Progress Reports Due',
        description: 'First term progress reports',
        dueDate: addDays(new Date(), 14).toISOString(),
        reportType: 'progress',
        grade: 5,
        subject: 'All Subjects',
        priority: 'high',
        reminderDays: [7, 3, 1]
      };

      const response = await auth.post('/api/report-deadlines')
        .send(deadlineData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(deadlineData.title);
      expect(response.body.reportType).toBe(deadlineData.reportType);
      expect(response.body.reminderDays).toEqual(deadlineData.reminderDays);
    });

    it('should retrieve all deadlines for teacher', async () => {
      // Create test deadlines
      await auth.post('/api/report-deadlines')
        .send({
          title: 'Report Cards Due',
          dueDate: addDays(new Date(), 30).toISOString(),
          reportType: 'report_card',
          grade: 5
        });

      await auth.post('/api/report-deadlines')
        .send({
          title: 'Assessment Reports',
          dueDate: addDays(new Date(), 21).toISOString(),
          reportType: 'assessment',
          grade: 5
        });

      const response = await auth.get('/api/report-deadlines');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });

    it('should update existing deadline', async () => {
      // Create deadline
      const createResponse = await auth.post('/api/report-deadlines')
        .send({
          title: 'Original Deadline',
          dueDate: addDays(new Date(), 15).toISOString(),
          reportType: 'progress',
          grade: 4
        });

      const deadlineId = createResponse.body.id;

      // Update deadline
      const updateData = {
        title: 'Updated Deadline',
        dueDate: addDays(new Date(), 20).toISOString(),
        reportType: 'progress',
        grade: 4,
        priority: 'urgent',
        reminderDays: [5, 2]
      };

      const updateResponse = await auth.put(`/api/report-deadlines/${deadlineId}`)
        .send(updateData);

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.title).toBe('Updated Deadline');
      expect(updateResponse.body.priority).toBe('urgent');
    });

    it('should delete deadline', async () => {
      // Create deadline
      const createResponse = await auth.post('/api/report-deadlines')
        .send({
          title: 'Deadline to Delete',
          dueDate: addDays(new Date(), 10).toISOString(),
          reportType: 'narrative'
        });

      const deadlineId = createResponse.body.id;

      // Delete deadline
      const deleteResponse = await auth.delete(`/api/report-deadlines/${deadlineId}`);
      expect(deleteResponse.status).toBe(204);

      // Verify deletion
      const getResponse = await auth.get(`/api/report-deadlines/${deadlineId}`);
      expect(getResponse.status).toBe(404);
    });
  });

  describe('Deadline Filtering and Sorting', () => {
    beforeEach(async () => {
      // Create sample deadlines with different dates and types
      const deadlines = [
        {
          title: 'Upcoming Progress Reports',
          dueDate: addDays(new Date(), 5).toISOString(),
          reportType: 'progress',
          priority: 'high'
        },
        {
          title: 'Past Report Cards',
          dueDate: subDays(new Date(), 2).toISOString(),
          reportType: 'report_card',
          priority: 'medium'
        },
        {
          title: 'Future Assessment Reports',
          dueDate: addDays(new Date(), 30).toISOString(),
          reportType: 'assessment',
          priority: 'low'
        }
      ];

      for (const deadline of deadlines) {
        await auth.post('/api/report-deadlines').send(deadline);
      }
    });

    it('should filter deadlines by status (upcoming)', async () => {
      const response = await auth.get('/api/report-deadlines?status=upcoming');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // All deadlines should be in the future
      response.body.forEach((deadline: any) => {
        expect(new Date(deadline.dueDate).getTime()).toBeGreaterThan(Date.now());
      });
    });

    it('should filter deadlines by status (overdue)', async () => {
      const response = await auth.get('/api/report-deadlines?status=overdue');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // All deadlines should be in the past
      response.body.forEach((deadline: any) => {
        expect(new Date(deadline.dueDate).getTime()).toBeLessThan(Date.now());
      });
    });

    it('should filter deadlines by report type', async () => {
      const response = await auth.get('/api/report-deadlines?type=progress');

      expect(response.status).toBe(200);
      response.body.forEach((deadline: any) => {
        expect(deadline.reportType).toBe('progress');
      });
    });

    it('should sort deadlines by due date', async () => {
      const response = await auth.get('/api/report-deadlines?sort=dueDate');

      expect(response.status).toBe(200);
      
      // Verify sorting (earliest first)
      for (let i = 1; i < response.body.length; i++) {
        const current = new Date(response.body[i].dueDate);
        const previous = new Date(response.body[i - 1].dueDate);
        expect(current.getTime()).toBeGreaterThanOrEqual(previous.getTime());
      }
    });

    it('should filter by priority', async () => {
      const response = await auth.get('/api/report-deadlines?priority=high');

      expect(response.status).toBe(200);
      response.body.forEach((deadline: any) => {
        expect(deadline.priority).toBe('high');
      });
    });
  });

  describe('Reminder System', () => {
    it('should get deadlines needing reminders', async () => {
      // Create deadline with reminder in 7 days
      const deadline = await auth.post('/api/report-deadlines')
        .send({
          title: 'Reminder Test',
          dueDate: addDays(new Date(), 7).toISOString(),
          reportType: 'progress',
          reminderDays: [7, 3, 1]
        });

      const response = await auth.get('/api/report-deadlines/reminders');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // Should include our deadline since it has a 7-day reminder
      const foundDeadline = response.body.find((d: any) => d.id === deadline.body.id);
      expect(foundDeadline).toBeDefined();
    });

    it('should mark reminder as sent', async () => {
      // Create deadline
      const deadline = await auth.post('/api/report-deadlines')
        .send({
          title: 'Reminder Mark Test',
          dueDate: addDays(new Date(), 3).toISOString(),
          reportType: 'assessment',
          reminderDays: [3]
        });

      const deadlineId = deadline.body.id;

      // Mark reminder as sent
      const response = await auth.post(`/api/report-deadlines/${deadlineId}/reminder-sent`)
        .send({ reminderType: '3-day' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should calculate days until deadline', async () => {
      const dueDate = addDays(new Date(), 10);
      
      const deadline = await auth.post('/api/report-deadlines')
        .send({
          title: 'Days Until Test',
          dueDate: dueDate.toISOString(),
          reportType: 'progress'
        });

      const response = await auth.get(`/api/report-deadlines/${deadline.body.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('daysUntilDue');
      expect(response.body.daysUntilDue).toBeCloseTo(10, 0);
    });
  });

  describe('Progress Tracking', () => {
    it('should track completion status', async () => {
      const deadline = await auth.post('/api/report-deadlines')
        .send({
          title: 'Completion Test',
          dueDate: addDays(new Date(), 14).toISOString(),
          reportType: 'progress',
          expectedReports: 25 // 25 students
        });

      const deadlineId = deadline.body.id;

      // Mark some reports as completed
      const updateResponse = await auth.patch(`/api/report-deadlines/${deadlineId}/progress`)
        .send({
          completedReports: 10,
          totalReports: 25
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.completionPercentage).toBe(40);
      expect(updateResponse.body.completedReports).toBe(10);
    });

    it('should calculate completion percentage', async () => {
      const deadline = await auth.post('/api/report-deadlines')
        .send({
          title: 'Percentage Test',
          dueDate: addDays(new Date(), 7).toISOString(),
          reportType: 'report_card',
          expectedReports: 20
        });

      const deadlineId = deadline.body.id;

      // Update progress
      await auth.patch(`/api/report-deadlines/${deadlineId}/progress`)
        .send({
          completedReports: 15,
          totalReports: 20
        });

      const response = await auth.get(`/api/report-deadlines/${deadlineId}`);

      expect(response.status).toBe(200);
      expect(response.body.completionPercentage).toBe(75);
    });
  });

  describe('Error Handling', () => {
    it('should require authentication', async () => {
      const response = await auth.get('/api/report-deadlines')
        .set('Authorization', '');

      expect(response.status).toBe(401);
    });

    it('should validate deadline data', async () => {
      const invalidData = {
        title: '', // Empty title
        dueDate: 'invalid-date',
        reportType: 'invalid-type'
      };

      const response = await auth.post('/api/report-deadlines')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle past due dates appropriately', async () => {
      const pastDate = subDays(new Date(), 10);
      
      const response = await auth.post('/api/report-deadlines')
        .send({
          title: 'Past Deadline',
          dueDate: pastDate.toISOString(),
          reportType: 'progress'
        });

      // Should allow creating past deadlines but mark them appropriately
      expect(response.status).toBe(201);
      expect(response.body.status).toBe('overdue');
    });

    it('should handle non-existent deadline', async () => {
      const response = await auth.get('/api/report-deadlines/99999');

      expect(response.status).toBe(404);
    });
  });

  describe('Integration with Reports', () => {
    it('should link deadline to actual reports', async () => {
      // Create deadline
      const deadline = await auth.post('/api/report-deadlines')
        .send({
          title: 'Integration Test',
          dueDate: addDays(new Date(), 7).toISOString(),
          reportType: 'progress',
          grade: 5
        });

      // Create related report
      const report = await auth.post('/api/reports')
        .send({
          studentId: testStudent.id,
          reportType: 'progress',
          deadlineId: deadline.body.id,
          content: 'Test progress report content'
        });

      // Check that deadline shows linked reports
      const response = await auth.get(`/api/report-deadlines/${deadline.body.id}/reports`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].studentId).toBe(testStudent.id);
    });

    it('should auto-update completion when reports are submitted', async () => {
      const deadline = await auth.post('/api/report-deadlines')
        .send({
          title: 'Auto-Update Test',
          dueDate: addDays(new Date(), 14).toISOString(),
          reportType: 'progress',
          expectedReports: 2
        });

      const deadlineId = deadline.body.id;

      // Submit first report
      await auth.post('/api/reports')
        .send({
          studentId: testStudent.id,
          reportType: 'progress',
          deadlineId: deadlineId,
          content: 'First report'
        });

      // Check that completion was auto-updated
      const response = await auth.get(`/api/report-deadlines/${deadlineId}`);

      expect(response.status).toBe(200);
      expect(response.body.completedReports).toBe(1);
      expect(response.body.completionPercentage).toBe(50);
    });
  });
});