-- Meraki App — soporte para planes con vigencia (1 semana / 1 mes / 3 meses)
-- en vez de una sola suscripción mensual recurrente.
--
-- Añade la fecha en la que vence el acceso Premium de cada usuario.
-- Cuando estado_suscripcion = 'activo' pero fecha_expiracion_premium ya pasó,
-- la persona deja de tener acceso automáticamente (sin necesidad de que
-- Hotmart avise nada) — tanto a nivel de base de datos (RLS) como en la app.

alter table public.usuarios
  add column if not exists fecha_expiracion_premium timestamptz;

-- La función que usan las políticas de seguridad (RLS) ahora también revisa
-- la fecha de vencimiento, no solo el estado.
create or replace function public.tiene_suscripcion_activa()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.usuarios
    where id = auth.uid()
      and estado_suscripcion = 'activo'
      and (fecha_expiracion_premium is null or fecha_expiracion_premium > now())
  );
$$;

-- Tarea diaria: pasa a "vencido" a quienes ya se les acabó el plan, para que
-- también se vea correcto en el panel/reportes (no solo en el acceso real).
-- Requiere la extensión pg_cron (activarla una sola vez en el proyecto:
-- Database > Extensions > pg_cron, en el panel de Supabase).
select cron.schedule(
  'vencer-planes-meraki',
  '0 6 * * *', -- todos los días 6:00 UTC (1:00 a.m. Bogotá)
  $$
    update public.usuarios
    set estado_suscripcion = 'vencido'
    where estado_suscripcion = 'activo'
      and fecha_expiracion_premium is not null
      and fecha_expiracion_premium < now();
  $$
);
