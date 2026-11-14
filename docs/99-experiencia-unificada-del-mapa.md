# 99 — Experiencia unificada del mapa

## Auditoría previa ·14/11/2026

Rama local/remota limpia enef99f3c2e0d2063f0a94c45d02fdce43e284148d; PR25 abierto/draft contra694b645, CI43502182729 success verificado. Main826199d intacto. Sin AGENTS.md aplicable. El encargo autoriza reorganizar la presentación y sustituye el siguiente paso anterior de revisión manual; conserva reglas, costes, azar, IA, privacidad,33 accesos/plazas, geometría/arte y referencia estable.

Antes de editar se ejecutó la **versión normal** en1365×768,852×393 y393×852, con animaciones habituales, sin hooks QA ni parches de estado. Azar controlado para reproducir resultados; todas las acciones y decisiones se pulsaron en la interfaz. Preparación → seleccionar Mara → ataque/herida → habilidad de tratamiento → usar comida → equipar → transferir a J2 → aportar → limpiar → atraer parcialmente/terminar → mejorar dado → mover → buscar/conservar → Registro → turnos/colonia/sucesiones/final. Otros seis recorridos normales reproducen mordedura/sacrificio/sucesión y encrucijada activada por movimiento. [Capturas y pulsaciones previas](evidencias/experiencia-unificada/antes/). Se distinguen cambios de selector y scroll de las pulsaciones de botones registradas; estas no son una medida de tiempo humano.

|Tamaño|Cabecera|Objetivo/crisis/turno|Cámara en fila propia|Mapa CSS antes|
|---|---:|---:|---:|---|
|1365×768|68px|55px|57px|1055×563|
|852×393|50px|49px|49px|852×245|
|393×852|75,25px|124,59px|53px|393×576|

Hallazgos observados: Inventario en cabecera/menú/personaje/mano; objetivo/crisis repetidos en botones y resumen; cuatro atajos flotantes duplican acciones de ficha y ocultan las restantes; ambientación/audio/lista de mano y consultas técnicas mezclados con personaje. El menú expone comparación/taller/mapa anterior/arte/reconexión/reinicio. Equipar/transferir/limpiar/tratar/mejorar/aportar exigen reconocer un resultado sin elección nueva. Un ataque móvil cierra la ficha y obliga a reabrirla para encontrar otras acciones. La limpieza/tratamiento usan un modal de “Decisión de la partida” y mensajes genéricos, con contadores no pertinentes. Inventario recorre personajes sin equipo y ofrece aportar en todas las cartas. Selector de un solo objetivo en ataque; cámara ocupa casi todo el ancho móvil. Hambre/residuos están dispersos en ayuda. El Registro mezcla cronologías de dos diarios y muestra demasiado detalle de entrada. El final se encabeza como “Ciclo de turno y ronda”. Pasar las pruebas funcionales no resuelve estos problemas de usabilidad.

## Reorganización autorizada

Una cabecera compacta, objetivo/crisis con detalles desde su resumen, cámara sobre el mapa y un solo panel contextual para selección, borradores, inventario y consultas. Menú: Inventario, Grupo y líderes, Registro, Ajustes, Ayuda y Nueva partida separada. Herramientas técnicas en acceso de desarrollo independiente; recuperación solo en el error pertinente. Modales para mordedura/encrucijada/pase/sucesión/abandono/final y confirmación de fallecimientos. Los resultados rutinarios se mantienen en el contexto/Registro y su reconocimiento técnico usa el mismo comando de presentación, sin repetir efectos.

La aceptación manual corresponde al creador; no se fusiona ni publica.

## Presentación resultante

Cabecera con ronda, jugador/fase, moral, comida, hambre y residuos. Objetivo y crisis son resúmenes pulsables; las cartas entregadas siguen siendo un **conteo público**, no una revelación anticipada de aportes válidos. La consecuencia principal se muestra junto al requisito. Terminar turno conserva su confirmación previa y su posición separada de las acciones del personaje.

Cámara sobre el mapa; seleccionar localidad ocupa un ancho contenido. El panel lateral de340px se recupera al cerrarlo en escritorio. En móvil es una ficha compacta ampliable, con scroll propio; cerrar devuelve terreno. Abrir/cerrar conserva el zoom real elegido; Restablecer encuadra explícitamente el mapa en el espacio disponible. Esto reemplaza el ajuste automático anterior al abrir una ficha en vista general. El arte, coordenadas, capacidades y diámetros fuente son idénticos.

|Acceso anterior|Acceso actual|
|---|---|
|Inventario en cabecera, menú, personaje y listado de mano|Menú → Inventario; Inventario y equipo en el personaje propio, preseleccionado|
|Objetivo/Crisis en botones y resumen repetidos|Pulsar el resumen; Aportar a crisis abre cartas legales|
|Cuatro acciones flotantes y acciones de ficha|Una cuadrícula en la ficha; todos los formularios usan el mismo panel|
|Habilidad gratuita de constructor como acción aparte|Construir → Con un dado / Habilidad sin dado|
|Mejorar dado junto a habilidades|Reserva de dados → Mejorar dado con comida|
|Ambientación, sonido y controles entre datos de personaje|Menú → Ajustes, con reducción de animaciones de acciones|
|Equipo y explicación general de encrucijadas en consultas independientes|Equipo en ficha/inventario; encrucijadas en Ayuda y eventos en Registro|
|Referencia, arte, taller, mapa anterior, reinicio y reconexión|Desarrollo, solo agregando `?dev=1`; error recuperable ofrece su propia recuperación|
|Resultados rutinarios con Continuar|Confirmación previa; resultado persistente en contexto y registro, sin reconocimiento manual adicional|
|Pasos obligatorios del resumen de colonia|Todas las fases juntas; detalles desplegables y un cierre del resumen|

Las consultas y formularios son superficies no modales coordinadas. Solo se presenta un contexto activo. Mordedura, encrucijada, pase, fallecimientos, sucesión, abandono y final mantienen atención exclusiva y bloqueos reales. Escape cancela borradores/consultas y devuelve el foco al control de origen; no resuelve una decisión obligatoria. Seleccionar un único recurso/objetivo legal prepara el borrador, nunca envía una acción con coste. Varios dados legales siguen requiriendo elección.

El inventario distingue mano/equipo, omite filas sin equipo, filtra Mano y equipo / Solo mano / Solo equipo y conserva UID individual y uso por ronda. Transferencias muestran receptor, jugador y localidad. Solo aparecen botones de aporte cuando la consulta del motor los permite. Los resultados de curación, comida, equipo y transferencia usan cantidades/nombres estructurados, sin interpretar el texto del registro.

## Reconocimiento y recuperación

El coordinador usa exclusivamente los comandos existentes de reconocimiento de búsqueda/acción/inventario/habilidad. No reenvía el comando que gastó recursos ni ejecuta consecuencias durante una animación o avance del resumen. Espera el resultado conocido y el fin de la presentación; no reconoce decisiones ajenas. Cambiar audiencia, partida o fase privada borra avisos y borradores. La incorporación informativa de un superviviente se reconoce mediante el comando existente y queda en Registro.

Se corrigieron hallazgos reproducidos durante la revisión: restaurar foco dos veces enviaba el foco al menú después de una consulta; el menú móvil podía quedar bajo la ficha ampliada; recuperar una respuesta de reconocimiento perdida podía dejar abierto un formulario vacío; un resultado rutinario no debe intentar reconocerse mientras hay otra decisión pendiente. Una tirada de una cadena de mordedura anterior tampoco debe aparecer en una mordedura nueva. La preparación limpia una presentación anterior sin pendiente real. Estas correcciones no añaden decisiones ni cambian resultados.

Registro mezcla ambos diarios con un orden de presentación compartido, agrupa por ronda y distingue acciones, colonia y eventos importantes. Detalles menores se despliegan; la redacción por audiencia sigue siendo la del adaptador. No se añaden cartas futuras, manos rivales ni datos de aportes a la proyección pública.

## Verificación y revisión manual

Las pruebas conservan equivalencia de estado/azar, doble pulsación, versiones obsoletas, privacidad, decisiones obligatorias, reconocimiento y recuperación sin reenvío. Los cambios de selectores de los arneses corresponden a accesos retirados: abrir Inventario por Menú y esperar el resultado integrado. El estado, los recursos, las tiradas y la cámara siguen comprobándose. La prueba de excedentes comprueba conteo completo y aviso en el mapa, en lugar del párrafo técnico retirado. Vista general completa se comprueba tras Restablecer, con ficha abierta y cerrada; abrir una ficha ahora exige mantener el zoom elegido.

Además de las baterías anteriores de presentación, capacidades, inventario, ciclo, migración y animaciones de acciones, `check-map-experience-browser.mjs` recorre la **compilación normal**, sin fixtures ni hooks QA, en1365×768,852×393 y393×852 con movimiento normal/reducido. Controla únicamente el azar para reproducir la comparación. Verifica menú, ajustes, Escape/foco, consultas sin efectos, zoom, controles44px, ausencia de desplazamiento horizontal, resultados y guardia contra retorno a V9. El flujo usa preparación → acciones → inventario → crisis → colonia → final. Se distingue esta emulación de una prueba en teléfono físico.

Revisión sugerida del creador:

1. Identificar turno, objetivo, necesidad y fallo de crisis sin abrir consultas.
2. Seleccionar Mara, ampliar/plegar la ficha móvil y encontrar acciones/costes; volver al mapa con el mismo zoom.
3. Equipar/transferir y aportar desde crisis; comprobar nombres, receptor y resultado sin Continuar.
4. Cancelar con Escape y verificar foco; probar la alternativa gratuita de Leo y la habilidad automática de Iris.
5. Resolver mordedura/encrucijada/pase/sucesión; revisar todas las fases de colonia y consultar Registro tras el final.

Límites: Chromium de escritorio y emulación táctil, sin dispositivo físico, TalkBack ni auditoría completa de lector de pantalla. El azar controlado facilita la reproducción y no certifica balance. Hay scroll en fichas largas y en el menú de pantalla baja. No se añade guardado: recargar toda la aplicación pierde la instancia. La aceptación estética y de comodidad sigue siendo manual. No se modifica main, no se fusiona y no se publica el juego. SHA y CI exactos se registran enPR25 al finalizar la comprobación remota.


## Comparación y entrega

[Tabla antes/después, pulsaciones, vídeos y pruebas](evidencias/experiencia-unificada/README.md). El mapa gana109px de altura en escritorio,62px en móvil horizontal (25,3%) y83px en vertical; las franjas superiores horizontales bajan148→86,08px sin reducir los controles de44px.729/729 locales, seis baterías de regresión, seis recorridos normales de experiencia y seis de decisiones aprobados. La revisión completa de colonia puede cerrarse con una pulsación; las confirmaciones de coste y decisiones obligatorias se mantienen. El flujo completo automatizado hasta derrota no equivale a medir una revisión de colonia; sus pulsaciones brutas se conservan y no se presentan como ahorro.

Implementación revisable enc2014569ec3e288345727a87376c0ebd36f1b453; documentación/evidencia en el head final del mismo PR25. La comprobación remota final por SHA, ejecución de Actions y artifact se registra en el PR y en la respuesta de entrega. **Siguiente paso: revisión manual del creador.**


## Cierre de la revisión visual y primer CI

La inspección de capturas encontró un aviso de movimiento anterior persistente y un final capturado antes de confirmar los fallecimientos. Los commits968e5cb/838ce09 retiran el aviso al preparar otra acción/cambiar fase, conservan el reconocimiento de fallecimientos y muestran la causa final antes de consultar Registro. Se repiten los seis recorridos normales/reducidos y el acceso al Registro después de finalizar. La cabecera permite envolver el nombre de fase sin solapar Moral.

[CI43634775072](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/43634775072), SHA39934cb, quedó **rojo** en la comprobación de cámara del ciclo móvil. Presentación/capacidades/inventario y la suite habían pasado; no se atribuye éxito al conjunto. Se descargó el artifact14130141595 (120193425 bytes; SHA256819dd14be45cbc1f97ada179fe34a4dfe8f00321fa129bbf43dbabb912b1cf8b), [manifest y resultado conservados](evidencias/experiencia-unificada/pruebas/ci399-rojo/).

La crisis nueva envuelve una línea más: el viewport pasa852×284→852×266. El zoom sigue0,3071200850 y el centro del mundo siguey470,5; la cámara pasa−2,5→−11,5, exactamente la mitad del cambio de altura. La aserción antigua exigía coordenadas de pantalla idénticas aunque había cambiado el viewport. La comprobación corregida conserva el mismo umbral0,01, exige zoom idéntico, traslación exactamente igual a medio cambio de viewport y el mismo punto central del mundo. Cuando el viewport no cambia, sigue exigiendo las mismas coordenadas. Las aserciones de cámara fija durante animaciones permanecen. No se cambia el algoritmo de cámara para acomodar la prueba.


[CI43636416649](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/43636416649), SHA13ec9a0, aprobó729 pruebas pero quedó **rojo** en el encuadre completo de colonia. Se preserva [artifact14129894203 y resultado](evidencias/experiencia-unificada/pruebas/ci13-rojo/),23398227 bytes y SHA256708d9f08d8bb7adb1341833fe9cc1853299ee86c362c2ea906256c413f7c4eb5. Es un recorte real: calcular Centrar localidad con el ancho anterior y después abrir el lateral340px dejaba el extremo derecho enx1026,25 para un viewport1025. La corrección prepara primero el panel y calcula el enfoque explícito sobre el viewport definitivo; conserva el comportamiento de mantener zoom al abrir consultas. La aserción de encuadre completo sigue intacta y se añaden sus coordenadas al informe de QA.

Cierre de código en1cda12a070cc9b27da30476cf568b9562c319c52: presentación completa repetida en ambos tamaños, inventario repetido,21 pruebas dirigidas y recorrido normal de filtros/constructor sin dados aprobados. Los filtros ocultan la sección que no corresponde y distinguen falta de cartas legales de mano vacía; un único paciente legal se preselecciona incluso si la selección anterior no era válida. El propietario fijo del equipo y un único receptor se muestran como texto. Los costes de Construir distinguen dado/habilidad propia y Mejorar dado explica comida/dado insuficientes. Sin nuevos efectos, reglas ni cambios del arte.
