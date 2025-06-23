-- 🔍 VERIFICAR PROFESORES REALES EN MATEMÁGICA PWA
-- Script para identificar profesores reales vs demo

-- 1. Mostrar TODOS los profesores en la base de datos
SELECT 
    '📊 TODOS LOS PROFESORES' as info,
    user_id,
    full_name,
    email,
    contact_email,
    user_role,
    specialization,
    skills,
    rating,
    is_active,
    created_at,
    CASE 
        WHEN email LIKE '%@gmail.com' OR email LIKE '%@hotmail.com' OR email LIKE '%@outlook.com' THEN '✅ Real'
        WHEN contact_email LIKE '%demo%' OR contact_email LIKE '%matemagica.cl%' THEN '🧪 Demo'
        WHEN email LIKE '%matemagica.cl%' THEN '🧪 Demo'
        ELSE '❓ Sin determinar'
    END as tipo_usuario
FROM math_profiles 
WHERE user_role = 'profesor' 
    AND is_active = true
ORDER BY created_at ASC;

-- 2. Contar por tipo de usuario
SELECT 
    '📈 RESUMEN POR TIPO' as info,
    CASE 
        WHEN email LIKE '%@gmail.com' OR email LIKE '%@hotmail.com' OR email LIKE '%@outlook.com' THEN 'Real'
        WHEN contact_email LIKE '%demo%' OR contact_email LIKE '%matemagica.cl%' THEN 'Demo'
        WHEN email LIKE '%matemagica.cl%' THEN 'Demo'
        ELSE 'Sin determinar'
    END as tipo,
    count(*) as cantidad
FROM math_profiles 
WHERE user_role = 'profesor' 
    AND is_active = true
GROUP BY 
    CASE 
        WHEN email LIKE '%@gmail.com' OR email LIKE '%@hotmail.com' OR email LIKE '%@outlook.com' THEN 'Real'
        WHEN contact_email LIKE '%demo%' OR contact_email LIKE '%matemagica.cl%' THEN 'Demo'
        WHEN email LIKE '%matemagica.cl%' THEN 'Demo'
        ELSE 'Sin determinar'
    END;

-- 3. Verificar usuarios que tienen user_role = 'teacher' (no 'profesor')
SELECT 
    '🔍 VERIFICAR ROLE teacher' as info,
    user_id,
    full_name,
    email,
    user_role,
    created_at
FROM math_profiles 
WHERE user_role = 'teacher' 
    AND is_active = true
ORDER BY created_at ASC;

-- 4. Buscar usuarios que pueden ser profesores reales (con emails reales)
SELECT 
    '✨ POSIBLES PROFESORES REALES' as info,
    user_id,
    full_name,
    email,
    contact_email,
    user_role,
    specialization,
    skills,
    created_at
FROM math_profiles 
WHERE is_active = true
    AND (
        email LIKE '%@gmail.com' OR 
        email LIKE '%@hotmail.com' OR 
        email LIKE '%@outlook.com' OR
        email LIKE '%@yahoo.com' OR
        (email NOT LIKE '%matemagica.cl%' AND email NOT LIKE '%demo%')
    )
    AND (user_role = 'profesor' OR user_role = 'teacher')
ORDER BY created_at ASC;

-- 5. CONVERTIR USUARIOS REALES A PROFESORES (ACTIVADO)
-- Este script convierte automáticamente los usuarios reales encontrados
UPDATE math_profiles 
SET 
    user_role = 'profesor',
    specialization = COALESCE(specialization, 'Profesional de la Educación'),
    skills = COALESCE(skills, '["matematicas", "educacion_primaria"]'::jsonb),
    updated_at = now()
WHERE is_active = true
    AND user_role = 'teacher'  -- Solo convertir de 'teacher' a 'profesor'
    AND (
        email LIKE '%@gmail.com' OR 
        email LIKE '%@hotmail.com' OR 
        email LIKE '%@outlook.com' OR
        email LIKE '%@yahoo.com'
    )
    AND email NOT LIKE '%demo%'
    AND email NOT LIKE '%matemagica.cl%';

-- 6. REPORTE FINAL: Verificar la conversión
SELECT 
    '🎉 CONVERSIÓN COMPLETADA' as info,
    user_id,
    full_name,
    email,
    user_role,
    specialization,
    skills,
    updated_at
FROM math_profiles 
WHERE is_active = true
    AND user_role = 'profesor'
    AND (
        email LIKE '%@gmail.com' OR 
        email LIKE '%@hotmail.com' OR 
        email LIKE '%@outlook.com' OR
        email LIKE '%@yahoo.com'
    )
    AND email NOT LIKE '%demo%'
    AND email NOT LIKE '%matemagica.cl%'
ORDER BY updated_at DESC;

-- 7. RESUMEN FINAL: Conteo de profesores reales vs demo
SELECT 
    '📊 RESUMEN FINAL' as info,
    CASE 
        WHEN email LIKE '%@gmail.com' OR email LIKE '%@hotmail.com' OR email LIKE '%@outlook.com' OR email LIKE '%@yahoo.com' THEN '✅ Profesores Reales'
        WHEN email LIKE '%demo%' OR email LIKE '%matemagica.cl%' THEN '🧪 Profesores Demo'
        ELSE '❓ Sin clasificar'
    END as tipo,
    count(*) as cantidad
FROM math_profiles 
WHERE user_role = 'profesor' 
    AND is_active = true
GROUP BY 
    CASE 
        WHEN email LIKE '%@gmail.com' OR email LIKE '%@hotmail.com' OR email LIKE '%@outlook.com' OR email LIKE '%@yahoo.com' THEN '✅ Profesores Reales'
        WHEN email LIKE '%demo%' OR email LIKE '%matemagica.cl%' THEN '🧪 Profesores Demo'
        ELSE '❓ Sin clasificar'
    END
ORDER BY cantidad DESC;