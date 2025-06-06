// Configuración de Supabase para Matemágica
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_OPTIONS, isSupabaseConfigured, CONFIG_MESSAGES } from './supabase-credentials.js';

// Verificar configuración al cargar
if (!isSupabaseConfigured()) {
    console.warn(CONFIG_MESSAGES.notConfigured);
}

// Crear cliente de Supabase usando la librería global cargada desde CDN
const supabaseClient = window.supabase?.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_OPTIONS);

// Verificar que Supabase esté disponible
if (!window.supabase) {
    console.error('❌ Supabase no está cargado. Verifica que el CDN esté incluido en el HTML.');
}

// Configuraciones específicas para Matemágica
export const SUPABASE_CONFIG = {
    // Tablas con prefijo "math_" para evitar confusiones
    TABLES: {
        PROFILES: 'math_profiles',
        EXERCISE_SESSIONS: 'math_exercise_sessions',
        STORY_ATTEMPTS: 'math_story_attempts',
        USER_PROGRESS: 'math_user_progress'
    },
    
    // Avatares predefinidos para niños
    AVATARS: [
        '🦄', '🐱', '🐶', '🐸', '🦋', '🌟', '🍎', '🎨',
        '🚀', '⚽', '🎵', '🌈', '🎯', '🎪', '🎁', '🌺'
    ],
    
    // Políticas de seguridad
    SECURITY: {
        MIN_PASSWORD_LENGTH: 6,
        MAX_NAME_LENGTH: 50,
        SESSION_DURATION: 7 * 24 * 60 * 60 * 1000 // 7 días
    }
}

// Funciones de autenticación
export const authService = {
    // Registro simple para niños con email y nombre
    async signUpChild(email, password, childName) {
        try {
            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        display_name: childName,
                        user_type: 'student'
                    }
                }
            });
            
            if (error) throw error;
            
            // Crear perfil inicial se maneja automáticamente por el trigger en la BD
            return { success: true, user: data.user };
        } catch (error) {
            console.error('Error en registro:', error);
            return { success: false, error: error.message };
        }
    },

    // Login
    async signIn(email, password) {
        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            return { success: true, user: data.user };
        } catch (error) {
            console.error('Error en login:', error);
            return { success: false, error: error.message };
        }
    },

    // Logout
    async signOut() {
        const { error } = await supabaseClient.auth.signOut();
        if (error) console.error('Error en logout:', error);
        return !error;
    },

    // Obtener usuario actual
    async getCurrentUser() {
        const { data: { user } } = await supabaseClient.auth.getUser();
        return user;
    }
};

// Funciones para manejar perfiles de estudiantes
export const profileService = {
    // Obtener perfil completo
    async getProfile(userId) {
        try {
            const { data, error } = await supabaseClient
                .from(SUPABASE_CONFIG.TABLES.PROFILES)
                .select('*')
                .eq('id', userId)
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error obteniendo perfil:', error);
            return null;
        }
    },

    // Actualizar perfil
    async updateProfile(userId, updates) {
        try {
            const { data, error } = await supabaseClient
                .from(SUPABASE_CONFIG.TABLES.PROFILES)
                .update(updates)
                .eq('id', userId);
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error actualizando perfil:', error);
            throw error;
        }
    },

    // Actualizar estadísticas después de ejercicios
    async updateStats(userId, isCorrect) {
        try {
            const profile = await this.getProfile(userId);
            if (!profile) return;

            const updates = {
                total_exercises: profile.total_exercises + 1,
                correct_answers: isCorrect ? profile.correct_answers + 1 : profile.correct_answers,
                updated_at: new Date().toISOString()
            };

            await this.updateProfile(userId, updates);
        } catch (error) {
            console.error('Error actualizando estadísticas:', error);
        }
    }
};

// Funciones para guardar progreso de ejercicios
export const progressService = {
    // Guardar sesión de ejercicios
    async saveExerciseSession(userId, exerciseData) {
        try {
            const { data, error } = await supabaseClient
                .from(SUPABASE_CONFIG.TABLES.EXERCISE_SESSIONS)
                .insert({
                    user_id: userId,
                    level: exerciseData.level,
                    additions_count: exerciseData.additions_count,
                    subtractions_count: exerciseData.subtractions_count,
                    session_date: new Date().toISOString(),
                    exercises_data: exerciseData.exercises
                });
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error guardando sesión:', error);
        }
    },

    // Guardar intento de cuento
    async saveStoryAttempt(userId, storyData) {
        try {
            const { data, error } = await supabaseClient
                .from(SUPABASE_CONFIG.TABLES.STORY_ATTEMPTS)
                .insert({
                    user_id: userId,
                    story_text: storyData.story_text,
                    operation: storyData.operation,
                    num1: storyData.num1,
                    num2: storyData.num2,
                    user_answer: storyData.user_answer,
                    correct_answer: storyData.correct_answer,
                    is_correct: storyData.is_correct,
                    attempt_date: new Date().toISOString()
                });
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error guardando cuento:', error);
        }
    },

    // Obtener historial de sesiones
    async getExerciseHistory(userId, limit = 10) {
        try {
            const { data, error } = await supabaseClient
                .from(SUPABASE_CONFIG.TABLES.EXERCISE_SESSIONS)
                .select('*')
                .eq('user_id', userId)
                .order('session_date', { ascending: false })
                .limit(limit);
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error obteniendo historial:', error);
            return [];
        }
    },

    // Obtener estadísticas del usuario
    async getUserStats(userId) {
        try {
            const profile = await profileService.getProfile(userId);
            const recentSessions = await this.getExerciseHistory(userId, 5);
            
            return {
                profile,
                recentSessions,
                accuracy: profile?.total_exercises > 0 
                    ? Math.round((profile.correct_answers / profile.total_exercises) * 100)
                    : 0
            };
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            return null;
        }
    }
};

// Estado global de autenticación
export let currentUser = null;
export let userProfile = null;

// Escuchar cambios de autenticación
supabaseClient.auth.onAuthStateChange(async (event, session) => {
    console.log('Cambio de autenticación:', event);
    
    if (session?.user) {
        currentUser = session.user;
        userProfile = await profileService.getProfile(session.user.id);
        
        // Disparar evento personalizado para actualizar UI
        window.dispatchEvent(new CustomEvent('userAuthenticated', {
            detail: { user: currentUser, profile: userProfile }
        }));
    } else {
        currentUser = null;
        userProfile = null;
        
        window.dispatchEvent(new CustomEvent('userSignedOut'));
    }
});