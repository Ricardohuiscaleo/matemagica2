-- 🎯 SCRIPT PARA CREAR TABLA math_users - Matemágica PWA
-- Ejecutar en el SQL Editor de Supabase

-- 1. Crear tabla de usuarios con skills/profesores
CREATE TABLE IF NOT EXISTS math_users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('profesor', 'apoderado')),
    avatar_url TEXT,
    
    -- ✅ COLUMNAS PARA SISTEMA DE BÚSQUEDA DE PROFESORES
    skills JSONB DEFAULT '[]'::jsonb, -- ["matematicas", "psicologia", "fonoaudiologia"]
    specialization TEXT, -- "Profesor de Matemáticas", "Psicólogo Infantil"
    years_experience INTEGER DEFAULT 0,
    bio TEXT, -- Biografía del profesional
    
    -- ✅ UBICACIÓN Y MODALIDADES
    location JSONB DEFAULT '{
        "region": "metropolitana",
        "comuna": "",
        "online": true,
        "presencial": false
    }'::jsonb,
    
    -- ✅ CALIFICACIONES Y VERIFICACIÓN
    rating DECIMAL(3,2) DEFAULT 4.0, -- Rating promedio (1.00 a 5.00)
    total_reviews INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    -- ✅ DATOS PROFESIONALES
    rate_per_hour INTEGER DEFAULT 25000, -- Tarifa por hora en CLP
    phone TEXT, -- Teléfono de contacto
    
    -- ✅ TIMESTAMPS
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS (Row Level Security)
ALTER TABLE math_users ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de seguridad
CREATE POLICY "Profesores son visibles públicamente" ON math_users
    FOR SELECT USING (role = 'profesor' AND is_active = true);

CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON math_users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Usuarios autenticados pueden crear perfil" ON math_users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_math_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_math_users_updated_at_trigger
    BEFORE UPDATE ON math_users
    FOR EACH ROW
    EXECUTE FUNCTION update_math_users_updated_at();

-- 6. Índices para mejorar rendimiento de búsquedas
CREATE INDEX IF NOT EXISTS idx_math_users_role_active ON math_users(role, is_active);
CREATE INDEX IF NOT EXISTS idx_math_users_skills ON math_users USING GIN (skills);
CREATE INDEX IF NOT EXISTS idx_math_users_rating ON math_users(rating DESC, total_reviews DESC);
CREATE INDEX IF NOT EXISTS idx_math_users_location ON math_users USING GIN (location);

-- ✅ INSERTAR PROFESORES DE EJEMPLO PARA TESTING
INSERT INTO math_users (
    id, email, full_name, role, specialization, skills, rating, total_reviews,
    years_experience, bio, location, rate_per_hour, is_verified, phone
) VALUES 
(
    gen_random_uuid(),
    'maria.gonzalez@matemagica.cl', 
    'María González López',
    'profesor',
    'Psicóloga Infantil',
    '["psicologia", "necesidades_especiales"]'::jsonb,
    4.8, 23, 8,
    'Especialista en dificultades de aprendizaje. Más de 8 años ayudando a niños a superar desafíos académicos y emocionales.',
    '{"region": "metropolitana", "comuna": "Las Condes", "online": true, "presencial": true}'::jsonb,
    35000, true, '+56 9 8765 4321'
),
(
    gen_random_uuid(),
    'carlos.rodriguez@matemagica.cl',
    'Carlos Rodríguez Silva', 
    'profesor',
    'Profesor de Matemáticas',
    '["matematicas"]'::jsonb,
    4.6, 18, 5,
    'Profesor joven con metodologías innovadoras para hacer las matemáticas divertidas y accesibles.',
    '{"region": "metropolitana", "comuna": "Providencia", "online": true, "presencial": false}'::jsonb,
    28000, true, '+56 9 1234 5678'
),
(
    gen_random_uuid(),
    'ana.morales@matemagica.cl',
    'Ana Morales Fernández',
    'profesor', 
    'Fonoaudióloga',
    '["fonoaudiologia", "psicopedagogia"]'::jsonb,
    4.9, 31, 12,
    'Fonoaudióloga con amplia experiencia en trastornos del lenguaje infantil y dificultades de comunicación.',
    '{"region": "valparaiso", "comuna": "Viña del Mar", "online": true, "presencial": true}'::jsonb,
    40000, true, '+56 9 9876 5432'
),
(
    gen_random_uuid(),
    'roberto.sanchez@matemagica.cl',
    'Roberto Sánchez Torres',
    'profesor',
    'Psicopedagogo', 
    '["psicopedagogia", "necesidades_especiales", "matematicas"]'::jsonb,
    4.7, 15, 6,
    'Psicopedagogo especializado en dificultades específicas del aprendizaje matemático y trastornos del aprendizaje.',
    '{"region": "biobio", "comuna": "Concepción", "online": true, "presencial": true}'::jsonb,
    32000, true, '+56 9 5555 4444'
),
(
    gen_random_uuid(),
    'sofia.martinez@matemagica.cl',
    'Sofía Martínez Ramos',
    'profesor',
    'Profesora de Educación Básica',
    '["matematicas", "lenguaje", "psicopedagogia"]'::jsonb,
    4.5, 12, 4,
    'Profesora especializada en primer ciclo básico con enfoque en metodologías lúdicas y personalizadas.',
    '{"region": "metropolitana", "comuna": "Ñuñoa", "online": true, "presencial": true}'::jsonb,
    30000, true, '+56 9 3333 2222'
),
(
    gen_random_uuid(),
    'patricio.lopez@matemagica.cl',
    'Patricio López Vera',
    'profesor',
    'Especialista en TEA',
    '["necesidades_especiales", "psicologia", "terapia_ocupacional"]'::jsonb,
    4.9, 27, 10,
    'Especialista en Trastorno del Espectro Autista con metodologías adaptadas para cada niño.',
    '{"region": "metropolitana", "comuna": "La Reina", "online": false, "presencial": true}'::jsonb,
    45000, true, '+56 9 7777 8888'
)
ON CONFLICT (email) DO NOTHING;

-- ✅ VERIFICAR QUE TODO FUNCIONÓ
SELECT 
    'Tabla math_users creada correctamente' as status,
    COUNT(*) as profesores_insertados
FROM math_users 
WHERE role = 'profesor';

-- ✅ MOSTRAR PROFESORES PARA VERIFICAR
SELECT 
    full_name,
    specialization, 
    skills,
    rating,
    location->>'region' as region,
    location->>'online' as modalidad_online
FROM math_users 
WHERE role = 'profesor' 
ORDER BY rating DESC;