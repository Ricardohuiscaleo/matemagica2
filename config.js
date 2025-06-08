// Configuración de Matemágica PWA
window.MATEMAGICA_CONFIG = {
    // Configuración de Supabase
    SUPABASE: {
        url: 'https://uznvakpuuxnpdhoejrog.supabase.co',
        anon_key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bnZha3B1dXhucGRob2Vqcm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODg0MTAsImV4cCI6MjA2NDY2NDQxMH0.OxbLYkjlgpWFnqd28gaZSwar_NQ6_qUS3U76bqbcXVg'
    },
    
    // Configuración de Google OAuth
    GOOGLE: {
        client_id: '531902921465-4j3o9nhpsaqd4lkq453jfvg1so52pa2l.apps.googleusercontent.com'
    },
    
    // Configuración de Gemini AI
    GEMINI: {
        api_key: 'AIzaSyBNzW6CFOObqOJCNE8A4kKUz7rU7-JaQeE',
        api_url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
    },
    
    // Configuración de la app
    APP: {
        name: 'Matemágica',
        version: '1.0.0',
        description: 'Generador de ejercicios de matemáticas con IA para niños',
        target_age: '7-8 años'
    }
};

// ✅ CORREGIDO: Asegurar que la configuración esté disponible inmediatamente
(function() {
    'use strict';
    
    console.log('🔧 Cargando configuración de Matemágica PWA...');
    
    // ✅ CORREGIDO: Configuración de Supabase con API key válida
    window.SUPABASE_CONFIG = {
        url: 'https://uznvakpuuxnpdhoejrog.supabase.co',
        anon_key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bnZha3B1dXhucGRob2Vqcm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODg0MTAsImV4cCI6MjA2NDY2NDQxMH0.OxbLYkjlgpWFnqd28gaZSwar_NQ6_qUS3U76bqbcXVg',
        // ✅ NUEVO: Flag para indicar que la configuración es válida
        isValid: true,
        lastError: null
    };

    // ✅ NUEVO: Configuración de Gemini AI disponible globalmente
    window.GEMINI_CONFIG = {
        apiKey: 'AIzaSyBNzW6CFOObqOJCNE8A4kKUz7rU7-JaQeE',
        apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        configured: true,
        hasValidKey: true
    };

    // Función para verificar si Supabase está configurado
    window.isSupabaseConfigured = function() {
        const config = window.SUPABASE_CONFIG;
        
        // ✅ MEJORADO: Verificación más estricta para evitar errores 401
        const isConfigured = !!(
            config && 
            config.url && 
            config.anon_key && 
            config.anon_key.length > 100 &&
            config.url.includes('supabase.co') &&
            config.isValid !== false
        );
        
        console.log('🔍 Verificando configuración Supabase:', isConfigured);
        
        if (!isConfigured) {
            console.warn('❌ Configuración Supabase inválida:', {
                hasUrl: !!config?.url,
                hasKey: !!config?.anon_key,
                keyLength: config?.anon_key?.length || 0,
                isValid: config?.isValid,
                lastError: config?.lastError
            });
            console.warn('💡 Solución: Regenerar anon_key desde el dashboard de Supabase');
        }
        return isConfigured;
    };

    // Funciones de verificación
    window.isGoogleSignInConfigured = function() {
        const config = window.MATEMAGICA_CONFIG.GOOGLE;
        return config && config.client_id && config.client_id.includes('googleusercontent.com');
    };

    window.isGeminiConfigured = function() {
        const config = window.GEMINI_CONFIG;
        return config && config.apiKey && config.apiUrl;
    };

    // ✅ CORREGIDO: Verificar inmediatamente todas las configuraciones
    console.log('✅ Configuración de Matemágica PWA cargada');
    console.log('🔐 Supabase configurado:', window.isSupabaseConfigured());
    console.log('🔐 Google OAuth configurado:', window.isGoogleSignInConfigured());
    console.log('🤖 Gemini AI configurado:', window.isGeminiConfigured());
    
})();

// Variables globales para modo híbrido
let isOfflineMode = localStorage.getItem('matemagica-offline-mode') === 'true';
let isSupabaseAvailable = false;

// Configuración inicial del modo
document.addEventListener('DOMContentLoaded', function() {
    initializeModeSystem();
    setupModeToggle();
});

function initializeModeSystem() {
    // Verificar disponibilidad de Supabase
    checkSupabaseAvailability();
    
    // Configurar modo inicial
    updateModeDisplay();
    
    console.log(`🔄 Matemágica iniciada en modo: ${isOfflineMode ? '📱 Offline' : '☁️ Online'}`);
}

function checkSupabaseAvailability() {
    // Verificar si Supabase está disponible y configurado
    isSupabaseAvailable = !!(window.supabaseClient && window.SUPABASE_CONFIG && window.isSupabaseConfigured?.());
    
    if (!isSupabaseAvailable && !isOfflineMode) {
        console.warn('⚠️ Supabase no disponible, forzando modo offline');
        isOfflineMode = true;
        localStorage.setItem('matemagica-offline-mode', 'true');
    }
}

function setupModeToggle() {
    const modeToggle = document.getElementById('mode-toggle');
    if (modeToggle) {
        modeToggle.addEventListener('click', toggleMode);
    }
}

function toggleMode() {
    if (!isSupabaseAvailable && !isOfflineMode) {
        mostrarNotificacion('⚠️ Modo online no disponible sin conexión a Supabase', 'warning');
        return;
    }
    
    isOfflineMode = !isOfflineMode;
    localStorage.setItem('matemagica-offline-mode', isOfflineMode.toString());
    
    updateModeDisplay();
    
    const modoTexto = isOfflineMode ? '📱 Modo Offline' : '☁️ Modo Online';
    mostrarNotificacion(`✅ Cambiado a ${modoTexto}`, 'success');
    
    console.log(`🔄 Modo cambiado a: ${modoTexto}`);
}

function updateModeDisplay() {
    const modeToggle = document.getElementById('mode-toggle');
    const modeStatus = document.getElementById('mode-status');
    
    if (modeToggle) {
        if (isOfflineMode) {
            modeToggle.innerHTML = `
                <span class="mode-icon">📱</span>
                <span class="mode-text">Offline</span>
            `;
            modeToggle.className = 'mode-toggle offline-mode';
        } else {
            modeToggle.innerHTML = `
                <span class="mode-icon">☁️</span>
                <span class="mode-text">Online</span>
            `;
            modeToggle.className = 'mode-toggle online-mode';
        }
    }
    
    if (modeStatus) {
        modeStatus.textContent = isOfflineMode ? 'Modo Offline' : 'Modo Online';
        modeStatus.className = `mode-status ${isOfflineMode ? 'offline' : 'online'}`;
    }
}

// Función universal para guardar datos (híbrida)
async function saveDataHybrid(storageKey, data, supabaseService = null) {
    try {
        // Siempre guardar en localStorage (backup)
        localStorage.setItem(storageKey, JSON.stringify(data));
        
        // Si estamos en modo online y Supabase está disponible
        if (!isOfflineMode && isSupabaseAvailable && supabaseService) {
            try {
                await supabaseService(data);
                console.log(`✅ Datos guardados en la nube: ${storageKey}`);
            } catch (error) {
                console.warn('⚠️ Error guardando en nube, usando solo localStorage:', error);
            }
        }
        
        return true;
    } catch (error) {
        console.error('❌ Error guardando datos:', error);
        return false;
    }
}

// Función universal para cargar datos (híbrida)
async function loadDataHybrid(storageKey, supabaseService = null) {
    try {
        let data = null;
        
        // Si estamos en modo online, intentar cargar de Supabase primero
        if (!isOfflineMode && isSupabaseAvailable && supabaseService) {
            try {
                data = await supabaseService();
                if (data) {
                    // Sincronizar con localStorage
                    localStorage.setItem(storageKey, JSON.stringify(data));
                    console.log(`✅ Datos cargados desde la nube: ${storageKey}`);
                    return data;
                }
            } catch (error) {
                console.warn('⚠️ Error cargando de nube, usando localStorage:', error);
            }
        }
        
        // Fallback a localStorage
        const localData = localStorage.getItem(storageKey);
        if (localData) {
            data = JSON.parse(localData);
            console.log(`📱 Datos cargados desde localStorage: ${storageKey}`);
        }
        
        return data;
    } catch (error) {
        console.error('❌ Error cargando datos:', error);
        return null;
    }
}

// Exportar funciones para uso global
window.MathModeSystem = {
    isOfflineMode: () => isOfflineMode,
    isSupabaseAvailable: () => isSupabaseAvailable,
    toggleMode,
    saveDataHybrid,
    loadDataHybrid,
    updateModeDisplay
};
