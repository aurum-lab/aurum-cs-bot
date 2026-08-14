import Database from 'better-sqlite3';
import config from './config.js';
import { mkdirSync } from 'fs';

// Ensure data directory exists
mkdirSync('./data', { recursive: true });

// Initialize database
const db = new Database(config.database.path);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    stock INTEGER DEFAULT 0,
    category TEXT,
    image_url TEXT,
    is_available INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_phone TEXT NOT NULL,
    customer_name TEXT,
    message TEXT,
    response TEXT,
    forwarded INTEGER DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

export default db;
