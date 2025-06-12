// Matemágica PWA - Servicio de IA con Google Gemini - VERSIÓN SEGURA
// Este servicio ahora usa el backend para proteger las API keys

class GeminiAIService {
    constructor() {
        // ✅ CORREGIDO: URL específica del backend en puerto 3001
        this.backendUrl = 'http://localhost:3001'; // Siempre apuntar al backend
        this.configured = false;
        this.hasKey = false;
        
        // ✅ Auto-verificar configuración al inicializar
        this.checkConfiguration();
    }

    // 🔐 Verificar configuración de forma segura
    async checkConfiguration() {
        try {
            // Verificar si el backend tiene Gemini configurado
            if (window.configService) {
                await window.configService.loadConfig();
                this.configured = window.configService.isGeminiConfigured;
                this.hasKey = this.configured;
            }
            
            console.log('🤖 Gemini AI Service (Seguro):', {
                configured: this.configured,
                backendUrl: this.backendUrl + '/api/gemini/generate'
            });
            
            if (this.configured) {
                console.log('✅ Gemini AI activado - Generación inteligente disponible (vía backend seguro)');
            } else {
                console.log('📚 Modo offline - Usando ejercicios de respaldo');
            }
        } catch (error) {
            console.error('❌ Error verificando configuración de Gemini:', error);
            this.configured = false;
            this.hasKey = false;
        }
    }

    // 🔐 Configuración manual (para compatibilidad)
    configure(apiKey) {
        // En la versión segura, las API keys se manejan en el backend
        console.warn('⚠️ configure() deprecated - Las API keys ahora se manejan en el backend');
        console.log('🔐 Para configurar Gemini, agrega GEMINI_API_KEY al archivo .env del servidor');
        
        // Verificar configuración actual
        this.checkConfiguration();
    }

    // ✅ Intentar auto-configuración (deprecated pero mantenido para compatibilidad)
    tryAutoConfig() {
        this.checkConfiguration();
    }

    // Generación directa con esquemas JSON - Sumas
    async generateAdditions(level, quantity = 50) {
        console.log(`🤖 Generando EXACTAMENTE ${quantity} sumas con Gemini AI (backend seguro) - Nivel: ${level}`);
        
        if (!this.configured) {
            console.log('⚠️ Gemini AI no configurado en backend, usando fallback');
            return this.getFallbackAdditions(level, quantity);
        }

        try {
            const levelInstructions = this.getLevelInstructions(level, 'addition');
            
            const prompt = `Genera exactamente ${quantity} problemas de suma de dos dígitos para un niño de 7-8 años.
            
            REGLAS ESPECÍFICAS:
            ${levelInstructions}
            
            Devuelve SOLO un objeto JSON con el formato exacto:
            {
                "exercises": [
                    {"num1": número, "num2": número, "operation": "addition"},
                    ...
                ]
            }
            
            IMPORTANTE: Debe haber EXACTAMENTE ${quantity} ejercicios, ni más ni menos.`;

            const schema = {
                type: "OBJECT",
                properties: {
                    exercises: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                num1: { type: "INTEGER" },
                                num2: { type: "INTEGER" },
                                operation: { type: "STRING" }
                            },
                            required: ["num1", "num2", "operation"]
                        }
                    }
                },
                required: ["exercises"]
            };

            console.log(`🔄 Llamando a backend seguro para ${quantity} sumas...`);
            const result = await this.callGeminiWithSchema(prompt, schema);
            console.log('✅ Respuesta de Gemini recibida:', result);
            
            const exercises = result.exercises || [];
            
            // Validar y tomar solo la cantidad exacta
            const validExercises = exercises
                .filter(ex => ex.num1 && ex.num2 && ex.num1 > 0 && ex.num2 > 0)
                .map(ex => ({ ...ex, operation: 'addition' }))
                .slice(0, quantity);

            // Si no tenemos suficientes, completar con fallback
            if (validExercises.length < quantity) {
                console.log(`⚠️ Solo ${validExercises.length} ejercicios válidos de IA, completando con fallback`);
                const fallbackExercises = this.getFallbackAdditions(level, quantity - validExercises.length);
                validExercises.push(...fallbackExercises);
            }

            console.log(`✅ ${validExercises.length} sumas generadas con IA exitosamente`);
            return validExercises.slice(0, quantity);

        } catch (error) {
            console.error('❌ Error específico generando sumas con IA:', error);
            console.log(`🔄 Fallback: Usando ${quantity} ejercicios offline de respaldo`);
            return this.getFallbackAdditions(level, quantity);
        }
    }

    // Generación directa con esquemas JSON - Restas
    async generateSubtractions(level, quantity = 50) {
        console.log(`🤖 Generando EXACTAMENTE ${quantity} restas con Gemini AI (backend seguro) - Nivel: ${level}`);
        
        if (!this.configured) {
            console.log('⚠️ Gemini AI no configurado en backend, usando fallback');
            return this.getFallbackSubtractions(level, quantity);
        }

        try {
            const levelInstructions = this.getLevelInstructions(level, 'subtraction');
            
            const prompt = `Genera exactamente ${quantity} problemas de resta de dos dígitos para un niño de 7-8 años.
            
            REGLAS ESPECÍFICAS:
            ${levelInstructions}
            
            IMPORTANTE: En las restas, el primer número SIEMPRE debe ser mayor que el segundo para evitar resultados negativos.
            
            Devuelve SOLO un objeto JSON con el formato exacto:
            {
                "exercises": [
                    {"num1": número, "num2": número, "operation": "subtraction"},
                    ...
                ]
            }
            
            IMPORTANTE: Debe haber EXACTAMENTE ${quantity} ejercicios, ni más ni menos.`;

            const schema = {
                type: "OBJECT",
                properties: {
                    exercises: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                num1: { type: "INTEGER" },
                                num2: { type: "INTEGER" },
                                operation: { type: "STRING" }
                            },
                            required: ["num1", "num2", "operation"]
                        }
                    }
                },
                required: ["exercises"]
            };

            console.log(`🔄 Llamando a backend seguro para ${quantity} restas...`);
            const result = await this.callGeminiWithSchema(prompt, schema);
            console.log('✅ Respuesta de Gemini recibida:', result);
            
            const exercises = result.exercises || [];
            
            // Validar restas (num1 > num2) y tomar cantidad exacta
            const validExercises = exercises
                .filter(ex => ex.num1 && ex.num2 && ex.num1 > ex.num2 && ex.num1 > 0)
                .map(ex => ({ ...ex, operation: 'subtraction' }))
                .slice(0, quantity);

            // Si no tenemos suficientes, completar con fallback
            if (validExercises.length < quantity) {
                console.log(`⚠️ Solo ${validExercises.length} ejercicios válidos de IA, completando con fallback`);
                const fallbackExercises = this.getFallbackSubtractions(level, quantity - validExercises.length);
                validExercises.push(...fallbackExercises);
            }

            console.log(`✅ ${validExercises.length} restas generadas con IA exitosamente`);
            return validExercises.slice(0, quantity);

        } catch (error) {
            console.error('❌ Error específico generando restas con IA:', error);
            console.log(`🔄 Fallback: Usando ${quantity} ejercicios offline de respaldo`);
            return this.getFallbackSubtractions(level, quantity);
        }
    }

    // 3 niveles bien definidos con lógica de reserva
    getLevelInstructions(level, operation) {
        const operationName = operation === 'addition' ? 'suma' : 'resta';
        
        switch (level) {
            case 1:
                return `Nivel 1 (Fácil): ${operationName}s SIN reserva. Números de 10-99, donde ${operation === 'addition' ? 'no se necesita llevar números a la siguiente columna' : 'no se necesita pedir prestado de las decenas'}.`;
                
            case 2:
                return `Nivel 2 (Medio): ${operationName}s CON reserva. Números de 10-99, donde ${operation === 'addition' ? 'se necesita llevar números a la siguiente columna' : 'se necesita pedir prestado de las decenas'}. Todos los ejercicios deben requerir reserva.`;
                
            case 3:
                return `Nivel 3 (Difícil): Mezcla equilibrada de ${operationName}s. 25 ejercicios SIN reserva y 25 ejercicios CON reserva. Números de 10-99. Alternar entre ${operation === 'addition' ? 'sumas simples y sumas que requieren llevar' : 'restas simples y restas que requieren préstamo'}.`;
                
            default:
                return `${operationName}s básicas de dos dígitos.`;
        }
    }

    // ✅ FUNCIÓN RENOVADA: Generar ayuda pedagógica con terminología unificada
    async generateHelpForExercise(num1, num2, operation) {
        console.log(`🎯 Generando ayuda pedagógica con IA (backend seguro) para: ${num1} ${operation === 'addition' ? '+' : '-'} ${num2}`);
        
        if (!this.configured) {
            return this.getFallbackHelp(num1, num2, operation);
        }

        try {
            const operationText = operation === 'addition' ? 'suma con reserva' : 'resta con préstamo';
            const operationSymbol = operation === 'addition' ? '+' : '-';
            
            const prompt = `Eres un profesor de matemáticas muy amigable para un niño de 7-8 años. Ayúdalo a resolver esta operación SIN dar la respuesta:

            OPERACIÓN: ${num1} ${operationSymbol} ${num2}

            INSTRUCCIONES:
            - NO reveles la respuesta final
            - Usa emojis divertidos y apropiados para niños
            - Explica paso a paso el proceso de ${operationText}
            - Usa vocabulario simple y claro
            - Incluye técnicas visuales (como contar con dedos)
            - Motiva al estudiante
            - Máximo 3-4 oraciones cortas

            Responde SOLO con la ayuda pedagógica.`;

            const result = await this.callGemini(prompt);
            console.log('✅ Ayuda pedagógica generada con IA (backend seguro)');
            return result;

        } catch (error) {
            console.error('❌ Error generando ayuda:', error);
            return this.getFallbackHelp(num1, num2, operation);
        }
    }

    // ✅ FUNCIÓN FALTANTE: generateContent (para compatibilidad con el módulo)
    async generateContent(prompt) {
        console.log('🤖 Llamando generateContent con backend seguro:', prompt.substring(0, 100) + '...');
        
        if (!this.configured) {
            console.log('⚠️ Gemini AI no configurado en backend, usando ayuda de fallback');
            return this.getFallbackCustomHelp();
        }

        try {
            const result = await this.callGemini(prompt);
            console.log('✅ generateContent ejecutado exitosamente (backend seguro)');
            return result;

        } catch (error) {
            console.error('❌ Error en generateContent:', error);
            return this.getFallbackCustomHelp();
        }
    }

    // 🔐 Llamada a Gemini con esquema JSON (vía backend seguro)
    async callGeminiWithSchema(prompt, schema) {
        const response = await fetch(`${this.backendUrl}/api/gemini/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: prompt,
                schema: schema
            })
        });

        if (!response.ok) {
            throw new Error(`Backend Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Error en backend');
        }

        return data.content;
    }

    // 🔐 Llamada simple a Gemini (vía backend seguro)
    async callGemini(prompt) {
        const response = await fetch(`${this.backendUrl}/api/gemini/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: prompt
            })
        });

        if (!response.ok) {
            throw new Error(`Backend Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Error en backend');
        }

        return data.content;
    }

    // Ejercicios de fallback offline
    getFallbackAdditions(level, quantity = 50) {
        console.log(`📚 Usando ${quantity} ejercicios de suma de respaldo - Nivel ${level}`);
        
        const exercises = [];

        for (let i = 0; i < quantity; i++) {
            let num1, num2;
            
            switch (level) {
                case 1: // Sin reserva
                    num1 = this.randomBetween(10, 40);
                    num2 = this.randomBetween(10, 59 - num1); // Asegurar que no hay reserva
                    break;
                    
                case 2: // Con reserva
                    num1 = this.randomBetween(15, 99);
                    num2 = this.randomBetween(15, 99);
                    // Forzar reserva: sumar algo a las unidades para que superen 10
                    if ((num1 % 10) + (num2 % 10) < 10) {
                        num2 = (Math.floor(num2 / 10) * 10) + (11 - (num1 % 10));
                    }
                    break;
                    
                case 3: // Mixto
                    if (i < Math.ceil(quantity / 2)) {
                        // Sin reserva
                        num1 = this.randomBetween(10, 40);
                        num2 = this.randomBetween(10, 59 - num1);
                    } else {
                        // Con reserva
                        num1 = this.randomBetween(15, 99);
                        num2 = this.randomBetween(15, 99);
                        if ((num1 % 10) + (num2 % 10) < 10) {
                            num2 = (Math.floor(num2 / 10) * 10) + (11 - (num1 % 10));
                        }
                    }
                    break;
                    
                default:
                    num1 = this.randomBetween(10, 50);
                    num2 = this.randomBetween(10, 50);
            }

            exercises.push({
                num1: Math.min(num1, 99),
                num2: Math.min(num2, 99),
                operation: 'addition'
            });
        }

        return this.shuffleArray(exercises);
    }

    getFallbackSubtractions(level, quantity = 50) {
        console.log(`📚 Usando ${quantity} ejercicios de resta de respaldo - Nivel ${level}`);
        
        const exercises = [];

        for (let i = 0; i < quantity; i++) {
            let num1, num2;
            
            switch (level) {
                case 1: // Sin reserva
                    num1 = this.randomBetween(20, 99);
                    num2 = this.randomBetween(10, Math.min(num1 % 10, num1 - 10)); // Sin prestamo
                    break;
                    
                case 2: // Con reserva
                    num1 = this.randomBetween(30, 99);
                    num2 = this.randomBetween(15, num1 - 5);
                    // Forzar reserva: unidades de num2 > unidades de num1
                    if ((num1 % 10) >= (num2 % 10)) {
                        num2 = (Math.floor(num2 / 10) * 10) + ((num1 % 10) + this.randomBetween(1, 5));
                        if (num2 >= num1) num2 = num1 - this.randomBetween(1, 5);
                    }
                    break;
                    
                case 3: // Mixto
                    if (i < Math.ceil(quantity / 2)) {
                        // Sin reserva
                        num1 = this.randomBetween(20, 99);
                        num2 = this.randomBetween(10, Math.min(num1 % 10, num1 - 10));
                    } else {
                        // Con reserva
                        num1 = this.randomBetween(30, 99);
                        num2 = this.randomBetween(15, num1 - 5);
                        if ((num1 % 10) >= (num2 % 10)) {
                            num2 = (Math.floor(num2 / 10) * 10) + ((num1 % 10) + this.randomBetween(1, 5));
                            if (num2 >= num1) num2 = num1 - this.randomBetween(1, 5);
                        }
                    }
                    break;
                    
                default:
                    num1 = this.randomBetween(20, 80);
                    num2 = this.randomBetween(10, num1 - 5);
            }

            exercises.push({
                num1: Math.max(num1, num2 + 1),
                num2: Math.min(num2, num1 - 1),
                operation: 'subtraction'
            });
        }

        return this.shuffleArray(exercises);
    }

    // ✅ FUNCIONES DE FALLBACK PARA AYUDA PEDAGÓGICA con terminología unificada
    getFallbackHelp(num1, num2, operation) {
        const isAddition = operation === 'addition';
        const studentName = this.getStudentName();
        
        // Detectar si necesita reserva/llevada para dar ayuda específica
        const needsCarry = isAddition ? 
            ((num1 % 10) + (num2 % 10)) >= 10 : 
            (num1 % 10) < (num2 % 10);
        
        const helps = isAddition ? [
            `🍎 Para sumar ${num1} + ${num2}, ${studentName}, puedes usar el método vertical. ${needsCarry ? 'Recuerda llevar a la siguiente columna cuando las unidades sumen más de 10!' : 'Como las unidades no pasan de 10, es más fácil!'} Empieza sumando las unidades: ${num1 % 10} + ${num2 % 10}.`,
            
            `🧸 Imagina que tienes ${num1} juguetes y tu amigo te regala ${num2} más. ${needsCarry ? 'Si las unidades dan más de 10, recuerda llevar 1 a las decenas!' : 'Suma primero las unidades, luego las decenas.'} ¡Cuenta paso a paso, ${studentName}!`,
            
            `🌟 Para resolver ${num1} + ${num2}, ${studentName}, descompón los números: ${Math.floor(num1/10)} decenas y ${num1%10} unidades + ${Math.floor(num2/10)} decenas y ${num2%10} unidades. ${needsCarry ? '¡Cuidado con llevar a la siguiente columna!' : '¡Súmalos por separado!'}`,
            
            `🎈 Piensa en ${num1} globos que se unen con ${num2} globos más. ${needsCarry ? 'Si al sumar las unidades obtienes más de 9, pon 1 globo en el grupo de las decenas.' : 'Suma las unidades primero, después las decenas.'} ¡Tú puedes, ${studentName}!`,
            
            `🚀 Para esta suma vertical, ${studentName}, alinea los números uno debajo del otro. ${needsCarry ? 'Cuando sumes ${num1 % 10} + ${num2 % 10} y te dé más de 10, anota la unidad y lleva la decena a la siguiente columna.' : 'Suma columna por columna: unidades con unidades, decenas con decenas.'}`
        ] : [
            `🍓 Para restar ${num1} - ${num2}, ${studentName}, usa el método vertical. ${needsCarry ? '¡Necesitas pedir prestado! Como ${num1 % 10} es menor que ${num2 % 10}, pide 10 prestado de las decenas.' : 'Como ${num1 % 10} es mayor que ${num2 % 10}, puedes restar directamente.'} Empieza con las unidades.`,
            
            `🦋 Imagina que tienes ${num1} mariposas y ${num2} se van volando. ${needsCarry ? 'Si no puedes quitar ${num2 % 10} de ${num1 % 10}, pide ayuda a las decenas: toma 10 prestado.' : 'Quita primero las unidades, luego las decenas.'} ¡Paso a paso, ${studentName}!`,
            
            `🏰 Para resolver ${num1} - ${num2}, ${studentName}, coloca los números en vertical. ${needsCarry ? 'Como ${num1 % 10} < ${num2 % 10}, convierte 1 decena en 10 unidades. Ahora tendrás ${num1 % 10 + 10} - ${num2 % 10}.' : 'Resta columna por columna: unidades menos unidades, decenas menos decenas.'}`,
            
            `🌺 Piensa en ${num1} flores de las cuales regalas ${num2}. ${needsCarry ? 'Si no tienes suficientes unidades para regalar, pide prestadas 10 unidades de las decenas.' : 'Resta primero las unidades, después las decenas.'} ¡Confío en ti, ${studentName}!`,
            
            `🎪 Para esta resta vertical, ${studentName}, alinea bien los números. ${needsCarry ? 'Recuerda: si la unidad de arriba es menor, pide 10 prestado de la decena de arriba.' : 'Resta de derecha a izquierda: primero unidades, luego decenas.'}`
        ];

        return helps[Math.floor(Math.random() * helps.length)];
    }

    // ✅ FUNCIÓN FALLBACK PARA AYUDA PERSONALIZADA MEJORADA con terminología clara
    getFallbackCustomHelp() {
        const studentName = this.getStudentName();
        const fallbackHelps = [
            `🌈 ¡Hola ${studentName}! Para ser un maestro de las matemáticas, recuerda estas técnicas mágicas: 🔢 Siempre alinea los números en columnas (unidades con unidades, decenas con decenas). ✨ Cuando sumes y las unidades pasen de 10, lleva 1 a las decenas. 🎯 En las restas, si necesitas más unidades, pide prestado 10 de las decenas. ¡Practica y serás genial!`,
            
            `🧩 ¡Eres increíble, ${studentName}! Los números son como piezas de LEGO: 🏗️ Construye las operaciones paso a paso. 📐 Usa el método vertical para mantener todo ordenado. 🔄 Si te equivocas, no pasa nada: revisa y vuelve a intentar. 💪 Cada error te hace más fuerte en matemáticas. ¡Sigue construyendo tu conocimiento!`,
            
            `🎈 ¡${studentName}, eres un detective de números! 🔍 Para resolver cualquier operación: Primero observa bien los números, después decide si necesitas llevar números o pedir prestado. 🎯 Suma o resta las unidades primero, luego las decenas. 🌟 Siempre verifica tu respuesta preguntándote si tiene sentido. ¡Tu cerebro es súper poderoso!`,
            
            `🚀 ¡Aventurero ${studentName}! En el espacio de las matemáticas: 🌌 Cada número tiene su lugar especial (unidades, decenas). 🛸 Cuando viajas sumando, a veces necesitas combustible extra (llevar números a la siguiente columna). 🪐 Cuando viajas restando, a veces necesitas pedir ayuda a otros planetas (préstamo de las decenas). ¡Explora y diviértete calculando!`,
            
            `🎨 ¡Artista matemático ${studentName}! Crear operaciones es como pintar: 🖌️ Usa trazos ordenados (escribe bien alineado). 🎭 Cada número tiene su papel en la obra. 🌈 Los colores se mezclan como los números se combinan usando técnicas de reserva. 🖼️ Al final, tu resultado es una obra de arte matemática. ¡Sigue creando belleza con números!`
        ];

        return fallbackHelps[Math.floor(Math.random() * fallbackHelps.length)];
    }

    // Feedback de fallback
    getFallbackFeedback(isCorrect, correctAnswer) {
        const studentName = this.getStudentName();
        
        if (isCorrect) {
            const positiveMessages = [
                `🎉 ¡Excelente trabajo, ${studentName}! ¡Respuesta perfecta!`,
                `⭐ ¡Súper bien, ${studentName}! ¡Eres un genio de las matemáticas!`,
                `🏆 ¡Fantástico, ${studentName}! ¡Lo resolviste perfectamente!`,
                `✨ ¡Bravo, ${studentName}! ¡Qué inteligente eres!`,
                `🎯 ¡Correcto, ${studentName}! ¡Sigue así, lo estás haciendo genial!`
            ];
            return positiveMessages[Math.floor(Math.random() * positiveMessages.length)];
        } else {
            const encouragingMessages = [
                `💪 ¡Casi lo tienes, ${studentName}! Revisa los números y vuelve a intentar.`,
                `🌟 ¡Buen intento, ${studentName}! Verifica tu cálculo paso a paso.`,
                `🎯 ¡Estás cerca, ${studentName}! Cuenta de nuevo con cuidado.`,
                `💡 ¡Sigue intentando, ${studentName}! Puedes hacerlo, confío en ti.`,
                `🚀 ¡No te rindas, ${studentName}! Revisa la operación y inténtalo otra vez.`
            ];
            return encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
        }
    }

    // Utilidades
    getStudentName() {
        // Intentar obtener el nombre del usuario actual
        if (window.authManager?.currentUser?.user_metadata?.full_name) {
            return window.authManager.currentUser.user_metadata.full_name.split(' ')[0];
        }
        return 'campeón';
    }

    randomBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

// Inicializar servicio de IA
window.geminiAI = new GeminiAIService();