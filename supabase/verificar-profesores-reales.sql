-- 🔍 VERIFICAR PROFESORES REALES EN MATEMÁGICA PWA
-- Consulta para revisar el estado actual de la base de datos

-- 1. Contar todos los usuarios por rol
SELECT 
    '📊 RESUMEN POR ROLES' as info,
    user_role,
    count(*) as cantidad
FROM math_profiles 
WHERE is_active = true
GROUP BY user_role
ORDER BY count(*) DESC;

-- 2. Mostrar profesores reales detallados
SELECT 
    '👩‍🏫 PROFESORES REALES EN SISTEMA' as info,
    user_id,
    full_name,
    email,
    contact_email,
    specialization,
    skills,
    rating,
    years_experience,
    location,
    created_at,
    CASE 
        WHEN contact_email LIKE '%demo%' OR contact_email LIKE '%matemagica.cl%' THEN '🧪 Demo'
        ELSE '✅ Real'
    END as tipo_usuario
FROM math_profiles 
WHERE user_role = 'profesor' 
    AND is_active = true
ORDER BY created_at ASC;

-- 3. Verificar si hay datos demo vs reales
SELECT 
    '🔍 ANÁLISIS DE DATOS' as info,
    CASE 
        WHEN contact_email LIKE '%demo%' OR contact_email LIKE '%matemagica.cl%' THEN 'Demo/Prueba'
        ELSE 'Usuario Real'
    END as tipo,
    count(*) as cantidad
FROM math_profiles 
WHERE user_role = 'profesor' 
    AND is_active = true
GROUP BY 
    CASE 
        WHEN contact_email LIKE '%demo%' OR contact_email LIKE '%matemagica.cl%' THEN 'Demo/Prueba'
        ELSE 'Usuario Real'
    END;

-- 4. Mostrar solo los 2 profesores reales (filtrar demos)
SELECT 
    '✨ PROFESORES REALES ÚNICAMENTE' as info,
    user_id,
    full_name,
    email,
    specialization,
    skills,
    rating,
    location->>'region' as region,
    location->>'online' as modalidad_online
FROM math_profiles 
WHERE user_role = 'profesor' 
    AND is_active = true
    AND (contact_email NOT LIKE '%demo%' AND contact_email NOT LIKE '%matemagica.cl%')
ORDER BY rating DESC;

-- 5. Eliminar profesores demo si es necesario (OPCIONAL - comentado por seguridad)
/*
DELETE FROM math_profiles 
WHERE user_role = 'profesor' 
    AND (contact_email LIKE '%demo%' OR contact_email LIKE '%matemagica.cl%');

SELECT '🗑️ Profesores demo eliminados' as resultado;
*/