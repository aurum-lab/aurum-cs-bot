import { Router } from 'express';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();
const SETTINGS_FILE = join(__dirname, '../../data/settings.json');

// Default settings
const defaultSettings = {
  adminNumber: '6281234567890',
  botName: 'RotiBot',
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'aurum-brain',
  temperature: 0.7
};

// Get settings
router.get('/', (req, res) => {
  if (existsSync(SETTINGS_FILE)) {
    const data = readFileSync(SETTINGS_FILE, 'utf8');
    res.json(JSON.parse(data));
  } else {
    res.json(defaultSettings);
  }
});

// Update settings
router.put('/', (req, res) => {
  const settings = { ...defaultSettings };
  
  if (existsSync(SETTINGS_FILE)) {
    const data = readFileSync(SETTINGS_FILE, 'utf8');
    Object.assign(settings, JSON.parse(data));
  }
  
  Object.assign(settings, req.body);
  writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
  
  res.json({ message: 'Settings updated' });
});

export default router;
