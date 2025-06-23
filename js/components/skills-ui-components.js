/**
 * 🎓 COMPONENTES UI PARA SISTEMA DE SKILLS - Matemágica PWA
 * Componentes visuales para gestión de habilidades profesionales
 * Version: 1.0 - Diciembre 2024
 */

// ====================================
// 🎨 COMPONENTE: SELECTOR DE SKILLS
// ====================================

class SkillsSelector {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            allowMultiple: true,
            maxSelections: 10,
            showCategories: true,
            compact: false,
            mode: 'profile', // 'profile' o 'search'
            placeholder: 'Selecciona tus especialidades...',
            onSelectionChange: null,
            ...options
        };
        
        this.selectedSkills = new Set();
        this.skillsData = null;
        this.onSkillsChange = options.onSkillsChange || options.onSelectionChange || (() => {});
        
        // Asignar instancia actual para acceso global
        window.currentSkillsSelector = this;
    }

    async init() {
        try {
            // Cargar skills desde el gestor de skills personalizadas si está disponible
            if (window.SkillsSystemInitializer?.getCustomSkillsManager()) {
                const customManager = window.SkillsSystemInitializer.getCustomSkillsManager();
                const userId = window.SkillsSystemInitializer.getCurrentUserId();
                this.skillsData = this.formatSkillsFromManager(customManager.getAllAvailableSkills(userId));
            } else {
                // Fallback a skills predefinidas
                this.skillsData = this.getDefaultSkillsData();
            }
            
            this.render();
            this.attachEventListeners();
            
        } catch (error) {
            console.error('❌ Error inicializando SkillsSelector:', error);
            this.showError('Error cargando skills disponibles');
        }
    }

    formatSkillsFromManager(skillsArray) {
        const categories = {};
        const all = [];

        skillsArray.forEach(skill => {
            all.push(skill);
            
            const categoryKey = skill.category;
            if (!categories[categoryKey]) {
                categories[categoryKey] = {
                    name: this.getCategoryDisplayName(categoryKey),
                    icon: skill.icon_name || '🎯',
                    color: skill.color_hex || '#3B82F6',
                    skills: []
                };
            }
            categories[categoryKey].skills.push(skill);
        });

        return {
            all: all,
            byCategory: categories,
            categories: Object.keys(categories)
        };
    }

    getCategoryDisplayName(categoryKey) {
        const displayNames = {
            'academico': 'Académico',
            'terapeutico': 'Terapéutico',
            'evaluacion': 'Evaluación',
            'especializado': 'Especializado',
            'metodologia': 'Metodología',
            'personalizada': 'Skills Personalizadas'
        };
        return displayNames[categoryKey] || categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);
    }

    getDefaultSkillsData() {
        const categories = {
            matematicas: {
                name: 'Matemáticas',
                icon: '🧮',
                color: '#3B82F6',
                skills: [
                    { code: 'aritmetica', name: 'Aritmética Básica' },
                    { code: 'algebra', name: 'Álgebra' },
                    { code: 'geometria', name: 'Geometría' },
                    { code: 'estadistica', name: 'Estadística' },
                    { code: 'resolucion_problemas', name: 'Resolución de Problemas' }
                ]
            },
            pedagogia: {
                name: 'Pedagogía',
                icon: '👩‍🏫',
                color: '#10B981',
                skills: [
                    { code: 'metodologias_activas', name: 'Metodologías Activas' },
                    { code: 'evaluacion_formativa', name: 'Evaluación Formativa' },
                    { code: 'diferenciacion', name: 'Diferenciación' },
                    { code: 'gestion_aula', name: 'Gestión de Aula' },
                    { code: 'educacion_inclusiva', name: 'Educación Inclusiva' }
                ]
            },
            tecnologia: {
                name: 'Tecnología Educativa',
                icon: '💻',
                color: '#8B5CF6',
                skills: [
                    { code: 'plataformas_digitales', name: 'Plataformas Digitales' },
                    { code: 'herramientas_interactivas', name: 'Herramientas Interactivas' },
                    { code: 'ia_educacion', name: 'IA en Educación' },
                    { code: 'apps_educativas', name: 'Apps Educativas' }
                ]
            },
            especializada: {
                name: 'Áreas Especializadas',
                icon: '🌟',
                color: '#F59E0B',
                skills: [
                    { code: 'necesidades_especiales', name: 'Necesidades Especiales' },
                    { code: 'tdah', name: 'TDAH' },
                    { code: 'tea', name: 'TEA' },
                    { code: 'superdotacion', name: 'Superdotación' },
                    { code: 'dificultades_aprendizaje', name: 'Dificultades de Aprendizaje' }
                ]
            }
        };

        const allSkills = [];
        Object.entries(categories).forEach(([categoryKey, category]) => {
            category.skills.forEach(skill => {
                allSkills.push({
                    skill_code: skill.code,
                    skill_name: skill.name,
                    category: categoryKey,
                    color_hex: category.color,
                    icon_name: category.icon
                });
            });
        });

        return {
            all: allSkills,
            byCategory: categories,
            categories: Object.keys(categories)
        };
    }

    render() {
        if (!this.skillsData) {
            this.container.innerHTML = '<div class="text-gray-500">Cargando skills...</div>';
            return;
        }

        const { compact, showCategories } = this.options;

        this.container.innerHTML = `
            <div class="skills-selector ${compact ? 'compact' : ''}">
                ${this.renderSearchBox()}
                ${showCategories ? this.renderByCategories() : this.renderAllSkills()}
                ${this.renderSelectedSkills()}
            </div>
        `;
    }

    renderSearchBox() {
        return `
            <div class="mb-4">
                <div class="relative">
                    <input 
                        type="text" 
                        id="skills-search" 
                        placeholder="Buscar habilidades..."
                        class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fas fa-search text-gray-400"></i>
                    </div>
                </div>
            </div>
        `;
    }

    renderByCategories() {
        return `
            <div class="skills-categories space-y-6">
                ${Object.entries(this.skillsData.byCategory).map(([categoryKey, category]) => `
                    <div class="category-section">
                        <div class="flex items-center justify-between mb-3">
                            <h3 class="text-lg font-semibold text-gray-800 flex items-center">
                                <span class="w-8 h-8 rounded-full mr-3 flex items-center justify-center text-white" 
                                      style="background-color: ${category.color}">
                                    ${category.icon}
                                </span>
                                ${category.name}
                            </h3>
                            ${this.canAddCustomSkills(categoryKey) ? `
                                <button onclick="window.currentSkillsSelector.openCustomSkillModal('${categoryKey}')" 
                                        class="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full transition-colors flex items-center">
                                    <i class="fas fa-plus mr-1"></i>
                                    Agregar skill
                                </button>
                            ` : ''}
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            ${category.skills.map(skill => this.renderSkillCard(skill)).join('')}
                        </div>
                    </div>
                `).join('')}
                
                <!-- Botón global para agregar skill personalizada -->
                <div class="text-center pt-4 border-t border-gray-200">
                    <button onclick="window.currentSkillsSelector.openCustomSkillModal('personalizada')" 
                            class="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md">
                        <i class="fas fa-lightbulb mr-2"></i>
                        Crear Skill Personalizada
                    </button>
                </div>
            </div>
        `;
    }

    canAddCustomSkills(categoryKey) {
        // Verificar si la categoría permite skills personalizadas y si el usuario es profesor
        if (!window.SkillsSystemInitializer?.isTeacher()) {
            return false;
        }
        
        const categoryConfig = window.SKILLS_CONFIG?.skillsCategories?.[categoryKey];
        return categoryConfig?.allowCustom === true;
    }

    openCustomSkillModal(category = 'personalizada') {
        console.log(`💡 Abriendo modal para crear skill en categoría: ${category}`);
        
        // Crear modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = this.renderCustomSkillModal(category);
        
        document.body.appendChild(modal);
        
        // Setup eventos del modal
        this.setupCustomSkillModalEvents(modal, category);
    }

    renderCustomSkillModal(category) {
        const categoryInfo = this.getCategoryInfo(category);
        
        return `
            <div class="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
                    <div class="flex justify-between items-center">
                        <h3 class="text-xl font-bold text-gray-800 flex items-center">
                            <span class="w-8 h-8 rounded-full mr-3 flex items-center justify-center text-white" 
                                  style="background-color: ${categoryInfo.color}">
                                ${categoryInfo.icon}
                            </span>
                            Nueva Skill: ${categoryInfo.name}
                        </h3>
                        <button onclick="this.closest('.fixed').remove()" 
                                class="text-gray-500 hover:text-gray-700 text-2xl">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <form id="custom-skill-form" class="p-6 space-y-6">
                    <!-- Información básica de la skill -->
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="fas fa-tag mr-1"></i>Nombre de la habilidad *
                            </label>
                            <input type="text" 
                                   id="skill-name" 
                                   name="skillName"
                                   placeholder="Ej: Terapia de Integración Sensorial"
                                   maxlength="50"
                                   class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                   required>
                            <div class="text-xs text-gray-500 mt-1">Máximo 50 caracteres</div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="fas fa-align-left mr-1"></i>Descripción (opcional)
                            </label>
                            <textarea id="skill-description" 
                                      name="skillDescription"
                                      rows="3"
                                      maxlength="200"
                                      placeholder="Describe brevemente en qué consiste esta habilidad..."
                                      class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"></textarea>
                            <div class="text-xs text-gray-500 mt-1">Máximo 200 caracteres</div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="fas fa-folder mr-1"></i>Categoría
                            </label>
                            <select id="skill-category" 
                                    name="skillCategory"
                                    class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <option value="academico">🎓 Académico</option>
                                <option value="terapeutico">🩺 Terapéutico</option>
                                <option value="evaluacion">📋 Evaluación</option>
                                <option value="especializado">⭐ Especializado</option>
                                <option value="metodologia">🎯 Metodología</option>
                                <option value="personalizada" selected>💡 Personalizada</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="fas fa-palette mr-1"></i>Icono representativo
                            </label>
                            <div class="grid grid-cols-8 gap-2">
                                ${this.renderIconOptions()}
                            </div>
                            <input type="hidden" id="selected-icon" name="selectedIcon" value="💡">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="fas fa-paint-brush mr-1"></i>Color
                            </label>
                            <div class="flex space-x-2">
                                ${this.renderColorOptions()}
                            </div>
                            <input type="hidden" id="selected-color" name="selectedColor" value="${categoryInfo.color}">
                        </div>
                    </div>

                    <!-- Opciones de privacidad -->
                    <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 class="text-sm font-medium text-blue-800 mb-3">
                            <i class="fas fa-shield-alt mr-1"></i>Privacidad de la skill
                        </h4>
                        <div class="space-y-2">
                            <label class="flex items-start cursor-pointer">
                                <input type="radio" 
                                       name="privacy" 
                                       value="private" 
                                       checked
                                       class="mt-1 text-blue-600 focus:ring-blue-500">
                                <div class="ml-3">
                                    <div class="text-sm font-medium text-blue-800">👤 Solo para mí</div>
                                    <div class="text-xs text-blue-600">Esta skill solo será visible en tu perfil</div>
                                </div>
                            </label>
                            <label class="flex items-start cursor-pointer">
                                <input type="radio" 
                                       name="privacy" 
                                       value="public"
                                       class="mt-1 text-blue-600 focus:ring-blue-500">
                                <div class="ml-3">
                                    <div class="text-sm font-medium text-blue-800">🌐 Pública</div>
                                    <div class="text-xs text-blue-600">Otros profesores podrán usar esta skill</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- Botones de acción -->
                    <div class="flex space-x-4 pt-4 border-t border-gray-200">
                        <button type="button" 
                                onclick="this.closest('.fixed').remove()"
                                class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                            <i class="fas fa-times mr-2"></i>Cancelar
                        </button>
                        <button type="submit" 
                                class="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 px-4 rounded-lg font-medium transition-all">
                            <i class="fas fa-plus mr-2"></i>Crear Skill
                        </button>
                    </div>
                </form>
            </div>
        `;
    }

    getCategoryInfo(categoryKey) {
        const categoryConfig = window.SKILLS_CONFIG?.skillsCategories?.[categoryKey];
        if (categoryConfig) {
            return {
                name: categoryConfig.name,
                icon: categoryConfig.icon,
                color: categoryConfig.color
            };
        }
        
        // Fallback
        return {
            name: 'Personalizada',
            icon: '💡',
            color: '#6366F1'
        };
    }

    renderIconOptions() {
        const icons = [
            '💡', '🎯', '⭐', '🔬', '📚', '🎨', '🏆', '💭',
            '🎪', '🎭', '🎨', '🎵', '🎸', '🎤', '🎬', '📸',
            '💻', '🔧', '⚙️', '🔬', '🧪', '📊', '📈', '🎲',
            '🌟', '✨', '💫', '🔥', '💎', '🌈', '🎊', '🎉'
        ];
        
        return icons.map(icon => `
            <button type="button" 
                    class="icon-option w-10 h-10 border-2 border-gray-300 rounded-lg flex items-center justify-center text-xl hover:border-blue-500 transition-colors"
                    data-icon="${icon}"
                    onclick="window.currentSkillsSelector.selectIcon('${icon}', this)">
                ${icon}
            </button>
        `).join('');
    }

    renderColorOptions() {
        const colors = [
            '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
            '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
        ];
        
        return colors.map(color => `
            <button type="button" 
                    class="color-option w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-500 transition-colors"
                    style="background-color: ${color}"
                    data-color="${color}"
                    onclick="window.currentSkillsSelector.selectColor('${color}', this)">
            </button>
        `).join('');
    }

    selectIcon(icon, buttonElement) {
        // Remover selección anterior
        document.querySelectorAll('.icon-option').forEach(btn => {
            btn.classList.remove('border-blue-500', 'bg-blue-50');
            btn.classList.add('border-gray-300');
        });
        
        // Agregar selección actual
        buttonElement.classList.remove('border-gray-300');
        buttonElement.classList.add('border-blue-500', 'bg-blue-50');
        
        // Actualizar valor
        document.getElementById('selected-icon').value = icon;
    }

    selectColor(color, buttonElement) {
        // Remover selección anterior
        document.querySelectorAll('.color-option').forEach(btn => {
            btn.classList.remove('ring-4', 'ring-offset-2');
        });
        
        // Agregar selección actual
        buttonElement.classList.add('ring-4', 'ring-offset-2');
        buttonElement.style.setProperty('--tw-ring-color', color + '40');
        
        // Actualizar valor
        document.getElementById('selected-color').value = color;
    }

    setupCustomSkillModalEvents(modal, category) {
        // Pre-seleccionar categoría
        const categorySelect = modal.querySelector('#skill-category');
        if (categorySelect && category) {
            categorySelect.value = category;
        }

        // Pre-seleccionar primer icono
        const firstIcon = modal.querySelector('.icon-option');
        if (firstIcon) {
            firstIcon.click();
        }

        // Pre-seleccionar primer color
        const firstColor = modal.querySelector('.color-option');
        if (firstColor) {
            firstColor.click();
        }

        // Manejar envío del formulario
        const form = modal.querySelector('#custom-skill-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCustomSkillSubmit(form, modal);
        });

        // Contador de caracteres para nombre
        const nameInput = modal.querySelector('#skill-name');
        nameInput.addEventListener('input', (e) => {
            const maxLength = 50;
            const currentLength = e.target.value.length;
            const counter = e.target.parentNode.querySelector('.text-xs');
            counter.textContent = `${currentLength}/${maxLength} caracteres`;
            
            if (currentLength > maxLength * 0.8) {
                counter.classList.add('text-yellow-600');
            }
            if (currentLength === maxLength) {
                counter.classList.remove('text-yellow-600');
                counter.classList.add('text-red-600');
            }
        });

        // Contador de caracteres para descripción
        const descInput = modal.querySelector('#skill-description');
        descInput.addEventListener('input', (e) => {
            const maxLength = 200;
            const currentLength = e.target.value.length;
            const counter = e.target.parentNode.querySelector('.text-xs');
            counter.textContent = `${currentLength}/${maxLength} caracteres`;
            
            if (currentLength > maxLength * 0.8) {
                counter.classList.add('text-yellow-600');
            }
            if (currentLength === maxLength) {
                counter.classList.remove('text-yellow-600');
                counter.classList.add('text-red-600');
            }
        });
    }

    async handleCustomSkillSubmit(form, modal) {
        try {
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Creando...';

            const formData = new FormData(form);
            const skillData = {
                name: formData.get('skillName').trim(),
                description: formData.get('skillDescription').trim(),
                category: formData.get('skillCategory'),
                icon: formData.get('selectedIcon'),
                color: formData.get('selectedColor'),
                isPublic: formData.get('privacy') === 'public'
            };

            // Validar datos
            if (!skillData.name || skillData.name.length < 2) {
                throw new Error('El nombre debe tener al menos 2 caracteres');
            }

            if (this.skillAlreadyExists(skillData.name)) {
                throw new Error('Ya existe una skill con ese nombre');
            }

            // Crear skill personalizada
            const customSkill = await window.SkillsSystemInitializer.createCustomSkill(skillData);
            
            console.log('✅ Skill personalizada creada:', customSkill);

            // Refrescar el selector de skills
            await this.refreshSkills();

            // Seleccionar automáticamente la nueva skill
            this.addSkill(customSkill.skill_code);

            // Mostrar notificación de éxito
            this.showSuccess(`🎉 Skill "${customSkill.skill_name}" creada exitosamente`);

            // Cerrar modal
            modal.remove();

            // Disparar evento personalizado
            document.dispatchEvent(new CustomEvent('customSkillCreated', {
                detail: customSkill
            }));

        } catch (error) {
            console.error('❌ Error creando skill personalizada:', error);
            this.showError(error.message || 'Error creando la skill');
        } finally {
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-plus mr-2"></i>Crear Skill';
        }
    }

    skillAlreadyExists(skillName) {
        return this.skillsData.all.some(skill => 
            skill.skill_name.toLowerCase() === skillName.toLowerCase()
        );
    }

    async refreshSkills() {
        try {
            // Recargar skills desde el gestor
            if (window.SkillsSystemInitializer?.getCustomSkillsManager()) {
                const customManager = window.SkillsSystemInitializer.getCustomSkillsManager();
                const userId = window.SkillsSystemInitializer.getCurrentUserId();
                this.skillsData = this.formatSkillsFromManager(customManager.getAllAvailableSkills(userId));
                
                // Re-renderizar
                this.render();
                this.attachEventListeners();
                
                console.log('🔄 Skills refrescadas correctamente');
            }
        } catch (error) {
            console.error('❌ Error refrescando skills:', error);
        }
    }

    refreshWithCustomSkills() {
        // Método público para refrescar desde componentes externos
        this.refreshSkills();
    }

    showSuccess(message) {
        this.showNotification(message, 'success', '🎉');
    }

    showNotification(message, type = 'info', icon = 'ℹ️') {
        const colors = {
            success: 'bg-green-50 border-green-200 text-green-800',
            error: 'bg-red-50 border-red-200 text-red-800',
            warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
            info: 'bg-blue-50 border-blue-200 text-blue-800'
        };
        
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 ${colors[type]} border rounded-lg p-4 shadow-lg z-50 max-w-sm`;
        notification.innerHTML = `
            <div class="flex items-start">
                <div class="mr-3 text-lg">${icon}</div>
                <div class="flex-1 text-sm font-medium">${message}</div>
                <button onclick="this.parentNode.parentNode.remove()" 
                        class="ml-2 text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times text-xs"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    renderAllSkills() {
        if (!this.skillsData || !this.skillsData.all) {
            return '<div class="text-gray-500">No hay skills disponibles</div>';
        }

        return `
            <div class="skills-list">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    ${this.skillsData.all.map(skill => this.renderSkillCard(skill)).join('')}
                </div>
            </div>
        `;
    }

    renderSkillCard(skill) {
        const isSelected = this.selectedSkills.has(skill.skill_code);
        const baseClasses = 'skill-card p-3 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md';
        const selectedClasses = isSelected 
            ? 'border-blue-500 bg-blue-50 text-blue-800' 
            : 'border-gray-200 bg-white hover:border-blue-300';

        return `
            <div class="${baseClasses} ${selectedClasses}" 
                 data-skill-code="${skill.skill_code}"
                 onclick="window.currentSkillsSelector.toggleSkill('${skill.skill_code}')">
                
                <div class="flex items-center">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-white mr-3" 
                         style="background-color: ${skill.color_hex || '#3B82F6'}">
                        ${skill.icon_name || '🎯'}
                    </div>
                    <div class="flex-1">
                        <div class="font-medium text-sm">${skill.skill_name}</div>
                        ${skill.description ? `<div class="text-xs text-gray-500 mt-1">${skill.description}</div>` : ''}
                    </div>
                    ${isSelected ? '<i class="fas fa-check text-blue-600"></i>' : ''}
                </div>
                
                ${skill.is_custom ? '<div class="mt-2 text-xs text-purple-600 font-medium">💡 Personalizada</div>' : ''}
            </div>
        `;
    }

    renderSelectedSkills() {
        if (this.selectedSkills.size === 0) {
            return `
                <div class="selected-skills-empty mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-center">
                    <div class="text-gray-400 text-2xl mb-2">🎯</div>
                    <div class="text-gray-600 text-sm">${this.options.placeholder}</div>
                </div>
            `;
        }

        const selectedSkillsArray = Array.from(this.selectedSkills).map(skillCode => {
            return this.skillsData.all.find(skill => skill.skill_code === skillCode);
        }).filter(Boolean);

        return `
            <div class="selected-skills mt-4">
                <div class="flex items-center justify-between mb-3">
                    <h4 class="text-sm font-medium text-gray-700">
                        Skills seleccionadas (${this.selectedSkills.size}/${this.options.maxSelections})
                    </h4>
                    <button onclick="window.currentSkillsSelector.clearAllSkills()" 
                            class="text-xs text-red-600 hover:text-red-800 transition-colors">
                        <i class="fas fa-trash mr-1"></i>Limpiar todo
                    </button>
                </div>
                
                <div class="flex flex-wrap gap-2">
                    ${selectedSkillsArray.map(skill => `
                        <div class="selected-skill-tag flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                            <span class="mr-1">${skill.icon_name || '🎯'}</span>
                            <span class="mr-2">${skill.skill_name}</span>
                            <button onclick="window.currentSkillsSelector.removeSkill('${skill.skill_code}')" 
                                    class="text-blue-600 hover:text-blue-800 transition-colors">
                                <i class="fas fa-times text-xs"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        if (!this.container) return;

        // Búsqueda de skills
        const searchInput = this.container.querySelector('#skills-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterSkills(e.target.value);
            });
        }

        // Prevenir propagación en clicks de botones
        this.container.addEventListener('click', (e) => {
            if (e.target.closest('button')) {
                e.stopPropagation();
            }
        });
    }

    filterSkills(query) {
        if (!this.skillsData || !query.trim()) {
            // Mostrar todas las skills
            this.render();
            return;
        }

        const filteredSkills = this.skillsData.all.filter(skill => 
            skill.skill_name.toLowerCase().includes(query.toLowerCase()) ||
            skill.description?.toLowerCase().includes(query.toLowerCase()) ||
            skill.category.toLowerCase().includes(query.toLowerCase())
        );

        // Actualizar solo la sección de skills
        const skillsContainer = this.container.querySelector('.skills-categories, .skills-list');
        if (skillsContainer) {
            skillsContainer.innerHTML = `
                <div class="filtered-skills">
                    <div class="text-sm text-gray-600 mb-3">
                        Resultados para "${query}" (${filteredSkills.length} encontradas)
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        ${filteredSkills.map(skill => this.renderSkillCard(skill)).join('')}
                    </div>
                </div>
            `;
        }
    }

    toggleSkill(skillCode) {
        if (this.selectedSkills.has(skillCode)) {
            this.removeSkill(skillCode);
        } else {
            this.addSkill(skillCode);
        }
    }

    addSkill(skillCode) {
        if (this.selectedSkills.size >= this.options.maxSelections && this.options.allowMultiple) {
            this.showError(`Máximo ${this.options.maxSelections} skills permitidas`);
            return;
        }

        if (!this.options.allowMultiple) {
            this.selectedSkills.clear();
        }

        this.selectedSkills.add(skillCode);
        this.updateDisplay();
        this.notifyChange();
    }

    removeSkill(skillCode) {
        this.selectedSkills.delete(skillCode);
        this.updateDisplay();
        this.notifyChange();
    }

    clearAllSkills() {
        if (this.selectedSkills.size === 0) return;
        
        if (confirm('¿Estás seguro de querer limpiar todas las skills seleccionadas?')) {
            this.selectedSkills.clear();
            this.updateDisplay();
            this.notifyChange();
        }
    }

    updateDisplay() {
        // Actualizar tarjetas de skills
        const skillCards = this.container.querySelectorAll('.skill-card');
        skillCards.forEach(card => {
            const skillCode = card.dataset.skillCode;
            const isSelected = this.selectedSkills.has(skillCode);
            
            if (isSelected) {
                card.className = card.className.replace(/border-gray-200|bg-white/, 'border-blue-500 bg-blue-50');
                card.classList.add('text-blue-800');
                
                // Agregar icono de check si no existe
                if (!card.querySelector('.fa-check')) {
                    const checkIcon = document.createElement('i');
                    checkIcon.className = 'fas fa-check text-blue-600';
                    card.querySelector('.flex').appendChild(checkIcon);
                }
            } else {
                card.className = card.className.replace(/border-blue-500|bg-blue-50|text-blue-800/, 'border-gray-200 bg-white');
                
                // Remover icono de check
                const checkIcon = card.querySelector('.fa-check');
                if (checkIcon) {
                    checkIcon.remove();
                }
            }
        });

        // Actualizar sección de skills seleccionadas
        const selectedSection = this.container.querySelector('.selected-skills, .selected-skills-empty');
        if (selectedSection) {
            selectedSection.outerHTML = this.renderSelectedSkills();
        }
    }

    notifyChange() {
        const selectedSkillsArray = Array.from(this.selectedSkills);
        this.onSkillsChange(selectedSkillsArray);
        
        // Disparar evento personalizado
        document.dispatchEvent(new CustomEvent('skillsSelectionChanged', {
            detail: {
                selectedSkills: selectedSkillsArray,
                selector: this
            }
        }));
    }

    // ====================================
    // 🛠️ MÉTODOS PÚBLICOS DE LA API
    // ====================================

    getSelectedSkills() {
        return Array.from(this.selectedSkills);
    }

    setSelectedSkills(skillCodes) {
        if (!Array.isArray(skillCodes)) {
            console.warn('setSelectedSkills: expected array, got:', typeof skillCodes);
            return;
        }

        this.selectedSkills.clear();
        skillCodes.forEach(skillCode => {
            if (typeof skillCode === 'string') {
                this.selectedSkills.add(skillCode);
            }
        });

        this.updateDisplay();
        this.notifyChange();
    }

    refresh() {
        console.log('🔄 Refrescando SkillsSelector...');
        this.init();
    }

    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        // Limpiar referencia global
        if (window.currentSkillsSelector === this) {
            window.currentSkillsSelector = null;
        }
    }

    // ====================================
    // 📢 MÉTODOS DE NOTIFICACIÓN
    // ====================================

    showError(message) {
        this.showNotification(message, 'error', '❌');
    }

    showSuccess(message) {
        this.showNotification(message, 'success', '✅');
    }

    showWarning(message) {
        this.showNotification(message, 'warning', '⚠️');
    }

    showNotification(message, type = 'info', icon = 'ℹ️') {
        const colors = {
            success: 'bg-green-50 border-green-200 text-green-800',
            error: 'bg-red-50 border-red-200 text-red-800',
            warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
            info: 'bg-blue-50 border-blue-200 text-blue-800'
        };
        
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 ${colors[type]} border rounded-lg p-4 shadow-lg z-50 max-w-sm`;
        notification.innerHTML = `
            <div class="flex items-start">
                <div class="mr-3 text-lg">${icon}</div>
                <div class="flex-1 text-sm font-medium">${message}</div>
                <button onclick="this.parentNode.parentNode.remove()" 
                        class="ml-2 text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times text-xs"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
}

// ====================================
// 📋 COMPONENTE: FORMULARIO DE PERFIL DE PROFESOR
// ====================================

class TeacherProfileForm {
    constructor(containerId, teacherId = null) {
        this.container = document.getElementById(containerId);
        this.teacherId = teacherId;
        this.skillsSelector = null;
        this.formData = {};
        
        this.init();
    }

    async init() {
        try {
            // Cargar datos existentes si es edición
            if (this.teacherId) {
                await this.loadTeacherData();
            }
            
            this.render();
            this.initializeComponents();
            this.attachEventListeners();
            
        } catch (error) {
            console.error('❌ Error inicializando formulario:', error);
            this.showError('Error cargando formulario del profesor');
        }
    }

    async loadTeacherData() {
        // Cargar datos del profesor desde localStorage o servicio
        try {
            const savedProfile = localStorage.getItem(`teacher_profile_${this.teacherId}`);
            if (savedProfile) {
                this.formData = JSON.parse(savedProfile);
            }
        } catch (error) {
            console.error('❌ Error cargando datos del profesor:', error);
        }
    }

    render() {
        this.container.innerHTML = `
            <form id="teacher-profile-form" class="space-y-8">
                <!-- Información básica -->
                <div class="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-user mr-2 text-blue-600"></i>
                        Información Básica
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Especialización Principal
                            </label>
                            <select id="specialization" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                                <option value="">Seleccionar especialización</option>
                                <option value="profesor_basica">Profesor de Educación Básica</option>
                                <option value="psicologo">Psicólogo Infantil</option>
                                <option value="fonoaudiologo">Fonoaudiólogo</option>
                                <option value="psicopedagogo">Psicopedagogo</option>
                                <option value="terapeuta_ocupacional">Terapeuta Ocupacional</option>
                                <option value="educador_diferencial">Educador Diferencial</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Años de Experiencia
                            </label>
                            <select id="years_experience" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                                <option value="0-1">Menos de 1 año</option>
                                <option value="1-3">1-3 años</option>
                                <option value="3-5">3-5 años</option>
                                <option value="5-10">5-10 años</option>
                                <option value="10+">Más de 10 años</option>
                            </select>
                        </div>
                    </div>

                    <div class="mt-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Biografía Profesional
                        </label>
                        <textarea id="bio" 
                                  rows="4" 
                                  placeholder="Cuéntanos sobre tu experiencia, metodología y enfoque profesional..."
                                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">${this.formData.bio || ''}</textarea>
                    </div>

                    <div class="mt-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Formación Académica
                        </label>
                        <input type="text" 
                               id="education" 
                               placeholder="Ej: Pedagogía en Educación Básica, Universidad..."
                               value="${this.formData.education || ''}"
                               class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                    </div>
                </div>

                <!-- Selección de skills -->
                <div class="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-star mr-2 text-yellow-600"></i>
                        Habilidades y Especialidades
                    </h3>
                    <div id="skills-selector-container"></div>
                </div>

                <!-- Ubicación y modalidades -->
                <div class="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-map-marker-alt mr-2 text-green-600"></i>
                        Ubicación y Modalidades
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Región</label>
                            <select id="region" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                                <option value="">Seleccionar región</option>
                                <option value="metropolitana">Región Metropolitana</option>
                                <option value="valparaiso">Valparaíso</option>
                                <option value="biobio">Biobío</option>
                                <option value="araucania">Araucanía</option>
                                <option value="los_lagos">Los Lagos</option>
                                <option value="maule">Maule</option>
                                <option value="coquimbo">Coquimbo</option>
                                <option value="antofagasta">Antofagasta</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Comuna</label>
                            <input type="text" 
                                   id="comuna" 
                                   placeholder="Comuna donde trabajas"
                                   value="${this.formData.location?.comuna || ''}"
                                   class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                        </div>
                    </div>

                    <div class="mt-6">
                        <label class="block text-sm font-medium text-gray-700 mb-3">Modalidades de Atención</label>
                        <div class="flex flex-wrap gap-4">
                            <label class="flex items-center">
                                <input type="checkbox" id="online" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                <span class="ml-2 text-sm text-gray-700">💻 Online</span>
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" id="presencial" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                <span class="ml-2 text-sm text-gray-700">🏢 Presencial</span>
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" id="domicilio" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                <span class="ml-2 text-sm text-gray-700">🏠 A domicilio</span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Información de contacto -->
                <div class="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-phone mr-2 text-purple-600"></i>
                        Información de Contacto
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Email de contacto</label>
                            <input type="email" 
                                   id="contact_email" 
                                   placeholder="tu.email@ejemplo.com"
                                   value="${this.formData.contactEmail || ''}"
                                   class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono (opcional)</label>
                            <input type="tel" 
                                   id="phone" 
                                   placeholder="+56 9 1234 5678"
                                   value="${this.formData.phone || ''}"
                                   class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                        </div>
                    </div>

                    <div class="mt-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Tarifa por hora (opcional)</label>
                        <div class="relative">
                            <span class="absolute left-3 top-2 text-gray-500">$</span>
                            <input type="number" 
                                   id="rate_per_hour" 
                                   placeholder="15000"
                                   value="${this.formData.ratePerHour || ''}"
                                   class="w-full pl-8 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                        </div>
                        <p class="text-xs text-gray-500 mt-1">Indica tu tarifa en pesos chilenos</p>
                    </div>
                </div>

                <!-- Botones de acción -->
                <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button type="button" 
                            id="cancel-btn"
                            class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" 
                            id="save-btn"
                            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        ${this.teacherId ? 'Actualizar Perfil' : 'Guardar Perfil'}
                    </button>
                </div>
            </form>
        `;
    }

    initializeComponents() {
        // Inicializar selector de skills
        this.skillsSelector = new SkillsSelector('skills-selector-container', {
            allowMultiple: true,
            maxSelections: 8,
            showCategories: true,
            onSkillsChange: (skills) => {
                console.log('Skills seleccionados:', skills);
            }
        });

        // Establecer skills existentes si es edición
        if (this.formData.skills?.length > 0) {
            this.skillsSelector.setSelectedSkills(this.formData.skills);
        }

        // Establecer valores existentes
        this.populateForm();
    }

    populateForm() {
        if (!this.formData) return;

        // Especialización
        const specializationSelect = document.getElementById('specialization');
        if (specializationSelect && this.formData.specialization) {
            specializationSelect.value = this.formData.specialization;
        }

        // Años de experiencia
        const experienceSelect = document.getElementById('years_experience');
        if (experienceSelect && this.formData.yearsExperience) {
            experienceSelect.value = this.formData.yearsExperience;
        }

        // Ubicación
        if (this.formData.location) {
            const regionSelect = document.getElementById('region');
            if (regionSelect && this.formData.location.region) {
                regionSelect.value = this.formData.location.region;
            }
        }

        // Modalidades
        const modalityFields = ['online', 'presencial', 'domicilio'];
        modalityFields.forEach(field => {
            const checkbox = document.getElementById(field);
            if (checkbox && this.formData[field]) {
                checkbox.checked = this.formData[field];
            }
        });
    }

    attachEventListeners() {
        const form = document.getElementById('teacher-profile-form');
        form.addEventListener('submit', (e) => this.handleSubmit(e));

        const cancelBtn = document.getElementById('cancel-btn');
        cancelBtn.addEventListener('click', () => this.handleCancel());
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        try {
            const saveBtn = document.getElementById('save-btn');
            saveBtn.disabled = true;
            saveBtn.textContent = 'Guardando...';

            const formData = this.collectFormData();
            
            // Validar datos
            if (!this.validateFormData(formData)) {
                return;
            }

            // Guardar en localStorage temporalmente
            const profileKey = `teacher_profile_${this.teacherId || 'current'}`;
            localStorage.setItem(profileKey, JSON.stringify(formData));

            this.showSuccess('Perfil guardado correctamente');
            
            // Opcional: redirigir o cerrar modal
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);

        } catch (error) {
            console.error('❌ Error guardando perfil:', error);
            this.showError(error.message || 'Error guardando el perfil');
        } finally {
            const saveBtn = document.getElementById('save-btn');
            saveBtn.disabled = false;
            saveBtn.textContent = this.teacherId ? 'Actualizar Perfil' : 'Guardar Perfil';
        }
    }

    collectFormData() {
        return {
            specialization: document.getElementById('specialization').value,
            yearsExperience: document.getElementById('years_experience').value,
            bio: document.getElementById('bio').value,
            education: document.getElementById('education').value,
            skills: this.skillsSelector.getSelectedSkills(),
            location: {
                region: document.getElementById('region').value,
                comuna: document.getElementById('comuna').value
            },
            online: document.getElementById('online').checked,
            presencial: document.getElementById('presencial').checked,
            domicilio: document.getElementById('domicilio').checked,
            contactEmail: document.getElementById('contact_email').value,
            phone: document.getElementById('phone').value,
            ratePerHour: document.getElementById('rate_per_hour').value ? 
                         parseInt(document.getElementById('rate_per_hour').value) : null,
            updatedAt: new Date().toISOString()
        };
    }

    validateFormData(data) {
        if (data.skills.length === 0) {
            this.showError('Debes seleccionar al menos una habilidad');
            return false;
        }

        if (!data.specialization) {
            this.showError('Debes seleccionar una especialización');
            return false;
        }

        if (!data.online && !data.presencial && !data.domicilio) {
            this.showError('Debes seleccionar al menos una modalidad de atención');
            return false;
        }

        if (data.contactEmail && !this.isValidEmail(data.contactEmail)) {
            this.showError('El formato del email no es válido');
            return false;
        }

        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    handleCancel() {
        if (confirm('¿Estás seguro de cancelar? Los cambios no guardados se perderán.')) {
            window.location.href = 'dashboard.html';
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
        const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
        const icon = type === 'success' ? '✅' : '❌';
        
        notification.className = `fixed top-4 right-4 ${bgColor} border rounded-lg p-4 shadow-lg z-50`;
        notification.innerHTML = `
            <div class="flex items-center">
                <div class="mr-3">${icon}</div>
                <div class="${textColor}">${message}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }
}

// ====================================
// 🌐 EXPORTACIÓN GLOBAL
// ====================================

window.SkillsSelector = SkillsSelector;
window.TeacherProfileForm = TeacherProfileForm;

console.log('✅ Componentes UI de Skills cargados correctamente');