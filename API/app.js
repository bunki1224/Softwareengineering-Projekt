const mariadb = require('mariadb');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

// Enable CORS for all routes with more permissive settings for development
app.use(cors({
  origin: '*', // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
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

// Get all activities
app.get('/activities', async (req, res) => {
  try {
    const [activities] = await pool.query("SELECT * FROM activities");
    // Ensure activities is an array and convert BigInt to Number
    const formattedActivities = Array.isArray(activities) ? activities.map(activity => ({
      ...activity,
      id: Number(activity.id)
    })) : [];
    res.json(formattedActivities);
  } catch (err) {
    console.error('Error fetching activities:', err);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Post new user
app.post('/users', async (req, res) => {
  const { username, email, password } = req.body;
  console.log('Signup attempt for:', { username, email });

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  let conn;
  try {
    conn = await pool.getConnection();

    // Hash the password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert the user
    const result = await conn.query(
      "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
      [username, email, password_hash]
    );

    console.log('Insert result:', result);

    // Get the created user
    const rows = await conn.query(
      "SELECT id, username, email FROM users WHERE id = ?",
      [result.insertId]
    );

    console.log('User query result:', rows);

    if (!rows || rows.length === 0) {
      throw new Error('Failed to retrieve created user');
    }

    const user = rows[0];
    res.status(201).json({
      id: user.id.toString(),
      username: user.username,
      email: user.email
    });
  } catch (err) {
    console.error('Signup error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ 
        error: 'Username or email already exists',
        details: err.message 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to create user',
        details: err.message 
      });
    }
  } finally {
    if (conn) conn.release();
  }
});

// Create new activity
app.post('/activities', async (req, res) => {
  const { title, description, address, price, rating, image_url, position_lat, position_lng, tags } = req.body;
  
  console.log('Creating activity with data:', { title, description, address, price, rating, image_url, position_lat, position_lng, tags });
  
  try {
    // First check if all required fields are present
    if (!title || !description || !address) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'Title, description, and address are required'
      });
    }

    // Insert the activity
    const result = await pool.query(
      `INSERT INTO activities (title, description, address, price, rating, image_url, position_lat, position_lng, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        address,
        price || null,
        rating || null,
        image_url || null,
        position_lat || null,
        position_lng || null,
        JSON.stringify(tags || [])
      ]
    );

    console.log('Activity insert result:', result);

    if (!result || !result.insertId) {
      throw new Error('Failed to insert activity - no insertId returned');
    }

    const activityId = Number(result.insertId);
    
    // Fetch the created activity
    const activities = await pool.query(
      'SELECT * FROM activities WHERE id = ?',
      [activityId]
    );

    console.log('Fetched created activity:', activities);

    if (!activities || activities.length === 0) {
      throw new Error('Failed to retrieve created activity');
    }

    const activity = {
      ...activities[0],
      id: Number(activities[0].id)
    };

    console.log('Returning activity:', activity);
    res.status(201).json(activity);
  } catch (err) {
    console.error('Error creating activity:', err);
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      sqlMessage: err.sqlMessage,
      sqlState: err.sqlState
    });
    res.status(500).json({ 
      error: 'Failed to create activity',
      details: err.message
    });
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
  console.log('Login attempt for username:', username);

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    
    // Get user with password hash
    const rows = await conn.query(
      'SELECT id, username, email, password_hash FROM users WHERE username = ?',
      [username]
    );

    console.log('Found users:', rows ? rows.length : 0);

    if (!rows || rows.length === 0) {
      console.log('No user found with username:', username);
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = rows[0];
    console.log('Found user:', { id: user.id, username: user.username });

    // Compare password
    const match = await bcrypt.compare(password, user.password_hash);
    console.log('Password match:', match);

    if (!match) {
      console.log('Password does not match for user:', username);
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Password matches, send user data (excluding password)
    const userData = {
      id: user.id.toString(),
      username: user.username,
      email: user.email
    };

    console.log('Login successful for user:', userData);
    res.json(userData);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      error: 'Login failed',
      details: err.message 
    });
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

// Helper function to safely parse JSON
const safeJsonParse = (str) => {
  if (!str) return [];
  try {
    return JSON.parse(str);
  } catch (e) {
    // If it's not valid JSON, treat it as a string
    return [str];
  }
};

// Get activities for a trip
app.get('/trips/:tripId/activities', async (req, res) => {
  const tripId = req.params.tripId;
  console.log('Fetching activities for trip:', tripId);

  try {
    const activities = await pool.query(
      `SELECT a.*, ta.status, ta.day 
       FROM activities a 
       JOIN trip_activities ta ON a.id = ta.activity_id 
       WHERE ta.trip_id = ?`,
      [tripId]
    );

    console.log('Found activities:', activities);

    // Convert BigInt to Number and ensure we have an array
    const formattedActivities = activities.map(activity => ({
      ...activity,
      id: Number(activity.id),
      trip_id: Number(tripId),
      status: activity.status || 'backlog',
      tags: safeJsonParse(activity.tags)
    }));

    console.log('Formatted activities:', formattedActivities);
    res.json(formattedActivities);
  } catch (err) {
    console.error('Error fetching activities:', err);
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      sqlMessage: err.sqlMessage,
      sqlState: err.sqlState
    });
    res.status(500).json({ 
      error: 'Failed to fetch activities',
      details: err.message
    });
  }
});

// Add activity to trip
app.post('/trips/:tripId/activities', async (req, res) => {
  const tripId = req.params.tripId;
  const { title, description, address, price, tags, status = 'backlog' } = req.body;

  console.log('Adding activity to trip:', { tripId, title, description, address, price, tags, status });

  try {
    // Validate required fields
    if (!title || !description || !address) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'Title, description, and address are required'
      });
    }

    // First create the activity
    const activityResult = await pool.query(
      `INSERT INTO activities (title, description, address, price, tags) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        title,
        description,
        address,
        price || null,
        JSON.stringify(Array.isArray(tags) ? tags : [tags].filter(Boolean))
      ]
    );
    
    console.log('Activity insert result:', activityResult);

    if (!activityResult || !activityResult.insertId) {
      throw new Error('Failed to insert activity - no insertId returned');
    }

    const activityId = Number(activityResult.insertId);

    // Then link it to the trip with status
    const tripActivityResult = await pool.query(
      `INSERT INTO trip_activities (trip_id, activity_id, status) 
       VALUES (?, ?, ?)`,
      [tripId, activityId, status]
    );

    console.log('Trip activity link result:', tripActivityResult);

    // Fetch the complete activity data with status
    const activities = await pool.query(
      `SELECT a.*, ta.status, ta.day 
       FROM activities a 
       JOIN trip_activities ta ON a.id = ta.activity_id 
       WHERE a.id = ? AND ta.trip_id = ?`,
      [activityId, tripId]
    );

    console.log('Fetched linked activity:', activities);

    if (!activities || activities.length === 0) {
      throw new Error('Failed to retrieve created activity');
    }

    const activity = {
      ...activities[0],
      id: Number(activities[0].id),
      trip_id: Number(tripId),
      status: activities[0].status || 'backlog',
      tags: safeJsonParse(activities[0].tags)
    };

    console.log('Returning activity:', activity);
    res.status(201).json(activity);
  } catch (err) {
    console.error('Error adding activity to trip:', err);
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      sqlMessage: err.sqlMessage,
      sqlState: err.sqlState
    });
    res.status(500).json({ 
      error: 'Failed to add activity to trip',
      details: err.message
    });
  }
});

// Update activity status and day
app.patch('/trips/:tripId/activities/:activityId', async (req, res) => {
  const { tripId, activityId } = req.params;
  const { status, day } = req.body;

  console.log('Updating activity:', { tripId, activityId, status, day });

  try {
    // Update the trip_activities record
    const result = await pool.query(
      `UPDATE trip_activities 
       SET status = ?, day = ? 
       WHERE trip_id = ? AND activity_id = ?`,
      [status, day, tripId, activityId]
    );

    console.log('Update result:', result);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Activity not found in trip' });
    }

    // Fetch the updated activity
    const activities = await pool.query(
      `SELECT a.*, ta.status, ta.day 
       FROM activities a 
       JOIN trip_activities ta ON a.id = ta.activity_id 
       WHERE a.id = ? AND ta.trip_id = ?`,
      [activityId, tripId]
    );

    if (!activities || activities.length === 0) {
      throw new Error('Failed to retrieve updated activity');
    }

    const activity = {
      ...activities[0],
      id: Number(activities[0].id),
      trip_id: Number(tripId),
      status: activities[0].status || 'backlog',
      tags: safeJsonParse(activities[0].tags)
    };

    console.log('Returning updated activity:', activity);
    res.json(activity);
  } catch (err) {
    console.error('Error updating activity:', err);
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      sqlMessage: err.sqlMessage,
      sqlState: err.sqlState
    });
    res.status(500).json({ 
      error: 'Failed to update activity',
      details: err.message
    });
  }
});

// Delete activity from trip
app.delete('/trips/:tripId/activities/:activityId', async (req, res) => {
  const { tripId, activityId } = req.params;

  console.log('Deleting activity from trip:', { tripId, activityId });

  try {
    // First delete the trip_activities record
    const result = await pool.query(
      'DELETE FROM trip_activities WHERE trip_id = ? AND activity_id = ?',
      [tripId, activityId]
    );

    console.log('Delete result:', result);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Activity not found in trip' });
    }

    // Then delete the activity itself
    await pool.query(
      'DELETE FROM activities WHERE id = ?',
      [activityId]
    );

    res.json({ message: 'Activity deleted successfully' });
  } catch (err) {
    console.error('Error deleting activity:', err);
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      sqlMessage: err.sqlMessage,
      sqlState: err.sqlState
    });
    res.status(500).json({ 
      error: 'Failed to delete activity',
      details: err.message
    });
  }
});

// Update activity details
app.put('/activities/:activityId', async (req, res) => {
  const { activityId } = req.params;
  const { title, description, address, price, tags } = req.body;

  console.log('Updating activity details:', { activityId, title, description, address, price, tags });

  try {
    const result = await pool.query(
      `UPDATE activities 
       SET title = ?, description = ?, address = ?, price = ?, tags = ?
       WHERE id = ?`,
      [
        title,
        description,
        address,
        price || null,
        JSON.stringify(Array.isArray(tags) ? tags : [tags].filter(Boolean)),
        activityId
      ]
    );

    console.log('Update result:', result);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    // Fetch the updated activity
    const activities = await pool.query(
      'SELECT * FROM activities WHERE id = ?',
      [activityId]
    );

    if (!activities || activities.length === 0) {
      throw new Error('Failed to retrieve updated activity');
    }

    const activity = {
      ...activities[0],
      id: Number(activities[0].id),
      tags: safeJsonParse(activities[0].tags)
    };

    console.log('Returning updated activity:', activity);
    res.json(activity);
  } catch (err) {
    console.error('Error updating activity:', err);
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      sqlMessage: err.sqlMessage,
      sqlState: err.sqlState
    });
    res.status(500).json({ 
      error: 'Failed to update activity',
      details: err.message
    });
  }
});

// Search activities (for adding to backlog)
app.get('/activities/search', async (req, res) => {
  const { query } = req.query;
  
  try {
    const [activities] = await pool.query(`
      SELECT * FROM activities 
      WHERE title LIKE ? OR description LIKE ? OR address LIKE ?
      LIMIT 10
    `, [`%${query}%`, `%${query}%`, `%${query}%`]);
    
    res.json(activities);
  } catch (error) {
    console.error('Error searching activities:', error);
    res.status(500).json({ error: 'Failed to search activities' });
  }
});

// Test database structure
app.get('/test-db', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    
    // Test connection
    await conn.query('SELECT 1');
    
    // Check users table
    const usersTable = await conn.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = ? AND table_name = 'users'
    `, [process.env.DB_NAME]);
    
    // Check if we have any users
    const users = await conn.query('SELECT id, username, email FROM users');
    
    res.json({
      status: 'success',
      message: 'Database connection successful',
      users_table: usersTable,
      users_count: users.length,
      users: users
    });
  } catch (err) {
    console.error('Database test error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: err.message,
      code: err.code
    });
  } finally {
    if (conn) conn.release();
  }
});

// Check if tables exist
app.get('/check-tables', async (req, res) => {
  try {
    const [tables] = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
    `);
    console.log('Existing tables:', tables);
    res.json({ status: 'success', tables });
  } catch (error) {
    console.error('Error checking tables:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to check tables',
      error: error.message 
    });
  }
});

// Check if trip exists
app.get('/trips/:tripId', async (req, res) => {
  const { tripId } = req.params;
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM trips WHERE id = ?', [tripId]);
    
    if (rows.length === 0) {
      res.status(404).json({ error: 'Trip not found' });
      return;
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error('Error checking trip:', err);
    res.status(500).json({ error: 'Failed to check trip' });
  } finally {
    if (conn) conn.release();
  }
});

// Get days for a trip
app.get('/trips/:tripId/days', async (req, res) => {
  const { tripId } = req.params;
  try {
    const days = await pool.query(
      'SELECT * FROM trip_days WHERE trip_id = ? ORDER BY day_number',
      [tripId]
    );
    
    // Convert BigInt to Number
    const formattedDays = days.map(day => ({
      ...day,
      id: Number(day.id),
      trip_id: Number(day.trip_id),
      day_number: Number(day.day_number)
    }));
    
    res.json(formattedDays);
  } catch (err) {
    console.error('Error fetching trip days:', err);
    res.status(500).json({ error: 'Failed to fetch trip days' });
  }
});

// Add a new day to a trip
app.post('/trips/:tripId/days', async (req, res) => {
  const { tripId } = req.params;
  const { day_number, title } = req.body;

  try {
    // First check if the day already exists
    const existingDay = await pool.query(
      'SELECT * FROM trip_days WHERE trip_id = ? AND day_number = ?',
      [tripId, day_number]
    );

    let result;
    if (existingDay.length > 0) {
      // Update existing day
      result = await pool.query(
        'UPDATE trip_days SET title = ? WHERE trip_id = ? AND day_number = ?',
        [title || `Day ${day_number}`, tripId, day_number]
      );
    } else {
      // Insert new day
      result = await pool.query(
        'INSERT INTO trip_days (trip_id, day_number, title) VALUES (?, ?, ?)',
        [tripId, day_number, title || `Day ${day_number}`]
      );
    }

    // Fetch the day to return
    const days = await pool.query(
      'SELECT * FROM trip_days WHERE trip_id = ? AND day_number = ?',
      [tripId, day_number]
    );

    if (!days || days.length === 0) {
      throw new Error('Failed to retrieve created/updated day');
    }

    const day = {
      id: Number(days[0].id),
      trip_id: Number(tripId),
      day_number: Number(day_number),
      title: days[0].title
    };

    res.status(201).json(day);
  } catch (err) {
    console.error('Error adding/updating trip day:', err);
    res.status(500).json({ error: 'Failed to add/update trip day' });
  }
});

// Update a day's title
app.put('/trips/:tripId/days/:dayNumber', async (req, res) => {
  const { tripId, dayNumber } = req.params;
  const { title } = req.body;

  try {
    const result = await pool.query(
      'UPDATE trip_days SET title = ? WHERE trip_id = ? AND day_number = ?',
      [title, tripId, dayNumber]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Day not found' });
    }

    res.json({ message: 'Day updated successfully' });
  } catch (err) {
    console.error('Error updating trip day:', err);
    res.status(500).json({ error: 'Failed to update trip day' });
  }
});

// Delete a day
app.delete('/trips/:tripId/days/:dayNumber', async (req, res) => {
  const { tripId, dayNumber } = req.params;

  try {
    // First, move all activities from this day back to backlog
    await pool.query(
      'UPDATE trip_activities SET status = "backlog", day = NULL WHERE trip_id = ? AND day = ?',
      [tripId, dayNumber]
    );

    // Then delete the day
    const result = await pool.query(
      'DELETE FROM trip_days WHERE trip_id = ? AND day_number = ?',
      [tripId, dayNumber]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Day not found' });
    }

    // Update day numbers for remaining days
    await pool.query(
      'UPDATE trip_days SET day_number = day_number - 1 WHERE trip_id = ? AND day_number > ?',
      [tripId, dayNumber]
    );

    // Update day numbers for activities
    await pool.query(
      'UPDATE trip_activities SET day = day - 1 WHERE trip_id = ? AND day > ?',
      [tripId, dayNumber]
    );

    res.json({ message: 'Day deleted successfully' });
  } catch (err) {
    console.error('Error deleting trip day:', err);
    res.status(500).json({ error: 'Failed to delete trip day' });
  }
});

module.exports = { app, pool };