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

-- 7. PROBAR ACCESO DIRECTO A TABLAS
SELECT * FROM public.presentation_stats LIMIT 1;
SELECT * FROM public.presentation_views LIMIT 1;
