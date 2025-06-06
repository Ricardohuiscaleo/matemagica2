// Gestor de Autenticación para Matemágica PWA
import { authService, profileService, progressService, currentUser, userProfile, SUPABASE_CONFIG } from './supabase-config.js';

class AuthManager {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.userProfile = null;
        this.initializeAuth();
    }

    async initializeAuth() {
        // Verificar si hay un usuario autenticado al cargar
        const user = await authService.getCurrentUser();
        if (user) {
            await this.handleUserAuthenticated(user);
        }
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Escuchar cambios de autenticación
        window.addEventListener('userAuthenticated', (event) => {
            this.handleUserAuthenticated(event.detail.user, event.detail.profile);
        });
        
        window.addEventListener('userSignedOut', () => {
            this.handleUserSignedOut();
        });
    }

    setupEventListeners() {
        // Botones de autenticación
        document.getElementById('login-btn')?.addEventListener('click', () => this.showLoginModal());
        document.getElementById('register-btn')?.addEventListener('click', () => this.showRegisterModal());
        document.getElementById('logout-btn')?.addEventListener('click', () => this.logout());
        document.getElementById('profile-btn')?.addEventListener('click', () => this.showProfileModal());

        // Formularios de los modales
        document.getElementById('login-form')?.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('register-form')?.addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('profile-form')?.addEventListener('submit', (e) => this.handleUpdateProfile(e));

        // Cerrar modales
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });

        // Cerrar modal al hacer click fuera
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.closeModals();
            });
        });
    }

    async handleUserAuthenticated(user, profile = null) {
        this.isAuthenticated = true;
        this.currentUser = user;
        this.userProfile = profile || await profileService.getProfile(user.id);
        
        this.updateAuthUI();
        this.closeModals();
        
        // Mostrar mensaje de bienvenida
        this.showWelcomeMessage();
        
        console.log('Usuario autenticado:', this.userProfile);
    }

    handleUserSignedOut() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.userProfile = null;
        this.updateAuthUI();
        this.showMessage('¡Hasta pronto! 👋', 'info');
    }

    updateAuthUI() {
        const authButtons = document.getElementById('auth-buttons');
        const userProfile = document.getElementById('user-profile');
        const userActions = document.getElementById('user-actions');

        if (this.isAuthenticated && this.userProfile) {
            // Ocultar botones de login/registro
            authButtons.classList.add('hidden');
            
            // Mostrar perfil de usuario
            userProfile.classList.remove('hidden');
            userActions.classList.remove('hidden');
            
            // Actualizar información del perfil
            this.updateProfileDisplay();
        } else {
            // Mostrar botones de login/registro
            authButtons.classList.remove('hidden');
            
            // Ocultar perfil de usuario
            userProfile.classList.add('hidden');
            userActions.classList.add('hidden');
        }
    }

    updateProfileDisplay() {
        if (!this.userProfile) return;

        const userName = document.getElementById('user-name');
        const userEmail = document.getElementById('user-email');
        const userAvatar = document.getElementById('user-avatar');

        if (userName) userName.textContent = this.userProfile.full_name;
        if (userEmail) userEmail.textContent = this.currentUser.email;
        
        // Avatar con primera letra del nombre o emoji
        if (userAvatar) {
            if (this.userProfile.avatar_url) {
                userAvatar.textContent = this.userProfile.avatar_url;
            } else {
                userAvatar.textContent = this.userProfile.full_name.charAt(0).toUpperCase();
            }
        }
    }

    // Modal de Login
    showLoginModal() {
        document.getElementById('login-modal').classList.remove('hidden');
        document.getElementById('login-email').focus();
    }

    // Modal de Registro
    showRegisterModal() {
        document.getElementById('register-modal').classList.remove('hidden');
        document.getElementById('register-name').focus();
    }

    // Modal de Perfil
    showProfileModal() {
        if (!this.userProfile) return;
        
        // Llenar formulario con datos actuales
        document.getElementById('profile-name').value = this.userProfile.full_name;
        document.getElementById('profile-level').value = this.userProfile.preferred_level;
        document.getElementById('profile-operation').value = this.userProfile.favorite_operation;
        
        // Mostrar estadísticas
        this.updateProfileStats();
        
        document.getElementById('profile-modal').classList.remove('hidden');
    }

    async updateProfileStats() {
        if (!this.currentUser) return;
        
        const stats = await progressService.getUserStats(this.currentUser.id);
        if (stats) {
            document.getElementById('stat-exercises').textContent = stats.profile.total_exercises;
            document.getElementById('stat-accuracy').textContent = `${stats.accuracy}%`;
            document.getElementById('stat-sessions').textContent = stats.recentSessions.length;
        }
    }

    closeModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.add('hidden');
        });
    }

    // Manejar login
    async handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        if (!email || !password) {
            this.showMessage('Por favor completa todos los campos 📝', 'error');
            return;
        }

        this.showLoading('login-submit');
        
        const result = await authService.signIn(email, password);
        
        this.hideLoading('login-submit');
        
        if (result.success) {
            this.showMessage(`¡Bienvenido de vuelta! 🎉`, 'success');
        } else {
            this.showMessage(`Error: ${result.error} 😞`, 'error');
        }
    }

    // Manejar registro
    async handleRegister(event) {
        event.preventDefault();
        
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        
        if (!name || !email || !password) {
            this.showMessage('Por favor completa todos los campos 📝', 'error');
            return;
        }

        if (password.length < SUPABASE_CONFIG.SECURITY.MIN_PASSWORD_LENGTH) {
            this.showMessage(`La contraseña debe tener al menos ${SUPABASE_CONFIG.SECURITY.MIN_PASSWORD_LENGTH} caracteres 🔒`, 'error');
            return;
        }

        this.showLoading('register-submit');
        
        const result = await authService.signUpChild(email, password, name);
        
        this.hideLoading('register-submit');
        
        if (result.success) {
            this.showMessage(`¡Bienvenido ${name}! 🌟`, 'success');
        } else {
            this.showMessage(`Error: ${result.error} 😞`, 'error');
        }
    }

    // Manejar actualización de perfil
    async handleUpdateProfile(event) {
        event.preventDefault();
        
        if (!this.currentUser) return;
        
        const name = document.getElementById('profile-name').value;
        const level = parseInt(document.getElementById('profile-level').value);
        const operation = document.getElementById('profile-operation').value;
        const avatar = document.getElementById('profile-avatar').value;
        
        this.showLoading('profile-submit');
        
        try {
            await profileService.updateProfile(this.currentUser.id, {
                full_name: name,
                preferred_level: level,
                favorite_operation: operation,
                avatar_url: avatar || null
            });
            
            // Actualizar perfil local
            this.userProfile = await profileService.getProfile(this.currentUser.id);
            this.updateProfileDisplay();
            
            this.showMessage('¡Perfil actualizado! ✨', 'success');
            this.closeModals();
        } catch (error) {
            this.showMessage('Error actualizando perfil 😞', 'error');
        }
        
        this.hideLoading('profile-submit');
    }

    // Logout
    async logout() {
        const success = await authService.signOut();
        if (success) {
            // La UI se actualizará automáticamente por el event listener
        } else {
            this.showMessage('Error cerrando sesión 😞', 'error');
        }
    }

    // Método para guardar progreso después de ejercicios
    async saveExerciseProgress(exerciseData) {
        if (!this.currentUser) return;
        
        try {
            // Guardar sesión de ejercicios
            await progressService.saveExerciseSession(this.currentUser.id, exerciseData);
            
            // Actualizar estadísticas del perfil
            const totalCorrect = exerciseData.exercises.filter(ex => ex.isCorrect).length;
            for (let i = 0; i < exerciseData.exercises.length; i++) {
                await profileService.updateStats(this.currentUser.id, exerciseData.exercises[i].isCorrect);
            }
            
            console.log('Progreso guardado exitosamente');
        } catch (error) {
            console.error('Error guardando progreso:', error);
        }
    }

    // Método para guardar intento de cuento
    async saveStoryProgress(storyData) {
        if (!this.currentUser) return;
        
        try {
            await progressService.saveStoryAttempt(this.currentUser.id, storyData);
            console.log('Progreso de cuento guardado exitosamente');
        } catch (error) {
            console.error('Error guardando progreso de cuento:', error);
        }
    }

    // Obtener datos del usuario actual
    getCurrentUser() {
        return {
            user: this.currentUser,
            profile: this.userProfile,
            isAuthenticated: this.isAuthenticated
        };
    }

    // Obtener configuración de usuario para ejercicios
    getUserPreferences() {
        if (!this.userProfile) {
            return {
                level: 1, // Fácil por defecto
                operation: 'suma',
                name: 'Estudiante'
            };
        }
        
        return {
            level: this.userProfile.preferred_level || 1,
            operation: this.userProfile.favorite_operation || 'suma',
            name: this.userProfile.full_name || 'Estudiante'
        };
    }

    // Métodos de UI Helper
    showLoading(buttonId) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = true;
            button.innerHTML = '<span class="animate-spin">⏳</span> Cargando...';
        }
    }

    hideLoading(buttonId) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = false;
            // Restaurar texto original según el botón
            switch(buttonId) {
                case 'login-submit':
                    button.innerHTML = '🚀 Entrar';
                    break;
                case 'register-submit':
                    button.innerHTML = '🌟 Crear Cuenta';
                    break;
                case 'profile-submit':
                    button.innerHTML = '💾 Guardar Cambios';
                    break;
                default:
                    button.innerHTML = 'Enviar';
            }
        }
    }

    showMessage(message, type = 'info') {
        // Crear o actualizar elemento de mensaje
        let messageEl = document.getElementById('auth-message');
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.id = 'auth-message';
            messageEl.className = 'fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transform transition-all duration-300';
            document.body.appendChild(messageEl);
        }

        // Configurar estilos según tipo
        messageEl.className = 'fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transform transition-all duration-300';
        
        switch(type) {
            case 'success':
                messageEl.classList.add('bg-green-500', 'text-white');
                break;
            case 'error':
                messageEl.classList.add('bg-red-500', 'text-white');
                break;
            case 'info':
            default:
                messageEl.classList.add('bg-blue-500', 'text-white');
                break;
        }

        messageEl.textContent = message;
        messageEl.style.transform = 'translateX(0)';

        // Auto ocultar después de 3 segundos
        setTimeout(() => {
            messageEl.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, 3000);
    }

    showWelcomeMessage() {
        if (this.userProfile) {
            const name = this.userProfile.full_name;
            const emoji = ['🎉', '🌟', '✨', '🎊'][Math.floor(Math.random() * 4)];
            this.showMessage(`¡Hola ${name}! ${emoji}`, 'success');
        }
    }

    // Método para limpiar datos al hacer logout
    clearUserData() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.userProfile = null;
        
        // Limpiar formularios
        document.querySelectorAll('form').forEach(form => form.reset());
    }
}

// Crear instancia global del AuthManager
const authManager = new AuthManager();

// Exportar para uso en otros módulos
export { authManager };

// También hacer disponible globalmente para app.js
window.authManager = authManager;