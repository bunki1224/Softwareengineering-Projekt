const mariadb = require('mariadb');
const dotenv = require('dotenv');
const express = require('express');

const app = express();
const port = 3000;
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

module.exports = { app, pool };