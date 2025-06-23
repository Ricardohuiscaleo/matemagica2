// math-mode-system.js - Sistema híbrido offline/online para Matemágica PWA
console.log('🔄 Inicializando sistema híbrido de modos...');

class MathModeSystem {
    constructor() {
        this.isOffline = true; // Por defecto empezamos en modo offline
        this.supabaseClient = null;
        this.userAuthenticated = false;
        this.initializeSystem();
    }

    async initializeSystem() {
        // ✅ CORREGIDO: Solo verificar conexión si hay usuario autenticado
        await this.checkAuthStatus();
        
        // Configurar event listeners
        this.setupModeToggleListeners();
        
        // Actualizar UI inicial
        this.updateModeDisplay();
        
        console.log('✅ Sistema híbrido inicializado');
    }

    async checkAuthStatus() {
        try {
            // Verificar si hay usuario autenticado
            const currentUser = localStorage.getItem('currentUser');
            this.userAuthenticated = !!currentUser;
            
            if (this.userAuthenticated && window.supabaseClient) {
                // ✅ CORREGIDO: Solo verificar sesión si hay cliente Supabase disponible
                try {
                    const { data: { session } } = await window.supabaseClient.auth.getSession();
                    if (session) {
                        this.supabaseClient = window.supabaseClient;
                        this.isOffline = false;
                        console.log('☁️ Usuario autenticado - Modo online disponible');
                    } else {
                        console.log('📱 Sin sesión válida - Manteniéndose en modo offline');
                        this.isOffline = true;
                    }
                } catch (sessionError) {
                    console.log('📱 Error verificando sesión - Manteniéndose en modo offline');
                    this.isOffline = true;
                }
            } else {
                console.log('📱 Sin autenticación - Modo offline por defecto');
                this.isOffline = true;
            }
        } catch (error) {
            console.warn('⚠️ Error verificando autenticación:', error.message || '');
            this.isOffline = true;
            this.userAuthenticated = false;
        }
    }

    setupModeToggleListeners() {
        // Buscar botones de toggle en todas las páginas
        const toggleButtons = document.querySelectorAll('#mode-toggle, .mode-toggle');
        
        toggleButtons.forEach(button => {
            button.addEventListener('click', () => this.toggleMode());
        });
    }

    async toggleMode() {
        // ✅ CORREGIDO: Solo permitir cambio si hay usuario autenticado
        if (!this.userAuthenticated) {
            this.showNotification('🔐 Inicia sesión para usar el modo online', 'warning');
            return;
        }

        const currentMode = this.isOffline;
        
        // Agregar animación de cambio
        const toggleBtn = document.getElementById('mode-toggle');
        if (toggleBtn) {
            toggleBtn.classList.add('changing');
        }

        if (currentMode) {
            // Cambiar a modo online
            const connected = await this.checkSupabaseConnection();
            if (connected) {
                this.isOffline = false;
                this.showNotification('🌐 Modo online activado - Datos en la nube', 'success');
                console.log('🌐 Cambiado a modo online');
            } else {
                this.showNotification('❌ No se pudo conectar a la nube. Manteniéndose offline', 'warning');
                console.warn('❌ No se pudo cambiar a modo online');
            }
        } else {
            // Cambiar a modo offline
            this.isOffline = true;
            this.showNotification('📱 Modo offline activado - Datos locales', 'success');
            console.log('📱 Cambiado a modo offline');
        }

        // Actualizar UI
        this.updateModeDisplay();
        
        // Guardar preferencia
        localStorage.setItem('preferredMode', this.isOffline ? 'offline' : 'online');

        // Quitar animación
        setTimeout(() => {
            if (toggleBtn) {
                toggleBtn.classList.remove('changing');
            }
        }, 600);
    }

    async checkSupabaseConnection() {
        try {
            if (!this.userAuthenticated) {
                console.log('📱 Sin autenticación - No se puede conectar a Supabase');
                return false;
            }

            if (window.supabaseClient) {
                // ✅ CORREGIDO: Verificar sesión antes de usar cliente
                const { data: { session } } = await window.supabaseClient.auth.getSession();
                if (session) {
                    this.supabaseClient = window.supabaseClient;
                    console.log('☁️ Supabase conectado correctamente');
                    return true;
                } else {
                    console.warn('⚠️ Sesión expirada - Modo offline');
                    return false;
                }
            } else {
                console.warn('⚠️ Cliente Supabase no disponible');
                return false;
            }
        } catch (error) {
            console.warn('⚠️ Error conectando a Supabase:', error.message || '');
            return false;
        }
    }

    updateModeDisplay() {
        // Actualizar botón toggle
        const toggleBtn = document.getElementById('mode-toggle');
        if (toggleBtn) {
            if (!this.userAuthenticated) {
                // Sin autenticación: mostrar que necesita login
                toggleBtn.className = 'mode-toggle auth-required';
                toggleBtn.innerHTML = `
                    <span class="mode-icon">🔐</span>
                    <span class="mode-text">Inicia sesión</span>
                `;
                toggleBtn.title = 'Inicia sesión para usar el modo online';
            } else if (this.isOffline) {
                toggleBtn.className = 'mode-toggle offline-mode';
                toggleBtn.innerHTML = `
                    <span class="mode-icon">📱</span>
                    <span class="mode-text">Offline</span>
                `;
                toggleBtn.title = 'Actualmente en modo offline. Click para cambiar a online';
            } else {
                toggleBtn.className = 'mode-toggle online-mode';
                toggleBtn.innerHTML = `
                    <span class="mode-icon">☁️</span>
                    <span class="mode-text">Online</span>
                `;
                toggleBtn.title = 'Actualmente en modo online. Click para cambiar a offline';
            }
        }

        // Actualizar indicador de estado
        const statusElement = document.getElementById('mode-status');
        if (statusElement) {
            if (!this.userAuthenticated) {
                statusElement.className = 'mode-status auth-required';
                statusElement.textContent = 'Sin autenticación';
            } else if (this.isOffline) {
                statusElement.className = 'mode-status offline';
                statusElement.textContent = 'Modo Offline';
            } else {
                statusElement.className = 'mode-status online';
                statusElement.textContent = 'Modo Online';
            }
        }

        // Actualizar botones de generación si existen
        this.updateGenerationButtons();
    }

    updateGenerationButtons() {
        const btnGenerarIA = document.getElementById('btn-generar-ia');
        const btnGenerarOffline = document.getElementById('btn-generar-offline');

        if (btnGenerarIA && btnGenerarOffline) {
            if (!this.userAuthenticated || this.isOffline) {
                // Sin auth o modo offline: deshabilitar IA, destacar offline
                btnGenerarIA.disabled = true;
                btnGenerarIA.textContent = this.userAuthenticated ? '🤖 IA (Sin conexión)' : '🤖 IA (Inicia sesión)';
                btnGenerarIA.style.opacity = '0.5';
                
                btnGenerarOffline.disabled = false;
                btnGenerarOffline.textContent = '📚 Generar Ejercicios';
                btnGenerarOffline.style.opacity = '1';
            } else {
                // Modo online: habilitar ambos
                btnGenerarIA.disabled = false;
                btnGenerarIA.textContent = '🤖 Generar con IA';
                btnGenerarIA.style.opacity = '1';
                
                btnGenerarOffline.disabled = false;
                btnGenerarOffline.textContent = '📚 Generar Offline';
                btnGenerarOffline.style.opacity = '1';
            }
        }
    }

    // ✅ CORREGIDO: Solo usar Supabase si hay usuario autenticado
    async saveDataHybrid(key, data) {
        const timestamp = new Date().toISOString();
        const dataWithMeta = {
            ...data,
            timestamp,
            source: this.isOffline ? 'local' : 'cloud',
            synced: false
        };

        // Siempre guardar localmente primero
        try {
            localStorage.setItem(`math_${key}`, JSON.stringify(dataWithMeta));
            console.log(`💾 Datos guardados localmente: ${key}`);
        } catch (error) {
            console.error('❌ Error guardando localmente:', error);
        }

        // Si estamos online Y autenticado, intentar guardar en la nube
        if (!this.isOffline && this.userAuthenticated && this.supabaseClient) {
            try {
                await this.saveToSupabase(key, dataWithMeta);
                dataWithMeta.synced = true;
                localStorage.setItem(`math_${key}`, JSON.stringify(dataWithMeta));
                console.log(`☁️ Datos sincronizados en la nube: ${key}`);
            } catch (error) {
                console.warn('⚠️ Error sincronizando con la nube:', error);
            }
        }

        return dataWithMeta;
    }

    async loadDataHybrid(key) {
        // Si estamos online Y autenticado, intentar cargar desde la nube primero
        if (!this.isOffline && this.userAuthenticated && this.supabaseClient) {
            try {
                const cloudData = await this.loadFromSupabase(key);
                if (cloudData) {
                    console.log(`☁️ Datos cargados desde la nube: ${key}`);
                    return cloudData;
                }
            } catch (error) {
                console.warn('⚠️ Error cargando desde la nube, usando datos locales:', error);
            }
        }

        // Cargar desde localStorage
        try {
            const localData = localStorage.getItem(`math_${key}`);
            if (localData) {
                const parsed = JSON.parse(localData);
                console.log(`💾 Datos cargados localmente: ${key}`);
                return parsed;
            }
        } catch (error) {
            console.error('❌ Error cargando datos locales:', error);
        }

        return null;
    }

    async saveToSupabase(key, data) {
        if (!this.supabaseClient || !this.userAuthenticated) {
            throw new Error('Supabase no disponible o usuario no autenticado');
        }

        const { error } = await this.supabaseClient
            .from('user_data')
            .upsert({
                user_id: this.getCurrentUserId(),
                data_key: key,
                data_value: data,
                updated_at: new Date().toISOString()
            });

        if (error) throw error;
    }

    async loadFromSupabase(key) {
        if (!this.supabaseClient || !this.userAuthenticated) {
            throw new Error('Supabase no disponible o usuario no autenticado');
        }

        const { data, error } = await this.supabaseClient
            .from('user_data')
            .select('data_value')
            .eq('user_id', this.getCurrentUserId())
            .eq('data_key', key)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data?.data_value || null;
    }

    getCurrentUserId() {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            try {
                return JSON.parse(userData).id;
            } catch (error) {
                console.error('Error parsing user data');
            }
        }
        return 'anonymous_' + Date.now();
    }

    // ✅ NUEVO: Método para actualizar estado de autenticación
    updateAuthStatus(isAuthenticated, userData = null) {
        this.userAuthenticated = isAuthenticated;
        if (isAuthenticated && userData) {
            localStorage.setItem('currentUser', JSON.stringify(userData));
        }
        this.updateModeDisplay();
        console.log(`🔐 Estado de autenticación actualizado: ${isAuthenticated ? 'autenticado' : 'no autenticado'}`);
    }

    showNotification(message, type = 'info') {
        // Reutilizar función de notificaciones si existe
        if (window.mostrarNotificacion) {
            window.mostrarNotificacion(message, type);
            return;
        }

        // Crear notificación básica
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            z-index: 1000;
            font-weight: 500;
            background-color: ${type === 'success' ? '#10B981' : type === 'warning' ? '#F59E0B' : '#3B82F6'};
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    // ✅ NUEVO: Método principal para generar ejercicios (requerido por tests)
    async generarEjercicio(nivel = 'medio') {
        try {
            console.log(`🎯 Generando ejercicio nivel: ${nivel}`);
            
            // Si tenemos IA disponible y estamos online
            if (!this.isOffline && this.userAuthenticated && window.GeminiAI) {
                try {
                    return await this.generarEjercicioConIA(nivel);
                } catch (error) {
                    console.warn('⚠️ Error con IA, usando plantillas:', error.message);
                    return this.generarEjercicioOffline(nivel);
                }
            }
            
            // Usar plantillas offline
            return this.generarEjercicioOffline(nivel);
            
        } catch (error) {
            console.error('❌ Error generando ejercicio:', error);
            throw error;
        }
    }

    // ✅ NUEVO: Generar ejercicio con IA
    async generarEjercicioConIA(nivel) {
        if (!window.GeminiAI) {
            throw new Error('Gemini AI no disponible');
        }

        const gemini = new window.GeminiAI();
        const prompt = this.crearPromptParaNivel(nivel);
        
        const response = await gemini.generateContent(prompt);
        
        // Intentar parsear respuesta JSON
        try {
            const ejercicio = JSON.parse(response);
            if (ejercicio.pregunta && ejercicio.respuesta !== undefined) {
                return {
                    ...ejercicio,
                    nivel,
                    fuente: 'ia',
                    timestamp: new Date().toISOString()
                };
            }
        } catch (parseError) {
            // Si no es JSON válido, crear ejercicio desde texto
            return this.extraerEjercicioDeTexto(response, nivel);
        }
        
        // Fallback si la IA falla
        return this.generarEjercicioOffline(nivel);
    }

    // ✅ NUEVO: Generar ejercicio offline con plantillas
    generarEjercicioOffline(nivel) {
        const configuracion = this.obtenerConfiguracionNivel(nivel);
        const operacion = Math.random() < 0.5 ? 'suma' : 'resta';
        
        let num1, num2, respuesta, pregunta;
        
        if (operacion === 'suma') {
            num1 = this.generarNumeroAleatorio(configuracion.min, configuracion.max);
            num2 = this.generarNumeroAleatorio(configuracion.min, configuracion.max);
            respuesta = num1 + num2;
            pregunta = `${num1} + ${num2} = ?`;
        } else {
            // Para resta, asegurarse de que el resultado sea positivo
            num1 = this.generarNumeroAleatorio(configuracion.min, configuracion.max);
            num2 = this.generarNumeroAleatorio(configuracion.min, Math.min(num1, configuracion.max));
            respuesta = num1 - num2;
            pregunta = `${num1} - ${num2} = ?`;
        }
        
        return {
            pregunta,
            respuesta,
            operacion,
            nivel,
            num1,
            num2,
            fuente: 'offline',
            timestamp: new Date().toISOString()
        };
    }

    // ✅ NUEVO: Configuración por nivel
    obtenerConfiguracionNivel(nivel) {
        const configuraciones = {
            facil: { min: 1, max: 20 },
            medio: { min: 10, max: 50 },
            dificil: { min: 20, max: 99 }
        };
        
        return configuraciones[nivel] || configuraciones.medio;
    }

    // ✅ NUEVO: Generar número aleatorio en rango
    generarNumeroAleatorio(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // ✅ NUEVO: Crear prompt para IA según nivel
    crearPromptParaNivel(nivel) {
        const configuracion = this.obtenerConfiguracionNivel(nivel);
        
        return `Genera un ejercicio de matemáticas para niños de 7-8 años.
        Nivel: ${nivel}
        Números entre ${configuracion.min} y ${configuracion.max}
        Solo sumas y restas.
        
        Responde SOLO con JSON válido:
        {
            "pregunta": "X + Y = ?",
            "respuesta": número,
            "operacion": "suma" o "resta"
        }`;
    }

    // ✅ NUEVO: Extraer ejercicio de texto de IA
    extraerEjercicioDeTexto(texto, nivel) {
        // Buscar patrones matemáticos en el texto
        const patronSuma = /(\d+)\s*\+\s*(\d+)/;
        const patronResta = /(\d+)\s*-\s*(\d+)/;
        
        let match = texto.match(patronSuma);
        if (match) {
            const num1 = parseInt(match[1]);
            const num2 = parseInt(match[2]);
            return {
                pregunta: `${num1} + ${num2} = ?`,
                respuesta: num1 + num2,
                operacion: 'suma',
                nivel,
                num1,
                num2,
                fuente: 'ia-extraido',
                timestamp: new Date().toISOString()
            };
        }
        
        match = texto.match(patronResta);
        if (match) {
            const num1 = parseInt(match[1]);
            const num2 = parseInt(match[2]);
            return {
                pregunta: `${num1} - ${num2} = ?`,
                respuesta: num1 - num2,
                operacion: 'resta',
                nivel,
                num1,
                num2,
                fuente: 'ia-extraido',
                timestamp: new Date().toISOString()
            };
        }
        
        // Fallback a generación offline
        return this.generarEjercicioOffline(nivel);
    }

    // ✅ NUEVO: Templates de ejercicios para tests
    get exerciseTemplates() {
        return {
            facil: [
                { pregunta: '5 + 3 = ?', respuesta: 8, operacion: 'suma' },
                { pregunta: '7 - 2 = ?', respuesta: 5, operacion: 'resta' },
                { pregunta: '4 + 6 = ?', respuesta: 10, operacion: 'suma' }
            ],
            medio: [
                { pregunta: '15 + 23 = ?', respuesta: 38, operacion: 'suma' },
                { pregunta: '45 - 17 = ?', respuesta: 28, operacion: 'resta' },
                { pregunta: '29 + 34 = ?', respuesta: 63, operacion: 'suma' }
            ],
            dificil: [
                { pregunta: '78 + 56 = ?', respuesta: 134, operacion: 'suma' },
                { pregunta: '91 - 47 = ?', respuesta: 44, operacion: 'resta' },
                { pregunta: '83 + 29 = ?', respuesta: 112, operacion: 'suma' }
            ]
        };
    }

    // ...existing code...
}

// ✅ CORREGIDO: Inicializar solo una vez y exportar globalmente
window.mathModeSystem = new MathModeSystem();

console.log('✅ Sistema híbrido cargado correctamente');