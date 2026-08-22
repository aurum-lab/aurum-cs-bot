import { Router } from 'express';
import { getDb, saveDatabase } from '../../database.js';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import { existsSync, mkdirSync, unlinkSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const UPLOAD_DIR = join(__dirname, '..', '..', 'uploads');

// Ensure upload directory exists
if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file gambar yang diizinkan (JPG, PNG, GIF, WebP)'));
    }
  }
});

const router = Router();

// Get all products
router.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
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
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
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

// Create product with optional file upload
router.post('/', upload.single('image'), (req, res) => {
  const db = getDb();
  const { name, description, price, category, image_url } = req.body;
  
  // If file uploaded, use file path as image_url
  let finalImageUrl = image_url || '';
  if (req.file) {
    finalImageUrl = '/uploads/' + req.file.filename;
  }
  
  db.run(`
    INSERT INTO products (name, description, price, category, image_url)
    VALUES (?, ?, ?, ?, ?)
  `, [name, description || '', price, category, finalImageUrl]);
  
  saveDatabase();
  
  const results = db.exec('SELECT last_insert_rowid()');
  const id = results[0].values[0][0];
  
  res.json({ id, message: 'Product created' });
});

// Update product with optional file upload
router.put('/:id', upload.single('image'), (req, res) => {
  const db = getDb();
  const { name, description, price, category, image_url } = req.body;
  
  // If file uploaded, use file path as image_url
  let finalImageUrl = image_url || '';
  if (req.file) {
    finalImageUrl = '/uploads/' + req.file.filename;
  }
  
  db.run(`
    UPDATE products SET name = ?, description = ?, price = ?, category = ?, image_url = ?
    WHERE id = ?
  `, [name, description || '', price, category, finalImageUrl, req.params.id]);
  
  saveDatabase();
  res.json({ message: 'Product updated' });
});

// Delete product
router.delete('/:id', (req, res) => {
  const db = getDb();
  
  // Get product image before deleting
  const results = db.exec('SELECT image_url FROM products WHERE id = ?', [req.params.id]);
  if (results.length > 0 && results[0].values.length > 0) {
    const imageUrl = results[0].values[0][0];
    // Delete uploaded file if it's a local file
    if (imageUrl && imageUrl.startsWith('/uploads/')) {
      const filePath = join(UPLOAD_DIR, imageUrl.replace('/uploads/', ''));
      if (existsSync(filePath)) {
        try {
          unlinkSync(filePath);
        } catch (e) {
          console.error('Error deleting file:', e);
        }
      }
    }
  }
  
  db.run('DELETE FROM products WHERE id = ?', [req.params.id]);
  saveDatabase();
  res.json({ message: 'Product deleted' });
});

export default router;
