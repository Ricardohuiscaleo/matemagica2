// Script mejorado para crear iconos PNG atractivos para Matemágica PWA
// Diseño colorido y amigable para niños de 7-8 años

function createMathematicaIcon(size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Fondo con gradiente amarillo-naranja (más cálido y amigable)
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#f59e0b'); // Amarillo
    gradient.addColorStop(0.5, '#f97316'); // Naranja
    gradient.addColorStop(1, '#ea580c'); // Naranja oscuro
    
    // Dibujar fondo redondeado
    ctx.fillStyle = gradient;
    roundRect(ctx, 0, 0, size, size, size * 0.2);
    
    // Agregar sombra interior para profundidad
    const shadowGradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    shadowGradient.addColorStop(0, 'rgba(255,255,255,0.3)');
    shadowGradient.addColorStop(1, 'rgba(0,0,0,0.1)');
    ctx.fillStyle = shadowGradient;
    roundRect(ctx, 0, 0, size, size, size * 0.2);
    
    // Dibujar elementos matemáticos divertidos
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = size * 0.02;
    
    if (size >= 192) {
        // Para iconos grandes - diseño complejo
        drawLargeIcon(ctx, size);
    } else if (size >= 96) {
        // Para iconos medianos - diseño intermedio
        drawMediumIcon(ctx, size);
    } else {
        // Para iconos pequeños - diseño simple
        drawSmallIcon(ctx, size);
    }
    
    return canvas;
}

function drawLargeIcon(ctx, size) {
    // Número "+" grande
    ctx.font = `bold ${size * 0.25}px "Comic Sans MS", cursive`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Sombra del texto
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillText('+', size * 0.3 + 2, size * 0.35 + 2);
    
    // Texto principal
    ctx.fillStyle = '#ffffff';
    ctx.fillText('+', size * 0.3, size * 0.35);
    
    // Número "=" 
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillText('=', size * 0.7 + 2, size * 0.35 + 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('=', size * 0.7, size * 0.35);
    
    // Números ejemplo "7 + 3 = 10"
    ctx.font = `bold ${size * 0.15}px "Comic Sans MS", cursive`;
    ctx.fillStyle = '#1e293b';
    ctx.fillText('7', size * 0.2, size * 0.65);
    ctx.fillText('3', size * 0.8, size * 0.65);
    ctx.fillText('10', size * 0.5, size * 0.8);
    
    // Estrellitas decorativas
    drawStar(ctx, size * 0.15, size * 0.15, size * 0.08, '#fff');
    drawStar(ctx, size * 0.85, size * 0.15, size * 0.06, '#fff');
    drawStar(ctx, size * 0.15, size * 0.85, size * 0.06, '#fff');
    drawStar(ctx, size * 0.85, size * 0.85, size * 0.08, '#fff');
}

function drawMediumIcon(ctx, size) {
    // Símbolo "+" central grande
    ctx.font = `bold ${size * 0.4}px "Comic Sans MS", cursive`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Sombra
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillText('+', size/2 + 2, size/2 + 2);
    
    // Texto principal
    ctx.fillStyle = '#ffffff';
    ctx.fillText('+', size/2, size/2);
    
    // Números pequeños en las esquinas
    ctx.font = `bold ${size * 0.15}px Arial`;
    ctx.fillStyle = '#1e293b';
    ctx.fillText('1', size * 0.2, size * 0.2);
    ctx.fillText('2', size * 0.8, size * 0.2);
    ctx.fillText('3', size * 0.2, size * 0.8);
    ctx.fillText('=', size * 0.8, size * 0.8);
}

function drawSmallIcon(ctx, size) {
    // Solo un símbolo "+" simple y claro
    ctx.font = `bold ${size * 0.6}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Sombra
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillText('+', size/2 + 1, size/2 + 1);
    
    // Texto principal
    ctx.fillStyle = '#ffffff';
    ctx.fillText('+', size/2, size/2);
}

function drawStar(ctx, x, y, size, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.beginPath();
    
    for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5;
        const x1 = Math.cos(angle) * size;
        const y1 = Math.sin(angle) * size;
        const x2 = Math.cos(angle + Math.PI / 5) * size * 0.4;
        const y2 = Math.sin(angle + Math.PI / 5) * size * 0.4;
        
        if (i === 0) ctx.moveTo(x1, y1);
        else ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
    }
    
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}

// Función para generar y descargar todos los iconos
function generateAllIcons() {
    const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
    let downloaded = 0;
    
    console.log('🎨 Generando iconos mejorados para Matemágica...');
    
    sizes.forEach((size, index) => {
        setTimeout(() => {
            const canvas = createMathematicaIcon(size);
            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `icon-${size}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                downloaded++;
                console.log(`✅ Descargado: icon-${size}.png (${downloaded}/${sizes.length})`);
                
                if (downloaded === sizes.length) {
                    console.log('🎉 ¡Todos los iconos generados! Súbelos a la carpeta /icons/');
                }
            }, 'image/png', 1.0);
        }, index * 500); // Esperar 500ms entre descargas
    });
}

// También crear un apple-touch-icon específico para iOS
function generateAppleTouchIcon() {
    const canvas = createMathematicaIcon(180);
    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'apple-touch-icon.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log('🍎 Apple Touch Icon generado');
    }, 'image/png', 1.0);
}

// Función para probar un icono en vivo
function previewIcon(size = 192) {
    const canvas = createMathematicaIcon(size);
    canvas.style.border = '2px solid #ccc';
    canvas.style.borderRadius = '8px';
    canvas.style.margin = '10px';
    document.body.appendChild(canvas);
    console.log(`👀 Vista previa del icono ${size}x${size} agregada a la página`);
}

// Instrucciones de uso
console.log(`
🎨 GENERADOR DE ICONOS MATEMÁGICA
================================

Para usar este script:

1. Abre las DevTools (F12)
2. Pega este código en la consola
3. Ejecuta: generateAllIcons()
4. Se descargarán todos los iconos PNG
5. Sube los archivos a tu carpeta /icons/
6. Opcional: generateAppleTouchIcon() para iOS

Para vista previa: previewIcon(192)
`);