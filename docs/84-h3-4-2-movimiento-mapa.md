# 84 — H3.4.2: movimiento desde el mapa e identidad estable

04/11/2026. Rama **`experiment/h3-4-2-movimiento-mapa`**, desde **`064f47cc6516932c0baac839e34669f98e2fda34`**, head remoto comprobado de H3.4.1/PR21, OPEN/draft contra H3.3. Árbol inicial limpio; HEAD/FETCH_HEAD coincidían. No AGENTS.md aplicable. Releídos README, tablero, protocolo15, informe83 y contratos/código del motor y presentación. Main remoto **`826199d96645b95869509995772c914290d63ac7`**; referencia/tag/release y prototipos anteriores preservados.

## Autorización y línea base

El creador probó y **aprobó H3.4.1 como consulta**. Autoriza H3.4.2 y sus ajustes de identidad, presentación y ventisca. Nueva rama/PR draft contra H3.4.1; no merge ni nuevas acciones. El mapa horizontal y las capacidades visuales definitivas siguen aplazados. Se conserva83 como evidencia histórica.

La revisión independiente anterior confirmó528 pruebas y compilaciones; su ejecución completa de Chromium **no tuvo un resultado final recuperable**, por lo que no se cita como aprobada independientemente. Al comenzar se recuperó **nuestra propia línea base** sobre064f47cc:528/528, check:build, build/check de H3.4.1, gate Chromium3 tamaños y9 casos adicionales, ambos con JSON final aprobado. Es evidencia nueva de esta ejecución, separada de esa revisión.

## Decisión técnica

Se mantiene una sola partida en el host V9.9. La entrada de consulta anterior permanece en `/prototypes/state-map/`; la nueva es **`/prototypes/movement-map/`**. Se conserva también H3.3, taller, Canvas y Phaser. Las fuentes de esos prototipos no se modifican. La nueva presentación deriva de la pequeña escena H3.4.1 y reutiliza sus consultas/observador, layout base, recursos, cámara, controles, renderer y audio. La variante de ambientación se aísla en H3.4.2 para no sustituir silenciosamente el tratamiento anterior.

Esta separación incluye una copia acotada del shell/vista experimental. Es un costo de mantenimiento explícito para poder comparar ambas rutas, **no un segundo motor lógico**. Una consolidación general no pertenece a esta entrega.

### Motor, consulta pura y ejecución por ID

`playable()` llama a `leaderChoiceReady()` y sincroniza solicitudes: **no se usa como consulta inocua de legalidad**. Se añaden dos métodos específicos en el objeto público de motor, sin añadir un dispatcher de mensajes:

- **`movementOptions(actorId)`**: consulta pura. Comprueba partida/final, fase interactiva, IA/pase, muertes y decisiones, propietario, existencia, vida y marca de movimiento. Obtiene los destinos con la consulta existente `accessible`, que aplica la capacidad **real** y los indefensos. Devuelve origen, generación de partida, ronda/turno y destinos; no dibuja, no consume RNG y no sincroniza líderes.
- **`moveById(request)`**: revalida generación/ronda/turno/origen, estado vivo/propiedad/fase y destino. Busca el actor por ID, nunca por el índice visual o la selección activa. Rechazo sin escribir estado ni consumir azar.
- **`executeMovement(actor,destination)`**: extracción de las consecuencias que ya ejecutaba `doMove`: confirmación inicial de líder, llegada/marca, habilidad silenciosa o exposición, encrucijada, verificación y presentación. El `doMove` anterior conserva sus validaciones y llama a la misma función. No hay otra implementación de exposición, muerte, coste o capacidad en el mapa.

La generación es un contador privado de la instancia, fuera del formato de partida, para distinguir dos inicializaciones con datos idénticos. El HTML autocontenido de **esta rama** se regenera para mantener el build, sin reemplazar el HTML de la release ni modificar main/tag.

### Contrato acotado del canal

Namespace **`iec-movement-map/v1`**. Se mantiene MessageChannel y la comprobación de padre/origen/puerto. Mensajes de presentación admitidos: conexión, snapshot de consulta y foco. Única intención de juego admitida:

```text
move { requestId, session, revision, actorId, destination }
move-result { requestId, ok, reason, actorId?, name?, from?, destination?, location?, dead? }
```

No acepta nombres de comandos arbitrarios, índices de actor, escrituras de estado ni campos extra. Datos mal formados se rechazan. `session` identifica la vida del host; `revision` cambia al variar la partida, generación o bloqueo. Su firma se calcula **dentro del host**, sobre el snapshot privado y fase; manos/mazos/firma no salen por el canal. Selección activa y destino privados del UI no se usan como identidad del actor. Antes de ejecutar se compara nuevamente el estado pertinente y se llama a la validación viva del motor.

El broker conserva las últimas128 respuestas junto con el contenido exacto de cada solicitud. Un reenvío idéntico devuelve la respuesta sin ejecutar; reutilizar el ID con otros datos se rechaza. Los reenvíos antiguos fuera de esa ventana tienen una revisión obsoleta y no vuelven a ejecutar. La deduplicación vive con el host, incluso al reiniciar el visor o reconectar su canal; **no es un almacenamiento durable ni un guardado nuevo**.

El cliente bloquea confirmaciones mientras espera. No mueve la ficha de forma anticipada. Si no recibe respuesta en8s, marca resultado desconocido y consulta el estado; no reenvía. Ocho segundos es una espera de comunicación generosa para una ejecución síncrona local, no un tiempo límite de las decisiones del juego. El timer se cancela al responder/salir. La segunda desconexión conserva el estado desconocido; solo una consulta actualizada permite salir de él. Si sigue habiendo un diálogo, se conserva la espera hasta resolverlo en V9.9.

Identificadores mediante `crypto.getRandomValues`, independientes del RNG del juego, sin exigir `randomUUID` en HTTP de una LAN. No son credenciales. QA separado/solo loopback para semillas, acciones legales y simulación de una respuesta perdida; se elimina del producto, sin parámetro URL de depuración.

## Flujo de uso

[Guía completa Windows/VSCode/LAN](../prototypes/movement-map/README.md). Node22+, terminal en la carpeta con package.json y package-lock.json:

```powershell
git fetch origin
git switch experiment/h3-4-2-movimiento-mapa
git pull --ff-only
npm.cmd ci
npm.cmd run dev:movement-map
```

**http://127.0.0.1:8776/prototypes/movement-map/**. Preparar en V9.9 → Ver mapa → elegir superviviente propio → Moverse → edificio o selector → revisar nombre/origen/destino → confirmar/cancelar. Fuera de esa fase, un edificio abre su ficha. El destino propuesto se señala con un contorno ámbar; el personaje conserva su círculo/halo de jugador. Escape cancela sin tocar la partida y devuelve el foco. En móvil se contrae la ficha durante la elección para dejar mapa disponible.

Un cambio de partida/turno/estado o un diálogo invalida la elección. Heridas, muerte, propagación de mordedura, sucesión y encrucijadas son reales. El programa vuelve al UI original para resolver sus diálogos y permite abrir el mapa actualizado después. **No confirma decisiones automáticamente.** Las resoluciones de los scripts son únicamente acciones explícitas del arnés QA sobre ese UI.

Si muere un actor se retiran su ficha, selección y destino. El resultado conserva el ID/nombre del actor original, sin atribuirlo al superviviente que ocupe luego su posición. Buscar/atacar/construir y fin de turno permanecen fuera de esta interfaz.

## Identidad y presentación

- **J1 azul `#489dff`; J2/IA rojo `#f16b70`.** Círculos, borde más grueso y halo estático al seleccionar, sin parpadeo. Etiquetas J1/J2/IA al acercar; grupo/nombre en ficha y selectores accesibles a cualquier escala. La anchura del borde se ajusta al tamaño dibujado, con contorno oscuro para nieve/techos.
- Asignación explícita provisional y única: `h0` Mara→retrato1, `h1` Leo→2, `a1` Bruno→3, `a0` Ada→4. Iris, Sol y otros IDs usan iniciales con nombre accesible. No se asignan imágenes según la posición de la lista ni se reciclan tras una muerte; un recluta nuevo conserva su ID y no hereda el retrato de un fallecido.
- La confusión observada Mara/Bruno provenía de **retratos provisionales compartidos**, no de una reasignación demostrada al compactar. Se elimina esa ambigüedad. El supuesto caso «presente en lista pero sin icono» fue descartado por el creador y **no se registra como defecto confirmado**.
- Dados con puntos para1–6 y etiqueta accesible completa;0,7,12, valores negativos/fraccionarios u otros se representan numéricamente con su valor real, sin recorte. No se inventa historial de usados. Propiedad del dado sigue siendo del turno.
- Iconos junto al texto de acciones; menos avisos técnicos repetidos, atributos base solo si difieren de los efectivos. Sin imágenes nuevas, cambios de originales o habilidades inventadas.

## Suave y Tormenta

La variante aislada mantiene configuraciones/emisores y recursos procedurales pequeños. **Tormenta inicial** salvo movimiento reducido. Nieve más densa, rápida y diagonal, ráfagas de ondas continuas con periodos no conmensurables, doce estelas sobre las tres calles ya delimitadas y algunos copos grandes de primer plano. Sin invadir fachadas ni interfaz. Suave reduce cantidad/opacidad/velocidad/deriva; no crea/destruye emisores al alternar.

Presupuesto fijo: **128 copos +18 partículas de humo +12 estelas =158**, objetos reutilizados. Suave muestra aproximadamente77 simultáneos; Tormenta157–158 según desvanecimiento de bordes. Ambas comparten el pool y las texturas procedurales existentes, **33.792bytes RGBA base estimados**, no VRAM medida. Copos de primer plano en profundidad6.8, por debajo de fichas7; etiquetas/controles no capturan entrada. Los originales y el tratamiento de texturas del kit no cambian.

Humo en chimenea de colonia(738,310); hospital continúa omitido por falta de salida inequívoca. Luces y sonido existentes preservados, audio siempre inicialmente apagado. Pausa al ocultar, delta acotado al volver y apagado total bajo demanda. Ni efectos ni audio llaman al motor por fotograma o consumen su RNG.

## Resultados

La evidencia final, capturas, mediciones y revisión crítica se registra a continuación antes de entregar. El CI se verifica sobre el head exacto del nuevo PR draft y se enlaza en su descripción, sin referencias circulares al SHA de este documento. No se atribuye a H3.4.2 un CI de la base.

### Validación local final

Node24.19.0, Chromium154.0.8037.57, Playwright1.57 externo, Linux/AMD EPYC9V74,5 procesadores lógicos. GPU informada: **ANGLE/Vulkan SwiftShader**, renderizado por software.1365×768/DPR1;393×852 y320×640/DPR2 con tacto emulado. **No hay prueba en teléfono físico.**

| Comprobación | Resultado y evidencia |
| --- | --- |
| Línea base H3.4.1 propia antes de programar |528/528; builds y [Chromium3 tamaños](evidencias/h342/base-h341-chromium.json) +[9 casos](evidencias/h342/base-h341-casos.json), aprobados. No sustituye el resultado independiente no recuperable. |
| Instalación/build | `npm ci --cache /tmp/h342-npm-cache`, check:build, build/check:movement-map, pruebas de build/servidor y diff --check aprobados. Misma dependencia/lockfile. Caché en `/tmp` por permisos del entorno; no es requisito del usuario de Windows. |
| Suite | **545/545**,0 fallos/omitidas/canceladas.17 pruebas nuevas: motor5, protocolo6, build2, identidad/dados/tormenta/nonce4. Reproducción roja previa a implementar las interfaces, conservada en evidencia. |
| Oráculo57872ee independiente | **40/40** partidas equivalentes frente al motor histórico; ambas suites sin omitidas, excluyendo únicamente metadatos de fuente como ya hacía el comparador. [JSON](evidencias/h342/oraculo.json). El motor entregado es el mismo que se comparó; CI vuelve a ejecutar el oráculo sobre el head final. |
| Equivalencia específica de movimiento | Mismos estados/RNG con `doMove` y `moveById`, incluso si el activo del motor es otro. Exposición en blanco, congelación, herida y muerte. Consulta/rechazos sin cambios de estado o RNG. |
| Capacidades y rechazo | Personaje ajeno/muerto/ya movido, destino inválido/igual, partida/turno/origen obsoletos, decisiones privadas aún no publicadas. Gasolinera real con3 permite el cuarto; con4 rechaza, independientemente de sus2 fichas visuales. |
| Nueva vista, tres tamaños | **3/3**, ratón, teclado y tacto emulado; cancelación con botón/Escape/foco restaurado, destino por edificio/selector, pan/zoom/pinza con Tormenta, doble confirmación→una ejecución y sin mover anticipadamente. Herida real, dados por turno, identidad4 únicas+iniciales, bordes/halo, cero errores normales/desbordamiento. [JSON](evidencias/h342/chromium.json). |
| Casos dirigidos Chromium | **9/9**: muerte Mara/identidad Bruno; muerte de líder/sucesión; mordedura con decisión de propagación; turno obsoleto; solicitud repetida tras reconectar; respuesta perdida y consulta sin reenvío; movimiento reducido/pausa/apagado; movimiento propio J2 y bloqueo de segundo movimiento; producto sin QA, confirmación por Enter y `randomUUID` ausente. [JSON](evidencias/h342/casos-limite.json). |
| Limpieza/reinicio | Tres reinicios por tamaño, una instancia/contexto; misma partida/RNG/conexión al host. Al desmontar:0 contextos/objetos GL vivos y0 ResizeObserver targets. Solicitud repetida tras reconexión no modifica snapshot/RNG. |
| Efectos y azar | Misma partida y secuencia aleatoria con Tormenta activa y vista V9.9/efectos apagados. Cambiar perfiles, cancelar, seleccionar, pan/zoom/audio no mutan el juego. Pool permanece158; apagado0 renders continuos. |
| Privacidad/producto | Bundle de mapa sin `src/`; host con motor real sin Phaser; producto sin `h342Test`, `moveMessage`, `h342DropReply` o testBindings. QA no servido por defecto ni por LAN. Rutas anteriores conservadas. |

Las pruebas de pausa de esta nueva escena usan un cambio **controlado** de `document.hidden` y `visibilitychange`; headless no certifica el cambio nativo de visibilidad ni el consumo de un teléfono. La reconexión de solicitudes se prueba con eventos de ciclo de vida controlados sobre canales reales. El CI conserva además el gate previo de Atrás de H3.4.1, que registra explícitamente si hubo bfcache real: no se confunden estos casos.

### Coste medido de Suave/Tormenta

Pruebas **secuenciales**, misma cámara/partida/DPR/tamaño,700ms de calentamiento y dos ventanas de2s por perfil. Contador POST_RENDER y reloj se capturan juntos al comenzar/terminar; la grabación se realiza aparte. TaskDuration de CDP mide tareas del proceso renderer, **no GPU, CPU total ni VRAM**. Ventanas cortas y ruido de instrumentación; no prueba de rendimiento sostenido en móvil.

| Viewport | Apagado renders/s | Suave renders/s | Tormenta renders/s | Tareas renderer Suave ms/s | Tareas renderer Tormenta ms/s |
| --- | ---: | ---: | ---: | ---: | ---: |
|1365×768/DPR1|0|29,76|29,87|755,6|880,2|
|393×852/DPR2 emulado|0|29,49|30,55|903,6|955,5|
|320×640/DPR2 emulado|0|30,00|29,98|457,5|582,2|

[Mediciones completas](evidencias/h342/rendimiento.json) · [Resumen calculado](evidencias/h342/resumen-mediciones.json). Tormenta cuesta más en este entorno, aunque ambas se acercan al límite nominal30FPS. El coste por software es considerable; no se promete que un teléfono mantenga ese rendimiento. Suave/apagado se mantienen como opciones reales. Ambas reservan158 partículas y193 objetos de escena en esta partida de prueba; visibles76–77 en Suave y156–158 en Tormenta al medir. La estimación de33.792bytes corresponde solo a las texturas procedurales base, **no al kit completo**, que mantiene el coste ya registrado en H3.3.

La grabación inicial no encontró el FFmpeg de Playwright; se instaló como herramienta externa en una caché temporal. No se añadió al producto, al lockfile ni a los comandos normales del usuario.

### Capturas y secuencia temporal inspeccionadas

- [Vista general, Tormenta](evidencias/h342/1365-general.png).
- [Nombre/origen/destino y confirmación, escritorio](evidencias/h342/1365-confirmar-hospital.png).
- [393 emulado](evidencias/h342/393-confirmar-hospital.png) · [320 emulado](evidencias/h342/320-confirmar-hospital.png).
- [Herida real tras movimiento](evidencias/h342/1365-herida-real.png).
- [Mara fallecida, Bruno con su identidad propia](evidencias/h342/mara-fallecida-bruno-estable.png).
- [Tormenta instante0](evidencias/h342/tormenta-tiempo-0.png) · [instante posterior](evidencias/h342/tormenta-tiempo-2.png).
- [Video corto de8s, grabación real recortada](evidencias/h342/tormenta-8s.webm). Sirve para la revisión de movimiento; capturas y código de trayectorias no sustituyen la evaluación perceptual del creador.

### Segunda revisión crítica propia

Se revisaron selección frente a identidad, autoridad/consultas impuras, secuencia de exposición y decisiones, revisión de partida, repetición/desconexión, privacidad, límites de partículas, foco, geometría móvil y recursos. **No equivale a una revisión humana independiente ni a aprobación visual final.**

Defectos nuevos confirmados durante esta entrega:

1. El planificador heredaba la fila1fr del taller y reducía el mapa a una franja. [Antes](evidencias/h342/antes-planificador.png), [prueba roja](evidencias/h342/rojo-planificador.txt). Se pasó el sector a una columna flex y se exige≥160px de canvas durante la confirmación; en móvil se contrae la ficha y cancelar recupera panel/foco.
2. Una segunda desconexión pasaba de resultado desconocido a idle antes de consultar. [Prueba roja](evidencias/h342/rojo-doble-desconexion.txt). Se mantiene unknown, bloqueando cancelar/nueva intención hasta recibir el estado actualizado. Caso real de respuesta perdida probado sin duplicar el movimiento.

Ajustes de prueba, sin cambiar reglas: el arnés esperaba confirmación de muerte antes de elegir propagación de mordedura, pero el flujo real muestra primero esa decisión; se corrigió el arnés. También esperaba idle al reconectar con una encrucijada pendiente: ahora resuelve esa decisión por el UI original antes de exigir consulta completa. La contracción de la ficha exigió recuperar foco al cancelar, comprobado con teclado. [Registro de verificaciones](evidencias/h342/verificaciones.json), [rojo de API](evidencias/h342/rojo-engine.txt), [rojo del protocolo](evidencias/h342/rojo-protocolo.txt).

### Commits, preservación y CI

Primer commit acotado de motor/prueba/registro: **`83d04152725c66f471642b0c017ae89592c88571`**. La implementación visual/protocolo está en el commit posterior `5f2c7ef`; el head completo entregado y sus runs/artifacts se registran en el nuevo PR draft contra H3.4.1. La documentación posterior es evidencia de esta implementación, no una modificación de la referencia estable.

Fuentes de H3.4.1, H3.3, H3.2 y Canvas, PNG originales, reglas/datos/IA/turnos/SP-03 y lockfile sin cambios. Único ajuste al motor: consulta/ejecución acotada y extracción compartida ya descritas. Bundles anteriores reconstruidos con hashes idénticos:

```text
H3.3 mapa  2fabef6fc8fc4e4bbd88729454c7dfee105838dfd203b0badc5767655d7d5d72
Taller     265c882ad84347168be8df5a1d9ce421d5a1845b1d3948fe0bd683e6401454a7
H3.2       7e7b90ab465bc4b7113ffb20c4c0780a9c0e9d0db1d0cfab83659b46632f5e54
```

El workflow nuevo `h3-4-2-movement-map.yml` usa checkout del **head exacto**, Node22, instalación reproducible, suite y oráculo; reconstruye/checkea todas las entradas; ejecuta los dos gates H3.4.1 contra el motor entregado, los dos nuevos H3.4.2 y la medición/video secuencial. Artifacts y logs se descargan/verifican antes de informar CI aprobado; su evidencia final queda enlazada en la descripción del PR. El CI histórico de los siete gates visuales H3.3 sobre064f47cc se conserva como evidencia de esas fuentes/bundles intactos, **no como validación del nuevo movimiento**.

## Resultado y reservas

Entrega H3.4.2 para revisión: movimiento identificado y confirmado desde el mapa, consecuencias reales y decisiones en V9.9, identidad sin retratos repetidos, perfiles de ventisca y presentación recuperada. Cancelar y explorar no cambian la partida. Rechazos, conexiones y respuestas desconocidas se tratan sin reenvíos automáticos.

Pendiente: revisión del creador del flujo y la intensidad artística de Tormenta, teléfono físico, nitidez al ampliar y coste en GPU real. No se adoptó un nuevo renderer ni se fijaron capacidades artísticas, mapa horizontal o arte definitivo. No hay persistencia añadida; recargar todo el documento conserva el comportamiento de inicialización anterior, no un guardado de la partida.

**Única siguiente tarea:** revisión del creador de H3.4.2 y de su video. Se detiene esta entrega; no buscar/atacar/construir/finalizar turnos desde el mapa, no merge y no avance automático.
