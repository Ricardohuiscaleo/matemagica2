-- Migración: Agregar tabla de estadísticas de presentaciones
-- Fecha: 12 de junio de 2025
-- Propósito: Trackear visualizaciones de presentaciones educativas de Gaby

-- Tabla: presentation_stats (estadísticas de presentaciones)
CREATE TABLE public.presentation_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    presentacion_id TEXT NOT NULL, -- 'historia-celular', 'ciencias-naturales', etc.
    titulo TEXT NOT NULL,
    total_visualizaciones INTEGER DEFAULT 0,
    visualizaciones_mes_actual INTEGER DEFAULT 0,
    ultima_visualizacion TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}', -- info adicional como duración promedio, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(presentacion_id)
);

-- Tabla: presentation_views (registro individual de cada visualización)
CREATE TABLE public.presentation_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    presentacion_id TEXT NOT NULL,
    session_id TEXT, -- identificador de sesión anónima
    ip_hash TEXT, -- hash de IP para analytics (sin datos personales)
    user_agent_hash TEXT, -- hash del user agent
    duracion_segundos INTEGER, -- tiempo que vio la presentación
    dispositivo TEXT, -- 'mobile', 'desktop', 'tablet'
    referrer TEXT, -- de donde vino
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para optimización
CREATE INDEX idx_presentation_stats_presentacion_id ON public.presentation_stats(presentacion_id);
CREATE INDEX idx_presentation_views_presentacion_id ON public.presentation_views(presentacion_id);
CREATE INDEX idx_presentation_views_created_at ON public.presentation_views(created_at);

-- Habilitar acceso público para estadísticas (solo lectura)
ALTER TABLE public.presentation_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentation_views ENABLE ROW LEVEL SECURITY;

-- Políticas: Cualquiera puede leer estadísticas, solo sistema puede escribir
CREATE POLICY "presentation_stats_public_read" ON public.presentation_stats
    FOR SELECT USING (true);

CREATE POLICY "presentation_views_public_insert" ON public.presentation_views
    FOR INSERT WITH CHECK (true);

-- Función para incrementar contador de visualizaciones
CREATE OR REPLACE FUNCTION increment_presentation_view(
    p_presentacion_id TEXT,
    p_titulo TEXT DEFAULT NULL,
    p_session_id TEXT DEFAULT NULL,
    p_ip_hash TEXT DEFAULT NULL,
    p_user_agent_hash TEXT DEFAULT NULL,
    p_duracion_segundos INTEGER DEFAULT NULL,
    p_dispositivo TEXT DEFAULT 'desktop',
    p_referrer TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
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
        visualizaciones_mes_actual, ultima_visualizacion
    ) VALUES (
        p_presentacion_id, 
        COALESCE(p_titulo, p_presentacion_id),
        1, 
        1, 
        now()
    )
    ON CONFLICT (presentacion_id) DO UPDATE SET
        total_visualizaciones = presentation_stats.total_visualizaciones + 1,
        visualizaciones_mes_actual = CASE 
            WHEN DATE_TRUNC('month', presentation_stats.updated_at) = DATE_TRUNC('month', now())
            THEN presentation_stats.visualizaciones_mes_actual + 1
            ELSE 1
        END,
        ultima_visualizacion = now(),
        updated_at = now();
    
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
$$ LANGUAGE plpgsql;

-- Función para obtener todas las estadísticas
CREATE OR REPLACE FUNCTION get_all_presentation_stats()
RETURNS JSONB AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_presentation_stats_updated_at
    BEFORE UPDATE ON public.presentation_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar datos iniciales
INSERT INTO public.presentation_stats (presentacion_id, titulo, total_visualizaciones) VALUES
('historia-celular', 'La Historia del Celular', 0),
('ciencias-naturales', 'Ciencias Naturales', 0),
('literatura', 'Literatura', 0)
ON CONFLICT (presentacion_id) DO NOTHING;

-- Mensaje de confirmación
DO $$ 
BEGIN
    RAISE NOTICE '📊 ¡TABLA DE ESTADÍSTICAS CREADA!';
    RAISE NOTICE '✅ presentation_stats para agregados';
    RAISE NOTICE '✅ presentation_views para registros individuales';
    RAISE NOTICE '✅ Funciones para incrementar y obtener stats';
    RAISE NOTICE '✅ Políticas RLS configuradas';
    RAISE NOTICE '🚀 Listo para trackear presentaciones de Gaby';
END $$;