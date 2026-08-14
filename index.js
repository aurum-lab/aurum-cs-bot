import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import config from './config.js';
import { chatWithAI, checkOllamaConnection } from './ai.js';
import {
  getAllProducts,
  getProductById,
  saveConversation,
  getConversationHistory
} from './products.js';

// Initialize WhatsApp Client
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: config.whatsapp.sessionDir
  }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// Generate menu text
function generateMenu() {
  const products = getAllProducts();
  let menu = '🍞 *MENU TOKO ROTI*\n\n';

  const categories = [...new Set(products.map(p => p.category))];

  for (const category of categories) {
    menu += `*${category}*\n`;
    const categoryProducts = products.filter(p => p.category === category);
    for (const product of categoryProducts) {
      menu += `• ${product.name} - Rp ${product.price.toLocaleString('id-ID')}\n`;
    }
    menu += '\n';
  }

  menu += 'Ketik *[nama roti]* untuk lihat detail & foto\n';
  menu += 'Contoh: *croissant*';

  return menu;
}

// Handle incoming messages
client.on('message', async (message) => {
  const chat = await message.getChat();
  const contact = await message.getContact();
  const phone = message.from;
  const text = message.body.toLowerCase().trim();

  console.log(`[${new Date().toISOString()}] ${contact.pushname}: ${text}`);

  // Skip group messages
  if (chat.isGroup) return;

  try {
    let response = '';

    // Command handling
    if (text === 'menu' || text === 'halo' || text === 'hi') {
      response = generateMenu();
    }
    else if (text === 'bantuan' || text === 'help') {
      response = `📖 *BANTUAN*\n\n` +
        `• *menu* - Lihat daftar roti\n` +
        `• *[nama roti]* - Lihat detail & foto\n` +
        `• *bantuan* - Tampilkan bantuan ini\n\n` +
        `Ada yang ingin ditanyakan? Langsung ketik saja!`;
    }
    else {
      // Check if it's a product name
      const products = getAllProducts();
      const product = products.find(p => 
        p.name.toLowerCase() === text || 
        p.name.toLowerCase().includes(text)
      );

      if (product) {
        // Send product image if available
        if (product.image_url) {
          try {
            const media = await MessageMedia.fromUrl(product.image_url);
            await client.sendMessage(phone, media);
          } catch (err) {
            console.log('Failed to send image:', err.message);
          }
        }
        
        response = ` bakery_*${product.name.toUpperCase()}*\n\n` +
          `Harga: Rp ${product.price.toLocaleString('id-ID')}\n` +
          `Kategori: ${product.category}\n` +
          `Deskripsi: ${product.description || '-'}\n\n` +
          `Tertarik? Ketik *pesan* atau langsung chat admin kami!`;
      }
      else {
        // Use AI for other messages
        const history = getConversationHistory(phone, 5);
        const conversationHistory = history.flatMap(h => [
          { role: 'user', content: h.message },
          { role: 'assistant', content: h.response }
        ]);

        response = await chatWithAI(message.body, conversationHistory);
      }
    }

    // Send response
    await message.reply(response);

    // Save conversation
    saveConversation(phone, contact.pushname, message.body, response, 1);

    // Forward to admin CS
    const forwardMsg = `💬 *INQUIRY*\n\n` +
      `Dari: ${contact.pushname}\n` +
      `No: ${phone}\n` +
      `Pesan: ${message.body}\n\n` +
      `Balas pesan ini untuk follow up.`;
    
    try {
      await client.sendMessage(config.bot.adminNumber, forwardMsg);
    } catch (err) {
      console.log('Failed to forward to admin:', err.message);
    }

  } catch (error) {
    console.error('Error handling message:', error);
    await message.reply('Maaf, terjadi kesalahan. Silakan coba lagi.');
  }
});

// QR Code
client.on('qr', (qr) => {
  console.log('\nScan QR Code ini dengan WhatsApp:\n');
  qrcode.generate(qr, { small: true });
});

// Ready
client.on('ready', async () => {
  console.log('✅ WhatsApp Bot Ready!');
  console.log('🤖 Bot akan merespon pesanan dan meneruskan ke CS.');
});

// Authentication
client.on('authenticated', () => {
  console.log('✅ WhatsApp Authenticated');
});

client.on('auth_failure', (msg) => {
  console.error('❌ Authentication Failed:', msg);
});

// Start client
console.log('🚀 Starting WhatsApp Bot...');
client.initialize();
