// dashboard-auth.js
// Script simple para proteger las páginas de dashboard.
(function() {
    console.log("🛡️ Ejecutando guardián de dashboard...");

    const userProfileString = localStorage.getItem('matemagica-user-profile');

    if (!userProfileString) {
        console.warn("⚠️ No hay perfil de usuario. Redirigiendo a login...");
        window.location.assign('index.html');
        return; // Detiene la ejecución
    }

    try {
        const userProfile = JSON.parse(userProfileString);
        console.log(`✅ Usuario autenticado como ${userProfile.user_role}. Mostrando dashboard.`);
        
        // Opcional: Rellenar datos del usuario en la página
        document.addEventListener('DOMContentLoaded', () => {
            const userNameElement = document.getElementById('user-name');
            if (userNameElement) {
                userNameElement.textContent = userProfile.full_name || 'Usuario';
            }
        });

    } catch (error) {
        console.error("❌ Error parseando perfil. Redirigiendo a login...", error);
        window.location.assign('index.html');
    }
})();
