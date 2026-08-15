# Aurum CS Bot - WhatsApp CS Agent untuk Toko Roti

WhatsApp Customer Service Agent untuk toko roti, powered by AI.

## Fitur

- Auto-reply dengan AI (Qwen2.5 via Ollama)
- Menu produk lengkap dengan harga & foto
- Forward inquiry ke CS asli
- Tampilkan foto produk (via URL atau upload JPG)
- Admin Panel untuk kelola bot
- Pesan sambutan otomatis saat chat pertama

## Tech Stack

- **WhatsApp**: Baileys (support Termux/Android)
- **AI**: Qwen2.5-1.5B via Ollama
- **Database**: SQLite (sql.js)
- **Admin Panel**: Express.js + HTML/CSS

## Setup di Termux (Android)

### Cara Cepat (Recommended)

```bash
# Clone repo
git clone https://github.com/aurum-lab/aurum-cs-bot.git
cd aurum-cs-bot

# Install semua (Ollama + Model + Bot)
bash install.sh
```

### Cara Manual

#### 1. Install Ollama

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

#### 2. Download Model AI

```bash
ollama pull qwen2.5:1.5b
```

#### 3. Clone & Install Bot

```bash
git clone https://github.com/aurum-lab/aurum-cs-bot.git
cd aurum-cs-bot
npm install
npm run setup
```

### Jalankan Bot

```bash
# Otomatis start Ollama + Bot
npm start

# ATAU manual (2 tab terminal)
# Tab 1: ollama serve
# Tab 2: npm run start:bot
```

Scan QR Code dengan WhatsApp:
1. Buka WhatsApp di HP
2. Settings > Linked Devices > Link a Device
3. Scan QR Code yang muncul di terminal

### Jalankan Admin Panel (Optional)

```bash
npm run admin
```

Buka `http://localhost:2020` di browser.

## Commands WhatsApp

| Command | Fungsi |
|---------|--------|
| `halo` / `hi` | Sambutan + Menu |
| `menu` | Lihat daftar roti |
| `[nama roti]` | Lihat detail & foto |
| `bantuan` | Bantuan |

## Admin Panel

Akses: `http://localhost:2020`

| Menu | Fungsi |
|------|--------|
| Dashboard | Statistik bot, koneksi WhatsApp |
| Produk | Tambah/edit/hapus produk |
| Template | Edit pesan sambutan & offline |
| Setting | Konfigurasi bot |
| Log | Riwayat percakapan |

## Upload Produk dengan Foto

### Via URL
1. Buka Admin Panel > Produk
2. Klik "+ Tambah"
3. Isi data produk (nama, harga, kategori)
4. Paste URL foto di field **URL Foto**
5. Klik Simpan

### Via File JPG/PNG
1. Buka Admin Panel > Produk
2. Klik "+ Tambah"
3. Isi data produk (nama, harga, kategori)
4. Klik **Pilih File** di field **Upload Foto**
5. Pilih foto dari galeri HP
6. Klik Simpan

## Konfigurasi

Edit `config.js` untuk pengaturan bot:

```javascript
export default {
  ollama: {
    url: 'http://127.0.0.1:11434',
    model: 'qwen2.5:1.5b'
  },
  bot: {
    name: 'RotiBot',
    adminNumber: '6281234567890@s.whatsapp.net' // Ganti nomor admin
  }
}
```

## Troubleshooting

### Ollama tidak jalan
```bash
# Cek apakah Ollama running
pgrep ollama

# Jika tidak, jalankan ulang
ollama serve &
```

### Bot tidak connect
```bash
# Hapus session lama
rm -rf data/whatsapp-session

# Jalankan ulang
npm start
```

### Model belum terinstall
```bash
# Cek model yang ada
ollama list

# Jika qwen2.5:1.5b belum ada
ollama pull qwen2.5:1.5b
```

### Error "Cannot find module"
```bash
# Install ulang dependencies
rm -rf node_modules
npm install
```

## License

MIT
