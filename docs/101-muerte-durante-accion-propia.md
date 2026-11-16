# 101 — Muerte durante una acción propia: la partida ya no se traba

16/11/2026. Rama `experiment/mapa-horizontal-ambientacion-h3`, [PR25 en borrador](https://github.com/LeviEdition/invierno-en-la-colonia/pull/25). Inicio en `6824a7b`, árbol limpio.

## Problema

En la prueba manual, Mara atacó en el Hospital, eliminó un zombi y la exposición fue mordedura: murió. El panel «Ataque de Mara» decía «☣ Mordedura Falleció; continuá para resolver sus consecuencias.» y el botón «Resolver decisión» no hacía nada. Como «Terminar turno» seguía deshabilitado, la partida quedaba trabada.

## Causa verificada

Lo reproduje en Chromium con el caso de Mara antes de corregir:

- La operación de ataque queda abierta con `generalDecision`. El broker del ciclo la trata como resultado delegado y deja `cycle.managed=false`, aunque `cycle.decision` sea `death`.
- Con el director de muertes activo, la decisión del panel de juego es `null` (`play.managed=false`).
- `showDecision()` abría igual `play.open('decision')`. Ese panel quedaba sin contenido, pero como su fase ya no era `closed`, marcaba al panel del ciclo como «competing» y lo ocultaba.
- El controlador del ciclo solo pasaba a `showing` con `managed` o `review`. Además, el panel del resultado seguía visible, porque una operación con decisión general no puede cerrarse, y también ocultaba al panel del ciclo.

La ruta de movimiento (`resolve-decision`) tenía el mismo defecto: abría el panel de juego vacío por encima del ciclo.

## Corrección (solo interfaz)

- `showDecision()` ahora elige ruta según la decisión real. Si el panel de juego tiene decisión (mordedura, encrucijada, etc.), la muestra ese panel, como antes. Si no, y el ciclo tiene una decisión, se le pide al ciclo que la atienda (`cycle.attend()`). El panel de juego ya no se abre sin decisión.
- El controlador del ciclo mantiene esa atención mientras la cadena siga abierta: mordedura → fallecimientos → sucesión. Muerte (`death`) y sucesión (`leaderChoice`) se muestran aunque una acción propia siga abierta. La atención termina cuando ya no queda ninguna decisión.
- Mientras se atiende una muerte o una sucesión, el resultado de la acción queda detrás y la vista usa la proyección pública de esa acción, para que la cabecera no se vacíe. Al terminar vuelve el resultado, que ya puede cerrarse, y aparece el aviso habitual.
- La mordedura sigue abriéndose sola en el panel de juego. Al cerrar «Contagio resuelto», los fallecimientos pasan al ciclo sin volver al botón.

No cambian el motor, las reglas, los costes, el azar ni el orden de las decisiones. Los comandos son los mismos de siempre: `cycle-death`, `cycle-leader` y `bite`.

## Textos

- Si lo siguiente es solo confirmar una muerte, el botón dice **«Ver qué pasó»**; si hay una elección, como mordedura o sucesión, sigue diciendo «Resolver decisión». Aplica al ataque, al movimiento y al inventario.
- Resultado: «Mara eliminó 1 zombi, pero murió por la mordedura.». Con tres daños acumulados, «…pero murió por el daño acumulado.».
- Aviso sobre el mapa: «Mara eliminó 1 zombi en el Hospital, pero murió por la mordedura.». Antes decía «en su localidad», porque la proyección bloqueada no traía las localidades.
- Usé «murió por la mordedura» en vez de «la mordedura la mató», para no tener que inferir el género de cada superviviente.

## Pruebas

- **Unitarias/contrato** (`tests/map-death-decision.test.mjs`, motor real):
  - Con un fallecimiento pendiente, la ruta de decisión entrega una decisión visible y confirmable.
  - La doble confirmación no reenvía.
  - Confirmar no consume azar.
  - Al terminar, «Terminar turno» vuelve a estar disponible.
  - Sucesión tras la muerte de la líder.
  - Contagio: mordedura → recibo → fallecimientos.
  - Textos.
- **Navegador** (`scripts/check-map-death-decisions-browser.mjs`, sumada al workflow): cuatro casos en 1365×768 y 393×852. En cada caso se comprueba:
  - texto del botón y del resumen;
  - que no quede ningún panel vacío;
  - que la doble pulsación no cambie la partida;
  - lista de fallecimientos;
  - cabecera con datos;
  - azar sin consumo extra;
  - muertes exactas;
  - sucesión aplicada;
  - cierre del turno con pase sin mano, dados ni registro visibles, hasta el turno del grupo 2.

  Los cuatro casos:
  - atacante solo (caso de Mara);
  - contagio con otro superviviente en la localidad;
  - muerte del líder con sucesión;
  - muerte por movimiento.

  Fixtures QA declarados: posición, zombis, dados y `Math.random=0`.
- `tests/map-feedback-camera.test.mjs` esperaba el texto anterior («falleció»); ahora espera «, pero murió».

Resultado local: `npm test` con 741/741. Las baterías de navegador del workflow se corrieron localmente contra el servidor QA; su resultado está en la descripción del PR. El CI del PR es la fuente de verdad.

## Falta probar jugando

Repetir el caso de Mara en escritorio y en el Samsung Galaxy A15. Probar además una mordedura que contagie a un superviviente y la muerte del líder, en partida contra la IA y entre dos jugadores locales.
