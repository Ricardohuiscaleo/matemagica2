-- ✅ MIGRACIÓN: Recrear todas las tablas desde cero
-- Fecha: 7 de junio de 2025
-- Propósito: Eliminar tablas existentes y recrearlas con estructura correcta

-- PASO 1: Eliminar todas las políticas RLS existentes
DROP POLICY IF EXISTS "Users can view their own profile" ON public.math_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.math_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.math_profiles;
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.math_exercise_sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON public.math_exercise_sessions;
DROP POLICY IF EXISTS "Users can view their own attempts" ON public.math_story_attempts;
DROP POLICY IF EXISTS "Users can insert their own attempts" ON public.math_story_attempts;
DROP POLICY IF EXISTS "Users can view their own progress" ON public.math_user_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON public.math_user_progress;
DROP POLICY IF EXISTS "Users can insert their own progress" ON public.math_user_progress;

-- PASO 2: Eliminar todas las tablas existentes (en orden correcto por dependencias)
DROP TABLE IF EXISTS public.math_user_progress CASCADE;
DROP TABLE IF EXISTS public.math_story_attempts CASCADE;
DROP TABLE IF EXISTS public.math_exercise_sessions CASCADE;
DROP TABLE IF EXISTS public.math_profiles CASCADE;

-- PASO 3: Recrear todas las tablas con estructura correcta

-- Tabla: math_profiles (perfiles de usuario)
CREATE TABLE public.math_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre_completo TEXT NOT NULL,
    edad INTEGER CHECK (edad >= 5 AND edad <= 12),
    nivel_preferido TEXT CHECK (nivel_preferido IN ('facil', 'medio', 'dificil')) DEFAULT 'facil',
    configuracion JSONB DEFAULT '{}',
    estadisticas JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id)
);

-- Tabla: math_exercise_sessions (sesiones de ejercicios)
CREATE TABLE public.math_exercise_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nivel TEXT NOT NULL CHECK (nivel IN ('facil', 'medio', 'dificil')),
    ejercicios JSONB NOT NULL,
    respuestas JSONB DEFAULT '{}',
    puntuacion INTEGER DEFAULT 0,
    tiempo_total INTEGER DEFAULT 0, -- en segundos
    completado BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    finished_at TIMESTAMP WITH TIME ZONE
);

-- Tabla: math_story_attempts (intentos de cuentos matemáticos)
CREATE TABLE public.math_story_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    contenido TEXT NOT NULL,
    ejercicios JSONB NOT NULL,
    respuestas JSONB DEFAULT '{}',
    puntuacion INTEGER DEFAULT 0,
    completado BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    finished_at TIMESTAMP WITH TIME ZONE
);

-- Tabla: math_user_progress (progreso del usuario)
CREATE TABLE public.math_user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nivel TEXT NOT NULL CHECK (nivel IN ('facil', 'medio', 'dificil')),
    ejercicios_completados INTEGER DEFAULT 0,
    ejercicios_correctos INTEGER DEFAULT 0,
    total_puntos INTEGER DEFAULT 0,
    tiempo_total_estudio INTEGER DEFAULT 0, -- en minutos
    racha_actual INTEGER DEFAULT 0,
    racha_maxima INTEGER DEFAULT 0,
    ultima_sesion TIMESTAMP WITH TIME ZONE,
    logros JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, nivel)
);

-- PASO 4: Crear índices para optimización
CREATE INDEX idx_math_profiles_user_id ON public.math_profiles(user_id);
CREATE INDEX idx_math_exercise_sessions_user_id ON public.math_exercise_sessions(user_id);
CREATE INDEX idx_math_exercise_sessions_nivel ON public.math_exercise_sessions(nivel);
CREATE INDEX idx_math_story_attempts_user_id ON public.math_story_attempts(user_id);
CREATE INDEX idx_math_user_progress_user_id ON public.math_user_progress(user_id);
CREATE INDEX idx_math_user_progress_nivel ON public.math_user_progress(nivel);

-- PASO 5: Habilitar Row Level Security
ALTER TABLE public.math_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.math_exercise_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.math_story_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.math_user_progress ENABLE ROW LEVEL SECURITY;

-- PASO 6: Crear políticas RLS (ahora todo está en orden)

-- Políticas para math_profiles
CREATE POLICY "math_profiles_select_own" ON public.math_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "math_profiles_insert_own" ON public.math_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "math_profiles_update_own" ON public.math_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para math_exercise_sessions
CREATE POLICY "math_sessions_select_own" ON public.math_exercise_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "math_sessions_insert_own" ON public.math_exercise_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "math_sessions_update_own" ON public.math_exercise_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para math_story_attempts
CREATE POLICY "math_stories_select_own" ON public.math_story_attempts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "math_stories_insert_own" ON public.math_story_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "math_stories_update_own" ON public.math_story_attempts
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para math_user_progress
CREATE POLICY "math_progress_select_own" ON public.math_user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "math_progress_insert_own" ON public.math_user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "math_progress_update_own" ON public.math_user_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- PASO 7: Crear funciones para actualizar timestamps automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers para actualizar automáticamente updated_at
CREATE TRIGGER update_math_profiles_updated_at
    BEFORE UPDATE ON public.math_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_math_user_progress_updated_at
    BEFORE UPDATE ON public.math_user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- PASO 8: Mensaje de confirmación
DO $$ 
BEGIN
    RAISE NOTICE '🎉 ¡MIGRACIÓN COMPLETADA EXITOSAMENTE!';
    RAISE NOTICE '✅ Todas las tablas recreadas con estructura correcta';
    RAISE NOTICE '✅ Columnas user_id incluidas desde el inicio';
    RAISE NOTICE '✅ Índices creados para optimización';
    RAISE NOTICE '✅ Políticas RLS configuradas correctamente';
    RAISE NOTICE '✅ Triggers para timestamps automáticos';
    RAISE NOTICE '🚀 Base de datos lista para Matemágica PWA';
END $$;