-- ============================================================
-- Meraki App — Agregar campo de celular (opcional) a usuarios
-- Este script es seguro: NO borra tablas ni usuarios existentes,
-- solo agrega la columna nueva y actualiza el disparador de registro.
-- ============================================================

alter table public.usuarios add column if not exists celular text;

create or replace function public.manejar_nuevo_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.usuarios (id, email, nombre, celular, fecha_registro)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nombre', ''),
    nullif(new.raw_user_meta_data->>'celular', ''),
    now()
  );
  return new;
end;
$$;
