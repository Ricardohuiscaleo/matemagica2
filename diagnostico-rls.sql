-- 🔍 DIAGNÓSTICO COMPLETO DE RLS Y PERFILES
-- Ejecutar este script en Supabase SQL Editor

-- 1. VERIFICAR TODOS LOS PERFILES EN PROFILES
SELECT 
    '=== TODOS LOS PERFILES EN PROFILES ===' as seccion,
    COUNT(*) as total_profiles
FROM profiles;

SELECT 
    id,
    email,
    full_name,
    is_subscribed,
    created_at,
    'profiles' as tabla_origen
FROM profiles 
ORDER BY created_at DESC;

-- 2. VERIFICAR TODOS LOS PERFILES EN MATH_PROFILES
SELECT 
    '=== TODOS LOS PERFILES EN MATH_PROFILES ===' as seccion,
    COUNT(*) as total_math_profiles
FROM math_profiles;

SELECT 
    id,
    user_id,
    email,
    full_name,
    user_role,
    created_at,
    'math_profiles' as tabla_origen
FROM math_profiles 
ORDER BY created_at DESC;

-- 3. BUSCAR ESPECÍFICAMENTE A FRANCISCA
SELECT 
    '=== FRANCISCA EN PROFILES ===' as seccion;

SELECT 
    id,
    email,
    full_name,
    avatar_url,
    is_subscribed,
    created_at,
    'profiles' as tabla_origen
FROM profiles 
WHERE email = 'franita90@gmail.com';

SELECT 
    '=== FRANCISCA EN MATH_PROFILES ===' as seccion;

SELECT 
    id,
    user_id,
    email,
    full_name,
    user_role,
    created_at,
    'math_profiles' as tabla_origen
FROM math_profiles 
WHERE email = 'franita90@gmail.com';

-- 4. VERIFICAR POLÍTICAS RLS ACTIVAS
SELECT 
    '=== POLÍTICAS RLS ACTIVAS ===' as seccion;

SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'math_profiles', 'user_roles');

-- 5. LISTAR POLÍTICAS ESPECÍFICAS
SELECT 
    '=== POLÍTICAS ESPECÍFICAS ===' as seccion;

SELECT 
    pol.polname as policy_name,
    pol.polcmd as command,
    pol.polroles as roles,
    pol.polqual as using_expression,
    pol.polwithcheck as with_check_expression,
    pgc.relname as table_name
FROM pg_policy pol
JOIN pg_class pgc ON pol.polrelid = pgc.oid
WHERE pgc.relname IN ('profiles', 'math_profiles', 'user_roles')
ORDER BY pgc.relname, pol.polname;

-- 6. VERIFICAR USUARIO ACTUAL Y ROLES
SELECT 
    '=== INFORMACIÓN DE USUARIO ACTUAL ===' as seccion,
    current_user as usuario_actual,
    session_user as usuario_sesion;

-- 7. ESTADÍSTICAS POR ROL EN MATH_PROFILES
SELECT 
    '=== ESTADÍSTICAS POR ROL ===' as seccion;

SELECT 
    user_role,
    COUNT(*) as cantidad
FROM math_profiles 
GROUP BY user_role
ORDER BY cantidad DESC;

-- 8. ÚLTIMOS 10 REGISTROS CREADOS
SELECT 
    '=== ÚLTIMOS 10 REGISTROS CREADOS ===' as seccion;

SELECT 
    email,
    full_name,
    user_role,
    created_at,
    'math_profiles' as tabla
FROM math_profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- 9. BUSCAR TODOS LOS EMAILS CON 'FRANITA'
SELECT 
    '=== BÚSQUEDA FRANITA EN TODAS LAS TABLAS ===' as seccion;

SELECT 
    email,
    full_name,
    'profiles' as tabla_origen
FROM profiles 
WHERE email ILIKE '%franita%' OR full_name ILIKE '%francisca%';

SELECT 
    email,
    full_name,
    user_role,
    'math_profiles' as tabla_origen
FROM math_profiles 
WHERE email ILIKE '%franita%' OR full_name ILIKE '%francisca%';

-- 10. INFORMACIÓN DETALLADA DE AUTH USERS (si es accesible)
SELECT 
    '=== INTENTANDO ACCEDER A AUTH.USERS ===' as seccion;

-- Nota: Esto puede fallar si no tienes permisos de administrador
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at,
    'auth.users' as tabla_origen
FROM auth.users 
WHERE email = 'franita90@gmail.com';

-- 11. VERIFICAR PERMISOS EN TABLAS
SELECT 
    '=== PERMISOS EN TABLAS ===' as seccion;

SELECT 
    table_name,
    privilege_type,
    grantee
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'math_profiles', 'user_roles')
ORDER BY table_name, privilege_type;

-- 12. ANÁLISIS DETALLADO DE POLÍTICAS RLS PROBLEMÁTICAS
SELECT 
    '=== ANÁLISIS DETALLADO DE POLÍTICAS RLS ===' as seccion;

-- Verificar si RLS está habilitado en cada tabla
SELECT 
    t.tablename,
    CASE 
        WHEN c.relrowsecurity THEN 'RLS HABILITADO' 
        ELSE 'RLS DESHABILITADO' 
    END as estado_rls,
    c.relforcerowsecurity as rls_forzado
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE t.schemaname = 'public' 
AND t.tablename IN ('profiles', 'math_profiles', 'user_roles')
ORDER BY t.tablename;

-- Mostrar políticas específicas con detalles completos
SELECT 
    pgc.relname as tabla,
    pol.polname as politica,
    pol.polcmd as comando,
    pol.polpermissive as es_permisiva,
    pol.polroles::regrole[] as roles_aplicables,
    pol.polqual as condicion_using,
    pol.polwithcheck as condicion_with_check
FROM pg_policy pol
JOIN pg_class pgc ON pol.polrelid = pgc.oid
WHERE pgc.relname IN ('profiles', 'math_profiles', 'user_roles')
ORDER BY pgc.relname, pol.polname;

-- 13. SIMULAR ACCESO COMO USUARIO ANÓNIMO
SELECT 
    '=== SIMULACIÓN DE ACCESO ANÓNIMO ===' as seccion;

-- Verificar el rol actual
SELECT current_setting('role') as rol_actual;

-- Intentar contar registros en cada tabla
SELECT 
    'profiles' as tabla,
    COUNT(*) as total_visible
FROM profiles;

SELECT 
    'math_profiles' as tabla,
    COUNT(*) as total_visible
FROM math_profiles;

SELECT 
    'user_roles' as tabla,
    COUNT(*) as total_visible
FROM user_roles;

-- 14. BUSCAR POLÍTICAS QUE FILTREN POR USER_ID
SELECT 
    '=== POLÍTICAS QUE USAN USER_ID ===' as seccion;

SELECT 
    pgc.relname as tabla,
    pol.polname as politica,
    pol.polqual as condicion
FROM pg_policy pol
JOIN pg_class pgc ON pol.polrelid = pgc.oid
WHERE pgc.relname IN ('profiles', 'math_profiles', 'user_roles')
AND (pol.polqual::text LIKE '%auth.uid()%' 
     OR pol.polqual::text LIKE '%user_id%'
     OR pol.polqual::text LIKE '%id%')
ORDER BY pgc.relname;

-- 15. VERIFICAR FUNCIONES DE AUTENTICACIÓN
SELECT 
    '=== VERIFICACIÓN DE FUNCIONES AUTH ===' as seccion;

-- Verificar si auth.uid() funciona
SELECT 
    auth.uid() as user_id_actual,
    CASE 
        WHEN auth.uid() IS NULL THEN 'USUARIO NO AUTENTICADO'
        ELSE 'USUARIO AUTENTICADO'
    END as estado_auth;

-- 16. DATOS REALES VS DATOS VISIBLES
SELECT 
    '=== COMPARACIÓN DATOS REALES VS VISIBLES ===' as seccion;

-- Contar todos los registros (sin RLS)
SET row_security = off;
SELECT 'profiles_sin_rls' as tabla, COUNT(*) as total FROM profiles;
SELECT 'math_profiles_sin_rls' as tabla, COUNT(*) as total FROM math_profiles;
SELECT 'user_roles_sin_rls' as tabla, COUNT(*) as total FROM user_roles;

-- Restaurar RLS y contar registros visibles
SET row_security = on;
SELECT 'profiles_con_rls' as tabla, COUNT(*) as total FROM profiles;
SELECT 'math_profiles_con_rls' as tabla, COUNT(*) as total FROM math_profiles;
SELECT 'user_roles_con_rls' as tabla, COUNT(*) as total FROM user_roles;

-- 17. DIAGNÓSTICO ESPECÍFICO DE FRANCISCA CON RLS
SELECT 
    '=== FRANCISCA CON Y SIN RLS ===' as seccion;

-- Sin RLS
SET row_security = off;
SELECT 'SIN_RLS' as modo, email, full_name, created_at FROM profiles WHERE email = 'franita90@gmail.com';
SELECT 'SIN_RLS' as modo, email, full_name, user_role FROM math_profiles WHERE email = 'franita90@gmail.com';

-- Con RLS
SET row_security = on;
SELECT 'CON_RLS' as modo, email, full_name, created_at FROM profiles WHERE email = 'franita90@gmail.com';
SELECT 'CON_RLS' as modo, email, full_name, user_role FROM math_profiles WHERE email = 'franita90@gmail.com';

-- 18. RECOMENDACIONES PARA SOLUCIONAR
SELECT 
    '=== RECOMENDACIONES PARA SOLUCIONAR ===' as seccion,
    'Si los datos aparecen SIN_RLS pero no CON_RLS, confirma que RLS está bloqueando' as diagnostico,
    'Opciones: 1) Deshabilitar RLS temporalmente, 2) Modificar políticas, 3) Autenticarse' as soluciones;

-- 19. SOLUCIONES PRÁCTICAS PARA RLS
SELECT 
    '=== SOLUCIONES PRÁCTICAS ===' as seccion;

-- OPCIÓN 1: DESHABILITAR RLS TEMPORALMENTE (SOLO PARA DESARROLLO)
-- ⚠️ USAR CON CUIDADO - SOLO EN DESARROLLO
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE math_profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- OPCIÓN 2: CREAR POLÍTICAS PERMISIVAS PARA LECTURA PÚBLICA
-- Permitir lectura de profiles a usuarios anónimos
-- CREATE POLICY "Allow public read on profiles" ON profiles
--     FOR SELECT USING (true);

-- Permitir lectura de math_profiles a usuarios anónimos
-- CREATE POLICY "Allow public read on math_profiles" ON math_profiles
--     FOR SELECT USING (true);

-- Permitir lectura de user_roles a usuarios anónimos
-- CREATE POLICY "Allow public read on user_roles" ON user_roles
--     FOR SELECT USING (true);

-- OPCIÓN 3: MODIFICAR POLÍTICAS EXISTENTES PARA SER MÁS PERMISIVAS
-- Ver políticas actuales que bloquean
SELECT 
    'POLÍTICAS ACTUALES QUE BLOQUEAN' as info,
    pgc.relname as tabla,
    pol.polname as politica,
    pol.polqual as condicion_bloqueante
FROM pg_policy pol
JOIN pg_class pgc ON pol.polrelid = pgc.oid
WHERE pgc.relname IN ('profiles', 'math_profiles', 'user_roles')
ORDER BY pgc.relname;

-- 20. COMANDOS PARA EJECUTAR SEGÚN NECESIDAD
SELECT 
    '=== COMANDOS PARA EJECUTAR ===' as seccion;

-- Para permitir acceso público temporal (DESARROLLO)
SELECT 
    'COMANDO TEMPORAL' as tipo,
    'ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;' as comando,
    'Deshabilita RLS en profiles' as descripcion
UNION ALL
SELECT 
    'COMANDO TEMPORAL' as tipo,
    'ALTER TABLE math_profiles DISABLE ROW LEVEL SECURITY;' as comando,
    'Deshabilita RLS en math_profiles' as descripcion
UNION ALL
SELECT 
    'COMANDO TEMPORAL' as tipo,
    'ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;' as comando,
    'Deshabilita RLS en user_roles' as descripcion;

-- Para crear políticas permisivas (RECOMENDADO)
SELECT 
    'COMANDO RECOMENDADO' as tipo,
    'CREATE POLICY "public_read_profiles" ON profiles FOR SELECT USING (true);' as comando,
    'Permite lectura pública de profiles' as descripcion
UNION ALL
SELECT 
    'COMANDO RECOMENDADO' as tipo,
    'CREATE POLICY "public_read_math_profiles" ON math_profiles FOR SELECT USING (true);' as comando,
    'Permite lectura pública de math_profiles' as descripcion
UNION ALL
SELECT 
    'COMANDO RECOMENDADO' as tipo,
    'CREATE POLICY "public_read_user_roles" ON user_roles FOR SELECT USING (true);' as comando,
    'Permite lectura pública de user_roles' as descripcion;

-- Para restaurar RLS después (si se deshabilitó)
SELECT 
    'COMANDO RESTAURAR' as tipo,
    'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;' as comando,
    'Rehabilita RLS en profiles' as descripcion
UNION ALL
SELECT 
    'COMANDO RESTAURAR' as tipo,
    'ALTER TABLE math_profiles ENABLE ROW LEVEL SECURITY;' as comando,
    'Rehabilita RLS en math_profiles' as descripcion
UNION ALL
SELECT 
    'COMANDO RESTAURAR' as tipo,
    'ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;' as comando,
    'Rehabilita RLS en user_roles' as descripcion;

-- 21. VERIFICACIÓN FINAL
SELECT 
    '=== VERIFICACIÓN DESPUÉS DE APLICAR SOLUCIÓN ===' as seccion;

-- Contar registros accesibles después de la solución
SELECT 
    'VERIFICAR ACCESO' as test,
    'profiles' as tabla,
    COUNT(*) as registros_visibles
FROM profiles
UNION ALL
SELECT 
    'VERIFICAR ACCESO' as test,
    'math_profiles' as tabla,
    COUNT(*) as registros_visibles
FROM math_profiles
UNION ALL
SELECT 
    'VERIFICAR ACCESO' as test,
    'user_roles' as tabla,
    COUNT(*) as registros_visibles
FROM user_roles;

-- Verificar que Francisca es visible
SELECT 
    'FRANCISCA VISIBLE' as test,
    email,
    full_name,
    'profiles' as tabla
FROM profiles 
WHERE email = 'franita90@gmail.com'
UNION ALL
SELECT 
    'FRANCISCA VISIBLE' as test,
    email,
    full_name,
    'math_profiles' as tabla
FROM math_profiles 
WHERE email = 'franita90@gmail.com';

-- 22. SCRIPT COMPLETO DE SOLUCIÓN RECOMENDADA
SELECT 
    '=== SCRIPT DE SOLUCIÓN RECOMENDADA ===' as seccion,
    'Ejecutar estos comandos para permitir acceso público de lectura' as instruccion;

/*
-- SCRIPT DE SOLUCIÓN RECOMENDADA:
-- Crear políticas permisivas para lectura pública

-- 1. Para tabla profiles
CREATE POLICY "Allow public read access on profiles" 
ON profiles FOR SELECT 
USING (true);

-- 2. Para tabla math_profiles  
CREATE POLICY "Allow public read access on math_profiles" 
ON math_profiles FOR SELECT 
USING (true);

-- 3. Para tabla user_roles
CREATE POLICY "Allow public read access on user_roles" 
ON user_roles FOR SELECT 
USING (true);

-- VERIFICAR QUE FUNCIONA:
SELECT COUNT(*) as total_profiles FROM profiles;
SELECT COUNT(*) as total_math_profiles FROM math_profiles;
SELECT COUNT(*) as total_user_roles FROM user_roles;

-- BUSCAR FRANCISCA:
SELECT email, full_name FROM profiles WHERE email = 'franita90@gmail.com';
*/
