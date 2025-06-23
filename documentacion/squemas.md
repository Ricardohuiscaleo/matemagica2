-- ===================================
-- CONSULTA GENERAL DE ESQUEMAS DE TABLAS MATH
-- Para verificar la estructura real en Supabase
-- ===================================

-- ✅ VERIFICAR ESTRUCTURA DE math_profiles
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

-- Separador visual
SELECT '==== SEPARADOR TABLA ====' AS separador;

-- ✅ VERIFICAR ESTRUCTURA DE math_sessions
SELECT 
    'math_sessions' AS tabla,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'math_sessions' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Separador visual
SELECT '==== SEPARADOR TABLA ====' AS separador;

-- ✅ VERIFICAR ESTRUCTURA DE math_exercises
SELECT 
    'math_exercises' AS tabla,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'math_exercises' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Separador visual
SELECT '==== SEPARADOR TABLA ====' AS separador;

-- ✅ VERIFICAR ESTRUCTURA DE math_user_progress
SELECT 
    'math_user_progress' AS tabla,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'math_user_progress' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Separador visual
SELECT '==== SEPARADOR TABLA ====' AS separador;

-- ✅ VERIFICAR ESTRUCTURA DE math_exercise_sessions
SELECT 
    'math_exercise_sessions' AS tabla,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'math_exercise_sessions' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Separador visual
SELECT '==== SEPARADOR TABLA ====' AS separador;

-- ✅ VERIFICAR ESTRUCTURA DE math_skills_catalog
SELECT 
    'math_skills_catalog' AS tabla,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'math_skills_catalog' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Separador visual
SELECT '==== SEPARADOR TABLA ====' AS separador;

-- ✅ VERIFICAR ESTRUCTURA DE math_teacher_reviews
SELECT 
    'math_teacher_reviews' AS tabla,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'math_teacher_reviews' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Separador visual
SELECT '==== SEPARADOR TABLA ====' AS separador;

-- ✅ VERIFICAR ESTRUCTURA DE math_story_attempts
SELECT 
    'math_story_attempts' AS tabla,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'math_story_attempts' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- ====================================
-- CONSULTAS ADICIONALES DE DIAGNÓSTICO
-- ====================================

-- Separador visual
SELECT '==== INFORMACIÓN ADICIONAL ====' AS separador;

-- ✅ CONTAR REGISTROS EN CADA TABLA
SELECT 
    'CONTEO DE REGISTROS' AS info,
    'math_profiles' AS tabla,
    COUNT(*) AS total_registros
FROM math_profiles
UNION ALL
SELECT 
    'CONTEO DE REGISTROS',
    'math_sessions',
    COUNT(*)
FROM math_sessions
UNION ALL
SELECT 
    'CONTEO DE REGISTROS',
    'math_exercises',
    COUNT(*)
FROM math_exercises
UNION ALL
SELECT 
    'CONTEO DE REGISTROS',
    'math_user_progress',
    COUNT(*)
FROM math_user_progress
UNION ALL
SELECT 
    'CONTEO DE REGISTROS',
    'math_exercise_sessions',
    COUNT(*)
FROM math_exercise_sessions;

-- Separador visual
SELECT '==== MUESTRA DE DATOS ====' AS separador;

-- ✅ MUESTRA DE DATOS DE math_profiles (primeros 3 registros)
SELECT 
    'MUESTRA math_profiles' AS info,
    id,
    full_name,
    user_role,
    email,
    created_at
FROM math_profiles 
ORDER BY created_at DESC 
LIMIT 3;

-- ✅ MUESTRA DE DATOS DE math_sessions (primeros 3 registros)
SELECT 
    'MUESTRA math_sessions' AS info,
    id,
    user_id,
    created_at
FROM math_sessions 
ORDER BY created_at DESC 
LIMIT 3;

-- ✅ MUESTRA DE DATOS DE math_exercises (primeros 3 registros) 
SELECT 
    'MUESTRA math_exercises' AS info,
    id,
    user_id,
    created_at
FROM math_exercises 
ORDER BY created_at DESC 
LIMIT 3;