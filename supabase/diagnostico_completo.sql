-- DIAGNÓSTICO COMPLETO DEL SISTEMA DE ANALYTICS GABY
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

-- 2. VERIFICAR ESTADO DE RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    hasoids
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
    cmd,
    qual,
    with_check
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
    security_type,
    is_deterministic,
    sql_data_access
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

-- 7. VERIFICAR CONTENIDO DE LAS TABLAS
SELECT 'presentation_stats' as tabla, count(*) as registros FROM public.presentation_stats
UNION ALL
SELECT 'presentation_views' as tabla, count(*) as registros FROM public.presentation_views;

-- 8. VERIFICAR ESTRUCTURA DE LAS TABLAS
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('presentation_stats', 'presentation_views')
ORDER BY table_name, ordinal_position;