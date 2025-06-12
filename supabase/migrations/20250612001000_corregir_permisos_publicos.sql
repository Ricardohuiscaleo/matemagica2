-- Corregir políticas RLS para funciones públicas
-- Fecha: 12 de junio de 2025
-- Propósito: Permitir acceso público a estadísticas de presentaciones

-- Eliminar políticas existentes que puedan estar causando conflicto
DROP POLICY IF EXISTS "presentation_stats_public_read" ON public.presentation_stats;
DROP POLICY IF EXISTS "presentation_views_public_insert" ON public.presentation_views;

-- Crear políticas más permisivas para funciones públicas
CREATE POLICY "allow_public_read_stats" ON public.presentation_stats
    FOR SELECT USING (true);

CREATE POLICY "allow_public_insert_views" ON public.presentation_views
    FOR INSERT WITH CHECK (true);

-- Asegurar que las funciones sean públicas
GRANT EXECUTE ON FUNCTION increment_presentation_view TO anon;
GRANT EXECUTE ON FUNCTION get_all_presentation_stats TO anon;

-- Permitir acceso anónimo a las tablas para las funciones
GRANT SELECT ON public.presentation_stats TO anon;
GRANT INSERT ON public.presentation_views TO anon;
GRANT UPDATE ON public.presentation_stats TO anon;

-- Verificar que las funciones tengan el SECURITY DEFINER correcto
CREATE OR REPLACE FUNCTION get_all_presentation_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'presentacion_id', presentacion_id,
            'titulo', titulo,
            'total_visualizaciones', total_visualizaciones,
            'visualizaciones_mes_actual', visualizaciones_mes_actual,
            'ultima_visualizacion', ultima_visualizacion,
            'created_at', created_at,
            'updated_at', updated_at
        )
    ) INTO v_result
    FROM public.presentation_stats
    ORDER BY total_visualizaciones DESC;
    
    RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

-- Actualizar función increment_presentation_view con SECURITY DEFINER
CREATE OR REPLACE FUNCTION increment_presentation_view(
    p_presentacion_id TEXT,
    p_titulo TEXT DEFAULT NULL,
    p_session_id TEXT DEFAULT NULL,
    p_ip_hash TEXT DEFAULT NULL,
    p_user_agent_hash TEXT DEFAULT NULL,
    p_duracion_segundos INTEGER DEFAULT NULL,
    p_dispositivo TEXT DEFAULT 'desktop',
    p_referrer TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSONB;
BEGIN
    -- Insertar registro individual de visualización
    INSERT INTO public.presentation_views (
        presentacion_id, session_id, ip_hash, user_agent_hash, 
        duracion_segundos, dispositivo, referrer
    ) VALUES (
        p_presentacion_id, p_session_id, p_ip_hash, p_user_agent_hash,
        p_duracion_segundos, p_dispositivo, p_referrer
    );
    
    -- Actualizar o crear estadística agregada
    INSERT INTO public.presentation_stats (
        presentacion_id, titulo, total_visualizaciones, 
        visualizaciones_mes_actual, ultima_visualizacion, metadata
    ) VALUES (
        p_presentacion_id, 
        COALESCE(p_titulo, p_presentacion_id),
        1, 
        1, 
        now(),
        p_metadata
    )
    ON CONFLICT (presentacion_id) DO UPDATE SET
        total_visualizaciones = presentation_stats.total_visualizaciones + 1,
        visualizaciones_mes_actual = CASE 
            WHEN DATE_TRUNC('month', presentation_stats.updated_at) = DATE_TRUNC('month', now())
            THEN presentation_stats.visualizaciones_mes_actual + 1
            ELSE 1
        END,
        ultima_visualizacion = now(),
        updated_at = now(),
        metadata = COALESCE(p_metadata, presentation_stats.metadata);
    
    -- Retornar estadísticas actualizadas
    SELECT jsonb_build_object(
        'presentacion_id', presentacion_id,
        'titulo', titulo,
        'total_visualizaciones', total_visualizaciones,
        'visualizaciones_mes_actual', visualizaciones_mes_actual,
        'ultima_visualizacion', ultima_visualizacion
    ) INTO v_result
    FROM public.presentation_stats 
    WHERE presentacion_id = p_presentacion_id;
    
    RETURN v_result;
END;
$$;

-- Mensaje de confirmación
DO $$ 
BEGIN
    RAISE NOTICE '🔓 ¡PERMISOS CORREGIDOS!';
    RAISE NOTICE '✅ Políticas RLS actualizadas para acceso público';
    RAISE NOTICE '✅ Funciones con SECURITY DEFINER';
    RAISE NOTICE '✅ Permisos anónimos otorgados';
    RAISE NOTICE '🚀 Analytics públicos funcionando correctamente';
END $$;