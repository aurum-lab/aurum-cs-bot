import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initDatabase } from '../database.js';
import productsRouter from './routes/products.js';
import templatesRouter from './routes/templates.js';
import settingsRouter from './routes/settings.js';
import logsRouter from './routes/logs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 2020;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, 'public')));

// Initialize database
await initDatabase();

// API Routes
app.use('/api/products', productsRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/logs', logsRouter);

// Start server
app.listen(PORT, () => {
  console.log(`\n🔗 Admin Panel: http://localhost:${PORT}`);
  console.log(`\nMenu:`);
  console.log(`  Dashboard:  http://localhost:${PORT}/`);
  console.log(`  Produk:     http://localhost:${PORT}/products.html`);
  console.log(`  Template:   http://localhost:${PORT}/templates.html`);
  console.log(`  Setting:    http://localhost:${PORT}/settings.html`);
  console.log(`  Log:        http://localhost:${PORT}/logs.html`);
});
