# Matemágica PWA 🧮✨

## Descripción
Progressive Web App para generar ejercicios de matemáticas (sumas y restas) con inteligencia artificial, diseñada especialmente para estudiantes de primaria.

## Características
- ✨ **Generación automática** de ejercicios con IA (Google Gemini)
- 📱 **PWA instalable** - funciona offline
- 🎨 **Interfaz amigable** para niños
- 📚 **Cuentos matemáticos** interactivos
- 📄 **Exportación a PDF** para imprimir
- 🎯 **3 niveles de dificultad**
- 💾 **Funcionamiento offline** con ejercicios guardados

## Configuración inicial

### 1. API Key de Google Gemini
Para que funcione la generación de ejercicios con IA, necesitas configurar tu API key:

1. Ve a [Google AI Studio](https://aistudio.google.com/)
2. Obtén tu API key
3. Abre el archivo `app.js`
4. Busca la línea `const API_KEY = "";`
5. Reemplaza las comillas vacías con tu API key:
   ```javascript
   const API_KEY = "tu-api-key-aqui";
   ```

### 2. Iconos PNG
Los iconos están en formato SVG. Para que funcionen correctamente como PWA, conviértelos a PNG:
- `icons/icon-192.svg` → `icons/icon-192.png`
- `icons/icon-512.svg` → `icons/icon-512.png`

Puedes usar herramientas online como [CloudConvert](https://cloudconvert.com/svg-to-png) o cualquier editor de imágenes.

## Ejecutar localmente

```bash
# Opción 1: Con Python
python3 -m http.server 8000

# Opción 2: Con Node.js
npm start

# Luego abrir: http://localhost:8000
```

## Despliegue

### GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/matematica-pwa.git
git push -u origin main
```

### Netlify
1. Conecta tu repositorio de GitHub a Netlify
2. Configura:
   - Build command: `npm run build`
   - Publish directory: `./`
3. Deploya

### Variables de entorno en Netlify
Para mayor seguridad, puedes configurar la API key como variable de entorno:
1. En Netlify: Site settings → Environment variables
2. Agregar: `VITE_GEMINI_API_KEY` = tu-api-key
3. Modificar `app.js` para usar: `import.meta.env.VITE_GEMINI_API_KEY`

## Estructura del proyecto
```
Matemágica/
├── index.html          # Página principal
├── app.js             # Lógica de la aplicación
├── manifest.json      # Configuración PWA
├── sw.js             # Service Worker
├── package.json      # Configuración del proyecto
├── icons/            # Iconos de la aplicación
│   ├── icon-192.svg
│   ├── icon-512.svg
│   ├── icon-192.png  # (crear)
│   └── icon-512.png  # (crear)
├── .github/
│   └── copilot-instructions.md
└── README.md
```

## Características técnicas
- **PWA** con Service Worker para funcionamiento offline
- **LocalStorage** para guardar ejercicios y configuraciones
- **Responsive Design** con Tailwind CSS
- **Generación de PDF** con jsPDF y html2canvas
- **API de Google Gemini** para generar contenido con IA

## Funcionalidades offline
- Ejercicios guardados localmente
- Plantillas de cuentos predefinidas
- Retroalimentación básica sin IA
- Interfaz completamente funcional

## Soporte de navegadores
- Chrome/Edge 90+
- Firefox 90+
- Safari 14+
- Dispositivos móviles iOS/Android

## Licencia
MIT - Libre para uso educativo

---
Creado con ❤️ por Ricardo Huiscaleo para el aprendizaje de matemáticas