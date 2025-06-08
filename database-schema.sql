-- Schema SQL ACTUALIZADO para Matemágica PWA con Supabase
-- Sistema de autenticación con ROLES: Profesores y Apoderados
-- Ejecuta estas consultas en el editor SQL de Supabase
-- ✅ TABLAS CON PREFIJO "math_" para evitar confusiones

-- 1. Tabla de usuarios con roles (Profesores y Apoderados)
CREATE TABLE math_users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('profesor', 'apoderado')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de estudiantes (creados por profesores)
CREATE TABLE math_students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    grade TEXT NOT NULL, -- ej: "2° Básico", "1° Básico"
    age INTEGER CHECK (age BETWEEN 5 AND 12),
    created_by_teacher UUID REFERENCES math_users(id) ON DELETE CASCADE,
    preferred_level INTEGER DEFAULT 1 CHECK (preferred_level BETWEEN 1 AND 3),
    total_exercises INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    favorite_operation TEXT DEFAULT '+',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de relaciones apoderado-estudiante
CREATE TABLE math_parent_student_relations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID REFERENCES math_users(id) ON DELETE CASCADE,
    student_id UUID REFERENCES math_students(id) ON DELETE CASCADE,
    relationship_type TEXT DEFAULT 'apoderado', -- padre, madre, tutor, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(parent_id, student_id)
);

-- 4. Tabla de perfiles/progreso de estudiantes (mantiene compatibilidad)
CREATE TABLE math_profiles (
    id UUID REFERENCES math_students(id) PRIMARY KEY,
    full_name TEXT NOT NULL, -- duplicado para compatibilidad
    avatar_url TEXT,
    preferred_level INTEGER DEFAULT 1 CHECK (preferred_level BETWEEN 1 AND 3),
    total_exercises INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    favorite_operation TEXT DEFAULT '+',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabla de sesiones de ejercicios (actualizada)
CREATE TABLE math_exercise_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES math_students(id) ON DELETE CASCADE,
    accessed_by_user UUID REFERENCES math_users(id), -- quién accedió (profesor o apoderado)
    level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 3),
    additions_count INTEGER DEFAULT 0,
    subtractions_count INTEGER DEFAULT 0,
    session_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    exercises_data JSONB -- Almacena los ejercicios completos
);

-- 6. Tabla de intentos en cuentos matemáticos (actualizada)
CREATE TABLE math_story_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES math_students(id) ON DELETE CASCADE,
    accessed_by_user UUID REFERENCES math_users(id), -- quién accedió
    story_text TEXT NOT NULL,
    operation TEXT NOT NULL,
    num1 INTEGER NOT NULL,
    num2 INTEGER NOT NULL,
    user_answer INTEGER,
    correct_answer INTEGER NOT NULL,
    is_correct BOOLEAN NOT NULL,
    attempt_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabla de progreso de estudiantes (actualizada)
CREATE TABLE math_user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES math_students(id) ON DELETE CASCADE UNIQUE,
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    total_time_spent INTEGER DEFAULT 0, -- en minutos
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    achievements JSONB DEFAULT '[]'::jsonb,
    level_stats JSONB DEFAULT '{
        "1": {"exercises": 0, "correct": 0},
        "2": {"exercises": 0, "correct": 0}, 
        "3": {"exercises": 0, "correct": 0}
    }'::jsonb
);

-- ✅ TABLAS FALTANTES PARA MATEMÁGICA PWA
-- Estas son las tablas que el diagnóstico busca pero no encuentra

-- Tabla de sesiones de matemáticas (compatible con el diagnóstico)
CREATE TABLE IF NOT EXISTS math_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    student_name TEXT,
    level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 3),
    exercise_count INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    exercises_data JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de ejercicios matemáticos (banco de ejercicios)
CREATE TABLE IF NOT EXISTS math_exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    operation TEXT NOT NULL CHECK (operation IN ('+', '-', '*', '/')),
    level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 3),
    number1 INTEGER NOT NULL,
    number2 INTEGER NOT NULL,
    correct_answer INTEGER NOT NULL,
    difficulty_tags TEXT[] DEFAULT '{}',
    is_story_problem BOOLEAN DEFAULT false,
    story_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de progreso de usuarios (compatible con la app)
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    student_name TEXT,
    total_exercises INTEGER DEFAULT 0,
    total_correct INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    level_stats JSONB DEFAULT '{
        "1": {"exercises": 0, "correct": 0, "accuracy": 0},
        "2": {"exercises": 0, "correct": 0, "accuracy": 0}, 
        "3": {"exercises": 0, "correct": 0, "accuracy": 0}
    }'::jsonb,
    preferences JSONB DEFAULT '{
        "favorite_operation": "+",
        "preferred_level": 1,
        "theme": "light"
    }'::jsonb,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en las nuevas tablas
ALTER TABLE math_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE math_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para math_sessions
CREATE POLICY "Users can view own sessions" ON math_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON math_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON math_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para math_exercises (lectura pública, escritura solo autenticados)
CREATE POLICY "Anyone can view exercises" ON math_exercises
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert exercises" ON math_exercises
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update exercises" ON math_exercises
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Políticas para user_progress  
CREATE POLICY "Users can view own progress" ON user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- ✅ CORREGIR RLS EN math_profiles para que sea segura
DROP POLICY IF EXISTS "Enable read access for all users" ON math_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON math_profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON math_profiles;

-- Políticas seguras para math_profiles
CREATE POLICY "Users can view own profile" ON math_profiles
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own profile" ON math_profiles
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own profile" ON math_profiles
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Triggers para actualizar updated_at en las nuevas tablas
CREATE TRIGGER update_math_exercises_updated_at 
    BEFORE UPDATE ON math_exercises 
    FOR EACH ROW 
    EXECUTE FUNCTION update_math_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at 
    BEFORE UPDATE ON user_progress 
    FOR EACH ROW 
    EXECUTE FUNCTION update_math_updated_at_column();

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_math_sessions_user_date ON math_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_math_exercises_level_operation ON math_exercises(level, operation);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_activity ON user_progress(user_id, last_activity DESC);

-- Insertar algunos ejercicios de ejemplo para testing
INSERT INTO math_exercises (operation, level, number1, number2, correct_answer, difficulty_tags) VALUES
-- Nivel 1 (Fácil - sin reserva)
('+', 1, 5, 3, 8, ARRAY['facil', 'suma', 'sin_reserva']),
('+', 1, 12, 7, 19, ARRAY['facil', 'suma', 'sin_reserva']),
('+', 1, 23, 15, 38, ARRAY['facil', 'suma', 'sin_reserva']),
('-', 1, 9, 4, 5, ARRAY['facil', 'resta', 'sin_reserva']),
('-', 1, 18, 6, 12, ARRAY['facil', 'resta', 'sin_reserva']),
('-', 1, 35, 13, 22, ARRAY['facil', 'resta', 'sin_reserva']),

-- Nivel 2 (Medio - con reserva)
('+', 2, 27, 15, 42, ARRAY['medio', 'suma', 'con_reserva']),
('+', 2, 38, 24, 62, ARRAY['medio', 'suma', 'con_reserva']),
('+', 2, 49, 37, 86, ARRAY['medio', 'suma', 'con_reserva']),
('-', 2, 52, 28, 24, ARRAY['medio', 'resta', 'con_reserva']),
('-', 2, 73, 39, 34, ARRAY['medio', 'resta', 'con_reserva']),
('-', 2, 64, 27, 37, ARRAY['medio', 'resta', 'con_reserva']),

-- Nivel 3 (Difícil - mixto)
('+', 3, 58, 27, 85, ARRAY['dificil', 'suma', 'mixto']),
('+', 3, 39, 46, 85, ARRAY['dificil', 'suma', 'mixto']),
('-', 3, 91, 47, 44, ARRAY['dificil', 'resta', 'mixto']),
('-', 3, 83, 29, 54, ARRAY['dificil', 'resta', 'mixto'])

ON CONFLICT DO NOTHING;

-- ✅ COMENTARIOS INFORMATIVOS
-- Estas tablas ahora son compatibles con:
-- 1. El sistema de diagnóstico de la aplicación
-- 2. Las consultas que hace auth-manager.js
-- 3. Las políticas de seguridad RLS adecuadas
-- 4. La estructura esperada por la PWA Matemágica