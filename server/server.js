const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 🛡️ Middlewares de seguridad con CSP configurado PARA HTTP
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'", 
                "'unsafe-inline'", // Permitir scripts inline para desarrollo
                "https://unpkg.com", // Para Supabase CDN
                "https://cdnjs.cloudflare.com", // Para librerías CDN
                "https://cdn.jsdelivr.net" // Para Tailwind CDN
            ],
            styleSrc: [
                "'self'", 
                "'unsafe-inline'", // Permitir estilos inline
                "https://fonts.googleapis.com",
                "https://cdn.jsdelivr.net",
                "https://cdnjs.cloudflare.com"
            ],
            fontSrc: [
                "'self'",
                "https://fonts.gstatic.com"
            ],
            imgSrc: [
                "'self'", 
                "data:", 
                "https:", // Permitir todas las imágenes HTTPS
                "blob:" // Para canvas y PDF
            ],
            connectSrc: [
                "'self'",
                "http://localhost:8080", // ✅ Puerto 8080 HTTP
                "http://127.0.0.1:8080",
                "https://api.openai.com",
                "https://generativelanguage.googleapis.com", // Gemini API
                "https://uznvakpuuxnpdhoejrog.supabase.co", // Supabase
                "https://accounts.google.com" // Google OAuth
            ],
            manifestSrc: ["'self'"],
            workerSrc: ["'self'"],
            upgradeInsecureRequests: null // ✅ DESACTIVAR COMPLETAMENTE
        },
    },
    crossOriginEmbedderPolicy: false, // Desactivar para compatibilidad
    hsts: false // DESACTIVAR HSTS para desarrollo HTTP
}));

app.use(cors({
    origin: [
        'http://localhost:3000', // ✅ PUERTO DEL FRONTEND ACTUAL
        'http://127.0.0.1:3000', // ✅ PUERTO DEL FRONTEND ACTUAL  
        'http://localhost:3001', 
        'http://127.0.0.1:3001', 
        'https://localhost:3001',
        'https://127.0.0.1:3001',
        'http://localhost:4000', // ✅ AGREGADO: Puerto del frontend
        'http://127.0.0.1:4000', // ✅ AGREGADO: Puerto del frontend
        'https://localhost:4000', // ✅ AGREGADO: Puerto del frontend HTTPS
        'https://127.0.0.1:4000', // ✅ AGREGADO: Puerto del frontend HTTPS
        'https://tu-dominio.com'
    ],
    credentials: true
}));

// 📊 Rate limiting para prevenir abuso
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // máximo 100 requests por IP por ventana
});
app.use('/api/', limiter);

app.use(express.json({ limit: '1mb' }));

// 🤖 Proxy seguro para Gemini AI
app.post('/api/gemini/generate', async (req, res) => {
    try {
        const { prompt, schema } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt requerido' });
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    role: 'user',
                    parts: [{ text: prompt }]
                }],
                generationConfig: schema ? {
                    responseMimeType: 'application/json',
                    responseSchema: schema,
                    temperature: 0.7,
                    maxOutputTokens: 2048
                } : {
                    temperature: 0.8,
                    maxOutputTokens: 1024
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API Error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!content) {
            throw new Error('No content in API response');
        }

        // Si es JSON schema, parsear la respuesta
        const result = schema ? JSON.parse(content) : content;
        
        res.json({ success: true, content: result });

    } catch (error) {
        console.error('Error en Gemini API:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error generando contenido con IA',
            fallback: true 
        });
    }
});

// 🔐 Endpoint para obtener configuraciones públicas
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

// 📊 Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        services: {
            gemini: !!process.env.GEMINI_API_KEY,
            supabase: !!process.env.SUPABASE_URL
        }
    });
});

// 🚀 Servidor estático con headers HTTP explícitos
app.use(express.static('../', {
    setHeaders: (res, path) => {
        // FORZAR HTTP y evitar redirects HTTPS
        res.setHeader('Strict-Transport-Security', 'max-age=0'); // Desactivar HSTS
        
        // Headers apropiados para cada tipo de archivo
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        }
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css; charset=utf-8');
        }
        if (path.endsWith('.json')) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
        }
        if (path.endsWith('.png') || path.endsWith('.ico')) {
            res.setHeader('Cache-Control', 'public, max-age=86400');
            res.setHeader('Content-Type', path.endsWith('.png') ? 'image/png' : 'image/x-icon');
        }
        if (path.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
        }
        
        console.log(`📁 Sirviendo: ${path}`);
    }
}));

app.listen(PORT, () => {
    console.log(`🚀 Servidor Matemágica ejecutándose en puerto ${PORT}`);
    console.log(`🌐 Acceso local: http://localhost:${PORT}`);
    console.log(`🛡️ Seguridad: API keys protegidas en variables de entorno`);
    console.log(`🤖 Gemini AI: ${process.env.GEMINI_API_KEY ? '✅ Configurado' : '❌ No configurado'}`);
    console.log(`🗄️ Supabase: ${process.env.SUPABASE_URL ? '✅ Configurado' : '❌ No configurado'}`);
});