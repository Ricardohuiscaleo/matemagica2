-- ===================================
-- CONSULTA ULTRA SIMPLE: TABLAS + ESTRUCTURA CONCATENADA
-- Formato: tabla, columna1, columna2, columna3, etc.
-- ===================================

-- ✅ OBTENER ESTRUCTURA DE TODAS LAS TABLAS MATH EN UNA SOLA CONSULTA
SELECT 
    table_name AS tabla,
    STRING_AGG(column_name, ', ' ORDER BY ordinal_position) AS estructura_columnas,
    COUNT(*) AS total_columnas
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name LIKE 'math_%'
GROUP BY table_name
ORDER BY table_name;

-- ✅ CONTEO DE REGISTROS (YA LO TIENES CORRECTO)
SELECT 
    'REGISTROS' AS tipo,
    table_name AS tabla,
    (SELECT COUNT(*) FROM math_profiles) AS math_profiles,
    (SELECT COUNT(*) FROM math_exercises) AS math_exercises,
    (SELECT COUNT(*) FROM math_sessions) AS math_sessions,
    (SELECT COUNT(*) FROM math_user_progress) AS math_user_progress,
    (SELECT COUNT(*) FROM math_exercise_sessions) AS math_exercise_sessions,
    (SELECT COUNT(*) FROM math_skills_catalog) AS math_skills_catalog,
    (SELECT COUNT(*) FROM math_story_attempts) AS math_story_attempts,
    (SELECT COUNT(*) FROM math_teacher_reviews) AS math_teacher_reviews,
    (SELECT COUNT(*) FROM math_teacher_student_requests) AS math_teacher_student_requests
FROM information_schema.tables 
WHERE table_name = 'math_profiles' 
LIMIT 1;