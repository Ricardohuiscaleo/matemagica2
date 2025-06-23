/**
 * 🎨 SISTEMA DE MODALES PARA ESTUDIANTES
 * Responsabilidad: Interfaz de usuario, modales y componentes visuales
 * Trabaja en conjunto con student-management-core.js
 */

console.log('🎨 Inicializando Sistema de Modales de Estudiantes...');

class StudentModalSystem {
    constructor() {
        this.state = {
            activeModal: null,
            isInitialized: false,
            core: null
        };
        
        this.config = {
            modalPrefix: 'student-modal',
            animationDuration: 200
        };
        
        // Factory de modales
        this.modalFactory = new StudentModalFactory();
        
        // Auto-inicializar
        this.initialize();
    }
    
    // ✅ INICIALIZACIÓN
    async initialize() {
        if (window.studentModalSystemInitialized) {
            console.log('⚠️ Sistema de modales ya inicializado');
            return;
        }
        
        window.studentModalSystemInitialized = true;
        console.log('🚀 Inicializando sistema de modales...');
        
        try {
            // Esperar por el core
            await this.waitForCore();
            
            // Configurar event listeners globales
            this.setupGlobalEventListeners();
            
            // Configurar UI inicial
            this.setupInitialUI();
            
            this.state.isInitialized = true;
            console.log('✅ Sistema de modales inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando sistema de modales:', error);
        }
    }
    
    // ✅ ESPERAR POR EL CORE
    async waitForCore() {
        console.log('🔄 Esperando por core de estudiantes...');
        
        let attempts = 0;
        const maxAttempts = 30;
        
        while (attempts < maxAttempts) {
            if (window.studentCore && window.studentCore.isInitialized()) {
                this.state.core = window.studentCore;
                console.log('✅ Core de estudiantes conectado');
                return;
            }
            
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        console.warn('⚠️ Core no se inicializó, usando modo independiente');
    }
    
    // ✅ CONFIGURAR EVENT LISTENERS GLOBALES
    setupGlobalEventListeners() {
        try {
            // Botón principal del estudiante
            const studentCardButton = document.getElementById('student-card-button');
            if (studentCardButton) {
                studentCardButton.addEventListener('click', () => {
                    this.openModal('selection');
                });
            }
            
            // Escape para cerrar modales
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.state.activeModal) {
                    this.closeActiveModal();
                }
            });
            
            // Click fuera del modal para cerrar
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal-overlay')) {
                    this.closeActiveModal();
                }
            });
            
            console.log('✅ Event listeners globales configurados');
        } catch (error) {
            console.error('❌ Error configurando event listeners:', error);
        }
    }
    
    // ✅ CONFIGURAR UI INICIAL
    setupInitialUI() {
        try {
            // Actualizar display inicial si hay datos
            if (this.state.core) {
                this.updateCurrentStudentDisplay();
            }
            
            console.log('✅ UI inicial configurada');
        } catch (error) {
            console.error('❌ Error configurando UI inicial:', error);
        }
    }
    
    // ✅ ABRIR MODAL PRINCIPAL
    openModal(type, options = {}) {
        try {
            // Prevenir doble apertura
            if (this.state.activeModal) {
                console.log('⚠️ Cerrando modal activo antes de abrir nuevo...');
                this.closeActiveModalSafely();
                
                // Esperar a que se cierre completamente
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(this.openModal(type, options));
                    }, this.config.animationDuration);
                });
            }
            
            console.log(`🔄 Creando modal de tipo: ${type}`);
            
            // Obtener datos del core
            const modalConfig = {
                ...options,
                students: this.state.core ? this.state.core.getAllStudents() : [],
                currentStudent: this.state.core ? this.state.core.getCurrentStudent() : null,
                onAction: this.handleModalAction.bind(this)
            };
            
            // Crear modal usando factory
            const modal = this.modalFactory.createModal(type, modalConfig);
            
            if (!modal) {
                console.error('❌ No se pudo crear el modal');
                return;
            }
            
            // Mostrar modal
            modal.show();
            this.state.activeModal = modal;
            
            console.log(`✅ Modal ${type} abierto`);
            
        } catch (error) {
            console.error('❌ Error abriendo modal:', error);
            this.showError('Error al abrir modal');
        }
    }
    
    // ✅ CERRAR MODAL ACTIVO CON SEGURIDAD
    closeActiveModalSafely() {
        try {
            if (this.state.activeModal) {
                if (typeof this.state.activeModal.hide === 'function') {
                    this.state.activeModal.hide();
                }
                
                if (typeof this.state.activeModal.destroy === 'function') {
                    this.state.activeModal.destroy();
                }
                
                this.state.activeModal = null;
                console.log('✅ Modal cerrado con seguridad');
            }
        } catch (error) {
            console.error('❌ Error cerrando modal:', error);
            this.state.activeModal = null;
        }
    }
    
    // ✅ CERRAR MODAL ACTIVO
    closeActiveModal() {
        this.closeActiveModalSafely();
    }
    
    // ✅ MANEJO DE ACCIONES DEL MODAL
    async handleModalAction(action, data) {
        try {
            console.log(`🎬 Procesando acción: ${action}`, data);
            
            if (!this.state.core) {
                console.error('❌ Core no disponible para procesar acción');
                return;
            }
            
            switch (action) {
                case 'select-student':
                    await this.state.core.selectStudent(data.studentId);
                    this.closeActiveModal();
                    this.updateCurrentStudentDisplay();
                    this.showSuccess(`✅ ${data.studentName} seleccionado`);
                    break;
                    
                case 'create-student':
                    const newStudent = await this.state.core.createStudent(data);
                    this.closeActiveModal();
                    this.updateCurrentStudentDisplay();
                    this.showSuccess(`✅ ${newStudent.name} registrado correctamente`);
                    break;
                    
                case 'update-student':
                    const updatedStudent = await this.state.core.updateStudent(data.studentId, data);
                    this.closeActiveModal();
                    this.updateCurrentStudentDisplay();
                    this.showSuccess(`✅ ${updatedStudent.name} actualizado`);
                    break;
                    
                case 'delete-student':
                    await this.state.core.deleteStudent(data.studentId);
                    this.closeActiveModal();
                    this.updateCurrentStudentDisplay();
                    this.showSuccess('✅ Estudiante eliminado');
                    break;
                    
                case 'cancel':
                    this.closeActiveModal();
                    break;
                    
                case 'open-create-modal':
                    this.closeActiveModal();
                    setTimeout(() => {
                        this.openModal('create');
                    }, this.config.animationDuration);
                    break;
                    
                default:
                    console.warn('Acción no reconocida:', action);
            }
            
        } catch (error) {
            console.error('❌ Error en acción del modal:', error);
            this.showError('Error al procesar la acción');
        }
    }
    
    // ✅ ACTUALIZAR DISPLAY DEL ESTUDIANTE ACTUAL
    updateCurrentStudentDisplay() {
        try {
            const currentStudent = this.state.core ? this.state.core.getCurrentStudent() : null;
            
            const nameElement = document.getElementById('current-student-name');
            const avatarElement = document.querySelector('.student-avatar, .w-8.h-8.bg-blue-500.rounded-full, .w-8.h-8.bg-pink-500.rounded-full');
            
            if (currentStudent) {
                if (nameElement) nameElement.textContent = currentStudent.name;
                
                if (avatarElement) {
                    const avatar = currentStudent.avatar || (currentStudent.gender === 'niña' ? '👧' : '👦');
                    avatarElement.textContent = avatar;
                    
                    if (currentStudent.gender === 'niña') {
                        avatarElement.className = avatarElement.className.replace(/bg-blue-\d+/, 'bg-pink-500');
                    } else {
                        avatarElement.className = avatarElement.className.replace(/bg-pink-\d+/, 'bg-blue-500');
                    }
                }
            } else {
                if (nameElement) nameElement.textContent = 'Sin estudiante';
                if (avatarElement) avatarElement.textContent = '?';
            }
            
            // Actualizar estadísticas si existen
            this.updateDashboardStats(currentStudent);
            
        } catch (error) {
            console.error('❌ Error actualizando display:', error);
        }
    }
    
    // ✅ ACTUALIZAR ESTADÍSTICAS DEL DASHBOARD
    updateDashboardStats(currentStudent) {
        try {
            const statsElements = {
                totalStudents: document.getElementById('stat-students'),
                totalExercises: document.getElementById('stat-exercises'),
                totalPoints: document.getElementById('stat-points')
            };
            
            if (statsElements.totalStudents && this.state.core) {
                statsElements.totalStudents.textContent = this.state.core.getStudentCount();
            }
            
            if (currentStudent) {
                if (statsElements.totalExercises) {
                    statsElements.totalExercises.textContent = currentStudent.stats.totalExercises || 0;
                }
                if (statsElements.totalPoints) {
                    statsElements.totalPoints.textContent = currentStudent.stats.totalPoints || 0;
                }
            }
        } catch (error) {
            console.error('❌ Error actualizando estadísticas:', error);
        }
    }
    
    // ✅ MOSTRAR MENSAJES
    showSuccess(message) {
        if (typeof showSuccessToast === 'function') {
            showSuccessToast(message);
        } else {
            console.log('✅', message);
        }
    }
    
    showError(message) {
        if (typeof showErrorToast === 'function') {
            showErrorToast(message);
        } else {
            console.error('❌', message);
        }
    }
    
    // ✅ API PÚBLICA
    isModalOpen() { return !!this.state.activeModal; }
    getActiveModal() { return this.state.activeModal; }
    
    // ✅ MÉTODOS DE COMPATIBILIDAD
    openStudentModal() { this.openModal('selection'); }
    closeModals() { this.closeActiveModal(); }
}

/**
 * 🏭 FACTORY DE MODALES DINÁMICOS
 */
class StudentModalFactory {
    createModal(type, config) {
        switch (type) {
            case 'selection':
                return new SelectionModal(config);
            case 'create':
                return new CreateStudentModal(config);
            case 'edit':
                return new EditStudentModal(config);
            default:
                throw new Error(`Tipo de modal no reconocido: ${type}`);
        }
    }
}

/**
 * 📋 MODAL BASE
 */
class BaseStudentModal {
    constructor(config) {
        this.config = config;
        this.element = null;
        this.isVisible = false;
        this.isDestroyed = false;
        this.onAction = config.onAction || (() => {});
    }
    
    show() {
        try {
            if (this.isDestroyed) return;
            
            if (!this.element) this.createElement();
            
            if (this.element) {
                this.element.classList.remove('hidden');
                this.element.style.display = 'flex';
                this.isVisible = true;
                
                // Focus automático
                setTimeout(() => {
                    if (!this.isDestroyed && this.element) {
                        const firstInput = this.element.querySelector('input, button, select');
                        if (firstInput) firstInput.focus();
                    }
                }, 100);
            }
        } catch (error) {
            console.error('❌ Error mostrando modal:', error);
        }
    }
    
    hide() {
        try {
            if (this.element && !this.isDestroyed) {
                this.element.classList.add('hidden');
                this.element.style.display = 'none';
            }
            this.isVisible = false;
        } catch (error) {
            console.error('❌ Error ocultando modal:', error);
        }
    }
    
    destroy() {
        try {
            this.isDestroyed = true;
            this.isVisible = false;
            
            if (this.element) {
                this.cleanupEventListeners();
                
                if (this.element.parentNode) {
                    this.element.parentNode.removeChild(this.element);
                }
                this.element = null;
            }
        } catch (error) {
            console.error('❌ Error destruyendo modal:', error);
            this.element = null;
            this.isDestroyed = true;
        }
    }
    
    cleanupEventListeners() {
        try {
            if (!this.element) return;
            
            const elements = this.element.querySelectorAll('button, input, select, form');
            elements.forEach(el => {
                const newEl = el.cloneNode(true);
                el.parentNode.replaceChild(newEl, el);
            });
        } catch (error) {
            console.error('❌ Error limpiando event listeners:', error);
        }
    }
    
    createElement() {
        throw new Error('createElement debe ser implementado por la clase hija');
    }
    
    handleAction(action, data = {}) {
        try {
            console.log(`🎬 Modal delegando acción: ${action}`, data);
            
            if (typeof this.onAction === 'function') {
                this.onAction(action, data);
            } else {
                console.error('❌ onAction no es una función válida');
            }
        } catch (error) {
            console.error('❌ Error ejecutando acción del modal:', error);
        }
    }
}

/**
 * 👥 MODAL DE SELECCIÓN DE ESTUDIANTES
 */
class SelectionModal extends BaseStudentModal {
    createElement() {
        try {
            const modalHTML = `
                <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay">
                    <div class="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
                        <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-xl">
                            <div class="flex justify-between items-center">
                                <div>
                                    <h3 class="text-lg font-bold">👥 Seleccionar Estudiante</h3>
                                    <p class="text-blue-100 text-sm">Elige quién va a estudiar</p>
                                </div>
                                <button class="close-btn text-white hover:text-gray-200 p-1">
                                    <i class="fas fa-times text-xl"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="p-4">
                            ${this.config.students.length === 0 ? this.renderEmptyState() : this.renderStudentsList()}
                            
                            <div class="mt-4 pt-4 border-t border-gray-200">
                                <button class="add-new-btn w-full text-blue-600 hover:text-blue-800 text-sm font-medium py-2 hover:bg-blue-50 rounded-lg transition-colors">
                                    <i class="fas fa-plus mr-1"></i>Agregar Nuevo Estudiante
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            this.element = document.createElement('div');
            this.element.innerHTML = modalHTML;
            this.element = this.element.firstElementChild;
            document.body.appendChild(this.element);
            
            this.setupEventListeners();
        } catch (error) {
            console.error('❌ Error creando modal de selección:', error);
        }
    }
    
    renderEmptyState() {
        return `
            <div class="text-center py-8 text-gray-500">
                <div class="text-4xl mb-2">👥</div>
                <p>No hay estudiantes registrados</p>
                <p class="text-sm mt-1">Agrega el primero para comenzar</p>
            </div>
        `;
    }
    
    renderStudentsList() {
        return `
            <div class="space-y-2 max-h-64 overflow-y-auto">
                ${this.config.students.map(student => {
                    const isSelected = this.config.currentStudent?.id === student.id;
                    const avatar = student.avatar || (student.gender === 'niña' ? '👧' : '👦');
                    
                    return `
                        <div class="student-item p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-blue-50 ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}"
                             data-student-id="${student.id}">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-3">
                                    <div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white">
                                        ${avatar}
                                    </div>
                                    <div>
                                        <div class="font-medium text-gray-900">${student.name}</div>
                                        <div class="text-sm text-gray-500">${student.age} años • ${student.course || 'Sin curso'}</div>
                                    </div>
                                </div>
                                ${isSelected ? `
                                    <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                        <i class="fas fa-check text-white text-xs"></i>
                                    </div>
                                ` : `
                                    <i class="fas fa-chevron-right text-gray-400"></i>
                                `}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    setupEventListeners() {
        try {
            if (!this.element || this.isDestroyed) return;
            
            // Cerrar modal
            const closeBtn = this.element.querySelector('.close-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.handleAction('cancel');
                });
            }
            
            // Seleccionar estudiante
            const studentItems = this.element.querySelectorAll('.student-item');
            studentItems.forEach(item => {
                item.addEventListener('click', () => {
                    const studentId = item.dataset.studentId;
                    const student = this.config.students.find(s => s.id === studentId);
                    if (student) {
                        this.handleAction('select-student', { studentId, studentName: student.name });
                    }
                });
            });
            
            // Nuevo estudiante
            const addNewBtn = this.element.querySelector('.add-new-btn');
            if (addNewBtn) {
                addNewBtn.addEventListener('click', () => {
                    this.handleAction('open-create-modal');
                });
            }
        } catch (error) {
            console.error('❌ Error configurando event listeners:', error);
        }
    }
}

/**
 * 📝 MODAL DE CREACIÓN DE ESTUDIANTES (ACTUALIZADO CON ASIGNACIÓN DE PROFESORES)
 */
class CreateStudentModal extends BaseStudentModal {
    createElement() {
        try {
            const modalHTML = `
                <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div class="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div class="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-t-xl">
                            <div class="flex justify-between items-center">
                                <div>
                                    <h3 class="text-lg font-bold">📝 Nuevo Estudiante</h3>
                                    <p class="text-green-100 text-sm">Registra a tu hijo/a</p>
                                </div>
                                <button class="close-btn text-white hover:text-gray-200">
                                    <i class="fas fa-times text-xl"></i>
                                </button>
                            </div>
                        </div>

                        <form class="create-form p-6 space-y-5">
                            <!-- Nombre -->
                            <div class="space-y-2">
                                <label class="flex items-center text-sm font-semibold text-gray-700">
                                    <i class="fas fa-user text-blue-500 mr-2"></i>
                                    Nombre completo *
                                </label>
                                <input type="text" name="name" required
                                    placeholder="Ej: María José González"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all">
                            </div>
                            
                            <!-- Edad -->
                            <div class="space-y-2">
                                <label class="flex items-center text-sm font-semibold text-gray-700">
                                    <i class="fas fa-birthday-cake text-purple-500 mr-2"></i>
                                    Edad *
                                </label>
                                <select name="age" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all">
                                    <option value="">Seleccionar edad</option>
                                    <option value="5">5 años</option>
                                    <option value="6">6 años</option>
                                    <option value="7">7 años</option>
                                    <option value="8">8 años</option>
                                    <option value="9">9 años</option>
                                    <option value="10">10 años</option>
                                    <option value="11">11 años</option>
                                    <option value="12">12 años</option>
                                </select>
                            </div>
                            
                            <!-- Género -->
                            <div class="space-y-3">
                                <label class="flex items-center text-sm font-semibold text-gray-700">
                                    <i class="fas fa-child text-pink-500 mr-2"></i>
                                    Género *
                                </label>
                                <div class="grid grid-cols-2 gap-3">
                                    <label class="gender-option cursor-pointer">
                                        <input type="radio" name="gender" value="niña" required class="hidden">
                                        <div class="gender-card p-4 border-2 border-gray-200 rounded-lg text-center hover:border-pink-300 transition-all">
                                            <div class="text-3xl mb-2">👧</div>
                                            <div class="font-medium text-gray-700">Niña</div>
                                        </div>
                                    </label>
                                    <label class="gender-option cursor-pointer">
                                        <input type="radio" name="gender" value="niño" required class="hidden">
                                        <div class="gender-card p-4 border-2 border-gray-200 rounded-lg text-center hover:border-blue-300 transition-all">
                                            <div class="text-3xl mb-2">👦</div>
                                            <div class="font-medium text-gray-700">Niño</div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            
                            <!-- Curso -->
                            <div class="space-y-2">
                                <label class="flex items-center text-sm font-semibold text-gray-700">
                                    <i class="fas fa-graduation-cap text-green-500 mr-2"></i>
                                    Curso *
                                </label>
                                <select name="course" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all">
                                    <option value="">Seleccionar curso</option>
                                    <option value="Pre-Kinder">Pre-Kinder</option>
                                    <option value="Kinder">Kinder</option>
                                    <option value="1° Básico">1° Básico</option>
                                    <option value="2° Básico">2° Básico</option>
                                    <option value="3° Básico">3° Básico</option>
                                    <option value="4° Básico">4° Básico</option>
                                    <option value="5° Básico">5° Básico</option>
                                    <option value="6° Básico">6° Básico</option>
                                    <option value="7° Básico">7° Básico</option>
                                    <option value="8° Básico">8° Básico</option>
                                </select>
                                <p class="text-xs text-gray-500">Selecciona el curso actual del estudiante</p>
                            </div>

                            <!-- ✅ PROFESOR (CON DATOS REALES DESDE SUPABASE) -->
                            <div class="space-y-2" id="teacher-section">
                                <label class="flex items-center text-sm font-semibold text-gray-700">
                                    <i class="fas fa-chalkboard-teacher text-orange-500 mr-2"></i>
                                    Profesor/a
                                </label>
                                <select name="teacher" id="teachers-select" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all">
                                    <option value="">🔄 Cargando profesores...</option>
                                </select>
                                <p class="text-xs text-gray-500">Lista de profesores actualizada desde la base de datos</p>
                            </div>
                            
                            <!-- Intereses -->
                            <div class="space-y-2">
                                <label class="flex items-center text-sm font-semibold text-gray-700">
                                    <i class="fas fa-heart text-red-500 mr-2"></i>
                                    ¿Qué le gusta? (opcional)
                                </label>
                                <div class="grid grid-cols-2 gap-2">
                                    <label class="interest-tag cursor-pointer">
                                        <input type="checkbox" name="interests" value="animales" class="hidden">
                                        <span class="interest-pill">🐶 Animales</span>
                                    </label>
                                    <label class="interest-tag cursor-pointer">
                                        <input type="checkbox" name="interests" value="deportes" class="hidden">
                                        <span class="interest-pill">⚽ Deportes</span>
                                    </label>
                                    <label class="interest-tag cursor-pointer">
                                        <input type="checkbox" name="interests" value="princesas" class="hidden">
                                        <span class="interest-pill">👸 Princesas</span>
                                    </label>
                                    <label class="interest-tag cursor-pointer">
                                        <input type="checkbox" name="interests" value="superhéroes" class="hidden">
                                        <span class="interest-pill">🦸 Superhéroes</span>
                                    </label>
                                    <label class="interest-tag cursor-pointer">
                                        <input type="checkbox" name="interests" value="carros" class="hidden">
                                        <span class="interest-pill">🚗 Carros</span>
                                    </label>
                                    <label class="interest-tag cursor-pointer">
                                        <input type="checkbox" name="interests" value="música" class="hidden">
                                        <span class="interest-pill">🎵 Música</span>
                                    </label>
                                </div>
                                <p class="text-xs text-green-600">La IA creará ejercicios con estos temas para mayor motivación</p>
                            </div>
                            
                            <!-- Nivel matemático inicial -->
                            <div class="space-y-2">
                                <label class="flex items-center text-sm font-semibold text-gray-700">
                                    <i class="fas fa-chart-line text-orange-500 mr-2"></i>
                                    Nivel matemático inicial
                                </label>
                                <div class="grid grid-cols-3 gap-2">
                                    <label class="level-option cursor-pointer">
                                        <input type="radio" name="mathLevel" value="1" required class="hidden">
                                        <div class="level-card p-3 border-2 border-gray-200 rounded-lg text-center hover:border-green-300 transition-all">
                                            <div class="text-xl mb-1">🟢</div>
                                            <div class="font-medium text-sm">Fácil</div>
                                            <div class="text-xs text-gray-500">Sin reserva</div>
                                        </div>
                                    </label>
                                    <label class="level-option cursor-pointer">
                                        <input type="radio" name="mathLevel" value="2" class="hidden">
                                        <div class="level-card p-3 border-2 border-gray-200 rounded-lg text-center hover:border-yellow-300 transition-all">
                                            <div class="text-xl mb-1">🟡</div>
                                            <div class="font-medium text-sm">Medio</div>
                                            <div class="text-xs text-gray-500">Con reserva</div>
                                        </div>
                                    </label>
                                    <label class="level-option cursor-pointer">
                                        <input type="radio" name="mathLevel" value="3" class="hidden">
                                        <div class="level-card p-3 border-2 border-gray-200 rounded-lg text-center hover:border-red-300 transition-all">
                                            <div class="text-xl mb-1">🔴</div>
                                            <div class="font-medium text-sm">Difícil</div>
                                            <div class="text-xs text-gray-500">Mixto</div>
                                        </div>
                                    </label>
                                </div>
                                <p class="text-xs text-gray-500">Puedes cambiar esto más adelante según el progreso</p>
                            </div>
                            
                            <!-- Botones de acción -->
                            <div class="flex space-x-3 pt-6 border-t border-gray-200">
                                <button type="button" class="cancel-btn flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors">
                                    <i class="fas fa-times mr-2"></i>Cancelar
                                </button>
                                <button type="submit" class="save-btn flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                                    <i class="fas fa-save mr-2"></i>Registrar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            
            this.element = document.createElement('div');
            this.element.innerHTML = modalHTML;
            this.element = this.element.firstElementChild;
            document.body.appendChild(this.element);
            
            this.setupEventListeners();
            
            // ✅ CARGAR PROFESORES REALES USANDO SUPABASE (DEL SISTEMA LEGACY)
            this.loadTeachersFromSupabase();
            
        } catch (error) {
            console.error('❌ Error creando modal de creación:', error);
        }
    }

    // ✅ NUEVA FUNCIÓN: Obtener cliente Supabase de forma robusta (CONFIGURACIÓN CORREGIDA)
    getSupabaseClient() {
        try {
            // 🎯 USAR LA CONFIGURACIÓN EXACTA QUE FUNCIONA EN buscar-teachers.html
            const SUPABASE_CONFIG = {
                url: "https://uznvakpuuxnpdhoejrog.supabase.co",
                anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bnZha3B1dXhucGRob2Vqcm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODg0MTAsImV4cCI6MjA2NDY2NDQxMH0.OxbLYkjlgpWFnqd28gaZSwar_NQ6_qUS3U76bqbcXVg"
            };

            // 🏆 PRIORIDAD 1: Crear cliente Supabase directamente con configuración probada
            if (window.supabase && window.supabase.createClient) {
                try {
                    const directClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
                    if (directClient && typeof directClient.from === 'function') {
                        console.log('✅ Cliente Supabase directo creado exitosamente');
                        return directClient;
                    }
                } catch (e) {
                    console.warn('⚠️ Error creando cliente directo:', e.message);
                }
            }

            // 🥈 PRIORIDAD 2: Buscar clientes existentes como fallback
            const clientSources = [
                () => window.studentCore?.supabaseClient,
                () => window.studentModalSystem?.studentCore?.supabaseClient,
                () => window.supabaseClient,
                () => window.loginSystem?.supabase,
                () => window.studentManager?.supabaseClient
            ];
            
            for (const getClient of clientSources) {
                try {
                    const client = getClient();
                    if (client && typeof client.from === 'function') {
                        console.log('✅ Cliente Supabase existente encontrado');
                        return client;
                    }
                } catch (e) {
                    // Continuar con el siguiente
                    continue;
                }
            }
            
            console.warn('⚠️ No se encontró cliente Supabase válido');
            return null;
        } catch (error) {
            console.error('❌ Error obteniendo cliente Supabase:', error);
            return null;
        }
    }

    // ✅ NUEVA FUNCIÓN: Cargar profesores reales desde Supabase (RESTAURADA DEL LEGACY)
    async loadTeachersFromSupabase() {
        try {
            console.log('👨‍🏫 Cargando profesores reales desde Supabase...');
            
            const teachersSelect = this.element?.querySelector('#teachers-select');
            if (!teachersSelect) {
                console.warn('⚠️ Elemento #teachers-select no encontrado');
                return;
            }

            // Mostrar estado de carga
            teachersSelect.innerHTML = '<option value="">🔄 Buscando profesores...</option>';

            const supabaseClient = this.getSupabaseClient();
            if (!supabaseClient) {
                console.warn('⚠️ Cliente Supabase no disponible, usando profesores por defecto');
                this.loadDefaultTeachers();
                return;
            }

            let teachersEncontrados = [];

            try {
                // 1. Buscar teachers confirmados en math_profiles
                console.log('1️⃣ Buscando teachers confirmados en math_profiles...');
                const { data: mathTeachers, error: mathError } = await supabaseClient
                    .from('math_profiles')
                    .select('*')
                    .eq('user_role', 'teacher')
                    .order('created_at', { ascending: false });

                if (!mathError && mathTeachers) {
                    console.log(`✅ math_profiles: ${mathTeachers.length} teachers confirmados`);
                    const teachersConOrigen = mathTeachers.map(teacher => ({
                        ...teacher,
                        tabla_origen: 'math_profiles',
                        tipo_teacher: 'confirmado'
                    }));
                    teachersEncontrados = [...teachersEncontrados, ...teachersConOrigen];
                }

                // 2. Buscar teachers en user_roles
                try {
                    console.log('2️⃣ Buscando teachers en user_roles...');
                    const { data: roleTeachers, error: roleError } = await supabaseClient
                        .from('user_roles')
                        .select('*')
                        .eq('role', 'teacher')
                        .order('created_at', { ascending: false });

                    if (!roleError && roleTeachers) {
                        console.log(`✅ user_roles: ${roleTeachers.length} teachers por rol`);
                        const rolesConOrigen = roleTeachers.map(teacher => ({
                            ...teacher,
                            tabla_origen: 'user_roles',
                            user_role: 'teacher',
                            tipo_teacher: 'por_rol'
                        }));
                        teachersEncontrados = [...teachersEncontrados, ...rolesConOrigen];
                    }
                } catch (roleError) {
                    console.warn('⚠️ Error accediendo a user_roles:', roleError.message);
                }

                // 3. Buscar usuarios específicos conocidos como teachers en profiles
                console.log('3️⃣ Verificando teachers conocidos en profiles...');
                const { data: profileUsers, error: profileError } = await supabaseClient
                    .from('profiles')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (!profileError && profileUsers) {
                    // Lista específica de emails conocidos que son teachers
                    const emailsTeachersConocidos = [
                        'franita90@gmail.com',
                        'ricardo.huiscaleo@gmail.com'
                    ];

                    const teachersConocidos = profileUsers.filter(user => {
                        const email = (user.email || '').toLowerCase();
                        return emailsTeachersConocidos.some(teacherEmail => 
                            email.includes(teacherEmail.toLowerCase())
                        );
                    });

                    console.log(`✅ profiles: ${teachersConocidos.length} teachers conocidos identificados`);
                    const profilesConOrigen = teachersConocidos.map(teacher => ({
                        ...teacher,
                        tabla_origen: 'profiles',
                        user_role: 'teacher_conocido',
                        tipo_teacher: 'conocido'
                    }));
                    teachersEncontrados = [...teachersEncontrados, ...profilesConOrigen];
                }

                // 4. Eliminar duplicados y priorizar
                const teachersUnicos = this.eliminarDuplicadosTeachers(teachersEncontrados);
                
                console.log(`✅ ${teachersUnicos.length} teachers únicos encontrados en Supabase`);
                
                if (teachersUnicos.length > 0) {
                    this.populateTeachersSelect(teachersUnicos);
                } else {
                    console.log('⚠️ No se encontraron teachers en Supabase, usando por defecto');
                    this.loadDefaultTeachers();
                }

            } catch (supabaseError) {
                console.error('❌ Error consultando Supabase:', supabaseError);
                this.loadDefaultTeachers();
            }

        } catch (error) {
            console.error('❌ Error en loadTeachersFromSupabase:', error);
            this.loadDefaultTeachers();
        }
    }

    // ✅ FUNCIÓN AUXILIAR: Eliminar duplicados de teachers
    eliminarDuplicadosTeachers(teachers) {
        const teachersMap = new Map();
        
        teachers.forEach(teacher => {
            const email = teacher.email?.toLowerCase();
            
            if (email && !teachersMap.has(email)) {
                // Primera aparición de este email
                teachersMap.set(email, teacher);
            } else if (email && teachersMap.has(email)) {
                // Ya existe, verificar prioridad
                const existente = teachersMap.get(email);
                const nuevoPrioridad = this.obtenerPrioridadTeacher(teacher);
                const existentePrioridad = this.obtenerPrioridadTeacher(existente);
                
                if (nuevoPrioridad > existentePrioridad) {
                    // El nuevo tiene mayor prioridad, reemplazar
                    teachersMap.set(email, {
                        ...teacher,
                        fuentes_adicionales: [...(existente.fuentes_adicionales || []), existente.tabla_origen]
                    });
                } else {
                    // Mantener el existente pero agregar fuente adicional
                    existente.fuentes_adicionales = [...(existente.fuentes_adicionales || []), teacher.tabla_origen];
                }
            }
        });
        
        return Array.from(teachersMap.values());
    }

    // ✅ FUNCIÓN AUXILIAR: Obtener prioridad de teacher
    obtenerPrioridadTeacher(teacher) {
        // Prioridad: math_profiles (confirmado) > user_roles > profiles
        if (teacher.tabla_origen === 'math_profiles' && teacher.user_role === 'teacher') {
            return 3; // Máxima prioridad - teacher confirmado
        } else if (teacher.tabla_origen === 'user_roles' && teacher.role === 'teacher') {
            return 2; // Teacher por rol
        } else if (teacher.tabla_origen === 'profiles') {
            return 1; // Teacher conocido
        }
        return 0; // Sin prioridad
    }

    // ✅ FUNCIÓN AUXILIAR: Poblar el select de teachers
    populateTeachersSelect(teachers) {
        try {
            const teachersSelect = this.element?.querySelector('#teachers-select');
            if (!teachersSelect) return;

            let optionsHTML = '<option value="">Seleccionar profesor/a</option>';

            // Agrupar teachers por tipo
            const teachersConfirmados = teachers.filter(t => t.tipo_teacher === 'confirmado');
            const teachersConocidos = teachers.filter(t => t.tipo_teacher === 'conocido');
            const teachersPorRol = teachers.filter(t => t.tipo_teacher === 'por_rol');

            // Teachers confirmados (máxima prioridad)
            if (teachersConfirmados.length > 0) {
                optionsHTML += `<optgroup label="✅ Teachers Confirmados (${teachersConfirmados.length})">`;
                teachersConfirmados.forEach(teacher => {
                    const nombre = teacher.full_name || teacher.nombre_completo || teacher.name || 'Sin nombre';
                    const email = teacher.email || 'Sin email';
                    optionsHTML += `<option value="${teacher.user_id || teacher.id}" data-teacher-email="${email}">✅ ${nombre}</option>`;
                });
                optionsHTML += '</optgroup>';
            }

            // Teachers conocidos
            if (teachersConocidos.length > 0) {
                optionsHTML += `<optgroup label="🎯 Teachers Conocidos (${teachersConocidos.length})">`;
                teachersConocidos.forEach(teacher => {
                    const nombre = teacher.full_name || teacher.nombre_completo || teacher.name || 'Sin nombre';
                    const email = teacher.email || 'Sin email';
                    const esFrancisca = email.includes('franita') || nombre.toLowerCase().includes('francisca');
                    const icon = esFrancisca ? '🎯' : '👨‍🏫';
                    optionsHTML += `<option value="${teacher.user_id || teacher.id}" data-teacher-email="${email}">${icon} ${nombre}</option>`;
                });
                optionsHTML += '</optgroup>';
            }

            // Teachers por rol
            if (teachersPorRol.length > 0) {
                optionsHTML += `<optgroup label="🔑 Teachers por Rol (${teachersPorRol.length})">`;
                teachersPorRol.forEach(teacher => {
                    const nombre = teacher.full_name || teacher.nombre_completo || teacher.name || 'Sin nombre';
                    const email = teacher.email || 'Sin email';
                    optionsHTML += `<option value="${teacher.user_id || teacher.id}" data-teacher-email="${email}">🔑 ${nombre}</option>`;
                });
                optionsHTML += '</optgroup>';
            }

            // Opción manual
            optionsHTML += '<optgroup label="📝 Otras opciones">';
            optionsHTML += '<option value="manual">📝 Otro profesor (especificar manualmente)</option>';
            optionsHTML += '</optgroup>';

            teachersSelect.innerHTML = optionsHTML;

            // Verificar si Francisca está en la lista
            const franciscaOption = teachersSelect.querySelector('option[data-teacher-email*="franita"]');
            if (franciscaOption) {
                console.log('🎯 ¡Francisca encontrada y agregada al select!');
                // Crear un mensaje de confirmación visual
                const teacherSection = this.element?.querySelector('#teacher-section');
                if (teacherSection) {
                    const confirmMsg = document.createElement('div');
                    confirmMsg.className = 'text-xs text-green-600 mt-1';
                    confirmMsg.innerHTML = '🎯 ¡Francisca Gavilan detectada como teacher disponible!';
                    teacherSection.appendChild(confirmMsg);
                    
                    // Auto-ocultar después de 5 segundos
                    setTimeout(() => {
                        if (confirmMsg.parentNode) {
                            confirmMsg.remove();
                        }
                    }, 5000);
                }
            }

            console.log('✅ Select de teachers poblado correctamente con datos reales');

        } catch (error) {
            console.error('❌ Error poblando select de teachers:', error);
            this.loadDefaultTeachers();
        }
    }

    // ✅ FUNCIÓN DE FALLBACK: Profesores por defecto
    loadDefaultTeachers() {
        try {
            const teachersSelect = this.element?.querySelector('#teachers-select');
            if (!teachersSelect) {
                console.warn('⚠️ Elemento #teachers-select no encontrado en loadDefaultTeachers');
                return;
            }
            
            teachersSelect.innerHTML = `
                <option value="">Seleccionar profesor/a</option>
                <optgroup label="🎯 Profesores Conocidos (2)">
                    <option value="default-francisca" data-teacher-email="franita90@gmail.com">🎯 Francisca Gavilan</option>
                    <option value="default-ricardo" data-teacher-email="ricardo.huiscaleo@gmail.com">🎯 Ricardo Huiscaleo</option>
                </optgroup>
                <optgroup label="📚 Colegio Fines Relmu (Ejemplo)">
                    <option value="default-1" data-teacher-email="carmen.silva@finesrelmu.cl">Profesora Carmen Silva (2° Básico A)</option>
                    <option value="default-2" data-teacher-email="miguel.torres@finesrelmu.cl">Profesor Miguel Torres (2° Básico B)</option>
                    <option value="default-3" data-teacher-email="ana.morales@finesrelmu.cl">Profesora Ana Morales (1° Básico A)</option>
                </optgroup>
                <optgroup label="📝 Otras opciones">
                    <option value="manual">Otro profesor (especificar manualmente)</option>
                </optgroup>
            `;
            
            console.log('✅ Profesores por defecto cargados (fallback final)');
        } catch (error) {
            console.error('❌ Error cargando profesores por defecto:', error);
        }
    }

    // ✅ CONFIGURAR EVENT LISTENERS
    setupEventListeners() {
        try {
            if (!this.element || this.isDestroyed) return;
            
            // Cerrar modal
            const closeBtn = this.element.querySelector('.close-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.handleAction('cancel');
                });
            }
            
            // Submit del formulario
            const form = this.element.querySelector('.create-form');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleFormSubmit();
                });
            }
            
            // Botón cancelar
            const cancelBtn = this.element.querySelector('.cancel-btn');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    this.handleAction('cancel');
                });
            }
            
            // Event listeners para elementos interactivos
            this.setupInteractiveListeners();
            
        } catch (error) {
            console.error('❌ Error configurando event listeners:', error);
        }
    }
    
    setupInteractiveListeners() {
        try {
            // Género
            const genderRadios = this.element.querySelectorAll('input[name="gender"]');
            genderRadios.forEach(radio => {
                radio.addEventListener('change', () => {
                    // Reset all cards
                    this.element.querySelectorAll('.gender-card').forEach(card => {
                        card.className = 'gender-card p-4 border-2 border-gray-200 rounded-lg text-center hover:border-pink-300 transition-all';
                    });
                    
                    // Highlight selected
                    const selectedCard = radio.closest('.gender-option').querySelector('.gender-card');
                    if (selectedCard) {
                        const color = radio.value === 'niña' ? 'pink' : 'blue';
                        selectedCard.className = `gender-card p-4 border-2 border-${color}-500 bg-${color}-50 rounded-lg text-center transition-all`;
                    }
                });
            });
            
            // Nivel matemático
            const mathLevelRadios = this.element.querySelectorAll('input[name="mathLevel"]');
            mathLevelRadios.forEach(radio => {
                radio.addEventListener('change', () => {
                    // Reset all cards
                    this.element.querySelectorAll('.level-card').forEach(card => {
                        card.className = 'level-card p-3 border-2 border-gray-200 rounded-lg text-center hover:border-yellow-300 transition-all';
                    });
                    
                    // Highlight selected
                    const selectedCard = radio.closest('.level-option').querySelector('.level-card');
                    if (selectedCard) {
                        const colors = {
                            '1': 'green',
                            '2': 'yellow',
                            '3': 'red'
                        };
                        const color = colors[radio.value];
                        selectedCard.className = `level-card p-3 border-2 border-${color}-500 bg-${color}-50 rounded-lg text-center transition-all`;
                    }
                });
            });
            
        } catch (error) {
            console.error('❌ Error configurando listeners interactivos:', error);
        }
    }
    
    async handleFormSubmit() {
        try {
            const formData = this.getFormData();
            
            if (!this.validateFormData(formData)) {
                return;
            }
            
            this.handleAction('create-student', formData);
            
        } catch (error) {
            console.error('❌ Error en submit del formulario:', error);
        }
    }
    
    getFormData() {
        try {
            const form = this.element.querySelector('.create-form');
            if (!form) {
                throw new Error('Formulario no encontrado');
            }
            
            const formData = new FormData(form);
            
            // Obtener intereses seleccionados
            const interests = Array.from(this.element.querySelectorAll('input[name="interests"]:checked'))
                .map(cb => cb.value);

            // ✅ OBTENER PROFESOR SELECCIONADO
            const teacherSelect = this.element.querySelector('#teachers-select');
            const selectedTeacher = teacherSelect ? {
                id: teacherSelect.value,
                email: teacherSelect.selectedOptions[0]?.dataset.teacherEmail || '',
                name: teacherSelect.selectedOptions[0]?.textContent || ''
            } : null;
            
            return {
                name: formData.get('name'),
                age: parseInt(formData.get('age')),
                gender: formData.get('gender'),
                course: formData.get('course'),
                school: formData.get('school') || 'Colegio Fines Relmu',
                teacher: selectedTeacher, // ✅ NUEVO: Datos del profesor
                interests: interests,
                mathLevel: parseInt(formData.get('mathLevel'))
            };
            
        } catch (error) {
            console.error('❌ Error obteniendo datos del formulario:', error);
            return null;
        }
    }
    
    validateFormData(data) {
        if (!data || !data.name || data.name.trim().length < 2) {
            alert('Por favor ingresa un nombre válido');
            return false;
        }
        
        if (!data.age || data.age < 5 || data.age > 12) {
            alert('Por favor selecciona una edad válida');
            return false;
        }
        
        if (!data.gender) {
            alert('Por favor selecciona el género');
            return false;
        }
        
        if (!data.course) {
            alert('Por favor selecciona el curso');
            return false;
        }
        
        return true;
    }
}

/**
 * ✏️ MODAL DE EDICIÓN (PLACEHOLDER)
 */
class EditStudentModal extends BaseStudentModal {
    createElement() {
        const modalHTML = `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay">
                <div class="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
                    <div class="p-6 text-center">
                        <h3 class="text-lg font-bold mb-4">✏️ Editar Estudiante</h3>
                        <p class="text-gray-600 mb-4">Funcionalidad pendiente de implementar</p>
                        <button class="close-btn bg-blue-500 text-white px-4 py-2 rounded-lg">Cerrar</button>
                    </div>
                </div>
            </div>
        `;
        
        this.element = document.createElement('div');
        this.element.innerHTML = modalHTML;
        this.element = this.element.firstElementChild;
        document.body.appendChild(this.element);
        
        this.element.querySelector('.close-btn').addEventListener('click', () => {
            this.handleAction('cancel');
        });
    }
}

// ✅ INICIALIZACIÓN GLOBAL
if (typeof window !== 'undefined') {
    if (!window.studentModalSystem) {
        window.studentModalSystem = new StudentModalSystem();
        
        // Referencias de compatibilidad
        window.studentManager = window.studentModalSystem;
        
        // Funciones globales
        window.openStudentModal = function() {
            if (window.studentModalSystem) {
                window.studentModalSystem.openModal('selection');
            }
        };
        
        window.closeStudentModals = function() {
            if (window.studentModalSystem) {
                window.studentModalSystem.closeActiveModal();
            }
        };
        
        console.log('✅ Sistema de modales disponible globalmente');
    }
}

console.log('✅ Sistema de Modales de Estudiantes cargado');