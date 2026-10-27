# 31 — Revisión crítica posterior de C7 / Issue #5

**Fecha:** 27/10/2026 · **Etapa:** C, estabilización · **Rama revisada:** `fix/estabilizacion-v9-9` en `9907cdb3e4892145f4806752f8e21df1f354b510` antes de este informe · **PR:** [#14](https://github.com/LeviEdition/invierno-en-la-colonia/pull/14), borrador/base `refactor/arquitectura`. [Implementación y pruebas originales C7](30-correccion-c7-ia-herramientas.md). `main=d9068f4` y V9.9 original intactos al comienzo de la revisión.

## Alcance y evidencia realmente disponible

Relectura **posterior y crítica** del HTML real y `tests/ia-turnos.test.mjs`, contratos de `ItemCatalog`, `ItemEngine`, `CrisisManager.add`, `beginSearch`, `stashLoot`, `botTurn`, `botContributeTools`, `resolveCrisis` y `finishTurn`. Se verificaron PR, `main`, issue #5 abierto y ejecución [CI 40572758503](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40572758503), completada con éxito sobre `9907cdb3`: **297 tests declarados, 295 aprobados, cero fallidos/cancelados/omitidos y 2 TODO (#4 y #6)**.

**Método:** inspección estática contrastada con la suite remota ya ejecutada y sus regresiones; **no** se añadieron ni ejecutaron casos nuevos durante esta revisión. No se ejecutó Chromium, Android físico, TalkBack, partidas naturales, ni un nuevo ensayo específico de los escenarios de esta revisión. «Confirmado por lectura de código» no equivale a «reproducido dinámicamente». No se solicitó revisión de otro agente o revisor externo.

## Comprobaciones positivas de la corrección acotada

- `botContributeTools()` se invoca al finalizar el bucle de acciones y búsquedas, antes de `colony()`, para modo humano + IA. `finishTurn()` omite colonia si ya terminó la partida.
- Cuenta contribuciones previas humanas mediante `contributions`; si mano + equipamiento de vivos IA alcanza el faltante, usa primero la mano y después equipo en orden de supervivientes/arrays. Los aportes admitidos pasan por `CrisisManager.add()` **antes** de retirar cada objeto; no usa mano ni equipo humanos, no dona extras y no interviene tras la victoria.
- Si el faltante supera lo disponible, conserva las herramientas. Dado el orden humano → IA → colonia, un aporte parcial insuficiente de IA no puede recibir un aporte posterior del humano en esa misma ronda; sí puede completar uno previo.
- La exclusión de herramientas del bloque temprano no modifica la rama de aportes de comida, medicina y combustible. Las diez regresiones C7 y las previas figuran verdes en el CI señalado. **No se halló por esta inspección una regresión introducida dentro de la ruta de donación de herramientas**, sin convertirlo en certificación general.

## Hallazgo H1 — Prioridad cooperativa no llega a elegir el botín (P2, diferencia de estrategia)

**Precondición posible:** crisis de herramientas 0/2 sin contribuciones humanas; un superviviente IA tiene **linterna equipada** y ninguna otra herramienta propia. Su búsqueda revela `sample` y `crowbar` con la capacidad de la linterna (una sola búsqueda/dado; objetivo de muestras todavía lejos). **Acción:** `beginSearch(p,'ai')`.

**Esperado si «salvar la crisis cuando sea posible» rige también la elección de botín:** tomar la palanca; junto con la linterna, `botContributeTools()` tendría las dos herramientas para completar la crisis.

**Observado por inspección estática:** en el HTML `beginSearch()` usa puntuación fija `muestra:10` frente a `herramienta:3` y elige la muestra, devolviendo la palanca al mazo. Después `botContributeTools()` cuenta solo la linterna (1/2) y la conserva, por lo que `resolveCrisis()` aplica el fracaso. El código existente implementa esa secuencia de manera determinista; **no se corrió el escenario integral como nueva prueba**.

**Evaluación:** la donación C7 es consistente con su alcance estricto, pero la prioridad cooperativa expresada por el creador queda incompleta en el subsistema de búsqueda/elección. No cambiar sin una regla concreta sobre conflicto entre cumplir crisis, obtener muestras y ganar inmediatamente la partida. Propuesta mínima para decidir: ante opciones de botín reveladas, favorecer la herramienta **solo si al elegirla completa una crisis de herramientas que de otro modo no se completaría**. Si la otra carta completa la victoria general, **no** relegarla sin decisión expresa. Casos a probar: linterna+palanca; muestra que da victoria; 1/2 humano; elección sin efecto de rescate; desempates y conservación cuando ninguna alternativa completa.

## Hallazgo H2 — Otras crisis no se reevalúan tras buscar (límite previo de alcance, no regresión C7)

**Precondición posible:** crisis de comida 1/2 por aporte humano, IA inicialmente sin comida propia, y encuentra una ración en su búsqueda. **Esperado bajo una política universal de «evaluar después de buscar»:** la IA dona la ración y completa.

**Observado por inspección estática:** la rama de comida/medicina/combustible de `botTurn()` dona **antes** de desplazamientos y búsquedas; `stashLoot()` incorpora la ración después pero `botContributeTools()` deliberadamente solo procesa `herramienta`. Por lo tanto la nueva ración no se dona en la misma ronda. Es comportamiento **anterior al cambio C7**, preservado intencionalmente por el alcance del issue #5; no atribuirlo como regresión.

**Evaluación:** registrar como límite funcional frente a la aspiración cooperativa general. Una reordenación de todos los tipos de crisis tendría que rediseñar el momento de consumir comida, medicina y combustible, sus usos alternativos y aportes parciales; **no autorizarla implícitamente desde #5**. No abrir ni implementar ese trabajo dentro de esta revisión.

## Cobertura y riesgos remanentes

- Las diez pruebas nuevas cubren la entrega correcta **de herramientas ya elegidas/adquiridas**, pero ninguna enfrenta dos botines simultáneamente donde la elección de un recurso determina si la crisis es superable. Tampoco constituyen simulación estadística de balance.
- Evaluar recursos «siempre que se pueda» no demuestra que donar una palanca valiosa sea óptimo para las siguientes rondas: el costo está aceptado por la política A.
- La ausencia de fallo en CI no significa ausencia de errores de interfaz o estrategia. Android físico, TalkBack y prueba manual en navegador siguen fuera de la evidencia.

## Dictamen, cambios y próximo paso único

**Resultado:** C7 cumple su política de donación acotada conforme a la inspección y pruebas remotas, **con reserva estratégica H1** sobre selección de botín, que puede dejar fallar una crisis salvable. H2 es un límite preexistente, no una razón para modificar otros tipos ahora. No declarar «IA siempre salva toda crisis posible» ni cerrar automáticamente #5. No hubo cambio de código/tests, ni fusión, publicación ni nueva versión; revisión registrada en tablero y registro.

**Único siguiente paso propuesto para aprobación de diseño (C7-R1):** decidir la regla mínima de selección de botín que favorece una herramienta cuando, junto con lo que ya tiene la IA y aportó el humano, **permitiría completar la crisis en esa ronda**, preservando prioridad de victoria inmediata. Después, y solo con decisión registrada, agregar regresión que falle antes y corrección acotada. La expansión equivalente a otras crisis queda anotada para un bloque distinto, sin empezar ahora.
