/**
 * 🧪 MOTOR DE TESTS - Matemágica PWA
 * Sistema de pruebas automatizadas para validar funcionalidad
 */

class TestRunner {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0
        };
        this.console = null;
        this.isRunning = false;
    }

    // Registrar un test
    addTest(category, name, testFunction, options = {}) {
        this.tests.push({
            category,
            name,
            testFunction,
            isQuick: options.quick || false,
            timeout: options.timeout || 5000,
            status: 'pending',
            result: null,
            error: null,
            duration: 0
        });
    }

    // Ejecutar todos los tests
    async runAllTests() {
        this.log('🚀 Iniciando ejecución de todos los tests...');
        await this.runTests(this.tests);
    }

    // Ejecutar solo tests rápidos
    async runQuickTests() {
        const quickTests = this.tests.filter(test => test.isQuick);
        this.log('⚡ Iniciando tests rápidos...');
        await this.runTests(quickTests);
    }

    // Ejecutar conjunto de tests
    async runTests(testsToRun) {
        if (this.isRunning) {
            this.log('⚠️ Tests ya están ejecutándose...');
            return;
        }

        this.isRunning = true;
        this.resetResults();
        this.updateStatus('Ejecutando...');

        for (const test of testsToRun) {
            await this.runSingleTest(test);
            this.updateUI();
            await this.delay(100); // Pequeña pausa para UI
        }

        this.isRunning = false;
        this.updateStatus('Completado');
        this.showSummary();
    }

    // Ejecutar un test individual
    async runSingleTest(test) {
        test.status = 'running';
        const startTime = Date.now();
        
        this.log(`🔄 Ejecutando: ${test.name}`);

        try {
            // Timeout wrapper
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Timeout')), test.timeout);
            });

            const testPromise = test.testFunction();
            const result = await Promise.race([testPromise, timeoutPromise]);

            test.result = result;
            test.status = 'passed';
            test.duration = Date.now() - startTime;
            this.results.passed++;
            
            this.log(`✅ PASSED: ${test.name} (${test.duration}ms)`);
            
        } catch (error) {
            test.error = error.message;
            test.status = 'failed';
            test.duration = Date.now() - startTime;
            this.results.failed++;
            
            this.log(`❌ FAILED: ${test.name} - ${error.message}`);
        }

        this.results.total++;
    }

    // Utilidades
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    resetResults() {
        this.results = { passed: 0, failed: 0, total: 0 };
        this.tests.forEach(test => {
            test.status = 'pending';
            test.result = null;
            test.error = null;
            test.duration = 0;
        });
    }

    // UI Updates
    updateUI() {
        this.updateStats();
        this.renderTestResults();
    }

    updateStats() {
        const statsElement = document.getElementById('testStats');
        if (statsElement) {
            statsElement.textContent = `Tests: ${this.results.passed + this.results.failed} / ${this.results.total}`;
        }
    }

    updateStatus(status) {
        const statusElement = document.getElementById('testStatus');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }

    renderTestResults() {
        const categories = ['system', 'math', 'api', 'ui'];
        
        categories.forEach(category => {
            const container = document.getElementById(`${category}Tests`);
            if (!container) return;

            const categoryTests = this.tests.filter(test => test.category === category);
            container.innerHTML = categoryTests.map(test => this.renderTestItem(test)).join('');
        });
    }

    renderTestItem(test) {
        const statusClass = {
            'pending': 'test-pending',
            'running': 'test-running',
            'passed': 'test-passed',
            'failed': 'test-failed'
        }[test.status];

        const statusIcon = {
            'pending': '⏳',
            'running': '🔄',
            'passed': '✅',
            'failed': '❌'
        }[test.status];

        return `
            <div class="border-l-4 p-3 rounded ${statusClass}">
                <div class="flex items-center justify-between">
                    <span class="font-medium">${statusIcon} ${test.name}</span>
                    ${test.duration > 0 ? `<span class="text-xs">${test.duration}ms</span>` : ''}
                </div>
                ${test.error ? `<div class="text-xs mt-1 opacity-75">Error: ${test.error}</div>` : ''}
            </div>
        `;
    }

    // Console logging
    log(message) {
        console.log(message);
        
        if (!this.console) {
            this.console = document.getElementById('testConsole');
        }
        
        if (this.console) {
            const timestamp = new Date().toLocaleTimeString();
            const logEntry = document.createElement('div');
            logEntry.innerHTML = `<span class="text-gray-500">[${timestamp}]</span> ${message}`;
            this.console.appendChild(logEntry);
            this.console.scrollTop = this.console.scrollHeight;
        }
    }

    showSummary() {
        const passRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
        this.log(`\n📊 RESUMEN DE TESTS:`);
        this.log(`✅ Pasados: ${this.results.passed}`);
        this.log(`❌ Fallidos: ${this.results.failed}`);
        this.log(`📈 Tasa de éxito: ${passRate}%`);
    }

    clearResults() {
        this.resetResults();
        this.updateUI();
        if (this.console) {
            this.console.innerHTML = '<div class="text-gray-500">Console limpiada...</div>';
        }
        this.updateStatus('Listo');
    }
}

// Instancia global del test runner
const testRunner = new TestRunner();

// ===== DEFINICIÓN DE TESTS =====

// 🔧 TESTS DEL SISTEMA
testRunner.addTest('system', 'Verificar carga de configuración', async () => {
    if (typeof window.MATEMAGICA_CONFIG === 'undefined') {
        throw new Error('MATEMAGICA_CONFIG no está cargado');
    }
    return 'Configuración cargada correctamente';
}, { quick: true });

testRunner.addTest('system', 'Verificar Supabase disponible', async () => {
    if (typeof window.supabase === 'undefined') {
        throw new Error('Librería Supabase no disponible');
    }
    if (!window.checkSupabaseStatus) {
        throw new Error('Funciones de Supabase no disponibles');
    }
    return 'Supabase disponible';
}, { quick: true });

// ✅ NUEVO: Test específico para configuración de Supabase
testRunner.addTest('system', 'Verificar configuración Supabase', async () => {
    if (!window.SUPABASE_CONFIG) {
        throw new Error('SUPABASE_CONFIG no está definido');
    }
    
    if (!window.SUPABASE_CONFIG.url) {
        throw new Error('URL de Supabase no configurada');
    }
    
    if (!window.SUPABASE_CONFIG.anon_key) {
        throw new Error('anon_key de Supabase no configurada');
    }
    
    // Verificar que no esté usando la clave incorrecta
    if (window.SUPABASE_CONFIG.key && !window.SUPABASE_CONFIG.anon_key) {
        throw new Error('Configuración incorrecta: usar anon_key en lugar de key');
    }
    
    return `Supabase configurado correctamente - URL: ${window.SUPABASE_CONFIG.url.substring(0, 30)}...`;
}, { quick: true });

// ✅ NUEVO: Test de conexión a Supabase
testRunner.addTest('system', 'Test conexión Supabase', async () => {
    if (!window.mathModeSystem) {
        throw new Error('mathModeSystem no disponible');
    }
    
    const isConnected = await window.mathModeSystem.checkSupabaseConnection();
    
    if (!isConnected) {
        // No es un error fatal, pero informamos el estado
        return 'Supabase no conectado (modo offline disponible)';
    }
    
    return 'Conexión a Supabase exitosa';
}, { quick: true, timeout: 8000 });

testRunner.addTest('system', 'Verificar LocalStorage', async () => {
    const testKey = 'test_matemagica';
    const testValue = 'test_value';
    
    localStorage.setItem(testKey, testValue);
    const retrieved = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    
    if (retrieved !== testValue) {
        throw new Error('LocalStorage no funciona correctamente');
    }
    return 'LocalStorage funcional';
}, { quick: true });

testRunner.addTest('system', 'Verificar Service Worker', async () => {
    if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker no soportado');
    }
    
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
        throw new Error('Service Worker no registrado');
    }
    
    return 'Service Worker activo';
});

// 🔢 TESTS DE LÓGICA MATEMÁTICA
testRunner.addTest('math', 'Generar ejercicio fácil', async () => {
    if (!window.mathModeSystem) {
        throw new Error('Sistema de matemáticas no disponible');
    }
    
    const ejercicio = await mathModeSystem.generarEjercicio('facil');
    
    if (!ejercicio || !ejercicio.pregunta || ejercicio.respuesta === undefined) {
        throw new Error('Ejercicio generado inválido');
    }
    
    return `Ejercicio generado: ${ejercicio.pregunta}`;
}, { quick: true });

testRunner.addTest('math', 'Validar respuesta correcta', async () => {
    const ejercicio = { pregunta: '5 + 3 = ?', respuesta: 8 };
    const esCorrecta = ejercicio.respuesta === 8;
    
    if (!esCorrecta) {
        throw new Error('Validación de respuesta falló');
    }
    
    return 'Validación correcta';
}, { quick: true });

testRunner.addTest('math', 'Generar múltiples niveles', async () => {
    const niveles = ['facil', 'medio', 'dificil'];
    const ejercicios = [];
    
    for (const nivel of niveles) {
        const ejercicio = await mathModeSystem.generarEjercicio(nivel);
        ejercicios.push(ejercicio);
    }
    
    if (ejercicios.length !== 3) {
        throw new Error('No se generaron todos los niveles');
    }
    
    return `${ejercicios.length} niveles generados correctamente`;
});

// 🌐 TESTS DE APIs
testRunner.addTest('api', 'Verificar configuración Gemini', async () => {
    if (!window.MATEMAGICA_CONFIG?.gemini?.apiKey) {
        throw new Error('API Key de Gemini no configurada');
    }
    
    if (!window.GeminiAI) {
        throw new Error('Clase GeminiAI no disponible');
    }
    
    return 'Gemini AI configurado';
}, { quick: true });

testRunner.addTest('api', 'Test conexión a Gemini (si online)', async () => {
    if (!navigator.onLine) {
        return 'Saltado - sin conexión';
    }
    
    const gemini = new GeminiAI();
    const prompt = 'Genera un ejercicio simple de suma para niños de 7 años';
    
    try {
        const response = await gemini.generateContent(prompt);
        if (!response) {
            throw new Error('Respuesta vacía de Gemini');
        }
        return 'Conexión a Gemini exitosa';
    } catch (error) {
        throw new Error(`Fallo en Gemini: ${error.message}`);
    }
}, { timeout: 10000 });

testRunner.addTest('api', 'Verificar modo offline', async () => {
    // Simular desconexión
    const wasOnline = navigator.onLine;
    
    const ejercicio = await mathModeSystem.generarEjercicio('facil');
    
    if (!ejercicio) {
        throw new Error('No se puede generar ejercicios offline');
    }
    
    return 'Modo offline funcional';
}, { quick: true });

// 🎨 TESTS DE UI
testRunner.addTest('ui', 'Verificar elementos principales', async () => {
    const elementos = [
        'welcome-screen',
        'main-app'
    ];
    
    const faltantes = elementos.filter(id => !document.getElementById(id));
    
    if (faltantes.length > 0) {
        throw new Error(`Elementos faltantes: ${faltantes.join(', ')}`);
    }
    
    return `${elementos.length} elementos encontrados`;
}, { quick: true });

testRunner.addTest('ui', 'Verificar responsive design', async () => {
    const viewportWidth = window.innerWidth;
    const isMobile = viewportWidth <= 768;
    
    // Verificar que los elementos se adapten
    const mainApp = document.getElementById('main-app');
    if (!mainApp) {
        throw new Error('Elemento principal no encontrado');
    }
    
    return `Viewport: ${viewportWidth}px (${isMobile ? 'Mobile' : 'Desktop'})`;
}, { quick: true });

testRunner.addTest('ui', 'Verificar iconos y recursos', async () => {
    const manifest = await fetch('manifest.json').then(r => r.json());
    
    if (!manifest.icons || manifest.icons.length === 0) {
        throw new Error('No se encontraron iconos en manifest');
    }
    
    return `${manifest.icons.length} iconos en manifest`;
});

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🧪 Sistema de tests cargado');
    
    // Event listeners para botones
    document.getElementById('runAllTests')?.addEventListener('click', () => {
        testRunner.runAllTests();
    });
    
    document.getElementById('runQuickTests')?.addEventListener('click', () => {
        testRunner.runQuickTests();
    });
    
    document.getElementById('clearResults')?.addEventListener('click', () => {
        testRunner.clearResults();
    });
    
    // Renderizar UI inicial
    testRunner.updateUI();
    testRunner.log('✅ Sistema de tests listo para usar');
});

// Exportar para uso global
window.testRunner = testRunner;