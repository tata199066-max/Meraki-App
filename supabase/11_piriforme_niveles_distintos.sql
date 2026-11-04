-- Piriforme: cada nivel se siente distinto.
-- 1 Centro, presión quieta. 2 Centro con pulsos. 3 Punto de arriba (pierna cruzada
-- la que no duele). 4 Punto de abajo abriendo y cerrando las rodillas (movimiento).
-- 5 Rutina: los 3 puntos y recorrido final rodando la pelota.

update public.pasos_zona p set titulo = v.t, detalle = v.d
from (values
(42,1,'Calienta con la mano sobre el glúteo','Con la palma abierta y plana, desliza suave sobre todo el glúteo (no sobre la cadera), de arriba hacia abajo y de lado a lado, varias veces.'),
(42,2,'Siéntate y cruza la pierna','Igual que en el nivel anterior: en el piso o en el borde de una silla firme, cruza el tobillo sobre la rodilla de la otra pierna y pon la pelota debajo del glúteo de la pierna cruzada, en el punto del centro. Si te duele demasiado, déjala abajo, sin cruzar.'),
(42,3,'Presiona y suelta, con pulsos','Con la pelota en el mismo punto, ahora no te quedes quieta: deja caer el peso sobre la pelota y alivia, contando 3 o 4 segundos cada vez. Repítelo varias veces seguidas, como un latido lento. Este ritmo suelta el músculo de otra forma que la presión quieta del nivel 1.'),
(42,4,'Suelta despacio','Quédate un momento sobre la pelota sin presionar, respirando hondo dos veces, y suelta poco a poco.'),
(44,1,'Calienta con la mano sobre el glúteo','Con la palma abierta y plana, desliza suave sobre todo el glúteo (no sobre la cadera), varias veces.'),
(44,2,'Piernas abajo y baja la pelota','Siéntate con las dos piernas abajo, los pies apoyados en el piso y las rodillas dobladas. Mueve la pelota hacia el costado, un poco más abajo del punto del centro, hacia el hueso que sobresale en el costado de la cadera. Quédate un poco antes de llegar al hueso, sobre el músculo.'),
(44,3,'Abre y cierra las rodillas','Este nivel es avanzado: con la pelota en ese punto, abre un poquito las piernas, dejando caer las rodillas hacia afuera, y luego ciérralas despacio. Repite el movimiento lento, respirando profundo, mientras el peso de tu cuerpo apoya sobre la pelota. El movimiento ayuda a soltar más que la presión quieta. Si el dolor se dispara hacia la pierna en vez de aliviarse, baja la presión de inmediato.'),
(44,4,'Cierre','Junta las rodillas, quédate quieta sobre la pelota sin presionar y suelta despacio, respirando hondo.'),
(45,1,'Calienta con la mano sobre el glúteo','Con la palma abierta y plana, desliza suave sobre todo el glúteo (no sobre la cadera), varias veces.'),
(45,2,'Punto del centro','Sentada sobre la pelota, con la pierna cruzada (o sin cruzar si duele), deja caer el peso en el punto del centro, el mismo del nivel 1. Quédate quieta, respirando profundo.'),
(45,3,'Punto de arriba','Cruza la pierna que no te duele, pon la pelota debajo de la que sí te duele y súbela un poco hacia la espalda baja. Déjate caer un poquito hacia atrás, apoyándote en las manos, y aguanta respirando.'),
(45,4,'Punto de abajo','Con las dos piernas abajo, mueve la pelota hacia el costado, cerca del hueso de la cadera. Abre y cierra las rodillas muy despacio, respirando profundo.'),
(45,5,'Rueda la pelota y cierra','Para terminar, rueda la pelota muy despacio, unos centímetros a la vez, por todo el glúteo, del punto de arriba al de abajo. Suelta el peso poco a poco y respira hondo dos veces.')
) as v(n, o, t, d)
where p.nivel_id = v.n and p.orden = v.o;
