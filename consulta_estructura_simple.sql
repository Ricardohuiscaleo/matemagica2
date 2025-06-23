-- ===================================
-- CONSULTA SIMPLE: ESTRUCTURA DE TODAS LAS TABLAS MATH
-- Primero obtenemos la estructura, luego hacemos análisis
-- ===================================

-- ✅ PARTE 1: LISTAR TODAS LAS TABLAS MATH DISPONIBLES
SELECT 
    'TABLAS DISPONIBLES' AS seccion,
    table_name AS tabla,
    table_type AS tipo
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name LIKE 'math_%'
ORDER BY table_name;

-- ✅ PARTE 2: ESTRUCTURA COMPLETA DE math_profiles
SELECT 
    'ESTRUCTURA math_profiles' AS seccion,
    column_name AS columna,
    data_type AS tipo,
    is_nullable AS permite_null,
    column_default AS valor_defecto
FROM information_schema.columns 
WHERE table_name = 'math_profiles' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- ✅ PARTE 3: ESTRUCTURA COMPLETA DE math_exercises
SELECT 
    'ESTRUCTURA math_exercises' AS seccion,
    column_name AS columna,
    data_type AS tipo,
    is_nullable AS permite_null,
    column_default AS valor_defecto
FROM information_schema.columns 
WHERE table_name = 'math_exercises' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- ✅ PARTE 4: ESTRUCTURA COMPLETA DE math_sessions
SELECT 
    'ESTRUCTURA math_sessions' AS seccion,
    column_name AS columna,
    data_type AS tipo,
    is_nullable AS permite_null,
    column_default AS valor_defecto
FROM information_schema.columns 
WHERE table_name = 'math_sessions' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- ✅ PARTE 5: ESTRUCTURA COMPLETA DE math_user_progress
SELECT 
    'ESTRUCTURA math_user_progress' AS seccion,
    column_name AS columna,
    data_type AS tipo,
    is_nullable AS permite_null,
    column_default AS valor_defecto
FROM information_schema.columns 
WHERE table_name = 'math_user_progress' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- ✅ PARTE 6: ESTRUCTURA COMPLETA DE math_exercise_sessions
SELECT 
    'ESTRUCTURA math_exercise_sessions' AS seccion,
    column_name AS columna,
    data_type AS tipo,
    is_nullable AS permite_null,
    column_default AS valor_defecto
FROM information_schema.columns 
WHERE table_name = 'math_exercise_sessions' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- ✅ PARTE 7: ESTRUCTURA COMPLETA DE math_skills_catalog
SELECT 
    'ESTRUCTURA math_skills_catalog' AS seccion,
    column_name AS columna,
    data_type AS tipo,
    is_nullable AS permite_null,
    column_default AS valor_defecto
FROM information_schema.columns 
WHERE table_name = 'math_skills_catalog' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- ✅ PARTE 8: ESTRUCTURA COMPLETA DE math_story_attempts
SELECT 
    'ESTRUCTURA math_story_attempts' AS seccion,
    column_name AS columna,
    data_type AS tipo,
    is_nullable AS permite_null,
    column_default AS valor_defecto
FROM information_schema.columns 
WHERE table_name = 'math_story_attempts' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- ✅ PARTE 9: ESTRUCTURA COMPLETA DE math_teacher_reviews
SELECT 
    'ESTRUCTURA math_teacher_reviews' AS seccion,
    column_name AS columna,
    data_type AS tipo,
    is_nullable AS permite_null,
    column_default AS valor_defecto
FROM information_schema.columns 
WHERE table_name = 'math_teacher_reviews' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- ✅ PARTE 10: ESTRUCTURA COMPLETA DE math_teacher_student_requests
SELECT 
    'ESTRUCTURA math_teacher_student_requests' AS seccion,
    column_name AS columna,
    data_type AS tipo,
    is_nullable AS permite_null,
    column_default AS valor_defecto
FROM information_schema.columns 
WHERE table_name = 'math_teacher_student_requests' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- ✅ PARTE 11: CONTEO SIMPLE DE REGISTROS (SIN USAR COLUMNAS ESPECÍFICAS)
SELECT 
    'CONTEO REGISTROS' AS seccion,
    'math_profiles' AS tabla,
    COUNT(*) AS total_registros
FROM math_profiles
UNION ALL
SELECT 
    'CONTEO REGISTROS',
    'math_exercises',
    COUNT(*)
FROM math_exercises
UNION ALL
SELECT 
    'CONTEO REGISTROS',
    'math_sessions',
    COUNT(*)
FROM math_sessions
UNION ALL
SELECT 
    'CONTEO REGISTROS',
    'math_user_progress',
    COUNT(*)
FROM math_user_progress
UNION ALL
SELECT 
    'CONTEO REGISTROS',
    'math_exercise_sessions',
    COUNT(*)
FROM math_exercise_sessions
UNION ALL
SELECT 
    'CONTEO REGISTROS',
    'math_skills_catalog',
    COUNT(*)
FROM math_skills_catalog
UNION ALL
SELECT 
    'CONTEO REGISTROS',
    'math_story_attempts',
    COUNT(*)
FROM math_story_attempts
UNION ALL
SELECT 
    'CONTEO REGISTROS',
    'math_teacher_reviews',
    COUNT(*)
FROM math_teacher_reviews
UNION ALL
SELECT 
    'CONTEO REGISTROS',
    'math_teacher_student_requests',
    COUNT(*)
FROM math_teacher_student_requests;