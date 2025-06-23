[
  {
    "tabla": "math_exercises",
    "estructura": "id, operation, level, number1, number2, correct_answer, difficulty_tags, is_story_problem, story_text, created_at, updated_at"
  },
  {
    "tabla": "math_exercise_sessions",
    "estructura": "id, user_id, nivel, ejercicios, respuestas, puntuacion, tiempo_total, completado, created_at, finished_at"
  },
  {
    "tabla": "math_profiles",
    "estructura": "id, user_id, nombre_completo, edad, nivel_preferido, configuracion, estadisticas, created_at, updated_at, email, full_name, user_role, avatar_url, parent_id, teacher_id, skills, specialization, years_experience, certifications, bio, available_hours, location, rating, total_reviews, is_verified, is_active, contact_phone, contact_email, rate_per_hour, nickname, fecha_nacimiento, genero, region_chile, comuna_chile, intereses, materia_favorita, curso_actual, nombre_colegio, descripcion_personalizada, tipo_perfil, perfil_completo, profesores_asignados, fecha_asignacion, edad_calculada"
  },
  {
    "tabla": "math_sessions",
    "estructura": "id, user_id, student_name, level, exercise_count, correct_count, start_time, end_time, duration_minutes, exercises_data, created_at"
  },
  {
    "tabla": "math_skills_catalog",
    "estructura": "id, skill_code, skill_name, category, description, icon_name, color_hex, is_active, sort_order, created_at"
  },
  {
    "tabla": "math_story_attempts",
    "estructura": "id, user_id, titulo, contenido, ejercicios, respuestas, puntuacion, completado, created_at, finished_at"
  },
  {
    "tabla": "math_teacher_reviews",
    "estructura": "id, teacher_profile_id, reviewer_profile_id, rating, comment, skills_rated, is_anonymous, is_verified, created_at"
  },
  {
    "tabla": "math_teacher_student_requests",
    "estructura": "id, teacher_profile_id, student_profile_id, requested_by_profile_id, request_type, skills_needed, priority_level, notes, status, response_date, response_notes, created_at, expires_at"
  },
  {
    "tabla": "math_user_progress",
    "estructura": "id, user_id, nivel, ejercicios_completados, ejercicios_correctos, total_puntos, tiempo_total_estudio, racha_actual, racha_maxima, ultima_sesion, logros, created_at, updated_at"
  }
]