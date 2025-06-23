/**
 * 🇨🇱 REGIONES Y COMUNAS DE CHILE - Sistema Completo
 * Matemágica PWA - Datos geográficos actualizados 2024
 */

// 🌎 DATOS COMPLETOS DE CHILE - 16 REGIONES + COMUNAS
const REGIONES_COMUNAS_CHILE = {
    "arica-parinacota": {
        nombre: "Arica y Parinacota",
        codigo: "XV",
        comunas: [
            "Arica",
            "Camarones",
            "General Lagos",
            "Putre"
        ]
    },
    "tarapaca": {
        nombre: "Tarapacá", 
        codigo: "I",
        comunas: [
            "Alto Hospicio",
            "Camiña",
            "Colchane",
            "Huara",
            "Iquique",
            "Pica",
            "Pozo Almonte"
        ]
    },
    "antofagasta": {
        nombre: "Antofagasta",
        codigo: "II", 
        comunas: [
            "Antofagasta",
            "Calama",
            "María Elena",
            "Mejillones",
            "Ollagüe",
            "San Pedro de Atacama",
            "Sierra Gorda",
            "Taltal",
            "Tocopilla"
        ]
    },
    "atacama": {
        nombre: "Atacama",
        codigo: "III",
        comunas: [
            "Alto del Carmen",
            "Caldera",
            "Chañaral",
            "Copiapó",
            "Diego de Almagro",
            "Freirina",
            "Huasco",
            "Tierra Amarilla",
            "Vallenar"
        ]
    },
    "coquimbo": {
        nombre: "Coquimbo",
        codigo: "IV",
        comunas: [
            "Andacollo",
            "Canela",
            "Combarbalá",
            "Coquimbo",
            "Illapel",
            "La Higuera",
            "La Serena",
            "Los Vilos",
            "Monte Patria",
            "Ovalle",
            "Paiguano",
            "Punitaqui",
            "Río Hurtado",
            "Salamanca",
            "Vicuña"
        ]
    },
    "valparaiso": {
        nombre: "Valparaíso",
        codigo: "V",
        comunas: [
            "Algarrobo",
            "Cabildo",
            "Calera",
            "Calle Larga",
            "Cartagena",
            "Casablanca",
            "Catemu",
            "Concón",
            "El Quisco",
            "El Tabo",
            "Hijuelas",
            "Isla de Pascua",
            "Juan Fernández",
            "La Cruz",
            "La Ligua",
            "Limache",
            "Llaillay",
            "Los Andes",
            "Nogales",
            "Olmué",
            "Panquehue",
            "Papudo",
            "Petorca",
            "Puchuncaví",
            "Putaendo",
            "Quillota",
            "Quilpué",
            "Quintero",
            "Rinconada",
            "San Antonio",
            "San Esteban",
            "San Felipe",
            "Santa María",
            "Santo Domingo",
            "Valparaíso",
            "Villa Alemana",
            "Viña del Mar",
            "Zapallar"
        ]
    },
    "metropolitana": {
        nombre: "Región Metropolitana de Santiago",
        codigo: "RM",
        comunas: [
            "Alhué",
            "Buin",
            "Calera de Tango",
            "Cerrillos",
            "Cerro Navia",
            "Colina",
            "Conchalí",
            "Curacaví",
            "El Bosque",
            "El Monte",
            "Estación Central",
            "Huechuraba",
            "Independencia",
            "Isla de Maipo",
            "La Cisterna",
            "La Florida",
            "La Granja",
            "La Pintana",
            "La Reina",
            "Lampa",
            "Las Condes",
            "Lo Barnechea",
            "Lo Espejo",
            "Lo Prado",
            "Macul",
            "Maipú",
            "María Pinto",
            "Melipilla",
            "Ñuñoa",
            "Padre Hurtado",
            "Paine",
            "Pedro Aguirre Cerda",
            "Peñaflor",
            "Peñalolén",
            "Pirque",
            "Providencia",
            "Pudahuel",
            "Puente Alto",
            "Quilicura",
            "Quinta Normal",
            "Recoleta",
            "Renca",
            "San Bernardo",
            "San Joaquín",
            "San José de Maipo",
            "San Miguel",
            "San Pedro",
            "San Ramón",
            "Santiago",
            "Talagante",
            "Tiltil",
            "Vitacura"
        ]
    },
    "ohiggins": {
        nombre: "Libertador General Bernardo O'Higgins",
        codigo: "VI",
        comunas: [
            "Chépica",
            "Chimbarongo",
            "Codegua",
            "Coinco",
            "Coltauco",
            "Doñihue",
            "Graneros",
            "La Estrella",
            "Las Cabras",
            "Litueche",
            "Lolol",
            "Machalí",
            "Malloa",
            "Marchihue",
            "Mostazal",
            "Nancagua",
            "Navidad",
            "Olivar",
            "Palmilla",
            "Paredones",
            "Peralillo",
            "Peumo",
            "Pichidegua",
            "Pichilemu",
            "Placilla",
            "Pumanque",
            "Quinta de Tilcoco",
            "Rancagua",
            "Rengo",
            "Requínoa",
            "San Fernando",
            "San Vicente de Tagua Tagua",
            "Santa Cruz"
        ]
    },
    "maule": {
        nombre: "Maule",
        codigo: "VII",
        comunas: [
            "Cauquenes",
            "Chanco",
            "Colbún",
            "Constitución",
            "Curepto",
            "Curicó",
            "Empedrado",
            "Hualañé",
            "Licantén",
            "Linares",
            "Longaví",
            "Maule",
            "Molina",
            "Parral",
            "Pelarco",
            "Pelluhue",
            "Pencahue",
            "Rauco",
            "Retiro",
            "Río Claro",
            "Romeral",
            "Sagrada Familia",
            "San Clemente",
            "San Javier",
            "San Rafael",
            "Talca",
            "Teno",
            "Vichuquén",
            "Villa Alegre",
            "Yerbas Buenas"
        ]
    },
    "nuble": {
        nombre: "Ñuble",
        codigo: "XVI",
        comunas: [
            "Bulnes",
            "Chillán",
            "Chillán Viejo",
            "Cobquecura",
            "Coelemu",
            "Coihueco",
            "El Carmen",
            "Ninhue",
            "Ñiquén",
            "Pemuco",
            "Pinto",
            "Portezuelo",
            "Quillón",
            "Quirihue",
            "Ránquil",
            "San Carlos",
            "San Fabián",
            "San Ignacio",
            "San Nicolás",
            "Treguaco",
            "Yungay"
        ]
    },
    "biobio": {
        nombre: "Biobío",
        codigo: "VIII",
        comunas: [
            "Alto Biobío",
            "Antuco",
            "Arauco",
            "Cabrero",
            "Cañete",
            "Chiguayante",
            "Concepción",
            "Contulmo",
            "Coronel",
            "Curanilahue",
            "Florida",
            "Hualpén",
            "Hualqui",
            "Laja",
            "Lebu",
            "Los Álamos",
            "Los Ángeles",
            "Lota",
            "Mulchén",
            "Nacimiento",
            "Negrete",
            "Penco",
            "Quilaco",
            "Quilleco",
            "San Pedro de la Paz",
            "San Rosendo",
            "Santa Bárbara",
            "Santa Juana",
            "Talcahuano",
            "Tirúa",
            "Tomé",
            "Tucapel",
            "Yumbel"
        ]
    },
    "araucania": {
        nombre: "La Araucanía",
        codigo: "IX",
        comunas: [
            "Angol",
            "Carahue",
            "Cholchol",
            "Collipulli",
            "Cunco",
            "Curacautín",
            "Curarrehue",
            "Ercilla",
            "Freire",
            "Galvarino",
            "Gorbea",
            "Lautaro",
            "Loncoche",
            "Lonquimay",
            "Los Sauces",
            "Lumaco",
            "Melipeuco",
            "Nueva Imperial",
            "Padre Las Casas",
            "Perquenco",
            "Pitrufquén",
            "Pucón",
            "Purén",
            "Renaico",
            "Saavedra",
            "Temuco",
            "Teodoro Schmidt",
            "Toltén",
            "Traiguén",
            "Victoria",
            "Vilcún",
            "Villarrica"
        ]
    },
    "los-rios": {
        nombre: "Los Ríos",
        codigo: "XIV",
        comunas: [
            "Corral",
            "Futrono",
            "La Unión",
            "Lago Ranco",
            "Lanco",
            "Los Lagos",
            "Máfil",
            "Mariquina",
            "Paillaco",
            "Panguipulli",
            "Río Bueno",
            "Valdivia"
        ]
    },
    "los-lagos": {
        nombre: "Los Lagos",
        codigo: "X",
        comunas: [
            "Ancud",
            "Calbuco",
            "Castro",
            "Chaitén",
            "Chonchi",
            "Cochamó",
            "Curaco de Vélez",
            "Dalcahue",
            "Fresia",
            "Frutillar",
            "Futaleufú",
            "Hualaihué",
            "Llanquihue",
            "Los Muermos",
            "Maullín",
            "Osorno",
            "Palena",
            "Puerto Montt",
            "Puerto Octay",
            "Puerto Varas",
            "Puqueldón",
            "Purranque",
            "Puyehue",
            "Queilén",
            "Quellón",
            "Quemchi",
            "Quinchao",
            "Río Negro",
            "San Juan de la Costa",
            "San Pablo"
        ]
    },
    "aysen": {
        nombre: "Aysén del General Carlos Ibáñez del Campo",
        codigo: "XI",
        comunas: [
            "Aysén",
            "Chile Chico",
            "Cisnes",
            "Cochrane",
            "Coyhaique",
            "Guaitecas",
            "Lago Verde",
            "O'Higgins",
            "Río Ibáñez",
            "Tortel"
        ]
    },
    "magallanes": {
        nombre: "Magallanes y de la Antártica Chilena",
        codigo: "XII",
        comunas: [
            "Antártica",
            "Cabo de Hornos",
            "Laguna Blanca",
            "Natales",
            "Porvenir",
            "Primavera",
            "Punta Arenas",
            "Río Verde",
            "San Gregorio",
            "Timaukel",
            "Torres del Paine"
        ]
    }
};

// 🎯 FUNCIONES UTILITARIAS
class ChileLocationService {
    
    static getAllRegiones() {
        return Object.keys(REGIONES_COMUNAS_CHILE).map(key => ({
            codigo: key,
            nombre: REGIONES_COMUNAS_CHILE[key].nombre,
            numeroRegion: REGIONES_COMUNAS_CHILE[key].codigo
        }));
    }
    
    static getComunasByRegion(regionCodigo) {
        const region = REGIONES_COMUNAS_CHILE[regionCodigo];
        return region ? region.comunas : [];
    }
    
    static getRegionName(regionCodigo) {
        const region = REGIONES_COMUNAS_CHILE[regionCodigo];
        return region ? region.nombre : '';
    }
    
    static searchComunas(searchTerm) {
        const results = [];
        const term = searchTerm.toLowerCase();
        
        Object.keys(REGIONES_COMUNAS_CHILE).forEach(regionKey => {
            const region = REGIONES_COMUNAS_CHILE[regionKey];
            region.comunas.forEach(comuna => {
                if (comuna.toLowerCase().includes(term)) {
                    results.push({
                        comuna: comuna,
                        region: region.nombre,
                        regionCodigo: regionKey
                    });
                }
            });
        });
        
        return results;
    }
    
    static isValidRegionComuna(regionCodigo, comunaNombre) {
        const region = REGIONES_COMUNAS_CHILE[regionCodigo];
        if (!region) return false;
        
        return region.comunas.includes(comunaNombre);
    }
    
    // 📍 FUNCIÓN PARA GENERAR OPCIONES HTML DE REGIONES
    static generateRegionOptions() {
        const regiones = this.getAllRegiones();
        return regiones.map(region => 
            `<option value="${region.codigo}">${region.numeroRegion} - ${region.nombre}</option>`
        ).join('');
    }
    
    // 📍 FUNCIÓN PARA GENERAR OPCIONES HTML DE COMUNAS
    static generateComunaOptions(regionCodigo) {
        const comunas = this.getComunasByRegion(regionCodigo);
        return comunas.map(comuna => 
            `<option value="${comuna}">${comuna}</option>`
        ).join('');
    }
    
    // 🎯 CONFIGURAR SELECTORES DEPENDIENTES (Región -> Comuna)
    static setupRegionComunaSelectors(regionSelectId, comunaSelectId) {
        const regionSelect = document.getElementById(regionSelectId);
        const comunaSelect = document.getElementById(comunaSelectId);
        
        if (!regionSelect || !comunaSelect) {
            console.error('❌ No se encontraron los selectores:', regionSelectId, comunaSelectId);
            return;
        }
        
        // Llenar selector de regiones
        regionSelect.innerHTML = `
            <option value="">Seleccionar región</option>
            ${this.generateRegionOptions()}
        `;
        
        // Configurar evento de cambio
        regionSelect.addEventListener('change', function() {
            const regionCodigo = this.value;
            
            if (regionCodigo) {
                comunaSelect.innerHTML = `
                    <option value="">Seleccionar comuna</option>
                    ${ChileLocationService.generateComunaOptions(regionCodigo)}
                `;
                comunaSelect.disabled = false;
            } else {
                comunaSelect.innerHTML = '<option value="">Primero selecciona una región</option>';
                comunaSelect.disabled = true;
            }
        });
        
        // Inicializar comuna deshabilitada
        comunaSelect.innerHTML = '<option value="">Primero selecciona una región</option>';
        comunaSelect.disabled = true;
        
        console.log('✅ Selectores de Chile configurados correctamente');
    }
    
    // 🌍 NUEVO: Sistema de detección automática de ubicación por IP
    async setupAutoLocationDetection(regionSelectId, comunaSelectId) {
        console.log('🌍 Iniciando detección automática de ubicación por IP...');
        
        const regionSelect = document.getElementById(regionSelectId);
        const comunaSelect = document.getElementById(comunaSelectId);
        
        if (!regionSelect || !comunaSelect) {
            console.warn('⚠️ Selectores de región/comuna no encontrados para auto-detección');
            return;
        }
        
        // Crear indicador de detección
        this.mostrarIndicadorDeteccion(regionSelect);
        
        try {
            // 🔍 MÉTODO 1: Usar RealAnalyticsService si está disponible (como en gaby-presentaciones)
            if (window.RealAnalyticsService && window.RealAnalyticsService.visitorData) {
                console.log('✅ Usando RealAnalyticsService para detección de ubicación');
                await this.detectarUbicacionConAnalytics(regionSelectId, comunaSelectId);
                return;
            }
            
            // 🔍 MÉTODO 2: Usar API de geolocalización IP pública como fallback
            console.log('🔄 RealAnalyticsService no disponible, usando API de IP pública...');
            await this.detectarUbicacionConAPIPublica(regionSelectId, comunaSelectId);
            
        } catch (error) {
            console.error('❌ Error en detección automática:', error);
            this.mostrarErrorDeteccion(regionSelect, 'Error detectando ubicación automáticamente');
        }
    }

    // 🎯 Detectar ubicación usando RealAnalyticsService (método principal)
    async detectarUbicacionConAnalytics(regionSelectId, comunaSelectId) {
        const visitorData = window.RealAnalyticsService.visitorData;
        const regionSelect = document.getElementById(regionSelectId);
        const comunaSelect = document.getElementById(comunaSelectId);
        
        console.log('📍 Datos del visitante obtenidos:', visitorData);
        
        if (visitorData?.ip) {
            const paisDetectado = visitorData.ip.country;
            const regionDetectada = visitorData.ip.region;
            const ciudadDetectada = visitorData.ip.city;
            const ipDetectada = visitorData.ip.ip;
            
            // Solo proceder si es Chile
            if (paisDetectado && (paisDetectado.toLowerCase().includes('chile') || paisDetectado === 'CL')) {
                console.log(`🇨🇱 Usuario detectado en Chile - Región: ${regionDetectada}, Ciudad: ${ciudadDetectada}`);
                
                // Mapear región detectada a nuestras regiones
                const regionMapeada = this.mapearRegionDetectada(regionDetectada);
                const comunaMapeada = this.mapearComunaDetectada(ciudadDetectada, regionMapeada);
                
                if (regionMapeada) {
                    this.aplicarUbicacionDetectada(regionSelectId, comunaSelectId, regionMapeada, comunaMapeada, {
                        fuente: 'RealAnalyticsService',
                        ip: ipDetectada,
                        region_original: regionDetectada,
                        ciudad_original: ciudadDetectada
                    });
                } else {
                    console.warn('🤔 No se pudo mapear la región detectada:', regionDetectada);
                    this.mostrarSugerenciaManual(regionSelect, regionDetectada, ciudadDetectada);
                }
            } else {
                console.log(`🌍 Usuario detectado fuera de Chile: ${paisDetectado}`);
                this.mostrarMensajeUsuarioExtranjero(regionSelect, paisDetectado);
            }
        } else {
            console.warn('⚠️ No se pudieron obtener datos de IP del visitante');
            throw new Error('Datos de IP no disponibles');
        }
    }

    // 🌐 Detectar ubicación usando API pública como fallback
    async detectarUbicacionConAPIPublica(regionSelectId, comunaSelectId) {
        console.log('🌐 Detectando ubicación con API pública de IP...');
        
        const regionSelect = document.getElementById(regionSelectId);
        
        try {
            // Usar ipapi.co como servicio gratuito confiable
            const response = await fetch('https://ipapi.co/json/', {
                timeout: 5000,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`API respondió con status: ${response.status}`);
            }
            
            const locationData = await response.json();
            console.log('📍 Datos de ubicación obtenidos de ipapi.co:', locationData);
            
            if (locationData.country_code === 'CL' || locationData.country_name === 'Chile') {
                const regionDetectada = locationData.region;
                const ciudadDetectada = locationData.city;
                
                console.log(`🇨🇱 Usuario en Chile - Región: ${regionDetectada}, Ciudad: ${ciudadDetectada}`);
                
                const regionMapeada = this.mapearRegionDetectada(regionDetectada);
                const comunaMapeada = this.mapearComunaDetectada(ciudadDetectada, regionMapeada);
                
                if (regionMapeada) {
                    this.aplicarUbicacionDetectada(regionSelectId, comunaSelectId, regionMapeada, comunaMapeada, {
                        fuente: 'ipapi.co',
                        ip: locationData.ip,
                        region_original: regionDetectada,
                        ciudad_original: ciudadDetectada
                    });
                } else {
                    this.mostrarSugerenciaManual(regionSelect, regionDetectada, ciudadDetectada);
                }
            } else {
                console.log(`🌍 Usuario fuera de Chile: ${locationData.country_name}`);
                this.mostrarMensajeUsuarioExtranjero(regionSelect, locationData.country_name);
            }
            
        } catch (error) {
            console.error('❌ Error con API pública de IP:', error);
            throw error;
        }
    }

    // 🗺️ Mapear región detectada por IP a nuestras regiones de Chile
    mapearRegionDetectada(regionDetectada) {
        if (!regionDetectada) return null;
        
        const region = regionDetectada.toLowerCase().trim();
        
        // Mapeo de nombres de regiones comunes
        const mapeoRegiones = {
            // Nombres comunes a códigos internos
            'metropolitana': 'metropolitana',
            'santiago': 'metropolitana',
            'region metropolitana': 'metropolitana',
            'rm': 'metropolitana',
            
            'valparaiso': 'valparaiso',
            'valparaíso': 'valparaiso',
            'quinta region': 'valparaiso',
            'v region': 'valparaiso',
            
            'biobio': 'biobio',
            'bio bio': 'biobio',
            'biobío': 'biobio',
            'octava region': 'biobio',
            'viii region': 'biobio',
            
            'araucania': 'araucania',
            'araucanía': 'araucania',
            'la araucania': 'araucania',
            'novena region': 'araucania',
            'ix region': 'araucania',
            
            'los lagos': 'los-lagos',
            'decima region': 'los-lagos',
            'x region': 'los-lagos',
            
            'antofagasta': 'antofagasta',
            'segunda region': 'antofagasta',
            'ii region': 'antofagasta',
            
            'coquimbo': 'coquimbo',
            'cuarta region': 'coquimbo',
            'iv region': 'coquimbo',
            
            'ohiggins': 'ohiggins',
            "o'higgins": 'ohiggins',
            'sexta region': 'ohiggins',
            'vi region': 'ohiggins',
            
            'maule': 'maule',
            'septima region': 'maule',
            'vii region': 'maule',
            
            'tarapaca': 'tarapaca',
            'tarapacá': 'tarapaca',
            'primera region': 'tarapaca',
            'i region': 'tarapaca',
            
            'atacama': 'atacama',
            'tercera region': 'atacama',
            'iii region': 'atacama',
            
            'aysen': 'aysen',
            'aysén': 'aysen',
            'undecima region': 'aysen',
            'xi region': 'aysen',
            
            'magallanes': 'magallanes',
            'duodecima region': 'magallanes',
            'xii region': 'magallanes',
            
            'arica': 'arica-parinacota',
            'arica y parinacota': 'arica-parinacota',
            'decimoquinta region': 'arica-parinacota',
            'xv region': 'arica-parinacota',
            
            'nuble': 'nuble',
            'ñuble': 'nuble',
            'decimosexta region': 'nuble',
            'xvi region': 'nuble',
            
            'los rios': 'los-rios',
            'los ríos': 'los-rios',
            'decimocuarta region': 'los-rios',
            'xiv region': 'los-rios'
        };
        
        const regionMapeada = mapeoRegiones[region];
        console.log(`🗺️ Mapeo de región: "${regionDetectada}" → "${regionMapeada}"`);
        
        return regionMapeada || null;
    }

    // 🏙️ Mapear comuna detectada por IP
    mapearComunaDetectada(ciudadDetectada, regionCode) {
        if (!ciudadDetectada || !regionCode) return null;
        
        const ciudad = ciudadDetectada.toLowerCase().trim();
        const regionData = REGIONES_COMUNAS_CHILE[regionCode]; // CORREGIDO: usar la constante correcta
        const comunasRegion = regionData?.comunas || [];
        
        // Buscar coincidencia exacta primero
        let comunaEncontrada = comunasRegion.find(comuna => 
            comuna.toLowerCase() === ciudad
        );
        
        // Si no encuentra, buscar coincidencia parcial
        if (!comunaEncontrada) {
            comunaEncontrada = comunasRegion.find(comuna => 
                comuna.toLowerCase().includes(ciudad) || 
                ciudad.includes(comuna.toLowerCase())
            );
        }
        
        console.log(`🏙️ Mapeo de comuna: "${ciudadDetectada}" → "${comunaEncontrada}" en región ${regionCode}`);
        
        return comunaEncontrada || null;
    }

    // 📍 Métodos de utilidad para llenar selectores
    llenarSelectRegiones(regionSelectId) {
        const regionSelect = document.getElementById(regionSelectId);
        if (!regionSelect) return;
        
        regionSelect.innerHTML = `
            <option value="">Seleccionar región</option>
            ${this.generateRegionOptions()}
        `;
    }

    llenarSelectComunas(comunaSelectId, regionCode) {
        const comunaSelect = document.getElementById(comunaSelectId);
        if (!comunaSelect) return;
        
        comunaSelect.innerHTML = `
            <option value="">Seleccionar comuna</option>
            ${this.generateComunaOptions(regionCode)}
        `;
        comunaSelect.disabled = false;
    }

    // 🔄 Método principal actualizado para incluir detección automática
    setupRegionComunaSelectorsWithAutoDetection(regionSelectId, comunaSelectId) {
        console.log('🚀 Configurando selectores con detección automática de ubicación...');
        
        // Configurar selectores básicos
        this.setupRegionComunaSelectors(regionSelectId, comunaSelectId);
        
        // Verificar si hay ubicación guardada previamente
        const ubicacionGuardada = localStorage.getItem('chile-ubicacion-confirmada');
        if (ubicacionGuardada) {
            try {
                const ubicacion = JSON.parse(ubicacionGuardada);
                const tiempoTranscurrido = Date.now() - ubicacion.timestamp;
                
                // Si la ubicación fue confirmada hace menos de 30 días, usarla
                if (tiempoTranscurrido < 30 * 24 * 60 * 60 * 1000) {
                    console.log('📍 Usando ubicación guardada previamente');
                    this.aplicarUbicacionDetectada(regionSelectId, comunaSelectId, ubicacion.region, ubicacion.comuna, {
                        fuente: 'Guardada previamente',
                        ip: 'N/A',
                        region_original: ubicacion.region,
                        ciudad_original: ubicacion.comuna
                    });
                    return;
                }
            } catch (error) {
                console.warn('⚠️ Error leyendo ubicación guardada:', error);
            }
        }
        
        // Intentar detección automática
        setTimeout(() => {
            this.setupAutoLocationDetection(regionSelectId, comunaSelectId);
        }, 1000); // Esperar un segundo para que se carguen otros servicios
    }
}

// 🌍 EXPONER GLOBALMENTE
window.REGIONES_COMUNAS_CHILE = REGIONES_COMUNAS_CHILE;
window.ChileLocationService = ChileLocationService;

console.log('🇨🇱 Sistema de regiones y comunas de Chile cargado - 16 regiones, 346 comunas');