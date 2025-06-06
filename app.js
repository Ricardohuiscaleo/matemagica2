// Variables globales
let deferredPrompt;
let authManager; // Agregar referencia al AuthManager

// Eliminar el import dinámico problemático y usar la instancia global
window.addEventListener('DOMContentLoaded', async () => {
    // Esperar a que se carguen los módulos de autenticación
    // El authManager se cargará automáticamente desde auth-manager.js
    
    // Pequeña espera para asegurar que los módulos estén cargados
    setTimeout(() => {
        // El authManager está disponible globalmente
        if (window.authManager) {
            authManager = window.authManager;
            console.log('AuthManager cargado correctamente');
            setupAuthIntegration();
        } else {
            console.warn('AuthManager no está disponible, pero la app funcionará sin autenticación');
        }
        
        // Resto de la inicialización
        initializeApp();
    }, 100);
});

function setupAuthIntegration() {
    if (!authManager) return;
    
    // Actualizar nombre del usuario en el header cuando se autentique
    window.addEventListener('userAuthenticated', (event) => {
        const profile = event.detail.profile;
        if (profile && profile.full_name) {
            document.getElementById('name-input').value = profile.full_name;
        }
    });
    
    // Configurar nivel preferido del usuario
    window.addEventListener('userAuthenticated', (event) => {
        const profile = event.detail.profile;
        if (profile && profile.preferred_level) {
            const levelRadio = document.querySelector(`input[name="level"][value="${profile.preferred_level}"]`);
            if (levelRadio) {
                levelRadio.checked = true;
            }
        }
    });
}

// Función para guardar progreso de ejercicios con autenticación
async function saveExerciseProgress(exerciseData) {
    if (authManager && authManager.isAuthenticated) {
        try {
            await authManager.saveExerciseProgress(exerciseData);
            console.log('Progreso guardado en Supabase');
        } catch (error) {
            console.error('Error guardando en Supabase:', error);
        }
    }
    
    // Siempre guardar localmente como backup
    localStorage.setItem('lastExercises', JSON.stringify(exerciseData));
}

// Función para guardar progreso de cuentos con autenticación
async function saveStoryProgress(storyData) {
    if (authManager && authManager.isAuthenticated) {
        try {
            await authManager.saveStoryProgress(storyData);
            console.log('Cuento guardado en Supabase');
        } catch (error) {
            console.error('Error guardando cuento en Supabase:', error);
        }
    }
}

// Elementos del DOM
const generateBtn = document.getElementById('generate-btn');
const printPdfBtn = document.getElementById('print-pdf-btn');
const mainLoader = document.getElementById('loader');
const content = document.getElementById('content');
const errorMessage = document.getElementById('error-message');
const additionsGrid = document.getElementById('additions-grid');
const subtractionsGrid = document.getElementById('subtractions-grid');

// Validar que todos los elementos críticos existan
if (!generateBtn || !printPdfBtn || !mainLoader || !content || !errorMessage) {
    console.error('Error: No se pudieron encontrar elementos críticos del DOM');
}

// Cuento Personalizado
const createStoryBtn = document.getElementById('create-story-btn');
const customStoryLoader = document.getElementById('custom-story-loader');
const customStoryOutput = document.getElementById('custom-story-output');
const customStoryText = document.getElementById('custom-story-text');
const customStoryAnswerInput = document.getElementById('custom-story-answer');
const customCheckBtn = document.getElementById('custom-story-check-btn');
const customFeedbackLoader = document.getElementById('custom-feedback-loader');
const customFeedbackDiv = document.getElementById('custom-feedback');

// Modal
const storyModal = document.getElementById('story-modal');
const storyTitle = document.getElementById('story-title');
const storyTextEl = document.getElementById('story-text');
const storyLoader = document.getElementById('story-loader');
const closeModalBtn = document.getElementById('close-modal-btn');
const storyAnswerInput = document.getElementById('story-answer-input');
const storyCheckBtn = document.getElementById('story-check-btn');
const modalFeedbackLoader = document.getElementById('modal-feedback-loader');
const modalFeedbackDiv = document.getElementById('modal-feedback');

// PWA Install
const installPrompt = document.getElementById('install-prompt');
const installButton = document.getElementById('install-button');
const dismissInstallBtn = document.getElementById('dismiss-install');

// Configuración API - ACTUALIZADA para 2025
const API_KEY = "AIzaSyCc1bdkzVLHXxxKOBndV3poK2KQikLJ6DI";
const API_URL_GENERATE = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

// Registro del Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then((registration) => {
                console.log('SW registrado: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registro falló: ', registrationError);
            });
    });
}

// PWA Install Prompt
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallPrompt();
});

function showInstallPrompt() {
    // Solo mostrar si no está instalada y no fue rechazada previamente
    if (!localStorage.getItem('installDismissed') && !window.matchMedia('(display-mode: standalone)').matches) {
        installPrompt.classList.add('show');
    }
}

installButton.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
        console.log('Usuario aceptó instalar la PWA');
    }
    
    deferredPrompt = null;
    hideInstallPrompt();
});

dismissInstallBtn.addEventListener('click', () => {
    localStorage.setItem('installDismissed', 'true');
    hideInstallPrompt();
});

function hideInstallPrompt() {
    installPrompt.classList.remove('show');
}

// Funciones API mejoradas
async function callGemini(payload) {
    if (!API_KEY) {
        throw new Error('⚠️ API key de Google Gemini no configurada');
    }
    
    try {
        console.log('🤖 Llamando a Gemini API...');
        
        const response = await fetch(API_URL_GENERATE, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-goog-api-key': API_KEY
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const errorData = await response.text();
            console.error('❌ Error de API:', response.status, errorData);
            
            if (response.status === 403) {
                throw new Error('🔑 API key inválida o sin permisos. Verifica tu configuración.');
            } else if (response.status === 429) {
                throw new Error('⏰ Límite de peticiones excedido. Intenta en unos minutos.');
            } else {
                throw new Error(`💥 Error de la API: ${response.status} - ${response.statusText}`);
            }
        }
        
        const result = await response.json();
        console.log('✅ Respuesta de Gemini recibida');
        return result;
        
    } catch (error) {
        console.error('❌ Error llamando a Gemini:', error);
        throw error;
    }
}

// Función principal para generar ejercicios - MEJORADA
async function generateAndRenderExercises() {
    console.log('🎯 Generando ejercicios...');
    
    mainLoader.classList.remove('hidden');
    content.classList.add('hidden');
    errorMessage.classList.add('hidden');
    generateBtn.disabled = true;

    const selectedLevel = document.querySelector('input[name="level"]:checked').value;
    const userName = document.getElementById('name-input').value || 'estudiante';
    
    let levelInstructions = '';
    let difficultyContext = '';
    
    switch (selectedLevel) {
        case '2':
            levelInstructions = "Nivel 2 (Medio): En sumas, puede haber reserva (llevadas). En restas, puede haber reserva (préstamos). Incluye números del 10 al 99.";
            difficultyContext = "ejercicios de dificultad media con algunas operaciones que requieren reagrupación";
            break;
        case '3':
            levelInstructions = "Nivel 3 (Difícil): Mezcla estratégica de problemas con y sin reserva. Para cada operación: 25 ejercicios CON reserva/reagrupación y 25 SIN reserva. Varía la posición donde ocurre la reagrupación.";
            difficultyContext = "ejercicios desafiantes que combinan operaciones simples y complejas para desarrollar flexibilidad mental";
            break;
        default:
            levelInstructions = "Nivel 1 (Fácil): Sumas y restas SIN reserva ni reagrupación. Solo números del 10 al 50 para mantener simplicidad.";
            difficultyContext = "ejercicios básicos y accesibles para construir confianza";
            break;
    }
    
    // Prompt mejorado con más contexto educativo
    const prompt = `Eres un experto en educación matemática para niños de 7-8 años. Genera exactamente 50 problemas de suma y 50 de resta de dos dígitos.

CONTEXTO EDUCATIVO:
- Estudiante: ${userName}
- Objetivo: Desarrollar fluidez en operaciones básicas
- Enfoque: ${difficultyContext}

REGLAS ESPECÍFICAS:
${levelInstructions}

REQUISITOS DE CALIDAD:
- Números apropiados para la edad (evita 0 en unidades/decenas cuando sea confuso)
- En restas: el minuendo siempre debe ser mayor que el sustraendo
- Distribución equilibrada de dificultad dentro del nivel
- Variedad en los números para evitar patrones obvios

Devuelve ÚNICAMENTE un objeto JSON válido con la estructura especificada.`;

    const schema = {
        type: "OBJECT",
        properties: {
            "additions": { 
                type: "ARRAY", 
                items: { 
                    type: "OBJECT", 
                    properties: { 
                        "num1": { type: "INTEGER", minimum: 10, maximum: 99 }, 
                        "num2": { type: "INTEGER", minimum: 10, maximum: 99 } 
                    },
                    required: ["num1", "num2"]
                },
                minItems: 50,
                maxItems: 50
            },
            "subtractions": { 
                type: "ARRAY", 
                items: { 
                    type: "OBJECT", 
                    properties: { 
                        "num1": { type: "INTEGER", minimum: 10, maximum: 99 }, 
                        "num2": { type: "INTEGER", minimum: 10, maximum: 99 } 
                    },
                    required: ["num1", "num2"]
                },
                minItems: 50,
                maxItems: 50
            }
        },
        required: ["additions", "subtractions"]
    };
    
    const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { 
            responseMimeType: "application/json", 
            responseSchema: schema,
            temperature: 0.7,
            maxOutputTokens: 4000
        }
    };

    try {
        const result = await callGemini(payload);
        
        // Validación adicional de la respuesta
        if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
            throw new Error('🤖 Respuesta de IA incompleta');
        }
        
        const data = JSON.parse(result.candidates[0].content.parts[0].text);
        
        // Validar que tenemos el número correcto de ejercicios
        if (!data.additions || !data.subtractions || 
            data.additions.length !== 50 || data.subtractions.length !== 50) {
            throw new Error('📊 Número incorrecto de ejercicios generados');
        }
        
        // Validar que las restas son válidas (num1 > num2)
        data.subtractions = data.subtractions.map(sub => {
            if (sub.num1 <= sub.num2) {
                // Intercambiar números si es necesario
                [sub.num1, sub.num2] = [sub.num2, sub.num1];
            }
            return sub;
        });
        
        renderGrid(data.additions, additionsGrid, '+');
        renderGrid(data.subtractions, subtractionsGrid, '-');
        content.classList.remove('hidden');
        
        // Guardar ejercicios en localStorage para modo offline
        localStorage.setItem('lastExercises', JSON.stringify(data));
        localStorage.setItem('exerciseLevel', selectedLevel);
        localStorage.setItem('exerciseTimestamp', new Date().toISOString());
        
        // Guardar progreso en Supabase si el usuario está autenticado
        const exerciseData = {
            additions: data.additions,
            subtractions: data.subtractions,
            level: parseInt(selectedLevel),
            additions_count: data.additions.length,
            subtractions_count: data.subtractions.length,
            student_name: userName,
            date: new Date().toISOString()
        };
        await saveExerciseProgress(exerciseData);
        
        // Mostrar mensaje de éxito
        mostrarMensajeExito(`¡Ejercicios listos para ${userName}! 🎯`);
        
    } catch (error) {
        console.error("❌ Error generando ejercicios:", error);
        
        // Intentar cargar ejercicios guardados
        const savedExercises = localStorage.getItem('lastExercises');
        if (savedExercises) {
            try {
                const data = JSON.parse(savedExercises);
                renderGrid(data.additions, additionsGrid, '+');
                renderGrid(data.subtractions, subtractionsGrid, '-');
                content.classList.remove('hidden');
                
                mostrarMensajeError('📱 Sin conexión - Mostrando ejercicios guardados anteriormente.');
            } catch (parseError) {
                mostrarErrorEjercicios();
            }
        } else {
            mostrarErrorEjercicios();
        }
    } finally {
        mainLoader.classList.add('hidden');
        generateBtn.disabled = false;
    }
}

// Funciones de mensajes
function mostrarMensajeExito(mensaje) {
    const toast = document.createElement('div');
    toast.className = 'success-toast show';
    toast.innerHTML = `<div class="flex items-center"><span class="mr-2">✅</span><span>${mensaje}</span></div>`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function mostrarMensajeError(mensaje) {
    errorMessage.textContent = mensaje;
    errorMessage.className = 'text-center text-amber-600 font-bold mt-8 p-4 bg-amber-50 rounded-lg';
    errorMessage.classList.remove('hidden');
}

function mostrarErrorEjercicios() {
    errorMessage.textContent = '❌ No se pudieron crear los ejercicios y no hay ejercicios guardados. Verifica tu conexión e intenta de nuevo.';
    errorMessage.className = 'text-center text-red-600 font-bold mt-8 p-4 bg-red-50 rounded-lg border border-red-200';
    errorMessage.classList.remove('hidden');
}

function renderGrid(problems, gridElement, operator) {
    gridElement.innerHTML = '';
    problems.forEach(problem => {
        const item = document.createElement('div');
        item.className = 'exercise-item';
        
        const storyButton = document.createElement('button');
        storyButton.className = 'story-button';
        storyButton.innerHTML = '✨';
        storyButton.title = 'Crear un cuento';
        storyButton.onclick = () => generateAndShowWordProblemInModal(problem.num1, problem.num2, operator);
        
        item.innerHTML = `
            <div>${problem.num1}</div>
            <div><span class="operator">${operator}</span>${problem.num2}</div>
            <div class="line"></div>
        `;
        item.prepend(storyButton);
        gridElement.appendChild(item);
    });
}

async function generateAndShowWordProblemInModal(num1, num2, operator) {
    storyModal.classList.add('visible');
    storyTextEl.classList.add('hidden');
    storyLoader.classList.remove('hidden');
    modalFeedbackDiv.classList.add('hidden');
    storyAnswerInput.value = '';
    storyTitle.textContent = `Creando cuento para ${num1} ${operator} ${num2}`;

    const problemText = await getWordProblemText(num1, num2, operator);
    storyTextEl.innerHTML = problemText;
    
    storyCheckBtn.onclick = () => checkAnswer(num1, num2, operator, storyAnswerInput, modalFeedbackDiv, modalFeedbackLoader);

    storyLoader.classList.add('hidden');
    storyTextEl.classList.remove('hidden');
}

async function getWordProblemText(num1, num2, operator) {
    const userName = document.getElementById('name-input').value || 'estudiante';
    const operationWord = operator === '+' ? 'suma' : 'resta';
    
    // Prompt mejorado para cuentos más educativos y contextualizados
    const prompt = `Eres un experto en educación matemática infantil. Crea un problema de cuento corto y atractivo en español para ${userName}, un niño de 7-8 años.

OPERACIÓN: ${num1} ${operator} ${num2}

REQUERIMIENTOS DEL CUENTO:
- Contexto familiar y divertido (animales, juguetes, frutas, deportes)
- Personajes con nombres latinos comunes
- Situación realista y apropiada para la edad
- Lenguaje simple y claro
- Termina con una pregunta directa
- Máximo 3 oraciones

EJEMPLOS DE CONTEXTOS APROPIADOS:
- Colección de cartas, stickers o juguetes
- Animales en una granja o zoológico
- Frutas en una canasta o mercado
- Niños jugando en el parque
- Deportes como fútbol (goles, jugadores)

Crea un cuento original que motive a ${userName} a resolver esta ${operationWord}. Responde SOLO con el texto del cuento.`;

    const payload = { 
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 200
        }
    };
    
    try {
        const result = await callGemini(payload);
        if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
            throw new Error('Respuesta de IA incompleta para cuento');
        }
        
        const rawText = result.candidates[0].content.parts[0].text;
        return convertMarkdownToHtml(rawText);
    } catch (error) {
        console.error("Error generando cuento con IA:", error);
        return getRandomStoryTemplate(num1, num2, operator);
    }
}

// Plantillas de cuento offline mejoradas
function getRandomStoryTemplate(num1, num2, operator) {
    const templates = {
        addition: [
            `🎈 En la fiesta de cumpleaños hay ${num1} globos azules. Llegan ${num2} globos rojos más. ¿Cuántos globos hay en total para decorar?`,
            `🦆 En el lago nadan ${num1} patitos. Llegan ${num2} patitos más con su mamá. ¿Cuántos patitos nadan ahora en el lago?`,
            `🍎 María tiene ${num1} manzanas en su mochila. Su abuela le da ${num2} manzanas más. ¿Cuántas manzanas tiene María en total?`,
            `⚽ En el primer tiempo del partido, el equipo de Carlos metió ${num1} goles. En el segundo tiempo metieron ${num2} goles más. ¿Cuántos goles metieron en total?`,
            `🎨 Ana tiene ${num1} crayones en su estuche. Su hermano le presta ${num2} crayones más. ¿Cuántos crayones puede usar Ana para dibujar?`
        ],
        subtraction: [
            `🍪 Pablo tenía ${num1} galletas en su lonchera. En el recreo se comió ${num2} galletas. ¿Cuántas galletas le quedan?`,
            `🐱 En el refugio de animales había ${num1} gatitos. Hoy adoptaron ${num2} gatitos. ¿Cuántos gatitos quedan en el refugio?`,
            `🎪 En el circo había ${num1} payasos. Al final del show se fueron ${num2} payasos. ¿Cuántos payasos se quedaron?`,
            `🚗 En el estacionamiento había ${num1} carros. Salieron ${num2} carros. ¿Cuántos carros quedan estacionados?`,
            `📚 En la biblioteca había ${num1} libros de cuentos. Los niños pidieron prestados ${num2} libros. ¿Cuántos libros de cuentos quedan?`
        ]
    };
    
    const operationTemplates = operator === '+' ? templates.addition : templates.subtraction;
    const randomTemplate = operationTemplates[Math.floor(Math.random() * operationTemplates.length)];
    
    return randomTemplate;
}

async function checkAnswer(num1, num2, operator, answerInput, feedbackDiv, feedbackLoader) {
    const userAnswer = answerInput.value;
    if (!userAnswer) {
        feedbackDiv.innerHTML = '📝 Por favor, escribe una respuesta.';
        feedbackDiv.className = 'mt-4 p-3 rounded-lg feedback-incorrect';
        feedbackDiv.classList.remove('hidden');
        return;
    }

    feedbackLoader.classList.remove('hidden');
    feedbackDiv.classList.add('hidden');

    const correctAnswer = (operator === '+') ? (num1 + num2) : (num1 - num2);
    const userName = document.getElementById('name-input').value || "campeón/a";
    
    const prompt = `Eres un profesor amigable para un niño llamado ${userName}. El problema era ${num1} ${operator} ${num2}. La respuesta correcta es ${correctAnswer}. La respuesta de ${userName} fue ${userAnswer}. Evalúa su respuesta. Si es correcta, felicítalo (ej: '¡Excelente, ${userName}! ¡Respuesta correcta!'). Si es incorrecta, anímale con una pista sin darle la respuesta (ej: '¡Casi lo tienes, ${userName}! Revisa la suma de las unidades.'). Responde solo con el feedback para el niño.`;
    const payload = { 
        contents: [{ role: "user", parts: [{ text: prompt }] }] 
    };

    try {
        const result = await callGemini(payload);
        const rawFeedback = result.candidates[0].content.parts[0].text;
        const htmlFeedback = convertMarkdownToHtml(rawFeedback);
        feedbackDiv.innerHTML = htmlFeedback;
        feedbackDiv.className = `mt-4 p-3 rounded-lg ${userAnswer == correctAnswer ? 'feedback-correct' : 'feedback-incorrect'}`;
        
        if (userAnswer == correctAnswer) {
            createConfetti();
        }
    } catch (error) {
        console.error("Error:", error);
        // Feedback offline
        if (userAnswer == correctAnswer) {
            feedbackDiv.innerHTML = `¡Excelente, <strong>${userName}</strong>! ¡Respuesta correcta! 🎉`;
            feedbackDiv.className = 'mt-4 p-3 rounded-lg feedback-correct';
            createConfetti();
        } else {
            feedbackDiv.innerHTML = `¡Casi lo tienes, <strong>${userName}</strong>! La respuesta correcta es <strong>${correctAnswer}</strong>. ¡Sigue intentando! 💪`;
            feedbackDiv.className = 'mt-4 p-3 rounded-lg feedback-incorrect';
        }
    } finally {
        feedbackLoader.classList.add('hidden');
        feedbackDiv.classList.remove('hidden');
    }
}

async function handleCustomProblemSubmit() {
    const num1 = parseInt(document.getElementById('num1-input').value);
    const num2 = parseInt(document.getElementById('num2-input').value);
    const operator = document.getElementById('operator-select').value;
    
    if (isNaN(num1) || isNaN(num2)) {
        customStoryText.innerHTML = "📝 Por favor, ingresa ambos números.";
        customStoryOutput.classList.remove('hidden');
        return;
    }

    customStoryLoader.classList.remove('hidden');
    customStoryOutput.classList.add('hidden');
    createStoryBtn.disabled = true;

    const problemText = await getWordProblemText(num1, num2, operator);
    customStoryText.innerHTML = problemText;
    customFeedbackDiv.classList.add('hidden');
    customStoryAnswerInput.value = '';
    
    customCheckBtn.onclick = () => checkAnswer(num1, num2, operator, customStoryAnswerInput, customFeedbackDiv, customFeedbackLoader);

    customStoryLoader.classList.add('hidden');
    customStoryOutput.classList.remove('hidden');
    createStoryBtn.disabled = false;
}

// Función para establecer la fecha - CORREGIDA
function setDate() {
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        const today = new Date();
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        };
        
        try {
            // Intentar formato chileno primero
            dateElement.textContent = today.toLocaleDateString('es-CL', options);
        } catch (error) {
            // Fallback a formato español general
            console.warn('⚠️ Formato es-CL no disponible, usando es-ES');
            dateElement.textContent = today.toLocaleDateString('es-ES', options);
        }
        
        console.log('📅 Fecha establecida:', dateElement.textContent);
    } else {
        console.error('❌ Elemento current-date no encontrado');
    }
}

function preventNonNumericInput(event) {
    if ([46, 8, 9, 27, 13, 37, 39].indexOf(event.keyCode) !== -1 ||
        (event.keyCode === 65 && (event.ctrlKey === true || event.metaKey === true)) ||
        (event.keyCode >= 35 && event.keyCode <= 40)) {
        return;
    }
    if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && (event.keyCode < 96 || event.keyCode > 105)) {
        event.preventDefault();
    }
}

async function printToPDF() {
    const printButton = document.getElementById('print-pdf-btn');
    const originalButtonText = printButton.innerHTML;
    printButton.disabled = true;
    printButton.innerHTML = `<div class="loader" style="width:20px; height:20px; border-width: 2px; margin: auto;"></div>`;

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;

    const addCanvasToPdf = async (element) => {
        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const canvasAspectRatio = canvas.width / canvas.height;
        const imgWidth = pdfWidth - (margin * 2);
        const imgHeight = imgWidth / canvasAspectRatio;
        pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
    };

    try {
        // Crear el contenido de las páginas para el PDF
        const headerElement = document.querySelector('header').cloneNode(true);
        const sumsElement = document.getElementById('additions-section').cloneNode(true);
        const subtractionsElement = document.getElementById('subtractions-section').cloneNode(true);

        // Página 1: Header + Sumas
        const page1 = document.createElement('div');
        page1.className = 'pdf-page';
        page1.appendChild(headerElement);
        page1.appendChild(sumsElement);
        document.body.appendChild(page1);
        await addCanvasToPdf(page1);
        document.body.removeChild(page1);

        // Página 2: Header + Restas
        pdf.addPage();
        const page2 = document.createElement('div');
        page2.className = 'pdf-page';
        page2.appendChild(headerElement.cloneNode(true));
        page2.appendChild(subtractionsElement);
        document.body.appendChild(page2);
        await addCanvasToPdf(page2);
        document.body.removeChild(page2);
        
        // Página 3: Cuento personalizado (si existe)
        if (!customStoryOutput.classList.contains('hidden') && customStoryText.textContent) {
            pdf.addPage();
            const page3 = document.createElement('div');
            page3.className = 'pdf-page';

            const storyPrintHeader = document.createElement('h2');
            storyPrintHeader.className = 'text-3xl font-bold text-amber-500 pb-2 mb-6 text-center';
            storyPrintHeader.textContent = 'Tu Cuento Matemático';

            const storyPrintText = document.createElement('p');
            storyPrintText.className = 'text-lg text-gray-800';
            storyPrintText.style.whiteSpace = 'pre-wrap';
            storyPrintText.textContent = customStoryText.textContent + '\n\nRespuesta: _________________________';
            
            page3.appendChild(headerElement.cloneNode(true));
            page3.appendChild(storyPrintHeader);
            page3.appendChild(storyPrintText);
            document.body.appendChild(page3);
            await addCanvasToPdf(page3);
            document.body.removeChild(page3);
        }
        
        pdf.save('matematica-ejercicios.pdf');
        mostrarMensajeExito('📄 PDF generado exitosamente');
        
    } catch (error) {
        console.error('Error generando PDF:', error);
        mostrarMensajeError('❌ Error al generar el PDF. Intenta de nuevo.');
    } finally {
        printButton.disabled = false;
        printButton.innerHTML = originalButtonText;
    }
}

// Función para convertir markdown simple a HTML
function convertMarkdownToHtml(text) {
    if (!text) return '';
    
    return text
        // Convertir **texto** a <strong>texto</strong>
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Convertir *texto* a <em>texto</em>
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Convertir saltos de línea a <br>
        .replace(/\n/g, '<br>')
        // Limpiar espacios múltiples
        .replace(/\s+/g, ' ')
        .trim();
}

// Función para crear efecto confetti cuando el niño responde correctamente
function createConfetti() {
    const colors = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6'];
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}vw;
            top: -10px;
            z-index: 1000;
            animation: fall ${2 + Math.random() * 3}s linear forwards;
        `;
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
}

// Añadir CSS para animación de confetti
if (!document.getElementById('confetti-style')) {
    const style = document.createElement('style');
    style.id = 'confetti-style';
    style.textContent = `
        @keyframes fall {
            to {
                transform: translateY(100vh) rotate(360deg);
            }
        }
    `;
    document.head.appendChild(style);
}

// Función de inicialización principal - MEJORADA
function initializeApp() {
    console.log('🚀 Inicializando Matemágica...');
    
    // Establecer fecha
    setDate();
    
    // Cargar ejercicios guardados si existen
    const savedExercises = localStorage.getItem('lastExercises');
    if (savedExercises) {
        try {
            const data = JSON.parse(savedExercises);
            if (data.additions && data.subtractions) {
                renderGrid(data.additions, additionsGrid, '+');
                renderGrid(data.subtractions, subtractionsGrid, '-');
                content.classList.remove('hidden');
                mainLoader.classList.add('hidden');
                
                console.log('📦 Ejercicios guardados cargados');
                mostrarMensajeError('📱 Mostrando ejercicios guardados. Genera nuevos para actualizar.');
            } else {
                throw new Error('Datos inválidos');
            }
        } catch (error) {
            console.log('🎯 Generando ejercicios nuevos...');
            generateAndRenderExercises();
        }
    } else {
        console.log('🎯 Generando ejercicios iniciales...');
        generateAndRenderExercises();
    }

    // Configurar inputs numéricos
    const numericInputs = ['num1-input', 'num2-input', 'custom-story-answer', 'story-answer-input'];
    numericInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('keydown', preventNonNumericInput);
        }
    });
    
    console.log('✅ Matemágica inicializada correctamente');
}

// Event Listeners principales
if (generateBtn) {
    generateBtn.addEventListener('click', generateAndRenderExercises);
}

if (printPdfBtn) {
    printPdfBtn.addEventListener('click', printToPDF);
}

document.querySelectorAll('input[name="level"]').forEach(radio => {
    radio.addEventListener('change', generateAndRenderExercises);
});

if (createStoryBtn) {
    createStoryBtn.addEventListener('click', handleCustomProblemSubmit);
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => storyModal.classList.remove('visible'));
}

if (storyModal) {
    storyModal.addEventListener('click', (e) => {
        if (e.target === storyModal) storyModal.classList.remove('visible');
    });
}

// Detectar cuando la app se está ejecutando como PWA
window.addEventListener('load', () => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('📱 La aplicación se está ejecutando como PWA instalada');
        hideInstallPrompt();
    }
});