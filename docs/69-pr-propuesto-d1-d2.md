# 69 — PR D1/D2: descripción y control de revisión

Base: `main@0b75d01aba013cd029d9d0dd0bdbd20791be15fc`.
Head: `refactor/d1-d2-arquitectura`, contenido técnico hasta`6277e62dbd8b917bac7d4c290b14096499d6b0f7`, más documentación de cierre. [Inventario exacto de commits/archivos](evidencias/d1d2-integracion-commits.json). Actualizar/revalidar si main o la rama se mueven antes de abrir.

**Estado actual:** [PR15 MERGED](https://github.com/LeviEdition/invierno-en-la-colonia/pull/15), por autorización expresa del creador tras revisión independiente. Merge convencional `6b8bfcadfeb99d16a10b6f4576f3b061584ee1f9`, padres0b75d01/7f3ac7c; no squash/rebase. El código integrado aprobó467/467,40+40 comparaciones ylos tres workflows de main. [Cierre71](71-integracion-main-y-cierre-d1-d2.md). El texto de descripción/reversión siguiente conserva la propuesta revisada antes de fusionar; su aprobación posterior queda registrada aquí. No se creó tag/release ni juego propio.

**Reconciliación:** fuente833eae7, solo documentación; no nuevos cambios de código frente al cierre8e3e7d3/código6277e62. [Informe70](70-reconciliacion-documental-y-pr-d1-d2.md).

## Título

Modularizar V9.9 y separar motor, interfaz e IA conservando comportamiento

## Descripción lista para copiar

La V9.9 de main concentra reglas, estado, interfaz y automatismos en un script del HTML, con eventos que llaman funciones globales. Esta entrega conserva sus mecánicas y distribución offline mientras separa estado/reglas/acciones/turnos, interfaz por comandos y agente opcional. esbuild empaqueta módulos reales en una IIFE dentro de un HTML autocontenido; el motor puede ejecutarse sin DOM.

La auditoría final corrigió tres defectos de encapsulación/ciclo de vida: acceso a grupos mutables mediante el prototipo de controles, callbacks de encrucijadas ejecutables desde la vista ylisteners residuales tras construcción fallida. Cada defecto tiene prueba que fallaba antes ycommit independiente. La vista consulta datos sin callbacks; los efectos de las cartas siguen en el motor.

Incluye caracterización D1.0/D1.1, experimentos y evidencias históricas, además de la planificación histórica SP-02 y la reconciliación SP-03 desde refactor/d1-catalogo@833eae7. Se distinguen acuerdos conceptuales (base V9.9, tres categorías, campaña reactiva y cronología de encrucijadas) de propuestas pendientes (ciclo completo, Encuentros reutilizables y contingencias por muerte). Se preservan los informes técnicos y los registros de diseño: **este PR no implementa singleplayer, Director narrativo ni reglas nuevas**. El diff completo contra main incluye D1/D2, las correcciones de auditoría y documentación reconciliada; el inventario original citado arriba corresponde al corte técnico6277e62, no enumera los commits documentales posteriores. [Informe70 y procedencia](70-reconciliacion-documental-y-pr-d1-d2.md).

### Validación

Preapertura `7d6a68a21a802d0938e67dd8a1d863484fc07530`: [regresión40896698599](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40896698599) y [arquitectura40896698392](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40896698392), ambos **success**; engine/browser aprobados yartifacts descargados/cotejados. El cierre documental posterior no cambia el ejecutable; sus checks exactos se consultan en el PR antes de entregar.

- npm ci/check:build/npm test:467 pruebas actuales, sin omisiones.
-40 partidas del lote (20 IA+20 local), idénticas contra57872ee ycontra main0b75d01; solo se excluyen hashes de fuente. Las suites originales451 y408 permanecen verdes.
-5 partidas QA y5 reproducciones de sus clics sobre el HTML de producto sin acceso interno; mismos recursos/objetivo/resultado visibles.
- C16 teclado/foco en3tamaños; C11 geometría/selección/estados/solapamientos en6; inicio/pase6; C12/C13,6casos cada uno; issue7,16casos; finales ysucesión con foco vigente,6casos.
- file:// sin red, local eIA, producto yQA:4 aperturas enCI. Localfile bloqueado por política; no sustituirlo por un supuesto aprobado local.
- CI de código6277e62: [regresión40884309357](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40884309357) y[arquitectura40884309718](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40884309718), ambos success. El informe68 ysu evidencia registran los resultados comprobados; no confundir preparación de PR con fusión/autorización.

### Riesgos y límites

Las40 configuraciones yrecorridos no prueban todos los estados posibles. Persiste el esquema V9.9 de dos grupos yun contexto interno de compatibilidad amplio. VM yacceso interno solo en harness QA; el producto no publica estado/funciones del juego ni incluye eval/with/instrumentación. Android físico, TalkBack yotros navegadores no se validaron. No es una certificación universal de accesibilidad ni un motor singleplayer terminado.

La comparación de integración parte de main0b75d01, ancestro de la entrega. Si main avanza, actualizar la comparación yvolver a validar el resultado antes de integrar. El workflow completo contempla push de la rama, PR y main. Se verificó el SHA reconciliado por push antes de abrir; la creación activó además los checks pull_request. La rama no presenta conflictos; se comprueba su último head antes de entregar. No equivale a validar un merge futuro ejecutado.

### Reversión propuesta

Al autorizar integración, se recomienda un merge commit convencional que conserve los SHA originales. La comparación histórica necesita57872ee en el historial: squash/rebase pueden dejar ese SHA fuera de la ascendencia de main yhacer depender CI de ramas experimentales que después se borren. No aprobar squash/rebase sin resolver antes la conservación del oráculo. No se crea ahora tag ni referencia oficial.

El cambio integrado puede revertirse con un commit en una rama de corrección: `git revert -m 1 <SHA-del-merge>`, seguido de revisión/CI. El parent1 debe ser el main previo a integrar, comprobado antes del revert. No se ejecutó merge ni revert durante esta tarea.

Restaurar exactamente main0b75d01 también retira el toolchain/lockfile nuevos: esa referencia ejecuta `npm test` directamente yusa su HTML/script histórico; **no exigir npm ci/check:build de D1 a una revisión anterior que no los tiene**. Validar con las pruebas yrecorridos propios de la referencia restaurada. Si hay cambios posteriores dependientes, analizar sus conflictos antes del revert; no reset destructivo ni force-push.

La preparación no crea tags/releases ni preserva todavía una versión oficial. El creador autorizó abrir el PR tras esta reconciliación y sus compuertas; la aprobación final y el merge siguen pendientes de otra revisión independiente. No se fusionará automáticamente.
