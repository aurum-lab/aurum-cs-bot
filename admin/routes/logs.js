import { Router } from 'express';
import { getDb } from '../../database.js';

const router = Router();

// Get all logs
router.get('/', (req, res) => {
  const db = getDb();
  const results = db.exec(`
    SELECT * FROM conversations 
    ORDER BY timestamp DESC 
    LIMIT 100
  `);
  
  if (results.length === 0) return res.json([]);
  
  const logs = results[0].values.map(row => ({
    id: row[0],
    customer_phone: row[1],
    customer_name: row[2],
    message: row[3],
    response: row[4],
    forwarded: row[5],
    timestamp: row[6]
  }));
  
  res.json(logs);
});

// Get logs by phone number
router.get('/:phone', (req, res) => {
  const db = getDb();
  const results = db.exec(`
    SELECT * FROM conversations 
    WHERE customer_phone = ?
    ORDER BY timestamp DESC
  `, [req.params.phone]);
  
  if (results.length === 0) return res.json([]);
  
  const logs = results[0].values.map(row => ({
    id: row[0],
    customer_phone: row[1],
    customer_name: row[2],
    message: row[3],
    response: row[4],
    forwarded: row[5],
    timestamp: row[6]
  }));
  
  res.json(logs);
});

export default router;
