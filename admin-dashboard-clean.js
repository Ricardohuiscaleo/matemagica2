// 🎯 DASHBOARD ADMIN EFICIENTE - Sin datos duplicados
// Basado en las estructuras reales de la base de datos
console.log('🔧 Iniciando Dashboard Admin EFICIENTE - Matemágica v2.1');

class AdminDashboardEfficient {
    constructor() {
        this.supabase = null;
        this.isInitialized = false;
        this.stats = {};
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
    }

    // 🚀 INICIALIZACIÓN PRINCIPAL
    async initialize() {
        try {
            console.log('🚀 Inicializando dashboard eficiente...');
            
            // Verificar autenticación
            if (!this.checkAuthentication()) {
                throw new Error('Usuario no autorizado');
            }

            // Conectar Supabase
            await this.connectSupabase();
            
            // Cargar datos una sola vez
            await this.loadAllData();
            
            // Configurar UI
            this.setupUI();
            
            this.isInitialized = true;
            console.log('✅ Dashboard eficiente listo');
            
        } catch (error) {
            console.error('❌ Error inicializando dashboard:', error);
            this.showError('Error inicializando dashboard: ' + error.message);
        }
    }

    // 🔐 VERIFICAR AUTENTICACIÓN
    checkAuthentication() {
        const isAuth = localStorage.getItem('matemagica-authenticated') === 'true';
        const profile = localStorage.getItem('matemagica-user-profile');
        
        if (!isAuth || !profile) {
            window.location.href = 'index.html';
            return false;
        }

        try {
            const user = JSON.parse(profile);
            if (user.user_role !== 'admin') {
                window.location.href = 'index.html';
                return false;
            }
            console.log('✅ Admin autorizado:', user.email);
            return true;
        } catch (error) {
            console.error('❌ Error verificando perfil:', error);
            return false;
        }
    }

    // 🔌 CONECTAR SUPABASE
    async connectSupabase() {
        console.log('🔌 Intentando conectar Supabase REAL...');
        
        // 1️⃣ INTENTAR USAR CLIENTE REAL EXISTENTE PRIMERO
        const possibleClients = [
            window.supabaseClient,
            window.studentManagementCore?.supabaseClient,
            window.unifiedStudentSystem?.supabaseClient
        ];

        for (const client of possibleClients) {
            if (client && typeof client.from === 'function') {
                try {
                    // Probar consulta real para verificar conexión
                    const { data, error } = await client.from('math_profiles').select('count').limit(1);
                    if (!error) {
                        this.supabase = client;
                        console.log('✅ Cliente Supabase REAL conectado desde ubicación existente');
                        return;
                    }
                } catch (testError) {
                    console.warn(`⚠️ Cliente existente falló test:`, testError);
                }
            }
        }

        // 2️⃣ CREAR CLIENTE REAL CON CONFIGURACIÓN LOCAL
        if (window.SUPABASE_CONFIG) {
            try {
                // Importar Supabase dinámicamente
                console.log('📥 Importando Supabase dinámicamente...');
                
                // Usar skypack como CDN alternativo más confiable
                const { createClient } = await import('https://cdn.skypack.dev/@supabase/supabase-js@2');
                
                this.supabase = createClient(
                    window.SUPABASE_CONFIG.url,
                    window.SUPABASE_CONFIG.anon_key
                );

                // Probar conexión real
                console.log('🧪 Probando conexión real a Supabase...');
                const { data, error } = await this.supabase.from('math_profiles').select('count').limit(1);
                
                if (error) {
                    console.error('❌ Error en conexión real:', error);
                    throw error;
                }
                
                console.log('✅ Cliente Supabase REAL creado y verificado');
                return;
                
            } catch (importError) {
                console.error('❌ Error importando Supabase:', importError);
            }
        }

        // 3️⃣ FALLBACK: USAR FETCH DIRECTO A SUPABASE REST API
        if (window.SUPABASE_CONFIG) {
            console.log('🔧 Usando API REST de Supabase como fallback...');
            
            this.supabase = {
                from: (table) => ({
                    select: (columns) => ({
                        order: (column, options) => this.fetchSupabaseData(table, columns, column, options),
                        limit: (count) => this.fetchSupabaseData(table, columns, null, null, count),
                        execute: () => this.fetchSupabaseData(table, columns)
                    })
                })
            };
            
            // Probar API REST
            try {
                await this.fetchSupabaseData('math_profiles', 'count', null, null, 1);
                console.log('✅ API REST de Supabase funcionando');
                return;
            } catch (restError) {
                console.error('❌ Error con API REST:', restError);
            }
        }

        throw new Error('No se pudo conectar a Supabase con datos reales');
    }

    // 🌐 FETCH DIRECTO A SUPABASE REST API
    async fetchSupabaseData(table, columns = '*', orderColumn = null, orderOptions = null, limit = null) {
        const url = new URL(`${window.SUPABASE_CONFIG.url}/rest/v1/${table}`);
        
        // Parámetros de consulta
        const params = new URLSearchParams();
        params.set('select', columns);
        
        if (orderColumn) {
            const orderDirection = orderOptions?.ascending === false ? 'desc' : 'asc';
            params.set('order', `${orderColumn}.${orderDirection}`);
        }
        
        if (limit) {
            params.set('limit', limit.toString());
        }
        
        url.search = params.toString();
        
        const response = await fetch(url.toString(), {
            headers: {
                'apikey': window.SUPABASE_CONFIG.anon_key,
                'Authorization': `Bearer ${window.SUPABASE_CONFIG.anon_key}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return { data, error: null };
    }

    // 📊 CARGAR TODOS LOS DATOS (UNA SOLA VEZ)
    async loadAllData() {
        try {
            console.log('📊 Cargando datos del sistema...');
            
            // Ejecutar consultas en paralelo para eficiencia
            const [
                profilesData,
                exercisesData,
                sessionsData,
                progressData,
                skillsData
            ] = await Promise.allSettled([
                this.loadProfiles(),
                this.loadExercises(), 
                this.loadSessions(),
                this.loadProgress(),
                this.loadSkills()
            ]);

            // Procesar resultados
            this.stats = {
                // Usuarios
                totalUsers: profilesData.status === 'fulfilled' ? profilesData.value.length : 0,
                profiles: profilesData.status === 'fulfilled' ? profilesData.value : [],
                
                // Ejercicios
                totalExercises: exercisesData.status === 'fulfilled' ? exercisesData.value.length : 0,
                exercises: exercisesData.status === 'fulfilled' ? exercisesData.value : [],
                
                // Sesiones
                totalSessions: sessionsData.status === 'fulfilled' ? sessionsData.value.length : 0,
                sessions: sessionsData.status === 'fulfilled' ? sessionsData.value : [],
                
                // Progreso
                totalProgress: progressData.status === 'fulfilled' ? progressData.value.length : 0,
                progress: progressData.status === 'fulfilled' ? progressData.value : [],
                
                // Habilidades
                totalSkills: skillsData.status === 'fulfilled' ? skillsData.value.length : 0,
                skills: skillsData.status === 'fulfilled' ? skillsData.value : [],
                
                lastUpdate: new Date().toISOString()
            };

            console.log('✅ Datos cargados:', {
                usuarios: this.stats.totalUsers,
                ejercicios: this.stats.totalExercises,
                sesiones: this.stats.totalSessions,
                progreso: this.stats.totalProgress,
                habilidades: this.stats.totalSkills
            });

        } catch (error) {
            console.error('❌ Error cargando datos:', error);
            throw error;
        }
    }

    // 👥 CARGAR PERFILES (COLUMNAS REALES)
    async loadProfiles() {
        const { data, error } = await this.supabase
            .from('math_profiles')
            .select('id, user_id, nombre_completo, edad, nivel_preferido, created_at, updated_at, email, full_name, user_role, is_active, rating, total_reviews, avatar_url, parent_id, teacher_id')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    // 🧮 CARGAR EJERCICIOS (COLUMNAS REALES)
    async loadExercises() {
        const { data, error } = await this.supabase
            .from('math_exercises')
            .select('id, operation, level, number1, number2, correct_answer, difficulty_tags, is_story_problem, created_at')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    // 📚 CARGAR SESIONES (COLUMNAS REALES)
    async loadSessions() {
        const { data, error } = await this.supabase
            .from('math_sessions')
            .select('id, user_id, student_name, level, exercise_count, correct_count, duration_minutes, created_at')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    // 📈 CARGAR PROGRESO (COLUMNAS REALES)
    async loadProgress() {
        const { data, error } = await this.supabase
            .from('math_user_progress')
            .select('id, user_id, nivel, ejercicios_completados, ejercicios_correctos, total_puntos, tiempo_total_estudio, ultima_sesion')
            .order('total_puntos', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    // 🎯 CARGAR HABILIDADES (COLUMNAS REALES)
    async loadSkills() {
        const { data, error } = await this.supabase
            .from('math_skills_catalog')
            .select('id, skill_code, skill_name, category, description, is_active, sort_order, created_at')
            .order('sort_order', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    // 🎨 CONFIGURAR INTERFAZ
    setupUI() {
        console.log('🎨 Configurando interfaz child-friendly...');
        
        // Actualizar estadísticas generales
        this.updateOverview();
        
        // Configurar navegación
        this.setupNavigation();
        
        // Generar tablas con estilo infantil
        this.generateTables();
        
        // Configurar eventos
        this.setupEvents();
        
        // ✅ AÑADIR ELEMENTOS CHILD-FRIENDLY
        this.addChildFriendlyElements();
        
        console.log('✅ Interfaz child-friendly configurada');
    }

    // 🌈 ELEMENTOS CHILD-FRIENDLY
    addChildFriendlyElements() {
        // Añadir mensaje de bienvenida colorido
        const welcomeMessage = document.createElement('div');
        welcomeMessage.className = 'bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 text-white p-4 rounded-xl shadow-lg mb-6 text-center';
        welcomeMessage.innerHTML = `
            <h3 class="text-lg font-bold">🎉 ¡Hola Admin de Matemágica! 🧮</h3>
            <p class="text-sm mt-2">Dashboard con datos reales de ${this.stats.totalUsers} usuarios y ${this.stats.totalExercises} ejercicios</p>
        `;

        // Insertar al inicio del main
        const main = document.querySelector('main');
        const firstChild = main.firstElementChild;
        main.insertBefore(welcomeMessage, firstChild);

        // Añadir iconos divertidos a los stats
        this.addFunIcons();
        
        // Mensaje de estado de datos
        this.addDataStatusIndicator();
    }

    // 🎪 ICONOS DIVERTIDOS
    addFunIcons() {
        const statsCards = document.querySelectorAll('[id$="-users"], [id$="-exercises"], [id$="-sessions"]');
        statsCards.forEach(card => {
            if (card.textContent !== '0') {
                card.classList.add('animate-pulse');
                // Añadir efecto de éxito para datos reales
                const parent = card.closest('.bg-white');
                if (parent) {
                    parent.classList.add('border-l-4', 'border-green-400');
                }
            }
        });
    }

    // 📊 INDICADOR DE ESTADO DE DATOS
    addDataStatusIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg z-50 text-sm font-bold';
        indicator.innerHTML = `🟢 Datos REALES conectados`;
        
        document.body.appendChild(indicator);
        
        // Auto-ocultar después de 5 segundos
        setTimeout(() => {
            indicator.style.transition = 'all 0.5s ease';
            indicator.style.opacity = '0';
            indicator.style.transform = 'translateX(100%)';
            setTimeout(() => indicator.remove(), 500);
        }, 5000);
    }

    // 📊 ACTUALIZAR OVERVIEW
    updateOverview() {
        // Calcular métricas
        const metrics = this.calculateMetrics();
        
        // Actualizar elementos si existen
        this.updateElement('total-users', metrics.totalUsers);
        this.updateElement('total-exercises', metrics.totalExercises);
        this.updateElement('total-sessions', metrics.totalSessions);
        this.updateElement('avg-accuracy', metrics.avgAccuracy + '%');
        this.updateElement('active-students', metrics.activeStudents);
        this.updateElement('total-study-time', this.formatTime(metrics.totalStudyTime));
        
        console.log('📊 Overview actualizado:', metrics);
    }

    // 🧮 CALCULAR MÉTRICAS
    calculateMetrics() {
        const { profiles, exercises, sessions, progress } = this.stats;
        
        // Usuarios activos (últimos 7 días)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const activeStudents = progress.filter(p => 
            p.ultima_sesion && new Date(p.ultima_sesion) > weekAgo
        ).length;

        // Precisión promedio
        const totalCorrect = progress.reduce((sum, p) => sum + (p.ejercicios_correctos || 0), 0);
        const totalCompleted = progress.reduce((sum, p) => sum + (p.ejercicios_completados || 0), 0);
        const avgAccuracy = totalCompleted > 0 ? Math.round((totalCorrect / totalCompleted) * 100) : 0;

        // Tiempo total de estudio
        const totalStudyTime = progress.reduce((sum, p) => sum + (p.tiempo_total_estudio || 0), 0);

        return {
            totalUsers: profiles.length,
            totalExercises: exercises.length,
            totalSessions: sessions.length,
            activeStudents,
            avgAccuracy,
            totalStudyTime
        };
    }

    // 🧭 CONFIGURAR NAVEGACIÓN
    setupNavigation() {
        const navItems = [
            { id: 'nav-overview', section: 'overview' },
            { id: 'nav-users', section: 'users' },
            { id: 'nav-exercises', section: 'exercises' },
            { id: 'nav-sessions', section: 'sessions' },
            { id: 'nav-progress', section: 'progress' },
            { id: 'nav-skills', section: 'skills' }
        ];

        navItems.forEach(item => {
            const element = document.getElementById(item.id);
            if (element) {
                element.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showSection(item.section);
                });
            }
        });

        console.log('✅ Navegación configurada');
    }

    // 📱 MOSTRAR SECCIÓN
    showSection(sectionName) {
        // Ocultar todas las secciones
        const sections = document.querySelectorAll('[id$="-section"]');
        sections.forEach(section => {
            section.classList.add('hidden');
        });

        // Mostrar sección seleccionada
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }

        // Actualizar navegación activa
        this.updateActiveNav(sectionName);

        console.log('📱 Sección mostrada:', sectionName);
    }

    // 🎯 ACTUALIZAR NAVEGACIÓN ACTIVA
    updateActiveNav(activeSection) {
        // Remover clase activa de todos los elementos
        const navItems = document.querySelectorAll('[id^="nav-"]');
        navItems.forEach(item => {
            item.classList.remove('bg-blue-100', 'text-blue-600', 'border-blue-200');
            item.classList.add('text-gray-600', 'hover:text-blue-600');
        });

        // Añadir clase activa al elemento seleccionado
        const activeNav = document.getElementById(`nav-${activeSection}`);
        if (activeNav) {
            activeNav.classList.add('bg-blue-100', 'text-blue-600', 'border-blue-200');
            activeNav.classList.remove('text-gray-600', 'hover:text-blue-600');
        }
    }

    // 📊 GENERAR TABLAS
    generateTables() {
        this.generateUsersTable();
        this.generateExercisesTable();
        this.generateSessionsTable();
        this.generateProgressTable();
        this.generateSkillsTable();
        console.log('📊 Tablas generadas');
    }

    // 👥 GENERAR TABLA DE USUARIOS
    generateUsersTable() {
        const container = document.getElementById('users-table');
        if (!container || !this.stats.profiles) return;

        const profiles = this.stats.profiles; // Mostrar TODOS los usuarios, no limitar

        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900">👥 Usuarios del Sistema (${this.stats.totalUsers})</h3>
                        <p class="text-sm text-gray-500 mt-1">Vista completa de todos los usuarios registrados</p>
                    </div>
                    <div class="text-sm text-gray-500">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <span id="filtered-count">${profiles.length}</span> registros encontrados
                        </span>
                    </div>
                </div>

                <!-- 🔍 SISTEMA DE FILTROS -->
                <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div class="flex flex-wrap gap-4 items-center">
                        <!-- Búsqueda por texto -->
                        <div class="flex-1 min-w-64">
                            <div class="relative">
                                <input 
                                    type="text" 
                                    id="search-users" 
                                    placeholder="🔍 Buscar por nombre o email..." 
                                    class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                >
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <!-- Filtro por rol -->
                        <div>
                            <select id="filter-role" class="block w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                                <option value="">👤 Todos los roles</option>
                                <option value="admin">🔑 Admin</option>
                                <option value="teacher,profesor">👩‍🏫 Profesores</option>
                                <option value="parent,apoderado">👨‍👩‍👧‍👦 Apoderados</option>
                                <option value="student,estudiante">🧑‍🎓 Estudiantes</option>
                            </select>
                        </div>

                        <!-- Filtro por estado -->
                        <div>
                            <select id="filter-status" class="block w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                                <option value="">📊 Todos</option>
                                <option value="active">🟢 Activos</option>
                                <option value="inactive">🔴 Inactivos</option>
                            </select>
                        </div>

                        <!-- Filtro por nivel -->
                        <div>
                            <select id="filter-level" class="block w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                                <option value="">📚 Niveles</option>
                                <option value="facil">🟢 Fácil</option>
                                <option value="medio">🟡 Medio</option>
                                <option value="dificil">🔴 Difícil</option>
                            </select>
                        </div>

                        <!-- Botón limpiar filtros -->
                        <button 
                            id="clear-filters" 
                            class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
                            title="Limpiar todos los filtros"
                        >
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                            Limpiar
                        </button>
                    </div>

                    <!-- Indicador de filtros activos -->
                    <div id="active-filters" class="mt-3 hidden">
                        <span class="text-xs text-gray-500 mr-2">Filtros activos:</span>
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Edad</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nivel</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviews</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avatar</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent ID</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher ID</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registro</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actualizado</th>
                            </tr>
                        </thead>
                        <tbody id="users-tbody" class="bg-white divide-y divide-gray-200">
                            ${this.generateUsersRows(profiles)}
                        </tbody>
                    </table>
                </div>
                <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div class="flex items-center justify-between text-sm text-gray-500">
                        <div id="users-summary">
                            Mostrando <span id="shown-count">${profiles.length}</span> de ${this.stats.totalUsers} usuarios totales
                        </div>
                        <div class="flex space-x-4" id="users-stats">
                            <span>🟢 Activos: <span id="active-count">${profiles.filter(p => p.is_active !== false).length}</span></span>
                            <span>🔴 Inactivos: <span id="inactive-count">${profiles.filter(p => p.is_active === false).length}</span></span>
                            <span>👩‍🏫 Profesores: <span id="teacher-count">${profiles.filter(p => p.user_role === 'teacher' || p.user_role === 'profesor').length}</span></span>
                            <span>👨‍👩‍👧‍👦 Apoderados: <span id="parent-count">${profiles.filter(p => p.user_role === 'parent' || p.user_role === 'apoderado').length}</span></span>
                            <span>🧑‍🎓 Estudiantes: <span id="student-count">${profiles.filter(p => !p.user_role || p.user_role === 'student' || p.user_role === 'estudiante').length}</span></span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Configurar eventos de filtros
        this.setupUsersFilters();
    }

    // 🔧 GENERAR FILAS DE USUARIOS (SEPARADO PARA FILTROS)
    generateUsersRows(profiles) {
        return profiles.map((profile, index) => `
            <tr class="hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}" data-user-row>
                <td class="px-4 py-4 whitespace-nowrap text-xs font-mono text-gray-600">
                    ${profile.id ? profile.id.toString().slice(-8) : 'N/A'}
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span class="text-white font-bold text-sm">
                                ${(profile.nombre_completo || profile.full_name || '?').charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900" data-name>
                                ${profile.nombre_completo || profile.full_name || 'Sin nombre'}
                            </div>
                            <div class="text-xs text-gray-500">
                                ID: ${profile.id || 'N/A'}
                            </div>
                        </div>
                    </div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900" data-email>${profile.email || 'Sin email'}</div>
                    <div class="text-xs text-gray-500">${profile.email ? '✅ Verificado' : '❌ Sin email'}</div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap" data-role="${profile.user_role || 'student'}">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full 
                                 ${profile.user_role === 'admin' ? 'bg-red-100 text-red-800' : 
                                   profile.user_role === 'teacher' || profile.user_role === 'profesor' ? 'bg-purple-100 text-purple-800' : 
                                   profile.user_role === 'parent' || profile.user_role === 'apoderado' ? 'bg-blue-100 text-blue-800' :
                                   'bg-green-100 text-green-800'}">
                        ${profile.user_role || 'estudiante'}
                    </span>
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>${profile.edad || 'N/A'}</div>
                    <div class="text-xs text-gray-500">${profile.edad ? 'años' : 'sin edad'}</div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900" data-level="${profile.nivel_preferido || ''}">
                    <span class="inline-flex px-2 py-1 text-xs rounded-full 
                                 ${profile.nivel_preferido === 'facil' ? 'bg-green-100 text-green-800' :
                                   profile.nivel_preferido === 'medio' ? 'bg-yellow-100 text-yellow-800' :
                                   profile.nivel_preferido === 'dificil' ? 'bg-red-100 text-red-800' :
                                   'bg-gray-100 text-gray-800'}">
                        ${profile.nivel_preferido || 'N/A'}
                    </span>
                </td>
                <td class="px-4 py-4 whitespace-nowrap" data-status="${profile.is_active !== false ? 'active' : 'inactive'}">
                    <div class="flex flex-col">
                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full 
                                     ${profile.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                            ${profile.is_active !== false ? '🟢 Activo' : '🔴 Inactivo'}
                        </span>
                    </div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-center">
                    <div class="text-sm font-medium text-gray-900">
                        ${profile.rating ? parseFloat(profile.rating).toFixed(1) : '0.0'}
                    </div>
                    <div class="text-xs text-yellow-500">
                        ${'★'.repeat(Math.floor(profile.rating || 0))}${'☆'.repeat(5 - Math.floor(profile.rating || 0))}
                    </div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-center">
                    <div class="text-sm font-medium text-gray-900">${profile.total_reviews || 0}</div>
                    <div class="text-xs text-gray-500">${profile.total_reviews ? 'reviews' : 'sin reviews'}</div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-center">
                    ${profile.avatar_url ? 
                        `<img src="${profile.avatar_url}" class="w-8 h-8 rounded-full" alt="Avatar" onerror="this.style.display='none'">` : 
                        '<span class="text-xs text-gray-400">Sin avatar</span>'
                    }
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-xs font-mono text-gray-600">
                    ${profile.parent_id ? profile.parent_id.toString().slice(-8) : 'N/A'}
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-xs font-mono text-gray-600">
                    ${profile.teacher_id ? profile.teacher_id.toString().slice(-8) : 'N/A'}
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-xs font-mono text-gray-600">
                    ${profile.user_id ? profile.user_id.toString().slice(-8) : 'N/A'}
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>${profile.created_at ? new Date(profile.created_at).toLocaleDateString('es-ES') : 'N/A'}</div>
                    <div class="text-xs text-gray-400">
                        ${profile.created_at ? new Date(profile.created_at).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'}) : ''}
                    </div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>${profile.updated_at ? new Date(profile.updated_at).toLocaleDateString('es-ES') : 'N/A'}</div>
                    <div class="text-xs text-gray-400">
                        ${profile.updated_at ? new Date(profile.updated_at).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'}) : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // 🔍 CONFIGURAR FILTROS DE USUARIOS
    setupUsersFilters() {
        const searchInput = document.getElementById('search-users');
        const roleFilter = document.getElementById('filter-role');
        const statusFilter = document.getElementById('filter-status');
        const levelFilter = document.getElementById('filter-level');
        const clearButton = document.getElementById('clear-filters');

        if (!searchInput || !roleFilter || !statusFilter || !levelFilter || !clearButton) {
            console.warn('⚠️ No se encontraron elementos de filtro');
            return;
        }

        // Configurar eventos de filtros
        const applyFilters = () => this.applyUsersFilters();
        
        searchInput.addEventListener('input', applyFilters);
        roleFilter.addEventListener('change', applyFilters);
        statusFilter.addEventListener('change', applyFilters);
        levelFilter.addEventListener('change', applyFilters);
        
        clearButton.addEventListener('click', () => {
            searchInput.value = '';
            roleFilter.value = '';
            statusFilter.value = '';
            levelFilter.value = '';
            this.applyUsersFilters();
        });

        console.log('🔍 Filtros de usuarios configurados');
    }

    // 🎯 APLICAR FILTROS DE USUARIOS
    applyUsersFilters() {
        const searchText = document.getElementById('search-users').value.toLowerCase();
        const roleFilter = document.getElementById('filter-role').value;
        const statusFilter = document.getElementById('filter-status').value;
        const levelFilter = document.getElementById('filter-level').value;

        const rows = document.querySelectorAll('[data-user-row]');
        let visibleCount = 0;
        const stats = {
            active: 0,
            inactive: 0,
            teacher: 0,
            parent: 0,
            student: 0
        };

        rows.forEach(row => {
            const nameEl = row.querySelector('[data-name]');
            const emailEl = row.querySelector('[data-email]');
            const roleEl = row.querySelector('[data-role]');
            const statusEl = row.querySelector('[data-status]');
            const levelEl = row.querySelector('[data-level]');

            const name = nameEl ? nameEl.textContent.toLowerCase() : '';
            const email = emailEl ? emailEl.textContent.toLowerCase() : '';
            const role = roleEl ? roleEl.getAttribute('data-role') : '';
            const status = statusEl ? statusEl.getAttribute('data-status') : '';
            const level = levelEl ? levelEl.getAttribute('data-level') : '';

            let visible = true;

            // Filtro de búsqueda por texto
            if (searchText && !name.includes(searchText) && !email.includes(searchText)) {
                visible = false;
            }

            // Filtro por rol
            if (roleFilter && !roleFilter.split(',').includes(role)) {
                visible = false;
            }

            // Filtro por estado
            if (statusFilter && status !== statusFilter) {
                visible = false;
            }

            // Filtro por nivel
            if (levelFilter && level !== levelFilter) {
                visible = false;
            }

            // Mostrar/ocultar fila
            if (visible) {
                row.style.display = '';
                visibleCount++;
                
                // Actualizar estadísticas
                if (status === 'active') stats.active++;
                if (status === 'inactive') stats.inactive++;
                if (role === 'teacher' || role === 'profesor') stats.teacher++;
                if (role === 'parent' || role === 'apoderado') stats.parent++;
                if (!role || role === 'student' || role === 'estudiante') stats.student++;
            } else {
                row.style.display = 'none';
            }
        });

        // Actualizar contadores
        this.updateUsersCounters(visibleCount, stats);
        
        // Mostrar indicadores de filtros activos
        this.updateActiveFiltersIndicator();

        console.log(`🔍 Filtros aplicados: ${visibleCount} usuarios visibles`);
    }

    // 📊 ACTUALIZAR CONTADORES DE USUARIOS
    updateUsersCounters(visibleCount, stats) {
        const elements = {
            'filtered-count': visibleCount,
            'shown-count': visibleCount,
            'active-count': stats.active,
            'inactive-count': stats.inactive,
            'teacher-count': stats.teacher,
            'parent-count': stats.parent,
            'student-count': stats.student
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    // 🏷️ ACTUALIZAR INDICADOR DE FILTROS ACTIVOS
    updateActiveFiltersIndicator() {
        const searchText = document.getElementById('search-users').value;
        const roleFilter = document.getElementById('filter-role').value;
        const statusFilter = document.getElementById('filter-status').value;
        const levelFilter = document.getElementById('filter-level').value;
        
        const activeFiltersContainer = document.getElementById('active-filters');
        const activeFilters = [];

        if (searchText) {
            activeFilters.push(`<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">📝 "${searchText}"</span>`);
        }

        if (roleFilter) {
            const roleLabels = {
                'admin': '🔑 Admin',
                'teacher,profesor': '👩‍🏫 Profesores',
                'parent,apoderado': '👨‍👩‍👧‍👦 Apoderados',
                'student,estudiante': '🧑‍🎓 Estudiantes'
            };
            activeFilters.push(`<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">${roleLabels[roleFilter] || roleFilter}</span>`);
        }

        if (statusFilter) {
            const statusLabel = statusFilter === 'active' ? '🟢 Activos' : '🔴 Inactivos';
            activeFilters.push(`<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">${statusLabel}</span>`);
        }

        if (levelFilter) {
            const levelLabels = {
                'facil': '🟢 Fácil',
                'medio': '🟡 Medio',
                'dificil': '🔴 Difícil'
            };
            activeFilters.push(`<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">${levelLabels[levelFilter]}</span>`);
        }

        if (activeFilters.length > 0) {
            activeFiltersContainer.innerHTML = `
                <div class="flex flex-wrap gap-2">
                    <span class="text-xs text-gray-500">Filtros activos:</span>
                    ${activeFilters.join('')}
                </div>
            `;
            activeFiltersContainer.classList.remove('hidden');
        } else {
            activeFiltersContainer.classList.add('hidden');
        }
    }

    // 🔧 FUNCIONES DE UTILIDAD FALTANTES
    
    // 📝 ACTUALIZAR ELEMENTO DEL DOM
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    // ❌ MOSTRAR ERROR
    showError(message) {
        console.error('❌ Error:', message);
        
        // Crear notificación de error visual
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md';
        errorDiv.innerHTML = `
            <div class="flex items-center">
                <span class="text-2xl mr-3">⚠️</span>
                <div>
                    <h4 class="font-bold">Error en el Dashboard</h4>
                    <p class="text-sm mt-1">${message}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            errorDiv.style.transition = 'all 0.5s ease';
            errorDiv.style.opacity = '0';
            errorDiv.style.transform = 'translateX(100%)';
            setTimeout(() => errorDiv.remove(), 500);
        }, 5000);
    }

    // ⏰ FORMATEAR TIEMPO EN MINUTOS
    formatTime(minutes) {
        if (!minutes || minutes === 0) return '0 min';
        
        const totalMinutes = Math.round(minutes);
        
        if (totalMinutes < 60) {
            return `${totalMinutes} min`;
        }
        
        const hours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;
        
        if (remainingMinutes === 0) {
            return `${hours}h`;
        }
        
        return `${hours}h ${remainingMinutes}min`;
    }

    // 🎯 CONFIGURAR EVENTOS GENERALES
    setupEvents() {
        // Configurar botón de cerrar sesión si existe
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('matemagica-authenticated');
                localStorage.removeItem('matemagica-user-profile');
                window.location.href = 'index.html';
            });
        }

        // Configurar botón de refresh datos
        const refreshBtn = document.getElementById('refresh-data');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                try {
                    refreshBtn.disabled = true;
                    refreshBtn.innerHTML = '🔄 Actualizando...';
                    
                    await this.loadAllData();
                    this.updateOverview();
                    this.generateTables();
                    
                    refreshBtn.innerHTML = '✅ Actualizado';
                    setTimeout(() => {
                        refreshBtn.disabled = false;
                        refreshBtn.innerHTML = '🔄 Actualizar datos';
                    }, 2000);
                } catch (error) {
                    this.showError('Error actualizando datos: ' + error.message);
                    refreshBtn.disabled = false;
                    refreshBtn.innerHTML = '🔄 Actualizar datos';
                }
            });
        }
    }

    // 🧮 GENERAR TABLA DE EJERCICIOS
    generateExercisesTable() {
        const container = document.getElementById('exercises-table');
        if (!container || !this.stats.exercises) return;

        const exercises = this.stats.exercises.slice(0, 50); // Limitar para performance

        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h3 class="text-lg font-semibold text-gray-900">🧮 Ejercicios Generados (${this.stats.totalExercises})</h3>
                    <p class="text-sm text-gray-500 mt-1">Ejercicios matemáticos creados automáticamente</p>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operación</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ejercicio</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Respuesta</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nivel</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creado</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${exercises.map((exercise, index) => `
                                <tr class="hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}">
                                    <td class="px-4 py-4 whitespace-nowrap text-xs font-mono text-gray-600">
                                        ${exercise.id ? exercise.id.toString().slice(-6) : 'N/A'}
                                    </td>
                                    <td class="px-4 py-4 whitespace-nowrap">
                                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full 
                                                     ${exercise.operation === 'suma' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}">
                                            ${exercise.operation === 'suma' ? '➕ Suma' : '➖ Resta'}
                                        </span>
                                    </td>
                                    <td class="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                        ${exercise.number1 || 0} ${exercise.operation === 'suma' ? '+' : '-'} ${exercise.number2 || 0} = ?
                                    </td>
                                    <td class="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                        ${exercise.correct_answer || 0}
                                    </td>
                                    <td class="px-4 py-4 whitespace-nowrap">
                                        <span class="inline-flex px-2 py-1 text-xs rounded-full 
                                                     ${exercise.level === 'facil' ? 'bg-green-100 text-green-800' :
                                                       exercise.level === 'medio' ? 'bg-yellow-100 text-yellow-800' :
                                                       'bg-red-100 text-red-800'}">
                                            ${exercise.level || 'N/A'}
                                        </span>
                                    </td>
                                    <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ${exercise.is_story_problem ? '📖 Cuento' : '🔢 Simple'}
                                    </td>
                                    <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                        ${exercise.created_at ? new Date(exercise.created_at).toLocaleDateString('es-ES') : 'N/A'}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div class="text-sm text-gray-500">
                        Mostrando ${exercises.length} de ${this.stats.totalExercises} ejercicios totales
                    </div>
                </div>
            </div>
        `;
    }

    // 📚 GENERAR TABLA DE SESIONES
    generateSessionsTable() {
        const container = document.getElementById('sessions-table');
        if (!container || !this.stats.sessions) return;

        const sessions = this.stats.sessions.slice(0, 50);

        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h3 class="text-lg font-semibold text-gray-900">📚 Sesiones de Estudio (${this.stats.totalSessions})</h3>
                    <p class="text-sm text-gray-500 mt-1">Registros de actividad de los estudiantes</p>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiante</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ejercicios</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precisión</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duración</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nivel</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${sessions.map((session, index) => {
                                const accuracy = session.exercise_count > 0 ? 
                                    Math.round((session.correct_count / session.exercise_count) * 100) : 0;
                                
                                return `
                                    <tr class="hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}">
                                        <td class="px-4 py-4 whitespace-nowrap text-xs font-mono text-gray-600">
                                            ${session.id ? session.id.toString().slice(-6) : 'N/A'}
                                        </td>
                                        <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ${session.student_name || 'Sin nombre'}
                                        </td>
                                        <td class="px-4 py-4 whitespace-nowrap text-sm text-center">
                                            <span class="text-green-600 font-medium">${session.correct_count || 0}</span>
                                            <span class="text-gray-400 mx-1">/</span>
                                            <span class="text-gray-600">${session.exercise_count || 0}</span>
                                        </td>
                                        <td class="px-4 py-4 whitespace-nowrap text-center">
                                            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full 
                                                         ${accuracy >= 80 ? 'bg-green-100 text-green-800' :
                                                           accuracy >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                                           'bg-red-100 text-red-800'}">
                                                ${accuracy}%
                                            </span>
                                        </td>
                                        <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ${this.formatTime(session.duration_minutes)}
                                        </td>
                                        <td class="px-4 py-4 whitespace-nowrap">
                                            <span class="inline-flex px-2 py-1 text-xs rounded-full 
                                                         ${session.level === 'facil' ? 'bg-green-100 text-green-800' :
                                                           session.level === 'medio' ? 'bg-yellow-100 text-yellow-800' :
                                                           'bg-red-100 text-red-800'}">
                                                ${session.level || 'N/A'}
                                            </span>
                                        </td>
                                        <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ${session.created_at ? new Date(session.created_at).toLocaleDateString('es-ES') : 'N/A'}
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div class="text-sm text-gray-500">
                        Mostrando ${sessions.length} de ${this.stats.totalSessions} sesiones totales
                    </div>
                </div>
            </div>
        `;
    }

    // 📈 GENERAR TABLA DE PROGRESO
    generateProgressTable() {
        const container = document.getElementById('progress-table');
        if (!container || !this.stats.progress) return;

        const progress = this.stats.progress.slice(0, 50);

        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h3 class="text-lg font-semibold text-gray-900">📈 Progreso de Estudiantes (${this.stats.totalProgress})</h3>
                    <p class="text-sm text-gray-500 mt-1">Estadísticas acumulativas de aprendizaje</p>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nivel</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ejercicios</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precisión</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puntos</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiempo Total</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Sesión</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${progress.map((prog, index) => {
                                const accuracy = prog.ejercicios_completados > 0 ? 
                                    Math.round((prog.ejercicios_correctos / prog.ejercicios_completados) * 100) : 0;
                                
                                return `
                                    <tr class="hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}">
                                        <td class="px-4 py-4 whitespace-nowrap text-xs font-mono text-gray-600">
                                            ${prog.user_id ? prog.user_id.toString().slice(-6) : 'N/A'}
                                        </td>
                                        <td class="px-4 py-4 whitespace-nowrap">
                                            <span class="inline-flex px-2 py-1 text-xs rounded-full 
                                                         ${prog.nivel === 'facil' ? 'bg-green-100 text-green-800' :
                                                           prog.nivel === 'medio' ? 'bg-yellow-100 text-yellow-800' :
                                                           'bg-red-100 text-red-800'}">
                                                ${prog.nivel || 'N/A'}
                                            </span>
                                        </td>
                                        <td class="px-4 py-4 whitespace-nowrap text-sm text-center">
                                            <span class="text-green-600 font-medium">${prog.ejercicios_correctos || 0}</span>
                                            <span class="text-gray-400 mx-1">/</span>
                                            <span class="text-gray-600">${prog.ejercicios_completados || 0}</span>
                                        </td>
                                        <td class="px-4 py-4 whitespace-nowrap text-center">
                                            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full 
                                                         ${accuracy >= 80 ? 'bg-green-100 text-green-800' :
                                                           accuracy >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                                           'bg-red-100 text-red-800'}">
                                                ${accuracy}%
                                            </span>
                                        </td>
                                        <td class="px-4 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                                            ${prog.total_puntos || 0}
                                        </td>
                                        <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ${this.formatTime(prog.tiempo_total_estudio)}
                                        </td>
                                        <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ${prog.ultima_sesion ? new Date(prog.ultima_sesion).toLocaleDateString('es-ES') : 'Nunca'}
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div class="text-sm text-gray-500">
                        Mostrando ${progress.length} de ${this.stats.totalProgress} registros de progreso
                    </div>
                </div>
            </div>
        `;
    }

    // 🎯 GENERAR TABLA DE HABILIDADES
    generateSkillsTable() {
        const container = document.getElementById('skills-table');
        if (!container || !this.stats.skills) return;

        const skills = this.stats.skills;

        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h3 class="text-lg font-semibold text-gray-900">🎯 Catálogo de Habilidades (${this.stats.totalSkills})</h3>
                    <p class="text-sm text-gray-500 mt-1">Habilidades matemáticas del currículum</p>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Habilidad</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orden</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${skills.map((skill, index) => `
                                <tr class="hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}">
                                    <td class="px-4 py-4 whitespace-nowrap text-xs font-mono text-blue-600">
                                        ${skill.skill_code || 'N/A'}
                                    </td>
                                    <td class="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        ${skill.skill_name || 'Sin nombre'}
                                    </td>
                                    <td class="px-4 py-4 whitespace-nowrap">
                                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                            ${skill.category || 'General'}
                                        </span>
                                    </td>
                                    <td class="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">
                                        ${skill.description || 'Sin descripción'}
                                    </td>
                                    <td class="px-4 py-4 whitespace-nowrap">
                                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full 
                                                     ${skill.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                                            ${skill.is_active ? '🟢 Activa' : '🔴 Inactiva'}
                                        </span>
                                    </td>
                                    <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                        ${skill.sort_order || 0}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div class="text-sm text-gray-500">
                        Mostrando todas las ${this.stats.totalSkills} habilidades del catálogo
                    </div>
                </div>
            </div>
        `;
    }

    // ...existing code...
}

// 🚀 INICIALIZACIÓN AUTOMÁTICA
let adminDashboard = null;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('📄 DOM cargado - Iniciando dashboard eficiente...');
    
    try {
        adminDashboard = new AdminDashboardEfficient();
        await adminDashboard.initialize();
        
        // Exportar globalmente para debugging
        window.adminDashboard = adminDashboard;
        
    } catch (error) {
        console.error('❌ Error crítico en dashboard:', error);
    }
});

// 🌍 EXPORTAR PARA COMPATIBILIDAD
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminDashboardEfficient;
}

console.log('✅ Dashboard Admin Eficiente cargado');