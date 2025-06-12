-- CORRECCIÓN DEFINITIVA: Eliminar todas las versiones y crear función simplificada
-- Fecha: 12 de junio de 2025
-- Problema: Múltiples versiones de la función causan error de ambigüedad

-- 1. ELIMINAR TODAS las versiones posibles de la función
DO $$ 
DECLARE
    func_record RECORD;
BEGIN
    -- Buscar y eliminar todas las versiones de increment_presentation_view
    FOR func_record IN 
        SELECT 
            proname, 
            pg_get_function_identity_arguments(oid) as args,
            oid
        FROM pg_proc 
        WHERE proname = 'increment_presentation_view'
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS public.%I(%s) CASCADE', 
                      func_record.proname, 
                      func_record.args);
        RAISE NOTICE 'Eliminada función: %(%)', func_record.proname, func_record.args;
    END LOOP;
    
    RAISE NOTICE '✅ Todas las versiones de increment_presentation_view eliminadas';
END $$;

-- 2. VERIFICAR que no queden funciones
SELECT 
    proname as funcion_restante,
    pg_get_function_arguments(oid) as parametros
FROM pg_proc 
WHERE proname = 'increment_presentation_view'
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 3. CREAR función simplificada compatible con JavaScript
CREATE OR REPLACE FUNCTION public.increment_presentation_view(
    presentacion_id_param TEXT,
    titulo_param TEXT DEFAULT 'Sin título'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_total INTEGER;
    v_session_id TEXT;
BEGIN
    -- Generar session_id único
    v_session_id := 'anon_' || extract(epoch from now())::bigint || '_' || floor(random() * 1000);
    
    -- Insertar vista individual (solo si la tabla existe)
    BEGIN
        INSERT INTO public.presentation_views (
            presentacion_id, 
            session_id, 
            ip_hash,
            created_at
        ) VALUES (
            presentacion_id_param,
            v_session_id,
            'visitor_' || extract(epoch from now())::bigint,
            now()
        );
    EXCEPTION WHEN undefined_table THEN
        -- La tabla no existe, continuar sin error
        RAISE NOTICE 'Tabla presentation_views no existe, omitiendo inserción';
    END;
    
    -- Actualizar estadísticas (crear tabla si no existe)
    CREATE TABLE IF NOT EXISTS public.presentation_stats (
        id SERIAL PRIMARY KEY,
        presentacion_id TEXT UNIQUE NOT NULL,
        titulo TEXT NOT NULL DEFAULT 'Sin título',
        total_visualizaciones INTEGER DEFAULT 0,
        ultima_visualizacion TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
    );
    
    INSERT INTO public.presentation_stats (
        presentacion_id, 
        titulo, 
        total_visualizaciones,
        ultima_visualizacion,
        created_at,
        updated_at
    ) VALUES (
        presentacion_id_param,
        titulo_param,
        1,
        now(),
        now(),
        now()
    )
    ON CONFLICT (presentacion_id) DO UPDATE SET
        total_visualizaciones = presentation_stats.total_visualizaciones + 1,
        ultima_visualizacion = now(),
        updated_at = now();
    
    -- Obtener total actualizado
    SELECT total_visualizaciones INTO v_total
    FROM public.presentation_stats 
    WHERE presentacion_id = presentacion_id_param;
    
    -- Retornar resultado exitoso
    RETURN json_build_object(
        'success', true,
        'presentacion_id', presentacion_id_param,
        'titulo', titulo_param,
        'total_visualizaciones', v_total,
        'session_id', v_session_id,
        'timestamp', now(),
        'message', 'Visualización registrada correctamente'
    );
    
EXCEPTION WHEN OTHERS THEN
    -- Manejo de errores robusto
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM,
        'code', SQLSTATE,
        'message', 'Error al registrar visualización: ' || SQLERRM
    );
END;
$$;

-- 4. OTORGAR permisos específicos
GRANT EXECUTE ON FUNCTION public.increment_presentation_view(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_presentation_view(TEXT, TEXT) TO authenticated;

-- 5. ASEGURAR permisos en tablas
GRANT ALL PRIVILEGES ON public.presentation_stats TO anon;
GRANT ALL PRIVILEGES ON public.presentation_views TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- 6. VERIFICAR que solo existe una función
SELECT 
    '✅ FUNCIÓN CREADA' as estado,
    proname as nombre_funcion,
    pg_get_function_arguments(oid) as parametros_exactos
FROM pg_proc 
WHERE proname = 'increment_presentation_view'
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 7. TEST inmediato de la función
SELECT 
    '🧪 TEST FUNCIÓN' as tipo_test,
    increment_presentation_view('test-final', 'Test Función Corregida') as resultado;

-- 8. VERIFICAR estadísticas después del test
SELECT 
    '📊 VERIFICACIÓN' as tipo,
    * 
FROM public.presentation_stats 
WHERE presentacion_id = 'test-final';

-- Comentario de la función
COMMENT ON FUNCTION public.increment_presentation_view(TEXT, TEXT) IS 
'Función simplificada para incrementar visualizaciones de presentaciones. Compatible con JavaScript actualizado. Versión: 12-Jun-2025';

-- Mensaje final
SELECT '🎉 ¡CORRECCIÓN COMPLETADA! Función increment_presentation_view lista para usar.' as mensaje_final;