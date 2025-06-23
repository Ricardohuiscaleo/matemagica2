-- ===================================
-- CONSULTA SIMPLIFICADA POR SECCIONES
-- Para obtener toda la información paso a paso
-- ===================================

-- SECCIÓN 1: ESTRUCTURA DE TABLAS PRINCIPALES
-- ✅ ESTRUCTURA MATH_PROFILES
SELECT 
    'math_profiles' AS tabla,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'math_profiles' 
    AND table_schema = 'public'
ORDER BY ordinal_position;