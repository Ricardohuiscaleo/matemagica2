# 🚀 Configuración y Deployment - Matemágica PWA

## Configuración Actual (Funcionando)

### Supabase Database
```
URL: https://uznvakpuuxnpdhoejrog.supabase.co
Proyecto: matemagica-pwa
Estado: ✅ OPERATIVO
```

### Google OAuth
```
Client ID: 531902921465-4j3o9nhpsaqd4lkq453jfvg1so52pa2l.apps.googleusercontent.com
Estado: ✅ FUNCIONANDO para localhost
```

### URLs Autorizadas (Google Console)
```
Authorized JavaScript origins:
- http://localhost:3000
- http://localhost:8080
- http://localhost:5173

Authorized redirect URIs:
- https://uznvakpuuxnpdhoejrog.supabase.co/auth/v1/callback
```

## Base de Datos

### Tablas Principales
```sql
-- Usuarios
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    user_role TEXT CHECK (user_role IN ('teacher', 'parent')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Perfiles de estudiantes
CREATE TABLE student_profiles (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    student_name TEXT NOT NULL,
    grade INTEGER CHECK (grade BETWEEN 1 AND 4),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Ejercicios generados
CREATE TABLE exercises (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    student_name TEXT,
    difficulty_level TEXT,
    exercise_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Row Level Security (RLS)
- ✅ Habilitado en todas las tablas
- ✅ Políticas configuradas por usuario
- ✅ Acceso solo a datos propios

## PWA Configuration

### Manifest.json
```json
{
    "name": "Matemágica PWA",
    "short_name": "Matemágica",
    "theme_color": "#2563eb",
    "background_color": "#ffffff",
    "display": "standalone",
    "orientation": "portrait",
    "scope": "/",
    "start_url": "/"
}
```

### Service Worker
- **Cache Strategy**: Cache First para recursos estáticos
- **Network Strategy**: Network First para datos dinámicos
- **Offline Fallback**: Plantillas locales de ejercicios

## Comandos de Desarrollo

### Servidor Local
```bash
# Python
python -m http.server 8080

# Node.js (si tienes live-server)
npx live-server --port=8080

# PHP
php -S localhost:8080
```

### Build CSS (si usas Tailwind local)
```bash
npm run build-css
# O manualmente:
npx tailwindcss -i src/input.css -o public/styles.css --watch
```

### Generar Iconos
```bash
# Usar script automatizado
./generate-icons.sh

# O usar el generador web
open generate-icons-browser.js en navegador
```

## Deployment Options

### 1. GitHub Pages
```bash
# 1. Subir código a GitHub
git add .
git commit -m "PWA lista para producción"
git push origin main

# 2. Activar GitHub Pages en Settings
# 3. Configurar dominio personalizado (opcional)
```

### 2. Netlify
```bash
# 1. Conectar repositorio GitHub
# 2. Build settings:
#    - Build command: npm run build (si usas)
#    - Publish directory: . (raíz)
# 3. Deploy automático
```

### 3. Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configuración automática para SPA
```

## Variables de Entorno para Producción

### Supabase (ya configurado)
```javascript
SUPABASE_URL=https://uznvakpuuxnpdhoejrog.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs... (válido hasta 2035)
```

### Google OAuth (requiere actualización para producción)
```javascript
// Para producción, agregar tu dominio:
GOOGLE_CLIENT_ID=531902921465-4j3o9nhpsaqd4lkq453jfvg1so52pa2l.apps.googleusercontent.com
PRODUCTION_DOMAIN=https://matematica.tudominio.com
```

## Checklist Pre-Producción

### ✅ Completado
- [x] Autenticación Google + Supabase funcionando
- [x] PWA installable con iconos completos
- [x] Responsive design optimizado
- [x] Service Worker con cache
- [x] Offline functionality
- [x] Base de datos con RLS
- [x] Sistema de roles implementado

### 🔄 Pendiente para Producción
- [ ] Actualizar Google OAuth con dominio de producción
- [ ] Configurar HTTPS certificado
- [ ] Optimizar imágenes y recursos
- [ ] Implementar analytics (opcional)
- [ ] Configurar backup automático de BD
- [ ] Testing en múltiples dispositivos

## Performance

### Lighthouse Score Esperado
- **Performance**: 90+ (PWA optimizada)
- **Accessibility**: 95+ (Diseño child-friendly)
- **Best Practices**: 90+ (Buenas prácticas implementadas)
- **SEO**: 90+ (Meta tags correctos)
- **PWA**: 100 (Todos los requisitos PWA)

### Optimizaciones Implementadas
- CSS personalizado sin frameworks pesados
- Imágenes optimizadas (WebP cuando sea posible)
- Lazy loading en recursos no críticos
- Cache inteligente con Service Worker
- Minificación automática en build

## Backup y Versionado

### Git Workflow Recomendado
```bash
# Crear rama para nuevas features
git checkout -b feature/nueva-funcionalidad

# Desarrollo y commits
git add .
git commit -m "feat: descripción de la funcionalidad"

# Merge a main cuando esté listo
git checkout main
git merge feature/nueva-funcionalidad

# Tag para releases
git tag -a v2.0 -m "Autenticación estable"
git push origin v2.0
```

### Backup Base de Datos
```sql
-- Backup manual desde Supabase Dashboard
-- O usando CLI:
supabase db dump --db-url "postgresql://..."
```

## Monitoreo

### Logs Importantes
```javascript
// En producción, configurar:
console.log = production ? () => {} : console.log; // Silenciar logs
```

### Métricas a Seguir
- Tiempo de carga inicial
- Tasa de instalación PWA
- Errores de autenticación
- Uso de funcionalidades
- Dispositivos más usados

## URLs de Gestión

### Supabase Dashboard
https://supabase.com/dashboard/project/uznvakpuuxnpdhoejrog

### Google Cloud Console
https://console.cloud.google.com/apis/credentials

### Dominio de Producción (cuando esté listo)
https://matematica.tudominio.com

---

**Estado**: ✅ Listo para deployment
**Última actualización**: 7 de junio de 2025
**Próximo paso**: Configurar dominio de producción