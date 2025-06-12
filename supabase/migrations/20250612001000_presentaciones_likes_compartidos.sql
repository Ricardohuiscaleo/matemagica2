-- MIGRACIÓN: Agregar tabla de likes y compartidos para presentaciones
-- Fecha: 12 de junio de 2025
-- Propósito: Trackear likes, dislikes y compartidos de presentaciones

-- Tabla: presentation_likes (likes y dislikes individuales)
CREATE TABLE IF NOT EXISTS public.presentation_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    presentacion_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    accion TEXT NOT NULL CHECK (accion IN ('like', 'unlike', 'dislike')),
    ip_hash TEXT,
    user_agent_hash TEXT,
    dispositivo TEXT DEFAULT 'desktop',
    pais TEXT,
    ciudad TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Constraint único: una sesión solo puede dar un like por presentación
    UNIQUE(presentacion_id, session_id)
);

-- Tabla: presentation_shares (compartidos)
CREATE TABLE IF NOT EXISTS public.presentation_shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    presentacion_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    tipo_compartir TEXT NOT NULL CHECK (tipo_compartir IN ('facebook', 'twitter', 'whatsapp', 'email', 'copy_link', 'download')),
    ip_hash TEXT,
    user_agent_hash TEXT,
    dispositivo TEXT DEFAULT 'desktop',
    pais TEXT,
    ciudad TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_presentation_likes_presentacion_id ON public.presentation_likes(presentacion_id);
CREATE INDEX IF NOT EXISTS idx_presentation_likes_session_id ON public.presentation_likes(session_id);
CREATE INDEX IF NOT EXISTS idx_presentation_likes_accion ON public.presentation_likes(accion);
CREATE INDEX IF NOT EXISTS idx_presentation_shares_presentacion_id ON public.presentation_shares(presentacion_id);
CREATE INDEX IF NOT EXISTS idx_presentation_shares_tipo ON public.presentation_shares(tipo_compartir);

-- Habilitar RLS
ALTER TABLE public.presentation_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentation_shares ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen y crear nuevas
DROP POLICY IF EXISTS "presentation_likes_public_read" ON public.presentation_likes;
DROP POLICY IF EXISTS "presentation_likes_public_insert" ON public.presentation_likes;
DROP POLICY IF EXISTS "presentation_likes_public_update" ON public.presentation_likes;
DROP POLICY IF EXISTS "presentation_shares_public_read" ON public.presentation_shares;
DROP POLICY IF EXISTS "presentation_shares_public_insert" ON public.presentation_shares;

-- Crear políticas RLS: Cualquiera puede leer y escribir (es contenido público educativo)
CREATE POLICY "presentation_likes_public_read" ON public.presentation_likes
    FOR SELECT USING (true);

CREATE POLICY "presentation_likes_public_insert" ON public.presentation_likes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "presentation_likes_public_update" ON public.presentation_likes
    FOR UPDATE USING (true);

CREATE POLICY "presentation_shares_public_read" ON public.presentation_shares
    FOR SELECT USING (true);

CREATE POLICY "presentation_shares_public_insert" ON public.presentation_shares
    FOR INSERT WITH CHECK (true);

-- Función para registrar like/unlike
CREATE OR REPLACE FUNCTION public.registrar_like_presentacion(
    presentacion_id_param TEXT,
    session_id_param TEXT,
    accion_param TEXT,
    ip_hash_param TEXT DEFAULT NULL,
    user_agent_hash_param TEXT DEFAULT NULL,
    dispositivo_param TEXT DEFAULT 'desktop',
    pais_param TEXT DEFAULT NULL,
    ciudad_param TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_resultado JSON;
    v_total_likes INTEGER;
    v_total_dislikes INTEGER;
BEGIN
    -- Validar acción
    IF accion_param NOT IN ('like', 'unlike', 'dislike') THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Acción no válida'
        );
    END IF;
    
    -- Insertar o actualizar like
    INSERT INTO public.presentation_likes (
        presentacion_id, session_id, accion, ip_hash, user_agent_hash,
        dispositivo, pais, ciudad, created_at, updated_at
    ) VALUES (
        presentacion_id_param, session_id_param, accion_param, 
        ip_hash_param, user_agent_hash_param, dispositivo_param,
        pais_param, ciudad_param, now(), now()
    )
    ON CONFLICT (presentacion_id, session_id) 
    DO UPDATE SET
        accion = accion_param,
        updated_at = now();
    
    -- Obtener totales actualizados
    SELECT 
        COUNT(*) FILTER (WHERE accion = 'like'),
        COUNT(*) FILTER (WHERE accion = 'dislike')
    INTO v_total_likes, v_total_dislikes
    FROM public.presentation_likes 
    WHERE presentacion_id = presentacion_id_param;
    
    -- Retornar resultado
    RETURN json_build_object(
        'success', true,
        'presentacion_id', presentacion_id_param,
        'accion', accion_param,
        'total_likes', v_total_likes,
        'total_dislikes', v_total_dislikes,
        'session_id', session_id_param,
        'timestamp', now()
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM,
        'code', SQLSTATE
    );
END;
$$;

-- Función para registrar compartir
CREATE OR REPLACE FUNCTION public.registrar_compartir_presentacion(
    presentacion_id_param TEXT,
    session_id_param TEXT,
    tipo_compartir_param TEXT,
    ip_hash_param TEXT DEFAULT NULL,
    user_agent_hash_param TEXT DEFAULT NULL,
    dispositivo_param TEXT DEFAULT 'desktop',
    pais_param TEXT DEFAULT NULL,
    ciudad_param TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_total_compartidos INTEGER;
BEGIN
    -- Validar tipo de compartir
    IF tipo_compartir_param NOT IN ('facebook', 'twitter', 'whatsapp', 'email', 'copy_link', 'download') THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Tipo de compartir no válido'
        );
    END IF;
    
    -- Insertar compartir
    INSERT INTO public.presentation_shares (
        presentacion_id, session_id, tipo_compartir, ip_hash, user_agent_hash,
        dispositivo, pais, ciudad, created_at
    ) VALUES (
        presentacion_id_param, session_id_param, tipo_compartir_param,
        ip_hash_param, user_agent_hash_param, dispositivo_param,
        pais_param, ciudad_param, now()
    );
    
    -- Obtener total de compartidos para esta presentación
    SELECT COUNT(*) INTO v_total_compartidos
    FROM public.presentation_shares 
    WHERE presentacion_id = presentacion_id_param;
    
    -- Retornar resultado
    RETURN json_build_object(
        'success', true,
        'presentacion_id', presentacion_id_param,
        'tipo_compartir', tipo_compartir_param,
        'total_compartidos', v_total_compartidos,
        'session_id', session_id_param,
        'timestamp', now()
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM,
        'code', SQLSTATE
    );
END;
$$;

-- Función para obtener estadísticas completas de una presentación
CREATE OR REPLACE FUNCTION public.obtener_estadisticas_presentacion(
    presentacion_id_param TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_resultado JSON;
    v_likes INTEGER;
    v_dislikes INTEGER;
    v_compartidos INTEGER;
    v_visualizaciones INTEGER;
BEGIN
    -- Obtener likes y dislikes
    SELECT 
        COUNT(*) FILTER (WHERE accion = 'like'),
        COUNT(*) FILTER (WHERE accion = 'dislike')
    INTO v_likes, v_dislikes
    FROM public.presentation_likes 
    WHERE presentacion_id = presentacion_id_param;
    
    -- Obtener compartidos
    SELECT COUNT(*) INTO v_compartidos
    FROM public.presentation_shares 
    WHERE presentacion_id = presentacion_id_param;
    
    -- Obtener visualizaciones
    SELECT COALESCE(total_visualizaciones, 0) INTO v_visualizaciones
    FROM public.presentation_stats 
    WHERE presentacion_id = presentacion_id_param;
    
    -- Construir resultado
    RETURN json_build_object(
        'presentacion_id', presentacion_id_param,
        'visualizaciones', v_visualizaciones,
        'likes', v_likes,
        'dislikes', v_dislikes,
        'compartidos', v_compartidos,
        'engagement', (v_likes + v_compartidos)::DECIMAL / GREATEST(v_visualizaciones, 1) * 100,
        'timestamp', now()
    );
END;
$$;

-- Otorgar permisos a las funciones
GRANT EXECUTE ON FUNCTION public.registrar_like_presentacion(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.registrar_like_presentacion(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

GRANT EXECUTE ON FUNCTION public.registrar_compartir_presentacion(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.registrar_compartir_presentacion(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

GRANT EXECUTE ON FUNCTION public.obtener_estadisticas_presentacion(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.obtener_estadisticas_presentacion(TEXT) TO authenticated;

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar trigger si existe y crear nuevo
DROP TRIGGER IF EXISTS update_presentation_likes_updated_at ON public.presentation_likes;
CREATE TRIGGER update_presentation_likes_updated_at
    BEFORE UPDATE ON public.presentation_likes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Test de las funciones
SELECT 'Testing registrar_like_presentacion' as test;
SELECT public.registrar_like_presentacion('historia-celular', 'test-session-123', 'like', 'hash123', 'ua456', 'desktop', 'Chile', 'Arica');

SELECT 'Testing registrar_compartir_presentacion' as test;
SELECT public.registrar_compartir_presentacion('historia-celular', 'test-session-123', 'facebook', 'hash123', 'ua456', 'desktop', 'Chile', 'Arica');

SELECT 'Testing obtener_estadisticas_presentacion' as test;
SELECT public.obtener_estadisticas_presentacion('historia-celular');

-- Mensaje final
SELECT '🎉 ¡TABLAS DE LIKES Y COMPARTIDOS CREADAS EXITOSAMENTE!' as mensaje;