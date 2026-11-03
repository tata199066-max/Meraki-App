-- Piriforme: orden de la técnica en el nivel 1.
-- 1) Calentamiento solo con la mano. 2) Posición (piso o silla, pierna cruzada).
-- 3) Sentarse sobre la pelota y balancearse para encontrar el punto.
-- 4) Dejar la pelota en el punto que más duele, aguantar respirando y soltando.

update public.pasos_zona p set titulo = v.t, detalle = v.d
from (values
(41,1,'Calienta con la mano','Antes de usar la pelota, caliéntate solo con la mano. De pie, con la palma abierta y plana, desliza suave sobre todo el glúteo del lado que vas a trabajar, de arriba hacia abajo y de lado a lado, varias veces. Así el músculo se calienta y la pelota duele menos.'),
(41,3,'Siéntate sobre la pelota y balancéate','Esta técnica se hace con una pelota de tenis: con la mano sola no se alcanza el músculo. Pon la pelota debajo del glúteo de la pierna cruzada, en la parte carnosa, un poco más arriba que el centro, más o menos a medio camino entre el hueso plano que sientes al final de la espalda y el hueso que sobresale en el costado de la cadera. No la pongas en la espalda baja. Déjate caer despacio sobre la pelota y haz un pequeño balanceo: muévete muy despacio, unos centímetros, hacia adelante y hacia atrás o de lado a lado, para recorrer la zona y encontrar el punto donde más sientes la tensión. Evita el centro exacto del glúteo, porque ahí pasa un nervio que no conviene presionar.'),
(41,4,'Quédate en el punto que más duele','Cuando encuentres el punto que más tensión te da, deja la pelota ahí, quieta. El peso de tu cuerpo hace la presión: firme, pero sin que sea un dolor fuerte. Aguanta respirando profundo y, al botar el aire, suelta el cuerpo despacio. Repite respirando así hasta que termine el cronómetro. Debes sentir una presión profunda, como un nudo que se va soltando. Si sientes hormigueo o una corriente bajando por la pierna, mueve la pelota un poquito de lugar. Si duele demasiado, baja la pierna cruzada y siéntate igual sobre la pelota, con las dos piernas abajo.')
) as v(n, o, t, d)
where p.nivel_id = v.n and p.orden = v.o;
