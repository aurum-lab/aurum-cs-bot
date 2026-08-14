import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode';
import config from './config.js';
import { chatWithAI, checkOllamaConnection } from './ai.js';
import {
  getAllProducts,
  getProductById,
  saveConversation,
  getConversationHistory
} from './products.js';
import { initDatabase } from './database.js';
import { mkdirSync, existsSync } from 'fs';
import { EventEmitter } from 'events';

// Ensure session directory exists
mkdirSync(config.whatsapp.sessionDir, { recursive: true });

// Event emitter for real-time updates
export const waEvents = new EventEmitter();

// WhatsApp state
let sock = null;
let connectionStatus = 'disconnected';
let qrCode = null;
let phoneNumber = null;

// Get status
export function getWAStatus() {
  return {
    status: connectionStatus,
    qr: qrCode,
    phone: phoneNumber,
    ollama: null // Will be updated when checked
  };
}

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

// Start WhatsApp bot
export async function startWhatsApp() {
  if (sock && connectionStatus === 'open') {
    console.log('WhatsApp already connected');
    return { success: true, message: 'Already connected' };
  }

  await initDatabase();
  
  const { state, saveCreds } = await useMultiFileAuthState(config.whatsapp.sessionDir);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, undefined),
    },
    printQRInTerminal: false,
    generateHighQualityLinkPreview: false,
  });

  // Connection update handler
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr) {
      // Generate QR code as data URL
      qrCode = await qrcode.toDataURL(qr, { width: 300 });
      connectionStatus = 'waiting_scan';
      waEvents.emit('qr', qrCode);
      waEvents.emit('status', connectionStatus);
      console.log('QR Code generated - scan with WhatsApp');
    }
    
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error instanceof Boom)
        ? lastDisconnect.error.output?.statusCode !== DisconnectReason.loggedOut
        : true;
      
      console.log('Connection closed:', lastDisconnect.error?.message);
      
      if (shouldReconnect) {
        connectionStatus = 'reconnecting';
        waEvents.emit('status', connectionStatus);
        setTimeout(() => startWhatsApp(), 3000);
      } else {
        connectionStatus = 'disconnected';
        qrCode = null;
        waEvents.emit('status', connectionStatus);
        waEvents.emit('qr', null);
      }
    } else if (connection === 'open') {
      connectionStatus = 'open';
      qrCode = null;
      phoneNumber = sock.user?.id?.replace(/:.*@/, '@');
      waEvents.emit('status', connectionStatus);
      waEvents.emit('qr', null);
      console.log('✅ WhatsApp Bot Ready!');
      
      // Check Ollama
      const ollamaStatus = await checkOllamaConnection();
      waEvents.emit('ollama', ollamaStatus);
    }
  });

  // Save credentials
  sock.ev.on('creds.update', saveCreds);

  // Handle messages
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    
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
      waEvents.emit('message', { phone, name: contactName, text });
      
      try {
        let response = '';
        
        // Command handling
        if (textLower === 'menu' || textLower === 'halo' || textLower === 'hi') {
          response = generateMenu();
        }
        else if (textLower === 'bantuan' || textLower === 'help') {
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
                response = '';
              } catch (err) {
                console.log('Failed to send image:', err.message);
                response = `*${product.name.toUpperCase()}*\n\nHarga: Rp ${product.price.toLocaleString('id-ID')}\nKategori: ${product.category}\nDeskripsi: ${product.description || '-'}\n\nTertarik? Langsung chat admin kami!`;
              }
            } else {
              response = `*${product.name.toUpperCase()}*\n\nHarga: Rp ${product.price.toLocaleString('id-ID')}\nKategori: ${product.category}\nDeskripsi: ${product.description || '-'}\n\nTertarik? Langsung chat admin kami!`;
            }
          }
          else {
            // Use AI for other messages
            const history = getConversationHistory(phone, 5);
            const conversationHistory = history.flatMap(h => [
              { role: 'user', content: h.message },
              { role: 'assistant', content: h.response }
            ]);
            
            response = await chatWithAI(text, conversationHistory);
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

  return { success: true, message: 'WhatsApp bot starting...' };
}

// Disconnect WhatsApp
export async function disconnectWhatsApp() {
  if (sock) {
    sock.end();
    sock = null;
  }
  connectionStatus = 'disconnected';
  qrCode = null;
  phoneNumber = null;
  waEvents.emit('status', connectionStatus);
  waEvents.emit('qr', null);
  return { success: true, message: 'WhatsApp disconnected' };
}

// Send message (for admin reply)
export async function sendMessage(phone, text) {
  if (!sock || connectionStatus !== 'open') {
    return { success: false, message: 'WhatsApp not connected' };
  }
  
  await sock.sendMessage(phone, { text });
  return { success: true, message: 'Message sent' };
}

export default {
  getWAStatus,
  startWhatsApp,
  disconnectWhatsApp,
  sendMessage,
  waEvents
};
