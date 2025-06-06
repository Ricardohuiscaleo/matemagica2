<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Matemágica PWA - Instrucciones para Copilot

## Contexto del proyecto
Esta es una Progressive Web App (PWA) educativa para generar ejercicios de matemáticas con IA, dirigida a estudiantes de primaria (7-8 años).

## Tecnologías utilizadas
- **Frontend**: HTML5, CSS3 (Tailwind), JavaScript vanilla
- **PWA**: Service Worker, Web App Manifest
- **IA**: Google Gemini API para generar ejercicios y cuentos
- **PDF**: jsPDF + html2canvas
- **Almacenamiento**: LocalStorage para funcionalidad offline

## Estilo de código preferido
- JavaScript ES6+ moderno
- Funciones async/await para APIs
- Naming en español para variables de UI
- Comentarios en español
- Responsive design mobile-first
- Manejo de errores graceful con fallbacks offline

## Características específicas
- **Audiencia**: Niños de 7-8 años (interfaz simple y colorida)
- **Operaciones**: Solo sumas y restas de 2 dígitos
- **3 niveles**: Fácil (sin reserva), Medio (con reserva), Difícil (mixto)
- **Offline-first**: Debe funcionar sin conexión usando datos guardados
- **PWA**: Instalable en dispositivos móviles

## Patrones de diseño
- Modularidad con funciones específicas
- Event listeners centralizados
- Manejo de estados con clases CSS
- Caching estratégico en Service Worker
- Feedback visual inmediato para todas las acciones

## APIs y servicios
- Google Gemini API para generación de contenido
- Esquemas JSON estructurados para ejercicios
- Plantillas offline como fallback
- LocalStorage para persistencia

## Consideraciones especiales
- Siempre incluir modo offline/fallback
- Validación de entrada numérica
- Mensajes de error amigables para niños
- Interfaz táctil optimizada
- Colores y fuentes child-friendly