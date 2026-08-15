import config from './config.js';
import { getDb } from './database.js';

// Simple responses when Ollama is not available
const SIMPLE_RESPONSES = {
  'halo': 'Halo! Selamat datang di Toko Roti kami.\n\nKetik *menu* untuk lihat daftar roti.',
  'hi': 'Halo! Selamat datang di Toko Roti kami.\n\nKetik *menu* untuk lihat daftar roti.',
  'menu': null, // Will be generated dynamically
  'bantuan': '📖 *BANTUAN*\n\nKetik *menu* - Lihat daftar roti\nKetik *[nama roti]* - Lihat detail\nKetik *bantuan* - Bantuan\nKetik *halo* - Sambutan',
  'help': '📖 *BANTUAN*\n\nKetik *menu* - Lihat daftar roti\nKetik *[nama roti]* - Lihat detail\nKetik *bantuan* - Bantuan\nKetik *halo* - Sambutan',
  'harga': 'Untuk melihat harga, ketik *menu* lalu pilih roti yang diinginkan.',
  'stok': 'Untuk cek stok, ketik nama roti yang dicari.',
  'pesanan': 'Untuk melakukan pesanan, silakan hubungi admin langsung.',
  'order': 'Untuk melakukan pesanan, silakan hubungi admin langsung.',
  'terima kasih': 'Sama-sama! Ada yang bisa dibantu lagi?',
  'makasih': 'Sama-sama! Ada yang bisa dibantu lagi?',
};

// Get product list from database
function getProductList() {
  try {
    const db = getDb();
    const results = db.exec('SELECT name, price, category FROM products WHERE is_available = 1 ORDER BY category, name');
    if (results.length === 0) return null;
    
    let menu = '📋 *DAFTAR PRODUK*\n\n';
    let currentCategory = '';
    
    for (const row of results[0].values) {
      const [name, price, category] = row;
      if (category !== currentCategory) {
        menu += `\n*${category}:*\n`;
        currentCategory = category;
      }
      menu += `• ${name} - Rp ${price.toLocaleString('id-ID')}\n`;
    }
    
    menu += '\nKetik *nama roti* untuk lihat detail & foto.';
    return menu;
  } catch (error) {
    return null;
  }
}

// Get product detail from database
function getProductDetail(query) {
  try {
    const db = getDb();
    const results = db.exec(`SELECT name, description, price, stock, category, image_url FROM products WHERE LOWER(name) LIKE LOWER('%${query}%') AND is_available = 1`);
    
    if (results.length === 0 || results[0].values.length === 0) return null;
    
    const [name, description, price, stock, category, imageUrl] = results[0].values[0];
    
    let detail = `🍞 *${name}*\n\n`;
    if (description) detail += `${description}\n\n`;
    detail += `💰 Harga: Rp ${price.toLocaleString('id-ID')}\n`;
    detail += `📦 Stok: ${stock > 0 ? 'Tersedia (' + stock + ')' : 'Habis'}\n`;
    detail += `📁 Kategori: ${category}\n`;
    
    return { detail, imageUrl };
  } catch (error) {
    return null;
  }
}

// Generate simple response without AI
function generateSimpleResponse(message) {
  const lower = message.toLowerCase().trim();
  
  // Check exact matches first
  if (SIMPLE_RESPONSES[lower]) {
    return SIMPLE_RESPONSES[lower];
  }
  
  // Check if it's a product query
  const productDetail = getProductDetail(lower);
  if (productDetail) {
    return productDetail.detail;
  }
  
  // Check if message contains keywords
  for (const [key, response] of Object.entries(SIMPLE_RESPONSES)) {
    if (lower.includes(key) && response) {
      return response;
    }
  }
  
  // Default response
  return 'Maaf, saya tidak mengerti.\n\nKetik *menu* untuk lihat daftar roti\nKetik *bantuan* untuk bantuan';
}

// System prompt untuk CS Toko Roti (for Ollama)
const SYSTEM_PROMPT = `Kamu adalah asisten customer service untuk toko roti. 
Tugasmu adalah membantu pelanggan dengan:
1. Menampilkan menu dan harga roti
2. Membantu proses pemesanan
3. Cek status pesanan
4. Menangani komplain dengan ramah
5. Memberikan rekomendasi roti

Gunakan Bahasa Indonesia yang sopan dan ramah.
Jawab dengan singkat dan jelas.
Jika tidak tahu, arahkan ke admin.`;

export async function chatWithAI(message, conversationHistory = []) {
  const ollamaUrl = config.ollama?.url;
  const model = config.ollama?.model;
  
  // If Ollama not configured, use simple response
  if (!ollamaUrl || !model) {
    console.log('[AI] Using simple response (Ollama not configured)');
    return generateSimpleResponse(message);
  }
  
  console.log(`[AI] Mengirim ke Ollama: ${ollamaUrl}/api/chat`);
  console.log(`[AI] Model: ${model}`);
  
  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        messages,
        stream: false,
        options: {
          temperature: config.ollama?.temperature || 0.7,
          num_predict: config.ollama?.maxTokens || 2048
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AI] Ollama API error ${response.status}:`, errorText);
      throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const reply = data.message?.content;
    
    if (!reply) {
      console.error('[AI] Ollama response kosong:', data);
      return 'Maaf, tidak ada respons dari AI.';
    }
    
    console.log(`[AI] Response: ${reply.substring(0, 100)}...`);
    return reply;

  } catch (error) {
    console.error('[AI] Error:', error.message);
    
    // Fallback to simple response on error
    console.log('[AI] Falling back to simple response');
    return generateSimpleResponse(message);
  }
}

export async function checkOllamaConnection() {
  const ollamaUrl = config.ollama?.url;
  const model = config.ollama?.model;
  
  // If not configured
  if (!ollamaUrl || !model) {
    return { 
      connected: false, 
      configured: false,
      error: 'Ollama not configured. Using simple response mode.' 
    };
  }
  
  console.log(`[AI] Mengecek koneksi Ollama: ${ollamaUrl}`);
  
  try {
    const response = await fetch(`${ollamaUrl}/api/tags`);
    if (response.ok) {
      const data = await response.json();
      const models = data.models?.map(m => m.name) || [];
      
      const modelExists = models.some(m => m === model || m.startsWith(model));
      
      if (!modelExists) {
        console.warn(`[AI] Model "${model}" tidak ditemukan!`);
        return { 
          connected: true, 
          models,
          modelReady: false,
          message: `Model "${model}" belum terinstall.`
        };
      }
      
      console.log(`[AI] Ollama connected. Models: ${models.join(', ')}`);
      return { 
        connected: true, 
        models,
        modelReady: true
      };
    }
    return { connected: false, error: 'Server responded with error' };
  } catch (error) {
    console.error('[AI] Gagal koneksi Ollama:', error.message);
    return { connected: false, error: error.message };
  }
}

// Export for admin panel
export { generateSimpleResponse, getProductList, getProductDetail };
