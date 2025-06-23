-- 🔧 SOLUCIÓN DEFINITIVA PARA RLS EN MATEMÁGICA
-- Ejecutar en Supabase SQL Editor

-- PROBLEMA CONFIRMADO:
-- ✅ 8 usuarios reales en tabla profiles (incluyendo Francisca)
-- ❌ RLS bloquea acceso anónimo - solo se ven registros propios
-- 🎯 Necesitamos permitir lectura pública para la herramienta de búsqueda

-- USUARIOS CONFIRMADOS EN PROFILES:
-- 1. yojhansrojas@gmail.com - Yojhans Rojas
-- 2. ricardo.huiscaleo@gmail.com - Ricardo Huiscaleo  
-- 3. franita90@gmail.com - Francisca Gavilan ⭐
-- 4. tmsgf22@gmail.com - Tomas GF
-- 5. saboresdelaruta11@gmail.com - La Ruta 11
-- 6. allisonmichellecastillo@gmail.com - allison castillo morales
-- 7. pattysol1976@gmail.com - Patricia Molina
-- 8. susana.cortez.alcayaga@gmail.com - Susana Cortez Alcayaga

-- SOLUCIÓN: Crear políticas permisivas para lectura pública

-- 1. PERMITIR LECTURA PÚBLICA EN PROFILES
CREATE POLICY "matematica_public_read_profiles" 
ON profiles 
FOR SELECT 
USING (true);

-- 2. PERMITIR LECTURA PÚBLICA EN MATH_PROFILES
CREATE POLICY "matematica_public_read_math_profiles" 
ON math_profiles 
FOR SELECT 
USING (true);

-- 3. PERMITIR LECTURA PÚBLICA EN USER_ROLES
CREATE POLICY "matematica_public_read_user_roles" 
ON user_roles 
FOR SELECT 
USING (true);

-- VERIFICACIÓN INMEDIATA:
-- Estas consultas deberían mostrar todos los 8 usuarios ahora

SELECT 'VERIFICACIÓN PROFILES' as test, COUNT(*) as total FROM profiles;
-- Esperado: 8 usuarios

SELECT 'VERIFICACIÓN MATH_PROFILES' as test, COUNT(*) as total FROM math_profiles;
-- Esperado: registros de math_profiles

SELECT 'VERIFICACIÓN USER_ROLES' as test, COUNT(*) as total FROM user_roles;
-- Esperado: registros de user_roles

-- BUSCAR FRANCISCA ESPECÍFICAMENTE:
SELECT 'FRANCISCA ENCONTRADA' as resultado, email, full_name, is_subscribed
FROM profiles 
WHERE email = 'franita90@gmail.com';
-- Esperado: franita90@gmail.com | Francisca Gavilan | false

-- MOSTRAR TODOS LOS USUARIOS:
SELECT 
    email,
    full_name,
    is_subscribed,
    created_at::date as fecha_registro
FROM profiles 
ORDER BY created_at DESC;

-- VERIFICAR TEACHERS EN MATH_PROFILES:
SELECT 
    email,
    full_name,
    user_role,
    created_at::date as fecha_registro
FROM math_profiles 
WHERE user_role = 'teacher'
ORDER BY created_at DESC;

-- MENSAJE DE ÉXITO:
SELECT 
    '🎉 SOLUCIÓN APLICADA EXITOSAMENTE' as estado,
    'La herramienta web ahora debería mostrar todos los usuarios' as resultado,
    'Regresa a buscar-teachers.html y ejecuta "Buscar Todos los Perfiles"' as siguiente_paso;
