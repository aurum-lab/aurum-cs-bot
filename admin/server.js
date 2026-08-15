import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initDatabase } from '../database.js';
import productsRouter from './routes/products.js';
import templatesRouter from './routes/templates.js';
import settingsRouter from './routes/settings.js';
import logsRouter from './routes/logs.js';
import { getWAStatus, startWhatsApp, disconnectWhatsApp, sendMessage, waEvents } from '../whatsapp.js';

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

// WhatsApp API Routes

// Get WhatsApp status
app.get('/api/whatsapp/status', (req, res) => {
  res.json(getWAStatus());
});

// Start WhatsApp connection
app.post('/api/whatsapp/connect', async (req, res) => {
  try {
    const result = await startWhatsApp();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Disconnect WhatsApp
app.post('/api/whatsapp/disconnect', async (req, res) => {
  try {
    const result = await disconnectWhatsApp();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send message from admin
app.post('/api/whatsapp/send', async (req, res) => {
  const { phone, message } = req.body;
  
  if (!phone || !message) {
    return res.status(400).json({ success: false, message: 'Phone and message required' });
  }
  
  try {
    const result = await sendMessage(phone, message);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// SSE endpoint for real-time updates
app.get('/api/whatsapp/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Send current status
  res.write(`data: ${JSON.stringify({ type: 'status', data: getWAStatus() })}\n\n`);
  
  // Listen for events
  const onStatus = (status) => {
    res.write(`data: ${JSON.stringify({ type: 'status', data: { status } })}\n\n`);
  };
  
  const onQR = (qr) => {
    res.write(`data: ${JSON.stringify({ type: 'qr', data: qr })}\n\n`);
  };
  
  const onOllama = (status) => {
    res.write(`data: ${JSON.stringify({ type: 'ollama', data: status })}\n\n`);
  };
  
  const onMessage = (msg) => {
    res.write(`data: ${JSON.stringify({ type: 'message', data: msg })}\n\n`);
  };
  
  waEvents.on('status', onStatus);
  waEvents.on('qr', onQR);
  waEvents.on('ollama', onOllama);
  waEvents.on('message', onMessage);
  
  // Cleanup on disconnect
  req.on('close', () => {
    waEvents.off('status', onStatus);
    waEvents.off('qr', onQR);
    waEvents.off('ollama', onOllama);
    waEvents.off('message', onMessage);
  });
});

// Start server - listen on 0.0.0.0 agar bisa diakses dari device lain
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🔗 Admin Panel ready!`);
  console.log(`\nAkses dari Termux:     http://localhost:${PORT}`);
  console.log(`Akses dari HP/Lain:    http://<IP_TERMUX>:${PORT}`);
  console.log(`\nMenu:`);
  console.log(`  Dashboard:  /`);
  console.log(`  Produk:     /products.html`);
  console.log(`  Template:   /templates.html`);
  console.log(`  Setting:    /settings.html`);
  console.log(`  Log:        /logs.html`);
  console.log(`\n💡 WhatsApp bot can be connected from the Dashboard`);
});
