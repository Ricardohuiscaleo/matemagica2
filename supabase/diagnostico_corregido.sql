-- DIAGNÓSTICO COMPLETO DEL SISTEMA DE ANALYTICS GABY - CORREGIDO
-- Ejecutar consulta por consulta para ver el estado actual

-- 1. VERIFICAR QUE EXISTEN LAS TABLAS
SELECT 
    table_name,
    table_type,
    is_insertable_into
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name LIKE '%presentation%'
ORDER BY table_name;

-- 2. VERIFICAR ESTADO DE RLS (corregido sin hasoids)
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename LIKE '%presentation%';

-- 3. VERIFICAR POLÍTICAS RLS EXISTENTES
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public';

-- 4. VERIFICAR PERMISOS DEL USUARIO ANON
SELECT 
    grantee,
    table_schema,
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE grantee = 'anon' 
    AND table_schema = 'public'
    AND table_name LIKE '%presentation%'
ORDER BY table_name, privilege_type;

-- 5. VERIFICAR FUNCIONES EXISTENTES
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name LIKE '%presentation%'
ORDER BY routine_name;

-- 6. VERIFICAR PERMISOS DE FUNCIONES
SELECT 
    grantee,
    routine_schema,
    routine_name,
    privilege_type
FROM information_schema.routine_privileges 
WHERE grantee = 'anon' 
    AND routine_schema = 'public'
    AND routine_name LIKE '%presentation%';

-- 7. VERIFICAR CONTENIDO DE LAS TABLAS (si existen)
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'presentation_stats') 
        THEN (SELECT count(*)::text FROM public.presentation_stats)
        ELSE 'Tabla no existe'
    END as presentation_stats_count,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'presentation_views') 
        THEN (SELECT count(*)::text FROM public.presentation_views)
        ELSE 'Tabla no existe'
    END as presentation_views_count;