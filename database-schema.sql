-- Schema SQL para Matemágica PWA con Supabase
-- Ejecuta estas consultas en el editor SQL de Supabase
-- ✅ TABLAS CON PREFIJO "math_" para evitar confusiones

-- 1. Tabla de perfiles de estudiantes
CREATE TABLE math_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    preferred_level INTEGER DEFAULT 1 CHECK (preferred_level BETWEEN 1 AND 3),
    total_exercises INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    favorite_operation TEXT DEFAULT '+',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de sesiones de ejercicios
CREATE TABLE math_exercise_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES math_profiles(id) ON DELETE CASCADE,
    level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 3),
    additions_count INTEGER DEFAULT 0,
    subtractions_count INTEGER DEFAULT 0,
    session_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    exercises_data JSONB -- Almacena los ejercicios completos
);

-- 3. Tabla de intentos en cuentos matemáticos
CREATE TABLE math_story_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES math_profiles(id) ON DELETE CASCADE,
    story_text TEXT NOT NULL,
    operation TEXT NOT NULL,
    num1 INTEGER NOT NULL,
    num2 INTEGER NOT NULL,
    user_answer INTEGER,
    correct_answer INTEGER NOT NULL,
    is_correct BOOLEAN NOT NULL,
    attempt_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla de progreso de usuario (estadísticas agregadas)
CREATE TABLE math_user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES math_profiles(id) ON DELETE CASCADE UNIQUE,
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

-- 5. Políticas de seguridad RLS (Row Level Security)

-- Habilitar RLS en todas las tablas
ALTER TABLE math_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE math_exercise_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE math_story_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE math_user_progress ENABLE ROW LEVEL SECURITY;

-- Políticas para math_profiles: Los usuarios solo pueden ver/editar su propio perfil
CREATE POLICY "Users can view own profile" ON math_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON math_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON math_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para math_exercise_sessions: Solo acceso a propias sesiones
CREATE POLICY "Users can view own exercise sessions" ON math_exercise_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exercise sessions" ON math_exercise_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para math_story_attempts: Solo acceso a propios intentos
CREATE POLICY "Users can view own story attempts" ON math_story_attempts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own story attempts" ON math_story_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para math_user_progress: Solo acceso a propio progreso
CREATE POLICY "Users can view own progress" ON math_user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON math_user_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON math_user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Funciones útiles

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_math_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en math_profiles
CREATE TRIGGER update_math_profiles_updated_at 
    BEFORE UPDATE ON math_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_math_updated_at_column();

-- Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_math_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.math_profiles (id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Estudiante'));
    
    INSERT INTO public.math_user_progress (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_math_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_math_user();

-- 7. Índices para mejorar rendimiento
CREATE INDEX idx_math_exercise_sessions_user_date ON math_exercise_sessions(user_id, session_date DESC);
CREATE INDEX idx_math_story_attempts_user_date ON math_story_attempts(user_id, attempt_date DESC);
CREATE INDEX idx_math_profiles_updated_at ON math_profiles(updated_at DESC);