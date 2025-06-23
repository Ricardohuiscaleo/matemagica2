/**
 * ✅ COMPONENTE: BUSCADOR DE PROFESORES POR SKILLS
 * Interfaz para que apoderados busquen profesores especializados
 */

class TeacherSearchComponent {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            showFilters: true,
            showMap: false,
            resultsPerPage: 10,
            ...options
        };
        
        this.searchResults = [];
        this.currentFilters = {
            skills: [],
            specialization: '',
            minRating: 0,
            location: {},
            onlineOnly: false
        };
        
        this.skillsService = getSkillsService();
        this.init();
    }

    async init() {
        try {
            this.render();
            await this.initializeComponents();
            this.attachEventListeners();
            
            // Cargar resultados iniciales
            await this.performSearch();
            
        } catch (error) {
            console.error('❌ Error inicializando buscador:', error);
            this.showError('Error cargando el buscador de profesores');
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="teacher-search-component">
                <!-- Header con título y acciones -->
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-800">🔍 Buscar Profesores</h2>
                        <p class="text-gray-600 mt-1">Encuentra profesionales especializados para tu hijo/a</p>
                    </div>
                    <div class="flex space-x-3">
                        <button id="filters-toggle" 
                                class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v6.586a1 1 0 01-1.414.707l-2-1A1 1 0 0110 19.586V13.414a1 1 0 00-.293-.707L3.293 6.293A1 1 0 013 5.586V4z" />
                            </svg>
                            Filtros
                        </button>
                        <button id="clear-filters" 
                                class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                            Limpiar
                        </button>
                    </div>
                </div>

                <!-- Panel de filtros -->
                <div id="filters-panel" class="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                    ${this.renderFiltersPanel()}
                </div>

                <!-- Resultados -->
                <div id="search-results">
                    <div class="flex justify-between items-center mb-4">
                        <div id="results-summary" class="text-gray-600">
                            Cargando profesores...
                        </div>
                        <div class="flex items-center space-x-2">
                            <label class="text-sm text-gray-600">Ordenar por:</label>
                            <select id="sort-select" class="border border-gray-300 rounded px-3 py-1 text-sm">
                                <option value="match">Mejor coincidencia</option>
                                <option value="rating">Mejor calificación</option>
                                <option value="reviews">Más reseñas</option>
                                <option value="experience">Más experiencia</option>
                            </select>
                        </div>
                    </div>
                    
                    <div id="results-container" class="space-y-4">
                        <!-- Los resultados se cargan aquí -->
                    </div>

                    <!-- Paginación -->
                    <div id="pagination" class="mt-8">
                        <!-- Paginación se genera dinámicamente -->
                    </div>
                </div>
            </div>
        `;
    }

    renderFiltersPanel() {
        return `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Búsqueda por skills -->
                <div class="lg:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-3">
                        🎯 Especialidades que necesitas
                    </label>
                    <div id="skills-filter-container">
                        <!-- Skills selector se inicializa aquí -->
                    </div>
                </div>

                <!-- Filtros adicionales -->
                <div class="space-y-4">
                    <!-- Especialización -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Tipo de Profesional
                        </label>
                        <select id="specialization-filter" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                            <option value="">Todos los profesionales</option>
                            <option value="profesor_basica">Profesor Básica</option>
                            <option value="psicologo">Psicólogo Infantil</option>
                            <option value="fonoaudiologo">Fonoaudiólogo</option>
                            <option value="psicopedagogo">Psicopedagogo</option>
                            <option value="terapeuta_ocupacional">Terapeuta Ocupacional</option>
                            <option value="educador_diferencial">Educador Diferencial</option>
                        </select>
                    </div>

                    <!-- Rating mínimo -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Calificación mínima
                        </label>
                        <div class="flex items-center space-x-2">
                            <input type="range" 
                                   id="rating-filter" 
                                   min="0" 
                                   max="5" 
                                   step="0.5" 
                                   value="0"
                                   class="flex-1">
                            <span id="rating-display" class="text-sm text-gray-600 min-w-[3rem]">0+ ⭐</span>
                        </div>
                    </div>

                    <!-- Modalidad -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Modalidad
                        </label>
                        <div class="space-y-2">
                            <label class="flex items-center">
                                <input type="radio" name="modality" value="" checked class="mr-2">
                                <span class="text-sm">Todas las modalidades</span>
                            </label>
                            <label class="flex items-center">
                                <input type="radio" name="modality" value="online" class="mr-2">
                                <span class="text-sm">💻 Solo online</span>
                            </label>
                            <label class="flex items-center">
                                <input type="radio" name="modality" value="presencial" class="mr-2">
                                <span class="text-sm">🏢 Solo presencial</span>
                            </label>
                        </div>
                    </div>

                    <!-- Ubicación -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Región
                        </label>
                        <select id="region-filter" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                            <option value="">Todas las regiones</option>
                            <option value="metropolitana">Región Metropolitana</option>
                            <option value="valparaiso">Valparaíso</option>
                            <option value="biobio">Biobío</option>
                            <option value="araucania">Araucanía</option>
                        </select>
                    </div>

                    <!-- Botón de búsqueda -->
                    <button id="search-btn" 
                            class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Buscar Profesores
                    </button>
                </div>
            </div>
        `;
    }

    async initializeComponents() {
        // Inicializar selector de skills para filtros
        this.skillsSelector = new SkillsSelector('skills-filter-container', {
            allowMultiple: true,
            maxSelections: 5,
            showCategories: true,
            compact: true,
            onSkillsChange: (skills) => {
                this.currentFilters.skills = skills;
                this.debouncedSearch();
            }
        });
    }

    attachEventListeners() {
        // Toggle de filtros
        document.getElementById('filters-toggle').addEventListener('click', () => {
            const panel = document.getElementById('filters-panel');
            panel.classList.toggle('hidden');
        });

        // Limpiar filtros
        document.getElementById('clear-filters').addEventListener('click', () => {
            this.clearFilters();
        });

        // Búsqueda manual
        document.getElementById('search-btn').addEventListener('click', () => {
            this.performSearch();
        });

        // Filtros que disparan búsqueda automática
        document.getElementById('specialization-filter').addEventListener('change', (e) => {
            this.currentFilters.specialization = e.target.value;
            this.debouncedSearch();
        });

        document.getElementById('rating-filter').addEventListener('input', (e) => {
            const rating = parseFloat(e.target.value);
            this.currentFilters.minRating = rating;
            document.getElementById('rating-display').textContent = `${rating}+ ⭐`;
            this.debouncedSearch();
        });

        document.getElementById('region-filter').addEventListener('change', (e) => {
            this.currentFilters.location.region = e.target.value;
            this.debouncedSearch();
        });

        // Modalidad
        document.querySelectorAll('input[name="modality"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.currentFilters.onlineOnly = e.target.value === 'online';
                if (e.target.value === 'presencial') {
                    this.currentFilters.location.presencial = true;
                    this.currentFilters.location.online = false;
                } else if (e.target.value === 'online') {
                    this.currentFilters.location.online = true;
                    this.currentFilters.location.presencial = false;
                } else {
                    this.currentFilters.location = {};
                }
                this.debouncedSearch();
            });
        });

        // Ordenamiento
        document.getElementById('sort-select').addEventListener('change', () => {
            this.sortAndRenderResults();
        });
    }

    // Búsqueda con debounce para evitar demasiadas consultas
    debouncedSearch = this.debounce(() => {
        this.performSearch();
    }, 500);

    async performSearch() {
        try {
            this.showLoading();

            const results = await this.skillsService.searchTeachersBySkills({
                skills: this.currentFilters.skills,
                specialization: this.currentFilters.specialization,
                minRating: this.currentFilters.minRating,
                location: this.currentFilters.location,
                onlineOnly: this.currentFilters.onlineOnly,
                maxResults: 100
            });

            this.searchResults = results;
            this.renderResults();

        } catch (error) {
            console.error('❌ Error en búsqueda:', error);
            this.showError('Error realizando la búsqueda. Intenta nuevamente.');
        }
    }

    renderResults() {
        const container = document.getElementById('results-container');
        const summary = document.getElementById('results-summary');

        // Actualizar resumen
        const total = this.searchResults.length;
        summary.textContent = `${total} profesor${total !== 1 ? 'es' : ''} encontrado${total !== 1 ? 's' : ''}`;

        if (total === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="text-6xl mb-4">🔍</div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">No se encontraron profesores</h3>
                    <p class="text-gray-600 mb-4">Intenta ajustar los filtros de búsqueda</p>
                    <button onclick="this.clearFilters()" class="text-blue-600 hover:text-blue-800">
                        Limpiar filtros y buscar nuevamente
                    </button>
                </div>
            `;
            return;
        }

        // Renderizar tarjetas de profesores
        container.innerHTML = this.searchResults
            .slice(0, this.options.resultsPerPage)
            .map(teacher => this.renderTeacherCard(teacher))
            .join('');
    }

    renderTeacherCard(teacher) {
        const skillsText = teacher.skillsDetails?.map(s => s.skill_name).join(', ') || 
                          (teacher.skills || []).join(', ');
        
        const ratingStars = '⭐'.repeat(Math.floor(teacher.rating || 0));
        const hasLocation = teacher.location?.region || teacher.location?.comuna;
        
        return `
            <div class="teacher-card bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div class="flex items-start space-x-4">
                    <!-- Avatar -->
                    <div class="flex-shrink-0">
                        <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                            ${teacher.full_name.charAt(0).toUpperCase()}
                        </div>
                    </div>

                    <!-- Información principal -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between">
                            <div>
                                <h3 class="text-lg font-semibold text-gray-900 truncate">
                                    ${teacher.full_name}
                                </h3>
                                <p class="text-sm text-blue-600 font-medium">
                                    ${this.getSpecializationName(teacher.specialization)}
                                </p>
                            </div>
                            
                            <div class="text-right">
                                <div class="flex items-center text-sm text-gray-600">
                                    <span class="text-yellow-500">${ratingStars}</span>
                                    <span class="ml-1">${teacher.rating || '0.0'}</span>
                                    <span class="ml-1">(${teacher.total_reviews || 0})</span>
                                </div>
                                ${teacher.skill_match_score > 0 ? `
                                    <div class="text-xs text-green-600 font-medium mt-1">
                                        ${teacher.skill_match_score} coincidencia${teacher.skill_match_score !== 1 ? 's' : ''}
                                    </div>
                                ` : ''}
                            </div>
                        </div>

                        <!-- Experiencia y ubicación -->
                        <div class="mt-2 flex items-center text-sm text-gray-600 space-x-4">
                            <span>📚 ${teacher.years_experience || 0} años de experiencia</span>
                            ${hasLocation ? `
                                <span>📍 ${teacher.location.comuna || teacher.location.region || ''}</span>
                            ` : ''}
                        </div>

                        <!-- Skills -->
                        ${skillsText ? `
                            <div class="mt-3">
                                <p class="text-sm text-gray-700">
                                    <span class="font-medium">Especialidades:</span> ${skillsText}
                                </p>
                            </div>
                        ` : ''}

                        <!-- Modalidades -->
                        <div class="mt-3 flex items-center space-x-2">
                            ${teacher.location?.online ? '<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">💻 Online</span>' : ''}
                            ${teacher.location?.presencial ? '<span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">🏢 Presencial</span>' : ''}
                            ${teacher.is_verified ? '<span class="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">✓ Verificado</span>' : ''}
                        </div>

                        <!-- Bio breve -->
                        ${teacher.bio ? `
                            <p class="mt-3 text-sm text-gray-600 line-clamp-2">
                                ${teacher.bio.substring(0, 150)}${teacher.bio.length > 150 ? '...' : ''}
                            </p>
                        ` : ''}

                        <!-- Acciones -->
                        <div class="mt-4 flex space-x-3">
                            <button onclick="teacherSearch.viewProfile('${teacher.teacher_id}')" 
                                    class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                                Ver Perfil
                            </button>
                            <button onclick="teacherSearch.contactTeacher('${teacher.teacher_id}')" 
                                    class="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                                Contactar
                            </button>
                            <button onclick="teacherSearch.requestAssignment('${teacher.teacher_id}')" 
                                    class="px-4 py-2 border border-blue-300 text-blue-700 text-sm rounded-lg hover:bg-blue-50 transition-colors">
                                Solicitar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    sortAndRenderResults() {
        const sortBy = document.getElementById('sort-select').value;
        
        this.searchResults.sort((a, b) => {
            switch (sortBy) {
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0);
                case 'reviews':
                    return (b.total_reviews || 0) - (a.total_reviews || 0);
                case 'experience':
                    return (b.years_experience || 0) - (a.years_experience || 0);
                case 'match':
                default:
                    if (b.skill_match_score !== a.skill_match_score) {
                        return b.skill_match_score - a.skill_match_score;
                    }
                    return (b.rating || 0) - (a.rating || 0);
            }
        });

        this.renderResults();
    }

    clearFilters() {
        this.currentFilters = {
            skills: [],
            specialization: '',
            minRating: 0,
            location: {},
            onlineOnly: false
        };

        // Limpiar UI
        this.skillsSelector.clear();
        document.getElementById('specialization-filter').value = '';
        document.getElementById('rating-filter').value = '0';
        document.getElementById('rating-display').textContent = '0+ ⭐';
        document.getElementById('region-filter').value = '';
        document.querySelector('input[name="modality"][value=""]').checked = true;

        this.performSearch();
    }

    showLoading() {
        document.getElementById('results-container').innerHTML = `
            <div class="text-center py-8">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p class="mt-4 text-gray-600">Buscando profesores...</p>
            </div>
        `;
    }

    showError(message) {
        document.getElementById('results-container').innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <div class="flex">
                    <div class="text-red-400 mr-3">⚠️</div>
                    <div class="text-red-800">${message}</div>
                </div>
            </div>
        `;
    }

    // Métodos públicos para acciones de los botones
    viewProfile(teacherId) {
        // Abrir modal o navegar a perfil del profesor
        window.open(`/profesor-profile.html?id=${teacherId}`, '_blank');
    }

    contactTeacher(teacherId) {
        // Abrir chat o formulario de contacto
        console.log('Contactar profesor:', teacherId);
        // Implementar lógica de contacto
    }

    async requestAssignment(teacherId) {
        // Crear solicitud de asignación
        try {
            const result = await this.skillsService.createTeacherRequest({
                teacherId,
                studentId: this.getCurrentStudentId(), // Implementar
                requestedBy: getCurrentUserId(),
                requestType: 'assignment',
                skillsNeeded: this.currentFilters.skills,
                notes: 'Solicitud desde búsqueda de profesores'
            });

            alert('✅ Solicitud enviada correctamente al profesor');
            
        } catch (error) {
            console.error('❌ Error enviando solicitud:', error);
            alert('❌ Error enviando la solicitud. Intenta nuevamente.');
        }
    }

    // Utilidades
    getSpecializationName(specialization) {
        const names = {
            'profesor_basica': 'Profesor de Educación Básica',
            'psicologo': 'Psicólogo Infantil',
            'fonoaudiologo': 'Fonoaudiólogo',
            'psicopedagogo': 'Psicopedagogo',
            'terapeuta_ocupacional': 'Terapeuta Ocupacional',
            'educador_diferencial': 'Educador Diferencial'
        };
        return names[specialization] || specialization || 'Profesional';
    }

    getCurrentStudentId() {
        // Implementar lógica para obtener ID del estudiante actual
        // Puede ser desde localStorage, parámetros URL, etc.
        return localStorage.getItem('current_student_id') || null;
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Export global
window.TeacherSearchComponent = TeacherSearchComponent;