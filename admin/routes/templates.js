import { Router } from 'express';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();
const TEMPLATES_FILE = join(__dirname, '../../data/templates.json');

// Default templates
const defaultTemplates = {
  welcome: 'Halo! 👋 Selamat datang di Toko Roti kami!\n\nKetik *menu* untuk lihat daftar roti\nKetik *[nama roti]* untuk lihat detail & foto',
  offline: 'Maaf, admin sedang offline. Pesan anda akan kami balas segera.',
  systemPrompt: 'Kamu adalah asisten customer service untuk toko roti. Tugasmu adalah membantu pelanggan dengan menampilkan menu dan harga roti. Gunakan Bahasa Indonesia yang sopan dan ramah.'
};

// Get templates
router.get('/', (req, res) => {
  if (existsSync(TEMPLATES_FILE)) {
    const data = readFileSync(TEMPLATES_FILE, 'utf8');
    res.json(JSON.parse(data));
  } else {
    res.json(defaultTemplates);
  }
});

// Update templates
router.put('/', (req, res) => {
  const templates = { ...defaultTemplates };
  
  if (existsSync(TEMPLATES_FILE)) {
    const data = readFileSync(TEMPLATES_FILE, 'utf8');
    Object.assign(templates, JSON.parse(data));
  }
  
  Object.assign(templates, req.body);
  writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2));
  
  res.json({ message: 'Templates updated' });
});

export default router;
