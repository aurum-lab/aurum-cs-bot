# Aurum CS Bot

WhatsApp Customer Service Bot untuk toko roti.

## Apa itu?

Bot WhatsApp yang otomatis membalas pesan pelanggan dengan:
- Menu produk lengkap dengan harga & foto
- Detail produk saat pelanggan ketik nama roti
- Template tag obrolan (auto-reply berdasarkan tag: #order, #komplain, dll)
- Admin panel untuk kelola semua dari browser

## Fitur

- Auto-reply pesan pelanggan
- Template tag obrolan yang bisa di-setting
- Menu produk dengan foto (upload JPG/PNG atau URL)
- Admin Panel (akses dari HP & PC)
- Backup & Restore data
- Support Termux/Android

## Tech Stack

- WhatsApp: Baileys
- Database: SQLite
- Admin Panel: Express.js

---

## Tutorial Install (Termux)

### Langkah 1: Install Termux

Download Termux dari F-Droid: https://f-droid.org/en/packages/com.termux/

### Langkah 2: Setup Termux

```bash
pkg update && pkg upgrade -y
pkg install git nodejs-lts npm -y
```

Cek apakah sudah terinstall:
```bash
node -v
npm -v
```

Jika muncul versi (misal `v18.x.x`), berarti sudah benar.

### Langkah 3: Clone & Install Bot

```bash
git clone https://github.com/aurum-lab/aurum-cs-bot.git
cd aurum-cs-bot
bash install.sh
```

### Langkah 4: Jalankan Bot

```bash
npm start
```

Scan QR Code:
1. Buka WhatsApp > Titik Tiga > Linked Devices > Link a Device
2. Scan QR Code di Termux

**Selesai!** Bot sudah jalan.

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
| `npm start` | Jalankan bot |
| `npm run admin` | Jalankan Admin Panel |
| `npm run setup` | Setup database |
| `npm run backup` | Backup data |
| `npm run restore` | Restore data |
| `bash install.sh` | Install dari awal |

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

**Error lain:**
```bash
rm -rf node_modules
npm install
npm start
```

---

## License

MIT
