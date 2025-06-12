// js/auth.js - Sistema de Autenticación v20.0 - Sistema simplificado sin config-service
console.log("🚀 Auth System v20.0 - Sistema simplificado sin config-service");

class AuthenticationSystem {
    constructor() {
        this.supabase = null;
        this.selectedRole = null;
        
        // Configuración directa - SIMPLE
        this.config = {
            supabaseUrl: 'https://uznvakpuuxnpdhoejrog.supabase.co',
            supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bnZha3B1dXhucGRob2Vqcm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM2MzQ0MzYsImV4cCI6MjA0OTIxMDQzNn0.Q9zxJVGbfTuKK1zokYcGIZhfCVhcqCHi2UGLzjBqO0w'
        };
        
        this.init();
    }

    async init() {
        console.log("🔍 Modo detectado: DESARROLLO LOCAL");
        console.log("🏠 Cargando configuración directa...");
        
        // Inicializar Supabase directamente
        this.supabase = window.supabase.createClient(
            this.config.supabaseUrl,
            this.config.supabaseAnonKey
        );
        
        console.log("✅ Cliente Supabase inicializado directamente");
        
        // Configurar elementos y manejar carga inicial
        this.setupElements();
        await this.handleInitialLoad();
    }

    setupElements() {
        console.log("🔧 Elementos de auth configurados");
        console.log("✅ Auth.js integrado con funciones HTML existentes");
    }

    // Método para seleccionar rol desde HTML
    selectRole(role) {
        this.selectedRole = role;
        localStorage.setItem('matemagica_selected_role', role);
        console.log(`🎭 Rol seleccionado: ${role}`);
    }

    // Método principal de autenticación llamado desde HTML
    async signInWithGoogle() {
        if (!this.selectedRole) {
            this.selectedRole = localStorage.getItem('matemagica_selected_role');
            if (!this.selectedRole) {
                this.showError("role");
                return false;
            }
        }
        
        this.showLoader(true, "loading");
        
        try {
            console.log("🔐 Iniciando OAuth con Google...");
            
            // ✅ DETECCIÓN MEJORADA DE ENTORNO
            const isLocalDev = window.location.hostname === 'localhost' || 
                              window.location.hostname === '127.0.0.1' ||
                              window.location.port === '8001' ||
                              window.location.port === '8000' ||
                              window.location.port === '3000';
            
            const currentOrigin = window.location.origin;
            const redirectUrl = `${currentOrigin}/dashboard.html`;
            
            console.log(`🔍 Entorno detectado: ${isLocalDev ? 'DESARROLLO LOCAL' : 'PRODUCCIÓN'}`);
            console.log(`🏠 Dominio actual: ${currentOrigin}`);
            console.log(`🔄 URL de redirección solicitada: ${redirectUrl}`);
            
            // ⚠️ ADVERTENCIA para desarrollo local
            if (isLocalDev) {
                console.warn(`
🚨 DESARROLLO LOCAL DETECTADO
📋 Para que OAuth funcione correctamente:
1. Ve a Supabase Dashboard → Authentication → Settings
2. Agrega a "Additional Redirect URLs": ${currentOrigin}/**
3. O cambia temporalmente "Site URL" a: ${currentOrigin}
4. Sin esto, siempre redirigirá a producción
                `);
            }
            
            const { error } = await this.supabase.auth.signInWithOAuth({ 
                provider: 'google', 
                options: { 
                    redirectTo: redirectUrl
                } 
            });
            
            if (error) {
                console.error("❌ Error en OAuth:", error);
                
                // ✅ Mensaje específico para desarrollo local
                if (isLocalDev) {
                    console.error(`
🔧 SOLUCIÓN PARA DESARROLLO LOCAL:
1. Ve a https://supabase.com/dashboard
2. Tu proyecto → Authentication → Settings
3. Agrega: ${currentOrigin}/** a "Additional Redirect URLs"
                    `);
                }
                
                this.handleAuthError("network");
                return false;
            }
            
            console.log("✅ OAuth iniciado correctamente");
            return true;
        } catch (error) {
            console.error("❌ Error en signInWithGoogle:", error);
            this.handleAuthError("network");
            return false;
        }
    }

    async handleInitialLoad() {
        this.showLoader(true, "loading");
        
        try {
            console.log("🔍 === INICIANDO DETECCIÓN DE SESIÓN ===");
            
            // Verificar parámetros OAuth en URL primero
            const urlParams = this.parseUrlFragment();
            console.log("🔗 Parámetros OAuth en URL:", urlParams ? "✅ ENCONTRADOS" : "❌ NO ENCONTRADOS");
            
            if (urlParams) {
                console.log("🔐 Procesando callback OAuth...");
                console.log("🧹 Limpiando URL...");
                this.cleanupUrl();
                
                console.log("🔑 Estableciendo sesión con tokens...");
                const { error } = await this.supabase.auth.setSession(urlParams);
                if (error) {
                    console.error("❌ Error estableciendo sesión:", error);
                    throw error;
                }
                
                console.log("👤 Obteniendo datos del usuario...");
                const { data: { user } } = await this.supabase.auth.getUser();
                console.log("📋 Usuario obtenido:", user ? `✅ ${user.email}` : "❌ NO ENCONTRADO");
                
                if (user) {
                    console.log("🎉 ¡CALLBACK OAUTH EXITOSO! Procesando login...");
                    await this.onLoginSuccess(user);
                    return;
                } else {
                    console.error("❌ PROBLEMA: Sesión establecida pero no se puede obtener usuario");
                }
            }
            
            // Verificar sesión existente
            console.log("🔍 Verificando sesión existente...");
            const { data: { session }, error: sessionError } = await this.supabase.auth.getSession();
            console.log("📊 Resultado de getSession():", {
                hasSession: !!session,
                hasUser: !!(session?.user),
                error: sessionError ? sessionError.message : "ninguno"
            });
            
            if (session && session.user) {
                console.log("✅ Sesión existente encontrada, redirigiendo...");
                await this.onLoginSuccess(session.user);
                return;
            }
            
            // No hay sesión, mostrar interfaz de login
            console.log("ℹ️ No hay sesión activa, mostrando pantalla de bienvenida");
            this.showInterface();
            
        } catch (error) {
            console.error("❌ Error en carga inicial:", error);
            console.error("📋 Detalles del error:", {
                message: error.message,
                stack: error.stack
            });
            this.handleAuthError("session");
        }
    }

    parseUrlFragment() {
        const fragment = window.location.hash.substring(1);
        if (!fragment) return null;
        
        const params = new URLSearchParams(fragment);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        
        if (accessToken && refreshToken) {
            return {
                access_token: accessToken,
                refresh_token: refreshToken,
                expires_in: params.get('expires_in'),
                token_type: params.get('token_type') || 'bearer'
            };
        }
        
        return null;
    }

    cleanupUrl() {
        const url = new URL(window.location);
        url.hash = '';
        window.history.replaceState({}, document.title, url.toString());
    }

    async onLoginSuccess(user) {
        console.log("🎉 Login exitoso para:", user.email);
        
        try {
            // Guardar información del usuario
            localStorage.setItem('matemagica_user', JSON.stringify({
                id: user.id,
                email: user.email,
                name: user.user_metadata?.full_name || user.email,
                role: this.selectedRole
            }));
            
            console.log("💾 Datos de usuario guardados");
            console.log("🔄 Redirigiendo al dashboard...");
            
            // Redirección inmediata
            window.location.href = '/dashboard.html';
            
        } catch (error) {
            console.error("❌ Error en onLoginSuccess:", error);
            this.handleAuthError("processing");
        }
    }

    showInterface() {
        this.showLoader(false);
        console.log("🎨 Interfaz de bienvenida mostrada");
    }

    showLoader(show, type = "loading") {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            if (show) {
                overlay.classList.remove('hidden-screen');
            } else {
                overlay.classList.add('hidden-screen');
            }
        }
        
        // También llamar a la función global si existe
        if (window.mostrarCargando) {
            window.mostrarCargando(show);
        }
    }

    showError(type) {
        let mensaje = "";
        switch(type) {
            case "role":
                mensaje = "🎭 ¡Primero elige si eres profesor o apoderado!";
                break;
            case "network":
                mensaje = "🌐 Error de conexión. ¡Inténtalo de nuevo!";
                break;
            case "session":
                mensaje = "🔑 Error de sesión. ¡Recarga la página!";
                break;
            case "processing":
                mensaje = "⚙️ Error procesando datos. ¡Inténtalo de nuevo!";
                break;
            default:
                mensaje = "❌ Error inesperado. ¡Inténtalo de nuevo!";
        }
        
        console.error("⚠️ Error:", mensaje);
        
        // Llamar a la función global si existe
        if (window.mostrarError) {
            window.mostrarError(mensaje);
        }
    }

    handleAuthError(type) {
        this.showLoader(false);
        this.showError(type);
    }
}

// 🌍 Crear instancia global
window.loginSystem = new AuthenticationSystem();
