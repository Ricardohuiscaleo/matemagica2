// auth-flow.js - Manejo del flujo de autenticación y navegación
console.log('🔄 Inicializando flujo de autenticación...');

// Variables globales - CORREGIDO: Evitar conflictos de variables
let selectedUserRole = null;
// ELIMINADO: currentUser duplicado - usar el del auth-manager

// Elementos DOM - se inicializarán cuando el DOM esté listo
let welcomeScreen, authScreen, studentFormScreen, loadingOverlay;

// ✅ VERIFICAR si ya hay un sistema de autenticación principal
if (window.welcomeAuthManager) {
    console.log('⚠️ Sistema de autenticación principal detectado - auth-flow en modo compatibilidad');
} else {
    console.log('🔧 Inicializando auth-flow como sistema principal');
}

// ✅ ANTI-BUCLE: Flag para controlar redirecciones automáticas
let isRedirectInProgress = false;
let offlineModeDetected = false;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM cargado - Inicializando auth-flow');
    
    // ✅ VERIFICAR nuevamente si el auth-manager ya tomó control
    if (window.welcomeAuthManager && window.welcomeAuthManager.isInitialized) {
        console.log('⏭️ WelcomeAuthManager ya inicializado - saltando auth-flow');
        return;
    }
    
    // ✅ VERIFICAR disponibilidad de Supabase
    checkSupabaseAvailability();
    
    // Inicializar elementos DOM
    welcomeScreen = document.getElementById('welcome-screen');
    authScreen = document.getElementById('auth-screen');
    studentFormScreen = document.getElementById('student-form-screen');
    loadingOverlay = document.getElementById('loading-overlay');
    
    // Verificar que todos los elementos existen
    if (!welcomeScreen || !authScreen || !studentFormScreen || !loadingOverlay) {
        console.warn('⚠️ Algunos elementos DOM no encontrados en auth-flow');
        console.log('📱 Elementos encontrados:');
        console.log('- welcome-screen:', !!welcomeScreen);
        console.log('- auth-screen:', !!authScreen);
        console.log('- student-form-screen:', !!studentFormScreen);
        console.log('- loading-overlay:', !!loadingOverlay);
        
        // ✅ NUEVO: Continuar con los elementos disponibles
        if (welcomeScreen) {
            initializeAuthFlow();
        }
        return;
    }
    
    initializeAuthFlow();
});

// ✅ NUEVO: Verificar disponibilidad de Supabase
function checkSupabaseAvailability() {
    // Verificar si Supabase está disponible
    const isSupabaseAvailable = !!(window.supabaseClient && window.supabaseClient.auth);
    
    if (!isSupabaseAvailable) {
        console.warn('⚠️ Librería de Supabase no disponible - Modo offline activado');
        offlineModeDetected = true;
        
        // Actualizar UI para modo offline si existe tal elemento
        const offlineIndicator = document.getElementById('offline-indicator');
        if (offlineIndicator) {
            offlineIndicator.style.display = 'block';
        }
        
        // Agregar clase a body para estilos específicos de modo offline
        document.body.classList.add('offline-mode');
    } else {
        console.log('✅ Supabase disponible - Modo normal');
        offlineModeDetected = false;
    }
    
    return isSupabaseAvailable;
}

function initializeAuthFlow() {
    try {
        // ✅ VERIFICAR nuevamente antes de configurar eventos
        if (window.welcomeAuthManager && window.welcomeAuthManager.isInitialized) {
            console.log('⏭️ WelcomeAuthManager ya configurado - evitando duplicación de eventos');
            return;
        }
        
        // Event listeners para selección de rol
        const teacherBtn = document.getElementById('teacher-role-btn');
        const parentBtn = document.getElementById('parent-role-btn');
        
        if (teacherBtn && parentBtn) {
            teacherBtn.addEventListener('click', () => selectRole('teacher'));
            parentBtn.addEventListener('click', () => selectRole('parent'));
        } else {
            console.warn('⚠️ No se encontraron los botones de rol en auth-flow');
        }
        
        // Event listeners para navegación
        const backToWelcomeBtn = document.getElementById('back-to-welcome-btn');
        const backToAuthBtn = document.getElementById('back-to-auth');
        
        if (backToWelcomeBtn) {
            backToWelcomeBtn.addEventListener('click', showWelcomeScreen);
        }
        if (backToAuthBtn) {
            backToAuthBtn.addEventListener('click', showAuthScreen);
        }
        
        // Event listener para autenticación Google
        const googleAuthBtn = document.getElementById('google-auth-btn');
        if (googleAuthBtn) {
            googleAuthBtn.addEventListener('click', handleGoogleAuth);
        }
        
        // Event listener para formulario de estudiante
        const studentForm = document.getElementById('student-form');
        if (studentForm) {
            studentForm.addEventListener('submit', handleStudentForm);
        }
        
        // ✅ CORREGIDO: SOLO verificar sesión si no estamos en modo offline
        if (!offlineModeDetected) {
            // Verificar sesión existente de forma segura
            safelyCheckExistingSession();
        } else {
            // En modo offline, simplemente mostrar la pantalla de bienvenida
            showWelcomeScreen();
        }
        
        console.log('✅ Auth flow inicializado correctamente');
        
    } catch (error) {
        console.error('❌ Error al inicializar auth flow:', error);
    }
}

// ✅ NUEVO: Verificar sesión de forma segura (anti-bucle)
function safelyCheckExistingSession() {
    // Anti-bucle: no verificar si hay redirección en progreso
    if (isRedirectInProgress) {
        console.log('⚠️ Redirección en progreso, saltando verificación de sesión');
        return;
    }
    
    console.log('🔍 Verificando sesión existente (auth-flow)');
    
    // ✅ Preferir sistema principal si está disponible
    if (window.welcomeAuthManager) {
        console.log('🔄 Delegando verificación a WelcomeAuthManager');
        // No hacer nada, el welcomeAuthManager se encargará
        return;
    }
    
    // Comprobar si hay una sesión existente en localStorage únicamente
    // NO REDIRIGIR AUTOMÁTICAMENTE para evitar bucles
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userData = localStorage.getItem('currentUser');
    
    if (isAuthenticated === 'true' && userData) {
        try {
            const user = JSON.parse(userData);
            console.log('🔍 Sesión encontrada en localStorage:', user.email);
            
            // ✅ NO REDIRIGIR AUTOMÁTICAMENTE
            // Solo actualizar UI para reflejar usuario conectado
            updateUIForLoggedInUser(user);
            
        } catch (error) {
            console.warn('⚠️ Error al parsear datos de usuario, limpiando sesión');
            clearSession();
            showWelcomeScreen();
        }
    } else {
        console.log('🔍 No se encontró sesión en localStorage');
        showWelcomeScreen();
    }
}

// ✅ NUEVO: Actualizar UI para usuario conectado sin redirección
function updateUIForLoggedInUser(user) {
    // Actualizar elementos que muestran info del usuario
    const userNameElements = document.querySelectorAll('[data-user-name]');
    userNameElements.forEach(el => {
        if (el) el.textContent = user.name || user.email;
    });
    
    // Mostrar elementos para usuario autenticado
    document.body.classList.add('authenticated');
    
    console.log('✅ UI actualizada para usuario conectado');
}

// Funciones principales existentes
function selectRole(role) {
    // Preferir usar el sistema principal si está disponible
    if (window.welcomeAuthManager && window.welcomeAuthManager.isInitialized) {
        console.log('🔄 Delegando selección de rol a WelcomeAuthManager');
        window.welcomeAuthManager.selectRole(role);
        return;
    }
    
    console.log('👤 Rol seleccionado en auth-flow:', role);
    selectedUserRole = role;
    
    if (role === 'student') {
        showStudentFormScreen();
    } else {
        showAuthScreen();
    }
}

function showWelcomeScreen() {
    // Preferir usar el sistema principal si está disponible
    if (window.welcomeAuthManager && window.welcomeAuthManager.isInitialized) {
        console.log('🔄 Delegando showWelcomeScreen a WelcomeAuthManager');
        window.welcomeAuthManager.showWelcomeScreen();
        return;
    }
    
    console.log('👋 Mostrando pantalla de bienvenida (auth-flow)');
    
    if (welcomeScreen && authScreen && studentFormScreen) {
        welcomeScreen.style.display = 'flex';
        authScreen.style.display = 'none';
        studentFormScreen.style.display = 'none';
    } else {
        console.warn('⚠️ Elementos no encontrados para showWelcomeScreen');
    }
}

function showAuthScreen() {
    // Preferir usar el sistema principal si está disponible
    if (window.welcomeAuthManager && window.welcomeAuthManager.isInitialized) {
        console.log('🔄 Delegando showAuthScreen a WelcomeAuthManager');
        window.welcomeAuthManager.showAuthScreen();
        return;
    }
    
    console.log('🔐 Mostrando pantalla de autenticación (auth-flow)');
    
    if (welcomeScreen && authScreen && studentFormScreen) {
        welcomeScreen.style.display = 'none';
        authScreen.style.display = 'flex';
        studentFormScreen.style.display = 'none';
        
        // Actualizar descripción del rol
        const roleDescription = document.getElementById('user-role-text');
        if (roleDescription) {
            roleDescription.textContent = selectedUserRole === 'teacher' ? 'profesor/a' : 'apoderado/a';
        }
    } else {
        console.warn('⚠️ Elementos no encontrados para showAuthScreen');
    }
}

function showStudentFormScreen() {
    // Preferir usar el sistema principal si está disponible
    if (window.welcomeAuthManager && window.welcomeAuthManager.isInitialized) {
        console.log('🔄 Delegando showStudentForm a WelcomeAuthManager');
        window.welcomeAuthManager.showStudentForm();
        return;
    }
    
    console.log('📝 Mostrando formulario de estudiante (auth-flow)');
    
    if (welcomeScreen && authScreen && studentFormScreen) {
        welcomeScreen.style.display = 'none';
        authScreen.style.display = 'none';
        studentFormScreen.style.display = 'flex';
    } else {
        console.warn('⚠️ Elementos no encontrados para showStudentFormScreen');
    }
}

function showLoading(message = 'Cargando...') {
    if (loadingOverlay) {
        const loadingText = document.getElementById('loading-text');
        if (loadingText) {
            loadingText.textContent = message;
        }
        loadingOverlay.classList.remove('hidden');
        loadingOverlay.style.display = 'flex';
    }
}

function hideLoading() {
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
        loadingOverlay.style.display = 'none';
    }
}

async function handleGoogleAuth() {
    // Preferir usar el sistema principal si está disponible
    if (window.welcomeAuthManager && window.welcomeAuthManager.isInitialized) {
        console.log('🔄 Delegando autenticación Google a WelcomeAuthManager');
        return window.welcomeAuthManager.handleGoogleAuth();
    }
    
    try {
        console.log('🔐 Iniciando autenticación con Google (auth-flow)');
        showLoading('Conectando con Google...');
        
        // Autenticación simulada para modo fallback
        // En una implementación real, aquí se usaría una API de autenticación
        const simulatedUser = {
            id: `user_${Date.now()}`,
            name: 'Usuario de Prueba',
            email: 'usuario.prueba@ejemplo.com',
            avatar: 'https://ui-avatars.com/api/?name=Usuario+Prueba&background=random',
            role: selectedUserRole
        };
        
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simular tiempo de red
        
        // Guardar en localStorage
        localStorage.setItem('currentUser', JSON.stringify(simulatedUser));
        localStorage.setItem('isAuthenticated', 'true');
        
        console.log('✅ Autenticación exitosa (auth-flow):', simulatedUser);
        
        // Redirigir según el rol
        if (selectedUserRole === 'teacher') {
            redirectToTeacherDashboard();
        } else {
            redirectToParentFlow();
        }
        
    } catch (error) {
        console.error('❌ Error en autenticación (auth-flow):', error);
        alert('Error al iniciar sesión. Por favor intenta nuevamente.');
    } finally {
        hideLoading();
    }
}

// Manejar el envío del formulario de estudiante
async function handleStudentForm(event) {
    event.preventDefault();
    
    // Preferir usar el sistema principal si está disponible
    if (window.welcomeAuthManager && window.welcomeAuthManager.isInitialized) {
        console.log('🔄 Delegando manejo de formulario a WelcomeAuthManager');
        window.welcomeAuthManager.handleStudentFormSubmit(event);
        return;
    }
    
    try {
        const studentNameInput = document.getElementById('student-name');
        const studentGradeSelect = document.getElementById('student-grade');
        
        const name = studentNameInput?.value?.trim();
        const grade = studentGradeSelect?.value;
        
        if (!name || !grade) {
            alert('Por favor, completa todos los campos');
            return;
        }
        
        console.log('👶 Datos del estudiante:', { name, grade });
        showLoading('Procesando información...');
        
        // Guardar datos del estudiante
        const studentData = { name, grade };
        localStorage.setItem('studentData', JSON.stringify(studentData));
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simular procesamiento
        
        redirectToParentDashboard();
        
    } catch (error) {
        console.error('❌ Error procesando formulario:', error);
        alert('Error al procesar el formulario. Inténtalo nuevamente.');
    } finally {
        hideLoading();
    }
}
