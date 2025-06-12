// Edge Function para Matemágica PWA - Gemini AI
// Configuración optimizada para Supabase Edge Functions

// Declaraciones de tipos para Deno en entorno VS Code
declare global {
  const Deno: {
    env: {
      get(key: string): string | undefined;
    };
  };
}

// @ts-ignore - Ignorar error de módulo Deno para VS Code
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

// Tipos para la API de Gemini
interface GeminiRequest {
  prompt: string
  schema?: any
  temperature?: number
  maxTokens?: number
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>
    }
  }>
}

serve(async (req: Request) => {
  // ✅ NUEVO: Logging mejorado para diagnóstico CORS
  const origin = req.headers.get('origin') || 'unknown'
  const userAgent = req.headers.get('user-agent') || 'unknown'
  console.log(`🌐 Request desde: ${origin} | User-Agent: ${userAgent.substring(0, 50)}...`)
  
  // ✅ MEJORADO: Manejar CORS preflight con headers específicos
  if (req.method === 'OPTIONS') {
    console.log('🔄 Manejando preflight CORS request')
    return new Response('ok', { 
      headers: {
        ...corsHeaders,
        // ✅ NUEVO: Headers específicos para Netlify
        'Access-Control-Allow-Origin': origin.includes('netlify.app') ? origin : '*',
      }
    })
  }

  try {
    const { prompt, schema, temperature = 0.7, maxTokens = 2048 }: GeminiRequest = await req.json()
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ success: false, error: 'Prompt requerido para generar contenido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Obtener API key desde variables de entorno de Deno
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY no configurada')
    }

    console.log('🚀 Generando contenido con Gemini AI...')

    // Llamar a Gemini AI con configuración optimizada
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: prompt }]
          }],
          generationConfig: schema ? {
            responseMimeType: 'application/json',
            responseSchema: schema,
            temperature,
            maxOutputTokens: maxTokens
          } : {
            temperature,
            maxOutputTokens: maxTokens
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH', 
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Error de Gemini API:', response.status, errorText)
      throw new Error(`Gemini API Error: ${response.status} - ${errorText}`)
    }

    const data: GeminiResponse = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (!content) {
      console.error('❌ No hay contenido en la respuesta de Gemini')
      throw new Error('No content in API response')
    }

    console.log('✅ Contenido generado exitosamente')

    // Si es JSON schema, parsear la respuesta
    let result: any
    try {
      result = schema ? JSON.parse(content) : content
    } catch (parseError) {
      console.error('❌ Error parseando JSON:', parseError)
      result = content
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        content: result,
        metadata: {
          hasSchema: !!schema,
          contentLength: content.length,
          timestamp: new Date().toISOString(),
          origin: origin // ✅ NUEVO: Incluir origin en respuesta para debug
        }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          // ✅ NUEVO: Origin específico para Netlify
          'Access-Control-Allow-Origin': origin.includes('netlify.app') ? origin : '*',
        } 
      }
    )

  } catch (error) {
    console.error('💥 Error en Edge Function:', error)
    console.error('🌐 Origin del request problemático:', origin)
    
    // Determinar el tipo de error para mejor manejo
    const isAPIError = error instanceof Error && error.message.includes('Gemini API')
    const isConfigError = error instanceof Error && error.message.includes('GEMINI_API_KEY')
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: isConfigError 
          ? 'Configuración de IA no disponible' 
          : isAPIError 
            ? 'Servicio de IA temporalmente no disponible'
            : 'Error generando contenido con IA',
        fallback: true,
        errorType: isConfigError ? 'config' : isAPIError ? 'api' : 'unknown',
        origin: origin // ✅ NUEVO: Incluir origin en error para debug
      }),
      { 
        status: isConfigError ? 500 : isAPIError ? 503 : 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          // ✅ NUEVO: Origin específico para Netlify
          'Access-Control-Allow-Origin': origin.includes('netlify.app') ? origin : '*',
        } 
      }
    )
  }
})