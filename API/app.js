const express = require('express');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(express.json());

// DB-Verbindung
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Middleware: Setzt Dummy-User (in echter App via Login)
app.use((req, res, next) => {
  req.user = { id: 1 }; // z. B. von Auth-System
  next();
});

// ---------- USER ROUTES ----------

// Neuen User erstellen
app.post('/users', async (req, res) => {
  try {
    const { username, email, password_hash } = req.body;
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, password_hash]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Alle User anzeigen
app.get('/users', async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, username, email FROM users');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- ACTIVITY ROUTES ----------

// Neue Aktivität erstellen
app.post('/activities', async (req, res) => {
  try {
    const { title, description, type, location_lat, location_lng, gmaps_id } = req.body;
    const [result] = await pool.query(
      `INSERT INTO activities 
        (user_id, title, description, type, location_lat, location_lng, gmaps_id, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [req.user.id, title, description, type, location_lat, location_lng, gmaps_id]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Alle Aktivitäten für eingeloggten User
app.get('/activities', async (req, res) => {
  try {
    const [activities] = await pool.query(
      'SELECT * FROM activities WHERE user_id = ?',
      [req.user.id]
    );
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eine Aktivität löschen
app.delete('/activities/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM activities WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eine Aktivität aktualisieren
app.put('/activities/:id', async (req, res) => {
  try {
    const { title, description, type, location_lat, location_lng, gmaps_id } = req.body;
    const [result] = await pool.query(
      `UPDATE activities 
       SET title = ?, description = ?, type = ?, location_lat = ?, location_lng = ?, gmaps_id = ? 
       WHERE id = ? AND user_id = ?`,
      [title, description, type, location_lat, location_lng, gmaps_id, req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export für Tests
module.exports = { app, pool };
