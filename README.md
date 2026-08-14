# Aurum CS Bot - WhatsApp CS Agent untuk Toko Roti

WhatsApp Customer Service Agent untuk toko roti, powered by Aurum Brain AI.

## Fitur

- 🤖 Auto-reply dengan AI (Aurum Brain)
- 📋 Menu produk lengkap dengan harga
- 🛒 Sistem pemesanan
- 📦 Cek status pesanan
- 💰 Informasi pembayaran
- 💬 Conversational AI untuk bantuan

## Tech Stack

- **WhatsApp**: whatsapp-web.js
- **AI**: Aurum Brain (Qwen2.5-3B) via Ollama
- **Database**: SQLite
- **Runtime**: Node.js

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
npm install
```

### 3. Setup Database

```bash
npm run setup
```

### 4. Start Bot

```bash
npm start
```

### 5. Scan QR Code

Scan QR Code yang muncul di terminal dengan WhatsApp kamu.

## Commands

| Command | Description |
|---------|-------------|
| `menu` | Lihat daftar roti |
| `order [nama]` | Pesan roti |
| `cek` | Cek status pesanan |
| `keranjang` | Lihat keranjang |
| `bayar` | Bayar pesanan |
| `bantuan` | Bantuan |

## Configuration

Edit `config.js` untuk mengatur:

- URL Ollama server
- Model yang digunakan
- Nomor admin
- Pesan bot

## License

MIT
