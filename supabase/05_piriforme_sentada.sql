-- Piriforme: se vuelve a la posición sentada con la pierna cruzada y la pelota
-- debajo del glúteo (más fuerza que contra la pared), con cada paso pidiendo
-- una sola cosa y diciendo cómo debe sentirse. No cambia tiempos.

update public.pasos_zona p set titulo = v.t, detalle = v.d
from (values
(41,2,'Siéntate y cruza la pierna','Siéntate en el piso, con las rodillas dobladas y las manos apoyadas atrás. Cruza el tobillo de la pierna que quieres trabajar sobre la rodilla de la otra pierna. Así el glúteo de ese lado queda libre y se alcanza mucho mejor.'),
(41,3,'Pon la pelota y siéntate sobre ella','Pon una pelota de tenis debajo de ese glúteo, en la parte de arriba, más o menos a medio camino entre el hueso plano que sientes al final de la espalda y el hueso que sobresale en el costado de la cadera. Déjate caer despacio sobre la pelota. Si no tienes pelota, presiona ahí mismo con los nudillos. Evita el centro exacto del glúteo, porque ahí pasa un nervio que no conviene presionar.'),
(41,4,'Presiona y respira','Deja que el peso de tu cuerpo apriete la pelota (o presiona con los nudillos), firme pero sin que duela fuerte. Debes sentir una presión profunda, como un nudo que se aprieta. Quédate quieta y respira lento hasta que termine el cronómetro. Si sientes hormigueo o una corriente bajando por la pierna, mueve la pelota un poquito de lugar. Es normal sentir que el músculo se va soltando hacia el final.'),
(42,2,'Siéntate y cruza la pierna','Igual que en el nivel anterior: siéntate en el piso, cruza el tobillo sobre la rodilla de la otra pierna y pon la pelota debajo del glúteo de ese lado, en el mismo punto.'),
(42,3,'Presiona con pulsos','Con la pelota en el mismo punto, ahora, en vez de quedarte quieta, presiona y suelta: deja caer el peso sobre la pelota y alivia, contando 3 o 4 segundos cada vez. Repítelo varias veces seguidas. Ese ritmo suelta el músculo de otra forma que la presión quieta.'),
(43,2,'Sube un poquito la pelota','Sentada y con la pierna cruzada, mueve la pelota un poco hacia arriba, hacia la espalda baja, cerca del hueso plano que sientes al final de la columna. Si sientes que la molestia baja hacia la pierna, mueve la pelota un poquito o baja la presión.'),
(43,3,'Presiona con calma','Deja caer el peso con calma sobre la pelota en ese punto y quédate quieta. Respira lento.'),
(44,2,'Baja un poquito la pelota','Sentada y con la pierna cruzada, mueve la pelota hacia el costado, un poco más abajo del punto del centro, hacia el hueso que sobresale en el costado de la cadera. Quédate un poco antes de llegar al hueso, sobre el músculo.'),
(44,3,'Presión más profunda','Este nivel es avanzado: deja caer más peso sobre la pelota, sin moverte. Si el dolor se dispara hacia la pierna en vez de aliviarse, baja la presión de inmediato.'),
(45,2,'Punto del centro','Sentada con la pierna cruzada, deja caer el peso sobre la pelota en el punto del centro, el mismo de los niveles anteriores. Quédate quieta.'),
(45,3,'Punto de arriba','Mueve la pelota un poco hacia la espalda baja y quédate quieta ahí.'),
(45,4,'Punto de abajo','Mueve la pelota hacia el costado de la cadera y quédate quieta ahí.')
) as v(n, o, t, d)
where p.nivel_id = v.n and p.orden = v.o;
