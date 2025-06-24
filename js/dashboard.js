/**
 * 🧮 MATEMÁGICA - DASHBOARD CURRICULAR 2° BÁSICO
 * Sistema completo integrado con currículum oficial chileno
 * Versión: 4.0 - Compatible con Sistema Unificado - Diciembre 2024
 */

// 🎯 CONFIGURACIÓN GLOBAL - Actualizada para sistema unificado
const DASHBOARD_CONFIG = {
    currentStudent: null,
    currentUnit: 1,
    currentTopic: null,
    exerciseSession: {
        active: false,
        exercises: [],
        currentIndex: 0,
        startTime: null,
        stats: {
            completed: 0,
            correct: 0,
            totalTime: 0
        }
    },
    supabaseClient: null,
    isNewStructure: true,
    useUnifiedSystem: true // ✅ NUEVO: Flag para usar sistema unificado
};

// 🎯 INICIALIZACIÓN DEL DASHBOARD - Compatible con sistema unificado
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando Matemágica Dashboard v4.0 (Sistema Unificado)...');
    
    try {
        // PASO 1: Verificar si estamos en la nueva estructura
        const isNewDashboard = document.getElementById('matematicas-segundo-content') !== null;
        
        if (isNewDashboard) {
            console.log('✅ Nueva estructura detectada, usando sistema unificado');
            await initializeWithUnifiedSystem();
            return;
        }
        
        // PASO 2: Código legacy para compatibilidad
        await initializeSupabase();
        await checkAuthentication();
        await initializeCurriculum();
        await loadStudentProfiles();
        await setupEventListeners();
        await loadDefaultStudent();
        
        console.log('✅ Dashboard inicializado correctamente (modo legacy)');
        
    } catch (error) {
        console.error('❌ Error inicializando dashboard:', error);
        handleInitializationError(error);
    }
});

// ✅ NUEVA FUNCIÓN: Inicializar con sistema unificado
async function initializeWithUnifiedSystem() {
    try {
        console.log('🎯 Inicializando con sistema unificado...');
        
        // Esperar que el sistema unificado esté listo
        await waitForUnifiedSystem();
        
        // Configurar listeners específicos para currículum
        setupCurriculumEventListeners();
        
        // Cargar estudiante actual desde sistema unificado
        await loadCurrentStudentFromUnified();
        
        // Inicializar currículum si estamos en modo matemáticas (esta lógica se moverá a handleHashChange)
        // if (window.location.hash === '#matematicas' || DASHBOARD_CONFIG.currentView === 'matematicas') {
        //     await initializeCurriculum();
        // }

        // Configurar navegación y manejar hash inicial
        setupNavigation();
        
        console.log('✅ Sistema unificado inicializado para dashboard curricular');
        
    } catch (error) {
        console.error('❌ Error en inicialización con sistema unificado:', error);
        // Fallback a modo legacy
        await initializeLegacyMode();
    }
}

// ✅ NUEVA FUNCIÓN: Esperar sistema modular (no unificado)
async function waitForUnifiedSystem() {
    let attempts = 0;
    const maxAttempts = 20;
    
    while (attempts < maxAttempts) {
        // ✅ USAR EL NUEVO SISTEMA MODULAR
        if (window.studentCore && window.studentCore.isInitialized() && 
            window.studentModalSystem && window.studentModalSystem.state.isInitialized) {
            console.log('✅ Sistema modular detectado y listo');
            DASHBOARD_CONFIG.supabaseClient = window.studentCore.state?.supabaseClient;
            return true;
        }
        
        attempts++;
        console.log(`🔍 Esperando sistema modular... ${attempts}/${maxAttempts}`);
        await new Promise(resolve => setTimeout(resolve, 250));
    }
    
    console.warn('⚠️ Timeout esperando sistema modular');
    return false;
}

// ✅ MANEJO DE NAVEGACIÓN POR HASH (VERSIÓN ROBUSTA)
function handleHashChange() {
    const hash = window.location.hash;
    console.log('🔄 Hash changed or page loaded. Hash:', hash);

    const mainArea = document.querySelector('main.flex-1.md\\:ml-64');
    if (!mainArea) {
        console.error("❌ Elemento <main class='flex-1 md:ml-64'> no encontrado. No se puede gestionar la vista.");
        return;
    }

    // HTML base de las secciones principales.
    // El div #topics-grid dentro de #matematicas-segundo-content es crucial para initializeCurriculum.
    const initialDashboardHTML = '<div id="dashboard-content" class="p-6"></div>'; // Contenido se carga dinámicamente o es estático en el HTML original
    const initialMatematicasHTML = '<div id="matematicas-segundo-content" class="hidden"><div id="topics-grid" class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div></div>';

    // Verificar y re-crear contenedores si fueron eliminados por studentProfileManagement
    let dashboardContent = document.getElementById('dashboard-content');
    let matematicasContent = document.getElementById('matematicas-segundo-content');

    if (!dashboardContent || !matematicasContent) {
        console.log('🎨 Restaurando estructura de vistas principales (#dashboard-content, #matematicas-segundo-content) en <main>...');
        // Limpiar <main> de cualquier contenido de studentProfileManagement antes de añadir los divs base.
        // Esto es importante si studentProfileManagement no se renderiza dentro de un contenedor específico
        // que podamos simplemente ocultar/mostrar.
        mainArea.innerHTML = initialDashboardHTML + initialMatematicasHTML;
        dashboardContent = document.getElementById('dashboard-content');
        matematicasContent = document.getElementById('matematicas-segundo-content');
    }

    // Asegurar que los elementos se hayan encontrado o creado
    if (!dashboardContent || !matematicasContent) {
        console.error("❌ Error crítico: No se pudieron encontrar o re-crear los contenedores de vista principal.");
        return;
    }

    // Ocultar todas las secciones principales primero
    dashboardContent.classList.add('hidden');
    matematicasContent.classList.add('hidden');

    // Determinar qué vista mostrar
    if (hash === '#view=dashboard' || hash === '#dashboard' || hash === '') {
        dashboardContent.classList.remove('hidden');
        console.log('🚀 Mostrando vista: Dashboard');
        // Aquí se podría llamar a una función para popular #dashboard-content si es dinámico,
        // por ejemplo, cargar estadísticas o accesos rápidos.
        // Por ahora, se asume que su contenido es estático o se maneja al cargar la página inicialmente.
        // Si #dashboard-content fue recreado, su contenido original del HTML se perdió.
        // Esto podría requerir una función para re-popularlo.
        // Ejemplo: if (dashboardContent.innerHTML === '') loadDashboardWidgets();
    } else if (hash === '#view=mathematics' || hash.startsWith('#matematicas')) {
        matematicasContent.classList.remove('hidden');
        console.log('🚀 Mostrando vista: Matemáticas');
        if (typeof initializeCurriculum === 'function') {
            initializeCurriculum(); // Cargar contenido del currículum en #topics-grid
        }
    } else {
        // Hash desconocido o no especificado para vista, mostrar dashboard por defecto
        dashboardContent.classList.remove('hidden');
        console.log('🚀 Mostrando vista por defecto: Dashboard (hash desconocido o no especificado)');
    }
}

function setupNavigation() {
    const dashboardLink = document.querySelector('a.nav-item[href="#dashboard"]');
    if (dashboardLink) {
        dashboardLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Cambiar el hash dispara 'hashchange' y recarga si es necesario
            window.location.hash = 'view=dashboard';
        });
    } else {
        console.warn('⚠️ Enlace de navegación "Dashboard" no encontrado.');
    }

    const matematicasLink = document.querySelector('.nav-item[data-module="matematicas"]');
    if (matematicasLink) {
        matematicasLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.hash = 'view=mathematics';
        });
    } else {
        console.warn('⚠️ Enlace de navegación "Matemáticas" no encontrado.');
    }

    // Escuchar cambios en el hash
    window.addEventListener('hashchange', handleHashChange);

    // Llamar una vez al cargar la página para procesar el hash inicial
    // Esto es importante si el usuario llega con un hash en la URL
    handleHashChange();
    console.log('✅ Navegación por hash configurada.');
}


// ✅ NUEVA FUNCIÓN: Cargar estudiante desde sistema modular
async function loadCurrentStudentFromUnified() {
    try {
        // ✅ USAR EL NUEVO SISTEMA MODULAR
        if (window.studentCore && window.studentCore.isInitialized()) {
            const currentStudent = window.studentCore.getCurrentStudent();
            if (currentStudent) {
                DASHBOARD_CONFIG.currentStudent = currentStudent;
                console.log('✅ Estudiante cargado desde sistema modular:', currentStudent.name);
                
                // Actualizar display del estudiante
                updateCurrentStudentDisplay();
                return currentStudent;
            }
        }
        
        console.log('📚 No hay estudiante seleccionado en sistema modular');
        return null;
        
    } catch (error) {
        console.error('❌ Error cargando estudiante desde sistema modular:', error);
        return null;
    }
}

// ✅ NUEVA FUNCIÓN: Configurar listeners específicos para currículum
function setupCurriculumEventListeners() {
    try {
        // Listener para cambios de estudiante en sistema unificado
        document.addEventListener('studentChanged', (event) => {
            console.log('👥 Estudiante cambiado en sistema unificado:', event.detail);
            DASHBOARD_CONFIG.currentStudent = event.detail.student;
            updateCurrentStudentDisplay();
        });
        
        // Listener para navegación a matemáticas
        document.addEventListener('navigateToMathematics', (event) => {
            console.log('🧮 Navegando a matemáticas desde sistema unificado');
            if (event.detail.studentData) {
                DASHBOARD_CONFIG.currentStudent = event.detail.studentData;
            }
            initializeCurriculum();
        });
        
        console.log('✅ Event listeners del currículum configurados para sistema unificado');
        
    } catch (error) {
        console.error('❌ Error configurando listeners del currículum:', error);
    }
}

// 🔐 AUTENTICACIÓN Y SUPABASE - Compatible con sistema unificado
async function initializeSupabase() {
    // Si estamos usando sistema unificado, obtener cliente de ahí
    if (DASHBOARD_CONFIG.useUnifiedSystem && window.unifiedStudentSystem) {
        DASHBOARD_CONFIG.supabaseClient = window.unifiedStudentSystem.state?.supabaseClient;
        if (DASHBOARD_CONFIG.supabaseClient) {
            console.log('✅ Cliente Supabase obtenido del sistema unificado');
            return;
        }
    }
    
    // Fallback al método original
    if (typeof window.supabase === 'undefined') {
        console.log('🔄 Supabase no disponible, modo offline activado');
        return;
    }
    
    DASHBOARD_CONFIG.supabaseClient = window.supabase;
    console.log('✅ Supabase conectado (método legacy)');
}

async function checkAuthentication() {
    console.log('🔐 Verificando autenticación - Compatible con sistema unificado');
    
    // 1️⃣ VERIFICAR DATOS LOCALES PRIMERO
    const isAuthenticated = localStorage.getItem('matemagica-authenticated');
    const userProfile = localStorage.getItem('matemagica-user-profile');
    
    console.log('🔍 Estado localStorage:', { isAuthenticated, hasProfile: !!userProfile });
    
    if (isAuthenticated === 'true' && userProfile) {
        try {
            const profile = JSON.parse(userProfile);
            console.log('✅ Usuario autenticado desde localStorage:', profile.email);
            return true;
        } catch (error) {
            console.error('❌ Error parseando perfil de usuario:', error);
        }
    }
    
    // 2️⃣ VERIFICAR SUPABASE COMO SEGUNDA OPCIÓN
    if (DASHBOARD_CONFIG.supabaseClient) {
        try {
            const { data: { session } } = await DASHBOARD_CONFIG.supabaseClient.auth.getSession();
            if (session?.user) {
                console.log('✅ Usuario autenticado desde Supabase:', session.user.email);
                return true;
            }
        } catch (supabaseError) {
            console.error('❌ Error verificando sesión Supabase:', supabaseError);
        }
    }
    
    // 3️⃣ SOLO REDIRIGIR SI NO HAY NINGUNA AUTENTICACIÓN VÁLIDA
    console.log('❌ No se encontró autenticación válida');
    
    // Solo redirigir si no estamos en modo desarrollo
    if (!window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    }
}

// 📚 INICIALIZACIÓN DEL CURRÍCULUM - Compatible con sistema unificado
async function initializeCurriculum() {
    try {
        console.log('📚 Inicializando currículum 2° Básico...');
        
        // Verificar que el currículum esté disponible
        if (typeof CURRICULUM_SEGUNDO_BASICO === 'undefined') {
            console.warn('⚠️ Currículum no cargado, esperando...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            if (typeof CURRICULUM_SEGUNDO_BASICO === 'undefined') {
                throw new Error('Currículum 2° Básico no disponible');
            }
        }
        
        generateUnitNavigation();
        await loadUnit(DASHBOARD_CONFIG.currentUnit);
        
        console.log('✅ Currículum inicializado correctamente');
        
    } catch (error) {
        console.error('❌ Error inicializando currículum:', error);
        showErrorMessage('Error cargando el currículum. Recarga la página.');
    }
}

// 🧭 NAVEGACIÓN DE UNIDADES - COMPATIBLE con sistema unificado
function generateUnitNavigation() {
    console.log('📚 Navegación de unidades iniciada para currículum 2° Básico');
    
    // Verificar que el currículum esté disponible
    if (typeof CURRICULUM_SEGUNDO_BASICO === 'undefined') {
        console.error('❌ CURRICULUM_SEGUNDO_BASICO no está definido');
        return;
    }
    
    // Mostrar unidades disponibles en consola para debug
    Object.entries(CURRICULUM_SEGUNDO_BASICO.unidades).forEach(([key, unidad]) => {
        console.log(`📖 Unidad ${unidad.numero}: ${unidad.titulo} (${Object.keys(unidad.temas).length} temas)`);
    });
    
    console.log('✅ Sistema de navegación curricular listo');
}

// 📖 CARGA DE UNIDADES - Con verificación de elementos DOM
async function loadUnit(unitNumber) {
    try {
        console.log(`📖 Cargando unidad ${unitNumber}...`);
        
        const unidad = obtenerUnidad(unitNumber);
        if (!unidad) {
            throw new Error(`Unidad ${unitNumber} no encontrada`);
        }
        
        DASHBOARD_CONFIG.currentUnit = unitNumber;
        
        // Actualizar header de la unidad
        updateUnitHeader(unidad);
        
        // Generar grid de temas
        generateTopicsGrid(unidad);
        
        // Actualizar navegación
        updateUnitNavigation();
        
        console.log(`✅ Unidad ${unitNumber} cargada: ${unidad.titulo}`);
        
    } catch (error) {
        console.error(`❌ Error cargando unidad ${unitNumber}:`, error);
        showErrorMessage(`Error cargando la unidad ${unitNumber}`);
    }
}

function updateUnitNavigation() {
    document.querySelectorAll('.unit-nav-item').forEach((item, index) => {
        if (index + 1 === DASHBOARD_CONFIG.currentUnit) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// FUNCIÓN CORREGIDA: Verificar elementos antes de actualizar
function updateUnitHeader(unidad) {
    // Solo actualizar si los elementos existen
    const currentUnitName = document.getElementById('current-unit-name');
    if (currentUnitName) {
        currentUnitName.textContent = unidad.titulo;
    }
    
    const unitTitle = document.getElementById('unit-title');
    if (unitTitle) {
        unitTitle.textContent = unidad.titulo;
    }
    
    const unitDescription = document.getElementById('unit-description');
    if (unitDescription) {
        unitDescription.textContent = unidad.descripcion;
    }
    
    // Calcular progreso de la unidad
    const totalTemas = Object.keys(unidad.temas).length;
    const completedTemas = getCompletedTopics(unidad.numero);
    const progressPercent = (completedTemas / totalTemas) * 100;
    
    const unitProgressBar = document.getElementById('unit-progress-bar');
    if (unitProgressBar) {
        unitProgressBar.style.width = `${progressPercent}%`;
    }
    
    const unitProgressText = document.getElementById('unit-progress-text');
    if (unitProgressText) {
        unitProgressText.textContent = `${completedTemas}/${totalTemas} temas completados`;
    }
}

// 🎯 GENERACIÓN DE TEMAS - Con verificación DOM
function generateTopicsGrid(unidad) {
    const grid = document.getElementById('topics-grid');
    if (!grid) {
        console.warn('⚠️ Elemento topics-grid no encontrado');
        return;
    }
    
    grid.innerHTML = '';
    
    Object.entries(unidad.temas).forEach(([temaKey, tema]) => {
        const card = createTopicCard(tema, temaKey, unidad.numero);
        grid.appendChild(card);
    });
}

function createTopicCard(tema, temaKey, unitNumber) {
    const card = document.createElement('div');
    const isCompleted = isTopicCompleted(unitNumber, temaKey);
    const isInProgress = isTopicInProgress(unitNumber, temaKey);
    
    let statusClass = 'bg-white';
    let statusIcon = '📚';
    let statusText = 'No iniciado';
    
    if (isCompleted) {
        statusClass = 'bg-green-50 border-green-200';
        statusIcon = '✅';
        statusText = 'Completado';
    } else if (isInProgress) {
        statusClass = 'bg-blue-50 border-blue-200';
        statusIcon = '🔄';
        statusText = 'En progreso';
    }
    
    card.className = `topic-card ${statusClass} border-2 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300`;
    card.innerHTML = `
        <div class="flex justify-between items-start mb-3">
            <h3 class="font-bold text-gray-800 text-lg">${tema.titulo}</h3>
            <div class="flex items-center space-x-2">
                <span class="text-lg">${statusIcon}</span>
                <span class="text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(statusClass)}">${statusText}</span>
            </div>
        </div>
        
        <p class="text-gray-600 text-sm mb-4">${tema.descripcion}</p>
        
        <div class="mb-4">
            <div class="flex flex-wrap gap-1">
                ${tema.subtemas.map(subtema => 
                    `<span class="subtopic-pill text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">${subtema}</span>`
                ).join('')}
            </div>
        </div>
        
        <div class="flex justify-between items-center text-sm text-gray-500 mb-4">
            <span>⏱️ ${tema.tiempo_sugerido}</span>
            <span class="px-2 py-1 rounded-full ${getDifficultyBadgeClass(tema.dificultad_base)}">
                ${getDifficultyLabel(tema.dificultad_base)}
            </span>
        </div>
        
        <button class="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors">
            ${isCompleted ? '📝 Revisar Tema' : '🚀 Comenzar Tema'}
        </button>
    `;
    
    // Event listener para abrir el tema
    card.addEventListener('click', () => openTopic(unitNumber, temaKey, tema));
    
    return card;
}

function getStatusBadgeClass(status) {
    if (status.includes('green')) return 'bg-green-100 text-green-800';
    if (status.includes('blue')) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-600';
}

function getDifficultyBadgeClass(difficulty) {
    switch (difficulty) {
        case 'facil': return 'bg-green-100 text-green-800';
        case 'medio': return 'bg-yellow-100 text-yellow-800';
        case 'dificil': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-600';
    }
}

function getDifficultyLabel(difficulty) {
    switch (difficulty) {
        case 'facil': return '🟢 Fácil';
        case 'medio': return '🟡 Medio';
        case 'dificil': return '🔴 Difícil';
        default: return '📚 Normal';
    }
}

// Función para abrir modal de estudiante usando sistema modular
function openStudentModal() {
    try {
        // ✅ USAR EL NUEVO SISTEMA MODULAR
        if (window.studentModalSystem && window.studentModalSystem.state.isInitialized) {
            console.log('👥 Abriendo modal usando sistema modular...');
            window.studentModalSystem.openModal('selection');
        } else if (window.studentManager && window.studentManager.openStudentModal) {
            console.log('👥 Usando sistema legacy de estudiantes...');
            window.studentManager.openStudentModal();
        } else {
            console.warn('⚠️ Ningún sistema de estudiantes disponible');
            showErrorToast('Sistema de estudiantes no disponible');
        }
    } catch (error) {
        console.error('❌ Error abriendo modal de estudiante:', error);
        showErrorToast('Error al abrir selector de estudiantes');
    }
}

// Función para actualizar display del estudiante actual
function updateCurrentStudentDisplay() {
    try {
        const student = DASHBOARD_CONFIG.currentStudent;
        const nameElement = document.getElementById('active-student-name'); // ID CORREGIDO
        const avatarElement = document.querySelector('#student-active-display .w-8.h-8'); // Selector más específico para el avatar en el panel
        
        if (student && nameElement) {
            nameElement.textContent = student.name;
            console.log('✅ Display del estudiante actualizado:', student.name);
        }
        
        if (student && avatarElement) {
            // Si el estudiante tiene un campo 'avatar_url' o 'avatar', usarlo.
            // Si no, usar el emoji de género.
            const avatar = student.avatar_url || student.avatar || (student.gender === 'femenino' ? '👧' : (student.gender === 'masculino' ? '👦' : '👤'));
            avatarElement.textContent = avatar;
            
            // Actualizar colores según género
            if (student.gender === 'niña') {
                avatarElement.className = avatarElement.className.replace(/bg-blue-\d+/, 'bg-pink-500');
            } else {
                avatarElement.className = avatarElement.className.replace(/bg-pink-\d+/, 'bg-blue-500');
            }
        }
    } catch (error) {
        console.error('❌ Error actualizando display del estudiante:', error);
    }
}

// ✅ FUNCIONES DE FALLBACK PARA COMPATIBILIDAD

async function initializeLegacyMode() {
    console.log('🔄 Inicializando en modo legacy...');
    try {
        await initializeSupabase();
        await checkAuthentication();
        await loadStudentProfiles();
        await setupEventListeners();
        await loadDefaultStudent();
        console.log('✅ Modo legacy inicializado');
    } catch (error) {
        console.error('❌ Error en modo legacy:', error);
    }
}

async function loadStudentProfiles() {
    // Implementación básica para compatibilidad
    console.log('📚 Cargando perfiles de estudiantes (legacy)...');
}

async function setupEventListeners() {
    // Event listeners básicos
    console.log('✅ Event listeners básicos configurados');
}

async function loadDefaultStudent() {
    // Cargar estudiante por defecto
    console.log('👥 Cargando estudiante por defecto...');
}

// ✅ FUNCIONES AUXILIARES

function handleInitializationError(error) {
    console.error('❌ Error crítico en inicialización:', error);
    showErrorMessage('Error al inicializar el dashboard. Por favor, recarga la página.');
}

function showErrorMessage(message) {
    if (typeof showErrorToast === 'function') {
        showErrorToast(message);
    } else {
        alert(message);
    }
}

function showInfoToast(message) {
    if (typeof showInfoToast === 'function') {
        showInfoToast(message);
    } else {
        console.log('ℹ️', message);
    }
}

function showErrorToast(message) {
    if (typeof showErrorToast === 'function') {
        showErrorToast(message);
    } else {
        console.error('❌', message);
    }
}

function showSuccessToast(message) {
    if (typeof showSuccessToast === 'function') {
        showSuccessToast(message);
    } else {
        console.log('✅', message);
    }
}

// ✅ FUNCIONES DE PROGRESO Y ESTADO - Implementaciones básicas
function isTopicCompleted(unitNumber, topicKey) {
    try {
        const progress = JSON.parse(localStorage.getItem('topic_progress') || '{}');
        return progress[`${unitNumber}_${topicKey}`]?.completed || false;
    } catch (error) {
        console.error('❌ Error verificando tema completado:', error);
        return false;
    }
}

function isTopicInProgress(unitNumber, topicKey) {
    try {
        const progress = JSON.parse(localStorage.getItem('topic_progress') || '{}');
        const topicProgress = progress[`${unitNumber}_${topicKey}`];
        return topicProgress?.started && !topicProgress?.completed;
    } catch (error) {
        console.error('❌ Error verificando tema en progreso:', error);
        return false;
    }
}

function getCompletedTopics(unitNumber) {
    try {
        const progress = JSON.parse(localStorage.getItem('topic_progress') || '{}');
        let completed = 0;
        
        Object.keys(progress).forEach(key => {
            if (key.startsWith(`${unitNumber}_`) && progress[key].completed) {
                completed++;
            }
        });
        
        return completed;
    } catch (error) {
        console.error('❌ Error contando temas completados:', error);
        return 0;
    }
}

function obtenerUnidad(unitNumber) {
    try {
        if (typeof CURRICULUM_SEGUNDO_BASICO === 'undefined') {
            throw new Error('Currículum no disponible');
        }
        
        const unidadKey = `unidad_${unitNumber}`;
        return CURRICULUM_SEGUNDO_BASICO.unidades[unidadKey];
    } catch (error) {
        console.error(`❌ Error obteniendo unidad ${unitNumber}:`, error);
        return null;
    }
}

// ✅ FUNCIÓN GLOBAL PARA NAVEGACIÓN DESDE OTROS MÓDULOS
window.volverAMatematicas = function() {
    try {
        console.log('🔄 Volviendo a matemáticas desde módulo externo...');
        
        // Disparar evento para que otros sistemas sepan que volvimos
        document.dispatchEvent(new CustomEvent('returnToMathematics', {
            detail: { 
                from: 'external_module',
                timestamp: Date.now()
            }
        }));
        
        // Si estamos usando sistema unificado, notificar
        if (window.unifiedStudentSystem) {
            const currentStudent = window.unifiedStudentSystem.getCurrentStudent();
            if (currentStudent) {
                DASHBOARD_CONFIG.currentStudent = currentStudent;
                updateCurrentStudentDisplay();
            }
        }
        
        // Recargar currículum si es necesario
        if (typeof CURRICULUM_SEGUNDO_BASICO !== 'undefined') {
            initializeCurriculum();
        }
        
        console.log('✅ Navegación a matemáticas completada');
        
    } catch (error) {
        console.error('❌ Error volviendo a matemáticas:', error);
        // Fallback: recargar página
        window.location.reload();
    }
};

// ✅ FUNCIONES PLACEHOLDER PARA COMPATIBILIDAD
async function openTopic(unitNumber, topicKey, topicData) {
    console.log(`🎯 Abriendo tema: ${topicData.titulo} (Unidad ${unitNumber})`);
    // Implementación pendiente
}

function generateExercises() {
    console.log('🎲 Generando ejercicios...');
    // Implementación pendiente
}

function downloadPDF() {
    showInfoToast('📄 Función de descarga PDF pendiente de implementación');
}

function createMathStory(exerciseId) {
    showInfoToast('📖 Función de cuentos con IA pendiente de implementación');
}

function updateSessionStats() {
    // Implementación básica de estadísticas
    console.log('📊 Actualizando estadísticas de sesión...');
}

function saveExerciseProgress(exercise) {
    try {
        const progress = JSON.parse(localStorage.getItem('exercise_progress') || '[]');
        progress.push({
            id: exercise.id,
            completed: exercise.completed,
            correct: exercise.correct,
            timestamp: Date.now()
        });
        localStorage.setItem('exercise_progress', JSON.stringify(progress));
        console.log('💾 Progreso de ejercicio guardado');
    } catch (error) {
        console.error('❌ Error guardando progreso:', error);
    }
}

// ✅ EXPORTAR FUNCIONES PRINCIPALES PARA COMPATIBILIDAD GLOBAL
window.DASHBOARD_CONFIG = DASHBOARD_CONFIG;
window.openStudentModal = openStudentModal;
window.updateCurrentStudentDisplay = updateCurrentStudentDisplay;
window.initializeCurriculum = initializeCurriculum;
window.loadUnit = loadUnit;

console.log('✅ Dashboard.js v4.0 cargado - Compatible con Sistema Unificado');
