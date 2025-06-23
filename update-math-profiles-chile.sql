-- =====================================================
-- 🇨🇱 SCRIPT DE ACTUALIZACIÓN: MATH_PROFILES - CHILE
-- =====================================================
-- Agregar todas las columnas necesarias para los perfiles completos
-- de estudiantes con regiones y comunas de Chile
-- 
-- Basado en el formulario "Crear Perfil de mi Hijo/a"
-- Fecha: 15 de junio de 2025
-- =====================================================

-- 📝 INFORMACIÓN PERSONAL (del formulario)
ALTER TABLE math_profiles 
ADD COLUMN IF NOT EXISTS nickname VARCHAR(100),                    -- "¿Cómo le dices cariñosamente?"
ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE,                    -- "Fecha de nacimiento"
ADD COLUMN IF NOT EXISTS genero VARCHAR(20),                       -- "Género" (femenino/masculino/otro)

-- 🇨🇱 UBICACIÓN CHILE (del formulario)
ADD COLUMN IF NOT EXISTS region_chile VARCHAR(100),                -- "Región" (completa de Chile)
ADD COLUMN IF NOT EXISTS comuna_chile VARCHAR(100),                -- "Ciudad/Comuna" (de la región seleccionada)

-- 🎯 GUSTOS E INTERESES (del formulario)
ADD COLUMN IF NOT EXISTS intereses JSONB DEFAULT '[]',             -- ["videojuegos", "deportes", "musica", "arte", "lectura", "ciencias"]
ADD COLUMN IF NOT EXISTS materia_favorita VARCHAR(100),            -- "¿Cuál es su materia favorita?"

-- 🏫 INFORMACIÓN ACADÉMICA
ADD COLUMN IF NOT EXISTS curso_actual VARCHAR(50),                 -- "1° Básico", "2° Básico", etc.
ADD COLUMN IF NOT EXISTS nombre_colegio VARCHAR(200),              -- Nombre del establecimiento

-- 📝 DESCRIPCIÓN PERSONALIZADA (del formulario)
ADD COLUMN IF NOT EXISTS descripcion_personalizada TEXT,           -- "Cuéntame más sobre tu hijo/a"

-- 🎭 METADATOS DE PERFIL
ADD COLUMN IF NOT EXISTS tipo_perfil VARCHAR(20) DEFAULT 'student', -- 'student', 'parent', 'teacher'
ADD COLUMN IF NOT EXISTS perfil_completo BOOLEAN DEFAULT false,     -- Si completó todo el formulario
ADD COLUMN IF NOT EXISTS profesores_asignados JSONB DEFAULT '[]',   -- Array de IDs de profesores
ADD COLUMN IF NOT EXISTS fecha_asignacion TIMESTAMP;                -- Cuándo fue asignado

-- 🔄 CAMPO CALCULADO DE EDAD (sin GENERATED ALWAYS para compatibilidad)
ALTER TABLE math_profiles 
ADD COLUMN IF NOT EXISTS edad_calculada INTEGER;

-- =====================================================
-- 📊 ÍNDICES PARA OPTIMIZAR CONSULTAS
-- =====================================================

-- 🇨🇱 Índices para búsquedas por ubicación en Chile
CREATE INDEX IF NOT EXISTS idx_math_profiles_region_chile 
ON math_profiles(region_chile);

CREATE INDEX IF NOT EXISTS idx_math_profiles_comuna_chile 
ON math_profiles(comuna_chile);

-- 🎯 Índices para búsquedas por perfil y características
CREATE INDEX IF NOT EXISTS idx_math_profiles_tipo_perfil 
ON math_profiles(tipo_perfil);

CREATE INDEX IF NOT EXISTS idx_math_profiles_curso_actual 
ON math_profiles(curso_actual);

CREATE INDEX IF NOT EXISTS idx_math_profiles_edad_calculada 
ON math_profiles(edad_calculada);

-- 🔍 Índice para búsquedas por intereses (JSONB)
CREATE INDEX IF NOT EXISTS idx_math_profiles_intereses_gin 
ON math_profiles USING GIN(intereses);

-- 👥 Índice para relaciones parent-student-teacher
CREATE INDEX IF NOT EXISTS idx_math_profiles_parent_student 
ON math_profiles(parent_id, tipo_perfil);

CREATE INDEX IF NOT EXISTS idx_math_profiles_teacher_student 
ON math_profiles(teacher_id, tipo_perfil);

-- =====================================================
-- 🎯 FUNCIONES AUXILIARES PARA CHILE
-- =====================================================

-- Función para validar región-comuna de Chile
CREATE OR REPLACE FUNCTION validar_region_comuna_chile(
    p_region VARCHAR(100),
    p_comuna VARCHAR(100)
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    -- Validaciones básicas de regiones conocidas
    -- (Se puede expandir con una tabla de referencia completa)
    CASE p_region
        WHEN 'Región Metropolitana de Santiago' THEN
            RETURN p_comuna IN ('Santiago', 'Las Condes', 'Providencia', 'Ñuñoa', 'Maipú', 'Puente Alto', 'La Florida');
        WHEN 'Valparaíso' THEN
            RETURN p_comuna IN ('Valparaíso', 'Viña del Mar', 'Quilpué', 'Villa Alemana', 'Concón');
        WHEN 'Biobío' THEN
            RETURN p_comuna IN ('Concepción', 'Talcahuano', 'Chiguayante', 'San Pedro de la Paz', 'Los Ángeles');
        ELSE
            RETURN true; -- Permitir otras regiones por ahora
    END CASE;
END;
$$;

-- Función para calcular edad desde fecha de nacimiento
CREATE OR REPLACE FUNCTION calcular_edad_automatica()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Calcular edad automáticamente cuando se inserta o actualiza fecha_nacimiento
    IF NEW.fecha_nacimiento IS NOT NULL THEN
        NEW.edad_calculada := EXTRACT(YEAR FROM AGE(CURRENT_DATE, NEW.fecha_nacimiento))::INTEGER;
        
        -- Validar que la fecha de nacimiento sea lógica
        IF NEW.fecha_nacimiento > CURRENT_DATE THEN
            RAISE EXCEPTION 'La fecha de nacimiento no puede ser futura';
        END IF;
        
        IF NEW.fecha_nacimiento < CURRENT_DATE - INTERVAL '20 years' THEN
            RAISE EXCEPTION 'Fecha de nacimiento muy antigua para un estudiante';
        END IF;
    END IF;
    
    -- Validar región-comuna si están presentes
    IF NEW.region_chile IS NOT NULL AND NEW.comuna_chile IS NOT NULL THEN
        IF NOT validar_region_comuna_chile(NEW.region_chile, NEW.comuna_chile) THEN
            RAISE WARNING 'Combinación región-comuna inusual: % - %', NEW.region_chile, NEW.comuna_chile;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Aplicar el trigger para cálculo automático de edad
DROP TRIGGER IF EXISTS trigger_calcular_edad_automatica ON math_profiles;
CREATE TRIGGER trigger_calcular_edad_automatica
    BEFORE INSERT OR UPDATE ON math_profiles
    FOR EACH ROW
    EXECUTE FUNCTION calcular_edad_automatica();

-- =====================================================
-- 🧪 DATOS DE PRUEBA (OPCIONAL)
-- =====================================================

-- Insertar un perfil de prueba si no existen datos
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM math_profiles WHERE tipo_perfil = 'student' LIMIT 1) THEN
        INSERT INTO math_profiles (
            user_id,
            nombre_completo,
            nickname,
            fecha_nacimiento,
            genero,
            region_chile,
            comuna_chile,
            intereses,
            materia_favorita,
            curso_actual,
            descripcion_personalizada,
            tipo_perfil,
            perfil_completo
        ) VALUES (
            gen_random_uuid(),
            'María Gabriela González',
            'Gabu',
            '2017-03-15',
            'femenino',
            'Región Metropolitana de Santiago',
            'Las Condes',
            '["arte", "musica", "lectura"]',
            'matematicas',
            '2° Básico',
            'Es una niña muy creativa que ama dibujar y le encanta resolver problemas matemáticos con colores.',
            'student',
            true
        );
        
        RAISE NOTICE 'Perfil de prueba creado exitosamente';
    ELSE
        RAISE NOTICE 'Ya existen perfiles de estudiantes, omitiendo datos de prueba';
    END IF;
END
$$;

-- =====================================================
-- ✅ VERIFICACIÓN FINAL
-- =====================================================

-- Mostrar la estructura actualizada
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    CASE 
        WHEN column_name IN ('nickname', 'fecha_nacimiento', 'genero', 'region_chile', 'comuna_chile', 
                           'intereses', 'materia_favorita', 'curso_actual', 'nombre_colegio', 
                           'descripcion_personalizada', 'tipo_perfil', 'perfil_completo', 
                           'profesores_asignados', 'fecha_asignacion', 'edad_calculada') 
        THEN '🆕 NUEVA'
        ELSE '📋 Existente'
    END as estado
FROM information_schema.columns 
WHERE table_name = 'math_profiles' 
ORDER BY ordinal_position;

-- Mostrar índices creados
SELECT 
    indexname, 
    CASE 
        WHEN indexname LIKE '%chile%' OR indexname LIKE '%tipo_perfil%' OR indexname LIKE '%curso_actual%' 
        THEN '🆕 NUEVO'
        ELSE '📋 Existente'
    END as estado
FROM pg_indexes 
WHERE tablename = 'math_profiles'
ORDER BY indexname;

-- Mostrar funciones creadas
SELECT 
    routine_name,
    routine_type,
    '🆕 NUEVA' as estado
FROM information_schema.routines 
WHERE routine_name IN ('validar_region_comuna_chile', 'calcular_edad_automatica')
ORDER BY routine_name;

-- Comentario final en la tabla
COMMENT ON TABLE math_profiles IS '🇨🇱 Perfiles completos de estudiantes, apoderados y profesores con datos de Chile - Matemágica PWA';

-- =====================================================
-- 🎉 SCRIPT COMPLETADO EXITOSAMENTE
-- =====================================================
-- ✅ Columnas agregadas para información personal completa
-- ✅ Ubicación con regiones y comunas de Chile  
-- ✅ Gustos e intereses (JSONB)
-- ✅ Descripción personalizada del apoderado
-- ✅ Campo de edad calculado automáticamente
-- ✅ Índices optimizados para consultas
-- ✅ Funciones auxiliares para validación
-- ✅ Triggers para automatización
-- ✅ Datos de prueba opcionales
-- ✅ Verificación de estructura final
-- =====================================================

SELECT '🎉 ¡Script ejecutado exitosamente! Tabla math_profiles actualizada con todas las columnas para Chile' as resultado;