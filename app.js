// Variables globales
let ejerciciosGenerados = [];
let configuracionActual = {};
// isOfflineMode se obtiene de config.js - no redeclarar aquí

// ✅ NUEVO: Flag para controlar la inicialización
let isAppInitialized = false;

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando Matemágica PWA...');
    
    // ✅ NUEVO: Esperar a que el sistema de autenticación esté listo
    if (window.welcomeAuthManager && window.welcomeAuthManager.isAuthenticated()) {
        initializeApp();
    } else {
        // Escuchar evento de autenticación exitosa
        window.addEventListener('userAuthenticated', initializeApp);
        console.log('⏳ Esperando autenticación del usuario...');
    }
});

// ✅ NUEVO: Función de inicialización separada
function initializeApp() {
    if (isAppInitialized) {
        console.log('ℹ️ App ya inicializada, saltando...');
        return;
    }
    
    console.log('🎯 Inicializando aplicación principal...');
    
    // Verificar disponibilidad de APIs (sin Supabase si no autenticado)
    verificarAPIs();
    
    // Configurar eventos
    configurarEventos();
    
    // Cargar datos del usuario
    cargarDatosUsuario();
    
    // Configurar modo híbrido
    if (window.MathModeSystem) {
        window.MathModeSystem.updateModeDisplay();
    }
    
    isAppInitialized = true;
    console.log('✅ Matemágica PWA inicializada correctamente');
}

function verificarAPIs() {
    // Verificar Gemini AI
    const geminiDisponible = window.isGeminiConfigured && window.isGeminiConfigured();
    console.log('🤖 Gemini AI disponible:', geminiDisponible);
    
    // ✅ CORREGIDO: Verificar Supabase de manera más directa y robusta
    let supabaseDisponible = false;
    if (window.welcomeAuthManager && window.welcomeAuthManager.isAuthenticated()) {
        // Verificar si tenemos un cliente de Supabase funcional
        supabaseDisponible = !!(window.supabaseClient && window.authService);
        console.log('☁️ Supabase disponible:', supabaseDisponible);
        
        // Información adicional para debugging
        if (supabaseDisponible) {
            console.log('✅ Supabase cliente y servicios disponibles');
        } else {
            console.log('⚠️ Usuario autenticado pero Supabase no disponible');
            console.log('- supabaseClient:', !!window.supabaseClient);
            console.log('- authService:', !!window.authService);
        }
    } else {
        console.log('☁️ Supabase: Usuario no autenticado, modo offline');
    }
    
    // Mostrar estado en UI
    mostrarEstadoAPIs(geminiDisponible, supabaseDisponible);
}

function mostrarEstadoAPIs(gemini, supabase) {
    // ✅ MEJORADO: Indicadores visuales más informativos
    const statusContainer = document.getElementById('api-status');
    if (statusContainer) {
        let statusHTML = '<div class="flex gap-2 text-sm">';
        
        if (gemini) {
            statusHTML += '<span class="bg-green-100 text-green-800 px-2 py-1 rounded">🤖 IA Activa</span>';
        } else {
            statusHTML += '<span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">🤖 IA Offline</span>';
        }
        
        if (supabase) {
            statusHTML += '<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded">☁️ Cloud Activo</span>';
        } else {
            statusHTML += '<span class="bg-gray-100 text-gray-800 px-2 py-1 rounded">☁️ Modo Local</span>';
        }
        
        statusHTML += '</div>';
        statusContainer.innerHTML = statusHTML;
    }
    
    if (!gemini && !supabase) {
        console.warn('⚠️ Funcionando en modo completamente offline');
    }
}

function configurarEventos() {
    // Eventos para generación de ejercicios
    const btnGenerarIA = document.getElementById('btn-generar-ia');
    const btnGenerarOffline = document.getElementById('btn-generar-offline');
    
    if (btnGenerarIA) {
        btnGenerarIA.addEventListener('click', () => generarEjercicios('ia'));
    }
    
    if (btnGenerarOffline) {
        btnGenerarOffline.addEventListener('click', () => generarEjercicios('offline'));
    }
    
    // Eventos para resultados
    const btnDescargarPDF = document.getElementById('btn-descargar-pdf');
    const btnGenerarCuento = document.getElementById('btn-generar-cuento');
    
    if (btnDescargarPDF) {
        btnDescargarPDF.addEventListener('click', descargarPDF);
    }
    
    if (btnGenerarCuento) {
        btnGenerarCuento.addEventListener('click', generarCuentoMatematico);
    }
    
    // Cerrar sesión
    const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', cerrarSesion);
    }
}

// ✅ NUEVO: Configurar botón de cerrar sesión
function configurarCerrarSesion() {
    const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', async () => {
            console.log('👋 Iniciando cierre de sesión...');
            
            // Mostrar confirmación
            const confirmar = confirm('¿Estás seguro de que quieres cerrar sesión?');
            if (!confirmar) return;
            
            try {
                // Usar el manager de autenticación para cerrar sesión
                if (window.welcomeAuthManager) {
                    await window.welcomeAuthManager.signOut();
                } else if (window.authManager) {
                    await window.authManager.signOut();
                }
                
                console.log('✅ Sesión cerrada exitosamente');
                
            } catch (error) {
                console.error('❌ Error cerrando sesión:', error);
                // Fallback: recargar la página
                window.location.reload();
            }
        });
        
        console.log('🔗 Botón de cerrar sesión configurado');
    }
}

function cargarDatosUsuario() {
    // ✅ CORREGIDO: Usar el nuevo sistema de autenticación
    let user = null;
    
    if (window.welcomeAuthManager && window.welcomeAuthManager.isAuthenticated()) {
        user = window.welcomeAuthManager.getCurrentUser();
    } else {
        // Fallback a localStorage para compatibilidad
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            try {
                user = JSON.parse(userData);
            } catch (error) {
                console.error('❌ Error al cargar datos del usuario desde localStorage:', error);
            }
        }
    }
    
    if (user) {
        console.log('👤 Usuario cargado:', user.name || user.email);
        actualizarUIUsuario(user);
    } else {
        console.log('👤 No hay usuario autenticado');
    }
}

function actualizarUIUsuario(user) {
    // ✅ MEJORADO: Actualización más robusta de la UI
    const nombreUsuario = user.name || user.email || 'Usuario';
    
    // Actualizar nombre del usuario en elementos específicos del dashboard
    const elementosNombre = document.querySelectorAll('[data-user-name], #nombre-usuario, #user-name');
    elementosNombre.forEach(el => {
        if (el && el.textContent !== nombreUsuario) {
            el.textContent = nombreUsuario;
        }
    });
    
    // Actualizar avatar si existe
    const elementosAvatar = document.querySelectorAll('[data-user-avatar], #avatar-usuario, #user-avatar');
    elementosAvatar.forEach(el => {
        if (el && user.avatar) {
            el.src = user.avatar;
            el.alt = `Avatar de ${nombreUsuario}`;
        }
    });
    
    // Actualizar email si está disponible
    const elementosEmail = document.querySelectorAll('[data-user-email], #email-usuario');
    elementosEmail.forEach(el => {
        if (el && user.email) {
            el.textContent = user.email;
        }
    });
}

async function generarEjercicios(metodo = 'offline') {
    const nivel = document.getElementById('nivelSelect')?.value || '1';
    const cantidad = document.getElementById('cantidadSelect')?.value || '10';
    const tipo = document.getElementById('tipoSelect')?.value || 'mixto';
    
    configuracionActual = { nivel, cantidad, tipo, metodo };
    
    console.log('🎯 Generando ejercicios:', configuracionActual);
    
    mostrarCarga(`Generando ${cantidad} ejercicios de nivel ${nivel}...`);
    
    try {
        let ejercicios = [];
        
        // ✅ CORREGIDO: Verificar disponibilidad de IA de forma más robusta
        const puedeUsarIA = metodo === 'ia' && 
                           window.isGeminiConfigured && 
                           window.isGeminiConfigured() && 
                           !window.MathModeSystem?.isOfflineMode();
        
        if (puedeUsarIA) {
            console.log('🤖 Intentando generar con IA...');
            try {
                ejercicios = await generarConIA(configuracionActual);
            } catch (error) {
                console.warn('⚠️ Error con IA, fallback a offline:', error.message);
                ejercicios = generarOffline(configuracionActual);
            }
        } else {
            // Usar generador offline
            ejercicios = generarOffline(configuracionActual);
        }
        
        if (ejercicios && ejercicios.length > 0) {
            ejerciciosGenerados = ejercicios;
            mostrarEjercicios(ejercicios);
            
            // ✅ CORREGIDO: Guardar solo si el usuario está autenticado
            if (window.MathModeSystem && window.welcomeAuthManager?.isAuthenticated()) {
                try {
                    await window.MathModeSystem.saveDataHybrid(
                        'ultimo-ejercicio-generado',
                        { ejercicios, configuracion: configuracionActual, fecha: new Date().toISOString() }
                    );
                } catch (error) {
                    console.warn('⚠️ No se pudo guardar en cloud, solo local:', error.message);
                    // Guardar solo en localStorage como fallback
                    localStorage.setItem('ultimo-ejercicio-generado', JSON.stringify({
                        ejercicios, configuracion: configuracionActual, fecha: new Date().toISOString()
                    }));
                }
            }
            
            if (window.mostrarNotificacion) {
                window.mostrarNotificacion(`✅ ${ejercicios.length} ejercicios generados correctamente`, 'success');
            }
        } else {
            throw new Error('No se pudieron generar ejercicios');
        }
        
    } catch (error) {
        console.error('❌ Error generando ejercicios:', error);
        
        if (window.mostrarNotificacion) {
            window.mostrarNotificacion('❌ Error al generar ejercicios. Intentando modo offline...', 'warning');
        }
        
        // Fallback a offline
        if (metodo === 'ia') {
            return generarEjercicios('offline');
        } else {
            alert('Error al generar ejercicios. Por favor intenta nuevamente.');
        }
    } finally {
        ocultarCarga();
    }
}

async function generarConIA(config) {
    if (!window.generarEjerciciosConGemini) {
        throw new Error('Generador de IA no disponible');
    }
    
    console.log('🤖 Generando con Gemini AI...');
    return await window.generarEjerciciosConGemini(
        parseInt(config.nivel),
        parseInt(config.cantidad),
        config.tipo
    );
}

function generarOffline(config) {
    console.log('📚 Generando con plantillas offline...');
    
    const ejercicios = [];
    const cantidad = parseInt(config.cantidad);
    const nivel = parseInt(config.nivel);
    const tipo = config.tipo;
    
    for (let i = 0; i < cantidad; i++) {
        let ejercicio;
        
        if (tipo === 'mixto') {
            ejercicio = Math.random() > 0.5 ? generarSuma(nivel) : generarResta(nivel);
        } else if (tipo === 'suma') {
            ejercicio = generarSuma(nivel);
        } else {
            ejercicio = generarResta(nivel);
        }
        
        ejercicios.push({
            numero: i + 1,
            operacion: ejercicio.operacion,
            resultado: ejercicio.resultado,
            tipo: ejercicio.tipo,
            nivel: nivel
        });
    }
    
    return ejercicios;
}

function generarSuma(nivel) {
    let num1, num2;
    
    switch (nivel) {
        case 1: // Fácil - sin reserva
            num1 = Math.floor(Math.random() * 45) + 10; // 10-54
            num2 = Math.floor(Math.random() * (99 - num1 - 10)) + 10; // Asegurar que no pase de 99
            break;
        case 2: // Medio - con reserva
            num1 = Math.floor(Math.random() * 45) + 15; // 15-59
            num2 = Math.floor(Math.random() * 40) + 15; // 15-54, puede dar reserva
            break;
        case 3: // Difícil - mixto
            num1 = Math.floor(Math.random() * 60) + 10; // 10-69
            num2 = Math.floor(Math.random() * 50) + 10; // 10-59
            break;
        default:
            num1 = Math.floor(Math.random() * 40) + 10;
            num2 = Math.floor(Math.random() * 40) + 10;
    }
    
    return {
        operacion: `${num1} + ${num2} = ____`,
        resultado: num1 + num2,
        tipo: 'suma'
    };
}

function generarResta(nivel) {
    let num1, num2;
    
    switch (nivel) {
        case 1: // Fácil - sin prestado
            num1 = Math.floor(Math.random() * 40) + 50; // 50-89
            num2 = Math.floor(Math.random() * 30) + 10; // 10-39
            // Asegurar que no hay prestado
            if (num1 % 10 < num2 % 10) {
                num2 = num1 % 10 + Math.floor(num2 / 10) * 10;
            }
            break;
        case 2: // Medio - con prestado
            num1 = Math.floor(Math.random() * 50) + 30; // 30-79
            num2 = Math.floor(Math.random() * 40) + 15; // 15-54
            break;
        case 3: // Difícil - mixto
            num1 = Math.floor(Math.random() * 60) + 25; // 25-84
            num2 = Math.floor(Math.random() * (num1 - 5)) + 5; // 5 hasta num1-5
            break;
        default:
            num1 = Math.floor(Math.random() * 50) + 30;
            num2 = Math.floor(Math.random() * 25) + 5;
    }
    
    return {
        operacion: `${num1} - ${num2} = ____`,
        resultado: num1 - num2,
        tipo: 'resta'
    };
}

function mostrarEjercicios(ejercicios) {
    const container = document.getElementById('ejercicios-container');
    const seccionResultados = document.getElementById('seccion-resultados');
    
    if (!container || !seccionResultados) {
        console.warn('⚠️ Contenedores de ejercicios no encontrados');
        return;
    }
    
    container.innerHTML = '';
    
    ejercicios.forEach((ejercicio, index) => {
        const card = document.createElement('div');
        card.className = 'ejercicio-card';
        card.innerHTML = `
            <div class="ejercicio-numero">Ejercicio ${ejercicio.numero || index + 1}</div>
            <div class="ejercicio-operacion">${ejercicio.operacion}</div>
            <div class="text-sm text-gray-600 mt-2">
                Nivel: ${getNivelTexto(ejercicio.nivel)} | Tipo: ${ejercicio.tipo}
            </div>
        `;
        container.appendChild(card);
    });
    
    seccionResultados.classList.remove('hidden');
    
    // Scroll suave a los resultados
    seccionResultados.scrollIntoView({ behavior: 'smooth' });
}

function getNivelTexto(nivel) {
    switch (parseInt(nivel)) {
        case 1: return '🟢 Fácil';
        case 2: return '🟡 Medio';
        case 3: return '🔴 Difícil';
        default: return 'Desconocido';
    }
}

function mostrarCarga(mensaje = 'Cargando...') {
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');
    
    if (loadingText) loadingText.textContent = mensaje;
    if (loadingOverlay) loadingOverlay.classList.remove('hidden');
}

function ocultarCarga() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) loadingOverlay.classList.add('hidden');
}

async function descargarPDF() {
    if (!ejerciciosGenerados || ejerciciosGenerados.length === 0) {
        alert('No hay ejercicios para descargar');
        return;
    }
    
    console.log('📄 Generando PDF...');
    mostrarCarga('Preparando PDF para descarga...');
    
    try {
        if (window.jsPDF) {
            await generarPDFConJSPDF();
        } else {
            console.warn('⚠️ jsPDF no disponible, usando método alternativo');
            window.print();
        }
    } catch (error) {
        console.error('❌ Error al generar PDF:', error);
        alert('Error al generar PDF. Usando impresión del navegador...');
        window.print();
    } finally {
        ocultarCarga();
    }
}

async function generarPDFConJSPDF() {
    const { jsPDF } = window.jsPDF;
    const pdf = new jsPDF();
    
    // Configurar fuente y título
    pdf.setFontSize(20);
    pdf.text('Matemágica - Ejercicios de Práctica', 20, 30);
    
    pdf.setFontSize(12);
    pdf.text(`Nivel: ${getNivelTexto(configuracionActual.nivel)}`, 20, 45);
    pdf.text(`Cantidad: ${configuracionActual.cantidad} ejercicios`, 20, 55);
    pdf.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 65);
    
    // Agregar ejercicios
    let yPos = 85;
    const lineHeight = 15;
    
    ejerciciosGenerados.forEach((ejercicio, index) => {
        if (yPos > 250) { // Nueva página
            pdf.addPage();
            yPos = 30;
        }
        
        pdf.setFontSize(14);
        pdf.text(`${index + 1}. ${ejercicio.operacion}`, 30, yPos);
        yPos += lineHeight * 2;
    });
    
    // Descargar
    pdf.save(`matematica-ejercicios-${Date.now()}.pdf`);
    
    if (window.mostrarNotificacion) {
        window.mostrarNotificacion('✅ PDF descargado correctamente', 'success');
    }
}

async function generarCuentoMatematico() {
    if (!ejerciciosGenerados || ejerciciosGenerados.length === 0) {
        alert('Primero genera algunos ejercicios');
        return;
    }
    
    console.log('📖 Generando cuento matemático...');
    mostrarCarga('Creando un cuento mágico...');
    
    try {
        let cuento;
        
        if (window.generarCuentoConGemini && !window.MathModeSystem?.isOfflineMode()) {
            cuento = await window.generarCuentoConGemini(ejerciciosGenerados.slice(0, 3));
        } else {
            cuento = generarCuentoOffline();
        }
        
        mostrarModalCuento(cuento);
        
    } catch (error) {
        console.error('❌ Error generando cuento:', error);
        mostrarModalCuento(generarCuentoOffline());
    } finally {
        ocultarCarga();
    }
}

function generarCuentoOffline() {
    const cuentos = [
        {
            titulo: "La Aventura de los Números Mágicos",
            contenido: `Había una vez una pequeña maga llamada Luna que vivía en el Reino de los Números. 
            Un día, encontró un cofre mágico que solo se abría resolviendo operaciones matemáticas.
            
            "Para abrir este cofre", pensó Luna, "debo ser muy cuidadosa con mis cálculos."
            
            Luna sabía que cada número tenía su propia personalidad: los números grandes eran orgullosos, 
            los pequeños eran tímidos, y todos juntos formaban hermosas operaciones.
            
            Con su varita mágica, Luna comenzó a resolver cada problema, uno por uno, hasta que el cofre 
            se abrió revelando el tesoro más hermoso: ¡la satisfacción de aprender matemáticas!`
        },
        {
            titulo: "El Robot Calculador",
            contenido: `En una ciudad futurista, había un robot llamado Calc que ayudaba a los niños con las matemáticas.
            
            Calc tenía una pantalla brillante donde aparecían números que bailaban y se transformaban en sumas y restas.
            
            "¡Beep beep!", decía Calc. "Las matemáticas son como un juego divertido. Cada operación es un rompecabezas 
            que podemos resolver juntos."
            
            Los niños del futuro aprendieron que las matemáticas no eran difíciles, solo necesitaban práctica y 
            un amigo robot que los motivara a seguir intentando.`
        }
    ];
    
    return cuentos[Math.floor(Math.random() * cuentos.length)];
}

function mostrarModalCuento(cuento) {
    const modal = document.getElementById('modal-cuento');
    const contenido = document.getElementById('contenido-cuento');
    
    if (!modal || !contenido) {
        console.warn('⚠️ Modal de cuento no encontrado');
        return;
    }
    
    contenido.innerHTML = `
        <h3 class="text-xl font-bold text-purple-600 mb-4">${cuento.titulo}</h3>
        <div class="prose text-gray-700 leading-relaxed">
            ${cuento.contenido.split('\n').map(p => `<p class="mb-3">${p.trim()}</p>`).join('')}
        </div>
        <div class="mt-6 p-4 bg-purple-50 rounded-lg">
            <p class="text-sm text-purple-700">
                ✨ <strong>¡Ahora es tu turno!</strong> Resuelve los ejercicios como los héroes de este cuento.
            </p>
        </div>
    `;
    
    toggleModalCuento(true);
}

// Función para mostrar/ocultar el modal de cuento
function toggleModalCuento(mostrar = false) {
    const modal = document.getElementById('modal-cuento');
    if (!modal) return;
    
    if (mostrar) {
        // Eliminar hidden y agregar flex correctamente
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevenir scroll
    } else {
        // Ocultar correctamente
        modal.classList.add('hidden');
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Restaurar scroll
    }
}

// Configurar botones para abrir/cerrar el modal de cuento
function configurarModalCuento() {
    const btnGenerarCuento = document.getElementById('btn-generar-cuento');
    const btnCerrarCuento = document.getElementById('btn-cerrar-cuento');
    
    if (btnGenerarCuento) {
        btnGenerarCuento.addEventListener('click', () => {
            generarCuento().then(() => {
                toggleModalCuento(true);
            });
        });
    }
    
    if (btnCerrarCuento) {
        btnCerrarCuento.addEventListener('click', () => {
            toggleModalCuento(false);
        });
    }
    
    // Cerrar modal al hacer clic fuera del contenido
    const modal = document.getElementById('modal-cuento');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                toggleModalCuento(false);
            }
        });
    }
}

// Actualizar función de inicialización
function inicializarApp() {
    console.log('🚀 Inicializando Matemágica PWA...');
    
    // Verificar si el usuario ya está autenticado
    const isAuthenticated = window.authManager?.isAuthenticated() || 
                           window.welcomeAuthManager?.isAuthenticated();
    
    if (isAuthenticated) {
        console.log('🎯 Inicializando aplicación principal...');
        inicializarAplicacionPrincipal();
    } else {
        console.log('⏳ Esperando autenticación del usuario...');
        // Esperar evento de autenticación
        window.addEventListener('userAuthenticated', (event) => {
            console.log('👤 Usuario autenticado, inicializando app...');
            inicializarAplicacionPrincipal();
        });
    }
}

function inicializarAplicacionPrincipal() {
    // Configurar eventos principales
    configurarEventos();
    
    // Configurar cerrar sesión
    configurarCerrarSesion();
    
    // Cargar datos del usuario
    cargarDatosUsuario();
    
    // Verificar servicios disponibles
    verificarServicios();
    
    console.log('✅ Matemágica PWA inicializada correctamente');
}

function cerrarSesion() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        console.log('🚪 Cerrando sesión...');
        
        // ✅ CORREGIDO: Usar el nuevo sistema de autenticación
        if (window.welcomeAuthManager) {
            window.welcomeAuthManager.signOut();
        } else {
            // Fallback para limpiar datos manualmente
            localStorage.removeItem('currentUser');
            localStorage.removeItem('isAuthenticated');
            
            if (window.mostrarNotificacion) {
                window.mostrarNotificacion('👋 Sesión cerrada. ¡Hasta pronto!', 'success');
            }
            
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1000);
        }
    }
}

// ✅ NUEVO: Función para verificar estado de autenticación
function verificarAutenticacion() {
    if (window.welcomeAuthManager) {
        return window.welcomeAuthManager.isAuthenticated();
    }
    return localStorage.getItem('isAuthenticated') === 'true';
}

// Exportar funciones para uso global
window.MathApp = {
    generarEjercicios,
    descargarPDF,
    generarCuentoMatematico,
    ejerciciosGenerados: () => ejerciciosGenerados,
    configuracionActual: () => configuracionActual,
    // ✅ NUEVO: Exportar función de verificación de autenticación
    verificarAutenticacion,
    initializeApp
};

console.log('✅ App.js cargado correctamente');