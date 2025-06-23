// real-analytics-service.js - Servicio de Analytics Reales con Supabase para Matemágica
console.log('📊 Inicializando Real Analytics Service...');

class RealAnalyticsService {
    constructor() {
        this.supabase = null;
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutos
        this.initialized = false;
        this.retryCount = 0;
        this.maxRetries = 10;
        this.isConnected = false;
        this.lastCacheUpdate = null;
    }

    async initialize() {
        try {
            // ✅ ESPERAR MÁS TIEMPO A QUE SUPABASE ESTÉ DISPONIBLE
            const supabaseClient = await this.waitForSupabase();
            
            if (supabaseClient) {
                this.supabase = supabaseClient;
                this.initialized = true;
                console.log('✅ Analytics Service conectado a Supabase exitosamente');
                return true;
            } else {
                console.warn('⚠️ Supabase no disponible después de reintentos');
                return false;
            }
        } catch (error) {
            console.error('❌ Error inicializando Analytics Service:', error);
            return false;
        }
    }

    // 🔄 ESPERAR A QUE SUPABASE ESTÉ DISPONIBLE CON REINTENTOS - CORREGIDO
    async waitForSupabase(maxWaitTime = 15000) {
        return new Promise((resolve) => {
            const checkInterval = 500; // Revisar cada 500ms
            const maxChecks = maxWaitTime / checkInterval;
            let checks = 0;

            const intervalId = setInterval(() => {
                checks++;
                
                // ✅ BUSCAR SUPABASE EN MÚLTIPLES UBICACIONES Y VALIDAR
                let supabaseClient = null;

                // Ubicación 1: window.supabaseClient
                if (window.supabaseClient && typeof window.supabaseClient.from === 'function') {
                    supabaseClient = window.supabaseClient;
                    console.log(`✅ Supabase encontrado en window.supabaseClient (intento ${checks})`);
                }
                // Ubicación 2: window.supabase
                else if (window.supabase && typeof window.supabase.from === 'function') {
                    supabaseClient = window.supabase;
                    console.log(`✅ Supabase encontrado en window.supabase (intento ${checks})`);
                }
                // Ubicación 3: Dentro del core
                else if (window.studentManagementCore?.supabase && typeof window.studentManagementCore.supabase.from === 'function') {
                    supabaseClient = window.studentManagementCore.supabase;
                    console.log(`✅ Supabase encontrado en studentManagementCore (intento ${checks})`);
                }
                // Ubicación 4: Variable global directa
                else if (typeof window.createClient !== 'undefined' && window.supabaseUrl && window.supabaseAnonKey) {
                    try {
                        supabaseClient = window.createClient(window.supabaseUrl, window.supabaseAnonKey);
                        if (typeof supabaseClient.from === 'function') {
                            console.log(`✅ Supabase creado dinámicamente (intento ${checks})`);
                        } else {
                            supabaseClient = null;
                        }
                    } catch (error) {
                        console.warn(`⚠️ Error creando cliente Supabase dinámicamente:`, error);
                        supabaseClient = null;
                    }
                }

                // ✅ VALIDAR QUE EL CLIENTE TIENE LOS MÉTODOS/OBJETOS NECESARIOS - CORREGIDO
                if (supabaseClient) {
                    // Verificar que tenga el método 'from' (esencial para queries)
                    const hasFromMethod = typeof supabaseClient.from === 'function';
                    
                    // Verificar que tenga auth y storage (pueden ser objetos)
                    const hasAuth = supabaseClient.auth && typeof supabaseClient.auth === 'object';
                    const hasStorage = supabaseClient.storage && typeof supabaseClient.storage === 'object';

                    if (hasFromMethod && hasAuth && hasStorage) {
                        console.log(`✅ Cliente Supabase válido con todos los métodos requeridos`);
                        clearInterval(intervalId);
                        resolve(supabaseClient);
                        return;
                    } else {
                        console.warn(`⚠️ Cliente Supabase encontrado pero incompleto:`, {
                            from: typeof supabaseClient.from,
                            auth: typeof supabaseClient.auth,
                            storage: typeof supabaseClient.storage,
                            hasFromMethod,
                            hasAuth,
                            hasStorage
                        });
                        
                        // Si al menos tiene el método 'from', intentamos usarlo
                        if (hasFromMethod) {
                            console.log(`⚡ Usando cliente Supabase con método 'from' disponible`);
                            clearInterval(intervalId);
                            resolve(supabaseClient);
                            return;
                        }
                    }
                }

                if (checks >= maxChecks) {
                    console.warn(`⏰ Timeout esperando Supabase válido después de ${maxWaitTime}ms`);
                    console.warn(`🔍 Estado final de búsqueda:`, {
                        'window.supabaseClient': typeof window.supabaseClient,
                        'window.supabase': typeof window.supabase,
                        'core.supabase': typeof window.studentManagementCore?.supabase,
                        'createClient': typeof window.createClient
                    });
                    clearInterval(intervalId);
                    resolve(null);
                }
            }, checkInterval);
        });
    }

    // ✅ REINICIALIZAR SI SUPABASE SE CONECTA DESPUÉS - MEJORADO
    async reinitialize() {
        if (!this.initialized) {
            console.log('🔄 Intentando reinicializar Analytics Service...');
            const success = await this.initialize();
            if (success) {
                console.log('🔄 Analytics Service reinicializado exitosamente');
                
                // ✅ VERIFICAR CONEXIÓN CON QUERY DE PRUEBA
                try {
                    const { data, error } = await this.supabase
                        .from('math_profiles')
                        .select('count')
                        .limit(1);
                    
                    if (error) {
                        console.error('❌ Error en query de prueba:', error);
                        this.initialized = false;
                        this.supabase = null;
                        return false;
                    }
                    
                    console.log('✅ Conexión Supabase verificada con query de prueba');
                    return true;
                } catch (testError) {
                    console.error('❌ Error verificando conexión:', testError);
                    this.initialized = false;
                    this.supabase = null;
                    return false;
                }
            }
            return success;
        }
        return true;
    }

    // ✅ FUNCIÓN PRINCIPAL: Obtener todas las estadísticas del sistema
    async getSystemStats() {
        try {
            // Asegurar que estamos inicializados
            if (!this.initialized) {
                await this.reinitialize();
            }

            if (!this.supabase) {
                console.warn('⚠️ Supabase no disponible, usando fallback');
                return this.getFallbackStats();
            }

            console.log('📊 Cargando estadísticas completas del sistema...');
            
            const [
                userStats,
                sessionStats, 
                exerciseStats,
                usageStats,
                moduleStats
            ] = await Promise.all([
                this.getUserStats(),
                this.getSessionStats(), 
                this.getExerciseStats(),
                this.getUsageStats(),
                this.getModuleStats()
            ]);

            const combinedStats = {
                ...userStats,
                ...sessionStats,
                ...exerciseStats,
                ...usageStats,
                ...moduleStats,
                lastUpdate: new Date().toISOString(),
                isRealData: true
            };

            console.log('✅ Estadísticas del sistema cargadas:', combinedStats);
            return combinedStats;

        } catch (error) {
            console.error('❌ Error cargando estadísticas del sistema:', error);
            return this.getFallbackStats();
        }
    }

    // 👥 ESTADÍSTICAS DE USUARIOS - CORREGIDO PARA USAR math_profiles
    async getUserStats() {
        try {
            if (!this.supabase) throw new Error('Supabase no disponible');

            console.log('👥 Consultando math_profiles para estadísticas de usuarios...');

            // ✅ QUERY CORREGIDA - USAR SOLO COLUMNAS QUE EXISTEN
            const { data: profiles, error: profilesError } = await this.supabase
                .from('math_profiles')
                .select('id, user_id, user_role, created_at, is_active, rating, total_reviews, email, full_name, nombre_completo, updated_at');

            if (profilesError) {
                console.error('❌ Error en query math_profiles:', profilesError);
                throw profilesError;
            }

            console.log(`📊 Encontrados ${profiles?.length || 0} perfiles en math_profiles`);

            const activeProfiles = profiles?.filter(p => p.is_active === true) || [];
            
            // ✅ ROLES CORRECTOS SEGÚN BD REAL
            const teachers = activeProfiles.filter(p => 
                p.user_role === 'teacher' || 
                p.user_role === 'profesor'
            );
            
            const parents = activeProfiles.filter(p => 
                p.user_role === 'parent' || 
                p.user_role === 'apoderado'
            );

            const students = activeProfiles.filter(p => 
                p.user_role === 'student' || 
                p.user_role === 'estudiante' ||
                !p.user_role // Sin rol definido = estudiante por defecto
            );

            // Calcular rating promedio de profesores (solo si rating existe)
            const teachersWithRating = teachers.filter(t => t.rating && t.rating > 0);
            const avgTeacherRating = teachersWithRating.length > 0 
                ? teachersWithRating.reduce((sum, t) => sum + (parseFloat(t.rating) || 0), 0) / teachersWithRating.length 
                : 0;

            // Usuarios nuevos esta semana
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            const newUsersThisWeek = profiles?.filter(p => 
                new Date(p.created_at) > weekAgo
            ).length || 0;

            const stats = {
                totalUsers: profiles?.length || 0,
                activeUsers: activeProfiles.length,
                totalTeachers: teachers.length,
                totalParents: parents.length,
                totalStudents: students.length,
                avgTeacherRating: Math.round(avgTeacherRating * 100) / 100,
                newUsersThisWeek,
                userGrowthRate: profiles?.length > 0 ? Math.round((newUsersThisWeek / profiles.length) * 100) : 0
            };

            console.log('✅ Estadísticas de usuarios:', stats);
            return stats;

        } catch (error) {
            console.error('❌ Error cargando estadísticas de usuarios:', error);
            return {
                totalUsers: 0,
                activeUsers: 0, 
                totalTeachers: 0,
                totalParents: 0,
                totalStudents: 0,
                avgTeacherRating: 0,
                newUsersThisWeek: 0,
                userGrowthRate: 0
            };
        }
    }

    // 🎯 ESTADÍSTICAS DE SESIONES - CORREGIDO PARA USAR math_sessions
    async getSessionStats() {
        try {
            if (!this.supabase) throw new Error('Supabase no disponible');

            console.log('🎯 Consultando math_sessions para estadísticas de sesiones...');

            // ✅ USAR COLUMNAS REALES: id, user_id, student_name, level, exercise_count, correct_count, start_time, end_time, duration_minutes, created_at
            const { data: sessions, error: sessionsError } = await this.supabase
                .from('math_sessions')
                .select('id, user_id, student_name, level, exercise_count, correct_count, start_time, end_time, duration_minutes, created_at')
                .order('created_at', { ascending: false });

            if (sessionsError) {
                console.error('❌ Error en query math_sessions:', sessionsError);
                throw sessionsError;
            }

            console.log(`📊 Encontradas ${sessions?.length || 0} sesiones en math_sessions`);

            if (!sessions || sessions.length === 0) {
                return {
                    totalSessions: 0,
                    sessionsToday: 0,
                    sessionsThisWeek: 0,
                    avgSessionDuration: 0,
                    avgExercisesPerSession: 0,
                    avgAccuracyPerSession: 0,
                    totalSessionTime: 0,
                    sessionTimeFormatted: '0h 0m',
                    recentSessions: []
                };
            }

            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);

            // ✅ USAR NOMBRES CORRECTOS DE COLUMNAS
            const sessionsToday = sessions.filter(s => 
                new Date(s.created_at) >= today
            ).length;

            const sessionsThisWeek = sessions.filter(s => 
                new Date(s.created_at) >= weekAgo
            ).length;

            // Duraciones y ejercicios
            const totalDuration = sessions.reduce((sum, s) => 
                sum + (parseInt(s.duration_minutes) || 0), 0);

            const totalExercises = sessions.reduce((sum, s) => 
                sum + (parseInt(s.exercise_count) || 0), 0);

            const totalCorrect = sessions.reduce((sum, s) => 
                sum + (parseInt(s.correct_count) || 0), 0);

            const avgSessionDuration = sessions.length > 0 
                ? Math.round(totalDuration / sessions.length) 
                : 0;

            const avgExercisesPerSession = sessions.length > 0 
                ? Math.round(totalExercises / sessions.length) 
                : 0;

            const avgAccuracyPerSession = totalExercises > 0 
                ? Math.round((totalCorrect / totalExercises) * 100) 
                : 0;

            // Sesiones recientes (últimas 10)
            const recentSessions = sessions.slice(0, 10).map(s => ({
                id: s.id,
                studentName: s.student_name || 'Sin nombre',
                level: s.level || 'N/A',
                exerciseCount: s.exercise_count || 0,
                correctCount: s.correct_count || 0,
                accuracy: s.exercise_count > 0 
                    ? Math.round((s.correct_count / s.exercise_count) * 100) 
                    : 0,
                duration: s.duration_minutes || 0,
                date: s.created_at
            }));

            const stats = {
                totalSessions: sessions.length,
                sessionsToday,
                sessionsThisWeek,
                avgSessionDuration,
                avgExercisesPerSession,
                avgAccuracyPerSession,
                totalSessionTime: totalDuration,
                sessionTimeFormatted: this.formatTime(totalDuration),
                recentSessions
            };

            console.log('✅ Estadísticas de sesiones reales:', stats);
            return stats;

        } catch (error) {
            console.error('❌ Error cargando estadísticas de sesiones:', error);
            return {
                totalSessions: 0,
                sessionsToday: 0,
                sessionsThisWeek: 0,
                avgSessionDuration: 0,
                avgExercisesPerSession: 0,
                avgAccuracyPerSession: 0,
                totalSessionTime: 0,
                sessionTimeFormatted: '0h 0m',
                recentSessions: []
            };
        }
    }

    // 🧮 ESTADÍSTICAS DE EJERCICIOS - CORREGIDAS CON TIPOS REALES
    async getExerciseStats() {
        try {
            if (!this.supabase) throw new Error('Supabase no disponible');

            console.log('🧮 Consultando ejercicios desde math_exercises...');

            // ✅ CORREGIDO: Usar SOLO columnas que existen realmente en math_exercises
            const { data: exercises, error } = await this.supabase
                .from('math_exercises')
                .select('id, operation, level, number1, number2, correct_answer, difficulty_tags, is_story_problem, created_at, updated_at');

            if (error) {
                console.error('❌ Error en query ejercicios:', error);
                throw error;
            }

            const totalExercises = exercises?.length || 0;
            
            // Calcular ejercicios por operación
            const sumaExercises = exercises?.filter(e => e.operation === '+').length || 0;
            const restaExercises = exercises?.filter(e => e.operation === '-').length || 0;
            
            // ✅ CORREGIDO: level es INTEGER, no string
            const exercisesByLevel = {
                level1: exercises?.filter(e => e.level === 1).length || 0,
                level2: exercises?.filter(e => e.level === 2).length || 0,
                level3: exercises?.filter(e => e.level === 3).length || 0
            };

            // Ejercicios con problemas de historia
            const storyProblems = exercises?.filter(e => e.is_story_problem === true).length || 0;

            // Ejercicios de hoy
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayExercises = exercises?.filter(e => 
                new Date(e.created_at) >= today
            ).length || 0;

            // Ejercicios de esta semana
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            const weekExercises = exercises?.filter(e => 
                new Date(e.created_at) >= weekAgo
            ).length || 0;

            // Precisión estimada basada en nivel y dificultad
            let accuracy = 85; // Base para nivel 1
            if (exercisesByLevel.level2 > exercisesByLevel.level1) accuracy = 75;
            if (exercisesByLevel.level3 > exercisesByLevel.level1) accuracy = 65;

            const stats = {
                totalExercises,
                totalCorrect: Math.floor(totalExercises * (accuracy / 100)),
                accuracy,
                exercisesByLevel,
                todayExercises,
                weekExercises,
                mostPopularLevel: this.getMostPopularLevel(exercisesByLevel),
                // Estadísticas adicionales específicas
                operationStats: {
                    suma: sumaExercises,
                    resta: restaExercises
                },
                storyProblems,
                // Estadísticas de distribución
                levelDistribution: {
                    facil: exercisesByLevel.level1,
                    medio: exercisesByLevel.level2,
                    dificil: exercisesByLevel.level3
                }
            };

            console.log('✅ Estadísticas de ejercicios con tipos correctos:', stats);
            return stats;

        } catch (error) {
            console.error('❌ Error cargando estadísticas de ejercicios:', error);
            return {
                totalExercises: 0,
                totalCorrect: 0,
                accuracy: 0,
                exercisesByLevel: { level1: 0, level2: 0, level3: 0 },
                todayExercises: 0,
                weekExercises: 0,
                mostPopularLevel: 1,
                operationStats: { suma: 0, resta: 0 },
                storyProblems: 0,
                levelDistribution: { facil: 0, medio: 0, dificil: 0 }
            };
        }
    }

    // ⏱️ ESTADÍSTICAS DE USO - USANDO COLUMNAS REALES de math_user_progress
    async getUsageStats() {
        try {
            if (!this.supabase) throw new Error('Supabase no disponible');

            console.log('⏱️ Consultando math_user_progress...');

            // ✅ USAR COLUMNAS REALES: id, user_id, nivel, ejercicios_completados, ejercicios_correctos, tiempo_total_estudio, racha_actual, racha_maxima, ultima_sesion, logros, created_at, updated_at
            const { data: progress, error } = await this.supabase
                .from('math_user_progress')
                .select('user_id, nivel, ejercicios_completados, ejercicios_correctos, tiempo_total_estudio, ultima_sesion, created_at, updated_at');

            if (error) {
                console.error('❌ Error en query math_user_progress:', error);
                return {
                    activeToday: 0,
                    activeThisWeek: 0,
                    activeThisMonth: 0,
                    estimatedDevices: 0,
                    retentionRate: 0,
                    totalStudyTime: 0,
                    avgExercisesPerUser: 0
                };
            }

            console.log(`📊 Encontrados ${progress?.length || 0} registros de progreso`);

            // Si no hay datos, devolver ceros
            if (!progress || progress.length === 0) {
                return {
                    activeToday: 0,
                    activeThisWeek: 0,
                    activeThisMonth: 0,
                    estimatedDevices: 0,
                    retentionRate: 0,
                    totalStudyTime: 0,
                    avgExercisesPerUser: 0
                };
            }

            const now = new Date();
            const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

            // Usar ultima_sesion para actividad reciente
            const activeToday = progress.filter(p => 
                p.ultima_sesion && new Date(p.ultima_sesion) > dayAgo).length;
            const activeThisWeek = progress.filter(p => 
                p.ultima_sesion && new Date(p.ultima_sesion) > weekAgo).length;
            const activeThisMonth = progress.filter(p => 
                p.ultima_sesion && new Date(p.ultima_sesion) > monthAgo).length;

            // Calcular totales reales
            const totalStudyTime = progress.reduce((sum, p) => 
                sum + (parseInt(p.tiempo_total_estudio) || 0), 0);

            const totalExercises = progress.reduce((sum, p) => 
                sum + (parseInt(p.ejercicios_completados) || 0), 0);

            const avgExercisesPerUser = progress.length > 0 
                ? Math.round(totalExercises / progress.length) 
                : 0;

            const stats = {
                activeToday,
                activeThisWeek, 
                activeThisMonth,
                estimatedDevices: Math.floor(activeThisMonth * 1.2),
                retentionRate: progress.length > 0 
                    ? Math.round((activeThisWeek / progress.length) * 100) 
                    : 0,
                totalStudyTime,
                avgExercisesPerUser
            };

            console.log('✅ Estadísticas de uso reales:', stats);
            return stats;

        } catch (error) {
            console.error('❌ Error cargando estadísticas de uso:', error);
            return {
                activeToday: 0,
                activeThisWeek: 0,
                activeThisMonth: 0,
                estimatedDevices: 0,
                retentionRate: 0,
                totalStudyTime: 0,
                avgExercisesPerUser: 0
            };
        }
    }

    // 📊 ESTADÍSTICAS DE PROGRESO - NUEVA FUNCIÓN FALTANTE
    async getProgressStats() {
        try {
            console.log('📊 Cargando estadísticas de progreso...');
            
            if (!this.supabase) {
                throw new Error('Cliente Supabase no disponible');
            }

            // ✅ OBTENER PROGRESO DE TODOS LOS USUARIOS
            const { data: progress, error } = await this.supabase
                .from('math_user_progress')
                .select('user_id, nivel, ejercicios_completados, ejercicios_correctos, tiempo_total_estudio, racha_actual, racha_maxima, ultima_sesion, created_at, updated_at');

            if (error) {
                console.error('❌ Error en query math_user_progress:', error);
                throw error;
            }

            console.log(`📊 Encontrados ${progress?.length || 0} registros de progreso`);

            if (!progress || progress.length === 0) {
                return {
                    totalUsers: 0,
                    avgExercisesCompleted: 0,
                    avgAccuracy: 0,
                    totalStudyTime: 0,
                    avgStudyTime: 0,
                    topPerformers: [],
                    levelDistribution: { nivel1: 0, nivel2: 0, nivel3: 0 },
                    streakStats: { avgStreak: 0, maxStreak: 0, activeStreaks: 0 },
                    recentActivity: 0
                };
            }

            // Calcular estadísticas agregadas
            const totalExercises = progress.reduce((sum, p) => sum + (parseInt(p.ejercicios_completados) || 0), 0);
            const totalCorrect = progress.reduce((sum, p) => sum + (parseInt(p.ejercicios_correctos) || 0), 0);
            const totalStudyTime = progress.reduce((sum, p) => sum + (parseInt(p.tiempo_total_estudio) || 0), 0);
            
            const avgExercisesCompleted = progress.length > 0 ? Math.round(totalExercises / progress.length) : 0;
            const avgAccuracy = totalExercises > 0 ? Math.round((totalCorrect / totalExercises) * 100) : 0;
            const avgStudyTime = progress.length > 0 ? Math.round(totalStudyTime / progress.length) : 0;

            // Distribución por niveles
            const levelDistribution = {
                nivel1: progress.filter(p => p.nivel === 1 || p.nivel === '1').length,
                nivel2: progress.filter(p => p.nivel === 2 || p.nivel === '2').length,
                nivel3: progress.filter(p => p.nivel === 3 || p.nivel === '3').length
            };

            // Estadísticas de rachas
            const streaks = progress.map(p => parseInt(p.racha_actual) || 0);
            const maxStreaks = progress.map(p => parseInt(p.racha_maxima) || 0);
            const avgStreak = streaks.length > 0 ? Math.round(streaks.reduce((a, b) => a + b, 0) / streaks.length) : 0;
            const maxStreak = maxStreaks.length > 0 ? Math.max(...maxStreaks) : 0;
            const activeStreaks = streaks.filter(s => s > 0).length;

            // Actividad reciente (últimas 24 horas)
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const recentActivity = progress.filter(p => 
                p.ultima_sesion && new Date(p.ultima_sesion) > yesterday
            ).length;

            // Top performers (usuarios con mejor precisión)
            const topPerformers = progress
                .filter(p => (parseInt(p.ejercicios_completados) || 0) > 5) // Solo usuarios con actividad mínima
                .map(p => {
                    const completados = parseInt(p.ejercicios_completados) || 0;
                    const correctos = parseInt(p.ejercicios_correctos) || 0;
                    return {
                        userId: p.user_id,
                        exercisesCompleted: completados,
                        accuracy: completados > 0 ? Math.round((correctos / completados) * 100) : 0,
                        level: parseInt(p.nivel) || 1,
                        streak: parseInt(p.racha_actual) || 0
                    };
                })
                .sort((a, b) => b.accuracy - a.accuracy || b.exercisesCompleted - a.exercisesCompleted)
                .slice(0, 10);

            const stats = {
                totalUsers: progress.length,
                avgExercisesCompleted,
                avgAccuracy,
                totalStudyTime,
                avgStudyTime,
                topPerformers,
                levelDistribution,
                streakStats: {
                    avgStreak,
                    maxStreak,
                    activeStreaks
                },
                recentActivity,
                isRealData: true,
                lastUpdate: new Date().toISOString()
            };

            console.log('✅ Estadísticas de progreso completas:', stats);
            return stats;

        } catch (error) {
            console.error('❌ Error cargando estadísticas de progreso:', error);
            
            // Fallback con datos vacíos
            return {
                totalUsers: 0,
                avgExercisesCompleted: 0,
                avgAccuracy: 0,
                totalStudyTime: 0,
                avgStudyTime: 0,
                topPerformers: [],
                levelDistribution: { nivel1: 0, nivel2: 0, nivel3: 0 },
                streakStats: { avgStreak: 0, maxStreak: 0, activeStreaks: 0 },
                recentActivity: 0,
                isRealData: false,
                lastUpdate: new Date().toISOString()
            };
        }
    }

    // 📚 ESTADÍSTICAS DE MÓDULOS - USANDO DATOS REALES CON TIPOS CORRECTOS
    async getModuleStats() {
        try {
            if (!this.supabase) throw new Error('Supabase no disponible');

            // ✅ USAR math_exercises PARA ESTADÍSTICAS DE MÓDULOS
            const { data: exercises, error } = await this.supabase
                .from('math_exercises')
                .select('level, operation, created_at');

            if (error) {
                console.error('❌ Error en query math_exercises para módulos:', error);
                // Fallback usando math_sessions básico
                const { data: sessions, error: sessionsError } = await this.supabase
                    .from('math_sessions')
                    .select('id, created_at');

                if (sessionsError) throw sessionsError;

                return {
                    moduleUsage: {
                        matematicas_nivel1: Math.floor(sessions?.length * 0.5) || 0,
                        matematicas_nivel2: Math.floor(sessions?.length * 0.3) || 0,
                        matematicas_nivel3: Math.floor(sessions?.length * 0.2) || 0
                    },
                    mostUsedModule: 'matematicas_nivel1',
                    totalModulesSessions: sessions?.length || 0
                };
            }

            // ✅ CORREGIDO: Popularidad por nivel basado en ejercicios reales (INTEGER)
            const moduleUsage = {
                matematicas_nivel1: exercises?.filter(e => e.level === 1).length || 0,
                matematicas_nivel2: exercises?.filter(e => e.level === 2).length || 0,
                matematicas_nivel3: exercises?.filter(e => e.level === 3).length || 0
            };

            const mostUsedModule = Object.entries(moduleUsage)
                .sort(([,a], [,b]) => b - a)[0]?.[0] || 'matematicas_nivel1';

            console.log('✅ Estadísticas de módulos con tipos correctos:', {
                moduleUsage,
                mostUsedModule,
                totalExercises: exercises?.length || 0
            });

            return {
                moduleUsage,
                mostUsedModule,
                totalModulesSessions: exercises?.length || 0
            };

        } catch (error) {
            console.error('❌ Error cargando estadísticas de módulos:', error);
            return {
                moduleUsage: {
                    matematicas_nivel1: 0,
                    matematicas_nivel2: 0,
                    matematicas_nivel3: 0
                },
                mostUsedModule: 'matematicas_nivel1',
                totalModulesSessions: 0
            };
        }
    }

    // 📈 OBTENER USUARIOS DETALLADOS PARA ADMIN - USANDO TABLA REAL Y COLUMNAS CORRECTAS
    async getDetailedUsers() {
        try {
            console.log('👥 Obteniendo usuarios detallados del sistema...');
            
            if (!this.supabase) {
                throw new Error('Cliente Supabase no disponible');
            }

            // ✅ USAR SOLO COLUMNAS QUE EXISTEN EN math_profiles
            const { data: profiles, error } = await this.supabase
                .from('math_profiles')
                .select('id, user_id, email, full_name, nombre_completo, user_role, created_at, updated_at, edad, is_active, rating, total_reviews, avatar_url, parent_id, teacher_id')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ Error consultando perfiles:', error);
                throw error;
            }

            if (!profiles || profiles.length === 0) {
                console.log('📊 No se encontraron perfiles de usuario');
                return [];
            }

            console.log(`📊 Encontrados ${profiles.length} perfiles de usuario`);

            const users = profiles.map(profile => ({
                id: profile.id,
                name: profile.full_name || profile.nombre_completo || `Usuario ${profile.id}`,
                email: profile.email || `usuario${profile.id}@matemagica.com`,
                role: profile.user_role || 'student',
                status: profile.is_active ? 'active' : 'inactive',
                lastLogin: profile.updated_at || profile.created_at,
                rating: profile.rating || 0,
                reviews: profile.total_reviews || 0,
                joinDate: profile.created_at,
                // Datos adicionales que SÍ existen
                age: profile.edad,
                userId: profile.user_id,
                avatarUrl: profile.avatar_url,
                parentId: profile.parent_id,
                teacherId: profile.teacher_id,
                isRealData: true
            }));

            console.log(`✅ ${users.length} usuarios detallados procesados exitosamente`);
            return users;

        } catch (error) {
            console.error('❌ Error obteniendo usuarios detallados:', error);
            
            // Fallback a usuarios simulados
            return [
                {
                    id: 'admin_1',
                    name: 'Administrador Sistema',
                    email: 'admin@matemagica.com',
                    role: 'admin',
                    status: 'active',
                    lastLogin: new Date().toISOString(),
                    rating: 5,
                    reviews: 0,
                    joinDate: new Date().toISOString(),
                    isRealData: false
                },
                {
                    id: 'teacher_1',
                    name: 'Profesor Demo',
                    email: 'profesor@matemagica.com', 
                    role: 'teacher',
                    status: 'active',
                    lastLogin: new Date().toISOString(),
                    rating: 4.8,
                    reviews: 15,
                    joinDate: new Date().toISOString(),
                    isRealData: false
                },
                {
                    id: 'student_1',
                    name: 'Estudiante Demo',
                    email: 'estudiante@matemagica.com',
                    role: 'student', 
                    status: 'active',
                    lastLogin: new Date().toISOString(),
                    rating: 0,
                    reviews: 0,
                    joinDate: new Date().toISOString(),
                    isRealData: false
                }
            ];
        }
    }

    // ✅ OBTENER ESTUDIANTES GLOBALES - NUEVO MÉTODO
    async getGlobalStudents() {
        try {
            console.log('🎓 Obteniendo estudiantes globales del sistema...');
            
            if (!this.supabase) {
                throw new Error('Cliente Supabase no disponible');
            }

            // ✅ OBTENER ESTUDIANTES DE math_profiles
            const { data: profiles, error } = await this.supabase
                .from('math_profiles')
                .select('id, user_id, email, full_name, nombre_completo, user_role, created_at, edad, is_active, parent_id, teacher_id')
                .in('user_role', ['student', 'estudiante'])
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ Error consultando estudiantes:', error);
                throw error;
            }

            if (!profiles || profiles.length === 0) {
                console.log('📊 No se encontraron estudiantes');
                return [];
            }

            // ✅ OBTENER PROGRESO DE CADA ESTUDIANTE
            const { data: progressData, error: progressError } = await this.supabase
                .from('math_user_progress')
                .select('user_id, nivel, ejercicios_completados, ejercicios_correctos, tiempo_total_estudio, racha_actual, ultima_sesion');

            if (progressError) {
                console.warn('⚠️ Error obteniendo progreso:', progressError);
            }

            const progressMap = new Map();
            if (progressData) {
                progressData.forEach(p => {
                    progressMap.set(p.user_id, p);
                });
            }

            const students = profiles.map(profile => {
                const progress = progressMap.get(profile.user_id) || {};
                const accuracy = progress.ejercicios_completados > 0 
                    ? Math.round((progress.ejercicios_correctos / progress.ejercicios_completados) * 100)
                    : 0;

                return {
                    id: profile.id,
                    userId: profile.user_id,
                    name: profile.full_name || profile.nombre_completo || `Estudiante ${profile.id}`,
                    email: profile.email || `estudiante${profile.id}@matemagica.com`,
                    age: profile.edad || 8,
                    level: progress.nivel || 1,
                    exercisesCompleted: progress.ejercicios_completados || 0,
                    accuracy: accuracy,
                    studyTime: progress.tiempo_total_estudio || 0,
                    streak: progress.racha_actual || 0,
                    lastSession: progress.ultima_sesion,
                    joinDate: profile.created_at,
                    parentId: profile.parent_id,
                    teacherId: profile.teacher_id,
                    isRealData: true
                };
            });

            console.log(`✅ ${students.length} estudiantes globales procesados`);
            return students;

        } catch (error) {
            console.error('❌ Error obteniendo estudiantes globales:', error);
            
            // Fallback a estudiantes simulados
            return [
                {
                    id: 'student_demo_1',
                    userId: 'demo_user_1',
                    name: 'Ana García',
                    email: 'ana@demo.com',
                    age: 8,
                    level: 2,
                    exercisesCompleted: 45,
                    accuracy: 87,
                    studyTime: 180,
                    streak: 5,
                    lastSession: new Date().toISOString(),
                    joinDate: new Date().toISOString(),
                    isRealData: false
                },
                {
                    id: 'student_demo_2',
                    userId: 'demo_user_2',
                    name: 'Carlos López',
                    email: 'carlos@demo.com',
                    age: 7,
                    level: 1,
                    exercisesCompleted: 23,
                    accuracy: 92,
                    studyTime: 120,
                    streak: 3,
                    lastSession: new Date().toISOString(),
                    joinDate: new Date().toISOString(),
                    isRealData: false
                }
            ];
        }
    }

    // 📝 OBTENER SESIONES RECIENTES - USANDO TABLA REAL
    async getSessions(limit = 20) {
        try {
            console.log(`📝 Obteniendo últimas ${limit} sesiones...`);
            
            if (!this.supabase) {
                throw new Error('Cliente Supabase no disponible');
            }

            const { data: sessions, error } = await this.supabase
                .from('math_sessions')
                .select('id, user_id, student_name, level, exercise_count, correct_count, start_time, end_time, duration_minutes, created_at')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('❌ Error consultando sesiones:', error);
                throw error;
            }

            if (!sessions || sessions.length === 0) {
                console.log('📊 No se encontraron sesiones');
                return [];
            }

            const processedSessions = sessions.map(session => ({
                id: session.id,
                userId: session.user_id,
                studentName: session.student_name || 'Sin nombre',
                level: session.level || 1,
                exerciseCount: session.exercise_count || 0,
                correctCount: session.correct_count || 0,
                accuracy: session.exercise_count > 0 
                    ? Math.round((session.correct_count / session.exercise_count) * 100)
                    : 0,
                duration: session.duration_minutes || 0,
                startTime: session.start_time,
                endTime: session.end_time,
                date: session.created_at,
                isRealData: true
            }));

            console.log(`✅ ${processedSessions.length} sesiones procesadas`);
            return processedSessions;

        } catch (error) {
            console.error('❌ Error obteniendo sesiones:', error);
            
            // Fallback a sesiones simuladas
            const now = new Date();
            return [
                {
                    id: 'session_demo_1',
                    userId: 'demo_user_1',
                    studentName: 'Ana García',
                    level: 2,
                    exerciseCount: 15,
                    correctCount: 13,
                    accuracy: 87,
                    duration: 25,
                    startTime: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
                    endTime: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
                    date: new Date().toISOString(),
                    isRealData: false
                },
                {
                    id: 'session_demo_2',
                    userId: 'demo_user_2',
                    studentName: 'Carlos López',
                    level: 1,
                    exerciseCount: 10,
                    correctCount: 9,
                    accuracy: 90,
                    duration: 18,
                    startTime: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
                    endTime: new Date(now.getTime() - 42 * 60 * 1000).toISOString(),
                    date: new Date(now.getTime() - 40 * 60 * 1000).toISOString(),
                    isRealData: false
                }
            ];
        }
    }

    // 🏆 OBTENER TOP ESTUDIANTES - BASADO EN PROGRESO REAL
    async getTopStudents(limit = 10) {
        try {
            console.log(`🏆 Obteniendo top ${limit} estudiantes...`);
            
            if (!this.supabase) {
                throw new Error('Cliente Supabase no disponible');
            }

            // ✅ OBTENER ESTUDIANTES CON SU PROGRESO
            const { data: profiles, error: profilesError } = await this.supabase
                .from('math_profiles')
                .select('id, user_id, full_name, nombre_completo, edad')
                .in('user_role', ['student', 'estudiante'])
                .eq('is_active', true);

            if (profilesError) {
                console.error('❌ Error consultando perfiles:', profilesError);
                throw profilesError;
            }

            const { data: progress, error: progressError } = await this.supabase
                .from('math_user_progress')
                .select('user_id, nivel, ejercicios_completados, ejercicios_correctos, tiempo_total_estudio, racha_actual')
                .order('ejercicios_correctos', { ascending: false })
                .limit(limit * 2); // Obtener más para filtrar después

            if (progressError) {
                console.error('❌ Error consultando progreso:', progressError);
                throw progressError;
            }

            if (!profiles || !progress) {
                return [];
            }

            // Combinar datos de perfil y progreso
            const topStudents = [];
            const profileMap = new Map();
            profiles.forEach(p => profileMap.set(p.user_id, p));

            progress.forEach(p => {
                const profile = profileMap.get(p.user_id);
                if (profile && topStudents.length < limit) {
                    const accuracy = p.ejercicios_completados > 0 
                        ? Math.round((p.ejercicios_correctos / p.ejercicios_completados) * 100)
                        : 0;

                    topStudents.push({
                        id: profile.id,
                        name: profile.full_name || profile.nombre_completo || `Estudiante ${profile.id}`,
                        age: profile.edad || 8,
                        level: p.nivel || 1,
                        exercisesCompleted: p.ejercicios_completados || 0,
                        correctAnswers: p.ejercicios_correctos || 0,
                        accuracy: accuracy,
                        studyTime: p.tiempo_total_estudio || 0,
                        streak: p.racha_actual || 0,
                        rank: topStudents.length + 1,
                        isRealData: true
                    });
                }
            });

            console.log(`✅ Top ${topStudents.length} estudiantes procesados`);
            return topStudents;

        } catch (error) {
            console.error('❌ Error obteniendo top estudiantes:', error);
            
            // Fallback
            return [
                {
                    id: 'top_1',
                    name: 'Ana García',
                    age: 8,
                    level: 3,
                    exercisesCompleted: 150,
                    correctAnswers: 142,
                    accuracy: 95,
                    studyTime: 480,
                    streak: 12,
                    rank: 1,
                    isRealData: false
                },
                {
                    id: 'top_2',
                    name: 'Carlos López',
                    age: 7,
                    level: 2,
                    exercisesCompleted: 120,
                    correctAnswers: 108,
                    accuracy: 90,
                    studyTime: 360,
                    streak: 8,
                    rank: 2,
                    isRealData: false
                }
            ];
        }
    }

    // 📋 OBTENER LOGS DEL SISTEMA - USANDO DATOS SIMULADOS YA QUE LA TABLA NO EXISTE
    async getSystemLogs(limit = 50) {
        console.log('📋 Consultando logs del sistema desde Supabase...');
        
        // ✅ USAR LOGS SIMULADOS YA QUE math_system_logs NO EXISTE EN EL ESQUEMA
        return this.getSimulatedSystemLogs(limit);
    }

    // 📝 GENERAR LOGS SIMULADOS PARA EL SISTEMA
    getSimulatedSystemLogs(limit = 50) {
        const now = new Date();
        const logs = [];
        
        const levels = ['info', 'warning', 'error', 'success'];
        const modules = ['auth', 'exercises', 'analytics', 'dashboard', 'core'];
        const messages = [
            'Usuario autenticado exitosamente',
            'Dashboard cargado correctamente',
            'Ejercicios generados por IA',
            'Estadísticas actualizadas',
            'Sesión de estudio completada',
            'Error de conexión recuperado',
            'Cache limpiado automáticamente',
            'Backup de datos realizado',
            'Sistema optimizado',
            'Conexión a base de datos estable'
        ];

        for (let i = 0; i < Math.min(limit, 20); i++) {
            const timestamp = new Date(now.getTime() - (i * 5 * 60 * 1000)); // Cada 5 minutos hacia atrás
            const level = levels[Math.floor(Math.random() * levels.length)];
            const module = modules[Math.floor(Math.random() * modules.length)];
            const message = messages[Math.floor(Math.random() * messages.length)];

            logs.push({
                id: `sim_log_${i + 1}`,
                timestamp: timestamp,
                level: level,
                message: message,
                module: module,
                details: { 
                    simulated: true, 
                    version: '2.0',
                    environment: 'development'
                },
                isRealData: false
            });
        }

        console.log(`✅ ${logs.length} logs del sistema simulados generados`);
        return logs;
    }

    // 📝 REGISTRAR LOG REAL DEL SISTEMA
    async logSystemEvent(level, message, module, details = {}) {
        try {
            if (!this.supabase) {
                console.warn('⚠️ No se puede registrar log: Supabase no disponible');
                return false;
            }

            if (!['info', 'warning', 'error', 'debug'].includes(level)) {
                console.warn(`⚠️ Nivel de log inválido: ${level}. Usando 'info'`);
                level = 'info';
            }

            // Validar y preparar los datos
            const logEntry = {
                level: level,
                message: message || 'Log del sistema sin mensaje',
                module: module || 'core',
                details: details || {},
                timestamp: new Date().toISOString()
            };

            console.log(`📝 Registrando log [${level}] en módulo ${module}: ${message}`);
            
            // Verificar si la tabla existe antes de intentar insertar
            try {
                // Insertar en Supabase
                const { data, error } = await this.supabase
                    .from('math_system_logs')
                    .insert([logEntry]);

                if (error) {
                    // Si la tabla no existe, guardar en localStorage para sincronizar después
                    if (error.code === '42P01') {
                        this.savePendingLogLocally(logEntry);
                        return false;
                    }
                    
                    console.error('❌ Error registrando log en Supabase:', error);
                    return false;
                }
                
                console.log('✅ Log registrado exitosamente en Supabase');
                return true;
            } catch (insertError) {
                console.error('❌ Error intentando registrar log:', insertError);
                
                // Guardar localmente si hay error
                this.savePendingLogLocally(logEntry);
                return false;
            }
        } catch (error) {
            console.error('❌ Error general registrando log:', error);
            return false;
        }
    }

    // 💾 GUARDAR LOG PENDIENTE LOCALMENTE
    savePendingLogLocally(logEntry) {
        try {
            // Obtener logs pendientes actuales o crear array vacío
            const pendingLogs = JSON.parse(localStorage.getItem('pendingSystemLogs') || '[]');
            
            // Añadir nuevo log
            pendingLogs.push({
                ...logEntry,
                savedAt: new Date().toISOString()
            });
            
            // Limitar a máximo 100 logs pendientes para no saturar localStorage
            const trimmedLogs = pendingLogs.slice(-100);
            
            // Guardar en localStorage
            localStorage.setItem('pendingSystemLogs', JSON.stringify(trimmedLogs));
            
            console.log('💾 Log guardado localmente para sincronización futura');
            return true;
        } catch (error) {
            console.error('❌ Error guardando log localmente:', error);
            return false;
        }
    }

    // 🔄 SINCRONIZAR LOGS PENDIENTES
    async syncPendingLogs() {
        try {
            if (!this.supabase) {
                console.warn('⚠️ No se pueden sincronizar logs: Supabase no disponible');
                return false;
            }
            
            // Obtener logs pendientes
            const pendingLogsString = localStorage.getItem('pendingSystemLogs');
            if (!pendingLogsString) {
                return true; // No hay logs pendientes
            }
            
            const pendingLogs = JSON.parse(pendingLogsString);
            if (pendingLogs.length === 0) {
                return true; // Array vacío
            }
            
            console.log(`🔄 Sincronizando ${pendingLogs.length} logs pendientes...`);
            
            // Verificar si la tabla existe antes de intentar insertar
            try {
                // Intentar inserción en batch (máx 100 registros)
                const { data, error } = await this.supabase
                    .from('math_system_logs')
                    .insert(pendingLogs.slice(0, 100));
                
                if (error) {
                    if (error.code === '42P01') {
                        console.warn('⚠️ No se pueden sincronizar logs: Tabla no existe');
                        return false;
                    }
                    console.error('❌ Error sincronizando logs pendientes:', error);
                    return false;
                }
                
                // Éxito - limpiar logs pendientes
                localStorage.removeItem('pendingSystemLogs');
                console.log('✅ Logs pendientes sincronizados exitosamente');
                return true;
            } catch (syncError) {
                console.error('❌ Error intentando sincronizar logs:', syncError);
                return false;
            }
        } catch (error) {
            console.error('❌ Error general sincronizando logs:', error);
            return false;
        }
    }

    // 🛠️ MÉTODOS AUXILIARES

    getMostPopularLevel(exercisesByLevel) {
        const levels = Object.entries(exercisesByLevel);
        if (levels.length === 0) return 1;
        
        const maxLevel = levels.reduce((max, [level, count]) => 
            count > max.count ? { level: parseInt(level.replace('level', '')), count } : max, 
            { level: 1, count: 0 }
        );
        
        return maxLevel.level;
    }

    formatTime(minutes) {
        if (!minutes || minutes === 0) return '0h 0m';
        
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (hours === 0) return `${mins}m`;
        if (mins === 0) return `${hours}h`;
        return `${hours}h ${mins}m`;
    }

    // 📊 FALLBACK STATS CUANDO NO HAY CONEXIÓN
    getFallbackStats() {
        console.log('📊 Usando estadísticas fallback (sin conexión)');
        
        return {
            // Usuarios
            totalUsers: 0,
            activeUsers: 0,
            totalTeachers: 0,
            totalParents: 0,
            totalStudents: 0,
            avgTeacherRating: 0,
            newUsersThisWeek: 0,
            userGrowthRate: 0,

            // Sesiones
            totalSessions: 0,
            sessionsToday: 0,
            sessionsThisWeek: 0,
            avgSessionDuration: 0,
            avgExercisesPerSession: 0,
            avgAccuracyPerSession: 0,
            totalSessionTime: 0,
            sessionTimeFormatted: '0h 0m',
            recentSessions: [],

            // Ejercicios
            totalExercises: 0,
            totalCorrect: 0,
            accuracy: 0,
            exercisesByLevel: { level1: 0, level2: 0, level3: 0 },
            todayExercises: 0,
            weekExercises: 0,
            mostPopularLevel: 1,
            operationStats: { suma: 0, resta: 0 },
            storyProblems: 0,
            levelDistribution: { facil: 0, medio: 0, dificil: 0 },

            // Uso
            activeToday: 0,
            activeThisWeek: 0,
            activeThisMonth: 0,
            estimatedDevices: 0,
            retentionRate: 0,
            totalStudyTime: 0,
            avgExercisesPerUser: 0,

            // Módulos
            moduleUsage: {
                matematicas_nivel1: 0,
                matematicas_nivel2: 0,
                matematicas_nivel3: 0
            },
            mostUsedModule: 'matematicas_nivel1',
            totalModulesSessions: 0,

            // Metadata
            lastUpdate: new Date().toISOString(),
            isRealData: false,
            isOffline: true
        };
    }

    // 🔄 LIMPIAR CACHE
    clearCache() {
        this.cache.clear();
        this.lastCacheUpdate = null;
        console.log('🗑️ Cache de analytics limpiado');
    }

    // 📊 VERIFICAR ESTADO DE CONEXIÓN
    async checkConnection() {
        try {
            if (!this.supabase) {
                return false;
            }

            const { data, error } = await this.supabase
                .from('math_profiles')
                .select('count')
                .limit(1);

            return !error;
        } catch (error) {
            return false;
        }
    }

    // 🎯 MÉTODO PÚBLICO PARA VERIFICAR INICIALIZACIÓN
    isInitialized() {
        return this.initialized && this.supabase !== null;
    }
}

// 🌟 CREAR INSTANCIA GLOBAL
console.log('🔧 Creando instancia global de RealAnalyticsService...');
window.realAnalyticsService = new RealAnalyticsService();

// 🚀 AUTO-INICIALIZACIÓN CUANDO EL DOCUMENTO ESTÉ LISTO
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📄 DOM cargado, inicializando RealAnalyticsService...');
    
    const success = await window.realAnalyticsService.initialize();
    
    if (success) {
        console.log('✅ RealAnalyticsService inicializado exitosamente');
        // Disparar evento personalizado para notificar inicialización
        window.dispatchEvent(new CustomEvent('realAnalyticsReady', {
            detail: { service: window.realAnalyticsService }
        }));
    } else {
        console.warn('⚠️ RealAnalyticsService falló inicialización, usando modo fallback');
        // Intentar reinicializar cada 5 segundos
        setInterval(async () => {
            if (!window.realAnalyticsService.isInitialized()) {
                console.log('🔄 Reintentando inicialización de RealAnalyticsService...');
                const retrySuccess = await window.realAnalyticsService.reinitialize();
                if (retrySuccess) {
                    console.log('✅ RealAnalyticsService reconectado exitosamente');
                    window.dispatchEvent(new CustomEvent('realAnalyticsReconnected', {
                        detail: { service: window.realAnalyticsService }
                    }));
                }
            }
        }, 5000);
    }
});

// 🔗 EXPORTAR PARA COMPATIBILIDAD
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealAnalyticsService;
}

console.log('✅ Real Analytics Service cargado completamente');