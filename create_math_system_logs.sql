-- Script SQL para crear la tabla math_system_logs
CREATE TABLE public.math_system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ DEFAULT now(),
    level VARCHAR(20) NOT NULL CHECK (level IN ('info', 'warning', 'error', 'debug')),
    message TEXT NOT NULL,
    module VARCHAR(50),
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Comentarios de la tabla
COMMENT ON TABLE public.math_system_logs IS 'Logs del sistema de Matemágica';
COMMENT ON COLUMN public.math_system_logs.id IS 'Identificador único del log';
COMMENT ON COLUMN public.math_system_logs.timestamp IS 'Momento exacto del evento';
COMMENT ON COLUMN public.math_system_logs.level IS 'Nivel del log: info, warning, error, debug';
COMMENT ON COLUMN public.math_system_logs.message IS 'Mensaje principal del log';
COMMENT ON COLUMN public.math_system_logs.module IS 'Módulo del sistema que generó el log';
COMMENT ON COLUMN public.math_system_logs.details IS 'Detalles adicionales en formato JSON';

-- Permisos RLS
ALTER TABLE public.math_system_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
CREATE POLICY "Los administradores pueden ver todos los logs" 
    ON public.math_system_logs 
    FOR SELECT 
    TO authenticated 
    USING (auth.uid() IN (
        SELECT auth.uid() 
        FROM public.math_profiles 
        WHERE user_role = 'admin'
    ));

CREATE POLICY "Los administradores pueden insertar logs" 
    ON public.math_system_logs 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() IN (
        SELECT auth.uid() 
        FROM public.math_profiles 
        WHERE user_role = 'admin'
    ));

-- Insertar algunos logs de ejemplo
INSERT INTO public.math_system_logs (level, message, module, details)
VALUES 
    ('info', 'Sistema iniciado correctamente', 'core', '{"version": "2.5.0", "environment": "production"}'::jsonb),
    ('info', 'Conexión a base de datos establecida', 'database', '{"tables": ["math_profiles", "math_sessions", "math_exercises", "math_user_progress"]}'::jsonb),
    ('warning', 'Caché de ejercicios reiniciado por exceso de memoria', 'cache', '{"cacheSize": "25MB", "threshold": "20MB", "action": "purge"}'::jsonb),
    ('error', 'Error al procesar ejercicio personalizado', 'exercises', '{"userId": "user_1234", "exerciseId": "ex_789", "error": "Formato de ejercicio inválido"}'::jsonb),
    ('info', 'Usuario admin autenticado correctamente', 'auth', '{"role": "admin", "method": "supabase-auth", "provider": "email"}'::jsonb);

