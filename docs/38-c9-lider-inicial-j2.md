# 38 — C9/#6: liderazgo inicial simétrico para J1 y J2 (política A)

**Fecha:** 27/10/2026 · **Rama:** `fix/estabilizacion-v9-9` · **PR:** [#14](https://github.com/LeviEdition/invierno-en-la-colonia/pull/14), **abierto/draft** base `refactor/arquitectura`. **Estado:** corrección implementada, rojo→verde verificado, CI verde y cinco controles Chromium aprobados; **issue #6 permanece abierto hasta revisión crítica y aceptación**. `main` intacta.

## Política expresamente aprobada

El creador dijo: **«Para el issue #6 apruebo la política A: J1 y J2 deben confirmar su líder inicial antes de realizar las acciones que bloquean la elección.»**

**Interpretación consistente con la mecánica previa de J1:** durante la primera ronda se puede **elegir el líder inicial antes** de (1) gastar con éxito un dado, (2) mover válidamente un superviviente, o (3) usar con éxito una carta **desde el inventario**. Si no se elige explícitamente, la primera acción válida confirma al líder inicial predeterminado; la opción de cambiarlo desaparece. **El bloqueo recae solamente sobre el controlador que actuó**: J1 no modifica `localLeaderChosen` de J2; J2 no modifica `leaderChosen` de J1. La primera acción inválida (dado insuficiente, mismo destino, uso de combustible fallido) **no confirma** al líder.

No cambia el régimen de sucesión **por muerte del líder**, que permite escoger reemplazo cuando corresponde incluso después de la primera acción. No se amplió la definición a actos que ya no bloqueaban el liderazgo de J1 (por ejemplo usar una habilidad activa gratuita, equipar desde la ficha, donar a crisis, etc.). Ese posible debate de diseño queda fuera de C9: la política A aprobada era **igualar a J2 con las tres rutas de bloqueo existentes de J1**, sin redefinir todas las acciones del juego.

## Línea de base y pruebas primero (red)

En el HTML previo, `canPickStartingLeader()` ya utilizaba correctamente `game.leaderChosen` para J1 y `game.localLeaderChosen` para J2 local, pero `consume()`, `doMove()` y `playItem()` marcaban siempre el flag **de J1**, incluso cuando actuaba J2.

Se convirtió el único `test.todo` de `tests/finales-lideres.test.mjs` (#6) en **12 pruebas activas** ([commit `ffd14ca`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/ffd14ca2b74148f1cc83692956aa373b28dedc5c)). Cobertura: J1 y J2 gastar dado, mover, usar carta; fallo de dado insuficiente, movimiento inválido, carta rechazada; elección explícita J2 antes de actuar; restricción después de ronda 1; contenido de UI para ambos.

[GitHub Actions rojo 40591148076](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40591148076): **331 declaradas / 327 aprobadas / 4 fallidas / 0 TODO**. Fallaron justo los caminos J2 con dado/movimiento/carta y la instrucción de UI desactualizada. Los demás 8 casos nuevos pasaron.

## Corrección mínima aplicada

[Commit `38e7ac8`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/38e7ac87832e4ca02dbf277dcc1a8acb56ce2849) modifica solamente `invierno_colonia_v9_9.html`:

1. Introduce `confirmStartingLeader()`, que determina la bandera por `controls.side`: `leaderChosen` para J1 y `localLeaderChosen` para J2 cuando `game.mode==='local'`.
2. `consume()` la llama solo cuando efectivamente consume dado; `doMove()` solo tras pasar sus validaciones; `playItem()` solo si `itemEngine.use()` devuelve éxito.
3. En menú «Grupo y líderes», aclara: **«Durante la primera ronda podés elegir tu líder inicial antes de gastar un dado, moverte o usar una carta.»** La UI deja de mostrar botones «Elegir líder» una vez confirmada la elección del jugador del turno. Las elecciones de sucesor al morir un líder se conservan en su flujo separado `pendingLeader`.

**No** se modificaron reglas de IA, crisis, transferencias, objetos, rondas, `main` ni PR; el código sigue sin fusionar.

## Validación verde

[GitHub Actions 40591238120](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40591238120), commit `38e7ac87832e4ca02dbf277dcc1a8acb56ce2849`: **331 declaradas / 331 aprobadas / 0 fallidas / 0 TODO / 0 skipped**. Pasaron las 12 nuevas regresiones C9 y todas las previas.

**Chromium / Playwright real:** se partió del HTML UX previo cuyo Git blob era `4748627825e9876809ec482cb7c10431e6c07cf9`, aplicando exactamente las cinco sustituciones C9. El `git hash-object` del archivo reconstruido resultó **`b5b9f2020c5abb73fd95e0f7441db088bb746d16`**, igual al blob del HTML de C9 leído del conector GitHub. Se cargó el documento con `page.set_content()` (restricción de `file://`) y se probaron **5 recorridos con botones reales**, sin errores `pageerror`:

| Escenario | Preparación → interacción → comprobación |
| --- | --- |
| UI1 J1 + dado | Partida local, menú «Grupo y líderes» muestra 2 botones «Elegir líder» y explicación; tras usar «Barricada» con un dado de 6 desde «Acciones», se marca solo J1 y desaparecen sus botones |
| UI2 J2 + dado | J1 termina turno desde menú y confirma **pantalla de pase real**; en viewport móvil táctil simulado 393×852, J2 ve sus dos candidatos, luego usa «Barricada» con 6 y desaparece la opción; J1 no quedó marcado |
| UI3 J2 + acción rechazada | Tras pase, intentar «Mover» al mismo destino devuelve aviso «Elegí otro destino»; J2 conserva posibilidad de seleccionar líder y ambos flags intactos |
| UI4 J2 + carta | Tras pase, J2 usa ración desde «Objetos»; se consume, se marca solo `localLeaderChosen`, no hay botón «Elegir líder» |
| UI5 J2 + elección voluntaria | Tras pase, J2 elige «Ada» desde el menú antes de actuar, queda líder `a0` y se impide segunda elección |

Se capturaron vistas locales de J2 antes y después de confirmar mediante dado (`c9-j2-antes.png`, `c9-j2-despues.png`) en el entorno de validación. **Son escenarios con estados preparados determinísticamente** (dado 6, limpieza del estado de encrucijada si corresponde), no partidas completas ni prueba Android físico.

## Riesgos y siguiente tarea única

**Límites:** no se hicieron partidas completas aleatorias, pruebas de lector de pantalla o teléfono Android físico. Las acciones que **ya no bloqueaban a J1**, como habilidad especial gratuita/equipar desde ficha/donar a crisis, no fueron incluidas en C9: su eventual unificación sería decisión de diseño nueva, no parte del bug #6 aprobado. El bloqueo por muerte/sucesión se conserva y las regresiones existentes pasan.

**Estado:** C9 implementada con CI verde y cinco escenarios Chromium aprobados, **pero falta revisión crítica posterior independiente**, aceptación del creador y eventual cierre administrativo del issue #6. PR #14 sigue draft; `main` sin cambios. La auditoría de avisos sigue estacionada para pulido al final de la Etapa C.

**Próximo paso único recomendado:** revisión crítica posterior de C9/#6 (sin cerrar issue, sin fusionar PR, sin abrir otro issue de desarrollo).
