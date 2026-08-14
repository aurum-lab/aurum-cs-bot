import db from './database.js';

// Get all products
export function getAllProducts() {
  return db.prepare('SELECT * FROM products WHERE is_available = 1').all();
}

// Get product by ID
export function getProductById(id) {
  return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
}

// Get products by category
export function getProductsByCategory(category) {
  return db.prepare('SELECT * FROM products WHERE category = ? AND is_available = 1').all(category);
}

// Search products
export function searchProducts(query) {
  return db.prepare(`
    SELECT * FROM products 
    WHERE (name LIKE ? OR description LIKE ?) 
    AND is_available = 1
  `).all(`%${query}%`, `%${query}%`);
}

// Save conversation
export function saveConversation(customerPhone, customerName, message, response, forwarded = 0) {
  return db.prepare('INSERT INTO conversations (customer_phone, customer_name, message, response, forwarded) VALUES (?, ?, ?, ?, ?)').run(customerPhone, customerName, message, response, forwarded);
}

// Get conversation history
export function getConversationHistory(customerPhone, limit = 10) {
  return db.prepare(`
    SELECT message, response 
    FROM conversations 
    WHERE customer_phone = ? 
    ORDER BY timestamp DESC 
    LIMIT ?
  `).all(customerPhone, limit).reverse();
}
