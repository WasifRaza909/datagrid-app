import pool, { testConnection, query } from './database.js';

// Initialize database schema
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Test connection first
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Could not establish database connection');
    }

    console.log('Creating tables if they do not exist...');

    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✓ Users table ready');

    // Create posts table (example)
    await query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✓ Posts table ready');
    console.log('✓ Database initialized successfully');
  } catch (err) {
    console.error('Database initialization error:', err);
    throw err;
  }
};

export default pool;
