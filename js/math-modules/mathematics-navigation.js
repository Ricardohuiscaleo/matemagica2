/**
 * 🧮 MÓDULO: NAVEGACIÓN DE MATEMÁTICAS
 * Matemágica PWA - Sistema educativo
 * Maneja todos los módulos de matemáticas de 2° Básico
 */

class MathematicsNavigationModule {
    constructor() {
        this.currentView = 'dashboard';
        this.currentStudentData = null;
        this.availableModules = {
            'adicion-sustraccion': {
                id: 'adicion-sustraccion',
                title: 'Adición y Sustracción',
                icon: '🧮',
                description: 'Suma y resta con reserva',
                status: 'available',
                badge: 'Sistema VERTICAL disponible',
                badgeColor: 'green',
                subtemas: ['Sumas sin reserva', 'Restas sin reserva', 'Sumas con reserva', 'Restas con reserva']
            },
            'calculo-mental': {
                id: 'calculo-mental',
                title: 'Cálculo Mental',
                icon: '🧠',
                description: 'Estrategias para calcular mentalmente',
                status: 'coming-soon',
                badge: 'Próximamente',
                badgeColor: 'yellow',
                subtemas: ['Dobles', 'Casi dobles', 'Conteo hacia adelante', 'Conteo hacia atrás']
            },
            'comparacion-orden': {
                id: 'comparacion-orden',
                title: 'Comparación y Orden',
                icon: '📊',
                description: 'Comparar y ordenar números',
                status: 'coming-soon',
                badge: 'Próximamente',
                badgeColor: 'yellow',
                subtemas: ['Mayor que', 'Menor que', 'Igual a', 'Secuencias numéricas']
            },
            'conteo-agrupacion': {
                id: 'conteo-agrupacion',
                title: 'Conteo y Agrupación',
                icon: '🔢',
                description: 'Contar números del 0 al 1000',
                status: 'coming-soon',
                badge: 'Próximamente',
                badgeColor: 'yellow',
                subtemas: ['Conteo de 2 en 2', 'Conteo de 5 en 5', 'Conteo de 10 en 10', 'Formar grupos']
            },
            'composicion-descomposicion': {
                id: 'composicion-descomposicion',
                title: 'Composición y Descomposición',
                icon: '🧩',
                description: 'Formar y separar números',
                status: 'coming-soon',
                badge: 'Próximamente',
                badgeColor: 'yellow',
                subtemas: ['Descomposición aditiva', 'Valor posicional', 'Diferentes representaciones']
            },
            'unidades-decenas': {
                id: 'unidades-decenas',
                title: 'Unidades y Decenas',
                icon: '🎯',
                description: 'Identificar valor posicional hasta 100',
                status: 'coming-soon',
                badge: 'Próximamente',
                badgeColor: 'yellow',
                subtemas: ['Concepto de decena', 'Unidades', 'Representación posicional']
            }
        };
    }

    // ✅ RENDERIZAR INTERFAZ PRINCIPAL DE MATEMÁTICAS
    async renderMathematicsInterface(studentData) {
        this.currentStudentData = studentData;
        
        const content = document.getElementById('matematicas-segundo-content');
        if (!content) return;
        
        content.innerHTML = `
            <div class="p-6">
                <!-- Botón volver -->
                <div class="mb-6">
                    <button onclick="mathematicsNavigation.goBackToDashboard()" class="text-blue-600 hover:text-blue-800 flex items-center transition-colors">
                        <i class="fas fa-arrow-left mr-2"></i>Volver al Dashboard
                    </button>
                </div>
                
                <!-- Header del módulo -->
                <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg text-white p-6 mb-8">
                    <h2 class="text-2xl font-bold mb-2">🧮 Matemáticas - 2° Básico</h2>
                    <p class="text-blue-100 mb-4">Números y Operaciones Básicas</p>
                    <div class="bg-white bg-opacity-20 rounded-full h-3 mb-2">
                        <div class="bg-yellow-400 h-3 rounded-full transition-all duration-500" style="width: 75%"></div>
                    </div>
                    <div class="text-sm text-blue-100">Ejercicios interactivos • ${studentData?.name || 'Estudiante'}</div>
                </div>

                <!-- Grid de temas -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="temas-grid">
                    ${this.renderTopicsGrid()}
                </div>
            </div>
        `;
    }

    // ✅ RENDERIZAR GRID DE TEMAS
    renderTopicsGrid() {
        return Object.values(this.availableModules).map(tema => this.createTopicCard(tema)).join('');
    }

    // ✅ CREAR TARJETA DE TEMA
    createTopicCard(tema) {
        const isAvailable = tema.status === 'available';
        const statusColors = {
            available: { bg: 'bg-green-100', text: 'text-green-800', icon: '✅' },
            'coming-soon': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '🚧' }
        };
        
        const statusColor = statusColors[tema.status] || statusColors['coming-soon'];
        const buttonClass = isAvailable 
            ? 'bg-blue-500 hover:bg-blue-600 text-white' 
            : 'bg-gray-300 text-gray-600 cursor-not-allowed';
        
        const actionText = isAvailable 
            ? `${tema.icon} Practicar Ahora` 
            : `🔜 ${tema.badge}`;

        return `
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group ${isAvailable ? '' : 'opacity-75'}">
                <div class="flex justify-between items-start mb-3">
                    <h3 class="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors">
                        ${tema.icon} ${tema.title}
                    </h3>
                    <span class="text-xs px-2 py-1 ${statusColor.bg} ${statusColor.text} rounded-full flex items-center">
                        <span class="mr-1">${statusColor.icon}</span>${tema.badge}
                    </span>
                </div>
                
                <p class="text-gray-600 text-sm mb-4">${tema.description}</p>
                
                <div class="mb-4">
                    <div class="flex flex-wrap gap-1">
                        ${tema.subtemas.map(subtema => 
                            `<span class="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">${subtema}</span>`
                        ).join('')}
                    </div>
                </div>
                
                <button 
                    class="w-full py-2 px-4 font-medium rounded-lg transition-colors ${buttonClass}"
                    ${isAvailable ? '' : 'disabled'}
                    onclick="${isAvailable ? `mathematicsNavigation.openModule('${tema.id}', '${tema.title}')` : ''}">
                    ${actionText}
                </button>
            </div>
        `;
    }

    // ✅ ABRIR MÓDULO ESPECÍFICO
    async openModule(moduleId, moduleTitle) {
        console.log(`🧮 Abriendo módulo: ${moduleId} - ${moduleTitle}`);
        
        try {
            // Verificar si el módulo está disponible
            const module = this.availableModules[moduleId];
            if (!module || module.status !== 'available') {
                this.showInfoToast(`El módulo "${moduleTitle}" estará disponible próximamente`);
                return;
            }

            // Manejar módulos específicos
            switch (moduleId) {
                case 'adicion-sustraccion':
                    await this.openAdicionSustraccionModule();
                    break;
                case 'calculo-mental':
                    this.showInfoToast('El módulo de Cálculo Mental estará disponible próximamente');
                    break;
                case 'comparacion-orden':
                    this.showInfoToast('El módulo de Comparación y Orden estará disponible próximamente');
                    break;
                case 'conteo-agrupacion':
                    this.showInfoToast('El módulo de Conteo y Agrupación estará disponible próximamente');
                    break;
                case 'composicion-descomposicion':
                    this.showInfoToast('El módulo de Composición y Descomposición estará disponible próximamente');
                    break;
                case 'unidades-decenas':
                    this.showInfoToast('El módulo de Unidades y Decenas estará disponible próximamente');
                    break;
                default:
                    this.showErrorToast(`Módulo "${moduleTitle}" no encontrado`);
            }
        } catch (error) {
            console.error('Error abriendo módulo:', error);
            this.showErrorToast('Error al abrir el módulo. Inténtalo de nuevo.');
        }
    }

    // ✅ ABRIR MÓDULO DE ADICIÓN Y SUSTRACCIÓN
    async openAdicionSustraccionModule() {
        try {
            // Verificar que el módulo esté cargado
            if (!window.adicionSustraccionModule) {
                this.showErrorToast('Módulo de Adición y Sustracción no está cargado');
                return;
            }

            // Ocultar contenido de matemáticas
            const mathematicsContent = document.getElementById('matematicas-segundo-content');
            const dashboardContent = document.getElementById('dashboard-content');
            
            if (mathematicsContent) mathematicsContent.classList.add('hidden');
            if (dashboardContent) dashboardContent.classList.add('hidden');

            // Renderizar interfaz del módulo
            await window.adicionSustraccionModule.renderFullscreenInterface(this.currentStudentData);
            
            console.log('✅ Módulo de Adición y Sustracción cargado correctamente');
            
        } catch (error) {
            console.error('Error cargando módulo de Adición y Sustracción:', error);
            this.showErrorToast('Error al cargar el módulo. Inténtalo de nuevo.');
        }
    }

    // ✅ VOLVER AL DASHBOARD PRINCIPAL
    goBackToDashboard() {
        try {
            const mathematicsContent = document.getElementById('matematicas-segundo-content');
            const dashboardContent = document.getElementById('dashboard-content');
            
            if (mathematicsContent) mathematicsContent.classList.add('hidden');
            if (dashboardContent) dashboardContent.classList.remove('hidden');
            
            this.currentView = 'dashboard';
            console.log('🔙 Regresando al dashboard principal');
            
        } catch (error) {
            console.error('Error regresando al dashboard:', error);
            // Fallback: recargar página
            location.reload();
        }
    }

    // ✅ MOSTRAR MATEMÁTICAS DESDE DASHBOARD
    async showMathematicsFromDashboard(studentData) {
        try {
            this.currentView = 'matematicas-segundo';
            this.currentStudentData = studentData;
            
            const dashboardContent = document.getElementById('dashboard-content');
            const mathematicsContent = document.getElementById('matematicas-segundo-content');
            
            if (dashboardContent) dashboardContent.classList.add('hidden');
            if (mathematicsContent) {
                mathematicsContent.classList.remove('hidden');
                
                // ✅ RENDERIZAR SIEMPRE LA INTERFAZ PARA ASEGURAR CONTENIDO
                await this.renderMathematicsInterface(studentData);
            }
            
            console.log('🧮 Interfaz de matemáticas renderizada y visible');
            
        } catch (error) {
            console.error('Error mostrando matemáticas:', error);
            this.showErrorToast('Error al cargar matemáticas');
        }
    }

    // ✅ ACTUALIZAR PROGRESO DE ESTUDIANTE
    updateStudentProgress(studentData) {
        this.currentStudentData = studentData;
        
        // Actualizar nombre en header si está visible
        const studentNameElement = document.querySelector('#matematicas-segundo-content .text-blue-100');
        if (studentNameElement && studentData?.name) {
            studentNameElement.textContent = `Ejercicios interactivos • ${studentData.name}`;
        }
    }

    // ✅ OBTENER ESTADO DEL MÓDULO
    getModuleStatus(moduleId) {
        const module = this.availableModules[moduleId];
        return module ? module.status : 'not-found';
    }

    // ✅ MARCAR MÓDULO COMO COMPLETADO
    markModuleAsCompleted(moduleId) {
        if (this.availableModules[moduleId]) {
            this.availableModules[moduleId].completed = true;
            console.log(`✅ Módulo ${moduleId} marcado como completado`);
        }
    }

    // ✅ OBTENER PROGRESO GENERAL
    getOverallProgress() {
        const totalModules = Object.keys(this.availableModules).length;
        const availableModules = Object.values(this.availableModules).filter(m => m.status === 'available').length;
        const completedModules = Object.values(this.availableModules).filter(m => m.completed).length;
        
        return {
            total: totalModules,
            available: availableModules,
            completed: completedModules,
            progress: totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0
        };
    }

    // ✅ SISTEMA DE NOTIFICACIONES
    showErrorToast(message) {
        this.showToast(message, 'error');
    }

    showInfoToast(message) {
        this.showToast(message, 'info');
    }

    showSuccessToast(message) {
        this.showToast(message, 'success');
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container') || this.createToastContainer();
        const toast = document.createElement('div');
        
        const colors = {
            error: 'bg-red-500 text-white',
            success: 'bg-green-500 text-white',
            info: 'bg-blue-500 text-white'
        };
        
        toast.className = `${colors[type]} px-4 py-3 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300`;
        toast.innerHTML = `
            <div class="flex items-center justify-between">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-3 text-white hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => toast.classList.remove('translate-x-full'), 100);
        
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed bottom-4 right-4 z-50 space-y-2';
        document.body.appendChild(container);
        return container;
    }
}

// ✅ CREAR INSTANCIA GLOBAL
window.mathematicsNavigation = new MathematicsNavigationModule();