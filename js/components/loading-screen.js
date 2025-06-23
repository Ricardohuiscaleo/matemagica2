/**
 * 🎭 MATEMÁGICA - PANTALLA DE CARGA ÉPICA
 * Experiencia inmersiva y educativa para niños de 7-8 años
 * Versión: 2.0 ÉPICA - Diciembre 2024
 */

class LoadingScreen {
    constructor() {
        this.currentOverlay = null;
        this.particleCanvas = null;
        this.animationFrame = null;
        this.mathElements = [];
        this.confettiParticles = [];
        this.stars = [];
        this.currentFactIndex = 0;
        
        // 🎨 Datos curiosos matemáticos para niños
        this.mathFacts = [
            "🔢 Los números existen desde hace más de 5000 años",
            "🍕 Una pizza redonda se puede dividir en 8 partes iguales",
            "⭐ Las estrellas se pueden contar, ¡pero son muchísimas!",
            "🐝 Las abejas hacen sus panales con formas hexagonales perfectas",
            "🌈 Un arcoíris tiene exactamente 7 colores principales",
            "🕸️ Las arañas tejen sus telas usando matemáticas",
            "🏗️ Los arquitectos usan matemáticas para construir edificios fuertes",
            "🎵 La música está llena de patrones matemáticos",
            "🌻 Los girasoles tienen números especiales en sus semillas",
            "🧮 El ábaco fue la primera calculadora de la historia"
        ];
        
        // 🎯 Estadísticas motivacionales
        this.achievements = [
            "Has resuelto {exercises} ejercicios increíbles",
            "Llevas {hours} horas aprendiendo matemáticas",
            "Tu precisión es del {accuracy}% - ¡Fantástico!",
            "Has ganado {points} puntos mágicos",
            "Eres {level} en matemáticas"
        ];
    }

    /**
     * 🎭 PANTALLA DE CARGA ÉPICA con experiencia inmersiva
     * @param {string} message - Mensaje personalizado
     */
    showLoadingAndReload(message = '🏠 Volviendo al Dashboard Mágico...') {
        try {
            console.log('🎭 Iniciando experiencia de carga ÉPICA');
            
            // Crear overlay principal con gradiente animado
            const loadingOverlay = this.createMainOverlay();
            
            // Crear canvas para partículas y efectos
            this.createParticleCanvas(loadingOverlay);
            
            // Agregar contenido mágico
            const contentContainer = this.createMagicalContent(message);
            loadingOverlay.appendChild(contentContainer);
            
            // Guardar referencia y agregar al DOM
            this.currentOverlay = loadingOverlay;
            document.body.appendChild(loadingOverlay);
            
            // Iniciar todas las animaciones
            this.startMagicalAnimations();
            
            // Secuencia de progreso épica
            this.startEpicProgressSequence();
            
            console.log('✨ Experiencia mágica iniciada correctamente');
            
        } catch (error) {
            console.error('❌ Error en pantalla épica:', error);
            this.fallbackToSimple(message);
        }
    }

    /**
     * 🎨 Crear overlay principal con gradiente dinámico
     */
    createMainOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'epic-loading-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.8s ease-in-out;
            background: linear-gradient(45deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%);
            background-size: 400% 400%;
            animation: gradientShift 6s ease infinite;
        `;
        
        // Agregar animación de gradiente
        const style = document.createElement('style');
        style.textContent = `
            @keyframes gradientShift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            
            @keyframes floatUp {
                0% { 
                    transform: translateY(100vh) rotate(0deg);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% { 
                    transform: translateY(-100vh) rotate(360deg);
                    opacity: 0;
                }
            }
            
            @keyframes sparkle {
                0%, 100% { 
                    transform: scale(0) rotate(0deg);
                    opacity: 0;
                }
                50% { 
                    transform: scale(1) rotate(180deg);
                    opacity: 1;
                }
            }
            
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% {
                    transform: translateY(0);
                }
                40% {
                    transform: translateY(-20px);
                }
                60% {
                    transform: translateY(-10px);
                }
            }
            
            @keyframes rainbow {
                0% { color: #ff6b6b; }
                16% { color: #4ecdc4; }
                33% { color: #45b7d1; }
                50% { color: #96ceb4; }
                66% { color: #feca57; }
                83% { color: #ff9ff3; }
                100% { color: #ff6b6b; }
            }
            
            @keyframes confetti {
                0% {
                    transform: translateY(-100vh) rotate(0deg);
                    opacity: 1;
                }
                100% {
                    transform: translateY(100vh) rotate(720deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
        
        return overlay;
    }

    /**
     * 🌟 Crear canvas para partículas mágicas
     */
    createParticleCanvas(parent) {
        this.particleCanvas = document.createElement('canvas');
        this.particleCanvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        `;
        
        // Configurar canvas
        this.particleCanvas.width = window.innerWidth;
        this.particleCanvas.height = window.innerHeight;
        
        parent.appendChild(this.particleCanvas);
        
        // Crear partículas de estrellas flotantes
        this.createStarParticles();
    }

    /**
     * ⭐ Crear partículas de estrellas
     */
    createStarParticles() {
        const canvas = this.particleCanvas;
        const ctx = canvas.getContext('2d');
        
        // Generar estrellas
        for (let i = 0; i < 50; i++) {
            this.stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 2,
                speedY: (Math.random() - 0.5) * 2,
                opacity: Math.random() * 0.8 + 0.2,
                twinkleSpeed: Math.random() * 0.02 + 0.01
            });
        }
    }

    /**
     * 🎨 Crear contenido mágico principal
     */
    createMagicalContent(message) {
        const container = document.createElement('div');
        container.style.cssText = `
            position: relative;
            z-index: 10;
            text-align: center;
            color: white;
            padding: 2rem;
            max-width: 600px;
            width: 90%;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            border: 2px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
        `;
        
        container.innerHTML = `
            <!-- 🧮 Logo mágico principal -->
            <div style="margin-bottom: 2rem;">
                <div id="magic-logo" style="
                    font-size: 4rem; 
                    margin-bottom: 1rem; 
                    animation: bounce 2s infinite;
                    filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.8));
                ">🧮</div>
                <h1 style="
                    font-family: 'Pacifico', cursive; 
                    font-size: 2.5rem; 
                    margin-bottom: 0.5rem;
                    animation: rainbow 3s linear infinite;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
                ">Matemágica</h1>
                <p style="
                    font-size: 1rem; 
                    opacity: 0.9;
                    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
                ">✨ Tu aventura matemática más mágica ✨</p>
            </div>
            
            <!-- 🎯 Mensaje principal -->
            <div style="margin-bottom: 2rem;">
                <h2 id="main-message" style="
                    font-size: 1.5rem; 
                    margin-bottom: 1rem;
                    font-weight: 600;
                    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
                ">${message}</h2>
                <p id="status-text" style="
                    font-size: 1rem; 
                    opacity: 0.8;
                    margin-bottom: 1.5rem;
                ">Preparando tu experiencia mágica...</p>
                
                <!-- 📊 Barra de progreso épica -->
                <div style="
                    width: 100%; 
                    height: 8px; 
                    background: rgba(255, 255, 255, 0.2); 
                    border-radius: 10px; 
                    overflow: hidden;
                    margin-bottom: 1rem;
                    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
                ">
                    <div id="epic-progress-bar" style="
                        height: 100%; 
                        background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57);
                        background-size: 200% 100%;
                        border-radius: 10px; 
                        width: 0%; 
                        transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                        animation: gradientShift 2s ease infinite;
                        box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
                    "></div>
                </div>
                
                <!-- 📈 Porcentaje de progreso -->
                <div id="progress-percentage" style="
                    font-size: 1.2rem;
                    font-weight: bold;
                    margin-bottom: 1rem;
                    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
                ">0%</div>
            </div>
            
            <!-- 🎲 Elementos matemáticos flotantes -->
            <div id="floating-math" style="
                display: flex; 
                justify-content: center; 
                gap: 1.5rem; 
                margin-bottom: 1.5rem;
                flex-wrap: wrap;
            ">
                <div class="math-element" style="font-size: 2rem; animation: floatUp 4s linear infinite;">📚</div>
                <div class="math-element" style="font-size: 2rem; animation: floatUp 4s linear infinite 0.5s;">✨</div>
                <div class="math-element" style="font-size: 2rem; animation: floatUp 4s linear infinite 1s;">🎯</div>
                <div class="math-element" style="font-size: 2rem; animation: floatUp 4s linear infinite 1.5s;">🌟</div>
                <div class="math-element" style="font-size: 2rem; animation: floatUp 4s linear infinite 2s;">🏆</div>
            </div>
            
            <!-- 🧠 Dato curioso matemático -->
            <div id="math-fact" style="
                background: rgba(255, 255, 255, 0.15);
                padding: 1rem;
                border-radius: 15px;
                margin-bottom: 1.5rem;
                border: 1px solid rgba(255, 255, 255, 0.3);
                backdrop-filter: blur(10px);
            ">
                <div style="
                    font-size: 0.9rem;
                    opacity: 0.9;
                    line-height: 1.4;
                ">💡 Cargando dato curioso...</div>
            </div>
            
            <!-- 📊 Estadísticas del usuario -->
            <div id="user-stats" style="
                background: rgba(255, 255, 255, 0.15);
                padding: 1rem;
                border-radius: 15px;
                border: 1px solid rgba(255, 255, 255, 0.3);
                backdrop-filter: blur(10px);
            ">
                <div style="
                    font-size: 0.9rem;
                    opacity: 0.9;
                    line-height: 1.4;
                ">📈 Cargando tus logros...</div>
            </div>
        `;
        
        return container;
    }

    /**
     * ✨ Iniciar todas las animaciones mágicas
     */
    startMagicalAnimations() {
        // Animar entrada del overlay
        setTimeout(() => {
            this.currentOverlay.style.opacity = '1';
        }, 100);
        
        // Iniciar animación de partículas
        this.animateParticles();
        
        // Crear elementos matemáticos flotantes cada 2 segundos
        setInterval(() => {
            this.createFloatingMathElement();
        }, 2000);
        
        // Cambiar datos curiosos cada 4 segundos
        setInterval(() => {
            this.updateMathFact();
        }, 4000);
        
        // Primera actualización inmediata
        setTimeout(() => {
            this.updateMathFact();
            this.updateUserStats();
        }, 1000);
    }

    /**
     * 🌟 Animar partículas de estrellas
     */
    animateParticles() {
        if (!this.particleCanvas) return;
        
        const canvas = this.particleCanvas;
        const ctx = canvas.getContext('2d');
        
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Animar estrellas
            this.stars.forEach(star => {
                // Mover estrella
                star.x += star.speedX;
                star.y += star.speedY;
                
                // Parpadeo
                star.opacity += Math.sin(Date.now() * star.twinkleSpeed) * 0.01;
                star.opacity = Math.max(0.2, Math.min(1, star.opacity));
                
                // Rebotar en bordes
                if (star.x < 0 || star.x > canvas.width) star.speedX *= -1;
                if (star.y < 0 || star.y > canvas.height) star.speedY *= -1;
                
                // Dibujar estrella
                ctx.save();
                ctx.globalAlpha = star.opacity;
                ctx.fillStyle = '#ffffff';
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#ffffff';
                
                // Forma de estrella
                this.drawStar(ctx, star.x, star.y, star.size);
                
                ctx.restore();
            });
            
            this.animationFrame = requestAnimationFrame(animate);
        };
        
        animate();
    }

    /**
     * ⭐ Dibujar estrella
     */
    drawStar(ctx, x, y, size) {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5;
            const x1 = x + Math.cos(angle) * size;
            const y1 = y + Math.sin(angle) * size;
            if (i === 0) ctx.moveTo(x1, y1);
            else ctx.lineTo(x1, y1);
        }
        ctx.closePath();
        ctx.fill();
    }

    /**
     * 🎲 Crear elemento matemático flotante
     */
    createFloatingMathElement() {
        const mathSymbols = ['➕', '➖', '✖️', '➗', '🔢', '📐', '📏', '🧮', '💯', '✅'];
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
        
        const element = document.createElement('div');
        element.textContent = mathSymbols[Math.floor(Math.random() * mathSymbols.length)];
        element.style.cssText = `
            position: absolute;
            font-size: ${Math.random() * 20 + 20}px;
            color: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 80 + 10}%;
            animation: floatUp ${Math.random() * 3 + 4}s linear infinite;
            z-index: 5;
            pointer-events: none;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        `;
        
        this.currentOverlay.appendChild(element);
        
        // Remover después de la animación
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, 7000);
    }

    /**
     * 🧠 Actualizar dato curioso matemático
     */
    updateMathFact() {
        const factElement = document.getElementById('math-fact');
        if (!factElement) return;
        
        const fact = this.mathFacts[this.currentFactIndex];
        this.currentFactIndex = (this.currentFactIndex + 1) % this.mathFacts.length;
        
        // Animación de transición
        factElement.style.transform = 'scale(0.9)';
        factElement.style.opacity = '0.5';
        
        setTimeout(() => {
            factElement.innerHTML = `
                <div style="
                    font-size: 0.9rem;
                    opacity: 0.9;
                    line-height: 1.4;
                ">${fact}</div>
            `;
            
            factElement.style.transform = 'scale(1)';
            factElement.style.opacity = '1';
            factElement.style.transition = 'all 0.3s ease';
        }, 150);
    }

    /**
     * 📊 Actualizar estadísticas del usuario
     */
    updateUserStats() {
        const statsElement = document.getElementById('user-stats');
        if (!statsElement) return;
        
        try {
            // Obtener datos reales del localStorage
            const progress = JSON.parse(localStorage.getItem('exercise_progress') || '[]');
            const totalExercises = progress.length;
            const correctAnswers = progress.filter(p => p.is_correct).length;
            const accuracy = totalExercises > 0 ? Math.round((correctAnswers / totalExercises) * 100) : 0;
            const points = correctAnswers * 10;
            const hours = Math.round(totalExercises * 0.05 * 10) / 10; // Estimación
            
            let level = 'Principiante';
            if (points >= 500) level = 'Experto Mágico';
            else if (points >= 200) level = 'Matemático Avanzado';
            else if (points >= 100) level = 'Aprendiz Brillante';
            
            const randomAchievement = this.achievements[Math.floor(Math.random() * this.achievements.length)]
                .replace('{exercises}', totalExercises)
                .replace('{hours}', hours)
                .replace('{accuracy}', accuracy)
                .replace('{points}', points)
                .replace('{level}', level);
            
            statsElement.innerHTML = `
                <div style="
                    font-size: 0.9rem;
                    opacity: 0.9;
                    line-height: 1.4;
                ">${randomAchievement}</div>
            `;
            
        } catch (error) {
            statsElement.innerHTML = `
                <div style="
                    font-size: 0.9rem;
                    opacity: 0.9;
                    line-height: 1.4;
                ">🎯 ¡Listo para una nueva aventura matemática!</div>
            `;
        }
    }

    /**
     * 🚀 Secuencia de progreso épica con 9 pasos
     */
    startEpicProgressSequence() {
        const steps = [
            { progress: 5, text: '🔮 Conectando con la magia...', delay: 600 },
            { progress: 15, text: '📚 Cargando libros mágicos...', delay: 500 },
            { progress: 28, text: '🧮 Preparando calculadora mágica...', delay: 600 },
            { progress: 42, text: '⭐ Reuniendo estrellas de sabiduría...', delay: 500 },
            { progress: 56, text: '🎨 Pintando números de colores...', delay: 600 },
            { progress: 70, text: '🏰 Construyendo tu castillo matemático...', delay: 500 },
            { progress: 85, text: '🎭 Preparando sorpresas mágicas...', delay: 500 },
            { progress: 95, text: '✨ Añadiendo los toques finales...', delay: 600 },
            { progress: 100, text: '🎉 ¡Todo listo para la magia!', delay: 800 }
        ];
        
        let currentStep = 0;
        
        const processStep = () => {
            if (currentStep < steps.length) {
                const step = steps[currentStep];
                
                // Actualizar progreso visual
                this.updateProgress(step.progress, step.text);
                
                // Efectos especiales en ciertos pasos
                if (step.progress === 50) {
                    this.createSparkleEffect();
                } else if (step.progress === 100) {
                    this.createConfettiEffect();
                }
                
                currentStep++;
                setTimeout(processStep, step.delay);
            } else {
                // Secuencia completada - ejecutar recarga
                setTimeout(() => {
                    this.executeReload();
                }, 1000);
            }
        };
        
        processStep();
    }

    /**
     * 📊 Actualizar progreso visual
     */
    updateProgress(percentage, statusText) {
        const progressBar = document.getElementById('epic-progress-bar');
        const percentageElement = document.getElementById('progress-percentage');
        const statusElement = document.getElementById('status-text');
        
        if (progressBar) {
            progressBar.style.width = percentage + '%';
        }
        
        if (percentageElement) {
            // Animación de contador
            const currentPercent = parseInt(percentageElement.textContent) || 0;
            this.animateCounter(percentageElement, currentPercent, percentage);
        }
        
        if (statusElement) {
            statusElement.style.transform = 'translateY(10px)';
            statusElement.style.opacity = '0.5';
            
            setTimeout(() => {
                statusElement.textContent = statusText;
                statusElement.style.transform = 'translateY(0)';
                statusElement.style.opacity = '1';
                statusElement.style.transition = 'all 0.3s ease';
            }, 150);
        }
        
        console.log(`✨ Progreso épico: ${percentage}% - ${statusText}`);
    }

    /**
     * 🔢 Animar contador de porcentaje
     */
    animateCounter(element, from, to) {
        const duration = 500;
        const start = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.round(from + (to - from) * progress);
            element.textContent = current + '%';
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    /**
     * ✨ Crear efecto de destellos
     */
    createSparkleEffect() {
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.textContent = '✨';
                sparkle.style.cssText = `
                    position: absolute;
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                    font-size: ${Math.random() * 20 + 15}px;
                    animation: sparkle 1s ease-out forwards;
                    pointer-events: none;
                    z-index: 15;
                `;
                
                this.currentOverlay.appendChild(sparkle);
                
                setTimeout(() => {
                    if (sparkle.parentNode) {
                        sparkle.parentNode.removeChild(sparkle);
                    }
                }, 1000);
            }, i * 50);
        }
    }

    /**
     * 🎊 Crear lluvia de confeti final
     */
    createConfettiEffect() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
        const emojis = ['🎉', '🎊', '⭐', '🌟', '✨', '🏆', '🎯', '💯'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                const isEmoji = Math.random() > 0.5;
                
                if (isEmoji) {
                    confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                    confetti.style.fontSize = Math.random() * 15 + 15 + 'px';
                } else {
                    confetti.style.cssText = `
                        width: ${Math.random() * 8 + 4}px;
                        height: ${Math.random() * 8 + 4}px;
                        background: ${colors[Math.floor(Math.random() * colors.length)]};
                    `;
                }
                
                confetti.style.cssText += `
                    position: absolute;
                    left: ${Math.random() * 100}%;
                    top: -20px;
                    animation: confetti ${Math.random() * 2 + 3}s linear forwards;
                    pointer-events: none;
                    z-index: 20;
                `;
                
                this.currentOverlay.appendChild(confetti);
                
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti);
                    }
                }, 5000);
            }, i * 50);
        }
    }

    /**
     * 🔄 Ejecutar recarga con múltiples métodos - MEJORADO
     */
    executeReload() {
        console.log('🎉 Secuencia épica completada, iniciando recarga');
        
        try {
            // ✅ NUEVO: Verificar si es un logout automático
            const currentURL = window.location.href;
            const isLogoutScenario = currentURL.includes('logout') || 
                                   localStorage.getItem('matemagica-pending-logout') === 'true';
            
            if (isLogoutScenario) {
                console.log('🚪 Detectado escenario de logout, redirigiendo a login...');
                localStorage.removeItem('matemagica-pending-logout');
                window.location.href = 'index.html';
                return;
            }
            
            // ✅ Recarga normal (código existente)
            window.location.reload(true);
        } catch (error1) {
            try {
                window.location.href = window.location.origin + '/dashboard.html';
            } catch (error2) {
                try {
                    window.location.replace(window.location.origin + '/dashboard.html');
                } catch (error3) {
                    this.remove();
                    alert('Por favor, recarga la página manualmente (F5 o Cmd+R)');
                }
            }
        }
    }

    // ✅ NUEVA FUNCIÓN ESPECÍFICA PARA LOGOUT AUTOMÁTICO
    showLogoutSequence(message = '🚪 Cerrando sesión...') {
        try {
            console.log('🚪 Iniciando secuencia de logout automático');
            
            // Marcar que es un logout
            localStorage.setItem('matemagica-pending-logout', 'true');
            
            // Usar la experiencia épica pero con mensajes de logout
            this.mathFacts = [
                "🔐 Cerrando sesión de forma segura...",
                "💾 Guardando tu progreso automáticamente...",
                "🧹 Limpiando datos temporales...",
                "🔄 Preparando para el próximo inicio...",
                "👋 ¡Hasta la próxima aventura matemática!"
            ];
            
            // Usar la función principal
            this.showLoadingAndReload(message);
            
        } catch (error) {
            console.error('❌ Error en secuencia de logout:', error);
            // Fallback directo
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    }

    /**
     * 📱 Fallback a pantalla simple
     */
    fallbackToSimple(message) {
        console.log('⚠️ Fallback a pantalla simple');
        
        // ...existing code... (método simple anterior)
        const loadingOverlay = document.createElement('div');
        loadingOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #EC4899 100%);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
        `;
        
        loadingOverlay.innerHTML = `
            <div class="text-center text-white p-8">
                <div class="text-4xl mb-4 animate-spin">🧮</div>
                <h2 class="text-xl font-bold mb-2">${message}</h2>
                <div class="animate-pulse text-blue-100">Por favor espera...</div>
            </div>
        `;
        
        this.currentOverlay = loadingOverlay;
        document.body.appendChild(loadingOverlay);
        
        setTimeout(() => {
            loadingOverlay.style.opacity = '1';
        }, 50);
        
        setTimeout(() => {
            this.executeReload();
        }, 3000);
    }

    /**
     * 🧹 Limpiar y remover pantalla de carga
     */
    remove() {
        // Detener animaciones
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        // Remover overlay
        if (this.currentOverlay) {
            try {
                this.currentOverlay.style.opacity = '0';
                setTimeout(() => {
                    if (this.currentOverlay && this.currentOverlay.parentNode) {
                        this.currentOverlay.parentNode.removeChild(this.currentOverlay);
                    }
                    this.currentOverlay = null;
                }, 300);
            } catch (error) {
                console.error('❌ Error removiendo pantalla épica:', error);
            }
        }
        
        // Limpiar datos
        this.mathElements = [];
        this.confettiParticles = [];
        this.stars = [];
    }

    /**
     * 📱 Pantalla simple sin recarga (para otros usos)
     */
    show(message = 'Cargando...', duration = null) {
        this.fallbackToSimple(message);
        
        if (duration) {
            setTimeout(() => {
                this.remove();
            }, duration);
        }
    }

    /**
     * 🔍 Verificar si está activa
     */
    isActive() {
        return this.currentOverlay !== null;
    }
}

// 🌟 Crear instancia global
window.loadingScreen = new LoadingScreen();

// 🔗 Función global para compatibilidad
window.showLoadingAndReload = function(message) {
    if (window.loadingScreen) {
        window.loadingScreen.showLoadingAndReload(message);
    } else {
        console.warn('LoadingScreen no disponible, usando fallback');
        window.location.reload(true);
    }
};

// 📦 Exportar para compatibilidad con módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoadingScreen;
}