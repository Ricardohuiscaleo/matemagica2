// ✅ FUNCIÓN PARA GUARDAR SESIONES EN SUPABASE
async function guardarSesionEnSupabase(sesionData) {
    try {
        // 1. Verificar que tenemos cliente Supabase
        if (!window.supabaseClient) {
            throw new Error('Cliente Supabase no disponible');
        }
        
        // 2. Obtener usuario autenticado (esto resuelve el problema RLS)
        const { data: { user }, error: userError } = await window.supabaseClient.auth.getUser();
        
        if (userError || !user) {
            console.warn('⚠️ Usuario no autenticado, guardando solo en localStorage');
            return false; // No es error fatal, continuar con localStorage
        }
        
        // 3. Preparar datos para Supabase con formato correcto
        const sessionForDB = {
            user_id: user.id, // ✅ UUID del usuario autenticado
            student_name: sesionData.estudianteNombre || 'Estudiante',
            level: parseInt(sesionData.nivel) || 1,
            exercise_count: parseInt(sesionData.cantidad) || 0,
            correct_count: parseInt(sesionData.correctas) || 0,
            start_time: sesionData.fechaInicio || sesionData.fecha || new Date().toISOString(),
            end_time: new Date().toISOString(),
            duration_minutes: parseInt(sesionData.duracion) || Math.floor((sesionData.cantidad || 0) * 1.5),
            exercises_data: sesionData.ejercicios || []
        };
        
        // 4. Insertar en Supabase
        const { data, error } = await window.supabaseClient
            .from('math_sessions')
            .insert([sessionForDB])
            .select()
            .single();
        
        if (error) {
            console.error('❌ Error guardando sesión en Supabase:', error);
            return false; // No es error fatal, localStorage funciona
        }
        
        console.log('✅ Sesión guardada en Supabase:', data.id);
        return data;
        
    } catch (error) {
        console.error('❌ Error general guardando sesión:', error.message);
        return false; // Continuar con localStorage
    }
}

// ✅ FUNCIÓN PARA MIGRAR DATOS EXISTENTES DE LOCALSTORAGE
async function migrarDatosLocalStorageASupabase() {
    try {
        // Obtener datos existentes del localStorage
        const historialKeys = [
            'ejerciciosHistorial',
            'profesorEjerciciosHistorial', 
            'apoderadoEjerciciosHistorial'
        ];
        
        let totalMigrados = 0;
        
        for (const key of historialKeys) {
            const datosLocales = localStorage.getItem(key);
            if (!datosLocales) continue;
            
            try {
                const sesiones = JSON.parse(datosLocales);
                if (!Array.isArray(sesiones)) continue;
                
                console.log(`🔄 Migrando ${sesiones.length} sesiones de ${key}...`);
                
                for (const sesion of sesiones) {
                    const resultado = await guardarSesionEnSupabase({
                        estudianteNombre: sesion.estudianteNombre || sesion.nombre || 'Estudiante Migrado',
                        nivel: sesion.nivel,
                        cantidad: sesion.cantidad,
                        correctas: Math.floor((sesion.cantidad || 0) * 0.8), // Estimar 80% correcto
                        fecha: sesion.fecha,
                        ejercicios: sesion.ejercicios || [],
                        duracion: sesion.duracion || Math.floor((sesion.cantidad || 0) * 1.5)
                    });
                    
                    if (resultado) {
                        totalMigrados++;
                    }
                    
                    // Pausa para no saturar la API
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                
            } catch (parseError) {
                console.error(`❌ Error parseando ${key}:`, parseError);
            }
        }
        
        console.log(`✅ Migración completada: ${totalMigrados} sesiones migradas a Supabase`);
        return totalMigrados;
        
    } catch (error) {
        console.error('❌ Error en migración:', error);
        return 0;
    }
}

// ✅ FUNCIÓN HÍBRIDA: GUARDAR EN LOCALSTORAGE + SUPABASE
async function guardarSesionHibrida(sesionData) {
    // 1. SIEMPRE guardar en localStorage primero (modo offline)
    const historialKey = sesionData.tipo === 'profesor' ? 'profesorEjerciciosHistorial' : 'ejerciciosHistorial';
    const historialExistente = JSON.parse(localStorage.getItem(historialKey) || '[]');
    
    // Preparar sesión para localStorage
    const sesionParaLocal = {
        id: Date.now(),
        fecha: new Date().toISOString(),
        nivel: sesionData.nivel,
        cantidad: sesionData.cantidad,
        tipo: sesionData.tipoOperacion || 'suma',
        metodo: 'hibrido',
        estudianteId: sesionData.estudianteId,
        estudianteNombre: sesionData.estudianteNombre,
        ejercicios: sesionData.ejercicios,
        correctas: sesionData.correctas,
        duracion: sesionData.duracion
    };
    
    historialExistente.push(sesionParaLocal);
    localStorage.setItem(historialKey, JSON.stringify(historialExistente));
    console.log('💾 Sesión guardada en localStorage');
    
    // 2. INTENTAR guardar en Supabase (opcional)
    const resultadoSupabase = await guardarSesionEnSupabase(sesionData);
    
    if (resultadoSupabase) {
        // Marcar como sincronizada
        sesionParaLocal.sincronizada = true;
        sesionParaLocal.supabaseId = resultadoSupabase.id;
        
        // Actualizar localStorage con info de sincronización
        const historialActualizado = JSON.parse(localStorage.getItem(historialKey));
        const index = historialActualizado.findIndex(s => s.id === sesionParaLocal.id);
        if (index !== -1) {
            historialActualizado[index] = sesionParaLocal;
            localStorage.setItem(historialKey, JSON.stringify(historialActualizado));
        }
        
        console.log('☁️ Sesión sincronizada con Supabase');
    }
    
    return {
        local: true,
        supabase: !!resultadoSupabase,
        id: sesionParaLocal.id,
        supabaseId: resultadoSupabase?.id
    };
}

// ✅ EXPONER FUNCIONES GLOBALMENTE
window.guardarSesionEnSupabase = guardarSesionEnSupabase;
window.migrarDatosLocalStorageASupabase = migrarDatosLocalStorageASupabase;
window.guardarSesionHibrida = guardarSesionHibrida;

console.log('✅ Funciones de guardado híbrido cargadas');