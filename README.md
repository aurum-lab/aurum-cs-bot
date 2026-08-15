# Aurum CS Bot - WhatsApp CS Agent untuk Toko Roti

WhatsApp Customer Service Agent untuk toko roti, powered by AI (Qwen2.5 via Ollama).

## Fitur

- Auto-reply dengan AI (Qwen2.5-1.5B via Ollama)
- Menu produk lengkap dengan harga & foto
- Forward inquiry ke CS asli
- Tampilkan foto produk (via URL atau upload JPG/PNG)
- Admin Panel untuk kelola bot (akses dari HP & PC)
- Pesan sambutan otomatis saat chat pertama

## Tech Stack

- **WhatsApp**: Baileys (support Termux/Android)
- **AI**: Qwen2.5-1.5B via Ollama
- **Database**: SQLite (sql.js)
- **Admin Panel**: Express.js + HTML/CSS

## Setup di Termux (Android)

### Cara Cepat - Install Semua Sekaligus (Recommended)

```bash
# Install dependencies
pkg update && pkg install git nodejs-lts npm curl

# Clone repo
git clone https://github.com/aurum-lab/aurum-cs-bot.git
cd aurum-cs-bot

# Install Ollama + Model AI + Bot (otomatis)
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

#### 3. Install Bot
```bash
git clone https://github.com/aurum-lab/aurum-cs-bot.git
cd aurum-cs-bot
npm install
npm run setup
```

## Jalankan Bot

```bash
# Cara mudah - otomatis start Ollama + Bot
npm start
```

Atau manual (2 tab terminal):
```bash
# Tab 1
ollama serve

# Tab 2
npm run start:bot
```

Scan QR Code dengan WhatsApp:
1. Buka WhatsApp di HP
2. Settings > Linked Devices > Link a Device
3. Scan QR Code yang muncul di terminal

## Jalankan Admin Panel

```bash
npm run admin
```

Buka `http://localhost:2020` di browser.

## Commands WhatsApp

| Command | Fungsi |
|---------|--------|
| `halo` / `hi` | Sambutan + Menu |
| `menu` | Lihat daftar roti |
| `[nama roti]` | Lihat detail & foto roti |
| `bantuan` / `help` | Bantuan |

## Admin Panel

Akses: `http://localhost:2020`

| Menu | Fungsi |
|------|--------|
| Dashboard | Statistik bot, koneksi WhatsApp |
| Produk | Tambah/edit/hapus produk, upload foto |
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

## Scripts

| Command | Fungsi |
|---------|--------|
| `npm start` | Jalankan Ollama + Bot |
| `npm run start:bot` | Jalankan Bot saja (Ollama harus running) |
| `npm run admin` | Jalankan Admin Panel |
| `npm run setup` | Setup/reset database |
| `bash install.sh` | Install semua dari awal |

## Troubleshooting

### Ollama tidak jalan
```bash
pgrep ollama
ollama serve &
```

### Bot tidak connect
```bash
rm -rf data/whatsapp-session
npm start
```

### Model belum terinstall
```bash
ollama list
ollama pull qwen2.5:1.5b
```

### Error "Cannot find module"
```bash
rm -rf node_modules
npm install
```

## License

MIT
