# MERAKI APP — Brief completo para Claude Code

## 0. Contexto

Este proyecto se intentó primero en Lovable (una herramienta sin código), pero al estar en plan gratis no se puede exportar ese código. Este documento reemplaza esa ruta: es la especificación completa para construir Meraki App desde cero, con código real, usando Claude Code.

Meraki App es una guía de bienestar con técnicas de automasaje. NO es una app de fisioterapia ni reemplaza tratamiento médico.

## 1. Stack técnico (decisión ya tomada, no hace falta discutirla)

- **Frontend:** React + Vite + TypeScript + Tailwind CSS.
- **Backend/base de datos/autenticación:** Supabase.
- **Hosting:** Vercel (plan gratis).

Elegí este stack porque es estándar, económico (todo con capa gratis para empezar) y es el mismo tipo de stack que Lovable habría generado — así que si en el futuro se quiere pasar algo de vuelta a una herramienta sin código, es compatible.

### Lo único que TÚ debes preparar antes de que Claude Code empiece a conectar el backend:
1. Crea una cuenta gratis en supabase.com.
2. Crea un proyecto nuevo ahí (te va a pedir un nombre — puedes poner "meraki-app" — y una contraseña de base de datos, guárdala).
3. Cuando el proyecto esté listo, entra a Project Settings → API, y copia dos datos: "Project URL" y la llave "anon public". Esos dos datos se los das a Claude Code cuando te los pida para conectar el proyecto.

No necesitas saber qué significan esos datos — son como la dirección y la llave de la "cocina" de tu app (ver la explicación que ya te di sobre Supabase). Claude Code se encarga de todo lo demás.

## 2. Identidad visual

Paleta de marca (usar en toda la app, nunca colores médicos fríos tipo azul/rojo de clínica):
- Verde suave: `#8BA886` (color principal — botones, resaltados)
- Beige: `#E8E0D5` (fondos, superficies neutras)
- Lavanda: `#D8D3E3` (acentos suaves, tarjetas premium)
- Negro: `#1A1A1A` (texto principal, contornos)
- Dorado: `#C9A85C` (acento mínimo — ícono premium desbloqueado, calificación — nunca como fondo grande)

Tipografía: Fraunces (títulos) + Manrope (texto general).

Estilo general: cálido, natural, minimalista — no corporativo, no clínico, no genérico de spa.

## 3. Modelo de datos (tablas en Supabase)

Sugerencia de estructura — Claude Code puede ajustar nombres técnicos, pero debe conservar esta lógica:

- **usuarios**: id, email, nombre, edad, sexo, estatura, peso, ocupacion, rol ("usuario" | "admin"), estado_suscripcion ("gratis" | "activo" | "vencido"), fecha_registro.
- **respuestas_quiz**: usuario_id, y las respuestas a las 12 preguntas (ver sección 6).
- **zonas**: id, nombre, bloque, premium (boolean), porQue, datoClinico, evitarSi.
- **pasos_zona**: id, zona_id, titulo, detalle, segundos, orden.
- **masajes_pareja**: id, nombre, nivel, premium (boolean), postura_recibe, postura_da, tiempo, presion.
- **estiramientos**: id, nombre, premium (boolean), detalle, segundos.
- **progreso_usuario**: usuario_id, zona_id o masaje_id, completado_en, nota_personal.
- **racha**: usuario_id, dias_seguidos, ultima_sesion.

## 4. Seguridad — REQUISITO NO NEGOCIABLE

Esto es lo más importante de todo el proyecto, léelo con cuidado:

**El problema que hay que evitar:** si el contenido premium (los "pasos" de cada zona) se manda igual al navegador del usuario y solo se "esconde" visualmente cuando no pagó, cualquier persona con conocimientos básicos puede abrir las herramientas de desarrollador del navegador y leer el contenido completo sin pagar.

**La solución obligatoria — configurar Row Level Security (RLS) en Supabase:**
- En la tabla `pasos_zona`, crear una política de RLS que solo permita el `SELECT` de esos datos si: la zona correspondiente tiene `premium = false`, O el usuario autenticado tiene `estado_suscripcion = 'activo'` en la tabla `usuarios`, O el usuario autenticado tiene `rol = 'admin'`.
- Lo mismo para `masajes_pareja` y `estiramientos`: el campo `premium` se ignora si el usuario tiene `rol = 'admin'`.
- Si el usuario no cumple ninguna condición, la consulta a la base de datos debe devolver vacío para esos campos — el frontend nunca debe recibir los pasos completos y luego decidir ocultarlos. La restricción vive en la base de datos, no en React.
- Para el panel de administrador: acceso solo si `usuarios.rol = 'admin'`, verificado también con una política de RLS del lado de Supabase, nunca comparando el correo en el código del frontend.

**Nota importante:** el rol "admin" cumple DOS funciones — ver el panel de administrador Y tener acceso completo a todo el contenido premium sin pagar (para que Mary, como creadora, pueda revisar y probar la app completa). Estas dos funciones deben ir juntas en la misma condición de la política de RLS, no por separado.

**Cómo Mary entra a su propia app sin pagar:** ella sí necesita crear una cuenta (registrarse con su correo y una contraseña), como cualquier usuario — eso es normal, es cómo el sistema sabe quién es quién. La diferencia es que, una vez registrada, hay que entrar a la tabla `usuarios` en Supabase y cambiar manualmente su fila para que diga `rol = 'admin'`. Después de eso, su cuenta ve todo sin que le pida suscripción.

**Cómo confirmar que quedó bien hecho (pídeselo a Claude Code explícitamente):** "Muéstrame la política de RLS de la tabla pasos_zona y explícame en una frase simple cómo evita que alguien sin suscripción la vea." Si la respuesta no menciona una política de base de datos (RLS), no está resuelto.

## 5. Pantallas de la app

**Requisito de navegación obligatorio para TODAS las pantallas (excepto Inicio):** cada pantalla debe tener un botón de "atrás" visible (flecha arriba a la izquierda, estilo estándar de apps) que regrese a la pantalla anterior dentro de la app — nunca debe cerrar la app ni sacar al usuario a otra página. Sin este botón, cualquier persona que toque una zona o una sección por error queda "atrapada" y probablemente cierra la app en vez de encontrar cómo volver.

1. **Bienvenida:** mensaje breve — Meraki App es una guía de bienestar, NO fisioterapia ni tratamiento médico; si hay lesión o duda de salud, consultar a un profesional primero.
2. **Registro/login:** correo y contraseña real (usando Supabase Auth).
3. **Quiz de ingreso** (12 preguntas, ver sección 6), termina con checkbox de consentimiento obligatorio.
4. **Inicio:** recomendación del día según el quiz, racha de días seguidos (sin presión agresiva).
5. **Automasaje:** las 15 zonas organizadas en 5 bloques (ver sección 8), cada una marcada como Gratis o Premium.
6. **Detalle de zona:** pasos con temporizador (uno por uno) + 3 tarjetas siempre visibles ("Por qué se tensiona", "Dato clínico", "Cuándo evitarla" — visibles incluso si la zona es premium, porque son información de seguridad, no el producto que se vende). Si es premium y sin suscripción: mostrar "Esta zona es Premium, suscríbete para desbloquearla" en vez de los pasos.
7. **Estiramientos rápidos:** el primero gratis, el resto premium.
8. **Masajes en pareja:** 8 masajes (ver sección 9), el primero gratis, el resto premium.
9. **Mi progreso:** zonas completadas, racha, notas personales.
10. **Seguridad y contraindicaciones:** SIEMPRE gratis y accesible desde el menú (ver sección 7).
11. **Panel de administrador:** solo visible con rol admin — lista de usuarios, estado (Activo/Vencido/Gratis), ingresos.

## 6. Quiz de ingreso (12 preguntas exactas)

1. Edad (número).
2. Sexo: Hombre / Mujer / Prefiero no decirlo.
3. Estatura y peso (opcional).
4. ¿A qué te dedicas / cómo pasas la mayor parte del día?: Sentado en oficina/computadora · De pie muchas horas · Cargando peso o esfuerzo físico · Conduciendo mucho tiempo · Combinación de varias · Otro.
5. ¿Dónde sientes más tensión o dolor hoy? (selección múltiple con mapa del cuerpo).
6. ¿Hace cuánto tienes esta molestia?: Menos de una semana / Unas semanas / Meses / Es algo recurrente de siempre.
7. En una escala de 1 a 10, ¿qué tan fuerte es la molestia que tienes? (si 8-10: aviso "un dolor muy intenso puede necesitar evaluación profesional antes de un automasaje").
8. ¿Alguna vez un profesional de salud te diagnosticó algo relacionado con este dolor?: Sí (especificar) / No / No estoy seguro.
9. ¿Tienes alguna de estas condiciones? (selección múltiple): Hipertensión / Diabetes / Problemas de coagulación o anticoagulantes / Embarazo / Cáncer o en tratamiento oncológico / Problemas circulatorios (varices, trombosis) / Osteoporosis / Gripe, resfriado o fiebre actual / Infección de piel activa / Alergias de piel activas / Ninguna de las anteriores.
10. Si marcaste alguna condición: ¿está controlada con tratamiento médico? Sí, controlada / No, o no estoy seguro.
11. ¿Prefieres rutinas cortas (5 min) o sesiones más largas (15-20 min)?
12. ¿Con qué frecuencia te gustaría practicar? Todos los días / Día por medio / Cuando sienta molestia.

Checkbox de cierre obligatorio: "Entiendo que Meraki App ofrece técnicas de automasaje y bienestar, y que no reemplaza una consulta médica, fisioterapia ni ningún tratamiento profesional. Acepto usar la app bajo mi propia responsabilidad y sé que debo detenerme y consultar a un profesional si algo no se siente bien."

## 7. Contraindicaciones generales (sección Seguridad, siempre gratis)

**No recomendado / consultar primero:** hipertensión no controlada o severa; diabetes con pérdida de sensibilidad; problemas de coagulación o anticoagulantes; embarazo de riesgo o primer trimestre (evitar abdomen y zona lumbar-pélvica); cáncer o tratamiento oncológico activo; trombosis venosa profunda, flebitis o varices avanzadas; osteoporosis activa; heridas abiertas, quemaduras, infecciones de piel o inflamación aguda; gripe, resfriado o fiebre; infecciones activas (herpes, verrugas virales, respiratorias); alergias a productos usados o piel reactiva; cirugía reciente en la zona; fracturas no consolidadas.

**Con precaución:** hipertensión controlada; diabetes controlada sin pérdida de sensibilidad; hipotiroidismo/hipertiroidismo en tratamiento; hernia discal diagnosticada; fragilidad capilar o tendencia a moretones.

**Detener de inmediato y consultar a un profesional si aparece:** dolor que se dispara hacia brazo o pierna; hormigueo, adormecimiento o "corrientazos"; mareo, náuseas o mucho malestar; dolor que empeora en vez de aliviar.

**Regla de identidad profesional — IMPORTANTE:** Mary es masoterapeuta y su diferencial es que nunca usa aparatología, solo sus manos. Todas las técnicas de la app deben mostrar la técnica manual (dedos, palma, puño, nudillos) como protagonista. Herramientas como la pelota de tenis solo pueden aparecer como una mención opcional adicional al final de un paso (ej. "también puedes ayudarte con una pelota de tenis si prefieres"), nunca como la técnica principal descrita en los pasos numerados.

**Regla de calentamiento obligatoria:** nunca empezar directo con presión sobre el punto de tensión. Siempre calentar primero la zona con movimientos suaves y superficiales de deslizamiento (sin presionar fuerte) durante 15-20 segundos, y solo después avanzar a la presión focal sobre el punto exacto. Esto prepara el tejido, reduce el dolor durante la técnica y la hace más efectiva. Esta regla ya está incorporada como primer paso en cada una de las 15 zonas.

**Regla de oro de la presión:** debe sentirse como "duele bien" — nunca un dolor agudo o que se dispara hacia otra parte del cuerpo. Nunca presionar directo sobre la columna, un hueso inflamado o una articulación hinchada. La constancia es mejor que la intensidad.

## 8. Las 15 zonas (contenido exacto — no inventar ni resumir)

**Modelo freemium:** Gratis = Trapecio, Lumbar, Glúteo/Piriforme, Pantorrillas, Antebrazo. Las otras 10 = Premium.

### BLOQUE 1 — Cuello y cabeza

**Trapecio — GRATIS**
porQue: "Pasar horas con la cabeza inclinada hacia adelante (celular, computadora) o con los hombros subidos por estrés satura este músculo, que va desde el cráneo hasta la mitad de la espalda. También es la zona clásica donde \"guardamos\" el estrés: el insomnio, la ansiedad o una época difícil pueden tensarla tanto como una mala postura."
datoClinico: "Es uno de los músculos que más se contractura en el cuerpo, y su punto de tensión puede generar dolor de cabeza de tipo tensional que sube desde el cuello hacia la sien."
evitarSi: "Hinchazón marcada, calor o enrojecimiento en la zona; dolor que baja disparado hacia el brazo."
pasos: [{titulo: "Calentamiento", detalle: "Antes de buscar el punto exacto, desliza suavemente sobre toda la zona (con la mano, la pelota o el rodillo, según lo que estés usando) en movimientos largos y livianos, sin presionar fuerte todavía — esto prepara el tejido y hace la técnica siguiente más efectiva y menos molesta.", segundos: 20}, {titulo: "Ubicar el punto", detalle: "Sentado, con los brazos relajados, coloca las yemas de los dedos entre el cuello y el hombro.", segundos: 20}, {titulo: "Presión en círculos", detalle: "Presiona firme, en círculos pequeños, sobre el punto más tenso.", segundos: 30}, {titulo: "Estiramiento de cierre", detalle: "Lleva la oreja hacia el hombro (sin subir el hombro) y sostén.", segundos: 20}]

**Suboccipital / Nuca — Premium**
porQue: "Son músculos pequeños que sostienen la cabeza en posiciones finas. Mirar el celular hacia abajo o el estrés los acorta y tensiona. El estrés sostenido y la falta de sueño también los contraen, incluso sin una causa postural clara — muchas cefaleas tensionales aparecen así."
datoClinico: "Generan un patrón de dolor referido muy característico: empieza en la nuca y sube hacia la frente o las sienes, muy similar a una cefalea tensional."
evitarSi: "Mareo al presionar, dolor que se dispara con la presión, cualquier golpe reciente en la zona."
pasos: [{titulo: "Calentamiento", detalle: "Con las yemas de los dedos, desliza suavemente por toda la nuca en movimientos largos y livianos, sin presionar fuerte todavía.", segundos: 20}, {titulo: "Ubicar el borde óseo", detalle: "Busca con los dedos el borde justo donde termina el cráneo y empieza el cuello, a los costados de la columna.", segundos: 20}, {titulo: "Presión sostenida con los dedos", detalle: "Presiona sosteniendo con las yemas de los dedos, moviendo la cabeza suavemente en 'sí' y 'no' para encontrar el punto exacto.", segundos: 60}, {titulo: "Cierre con las palmas", detalle: "Con las palmas de ambas manos, envuelve la base del cráneo y sostén una presión suave y constante, como un pequeño abrazo.", segundos: 20}]

**Cuero cabelludo / sien (temporal) — Premium**
porQue: "El músculo temporal, en el costado de la cabeza, ayuda a cerrar la mandíbula. Se sobrecarga por apretar los dientes o por tensión general del estrés."
datoClinico: "Los dolores de cabeza tipo 'banda de presión' en el costado de la cabeza suelen originarse en el temporal, no en el cuero cabelludo como tal."
evitarSi: "Heridas o infecciones en el cuero cabelludo, dolor de cabeza súbito y muy intenso (requiere evaluación médica)."
pasos: [{titulo: "Calentamiento", detalle: "Antes de buscar el punto exacto, desliza suavemente sobre toda la zona (con la mano, la pelota o el rodillo, según lo que estés usando) en movimientos largos y livianos, sin presionar fuerte todavía — esto prepara el tejido y hace la técnica siguiente más efectiva y menos molesta.", segundos: 20}, {titulo: "Ubicar el músculo temporal", detalle: "Coloca las yemas de los dedos por encima de la oreja, en la sien.", segundos: 15}, {titulo: "Círculos lentos", detalle: "Presión circular lenta desde la línea del cabello hacia adelante, hasta la esquina externa del ojo.", segundos: 60}, {titulo: "Combinar con mandíbula", detalle: "Este trabajo es más efectivo si se combina con el automasaje de mandíbula.", segundos: 30}]

**Mandíbula (ATM / masetero) — Premium**
porQue: "El estrés y el bruxismo (apretar o rechinar los dientes) sobrecargan el masetero, el músculo principal para cerrar la mandíbula. El bruxismo casi siempre tiene una raíz emocional: ansiedad, estrés acumulado o una etapa de mucha exigencia personal."
datoClinico: "El automasaje no alcanza los músculos más profundos de la mandíbula, por eso si hay chasquidos, bloqueos o dolor fuerte al abrir la boca, se necesita evaluación profesional."
evitarSi: "Chasquidos o bloqueo al abrir la boca, dolor dental agudo, cirugía dental reciente."
pasos: [{titulo: "Calentamiento", detalle: "Antes de buscar el punto exacto, desliza suavemente sobre toda la zona (con la mano, la pelota o el rodillo, según lo que estés usando) en movimientos largos y livianos, sin presionar fuerte todavía — esto prepara el tejido y hace la técnica siguiente más efectiva y menos molesta.", segundos: 20}, {titulo: "Ubicar el masetero", detalle: "Coloca los dedos delante de las orejas, donde sientes movimiento al apretar los dientes.", segundos: 15}, {titulo: "Presión circular", detalle: "Círculos suaves y controlados sobre el masetero.", segundos: 60}, {titulo: "Zona baja de la mandíbula", detalle: "Con la boca relajada, presiona suavemente con el pulgar debajo del hueso de la mandíbula.", segundos: 30}]

### BLOQUE 2 — Espalda

**Hombro (deltoides) — Premium**
porQue: "Los deltoides rodean la articulación del hombro y se sobrecargan al cargar peso o mantener los brazos elevados mucho tiempo."
datoClinico: "Trabajar el deltoides de forma longitudinal y lento reduce la hiperactividad muscular y calma las señales de dolor."
evitarSi: "Hombro congelado diagnosticado, luxación reciente, dolor agudo al levantar el brazo."
pasos: [{titulo: "Calentamiento", detalle: "Antes de buscar el punto exacto, desliza suavemente sobre toda la zona (con la mano, la pelota o el rodillo, según lo que estés usando) en movimientos largos y livianos, sin presionar fuerte todavía — esto prepara el tejido y hace la técnica siguiente más efectiva y menos molesta.", segundos: 20}, {titulo: "Ubicar el músculo", detalle: "Con la otra mano o una pelota, ubica la parte externa del hombro.", segundos: 20}, {titulo: "Presión lenta y profunda", detalle: "Desliza lento a lo largo de las fibras, de arriba hacia abajo.", segundos: 90}, {titulo: "Estiramiento de cierre", detalle: "Lleva el brazo cruzado hacia el pecho, suave.", segundos: 20}]

**Omóplatos (romboides / escápula) — Premium**
porQue: "Es la zona típica de 'cargar la mochila del estrés' — se tensiona por mantener los hombros hacia adelante frente a la computadora."
datoClinico: "Trabajar esta zona con las manos ayuda a liberar también estructuras cercanas al manguito rotador, mejorando la movilidad del hombro."
evitarSi: "Nunca presionar directo sobre el borde óseo de la escápula, solo sobre el músculo."
pasos: [{titulo: "Calentamiento", detalle: "Con la palma de la mano contraria, desliza suavemente sobre el omóplato en movimientos largos, sin presionar fuerte todavía.", segundos: 20}, {titulo: "Ubicar con los dedos", detalle: "Lleva la mano contraria por encima del hombro o rodeando el costado, y busca con los dedos el borde interno del omóplato.", segundos: 20}, {titulo: "Presión con los dedos", detalle: "Presiona con las yemas de los dedos en círculos pequeños sobre el punto más tenso.", segundos: 45}, {titulo: "Estiramiento de cierre", detalle: "Lleva ese brazo cruzado hacia el pecho, sostenido con la otra mano, para estirar suavemente la zona.", segundos: 20}]

**Dorsal / zona alta de la espalda — Premium**
porQue: "Las horas de mala postura frente a la pantalla cargan esta zona ancha de la espalda, que conecta el hombro con la zona lumbar."
datoClinico: "El automasaje de esta zona alcanza el redondo mayor y el dorsal ancho — trabajar despacio y profundo con los nudillos da mayor beneficio que un pase rápido."
evitarSi: "Dolor agudo tipo 'punzada' al respirar hondo (puede ser otra causa, no muscular)."
pasos: [{titulo: "Calentamiento", detalle: "Con la palma de la mano, desliza suavemente sobre la zona en movimientos largos, sin presionar fuerte todavía.", segundos: 20}, {titulo: "Posición", detalle: "Acostado boca arriba o sentada, lleva la mano por encima del hombro contrario hacia la zona alta de la espalda.", segundos: 15}, {titulo: "Presión con los nudillos", detalle: "Con los nudillos o las yemas de los dedos, presiona en círculos pequeños buscando el punto más tenso.", segundos: 45}, {titulo: "Sostener", detalle: "Mantén la presión con los dedos, respirando lento.", segundos: 30}]

**Lumbar (incluye cuadrado lumbar) — GRATIS**
porQue: "Es de las zonas que más carga acumula por estar sentado muchas horas o cargar peso con mala postura. El cuadrado lumbar es el músculo detrás del típico 'dolor de riñones'. La tensión emocional sostenida (preocupación constante, ansiedad) también se acumula aquí, incluso sin haber cargado peso ni pasado horas sentada."
datoClinico: "El automasaje lumbar se trabaja siempre a los lados de la columna (nunca sobre ella), con movimientos lentos, entre 3 y 6 minutos por lado."
evitarSi: "Dolor que baja como un rayo hacia la pierna (posible compromiso del nervio ciático) — ahí no se automasajea, se consulta primero."
pasos: [{titulo: "Calentamiento", detalle: "Con las palmas de ambas manos, desliza suavemente sobre la zona lumbar en movimientos largos, sin presionar fuerte todavía.", segundos: 20}, {titulo: "Posición inicial", detalle: "Acostada boca arriba, rodillas flexionadas, pies apoyados en el piso.", segundos: 15}, {titulo: "Formar los puños", detalle: "Cierra ambas manos en puño, con los nudillos hacia arriba, y colócalos debajo de la zona lumbar, uno a cada lado de la columna.", segundos: 20}, {titulo: "Dejar caer el peso", detalle: "Deja caer suavemente el peso de tu cuerpo sobre los puños y sostén la presión respirando hondo.", segundos: 90}]

### BLOQUE 3 — Cadera y glúteo

**Glúteo / Piriforme — GRATIS**
porQue: "El piriforme es un músculo pequeño y profundo del glúteo. Al contracturarse, puede atrapar el nervio ciático."
datoClinico: "Genera un patrón de dolor referido hacia la pierna muy parecido al de una hernia discal, sin serlo — se le conoce como 'falsa ciática'."
evitarSi: "Dolor punzante y agudo al presionar (bajar la intensidad de inmediato), hernia discal sin autorización médica."
pasos: [{titulo: "Calentamiento", detalle: "Con la palma de la mano, desliza suavemente sobre todo el glúteo en movimientos largos, sin presionar fuerte todavía.", segundos: 20}, {titulo: "Posición", detalle: "Sentada, cruza el tobillo de la pierna a trabajar sobre la rodilla contraria, dejando el glúteo más accesible.", segundos: 15}, {titulo: "Presión con el puño", detalle: "Cierra la mano en puño y presiona con los nudillos en el centro del glúteo, buscando el punto más sensible.", segundos: 45}, {titulo: "Sostener", detalle: "Mantén la presión con el puño y respira hondo hasta sentir que afloja.", segundos: 30}]

### BLOQUE 4 — Piernas y pies

**Pantorrillas — GRATIS**
porQue: "Estar mucho tiempo de pie o sentado hace que la circulación de retorno trabaje peor, y la pantorrilla es el músculo que más ayuda a bombear la sangre de vuelta al corazón."
datoClinico: "Por esta función de bombeo se le conoce como 'el segundo corazón' — trabajarla siempre en dirección ascendente ayuda a esa circulación de retorno."
evitarSi: "Hinchazón marcada de un solo lado, calor local o dolor que no calza con cansancio normal — puede ser un tema circulatorio."
pasos: [{titulo: "Calentamiento", detalle: "Antes de buscar el punto exacto, desliza suavemente sobre toda la zona (con la mano, la pelota o el rodillo, según lo que estés usando) en movimientos largos y livianos, sin presionar fuerte todavía — esto prepara el tejido y hace la técnica siguiente más efectiva y menos molesta.", segundos: 20}, {titulo: "Posición", detalle: "Sentado, con la pierna estirada.", segundos: 10}, {titulo: "Ordeñar hacia arriba", detalle: "Con ambas manos, desliza desde el tobillo hacia la rodilla, siempre hacia arriba.", segundos: 90}, {titulo: "Cierre en pared", detalle: "Eleva las piernas apoyadas en la pared, moviendo los pies suavemente.", segundos: 120}]

**Planta del pie — Premium**
porQue: "La fascia plantar sostiene el arco del pie y se sobrecarga por estar de pie muchas horas, calzado plano, o pantorrillas muy tensas."
datoClinico: "Combinar el trabajo de la planta del pie con automasaje en la pantorrilla mejora el resultado, porque están conectadas."
evitarSi: "Dolor agudo al primer paso de la mañana de forma repetida (trabajar con suavidad y consultar si no mejora)."
pasos: [{titulo: "Calentamiento", detalle: "Con las palmas de ambas manos, desliza suavemente por toda la planta del pie, sin presionar fuerte todavía.", segundos: 20}, {titulo: "Posición", detalle: "Sentada, cruza el pie a trabajar sobre la rodilla contraria para tener buen acceso.", segundos: 10}, {titulo: "Presión con los pulgares", detalle: "Con ambos pulgares, presiona en círculos pequeños desde el talón hacia los dedos.", segundos: 60}, {titulo: "Puntos sensibles", detalle: "Detente 20 a 30 segundos en los puntos más sensibles.", segundos: 30}]

### BLOQUE 5 — Brazo, antebrazo y mano

**Antebrazo (extensores y flexores) — GRATIS**
porQue: "El uso de mouse y teclado sobrecarga el lado de arriba del antebrazo (extensores); escribir y cargar cosas sobrecarga el lado de abajo (flexores)."
datoClinico: "Cuando se inflama la inserción en el codo, del lado extensor es 'codo de tenista' y del lado flexor es 'codo de golfista' — son distintas y no se tratan igual."
evitarSi: "Hormigueo, adormecimiento o 'corrientazo' hacia los dedos (posible nervio comprometido)."
pasos: [{titulo: "Calentamiento", detalle: "Antes de buscar el punto exacto, desliza suavemente sobre toda la zona (con la mano, la pelota o el rodillo, según lo que estés usando) en movimientos largos y livianos, sin presionar fuerte todavía — esto prepara el tejido y hace la técnica siguiente más efectiva y menos molesta.", segundos: 20}, {titulo: "Extensores", detalle: "Antebrazo apoyado en la mesa, palma hacia abajo, presión suave en círculos desde la muñeca hasta el codo.", segundos: 60}, {titulo: "Flexores", detalle: "Antebrazo sobre la mesa, palma hacia arriba, mismo círculo.", segundos: 60}, {titulo: "Estiramiento", detalle: "Brazo extendido, flexiona la muñeca hacia abajo y luego hacia arriba.", segundos: 30}]

**Mano y muñeca — Premium**
porQue: "El uso constante del celular y el teclado sobrecarga los músculos pequeños de la palma y los dedos."
datoClinico: "El hormigueo hacia pulgar/índice/medio puede indicar compromiso del nervio mediano en la muñeca — ahí no se automasajea, se consulta."
evitarSi: "Hormigueo o adormecimiento hacia los dedos, hinchazón marcada en la muñeca."
pasos: [{titulo: "Calentamiento", detalle: "Antes de buscar el punto exacto, desliza suavemente sobre toda la zona (con la mano, la pelota o el rodillo, según lo que estés usando) en movimientos largos y livianos, sin presionar fuerte todavía — esto prepara el tejido y hace la técnica siguiente más efectiva y menos molesta.", segundos: 20}, {titulo: "Palma", detalle: "Con el pulgar de la otra mano, círculos desde el centro de la palma hacia los dedos.", segundos: 90}, {titulo: "Entre los dedos", detalle: "Presión suave en la base de cada dedo.", segundos: 30}, {titulo: "Muñeca", detalle: "Círculos suaves alrededor de la muñeca.", segundos: 30}]

**Pectorales — Premium**
porQue: "Mantener los hombros hacia adelante frente a la pantalla tensiona y acorta este músculo."
datoClinico: "Está muy relacionado con el dolor de hombro y la postura general — trabajarlo ayuda también a mejorar dolores cervicales."
evitarSi: "Cualquier dolor en el pecho que no sea claramente muscular (opresión, falta de aire) requiere atención médica inmediata, no automasaje."
pasos: [{titulo: "Calentamiento", detalle: "Antes de buscar el punto exacto, desliza suavemente sobre toda la zona (con la mano, la pelota o el rodillo, según lo que estés usando) en movimientos largos y livianos, sin presionar fuerte todavía — esto prepara el tejido y hace la técnica siguiente más efectiva y menos molesta.", segundos: 20}, {titulo: "Posición", detalle: "Sentado o de pie, con la mano contraria al lado a masajear.", segundos: 10}, {titulo: "Amasar", detalle: "Desde el esternón hacia el costado, con amasamiento suave.", segundos: 60}, {titulo: "Estiramiento", detalle: "Apoya el antebrazo en una esquina o marco de puerta y rota el tronco hacia el lado contrario.", segundos: 20}]

**Abdomen — Premium**
porQue: "El estrés y estar sentado muchas horas afectan también el tránsito intestinal. Las emociones que se 'guardan' sin procesar —ansiedad, preocupación, tristeza— afectan directamente la digestión: es una de las zonas donde el cuerpo somatiza de forma más clara."
datoClinico: "El masaje abdominal es una herramienta real usada en fisioterapia para el estreñimiento, siguiendo el sentido del colon (como una 'C' invertida), con presión suave."
evitarSi: "Embarazo, dolor abdominal agudo, justo después de comer (esperar 1-2 horas), cualquier diagnóstico digestivo sin autorización médica."
pasos: [{titulo: "Calentamiento", detalle: "Antes de buscar el punto exacto, desliza suavemente sobre toda la zona (con la mano, la pelota o el rodillo, según lo que estés usando) en movimientos largos y livianos, sin presionar fuerte todavía — esto prepara el tejido y hace la técnica siguiente más efectiva y menos molesta.", segundos: 20}, {titulo: "Posición", detalle: "Acostado boca arriba, rodillas flexionadas, manos relajadas sobre el abdomen.", segundos: 15}, {titulo: "Movimiento circular", detalle: "Círculos suaves con las yemas de los dedos en sentido de las agujas del reloj.", segundos: 90}, {titulo: "Respiración", detalle: "Acompaña cada movimiento con una respiración profunda y lenta.", segundos: 30}]

## 9. Masajes en pareja

1. Cuello y hombros — básico (10 min) — GRATIS
2. Espalda alta / escápulas — básico — Premium
3. Espalda baja / lumbar — intermedio — Premium
4. Piernas cansadas — básico — Premium
5. Pies — básico — Premium
6. Manos y antebrazos — básico — Premium
7. Glúteo/cadera — intermedio (requiere indicaciones claras de consentimiento y límites de zona) — Premium
8. Rutina completa de 20 minutos — avanzado — Premium

Cada uno debe incluir postura de quien recibe, postura de quien da, tiempo, presión recomendada, y las contraindicaciones generales de la sección 7.

## 10. Imágenes de técnica: DIAGRAMAS ILUSTRADOS (código SVG, sin fotos de personas)

Cambio de decisión respecto a versiones anteriores: NO se van a usar fotos reales de Mary ni de nadie — todo se resuelve con ilustraciones hechas en código (SVG), reutilizables, sin fotografía.

Para cada zona, dos elementos:
1. **Mapa de ubicación:** silueta corporal completa simple (frontal o trasera según la zona), resaltando en verde suave (#8BA886) la zona exacta que se trabaja. Sin rasgos faciales, sin género marcado.
2. **Diagrama de técnica:** un acercamiento esquemático a la zona, con un ícono simple de mano/dedos (no realista, estilo plano) y una flecha indicando la dirección del movimiento (deslizar, presionar, circular). Estilo similar a los íconos de "monigote" simples usados en apps de fitness reconocidas (una figura de líneas simples, no anatomía detallada).

Ambos elementos van en los colores de marca (verde #8BA886, beige #E8E0D5, lavanda #D8D3E3, negro #1A1A1A para contornos), nunca colores médicos fríos.

Esto reemplaza cualquier necesidad de fotografía — Mary no tiene que fotografiarse ni conseguir un modelo. Todo se construye con código.

## 11. Sistema visual de progreso por niveles (agregar a Inicio y a cada zona)

Mostrar el progreso de cada zona como un camino de niveles con candado, similar a "Día 1 desbloqueado, Día 2 con candado, Semana 1" de apps de fitness conocidas:
- Un círculo o barra de progreso general (ej. "3/5 niveles completados en Trapecio").
- Cada nivel bloqueado se muestra con un ícono de candado hasta que se cumple el tiempo/condición de desbloqueo (día 1, 3, 7, 14, 21 como ya está definido).
- El nivel actual disponible muestra un botón "Comenzar", los completados un check ✅.

### Los 5 niveles profundizan en puntos anatómicos reales distintos, no repiten la misma técnica

Esto es importante: cada nivel de una zona no debe sentirse como "lo mismo otra vez" — debe trabajar un punto específico distinto dentro de esa misma zona general, con más profundidad a medida que sube el nivel. Esto es contenido real de masoterapia (puntos gatillo, no información inventada). Ejemplo completo con Trapecio, para replicar el mismo patrón en las demás zonas:

**TRAPECIO — desglose de niveles:**

- **Nivel 1 (Día 1) — Trapecio superior, punto básico:** el punto que ya está descrito (yemas de los dedos entre cuello y hombro). Este punto suele generar dolor referido hacia la sien o detrás del ojo — muy asociado a cefalea tensional.
- **Nivel 2 (Día 3) — Trapecio superior, borde lateral:** un poco más hacia el lado del cuello (cerca del borde del músculo), que suele referir dolor hacia la mandíbula y la oreja. Postura: "Sentada, inclina la cabeza levemente hacia el lado contrario al que vas a trabajar, para exponer mejor el borde del músculo."
- **Nivel 3 (Día 7) — Trapecio medio:** el punto entre los omóplatos, que suele generar una sensación de ardor en esa zona media de la espalda. Postura: "Sentada, lleva el brazo del lado a trabajar cruzado hacia el pecho, para separar el omóplato y exponer el trapecio medio."
- **Nivel 4 (Día 14, avanzado) — Trapecio inferior, más profundo:** el punto más bajo, cerca del borde interno del omóplato, con más presión sostenida (aviso: "nivel avanzado, presión más profunda — baja la intensidad si duele demasiado"). Postura: "Acostada boca abajo o sentada inclinada hacia adelante, brazo relajado colgando, para acceder a la parte más baja del trapecio."
- **Nivel 5 (Día 21) — Rutina completa:** los 4 puntos anteriores encadenados en una sola sesión de 8-10 minutos, con calentamiento al inicio y estiramiento de cierre al final.

En cada nivel, después del último paso, sigue aplicando el check-in "¿Cómo te sentiste?" (sección 14) — en los niveles 3 y 4, además de la pregunta general, agregar una pregunta específica: "¿Sentiste el efecto en un lugar distinto al de niveles anteriores?" para que la persona note que está trabajando algo nuevo, no repitiendo.

**Instrucción para las demás 14 zonas:** aplicar este mismo patrón (buscar 3-4 puntos o sub-músculos reales distintos dentro de la zona general, con su postura descrita en texto, en vez de repetir el mismo punto en los 5 niveles). Ya investigué y verifiqué los puntos reales para las 14 zonas restantes (cruzando varias fuentes de fisioterapia y masoterapia, incluyendo el manual clásico de puntos gatillo de Travell y Simons, la referencia mundial en este tema) — Mary debe revisar y confirmar estos puntos con su propio criterio profesional antes de darlos por definitivos, ya que a este nivel de profundidad su experiencia clínica es la validación final.

**Suboccipital/Nuca:** Nivel 1-2 ya descritos (borde óseo general). Nivel 3: punto más lateral cerca de la base del cráneo, que suele referir hacia la sien del mismo lado. Nivel 4 (avanzado): presión sostenida más profunda en el mismo punto, con mayor tiempo de sostenimiento — aviso de nivel avanzado. Nivel 5: rutina completa de ambos lados con estiramiento de cierre.

**Cuero cabelludo/sien (temporal):** Nivel 1-2 ya descritos. Nivel 3: punto más posterior del músculo temporal, cerca de la línea del cabello por encima de la oreja. Nivel 4 (avanzado): combinar con el punto del masetero (zona de mandíbula) ya que ambos músculos suelen trabajar juntos en el bruxismo. Nivel 5: rutina completa sien + mandíbula.

**Mandíbula (ATM/masetero):** Nivel 1-2 ya descritos (masetero superficial). Nivel 3: masetero profundo, un poco más adentro y abajo del ángulo de la mandíbula — puede referir dolor hacia el oído y los dientes. Nivel 4 (avanzado): presión sostenida en el punto profundo mientras se abre y cierra suavemente la boca. Nivel 5: rutina completa (superficial + profundo + sien).

**Hombro (deltoides):** Nivel 1-2 ya descritos (fibras externas/medias). Nivel 3: fibras anteriores del hombro (parte de adelante), que suelen doler al levantar el brazo hacia adelante. Nivel 4 (avanzado): fibras posteriores (parte de atrás del hombro), más difíciles de alcanzar, con postura: "lleva el brazo cruzado hacia el pecho y trabaja la parte de atrás del hombro con la mano contraria." Nivel 5: rutina completa de las 3 porciones (anterior, media, posterior).

**Omóplatos (romboides):** Nivel 1-2 ya descritos (borde interno del omóplato). Nivel 3: punto más alto, cerca de donde el romboides menor se une a la columna (parte superior del omóplato). Nivel 4 (avanzado): trabajar también el elevador de la escápula (justo arriba del omóplato, hacia el cuello), que casi siempre acompaña la tensión de romboides. Nivel 5: rutina completa de ambos puntos.

**Dorsal (zona alta de la espalda):** Nivel 1-2 ya descritos. Nivel 3: punto más lateral, cerca de la axila (borde externo del dorsal ancho) — este punto puede referir dolor hacia la parte interna del brazo. Nivel 4 (avanzado): punto en el ángulo inferior del omóplato, más profundo. Nivel 5: rutina completa de los 3 puntos.

**Lumbar:** Nivel 1-2 ya descritos (a los lados de la columna). Nivel 3: punto más lateral, cerca de la cresta de la cadera (cuadrado lumbar), que puede referir hacia el glúteo. Nivel 4 (avanzado): mismo punto con presión más sostenida y profunda — aviso de nivel avanzado. Nivel 5: rutina completa combinando ambos lados.

**Glúteo/Piriforme:** Nivel 1-2 ya descritos (piriforme central). Nivel 3: punto más alto y cerca del hueso de la cadera (glúteo medio, zona posterior-superior) — este punto suele referir dolor a lo largo de la cresta de la cadera y hacia el sacro. Nivel 4 (avanzado): punto un poco más abajo del anterior (glúteo medio, zona media), que refiere hacia el centro del glúteo y a veces hacia el muslo — presión más profunda. Nivel 5: rutina completa de los 3 puntos (piriforme + 2 puntos de glúteo medio).

**Pantorrillas:** Nivel 1-2 ya descritos (gastrocnemio, ordeñe general). Nivel 3: punto específico en el gastrocnemio interno (más hacia el lado interno de la pantorrilla), que puede referir hacia el arco del pie. Nivel 4 (avanzado): punto en el sóleo (más abajo y profundo, cerca del tendón de Aquiles), que refiere hacia el talón. Nivel 5: rutina completa de los 3 puntos.

**Planta del pie:** Nivel 1-2 ya descritos (talón hacia dedos). Nivel 3: punto específico en el centro del arco. Nivel 4 (avanzado): combinar con un punto en la pantorrilla (sóleo, ver arriba), ya que el dolor de planta muchas veces viene referido desde ahí, no solo del pie mismo. Nivel 5: rutina completa pie + pantorrilla.

**Antebrazo (extensores y flexores):** Nivel 1-2 ya descritos (extensores y flexores en general). Nivel 3: punto específico cerca del codo, lado externo (relacionado con "codo de tenista"). Nivel 4 (avanzado): punto específico cerca del codo, lado interno (relacionado con "codo de golfista") con presión más profunda. Nivel 5: rutina completa de los 4 puntos (extensor general, flexor general, codo externo, codo interno).

**Mano y muñeca:** Nivel 1-2 ya descritos (palma general). Nivel 3: punto específico en la base del pulgar. Nivel 4 (avanzado): puntos entre los huesos de los dedos (espacios interóseos), con presión más fina y controlada. Nivel 5: rutina completa de mano y muñeca.

**Pectorales:** Nivel 1-2 ya descritos (general, amasamiento). Nivel 3: punto específico en la parte alta del pecho, cerca de la clavícula (porción clavicular), que suele referir hacia el hombro. Nivel 4 (avanzado): punto más profundo, debajo del pectoral mayor (pectoral menor, cerca de la axila) — precaución, zona sensible, presión suave y gradual. Nivel 5: rutina completa de los 3 puntos.

**Abdomen:** Nivel 1-2 ya descritos (círculos generales). Nivel 3: punto específico debajo del esternón (puede relacionarse con sensación de pesadez similar a la digestiva). Nivel 4 (avanzado): punto específico un poco debajo del ombligo, presión suave y controlada (nunca profunda ni brusca en esta zona). Nivel 5: rutina completa de los 3 puntos, siempre respetando las contraindicaciones de abdomen ya descritas (embarazo, después de comer, etc.).

## 12. Funciones adicionales de retención (para sostener la suscripción más allá del primer mes)

**Rutinas combinadas:** una vez la persona completa varias zonas, ofrecer combinaciones ya armadas reutilizando el contenido existente (no se crea contenido nuevo, solo se reordena): ej. "Rutina de oficina completa: Trapecio + Antebrazo + Lumbar, 15 minutos". Mostrar 3-4 combinaciones sugeridas en la pantalla de Inicio una vez la persona tenga al menos 3 zonas con nivel 2 o más completado.

**Hitos de constancia:** insignias o mensajes simples al llegar a 30, 90, 180 y 365 días de racha (ver `racha` en el modelo de datos). Mensaje cálido, no competitivo — ej. "Llevas 90 días cuidándote. Eso ya es un hábito." Nada de rankings ni comparación con otros usuarios.

**Reporte mensual personal:** una vez al mes, armar un resumen usando los datos que la persona ya generó (zonas más trabajadas, sesiones completadas, cómo respondió al check-in de "¿cómo te sentiste?" a lo largo del mes). Esto no requiere contenido nuevo de Mary — es la app reflejando el propio progreso de la persona. Mostrarlo como una tarjeta destacada en Inicio el día que se cumple el mes de uso.

## 13. Calificación dentro de la app (con posible uso para marketing, con permiso real)

Después de un tiempo de uso (ej. tras completar el primer nivel avanzado de alguna zona, o a los 30 días de racha), mostrar una pantalla simple: "¿Cómo calificarías tu experiencia con Meraki App?" con 5 estrellas y un campo de texto opcional para comentario.

**El "beneficio para ti" que puedes construir de forma honesta (sin inventar nada ni incentivar calificaciones falsas):** si la persona deja un comentario positivo, mostrar un checkbox adicional, sin marcar por defecto: "¿Nos autorizas a compartir este comentario (con tu nombre o iniciales) en redes sociales o en la página de Meraki?" Solo si la persona marca ese checkbox, ese comentario queda disponible para ti en el panel de administrador, listo para usar como testimonio real en marketing — con el consentimiento explícito de quien lo escribió. Esto es justo lo que sí puedes usar como prueba social honesta, a diferencia de los testimonios inventados de otras apps que ya descartamos.

No ofrezcas descuentos ni beneficios a cambio de calificar — eso generalmente va contra las políticas de las tiendas de aplicaciones y, aunque esta es una app web, es buena práctica evitarlo igual: sesga las calificaciones y no se sentiría honesto con tu marca.

## 14. Pantalla de transición post-quiz (celebración breve)

Después de terminar el quiz y antes de mostrar la recomendación de Inicio, una pantalla breve y alegre tipo "¡Listo! Esto es lo que armamos para ti 🎉" con un ícono o emoji simple — no un video, solo una pausa visual de 1-2 segundos antes de mostrar el resultado.

## 15. Gráfico simple de estrés/tensión (solo para las 5 zonas conectadas a lo emocional)

Para Trapecio, Suboccipital/Nuca, Mandíbula, Lumbar y Abdomen (las que ya tienen la nota de conexión emocional en "porQue"), agregar un gráfico simple de dos líneas (ej. "tensión muscular" sube mientras "calma" baja, o similar) ilustrando de forma visual y sencilla por qué el estrés sostenido tensiona esa zona — con datos conceptuales, no inventando estadísticas ni porcentajes falsos.

## 16. Seguimiento después de cada técnica (check-in + descanso)

Al terminar el último paso de cualquier técnica (en cualquier nivel), antes de volver al menú de la zona, mostrar:

1. **"¿Cómo te sentiste?"** — tres opciones: "Mejor 🙂" / "Igual 😐" / "Con más molestia 😕". Si elige "Con más molestia", mostrar el mensaje: "Eso puede pasar a veces. Si persiste en tu próxima sesión, considera bajar la intensidad o consultar a un profesional." (guardar la respuesta en `progreso_usuario` para la sección Mi Progreso).
2. **Recomendación de descanso** (siempre visible, sin importar la respuesta): un mensaje corto tipo "Deja que el músculo se relaje ahora — evita repetir esta misma zona con fuerza en las próximas horas. Unas respiraciones profundas ayudan a que el efecto dure más."
3. **Tip rotativo de autocuidado** (ver sección 16 abajo) — una bebida/infusión sugerida según la condición de la persona (del quiz) y el día, para sostener el resultado, no solo el momento de la técnica.

## 17. Bebidas e infusiones de autocuidado (rotativas, verificadas, con filtro de seguridad)

Estas NO reemplazan tratamiento médico — son sugerencias de bienestar general, siempre con la nota "si tienes dudas, consulta a tu médico" visible. El sistema debe elegir la opción según la categoría de necesidad (ver abajo) y rotar entre las opciones disponibles día a día — nunca repetir la misma dos días seguidos si hay más de una disponible. Antes de mostrar una opción, filtrar contra las condiciones que la persona marcó en el quiz (sección 6): si tiene alguna condición listada en "evitarSi" de una opción, esa opción no se muestra, se rota a la siguiente disponible.

### Categoría: HIDRATACIÓN (mostrar cuando la zona trabajada sea de piernas/pies/pantorrillas, o si el quiz indica poca ingesta de agua)
1. **Agua con limón:** "Exprime medio limón en un vaso de agua. El músculo también se deshidrata, y mantenerte hidratada ayuda a que la técnica de hoy rinda más." evitarSi: ninguna (opción segura para todos).
2. **Agua con pepino y menta:** "Rodajas de pepino y unas hojas de menta en agua fría, reposar 15 minutos. Refrescante y ligera." evitarSi: ninguna.
3. **Agua de coco natural:** "Rica en electrolitos naturales, ideal después de mucho tiempo de pie." evitarSi: personas con problemas renales que requieran restricción de potasio (consultar médico).

### Categoría: RELAJACIÓN / ESTRÉS (mostrar en zonas con conexión emocional: Trapecio, Suboccipital, Mandíbula, Lumbar, Abdomen)
1. **Infusión de toronjil (melisa):** "Una cucharadita de hojas secas en agua caliente, reposar 5 minutos. Tradicionalmente usada para bajar la ansiedad y relajar." evitarSi: ninguna mayor conocida, pero moderar en embarazo sin supervisión.
2. **Infusión de tila:** "Reposar una cucharadita en agua caliente 5-10 minutos. Suave, apta para uso frecuente." evitarSi: ninguna mayor conocida.
3. **Manzanilla:** "Una bolsita o una cucharadita de flor seca, 5 minutos en agua caliente." evitarSi: "Anticoagulantes (puede aumentar riesgo de sangrado), embarazo o lactancia sin supervisión médica, alergia a plantas de la familia de las margaritas."

### Categoría: SUEÑO / INSOMNIO (mostrar si el quiz indica dificultad para dormir o mal sueño)
1. **Infusión de tila:** mismo que arriba, tomar 30-45 minutos antes de dormir.
2. **Manzanilla:** mismo evitarSi que arriba, tomar antes de dormir.
3. **Valeriana:** "Raíz en agua caliente, 10-15 minutos, tomar 30 min a 2 horas antes de dormir." evitarSi: "Embarazo o lactancia, combinación con sedantes o alcohol, uso continuo sin supervisión — se recomienda solo para noches puntuales de más nerviosismo, no todos los días."

### Categoría: ENERGÍA NATURAL (mostrar si el quiz indica fatiga o baja energía)
1. **Infusión de menta:** "Hojas frescas o secas en agua caliente, 5 minutos. Refrescante, sin cafeína." evitarSi: cálculos biliares (la menta relaja la musculatura y puede movilizarlos).
2. **Agua con jengibre suave:** "Una rodaja pequeña de jengibre fresco en agua caliente, 5 minutos, cantidad moderada." evitarSi: "Hipertensión, anticoagulantes, diabetes (puede potenciar medicamentos y bajar la presión o el azúcar de forma brusca), embarazo en dosis altas."
3. **Infusión de hibisco (flor de Jamaica):** "Cálices secos en agua caliente, 5-10 minutos, se puede tomar fría con hielo." evitarSi: "Hipertensión bajo tratamiento medicamentoso o hipotensión (puede potenciar el efecto de los medicamentos y bajar la presión demasiado), embarazo."

**Regla de filtro final:** si por las condiciones de la persona ninguna opción de una categoría queda disponible, mostrar solo la recomendación de agua natural simple ("Lo más seguro para ti hoy: agua natural, varias veces al día") — nunca dejar la sección vacía ni forzar una opción con contraindicación.

## 18. Qué NO copiar de otras apps (aunque se vea bien)

- Nada de barra de IMC/peso corporal — Meraki no es una app de pérdida de peso, y eso puede generar preocupación de imagen corporal que no corresponde a la marca.
- Nada de testimonios con fotos de "antes/después" ni cifras de usuarios inventadas ("+200,000 usuarios exitosos") — va en contra de la regla de no inventar testimonios ni resultados.
- Nada de countdown de descuento falso ni avisos de "alguien se acaba de suscribir" — son casi siempre falsos en otras apps y rompen la confianza si el usuario se da cuenta.

## 19. Fuera de alcance por ahora (fase 2, no construir todavía)

- Pasarela de pago real (Wompi, ePayco o MercadoPago — pendiente de decidir, no conectar hasta que la seguridad del punto 4 esté probada).
- App nativa (por ahora es web, accesible desde el navegador del celular).
