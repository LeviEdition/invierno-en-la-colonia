# 33 — Revisión crítica posterior de C7-R1 (#5)

**Fecha:** 27/10/2026 · **Etapa:** C — estabilización · **Rama auditada:** `fix/estabilizacion-v9-9`, commit `46564a5471c8a63ae1436d856e673809cc8571a0` · **PR:** [#14](https://github.com/LeviEdition/invierno-en-la-colonia/pull/14) abierto, en borrador, base `refactor/arquitectura`. `main=d9068f4` intacta al comenzar. Issue [#5](https://github.com/LeviEdition/invierno-en-la-colonia/issues/5) sigue abierto.

## Alcance, metodología y límites de evidencia

Revisión posterior **separada de la implementación** [informe32](32-correccion-c7-r1-prioridad-botin.md): lectura del cambio de puntuación dentro de `beginSearch()`, comparado contra `ItemCatalog`, `stashLoot()`, `gainSample()`, `ItemEngine`, `CrisisManager`, `botContributeTools()`, `botTurn()`, `finishTurn()`, flujo de colonia y las ocho regresiones de `tests/ia-turnos.test.mjs`. Se leyó el registro de trabajo y el CI del commit de documentación más reciente antes de esta revisión. Se comparó el delta desde `aac8502`: HTML, tests y documentación, sin otros ejecutables.

**Evidencia CI independiente consultada:** [run 40576507329](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40576507329), checkout `46564a5471c8a63ae1436d856e673809cc8571a0`: `completed/success`, **305 tests declarados, 303 aprobados, 0 fallidos, 0 cancelados, 0 omitidos, 2 TODO** (#4 y #6). Los ocho casos nuevos figuran ejecutados sin fallas. La anterior fase rojo/verde está archivada en informe32.

**Método real:** inspección estática contrastada con evidencia de tests remotos; **no** se ejecutaron pruebas nuevas en esta revisión, ni una nueva sesión de navegador/Chromium, Android físico o TalkBack. No se simuló un número grande de partidas; no hubo revisión por otro agente externo. No confundir «consistente por inspección» con «reproducido manualmente en interfaz real».

## Verificaciones sustantivas

1. **Regla aprobada implementada estrictamente:** ante crisis `herramienta`, `needed=need-contributions válidas` y `held` suma mano IA + equipamiento de IA viva. La herramienta revelada recibe prioridad condicional solo si `needed>0 && held+1===needed`; ni el inventario humano ni los muertos intervienen.
2. **Victoria inmediata preservada:** la muestra recibe puntuación 12 cuando `game.samples+(investigador no usado?2:1)>=game.goal`; el cálculo coincide con el efecto de `gainSample(p)` para quien está buscando y con la habilidad única del investigador. Este 12 prevalece ante la herramienta con 11, aun si esta salva la crisis.
3. **Comportamiento normal inalterado fuera del caso:** una muestra no ganadora puntúa 10; superviviente accesible 9; otras categorías y su orden mantienen la tabla anterior. Si la IA ya puede resolver la crisis o una única herramienta revelada no la completa, la puntuación original decide. El incremento de puntuación de una muestra ganadora de 10 a 12 no cambia elecciones fuera de competencia con la herramienta, pues 10 ya era el máximo anterior.
4. **Integración:** `beginSearch` elige **una sola** carta entre las reveladas y devuelve las demás al mazo; `stashLoot` incorpora la herramienta a la mano o la equipa; `botContributeTools()` la considera al final del turno antes de `colony()`. La victoria por muestra se verifica tras buscar, antes de resolver colonia; `botContributeTools()` no dona en partida terminada. Las rutas humano y J2 local no pasan por esta puntuación automática.
5. **Consistencia de pruebas:** los casos C7-R1 cubren escenario rojo original, integración con turno, aporte humano previo, excepción de muestra ganadora, investigador duplicador, herramienta insuficiente, crisis ya solucionable y tipo de crisis ajeno. El objetivo mínimo real es 5, por lo que los fixtures `goal-1` y `goal-2` resultan válidos.

## Dictamen

**No se encontró un defecto nuevo comprobado de la corrección C7-R1 en el alcance revisado.** H1 del informe31 (selección de botín incorrecta cuando una herramienta salva una crisis) queda **resuelto por las pruebas y la implementación**, con precisión: solo respecto de cartas *ya reveladas* y cuando esa herramienta individual completa con recursos *ya disponibles*. La evaluación y donación de herramientas original C7 también conserva la secuencia correcta. La política es determinista, no una estrategia óptima de largo plazo.

**No se declara aprobada la integración a `main` ni se cierra #5**: la ausencia de defectos en inspección y la suite verde no reemplazan la aceptación en navegador real. La revisión concluye **sin modificación de motor ni pruebas**; solo documentación.

## Riesgos y cobertura aún pendientes (no presentar como bugs confirmados)

- **Riesgo de integración P2:** `tests/ia-turnos.test.mjs` reemplaza `pause()` y deshabilita encrucijadas, modales y esperas. No certifica que la prioridad C7-R1 conviva sin bloqueo con la presentación de encrucijadas y la secuencia completa de UI. Requiere smoke test de navegador con turno real.
- **Casos adicionales P3:** superviviente investigador con bono ya consumido, varias cartas reveladas por explorador + linterna, selección estable entre dos herramientas, ausencia de herramientas en mazo, descarte/reordenación tras búsqueda y muerte de un portador a mitad de turno. No se detectó fallo concreto en su flujo; no implica necesidad de parche inmediato.
- **No cambia otras crisis:** alimento, medicina y combustible aún no reevaluados tras búsquedas (H2 documentado, comportamiento anterior a C7); no reabrirlo ni confundirlo con regresión de C7-R1.
- **Decisión de IA limitada:** no busca estratégicamente localidades por distribución de herramientas y no especula sobre dos hallazgos futuros cuando una herramienta aislada no alcanza. Ambas limitaciones coinciden con el alcance aprobado y no bloquean la revisión de C7-R1.
- **Dispositivos:** Android físico/TalkBack pendientes de prueba de aceptación general. El éxito de Node CI no verifica interfaz táctil, comportamiento de modales ni animaciones.

## Siguiente tarea única recomendada

**Validación manual acotada de C7/C7-R1 en un navegador real**, con el juego en modo humano + IA y encrucijadas/modales activos, antes de considerar su cierre o promoción. Evidencias a registrar: (a) crisis 1/2 humano + herramienta IA/equipo, (b) elección entre muestra y herramienta salvadora, (c) muestra que completa victoria y prevalece, (d) ausencia de bloqueo, aportes correctos y colonia/victoria en pantalla. Como los eventos y el mazo se mezclan al azar, definir en el próximo bloque un procedimiento de reproducción/control **sin alterar `main` ni improvisar cambios en la consola del usuario**. Si el navegador no puede usarse en el entorno, coordinar un smoke test guiado con el creador y registrar la limitación. No abrir etapa D u otro issue mientras esta aceptación quede pendiente, salvo cambio explícito de prioridad.
