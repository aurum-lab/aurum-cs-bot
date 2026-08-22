import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import config from './config.js';
import { mkdirSync } from 'fs';

// Ensure data directory exists
mkdirSync('./data', { recursive: true });

// Database file path
const dbPath = config.database.path;

// Initialize database
let db;
let isInitialized = false;

export async function initDatabase() {
  const SQL = await initSqlJs();

  if (existsSync(dbPath)) {
    const fileBuffer = readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
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
  `);

  db.run(`
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

  // Save database
  saveDatabase();
  isInitialized = true;

  return db;
}

export function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(dbPath, buffer);
  }
}

export async function reloadDatabase() {
  // Save current state first (safety)
  if (db) {
    saveDatabase();
    db.close();
    db = null;
  }

  // Re-initialize from file
  const SQL = await initSqlJs();

  if (existsSync(dbPath)) {
    const fileBuffer = readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
    isInitialized = true;
    console.log('[Database] Reloaded from file:', dbPath);
    return db;
  } else {
    console.warn('[Database] File not found, creating new:', dbPath);
    db = new SQL.Database();
    isInitialized = true;
    return db;
  }
}

export function closeDatabase() {
  if (db) {
    saveDatabase();
    db.close();
    db = null;
    isInitialized = false;
    console.log('[Database] Closed and saved');
  }
}

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export function isDbInitialized() {
  return isInitialized && db !== null;
}

export default {
  initDatabase,
  saveDatabase,
  reloadDatabase,
  closeDatabase,
  getDb,
  isDbInitialized
};
