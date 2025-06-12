-- VERIFICACIÓN DEFINITIVA: Comprobar anon key y permisos (CORREGIDA)
-- Ejecutar en Supabase SQL Editor para verificar la configuración completa

-- 1. Verificar que el usuario anon puede usar las funciones
SELECT 
    'VERIFICANDO USUARIO ANON' as status,
    current_user as usuario_actual,
    session_user as usuario_sesion;

-- 2. Probar directamente como anon
SET ROLE anon;

-- Probar función básica
SELECT 'TEST ANON - get_stats' as test;
SELECT public.get_all_presentation_stats() as resultado_stats;

-- Probar función de incremento
SELECT 'TEST ANON - increment' as test;
SELECT public.increment_presentation_view('historia-celular', 'Test Anon Direct') as resultado_increment;

-- Resetear rol
RESET ROLE;

-- 3. Verificar permisos específicos del anon key actual
SELECT 
    nspname as schema_name,
    proname as function_name,
    proacl as permissions
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE nspname = 'public' 
    AND proname LIKE '%presentation%';

-- 4. Verificar si RLS está realmente deshabilitado (CORREGIDO)
SELECT 
    c.relname as table_name,
    c.relrowsecurity as row_security_enabled
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public' 
    AND c.relname IN ('presentation_stats', 'presentation_views')
    AND c.relkind = 'r';

-- 5. Verificar el anon key actual (esto debe coincidir con tu frontend)
SELECT 
    'ANON KEY INFO' as info,
    rolname,
    rolsuper,
    rolcreaterole,
    rolcreatedb,
    rolcanlogin
FROM pg_roles 
WHERE rolname = 'anon';

-- 6. Mensaje de resultado
SELECT '🔍 VERIFICACIÓN COMPLETA DEL ANON KEY FINALIZADA' as resultado;