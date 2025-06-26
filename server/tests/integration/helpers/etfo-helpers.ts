import request from 'supertest';
import { app } from '../../../src/index';

export interface TestData {
  expectationId?: string;
  longRangePlanId?: string;
  unitPlanId?: string;
  lessonPlanId?: string;
  daybookEntryId?: string;
}

export class ETFOTestHelpers {
  constructor(private authToken: string) {}

  async createExpectation(codePrefix: string = 'TEST') {
    const response = await request(app)
      .post('/api/curriculum-expectations')
      .set('Authorization', `Bearer ${this.authToken}`)
      .send({
        code: `${codePrefix}.1.1.${Date.now()}`,
        description: `${codePrefix} expectation`,
        strand: 'Test Strand',
        grade: 1,
        subject: 'Mathematics',
      });

    if (response.status !== 201) {
      throw new Error(`Failed to create expectation: ${response.status} ${JSON.stringify(response.body)}`);
    }

    return response.body.id;
  }

  async createLongRangePlan(title: string, expectationIds: string[] = []) {
    const response = await request(app)
      .post('/api/long-range-plans')
      .set('Authorization', `Bearer ${this.authToken}`)
      .send({
        title,
        academicYear: '2024-2025',
        grade: 1,
        subject: 'Mathematics',
        expectationIds,
      });

    if (response.status !== 201) {
      throw new Error(`Failed to create long-range plan: ${response.status} ${JSON.stringify(response.body)}`);
    }

    return response.body.id;
  }

  async createUnitPlan(title: string, longRangePlanId: string, expectationIds: string[] = []) {
    const response = await request(app)
      .post('/api/unit-plans')
      .set('Authorization', `Bearer ${this.authToken}`)
      .send({
        title,
        longRangePlanId,
        startDate: '2024-09-01T00:00:00.000Z',
        endDate: '2024-09-30T23:59:59.999Z',
        expectationIds,
      });

    if (response.status !== 201) {
      throw new Error(`Failed to create unit plan: ${response.status} ${JSON.stringify(response.body)}`);
    }

    return response.body.id;
  }

  async createLessonPlan(title: string, unitPlanId: string, expectationIds: string[] = []) {
    const response = await request(app)
      .post('/api/etfo-lesson-plans')
      .set('Authorization', `Bearer ${this.authToken}`)
      .send({
        title,
        unitPlanId,
        date: '2024-09-15T09:00:00Z',
        duration: 45,
        isSubFriendly: false,
        expectationIds,
      });

    if (response.status !== 201) {
      throw new Error(`Failed to create lesson plan: ${response.status} ${JSON.stringify(response.body)}`);
    }

    return response.body.id;
  }

  async createDaybookEntry(date: string = '2024-09-15T00:00:00Z', lessonPlanId?: string) {
    const response = await request(app)
      .post('/api/daybook-entries')
      .set('Authorization', `Bearer ${this.authToken}`)
      .send({
        date,
        lessonPlanId,
        notes: 'Test daybook entry',
        overallRating: 4,
      });

    if (response.status !== 201) {
      throw new Error(`Failed to create daybook entry: ${response.status} ${JSON.stringify(response.body)}`);
    }

    return response.body.id;
  }

  /**
   * Creates the full ETFO hierarchy: Expectation → Long-Range Plan → Unit Plan → Lesson Plan → Daybook Entry
   */
  async createCompleteHierarchy(prefix: string = 'HIERARCHY'): Promise<TestData> {
    const expectationId = await this.createExpectation(prefix);
    const longRangePlanId = await this.createLongRangePlan(`${prefix} Long-Range Plan`, [expectationId]);
    const unitPlanId = await this.createUnitPlan(`${prefix} Unit Plan`, longRangePlanId, [expectationId]);
    const lessonPlanId = await this.createLessonPlan(`${prefix} Lesson Plan`, unitPlanId, [expectationId]);
    const daybookEntryId = await this.createDaybookEntry(undefined, lessonPlanId);

    return {
      expectationId,
      longRangePlanId,
      unitPlanId,
      lessonPlanId,
      daybookEntryId,
    };
  }
}