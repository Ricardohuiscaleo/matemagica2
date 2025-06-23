/**
 * 👥 SISTEMA DE GESTIÓN DE PERFILES - REFACTORIZADO POR ROLES
 * Matemágica PWA - Gestión especializada según parent/teacher
 * Versión limpia sin duplicaciones - Diciembre 2024
 */

// 🎯 CLASE BASE COMÚN
class BaseProfileManagement {
    constructor() {
        this.currentView = 'overview';
        this.currentStudent = null;
        this.currentUser = null;
        this.students = [];
        this.profesoresDisponibles = [];
        this.isInitialized = false;
        
        // Configuración común
        this.config = {
            id: 'student-profiles',
            title: '👥 Gestión de Perfiles',
            colors: {
                primary: '#8B5CF6',
                secondary: '#EC4899',
                success: '#10B981',
                warning: '#F59E0B',
                info: '#3B82F6'
            }
        };
    }

    // ✅ MÉTODOS COMUNES PARA AMBOS ROLES
    async init() {
        try {
            console.log('👥 Inicializando Sistema de Gestión de Perfiles...');
            await this.loadUserData();
            await this.loadStudentsData();
            this.isInitialized = true;
            console.log('✅ Sistema inicializado para rol:', this.getUserRole());
            return true;
        } catch (error) {
            console.error('❌ Error inicializando gestión de perfiles:', error);
            return false;
        }
    }

    async loadUserData() {
        try {
            const userProfile = localStorage.getItem('matemagica-user-profile');
            if (userProfile) {
                this.currentUser = JSON.parse(userProfile);
                console.log('✅ Usuario cargado:', this.currentUser.full_name, '- Rol:', this.currentUser.user_role);
            }
        } catch (error) {
            console.error('❌ Error cargando datos de usuario:', error);
        }
    }

    async loadStudentsData() {
        try {
            const userRole = this.getUserRole();
            const storageKey = userRole === 'teacher' ? 'profesorEstudiantes' : 'apoderadoEstudiantes';
            const studentsData = localStorage.getItem(storageKey);
            
            if (studentsData) {
                this.students = JSON.parse(studentsData).filter(s => s.activo !== false);
            } else {
                this.students = [];
            }
            
            console.log(`✅ ${this.students.length} estudiantes cargados para ${userRole}`);
        } catch (error) {
            console.error('❌ Error cargando estudiantes:', error);
            this.students = [];
        }
    }

    getUserRole() {
        return this.currentUser?.user_role || 'parent';
    }

    getCurrentUserName() {
        return this.currentUser?.full_name || 'Usuario';
    }

    // 📡 CARGAR PROFESORES DESDE SUPABASE - VERSIÓN MEJORADA SIN DUPLICADOS
    async loadTeachersFromSupabase() {
        try {
            console.log('📡 Cargando profesores desde Supabase para Matemágica PWA...');
            
            // ✅ Usar cliente global de student-management-core
            const supabaseClient = window.supabaseClient || window.studentManagementCore?.supabaseClient;
            
            if (!supabaseClient) {
                console.warn('⚠️ Cliente Supabase no disponible, modo offline activo');
                this.loadFallbackTeachers();
                return;
            }
            
            console.log('✅ Cliente Supabase conectado, consultando profesores...');
            
            // 🔍 Consulta optimizada con ordenamiento por fecha
            const { data: allTeachers, error } = await supabaseClient
                .from('math_profiles')
                .select(`
                    user_id,
                    full_name,
                    email,
                    contact_email,
                    user_role,
                    specialization,
                    skills,
                    rating,
                    total_reviews,
                    years_experience,
                    location,
                    bio,
                    rate_per_hour,
                    is_verified,
                    contact_phone,
                    created_at,
                    updated_at
                `)
                .eq('user_role', 'profesor')
                .eq('is_active', true)
                .order('updated_at', { ascending: false }); // Más recientes primero
            
            if (error) {
                console.error('❌ Error consultando profesores:', error);
                console.log('🔄 Activando modo offline con datos locales...');
                this.loadFallbackTeachers();
                return;
            }
            
            if (!allTeachers || allTeachers.length === 0) {
                console.log('📝 No hay profesores en la base de datos');
                console.log('🔄 Usando datos de ejemplo child-friendly...');
                this.loadFallbackTeachers();
                return;
            }
            
            console.log(`📊 Total profesores consultados: ${allTeachers.length}`);
            
            // 🧹 ELIMINAR DUPLICADOS - Conservar el más reciente por email
            const profesoresUnicos = this.removeDuplicateTeachers(allTeachers);
            console.log(`🔄 Después de eliminar duplicados: ${profesoresUnicos.length} profesores únicos`);
            
            // 🎯 Separar profesores reales de demos (usando email principal)
            const profesoresReales = profesoresUnicos.filter(t => 
                this.isRealTeacher(t.email)
            );
            
            const profesoresDemo = profesoresUnicos.filter(t => 
                !this.isRealTeacher(t.email)
            );
            
            console.log(`🔍 Análisis final: ${profesoresReales.length} reales, ${profesoresDemo.length} demo`);
            
            // 🎪 Estrategia inteligente para mostrar profesores
            let profesoresParaMostrar = this.selectTeachersToShow(profesoresReales, profesoresDemo);
            
            // Formatear datos para la interfaz
            this.profesoresDisponibles = profesoresParaMostrar.map(teacher => this.formatTeacherData(teacher));
            
            console.log(`🚀 ${this.profesoresDisponibles.length} profesores únicos listos para Matemágica PWA`);
            
            // 🎨 Actualizar interfaz si está activa
            this.updateSearchInterfaceWithRealData();
            
        } catch (error) {
            console.error('❌ Error cargando profesores:', error);
            console.log('🔄 Activando modo offline completo...');
            this.loadFallbackTeachers();
        }
    }

    // 🧹 MÉTODO PARA ELIMINAR DUPLICADOS
    removeDuplicateTeachers(teachers) {
        console.log('🧹 Eliminando profesores duplicados...');
        
        const uniqueTeachers = new Map();
        
        teachers.forEach(teacher => {
            const email = teacher.email;
            
            if (!uniqueTeachers.has(email)) {
                // Primera vez que vemos este email
                uniqueTeachers.set(email, teacher);
                console.log(`✅ Profesor único agregado: ${teacher.full_name} (${email})`);
            } else {
                // Email duplicado - conservar el más reciente
                const existing = uniqueTeachers.get(email);
                const existingDate = new Date(existing.updated_at || existing.created_at);
                const currentDate = new Date(teacher.updated_at || teacher.created_at);
                
                if (currentDate > existingDate) {
                    uniqueTeachers.set(email, teacher);
                    console.log(`🔄 Profesor actualizado (más reciente): ${teacher.full_name} (${email})`);
                } else {
                    console.log(`⏭️ Profesor duplicado ignorado: ${teacher.full_name} (${email})`);
                }
            }
        });
        
        return Array.from(uniqueTeachers.values());
    }

    // 🎯 MÉTODO PARA IDENTIFICAR PROFESORES REALES
    isRealTeacher(email) {
        if (!email) return false;
        
        // Dominios de email reales
        const realDomains = ['@gmail.com', '@hotmail.com', '@outlook.com', '@yahoo.com'];
        const hasRealDomain = realDomains.some(domain => email.includes(domain));
        
        // No contiene palabras de demo
        const notDemo = !email.includes('demo') && !email.includes('matemagica.cl');
        
        return hasRealDomain && notDemo;
    }

    // 🎪 MÉTODO PARA SELECCIONAR QUÉ PROFESORES MOSTRAR
    selectTeachersToShow(reales, demos) {
        console.log('🎪 Seleccionando profesores para mostrar...');
        
        let profesoresParaMostrar = [];
        
        if (reales.length >= 2) {
            // Caso ideal: Suficientes profesores reales
            profesoresParaMostrar = reales;
            console.log(`✅ Mostrando ${reales.length} profesores REALES únicos`);
        } else if (reales.length === 1) {
            // Un profesor real + demos limitados para demostración
            const demosLimitados = demos.slice(0, 2);
            profesoresParaMostrar = [...reales, ...demosLimitados];
            console.log(`🎭 Mostrando 1 profesor REAL + ${demosLimitados.length} demos`);
        } else if (reales.length === 0 && demos.length > 0) {
            // Solo demos disponibles (modo desarrollo)
            profesoresParaMostrar = demos.slice(0, 4); // Máximo 4 demos
            console.log(`🎪 Mostrando ${profesoresParaMostrar.length} profesores demo (desarrollo)`);
        } else {
            // No hay profesores en la BD
            console.log('🚫 No hay profesores disponibles, usando fallback');
            return [];
        }
        
        return profesoresParaMostrar;
    }

    // 🔄 FORMATEAR DATOS DE PROFESORES - MEJORADO CON VALIDACIONES
    formatTeacherData(teacher) {
        // Validar datos obligatorios
        if (!teacher.user_id || !teacher.full_name || !teacher.email) {
            console.warn('⚠️ Profesor con datos incompletos ignorado:', teacher);
            return null;
        }
        
        return {
            id: teacher.user_id,
            full_name: teacher.full_name,
            specialization: teacher.specialization || 'Profesional de la Educación',
            skills: Array.isArray(teacher.skills) ? teacher.skills : 
                   (teacher.skills && typeof teacher.skills === 'object' ? Object.keys(teacher.skills) : 
                   ['matematicas']),
            rating: Math.min(Math.max(teacher.rating || 4.0, 1.0), 5.0), // Entre 1 y 5
            total_reviews: Math.max(teacher.total_reviews || 0, 0),
            years_experience: Math.max(teacher.years_experience || 1, 1),
            location: {
                region: teacher.location?.region || 'metropolitana',
                comuna: teacher.location?.comuna || 'Sin especificar',
                online: teacher.location?.online !== false,
                presencial: teacher.location?.presencial !== false
            },
            bio: teacher.bio || 'Profesional comprometido con la educación matemática de calidad.',
            rate_per_hour: Math.max(teacher.rate_per_hour || 25000, 10000), // Mínimo $10.000
            is_verified: teacher.is_verified || false,
            contact_info: {
                email: teacher.contact_email || teacher.email,
                phone: teacher.contact_phone || 'Contactar por email'
            },
            created_at: teacher.created_at,
            isDemoData: !this.isRealTeacher(teacher.email)
        };
    }

    // 🔄 CARGAR DATOS DE EJEMPLO COMO FALLBACK
    loadFallbackTeachers() {
        console.log('🔄 Cargando profesores de ejemplo (fallback)...');
        
        this.profesoresDisponibles = [
            {
                id: 'demo-1',
                full_name: 'María González López',
                specialization: 'Psicóloga Infantil',
                skills: ['psicologia', 'necesidades_especiales'],
                rating: 4.8,
                total_reviews: 23,
                years_experience: 8,
                location: { region: 'metropolitana', comuna: 'Las Condes', online: true, presencial: true },
                bio: 'Especialista en dificultades de aprendizaje. Más de 8 años ayudando a niños.',
                rate_per_hour: 35000,
                is_verified: true,
                contact_info: { email: 'maria@ejemplo.com', phone: '+56 9 8765 4321' },
                isDemoData: true
            },
            {
                id: 'demo-2',
                full_name: 'Carlos Rodríguez Silva',
                specialization: 'Profesor de Matemáticas',
                skills: ['matematicas'],
                rating: 4.6,
                total_reviews: 18,
                years_experience: 5,
                location: { region: 'metropolitana', comuna: 'Providencia', online: true, presencial: false },
                bio: 'Profesor joven con metodologías innovadoras para hacer las matemáticas divertidas.',
                rate_per_hour: 28000,
                is_verified: true,
                contact_info: { email: 'carlos@ejemplo.com', phone: '+56 9 1234 5678' },
                isDemoData: true
            },
            {
                id: 'demo-3',
                full_name: 'Ana Morales Fernández',
                specialization: 'Fonoaudióloga',
                skills: ['fonoaudiologia', 'psicopedagogia'],
                rating: 4.9,
                total_reviews: 31,
                years_experience: 12,
                location: { region: 'valparaiso', comuna: 'Viña del Mar', online: true, presencial: true },
                bio: 'Fonoaudióloga con amplia experiencia en trastornos del lenguaje infantil.',
                rate_per_hour: 40000,
                is_verified: true,
                contact_info: { email: 'ana@ejemplo.com', phone: '+56 9 9876 5432' },
                isDemoData: true
            },
            {
                id: 'demo-4',
                full_name: 'Roberto Sánchez Torres',
                specialization: 'Psicopedagogo',
                skills: ['psicopedagogia', 'necesidades_especiales', 'matematicas'],
                rating: 4.7,
                total_reviews: 15,
                years_experience: 6,
                location: { region: 'biobio', comuna: 'Concepción', online: true, presencial: true },
                bio: 'Psicopedagogo especializado en dificultades específicas del aprendizaje matemático.',
                rate_per_hour: 32000,
                is_verified: true,
                contact_info: { email: 'roberto@ejemplo.com', phone: '+56 9 5555 4444' },
                isDemoData: true
            }
        ];
        
        console.log(`📋 ${this.profesoresDisponibles.length} profesores de ejemplo cargados`);
    }

    // 🎨 MÉTODOS DE RENDERIZADO ESPECÍFICOS PARA PROFESORES
    async renderFullSection() {
        const userRole = this.getUserRole();
        
        if (userRole === 'teacher') {
            console.log('👩‍🏫 Renderizando sección para PROFESORES');
            await this.renderTeacherSection();
        } else {
            console.log('👨‍👩‍👧‍👦 Renderizando sección para APODERADOS');
            await this.renderParentSection();
        }
    }

    async renderTeacherSection() {
        if (!this.isInitialized) await this.init();
        
        const mainContent = document.querySelector('main.flex-1');
        if (!mainContent) return;
        
        mainContent.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
                <div class="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-blue-200">
                    <div class="flex justify-between items-center">
                        <button onclick="studentProfileManagement.goBackToDashboard()" 
                                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors">
                            <i class="fas fa-arrow-left mr-2"></i>Volver al Dashboard
                        </button>
                        <div class="text-center">
                            <h1 class="text-3xl font-bold text-gray-800">👩‍🏫 Gestión de Estudiantes</h1>
                            <p class="text-gray-600">Panel de Profesor/a</p>
                        </div>
                        <div class="text-right">
                            <div class="text-sm text-gray-600">Profesor/a</div>
                            <div class="text-blue-600 font-bold">${this.getCurrentUserName()}</div>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-xl shadow-lg mb-6 border-2 border-gray-200">
                    <div class="flex border-b border-gray-200">
                        <button onclick="studentProfileManagement.switchView('overview')" 
                                id="tab-overview"
                                class="px-6 py-4 text-sm font-medium border-b-2 transition-colors">
                            <i class="fas fa-users mr-2"></i>Mis Estudiantes
                        </button>
                        <button onclick="studentProfileManagement.switchView('classroom')" 
                                id="tab-classroom"
                                class="px-6 py-4 text-sm font-medium border-b-2 transition-colors">
                            <i class="fas fa-chalkboard mr-2"></i>Gestión de Clases
                        </button>
                        <button onclick="studentProfileManagement.switchView('analytics')" 
                                id="tab-analytics"
                                class="px-6 py-4 text-sm font-medium border-b-2 transition-colors">
                            <i class="fas fa-chart-bar mr-2"></i>Reportes
                        </button>
                    </div>
                </div>

                <div id="profile-main-content">
                    ${this.renderTeacherOverview()}
                </div>
            </div>
        `;
        
        this.updateTabNavigation();
    }

    async renderParentSection() {
        if (!this.isInitialized) await this.init();
        
        const mainContent = document.querySelector('main.flex-1');
        if (!mainContent) return;
        
        mainContent.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-4">
                <div class="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-pink-200">
                    <div class="flex justify-between items-center">
                        <button onclick="studentProfileManagement.goBackToDashboard()" 
                                class="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors">
                            <i class="fas fa-arrow-left mr-2"></i>Volver al Dashboard
                        </button>
                        <div class="text-center">
                            <h1 class="text-3xl font-bold text-gray-800">👨‍👩‍👧‍👦 Perfil de mi Hijo/a</h1>
                            <p class="text-gray-600">Configuración Familiar</p>
                        </div>
                        <div class="text-right">
                            <div class="text-sm text-gray-600">Apoderado/a</div>
                            <div class="text-pink-600 font-bold">${this.getCurrentUserName()}</div>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-lg mb-6 border-2 border-gray-200">
                    <div class="flex border-b border-gray-200">
                        <button onclick="studentProfileManagement.switchView('create-profile')" 
                                id="tab-create-profile"
                                class="px-6 py-4 text-sm font-medium border-b-2 transition-colors">
                            <i class="fas fa-child mr-2"></i>Datos Personales
                        </button>
                        <button onclick="studentProfileManagement.switchView('assign-teachers')" 
                                id="tab-assign-teachers"
                                class="px-6 py-4 text-sm font-medium border-b-2 transition-colors">
                            <i class="fas fa-user-tie mr-2"></i>Asignar Profesores
                        </button>
                    </div>
                </div>

                <div id="profile-main-content">
                    ${this.renderCreateProfileView()}
                </div>
            </div>
        `;
        
        this.updateTabNavigation();
    }

    renderCreateProfileView() {
        return `
            <div class="bg-white rounded-xl shadow-lg p-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <i class="fas fa-child mr-2 text-pink-600"></i>Crear Perfil de mi Hijo/a
                </h2>
                
                <form id="student-profile-form" class="space-y-6">
                    <!-- Datos Básicos -->
                    <div class="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6 border-2 border-pink-200">
                        <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-user mr-2"></i>Información Personal
                        </h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    <i class="fas fa-signature mr-1"></i>Nombre completo
                                </label>
                                <input type="text" id="student-name" required
                                       class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                                       placeholder="Ej: Gabriela Martínez Rodríguez">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    <i class="fas fa-heart mr-1"></i>¿Cómo le dices cariñosamente?
                                </label>
                                <input type="text" id="student-nickname" required
                                       class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                                       placeholder="Ej: Gaby, Gabu, Gabrielita">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    <i class="fas fa-birthday-cake mr-1"></i>Fecha de nacimiento
                                </label>
                                <input type="date" id="student-birthdate" required
                                       class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    <i class="fas fa-venus-mars mr-1"></i>Género
                                </label>
                                <select id="student-gender" required
                                        class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                                    <option value="">Seleccionar</option>
                                    <option value="femenino">👧 Femenino</option>
                                    <option value="masculino">👦 Masculino</option>
                                    <option value="otro">🌈 Otro</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Gustos e Intereses -->
                    <div class="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 border-2 border-blue-200">
                        <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-star mr-2"></i>Gustos e Intereses
                        </h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    <i class="fas fa-gamepad mr-1"></i>¿Qué le gusta hacer?
                                </label>
                                <div class="flex flex-wrap gap-2">
                                    <label class="inline-flex items-center bg-white px-3 py-2 rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-colors">
                                        <input type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 interest-checkbox mr-2" value="videojuegos">
                                        <span class="text-sm">🎮 Videojuegos</span>
                                    </label>
                                    <label class="inline-flex items-center bg-white px-3 py-2 rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-colors">
                                        <input type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 interest-checkbox mr-2" value="deportes">
                                        <span class="text-sm">⚽ Deportes</span>
                                    </label>
                                    <label class="inline-flex items-center bg-white px-3 py-2 rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-colors">
                                        <input type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 interest-checkbox mr-2" value="musica">
                                        <span class="text-sm">🎵 Música</span>
                                    </label>
                                    <label class="inline-flex items-center bg-white px-3 py-2 rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-colors">
                                        <input type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 interest-checkbox mr-2" value="arte">
                                        <span class="text-sm">🎨 Arte</span>
                                    </label>
                                    <label class="inline-flex items-center bg-white px-3 py-2 rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-colors">
                                        <input type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 interest-checkbox mr-2" value="lectura">
                                        <span class="text-sm">📚 Lectura</span>
                                    </label>
                                    <label class="inline-flex items-center bg-white px-3 py-2 rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-colors">
                                        <input type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 interest-checkbox mr-2" value="ciencias">
                                        <span class="text-sm">🔬 Ciencias</span>
                                    </label>
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    <i class="fas fa-heart mr-1"></i>¿Cuál es su materia favorita?
                                </label>
                                <select id="favorite-subject"
                                        class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="">Seleccionar</option>
                                    <option value="matematicas">📐 Matemáticas</option>
                                    <option value="lenguaje">📝 Lenguaje</option>
                                    <option value="ciencias">🔬 Ciencias</option>
                                    <option value="historia">📚 Historia</option>
                                    <option value="arte">🎨 Arte</option>
                                    <option value="educacion_fisica">⚽ Educación Física</option>
                                    <option value="musica">🎵 Música</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- 🇨🇱 UBICACIÓN CON TODAS LAS REGIONES Y COMUNAS DE CHILE -->
                    <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-200">
                        <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-map-marker-alt mr-2"></i>🇨🇱 Ubicación en Chile
                        </h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    <i class="fas fa-flag mr-1"></i>Región
                                </label>
                                <select id="student-region" required
                                        class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500">
                                    <option value="">Seleccionar región</option>
                                    <!-- Se llenarán automáticamente con JavaScript -->
                                </select>
                                <p class="text-xs text-gray-500 mt-1">
                                    <i class="fas fa-info-circle mr-1"></i>Selecciona tu región para ver las comunas disponibles
                                </p>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    <i class="fas fa-city mr-1"></i>Comuna
                                </label>
                                <select id="student-comuna" required disabled
                                        class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed">
                                    <option value="">Primero selecciona una región</option>
                                </select>
                                <p class="text-xs text-gray-500 mt-1">
                                    <i class="fas fa-map-pin mr-1"></i>Tu comuna se mostrará después de seleccionar la región
                                </p>
                            </div>
                        </div>

                        <!-- 📍 INFORMACIÓN ADICIONAL DE UBICACIÓN -->
                        <div class="mt-4 p-4 bg-white rounded-lg border border-green-200">
                            <h4 class="text-sm font-semibold text-green-800 mb-2">
                                <i class="fas fa-lightbulb mr-1"></i>¿Por qué necesitamos esta información?
                            </h4>
                            <ul class="text-xs text-green-700 space-y-1">
                                <li>• Para conectarte con profesores locales de tu región</li>
                                <li>• Para actividades presenciales en tu comuna</li>
                                <li>• Para estadísticas educativas regionales</li>
                                <li>• Para personalizar contenido según tu ubicación</li>
                            </ul>
                        </div>
                    </div>

                    <!-- Cuéntame más -->
                    <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border-2 border-purple-200">
                        <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-comments mr-2"></i>Cuéntame más sobre tu hijo/a
                        </h3>
                        
                        <textarea id="student-description" rows="4"
                                  class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                  placeholder="Cuéntanos sobre su personalidad, qué lo motiva, sus fortalezas, desafíos, o cualquier información que nos ayude a conocerlo mejor..."></textarea>
                        
                        <p class="text-sm text-gray-600 mt-2">
                            <i class="fas fa-robot mr-1"></i>Esta información ayudará a la IA a personalizar las actividades y ejercicios para tu hijo/a
                        </p>
                    </div>

                    <!-- Botón Guardar -->
                    <div class="text-center">
                        <button type="submit" 
                                class="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-4 px-8 rounded-lg font-bold text-lg transition-all transform hover:scale-105">
                            <i class="fas fa-save mr-2"></i>Guardar Perfil
                        </button>
                    </div>
                </form>
            </div>
        `;
    }

    renderAssignTeachersView() {
        return `
            <div class="bg-white rounded-xl shadow-lg p-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <i class="fas fa-user-tie mr-2 text-blue-600"></i>Asignar Profesores para Seguimiento
                </h2>
                
                <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6 border-2 border-blue-200">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        <!-- Datos Académicos -->
                        <div class="space-y-4">
                            <h3 class="text-lg font-bold text-gray-800 flex items-center">
                                <i class="fas fa-school mr-2"></i>Datos Académicos
                            </h3>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Curso</label>
                                <select id="student-grade" required
                                        class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Seleccionar curso</option>
                                    <option value="1-basico">1° Básico</option>
                                    <option value="2-basico">2° Básico</option>
                                    <option value="3-basico">3° Básico</option>
                                    <option value="4-basico">4° Básico</option>
                                    <option value="5-basico">5° Básico</option>
                                    <option value="6-basico">6° Básico</option>
                                    <option value="7-basico">7° Básico</option>
                                    <option value="8-basico">8° Básico</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Colegio</label>
                                <input type="text" id="student-school"
                                       class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                       placeholder="Nombre del colegio">
                            </div>
                        </div>

                        <!-- Búsqueda de Profesores -->
                        <div class="space-y-4">
                            <h3 class="text-lg font-bold text-gray-800 flex items-center">
                                <i class="fas fa-search mr-2"></i>Buscar Profesores
                            </h3>
                            
                            <div class="bg-white rounded-lg p-4 border-2 border-gray-200">
                                <p class="text-sm text-gray-600 mb-4">
                                    <i class="fas fa-info-circle mr-1 text-blue-500"></i>
                                    Encuentra todos los profesionales disponibles para el seguimiento académico de tu hijo/a
                                </p>
                                
                                <button id="search-professionals-btn" class="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-bold transition-all">
                                    <i class="fas fa-search mr-2"></i>Ver Todos los Profesionales
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Resultados de Búsqueda -->
                <div id="professionals-results" class="space-y-6">
                    <div class="text-center py-12">
                        <div class="text-gray-400 text-6xl mb-4">👩‍🏫</div>
                        <h3 class="text-xl font-medium text-gray-600 mb-2">Descubre nuestros profesionales</h3>
                        <p class="text-gray-500">Haz clic en "Ver Todos los Profesionales" para explorar nuestro equipo especializado</p>
                    </div>
                </div>

                <!-- Profesores Asignados -->
                <div id="assigned-teachers-section" class="mt-8" style="display: none;">
                    <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-200">
                        <h3 class="text-lg font-bold text-green-800 mb-4 flex items-center">
                            <i class="fas fa-check-circle mr-2"></i>Profesores Asignados
                        </h3>
                        <div id="assigned-teachers-list" class="space-y-3"></div>
                        
                        <div class="mt-6 text-center">
                            <button id="send-profile-btn" class="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-6 rounded-lg font-bold transition-all">
                                <i class="fas fa-paper-plane mr-2"></i>Enviar Perfil y Estadísticas
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async renderTeacherOverview() {
        if (this.students.length === 0) {
            return `
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <div class="text-center py-12">
                        <div class="text-6xl mb-4">👥</div>
                        <h3 class="text-xl font-bold text-gray-700 mb-2">No tienes estudiantes asignados</h3>
                        <p class="text-gray-500 mb-6">Los apoderados pueden enviarte perfiles de sus hijos para seguimiento académico</p>
                        <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                            <h4 class="font-bold text-blue-800 mb-2">¿Cómo recibir estudiantes?</h4>
                            <ul class="text-left text-blue-700 space-y-1">
                                <li>📧 Los apoderados te asignarán desde su panel familiar</li>
                                <li>📊 Recibirás automáticamente sus perfiles y estadísticas</li>
                                <li>🎯 Podrás crear planes de estudio personalizados</li>
                            </ul>
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="bg-white rounded-xl shadow-lg p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-users mr-2"></i>Mis Estudiantes (${this.students.length})
                    </h2>
                    <button onclick="studentProfileManagement.refreshStudentsList()" 
                            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                        <i class="fas fa-sync-alt mr-2"></i>Actualizar
                    </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${this.students.map(student => this.renderStudentCard(student)).join('')}
                </div>
                
                <div class="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border-2 border-green-200">
                    <h3 class="text-lg font-bold text-green-800 mb-4 flex items-center">
                        <i class="fas fa-lightbulb mr-2"></i>Próximas Funcionalidades
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="bg-white rounded-lg p-4 border border-green-200">
                            <h4 class="font-bold text-gray-800 mb-2">📊 Reportes Automáticos</h4>
                            <p class="text-sm text-gray-600">Estadísticas detalladas de progreso enviadas semanalmente</p>
                        </div>
                        <div class="bg-white rounded-lg p-4 border border-green-200">
                            <h4 class="font-bold text-gray-800 mb-2">💬 Comunicación Directa</h4>
                            <p class="text-sm text-gray-600">Chat integrado con los apoderados</p>
                        </div>
                        <div class="bg-white rounded-lg p-4 border border-green-200">
                            <h4 class="font-bold text-gray-800 mb-2">🎯 Planes Personalizados</h4>
                            <p class="text-sm text-gray-600">Curriculo adaptado por IA según el perfil</p>
                        </div>
                        <div class="bg-white rounded-lg p-4 border border-green-200">
                            <h4 class="font-bold text-gray-808 mb-2">📈 Analytics Avanzados</h4>
                            <p class="text-sm text-gray-600">Métricas de aprendizaje en tiempo real</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderStudentCard(student) {
        const age = this.calculateAge(student.birthdate);
        const interestsText = student.interests ? student.interests.join(', ') : 'No especificado';
        
        return `
            <div class="bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-200 p-6 hover:border-blue-300 transition-colors">
                <div class="flex items-center mb-4">
                    <div class="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4">
                        ${student.gender === 'femenino' ? '👧' : student.gender === 'masculino' ? '👦' : '👤'}
                    </div>
                    <div class="flex-1">
                        <h3 class="font-bold text-gray-800">${student.name}</h3>
                        <p class="text-sm text-gray-600">
                            "${student.nickname}" • ${age} años
                        </p>
                        <p class="text-xs text-gray-500">
                            ${student.academic?.grade || 'Curso no especificado'}
                        </p>
                    </div>
                </div>
                
                <div class="space-y-3">
                    <div class="bg-blue-50 rounded-lg p-3">
                        <h4 class="font-medium text-blue-800 text-sm mb-1">📍 Ubicación</h4>
                        <p class="text-xs text-blue-600">${student.city}, ${student.region}</p>
                    </div>
                    
                    <div class="bg-green-50 rounded-lg p-3">
                        <h4 class="font-medium text-green-800 text-sm mb-1">🎯 Materia Favorita</h4>
                        <p class="text-xs text-green-600">${student.favoriteSubject || 'No especificado'}</p>
                    </div>
                    
                    <div class="bg-purple-50 rounded-lg p-3">
                        <h4 class="font-medium text-purple-800 text-sm mb-1">⭐ Intereses</h4>
                        <p class="text-xs text-purple-600 line-clamp-2">${interestsText}</p>
                    </div>
                    
                    ${student.description ? `
                        <div class="bg-gray-50 rounded-lg p-3">
                            <h4 class="font-medium text-gray-800 text-sm mb-1">💭 Descripción</h4>
                            <p class="text-xs text-gray-600 line-clamp-3">${student.description}</p>
                        </div>
                    ` : ''}
                </div>
                
                <div class="mt-4 pt-4 border-t border-gray-200">
                    <div class="flex justify-between items-center">
                        <div class="text-xs text-gray-500">
                            Asignado: ${new Date(student.assignedAt || student.createdAt).toLocaleDateString()}
                        </div>
                        <button onclick="studentProfileManagement.showStudentDetail('${student.id}')" 
                                class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition-colors">
                            Ver Detalle
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    calculateAge(birthdate) {
        if (!birthdate) return 'N/A';
        
        const today = new Date();
        const birth = new Date(birthdate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    }

    refreshStudentsList() {
        console.log('🔄 Actualizando lista de estudiantes...');
        this.loadStudentsData().then(() => {
            if (this.currentView === 'overview') {
                this.switchView('overview');
            }
            this.showNotification('✅ Lista actualizada', 'success');
        });
    }

    // 🎡 MÉTODOS DE INTERFAZ Y NAVEGACIÓN
    switchView(view) {
        console.log(`🔄 Cambiando a vista: ${view}`);
        this.currentView = view;
        
        const content = document.getElementById('profile-main-content');
        if (!content) return;
        
        switch (view) {
            case 'overview':
                content.innerHTML = this.getUserRole() === 'teacher' ? 
                    this.renderTeacherOverview() : this.renderCreateProfileView();
                break;
            case 'create-profile':
                content.innerHTML = this.renderCreateProfileView();
                this.setupProfileFormEvents();
                break;
            case 'assign-teachers':
                // 🔒 Verificar si hay estudiantes registrados antes de mostrar la pestaña
                if (this.students.length === 0) {
                    this.showRegistrationRequiredPopup();
                    // Mantener la vista actual
                    this.currentView = 'create-profile';
                    this.updateTabNavigation();
                    return;
                }
                content.innerHTML = this.renderAssignTeachersView();
                this.initializeTeacherAssignment();
                break;
            case 'search-teachers':
                content.innerHTML = this.renderAssignTeachersView();
                this.initializeTeacherAssignment();
                break;
            case 'classroom':
                content.innerHTML = this.renderActivitiesView();
                break;
            case 'analytics':
                content.innerHTML = this.renderAnalyticsView();
                break;
            default:
                console.warn('Vista no reconocida:', view);
        }
        
        this.updateTabNavigation();
    }

    showRegistrationRequiredPopup() {
        console.log('🔒 Mostrando popup de registro requerido');
        
        // Crear overlay
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        overlay.id = 'registration-popup-overlay';
        
        // Crear popup con animación suave de 2 rebotes
        overlay.innerHTML = `
            <style>
                @keyframes gentleBounce {
                    0%, 20%, 50%, 80%, 100% {
                        transform: translateY(0);
                    }
                    40% {
                        transform: translateY(-10px);
                    }
                    60% {
                        transform: translateY(-5px);
                    }
                }
                .gentle-bounce {
                    animation: gentleBounce 0.8s ease-out;
                }
            </style>
            <div class="bg-white rounded-xl shadow-2xl p-8 mx-4 max-w-md gentle-bounce">
                <div class="text-center">
                    <div class="text-6xl mb-4">🔒</div>
                    <h2 class="text-2xl font-bold text-gray-800 mb-4">
                        ¡Registra a tu hijo/a primero!
                    </h2>
                    <p class="text-gray-600 mb-6 leading-relaxed">
                        Para poder asignar profesores necesitas completar primero el perfil de tu hijo/a en la pestaña 
                        <strong class="text-pink-600">"Datos Personales"</strong>
                    </p>
                    
                    <div class="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 mb-6 border-2 border-pink-200">
                        <h3 class="font-bold text-pink-800 mb-2 flex items-center justify-center">
                            <i class="fas fa-list-check mr-2"></i>¿Qué necesitas hacer?
                        </h3>
                        <ol class="text-left text-pink-700 space-y-1 text-sm">
                            <li>1️⃣ Completa los datos personales de tu hijo/a</li>
                            <li>2️⃣ Agrega sus gustos e intereses</li>
                            <li>3️⃣ Guarda el perfil</li>
                            <li>4️⃣ ¡Listo! Podrás asignar profesores</li>
                        </ol>
                    </div>
                    
                    <div class="space-y-3">
                        <button onclick="studentProfileManagement.closePopupAndGoToRegistration()" 
                                class="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 px-6 rounded-lg font-bold transition-all transform hover:scale-105">
                            <i class="fas fa-child mr-2"></i>Ir a Registrar mi Hijo/a
                        </button>
                        
                        <button onclick="studentProfileManagement.closePopup()" 
                                class="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-6 rounded-lg font-medium transition-colors">
                            <i class="fas fa-times mr-2"></i>Cerrar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Cerrar al hacer clic fuera del popup
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closePopup();
            }
        });
    }

    closePopup() {
        console.log('❌ Cerrando popup');
        const overlay = document.getElementById('registration-popup-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    closePopupAndGoToRegistration() {
        console.log('➡️ Cerrando popup y dirigiendo a registro');
        this.closePopup();
        // Cambiar a la pestaña de datos personales
        this.switchView('create-profile');
        
        // Hacer scroll al formulario y resaltarlo brevemente
        setTimeout(() => {
            const form = document.getElementById('student-profile-form');
            if (form) {
                form.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                // Efecto de resaltado
                form.style.border = '3px solid #ec4899';
                form.style.borderRadius = '12px';
                form.style.transition = 'all 0.3s ease';
                
                setTimeout(() => {
                    form.style.border = '';
                }, 2000);
            }
        }, 100);
        
        this.showNotification('📝 Completa el perfil de tu hijo/a para continuar', 'info');
    }

    updateTabNavigation() {
        const tabs = document.querySelectorAll('[id^="tab-"]');
        tabs.forEach(tab => {
            tab.classList.remove('border-blue-500', 'text-blue-600', 'bg-blue-50');
            tab.classList.add('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
        });
        
        const activeTab = document.getElementById(`tab-${this.currentView}`);
        if (activeTab) {
            activeTab.classList.remove('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
            activeTab.classList.add('border-blue-500', 'text-blue-600', 'bg-blue-50');
        }
        
        // 🔒 Aplicar estilo bloqueado a la pestaña de profesores si no hay estudiantes
        const assignTeachersTab = document.getElementById('tab-assign-teachers');
        if (assignTeachersTab && this.students.length === 0) {
            assignTeachersTab.classList.add('opacity-60', 'cursor-not-allowed');
            assignTeachersTab.innerHTML = `
                <i class="fas fa-lock mr-2"></i>Asignar Profesores
                <span class="text-xs block">🔒 Registra primero</span>
            `;
        } else if (assignTeachersTab && this.students.length > 0) {
            assignTeachersTab.classList.remove('opacity-60', 'cursor-not-allowed');
            assignTeachersTab.innerHTML = `
                <i class="fas fa-user-tie mr-2"></i>Asignar Profesores
            `;
        }
    }

    // ...existing code...

    // 🎨 MÉTODO PARA ACTUALIZAR INTERFAZ CON DATOS REALES
    updateSearchInterfaceWithRealData() {
        const resultsContainer = document.getElementById('professionals-results');
        if (resultsContainer && resultsContainer.innerHTML.includes('Busca profesionales')) {
            console.log('🎨 Actualizando interfaz de búsqueda con datos reales...');
            // La interfaz se actualizará cuando el usuario haga una búsqueda
        }
    }

    selectTeacher(teacherId) {
        console.log(`👩‍🏫 Seleccionando profesor: ${teacherId}`);
        
        const teacher = this.profesoresDisponibles.find(t => t.id === teacherId);
        if (!teacher) {
            this.showNotification('❌ Profesor no encontrado', 'error');
            return;
        }
        
        // Verificar si ya está asignado
        const assignedSection = document.getElementById('assigned-teachers-section');
        const assignedList = document.getElementById('assigned-teachers-list');
        
        if (!assignedSection || !assignedList) return;
        
        // Verificar duplicados
        const existingAssigned = assignedList.querySelectorAll('[data-teacher-id]');
        const alreadyAssigned = Array.from(existingAssigned).some(el => 
            el.getAttribute('data-teacher-id') === teacherId
        );
        
        if (alreadyAssigned) {
            this.showNotification('⚠️ Este profesor ya está asignado', 'warning');
            return;
        }
        
        // Agregar a la lista de asignados
        const teacherElement = document.createElement('div');
        teacherElement.className = 'flex items-center justify-between bg-white p-3 rounded-lg border-2 border-green-200';
        teacherElement.setAttribute('data-teacher-id', teacherId);
        teacherElement.innerHTML = `
            <div class="flex items-center">
                <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    ${teacher.is_verified ? '✅' : '👤'}
                </div>
                <div>
                    <div class="font-medium text-gray-800">${teacher.full_name}</div>
                    <div class="text-sm text-gray-600">${teacher.specialization}</div>
                </div>
            </div>
            <button onclick="studentProfileManagement.removeTeacher('${teacherId}')" 
                    class="text-red-500 hover:text-red-700 transition-colors">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        assignedList.appendChild(teacherElement);
        
        // Mostrar sección de asignados
        assignedSection.style.display = 'block';
        
        this.showNotification(`✅ ${teacher.full_name} asignado exitosamente`, 'success');
    }

    removeTeacher(teacherId) {
        console.log(`❌ Removiendo profesor: ${teacherId}`);
        
        const teacherElement = document.querySelector(`[data-teacher-id="${teacherId}"]`);
        if (teacherElement) {
            teacherElement.remove();
            
            // Ocultar sección si no hay profesores asignados
            const assignedList = document.getElementById('assigned-teachers-list');
            const assignedSection = document.getElementById('assigned-teachers-section');
            
            if (assignedList && assignedList.children.length === 0 && assignedSection) {
                assignedSection.style.display = 'none';
            }
            
            this.showNotification('✅ Profesor removido', 'success');
        }
    }

    async sendProfileToTeachers() {
        console.log('📤 Enviando perfil a profesores asignados...');
        
        const assignedTeachers = document.querySelectorAll('[data-teacher-id]');
        if (assignedTeachers.length === 0) {
            this.showNotification('⚠️ Selecciona al menos un profesor', 'warning');
            return;
        }
        
        try {
            // Obtener el estudiante más reciente
            const latestStudent = this.students[this.students.length - 1];
            if (!latestStudent) {
                this.showNotification('❌ Primero debe crear el perfil del estudiante', 'error');
                return;
            }
            
            // Obtener datos académicos
            const academicData = {
                grade: document.getElementById('student-grade').value,
                school: document.getElementById('student-school').value
            };
            
            // Combinar perfil con datos académicos
            const completeProfile = {
                ...latestStudent,
                academic: academicData,
                assignedAt: new Date().toISOString()
            };
            
            // Simular envío a cada profesor
            const teacherIds = Array.from(assignedTeachers).map(el => el.getAttribute('data-teacher-id'));
            
            for (const teacherId of teacherIds) {
                // Aquí se enviaría el perfil al dashboard del profesor
                console.log(`📧 Enviando perfil de ${completeProfile.name} al profesor ${teacherId}`);
                
                // Guardar asignación en localStorage del profesor (simulado)
                const teacherStudentsKey = `profesor-${teacherId}-estudiantes`;
                const existingStudents = JSON.parse(localStorage.getItem(teacherStudentsKey) || '[]');
                existingStudents.push(completeProfile);
                localStorage.setItem(teacherStudentsKey, JSON.stringify(existingStudents));
            }
            
            this.showNotification(`✅ Perfil enviado a ${teacherIds.length} profesor(es)`, 'success');
            
            // Mostrar mensaje de éxito
            setTimeout(() => {
                this.showSuccessMessage(completeProfile.name, teacherIds.length);
            }, 1000);
            
        } catch (error) {
            console.error('❌ Error enviando perfil:', error);
            this.showNotification('❌ Error al enviar el perfil', 'error');
        }
    }

    showSuccessMessage(studentName, teacherCount) {
        const content = document.getElementById('profile-main-content');
        if (!content) return;
        
        content.innerHTML = `
            <div class="bg-white rounded-xl shadow-lg p-8 text-center">
                <div class="text-6xl mb-4">🎉</div>
                <h2 class="text-3xl font-bold text-green-600 mb-4">¡Perfil Enviado Exitosamente!</h2>
                <p class="text-lg text-gray-700 mb-6">
                    El perfil de <strong>${studentName}</strong> ha sido enviado a <strong>${teacherCount}</strong> profesor(es).
                </p>
                <div class="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
                    <h3 class="font-bold text-green-800 mb-2">¿Qué sucede ahora?</h3>
                    <ul class="text-left text-green-700 space-y-2">
                        <li>📊 Los profesores podrán ver las estadísticas de tu hijo/a</li>
                        <li>📈 Recibirán reportes de progreso automáticamente</li>
                        <li>💬 Podrán contactarte para seguimiento personalizado</li>
                        <li>🎯 Crearán planes de estudio adaptados</li>
                    </ul>
                </div>
                <div class="space-x-4">
                    <button onclick="studentProfileManagement.goBackToDashboard()" 
                            class="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-bold transition-colors">
                        <i class="fas fa-home mr-2"></i>Volver al Dashboard
                    </button>
                    <button onclick="studentProfileManagement.switchView('create-profile')" 
                            class="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-bold transition-colors">
                        <i class="fas fa-plus mr-2"></i>Crear Otro Perfil
                    </button>
                </div>
            </div>
        `;
    }
    
    setupProfileFormEvents() {
        console.log('📝 Configurando eventos del formulario de perfil');
        
        const form = document.getElementById('student-profile-form');
        if (!form) return;
        
        // ✅ CONFIGURAR REGIONES Y COMUNAS DE CHILE AUTOMÁTICAMENTE
        this.setupChileRegionsComunas();
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveStudentProfile();
        });
    }

    // 🇨🇱 NUEVO MÉTODO: Configurar regiones y comunas de Chile automáticamente con detección IP
    async setupChileRegionsComunas() {
        console.log('🇨🇱 Configurando regiones y comunas de Chile con detección automática por IP...');
        
        // Verificar que el servicio de Chile esté disponible
        if (typeof window.ChileLocationService === 'undefined') {
            console.warn('⚠️ ChileLocationService no disponible, cargando script...');
            this.loadChileLocationService();
            return;
        }
        
        // ✅ USAR EL SISTEMA PROBADO DE DETECCIÓN AUTOMÁTICA DE IP
        try {
            console.log('🌍 Iniciando detección automática de ubicación por IP...');
            
            // Configurar selectores primero
            const regionSelect = document.getElementById('student-region');
            const comunaSelect = document.getElementById('student-comuna');
            
            if (!regionSelect || !comunaSelect) {
                console.warn('⚠️ Selectores de región/comuna no encontrados');
                return;
            }
            
            // 🔥 USAR EL MÉTODO PROBADO DEL REAL ANALYTICS SERVICE
            await this.detectLocationAndSetupSelectors(regionSelect, comunaSelect);
            
        } catch (error) {
            console.error('❌ Error configurando regiones de Chile:', error);
            this.setupFallbackRegions();
        }
    }

    // 🆕 NUEVO: Detectar ubicación usando geolocalización nativa del navegador
    async detectLocationByBrowserGeolocation() {
        console.log('📍 Solicitando ubicación al navegador...');
        
        return new Promise((resolve) => {
            // Verificar si geolocalización está disponible
            if (!navigator.geolocation) {
                console.warn('❌ Geolocalización no disponible en este navegador');
                resolve(null);
                return;
            }
            
            // Mostrar mensaje de solicitud al usuario
            this.showGeolocationRequest();
            
            // Configurar opciones de geolocalización
            const options = {
                enableHighAccuracy: true,    // Máxima precisión
                timeout: 15000,             // 15 segundos timeout
                maximumAge: 300000          // Cache por 5 minutos
            };
            
            // Solicitar ubicación al usuario
            navigator.geolocation.getCurrentPosition(
                // Éxito: ubicación obtenida
                async (position) => {
                    console.log('✅ Ubicación obtenida del navegador:', position);
                    
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    const accuracy = position.coords.accuracy;
                    
                    console.log(`📍 Coordenadas: ${lat}, ${lon} (precisión: ${accuracy}m)`);
                    
                    try {
                        // Convertir coordenadas a ubicación usando reverse geocoding
                        const locationData = await this.reverseGeocode(lat, lon);
                        
                        if (locationData) {
                            this.hideGeolocationRequest();
                            resolve({
                                ...locationData,
                                method: 'browser-geolocation',
                                coordinates: { lat, lon },
                                accuracy: accuracy
                            });
                        } else {
                            console.warn('⚠️ No se pudo convertir coordenadas a ubicación');
                            this.hideGeolocationRequest();
                            resolve(null);
                        }
                        
                    } catch (error) {
                        console.error('❌ Error en reverse geocoding:', error);
                        this.hideGeolocationRequest();
                        resolve(null);
                    }
                },
                
                // Error: usuario denegó o falló la geolocalización
                (error) => {
                    console.warn('⚠️ Error en geolocalización del navegador:', error);
                    this.hideGeolocationRequest();
                    
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            console.log('🚫 Usuario denegó el acceso a la ubicación');
                            this.showGeolocationDenied();
                            break;
                        case error.POSITION_UNAVAILABLE:
                            console.log('❓ Ubicación no disponible');
                            break;
                        case error.TIMEOUT:
                            console.log('⏰ Timeout en la solicitud de ubicación');
                            break;
                        default:
                            console.log('❌ Error desconocido en geolocalización');
                            break;
                    }
                    
                    resolve(null);
                },
                
                options
            );
        });
    }

    // 🗺️ NUEVO: Convertir coordenadas a ubicación usando reverse geocoding
    async reverseGeocode(lat, lon) {
        console.log(`🗺️ Convirtiendo coordenadas ${lat}, ${lon} a ubicación...`);
        
        const apis = [
            {
                name: 'Nominatim (OpenStreetMap)',
                url: `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=es`,
                parser: (data) => {
                    const address = data.address || {};
                    return {
                        country: address.country,
                        region: address.state || address.region || address.county,
                        city: address.city || address.town || address.village || address.suburb,
                        fullAddress: data.display_name
                    };
                }
            },
            {
                name: 'BigDataCloud',
                url: `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=es`,
                parser: (data) => ({
                    country: data.countryName,
                    region: data.principalSubdivision,
                    city: data.city || data.locality,
                    fullAddress: `${data.city}, ${data.principalSubdivision}, ${data.countryName}`
                })
            }
        ];
        
        for (const api of apis) {
            try {
                console.log(`🌐 Probando reverse geocoding con ${api.name}...`);
                
                const response = await fetch(api.url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'MatemágicaApp/1.0'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const parsed = api.parser(data);
                    
                    console.log(`✅ Respuesta de ${api.name}:`, parsed);
                    
                    if (parsed.country && parsed.region) {
                        return parsed;
                    }
                }
            } catch (error) {
                console.warn(`⚠️ Error con ${api.name}:`, error.message);
                continue;
            }
        }
        
        console.log('❌ No se pudo obtener ubicación por reverse geocoding');
        return null;
    }

    // 🔔 NUEVO: Mostrar mensaje de solicitud de geolocalización
    showGeolocationRequest() {
        // Crear overlay de solicitud
        const overlay = document.createElement('div');
        overlay.id = 'geolocation-request-overlay';
        overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
        
        overlay.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center">
                <div class="mb-4">
                    <i class="fas fa-map-marker-alt text-blue-500 text-4xl mb-3"></i>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">🇨🇱 Detectar tu ubicación en Chile</h3>
                </div>
                
                <div class="mb-6">
                    <p class="text-gray-600 mb-3">
                        Para una mejor experiencia, nos gustaría conocer tu región y comuna en Chile.
                    </p>
                    <div class="bg-blue-50 rounded-lg p-3 mb-3">
                        <p class="text-sm text-blue-800">
                            <strong>¿Por qué necesitamos tu ubicación?</strong>
                        </p>
                        <ul class="text-xs text-blue-700 mt-2 text-left space-y-1">
                            <li>✅ Conectarte con profesores de tu región</li>
                            <li>📊 Mejorar estadísticas educativas locales</li>
                            <li>🎯 Personalizar contenido según tu zona</li>
                            <li>📍 Facilitar actividades presenciales futuras</li>
                        </ul>
                    </div>
                    <p class="text-xs text-gray-500">
                        Tu ubicación exacta no se guarda, solo tu región y comuna.
                    </p>
                </div>
                
                <div class="space-y-3">
                    <div class="flex items-center justify-center space-x-2 text-orange-600">
                        <div class="animate-spin rounded-full h-4 w-4 border-2 border-orange-600 border-t-transparent"></div>
                        <span class="text-sm">Esperando respuesta del navegador...</span>
                    </div>
                    <p class="text-xs text-gray-500">
                        El navegador te pedirá permiso para acceder a tu ubicación
                    </p>
                </div>
                
                <button 
                    onclick="document.getElementById('geolocation-request-overlay').remove()"
                    class="mt-4 text-sm text-gray-500 hover:text-gray-700">
                    Cancelar y seleccionar manualmente
                </button>
            </div>
        `;
        
        document.body.appendChild(overlay);
    }

    // 🔔 NUEVO: Ocultar mensaje de solicitud de geolocalización
    hideGeolocationRequest() {
        const overlay = document.getElementById('geolocation-request-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    // 🚫 NUEVO: Mostrar mensaje cuando el usuario deniega geolocalización
    showGeolocationDenied() {
        const notification = document.createElement('div');
        notification.className = 'fixed top-20 right-4 z-50 bg-yellow-500 text-white p-4 rounded-lg shadow-lg max-w-sm';
        notification.innerHTML = `
            <div class="flex items-start space-x-3">
                <i class="fas fa-exclamation-triangle text-xl mt-1"></i>
                <div>
                    <div class="font-bold mb-1">Ubicación denegada</div>
                    <div class="text-sm opacity-90 mb-2">
                        No hay problema, puedes seleccionar tu región y comuna manualmente.
                    </div>
                    <div class="text-xs opacity-75">
                        Si cambias de opinión, puedes permitir la ubicación desde la configuración del navegador.
                    </div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:opacity-75">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove después de 8 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 8000);
        
        // Mostrar ayuda de selección manual
        this.showLocationHelp();
    }

    // 🌎 NUEVO: Mostrar mensaje para usuarios internacionales
    showInternationalUserMessage(country) {
        console.log('🌎 Mostrando mensaje para usuario internacional');
        
        const locationInfo = document.querySelector('.bg-white.rounded-lg.border.border-green-200');
        if (locationInfo) {
            locationInfo.innerHTML = `
                <h4 class="text-sm font-semibold text-blue-800 mb-2">
                    <i class="fas fa-globe mr-1"></i>¡Hola desde ${country}! 🌎
                </h4>
                <div class="bg-blue-50 rounded-lg p-3 mb-3">
                    <p class="text-xs text-blue-700 mb-2">
                        <strong>Detectamos que estás conectándote desde ${country}</strong>
                    </p>
                    <p class="text-xs text-blue-600 mb-2">
                        Matemágica está diseñada específicamente para el sistema educativo chileno, pero ¡eres bienvenid@!
                    </p>
                </div>
                <ul class="text-xs text-gray-700 space-y-1">
                    <li>🇨🇱 Puedes explorar el contenido educativo chileno</li>
                    <li>🎯 El currículum está basado en MINEDUC Chile</li>
                    <li>📍 Si tienes conexión con Chile, selecciona una región</li>
                    <li>🌎 También puedes usar la plataforma sin seleccionar ubicación</li>
                </ul>
                <div class="mt-3 flex space-x-2">
                    <button 
                        onclick="this.closest('.rounded-lg').style.display='none'"
                        class="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-xs hover:bg-blue-600">
                        Continuar sin ubicación
                    </button>
                    <button 
                        onclick="window.studentProfileManagement.showLocationHelp()"
                        class="flex-1 bg-gray-500 text-white px-3 py-2 rounded text-xs hover:bg-gray-600">
                        Seleccionar región chilena
                    </button>
                </div>
            `;
        }
    }

    // 🌍 NUEVO: Detectar ubicación y configurar selectores (MÉTODO MEJORADO con geolocalización nativa)
    async detectLocationAndSetupSelectors(regionSelect, comunaSelect) {
        console.log('🌍 Iniciando detección de ubicación avanzada...');
        
        try {
            // 1️⃣ Configurar selectores básicos primero
            window.ChileLocationService.setupRegionComunaSelectors('student-region', 'student-comuna');
            
            // 2️⃣ NUEVO: Intentar geolocalización nativa del navegador PRIMERO (más precisa)
            let detectedLocation = null;
            
            console.log('📍 Intentando geolocalización nativa del navegador...');
            detectedLocation = await this.detectLocationByBrowserGeolocation();
            
            // 3️⃣ Si falla la geolocalización nativa, usar detección por IP como fallback
            if (!detectedLocation) {
                console.log('🔍 Fallback: Intentando detección por IP...');
                
                // Opción A: Usar RealAnalyticsService si está disponible
                if (window.RealAnalyticsService && window.RealAnalyticsService.visitorData) {
                    const visitorData = window.RealAnalyticsService.visitorData;
                    console.log('📊 Datos del visitante disponibles:', visitorData);
                    
                    if (visitorData.ip && visitorData.ip.region && visitorData.ip.city) {
                        detectedLocation = {
                            region: visitorData.ip.region,
                            city: visitorData.ip.city,
                            country: visitorData.ip.country,
                            method: 'ip-analytics'
                        };
                        console.log('✅ Ubicación detectada desde RealAnalyticsService:', detectedLocation);
                    }
                }
                
                // Opción B: Usar API de geolocalización por IP directa
                if (!detectedLocation) {
                    console.log('🔍 Intentando detección directa por IP...');
                    detectedLocation = await this.detectLocationByIP();
                    if (detectedLocation) {
                        detectedLocation.method = 'ip-direct';
                    }
                }
            }
            
            // 4️⃣ Aplicar ubicación detectada si se encontró y es Chile
            if (detectedLocation && (detectedLocation.country === 'Chile' || detectedLocation.country === 'CL')) {
                console.log('🇨🇱 Ubicación chilena detectada, aplicando automáticamente...');
                this.applyDetectedLocation(detectedLocation, regionSelect, comunaSelect);
            } else if (detectedLocation && detectedLocation.country !== 'Chile' && detectedLocation.country !== 'CL') {
                console.log('🌎 Usuario detectado fuera de Chile:', detectedLocation.country);
                this.showInternationalUserMessage(detectedLocation.country);
            } else {
                console.log('❓ Ubicación no detectada, dejando selección manual');
                this.showLocationHelp();
            }
            
        } catch (error) {
            console.error('❌ Error en detección automática:', error);
            console.log('📍 Continuando con selección manual...');
            this.showLocationHelp();
        }
    }

    // 🔍 NUEVO: Detectar ubicación por IP usando APIs múltiples
    async detectLocationByIP() {
        console.log('🔍 Detectando ubicación por IP...');
        
        const apis = [
            {
                name: 'ipapi.co',
                url: 'https://ipapi.co/json/',
                parser: (data) => ({
                    country: data.country_name,
                    region: data.region,
                    city: data.city,
                    ip: data.ip
                })
            },
            {
                name: 'ip-api.com',
                url: 'http://ip-api.com/json/',
                parser: (data) => ({
                    country: data.country,
                    region: data.regionName,
                    city: data.city,
                    ip: data.query
                })
            },
            {
                name: 'ipinfo.io',
                url: 'https://ipinfo.io/json',
                parser: (data) => ({
                    country: data.country,
                    region: data.region,
                    city: data.city,
                    ip: data.ip
                })
            }
        ];
        
        for (const api of apis) {
            try {
                console.log(`🌐 Intentando con ${api.name}...`);
                
                const response = await fetch(api.url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    },
                    timeout: 5000
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const parsed = api.parser(data);
                    
                    console.log(`✅ Respuesta de ${api.name}:`, parsed);
                    
                    if (parsed.country && parsed.region && parsed.city) {
                        return parsed;
                    }
                }
            } catch (error) {
                console.warn(`⚠️ Error con ${api.name}:`, error.message);
                continue;
            }
        }
        
        console.log('❌ No se pudo detectar ubicación con ninguna API');
        return null;
    }

    // 🎯 NUEVO: Aplicar ubicación detectada a los selectores
    applyDetectedLocation(location, regionSelect, comunaSelect) {
        console.log('🎯 Aplicando ubicación detectada:', location);
        
        try {
            // Mapear región detectada a código de región chilena
            const regionMapping = this.getChileRegionMapping();
            
            let regionCode = null;
            const detectedRegion = location.region?.toLowerCase();
            const detectedCity = location.city?.toLowerCase();
            
            // Buscar por nombre de región
            for (const [code, data] of Object.entries(regionMapping)) {
                if (data.names.some(name => detectedRegion?.includes(name.toLowerCase()))) {
                    regionCode = code;
                    break;
                }
                // También buscar por ciudades principales
                if (data.mainCities.some(city => detectedCity?.includes(city.toLowerCase()))) {
                    regionCode = code;
                    break;
                }
            }
            
            if (regionCode) {
                console.log(`✅ Región mapeada: ${detectedRegion} -> ${regionCode}`);
                
                // Seleccionar región automáticamente
                regionSelect.value = regionCode;
                
                // Trigger change event para cargar comunas
                const changeEvent = new Event('change', { bubbles: true });
                regionSelect.dispatchEvent(changeEvent);
                
                // Seleccionar comuna después de que se carguen
                setTimeout(() => {
                    const comunaOptions = comunaSelect.querySelectorAll('option');
                    for (const option of comunaOptions) {
                        if (option.value.toLowerCase().includes(detectedCity) || 
                            option.textContent.toLowerCase().includes(detectedCity)) {
                            comunaSelect.value = option.value;
                            console.log(`✅ Comuna seleccionada automáticamente: ${option.value}`);
                            break;
                        }
                    }
                    
                    // Mostrar mensaje de éxito
                    this.showAutoDetectionSuccess(location.region, location.city);
                }, 500);
                
            } else {
                console.log('⚠️ No se pudo mapear la región detectada');
                this.showLocationHelp();
            }
            
        } catch (error) {
            console.error('❌ Error aplicando ubicación detectada:', error);
            this.showLocationHelp();
        }
    }

    // 🗺️ NUEVO: Mapeo de regiones chilenas para detección automática
    getChileRegionMapping() {
        return {
            'metropolitana': {
                names: ['santiago', 'metropolitana', 'metropolitan'],
                mainCities: ['santiago', 'las condes', 'providencia', 'ñuñoa', 'maipú']
            },
            'valparaiso': {
                names: ['valparaíso', 'valparaiso'],
                mainCities: ['valparaíso', 'viña del mar', 'quilpué', 'villa alemana']
            },
            'biobio': {
                names: ['biobío', 'biobio', 'bío bío'],
                mainCities: ['concepción', 'talcahuano', 'los ángeles', 'chillán']
            },
            'araucania': {
                names: ['araucanía', 'araucania', 'la araucanía'],
                mainCities: ['temuco', 'villarrica', 'pucón', 'padre las casas']
            },
            'los-lagos': {
                names: ['los lagos'],
                mainCities: ['puerto montt', 'puerto varas', 'osorno', 'castro']
            },
            'antofagasta': {
                names: ['antofagasta'],
                mainCities: ['antofagasta', 'calama', 'tocopilla']
            },
            'coquimbo': {
                names: ['coquimbo'],
                mainCities: ['la serena', 'coquimbo', 'ovalle', 'illapel']
            },
            'ohiggins': {
                names: ['ohiggins', "o'higgins", 'libertador'],
                mainCities: ['rancagua', 'san fernando', 'rengo', 'machalí']
            },
            'maule': {
                names: ['maule'],
                mainCities: ['talca', 'curicó', 'linares', 'cauquenes']
            },
            'tarapaca': {
                names: ['tarapacá', 'tarapaca'],
                mainCities: ['iquique', 'alto hospicio', 'pozo almonte']
            },
            'atacama': {
                names: ['atacama'],
                mainCities: ['copiapó', 'caldera', 'vallenar', 'chañaral']
            },
            'aysen': {
                names: ['aysén', 'aysen', 'aisén'],
                mainCities: ['coyhaique', 'puerto aysén', 'chile chico']
            },
            'magallanes': {
                names: ['magallanes', 'antártica'],
                mainCities: ['punta arenas', 'puerto natales', 'porvenir']
            },
            'arica-parinacota': {
                names: ['arica', 'parinacota'],
                mainCities: ['arica', 'putre']
            },
            'nuble': {
                names: ['ñuble', 'nuble'],
                mainCities: ['chillán', 'san carlos', 'bulnes']
            },
            'los-rios': {
                names: ['los ríos', 'los rios'],
                mainCities: ['valdivia', 'la unión', 'río bueno']
            }
        };
    }

    // ✅ NUEVO: Mostrar mensaje de éxito de detección automática
    showAutoDetectionSuccess(region, city) {
        console.log('🎉 Mostrando mensaje de éxito de detección automática');
        
        // Crear notificación de éxito temporal
        const notification = document.createElement('div');
        notification.className = 'fixed top-20 right-4 z-50 bg-green-500 text-white p-4 rounded-lg shadow-lg max-w-sm animate-bounce';
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-map-marker-alt mr-2 text-xl"></i>
                <div>
                    <div class="font-bold">¡Ubicación detectada automáticamente!</div>
                    <div class="text-sm opacity-90 mb-2">${region}, ${city}</div>
                    <div class="text-xs opacity-75 mt-1">Puedes cambiarla si no es correcta</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove después de 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
        
        // También actualizar la descripción de ayuda
        const locationInfo = document.querySelector('.bg-white.rounded-lg.border.border-green-200');
        if (locationInfo) {
            locationInfo.innerHTML = `
                <h4 class="text-sm font-semibold text-green-800 mb-2">
                    <i class="fas fa-check-circle mr-1"></i>¡Ubicación detectada automáticamente por IP!
                </h4>
                <ul class="text-xs text-green-700 space-y-1">
                    <li>✅ Tu región y comuna fueron detectadas desde tu conexión a internet</li>
                    <li>🔄 Puedes cambiarlas manualmente si no son correctas</li>
                    <li>🔒 Tu ubicación ayuda a conectarte con profesores locales</li>
                    <li>📊 También mejora las estadísticas educativas regionales</li>
                </ul>
            `;
        }
    }

    // 📍 NUEVO: Mostrar ayuda de ubicación cuando no se detecta automáticamente
    showLocationHelp() {
        console.log('📍 Mostrando ayuda de ubicación manual');
        
        const locationInfo = document.querySelector('.bg-white.rounded-lg.border.border-green-200');
        if (locationInfo) {
            locationInfo.innerHTML = `
                <h4 class="text-sm font-semibold text-orange-800 mb-2">
                    <i class="fas fa-lightbulb mr-1"></i>Selecciona tu ubicación manualmente
                </h4>
                <ul class="text-xs text-orange-700 space-y-1">
                    <li>🔍 No pudimos detectar tu ubicación automáticamente</li>
                    <li>📍 Por favor selecciona tu región y comuna manualmente</li>
                    <li>👩‍🏫 Esto nos ayuda a conectarte con profesores locales</li>
                    <li>📊 También mejora las estadísticas educativas regionales</li>
                </ul>
            `;
        }
    }

}    // ...existing code...