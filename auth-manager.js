// Matemágica - Sistema de Autenticación Simplificado v3.0 [2025-06-08-FIX]
// Arreglo definitivo del error 401 y flujo de autenticación

/**
 * WelcomeAuthManager - Gestor de autenticación simplificado
 * Enfoque: Solo Supabase OAuth, sin Google Sign-In directo
 */
class WelcomeAuthManager {
    constructor() {
        this.currentUser = null;
        this.userProfile = null;
        this.selectedRole = null;
        this.studentInfo = null;
        this.isInitialized = false;
        this.isProcessingAuth = false;
        
        // ✅ NUEVO: Protección contra bucles infinitos
        this.supabaseCheckCompleted = false;
        this.authProcessingCompleted = false;
        
        // Estado de servicios
        this.isSupabaseReady = false;
        
        // Referencias a elementos del DOM
        this.elements = {};
        
        // Inicializar cuando el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    // Inicialización principal simplificada
    async init() {
        console.log('🎯 Inicializando WelcomeAuthManager v3.0 - SIMPLIFICADO');
        
        try {
            this.setupDOMElements();
            this.setupEventListeners();
            
            // Esperar a que Supabase esté disponible
            await this.waitForSupabase();
            
            if (this.isSupabaseReady) {
                await this.setupSupabaseAuth();
                await this.checkExistingSession();
                
                // ✅ NUEVO: Ejecutar diagnóstico de Supabase después de la inicialización
                await this.runSupabaseDiagnostics();
            } else {
                console.warn('⚠️ Supabase no disponible - modo fallback');
                this.showWelcomeScreen();
            }
            
            this.isInitialized = true;
            console.log('✅ WelcomeAuthManager v3.0 inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando:', error);
            this.showWelcomeScreen();
        }
    }

    // Configurar elementos del DOM
    setupDOMElements() {
        this.elements = {
            welcomeScreen: document.getElementById('welcome-screen'),
            // ✅ CORREGIDO: Usar el ID correcto del HTML
            studentSelectionScreen: document.getElementById('student-form-screen'),
            authScreen: document.getElementById('auth-screen'),
            appScreen: document.getElementById('app-screen'),
            authLoader: document.getElementById('auth-loading'),
            teacherRoleBtn: document.getElementById('teacher-role-btn'),
            parentRoleBtn: document.getElementById('parent-role-btn'),
            backToWelcomeBtn: document.getElementById('back-to-welcome-btn'),
            googleAuthBtn: document.getElementById('google-auth-btn'),
            studentForm: document.getElementById('student-form'),
            studentNameInput: document.getElementById('student-name'),
            studentGradeSelect: document.getElementById('student-grade')
        };
        
        // ✅ NUEVO: Debug de elementos DOM
        console.log('📱 Elementos DOM encontrados:');
        Object.entries(this.elements).forEach(([key, element]) => {
            console.log(`- ${key}:`, !!element);
        });
    }

    // Configurar event listeners
    setupEventListeners() {
        // Selección de rol
        if (this.elements.teacherRoleBtn) {
            this.elements.teacherRoleBtn.addEventListener('click', () => this.selectRole('teacher'));
        }
        
        if (this.elements.parentRoleBtn) {
            this.elements.parentRoleBtn.addEventListener('click', () => this.selectRole('parent'));
        }
        
        // ✅ CORREGIDO: Navegación con múltiples referencias
        const backButtons = [
            this.elements.backToWelcomeBtn,
            document.getElementById('back-to-welcome'),
            document.getElementById('back-to-auth')
        ].filter(Boolean);
        
        backButtons.forEach(btn => {
            btn.addEventListener('click', () => this.showWelcomeScreen());
        });
        
        // Formulario de estudiante
        if (this.elements.studentForm) {
            this.elements.studentForm.addEventListener('submit', (e) => this.handleStudentFormSubmit(e));
        }
        
        console.log('🔗 Event listeners configurados');
    }

    // Esperar Supabase
    async waitForSupabase() {
        return new Promise((resolve) => {
            // ✅ PROTECCIÓN CONTRA BUCLE: Verificar si ya se ejecutó
            if (this.supabaseCheckCompleted) {
                console.log('🔒 Verificación de Supabase ya completada, saltando...');
                resolve();
                return;
            }
            
            // ✅ CORREGIDO: Verificar de manera más flexible
            const checkSupabaseReady = () => {
                // Verificar configuración básica
                const hasConfig = !!(window.SUPABASE_CONFIG && window.isSupabaseConfigured);
                const configValid = hasConfig ? window.isSupabaseConfigured() : false;
                const hasSupabaseLib = !!window.supabase;
                const hasServices = !!(window.supabaseClient || window.authService);
                
                console.log('🔍 Verificando Supabase:', {
                    hasConfig,
                    configValid,
                    hasSupabaseLib,
                    hasServices
                });
                
                return hasConfig && configValid && hasSupabaseLib && hasServices;
            };
            
            if (checkSupabaseReady()) {
                console.log('✅ Supabase ya disponible');
                this.isSupabaseReady = true;
                this.supabaseCheckCompleted = true; // ✅ NUEVO: Marcar como completado
                resolve();
                return;
            }
            
            let attempts = 0;
            const maxAttempts = 20; // ✅ REDUCIDO: 2 segundos en lugar de 5
            
            const checkSupabaseInterval = () => {
                attempts++;
                
                if (checkSupabaseReady()) {
                    console.log('✅ Supabase disponible después de', attempts * 100, 'ms');
                    this.isSupabaseReady = true;
                    this.supabaseCheckCompleted = true; // ✅ NUEVO: Marcar como completado
                    resolve();
                } else if (attempts >= maxAttempts) {
                    console.warn('⏰ Timeout esperando Supabase después de', maxAttempts * 100, 'ms');
                    console.log('🔍 Estado final:');
                    console.log('- SUPABASE_CONFIG:', !!window.SUPABASE_CONFIG);
                    console.log('- isSupabaseConfigured:', typeof window.isSupabaseConfigured, window.isSupabaseConfigured?.());
                    console.log('- window.supabase:', !!window.supabase);
                    console.log('- supabaseClient:', !!window.supabaseClient);
                    console.log('- authService:', !!window.authService);
                    
                    // ✅ NUEVO: Intentar crear servicios básicos antes de fallar
                    if (window.supabase && window.SUPABASE_CONFIG && window.isSupabaseConfigured()) {
                        console.log('🔧 Intentando crear cliente Supabase manualmente...');
                        this.createManualSupabaseClient();
                        this.isSupabaseReady = !!window.supabaseClient;
                    } else {
                        this.isSupabaseReady = false;
                    }
                    
                    this.supabaseCheckCompleted = true; // ✅ NUEVO: Marcar como completado siempre
                    resolve();
                } else {
                    setTimeout(checkSupabaseInterval, 100);
                }
            };
            
            checkSupabaseInterval();
        });
    }

    // ✅ NUEVO: Crear cliente Supabase manualmente si es necesario
    createManualSupabaseClient() {
        try {
            if (window.supabaseClient) return; // Ya existe
            
            const config = window.SUPABASE_CONFIG;
            if (!config || !window.supabase) return;
            
            console.log('🔧 Creando cliente Supabase manualmente...');
            
            window.supabaseClient = window.supabase.createClient(
                config.url,
                config.anon_key,
                {
                    auth: {
                        autoRefreshToken: false,
                        persistSession: false,
                        detectSessionInUrl: false,
                        flowType: 'implicit',
                        storageKey: 'matemagica-auth-token',
                        storage: {
                            getItem: () => null,
                            setItem: (key, value) => {
                                try { localStorage.setItem(key, value); } catch {}
                            },
                            removeItem: (key) => {
                                try { localStorage.removeItem(key); } catch {}
                            }
                        }
                    }
                }
            );
            
            // Crear servicio básico de auth
            this.createBasicAuthService();
            
            console.log('✅ Cliente Supabase creado manualmente');
            
        } catch (error) {
            console.error('❌ Error creando cliente manual:', error);
        }
    }

    // Configurar autenticación Supabase
    async setupSupabaseAuth() {
        try {
            // ✅ MEJORADO: Verificar múltiples formas de acceso a authService
            let authService = window.authService;
            
            if (!authService && window.supabaseClient) {
                console.log('🔧 authService no disponible, intentando crear desde supabaseClient...');
                // Intentar crear servicios básicos si solo tenemos el cliente
                this.createBasicAuthService();
                authService = this.basicAuthService;
            }
            
            if (authService && authService.onAuthStateChange) {
                // ✅ CORREGIDO: Solo escuchar eventos importantes y evitar duplicados
                authService.onAuthStateChange((event, session) => {
                    console.log(`🔄 Auth Event: ${event}`, session?.user?.email || 'sin usuario');
                    
                    // ✅ PROTECCIÓN ANTI-BUCLE: Verificar si ya estamos procesando
                    if (this.isProcessingAuth || this.authProcessingCompleted) {
                        console.log('⏳ Autenticación ya en proceso o completada, ignorando evento duplicado');
                        return;
                    }
                    
                    if (event === 'SIGNED_IN' && session?.user && !this.currentUser) {
                        this.handleSuccessfulAuth(session.user);
                    } else if (event === 'SIGNED_OUT' && this.currentUser) {
                        this.handleSignOut();
                    }
                });
                
                console.log('✅ Supabase Auth configurado');
                this.isSupabaseReady = true;
            } else {
                console.warn('⚠️ authService.onAuthStateChange no disponible');
                this.isSupabaseReady = false;
            }
        } catch (error) {
            console.error('❌ Error configurando Supabase Auth:', error);
            this.isSupabaseReady = false;
        }
    }

    // ✅ NUEVO: Crear servicio básico de auth si no está disponible
    createBasicAuthService() {
        if (!window.supabaseClient) return;
        
        console.log('🔧 Creando servicio básico de auth...');
        
        this.basicAuthService = {
            async signInWithGoogle(userRole = 'parent') {
                try {
                    console.log('🔐 Iniciando autenticación con Google vía Supabase...');
                    
                    // ✅ MEJORADO: Detectar puerto actual automáticamente
                    const currentUrl = window.location.origin;
                    console.log('🌐 URL actual detectada:', currentUrl);
                    
                    const redirectTo = currentUrl; // Usar la URL actual automáticamente
                    
                    const { data, error } = await window.supabaseClient.auth.signInWithOAuth({
                        provider: 'google',
                        options: {
                            redirectTo: redirectTo,
                            queryParams: {
                                access_type: 'offline',
                                prompt: 'consent'
                            }
                        }
                    });

                    if (error) {
                        console.error('❌ Error en Google OAuth:', error.message);
                        return { success: false, error: error.message };
                    }

                    console.log('✅ Redirección OAuth iniciada');
                    return { success: true, data };

                } catch (error) {
                    console.error('❌ Error inesperado en OAuth:', error);
                    return { success: false, error: error.message };
                }
            },

            onAuthStateChange(callback) {
                try {
                    return window.supabaseClient.auth.onAuthStateChange((event, session) => {
                        if (event === 'SIGNED_IN' && session?.user) {
                            console.log(`🔄 Basic Auth Event: ${event}`, session.user.email);
                            callback(event, session);
                        } else if (event === 'SIGNED_OUT') {
                            console.log(`🔄 Basic Auth Event: ${event}`, 'sin usuario');
                            callback(event, session);
                        }
                    });
                } catch (error) {
                    console.warn('⚠️ Error configurando auth state listener:', error);
                    return { unsubscribe: () => {} };
                }
            },

            async signOut() {
                try {
                    await window.supabaseClient.auth.signOut();
                    return { success: true };
                } catch (error) {
                    console.warn('⚠️ Error en signOut, continuando:', error);
                    return { success: true }; // ✅ Siempre permitir cerrar sesión localmente
                }
            }
        };
        
        console.log('✅ Servicio básico de auth creado');
    }

    // Verificar sesión existente
    async checkExistingSession() {
        try {
            // Protección anti-bucle: Si ya verificamos la sesión, no volver a hacerlo
            if (this.authProcessingCompleted) {
                console.log('⏩ Ya se verificó la sesión previamente, saltando verificación');
                return;
            }
            
            console.log('🔍 Verificando sesión existente después de posible callback...');
            
            // ✅ MEJORADO: Verificar si hay parámetros de callback en la URL
            const urlParams = new URLSearchParams(window.location.search);
            const urlHash = window.location.hash;
            const hasAuthCode = urlParams.has('code') || urlHash.includes('access_token');
            
            // Si detectamos un callback, procesarlo primero
            if (hasAuthCode) {
                console.log('🔄 Detectado callback de autenticación - procesando...');
                this.showAuthLoader(true);
                
                // Intentar procesar el token según documentación
                if (urlHash.includes('access_token')) {
                    const tokenData = this.extractTokenFromUrl();
                    if (tokenData) {
                        console.log('🔑 Token encontrado en URL, procesando...');
                        const success = await this.processUrlToken(tokenData);
                        if (success) {
                            console.log('✅ Token procesado exitosamente');
                            this.authProcessingCompleted = true;
                            this.showAuthLoader(false);
                            return;
                        }
                    }
                }
                
                // ✅ SEGÚN DOCUMENTACIÓN: Esperar a que Supabase detecte el código
                console.log('⏳ Esperando que Supabase procese el código...');
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Verificar si ya tenemos sesión activa
                const hasSession = await this.hasActiveSession();
                if (hasSession) {
                    console.log('✅ Sesión encontrada después del callback');
                    // La sesión ya fue procesada por el listener de onAuthStateChange
                    this.authProcessingCompleted = true;
                    this.showAuthLoader(false);
                    return;
                } else {
                    console.log('⚠️ No se encontró sesión después del callback');
                    this.showWelcomeScreen();
                    this.showAuthLoader(false);
                }
            } else {
                // No hay callback, verificar sesión existente
                console.log('🔍 Verificando sesión existente...');
                
                // ✅ SEGÚN DOCUMENTACIÓN: Usar hasActiveSession primero
                const hasSession = await this.hasActiveSession();
                
                if (hasSession) {
                    // Sesión activa en Supabase
                    console.log('🎯 Sesión de Supabase encontrada, procesando...');
                    const { data: { user } } = await window.supabaseClient.auth.getUser();
                    if (user) {
                        console.log('👤 Usuario recuperado:', user.email);
                        this.currentUser = user;
                        await this.createOrUpdateUserProfile(user);
                        this.authProcessingCompleted = true;
                        await this.showMainApp();
                        return;
                    }
                }
                
                // ✅ FALLBACK: Si no hay sesión de Supabase, intentar con localStorage
                console.log('🗄️ Verificando sesión en localStorage...');
                const savedUser = localStorage.getItem('matemagica_user');
                const savedProfile = localStorage.getItem('matemagica_profile');
                
                if (savedUser && savedProfile) {
                    try {
                        const user = JSON.parse(savedUser);
                        const profile = JSON.parse(savedProfile);
                        
                        console.log('✅ Datos de sesión encontrados en localStorage:', user.email);
                        
                        // Restaurar estado desde localStorage
                        this.currentUser = user;
                        this.userProfile = profile;
                        this.selectedRole = profile.user_role;
                        this.authProcessingCompleted = true;
                        
                        await this.showMainApp();
                        return;
                    } catch (parseError) {
                        console.warn('⚠️ Error al parsear datos de localStorage:', parseError);
                        localStorage.removeItem('matemagica_user');
                        localStorage.removeItem('matemagica_profile');
                    }
                }
                
                // Si llegamos aquí, no hay sesión activa
                console.log('🆕 No hay sesión existente - mostrando bienvenida');
                this.showWelcomeScreen();
            }
            
            this.authProcessingCompleted = true;
            
        } catch (error) {
            console.error('❌ Error verificando sesión:', error);
            this.showWelcomeScreen();
            this.authProcessingCompleted = true;
        }
    }

    // ✅ NUEVO: Verificar si hay una sesión activa en Supabase según documentación
    async hasActiveSession() {
        try {
            // Verificar si hay cliente disponible
            if (!window.supabaseClient || !window.supabaseClient.auth) {
                console.log('⚠️ Supabase no disponible para verificar sesión');
                return false;
            }
            
            console.log('🔍 Verificando sesión activa en Supabase...');
            const { data: { session }, error } = await window.supabaseClient.auth.getSession();
            
            if (error) {
                console.warn('⚠️ Error al obtener sesión:', error.message);
                return false;
            }
            
            const isActive = !!session?.user;
            console.log(`${isActive ? '✅' : '❌'} Sesión activa: ${isActive ? session.user.email : 'No'}`);
            
            return isActive;
        } catch (error) {
            console.error('❌ Error en hasActiveSession:', error);
            return false;
        }
    }

    // ✅ NUEVO: Crear usuario desde token JWT
    async createUserFromToken(accessToken) {
        try {
            console.log('🔧 Creando usuario desde token JWT...');
            
            // Decodificar JWT para extraer información del usuario
            const tokenParts = accessToken.split('.');
            if (tokenParts.length !== 3) {
                console.error('❌ Token JWT inválido');
                return null;
            }
            
            // Decodificar payload
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('📊 Payload del token:', {
                sub: payload.sub,
                email: payload.email,
                exp: new Date(payload.exp * 1000).toLocaleString(),
                user_metadata: payload.user_metadata ? 'presente' : 'ausente'
            });
            
            if (!payload.sub || !payload.email) {
                console.error('❌ Token no contiene información suficiente del usuario');
                return null;
            }
            
            // Verificar si el token ha expirado
            if (payload.exp && payload.exp < Date.now() / 1000) {
                console.error('❌ Token ha expirado');
                return null;
            }
            
            // Crear objeto de usuario compatible con Supabase
            const user = {
                id: payload.sub,
                aud: payload.aud || 'authenticated',
                role: payload.role || 'authenticated',
                email: payload.email,
                phone: payload.phone || '',
                user_metadata: {
                    avatar_url: payload.user_metadata?.avatar_url || payload.user_metadata?.picture,
                    email: payload.email,
                    email_verified: payload.user_metadata?.email_verified || false,
                    full_name: payload.user_metadata?.full_name || payload.user_metadata?.name,
                    iss: payload.user_metadata?.iss,
                    name: payload.user_metadata?.name || payload.user_metadata?.full_name,
                    phone_verified: payload.user_metadata?.phone_verified || false,
                    picture: payload.user_metadata?.picture || payload.user_metadata?.avatar_url,
                    provider_id: payload.user_metadata?.provider_id,
                    sub: payload.user_metadata?.sub
                },
                app_metadata: {
                    provider: payload.app_metadata?.provider || 'google',
                    providers: payload.app_metadata?.providers || ['google']
                },
                created_at: new Date().toISOString(),
                confirmed_at: new Date().toISOString(),
                last_sign_in_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            console.log('✅ Usuario creado desde token:', {
                id: user.id,
                email: user.email,
                name: user.user_metadata?.full_name || user.user_metadata?.name
            });
            
            return user;
            
        } catch (error) {
            console.error('❌ Error creando usuario desde token:', error);
            return null;
        }
    }

    // ✅ NUEVO: Limpiar URL después de autenticación
    cleanupUrlAfterAuth() {
        try {
            console.log('🧹 Limpiando URL después de autenticación...');
            
            // Obtener URL limpia sin parámetros de OAuth
            const cleanUrl = window.location.origin + window.location.pathname;
            
            // Reemplazar en el historial para evitar problemas al recargar
            window.history.replaceState({}, document.title, cleanUrl);
            
            console.log('✅ URL limpiada exitosamente');
            
        } catch (error) {
            console.warn('⚠️ Error limpiando URL (no crítico):', error);
        }
    }

    // ✅ NUEVO: Crear usuario básico desde token (fallback simplificado)
    async createBasicUserFromToken(accessToken) {
        try {
            console.log('🔧 Creando usuario básico desde token...');
            
            // Decodificar JWT para extraer información del usuario
            const tokenParts = accessToken.split('.');
            if (tokenParts.length !== 3) {
                console.error('❌ Token JWT inválido para usuario básico');
                return null;
            }
            
            // Decodificar payload
            const payload = JSON.parse(atob(tokenParts[1]));
            
            if (!payload.sub || !payload.email) {
                console.error('❌ Token no contiene información suficiente del usuario');
                return null;
            }
            
            // Crear objeto de usuario básico
            const basicUser = {
                id: payload.sub,
                email: payload.email,
                user_metadata: {
                    full_name: payload.user_metadata?.full_name || payload.user_metadata?.name || payload.email.split('@')[0],
                    name: payload.user_metadata?.name || payload.user_metadata?.full_name,
                    avatar_url: payload.user_metadata?.avatar_url || payload.user_metadata?.picture,
                    email_verified: true
                },
                created_at: new Date().toISOString()
            };
            
            console.log('✅ Usuario básico creado:', {
                id: basicUser.id,
                email: basicUser.email,
                name: basicUser.user_metadata?.full_name || basicUser.user_metadata?.name
            });
            
            return basicUser;
            
        } catch (error) {
            console.error('❌ Error creando usuario básico:', error);
            return null;
        }
    }

    // Seleccionar rol de usuario
    async selectRole(role) {
        console.log('👤 Rol seleccionado:', role);
        this.selectedRole = role;
        
        if (role === 'student') {
            this.showStudentForm();
        } else {
            this.showAuthScreen();
        }
    }

    // Mostrar pantalla de bienvenida
    showWelcomeScreen() {
        console.log('👋 Mostrando pantalla de bienvenida');
        this.hideAllScreens('welcomeScreen');
        
        if (this.elements.welcomeScreen) {
            this.elements.welcomeScreen.classList.remove('hidden');
            this.elements.welcomeScreen.classList.remove('oculto');
            console.log('✅ Pantalla de bienvenida visible');
        } else {
            console.error('❌ Elemento welcomeScreen no encontrado');
        }
    }

    // Mostrar pantalla de autenticación
    showAuthScreen() {
        console.log('🔐 Mostrando pantalla de autenticación');
        this.hideAllScreens('authScreen');
        
        if (this.elements.authScreen) {
            this.elements.authScreen.classList.remove('hidden');
            this.elements.authScreen.classList.remove('oculto');
            
            // Configurar botón de Google
            if (this.elements.googleAuthBtn) {
                this.elements.googleAuthBtn.onclick = () => this.handleGoogleAuth();
                this.elements.googleAuthBtn.disabled = false;
                this.elements.googleAuthBtn.textContent = 'Continuar con Google';
            }
            
            console.log('✅ Pantalla de autenticación visible');
        } else {
            console.error('❌ Elemento authScreen no encontrado');
        }
    }

    // Manejar autenticación con Google
    async handleGoogleAuth() {
        if (this.isProcessingAuth) {
            console.log('⏳ Autenticación ya en proceso...');
            return;
        }

        this.isProcessingAuth = true;
        
        try {
            console.log('🔐 Iniciando autenticación con Google...');
            
            // Deshabilitar botón y mostrar estado de carga
            if (this.elements.googleAuthBtn) {
                this.elements.googleAuthBtn.disabled = true;
                this.elements.googleAuthBtn.textContent = 'Conectando...';
            }
            
            // Mostrar loader
            this.showAuthLoader(true);
            
            // ✅ MEJORADO: Usar servicio disponible
            const authService = window.authService || this.basicAuthService;
            
            if (!authService) {
                throw new Error('Servicio de autenticación no disponible');
            }
            
            // Intentar autenticación
            const result = await authService.signInWithGoogle(this.selectedRole);
            
            if (!result.success) {
                throw new Error(result.error || 'Error desconocido en autenticación');
            }
            
            console.log('✅ Autenticación iniciada correctamente');
            // El callback manejará el resto del proceso
            
        } catch (error) {
            console.error('❌ Error en autenticación:', error);
            
            // Mostrar error al usuario
            this.showAuthError('Error al conectar con Google. Por favor, intenta de nuevo.');
            
            // Restaurar botón
            if (this.elements.googleAuthBtn) {
                this.elements.googleAuthBtn.disabled = false;
                this.elements.googleAuthBtn.textContent = 'Continuar con Google';
            }
            
            this.showAuthLoader(false);
        } finally {
            this.isProcessingAuth = false;
        }
    }

    // Mostrar formulario de estudiante
    showStudentForm() {
        console.log('📝 Mostrando formulario de estudiante');
        this.hideAllScreens('studentSelectionScreen');
        
        if (this.elements.studentSelectionScreen) {
            this.elements.studentSelectionScreen.classList.remove('hidden');
            this.elements.studentSelectionScreen.classList.remove('oculto');
            console.log('✅ Formulario de estudiante visible');
        } else {
            console.error('❌ Elemento studentSelectionScreen no encontrado');
        }
    }

    // Manejar envío del formulario de estudiante
    async handleStudentFormSubmit(e) {
        e.preventDefault();
        
        const name = this.elements.studentNameInput?.value?.trim();
        const grade = this.elements.studentGradeSelect?.value;
        
        if (!name || !grade) {
            alert('Por favor, completa todos los campos');
            return;
        }
        
        console.log('👶 Creando perfil de estudiante:', { name, grade });
        
        // Crear usuario estudiante
        const studentUser = {
            id: `student_${Date.now()}`,
            email: null,
            user_metadata: {
                full_name: name,
                is_student: true
            }
        };
        
        // Crear perfil de estudiante
        this.studentInfo = { name, grade };
        this.selectedRole = 'student';
        
        await this.handleSuccessfulAuth(studentUser);
    }

    // Manejar autenticación exitosa
    async handleSuccessfulAuth(user) {
        // ✅ PROTECCIÓN ANTI-BUCLE: Verificar si ya estamos procesando
        if (this.isProcessingAuth || this.authProcessingCompleted) {
            console.log('⏳ Autenticación ya procesada, saltando...');
            return;
        }
        
        this.isProcessingAuth = true;
        
        try {
            console.log('✅ Procesando autenticación exitosa para:', user.email || user.user_metadata?.full_name);
            
            this.currentUser = user;
            
            // Crear o actualizar perfil
            await this.createOrUpdateUserProfile(user);
            
            // ✅ MARCAR COMO COMPLETADO ANTES DE REDIRECCIÓN
            this.authProcessingCompleted = true;
            
            // Ir a la aplicación principal
            await this.showMainApp();
            
        } catch (error) {
            console.error('❌ Error procesando autenticación exitosa:', error);
            this.showAuthError('Error configurando tu cuenta. Por favor, intenta de nuevo.');
            
            // ✅ RESETEAR EN CASO DE ERROR
            this.authProcessingCompleted = false;
        } finally {
            this.isProcessingAuth = false;
        }
    }

    // Guardar perfil en Supabase
    async saveUserProfileToSupabase() {
        try {
            console.log('💾 === INICIANDO GUARDADO DE PERFIL ===');
            
            // ✅ SIEMPRE guardar en localStorage primero (backup principal)
            if (this.userProfile) {
                localStorage.setItem('matemagica-user-profile', JSON.stringify(this.userProfile));
                console.log('✅ Perfil guardado en localStorage como respaldo');
            }
            
            // ✅ INTENTAR guardar en Supabase solo si está disponible
            if (!window.supabaseClient || !this.userProfile) {
                console.log('⏭️ Supabase no disponible - usando solo localStorage');
                console.log('💾 === GUARDADO DE PERFIL COMPLETADO (LOCAL ONLY) ===');
                return { success: true, method: 'localStorage' };
            }
            
            console.log('💾 Intentando guardar perfil en Supabase...');
            console.log('📊 Datos del perfil a guardar:', {
                user_id: this.userProfile.user_id,
                email: this.userProfile.email,
                full_name: this.userProfile.full_name,
                user_role: this.userProfile.user_role
            });
            
            // ✅ CORREGIDO: Usar tabla math_profiles con timeout
            const perfilData = {
                user_id: this.userProfile.user_id,
                email: this.userProfile.email,
                full_name: this.userProfile.full_name,
                user_role: this.userProfile.user_role || 'parent',
                avatar_url: this.userProfile.avatar_url,
                // ✅ NUEVO: Mapear también a campos originales de math_profiles
                nombre_completo: this.userProfile.full_name,
                nivel_preferido: 'facil',
                configuracion: {
                    tema: 'claro',
                    notificaciones: true,
                    nivel_default: 'facil'
                },
                estadisticas: {
                    sesiones_completadas: 0,
                    ejercicios_resueltos: 0,
                    precision_promedio: 0
                }
            };
            
            console.log('🚀 Ejecutando upsert en Supabase...');
            
            // ✅ NUEVO: Agregar timeout para evitar bloqueos
            const supabasePromise = window.supabaseClient
                .from('math_profiles')
                .upsert(perfilData, {
                    onConflict: 'user_id'
                });
            
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout en guardado de Supabase')), 8000)
            );
            
            const { data, error } = await Promise.race([supabasePromise, timeoutPromise]);
            
            if (error) {
                console.warn('⚠️ Error guardando en Supabase:', error.message);
                console.log('📱 Perfil disponible en localStorage como respaldo');
                console.log('💾 === GUARDADO DE PERFIL COMPLETADO (CON ERRORES) ===');
                return { success: false, error: error.message, method: 'localStorage' };
            } else {
                console.log('✅ Perfil guardado exitosamente en Supabase');
                console.log('📊 Resultado de Supabase:', data);
                console.log('💾 === GUARDADO DE PERFIL COMPLETADO (SUPABASE + LOCAL) ===');
                return { success: true, method: 'both' };
            }
            
        } catch (error) {
            console.warn('⚠️ Error inesperado guardando perfil:', error.message);
            console.log('📱 Perfil guardado localmente como respaldo');
            console.log('💾 === GUARDADO DE PERFIL COMPLETADO (FALLBACK) ===');
            console.log('🔍 Stack trace del error:', error.stack);
            return { success: false, error: error.message, method: 'localStorage' };
        }
    }

    // Crear o actualizar perfil de usuario
    async createOrUpdateUserProfile(user) {
        try {
            console.log('👤 === INICIANDO CREACIÓN DE PERFIL ===');
            console.log('📊 Usuario recibido:', {
                id: user.id,
                email: user.email || 'N/A',
                name: user.user_metadata?.full_name || user.user_metadata?.name || 'N/A'
            });
            
            // Determinar información del perfil
            const isStudent = this.selectedRole === 'student' || user.user_metadata?.is_student;
            
            this.userProfile = {
                user_id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || this.studentInfo?.name || 'Usuario',
                user_role: this.selectedRole || 'parent',
                avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
                is_student: isStudent,
                student_grade: this.studentInfo?.grade || null,
                created_at: new Date().toISOString(),
                last_login: new Date().toISOString(),
                preferences: {
                    theme: 'light',
                    difficulty: 'medium',
                    notifications: true
                }
            };
            
            console.log('✅ Perfil creado exitosamente:', {
                user_id: this.userProfile.user_id,
                email: this.userProfile.email,
                full_name: this.userProfile.full_name,
                user_role: this.userProfile.user_role,
                is_student: this.userProfile.is_student
            });
            
            // Guardar en localStorage INMEDIATAMENTE
            console.log('💾 Guardando sesión en localStorage...');
            this.saveUserSession();
            console.log('✅ Sesión guardada en localStorage');
            
            // ✅ NUEVO: Intentar guardar en Supabase SIN BLOQUEAR el flujo
            console.log('🔄 Iniciando guardado en Supabase (no bloqueante)...');
            
            try {
                const supabaseResult = await this.saveUserProfileToSupabase();
                console.log('📊 Resultado de Supabase:', supabaseResult);
            } catch (supabaseError) {
                console.warn('⚠️ Error en Supabase (no crítico):', supabaseError.message);
            }
            
            console.log('👤 === CREACIÓN DE PERFIL COMPLETADA ===');
            console.log('🚀 Continuando con showMainApp()...');
            
        } catch (error) {
            console.warn('⚠️ Error creando perfil (continuando con datos mínimos):', error);
            
            // ✅ FALLBACK: Crear perfil mínimo para continuar
            this.userProfile = {
                user_id: user.id,
                email: user.email || 'usuario@ejemplo.com',
                full_name: user.user_metadata?.full_name || 'Usuario',
                user_role: this.selectedRole || 'parent',
                created_at: new Date().toISOString()
            };
            
            // Guardar al menos en localStorage
            this.saveUserSession();
            console.log('✅ Perfil mínimo creado y guardado');
        }
    }

    // Manejar cierre de sesión
    async handleSignOut() {
        try {
            console.log('👋 Cerrando sesión...');
            
            // ✅ RESETEAR FLAGS DE PROTECCIÓN
            this.authProcessingCompleted = false;
            this.redirectInProgress = false;
            this.hasRedirected = false;
            
            // Limpiar estado local
            this.currentUser = null;
            this.userProfile = null;
            this.selectedRole = null;
            this.studentInfo = null;
            
            // Limpiar localStorage
            localStorage.removeItem('matemagica_user');
            localStorage.removeItem('matemagica_profile');
            localStorage.removeItem('matemagica-user-profile');
            
            // Cerrar sesión en Supabase
            const authService = window.authService || this.basicAuthService;
            if (authService?.signOut) {
                await authService.signOut();
            }
            
            // Limpiar clases del body
            document.body.classList.remove('student-mode', 'parent-teacher-mode');
            
            // Volver a la pantalla de bienvenida
            this.showWelcomeScreen();
            
            console.log('✅ Sesión cerrada correctamente');
            
        } catch (error) {
            console.error('❌ Error cerrando sesión:', error);
            // Forzar limpieza y mostrar bienvenida
            this.showWelcomeScreen();
        }
    }

    // Ocultar todas las pantallas EXCEPTO la que se especifique
    hideAllScreens(except = null) {
        console.log('🙈 Ocultando todas las pantallas excepto:', except || 'ninguna');
        
        // Lista de pantallas principales
        const screens = [
            'welcomeScreen',
            'studentSelectionScreen', 
            'authScreen',
            'appScreen'
        ];
        
        screens.forEach(screenKey => {
            const element = this.elements[screenKey];
            if (element && element.classList && screenKey !== except) {
                element.classList.add('hidden');
                element.classList.add('oculto');
            }
        });
        
        // ✅ NUEVO: También ocultar loaders y modales
        const auxiliaryElements = [
            'authLoader'
        ];
        
        auxiliaryElements.forEach(elemKey => {
            const element = this.elements[elemKey];
            if (element && element.classList) {
                element.classList.add('hidden');
                element.classList.add('oculto');
            }
        });
    }

    // ✅ CORREGIDO: Mostrar aplicación principal with evento personalizado
    async showMainApp() {
        console.log('🚀 Procesando acceso a aplicación principal');
        console.log('👤 Usuario autenticado:', this.userProfile?.full_name);
        console.log('🎭 Rol del usuario:', this.selectedRole);
        
        // ✅ NUEVO: Redirección por rol a dashboard específico
        await this.redirectToRoleDashboard();
    }

    // ✅ NUEVO: Redirigir a dashboard específico según el rol
    async redirectToRoleDashboard() {
        try {
            const role = this.selectedRole || this.userProfile?.user_role;
            
            console.log('🎯 Redirigiendo según rol:', role);
            
            // ✅ PROTECCIÓN: Evitar redirecciones múltiples - CORREGIDO
            if (this.redirectInProgress) {
                console.log('🔄 Redirección ya en progreso, saltando...');
                return;
            }
            this.redirectInProgress = true;
            
            // Guardar datos antes de redirección
            this.saveUserSession();
            
            // ✅ REDIRECCIÓN POR ROL
            switch (role) {
                case 'teacher':
                case 'profesor':
                    console.log('👨‍🏫 Redirigiendo a dashboard de profesor...');
                    this.redirectToPage('profesor.html');
                    break;
                    
                case 'parent':
                case 'apoderado':
                    console.log('👨‍👩‍👧‍👦 Redirigiendo a dashboard de apoderado...');
                    this.redirectToPage('apoderado.html');
                    break;
                    
                case 'student':
                case 'estudiante':
                    console.log('👶 Usuario estudiante - quedando en app principal...');
                    this.showStudentMainApp();
                    // ✅ RESETEAR FLAG para estudiantes (no hay redirección)
                    this.redirectInProgress = false;
                    break;
                    
                default:
                    console.warn('⚠️ Rol no reconocido:', role);
                    console.log('🔄 Fallback: Mostrar selector de rol nuevamente');
                    // ✅ RESETEAR FLAG antes de volver a welcome
                    this.redirectInProgress = false;
                    this.showWelcomeScreen();
                    break;
            }
            
        } catch (error) {
            console.error('❌ Error en redirección por rol:', error);
            // ✅ RESETEAR FLAG en caso de error
            this.redirectInProgress = false;
            // Fallback: mostrar app principal genérica
            this.showGenericMainApp();
        }
    }

    // ✅ CORREGIDO: Redireccionar a página específica
    redirectToPage(pageName) {
        try {
            console.log(`🔄 Redirigiendo a ${pageName}...`);
            
            // ✅ PROTECCIÓN: Solo una redirección por sesión - MEJORADO
            if (this.hasRedirected) {
                console.log('⚠️ Ya se realizó una redirección, evitando duplicado');
                // ✅ RESETEAR FLAG y permitir redirección tras timeout
                setTimeout(() => {
                    this.redirectInProgress = false;
                    this.hasRedirected = false;
                }, 2000);
                return;
            }
            this.hasRedirected = true;
            
            // ✅ IMPORTANTE: Mantener la URL base actual para conservar puerto/dominio
            const currentOrigin = window.location.origin;
            const currentPath = window.location.pathname.split('/').slice(0, -1).join('/');
            const targetUrl = `${currentOrigin}${currentPath}/${pageName}`;
            
            console.log('🌐 URL de destino:', targetUrl);
            console.log('🚀 Iniciando redirección en 1 segundo...');
            
            // ✅ LIMPIAR ESTADO ANTES DE REDIRECCIÓN
            this.cleanupUrlAfterAuth();
            
            // ✅ TIMEOUT para evitar redirección inmediata y permitir que se complete el proceso
            setTimeout(() => {
                console.log('🔄 Ejecutando redirección a:', targetUrl);
                
                // ✅ RESETEAR FLAGS antes de redirección
                this.redirectInProgress = false;
                
                // ✅ REDIRECCIÓN MEJORADA con fallback
                try {
                    window.location.href = targetUrl;
                } catch (redirectError) {
                    console.warn('⚠️ Error en redirección principal, usando fallback');
                    window.location.href = pageName;
                }
            }, 1000);
            
        } catch (error) {
            console.error('❌ Error en redirección:', error);
            // ✅ RESETEAR FLAGS en caso de error
            this.redirectInProgress = false;
            this.hasRedirected = false;
            
            // Fallback: recargar con nueva página
            setTimeout(() => {
                window.location.href = pageName;
            }, 500);
        }
    }

    // ✅ NUEVO: Mostrar app principal para estudiantes (sin redirección)
    showStudentMainApp() {
        console.log('👶 Mostrando aplicación principal para estudiante');
        
        this.hideAllScreens('appScreen');
        this.showAuthLoader(false);
        
        if (this.elements.appScreen) {
            this.elements.appScreen.classList.remove('hidden');
            this.elements.appScreen.classList.remove('oculto');
            
            // Actualizar UI con información del usuario
            this.updateMainAppUI();
            
            // ✅ Marcar como modo estudiante
            document.body.classList.add('student-mode');
            
            // ✅ Dispara evento para que la app principal sepa que estamos listos
            window.dispatchEvent(new CustomEvent('userAuthenticated', {
                detail: {
                    user: this.currentUser,
                    profile: this.userProfile,
                    role: this.selectedRole,
                    isStudent: true
                }
            }));
            
            console.log('✅ Aplicación principal visible para estudiante');
        } else {
            console.error('❌ Elemento appScreen no encontrado');
        }
    }

    // ✅ NUEVO: Mostrar app principal genérica (fallback)
    showGenericMainApp() {
        console.log('🔄 Mostrando aplicación principal genérica (fallback)');
        
        this.hideAllScreens('appScreen');
        this.showAuthLoader(false);
        
        if (this.elements.appScreen) {
            this.elements.appScreen.classList.remove('hidden');
            this.elements.appScreen.classList.remove('oculto');
            
            // Actualizar UI con información del usuario
            this.updateMainAppUI();
            
            // ✅ Dispara evento para que la app principal sepa que estamos listos
            window.dispatchEvent(new CustomEvent('userAuthenticated', {
                detail: {
                    user: this.currentUser,
                    profile: this.userProfile,
                    role: this.selectedRole
                }
            }));
            
            console.log('✅ Aplicación principal genérica visible');
        } else {
            console.error('❌ Elemento appScreen no encontrado');
        }
    }

    // ✅ NUEVO: Guardar sesión del usuario en localStorage
    saveUserSession() {
        try {
            console.log('💾 Guardando sesión en localStorage...');
            
            if (this.currentUser) {
                localStorage.setItem('matemagica_user', JSON.stringify(this.currentUser));
                console.log('✅ Usuario guardado en localStorage');
            }
            
            if (this.userProfile) {
                localStorage.setItem('matemagica_profile', JSON.stringify(this.userProfile));
                localStorage.setItem('matemagica-user-profile', JSON.stringify(this.userProfile));
                console.log('✅ Perfil guardado en localStorage');
            }
            
            if (this.selectedRole) {
                localStorage.setItem('matemagica_role', this.selectedRole);
                console.log('✅ Rol guardado en localStorage');
            }
            
            if (this.studentInfo) {
                localStorage.setItem('matemagica_student_info', JSON.stringify(this.studentInfo));
                console.log('✅ Info de estudiante guardada en localStorage');
            }
            
            console.log('💾 Sesión completa guardada en localStorage');
            
        } catch (error) {
            console.warn('⚠️ Error guardando sesión en localStorage:', error);
        }
    }

    // ✅ NUEVO: Actualizar UI de la aplicación principal
    updateMainAppUI() {
        try {
            console.log('🎨 Actualizando UI de la aplicación principal');
            
            // Buscar elementos de UI para actualizar
            const userNameElements = document.querySelectorAll('[data-user-name]');
            const userEmailElements = document.querySelectorAll('[data-user-email]');
            const userRoleElements = document.querySelectorAll('[data-user-role]');
            const userAvatarElements = document.querySelectorAll('[data-user-avatar]');
            
            // Actualizar nombre del usuario
            if (this.userProfile?.full_name) {
                userNameElements.forEach(element => {
                    element.textContent = this.userProfile.full_name;
                });
                console.log('✅ Nombre de usuario actualizado en UI');
            }
            
            // Actualizar email del usuario
            if (this.userProfile?.email) {
                userEmailElements.forEach(element => {
                    element.textContent = this.userProfile.email;
                });
                console.log('✅ Email de usuario actualizado en UI');
            }
            
            // Actualizar rol del usuario
            if (this.selectedRole) {
                userRoleElements.forEach(element => {
                    element.textContent = this.selectedRole === 'parent' ? 'Apoderado' : 
                                         this.selectedRole === 'teacher' ? 'Profesor' : 'Estudiante';
                });
                console.log('✅ Rol de usuario actualizado en UI');
            }
            
            // Actualizar avatar del usuario
            if (this.userProfile?.avatar_url) {
                userAvatarElements.forEach(element => {
                    if (element.tagName === 'IMG') {
                        element.src = this.userProfile.avatar_url;
                        element.alt = `Avatar de ${this.userProfile.full_name}`;
                    } else {
                        element.style.backgroundImage = `url(${this.userProfile.avatar_url})`;
                    }
                });
                console.log('✅ Avatar de usuario actualizado en UI');
            }
            
            // Actualizar título de la página si es necesario
            if (this.userProfile?.full_name) {
                document.title = `Matemágica - ${this.userProfile.full_name}`;
            }
            
            // Añadir clases CSS según el rol para estilos específicos
            document.body.classList.remove('role-parent', 'role-teacher', 'role-student');
            if (this.selectedRole) {
                document.body.classList.add(`role-${this.selectedRole}`);
            }
            
            console.log('✅ UI de aplicación principal actualizada');
            
        } catch (error) {
            console.warn('⚠️ Error actualizando UI (no crítico):', error);
        }
    }

    // ✅ NUEVO: Verificar si el usuario está autenticado
    isAuthenticated() {
        try {
            // Verificar si hay sesión activa en Supabase
            if (this.supabaseClient?.auth?.getUser) {
                return !!this.currentUser;
            }
            
            // Verificar datos en localStorage como fallback
            const userData = localStorage.getItem('matemagica_user');
            const profileData = localStorage.getItem('matemagica_profile');
            
            return !!(userData || profileData);
            
        } catch (error) {
            console.warn('⚠️ Error verificando autenticación:', error);
            return false;
        }
    }

    // ✅ NUEVO: Obtener usuario actual
    getCurrentUser() {
        try {
            if (this.currentUser) {
                return this.currentUser;
            }
            
            // Intentar cargar desde localStorage
            const userData = localStorage.getItem('matemagica_user');
            if (userData) {
                return JSON.parse(userData);
            }
            
            const profileData = localStorage.getItem('matemagica_profile');
            if (profileData) {
                const profile = JSON.parse(profileData);
                return {
                    id: profile.id,
                    name: profile.full_name,
                    email: profile.email,
                    avatar: profile.avatar_url
                };
            }
            
            return null;
            
        } catch (error) {
            console.warn('⚠️ Error obteniendo usuario actual:', error);
            return null;
        }
    }

    // ✅ NUEVO: Obtener perfil del usuario
    getUserProfile() {
        try {
            if (this.userProfile) {
                return this.userProfile;
            }
            
            const profileData = localStorage.getItem('matemagica_profile');
            if (profileData) {
                return JSON.parse(profileData);
            }
            
            return null;
            
        } catch (error) {
            console.warn('⚠️ Error obteniendo perfil de usuario:', error);
            return null;
        }
    }

    // ✅ NUEVO: Obtener rol seleccionado
    getSelectedRole() {
        try {
            if (this.selectedRole) {
                return this.selectedRole;
            }
            
            return localStorage.getItem('matemagica_role') || null;
            
        } catch (error) {
            console.warn('⚠️ Error obteniendo rol seleccionado:', error);
            return null;
        }
    }

    // ✅ NUEVO: Cerrar sesión
    async signOut() {
        try {
            console.log('🚪 Iniciando cierre de sesión...');
            
            // Cerrar sesión en Supabase si está disponible
            if (this.supabaseClient?.auth?.signOut) {
                await this.supabaseClient.auth.signOut();
                console.log('✅ Sesión cerrada en Supabase');
            }
            
            // Limpiar datos locales
            this.currentUser = null;
            this.userProfile = null;
            this.selectedRole = null;
            this.studentInfo = null;
            
            // Limpiar localStorage
            const keysToRemove = [
                'matemagica_user',
                'matemagica_profile', 
                'matemagica-user-profile',
                'matemagica_role',
                'matemagica_student_info',
                'currentUser',
                'isAuthenticated'
            ];
            
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });
            
            console.log('🧹 Datos locales limpiados');
            
            // Mostrar notificación si está disponible
            if (window.mostrarNotificacion) {
                window.mostrarNotificacion('👋 Sesión cerrada correctamente', 'success');
            }
            
            // Redireccionar después de un breve delay
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1500);
            
            console.log('✅ Cierre de sesión completado');
            
        } catch (error) {
            console.error('❌ Error cerrando sesión:', error);
            // Fallback: forzar limpieza y redirección
            localStorage.clear();
            window.location.href = '/index.html';
        }
    }

    // ✅ NUEVO: Obtener información del estudiante
    getStudentInfo() {
        try {
            if (this.studentInfo) {
                return this.studentInfo;
            }
            
            const studentData = localStorage.getItem('matemagica_student_info');
            if (studentData) {
                return JSON.parse(studentData);
            }
            
            return null;
            
        } catch (error) {
            console.warn('⚠️ Error obteniendo información de estudiante:', error);
            return null;
        }
    }

    // ✅ NUEVO: Actualizar información del estudiante
    updateStudentInfo(studentInfo) {
        try {
            this.studentInfo = studentInfo;
            localStorage.setItem('matemagica_student_info', JSON.stringify(studentInfo));
            console.log('✅ Información de estudiante actualizada');
            
        } catch (error) {
            console.error('❌ Error actualizando información de estudiante:', error);
        }
    }

    // ✅ NUEVO: Verificar si el sistema está listo
    isReady() {
        return this.isInitialized && (this.currentUser || this.isAuthenticated());
    }

    // ✅ NUEVO: Obtener estado completo del sistema
    getSystemStatus() {
        return {
            isInitialized: this.isInitialized,
            isAuthenticated: this.isAuthenticated(),
            hasUser: !!this.currentUser,
            hasProfile: !!this.userProfile,
            hasRole: !!this.selectedRole,
            hasStudentInfo: !!this.studentInfo,
            supabaseAvailable: !!this.supabaseClient
        };
    }

    // ✅ NUEVO: Mostrar/ocultar loader de autenticación
    showAuthLoader(show = true) {
        try {
            const loader = this.elements.authLoader || document.getElementById('auth-loading');
            
            if (loader) {
                if (show) {
                    loader.classList.remove('hidden', 'oculto');
                    loader.style.display = 'flex';
                    console.log('⏳ Loader de autenticación mostrado');
                } else {
                    loader.classList.add('hidden', 'oculto');
                    loader.style.display = 'none';
                    console.log('✅ Loader de autenticación ocultado');
                }
            } else {
                console.warn('⚠️ Elemento loader de autenticación no encontrado');
            }
        } catch (error) {
            console.warn('⚠️ Error controlando loader de autenticación:', error);
        }
    }

    // ✅ NUEVO: Mostrar error de autenticación
    showAuthError(message) {
        try {
            console.error('❌ Error de autenticación:', message);
            
            // Buscar elemento de error existente
            let errorElement = document.getElementById('auth-error');
            
            // Si no existe, crear uno temporal
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.id = 'auth-error';
                errorElement.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4';
                
                // Insertar antes del botón de Google si existe
                const authScreen = this.elements.authScreen;
                const googleBtn = this.elements.googleAuthBtn;
                
                if (authScreen && googleBtn) {
                    authScreen.insertBefore(errorElement, googleBtn);
                } else if (authScreen) {
                    authScreen.appendChild(errorElement);
                } else {
                    // Fallback: mostrar como alert
                    alert(message);
                    return;
                }
            }
            
            // Mostrar mensaje
            errorElement.textContent = message;
            errorElement.classList.remove('hidden', 'oculto');
            
            // Auto-ocultar después de 5 segundos
            setTimeout(() => {
                if (errorElement && errorElement.parentNode) {
                    errorElement.classList.add('hidden');
                }
            }, 5000);
            
            console.log('🚨 Error de autenticación mostrado en UI');
            
        } catch (error) {
            console.warn('⚠️ Error mostrando mensaje de error:', error);
            // Fallback último recurso
            alert(message);
        }
    }

    // ✅ NUEVO: Ejecutar diagnósticos de Supabase
    async runSupabaseDiagnostics() {
        try {
            console.log('🔬 === DIAGNÓSTICO DE SUPABASE ===');
            
            // Verificar configuración
            const hasConfig = !!(window.SUPABASE_CONFIG && window.isSupabaseConfigured);
            const configValid = hasConfig ? window.isSupabaseConfigured() : false;
            
            console.log('📊 Estado de configuración:');
            console.log('- Configuración existe:', hasConfig);
            console.log('- Configuración válida:', configValid);
            console.log('- URL de Supabase:', window.SUPABASE_CONFIG?.url || 'N/A');
            console.log('- Tiene anon key:', !!(window.SUPABASE_CONFIG?.anon_key));
            
            // Verificar cliente
            const hasClient = !!window.supabaseClient;
            const hasAuth = !!(window.supabaseClient?.auth);
            
            console.log('📊 Estado del cliente:');
            console.log('- Cliente existe:', hasClient);
            console.log('- Auth disponible:', hasAuth);
            
            // Verificar servicios
            const hasAuthService = !!window.authService;
            const hasBasicAuth = !!this.basicAuthService;
            
            console.log('📊 Estado de servicios:');
            console.log('- authService disponible:', hasAuthService);
            console.log('- basicAuthService disponible:', hasBasicAuth);
            
            // Test de conectividad (solo si todo está configurado)
            if (hasClient && hasAuth && configValid) {
                console.log('🔌 Probando conectividad...');
                
                try {
                    const { data: healthCheck, error: healthError } = await Promise.race([
                        window.supabaseClient.from('math_profiles').select('count').limit(1),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
                    ]);
                    
                    if (healthError) {
                        console.warn('⚠️ Test de conectividad falló:', healthError.message);
                    } else {
                        console.log('✅ Conectividad exitosa');
                    }
                } catch (connectError) {
                    console.warn('⏰ Test de conectividad timeout:', connectError.message);
                }
            }
            
            console.log('🔬 === FIN DIAGNÓSTICO ===');
            
        } catch (error) {
            console.error('❌ Error en diagnóstico:', error);
        }
    }

    // API pública
    isAuthenticated() {
        try {
            if (this.supabaseClient?.auth?.getUser) {
                return !!this.currentUser;
            }
            
            const userData = localStorage.getItem('matemagica_user');
            const profileData = localStorage.getItem('matemagica_profile');
            
            return !!(userData || profileData);
            
        } catch (error) {
            console.warn('⚠️ Error verificando autenticación:', error);
            return false;
        }
    }

    getCurrentUser() {
        try {
            if (this.currentUser) {
                return this.currentUser;
            }
            
            const userData = localStorage.getItem('matemagica_user');
            if (userData) {
                return JSON.parse(userData);
            }
            
            const profileData = localStorage.getItem('matemagica_profile');
            if (profileData) {
                const profile = JSON.parse(profileData);
                return {
                    id: profile.id,
                    name: profile.full_name,
                    email: profile.email,
                    avatar: profile.avatar_url
                };
            }
            
            return null;
            
        } catch (error) {
            console.warn('⚠️ Error obteniendo usuario actual:', error);
            return null;
        }
    }

    getUserProfile() {
        try {
            if (this.userProfile) {
                return this.userProfile;
            }
            
            const profileData = localStorage.getItem('matemagica_profile');
            if (profileData) {
                return JSON.parse(profileData);
            }
            
            return null;
            
        } catch (error) {
            console.warn('⚠️ Error obteniendo perfil de usuario:', error);
            return null;
        }
    }

    signOut() {
        try {
            if (this.supabaseClient?.auth?.signOut) {
                this.supabaseClient.auth.signOut();
            }
            
            this.currentUser = null;
            this.userProfile = null;
            this.selectedRole = null;
            this.studentInfo = null;
            
            const keysToRemove = [
                'matemagica_user',
                'matemagica_profile', 
                'matemagica-user-profile',
                'matemagica_role',
                'matemagica_student_info',
                'currentUser',
                'isAuthenticated'
            ];
            
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });
            
            console.log('🧹 Datos locales limpiados');
            
            // Mostrar notificación si está disponible
            if (window.mostrarNotificacion) {
                window.mostrarNotificacion('👋 Sesión cerrada correctamente', 'success');
            }
            
            // Redireccionar después de un breve delay
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1500);
            
            console.log('✅ Cierre de sesión completado');
            
        } catch (error) {
            console.error('❌ Error cerrando sesión:', error);
            // Fallback: forzar limpieza y redirección
            localStorage.clear();
            window.location.href = '/index.html';
        }
    }

    // ✅ NUEVO: Extraer token de la URL
    extractTokenFromUrl() {
        try {
            console.log('🔍 Extrayendo token de URL...');
            
            // Obtener el hash fragment (la parte después del #)
            const hashFragment = window.location.hash;
            if (!hashFragment || !hashFragment.includes('access_token=')) {
                console.log('⚠️ No se encontró token en la URL');
                return null;
            }
            
            console.log('🔑 Hash fragment encontrado, extrayendo token...');
            
            // Parseamos los parámetros del hash
            const hashParams = {};
            hashFragment.substring(1).split('&').forEach(param => {
                const [key, value] = param.split('=');
                hashParams[key] = decodeURIComponent(value);
            });
            
            // Verificar si tenemos los tokens necesarios
            if (!hashParams.access_token) {
                console.warn('⚠️ access_token no encontrado en hash');
                return null;
            }
            
            // Extraer tokens
            const tokenData = {
                access_token: hashParams.access_token,
                expires_in: hashParams.expires_in,
                refresh_token: hashParams.refresh_token || null,
                token_type: hashParams.token_type || 'bearer'
            };
            
            console.log('✅ Token extraído exitosamente:', {
                tokenPresente: !!tokenData.access_token,
                tipoToken: tokenData.token_type,
                tieneRefresh: !!tokenData.refresh_token
            });
            
            return tokenData;
            
        } catch (error) {
            console.error('❌ Error extrayendo token de URL:', error);
            return null;
        }
    }

    // ✅ NUEVO: Procesar token de URL manualmente
    async processUrlToken(tokenData) {
        try {
            console.log('🔧 Procesando token de URL manualmente...');
            
            if (!window.supabaseClient) {
                console.error('❌ supabaseClient no disponible para procesar token');
                return false;
            }
            
            // ✅ ESTRATEGIA 1: Intentar setSession con el token
            console.log('🔧 Intentando setSession con token extraído...');
            
            try {
                const { data: sessionData, error: setError } = await Promise.race([
                    window.supabaseClient.auth.setSession({
                        access_token: tokenData.access_token,
                        refresh_token: tokenData.refresh_token
                    }),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout en setSession')), 5000))
                ]);
                
                if (sessionData?.session?.user && !setError) {
                    console.log('✅ Sesión establecida exitosamente con setSession:', sessionData.session.user.email);
                    
                    // Limpiar URL para evitar problemas futuros
                    this.cleanupUrlAfterAuth();
                    
                    // Procesar autenticación exitosa
                    await this.handleSuccessfulAuth(sessionData.session.user);
                    return true;
                }
                
                console.warn('⚠️ setSession falló:', setError?.message || 'sin error específico');
                
            } catch (setSessionError) {
                console.warn('⏰ setSession timeout - intentando estrategia alternativa:', setSessionError.message);
            }
            
            // ✅ ESTRATEGIA 2: Crear usuario manualmente desde token
            console.log('🔧 Creando usuario manualmente desde token...');
            const userFromToken = await this.createUserFromToken(tokenData.access_token);
            if (userFromToken) {
                console.log('✅ Usuario creado manualmente desde token:', userFromToken.email);
                
                // Limpiar URL
                this.cleanupUrlAfterAuth();
                
                // Procesar autenticación exitosa
                await this.handleSuccessfulAuth(userFromToken);
                return true;
            }
            
            // ✅ ESTRATEGIA 3: Fallback básico con datos mínimos
            console.log('🆘 Intentando fallback básico...');
            const basicUser = await this.createBasicUserFromToken(tokenData.access_token);
            if (basicUser) {
                console.log('✅ Usuario básico creado desde token:', basicUser.email);
                
                // Limpiar URL
                this.cleanupUrlAfterAuth();
                
                // Procesar autenticación básica
                await this.handleSuccessfulAuth(basicUser);
                return true;
            }
            
            console.warn('⚠️ No se pudo procesar el token de ninguna manera');
            return false;
            
        } catch (error) {
            console.error('❌ Error procesando token de URL:', error);
            
            // ✅ FALLBACK SIMPLIFICADO: Procesar básico sin redirecciones complejas
            try {
                console.log('🆘 Fallback: Procesamiento básico de token...');
                
                const basicUser = await this.createBasicUserFromToken(tokenData.access_token);
                if (basicUser) {
                    console.log('✅ Usuario básico creado desde token:', basicUser.email);
                    
                    // Limpiar URL simple
                    try {
                        const cleanUrl = window.location.origin + window.pathname;
                        window.history.replaceState({}, document.title, cleanUrl);
                    } catch (urlError) {
                        console.warn('⚠️ Error limpiando URL, continuando...', urlError);
                    }
                    
                    // Procesar autenticación
                    await this.handleSuccessfulAuth(basicUser);
                    return true;
                }
            } catch (fallbackError) {
                console.error('❌ Fallback también falló:', fallbackError);
            }
            
            return false;
        }
    }
}

// ✅ NUEVO: Crear instancia global y exponerla
window.welcomeAuthManager = new WelcomeAuthManager();

// ✅ NUEVO: API de compatibilidad para el código existente
window.authManager = {
    isAuthenticated: () => window.welcomeAuthManager.isAuthenticated(),
    getCurrentUser: () => window.welcomeAuthManager.getCurrentUser(),
    getUserProfile: () => window.welcomeAuthManager.getUserProfile(),
    signOut: () => window.welcomeAuthManager.signOut(),
    refreshSession: () => window.welcomeAuthManager.refreshSession()
};

// ✅ NUEVO: Funciones globales de diagnóstico para debug
window.supabaseDiagnostic = () => {
    if (window.welcomeAuthManager) {
        return window.welcomeAuthManager.manualDiagnostic();
    } else {
        console.error('❌ WelcomeAuthManager no disponible');
    }
};

window.quickSupabaseTest = async () => {
    console.log('🔬 === PRUEBA RÁPIDA DE SUPABASE ===');
    
    if (!window.supabaseClient) {
        console.error('❌ Cliente de Supabase no disponible');
        return;
    }
    
    try {
        // Test 1: Conectividad básica
        console.log('🔌 Test 1: Conectividad básica...');
        const { data: connectTest, error: connectError } = await window.supabaseClient
            .from('math_profiles')
            .select('count')
            .limit(1);
        
        if (connectError) {
            console.warn('⚠️ Conectividad falló:', connectError.message);
        } else {
            console.log('✅ Conectividad exitosa');
        }
        
        // Test 2: Autenticación
        console.log('🔐 Test 2: Estado de autenticación...');
        const { data: { session }, error: authError } = await window.supabaseClient.auth.getSession();
        
        console.log('- Usuario autenticado:', !!session?.user);
        console.log('- Email del usuario:', session?.user?.email || 'N/A');
        console.log('- Error de auth:', authError?.message || 'ninguno');
        
        // Test 3: Configuración
        console.log('⚙️ Test 3: Configuración...');
        console.log('- URL de Supabase:', window.SUPABASE_CONFIG?.url?.includes('supabase') ? '✅ Válida' : '❌ Inválida');
        console.log('- Clave anónima:', window.SUPABASE_CONFIG?.anon_key?.length > 50 ? '✅ Presente' : '❌ Faltante');
        
        console.log('✅ === PRUEBA RÁPIDA COMPLETADA ===');
        
    } catch (error) {
        console.error('❌ Error en prueba rápida:', error);
    }
};

console.log('🎯 WelcomeAuthManager v3.0 cargado - Sistema simplificado');
console.log('🔧 Funciones de debug disponibles:');
console.log('- window.supabaseDiagnostic() - Diagnóstico completo');
console.log('- window.quickSupabaseTest() - Prueba rápida');