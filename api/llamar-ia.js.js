// Este archivo va en: /api/llamar-ia.js

export default async function handler(req, res) {
    // Solo permitir solicitudes POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // 1. Obtiene el prompt que envió el frontend
        const { prompt } = req.body;

        // 2. Obtiene la API Key de OpenAI de una variable de entorno segura
        const apiKey = process.env.OPENAI_API_KEY; // <-- CAMBIO 1: Nueva variable de entorno

        if (!apiKey) {
            throw new Error("La API key de OpenAI no está configurada en el servidor.");
        }

        // 3. Prepara la llamada a la API de OpenAI
        const apiUrl = 'https://api.openai.com/v1/chat/completions'; // <-- CAMBIO 2: Nuevo endpoint
        
        const payload = {
            model: "gpt-4o", // O el modelo que prefieras, como "gpt-3.5-turbo"
            messages: [{
                role: "user",
                content: prompt // <-- CAMBIO 3: La estructura del payload es diferente
            }],
            temperature: 0.7, // Opcional: ajusta la creatividad
            max_tokens: 150  // Opcional: limita la longitud de la respuesta
        };

        // 4. Llama a la API de OpenAI desde el servidor
        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}` // <-- CAMBIO 4: La autenticación va en el header
            },
            body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) {
            const errorData = await apiResponse.json();
            console.error('Error de la API de OpenAI:', errorData);
            throw new Error(`API error: ${apiResponse.statusText}`);
        }

        const result = await apiResponse.json();
        // CAMBIO 5: La forma de extraer el texto de la respuesta es diferente
        const text = result.choices[0].message.content; 

        // 5. Envía la respuesta final de vuelta al frontend (esto no cambia)
        res.status(200).json({ text: text.trim() });

    } catch (error) {
        console.error("Error en la función serverless:", error);
        res.status(500).json({ error: "Lo siento, ha ocurrido un error al generar la comparación." });
    }
}