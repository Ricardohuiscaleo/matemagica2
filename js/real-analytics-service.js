/**
 * 📊 Real Analytics Service para Presentaciones Gaby
 * Captura estadísticas reales de visitantes: IP, ubicación, dispositivo, etc.
 */

class RealAnalyticsService {
    constructor() {
        this.sessionId = this.generateUniqueSession();
        this.visitorData = null;
        this.supabaseUrl = null;
        this.supabaseKey = null;
        this.isOnline = navigator.onLine;
        
        // Inicializar configuración
        this.initializeSupabase();
        
        // Capturar datos del visitante inmediatamente
        this.captureVisitorData();
        
        // Setup listeners
        this.setupEventListeners();
        
        console.log('🌍 Real Analytics Service inicializado');
    }

    // Configuración de Supabase
    async initializeSupabase() {
        try {
            // Esperar a que ConfigService esté disponible
            await this.waitForConfigService();
            
            // Cargar configuración desde ConfigService existente
            if (window.ConfigService) {
                const config = await window.ConfigService.loadConfig();
                if (config.supabase?.url && config.supabase?.anonKey) {
                    this.supabaseUrl = config.supabase.url;
                    this.supabaseKey = config.supabase.anonKey;
                    console.log('✅ Supabase configurado para analytics reales desde ConfigService');
                    console.log(`🔗 URL: ${this.supabaseUrl}`);
                    return;
                }
            }
            
            console.warn('⚠️ ConfigService no disponible, usando modo offline únicamente');
            this.supabaseUrl = null;
            this.supabaseKey = null;
        } catch (error) {
            console.warn('❌ Error configurando Supabase:', error);
            this.supabaseUrl = null;
            this.supabaseKey = null;
        }
    }

    // Esperar a que ConfigService esté disponible
    async waitForConfigService() {
        let attempts = 0;
        const maxAttempts = 20;
        
        while (!window.ConfigService && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.ConfigService) {
            console.warn('⚠️ ConfigService no se cargó después de 2 segundos');
        }
    }

    // Generar ID único de sesión
    generateUniqueSession() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        const fingerprint = this.generateFingerprint();
        return `session_${timestamp}_${random}_${fingerprint}`;
    }

    // Generar fingerprint del navegador
    generateFingerprint() {
        const screen = `${window.screen.width}x${window.screen.height}`;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const language = navigator.language;
        const platform = navigator.platform;
        
        const data = `${screen}_${timezone}_${language}_${platform}`;
        return this.simpleHash(data).substr(0, 8);
    }

    // Hash simple para fingerprinting
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }

    // Capturar datos reales del visitante
    async captureVisitorData() {
        console.log('🔍 Capturando datos reales del visitante...');
        
        // Datos básicos del navegador
        const basicData = {
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            language: navigator.language,
            languages: navigator.languages?.join(',') || navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            screen: {
                width: window.screen.width,
                height: window.screen.height,
                colorDepth: window.screen.colorDepth,
                pixelDepth: window.screen.pixelDepth
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            referrer: document.referrer || 'direct',
            url: window.location.href,
            deviceType: this.detectDeviceType(),
            browserInfo: this.getBrowserInfo()
        };

        // Intentar obtener IP y ubicación real
        try {
            const geoData = await this.getRealGeoLocation();
            basicData.geo = geoData;
        } catch (error) {
            console.warn('⚠️ No se pudo obtener geolocalización:', error);
        }

        // Intentar obtener IP pública
        try {
            const ipData = await this.getRealIPAddress();
            basicData.ip = ipData;
        } catch (error) {
            console.warn('⚠️ No se pudo obtener IP pública:', error);
        }

        this.visitorData = basicData;
        console.log('📊 Datos del visitante capturados:', basicData);
        
        return basicData;
    }

    // Obtener IP real del visitante
    async getRealIPAddress() {
        try {
            // Usar servicios que incluyen datos de ubicación
            const ipServices = [
                {
                    url: 'https://ipapi.co/json/',
                    parser: (data) => ({
                        ip: data.ip,
                        country: data.country_name,
                        region: data.region,
                        city: data.city,
                        isp: data.org,
                        countryCode: data.country_code,
                        latitude: data.latitude,
                        longitude: data.longitude
                    })
                },
                {
                    url: 'https://ip-api.com/json/',
                    parser: (data) => ({
                        ip: data.query,
                        country: data.country,
                        region: data.regionName,
                        city: data.city,
                        isp: data.isp,
                        countryCode: data.countryCode,
                        latitude: data.lat,
                        longitude: data.lon
                    })
                },
                {
                    url: 'https://api.ipify.org?format=json',
                    parser: (data) => ({
                        ip: data.ip,
                        country: 'No disponible',
                        region: 'No disponible',
                        city: 'No disponible',
                        isp: 'No disponible'
                    })
                }
            ];

            for (const service of ipServices) {
                try {
                    console.log(`🌍 Probando servicio de IP: ${service.url}`);
                    const response = await fetch(service.url);
                    const data = await response.json();
                    
                    if (data && (data.ip || data.query)) {
                        const parsedData = service.parser(data);
                        const result = {
                            ...parsedData,
                            service: service.url,
                            timestamp: new Date().toISOString()
                        };
                        
                        console.log(`✅ IP y ubicación obtenida de ${service.url}:`, result);
                        return result;
                    }
                } catch (serviceError) {
                    console.warn(`❌ Falló servicio ${service.url}:`, serviceError);
                    continue;
                }
            }
        } catch (error) {
            console.error('❌ Error obteniendo IP y ubicación:', error);
        }
        
        return { 
            ip: 'unknown', 
            country: 'No disponible',
            region: 'No disponible',
            city: 'No disponible',
            method: 'fallback' 
        };
    }

    // Obtener geolocalización real (con permiso del usuario)
    async getRealGeoLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject('Geolocalización no soportada');
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: new Date(position.timestamp).toISOString()
                    });
                },
                (error) => {
                    // No rechazar, solo marcar como no disponible
                    resolve({ 
                        error: error.message, 
                        permission: 'denied_or_unavailable' 
                    });
                },
                {
                    timeout: 10000,
                    maximumAge: 300000, // 5 minutos
                    enableHighAccuracy: false
                }
            );
        });
    }

    // Detectar tipo de dispositivo real
    detectDeviceType() {
        const userAgent = navigator.userAgent.toLowerCase();
        const width = window.innerWidth;
        
        if (/mobile|android|iphone|ipod|blackberry|windows phone/.test(userAgent)) {
            return 'mobile';
        } else if (/tablet|ipad|kindle|silk/.test(userAgent) || (width >= 768 && width <= 1024)) {
            return 'tablet';
        } else {
            return 'desktop';
        }
    }

    // Obtener información detallada del navegador
    getBrowserInfo() {
        const userAgent = navigator.userAgent;
        let browser = 'unknown';
        let version = 'unknown';

        if (userAgent.indexOf('Chrome') > -1) {
            browser = 'Chrome';
            version = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || 'unknown';
        } else if (userAgent.indexOf('Firefox') > -1) {
            browser = 'Firefox';
            version = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || 'unknown';
        } else if (userAgent.indexOf('Safari') > -1) {
            browser = 'Safari';
            version = userAgent.match(/Version\/([0-9.]+)/)?.[1] || 'unknown';
        } else if (userAgent.indexOf('Edge') > -1) {
            browser = 'Edge';
            version = userAgent.match(/Edge\/([0-9.]+)/)?.[1] || 'unknown';
        }

        return { browser, version, userAgent };
    }

    // Registrar visualización real de presentación
    async registrarVisualizacionReal(presentacionId, titulo) {
        console.log(`🎬 Registrando visualización REAL: ${presentacionId}`);
        
        // Asegurar que tenemos datos del visitante
        if (!this.visitorData) {
            await this.captureVisitorData();
        }

        const visualizacionData = {
            presentacion_id: presentacionId,
            titulo: titulo,
            session_id: this.sessionId,
            visitor_data: this.visitorData,
            timestamp: new Date().toISOString(),
            page_url: window.location.href,
            referrer: document.referrer || 'direct'
        };

        try {
            // Enviar a Supabase si está configurado
            if (this.supabaseUrl && this.supabaseKey && this.isOnline) {
                await this.enviarASupabaseReal(visualizacionData);
                console.log('✅ Visualización enviada a Supabase');
            }
            
            // También guardar localmente
            this.guardarVisitaLocal(visualizacionData);
            
            return true;
        } catch (error) {
            console.error('❌ Error registrando visualización real:', error);
            // Guardar localmente como fallback
            this.guardarVisitaLocal(visualizacionData);
            return false;
        }
    }

    // Enviar datos reales a Supabase (actualizado para función simplificada)
    async enviarASupabaseReal(data) {
        // Usar la función simplificada con parámetros correctos
        const payload = {
            presentacion_id_param: data.presentacion_id,
            titulo_param: data.titulo
        };

        const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/increment_presentation_view`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': this.supabaseKey,
                'Authorization': `Bearer ${this.supabaseKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
        }

        const result = await response.json();
        console.log('📊 Respuesta de Supabase:', result);
        return result;
    }

    // Guardar visita localmente
    guardarVisitaLocal(data) {
        const visitas = JSON.parse(localStorage.getItem('gaby-visitas-reales') || '[]');
        visitas.push(data);
        
        // Mantener solo las últimas 100 visitas localmente
        if (visitas.length > 100) {
            visitas.splice(0, visitas.length - 100);
        }
        
        localStorage.setItem('gaby-visitas-reales', JSON.stringify(visitas));
        
        // También actualizar contador simple
        const stats = JSON.parse(localStorage.getItem('gaby-presentaciones-stats') || '{}');
        stats[data.presentacion_id] = (stats[data.presentacion_id] || 0) + 1;
        localStorage.setItem('gaby-presentaciones-stats', JSON.stringify(stats));
    }

    // Obtener estadísticas reales con manejo mejorado de errores
    async obtenerEstadisticasReales() {
        try {
            if (this.supabaseUrl && this.supabaseKey && this.isOnline) {
                // Intentar primero con la función RPC
                let response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/get_all_presentation_stats`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`,
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({})
                });

                if (!response.ok) {
                    console.warn(`⚠️ Error RPC (${response.status}), intentando consulta directa...`);
                    
                    // Fallback: consulta directa a la tabla
                    response = await fetch(`${this.supabaseUrl}/rest/v1/presentation_stats?select=*&order=total_visualizaciones.desc`, {
                        method: 'GET',
                        headers: {
                            'apikey': this.supabaseKey,
                            'Authorization': `Bearer ${this.supabaseKey}`
                        }
                    });
                }

                if (response.ok) {
                    const data = await response.json();
                    console.log('📊 Estadísticas reales obtenidas:', data);
                    
                    // Normalizar formato si es necesario
                    if (Array.isArray(data)) {
                        return data.map(stat => ({
                            presentacion_id: stat.presentacion_id,
                            titulo: stat.titulo,
                            total_visualizaciones: stat.total_visualizaciones || 0,
                            source: 'supabase'
                        }));
                    }
                    
                    return data;
                } else {
                    console.warn(`⚠️ Error final obteniendo estadísticas: ${response.status}`);
                }
            }
        } catch (error) {
            console.warn('⚠️ Error obteniendo estadísticas reales:', error);
        }

        // Fallback: estadísticas locales
        const statsLocal = JSON.parse(localStorage.getItem('gaby-presentaciones-stats') || '{}');
        return Object.entries(statsLocal).map(([id, views]) => ({
            presentacion_id: id,
            titulo: id === 'historia-celular' ? 'La Historia del Celular' : id,
            total_visualizaciones: views,
            source: 'local'
        }));
    }

    // Registrar like en una presentación (ACTUALIZADO para Supabase)
    async registrarLike(presentacionId, accion = 'like') {
        console.log(`👍 Registrando ${accion}: ${presentacionId}`);
        
        const likeData = {
            presentacion_id: presentacionId,
            session_id: this.sessionId,
            accion: accion,
            ip_hash: this.simpleHash(this.visitorData?.ip?.ip || 'unknown'),
            user_agent_hash: this.simpleHash(navigator.userAgent),
            dispositivo: this.visitorData?.deviceType || 'desktop',
            pais: this.visitorData?.ip?.country || null,
            ciudad: this.visitorData?.ip?.city || null
        };

        try {
            // Guardar localmente siempre (para UI inmediata)
            this.guardarLikeLocal(likeData);
            
            // Enviar a Supabase si está configurado
            if (this.supabaseUrl && this.supabaseKey && this.isOnline) {
                const resultado = await this.enviarLikeASupabase(likeData);
                console.log('✅ Like enviado a Supabase:', resultado);
                return resultado;
            }
            
            return { success: true, source: 'local' };
        } catch (error) {
            console.error('❌ Error registrando like:', error);
            return { success: false, error: error.message };
        }
    }

    // Registrar compartir (NUEVO)
    async registrarCompartir(presentacionId, tipoCompartir) {
        console.log(`📤 Registrando compartir ${tipoCompartir}: ${presentacionId}`);
        
        const compartirData = {
            presentacion_id: presentacionId,
            session_id: this.sessionId,
            tipo_compartir: tipoCompartir,
            ip_hash: this.simpleHash(this.visitorData?.ip?.ip || 'unknown'),
            user_agent_hash: this.simpleHash(navigator.userAgent),
            dispositivo: this.visitorData?.deviceType || 'desktop',
            pais: this.visitorData?.ip?.country || null,
            ciudad: this.visitorData?.ip?.city || null
        };

        try {
            // Guardar localmente
            this.guardarCompartirLocal(compartirData);
            
            // Enviar a Supabase si está configurado
            if (this.supabaseUrl && this.supabaseKey && this.isOnline) {
                const resultado = await this.enviarCompartirASupabase(compartirData);
                console.log('✅ Compartir enviado a Supabase:', resultado);
                return resultado;
            }
            
            return { success: true, source: 'local' };
        } catch (error) {
            console.error('❌ Error registrando compartir:', error);
            return { success: false, error: error.message };
        }
    }

    // Enviar like a Supabase (ACTUALIZADO)
    async enviarLikeASupabase(likeData) {
        const payload = {
            presentacion_id_param: likeData.presentacion_id,
            session_id_param: likeData.session_id,
            accion_param: likeData.accion,
            ip_hash_param: likeData.ip_hash,
            user_agent_hash_param: likeData.user_agent_hash,
            dispositivo_param: likeData.dispositivo,
            pais_param: likeData.pais,
            ciudad_param: likeData.ciudad
        };

        const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/registrar_like_presentacion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': this.supabaseKey,
                'Authorization': `Bearer ${this.supabaseKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
        }

        return await response.json();
    }

    // Enviar compartir a Supabase (NUEVO)
    async enviarCompartirASupabase(compartirData) {
        const payload = {
            presentacion_id_param: compartirData.presentacion_id,
            session_id_param: compartirData.session_id,
            tipo_compartir_param: compartirData.tipo_compartir,
            ip_hash_param: compartirData.ip_hash,
            user_agent_hash_param: compartirData.user_agent_hash,
            dispositivo_param: compartirData.dispositivo,
            pais_param: compartirData.pais,
            ciudad_param: compartirData.ciudad
        };

        const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/registrar_compartir_presentacion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': this.supabaseKey,
                'Authorization': `Bearer ${this.supabaseKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
        }

        return await response.json();
    }

    // Guardar visita localmente
    guardarVisitaLocal(data) {
        const visitas = JSON.parse(localStorage.getItem('gaby-visitas-reales') || '[]');
        visitas.push(data);
        
        // Mantener solo las últimas 100 visitas localmente
        if (visitas.length > 100) {
            visitas.splice(0, visitas.length - 100);
        }
        
        localStorage.setItem('gaby-visitas-reales', JSON.stringify(visitas));
        
        // También actualizar contador simple
        const stats = JSON.parse(localStorage.getItem('gaby-presentaciones-stats') || '{}');
        stats[data.presentacion_id] = (stats[data.presentacion_id] || 0) + 1;
        localStorage.setItem('gaby-presentaciones-stats', JSON.stringify(stats));
    }

    // Obtener estadísticas reales con manejo mejorado de errores
    async obtenerEstadisticasReales() {
        try {
            if (this.supabaseUrl && this.supabaseKey && this.isOnline) {
                // Intentar primero con la función RPC
                let response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/get_all_presentation_stats`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`,
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({})
                });

                if (!response.ok) {
                    console.warn(`⚠️ Error RPC (${response.status}), intentando consulta directa...`);
                    
                    // Fallback: consulta directa a la tabla
                    response = await fetch(`${this.supabaseUrl}/rest/v1/presentation_stats?select=*&order=total_visualizaciones.desc`, {
                        method: 'GET',
                        headers: {
                            'apikey': this.supabaseKey,
                            'Authorization': `Bearer ${this.supabaseKey}`
                        }
                    });
                }

                if (response.ok) {
                    const data = await response.json();
                    console.log('📊 Estadísticas reales obtenidas:', data);
                    
                    // Normalizar formato si es necesario
                    if (Array.isArray(data)) {
                        return data.map(stat => ({
                            presentacion_id: stat.presentacion_id,
                            titulo: stat.titulo,
                            total_visualizaciones: stat.total_visualizaciones || 0,
                            source: 'supabase'
                        }));
                    }
                    
                    return data;
                } else {
                    console.warn(`⚠️ Error final obteniendo estadísticas: ${response.status}`);
                }
            }
        } catch (error) {
            console.warn('⚠️ Error obteniendo estadísticas reales:', error);
        }

        // Fallback: estadísticas locales
        const statsLocal = JSON.parse(localStorage.getItem('gaby-presentaciones-stats') || '{}');
        return Object.entries(statsLocal).map(([id, views]) => ({
            presentacion_id: id,
            titulo: id === 'historia-celular' ? 'La Historia del Celular' : id,
            total_visualizaciones: views,
            source: 'local'
        }));
    }

    // Registrar like en una presentación (ACTUALIZADO para Supabase)
    async registrarLike(presentacionId, accion = 'like') {
        console.log(`👍 Registrando ${accion}: ${presentacionId}`);
        
        const likeData = {
            presentacion_id: presentacionId,
            session_id: this.sessionId,
            accion: accion,
            ip_hash: this.simpleHash(this.visitorData?.ip?.ip || 'unknown'),
            user_agent_hash: this.simpleHash(navigator.userAgent),
            dispositivo: this.visitorData?.deviceType || 'desktop',
            pais: this.visitorData?.ip?.country || null,
            ciudad: this.visitorData?.ip?.city || null
        };

        try {
            // Guardar localmente siempre (para UI inmediata)
            this.guardarLikeLocal(likeData);
            
            // Enviar a Supabase si está configurado
            if (this.supabaseUrl && this.supabaseKey && this.isOnline) {
                const resultado = await this.enviarLikeASupabase(likeData);
                console.log('✅ Like enviado a Supabase:', resultado);
                return resultado;
            }
            
            return { success: true, source: 'local' };
        } catch (error) {
            console.error('❌ Error registrando like:', error);
            return { success: false, error: error.message };
        }
    }

    // Registrar compartir (NUEVO)
    async registrarCompartir(presentacionId, tipoCompartir) {
        console.log(`📤 Registrando compartir ${tipoCompartir}: ${presentacionId}`);
        
        const compartirData = {
            presentacion_id: presentacionId,
            session_id: this.sessionId,
            tipo_compartir: tipoCompartir,
            ip_hash: this.simpleHash(this.visitorData?.ip?.ip || 'unknown'),
            user_agent_hash: this.simpleHash(navigator.userAgent),
            dispositivo: this.visitorData?.deviceType || 'desktop',
            pais: this.visitorData?.ip?.country || null,
            ciudad: this.visitorData?.ip?.city || null
        };

        try {
            // Guardar localmente
            this.guardarCompartirLocal(compartirData);
            
            // Enviar a Supabase si está configurado
            if (this.supabaseUrl && this.supabaseKey && this.isOnline) {
                const resultado = await this.enviarCompartirASupabase(compartirData);
                console.log('✅ Compartir enviado a Supabase:', resultado);
                return resultado;
            }
            
            return { success: true, source: 'local' };
        } catch (error) {
            console.error('❌ Error registrando compartir:', error);
            return { success: false, error: error.message };
        }
    }

    // Enviar like a Supabase (ACTUALIZADO)
    async enviarLikeASupabase(likeData) {
        const payload = {
            presentacion_id_param: likeData.presentacion_id,
            session_id_param: likeData.session_id,
            accion_param: likeData.accion,
            ip_hash_param: likeData.ip_hash,
            user_agent_hash_param: likeData.user_agent_hash,
            dispositivo_param: likeData.dispositivo,
            pais_param: likeData.pais,
            ciudad_param: likeData.ciudad
        };

        const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/registrar_like_presentacion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': this.supabaseKey,
                'Authorization': `Bearer ${this.supabaseKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
        }

        return await response.json();
    }

    // Enviar compartir a Supabase (NUEVO)
    async enviarCompartirASupabase(compartirData) {
        const payload = {
            presentacion_id_param: compartirData.presentacion_id,
            session_id_param: compartirData.session_id,
            tipo_compartir_param: compartirData.tipo_compartir,
            ip_hash_param: compartirData.ip_hash,
            user_agent_hash_param: compartirData.user_agent_hash,
            dispositivo_param: compartirData.dispositivo,
            pais_param: compartirData.pais,
            ciudad_param: compartirData.ciudad
        };

        const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/registrar_compartir_presentacion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': this.supabaseKey,
                'Authorization': `Bearer ${this.supabaseKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
        }

        return await response.json();
    }

    // Guardar like localmente (ACTUALIZADO)
    guardarLikeLocal(likeData) {
        const likes = JSON.parse(localStorage.getItem('gaby-likes') || '{}');
        
        if (!likes[likeData.presentacion_id]) {
            likes[likeData.presentacion_id] = {
                total: 0,
                userLiked: false,
                userDisliked: false,
                history: []
            };
        }

        const currentLike = likes[likeData.presentacion_id];

        // Lógica de like/unlike/dislike
        if (likeData.accion === 'like') {
            if (!currentLike.userLiked) {
                currentLike.total += 1;
                currentLike.userLiked = true;
                currentLike.userDisliked = false;
            }
        } else if (likeData.accion === 'unlike') {
            if (currentLike.userLiked) {
                currentLike.total = Math.max(0, currentLike.total - 1);
                currentLike.userLiked = false;
            }
        } else if (likeData.accion === 'dislike') {
            if (currentLike.userLiked) {
                currentLike.total = Math.max(0, currentLike.total - 1);
            }
            currentLike.userLiked = false;
            currentLike.userDisliked = true;
        }

        currentLike.history.push(likeData);
        localStorage.setItem('gaby-likes', JSON.stringify(likes));
    }

    // Guardar compartir localmente (NUEVO)
    guardarCompartirLocal(compartirData) {
        const compartidos = JSON.parse(localStorage.getItem('gaby-compartidos') || '{}');
        
        if (!compartidos[compartirData.presentacion_id]) {
            compartidos[compartirData.presentacion_id] = {
                total: 0,
                tipos: {},
                history: []
            };
        }

        const currentCompartido = compartidos[compartirData.presentacion_id];
        currentCompartido.total += 1;
        
        if (!currentCompartido.tipos[compartirData.tipo_compartir]) {
            currentCompartido.tipos[compartirData.tipo_compartir] = 0;
        }
        currentCompartido.tipos[compartirData.tipo_compartir] += 1;
        
        currentCompartido.history.push(compartirData);
        localStorage.setItem('gaby-compartidos', JSON.stringify(compartidos));
    }

    // Obtener estadísticas completas desde Supabase (NUEVO)
    async obtenerEstadisticasCompletas(presentacionId) {
        try {
            if (this.supabaseUrl && this.supabaseKey && this.isOnline) {
                const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/obtener_estadisticas_presentacion`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`
                    },
                    body: JSON.stringify({
                        presentacion_id_param: presentacionId
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(`📊 Estadísticas completas de ${presentacionId}:`, data);
                    return data;
                }
            }
        } catch (error) {
            console.warn('⚠️ Error obteniendo estadísticas completas:', error);
        }

        // Fallback: estadísticas locales
        return this.obtenerEstadisticasLocales(presentacionId);
    }

    // Obtener estadísticas locales (NUEVO)
    obtenerEstadisticasLocales(presentacionId) {
        const likes = JSON.parse(localStorage.getItem('gaby-likes') || '{}');
        const compartidos = JSON.parse(localStorage.getItem('gaby-compartidos') || '{}');
        const stats = JSON.parse(localStorage.getItem('gaby-presentaciones-stats') || '{}');

        return {
            presentacion_id: presentacionId,
            visualizaciones: stats[presentacionId] || 0,
            likes: likes[presentacionId]?.total || 0,
            dislikes: 0, // No trackear dislikes localmente por simplicidad
            compartidos: compartidos[presentacionId]?.total || 0,
            engagement: 0,
            source: 'local'
        };
    }

    // Obtener likes de una presentación (ACTUALIZADO con datos de Supabase)
    async obtenerLikes(presentacionId) {
        try {
            // Intentar obtener desde Supabase primero
            if (this.supabaseUrl && this.supabaseKey && this.isOnline) {
                const stats = await this.obtenerEstadisticasCompletas(presentacionId);
                if (stats && stats.likes !== undefined) {
                    return {
                        total: stats.likes,
                        userLiked: this.obtenerLikeUsuario(presentacionId),
                        userDisliked: false,
                        source: 'supabase'
                    };
                }
            }
        } catch (error) {
            console.warn('⚠️ Error obteniendo likes desde Supabase:', error);
        }

        // Fallback: localStorage
        const likes = JSON.parse(localStorage.getItem('gaby-likes') || '{}');
        return likes[presentacionId] || { total: 0, userLiked: false, userDisliked: false, source: 'local' };
    }

    // Verificar si el usuario actual ya dio like
    obtenerLikeUsuario(presentacionId) {
        const likes = JSON.parse(localStorage.getItem('gaby-likes') || '{}');
        return likes[presentacionId]?.userLiked || false;
    }

    // Registrar suscripción
    registrarSuscripcion() {
        const suscripcion = {
            session_id: this.sessionId,
            timestamp: new Date().toISOString(),
            visitante_data: this.visitorData
        };
        
        localStorage.setItem('gaby-suscripcion', JSON.stringify(suscripcion));
        console.log('✅ Usuario suscrito a Presentaciones Gaby');
        return true;
    }

    // Verificar si está suscrito
    estaSuscrito() {
        return localStorage.getItem('gaby-suscripcion') !== null;
    }

    // Setup event listeners
    setupEventListeners() {
        window.addEventListener('beforeunload', () => {
            this.registrarSalidaReal();
        });

        window.addEventListener('online', () => {
            this.isOnline = true;
            this.sincronizarDatosPendientes();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });

        this.tiempoInicio = Date.now();
    }

    // Registrar salida real del visitante
    registrarSalidaReal() {
        const tiempoEnPagina = Math.round((Date.now() - this.tiempoInicio) / 1000);
        
        const salidaData = {
            session_id: this.sessionId,
            tiempo_en_pagina: tiempoEnPagina,
            timestamp: new Date().toISOString()
        };

        if (navigator.sendBeacon && this.supabaseUrl) {
            navigator.sendBeacon(
                `${this.supabaseUrl}/rest/v1/visitor_sessions`,
                JSON.stringify(salidaData)
            );
        }

        localStorage.setItem('gaby-ultima-salida', JSON.stringify(salidaData));
    }

    // Sincronizar datos pendientes
    async sincronizarDatosPendientes() {
        const pendientes = JSON.parse(localStorage.getItem('gaby-visitas-reales') || '[]');
        
        if (pendientes.length === 0) return;

        console.log(`🔄 Sincronizando ${pendientes.length} visitas reales pendientes...`);

        for (const visita of pendientes) {
            try {
                await this.enviarASupabaseReal(visita);
            } catch (error) {
                console.warn('⚠️ Error sincronizando visita:', error);
                break;
            }
        }

        localStorage.removeItem('gaby-visitas-reales');
        console.log('✅ Visitas reales sincronizadas');
    }
}

// Crear instancia global
window.RealAnalyticsService = new RealAnalyticsService();