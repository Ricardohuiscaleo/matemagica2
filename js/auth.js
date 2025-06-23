// js/auth.js - Sistema SIMPLE v18.1 - USANDO CONFIG SERVICE
console.log("🚀 Auth System v18.1 - Versión SIMPLE con ConfigService");

class LoginSystem {
    constructor() {
        this.config = null; // Se cargará dinámicamente desde ConfigService
        this.supabase = null;
        this.elements = {};
        this.initialized = false;
        
        // Mensajes simples
        this.friendlyMessages = {
            loading: ["🧮 ¡Preparando tu aventura matemática!"],
            success: ["🎉 ¡Perfecto! Entrando a tu aventura matemática..."],
            errors: {
                role: "🎭 ¡Primero elige si eres profesor o apoderado!",
                general: "🔧 ¡Oops! Algo no funcionó. ¡Vamos a intentarlo de nuevo!"
            }
        };
        
        // Bind métodos correctamente
        this.init = this.init.bind(this);
        this.setupDOMElements = this.setupDOMElements.bind(this);
        this.setupEventListeners = this.setupEventListeners.bind(this);
        this.handleInitialLoad = this.handleInitialLoad.bind(this);
        this.selectRole = this.selectRole.bind(this);
        this.signInWithGoogle = this.signInWithGoogle.bind(this);
        this.onLoginSuccess = this.onLoginSuccess.bind(this);
        this.showLoader = this.showLoader.bind(this);
        this.showError = this.showError.bind(this);
        this.parseUrlFragment = this.parseUrlFragment.bind(this);
        this.cleanupUrl = this.cleanupUrl.bind(this);
        
        // Hacer disponible globalmente
        window.loginSystem = this;
        window.addEventListener('load', this.init);
    }

    // 🔧 NUEVO: Inicializar configuración desde ConfigService
    async initializeConfig() {
        try {
            console.log("🔧 Cargando configuración desde ConfigService...");
            
            // Cargar configuración
            const config = await window.ConfigService.loadConfig();
            
            this.config = {
                url: config.supabase.url,
                anon_key: config.supabase.anonKey
            };
            
            console.log("✅ Configuración cargada correctamente");
            console.log("🔗 URL:", this.config.url);
            console.log("🔑 Key:", this.config.anon_key.substring(0, 20) + "...");
            
            return true;
        } catch (error) {
            console.error("❌ Error cargando configuración:", error);
            
            // Fallback a configuración hardcodeada
            this.config = {
                url: "https://uznvakpuuxnpdhoejrog.supabase.co",
                anon_key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bnZha3B1dXhucGRob2Vqcm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODg0MTAsImV4cCI6MjA2NDY2NDQxMH0.OxbLYkjlgpWFnqd28gaZSwar_NQ6_qUS3U76bqbcXVg"
            };
            console.log("⚠️ Usando configuración de fallback");
            return false;
        }
    }

    // 🚀 NUEVO: Método de inicialización completa
    async initialize() {
        if (this.initialized) {
            console.log("ℹ️ Sistema ya inicializado");
            return true;
        }

        try {
            // 1. Cargar configuración
            await this.initializeConfig();

            // 2. Inicializar Supabase
            this.initSupabase();

            // 3. Configurar elementos UI
            this.setupElements();

            // 4. Configurar eventos
            this.setupEventListeners();

            this.initialized = true;
            console.log("✅ LoginSystem inicializado completamente");
            return true;
        } catch (error) {
            console.error("❌ Error inicializando LoginSystem:", error);
            return false;
        }
    }

    async init() {
        try {
            console.log("🔧 Inicializando LoginSystem...");
            
            // 1. Cargar configuración primero
            await this.initializeConfig();
            
            if (!window.supabase) {
                throw new Error("Librería Supabase no disponible");
            }
            
            // 2. Crear cliente Supabase
            this.supabase = window.supabase.createClient(this.config.url, this.config.anon_key);
            console.log("✅ Cliente Supabase inicializado");
            
            // ✅ NUEVO: Exponer cliente globalmente para otros módulos
            window.supabaseClient = this.supabase;
            
            // 3. Configurar elementos DOM
            this.setupDOMElements();
            this.setupEventListeners();
            
            // 4. Manejar carga inicial
            await this.handleInitialLoad();
            
        } catch (error) {
            console.error("❌ Error en init:", error);
            this.showLoader(false);
        }
    }

    // 🆕 NUEVO: Método handleInitialLoad que estaba faltando
    async handleInitialLoad() {
        try {
            console.log("🔄 Manejando carga inicial...");
            
            // ✅ NUEVO: Verificar si el usuario acaba de hacer logout
            const recentLogout = sessionStorage.getItem('matemagica-recent-logout');
            if (recentLogout) {
                const logoutTime = parseInt(recentLogout);
                const now = Date.now();
                
                // Si el logout fue hace menos de 30 segundos, no auto-login
                if (now - logoutTime < 30000) {
                    console.log("🚪 Logout reciente detectado - no auto-login");
                    sessionStorage.removeItem('matemagica-recent-logout');
                    this.showLoader(false);
                    return;
                }
                
                // Limpiar marca de logout expirada
                sessionStorage.removeItem('matemagica-recent-logout');
            }
            
            // ✅ NUEVO: Verificar si hay una marca de "no auto-login"
            const skipAutoLogin = localStorage.getItem('matemagica-skip-autologin');
            if (skipAutoLogin === 'true') {
                console.log("⏭️ Auto-login deshabilitado por usuario");
                localStorage.removeItem('matemagica-skip-autologin');
                this.showLoader(false);
                return;
            }
            
            // Verificar si hay tokens OAuth en la URL
            const oauthTokens = this.parseUrlFragment();
            if (oauthTokens) {
                console.log("🔐 Tokens OAuth encontrados en URL");
                this.showLoader(true);
                
                try {
                    // Configurar sesión con tokens OAuth
                    const { data, error } = await this.supabase.auth.setSession({
                        access_token: oauthTokens.access_token,
                        refresh_token: oauthTokens.refresh_token
                    });
                    
                    if (error) {
                        console.error("❌ Error estableciendo sesión OAuth:", error);
                        throw error;
                    }
                    
                    if (data.session?.user) {
                        console.log("✅ Sesión OAuth establecida:", data.session.user.email);
                        
                        // Limpiar URL después de procesar tokens
                        this.cleanupUrl();
                        
                        // Procesar login exitoso
                        await this.onLoginSuccess(data.session.user);
                        return;
                    }
                } catch (oauthError) {
                    console.error("❌ Error procesando tokens OAuth:", oauthError);
                    this.cleanupUrl(); // Limpiar URL incluso si falla
                    this.showError("general");
                    this.showLoader(false);
                    return;
                }
            }
            
            // ✅ MEJORADO: Verificar sesión existente solo si no acabamos de hacer logout
            const { data: { session }, error } = await this.supabase.auth.getSession();
            if (session?.user && !error) {
                // ✅ NUEVO: Verificar si tenemos datos locales que coincidan
                const localAuth = localStorage.getItem('matemagica-authenticated');
                const localProfile = localStorage.getItem('matemagica-user-profile');
                
                if (localAuth === 'true' && localProfile) {
                    try {
                        const profile = JSON.parse(localProfile);
                        if (profile.user_id === session.user.id) {
                            console.log("✅ Sesión existente válida encontrada:", session.user.email);
                            await this.onLoginSuccess(session.user);
                            return;
                        }
                    } catch (e) {
                        console.warn("⚠️ Error validando perfil local:", e);
                    }
                }
                
                // Si la sesión existe pero no hay datos locales válidos, limpiar todo
                console.log("🧹 Sesión remota sin datos locales válidos - limpiando...");
                await this.supabase.auth.signOut();
            }
            
            // No hay sesión válida - mostrar pantalla de login
            console.log("ℹ️ No hay sesión válida - mostrando login");
            this.showLoader(false);
            
        } catch (error) {
            console.error("❌ Error en handleInitialLoad:", error);
            this.showLoader(false);
        }
    }

    setupDOMElements() {
        this.elements = {
            cardFlipper: document.getElementById('card-flipper'),
            loadingOverlay: document.getElementById('loading-overlay'),
            errorDisplay: document.getElementById('error-display'),
            teacherRoleBtn: document.getElementById('teacher-role-btn'),
            parentRoleBtn: document.getElementById('parent-role-btn'),
        };
    }

    setupEventListeners() {
        try {
            // Verificar elementos DOM
            if (this.elements.teacherRoleBtn) {
                this.elements.teacherRoleBtn.addEventListener('click', () => this.selectRole('teacher'));
            }
            if (this.elements.parentRoleBtn) {
                this.elements.parentRoleBtn.addEventListener('click', () => this.selectRole('parent'));
            }
        } catch (error) {
            console.warn("⚠️ Error en verificación:", error.message);
            this.showLoader(false);
        }
    }

    selectRole(role) {
        console.log('👤 Rol seleccionado:', role);
        this.selectedRole = role;
        localStorage.setItem('matemagica_selected_role', role);
        return true;
    }

    async signInWithGoogle() {
        if (!this.selectedRole) {
            this.showError("role");
            return false;
        }
        
        this.showLoader(true);
        
        try {
            console.log("🔐 Iniciando OAuth with Google");
            const { error } = await this.supabase.auth.signInWithOAuth({ 
                provider: 'google', 
                options: { redirectTo: window.location.origin } 
            });
            
            if (error) throw error;
            console.log("✅ OAuth iniciado");
            return true;
        } catch (error) {
            console.error("❌ Error en OAuth:", error);
            this.showError("general");
            this.showLoader(false);
            return false;
        }
    }

    async onLoginSuccess(user) {
        const role = localStorage.getItem('matemagica_selected_role') || 'parent';
        
        // ✅ TODOS ENTRAN COMO USUARIOS NORMALES (sin detección automática de admin)
        const userProfile = {
            user_id: user.id, 
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email.split('@')[0],
            avatar_url: user.user_metadata?.avatar_url || null,
            user_role: role, // Usar el rol seleccionado por el usuario (parent/teacher)
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        try {
            console.log("💾 Guardando perfil");
            
            // Siempre guardar localmente PRIMERO (más confiable)
            localStorage.setItem('matemagica-user-profile', JSON.stringify(userProfile));
            localStorage.setItem('matemagica-authenticated', 'true');
            localStorage.removeItem('matemagica_selected_role');
            
            // Intentar guardar en Supabase de forma opcional (sin bloquear)
            try {
                // Verificar si ya existe el perfil
                const { data: existingProfile, error: checkError } = await this.supabase
                    .from('math_profiles')
                    .select('user_id')
                    .eq('user_id', user.id)
                    .single();
                
                if (checkError && checkError.code !== 'PGRST116') {
                    // Error diferente a "no encontrado"
                    console.warn('⚠️ Error verificando perfil existente:', checkError.message);
                }
                
                let dbResult;
                if (existingProfile) {
                    // Actualizar perfil existente
                    dbResult = await this.supabase
                        .from('math_profiles')
                        .update({
                            email: userProfile.email,
                            full_name: userProfile.full_name,
                            avatar_url: userProfile.avatar_url,
                            updated_at: userProfile.updated_at
                        })
                        .eq('user_id', user.id);
                } else {
                    // Crear nuevo perfil
                    dbResult = await this.supabase
                        .from('math_profiles')
                        .insert([userProfile]);
                }
                
                if (dbResult.error) {
                    console.warn('⚠️ Error guardando en BD (modo desarrollo):', dbResult.error.message);
                    console.warn('⚠️ Detalles del error:', dbResult.error);
                    // En desarrollo, los errores de BD no son críticos
                } else {
                    console.log('✅ Perfil guardado en BD correctamente');
                }
            } catch (dbError) {
                console.warn('⚠️ BD no disponible (modo desarrollo):', dbError.message);
                // En modo desarrollo, esto es normal si la BD no está configurada
            }
            
            // Redirección directa SEGÚN ROL SELECCIONADO (sin detección especial)
            this.showLoader(true, "success");
            setTimeout(() => {
                if (role === 'parent') {
                    console.log('👨‍👩‍👧‍👦 Redirigiendo apoderado a dashboard específico');
                    window.location.href = 'apoderado-dashboard.html';
                } else if (role === 'teacher') {
                    console.log('👩‍🏫 Redirigiendo profesor a dashboard específico');
                    window.location.href = 'profesor-dashboard.html';
                } else {
                    // Fallback al dashboard legacy
                    console.log('🎯 Rol no reconocido, usando dashboard legacy');
                    window.location.href = 'dashboard-legacy.html';
                }
            }, 1000);
            
        } catch (error) {
            console.error("❌ Error en onLoginSuccess:", error);
            // Fallback: Guardar solo localmente y continuar
            localStorage.setItem('matemagica-user-profile', JSON.stringify(userProfile));
            localStorage.setItem('matemagica-authenticated', 'true');
            localStorage.removeItem('matemagica_selected_role');
            
            this.showLoader(true, "success");
            setTimeout(() => {
                if (role === 'parent') {
                    console.log('👨‍👩‍👧‍👦 Redirigiendo apoderado a dashboard específico');
                    window.location.href = 'apoderado-dashboard.html';
                } else if (role === 'teacher') {
                    console.log('👩‍🏫 Redirigiendo profesor a dashboard específico');
                    window.location.href = 'profesor-dashboard.html';
                } else {
                    // Fallback al dashboard legacy
                    console.log('🎯 Rol no reconocido, usando dashboard legacy');
                    window.location.href = 'dashboard-legacy.html';
                }
            }, 1000);
        }
    }

    showLoader(show, type = "loading") {
        const overlay = this.elements.loadingOverlay;
        if (!overlay) return;
        
        if (show) {
            overlay.classList.remove('hidden-screen');
            overlay.style.display = 'flex';
            
            const loadingText = overlay.querySelector('.loading-text');
            if (loadingText && this.friendlyMessages[type]) {
                const messages = this.friendlyMessages[type];
                const message = Array.isArray(messages) ? messages[0] : messages;
                loadingText.textContent = message;
            }
        } else {
            overlay.classList.add('hidden-screen');
            overlay.style.display = 'none';
        }
    }

    showError(errorType) {
        const message = this.friendlyMessages.errors[errorType] || this.friendlyMessages.errors.general;
        const errorDisplay = this.elements.errorDisplay;
        
        if (errorDisplay) {
            errorDisplay.textContent = message;
            errorDisplay.style.display = 'block';
            
            setTimeout(() => { 
                errorDisplay.style.display = 'none'; 
            }, 4000);
        }
    }

    parseUrlFragment() {
        try {
            const params = new URLSearchParams(window.location.hash.substring(1));
            const accessToken = params.get('access_token');
            if (accessToken) {
                return { 
                    access_token: accessToken, 
                    refresh_token: params.get('refresh_token') 
                };
            }
        } catch (e) { 
            console.log("No hay parámetros OAuth en URL");
        }
        return null;
    }

    cleanupUrl() {
        if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname);
        }
    }

    // ✅ NUEVO: Método signOut para cerrar sesión completamente
    async signOut() {
        try {
            console.log('🚪 === INICIANDO LOGOUT COMPLETO ===');
            
            // 🆕 NUEVO: Marcar logout reciente para evitar auto-login
            sessionStorage.setItem('matemagica-recent-logout', Date.now().toString());
            
            // 1. Cerrar sesión en Supabase primero
            if (this.supabase && this.supabase.auth) {
                console.log('🚪 Cerrando sesión en Supabase...');
                const { error } = await this.supabase.auth.signOut();
                if (error) {
                    console.warn('⚠️ Error cerrando sesión en Supabase:', error.message);
                } else {
                    console.log('✅ Sesión cerrada en Supabase');
                }
            }
            
            // 2. Limpiar localStorage completo
            console.log('🧹 Limpiando localStorage...');
            const itemsToRemove = [
                'matemagica-authenticated',
                'matemagica-user-profile',
                'matemagica_selected_role',
                'matemagica_user',
                'matemagica_profile',
                'matemagica_role',
                'matemagica_student_info',
                'currentUser',
                'userProfile',
                'selectedRole',
                'studentData',
                'ejerciciosHistorial',
                'profesorEstudiantes',
                'profesorEjerciciosHistorial'
            ];
            
            itemsToRemove.forEach(item => {
                localStorage.removeItem(item);
                console.log(`  ✅ Removido: ${item}`);
            });
            
            // 3. Limpiar sessionStorage (excepto la marca de logout reciente)
            console.log('🧹 Limpiando sessionStorage...');
            const recentLogout = sessionStorage.getItem('matemagica-recent-logout');
            sessionStorage.clear();
            if (recentLogout) {
                sessionStorage.setItem('matemagica-recent-logout', recentLogout);
            }
            
            // 4. Limpiar cookies relacionadas
            console.log('🍪 Limpiando cookies...');
            document.cookie.split(";").forEach(function(c) { 
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
            });
            
            // 5. Limpiar estado interno del sistema
            this.selectedRole = null;
            this.initialized = false;
            
            // 6. Limpiar referencias globales si existen
            if (window.welcomeAuthManager) {
                window.welcomeAuthManager.currentUser = null;
                window.welcomeAuthManager.userProfile = null;
                window.welcomeAuthManager.selectedRole = null;
                window.welcomeAuthManager.studentInfo = null;
            }
            
            console.log('✅ === LOGOUT COMPLETO FINALIZADO ===');
            console.log('⏰ Marca de logout guardada - auto-login bloqueado por 30 segundos');
            
            // 7. Redireccionar al login después de un breve delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
            
        } catch (error) {
            console.error('❌ Error durante logout:', error);
            
            // Fallback: limpiar localStorage básico y redireccionar
            sessionStorage.setItem('matemagica-recent-logout', Date.now().toString());
            localStorage.clear();
            sessionStorage.clear();
            sessionStorage.setItem('matemagica-recent-logout', Date.now().toString());
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        }
    }
}

// Inicialización simple
new LoginSystem();
