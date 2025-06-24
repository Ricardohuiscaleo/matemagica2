/**
 * 🎯 CORE DE GESTIÓN DE ESTUDIANTES
 * Responsabilidad: Lógica de negocio, datos y persistencia
 * Separado del sistema de modales para mejor organización
 */

console.log('💾 Inicializando Core de Gestión de Estudiantes...');

class StudentManagementCore {
    constructor() {
        // Estado centralizado
        this.state = {
            students: [],
            currentStudent: null,
            isInitialized: false,
            supabaseClient: null,
            authWaitAttempts: 0
        };
        
        // Configuración
        this.config = {
            enableSupabase: true,
            enableLocalStorage: true,
            maxStudents: 50,
            authMaxWaitTime: 10000
        };
        
        // Auto-inicializar
        this.initializeOnce();
    }
    
    // ✅ INICIALIZACIÓN ÚNICA
    async initializeOnce() {
        if (window.studentCoreInitialized) {
            console.log('⚠️ Core ya inicializado, saltando...');
            return;
        }
        
        window.studentCoreInitialized = true;
        console.log('🚀 Iniciando core de estudiantes...');
        
        try {
            // 1. Verificar autenticación local
            this.checkLocalAuthentication();
            
            // 2. Esperar sistema de auth
            await this.waitForAuthSystem();
            
            // 3. Inicializar Supabase
            await this.initializeSupabase();
            
            // 4. Cargar datos
            await this.loadStudents();
            
            // 5. Marcar como inicializado
            this.state.isInitialized = true;
            
            console.log('✅ Core de estudiantes inicializado');
            document.dispatchEvent(new CustomEvent('studentCoreReady'));
            
        } catch (error) {
            console.error('❌ Error en inicialización del core:', error);
            this.initializeOfflineMode();
        }
    }
    
    // ✅ VERIFICAR AUTENTICACIÓN LOCAL
    checkLocalAuthentication() {
        try {
            const isAuthenticated = localStorage.getItem('matemagica-authenticated');
            const userProfile = localStorage.getItem('matemagica-user-profile');
            const supabaseToken = localStorage.getItem('sb-uznvakpuuxnpdhoejrog-auth-token');
            
            console.log('🔍 Verificando autenticación local...');
            
            if (isAuthenticated === 'true' && userProfile) {
                const profile = JSON.parse(userProfile);
                
                // Verificar si el token ha expirado
                if (supabaseToken) {
                    try {
                        const tokenData = JSON.parse(supabaseToken);
                        const expiresAt = tokenData.expires_at * 1000;
                        const now = Date.now();
                        
                        if (now > expiresAt) {
                            console.warn('⚠️ Token expirado, requiere reautenticación');
                            this.forceReauthentication();
                            return false;
                        }
                    } catch (tokenError) {
                        console.warn('⚠️ Error verificando token:', tokenError);
                    }
                }
                
                this.state.userProfile = profile;
                this.state.isAuthenticated = true;
                
                console.log(`✅ Autenticación válida: ${profile.email}`);
                return true;
            }
            
            console.log('❌ Sin autenticación válida');
            return false;
        } catch (error) {
            console.error('❌ Error verificando autenticación:', error);
            return false;
        }
    }
    
    // ✅ FORZAR REAUTENTICACIÓN
    forceReauthentication() {
        try {
            console.log('🔄 Forzando reautenticación...');
            
            // Limpiar tokens expirados
            localStorage.removeItem('sb-uznvakpuuxnpdhoejrog-auth-token');
            localStorage.removeItem('matemagica-authenticated');
            localStorage.removeItem('matemagica-user-profile');
            
            // Redirigir después de 3 segundos
            setTimeout(() => {
                window.location.href = 'index.html?expired=true';
            }, 3000);
            
        } catch (error) {
            console.error('❌ Error en reautenticación forzada:', error);
        }
    }
    
    // ✅ ESPERAR SISTEMA DE AUTH
    async waitForAuthSystem() {
        console.log('🔄 Esperando sistema de autenticación...');
        
        let attempts = 0;
        const maxAttempts = 20;
        
        while (attempts < maxAttempts) {
            if (window.supabaseClient || window.loginSystem?.supabase || localStorage.getItem('matemagica-authenticated')) {
                console.log('✅ Sistema de auth detectado');
                await new Promise(resolve => setTimeout(resolve, 500));
                return true;
            }
            
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        console.log('⚠️ Sistema de auth no se inicializó en tiempo esperado');
        return false;
    }
    
    // ✅ INICIALIZAR SUPABASE
    async initializeSupabase() {
        if (!this.config.enableSupabase) {
            console.log('⚠️ Supabase deshabilitado');
            return;
        }
        
        try {
            console.log('🔌 Inicializando conexión Supabase OBLIGATORIA...');
            
            // ✅ CONFIGURACIÓN CORREGIDA CON API KEY VÁLIDA (copiada de buscar-teachers.html)
            const SUPABASE_CONFIG = {
                url: "https://uznvakpuuxnpdhoejrog.supabase.co",
                anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bnZha3B1dXhucGRob2Vqcm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODg0MTAsImV4cCI6MjA2NDY2NDQxMH0.OxbLYkjlgpWFnqd28gaZSwar_NQ6_qUS3U76bqbcXVg"
            };
            
            // ✅ ORDEN DE PRIORIDAD FORZADO A SUPABASE
            const clientSources = [
                () => window.supabaseClient,
                () => window.loginSystem?.supabase,
                () => window.supabase?.createClient ? window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey) : null
            ];
            
            for (let i = 0; i < clientSources.length; i++) {
                try {
                    console.log(`🔍 Probando fuente de cliente Supabase ${i + 1}...`);
                    const client = clientSources[i]();
                    
                    if (client && typeof client.from === 'function') {
                        // ✅ PROBAR CONEXIÓN REAL
                        console.log('🧪 Probando conexión real a Supabase...');
                        const { data, error } = await client
                            .from('math_profiles')
                            .select('id')
                            .limit(1);
                        
                        if (!error) {
                            this.state.supabaseClient = client;
                            
                            // ✅ NUEVO: Exponer cliente globalmente para otros módulos
                            window.supabaseClient = client;
                            window.studentManagementCore = { supabaseClient: client };
                            
                            console.log(`✅ Cliente Supabase CONECTADO EXITOSAMENTE (fuente ${i + 1})`);
                            console.log('✅ Conexión a base de datos CONFIRMADA');
                            console.log('🌍 Cliente Supabase expuesto globalmente para otros módulos');
                            return;
                        } else {
                            console.warn(`⚠️ Error en conexión fuente ${i + 1}:`, error.message);
                        }
                    }
                } catch (clientError) {
                    console.warn(`⚠️ Fuente ${i + 1} falló:`, clientError.message);
                    continue;
                }
            }
            
            // ❌ SI NO FUNCIONA NINGUNA FUENTE, ES ERROR CRÍTICO
            throw new Error('NO SE PUDO CONECTAR A SUPABASE - CONEXIÓN OBLIGATORIA');
            
        } catch (error) {
            console.error('❌ ERROR CRÍTICO: No se pudo conectar a Supabase:', error);
            // ❌ NO USAR FALLBACK - REQUERIR SUPABASE
            throw error;
        }
    }
    
    // ✅ CREAR CLIENTE SUPABASE DIRECTAMENTE
    createSupabaseClientDirectly() {
        try {
            if (!window.supabase || !window.supabase.createClient) {
                return null;
            }
            
            const SUPABASE_CONFIG = {
                url: "https://uznvakpuuxnpdhoejrog.supabase.co",
                anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bnZha3B1dXhucGRob2Vqcm9nIiwicm9zZSI6ImFub24iLCJpYXQiOjE3NDkwODg0MTAsImV4cCI6MjA2NDY2NDQxMH0.OxbLYkjlgpWFnqd28gaZSwar_NQ6_qUS3U76bqbcXVg"
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
    
    // ✅ MODO OFFLINE
    initializeOfflineMode() {
        try {
            this.loadFromLocal();
            this.state.isInitialized = true;
            console.log('⚠️ Modo offline inicializado');
        } catch (error) {
            console.error('❌ Error en modo offline:', error);
        }
    }
    
    // ✅ CARGAR ESTUDIANTES
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
    
    // ✅ CARGAR DESDE LOCAL
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
    
    // ✅ CARGAR ESTUDIANTE ACTUAL
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
    
    // ✅ CREAR ESTUDIANTE
    async createStudent(studentData) { // studentData viene de student-profile-management.js
        console.log('➕ Creando nuevo estudiante en Core:', studentData.name);
        const studentId = `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const parentProfile = JSON.parse(localStorage.getItem('matemagica-user-profile') || '{}');
        
        const newStudent = {
            id: studentId,
            name: studentData.name,
            nickname: studentData.nickname,
            birthdate: studentData.birthdate,
            gender: studentData.gender,

            region_chile: studentData.region,
            comuna_chile: studentData.city,

            interests: studentData.interests || [],
            materia_favorita: studentData.favoriteSubject,

            curso_actual: studentData.academic?.grade || null,
            nombre_colegio: studentData.academic?.school || null,

            descripcion_personalizada: studentData.description,

            mathLevel: 1,
            avatar: studentData.avatar || (studentData.gender === 'femenino' ? '👧' : (studentData.gender === 'masculino' ? '👦' : '👤')),
            parentId: parentProfile.user_id || 'unknown',
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            stats: { totalExercises: 0, correctAnswers: 0, totalPoints: 0, streakDays: 0, averageAccuracy: 0 },

            tipo_perfil: 'student',
            perfil_completo: true,
            user_role: 'student'
        };
        
        this.state.students.push(newStudent);
        await this.saveToLocal();
        
        let supabaseSuccess = false;
        if (this.state.supabaseClient) {
            try {
                const savedSupabaseStudent = await this.saveToSupabase(newStudent);
                if (savedSupabaseStudent) {
                    console.log('✅ Estudiante guardado/actualizado en Supabase:', savedSupabaseStudent);
                    supabaseSuccess = true;
                }
            } catch (error) {
                // El error ya se loguea dentro de saveToSupabase
            }
        }
        
        if (this.state.students.length === 1 && !this.state.currentStudent) {
            await this.selectStudent(newStudent.id);
        }
        
        // this.updateUI(); // Comentado/Eliminado
        
        console.log(`🧑‍🎓 Perfil local para ${newStudent.name} creado/actualizado. Supabase sync: ${supabaseSuccess}`);
        return newStudent;
    }
    
    // ✅ SELECCIONAR ESTUDIANTE
    async selectStudent(studentId) {
        const student = this.state.students.find(s => s.id === studentId);
        if (!student) throw new Error('Estudiante no encontrado');
        
        this.state.currentStudent = student;
        localStorage.setItem('matemagica_current_student_id', studentId);
        
        return student;
    }
    
    // ✅ ACTUALIZAR ESTUDIANTE
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
        
        return updatedStudent;
    }
    
    // ✅ ELIMINAR ESTUDIANTE
    async deleteStudent(studentId) {
        const studentIndex = this.state.students.findIndex(s => s.id === studentId);
        if (studentIndex === -1) throw new Error('Estudiante no encontrado');
        
        const deletedStudent = this.state.students[studentIndex];
        this.state.students.splice(studentIndex, 1);
        
        // Si era el estudiante actual, seleccionar otro
        if (this.state.currentStudent?.id === studentId) {
            if (this.state.students.length > 0) {
                await this.selectStudent(this.state.students[0].id);
            } else {
                this.state.currentStudent = null;
                localStorage.removeItem('matemagica_current_student_id');
            }
        }
        
        await this.saveToLocal();
        
        // Eliminar de Supabase si está disponible
        if (this.state.supabaseClient) {
            try {
                const { error } = await this.state.supabaseClient
                    .from('math_profiles')
                    .delete()
                    .eq('user_id', studentId);
                
                if (error) {
                    console.error('❌ Error eliminando de Supabase:', error);
                }
            } catch (error) {
                console.error('❌ Error en eliminación de Supabase:', error);
            }
        }
        
        return deletedStudent;
    }
    
    // ✅ GUARDAR EN SUPABASE
    async saveToSupabase(student) { // student es el objeto newStudent de createStudent
        try {
            if (!this.state.supabaseClient) {
                console.warn('Supabase client no disponible, no se puede guardar en Supabase.');
                return null; // Devolver null si no se pudo guardar
            }
            
            console.log('💾 Intentando guardar/actualizar estudiante en Supabase:', student.name);

            const supabaseRecord = {
                user_id: student.id, // PK
                parent_id: student.parentId,

                nombre_completo: student.name,
                full_name: student.name,
                nickname: student.nickname,
                fecha_nacimiento: student.birthdate,
                genero: student.gender,

                region_chile: student.region_chile,
                comuna_chile: student.comuna_chile,

                intereses: student.intereses,
                materia_favorita: student.materia_favorita,

                curso_actual: student.curso_actual,
                nombre_colegio: student.nombre_colegio,

                descripcion_personalizada: student.descripcion_personalizada,

                tipo_perfil: 'student',
                user_role: 'student',
                perfil_completo: student.perfil_completo !== undefined ? student.perfil_completo : true,

                email: student.email || null,
                avatar_url: student.avatar,

                created_at: student.createdAt || new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_active: true
            };

            // Limpiar campos undefined para evitar problemas con Supabase
            for (const key in supabaseRecord) {
                if (supabaseRecord[key] === undefined) {
                    supabaseRecord[key] = null;
                }
            }
            
            console.log('📨 Objeto a enviar a Supabase:', supabaseRecord);

            const { data, error } = await this.state.supabaseClient
                .from('math_profiles') // Nombre de la tabla
                .upsert(supabaseRecord, { onConflict: 'user_id' })
                .select()
                .single();
            
            if (error) {
                console.error('❌ Error guardando en Supabase:', error);
                throw error;
            }
            
            console.log('✅ Estudiante guardado/actualizado en SupABASE y devuelto:', data);
            return data;
            
        } catch (error) {
            console.error('❌ Error interno en saveToSupabase:', error);
            // this.updateUI(); // ESTA ES LA LÍNEA PROBLEMÁTICA ORIGINAL, la comentamos/eliminamos
            throw error;
        }
    }
    
    // ✅ GUARDAR EN LOCAL
    async saveToLocal() {
        try {
            localStorage.setItem('matemagica_student_profiles', JSON.stringify(this.state.students));
            return true;
        } catch (error) {
            console.error('❌ Error guardando en localStorage:', error);
            return false;
        }
    }
    
    // ✅ ACTUALIZAR ESTADÍSTICAS
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
            
            if (this.state.currentStudent?.id === studentId) {
                this.state.currentStudent = student;
            }
            
            return true;
        } catch (error) {
            console.error('❌ Error actualizando estadísticas:', error);
            return false;
        }
    }
    
    // ✅ API PÚBLICA
    getAllStudents() { return [...this.state.students]; }
    getCurrentStudent() { return this.state.currentStudent; }
    getStudentCount() { return this.state.students.length; }
    isInitialized() { return this.state.isInitialized; }
    getStudentById(studentId) { return this.state.students.find(s => s.id === studentId); }
    hasSupabaseConnection() { return !!this.state.supabaseClient; }
    
    // ✅ DIAGNÓSTICO
    async diagnoseConnection() {
        console.log('🔬 === DIAGNÓSTICO DEL CORE ===');
        console.log('Estado:', {
            inicializado: this.state.isInitialized,
            estudiantes: this.state.students.length,
            estudianteActual: this.state.currentStudent?.name || 'Ninguno',
            supabase: !!this.state.supabaseClient,
            autenticado: !!this.state.isAuthenticated
        });
        
        if (this.state.supabaseClient) {
            try {
                const { data, error } = await this.state.supabaseClient
                    .from('math_profiles')
                    .select('count', { count: 'exact', head: true });
                
                console.log('Conexión Supabase:', error ? '❌ Error' : '✅ Activa');
            } catch (testError) {
                console.log('Conexión Supabase: ❌ Error en test');
            }
        }
        
        console.log('🔬 === FIN DIAGNÓSTICO ===');
    }
}

// ✅ INICIALIZACIÓN GLOBAL
if (typeof window !== 'undefined') {
    if (!window.studentCore) {
        window.studentCore = new StudentManagementCore();
        console.log('✅ Core de estudiantes disponible globalmente');
    }
}

// ✅ EXPORTAR PARA MÓDULOS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StudentManagementCore;
}

console.log('✅ Core de Gestión de Estudiantes cargado');