// Matemágica PWA - Servicio de IA con Google Gemini
// Mecánicas de IA efectivas rescatadas del respaldo original

class GeminiAIService {
    constructor() {
        this.apiKey = '';
        // ✅ CAMBIO: Usar modelo estable en lugar del experimental
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
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
    async generateAdditions(level) {
        console.log(`🤖 Generando sumas con Gemini AI - Nivel: ${level}`);
        
        if (!this.configured) {
            console.log('⚠️ Gemini AI no configurado, usando fallback');
            return this.getFallbackAdditions(level);
        }

        try {
            const levelInstructions = this.getLevelInstructions(level, 'addition');
            
            const prompt = `Genera exactamente 50 problemas de suma de dos dígitos para un niño de 7-8 años. 
            
            REGLAS ESPECÍFICAS:
            ${levelInstructions}
            
            Devuelve SOLO un objeto JSON con el formato exacto:
            {
                "exercises": [
                    {"num1": número, "num2": número, "operation": "addition"},
                    ...
                ]
            }`;

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

            console.log('🔄 Llamando a Gemini API para sumas...');
            const result = await this.callGeminiWithSchema(prompt, schema);
            console.log('✅ Respuesta de Gemini recibida:', result);
            
            const exercises = result.exercises || [];
            
            // Validar y completar si es necesario
            const validExercises = exercises
                .filter(ex => ex.num1 && ex.num2 && ex.num1 > 0 && ex.num2 > 0)
                .map(ex => ({ ...ex, operation: 'addition' }))
                .slice(0, 50);

            // Si no tenemos suficientes, completar con fallback
            if (validExercises.length < 50) {
                console.log(`⚠️ Solo ${validExercises.length} ejercicios válidos de IA, completando con fallback`);
                const fallbackExercises = this.getFallbackAdditions(level);
                validExercises.push(...fallbackExercises.slice(validExercises.length));
            }

            console.log(`✅ ${validExercises.length} sumas generadas con IA exitosamente`);
            return validExercises.slice(0, 50);

        } catch (error) {
            console.error('❌ Error específico generando sumas con IA:', error);
            console.log('🔄 Fallback: Usando ejercicios offline de respaldo');
            return this.getFallbackAdditions(level);
        }
    }

    // Generación directa con esquemas JSON - Restas
    async generateSubtractions(level) {
        console.log(`🤖 Generando restas con Gemini AI - Nivel: ${level}`);
        
        if (!this.configured) {
            console.log('⚠️ Gemini AI no configurado, usando fallback');
            return this.getFallbackSubtractions(level);
        }

        try {
            const levelInstructions = this.getLevelInstructions(level, 'subtraction');
            
            const prompt = `Genera exactamente 50 problemas de resta de dos dígitos para un niño de 7-8 años.
            
            REGLAS ESPECÍFICAS:
            
            IMPORTANTE: En las restas, el primer número SIEMPRE debe ser mayor que el segundo para evitar resultados negativos.
            
            Devuelve SOLO un objeto JSON con el formato exacto:
            {
                "exercises": [
                    {"num1": número, "num2": número, "operation": "subtraction"},
                    ...
                ]
            }`;

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

            console.log('🔄 Llamando a Gemini API para restas...');
            const result = await this.callGeminiWithSchema(prompt, schema);
            console.log('✅ Respuesta de Gemini recibida:', result);
            
            const exercises = result.exercises || [];
            
            // Validar restas (num1 > num2)
            const validExercises = exercises
                .filter(ex => ex.num1 && ex.num2 && ex.num1 > ex.num2 && ex.num1 > 0)
                .map(ex => ({ ...ex, operation: 'subtraction' }))
                .slice(0, 50);

            // Si no tenemos suficientes, completar con fallback
            if (validExercises.length < 50) {
                console.log(`⚠️ Solo ${validExercises.length} ejercicios válidos de IA, completando con fallback`);
                const fallbackExercises = this.getFallbackSubtractions(level);
                validExercises.push(...fallbackExercises.slice(validExercises.length));
            }

            console.log(`✅ ${validExercises.length} restas generadas con IA exitosamente`);
            return validExercises.slice(0, 50);

        } catch (error) {
            console.error('❌ Error específico generando restas con IA:', error);
            console.log('🔄 Fallback: Usando ejercicios offline de respaldo');
            return this.getFallbackSubtractions(level);
        }
    }

    // 3 niveles bien definidos con lógica de reserva
    getLevelInstructions(level, operation) {
        const operationName = operation === 'addition' ? 'suma' : 'resta';
        
        switch (level) {
            case 1:
                return `Nivel 1 (Fácil): ${operationName}s SIN reserva/llevada. Números de 10-99, pero el resultado debe ser calculable sin llevar unidades o decenas.`;
                
            case 2:
                return `Nivel 2 (Medio): ${operationName}s CON reserva/llevada. Números de 10-99, donde se necesita llevar unidades o decenas. Todos los ejercicios deben requerir reserva.`;
                
            case 3:
                return `Nivel 3 (Difícil): Mezcla equilibrada de ${operationName}s. 25 ejercicios SIN reserva y 25 ejercicios CON reserva. Números de 10-99. Alternar entre fáciles y complejos.`;
                
            default:
                return `${operationName}s básicas de dos dígitos.`;
        }
    }

    // Cuentos desde botones de ejercicios
    async generateStoryFromExercise(num1, num2, operation) {
        console.log(`🎭 Generando cuento matemático con IA para: ${num1} ${operation === 'addition' ? '+' : '-'} ${num2}`);
        
        if (!this.configured) {
            return this.getFallbackStory(num1, num2, operation);
        }

        try {
            const operationText = operation === 'addition' ? 'suma' : 'resta';
            const operationSymbol = operation === 'addition' ? '+' : '-';
            
            const prompt = `Crea un cuento matemático corto, divertido y fácil para un niño de 7-8 años usando la operación: ${num1} ${operationSymbol} ${num2}

            REQUISITOS:
            - Máximo 3-4 oraciones
            - Usar personajes divertidos (animales, juguetes, etc.)
            - Situación cotidiana y alegre
            - Terminar con una pregunta clara
            - No mencionar la respuesta
            - Lenguaje simple y amigable

            Ejemplo de estructura:
            "🐻 El osito Paco tenía [num1] miel. Su amigo le regaló [num2] más..."
            
            Responde SOLO con el texto del cuento.`;

            const result = await this.callGemini(prompt);
            console.log('✅ Cuento generado con IA');
            return result;

        } catch (error) {
            console.error('❌ Error generando cuento:', error);
            return this.getFallbackStory(num1, num2, operation);
        }
    }

    // Feedback inteligente personalizado
    async generateFeedback(userAnswer, correctAnswer, isCorrect) {
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
            return result;

        } catch (error) {
            console.error('❌ Error generando feedback:', error);
            return this.getFallbackFeedback(isCorrect, correctAnswer);
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
    getFallbackAdditions(level) {
        console.log(`📚 Usando ejercicios de suma de respaldo - Nivel ${level}`);
        
        const exercises = [];
        const count = 50;

        for (let i = 0; i < count; i++) {
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
                    if (i < 25) {
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

    getFallbackSubtractions(level) {
        console.log(`📚 Usando ejercicios de resta de respaldo - Nivel ${level}`);
        
        const exercises = [];
        const count = 50;

        for (let i = 0; i < count; i++) {
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
                    if (i < 25) {
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

    // Cuentos de fallback
    getFallbackStory(num1, num2, operation) {
        const isAddition = operation === 'addition';
        const stories = isAddition ? [
            `🦋 La mariposa Luna tenía ${num1} flores en su jardín. Su amiga le trajo ${num2} flores más del bosque. ¿Cuántas flores tiene Luna ahora en total?`,
            `🚗 En el estacionamiento había ${num1} autos rojos. Llegaron ${num2} autos azules más. ¿Cuántos autos hay en total?`,
            `🍎 María recogió ${num1} manzanas por la mañana. En la tarde recogió ${num2} manzanas más. ¿Cuántas manzanas recogió en total?`,
            `⭐ En el cielo brillaban ${num1} estrellas. Aparecieron ${num2} estrellas más. ¿Cuántas estrellas brillan ahora?`,
            `🐠 En la pecera nadaban ${num1} peces dorados. El papá puso ${num2} peces más. ¿Cuántos peces nadan ahora?`
        ] : [
            `🍪 La abuela horneó ${num1} galletas. Los niños se comieron ${num2} galletas. ¿Cuántas galletas quedaron?`,
            `🎈 Pedro tenía ${num1} globos de colores. Se le volaron ${num2} globos. ¿Cuántos globos le quedaron?`,
            `🌟 En la caja había ${num1} stickers brillantes. Ana usó ${num2} stickers en su cuaderno. ¿Cuántos stickers quedaron?`,
            `🚲 En la tienda había ${num1} bicicletas. Vendieron ${num2} bicicletas. ¿Cuántas bicicletas quedaron?`,
            `🐾 El perrito Max tenía ${num1} juguetes. Perdió ${num2} juguetes en el parque. ¿Cuántos juguetes le quedaron?`
        ];

        return stories[Math.floor(Math.random() * stories.length)];
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