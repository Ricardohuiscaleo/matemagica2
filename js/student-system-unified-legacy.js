/**
 * 🎯 SISTEMA UNIFICADO DE GESTIÓN DE ESTUDIANTES v3.0
 * Reemplaza y unifica: student-management.js, student-selection-modal.js, student-modals.js
 * Responsabilidad: Gestión completa y modular de estudiantes con modales dinámicos
 * ✅ ELIMINA DUPLICACIONES Y CONFLICTOS
 */

console.log('👥 Inicializando Sistema Unificado de Gestión de Estudiantes v3.0...');

class UnifiedStudentSystem {
    constructor() {
        // Estado centralizado único
        this.state = {
            students: [],
            currentStudent: null,
            isInitialized: false,
            activeModal: null,
            supabaseClient: null,
            authWaitAttempts: 0
        };
        
        // Configuración del sistema
        this.config = {
            modalPrefix: 'unified-student-modal',
            enableSupabase: true,
            enableLocalStorage: true,
            maxStudents: 50,
            authMaxWaitTime: 10000 // 10 segundos
        };
        
        // Factory de modales
        this.modalFactory = new StudentModalFactory();
        
        // Auto-inicializar SIN duplicar
        this.initializeOnce();
    }
    
    // ✅ INICIALIZACIÓN ÚNICA - Prevenir duplicaciones
    async initializeOnce() {
        // Prevenir múltiples inicializaciones
        if (window.unifiedStudentSystemInitialized) {
            console.log('⚠️ Sistema unificado ya inicializado, saltando...');
            return;
        }
        
        window.unifiedStudentSystemInitialized = true;
        console.log('🚀 Iniciando sistema unificado (ÚNICA VEZ)...');
        
        try {
            // 1. ✅ VERIFICAR AUTENTICACIÓN LOCAL PRIMERO
            this.checkLocalAuthentication();
            
            // 2. Esperar por sistema de autenticación completo
            await this.waitForAuthSystem();
            
            // 3. Inicializar conexión con Supabase (pero no depender de ella)
            await this.initializeSupabase();
            
            // 4. Cargar datos de estudiantes
            await this.loadStudents();
            
            // 5. Configurar event listeners
            this.setupEventListeners();
            
            // 6. Marcar como inicializado
            this.state.isInitialized = true;
            
            console.log('✅ Sistema unificado inicializado completamente');
            
        } catch (error) {
            console.error('❌ Error en inicialización:', error);
            // Continuar en modo offline/local
            this.initializeOfflineMode();
        }
    }
    
    // ✅ ESPERAR SISTEMA DE AUTH - Evitar loops infinitos
    async waitForAuthSystem() {
        console.log('🔄 Esperando por sistema de autenticación...');
        
        let attempts = 0;
        const maxAttempts = 20;
        
        while (attempts < maxAttempts) {
            // Verificar si algún sistema de auth está disponible
            if (window.supabaseClient || window.loginSystem?.supabase || localStorage.getItem('matemagica-authenticated')) {
                console.log('✅ Sistema de auth detectado');
                await new Promise(resolve => setTimeout(resolve, 500)); // Pequeña pausa adicional
                return true;
            }
            
            attempts++;
            console.log(`🔍 Esperando auth system... ${attempts}/${maxAttempts}`);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        console.log('⚠️ Sistema de auth no se inicializó en tiempo esperado');
        return false;
    }
    
    // ✅ CONEXIÓN SUPABASE UNIFICADA (MEJORADA)
    async initializeSupabase() {
        if (!this.config.enableSupabase) {
            console.log('⚠️ Supabase deshabilitado en configuración');
            return;
        }
        
        try {
            console.log('🔌 Inicializando conexión Supabase...');
            
            // ✅ VERIFICAR SI SUPABASE ESTÁ DISPONIBLE GLOBALMENTE
            if (typeof window.supabase === 'undefined') {
                console.log('⚠️ Librería Supabase no disponible globalmente');
                
                // ✅ INTENTAR CREAR CLIENTE DIRECTAMENTE SI TENEMOS LAS CREDENCIALES
                if (typeof window.createSupabaseClient === 'function') {
                    console.log('🔄 Intentando crear cliente con función personalizada...');
                    const client = window.createSupabaseClient();
                    if (client) {
                        this.state.supabaseClient = client;
                        console.log('✅ Cliente Supabase creado con función personalizada');
                        return;
                    }
                }
                
                console.log('⚠️ No se puede crear cliente Supabase, usando localStorage únicamente');
                return;
            }
            
            // ✅ INTENTAR CREAR CLIENTE CON CONFIGURACIÓN CONOCIDA
            const SUPABASE_CONFIG = {
                url: "https://uznvakpuuxnpdhoejrog.supabase.co",
                anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bnZha3B1dXhucGRob2Vqcm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODg0MTAsImV4cCI6MjA2NDY2NDQxMH0.OxbLYkjlgpWFnqd28gaZSwar_NQ6_qUS3U76bqbcXVg"
            };
            
            // Orden de prioridad para obtener cliente
            const clientSources = [
                () => window.supabaseClient, // Cliente ya inicializado
                () => window.loginSystem?.supabase, // Sistema de login
                () => window.supabase?.createClient ? window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey) : null, // Crear nuevo
                () => this.createSupabaseClientDirectly() // Fallback directo
            ];
            
            for (let i = 0; i < clientSources.length; i++) {
                try {
                    console.log(`🔍 Probando fuente de cliente ${i + 1}...`);
                    const client = clientSources[i]();
                    
                    if (client && typeof client.from === 'function') {
                        // ✅ PROBAR QUE EL CLIENTE FUNCIONA
                        const { data, error } = await client
                            .from('math_profiles')
                            .select('id')
                            .limit(1);
                        
                        if (!error) {
                            this.state.supabaseClient = client;
                            console.log(`✅ Cliente Supabase conectado (fuente ${i + 1})`);
                            console.log(`📊 Conexión probada: ${data ? data.length : 0} registros accesibles`);
                            return;
                        } else {
                            console.log(`⚠️ Cliente ${i + 1} falló al probar conexión:`, error.message);
                        }
                    }
                } catch (clientError) {
                    console.log(`⚠️ Error con fuente ${i + 1}:`, clientError.message);
                    continue;
                }
            }
            
            console.log('⚠️ Ninguna fuente de cliente Supabase funcionó, usando localStorage');
            
        } catch (error) {
            console.warn('⚠️ Error conectando Supabase:', error);
        }
    }
    
    // ✅ NUEVA FUNCIÓN: Crear cliente Supabase directamente
    createSupabaseClientDirectly() {
        try {
            if (!window.supabase || !window.supabase.createClient) {
                return null;
            }
            
            const SUPABASE_CONFIG = {
                url: "https://uznvakpuuxnpdhoejrog.supabase.co",
                anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bnZha3B1dXhucGRob2Vqcm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODg0MTAsImV4cCI6MjA2NDY2NDQxMH0.OxbLYkjlgpWFnqd28gaZSwar_NQ6_qUS3U76bqbcXVg"
            };
            
            console.log('🔧 Creando cliente Supabase directamente...');
            const client = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
            
            if (client) {
                console.log('✅ Cliente Supabase creado directamente');
                return client;
            }
            
            return null;
        } catch (error) {
            console.error('❌ Error creando cliente directamente:', error);
            return null;
        }
    }
    
    // ✅ CARGA DE DATOS UNIFICADA
    async loadStudents() {
        try {
            console.log('📚 Cargando estudiantes...');
            
            // Intentar Supabase primero
            if (this.state.supabaseClient) {
                const supabaseStudents = await this.loadFromSupabase();
                if (supabaseStudents?.length > 0) {
                    this.state.students = supabaseStudents;
                    await this.saveToLocal();
                    this.loadCurrentStudent();
                    return;
                }
            }
            
            // Fallback a localStorage
            this.loadFromLocal();
            this.loadCurrentStudent();
            
        } catch (error) {
            console.error('❌ Error cargando estudiantes:', error);
            this.state.students = [];
        }
    }
    
    // ✅ CARGAR DESDE SUPABASE
    async loadFromSupabase() {
        try {
            const userProfile = JSON.parse(localStorage.getItem('matemagica-user-profile') || '{}');
            const parentId = userProfile.user_id;
            
            if (!parentId) return null;
            
            const { data, error } = await this.state.supabaseClient
                .from('math_profiles')
                .select('*')
                .eq('parent_id', parentId)
                .eq('user_role', 'student')
                .not('user_id', 'is', null)
                .order('created_at', { ascending: true });
            
            if (error) {
                console.error('❌ Error consultando Supabase:', error);
                return null;
            }
            
            // Convertir formato
            return data.map(student => ({
                id: student.user_id,
                name: student.full_name,
                age: student.age || 8,
                gender: student.gender || 'niño',
                course: student.course || '',
                interests: student.interests || [],
                mathLevel: student.current_level || 1,
                avatar: student.avatar || (student.gender === 'niña' ? '👧' : '👦'),
                parentId: student.parent_id,
                createdAt: student.created_at,
                lastActivity: student.updated_at || student.created_at,
                stats: {
                    totalExercises: student.total_exercises || 0,
                    correctAnswers: student.correct_exercises || 0,
                    totalPoints: student.total_points || 0,
                    streakDays: student.streak_days || 0,
                    averageAccuracy: student.average_accuracy || 0
                }
            }));
            
        } catch (error) {
            console.error('❌ Error en loadFromSupabase:', error);
            return null;
        }
    }
    
    // ✅ MODAL DINÁMICO PRINCIPAL - Reemplaza todos los modales (MEJORADO)
    openModal(type, options = {}) {
        try {
            // ✅ PREVENIR DOBLE APERTURA CON VERIFICACIÓN SEGURA
            if (this.state.activeModal) {
                console.log('⚠️ Modal activo detectado, cerrando con seguridad...');
                this.closeActiveModalSafely();
                
                // Usar Promise para esperar que el modal anterior se cierre completamente
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(this.openModal(type, options));
                    }, 200);
                });
            }
            
            console.log(`🔄 Creando modal de tipo: ${type}`);
            
            // ✅ CORREGIR: Usar bind para mantener el contexto correcto
            const modal = this.modalFactory.createModal(type, {
                ...options,
                students: this.state.students,
                currentStudent: this.state.currentStudent,
                onAction: this.handleModalAction.bind(this)
            });
            
            // ✅ VERIFICAR QUE EL MODAL SE CREÓ CORRECTAMENTE
            if (!modal) {
                console.error('❌ Error: No se pudo crear el modal');
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
    
    // ✅ CERRAR MODAL ACTIVO CON SEGURIDAD (NUEVO)
    closeActiveModalSafely() {
        try {
            if (this.state.activeModal) {
                // Verificar que el modal tenga los métodos necesarios
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
            // Forzar limpieza del estado
            this.state.activeModal = null;
        }
    }
    
    // ✅ CERRAR MODAL ACTIVO (MEJORADO)
    closeActiveModal() {
        this.closeActiveModalSafely();
    }

    // ✅ MANEJO DE ACCIONES DEL MODAL - MÉTODO PRINCIPAL QUE PROCESA TODAS LAS ACCIONES
    async handleModalAction(action, data) {
        try {
            console.log(`🎬 Ejecutando acción del modal: ${action}`, data);
            
            switch (action) {
                case 'select-student':
                    await this.selectStudent(data.studentId);
                    this.closeActiveModal();
                    this.showSuccess(`✅ ${data.studentName} seleccionado`);
                    break;
                    
                case 'create-student':
                    const newStudent = await this.createStudent(data);
                    this.closeActiveModal();
                    this.showSuccess(`✅ ${newStudent.name} registrado correctamente`);
                    break;
                    
                case 'update-student':
                    const updatedStudent = await this.updateStudent(data.studentId, data);
                    this.closeActiveModal();
                    this.showSuccess(`✅ ${updatedStudent.name} actualizado`);
                    break;
                    
                case 'delete-student':
                    await this.deleteStudent(data.studentId);
                    this.closeActiveModal();
                    this.showSuccess('✅ Estudiante eliminado');
                    break;
                    
                case 'cancel':
                    this.closeActiveModal();
                    break;
                    
                case 'open-create-modal':
                    this.closeActiveModal();
                    // Pequeña pausa para evitar conflictos
                    setTimeout(() => {
                        this.openModal('create');
                    }, 100);
                    break;
                    
                default:
                    console.warn('Acción no reconocida:', action);
            }
            
        } catch (error) {
            console.error('❌ Error en acción del modal:', error);
            this.showError('Error al procesar la acción');
        }
    }

    // ✅ FUNCIONES PRINCIPALES DE ESTUDIANTES
    async createStudent(studentData) {
        const studentId = `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const parentProfile = JSON.parse(localStorage.getItem('matemagica-user-profile') || '{}');
        
        const newStudent = {
            id: studentId,
            name: studentData.name.trim(),
            age: parseInt(studentData.age),
            gender: studentData.gender,
            course: studentData.course?.trim() || '',
            interests: studentData.interests || [],
            mathLevel: parseInt(studentData.mathLevel) || 1,
            avatar: studentData.avatar || (studentData.gender === 'niña' ? '👧' : '👦'),
            parentId: parentProfile.user_id || 'unknown',
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            stats: { totalExercises: 0, correctAnswers: 0, totalPoints: 0, streakDays: 0, averageAccuracy: 0 }
        };
        
        this.state.students.push(newStudent);
        await this.saveToLocal();
        
        if (this.state.supabaseClient) {
            await this.saveToSupabase(newStudent);
        }
        
        // Si es el primer estudiante, seleccionarlo
        if (this.state.students.length === 1) {
            await this.selectStudent(newStudent.id);
        }
        
        this.updateUI();
        return newStudent;
    }
    
    async selectStudent(studentId) {
        const student = this.state.students.find(s => s.id === studentId);
        if (!student) throw new Error('Estudiante no encontrado');
        
        this.state.currentStudent = student;
        localStorage.setItem('matemagica_current_student_id', studentId);
        this.updateUI();
        
        return student;
    }
    
    async updateStudent(studentId, newData) {
        const studentIndex = this.state.students.findIndex(s => s.id === studentId);
        if (studentIndex === -1) throw new Error('Estudiante no encontrado');
        
        const updatedStudent = {
            ...this.state.students[studentIndex],
            ...newData,
            lastActivity: new Date().toISOString()
        };
        
        this.state.students[studentIndex] = updatedStudent;
        
        if (this.state.currentStudent?.id === studentId) {
            this.state.currentStudent = updatedStudent;
        }
        
        await this.saveToLocal();
        
        if (this.state.supabaseClient) {
            await this.saveToSupabase(updatedStudent);
        }
        
        this.updateUI();
        return updatedStudent;
    }
    
    // ✅ GUARDAR EN SUPABASE
    async saveToSupabase(student) {
        try {
            if (!this.state.supabaseClient) return false;
            
            const supabaseRecord = {
                user_id: student.id,
                full_name: student.name,
                age: student.age,
                gender: student.gender,
                course: student.course,
                interests: student.interests,
                current_level: student.mathLevel,
                parent_id: student.parentId,
                user_role: 'student',
                avatar: student.avatar,
                total_exercises: student.stats.totalExercises,
                correct_exercises: student.stats.correctAnswers,
                total_points: student.stats.totalPoints,
                streak_days: student.stats.streakDays,
                average_accuracy: student.stats.averageAccuracy,
                created_at: student.createdAt,
                updated_at: student.lastActivity
            };
            
            const { error } = await this.state.supabaseClient
                .from('math_profiles')
                .upsert(supabaseRecord, { onConflict: 'user_id' });
            
            if (error) {
                console.error('❌ Error guardando en Supabase:', error);
                return false;
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Error en saveToSupabase:', error);
            return false;
        }
    }
    
    // ✅ PERSISTENCIA DE DATOS
    async saveToLocal() {
        try {
            localStorage.setItem('matemagica_student_profiles', JSON.stringify(this.state.students));
            return true;
        } catch (error) {
            console.error('❌ Error guardando en localStorage:', error);
            return false;
        }
    }
    
    loadFromLocal() {
        try {
            const localStudents = localStorage.getItem('matemagica_student_profiles');
            if (localStudents) {
                this.state.students = JSON.parse(localStudents);
                console.log(`✅ ${this.state.students.length} estudiantes cargados desde localStorage`);
            } else {
                this.state.students = [];
                console.log('📚 No hay estudiantes guardados');
            }
        } catch (error) {
            console.error('❌ Error cargando desde localStorage:', error);
            this.state.students = [];
        }
    }
    
    loadCurrentStudent() {
        try {
            const currentStudentId = localStorage.getItem('matemagica_current_student_id');
            if (currentStudentId && this.state.students.length > 0) {
                const student = this.state.students.find(s => s.id === currentStudentId);
                if (student) {
                    this.state.currentStudent = student;
                    console.log('✅ Estudiante actual cargado:', student.name);
                } else if (this.state.students.length > 0) {
                    this.selectStudent(this.state.students[0].id);
                }
            } else if (this.state.students.length > 0) {
                this.selectStudent(this.state.students[0].id);
            }
        } catch (error) {
            console.error('❌ Error cargando estudiante actual:', error);
        }
    }
    
    // ✅ ACTUALIZACIÓN DE UI UNIFICADA
    updateUI() {
        this.updateCurrentStudentDisplay();
        this.updateDashboardStats();
    }
    
    updateCurrentStudentDisplay() {
        const nameElement = document.getElementById('current-student-name');
        const avatarElement = document.querySelector('.student-avatar, .w-8.h-8.bg-blue-500.rounded-full, .w-8.h-8.bg-pink-500.rounded-full');
        
        if (this.state.currentStudent) {
            if (nameElement) nameElement.textContent = this.state.currentStudent.name;
            
            if (avatarElement) {
                const avatar = this.state.currentStudent.avatar || (this.state.currentStudent.gender === 'niña' ? '👧' : '👦');
                avatarElement.textContent = avatar;
                
                if (this.state.currentStudent.gender === 'niña') {
                    avatarElement.className = avatarElement.className.replace(/bg-blue-\d+/, 'bg-pink-500');
                } else {
                    avatarElement.className = avatarElement.className.replace(/bg-pink-\d+/, 'bg-blue-500');
                }
            }
        } else {
            if (nameElement) nameElement.textContent = 'Sin estudiante';
            if (avatarElement) avatarElement.textContent = '?';
        }
    }
    
    updateDashboardStats() {
        // Actualizar estadísticas del dashboard si existen elementos
        const statsElements = {
            totalStudents: document.getElementById('stat-students'),
            totalExercises: document.getElementById('stat-exercises'),
            totalPoints: document.getElementById('stat-points')
        };
        
        if (statsElements.totalStudents) {
            statsElements.totalStudents.textContent = this.state.students.length;
        }
        
        if (this.state.currentStudent) {
            if (statsElements.totalExercises) {
                statsElements.totalExercises.textContent = this.state.currentStudent.stats.totalExercises || 0;
            }
            if (statsElements.totalPoints) {
                statsElements.totalPoints.textContent = this.state.currentStudent.stats.totalPoints || 0;
            }
        }
    }
    
    // ✅ EVENT LISTENERS UNIFICADOS
    setupEventListeners() {
        // Botón principal de estudiante
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
        
        console.log('✅ Event listeners unificados configurados');
    }
    
    // ✅ FUNCIONES AUXILIARES
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
    
    handleInitializationError(error) {
        console.error('❌ Error en inicialización del sistema unificado:', error);
        try {
            this.loadFromLocal();
            this.setupEventListeners();
            this.state.isInitialized = true;
            console.log('⚠️ Sistema inicializado en modo fallback');
        } catch (fallbackError) {
            console.error('❌ Error incluso en modo fallback:', fallbackError);
        }
   }
    
    // ✅ API PÚBLICA
    getAllStudents() { return [...this.state.students]; }
    getCurrentStudent() { return this.state.currentStudent; }
    getStudentCount() { return this.state.students.length; }
    isInitialized() { return this.state.isInitialized; }
    getStudentById(studentId) { return this.state.students.find(s => s.id === studentId); }
    
    // ✅ MÉTODOS DE COMPATIBILIDAD CON CÓDIGO EXISTENTE
    openStudentModal() { this.openModal('selection'); }
    closeModals() { this.closeActiveModal(); }
    
    // ✅ MÉTODO DE ESTADÍSTICAS
    async updateStudentStats(studentId, newStats) {
        try {
            const student = this.getStudentById(studentId);
            if (!student) return false;
            
            student.stats = { ...student.stats, ...newStats };
            student.lastActivity = new Date().toISOString();
            
            await this.saveToLocal();
            
            if (this.state.supabaseClient) {
                await this.saveToSupabase(student);
            }
            
            // Actualizar display si es el estudiante current
            if (this.state.currentStudent?.id === studentId) {
                this.state.currentStudent = student;
                this.updateUI();
            }
            
            return true;
        } catch (error) {
            console.error('❌ Error actualizando estadísticas:', error);
            return false;
        }
    }
    
    // ✅ NUEVA FUNCIÓN: Verificar autenticación local
    checkLocalAuthentication() {
        try {
            const isAuthenticated = localStorage.getItem('matemagica-authenticated');
            const userProfile = localStorage.getItem('matemagica-user-profile');
            const supabaseToken = localStorage.getItem('sb-uznvakpuuxnpdhoejrog-auth-token');
            
            console.log('🔍 Verificando autenticación completa...');
            console.log('  - Flag autenticado:', isAuthenticated);
            console.log('  - Perfil usuario:', !!userProfile);
            console.log('  - Token Supabase:', !!supabaseToken);
            
            if (isAuthenticated === 'true' && userProfile) {
                const profile = JSON.parse(userProfile);
                
                // ✅ VERIFICAR SI EL TOKEN DE SUPABASE HA EXPIRADO
                if (supabaseToken) {
                    try {
                        const tokenData = JSON.parse(supabaseToken);
                        const expiresAt = tokenData.expires_at * 1000; // Convertir a millisegundos
                        const now = Date.now();
                        
                        if (now > expiresAt) {
                            console.warn('⚠️ Token de Supabase expirado, requiere reautenticación');
                            this.forceReauthentication();
                            return false;
                        }
                    }
                    catch (tokenError) {
                        console.warn('⚠️ Error verificando token Supabase:', tokenError);
                    }
                }
                
                this.state.userProfile = profile;
                this.state.isAuthenticated = true;
                
                // ✅ ACTUALIZAR DISPLAY DEL USUARIO REAL
                this.updateUserDisplay(profile);
                
                console.log(`✅ Autenticación válida confirmada: ${profile.email}`);
                return true;
            }
            
            console.log('❌ Sin autenticación válida');
            return false;
        } catch (error) {
            console.error('❌ Error verificando autenticación:', error);
            return false;
        }
    }
    
    // ✅ NUEVA FUNCIÓN: Forzar reautenticación cuando el token expira
    forceReauthentication() {
        try {
            console.log('🔄 Forzando reautenticación...');
            
            // Limpiar todos los tokens expirados
            localStorage.removeItem('sb-uznvakpuuxnpdhoejrog-auth-token');
            localStorage.removeItem('matemagica-authenticated');
            localStorage.removeItem('matemagica-user-profile');
            
            // Mostrar mensaje al usuario
            this.showReauthenticationMessage();
            
            // Redirigir al login después de 3 segundos
            setTimeout(() => {
                window.location.href = 'index.html?expired=true';
            }, 3000);
            
        } catch (error) {
            console.error('❌ Error en reautenticación forzada:', error);
        }
    }
    
    // ✅ NUEVA FUNCIÓN: Mostrar mensaje de reautenticación
    showReauthenticationMessage() {
        // Crear overlay de mensaje
        const messageOverlay = document.createElement('div');
        messageOverlay.innerHTML = `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-xl shadow-xl max-w-md mx-4 p-6 text-center">
                    <div class="text-4xl mb-4">🔐</div>
                    <h3 class="text-lg font-bold text-gray-800 mb-2">Sesión Expirada</h3>
                    <p class="text-gray-600 mb-4">Tu sesión ha expirado. Te redirigiremos al login.</p>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-blue-600 h-2 rounded-full animate-pulse" style="width: 100%"></div>
                    </div>
                    <p class="text-sm text-gray-500 mt-2">Redirigiendo en 3 segundos...</p>
                </div>
            </div>
        `;
        document.body.appendChild(messageOverlay);
    }
    
    // ✅ NUEVA FUNCIÓN: Actualizar display del usuario real
    updateUserDisplay(profile) {
        try {
            // Actualizar nombre de usuario en el header
            const welcomeElement = document.getElementById('welcome-message');
            if (welcomeElement) {
                const now = new Date();
                const timeString = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                welcomeElement.textContent = `👋 Hola, ${profile.full_name || profile.email} - ${timeString}`;
            }
            
            // Actualizar rol de usuario
            const roleElement = document.getElementById('user-role-text');
            if (roleElement) {
                const roleLabels = {
                    'parent': 'Apoderado',
                    'teacher': 'Profesor',
                    'admin': 'Administrador'
                };
                roleElement.textContent = roleLabels[profile.user_role] || 'Usuario';
            }
            
            // Mostrar indicadores de usuario autenticado
            this.showAuthenticatedIndicators();
            
            console.log('✅ Display de usuario actualizado correctamente');
            
        } catch (error) {
            console.error('❌ Error actualizando display de usuario:', error);
        }
    }
    
    // ✅ NUEVA FUNCIÓN: Mostrar indicadores de autenticación activa
    showAuthenticatedIndicators() {
        try {
            // Activar indicador de IA
            const aiIndicator = document.getElementById('ai-indicator');
            if (aiIndicator) {
                const statusDot = aiIndicator.querySelector('.ai-status-dot');
                const statusText = aiIndicator.querySelector('.ai-status-text');
                
                if (statusDot) {
                    statusDot.className = 'w-3 h-3 bg-green-500 rounded-full animate-pulse';
                }
                if (statusText) {
                    statusText.textContent = 'IA ACTIVA';
                    statusText.className = 'text-xs font-medium text-green-600';
                }
            }
            
            // Habilitar módulos del sidebar
            this.enableSidebarModules();
            
            console.log('✅ Indicadores de autenticación activados');
            
        } catch (error) {
            console.error('❌ Error mostrando indicadores:', error);
        }
    }
    
    // ✅ NUEVA FUNCIÓN: Habilitar módulos del sidebar
    enableSidebarModules() {
        try {
            // Habilitar navegación de matemáticas
            const mathModule = document.querySelector('[data-module="matematicas"]');
            if (mathModule) {
                mathModule.classList.remove('opacity-50', 'cursor-not-allowed');
                mathModule.removeAttribute('disabled');
                
                // Configurar click handler para matemáticas
                mathModule.addEventListener('click', () => {
                    this.navigateToMathematics();
                });
            }
            
            // Habilitar otros módulos cuando estén listos
            const modules = ['lenguaje', 'ciencias', 'historia', 'idiomas'];
            modules.forEach(moduleKey => {
                const moduleBtn = document.querySelector(`[data-module="${moduleKey}"]`);
                if (moduleBtn) {
                    moduleBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                }
            });
            
            console.log('✅ Módulos del sidebar habilitados');
            
        } catch (error) {
            console.error('❌ Error habilitando módulos:', error);
        }
    }
    
    // ✅ NUEVA FUNCIÓN: Navegar a matemáticas
    navigateToMathematics() {
        try {
            console.log('🧮 Navegando a módulo de matemáticas...');
            
            // Verificar que hay un estudiante seleccionado
            if (!this.state.currentStudent) {
                console.log('👥 No hay estudiante seleccionado, abriendo modal...');
                this.openModal('selection');
                return;
            }
            
            // Ocultar dashboard principal
            const dashboardContent = document.getElementById('dashboard-content');
            if (dashboardContent) {
                dashboardContent.style.display = 'none';
            }
            
            // Mostrar contenido de matemáticas
            const mathContent = document.getElementById('matematicas-segundo-content');
            if (mathContent) {
                mathContent.classList.remove('hidden');
                mathContent.style.display = 'block';
            }
            
            // Navegar usando el sistema existente
            if (window.mathematicsNavigation) {
                window.mathematicsNavigation.showMathematicsFromDashboard(this.state.currentStudent);
            }
            
            console.log('✅ Navegación a matemáticas completada');
            
        } catch (error) {
            console.error('❌ Error navegando a matemáticas:', error);
        }
    }
}

/**
 * 🏭 FACTORY DE MODALES DINÁMICOS
 * Crea modales específicos según necesidad (reemplaza HTML estático)
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
 * 📋 MODAL BASE PARA HERENCIA (MEJORADO)
 */
class BaseStudentModal {
    constructor(config) {
        this.config = config;
        this.element = null;
        this.isVisible = false;
        this.isDestroyed = false;
        
        // ✅ GUARDAR REFERENCIA AL CALLBACK onAction
        this.onAction = config.onAction || (() => {});
    }
    
    show() {
        try {
            if (this.isDestroyed) {
                console.warn('⚠️ Intentando mostrar modal destruido');
                return;
            }
            
            if (!this.element) this.createElement();
            
            if (this.element) {
                this.element.classList.remove('hidden');
                this.element.style.display = 'flex';
                this.isVisible = true;
                
                // Focus trap con verificación
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
                // Remover event listeners antes de eliminar el elemento
                this.cleanupEventListeners();
                
                if (this.element.parentNode) {
                    this.element.parentNode.removeChild(this.element);
                }
                this.element = null;
            }
        } catch (error) {
            console.error('❌ Error destruyendo modal:', error);
            // Forzar limpieza
            this.element = null;
            this.isDestroyed = true;
        }
    }
    
    // ✅ NUEVA FUNCIÓN: Limpiar event listeners
    cleanupEventListeners() {
        try {
            if (!this.element) return;
            
            // Remover listeners comunes
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
        // Implementar en clases hijas
        throw new Error('createElement debe ser implementado por la clase hija');
    }
    
    // ✅ MÉTODO handleAction - Delegar al callback del sistema principal
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
 * 👥 MODAL DE SELECCIÓN DE ESTUDIANTES (MEJORADO)
 */
class SelectionModal extends BaseStudentModal {
    createElement() {
        try {
            const modalHTML = `
                <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div class="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
                        <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-xl">
                            <div class="flex justify-between items-center">
                                <div>
                                    <h3 class="text-lg font-bold">👥 Seleccionar Estudiante</h3>
                                    <p class="text-blue-100 text-sm">Elige quién va a estudiar</p>
                                </div>
                                <button class="close-btn text-white hover:text-gray-200">
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
 * 📝 MODAL DE CREACIÓN DE ESTUDIANTES (MEJORADO)
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

                            <!-- Profesor (con datos reales) -->
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
            
            // ✅ CARGAR PROFESORES REALES USANDO SUPABASE
            this.loadTeachersFromSupabase();
            
        } catch (error) {
            console.error('❌ Error creando modal de creación:', error);
        }
    }

    // ✅ NUEVO MÉTODO: Obtener cliente Supabase de forma más robusta
    getSupabaseClient() {
        try {
            // Orden de prioridad para obtener cliente
            const clientSources = [
                () => window.unifiedStudentSystemInstance?.state?.supabaseClient,
                () => window.unifiedStudentSystem?.state?.supabaseClient,
                () => window.supabaseClient,
                () => window.loginSystem?.supabase,
                () => window.studentManager?.supabaseClient
            ];
            
            for (const getClient of clientSources) {
                try {
                    const client = getClient();
                    if (client && typeof client.from === 'function') {
                        console.log('✅ Cliente Supabase encontrado');
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

    // ✅ FUNCIÓN DE FALLBACK FINAL: Profesores por defecto
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

    // ✅ NUEVA FUNCIÓN: Cargar profesores reales desde Supabase (basado en buscar-teachers.html)
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
            if (!this.element || this.isDestroyed) return;
            
            // Configurar estilos CSS para elementos interactivos
            const style = document.createElement('style');
            style.textContent = `
                .interest-pill {
                    display: inline-block;
                    padding: 8px 12px;
                    background: #F3F4F6;
                    border: 1px solid transparent;
                    border-radius: 6px;
                    color: #374151;
                    font-size: 0.875rem;
                    transition: all 0.2s ease;
                    cursor: pointer;
                }
            `;
            document.head.appendChild(style);
            
            // Género
            const genderRadios = this.element.querySelectorAll('input[name="gender"]');
            genderRadios.forEach(radio => {
                radio.addEventListener('change', () => {
                    // Reset all cards
                    this.element.querySelectorAll('.gender-card').forEach(card => {
                        card.style.borderColor = '#D1D5DB';
                        card.style.backgroundColor = 'white';
                    });
                    
                    // Highlight selected
                    const selectedCard = radio.closest('.gender-option').querySelector('.gender-card');
                    if (selectedCard) {
                        selectedCard.style.borderColor = radio.value === 'niña' ? '#EC4899' : '#3B82F6';
                        selectedCard.style.backgroundColor = radio.value === 'niña' ? '#FCE7F3' : '#DBEAFE';
                    }
                });
            });
            
            // Intereses
            const interestCheckboxes = this.element.querySelectorAll('input[name="interests"]');
            interestCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    const pill = checkbox.closest('.interest-tag').querySelector('.interest-pill');
                    if (pill) {
                        if (checkbox.checked) {
                            pill.style.background = '#DBEAFE';
                            pill.style.borderColor = '#3B82F6';
                            pill.style.color = '#1E40AF';
                        } else {
                            pill.style.background = '#F3F4F6';
                            pill.style.borderColor = 'transparent';
                            pill.style.color = '#374151';
                        }
                    }
                });
            });
            
            // Nivel matemático
            const mathLevelRadios = this.element.querySelectorAll('input[name="mathLevel"]');
            mathLevelRadios.forEach(radio => {
                radio.addEventListener('change', () => {
                    // Reset all cards
                    this.element.querySelectorAll('.level-card').forEach(card => {
                        card.style.borderColor = '#D1D5DB';
                        card.style.backgroundColor = 'white';
                    });
                    
                    // Highlight selected
                    const selectedCard = radio.closest('.level-option').querySelector('.level-card');
                    if (selectedCard) {
                        const colors = {
                            '1': { border: '#10B981', bg: '#D1FAE5' },
                            '2': { border: '#F59E0B', bg: '#FEF3C7' },
                            '3': { border: '#EF4444', bg: '#FEE2E2' }
                        };
                        const color = colors[radio.value];
                        if (color) {
                            selectedCard.style.borderColor = color.border;
                            selectedCard.style.backgroundColor = color.bg;
                        }
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
            this.showFormError('Error al procesar el formulario');
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
            
            return {
                name: formData.get('name'),
                age: parseInt(formData.get('age')),
                gender: formData.get('gender'),
                course: formData.get('course'),
                school: formData.get('school') || 'Colegio Fines Relmu',
                teacher: formData.get('teacher'),
                interests: interests,
                mathLevel: parseInt(formData.get('mathLevel'))
            };
            
        } catch (error) {
            console.error('❌ Error obteniendo datos del formulario:', error);
            return null;
        }
    }

    validateFormData(data) {
        try {
            if (!data) {
                this.showFormError('Error obteniendo datos del formulario');
                return false;
            }
            
            if (!data.name || data.name.trim().length < 2) {
                this.showFormError('Por favor ingresa un nombre válido (mínimo 2 caracteres)');
                return false;
            }
            
            if (!data.age || data.age < 5 || data.age > 12) {
                this.showFormError('Por favor selecciona una edad válida (5-12 años)');
                return false;
            }
            
            if (!data.gender) {
                this.showFormError('Por favor selecciona el género');
                return false;
            }
            
            if (!data.course) {
                this.showFormError('Por favor selecciona el curso');
                return false;
            }
            
            if (!data.mathLevel) {
                this.showFormError('Por favor selecciona el nivel matemático');
                return false;
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Error validando formulario:', error);
            this.showFormError('Error validando datos');
            return false;
        }
    }

    showFormError(message) {
        try {
            // Crear o actualizar mensaje de error en el formulario
            let errorDiv = this.element.querySelector('.form-error-message');
            if (!errorDiv) {
                errorDiv = document.createElement('div');
                errorDiv.className = 'form-error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4';
                
                const form = this.element.querySelector('.create-form');
                if (form) {
                    form.insertBefore(errorDiv, form.firstChild);
                }
            }
            
            errorDiv.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    <span>${message}</span>
                </div>
            `;
            
            // Auto-ocultar después de 5 segundos
            setTimeout(() => {
                if (errorDiv && errorDiv.parentNode) {
                    errorDiv.remove();
                }
            }, 5000);
            
        } catch (error) {
            console.error('❌ Error mostrando mensaje de error:', error);
            // Fallback a alert
            alert(message);
        }
    }
}

/**
 * ✏️ MODAL DE EDICIÓN DE ESTUDIANTES
 */
class EditStudentModal extends BaseStudentModal {
    createElement() {
        // Similar al CreateStudentModal pero con datos precargados
        // Para mantener el código conciso, usaremos la misma estructura
        const modalHTML = `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <div class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-t-xl">
                        <div class="flex justify-between items-center">
                            <div>
                                <h3 class="text-lg font-bold">✏️ Editar Estudiante</h3>
                                <p class="text-blue-100 text-sm">Actualizar información</p>
                            </div>
                            <button class="close-btn text-white hover:text-gray-200">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>
                    </div>

                    <form class="edit-form p-6 space-y-5">
                        <!-- Similar estructura al CreateStudentModal -->
                        <div class="text-center text-gray-500">
                            <p>Funcionalidad de edición pendiente de implementar</p>
                        </div>
                        
                        <div class="flex space-x-3 pt-6 border-t border-gray-200">
                            <button type="button" class="cancel-btn flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors">
                                <i class="fas fa-times mr-2"></i>Cancelar
                            </button>
                            <button type="submit" class="save-btn flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                                <i class="fas fa-save mr-2"></i>Guardar Cambios
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
    }

    setupEventListeners() {
        // Cerrar modal
        this.element.querySelector('.close-btn').addEventListener('click', () => {
            this.handleAction('cancel');
        });
        
        // Submit del formulario
        this.element.querySelector('.edit-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAction('cancel'); // Por ahora solo cerrar
        });
        
        // Botón cancelar
        this.element.querySelector('.cancel-btn').addEventListener('click', () => {
            this.handleAction('cancel');
        });
    }
}

// ✅ INICIALIZACIÓN Y CONFIGURACIÓN GLOBAL DEL SISTEMA UNIFICADO
if (typeof window !== 'undefined') {
    // Prevenir múltiples inicializaciones
    if (!window.unifiedStudentSystemInstance) {
        window.unifiedStudentSystemInstance = new UnifiedStudentSystem();
        
        // ✅ EXPONER REFERENCIAS COMPATIBLES CON CÓDIGO EXISTENTE
        window.studentManager = window.unifiedStudentSystemInstance;
        window.unifiedStudentSystem = window.unifiedStudentSystemInstance;
        
        // ✅ FUNCIONES GLOBALES PARA COMPATIBILIDAD
        window.openStudentModal = function() {
            if (window.unifiedStudentSystemInstance) {
                window.unifiedStudentSystemInstance.openModal('selection');
            }
        };
        
        window.selectStudent = function(studentId) {
            if (window.unifiedStudentSystemInstance) {
                return window.unifiedStudentSystemInstance.selectStudent(studentId);
            }
        };
        
        window.closeStudentModals = function() {
            if (window.unifiedStudentSystemInstance) {
                window.unifiedStudentSystemInstance.closeActiveModal();
            }
        };
        
        // ✅ FUNCIÓN DE DIAGNÓSTICO
        window.diagnoseStudentSystem = function() {
            if (window.unifiedStudentSystemInstance) {
                console.log('🔬 === DIAGNÓSTICO SISTEMA UNIFICADO ===');
                console.log('Estado:', window.unifiedStudentSystemInstance.state);
                console.log('Configuración:', window.unifiedStudentSystemInstance.config);
                console.log('Estudiantes:', window.unifiedStudentSystemInstance.getAllStudents());
                console.log('Estudiante current:', window.unifiedStudentSystemInstance.getCurrentStudent());
                console.log('Sistema inicializado:', window.unifiedStudentSystemInstance.isInitialized());
                console.log('=================================');
            }
        };
        
        console.log('✅ Sistema Unificado de Gestión de Estudiantes disponible globalmente');
    }
}

// ✅ EXPORTAR PARA MÓDULOS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        UnifiedStudentSystem,
        StudentModalFactory,
        BaseStudentModal,
        SelectionModal,
        CreateStudentModal,
        EditStudentModal
    };
}

console.log('✅ Sistema Unificado de Gestión de Estudiantes v3.0 cargado completamente');