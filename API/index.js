// index.js
import express from 'express';
import cors from 'cors';
import mariadb from 'mariadb';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// DB-Pool
const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  connectionLimit: 5
});

// --- MIDDLEWARE Beispiel: User-ID simulieren ---
app.use((req, res, next) => {
  // Später durch echte Auth ersetzen!
  req.userId = 1; // Beispiel: user_id = 1
  next();
});

// GET alle Aktivitäten für eingeloggten User
app.get('/activities', async (req, res) => {
  try {
    console.log("GET alle Aktivitäten für eingeloggten User");
    const conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM activities WHERE user_id = ?', [req.userId]);
    conn.release();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST neue Aktivität
app.post('/activities', async (req, res) => {
  const { title, description, type, location_lat, location_lng, gmaps_id } = req.body;
  try {
    const conn = await pool.getConnection();
    const result = await conn.query(
      'INSERT INTO activities (user_id, title, description, type, location_lat, location_lng, gmaps_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.userId, title, description, type, location_lat, location_lng, gmaps_id]
    );
    conn.release();
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Aktivität aktualisieren
app.put('/activities/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, type, location_lat, location_lng, gmaps_id } = req.body;
  try {
    const conn = await pool.getConnection();
    const result = await conn.query(
      `UPDATE activities SET title = ?, description = ?, type = ?, location_lat = ?, location_lng = ?, gmaps_id = ?
       WHERE id = ? AND user_id = ?`,
      [title, description, type, location_lat, location_lng, gmaps_id, id, req.userId]
    );
    conn.release();
    res.json({ updated: result.affectedRows > 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Aktivität
app.delete('/activities/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const conn = await pool.getConnection();
    const result = await conn.query('DELETE FROM activities WHERE id = ? AND user_id = ?', [id, req.userId]);
    conn.release();
    res.json({ deleted: result.affectedRows > 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('API läuft auf http://localhost:3000'));
