import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import config from './config.js';
import { chatWithAI, checkOllamaConnection } from './ai.js';
import {
  getAllProducts,
  getProductById,
  createOrder,
  getCustomerOrders,
  getOrderById,
  updateOrderStatus,
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

// Store conversation states
const conversationStates = new Map();

// Generate menu text
function generateMenu() {
  const products = getAllProducts();
  let menu = '🍞 *MENU TOKO ROTI*\n\n';

  const categories = [...new Set(products.map(p => p.category))];

  for (const category of categories) {
    menu += `*${category}*\n`;
    const categoryProducts = products.filter(p => p.category === category);
    for (const product of categoryProducts) {
      const stok = product.stock > 0 ? `✅ Stok: ${product.stock}` : '❌ Habis';
      menu += `• ${product.name} - Rp ${product.price.toLocaleString('id-ID')} (${stok})\n`;
    }
    menu += '\n';
  }

  menu += 'Ketik *[nama roti]* untuk cek stok & pesan\n';
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

  // Get conversation state
  const state = conversationStates.get(phone) || { step: 'idle', data: {} };

  try {
    // Check Ollama connection first
    const ollamaStatus = await checkOllamaConnection();
    if (!ollamaStatus.connected) {
      await message.reply(config.bot.offlineMessage);
      return;
    }

    let response = '';

    // Command handling
    if (text === 'menu' || text === 'halo' || text === 'hi') {
      response = generateMenu();
    }
    else if (text === 'bantuan' || text === 'help') {
      response = `📖 *BANTUAN*\n\n` +
        `• *menu* - Lihat daftar roti & stok\n` +
        `• *[nama roti]* - Cek stok & pesan\n` +
        `• *cek* - Cek status pesanan\n` +
        `• *bantuan* - Tampilkan bantuan ini`;
    }
    else if (text === 'cek') {
      const orders = getCustomerOrders(phone);
      if (orders.length === 0) {
        response = 'Anda belum memiliki pesanan.';
      } else {
        response = '📦 *PESANAN ANDA*\n\n';
        for (const order of orders) {
          response += `#${order.id} - ${order.product_name} x${order.quantity}\n`;
          response += `Status: ${order.status}\n`;
          response += `Total: Rp ${order.total_price.toLocaleString('id-ID')}\n\n`;
        }
      }
    }
    // Handle product inquiry (just the product name)
    else {
      // Check if it's a product name
      const products = getAllProducts();
      const product = products.find(p => 
        p.name.toLowerCase() === text || 
        p.name.toLowerCase().includes(text)
      );

      if (product) {
        if (product.stock > 0) {
          response = `✅ *${product.name.toUpperCase()}*\n\n` +
            `Harga: Rp ${product.price.toLocaleString('id-ID')}\n` +
            `Stok: ${product.stock} tersedia\n` +
            `Deskripsi: ${product.description || '-'}\n\n` +
            `Mau pesan? Ketik: *pesan ${product.name} [jumlah]*\n` +
            `Contoh: *pesan ${product.name} 3*`;
          
          // Set state for ordering
          conversationStates.set(phone, {
            step: 'waiting_quantity',
            data: { productId: product.id, productName: product.name, price: product.price }
          });
        } else {
          response = `❌ Maaf, *${product.name}* sedang habis.\n\nKetik *menu* untuk lihat roti lain.`;
        }
      }
      // Check if user is ordering
      else if (text.startsWith('pesan ')) {
        const parts = text.replace('pesan ', '').split(' ');
        const productName = parts[0];
        const quantity = parseInt(parts[1]) || 1;

        const product = products.find(p => 
          p.name.toLowerCase().includes(productName)
        );

        if (!product) {
          response = `❌ Roti "${productName}" tidak ditemukan.\nKetik *menu* untuk melihat daftar.`;
        } else if (product.stock <= 0) {
          response = `❌ Maaf, ${product.name} sedang habis.`;
        } else if (quantity > product.stock) {
          response = `❌ Stok ${product.name} hanya ${product.stock}.\nMau pesan berapa?`;
        } else {
          const total = product.price * quantity;
          const order = createOrder(phone, contact.pushname, product.id, quantity, total);
          response = `✅ *PESanan Dibuat!*\n\n` +
            `Roti: ${product.name}\n` +
            `Jumlah: ${quantity}\n` +
            `Harga: Rp ${product.price.toLocaleString('id-ID')} x ${quantity}\n` +
            `Total: Rp ${total.toLocaleString('id-ID')}\n` +
            `Order ID: #${order.lastInsertRowid}\n\n` +
            `Untuk pembayaran, silakan hubungi admin.`;
        }
      }
      // Check conversation state
      else if (state.step === 'waiting_quantity') {
        const quantity = parseInt(text) || 1;
        const product = products.find(p => p.id === state.data.productId);

        if (product) {
          if (quantity > product.stock) {
            response = `❌ Stok hanya ${product.stock}. Mau pesan berapa?`;
          } else {
            const total = product.price * quantity;
            const order = createOrder(phone, contact.pushname, product.id, quantity, total);
            response = `✅ *PESanan Dibuat!*\n\n` +
              `Roti: ${product.name}\n` +
              `Jumlah: ${quantity}\n` +
              `Total: Rp ${total.toLocaleString('id-ID')}\n` +
              `Order ID: #${order.lastInsertRowid}\n\n` +
              `Untuk pembayaran, silakan hubungi admin.`;
            conversationStates.delete(phone);
          }
        }
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
    saveConversation(phone, message.body, response);

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

  // Check Ollama
  const ollamaStatus = await checkOllamaConnection();
  if (ollamaStatus.connected) {
    console.log(`✅ Ollama Connected - Models: ${ollamaStatus.models.join(', ')}`);
  } else {
    console.log('❌ Ollama Not Connected!');
  }
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
