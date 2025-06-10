const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function initializeDatabase() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      multipleStatements: true // This allows multiple SQL statements
    });

    console.log('Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.query('CREATE DATABASE IF NOT EXISTS tripahead');
    console.log('Database created or already exists');

    // Use the database
    await connection.query('USE tripahead');
    console.log('Using database tripahead');

    // Read and execute the initialization SQL
    const sqlFile = await fs.readFile(path.join(__dirname, 'init.sql'), 'utf8');
    await connection.query(sqlFile);
    console.log('Database initialized successfully');

  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the initialization
initializeDatabase()
  .then(() => console.log('Database setup completed'))
  .catch(error => {
    console.error('Database setup failed:', error);
    process.exit(1);
  }); 