-- ✅ MIGRACIÓN: Agregar sistema de skills/tags para profesores
-- Ejecutar en Supabase SQL Editor después del esquema base
-- Fecha: 13 de junio de 2025

-- 1. Agregar nuevas columnas a la tabla math_users existente
ALTER TABLE math_users 
ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS specialization TEXT,
ADD COLUMN IF NOT EXISTS years_experience INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS certifications TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS available_hours JSONB DEFAULT '{
    "monday": {"start": "09:00", "end": "17:00", "available": true},
    "tuesday": {"start": "09:00", "end": "17:00", "available": true},
    "wednesday": {"start": "09:00", "end": "17:00", "available": true},
    "thursday": {"start": "09:00", "end": "17:00", "available": true},
    "friday": {"start": "09:00", "end": "17:00", "available": true},
    "saturday": {"start": "09:00", "end": "13:00", "available": false},
    "sunday": {"start": "09:00", "end": "13:00", "available": false}
}'::jsonb,
ADD COLUMN IF NOT EXISTS location JSONB DEFAULT '{
    "region": "",
    "comuna": "",
    "online": true,
    "presencial": false
}'::jsonb,
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Crear nuevas tablas del sistema de skills
CREATE TABLE IF NOT EXISTS math_skills_catalog (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skill_code TEXT UNIQUE NOT NULL,
    skill_name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    icon_name TEXT,
    color_hex TEXT DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS math_teacher_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID REFERENCES math_users(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES math_users(id) ON DELETE CASCADE,
    student_id UUID REFERENCES math_students(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    skills_rated JSONB DEFAULT '[]'::jsonb,
    is_anonymous BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(teacher_id, reviewer_id, student_id)
);

CREATE TABLE IF NOT EXISTS math_teacher_student_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID REFERENCES math_users(id) ON DELETE CASCADE,
    student_id UUID REFERENCES math_students(id) ON DELETE CASCADE,
    requested_by UUID REFERENCES math_users(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL CHECK (request_type IN ('assignment', 'recommendation', 'direct')),
    skills_needed JSONB DEFAULT '[]'::jsonb,
    priority_level TEXT DEFAULT 'normal' CHECK (priority_level IN ('low', 'normal', 'high', 'urgent')),
    notes TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    response_date TIMESTAMP WITH TIME ZONE,
    response_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- 3. Habilitar RLS en las nuevas tablas
ALTER TABLE math_skills_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE math_teacher_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE math_teacher_student_requests ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS para las nuevas tablas
-- Skills catalog (lectura pública)
DROP POLICY IF EXISTS "Anyone can view skills catalog" ON math_skills_catalog;
CREATE POLICY "Anyone can view skills catalog" ON math_skills_catalog
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only authenticated users can modify skills" ON math_skills_catalog;
CREATE POLICY "Only authenticated users can modify skills" ON math_skills_catalog
    FOR ALL USING (auth.role() = 'authenticated');

-- Teacher reviews
DROP POLICY IF EXISTS "Users can view public reviews" ON math_teacher_reviews;
CREATE POLICY "Users can view public reviews" ON math_teacher_reviews
    FOR SELECT USING (NOT is_anonymous OR auth.uid() = reviewer_id OR auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Parents can create reviews" ON math_teacher_reviews;
CREATE POLICY "Parents can create reviews" ON math_teacher_reviews
    FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

DROP POLICY IF EXISTS "Users can update own reviews" ON math_teacher_reviews;
CREATE POLICY "Users can update own reviews" ON math_teacher_reviews
    FOR UPDATE USING (auth.uid() = reviewer_id);

-- Teacher-student requests
DROP POLICY IF EXISTS "Users can view related requests" ON math_teacher_student_requests;
CREATE POLICY "Users can view related requests" ON math_teacher_student_requests
    FOR SELECT USING (
        auth.uid() = teacher_id OR 
        auth.uid() = requested_by OR 
        auth.uid() IN (
            SELECT parent_id FROM math_parent_student_relations 
            WHERE student_id = math_teacher_student_requests.student_id
        )
    );

DROP POLICY IF EXISTS "Users can create requests" ON math_teacher_student_requests;
CREATE POLICY "Users can create requests" ON math_teacher_student_requests
    FOR INSERT WITH CHECK (auth.uid() = requested_by);

DROP POLICY IF EXISTS "Teachers can update requests" ON math_teacher_student_requests;
CREATE POLICY "Teachers can update requests" ON math_teacher_student_requests
    FOR UPDATE USING (auth.uid() = teacher_id);

-- 5. Crear índices para optimización
CREATE INDEX IF NOT EXISTS idx_math_users_skills ON math_users USING GIN (skills);
CREATE INDEX IF NOT EXISTS idx_math_users_specialization ON math_users(specialization);
CREATE INDEX IF NOT EXISTS idx_math_users_rating ON math_users(rating DESC, total_reviews DESC);
CREATE INDEX IF NOT EXISTS idx_math_users_location ON math_users USING GIN (location);
CREATE INDEX IF NOT EXISTS idx_teacher_reviews_teacher_rating ON math_teacher_reviews(teacher_id, rating DESC);
CREATE INDEX IF NOT EXISTS idx_teacher_requests_status_date ON math_teacher_student_requests(status, created_at DESC);

-- 6. Insertar skills predefinidos
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

-- 7. Crear funciones útiles
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
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.teacher_id, OLD.teacher_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar rating automáticamente
DROP TRIGGER IF EXISTS update_teacher_rating_trigger ON math_teacher_reviews;
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

-- ✅ MIGRACIÓN COMPLETADA
-- Skills/tags system ready for use!