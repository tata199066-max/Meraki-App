/*
  Meraki App — Conexión con Supabase (la base de datos real).

  Estos dos datos son públicos a propósito: el "Project URL" y la llave
  "publishable" (antes llamada "anon key") están hechos para vivir en el
  código del navegador. La seguridad real no depende de esconder estos
  datos — depende de las políticas de Row Level Security que ya quedaron
  configuradas en la base de datos (ver /supabase/01_esquema_y_seguridad.sql).
  La llave "service_role" es la única que NUNCA debe aparecer aquí.
*/

const SUPABASE_URL = 'https://dhhvgcaeiabaqkghxsec.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_Wtr1SwPNX2Vy9JeadQnLuA_XXlj0YPx';

// La librería cargada desde el CDN también se llama "supabase" en la
// página, así que aquí reemplazamos esa referencia por el cliente ya
// conectado (en vez de declarar una variable nueva con el mismo nombre,
// lo cual daría un error "ya declarado").
window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
