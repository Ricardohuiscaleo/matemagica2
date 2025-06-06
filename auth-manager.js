// Gestor de Autenticación para Matemágica PWA
// Convertido a JavaScript vanilla (sin módulos ES6)

// Solo definir AuthManager si no existe ya
if (typeof window.AuthManager === 'undefined') {
    
    class AuthManager {
        constructor() {
            this.isAuthenticated = false;
            this.currentUser = null;
            this.userProfile = null;
            console.log('🔧 AuthManager inicializado');
        }

        async initialize() {
            console.log('🚀 Inicializando AuthManager...');
            
            // Verificar si Supabase está disponible
            if (!window.supabaseClient) {
                console.warn('⚠️ Supabase no disponible, modo offline');
                return;
            }
            
            try {
                // Verificar sesión existente
                const { data: { session } } = await window.supabaseClient.auth.getSession();
                if (session) {
                    await this.handleUserAuthenticated(session.user);
                }
                
                // Configurar listeners de autenticación
                window.supabaseClient.auth.onAuthStateChange((event, session) => {
                    console.log('🔄 Estado de auth cambió:', event);
                    
                    if (event === 'SIGNED_IN' && session) {
                        this.handleUserAuthenticated(session.user);
                    } else if (event === 'SIGNED_OUT') {
                        this.handleUserSignedOut();
                    }
                });
                
                console.log('✅ AuthManager configurado correctamente');
            } catch (error) {
                console.error('❌ Error inicializando AuthManager:', error);
            }
        }

        async handleUserAuthenticated(user) {
            console.log('👤 Usuario autenticado:', user.email);
            
            this.isAuthenticated = true;
            this.currentUser = user;
            
            // Obtener o crear perfil
            try {
                this.userProfile = await this.getOrCreateProfile(user);
                this.updateAuthUI();
                console.log('✅ Perfil cargado:', this.userProfile);
            } catch (error) {
                console.error('❌ Error cargando perfil:', error);
                // Crear perfil temporal
                this.userProfile = {
                    full_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Usuario',
                    preferred_level: 1,
                    favorite_operation: 'suma'
                };
                this.updateAuthUI();
            }
        }

        handleUserSignedOut() {
            console.log('🚪 Usuario desconectado');
            
            this.isAuthenticated = false;
            this.currentUser = null;
            this.userProfile = null;
            this.updateAuthUI();
            
            if (window.mostrarMensaje) {
                window.mostrarMensaje('¡Hasta pronto! 👋', 'info');
            }
        }

        async getOrCreateProfile(user) {
            if (!window.supabaseClient) return null;
            
            try {
                // Intentar obtener perfil existente
                const { data: profile, error } = await window.supabaseClient
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                
                if (!error && profile) {
                    return profile;
                }
                
                // Crear nuevo perfil si no existe
                const newProfile = {
                    id: user.id,
                    full_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Usuario',
                    preferred_level: 1,
                    favorite_operation: 'suma',
                    total_exercises: 0,
                    correct_answers: 0,
                    created_at: new Date().toISOString()
                };
                
                const { data: createdProfile, error: createError } = await window.supabaseClient
                    .from('profiles')
                    .insert([newProfile])
                    .select()
                    .single();
                
                if (createError) throw createError;
                
                return createdProfile;
                
            } catch (error) {
                console.error('Error con perfil:', error);
                throw error;
            }
        }

        updateAuthUI() {
            console.log('🎨 Actualizando UI de autenticación...');
            
            const authButtons = document.getElementById('auth-buttons');
            const userProfile = document.getElementById('user-profile');
            const userActions = document.getElementById('user-actions');

            if (this.isAuthenticated && this.userProfile) {
                // Ocultar botones de login/registro
                if (authButtons) authButtons.classList.add('hidden');
                
                // Mostrar perfil de usuario
                if (userProfile) userProfile.classList.remove('hidden');
                if (userActions) userActions.classList.remove('hidden');
                
                // Actualizar información del perfil
                this.updateProfileDisplay();
                
                console.log('✅ UI actualizada - usuario autenticado');
            } else {
                // Mostrar botones de login/registro
                if (authButtons) authButtons.classList.remove('hidden');
                
                // Ocultar perfil de usuario
                if (userProfile) userProfile.classList.add('hidden');
                if (userActions) userActions.classList.add('hidden');
                
                console.log('✅ UI actualizada - usuario no autenticado');
            }
        }

        updateProfileDisplay() {
            if (!this.userProfile) return;

            const userName = document.getElementById('user-name');
            const userEmail = document.getElementById('user-email');
            const userAvatar = document.getElementById('user-avatar');

            if (userName) userName.textContent = this.userProfile.full_name;
            if (userEmail && this.currentUser) userEmail.textContent = this.currentUser.email;
            
            // Avatar con primera letra del nombre
            if (userAvatar) {
                userAvatar.textContent = this.userProfile.full_name.charAt(0).toUpperCase();
            }
            
            // Actualizar input de nombre en ejercicios
            const nameInput = document.getElementById('name-input');
            if (nameInput) {
                nameInput.value = this.userProfile.full_name;
            }
        }

        // Obtener preferencias del usuario para ejercicios
        getUserPreferences() {
            if (!this.userProfile) {
                return {
                    level: 1,
                    operation: 'suma',
                    name: 'Estudiante'
                };
            }
            
            return {
                level: this.userProfile.preferred_level || 1,
                operation: this.userProfile.favorite_operation || 'suma',
                name: this.userProfile.full_name || 'Estudiante'
            };
        }

        // Guardar progreso de ejercicios
        async saveExerciseProgress(exerciseData) {
            if (!this.currentUser || !window.supabaseClient) {
                console.log('💾 Guardando progreso localmente...');
                // Guardar en localStorage como fallback
                const localProgress = JSON.parse(localStorage.getItem('mathProgress') || '[]');
                localProgress.push({
                    ...exerciseData,
                    timestamp: new Date().toISOString(),
                    userId: 'offline'
                });
                localStorage.setItem('mathProgress', JSON.stringify(localProgress));
                return;
            }
            
            try {
                // Calcular estadísticas
                const totalCorrect = exerciseData.exercises.filter(ex => ex.isCorrect).length;
                const totalExercises = exerciseData.exercises.length;
                
                // Guardar sesión
                await window.supabaseClient
                    .from('exercise_sessions')
                    .insert([{
                        user_id: this.currentUser.id,
                        level: exerciseData.level,
                        operation_type: exerciseData.operation,
                        total_exercises: totalExercises,
                        correct_answers: totalCorrect,
                        accuracy: Math.round((totalCorrect / totalExercises) * 100),
                        completed_at: new Date().toISOString(),
                        exercises_data: exerciseData.exercises
                    }]);
                
                // Actualizar estadísticas del perfil
                await window.supabaseClient
                    .from('profiles')
                    .update({
                        total_exercises: this.userProfile.total_exercises + totalExercises,
                        correct_answers: this.userProfile.correct_answers + totalCorrect
                    })
                    .eq('id', this.currentUser.id);
                
                console.log('✅ Progreso guardado en la nube');
                
            } catch (error) {
                console.error('❌ Error guardando progreso:', error);
            }
        }

        // Obtener datos del usuario actual
        getCurrentUser() {
            return {
                user: this.currentUser,
                profile: this.userProfile,
                isAuthenticated: this.isAuthenticated
            };
        }
    }

    // Crear instancia global
    window.AuthManager = AuthManager;
    
    // Crear instancia y hacerla disponible globalmente
    window.authManager = new AuthManager();
    
    console.log('📋 AuthManager definido globalmente');
}