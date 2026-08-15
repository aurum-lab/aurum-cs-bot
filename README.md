# Aurum CS Bot

WhatsApp Customer Service Bot untuk toko roti.

## Apa itu?

Bot WhatsApp yang otomatis membalas pesan pelanggan dengan:
- Menu produk lengkap dengan harga & foto
- Detail produk saat pelanggan ketik nama roti
- Admin panel untuk kelola semua dari browser

## Fitur

- Auto-reply pesan pelanggan
- Menu produk dengan foto (upload JPG/PNG atau URL)
- Admin Panel (akses dari HP & PC)
- Pesan sambutan otomatis
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
| Template | Edit pesan sambutan |
| Setting | Konfigurasi bot |
| Log | Riwayat percakapan |

### Upload Produk

1. Buka Admin Panel > Produk
2. Klik "+ Tambah"
3. Isi nama, harga, kategori
4. Upload foto (JPG/PNG) atau paste URL
5. Simpan

---

## Konfigurasi

Edit `config.js`:

```javascript
export default {
  bot: {
    name: 'RotiBot',
    adminNumber: '6281234567890@s.whatsapp.net'
  }
}
```

Ganti `adminNumber` dengan nomor WhatsApp Anda.

---

## Script Commands

| Command | Fungsi |
|---------|--------|
| `npm start` | Jalankan bot |
| `npm run admin` | Jalankan Admin Panel |
| `npm run setup` | Setup database |
| `bash install.sh` | Install dari awal |

---

## Troubleshooting

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
