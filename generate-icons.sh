#!/bin/bash
# Script para generar iconos PNG desde SVG para Matemágica PWA
# Requiere ImageMagick (brew install imagemagick en macOS)

echo "🎨 Generando iconos PNG para Matemágica PWA..."

# Verificar si ImageMagick está instalado
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick no está instalado."
    echo "📦 Para instalar en macOS: brew install imagemagick"
    echo "📦 Para instalar en Ubuntu: sudo apt-get install imagemagick"
    exit 1
fi

# Crear directorio de iconos si no existe
mkdir -p icons

# Tamaños de iconos necesarios para PWA
sizes=(72 96 128 144 152 192 384 512)

# Verificar si existe el SVG base
if [ ! -f "icons/icon-192.svg" ]; then
    echo "⚠️ No se encontró icons/icon-192.svg"
    echo "📝 Creando icono SVG básico..."
    
    # Crear SVG básico si no existe
    cat > icons/icon-192.svg << 'EOF'
<svg width="192" height="192" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Fondo con gradiente -->
  <rect width="192" height="192" rx="32" fill="url(#bg)"/>
  
  <!-- Números matemáticos decorativos -->
  <text x="30" y="50" font-family="Arial Black" font-size="24" fill="#fbbf24" opacity="0.3">+</text>
  <text x="140" y="40" font-family="Arial Black" font-size="20" fill="#fbbf24" opacity="0.3">×</text>
  <text x="160" y="160" font-family="Arial Black" font-size="24" fill="#fbbf24" opacity="0.3">-</text>
  <text x="20" y="170" font-family="Arial Black" font-size="20" fill="#fbbf24" opacity="0.3">÷</text>
  
  <!-- Símbolo principal de calculadora/matemáticas -->
  <rect x="56" y="56" width="80" height="80" rx="12" fill="#ffffff" opacity="0.95"/>
  
  <!-- Pantalla de calculadora -->
  <rect x="64" y="64" width="64" height="24" rx="4" fill="#1f2937"/>
  <text x="96" y="82" font-family="Arial Black" font-size="14" fill="#10b981" text-anchor="middle">123</text>
  
  <!-- Botones de calculadora -->
  <circle cx="74" cy="106" r="6" fill="#3b82f6"/>
  <circle cx="96" cy="106" r="6" fill="#3b82f6"/>
  <circle cx="118" cy="106" r="6" fill="#3b82f6"/>
  
  <circle cx="74" cy="120" r="6" fill="#3b82f6"/>
  <circle cx="96" cy="120" r="6" fill="#3b82f6"/>
  <circle cx="118" cy="120" r="6" fill="#f59e0b"/>
  
  <!-- Texto del logo -->
  <text x="96" y="155" font-family="Arial Black" font-size="12" fill="#ffffff" text-anchor="middle" font-weight="bold">MATEMÁGICA</text>
</svg>
EOF
fi

# Generar iconos PNG en todos los tamaños
for size in "${sizes[@]}"; do
    echo "📱 Generando icono ${size}x${size}..."
    convert icons/icon-192.svg -resize ${size}x${size} -background none icons/icon-${size}.png
    
    if [ $? -eq 0 ]; then
        echo "✅ icons/icon-${size}.png creado"
    else
        echo "❌ Error creando icons/icon-${size}.png"
    fi
done

# Crear favicon.ico desde el icono de 32px
echo "🌐 Generando favicon.ico..."
convert icons/icon-192.svg -resize 32x32 -background none favicon.ico

# Crear apple-touch-icon
echo "🍎 Generando apple-touch-icon..."
convert icons/icon-192.svg -resize 180x180 -background none apple-touch-icon.png

echo ""
echo "🎉 ¡Iconos generados exitosamente!"
echo "📁 Archivos creados:"
ls -la icons/*.png 2>/dev/null || echo "❌ No se pudieron crear los archivos PNG"
echo ""
echo "🔧 Próximos pasos:"
echo "1. Reinicia el servidor local"
echo "2. Recarga la página en el navegador"
echo "3. Los errores 404 de iconos deberían desaparecer"