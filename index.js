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
  let menu = '🍜 *MENU TOKO ROTI*\n\n';

  const categories = [...new Set(products.map(p => p.category))];

  for (const category of categories) {
    menu += `*${category}*\n`;
    const categoryProducts = products.filter(p => p.category === category);
    for (const product of categoryProducts) {
      menu += `• ${product.name} - Rp ${product.price.toLocaleString('id-ID')}\n`;
      if (product.description) {
        menu += `  ${product.description}\n`;
      }
    }
    menu += '\n';
  }

  menu += 'Ketik *order [nama roti]* untuk pesan\n';
  menu += 'Contoh: *order croissant*';

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
        `• *menu* - Lihat daftar roti\n` +
        `• *order [nama]* - Pesan roti\n` +
        `• *cek* - Cek status pesanan\n` +
        `• *keranjang* - Lihat keranjang\n` +
        `• *bayar* - Bayar pesanan\n` +
        `• *bantuan* - Tampilkan bantuan ini`;
    }
    else if (text === 'cek') {
      const orders = getCustomerOrders(phone);
      if (orders.length === 0) {
        response = 'Anda belum memiliki pesanan.';
      } else {
        response = '📦 *PESANAN ANDA*\n\n';
        for (const order of orders) {
          response += `#${order.id} - ${order.product_name}\n`;
          response += `Status: ${order.status}\n`;
          response += `Total: Rp ${order.total_price.toLocaleString('id-ID')}\n\n`;
        }
      }
    }
    else if (text.startsWith('order ')) {
      const productName = text.replace('order ', '');
      const products = getAllProducts();
      const product = products.find(p => 
        p.name.toLowerCase().includes(productName)
      );

      if (!product) {
        response = `❌ Roti "${productName}" tidak ditemukan.\nKetik *menu* untuk melihat daftar roti.`;
      } else if (product.stock <= 0) {
        response = `❌ Maaf, ${product.name} sedang habis.`;
      } else {
        // Create order
        const order = createOrder(phone, contact.pushname, product.id, 1, product.price);
        response = `✅ *PESanan Dibuat!*\n\n` +
          `Roti: ${product.name}\n` +
          `Harga: Rp ${product.price.toLocaleString('id-ID')}\n` +
          `Order ID: #${order.lastInsertRowid}\n\n` +
          `Ketik *bayar* untuk melanjutkan pembayaran.`;
      }
    }
    else if (text === 'bayar') {
      const orders = getCustomerOrders(phone);
      const pendingOrders = orders.filter(o => o.status === 'pending');

      if (pendingOrders.length === 0) {
        response = 'Tidak ada pesanan yang perlu dibayar.';
      } else {
        const total = pendingOrders.reduce((sum, o) => sum + o.total_price, 0);
        response = `💰 *PEMBAYARAN*\n\n` +
          `Pesanan: ${pendingOrders.length} item\n` +
          `Total: Rp ${total.toLocaleString('id-ID')}\n\n` +
          `Silakan transfer ke:\n` +
          `BCA: 1234567890\n` +
          `A/N: Toko Roti\n\n` +
          `Kirim bukti transfer ke admin untuk konfirmasi.`;

        // Update status
        for (const order of pendingOrders) {
          updateOrderStatus(order.id, 'waiting_payment');
        }
      }
    }
    else if (text === 'keranjang') {
      const orders = getCustomerOrders(phone);
      const pendingOrders = orders.filter(o => o.status === 'pending');

      if (pendingOrders.length === 0) {
        response = 'Keranjang kosong.';
      } else {
        response = '🛒 *KERANJANG*\n\n';
        for (const order of pendingOrders) {
          response += `• ${order.product_name} x${order.quantity} - Rp ${order.total_price.toLocaleString('id-ID')}\n`;
        }
        const total = pendingOrders.reduce((sum, o) => sum + o.total_price, 0);
        response += `\nTotal: Rp ${total.toLocaleString('id-ID')}`;
        response += `\n\nKetik *bayar* untuk checkout`;
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

    // Send response
    await message.reply(response);

    // Save conversation
    saveConversation(phone, message.body, response);

    // Clear state
    conversationStates.delete(phone);

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
