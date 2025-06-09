// js/auth.js - Sistema de Autenticación v18.0 - Child-Friendly
console.log("🚀 Auth System v18.0 - Child-Friendly");

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
            this.handleAuthError("general");
        }
    }

    setupDOMElements() {
        this.elements = {
            welcomeScreen: document.getElementById('welcome-screen'),
            authScreen: document.getElementById('auth-screen'),
            loadingOverlay: document.getElementById('loading-overlay'),
            errorDisplay: document.getElementById('error-display'),
            teacherRoleBtn: document.getElementById('teacher-role-btn'),
            parentRoleBtn: document.getElementById('parent-role-btn'),
            googleAuthBtn: document.getElementById('google-auth-btn'),
        };
    }

    setupEventListeners() {
        this.elements.teacherRoleBtn?.addEventListener('click', () => this.selectRole('teacher'));
        this.elements.parentRoleBtn?.addEventListener('click', () => this.selectRole('parent'));
        this.elements.googleAuthBtn?.addEventListener('click', this.signInWithGoogle);
        
        // Añadir efectos de sonido visual en hover (solo visual)
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
        const urlParams = this.parseUrlFragment();
        if (urlParams) {
            this.cleanupUrl();
            const { error } = await this.supabase.auth.setSession(urlParams);
            if (error) return this.handleAuthError("session");
            const { data: { user } } = await this.supabase.auth.getUser();
            if (user) await this.onLoginSuccess(user);
            else return this.handleAuthError("auth");
        } else {
            const { data: { session } } = await this.supabase.auth.getSession();
            if (session) await this.onLoginSuccess(session.user);
            else {
                this.showScreen('welcomeScreen');
                this.showLoader(false);
            }
        }
    }

    selectRole(role) {
        this.selectedRole = role;
        localStorage.setItem('matemagica_selected_role', role);
        
        // Feedback visual inmediato
        const selectedBtn = role === 'teacher' ? this.elements.teacherRoleBtn : this.elements.parentRoleBtn;
        if (selectedBtn) {
            selectedBtn.style.transform = 'scale(1.1)';
            selectedBtn.style.boxShadow = '0 0 25px rgba(102, 126, 234, 0.5)';
            setTimeout(() => {
                selectedBtn.style.transform = '';
                selectedBtn.style.boxShadow = '';
            }, 300);
        }
        
        setTimeout(() => {
            this.showScreen('authScreen');
        }, 400);
    }

    async signInWithGoogle() {
        if (!this.selectedRole) return this.showError("role");
        this.showLoader(true, "auth");
        
        try {
            await this.supabase.auth.signInWithOAuth({ 
                provider: 'google', 
                options: { redirectTo: window.location.origin } 
            });
        } catch (error) {
            this.handleAuthError("network");
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
            await this.supabase.from('math_profiles').upsert(userProfile);
            localStorage.setItem('matemagica-user-profile', JSON.stringify(userProfile));
            localStorage.removeItem('matemagica_selected_role');
            
            // CAMBIO: Usar pantalla de carga completa en lugar del mensaje verde
            this.showLoader(true, "success");
            setTimeout(() => {
                this.redirectUser();
            }, 2000);
        } catch (error) {
            this.handleAuthError("general");
        }
    }

    redirectUser() {
        window.location.assign('dashboard.html');
    }
    
    showScreen(screenName) {
        ['welcomeScreen', 'authScreen'].forEach(id => {
            if (this.elements[id]) {
                this.elements[id].style.display = 'none';
            }
        });
        if (this.elements[screenName]) {
            this.elements[screenName].style.display = 'flex';
        }
    }

    showLoader(show, type = "loading") {
        if (this.elements.loadingOverlay) {
            this.elements.loadingOverlay.style.display = show ? 'flex' : 'none';
            
            if (show) {
                const loadingText = this.elements.loadingOverlay.querySelector('p');
                if (loadingText && this.friendlyMessages[type]) {
                    // Rotar mensajes de carga
                    const messages = Array.isArray(this.friendlyMessages[type]) 
                        ? this.friendlyMessages[type] 
                        : [this.friendlyMessages[type]];
                    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
                    loadingText.textContent = randomMessage;
                }
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

    showSuccessMessage(message) {
        if (this.elements.errorDisplay) {
            this.elements.errorDisplay.style.background = 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)';
            this.elements.errorDisplay.style.color = 'white';
            this.elements.errorDisplay.style.border = '2px solid #22c55e';
            this.elements.errorDisplay.textContent = message;
            this.elements.errorDisplay.style.display = 'block';
            
            setTimeout(() => { 
                this.elements.errorDisplay.style.display = 'none';
                // Resetear estilos para futuros errores
                this.elements.errorDisplay.style.background = '';
                this.elements.errorDisplay.style.color = '';
                this.elements.errorDisplay.style.border = '';
            }, 3000);
        }
    }

    handleAuthError(errorType) {
        console.error("❌ ERROR:", errorType);
        this.showError(errorType);
        this.showLoader(false);
        this.showScreen('welcomeScreen');
    }

    parseUrlFragment() {
        try {
            const params = new URLSearchParams(window.location.hash.substring(1));
            const accessToken = params.get('access_token');
            if (accessToken) return { 
                access_token: accessToken, 
                refresh_token: params.get('refresh_token') 
            };
        } catch (e) { /* ignore */ }
        return null;
    }

    cleanupUrl() {
        if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname);
        }
    }
}

new LoginSystem();
