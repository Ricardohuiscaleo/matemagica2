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
            timestamp: new Date().toISOString(),
            referrer: document.referrer || 'direct',
            viewport: `${window.innerWidth}x${window.innerHeight}`
        };

        try {
            if (this.isOnline) {
                await this.enviarASupabase('presentacion_stats', datosVisualizacion);
                console.log('✅ Visualización registrada en Supabase');
            } else {
                this.guardarOffline('visualizaciones', datosVisualizacion);
                console.log('💾 Visualización guardada offline');
            }
        } catch (error) {
            console.warn('⚠️ Error registrando visualización:', error);
            this.guardarOffline('visualizaciones', datosVisualizacion);
        }
    }

    // Registrar interacción del usuario
    async registrarInteraccion(tipo, elemento, valor = null) {
        const datosInteraccion = {
            session_id: this.sessionId,
            tipo_interaccion: tipo,
            elemento: elemento,
            valor: valor,
            timestamp: new Date().toISOString(),
            dispositivo: this.getDeviceType()
        };

        try {
            if (this.isOnline) {
                await this.enviarASupabase('interacciones_stats', datosInteraccion);
            } else {
                this.guardarOffline('interacciones', datosInteraccion);
            }
        } catch (error) {
            console.warn('⚠️ Error registrando interacción:', error);
            this.guardarOffline('interacciones', datosInteraccion);
        }
    }

    // Registrar tiempo en página/slide
    async registrarTiempoEnPagina(pagina, tiempoSegundos) {
        const datosTiempo = {
            session_id: this.sessionId,
            pagina: pagina,
            tiempo_segundos: tiempoSegundos,
            timestamp: new Date().toISOString(),
            dispositivo: this.getDeviceType()
        };

        try {
            if (this.isOnline) {
                await this.enviarASupabase('tiempo_pagina_stats', datosTiempo);
            } else {
                this.guardarOffline('tiempos', datosTiempo);
            }
        } catch (error) {
            console.warn('⚠️ Error registrando tiempo:', error);
            this.guardarOffline('tiempos', datosTiempo);
        }
    }

    // Enviar datos a Supabase
    async enviarASupabase(tabla, datos) {
        const response = await fetch(`${this.supabaseUrl}/rest/v1/${tabla}`, {
            method: 'POST',
            headers: {
                'apikey': this.supabaseKey,
                'Authorization': `Bearer ${this.supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(datos)
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        return response;
    }

    // Guardar datos offline
    guardarOffline(categoria, datos) {
        try {
            const key = `stats_${categoria}_offline`;
            const existing = JSON.parse(localStorage.getItem(key) || '[]');
            existing.push({
                ...datos,
                _offline_timestamp: Date.now()
            });
            
            // Mantener solo los últimos 100 registros por categoría
            if (existing.length > 100) {
                existing.splice(0, existing.length - 100);
            }
            
            localStorage.setItem(key, JSON.stringify(existing));
        } catch (error) {
            console.warn('⚠️ Error guardando offline:', error);
        }
    }

    // Sincronizar estadísticas pendientes
    async sincronizarEstadisticasPendientes() {
        const categorias = ['visualizaciones', 'interacciones', 'tiempos'];
        
        for (const categoria of categorias) {
            await this.sincronizarCategoria(categoria);
        }
    }

    // Sincronizar una categoría específica
    async sincronizarCategoria(categoria) {
        try {
            const key = `stats_${categoria}_offline`;
            const datos = JSON.parse(localStorage.getItem(key) || '[]');
            
            if (datos.length === 0) return;

            const tablaMap = {
                'visualizaciones': 'presentacion_stats',
                'interacciones': 'interacciones_stats',
                'tiempos': 'tiempo_pagina_stats'
            };

            const tabla = tablaMap[categoria];
            if (!tabla) return;

            console.log(`🔄 Sincronizando ${datos.length} registros de ${categoria}`);

            // Enviar en lotes pequeños
            const loteSize = 10;
            for (let i = 0; i < datos.length; i += loteSize) {
                const lote = datos.slice(i, i + loteSize);
                
                for (const registro of lote) {
                    // Remover metadatos offline
                    const { _offline_timestamp, ...registroLimpio } = registro;
                    
                    try {
                        await this.enviarASupabase(tabla, registroLimpio);
                        await new Promise(resolve => setTimeout(resolve, 100)); // Pequeña pausa
                    } catch (error) {
                        console.warn(`⚠️ Error sincronizando registro de ${categoria}:`, error);
                        // Si falla, mantener los datos para el próximo intento
                        return;
                    }
                }
            }

            // Si llegamos aquí, todo se sincronizó exitosamente
            localStorage.removeItem(key);
            console.log(`✅ ${categoria} sincronizada exitosamente`);

        } catch (error) {
            console.warn(`⚠️ Error sincronizando ${categoria}:`, error);
        }
    }

    // Obtener IP del cliente (fallback)
    getClientIP() {
        // En un entorno real, esto se obtendría del servidor
        return 'unknown';
    }

    // Obtener estadísticas básicas offline
    obtenerEstadisticasOffline() {
        try {
            const stats = {
                visualizaciones: JSON.parse(localStorage.getItem('stats_visualizaciones_offline') || '[]').length,
                interacciones: JSON.parse(localStorage.getItem('stats_interacciones_offline') || '[]').length,
                tiempos: JSON.parse(localStorage.getItem('stats_tiempos_offline') || '[]').length,
                sesion_actual: this.sessionId,
                dispositivo: this.getDeviceType(),
                online: this.isOnline
            };

            return stats;
        } catch (error) {
            console.warn('⚠️ Error obteniendo estadísticas offline:', error);
            return null;
        }
    }

    // Limpiar datos offline antiguos
    limpiarDatosAntiguos(diasAntiguedad = 7) {
        const categorias = ['visualizaciones', 'interacciones', 'tiempos'];
        const tiempoLimite = Date.now() - (diasAntiguedad * 24 * 60 * 60 * 1000);
        
        categorias.forEach(categoria => {
            try {
                const key = `stats_${categoria}_offline`;
                const datos = JSON.parse(localStorage.getItem(key) || '[]');
                const datosFiltrados = datos.filter(item => 
                    item._offline_timestamp && item._offline_timestamp > tiempoLimite
                );
                
                if (datosFiltrados.length !== datos.length) {
                    localStorage.setItem(key, JSON.stringify(datosFiltrados));
                    console.log(`🧹 Limpiados ${datos.length - datosFiltrados.length} registros antiguos de ${categoria}`);
                }
            } catch (error) {
                console.warn(`⚠️ Error limpiando datos de ${categoria}:`, error);
            }
        });
    }

    // Método para testing/debugging
    async testConexion() {
        try {
            const response = await fetch(`${this.supabaseUrl}/rest/v1/`, {
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`
                }
            });
            
            console.log('🔍 Test de conexión Supabase:', response.ok ? '✅ OK' : '❌ Error');
            return response.ok;
        } catch (error) {
            console.warn('⚠️ Error en test de conexión:', error);
            return false;
        }
    }
}

// Crear instancia global
window.PresentationStatsService = new PresentationStatsService();

// Auto-limpiar datos antiguos al inicializar
window.PresentationStatsService.limpiarDatosAntiguos();

console.log('📊 PresentationStatsService inicializado');