const request = require('supertest');
const { app,pool } = require('../app');


describe('my test', ()=>{
    test('GET /', async() => {
        const res = await request(app).get('/');
        expect(res.statusCode).toBe(200);
    })
    test('GET /users', async ()=>{
        const res = await request(app).get('/users');
        expect(res.statusCode).toBe(200);
    })
    test('GET /activities', async ()=>{
        const res = await request(app).get('/activities');
        expect(res.statusCode).toBe(200);
    })
    test('POST /users should create a new user', async () => {
        const res = await request(app)
            .post('/users')
            .send({
                username: 'testuser_' + Date.now(),
                email: `test_${Date.now()}@example.com`,
                password_hash: 'securepass'
            });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('username');
    });
    test('POST /activities should create a new activity', async () => {
        const res = await request(app)
            .post('/activities')
            .send({
                user_id: 17,
                title: 'Testaktivität',
                description: 'Eine Beschreibung',
                type: 'hotel',
                location_lat: 52.52,
                location_lng: 13.405,
                gmaps_id: 'ChIJAVkDPzdOqEcRcDteW0YgIQQ'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('title', 'Testaktivität');
    }, 10000);

    test('PUT /user should update existing user by ID', async () => {
        const res = await request(app)
          .put('/user')
          .send({
            id: 1,
            username: 'manuell_geändert',
            email: 'update@example.com',
            password_hash: 'neuesPasswort123'
          });
      
        expect([200, 404]).toContain(res.statusCode); // 200 = Erfolg, 404 = User nicht vorhanden
      });

    test('PUT /activities should update existing activity by ID', async () => {
    const res = await request(app)
        .put('/activities')
        .send({
        id: 1,
        title: 'Aktualisierte Aktivität',
        description: 'Neue Beschreibung',
        type: 'place',
        location_lat: 48.1371,
        location_lng: 11.5754,
        gmaps_id: 'neueGmapsID123'
    });
      
        expect([200, 404]).toContain(res.statusCode); // 200 = ok, 404 = nicht gefunden
      });
});


afterAll(async () => {
    await pool.end();
    console.log("Tests beendet")
});

