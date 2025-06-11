-- ✅ MIGRACIÓN: Corregir campo nombre_completo opcional y sincronizar con full_name (VERSIÓN SEGURA)
-- Fecha: 9 de junio de 2025
-- Propósito: Hacer nombre_completo opcional y asegurar compatibilidad con full_name

-- PASO 1: Hacer nombre_completo opcional (ya no requerido)
ALTER TABLE public.math_profiles ALTER COLUMN nombre_completo DROP NOT NULL;

-- PASO 2: Asegurar que full_name esté presente cuando se crea un registro
-- Si no hay full_name, copiarlo desde nombre_completo (para registros existentes)
UPDATE public.math_profiles 
SET full_name = nombre_completo 
WHERE full_name IS NULL AND nombre_completo IS NOT NULL;

-- PASO 3: Si no hay nombre_completo, copiarlo desde full_name (para nuevos registros)
UPDATE public.math_profiles 
SET nombre_completo = full_name 
WHERE nombre_completo IS NULL AND full_name IS NOT NULL;

-- PASO 4: Agregar constraint para asegurar que al menos uno de los nombres esté presente (SOLO SI NO EXISTE)
DO $$ 
BEGIN
    -- Verificar si el constraint ya existe antes de crearlo
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'math_profiles_name_check' 
        AND table_name = 'math_profiles'
    ) THEN
        ALTER TABLE public.math_profiles 
        ADD CONSTRAINT math_profiles_name_check 
        CHECK (
            full_name IS NOT NULL OR 
            nombre_completo IS NOT NULL
        );
        RAISE NOTICE '✅ Constraint math_profiles_name_check creado exitosamente';
    ELSE
        RAISE NOTICE '⚠️ Constraint math_profiles_name_check ya existe, saltando...';
    END IF;
END $$;

-- PASO 5: Crear/reemplazar función para mantener sincronizados ambos campos
CREATE OR REPLACE FUNCTION sync_name_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Si se actualiza full_name, sincronizar nombre_completo
    IF NEW.full_name IS NOT NULL AND (OLD.full_name IS NULL OR NEW.full_name != OLD.full_name) THEN
        NEW.nombre_completo = NEW.full_name;
    END IF;
    
    -- Si se actualiza nombre_completo, sincronizar full_name
    IF NEW.nombre_completo IS NOT NULL AND (OLD.nombre_completo IS NULL OR NEW.nombre_completo != OLD.nombre_completo) THEN
        NEW.full_name = NEW.nombre_completo;
    END IF;
    
    -- Asegurar que al menos uno esté presente
    IF NEW.full_name IS NULL AND NEW.nombre_completo IS NULL THEN
        RAISE EXCEPTION 'Debe proporcionar al menos full_name o nombre_completo';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- PASO 6: Crear trigger (reemplazando si ya existe)
DROP TRIGGER IF EXISTS sync_name_fields_trigger ON public.math_profiles;
CREATE TRIGGER sync_name_fields_trigger
    BEFORE INSERT OR UPDATE ON public.math_profiles
    FOR EACH ROW EXECUTE FUNCTION sync_name_fields();

-- PASO 7: Mensaje de confirmación
DO $$ 
BEGIN
    RAISE NOTICE '🎉 ¡CORRECCIÓN DE CAMPOS DE NOMBRE COMPLETADA!';
    RAISE NOTICE '✅ nombre_completo ahora es opcional';
    RAISE NOTICE '✅ Constraints verificados y aplicados según necesidad';
    RAISE NOTICE '✅ Trigger actualizado para sincronizar full_name y nombre_completo';
    RAISE NOTICE '🚀 Ahora se pueden crear perfiles con solo full_name';
END $$;