-- ✅ MIGRACIÓN CORREGIDA: Sistema de Skills/Tags para Profesores
-- Adaptada al esquema REAL de Matemágica - SIN DATOS DUMMY
-- Ejecutar en Supabase SQL Editor
-- Fecha: 14 de junio de 2025

-- 1. Agregar columnas de skills a la tabla math_profiles existente
ALTER TABLE math_profiles 
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
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS rate_per_hour INTEGER;

-- 2. Crear tabla de catálogo de skills
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

-- 3. Crear tabla de reviews/calificaciones (adaptada)
CREATE TABLE IF NOT EXISTS math_teacher_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_profile_id UUID REFERENCES math_profiles(id) ON DELETE CASCADE,
    reviewer_profile_id UUID REFERENCES math_profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    skills_rated JSONB DEFAULT '[]'::jsonb,
    is_anonymous BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(teacher_profile_id, reviewer_profile_id)
);

-- 4. Crear tabla de solicitudes profesor-estudiante (adaptada)
CREATE TABLE IF NOT EXISTS math_teacher_student_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_profile_id UUID REFERENCES math_profiles(id) ON DELETE CASCADE,
    student_profile_id UUID REFERENCES math_profiles(id) ON DELETE CASCADE,
    requested_by_profile_id UUID REFERENCES math_profiles(id) ON DELETE CASCADE,
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

-- 5. Habilitar RLS en nuevas tablas
ALTER TABLE math_skills_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE math_teacher_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE math_teacher_student_requests ENABLE ROW LEVEL SECURITY;

-- 6. Crear políticas RLS básicas
DROP POLICY IF EXISTS "Anyone can view skills catalog" ON math_skills_catalog;
CREATE POLICY "Anyone can view skills catalog" ON math_skills_catalog
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can modify skills" ON math_skills_catalog;
CREATE POLICY "Authenticated users can modify skills" ON math_skills_catalog
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para reviews (más simples)
DROP POLICY IF EXISTS "Users can view reviews" ON math_teacher_reviews;
CREATE POLICY "Users can view reviews" ON math_teacher_reviews
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create reviews" ON math_teacher_reviews;
CREATE POLICY "Users can create reviews" ON math_teacher_reviews
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Políticas para requests (más simples)
DROP POLICY IF EXISTS "Users can view requests" ON math_teacher_student_requests;
CREATE POLICY "Users can view requests" ON math_teacher_student_requests
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can create requests" ON math_teacher_student_requests;
CREATE POLICY "Users can create requests" ON math_teacher_student_requests
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 7. Crear índices para rendimiento (adaptados)
CREATE INDEX IF NOT EXISTS idx_math_profiles_skills ON math_profiles USING GIN (skills);
CREATE INDEX IF NOT EXISTS idx_math_profiles_specialization ON math_profiles(specialization);
CREATE INDEX IF NOT EXISTS idx_math_profiles_rating ON math_profiles(rating DESC, total_reviews DESC);
CREATE INDEX IF NOT EXISTS idx_math_profiles_user_role ON math_profiles(user_role);
CREATE INDEX IF NOT EXISTS idx_math_teacher_reviews_teacher ON math_teacher_reviews(teacher_profile_id, rating DESC);

-- 8. Insertar skills predefinidos
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

-- 9. Función para búsqueda de profesores (adaptada al esquema real)
CREATE OR REPLACE FUNCTION search_teachers_by_skills(
    required_skills text[] DEFAULT '{}',
    location_filter jsonb DEFAULT '{}',
    min_rating decimal DEFAULT 0.0
)
RETURNS TABLE (
    profile_id uuid,
    full_name text,
    skills jsonb,
    specialization text,
    rating decimal,
    total_reviews integer,
    years_experience integer,
    location jsonb,
    skill_match_score integer,
    user_role text,
    email text,
    contact_phone text,
    rate_per_hour integer
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.full_name,
        p.skills,
        p.specialization,
        p.rating,
        p.total_reviews,
        p.years_experience,
        p.location,
        -- Calcular score de coincidencia de skills
        (
            SELECT COUNT(*)::integer 
            FROM jsonb_array_elements_text(p.skills) AS skill
            WHERE skill = ANY(required_skills)
        ) AS skill_match_score,
        p.user_role,
        p.email,
        p.contact_phone,
        p.rate_per_hour
    FROM math_profiles p
    WHERE 
        p.user_role = 'teacher' 
        AND p.is_active = true
        AND (p.rating IS NULL OR p.rating >= min_rating)
        AND (
            required_skills = '{}' OR 
            p.skills ?| required_skills
        )
        AND (
            location_filter = '{}' OR
            (location_filter->>'region' IS NULL OR p.location->>'region' = location_filter->>'region') AND
            (location_filter->>'online' IS NULL OR (p.location->>'online')::boolean = (location_filter->>'online')::boolean)
        )
    ORDER BY skill_match_score DESC, COALESCE(p.rating, 0) DESC, COALESCE(p.total_reviews, 0) DESC;
END;
$$ LANGUAGE plpgsql;

-- 10. Función para actualizar rating promedio de profesores
CREATE OR REPLACE FUNCTION update_teacher_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE math_profiles 
    SET 
        rating = (
            SELECT ROUND(AVG(rating)::numeric, 2) 
            FROM math_teacher_reviews 
            WHERE teacher_profile_id = COALESCE(NEW.teacher_profile_id, OLD.teacher_profile_id)
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM math_teacher_reviews 
            WHERE teacher_profile_id = COALESCE(NEW.teacher_profile_id, OLD.teacher_profile_id)
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.teacher_profile_id, OLD.teacher_profile_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 11. Trigger para actualizar rating automáticamente
DROP TRIGGER IF EXISTS update_teacher_rating_trigger ON math_teacher_reviews;
CREATE TRIGGER update_teacher_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON math_teacher_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_teacher_rating();

-- ✅ MIGRACIÓN COMPLETADA CORRECTAMENTE - SIN DATOS DUMMY
SELECT 
    'Sistema de Skills implementado correctamente para Matemágica' as resultado,
    (SELECT COUNT(*) FROM math_skills_catalog) as skills_disponibles,
    'Listo para usar con perfiles reales de profesores' as estado;