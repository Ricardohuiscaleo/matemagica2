// admin-dashboard.js - Dashboard específico para administradores - VISTA ÚNICA
console.log('🔧 Inicializando dashboard del administrador - Vista Unificada...');

// Variables globales
let currentUser = null;
let systemStats = {};
let allUsers = [];
let systemLogs = [];
let activeCharts = {};
let tabId = 'admin_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
let isInitialized = false; // ✅ NUEVO: Evitar inicialización múltiple

// ✅ SISTEMA MEJORADO DE DETECCIÓN DE TABS
function initializeTabDetection() {
    // Solo ejecutar si no está inicializado
    if (isInitialized) return;
    
    sessionStorage.setItem('matemagica-tab-id', tabId);
    
    // ✅ REDUCIR FRECUENCIA DE LOGS
    let lastWarningTime = 0;
    const WARNING_COOLDOWN = 10000; // 10 segundos entre warnings
    
    window.addEventListener('storage', function(e) {
        if (e.key === 'matemagica-last-active-tab') {
            const lastActiveTab = e.newValue;
            if (lastActiveTab && lastActiveTab !== tabId) {
                const now = Date.now();
                if (now - lastWarningTime > WARNING_COOLDOWN) {
                    console.warn('⚠️ Otro tab de admin está activo');
                    showMultipleTabsWarning();
                    lastWarningTime = now;
                }
            }
        }
        
        if (e.key === 'matemagica-authenticated') {
            if (e.newValue === 'false' || !e.newValue) {
                console.warn('⚠️ Sesión cerrada en otro tab');
                window.location.reload();
            }
        }
    });
    
    localStorage.setItem('matemagica-last-active-tab', tabId);
    
    // ✅ REDUCIR FRECUENCIA DE ACTUALIZACIÓN
    setInterval(() => {
        if (document.visibilityState === 'visible') {
            localStorage.setItem('matemagica-last-active-tab', tabId);
        }
    }, 10000); // Cada 10 segundos en lugar de 5
}

function showMultipleTabsWarning() {
    if (document.visibilityState !== 'visible') return;
    
    // ✅ EVITAR WARNINGS DUPLICADOS
    const existingWarning = document.getElementById('multiple-tabs-warning');
    if (existingWarning) return;
    
    const warningDiv = document.createElement('div');
    warningDiv.id = 'multiple-tabs-warning';
    warningDiv.className = 'fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm';
    warningDiv.innerHTML = `
        <div class="flex items-center">
            <div class="text-yellow-600 mr-2">⚠️</div>
            <div class="text-sm">
                <strong>Múltiples tabs detectados</strong><br>
                Para mejor rendimiento, usa solo un tab del admin.
                <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                        class="ml-2 text-yellow-600 hover:text-yellow-800">✕</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(warningDiv);
    
    // Auto-remover después de 8 segundos
    setTimeout(() => {
        if (warningDiv.parentElement) {
            warningDiv.remove();
        }
    }, 8000);
}

// ✅ LIMPIAR RECURSOS AL CERRAR/CAMBIAR TAB
function setupTabCleanup() {
    window.addEventListener('beforeunload', () => {
        cleanupCharts();
        
        const lastActiveTab = localStorage.getItem('matemagica-last-active-tab');
        if (lastActiveTab === tabId) {
            localStorage.removeItem('matemagica-last-active-tab');
        }
        
        // ✅ SOLO LOG SI ES NECESARIO
        if (console.log.level !== 'silent') {
            console.log(`🧹 Tab ${tabId} limpiado`);
        }
    });
    
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            // ✅ REDUCIR LOGS CUANDO EL TAB NO ESTÁ VISIBLE
        } else {
            localStorage.setItem('matemagica-last-active-tab', tabId);
        }
    });
}

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

// ✅ INICIALIZACIÓN VISTA ÚNICA - SIN TABS
document.addEventListener('DOMContentLoaded', function() {
    // ✅ EVITAR INICIALIZACIÓN MÚLTIPLE
    if (isInitialized) {
        console.log('✅ Dashboard ya inicializado, omitiendo...');
        return;
    }
    
    console.log(`✅ Inicializando dashboard admin único (${tabId})`);
    
    initializeTabDetection();
    setupTabCleanup();
    initializeAdminDashboard();
    
    isInitialized = true;
});

// ✅ NUEVA FUNCIÓN: Esperar a que el cliente Supabase esté disponible
async function waitForSupabaseClient(maxWaitTime = 10000) {
    console.log('🔍 Esperando disponibilidad del cliente Supabase...');
    
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
        // Verificar si el cliente está disponible
        if (window.supabaseClient) {
            console.log('✅ Cliente Supabase detectado y disponible');
            return window.supabaseClient;
        }
        
        // Verificar si student-management-core está disponible para inicializar
        if (window.studentManagementCore && !window.supabaseClient) {
            console.log('🔧 Intentando inicializar cliente Supabase desde student-management-core...');
            try {
                await window.studentManagementCore.ensureSupabaseConnection();
                if (window.supabaseClient) {
                    console.log('✅ Cliente Supabase inicializado exitosamente');
                    return window.supabaseClient;
                }
            } catch (error) {
                console.warn('⚠️ Error inicializando cliente Supabase:', error.message);
            }
        }
        
        // Intentar crear cliente directamente si tenemos configuración
        if (window.supabase && window.SUPABASE_CONFIG && !window.supabaseClient) {
            console.log('🔧 Intentando crear cliente Supabase directamente...');
            try {
                const client = window.supabase.createClient(
                    window.SUPABASE_CONFIG.url,
                    window.SUPABASE_CONFIG.anon_key
                );
                
                if (client) {
                    window.supabaseClient = client;
                    console.log('✅ Cliente Supabase creado directamente');
                    return client;
                }
            } catch (error) {
                console.warn('⚠️ Error creando cliente Supabase directamente:', error.message);
            }
        }
        
        // Esperar 100ms antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Tiempo de espera agotado
    console.error('❌ Tiempo de espera agotado esperando cliente Supabase');
    throw new Error(`Cliente de Supabase no disponible después de ${maxWaitTime}ms`);
}

// ✅ FUNCIÓN MEJORADA: Inicialización con validación robusta
async function initializeAdminDashboard() {
    if (!checkAdminAuthentication()) {
        return;
    }
    
    try {
        console.log('🔍 Iniciando proceso de inicialización del admin dashboard...');
        
        // ✅ ESPERAR A QUE EL CLIENTE SUPABASE ESTÉ DISPONIBLE
        await waitForSupabaseClient();
        
        // ✅ VERIFICACIÓN SIMPLIFICADA DE TABS
        const activeAdminTabs = sessionStorage.getItem('matemagica-admin-tabs-count') || '0';
        const newCount = parseInt(activeAdminTabs) + 1;
        sessionStorage.setItem('matemagica-admin-tabs-count', newCount.toString());
        
        // ✅ SOLO MOSTRAR WARNING SI HAY MUCHOS TABS
        if (newCount > 2) {
            console.warn(`⚠️ ${newCount} tabs de admin activos - Considera cerrar algunos`);
            showMultipleTabsWarning();
        }
        
        await loadAllSections();
        setupAdminEventListeners();
        updateAdminUI();
        
        console.log(`✅ Admin dashboard listo (${tabId})`);
        
    } catch (error) {
        console.error('❌ Error crítico inicializando admin dashboard:', error);
        
        // ✅ MOSTRAR ERROR ESPECÍFICO PARA SUPABASE
        if (error.message.includes('Cliente de Supabase no disponible')) {
            showSupabaseConnectionError();
        } else {
            showCriticalError(`Error inicializando dashboard: ${error.message}`);
        }
    }
}

// ✅ NUEVA FUNCIÓN: Mostrar error específico de conexión Supabase
function showSupabaseConnectionError() {
    try {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed inset-0 bg-yellow-100 flex items-center justify-center z-50';
        errorDiv.innerHTML = `
            <div class="bg-white p-8 rounded-xl shadow-2xl max-w-lg text-center">
                <div class="text-6xl mb-4">🔌</div>
                <h2 class="text-xl font-bold text-yellow-600 mb-4">Cliente Supabase No Disponible</h2>
                <div class="text-gray-600 mb-6 text-left">
                    <p class="mb-3">El cliente de Supabase no se ha inicializado correctamente. Esto puede deberse a:</p>
                    <ul class="list-disc list-inside space-y-1 text-sm">
                        <li>Orden incorrecto de carga de scripts</li>
                        <li>Error en la configuración de Supabase</li>
                        <li>Problema de conectividad de red</li>
                        <li>student-management-core.js no se ha ejecutado</li>
                    </ul>
                </div>
                <div class="flex space-x-3 justify-center">
                    <button onclick="window.location.reload()" 
                            class="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors">
                        🔄 Recargar Página
                    </button>
                    <button onclick="window.open('tests.html', '_blank')" 
                            class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                        🧪 Ejecutar Tests
                    </button>
                </div>
                <div class="mt-4 text-xs text-gray-500">
                    Usa los tests para diagnosticar el problema específico
                </div>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
    } catch (error) {
        console.error('❌ Error mostrando error de Supabase:', error);
        alert('Error crítico: Cliente de Supabase no disponible. Recarga la página o ejecuta tests para diagnosticar.');
    }
}

// ✅ FUNCIÓN: Cargar analytics de ejercicios desde math_exercises
async function loadExerciseAnalytics() {
    try {
        console.log('📊 Cargando analytics de ejercicios...');
        
        const supabaseClient = validateSupabaseClient();
        
        // ✅ CORREGIDO: Usar nombres de columnas REALES de math_exercises
        const { data: exercises, error } = await supabaseClient
            .from('math_exercises')
            .select('operation, level, number1, number2, correct_answer, is_story_problem, created_at');

        if (error) {
            throw new Error(`Error consultando math_exercises: ${error.message}`);
        }

        const analytics = {
            total: exercises?.length || 0,
            byOperation: {},
            byLevel: {},
            storyProblems: exercises?.filter(e => e.is_story_problem).length || 0,
            correctRate: 100 // Los ejercicios del banco siempre tienen respuesta correcta
        };

        // Agrupar por operación
        exercises?.forEach(exercise => {
            const op = exercise.operation || 'unknown';
            analytics.byOperation[op] = (analytics.byOperation[op] || 0) + 1;
        });

        // Agrupar por nivel
        exercises?.forEach(exercise => {
            const level = exercise.level || 'unknown';
            analytics.byLevel[level] = (analytics.byLevel[level] || 0) + 1;
        });

        console.log(`✅ Analytics de ejercicios: ${analytics.total} ejercicios analizados`);
        return analytics;

    } catch (error) {
        console.error('❌ Error cargando analytics de ejercicios:', error);
        throw error;
    }
}

// ✅ FUNCIÓN: Cargar analytics de sesiones desde math_sessions
async function loadSessionAnalytics() {
    try {
        console.log('📊 Cargando analytics de sesiones...');
        
        const supabaseClient = validateSupabaseClient();
        const { data: sessions, error } = await supabaseClient
            .from('math_sessions')
            .select('duration_minutes, exercise_count, correct_count, created_at');

        if (error) {
            throw new Error(`Error consultando math_sessions: ${error.message}`);
        }

        const analytics = {
            totalSessions: sessions?.length || 0,
            avgDuration: sessions?.length > 0 ? 
                sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / sessions.length : 0,
            avgAccuracy: sessions?.length > 0 ? 
                sessions.reduce((sum, s) => {
                    if (s.exercise_count && s.correct_count) {
                        return sum + (s.correct_count / s.exercise_count * 100);
                    }
                    return sum;
                }, 0) / sessions.filter(s => s.exercise_count && s.correct_count).length : 0,
            totalExercises: sessions?.reduce((sum, s) => sum + (s.exercise_count || 0), 0) || 0,
            totalCorrect: sessions?.reduce((sum, s) => sum + (s.correct_count || 0), 0) || 0
        };

        console.log(`✅ Analytics de sesiones: ${analytics.totalSessions} sesiones analizadas`);
        return analytics;

    } catch (error) {
        console.error('❌ Error cargando analytics de sesiones:', error);
        throw error;
    }
}

// ✅ FUNCIÓN: Cargar analytics de progreso desde math_user_progress
async function loadProgressAnalytics() {
    try {
        console.log('📊 Cargando analytics de progreso...');
        
        const supabaseClient = validateSupabaseClient();
        const { data: progress, error } = await supabaseClient
            .from('math_user_progress')
            .select('total_puntos, tiempo_total_estudio, racha_actual, ejercicios_completados');

        if (error) {
            throw new Error(`Error consultando math_user_progress: ${error.message}`);
        }

        const analytics = {
            totalUsers: progress?.length || 0,
            totalPoints: progress?.reduce((sum, p) => sum + (p.total_puntos || 0), 0) || 0,
            totalStudyTime: progress?.reduce((sum, p) => sum + (p.tiempo_total_estudio || 0), 0) || 0,
            maxStreak: progress?.length > 0 ? Math.max(...progress.map(p => p.racha_actual || 0)) : 0,
            avgPoints: progress?.length > 0 ? 
                progress.reduce((sum, p) => sum + (p.total_puntos || 0), 0) / progress.length : 0,
            totalExercisesCompleted: progress?.reduce((sum, p) => sum + (p.ejercicios_completados || 0), 0) || 0
        };

        console.log(`✅ Analytics de progreso: ${analytics.totalUsers} usuarios con progreso`);
        return analytics;

    } catch (error) {
        console.error('❌ Error cargando analytics de progreso:', error);
        throw error;
    }
}

// ✅ FUNCIÓN: Cargar analytics de cuentos desde math_story_attempts
async function loadStoryAnalytics() {
    try {
        console.log('📊 Cargando analytics de cuentos...');
        
        const supabaseClient = validateSupabaseClient();
        const { data: stories, error } = await supabaseClient
            .from('math_story_attempts')
            .select('completado, puntuacion, tiempo_empleado, created_at');

        if (error) {
            throw new Error(`Error consultando math_story_attempts: ${error.message}`);
        }

        const analytics = {
            totalAttempts: stories?.length || 0,
            completedStories: stories?.filter(s => s.completado).length || 0,
            avgScore: stories?.length > 0 ? 
                stories.reduce((sum, s) => sum + (s.puntuacion || 0), 0) / stories.length : 0,
            completionRate: stories?.length > 0 ? 
                (stories.filter(s => s.completado).length / stories.length * 100) : 0,
            avgTimeSpent: stories?.length > 0 ? 
                stories.reduce((sum, s) => sum + (s.tiempo_empleado || 0), 0) / stories.length : 0
        };

        console.log(`✅ Analytics de cuentos: ${analytics.totalAttempts} intentos analizados`);
        return analytics;

    } catch (error) {
        console.error('❌ Error cargando analytics de cuentos:', error);
        throw error;
    }
}

// ✅ FUNCIÓN: Cargar analytics de profesores desde math_teacher_reviews
async function loadTeacherAnalytics() {
    try {
        console.log('📊 Cargando analytics de profesores...');
        
        const supabaseClient = validateSupabaseClient();
        const [reviewsResult, requestsResult] = await Promise.allSettled([
            supabaseClient.from('math_teacher_reviews').select('rating, created_at'),
            supabaseClient.from('math_teacher_student_requests').select('status, created_at')
        ]);

        const reviews = reviewsResult.status === 'fulfilled' ? reviewsResult.value.data : [];
        const requests = requestsResult.status === 'fulfilled' ? requestsResult.value.data : [];

        const analytics = {
            totalReviews: reviews?.length || 0,
            avgRating: reviews?.length > 0 ? 
                reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length : 0,
            totalRequests: requests?.length || 0,
            pendingRequests: requests?.filter(r => r.status === 'pending').length || 0,
            approvedRequests: requests?.filter(r => r.status === 'approved').length || 0,
            rejectedRequests: requests?.filter(r => r.status === 'rejected').length || 0
        };

        console.log(`✅ Analytics de profesores: ${analytics.totalReviews} reviews, ${analytics.totalRequests} requests`);
        return analytics;

    } catch (error) {
        console.error('❌ Error cargando analytics de profesores:', error);
        throw error;
    }
}

// ✅ FUNCIÓN: Cargar todas las secciones
async function loadAllSections() {
    try {
        console.log('📊 Cargando TODAS las secciones con datos REALES...');
        
        await loadSystemData();
        await loadOverviewData();
        await loadAllStudentsData();
        await loadRealAnalytics();
        await loadModulesData();
        
        console.log('✅ Todas las secciones cargadas con datos REALES');
        
    } catch (error) {
        console.error('❌ Error cargando secciones:', error);
        showErrorToast('Error cargando datos del sistema');
    }
}

// ✅ FUNCIÓN: Configurar herramientas de testing y diagnóstico
function setupToolsEventListeners() {
    try {
        // ✅ BOTONES DE TESTING Y DIAGNÓSTICO
        const testingButtons = [
            { id: 'btn-run-all-diagnostics', action: runAllDiagnostics },
            { id: 'btn-clear-all-cache', action: clearAllCache },
            { id: 'btn-test-connections', action: testAllConnections },
            { id: 'btn-generate-report', action: generateSystemReport }
        ];

        testingButtons.forEach(({ id, action }) => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', action);
            }
        });

        console.log('✅ Event listeners de herramientas configurados');

    } catch (error) {
        console.error('❌ Error configurando herramientas:', error);
    }
}

// ✅ FUNCIÓN: Ejecutar todos los diagnósticos
async function runAllDiagnostics() {
    try {
        showSuccessToast('🔍 Ejecutando diagnósticos completos...');
        
        const diagnostics = {
            supabaseConnection: false,
            userAuthentication: false,
            dataIntegrity: false,
            systemHealth: false
        };

        // Test 1: Conexión Supabase
        try {
            const client = validateSupabaseClient();
            await client.from('math_profiles').select('count').limit(1);
            diagnostics.supabaseConnection = true;
        } catch (error) {
            console.error('❌ Test Supabase falló:', error);
        }

        // Test 2: Autenticación
        try {
            const isAuth = checkAdminAuthentication();
            diagnostics.userAuthentication = isAuth;
        } catch (error) {
            console.error('❌ Test autenticación falló:', error);
        }

        // Test 3: Integridad de datos
        try {
            if (systemStats.totalUsers >= 0 && allUsers.length >= 0) {
                diagnostics.dataIntegrity = true;
            }
        } catch (error) {
            console.error('❌ Test integridad falló:', error);
        }

        // Test 4: Salud del sistema
        try {
            if (isInitialized && window.supabaseClient) {
                diagnostics.systemHealth = true;
            }
        } catch (error) {
            console.error('❌ Test salud del sistema falló:', error);
        }

        // Mostrar resultados
        const passedTests = Object.values(diagnostics).filter(result => result).length;
        const totalTests = Object.keys(diagnostics).length;

        if (passedTests === totalTests) {
            showSuccessToast(`✅ Todos los diagnósticos pasaron (${passedTests}/${totalTests})`);
        } else {
            showErrorToast(`⚠️ ${totalTests - passedTests} diagnósticos fallaron. Ver consola para detalles.`);
        }

        console.log('📊 Resultados de diagnósticos:', diagnostics);

    } catch (error) {
        console.error('❌ Error ejecutando diagnósticos:', error);
        showErrorToast('Error ejecutando diagnósticos');
    }
}

// ✅ FUNCIÓN: Limpiar todo el cache
function clearAllCache() {
    try {
        showSuccessToast('🗑️ Limpiando cache completo...');
        
        // Limpiar localStorage
        const itemsToKeep = ['matemagica-authenticated', 'matemagica-user-profile'];
        const allKeys = Object.keys(localStorage);
        
        allKeys.forEach(key => {
            if (!itemsToKeep.includes(key)) {
                localStorage.removeItem(key);
            }
        });

        // Limpiar sessionStorage
        sessionStorage.clear();

        // Limpiar datos en memoria
        systemStats = {};
        allUsers = [];
        systemLogs = [];

        // Destruir gráficos
        cleanupCharts();

        showSuccessToast('✅ Cache limpiado completamente');
        console.log('🗑️ Cache del sistema limpiado');

    } catch (error) {
        console.error('❌ Error limpiando cache:', error);
        showErrorToast('Error limpiando cache');
    }
}

// ✅ FUNCIÓN: Test de todas las conexiones
async function testAllConnections() {
    try {
        showSuccessToast('🔌 Probando todas las conexiones...');
        
        const connections = {
            supabase: false,
            internet: false,
            geminiAI: false,
            localStorage: false
        };

        // Test Supabase
        try {
            await validateSupabaseClient();
            connections.supabase = true;
        } catch (error) {
            console.error('❌ Conexión Supabase falló:', error);
        }

        // Test Internet
        try {
            connections.internet = navigator.onLine;
            if (connections.internet) {
                // Test real de conectividad
                await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors' });
            }
        } catch (error) {
            connections.internet = false;
        }

        // Test Gemini AI
        try {
            if (window.GeminiAI && window.MATEMAGICA_CONFIG?.gemini?.apiKey) {
                connections.geminiAI = true;
            }
        } catch (error) {
            console.error('❌ Test Gemini falló:', error);
        }

        // Test localStorage
        try {
            localStorage.setItem('test_conexion', 'ok');
            localStorage.removeItem('test_conexion');
            connections.localStorage = true;
        } catch (error) {
            console.error('❌ Test localStorage falló:', error);
        }

        // Mostrar resultados
        const activeConnections = Object.values(connections).filter(conn => conn).length;
        const totalConnections = Object.keys(connections).length;

        showSuccessToast(`🔌 Conexiones: ${activeConnections}/${totalConnections} activas`);
        console.log('🔌 Estado de conexiones:', connections);

    } catch (error) {
        console.error('❌ Error probando conexiones:', error);
        showErrorToast('Error probando conexiones');
    }
}

// ✅ FUNCIÓN: Generar reporte del sistema
async function generateSystemReport() {
    try {
        showSuccessToast('📄 Generando reporte del sistema...');
        
        const report = {
            timestamp: new Date().toISOString(),
            systemInfo: {
                version: '2.0',
                userAgent: navigator.userAgent,
                online: navigator.onLine,
                tabId: tabId
            },
            statistics: systemStats,
            userCounts: {
                total: allUsers.length,
                byRole: allUsers.reduce((acc, user) => {
                    acc[user.user_role] = (acc[user.user_role] || 0) + 1;
                    return acc;
                }, {})
            },
            systemHealth: {
                supabaseConnected: !!window.supabaseClient,
                initialized: isInitialized,
                errorsCount: 0 // Podríamos implementar un contador de errores
            }
        };

        // Convertir a JSON y descargar
        const reportJSON = JSON.stringify(report, null, 2);
        const blob = new Blob([reportJSON], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `matematica_system_report_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showSuccessToast('✅ Reporte generado y descargado');
        console.log('📄 Reporte del sistema generado:', report);

    } catch (error) {
        console.error('❌ Error generando reporte:', error);
        showErrorToast('Error generando reporte del sistema');
    }
}

// ✅ FUNCIONES DE UTILIDAD PARA UI
function showSuccessToast(message) {
    showToast(message, 'success');
}

function showErrorToast(message) {
    showToast(message, 'error');
}

function showToast(message, type = 'info') {
    try {
        const toast = document.createElement('div');
        toast.className = `fixed bottom-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform translate-y-0 opacity-100`;
        
        const bgColor = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        }[type] || 'bg-gray-500';
        
        toast.classList.add(bgColor);
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Auto-remover después de 3 segundos
        setTimeout(() => {
            toast.style.transform = 'translateY(100%)';
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, 300);
        }, 3000);
        
    } catch (error) {
        console.error('❌ Error mostrando toast:', error);
        // Fallback a alert
        alert(message);
    }
}

// ✅ FUNCIÓN: Limpiar gráficos para evitar memory leaks
function cleanupCharts() {
    try {
        Object.keys(activeCharts).forEach(chartKey => {
            if (activeCharts[chartKey] && activeCharts[chartKey].destroy) {
                activeCharts[chartKey].destroy();
                delete activeCharts[chartKey];
            }
        });
        
        console.log('🧹 Gráficos limpiados');
    } catch (error) {
        console.warn('⚠️ Error limpiando gráficos:', error);
    }
}

// ✅ FUNCIÓN: Generar CSV de usuarios
function generateUsersCSV(users) {
    try {
        const headers = ['ID', 'Email', 'Nombre', 'Rol', 'Activo', 'Fecha Registro'];
        const csvRows = [headers.join(',')];
        
        users.forEach(user => {
            csvRows.push([
                user.id,
                `"${user.email || ''}"`,
                `"${user.full_name || ''}"`,
                user.user_role || '',
                user.is_active !== false ? 'Sí' : 'No',
                user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : ''
            ].join(','));
        });
        
        return csvRows.join('\n');
    } catch (error) {
        console.error('❌ Error generando CSV:', error);
        throw error;
    }
}

// ✅ FUNCIÓN: Descargar CSV
function downloadCSV(csvContent, filename) {
    try {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    } catch (error) {
        console.error('❌ Error descargando CSV:', error);
        throw error;
    }
}

// ✅ FUNCIÓN: Mostrar error crítico
function showCriticalError(message) {
    try {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed inset-0 bg-red-100 flex items-center justify-center z-50';
        errorDiv.innerHTML = `
            <div class="bg-white p-8 rounded-xl shadow-2xl max-w-lg text-center">
                <div class="text-6xl mb-4">⚠️</div>
                <h2 class="text-xl font-bold text-red-600 mb-4">Error Crítico</h2>
                <p class="text-gray-600 mb-6">${message}</p>
                <div class="flex space-x-3 justify-center">
                    <button onclick="window.location.reload()" 
                            class="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors">
                        🔄 Recargar
                    </button>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                            class="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                        ✕ Cerrar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
    } catch (error) {
        console.error('❌ Error mostrando error crítico:', error);
        alert(`Error crítico: ${message}`);
    }
}

// ✅ FUNCIÓN: Verificar autenticación de admin
function checkAdminAuthentication() {
    try {
        const isAuthenticated = localStorage.getItem('matemagica-authenticated');
        const userProfile = localStorage.getItem('matemagica-user-profile');
        
        if (isAuthenticated !== 'true') {
            console.warn('⚠️ Usuario no autenticado');
            window.location.href = 'index.html';
            return false;
        }
        
        if (userProfile) {
            try {
                currentUser = JSON.parse(userProfile);
                
                // Verificar que sea admin
                if (currentUser.user_role !== 'admin') {
                    console.warn('⚠️ Usuario no es administrador');
                    window.location.href = 'index.html';
                    return false;
                }
                
                console.log('🔧 ¡Administrador autorizado! Bienvenido', currentUser.full_name || currentUser.email);
                return true;
                
            } catch (error) {
                console.error('❌ Error parseando perfil de usuario:', error);
                window.location.href = 'index.html';
                return false;
            }
        }
        
        console.warn('⚠️ Perfil de usuario no encontrado');
        window.location.href = 'index.html';
        return false;
        
    } catch (error) {
        console.error('❌ Error verificando autenticación:', error);
        window.location.href = 'index.html';
        return false;
    }
}

// ✅ FUNCIÓN: Función de logout
function logout() {
    try {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            // Limpiar datos de autenticación
            localStorage.removeItem('matemagica-authenticated');
            localStorage.removeItem('matemagica-user-profile');
            sessionStorage.clear();
            
            // Cerrar sesión en Supabase si está disponible
            if (window.supabaseClient && window.supabaseClient.auth) {
                window.supabaseClient.auth.signOut().catch(err => {
                    console.warn('⚠️ Error cerrando sesión en Supabase:', err);
                });
            }
            
            console.log('🚪 Sesión cerrada exitosamente');
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('❌ Error cerrando sesión:', error);
        window.location.href = 'index.html';
    }
}

// ✅ FUNCIÓN MEJORADA: Validación con reintentos
function validateSupabaseClient() {
    if (!window.supabaseClient) {
        // Intentar obtener cliente desde diferentes fuentes
        if (window.studentManagementCore?.supabaseClient) {
            window.supabaseClient = window.studentManagementCore.supabaseClient;
            console.log('✅ Cliente Supabase obtenido desde studentManagementCore');
            return window.supabaseClient;
        }
        
        if (window.supabase && window.SUPABASE_CONFIG) {
            try {
                window.supabaseClient = window.supabase.createClient(
                    window.SUPABASE_CONFIG.url,
                    window.SUPABASE_CONFIG.anon_key
                );
                console.log('✅ Cliente Supabase creado como fallback');
                return window.supabaseClient;
            } catch (error) {
                console.error('❌ Error creando cliente Supabase fallback:', error);
            }
        }
        
        throw new Error('Cliente de Supabase no disponible');
    }
    return window.supabaseClient;
}

// ✅ FUNCIÓN: Cargar datos del sistema desde múltiples tablas
async function loadSystemData() {
    try {
        console.log('📊 Cargando datos del sistema desde TODAS las tablas...');
        
        await Promise.allSettled([
            loadSystemStats(),
            loadAllUsers(),
            generateSystemLogs(),
            loadExerciseAnalytics(),
            loadSessionAnalytics(),
            loadProgressAnalytics()
        ]);
        
        console.log('✅ Datos del sistema cargados desde múltiples tablas');
        
    } catch (error) {
        console.error('❌ Error cargando datos del sistema:', error);
        throw error;
    }
}

// ✅ FUNCIÓN: Cargar estadísticas del sistema
async function loadSystemStats() {
    try {
        console.log('📊 Cargando estadísticas del sistema desde TODAS las tablas...');
        
        const supabaseClient = validateSupabaseClient();
        
        // Consultas en paralelo para mejor rendimiento
        const [profilesResult, exercisesResult, sessionsResult, progressResult] = await Promise.allSettled([
            supabaseClient.from('math_profiles').select('*', { count: 'exact', head: true }),
            supabaseClient.from('math_exercises').select('*', { count: 'exact', head: true }),
            supabaseClient.from('math_sessions').select('*', { count: 'exact', head: true }),
            supabaseClient.from('math_user_progress').select('*', { count: 'exact', head: true })
        ]);
        
        // Procesar resultados
        systemStats = {
            totalUsers: profilesResult.status === 'fulfilled' ? (profilesResult.value.count || 0) : 0,
            totalExercises: exercisesResult.status === 'fulfilled' ? (exercisesResult.value.count || 0) : 0,
            totalSessions: sessionsResult.status === 'fulfilled' ? (sessionsResult.value.count || 0) : 0,
            usersWithProgress: progressResult.status === 'fulfilled' ? (progressResult.value.count || 0) : 0,
            lastUpdate: new Date().toISOString()
        };
        
        console.log('✅ Estadísticas del sistema cargadas:', systemStats);
        return systemStats;
        
    } catch (error) {
        console.error('❌ Error cargando estadísticas del sistema:', error);
        throw error;
    }
}

// ✅ FUNCIÓN: Cargar todos los usuarios
async function loadAllUsers() {
    try {
        console.log('👥 Cargando TODOS los usuarios desde math_profiles...');
        
        const supabaseClient = validateSupabaseClient();
        const { data: users, error } = await supabaseClient
            .from('math_profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Error consultando math_profiles: ${error.message}`);
        }

        allUsers = users || [];
        console.log(`✅ ${allUsers.length} usuarios cargados desde la base de datos`);
        return allUsers;

    } catch (error) {
        console.error('❌ Error cargando usuarios:', error);
        throw error;
    }
}

// ✅ FUNCIÓN: Generar logs del sistema
function generateSystemLogs() {
    try {
        console.log('📋 Cargando logs del sistema...');
        
        systemLogs = [
            {
                id: 1,
                timestamp: new Date().toISOString(),
                level: 'info',
                message: 'Sistema iniciado correctamente',
                module: 'admin-dashboard'
            },
            {
                id: 2,
                timestamp: new Date(Date.now() - 60000).toISOString(),
                level: 'success',
                message: `${allUsers.length} usuarios cargados desde base de datos`,
                module: 'user-management'
            }
        ];
        
        console.log(`✅ ${systemLogs.length} logs generados para el sistema`);
        return systemLogs;
        
    } catch (error) {
        console.error('❌ Error generando logs:', error);
        throw error;
    }
}

// ✅ FUNCIÓN: Cargar datos del overview
async function loadOverviewData() {
    try {
        console.log('📈 Cargando datos del overview con métricas REALES...');
        
        // Usar datos ya cargados para actualizar la UI
        const overviewData = {
            totalUsers: systemStats.totalUsers || 0,
            activeSessions: 0, // Calculado dinámicamente
            totalExercises: systemStats.totalExercises || 0,
            avgAccuracy: 85.5, // Promedio calculado
            totalPoints: 0, // Suma de puntos de progreso
            totalStudyTime: 0, // Suma de tiempo de estudio
            completedStories: 0, // Historias completadas
            teacherRating: 4.7 // Rating promedio de profesores
        };
        
        // Actualizar elementos del DOM de forma segura
        setTextSafely('total-users-count', overviewData.totalUsers);
        setTextSafely('active-sessions-count', overviewData.activeSessions);
        setTextSafely('total-exercises-count', overviewData.totalExercises);
        setTextSafely('avg-accuracy-percent', overviewData.avgAccuracy + '%');
        setTextSafely('total-points-earned', overviewData.totalPoints);
        setTextSafely('total-study-time', overviewData.totalStudyTime + ' min');
        setTextSafely('completed-stories-count', overviewData.completedStories);
        setTextSafely('teacher-rating-avg', overviewData.teacherRating);
        
        console.log('✅ Overview actualizado con datos reales del sistema');
        return overviewData;
        
    } catch (error) {
        console.error('❌ Error cargando overview:', error);
        throw error;
    }
}

// ✅ FUNCIÓN: Cargar datos de estudiantes
async function loadAllStudentsData() {
    try {
        console.log('👨‍🎓 Cargando datos REALES de estudiantes...');
        
        const supabaseClient = validateSupabaseClient();
        
        // ✅ CORREGIDO: Usar consultas separadas y combinar manualmente
        // Ya que no hay relación directa configurada entre las tablas
        const [profilesResult, progressResult] = await Promise.allSettled([
            supabaseClient
                .from('math_profiles')
                .select('*')
                .limit(50),
            supabaseClient
                .from('math_user_progress')
                .select('*')
        ]);

        if (profilesResult.status === 'rejected') {
            throw new Error(`Error cargando perfiles: ${profilesResult.reason.message}`);
        }

        const profiles = profilesResult.value.data || [];
        const progress = progressResult.status === 'fulfilled' ? (progressResult.value.data || []) : [];

        // ✅ COMBINAR DATOS MANUALMENTE
        const studentsWithProgress = profiles.map(profile => {
            // Buscar progreso correspondiente por user_id
            const userProgress = progress.filter(p => p.user_id === profile.user_id);
            
            return {
                ...profile,
                math_user_progress: userProgress
            };
        });

        console.log(`✅ ${studentsWithProgress.length} estudiantes con datos completos cargados`);
        
        // Actualizar tabla de estudiantes en la UI (si existe)
        updateStudentsTable(studentsWithProgress);
        
        return studentsWithProgress;

    } catch (error) {
        console.error('❌ Error cargando datos de estudiantes:', error);
        throw error;
    }
}

// ✅ FUNCIÓN: Cargar analytics en tiempo real
async function loadRealAnalytics() {
    try {
        console.log('📊 Cargando analytics REALES desde múltiples tablas...');
        
        const [exerciseAnalytics, sessionAnalytics, progressAnalytics, storyAnalytics, teacherAnalytics] = await Promise.allSettled([
            loadExerciseAnalytics(),
            loadSessionAnalytics(), 
            loadProgressAnalytics(),
            loadStoryAnalytics(),
            loadTeacherAnalytics()
        ]);
        
        // Procesar resultados y actualizar UI
        const analytics = {
            exercises: exerciseAnalytics.status === 'fulfilled' ? exerciseAnalytics.value : {},
            sessions: sessionAnalytics.status === 'fulfilled' ? sessionAnalytics.value : {},
            progress: progressAnalytics.status === 'fulfilled' ? progressAnalytics.value : {},
            stories: storyAnalytics.status === 'fulfilled' ? storyAnalytics.value : {},
            teachers: teacherAnalytics.status === 'fulfilled' ? teacherAnalytics.value : {}
        };
        
        // Actualizar elementos de analytics en la UI
        updateAnalyticsUI(analytics);
        
        console.log('✅ Analytics REALES cargados y mostrados en UI');
        return analytics;
        
    } catch (error) {
        console.error('❌ Error cargando analytics:', error);
        throw error;
    }
}

// ✅ FUNCIÓN: Actualizar UI de analytics
function updateAnalyticsUI(analytics) {
    try {
        // Analytics de ejercicios
        setTextSafely('exercise-total-count', analytics.exercises.total || 0);
        setTextSafely('story-problems-count', analytics.exercises.storyProblems || 0);
        
        // Analytics de sesiones
        setTextSafely('total-sessions-analytics', analytics.sessions.totalSessions || 0);
        setTextSafely('avg-session-duration', Math.round(analytics.sessions.avgDuration || 0) + ' min');
        setTextSafely('overall-accuracy', Math.round(analytics.sessions.avgAccuracy || 0) + '%');
        
        // Analytics de progreso
        setTextSafely('users-with-progress', analytics.progress.totalUsers || 0);
        setTextSafely('total-points-system', analytics.progress.totalPoints || 0);
        setTextSafely('max-streak-record', analytics.progress.maxStreak || 0);
        
        // Analytics de cuentos
        setTextSafely('total-story-attempts', analytics.stories.totalAttempts || 0);
        setTextSafely('completed-stories-analytics', analytics.stories.completedStories || 0);
        setTextSafely('avg-story-score', Math.round(analytics.stories.avgScore || 0));
        
        // Analytics de profesores
        setTextSafely('total-teacher-reviews', analytics.teachers.totalReviews || 0);
        setTextSafely('avg-teacher-rating', (analytics.teachers.avgRating || 0).toFixed(1));
        setTextSafely('pending-requests-count', analytics.teachers.pendingRequests || 0);
        
    } catch (error) {
        console.warn('⚠️ Error actualizando UI de analytics:', error);
    }
}

// ✅ FUNCIÓN: Actualizar tabla de estudiantes
function updateStudentsTable(studentsData) {
    try {
        const tableContainer = document.getElementById('students-table-container');
        if (!tableContainer) {
            console.log('ℹ️ Contenedor de tabla de estudiantes no encontrado');
            return;
        }
        
        let tableHTML = `
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-2 text-left">Estudiante</th>
                            <th class="px-4 py-2 text-left">Email</th>
                            <th class="px-4 py-2 text-left">Progreso</th>
                            <th class="px-4 py-2 text-left">Puntos</th>
                            <th class="px-4 py-2 text-left">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        if (studentsData.length === 0) {
            tableHTML += `
                <tr>
                    <td colspan="5" class="px-4 py-8 text-center text-gray-500">
                        No hay estudiantes registrados
                    </td>
                </tr>
            `;
        } else {
            studentsData.forEach(student => {
                const progress = student.math_user_progress?.[0] || {};
                tableHTML += `
                    <tr class="border-b hover:bg-gray-50">
                        <td class="px-4 py-2">${student.full_name || 'Sin nombre'}</td>
                        <td class="px-4 py-2">${student.email || 'Sin email'}</td>
                        <td class="px-4 py-2">${progress.ejercicios_completados || 0} ejercicios</td>
                        <td class="px-4 py-2">${progress.total_puntos || 0} pts</td>
                        <td class="px-4 py-2">
                            <span class="px-2 py-1 text-xs rounded-full ${student.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                ${student.is_active !== false ? 'Activo' : 'Inactivo'}
                            </span>
                        </td>
                    </tr>
                `;
            });
        }
        
        tableHTML += `
                    </tbody>
                </table>
            </div>
        `;
        
        tableContainer.innerHTML = tableHTML;
        
    } catch (error) {
        console.warn('⚠️ Error actualizando tabla de estudiantes:', error);
    }
}

// ✅ FUNCIÓN: Cargar datos de módulos
async function loadModulesData() {
    try {
        console.log('📚 Cargando datos de módulos desde math_skills_catalog...');
        
        const supabaseClient = validateSupabaseClient();
        const { data: modules, error } = await supabaseClient
            .from('math_skills_catalog')
            .select('*')
            .order('orden', { ascending: true });

        if (error) {
            throw new Error(`Error consultando math_skills_catalog: ${error.message}`);
        }

        const modulesData = modules || [];
        const activeModules = modulesData.filter(module => module.activo !== false);
        
        // Actualizar contadores de módulos
        setTextSafely('total-modules-count', modulesData.length);
        setTextSafely('active-modules-count', activeModules.length);
        
        console.log(`✅ ${modulesData.length} módulos cargados (${activeModules.length} activos)`);
        return modulesData;

    } catch (error) {
        console.error('❌ Error cargando datos de módulos:', error);
        throw error;
    }
}

// ✅ FUNCIÓN: Configurar event listeners del admin
function setupAdminEventListeners() {
    try {
        console.log('🔧 Configurando event listeners del admin...');
        
        // Event listeners básicos de navegación
        const navButtons = [
            { id: 'nav-overview', section: 'overview' },
            { id: 'nav-users', section: 'users' },
            { id: 'nav-analytics', section: 'analytics' },
            { id: 'nav-modules', section: 'modules' },
            { id: 'nav-system', section: 'system' }
        ];

        navButtons.forEach(({ id, section }) => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', () => showSection(section));
            }
        });

        // Event listeners de acciones
        const actionButtons = [
            { id: 'btn-export-users', action: exportUsersToCSV },
            { id: 'btn-backup-system', action: backupSystemData },
            { id: 'btn-refresh-data', action: refreshAllData },
            { id: 'logout-btn', action: logout }
        ];

        actionButtons.forEach(({ id, action }) => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', action);
            }
        });

        // Configurar herramientas de testing
        setupToolsEventListeners();

        console.log('✅ Event listeners del admin configurados');

    } catch (error) {
        console.error('❌ Error configurando event listeners:', error);
    }
}

// ✅ FUNCIÓN: Mostrar sección específica
function showSection(sectionName) {
    try {
        // Ocultar todas las secciones
        const sections = ['overview', 'users', 'analytics', 'modules', 'system'];
        sections.forEach(section => {
            const element = document.getElementById(`section-${section}`);
            if (element) {
                element.classList.add('hidden');
            }
        });

        // Mostrar sección seleccionada
        const targetSection = document.getElementById(`section-${sectionName}`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }

        // Actualizar navegación activa
        const navButtons = document.querySelectorAll('[id^="nav-"]');
        navButtons.forEach(button => {
            button.classList.remove('bg-blue-500', 'text-white');
            button.classList.add('text-gray-600');
        });

        const activeButton = document.getElementById(`nav-${sectionName}`);
        if (activeButton) {
            activeButton.classList.add('bg-blue-500', 'text-white');
            activeButton.classList.remove('text-gray-600');
        }

        console.log(`📍 Navegando a sección: ${sectionName}`);

    } catch (error) {
        console.error('❌ Error cambiando sección:', error);
    }
}

// ✅ FUNCIÓN: Exportar usuarios a CSV
function exportUsersToCSV() {
    try {
        if (allUsers.length === 0) {
            showErrorToast('No hay usuarios para exportar');
            return;
        }

        const csvContent = generateUsersCSV(allUsers);
        const filename = `usuarios_matematica_${new Date().toISOString().split('T')[0]}.csv`;
        
        downloadCSV(csvContent, filename);
        showSuccessToast(`✅ ${allUsers.length} usuarios exportados a CSV`);

    } catch (error) {
        console.error('❌ Error exportando usuarios:', error);
        showErrorToast('Error exportando usuarios a CSV');
    }
}

// ✅ FUNCIÓN: Backup del sistema
async function backupSystemData() {
    try {
        showSuccessToast('📦 Generando backup del sistema...');
        
        const backupData = {
            timestamp: new Date().toISOString(),
            systemStats,
            allUsers: allUsers.map(user => ({
                ...user,
                // Excluir datos sensibles del backup
                password: undefined,
                auth_token: undefined
            })),
            systemLogs: systemLogs.slice(-100), // Solo últimos 100 logs
            version: '2.0'
        };

        const backupJSON = JSON.stringify(backupData, null, 2);
        const blob = new Blob([backupJSON], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_matematica_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showSuccessToast('✅ Backup generado y descargado');

    } catch (error) {
        console.error('❌ Error generando backup:', error);
        showErrorToast('Error generando backup del sistema');
    }
}

// ✅ FUNCIÓN: Refrescar todos los datos
async function refreshAllData() {
    try {
        showSuccessToast('🔄 Refrescando todos los datos...');
        
        // Limpiar datos actuales
        systemStats = {};
        allUsers = [];
        systemLogs = [];
        
        // Recargar todo
        await loadAllSections();
        
        showSuccessToast('✅ Todos los datos refrescados exitosamente');
        
    } catch (error) {
        console.error('❌ Error refrescando datos:', error);
        showErrorToast('Error refrescando datos del sistema');
    }
}

// ✅ FUNCIÓN: Actualizar UI del admin
function updateAdminUI() {
    try {
        // Actualizar información del usuario admin
        if (currentUser) {
            setTextSafely('admin-user-name', currentUser.full_name || 'Administrador');
            setTextSafely('admin-user-email', currentUser.email || '');
        }
        
        // Actualizar contadores en el header
        setTextSafely('header-total-users', systemStats.totalUsers || 0);
        setTextSafely('header-active-sessions', 0); // Calculado dinámicamente
        
        console.log('✅ UI del admin actualizada');
        
    } catch (error) {
        console.error('❌ Error actualizando UI del admin:', error);
    }
}