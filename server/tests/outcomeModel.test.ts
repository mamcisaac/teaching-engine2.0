import request from 'supertest';
import app from '../src/index';
import { prisma } from '../src/prisma';

describe('Outcome associations', () => {
  afterAll(async () => {
    await prisma.milestoneOutcome.deleteMany();
    await prisma.activityOutcome.deleteMany();
    await prisma.outcome.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.$disconnect();
  });

  it('links outcomes to milestone', async () => {
    const subject = await prisma.subject.create({ data: { name: 'OTest' } });
    const milestone = await prisma.milestone.create({
      data: { title: 'Unit', subjectId: subject.id },
    });

    const res = await request(app)
      .put(`/api/milestones/${milestone.id}`)
      .send({ title: 'Unit', outcomes: ['1CO.1', '1CO.2'] });
    expect(res.status).toBe(200);

    const refreshed = await prisma.milestone.findUnique({
      where: { id: milestone.id },
      include: { outcomes: true },
    });
    expect(refreshed?.outcomes.length).toBe(2);
  });
});
