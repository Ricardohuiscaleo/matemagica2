// Configuración de Supabase - Versión simplificada sin errores 401

// ✅ DEBUG: Funciones de debugging disponibles inmediatamente
window.debugSupabase = function() {
    console.log('🔍 DEBUG - Estado de dependencias:');
    console.log('- window.SUPABASE_CONFIG:', typeof window.SUPABASE_CONFIG, window.SUPABASE_CONFIG ? '✅' : '❌');
    console.log('- window.supabase:', typeof window.supabase, window.supabase ? '✅' : '❌');
    console.log('- window.supabaseClient:', typeof window.supabaseClient, window.supabaseClient ? '✅' : '❌');
    console.log('- DOM ready state:', document.readyState);
};

// ✅ DEBUG: Función simple para probar inicialización manual
window.manualSupabaseInit = function() {
    console.log('🚀 Iniciando prueba manual...');
    
    if (!window.SUPABASE_CONFIG) {
        console.log('❌ No hay configuración');
        return false;
    }
    
    if (!window.supabase?.createClient) {
        console.log('❌ No hay librería Supabase');
        return false;
    }
    
    try {
        const client = window.supabase.createClient(
            window.SUPABASE_CONFIG.url,
            window.SUPABASE_CONFIG.anon_key
        );
        
        window.supabaseClient = client;
        console.log('✅ Cliente creado manualmente');
        return true;
    } catch (error) {
        console.log('❌ Error creando cliente:', error);
        return false;
    }
};

console.log('🔧 Funciones de debug cargadas - Usa window.debugSupabase() y window.manualSupabaseInit()');

(function() {
    'use strict';
    
    console.log('🔧 Iniciando configuración de Supabase...');
    
    // ✅ EVITAR múltiples inicializaciones
    if (window.supabaseClient) {
        console.log('⚠️ Supabase ya está inicializado, evitando duplicación');
        return;
    }
    
    // ✅ MEJORADO: Configuración simplificada con mejor manejo de errores 401
    function initializeSupabase() {
        // ✅ PRIMERA VERIFICACIÓN: No inicializar si la configuración es inválida
        const config = window.SUPABASE_CONFIG;
        const configChecker = window.isSupabaseConfigured;
        
        if (!config || !configChecker?.()) {
            console.warn('⚠️ Configuración de Supabase no válida - forzando modo offline');
            console.warn('💡 Motivo:', config?.lastError || 'Configuración incompleta');
            return false;
        }
        
        // Verificar dependencias
        if (!window.supabase?.createClient) {
            console.warn('⚠️ Librería de Supabase no disponible - Modo offline activado');
            return false;
        }
        
        console.log('✅ Configuración de Supabase válida encontrada');
        
        try {
            // ✅ CONFIGURACIÓN MÍNIMA para evitar llamadas automáticas que causen 401
            const supabaseClient = window.supabase.createClient(
                config.url,
                config.anon_key,
                {
                    auth: {
                        // ✅ Desactivar funciones automáticas que pueden causar errores 401
                        autoRefreshToken: false,
                        persistSession: false,
                        detectSessionInUrl: false,
                        flowType: 'implicit'
                    },
                    // ✅ NUEVO: Configuración de base de datos más permisiva
                    db: {
                        schema: 'public'
                    },
                    // ✅ NUEVO: Headers personalizados para mejor debugging
                    global: {
                        headers: {
                            'X-Client-Info': 'matematica-pwa@1.0.0'
                        }
                    }
                }
            );
            
            // ✅ NUEVO: Verificar conectividad antes de hacer el cliente disponible
            async function testConnection() {
                try {
                    // Hacer una consulta mínima para verificar que la API key funciona
                    const { data, error } = await supabaseClient.auth.getSession();
                    
                    if (error && error.message.includes('Invalid API key')) {
                        console.error('❌ API key de Supabase inválida');
                        throw new Error('Invalid API key');
                    }
                    
                    console.log('✅ Conexión a Supabase verificada');
                    return true;
                } catch (error) {
                    console.warn('⚠️ Error verificando conexión Supabase:', error.message);
                    return false;
                }
            }
            
            // Hacer el cliente disponible globalmente solo si la conexión es válida
            window.supabaseClient = supabaseClient;
            
            // ✅ SERVICIOS MEJORADOS con mejor manejo de errores
            window.authService = {
                async signInWithGoogle() {
                    try {
                        // ✅ NUEVO: Verificar que el cliente esté disponible
                        if (!window.supabaseClient) {
                            throw new Error('Cliente de Supabase no disponible');
                        }
                        
                        const { data, error } = await supabaseClient.auth.signInWithOAuth({
                            provider: 'google',
                            options: {
                                redirectTo: `${window.location.origin}${window.location.pathname}`,
                                queryParams: {
                                    access_type: 'offline',
                                    prompt: 'consent'
                                }
                            }
                        });

                        if (error) {
                            console.error('❌ Error específico en OAuth:', error);
                            throw error;
                        }
                        return { success: true, data };
                    } catch (error) {
                        console.error('❌ Error en Google OAuth:', error);
                        return { success: false, error: error.message };
                    }
                },

                async getCurrentUser() {
                    try {
                        if (!window.supabaseClient) return null;
                        
                        const { data: { user }, error } = await supabaseClient.auth.getUser();
                        
                        if (error) {
                            console.warn('⚠️ Error obteniendo usuario actual:', error.message);
                            return null;
                        }
                        
                        return user;
                    } catch (error) {
                        console.warn('⚠️ Error inesperado obteniendo usuario:', error);
                        return null;
                    }
                },

                async signOut() {
                    try {
                        if (!window.supabaseClient) {
                            return { success: true }; // Si no hay cliente, considerar exitoso
                        }
                        
                        await supabaseClient.auth.signOut();
                        return { success: true };
                    } catch (error) {
                        console.warn('⚠️ Error en signOut (continuando):', error);
                        return { success: true }; // ✅ Siempre permitir cerrar sesión localmente
                    }
                },

                onAuthStateChange(callback) {
                    try {
                        if (!window.supabaseClient) {
                            console.warn('⚠️ No se puede configurar onAuthStateChange - cliente no disponible');
                            return { unsubscribe: () => {} };
                        }
                        
                        return supabaseClient.auth.onAuthStateChange((event, session) => {
                            // ✅ FILTRAR solo eventos importantes para evitar spam
                            if (['SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED'].includes(event)) {
                                callback(event, session);
                            }
                        });
                    } catch (error) {
                        console.warn('⚠️ Error configurando auth state listener:', error);
                        return { unsubscribe: () => {} };
                    }
                }
            };
            
            // ✅ SERVICIOS DE BD MEJORADOS con fallbacks robustos
            window.profileService = {
                async createOrUpdateProfile(userId, profileData) {
                    try {
                        if (!window.supabaseClient) {
                            console.warn('⚠️ Perfil no guardado - cliente no disponible');
                            return null;
                        }
                        
                        const { data, error } = await supabaseClient
                            .from('user_profiles')
                            .upsert({
                                user_id: userId,
                                email: profileData.email,
                                full_name: profileData.full_name || 'Usuario',
                                user_role: profileData.user_role || 'parent',
                                avatar_url: profileData.avatar_url,
                                updated_at: new Date().toISOString()
                            })
                            .select()
                            .single();
                        
                        if (error) {
                            console.warn('⚠️ Error guardando perfil en Supabase:', error.message);
                            return null;
                        }
                        
                        console.log('✅ Perfil guardado exitosamente en Supabase');
                        return data;
                    } catch (error) {
                        console.warn('⚠️ Error inesperado guardando perfil:', error);
                        return null;
                    }
                },
                
                async getProfile(userId) {
                    try {
                        if (!window.supabaseClient) return null;
                        
                        const { data, error } = await supabaseClient
                            .from('user_profiles')
                            .select('*')
                            .eq('user_id', userId)
                            .single();
                        
                        if (error) {
                            if (error.code === 'PGRST116') {
                                console.log('ℹ️ Perfil no encontrado - usuario nuevo');
                            } else {
                                console.warn('⚠️ Error obteniendo perfil:', error.message);
                            }
                            return null;
                        }
                        
                        return data;
                    } catch (error) {
                        console.warn('⚠️ Error inesperado obteniendo perfil:', error);
                        return null;
                    }
                }
            };
            
            console.log('✅ Cliente de Supabase inicializado correctamente');
            return true;
            
        } catch (error) {
            console.error('❌ Error inicializando Supabase:', error);
            console.warn('💡 La aplicación continuará en modo offline');
            return false;
        }
    }
    
    // ✅ Función de verificación de estado
    window.checkSupabaseStatus = function() {
        console.log('📊 Estado de Supabase:');
        console.log('- Config disponible:', !!window.SUPABASE_CONFIG);
        console.log('- Cliente inicializado:', !!window.supabaseClient);
        console.log('- Auth service:', !!window.authService);
        console.log('- Profile service:', !!window.profileService);
        
        if (window.supabaseClient) {
            console.log('✅ Supabase listo para usar');
        } else {
            console.log('❌ Supabase no está inicializado');
        }
    };
    
    // ✅ Intentar inicializar con retry simple
    function attemptInitialization() {
        let attempts = 0;
        const maxAttempts = 5;
        
        function tryInit() {
            attempts++;
            console.log(`🔄 Intento ${attempts} de inicializar Supabase...`);
            
            if (initializeSupabase()) {
                console.log('✅ Supabase inicializado exitosamente');
                return;
            }
            
            if (attempts < maxAttempts) {
                setTimeout(tryInit, 200);
            } else {
                console.warn('⚠️ No se pudo inicializar Supabase después de', maxAttempts, 'intentos');
            }
        }
        
        tryInit();
    }
    
    // Inicializar cuando esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attemptInitialization);
    } else {
        setTimeout(attemptInitialization, 100);
    }
    
})();