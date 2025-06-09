// js/dashboard.js
// v6.0 - CORRECCIÓN FINAL: Se restaura la lógica de la IA que funciona y se afina el confeti.
console.log("🚀 Lógica del Dashboard Unificada v6.0 iniciada.");

// --- CONFIGURACIÓN GLOBAL ---
const SUPABASE_URL = "https://uznvakpuuxnpdhoejrog.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bnZha3B1dXhucGRob2Vqcm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODg0MTAsImV4cCI6MjA2NDY2NDQxMH0.OxbLYkjlgpWFnqd28gaZSwar_NQ6_qUS3U76bqbcXVg";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class DashboardApp {
    constructor() {
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
        this.userProfile = JSON.parse(localStorage.getItem('matemagica-user-profile'));
        if (!this.userProfile) {
            window.location.assign('index.html');
            return;
        }
        this.setupDOMElements();
        this.setupDashboardEventListeners();
        this.renderHeader();
        this.loadStudents();
    }

    // --- 1. SETUP ---
    setupDOMElements() {
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
        this.elements.levelRadios.forEach(radio => radio.addEventListener('change', () => this.generateAndRenderExercises()));
        this.elements.createStoryBtn?.addEventListener('click', () => this.handleCustomProblemSubmit());
        this.elements.closeModalBtn?.addEventListener('click', () => this.elements.storyModal.classList.remove('visible'));
        this.elements.storyModal?.addEventListener('click', (e) => {
            if (e.target === this.elements.storyModal) this.elements.storyModal.classList.remove('visible');
        });
        
        this.isGeneratorInitialized = true;
    }

    // --- 2. LÓGICA DEL DASHBOARD ---
    renderHeader() {
        this.elements.userName.textContent = this.userProfile.full_name || 'Usuario';
        this.elements.studentListTitle.textContent = this.userProfile.user_role === 'teacher' ? 'Mis Alumnos' : 'Mis Hijos';
    }

    async loadStudents() {
        const relationColumn = this.userProfile.user_role === 'teacher' ? 'teacher_id' : 'parent_id';
        const { data, error } = await supabase.from('math_profiles').select('*').eq(relationColumn, this.userProfile.user_id);
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
        this.setupGenerator();
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
        const { error } = await supabase.from('math_profiles').insert([newProfile]);
        if (error) console.error("Error añadiendo perfil:", error);
        else this.loadStudents();
    }

    logout() {
        localStorage.clear();
        supabase.auth.signOut();
        window.location.assign('index.html');
    }

    // --- 3. LÓGICA COMPLETA DEL GENERADOR ---
    
    triggerConfetti() {
        if (!this.elements.confettiCanvas || !window.confetti) return;
        const myConfetti = confetti.create(this.elements.confettiCanvas, { resize: true, useWorker: true });
        myConfetti({ particleCount: 150, spread: 160, origin: { y: 0.6 } });
    }
    
    async callGemini(payload) {
        try {
            const response = await fetch(this.API_URL_GENERATE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        } catch(e) {
            console.error("Fallo en la llamada a la API:", e);
            return null;
        }
    }

    generateOfflineExercises(level) {
        console.warn("Generando ejercicios offline como fallback.");
        const problems = { additions: [], subtractions: [] };
        const max = level == 1 ? 20 : (level == 2 ? 60 : 99);
        for(let i = 0; i < 20; i++) {
            let n1 = Math.floor(Math.random() * max) + 1;
            let n2 = Math.floor(Math.random() * max) + 1;
            problems.additions.push({num1: n1, num2: n2});
            let s1 = Math.floor(Math.random() * max) + 1;
            let s2 = Math.floor(Math.random() * s1) + 1;
            problems.subtractions.push({num1: s1, num2: s2});
        }
        return problems;
    }

    async generateAndRenderExercises() {
        if (!this.selectedStudent) return;
        
        this.elements.mainLoader.style.display = 'block';
        this.elements.content.classList.add('hidden');
        this.elements.errorMessage.textContent = '';
        
        const level = document.querySelector('input[name="level"]:checked').value;
        let levelInstructions = '';
        switch (level) {
            case '2': levelInstructions = "Nivel 2 (Medio): En sumas, puede haber reserva. En restas, puede haber reserva."; break;
            case '3': levelInstructions = "Nivel 3 (Difícil): Mezcla de problemas con y sin reserva."; break;
            default: levelInstructions = "Nivel 1 (Fácil): Sumas y restas sin reserva."; break;
        }
        
        const prompt = `Genera 20 problemas de suma y 20 de resta de dos dígitos para un niño. Reglas: ${levelInstructions}. Devuelve el resultado como un objeto JSON.`;
        const schema = {type: "OBJECT", properties: { "additions": {type: "ARRAY", items: {type: "OBJECT", properties: { "num1": {type: "INTEGER"}, "num2": {type: "INTEGER"}}}}, "subtractions": {type: "ARRAY", items: {type: "OBJECT", properties: { "num1": {type: "INTEGER"}, "num2": {type: "INTEGER"}}}}}};
        const payload = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", responseSchema: schema } };
        
        const result = await this.callGemini(payload);
        
        let data;
        if(result && result.candidates?.[0]?.content?.parts?.[0]?.text) {
            try {
                data = JSON.parse(result.candidates[0].content.parts[0].text);
            } catch(e) {
                this.elements.errorMessage.textContent = 'La IA devolvió un formato inesperado. Usando ejercicios estándar.';
                data = this.generateOfflineExercises(level);
            }
        } else {
            this.elements.errorMessage.textContent = '¡Ups! La IA no está disponible. Usando ejercicios estándar.';
            this.elements.errorMessage.classList.remove('hidden');
            data = this.generateOfflineExercises(level);
        }
        
        this.renderGrid(data.additions, this.elements.additionsGrid, '+');
        this.renderGrid(data.subtractions, this.elements.subtractionsGrid, '-');
        
        this.elements.content.classList.remove('hidden');
        this.elements.mainLoader.style.display = 'none';
    }

    renderGrid(problems, gridElement, operator) {
        gridElement.innerHTML = '';
        problems.forEach(p => {
            const item = document.createElement('div');
            item.className = 'exercise-item';
            const storyButton = document.createElement('button');
            storyButton.className = 'story-button';
            storyButton.innerHTML = '✨';
            storyButton.title = 'Crear un cuento';
            storyButton.onclick = () => this.generateAndShowWordProblemInModal(p.num1, p.num2, operator);
            item.innerHTML = `<div>${p.num1}</div><div><span class="operator">${operator}</span>${p.num2}</div><div class="line"></div>`;
            item.prepend(storyButton);
            gridElement.appendChild(item);
        });
    }

    async generateAndShowWordProblemInModal(num1, num2, operator) {
        const { storyModal, storyTextEl, storyLoader, modalFeedbackDiv, storyAnswerInput, storyTitle, storyCheckBtn } = this.elements;
        storyModal.classList.add('visible');
        storyTextEl.classList.add('hidden');
        storyLoader.classList.remove('hidden');
        modalFeedbackDiv.classList.add('hidden');
        storyAnswerInput.value = '';
        storyTitle.textContent = `Creando cuento para ${num1} ${operator} ${num2}`;
        const problemText = await this.getWordProblemText(num1, num2, operator);
        storyTextEl.textContent = problemText;
        storyCheckBtn.onclick = () => this.checkAnswer(num1, num2, operator, storyAnswerInput, modalFeedbackDiv);
        storyLoader.classList.add('hidden');
        storyTextEl.classList.remove('hidden');
    }

    async getWordProblemText(num1, num2, operator) {
        const prompt = `Crea un problema de cuento corto, simple y divertido en español para un niño de 7 años usando la operación: ${num1} ${operator} ${num2}. Termina con una pregunta concisa. Responde solo con el texto del problema.`;
        try {
            const result = await this.callGemini({ contents: [{ parts: [{ text: prompt }] }] });
            return result.candidates[0].content.parts[0].text;
        } catch (error) {
            return 'No se pudo crear el cuento mágico.';
        }
    }

    async checkAnswer(num1, num2, operator, answerInput, feedbackDiv) {
        const userAnswer = answerInput.value;
        if (!userAnswer) return;

        const loader = this.elements.modalFeedbackLoader;
        loader.classList.remove('hidden');
        feedbackDiv.classList.add('hidden');

        const correctAnswer = (operator === '+') ? (num1 + num2) : (num1 - num2);
        const userName = this.selectedStudent.full_name.split(' ')[0] || "campeón/a";
        const prompt = `Eres un profesor amigable. El problema era ${num1} ${operator} ${num2}. La respuesta correcta es ${correctAnswer}. La respuesta del niño, ${userName}, fue ${userAnswer}. Evalúa su respuesta. Si es correcta, felicítalo (ej: '¡Excelente, ${userName}! ¡Respuesta correcta!'). Si es incorrecta, anímale con una pista sin darle la respuesta. Responde solo con el feedback para el niño.`;

        try {
            const result = await this.callGemini({ contents: [{ parts: [{ text: prompt }] }] });
            feedbackDiv.textContent = result.candidates[0].content.parts[0].text;
            if (userAnswer == correctAnswer) {
                feedbackDiv.className = 'mt-4 p-3 rounded-lg feedback-correct';
                this.triggerConfetti(); // ¡CELEBRACIÓN!
            } else {
                feedbackDiv.className = 'mt-4 p-3 rounded-lg feedback-incorrect';
            }
        } catch (error) {
            feedbackDiv.textContent = 'No se pudo revisar la respuesta.';
            feedbackDiv.className = 'mt-4 p-3 rounded-lg feedback-incorrect';
        } finally {
            loader.classList.add('hidden');
            feedbackDiv.classList.remove('hidden');
        }
    }

    async handleCustomProblemSubmit() {
        const { num1Input, num2Input, operatorSelect, customStoryLoader, customStoryOutput, createStoryBtn, customStoryText, customFeedbackDiv, customStoryAnswerInput, customCheckBtn } = this.elements;
        const num1 = parseInt(num1Input.value);
        const num2 = parseInt(num2Input.value);
        const operator = operatorSelect.value;
        if (isNaN(num1) || isNaN(num2)) return;

        customStoryLoader.classList.remove('hidden');
        customStoryOutput.classList.add('hidden');
        createStoryBtn.disabled = true;

        const problemText = await this.getWordProblemText(num1, num2, operator);
        customStoryText.textContent = problemText;
        customFeedbackDiv.classList.add('hidden');
        customStoryAnswerInput.value = '';
        customCheckBtn.onclick = () => this.checkAnswer(num1, num2, operator, customStoryAnswerInput, customFeedbackDiv);

        customStoryLoader.classList.add('hidden');
        customStoryOutput.classList.remove('hidden');
        createStoryBtn.disabled = false;
    }

    preventNonNumericInput(event) {
        if (!((event.keyCode > 95 && event.keyCode < 106) || (event.keyCode > 47 && event.keyCode < 58) || [8, 9, 37, 39, 46].includes(event.keyCode))) {
            event.preventDefault();
        }
    }

    async printToPDF() {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const content = document.getElementById('exercise-generator-section');
        const canvas = await html2canvas(content, { scale: 2, ignoreElements: (el) => el.classList.contains('no-print') });
        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = canvas.height * pdfWidth / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
        pdf.save(`guia-${this.selectedStudent.full_name}.pdf`);
    }
}

new DashboardApp();
