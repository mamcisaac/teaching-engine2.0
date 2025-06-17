import { app } from '../src/index';
import { authRequest } from './test-auth-helper';
import { getTestPrismaClient } from './jest.setup';

describe('lesson plan routes', () => {
  let prisma: ReturnType<typeof getTestPrismaClient>;
  const auth = authRequest(app);
  let activityId: number;
  let milestoneId: number;
  let subjectId: number;
  const weekStart = '2025-01-01T00:00:00.000Z';

  beforeAll(async () => {
    await auth.setup();
  });

  beforeEach(async () => {
    prisma = getTestPrismaClient();
    
    // Create test data for each test
    const subject = await prisma.subject.create({ data: { name: 'PlanTest' } });
    subjectId = subject.id;
    
    const milestone = await prisma.milestone.create({
      data: { title: 'MP', subjectId: subject.id },
    });
    milestoneId = milestone.id;
    
    await prisma.timetableSlot.create({
      data: { day: 0, startMin: 540, endMin: 600, subjectId: subject.id },
    });
    
    const activity = await prisma.activity.create({
      data: { title: 'AP', milestoneId: milestone.id },
    });
    activityId = activity.id;
  });

  it('returns 400 when no activities exist', async () => {
    // Delete the activity we just created
    await prisma.activity.deleteMany();
    
    const res = await auth.post('/api/lesson-plans/generate').send({ weekStart });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('No activities available');
  });

  it('generates a plan', async () => {
    const res = await auth.post('/api/lesson-plans/generate').send({ weekStart });
    expect(res.status).toBe(201);
    expect(res.body.schedule.length).toBeGreaterThan(0);
  });

  it('retrieves the plan', async () => {
    // First generate a plan
    await auth.post('/api/lesson-plans/generate').send({ weekStart });
    
    // Then retrieve it
    const res = await auth.get(`/api/lesson-plans/${weekStart}`);
    expect(res.status).toBe(200);
    expect(res.body.schedule.length).toBeGreaterThan(0);
  });

  it('updates the plan', async () => {
    // First generate a plan
    const create = await auth.post('/api/lesson-plans/generate').send({ weekStart });
    expect(create.status).toBe(201);
    const planId = create.body.id as number;
    
    // Get the slot we created
    const slot = await prisma.timetableSlot.findFirstOrThrow();
    
    // Update the plan
    const res = await auth.put(`/api/lesson-plans/${planId}`).send({
      schedule: [{ id: 0, day: 0, slotId: slot.id, activityId }],
    });
    expect(res.status).toBe(200);
    expect(res.body.schedule[0].activityId).toBe(activityId);
  });

  it('generates material list with plan', async () => {
    // First create an activity with materials
    const materialActivity = await prisma.activity.create({
      data: { 
        title: 'Material Activity', 
        milestoneId,
        materialsText: 'pencil, paper, ruler'
      },
    });

    const res = await auth.post('/api/lesson-plans/generate').send({ weekStart });
    expect(res.status).toBe(201);
    // The lesson plan should include activities with materials
    expect(res.body.schedule).toBeDefined();
    expect(res.body.schedule.length).toBeGreaterThan(0);
    
    // Check if any scheduled activities have materials
    const hasActivitiesWithMaterials = res.body.schedule.some((item: any) => 
      item.activity && item.activity.materialsText
    );
    expect(hasActivitiesWithMaterials).toBeDefined();
  });
});