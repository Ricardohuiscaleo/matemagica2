// Matemágica PWA - Servicio de IA con Google Gemini
// Mecánicas de IA efectivas rescatadas del respaldo original

class GeminiAIService {
    constructor() {
        this.apiKey = '';
        // ✅ CAMBIO: Usar modelo estable en lugar del experimental
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
        this.configured = false;
        this.hasKey = false;
        
        // ✅ Auto-configurar si hay API key disponible
        this.tryAutoConfig();
    }

    // ✅ Intentar auto-configuración
    tryAutoConfig() {
        // Buscar API key en variables de entorno del navegador
        const possibleKeys = [
            window.GEMINI_API_KEY,
            localStorage.getItem('gemini_api_key'),
            // ✅ API key de Google Gemini configurada
            'AIzaSyCc1bdkzVLHXxxKOBndV3poK2KQikLJ6DI'
        ];

        for (const key of possibleKeys) {
            if (key && key.startsWith('AIzaSy')) {
                this.configure(key);
                break;
            }
        }
    }

    // ✅ Configuración mejorada
    configure(apiKey) {
        this.apiKey = apiKey;
        this.hasKey = !!apiKey;
        this.configured = this.hasKey && apiKey.startsWith('AIzaSy');
        
        console.log('🤖 Gemini AI Service configurado:', {
            configured: this.configured,
            hasValidKey: this.hasKey && apiKey.startsWith('AIzaSy'),
            apiUrl: this.baseUrl.split('/').slice(0, 4).join('/') + '/...' // Ocultar detalles
        });
        
        if (this.configured) {
            console.log('✅ Gemini AI activado - Generación inteligente disponible');
        } else {
            console.log('📚 Modo offline - Usando ejercicios de respaldo');
        }
    }

    // Generación directa con esquemas JSON - Sumas
    async generateAdditions(level, quantity = 50) {
        // ✅ DEBUG: Log detallado para identificar el problema
        console.log(`🔍 DEBUG generateAdditions - PARÁMETROS RECIBIDOS:`);
        console.log(`   → Level: ${level} (tipo: ${typeof level})`);
        console.log(`   → Quantity: ${quantity} (tipo: ${typeof quantity})`);
        console.log(`   → Arguments.length: ${arguments.length}`);
        console.log(`   → Todos los argumentos:`, Array.from(arguments));
        
        console.log(`🤖 Generando EXACTAMENTE ${quantity} sumas con Gemini AI - Nivel: ${level}`);
        
        if (!this.configured) {
            console.log('⚠️ Gemini AI no configurado, usando fallback');
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

            console.log(`🔄 Llamando a Gemini API para ${quantity} sumas...`);
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
        console.log(`🤖 Generando EXACTAMENTE ${quantity} restas con Gemini AI - Nivel: ${level}`);
        
        if (!this.configured) {
            console.log('⚠️ Gemini AI no configurado, usando fallback');
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

            console.log(`🔄 Llamando a Gemini API para ${quantity} restas...`);
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
        console.log(`🎯 Generando ayuda pedagógica con IA para: ${num1} ${operation === 'addition' ? '+' : '-'} ${num2}`);
        
        if (!this.configured) {
            return this.getFallbackHelp(num1, num2, operation);
        }

        try {
            const operationText = operation === 'addition' ? 'suma con reserva' : 'resta con préstamo';
            const operationSymbol = operation === 'addition' ? '+' : '-';
            
            const prompt = `Eres un profesor de matemáticas muy amigable para un niño de 7-8 años. Ayúdalo a resolver esta operación SIN dar la respuesta:

            OPERACIÓN: ${num1} ${operationSymbol} ${num2}

            INSTRUCCIONES:
            - USA TERMINOLOGÍA PEDAGÓGICA CHILENA ESTÁNDAR:
              * Para suma: "llevar a la siguiente columna" cuando sumes más de 10
              * Para resta: "pedir prestado de las decenas" cuando necesites más unidades
            - Explica paso a paso cómo resolver usando técnicas apropiadas para su edad
            - Usa ejemplos con objetos familiares (manzanas, juguetes, caramelos, etc.)
            - Menciona si necesita "${operation === 'addition' ? 'llevar números' : 'pedir prestado'}" según corresponda
            - Incluye emojis divertidos y motivadores
            - Máximo 4-5 oraciones cortas
            - NO REVELES LA RESPUESTA FINAL
            - Usa un lenguaje simple y cariñoso
            - Da tips específicos para esta operación

            Ejemplo de estructura para suma:
            "🍎 Imagina que tienes ${num1} manzanas y tu amigo te regala ${num2} más. Puedes contar todas juntitas o usar la técnica de llevar a la siguiente columna si las unidades suman más de 10..."

            Ejemplo de estructura para resta:
            "🧸 Si tienes ${num1} juguetes y guardas ${num2} en la caja, puedes contar los que quedan o usar la técnica de pedir prestado de las decenas si necesitas más unidades..."

            Responde SOLO con la ayuda pedagógica.`;

            const result = await this.callGemini(prompt);
            console.log('✅ Ayuda pedagógica generada con IA');
            return result;

        } catch (error) {
            console.error('❌ Error generando ayuda:', error);
            return this.getFallbackHelp(num1, num2, operation);
        }
    }

    // ✅ FUNCIÓN MEJORADA: Generar ayuda con prompt personalizado
    async generateHelp(customPrompt) {
        console.log('🎯 Generando ayuda pedagógica personalizada con IA...');
        
        if (!this.configured) {
            console.log('⚠️ Gemini AI no configurado, usando ayuda de fallback');
            return this.getFallbackCustomHelp();
        }

        try {
            const result = await this.callGemini(customPrompt);
            console.log('✅ Ayuda pedagógica personalizada generada con IA exitosamente');
            return result;

        } catch (error) {
            console.error('❌ Error generando ayuda personalizada:', error);
            return this.getFallbackCustomHelp();
        }
    }

    // ✅ FUNCIÓN LEGACY: Mantener compatibilidad con generateStory
    async generateStory(customPrompt) {
        // Redirigir a la nueva función de ayuda
        return this.generateHelp(customPrompt);
    }

    // ✅ FUNCIÓN LEGACY: Mantener compatibilidad con generateStoryFromExercise
    async generateStoryFromExercise(num1, num2, operation) {
        // Redirigir a la nueva función de ayuda
        return this.generateHelpForExercise(num1, num2, operation);
    }

    // Feedback inteligente personalizado
    async generateFeedback(userAnswer, correctAnswer, isCorrect) {
        console.log(`🤖 Generando feedback personalizado - Correcto: ${isCorrect}, Respuesta: ${userAnswer}/${correctAnswer}`);
        
        if (!this.configured) {
            return this.getFallbackFeedback(isCorrect, correctAnswer);
        }

        try {
            const studentName = this.getStudentName();
            
            const prompt = `Eres un profesor amigable y motivador para un niño de 7-8 años llamado ${studentName}.

            SITUACIÓN:
            - Respuesta correcta: ${correctAnswer}
            - Respuesta del estudiante: ${userAnswer}
            - ¿Es correcta? ${isCorrect ? 'SÍ' : 'NO'}

            INSTRUCCIONES:
            ${isCorrect ? 
                `- Felicita calurosamente a ${studentName}
                - Usa emojis positivos
                - Menciona lo bien que lo hizo
                - Anímale a seguir` 
                : 
                `- Anima a ${studentName} de forma positiva
                - NO reveles la respuesta correcta
                - Da una pista útil sin dar la solución
                - Motívale a intentar de nuevo
                - Usa emojis de apoyo`
            }

            Responde en 1-2 oraciones máximo, de forma cálida y motivadora.`;

            const result = await this.callGemini(prompt);
            console.log('✅ Feedback personalizado generado con IA');
            return result;

        } catch (error) {
            console.error('❌ Error generando feedback:', error);
            return this.getFallbackFeedback(isCorrect, correctAnswer);
        }
    }

    // ✅ FUNCIÓN FALTANTE: generateContent (para compatibilidad con el módulo)
    async generateContent(prompt) {
        console.log('🤖 Llamando generateContent con prompt:', prompt.substring(0, 100) + '...');
        
        if (!this.configured) {
            console.log('⚠️ Gemini AI no configurado, usando ayuda de fallback');
            return this.getFallbackCustomHelp();
        }

        try {
            const result = await this.callGemini(prompt);
            console.log('✅ generateContent ejecutado exitosamente');
            return result;

        } catch (error) {
            console.error('❌ Error en generateContent:', error);
            return this.getFallbackCustomHelp();
        }
    }

    // Llamada a Gemini con esquema JSON
    async callGeminiWithSchema(prompt, schema) {
        const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    role: 'user',
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    responseMimeType: 'application/json',
                    responseSchema: schema,
                    temperature: 0.7,
                    maxOutputTokens: 2048
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!content) {
            throw new Error('No content in API response');
        }

        return JSON.parse(content);
    }

    // Llamada simple a Gemini
    async callGemini(prompt) {
        const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    role: 'user',
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.8,
                    maxOutputTokens: 1024
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Error generando contenido';
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