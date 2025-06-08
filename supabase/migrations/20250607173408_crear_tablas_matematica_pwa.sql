-- ✅ MIGRACIÓN PARA MATEMÁGICA PWA
-- Creación de tablas básicas para la aplicación educativa
-- Fecha: 7 de junio de 2025

-- 1. CREAR TABLA DE PERFILES DE USUARIO
CREATE TABLE IF NOT EXISTS public.math_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    preferred_level INTEGER DEFAULT 1 CHECK (preferred_level BETWEEN 1 AND 3),
    total_exercises INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    favorite_operation TEXT DEFAULT '+' CHECK (favorite_operation IN ('+', '-')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CREAR TABLA DE SESIONES DE EJERCICIOS
CREATE TABLE IF NOT EXISTS public.math_exercise_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 3),
    additions_count INTEGER DEFAULT 0,
    subtractions_count INTEGER DEFAULT 0,
    total_exercises INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    session_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_minutes INTEGER DEFAULT 0,
    accuracy_percentage DECIMAL(5,2) DEFAULT 0.00,
    exercises_data JSONB DEFAULT '[]'::jsonb,
    notes TEXT
);

-- 3. CREAR TABLA DE INTENTOS DE CUENTOS MATEMÁTICOS
CREATE TABLE IF NOT EXISTS public.math_story_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    story_text TEXT NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('+', '-')),
    num1 INTEGER NOT NULL CHECK (num1 BETWEEN 1 AND 99),
    num2 INTEGER NOT NULL CHECK (num2 BETWEEN 1 AND 99),
    user_answer INTEGER,
    correct_answer INTEGER NOT NULL,
    is_correct BOOLEAN NOT NULL,
    response_time_seconds INTEGER DEFAULT 0,
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 3),
    attempt_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREAR TABLA DE PROGRESO DE USUARIOS
CREATE TABLE IF NOT EXISTS public.math_user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    total_time_spent INTEGER DEFAULT 0, -- en minutos
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    achievements JSONB DEFAULT '[]'::jsonb,
    level_stats JSONB DEFAULT '{
        "1": {"exercises": 0, "correct": 0, "time_spent": 0},
        "2": {"exercises": 0, "correct": 0, "time_spent": 0}, 
        "3": {"exercises": 0, "correct": 0, "time_spent": 0}
    }'::jsonb,
    weekly_goals JSONB DEFAULT '{
        "exercises_goal": 50,
        "current_exercises": 0,
        "week_start": null
    }'::jsonb
);

-- 5. CREAR ÍNDICES BÁSICOS
CREATE INDEX IF NOT EXISTS idx_math_exercise_sessions_level ON public.math_exercise_sessions(level);
CREATE INDEX IF NOT EXISTS idx_math_story_attempts_operation ON public.math_story_attempts(operation);
CREATE INDEX IF NOT EXISTS idx_math_story_attempts_correct ON public.math_story_attempts(is_correct);

-- NOTA: Las políticas RLS y seguridad se configurarán en migraciones posteriores
-- una vez que se agreguen las columnas user_id necesarias.

DO $$ 
BEGIN
    RAISE NOTICE '✅ Tablas básicas creadas. Configuración de seguridad pendiente en migraciones posteriores.';
END $$;