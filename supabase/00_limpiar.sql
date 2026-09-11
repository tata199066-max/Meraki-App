-- ============================================================
-- Meraki App — Limpieza (solo si el script de la Parte 1 falló
-- a medias y necesitas empezar de cero). Es seguro correrlo:
-- como el proyecto es nuevo, no borra ningún dato real de usuarios.
-- Pega esto en el SQL Editor, dale Run, y luego vuelve a correr
-- 01_esquema_y_seguridad.sql completo desde el principio.
-- ============================================================

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
