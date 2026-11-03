-- Piriforme: aclara que la pelota va debajo del glúteo de la pierna cruzada
-- (la que tiene el tobillo sobre la rodilla), que es el músculo que se trabaja.

update public.pasos_zona p set titulo = v.t, detalle = v.d
from (values
(41,2,'Siéntate y cruza la pierna','Siéntate en el piso, con las rodillas dobladas y las manos apoyadas atrás. Cruza el tobillo de la pierna que quieres trabajar sobre la rodilla de la otra pierna, como formando un número 4. La pierna cruzada es la que vas a trabajar: la pelota irá debajo de ese glúteo.'),
(41,3,'Pon la pelota y siéntate sobre ella','Pon una pelota de tenis debajo del glúteo de la pierna cruzada, en la parte carnosa, un poco más arriba que el centro, más o menos a medio camino entre el hueso plano que sientes al final de la espalda y el hueso que sobresale en el costado de la cadera. No la pongas en la espalda baja. Déjate caer despacio sobre la pelota. Si no tienes pelota, presiona ahí mismo con los nudillos. Evita el centro exacto del glúteo, porque ahí pasa un nervio que no conviene presionar.'),
(42,2,'Siéntate y cruza la pierna','Igual que en el nivel anterior: siéntate en el piso, cruza el tobillo sobre la rodilla de la otra pierna y pon la pelota debajo del glúteo de la pierna cruzada, en el mismo punto.')
) as v(n, o, t, d)
where p.nivel_id = v.n and p.orden = v.o;
