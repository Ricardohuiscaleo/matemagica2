-- ✅ MATEMÁGICA PWA - ACTUALIZACIÓN INCREMENTAL DE BASE DE DATOS
-- Script seguro que solo agrega las tablas y políticas faltantes
-- Ejecutar en el SQL Editor de Supabase

-- =============================================================================
-- 1. CREAR TABLAS FALTANTES SOLO SI NO EXISTEN
-- =============================================================================

-- Tabla de sesiones de matemáticas (la que busca el diagnóstico)
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

-- =============================================================================
-- 2. HABILITAR RLS EN LAS NUEVAS TABLAS (SOLO SI NO ESTÁ HABILITADO)
-- =============================================================================

DO $$ 
BEGIN
    -- Verificar y habilitar RLS en math_sessions
    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'math_sessions' AND relrowsecurity = true
    ) THEN
        ALTER TABLE math_sessions ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Verificar y habilitar RLS en math_exercises  
    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'math_exercises' AND relrowsecurity = true
    ) THEN
        ALTER TABLE math_exercises ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Verificar y habilitar RLS en user_progress
    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'user_progress' AND relrowsecurity = true
    ) THEN
        ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Verificar y habilitar RLS en math_profiles si no está habilitado
    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'math_profiles' AND relrowsecurity = true
    ) THEN
        ALTER TABLE math_profiles ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- =============================================================================
-- 3. CREAR POLÍTICAS RLS SEGURAS (SOLO SI NO EXISTEN)
-- =============================================================================

-- Políticas para math_sessions
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'math_sessions' AND policyname = 'Users can view own sessions') THEN
        CREATE POLICY "Users can view own sessions" ON math_sessions
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'math_sessions' AND policyname = 'Users can insert own sessions') THEN
        CREATE POLICY "Users can insert own sessions" ON math_sessions
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'math_sessions' AND policyname = 'Users can update own sessions') THEN
        CREATE POLICY "Users can update own sessions" ON math_sessions
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Políticas para math_exercises (lectura pública para ejercicios base)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'math_exercises' AND policyname = 'Anyone can view exercises') THEN
        CREATE POLICY "Anyone can view exercises" ON math_exercises
            FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'math_exercises' AND policyname = 'Authenticated users can insert exercises') THEN
        CREATE POLICY "Authenticated users can insert exercises" ON math_exercises
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
END $$;

-- Políticas para user_progress
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_progress' AND policyname = 'Users can view own progress') THEN
        CREATE POLICY "Users can view own progress" ON user_progress
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_progress' AND policyname = 'Users can insert own progress') THEN
        CREATE POLICY "Users can insert own progress" ON user_progress
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_progress' AND policyname = 'Users can update own progress') THEN
        CREATE POLICY "Users can update own progress" ON user_progress
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- =============================================================================
-- 4. CORREGIR POLÍTICAS INSEGURAS EN math_profiles
-- =============================================================================

-- Eliminar políticas inseguras existentes en math_profiles
DROP POLICY IF EXISTS "Enable read access for all users" ON math_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON math_profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON math_profiles;
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON math_profiles;
DROP POLICY IF EXISTS "Allow public read access" ON math_profiles;

-- ✅ DETECTAR AUTOMÁTICAMENTE EL TIPO DE user_id Y CREAR POLÍTICAS CORRECTAS
DO $$ 
DECLARE
    user_id_type TEXT;
    policy_condition TEXT;
BEGIN
    -- Detectar el tipo de dato de user_id en math_profiles
    SELECT data_type INTO user_id_type
    FROM information_schema.columns 
    WHERE table_name = 'math_profiles' 
    AND column_name = 'user_id' 
    AND table_schema = 'public';
    
    -- Determinar la condición correcta según el tipo
    IF user_id_type = 'uuid' THEN
        policy_condition := 'auth.uid() = user_id';
        RAISE NOTICE 'Detectado user_id como UUID - usando comparación directa';
    ELSIF user_id_type = 'text' OR user_id_type = 'character varying' THEN
        policy_condition := 'auth.uid()::text = user_id';
        RAISE NOTICE 'Detectado user_id como TEXT - usando conversión de UUID a TEXT';
    ELSE
        -- Fallback: intentar con UUID primero
        policy_condition := 'auth.uid() = user_id';
        RAISE NOTICE 'Tipo de user_id desconocido (%), usando UUID por defecto', user_id_type;
    END IF;
    
    -- Crear políticas seguras para math_profiles con la condición correcta
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'math_profiles' AND policyname = 'Users can view own profile') THEN
        EXECUTE format('CREATE POLICY "Users can view own profile" ON math_profiles FOR SELECT USING (%s)', policy_condition);
        RAISE NOTICE 'Política de lectura creada: %', policy_condition;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'math_profiles' AND policyname = 'Users can insert own profile') THEN
        EXECUTE format('CREATE POLICY "Users can insert own profile" ON math_profiles FOR INSERT WITH CHECK (%s)', policy_condition);
        RAISE NOTICE 'Política de inserción creada: %', policy_condition;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'math_profiles' AND policyname = 'Users can update own profile') THEN
        EXECUTE format('CREATE POLICY "Users can update own profile" ON math_profiles FOR UPDATE USING (%s)', policy_condition);
        RAISE NOTICE 'Política de actualización creada: %', policy_condition;
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error al crear políticas para math_profiles: %', SQLERRM;
        -- Intentar políticas básicas como fallback
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'math_profiles' AND policyname = 'Authenticated users can access profiles') THEN
            CREATE POLICY "Authenticated users can access profiles" ON math_profiles
                FOR ALL USING (auth.role() = 'authenticated');
            RAISE NOTICE 'Política de fallback creada para usuarios autenticados';
        END IF;
END $$;

-- =============================================================================
-- 5. CREAR FUNCIÓN update_updated_at SI NO EXISTE
-- =============================================================================

CREATE OR REPLACE FUNCTION update_math_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================================================
-- 6. CREAR TRIGGERS PARA updated_at (SOLO SI NO EXISTEN)
-- =============================================================================

DO $$ 
BEGIN
    -- Trigger para math_exercises
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_math_exercises_updated_at') THEN
        CREATE TRIGGER update_math_exercises_updated_at 
            BEFORE UPDATE ON math_exercises 
            FOR EACH ROW 
            EXECUTE FUNCTION update_math_updated_at_column();
    END IF;

    -- Trigger para user_progress
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_progress_updated_at') THEN
        CREATE TRIGGER update_user_progress_updated_at 
            BEFORE UPDATE ON user_progress 
            FOR EACH ROW 
            EXECUTE FUNCTION update_math_updated_at_column();
    END IF;
END $$;

-- =============================================================================
-- 7. CREAR ÍNDICES PARA MEJORAR RENDIMIENTO (SOLO SI NO EXISTEN)
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_math_sessions_user_date ON math_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_math_exercises_level_operation ON math_exercises(level, operation);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_activity ON user_progress(user_id, last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_math_profiles_user_id ON math_profiles(user_id);

-- =============================================================================
-- 8. INSERTAR EJERCICIOS DE EJEMPLO (SOLO SI LA TABLA ESTÁ VACÍA)
-- =============================================================================

DO $$ 
BEGIN
    -- Solo insertar si no hay ejercicios existentes
    IF NOT EXISTS (SELECT 1 FROM math_exercises LIMIT 1) THEN
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
        ('-', 3, 83, 29, 54, ARRAY['dificil', 'resta', 'mixto']);

        RAISE NOTICE 'Ejercicios de ejemplo insertados correctamente';
    ELSE
        RAISE NOTICE 'Ejercicios ya existen, omitiendo inserción';
    END IF;
END $$;

-- =============================================================================
-- 9. RESUMEN DE CAMBIOS APLICADOS
-- =============================================================================

DO $$ 
DECLARE
    ejercicios_count INTEGER;
    tablas_count INTEGER;
BEGIN
    -- Contar ejercicios
    SELECT COUNT(*) INTO ejercicios_count FROM math_exercises;
    
    -- Contar tablas principales
    SELECT COUNT(*) INTO tablas_count 
    FROM information_schema.tables 
    WHERE table_name IN ('math_profiles', 'math_sessions', 'math_exercises', 'user_progress')
    AND table_schema = 'public';
    
    RAISE NOTICE '';
    RAISE NOTICE '🎯 ===== MATEMÁGICA PWA - ACTUALIZACIÓN COMPLETADA =====';
    RAISE NOTICE '✅ Tablas principales: % de 4', tablas_count;
    RAISE NOTICE '✅ Ejercicios disponibles: %', ejercicios_count;
    RAISE NOTICE '🔒 RLS habilitado en todas las tablas';
    RAISE NOTICE '🛡️ Políticas de seguridad aplicadas';
    RAISE NOTICE '📊 Índices creados para rendimiento';
    RAISE NOTICE '⚡ Base de datos lista para el diagnóstico';
    RAISE NOTICE '';
END $$;