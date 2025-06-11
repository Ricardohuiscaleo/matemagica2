-- ✅ MIGRACIÓN: Corregir restricción NOT NULL en user_id para perfiles de estudiantes
-- Fecha: 9 de junio de 2025
-- Propósito: Permitir perfiles de estudiantes sin user_id (gestionados por apoderados/profesores)

-- PASO 1: Hacer user_id opcional para perfiles de estudiantes gestionados
ALTER TABLE public.math_profiles ALTER COLUMN user_id DROP NOT NULL;

-- PASO 2: Agregar constraint para asegurar que al menos uno de user_id, parent_id o teacher_id esté presente
ALTER TABLE public.math_profiles 
ADD CONSTRAINT math_profiles_identity_check 
CHECK (
    user_id IS NOT NULL OR 
    parent_id IS NOT NULL OR 
    teacher_id IS NOT NULL
);

-- PASO 3: Agregar constraint para asegurar que los estudiantes tengan parent_id O teacher_id
ALTER TABLE public.math_profiles 
ADD CONSTRAINT math_profiles_student_relation_check 
CHECK (
    user_role != 'student' OR 
    (parent_id IS NOT NULL OR teacher_id IS NOT NULL)
);

-- PASO 4: Mensaje de confirmación
DO $$ 
BEGIN
    RAISE NOTICE '🎉 ¡CORRECCIÓN DE RESTRICCIONES COMPLETADA!';
    RAISE NOTICE '✅ user_id ahora es opcional para perfiles de estudiantes';
    RAISE NOTICE '✅ Agregado constraint para asegurar identidad (user_id, parent_id o teacher_id)';
    RAISE NOTICE '✅ Agregado constraint para estudiantes requieren parent_id o teacher_id';
    RAISE NOTICE '🚀 Ahora se pueden crear perfiles de estudiantes sin user_id';
END $$;