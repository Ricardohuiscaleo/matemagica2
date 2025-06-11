/**
 * 🧮 MATEMÁGICA - DASHBOARD CURRICULAR 2° BÁSICO
 * Sistema completo integrado con currículum oficial chileno
 * Versión: 4.0 - Compatible con nueva estructura SaaS - Diciembre 2024
 */

// 🎯 CONFIGURACIÓN GLOBAL - Actualizada para nueva estructura
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
    supabase: null,
    isNewStructure: true // Flag para identificar nueva estructura
};

// 🎯 INICIALIZACIÓN DEL DASHBOARD - Adaptada para SaaS
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando Matemágica Dashboard v4.0 (SaaS Compatible)...');
    
    try {
        // Verificar si estamos en la nueva estructura
        const isNewDashboard = document.getElementById('matematicas-segundo-content') !== null;
        
        if (isNewDashboard) {
            console.log('✅ Nueva estructura SaaS detectada - Modo híbrido activado');
            return; // La nueva estructura maneja su propia inicialización
        }
        
        // Código legacy para estructura antigua
        await initializeSupabase();
        await checkAuthentication();
        await initializeCurriculum();
        await loadStudentProfiles();
        await setupEventListeners();
        await loadDefaultStudent();
        
        console.log('✅ Dashboard inicializado correctamente');
        
    } catch (error) {
        console.error('❌ Error inicializando dashboard:', error);
        // Solo mostrar error si no estamos en la nueva estructura
        if (!document.getElementById('matematicas-segundo-content')) {
            showErrorMessage('Error al cargar la aplicación. Por favor, recarga la página.');
        }
    }
});

// 🔐 AUTENTICACIÓN Y SUPABASE
async function initializeSupabase() {
    if (typeof window.supabase === 'undefined') {
        console.log('🔄 Supabase no disponible, modo offline activado');
        return;
    }
    
    DASHBOARD_CONFIG.supabase = window.supabase;
    console.log('✅ Supabase conectado');
}

async function checkAuthentication() {
    // Si no hay Supabase, usar modo local
    if (!DASHBOARD_CONFIG.supabase) {
        const localUser = localStorage.getItem('matematica_user');
        if (!localUser) {
            // Crear usuario por defecto
            const defaultUser = {
                id: 'local-user',
                email: 'usuario@local.com',
                full_name: 'Usuario Local',
                user_type: 'apoderado'
            };
            localStorage.setItem('matematica_user', JSON.stringify(defaultUser));
        }
        return;
    }
    
    // Verificar autenticación con Supabase
    const { data: { user } } = await DASHBOARD_CONFIG.supabase.auth.getUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    // Actualizar UI con nombre del usuario solo si el elemento existe
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
        userNameElement.textContent = user.user_metadata?.full_name || user.email;
    }
}

// 📚 INICIALIZACIÓN DEL CURRÍCULUM - Adaptada para compatibilidad
async function initializeCurriculum() {
    try {
        console.log('📚 Cargando currículum de 2° Básico...');
        
        // Generar navegación de unidades solo si elementos existen
        generateUnitNavigation();
        
        // Cargar unidad por defecto solo en estructura antigua
        if (!DASHBOARD_CONFIG.isNewStructure) {
            await loadUnit(1);
        }
        
        console.log('✅ Currículum cargado correctamente');
        
    } catch (error) {
        console.error('❌ Error cargando currículum:', error);
        throw error;
    }
}

// 🧭 NAVEGACIÓN DE UNIDADES - COMPATIBLE con ambas estructuras
function generateUnitNavigation() {
    console.log('📚 Navegación de unidades iniciada para currículum 2° Básico');
    
    // Verificar que el currículum esté disponible
    if (typeof CURRICULUM_SEGUNDO_BASICO === 'undefined') {
        console.warn('⚠️ Currículum no disponible');
        return;
    }
    
    // Mostrar unidades disponibles en consola para debug
    Object.entries(CURRICULUM_SEGUNDO_BASICO.unidades).forEach(([key, unidad]) => {
        console.log(`📖 ${unidad.icono} Unidad ${unidad.numero}: ${unidad.titulo}`);
    });
    
    console.log('✅ Sistema de navegación curricular listo');
}

// 📖 CARGA DE UNIDADES - Con verificación de elementos DOM
async function loadUnit(unitNumber) {
    try {
        console.log(`📖 Cargando Unidad ${unitNumber}...`);
        
        const unidad = obtenerUnidad(unitNumber);
        if (!unidad) {
            showErrorMessage('Unidad no encontrada');
            return;
        }
        
        // Actualizar estado
        DASHBOARD_CONFIG.currentUnit = unitNumber;
        DASHBOARD_CONFIG.currentTopic = null;
        
        // Actualizar UI solo si los elementos existen
        updateUnitNavigation();
        updateUnitHeader(unidad);
        generateTopicsGrid(unidad);
        
        // Ocultar/mostrar secciones solo si existen
        const exercisesSection = document.getElementById('exercises-section');
        const unitContent = document.getElementById('unit-content');
        
        if (exercisesSection) exercisesSection.classList.add('hidden');
        if (unitContent) unitContent.classList.remove('hidden');
        
        console.log(`✅ Unidad ${unitNumber} cargada correctamente`);
        
    } catch (error) {
        console.error('❌ Error cargando unidad:', error);
        showErrorMessage('Error al cargar la unidad');
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
        currentUnitName.textContent = `Unidad ${unidad.numero}`;
    }
    
    const unitTitle = document.getElementById('unit-title');
    if (unitTitle) {
        unitTitle.textContent = `${unidad.icono} ${unidad.titulo}`;
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
        unitProgressText.textContent = `${completedTemas} de ${totalTemas} temas completados`;
    }
}

// 🎯 GENERACIÓN DE TEMAS - Con verificación DOM
function generateTopicsGrid(unidad) {
    const grid = document.getElementById('topics-grid');
    if (!grid) {
        console.warn('⚠️ Grid de temas no encontrado en DOM');
        return;
    }
    
    grid.innerHTML = '';
    
    Object.entries(unidad.temas).forEach(([temaKey, tema]) => {
        const topicCard = createTopicCard(tema, temaKey, unidad.numero);
        grid.appendChild(topicCard);
    });
}

function createTopicCard(tema, temaKey, unitNumber) {
    const card = document.createElement('div');
    const isCompleted = isTopicCompleted(unitNumber, temaKey);
    const isInProgress = isTopicInProgress(unitNumber, temaKey);
    
    let statusClass = '';
    let statusIcon = '';
    let statusText = '';
    
    if (isCompleted) {
        statusClass = 'completed';
        statusIcon = '✅';
        statusText = 'Completado';
    } else if (isInProgress) {
        statusClass = 'in-progress';
        statusIcon = '⏳';
        statusText = 'En Progreso';
    } else {
        statusIcon = '🎯';
        statusText = 'Disponible';
    }
    
    card.className = `topic-card ${statusClass}`;
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
                    `<span class="subtopic-pill">${subtema}</span>`
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
    switch (status) {
        case 'completed': return 'bg-green-100 text-green-800';
        case 'in-progress': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-blue-100 text-blue-800';
    }
}

function getDifficultyBadgeClass(difficulty) {
    switch (difficulty) {
        case 'facil': return 'bg-green-100 text-green-800';
        case 'medio': return 'bg-yellow-100 text-yellow-800';
        case 'dificil': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

function getDifficultyLabel(difficulty) {
    switch (difficulty) {
        case 'facil': return '🟢 Fácil';
        case 'medio': return '🟡 Medio';
        case 'dificil': return '🔴 Difícil';
        default: return 'Normal';
    }
}

// 🎯 APERTURA DE TEMAS - Con verificación DOM
async function openTopic(unitNumber, topicKey, topicData) {
    try {
        console.log(`🎯 Abriendo tema: ${topicData.titulo}`);
        
        // Actualizar estado
        DASHBOARD_CONFIG.currentTopic = {
            unit: unitNumber,
            key: topicKey,
            data: topicData
        };
        
        // Mostrar sección de ejercicios solo si existe
        const unitContent = document.getElementById('unit-content');
        const exercisesSection = document.getElementById('exercises-section');
        
        if (unitContent) unitContent.classList.add('hidden');
        if (exercisesSection) exercisesSection.classList.remove('hidden');
        
        // Actualizar header del tema
        updateTopicHeader(topicData);
        
        // Mostrar recomendaciones pedagógicas
        showPedagogicalRecommendations(topicData);
        
        // Limpiar ejercicios anteriores
        clearExercisesContent();
        
        console.log(`✅ Tema ${topicData.titulo} abierto correctamente`);
        
    } catch (error) {
        console.error('❌ Error abriendo tema:', error);
        showErrorMessage('Error al abrir el tema');
    }
}

function updateTopicHeader(topicData) {
    const topicTitle = document.getElementById('topic-title');
    if (topicTitle) {
        topicTitle.textContent = topicData.titulo;
    }
    
    const topicDescription = document.getElementById('topic-description');
    if (topicDescription) {
        topicDescription.textContent = topicData.descripcion;
    }
    
    // Actualizar subtemas
    const subtopicsContainer = document.getElementById('subtopics-pills');
    if (subtopicsContainer) {
        subtopicsContainer.innerHTML = '';
        
        topicData.subtemas.forEach(subtema => {
            const pill = document.createElement('span');
            pill.className = 'subtopic-pill';
            pill.textContent = subtema;
            subtopicsContainer.appendChild(pill);
        });
    }
}

function showPedagogicalRecommendations(topicData) {
    const recsSection = document.getElementById('pedagogical-recommendations');
    if (!recsSection) return;
    
    recsSection.classList.remove('hidden');
    
    // Llenar recomendaciones solo si los elementos existen
    const recMethodology = document.getElementById('rec-methodology');
    if (recMethodology) {
        recMethodology.textContent = 
            `${topicData.metodologia.concreto} → ${topicData.metodologia.pictórico} → ${topicData.metodologia.simbólico}`;
    }
    
    const recTime = document.getElementById('rec-time');
    if (recTime) {
        recTime.textContent = topicData.tiempo_sugerido;
    }
    
    const recMaterials = document.getElementById('rec-materials');
    if (recMaterials) {
        recMaterials.textContent = topicData.materiales.join(', ');
    }
    
    const recEvaluation = document.getElementById('rec-evaluation');
    if (recEvaluation) {
        recEvaluation.textContent = 
            `Evaluación ${CURRICULUM_SEGUNDO_BASICO.configuracion_pedagogica.metodologia_base}`;
    }
}

function clearExercisesContent() {
    const exercisesContent = document.getElementById('exercises-content');
    const exercisesLoader = document.getElementById('exercises-loader');
    const sessionStats = document.getElementById('session-stats');
    
    if (exercisesContent) exercisesContent.classList.add('hidden');
    if (exercisesLoader) exercisesLoader.classList.add('hidden');
    if (sessionStats) sessionStats.classList.add('hidden');
}

// 🎲 GENERACIÓN DE EJERCICIOS
async function generateExercises() {
    if (!DASHBOARD_CONFIG.currentTopic) {
        showErrorMessage('No hay tema seleccionado');
        return;
    }
    
    try {
        // Mostrar loader
        document.getElementById('exercises-loader').classList.remove('hidden');
        
        // Obtener configuración
        const difficulty = document.getElementById('difficulty-select').value;
        const quantity = parseInt(document.getElementById('quantity-select').value);
        
        console.log(`🎲 Generando ${quantity} ejercicios de nivel ${difficulty}...`);
        
        // Obtener configuración curricular
        const config = generarConfiguracionEjercicios(
            DASHBOARD_CONFIG.currentTopic.unit,
            DASHBOARD_CONFIG.currentTopic.key,
            difficulty
        );
        
        if (!config) {
            throw new Error('No se pudo obtener configuración del tema');
        }
        
        // Generar ejercicios según el tipo de tema
        let exercises = [];
        const topicId = DASHBOARD_CONFIG.currentTopic.data.id;
        
        switch (topicId) {
            case 'adicion-sustraccion':
                exercises = await generateMathExercises(config, quantity, difficulty);
                break;
            case 'calculo-mental':
                exercises = await generateMentalMathExercises(config, quantity, difficulty);
                break;
            case 'comparacion-orden':
                exercises = await generateComparisonExercises(config, quantity, difficulty);
                break;
            case 'conteo-agrupacion':
                exercises = await generateCountingExercises(config, quantity, difficulty);
                break;
            default:
                exercises = await generateGenericExercises(config, quantity, difficulty);
        }
        
        // Guardar ejercicios en sesión
        DASHBOARD_CONFIG.exerciseSession = {
            active: true,
            exercises: exercises,
            currentIndex: 0,
            startTime: Date.now(),
            stats: {
                completed: 0,
                correct: 0,
                totalTime: 0
            }
        };
        
        // Mostrar ejercicios
        displayExercises(exercises);
        
        console.log(`✅ ${exercises.length} ejercicios generados correctamente`);
        
    } catch (error) {
        console.error('❌ Error generando ejercicios:', error);
        showErrorMessage('Error al generar ejercicios. Inténtalo de nuevo.');
    } finally {
        document.getElementById('exercises-loader').classList.add('hidden');
    }
}

// 🧮 GENERADORES DE EJERCICIOS ESPECÍFICOS - VERSIÓN CORREGIDA
async function generateMathExercises(config, quantity, difficulty) {
    console.log(`🧮 Generando EXACTAMENTE ${quantity} ejercicios matemáticos...`);
    
    try {
        // Obtener tipo de operación seleccionada
        const operationTypeElement = document.getElementById('operation-type-select');
        const operationType = operationTypeElement ? operationTypeElement.value : 'ambos';
        
        console.log(`🎯 Tipo: ${operationType}, Dificultad: ${difficulty}, Cantidad EXACTA: ${quantity}`);
        
        // ✅ USAR GEMINI AI con cantidad EXACTA
        if (window.geminiAI && window.geminiAI.configured) {
            console.log('🎯 Usando Google Gemini AI para ejercicios personalizados');
            
            // Mapear dificultad del dashboard a niveles de Gemini
            const difficultyMap = {
                'facil': 1,
                'medio': 2, 
                'dificil': 3
            };
            const geminiLevel = difficultyMap[difficulty] || 2;
            
            let geminiExercises = [];
            
            // ✅ GENERAR SOLO LA CANTIDAD EXACTA SOLICITADA
            switch (operationType) {
                case 'suma':
                    console.log(`➕ Generando EXACTAMENTE ${quantity} sumas con IA`);
                    geminiExercises = await window.geminiAI.generateAdditions(geminiLevel, quantity);
                    break;
                case 'resta':
                    console.log(`➖ Generando EXACTAMENTE ${quantity} restas con IA`);
                    geminiExercises = await window.geminiAI.generateSubtractions(geminiLevel, quantity);
                    break;
                case 'ambos':
                default:
                    console.log(`➕➖ Generando EXACTAMENTE ${quantity} ejercicios mixtos con IA`);
                    // ✅ CALCULAR DISTRIBUCIÓN EXACTA
                    const sumasCount = Math.ceil(quantity / 2);
                    const restasCount = quantity - sumasCount;
                    
                    console.log(`🔢 Distribución: ${sumasCount} sumas + ${restasCount} restas = ${quantity} total`);
                    
                    // ✅ GENERAR CANTIDADES EXACTAS
                    const [sums, subs] = await Promise.all([
                        window.geminiAI.generateAdditions(geminiLevel, sumasCount),
                        window.geminiAI.generateSubtractions(geminiLevel, restasCount)
                    ]);
                    
                    // ✅ COMBINAR SIN EXCEDER LA CANTIDAD
                    geminiExercises = [...sums, ...subs];
                    
                    // ✅ MEZCLAR ORDEN ALEATORIAMENTE
                    geminiExercises.sort(() => Math.random() - 0.5);
                    break;
            }
            
            // ✅ VERIFICAR QUE TENEMOS LA CANTIDAD EXACTA
            if (geminiExercises.length !== quantity) {
                console.warn(`⚠️ IA generó ${geminiExercises.length} pero se solicitaron ${quantity}. Ajustando...`);
                geminiExercises = geminiExercises.slice(0, quantity);
            }
            
            // Convertir a formato VERTICAL del dashboard
            const exercises = [];
            for (let i = 0; i < geminiExercises.length; i++) {
                const ex = geminiExercises[i];
                const operation = ex.operation === 'addition' ? '+' : '-';
                const answer = ex.operation === 'addition' ? ex.num1 + ex.num2 : ex.num1 - ex.num2;
                
                exercises.push({
                    id: i + 1,
                    type: 'math_operation_vertical',
                    num1: ex.num1,
                    num2: ex.num2,
                    operation: operation,
                    answer: answer,
                    difficulty: difficulty,
                    completed: false,
                    correct: null,
                    userAnswer: null,
                    timeSpent: 0,
                    generatedWith: 'gemini-ai',
                    showDUHelp: difficulty === 'facil' // Mostrar ayuda D|U solo en fácil
                });
            }
            
            console.log(`✅ ${exercises.length} ejercicios generados EXACTOS con Gemini AI`);
            return exercises;
        }
    } catch (error) {
        console.warn('⚠️ Error con Gemini AI, usando generador local:', error);
    }
    
    // 📚 FALLBACK: Generador local offline
    console.log(`📚 Usando generador local offline para ${quantity} ejercicios`);
    
    const { ejercicios_tipo } = config;
    const ranges = ejercicios_tipo.rangos;
    const exercises = [];
    
    for (let i = 0; i < quantity; i++) {
        let num1, num2, operation, answer;
        
        // Generar según tipo de operación
        const operationTypeElement = document.getElementById('operation-type-select');
        const operationType = operationTypeElement ? operationTypeElement.value : 'ambos';
        
        switch (operationType) {
            case 'suma':
                num1 = Math.floor(Math.random() * (ranges.max - ranges.min + 1)) + ranges.min;
                num2 = Math.floor(Math.random() * (ranges.max - ranges.min + 1)) + ranges.min;
                operation = '+';
                answer = num1 + num2;
                break;
            case 'resta':
                // Generar números para que el resultado no sea negativo
                const larger = Math.floor(Math.random() * (ranges.max - ranges.min + 1)) + ranges.min;
                const smaller = Math.floor(Math.random() * larger) + 1;
                num1 = larger;
                num2 = smaller;
                operation = '-';
                answer = num1 - num2;
                break;
            case 'ambos':
            default:
                const isAddition = Math.random() > 0.5;
                if (isAddition) {
                    num1 = Math.floor(Math.random() * (ranges.max - ranges.min + 1)) + ranges.min;
                    num2 = Math.floor(Math.random() * (ranges.max - ranges.min + 1)) + ranges.min;
                    operation = '+';
                    answer = num1 + num2;
                } else {
                    const larger = Math.floor(Math.random() * (ranges.max - ranges.min + 1)) + ranges.min;
                    const smaller = Math.floor(Math.random() * larger) + 1;
                    num1 = larger;
                    num2 = smaller;
                    operation = '-';
                    answer = num1 - num2;
                }
                break;
        }
        
        exercises.push({
            id: i + 1,
            type: 'math_operation_vertical',
            num1: num1,
            num2: num2,
            operation: operation,
            answer: answer,
            difficulty: difficulty,
            completed: false,
            correct: null,
            userAnswer: null,
            timeSpent: 0,
            generatedWith: 'local',
            showDUHelp: difficulty === 'facil' // Mostrar ayuda D|U solo en fácil
        });
    }
    
    console.log(`✅ ${exercises.length} ejercicios generados localmente`);
    return exercises;
}

async function generateMentalMathExercises(config, quantity, difficulty) {
    const exercises = [];
    const maxNum = difficulty === 'facil' ? 10 : difficulty === 'medio' ? 15 : 20;
    
    for (let i = 0; i < quantity; i++) {
        const num1 = Math.floor(Math.random() * maxNum) + 1;
        const num2 = Math.floor(Math.random() * maxNum) + 1;
        
        const strategies = ['dobles', 'casi_dobles', 'conteo', 'descomposicion'];
        const strategy = strategies[Math.floor(Math.random() * strategies.length)];
        
        let question, answer, hint;
        
        switch (strategy) {
            case 'dobles':
                const double = Math.floor(Math.random() * 10) + 1;
                question = `${double} + ${double} = ?`;
                answer = double * 2;
                hint = `💡 Piensa en los dobles: ${double} × 2`;
                break;
            case 'casi_dobles':
                const base = Math.floor(Math.random() * 9) + 1;
                question = `${base} + ${base + 1} = ?`;
                answer = base + (base + 1);
                hint = `💡 Casi dobles: ${base} + ${base} + 1`;
                break;
            default:
                const isAdd = Math.random() > 0.5;
                if (isAdd) {
                    question = `${num1} + ${num2} = ?`;
                    answer = num1 + num2;
                } else {
                    const larger = Math.max(num1, num2);
                    const smaller = Math.min(num1, num2);
                    question = `${larger} - ${smaller} = ?`;
                    answer = larger - smaller;
                }
                hint = `💡 Usa tu estrategia favorita`;
        }
        
        exercises.push({
            id: i + 1,
            type: 'mental_math',
            question: question,
            answer: answer,
            hint: hint,
            strategy: strategy,
            difficulty: difficulty,
            completed: false,
            correct: null,
            userAnswer: null,
            timeSpent: 0
        });
    }
    
    return exercises;
}

async function generateComparisonExercises(config, quantity, difficulty) {
    const exercises = [];
    const { ejercicios_tipo } = config;
    const ranges = ejercicios_tipo.rangos;
    
    for (let i = 0; i < quantity; i++) {
        const num1 = Math.floor(Math.random() * (ranges.max - ranges.min + 1)) + ranges.min;
        const num2 = Math.floor(Math.random() * (ranges.max - ranges.min + 1)) + ranges.min;
        
        let question, answer;
        const comparisonType = Math.random();
        
        if (comparisonType < 0.33) {
            question = `¿Cuál es mayor: ${num1} o ${num2}?`;
            answer = Math.max(num1, num2).toString();
        } else if (comparisonType < 0.66) {
            question = `Completa: ${num1} ___ ${num2}`;
            if (num1 > num2) answer = '>';
            else if (num1 < num2) answer = '<';
            else answer = '=';
        } else {
            const numbers = [num1, num2, Math.floor(Math.random() * ranges.max) + ranges.min];
            numbers.sort((a, b) => Math.random() - 0.5); // Mezclar
            question = `Ordena de menor a mayor: ${numbers.join(', ')}`;
            answer = numbers.sort((a, b) => a - b).join(', ');
        }
        
        exercises.push({
            id: i + 1,
            type: 'comparison',
            question: question,
            answer: answer,
            difficulty: difficulty,
            completed: false,
            correct: null,
            userAnswer: null,
            timeSpent: 0
        });
    }
    
    return exercises;
}

async function generateCountingExercises(config, quantity, difficulty) {
    const exercises = [];
    const increments = [2, 5, 10];
    
    for (let i = 0; i < quantity; i++) {
        const increment = increments[Math.floor(Math.random() * increments.length)];
        const start = Math.floor(Math.random() * 20);
        const steps = Math.floor(Math.random() * 5) + 3;
        
        const sequence = [];
        for (let j = 0; j < steps; j++) {
            sequence.push(start + (j * increment));
        }
        
        const questionTypes = ['continue', 'missing', 'count_groups'];
        const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        
        let question, answer;
        
        switch (questionType) {
            case 'continue':
                const partial = sequence.slice(0, -1);
                question = `Continúa la secuencia: ${partial.join(', ')}, ___`;
                answer = sequence[sequence.length - 1].toString();
                break;
            case 'missing':
                const missingIndex = Math.floor(sequence.length / 2);
                const withMissing = [...sequence];
                withMissing[missingIndex] = '___';
                question = `¿Qué número falta? ${withMissing.join(', ')}`;
                answer = sequence[missingIndex].toString();
                break;
            case 'count_groups':
                const total = increment * Math.floor(Math.random() * 6 + 2);
                question = `Si tienes ${total} objetos y los agrupas de ${increment} en ${increment}, ¿cuántos grupos completos formas?`;
                answer = Math.floor(total / increment).toString();
                break;
        }
        
        exercises.push({
            id: i + 1,
            type: 'counting',
            question: question,
            answer: answer,
            increment: increment,
            difficulty: difficulty,
            completed: false,
            correct: null,
            userAnswer: null,
            timeSpent: 0
        });
    }
    
    return exercises;
}

async function generateGenericExercises(config, quantity, difficulty) {
    // Ejercicios genéricos para temas no implementados específicamente
    const exercises = [];
    
    for (let i = 0; i < quantity; i++) {
        exercises.push({
            id: i + 1,
            type: 'generic',
            question: `Ejercicio ${i + 1} de ${DASHBOARD_CONFIG.currentTopic.data.titulo}`,
            answer: 'Respuesta correcta',
            difficulty: difficulty,
            completed: false,
            correct: null,
            userAnswer: null,
            timeSpent: 0,
            note: 'Este tipo de ejercicio estará disponible próximamente'
        });
    }
    
    return exercises;
}

// 📺 VISUALIZACIÓN DE EJERCICIOS
function displayExercises(exercises) {
    const grid = document.getElementById('exercises-grid');
    grid.innerHTML = '';
    
    exercises.forEach((exercise, index) => {
        const exerciseCard = createExerciseCard(exercise, index);
        grid.appendChild(exerciseCard);
    });
    
    // Mostrar contenido de ejercicios
    const exercisesContent = document.getElementById('exercises-content');
    const sessionStats = document.getElementById('session-stats');
    
    if (exercisesContent) exercisesContent.classList.remove('hidden');
    if (sessionStats) sessionStats.classList.remove('hidden');
    
    // Actualizar estadísticas
    updateSessionStats();
}

function createExerciseCard(exercise, index) {
    const card = document.createElement('div');
    card.className = `exercise-item ${exercise.completed ? (exercise.correct ? 'completed' : 'incorrect') : ''}`;
    card.dataset.exerciseId = exercise.id;
    
    let content = '';
    
    if (exercise.type === 'generic' && exercise.note) {
        content = `
            <div class="text-center">
                <div class="text-gray-400 text-3xl mb-2">🚧</div>
                <div class="font-medium text-gray-700 mb-2">${exercise.question}</div>
                <div class="text-xs text-gray-500 mb-3">${exercise.note}</div>
                <button class="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed" disabled>
                    Próximamente
                </button>
            </div>
        `;
    } else if (exercise.type === 'math_operation_vertical') {
        // 📊 SISTEMA VERTICAL DE OPERACIONES
        content = `
            <div class="exercise-number text-sm font-bold text-gray-500 mb-2">Ejercicio ${exercise.id}</div>
            
            <!-- Operación Vertical -->
            <div class="vertical-operation-container mb-4">
                ${exercise.showDUHelp ? `
                    <!-- Ayuda D|U para nivel fácil -->
                    <div class="du-helper mb-2 text-xs text-blue-600 font-medium">
                        <div class="flex justify-center space-x-8">
                            <span>D</span>
                            <span>U</span>
                        </div>
                        <div class="border-b border-blue-300 mt-1"></div>
                    </div>
                ` : ''}
                
                <div class="vertical-operation bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
                    <!-- Primera fila: primer número -->
                    <div class="operation-row flex justify-center items-center mb-1">
                        ${exercise.showDUHelp ? `
                            <div class="du-breakdown flex space-x-4 font-mono text-lg">
                                <span class="decena text-blue-700 font-bold">${Math.floor(exercise.num1 / 10)}</span>
                                <span class="unidad text-blue-700 font-bold">${exercise.num1 % 10}</span>
                            </div>
                        ` : `
                            <span class="number-display font-mono text-xl font-bold text-blue-800">${exercise.num1}</span>
                        `}
                    </div>
                    
                    <!-- Segunda fila: operador y segundo número -->
                    <div class="operation-row flex justify-center items-center mb-2">
                        <span class="operator font-mono text-xl font-bold text-orange-600 mr-2">${exercise.operation}</span>
                        ${exercise.showDUHelp ? `
                            <div class="du-breakdown flex space-x-4 font-mono text-lg">
                                <span class="decena text-blue-700 font-bold">${Math.floor(exercise.num2 / 10)}</span>
                                <span class="unidad text-blue-700 font-bold">${exercise.num2 % 10}</span>
                            </div>
                        ` : `
                            <span class="number-display font-mono text-xl font-bold text-blue-800">${exercise.num2}</span>
                        `}
                    </div>
                    
                    <!-- Línea divisoria -->
                    <div class="operation-line border-t-2 border-gray-400 mb-2"></div>
                    
                    <!-- Tercera fila: área de respuesta -->
                    <div class="operation-result">
                        ${exercise.showDUHelp ? `
                            <div class="du-answer-breakdown flex justify-center space-x-4">
                                <input type="number" 
                                       class="decena-input w-8 h-10 text-center border border-gray-300 rounded font-mono text-lg font-bold bg-yellow-50"
                                       placeholder="D"
                                       min="0" max="9"
                                       data-exercise-id="${exercise.id}"
                                       data-digit="decena"
                                       ${exercise.completed ? 'readonly' : ''}>
                                <input type="number" 
                                       class="unidad-input w-8 h-10 text-center border border-gray-300 rounded font-mono text-lg font-bold bg-yellow-50"
                                       placeholder="U"
                                       min="0" max="9"
                                       data-exercise-id="${exercise.id}"
                                       data-digit="unidad"
                                       ${exercise.completed ? 'readonly' : ''}>
                            </div>
                        ` : `
                            <input type="number" 
                                   class="answer-input w-20 h-10 text-center border-2 border-yellow-400 rounded-lg font-mono text-xl font-bold bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                   placeholder="?"
                                   data-exercise-id="${exercise.id}"
                                   ${exercise.completed ? 'readonly' : ''}>
                        `}
                    </div>
                </div>
            </div>
            
            <!-- Botones de acción -->
            <div class="exercise-actions space-y-2">
                <button class="check-answer-btn w-full py-2 px-4 ${exercise.completed ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white font-medium rounded-lg transition-colors"
                        data-exercise-id="${exercise.id}"
                        ${exercise.completed ? 'disabled' : ''}>
                    ${exercise.completed ? (exercise.correct ? '✅ Correcto' : '❌ Incorrecto') : '✓ Comprobar'}
                </button>
                
                ${exercise.generatedWith === 'gemini-ai' && !exercise.completed ? `
                    <button class="create-story-btn w-full py-2 px-4 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors"
                            data-exercise-id="${exercise.id}">
                        📖 Crear Cuento con IA
                    </button>
                ` : ''}
            </div>
            
            ${exercise.completed && !exercise.correct ? 
                `<div class="correct-answer text-sm text-green-600 mt-2 text-center">✅ Respuesta correcta: <strong>${exercise.answer}</strong></div>` 
                : ''
            }
        `;
    } else {
        // Ejercicios no matemáticos (mantener original)
        content = `
            <div class="exercise-number text-sm font-bold text-gray-500 mb-2">Ejercicio ${exercise.id}</div>
            <div class="exercise-question text-lg font-medium text-gray-800 mb-4">${exercise.question}</div>
            
            ${exercise.hint ? `<div class="exercise-hint text-sm text-blue-600 mb-3">${exercise.hint}</div>` : ''}
            
            <div class="exercise-input mb-3">
                <input type="text" 
                       class="answer-input w-full px-3 py-2 border border-gray-300 rounded-md text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                       placeholder="Tu respuesta..."
                       data-exercise-id="${exercise.id}"
                       ${exercise.completed ? 'readonly' : ''}>
            </div>
            
            <button class="check-answer-btn w-full py-2 px-4 ${exercise.completed ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white font-medium rounded-lg transition-colors"
                    data-exercise-id="${exercise.id}"
                    ${exercise.completed ? 'disabled' : ''}>
                ${exercise.completed ? (exercise.correct ? '✅ Correcto' : '❌ Incorrecto') : '✓ Comprobar'}
            </button>
            
            ${exercise.completed && !exercise.correct ? 
                `<div class="correct-answer text-sm text-green-600 mt-2">Respuesta correcta: ${exercise.answer}</div>` 
                : ''
            }
        `;
    }
    
    card.innerHTML = content;
    
    // Agregar event listeners
    if (exercise.type !== 'generic' || !exercise.note) {
        const checkButton = card.querySelector('.check-answer-btn');
        const storyButton = card.querySelector('.create-story-btn');
        
        if (checkButton) {
            checkButton.addEventListener('click', () => {
                checkAnswer(exercise.id);
            });
        }
        
        if (storyButton) {
            storyButton.addEventListener('click', () => {
                createMathStory(exercise.id);
            });
        }
        
        // Event listeners para inputs
        if (exercise.type === 'math_operation_vertical') {
            if (exercise.showDUHelp) {
                // Inputs de decena y unidad
                const decenaInput = card.querySelector('.decena-input');
                const unidadInput = card.querySelector('.unidad-input');
                
                if (decenaInput && unidadInput) {
                    [decenaInput, unidadInput].forEach(input => {
                        input.addEventListener('keypress', (e) => {
                            if (e.key === 'Enter') {
                                checkAnswer(exercise.id);
                            }
                        });
                    });
                }
            } else {
                // Input normal
                const input = card.querySelector('.answer-input');
                if (input) {
                    input.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            checkAnswer(exercise.id);
                        }
                    });
                }
            }
        } else {
            // Inputs de otros tipos de ejercicios
            const input = card.querySelector('.answer-input');
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        checkAnswer(exercise.id);
                    }
                });
            }
        }
    }
    
    return card;
}

// ✅ VERIFICACIÓN DE RESPUESTAS (actualizada para sistema vertical)
async function checkAnswer(exerciseId) {
    const exercise = DASHBOARD_CONFIG.exerciseSession.exercises.find(ex => ex.id === exerciseId);
    if (!exercise || exercise.completed) return;
    
    let userAnswer;
    
    if (exercise.type === 'math_operation_vertical' && exercise.showDUHelp) {
        // Obtener respuesta de inputs D|U
        const card = document.querySelector(`[data-exercise-id="${exerciseId}"]`);
        const decenaInput = card.querySelector('.decena-input');
        const unidadInput = card.querySelector('.unidad-input');
        
        const decena = parseInt(decenaInput.value) || 0;
        const unidad = parseInt(unidadInput.value) || 0;
        
        userAnswer = (decena * 10) + unidad;
        
        if (decenaInput.value.trim() === '' && unidadInput.value.trim() === '') {
            showErrorMessage('Por favor, completa ambos dígitos (D y U)');
            return;
        }
    } else {
        // Obtener respuesta de input normal
        const input = document.querySelector(`input[data-exercise-id="${exerciseId}"]`);
        userAnswer = parseInt(input.value);
        
        if (!input.value.trim()) {
            showErrorMessage('Por favor, ingresa una respuesta');
            return;
        }
    }
    
    if (isNaN(userAnswer)) {
        showErrorMessage('Por favor, ingresa un número válido');
        return;
    }
    
    // Verificar respuesta
    const isCorrect = userAnswer === exercise.answer;
    
    // ✅ ¡CONFETI CUANDO EL NIÑO ACIERTA!
    if (isCorrect) {
        launchConfetti();
    }
    
    // Actualizar ejercicio
    exercise.completed = true;
    exercise.correct = isCorrect;
    exercise.userAnswer = userAnswer;
    exercise.timeSpent = Date.now() - DASHBOARD_CONFIG.exerciseSession.startTime;
    
    // ✅ GENERAR FEEDBACK INTELIGENTE CON IA
    let feedback = '';
    try {
        if (window.geminiAI && window.geminiAI.configured) {
            console.log('🤖 Generando feedback personalizado con IA...');
            feedback = await window.geminiAI.generateFeedback(userAnswer, exercise.answer, isCorrect);
        } else {
            feedback = isCorrect ? 
                '¡Excelente trabajo! ¡Respuesta correcta!' : 
                '¡Buen intento! Revisa tu respuesta e inténtalo de nuevo.';
        }
    } catch (error) {
        console.error('❌ Error generando feedback:', error);
        feedback = isCorrect ? 
            '¡Muy bien! ¡Correcto!' : 
            '¡Sigue intentando! Puedes hacerlo.';
    }
    
    // Mostrar feedback en el ejercicio
    exercise.feedback = feedback;
    
    // Actualizar estadísticas
    DASHBOARD_CONFIG.exerciseSession.stats.completed++;
    if (isCorrect) {
        DASHBOARD_CONFIG.exerciseSession.stats.correct++;
    }
    
    // Actualizar UI
    updateExerciseCard(exerciseId, exercise);
    updateSessionStats();
    
    // Guardar progreso
    saveExerciseProgress(exercise);
    
    console.log(`${isCorrect ? '✅🎉' : '❌'} Ejercicio ${exerciseId}: ${userAnswer} (Correcto: ${exercise.answer})`);
    console.log(`💬 Feedback: ${feedback}`);
}

// 🎉 SISTEMA DE CONFETI PARA NIÑOS
function launchConfetti() {
    console.log('🎉 ¡Lanzando confeti por respuesta correcta!');
    
    // Crear contenedor de confeti si no existe
    let confettiContainer = document.getElementById('confetti-container');
    if (!confettiContainer) {
        confettiContainer = document.createElement('div');
        confettiContainer.id = 'confetti-container';
        confettiContainer.className = 'fixed inset-0 pointer-events-none z-50 overflow-hidden';
        document.body.appendChild(confettiContainer);
    }
    
    // Crear múltiples piezas de confeti
    const confettiCount = 50;
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    const shapes = ['●', '▲', '■', '★', '♦', '♥', '♠', '♣'];
    
    for (let i = 0; i < confettiCount; i++) {
        createConfettiPiece(confettiContainer, colors, shapes);
    }
    
    // Reproducir sonido de celebración (si está disponible)
    playSuccessSound();
    
    // Limpiar confeti después de la animación
    setTimeout(() => {
        confettiContainer.innerHTML = '';
    }, 4000);
}

function createConfettiPiece(container, colors, shapes) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-piece';
    
    // Propiedades aleatorias
    const color = colors[Math.floor(Math.random() * colors.length)];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const size = Math.random() * 10 + 8; // Entre 8px y 18px
    const startX = Math.random() * window.innerWidth;
    const duration = Math.random() * 2 + 2; // Entre 2s y 4s
    const delay = Math.random() * 0.5; // Hasta 0.5s de delay
    
    // Estilos del confeti
    confetti.style.cssText = `
        position: absolute;
        top: -20px;
        left: ${startX}px;
        color: ${color};
        font-size: ${size}px;
        animation: confetti-fall ${duration}s linear ${delay}s forwards;
        pointer-events: none;
        user-select: none;
        font-weight: bold;
    `;
    
    confetti.textContent = shape;
    container.appendChild(confetti);
}

function playSuccessSound() {
    try {
        // Crear un sonido de celebración con Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Crear una secuencia de tonos alegres
        const frequencies = [523.25, 659.25, 783.99, 1046.50]; // Do, Mi, Sol, Do octava alta
        
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
            }, index * 100);
        });
    } catch (error) {
        console.log('🔊 Audio no disponible, solo confeti visual');
    }
}

// 🔄 ACTUALIZAR TARJETA DE EJERCICIO DESPUÉS DE RESPUESTA
function updateExerciseCard(exerciseId, exercise) {
    const card = document.querySelector(`[data-exercise-id="${exerciseId}"]`);
    if (!card) return;
    
    // Actualizar clases de la tarjeta
    card.className = `exercise-item ${exercise.completed ? (exercise.correct ? 'completed' : 'incorrect') : ''}`;
    
    // Actualizar botón de comprobar
    const checkButton = card.querySelector('.check-answer-btn');
    if (checkButton) {
        if (exercise.completed) {
            checkButton.disabled = true;
            checkButton.className = 'check-answer-btn w-full py-2 px-4 bg-gray-400 cursor-not-allowed text-white font-medium rounded-lg transition-colors';
            checkButton.textContent = exercise.correct ? '✅ Correcto' : '❌ Incorrecto';
        }
    }
    
    // Mostrar respuesta correcta si es incorrecta
    if (exercise.completed && !exercise.correct) {
        // Verificar si ya existe el mensaje de respuesta correcta
        let correctAnswerDiv = card.querySelector('.correct-answer');
        if (!correctAnswerDiv) {
            correctAnswerDiv = document.createElement('div');
            correctAnswerDiv.className = 'correct-answer text-sm text-green-600 mt-2 text-center';
            correctAnswerDiv.innerHTML = `✅ Respuesta correcta: <strong>${exercise.answer}</strong>`;
            
            // Insertar después de los botones de acción
            const actionsDiv = card.querySelector('.exercise-actions');
            if (actionsDiv) {
                actionsDiv.parentNode.insertBefore(correctAnswerDiv, actionsDiv.nextSibling);
            } else {
                card.appendChild(correctAnswerDiv);
            }
        }
    }
    
    // Mostrar feedback si existe
    if (exercise.feedback) {
        // Verificar si ya existe el feedback
        let feedbackDiv = card.querySelector('.exercise-feedback');
        if (!feedbackDiv) {
            feedbackDiv = document.createElement('div');
            feedbackDiv.className = `exercise-feedback mt-3 p-3 rounded-lg text-sm ${
                exercise.correct ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-blue-50 border border-blue-200 text-blue-800'
            }`;
            feedbackDiv.innerHTML = `💬 ${exercise.feedback}`;
            
            // Insertar antes del mensaje de respuesta correcta o al final
            const correctAnswerDiv = card.querySelector('.correct-answer');
            if (correctAnswerDiv) {
                correctAnswerDiv.parentNode.insertBefore(feedbackDiv, correctAnswerDiv);
            } else {
                card.appendChild(feedbackDiv);
            }
        }
    }
    
    // Deshabilitar inputs si está completado
    if (exercise.completed) {
        const inputs = card.querySelectorAll('input');
        inputs.forEach(input => {
            input.setAttribute('readonly', true);
        });
    }
}
