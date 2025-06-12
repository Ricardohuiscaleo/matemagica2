// js/auth.js - Sistema de Autenticación v19.0 - VERSIÓN SEGURA
console.log("🚀 Auth System v19.0 - Versión segura con backend");

class LoginSystem {
    constructor() {
        this.config = null; // Se cargará desde el backend
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
                network: "📡 Parece que hay un problemita con la conexión. ¡Vamos a intentarlo de nuevo!",
                role: "🎭 ¡Ups! Necesitas elegir si eres profesor o apoderado antes de continuar.",
                general: "🌟 ¡No te preocupes! A veces pasan estas cositas. ¡Vamos a intentarlo otra vez!"
            }
        };

        // Vincular métodos para evitar problemas de contexto
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
            
            // 🔐 Cargar configuración segura desde el backend
            await this.loadSecureConfig();
            
            this.supabase = window.supabase.createClient(this.config.url, this.config.anon_key);
            console.log("✅ Cliente Supabase inicializado con configuración segura.");
            
            this.setupDOMElements();
            this.setupEventListeners();
            await this.handleInitialLoad();
        } catch (error) {
            console.error("❌ Error en init auth:", error);
            this.handleAuthError("general");
        }
    }

    // 🔐 Cargar configuración segura - SIN EXPONER KEYS
    async loadSecureConfig() {
        try {
            const isLocalDevelopment = window.location.hostname === 'localhost' || 
                                     window.location.hostname === '127.0.0.1' ||
                                     window.location.hostname === '';

            console.log(`🔍 Modo detectado: ${isLocalDevelopment ? 'DESARROLLO LOCAL' : 'PRODUCCIÓN'}`);

            if (isLocalDevelopment) {
                // ✅ MODO DESARROLLO LOCAL - Buscar keys en variables de entorno o archivo local
                console.log('🏠 Cargando configuración local segura...');
                
                // 1. Intentar cargar desde archivo .env.local (que NO se commitea)
                const localConfig = await this.loadLocalConfig();
                if (localConfig) {
                    this.config = localConfig;
                    console.log("✅ Configuración cargada desde archivo local seguro");
                    return;
                }
                
                // 2. Intentar cargar desde prompt al usuario
                const userConfig = await this.promptUserForConfig();
                if (userConfig) {
                    this.config = userConfig;
                    console.log("✅ Configuración ingresada por el usuario");
                    return;
                }
                
                // 3. Último recurso: Modo demo offline
                console.log('🎮 Usando modo DEMO offline (sin Supabase)');
                this.config = { demo: true };
                return;
            }

            // 🏭 MODO PRODUCCIÓN - Cargar DIRECTAMENTE desde backend
            console.log('🏭 Cargando configuración desde backend...');
            
            try {
                // ✅ NUEVA LÓGICA: Llamar directamente al endpoint del backend
                const response = await fetch('/api/config', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    credentials: 'same-origin'
                });

                if (!response.ok) {
                    throw new Error(`Backend error: ${response.status}`);
                }

                const config = await response.json();
                
                if (!config.supabase || !config.supabase.url || !config.supabase.anonKey) {
                    throw new Error('Configuración incompleta del backend');
                }

                this.config = {
                    url: config.supabase.url,
                    anon_key: config.supabase.anonKey
                };

                console.log("🔐 Configuración cargada DIRECTAMENTE desde backend seguro");
                return;

            } catch (backendError) {
                console.error("❌ Error cargando desde backend:", backendError);
                
                // ✅ FALLBACK: Intentar con gemini-ai.js si el backend no responde
                console.log('🔄 Intentando fallback con gemini-ai.js...');
                
                if (window.CONFIG && window.CONFIG.supabase) {
                    this.config = {
                        url: window.CONFIG.supabase.url,
                        anon_key: window.CONFIG.supabase.anonKey
                    };
                    console.log("✅ Configuración cargada desde CONFIG global");
                    return;
                }
                
                throw new Error('No se pudo cargar configuración de ninguna fuente');
            }

        } catch (error) {
            console.error("❌ Error cargando configuración:", error);
            
            // Fallback a modo demo si estamos en localhost
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.log('🎮 Fallback a modo DEMO offline');
                this.config = { demo: true };
                return;
            }
            
            throw new Error('🔒 No se pudo cargar configuración segura');
        }
    }
    
    // 📁 Cargar configuración desde archivo local (NO commiteado)
    async loadLocalConfig() {
        try {
            // Intentar cargar archivo .env.local o config.local.json
            const response = await fetch('./config.local.json');
            if (response.ok) {
                const config = await response.json();
                console.log('📁 Configuración cargada desde config.local.json');
                return {
                    url: config.supabase_url,
                    anon_key: config.supabase_anon_key
                };
            }
        } catch (e) {
            console.log('📁 No se encontró config.local.json');
        }
        
        // Verificar si hay keys en localStorage (guardadas previamente)
        const savedConfig = localStorage.getItem('matemagica_dev_config');
        if (savedConfig) {
            try {
                const config = JSON.parse(savedConfig);
                console.log('💾 Configuración cargada desde localStorage');
                return config;
            } catch (e) {
                console.log('❌ Error parseando configuración guardada');
            }
        }
        
        return null;
    }
    
    // 💬 Solicitar configuración al usuario (solo para desarrollo)
    async promptUserForConfig() {
        return new Promise((resolve) => {
            // Crear modal simple para solicitar keys
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            modal.innerHTML = `
                <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <h3 class="text-lg font-bold mb-4">🔐 Configuración de Desarrollo</h3>
                    <p class="text-sm text-gray-600 mb-4">Para desarrollar localmente, necesitas ingresar las keys de Supabase:</p>
                    
                    <div class="space-y-3">
                        <div>
                            <label class="block text-sm font-medium mb-1">Supabase URL:</label>
                            <input type="text" id="supabase-url" placeholder="https://your-project.supabase.co" 
                                class="w-full px-3 py-2 border rounded-md">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium mb-1">Supabase Anon Key:</label>
                            <input type="password" id="supabase-key" placeholder="eyJhbGciOiJIUzI1NiIs..." 
                                class="w-full px-3 py-2 border rounded-md">
                        </div>
                        
                        <div class="flex items-center">
                            <input type="checkbox" id="save-config" class="mr-2">
                            <label class="text-sm text-gray-600">Guardar en este navegador (solo para desarrollo)</label>
                        </div>
                    </div>
                    
                    <div class="flex space-x-3 mt-6">
                        <button id="cancel-config" class="flex-1 bg-gray-300 py-2 px-4 rounded-md">
                            🎮 Modo Demo
                        </button>
                        <button id="save-and-continue" class="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md">
                            💾 Guardar
                        </button>
                    </div>
                    
                    <p class="text-xs text-gray-500 mt-3">
                        💡 <strong>Tip:</strong> Crea un archivo <code>config.local.json</code> en la raíz del proyecto para automatizar esto.
                    </p>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Event listeners
            const urlInput = modal.querySelector('#supabase-url');
            const keyInput = modal.querySelector('#supabase-key');
            const saveCheckbox = modal.querySelector('#save-config');
            
            modal.querySelector('#cancel-config').onclick = () => {
                document.body.removeChild(modal);
                resolve(null); // Usar modo demo
            };
            
            modal.querySelector('#save-and-continue').onclick = () => {
                const url = urlInput.value.trim();
                const key = keyInput.value.trim();
                
                if (!url || !key) {
                    alert('Por favor completa ambos campos');
                    return;
                }
                
                const config = { url, anon_key: key };
                
                // Guardar si el usuario lo solicitó
                if (saveCheckbox.checked) {
                    localStorage.setItem('matemagica_dev_config', JSON.stringify(config));
                    console.log('💾 Configuración guardada para futuras sesiones');
                }
                
                document.body.removeChild(modal);
                resolve(config);
            };
        });
    }

    setupDOMElements() {
        this.elements = {
            teacherRoleBtn: document.getElementById('teacher-role-btn'),
            parentRoleBtn: document.getElementById('parent-role-btn'),
            googleLoginBtn: document.getElementById('google-login-btn'),
            authLoader: document.getElementById('auth-loader'),
            authInterface: document.getElementById('auth-interface'),
            authError: document.getElementById('auth-error'),
            loaderText: document.getElementById('loader-text')
        };
        console.log("🔧 Elementos de auth configurados");
    }

    setupEventListeners() {
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
            this.showInterface();
            
        } catch (error) {
            console.error("❌ Error en carga inicial:", error);
            this.handleAuthError("session");
        }
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
            
            // ✅ ARREGLO: Asegurar que la redirección se mantenga en el mismo dominio
            const currentOrigin = window.location.origin;
            const redirectUrl = `${currentOrigin}/dashboard.html`;
            
            console.log(`🏠 Dominio actual: ${currentOrigin}`);
            console.log(`🔄 URL de redirección: ${redirectUrl}`);
            
            const { error } = await this.supabase.auth.signInWithOAuth({ 
                provider: 'google', 
                options: { 
                    redirectTo: redirectUrl // ✅ Redirigir directamente al dashboard en el mismo dominio
                } 
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

    // 🎭 Función para seleccionar rol (profesor/apoderado)
    selectRole(rol) {
        console.log(`🎭 Rol seleccionado: ${rol}`);
        
        this.selectedRole = rol;
        localStorage.setItem('matemagica_selected_role', rol);
        
        // Actualizar UI para mostrar selección
        const teacherBtn = this.elements.teacherRoleBtn;
        const parentBtn = this.elements.parentRoleBtn;
        const loginBtn = this.elements.googleLoginBtn;
        
        if (teacherBtn && parentBtn && loginBtn) {
            // Remover clases activas
            teacherBtn.classList.remove('ring-4', 'ring-blue-300', 'bg-blue-600');
            parentBtn.classList.remove('ring-4', 'ring-green-300', 'bg-green-600');
            
            // Agregar clase activa al botón seleccionado
            if (rol === 'teacher') {
                teacherBtn.classList.add('ring-4', 'ring-blue-300', 'bg-blue-600');
                teacherBtn.innerHTML = `
                    <i class="fas fa-chalkboard-teacher text-4xl mb-4"></i>
                    <h3 class="text-xl font-bold">Profesor</h3>
                    <p class="text-sm opacity-90">Gestiona estudiantes y cursos</p>
                    <div class="mt-2 text-xs bg-white bg-opacity-20 px-2 py-1 rounded">✅ Seleccionado</div>
                `;
            } else {
                parentBtn.classList.add('ring-4', 'ring-green-300', 'bg-green-600');
                parentBtn.innerHTML = `
                    <i class="fas fa-heart text-4xl mb-4"></i>
                    <h3 class="text-xl font-bold">Apoderado</h3>
                    <p class="text-sm opacity-90">Acompaña el aprendizaje</p>
                    <div class="mt-2 text-xs bg-white bg-opacity-20 px-2 py-1 rounded">✅ Seleccionado</div>
                `;
            }
            
            // Activar botón de login
            loginBtn.disabled = false;
            loginBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            loginBtn.classList.add('hover:bg-white', 'hover:text-gray-800', 'transform', 'hover:scale-105');
            
            // Mostrar mensaje amigable
            const friendlyRole = rol === 'teacher' ? 'profesor' : 'apoderado';
            this.showTemporaryMessage(`🎉 ¡Perfecto! Te has registrado como ${friendlyRole}. Ahora puedes continuar con Google.`);
        }
    }

    // 🚪 NUEVA FUNCIÓN: Logout completo del sistema
    async signOut() {
        console.log('🚪 Iniciando logout AGRESIVO...');
        
        try {
            // 1. Cerrar sesión en Supabase CON SCOPE GLOBAL
            if (this.supabase) {
                console.log('🔐 Cerrando sesión en Supabase...');
                const { error } = await this.supabase.auth.signOut({ 
                    scope: 'global' // ✅ CLAVE: Cierra sesión en TODOS los dispositivos/tabs
                });
                if (error) {
                    console.warn('⚠️ Error cerrando sesión en Supabase:', error.message);
                } else {
                    console.log('✅ Sesión cerrada GLOBALMENTE en Supabase');
                }
            }
            
            // 2. Limpiar TODO el localStorage y sessionStorage
            console.log('🧹 Limpiando TODO el almacenamiento local...');
            
            // Lista COMPLETA de posibles claves
            const itemsToRemove = [
                'matemagica_user',
                'matemagica_profile', 
                'matemagica-user-profile',
                'matemagica_role',
                'matemagica_selected_role',
                'matemagica_student_info',
                'currentUser',
                'userProfile',
                'selectedRole',
                'isAuthenticated',
                'sb-localhost-auth-token',
                'supabase.auth.token',
                'supabase-auth-token'
            ];
            
            itemsToRemove.forEach(item => {
                localStorage.removeItem(item);
                sessionStorage.removeItem(item);
            });
            
            // 3. Limpiar COMPLETAMENTE localStorage y sessionStorage
            localStorage.clear();
            sessionStorage.clear();
            
            // 4. Limpiar cookies de autenticación si existen
            document.cookie.split(";").forEach(function(c) { 
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
            });
            
            // 5. Resetear estado interno COMPLETAMENTE
            this.selectedRole = null;
            this.config = null;
            this.supabase = null;
            
            console.log('✅ Logout AGRESIVO completado');
            
            // 6. Mostrar mensaje de confirmación
            this.showTemporaryMessage('🚪 Sesión cerrada completamente. ¡Hasta pronto!');
            
            // 7. Redirigir con reload FORZADO para limpiar memoria
            setTimeout(() => {
                window.location.replace('index.html'); // ✅ replace() no permite volver atrás
                window.location.reload(true); // ✅ Reload forzado desde servidor
            }, 500);
            
        } catch (error) {
            console.error('❌ Error durante logout agresivo:', error);
            
            // ✅ FALLBACK NUCLEAR: Si todo falla, limpiar TODO y recargar
            console.log('🧨 Ejecutando fallback nuclear...');
            localStorage.clear();
            sessionStorage.clear();
            
            // Redirigir SÍ O SÍ
            window.location.replace('index.html');
            setTimeout(() => {
                window.location.reload(true);
            }, 100);
        }
    }

    // 💬 Mostrar mensaje temporal
    showTemporaryMessage(message) {
        // Crear elemento de mensaje si no existe
        let messageEl = document.getElementById('temp-message');
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.id = 'temp-message';
            messageEl.className = 'fixed bottom-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300 z-50';
            document.body.appendChild(messageEl);
        }
        
        messageEl.textContent = message;
        messageEl.classList.remove('translate-x-full');
        
        // Ocultar después de 3 segundos
        setTimeout(() => {
            messageEl.classList.add('translate-x-full');
        }, 3000);
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
        const userProfile = JSON.parse(localStorage.getItem('matemagica-user-profile') || '{}');
        
        // ✅ CORREGIDO: Ambos roles van al dashboard unificado
        console.log(`🔄 Redirigiendo usuario (${userProfile.user_role}) al dashboard unificado...`);
        window.location.assign('dashboard.html');
    }

    // Funciones de utilidad UI
    showLoader(show, type = "loading") {
        const loader = this.elements.authLoader;
        const interface_ = this.elements.authInterface;
        const loaderText = this.elements.loaderText;
        
        if (!loader || !interface_) return;
        
        if (show) {
            loader.classList.remove('hidden');
            interface_.classList.add('hidden');
            
            if (loaderText && this.friendlyMessages[type]) {
                const messages = this.friendlyMessages[type];
                const message = messages[Math.floor(Math.random() * messages.length)];
                loaderText.textContent = message;
            }
        } else {
            loader.classList.add('hidden');
            interface_.classList.remove('hidden');
        }
    }

    showInterface() {
        this.showLoader(false);
        const error = this.elements.authError;
        if (error) error.classList.add('hidden');
    }

    showError(type) {
        const errorElement = this.elements.authError;
        if (!errorElement) return;
        
        const message = this.friendlyMessages.errors[type] || this.friendlyMessages.errors.general;
        errorElement.querySelector('.error-message').textContent = message;
        errorElement.classList.remove('hidden');
        
        setTimeout(() => {
            errorElement.classList.add('hidden');
        }, 5000);
    }

    handleAuthError(type) {
        console.error(`❌ Error de autenticación: ${type}`);
        this.showLoader(false);
        this.showError(type);
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
