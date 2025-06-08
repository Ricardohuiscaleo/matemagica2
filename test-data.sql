-- Datos de prueba para Matemágica PWA
-- Ejecutar DESPUÉS de database-schema.sql en Supabase
-- ⚠️ Solo para desarrollo/testing

-- 1. Profesor de ejemplo
INSERT INTO math_users (id, email, full_name, role, avatar_url) VALUES 
('11111111-1111-1111-1111-111111111111', 'profesora.maria@colegio.cl', 'María González', 'profesor', 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=100&h=100&fit=crop&crop=face');

-- 2. Estudiantes del profesor
INSERT INTO math_students (id, name, grade, age, created_by_teacher, preferred_level, total_exercises, correct_answers, favorite_operation, is_active) VALUES 
('22222222-2222-2222-2222-222222222222', 'Pedro Sánchez', '2° Básico', 8, '11111111-1111-1111-1111-111111111111', 2, 15, 12, '+', true),
('33333333-3333-3333-3333-333333333333', 'Ana López', '1° Básico', 7, '11111111-1111-1111-1111-111111111111', 1, 8, 6, '+', true),
('44444444-4444-4444-4444-444444444444', 'Carlos Ruiz', '2° Básico', 8, '11111111-1111-1111-1111-111111111111', 3, 25, 20, '-', true),
('55555555-5555-5555-5555-555555555555', 'Sofía Morales', '1° Básico', 6, '11111111-1111-1111-1111-111111111111', 1, 5, 4, '+', true);

-- 3. Apoderados de ejemplo
INSERT INTO math_users (id, email, full_name, role, avatar_url) VALUES 
('66666666-6666-6666-6666-666666666666', 'carmen.vargas@gmail.com', 'Carmen Vargas', 'apoderado', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'),
('77777777-7777-7777-7777-777777777777', 'roberto.lopez@outlook.com', 'Roberto López', 'apoderado', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'),
('88888888-8888-8888-8888-888888888888', 'lucia.ruiz@hotmail.com', 'Lucía Ruiz', 'apoderado', null);

-- 4. Relaciones apoderado-estudiante
INSERT INTO math_parent_student_relations (parent_id, student_id, relationship_type) VALUES 
('66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 'madre'),
('77777777-7777-7777-7777-777777777777', '33333333-3333-3333-3333-333333333333', 'padre'),
('88888888-8888-8888-8888-888888888888', '44444444-4444-4444-4444-444444444444', 'madre');

-- 5. Sesiones de ejercicios de ejemplo
INSERT INTO math_exercise_sessions (student_id, accessed_by_user, level, additions_count, subtractions_count, exercises_data) VALUES 
('22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 2, 50, 50, '{"level": 2, "additions": [{"num1": 25, "num2": 17}, {"num1": 34, "num2": 28}], "subtractions": [{"num1": 45, "num2": 18}, {"num1": 62, "num2": 25}]}'),
('33333333-3333-3333-3333-333333333333', '77777777-7777-7777-7777-777777777777', 1, 30, 30, '{"level": 1, "additions": [{"num1": 12, "num2": 15}, {"num1": 23, "num2": 14}], "subtractions": [{"num1": 35, "num2": 12}, {"num1": 28, "num2": 16}]}'),
('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 3, 50, 50, '{"level": 3, "additions": [{"num1": 47, "num2": 35}, {"num1": 58, "num2": 27}], "subtractions": [{"num1": 73, "num2": 28}, {"num1": 91, "num2": 45}]}');

-- 6. Intentos en cuentos matemáticos
INSERT INTO math_story_attempts (student_id, accessed_by_user, story_text, operation, num1, num2, user_answer, correct_answer, is_correct) VALUES 
('22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'Pedro tenía 25 cartas de fútbol. Su amigo le regaló 17 cartas más. ¿Cuántas cartas tiene Pedro ahora?', '+', 25, 17, 42, 42, true),
('33333333-3333-3333-3333-333333333333', '77777777-7777-7777-7777-777777777777', 'Ana recogió 23 flores en el jardín. Le dio 14 flores a su mamá. ¿Cuántas flores le quedan a Ana?', '-', 23, 14, 9, 9, true),
('44444444-4444-4444-4444-444444444444', '88888888-8888-8888-8888-888888888888', 'Carlos tenía 73 stickers. Regaló 28 stickers a sus amigos. ¿Cuántos stickers le quedan?', '-', 73, 28, 40, 45, false);

-- 7. Progreso de usuarios actualizado
INSERT INTO math_user_progress (student_id, current_streak, best_streak, total_time_spent, achievements, level_stats) VALUES 
('22222222-2222-2222-2222-222222222222', 3, 5, 45, '["primera_sesion", "racha_5"]', '{"1": {"exercises": 5, "correct": 4}, "2": {"exercises": 15, "correct": 12}, "3": {"exercises": 3, "correct": 2}}'),
('33333333-3333-3333-3333-333333333333', 2, 3, 25, '["primera_sesion"]', '{"1": {"exercises": 8, "correct": 6}, "2": {"exercises": 0, "correct": 0}, "3": {"exercises": 0, "correct": 0}}'),
('44444444-4444-4444-4444-444444444444', 4, 6, 67, '["primera_sesion", "racha_5", "nivel_dificil"]', '{"1": {"exercises": 8, "correct": 7}, "2": {"exercises": 12, "correct": 10}, "3": {"exercises": 25, "correct": 20}}'),
('55555555-5555-5555-5555-555555555555', 1, 1, 15, '["primera_sesion"]', '{"1": {"exercises": 5, "correct": 4}, "2": {"exercises": 0, "correct": 0}, "3": {"exercises": 0, "correct": 0}}');

-- 8. Verificar datos insertados
DO $$
BEGIN
    RAISE NOTICE 'Datos de prueba insertados exitosamente:';
    RAISE NOTICE '- % profesores', (SELECT COUNT(*) FROM math_users WHERE role = 'profesor');
    RAISE NOTICE '- % apoderados', (SELECT COUNT(*) FROM math_users WHERE role = 'apoderado');
    RAISE NOTICE '- % estudiantes', (SELECT COUNT(*) FROM math_students);
    RAISE NOTICE '- % relaciones apoderado-estudiante', (SELECT COUNT(*) FROM math_parent_student_relations);
    RAISE NOTICE '- % sesiones de ejercicios', (SELECT COUNT(*) FROM math_exercise_sessions);
    RAISE NOTICE '- % intentos de cuentos', (SELECT COUNT(*) FROM math_story_attempts);
    RAISE NOTICE '- % registros de progreso', (SELECT COUNT(*) FROM math_user_progress);
END $$;

-- 9. Consultas útiles para verificar los datos

-- Ver todos los estudiantes de un profesor
-- SELECT s.*, u.full_name as teacher_name 
-- FROM math_students s 
-- JOIN math_users u ON s.created_by_teacher = u.id 
-- WHERE u.role = 'profesor';

-- Ver relaciones apoderado-estudiante
-- SELECT 
--     p.full_name as parent_name,
--     s.name as student_name,
--     r.relationship_type,
--     s.grade
-- FROM math_parent_student_relations r
-- JOIN math_users p ON r.parent_id = p.id
-- JOIN math_students s ON r.student_id = s.id;

-- Ver progreso de estudiantes
-- SELECT 
--     s.name as student_name,
--     s.grade,
--     s.total_exercises,
--     s.correct_answers,
--     ROUND((s.correct_answers::decimal / NULLIF(s.total_exercises, 0)) * 100, 1) as accuracy_percentage,
--     up.current_streak,
--     up.best_streak
-- FROM math_students s
-- LEFT JOIN math_user_progress up ON s.id = up.student_id
-- ORDER BY s.grade, s.name;