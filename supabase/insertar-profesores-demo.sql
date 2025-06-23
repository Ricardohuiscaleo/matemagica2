-- 🎯 INSERTAR PROFESORES DE PRUEBA EN MATH_PROFILES - MATEMÁGICA PWA
-- Solución corregida para error ON CONFLICT

-- PASO 1: Verificar usuarios existentes en auth.users
SELECT 'Usuarios existentes en auth.users:' as info;
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- PASO 2: Insertar profesores usando usuarios existentes (CORREGIDO)
DO $$
DECLARE
    existing_user_id uuid;
    profesor_count integer;
    existing_profesor_count integer;
BEGIN
    -- Buscar un usuario existente
    SELECT id INTO existing_user_id 
    FROM auth.users 
    LIMIT 1;
    
    IF existing_user_id IS NOT NULL THEN
        -- Verificar si ya existe un profesor con este user_id
        SELECT count(*) INTO existing_profesor_count
        FROM math_profiles 
        WHERE user_id = existing_user_id AND user_role = 'profesor';
        
        IF existing_profesor_count = 0 THEN
            -- Insertar profesor solo si no existe
            INSERT INTO math_profiles (
                user_id, 
                full_name, 
                user_role, 
                specialization,
                skills, 
                rating, 
                years_experience, 
                bio,
                contact_email, 
                contact_phone, 
                rate_per_hour,
                location, 
                is_active,
                is_verified
            ) VALUES (
                existing_user_id,
                'Profesor Demo Matemágica - ' || to_char(now(), 'HH24:MI'),
                'profesor',
                'Especialista en Matemáticas Infantiles',
                '["matematicas", "psicopedagogia"]'::jsonb,
                4.8,
                5,
                'Especialista en hacer las matemáticas divertidas para niños de primaria. Metodologías child-friendly.',
                'profesor.demo@matemagica.cl',
                '+56 9 1234 5678',
                30000,
                '{"region": "metropolitana", "comuna": "Santiago", "online": true, "presencial": true}'::jsonb,
                true,
                true
            );
            
            RAISE NOTICE '✅ Profesor demo insertado usando usuario existente: %', existing_user_id;
        ELSE
            -- Actualizar profesor existente
            UPDATE math_profiles SET
                user_role = 'profesor',
                specialization = 'Especialista en Matemáticas Infantiles - Actualizado',
                skills = '["matematicas", "psicopedagogia"]'::jsonb,
                bio = 'Especialista en hacer las matemáticas divertidas para niños de primaria. Metodologías child-friendly.',
                updated_at = now()
            WHERE user_id = existing_user_id;
            
            RAISE NOTICE '🔄 Profesor existente actualizado: %', existing_user_id;
        END IF;
    ELSE
        RAISE NOTICE '⚠️ No hay usuarios en auth.users. Crear usuario primero.';
    END IF;
    
    -- Verificar profesores total
    SELECT count(*) INTO profesor_count 
    FROM math_profiles 
    WHERE user_role = 'profesor';
    
    RAISE NOTICE '👩‍🏫 Total profesores en math_profiles: %', profesor_count;
    
END $$;

-- PASO 3: Insertar más profesores demo si hay múltiples usuarios
DO $$
DECLARE
    usuario_rec record;
    profesor_count integer := 0;
BEGIN
    -- Insertar hasta 3 profesores demo usando usuarios diferentes
    FOR usuario_rec IN 
        SELECT id, email 
        FROM auth.users 
        WHERE id NOT IN (
            SELECT user_id 
            FROM math_profiles 
            WHERE user_role = 'profesor' 
              AND user_id IS NOT NULL
        )
        LIMIT 3
    LOOP
        INSERT INTO math_profiles (
            user_id,
            full_name,
            user_role,
            specialization,
            skills,
            rating,
            years_experience,
            bio,
            contact_email,
            contact_phone,
            rate_per_hour,
            location,
            is_active,
            is_verified
        ) VALUES (
            usuario_rec.id,
            CASE profesor_count
                WHEN 0 THEN 'María González - Psicóloga Infantil'
                WHEN 1 THEN 'Carlos Rodríguez - Profesor Matemáticas'
                WHEN 2 THEN 'Ana Morales - Fonoaudióloga'
                ELSE 'Profesor Demo ' || profesor_count
            END,
            'profesor',
            CASE profesor_count
                WHEN 0 THEN 'Psicóloga Infantil'
                WHEN 1 THEN 'Profesor de Matemáticas'
                WHEN 2 THEN 'Fonoaudióloga'
                ELSE 'Educador Especialista'
            END,
            CASE profesor_count
                WHEN 0 THEN '["psicologia", "necesidades_especiales"]'::jsonb
                WHEN 1 THEN '["matematicas"]'::jsonb
                WHEN 2 THEN '["fonoaudiologia", "psicopedagogia"]'::jsonb
                ELSE '["psicopedagogia"]'::jsonb
            END,
            4.5 + (profesor_count * 0.1),
            3 + profesor_count,
            CASE profesor_count
                WHEN 0 THEN 'Especialista en dificultades de aprendizaje. Más de 8 años ayudando a niños.'
                WHEN 1 THEN 'Profesor joven con metodologías innovadoras para hacer las matemáticas divertidas.'
                WHEN 2 THEN 'Fonoaudióloga con amplia experiencia en trastornos del lenguaje infantil.'
                ELSE 'Profesional comprometido con la educación de calidad.'
            END,
            CASE profesor_count
                WHEN 0 THEN 'maria@matemagica.cl'
                WHEN 1 THEN 'carlos@matemagica.cl'
                WHEN 2 THEN 'ana@matemagica.cl'
                ELSE 'profesor' || profesor_count || '@matemagica.cl'
            END,
            '+56 9 ' || (1111 + profesor_count * 1111) || ' 2222',
            25000 + (profesor_count * 5000),
            CASE profesor_count
                WHEN 0 THEN '{"region": "metropolitana", "comuna": "Las Condes", "online": true, "presencial": true}'::jsonb
                WHEN 1 THEN '{"region": "metropolitana", "comuna": "Providencia", "online": true, "presencial": false}'::jsonb
                WHEN 2 THEN '{"region": "valparaiso", "comuna": "Viña del Mar", "online": true, "presencial": true}'::jsonb
                ELSE '{"region": "metropolitana", "comuna": "Santiago", "online": true, "presencial": true}'::jsonb
            END,
            true,
            true
        );
        
        profesor_count := profesor_count + 1;
        RAISE NOTICE '✅ Profesor % insertado: %', profesor_count, usuario_rec.email;
    END LOOP;
    
    IF profesor_count = 0 THEN
        RAISE NOTICE 'ℹ️ No se insertaron profesores adicionales (usuarios ya tienen perfiles de profesor)';
    END IF;
    
END $$;

-- PASO 4: Verificar resultado final
SELECT 
    '🎉 PROFESORES DISPONIBLES EN MATEMÁGICA PWA' as resultado,
    count(*) as total_profesores
FROM math_profiles 
WHERE user_role = 'profesor' 
    AND is_active = true;

-- PASO 5: Mostrar profesores insertados
SELECT 
    user_id,
    full_name,
    specialization,
    skills,
    rating,
    contact_email,
    location->>'region' as region,
    location->>'online' as modalidad_online
FROM math_profiles 
WHERE user_role = 'profesor' 
    AND is_active = true
ORDER BY rating DESC;

-- MENSAJE FINAL
SELECT '🚀 SISTEMA DE BÚSQUEDA DE PROFESORES LISTO PARA MATEMÁGICA PWA!' as estado;