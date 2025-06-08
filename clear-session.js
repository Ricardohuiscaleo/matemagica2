/**
 * Script para limpiar completamente la sesión y forzar recreación del perfil
 * Úsalo cuando tengas sesión activa pero el perfil fue borrado de la BD
 */

async function limpiarSesionCompleta() {
    console.log('🧹 === INICIANDO LIMPIEZA COMPLETA DE SESIÓN ===');
    
    try {
        // 1. Limpiar localStorage
        console.log('🗑️ Limpiando localStorage...');
        const itemsToRemove = [
            'matemagica_user',
            'matemagica_profile', 
            'matemagica-user-profile',
            'matemagica_role',
            'matemagica_student_info',
            'currentUser',
            'userProfile',
            'selectedRole'
        ];
        
        itemsToRemove.forEach(item => {
            localStorage.removeItem(item);
            console.log(`  ✅ Removido: ${item}`);
        });
        
        // 2. Limpiar sessionStorage
        console.log('🗑️ Limpiando sessionStorage...');
        sessionStorage.clear();
        
        // 3. Cerrar sesión en Supabase si está disponible
        if (window.supabaseClient) {
            console.log('🚪 Cerrando sesión en Supabase...');
            const { error } = await window.supabaseClient.auth.signOut();
            if (error) {
                console.warn('⚠️ Error cerrando sesión:', error.message);
            } else {
                console.log('✅ Sesión cerrada en Supabase');
            }
        }
        
        // 4. Limpiar cookies relacionadas (si las hay)
        console.log('🍪 Limpiando cookies...');
        document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        // 5. Limpiar estado del auth manager
        if (window.welcomeAuthManager) {
            console.log('🔄 Reiniciando auth manager...');
            window.welcomeAuthManager.currentUser = null;
            window.welcomeAuthManager.userProfile = null;
            window.welcomeAuthManager.selectedRole = null;
            window.welcomeAuthManager.studentInfo = null;
            window.welcomeAuthManager.authProcessingCompleted = false;
            window.welcomeAuthManager.supabaseCheckCompleted = false;
        }
        
        console.log('✅ === LIMPIEZA COMPLETA FINALIZADA ===');
        console.log('🔄 Recargando página en 2 segundos...');
        
        // 6. Recargar página después de un delay
        setTimeout(() => {
            window.location.reload();
        }, 2000);
        
    } catch (error) {
        console.error('❌ Error durante la limpieza:', error);
        // Forzar recarga de emergencia
        alert('Error durante la limpieza. Recargando página...');
        window.location.reload();
    }
}

// Función alternativa para solo recrear el perfil manteniendo la sesión
async function recrearPerfilSolamente() {
    console.log('🔧 === RECREANDO PERFIL SIN CERRAR SESIÓN ===');
    
    try {
        if (!window.welcomeAuthManager || !window.welcomeAuthManager.currentUser) {
            console.error('❌ No hay usuario autenticado para recrear perfil');
            return;
        }
        
        const user = window.welcomeAuthManager.currentUser;
        console.log('👤 Usuario actual:', user.email);
        
        // Limpiar solo datos de perfil
        localStorage.removeItem('matemagica_profile');
        localStorage.removeItem('matemagica-user-profile');
        window.welcomeAuthManager.userProfile = null;
        
        // Forzar recreación del perfil
        console.log('🔄 Forzando recreación del perfil...');
        await window.welcomeAuthManager.createOrUpdateUserProfile(user);
        
        console.log('✅ Perfil recreado exitosamente');
        
    } catch (error) {
        console.error('❌ Error recreando perfil:', error);
    }
}

// Función para verificar estado actual
function verificarEstadoActual() {
    console.log('🔍 === VERIFICANDO ESTADO ACTUAL ===');
    
    const estadoLocal = {
        matemagica_user: !!localStorage.getItem('matemagica_user'),
        matemagica_profile: !!localStorage.getItem('matemagica_profile'),
        matemagica_role: localStorage.getItem('matemagica_role'),
        currentUser: !!localStorage.getItem('currentUser')
    };
    
    console.log('📱 Estado localStorage:', estadoLocal);
    
    if (window.welcomeAuthManager) {
        const estadoAuth = {
            isInitialized: window.welcomeAuthManager.isInitialized,
            currentUser: !!window.welcomeAuthManager.currentUser,
            userProfile: !!window.welcomeAuthManager.userProfile,
            selectedRole: window.welcomeAuthManager.selectedRole,
            isAuthenticated: window.welcomeAuthManager.isAuthenticated()
        };
        console.log('🔐 Estado AuthManager:', estadoAuth);
    }
    
    if (window.supabaseClient) {
        window.supabaseClient.auth.getUser().then(({ data: { user } }) => {
            console.log('☁️ Usuario en Supabase:', user ? user.email : 'No autenticado');
        });
    }
}

console.log('🛠️ Scripts de limpieza cargados. Usa:');
console.log('• limpiarSesionCompleta() - Para limpiar todo y empezar de nuevo');
console.log('• recrearPerfilSolamente() - Para recrear solo el perfil');
console.log('• verificarEstadoActual() - Para ver el estado actual');