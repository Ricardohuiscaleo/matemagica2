# 📁 Estructura de Archivos - Matemágica PWA

## Archivos Principales

### Core Application
```
📄 index.html              # Interfaz principal + configuración
📄 app.js                  # Lógica de la aplicación
📄 auth-manager.js          # Sistema de autenticación v2.0
📄 supabase-config.js       # Configuración de Supabase
📄 sw.js                   # Service Worker para PWA
📄 manifest.json           # Manifiesto PWA
```

### Estilos y Recursos
```
📁 public/
  📄 styles.css             # CSS personalizado (sin dependencias)
📁 icons/                  # Iconos PWA completos
  📄 icon-72.png
  📄 icon-96.png
  📄 icon-128.png
  📄 icon-144.png
  📄 icon-152.png
  📄 icon-192.png
  📄 icon-384.png
  📄 icon-512.png
  📄 icon-192.svg
  📄 icon-512.svg
📄 apple-touch-icon.png    # Icono iOS
📄 favicon.ico             # Favicon web
```

### Base de Datos
```
📁 supabase/
  📁 migrations/
    📄 20250607173358_remote_schema.sql
    📄 20250607173408_crear_tablas_matematica_pwa.sql
    📄 20250607180000_recrear_tablas_completas.sql
📄 database-schema.sql     # Esquema completo
📄 supabase-update.sql     # Actualizaciones
📄 test-data.sql           # Datos de prueba
```

### Configuración y Build
```
📄 package.json            # Dependencias y scripts
📄 tailwind.config.js      # Configuración Tailwind
📄 generate-icons.sh       # Script para generar iconos
📄 generate-icons-browser.js # Generador web de iconos
```

### Documentación
```
📁 documentacion/
  📄 README.md              # Documentación principal
  📄 autenticacion.md       # Sistema de auth técnico
  📄 archivos.md            # Este archivo
```

## Descripción de Archivos Clave

### index.html
- **Propósito**: UI principal y configuración inicial
- **Características**:
  - Pantallas de bienvenida, selección de estudiante, auth y app
  - Configuración de Supabase y Google OAuth
  - Links a CDNs (Google Fonts, Supabase, Google Sign-In)
  - Meta tags para PWA

### auth-manager.js (798 líneas)
- **Propósito**: Sistema completo de autenticación
- **Características**:
  - Gestión de pantallas y navegación
  - Integración Google OAuth + Supabase
  - Manejo de roles (profesor/apoderado)
  - Persistencia de sesiones
  - Prevención de bucles infinitos

### supabase-config.js (450+ líneas)
- **Propósito**: Configuración y servicios de Supabase
- **Características**:
  - Cliente de Supabase inicializado
  - AuthService con métodos OAuth
  - Listeners de cambios de estado
  - Manejo de errores y timeouts

### app.js
- **Propósito**: Lógica principal de la aplicación
- **Características**:
  - Generación de ejercicios matemáticos
  - Manejo de niveles de dificultad
  - Exportación a PDF
  - Almacenamiento local
  - Limpieza automática

### public/styles.css (500+ líneas)
- **Propósito**: Estilos CSS personalizados
- **Características**:
  - Variables CSS para colores
  - Utilidades tipo Tailwind
  - Responsive design
  - Animaciones y transiciones
  - Estilos específicos para ejercicios

### sw.js
- **Propósito**: Service Worker para PWA
- **Características**:
  - Cache de recursos estáticos
  - Estrategias de cache
  - Funcionamiento offline
  - Actualizaciones automáticas

## Archivos Eliminados/Deprecados

### ❌ Removidos en esta versión
```
📄 supabase-credentials.js  # ❌ Eliminado (credenciales duplicadas)
📄 integrated-auth.js       # ❌ Eliminado (conflicto de auth)
```

## Estado de Dependencias

### CDNs Utilizados
```html
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Pacifico&display=swap" rel="stylesheet">

<!-- Supabase -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<!-- Google Sign-In -->
<script src="https://accounts.google.com/gsi/client" async defer></script>

<!-- PDF Generation -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
```

### Package.json
- **Tailwind CSS**: Para desarrollo local
- **Scripts**: Build y desarrollo
- **Sin dependencias runtime**: Todo funciona con CDNs

## Tamaños de Archivos (Estimados)

| Archivo | Tamaño | Descripción |
|---------|--------|-------------|
| index.html | ~15KB | UI completa + config |
| auth-manager.js | ~25KB | Sistema de auth |
| supabase-config.js | ~15KB | Configuración Supabase |
| app.js | ~20KB | Lógica principal |
| public/styles.css | ~18KB | Estilos completos |
| sw.js | ~5KB | Service Worker |
| Icons totales | ~200KB | Todos los iconos PWA |

**Total aplicación**: ~300KB (muy liviana para PWA)

## Estructura Recomendada para Producción

```
📁 matemagica-pwa/
├── 📄 index.html
├── 📄 manifest.json
├── 📄 sw.js
├── 📁 js/
│   ├── 📄 app.js
│   ├── 📄 auth-manager.js
│   └── 📄 supabase-config.js
├── 📁 css/
│   └── 📄 styles.css
├── 📁 icons/
│   └── 📄 [todos los iconos]
└── 📁 docs/
    └── 📄 [documentación]
```