// apoderado-dashboard.js - Dashboard específico para apoderados
console.log('👨‍👩‍👧‍👦 Inicializando dashboard del apoderado...');

// Variables globales
// currentUser se obtiene de auth-flow.js - no redeclarar aquí
let studentData = null;
let ejerciciosHistorial = [];

// Elementos DOM principales
const infoEstudiante = document.getElementById('info-estudiante');
const estudianteAsignado = document.getElementById('estudiante-asignado');
const formularioConfigurar = document.getElementById('formulario-configurar');
const sinEstudiante = document.getElementById('sin-estudiante');
const seccionGenerador = document.getElementById('seccion-generador');
const seccionResultados = document.getElementById('seccion-resultados');
const seccionEstadisticas = document.getElementById('seccion-estadisticas');

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
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userData = localStorage.getItem('currentUser');
    
    if (isAuthenticated !== 'true' || !userData) {
        console.warn('⚠️ Usuario no autenticado, redirigiendo...');
        window.location.href = '/index.html';
        return false;
    }
    
    try {
        currentUser = JSON.parse(userData);
        if (currentUser.role !== 'parent') {
            console.warn('⚠️ Usuario no es apoderado, redirigiendo...');
            window.location.href = '/index.html';
            return false;
        }
        return true;
    } catch (error) {
        console.error('❌ Error al parsear datos de usuario:', error);
        window.location.href = '/index.html';
        return false;
    }
}

function loadUserData() {
    if (!currentUser) return;
    
    // Actualizar info del apoderado en el header
    document.getElementById('apoderado-nombre').textContent = currentUser.name || 'Apoderado';
    
    if (currentUser.avatar) {
        document.getElementById('apoderado-avatar').src = currentUser.avatar;
    }
    
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
    // Botones de configuración
    document.getElementById('btn-configurar-estudiante').addEventListener('click', mostrarFormularioConfig);
    document.getElementById('btn-empezar-config').addEventListener('click', mostrarFormularioConfig);
    document.getElementById('btn-cancelar-config').addEventListener('click', ocultarFormularioConfig);
    
    // Formulario de configuración
    document.getElementById('form-configurar-estudiante').addEventListener('submit', guardarConfiguracionEstudiante);
    
    // Botones de generación
    document.getElementById('btn-generar-ia').addEventListener('click', () => generarEjercicios('ia'));
    document.getElementById('btn-generar-offline').addEventListener('click', () => generarEjercicios('offline'));
    
    // Botones de resultados
    document.getElementById('btn-descargar-pdf').addEventListener('click', descargarPDF);
    document.getElementById('btn-generar-cuento').addEventListener('click', generarCuento);
    document.getElementById('btn-marcar-completado').addEventListener('click', marcarComoCompletado);
    
    // Cerrar sesión
    document.getElementById('btn-cerrar-sesion').addEventListener('click', cerrarSesion);
    
    // Modal de cuento
    document.getElementById('btn-cerrar-cuento').addEventListener('click', cerrarModalCuento);
    
    console.log('✅ Event listeners configurados');
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
    // Ocultar otras secciones
    sinEstudiante.classList.add('hidden');
    formularioConfigurar.classList.add('hidden');
    
    // Mostrar info del estudiante
    estudianteAsignado.classList.remove('hidden');
    
    // Actualizar datos
    const inicial = studentData.name.charAt(0).toUpperCase();
    document.getElementById('estudiante-inicial').textContent = inicial;
    document.getElementById('estudiante-nombre-display').textContent = studentData.name;
    document.getElementById('estudiante-info-display').textContent = `${studentData.grade} • ${studentData.age} años`;
    
    // Nivel actual
    const niveles = ['Fácil', 'Medio', 'Difícil'];
    const nivelActual = niveles[parseInt(studentData.level) - 1] || 'Fácil';
    document.getElementById('estudiante-nivel-display').textContent = nivelActual;
    
    // Estadísticas rápidas
    const totalEjercicios = ejerciciosHistorial.length;
    document.getElementById('total-ejercicios-estudiante').textContent = totalEjercicios;
    
    if (ejerciciosHistorial.length > 0) {
        const ultimaSesion = new Date(ejerciciosHistorial[ejerciciosHistorial.length - 1].fecha);
        document.getElementById('ultima-sesion').textContent = ultimaSesion.toLocaleDateString('es-ES');
        
        // Nivel favorito (más usado)
        const nivelesUsados = ejerciciosHistorial.map(e => e.nivel);
        const nivelFavorito = nivelesUsados.sort((a,b) =>
            nivelesUsados.filter(v => v===a).length - nivelesUsados.filter(v => v===b).length
        ).pop();
        document.getElementById('nivel-favorito-estudiante').textContent = niveles[nivelFavorito - 1] || '-';
    }
    
    console.log('✅ Estudiante asignado mostrado');
}

function mostrarSinEstudiante() {
    estudianteAsignado.classList.add('hidden');
    formularioConfigurar.classList.add('hidden');
    sinEstudiante.classList.remove('hidden');
    seccionGenerador.classList.add('hidden');
    
    console.log('📝 Mostrando pantalla sin estudiante');
}

function mostrarFormularioConfig() {
    sinEstudiante.classList.add('hidden');
    estudianteAsignado.classList.add('hidden');
    formularioConfigurar.classList.remove('hidden');
    
    // Si hay datos existentes, pre-llenar el formulario
    if (studentData) {
        document.getElementById('config-estudiante-nombre').value = studentData.name || '';
        document.getElementById('config-estudiante-curso').value = studentData.grade || '';
        document.getElementById('config-estudiante-edad').value = studentData.age || '';
        document.getElementById('config-estudiante-nivel').value = studentData.level || '1';
    }
    
    console.log('📝 Mostrando formulario de configuración');
}

function ocultarFormularioConfig() {
    formularioConfigurar.classList.add('hidden');
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
    seccionGenerador.classList.remove('hidden');
    
    // Configurar nivel recomendado según el estudiante
    const nivelSelect = document.getElementById('nivelSelect');
    if (studentData && studentData.level) {
        nivelSelect.value = studentData.level;
    }
    
    // Actualizar recomendación
    const recomendacion = document.getElementById('recomendacion-nivel');
    if (studentData) {
        const niveles = ['Fácil', 'Medio', 'Difícil'];
        const nivelEstudiante = niveles[parseInt(studentData.level) - 1] || 'Fácil';
        recomendacion.textContent = `Nivel configurado para ${studentData.name}: ${nivelEstudiante}`;
    }
}

async function generarEjercicios(tipo) {
    if (!studentData) {
        mostrarNotificacion('⚠️ Primero configura el perfil de tu hijo/a', 'warning');
        return;
    }
    
    const nivel = document.getElementById('nivelSelect').value;
    const cantidad = document.getElementById('cantidadSelect').value;
    const tipoOperacion = document.getElementById('tipoSelect').value;
    
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
        const sesion = {
            id: Date.now(),
            fecha: new Date().toISOString(),
            nivel: parseInt(nivel),
            cantidad: parseInt(cantidad),
            tipo: tipoOperacion,
            metodo: tipo,
            estudianteId: studentData.name,
            ejercicios: ejercicios
        };
        
        ejerciciosHistorial.push(sesion);
        localStorage.setItem('ejerciciosHistorial', JSON.stringify(ejerciciosHistorial));
        
        ocultarCargando();
        mostrarNotificacion(`✅ ${cantidad} ejercicios generados para ${studentData.name}`, 'success');
        
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
    const container = document.getElementById('ejercicios-container');
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
    
    // Mostrar sección de resultados
    seccionResultados.classList.remove('hidden');
    
    // Scroll hacia los resultados
    seccionResultados.scrollIntoView({ behavior: 'smooth' });
    
    console.log(`✅ ${ejercicios.length} ejercicios mostrados`);
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
    document.getElementById('contenido-cuento').innerHTML = contenido;
    document.getElementById('modal-cuento').classList.remove('hidden');
}

function cerrarModalCuento() {
    document.getElementById('modal-cuento').classList.add('hidden');
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
    
    // Actualizar barras de progreso
    const maxEjercicios = Math.max(...Object.values(totalPorNivel), 50);
    
    ['facil', 'medio', 'dificil'].forEach((nombre, index) => {
        const nivel = index + 1;
        const completados = ejerciciosPorNivel[nivel];
        const total = totalPorNivel[nivel];
        const porcentaje = total > 0 ? Math.round((completados / total) * 100) : 0;
        
        document.getElementById(`progreso-${nombre}`).textContent = `${porcentaje}%`;
        document.getElementById(`barra-${nombre}`).style.width = `${(completados / maxEjercicios) * 100}%`;
    });
    
    // Actualizar historial reciente
    actualizarHistorialReciente();
    
    console.log('📊 Estadísticas actualizadas');
}

function actualizarHistorialReciente() {
    const historialContainer = document.getElementById('historial-reciente');
    
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
}

function mostrarCargando(mensaje) {
    document.getElementById('loading-text').textContent = mensaje;
    document.getElementById('loading-overlay').classList.remove('hidden');
}

function ocultarCargando() {
    document.getElementById('loading-overlay').classList.add('hidden');
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
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('currentUser');
        window.location.href = '/index.html';
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