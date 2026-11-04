-- Se reemplaza la palabra "pulsos" por una explicación sencilla: presionar y soltar.

update public.pasos_zona p set titulo = v.t, detalle = v.d
from (values
(42,3,'Presiona y suelta, presiona y suelta','Con la pelota en el mismo punto, ahora no te quedes quieta. Deja caer el peso de tu cuerpo sobre la pelota y cuenta 1, 2, 3. Luego sube un poquito el cuerpo para quitarle peso a la pelota y afloja. Vuelve a bajar. Presionar y soltar, presionar y soltar, varias veces seguidas, como un latido lento. Es distinto al nivel 1, donde te quedabas quieta.')
) as v(n, o, t, d)
where p.nivel_id = v.n and p.orden = v.o;

update public.pasos_zona
set titulo = replace(replace(replace(titulo, 'Presión con pulsos', 'Presiona y suelta'), 'con pulsos', 'presionando y soltando'), 'pulsos', 'presiones y descansos'),
    detalle = replace(replace(detalle, 'en pulsos', 'presionando y soltando'), 'pulsos', 'presiones y descansos')
where titulo ilike '%pulso%' or detalle ilike '%pulso%';
