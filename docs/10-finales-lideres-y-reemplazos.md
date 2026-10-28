# 10 — Victorias, derrotas, líderes y reemplazos (auditoría V9.9)

**Versión estudiada:** `invierno_colonia_v9_9.html` · **Rama:** `refactor/arquitectura` · **Fecha:** 27/10/2026.

Se ejecutó el código original en Node.js mediante `node:vm`, aislando solo la presentación del navegador. No se modificó ninguna regla de la V9.9.

## 1. Cómo termina una partida

`verify()` revisa las condiciones en **este orden**, siempre que `game.ended` sea falso:

1. `replaceLastSurvivors()`: intenta recuperar los equipos sin personajes vivos.
2. **Derrota por moral:** si `game.morale <= 0`, termina la partida.
3. **Derrota por falta de supervivientes:** si `game.noReplacement` o falta un equipo vivo (fuera de una mordedura en resolución), termina la partida.
4. **Victoria por objetivo:** si `game.samples >= game.goal`, termina la partida.

Cuando acaba, `game.ended=true`, `game.turn='end'` y se desactivan decisiones pendientes de mordedura y líder.

**Regla que requiere confirmación de diseño:** si las muestras alcanzan el objetivo pero la moral vale cero, gana **la derrota** debido al orden anterior. Eso es lo que hace la V9.9; las pruebas no determinan si esa prioridad es la mejor para el videojuego.

La derrota por agotamiento de rondas se controla en `finishTurn()`, después de completar la fase de colonia. Ya estaba cubierta en bloques anteriores.

## 2. ¿Qué ocurre si muere el último superviviente?

`replaceLastSurvivors()` no declara la derrota de inmediato. Por cada grupo que quedó sin supervivientes vivos:

1. Descarta las cartas de su mano (sin agregarlas a los residuos).
2. Intenta `recruit(side, true)`, un **reclutamiento de emergencia**.
3. Primero busca un lugar en la colonia. Si está llena, intenta colocar el reemplazo en otra localidad con espacio.
4. Si no hay personajes nuevos disponibles en `roster` o no hay ninguna plaza disponible, establece `game.noReplacement=true`.
5. `verify()` declara la derrota si no es posible reemplazar.

Este proceso es diferente del reclutamiento normal mediante cartas de rescate: ese reclutamiento exige una plaza en la colonia.

## 3. Rescates que esperan una plaza

`processRescueQueue()` examina `game.rescueQueue`. Si la colonia sigue llena, el rescate espera; cuando hay una plaza disponible, intenta incorporar al siguiente superviviente de la cola.

**Acoplamiento relevante:** `paint()`, la función que dibuja la interfaz, llama a `processRescueQueue()`. En la refactorización habrá que trasladar este avance de la cola a una transición explícita del motor; el renderizado no debería modificar el estado.

## 4. Liderazgo

- `game.leaders` conserva los IDs del líder humano y del segundo grupo.
- J1 puede escoger un líder inicial durante la primera ronda, mientras no se haya bloqueado esa decisión.
- En modo local, J2 dispone de su propia selección inicial.
- Si muere el líder humano y quedan al menos dos miembros vivos, `reviewLeader()` deja una selección de sucesor pendiente.
- Cuando queda un solo miembro vivo, puede designarse automáticamente.
- En modo humano + IA, el sucesor de la IA es el superviviente vivo con **mayor influencia**.
- En modo local, J2 elige a su sucesor manualmente.

**Defecto confirmado:** las acciones que fijan la elección inicial de líder actualizan `game.leaderChosen` incluso cuando actúa J2, pero su disponibilidad depende de `game.localLeaderChosen`. Por ello J2 puede seguir eligiendo líder después de actuar, mientras J1 no puede hacerlo.

Seguimiento: [#6 — liderazgo inicial inconsistente en modo local](https://github.com/LeviEdition/invierno-en-la-colonia/issues/6). **No corregido:** primero debemos definir cuándo debe cerrarse la elección inicial para ambos jugadores.

## 5. Muestras de investigación

- Una muestra normal aporta 1 al objetivo general.
- Un personaje con habilidad de investigación (`researcher`) puede aportar **2 por la primera muestra** que obtiene; sus siguientes muestras cuentan normalmente.
- Al usar una muestra que llega a la meta, `playItem()` llama a `verify()` y termina la partida.

## 6. Pruebas incorporadas

`tests/finales-lideres.test.mjs` contiene **30 pruebas ejecutables** que verifican:

- Partida activa, victoria por objetivo y objetivo sobrepasado.
- Derrota por moral, condición simultánea de victoria y derrota, y verificación idempotente.
- Habilidad de investigación y entrega de muestra ganadora.
- Elección inicial de líderes para J1 y J2, restricciones, sucesión humana y automática.
- Muerte del líder y elección de sucesor de ambos grupos.
- Reclutamiento de emergencia y descarte de mano al quedarse sin supervivientes.
- Colonia llena, reemplazo en localidad exterior, falta total de espacio y roster agotado.
- Rescates en espera e incorporación cuando se libera una plaza.
- Cancelación de selección de líder tras perder y protección contra doble pérdida de moral por matar dos veces al mismo personaje.

Incluye además **1 `test.todo()`** para la inconsistencia de liderazgo (#6). No fijamos un comportamiento potencialmente incorrecto como contrato de regresión.

### Verificación

GitHub Actions ejecutó la suite completa con Node.js 22:
- **151 casos registrados**
- **148 pruebas aprobadas**
- **0 fallidas**
- **3 TODO** (#4, #5 y #6)

[Ver ejecución verificable](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40502905923).

## 7. Qué falta antes de modularizar

- Encrucijadas narrativas completas y decisiones de la IA.
- Líderes y rescates en secuencias con modales visuales reales.
- Sesiones completas en navegador de escritorio y en celular.
- Decidir y corregir por separado las incidencias existentes (#2 a #6), después de acordar las reglas.

## 8. Próximo paso

**Auditar encrucijadas narrativas**: activación por movimiento, búsqueda y combate; opciones disponibles, efectos sobre la partida, decisiones del segundo jugador y de la IA, y estados pendientes. Es especialmente importante por el defecto [#2](https://github.com/LeviEdition/invierno-en-la-colonia/issues/2) de detección de cartas.
