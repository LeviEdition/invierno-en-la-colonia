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
