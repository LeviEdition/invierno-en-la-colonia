# 61 — Alcance vinculante de la matriz F: diseño del juego propio

**Fecha:** 28/10/2026. **Decisión explícita del creador:** las decisiones de la **matriz de fidelidad F** se estudian **para la versión propia de *Invierno en la Colonia***, NO como lista de cambios que deban incorporarse a la V9.9 que estamos estabilizando/refactorizando. Este documento corrige interpretaciones anteriores en [51](51-rumbo-fidelidad-e-identidad.md), [01](01-plan-refactorizacion.md) y [18](18-tablero-operativo.md); debe leerse junto al [62 — ruta de tres hitos y auditoría de fidelidad RF](62-hitos-referencia-fiel-y-juego-propio.md). Es una decisión de **alcance y documentación**, no implementación.

## Dos líneas de producto, responsabilidades distintas

| Línea | Propósito | Regla de cambio |
| --- | --- | --- |
| **V9.9 actual → referencia fiel y modular por completar** | V9.9 estabilizada y **aceptada por el creador como mecánicamente suficientemente fiel**, con diferencias ya documentadas; resta arquitectura modular/escalable | **Completar D1/D2 preservando comportamiento; no exigir otra auditoría RF ni nuevas correcciones de reglas como requisito previo**. **No aplicar cambios de diseño de la matriz F** |
| **Juego propio futuro: *Invierno en la Colonia*** | Evolucionar hacia singleplayer con Director de Juego, agencia, memoria narrativa y consecuencias diferidas; considerar co-op opcional después | Tras fijar una referencia técnica estable y su arquitectura, elegir y **volver a validar** decisiones de la matriz F y programarlas en una línea/rama propia con tests y aceptación separados |

**Alcance de fidelidad aceptado, sin afirmar copia literal:** la comparación de **14 áreas mecánicas contra el reglamento oficial ya existe en el [informe 49](49-c15-auditoria-final.md#comparación-con-dead-of-winter)**. Por decisión del creador, la adaptación actual es suficientemente fiel para servir de base; acepta diferencias conocidas y no necesita una **nueva matriz RF** como puerta de entrada al juego propio. Falta **completar D1/D2 y preservar la referencia**. Los bugs graves nuevos, si aparecen, se revisarán puntualmente; una fila de matriz F marcada «Cambiar» no es un defecto de V9.9.

## Cómo leer la matriz F

- **Conservar:** propuesta para mantener o adaptar esa idea o mecánica **en el videojuego propio**; no declara que V9.9 ya la ejecute correctamente, ni impide evolucionarla después.
- **Cambiar:** propuesta para que la versión propia funcione de otra manera; **no significa editar la V9.9 ahora** ni supone aprobación automática de implementación.
- **Pendiente/por revisar:** hipótesis sin cierre de diseño; preservar incertidumbre.
- **Decisión de diseño ≠ cambio de código:** aun una fila acordada requiere especificación, pruebas, evaluación de balance, conflictos con otras reglas y autorización propia antes de ejecutarse.
- **F-01, F-03b, F-14, F-21, F-24, F-57, etc.** son **IDs de filas de la matriz**. No son fases del plan. La **etapa F** de la hoja de ruta histórica es expansión visual/cooperativo y es otra nomenclatura.

La palabra «fidelidad» describe el **proceso de comparación de alternativas con el juego de mesa**, no el destino de implementación: su destino es nuestra versión original. Un nombre más preciso para su contenido es **«Matriz F — Comparación y decisiones para el juego propio»**. Se conservan los IDs para no romper trazabilidad.

## Caso concreto: F-14

- **Propuesta acordada de diseño para la versión propia:** presentar cinco candidatos aleatorios, elegir tres y nombrar líder manualmente.
- No sustituye la selección de supervivientes de V9.9; no se traslada automáticamente a los modos J1/J2 o humano/IA de la referencia.
- La justificación de conservar tres participantes controlados por la persona al inicio deberá revisarse con el futuro sistema singleplayer, sus acciones, recursos, dados y progresión. La selección de candidatos de un bando de IA **no** es requisito automático de esta decisión.
- No está implementada en la rama de refactorización D ni autorizada para entrar en `main` como parte de D1/D2.

## Relación con D, RF, E y orden de trabajo

1. **Hito 1 — fidelidad mecánica aceptada y arquitectura pendiente:** **completar D1/D2** desacoplando el motor **sin alterar el comportamiento actual**. El informe 49 es la comparación oficial ya realizada; **no iniciar RF por defecto**. El hito termina cuando se verifiquen y acepten las mejoras de arquitectura, no solo por CI verde.
2. **Diseñar hoy** la matriz F y la identidad narrativa en documentos, sin implementar aún sus mecánicas en la referencia.
3. **Hito 2 — preservar la referencia:** una vez aceptada la fidelidad y estabilidad, conservar una versión reproducible e identificable (por ejemplo, tag/release o rama protegida) con autorización; ninguna se crea aquí.
4. **Hito 3 — abrir juego propio:** en línea separada, implementar **solo filas F que sobrevivan a la revisión del singleplayer**, de forma incremental. Integrarlas cuando corresponda con E (Director, memoria, narrativa), sin asumir que todos los F deben introducirse antes de E.
5. Mantener **tests de regresión de referencia separados de tests de las nuevas reglas**. Cuando un comportamiento se modifique intencionalmente en el juego propio, actualizar las expectativas allí con pruebas y autorización, sin reescribir a posteriori la evidencia histórica de V9.9.

**No confundir:** el **informe 49** ya compara la referencia con el reglamento; una matriz RF nueva **no es tarea obligatoria**. `F-xx` sigue siendo decisión para el juego propio; la etapa F del plan general es expansión/presentación.

## Vigencia y límites de esta actualización

Esta aclaración, junto con [62](62-hitos-referencia-fiel-y-juego-propio.md), **prevalece sobre indicaciones históricas que sitúen F-14 u otros cambios F en la versión de referencia o en la fase D, o que exijan ahora una nueva auditoría RF como requisito previo obligatorio**. Los informes históricos permanecen como registro de lo ocurrido y no deben interpretarse como instrucciones vigentes cuando contradigan esta decisión.

**Alcance ejecutado:** documentación de repositorio en `refactor/d1-catalogo`, sin cambios al juego, pruebas, matriz XLSX externa ni `main`; sin PR ni merge. El siguiente paso técnico autorizado sigue siendo **pedir autorización para D1.2a (PoC esbuild, preferiblemente con Codex)**. La matriz F puede seguir analizándose en paralelo **solo como diseño**.
