// js/auth.js - Sistema de Autenticación v18.0 - Funcional como producción
console.log("🚀 Auth System v18.0 - Versión de producción");

class LoginSystem {
    constructor() {
        this.config = {
            url: "https://uznvakpuuxnpdhoejrog.supabase.co",
            anon_key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bnZha3B1dXhucGRob2Vqcm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODg0MTAsImV4cCI6MjA2NDY2NDQxMH0.OxbLYkjlgpWFnqd28gaZSwar_NQ6_qUS3U76bqbcXVg"
        };
        this.supabase = null;
        this.elements = {};
        this.selectedRole = null;
        
        // Mensajes amigables para niños
        this.friendlyMessages = {
            loading: [
                "🧮 ¡Preparando tu aventura matemática!",
                "✨ Buscando números mágicos...",
                "🎯 Organizando ejercicios divertidos...",
                "🌟 Casi listo para empezar..."
            ],
            success: [
                "🎉 ¡Perfecto! Entrando a tu aventura matemática...",
                "✨ ¡Genial! Preparando tu espacio de aprendizaje...",
                "🌟 ¡Excelente! Tu cuenta está lista...",
                "🚀 ¡Fantástico! Iniciando tu experiencia matemática..."
            ],
            errors: {
                session: "😊 ¡Ups! Necesitamos verificar que eres tú. ¡Intentémoslo de nuevo!",
                auth: "🤔 Algo salió mal al conectarte. ¡No te preocupes, podemos intentarlo otra vez!",
                general: "🔧 ¡Oops! Algo no funcionó como esperábamos. ¡Vamos a intentarlo de nuevo!",
                network: "📡 Parece que no hay internet. ¡Revisa tu conexión y vuelve a intentar!",
                role: "🎭 ¡Primero elige si eres profesor o apoderado!"
            }
        };
        
        // Bind métodos al contexto
        Object.getOwnPropertyNames(Object.getPrototypeOf(this))
            .filter(prop => typeof this[prop] === 'function' && prop !== 'constructor')
            .forEach(prop => { this[prop] = this[prop].bind(this); });

        // Hacer disponible globalmente para el HTML
        window.loginSystem = this;
        window.addEventListener('load', this.init);
    }

    async init() {
        try {
            if (!window.supabase) throw new Error("Librería Supabase no disponible.");
            this.supabase = window.supabase.createClient(this.config.url, this.config.anon_key);
            console.log("✅ Cliente Supabase inicializado.");
            this.setupDOMElements();
            this.setupEventListeners();
            await this.handleInitialLoad();
        } catch (error) {
            console.error("❌ Error en init auth:", error);
            this.handleAuthError("general");
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
        
        console.log("🔧 Elementos de auth configurados");
    }

    setupEventListeners() {
        // Integrar con las funciones del HTML - NO duplicar eventos
        console.log("✅ Auth.js integrado con funciones HTML existentes");
        
        // Solo agregar efectos hover visuales adicionales
        [this.elements.teacherRoleBtn, this.elements.parentRoleBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('mouseenter', () => {
                    btn.style.transform = 'translateY(-8px) scale(1.05)';
                });
                btn.addEventListener('mouseleave', () => {
                    btn.style.transform = 'translateY(0) scale(1)';
                });
            }
        });
    }

    async handleInitialLoad() {
        this.showLoader(true, "loading");
        
        try {
            // Verificar parámetros OAuth en URL primero
            const urlParams = this.parseUrlFragment();
            if (urlParams) {
                console.log("🔐 Procesando callback OAuth...");
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
            if (session && session.user) {
                console.log("✅ Sesión existente encontrada, redirigiendo...");
                await this.onLoginSuccess(session.user);
                return;
            }
            
            // No hay sesión, mostrar interfaz de login
            this.showLoader(false);
            console.log("ℹ️ No hay sesión activa, mostrando login");
            
        } catch (error) {
            console.warn("⚠️ Error en verificación de sesión:", error.message);
            this.showLoader(false);
            console.log("ℹ️ Mostrando login después de error en verificación");
        }
    }

    // Método llamado desde el HTML
    selectRole(role) {
        console.log('👤 Rol seleccionado desde auth.js:', role);
        this.selectedRole = role;
        localStorage.setItem('matemagica_selected_role', role);
        return true;
    }

    // Método principal de autenticación llamado desde HTML
    async signInWithGoogle() {
        if (!this.selectedRole) {
            this.showError("role");
            return false;
        }
        
        this.showLoader(true, "loading");
        
        try {
            console.log("🔐 Iniciando OAuth con Google...");
            const { error } = await this.supabase.auth.signInWithOAuth({ 
                provider: 'google', 
                options: { redirectTo: window.location.origin } 
            });
            
            if (error) {
                console.error("❌ Error en OAuth:", error);
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

    async onLoginSuccess(user) {
        const role = localStorage.getItem('matemagica_selected_role') || 'parent';
        const userProfile = {
            user_id: user.id, 
            email: user.email,
            full_name: user.user_metadata?.full_name,
            avatar_url: user.user_metadata?.avatar_url,
            user_role: role
        };
        
        try {
            console.log("💾 Guardando perfil en Supabase...", userProfile);
            await this.supabase.from('math_profiles').upsert(userProfile);
            localStorage.setItem('matemagica-user-profile', JSON.stringify(userProfile));
            localStorage.removeItem('matemagica_selected_role');
            
            // Mostrar mensaje de éxito y redirigir
            this.showLoader(true, "success");
            setTimeout(() => {
                this.redirectUser();
            }, 2000);
            
        } catch (error) {
            console.error("❌ Error guardando perfil:", error);
            this.handleAuthError("general");
        }
    }

    redirectUser() {
        console.log("🔄 Redirigiendo al dashboard...");
        window.location.assign('dashboard.html');
    }

    showLoader(show, type = "loading") {
        if (this.elements.loadingOverlay) {
            if (show) {
                this.elements.loadingOverlay.classList.remove('hidden-screen');
                this.elements.loadingOverlay.style.display = 'flex';
                
                const loadingText = this.elements.loadingOverlay.querySelector('.loading-text');
                if (loadingText && this.friendlyMessages[type]) {
                    const messages = Array.isArray(this.friendlyMessages[type]) 
                        ? this.friendlyMessages[type] 
                        : [this.friendlyMessages[type]];
                    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
                    loadingText.textContent = randomMessage;
                }
            } else {
                this.elements.loadingOverlay.classList.add('hidden-screen');
                this.elements.loadingOverlay.style.display = 'none';
                console.log("✅ Loading overlay ocultado, interfaz de login visible");
            }
        }
    }

    showError(errorType) {
        const message = this.friendlyMessages.errors[errorType] || this.friendlyMessages.errors.general;
        if (this.elements.errorDisplay) {
            this.elements.errorDisplay.textContent = message;
            this.elements.errorDisplay.style.display = 'block';
            
            // Animación de entrada
            this.elements.errorDisplay.style.animation = 'none';
            setTimeout(() => {
                this.elements.errorDisplay.style.animation = 'bounce 0.5s ease-out';
            }, 10);
            
            setTimeout(() => { 
                this.elements.errorDisplay.style.display = 'none'; 
            }, 5000);
        }
    }

    handleAuthError(errorType) {
        console.error("❌ ERROR AUTH:", errorType);
        this.showError(errorType);
        this.showLoader(false);
        
        // Volver a la cara frontal si hay error
        if (this.elements.cardFlipper) {
            this.elements.cardFlipper.classList.remove('flipped');
        }
    }

    parseUrlFragment() {
        try {
            const params = new URLSearchParams(window.location.hash.substring(1));
            const accessToken = params.get('access_token');
            if (accessToken) return { 
                access_token: accessToken, 
                refresh_token: params.get('refresh_token') 
            };
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
