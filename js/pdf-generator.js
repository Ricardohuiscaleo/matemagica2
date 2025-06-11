/**
 * 📄 MATEMÁGICA - GENERADOR DE PDF EDUCATIVO v3.8 (Diseño Mejorado)
 * Módulo con todas las mejoras de UI/UX implementadas.
 * Versión: 3.8 - Junio 2025
 */

// 🎨 CONFIGURACIÓN DE DISEÑO EDUCATIVO MEJORADA
const PDF_CONFIG = {
    // Configuraciones de página de alta calidad
    page: {
        width: 210,      // A4 width (mm)
        height: 297,     // A4 height (mm)
        margin: 15,      // Margen general
        scale: 2.5,      // Escala aumentada para mejor calidad
        quality: 0.98    // Calidad de imagen superior
    },
    
    // Grid de ejercicios
    exercises: {
        perRow: 5,
        maxPerPage: 15
    }
};

// 🏗️ CLASE PRINCIPAL DEL GENERADOR PDF
class MathPDFGenerator {
    constructor() {
        this.pdf = null;
        this.tempContainer = null;
    }

    // 🚀 MÉTODO PRINCIPAL: Generar PDF desde HTML
    async generateEducationalPDF(exercises, options = {}) {
        try {
            console.log('📄 Iniciando generación de PDF educativo (HTML → PDF)...');
            
            if (!exercises || exercises.length === 0) {
                throw new Error('No hay ejercicios para generar PDF');
            }
            
            if (!window.jspdf || !window.jspdf.jsPDF || !window.html2canvas) {
                throw new Error('Librerías jsPDF o html2canvas no disponibles');
            }
            
            const context = this.getContextInfo(options);
            
            this.createTempContainer();
            const htmlContent = this.generateHTMLContent(exercises, context);
            this.tempContainer.innerHTML = htmlContent;
            
            await this.waitForRender();
            await this.convertHTMLToPDF(context);
            this.cleanup();
            
            console.log('✅ PDF educativo generado exitosamente');
            return true;
            
        } catch (error) {
            console.error('❌ Error generando PDF:', error);
            this.cleanup();
            throw error;
        }
    }

    // 🏗️ CREAR CONTENEDOR TEMPORAL
    createTempContainer() {
        this.cleanup();
        this.tempContainer = document.createElement('div');
        this.tempContainer.id = 'pdf-temp-container';
        this.tempContainer.style.cssText = `
            position: fixed;
            top: -9999px;
            left: -9999px;
            width: 210mm;
            background: white;
            z-index: -1;
        `;
        document.body.appendChild(this.tempContainer);
        console.log('🏗️ Contenedor temporal creado');
    }

    // 📝 GENERAR CONTENIDO HTML (ACTUALIZADO)
    generateHTMLContent(exercises, context) {
        // Se inyectan las fuentes de Google directamente en el HTML del PDF
        // para asegurar que siempre estén disponibles durante la renderización.
        return `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
            </style>
            <div class="pdf-page" style="
                width: 210mm;
                min-height: 297mm;
                padding: 15mm;
                background: white;
                box-sizing: border-box;
                font-family: 'Helvetica', 'Arial', sans-serif;
            ">
                ${this.generateHeader(context)}
                ${this.generateStudentSection(context)}
                ${this.generateExercisesSection(exercises)}
                ${this.generateFooter()}
            </div>
        `;
    }

    // 🎨 GENERAR HEADER EDUCATIVO (ACTUALIZADO CON ESTILO MÁGICO)
    generateHeader(context) {
        const dynamicTitle = this.generateDynamicTitle(context);
        const headerStyle = `
            background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
            color: white;
            padding: 20px;
            border-radius: 16px;
            margin: 0 auto 20px auto;
            text-align: center;
            width: 100%;
            box-sizing: border-box;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
        `;
        
        const titleStyle = `
            font-size: 38px;
            font-weight: 700;
            margin: 0 0 5px 0;
            font-family: 'Dancing Script', cursive;
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
        `;

        return `<div style="${headerStyle}">
                <h1 style="${titleStyle}">${dynamicTitle}</h1>
                <p style="font-size: 16px; margin: 0; opacity: 0.9; font-style: italic;">Hoja de Ejercicios Educativos</p>
            </div>`;
    }

    // 🎯 GENERAR TÍTULO DINÁMICO (ACTUALIZADO)
    generateDynamicTitle(context) {
        const { operationType, difficulty } = context;
        let baseTitle = '', emoji = '';
        switch (operationType) {
            case 'suma': baseTitle = 'Sumas'; emoji = '➕'; break;
            case 'resta': baseTitle = 'Restas'; emoji = '➖'; break;
            case 'ambos': baseTitle = 'Sumas y Restas'; emoji = '🧮'; break;
            default: baseTitle = 'Matemáticas'; emoji = '🔢';
        }
        let difficultyText = '';
        switch (difficulty) {
            case 'facil': difficultyText = baseTitle.includes('Resta') ? 'sin Canje' : 'sin Reserva'; break;
            case 'medio': difficultyText = baseTitle.includes('Resta') ? 'con Canje' : 'con Reserva'; break;
            case 'dificil': difficultyText = 'Mixtas'; break; // Simplificado de la versión original
            default: difficultyText = 'Nivel Medio';
        }
        return `${emoji} ${baseTitle} ${difficultyText}`;
    }

    // 👤 GENERAR SECCIÓN DE ESTUDIANTE (ACTUALIZADO)
    generateStudentSection(context) {
        // Si el nombre es "Estudiante" (valor por defecto), mostrar campo vacío
        const displayName = context.studentName === 'Estudiante' ? '' : context.studentName;
        
        return `<div style="background: #F8F9FA; border: 1px solid #DEE2E6; border-radius: 12px; padding: 15px 20px; margin: 0 auto 25px auto; width: 100%; box-sizing: border-box;">
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; gap: 20px; font-size: 14px;">
                    <div style="flex: 1; min-width: 0;">
                        <div style="margin-bottom: 10px;"><strong>👤 Nombre:</strong><span style="margin-left: 8px; font-weight: 500;">${displayName}</span></div>
                        <div><strong>📅 Fecha:</strong><span style="margin-left: 8px; font-weight: 500;">${context.currentDate}</span></div>
                    </div>
                    <div style="text-align: left;">
                        <div style="margin-bottom: 10px;"><strong>🎯 Nivel:</strong><span style="margin-left: 8px;">${this.getDifficultyText(context.difficulty)}</span></div>
                        <div><strong>🧮 Tipo:</strong><span style="margin-left: 8px;">${this.getOperationText(context.operationType)}</span></div>
                    </div>
                </div>
            </div>`;
    }

    // 📝 GENERAR SECCIÓN DE EJERCICIOS (ACTUALIZADO)
    generateExercisesSection(exercises) {
        return `<div style="margin: 0 auto 30px auto; width: 100%;">
                <h2 style="color: #1565C0; font-size: 20px; font-weight: bold; text-align: center; margin: 0 0 10px 0; font-family: 'Poppins', 'Helvetica', sans-serif;">📝 ¡A Practicar!</h2>
                <p style="text-align: center; color: #555; font-size: 14px; margin: 0 0 25px 0;">Resuelve cada ejercicio con cuidado. ¡Tú puedes! 💪</p>
                ${this.generateExercisesGrid(exercises)}
            </div>`;
    }

    // 🔢 GENERAR GRID DE EJERCICIOS (ACTUALIZADO)
    generateExercisesGrid(exercises) {
        const { perRow } = PDF_CONFIG.exercises;
        let gridHTML = `<div style="display: grid; grid-template-columns: repeat(${perRow}, 1fr); gap: 20px 15px; width: 100%; justify-content: center;">`;
        exercises.forEach((exercise, index) => {
            gridHTML += this.generateExerciseBox(exercise, index + 1);
        });
        gridHTML += '</div>';
        return gridHTML;
    }

    // 📦 GENERAR CAJA DE EJERCICIO (ACTUALIZADO CON CENTRADO PRECISO)
    generateExerciseBox(exercise, number) {
        const numberCircleStyle = `
            position: absolute; 
            top: -14px; 
            left: 50%; 
            transform: translateX(-50%); 
            background: #1976D2; 
            color: white; 
            width: 28px; 
            height: 28px; 
            border-radius: 50%; 
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold; 
            font-size: 14px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.2); 
            border: 2px solid white;
            box-sizing: border-box;
            padding-bottom: 5px; /* Ajuste final para centrado vertical */
        `;

        return `<div style="border: 1px solid #E0E0E0; border-radius: 12px; padding: 12px; padding-top: 20px; background: #fff; min-height: 160px; position: relative; box-shadow: 0 2px 5px rgba(0,0,0,0.06); width: 100%; box-sizing: border-box;">
                <div style="${numberCircleStyle}">${number}</div>
                <div>${this.generateExerciseContent(exercise)}</div>
            </div>`;
    }

    // 📐 GENERAR CONTENIDO DEL EJERCICIO (SIMPLIFICADO)
    generateExerciseContent(exercise) {
        // Se asume que todos los ejercicios son de tipo vertical por simplicidad,
        // ya que la lógica genérica no se usó en las mejoras.
        // Si se necesitan otros tipos, la lógica original de 'if/else' puede ser reintroducida.
        return this.generateVerticalMathHTML(exercise);
    }

    // 🔢 GENERAR EJERCICIO MATEMÁTICO VERTICAL EN HTML (SIMPLIFICADO COMO EJERCICIO A MANO)
    generateVerticalMathHTML(exercise) {
        const showDUHelp = exercise.difficulty === 'facil';
        const num1_str = String(exercise.num1).padStart(2, ' ');
        const num2_str = String(exercise.num2).padStart(2, ' ');
        
        const d1 = num1_str[0];
        const u1 = num1_str[1];
        const d2 = num2_str[0];
        const u2 = num2_str[1];
        
        const duHeader = showDUHelp ? `
            <div style="display: grid; grid-template-columns: 1fr 1fr; text-align: center; margin-bottom: 8px; column-gap: 20px;">
                <span style="font-weight: bold; color: #FF9800; font-size: 14px;">D</span>
                <span style="font-weight: bold; color: #FF9800; font-size: 14px;">U</span>
            </div>` : '<div style="height: 24px;"></div>';
        
        return `
            <div style="width: 90%; margin: 0 auto; font-family: 'Courier New', monospace; font-size: 24px; font-weight: bold; line-height: 1.4;">
                ${duHeader}
                <div style="display: grid; grid-template-columns: 30px 1fr 1fr; column-gap: 15px; align-items: center;">
                    <!-- Fila 1: Primer número -->
                    <div></div>
                    <div style="text-align: center;">${d1}</div>
                    <div style="text-align: center;">${u1}</div>
                    
                    <!-- Fila 2: Operador y segundo número -->
                    <div style="text-align: center; color: #E53935;">${exercise.operation}</div>
                    <div style="text-align: center;">${d2}</div>
                    <div style="text-align: center;">${u2}</div>

                    <!-- Línea de resultado -->
                    <div style="grid-column: 1 / 4; height: 2px; background: #333; margin: 10px 0;"></div>
                </div>
            </div>`;
    }

    // 🦶 GENERAR FOOTER (ACTUALIZADO)
    generateFooter() {
        const motivationalMessages = [
            '¡Excelente trabajo! 🌟', 
            '¡Sigue así, campeón! 🏆', 
            '¡Tú puedes hacerlo! 💪', 
            '¡Matemágico trabajo! ✨'
        ];
        const message = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
        return `<div style="border-top: 2px solid #FFB74D; padding-top: 10px; margin-top: 30px; text-align: center;">
                <p style="color: #333; font-size: 14px; margin: 0 0 8px 0; font-style: italic;">${message}</p>
                <div style="display: flex; justify-content: space-between; font-size: 10px; color: #1565C0;">
                    <span>Generado con Matemágica</span>
                    <span>Página 1 de 1</span>
                </div>
            </div>`;
    }

    // ⏳ ESPERAR RENDERIZADO
    async waitForRender() {
        return new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 300)));
    }

    // 📄 CONVERTIR HTML A PDF
    async convertHTMLToPDF(context) {
        const { jsPDF } = window.jspdf;
        const { page } = PDF_CONFIG;
        
        const canvas = await html2canvas(this.tempContainer, {
            scale: page.scale,
            useCORS: true,
            backgroundColor: '#ffffff',
            width: this.tempContainer.scrollWidth,
            height: this.tempContainer.scrollHeight
        });
        
        this.pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
        });
        
        const imgWidth = page.width;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        const imgData = canvas.toDataURL('image/png', page.quality);
        this.pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        
        this.downloadPDF(context);
        console.log('📄 HTML convertido a PDF exitosamente');
    }

    // 💾 DESCARGAR PDF
    downloadPDF(context) {
        const dateStr = new Date().toISOString().split('T')[0];
        const studentName = context.studentName.replace(/[^a-zA-Z0-9]/g, '_');
        const difficultyText = this.getDifficultyText(context.difficulty).replace(/[^a-zA-Z0-9]/g, '_');
        
        const fileName = `Matematica_${studentName}_${difficultyText}_${dateStr}.pdf`;
        
        this.pdf.save(fileName);
        console.log(`💾 PDF descargado: ${fileName}`);
    }

    // 🧹 LIMPIAR RECURSOS
    cleanup() {
        if (this.tempContainer && this.tempContainer.parentNode) {
            this.tempContainer.parentNode.removeChild(this.tempContainer);
            this.tempContainer = null;
        }
    }

    // 📊 OBTENER INFORMACIÓN DEL CONTEXTO
    getContextInfo(options) {
        const currentDate = new Date().toLocaleDateString('es-CL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        return {
            studentName: options.studentName || this.getCurrentStudentName() || 'Estudiante',
            currentDate: currentDate,
            difficulty: options.difficulty || this.getDifficultyFromDOM(),
            operationType: options.operationType || this.getOperationTypeFromDOM(),
            // Se mantienen los campos originales por si son usados en otra parte de tu código
            totalExercises: options.exercises?.length || 0,
            subject: options.subject || 'Matemáticas - Suma y Resta',
            grade: options.grade || '2° Básico',
            teacher: options.teacher || '',
            school: options.school || ''
        };
    }

    // 🔧 MÉTODOS DE UTILIDAD
    getCurrentStudentName() {
        if (typeof matemáticaDashboardConfig !== 'undefined' && matemáticaDashboardConfig.currentStudentData) {
            return matemáticaDashboardConfig.currentStudentData.name;
        }
        return null;
    }

    getDifficultyFromDOM() {
        const difficultySelect = document.getElementById('difficulty-select');
        return difficultySelect ? difficultySelect.value : 'medio';
    }

    getOperationTypeFromDOM() {
        const operationSelect = document.getElementById('operation-type-select');
        return operationSelect ? operationSelect.value : 'ambos';
    }

    getDifficultyText(difficulty) {
        // Se devuelve solo el texto para la lógica interna (como el nombre del archivo)
        const map = { 'facil': 'Fácil', 'medio': 'Medio', 'dificil': 'Difícil' };
        return map[difficulty] || 'Normal';
    }

    getOperationText(operationType) {
        // Se devuelve solo el texto
        const map = { 'suma': 'Solo Sumas', 'resta': 'Solo Restas', 'ambos': 'Sumas y Restas' };
        return map[operationType] || 'Mixtas';
    }
}

// 🚀 FUNCIONES PÚBLICAS PARA USO EXTERNO (SIN CAMBIOS)
window.MathPDFGenerator = MathPDFGenerator;

// Función global mejorada para compatibilidad
async function generatePDFReport(exercises = null, format = 'educativo') {
    try {
        const exercisesToUse = exercises || 
            (typeof matemáticaDashboardConfig !== 'undefined' && matemáticaDashboardConfig.currentStudentData ? 
                JSON.parse(localStorage.getItem('exercise_progress') || '[]') : []);
        
        if (!exercisesToUse || exercisesToUse.length === 0) {
            const demoExercises = [
                { id: 1, type: 'math_operation_vertical', num1: 45, num2: 23, operation: '-', difficulty: 'facil' },
                { id: 2, type: 'math_operation_vertical', num1: 87, num2: 15, operation: '-', difficulty: 'facil' },
                { id: 3, type: 'math_operation_vertical', num1: 89, num2: 34, operation: '-', difficulty: 'facil' },
                { id: 4, type: 'math_operation_vertical', num1: 66, num2: 41, operation: '-', difficulty: 'facil' },
                { id: 5, type: 'math_operation_vertical', num1: 92, num2: 60, operation: '-', difficulty: 'facil' },
                { id: 6, type: 'math_operation_vertical', num1: 57, num2: 23, operation: '+', difficulty: 'medio' },
                { id: 7, type: 'math_operation_vertical', num1: 41, num2: 14, operation: '+', difficulty: 'medio' },
                { id: 8, type: 'math_operation_vertical', num1: 65, num2: 28, operation: '+', difficulty: 'medio' },
                { id: 9, type: 'math_operation_vertical', num1: 58, num2: 39, operation: '+', difficulty: 'dificil' },
                { id: 10, type: 'math_operation_vertical', num1: 67, num2: 18, operation: '+', difficulty: 'dificil' }
            ];
            
            console.warn('⚠️ No hay ejercicios, usando ejercicios de demostración');
            return await generatePDFReport(demoExercises, format);
        }
        
        const generator = new MathPDFGenerator();
        
        const options = {
            studentName: generator.getCurrentStudentName(),
            difficulty: generator.getDifficultyFromDOM(),
            operationType: generator.getOperationTypeFromDOM(),
            exercises: exercisesToUse
        };
        
        await generator.generateEducationalPDF(exercisesToUse, options);
        
        if (typeof showSuccessToast === 'function') {
            showSuccessToast('📄 ¡PDF educativo descargado exitosamente!');
        } else {
            console.log('✅ PDF generado exitosamente');
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Error en generatePDFReport:', error);
        
        if (typeof showErrorToast === 'function') {
            showErrorToast('Error al generar PDF. Inténtalo de nuevo.');
        }
        
        throw error;
    }
}

// Función simplificada para compatibilidad
async function generatePDF() {
    return await generatePDFReport();
}

console.log('📄 Módulo PDF Generator v3.8 (HTML→PDF) cargado correctamente');
