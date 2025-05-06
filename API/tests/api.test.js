const request = require('supertest');
const { app, pool } = require('../app');

// Test data
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password_hash: 'hashedpassword123'
};

const testActivity = {
  title: 'Test Activity',
  description: 'Test Description',
  type: 'sightseeing',
  location_lat: 35.6895,
  location_lng: 139.6917,
  gmaps_id: 'test-gmaps-id-123'
};

let userId;
let activityId;

// Setup before all tests
beforeAll(async () => {
  // Clean up database
  await pool.query('DELETE FROM activities');
  await pool.query('DELETE FROM users');
});

// Cleanup after all tests
afterAll(async () => {
  await pool.query('DELETE FROM activities');
  await pool.query('DELETE FROM users');
  await pool.end();
});

describe('User Endpoints', () => {
  test('POST /users - should create a new user', async () => {
    const response = await request(app)
      .post('/users')
      .send(testUser);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    userId = response.body.id;
  });

  test('GET /users - should return all users', async () => {
    const response = await request(app)
      .get('/users');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('username', testUser.username);
    expect(response.body[0]).toHaveProperty('email', testUser.email);
  });
});

describe('Activity Endpoints', () => {
  test('POST /activities - should create a new activity', async () => {
    const response = await request(app)
      .post('/activities')
      .send(testActivity);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    activityId = response.body.id;
  });

  test('GET /activities - should return all activities for the user', async () => {
    const response = await request(app)
      .get('/activities');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('title', testActivity.title);
    expect(response.body[0]).toHaveProperty('type', testActivity.type);
  });

  test('PUT /activities/:id - should update an activity', async () => {
    const updatedActivity = {
      ...testActivity,
      title: 'Updated Test Activity',
      description: 'Updated Test Description'
    };

    const response = await request(app)
      .put(`/activities/${activityId}`)
      .send(updatedActivity);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });

    // Verify the update
    const getResponse = await request(app)
      .get('/activities');
    expect(getResponse.body[0]).toHaveProperty('title', 'Updated Test Activity');
  });

  test('DELETE /activities/:id - should delete an activity', async () => {
    const response = await request(app)
      .delete(`/activities/${activityId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });

    // Verify the deletion
    const getResponse = await request(app)
      .get('/activities');
    expect(getResponse.body.length).toBe(0);
  });

  test('GET /activities - should return 404 for non-existent activity', async () => {
    const response = await request(app)
      .get('/activities/999999');

    expect(response.status).toBe(404);
  });
});
