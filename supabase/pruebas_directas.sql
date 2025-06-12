-- PRUEBAS DIRECTAS DE LAS FUNCIONES
-- Ejecutar después del diagnóstico

-- 9. PROBAR FUNCIÓN get_all_presentation_stats DIRECTAMENTE
SELECT public.get_all_presentation_stats();

-- 10. PROBAR FUNCIÓN increment_presentation_view DIRECTAMENTE
SELECT public.increment_presentation_view('historia-celular', 'La Historia del Celular', 'test_directo');

-- 11. VERIFICAR SI HAY DATOS DESPUÉS DE LA PRUEBA
SELECT * FROM public.presentation_stats;
SELECT * FROM public.presentation_views ORDER BY created_at DESC LIMIT 5;

-- 12. PROBAR ACCESO DIRECTO A TABLAS COMO USUARIO ANON
SET ROLE anon;
SELECT * FROM public.presentation_stats;
SELECT * FROM public.presentation_views LIMIT 3;
RESET ROLE;

-- 13. VERIFICAR CONFIGURACIÓN DE ROLES
SELECT 
    rolname,
    rolsuper,
    rolcreaterole,
    rolcreatedb,
    rolcanlogin,
    rolconnlimit
FROM pg_roles 
WHERE rolname IN ('anon', 'authenticated', 'service_role');

-- 14. VERIFICAR LA API KEY CONFIGURADA (solo muestra que existe)
SELECT 
    CASE 
        WHEN current_setting('request.jwt.claims', true)::json->>'role' IS NOT NULL 
        THEN 'JWT configurado'
        ELSE 'JWT no configurado'
    END as jwt_status;