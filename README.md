# Aurum CS Bot

WhatsApp Customer Service Bot untuk toko roti, powered by AI.

## Apa itu?

Bot WhatsApp yang otomatis membalas pesan pelanggan dengan:
- Menu produk lengkap dengan harga & foto
- Detail produk saat pelanggan ketik nama roti
- Respon AI untuk pertanyaan umum
- Admin panel untuk kelola semua dari browser

## Fitur

- Auto-reply dengan AI (Qwen2.5-1.5B via Ollama)
- Menu produk dengan foto (upload JPG/PNG atau URL)
- Admin Panel (akses dari HP & PC)
- Pesan sambutan otomatis
- Support Termux/Android

## Tech Stack

- WhatsApp: Baileys
- AI: Qwen2.5-1.5B via Ollama
- Database: SQLite
- Admin Panel: Express.js

---

## Tutorial Lengkap

### Langkah 1: Install Termux

Download dan install Termux dari F-Droid (bukan Play Store):
https://f-droid.org/en/packages/com.termux/

### Langkah 2: Setup Termux

Buka Termux dan jalankan:
```bash
pkg update && pkg upgrade -y
pkg install git nodejs-lts npm curl -y
```

### Langkah 3: Clone Bot

```bash
git clone https://github.com/aurum-lab/aurum-cs-bot.git
cd aurum-cs-bot
```

### Langkah 4: Install Bot

```bash
bash install.sh
```

Tunggu sampai selesai (~1 menit).

### Langkah 5: Install Ollama (AI Engine)

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

Tunggu sampai selesai (~2-3 menit).

### Langkah 6: Download Model AI

```bash
ollama pull qwen2.5:1.5b
```

Tunggu sampai selesai (~5-10 menit, tergantung koneksi).

### Langkah 7: Jalankan Bot

```bash
npm start
```

Scan QR Code dengan WhatsApp:
1. Buka WhatsApp di HP
2. Ketuk **Titik Tiga** > **Linked Devices** > **Link a Device**
3. Scan QR Code yang muncul di Termux

Bot sekarang sudah jalan! Pelanggan yang chat akan dibalas otomatis.

---

## Commands WhatsApp

| Command | Fungsi | Contoh |
|---------|--------|--------|
| `halo` | Sambutan + Menu | Ketik: halo |
| `menu` | Lihat daftar produk | Ketik: menu |
| `[nama produk]` | Lihat detail produk | Ketik: croissant |
| `bantuan` | Bantuan | Ketik: bantuan |

---

## Admin Panel

Admin Panel untuk kelola produk, template, dan melihat log.

### Jalankan Admin Panel

```bash
npm run admin
```

Buka browser di HP/PC, akses: `http://localhost:2020`

### Fitur Admin Panel

| Menu | Fungsi |
|------|--------|
| Dashboard | Status bot, koneksi WhatsApp |
| Produk | Tambah/edit/hapus produk, upload foto |
| Template | Edit pesan sambutan & offline |
| Setting | Konfigurasi bot |
| Log | Riwayat percakapan |

### Upload Produk

**Via URL:**
1. Buka Admin Panel > Produk
2. Klik "+ Tambah"
3. Isi nama, harga, kategori
4. Paste URL foto
5. Simpan

**Via File JPG/PNG:**
1. Buka Admin Panel > Produk
2. Klik "+ Tambah"
3. Isi nama, harga, kategori
4. Klik "Pilih File" > pilih foto
5. Simpan

---

## Konfigurasi

Edit `config.js` untuk ganti pengaturan:

```javascript
export default {
  ollama: {
    url: 'http://127.0.0.1:11434',
    model: 'qwen2.5:1.5b'
  },
  bot: {
    name: 'RotiBot',  // Nama bot
    adminNumber: '6281234567890@s.whatsapp.net'  // Nomor WA admin
  }
}
```

**Ganti `adminNumber`** dengan nomor WhatsApp Anda (format: 628xxx@s.whatsapp.net).

---

## Troubleshooting

### Bot tidak jalan
```bash
# Hapus session lama, lalu jalankan ulang
rm -rf data/whatsapp-session
npm start
```

### Ollama tidak jalan
```bash
# Jalankan Ollama
ollama serve &
```

### Model belum ada
```bash
# Cek model
ollama list

# Download model
ollama pull qwen2.5:1.5b
```

### Error lain
```bash
# Install ulang dependencies
rm -rf node_modules
npm install
npm start
```

---

## Script Commands

| Command | Fungsi |
|---------|--------|
| `npm start` | Jalankan Ollama + Bot |
| `npm run start:bot` | Jalankan Bot saja |
| `npm run admin` | Jalankan Admin Panel |
| `npm run setup` | Setup/reset database |
| `bash install.sh` | Install dari awal |

---

## License

MIT
