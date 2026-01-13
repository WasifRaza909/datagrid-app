import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/init.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running!' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to PostgreSQL React API' });
});

app.get('/api/debug/env', (req, res) => {
  res.json({
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    hasPassword: !!process.env.DB_PASSWORD,
  });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server first
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Initialize database in background
initializeDatabase().catch(err => {
  console.error('Database initialization failed:', err);
});