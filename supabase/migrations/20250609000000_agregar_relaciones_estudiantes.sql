-- ✅ MIGRACIÓN: Agregar soporte para perfiles de estudiantes y relaciones
-- Fecha: 9 de junio de 2025
-- Propósito: Permitir que apoderados/profesores gestionen perfiles de hijos/alumnos

-- PASO 1: Modificar tabla math_profiles para soportar relaciones
ALTER TABLE public.math_profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS user_role TEXT CHECK (user_role IN ('parent', 'teacher', 'student', 'admin')) DEFAULT 'student',
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Copiar datos existentes de nombre_completo a full_name
UPDATE public.math_profiles SET full_name = nombre_completo WHERE full_name IS NULL;

-- Hacer full_name NOT NULL después de la migración de datos
ALTER TABLE public.math_profiles ALTER COLUMN full_name SET NOT NULL;

-- PASO 2: Remover la restricción UNIQUE(user_id) para permitir múltiples perfiles por usuario
ALTER TABLE public.math_profiles DROP CONSTRAINT IF EXISTS math_profiles_user_id_key;

-- PASO 3: Crear índices adicionales para las nuevas columnas
CREATE INDEX IF NOT EXISTS idx_math_profiles_parent_id ON public.math_profiles(parent_id);
CREATE INDEX IF NOT EXISTS idx_math_profiles_teacher_id ON public.math_profiles(teacher_id);
CREATE INDEX IF NOT EXISTS idx_math_profiles_user_role ON public.math_profiles(user_role);

-- PASO 4: Actualizar políticas RLS para incluir relaciones padre-hijo y profesor-alumno
DROP POLICY IF EXISTS "math_profiles_select_own" ON public.math_profiles;
DROP POLICY IF EXISTS "math_profiles_insert_own" ON public.math_profiles;
DROP POLICY IF EXISTS "math_profiles_update_own" ON public.math_profiles;

-- Nueva política SELECT: usuarios pueden ver sus propios perfiles Y los de sus hijos/alumnos
CREATE POLICY "math_profiles_select_extended" ON public.math_profiles
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() = parent_id OR 
        auth.uid() = teacher_id
    );

-- Nueva política INSERT: usuarios pueden crear sus propios perfiles Y perfiles de hijos/alumnos
CREATE POLICY "math_profiles_insert_extended" ON public.math_profiles
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR 
        auth.uid() = parent_id OR 
        auth.uid() = teacher_id
    );

-- Nueva política UPDATE: usuarios pueden actualizar sus propios perfiles Y los de sus hijos/alumnos
CREATE POLICY "math_profiles_update_extended" ON public.math_profiles
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        auth.uid() = parent_id OR 
        auth.uid() = teacher_id
    );

-- PASO 5: Actualizar las otras tablas para que también soporten las relaciones
-- Actualizar políticas de sessions para incluir relaciones
DROP POLICY IF EXISTS "math_sessions_select_own" ON public.math_exercise_sessions;
DROP POLICY IF EXISTS "math_sessions_insert_own" ON public.math_exercise_sessions;
DROP POLICY IF EXISTS "math_sessions_update_own" ON public.math_exercise_sessions;

CREATE POLICY "math_sessions_select_extended" ON public.math_exercise_sessions
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.math_profiles 
            WHERE math_profiles.user_id = math_exercise_sessions.user_id 
            AND (math_profiles.parent_id = auth.uid() OR math_profiles.teacher_id = auth.uid())
        )
    );

CREATE POLICY "math_sessions_insert_extended" ON public.math_exercise_sessions
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.math_profiles 
            WHERE math_profiles.user_id = math_exercise_sessions.user_id 
            AND (math_profiles.parent_id = auth.uid() OR math_profiles.teacher_id = auth.uid())
        )
    );

CREATE POLICY "math_sessions_update_extended" ON public.math_exercise_sessions
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.math_profiles 
            WHERE math_profiles.user_id = math_exercise_sessions.user_id 
            AND (math_profiles.parent_id = auth.uid() OR math_profiles.teacher_id = auth.uid())
        )
    );

-- PASO 6: Mensaje de confirmación
DO $$ 
BEGIN
    RAISE NOTICE '🎉 ¡MIGRACIÓN DE RELACIONES COMPLETADA!';
    RAISE NOTICE '✅ Agregado soporte para full_name';
    RAISE NOTICE '✅ Agregado soporte para user_role (parent/teacher/student)';
    RAISE NOTICE '✅ Agregado soporte para parent_id y teacher_id';
    RAISE NOTICE '✅ Políticas RLS actualizadas para relaciones';
    RAISE NOTICE '✅ Índices creados para optimización';
    RAISE NOTICE '🚀 Ahora apoderados y profesores pueden gestionar perfiles de estudiantes';
END $$;