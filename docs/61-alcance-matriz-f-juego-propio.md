# 61 — Alcance vinculante de la matriz F: diseño del juego propio

**Fecha:** 28/10/2026. **Decisión explícita del creador:** las decisiones de la **matriz de fidelidad F** se estudian **para la versión propia de *Invierno en la Colonia***, NO como lista de cambios que deban incorporarse a la V9.9 que estamos estabilizando/refactorizando. Este documento corrige interpretaciones anteriores en [51](51-rumbo-fidelidad-e-identidad.md), [01](01-plan-refactorizacion.md) y [18](18-tablero-operativo.md). Es una decisión de **alcance y documentación**, no implementación.

## Dos líneas de producto, responsabilidades distintas

| Línea | Propósito | Regla de cambio |
| --- | --- | --- |
| **Referencia V9.9 estabilizada** | Adaptación digital relativamente cercana en experiencia y mecánicas a *Dead of Winter*, verificable y útil como línea base técnica | Etapas A/B/C: detectar/corregir defectos explícitamente aprobados. Etapa **D**: refactorizar **con preservación de comportamiento**. **No aplicar cambios de diseño de la matriz F** |
| **Juego propio futuro: *Invierno en la Colonia*** | Evolucionar hacia singleplayer con Director de Juego, agencia, memoria narrativa y consecuencias diferidas; considerar co-op opcional después | Tras fijar una referencia técnica estable y su arquitectura, elegir y **volver a validar** decisiones de la matriz F y programarlas en una línea/rama propia con tests y aceptación separados |

**«Más fiel» no significa equivalencia certificada:** la V9.9 puede tener diferencias conocidas con el juego de mesa. Su función como referencia no obliga a introducir cada mecánica del original ni a resolver cada discrepancia mediante la matriz F. Los errores funcionales verdaderos deben auditarse como defectos de referencia por separado, nunca reclasificar automáticamente «Cambiar» como bug.

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

## Relación con D, E y orden de trabajo

1. Mantener una **referencia funcional congelable y reproducible** y cerrar D1/D2 de preservación por pruebas y decisiones explícitas.
2. **Diseñar hoy** la matriz F y la identidad narrativa en documentos, sin modificar el comportamiento de referencia.
3. Antes de crear la línea de desarrollo propia, decidir cómo conservar una instantánea accesible de la referencia (por ejemplo, tag/release y/o rama protegida), con autorización. No se crea una versión pública ni rama propia en esta aclaración.
4. En el juego propio, implementar **solo filas F que sobrevivan a la revisión del singleplayer**, de forma incremental; no gastar esfuerzos en reproducir un segundo jugador obligatorio que posiblemente desaparezca.
5. Integrar esos cambios cuando corresponda con el primer prototipo E (Director, narrativa y memoria); no presuponer que todas las filas de F se implementarán antes de E ni que todas deban implementarse.
6. Mantener **tests de regresión de referencia separados de tests de las nuevas reglas**. Cuando un comportamiento se modifique intencionalmente en el juego propio, cambiar sus expectativas allí con pruebas y autorización, sin reescribir a posteriori la evidencia histórica de V9.9.

## Vigencia y límites de esta actualización

Esta aclaración **prevalece sobre indicaciones de documentos históricos que sitúen F-14 u otros cambios F en la versión de referencia o en la fase D**. Los informes históricos permanecen como registro de lo ocurrido y no deben interpretarse como instrucciones vigentes cuando contradigan esta decisión.

**Alcance ejecutado:** documentación de repositorio en `refactor/d1-catalogo`, sin cambios al juego, pruebas, matriz XLSX externa ni `main`; sin PR ni merge. El siguiente paso técnico autorizado sigue siendo **pedir autorización para D1.2a (PoC esbuild, preferiblemente con Codex)**. La matriz F puede seguir analizándose en paralelo **solo como diseño**.
