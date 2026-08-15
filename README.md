# Aurum CS Bot

WhatsApp Customer Service Bot untuk toko roti, powered by AI.

## Demo

Bot akan otomatis membalas pesan pelanggan dengan:
- Menu produk lengkap dengan harga & foto
- Detail produk saat pelanggan mengetik nama roti
- Respon AI untuk pertanyaan umum

## Fitur

- Auto-reply dengan AI (Qwen2.5-1.5B via Ollama)
- Menu produk dengan foto
- Admin Panel untuk kelola produk & bot
- Upload foto produk (URL atau file JPG/PNG)
- Pesan sambutan otomatis
- Support Termux/Android

## Tech Stack

- WhatsApp: Baileys
- AI: Qwen2.5-1.5B via Ollama
- Database: SQLite
- Admin Panel: Express.js

## Quick Start (Termux)

```bash
# Install dependencies
pkg install git nodejs-lts npm curl

# Clone
git clone https://github.com/aurum-lab/aurum-cs-bot.git
cd aurum-cs-bot

# Install bot
bash install.sh

# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Download model AI
ollama pull qwen2.5:1.5b

# Jalankan bot
npm start
```

## Commands

| Command | Fungsi |
|---------|--------|
| `halo` | Sambutan + Menu |
| `menu` | Lihat daftar produk |
| `[nama produk]` | Lihat detail produk |
| `bantuan` | Bantuan |

## Admin Panel

```bash
npm run admin
```

Buka `http://localhost:2020`

## Konfigurasi

Edit `config.js`:

```javascript
export default {
  ollama: {
    url: 'http://127.0.0.1:11434',
    model: 'qwen2.5:1.5b'
  },
  bot: {
    name: 'RotiBot',
    adminNumber: '628xxx@s.whatsapp.net' // Nomor admin
  }
}
```

## License

MIT
