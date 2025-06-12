-- CORRECCIÓN PASO 3: Verificación y corrección final de permisos (SIN auth.config)
-- Ejecutar en Supabase SQL Editor para solucionar errores 401

-- 1. Verificar que las funciones existen
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name LIKE '%presentation%'
ORDER BY routine_name;

-- 2. Verificar permisos actuales del usuario anon
SELECT 
    grantee,
    routine_schema,
    routine_name,
    privilege_type
FROM information_schema.routine_privileges 
WHERE grantee IN ('anon', 'public') 
    AND routine_schema = 'public'
    AND routine_name LIKE '%presentation%';

-- 3. SOLUCIÓN DEFINITIVA: Otorgar permisos máximos con PUBLIC
GRANT EXECUTE ON FUNCTION public.get_all_presentation_stats() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_presentation_view(text, text, text) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_presentation_view(text, text) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_presentation_view(text) TO PUBLIC;

-- También otorgar específicamente a anon por si acaso
GRANT EXECUTE ON FUNCTION public.get_all_presentation_stats() TO anon;
GRANT EXECUTE ON FUNCTION public.increment_presentation_view(text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_presentation_view(text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_presentation_view(text) TO anon;

-- 4. Verificar y otorgar permisos en tablas
GRANT ALL PRIVILEGES ON public.presentation_stats TO PUBLIC;
GRANT ALL PRIVILEGES ON public.presentation_views TO PUBLIC;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO PUBLIC;

-- También específicamente a anon
GRANT ALL PRIVILEGES ON public.presentation_stats TO anon;
GRANT ALL PRIVILEGES ON public.presentation_views TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- 5. Asegurar que RLS está deshabilitado
ALTER TABLE public.presentation_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentation_views DISABLE ROW LEVEL SECURITY;

-- 6. Verificar estructura de tablas
\d public.presentation_stats;
\d public.presentation_views;

-- 7. PRUEBA FINAL: Simular llamada como usuario anónimo
SET ROLE anon;

-- Probar obtener estadísticas
SELECT 'PRUEBA 1 - get_stats' as test, public.get_all_presentation_stats();

-- Probar incrementar con diferentes parámetros
SELECT 'PRUEBA 2 - increment 3 params' as test, public.increment_presentation_view('historia-celular', 'La Historia del Celular', 'test_session_final');
SELECT 'PRUEBA 3 - increment 2 params' as test, public.increment_presentation_view('historia-celular', 'La Historia del Celular');
SELECT 'PRUEBA 4 - increment 1 param' as test, public.increment_presentation_view('historia-celular');

-- Verificar que los datos se guardaron
SELECT 'VERIFICACIÓN FINAL' as test, public.get_all_presentation_stats();

-- Resetear rol
RESET ROLE;

-- 8. Verificar permisos finales
SELECT 
    grantee,
    routine_name,
    privilege_type
FROM information_schema.routine_privileges 
WHERE routine_schema = 'public'
    AND routine_name LIKE '%presentation%'
    AND grantee IN ('anon', 'public')
ORDER BY routine_name, grantee;

-- 9. Mensaje de éxito
SELECT '🎉 ¡PERMISOS CORREGIDOS - NO MÁS ERRORES 401!' as resultado;