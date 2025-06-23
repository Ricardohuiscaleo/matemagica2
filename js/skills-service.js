/**
 * 🎓 SKILLS SERVICE - Sistema de Habilidades y Especialidades para Profesores
 * Matemágica PWA - Servicio para gestionar competencias profesionales
 * Version: 1.0 - Diciembre 2024
 */

// ====================================
// 🎯 CONFIGURACIÓN Y CONSTANTES
// ====================================

const SKILLS_CONFIG = {
    // Categorías principales de habilidades
    categories: {
        matematicas: {
            name: 'Matemáticas',
            icon: '🧮',
            color: 'blue',
            skills: [
                'Aritmética Básica', 'Álgebra', 'Geometría', 'Estadística',
                'Cálculo', 'Números y Operaciones', 'Patrones y Relaciones',
                'Medición', 'Datos y Probabilidades', 'Resolución de Problemas'
            ]
        },
        pedagogia: {
            name: 'Pedagogía',
            icon: '👩‍🏫',
            color: 'green',
            skills: [
                'Metodologías Activas', 'Evaluación Formativa', 'Diferenciación',
                'Aprendizaje Colaborativo', 'Gamificación', 'ABP (Aprendizaje Basado en Proyectos)',
                'Educación Inclusiva', 'Gestión de Aula', 'Motivación Estudiantil'
            ]
        },
        tecnologia: {
            name: 'Tecnología Educativa',
            icon: '💻',
            color: 'purple',
            skills: [
                'Plataformas Digitales', 'Herramientas Interactivas', 'IA en Educación',
                'Realidad Aumentada', 'Videoconferencias', 'LMS', 'Apps Educativas',
                'Programación para Niños', 'Robótica Educativa'
            ]
        },
        comunicacion: {
            name: 'Comunicación',
            icon: '💬',
            color: 'pink',
            skills: [
                'Comunicación Efectiva', 'Feedback Constructivo', 'Presentaciones',
                'Comunicación con Padres', 'Trabajo en Equipo', 'Liderazgo',
                'Resolución de Conflictos', 'Empatía', 'Escucha Activa'
            ]
        },
        especializada: {
            name: 'Áreas Especializadas',
            icon: '🌟',
            color: 'yellow',
            skills: [
                'Necesidades Especiales', 'Superdotación', 'Dificultades de Aprendizaje',
                'Trastornos del Espectro Autista', 'TDAH', 'Bilingüismo',
                'Educación Emocional', 'Mindfulness', 'Primeros Auxilios'
            ]
        }
    },

    // Niveles de experiencia
    experienceLevels: {
        1: { name: 'Principiante', icon: '🌱', color: 'green' },
        2: { name: 'Intermedio', icon: '🌿', color: 'blue' },
        3: { name: 'Avanzado', icon: '🌳', color: 'purple' },
        4: { name: 'Experto', icon: '🏆', color: 'gold' }
    },

    // Años de experiencia predefinidos
    experienceYears: [
        { value: '0-1', label: 'Menos de 1 año' },
        { value: '1-3', label: '1-3 años' },
        { value: '3-5', label: '3-5 años' },
        { value: '5-10', label: '5-10 años' },
        { value: '10+', label: 'Más de 10 años' }
    ],

    // Disponibilidad de horarios
    availability: {
        morning: 'Mañana (8:00 - 12:00)',
        afternoon: 'Tarde (14:00 - 18:00)',
        evening: 'Noche (19:00 - 21:00)',
        weekend: 'Fines de semana'
    }
};

// ====================================
// 🏗️ CLASE PRINCIPAL DEL SERVICIO
// ====================================

class SkillsService {
    constructor(supabase) {
        this.supabase = supabase;
        this.cache = new Map();
        this.initialized = false;
    }

    async initialize() {
        try {
            console.log('🎓 Inicializando Skills Service...');
            
            // Verificar conexión a Supabase
            if (!this.supabase) {
                throw new Error('Supabase client no disponible');
            }

            this.initialized = true;
            console.log('✅ Skills Service inicializado correctamente');
            return true;
            
        } catch (error) {
            console.error('❌ Error inicializando Skills Service:', error);
            return false;
        }
    }

    // ====================================
    // 📋 GESTIÓN DE PERFILES DE PROFESOR
    // ====================================

    async getTeacherProfile(teacherId) {
        try {
            console.log('👩‍🏫 Obteniendo perfil del profesor:', teacherId);

            // Verificar cache primero
            const cacheKey = `teacher_profile_${teacherId}`;
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            // Obtener de Supabase
            const { data, error } = await this.supabase
                .from('teacher_profiles')
                .select('*')
                .eq('teacher_id', teacherId)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
                throw error;
            }

            // Si no existe el perfil, crear uno básico
            const profile = data || this.createDefaultProfile(teacherId);
            
            // Guardar en cache
            this.cache.set(cacheKey, profile);
            
            console.log('✅ Perfil del profesor obtenido');
            return profile;

        } catch (error) {
            console.error('❌ Error obteniendo perfil del profesor:', error);
            
            // Fallback: perfil por defecto
            return this.createDefaultProfile(teacherId);
        }
    }

    async saveTeacherProfile(teacherId, profileData) {
        try {
            console.log('💾 Guardando perfil del profesor:', teacherId);

            // Validar datos
            if (!this.validateProfileData(profileData)) {
                throw new Error('Datos del perfil inválidos');
            }

            // Preparar datos para Supabase
            const dataToSave = {
                teacher_id: teacherId,
                bio: profileData.bio || '',
                years_experience: profileData.yearsExperience || '0-1',
                education: profileData.education || '',
                certifications: profileData.certifications || [],
                specialties: profileData.specialties || [],
                skills: profileData.skills || {},
                availability: profileData.availability || [],
                contact_email: profileData.contactEmail || '',
                phone: profileData.phone || '',
                location: profileData.location || '',
                rate_per_hour: profileData.ratePerHour || null,
                is_available: profileData.isAvailable || true,
                profile_visibility: profileData.profileVisibility || 'public',
                languages: profileData.languages || ['Español'],
                updated_at: new Date().toISOString()
            };

            // Upsert en Supabase
            const { data, error } = await this.supabase
                .from('teacher_profiles')
                .upsert(dataToSave, { 
                    onConflict: 'teacher_id',
                    returning: 'representation'
                })
                .single();

            if (error) throw error;

            // Actualizar cache
            const cacheKey = `teacher_profile_${teacherId}`;
            this.cache.set(cacheKey, data);

            console.log('✅ Perfil del profesor guardado exitosamente');
            return data;

        } catch (error) {
            console.error('❌ Error guardando perfil del profesor:', error);
            throw error;
        }
    }

    // ====================================
    // 🔍 BÚSQUEDA DE PROFESORES
    // ====================================

    async searchTeachers(filters = {}) {
        try {
            console.log('🔍 Buscando profesores con filtros:', filters);

            let query = this.supabase
                .from('teacher_profiles')
                .select(`
                    *,
                    teacher:teacher_id (
                        id,
                        full_name,
                        avatar_url,
                        email
                    )
                `)
                .eq('is_available', true)
                .eq('profile_visibility', 'public');

            // Aplicar filtros
            if (filters.skills && filters.skills.length > 0) {
                query = query.overlaps('specialties', filters.skills);
            }

            if (filters.experience) {
                query = query.eq('years_experience', filters.experience);
            }

            if (filters.location) {
                query = query.ilike('location', `%${filters.location}%`);
            }

            if (filters.availability && filters.availability.length > 0) {
                query = query.overlaps('availability', filters.availability);
            }

            // Ejecutar consulta
            const { data, error } = await query.order('updated_at', { ascending: false });

            if (error) throw error;

            console.log(`✅ ${data.length} profesores encontrados`);
            return data || [];

        } catch (error) {
            console.error('❌ Error buscando profesores:', error);
            return [];
        }
    }

    // ====================================
    // 🎯 GESTIÓN DE SKILLS Y ESPECIALIDADES
    // ====================================

    getSkillsCategories() {
        return SKILLS_CONFIG.categories;
    }

    getSkillsByCategory(categoryKey) {
        const category = SKILLS_CONFIG.categories[categoryKey];
        return category ? category.skills : [];
    }

    getExperienceLevels() {
        return SKILLS_CONFIG.experienceLevels;
    }

    getExperienceYears() {
        return SKILLS_CONFIG.experienceYears;
    }

    getAvailabilityOptions() {
        return SKILLS_CONFIG.availability;
    }

    // ====================================
    // 🛠️ MÉTODOS AUXILIARES
    // ====================================

    createDefaultProfile(teacherId) {
        return {
            teacher_id: teacherId,
            bio: '',
            years_experience: '0-1',
            education: '',
            certifications: [],
            specialties: [],
            skills: {},
            availability: [],
            contact_email: '',
            phone: '',
            location: '',
            rate_per_hour: null,
            is_available: true,
            profile_visibility: 'public',
            languages: ['Español'],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
    }

    validateProfileData(data) {
        // Validaciones básicas
        if (!data || typeof data !== 'object') {
            return false;
        }

        // Bio no debe exceder 500 caracteres
        if (data.bio && data.bio.length > 500) {
            return false;
        }

        // Email debe tener formato válido si se proporciona
        if (data.contactEmail && !this.isValidEmail(data.contactEmail)) {
            return false;
        }

        // Rate per hour debe ser un número positivo si se proporciona
        if (data.ratePerHour && (isNaN(data.ratePerHour) || data.ratePerHour < 0)) {
            return false;
        }

        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    clearCache() {
        this.cache.clear();
        console.log('🧹 Cache del Skills Service limpiado');
    }

    // ====================================
    // 📊 ESTADÍSTICAS Y MÉTRICAS
    // ====================================

    async getTeacherStats(teacherId) {
        try {
            // Esto podría expandirse para incluir estadísticas reales
            // Por ahora, devolver datos básicos
            const profile = await this.getTeacherProfile(teacherId);
            
            return {
                totalSkills: Object.keys(profile.skills || {}).length,
                specialties: (profile.specialties || []).length,
                yearsExperience: profile.years_experience,
                profileCompleteness: this.calculateProfileCompleteness(profile),
                isAvailable: profile.is_available
            };

        } catch (error) {
            console.error('❌ Error obteniendo estadísticas del profesor:', error);
            return {
                totalSkills: 0,
                specialties: 0,
                yearsExperience: '0-1',
                profileCompleteness: 0,
                isAvailable: false
            };
        }
    }

    calculateProfileCompleteness(profile) {
        const fields = [
            'bio', 'education', 'contact_email', 'location',
            'years_experience', 'specialties', 'skills'
        ];
        
        const completedFields = fields.filter(field => {
            const value = profile[field];
            if (Array.isArray(value)) return value.length > 0;
            if (typeof value === 'object') return Object.keys(value).length > 0;
            return value && value.toString().trim().length > 0;
        }).length;

        return Math.round((completedFields / fields.length) * 100);
    }
}

// ====================================
// 🌐 FUNCIÓN DE INICIALIZACIÓN GLOBAL
// ====================================

function initializeSkillsService(supabaseClient) {
    try {
        const service = new SkillsService(supabaseClient);
        
        // Inicializar el servicio
        service.initialize().then(success => {
            if (success) {
                console.log('✅ Skills Service disponible globalmente');
            } else {
                console.warn('⚠️ Skills Service inicializado con limitaciones');
            }
        });

        return service;
        
    } catch (error) {
        console.error('❌ Error creando Skills Service:', error);
        return null;
    }
}

// ====================================
// 📤 EXPORTACIÓN
// ====================================

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.SkillsService = SkillsService;
    window.initializeSkillsService = initializeSkillsService;
    window.SKILLS_CONFIG = SKILLS_CONFIG;
}

// Para módulos ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SkillsService,
        initializeSkillsService,
        SKILLS_CONFIG
    };
}

console.log('✅ Skills Service cargado correctamente');