/**
 * 🔧 CONFIGURACIÓN GLOBAL DEL SISTEMA DE SKILLS CON SKILLS PERSONALIZADAS
 * Matemágica PWA - Configuración centralizada para skills/tags
 * Version: 1.0 - Junio 2025
 */

// ====================================
// 🌐 CONFIGURACIÓN GLOBAL DE SKILLS
// ====================================

window.SKILLS_CONFIG = {
    // URLs y configuración de Supabase
    supabase: {
        url: 'https://uznvakpuuxnpdhoejrog.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bnZha3B1dXhucGRob2Vqcm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxMDA0NjksImV4cCI6MjA0OTY3NjQ2OX0.oixYGaQLYNxq4Ev5Js5lhSz_L5nfUv4-5qCprEhXhpo'
    },

    // Esquema de base de datos real
    database: {
        profilesTable: 'math_profiles',
        skillsCatalogTable: 'math_skills_catalog',
        reviewsTable: 'math_teacher_reviews',
        requestsTable: 'math_teacher_student_requests'
    },

    // ✅ SKILLS PREDEFINIDAS Y PERSONALIZADAS
    skillsCategories: {
        academico: {
            name: 'Académico',
            icon: '🎓',
            color: '#3B82F6',
            allowCustom: true, // Permite agregar skills personalizadas
            skills: ['matematicas', 'lenguaje', 'ciencias', 'historia', 'ingles']
        },
        terapeutico: {
            name: 'Terapéutico', 
            icon: '🩺',
            color: '#10B981',
            allowCustom: true, // Permite agregar skills personalizadas
            skills: ['psicologia', 'fonoaudiologia', 'terapia_ocupacional', 'psicopedagogia']
        },
        evaluacion: {
            name: 'Evaluación',
            icon: '📋',
            color: '#F97316', 
            allowCustom: true, // Permite agregar skills personalizadas
            skills: ['evaluacion_psicologica', 'evaluacion_academica']
        },
        especializado: {
            name: 'Especializado',
            icon: '⭐',
            color: '#8B5CF6',
            allowCustom: true, // Permite agregar skills personalizadas
            skills: ['necesidades_especiales', 'altas_capacidades', 'tecnologia_educativa']
        },
        metodologia: {
            name: 'Metodología',
            icon: '🎯',
            color: '#DC2626',
            allowCustom: true, // Permite agregar skills personalizadas
            skills: ['montessori', 'waldorf', 'aprendizaje_ludico']
        },
        personalizada: {
            name: 'Skills Personalizadas',
            icon: '💡',
            color: '#6366F1',
            allowCustom: true, // Categoría específica para skills personalizadas
            skills: [] // Se llenan dinámicamente
        }
    },

    // Configuración de páginas
    pages: {
        teacherProfile: 'profesor-profile.html',
        teacherSearch: 'buscar-teachers.html',
        dashboard: 'dashboard.html'
    },

    // Roles del sistema (sincronizado con BD)
    roles: {
        TEACHER: 'teacher',
        PARENT: 'parent',
        STUDENT: 'student'
    },

    // Estados de carga
    loadingStates: {
        IDLE: 'idle',
        LOADING: 'loading', 
        SUCCESS: 'success',
        ERROR: 'error'
    },

    // Regiones de Chile para el selector
    regions: [
        { code: 'metropolitana', name: 'Región Metropolitana' },
        { code: 'valparaiso', name: 'Valparaíso' },
        { code: 'biobio', name: 'Biobío' },
        { code: 'araucania', name: 'Araucanía' },
        { code: 'los_lagos', name: 'Los Lagos' },
        { code: 'maule', name: 'Maule' },
        { code: 'coquimbo', name: 'Coquimbo' },
        { code: 'antofagasta', name: 'Antofagasta' },
        { code: 'atacama', name: 'Atacama' },
        { code: 'tarapaca', name: 'Tarapacá' },
        { code: 'arica_parinacota', name: 'Arica y Parinacota' },
        { code: 'ohiggins', name: "O'Higgins" },
        { code: 'los_rios', name: 'Los Ríos' },
        { code: 'aysen', name: 'Aysén' },
        { code: 'magallanes', name: 'Magallanes' }
    ],

    // Configuración de especialización para profesores
    specializations: [
        { code: 'profesor_basica', name: 'Profesor de Educación Básica' },
        { code: 'psicologo', name: 'Psicólogo Infantil' },
        { code: 'fonoaudiologo', name: 'Fonoaudiólogo' },
        { code: 'psicopedagogo', name: 'Psicopedagogo' },
        { code: 'terapeuta_ocupacional', name: 'Terapeuta Ocupacional' },
        { code: 'educador_diferencial', name: 'Educador Diferencial' },
        { code: 'kinesiologo', name: 'Kinesiólogo Infantil' },
        { code: 'nutricionista', name: 'Nutricionista Infantil' }
    ]
};

// ====================================
// 🆕 GESTOR DE SKILLS PERSONALIZADAS
// ====================================

class CustomSkillsManager {
    constructor() {
        this.customSkills = new Map();
        this.userCustomSkills = new Map(); // Skills por usuario
        this.init();
    }

    init() {
        this.loadCustomSkillsFromStorage();
        console.log('✅ Gestor de Skills Personalizadas inicializado');
    }

    // ====================================
    // 💾 GESTIÓN DE ALMACENAMIENTO
    // ====================================

    loadCustomSkillsFromStorage() {
        try {
            // Cargar skills personalizadas globales
            const globalCustom = localStorage.getItem('global_custom_skills');
            if (globalCustom) {
                const skills = JSON.parse(globalCustom);
                if (Array.isArray(skills)) {
                    skills.forEach(skill => {
                        if (skill && skill.skill_code) {
                            this.customSkills.set(skill.skill_code, skill);
                        }
                    });
                }
            }

            // Cargar skills personalizadas por usuario
            const userCustom = localStorage.getItem('user_custom_skills');
            if (userCustom) {
                const userSkills = JSON.parse(userCustom);
                if (userSkills && typeof userSkills === 'object') {
                    Object.entries(userSkills).forEach(([userId, skills]) => {
                        if (Array.isArray(skills)) {
                            this.userCustomSkills.set(userId, new Map(
                                skills.filter(skill => skill && skill.skill_code)
                                     .map(skill => [skill.skill_code, skill])
                            ));
                        }
                    });
                }
            }

            console.log(`📚 Cargadas ${this.customSkills.size} skills personalizadas globales`);
        } catch (error) {
            console.error('❌ Error cargando skills personalizadas:', error);
            this.customSkills = new Map();
            this.userCustomSkills = new Map();
        }
    }

    saveCustomSkillsToStorage() {
        try {
            // Guardar skills globales
            const globalSkills = Array.from(this.customSkills.values());
            localStorage.setItem('global_custom_skills', JSON.stringify(globalSkills));

            // Guardar skills por usuario
            const userSkills = {};
            this.userCustomSkills.forEach((skills, userId) => {
                userSkills[userId] = Array.from(skills.values());
            });
            localStorage.setItem('user_custom_skills', JSON.stringify(userSkills));

            console.log('💾 Skills personalizadas guardadas');
        } catch (error) {
            console.error('❌ Error guardando skills personalizadas:', error);
        }
    }

    // ====================================
    // ➕ CREAR SKILLS PERSONALIZADAS
    // ====================================

    async createCustomSkill(skillData, userId = null) {
        try {
            // Validar datos de entrada
            if (!this.validateSkillData(skillData)) {
                throw new Error('Datos de skill inválidos');
            }

            // Generar código único para la skill
            const skillCode = this.generateSkillCode(skillData.name);
            
            // Crear objeto de skill personalizada
            const customSkill = {
                skill_code: skillCode,
                skill_name: skillData.name,
                category: skillData.category || 'personalizada',
                description: skillData.description || '',
                icon_name: skillData.icon || '💡',
                color_hex: skillData.color || '#6366F1',
                is_custom: true,
                is_active: true,
                created_by: userId,
                created_at: new Date().toISOString(),
                is_public: skillData.isPublic || false
            };

            // Decidir si es global o específica del usuario
            if (skillData.isPublic && this.canCreatePublicSkill(userId)) {
                // Skill pública (disponible para todos)
                this.customSkills.set(skillCode, customSkill);
                console.log(`🌐 Skill pública creada: ${customSkill.skill_name}`);
            } else {
                // Skill privada del usuario
                if (!this.userCustomSkills.has(userId)) {
                    this.userCustomSkills.set(userId, new Map());
                }
                this.userCustomSkills.get(userId).set(skillCode, customSkill);
                console.log(`👤 Skill privada creada para usuario ${userId}: ${customSkill.skill_name}`);
            }

            // Guardar en localStorage
            this.saveCustomSkillsToStorage();

            // TODO: Guardar en Supabase cuando esté conectado
            if (window.SkillsSystemInitializer?.getSkillsService && window.SkillsSystemInitializer.getSkillsService()) {
                await this.syncCustomSkillToSupabase(customSkill);
            }

            return customSkill;

        } catch (error) {
            console.error('❌ Error creando skill personalizada:', error);
            throw error;
        }
    }

    validateSkillData(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }
        
        if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
            return false;
        }
        
        if (data.name.length > 50) {
            return false;
        }

        if (data.description && data.description.length > 200) {
            return false;
        }

        return true;
    }

    generateSkillCode(name) {
        // Generar código único basado en el nombre
        const baseCode = name
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 30);
        
        // Agregar timestamp para garantizar unicidad
        const timestamp = Date.now().toString().slice(-6);
        return `custom_${baseCode}_${timestamp}`;
    }

    canCreatePublicSkill(userId) {
        // Por ahora permitir a todos, en el futuro podríamos agregar validaciones
        // como verificación del usuario, límites, etc.
        return userId && userId.length > 0;
    }

    async syncCustomSkillToSupabase(skill) {
        try {
            const skillsService = window.SkillsSystemInitializer?.getSkillsService();
            if (skillsService && skillsService.supabase) {
                const { data, error } = await skillsService.supabase
                    .from('math_skills_catalog')
                    .insert([skill]);

                if (error) throw error;
                console.log('🔄 Skill sincronizada con Supabase:', skill.skill_name);
            }
        } catch (error) {
            console.warn('⚠️ Error sincronizando con Supabase (funcionando offline):', error);
        }
    }

    // ====================================
    // 📚 OBTENER SKILLS DISPONIBLES
    // ====================================

    getAllAvailableSkills(userId = null) {
        const allSkills = new Map();

        try {
            // Agregar skills predefinidas
            if (window.SKILLS_CONFIG && window.SKILLS_CONFIG.skillsCategories) {
                Object.values(window.SKILLS_CONFIG.skillsCategories).forEach(category => {
                    if (category && category.skills && Array.isArray(category.skills)) {
                        category.skills.forEach(skillCode => {
                            // Aquí deberíamos obtener el detalle de cada skill predefinida
                            // Por simplicidad, creamos un objeto básico
                            allSkills.set(skillCode, {
                                skill_code: skillCode,
                                skill_name: this.getSkillDisplayName(skillCode),
                                category: category.name.toLowerCase(),
                                color_hex: category.color,
                                icon_name: category.icon,
                                is_custom: false
                            });
                        });
                    }
                });
            }

            // Agregar skills personalizadas públicas
            this.customSkills.forEach((skill, code) => {
                if (skill && skill.is_public) {
                    allSkills.set(code, skill);
                }
            });

            // Agregar skills personalizadas del usuario específico
            if (userId && this.userCustomSkills.has(userId)) {
                this.userCustomSkills.get(userId).forEach((skill, code) => {
                    if (skill) {
                        allSkills.set(code, skill);
                    }
                });
            }
        } catch (error) {
            console.error('❌ Error obteniendo skills disponibles:', error);
        }

        return Array.from(allSkills.values());
    }

    getSkillDisplayName(skillCode) {
        const displayNames = {
            'matematicas': 'Matemáticas',
            'lenguaje': 'Lenguaje y Literatura',
            'ciencias': 'Ciencias Naturales',
            'historia': 'Historia y Geografía',
            'ingles': 'Inglés',
            'psicologia': 'Psicología Infantil',
            'fonoaudiologia': 'Fonoaudiología',
            'terapia_ocupacional': 'Terapia Ocupacional',
            'psicopedagogia': 'Psicopedagogía',
            'evaluacion_psicologica': 'Evaluación Psicológica',
            'evaluacion_academica': 'Evaluación Académica',
            'necesidades_especiales': 'Necesidades Especiales',
            'altas_capacidades': 'Altas Capacidades',
            'tecnologia_educativa': 'Tecnología Educativa',
            'montessori': 'Metodología Montessori',
            'waldorf': 'Pedagogía Waldorf',
            'aprendizaje_ludico': 'Aprendizaje Lúdico'
        };
        
        return displayNames[skillCode] || skillCode.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    getUserCustomSkills(userId) {
        const userSkills = this.userCustomSkills.get(userId);
        return userSkills ? Array.from(userSkills.values()) : [];
    }

    getPublicCustomSkills() {
        return Array.from(this.customSkills.values()).filter(skill => skill && skill.is_public);
    }

    // ====================================
    // 🗑️ GESTIÓN DE SKILLS
    // ====================================

    deleteCustomSkill(skillCode, userId) {
        try {
            let deleted = false;

            // Intentar eliminar de skills del usuario
            if (this.userCustomSkills.has(userId)) {
                const userSkills = this.userCustomSkills.get(userId);
                if (userSkills.has(skillCode)) {
                    userSkills.delete(skillCode);
                    deleted = true;
                    console.log(`🗑️ Skill privada eliminada: ${skillCode}`);
                }
            }

            // Si el usuario es el creador de una skill pública, permitir eliminarla
            const publicSkill = this.customSkills.get(skillCode);
            if (publicSkill && publicSkill.created_by === userId) {
                this.customSkills.delete(skillCode);
                deleted = true;
                console.log(`🗑️ Skill pública eliminada: ${skillCode}`);
            }

            if (deleted) {
                this.saveCustomSkillsToStorage();
                // TODO: Sincronizar eliminación con Supabase
            }

            return deleted;
        } catch (error) {
            console.error('❌ Error eliminando skill personalizada:', error);
            return false;
        }
    }

    updateCustomSkill(skillCode, updates, userId) {
        try {
            let updated = false;

            // Actualizar skill del usuario
            if (this.userCustomSkills.has(userId)) {
                const userSkills = this.userCustomSkills.get(userId);
                if (userSkills.has(skillCode)) {
                    const skill = userSkills.get(skillCode);
                    Object.assign(skill, updates, { updated_at: new Date().toISOString() });
                    updated = true;
                }
            }

            // Actualizar skill pública si el usuario es el creador
            const publicSkill = this.customSkills.get(skillCode);
            if (publicSkill && publicSkill.created_by === userId) {
                Object.assign(publicSkill, updates, { updated_at: new Date().toISOString() });
                updated = true;
            }

            if (updated) {
                this.saveCustomSkillsToStorage();
                // TODO: Sincronizar con Supabase
            }

            return updated;
        } catch (error) {
            console.error('❌ Error actualizando skill personalizada:', error);
            return false;
        }
    }

    // ====================================
    // 🔍 BÚSQUEDA Y FILTRADO
    // ====================================

    searchSkills(query, userId = null) {
        const allSkills = this.getAllAvailableSkills(userId);
        const searchTerm = query.toLowerCase().trim();
        
        if (!searchTerm) return allSkills;

        return allSkills.filter(skill => 
            skill.skill_name.toLowerCase().includes(searchTerm) ||
            skill.description?.toLowerCase().includes(searchTerm) ||
            skill.category.toLowerCase().includes(searchTerm)
        );
    }

    getSkillsByCategory(category, userId = null) {
        const allSkills = this.getAllAvailableSkills(userId);
        return allSkills.filter(skill => 
            skill.category.toLowerCase() === category.toLowerCase()
        );
    }

    // ====================================
    // 📊 ESTADÍSTICAS
    // ====================================

    getCustomSkillsStats(userId = null) {
        const stats = {
            totalCustomSkills: this.customSkills.size,
            publicCustomSkills: Array.from(this.customSkills.values()).filter(s => s.is_public).length,
            userCustomSkills: 0,
            totalAvailableSkills: 0
        };

        if (userId) {
            stats.userCustomSkills = this.getUserCustomSkills(userId).length;
            stats.totalAvailableSkills = this.getAllAvailableSkills(userId).length;
        }

        return stats;
    }
}

// ====================================
// 🚀 INICIALIZADOR GLOBAL DE SKILLS ACTUALIZADO
// ====================================

window.SkillsSystemInitializer = {
    initialized: false,
    services: {},
    components: {},
    currentUserRole: null,
    customSkillsManager: null,

    async init() {
        try {
            console.log('🎯 Inicializando Sistema de Skills Matemágica con Skills Personalizadas...');
            
            // Inicializar gestor de skills personalizadas
            this.customSkillsManager = new CustomSkillsManager();
            
            // Verificar dependencias básicas
            if (!this.checkBasicDependencies()) {
                console.warn('⚠️ Algunas dependencias no están disponibles, continuando en modo limitado');
            }

            // Detectar rol del usuario actual
            this.detectUserRole();

            // Inicializar servicios base
            await this.initializeServices();
            
            // Configurar eventos globales
            this.setupGlobalEvents();
            
            this.initialized = true;
            console.log(`✅ Sistema de Skills inicializado para rol: ${this.currentUserRole}`);
            
            return true;
            
        } catch (error) {
            console.error('❌ Error inicializando Sistema de Skills:', error);
            return false;
        }
    },

    checkBasicDependencies() {
        try {
            const hasSupabase = typeof window.supabase !== 'undefined' && 
                               typeof window.supabase.createClient === 'function';
            
            const hasConfig = window.SKILLS_CONFIG && 
                             window.SKILLS_CONFIG.supabase && 
                             window.SKILLS_CONFIG.supabase.url;
            
            console.log(`✅ Dependencias disponibles: Supabase=${hasSupabase}, Config=${hasConfig}`);
            return hasSupabase || hasConfig; // Al menos una debe estar disponible
        } catch (error) {
            console.warn('⚠️ Error verificando dependencias:', error);
            return false;
        }
    },

    detectUserRole() {
        try {
            const userProfile = localStorage.getItem('matemagica-user-profile');
            if (userProfile) {
                const profile = JSON.parse(userProfile);
                this.currentUserRole = profile.user_role || 'parent';
                console.log(`🎭 Rol detectado: ${this.currentUserRole}`);
            } else {
                this.currentUserRole = 'parent'; // Rol por defecto
                console.log('⚠️ No se detectó perfil de usuario, usando rol por defecto: parent');
            }
        } catch (error) {
            console.error('❌ Error detectando rol de usuario:', error);
            this.currentUserRole = 'parent';
        }
    },

    getCurrentUserId() {
        try {
            const userProfile = localStorage.getItem('matemagica-user-profile');
            if (userProfile) {
                const profile = JSON.parse(userProfile);
                return profile.id || profile.user_id;
            }
        } catch (error) {
            console.error('❌ Error obteniendo ID de usuario:', error);
        }
        return null;
    },

    async initializeServices() {
        try {
            // 🔧 USAR EL SISTEMA UNIFICADO DE SUPABASE
            let supabaseClient = null;
            
            // Verificar si existe el cliente unificado
            if (window.MatemágicaSupabaseClient && typeof window.MatemágicaSupabaseClient.inicializar === 'function') {
                try {
                    console.log('🔧 Usando cliente Supabase unificado...');
                    supabaseClient = await window.MatemágicaSupabaseClient.inicializar();
                    
                    if (supabaseClient) {
                        console.log('✅ Cliente Supabase unificado obtenido correctamente');
                    }
                } catch (unifiedError) {
                    console.warn('⚠️ Error con cliente unificado, intentando ConfigService:', unifiedError.message);
                }
            }
            
            // Fallback: usar ConfigService directamente si el unificado no funciona
            if (!supabaseClient && window.ConfigService && typeof window.ConfigService.loadConfig === 'function') {
                try {
                    console.log('🔄 Fallback: obteniendo configuración desde ConfigService...');
                    const config = await window.ConfigService.loadConfig();
                    if (config && config.supabase) {
                        supabaseClient = window.supabase.createClient(
                            config.supabase.url,
                            config.supabase.anonKey,
                            {
                                auth: {
                                    persistSession: true,
                                    storageKey: 'matemagica-skills-fallback-auth'
                                }
                            }
                        );
                        console.log('✅ Cliente Supabase creado desde ConfigService (fallback)');
                    }
                } catch (configError) {
                    console.warn('⚠️ Error obteniendo configuración desde ConfigService:', configError);
                }
            }
            
            // Último fallback: configuración hardcodeada
            if (!supabaseClient && window.SKILLS_CONFIG && window.SKILLS_CONFIG.supabase) {
                console.log('🔄 Último fallback: usando configuración hardcodeada');
                supabaseClient = window.supabase.createClient(
                    window.SKILLS_CONFIG.supabase.url,
                    window.SKILLS_CONFIG.supabase.anonKey,
                    {
                        auth: {
                            persistSession: true,
                            storageKey: 'matemagica-skills-hardcoded-auth'
                        }
                    }
                );
            }
            
            // Verificar que tenemos un cliente válido
            if (!supabaseClient) {
                console.warn('⚠️ No se pudo obtener cliente Supabase válido');
                return;
            }
            
            console.log('✅ Configuración de Supabase disponible desde:', 
                window.MatemágicaSupabaseClient ? 'Sistema Unificado' : 
                window.ConfigService ? 'ConfigService' : 'configuración local');
            
            // Inicializar servicio de skills si está disponible
            if (typeof window.initializeSkillsService === 'function') {
                this.services.skills = window.initializeSkillsService(supabaseClient);
                console.log('✅ Servicio de Skills conectado a Supabase');
            } else {
                console.warn('⚠️ Función initializeSkillsService no disponible');
            }
            
        } catch (error) {
            console.warn('⚠️ Error inicializando servicios, usando modo offline:', error);
        }
    },

    setupGlobalEvents() {
        try {
            // Evento global para cambio de usuario/rol
            document.addEventListener('userRoleChanged', (event) => {
                console.log('🔄 Rol de usuario cambió:', event.detail);
                this.currentUserRole = event.detail.role;
                this.handleRoleChange(event.detail);
            });

            // Evento para actualización de skills
            document.addEventListener('skillsUpdated', (event) => {
                console.log('📝 Skills actualizados:', event.detail);
                this.handleSkillsUpdate(event.detail);
            });

            // Nuevo evento para skills personalizadas
            document.addEventListener('customSkillCreated', (event) => {
                console.log('🆕 Skill personalizada creada:', event.detail);
                this.handleCustomSkillCreated(event.detail);
            });

            // Evento para sincronización con Supabase
            document.addEventListener('supabaseSync', (event) => {
                console.log('🔄 Sincronizando con Supabase:', event.detail);
                this.handleSupabaseSync(event.detail);
            });
        } catch (error) {
            console.error('❌ Error configurando eventos globales:', error);
        }
    },

    handleRoleChange(roleData) {
        try {
            const { role, userId } = roleData || {};
            
            // Reconfigurar UI según el nuevo rol
            if (role === 'teacher') {
                console.log('👩‍🏫 Reconfigurando para profesor');
                this.enableTeacherFeatures();
            } else if (role === 'parent') {
                console.log('👨‍👩‍👧‍👦 Reconfigurando para apoderado');
                this.enableParentFeatures();
            }
        } catch (error) {
            console.error('❌ Error manejando cambio de rol:', error);
        }
    },

    enableTeacherFeatures() {
        // Habilitar funcionalidades específicas de profesores
        console.log('🔧 Habilitando funcionalidades de profesor');
    },

    enableParentFeatures() {
        // Habilitar funcionalidades específicas de apoderados
        console.log('🔧 Habilitando funcionalidades de apoderado');
    },

    handleSkillsUpdate(skillsData) {
        try {
            // Propagar actualización a componentes activos
            if (this.components.activeSkillsSelector) {
                this.components.activeSkillsSelector.refresh();
            }
            
            // Sincronizar con Supabase si está disponible
            if (this.services.skills) {
                this.services.skills.syncSkills(skillsData);
            }
        } catch (error) {
            console.error('❌ Error manejando actualización de skills:', error);
        }
    },

    handleCustomSkillCreated(skillData) {
        try {
            console.log('🎉 Nueva skill personalizada disponible:', skillData.skill_name);
            
            // Notificar a componentes activos
            if (this.components.activeSkillsSelector) {
                this.components.activeSkillsSelector.refreshWithCustomSkills();
            }
            
            // Disparar evento de actualización general
            document.dispatchEvent(new CustomEvent('skillsUpdated', {
                detail: { type: 'custom_skill_added', skill: skillData }
            }));
        } catch (error) {
            console.error('❌ Error manejando skill personalizada creada:', error);
        }
    },

    handleSupabaseSync(syncData) {
        // Manejar sincronización bidireccional con Supabase
        console.log('🔄 Sincronizando datos con Supabase');
    },

    // ====================================
    // 🛠️ MÉTODOS PÚBLICOS ACTUALIZADOS
    // ====================================

    getStatus() {
        try {
            return {
                initialized: this.initialized,
                userRole: this.currentUserRole,
                userId: this.getCurrentUserId(),
                services: Object.keys(this.services || {}),
                components: Object.keys(this.components || {}),
                supabaseConnected: !!(this.services && this.services.skills),
                customSkillsEnabled: !!this.customSkillsManager,
                customSkillsStats: this.customSkillsManager ? 
                    this.customSkillsManager.getCustomSkillsStats(this.getCurrentUserId()) : null
            };
        } catch (error) {
            console.error('❌ Error obteniendo estado:', error);
            return {
                initialized: false,
                error: error.message
            };
        }
    },

    isTeacher() {
        return this.currentUserRole === 'teacher';
    },

    isParent() {
        return this.currentUserRole === 'parent';
    },

    getSkillsService() {
        return this.services ? this.services.skills : null;
    },

    getCustomSkillsManager() {
        return this.customSkillsManager;
    },

    // ====================================
    // 🆕 MÉTODOS PARA SKILLS PERSONALIZADAS
    // ====================================

    async createCustomSkill(skillData) {
        try {
            if (!this.customSkillsManager) {
                throw new Error('Gestor de skills personalizadas no disponible');
            }

            const userId = this.getCurrentUserId();
            if (!userId) {
                throw new Error('Usuario no identificado');
            }

            return await this.customSkillsManager.createCustomSkill(skillData, userId);
        } catch (error) {
            console.error('❌ Error creando skill personalizada:', error);
            throw error;
        }
    },

    getAllAvailableSkills() {
        try {
            if (!this.customSkillsManager) return [];
            
            const userId = this.getCurrentUserId();
            return this.customSkillsManager.getAllAvailableSkills(userId);
        } catch (error) {
            console.error('❌ Error obteniendo skills disponibles:', error);
            return [];
        }
    },

    searchSkills(query) {
        try {
            if (!this.customSkillsManager) return [];
            
            const userId = this.getCurrentUserId();
            return this.customSkillsManager.searchSkills(query, userId);
        } catch (error) {
            console.error('❌ Error buscando skills:', error);
            return [];
        }
    },

    // Método para registrar componentes activos
    registerComponent(name, component) {
        try {
            if (!this.components) {
                this.components = {};
            }
            this.components[name] = component;
            console.log(`📝 Componente registrado: ${name}`);
        } catch (error) {
            console.error('❌ Error registrando componente:', error);
        }
    },

    unregisterComponent(name) {
        try {
            if (this.components && this.components[name]) {
                delete this.components[name];
                console.log(`🗑️ Componente removido: ${name}`);
            }
        } catch (error) {
            console.error('❌ Error removiendo componente:', error);
        }
    }
};

// ====================================
// 🔄 AUTO-INICIALIZACIÓN INTELIGENTE
// ====================================

function initializeSkillsSystem() {
    // Verificar si ya está inicializado
    if (window.SkillsSystemInitializer && window.SkillsSystemInitializer.initialized) {
        console.log('✅ Sistema de Skills ya inicializado');
        return;
    }

    // Intentar inicializar
    if (window.SkillsSystemInitializer && typeof window.SkillsSystemInitializer.init === 'function') {
        window.SkillsSystemInitializer.init().then(success => {
            if (success) {
                console.log('🎉 Sistema de Skills listo para usar');
                
                // Disparar evento de inicialización
                document.dispatchEvent(new CustomEvent('skillsSystemReady', {
                    detail: window.SkillsSystemInitializer.getStatus ? window.SkillsSystemInitializer.getStatus() : {}
                }));
            } else {
                console.warn('⚠️ Sistema de Skills inicializado con limitaciones');
            }
        }).catch(error => {
            console.error('❌ Error en inicialización de Skills System:', error);
        });
    } else {
        console.error('❌ SkillsSystemInitializer no disponible o malformado');
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializeSkillsSystem, 500);
    });
} else {
    // DOM ya está listo
    setTimeout(initializeSkillsSystem, 500);
}

// ====================================
// 🌐 EXPORTACIÓN GLOBAL
// ====================================

// Hacer disponible globalmente para debugging y uso
window.getSkillsSystemStatus = () => {
    try {
        return window.SkillsSystemInitializer && window.SkillsSystemInitializer.getStatus ? 
               window.SkillsSystemInitializer.getStatus() : 
               { error: 'Sistema no disponible' };
    } catch (error) {
        return { error: error.message };
    }
};

window.CustomSkillsManager = CustomSkillsManager;

console.log('✅ Configuración global de Skills con Skills Personalizadas cargada - Matemágica PWA v1.0');