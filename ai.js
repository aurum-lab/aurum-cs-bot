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
  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    const response = await fetch(`${config.ollama.url}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.ollama.model,
        messages,
        stream: false,
        options: {
          temperature: config.ollama.temperature,
          num_predict: config.ollama.maxTokens
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    return data.message?.content || 'Maaf, terjadi kesalahan.';

  } catch (error) {
    console.error('AI Error:', error.message);
    return 'Maaf, sistem sedang bermasalah. Silakan coba lagi atau hubungi admin.';
  }
}

export async function checkOllamaConnection() {
  try {
    const response = await fetch(`${config.ollama.url}/api/tags`);
    if (response.ok) {
      const data = await response.json();
      return { 
        connected: true, 
        models: data.models?.map(m => m.name) || [] 
      };
    }
    return { connected: false, error: 'Server responded with error' };
  } catch (error) {
    return { connected: false, error: error.message };
  }
}
