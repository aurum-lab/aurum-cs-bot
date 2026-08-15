import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEMPLATES_FILE = join(__dirname, 'data/templates.json');

const defaultTemplates = {
  welcome: 'Halo! 👋 Selamat datang di Toko Roti kami!\n\nKetik *menu* untuk lihat daftar roti\nKetik *[nama roti]* untuk lihat detail & foto',
  offline: 'Maaf, admin sedang offline. Pesan anda akan kami balas segera.',
  systemPrompt: 'Kamu adalah asisten customer service untuk toko roti. Tugasmu adalah membantu pelanggan dengan menampilkan menu dan harga roti. Gunakan Bahasa Indonesia yang sopan dan ramah.'
};

let cachedTemplates = null;

export function getTemplates() {
  if (existsSync(TEMPLATES_FILE)) {
    try {
      const data = readFileSync(TEMPLATES_FILE, 'utf8');
      cachedTemplates = { ...defaultTemplates, ...JSON.parse(data) };
    } catch (e) {
      console.error('[Templates] Error reading templates:', e.message);
      cachedTemplates = { ...defaultTemplates };
    }
  } else {
    cachedTemplates = { ...defaultTemplates };
    writeFileSync(TEMPLATES_FILE, JSON.stringify(defaultTemplates, null, 2));
  }
  return cachedTemplates;
}

export function reloadTemplates() {
  cachedTemplates = null;
  return getTemplates();
}

export default { getTemplates, reloadTemplates };
