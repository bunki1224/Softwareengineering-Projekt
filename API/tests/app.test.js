const request = require('supertest');
const app = require('../app');

describe('API Tests', () => {
  test('GET /api/hello', async () => {
    const res = await request(app).get('/api/hello');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Hello, world!');
  });

  test('POST /api/data with valid name', async () => {
    const res = await request(app)
      .post('/api/data')
      .send({ name: 'John' });

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('John');
  });

  test('POST /api/data with missing name', async () => {
    const res = await request(app).post('/api/data').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});