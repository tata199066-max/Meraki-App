-- Piriforme nivel 3 (punto de arriba, hacia la espalda baja): se cruza la pierna
-- que NO duele y la pelota va debajo de la pierna que SÍ duele (la que queda
-- apoyada en el piso). Es al revés que en el nivel 1.

update public.pasos_zona p set titulo = v.t, detalle = v.d
from (values
(43,2,'Cruza la pierna que no te duele y sube la pelota','Ojo: aquí es al revés que en el nivel 1. En esta técnica cruzas la pierna que NO te duele: pon su tobillo sobre la rodilla de la otra pierna. Debajo de la pierna que sí te duele, la que queda apoyada en el piso, pones la pelota. Desde el punto del centro, súbela un poco hacia la espalda baja, cerca del hueso plano que sientes al final de la columna. Si sientes que la molestia baja hacia la pierna, mueve la pelota un poquito de lugar o baja la presión.'),
(43,3,'Presiona con calma y balancéate','Deja caer el peso con calma sobre la pelota en ese punto. Haz un pequeño balanceo, muy despacio, unos centímetros hacia adelante y hacia atrás, para que el músculo se suelte. Aguanta respirando profundo y suelta despacio.')
) as v(n, o, t, d)
where p.nivel_id = v.n and p.orden = v.o;
