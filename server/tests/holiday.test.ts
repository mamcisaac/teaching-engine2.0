import { app } from '../src/index';
import { authRequest } from './test-auth-helper';

const auth = authRequest(app);

describe('Holiday API', () => {
  beforeAll(async () => {
    await auth.setup();
  });

  it('creates and lists holidays', async () => {
    const create = await auth
      .post('/api/holidays')
      .send({ date: '2025-12-25T00:00:00.000Z', name: 'Christmas' });
    expect(create.status).toBe(201);
    const list = await auth.get('/api/holidays');
    expect(list.status).toBe(200);
    expect(list.body.length).toBeGreaterThan(0);
  });

  it('deletes holiday', async () => {
    const res = await auth
      .post('/api/holidays')
      .send({ date: '2025-01-01T00:00:00.000Z', name: 'NY' });
    const id = res.body.id as number;
    const del = await auth.delete(`/api/holidays/${id}`);
    expect(del.status).toBe(204);
  });
});
