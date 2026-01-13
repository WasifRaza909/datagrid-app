import { Pool, PoolClient, QueryResult } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Debug: Log connection details (without password)
console.log('Database connection config:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
});

// Create a connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'postgress_react_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

// Event listeners
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Test the connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    console.log('✓ Connected to PostgreSQL');
    client.release();
    return true;
  } catch (err) {
    console.error('✗ Failed to connect to PostgreSQL:', err);
    return false;
  }
};

// Query helper
export const query = (text: string, params?: any[]): Promise<QueryResult> => {
  return pool.query(text, params);
};

// Get a client from the pool
export const getClient = (): Promise<PoolClient> => {
  return pool.connect();
};

// Close the pool
export const closePool = (): Promise<void> => {
  return pool.end();
};

export default pool;
