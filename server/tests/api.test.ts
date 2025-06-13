import request from 'supertest';
import app from '../src/index';
import { prisma } from '../src/prisma';

beforeAll(async () => {
  // Ensure SQLite doesn't immediately error when the database is busy
  await prisma.$queryRawUnsafe('PRAGMA busy_timeout = 20000');
  await prisma.weeklySchedule.deleteMany();
  await prisma.dailyPlanItem.deleteMany();
  await prisma.dailyPlan.deleteMany();
  await prisma.lessonPlan.deleteMany();
  await prisma.parentContact.deleteMany();
  await prisma.newsletter.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.timetableSlot.deleteMany();
});

afterAll(async () => {
  await prisma.weeklySchedule.deleteMany();
  await prisma.dailyPlanItem.deleteMany();
  await prisma.dailyPlan.deleteMany();
  await prisma.lessonPlan.deleteMany();
  await prisma.parentContact.deleteMany();
  await prisma.newsletter.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.timetableSlot.deleteMany();
  await prisma.$disconnect();
});

describe('Health API', () => {
  it('responds with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('Subject API', () => {
  it('creates and retrieves a subject', async () => {
    const create = await request(app).post('/api/subjects').send({ name: 'Test' });
    expect(create.status).toBe(201);
    const id = create.body.id;
    const get = await request(app).get(`/api/subjects/${id}`);
    expect(get.status).toBe(200);
    expect(get.body.name).toBe('Test');
  });

  it('rejects invalid subject data', async () => {
    const res = await request(app).post('/api/subjects').send({});
    expect(res.status).toBe(400);
  });

  it('returns 404 for missing subject', async () => {
    const res = await request(app).get('/api/subjects/99999');
    expect(res.status).toBe(404);
  });
});

describe('Timetable API', () => {
  it('saves and retrieves slots', async () => {
    const subject = await prisma.subject.create({ data: { name: 'TSubj' } });
    const res = await request(app)
      .put('/api/timetable')
      .send([{ day: 0, startMin: 540, endMin: 600, subjectId: subject.id }]);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    const list = await request(app).get('/api/timetable');
    expect(list.status).toBe(200);
    expect(list.body[0].subjectId).toBe(subject.id);
  });
});

describe('Milestone API', () => {
  let subjectId: number;

  beforeAll(async () => {
    const subject = await prisma.subject.create({ data: { name: 'Subj' } });
    subjectId = subject.id;
  });

  it('creates and retrieves a milestone', async () => {
    const create = await request(app).post('/api/milestones').send({ title: 'MS', subjectId });
    expect(create.status).toBe(201);
    const id = create.body.id;
    const get = await request(app).get(`/api/milestones/${id}`);
    expect(get.status).toBe(200);
    expect(get.body.title).toBe('MS');
  });

  it('creates milestone with description and codes', async () => {
    const create = await request(app)
      .post('/api/milestones')
      .send({
        title: 'MS2',
        subjectId,
        description: 'desc',
        standardCodes: ['A', 'B'],
      });
    expect(create.status).toBe(201);
    const id = create.body.id;
    const get = await request(app).get(`/api/milestones/${id}`);
    expect(get.body.description).toBe('desc');
    expect(get.body.standardCodes).toEqual(['A', 'B']);
  });

  it('rejects invalid milestone data', async () => {
    const res = await request(app).post('/api/milestones').send({ title: '' });
    expect(res.status).toBe(400);
  });

  it('returns 404 for missing milestone', async () => {
    const res = await request(app).get('/api/milestones/99999');
    expect(res.status).toBe(404);
  });
});

describe('Activity API', () => {
  let milestoneId: number;

  beforeAll(async () => {
    const subject = await prisma.subject.create({ data: { name: 'S2' } });
    const milestone = await prisma.milestone.create({
      data: { title: 'M2', subjectId: subject.id },
    });
    milestoneId = milestone.id;
  });

  it('creates and retrieves an activity', async () => {
    const create = await request(app).post('/api/activities').send({ title: 'Act', milestoneId });
    expect(create.status).toBe(201);
    const id = create.body.id;
    const get = await request(app).get(`/api/activities/${id}`);
    expect(get.status).toBe(200);
    expect(get.body.title).toBe('Act');
  });

  it('rejects invalid activity data', async () => {
    const res = await request(app).post('/api/activities').send({ title: 'A' });
    expect(res.status).toBe(400);
  });

  it('returns 404 for missing activity', async () => {
    const res = await request(app).get('/api/activities/99999');
    expect(res.status).toBe(404);
  });
});

describe('Lesson Plan API', () => {
  let milestoneId: number;

  beforeAll(async () => {
    const subject = await prisma.subject.create({ data: { name: 'PlanSubj' } });
    const milestone = await prisma.milestone.create({
      data: { title: 'PlanM', subjectId: subject.id },
    });
    await prisma.timetableSlot.create({
      data: { day: 0, startMin: 540, endMin: 600, subjectId: subject.id },
    });
    milestoneId = milestone.id;
    await prisma.activity.create({ data: { title: 'PlanAct', milestoneId } });
  });

  it('generates and retrieves a plan', async () => {
    const weekStart = '2024-01-01T00:00:00.000Z';
    const gen = await request(app).post('/api/lesson-plans/generate').send({ weekStart });
    expect(gen.status).toBe(201);
    const get = await request(app).get(`/api/lesson-plans/${weekStart}`);
    expect(get.status).toBe(200);
    expect(get.body.schedule.length).toBeGreaterThan(0);
  });
});

describe('Preferences API', () => {
  it('saves preferences', async () => {
    const res = await request(app)
      .post('/api/lesson-plans/preferences')
      .send({
        teachingStyles: ['hands-on'],
        pacePreference: 'balanced',
        prepTime: 60,
      });
    expect(res.status).toBe(201);
    expect(res.body.pacePreference).toBe('balanced');
  });
});

describe('Resource API', () => {
  let resourceId: number;
  let activityId: number;

  beforeAll(async () => {
    const subject = await prisma.subject.create({ data: { name: 'ResSubj' } });
    const milestone = await prisma.milestone.create({
      data: { title: 'ResM', subjectId: subject.id },
    });
    const activity = await prisma.activity.create({
      data: { title: 'ResA', milestoneId: milestone.id },
    });
    activityId = activity.id;
  });

  it('uploads and lists resources', async () => {
    const upload = await request(app)
      .post('/api/resources')
      .send({
        filename: 'test.txt',
        data: Buffer.from('hi').toString('base64'),
        type: 'text/plain',
        size: 2,
        activityId,
      });
    expect(upload.status).toBe(201);
    resourceId = upload.body.id;
    const list = await request(app).get('/api/resources');
    expect(list.body.length).toBeGreaterThan(0);
  });

  it('retrieves single resource', async () => {
    const res = await request(app).get(`/api/resources/${resourceId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(resourceId);
  });

  it('lists resources by activity', async () => {
    const res = await request(app).get(`/api/resources/activity/${activityId}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('deletes resource', async () => {
    const del = await request(app).delete(`/api/resources/${resourceId}`);
    expect(del.status).toBe(204);
    const check = await request(app).get(`/api/resources/${resourceId}`);
    expect(check.status).toBe(404);
  });
});

describe('Newsletter API', () => {
  it('creates and exports newsletter', async () => {
    const res = await request(app)
      .post('/api/newsletters')
      .send({ title: 'News', content: 'Hello' });
    expect(res.status).toBe(201);
    const id = res.body.id;
    const pdf = await request(app).get(`/api/newsletters/${id}/pdf`);
    expect(pdf.status).toBe(200);
    const binaryParser = (
      res: NodeJS.ReadableStream,
      callback: (err: Error | null, data: Buffer) => void,
    ) => {
      const data: Buffer[] = [];
      res.on('data', (chunk) => data.push(Buffer.from(chunk)));
      res.on('end', () => callback(null, Buffer.concat(data)));
    };
    const docx = await request(app).get(`/api/newsletters/${id}/docx`).buffer().parse(binaryParser);
    expect(docx.status).toBe(200);
    expect(Buffer.isBuffer(docx.body)).toBe(true);
    expect(docx.body.slice(0, 2).toString()).toBe('PK');
  });

  it('rejects invalid template name', async () => {
    const res = await request(app)
      .post('/api/newsletters')
      .send({ title: 'Bad', content: 'X', template: 'oops' });
    expect(res.status).toBe(400);
  });

  it('rejects invalid dates for generate', async () => {
    const res = await request(app)
      .post('/api/newsletters/generate')
      .send({ startDate: 'not-a-date', endDate: '2024-01-02T00:00:00.000Z' });
    expect(res.status).toBe(400);
  });

  it('rejects invalid template in generate', async () => {
    const res = await request(app).post('/api/newsletters/generate').send({
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2024-01-02T00:00:00.000Z',
      template: 'bad',
    });
    expect(res.status).toBe(400);
  });

  it('rejects non-boolean includePhotos', async () => {
    const res = await request(app)
      .post('/api/newsletters/generate')
      // @ts-expect-error intentional bad type for test
      .send({
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-02T00:00:00.000Z',
        includePhotos: 'yes',
      });
    expect(res.status).toBe(400);
  });

  it('returns raw draft by version query', async () => {
    const res = await request(app).post('/api/newsletters/generate').send({
      startDate: '2025-01-01T00:00:00.000Z',
      endDate: '2025-01-07T00:00:00.000Z',
    });
    expect(res.status).toBe(201);
    const id = res.body.id;
    const rawRes = await request(app).get(`/api/newsletters/${id}?version=raw`);
    expect(rawRes.status).toBe(200);
    expect(rawRes.body.content).toBe(res.body.rawDraft);
  });

  it('sends newsletter to contacts', async () => {
    const nl = await prisma.newsletter.create({
      data: { title: 'Send', content: 'Hi' },
    });
    await prisma.parentContact.create({
      data: { name: 'Parent', email: 'p@example.com', studentName: 'Kid' },
    });
    const res = await request(app).post(`/api/newsletters/${nl.id}/send`);
    expect(res.status).toBe(200);
    expect(res.body.sent).toBe(1);
  });
});

describe('Daily Plan API', () => {
  const weekStart = '2025-01-06T00:00:00.000Z';

  beforeAll(async () => {
    const subject = await prisma.subject.create({ data: { name: 'DPSubj' } });
    const milestone = await prisma.milestone.create({
      data: { title: 'DPM', subjectId: subject.id },
    });
    await prisma.activity.create({ data: { title: 'DPA', milestoneId: milestone.id } });
    await prisma.timetableSlot.create({
      data: { day: 0, startMin: 540, endMin: 600, subjectId: subject.id },
    });
    await request(app).post('/api/lesson-plans/generate').send({ weekStart });
  });

  it('generates daily plan from weekly', async () => {
    const res = await request(app).post('/api/daily-plans/generate').send({ date: weekStart });
    expect(res.status).toBe(201);
    expect(res.body.items.length).toBeGreaterThan(0);
  });

  it('retrieves the daily plan', async () => {
    await request(app).post('/api/daily-plans/generate').send({ date: weekStart });
    const res = await request(app).get(`/api/daily-plans/${weekStart}`);
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
  });
});

describe('Notes API', () => {
  let activityId: number;

  beforeAll(async () => {
    const subject = await prisma.subject.create({ data: { name: 'NoteSubj' } });
    const milestone = await prisma.milestone.create({
      data: { title: 'NoteMilestone', subjectId: subject.id },
    });
    const act = await prisma.activity.create({
      data: { title: 'NoteAct', milestoneId: milestone.id },
    });
    activityId = act.id;
  });

  it('creates, updates and deletes a note', async () => {
    const create = await request(app)
      .post('/api/notes')
      .send({ content: 'hi', public: true, activityId });
    expect(create.status).toBe(201);
    const id = create.body.id;

    const get = await request(app).get(`/api/notes/${id}`);
    expect(get.status).toBe(200);
    expect(get.body.content).toBe('hi');

    const upd = await request(app).put(`/api/notes/${id}`).send({ content: 'bye', public: false });
    expect(upd.status).toBe(200);
    expect(upd.body.public).toBe(false);

    const del = await request(app).delete(`/api/notes/${id}`);
    expect(del.status).toBe(204);
  });
});

describe('Unavailable Blocks API', () => {
  it('creates and lists blocks', async () => {
    const create = await request(app).post('/api/unavailable-blocks').send({
      date: '2025-02-03T00:00:00.000Z',
      startMin: 540,
      endMin: 600,
      reason: 'Workshop',
      blockType: 'TEACHER_ABSENCE',
    });
    expect(create.status).toBe(201);
    const list = await request(app).get('/api/unavailable-blocks?from=2025-02-03&to=2025-02-03');
    expect(list.status).toBe(200);
    expect(list.body.length).toBeGreaterThan(0);
  });
});
