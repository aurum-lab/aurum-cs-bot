import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';
import config from './config.js';

// AI module - optional
let chatWithAI, checkOllamaConnection;
try {
  const aiModule = await import('./ai.js');
  chatWithAI = aiModule.chatWithAI;
  checkOllamaConnection = aiModule.checkOllamaConnection;
} catch (error) {
  console.warn('⚠️  AI module tidak bisa dimuat:', error.message);
  // Fallback functions
  chatWithAI = async (msg) => 'Maaf, AI tidak tersedia. Ketik *menu* untuk lihat daftar produk.';
  checkOllamaConnection = async () => ({ configured: false, connected: false });
}
import {
  getAllProducts,
  getProductById,
  saveConversation,
  getConversationHistory
} from './products.js';
import { initDatabase } from './database.js';
import { getTemplates, detectTag, getTemplateByTag } from './templates.js';
import { mkdirSync, existsSync } from 'fs';

// Ensure session directory exists
mkdirSync(config.whatsapp.sessionDir, { recursive: true });

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

// Start bot
async function startBot() {
  await initDatabase();
  
  const { state, saveCreds } = await useMultiFileAuthState(config.whatsapp.sessionDir);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, undefined),
    },
    printQRInTerminal: false,
    generateHighQualityLinkPreview: false,
  });

  // QR Code
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr) {
      console.log('\nScan QR Code ini dengan WhatsApp:\n');
      qrcode.generate(qr, { small: true });
    }
    
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error instanceof Boom)
        ? lastDisconnect.error.output?.statusCode !== DisconnectReason.loggedOut
        : true;
      
      console.log('Connection closed:', lastDisconnect.error, 'Reconnecting:', shouldReconnect);
      
      if (shouldReconnect) {
        startBot();
      }
    } else if (connection === 'open') {
      console.log('✅ WhatsApp Bot Ready!');
      
      // Check Ollama (optional)
      checkOllamaConnection().then(status => {
        if (status.configured === false) {
          console.log('ℹ️  Mode: Simple (tanpa AI)');
          console.log('💡 Bot tetap jalan dengan response sederhana');
        } else if (status.connected) {
          console.log(`✅ Ollama Connected - Models: ${status.models.join(', ')}`);
          if (status.modelReady === false) {
            console.log(`⚠️  ${status.message}`);
          }
        } else {
          console.log('⚠️  Ollama tidak tersedia, menggunakan mode simple');
        }
      });
    }
  });

  // Save credentials
  sock.ev.on('creds.update', saveCreds);

  // Handle messages
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    
    // Get templates
    const templates = getTemplates();
    
    for (const message of messages) {
      if (message.fromMe) continue;
      if (!message.message) continue;
      
      const phone = message.key.remoteJid;
      const text = message.message.conversation || 
                   message.message.extendedTextMessage?.text || '';
      
      if (!text) continue;
      
      const contactName = message.pushName || 'Unknown';
      const textLower = text.toLowerCase().trim();
      
      console.log(`[${new Date().toISOString()}] ${contactName}: ${text}`);
      
      try {
        let response = '';
        
        // Check if first message from this user
        const history = getConversationHistory(phone, 1);
        const isFirstMessage = history.length === 0;
        
        // Deteksi tag dari pesan
        const detectedTag = detectTag(text);
        const tagTemplate = getTemplateByTag(detectedTag);
        
        // Command handling
        if (textLower === 'menu' || textLower === 'halo' || textLower === 'hi') {
          if (isFirstMessage && (textLower === 'halo' || textLower === 'hi')) {
            // Send welcome + menu
            response = templates.welcome + '\n\n' + generateMenu();
          } else {
            response = generateMenu();
          }
        }
        else if (textLower === 'bantuan' || textLower === 'help') {
          response = `📖 *BANTUAN*\n\n` +
            `• *menu* - Lihat daftar roti\n` +
            `• *[nama roti]* - Lihat detail & foto\n` +
            `• *bantuan* - Tampilkan bantuan ini\n\n` +
            `Tag tersedia:\n` +
            `• *#order* - Untuk melakukan pemesanan\n` +
            `• *#komplain* - Untuk sampaikan keluhan\n` +
            `• *#info* - Lihat informasi toko\n` +
            `• *#promo* - Lihat promo terbaru\n` +
            `• *#stok* - Cek ketersediaan roti\n\n` +
            `Ada yang ingin ditanyakan? Langsung ketik saja!`;
        }
        // Jika tag terdeteksi dan ada template-nya
        else if (detectedTag && tagTemplate && tagTemplate.autoReply) {
          response = tagTemplate.template;
        }
        else {
          // Check if it's a product name
          const products = getAllProducts();
          const product = products.find(p => 
            p.name.toLowerCase() === textLower || 
            p.name.toLowerCase().includes(textLower)
          );
          
          if (product) {
            // Send product image if available
            if (product.image_url) {
              try {
                await sock.sendMessage(phone, { 
                  image: { url: product.image_url },
                  caption: `*${product.name.toUpperCase()}*\n\nHarga: Rp ${product.price.toLocaleString('id-ID')}\nKategori: ${product.category}\nDeskripsi: ${product.description || '-'}\n\nTertarik? Langsung chat admin kami!`
                });
                response = ''; // Already sent with image
              } catch (err) {
                console.log('Failed to send image:', err.message);
                response = `*${product.name.toUpperCase()}*\n\nHarga: Rp ${product.price.toLocaleString('id-ID')}\nKategori: ${product.category}\nDeskripsi: ${product.description || '-'}\n\nTertarik? Langsung chat admin kami!`;
              }
            } else {
              response = `*${product.name.toUpperCase()}*\n\nHarga: Rp ${product.price.toLocaleString('id-ID')}\nKategori: ${product.category}\nDeskripsi: ${product.description || '-'}\n\nTertarik? Langsung chat admin kami!`;
            }
          }
          else {
            // First message - send welcome + menu
            if (isFirstMessage) {
              response = templates.welcome + '\n\n' + generateMenu();
            } else {
              // Use AI for other messages
              const convHistory = getConversationHistory(phone, 5);
              const conversationHistory = convHistory.flatMap(h => [
                { role: 'user', content: h.message },
                { role: 'assistant', content: h.response }
              ]);
              
              response = await chatWithAI(text, conversationHistory);
            }
          }
        }
        
        // Send response if not empty
        if (response) {
          await sock.sendMessage(phone, { text: response });
        }
        
        // Save conversation
        saveConversation(phone, contactName, text, response, 1);
        
        // Forward to admin CS
        const forwardMsg = `💬 *INQUIRY*\n\n` +
          `Dari: ${contactName}\n` +
          `No: ${phone}\n` +
          `Pesan: ${text}\n\n` +
          `Balas pesan ini untuk follow up.`;
        
        try {
          await sock.sendMessage(config.bot.adminNumber, { text: forwardMsg });
        } catch (err) {
          console.log('Failed to forward to admin:', err.message);
        }
        
      } catch (error) {
        console.error('Error handling message:', error);
        await sock.sendMessage(phone, { 
          text: 'Maaf, terjadi kesalahan. Silakan coba lagi.' 
        });
      }
    }
  });
}

// Run the bot
console.log('🚀 Starting WhatsApp Bot...');
startBot().catch(console.error);
