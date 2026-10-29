# 70 — Reconciliación documental SP-03 y apertura de PR D1/D2

**Resultado:** reconciliación incorporada y [PR15 abierto](https://github.com/LeviEdition/invierno-en-la-colonia/pull/15) para revisión final, sin fusionar. Se abrió sobre7d6a68a después de pruebas yCI completos; el commit documental posterior registra la apertura. Código yHTML idénticos al corte técnico auditado. GitHub confirmó ausencia de conflictos. **Única siguiente tarea del creador/ChatGPT:** revisión independiente ydecidir aprobación/merge; no hay autorización de fusionar automáticamente.


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

Completado para la preapertura7d6a68a: instalación, construcción reproducible,467 pruebas yCI exacto aprobados antes de crear el PR. El workflow completo conserva40comparaciones contra57872ee y40contra main,5partidas QA+5reproducciones producto, controles/foco/finales/offline. Solo se declararán aprobadas al consultar la ejecución real. Si aparece bloqueo real, detener apertura ydocumentar.

La propuesta sigue siendo merge commit convencional para conservar ascendencia y57872ee; nada de squash/rebase o merge automático. Tras abrir se comprobarán base/head, contenido completo, checks ymergeabilidad. PR preparado no equivale a aprobación final.

**Comprobación local previa al commit reconciliado:** npm ci, check:build y467/467 tests aprobados (0 fallos, omisiones o cancelaciones). Diff de esta tarea exclusivamente documental; ningún cambio en src/scripts/tests/workflows/package/lockfile/HTML frente a8e3e7d3 ni6277e62. Producto conserva SHA256`43b8883ad4821e4b50c40791615c5ef6c0b3030476409b4e1c6da4dbd872d692`. Se cotejaron íntegros5K,6.1,6.2C/D ylos bloques nuevos de18 con la fuente833eae7. [Evidencia de procedencia](evidencias/d1d2-reconciliacion-sp03.json). CI remoto del SHA nuevo aún pendiente; no se abre PR hasta comprobarlo.

## Validación remota y PR abierto

- Commit reconciliado`7d6a68a21a802d0938e67dd8a1d863484fc07530`, árbol limpio ysin cambios ejecutables respecto de8e3e7d3. Fuente833eae7 ymain0b75d01 nuevamente confirmadas antes de abrir.
- [Actions40896698599](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40896698599) regresión y[40896698392](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40896698392) arquitectura: ambos success, jobs engine/browser completos.467/467, sin fallos/omisiones;40/40 iguales contra57872ee y40/40 contra main; suites históricas451 y408 aprobadas.
- Artifacts descargados/cotejados:5partidas QA y5reproducciones sobre producto,0errores/invariantes;4file offlineCI local/IA enproducto/QA, red desactivada.15 hashes de módulos yHTML idénticos a fuentes locales y código auditado. Los recorridos existentes de controles/foco/finales se ejecutan en el job browser. No se declara file local aprobado: continúa bloqueado por política; no Android físico/TalkBack.
- PR creado expresamente hacia main, regular/no draft: [#15](https://github.com/LeviEdition/invierno-en-la-colonia/pull/15). Contiene la rama completa D1/D2, no solo la conciliación documental, y ninguna implementación singleplayer. Descripción basada en69, con pruebas, documentación, riesgos yreversión.
- GitHub: mergeable=true; base real0b75d01, head inicial7d6a68a, merged=false yautoMergeRequest=null. Los checks de pull_request arrancaron yse verificarán sobre el head de entrega después de registrar este cierre; el estado actual enlaza desde el PR, no se confunde con una fusión real.
- Los registros67/68 siguen siendo evidencia histórica, con seguimiento de apertura. El inventario de integración anterior es del corte6277e62; esta reconciliación yel registro de PR añaden solo documentación. No se alteran sus hashes/resultados históricos.

**Reservas:** propuestas de ciclo/Encuentros/muerte aún requieren decisiones; no se elevan a acuerdos. Persisten reservas técnicas aceptadas del informe68 (contexto de compatibilidad, schema V9.9 dos grupos, VM de fixtures ypruebas físicas/otros navegadores pendientes). Ninguna bloquea revisión del PR con las compuertas aprobadas; no justifica programación adicional ahora.

**Recomendación:** PR listo para nuestra revisión final una vez comprobados sus checks del último commit documental. Estrategia futura: merge commit convencional para conservar57872ee; sin squash/rebase que pierda el oráculo. **Detención obligatoria:** no fusionar ni crear tags/releases; main permanece0b75d01.
