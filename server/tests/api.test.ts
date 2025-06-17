import request from 'supertest';
import { app } from '../src/index';
import { getTestPrismaClient } from './jest.setup.js';
import { authRequest } from './test-auth-helper.js';

const auth = authRequest(app);
let prisma: ReturnType<typeof getTestPrismaClient>;

beforeAll(async () => {
  prisma = getTestPrismaClient();
  await auth.setup();
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
    const create = await auth.post('/api/subjects').send({ name: 'Test' });
    if (create.status !== 201) {
      console.error('Subject creation failed:', create.status, create.body);
    }
    expect(create.status).toBe(201);
    const id = create.body.id;
    const get = await auth.get(`/api/subjects/${id}`);
    expect(get.status).toBe(200);
    expect(get.body.name).toBe('Test');
  });

  it('rejects invalid subject data', async () => {
    const res = await auth.post('/api/subjects').send({});
    expect(res.status).toBe(400);
  });

  it('returns 404 for missing subject', async () => {
    const res = await auth.get('/api/subjects/99999');
    expect(res.status).toBe(404);
  });
});

describe('Timetable API', () => {
  it('saves and retrieves slots', async () => {
    const subject = await prisma.subject.create({ data: { name: 'TSubj' } });
    const res = await auth
      .put('/api/timetable')
      .send([{ day: 0, startMin: 540, endMin: 600, subjectId: subject.id }]);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    const list = await auth.get('/api/timetable');
    expect(list.status).toBe(200);
    expect(list.body[0].subjectId).toBe(subject.id);
  });
});

describe('Milestone API', () => {
  let subjectId: number;

  beforeEach(async () => {
    const subject = await prisma.subject.create({ data: { name: 'Subj' } });
    subjectId = subject.id;
  });

  it('creates and retrieves a milestone', async () => {
    const create = await auth.post('/api/milestones').send({ title: 'MS', subjectId });
    expect(create.status).toBe(201);
    const id = create.body.id;
    const get = await auth.get(`/api/milestones/${id}`);
    expect(get.status).toBe(200);
    expect(get.body.title).toBe('MS');
  });

  it('creates milestone with description and outcomes', async () => {
    const create = await auth.post('/api/milestones').send({
      title: 'MS2',
      subjectId,
      description: 'desc',
      outcomes: ['A', 'B'],
    });
    if (create.status !== 201) {
      console.error('Failed to create milestone:', create.status, create.body);
    }
    expect(create.status).toBe(201);
    const id = create.body.id;
    const get = await auth.get(`/api/milestones/${id}`);
    expect(get.body.description).toBe('desc');
    expect(get.body.outcomes.length).toBe(2);
    expect(get.body.outcomes.map((o) => o.outcome.code).sort()).toEqual(['A', 'B']);
  });

  it('rejects invalid milestone data', async () => {
    const res = await auth.post('/api/milestones').send({ title: '' });
    expect(res.status).toBe(400);
  });

  it('returns 404 for missing milestone', async () => {
    const res = await auth.get('/api/milestones/99999');
    expect(res.status).toBe(404);
  });
});

describe('Activity API', () => {
  let milestoneId: number;

  beforeEach(async () => {
    const subject = await prisma.subject.create({ data: { name: 'S2' } });
    const milestone = await prisma.milestone.create({
      data: { title: 'M2', subjectId: subject.id },
    });
    milestoneId = milestone.id;
  });

  it('creates and retrieves an activity', async () => {
    const create = await auth.post('/api/activities').send({ title: 'Act', milestoneId });
    expect(create.status).toBe(201);
    const id = create.body.id;
    const get = await auth.get(`/api/activities/${id}`);
    expect(get.status).toBe(200);
    expect(get.body.title).toBe('Act');
  });

  it('rejects invalid activity data', async () => {
    const res = await auth.post('/api/activities').send({ title: 'A' });
    expect(res.status).toBe(400);
  });

  it('returns 404 for missing activity', async () => {
    const res = await auth.get('/api/activities/99999');
    expect(res.status).toBe(404);
  });
});

describe('Lesson Plan API', () => {
  let milestoneId: number;

  beforeEach(async () => {
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
    const gen = await auth.post('/api/lesson-plans/generate').send({ weekStart });
    expect(gen.status).toBe(201);
    const get = await auth.get(`/api/lesson-plans/${weekStart}`);
    expect(get.status).toBe(200);
    expect(get.body.schedule.length).toBeGreaterThan(0);
  });
});

describe('Preferences API', () => {
  it('saves preferences', async () => {
    const res = await auth.post('/api/lesson-plans/preferences').send({
      teachingStyles: ['hands-on'],
      pacePreference: 'balanced',
      prepTime: 60,
    });
    expect(res.status).toBe(201);
    expect(res.body.pacePreference).toBe('balanced');
  });
});

describe('Resource API', () => {
  let activityId: number;

  beforeEach(async () => {
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
    const upload = await auth.post('/api/resources').send({
      filename: 'test.txt',
      data: Buffer.from('hi').toString('base64'),
      type: 'text/plain',
      size: 2,
      activityId,
    });
    expect(upload.status).toBe(201);
    const list = await auth.get('/api/resources');
    expect(list.body.length).toBeGreaterThan(0);
  });

  it('retrieves single resource', async () => {
    // Create a resource first
    const upload = await auth.post('/api/resources').send({
      filename: 'test-retrieve.txt',
      data: Buffer.from('test content').toString('base64'),
      type: 'text/plain',
      size: 12,
      activityId,
    });
    expect(upload.status).toBe(201);
    const createdResourceId = upload.body.id;

    // Now retrieve it
    const res = await auth.get(`/api/resources/${createdResourceId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdResourceId);
  });

  it('lists resources by activity', async () => {
    // First create a resource for this activity
    await auth.post('/api/resources').send({
      filename: 'test-list.txt',
      data: Buffer.from('list test').toString('base64'),
      type: 'text/plain',
      size: 9,
      activityId,
    });

    const res = await auth.get(`/api/resources/activity/${activityId}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('deletes resource', async () => {
    // Create a resource to delete
    const upload = await auth.post('/api/resources').send({
      filename: 'test-delete.txt',
      data: Buffer.from('delete me').toString('base64'),
      type: 'text/plain',
      size: 9,
      activityId,
    });
    expect(upload.status).toBe(201);
    const deleteResourceId = upload.body.id;

    const del = await auth.delete(`/api/resources/${deleteResourceId}`);
    expect(del.status).toBe(204);
    const check = await auth.get(`/api/resources/${deleteResourceId}`);
    expect(check.status).toBe(404);
  });
});

describe('Newsletter API', () => {
  it('creates and exports newsletter', async () => {
    const res = await auth.post('/api/newsletters').send({ title: 'News', content: 'Hello' });
    expect(res.status).toBe(201);
    const id = res.body.id;
    const pdf = await auth.get(`/api/newsletters/${id}/pdf`);
    expect(pdf.status).toBe(200);
    const binaryParser = (
      res: NodeJS.ReadableStream,
      callback: (err: Error | null, data: Buffer) => void,
    ) => {
      const data: Buffer[] = [];
      res.on('data', (chunk) => data.push(Buffer.from(chunk)));
      res.on('end', () => callback(null, Buffer.concat(data)));
    };
    const docx = await auth.get(`/api/newsletters/${id}/docx`).buffer().parse(binaryParser);
    expect(docx.status).toBe(200);
    expect(Buffer.isBuffer(docx.body)).toBe(true);
    expect(docx.body.slice(0, 2).toString()).toBe('PK');
  });

  it('rejects invalid template name', async () => {
    const res = await auth
      .post('/api/newsletters')
      .send({ title: 'Bad', content: 'X', template: 'oops' });
    expect(res.status).toBe(400);
  });

  it('rejects invalid dates for generate', async () => {
    const res = await auth
      .post('/api/newsletters/generate')
      .send({ startDate: 'not-a-date', endDate: '2024-01-02T00:00:00.000Z' });
    expect(res.status).toBe(400);
  });

  it('rejects invalid template in generate', async () => {
    const res = await auth.post('/api/newsletters/generate').send({
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2024-01-02T00:00:00.000Z',
      template: 'bad',
    });
    expect(res.status).toBe(400);
  });

  it('rejects non-boolean includePhotos', async () => {
    const res = await auth
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
    const res = await auth.post('/api/newsletters/generate').send({
      startDate: '2025-01-01T00:00:00.000Z',
      endDate: '2025-01-07T00:00:00.000Z',
    });
    expect(res.status).toBe(201);
    const id = res.body.id;
    const rawRes = await auth.get(`/api/newsletters/${id}?version=raw`);
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
    const res = await auth.post(`/api/newsletters/${nl.id}/send`);
    expect(res.status).toBe(200);
    expect(res.body.sent).toBe(1);
  });
});

describe('Daily Plan API', () => {
  const weekStart = '2025-01-06T00:00:00.000Z';
  const dateOnly = '2025-01-06';

  beforeEach(async () => {
    const subject = await prisma.subject.create({ data: { name: 'DPSubj' } });
    const milestone = await prisma.milestone.create({
      data: { title: 'DPM', subjectId: subject.id },
    });
    await prisma.activity.create({ data: { title: 'DPA', milestoneId: milestone.id } });
    await prisma.timetableSlot.create({
      data: { day: 0, startMin: 540, endMin: 600, subjectId: subject.id },
    });
    await auth.post('/api/lesson-plans/generate').send({ weekStart });
  });

  it('generates daily plan from weekly', async () => {
    const res = await auth.post('/api/daily-plans/generate').send({ date: dateOnly });
    expect(res.status).toBe(201);
    expect(res.body.items.length).toBeGreaterThan(0);
  });

  it('retrieves the daily plan', async () => {
    await auth.post('/api/daily-plans/generate').send({ date: dateOnly });
    const res = await auth.get(`/api/daily-plans/${weekStart}`);
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
  });
});

describe('Notes API', () => {
  let activityId: number;

  beforeEach(async () => {
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
    const create = await auth.post('/api/notes').send({ content: 'hi', public: true, activityId });
    expect(create.status).toBe(201);
    const id = create.body.id;

    const get = await auth.get(`/api/notes/${id}`);
    expect(get.status).toBe(200);
    expect(get.body.content).toBe('hi');

    const upd = await auth.put(`/api/notes/${id}`).send({ content: 'bye', public: false });
    expect(upd.status).toBe(200);
    expect(upd.body.public).toBe(false);

    const del = await auth.delete(`/api/notes/${id}`);
    expect(del.status).toBe(204);
  });
});

describe('Unavailable Blocks API', () => {
  it('creates and lists blocks', async () => {
    const create = await auth.post('/api/unavailable-blocks').send({
      date: '2025-02-03T00:00:00.000Z',
      startMin: 540,
      endMin: 600,
      reason: 'Workshop',
      blockType: 'TEACHER_ABSENCE',
    });
    expect(create.status).toBe(201);
    const list = await auth.get('/api/unavailable-blocks?from=2025-02-03&to=2025-02-03');
    expect(list.status).toBe(200);
    expect(list.body.length).toBeGreaterThan(0);
  });
});
