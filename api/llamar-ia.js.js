// Este archivo va en: /api/llamar-ia.js

export default async function handler(req, res) {
    // Solo permitir solicitudes POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // 1. Obtiene el prompt que envió el frontend
        const { prompt } = req.body;

        // 2. Obtiene la API Key de una variable de entorno segura (nunca del código)
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            throw new Error("La API key no está configurada en el servidor.");
        }

        // 3. Prepara la llamada a la API de Google Gemini
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
        
        const payload = {
            contents: [{
                role: "user",
                parts: [{ text: prompt }]
            }]
        };

        // 4. Llama a la API de Google desde el servidor
        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) {
            const errorData = await apiResponse.json();
            console.error('Error de la API de Google:', errorData);
            throw new Error(`API error: ${apiResponse.statusText}`);
        }

        const result = await apiResponse.json();
        const text = result.candidates[0].content.parts[0].text;

        // 5. Envía la respuesta final de vuelta al frontend
        res.status(200).json({ text: text });

    } catch (error) {
        console.error("Error en la función serverless:", error);
        res.status(500).json({ error: "Lo siento, ha ocurrido un error al generar la comparación." });
    }
}