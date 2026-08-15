import config from './config.js';

// System prompt untuk CS Toko Roti
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
  const ollamaUrl = config.ollama.url;
  const model = config.ollama.model;
  
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
          temperature: config.ollama.temperature,
          num_predict: config.ollama.maxTokens
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
    
    // Cek apakah error karena Ollama tidak jalan
    if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
      console.error('[AI] Ollama tidak berjalan! Pastikan Ollama sudah dijalankan dengan: ollama serve');
      return 'Maaf, AI sedang tidak tersedia. Silakan hubungi admin.';
    }
    
    return 'Maaf, sistem sedang bermasalah. Silakan coba lagi atau hubungi admin.';
  }
}

export async function checkOllamaConnection() {
  const ollamaUrl = config.ollama.url;
  const model = config.ollama.model;
  
  console.log(`[AI] Mengecek koneksi Ollama: ${ollamaUrl}`);
  
  try {
    const response = await fetch(`${ollamaUrl}/api/tags`);
    if (response.ok) {
      const data = await response.json();
      const models = data.models?.map(m => m.name) || [];
      
      // Cek apakah model yang dibutuhkan ada
      const modelExists = models.some(m => m === model || m.startsWith(model));
      
      if (!modelExists) {
        console.warn(`[AI] Model "${model}" tidak ditemukan!`);
        console.warn(`[AI] Models tersedia: ${models.join(', ')}`);
        console.warn(`[AI] Jalankan: ollama pull ${model}`);
        return { 
          connected: true, 
          models,
          modelReady: false,
          message: `Model "${model}" belum terinstall. Jalankan: ollama pull ${model}`
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
