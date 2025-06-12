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
  // ✅ NUEVO: Headers CORS simplificados para máxima compatibilidad
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };

  // ✅ MEJORADO: Manejo de preflight más simple
  if (req.method === 'OPTIONS') {
    console.log('🔄 Manejando preflight CORS request simple');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { 
      prompt, 
      schema, 
      temperature = 0.7, 
      maxTokens = 2048,
      anon_key // ✅ NUEVO: Recibir API key en el body en lugar del header
    } = requestBody;
    
    console.log('🌐 Request recibido - Verificando configuración...');
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Prompt requerido para generar contenido' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // ✅ NUEVO: Validar anon_key básica (opcional para CORS)
    if (anon_key && !anon_key.startsWith('eyJ')) {
      console.log('⚠️ API key de Supabase inválida recibida');
    }

    // Obtener API key de Gemini desde variables de entorno
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY no configurada');
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
          corsMode: 'simplified' // ✅ NUEVO: Indicar modo CORS simplificado
        }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        } 
      }
    )

  } catch (error) {
    console.error('💥 Error en Edge Function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Error generando contenido con IA',
        fallback: true,
        corsMode: 'simplified' // ✅ NUEVO: Indicar modo CORS simplificado
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        } 
      }
    )
  }
})