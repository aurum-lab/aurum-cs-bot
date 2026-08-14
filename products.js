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

// Update stock
export function updateStock(productId, quantity) {
  return db.prepare('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?').run(quantity, productId, quantity);
}

// Create order
export function createOrder(customerPhone, customerId, productId, quantity, totalPrice, notes = '') {
  return db.prepare(`
    INSERT INTO orders (customer_phone, customer_name, product_id, quantity, total_price, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(customerPhone, customerId, productId, quantity, totalPrice, notes);
}

// Get order by ID
export function getOrderById(orderId) {
  return db.prepare(`
    SELECT o.*, p.name as product_name 
    FROM orders o 
    JOIN products p ON o.product_id = p.id 
    WHERE o.id = ?
  `).get(orderId);
}

// Get customer orders
export function getCustomerOrders(customerPhone) {
  return db.prepare(`
    SELECT o.*, p.name as product_name 
    FROM orders o 
    JOIN products p ON o.product_id = p.id 
    WHERE o.customer_phone = ? 
    ORDER BY o.created_at DESC
    LIMIT 5
  `).all(customerPhone);
}

// Update order status
export function updateOrderStatus(orderId, status) {
  return db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, orderId);
}

// Save conversation
export function saveConversation(customerPhone, message, response) {
  return db.prepare('INSERT INTO conversations (customer_phone, message, response) VALUES (?, ?, ?)').run(customerPhone, message, response);
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
