# Aurum CS Bot - WhatsApp CS Agent untuk Toko Roti

WhatsApp Customer Service Agent untuk toko roti, powered by Aurum Brain AI.

## Fitur

- 🤖 Auto-reply dengan AI (Aurum Brain)
- 📋 Menu produk lengkap dengan harga & foto
- 💬 Forward inquiry ke CS asli
- 🖼️ Tampilkan foto produk
- ⚙️ Admin Panel untuk kelola bot

## Tech Stack

- **WhatsApp**: Baileys (support Termux/Android)
- **AI**: Aurum Brain (Qwen2.5-3B) via Ollama
- **Database**: SQLite (sql.js)
- **Admin Panel**: Express.js + HTML/CSS

## Setup

### 1. Install Ollama + Aurum Brain

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Download Aurum Brain model
ollama pull aurum-brain
```

### 2. Install Dependencies

```bash
git clone https://github.com/aurum-lab/aurum-cs-bot.git
cd aurum-cs-bot
npm install
```

### 3. Setup Database

```bash
npm run setup
```

### 4. Run WhatsApp Bot

```bash
npm start
```

Scan QR Code dengan WhatsApp.

### 5. Run Admin Panel

```bash
npm run admin
```

Buka http://localhost:2020 di browser.

## Commands WhatsApp

| Command | Fungsi |
|---------|--------|
| `menu` | Lihat daftar roti |
| `[nama roti]` | Lihat detail & foto |
| `bantuan` | Bantuan |

## Admin Panel

Akses: http://localhost:2020

| Menu | Fungsi |
|------|--------|
| Dashboard | Statistik bot |
| Produk | CRUD produk |
| Template | Edit pesan |
| Setting | Konfigurasi bot |
| Log | Riwayat percakapan |

## Configuration

Edit `config.js` atau via Admin Panel:

- Nomor admin WhatsApp
- URL Ollama server
- Model AI

## License

MIT
