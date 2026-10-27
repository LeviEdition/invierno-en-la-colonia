# 39 — Revisión crítica de C9 y corrección C9-R1: sucesión en el turno del propietario

**Fecha:** 27/10/2026 · **Rama:** `fix/estabilizacion-v9-9` · **PR:** [#14](https://github.com/LeviEdition/invierno-en-la-colonia/pull/14) abierto/draft, base `refactor/arquitectura` · **main:** `d9068f4aa8d3a10bbbf1e0a8a2527744cc6952cb` intacta · **Issue #6:** abierto a la espera de aceptación/cierre, no publicado en `main`.

## Decisión de mecánica de líder

El creador confirmó **mantener la elección manual de líderes al estilo de *Dead of Winter***, en lugar de forzar automáticamente al humano con mayor influencia. Se conserva C9 política A: durante ronda 1 los jugadores J1 y J2 pueden elegir líder inicial antes de gastar un dado, moverse o usar una carta con éxito; la primera de estas acciones válidas confirma el líder predeterminado si no se eligió expresamente. Una acción inválida no confirma líder. Tras morir un líder humano se elige manualmente al sucesor cuando corresponda; **la IA** selecciona automáticamente al de mayor influencia. Un único superviviente vivo se designa sin menú por necesidad.

## Revisión crítica original de C9

Se revisaron `chooseLeader`, `reviewLeader`, `confirmStartingLeader`, `canPickStartingLeader`, `kill`, `finishTurn`, `confirmPass`, modales y los tests C9. Se ejecutó en **Chromium/Playwright** el HTML C9 de Git blob **`b5b9f2020c5abb73fd95e0f7441db088bb746d16`**, idéntico al de GitHub antes de R1:

- **Cinco recorridos de sucesión aprobados**, con botones de interfaz: J1 eligió líder de influencia inferior (Leo), luego su sucesor Iris tras morir; J2 local eligió al de menor influencia (Sol), luego sucesora Ada en viewport móvil; IA eligió automáticamente Ada al morir Bruno; sustitución automática cuando solo queda un personaje; y sucesión manual tras muerte en ronda 2, incluso estando bloqueada la elección *inicial*.
- **Defecto P2 confirmado**, independiente de la marca de primera acción: si el líder de **J2 muere en turno de J1**, la ventana de elección de J2 se abre **en la pantalla de J1** y J1 puede pulsar «Sol» para nombrarlo sucesor sin realizar el pase de dispositivo. Esto viola la elección manual por el controlador y puede revelar una decisión destinada a J2. Reproducción controlada en Chromium real con `kill(game.bots[1], ...)`, pantalla de duelo «Continuar» y elección «Sol» durante `game.turn='human'`; el estado original cambió a `game.leaders.ai='a2'` y limpió `pendingLeader`. La muerte se inyectó para controlar el escenario; el menú y la elección son de la UI real.

## Regresiones antes del arreglo (rojo)

[Commit tests `ed817b5`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/ed817b59825268c54aa1f183c783f19af3189c83), `tests/finales-lideres.test.mjs`: **cinco regresiones activas** para prohibir que J1 elija sucesor de J2 y viceversa, permitir que J1 continúe moviéndose mientras espera la decisión de J2, conservar la elección inicial de J1 aunque exista sucesor de J2 pendiente, y mostrar el selector de sucesión solo en el turno de su dueño.

[CI rojo 40593244756](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40593244756): **336 declaradas, 331 aprobadas, 5 fallidas (las cinco nuevas), 0 TODO**. Este rojo constata el problema de C9-R1; las 331 anteriores siguieron aprobadas.

## Corrección acotada C9-R1

[Commit `e84db6a`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/e84db6ae088f314e232e377c15cda37683cce19b):

- Nueva **`leaderChoiceReady()`**: en modo local solo resuelve `pendingLeader` cuando el turno y la pantalla de pase corresponden al propietario `pendingLeaderSide`. Se conserva la prioridad anterior del selector en modo humano+IA.
- **`chooseLeader()`** distingue elección inicial del turno activo y sucesión realmente habilitada; elegir el líder del propio J1 **no limpia** el sucesor pendiente de J2. Una llamada directa a `chooseLeader('a2')` en turno de J1 ya no decide por J2.
- Se aplica el criterio de disponibilidad al mostrar, ocultar y confirmar modales, `confirmPass()`, `paint()` y `finishTurn()`. Se deja terminar el turno de J1 y mostrar la pantalla **«Pasale el dispositivo al Jugador 2»**, y solo **después del pase** aparece su menú de sucesión.
- Las acciones normales de J1 (gastar dado, buscar, atacar, moverse, usar carta) dejan de bloquearse por un sucesor pendiente **de J2**. No cambia la protección que impide actuar al dueño hasta resolver **su propia** sucesión.
- **No** se cambió la selección por mayor influencia de la IA, la elección manual del líder inicial, los requisitos de éxito para confirmar líder, ni la sucesión por muerte del líder del turno.

**CI verde [40593438595](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40593438595): 336 declaradas, 336 aprobadas, 0 fallidas, 0 omitidas y 0 TODO.**

## Validación Chromium posterior C9-R1

Archivo local del parche con `git hash-object` **`2682f96f0d451eb0083fd9eaa3762b266f8aab60`**, idéntico al Git blob leído de la rama en GitHub. Se cargó en Chromium real por `page.set_content()`, ya que `file://` no está habilitado en este entorno.

**Tres escenarios de interfaz adicionales aprobados sin errores JavaScript:**

1. **J2 pierde al líder en turno de J1, con pantalla móvil simulada 393×852:** tras el duelo, J1 no ve el selector de sucesor de J2. J1 **puede elegir su propio líder inicial** (Leo) y mover un personaje válido. Luego termina turno mediante el botón, aparece la **pantalla real de pase J1→J2**, J2 pulsa «Comenzar turno», aparece **su** selector y puede elegir manualmente a Sol (influencia menor). Verificado `turn='ai'`, `leaders.human='h1'`, `leaders.ai='a2'`, `pendingLeader=false`, pase completado. Para evitar exposición aleatoria en el escenario acotado se preparó `skill='silent'` en el personaje que se movió. No se fingió el pase.
2. **Muerte del líder de J1 en su turno:** sigue apareciendo selección inmediata del sucesor y se puede elegir Iris, aun después de tener bloqueada la elección inicial.
3. **IA pierde a Bruno:** elige automáticamente a Ada, superviviente IA disponible con mayor influencia. No se presenta el selector humano.

**Alcance de la cobertura:** 5 recorridos de C9 iniciales (informe38) + 5 verificaciones positivas de revisión crítica antes de R1 + 3 escenarios positivos posteriores = **13 escenarios aprobados y el defecto cruzado reproducido**; no equivalen a partidas completas ni se suman automáticamente al contador del CI. Sin pruebas Android físico o lector de pantalla (no obligatorias para esta corrección).

## Reservas y decisión

- **Reserva a vigilar en revisión global, sin afirmar cobertura completa:** `pendingLeader` es un único estado global. Si mueren **dos líderes de grupos distintos antes de resolver el primero**, el código podría requerir una cola de sucesiones. La presente corrección está focalizada en una muerte de líder por vez; no se probaron exhaustivamente múltiples muertes simultáneas ni todos los cruces entre mordeduras, encrucijadas y cambios de ronda. No hubo nueva regresión observada dentro de los escenarios descritos.
- No se han revisado en esta etapa todos los avisos de intentos inválidos de interfaz; esa auditoría quedó estacionada para el pulido de etapa C.
- Se preservó la preferencia del creador de **una tarea activa a la vez**: no se inicia la tarea #7 ni se fusiona código con este informe.

**Dictamen:** C9 política A y C9-R1 están implementadas y verdes; el defecto P2 descubierto en la revisión posterior fue reproducido, corregido con regresiones rojo→verde y comprobado en Chromium. **Siguiente paso único recomendado:** pedir **aceptación funcional y cierre administrativo de #6**, sin fusionar el PR #14 ni modificar `main`. Mantener como reserva el caso de muertes simultáneas para el cierre global de estabilización y, si se confirma, abrir seguimiento separado con autorización.
