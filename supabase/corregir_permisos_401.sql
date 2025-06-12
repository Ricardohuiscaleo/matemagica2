-- PASO 3: Verificación y corrección final de permisos
-- Ejecutar en Supabase SQL Editor para solucionar errores 401

-- Verificar que las funciones existen
SELECT 
    routine_name,
    routine_type,
    security_type,
    is_deterministic
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name LIKE '%presentation%'
ORDER BY routine_name;

-- Verificar permisos actuales del usuario anon
SELECT 
    grantee,
    routine_schema,
    routine_name,
    privilege_type
FROM information_schema.routine_privileges 
WHERE grantee = 'anon' 
    AND routine_schema = 'public'
    AND routine_name LIKE '%presentation%';

-- SOLUCIÓN: Otorgar permisos explícitos con PUBLIC
GRANT EXECUTE ON FUNCTION public.get_all_presentation_stats() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_presentation_view(text, text, text) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_presentation_view(text, text) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_presentation_view(text) TO PUBLIC;

-- Verificar permisos en tablas
GRANT ALL PRIVILEGES ON public.presentation_stats TO PUBLIC;
GRANT ALL PRIVILEGES ON public.presentation_views TO PUBLIC;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO PUBLIC;

-- Verificar configuración de autenticación
SELECT 
    setting_name,
    setting
FROM auth.config
WHERE setting_name IN ('site_url', 'external_anonymous_users_enabled');

-- PRUEBA FINAL: Simular llamada como usuario anónimo
SET ROLE anon;
SELECT 'PRUEBA FINAL - get_stats' as test, public.get_all_presentation_stats();
SELECT 'PRUEBA FINAL - increment' as test, public.increment_presentation_view('historia-celular', 'Test Final');
RESET ROLE;

-- Mensaje de confirmación
SELECT '✅ PERMISOS CORREGIDOS PARA USUARIO ANÓNIMO' as resultado;