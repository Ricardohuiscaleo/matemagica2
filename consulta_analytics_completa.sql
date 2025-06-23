-- ===================================
-- CONSULTA ANALYTICS COMPLETA MEJORADA
-- Análisis exhaustivo de todas las tablas math para el Real Analytics Service
-- ===================================

-- ✅ PASO 1: CONTEOS COMPLETOS DE TODAS LAS TABLAS MATH
SELECT 
    'CONTEOS COMPLETOS' AS seccion,
    'math_profiles' AS tabla,
    COUNT(*) AS total_registros
FROM math_profiles
UNION ALL
SELECT 
    'CONTEOS COMPLETOS',
    'math_sessions',
    COUNT(*)
FROM math_sessions
UNION ALL
SELECT 
    'CONTEOS COMPLETOS',
    'math_exercises',
    COUNT(*)
FROM math_exercises
UNION ALL
SELECT 
    'CONTEOS COMPLETOS',
    'math_user_progress',
    COUNT(*)
FROM math_user_progress
UNION ALL
SELECT 
    'CONTEOS COMPLETOS',
    'math_exercise_sessions',
    COUNT(*)
FROM math_exercise_sessions
UNION ALL
SELECT 
    'CONTEOS COMPLETOS',
    'math_skills_catalog',
    COUNT(*)
FROM math_skills_catalog
UNION ALL
SELECT 
    'CONTEOS COMPLETOS',
    'math_story_attempts',
    COUNT(*)
FROM math_story_attempts
UNION ALL
SELECT 
    'CONTEOS COMPLETOS',
    'math_teacher_reviews',
    COUNT(*)
FROM math_teacher_reviews
UNION ALL
SELECT 
    'CONTEOS COMPLETOS',
    'math_teacher_student_requests',
    COUNT(*)
FROM math_teacher_student_requests;

-- ✅ PASO 2: ANÁLISIS DETALLADO DE math_profiles
SELECT 
    'DISTRIBUCIÓN ROLES math_profiles' AS seccion,
    user_role AS valor,
    COUNT(*) AS cantidad,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM math_profiles WHERE user_role IS NOT NULL), 2) AS porcentaje
FROM math_profiles 
WHERE user_role IS NOT NULL
GROUP BY user_role
ORDER BY cantidad DESC;

SELECT 
    'ESTADOS USUARIOS math_profiles' AS seccion,
    CASE 
        WHEN is_active = true THEN 'Activos'
        WHEN is_active = false THEN 'Inactivos'
        ELSE 'Sin definir'
    END AS estado,
    COUNT(*) AS cantidad,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM math_profiles), 2) AS porcentaje
FROM math_profiles 
GROUP BY is_active
ORDER BY cantidad DESC;

SELECT 
    'RATING PROMEDIO PROFESORES' AS seccion,
    ROUND(AVG(rating), 2) AS rating_promedio,
    COUNT(*) AS total_profesores,
    SUM(total_reviews) AS total_resenas
FROM math_profiles 
WHERE user_role IN ('teacher', 'profesor') AND rating > 0;

-- ✅ PASO 3: ANÁLISIS DETALLADO DE math_exercises
SELECT 
    'DISTRIBUCIÓN EJERCICIOS POR NIVEL' AS seccion,
    level AS nivel,
    COUNT(*) AS cantidad,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM math_exercises), 2) AS porcentaje
FROM math_exercises 
GROUP BY level 
ORDER BY level;

SELECT 
    'DISTRIBUCIÓN EJERCICIOS POR OPERACIÓN' AS seccion,
    operation AS operacion,
    COUNT(*) AS cantidad,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM math_exercises), 2) AS porcentaje
FROM math_exercises 
GROUP BY operation 
ORDER BY cantidad DESC;

SELECT 
    'EJERCICIOS CON PROBLEMAS DE HISTORIA' AS seccion,
    CASE 
        WHEN is_story_problem = true THEN 'Con historia'
        WHEN is_story_problem = false THEN 'Sin historia'
        ELSE 'Sin definir'
    END AS tipo,
    COUNT(*) AS cantidad,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM math_exercises), 2) AS porcentaje
FROM math_exercises 
GROUP BY is_story_problem
ORDER BY cantidad DESC;

-- ✅ PASO 4: ANÁLISIS DETALLADO DE math_sessions
SELECT 
    'DISTRIBUCIÓN SESIONES POR NIVEL' AS seccion,
    level AS nivel,
    COUNT(*) AS cantidad,
    AVG(duration_minutes) AS duracion_promedio_min,
    SUM(duration_minutes) AS tiempo_total_min
FROM math_sessions 
WHERE level IS NOT NULL AND duration_minutes IS NOT NULL
GROUP BY level 
ORDER BY level;

SELECT 
    'ESTADÍSTICAS TIEMPO SESIONES' AS seccion,
    'total' AS tipo,
    COUNT(*) AS total_sesiones,
    ROUND(AVG(duration_minutes), 2) AS duracion_promedio,
    MIN(duration_minutes) AS duracion_minima,
    MAX(duration_minutes) AS duracion_maxima,
    SUM(duration_minutes) AS tiempo_total_minutos
FROM math_sessions 
WHERE duration_minutes IS NOT NULL;

-- ✅ PASO 5: ANÁLISIS DE math_skills_catalog
SELECT 
    'SKILLS CATALOG OVERVIEW' AS seccion,
    COUNT(*) AS total_skills,
    COUNT(DISTINCT skill_name) AS skills_unicos,
    COUNT(DISTINCT category) AS categorias_distintas
FROM math_skills_catalog;

SELECT 
    'DISTRIBUCIÓN SKILLS POR CATEGORÍA' AS seccion,
    category AS categoria,
    COUNT(*) AS cantidad_skills
FROM math_skills_catalog 
WHERE category IS NOT NULL
GROUP BY category
ORDER BY cantidad_skills DESC;

-- ✅ PASO 6: ANÁLISIS DE math_story_attempts (CORREGIDO)
SELECT 
    'STORY ATTEMPTS ESTADÍSTICAS' AS seccion,
    COUNT(*) AS total_intentos,
    COUNT(DISTINCT user_id) AS usuarios_unicos,
    'N/A' AS porcentaje_aciertos
FROM math_story_attempts;

SELECT 
    'STORY ATTEMPTS POR USUARIO' AS seccion,
    user_id,
    COUNT(*) AS intentos,
    0 AS aciertos,
    'N/A' AS porcentaje_aciertos
FROM math_story_attempts 
GROUP BY user_id
ORDER BY intentos DESC
LIMIT 10;

-- ✅ PASO 7: ANÁLISIS DE math_teacher_reviews
SELECT 
    'TEACHER REVIEWS ESTADÍSTICAS' AS seccion,
    COUNT(*) AS total_reviews,
    COUNT(DISTINCT teacher_id) AS profesores_evaluados,
    COUNT(DISTINCT parent_id) AS padres_evaluadores,
    ROUND(AVG(rating), 2) AS rating_promedio
FROM math_teacher_reviews;

SELECT 
    'DISTRIBUCIÓN RATINGS PROFESORES' AS seccion,
    rating,
    COUNT(*) AS cantidad,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM math_teacher_reviews WHERE rating IS NOT NULL), 2) AS porcentaje
FROM math_teacher_reviews 
WHERE rating IS NOT NULL
GROUP BY rating
ORDER BY rating DESC;

-- ✅ PASO 8: ANÁLISIS DE math_teacher_student_requests
SELECT 
    'TEACHER STUDENT REQUESTS ESTADÍSTICAS' AS seccion,
    status AS estado,
    COUNT(*) AS cantidad,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM math_teacher_student_requests), 2) AS porcentaje
FROM math_teacher_student_requests 
GROUP BY status
ORDER BY cantidad DESC;

SELECT 
    'REQUESTS ACTIVIDAD RECIENTE' AS seccion,
    DATE(created_at) AS fecha,
    COUNT(*) AS requests_creados
FROM math_teacher_student_requests 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY fecha DESC
LIMIT 10;

-- ✅ PASO 9: ANÁLISIS DE math_user_progress
SELECT 
    'USER PROGRESS ESTADÍSTICAS' AS seccion,
    COUNT(*) AS total_usuarios_con_progreso,
    COUNT(DISTINCT user_id) AS usuarios_unicos,
    ROUND(AVG(total_exercises), 2) AS ejercicios_promedio,
    ROUND(AVG(correct_exercises), 2) AS aciertos_promedio
FROM math_user_progress
WHERE total_exercises IS NOT NULL;

-- ✅ PASO 10: ACTIVIDAD RECIENTE EN TODAS LAS TABLAS (ÚLTIMOS 7 DÍAS)
SELECT 
    'ACTIVIDAD ÚLTIMOS 7 DÍAS' AS seccion,
    'math_profiles' AS tabla,
    COUNT(*) AS registros_nuevos
FROM math_profiles 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
UNION ALL
SELECT 
    'ACTIVIDAD ÚLTIMOS 7 DÍAS',
    'math_exercises',
    COUNT(*)
FROM math_exercises 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
UNION ALL
SELECT 
    'ACTIVIDAD ÚLTIMOS 7 DÍAS',
    'math_sessions',
    COUNT(*)
FROM math_sessions 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
UNION ALL
SELECT 
    'ACTIVIDAD ÚLTIMOS 7 DÍAS',
    'math_story_attempts',
    COUNT(*)
FROM math_story_attempts 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
UNION ALL
SELECT 
    'ACTIVIDAD ÚLTIMOS 7 DÍAS',
    'math_teacher_reviews',
    COUNT(*)
FROM math_teacher_reviews 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
UNION ALL
SELECT 
    'ACTIVIDAD ÚLTIMOS 7 DÍAS',
    'math_teacher_student_requests',
    COUNT(*)
FROM math_teacher_student_requests 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days';

-- ✅ PASO 11: MUESTRAS DE DATOS REPRESENTATIVAS
SELECT 
    'MUESTRA PROFILES RECIENTES' AS seccion,
    full_name AS nombre,
    user_role AS rol,
    email,
    is_active AS activo,
    rating AS calificacion,
    total_reviews AS resenas,
    DATE(created_at) AS fecha_registro
FROM math_profiles 
ORDER BY created_at DESC 
LIMIT 5;

SELECT 
    'MUESTRA EXERCISES DETALLADA' AS seccion,
    operation AS operacion,
    level AS nivel,
    number1,
    number2,
    correct_answer AS respuesta_correcta,
    is_story_problem AS tiene_historia,
    DATE(created_at) AS fecha_creacion
FROM math_exercises 
ORDER BY created_at DESC 
LIMIT 5;

SELECT 
    'MUESTRA SESSIONS ACTIVAS' AS seccion,
    user_id,
    level AS nivel,
    duration_minutes AS duracion_min,
    DATE(created_at) AS fecha_sesion
FROM math_sessions 
ORDER BY created_at DESC 
LIMIT 5;

-- ✅ PASO 12: VALIDACIÓN DE COLUMNAS PARA ANALYTICS SERVICE
SELECT 
    'COLUMNAS ANALYTICS DISPONIBLES' AS seccion,
    table_name AS tabla,
    column_name AS columna,
    data_type AS tipo,
    is_nullable AS permite_null
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN (
        'math_profiles', 'math_sessions', 'math_exercises', 'math_user_progress',
        'math_exercise_sessions', 'math_skills_catalog', 'math_story_attempts',
        'math_teacher_reviews', 'math_teacher_student_requests'
    )
    AND column_name IN (
        'user_role', 'is_active', 'rating', 'total_reviews',
        'exercises_completed', 'correct_answers', 'duration_minutes',
        'last_session_date', 'session_count', 'total_exercises',
        'operation', 'level', 'difficulty_tags', 'is_story_problem',
        'created_at', 'updated_at', 'user_id', 'id', 'status',
        'skill_name', 'category', 'is_correct', 'teacher_id', 'parent_id'
    )
ORDER BY table_name, column_name;

-- ✅ PASO 13: ANÁLISIS DE RELACIONES ENTRE TABLAS
SELECT 
    'USUARIOS CON SESIONES' AS seccion,
    COUNT(DISTINCT p.id) AS usuarios_totales,
    COUNT(DISTINCT s.user_id) AS usuarios_con_sesiones,
    ROUND(COUNT(DISTINCT s.user_id) * 100.0 / COUNT(DISTINCT p.id), 2) AS porcentaje_activos
FROM math_profiles p
LEFT JOIN math_sessions s ON p.user_id = s.user_id;

SELECT 
    'USUARIOS CON PROGRESO' AS seccion,
    COUNT(DISTINCT p.id) AS usuarios_totales,
    COUNT(DISTINCT up.user_id) AS usuarios_con_progreso,
    ROUND(COUNT(DISTINCT up.user_id) * 100.0 / COUNT(DISTINCT p.id), 2) AS porcentaje_con_progreso
FROM math_profiles p
LEFT JOIN math_user_progress up ON p.user_id = up.user_id;