import { app } from '../../src/index';
import { authRequest } from './test-auth-helper';
import { getTestPrismaClient } from './jest.setup';
import { setupAuthenticatedTest } from './test-setup-helpers';
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
  // Using underscore prefix to indicate unused variable (to satisfy ESLint)
  // let _userId: number;
  // let _token: string;
  let subjectId: number;
  let milestoneId: number;
  let outcomeId: string;
  let activityId: number;
  let prisma: ReturnType<typeof getTestPrismaClient>;
  const auth = authRequest(app);

  beforeAll(async () => {
    prisma = getTestPrismaClient();
  });

  beforeEach(async () => {
    // Setup auth for each test to handle database resets
    await setupAuthenticatedTest(prisma, auth);

    // Create a subject
    const subjectRes = await auth.post('/api/subjects').send({ name: 'Test Subject' });

    subjectId = subjectRes.body.id;

    // Create a milestone
    const milestoneRes = await auth.post('/api/milestones').send({
      title: 'Test Milestone',
      subjectId,
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

  // No need for afterAll cleanup - database is reset after each test

  it('should return outcomes with no coverage initially', async () => {
    const res = await auth.get('/api/outcomes/coverage');

    expect(res.status).toBe(200);
    const outcomeData = res.body.find((o: OutcomeCoverageResponse) => o.outcomeId === outcomeId);
    expect(outcomeData).toBeDefined();
    expect(outcomeData.isCovered).toBe(false);
    expect(outcomeData.coveredBy).toEqual([]);
  });

  it('should mark an outcome as covered when linked to an activity', async () => {
    // Create an activity
    const activityRes = await auth.post('/api/activities').send({
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
    const res = await auth.get('/api/outcomes/coverage');

    expect(res.status).toBe(200);
    const outcomeData = res.body.find((o: OutcomeCoverageResponse) => o.outcomeId === outcomeId);
    expect(outcomeData).toBeDefined();
    expect(outcomeData.isCovered).toBe(true);
    expect(outcomeData.coveredBy).toHaveLength(1);
    expect(outcomeData.coveredBy[0].id).toBe(activityId);
    expect(outcomeData.coveredBy[0].title).toBe('Test Activity');
  });

  it('should filter outcomes by subject', async () => {
    const res = await auth.get('/api/outcomes/coverage?subject=Test%20Subject');

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.every((o: OutcomeCoverageResponse) => o.subject === 'Test Subject')).toBe(true);
  });

  it('should filter outcomes by grade', async () => {
    const res = await auth.get('/api/outcomes/coverage?grade=1');

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.every((o: OutcomeCoverageResponse) => o.grade === 1)).toBe(true);
  });

  it('should filter outcomes by domain', async () => {
    const res = await auth.get('/api/outcomes/coverage?domain=Test%20Domain');

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.every((o: OutcomeCoverageResponse) => o.domain === 'Test Domain')).toBe(true);
  });
});
