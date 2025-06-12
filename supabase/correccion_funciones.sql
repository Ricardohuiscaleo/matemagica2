-- CORRECCIÓN PASO 1: Crear funciones con todas las variantes de parámetros
-- Ejecutar esto en Supabase SQL Editor

-- Limpiar funciones existentes completamente
DROP FUNCTION IF EXISTS public.get_all_presentation_stats() CASCADE;
DROP FUNCTION IF EXISTS public.increment_presentation_view(text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.increment_presentation_view(text, text) CASCADE;
DROP FUNCTION IF EXISTS public.increment_presentation_view(text) CASCADE;

-- Crear función simple para obtener estadísticas
CREATE OR REPLACE FUNCTION public.get_all_presentation_stats()
RETURNS json
LANGUAGE sql
SECURITY INVOKER
STABLE
AS $$
    SELECT COALESCE(
        json_agg(
            json_build_object(
                'presentacion_id', presentacion_id,
                'titulo', titulo,
                'total_visualizaciones', COALESCE(total_visualizaciones, 0),
                'ultima_visualizacion', ultima_visualizacion,
                'source', 'supabase_fixed'
            ) ORDER BY total_visualizaciones DESC
        ), 
        '[]'::json
    )
    FROM public.presentation_stats;
$$;

-- Crear función con 3 parámetros (principal)
CREATE OR REPLACE FUNCTION public.increment_presentation_view(
    presentacion_id_param text,
    titulo_param text,
    session_id_param text
)
RETURNS json
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_total int;
BEGIN
    -- Insertar vista individual
    INSERT INTO public.presentation_views (
        presentacion_id, 
        session_id, 
        ip_hash,
        created_at
    ) VALUES (
        presentacion_id_param,
        COALESCE(session_id_param, 'anon_' || extract(epoch from now())::bigint),
        'visitor_' || extract(epoch from now())::bigint,
        now()
    );
    
    -- Actualizar estadísticas
    INSERT INTO public.presentation_stats (
        presentacion_id, 
        titulo, 
        total_visualizaciones,
        ultima_visualizacion,
        created_at,
        updated_at
    ) VALUES (
        presentacion_id_param,
        COALESCE(titulo_param, 'Sin título'),
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
    
    -- Retornar resultado
    RETURN json_build_object(
        'success', true,
        'presentacion_id', presentacion_id_param,
        'titulo', COALESCE(titulo_param, 'Sin título'),
        'total_visualizaciones', v_total,
        'session_id', COALESCE(session_id_param, 'anon_' || extract(epoch from now())::bigint),
        'timestamp', now()
    );
END;
$$;

-- Crear función con 2 parámetros (sobrecarga)
CREATE OR REPLACE FUNCTION public.increment_presentation_view(
    presentacion_id_param text,
    titulo_param text
)
RETURNS json
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
    RETURN public.increment_presentation_view(
        presentacion_id_param, 
        titulo_param, 
        'anon_' || extract(epoch from now())::bigint
    );
END;
$$;

-- Crear función con 1 parámetro (sobrecarga mínima)
CREATE OR REPLACE FUNCTION public.increment_presentation_view(
    presentacion_id_param text
)
RETURNS json
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
    RETURN public.increment_presentation_view(
        presentacion_id_param, 
        'Sin título', 
        'anon_' || extract(epoch from now())::bigint
    );
END;
$$;

-- Otorgar permisos de ejecución a todas las variantes
GRANT EXECUTE ON FUNCTION public.get_all_presentation_stats() TO anon;
GRANT EXECUTE ON FUNCTION public.increment_presentation_view(text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_presentation_view(text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_presentation_view(text) TO anon;

-- Verificar que las tablas existen
CREATE TABLE IF NOT EXISTS public.presentation_stats (
    id SERIAL PRIMARY KEY,
    presentacion_id TEXT UNIQUE NOT NULL,
    titulo TEXT NOT NULL DEFAULT 'Sin título',
    total_visualizaciones INTEGER DEFAULT 0,
    ultima_visualizacion TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.presentation_views (
    id SERIAL PRIMARY KEY,
    presentacion_id TEXT NOT NULL,
    session_id TEXT,
    ip_hash TEXT,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Asegurar permisos en tablas
GRANT ALL PRIVILEGES ON public.presentation_stats TO anon;
GRANT ALL PRIVILEGES ON public.presentation_views TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Desactivar RLS
ALTER TABLE public.presentation_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentation_views DISABLE ROW LEVEL SECURITY;

-- Insertar datos iniciales
INSERT INTO public.presentation_stats (
    presentacion_id, 
    titulo, 
    total_visualizaciones,
    created_at,
    updated_at
) VALUES (
    'historia-celular', 
    'La Historia del Celular', 
    0,
    now(),
    now()
)
ON CONFLICT (presentacion_id) DO UPDATE SET
    updated_at = now();

-- PRUEBA FINAL con todas las variantes
SELECT 'TEST 1 - get_stats:' as test, public.get_all_presentation_stats();
SELECT 'TEST 2 - increment 3 params:' as test, public.increment_presentation_view('historia-celular', 'La Historia del Celular', 'test_session');
SELECT 'TEST 3 - increment 2 params:' as test, public.increment_presentation_view('historia-celular', 'La Historia del Celular');
SELECT 'TEST 4 - increment 1 param:' as test, public.increment_presentation_view('historia-celular');
SELECT 'TEST 5 - verificar final:' as test, public.get_all_presentation_stats();

-- Mensaje de éxito
SELECT '🎉 ¡FUNCIONES CREADAS CORRECTAMENTE!' as resultado;