export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, accept, origin, referer',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Max-Age': '86400', // 24 horas de cache para preflight
  'Access-Control-Allow-Credentials': 'false', // ✅ CORREGIDO: false para evitar problemas con '*'
  'Vary': 'Origin', // ✅ NUEVO: Para cacheo correcto
  'Access-Control-Expose-Headers': 'content-type' // ✅ NUEVO: Headers que el cliente puede leer
}