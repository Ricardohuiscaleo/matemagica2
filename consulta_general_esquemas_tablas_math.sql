-- ===================================
-- CONSULTA GENERAL COMPLETA DE ESQUEMAS DE TABLAS MATH
-- Para verificar la estructura real en Supabase y actualizar Analytics Service
-- ===================================

-- ✅ VERIFICAR ESTRUCTURA DE math_profiles (COMPLETA)
SELECT 
    'math_profiles' AS tabla,
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'math_profiles' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Separador visual
SELECT '==== SEPARADOR TABLA ====' AS separador;

-- ✅ VERIFICAR ESTRUCTURA DE math_sessions (COMPLETA)
SELECT 
    'math_sessions' AS tabla,
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'math_sessions' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Separador visual
SELECT '==== SEPARADOR TABLA ====' AS separador;

-- ✅ VERIFICAR ESTRUCTURA DE math_exercises (COMPLETA)
SELECT 
    'math_exercises' AS tabla,
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'math_exercises' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Separador visual
SELECT '==== SEPARADOR TABLA ====' AS separador;

-- ✅ VERIFICAR ESTRUCTURA DE math_user_progress (COMPLETA)
SELECT 
    'math_user_progress' AS tabla,
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'math_user_progress' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Separador visual
SELECT '==== SEPARADOR TABLA ====' AS separador;

-- ✅ VERIFICAR ESTRUCTURA DE math_exercise_sessions (COMPLETA)
SELECT 
    'math_exercise_sessions' AS tabla,
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'math_exercise_sessions' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Separador visual
SELECT '==== SEPARADOR TABLA ====' AS separador;

-- ✅ VERIFICAR ESTRUCTURA DE math_skills_catalog (COMPLETA)
SELECT 
    'math_skills_catalog' AS tabla,
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'math_skills_catalog' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Separador visual
SELECT '==== SEPARADOR TABLA ====' AS separador;

-- ✅ VERIFICAR ESTRUCTURA DE math_teacher_reviews (COMPLETA)
SELECT 
    'math_teacher_reviews' AS tabla,
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'math_teacher_reviews' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Separador visual
SELECT '==== SEPARADOR TABLA ====' AS separador;

-- ✅ VERIFICAR ESTRUCTURA DE math_story_attempts (COMPLETA)
SELECT 
    'math_story_attempts' AS tabla,
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'math_story_attempts' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Separador visual
SELECT '==== SEPARADOR TABLA ====' AS separador;

-- ✅ VERIFICAR ESTRUCTURA DE math_teacher_student_requests (NUEVA)
SELECT 
    'math_teacher_student_requests' AS tabla,
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'math_teacher_student_requests' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- ====================================
-- CONSULTAS ADICIONALES DE DIAGNÓSTICO COMPLETAS
-- ====================================

-- Separador visual
SELECT '==== INFORMACIÓN ADICIONAL COMPLETA ====' AS separador;

-- ✅ CONTAR REGISTROS EN CADA TABLA (TODAS)
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
FROM math_exercise_sessions
UNION ALL
SELECT 
    'CONTEO DE REGISTROS',
    'math_skills_catalog',
    COUNT(*)
FROM math_skills_catalog
UNION ALL
SELECT 
    'CONTEO DE REGISTROS',
    'math_teacher_reviews',
    COUNT(*)
FROM math_teacher_reviews
UNION ALL
SELECT 
    'CONTEO DE REGISTROS',
    'math_story_attempts',
    COUNT(*)
FROM math_story_attempts
UNION ALL
SELECT 
    'CONTEO DE REGISTROS',
    'math_teacher_student_requests',
    COUNT(*)
FROM math_teacher_student_requests;

-- Separador visual
SELECT '==== ANÁLISIS DE TIPOS DE DATOS ====' AS separador;

-- ✅ ANÁLISIS DE ROLES EN math_profiles
SELECT 
    'ROLES EN math_profiles' AS info,
    user_role,
    COUNT(*) AS cantidad
FROM math_profiles 
GROUP BY user_role 
ORDER BY cantidad DESC;

-- ✅ ANÁLISIS DE NIVELES EN math_exercises
SELECT 
    'NIVELES EN math_exercises' AS info,
    level,
    operation,
    COUNT(*) AS cantidad
FROM math_exercises 
GROUP BY level, operation 
ORDER BY level, operation;

-- ✅ ANÁLISIS DE ESTADOS ACTIVOS EN math_profiles
SELECT 
    'ESTADOS EN math_profiles' AS info,
    is_active,
    COUNT(*) AS cantidad
FROM math_profiles 
GROUP BY is_active;

-- Separador visual
SELECT '==== MUESTRAS DE DATOS AMPLIADAS ====' AS separador;

-- ✅ MUESTRA DETALLADA DE math_profiles (primeros 5)
SELECT 
    'MUESTRA DETALLADA math_profiles' AS info,
    id,
    full_name,
    user_role,
    email,
    is_active,
    rating,
    total_reviews,
    created_at
FROM math_profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- ✅ MUESTRA DETALLADA DE math_exercises (primeros 5)
SELECT 
    'MUESTRA DETALLADA math_exercises' AS info,
    id,
    operation,
    level,
    number1,
    number2,
    correct_answer,
    is_story_problem,
    created_at
FROM math_exercises 
ORDER BY created_at DESC 
LIMIT 5;

-- ✅ MUESTRA DE math_sessions SI TIENE DATOS
SELECT 
    'MUESTRA math_sessions' AS info,
    id,
    user_id,
    created_at
FROM math_sessions 
ORDER BY created_at DESC 
LIMIT 3;

-- ✅ MUESTRA DE math_user_progress SI TIENE DATOS
SELECT 
    'MUESTRA math_user_progress' AS info,
    id,
    user_id,
    created_at
FROM math_user_progress 
ORDER BY created_at DESC 
LIMIT 3;

-- ✅ MUESTRA DE math_exercise_sessions SI TIENE DATOS
SELECT 
    'MUESTRA math_exercise_sessions' AS info,
    id,
    user_id,
    created_at
FROM math_exercise_sessions 
ORDER BY created_at DESC 
LIMIT 3;

-- ====================================
-- CONSULTAS DE VALIDACIÓN ESPECÍFICAS
-- ====================================

-- Separador visual
SELECT '==== VALIDACIONES ESPECÍFICAS ====' AS separador;

-- ✅ VERIFICAR COLUMNAS ESPECÍFICAS QUE USA EL ANALYTICS SERVICE
SELECT 
    'VALIDACIÓN COLUMNAS ANALYTICS' AS info,
    table_name,
    column_name,
    'EXISTS' AS status
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('math_profiles', 'math_sessions', 'math_exercises', 'math_user_progress')
    AND column_name IN (
        'user_role', 'is_active', 'rating', 'total_reviews',
        'exercises_completed', 'correct_answers', 'duration_minutes',
        'last_session_date', 'session_count', 'total_exercises',
        'operation', 'level', 'difficulty_tags', 'is_story_problem'
    )
ORDER BY table_name, column_name;

-- ✅ VERIFICAR VALORES ÚNICOS EN CAMPOS CLAVE
SELECT 
    'VALORES ÚNICOS user_role' AS info,
    user_role AS valor,
    COUNT(*) AS cantidad
FROM math_profiles 
WHERE user_role IS NOT NULL
GROUP BY user_role
ORDER BY cantidad DESC;

SELECT 
    'VALORES ÚNICOS operation' AS info,
    operation AS valor,
    COUNT(*) AS cantidad
FROM math_exercises 
WHERE operation IS NOT NULL
GROUP BY operation
ORDER BY cantidad DESC;

SELECT 
    'VALORES ÚNICOS level' AS info,
    level AS valor,
    COUNT(*) AS cantidad
FROM math_exercises 
WHERE level IS NOT NULL
GROUP BY level
ORDER BY cantidad DESC;

-- ✅ VERIFICAR FECHAS RECIENTES PARA ESTADÍSTICAS
SELECT 
    'FECHAS RECIENTES math_profiles' AS info,
    DATE(created_at) AS fecha,
    COUNT(*) AS registros_creados
FROM math_profiles 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY fecha DESC
LIMIT 10;

SELECT 
    'FECHAS RECIENTES math_exercises' AS info,
    DATE(created_at) AS fecha,
    COUNT(*) AS ejercicios_creados
FROM math_exercises 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY fecha DESC
LIMIT 10;