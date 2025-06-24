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
                // .not('user_id', 'is', null) // Eliminado para cargar estudiantes aunque user_id sea null
                .order('created_at', { ascending: true });
            
            if (error) {
                console.error('❌ Error consultando Supabase:', error);
                return null;
            }
            
            // Convertir formato
            return data.map(student => ({
                id: student.id, // Usar la PK de la tabla math_profiles como el ID en el frontend
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
        // El studentId local ya no se usará como el ID principal persistente en el frontend.
        // Se usará el ID de la base de datos (PK de Supabase) una vez obtenido.
        const parentProfile = JSON.parse(localStorage.getItem('matemagica-user-profile') || '{}');
        
        // Objeto inicial con datos del formulario.
        // El ID final (PK de Supabase) se asignará después del guardado.
        let studentProfileForSave = {
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
            // Campos por defecto o calculados que saveToSupabase espera para construir el supabaseRecord
            avatar: studentData.avatar || (studentData.gender === 'femenino' ? '👧' : (studentData.gender === 'masculino' ? '👦' : '👤')),
            parentId: parentProfile.user_id || 'unknown',
            mathLevel: 1, // Podría venir de studentData si el formulario lo incluye
            stats: { totalExercises: 0, correctAnswers: 0, totalPoints: 0, streakDays: 0, averageAccuracy: 0 },
            tipo_perfil: 'student',
            perfil_completo: true,
            user_role: 'student',
            // createdAt y lastActivity se manejarán en el objeto final para el estado local
        };
        
        let finalStudentObject = { ...studentProfileForSave }; // Clonar para el estado local
        finalStudentObject.createdAt = new Date().toISOString();
        finalStudentObject.lastActivity = new Date().toISOString();

        let supabaseResult = null;
        if (this.state.supabaseClient) {
            try {
                supabaseResult = await this.saveToSupabase(studentProfileForSave, false); // Pasa el perfil preparado
                if (supabaseResult && supabaseResult.id) {
                    console.log('✅ Estudiante guardado en Supabase con ID de BD:', supabaseResult.id);
                    // Usar el ID de Supabase como el ID principal del estudiante en el frontend
                    finalStudentObject.id = supabaseResult.id;
                    // Actualizar el objeto local con cualquier dato que Supabase haya devuelto/modificado
                    finalStudentObject.name = supabaseResult.full_name || finalStudentObject.name;
                    finalStudentObject.nickname = supabaseResult.nickname || finalStudentObject.nickname;
                    finalStudentObject.birthdate = supabaseResult.fecha_nacimiento || finalStudentObject.birthdate;
                    finalStudentObject.gender = supabaseResult.genero || finalStudentObject.gender;
                    finalStudentObject.avatar = supabaseResult.avatar_url || finalStudentObject.avatar;
                    finalStudentObject.parentId = supabaseResult.parent_id || finalStudentObject.parentId;
                    finalStudentObject.createdAt = supabaseResult.created_at || finalStudentObject.createdAt;
                    finalStudentObject.lastActivity = supabaseResult.updated_at || finalStudentObject.lastActivity;
                    // Aquí se podrían mapear más campos si es necesario desde supabaseResult
                } else {
                     console.warn('⚠️ Estudiante no se guardó correctamente en Supabase o no se retornó ID. Usando ID local temporal.');
                     finalStudentObject.id = `student_local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                }
            } catch (error) {
                console.error('❌ Error al intentar guardar nuevo estudiante en Supabase:', error);
                finalStudentObject.id = `student_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            }
        } else {
            // Modo offline o Supabase no disponible
            console.log('🔌 Modo offline: generando ID local para nuevo estudiante.');
            finalStudentObject.id = `student_offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        
        this.state.students.push(finalStudentObject);
        await this.saveToLocal();

        // Seleccionar el nuevo estudiante si es el primero o si se guardó en Supabase
        if (finalStudentObject.id && (this.state.students.length === 1 || (supabaseResult && supabaseResult.id))) {
            await this.selectStudent(finalStudentObject.id);
        }
        
        console.log(`🧑‍🎓 Perfil para ${finalStudentObject.name} creado con ID: ${finalStudentObject.id}. Supabase sync: ${!!(supabaseResult && supabaseResult.id)}`);
        return finalStudentObject;
    }
    
    // ✅ SELECCIONAR ESTUDIANTE
    async selectStudent(studentFrontendId) { // studentFrontendId es el student_...
        const student = this.state.students.find(s => s.id === studentFrontendId);
        if (!student) {
            console.error(`Estudiante no encontrado con ID de frontend: ${studentFrontendId}`);
            // throw new Error('Estudiante no encontrado');
            return null;
        }
        
        this.state.currentStudent = student;
        localStorage.setItem('matemagica_current_student_id', studentFrontendId);
        console.log(`✅ Estudiante actual seleccionado (frontend ID ${studentFrontendId}):`, student.name);
        return student;
    }
    
    // ✅ ACTUALIZAR ESTUDIANTE
    async updateStudent(studentFrontendId, newData) { // studentFrontendId es el student_...
        const studentIndex = this.state.students.findIndex(s => s.id === studentFrontendId);
        if (studentIndex === -1) throw new Error(`Estudiante no encontrado para actualizar con ID de frontend: ${studentFrontendId}`);
        
        // Conservar el db_id si existe, es crucial para la actualización en Supabase
        const currentDbId = this.state.students[studentIndex].db_id;

        const updatedStudentLocal = {
            ...this.state.students[studentIndex],
            ...newData,
            lastActivity: new Date().toISOString(),
            db_id: currentDbId // Asegurarse de que db_id se mantiene
        };
        
        this.state.students[studentIndex] = updatedStudentLocal;
        
        if (this.state.currentStudent?.id === studentFrontendId) {
            this.state.currentStudent = updatedStudentLocal;
        }
        
        await this.saveToLocal(); // Guardar la versión local actualizada
        
        let supabaseSuccess = false;
        if (this.state.supabaseClient && updatedStudentLocal.db_id) {
            try {
                // Pasar el objeto local completo y el db_id para la actualización
                await this.saveToSupabase(updatedStudentLocal, true, updatedStudentLocal.db_id);
                supabaseSuccess = true;
            } catch (error) {
                 console.error('❌ Error al intentar actualizar estudiante en Supabase:', error);
            }
        } else if (!updatedStudentLocal.db_id) {
            console.warn(`⚠️ No se puede actualizar estudiante ${studentFrontendId} en Supabase: falta db_id.`);
        }
        
        console.log(`🧑‍🎓 Perfil local para ${updatedStudentLocal.name} actualizado. Supabase sync: ${supabaseSuccess}`);
        return updatedStudentLocal;
    }
    
    // ✅ ELIMINAR ESTUDIANTE
    async deleteStudent(studentFrontendId) { // studentFrontendId es el student_...
        const studentIndex = this.state.students.findIndex(s => s.id === studentFrontendId);
        if (studentIndex === -1) throw new Error(`Estudiante no encontrado para eliminar con ID de frontend: ${studentFrontendId}`);
        
        const deletedStudentLocal = this.state.students[studentIndex];
        this.state.students.splice(studentIndex, 1);
        
        if (this.state.currentStudent?.id === studentFrontendId) {
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
                    .eq('id', studentId); // Usar 'id' (PK de la tabla) para la eliminación
                
                if (error) {
                    console.error('❌ Error eliminando de Supabase:', error);
                    // Podríamos decidir si relanzar el error o solo loguearlo
                    // Por ahora, solo se loguea. El estudiante ya fue eliminado localmente.
                } else {
                    console.log(`✅ Estudiante con ID ${studentId} eliminado de Supabase.`);
                }
            } catch (error) {
                console.error('❌ Error en el proceso de eliminación de Supabase:', error);
            }
        }
        
        // deletedStudentLocal es el objeto que se eliminó del array local
        console.log(`🗑️ Estudiante ${deletedStudentLocal.name} (ID: ${studentId}) eliminado localmente.`);
        return deletedStudentLocal;
    }
    
    // ✅ GUARDAR EN SUPABASE
    async saveToSupabase(studentProfileData, isUpdate = false, profileDbId = null) {
        try {
            if (!this.state.supabaseClient) {
                console.warn('Supabase client no disponible, no se puede guardar en Supabase.');
                return null;
            }
            
            console.log(`💾 Intentando ${isUpdate ? 'actualizar' : 'guardar'} perfil de estudiante en Supabase:`, studentProfileData.name);

            // Mapeo de studentProfileData (viene de createStudent o updateStudent) a supabaseRecord
            const supabaseRecord = {
                // id: se maneja por Supabase (PK auto-generada en insert, o se usa profileDbId para update)
                parent_id: studentProfileData.parentId, // UUID del padre autenticado
                user_id: null, // Para perfiles de estudiantes, user_id (Auth UUID) es usualmente null o no se gestiona aquí.
                               // Si los estudiantes tuvieran sus propios logins, aquí iría su Auth UUID.
                               // NO COLOCAR el student.id (student_...) aquí.

                nombre_completo: studentProfileData.name,
                full_name: studentProfileData.name, // Asegurar que esta columna NOT NULL se llene
                nickname: studentProfileData.nickname,
                email: studentProfileData.email || null, // Si los estudiantes tienen email

                user_role: 'student', // o tipo_perfil: 'student'
                tipo_perfil: 'student',

                avatar_url: studentProfileData.avatar,
                fecha_nacimiento: studentProfileData.birthdate,
                genero: studentProfileData.gender,

                region_chile: studentProfileData.region_chile,
                comuna_chile: studentProfileData.comuna_chile,

                intereses: studentProfileData.interests,
                materia_favorita: studentProfileData.materia_favorita,
                curso_actual: studentProfileData.curso_actual,
                nombre_colegio: studentProfileData.nombre_colegio,
                descripcion_personalizada: studentProfileData.descripcion_personalizada,

                perfil_completo: studentProfileData.perfil_completo !== undefined ? studentProfileData.perfil_completo : true,
                is_active: true, // Asumimos que un nuevo perfil o uno actualizado está activo

                // Campos de estadísticas y configuración podrían manejarse por separado o con valores por defecto
                // configuracion: studentProfileData.configuracion || '{}',
                // estadisticas: studentProfileData.stats || '{}', // Adaptar si stats tiene otra estructura

                // created_at y updated_at son manejados por Supabase o por defecto
                // created_at: isUpdate ? undefined : (studentProfileData.createdAt || new Date().toISOString()),
                updated_at: new Date().toISOString()
            };

            // Eliminar propiedades undefined para evitar errores con Supabase
            for (const key in supabaseRecord) {
                if (supabaseRecord[key] === undefined) {
                    delete supabaseRecord[key];
                }
            }
            
            console.log('📨 Objeto a enviar a Supabase:', supabaseRecord);

            let data, error;

            if (isUpdate) {
                if (!profileDbId) {
                    console.error('❌ Error: se requiere profileDbId para actualizar.');
                    throw new Error('profileDbId es requerido para actualizar un perfil de estudiante.');
                }
                // Para actualizar, usamos el 'id' (PK de la tabla math_profiles) del estudiante
                const response = await this.state.supabaseClient
                    .from('math_profiles')
                    .update(supabaseRecord)
                    .eq('id', profileDbId) // Usar el ID de la base de datos del perfil del estudiante
                    .select()
                    .single();
                data = response.data;
                error = response.error;

                if (error) {
                    console.error(`❌ Error actualizando en Supabase:`, error);
                    throw error;
                }
                console.log(`✅ Estudiante actualizado en Supabase y devuelto:`, data);
                return data;

            } else {
                // Para crear, es un insert simple. El 'id' (PK) se autogenerará.
                const insertResponse = await this.state.supabaseClient
                    .from('math_profiles')
                    .insert(supabaseRecord)
                    .select()
                    .single();

                data = insertResponse.data;
                error = insertResponse.error;

                if (error) {
                    console.error(`❌ Error insertando en Supabase:`, error);
                    throw error;
                }
                // Se elimina el bloque que intentaba actualizar user_id con data.id,
                // ya que causaba un error de FK. user_id se insertará como null
                // según la definición de supabaseRecord.
                console.log(`✅ Estudiante guardado en Supabase (solo inserción). Datos devueltos:`, data);
                return data;
            }
            
        } catch (error) {
            console.error(`❌ Error interno en saveToSupabase (${isUpdate ? 'update' : 'insert'}):`, error);
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