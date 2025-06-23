-- ===================================
-- CONSULTA ÚNICA: TODAS LAS ESTRUCTURAS EN UNA SOLA CONSULTA
-- ===================================

SELECT 
    'math_profiles' AS tabla,
    STRING_AGG(column_name, ', ' ORDER BY ordinal_position) AS estructura
FROM information_schema.columns 
WHERE table_name = 'math_profiles' AND table_schema = 'public'

UNION ALL

SELECT 
    'math_exercises' AS tabla,
    STRING_AGG(column_name, ', ' ORDER BY ordinal_position) AS estructura
FROM information_schema.columns 
WHERE table_name = 'math_exercises' AND table_schema = 'public'

UNION ALL

SELECT 
    'math_sessions' AS tabla,
    STRING_AGG(column_name, ', ' ORDER BY ordinal_position) AS estructura
FROM information_schema.columns 
WHERE table_name = 'math_sessions' AND table_schema = 'public'

UNION ALL

SELECT 
    'math_user_progress' AS tabla,
    STRING_AGG(column_name, ', ' ORDER BY ordinal_position) AS estructura
FROM information_schema.columns 
WHERE table_name = 'math_user_progress' AND table_schema = 'public'

UNION ALL

SELECT 
    'math_exercise_sessions' AS tabla,
    STRING_AGG(column_name, ', ' ORDER BY ordinal_position) AS estructura
FROM information_schema.columns 
WHERE table_name = 'math_exercise_sessions' AND table_schema = 'public'

UNION ALL

SELECT 
    'math_skills_catalog' AS tabla,
    STRING_AGG(column_name, ', ' ORDER BY ordinal_position) AS estructura
FROM information_schema.columns 
WHERE table_name = 'math_skills_catalog' AND table_schema = 'public'

UNION ALL

SELECT 
    'math_story_attempts' AS tabla,
    STRING_AGG(column_name, ', ' ORDER BY ordinal_position) AS estructura
FROM information_schema.columns 
WHERE table_name = 'math_story_attempts' AND table_schema = 'public'

UNION ALL

SELECT 
    'math_teacher_reviews' AS tabla,
    STRING_AGG(column_name, ', ' ORDER BY ordinal_position) AS estructura
FROM information_schema.columns 
WHERE table_name = 'math_teacher_reviews' AND table_schema = 'public'

UNION ALL

SELECT 
    'math_teacher_student_requests' AS tabla,
    STRING_AGG(column_name, ', ' ORDER BY ordinal_position) AS estructura
FROM information_schema.columns 
WHERE table_name = 'math_teacher_student_requests' AND table_schema = 'public'

ORDER BY tabla;