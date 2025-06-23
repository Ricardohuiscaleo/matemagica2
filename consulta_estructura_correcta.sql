-- ===================================
-- CONSULTA CORRECTA: UNA FILA POR TABLA CON ESTRUCTURA
-- ===================================

-- ✅ TABLA 1: math_profiles
SELECT 
    'math_profiles' AS tabla,
    STRING_AGG(column_name, ', ' ORDER BY ordinal_position) AS estructura
FROM information_schema.columns 
WHERE table_name = 'math_profiles' AND table_schema = 'public';

-- ✅ TABLA 2: math_exercises  
SELECT 
    'math_exercises' AS tabla,
    STRING_AGG(column_name, ', ' ORDER BY ordinal_position) AS estructura
FROM information_schema.columns 
WHERE table_name = 'math_exercises' AND table_schema = 'public';

-- ✅ TABLA 3: math_sessions
SELECT 
    'math_sessions' AS tabla,
    STRING_AGG(column_name, ', ' ORDER BY ordinal_position) AS estructura
FROM information_schema.columns 
WHERE table_name = 'math_sessions' AND table_schema = 'public';

-- ✅ TABLA 4: math_user_progress
SELECT 
    'math_user_progress' AS tabla,
    STRING_AGG(column_name, ', ' ORDER BY ordinal_position) AS estructura
FROM information_schema.columns 
WHERE table_name = 'math_user_progress' AND table_schema = 'public';

-- ✅ TABLA 5: math_exercise_sessions
SELECT 
    'math_exercise_sessions' AS tabla,
    STRING_AGG(column_name, ', ' ORDER BY ordinal_position) AS estructura
FROM information_schema.columns 
WHERE table_name = 'math_exercise_sessions' AND table_schema = 'public';

-- ✅ TABLA 6: math_skills_catalog
SELECT 
    'math_skills_catalog' AS tabla,
    STRING_AGG(column_name, ', ' ORDER BY ordinal_position) AS estructura
FROM information_schema.columns 
WHERE table_name = 'math_skills_catalog' AND table_schema = 'public';

-- ✅ TABLA 7: math_story_attempts
SELECT 
    'math_story_attempts' AS tabla,
    STRING_AGG(column_name, ', ' ORDER BY ordinal_position) AS estructura
FROM information_schema.columns 
WHERE table_name = 'math_story_attempts' AND table_schema = 'public';

-- ✅ TABLA 8: math_teacher_reviews
SELECT 
    'math_teacher_reviews' AS tabla,
    STRING_AGG(column_name, ', ' ORDER BY ordinal_position) AS estructura
FROM information_schema.columns 
WHERE table_name = 'math_teacher_reviews' AND table_schema = 'public';

-- ✅ TABLA 9: math_teacher_student_requests
SELECT 
    'math_teacher_student_requests' AS tabla,
    STRING_AGG(column_name, ', ' ORDER BY ordinal_position) AS estructura
FROM information_schema.columns 
WHERE table_name = 'math_teacher_student_requests' AND table_schema = 'public';