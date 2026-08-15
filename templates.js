import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEMPLATES_FILE = join(__dirname, 'data/templates.json');

const defaultTemplates = {
  welcome: 'Halo! 👋 Selamat datang di Toko Roti kami!\n\nKetik *menu* untuk lihat daftar roti\nKetik *[nama roti]* untuk lihat detail & foto',
  offline: 'Maaf, admin sedang offline. Pesan anda akan kami balas segera.',
  systemPrompt: 'Kamu adalah asisten customer service untuk toko roti. Tugasmu adalah membantu pelanggan dengan menampilkan menu dan harga roti. Gunakan Bahasa Indonesia yang sopan dan ramah.',
  
  // Tag-based templates - bisa ditambah/diubah via admin
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

let cachedTemplates = null;

export function getTemplates() {
  if (existsSync(TEMPLATES_FILE)) {
    try {
      const data = readFileSync(TEMPLATES_FILE, 'utf8');
      const parsed = JSON.parse(data);
      cachedTemplates = { ...defaultTemplates, ...parsed };
      // Pastikan tags ada
      if (!cachedTemplates.tags) {
        cachedTemplates.tags = defaultTemplates.tags;
      }
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

// Detect tag dari pesan
export function detectTag(text) {
  const textLower = text.toLowerCase().trim();
  
  // Cari tag yang cocok (misal: #order, #komplain)
  for (const tag of Object.keys(cachedTemplates?.tags || {})) {
    if (textLower.includes(tag.toLowerCase())) {
      return tag;
    }
  }
  
  // Keyword detection untuk tag
  const keywordMap = {
    '#order': ['order', 'pesan', 'beli', 'mau pesan', 'orderan'],
    '#komplain': ['komplain', 'keluhan', 'rusak', 'tidak puas', 'kecewa', 'buruk'],
    '#info': ['info', 'informasi', 'jam buka', 'lokasi', 'alamat', 'buka jam'],
    '#promo': ['promo', 'diskon', 'potongan', 'gratis', 'murah'],
    '#stok': ['stok', 'stock', 'ada tidak', 'tersedia', 'habis']
  };
  
  for (const [tag, keywords] of Object.entries(keywordMap)) {
    if (keywords.some(kw => textLower.includes(kw))) {
      return tag;
    }
  }
  
  return null;
}

// Get template by tag
export function getTemplateByTag(tag) {
  const templates = getTemplates();
  if (tag && templates.tags && templates.tags[tag]) {
    return templates.tags[tag];
  }
  return null;
}

export default { getTemplates, reloadTemplates, detectTag, getTemplateByTag };
