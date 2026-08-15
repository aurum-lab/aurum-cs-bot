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
  systemPrompt: 'Kamu adalah asisten customer service untuk toko roti. Tugasmu adalah membantu pelanggan dengan menampilkan menu dan harga roti. Gunakan Bahasa Indonesia yang sopan dan ramah.',
  tags: {
    '#order': {
      name: 'Order',
      template: '🛒 *ORDER*\n\nTerima kasih atas order Anda!\n\nSilakan sebutkan:\n• Nama roti\n• Jumlah\n• Pengambilan/antar\n\nAdmin akan segera merespon.',
      autoReply: true
    },
    '#komplain': {
      name: 'Komplain',
      template: '😔 *KOMPLAIN*\n\nKami mohon maaf atas ketidaknyamanan ini.\n\nSilakan jelaskan masalah Anda:\n• Apa yang terjadi?\n• Kapan kejadiannya?\n• Bukti (foto jika ada)\n\nAdmin akan segera menindaklanjuti.',
      autoReply: true
    },
    '#info': {
      name: 'Info',
      template: 'ℹ️ *INFO TOKO*\n\nJam Operasional:\n• Senin-Sabtu: 08.00 - 20.00\n• Minggu: 08.00 - 18.00\n\n📍 Lokasi: Jl. Contoh No. 123\n📞 WA: 0812-3456-7890',
      autoReply: true
    },
    '#promo': {
      name: 'Promo',
      template: '🎉 *PROMO HARI INI*\n\n• Beli 3 gratis 1\n• Diskon 10% min. pembelian Rp 50.000\n• Free ongkir area dalam kota\n\nBerlaku sampai akhir bulan!',
      autoReply: true
    },
    '#stok': {
      name: 'Stok',
      template: '📦 *CEK STOK*\n\nSilakan sebutkan nama roti yang ingin Anda cek stoknya.\n\nContoh: "stok croissant"',
      autoReply: true
    }
  }
};

// Helper: baca templates
function readTemplates() {
  if (existsSync(TEMPLATES_FILE)) {
    try {
      const data = readFileSync(TEMPLATES_FILE, 'utf8');
      return { ...defaultTemplates, ...JSON.parse(data) };
    } catch (e) {
      return { ...defaultTemplates };
    }
  }
  return { ...defaultTemplates };
}

// Helper: tulis templates
function writeTemplates(templates) {
  writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2));
}

// GET / - Ambil semua templates (termasuk tags)
router.get('/', (req, res) => {
  const templates = readTemplates();
  res.json(templates);
});

// PUT / - Update semua templates
router.put('/', (req, res) => {
  const templates = readTemplates();
  Object.assign(templates, req.body);
  writeTemplates(templates);
  res.json({ message: 'Templates updated', templates });
});

// ============ TAG TEMPLATES ============

// GET /tags - Ambil semua tag templates
router.get('/tags', (req, res) => {
  const templates = readTemplates();
  res.json(templates.tags || {});
});

// GET /tags/:tag - Ambil template by tag
router.get('/tags/:tag', (req, res) => {
  const templates = readTemplates();
  const tag = req.params.tag.startsWith('#') ? req.params.tag : `#${req.params.tag}`;
  
  if (templates.tags && templates.tags[tag]) {
    res.json(templates.tags[tag]);
  } else {
    res.status(404).json({ error: `Tag ${tag} not found` });
  }
});

// POST /tags - Tambah tag template baru
router.post('/tags', (req, res) => {
  const { tag, name, template, autoReply } = req.body;
  
  if (!tag || !template) {
    return res.status(400).json({ error: 'Tag and template are required' });
  }
  
  const tagKey = tag.startsWith('#') ? tag : `#${tag}`;
  
  const templates = readTemplates();
  if (!templates.tags) {
    templates.tags = {};
  }
  
  templates.tags[tagKey] = {
    name: name || tagKey,
    template,
    autoReply: autoReply !== false
  };
  
  writeTemplates(templates);
  res.json({ message: `Tag ${tagKey} created`, data: templates.tags[tagKey] });
});

// PUT /tags/:tag - Update tag template
router.put('/tags/:tag', (req, res) => {
  const templates = readTemplates();
  const tag = req.params.tag.startsWith('#') ? req.params.tag : `#${req.params.tag}`;
  
  if (!templates.tags || !templates.tags[tag]) {
    return res.status(404).json({ error: `Tag ${tag} not found` });
  }
  
  const { name, template, autoReply } = req.body;
  
  if (name !== undefined) templates.tags[tag].name = name;
  if (template !== undefined) templates.tags[tag].template = template;
  if (autoReply !== undefined) templates.tags[tag].autoReply = autoReply;
  
  writeTemplates(templates);
  res.json({ message: `Tag ${tag} updated`, data: templates.tags[tag] });
});

// DELETE /tags/:tag - Hapus tag template
router.delete('/tags/:tag', (req, res) => {
  const templates = readTemplates();
  const tag = req.params.tag.startsWith('#') ? req.params.tag : `#${req.params.tag}`;
  
  if (!templates.tags || !templates.tags[tag]) {
    return res.status(404).json({ error: `Tag ${tag} not found` });
  }
  
  delete templates.tags[tag];
  writeTemplates(templates);
  res.json({ message: `Tag ${tag} deleted` });
});

export default router;
