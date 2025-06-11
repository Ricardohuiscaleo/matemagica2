/**
 * 📚 CURRÍCULUM OFICIAL DE 2° BÁSICO - MATEMÁTICAS
 * Sistema completo basado en el plan de estudios chileno
 * Incluye: unidades, temas, objetivos, metodología y evaluación
 */

const CURRICULUM_SEGUNDO_BASICO = {
    curso: "2° Básico",
    edad_objetivo: "7-8 años",
    año_escolar: "2025",
    
    // 🎯 UNIDADES CURRICULARES
    unidades: {
        unidad1: {
            numero: 1,
            titulo: "Números y Operaciones Básicas",
            descripcion: "Conteo, representación y operaciones hasta 100",
            periodo: "Marzo - Abril",
            duracion_semanas: 8,
            color_tema: "blue",
            icono: "🔢",
            
            // Objetivos de Aprendizaje
            objetivos: [
                "Contar números del 0 al 1000 en grupos de 2, 5, 10 y 100",
                "Leer y representar números del 0 al 100 de forma concreta, pictórica y simbólica",
                "Comparar y ordenar números del 0 al 100",
                "Componer y descomponer números del 0 al 100",
                "Aplicar estrategias de cálculo mental para adiciones y sustracciones hasta 20",
                "Identificar unidades y decenas en números del 0 al 100",
                "Comprender la adición y sustracción en el ámbito del 0 al 100"
            ],
            
            temas: {
                tema1: {
                    id: "conteo-agrupacion",
                    titulo: "Conteo y Agrupación",
                    descripcion: "Contar números del 0 al 1000 en grupos",
                    subtemas: ["Conteo de 2 en 2", "Conteo de 5 en 5", "Conteo de 10 en 10", "Conteo de 100 en 100"],
                    dificultad_base: "facil",
                    tiempo_sugerido: "2-3 clases",
                    estado: "disponible",
                    
                    metodologia: {
                        concreto: "Usar objetos físicos para agrupar y contar",
                        pictórico: "Dibujos y representaciones visuales",
                        simbólico: "Números y símbolos matemáticos"
                    },
                    
                    materiales: ["Bloques multibase", "Fichas", "Ábacos", "Material concreto"],
                    
                    ejercicios_tipos: {
                        facil: {
                            descripcion: "Conteo básico con apoyo visual",
                            rangos: { min: 0, max: 20 },
                            incrementos: [2, 5, 10]
                        },
                        medio: {
                            descripcion: "Conteo con menos apoyo visual",
                            rangos: { min: 0, max: 50 },
                            incrementos: [2, 5, 10]
                        },
                        dificil: {
                            descripcion: "Conteo abstracto y patrones",
                            rangos: { min: 0, max: 100 },
                            incrementos: [2, 5, 10, 100]
                        }
                    }
                },
                
                tema2: {
                    id: "lectura-representacion",
                    titulo: "Lectura y Representación de Números",
                    descripcion: "Representar números del 0 al 100 en diferentes formas",
                    subtemas: ["Forma concreta", "Forma pictórica", "Forma simbólica", "Valor posicional"],
                    dificultad_base: "facil",
                    tiempo_sugerido: "3-4 clases",
                    estado: "disponible",
                    
                    metodologia: {
                        concreto: "Manipulación de material base 10",
                        pictórico: "Diagramas de valor posicional",
                        simbólico: "Escritura numérica estándar"
                    },
                    
                    materiales: ["Bloques base 10", "Tablero de valor posicional", "Tarjetas numéricas"],
                    
                    ejercicios_tipos: {
                        facil: {
                            descripcion: "Números hasta 20 con apoyo concreto",
                            rangos: { min: 0, max: 20 }
                        },
                        medio: {
                            descripcion: "Números hasta 50 con representación pictórica",
                            rangos: { min: 0, max: 50 }
                        },
                        dificil: {
                            descripcion: "Números hasta 100 en forma simbólica",
                            rangos: { min: 0, max: 100 }
                        }
                    }
                },
                
                tema3: {
                    id: "comparacion-orden",
                    titulo: "Comparación y Orden",
                    descripcion: "Comparar y ordenar números del 0 al 100",
                    subtemas: ["Mayor que (>)", "Menor que (<)", "Igual a (=)", "Secuencias numéricas"],
                    dificultad_base: "medio",
                    tiempo_sugerido: "2-3 clases",
                    estado: "disponible",
                    
                    metodologia: {
                        concreto: "Comparación con material manipulativo",
                        pictórico: "Recta numérica y diagramas",
                        simbólico: "Símbolos de comparación"
                    },
                    
                    materiales: ["Recta numérica", "Tarjetas de números", "Símbolos de comparación"],
                    
                    ejercicios_tipos: {
                        facil: {
                            descripcion: "Comparación de números hasta 20",
                            rangos: { min: 0, max: 20 }
                        },
                        medio: {
                            descripcion: "Comparación y orden hasta 50",
                            rangos: { min: 0, max: 50 }
                        },
                        dificil: {
                            descripcion: "Secuencias y patrones hasta 100",
                            rangos: { min: 0, max: 100 }
                        }
                    }
                },
                
                tema4: {
                    id: "composicion-descomposicion",
                    titulo: "Composición y Descomposición",
                    descripcion: "Formar y separar números usando la adición",
                    subtemas: ["Descomposición aditiva", "Valor posicional", "Diferentes representaciones"],
                    dificultad_base: "medio",
                    tiempo_sugerido: "3-4 clases",
                    estado: "disponible",
                    
                    metodologia: {
                        concreto: "Separar y juntar objetos físicos",
                        pictórico: "Diagramas de parte-todo",
                        simbólico: "Ecuaciones de composición"
                    },
                    
                    materiales: ["Fichas de colores", "Diagramas parte-todo", "Tableros de composición"],
                    
                    ejercicios_tipos: {
                        facil: {
                            descripcion: "Descomposición simple hasta 10",
                            rangos: { min: 2, max: 10 }
                        },
                        medio: {
                            descripcion: "Composición hasta 20",
                            rangos: { min: 10, max: 20 }
                        },
                        dificil: {
                            descripcion: "Múltiples descomposiciones hasta 50",
                            rangos: { min: 20, max: 50 }
                        }
                    }
                },
                
                tema5: {
                    id: "calculo-mental",
                    titulo: "Cálculo Mental",
                    descripcion: "Estrategias para calcular mentalmente hasta 20",
                    subtemas: ["Dobles", "Casi dobles", "Conteo hacia adelante", "Conteo hacia atrás"],
                    dificultad_base: "medio",
                    tiempo_sugerido: "4-5 clases",
                    estado: "disponible",
                    
                    metodologia: {
                        concreto: "Manipulación de objetos para cálculo",
                        pictórico: "Diagramas de estrategias",
                        simbólico: "Cálculo mental directo"
                    },
                    
                    materiales: ["Dados", "Fichas", "Tableros de estrategias"],
                    
                    ejercicios_tipos: {
                        facil: {
                            descripcion: "Sumas y restas hasta 10",
                            rangos: { min: 0, max: 10 }
                        },
                        medio: {
                            descripcion: "Estrategias hasta 15",
                            rangos: { min: 0, max: 15 }
                        },
                        dificil: {
                            descripcion: "Cálculo mental hasta 20",
                            rangos: { min: 0, max: 20 }
                        }
                    }
                },
                
                tema6: {
                    id: "unidades-decenas",
                    titulo: "Unidades y Decenas",
                    descripcion: "Identificar valor posicional hasta 100",
                    subtemas: ["Concepto de decena", "Unidades", "Representación posicional"],
                    dificultad_base: "medio",
                    tiempo_sugerido: "3-4 clases",
                    estado: "disponible",
                    
                    metodologia: {
                        concreto: "Bloques base 10",
                        pictórico: "Tableros de valor posicional",
                        simbólico: "Notación estándar"
                    },
                    
                    materiales: ["Bloques base 10", "Tableros posicionales", "Tarjetas de números"],
                    
                    ejercicios_tipos: {
                        facil: {
                            descripcion: "Identificar unidades y decenas hasta 30",
                            rangos: { min: 10, max: 30 }
                        },
                        medio: {
                            descripcion: "Valor posicional hasta 60",
                            rangos: { min: 10, max: 60 }
                        },
                        dificil: {
                            descripcion: "Representaciones hasta 100",
                            rangos: { min: 10, max: 100 }
                        }
                    }
                },
                
                tema7: {
                    id: "adicion-sustraccion",
                    titulo: "Adición y Sustracción",
                    descripcion: "Operaciones básicas en el ámbito 0-100",
                    subtemas: ["Sumas sin reserva", "Restas sin reserva", "Problemas simples"],
                    dificultad_base: "medio",
                    tiempo_sugerido: "5-6 clases",
                    estado: "disponible",
                    
                    metodologia: {
                        concreto: "Manipulación directa de objetos",
                        pictórico: "Diagramas y representaciones",
                        simbólico: "Algoritmos básicos"
                    },
                    
                    materiales: ["Fichas", "Recta numérica", "Problemas contextualizados"],
                    
                    ejercicios_tipos: {
                        facil: {
                            descripcion: "Operaciones hasta 20 sin reserva",
                            rangos: { min: 0, max: 20 },
                            tipos: ["suma_simple", "resta_simple"]
                        },
                        medio: {
                            descripcion: "Operaciones hasta 50",
                            rangos: { min: 0, max: 50 },
                            tipos: ["suma_simple", "resta_simple", "problemas_simples"]
                        },
                        dificil: {
                            descripcion: "Operaciones hasta 100",
                            rangos: { min: 0, max: 100 },
                            tipos: ["suma_compuesta", "resta_compuesta", "problemas_contextualizados"]
                        }
                    }
                },
                
                tema8: {
                    id: "uso-calendario",
                    titulo: "Uso del Calendario",
                    descripcion: "Identificar días, semanas, meses y fechas",
                    subtemas: ["Días de la semana", "Meses del año", "Fechas importantes"],
                    dificultad_base: "facil",
                    tiempo_sugerido: "2-3 clases",
                    estado: "disponible",
                    
                    metodologia: {
                        concreto: "Calendario físico manipulable",
                        pictórico: "Calendarios visuales",
                        simbólico: "Notación de fechas"
                    },
                    
                    materiales: ["Calendario mensual", "Tarjetas de días", "Actividades temporales"],
                    
                    ejercicios_tipos: {
                        facil: {
                            descripcion: "Días de la semana",
                            conceptos: ["dias_semana", "ayer_hoy_mañana"]
                        },
                        medio: {
                            descripcion: "Fechas y meses",
                            conceptos: ["meses_año", "fechas_importantes"]
                        },
                        dificil: {
                            descripcion: "Cálculos temporales",
                            conceptos: ["duracion_eventos", "secuencias_temporales"]
                        }
                    }
                }
            }
        },
        
        unidad2: {
            numero: 2,
            titulo: "Patrones y Estimación",
            descripcion: "Estimación de cantidades y patrones numéricos",
            periodo: "Mayo - Junio",
            duracion_semanas: 8,
            color_tema: "green",
            icono: "📊",
            
            objetivos: [
                "Aplicar estrategias de cálculo mental hasta 20",
                "Estimar cantidades hasta 100",
                "Describir posición de objetos y personas",
                "Registrar igualdades y desigualdades",
                "Relacionar adición y sustracción"
            ],
            
            temas: {
                tema1: {
                    id: "estimacion-cantidades",
                    titulo: "Estimación de Cantidades",
                    descripcion: "Estimar cantidades hasta 100",
                    subtemas: ["Estimación visual", "Benchmarks", "Aproximaciones"],
                    dificultad_base: "medio",
                    tiempo_sugerido: "3-4 clases",
                    estado: "disponible"
                },
                
                tema2: {
                    id: "posicion-objetos",
                    titulo: "Posición y Ubicación",
                    descripcion: "Describir posición de objetos y personas",
                    subtemas: ["Arriba/abajo", "Izquierda/derecha", "Cerca/lejos"],
                    dificultad_base: "facil",
                    tiempo_sugerido: "2-3 clases",
                    estado: "disponible"
                },
                
                tema3: {
                    id: "igualdad-desigualdad",
                    titulo: "Igualdad y Desigualdad",
                    descripcion: "Usar símbolos =, >, < hasta 20",
                    subtemas: ["Símbolo igual", "Mayor que", "Menor que"],
                    dificultad_base: "medio",
                    tiempo_sugerido: "3-4 clases",
                    estado: "disponible"
                },
                
                tema4: {
                    id: "familia-operaciones",
                    titulo: "Familia de Operaciones",
                    descripcion: "Relación entre adición y sustracción",
                    subtemas: ["Operaciones inversas", "Familias de números", "Verificación"],
                    dificultad_base: "medio",
                    tiempo_sugerido: "4-5 clases",
                    estado: "disponible"
                }
            }
        },
        
        unidad3: {
            numero: 3,
            titulo: "Geometría y Medición",
            descripcion: "Figuras geométricas y medición de longitudes",
            periodo: "Julio - Agosto",
            duracion_semanas: 8,
            color_tema: "purple",
            icono: "📐",
            
            objetivos: [
                "Describir y construir figuras 2D y 3D",
                "Medir longitudes con unidades no estandarizadas",
                "Usar unidades estandarizadas (cm y m)",
                "Comprender efectos de sumar/restar 0"
            ],
            
            temas: {
                tema1: {
                    id: "figuras-2d-3d",
                    titulo: "Figuras 2D y 3D",
                    descripcion: "Identificar y construir figuras geométricas",
                    subtemas: ["Círculos", "Triángulos", "Cuadrados", "Cubos", "Esferas"],
                    dificultad_base: "facil",
                    tiempo_sugerido: "4-5 clases",
                    estado: "disponible"
                },
                
                tema2: {
                    id: "medicion-longitud",
                    titulo: "Medición de Longitud",
                    descripcion: "Medir con unidades no estandarizadas y estandarizadas",
                    subtemas: ["Clips", "Palitos", "Centímetros", "Metros"],
                    dificultad_base: "medio",
                    tiempo_sugerido: "4-5 clases",
                    estado: "disponible"
                },
                
                tema3: {
                    id: "efecto-cero",
                    titulo: "Efecto del Cero",
                    descripcion: "Comprender sumar y restar 0",
                    subtemas: ["Neutro aditivo", "Identidad", "Aplicaciones"],
                    dificultad_base: "facil",
                    tiempo_sugerido: "2-3 clases",
                    estado: "disponible"
                }
            }
        },
        
        unidad4: {
            numero: 4,
            titulo: "Datos y Multiplicación",
            descripcion: "Recolección de datos y primeros conceptos de multiplicación",
            periodo: "Septiembre - Noviembre",
            duracion_semanas: 10,
            color_tema: "yellow",
            icono: "📈",
            
            objetivos: [
                "Leer horas y medias horas",
                "Registrar datos en tablas y gráficos",
                "Comprender multiplicación (tablas 2, 5, 10)",
                "Crear y continuar patrones numéricos"
            ],
            
            temas: {
                tema1: {
                    id: "lectura-tiempo",
                    titulo: "Lectura del Tiempo",
                    descripcion: "Leer horas y medias horas en relojes",
                    subtemas: ["Horas en punto", "Medias horas", "Relojes digitales"],
                    dificultad_base: "medio",
                    tiempo_sugerido: "3-4 clases",
                    estado: "disponible"
                },
                
                tema2: {
                    id: "datos-graficos",
                    titulo: "Datos y Gráficos",
                    descripcion: "Registrar y representar datos",
                    subtemas: ["Tablas simples", "Pictogramas", "Gráficos de barras"],
                    dificultad_base: "medio",
                    tiempo_sugerido: "4-5 clases",
                    estado: "disponible"
                },
                
                tema3: {
                    id: "introduccion-multiplicacion",
                    titulo: "Introducción a la Multiplicación",
                    descripcion: "Conceptos básicos y tablas del 2, 5 y 10",
                    subtemas: ["Suma repetida", "Tabla del 2", "Tabla del 5", "Tabla del 10"],
                    dificultad_base: "dificil",
                    tiempo_sugerido: "6-7 clases",
                    estado: "disponible"
                },
                
                tema4: {
                    id: "patrones-numericos",
                    titulo: "Patrones Numéricos",
                    descripcion: "Crear y continuar secuencias",
                    subtemas: ["Patrones crecientes", "Patrones decrecientes", "Reglas de patrones"],
                    dificultad_base: "medio",
                    tiempo_sugerido: "3-4 clases",
                    estado: "disponible"
                }
            }
        }
    },
    
    // 🎯 CONFIGURACIÓN PEDAGÓGICA
    configuracion_pedagogica: {
        metodologia_base: "Concreto → Pictórico → Simbólico (CPS)",
        tiempo_clase: 45, // minutos
        evaluacion_formativa: true,
        retroalimentacion_inmediata: true,
        
        niveles_dificultad: {
            facil: {
                descripcion: "Nivel introductorio con máximo apoyo visual y concreto",
                tiempo_promedio: "5-8 minutos por ejercicio",
                indicadores: ["Reconocimiento básico", "Manipulación concreta", "Apoyo visual completo"]
            },
            medio: {
                descripcion: "Nivel intermedio con apoyo pictórico",
                tiempo_promedio: "3-5 minutos por ejercicio", 
                indicadores: ["Aplicación guiada", "Representación pictórica", "Apoyo visual parcial"]
            },
            dificil: {
                descripcion: "Nivel avanzado con representación simbólica",
                tiempo_promedio: "2-4 minutos por ejercicio",
                indicadores: ["Aplicación autónoma", "Abstracción", "Mínimo apoyo visual"]
            }
        },
        
        criterios_evaluacion: {
            logrado: { min_porcentaje: 80, color: "green" },
            en_desarrollo: { min_porcentaje: 60, color: "yellow" },
            por_lograr: { min_porcentaje: 0, color: "red" }
        }
    },
    
    // 🎯 GENERACIÓN DE EJERCICIOS
    generador_ejercicios: {
        // Plantillas por tipo de ejercicio
        plantillas: {
            conteo_agrupacion: {
                facil: [
                    "Cuenta de {incremento} en {incremento} desde {inicio} hasta {fin}",
                    "¿Cuántos grupos de {incremento} hay en {total}?",
                    "Continúa la secuencia: {secuencia_parcial}"
                ],
                medio: [
                    "Si tienes {total} objetos y los agrupas de {incremento} en {incremento}, ¿cuántos grupos completos formas?",
                    "Cuenta hacia atrás de {incremento} en {incremento} desde {inicio}",
                    "¿Qué número viene después en esta secuencia: {secuencia}?"
                ],
                dificil: [
                    "En una caja hay {total} lápices organizados en grupos de {incremento}. ¿Cuántos grupos hay y sobran lápices?",
                    "María cuenta de {incremento} en {incremento}. Si empieza en {inicio}, ¿en qué número estará después de dar {pasos} pasos?",
                    "Encuentra el patrón y completa: {patron_complejo}"
                ]
            },
            
            comparacion_numeros: {
                facil: [
                    "¿Cuál es mayor: {num1} o {num2}?",
                    "Ordena de menor a mayor: {lista_numeros}",
                    "Completa con >, < o =: {num1} __ {num2}"
                ],
                medio: [
                    "Entre los números {lista}, ¿cuál está más cerca de {referencia}?",
                    "Ordena estos números y encuentra el del medio: {lista_numeros}",
                    "¿Verdadero o falso? {num1} + {sum} = {num2}"
                ],
                dificil: [
                    "Si {nombre} tiene {num1} {objeto} y {nombre2} tiene {num2}, ¿quién tiene más y por cuánto?",
                    "Encuentra todos los números entre {min} y {max} que terminan en {digito}",
                    "Ordena de mayor a menor y explica tu estrategia: {lista_compleja}"
                ]
            },
            
            adicion_sustraccion: {
                facil: [
                    "{num1} + {num2} = __",
                    "{num1} - {num2} = __",
                    "Si tienes {num1} {objeto} y recibes {num2} más, ¿cuántos tienes en total?"
                ],
                medio: [
                    "María tenía {num1} stickers. Regaló {num2} y luego compró {num3}. ¿Cuántos tiene ahora?",
                    "Encuentra el número que falta: {num1} + __ = {resultado}",
                    "¿Cuál es la diferencia entre {num1} y {num2}?"
                ],
                dificil: [
                    "En una tienda había {num1} juguetes. Vendieron {num2} en la mañana y {num3} en la tarde. ¿Cuántos quedan?",
                    "Pedro tiene {num1} cartas. Su hermana tiene {num2} cartas más que él. ¿Cuántas cartas tienen en total?",
                    "Resuelve paso a paso: ({num1} + {num2}) - {num3} = __"
                ]
            }
        },
        
        // Parámetros por nivel
        parametros: {
            facil: {
                numeros_max: 20,
                operaciones_max: 2,
                apoyo_visual: true,
                tiempo_sugerido: 480 // 8 minutos en segundos
            },
            medio: {
                numeros_max: 50,
                operaciones_max: 3,
                apoyo_visual: false,
                tiempo_sugerido: 300 // 5 minutos
            },
            dificil: {
                numeros_max: 100,
                operaciones_max: 4,
                apoyo_visual: false,
                tiempo_sugerido: 240 // 4 minutos
            }
        }
    },
    
    // 🎯 SEGUIMIENTO Y PROGRESO
    sistema_progreso: {
        puntuacion: {
            ejercicio_correcto: 10,
            ejercicio_bonus_velocidad: 5,
            tema_completado: 50,
            unidad_completada: 200
        },
        
        badges: {
            "contador_experto": {
                nombre: "🔢 Contador Experto",
                requisito: "Completar todos los ejercicios de conteo",
                puntos: 100
            },
            "suma_champion": {
                nombre: "➕ Campeón de Sumas",
                requisito: "100 sumas correctas",
                puntos: 150
            },
            "explorador_geometrico": {
                nombre: "📐 Explorador Geométrico", 
                requisito: "Completar Unidad 3 de Geometría",
                puntos: 200
            }
        },
        
        reportes: {
            diario: ["ejercicios_completados", "tiempo_dedicado", "precision"],
            semanal: ["progreso_unidades", "temas_dominados", "areas_mejora"],
            mensual: ["logros_curriculum", "comparativo_periodo", "recomendaciones"]
        }
    }
};

// 🎯 FUNCIONES DE UTILIDAD CURRICULAR

/**
 * Obtiene información completa de una unidad
 */
function obtenerUnidad(numeroUnidad) {
    const unidadKey = `unidad${numeroUnidad}`;
    return CURRICULUM_SEGUNDO_BASICO.unidades[unidadKey] || null;
}

/**
 * Obtiene todos los temas de una unidad
 */
function obtenerTemas(numeroUnidad) {
    const unidad = obtenerUnidad(numeroUnidad);
    return unidad ? unidad.temas : {};
}

/**
 * Obtiene información específica de un tema
 */
function obtenerTema(numeroUnidad, temaId) {
    const temas = obtenerTemas(numeroUnidad);
    return temas[temaId] || null;
}

/**
 * Genera configuración de ejercicios basada en el currículum
 */
function generarConfiguracionEjercicios(numeroUnidad, temaId, dificultad = 'facil') {
    const tema = obtenerTema(numeroUnidad, temaId);
    if (!tema) return null;
    
    const parametros = CURRICULUM_SEGUNDO_BASICO.generador_ejercicios.parametros[dificultad];
    const ejerciciosTipo = tema.ejercicios_tipos[dificultad];
    
    return {
        tema: tema,
        parametros: parametros,
        ejercicios_tipo: ejerciciosTipo,
        metodologia: tema.metodologia,
        materiales: tema.materiales,
        tiempo_sugerido: tema.tiempo_sugerido
    };
}

/**
 * Obtiene recomendaciones pedagógicas para un tema
 */
function obtenerRecomendacionesPedagogicas(numeroUnidad, temaId) {
    const tema = obtenerTema(numeroUnidad, temaId);
    if (!tema) return null;
    
    return {
        metodologia: tema.metodologia,
        materiales: tema.materiales,
        tiempo_sugerido: tema.tiempo_sugerido,
        dificultad_base: tema.dificultad_base,
        subtemas: tema.subtemas
    };
}

/**
 * Calcula progreso en el currículum
 */
function calcularProgresoCurriculum(datosEstudiante) {
    const totalUnidades = Object.keys(CURRICULUM_SEGUNDO_BASICO.unidades).length;
    const unidadesCompletadas = datosEstudiante.unidades_completadas || 0;
    
    return {
        porcentaje_general: Math.round((unidadesCompletadas / totalUnidades) * 100),
        unidades_completadas: unidadesCompletadas,
        total_unidades: totalUnidades,
        siguiente_unidad: unidadesCompletadas + 1 <= totalUnidades ? unidadesCompletadas + 1 : null
    };
}

/**
 * Obtiene el siguiente tema recomendado para el estudiante
 */
function obtenerSiguienteTema(progresoEstudiante) {
    // Lógica para determinar el siguiente tema basado en el progreso
    // Implementación específica según el estado del estudiante
    const unidadActual = progresoEstudiante.unidad_actual || 1;
    const unidad = obtenerUnidad(unidadActual);
    
    if (!unidad) return null;
    
    const temasCompletados = progresoEstudiante.temas_completados || [];
    const temasUnidad = Object.keys(unidad.temas);
    
    // Encuentra el primer tema no completado
    for (const temaKey of temasUnidad) {
        if (!temasCompletados.includes(temaKey)) {
            return {
                unidad: unidadActual,
                tema: temaKey,
                datos: unidad.temas[temaKey]
            };
        }
    }
    
    // Si todos los temas están completados, ir a la siguiente unidad
    return {
        unidad: unidadActual + 1,
        tema: 'tema1',
        datos: obtenerUnidad(unidadActual + 1)?.temas?.tema1 || null
    };
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CURRICULUM_SEGUNDO_BASICO,
        obtenerUnidad,
        obtenerTemas,
        obtenerTema,
        generarConfiguracionEjercicios,
        obtenerRecomendacionesPedagogicas,
        calcularProgresoCurriculum,
        obtenerSiguienteTema
    };
}