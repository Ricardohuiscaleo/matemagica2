// js/auth.js - Sistema de Autenticación v12.0
// CORRECCIÓN FINAL: Se enlazan los métodos al constructor para asegurar el contexto de 'this'.
console.log("🚀 Auth System v12.0 - Login");

class LoginSystem {
    constructor() {
        this.config = {
            url: "https://uznvakpuuxnpdhoejrog.supabase.co",
            anon_key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bnZha3B1dXhucGRob2Vqcm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODg0MTAsImV4cCI6MjA2NDY2NDQxMH0.OxbLYkjlgpWFnqd28gaZSwar_NQ6_qUS3U76bqbcXVg"
        };
        this.supabase = null;
        this.elements = {};
        this.selectedRole = null;

        // **LA CORRECCIÓN CLAVE**
        // Enlazar el 'this' de todos los métodos al constructor
        this.init = this.init.bind(this);
        this.handleInitialLoad = this.handleInitialLoad.bind(this);
        this.onLoginSuccess = this.onLoginSuccess.bind(this);
        this.handleAuthError = this.handleAuthError.bind(this);
        this.signInWithGoogle = this.signInWithGoogle.bind(this);
        this.selectRole = this.selectRole.bind(this);
        
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
            console.error("❌ CRITICAL:", error);
            // Ahora la llamada a handleAuthError funcionará
            this.handleAuthError("Error crítico al iniciar.");
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
        this.elements.teacherRoleBtn?.addEventListener('click', this.selectRole);
        this.elements.parentRoleBtn?.addEventListener('click', this.selectRole);
        this.elements.googleAuthBtn?.addEventListener('click', this.signInWithGoogle);
    }

    async handleInitialLoad() {
        this.showLoader(true);
        const urlParams = this.parseUrlFragment();
        if (urlParams) {
            this.cleanupUrl();
            const { error } = await this.supabase.auth.setSession(urlParams);
            if (error) return this.handleAuthError("Hubo un problema al verificar tu sesión.");
            
            const { data: { user } } = await this.supabase.auth.getUser();
            if (user) await this.onLoginSuccess(user);
            else return this.handleAuthError("No se pudo confirmar tu identidad.");
        } else {
            const { data: { session } } = await this.supabase.auth.getSession();
            if (session) await this.onLoginSuccess(session.user);
            else {
                this.showScreen('welcomeScreen');
                this.showLoader(false);
            }
        }
    }

    selectRole(event) {
        // Obtenemos el rol del botón que se presionó
        const role = event.target.id === 'teacher-role-btn' ? 'teacher' : 'parent';
        this.selectedRole = role;
        localStorage.setItem('matemagica_selected_role', role);
        this.showScreen('authScreen');
    }

    async signInWithGoogle() {
        if (!this.selectedRole) return this.showError("Por favor, selecciona un rol.");
        this.showLoader(true);
        await this.supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
    }

    async onLoginSuccess(user) {
        const role = localStorage.getItem('matemagica_selected_role') || 'parent';
        const userProfile = {
            user_id: user.id, email: user.email,
            full_name: user.user_metadata?.full_name,
            avatar_url: user.user_metadata?.avatar_url,
            user_role: role
        };
        await this.supabase.from('math_profiles').upsert(userProfile);
        localStorage.setItem('matemagica-user-profile', JSON.stringify(userProfile));
        localStorage.removeItem('matemagica_selected_role');
        this.redirectUser();
    }

    redirectUser() {
        window.location.assign('dashboard.html');
    }
    
    showScreen(screenName) {
        ['welcomeScreen', 'authScreen'].forEach(id => {
            if (this.elements[id]) this.elements[id].style.display = 'none';
        });
        if (this.elements[screenName]) {
            this.elements[screenName].style.display = 'block';
        }
    }

    showLoader(show) {
        if (this.elements.loadingOverlay) this.elements.loadingOverlay.style.display = show ? 'flex' : 'none';
    }

    showError(message) {
        if (this.elements.errorDisplay) {
            this.elements.errorDisplay.textContent = message;
            this.elements.errorDisplay.style.display = 'block';
            setTimeout(() => { this.elements.errorDisplay.style.display = 'none'; }, 5000);
        }
    }

    handleAuthError(message) {
        this.showError(message);
        this.showLoader(false);
        this.showScreen('welcomeScreen');
    }

    parseUrlFragment() {
        try {
            const params = new URLSearchParams(window.location.hash.substring(1));
            const accessToken = params.get('access_token');
            if (accessToken) return { access_token: accessToken, refresh_token: params.get('refresh_token') };
        } catch (e) { /* ignore */ }
        return null;
    }

    cleanupUrl() {
        if (window.location.hash) window.history.replaceState(null, '', window.location.pathname);
    }
}

new LoginSystem();
