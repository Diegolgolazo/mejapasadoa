export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { prompt } = req.body;
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API key not found on server' });

    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    const payload = {
      model: "gpt-5-nano",
      messages: [{ role: "user", content: prompt }],
      // temperature eliminado porque gpt-5-nano no soporta valores distintos al por defecto
      max_completion_tokens: 15000
    };

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!apiResponse.ok) {
      const errBody = await apiResponse.json().catch(() => null);
      console.error('OpenAI API error', apiResponse.status, errBody);
      return res.status(500).json({ error: 'OpenAI API error', status: apiResponse.status, details: errBody });
    }

    const result = await apiResponse.json();
    const text = result?.choices?.[0]?.message?.content ?? JSON.stringify(result);
    return res.status(200).json({ text: text.trim() });
  } catch (err) {
    console.error('Server handler error:', err);
    return res.status(500).json({ error: err.message });
  }
}


