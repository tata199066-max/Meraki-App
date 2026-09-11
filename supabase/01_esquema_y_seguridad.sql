-- ============================================================
-- Meraki App — Esquema + Seguridad (Row Level Security)
-- Este script limpia cualquier intento anterior y crea todo de
-- nuevo — es seguro correrlo las veces que haga falta mientras
-- el proyecto es nuevo (no borra usuarios reales de auth.users).
-- ============================================================

-- ---------- LIMPIEZA (por si quedó algo de un intento anterior) ----------
drop trigger if exists al_crear_usuario on auth.users;

drop table if exists public.notas_personales cascade;
drop table if exists public.calificaciones cascade;
drop table if exists public.racha cascade;
drop table if exists public.checkins cascade;
drop table if exists public.progreso_niveles cascade;
drop table if exists public.masajes_pareja cascade;
drop table if exists public.pasos_estiramiento cascade;
drop table if exists public.estiramientos cascade;
drop table if exists public.pasos_zona cascade;
drop table if exists public.niveles_zona cascade;
drop table if exists public.zonas cascade;
drop table if exists public.respuestas_quiz cascade;
drop table if exists public.usuarios cascade;

drop function if exists public.manejar_nuevo_usuario() cascade;
drop function if exists public.tiene_suscripcion_activa() cascade;
drop function if exists public.es_admin() cascade;

-- ---------- USUARIOS ----------
create table public.usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text,
  email text,
  edad int,
  sexo text,
  estatura numeric,
  peso numeric,
  ocupacion text,
  rol text not null default 'usuario' check (rol in ('usuario','admin')),
  estado_suscripcion text not null default 'gratis' check (estado_suscripcion in ('gratis','activo','vencido')),
  fecha_registro timestamptz not null default now()
);

alter table public.usuarios enable row level security;

create or replace function public.es_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.usuarios where id = auth.uid() and rol = 'admin'
  );
$$;

create or replace function public.tiene_suscripcion_activa()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.usuarios where id = auth.uid() and estado_suscripcion = 'activo'
  );
$$;

create policy "ver mi propia fila" on public.usuarios
  for select using (auth.uid() = id);

create policy "admin ve todas las filas" on public.usuarios
  for select using (public.es_admin());

create policy "actualizar mi propia fila" on public.usuarios
  for update using (auth.uid() = id);

create policy "admin actualiza cualquier fila" on public.usuarios
  for update using (public.es_admin());

create or replace function public.manejar_nuevo_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.usuarios (id, email, nombre, fecha_registro)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'nombre', ''), now());
  return new;
end;
$$;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.manejar_nuevo_usuario();

-- ---------- RESPUESTAS DEL QUIZ ----------
create table public.respuestas_quiz (
  usuario_id uuid primary key references public.usuarios(id) on delete cascade,
  respuestas jsonb not null,
  creado_en timestamptz not null default now()
);
alter table public.respuestas_quiz enable row level security;

create policy "ver mis respuestas" on public.respuestas_quiz for select using (auth.uid() = usuario_id);
create policy "guardar mis respuestas" on public.respuestas_quiz for insert with check (auth.uid() = usuario_id);
create policy "actualizar mis respuestas" on public.respuestas_quiz for update using (auth.uid() = usuario_id);
create policy "admin ve todas las respuestas" on public.respuestas_quiz for select using (public.es_admin());

-- ---------- ZONAS (Automasaje) ----------
create table public.zonas (
  id text primary key,
  nombre text not null,
  bloque text not null,
  premium boolean not null default false,
  categoria_emocional boolean not null default false,
  por_que text,
  dato_clinico text,
  evitar_si text,
  orden int not null default 0
);
alter table public.zonas enable row level security;
create policy "zonas visibles para usuarios con sesión" on public.zonas for select using (auth.uid() is not null);

create table public.niveles_zona (
  id bigserial primary key,
  zona_id text not null references public.zonas(id) on delete cascade,
  numero int not null,
  dia_offset int not null,
  titulo text not null,
  avanzado boolean not null default false,
  pregunta_extra boolean not null default false,
  es_rutina_completa boolean not null default false,
  unique (zona_id, numero)
);
alter table public.niveles_zona enable row level security;
create policy "niveles visibles para usuarios con sesión" on public.niveles_zona for select using (auth.uid() is not null);

create table public.pasos_zona (
  id bigserial primary key,
  nivel_id bigint not null references public.niveles_zona(id) on delete cascade,
  orden int not null,
  titulo text not null,
  detalle text not null,
  segundos int not null
);
alter table public.pasos_zona enable row level security;

create policy "pasos visibles solo con acceso" on public.pasos_zona
  for select using (
    exists (
      select 1 from public.niveles_zona nz
      join public.zonas z on z.id = nz.zona_id
      where nz.id = pasos_zona.nivel_id
        and (z.premium = false or public.es_admin() or public.tiene_suscripcion_activa())
    )
  );

-- ---------- ESTIRAMIENTOS ----------
create table public.estiramientos (
  id text primary key,
  nombre text not null,
  premium boolean not null default false,
  grupo text,
  imagen text,
  contraindicacion text,
  orden int not null default 0
);
alter table public.estiramientos enable row level security;
create policy "estiramientos visibles para usuarios con sesión" on public.estiramientos for select using (auth.uid() is not null);

create table public.pasos_estiramiento (
  id bigserial primary key,
  estiramiento_id text not null references public.estiramientos(id) on delete cascade,
  orden int not null,
  titulo text not null,
  detalle text not null,
  segundos int not null
);
alter table public.pasos_estiramiento enable row level security;
create policy "pasos de estiramiento visibles solo con acceso" on public.pasos_estiramiento
  for select using (
    exists (
      select 1 from public.estiramientos e
      where e.id = pasos_estiramiento.estiramiento_id
        and (e.premium = false or public.es_admin() or public.tiene_suscripcion_activa())
    )
  );

-- ---------- MASAJES EN PAREJA ----------
create table public.masajes_pareja (
  id text primary key,
  nombre text not null,
  nivel text not null,
  premium boolean not null default false,
  tiempo text,
  imagen text,
  postura_recibe text,
  postura_da text,
  presion text,
  nota_consentimiento text,
  detalle text,
  orden int not null default 0
);
alter table public.masajes_pareja enable row level security;
create policy "masajes pareja: info básica visible para todos" on public.masajes_pareja
  for select using (auth.uid() is not null);

-- ---------- PROGRESO POR NIVELES ----------
create table public.progreso_niveles (
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  zona_id text not null,
  fecha_nivel1 date,
  completados jsonb not null default '{}'::jsonb,
  primary key (usuario_id, zona_id)
);
alter table public.progreso_niveles enable row level security;
create policy "ver mi progreso" on public.progreso_niveles for select using (auth.uid() = usuario_id);
create policy "insertar mi progreso" on public.progreso_niveles for insert with check (auth.uid() = usuario_id);
create policy "actualizar mi progreso" on public.progreso_niveles for update using (auth.uid() = usuario_id);
create policy "admin ve todo el progreso" on public.progreso_niveles for select using (public.es_admin());

-- ---------- CHECK-INS ----------
create table public.checkins (
  id bigserial primary key,
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  zona_id text not null,
  nivel int,
  respuesta text not null,
  respuesta_extra text,
  fecha timestamptz not null default now()
);
alter table public.checkins enable row level security;
create policy "ver mis checkins" on public.checkins for select using (auth.uid() = usuario_id);
create policy "insertar mis checkins" on public.checkins for insert with check (auth.uid() = usuario_id);
create policy "admin ve todos los checkins" on public.checkins for select using (public.es_admin());

-- ---------- RACHA ----------
create table public.racha (
  usuario_id uuid primary key references public.usuarios(id) on delete cascade,
  dias_seguidos int not null default 0,
  ultima_sesion date
);
alter table public.racha enable row level security;
create policy "ver mi racha" on public.racha for select using (auth.uid() = usuario_id);
create policy "insertar mi racha" on public.racha for insert with check (auth.uid() = usuario_id);
create policy "actualizar mi racha" on public.racha for update using (auth.uid() = usuario_id);

-- ---------- CALIFICACIONES ----------
create table public.calificaciones (
  id bigserial primary key,
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  estrellas int not null check (estrellas between 1 and 5),
  comentario text,
  autoriza_compartir boolean not null default false,
  fecha timestamptz not null default now()
);
alter table public.calificaciones enable row level security;
create policy "ver mis calificaciones" on public.calificaciones for select using (auth.uid() = usuario_id);
create policy "insertar mi calificación" on public.calificaciones for insert with check (auth.uid() = usuario_id);
create policy "admin ve todas las calificaciones" on public.calificaciones for select using (public.es_admin());

-- ---------- NOTAS PERSONALES ----------
create table public.notas_personales (
  usuario_id uuid primary key references public.usuarios(id) on delete cascade,
  texto text not null default ''
);
alter table public.notas_personales enable row level security;
create policy "ver mis notas" on public.notas_personales for select using (auth.uid() = usuario_id);
create policy "insertar mis notas" on public.notas_personales for insert with check (auth.uid() = usuario_id);
create policy "actualizar mis notas" on public.notas_personales for update using (auth.uid() = usuario_id);

-- ============================================================
-- Fin. Cuando esto corra sin errores, avísame y sigo con la
-- Parte 2 (cargar las 15 zonas, estiramientos y masajes en pareja).
-- ============================================================
