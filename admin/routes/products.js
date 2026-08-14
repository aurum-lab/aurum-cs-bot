import { Router } from 'express';
import { getDb, saveDatabase } from '../../database.js';

const router = Router();

// Get all products
router.get('/', (req, res) => {
  const db = getDb();
  const results = db.exec('SELECT * FROM products ORDER BY id DESC');
  if (results.length === 0) return res.json([]);
  
  const products = results[0].values.map(row => ({
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
  
  res.json(products);
});

// Get product by ID
router.get('/:id', (req, res) => {
  const db = getDb();
  const results = db.exec('SELECT * FROM products WHERE id = ?', [req.params.id]);
  if (results.length === 0 || results[0].values.length === 0) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  const row = results[0].values[0];
  res.json({
    id: row[0],
    name: row[1],
    description: row[2],
    price: row[3],
    stock: row[4],
    category: row[5],
    image_url: row[6],
    is_available: row[7],
    created_at: row[8]
  });
});

// Create product
router.post('/', (req, res) => {
  const db = getDb();
  const { name, description, price, category, image_url } = req.body;
  
  db.run(`
    INSERT INTO products (name, description, price, category, image_url)
    VALUES (?, ?, ?, ?, ?)
  `, [name, description || '', price, category, image_url || '']);
  
  saveDatabase();
  
  const results = db.exec('SELECT last_insert_rowid()');
  const id = results[0].values[0][0];
  
  res.json({ id, message: 'Product created' });
});

// Update product
router.put('/:id', (req, res) => {
  const db = getDb();
  const { name, description, price, category, image_url } = req.body;
  
  db.run(`
    UPDATE products SET name = ?, description = ?, price = ?, category = ?, image_url = ?
    WHERE id = ?
  `, [name, description || '', price, category, image_url || '', req.params.id]);
  
  saveDatabase();
  res.json({ message: 'Product updated' });
});

// Delete product
router.delete('/:id', (req, res) => {
  const db = getDb();
  db.run('DELETE FROM products WHERE id = ?', [req.params.id]);
  saveDatabase();
  res.json({ message: 'Product deleted' });
});

export default router;
