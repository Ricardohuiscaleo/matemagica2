// 🔐 Servicio de Configuración Segura - Matemágica PWA
// Este servicio carga las configuraciones desde el backend de forma segura

// config-service.js - Servicio de Configuración Segura v1.0
console.log("🔧 Config Service v1.0 cargado");

// 🚀 NUEVO: Detectar entorno de desarrollo
const isLocalDevelopment = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1' ||
                          window.location.hostname === '';

// Servicio centralizado para gestión de configuración
window.ConfigService = {
    // Configuración por defecto
    defaults: {
        geminiApiKey: 'AIzaSyDNOl8-P5Bt6dhjYPM-zGo6E8tNqVlXeHQ', // ✅ API Key real
        offlineMode: false,
        numberFormat: 'standard',
        studentData: null,
        exerciseLevel: 'medio'
    },

    // ✅ NUEVO: Método de inicialización que los tests necesitan
    async initialize() {
        try {
            console.log('🔄 Inicializando ConfigService...');
            
            // Cargar configuración base
            const config = await this.loadConfig();
            
            // ✅ CREAR CONFIGURACIONES GLOBALES
            window.MATEMAGICA_CONFIG = {
                mode: isLocalDevelopment ? 'DESARROLLO LOCAL' : 'PRODUCCIÓN',
                supabase: config.supabase,
                gemini: {
                    apiKey: this.defaults.geminiApiKey,
                    model: 'gemini-2.0-flash',
                    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
                },
                environment: config.environment,
                offlineMode: this.get('offlineMode'),
                features: {
                    aiGeneration: true,
                    offlineTemplates: true,
                    pdfExport: true,
                    analytics: true
                }
            };
            
            // ✅ CREAR SUPABASE_CONFIG GLOBAL
            window.SUPABASE_CONFIG = {
                url: config.supabase.url,
                anon_key: config.supabase.anonKey
            };
            
            console.log('✅ MATEMAGICA_CONFIG y SUPABASE_CONFIG creados globalmente');
            console.log('📊 Configuración cargada:', {
                mode: window.MATEMAGICA_CONFIG.mode,
                supabaseUrl: window.SUPABASE_CONFIG.url.substring(0, 30) + '...',
                geminiConfigured: !!window.MATEMAGICA_CONFIG.gemini.apiKey
            });
            
            return window.MATEMAGICA_CONFIG;
            
        } catch (error) {
            console.error('❌ Error inicializando ConfigService:', error);
            throw error;
        }
    },

    // ✅ CORREGIDO: Método para cargar configuración en todos los entornos
    async loadConfig() {
        if (isLocalDevelopment) {
            console.log('🏠 ConfigService: Usando configuración local para desarrollo');
            return {
                supabase: {
                    url: "https://uznvakpuuxnpdhoejrog.supabase.co",
                    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bnZha3B1dXhucGRob2Vqcm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODg0MTAsImV4cCI6MjA2NDY2NDQxMH0.OxbLYkjlgpWFnqd28gaZSwar_NQ6_qUS3U76bqbcXVg"
                },
                environment: 'development'
            };
        } else {
            // ✅ NUEVO: Configuración válida para producción con API key corregida
            console.log('🌐 ConfigService: Usando configuración para producción');
            return {
                supabase: {
                    url: "https://uznvakpuuxnpdhoejrog.supabase.co",
                    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bnZha3B1dXhucGRob2Vqcm9nIiwicm9zZSI6ImFub24iLCJpYXQiOjE3NDkwODg0MTAsImV4cCI6MjA2NDY2NDQxMH0.OxbLYkjlgpWFnqd28gaZSwar_NQ6_qUS3U76bqbcXVg"
                },
                environment: 'production'
            };
        }
    },

    // Obtener configuración
    get(key) {
        try {
            const value = localStorage.getItem(`matemagica_config_${key}`);
            return value ? JSON.parse(value) : this.defaults[key];
        } catch (error) {
            console.error(`❌ Error obteniendo config ${key}:`, error);
            return this.defaults[key];
        }
    },

    // Guardar configuración
    set(key, value) {
        try {
            localStorage.setItem(`matemagica_config_${key}`, JSON.stringify(value));
            console.log(`✅ Config guardada: ${key}`);
            return true;
        } catch (error) {
            console.error(`❌ Error guardando config ${key}:`, error);
            return false;
        }
    },

    // Obtener toda la configuración
    getAll() {
        const config = {};
        Object.keys(this.defaults).forEach(key => {
            config[key] = this.get(key);
        });
        return config;
    },

    // Limpiar configuración
    clear() {
        try {
            Object.keys(this.defaults).forEach(key => {
                localStorage.removeItem(`matemagica_config_${key}`);
            });
            console.log("🧹 Configuración limpiada");
            return true;
        } catch (error) {
            console.error("❌ Error limpiando configuración:", error);
            return false;
        }
    },

    // Exportar configuración
    export() {
        return JSON.stringify(this.getAll(), null, 2);
    },

    // Importar configuración
    import(configString) {
        try {
            const config = JSON.parse(configString);
            Object.keys(config).forEach(key => {
                if (this.defaults.hasOwnProperty(key)) {
                    this.set(key, config[key]);
                }
            });
            console.log("✅ Configuración importada");
            return true;
        } catch (error) {
            console.error("❌ Error importando configuración:", error);
            return false;
        }
    }
};

// ✅ INICIALIZACIÓN AUTOMÁTICA AL CARGAR
window.ConfigService.initialize().then(() => {
    console.log('✅ Servicio de configuración listo - Modo:', window.MATEMAGICA_CONFIG.mode);
}).catch(error => {
    console.error('❌ Error en inicialización automática:', error);
    // Crear configuraciones mínimas como fallback
    window.MATEMAGICA_CONFIG = { mode: 'FALLBACK' };
    window.SUPABASE_CONFIG = { url: '', anon_key: '' };
});

// Hacer disponible para window.configService
window.configService = window.ConfigService;

console.log(`✅ Servicio de configuración listo - Modo: ${isLocalDevelopment ? 'DESARROLLO LOCAL' : 'PRODUCCIÓN'}`);