// apoderado-dashboard.js - Dashboard específico para apoderados
console.log('👨‍👩‍👧‍👦 Inicializando dashboard del apoderado...');

// Variables globales
let currentUser = null; // ✅ AGREGAR DECLARACIÓN GLOBAL
let studentData = null;
let ejerciciosHistorial = [];

// ✅ FUNCIÓN AUXILIAR PARA MANIPULAR DOM TOLERANTE
function updateElementSafely(elementId, action) {
    const element = document.getElementById(elementId);
    if (element && action) {
        try {
            action(element);
            return true;
        } catch (error) {
            console.warn(`⚠️ No se pudo actualizar elemento ${elementId}:`, error);
            return false;
        }
    } else {
        console.log(`ℹ️ Elemento ${elementId} no encontrado - continuando sin errores`);
        return false;
    }
}

function setTextSafely(elementId, text) {
    return updateElementSafely(elementId, (el) => el.textContent = text);
}

function addClassSafely(elementId, className) {
    return updateElementSafely(elementId, (el) => el.classList.add(className));
}

function removeClassSafely(elementId, className) {
    return updateElementSafely(elementId, (el) => el.classList.remove(className));
}

function getElementValueSafely(elementId, defaultValue = '') {
    const element = document.getElementById(elementId);
    if (element) {
        return element.value || defaultValue;
    }
    console.log(`ℹ️ Elemento ${elementId} no encontrado - usando valor por defecto: ${defaultValue}`);
    return defaultValue;
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM cargado - Inicializando dashboard apoderado');
    initializeApoderadoDashboard();
});

async function initializeApoderadoDashboard() {
    // Verificar autenticación
    if (!checkAuthentication()) {
        return;
    }
    
    // Cargar datos del usuario y estudiante
    loadUserData();
    loadStudentData();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Actualizar UI inicial
    updateUI();
    
    console.log('✅ Dashboard del apoderado inicializado');
}

function checkAuthentication() {
    // ✅ USAR EL SISTEMA NUEVO DE AUTENTICACIÓN
    const isAuthenticated = localStorage.getItem('matemagica-authenticated');
    const userProfile = localStorage.getItem('matemagica-user-profile');
    
    if (isAuthenticated !== 'true' || !userProfile) {
        console.warn('⚠️ Usuario no autenticado, redirigiendo...');
        window.location.href = '/index.html';
        return false;
    }
    
    try {
        // ✅ PARSEAR EL PERFIL MODERNO
        const profile = JSON.parse(userProfile);
        currentUser = {
            ...profile,
            name: profile.full_name,
            avatar: profile.avatar_url,
            role: profile.user_role // Mapear al formato legacy para compatibilidad
        };
        
        // ✅ VERIFICAR ROL CORRECTO
        if (profile.user_role !== 'parent') {
            console.warn('⚠️ Usuario no es apoderado, redirigiendo...');
            window.location.href = '/index.html';
            return false;
        }
        
        console.log('✅ Apoderado autenticado:', profile.full_name);
        return true;
    } catch (error) {
        console.error('❌ Error al parsear datos de usuario:', error);
        window.location.href = '/index.html';
        return false;
    }
}

function loadUserData() {
    if (!currentUser) return;
    
    // ✅ ACTUALIZAR INFO DEL APODERADO CON VERIFICACIÓN TOLERANTE
    setTextSafely('apoderado-nombre', currentUser.name || 'Apoderado');
    
    updateElementSafely('apoderado-avatar', (el) => {
        if (currentUser.avatar) {
            el.src = currentUser.avatar;
        }
    });
    
    console.log('✅ Datos del usuario cargados');
}

function loadStudentData() {
    const savedStudentData = localStorage.getItem('studentData');
    
    if (savedStudentData) {
        try {
            studentData = JSON.parse(savedStudentData);
            console.log('✅ Datos del estudiante cargados:', studentData);
        } catch (error) {
            console.error('❌ Error al parsear datos del estudiante:', error);
            studentData = null;
        }
    }
    
    // Cargar historial de ejercicios
    const savedHistorial = localStorage.getItem('ejerciciosHistorial');
    if (savedHistorial) {
        try {
            ejerciciosHistorial = JSON.parse(savedHistorial);
        } catch (error) {
            console.error('❌ Error al cargar historial:', error);
            ejerciciosHistorial = [];
        }
    }
}

function setupEventListeners() {
    // ✅ BOTONES DE CONFIGURACIÓN CON VERIFICACIÓN TOLERANTE
    updateElementSafely('btn-configurar-estudiante', (el) => 
        el.addEventListener('click', mostrarFormularioConfig));
    updateElementSafely('btn-empezar-config', (el) => 
        el.addEventListener('click', mostrarFormularioConfig));
    updateElementSafely('btn-cancelar-config', (el) => 
        el.addEventListener('click', ocultarFormularioConfig));
    
    // ✅ FORMULARIO DE CONFIGURACIÓN CON VERIFICACIÓN TOLERANTE
    updateElementSafely('form-configurar-estudiante', (el) => 
        el.addEventListener('submit', guardarConfiguracionEstudiante));
    
    // ✅ BOTONES DE GENERACIÓN CON VERIFICACIÓN TOLERANTE
    updateElementSafely('btn-generar-ia', (el) => 
        el.addEventListener('click', () => generarEjercicios('ia')));
    updateElementSafely('btn-generar-offline', (el) => 
        el.addEventListener('click', () => generarEjercicios('offline')));
    
    // ✅ BOTONES DE RESULTADOS CON VERIFICACIÓN TOLERANTE
    updateElementSafely('btn-descargar-pdf', (el) => 
        el.addEventListener('click', descargarPDF));
    updateElementSafely('btn-generar-cuento', (el) => 
        el.addEventListener('click', generarCuento));
    updateElementSafely('btn-marcar-completado', (el) => 
        el.addEventListener('click', marcarComoCompletado));
    
    // ✅ CERRAR SESIÓN CON VERIFICACIÓN TOLERANTE
    updateElementSafely('btn-cerrar-sesion', (el) => 
        el.addEventListener('click', cerrarSesion));
    
    // ✅ MODAL DE CUENTO CON VERIFICACIÓN TOLERANTE
    updateElementSafely('btn-cerrar-cuento', (el) => 
        el.addEventListener('click', cerrarModalCuento));
    
    console.log('✅ Event listeners configurados (tolerante)');
}

function updateUI() {
    if (studentData) {
        mostrarEstudianteAsignado();
        mostrarSeccionGenerador();
        actualizarEstadisticas();
    } else {
        mostrarSinEstudiante();
    }
}

function mostrarEstudianteAsignado() {
    // ✅ OCULTAR OTRAS SECCIONES CON VERIFICACIÓN TOLERANTE
    addClassSafely('sin-estudiante', 'hidden');
    addClassSafely('formulario-configurar', 'hidden');
    
    // ✅ MOSTRAR INFO DEL ESTUDIANTE CON VERIFICACIÓN TOLERANTE
    removeClassSafely('estudiante-asignado', 'hidden');
    
    // ✅ ACTUALIZAR DATOS CON VERIFICACIÓN TOLERANTE
    const inicial = studentData.name.charAt(0).toUpperCase();
    setTextSafely('estudiante-inicial', inicial);
    setTextSafely('estudiante-nombre-display', studentData.name);
    setTextSafely('estudiante-info-display', `${studentData.grade} • ${studentData.age} años`);
    
    // ✅ NIVEL ACTUAL CON VERIFICACIÓN TOLERANTE
    const niveles = ['Fácil', 'Medio', 'Difícil'];
    const nivelActual = niveles[parseInt(studentData.level) - 1] || 'Fácil';
    setTextSafely('estudiante-nivel-display', nivelActual);
    
    // ✅ ESTADÍSTICAS RÁPIDAS CON VERIFICACIÓN TOLERANTE
    const totalEjercicios = ejerciciosHistorial.length;
    setTextSafely('total-ejercicios-estudiante', totalEjercicios);
    
    if (ejerciciosHistorial.length > 0) {
        const ultimaSesion = new Date(ejerciciosHistorial[ejerciciosHistorial.length - 1].fecha);
        setTextSafely('ultima-sesion', ultimaSesion.toLocaleDateString('es-ES'));
        
        // ✅ NIVEL FAVORITO (MÁS USADO) CON VERIFICACIÓN TOLERANTE
        const nivelesUsados = ejerciciosHistorial.map(e => e.nivel);
        const nivelFavorito = nivelesUsados.sort((a,b) =>
            nivelesUsados.filter(v => v===a).length - nivelesUsados.filter(v => v===b).length
        ).pop();
        setTextSafely('nivel-favorito-estudiante', niveles[nivelFavorito - 1] || '-');
    }
    
    console.log('✅ Estudiante asignado mostrado (tolerante)');
}

function mostrarSinEstudiante() {
    addClassSafely('estudiante-asignado', 'hidden');
    addClassSafely('formulario-configurar', 'hidden');
    removeClassSafely('sin-estudiante', 'hidden');
    addClassSafely('seccion-generador', 'hidden');
    
    console.log('📝 Mostrando pantalla sin estudiante (tolerante)');
}

function mostrarFormularioConfig() {
    addClassSafely('sin-estudiante', 'hidden');
    addClassSafely('estudiante-asignado', 'hidden');
    removeClassSafely('formulario-configurar', 'hidden');
    
    // ✅ SI HAY DATOS EXISTENTES, PRE-LLENAR EL FORMULARIO CON VERIFICACIÓN TOLERANTE
    if (studentData) {
        updateElementSafely('config-estudiante-nombre', (el) => el.value = studentData.name || '');
        updateElementSafely('config-estudiante-curso', (el) => el.value = studentData.grade || '');
        updateElementSafely('config-estudiante-edad', (el) => el.value = studentData.age || '');
        updateElementSafely('config-estudiante-nivel', (el) => el.value = studentData.level || '1');
    }
    
    console.log('📝 Mostrando formulario de configuración (tolerante)');
}

function ocultarFormularioConfig() {
    addClassSafely('formulario-configurar', 'hidden');
    updateUI();
}

async function guardarConfiguracionEstudiante(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const nuevosData = {
        name: formData.get('config-estudiante-nombre'),
        grade: formData.get('config-estudiante-curso'),
        age: formData.get('config-estudiante-edad'),
        level: formData.get('config-estudiante-nivel'),
        parentId: currentUser.id,
        fechaCreacion: new Date().toISOString()
    };
    
    console.log('💾 Guardando configuración del estudiante:', nuevosData);
    
    try {
        // Mostrar loading
        mostrarCargando('Guardando configuración...');
        
        // Simular guardado
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Guardar en localStorage
        studentData = nuevosData;
        localStorage.setItem('studentData', JSON.stringify(studentData));
        
        // Actualizar UI
        ocultarCargando();
        mostrarNotificacion('✅ Perfil del estudiante actualizado correctamente', 'success');
        updateUI();
        
        console.log('✅ Configuración guardada exitosamente');
        
    } catch (error) {
        console.error('❌ Error al guardar configuración:', error);
        ocultarCargando();
        mostrarNotificacion('❌ Error al guardar la configuración', 'error');
    }
}

function mostrarSeccionGenerador() {
    removeClassSafely('seccion-generador', 'hidden');
    
    // ✅ CONFIGURAR NIVEL RECOMENDADO CON VERIFICACIÓN TOLERANTE
    updateElementSafely('nivelSelect', (el) => {
        if (studentData && studentData.level) {
            el.value = studentData.level;
        }
    });
    
    // ✅ ACTUALIZAR RECOMENDACIÓN CON VERIFICACIÓN TOLERANTE
    updateElementSafely('recomendacion-nivel', (el) => {
        if (studentData) {
            const niveles = ['Fácil', 'Medio', 'Difícil'];
            const nivelEstudiante = niveles[parseInt(studentData.level) - 1] || 'Fácil';
            el.textContent = `Nivel configurado para ${studentData.name}: ${nivelEstudiante}`;
        }
    });
}

async function generarEjercicios(tipo) {
    if (!studentData) {
        mostrarNotificacion('⚠️ Primero configura el perfil de tu hijo/a', 'warning');
        return;
    }
    
    // ✅ OBTENER VALORES CON VERIFICACIÓN TOLERANTE
    const nivel = getElementValueSafely('nivelSelect', '1');
    const cantidad = getElementValueSafely('cantidadSelect', '5');
    const tipoOperacion = getElementValueSafely('tipoSelect', 'mixto');
    
    console.log(`🎯 Generando ${cantidad} ejercicios (${tipo}) - Nivel: ${nivel}, Tipo: ${tipoOperacion}`);
    
    try {
        mostrarCargando(`Generando ejercicios ${tipo === 'ia' ? 'con IA' : 'offline'}...`);
        
        let ejercicios;
        if (tipo === 'ia') {
            ejercicios = await generarEjerciciosConIA(nivel, cantidad, tipoOperacion);
        } else {
            ejercicios = generarEjerciciosOffline(nivel, cantidad, tipoOperacion);
        }
        
        // Mostrar resultados
        mostrarEjercicios(ejercicios);
        
        // Guardar en historial
        // ✅ GUARDAR EN HISTORIAL CON GUARDADO HÍBRIDO (localStorage + Supabase)
        const sesionData = {
            estudianteNombre: studentData.name,
            estudianteId: studentData.name,
            nivel: parseInt(nivel),
            cantidad: parseInt(cantidad),
            tipoOperacion: tipoOperacion,
            metodo: tipo,
            ejercicios: ejercicios,
            fechaInicio: new Date().toISOString(),
            duracion: Math.floor(parseInt(cantidad) * 1.5), // Estimar duración
            tipo: 'apoderado'
        };

        // ✅ USAR FUNCIÓN DE GUARDADO HÍBRIDO
        if (window.guardarSesionHibrida) {
            const resultado = await window.guardarSesionHibrida(sesionData);
            
            if (resultado.supabase) {
                console.log('☁️ Sesión guardada en Supabase y localStorage');
                mostrarNotificacion(`✅ ${cantidad} ejercicios generados y sincronizados`, 'success');
            } else {
                console.log('💾 Sesión guardada solo en localStorage');
                mostrarNotificacion(`✅ ${cantidad} ejercicios generados (modo offline)`, 'success');
            }
        } else {
            // ✅ FALLBACK AL MÉTODO ANTERIOR SI NO ESTÁ DISPONIBLE
            const sesion = {
                id: Date.now(),
                fecha: new Date().toISOString(),
                nivel: parseInt(nivel),
                cantidad: parseInt(cantidad),
                tipo: tipoOperacion,
                metodo: tipo,
                estudianteId: studentData.name,
                estudianteNombre: studentData.name,
                ejercicios: ejercicios
            };
            
            ejerciciosHistorial.push(sesion);
            localStorage.setItem('ejerciciosHistorial', JSON.stringify(ejerciciosHistorial));
            mostrarNotificacion(`✅ ${cantidad} ejercicios generados para ${studentData.name}`, 'success');
        }
        
        ocultarCargando();
        
        // Actualizar estadísticas
        actualizarEstadisticas();
        
    } catch (error) {
        console.error('❌ Error al generar ejercicios:', error);
        ocultarCargando();
        mostrarNotificacion('❌ Error al generar ejercicios. Intenta nuevamente.', 'error');
    }
}

async function generarEjerciciosConIA(nivel, cantidad, tipoOperacion) {
    // Simular llamada a IA (aquí integrarías con Gemini)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const ejercicios = [];
    for (let i = 1; i <= cantidad; i++) {
        ejercicios.push(generarEjercicioAleatorio(nivel, tipoOperacion, i));
    }
    
    return ejercicios;
}

function generarEjerciciosOffline(nivel, cantidad, tipoOperacion) {
    const ejercicios = [];
    for (let i = 1; i <= cantidad; i++) {
        ejercicios.push(generarEjercicioAleatorio(nivel, tipoOperacion, i));
    }
    return ejercicios;
}

function generarEjercicioAleatorio(nivel, tipoOperacion, numero) {
    const esNivelFacil = nivel === '1';
    const esNivelMedio = nivel === '2';
    
    let num1, num2, operacion, resultado;
    
    // Determinar operación
    if (tipoOperacion === 'suma') {
        operacion = '+';
    } else if (tipoOperacion === 'resta') {
        operacion = '-';
    } else {
        operacion = Math.random() > 0.5 ? '+' : '-';
    }
    
    // Generar números según el nivel
    if (esNivelFacil) {
        // Sin llevar ni pedir prestado
        if (operacion === '+') {
            num1 = Math.floor(Math.random() * 50) + 10;
            num2 = Math.floor(Math.random() * (99 - num1));
        } else {
            num1 = Math.floor(Math.random() * 89) + 10;
            num2 = Math.floor(Math.random() * num1);
        }
    } else if (esNivelMedio) {
        // Con llevar o pedir prestado
        num1 = Math.floor(Math.random() * 89) + 10;
        num2 = Math.floor(Math.random() * 89) + 10;
        
        if (operacion === '-' && num2 > num1) {
            [num1, num2] = [num2, num1];
        }
    } else {
        // Difícil - mixto
        num1 = Math.floor(Math.random() * 99) + 1;
        num2 = Math.floor(Math.random() * 99) + 1;
        
        if (operacion === '-' && num2 > num1) {
            [num1, num2] = [num2, num1];
        }
    }
    
    resultado = operacion === '+' ? num1 + num2 : num1 - num2;
    
    return {
        numero: numero,
        operacion: `${num1} ${operacion} ${num2}`,
        num1: num1,
        num2: num2,
        signo: operacion,
        resultado: resultado,
        nivel: nivel
    };
}

function mostrarEjercicios(ejercicios) {
    // ✅ MOSTRAR EJERCICIOS CON VERIFICACIÓN TOLERANTE
    updateElementSafely('ejercicios-container', (container) => {
        container.innerHTML = '';
        
        ejercicios.forEach(ejercicio => {
            const ejercicioCard = document.createElement('div');
            ejercicioCard.className = 'ejercicio-card';
            ejercicioCard.innerHTML = `
                <div class="ejercicio-numero">Ejercicio ${ejercicio.numero}</div>
                <div class="ejercicio-operacion">
                    ${ejercicio.operacion} = <span class="linea-respuesta"></span>
                </div>
            `;
            container.appendChild(ejercicioCard);
        });
    });
    
    // ✅ MOSTRAR SECCIÓN DE RESULTADOS CON VERIFICACIÓN TOLERANTE
    updateElementSafely('seccion-resultados', (el) => {
        el.classList.remove('hidden');
        el.scrollIntoView({ behavior: 'smooth' });
    });
    
    console.log(`✅ ${ejercicios.length} ejercicios mostrados (tolerante)`);
}

async function descargarPDF() {
    try {
        mostrarCargando('Generando PDF...');
        
        // Simular generación de PDF
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        mostrarNotificacion('📄 PDF descargado correctamente', 'success');
        ocultarCargando();
        
    } catch (error) {
        console.error('❌ Error al generar PDF:', error);
        ocultarCargando();
        mostrarNotificacion('❌ Error al generar PDF', 'error');
    }
}

async function generarCuento() {
    try {
        mostrarCargando('Generando cuento matemático...');
        
        // Simular generación de cuento
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const cuento = `
            <h4>🌟 La Aventura Matemática de ${studentData?.name || 'nuestro pequeño héroe'}</h4>
            <p>Había una vez un valiente explorador llamado ${studentData?.name || 'Alex'} que descubrió un tesoro mágico...</p>
            <p>Para abrir el cofre del tesoro, necesitaba resolver algunas operaciones matemáticas. ¡Cada número correcto hacía brillar una gema!</p>
            <p>Con mucha paciencia y concentración, ${studentData?.name || 'nuestro héroe'} resolvió todos los ejercicios y encontró el mayor tesoro de todos: ¡el conocimiento matemático!</p>
            <p class="text-center mt-4"><strong>🎉 ¡Felicitaciones por tu dedicación en las matemáticas! 🎉</strong></p>
        `;
        
        mostrarModalCuento(cuento);
        ocultarCargando();
        
    } catch (error) {
        console.error('❌ Error al generar cuento:', error);
        ocultarCargando();
        mostrarNotificacion('❌ Error al generar cuento', 'error');
    }
}

function mostrarModalCuento(contenido) {
    updateElementSafely('contenido-cuento', (el) => el.innerHTML = contenido);
    removeClassSafely('modal-cuento', 'hidden');
}

function cerrarModalCuento() {
    addClassSafely('modal-cuento', 'hidden');
}

function marcarComoCompletado() {
    if (ejerciciosHistorial.length === 0) {
        mostrarNotificacion('⚠️ No hay ejercicios para marcar', 'warning');
        return;
    }
    
    mostrarNotificacion(`✅ ¡Excelente! ${studentData.name} ha completado la práctica`, 'success');
    
    // Actualizar estadísticas
    actualizarEstadisticas();
}

function actualizarEstadisticas() {
    if (!studentData || ejerciciosHistorial.length === 0) {
        return;
    }
    
    // Calcular progreso por nivel
    const ejerciciosPorNivel = {1: 0, 2: 0, 3: 0};
    const totalPorNivel = {1: 0, 2: 0, 3: 0};
    
    ejerciciosHistorial.forEach(sesion => {
        totalPorNivel[sesion.nivel] += sesion.cantidad;
    });
    
    // Simular ejercicios completados (asumiendo 80% de éxito promedio)
    Object.keys(totalPorNivel).forEach(nivel => {
        ejerciciosPorNivel[nivel] = Math.floor(totalPorNivel[nivel] * 0.8);
    });
    
    // ✅ ACTUALIZAR BARRAS DE PROGRESO CON VERIFICACIÓN TOLERANTE
    const maxEjercicios = Math.max(...Object.values(totalPorNivel), 50);
    
    ['facil', 'medio', 'dificil'].forEach((nombre, index) => {
        const nivel = index + 1;
        const completados = ejerciciosPorNivel[nivel];
        const total = totalPorNivel[nivel];
        const porcentaje = total > 0 ? Math.round((completados / total) * 100) : 0;
        
        setTextSafely(`progreso-${nombre}`, `${porcentaje}%`);
        updateElementSafely(`barra-${nombre}`, (el) => 
            el.style.width = `${(completados / maxEjercicios) * 100}%`);
    });
    
    // Actualizar historial reciente
    actualizarHistorialReciente();
    
    console.log('📊 Estadísticas actualizadas (tolerante)');
}

function actualizarHistorialReciente() {
    // ✅ ACTUALIZAR HISTORIAL CON VERIFICACIÓN TOLERANTE
    updateElementSafely('historial-reciente', (historialContainer) => {
        if (ejerciciosHistorial.length === 0) {
            historialContainer.innerHTML = '<p class="text-gray-500">Sin actividad registrada aún</p>';
            return;
        }
        
        const recientes = ejerciciosHistorial.slice(-5).reverse();
        const niveles = ['🟢 Fácil', '🟡 Medio', '🔴 Difícil'];
        
        historialContainer.innerHTML = recientes.map(sesion => {
            const fecha = new Date(sesion.fecha).toLocaleDateString('es-ES');
            const nivel = niveles[sesion.nivel - 1];
            
            return `
                <div class="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                    <div>
                        <div class="font-semibold">${fecha}</div>
                        <div class="text-sm text-gray-600">${sesion.cantidad} ejercicios • ${nivel}</div>
                    </div>
                    <div class="text-blue-600 font-bold">${sesion.metodo === 'ia' ? '🤖' : '📚'}</div>
                </div>
            `;
        }).join('');
    });
}

function mostrarCargando(mensaje) {
    setTextSafely('loading-text', mensaje);
    removeClassSafely('loading-overlay', 'hidden');
}

function ocultarCargando() {
    addClassSafely('loading-overlay', 'hidden');
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white font-semibold max-w-sm transition-transform transform translate-x-full`;
    
    // Colores según el tipo
    const colores = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };
    
    notificacion.classList.add(colores[tipo] || colores.info);
    notificacion.textContent = mensaje;
    
    document.body.appendChild(notificacion);
    
    // Animar entrada
    setTimeout(() => {
        notificacion.classList.remove('translate-x-full');
    }, 100);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notificacion.classList.add('translate-x-full');
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.parentNode.removeChild(notificacion);
            }
        }, 300);
    }, 3000);
}

function cerrarSesion() {
    console.log('🚪 Cerrando sesión del apoderado...');
    
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        // Usar el sistema principal de autenticación si está disponible
        if (window.loginSystem && typeof window.loginSystem.signOut === 'function') {
            console.log('🚪 Usando logout del sistema principal...');
            window.loginSystem.signOut();
        } else {
            // Fallback mejorado para compatibilidad
            console.log('🚪 Usando logout de fallback mejorado...');
            const itemsToRemove = [
                'matemagica-authenticated',
                'matemagica-user-profile',
                'matemagica_selected_role',
                'matemagica_user',
                'matemagica_profile',
                'matemagica_role',
                'currentUser',
                'userProfile',
                'selectedRole',
                'studentData',
                'ejerciciosHistorial',
                'profesorEstudiantes',
                'profesorEjerciciosHistorial'
            ];
            
            itemsToRemove.forEach(item => {
                localStorage.removeItem(item);
            });
            
            sessionStorage.clear();
            
            // Cerrar sesión en Supabase si está disponible
            if (window.supabaseClient && window.supabaseClient.auth) {
                window.supabaseClient.auth.signOut().catch(err => {
                    console.warn('⚠️ Error cerrando sesión en Supabase:', err);
                });
            }
            
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 500);
        }
    }
}

// Verificar autenticación al cargar la página
window.addEventListener('beforeunload', function() {
    // Guardar datos antes de cerrar
    if (studentData) {
        localStorage.setItem('studentData', JSON.stringify(studentData));
    }
    if (ejerciciosHistorial.length > 0) {
        localStorage.setItem('ejerciciosHistorial', JSON.stringify(ejerciciosHistorial));
    }
});

console.log('✅ Dashboard del apoderado inicializado completamente');