-- Schema SQL ACTUALIZADO para Matemágica PWA con Supabase
-- Sistema de autenticación con ROLES: Profesores y Apoderados
-- Ejecuta estas consultas en el editor SQL de Supabase
-- ✅ TABLAS CON PREFIJO "math_" para evitar confusiones

-- 1. Tabla de usuarios con roles (Profesores y Apoderados) - ACTUALIZADA CON SKILLS
CREATE TABLE math_users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('profesor', 'apoderado')),
    avatar_url TEXT,
    -- ✅ NUEVAS COLUMNAS PARA SKILLS/TAGS
    skills JSONB DEFAULT '[]'::jsonb, -- Array de skills: ["matematicas", "psicologia", "fonoaudiologia"]
    specialization TEXT, -- Especialización principal: "profesor_basica", "psicologo", "fonoaudiologo"
    years_experience INTEGER DEFAULT 0, -- Años de experiencia
    certifications TEXT[] DEFAULT '{}', -- Certificaciones
    bio TEXT, -- Biografía corta del profesional
    available_hours JSONB DEFAULT '{
        "monday": {"start": "09:00", "end": "17:00", "available": true},
        "tuesday": {"start": "09:00", "end": "17:00", "available": true},
        "wednesday": {"start": "09:00", "end": "17:00", "available": true},
        "thursday": {"start": "09:00", "end": "17:00", "available": true},
        "friday": {"start": "09:00", "end": "17:00", "available": true},
        "saturday": {"start": "09:00", "end": "13:00", "available": false},
        "sunday": {"start": "09:00", "end": "13:00", "available": false}
    }'::jsonb, -- Horarios disponibles por día
    location JSONB DEFAULT '{
        "region": "",
        "comuna": "",
        "online": true,
        "presencial": false
    }'::jsonb, -- Ubicación y modalidades de atención
    rating DECIMAL(3,2) DEFAULT 0.00, -- Rating promedio (0.00 a 5.00)
    total_reviews INTEGER DEFAULT 0, -- Total de reseñas recibidas
    is_verified BOOLEAN DEFAULT false, -- Si el profesional está verificado
    is_active BOOLEAN DEFAULT true, -- Si está activo para recibir estudiantes
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

-- ✅ NUEVA TABLA: Catálogo de skills disponibles
CREATE TABLE math_skills_catalog (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skill_code TEXT UNIQUE NOT NULL, -- ej: "matematicas", "psicologia"
    skill_name TEXT NOT NULL, -- ej: "Matemáticas", "Psicología"
    category TEXT NOT NULL, -- ej: "academico", "terapeutico", "evaluacion"
    description TEXT, -- Descripción del skill
    icon_name TEXT, -- Nombre del ícono para la UI
    color_hex TEXT DEFAULT '#3B82F6', -- Color para mostrar en la UI
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0, -- Para ordenar en la UI
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ✅ NUEVA TABLA: Reviews/calificaciones de profesores
CREATE TABLE math_teacher_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID REFERENCES math_users(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES math_users(id) ON DELETE CASCADE, -- apoderado que califica
    student_id UUID REFERENCES math_students(id) ON DELETE SET NULL, -- estudiante relacionado
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    skills_rated JSONB DEFAULT '[]'::jsonb, -- Skills específicos calificados
    is_anonymous BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false, -- Si la reseña fue verificada
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(teacher_id, reviewer_id, student_id) -- Un apoderado puede calificar una vez por estudiante
);

-- ✅ NUEVA TABLA: Solicitudes de conexión profesor-estudiante
CREATE TABLE math_teacher_student_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID REFERENCES math_users(id) ON DELETE CASCADE,
    student_id UUID REFERENCES math_students(id) ON DELETE CASCADE,
    requested_by UUID REFERENCES math_users(id) ON DELETE CASCADE, -- quien solicita (apoderado/profesor)
    request_type TEXT NOT NULL CHECK (request_type IN ('assignment', 'recommendation', 'direct')),
    skills_needed JSONB DEFAULT '[]'::jsonb, -- Skills requeridos
    priority_level TEXT DEFAULT 'normal' CHECK (priority_level IN ('low', 'normal', 'high', 'urgent')),
    notes TEXT, -- Notas adicionales sobre la solicitud
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    response_date TIMESTAMP WITH TIME ZONE,
    response_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Habilitar RLS en las nuevas tablas
ALTER TABLE math_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE math_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE math_skills_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE math_teacher_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE math_teacher_student_requests ENABLE ROW LEVEL SECURITY;

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

-- Políticas para skills_catalog (lectura pública)
CREATE POLICY "Anyone can view skills catalog" ON math_skills_catalog
    FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can modify skills" ON math_skills_catalog
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para teacher_reviews
CREATE POLICY "Users can view public reviews" ON math_teacher_reviews
    FOR SELECT USING (NOT is_anonymous OR auth.uid() = reviewer_id OR auth.uid() = teacher_id);

CREATE POLICY "Parents can create reviews" ON math_teacher_reviews
    FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update own reviews" ON math_teacher_reviews
    FOR UPDATE USING (auth.uid() = reviewer_id);

-- Políticas para teacher_student_requests  
CREATE POLICY "Users can view related requests" ON math_teacher_student_requests
    FOR SELECT USING (
        auth.uid() = teacher_id OR 
        auth.uid() = requested_by OR 
        auth.uid() IN (
            SELECT parent_id FROM math_parent_student_relations 
            WHERE student_id = math_teacher_student_requests.student_id
        )
    );

CREATE POLICY "Users can create requests" ON math_teacher_student_requests
    FOR INSERT WITH CHECK (auth.uid() = requested_by);

CREATE POLICY "Teachers can update requests" ON math_teacher_student_requests
    FOR UPDATE USING (auth.uid() = teacher_id);

-- Triggers para actualizar updated_at en las nuevas tablas
CREATE TRIGGER update_math_exercises_updated_at 
    BEFORE UPDATE ON math_exercises 
    FOR EACH ROW 
    EXECUTE FUNCTION update_math_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at 
    BEFORE UPDATE ON user_progress 
    FOR EACH ROW 
    EXECUTE FUNCTION update_math_updated_at_column();

-- ✅ ÍNDICES PARA MEJORAR RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_math_sessions_user_date ON math_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_math_exercises_level_operation ON math_exercises(level, operation);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_activity ON user_progress(user_id, last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_math_users_skills ON math_users USING GIN (skills);
CREATE INDEX IF NOT EXISTS idx_math_users_specialization ON math_users(specialization);
CREATE INDEX IF NOT EXISTS idx_math_users_rating ON math_users(rating DESC, total_reviews DESC);
CREATE INDEX IF NOT EXISTS idx_math_users_location ON math_users USING GIN (location);
CREATE INDEX IF NOT EXISTS idx_teacher_reviews_teacher_rating ON math_teacher_reviews(teacher_id, rating DESC);
CREATE INDEX IF NOT EXISTS idx_teacher_requests_status_date ON math_teacher_student_requests(status, created_at DESC);

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

-- ✅ INSERTAR SKILLS PREDEFINIDOS EN EL CATÁLOGO
INSERT INTO math_skills_catalog (skill_code, skill_name, category, description, icon_name, color_hex, sort_order) VALUES
-- Skills Académicos
('matematicas', 'Matemáticas', 'academico', 'Enseñanza de matemáticas básicas y avanzadas', 'calculator', '#10B981', 1),
('lenguaje', 'Lenguaje y Literatura', 'academico', 'Comprensión lectora, escritura y literatura', 'book-open', '#8B5CF6', 2),
('ciencias', 'Ciencias Naturales', 'academico', 'Biología, física y química básica', 'beaker', '#06B6D4', 3),
('historia', 'Historia y Geografía', 'academico', 'Historia, geografía y ciencias sociales', 'globe-americas', '#F59E0B', 4),
('ingles', 'Inglés', 'academico', 'Idioma inglés conversacional y académico', 'language', '#EF4444', 5),

-- Skills Terapéuticos
('psicologia', 'Psicología Infantil', 'terapeutico', 'Apoyo psicológico y emocional', 'heart', '#EC4899', 10),
('fonoaudiologia', 'Fonoaudiología', 'terapeutico', 'Terapia del habla y lenguaje', 'microphone', '#14B8A6', 11),
('terapia_ocupacional', 'Terapia Ocupacional', 'terapeutico', 'Desarrollo de habilidades motoras y cognitivas', 'hand', '#84CC16', 12),
('psicopedagogia', 'Psicopedagogía', 'terapeutico', 'Dificultades de aprendizaje específicas', 'academic-cap', '#6366F1', 13),

-- Skills de Evaluación
('evaluacion_psicologica', 'Evaluación Psicológica', 'evaluacion', 'Diagnósticos y evaluaciones psicológicas', 'clipboard-document-check', '#F97316', 20),
('evaluacion_academica', 'Evaluación Académica', 'evaluacion', 'Tests y evaluaciones de rendimiento', 'document-magnifying-glass', '#0EA5E9', 21),

-- Skills Especializados
('necesidades_especiales', 'Necesidades Especiales', 'especializado', 'TEA, TDAH, discapacidades de aprendizaje', 'puzzle-piece', '#A855F7', 30),
('altas_capacidades', 'Altas Capacidades', 'especializado', 'Estudiantes con altas capacidades intelectuales', 'star', '#FBBF24', 31),
('tecnologia_educativa', 'Tecnología Educativa', 'especializado', 'Herramientas digitales para el aprendizaje', 'computer-desktop', '#6B7280', 32),

-- Skills de Metodología
('montessori', 'Metodología Montessori', 'metodologia', 'Enfoque pedagógico Montessori', 'building-blocks', '#DC2626', 40),
('waldorf', 'Pedagogía Waldorf', 'metodologia', 'Enfoque pedagógico Waldorf/Steiner', 'paint-brush', '#059669', 41),
('aprendizaje_ludico', 'Aprendizaje Lúdico', 'metodologia', 'Enseñanza a través del juego', 'puzzle-piece', '#7C3AED', 42)

ON CONFLICT (skill_code) DO NOTHING;

-- ✅ FUNCIONES ÚTILES PARA EL SISTEMA DE SKILLS

-- Función para actualizar el rating promedio de un profesor
CREATE OR REPLACE FUNCTION update_teacher_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE math_users 
    SET 
        rating = (
            SELECT ROUND(AVG(rating)::numeric, 2) 
            FROM math_teacher_reviews 
            WHERE teacher_id = COALESCE(NEW.teacher_id, OLD.teacher_id)
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM math_teacher_reviews 
            WHERE teacher_id = COALESCE(NEW.teacher_id, OLD.teacher_id)
        )
    WHERE id = COALESCE(NEW.teacher_id, OLD.teacher_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar rating automáticamente
CREATE TRIGGER update_teacher_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON math_teacher_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_teacher_rating();

-- Función para buscar profesores por skills
CREATE OR REPLACE FUNCTION search_teachers_by_skills(
    required_skills text[] DEFAULT '{}',
    location_filter jsonb DEFAULT '{}',
    min_rating decimal DEFAULT 0.0,
    max_distance_km integer DEFAULT NULL
)
RETURNS TABLE (
    teacher_id uuid,
    full_name text,
    skills jsonb,
    specialization text,
    rating decimal,
    total_reviews integer,
    years_experience integer,
    location jsonb,
    skill_match_score integer
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.full_name,
        u.skills,
        u.specialization,
        u.rating,
        u.total_reviews,
        u.years_experience,
        u.location,
        -- Calcular score de coincidencia de skills
        (
            SELECT COUNT(*)::integer 
            FROM jsonb_array_elements_text(u.skills) AS skill
            WHERE skill = ANY(required_skills)
        ) AS skill_match_score
    FROM math_users u
    WHERE 
        u.role = 'profesor' 
        AND u.is_active = true
        AND u.rating >= min_rating
        AND (
            required_skills = '{}' OR 
            u.skills ?| required_skills
        )
        AND (
            location_filter = '{}' OR
            (location_filter->>'region' IS NULL OR u.location->>'region' = location_filter->>'region') AND
            (location_filter->>'online' IS NULL OR (u.location->>'online')::boolean = (location_filter->>'online')::boolean)
        )
    ORDER BY skill_match_score DESC, u.rating DESC, u.total_reviews DESC;
END;
$$ LANGUAGE plpgsql;

-- ✅ COMENTARIOS INFORMATIVOS
-- Estas tablas ahora son compatibles con:
-- 1. El sistema de diagnóstico de la aplicación
-- 2. Las consultas que hace auth-manager.js
-- 3. Las políticas de seguridad RLS adecuadas
-- 4. La estructura esperada por la PWA Matemágica