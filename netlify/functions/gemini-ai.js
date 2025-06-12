exports.handler = async (event, context) => {
  // Configurar CORS para Netlify
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers,
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  }

  try {
    const { prompt, schema, temperature = 0.7 } = JSON.parse(event.body);
    
    if (!prompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Prompt requerido' })
      };
    }

    // ✅ SEGURIDAD: API Key del entorno de Netlify (NO expuesta)
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY no configurada en Netlify');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Configuración del servidor incompleta' 
        })
      };
    }

    // Llamar a Gemini API desde el backend
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: prompt }]
          }],
          generationConfig: schema ? {
            responseMimeType: 'application/json',
            responseSchema: schema,
            temperature
          } : { temperature }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      throw new Error('Sin contenido en respuesta de Gemini');
    }

    // Parsear JSON si es necesario
    let result = content;
    if (schema) {
      try {
        result = JSON.parse(content);
      } catch (e) {
        result = content;
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        content: result,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Error en Netlify Function:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Error interno del servidor',
        fallback: true
      })
    };
  }
};