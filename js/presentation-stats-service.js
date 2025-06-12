/**
 * 📊 Presentation Stats Service
 * Servicio para manejar estadísticas de presentaciones con Supabase
 * Incluye fallback offline con LocalStorage
 */

class PresentationStatsService {
    constructor() {
        // Configuración de Supabase actualizada
        this.supabaseUrl = 'https://uznvakpuuxnpdhoejrog.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bnZha3B1dXhucGRob2Vqcm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODg0MTAsImV4cCI6MjA2NDY2NDQxMH0.OxbLYkjlgpWFnqd28gaZSwar_NQ6_qUS3U76bqbcXVg';
        this.isOnline = navigator.onLine;
        this.sessionId = this.generateSessionId();
        this.initializeSupabase();
        this.setupOnlineListener();
    }

    // Inicializar configuración de Supabase
    async initializeSupabase() {
        try {
            // Intentar cargar configuración desde config service existente
            if (window.ConfigService) {
                const config = await window.ConfigService.loadConfig();
                if (config.supabase?.url) {
                    this.supabaseUrl = config.supabase.url;
                    this.supabaseKey = config.supabase.anonKey;
                    console.log('✅ Configuración Supabase cargada desde ConfigService');
                }
            }
            
            // Verificar que tenemos configuración válida
            if (this.supabaseUrl && this.supabaseKey && !this.supabaseUrl.includes('tu-proyecto')) {
                console.log('✅ Configuración Supabase válida encontrada');
            } else {
                console.warn('⚠️ Usando configuración hardcoded de Supabase');
            }
        } catch (error) {
            console.warn('⚠️ No se pudo cargar configuración de Supabase, usando valores por defecto:', error);
        }
    }

    // Generar ID único de sesión
    generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    // Detectar tipo de dispositivo
    getDeviceType() {
        const width = window.innerWidth;
        if (width <= 768) return 'mobile';
        if (width <= 1024) return 'tablet';
        return 'desktop';
    }

    // Hash simple para anonimizar datos
    simpleHash(str) {
        let hash = 0;
        if (!str) return hash.toString();
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convertir a 32-bit
        }
        return hash.toString();
    }

    // Listener para cambios de conectividad
    setupOnlineListener() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.sincronizarEstadisticasPendientes();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    // Registrar visualización de presentación
    async registrarVisualizacion(presentacionId, titulo = null, duracionSegundos = null) {
        const datosVisualizacion = {
            presentacion_id: presentacionId,
            titulo: titulo || presentacionId,
            session_id: this.sessionId,
            ip_hash: this.simpleHash(this.getClientIP()),
            user_agent_hash: this.simpleHash(navigator.userAgent),
            duracion_segundos: duracionSegundos,
            dispositivo: this.getDeviceType(),
            referrer: document.referrer || null
        };

        try {
            if (this.isOnline && this.supabaseUrl && this.supabaseKey) {
                // Enviar a Supabase si está online
                await this.enviarASupabase(datosVisualizacion);
            } else {
                // Guardar offline para sincronizar después
                this.guardarOffline(datosVisualizacion);
            }

            // Siempre actualizar LocalStorage para UI inmediata
            this.actualizarLocalStorage(presentacionId);

            return true;
        } catch (error) {
            console.warn('⚠️ Error registrando visualización:', error);
            // Fallback: solo LocalStorage
            this.guardarOffline(datosVisualizacion);
            this.actualizarLocalStorage(presentacionId);
            return false;
        }
    }

    // Enviar datos a Supabase
    async enviarASupabase(datos) {
        const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/increment_presentation_view`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': this.supabaseKey,
                'Authorization': `Bearer ${this.supabaseKey}`
            },
            body: JSON.stringify({
                presentacion_id_param: datos.presentacion_id,
                titulo_param: datos.titulo
            })
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        return await response.json();
    }

    // Guardar offline para sincronizar después
    guardarOffline(datos) {
        const pendientes = JSON.parse(localStorage.getItem('gaby-stats-pendientes') || '[]');
        pendientes.push({
            ...datos,
            timestamp: Date.now()
        });
        localStorage.setItem('gaby-stats-pendientes', JSON.stringify(pendientes));
    }

    // Actualizar LocalStorage para UI inmediata
    actualizarLocalStorage(presentacionId) {
        const estadisticas = JSON.parse(localStorage.getItem('gaby-presentaciones-stats') || '{}');
        estadisticas[presentacionId] = (estadisticas[presentacionId] || 0) + 1;
        localStorage.setItem('gaby-presentaciones-stats', JSON.stringify(estadisticas));
    }

    // Sincronizar estadísticas pendientes cuando vuelva la conexión
    async sincronizarEstadisticasPendientes() {
        const pendientes = JSON.parse(localStorage.getItem('gaby-stats-pendientes') || '[]');
        
        if (pendientes.length === 0) return;

        console.log(`🔄 Sincronizando ${pendientes.length} estadísticas pendientes...`);

        for (const datos of pendientes) {
            try {
                await this.enviarASupabase(datos);
            } catch (error) {
                console.warn('⚠️ Error sincronizando:', error);
                return; // Detener si hay errores
            }
        }

        // Limpiar pendientes si todo salió bien
        localStorage.removeItem('gaby-stats-pendientes');
        console.log('✅ Sincronización completada');
    }

    // Obtener estadísticas desde Supabase
    async obtenerEstadisticasOnline() {
        if (!this.isOnline || !this.supabaseUrl || !this.supabaseKey) {
            return null;
        }

        try {
            const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/get_all_presentation_stats`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`
                }
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.warn('⚠️ Error obteniendo estadísticas online:', error);
            return null;
        }
    }

    // Obtener estadísticas combinadas (online + offline)
    async obtenerEstadisticasCombinadas() {
        const estadisticasLocal = JSON.parse(localStorage.getItem('gaby-presentaciones-stats') || '{}');
        
        // Intentar obtener estadísticas online
        const estadisticasOnline = await this.obtenerEstadisticasOnline();
        
        if (estadisticasOnline && Array.isArray(estadisticasOnline)) {
            // Combinar estadísticas online con locales
            const resultado = {
                'historia-celular': estadisticasLocal['historia-celular'] || 0,
                'ciencias-naturales': estadisticasLocal['ciencias-naturales'] || 0,
                'literatura': estadisticasLocal['literatura'] || 0,
                total: 0,
                online: estadisticasOnline,
                isOnline: true
            };

            // Agregar datos online si están disponibles
            estadisticasOnline.forEach(stat => {
                if (resultado[stat.presentacion_id] !== undefined) {
                    resultado[stat.presentacion_id] = stat.total_visualizaciones;
                }
            });

            resultado.total = resultado['historia-celular'] + 
                           resultado['ciencias-naturales'] + 
                           resultado['literatura'];

            return resultado;
        } else {
            // Solo estadísticas locales
            const total = Object.values(estadisticasLocal).reduce((sum, val) => sum + val, 0);
            return {
                'historia-celular': estadisticasLocal['historia-celular'] || 0,
                'ciencias-naturales': estadisticasLocal['ciencias-naturales'] || 0,
                'literatura': estadisticasLocal['literatura'] || 0,
                total,
                online: null,
                isOnline: false
            };
        }
    }

    // Obtener IP del cliente (método simple)
    getClientIP() {
        // En producción esto se haría mejor, pero para demo es suficiente
        return 'client_' + this.sessionId;
    }
}

// Crear instancia global
window.PresentationStatsService = new PresentationStatsService();