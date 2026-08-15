# Aurum CS Bot

WhatsApp Customer Service Bot untuk toko roti.

## Apa itu?

Bot WhatsApp yang otomatis membalas pesan pelanggan dengan:
- Menu produk lengkap dengan harga & foto
- Detail produk saat pelanggan ketik nama roti
- Template tag obrolan (auto-reply berdasarkan tag: #order, #komplain, dll)
- Admin panel untuk kelola semua dari browser

## Fitur

- ✅ Auto-reply pesan pelanggan
- ✅ Template tag obrolan yang bisa di-setting
- ✅ Menu produk dengan foto (upload JPG/PNG atau URL)
- ✅ Admin Panel (akses dari HP & PC)
- ✅ Backup & Restore data
- ✅ Support Termux/Android
- ✅ **Ollama/AI bersifat OPTIONAL** - Bot tetap jalan tanpa AI

## Tech Stack

- WhatsApp: Baileys
- Database: SQLite
- Admin Panel: Express.js
- AI (opsional): Ollama + Qwen2.5

---

## Tutorial Install (Termux)

### Langkah 1: Install Termux

Download Termux dari F-Droid: https://f-droid.org/en/packages/com.termux/

> ⚠️ Jangan download dari Play Store (versi disana sudah outdated)

### Langkah 2: Update Termux

Buka Termux, lalu jalankan:
```bash
pkg update && pkg upgrade -y
```

### Langkah 3: Install Git

```bash
pkg install git -y
```

Cek: `git --version`

### Langkah 4: Install Node.js

```bash
pkg install nodejs-lts -y
```

Cek: `node -v`

### Langkah 5: Install npm

```bash
pkg install npm -y
```

Cek: `npm -v`

### Langkah 6: Clone Repository

```bash
git clone https://github.com/aurum-lab/aurum-cs-bot.git
```

### Langkah 7: Masuk Folder Bot

```bash
cd aurum-cs-bot
```

### Langkah 8: Install Dependencies

```bash
npm install
```

### Langkah 9: Setup Database

```bash
npm run setup
```

### Langkah 10: Jalankan Admin Panel

```bash
npm run admin
```

Buka di browser: `http://localhost:2020`

### Langkah 11: Scan QR Code (dari Admin Panel)

1. Buka Dashboard di admin panel
2. Klik **Connect WhatsApp**
3. Scan QR Code dengan WhatsApp

**Selesai!** Bot sudah jalan.

---

### Jalankan Bot (Opsional)

Jika ingin jalankan bot tanpa admin panel:

```bash
npm start
```

> ⚠️ `npm start` dan `npm run admin` tidak bisa jalan bersamaan di port yang sama.

---

## Install AI (Opsional)

Bot tetap jalan tanpa AI. Jika ingin fitur AI (chat lebih pintar):

### 1. Install Ollama

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### 2. Download Model

```bash
ollama pull qwen2.5:1.5b
```

### 3. Aktifkan di Config

Edit `config.js`, uncomment bagian ollama:

```javascript
ollama: {
  url: 'http://127.0.0.1:11434',
  model: 'qwen2.5:1.5b',
  temperature: 0.7,
  maxTokens: 2048
},
```

### 4. Restart Bot

```bash
npm start
```

---

## Commands WhatsApp

| Command | Fungsi |
|---------|--------|
| `halo` | Sambutan + Menu |
| `menu` | Lihat daftar produk |
| `[nama produk]` | Lihat detail produk |
| `bantuan` | Bantuan |

### Tag Obrolan (Auto-Reply)

| Tag | Fungsi |
|-----|--------|
| `#order` | Template pemesanan |
| `#komplain` | Template keluhan |
| `#info` | Informasi toko |
| `#promo` | Promo terbaru |
| `#stok` | Cek stok |

Contoh: Pelanggan ketik "mau #order" → Bot otomatis kirim template order

---

## Admin Panel

```bash
npm run admin
```

Buka: `http://localhost:2020`

### Fitur Admin Panel

| Menu | Fungsi |
|------|--------|
| Dashboard | Status bot, koneksi WhatsApp |
| Produk | Tambah/edit/hapus produk, upload foto |
| Template | Edit pesan sambutan + tag obrolan |
| Setting | Konfigurasi bot + Backup/Restore |
| Log | Riwayat percakapan |

---

## Backup & Restore

### Via Admin Panel
Buka **Setting** → **Backup & Restore**
- **Download Backup** - Download file backup
- **Restore Backup** - Upload file untuk restore

### Via Terminal

```bash
# Backup
npm run backup

# Restore
npm run restore backup-file.tar.gz
```

---

## Script Commands

| Command | Fungsi |
|---------|--------|
| `npm run admin` | Jalankan Admin Panel (rekomendasi) |
| `npm start` | Jalankan bot tanpa admin panel |
| `npm run setup` | Setup database |
| `npm run backup` | Backup data |
| `npm run restore` | Restore data |
| `bash install.sh` | Install dari awal |

> 💡 **Disarankan pakai `npm run admin`** karena bisa kelola bot dari browser.

---

## Troubleshooting

**Node.js/npm tidak terinstall:**
```bash
pkg install nodejs-lts npm -y
```

**Permission error:**
```bash
chmod +x *.sh
```

**Bot tidak jalan:**
```bash
rm -rf data/whatsapp-session
npm start
```

**Admin panel error:**
```bash
npm run admin
```
Jika error, coba:
```bash
rm -rf node_modules
npm install
npm run admin
```

**Error lain:**
```bash
rm -rf node_modules
npm install
npm start
```

**Ollama tidak terinstall?**
Tidak masalah! Bot tetap jalan tanpa AI. Lihat bagian "Install AI (Opsional)" jika ingin menambahkan fitur AI.

---

## License

MIT
