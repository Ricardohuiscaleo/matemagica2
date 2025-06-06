// Configuración de credenciales de Supabase para Matemágica
// ✅ CONFIGURADO: Credenciales reales de Supabase

// 🔗 URL de tu proyecto Supabase
export const SUPABASE_URL = 'https://uznvakpuuxnpdhoejrog.supabase.co';

// 🔑 Clave pública anónima de tu proyecto
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bnZha3B1dXhucGRob2Vqcm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODg0MTAsImV4cCI6MjA2NDY2NDQxMH0.OxbLYkjlgpWFnqd28gaZSwar_NQ6_qUS3U76bqbcXVg';

// 📊 Configuración adicional (opcional)
export const SUPABASE_OPTIONS = {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
};

// ✅ CONFIGURADO: Cambiado a true
export const SUPABASE_CONFIGURED = true;

// 🧪 Función para verificar la configuración
export function isSupabaseConfigured() {
    return SUPABASE_CONFIGURED && 
           SUPABASE_URL !== 'https://tu-proyecto.supabase.co' && 
           SUPABASE_ANON_KEY !== 'tu-clave-anonima-aqui';
}

// 📝 Mensajes de ayuda para el desarrollador
export const CONFIG_MESSAGES = {
    notConfigured: '🔧 Supabase no está configurado. Edita supabase-credentials.js con tus credenciales reales.',
    configured: '✅ Supabase configurado correctamente. ¡La autenticación está lista!',
    error: '❌ Error en la configuración de Supabase. Revisa tus credenciales.'
};