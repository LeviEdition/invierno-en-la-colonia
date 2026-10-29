# 70 — Reconciliación documental SP-03 y apertura de PR D1/D2

Fecha:29/10/2026 (America/Montevideo). Encargo vigente: trasladar novedades de diseño, validar la rama y **abrir/comprobar un PR hacia main**, sin fusionar ni implementar singleplayer. Sustituye la anterior espera de autorización para abrir, no autoriza merge, tags o releases.

## Estado y procedencia

- main remoto`0b75d01aba013cd029d9d0dd0bdbd20791be15fc`, sin cambios frente a la referencia.
- Rama técnica local/remota limpia en`8e3e7d3fd310e731dea3c471180523fb62a3e884`; código auditado6277e62, oráculo57872ee preservado en ascendencia. No había PR de esta rama.
- Rama de diseño avanzó desde la base común`ba9a4238d22ad968edbe74d0445949f9a631ec70` a`833eae745479509ec8121707e9df452c1a5e85bc`:14 commits, **solo18 y63**. Se leyó diff completo respecto de la base yse contrastó con los cambios propios de la rama técnica.
- No se fusiona/cherry-pickea la rama de diseño. Se aplica exclusivamente su patch de63 yse insertan sus54 líneas nuevas de18 junto a los registros de diseño, conservando la cabecera técnica ytodos los informes/evidencias.

## Reconciliación de acuerdos y propuestas

| Novedad | Estado preservado |
| --- | --- |
| Base mecánica V9.9 para primera versión propia | Alcance conceptual acordado; balance de un grupo y reclutamiento pendientes, pool/híbrido aplazado como historia. |
| Ciclo A → B con encuentros C intercalados → D → E | Propuesta, no ciclo íntegramente aprobado ni implementado. |
| Encrucijadas, Encuentros e Historia principal | Clasificación acordada por función narrativa, no por gravedad fija. |
| Campaña reactiva a acciones/condiciones del mundo | Acuerdo conceptual; no evento principal obligatorio cada ronda. Ejemplo hospital/secta no se eleva a canon. |
| Encrucijadas flexibles, máximo una por ronda | Acuerdo con precisión cronológica: si encrucijada ocurre primero puede suceder después el principal; si el principal ya ocurrió no generar nuevas encrucijadas ese día. Sin cancelar lo ya resuelto. |
| Historias secundarias reutilizables por superviviente compatible | Propuesta en evaluación: instancia vinculada al protagonista/NPCs; no aprobación de asignación, frecuencia, generador o esquema técnico. |
| Muerte del protagonista | Cierre, continuidad justificada, transformación o pausa: alternativas aún pendientes. No inmortalidad ni transferencia arbitraria de parentesco; no se aprueba aquí política universal. |

Se aclaran dos desfases de redacción: la fórmula temprana «suprimir encrucijada si hubo principal en esa ronda» se lee con la precisión posterior de6.2B, sin retroactividad; el borrador de retener candidatas hasta el cierre permanece como historia superada. SP-02 figura como base V9.9 acordada, SP-03 con acuerdos parciales; el criterio de muerte/continuidad sigue siendo la pregunta inmediata, no una regla aceptada por esta tarea.

67/68 conservan sus pruebas y SHA históricos yreciben únicamente una nota de seguimiento.69 se actualiza con el alcance documental real yla autorización de apertura. No se reescriben resultados anteriores ni se confunde aprobación conceptual con implementación.

## Compuertas y apertura

En curso. Se repetirá instalación, construcción reproducible y467 pruebas; se comprobará CI del SHA reconciliado antes de abrir. El workflow completo conserva40comparaciones contra57872ee y40contra main,5partidas QA+5reproducciones producto, controles/foco/finales/offline. Solo se declararán aprobadas al consultar la ejecución real. Si aparece bloqueo real, detener apertura ydocumentar.

La propuesta sigue siendo merge commit convencional para conservar ascendencia y57872ee; nada de squash/rebase o merge automático. Tras abrir se comprobarán base/head, contenido completo, checks ymergeabilidad. PR preparado no equivale a aprobación final.

**Comprobación local previa al commit reconciliado:** npm ci, check:build y467/467 tests aprobados (0 fallos, omisiones o cancelaciones). Diff de esta tarea exclusivamente documental; ningún cambio en src/scripts/tests/workflows/package/lockfile/HTML frente a8e3e7d3 ni6277e62. Producto conserva SHA256`43b8883ad4821e4b50c40791615c5ef6c0b3030476409b4e1c6da4dbd872d692`. Se cotejaron íntegros5K,6.1,6.2C/D ylos bloques nuevos de18 con la fuente833eae7. [Evidencia de procedencia](evidencias/d1d2-reconciliacion-sp03.json). CI remoto del SHA nuevo aún pendiente; no se abre PR hasta comprobarlo.
