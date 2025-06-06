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

// Configuración API - Ahora con tu API key configurada
const API_KEY = "AIzaSyCc1bdkzVLHXxxKOBndV3poK2KQikLJ6DI";
const API_URL_GENERATE = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

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

// Funciones API
async function callGemini(payload) {
    if (!API_KEY) {
        throw new Error('Por favor, configura tu API key de Google Gemini en el archivo app.js');
    }
    
    const response = await fetch(API_URL_GENERATE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
        throw new Error(`Error de red: ${response.statusText}`);
    }
    
    return response.json();
}

// Función principal para generar ejercicios
async function generateAndRenderExercises() {
    mainLoader.classList.remove('hidden');
    content.classList.add('hidden');
    errorMessage.classList.add('hidden');
    generateBtn.disabled = true;

    const selectedLevel = document.querySelector('input[name="level"]:checked').value;
    let levelInstructions = '';
    
    switch (selectedLevel) {
        case '2':
            levelInstructions = "Nivel 2 (Medio): En sumas, puede haber reserva. En restas, puede haber reserva.";
            break;
        case '3':
            levelInstructions = "Nivel 3 (Difícil): Mezcla de problemas con y sin reserva. Genera 25 con reserva y 25 sin para cada operación y mézclalos.";
            break;
        default:
            levelInstructions = "Nivel 1 (Fácil): Sumas y restas sin reserva.";
            break;
    }
    
    const prompt = `Genera 50 problemas de suma y 50 de resta de dos dígitos para un niño de 7 años. Reglas: ${levelInstructions}. Devuelve el resultado como un objeto JSON.`;
    const schema = {
        type: "OBJECT",
        properties: {
            "additions": { 
                type: "ARRAY", 
                items: { 
                    type: "OBJECT", 
                    properties: { 
                        "num1": { type: "INTEGER" }, 
                        "num2": { type: "INTEGER" } 
                    } 
                } 
            },
            "subtractions": { 
                type: "ARRAY", 
                items: { 
                    type: "OBJECT", 
                    properties: { 
                        "num1": { type: "INTEGER" }, 
                        "num2": { type: "INTEGER" } 
                    } 
                } 
            }
        }
    };
    
    const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { 
            responseMimeType: "application/json", 
            responseSchema: schema 
        }
    };

    try {
        const result = await callGemini(payload);
        const data = JSON.parse(result.candidates[0].content.parts[0].text);
        renderGrid(data.additions, additionsGrid, '+');
        renderGrid(data.subtractions, subtractionsGrid, '-');
        content.classList.remove('hidden');
        
        // Guardar ejercicios en localStorage para modo offline
        localStorage.setItem('lastExercises', JSON.stringify(data));
        localStorage.setItem('exerciseLevel', selectedLevel);
        
        // Guardar progreso en Supabase si el usuario está autenticado
        const exerciseData = {
            additions: data.additions,
            subtractions: data.subtractions,
            level: selectedLevel,
            date: new Date().toISOString()
        };
        await saveExerciseProgress(exerciseData);
        
    } catch (error) {
        console.error("Error:", error);
        
        // Intentar cargar ejercicios guardados
        const savedExercises = localStorage.getItem('lastExercises');
        if (savedExercises) {
            const data = JSON.parse(savedExercises);
            renderGrid(data.additions, additionsGrid, '+');
            renderGrid(data.subtractions, subtractionsGrid, '-');
            content.classList.remove('hidden');
            
            errorMessage.textContent = 'Sin conexión - Mostrando ejercicios guardados anteriormente.';
            errorMessage.className = 'text-center text-amber-600 font-bold mt-8';
            errorMessage.classList.remove('hidden');
        } else {
            errorMessage.textContent = '¡Ups! No se pudieron crear los ejercicios y no hay ejercicios guardados. Verifica tu conexión e intenta de nuevo.';
            errorMessage.className = 'text-center text-red-600 font-bold mt-8';
            errorMessage.classList.remove('hidden');
        }
    } finally {
        mainLoader.classList.add('hidden');
        generateBtn.disabled = false;
    }
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
    storyTextEl.innerHTML = problemText; // Cambiar a innerHTML para mostrar HTML
    
    storyCheckBtn.onclick = () => checkAnswer(num1, num2, operator, storyAnswerInput, modalFeedbackDiv, modalFeedbackLoader);

    storyLoader.classList.add('hidden');
    storyTextEl.classList.remove('hidden');
}

async function getWordProblemText(num1, num2, operator) {
    const prompt = `Crea un problema de cuento corto, simple y divertido en español para un niño de 7 años usando la operación: ${num1} ${operator} ${num2}. Termina con una pregunta. Responde solo con el texto del problema.`;
    const payload = { 
        contents: [{ role: "user", parts: [{ text: prompt }] }] 
    };
    
    try {
        const result = await callGemini(payload);
        const rawText = result.candidates[0].content.parts[0].text;
        return convertMarkdownToHtml(rawText);
    } catch (error) {
        console.error("Error:", error);
        return `${getRandomStoryTemplate(num1, num2, operator)}`;
    }
}

// Plantillas de cuento offline
function getRandomStoryTemplate(num1, num2, operator) {
    const storyTemplates = [
        {
            addition: `En el parque hay ${num1} niños jugando. Luego llegan ${num2} niños más. ¿Cuántos niños hay en total en el parque?`,
            subtraction: `María tenía ${num1} caramelos. Se comió ${num2} caramelos. ¿Cuántos caramelos le quedan a María?`
        },
        {
            addition: `En la granja hay ${num1} pollitos. Nacen ${num2} pollitos más. ¿Cuántos pollitos hay ahora en la granja?`,
            subtraction: `Carlos tenía ${num1} globos. Se le escaparon ${num2} globos. ¿Cuántos globos le quedan a Carlos?`
        },
        {
            addition: `Ana tiene ${num1} flores. Su mamá le da ${num2} flores más. ¿Cuántas flores tiene Ana en total?`,
            subtraction: `En el árbol había ${num1} manzanas. Los niños recogieron ${num2} manzanas. ¿Cuántas manzanas quedan en el árbol?`
        }
    ];
    
    const randomTemplate = storyTemplates[Math.floor(Math.random() * storyTemplates.length)];
    return operator === '+' ? randomTemplate.addition : randomTemplate.subtraction;
}

async function checkAnswer(num1, num2, operator, answerInput, feedbackDiv, feedbackLoader) {
    const userAnswer = answerInput.value;
    if (!userAnswer) {
        feedbackDiv.innerHTML = 'Por favor, escribe una respuesta.';
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
    } catch (error) {
        console.error("Error:", error);
        // Feedback offline
        if (userAnswer == correctAnswer) {
            feedbackDiv.innerHTML = `¡Excelente, <strong>${userName}</strong>! ¡Respuesta correcta! 🎉`;
            feedbackDiv.className = 'mt-4 p-3 rounded-lg feedback-correct';
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
        customStoryText.innerHTML = "Por favor, ingresa ambos números.";
        customStoryOutput.classList.remove('hidden');
        return;
    }

    customStoryLoader.classList.remove('hidden');
    customStoryOutput.classList.add('hidden');
    createStoryBtn.disabled = true;

    const problemText = await getWordProblemText(num1, num2, operator);
    customStoryText.innerHTML = problemText; // Cambiar a innerHTML para mostrar HTML
    customFeedbackDiv.classList.add('hidden');
    customStoryAnswerInput.value = '';
    
    customCheckBtn.onclick = () => checkAnswer(num1, num2, operator, customStoryAnswerInput, customFeedbackDiv, customFeedbackLoader);

    customStoryLoader.classList.add('hidden');
    customStoryOutput.classList.remove('hidden');
    createStoryBtn.disabled = false;
}

function setDate() {
    const dateElement = document.getElementById('current-date');
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = today.toLocaleDateString('es-CL', options);
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
        
    } catch (error) {
        console.error('Error generando PDF:', error);
        errorMessage.textContent = 'Error al generar el PDF. Intenta de nuevo.';
        errorMessage.classList.remove('hidden');
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
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 3 + 's';
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 3000);
    }
}

// Función mejorada para mostrar progreso del niño
function mostrarProgreso() {
    const stats = JSON.parse(localStorage.getItem('playerStats') || '{}');
    const totalEjercicios = stats.totalEjercicios || 0;
    const ejerciciosCorrectos = stats.ejerciciosCorrectos || 0;
    const porcentaje = totalEjercicios > 0 ? Math.round((ejerciciosCorrectos / totalEjercicios) * 100) : 0;
    
    // Crear medallas basadas en el progreso
    let medalla = '';
    if (porcentaje >= 90) medalla = '🏆';
    else if (porcentaje >= 70) medalla = '🥇';
    else if (porcentaje >= 50) medalla = '🥈';
    else if (porcentaje >= 30) medalla = '🥉';
    else medalla = '⭐';
    
    alert(`¡Genial! ${medalla}\n\nHas resuelto ${ejerciciosCorrectos} de ${totalEjercicios} ejercicios correctamente.\nTu puntuación: ${porcentaje}%\n\n¡Sigue practicando para ser un matemago!`);
}

// Función mejorada para verificar respuestas con feedback visual
function verificarRespuesta(ejercicioIndex, respuestaUsuario) {
    const ejercicios = JSON.parse(localStorage.getItem('ejerciciosActuales') || '[]');
    const ejercicio = ejercicios[ejercicioIndex];
    const input = document.getElementById(`respuesta-${ejercicioIndex}`);
    
    if (parseInt(respuestaUsuario) === ejercicio.resultado) {
        // Respuesta correcta
        input.classList.add('correct-animation');
        createConfetti();
        
        // Guardar estadísticas
        const stats = JSON.parse(localStorage.getItem('playerStats') || '{}');
        stats.ejerciciosCorrectos = (stats.ejerciciosCorrectos || 0) + 1;
        stats.totalEjercicios = (stats.totalEjercicios || 0) + 1;
        localStorage.setItem('playerStats', JSON.stringify(stats));
        
        // Mensaje de felicitación aleatorio
        const felicitaciones = [
            '¡Excelente! 🌟',
            '¡Muy bien! 🎉',
            '¡Perfecto! ✨',
            '¡Eres un matemago! 🧙‍♂️',
            '¡Fantástico! 🎊'
        ];
        const mensaje = felicitaciones[Math.floor(Math.random() * felicitaciones.length)];
        
        setTimeout(() => {
            alert(mensaje);
            input.classList.remove('correct-animation');
        }, 600);
        
    } else {
        // Respuesta incorrecta
        input.classList.add('incorrect-animation');
        
        const stats = JSON.parse(localStorage.getItem('playerStats') || '{}');
        stats.totalEjercicios = (stats.totalEjercicios || 0) + 1;
        localStorage.setItem('playerStats', JSON.stringify(stats));
        
        setTimeout(() => {
            alert('¡Inténtalo de nuevo! Puedes hacerlo 💪');
            input.classList.remove('incorrect-animation');
            input.value = '';
            input.focus();
        }, 500);
    }
}

// Función para mostrar consejos y ayuda
function mostrarConsejo() {
    const consejos = [
        '💡 Para sumar, puedes contar con los dedos si necesitas ayuda.',
        '💡 Para restar, piensa en "quitar" objetos de un grupo.',
        '💡 Si el resultado parece muy grande o pequeño, revisa tu operación.',
        '💡 Practica todos los días para ser mejor en matemáticas.',
        '💡 ¡No te preocupes por los errores, son parte del aprendizaje!'
    ];
    
    const consejo = consejos[Math.floor(Math.random() * consejos.length)];
    alert(consejo);
}

// Función para modo de juego cronometrado
function iniciarModoTiempo() {
    const tiempo = prompt('¿Cuántos segundos quieres para resolver los ejercicios?\n(Recomendado: 60 segundos)');
    if (!tiempo || isNaN(tiempo)) return;
    
    const segundos = parseInt(tiempo);
    mostrarCronometro(segundos);
    
    setTimeout(() => {
        alert('¡Se acabó el tiempo! 🕐\nVeamos qué tal lo hiciste.');
        mostrarProgreso();
    }, segundos * 1000);
}

function mostrarCronometro(segundos) {
    const cronometro = document.createElement('div');
    cronometro.id = 'cronometro';
    cronometro.className = 'fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg font-bold text-xl z-50';
    cronometro.textContent = `⏰ ${segundos}s`;
    document.body.appendChild(cronometro);
    
    const intervalo = setInterval(() => {
        segundos--;
        cronometro.textContent = `⏰ ${segundos}s`;
        
        if (segundos <= 10) {
            cronometro.classList.add('animate-pulse');
            cronometro.classList.remove('bg-red-500');
            cronometro.classList.add('bg-red-700');
        }
        
        if (segundos <= 0) {
            clearInterval(intervalo);
            cronometro.remove();
        }
    }, 1000);
}

// Función de inicialización principal
function initializeApp() {
    setDate();
    
    // Cargar ejercicios guardados si existen, sino generar nuevos
    const savedExercises = localStorage.getItem('lastExercises');
    if (savedExercises) {
        try {
            const data = JSON.parse(savedExercises);
            renderGrid(data.additions, additionsGrid, '+');
            renderGrid(data.subtractions, subtractionsGrid, '-');
            content.classList.remove('hidden');
            mainLoader.classList.add('hidden');
        } catch (error) {
            generateAndRenderExercises();
        }
    } else {
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
}

// Event Listeners principales
generateBtn.addEventListener('click', generateAndRenderExercises);
printPdfBtn.addEventListener('click', printToPDF);

document.querySelectorAll('input[name="level"]').forEach(radio => {
    radio.addEventListener('change', generateAndRenderExercises);
});

createStoryBtn.addEventListener('click', handleCustomProblemSubmit);
closeModalBtn.addEventListener('click', () => storyModal.classList.remove('visible'));
storyModal.addEventListener('click', (e) => {
    if (e.target === storyModal) storyModal.classList.remove('visible');
});

// Detectar cuando la app se está ejecutando como PWA
window.addEventListener('load', () => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('La aplicación se está ejecutando como PWA instalada');
        // Ocultar prompt de instalación si ya está instalada
        hideInstallPrompt();
    }
});