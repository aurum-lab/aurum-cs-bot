import { getDb, saveDatabase } from './database.js';

// Get all products
export function getAllProducts() {
  const db = getDb();
  const results = db.exec('SELECT * FROM products WHERE is_available = 1');
  if (results.length === 0) return [];
  return results[0].values.map(row => ({
    id: row[0],
    name: row[1],
    description: row[2],
    price: row[3],
    stock: row[4],
    category: row[5],
    image_url: row[6],
    is_available: row[7],
    created_at: row[8]
  }));
}

// Get product by ID
export function getProductById(id) {
  const db = getDb();
  const results = db.exec('SELECT * FROM products WHERE id = ?', [id]);
  if (results.length === 0 || results[0].values.length === 0) return null;
  const row = results[0].values[0];
  return {
    id: row[0],
    name: row[1],
    description: row[2],
    price: row[3],
    stock: row[4],
    category: row[5],
    image_url: row[6],
    is_available: row[7],
    created_at: row[8]
  };
}

// Get products by category
export function getProductsByCategory(category) {
  const db = getDb();
  const results = db.exec('SELECT * FROM products WHERE category = ? AND is_available = 1', [category]);
  if (results.length === 0) return [];
  return results[0].values.map(row => ({
    id: row[0],
    name: row[1],
    description: row[2],
    price: row[3],
    stock: row[4],
    category: row[5],
    image_url: row[6],
    is_available: row[7],
    created_at: row[8]
  }));
}

// Search products
export function searchProducts(query) {
  const db = getDb();
  const results = db.exec(`
    SELECT * FROM products 
    WHERE (name LIKE ? OR description LIKE ?) 
    AND is_available = 1
  `, [`%${query}%`, `%${query}%`]);
  if (results.length === 0) return [];
  return results[0].values.map(row => ({
    id: row[0],
    name: row[1],
    description: row[2],
    price: row[3],
    stock: row[4],
    category: row[5],
    image_url: row[6],
    is_available: row[7],
    created_at: row[8]
  }));
}

// Save conversation
export function saveConversation(customerPhone, customerName, message, response, forwarded = 0) {
  const db = getDb();
  db.run('INSERT INTO conversations (customer_phone, customer_name, message, response, forwarded) VALUES (?, ?, ?, ?, ?)', 
    [customerPhone, customerName, message, response, forwarded]);
  saveDatabase();
}

// Get conversation history
export function getConversationHistory(customerPhone, limit = 10) {
  const db = getDb();
  const results = db.exec(`
    SELECT message, response 
    FROM conversations 
    WHERE customer_phone = ? 
    ORDER BY timestamp DESC 
    LIMIT ?
  `, [customerPhone, limit]);
  if (results.length === 0) return [];
  return results[0].values.map(row => ({
    message: row[0],
    response: row[1]
  })).reverse();
}
