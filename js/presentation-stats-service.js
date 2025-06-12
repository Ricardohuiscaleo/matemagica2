/**
 * 📊 Presentation Stats Service
 * Servicio para manejar estadísticas de presentaciones con Supabase
 * Incluye fallback offline con LocalStorage
 */

class PresentationStatsService {
    constructor() {
        this.supabaseUrl = null;
        this.supabaseKey = null;
        this.isOnline = navigator.onLine;
        this.sessionId = this.generateSessionId();
        this.initializeSupabase();
        this.setupOnlineListener();
    }

    // Inicializar configuración de Supabase
    async initializeSupabase() {
        try {
            // Cargar configuración desde config service existente
            if (window.ConfigService) {
                const config = await window.ConfigService.getConfig();
                this.supabaseUrl = config.supabase?.url;
                this.supabaseKey = config.supabase?.anonKey;
            }
        } catch (error) {
            console.warn('⚠️ No se pudo cargar configuración de Supabase:', error);
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
                p_presentacion_id: datos.presentacion_id,
                p_titulo: datos.titulo,
                p_session_id: datos.session_id,
                p_ip_hash: datos.ip_hash,
                p_user_agent_hash: datos.user_agent_hash,
                p_duracion_segundos: datos.duracion_segundos,
                p_dispositivo: datos.dispositivo,
                p_referrer: datos.referrer
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