# 85 — H3.4.2: continuidad del mapa, recorrido y exposición visible

04/11/2026, fecha de proyecto en America/Montevideo. Continuación autorizada del **PR [#22](https://github.com/LeviEdition/invierno-en-la-colonia/pull/22)**, rama `experiment/h3-4-2-movimiento-mapa`, base `experiment/h3-4-1-estado-real`. **No es H3.4.3 ni una integración aprobada.** Este informe actualiza el comportamiento de84; conserva ese informe y sus evidencias como historia.

## Base y autorización comprobadas

Árbol inicial limpio; HEAD y remoto coincidían en **`1141b893aff88c8e1137c727e50c55b76e178a58`**. PR22 abierto/draft y base H3.4.1 **`064f47cc6516932c0baac839e34669f98e2fda34`**. No había AGENTS.md aplicable. Releídos instrucciones, README, tablero, protocolo15, informe84 y contratos existentes. Se conserva todo el trabajo posterior de la rama; no se retrocede a otro commit.

La revisión independiente de esta base confirmó **545 pruebas y Chromium en tres tamaños**, según el nuevo encargo del creador. Es posterior a la reserva histórica sobre otra ejecución de H3.4.1 que figura en83/84. El CI propio de1141 fue success, run41851777878; no se atribuye al cambio de este informe.

Main remoto **`826199d96645b95869509995772c914290d63ac7`**; tag anotado `v0.9.9-referencia-modular` **`0fdb214612486f4cc46c1acb444390de963d05e8`**, referencia preservada **`62e4e85150b2416ccf07d671c186b5c421993b0b`**. Sin modificaciones de main/tag/release, PR16/18/19/21, originales, reglas, IA, dados, probabilidades, capacidades, SP-03 o guardados. El HTML generado de **esta rama** se reconstruye, sin sustituir el adjunto preservado.

## Primero reproducir: qué ocurrió y qué no se confirmó

Antes de editar se grabaron tres movimientos en1141: exposición en blanco, herida y encrucijada pendiente. Se tomaron trazas RAF de cámara, geometría, fase y número de montajes, y se decodificaron todos los cuadros grabados.

**Confirmado:** abrir el planificador reducía el canvas CSS de **563 a475px**; al mostrar el resultado quedaba en531px. Cámara Y **−319,85 →−363,85 →−335,85**, sin cambiar el zoom real1,23354. El porcentaje mostrado también cambiaba al recalcular el encuadre base. El actor saltaba al destino y las otras fichas se compactaban. Una encrucijada llevaba inmediatamente a V9.9, un cambio auténtico de vista por una decisión real.

**No confirmado:** un cuadro completamente vacío/blanco durante esa transición. No se recreaba Phaser: `starts=1`. En las grabaciones a25FPS no aparece un vaciado global detectable en la zona del mapa analizada. Esto **no prueba que el pestañeo informado no exista en el equipo del creador**, ni cubre fenómenos más breves que40ms. No se atribuye una causa única a un pestañeo que no se logró reproducir. Sí se corrigen los saltos y el cambio automático de vista demostrados.

[Videos/trazas anteriores y posteriores](evidencias/h342-experiencia/README.md). Los análisis de píxeles son un detector acotado de vaciado del mapa, no una prueba suficiente de estabilidad de cada retrato; se complementan con trazas de identidad/DOM por RAF y revisión visual de la secuencia y sus cuadros.

## Solución pequeña, con el motor como autoridad

### Contrato de resolución

Se conserva **una sola ejecución** de `executeMovement`, compartida por `doMove` y `moveById`. `expose` ahora devuelve datos descriptivos además de ejecutar exactamente sus consecuencias anteriores: `rolled`, `value`, `effect`, `ability`, incrementos de herida/congelación y muerte inmediata. El movimiento añade actor/origen/destino y estado resumido anterior/posterior del actor. No cambia el orden de exposición, encrucijada, verificación o presentación originales.

No se analiza el registro ni se tira nuevamente. **Paso sigiloso:** sin tirada, valor nulo. **Resistencia:** conserva el valor que realmente salió y explica que evitó el daño. La muerte posterior y otras consecuencias se distinguen del efecto específico de exposición.

El broker sigue admitiendo únicamente la intención `move` validada, sin dispatcher genérico. Conserva validación por ID, propiedad, estado/revisión/origen/turno/destino y capacidad real, deduplicación y resultado incierto sin reenvío. La respuesta aceptada incorpora la resolución y **una proyección pública temporal**, usando el proyector existente, sin manos, mazos, cartas futuras ni dados privados. Se calcula una vez y se conserva en la respuesta deduplicada.

Esta proyección permite mostrar el resultado público después de la animación aunque el estado normal esté redactado por una decisión. **No elimina la decisión ni habilita comandos:** el cliente conserva aparte el último estado autoritativo y sus compuertas; mientras presenta/espera bloquea nuevos movimientos. El receptor siempre vuelve a validar sobre la partida real. No hay un segundo motor ni un estado de juego editable en el mapa.

### Presentación y continuidad

El reloj visual puro tiene estas etapas:

| Etapa | Normal | Movimiento reducido |
| --- | ---: | ---: |
| Traslado |1500ms, interpolación de ficha |100ms, cambio breve sin recorrido prolongado |
| Animación del dado, solo si realmente se tiró |550ms |80ms |
| Resultado real legible |1100ms |450ms |
| Consecuencia |200ms |80ms |

El ciclo del dado es determinista y decorativo; el resultado revelado viene del motor. El actor conserva retrato/iniciales, ID y color durante el trayecto. La herida/congelación/muerte se presenta después del resultado; una muerte retira ficha y selección en esa fase. Las demás fichas conservan sus posiciones asignadas: no se compactan al salir o morir alguien.

Planificador, confirmación, estado de conexión y resultado son **superposiciones**. No cambian el área CSS del mapa. `resize` conserva cámara cuando ancho/alto/DPR no cambiaron. Las fichas son nodos DOM identificados por ID, con retrato, borde y J1/J2 en la misma unidad y una única transformación de cámara. Phaser conserva mapa/ocupación/ambientación; no dibuja otra copia de los retratos. No se reconstruye el visor al confirmar.

El cambio a V9.9 por una decisión del movimiento es **deliberado**: primero se completa la secuencia; aparece **Continuar en V9.9** y se espera al jugador. El diálogo original conserva sus opciones; no se confirma automáticamente. Después se puede volver al mapa actualizado. Los errores reales siguen visibles.

Cambiar de vista, ocultar la pestaña, reiniciar o reconectar interrumpe la presentación y recupera la partida real sin repetir viaje, dado o comando. Un cambio de partida/sesión/turno invalida la presentación antigua. Una respuesta perdida mantiene el tratamiento de resultado incierto; no se inventa una llegada ni se reenvía. No se añade persistencia.

### Selección, destinos y móvil

Rivales: información visible y **toda la sección de acciones oculta**. Propios: restricciones del motor con explicación breve. Cambiar de actor lleva su panel al inicio; actualizar al mismo conserva el scroll. Azul/rojo y halo estático siguen presentes.

Moverse ilumina simultáneamente todos los edificios legales. El propuesto tiene contorno/relleno más intenso; el nombre aparece al señalar y las opciones HTML se identifican por nombre. Confirmación compacta con personaje, origen y destino. **Elegir otro destino/Escape** vuelve a elegir; **Salir de Mover/segundo Escape** sale sin mutar. El selector es una alternativa secundaria por teclado. Un edificio ilegal no confirma. Fuera del modo sigue abriendo su ficha.

En móvil la ficha se superpone y se contrae al elegir, sin reducir el mapa; el menú queda por encima. Se retiró la nota técnica de identidad de la pantalla principal y se acortaron avisos/cabeceras. Audio inicialmente apagado, movimiento reducido respetado. Suave/Tormenta, humo, luces, pool, imágenes y RNG ambiental **no se amplían**.

## Validación ejecutada

Node24.19.0, Chromium154.0.8037.57, Playwright1.57 externo, Linux/AMD EPYC9V74, SwiftShader por software. Escritorio1365×768/DPR1;393×852 y320×640/DPR2 con tacto emulado. No se instaló otra dependencia del producto ni se modificó el lockfile.

| Comprobación | Resultado |
| --- | --- |
| Instalación/build | `npm ci --cache /tmp/h342-npm-cache`; build/check:build, movimiento, estado, taller y hospital; diff --check. Aprobados. Se regeneraron los hosts derivados después del cambio de metadatos; un check previo detectó correctamente artefactos locales desactualizados. |
| Suite completa | **555/555**, cero fallos/omitidas/canceladas; diez nuevas pruebas de metadatos/equivalencia/habilidades/proyección pública, secuencia, interrupción, bloqueo y posiciones estables. Rojo previo conservado. |
| Oráculo57872ee | **40/40** partidas equivalentes; suites histórica/candidata sin omisiones. Solo se excluye el metadato de fuente como en el comparador existente. |
| Exposición y azar | Blanco/herida/congelación/mordedura con estado final y RNG iguales a `doMove`; habilidades sigilosa/resistente diferenciadas; durante la presentación no cambian partida ni RNG. |
| Experiencia Chromium | **5/5**: blanco escritorio, herida393, congelación320, decisión y muerte. Rival sin acciones, scroll correcto, seis destinos simultáneos, botón/Escape/teclado/tacto, cámara/área exactas, una ficha por actor y retratos cargados por RAF, orden de fases y consecuencias diferidas. |
| Recuperación Chromium | **5/5**: cambio a V9.9, visibilidad controlada, reconexión controlada con canales reales, solicitud obsoleta sin falsa animación, movimiento reducido/audio inicialmente apagado. Sin repetir movimiento/tirada. |
| Regresión H3.4.2 | **3 tamaños +9 casos límite** aprobados; conserva doble confirmación, cancelación pura, restricciones, muerte/sucesión/mordedura, pérdida de respuesta, reconexión, J2, limpieza y producto sin QA. |
| Regresión H3.4.1 | **3 tamaños +9 casos** aprobados sobre el motor entregado; mismos gates de consulta, decisiones/privacidad y recursos/ciclo de vida. |
| Evidencia temporal | Tres videos previos y cinco posteriores; decodificación/análisis de cada cuadro, trazas por RAF y hojas de contacto/cuadros revisados. Cámara estable, sin duplicación/desaparición anticipada detectada. Grabación25FPS, con las limitaciones indicadas. |

Los scripts de regresión se ajustaron al nuevo flujo: cancelar confirmación vuelve a elegir, y las decisiones requieren pulsar Continuar después de presentar. Esperar esa fase en QA no equivale a resolverla automáticamente en producto. Se conservan todos los escenarios anteriores.

Comandos reproducibles y resultados estructurados en [evidencias](evidencias/h342-experiencia/README.md). CI amplía el workflow existente con los dos nuevos gates, conserva H3.4.1/H3.4.2 y medición secuencial de ambiente. El **head entregado, run y artifact descargado/verificado** se consignan en la descripción del PR22 después de publicar; no se usa el CI de1141 como resultado del nuevo código ni se referencia circularmente el SHA propio de este documento.

## Segunda revisión crítica propia

Se volvió a leer el cambio completo, contrastando autoridad/proyección temporal, orden de eventos, privacidad, deduplicación, vida del actor, cámara, teclado/tacto, interrupciones y limpieza. **No sustituye una revisión humana independiente.**

Se confirmaron y corrigieron durante la validación: ficha móvil/selector abierto interceptaban el toque del mapa; menú quedaba bajo la ficha superpuesta; una regla CSS mostraba de nuevo la guía oculta durante confirmación móvil. Se contrajo la ficha sin cambiar geometría, se dejó el selector secundario cerrado al entrar, se corrigió el orden de capas y se respetó `[hidden]`. Escape se consume una sola vez, evitando salir del modo al querer solo volver a elegir. Las pruebas verifican estos comportamientos sin clicks forzados ni reducir cobertura.

Riesgos aceptados: el movimiento es una interpolación de ficha, no una ruta física; puede atravesar el dibujo de un edificio. Los excedentes siguen en las listas/badges, no se cambian capacidades para ajustarlas al arte. No se certifica nitidez, rendimiento de GPU/teléfono o percepción del creador. La ambientación conserva el coste por software ya documentado en84; este trabajo no la optimiza ni la amplía. La secuencia visual se cancela ante interrupciones, no se guarda/reanuda.

## Archivos, revisión y siguiente paso

Implementación: **`3713aa4cf437d70351f46e21cb61be1a2453b1d3`**. Documentación/evidencia en commit posterior. Cambios acotados al motor para metadatos compartidos y su HTML generado; `prototypes/movement-map/` para contrato/controlador/vista, nuevos `presentation-sequence.mjs` y `stable-layout.mjs`; diez pruebas Node, dos gates Chromium, adaptación de los gates anteriores y workflow. README, guía, tablero e informe85/evidencias actualizados. Las fuentes/bundles gráficos anteriores conservan los hashes de84; los hosts compartidos sí se reconstruyen con el motor actual.

**Recomendación: revisar esta versión en el PR22**, especialmente mapa continuo sin saltos, tensión/tiempos y legibilidad móvil. No se declara aprobada H3.4.2 por el creador. PR sigue draft; sin merge, nuevas acciones ni otros hitos. **Única siguiente tarea: revisión visual del creador.**
