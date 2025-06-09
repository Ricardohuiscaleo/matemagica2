// js/dashboard.js - Lógica completa y funcional
console.log("🚀 Lógica del Dashboard v16.0 iniciada.");

const SUPABASE_URL = "https://uznvakpuuxnpdhoejrog.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bnZha3B1dXhucGRob2Vqcm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODg0MTAsImV4cCI6MjA2NDY2NDQxMH0.OxbLYkjlgpWFnqd28gaZSwar_NQ6_qUS3U76bqbcXVg";

class DashboardApp {
    constructor() {
        // Inicializar Supabase de forma segura
        this.supabase = null;
        this.userProfile = null;
        this.students = [];
        this.selectedStudent = null;
        this.elements = {};
        this.isGeneratorInitialized = false;
        
        this.API_KEY = "AIzaSyCc1bdkzVLHXxxKOBndV3poK2KQikLJ6DI";
        this.API_URL_GENERATE = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.API_KEY}`;
        
        document.addEventListener('DOMContentLoaded', () => this.init());
    }

    init() {
        try {
            // Verificar que Supabase esté disponible antes de inicializar
            if (!window.supabase) {
                console.error("❌ Supabase no está disponible");
                setTimeout(() => this.init(), 100); // Reintentar en 100ms
                return;
            }
            
            // Inicializar cliente Supabase de forma segura
            this.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log("✅ Cliente Supabase inicializado correctamente");
            
            // Continuar con la inicialización normal
            this.userProfile = JSON.parse(localStorage.getItem('matemagica-user-profile'));
            if (!this.userProfile) {
                console.log("❌ No hay perfil de usuario, redirigiendo al login");
                window.location.assign('index.html');
                return;
            }
            
            console.log("✅ Dashboard inicializado correctamente para:", this.userProfile.full_name);
            this.setupDashboardDOMElements();
            this.setupDashboardEventListeners();
            this.renderHeader();
            this.loadStudents();
            
        } catch (error) {
            console.error("❌ Error en la inicialización del dashboard:", error);
            // Reintentar la inicialización después de un breve delay
            setTimeout(() => this.init(), 500);
        }
    }

    // --- SETUP ---
    setupDashboardDOMElements() {
        this.elements = {
            userName: document.getElementById('user-name'),
            logoutBtn: document.getElementById('logout-btn'),
            studentListTitle: document.getElementById('student-list-title'),
            studentList: document.getElementById('student-list'),
            addStudentBtn: document.getElementById('add-student-btn'),
            exerciseGeneratorSection: document.getElementById('exercise-generator-section'),
            confettiCanvas: document.getElementById('confetti-canvas')
        };
    }

    setupDashboardEventListeners() {
        this.elements.logoutBtn?.addEventListener('click', () => this.logout());
        this.elements.addStudentBtn?.addEventListener('click', () => this.addNewStudent());
    }
    
    setupGenerator() {
        if (this.isGeneratorInitialized) return;
        Object.assign(this.elements, {
            studentNameHeader: document.getElementById('student-name-header'),
            currentDate: document.getElementById('current-date'),
            mainLoader: document.getElementById('loader'),
            content: document.getElementById('content'),
            errorMessage: document.getElementById('error-message'),
            additionsGrid: document.getElementById('additions-grid'),
            subtractionsGrid: document.getElementById('subtractions-grid'),
            printPdfBtn: document.getElementById('print-pdf-btn'),
            levelRadios: document.querySelectorAll('input[name="level"]'),
            generateBtn: document.getElementById('generate-btn'),
            createStoryBtn: document.getElementById('create-story-btn'),
            customStoryLoader: document.getElementById('custom-story-loader'),
            customStoryOutput: document.getElementById('custom-story-output'),
            customStoryText: document.getElementById('custom-story-text'),
            customStoryAnswerInput: document.getElementById('custom-story-answer'),
            customCheckBtn: document.getElementById('custom-story-check-btn'),
            customFeedbackLoader: document.getElementById('custom-feedback-loader'),
            customFeedbackDiv: document.getElementById('custom-feedback'),
            num1Input: document.getElementById('num1-input'),
            num2Input: document.getElementById('num2-input'),
            operatorSelect: document.getElementById('operator-select'),
            storyModal: document.getElementById('story-modal'),
            storyTitle: document.getElementById('story-title'),
            storyTextEl: document.getElementById('story-text'),
            storyLoader: document.getElementById('story-loader'),
            closeModalBtn: document.getElementById('close-modal-btn'),
            storyAnswerInput: document.getElementById('story-answer-input'),
            storyCheckBtn: document.getElementById('story-check-btn'),
            modalFeedbackLoader: document.getElementById('modal-feedback-loader'),
            modalFeedbackDiv: document.getElementById('modal-feedback'),
        });
        this.elements.printPdfBtn?.addEventListener('click', () => this.printToPDF());
        this.elements.generateBtn?.addEventListener('click', () => this.generateAndRenderExercises());
        this.elements.levelRadios.forEach(radio => radio.addEventListener('change', () => this.generateAndRenderExercises()));
        this.elements.createStoryBtn?.addEventListener('click', () => this.handleCustomProblemSubmit());
        this.elements.closeModalBtn?.addEventListener('click', () => this.elements.storyModal.classList.remove('visible'));
        this.elements.storyModal?.addEventListener('click', (e) => {
            if (e.target === this.elements.storyModal) this.elements.storyModal.classList.remove('visible');
        });
        this.isGeneratorInitialized = true;
    }

    // --- LÓGICA DEL DASHBOARD ---
    renderHeader() {
        this.elements.userName.textContent = this.userProfile.full_name || 'Usuario';
        this.elements.studentListTitle.textContent = this.userProfile.user_role === 'teacher' ? 'Mis Alumnos' : 'Mis Hijos';
    }

    async loadStudents() {
        const relationColumn = this.userProfile.user_role === 'teacher' ? 'teacher_id' : 'parent_id';
        const { data, error } = await this.supabase.from('math_profiles').select('*').eq(relationColumn, this.userProfile.user_id);
        if (error) console.error("Error cargando estudiantes:", error);
        this.students = data || [];
        this.renderStudentList();
    }

    renderStudentList() {
        this.elements.studentList.innerHTML = '';
        const selfCard = document.createElement('div');
        selfCard.className = 'p-4 border-2 border-blue-500 rounded-lg text-center cursor-pointer hover:bg-blue-100 transition';
        selfCard.innerHTML = `<strong>${this.userProfile.full_name} (Yo)</strong>`;
        selfCard.onclick = () => this.selectStudent(this.userProfile);
        this.elements.studentList.appendChild(selfCard);
        this.students.forEach(student => {
            const studentCard = document.createElement('div');
            studentCard.className = 'p-4 border rounded-lg text-center cursor-pointer hover:bg-blue-100 transition';
            studentCard.textContent = student.full_name;
            studentCard.onclick = () => this.selectStudent(student);
            this.elements.studentList.appendChild(studentCard);
        });
    }

    selectStudent(student) {
        this.selectedStudent = student;
        this.elements.exerciseGeneratorSection.classList.remove('hidden');
        if (!this.isGeneratorInitialized) this.setupGenerator();
        this.renderGeneratorHeader();
        this.generateAndRenderExercises();
    }

    renderGeneratorHeader() {
        this.elements.studentNameHeader.textContent = this.selectedStudent.full_name;
        this.elements.currentDate.textContent = new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    async addNewStudent() {
        const studentName = prompt("Nombre del nuevo perfil:");
        if (!studentName || !studentName.trim()) return;
        const relationColumn = this.userProfile.user_role === 'teacher' ? 'teacher_id' : 'parent_id';
        let newProfile = { full_name: studentName.trim(), user_role: 'student' };
        newProfile[relationColumn] = this.userProfile.user_id;
        const { error } = await this.supabase.from('math_profiles').insert([newProfile]);
        if (error) console.error("Error añadiendo perfil:", error);
        else this.loadStudents();
    }

    logout() {
        localStorage.clear();
        this.supabase.auth.signOut();
        window.location.assign('index.html');
    }

    // --- LÓGICA DEL GENERADOR ---
    triggerConfetti() {
        if (!this.elements.confettiCanvas || !window.confetti) return;
        const myConfetti = confetti.create(this.elements.confettiCanvas, { resize: true, useWorker: true });
        myConfetti({ particleCount: 150, spread: 160, origin: { y: 0.6 } });
    }
    
    generateLocalExercises(level) {
        let count;
        switch(level) {
            case '2': count = 30; break;
            case '3': count = 50; break;
            default: count = 20;
        }
        const problems = { additions: [], subtractions: [] };
        const checkNoCarryAdd = (n1, n2) => (n1 % 10) + (n2 % 10) < 10;
        const checkNoCarrySub = (n1, n2) => (n1 % 10) >= (n2 % 10);
        for (let i = 0; i < count; i++) {
            let n1, n2, s1, s2;
            do {
                n1 = Math.floor(Math.random() * 90) + 10;
                n2 = Math.floor(Math.random() * 90) + 10;
            } while (level === '1' && !checkNoCarryAdd(n1, n2) || level === '2' && checkNoCarryAdd(n1, n2));
            problems.additions.push({ num1: n1, num2: n2 });
            do {
                s1 = Math.floor(Math.random() * 90) + 10;
                s2 = Math.floor(Math.random() * (s1 - 9)) + 1;
            } while (level === '1' && !checkNoCarrySub(s1, s2) || level === '2' && checkNoCarrySub(s1, s2));
            problems.subtractions.push({ num1: s1, num2: s2 });
        }
        return problems;
    }

    async generateAndRenderExercises() {
        if (!this.selectedStudent) return;
        this.elements.mainLoader.style.display = 'block';
        this.elements.content.classList.add('hidden');
        const level = document.querySelector('input[name="level"]:checked').value;
        const data = this.generateLocalExercises(level);
        this.renderGrid(data.additions, this.elements.additionsGrid, '+');
        this.renderGrid(data.subtractions, this.elements.subtractionsGrid, '-');
        this.elements.content.classList.remove('hidden');
        this.elements.mainLoader.style.display = 'none';
    }

    renderGrid(problems, gridElement, operator) {
        const fragment = document.createDocumentFragment();
        problems.forEach(p => {
            const item = document.createElement('div');
            item.className = 'exercise-item';
            const storyButton = document.createElement('button');
            storyButton.className = 'story-button';
            storyButton.innerHTML = '✨';
            storyButton.title = 'Crear un cuento con IA';
            storyButton.onclick = () => this.generateAndShowWordProblemInModal(p.num1, p.num2, operator);
            item.innerHTML = `<div>${p.num1}</div><div><span class="operator">${operator}</span>${p.num2}</div><div class="line"></div>`;
            item.prepend(storyButton);
            fragment.appendChild(item);
        });
        gridElement.innerHTML = '';
        gridElement.appendChild(fragment);
    }
    
    // --- LÓGICA DE LA IA (CUENTOS Y FEEDBACK) ---
    async callGemini(prompt) {
        try {
            // Usar la misma API key que funciona en gemini-ai.js
            const apiKey = 'AIzaSyCc1bdkzVLHXxxKOBndV3poK2KQikLJ6DI';
            const baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
            
            const response = await fetch(`${baseUrl}?key=${apiKey}`, {
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
                const errorText = await response.text();
                throw new Error(`API Error: ${response.status} - ${response.statusText}: ${errorText}`);
            }

            const data = await response.json();
            const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (!content) {
                throw new Error('No content in API response');
            }
            
            return content;
        } catch (error) {
            console.error('Error en callGemini:', error);
            throw error;
        }
    }

    async generateAndShowWordProblemInModal(num1, num2, operator) {
        console.log(`🎭 Generando cuento para: ${num1} ${operator} ${num2}`);
        
        // Mostrar modal y loader
        this.elements.storyModal.classList.add('visible');
        this.elements.storyLoader.style.display = 'block';
        this.elements.storyTextEl.style.display = 'none';
        this.elements.storyAnswerInput.value = '';
        this.elements.modalFeedbackDiv.innerHTML = '';
        
        // Configurar título
        this.elements.storyTitle.textContent = `Cuento Mágico: ${num1} ${operator} ${num2}`;
        
        // Generar cuento con IA
        const storyText = await this.getWordProblemText(num1, num2, operator);
        
        // Mostrar resultado
        this.elements.storyLoader.style.display = 'none';
        this.elements.storyTextEl.style.display = 'block';
        this.elements.storyTextEl.textContent = storyText;
        
        // Configurar botón de verificación
        this.elements.storyCheckBtn.onclick = () => this.checkAnswer(num1, num2, operator, this.elements.storyAnswerInput, this.elements.modalFeedbackDiv);
    }

    async getWordProblemText(num1, num2, operator) {
        const operatorText = operator === '+' ? 'suma' : 'resta';
        const operatorSymbol = operator === '+' ? 'sumando' : 'quitando';
        
        const prompt = `Crea un cuento corto y divertido para niños de 7-8 años que incluya una ${operatorText} de ${num1} ${operator} ${num2}.

Requisitos:
- Máximo 3 oraciones
- Personajes divertidos (animales, juguetes, etc.)
- Situación clara donde se necesite ${operatorSymbol} ${num1} y ${num2}
- Terminar preguntando: "¿Cuántos quedan?" o "¿Cuántos hay en total?"
- Lenguaje simple y amigable para niños

Ejemplo: "🐰 El conejito Pepe tenía ${num1} zanahorias en su jardín. Su amiga la ardilla Lila le ${operator === '+' ? 'regaló' : 'pidió prestadas'} ${num2} zanahorias más. ¿Cuántas zanahorias ${operator === '+' ? 'tiene ahora' : 'le quedan'} a Pepe?"`;

        try {
            console.log('📡 Llamando a Gemini API para generar cuento...');
            // Pasar solo el prompt string, no el objeto payload
            const response = await this.callGemini(prompt);
            console.log('✅ Cuento generado exitosamente');
            return response;
        } catch (error) {
            console.error('❌ Error generando cuento:', error);
            // Fallback local
            const themes = [
                `🐻 El osito ${operator === '+' ? 'encontró' : 'perdió'} ${num2} ${operator === '+' ? 'manzanas más' : 'manzanas'} de las ${num1} que tenía.`,
                `🚗 En el garaje había ${num1} carritos. ${operator === '+' ? 'Llegaron' : 'Se fueron'} ${num2} carritos más.`,
                `🌟 La princesa tenía ${num1} estrellas mágicas y ${operator === '+' ? 'encontró' : 'usó'} ${num2} más.`
            ];
            const randomTheme = themes[Math.floor(Math.random() * themes.length)];
            return `${randomTheme} ¿Cuántas ${operator === '+' ? 'tiene en total' : 'le quedan'}?`;
        }
    }

    async checkAnswer(num1, num2, operator, answerInput, feedbackDiv) {
        const userAnswer = parseInt(answerInput.value);
        if (!userAnswer && userAnswer !== 0) {
            feedbackDiv.innerHTML = '<p class="text-yellow-600">🤔 Por favor, escribe tu respuesta primero.</p>';
            feedbackDiv.classList.remove('hidden'); // Asegurar que sea visible
            return;
        }

        const correctAnswer = (operator === '+') ? (num1 + num2) : (num1 - num2);
        const isCorrect = userAnswer === correctAnswer;
        
        // Limpiar feedback anterior y mostrar el div
        feedbackDiv.innerHTML = '';
        feedbackDiv.classList.remove('hidden');
        
        if (isCorrect) {
            this.triggerConfetti();
            feedbackDiv.innerHTML = '<p class="text-green-600 font-bold">🎉 ¡Excelente! ¡Respuesta correcta!</p>';
        } else {
            feedbackDiv.innerHTML = `<p class="text-red-600">💭 Mmm, revisa tu cálculo. ¡Tú puedes!</p>`;
        }
        
        // Generar feedback personalizado con IA usando el nombre del estudiante
        this.generatePersonalizedFeedback(userAnswer, correctAnswer, isCorrect, feedbackDiv);
    }

    async generatePersonalizedFeedback(userAnswer, correctAnswer, isCorrect, feedbackDiv) {
        try {
            console.log('🤖 Generando feedback personalizado con IA...');
            
            const studentName = this.selectedStudent.full_name.split(' ')[0]; // Obtener primer nombre
            
            const prompt = `Eres un profesor amigable y motivador para un niño de 7-8 años llamado ${studentName}.

SITUACIÓN:
- Respuesta correcta: ${correctAnswer}
- Respuesta del estudiante: ${userAnswer}
- ¿Es correcta? ${isCorrect ? 'SÍ' : 'NO'}

INSTRUCCIONES:
${isCorrect ? 
    `- Felicita calurosamente a ${studentName} usando su nombre
    - Usa emojis positivos y divertidos
    - Menciona específicamente lo bien que lo hizo
    - Anímale a seguir practicando
    - Sé muy entusiasta y cálido` 
    : 
    `- Anima a ${studentName} de forma muy positiva usando su nombre
    - NO reveles la respuesta correcta directamente
    - Da una pista útil y constructiva sin dar la solución
    - Motívale a intentar de nuevo con confianza
    - Usa emojis de apoyo y sé muy alentador
    - Enfócate en el proceso de aprendizaje`
}

Responde en 1-2 oraciones máximo, de forma muy cálida, motivadora y apropiada para un niño de 7-8 años.`;

            // Llamar a la API de Gemini
            const response = await this.callGemini(prompt);
            
            if (response && response.trim()) {
                const feedback = response.trim();
                const colorClass = isCorrect ? 'text-blue-600' : 'text-purple-600';
                
                // Crear elemento para el feedback de IA y agregarlo correctamente
                const feedbackElement = document.createElement('div');
                feedbackElement.className = `${colorClass} mt-3 p-3 bg-gray-50 rounded-lg border-l-4 ${isCorrect ? 'border-blue-500' : 'border-purple-500'}`;
                feedbackElement.innerHTML = `<p class="font-medium">🤖 <strong>Profesora IA:</strong></p><p class="mt-1">${feedback}</p>`;
                
                // Asegurar que el contenedor sea visible y agregar el elemento
                feedbackDiv.classList.remove('hidden');
                feedbackDiv.appendChild(feedbackElement);
                
                console.log('✅ Feedback personalizado generado con IA y mostrado en DOM');
                return;
            }
            
            // Si la IA no funciona, usar fallback personalizado
            this.generateFallbackFeedback(userAnswer, correctAnswer, isCorrect, feedbackDiv);
            
        } catch (error) {
            console.error('❌ Error generando feedback personalizado:', error);
            this.generateFallbackFeedback(userAnswer, correctAnswer, isCorrect, feedbackDiv);
        }
    }

    generateFallbackFeedback(userAnswer, correctAnswer, isCorrect, feedbackDiv) {
        const studentName = this.selectedStudent.full_name.split(' ')[0];
        
        let message;
        let colorClass;
        let borderClass;
        
        if (isCorrect) {
            const positiveMessages = [
                `¡Excelente trabajo, ${studentName}! 🌟 ¡Lo hiciste perfecto!`,
                `¡Fantástico, ${studentName}! 🎉 ¡Eres genial con las matemáticas!`,
                `¡Muy bien, ${studentName}! ✨ ¡Sigue así que lo estás haciendo increíble!`,
                `¡Perfecto, ${studentName}! 🏆 ¡Eres un campeón de las matemáticas!`,
                `¡Súper bien, ${studentName}! 🌈 ¡Me encanta cómo resuelves los problemas!`
            ];
            message = positiveMessages[Math.floor(Math.random() * positiveMessages.length)];
            colorClass = 'text-blue-600';
            borderClass = 'border-blue-500';
        } else {
            const encouragingMessages = [
                `¡Muy buen intento, ${studentName}! 💪 ¿Quieres intentar otra vez? ¡Tú puedes!`,
                `¡Casi lo tienes, ${studentName}! 🌟 Piensa un poquito más y seguro lo logras.`,
                `¡No te preocupes, ${studentName}! 😊 Los errores nos ayudan a aprender. ¡Inténtalo de nuevo!`,
                `¡Sigue intentando, ${studentName}! 🚀 Estás muy cerca de la respuesta correcta.`,
                `¡Ánimo, ${studentName}! 🌈 Revisa los números otra vez, ¡estoy seguro de que lo conseguirás!`
            ];
            message = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
            colorClass = 'text-purple-600';
            borderClass = 'border-purple-500';
        }
        
        // Crear elemento para el feedback fallback y agregarlo correctamente
        const feedbackElement = document.createElement('div');
        feedbackElement.className = `${colorClass} mt-3 p-3 bg-gray-50 rounded-lg border-l-4 ${borderClass}`;
        feedbackElement.innerHTML = `<p class="font-medium">🤖 <strong>Profesora IA:</strong></p><p class="mt-1">${message}</p>`;
        
        // Asegurar que el contenedor sea visible y agregar el elemento
        feedbackDiv.classList.remove('hidden');
        feedbackDiv.appendChild(feedbackElement);
        
        console.log('✅ Feedback fallback generado y mostrado en DOM');
    }

    async handleCustomProblemSubmit() {
        const num1 = parseInt(this.elements.num1Input.value);
        const num2 = parseInt(this.elements.num2Input.value);
        const operator = this.elements.operatorSelect.value;

        if (!num1 || !num2) {
            alert('Por favor, ingresa ambos números');
            return;
        }

        console.log(`🎯 Generando problema personalizado: ${num1} ${operator} ${num2}`);

        // Mostrar loader
        this.elements.customStoryLoader.style.display = 'block';
        this.elements.customStoryOutput.style.display = 'none';
        this.elements.customFeedbackDiv.innerHTML = '';

        // Generar cuento
        const storyText = await this.getWordProblemText(num1, num2, operator);

        // Mostrar resultado
        this.elements.customStoryLoader.style.display = 'none';
        this.elements.customStoryOutput.style.display = 'block';
        this.elements.customStoryText.textContent = storyText;
        this.elements.customStoryAnswerInput.value = '';

        // Configurar botón de verificación
        this.elements.customCheckBtn.onclick = () => this.checkAnswer(num1, num2, operator, this.elements.customStoryAnswerInput, this.elements.customFeedbackDiv);
    }

    async printToPDF() {
        let originalButtonText = '';
        
        try {
            console.log('📄 Iniciando generación de PDF...');
            
            // Esperar a que las librerías estén disponibles
            const librariesLoaded = await window.pdfLoadingPromise;
            
            if (!librariesLoaded || !window.pdfLibrariesLoaded) {
                console.error('❌ Librerías de PDF no disponibles');
                this.showErrorNotification('📄 Error: Las librerías de PDF no están disponibles. Por favor, revisa tu conexión a internet.');
                return;
            }

            // Verificar html2canvas primero
            if (!window.html2canvas) {
                console.error('❌ html2canvas no está disponible');
                this.showErrorNotification('📄 Error: html2canvas no se cargó correctamente.');
                return;
            }

            // Verificar jsPDF con todas las posibles formas de exposición
            let jsPDFConstructor = null;
            
            // Probar diferentes formas de acceso a jsPDF
            if (window.jspdf && window.jspdf.jsPDF) {
                // Versión UMD con namespace
                jsPDFConstructor = window.jspdf.jsPDF;
                console.log('📄 jsPDF encontrado en window.jspdf.jsPDF');
            } else if (window.jsPDF) {
                // Versión global directa
                jsPDFConstructor = window.jsPDF;
                console.log('📄 jsPDF encontrado en window.jsPDF');
            } else if (window.jspdf) {
                // Versión con namespace minúsculo
                jsPDFConstructor = window.jspdf;
                console.log('📄 jsPDF encontrado en window.jspdf');
            }

            if (!jsPDFConstructor) {
                console.error('❌ jsPDF no está disponible en ninguna forma conocida');
                console.log('Verificando window object:', Object.keys(window).filter(k => k.toLowerCase().includes('pdf')));
                this.showErrorNotification('📄 Error: jsPDF no se cargó correctamente.');
                return;
            }

            // Mostrar mensaje de carga
            originalButtonText = this.elements.printPdfBtn.innerHTML;
            this.elements.printPdfBtn.innerHTML = '<div class="loader inline-block mr-2"></div>Generando PDF...';
            this.elements.printPdfBtn.disabled = true;
            
            const content = this.elements.content;
            
            console.log('📄 Generando canvas...');
            
            // Generar canvas del contenido con mejor calidad
            const canvas = await window.html2canvas(content, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                width: content.scrollWidth,
                height: content.scrollHeight
            });

            console.log('📄 Canvas generado, creando PDF...');

            // Crear PDF usando el constructor encontrado
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDFConstructor('p', 'mm', 'a4');
            
            // Calcular dimensiones para ajustar al A4
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 295; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            // Agregar primera página
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Agregar páginas adicionales si es necesario
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // Generar nombre del archivo
            const studentName = this.selectedStudent.full_name.replace(/\s+/g, '_');
            const date = new Date().toISOString().split('T')[0];
            const fileName = `Matematica_${studentName}_${date}.pdf`;
            
            // Guardar PDF
            pdf.save(fileName);
            
            console.log('✅ PDF generado exitosamente:', fileName);
            
            // Mostrar notificación de éxito
            this.showSuccessNotification('📄 ¡PDF generado exitosamente!');
            
        } catch (error) {
            console.error('❌ Error generando PDF:', error);
            console.log('Estado de las librerías:', {
                html2canvas: !!window.html2canvas,
                jsPDF: !!window.jsPDF,
                jspdf: !!window.jspdf,
                windowKeys: Object.keys(window).filter(k => k.toLowerCase().includes('pdf'))
            });
            this.showErrorNotification(`❌ Error al generar PDF: ${error.message}. Por favor, inténtalo de nuevo.`);
        } finally {
            // Restaurar botón solo si se definió originalButtonText
            if (originalButtonText && this.elements.printPdfBtn) {
                this.elements.printPdfBtn.innerHTML = originalButtonText;
                this.elements.printPdfBtn.disabled = false;
            }
        }
    }

    showSuccessNotification(message) {
        this.showNotification(message, 'success');
    }

    showErrorNotification(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'success') {
        // Crear notificación temporal
        const notification = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
        notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Animar salida y remover
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, type === 'error' ? 5000 : 3000); // Errores se muestran más tiempo
    }

    async generateCustomStory() {
        const customFeedback = document.getElementById('custom-feedback');
        const generateBtn = document.getElementById('generate-story-btn');
        const originalText = generateBtn.textContent;
        
        try {
            // Mostrar estado de carga
            generateBtn.textContent = '🤖 Generando cuento...';
            generateBtn.disabled = true;
            
            customFeedback.innerHTML = '<p class="text-blue-600">🎨 Creando tu cuento personalizado...</p>';
            customFeedback.classList.remove('hidden'); // Hacer visible el contenedor
            
            console.log('🎭 Generando cuento personalizado...');
            
            const studentName = this.selectedStudent.full_name.split(' ')[0];
            
            const prompt = `Crea un cuento educativo corto y divertido para un niño de 7-8 años llamado ${studentName}.

REQUISITOS:
- El protagonista debe llamarse ${studentName}
- Incluir 2-3 problemas matemáticos de suma o resta sencillos (números de 1-2 dígitos)
- Los problemas deben estar integrados naturalmente en la historia
- Tema divertido: aventuras, animales, magia, exploración, etc.
- Longitud: 3-4 párrafos cortos
- Lenguaje simple y motivador
- Final positivo donde ${studentName} resuelve los problemas con éxito

FORMATO:
- Usa emojis para hacer el cuento más atractivo
- Destaca los problemas matemáticos con **negritas**
- Incluye diálogos cuando sea apropiado
- Haz que ${studentName} sea el héroe de la historia

Ejemplo: "${studentName} encontró 3 manzanas en el primer árbol y 5 en el segundo. **¿Cuántas manzanas encontró ${studentName} en total?**"`;

            const response = await this.callGemini(prompt);
            
            if (response && response.trim()) {
                const story = response.trim();
                
                // Limpiar el contenedor y agregar el cuento
                customFeedback.innerHTML = '';
                customFeedback.classList.remove('hidden');
                
                const storyElement = document.createElement('div');
                storyElement.className = 'bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200';
                storyElement.innerHTML = `
                    <h4 class="text-lg font-bold text-purple-700 mb-3">📚 Cuento Personalizado para ${studentName}</h4>
                    <div class="text-gray-700 leading-relaxed whitespace-pre-wrap">${story}</div>
                `;
                
                customFeedback.appendChild(storyElement);
                
                console.log('✅ Cuento personalizado generado y mostrado');
                return;
            }
            
            // Fallback si la IA no funciona
            this.generateFallbackStory(studentName, customFeedback);
            
        } catch (error) {
            console.error('❌ Error generando cuento personalizado:', error);
            this.generateFallbackStory(this.selectedStudent.full_name.split(' ')[0], customFeedback);
        } finally {
            // Restaurar botón
            generateBtn.textContent = originalText;
            generateBtn.disabled = false;
        }
    }

    generateFallbackStory(studentName, feedbackDiv) {
        const stories = [
            {
                title: `🌟 La Aventura Mágica de ${studentName}`,
                content: `${studentName} encontró una varita mágica en el jardín. ✨

Primero, la varita creó **7 mariposas** y luego aparecieron **3 más**. **¿Cuántas mariposas voló ${studentName} en total?**

Después, ${studentName} vio **12 flores** en el jardín, pero **4 se marchitaron**. **¿Cuántas flores hermosas quedaron para ${studentName}?**

Al final del día, ${studentName} había resuelto todos los acertijos mágicos y se convirtió en el mejor mago matemático del reino. 🏆

¡Qué aventura tan increíble vivió ${studentName}! 🎉`
            },
            {
                title: `🐾 ${studentName} y los Animales del Bosque`,
                content: `${studentName} fue de excursión al bosque y conoció muchos amigos animales. 🌳

En el camino, encontró **6 conejos** jugando y después llegaron **5 más** a unirse. **¿Cuántos conejos en total vio ${studentName}?**

Luego, ${studentName} vio **15 pájaros** en los árboles, pero **6 volaron** a buscar comida. **¿Cuántos pájaros quedaron cantando para ${studentName}?**

Todos los animales quedaron impresionados con las habilidades matemáticas de ${studentName}. 🦋

¡${studentName} se convirtió en el mejor amigo de todo el bosque! 🌟`
            },
            {
                title: `🚀 ${studentName} Explorador del Espacio`,
                content: `${studentName} se convirtió en un astronauta y viajó a las estrellas. 🌌

En su nave espacial, ${studentName} contó **8 planetas** azules y **4 planetas** rojos. **¿Cuántos planetas descubrió ${studentName} en total?**

Después, ${studentName} tenía **14 estrellas** en su colección, pero regaló **5 estrellas** a otros niños de la Tierra. **¿Cuántas estrellas conservó ${studentName}?**

La misión espacial de ${studentName} fue un gran éxito gracias a sus increíbles habilidades matemáticas. 🎯

¡${studentName} regresó a casa como un héroe del espacio! 👨‍🚀`
            }
        ];
        
        const randomStory = stories[Math.floor(Math.random() * stories.length)];
        
        // Limpiar el contenedor y agregar el cuento fallback
        feedbackDiv.innerHTML = '';
        feedbackDiv.classList.remove('hidden');
        
        const storyElement = document.createElement('div');
        storyElement.className = 'bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-200';
        storyElement.innerHTML = `
            <h4 class="text-lg font-bold text-blue-700 mb-3">${randomStory.title}</h4>
            <div class="text-gray-700 leading-relaxed whitespace-pre-wrap">${randomStory.content}</div>
        `;
        
        feedbackDiv.appendChild(storyElement);
        
        console.log('✅ Cuento fallback generado y mostrado');
    }
}

new DashboardApp();
