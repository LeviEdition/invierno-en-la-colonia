# 93 — Composición integral: apoyos, fichas y lectura del mapa

06/11/2026 UTC. [PR25](https://github.com/LeviEdition/invierno-en-la-colonia/pull/25), misma rama `experiment/mapa-horizontal-ambientacion-h3`, en borrador contra H3.4.4. Entrega para revisión visual, sin merge ni cierre de etapa.

## Estado inicial y alcance vigente

Revisión del encargo adjunto, README, protocolo15, tablero18 e informe92; sin AGENTS.md aplicable. Rama limpia y head remoto **edacdf05c67967a49609e45d21dad6e9e0dcc4e0**, PR25 abierto/draft, base **694b64504ca39bb00627fb4cf9964b9521ec211f**. Main **826199d96645b95869509995772c914290d63ac7** y referencia62e4e851/tag/release preservados. La interrupción del entorno impidió recuperar resultados en el intento anterior; tras restablecerse se comprobó el árbol y se recuperó la línea base **629/629**. No se atribuyeron pruebas aprobadas al período sin entorno.

El encargo amplía la composición y conserva lo resuelto: espacio de ficha, barras compactas, jerarquía de vacías, contornos separados, vegetación con puntas libres y muestreo. Los informes90–92 y sus capturas conservan su valor histórico. No se modifican reglas, capacidades, IA, resultados, partidas ni PNG; no se agregan edificios, mecanismos, motores o dependencias.

## Apoyos exteriores: datos manuales sobre el arte

Los36 accesos mantienen ID derivado de localidad/índice, orden lógico y asociación con el motor:12 en colonia,4 en cada exterior. Solo cambian coordenadas, ángulo de la elipse y tamaño gráfico del contorno. No son distancias, colisiones ni capacidades nuevas. Zombis y barricadas mantienen su escala y sus pivotes originales.

- **Colonia:** cuatro al norte separados de la escuela, dos por lateral y cuatro al frente. Los superiores esquivan el garaje escolar y el pico del techo. Los inferiores recorren el frente y su esquina este: el cuarto no puede formar una línea rígida porque hay un garaje pequeño sobre esa zona del dibujo. Se conserva la elipse completa fuera del cerco.
- **Escuela:** fila en su patio, delante de la fachada; deja de prolongarse hacia el garaje y la colonia. Apoyos y elipses acompañan la leve pendiente del recinto.
- **Hospital:** dos delante de la ambulancia y dos junto al costado visible. El cuerpo completo deja margen al vehículo, fachada y ramas próximas; no solo se comprueba el punto de los pies.
- **Biblioteca:** fila más próxima, con inclinación y separación contenidas; evita entrada, cabina y arbusto lateral.
- **Supermercado:** grupo centrado en el frente útil, entre poste y vegetación lateral. Las elipses más compactas evitan que una línea pase sobre el poste; no se reduce ningún sprite para hacerlo caber.
- **Gasolinera:** apoyos en la explanada despejada, separados de cerca, surtidores y columnas. Una discontinuidad entre las dos parejas respeta el arbusto integrado en el fondo, que permanece intacto.
- **Comisaría:** dos delanteros y dos laterales más próximos, dentro de lo que permite la vegetación. Conservan separación del vehículo y entrada. No se inventa un área limpia con parches de nieve.

Los radios gráficos varían según terreno disponible; siguen conteniendo el apoyo de los sprites. No representan un cupo físico nuevo. Las posiciones se fijan en `scene.json`; seleccionar, pan/zoom y actualizar la partida no las recalculan.

## Comprobación de volúmenes y hallazgos

`presentation.mjs` calcula límites visibles desde dimensiones, pivote y escala de los recursos originales. La QA contrasta **72 volúmenes**: un zombi y una barricada completos en cada acceso. Exige separación de2px fuente entre cuerpos vecinos, incluso de localidades distintas. Los polígonos manuales de `test-support/horizontal-obstacles.json` incluyen edificios, vehículos integrados en su silueta, cercos, postes, garajes, casas auxiliares y parada. Son datos de comprobación del dibujo; no se importan al producto ni al motor como colisiones.

Se conserva además la compuerta anterior de vegetación: huella32×38, menos del1% de píxeles con alfa>32. La nueva prueba muestrea96 puntos de cada elipse contra el alfa original y exige máximo≤32, además de comprobar su perímetro contra sólidos. Ese umbral admite ruido tenue del PNG; no certifica cada píxel antialias ni reemplaza la revisión visual.

Las primeras coordenadas propuestas tocaban ramas/arbustos al acercarlas al edificio; se corrigieron antes de entregar. Una captura reveló una barricada sobre el techo del garaje sur, que faltaba en el inventario inicial de obstáculos. Se conserva el rojo, se añade el anexo y se mueve la casilla al tramo despejado. Se ajustaron también elipses que rozaban un poste o vegetación aunque el cuerpo del actor quedara libre. No se bajaron tolerancias ni se modificó el alfa para obtener verde.

La prueba antigua de equidistancia de filas se sustituye por separación real, ángulos explícitos, perímetro y cuerpos sin interferencias: el encargo pide ajuste manual y evita filas horizontales automáticas. La prueba de apertura/cierre usa ahora el ancla del encuadre completo, no el antiguo centro aislado del edificio; conserva las exigencias de zoom y reversibilidad.

## Fichas e identidad

Cuatro fichas compactas por exterior, situadas sobre el sector del edificio sin tapar fachada o entrada. Gasolinera deja libre el automóvil; comisaría agrupa2×2 sobre el ala derecha para conservar antena y emblema. También se contrastan con cuerpos de otras localidades. Colonia usa dos filas de seis en el patio, dejando libres ventanas y portón. Diámetros32 y26px fuente, respectivamente; la insignia J1/J2 queda dentro del borde para no invadir la fila siguiente. El seleccionado conserva azul/J1 o rojo/J2, borde más grueso y halo más contenido, sin parpadeo. El nombre completo y jugador siguen en el selector accesible y el panel, también cuando el zoom oculta la insignia pequeña.

Se conserva la asignación explícita `h0/h1/a1/a0` a los cuatro retratos existentes; el resto usa iniciales, sin reasignar caras tras una muerte. Las escenas sintéticas usan códigos de dos letras distinguibles y un rótulo QA visible. No inventan supervivientes, habilidades o preparación real. Se verifica capacidad máxima36, cuatro retratos únicos, círculos sin solaparse ni tapar fachadas/portón, y estabilidad de apoyos/retratos de los restantes después de quitar un personaje.

## Cámara, interacción y contornos

El nuevo enfoque incluye la silueta, todas las fichas y los espacios exteriores con margen20px fuente, considerando el cuerpo del actor, no solo la elipse. `focusAnchor` usa ese rectángulo para conservar el encuadre al abrir/cerrar la ficha. Se mantienen límites de cobertura sin mostrar fuera del PNG; en vertical estrecho sigue siendo necesario pan cuando no cabe todo el perímetro. La vista general permite localizar los siete centros en los tres tamaños solicitados.

Se conserva la recuperación310px, actualización conjunta panel/canvas/cámara, zoom solicitado reversible y barras móviles99px/mapa294px. El límite de cobertura puede elevar temporalmente el zoom mínimo al ampliar el viewport; se restaura al reabrir, como documenta92.

Los siete contornos se revisaron de nuevo, incluida la cabina de biblioteca; conservan su geometría detallada y trazo1,3px. El señalamiento por puntero añade una línea gris azulada más tenue; la selección es ámbar y más fuerte; destinos legales son discontinuos, y el destino propuesto usa énfasis continuo. El hover no ejecuta acciones ni captura eventos. Se integra en el listener existente, se limpia al cambiar cámara/salir y no añade otro sistema de entrada. Área de clic y máscaras de oclusión permanecen separadas y no se alteran por este retoque.

## Luces, contraste y arte pendiente

Se mantienen exactamente tres fuentes: entrada del hospital y ventanas oeste/este de colonia. Se estrechan sus polígonos de luz sobre superficies para no alcanzar la ambulancia ni prolongar la mancha sobre objetos vecinos; el refuerzo ámbar baja de0,26 a0,18. La intensidad de fuente y mancha sigue acoplada; el titileo reduce su profundidad0,96→0,80, conservando fases/periodos independientes y descansos. No hay aclarado global ni halos por localidad. La separación local se limita a las superficies ya iluminadas del arte y respeta el tono nocturno.

Los seis árboles/dos arbustos, máscaras, raíces, fases y geometría de92 se conservan; no se vuelve a deformar el interior de recortes con techo fijo. Se mantienen132 partículas, apagado, movimiento reducido, pausa y sonido inicialmente apagado. Los focos restantes del mapa siguen estáticos.

Pendientes concretos de arte, sin sustituirlos por marcadores o parches:

- Señal distintiva de biblioteca en una capa transparente con perspectiva y tamaño coherentes; el recurso actual está aplanado y no tiene esa pieza separada.
- Carros/cartel deteriorado de supermercado legibles al acercarse, sin ocupar los cuatro accesos. El dibujo ya contiene objetos, pero su resolución y falta de capas impiden enriquecerlos limpiamente.
- Huellas/suministros de colonia y un indicio puntual de abandono como capas propias, con procedencia, pivotes y aprobación artística; no hechos narrativos implementados.
- Calzada principal/accesos secundarios en capas de nieve compactada para ajustar contraste sin pintar encima del fondo. No se altera la distribución vial o de edificios.
- Retratos faltantes para personajes reales; continúan iniciales estables hasta disponer de arte correspondiente.

## Nitidez y presupuesto

Filtros lineales/mipmaps, antialias y DPR único conservados; sin enfoque, ampliación de imágenes o cambios de estilo. Zoom máximo habitual1,5CSS/fuente. La fuente1672×941 pierde detalle en primeros planos: para no ampliar muestras físicas al máximo, una futura fuente artística equivalente requiere aproximadamente2508×1412/DPR1,5016×2823/DPR2 o7524×4235/DPR3. Es una necesidad de detalle real, sujeta a GPU y presupuesto de memoria, no una orden de escalar el PNG actual ni de cargar texturas enormes indiscriminadamente.

## Hallazgo del CI y corrección del reloj visual

La primera entrega de composición **04126c6450e2a2101372a7be9db2703ab6e38ae7** aprobó638 pruebas, oráculo y construcciones, pero [CI42300586160](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/42300586160) terminó **rojo**: su traza de movimiento registró viaje/tirada/revelación sin consecuencia. Se conserva esa evidencia, incluido el video y el hash del artifact descargado. No se presenta como aprobación de la entrega.

La reproducción local, antes de corregir, demora RAF del visor500ms, sin tocar el reloj ni el azar del host. Vuelve a omitir la consecuencia. El reloj sumaba todo el tiempo transcurrido: podía pasar de revelación a finalizado en un único render, saltando la fase de200ms. Es un fallo de presentación confirmado; no un nuevo resultado o ejecución del motor.

Corrección mínima compartida por el visor de acciones y horizontal: `advanceFrame` limita el avance visual por cuadro a100ms normal/50ms reducido, menores que las fases positivas más cortas(200/80ms). Con intervalos≤100/50ms respectivamente conserva el tiempo transcurrido; bajo carga dilata la secuencia para que no desaparezcan fases completas. No promete fluidez ni altera tiradas, comandos, consecuencias o azar. El avance expreso al cambiar a movimiento reducido y la interrupción conservan su comportamiento anterior; el método `advance` previo sigue disponible para los prototipos históricos.

Tres regresiones unitarias cubren pausas largas, movimiento reducido, ataque, barricada sin tirada y finalización/interrupción. Una compuerta Chromium adicional conserva las cuatro fases en normal y reducido con RAF demorado500ms, cámara fija, una sola ejecución y estado/RNG ya resueltos intactos. La compuerta original y su aserción de las cuatro fases permanecen. [Rojo/verde y trazas](evidencias/mapa-integral/README.md#reloj-visual-fotogramas-lentos). Se repiten movimiento y acciones localmente; CI vuelve a ejecutar la batería completa sobre el nuevo head, registrado en PR25 sin atribuirle el verde de un SHA anterior.

## Pruebas realizadas

- `npm ci`, línea base629/629 recuperada, composición638/638 y entrega **641/641**: nueve pruebas de composición y tres de reloj visual. `npm run check:build`, siete builds/checks y oráculo57872ee **40/40**.
- Chromium, acciones **3 tamaños**1365×768/1920×1080/852×393: movimiento, búsqueda, ataque/exposición y construcción; bordes/recuperación13, movimiento inicial5 y repetición final6 (cuatro tamaños y decisiones/muerte), cámara9 combinaciones1365/393/320×apagado/Suave/Tormenta. Sin adelantos de fichas, doble ejecución ni cambios de cámara durante consecuencias.
- Composición definitiva **3 tamaños**:21 enfoques, tres generales, señalamiento/selección y12 proyecciones máximas. Cada modo revisa las siete localidades:84 capturas de máximo, conteos36, cuatro retratos únicos, cuerpos alternativos72 y estado/RNG original intactos.
- Escena **6 tamaños**, incluidos740×360/393×852/320×640:42 consultas, pan/pinza/teclado, máximos sintéticos, pausa controlada, movimiento reducido y reinicios sin acumulación de listeners/recursos. Confort3 tamaños: recuperación310px, foco/Escape, ancla/zoom reversibles, backing/CSS/DPR coincidentes durante transiciones y muestreo correcto.
- Video temporal de viento **144 muestras/22,024s visuales**, duración real67,6s por software, varias ráfagas y panel/cámara; raíces en0 y apagado posterior0 renders ociosos. Regresión de luces/tormenta140 muestras con fuente/mancha coordinadas y titileos registrados.
- Sin errores normales de consola en los casos aprobados. Originales/dimensiones/alfa/SHA intactos, sin cambios en `src/`, lockfile o referencia HTML; host normal idéntico a H3.4.4. CI del nuevo head exacto y artifact se verifican en PR25, no se atribuyen a este commit los checks anteriores.

Las pruebas automáticas, las capturas inspeccionadas y los videos no equivalen a aprobación artística ni a prueba física. Se revisaron especialmente máximos simultáneos, garaje sur, elipses/vegetación, car/antena y fichas de localidades vecinas. Tras los últimos ajustes de fichas se repitieron suite, construcciones, composición, escena y confort; las cuatro regresiones de acciones y los recorridos de video/perfil se conservan y CI vuelve a ejecutar todo sobre el head entregado.

## Rendimiento observado

Comparación aislada contra edacdf05, canvas1055×563/DPR1, misma vista general/partida. El benchmark usa Restablecer porque el nuevo enfoque por localidad incluye más elementos y ya no sería una cámara equivalente.500ms de calentamiento y dos muestras1500ms por perfil; tiempo real/POST_RENDER y CDP TaskDuration/heap.

|Perfil|edacdf05, renders/s|Candidata, renders/s|
|---|---:|---:|
|Apagado|0,00|0,00|
|Suave|13,74|14,02|
|Tormenta|13,01|12,92|

Variaciones de aproximadamente+2,0%/−0,8%, compatibles con ruido de muestras cortas en entorno compartido: no se afirma una mejora ni garantía30FPS. La geometría sigue en522 vértices/416 triángulos, nueve meshes de vegetación y132 partículas; no otro bucle. Las superficies auxiliaresRGBA pasan de5790524 a5289104bytes (≈8,7% menos por manchas más pequeñas), sin sus mipmaps; no son VRAM ni memoria total. Originales y preparación mipmap conservados.

Linux/AMD EPYC9V74, Node24.19.0, Chromium154.0.8037.57, Playwright1.57 externo, ANGLE/Vulkan/SwiftShader por software; DPR1 escritorio y DPR2/tacto emulado móvil. El encuadre difiere del ensayo92: sus números no se comparan directamente con estos. Sin teléfono físico, VRAM medida, nueva certificación de bfcache o garantía de suavidad en hardware real.

## Reproducir y revisar

[Guía Windows/VSCode/LAN](../prototypes/horizontal-map/README.md). En la carpeta del repositorio, rama actualizada: Ctrl+C al servidor anterior, `npm.cmd ci`, `npm.cmd run dev:horizontal-map`. Abrir **http://127.0.0.1:8779/prototypes/horizontal-map/** y Ctrl+Shift+R. Node22+, sin Python; preparar V9.9 y pulsar Ver mapa. Inventario, cuatro acciones, consultas y acceso explícito a V9.9 se conservan.

[Índice de evidencia](evidencias/mapa-integral/README.md): antes/después por localidad, generales escritorio/móvil, máximos aislados y video a velocidad normal. El commit, run y artifact finales se verifican y registran en PR25, evitando SHA circular documental. El CI de edacdf05 es historia y no respalda el nuevo head. Para revertir, deshacer primero el commit posterior de reloj visual identificado en PR25 y después04126c6; conserva la historia y vuelve a edacdf05.

**Única siguiente tarea: revisión visual del creador de esta pasada integral.** No se declara aprobada la dirección artística, la experiencia manual ni cerrada la etapa. Sin merge ni avance automático.
