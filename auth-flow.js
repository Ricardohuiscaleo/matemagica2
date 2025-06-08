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

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM cargado - Inicializando auth-flow');
    
    // ✅ VERIFICAR nuevamente si el auth-manager ya tomó control
    if (window.welcomeAuthManager && window.welcomeAuthManager.isInitialized) {
        console.log('⏭️ WelcomeAuthManager ya inicializado - saltando auth-flow');
        return;
    }
    
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
        
        // Verificar si ya hay una sesión activa
        checkExistingSession();
        
        console.log('✅ Auth flow inicializado correctamente');
        
    } catch (error) {
        console.error('❌ Error al inicializar auth flow:', error);
    }
}

function selectRole(role) {
    console.log(`👤 Rol seleccionado en auth-flow: ${role}`);
    selectedUserRole = role;
    
    // Actualizar UI según el rol
    const roleText = document.getElementById('user-role-text');
    const roleDescription = document.getElementById('role-description');
    
    if (roleText && roleDescription) {
        if (role === 'teacher') {
            roleText.textContent = 'profesor/a';
            roleDescription.innerHTML = `
                Como <span class="font-bold text-blue-600">profesor/a</span>, podrás gestionar múltiples estudiantes 
                y crear ejercicios personalizados para cada uno de ellos.
            `;
        } else {
            roleText.textContent = 'apoderado/a';
            roleDescription.innerHTML = `
                Como <span class="font-bold text-pink-600">apoderado/a</span>, podrás generar ejercicios 
                personalizados para tu hijo/a y seguir su progreso.
            `;
        }
    }
    
    showAuthScreen();
}

function showWelcomeScreen() {
    console.log('🏠 Mostrando pantalla de bienvenida (auth-flow)');
    if (welcomeScreen) welcomeScreen.classList.remove('hidden');
    if (authScreen) authScreen.classList.add('hidden');
    if (studentFormScreen) studentFormScreen.classList.add('hidden');
    selectedUserRole = null;
}

function showAuthScreen() {
    console.log('🔐 Mostrando pantalla de autenticación (auth-flow)');
    if (welcomeScreen) welcomeScreen.classList.add('hidden');
    if (authScreen) authScreen.classList.remove('hidden');
    if (studentFormScreen) studentFormScreen.classList.add('hidden');
}

function showStudentFormScreen() {
    console.log('👨‍👩‍👧‍👦 Mostrando formulario de estudiante (auth-flow)');
    if (welcomeScreen) welcomeScreen.classList.add('hidden');
    if (authScreen) authScreen.classList.add('hidden');
    if (studentFormScreen) studentFormScreen.classList.remove('hidden');
}

function showLoading(message = 'Cargando...') {
    const loadingText = document.getElementById('loading-text');
    if (loadingText) loadingText.textContent = message;
    if (loadingOverlay) loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    if (loadingOverlay) loadingOverlay.classList.add('hidden');
}

async function handleGoogleAuth() {
    if (!selectedUserRole) {
        alert('⚠️ Por favor selecciona tu rol primero');
        return;
    }
    
    console.log('🔐 Iniciando autenticación con Google (auth-flow)...');
    showLoading('Iniciando sesión con Google...');
    
    try {
        // ✅ MEJORADO: Intentar usar el sistema principal si está disponible
        if (window.welcomeAuthManager && window.welcomeAuthManager.handleGoogleAuth) {
            console.log('🔄 Delegando autenticación al sistema principal...');
            await window.welcomeAuthManager.handleGoogleAuth();
            return;
        }
        
        // Fallback: Sistema básico de autenticación simulado
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Usuario simulado
        const simulatedUser = {
            id: 'user_' + Date.now(),
            email: 'usuario@ejemplo.com',
            name: 'Usuario Demo',
            role: selectedUserRole,
            avatar: '/icons/icon-72.png'
        };
        
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

function redirectToTeacherDashboard() {
    console.log('👩‍🏫 Redirigiendo a dashboard del profesor...');
    showLoading('Preparando dashboard del profesor...');
    
    setTimeout(() => {
        window.location.href = '/profesor.html';
    }, 1000);
}

function redirectToParentFlow() {
    console.log('👨‍👩‍👧‍👦 Redirigiendo a formulario de estudiante...');
    hideLoading();
    showStudentFormScreen();
}

async function handleStudentForm(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    
    // ✅ CORREGIDO: Obtener usuario actual del sistema principal
    const currentUser = window.welcomeAuthManager?.getCurrentUser() || 
                       JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    const studentData = {
        name: formData.get('student-name'),
        age: formData.get('student-age'),
        grade: formData.get('student-grade'),
        level: formData.get('student-level'),
        parentId: currentUser.id || 'temp_' + Date.now()
    };
    
    console.log('📝 Guardando datos del estudiante:', studentData);
    showLoading('Configurando perfil del estudiante...');
    
    try {
        // Simular guardado (aquí integrarías con Supabase)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Guardar datos del estudiante
        localStorage.setItem('studentData', JSON.stringify(studentData));
        
        console.log('✅ Estudiante configurado exitosamente');
        
        // Redirigir al dashboard del apoderado
        redirectToParentDashboard();
        
    } catch (error) {
        console.error('❌ Error al guardar estudiante:', error);
        alert('Error al configurar el perfil. Por favor intenta nuevamente.');
        hideLoading();
    }
}

function redirectToParentDashboard() {
    console.log('👨‍👩‍👧‍👦 Redirigiendo a dashboard del apoderado...');
    showLoading('Preparando dashboard familiar...');
    
    setTimeout(() => {
        window.location.href = '/apoderado.html';
    }, 1000);
}

function checkExistingSession() {
    // ✅ MEJORADO: Verificar primero el sistema principal
    if (window.welcomeAuthManager && window.welcomeAuthManager.isAuthenticated()) {
        console.log('✅ Sesión activa encontrada en sistema principal');
        return;
    }
    
    // Fallback: Verificar localStorage
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userData = localStorage.getItem('currentUser');
    
    if (isAuthenticated === 'true' && userData) {
        try {
            const user = JSON.parse(userData);
            console.log('🔄 Sesión existente encontrada en localStorage:', user);
            
            // Redirigir según el rol
            if (user.role === 'teacher') {
                window.location.href = '/profesor.html';
            } else {
                window.location.href = '/apoderado.html';
            }
        } catch (error) {
            console.warn('⚠️ Error al parsear datos de usuario, limpiando sesión');
            clearSession();
        }
    }
}

function clearSession() {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('studentData');
    selectedUserRole = null;
    
    // ✅ NUEVO: También limpiar del sistema principal si existe
    if (window.welcomeAuthManager && window.welcomeAuthManager.signOut) {
        window.welcomeAuthManager.signOut();
    }
}

// Función global para cerrar sesión (usada por otras páginas)
window.logout = function() {
    console.log('🚪 Cerrando sesión...');
    clearSession();
    window.location.href = '/index.html';
};

// Sistema de notificaciones para el modo híbrido
function mostrarNotificacion(mensaje, tipo = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification ${tipo}`;
    notification.textContent = mensaje;
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Exportar funciones para uso en otras páginas
window.authFlow = {
    getCurrentUser: () => window.welcomeAuthManager?.getCurrentUser() || JSON.parse(localStorage.getItem('currentUser') || 'null'),
    getSelectedRole: () => selectedUserRole,
    logout: window.logout,
    checkSession: checkExistingSession
};