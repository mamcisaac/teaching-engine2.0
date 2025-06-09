import request from 'supertest';
import app from '../src/index';
import { prisma } from '../src/prisma';

beforeAll(async () => {
  await prisma.$queryRawUnsafe('PRAGMA busy_timeout = 20000');
  await prisma.weeklySchedule.deleteMany();
  await prisma.dailyPlanItem.deleteMany();
  await prisma.dailyPlan.deleteMany();
  await prisma.lessonPlan.deleteMany();
  await prisma.timetableSlot.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.subject.deleteMany();
});

afterAll(async () => {
  await prisma.weeklySchedule.deleteMany();
  await prisma.dailyPlanItem.deleteMany();
  await prisma.dailyPlan.deleteMany();
  await prisma.lessonPlan.deleteMany();
  await prisma.timetableSlot.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.$disconnect();
});

describe('lesson plan routes', () => {
  let activityId: number;
  let milestoneId: number;
  const weekStart = '2025-01-01T00:00:00.000Z';

  beforeAll(async () => {
    const subject = await prisma.subject.create({ data: { name: 'PlanTest' } });
    const milestone = await prisma.milestone.create({
      data: { title: 'MP', subjectId: subject.id },
    });
    await prisma.timetableSlot.create({
      data: { day: 0, startMin: 540, endMin: 600, subjectId: subject.id },
    });
    milestoneId = milestone.id;
    const activity = await prisma.activity.create({
      data: { title: 'AP', milestoneId: milestone.id },
    });
    activityId = activity.id;
  });

  it('returns 400 when no activities exist', async () => {
    await prisma.activity.deleteMany();
    const res = await request(app).post('/api/lesson-plans/generate').send({ weekStart });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('No activities available');
    const activity = await prisma.activity.create({
      data: { title: 'AP', milestoneId },
    });
    activityId = activity.id;
  });

  it('generates a plan', async () => {
    const res = await request(app).post('/api/lesson-plans/generate').send({ weekStart });
    expect(res.status).toBe(201);
    expect(res.body.schedule.length).toBeGreaterThan(0);
  });

  it('retrieves the plan', async () => {
    await request(app).post('/api/lesson-plans/generate').send({ weekStart });
    const res = await request(app).get(`/api/lesson-plans/${weekStart}`);
    expect(res.status).toBe(200);
    expect(res.body.schedule.length).toBeGreaterThan(0);
  });

  it('updates the plan', async () => {
    const create = await request(app).post('/api/lesson-plans/generate').send({ weekStart });
    const planId = create.body.id as number;
    const slot = await prisma.timetableSlot.findFirstOrThrow();
    const res = await request(app)
      .put(`/api/lesson-plans/${planId}`)
      .send({
        schedule: [{ id: 0, day: 0, slotId: slot.id, activityId }],
      });
    expect(res.status).toBe(200);
    expect(res.body.schedule[0].activityId).toBe(activityId);
  });

  it('generates material list with plan', async () => {
    const date = '2026-01-01T00:00:00.000Z';
    const res = await request(app).post('/api/lesson-plans/generate').send({ weekStart: date });
    expect(res.status).toBe(201);
    const list = await prisma.materialList.findFirst({ where: { weekStart: new Date(date) } });
    expect(list).not.toBeNull();
  });
});
