// Configuration
export default {
  // Ollama Settings
  ollama: {
    url: 'http://localhost:11434',
    model: 'aurum-brain',
    temperature: 0.7,
    maxTokens: 2048
  },

  // WhatsApp Settings
  whatsapp: {
    sessionDir: './data/whatsapp-session'
  },

  // Database
  database: {
    path: './data/toko_roti.db'
  },

  // Bot Settings
  bot: {
    name: 'RotiBot',
    welcomeMessage: 'Halo! 👋 Selamat datang di Toko Roti kami!\n\nKetik *menu* untuk lihat daftar roti\nKetik *order* untuk pesan\nKetik *cek* untuk cek status pesanan\nKetik *bantuan* untuk bantuan',
    offlineMessage: 'Maaf, admin sedang offline. Pesan anda akan kami balas segera.',
    adminNumber: '6281234567890@s.whatsapp.net'
  }
}
