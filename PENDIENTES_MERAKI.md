# Pendientes de Meraki App (anotado el 3 de noviembre de 2026)

## Regla para cuidar los créditos
- **Textos de pasos (base de datos Supabase):** se cambian al instante y NO gastan créditos de Netlify.
- **Código y fotos nuevas:** cada publicación gasta 15 créditos de Netlify. Se juntan en **un solo lote** y se publican una vez.
- Netlify: quedan unos 125 de 300. Se renuevan el **10 de noviembre**. No publicar nada hasta que Nicol publique (4 de noviembre), salvo urgencia.
- Fotos con IA (Higgsfield): solo con una foto real de Mary como guía, 1 prueba y revisión antes de mostrar. Nunca para ubicar anatomía sin referencia.

## Piriforme
- [x] Textos de los 5 niveles en palabras sencillas, con balanceo, silla o piso, y "solo con pelota".
- [x] Nivel 1 y 2: collage del punto del centro (pierna cruzada y sin cruzar) y foto de la posición.
- [x] Nivel 3: foto del punto de arriba y texto (cruzar la pierna que NO duele, pelota debajo de la que sí duele, dejarse caer un poco hacia atrás). Mary debe revisar que foto y texto coincidan.
- [x] Niveles 2, 4 y 5 con textos distintos (3 de noviembre): 2 = pulsos; 4 = punto de abajo con las dos piernas abajo, abriendo y cerrando las rodillas (idea de Mary); 5 = los 3 puntos y recorrido final rodando la pelota (idea de Claude, Mary debe validarla como masoterapeuta).
- [x] Estructura de niveles según la técnica de Mary (3 de noviembre): Nivel 1 "Soltar" = calentar con la mano, mover la pelota con POCO peso, luego dejar caer un poco más de peso y quedarse quieta en el punto de más tensión. Nivel 2 "Profundizar" = todo el peso desde el inicio, presiona y suelta, y quieta en el punto exacto con más precisión. Niveles 3 a 5 ya son distintos (punto de arriba / punto de abajo con rodillas / recorrido).
- [ ] **Efecto "wow" visual (lote después del 10 de nov):** que cada nivel se vea distinto, no solo se lea. Plan: etiqueta de nivel en cada foto ("NIVEL 1 · POCO PESO", "NIVEL 2 · TODO EL PESO"), flechas dibujadas por código (gratis) que muestren el movimiento (mover la pelota, presiona y suelta, abrir y cerrar rodillas) y una foto real de Mary como guía para las fotos nuevas de cada nivel.
- [ ] Nivel 4: sin foto (abrir y cerrar las rodillas con la pelota en el punto de abajo). Hacerla en el lote de después del 10 de noviembre, con una foto real de Mary como guía.
- [ ] En `js/zonas.js` (código, va en el lote) quitar la palabra "pulsos" de los títulos de nivel (lumbar, mandíbula, mano y piriforme): cambiarla por "presionando y soltando". Los pasos en la base de datos ya no la tienen.
- [ ] Cambiar los títulos de los niveles en `js/zonas.js` (código, va en el lote): nivel 4 = "Punto de abajo, abriendo las piernas"; nivel 5 = "Rutina completa (3 puntos y recorrido)".
- [ ] Foto del calentamiento con la mano sobre el glúteo (Mary la toma con el celular; la IA no la hizo bien y el filtro la bloqueó).
- [ ] Video corto de Mary (30 s) del piriforme con la pelota, subido a YouTube "no listado", con botón "Ver cómo se hace".

## Lote listo para publicar (preparado el 3 de noviembre, NO publicado todavía; una sola actualización)
- 10 imágenes del piriforme con etiqueta y flechas (niveles 1 a 5) + `FOTOS_PASOS` en `js/zonas.js`.
- Títulos de nivel del piriforme y quitar "pulsos" de los títulos de lumbar, mandíbula y mano.
- `js/zona.js`: se oculta la tarjeta genérica de técnica en el piriforme (decía "yemas de los dedos" y "repite el recorrido", que contradecía la técnica con pelota) y se agrega una línea que explica que cada nivel se desbloquea con los días.
- `js/diagramas.js`: "Calienta..." se reconoce como calentamiento.
- `automasaje.html` y `seguridad.html`: ya no dicen "todas las técnicas son con las manos" (el piriforme es solo con pelota).
- Decisiones de Mary pendientes: acortar el cuestionario (14 pantallas), y el link "¿Olvidaste tu contraseña?".

## Lanzamiento
- [ ] Compra de prueba del plan de 1 mes ($24.900) con el mismo correo del registro; luego revisar en Supabase que quedó premium y que cuenta el cupo.
- [ ] Mary ya dio acceso premium a Nicol (no hace falta su correo).
- [ ] Nicol publica en Facebook alrededor del 4 de noviembre. Guion en el estilo de ella (reto con la mamá y Mariana, tema del piramidal). Pendiente confirmar guion final y mensaje.
- [ ] Hotmart: las ofertas viejas (Plan 3 meses US$12,99 y Plan 1 semana US$3,49) siguen activas; solo se pueden eliminar a mano.
- [ ] Subir precios cuando se vendan los 100 cupos o después del 15 de noviembre (en Hotmart y en `planes.html`).
- [ ] Sello "Powered by Netlify": probablemente se quita con el plan de US$9; decidir el día que Nicol publique viendo los créditos.

## Mejoras para después del lanzamiento
- [ ] Fotos por paso en los otros 7 masajes en pareja y en los estiramientos (hoy tienen una sola foto fija).
- [ ] Revisar en celular cómo se ven los textos nuevos de todas las zonas.
