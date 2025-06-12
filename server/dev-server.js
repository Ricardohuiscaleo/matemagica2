// Servidor de desarrollo simple SIN SSL para Matemágica
const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002; // Puerto diferente para evitar conflictos

// 🚫 SIN middlewares de seguridad para desarrollo HTTP puro
app.use(express.json());

// 🌐 CORS muy permisivo para desarrollo
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Headers anti-SSL para desarrollo
    res.header('Strict-Transport-Security', 'max-age=0');
    res.removeHeader('X-Powered-By');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// 🤖 API endpoints mínimos
app.post('/api/gemini/generate', async (req, res) => {
    try {
        const { prompt, schema } = req.body;
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: schema ? {
                    responseMimeType: 'application/json',
                    responseSchema: schema
                } : {}
            })
        });

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
        const result = schema ? JSON.parse(content) : content;
        
        res.json({ success: true, content: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message, fallback: true });
    }
});

app.get('/api/config', (req, res) => {
    res.json({
        supabase: {
            url: process.env.SUPABASE_URL,
            anonKey: process.env.SUPABASE_ANON_KEY
        },
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID
        },
        geminiConfigured: !!process.env.GEMINI_API_KEY
    });
});

// 📁 Servir archivos estáticos SIN restricciones SSL
app.use(express.static(path.join(__dirname, '..'), {
    setHeaders: (res, filePath) => {
        // Headers básicos sin restricciones SSL
        if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (filePath.endsWith('.json')) {
            res.setHeader('Content-Type', 'application/json');
        } else if (filePath.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html');
        }
        
        // Cache básico
        res.setHeader('Cache-Control', 'no-cache');
    }
}));

// 🏠 Ruta raíz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor de desarrollo HTTP puro en puerto ${PORT}`);
    console.log(`🌐 Acceso: http://localhost:${PORT}`);
    console.log(`🔓 Modo: HTTP sin SSL (perfecto para desarrollo)`);
    console.log(`🤖 Gemini: ${process.env.GEMINI_API_KEY ? '✅' : '❌'}`);
    console.log(`🗄️ Supabase: ${process.env.SUPABASE_URL ? '✅' : '❌'}`);
});