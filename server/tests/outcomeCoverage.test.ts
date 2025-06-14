import request from 'supertest';
import app from '../src';
import { prisma } from '../src/prisma';
import { v4 as uuidv4 } from 'uuid';

// Define interface for outcome coverage response
interface OutcomeCoverageResponse {
  outcomeId: string;
  code: string;
  description: string;
  subject: string;
  domain: string | null;
  grade: number;
  isCovered: boolean;
  coveredBy: Array<{
    id: number;
    title: string;
  }>;
}

describe('Outcome Coverage API', () => {
  let token: string;
  // Using underscore prefix to indicate unused variable (to satisfy ESLint)
  let _userId: number;
  let subjectId: number;
  let milestoneId: number;
  let outcomeId: string;
  let activityId: number;

  beforeAll(async () => {
    // Setup: Create a user and login
    const email = `test-${uuidv4()}@example.com`;
    const user = await prisma.user.create({
      data: {
        email,
        name: 'Test User',
        password: 'password123',
        role: 'TEACHER',
      },
    });
    _userId = user.id;

    const loginRes = await request(app)
      .post('/api/login')
      .send({ email, password: 'password123' });
    
    token = loginRes.body.token;

    // Create a subject
    const subjectRes = await request(app)
      .post('/api/subjects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Subject' });
    
    subjectId = subjectRes.body.id;

    // Create a milestone
    const milestoneRes = await request(app)
      .post('/api/milestones')
      .set('Authorization', `Bearer ${token}`)
      .send({ 
        title: 'Test Milestone', 
        subjectId 
      });
    
    milestoneId = milestoneRes.body.id;

    // Create an outcome
    outcomeId = uuidv4();
    await prisma.outcome.create({
      data: {
        id: outcomeId,
        code: 'TEST-001',
        description: 'Test outcome description',
        subject: 'Test Subject',
        grade: 1,
        domain: 'Test Domain',
      },
    });
  });

  afterAll(async () => {
    // Clean up
    await prisma.activityOutcome.deleteMany({});
    await prisma.activity.deleteMany({});
    await prisma.outcome.deleteMany({});
    await prisma.milestone.deleteMany({});
    await prisma.subject.deleteMany({});
    await prisma.user.deleteMany({});
  });

  it('should return outcomes with no coverage initially', async () => {
    const res = await request(app)
      .get('/api/outcomes/coverage')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const outcomeData = res.body.find((o: OutcomeCoverageResponse) => o.outcomeId === outcomeId);
    expect(outcomeData).toBeDefined();
    expect(outcomeData.isCovered).toBe(false);
    expect(outcomeData.coveredBy).toEqual([]);
  });

  it('should mark an outcome as covered when linked to an activity', async () => {
    // Create an activity
    const activityRes = await request(app)
      .post('/api/activities')
      .set('Authorization', `Bearer ${token}`)
      .send({ 
        title: 'Test Activity',
        milestoneId,
      });
    
    activityId = activityRes.body.id;

    // Link outcome to activity
    await prisma.activityOutcome.create({
      data: {
        activityId,
        outcomeId,
      },
    });

    // Check coverage again
    const res = await request(app)
      .get('/api/outcomes/coverage')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const outcomeData = res.body.find((o: OutcomeCoverageResponse) => o.outcomeId === outcomeId);
    expect(outcomeData).toBeDefined();
    expect(outcomeData.isCovered).toBe(true);
    expect(outcomeData.coveredBy).toHaveLength(1);
    expect(outcomeData.coveredBy[0].id).toBe(activityId);
    expect(outcomeData.coveredBy[0].title).toBe('Test Activity');
  });

  it('should filter outcomes by subject', async () => {
    const res = await request(app)
      .get('/api/outcomes/coverage?subject=Test%20Subject')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.every((o: OutcomeCoverageResponse) => o.subject === 'Test Subject')).toBe(true);
  });

  it('should filter outcomes by grade', async () => {
    const res = await request(app)
      .get('/api/outcomes/coverage?grade=1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.every((o: OutcomeCoverageResponse) => o.grade === 1)).toBe(true);
  });

  it('should filter outcomes by domain', async () => {
    const res = await request(app)
      .get('/api/outcomes/coverage?domain=Test%20Domain')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.every((o: OutcomeCoverageResponse) => o.domain === 'Test Domain')).toBe(true);
  });
});