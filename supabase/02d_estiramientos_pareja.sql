insert into public.estiramientos (id, nombre, premium, grupo, imagen, contraindicacion, orden) values
('cuello_hombros_est','Cuello y hombros',false,'general','images/est-cuello-hombros.png','Evita si sientes mareo o vértigo al mover el cuello, o dolor que se dispara hacia el brazo.',1),
('espalda_alta_est','Espalda alta — torsión suave',true,'general','images/est-espalda-alta.png','Evita si tienes una lesión reciente en la columna o dolor agudo al girar el torso.',2),
('isquiotibiales_est','Parte de atrás del muslo',true,'piernas','images/est-isquiotibiales.png','Evita si tienes una lesión muscular reciente en esa zona o dolor agudo tipo punzada.',3),
('cadera_est','Cadera — figura 4 sentado',true,'general','images/est-cadera.png','Evita si tienes una cirugía reciente de cadera o dolor agudo al cruzar la pierna.',4),
('pecho_est','Pecho — marco de puerta',true,'general','images/est-pecho.png','Evita si tienes una lesión reciente de hombro.',5),
('pantorrilla_est','Pantorrilla contra la pared',true,'piernas','images/est-pantorrilla.png','Evita si tienes hinchazón marcada o dolor que no calza con cansancio normal en la pantorrilla.',6);

insert into public.pasos_estiramiento (estiramiento_id, orden, titulo, detalle, segundos) values
('cuello_hombros_est',1,'Inclinación lateral','Sentado o de pie, inclina la cabeza hacia un hombro sin subirlo, sostén suave.',20),
('cuello_hombros_est',2,'Inclinación al otro lado','Repite hacia el hombro contrario.',20),
('cuello_hombros_est',3,'Rotación de hombros','Eleva ambos hombros hacia las orejas y suéltalos hacia atrás en círculos lentos.',20),
('espalda_alta_est',1,'Torsión hacia un lado','Sentado, cruza los brazos frente al pecho y gira el torso hacia un lado, sosteniendo la postura.',25),
('espalda_alta_est',2,'Torsión al otro lado','Repite hacia el lado contrario.',25),
('isquiotibiales_est',1,'Estiramiento de una pierna','Sentado en el borde de una silla, estira una pierna con el talón apoyado en el piso e inclina el torso levemente hacia adelante.',25),
('isquiotibiales_est',2,'Cambia de pierna','Repite con la otra pierna.',25),
('cadera_est',1,'Cruce de pierna','Sentado, cruza el tobillo sobre la rodilla contraria e inclina el torso levemente hacia adelante.',30),
('cadera_est',2,'Cambia de lado','Repite del otro lado.',30),
('pecho_est',1,'Apoyo en el marco','De pie, apoya el antebrazo en el marco de una puerta y gira suavemente el cuerpo hacia el lado contrario.',25),
('pecho_est',2,'Cambia de brazo','Repite con el otro brazo.',25),
('pantorrilla_est',1,'Estiramiento de pantorrilla','De pie frente a la pared, un pie atrás con el talón apoyado en el piso, inclínate hacia la pared.',30),
('pantorrilla_est',2,'Cambia de pierna','Repite con la otra pierna.',30);

insert into public.masajes_pareja (id, nombre, nivel, premium, tiempo, imagen, postura_recibe, postura_da, presion, nota_consentimiento, detalle, orden) values
('cuello_hombros_pareja','Cuello y hombros','Básico',false,'10 minutos','images/pareja-cuello-hombros.png','Sentada en una silla o en el piso, con la espalda relajada y los hombros sueltos.','De pie o de rodillas detrás de quien recibe, con ambas manos libres para trabajar el cuello y los hombros.','Firme pero cómoda — pregunta siempre "¿así está bien?" antes de subir la intensidad.',null,null,1),
('espalda_alta_pareja','Espalda alta / escápulas','Básico',true,'10 minutos','images/pareja-espalda-alta.png','Boca abajo en la cama o sentada inclinada hacia adelante, apoyada en una almohada.','De pie a un lado, o a horcajadas si es en la cama, con acceso cómodo a ambos omóplatos.','Media, en círculos amplios sobre los omóplatos, nunca directo sobre el hueso.',null,null,2),
('espalda_baja_pareja','Espalda baja / lumbar','Intermedio',true,'10-12 minutos','images/pareja-espalda-baja.png','Boca abajo, con una almohada bajo el abdomen para aplanar la zona lumbar.','De rodillas a un lado, usando el peso del cuerpo en vez de solo la fuerza del brazo.','Suave a media, siempre a los lados de la columna, nunca sobre ella.',null,null,3),
('piernas_pareja','Piernas cansadas','Básico',true,'8-10 minutos','images/pareja-piernas.png','Acostada boca arriba, con las piernas apoyadas sobre las piernas de quien da.','Sentada, con las piernas de la otra persona apoyadas de forma cómoda y estable.','Deslizamiento firme desde el tobillo hacia la rodilla, siempre hacia arriba (ayuda a la circulación de retorno).',null,null,4),
('pies_pareja','Pies','Básico',true,'8-10 minutos','images/pareja-pies.png','Sentada o acostada, con el pie apoyado sobre las piernas de quien da.','Sentada frente a quien recibe, sosteniendo el pie con ambas manos.','Firme con los pulgares, desde el talón hacia los dedos.',null,null,5),
('manos_pareja','Manos y antebrazos','Básico',true,'8 minutos','images/pareja-manos.png','Sentada, con el brazo apoyado y relajado sobre una mesa o sobre las piernas de quien da.','Sentada frente a quien recibe, sosteniendo la mano y el antebrazo con ambas manos.','Suave a media, en círculos desde la muñeca hacia el codo, y en la palma hacia los dedos.',null,null,6),
('gluteo_cadera_pareja','Glúteo / cadera','Intermedio',true,'10 minutos','images/pareja-gluteo-cadera.png','Boca abajo, cómoda, habiendo hablado antes con claridad sobre qué zonas está bien tocar.','De rodillas a un lado, con las manos siempre visibles y los movimientos anunciados en voz alta.','Suave a media, con los nudillos o la palma, deteniéndose de inmediato si la otra persona lo pide.','Esta técnica requiere consentimiento explícito y comunicación constante durante toda la sesión: pregunta antes de empezar y detente en cualquier momento si te lo piden.',null,7),
('rutina_completa_pareja','Rutina completa','Avanzado',true,'20 minutos','images/pareja-rutina-completa.png','Boca abajo para la primera mitad (espalda, glúteo, piernas) y boca arriba para la segunda (pies, manos, cuello).','Alternando posición según la zona, siguiendo el mismo orden que en las técnicas individuales.','La misma recomendada en cada técnica individual — ir de más suave a más firme conforme avanza la sesión.',null,'Encadena, en este orden, las técnicas de: espalda alta, espalda baja, glúteo/cadera, piernas, pies, manos y cuello/hombros.',8);
