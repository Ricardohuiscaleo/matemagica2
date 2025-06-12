// profesor-dashboard.js - Dashboard específico para profesores
console.log('👨‍🏫 Inicializando dashboard del profesor...');

// Variables globales
let currentUser = null; // Usuario actual
let estudiantes = []; // Lista de estudiantes del profesor
let ejerciciosHistorial = []; // Historial de ejercicios generados
let estudianteSeleccionado = null; // Estudiante actualmente seleccionado
let classData = null;

// Elementos DOM principales
const seccionEstudiantes = document.getElementById('seccion-estudiantes');
const seccionGenerador = document.getElementById('seccion-generador');
const seccionResultados = document.getElementById('seccion-resultados');
const seccionEstadisticas = document.getElementById('seccion-estadisticas');

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM cargado - Inicializando dashboard profesor');
    initializeProfesorDashboard();
});

async function initializeProfesorDashboard() {
    // Verificar autenticación
    if (!checkAuthentication()) {
        return;
    }
    
    // Cargar datos del usuario y estudiantes
    loadUserData();
    loadEstudiantes();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Actualizar UI inicial
    updateUI();
    
    console.log('✅ Dashboard del profesor inicializado');
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
        if (currentUser.role !== 'teacher') {
            console.warn('⚠️ Usuario no es profesor, redirigiendo...');
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
    
    // Actualizar info del profesor en el header
    document.getElementById('profesor-nombre').textContent = currentUser.name || 'Profesor';
    
    if (currentUser.avatar) {
        document.getElementById('profesor-avatar').src = currentUser.avatar;
    }
    
    console.log('✅ Datos del usuario cargados');
}

function loadEstudiantes() {
    // Inicializar ejerciciosHistorial primero
    ejerciciosHistorial = [];
    
    const savedEstudiantes = localStorage.getItem('profesorEstudiantes');
    
    if (savedEstudiantes) {
        try {
            estudiantes = JSON.parse(savedEstudiantes);
            console.log('✅ Estudiantes cargados:', estudiantes);
        } catch (error) {
            console.error('❌ Error al parsear estudiantes:', error);
            estudiantes = [];
        }
    } else {
        // Datos de ejemplo para el profesor
        estudiantes = [
            {
                id: 1,
                name: 'María González',
                grade: '2° Básico',
                age: 7,
                level: 1,
                parentEmail: 'mama.maria@email.com',
                fechaCreacion: new Date().toISOString(),
                activo: true
            },
            {
                id: 2,
                name: 'Carlos Rodríguez',
                grade: '2° Básico',
                age: 8,
                level: 2,
                parentEmail: 'papa.carlos@email.com',
                fechaCreacion: new Date().toISOString(),
                activo: true
            }
        ];
        localStorage.setItem('profesorEstudiantes', JSON.stringify(estudiantes));
    }
    
    // Cargar historial de ejercicios DESPUÉS de inicializar
    const savedHistorial = localStorage.getItem('profesorEjerciciosHistorial');
    if (savedHistorial) {
        try {
            ejerciciosHistorial = JSON.parse(savedHistorial);
            console.log('✅ Historial de ejercicios cargado:', ejerciciosHistorial.length, 'sesiones');
        } catch (error) {
            console.error('❌ Error al cargar historial:', error);
            ejerciciosHistorial = [];
        }
    } else {
        console.log('📝 No hay historial previo - iniciando con array vacío');
    }
}

function setupEventListeners() {
    // Gestión de estudiantes
    document.getElementById('btn-agregar-estudiante').addEventListener('click', mostrarFormularioEstudiante);
    document.getElementById('btn-cancelar-estudiante').addEventListener('click', ocultarFormularioEstudiante);
    document.getElementById('form-nuevo-estudiante').addEventListener('submit', guardarEstudiante);
    
    // Generación de ejercicios
    document.getElementById('btn-generar-ia').addEventListener('click', () => generarEjercicios('ia'));
    document.getElementById('btn-generar-offline').addEventListener('click', () => generarEjercicios('offline'));
    
    // Resultados
    document.getElementById('btn-descargar-pdf').addEventListener('click', descargarPDF);
    document.getElementById('btn-generar-cuento').addEventListener('click', generarCuento);
    document.getElementById('btn-guardar-progreso').addEventListener('click', guardarProgreso);
    
    // Cerrar sesión
    document.getElementById('btn-cerrar-sesion').addEventListener('click', cerrarSesion);
    
    // Modal de cuento
    const btnCerrarCuento = document.getElementById('btn-cerrar-cuento');
    if (btnCerrarCuento) {
        btnCerrarCuento.addEventListener('click', cerrarModalCuento);
    }
    
    console.log('✅ Event listeners configurados');
}

function updateUI() {
    actualizarListaEstudiantes();
    actualizarEstadisticasGenerales();
    actualizarSelectorEstudiantes();
}

function actualizarListaEstudiantes() {
    const container = document.getElementById('lista-estudiantes');
    
    if (estudiantes.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <div class="text-6xl mb-4">👥</div>
                <h3 class="text-xl font-semibold text-gray-700 mb-2">Sin estudiantes registrados</h3>
                <p class="text-gray-500 mb-4">Agrega tu primer estudiante para comenzar</p>
                <button onclick="mostrarFormularioEstudiante()" class="btn-primary">
                    <i class="fas fa-plus mr-2"></i>Agregar Estudiante
                </button>
            </div>
        `;
        return;
    }
    
    const estudiantesActivos = estudiantes.filter(e => e.activo);
    
    container.innerHTML = estudiantesActivos.map(estudiante => {
        const inicial = estudiante.name.charAt(0).toUpperCase();
        const niveles = ['🟢 Fácil', '🟡 Medio', '🔴 Difícil'];
        const nivel = niveles[estudiante.level - 1] || '🟢 Fácil';
        
        // Calcular estadísticas del estudiante
        const ejerciciosEstudiante = ejerciciosHistorial.filter(e => e.estudianteId === estudiante.id);
        const totalEjercicios = ejerciciosEstudiante.reduce((sum, sesion) => sum + sesion.cantidad, 0);
        const ultimaActividad = ejerciciosEstudiante.length > 0 
            ? new Date(ejerciciosEstudiante[ejerciciosEstudiante.length - 1].fecha).toLocaleDateString('es-ES')
            : 'Sin actividad';
        
        return `
            <div class="estudiante-card bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center">
                        <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                            ${inicial}
                        </div>
                        <div>
                            <h3 class="font-semibold text-lg text-gray-800">${estudiante.name}</h3>
                            <p class="text-gray-600">${estudiante.grade} • ${estudiante.age} años</p>
                            <p class="text-sm text-gray-500">${nivel}</p>
                        </div>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="editarEstudiante(${estudiante.id})" class="btn-icon text-blue-600 hover:bg-blue-50">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="eliminarEstudiante(${estudiante.id})" class="btn-icon text-red-600 hover:bg-red-50">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div class="bg-blue-50 p-3 rounded-lg">
                        <div class="text-2xl font-bold text-blue-600">${totalEjercicios}</div>
                        <div class="text-sm text-blue-800">Ejercicios totales</div>
                    </div>
                    <div class="bg-green-50 p-3 rounded-lg">
                        <div class="text-sm font-semibold text-green-800">Última actividad</div>
                        <div class="text-xs text-green-600">${ultimaActividad}</div>
                    </div>
                </div>
                
                <div class="flex space-x-2">
                    <button onclick="seleccionarEstudiante(${estudiante.id})" class="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all">
                        <i class="fas fa-calculator mr-2"></i>Generar Ejercicios
                    </button>
                    <button onclick="verEstadisticas(${estudiante.id})" class="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-semibold transition-all">
                        <i class="fas fa-chart-line"></i>
                    </button>
                </div>
                
                ${estudiante.parentEmail ? `
                    <div class="mt-3 pt-3 border-t border-gray-200">
                        <div class="flex items-center text-sm text-gray-600">
                            <i class="fas fa-envelope mr-2"></i>
                            <span>${estudiante.parentEmail}</span>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
    
    console.log(`✅ Lista de estudiantes actualizada: ${estudiantesActivos.length} estudiantes`);
}

function actualizarSelectorEstudiantes() {
    const selector = document.getElementById('estudiante-target');
    
    if (!selector) {
        console.warn('⚠️ Selector de estudiante no encontrado');
        return;
    }
    
    if (estudiantes.length === 0) {
        selector.innerHTML = '<option value="">Sin estudiantes registrados</option>';
        return;
    }
    
    const estudiantesActivos = estudiantes.filter(e => e.activo);
    
    selector.innerHTML = `
        <option value="">Selecciona un estudiante</option>
        ${estudiantesActivos.map(estudiante => 
            `<option value="${estudiante.id}">${estudiante.name} - ${estudiante.grade}</option>`
        ).join('')}
    `;
    
    // Event listener para el selector
    selector.addEventListener('change', function() {
        const estudianteId = parseInt(this.value);
        if (estudianteId) {
            seleccionarEstudiante(estudianteId);
        } else {
            estudianteSeleccionado = null;
        }
    });
}

function mostrarFormularioEstudiante(estudianteId = null) {
    const formulario = document.getElementById('formulario-estudiante');
    const form = document.getElementById('form-nuevo-estudiante');
    const titulo = document.getElementById('titulo-modal-estudiante');
    
    // Limpiar formulario
    form.reset();
    
    if (estudianteId) {
        // Modo edición
        const estudiante = estudiantes.find(e => e.id === estudianteId);
        if (estudiante) {
            titulo.textContent = 'Editar Estudiante';
            document.getElementById('estudiante-nombre').value = estudiante.name;
            document.getElementById('estudiante-curso').value = estudiante.grade;
            document.getElementById('estudiante-edad').value = estudiante.age;
            document.getElementById('estudiante-nivel').value = estudiante.level;
            document.getElementById('apoderado-email').value = estudiante.parentEmail || '';
            form.dataset.estudianteId = estudianteId;
        }
    } else {
        // Modo creación
        titulo.textContent = 'Agregar Nuevo Estudiante';
        delete form.dataset.estudianteId;
    }
    
    formulario.classList.remove('hidden');
}

function ocultarFormularioEstudiante() {
    document.getElementById('formulario-estudiante').classList.add('hidden');
}

async function guardarEstudiante(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const estudianteId = event.target.dataset.estudianteId;
    
    const datosEstudiante = {
        name: formData.get('estudiante-nombre'),
        grade: formData.get('estudiante-curso'),
        age: parseInt(formData.get('estudiante-edad')),
        level: parseInt(formData.get('estudiante-nivel')),
        parentEmail: formData.get('apoderado-email'),
        activo: true
    };
    
    try {
        mostrarCargando(estudianteId ? 'Actualizando estudiante...' : 'Agregando estudiante...');
        
        // Simular guardado
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (estudianteId) {
            // Actualizar estudiante existente
            const index = estudiantes.findIndex(e => e.id === parseInt(estudianteId));
            if (index !== -1) {
                estudiantes[index] = { ...estudiantes[index], ...datosEstudiante };
            }
        } else {
            // Agregar nuevo estudiante
            const nuevoEstudiante = {
                id: Date.now(),
                ...datosEstudiante,
                fechaCreacion: new Date().toISOString()
            };
            estudiantes.push(nuevoEstudiante);
        }
        
        // Guardar en localStorage
        localStorage.setItem('profesorEstudiantes', JSON.stringify(estudiantes));
        
        // Actualizar UI
        updateUI();
        ocultarFormularioEstudiante();
        ocultarCargando();
        
        mostrarNotificacion(
            estudianteId ? '✅ Estudiante actualizado correctamente' : '✅ Estudiante agregado correctamente',
            'success'
        );
        
        console.log('✅ Estudiante guardado:', datosEstudiante);
        
    } catch (error) {
        console.error('❌ Error al guardar estudiante:', error);
        ocultarCargando();
        mostrarNotificacion('❌ Error al guardar el estudiante', 'error');
    }
}

function editarEstudiante(estudianteId) {
    mostrarFormularioEstudiante(estudianteId);
}

function eliminarEstudiante(estudianteId) {
    const estudiante = estudiantes.find(e => e.id === estudianteId);
    if (!estudiante) return;
    
    if (confirm(`¿Estás seguro de que quieres eliminar a ${estudiante.name}?`)) {
        // Marcar como inactivo en lugar de eliminar (para preservar historial)
        const index = estudiantes.findIndex(e => e.id === estudianteId);
        if (index !== -1) {
            estudiantes[index].activo = false;
            localStorage.setItem('profesorEstudiantes', JSON.stringify(estudiantes));
            updateUI();
            mostrarNotificacion(`✅ ${estudiante.name} ha sido eliminado`, 'success');
        }
    }
}

function seleccionarEstudiante(estudianteId) {
    const estudiante = estudiantes.find(e => e.id === estudianteId);
    if (!estudiante) return;
    
    estudianteSeleccionado = estudiante;
    
    // Actualizar selector
    document.getElementById('estudiante-selector').value = estudianteId;
    
    // Mostrar info del estudiante seleccionado
    const infoContainer = document.getElementById('estudiante-seleccionado-info');
    const inicial = estudiante.name.charAt(0).toUpperCase();
    const niveles = ['Fácil', 'Medio', 'Difícil'];
    const nivel = niveles[estudiante.level - 1] || 'Fácil';
    
    document.getElementById('estudiante-seleccionado-inicial').textContent = inicial;
    document.getElementById('estudiante-seleccionado-nombre').textContent = estudiante.name;
    document.getElementById('estudiante-seleccionado-info-text').textContent = `${estudiante.grade} • ${estudiante.age} años • Nivel ${nivel}`;
    
    infoContainer.classList.remove('hidden');
    
    // Configurar nivel recomendado
    document.getElementById('nivelSelect').value = estudiante.level;
    
    // Scroll al generador
    seccionGenerador.scrollIntoView({ behavior: 'smooth' });
    
    console.log('✅ Estudiante seleccionado:', estudiante.name);
}

function filtrarEstudiantes() {
    const busqueda = document.getElementById('buscar-estudiante').value.toLowerCase();
    const filtroCurso = document.getElementById('filtro-curso').value;
    const filtroNivel = document.getElementById('filtro-nivel').value;
    
    const estudiantesFiltrados = estudiantes.filter(estudiante => {
        if (!estudiante.activo) return false;
        
        const coincideBusqueda = estudiante.name.toLowerCase().includes(busqueda);
        const coincideCurso = !filtroCurso || estudiante.grade === filtroCurso;
        const coincideNivel = !filtroNivel || estudiante.level.toString() === filtroNivel;
        
        return coincideBusqueda && coincideCurso && coincideNivel;
    });
    
    // Actualizar lista con estudiantes filtrados
    // (Aquí podrías crear una función separada para renderizar solo los filtrados)
    console.log(`🔍 Filtros aplicados: ${estudiantesFiltrados.length} estudiantes encontrados`);
}

async function generarEjercicios(tipo) {
    if (!estudianteSeleccionado) {
        mostrarNotificacion('⚠️ Primero selecciona un estudiante', 'warning');
        return;
    }
    
    const nivel = document.getElementById('nivelSelect').value;
    const cantidad = document.getElementById('cantidadSelect').value;
    const tipoOperacion = document.getElementById('tipoSelect').value;
    
    console.log(`🎯 Generando ${cantidad} ejercicios (${tipo}) para ${estudianteSeleccionado.name}`);
    
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
            estudianteId: estudianteSeleccionado.id,
            estudianteNombre: estudianteSeleccionado.name,
            profesorId: currentUser.id,
            ejercicios: ejercicios
        };
        
        ejerciciosHistorial.push(sesion);
        localStorage.setItem('profesorEjerciciosHistorial', JSON.stringify(ejerciciosHistorial));
        
        ocultarCargando();
        mostrarNotificacion(`✅ ${cantidad} ejercicios generados para ${estudianteSeleccionado.name}`, 'success');
        
        // Actualizar estadísticas
        actualizarEstadisticasGenerales();
        
    } catch (error) {
        console.error('❌ Error al generar ejercicios:', error);
        ocultarCargando();
        mostrarNotificacion('❌ Error al generar ejercicios. Intenta nuevamente.', 'error');
    }
}

// Reutilizar funciones del dashboard del apoderado con adaptaciones
async function generarEjerciciosConIA(nivel, cantidad, tipoOperacion) {
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
    
    if (tipoOperacion === 'suma') {
        operacion = '+';
    } else if (tipoOperacion === 'resta') {
        operacion = '-';
    } else {
        operacion = Math.random() > 0.5 ? '+' : '-';
    }
    
    if (esNivelFacil) {
        if (operacion === '+') {
            num1 = Math.floor(Math.random() * 50) + 10;
            num2 = Math.floor(Math.random() * (99 - num1));
        } else {
            num1 = Math.floor(Math.random() * 89) + 10;
            num2 = Math.floor(Math.random() * num1);
        }
    } else if (esNivelMedio) {
        num1 = Math.floor(Math.random() * 89) + 10;
        num2 = Math.floor(Math.random() * 89) + 10;
        
        if (operacion === '-' && num2 > num1) {
            [num1, num2] = [num2, num1];
        }
    } else {
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
    
    seccionResultados.classList.remove('hidden');
    seccionResultados.scrollIntoView({ behavior: 'smooth' });
    
    console.log(`✅ ${ejercicios.length} ejercicios mostrados`);
}

async function enviarAApoderado() {
    if (!estudianteSeleccionado || !estudianteSeleccionado.parentEmail) {
        mostrarNotificacion('⚠️ El estudiante no tiene email de apoderado configurado', 'warning');
        return;
    }
    
    try {
        mostrarCargando('Enviando ejercicios al apoderado...');
        
        // Simular envío
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        mostrarNotificacion(`✅ Ejercicios enviados a ${estudianteSeleccionado.parentEmail}`, 'success');
        ocultarCargando();
        
    } catch (error) {
        console.error('❌ Error al enviar:', error);
        ocultarCargando();
        mostrarNotificacion('❌ Error al enviar ejercicios', 'error');
    }
}

function guardarProgreso() {
    if (!estudianteSeleccionado) {
        mostrarNotificacion('⚠️ No hay estudiante seleccionado', 'warning');
        return;
    }
    
    if (ejerciciosHistorial.length === 0) {
        mostrarNotificacion('⚠️ No hay ejercicios para guardar', 'warning');
        return;
    }
    
    const ultimaSesion = ejerciciosHistorial[ejerciciosHistorial.length - 1];
    
    try {
        mostrarCargando('Guardando progreso...');
        
        // Simular guardado
        setTimeout(() => {
            ocultarCargando();
            mostrarNotificacion(`✅ Progreso guardado para ${estudianteSeleccionado.name}`, 'success');
            
            // Actualizar estadísticas
            actualizarEstadisticasGenerales();
        }, 1000);
        
    } catch (error) {
        console.error('❌ Error al guardar progreso:', error);
        ocultarCargando();
        mostrarNotificacion('❌ Error al guardar progreso', 'error');
    }
}

function verEstadisticas(estudianteId) {
    const estudiante = estudiantes.find(e => e.id === estudianteId);
    if (!estudiante) return;
    
    // Calcular estadísticas del estudiante
    const ejerciciosEstudiante = ejerciciosHistorial.filter(e => e.estudianteId === estudianteId);
    const totalEjercicios = ejerciciosEstudiante.reduce((sum, sesion) => sum + sesion.cantidad, 0);
    const totalSesiones = ejerciciosEstudiante.length;
    
    // Progreso por nivel
    const ejerciciosPorNivel = {1: 0, 2: 0, 3: 0};
    ejerciciosEstudiante.forEach(sesion => {
        ejerciciosPorNivel[sesion.nivel] += sesion.cantidad;
    });
    
    // Crear contenido del modal
    const contenido = `
        <div class="estudiante-estadisticas">
            <div class="flex items-center mb-6">
                <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
                    ${estudiante.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h3 class="text-xl font-bold">${estudiante.name}</h3>
                    <p class="text-gray-600">${estudiante.grade} • ${estudiante.age} años</p>
                </div>
            </div>
            
            <div class="grid grid-cols-3 gap-4 mb-6">
                <div class="text-center p-4 bg-blue-50 rounded-lg">
                    <div class="text-2xl font-bold text-blue-600">${totalEjercicios}</div>
                    <div class="text-sm text-gray-600">Total ejercicios</div>
                </div>
                <div class="text-center p-4 bg-green-50 rounded-lg">
                    <div class="text-2xl font-bold text-green-600">${totalSesiones}</div>
                    <div class="text-sm text-gray-600">Sesiones</div>
                </div>
                <div class="text-center p-4 bg-purple-50 rounded-lg">
                    <div class="text-2xl font-bold text-purple-600">${ejerciciosPorNivel[estudiante.level] || 0}</div>
                    <div class="text-sm text-gray-600">En su nivel</div>
                </div>
            </div>
            
            <div class="space-y-4">
                <h4 class="font-semibold">📊 Progreso por Nivel:</h4>
                <div class="space-y-3">
                    ${[1, 2, 3].map(nivel => {
                        const niveles = ['🟢 Fácil', '🟡 Medio', '🔴 Difícil'];
                        const cantidad = ejerciciosPorNivel[nivel];
                        const porcentaje = totalEjercicios > 0 ? Math.round((cantidad / totalEjercicios) * 100) : 0;
                        
                        return `
                            <div>
                                <div class="flex justify-between text-sm mb-1">
                                    <span>${niveles[nivel - 1]}</span>
                                    <span>${cantidad} ejercicios (${porcentaje}%)</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="h-2 rounded-full ${nivel === 1 ? 'bg-green-500' : nivel === 2 ? 'bg-yellow-500' : 'bg-red-500'}" 
                                         style="width: ${porcentaje}%"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            ${ejerciciosEstudiante.length > 0 ? `
                <div class="mt-6">
                    <h4 class="font-semibold mb-3">📅 Actividad Reciente:</h4>
                    <div class="space-y-2 max-h-40 overflow-y-auto">
                        ${ejerciciosEstudiante.slice(-5).reverse().map(sesion => {
                            const fecha = new Date(sesion.fecha).toLocaleDateString('es-ES');
                            const niveles = ['🟢', '🟡', '🔴'];
                            return `
                                <div class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                                    <span class="text-sm">${fecha}</span>
                                    <span class="text-sm font-semibold">${sesion.cantidad} ejercicios ${niveles[sesion.nivel - 1]}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    // Mostrar modal de estadísticas
    mostrarModalEstadisticas(contenido);
}

function mostrarModalEstadisticas(contenido) {
    const modal = document.getElementById('modal-estadisticas');
    if (modal) {
        document.getElementById('contenido-estadisticas').innerHTML = contenido;
        modal.classList.remove('hidden');
        
        // Event listener para cerrar modal
        const btnCerrar = document.getElementById('btn-cerrar-estadisticas');
        if (btnCerrar) {
            btnCerrar.onclick = () => modal.classList.add('hidden');
        }
    } else {
        // Si no existe el modal, crear uno temporal
        const modalTemp = document.createElement('div');
        modalTemp.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
        modalTemp.innerHTML = `
            <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold">📊 Estadísticas del Estudiante</h3>
                        <button class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                    </div>
                    ${contenido}
                </div>
            </div>
        `;
        
        document.body.appendChild(modalTemp);
        
        // Cerrar modal al hacer clic en el botón o fondo
        modalTemp.onclick = (e) => {
            if (e.target === modalTemp || e.target.textContent === '×') {
                document.body.removeChild(modalTemp);
            }
        };
    }
}

function actualizarEstadisticasGenerales() {
    const estudiantesActivos = estudiantes.filter(e => e.activo);
    const totalSesiones = ejerciciosHistorial.length;
    const totalEjercicios = ejerciciosHistorial.reduce((sum, sesion) => sum + sesion.cantidad, 0);
    
    // Actualizar métricas principales
    document.getElementById('total-estudiantes').textContent = estudiantesActivos.length;
    document.getElementById('total-sesiones').textContent = totalSesiones;
    document.getElementById('total-ejercicios').textContent = totalEjercicios;
    
    // Estudiante más activo
    const estudianteActivoContainer = document.getElementById('estudiante-activo');
    if (ejerciciosHistorial.length > 0) {
        const actividadPorEstudiante = {};
        ejerciciosHistorial.forEach(sesion => {
            if (!actividadPorEstudiante[sesion.estudianteId]) {
                actividadPorEstudiante[sesion.estudianteId] = {
                    nombre: sesion.estudianteNombre,
                    sesiones: 0,
                    ejercicios: 0
                };
            }
            actividadPorEstudiante[sesion.estudianteId].sesiones++;
            actividadPorEstudiante[sesion.estudianteId].ejercicios += sesion.cantidad;
        });
        
        const masActivo = Object.values(actividadPorEstudiante)
            .sort((a, b) => b.ejercicios - a.ejercicios)[0];
        
        estudianteActivoContainer.innerHTML = `
            <div class="text-center">
                <div class="text-2xl font-bold text-purple-600">${masActivo.nombre}</div>
                <div class="text-sm text-gray-600">${masActivo.ejercicios} ejercicios</div>
            </div>
        `;
    } else {
        estudianteActivoContainer.innerHTML = '<p class="text-gray-500">Sin datos aún</p>';
    }
    
    // Nivel más practicado
    const nivelFavoritoContainer = document.getElementById('nivel-favorito');
    if (ejerciciosHistorial.length > 0) {
        const nivelesCount = {1: 0, 2: 0, 3: 0};
        ejerciciosHistorial.forEach(sesion => {
            nivelesCount[sesion.nivel] += sesion.cantidad;
        });
        
        const nivelFavorito = Object.keys(nivelesCount).reduce((a, b) => 
            nivelesCount[a] > nivelesCount[b] ? a : b
        );
        
        const niveles = ['🟢 Fácil', '🟡 Medio', '🔴 Difícil'];
        nivelFavoritoContainer.innerHTML = `
            <div class="text-center">
                <div class="text-2xl font-bold text-blue-600">${niveles[nivelFavorito - 1]}</div>
                <div class="text-sm text-gray-600">${nivelesCount[nivelFavorito]} ejercicios</div>
            </div>
        `;
    } else {
        nivelFavoritoContainer.innerHTML = '<p class="text-gray-500">Sin datos aún</p>';
    }
    
    console.log('📊 Estadísticas generales actualizadas');
}

// Funciones auxiliares reutilizadas
async function descargarPDF() {
    try {
        mostrarCargando('Generando PDF...');
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
    if (!estudianteSeleccionado) {
        mostrarNotificacion('⚠️ Primero selecciona un estudiante', 'warning');
        return;
    }
    
    try {
        mostrarCargando('Generando cuento matemático...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const cuento = `
            <h4>🌟 La Aventura Matemática de ${estudianteSeleccionado.name}</h4>
            <p>Había una vez un valiente explorador llamado ${estudianteSeleccionado.name} que descubrió un tesoro mágico...</p>
            <p>Para abrir el cofre del tesoro, necesitaba resolver algunas operaciones matemáticas. ¡Cada número correcto hacía brillar una gema!</p>
            <p>Con mucha paciencia y concentración, ${estudianteSeleccionado.name} resolvió todos los ejercicios y encontró el mayor tesoro de todos: ¡el conocimiento matemático!</p>
            <p class="text-center mt-4"><strong>🎉 ¡Felicitaciones ${estudianteSeleccionado.name} por tu dedicación! 🎉</strong></p>
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

function mostrarCargando(mensaje) {
    document.getElementById('loading-text').textContent = mensaje;
    document.getElementById('loading-overlay').classList.remove('hidden');
}

function ocultarCargando() {
    document.getElementById('loading-overlay').classList.add('hidden');
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    const notificacion = document.createElement('div');
    notificacion.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white font-semibold max-w-sm transition-transform transform translate-x-full`;
    
    const colores = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };
    
    notificacion.classList.add(colores[tipo] || colores.info);
    notificacion.textContent = mensaje;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => notificacion.classList.remove('translate-x-full'), 100);
    
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
    console.log('🚪 Cerrando sesión del profesor...');
    
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        // Usar el sistema principal de autenticación si está disponible
        if (window.loginSystem && window.loginSystem.signOut) {
            console.log('🚪 Usando logout del sistema principal...');
            window.loginSystem.signOut();
        } else {
            // Fallback para compatibilidad
            console.log('🚪 Usando logout de fallback...');
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('matemagica-user-profile');
            localStorage.removeItem('matemagica_selected_role');
            window.location.href = '/index.html';
        }
    }
}

// Guardar datos antes de cerrar
window.addEventListener('beforeunload', function() {
    if (estudiantes.length > 0) {
        localStorage.setItem('profesorEstudiantes', JSON.stringify(estudiantes));
    }
    if (ejerciciosHistorial.length > 0) {
        localStorage.setItem('profesorEjerciciosHistorial', JSON.stringify(ejerciciosHistorial));
    }
});

console.log('✅ Dashboard del profesor inicializado completamente');