-- Piriforme: el calentamiento va sobre el glúteo (no sobre la cadera ni la cintura).

update public.pasos_zona p set titulo = v.t, detalle = v.d
from (values
(41,1,'Calienta con la mano sobre el glúteo','Antes de usar la pelota, caliéntate solo con la mano. De pie, pon la palma abierta y plana sobre el glúteo del lado que vas a trabajar, en la parte más redonda y carnosa. Ojo: es sobre el glúteo, no sobre la cadera ni la cintura; baja la mano hasta sentir la parte gruesa del músculo. Desliza suave por todo el glúteo, de arriba hacia abajo y de lado a lado, varias veces. Así el músculo se calienta y la pelota duele menos.')
) as v(n, o, t, d)
where p.nivel_id = v.n and p.orden = v.o;
