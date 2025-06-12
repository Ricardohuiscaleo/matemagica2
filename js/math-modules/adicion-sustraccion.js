/**
 * 🧮 MÓDULO: ADICIÓN Y SUSTRACCIÓN VERTICAL
 * Matemágica PWA - Sistema educativo
 * Para estudiantes de 2° Básico (7-8 años)
 */

class AdicionSustraccionModule {
    constructor() {
        this.currentExercises = [];
        this.moduleConfig = {
            id: 'adicion-sustraccion',
            title: '🧮 Adición y Sustracción',
            subtitle: 'Sistema VERTICAL',
            colors: {
                primary: '#3B82F6',
                secondary: '#8B5CF6',
                success: '#10B981',
                warning: '#F59E0B',
                error: '#EF4444'
            }
        };
    }

    // ✅ RENDERIZAR INTERFAZ COMPLETA
    async renderFullscreenInterface(studentData) {
        const mainContent = document.querySelector('main.flex-1');
        
        mainContent.innerHTML = `
            <!-- ✅ PANTALLA COMPLETA DE EJERCICIOS - CHILD-FRIENDLY -->
            <div class="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-4">
                <!-- Header fijo superior -->
                <div class="bg-white rounded-xl shadow-lg p-4 mb-6 border-2 border-blue-200">
                    <div class="flex justify-between items-center">
                        <button onclick="volverAMatematicas()" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center transition-colors">
                            <i class="fas fa-arrow-left mr-2"></i>Volver
                        </button>
                        
                        <h1 class="text-2xl font-bold text-center text-gray-800">
                            ${this.moduleConfig.title} - ${this.moduleConfig.subtitle}
                        </h1>
                        
                        <div class="text-right">
                            <div class="text-sm text-gray-600">Estudiante:</div>
                            <div class="font-bold text-blue-600">${studentData?.name || 'Demo'}</div>
                        </div>
                    </div>
                </div>

                <!-- Panel de configuración colorido -->
                ${this.renderConfigPanel()}

                <!-- Loader más amigable para niños -->
                <div id="exercises-loader" class="hidden">
                    <!-- El loader está integrado en el panel de configuración -->
                </div>

                <!-- Grid de ejercicios responsive optimizado -->
                <div id="exercises-content" class="hidden">
                    <div class="grid grid-cols-2 md:grid-cols-5 gap-3" id="exercises-grid">
                        <!-- Los ejercicios se cargarán aquí -->
                    </div>
                </div>

                <!-- Estadísticas de sesión más grandes y coloridas -->
                <div id="session-stats" class="hidden mt-8">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        ${this.renderSessionStats()}
                    </div>
                </div>
            </div>
        `;
        
        this.setupEventListeners();
        this.initializeAIIndicator();
    }

    // ✅ PANEL DE CONFIGURACIÓN
    renderConfigPanel() {
        return `
            <div class="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-green-200">
                <h2 class="text-xl font-bold text-green-800 mb-4 flex items-center">
                    <i class="fas fa-cogs mr-2"></i>¡Configura tus Ejercicios!
                </h2>
                
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                        <label class="block text-sm font-bold text-blue-800 mb-2">🎯 Tipo de Operación</label>
                        <select id="operation-type-select" class="w-full px-3 py-3 text-lg border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                            <option value="ambos">➕➖ Suma y Resta</option>
                            <option value="suma">➕ Solo Suma</option>
                            <option value="resta">➖ Solo Resta</option>
                        </select>
                    </div>
                    
                    <div class="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
                        <label class="block text-sm font-bold text-yellow-800 mb-2">⭐ Dificultad</label>
                        <select id="difficulty-select" class="w-full px-3 py-3 text-lg border-2 border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white">
                            <option value="facil">🟢 Fácil (sin reserva)</option>
                            <option value="medio" selected>🟡 Medio (con reserva)</option>
                            <option value="dificil">🔴 Difícil (mixto)</option>
                        </select>
                    </div>
                    
                    <div class="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                        <label class="block text-sm font-bold text-purple-800 mb-2">🔢 Cantidad</label>
                        <select id="quantity-select" class="w-full px-3 py-3 text-lg border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
                            <option value="5">5 ejercicios</option>
                            <option value="10" selected>10 ejercicios</option>
                            <option value="15">15 ejercicios</option>
                            <option value="20">20 ejercicios</option>
                        </select>
                    </div>
                    
                    <div class="bg-pink-50 p-4 rounded-lg border-2 border-pink-200">
                        <label class="block text-sm font-bold text-pink-800 mb-2">🧙🏻‍♂️ Generar Ejercicios Mágicos</label>
                        <button id="generate-exercises-btn" class="w-full px-3 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg rounded-lg transition-all transform hover:scale-105 shadow-lg">
                            🪄 ¡Crear Magia!
                        </button>
                    </div>
                </div>
                
                <!-- Loader dentro del panel de configuración -->
                <div id="config-panel-loader" class="hidden mt-6">
                    <div class="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-6 text-center border-2 border-blue-200 shadow-lg">
                        <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-3"></div>
                        <p class="text-lg font-bold text-gray-700 mb-2">🎨 ¡Creando ejercicios súper divertidos!</p>
                        <p class="text-md text-gray-600">✨ matemáticas geniales 🧙🏻‍♂️🪄</p>
                        
                        <!-- Animación adicional para niños -->
                        <div class="mt-3 flex justify-center space-x-2">
                            <div class="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                            <div class="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                            <div class="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Botones adicionales más grandes y coloridos -->
                <div class="grid grid-cols-1 md:grid-cols-1 gap-4 mt-6">
                    <button id="download-pdf-btn" class="py-4 px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-lg transition-all transform hover:scale-105 shadow-lg">
                        📄 ¡Descargar PDF!
                    </button>
                </div>
            </div>
        `;
    }

    // ✅ ESTADÍSTICAS DE SESIÓN
    renderSessionStats() {
        return `
            <div class="bg-white rounded-xl p-6 text-center border-2 border-gray-200 shadow-lg">
                <div class="text-3xl font-bold text-gray-900 mb-2" id="stat-completed">0</div>
                <div class="text-sm font-bold text-gray-600">✅ Completados</div>
            </div>
            <div class="bg-white rounded-xl p-6 text-center border-2 border-green-200 shadow-lg">
                <div class="text-3xl font-bold text-green-600 mb-2" id="stat-correct">0</div>
                <div class="text-sm font-bold text-gray-600">🎯 Correctos</div>
            </div>
            <div class="bg-white rounded-xl p-6 text-center border-2 border-blue-200 shadow-lg">
                <div class="text-3xl font-bold text-blue-600 mb-2" id="stat-accuracy">0%</div>
                <div class="text-sm font-bold text-gray-600">📊 Precisión</div>
            </div>
            <div class="bg-white rounded-xl p-6 text-center border-2 border-purple-200 shadow-lg">
                <div class="text-3xl font-bold text-purple-600 mb-2" id="stat-time">0s</div>
                <div class="text-sm font-bold text-gray-600">⏱️ Tiempo</div>
            </div>
        `;
    }

    // ✅ CONFIGURAR EVENT LISTENERS
    setupEventListeners() {
        document.getElementById('generate-exercises-btn')?.addEventListener('click', () => this.generateExercises());
        document.getElementById('download-pdf-btn')?.addEventListener('click', () => this.downloadPDF());
    }

    // ✅ INICIALIZAR INDICADOR DE IA
    initializeAIIndicator() {
        // Verificar si existe el indicador global de IA
        if (window.AIIndicator) {
            const isConfigured = window.geminiAI && window.geminiAI.configured;
            if (isConfigured) {
                window.AIIndicator.setStatus('active');
                console.log('🤖 IA activa - Ejercicios únicos disponibles');
            } else {
                window.AIIndicator.setStatus('inactive');
                console.log('📚 Modo offline - Usando plantillas predefinidas');
            }
        }
    }

    // ✅ SISTEMA DE NOTIFICACIONES TOAST
    showErrorToast(message) {
        this.showToast(message, 'error');
    }

    showInfoToast(message) {
        this.showToast(message, 'info');
    }

    showSuccessToast(message) {
        this.showToast(message, 'success');
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container') || this.createToastContainer();
        const toast = document.createElement('div');
        
        const colors = {
            error: 'bg-red-500 text-white',
            success: 'bg-green-500 text-white',
            info: 'bg-blue-500 text-white'
        };
        
        toast.className = `${colors[type]} px-4 py-3 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300`;
        toast.innerHTML = `
            <div class="flex items-center justify-between">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-3 text-white hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => toast.classList.remove('translate-x-full'), 100);
        
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed bottom-4 right-4 z-50 space-y-2';
        document.body.appendChild(container);
        return container;
    }

    // ✅ CONFIGURAR LISTENER RESPONSIVE
    setupResponsiveListener() {
        // 🚫 PREVENIR MÚLTIPLES LISTENERS - Remover listener anterior si existe
        if (this.resizeListener) {
            window.removeEventListener('resize', this.resizeListener);
        }
        
        // 🎯 CREAR NUEVO LISTENER Y GUARDARLO
        this.resizeListener = () => {
            // Solo ajustar el grid, NO volver a mostrar stickers
            const grid = document.getElementById('exercises-grid');
            if (!grid) return;
            
            const screenWidth = window.innerWidth;
            if (screenWidth >= 1000) {
                grid.style.gridTemplateColumns = 'repeat(5, minmax(0, 1fr))';
                console.log('🖥️ Desktop - 5 columnas - Ancho:', screenWidth);
            } else if (screenWidth >= 768) {
                grid.style.gridTemplateColumns = 'repeat(3, minmax(0, 1fr))';
                console.log('💻 Tablet - 3 columnas - Ancho:', screenWidth);
            } else {
                grid.style.gridTemplateColumns = 'repeat(1, minmax(0, 1fr))';
                console.log('📱 Móvil - 1 columna - Ancho:', screenWidth);
            }
        };
        
        window.addEventListener('resize', this.resizeListener);
    }

    // ✅ ACTUALIZAR ESTADÍSTICAS
    updateStats() {
        const completed = this.currentExercises.filter(ex => ex.completed).length;
        const correct = this.currentExercises.filter(ex => ex.completed && ex.correct).length;
        const accuracy = completed > 0 ? Math.round((correct / completed) * 100) : 0;
        
        const statCompleted = document.getElementById('stat-completed');
        const statCorrect = document.getElementById('stat-correct');
        const statAccuracy = document.getElementById('stat-accuracy');
        
        if (statCompleted) statCompleted.textContent = completed;
        if (statCorrect) statCorrect.textContent = correct;
        if (statAccuracy) statAccuracy.textContent = accuracy + '%';
    }

    // ✅ MOSTRAR FEEDBACK POSITIVO
    async showPositiveFeedback(exerciseId) {
        // Mostrar sticker sorpresa
        this.showSurpriseReward(exerciseId);
        
        // Efecto visual de celebración
        const card = document.querySelector(`[data-exercise-id="${exerciseId}"]`)?.closest('.bg-white');
        if (card) {
            card.style.background = 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)';
            card.style.borderColor = '#16a34a';
            card.style.transform = 'scale(1.02)';
            
            setTimeout(() => {
                card.style.transform = 'scale(1)';
            }, 300);
        }
    }

    // ✅ DESCARGAR PDF - VERSIÓN DEBUG ACTUALIZADA
    async downloadPDF() {
        console.log('🔥 FUNCIÓN PDF LLAMADA - VERSIÓN NUEVA ACTUALIZADA');
        console.log('🔥 Ejercicios disponibles:', this.currentExercises.length);
        
        if (this.currentExercises.length === 0) {
            this.showErrorToast('Primero genera algunos ejercicios');
            console.log('🔥 No hay ejercicios disponibles');
            return;
        }
        
        try {
            this.showInfoToast('📄 Generando PDF con versión actualizada...');
            console.log('🔥 Iniciando proceso de PDF...');
            
            // Verificar librerías con logging detallado
            console.log('🔥 Verificando librerías:', {
                jspdf: !!window.jspdf,
                html2canvas: !!window.html2canvas,
                generatePDFReport: typeof generatePDFReport
            });
            
            if (!window.jspdf || !window.html2canvas) {
                console.error('🔥 Librerías PDF no disponibles');
                this.showErrorToast('Las librerías de PDF no están cargadas. Recarga la página.');
                return;
            }
            
            // Verificar función generatePDFReport
            if (typeof generatePDFReport !== 'function') {
                console.error('🔥 generatePDFReport no es una función');
                this.showErrorToast('Generador de PDF no disponible. Recarga la página.');
                return;
            }
            
            console.log('🔥 Obteniendo configuración...');
            const difficulty = document.getElementById('difficulty-select')?.value || 'medio';
            const operationType = document.getElementById('operation-type-select')?.value || 'ambos';
            const studentName = this.getCurrentStudentName();
            
            console.log('🔥 Configuración:', {
                difficulty,
                operationType,
                studentName,
                ejercicios: this.currentExercises.length
            });
            
            console.log('🔥 Llamando a generatePDFReport...');
            
            // Llamada al generador con opciones completas
            const pdfOptions = {
                studentName: studentName,
                difficulty: difficulty,
                operationType: operationType,
                exercises: this.currentExercises
            };
            
            console.log('🔥 Opciones de PDF:', pdfOptions);
            
            await generatePDFReport(this.currentExercises, pdfOptions);
            
            console.log('🔥 PDF generado exitosamente');
            this.showSuccessToast('📄 ¡PDF descargado exitosamente!');
            
        } catch (error) {
            console.error('🔥 Error completo al generar PDF:', error);
            console.error('🔥 Stack trace:', error.stack);
            this.showErrorToast(`Error al generar PDF: ${error.message}`);
        }
    }
    
    // 🔧 MÉTODO AUXILIAR: Obtener nombre del estudiante actual
    getCurrentStudentName() {
        // Intentar obtener de diferentes fuentes
        if (window.authManager?.currentUser?.user_metadata?.full_name) {
            return window.authManager.currentUser.user_metadata.full_name.split(' ')[0];
        }
        if (typeof matemáticaDashboardConfig !== 'undefined' && matemáticaDashboardConfig.currentStudentData) {
            return matemáticaDashboardConfig.currentStudentData.name;
        }
        return 'Estudiante';
    }

    // ✅ GENERAR EJERCICIOS VERTICALES
    async generateExercises() {
        try {
            const operationType = document.getElementById('operation-type-select')?.value || 'ambos';
            const difficulty = document.getElementById('difficulty-select')?.value || 'medio';
            const quantity = parseInt(document.getElementById('quantity-select')?.value || '10');
            
            const loader = document.getElementById('exercises-loader');
            const content = document.getElementById('exercises-content');
            const configLoader = document.getElementById('config-panel-loader');
            
            if (loader) loader.classList.remove('hidden');
            if (content) content.classList.add('hidden');
            if (configLoader) configLoader.classList.remove('hidden');
            
            console.log(`🧮 Generando ${quantity} ejercicios VERTICALES de tipo ${operationType} y nivel ${difficulty}...`);
            
            // Usar la función del dashboard.js si está disponible
            if (typeof generateMathExercises === 'function') {
                // Configurar el estado para dashboard.js
                const config = {
                    ejercicios_tipo: {
                        rangos: {
                            min: difficulty === 'facil' ? 1 : difficulty === 'medio' ? 10 : 20,
                            max: difficulty === 'facil' ? 20 : difficulty === 'medio' ? 50 : 99
                        }
                    }
                };
                
                const exercises = await generateMathExercises(config, quantity, difficulty);
                
                this.currentExercises = exercises.map(ex => ({
                    ...ex,
                    generatedWith: ex.generatedWith || 'local'
                }));
            } else {
                // Fallback: generador local simple
                this.currentExercises = this.generateLocalExercises(operationType, difficulty, quantity);
            }
            
            this.displayExercises();
            console.log(`✅ ${this.currentExercises.length} ejercicios VERTICALES generados correctamente`);
            
        } catch (error) {
            console.error('❌ Error generando ejercicios:', error);
            this.showErrorToast('Error al generar ejercicios. Inténtalo de nuevo.');
            const loader = document.getElementById('exercises-loader');
            if (loader) loader.classList.add('hidden');
            const configLoader = document.getElementById('config-panel-loader');
            if (configLoader) configLoader.classList.add('hidden');
        }
    }

    // ✅ GENERADOR LOCAL FALLBACK
    generateLocalExercises(operationType, difficulty, quantity) {
        const exercises = [];
        const ranges = {
            facil: { min: 1, max: 20 },
            medio: { min: 10, max: 50 },
            dificil: { min: 20, max: 99 }
        };
        
        const range = ranges[difficulty] || ranges.medio;
        
        for (let i = 0; i < quantity; i++) {
            let num1, num2, operation, answer;
            
            if (operationType === 'suma' || (operationType === 'ambos' && Math.random() > 0.5)) {
                num1 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
                num2 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
                operation = '+';
                answer = num1 + num2;
            } else {
                const larger = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
                const smaller = Math.floor(Math.random() * larger) + 1;
                num1 = larger;
                num2 = smaller;
                operation = '-';
                answer = num1 - num2;
            }
            
            exercises.push({
                id: i + 1,
                type: 'math_operation_vertical',
                num1,
                num2,
                operation,
                answer,
                difficulty,
                completed: false,
                correct: null,
                userAnswer: null,
                timeSpent: 0,
                generatedWith: 'local',
                showDUHelp: difficulty === 'facil'
            });
        }
        
        return exercises;
    }

    // ✅ MOSTRAR EJERCICIOS
    displayExercises() {
        const grid = document.getElementById('exercises-grid');
        const loader = document.getElementById('exercises-loader');
        const content = document.getElementById('exercises-content');
        const stats = document.getElementById('session-stats');
        const configLoader = document.getElementById('config-panel-loader');
        
        if (!grid) return;
        
        grid.innerHTML = '';
        
        // 🎯 ESCALA RESPONSIVE GRANULAR CON CSS INLINE
        const screenWidth = window.innerWidth;
        if (screenWidth >= 1000) {
            // 🖥️ Desktop grande: 5 columnas
            grid.style.gridTemplateColumns = 'repeat(5, minmax(0, 1fr))';
            console.log('🖥️ Desktop - 5 columnas - Ancho:', screenWidth);
        } else if (screenWidth >= 768) {
            // 💻 Tablet: 3 columnas
            grid.style.gridTemplateColumns = 'repeat(3, minmax(0, 1fr))';
            console.log('💻 Tablet - 3 columnas - Ancho:', screenWidth);
        } else {
            // 📱 Móvil: 2 columnas
            grid.style.gridTemplateColumns = 'repeat(1, minmax(0, 1fr))';
            console.log('📱 Móvil - 1 columna - Ancho:', screenWidth);
        }
        
        this.currentExercises.forEach((exercise, index) => {
            const exerciseCard = this.createVerticalExerciseCard(exercise);
            grid.appendChild(exerciseCard);
        });
        
        if (loader) loader.classList.add('hidden');
        if (content) content.classList.remove('hidden');
        if (stats) stats.classList.remove('hidden');
        if (configLoader) configLoader.classList.add('hidden');
        
        this.updateStats();
        
        // 🎯 LISTENER PARA CAMBIOS DE TAMAÑO DE VENTANA
        this.setupResponsiveListener();
    }

    // ✅ CREAR TARJETA VERTICAL DE EJERCICIO
    createVerticalExerciseCard(exercise) {
        const div = document.createElement('div');
        
        // 🎯 NUEVO: Clases CSS condicionales para ejercicios completados
        const cardClasses = exercise.completed 
            ? 'bg-gray-100 border-3 rounded-xl p-4 shadow-lg transition-all opacity-75' // Gris cuando está completado
            : `bg-white border-3 rounded-xl p-4 shadow-lg transition-all hover:shadow-xl ${
                exercise.generatedWith === 'gemini-ai' ? 'border-purple-300 bg-gradient-to-br from-white to-purple-50' : 'border-blue-300'
            }`;
        
        div.className = cardClasses;
        
        const formatNumber = (num) => num.toString().padStart(2, '0');
        
        const num1Formatted = formatNumber(exercise.num1);
        const num2Formatted = formatNumber(exercise.num2);
        const num1Decena = num1Formatted[0];
        const num1Unidad = num1Formatted[1];
        const num2Decena = num2Formatted[0];
        const num2Unidad = num2Formatted[1];
        
        // Detectar si necesita reserva para mostrar los campos correspondientes
        const needsCarry = exercise.operation === '+' ? 
            ((exercise.num1 % 10) + (exercise.num2 % 10)) >= 10 : 
            (exercise.num1 % 10) < (exercise.num2 % 10);
            
        const difficulty = exercise.difficulty || 'medio';
        const showCarryHelp = difficulty === 'medio' || difficulty === 'dificil';
        const showDUHelp = difficulty === 'facil'; // 🆕 Para mostrar D|U en fácil
        
        div.innerHTML = `
            <!-- Header del ejercicio -->
            <div class="text-xs font-bold text-gray-600 mb-3 flex justify-between items-center">
                <span class="bg-blue-100 px-2 py-1 rounded-full flex items-center">
                    <span class="mr-1">🧮</span> #${exercise.id}
                </span>
                <!-- 🎨 NUEVO: Badge simple sin stickers hasta completar -->
                <span class="${exercise.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} px-2 py-1 rounded-full text-xs font-bold">
                    ${exercise.completed ? '✅ ¡Listo!' : '😊 Intentalo'}
                </span>
            </div>
            
            <!-- ✅ ESTRUCTURA VERTICAL PERFECTA con reserva -->
            <div class="vertical-math-container ${exercise.completed ? 'bg-gray-200' : 'bg-gray-50'} border-2 ${exercise.completed ? 'border-gray-300' : 'border-gray-200'} rounded-lg p-4 mb-4">
                <div class="grid grid-cols-4 gap-2 text-center font-mono">
                    ${showCarryHelp && needsCarry ? `
                        <!-- Fila 0: Reserva (solo si es necesaria y NO es fácil) -->
                        <div></div>
                        <input type="text" 
                               class="w-full h-8 text-center border border-yellow-300 rounded bg-yellow-100 text-sm font-bold font-mono focus:outline-none focus:ring-2 focus:ring-yellow-500"
                               maxlength="1"
                               data-exercise-id="${exercise.id}"
                               data-digit="reserva-decena"
                               title="Reserva decenas"
                               ${exercise.completed ? 'readonly' : ''}
                               ${exercise.completed && needsCarry ? `value="1"` : ''}>
                        <input type="text"
                               class="w-full h-8 text-center border border-yellow-300 rounded bg-yellow-100 text-sm font-bold font-mono focus:outline-none focus:ring-2 focus:ring-yellow-500"
                               maxlength="1"
                               data-exercise-id="${exercise.id}"
                               data-digit="reserva-unidad"
                               title="Reserva unidades"
                               ${exercise.completed ? 'readonly' : ''}
                               ${exercise.completed && needsCarry ? `value="1"` : ''}>
                        <div></div>
                    ` : ''}
                    
                    ${showDUHelp ? `
                        <!-- 🆕 Fila 0: Ayuda D|U para nivel FÁCIL -->
                        <div></div>
                        <div class="w-full h-6 text-center bg-red-100 border border-red-200 rounded text-red-600 font-bold text-sm flex items-center justify-center">
                            D
                        </div>
                        <div class="w-full h-6 text-center bg-blue-100 border border-blue-200 rounded text-blue-600 font-bold text-sm flex items-center justify-center">
                            U
                        </div>
                        <div></div>
                    ` : ''}
                    
                    <!-- Fila 1: Primer número -->
                    <div></div>
                    <div class="bg-white border border-gray-300 rounded p-2 text-lg font-bold text-blue-800">${num1Decena}</div>
                    <div class="bg-white border border-gray-300 rounded p-2 text-lg font-bold text-blue-800">${num1Unidad}</div>
                    <div></div>
                    
                    <!-- Fila 2: Operador + segundo número -->
                    <div class="flex items-center justify-center text-xl font-bold text-orange-600">${exercise.operation}</div>
                    <div class="bg-white border border-gray-300 rounded p-2 text-lg font-bold text-blue-800">${num2Decena}</div>
                    <div class="bg-white border border-gray-300 rounded p-2 text-lg font-bold text-blue-800">${num2Unidad}</div>
                    <div></div>
                    
                    <!-- Fila 3: Línea divisoria -->
                    <div class="col-span-4 border-t-2 border-gray-600 my-2"></div>
                    
                    ${!showDUHelp ? `
                        <!-- Fila 4: Centenas (solo para niveles medio y difícil) -->
                        <input type="text" 
                               class="w-full h-10 text-center border-2 border-green-400 rounded bg-green-50 text-lg font-bold font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
                               maxlength="1"
                               data-exercise-id="${exercise.id}"
                               data-digit="centena"
                               title="Centenas"
                               ${exercise.completed ? 'readonly' : ''}
                               ${exercise.completed ? `value="${Math.floor(exercise.answer / 100) || ''}"` : ''}>
                    ` : `
                        <!-- Fila 4: Espacio vacío para nivel fácil -->
                        <div></div>
                    `}
                    
                    <!-- Fila 5: Inputs para respuesta (Decenas y Unidades) -->
                    <input type="text" 
                           class="w-full h-10 text-center border-2 border-blue-400 rounded bg-blue-50 text-lg font-bold font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                           maxlength="1"
                           data-exercise-id="${exercise.id}"
                           data-digit="decena"
                           title="Decenas"
                           ${exercise.completed ? 'readonly' : ''}
                           ${exercise.completed ? `value="${Math.floor((exercise.answer % 100) / 10)}"` : ''}>
                    <input type="text"
                           class="w-full h-10 text-center border-2 border-blue-400 rounded bg-blue-50 text-lg font-bold font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                           maxlength="1"
                           data-exercise-id="${exercise.id}"
                           data-digit="unidad"
                           title="Unidades"
                           ${exercise.completed ? 'readonly' : ''}
                           ${exercise.completed ? `value="${exercise.answer % 10}"` : ''}>
                    <div></div>
                </div>
            </div>
            
            <!-- Botón de verificación -->
            <div class="space-y-2">
                <button class="check-answer-btn w-full py-3 px-4 text-sm font-bold rounded-lg transition-all ${
                    exercise.completed ? 
                    'bg-gray-100 text-gray-500 cursor-not-allowed' : 
                    'bg-green-500 hover:bg-green-600 text-white hover:scale-105'}"
                    data-exercise-id="${exercise.id}"
                    ${exercise.completed ? 'disabled' : ''}
                    onclick="adicionSustraccionModule.checkAnswer(${exercise.id})">
                ${exercise.completed ? 
                    (exercise.correct ? '✅ ¡Correcto!' : '❌ Incorrecto') : 
                    '🎯 ¡Comprobar!'}
                </button>
                
                <!-- 🎉 NUEVO: Feedback positivo con stickers sorpresa (solo si está correcto) -->
                ${exercise.completed && exercise.correct ? `
                    <div class="surprise-feedback bg-gradient-to-r from-yellow-100 to-green-100 border-2 border-green-300 rounded-lg p-3 text-center">
                        <div class="text-2xl mb-2" id="surprise-sticker-${exercise.id}">
                            <!-- El sticker sorpresa se carga aquí -->
                        </div>
                        <div class="text-sm font-bold text-green-700" id="positive-message-${exercise.id}">
                            <!-- El mensaje positivo se carga aquí -->
                        </div>
                    </div>
                ` : ''}
                
                ${exercise.completed && !exercise.correct ? `
                    <div class="text-sm text-green-700 text-center bg-green-50 p-2 rounded-lg border border-green-200">
                        ✅ Respuesta: <strong>${exercise.answer}</strong>
                    </div>
                ` : ''}
                
                <!-- ✅ NUEVO: Botón de Ayuda Pedagógica -->
                ${!exercise.completed ? `
                    <button class="help-btn w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition-all"
                            onclick="adicionSustraccionModule.showPedagogicalHelp(${exercise.id})">
                        🆘 ¡Necesito Ayuda!
                    </button>
                ` : ''}
            </div>
        `;
        
        // ✅ CONFIGURAR INPUTS PARA SOLO NÚMEROS
        this.setupNumberOnlyInputs(div, exercise.id);
        
        // 🎉 NUEVO: Si el ejercicio ya está completado y correcto, mostrar sorpresa
        if (exercise.completed && exercise.correct) {
            setTimeout(() => this.showSurpriseReward(exercise.id), 100);
        }
        
        return div;
    }

    // ✅ NUEVO: Mostrar recompensa sorpresa (sticker y mensaje) - CORREGIDO DINÁMICAMENTE
    showSurpriseReward(exerciseId) {
        console.log(`🎯 Intentando mostrar sorpresa para ejercicio ${exerciseId}`);
        
        // Buscar los elementos con más especificidad y verificación
        const exerciseCard = document.querySelector(`[data-exercise-id="${exerciseId}"]`)?.closest('.bg-white, .bg-gray-100');
        if (!exerciseCard) {
            console.log(`❌ No se encontró tarjeta para ejercicio ${exerciseId}`);
            return;
        }
        
        let stickerDiv = exerciseCard.querySelector(`#surprise-sticker-${exerciseId}`);
        let messageDiv = exerciseCard.querySelector(`#positive-message-${exerciseId}`);
        
        console.log(`🔍 Elementos encontrados - Sticker: ${!!stickerDiv}, Mensaje: ${!!messageDiv}`);
        
        // 🆕 Si no existen los elementos, crearlos dinámicamente
        if (!stickerDiv || !messageDiv) {
            console.log(`🔧 Creando sección de sorpresa dinámicamente para ejercicio ${exerciseId}`);
            
            // Buscar el botón de verificación para insertar después
            const checkButton = exerciseCard.querySelector('.check-answer-btn');
            if (!checkButton) {
                console.log(`❌ No se encontró botón de verificación para ejercicio ${exerciseId}`);
                return;
            }
            
            // Crear la sección de sorpresa completa
            const surpriseSection = document.createElement('div');
            surpriseSection.className = 'surprise-feedback bg-gradient-to-r from-yellow-100 to-green-100 border-2 border-green-300 rounded-lg p-3 text-center mt-2';
            surpriseSection.innerHTML = `
                <div class="text-2xl mb-2" id="surprise-sticker-${exerciseId}">
                    <!-- El sticker sorpresa se carga aquí -->
                </div>
                <div class="text-sm font-bold text-green-700" id="positive-message-${exerciseId}">
                    <!-- El mensaje positivo se carga aquí -->
                </div>
            `;
            
            // Insertar después del botón de verificación
            checkButton.parentNode.insertBefore(surpriseSection, checkButton.nextSibling);
            
            // Actualizar las referencias
            stickerDiv = exerciseCard.querySelector(`#surprise-sticker-${exerciseId}`);
            messageDiv = exerciseCard.querySelector(`#positive-message-${exerciseId}`);
            
            console.log(`✅ Sección de sorpresa creada dinámicamente. Sticker: ${!!stickerDiv}, Mensaje: ${!!messageDiv}`);
        }
        
        if (stickerDiv && messageDiv) {
            // 🎨 Array de stickers divertidos para niños (aleatorios)
            const kidStickers = ['🦄', '🐱', '🐶', '🐼', '🦊', '🐸', '🐝', '🦋', '🌟', '💖', '🍭', '🎈', '🌈', '⭐', '🍎', '🎀', '🐰', '🐯', '🐻', '🎯', '🎊', '🎉', '💝', '🌺', '🦆', '🐙', '🦸'];
            
            // 🎲 Sticker completamente aleatorio (no basado en exerciseId)
            const randomIndex = Math.floor(Math.random() * kidStickers.length);
            const surpriseSticker = kidStickers[randomIndex];
            
            // 🎉 Mensajes positivos aleatorios
            const positiveMessages = [
                '¡Excelente trabajo!',
                '¡Eres increíble!',
                '¡Lo lograste!',
                '¡Fantástico!',
                '¡Súper bien!',
                '¡Genial!',
                '¡Perfecto!',
                '¡Bravo!',
                '¡Asombroso!',
                '¡Magnífico!'
            ];
            
            const randomMessage = positiveMessages[Math.floor(Math.random() * positiveMessages.length)];
            
            // 🎭 Mostrar sticker sorpresa con animación
            stickerDiv.innerHTML = `<span class="text-3xl animate-bounce">${surpriseSticker}</span>`;
            
            // 🎨 Mostrar mensaje positivo con animación
            messageDiv.textContent = randomMessage;
            messageDiv.className = 'text-sm font-bold text-green-700 animate-pulse';
            
            // 🔊 Reproducir sonido de éxito (si existe)
            try {
                const successSound = document.getElementById('success-sound');
                if (successSound) {
                    successSound.currentTime = 0;
                    successSound.play().catch(() => {
                        // Silenciosamente ignorar errores de audio
                        console.log('🔇 Audio no disponible - continuando sin sonido');
                    });
                }
            } catch (error) {
                // Ignorar errores de audio
                console.log('🔇 Error de audio ignorado:', error.message);
            }
            
            console.log(`🎉 Sorpresa mostrada para ejercicio ${exerciseId}: ${surpriseSticker} - ${randomMessage}`);
        } else {
            console.log(`❌ FALLO CRÍTICO: No se pudieron crear elementos de sorpresa para ejercicio ${exerciseId}`);
        }
    }

    // ✅ NUEVO: Configurar inputs para solo números
    setupNumberOnlyInputs(container, exerciseId) {
        const inputs = container.querySelectorAll('input[type="text"]');
        
        inputs.forEach(input => {
            // Solo permitir números del 0-9
            input.addEventListener('input', function(e) {
                // Remover todo lo que no sea número
                this.value = this.value.replace(/[^0-9]/g, '');
                
                // Limitar a 1 dígito
                if (this.value.length > 1) {
                    this.value = this.value.slice(0, 1);
                }
            });
            
            // Prevenir pegado de texto no numérico
            input.addEventListener('paste', function(e) {
                e.preventDefault();
                const paste = (e.clipboardData || window.clipboardData).getData('text');
                const numericPaste = paste.replace(/[^0-9]/g, '');
                if (numericPaste.length > 0) {
                    this.value = numericPaste.slice(0, 1);
                }
            });
            
            // Prevenir teclas no numéricas (excepto navegación)
            input.addEventListener('keydown', function(e) {
                // Permitir: backspace, delete, tab, escape, enter
                if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                    // Permitir: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                    (e.keyCode === 65 && e.ctrlKey === true) ||
                    (e.keyCode === 67 && e.ctrlKey === true) ||
                    (e.keyCode === 86 && e.ctrlKey === true) ||
                    (e.keyCode === 88 && e.ctrlKey === true) ||
                    // Permitir: home, end, left, right
                    (e.keyCode >= 35 && e.keyCode <= 39)) {
                    return;
                }
                // Asegurar que es un número (0-9)
                if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                    e.preventDefault();
                }
            });
            
            // Auto-avanzar al siguiente input cuando se complete
            input.addEventListener('input', function() {
                if (this.value.length === 1) {
                    const nextInput = this.parentElement.nextElementSibling?.querySelector('input[type="text"]');
                    if (nextInput && !nextInput.hasAttribute('readonly')) {
                        nextInput.focus();
                    }
                }
            });
        });
    }
    
    // ✅ VERIFICAR RESPUESTA - Sistema unificado de feedback y ayuda
    async checkAnswer(exerciseId) {
        try {
            const exercise = this.currentExercises.find(ex => ex.id === exerciseId);
            if (!exercise || exercise.completed) return;
            
            // 🚫 PREVENIR MÚLTIPLES CLICKS - Deshabilitar botón inmediatamente
            const button = document.querySelector(`button[onclick*="checkAnswer(${exerciseId})"]`);
            if (button) {
                button.disabled = true;
                button.style.pointerEvents = 'none';
            }
            
            const card = document.querySelector(`[data-exercise-id="${exerciseId}"]`)?.closest('.bg-white, .bg-gray-100');
            if (!card) {
                // Re-habilitar botón si no se encuentra la tarjeta
                if (button) {
                    button.disabled = false;
                    button.style.pointerEvents = 'auto';
                }
                return;
            }
            
            // Obtener todos los inputs de respuesta
            const centenaInput = card.querySelector('input[data-digit="centena"]');
            const decenaInput = card.querySelector('input[data-digit="decena"]');
            const unidadInput = card.querySelector('input[data-digit="unidad"]');
            
            if (!decenaInput || !unidadInput) {
                // Re-habilitar botón si no se encuentran los inputs
                if (button) {
                    button.disabled = false;
                    button.style.pointerEvents = 'auto';
                }
                return;
            }
            
            // Construir la respuesta del usuario
            let userAnswer = 0;
            
            const centena = centenaInput?.value ? parseInt(centenaInput.value) || 0 : 0;
            const decena = parseInt(decenaInput.value) || 0;
            const unidad = parseInt(unidadInput.value) || 0;
            
            userAnswer = (centena * 100) + (decena * 10) + unidad;
            
            // Validar que se hayan completado los campos esenciales
            if (decenaInput.value.trim() === '' || unidadInput.value.trim() === '') {
                this.showErrorToast('Por favor, completa los dígitos de la respuesta');
                // Re-habilitar botón
                if (button) {
                    button.disabled = false;
                    button.style.pointerEvents = 'auto';
                }
                return;
            }
            
            // Para respuestas de 3 dígitos, validar centena
            if (exercise.answer >= 100 && (!centenaInput?.value || centenaInput.value.trim() === '')) {
                this.showErrorToast('Este resultado necesita centenas. Completa todos los campos.');
                // Re-habilitar botón
                if (button) {
                    button.disabled = false;
                    button.style.pointerEvents = 'auto';
                }
                return;
            }
            
            const isCorrect = userAnswer === exercise.answer;
            
            if (isCorrect) {
                // ✅ RESPUESTA CORRECTA
                exercise.completed = true;
                exercise.correct = isCorrect;
                exercise.userAnswer = userAnswer;
                exercise.timeSpent = Date.now() - (exercise.startTime || Date.now());
                
                // 🎉 NUEVO: Lanzar confeti inmediatamente
                this.launchConfetti();
                
                // Actualizar UI para respuesta correcta
                if (button) {
                    button.textContent = '✅ ¡Correcto!';
                    button.className = 'check-answer-btn w-full py-3 px-4 text-sm font-bold rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed';
                    button.disabled = true;
                    button.style.pointerEvents = 'none';
                    // 🚫 ELIMINAR onclick para prevenir bucle infinito
                    button.removeAttribute('onclick');
                }
                
                // Deshabilitar todos los inputs
                const allInputs = card.querySelectorAll('input[type="text"]');
                allInputs.forEach(input => {
                    input.setAttribute('readonly', 'true');
                    input.style.backgroundColor = '#f3f4f6';
                });
                
                // Remover botón de ayuda Y cualquier feedback anterior
                const helpButton = card.querySelector('.help-btn');
                if (helpButton) {
                    helpButton.remove();
                }
                this.removeExistingFeedback(exerciseId);
                
                // Feedback positivo
                await this.showPositiveFeedback(exerciseId);
                this.showSuccessToast('¡Excelente! ¡Respuesta correcta! 🎉');
                
            } else {
                // ❌ RESPUESTA INCORRECTA - FEEDBACK PROGRESIVO UNIFICADO
                exercise.userAnswer = userAnswer;
                
                // Inicializar contador de intentos si no existe
                if (!exercise.attemptCount) {
                    exercise.attemptCount = 1;
                } else {
                    exercise.attemptCount++;
                }
                
                // Cambiar botón a "Volver a intentar" y re-habilitarlo
                if (button) {
                    button.textContent = 'Volver a intentar 😊';
                    button.className = 'check-answer-btn w-full py-3 px-4 text-sm font-bold rounded-lg bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white transition-all transform hover:scale-105';
                    button.disabled = false;
                    button.style.pointerEvents = 'auto';
                }
                
                // Limpiar inputs para nuevo intento
                const allInputs = card.querySelectorAll('input[type="text"]');
                allInputs.forEach(input => {
                    if (!input.dataset.digit.includes('reserva')) {
                        input.value = '';
                        input.style.backgroundColor = '';
                        input.removeAttribute('readonly');
                    }
                });
                
                // 🎯 NUEVO: FEEDBACK AUTOMÁTICO PROGRESIVO usando el sistema unificado
                await this.showProgressiveFeedback(exerciseId, exercise.attemptCount);
                
                this.showInfoToast('¡No te preocupes! Inténtalo de nuevo 💪');
            }
            
            this.updateStats();
            
            console.log(`${isCorrect ? '✅' : '🔄'} Ejercicio ${exerciseId}: ${userAnswer} (Correcto: ${exercise.answer}) - Intento: ${exercise.attemptCount || 1}`);
            
        } catch (error) {
            console.error('Error verificando respuesta:', error);
            this.showErrorToast('Error al verificar la respuesta');
            
            // Re-habilitar botón en caso de error
            const button = document.querySelector(`button[onclick*="checkAnswer(${exerciseId})"]`);
            if (button) {
                button.disabled = false;
                button.style.pointerEvents = 'auto';
            }
        }
    }

    // 🎉 NUEVO: Sistema de confeti específico para el módulo
    launchConfetti() {
        console.log('🎉 ¡Lanzando confeti por respuesta correcta!');
        
        // Usar el sistema de confeti global si existe
        if (typeof window.launchConfetti === 'function') {
            window.launchConfetti();
            return;
        }
        
        // Crear contenedor de confeti si no existe
        let confettiContainer = document.getElementById('confetti-container');
        if (!confettiContainer) {
            confettiContainer = document.createElement('div');
            confettiContainer.id = 'confetti-container';
            confettiContainer.className = 'fixed inset-0 pointer-events-none z-50 overflow-hidden';
            confettiContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 1000;
                overflow: hidden;
            `;
            document.body.appendChild(confettiContainer);
        }
        
        // Crear múltiples piezas de confeti
        const confettiCount = 50;
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
        const shapes = ['●', '▲', '■', '★', '♦', '♥', '♠', '♣', '🌟', '⭐', '💖', '🎈', '🎉', '🎊'];
        
        for (let i = 0; i < confettiCount; i++) {
            this.createConfettiPiece(confettiContainer, colors, shapes);
        }
        
        // Reproducir sonido de celebración (si está disponible)
        this.playSuccessSound();
        
        // Limpiar confeti después de la animación
        setTimeout(() => {
            if (confettiContainer) {
                confettiContainer.innerHTML = '';
            }
        }, 4000);
    }

    // 🎨 NUEVO: Crear pieza individual de confeti
    createConfettiPiece(container, colors, shapes) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        
        // Propiedades aleatorias
        const color = colors[Math.floor(Math.random() * colors.length)];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const size = Math.random() * 10 + 8; // Entre 8px y 18px
        const startX = Math.random() * window.innerWidth;
        const duration = Math.random() * 2 + 2; // Entre 2s y 4s
        const delay = Math.random() * 0.5; // Hasta 0.5s de delay
        
        // Estilos del confeti con animación CSS
        confetti.style.cssText = `
            position: absolute;
            top: -20px;
            left: ${startX}px;
            color: ${color};
            font-size: ${size}px;
            animation: confetti-fall ${duration}s linear ${delay}s forwards;
            pointer-events: none;
            user-select: none;
            z-index: 1000;
            font-weight: bold;
        `;
        
        confetti.textContent = shape;
        container.appendChild(confetti);
        
        // Auto-remover después de la animación
        setTimeout(() => {
            if (confetti && confetti.parentNode) {
                confetti.remove();
            }
        }, (duration + delay) * 1000);
    }

    // 🔊 NUEVO: Reproducir sonido de éxito
    playSuccessSound() {
        try {
            // Usar función global si existe
            if (typeof window.playSuccessSound === 'function') {
                window.playSuccessSound();
                return;
            }
            
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
            console.log('🔇 Audio no disponible:', error.message);
        }
    }
    
    // ✅ GENERAR AYUDA PEDAGÓGICA CON IA
    async generatePedagogicalHelpWithAI(exercise) {
        // Determinar nivel de frustración basado en intentos anteriores
        const attemptCount = exercise.attemptCount || 0;
        const frustrationLevel = this.getFrustrationLevel(attemptCount);
        
        // Intentar generar con IA primero
        if (window.geminiAI && window.geminiAI.configured) {
            try {
                console.log(`🤖 Generando ayuda pedagógica con IA para ${exercise.num1} ${exercise.operation} ${exercise.num2}`);
                
                const aiHelp = await this.generateAIHelp(exercise, frustrationLevel);
                if (aiHelp) {
                    return this.formatAIHelpContent(aiHelp, exercise);
                }
            } catch (error) {
                console.warn('⚠️ Error con IA, usando fallback:', error);
            }
        }
        
        // Fallback: ayuda local mejorada con emojis y ejemplos
        return this.generateLocalExplanatoryHelp(exercise, frustrationLevel);
    }

    // 📊 Determinar nivel de frustración
    getFrustrationLevel(attemptCount) {
        if (attemptCount === 0) return 'inicial';
        if (attemptCount === 1) return 'bajo';
        if (attemptCount === 2) return 'medio';
        return 'alto';
    }

    // 🤖 Generar ayuda con IA de Gemini
    async generateAIHelp(exercise, frustrationLevel) {
        const operationText = exercise.operation === '+' ? 'suma' : 'resta';
        const needsBorrow = exercise.operation === '-' && this.needsBorrowingHelp(exercise);
        const needsCarry = exercise.operation === '+' && ((exercise.num1 % 10) + (exercise.num2 % 10)) >= 10;
        
        // Crear prompt específico según nivel de frustración
        let frustrationContext = '';
        switch (frustrationLevel) {
            case 'inicial':
                frustrationContext = 'El niño está empezando, usa motivación positiva y explicaciones simples con ejemplos visuales.';
                break;
            case 'bajo':
                frustrationContext = 'El niño se equivocó una vez, dale más confianza y explica paso a paso con objetos familiares.';
                break;
            case 'medio':
                frustrationContext = 'El niño lleva 2 intentos fallidos, necesita más apoyo emocional y técnicas específicas.';
                break;
            case 'alto':
                frustrationContext = 'El niño está frustrado (3+ intentos), usa mucha empatía, técnicas alternativas y ejemplos diferentes.';
                break;
        }

        const prompt = `Eres una profesora de matemáticas muy cariñosa para un niño de 7-8 años. 

OPERACIÓN: ${exercise.num1} ${exercise.operation} ${exercise.num2}
CONTEXTO: ${frustrationContext}
TIPO: ${needsBorrow ? 'resta con préstamo' : needsCarry ? 'suma con reserva' : operationText + ' simple'}

INSTRUCCIONES IMPORTANTES:
- NUNCA reveles la respuesta final (${exercise.answer})
- Usa emojis divertidos (🍎🐱🌟🎈🧸🎯) 
- Incluye ejemplos con objetos que le gusten a los niños
- Explica con metáforas visuales y táctiles
- Da técnicas específicas para ${needsBorrow ? 'el préstamo' : needsCarry ? 'llevar números' : 'la operación'}
- Ajusta el tono según el nivel de frustración
- Usa máximo 4-5 oraciones cortas
- Incluye trucos o técnicas especiales
- Termina con motivación personalizada

EJEMPLO DE ESTRUCTURA:
🌟 [Saludo empático]
🎯 [Explicación con objetos familiares]
🔢 [Técnica específica paso a paso]
💡 [Truco o consejo especial]
💪 [Motivación final]

Responde SOLO con el contenido pedagógico, sin formato adicional.`;
        
        try {
            const response = await window.geminiAI.generateContent(prompt);
            return response;
        } catch (error) {
            console.error('Error generando ayuda con IA:', error);
            return null;
        }
    }

    // 🎨 Formatear contenido de ayuda con IA
    formatAIHelpContent(aiHelp, exercise) {
        return `
            <div class="bg-gradient-to-r from-indigo-100 to-purple-100 border-2 border-indigo-400 rounded-lg p-4">
                <div class="text-center mb-2">
                    <span class="text-lg font-bold text-indigo-700">🤖✨ Ayuda Mágica de la IA</span>
                </div>
                <div class="text-sm text-gray-800 leading-relaxed">
                    ${aiHelp.replace(/\n/g, '<br>')}
                </div>
                <div class="mt-3 text-center">
                    <div class="text-xs text-indigo-600 font-bold">🧙‍♀️ Generado especialmente para ti</div>
                </div>
                <button onclick="this.closest('.ayuda_pedagogica').remove()" 
                        class="mt-3 w-full py-2 bg-gray-200 hover:bg-gray-300 rounded text-xs">
                    Cerrar ❌
                </button>
            </div>
        `;
    }

    // 📚 Ayuda local explicativa como fallback
    generateLocalExplanatoryHelp(exercise, frustrationLevel) {
        const needsBorrow = exercise.operation === '-' && this.needsBorrowingHelp(exercise);
        const needsCarry = exercise.operation === '+' && ((exercise.num1 % 10) + (exercise.num2 % 10)) >= 10;
        
        // Mensajes motivacionales según frustración
        const motivationMessages = {
            inicial: "¡Perfecto! Vamos a resolver esto juntos 🌟",
            bajo: "¡No te preocupes! Todo matemático se equivoca 💪",
            medio: "¡Estás muy cerca! Vamos paso a paso 🎯",
            alto: "¡Eres increíble por seguir intentando! 🦄"
        };
        
        const motivation = motivationMessages[frustrationLevel] || motivationMessages.inicial;
        
        if (needsBorrow) {
            return `
                <div class="bg-gradient-to-r from-pink-100 to-purple-100 border-2 border-pink-400 rounded-lg p-4">
                    <div class="text-center mb-2">
                        <span class="text-lg font-bold text-pink-700">🏠 Casa de los Números</span>
                    </div>
                    <div class="text-sm text-gray-800">
                        <div class="mb-2 text-center font-bold text-purple-700">${motivation}</div>
                        <div class="mb-2">🧮 <strong>Problema:</strong> ${exercise.num1 % 10} unidades son menos que ${exercise.num2 % 10}</div>
                        <div class="mb-2">🏠 <strong>Solución:</strong> ¡Pide prestado 10 de las decenas!</div>
                        <div class="mb-2">📦 <strong>10 unidades = 1 decena</strong></div>
                        <div class="mb-2">🔄 <strong>Ahora tienes:</strong> ${(exercise.num1 % 10) + 10} unidades para restar</div>
                        <div class="mb-2">🎯 <strong>Calcula:</strong> ${(exercise.num1 % 10) + 10} - ${exercise.num2 % 10} = ?</div>
                        <div class="text-center mt-3 text-pink-700 font-bold">¡Como pedir prestado juguetes! 🧸</div>
                    </div>
                    <button onclick="this.closest('.ayuda_pedagogica').remove()" 
                            class="mt-3 w-full py-2 bg-gray-200 hover:bg-gray-300 rounded text-xs">
                        Cerrar ❌
                    </button>
                </div>
            `;
        } else if (needsCarry) {
            return `
                <div class="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 rounded-lg p-4">
                    <div class="text-center mb-2">
                        <span class="text-lg font-bold text-yellow-700">🎒 Mochila de Números</span>
                    </div>
                    <div class="text-sm text-gray-800">
                        <div class="mb-2 text-center font-bold text-teal-700">${motivation}</div>
                        <div class="mb-2">🧮 <strong>Suma:</strong> ${exercise.num1 % 10} + ${exercise.num2 % 10} unidades</div>
                        <div class="mb-2">🎒 <strong>¡Ups!</strong> Son más de 9, necesitas una mochila extra</div>
                        <div class="mb-2">📦 <strong>10 unidades = 1 decena</strong></div>
                        <div class="mb-2">✨ <strong>Truco:</strong> Guarda 1 decena en la mochila</div>
                        <div class="mb-2">🎯 <strong>Ahora suma las decenas:</strong> ${Math.floor(exercise.num1/10)} + ${Math.floor(exercise.num2/10)} + 1</div>
                        <div class="text-center mt-3 text-yellow-700 font-bold">¡Como juntar caramelos! 🍭</div>
                    </div>
                    <button onclick="this.closest('.ayuda_pedagogica').remove()" 
                            class="mt-3 w-full py-2 bg-gray-200 hover:bg-gray-300 rounded text-xs">
                        Cerrar ❌
                    </button>
                </div>
            `;
        } else {
            // Suma o resta simple
            const operationName = exercise.operation === '+' ? 'Suma' : 'Resta';
            const operationColor = exercise.operation === '+' ? 'green' : 'blue';
            const emoji = exercise.operation === '+' ? '🌱' : '🎯';
            
            return `
                <div class="bg-gradient-to-r from-${operationColor}-100 to-teal-100 border-2 border-${operationColor}-400 rounded-lg p-4">
                    <div class="text-center mb-2">
                        <span class="text-lg font-bold text-${operationColor}-700">${emoji} ${operationName} Fácil</span>
                    </div>
                    <div class="text-sm text-gray-800">
                        <div class="mb-2 text-center font-bold text-teal-700">${motivation}</div>
                        <div class="mb-2">1️⃣ <strong>Unidades:</strong> ${exercise.num1 % 10} ${exercise.operation} ${exercise.num2 % 10} = ?</div>
                        <div class="mb-2">2️⃣ <strong>Decenas:</strong> ${Math.floor(exercise.num1/10)} ${exercise.operation} ${Math.floor(exercise.num2/10)} = ?</div>
                        <div class="mb-2">3️⃣ <strong>Junta:</strong> Decenas + Unidades</div>
                        <div class="mb-2"><strong>🖐️ Truco:</strong> Usa tus dedos o dibuja palitos</div>
                        <div class="mb-2"><strong>🎨 Imagina:</strong> ${exercise.operation === '+' ? 'Juntar ' : 'Quitar '} ${exercise.operation === '+' ? 'manzanas' : 'globos'}</div>
                        <div class="text-center mt-3 text-${operationColor}-700 font-bold">¡Paso a paso siempre funciona! ⭐</div>
                    </div>
                    <button onclick="this.closest('.ayuda_pedagogica').remove()" 
                            class="mt-3 w-full py-2 bg-gray-200 hover:bg-gray-300 rounded text-xs">
                        Cerrar ❌
                    </button>
                </div>
            `;
        }
    }

    // 🗑️ NUEVO: Función para remover feedback anterior
    removeExistingFeedback(exerciseId) {
        const helpButton = document.querySelector(`button[onclick*="showPedagogicalHelp(${exerciseId})"]`);
        if (helpButton && helpButton.parentNode) {
            // Remover ayuda manual, feedback automático Y mensajes de carga
            const existingHelp = helpButton.parentNode.querySelector('.ayuda-pedagogica');
            const existingFeedback = helpButton.parentNode.querySelector('.feedback-automatico');
            const existingLoading = helpButton.parentNode.querySelector('.ayuda-cargando');
            
            if (existingHelp) {
                existingHelp.remove();
            }
            if (existingFeedback) {
                existingFeedback.remove();
            }
            if (existingLoading) {
                existingLoading.remove();
            }
        }
    }

    // 🔄 NUEVO: Feedback progresivo unificado
    async showProgressiveFeedback(exerciseId, attemptCount) {
        const exercise = this.currentExercises.find(ex => ex.id === exerciseId);
        if (!exercise) return;
        
        // Remover cualquier feedback anterior
        this.removeExistingFeedback(exerciseId);
        
        // Determinar el tipo de ayuda según la operación y el intento
        let contenidoFeedback = '';
        const esResta = exercise.operation === '-';
        const necesitaPrestamo = esResta && this.needsBorrowingHelp(exercise);
        
        if (attemptCount === 1) {
            // 🥇 PRIMER INTENTO: Motivación y revisión básica
            contenidoFeedback = `
                <div class="bg-blue-100 border-2 border-blue-400 rounded-lg p-3">
                    <div class="text-center mb-2">
                        <span class="text-lg font-bold text-blue-700">💪 ¡Puedes hacerlo!</span>
                    </div>
                    <div class="text-sm text-gray-800">
                        <div class="mb-1">🔍 <strong>Revisa:</strong> ${exercise.num1} ${exercise.operation} ${exercise.num2}</div>
                        <div class="mb-1">📝 ¿Escribiste bien cada dígito?</div>
                        <div class="text-center mt-2 text-blue-700 font-bold">¡Inténtalo de nuevo! 🎯</div>
                    </div>
                    <button onclick="this.closest('.feedback-automatico').remove()" 
                            class="mt-2 w-full py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs">
                        Cerrar ❌
                    </button>
                </div>
            `;
        } else if (attemptCount === 2) {
            // 🥈 SEGUNDO INTENTO: Guía paso a paso específica
            if (necesitaPrestamo) {
                contenidoFeedback = `
                    <div class="bg-purple-100 border-2 border-purple-400 rounded-lg p-3">
                        <div class="text-center mb-2">
                            <span class="text-lg font-bold text-purple-700">🤔 Resta con Préstamo</span>
                        </div>
                        <div class="text-sm text-gray-800">
                            <div class="mb-1"><strong>❗</strong> ${exercise.num1 % 10} es menor que ${exercise.num2 % 10}</div>
                            <div class="mb-1"><strong>🏠</strong> Pide prestado 10 de las decenas</div>
                            <div class="mb-1"><strong>🔄</strong> Ahora tienes ${(exercise.num1 % 10) + 10} unidades</div>
                            <div class="text-center mt-2 text-purple-700 font-bold">¡Paso a paso! 💜</div>
                        </div>
                        <button onclick="this.closest('.feedback-automatico').remove()" 
                                class="mt-2 w-full py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs">
                            Cerrar ❌
                        </button>
                    </div>
                `;
            } else {
                // Suma o resta simple
                const operationName = esResta ? 'Resta' : 'Suma';
                const operationColor = esResta ? 'green' : 'yellow';
                
                contenidoFeedback = `
                    <div class="bg-${operationColor}-100 border-2 border-${operationColor}-400 rounded-lg p-3">
                        <div class="text-center mb-2">
                            <span class="text-lg font-bold text-${operationColor === 'yellow' ? 'yellow-700' : 'green-700'}">🤔 ${operationName} Paso a Paso</span>
                        </div>
                        <div class="text-sm text-gray-800">
                            <div class="mb-1"><strong>1️⃣</strong> ${operationName === 'Suma' ? 'Suma' : 'Resta'} las unidades: ${exercise.num1 % 10} ${exercise.operation} ${exercise.num2 % 10}</div>
                            <div class="mb-1"><strong>2️⃣</strong> ${operationName === 'Suma' ? 'Suma' : 'Resta'} las decenas: ${Math.floor(exercise.num1/10)} ${exercise.operation} ${Math.floor(exercise.num2/10)}</div>
                            <div class="mb-1"><strong>3️⃣</strong> Junta ambos resultados</div>
                            <div class="mb-1"><strong>💡</strong> Usa tus dedos o dibuja si necesitas</div>
                            <div class="mb-1"><strong>🎨 Imagina:</strong> ${exercise.operation === '+' ? 'Juntar ' : 'Quitar '} ${exercise.operation === '+' ? 'manzanas' : 'globos'}</div>
                            <div class="text-center mt-3 text-${operationColor === 'yellow' ? 'yellow-700' : 'green-700'} font-bold">¡Paso a paso puedes! 💪</div>
                        </div>
                        <button onclick="this.closest('.feedback-automatico').remove()" 
                                class="mt-2 w-full py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs">
                            Cerrar ❌
                        </button>
                    </div>
                `;
            }
        } else {
            // 🥉 TERCER INTENTO O MÁS: Ayuda más detallada SIN revelar la respuesta
            if (necesitaPrestamo) {
                contenidoFeedback = `
                    <div class="bg-orange-100 border-2 border-orange-400 rounded-lg p-3">
                        <div class="text-center mb-2">
                            <span class="text-lg font-bold text-orange-700">🧠 Vamos paso a paso</span>
                        </div>
                        <div class="text-sm text-gray-800">
                            <div class="mb-1"><strong>🔍</strong> Mira bien: ${exercise.num1 % 10} unidades vs ${exercise.num2 % 10} unidades</div>
                            <div class="mb-1"><strong>🤝</strong> Como ${exercise.num1 % 10} < ${exercise.num2 % 10}, necesitas pedir prestado</div>
                            <div class="mb-1"><strong>📦</strong> Abre 1 decena = 10 unidades más</div>
                            <div class="mb-1"><strong>🧮</strong> Ahora calcula: ${(exercise.num1 % 10) + 10} - ${exercise.num2 % 10} en unidades</div>
                            <div class="text-center mt-2 text-orange-700 font-bold">¡Inténtalo con estos pasos! 🎯</div>
                        </div>
                        <button onclick="this.closest('.feedback-automatico').remove()" 
                                class="mt-2 w-full py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs">
                            Cerrar ❌
                        </button>
                    </div>
                `;
            } else {
                // Suma o resta simple - Dar estrategias SIN respuesta
                const operationName = esResta ? 'Resta' : 'Suma';
                
                contenidoFeedback = `
                    <div class="bg-orange-100 border-2 border-orange-400 rounded-lg p-3">
                        <div class="text-center mb-2">
                            <span class="text-lg font-bold text-orange-700">🧠 Estrategia ${operationName}</span>
                        </div>
                        <div class="text-sm text-gray-800">
                            <div class="mb-1"><strong>1️⃣</strong> Unidades: ${exercise.num1 % 10} ${exercise.operation} ${exercise.num2 % 10} = ?</div>
                            <div class="mb-1"><strong>2️⃣</strong> Decenas: ${Math.floor(exercise.num1/10)} ${exercise.operation} ${Math.floor(exercise.num2/10)} = ?</div>
                            <div class="mb-1"><strong>3️⃣</strong> Junta ambos resultados</div>
                            <div class="mb-1"><strong>💡</strong> Usa tus dedos o dibuja si necesitas</div>
                            <div class="text-center mt-2 text-orange-700 font-bold">¡Paso a paso puedes! 💪</div>
                        </div>
                        <button onclick="this.closest('.feedback-automatico').remove()" 
                                class="mt-2 w-full py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs">
                            Cerrar ❌
                        </button>
                    </div>
                `;
            }
        }
        
        // Crear y mostrar el feedback usando el mismo sistema que la ayuda manual
        const helpButton = document.querySelector(`button[onclick*="showPedagogicalHelp(${exerciseId})"]`);
        if (helpButton) {
            const feedbackDiv = document.createElement('div');
            feedbackDiv.className = 'feedback-automatico mt-2';
            feedbackDiv.innerHTML = contenidoFeedback;
            
            // Insertar en el mismo lugar que la ayuda manual
            helpButton.parentNode.insertBefore(feedbackDiv, helpButton.nextSibling);
            
            console.log(`🔄 Feedback progresivo mostrado para ejercicio ${exerciseId} - Intento ${attemptCount}`);
        }
    }

    // 🆘 ACTUALIZADO: Ayuda pedagógica con IA de Gemini
    async showPedagogicalHelp(exerciseId) {
        try {
            const exercise = this.currentExercises.find(ex => ex.id === exerciseId);
            if (!exercise || exercise.completed) return;
            
            const helpButton = document.querySelector(`button[onclick*="showPedagogicalHelp(${exerciseId})"]`);
            if (!helpButton) {
                console.error(`❌ No se encontró botón de ayuda para ejercicio ${exerciseId}`);
                return;
            }
            
            // Remover cualquier feedback anterior
            this.removeExistingFeedback(exerciseId);
            
            // 🔄 NUEVO: Mostrar mensaje de carga dinámico mientras se genera la ayuda
            const loadingDiv = this.createDynamicLoadingMessage(exerciseId);
            helpButton.parentNode.insertBefore(loadingDiv, helpButton.nextSibling);
            
            // 🎯 NUEVO: Generar ayuda con IA de Gemini más explicativa
            let contenidoAyuda = await this.generatePedagogicalHelpWithAI(exercise);
            
            // Remover mensaje de carga
            if (loadingDiv && loadingDiv.parentNode) {
                loadingDiv.remove();
            }
            
            const ayudaDiv = document.createElement('div');
            ayudaDiv.className = 'ayuda-pedagogica mt-2';
            ayudaDiv.innerHTML = contenidoAyuda;
            
            // Insertar en la misma ubicación que el feedback automático

            helpButton.parentNode.insertBefore(ayudaDiv, helpButton.nextSibling);
            
            console.log(`✅ Ayuda pedagógica con IA mostrada para ejercicio ${exerciseId}`);
            
        } catch (error) {
            console.error('Error mostrando ayuda:', error);
            this.showErrorToast('Error al mostrar la ayuda');
            
            // Asegurar que se remueva el mensaje de carga en caso de error
            const loadingDiv = document.querySelector(`#loading-help-${exerciseId}`);
            if (loadingDiv) loadingDiv.remove();
        }
    }

    // 🎭 NUEVO: Crear mensaje de carga dinámico con frases divertidas
    createDynamicLoadingMessage(exerciseId) {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = `loading-help-${exerciseId}`;
        loadingDiv.className = 'ayuda-cargando mt-2';
        
        // 🎪 Array de mensajes divertidos para niños
        const mensajesDivertidos = [
            "🎩 Haciendo magia matemática...",
            "🪄 ¡Abracadabra! Creando ayuda...",
            "🐰 Patas de conejo... ¡aparece la ayuda!",
            "🤔 Pensando muuuy fuerte...",
            "🔍 Mmm... veamos qué encontramos...",
            "🧙‍♀️ La profesora mágica está trabajando...",
            "⭐ Consultando las estrellas matemáticas...",
            "🎯 Apuntando a la mejor ayuda...",
            "🍎 Mezclando ingredientes de sabiduría...",
            "🌟 Iluminando el camino de las matemáticas...",
            "🎨 Pintando explicaciones coloridas...",
            "🦄 Los unicornios están calculando...",
            "🎪 Preparando el espectáculo de ayuda...",
            "🎈 Inflando globos de conocimiento...",
            "🎵 Componiendo la melodía perfecta...",
            "🚀 Volando a buscar la mejor explicación...",
            "🌈 Creando un arcoíris de aprendizaje...",
            "🎁 Envolviendo un regalo de sabiduría...",
            "🍭 Endulzando las matemáticas...",
            "🎊 Preparando una fiesta de conocimiento..."
        ];
        
        let mensajeIndex = 0;
        let puntos = "";
        
        loadingDiv.innerHTML = `
            <div class="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-lg p-4 animate-pulse">
                <div class="text-center">
                    <div class="text-2xl mb-2 animate-bounce" id="loading-emoji-${exerciseId}">🎩</div>
                    <div class="text-sm font-bold text-purple-700 mb-2" id="loading-message-${exerciseId}">
                        ${mensajesDivertidos[0]}

                    </div>
                    <div class="text-xs text-gray-600" id="loading-dots-${exerciseId}">•</div>
                </div>
                
                <!-- Barra de progreso animada -->
                <div class="mt-3 bg-purple-200 rounded-full h-2 overflow-hidden">
                    <div class="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full animate-pulse loading-bar"></div>
                </div>
                
                <!-- Botón para cancelar (opcional) -->
                <button onclick="this.closest('.ayuda-cargando').remove()" 
                        class="mt-2 w-full py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs text-gray-600">
                    Cancelar ❌
                </button>
            </div>
        `;
        
        // 🎭 Configurar animaciones dinámicas
        const messageElement = loadingDiv.querySelector(`#loading-message-${exerciseId}`);
        const emojiElement = loadingDiv.querySelector(`#loading-emoji-${exerciseId}`);
        const dotsElement = loadingDiv.querySelector(`#loading-dots-${exerciseId}`);
        
        // 🔄 Cambiar mensaje cada  1.5 segundos
        const messageInterval = setInterval(() => {
            mensajeIndex = (mensajeIndex + 1) % mensajesDivertidos.length;
            if (messageElement) {
                messageElement.style.transform = 'scale(0.8)';
                messageElement.style.opacity = '0.5';
                
                setTimeout(() => {
                    messageElement.textContent = mensajesDivertidos[mensajeIndex];
                    messageElement.style.transform = 'scale(1)';
                    messageElement.style.opacity = '1';
                }, 200);
            }
        }, 1500);
        
        // 🎨 Cambiar emoji cada 2 segundos
        const emojis = ['🎩', '🪄', '🐰', '🤔', '🔍', '🧙‍♀️', '⭐', '🎯', '🍎', '🌟', '🎨', '🦄'];
        let emojiIndex = 0;
        const emojiInterval = setInterval(() => {
            emojiIndex = (emojiIndex + 1) % emojis.length;
            if (emojiElement) {
                emojiElement.textContent = emojis[emojiIndex];
            }
        }, 2000);
        
        // 💫 Animar puntos cada 300ms
        const dotsInterval = setInterval(() => {
            puntos = puntos.length >= 3 ? "•" : puntos + "•";
            if (dotsElement) {
                dotsElement.textContent = puntos;
            }
        }, 300);
        
        // 🗑️ Limpiar intervalos cuando se remueva el elemento
        loadingDiv.dataset.messageInterval = messageInterval;
        loadingDiv.dataset.emojiInterval = emojiInterval;
        loadingDiv.dataset.dotsInterval = dotsInterval;
        
        // Observer para limpiar intervalos cuando se remueva del DOM
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.removedNodes.forEach((node) => {
                    if (node === loadingDiv) {
                        clearInterval(messageInterval);
                        clearInterval(emojiInterval);
                        clearInterval(dotsInterval);
                        observer.disconnect();
                    }
                });
            });
        });
        
        // Observar el padre del loadingDiv cuando se agregue al DOM
        setTimeout(() => {
            if (loadingDiv.parentNode) {
                observer.observe(loadingDiv.parentNode, { childList: true });
            }
        }, 100);
        
        console.log(`🎭 Mensaje de carga dinámico creado para ejercicio ${exerciseId}`);
        
        return loadingDiv;
    }

    // ✅ Verificar si necesita ayuda con préstamo
    needsBorrowingHelp(exercise) {
        return exercise.operation === '-' && (exercise.num1 % 10) < (exercise.num2 % 10);
    }
}

// ✅ CREAR INSTANCIA GLOBAL
window.adicionSustraccionModule = new AdicionSustraccionModule();

console.log('✅ Módulo de Adición y Sustracción inicializado correctamente');