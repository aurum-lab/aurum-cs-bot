// Configuration
export default {
  // Ollama Settings (OPTIONAL - bot works without AI)
  // Uncomment and configure if you have Ollama installed
  // ollama: {
  //   url: 'http://127.0.0.1:11434',
  //   model: 'qwen2.5:1.5b',
  //   temperature: 0.7,
  //   maxTokens: 2048
  // },

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
    welcomeMessage: 'Halo! 👋 Selamat datang di Toko Roti kami!\n\nKetik *menu* untuk lihat daftar roti',
    offlineMessage: 'Maaf, admin sedang offline.',
    adminNumber: '6281234567890@s.whatsapp.net' // Ganti dengan nomor WA admin
  }
}
