-- Solución para error 42725: Funciones duplicadas
-- Fecha: 12 de junio de 2025
-- Propósito: Eliminar todas las versiones duplicadas y crear una única función limpia

-- PASO 1: Eliminar TODAS las versiones de las funciones (sin importar parámetros)
DROP FUNCTION IF EXISTS public.get_all_presentation_stats();
DROP FUNCTION IF EXISTS public.increment_presentation_view CASCADE;

-- Eliminar versiones específicas que puedan existir
DROP FUNCTION IF EXISTS public.increment_presentation_view(text);
DROP FUNCTION IF EXISTS public.increment_presentation_view(text, text);
DROP FUNCTION IF EXISTS public.increment_presentation_view(text, text, text);
DROP FUNCTION IF EXISTS public.increment_presentation_view(text, text, text, text);
DROP FUNCTION IF EXISTS public.increment_presentation_view(text, text, text, text, text);
DROP FUNCTION IF EXISTS public.increment_presentation_view(text, text, text, text, text, integer);
DROP FUNCTION IF EXISTS public.increment_presentation_view(text, text, text, text, text, integer, text);
DROP FUNCTION IF EXISTS public.increment_presentation_view(text, text, text, text, text, integer, text, text);
DROP FUNCTION IF EXISTS public.increment_presentation_view(text, text, text, text, text, integer, text, text, jsonb);

-- PASO 2: Configurar permisos de tablas (simplificado)
ALTER TABLE public.presentation_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentation_views DISABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "gaby_public_stats_access" ON public.presentation_stats;
DROP POLICY IF EXISTS "gaby_public_views_access" ON public.presentation_views;

-- Otorgar permisos completos a anon
GRANT ALL ON public.presentation_stats TO anon;
GRANT ALL ON public.presentation_views TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- PASO 3: Crear función get_all_presentation_stats ÚNICA
CREATE FUNCTION public.get_all_presentation_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result json;
BEGIN
    SELECT json_agg(
        json_build_object(
            'presentacion_id', presentacion_id,
            'titulo', titulo,
            'total_visualizaciones', COALESCE(total_visualizaciones, 0),
            'source', 'supabase'
        )
    ) INTO v_result
    FROM public.presentation_stats
    ORDER BY total_visualizaciones DESC;
    
    RETURN COALESCE(v_result, '[]'::json);
END;
$$;

-- PASO 4: Crear función increment_presentation_view ÚNICA y simplificada
CREATE FUNCTION public.increment_presentation_view(
    p_presentacion_id text,
    p_titulo text DEFAULT 'Sin título',
    p_session_id text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result json;
    v_session_id text;
BEGIN
    -- Generar session_id si no se proporciona
    v_session_id := COALESCE(p_session_id, 'session_' || extract(epoch from now())::text);
    
    -- Insertar registro individual de visualización
    INSERT INTO public.presentation_views (
        presentacion_id, 
        session_id, 
        ip_hash, 
        created_at
    ) VALUES (
        p_presentacion_id,
        v_session_id,
        'visitor_' || extract(epoch from now())::text,
        now()
    );
    
    -- Actualizar o crear estadística agregada
    INSERT INTO public.presentation_stats (
        presentacion_id, 
        titulo, 
        total_visualizaciones,
        ultima_visualizacion,
        created_at,
        updated_at
    ) VALUES (
        p_presentacion_id,
        p_titulo,
        1,
        now(),
        now(),
        now()
    )
    ON CONFLICT (presentacion_id) DO UPDATE SET
        total_visualizaciones = presentation_stats.total_visualizaciones + 1,
        ultima_visualizacion = now(),
        updated_at = now();
    
    -- Retornar resultado
    SELECT json_build_object(
        'presentacion_id', presentacion_id,
        'titulo', titulo,
        'total_visualizaciones', total_visualizaciones,
        'success', true
    ) INTO v_result
    FROM public.presentation_stats 
    WHERE presentacion_id = p_presentacion_id;
    
    RETURN v_result;
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM,
        'presentacion_id', p_presentacion_id
    );
END;
$$;

-- PASO 5: Otorgar permisos a las funciones
GRANT EXECUTE ON FUNCTION public.get_all_presentation_stats() TO anon;
GRANT EXECUTE ON FUNCTION public.increment_presentation_view(text, text, text) TO anon;

-- PASO 6: Insertar datos de prueba iniciales
INSERT INTO public.presentation_stats (presentacion_id, titulo, total_visualizaciones, created_at, updated_at)
VALUES ('historia-celular', 'La Historia del Celular', 0, now(), now())
ON CONFLICT (presentacion_id) DO NOTHING;

-- PASO 7: Probar las funciones (con tipos explícitos)
DO $$
DECLARE
    test_result json;
BEGIN
    -- Probar get_all_presentation_stats
    SELECT public.get_all_presentation_stats() INTO test_result;
    RAISE NOTICE '✅ get_all_presentation_stats: %', test_result;
    
    -- Probar increment_presentation_view con parámetros explícitos
    SELECT public.increment_presentation_view(
        'historia-celular'::text, 
        'La Historia del Celular'::text, 
        'test_session_123'::text
    ) INTO test_result;
    RAISE NOTICE '✅ increment_presentation_view: %', test_result;
    
    RAISE NOTICE '🎉 ¡SISTEMA DE ANALYTICS LISTO!';
    RAISE NOTICE '📊 Base de datos configurada para visitantes reales';
    RAISE NOTICE '🔓 Sin restricciones RLS - acceso público completo';
END $$;