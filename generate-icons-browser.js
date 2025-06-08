// Script para crear iconos PNG básicos usando Canvas API
// Ejecutar en el navegador para generar iconos temporales

function createMathIcon(size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Fondo con gradiente azul
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(1, '#1d4ed8');
    
    // Dibujar fondo redondeado
    ctx.fillStyle = gradient;
    roundRect(ctx, 0, 0, size, size, size * 0.15);
    
    // Símbolo matemático central
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${size * 0.4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🧮', size/2, size/2);
    
    // Agregar texto "M" si es muy pequeño para emoji
    if (size < 96) {
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${size * 0.6}px Arial`;
        ctx.fillText('M', size/2, size/2);
    }
    
    return canvas;
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

// Generar y descargar iconos
function generateIcons() {
    const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
    
    sizes.forEach(size => {
        const canvas = createMathIcon(size);
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `icon-${size}.png`;
            a.click();
            URL.revokeObjectURL(url);
        });
    });
}

// Para ejecutar: generateIcons(); en la consola del navegador