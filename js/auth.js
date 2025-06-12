// js/auth.js - Sistema SIMPLE v18.0 - CORREGIDO
console.log("🚀 Auth System v18.0 - Versión SIMPLE");

class LoginSystem {
    constructor() {
        this.config = {
            url: "https://uznvakpuuxnpdhoejrog.supabase.co",
            anon_key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bnZha3B1dXhucGRob2Vqcm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODg0MTAsImV4cCI6MjA2NDY2NDQxMH0.OxbLYkjlgpWFnqd28gaZSwar_NQ6_qUS3U76bqbcXVg"
        };
        this.supabase = null;
        this.elements = {};
        this.selectedRole = null;
        
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

    async init() {
        try {
            console.log("🔧 Inicializando cliente Supabase...");
            
            if (!window.supabase) {
                throw new Error("Librería Supabase no disponible");
            }
            
            // Crear cliente Supabase
            this.supabase = window.supabase.createClient(this.config.url, this.config.anon_key);
            console.log("✅ Cliente Supabase inicializado");
            
            // Configurar elementos DOM
            this.setupDOMElements();
            this.setupEventListeners();
            
            // Manejar carga inicial
            await this.handleInitialLoad();
            
        } catch (error) {
            console.error("❌ Error en init:", error);
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
            googleAuthBtn: document.getElementById('google-auth-btn'),
            backBtn: document.getElementById('back-to-welcome-btn')
        };
        
        console.log("🔧 Elementos DOM configurados");
    }

    setupEventListeners() {
        // Solo efectos visuales básicos
        const buttons = [this.elements.teacherRoleBtn, this.elements.parentRoleBtn];
        
        buttons.forEach(btn => {
            if (btn) {
                btn.addEventListener('mouseenter', () => {
                    btn.style.transform = 'translateY(-4px)';
                });
                btn.addEventListener('mouseleave', () => {
                    btn.style.transform = 'translateY(0)';
                });
            }
        });
        
        console.log("✅ Event listeners configurados");
    }

    async handleInitialLoad() {
        this.showLoader(true);
        
        try {
            // Verificar callback OAuth
            const urlParams = this.parseUrlFragment();
            if (urlParams) {
                console.log("🔐 Procesando callback OAuth");
                this.cleanupUrl();
                
                const { error } = await this.supabase.auth.setSession(urlParams);
                if (error) throw error;
                
                const { data: { user } } = await this.supabase.auth.getUser();
                if (user) {
                    await this.onLoginSuccess(user);
                    return;
                }
            }
            
            // Verificar sesión existente
            const { data: { session } } = await this.supabase.auth.getSession();
            if (session?.user) {
                console.log("✅ Sesión existente encontrada");
                await this.onLoginSuccess(session.user);
                return;
            }
            
            // Mostrar login
            this.showLoader(false);
            console.log("ℹ️ Mostrando login");
            
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
            console.log("🔐 Iniciando OAuth con Google");
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
        const userProfile = {
            user_id: user.id, 
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email.split('@')[0],
            avatar_url: user.user_metadata?.avatar_url,
            user_role: role
        };
        
        try {
            console.log("💾 Guardando perfil");
            
            // Intentar guardar en Supabase (sin bloquear si falla)
            try {
                await this.supabase.from('math_profiles').upsert(userProfile, { 
                    onConflict: 'user_id' 
                });
            } catch (dbError) {
                console.warn('⚠️ Error en BD (continuando):', dbError.message);
            }
            
            // SIEMPRE guardar localmente
            localStorage.setItem('matemagica-user-profile', JSON.stringify(userProfile));
            localStorage.setItem('matemagica-authenticated', 'true');
            localStorage.removeItem('matemagica_selected_role');
            
            // Redirección directa
            this.showLoader(true, "success");
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
            
        } catch (error) {
            console.error("❌ Error en onLoginSuccess:", error);
            // Guardar localmente y continuar
            localStorage.setItem('matemagica-user-profile', JSON.stringify(userProfile));
            localStorage.setItem('matemagica-authenticated', 'true');
            window.location.href = 'dashboard.html';
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
}

// Inicialización simple
new LoginSystem();
