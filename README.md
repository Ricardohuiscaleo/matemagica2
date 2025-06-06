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

# Matemágica PWA - Estado de la Implementación de Autenticación con Supabase

## 🎯 Estado Actual: **95% COMPLETADO** ✅

La implementación de autenticación con Supabase está **prácticamente lista**. Solo necesitas configurar tus credenciales de Supabase para que funcione completamente.

## 📋 ¿Qué está implementado?

### ✅ **COMPLETADO**
- **Base de datos SQL completa** (`database-schema.sql`)
  - Tablas: profiles, exercise_sessions, story_attempts, user_progress
  - Políticas de seguridad RLS
  - Triggers automáticos
  - Índices optimizados

- **Sistema de autenticación robusto** (`supabase-config.js`)
  - Registro e inicio de sesión
  - Gestión de perfiles de usuario
  - Guardado de progreso en tiempo real
  - Fallbacks offline

- **Interfaz de usuario completa** (`index.html`)
  - Modales de login, registro y perfil
  - Barra de autenticación con avatar
  - Integración visual perfecta

- **Gestor de autenticación** (`auth-manager.js`)
  - Clase AuthManager completa
  - Manejo de eventos de autenticación
  - Sincronización con UI
  - Gestión de preferencias de usuario

- **Integración con la aplicación principal** (`app.js`)
  - Guardado automático de ejercicios en Supabase
  - Sincronización de preferencias de usuario
  - Modo offline como fallback

## 🔧 ¿Qué necesitas hacer para activarlo?

### 1. **Crear proyecto en Supabase** (5 minutos)
```bash
1. Ve a https://supabase.com
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto
4. Anota la URL y la clave API
```

### 2. **Configurar credenciales** 
Edita el archivo `supabase-credentials.js`:
```javascript
// Reemplaza estos valores:
export const SUPABASE_URL = 'https://tu-proyecto-real.supabase.co';
export const SUPABASE_ANON_KEY = 'tu-clave-real-aqui';
export const SUPABASE_CONFIGURED = true; // Cambiar a true
```

### 3. **Ejecutar el schema SQL**
```sql
-- Copia y pega todo el contenido de database-schema.sql
-- en el SQL Editor de Supabase
```

### 4. **¡Listo!** 🎉

## 🌟 Características incluidas

### Para los estudiantes:
- **Registro simple** con nombre y email
- **Perfil personalizable** con avatar emoji
- **Estadísticas de progreso** (ejercicios resueltos, precisión)
- **Guardado automático** de todo su progreso
- **Funcionamiento offline** si no hay conexión

### Para el desarrollo:
- **Seguridad robusta** con RLS (Row Level Security)
- **Escalabilidad** preparada para miles de usuarios
- **Backup automático** en localStorage
- **Manejo de errores** graceful
- **Código modular** y bien documentado

## 🔄 Flujo de autenticación

1. **Usuario nuevo**: Registro → Perfil automático → Preferencias guardadas
2. **Usuario existente**: Login → Carga de preferencias → Sincronización
3. **Ejercicios**: Generación → Resolución → Guardado en Supabase + localStorage
4. **Cuentos**: Creación → Respuesta → Estadísticas actualizadas
5. **Offline**: Funcionalidad completa usando datos locales

## 🛡️ Seguridad implementada

- **Autenticación segura** con Supabase Auth
- **Aislamiento de datos** por usuario (RLS)
- **Validación de entrada** en frontend y backend
- **Sanitización** de datos antes de guardar
- **Passwords hasheados** automáticamente por Supabase

## 📊 Datos que se guardan

### Perfil del estudiante:
- Nombre completo
- Avatar (emoji)
- Nivel preferido (1-3)
- Operación favorita (+/-)
- Estadísticas totales

### Progreso de ejercicios:
- Fecha y hora de cada sesión
- Nivel utilizado
- Cantidad de sumas y restas
- Datos completos de ejercicios

### Intentos de cuentos:
- Texto del cuento generado
- Operación matemática
- Respuesta del estudiante
- Si fue correcta o no

## 🚀 Próximos pasos opcionales

Una vez que tengas Supabase funcionando, podrías agregar:
- Dashboard para padres/maestros
- Reportes de progreso
- Gamificación con logros
- Compartir ejercicios entre usuarios
- Modo multijugador

## 🔍 Troubleshooting

### Si algo no funciona:
1. **Revisa la consola** del navegador (F12)
2. **Verifica las credenciales** en `supabase-credentials.js`
3. **Confirma que el schema SQL** se ejecutó correctamente
4. **La app funciona sin autenticación** si hay problemas

### Errores comunes:
- "Supabase no está cargado" → Verifica el CDN en index.html
- "Project not found" → Revisa la URL del proyecto
- "Invalid API key" → Verifica la clave anónima

## 💡 Notas para desarrolladores

- El código está preparado para **desarrollo y producción**
- **Variables de entorno** soportadas para mayor seguridad
- **TypeScript ready** si quieres migrar en el futuro
- **PWA compatible** con instalación offline
- **Mobile-first** responsive design

---

**¡Tu implementación de autenticación está lista para usar!** 🎉

Solo configura Supabase y tendrás una aplicación educativa completa con autenticación en la nube, estadísticas de progreso y modo offline.