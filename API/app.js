const mariadb = require('mariadb');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

// Enable CORS for all routes with more permissive settings for development
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Allow both localhost and IP
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

app.use(express.json());

dotenv.config();

// Pool erstellen
const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  acquireTimeout: 10000,
  connectTimeout: 10000,
  waitForConnections: true,
  queueLimit: 0
});



// Middleware + Routen definieren
app.get('/', (req, res) => {
  res.status(200).json({ message:  process.env.DB_NAME});
  
});


// Get Requests for Users
app.get('/users', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Serverfehler');
  } finally {
    if (conn) conn.release();
  }
});

// Get Requests for Activities
app.get('/activities', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query("SELECT * FROM activities");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Serverfehler');
  } finally {
    if (conn) conn.release();
  }
});
// Post new user
app.post('/users', async (req, res) => {
  const { username, email, password_hash } = req.body;

  let conn;
  try {
    conn = await pool.getConnection();

    const result = await conn.query(
      "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
      [username, email, password_hash] // Übergebe die Werte als Array
    );

    
    const userId = result.insertId.toString();  // oder .toNumber(), je nach Bedarf

    res.status(201).json({ id: userId, username, email });
  } catch (err) {
    console.error(err);
    res.status(500).send('Serverfehler');
  } finally {
    if (conn) conn.release();
  }
});

// Post new activity
app.post('/activities', async (req, res) => {
  const { user_id, title, description, type, location_lat, location_lng, gmaps_id } = req.body;

  if (!user_id || !title || !description || !type || !location_lat || !location_lng || !gmaps_id) {
    return res.status(400).json({ error: 'Alle Felder sind erforderlich.' });
  }

  let conn;
  try {
    conn = await pool.getConnection();

    const result = await conn.query(
      `INSERT INTO activities 
        (user_id, title, description, type, location_lat, location_lng, gmaps_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [user_id, title, description, type, location_lat, location_lng, gmaps_id]
    );

    const activityId = result.insertId.toString();
    res.status(201).json({ id: activityId, title });
  } catch (err) {
    console.error(err);
    res.status(500).send('Serverfehler');
  } finally {
    if (conn) conn.release();
  }
});

// Delete user
app.delete('/user', async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'User ID erforderlich.' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden.' });
    }

    res.json({ message: 'Benutzer gelöscht.' });
  }
  finally {
    if (conn) conn.release();
  }
});

// Delete activity
app.delete('/activities', async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'User ID erforderlich.' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query('DELETE FROM activities WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden.' });
    }

    res.json({ message: 'Benutzer gelöscht.' });
  }
  finally {
    if (conn) conn.release();
  }
});

// update user
app.put('/user', async (req, res) => {
  const { id, username, email, password_hash } = req.body;
  if (!id || !username || !email || !password_hash) {
    return res.status(400).json({ error: 'Alle Felder (id, username, email, password_hash) sind erforderlich.' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(
      'UPDATE users SET username = ?, email = ?, password_hash = ? WHERE id = ?',
      [username, email, password_hash, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden.' });
    }

    res.json({ message: 'Benutzer aktualisiert.' });
  } finally {
    if (conn) conn.release();
  }
});

// update activity
app.put('/activities', async (req, res) => {
  const { id, title, description, type, location_lat, location_lng, gmaps_id } = req.body;

  if (!id || !title || !description || !type || !location_lat || !location_lng || !gmaps_id) {
    return res.status(400).json({ error: 'Alle Felder (id, title, description, type, location_lat, location_lng, gmaps_id) sind erforderlich.' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(
      `UPDATE activities 
       SET title = ?, description = ?, type = ?, location_lat = ?, location_lng = ?, gmaps_id = ?
       WHERE id = ?`,
      [title, description, type, location_lat, location_lng, gmaps_id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Aktivität nicht gefunden.' });
    }

    res.json({ message: 'Aktivität aktualisiert.' });
  } finally {
    if (conn) conn.release();
  }
})

// Get all trips for a user
app.get('/trips/:userId', async (req, res) => {
  const { userId } = req.params;
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query("SELECT * FROM trips WHERE user_id = ?", [userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Serverfehler');
  } finally {
    if (conn) conn.release();
  }
});

// Get a specific trip
app.get('/trip/:tripId', async (req, res) => {
  const { tripId } = req.params;
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query("SELECT * FROM trips WHERE id = ?", [tripId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Trip nicht gefunden.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Serverfehler');
  } finally {
    if (conn) conn.release();
  }
});

// Create a new trip
app.post('/trips', async (req, res) => {
  const { user_id, title, description, start_date, end_date } = req.body;

  if (!user_id || !title) {
    return res.status(400).json({ error: 'User ID und Titel sind erforderlich.' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(
      `INSERT INTO trips 
        (user_id, title, description, start_date, end_date, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())`,
      [user_id, title, description, start_date, end_date]
    );

    const tripId = result.insertId.toString();
    res.status(201).json({ id: tripId, title });
  } catch (err) {
    console.error(err);
    res.status(500).send('Serverfehler');
  } finally {
    if (conn) conn.release();
  }
});

// Update a trip
app.put('/trips/:tripId', async (req, res) => {
  const { tripId } = req.params;
  const { title, description, start_date, end_date } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Titel ist erforderlich.' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(
      `UPDATE trips 
       SET title = ?, description = ?, start_date = ?, end_date = ?
       WHERE id = ?`,
      [title, description, start_date, end_date, tripId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Trip nicht gefunden.' });
    }

    res.json({ message: 'Trip aktualisiert.' });
  } finally {
    if (conn) conn.release();
  }
});

// Delete a trip
app.delete('/trips/:tripId', async (req, res) => {
  const { tripId } = req.params;

  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query('DELETE FROM trips WHERE id = ?', [tripId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Trip nicht gefunden.' });
    }

    res.json({ message: 'Trip gelöscht.' });
  } finally {
    if (conn) conn.release();
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(
      "SELECT id, username, email FROM users WHERE username = ? AND password_hash = ?",
      [username, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = rows[0];
    res.json({
      id: user.id,
      username: user.username,
      email: user.email
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    if (conn) conn.release();
  }
});

// Signup endpoint
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Check if username or email already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    // Return user data without password
    res.status(201).json({
      id: result.insertId,
      username,
      email
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create user. Please try again.' });
  }
});

module.exports = { app, pool };