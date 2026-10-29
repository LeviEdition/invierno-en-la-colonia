# 68 — Auditoría final de integración D1/D2

**Seguimiento documental29/10:** el encargo posterior autorizó reconciliar SP-03 y abrir/comprobar el PR hacia main. [PR15 abierto](https://github.com/LeviEdition/invierno-en-la-colonia/pull/15), sin fusionar; preapertura7d6a68a con CI aprobado. Este informe conserva los hechos, SHA y resultados de su cierre histórico; las frases «PR no abierto» o «esperar autorización de apertura» describen ese momento. Estado actual en [tablero18](18-tablero-operativo.md), [documento69](69-pr-propuesto-d1-d2.md) e [informe70](70-reconciliacion-documental-y-pr-d1-d2.md). La reconciliación no cambia el código auditado6277e62 ni sus reservas.


**Dictamen final:** sí, D1/D2 es suficientemente modular, estable y comprobable para integrar y después preservar V9.9 como referencia, **tras corregir B1/B2/B3 y conservar la historia del oráculo al integrar**. Recomiendo aprobar la integración propuesta después de revisión humana; no ampliar arquitectura para singleplayer en esta etapa. No se abrió ni fusionó PR.

**Código técnico auditado:**6277e62dbd8b917bac7d4c290b14096499d6b0f7. CI completo aprobado yartifacts descargados/cotejados. La entrega posterior agrega únicamente este informe, evidencia ytexto de PR.


Fecha:29/10/2026 (America/Montevideo). Encargo del creador: auditar la entrega y preparar integración hacia main, **sin abrir ni fusionar PR**, sin tags/releases y sin arquitectura adicional para singleplayer. No continuar perfeccionamiento genérico; corregir solo bloqueos reproducibles, documentar mejoras/deuda aceptada.

## Estado inicial

Árbol limpio, rama `refactor/d1-d2-arquitectura` en`ee73d29b3285a186b805f5def4c07dd28d4a3ef9`. Remoto confirma main`0b75d01aba013cd029d9d0dd0bdbd20791be15fc`, rama técnica sin cambios y D1 original`ba9a423`. Se leyeron18,60,62,67. Diff:70 archivos contra57872ee (bloques D2/adopción);104 contra main (incluye D1.0/D1.1, experimentos y documentación histórica). El HTML entre main y57872ee solo cambia inyección de mezclador del catálogo:6 líneas añadidas/4 retiradas, sin otra regla modificada. Se comprobará comportamiento contra el oráculo y directamente con main.

## Hallazgos iniciales (pendientes de corregir/verificar)

| ID | Clasificación | Reproducción y efecto | Tratamiento |
| --- | --- | --- | --- |
| B1 | Bloqueante | `Object.getPrototypeOf(view.controls).group.call(view.controls)` devuelve el grupo real; escribir wounds=2 modifica snapshot sin comando. | Fachada de consultas de controles, sin prototipo del controlador real; prueba roja→verde. |
| B2 | Bloqueante | `view.crossroadsDeck.find(...rescate de la plaza...).choices[0][2](view.game)` recluta de3 a4 sin resolver carta. | Entregar datos de presentación y elegibilidad calculada por reglas, sin callbacks; prueba roja→verde. |
| F1 | Mejora futura | Contexto interno amplio y enlaces vivos de compatibilidad. | Conservar; no ampliar refactor. |
| H1 | Deuda heredada aceptada | Paquete V9.9 representa dos grupos, turnos y objetivos actuales. | No cambiar; adaptación singleplayer solo cuando su funcionalidad esté autorizada. |
| H2 | Deuda heredada aceptada | VM en fixtures históricos; emulación no sustituye Android físico/TalkBack/otros navegadores. | Conservar pruebas y declarar límites. |

No se afirma cierre ni aprobación mientras haya bloqueos o validaciones pendientes. Cada corrección tendrá commit separado. Las recomendaciones finales, pruebas por SHA y propuesta de PR se registrarán al terminar.

## Corrección B1

La prueba nueva falla enee73d29 porque no se rechaza la escritura a través del prototipo. La corrección entrega una fachada congelada de consultas (side/local/interactive/group/hand/dice/display), sin el prototipo del controlador interno. Las consultas siguen siendo vivas y conservan identidad de actores; sus resultados permanecen protegidos incluso al invocarlas mediante descriptores. No se reescribe el motor ni se cambia la representación del estado.

Rojo→verde dirigido:1/1. Baseline reejecutada462/462 y npm ci/check:build aprobados. Suite tras B1:463/463,0 fallos/omisiones/cancelaciones; build reproducible. B2 aún bloquea el cierre; pendientes gates completos sobre implementación final.

## Corrección B2

Dos pruebas nuevas rojas: se podía reclutar sin comando y no existía una proyección de presentación segura. Se retiran crossroadsDeck/crossOptionAllowed de las capacidades de la vista; el motor ofrece crossroadsView con textos, cantidad de historias y opciones permitidas calculadas por las mismas reglas reales. Los callbacks originales permanecen privados e intactos. La IA y los fixtures QA siguen usando sus entradas internas autorizadas; el renderer recibe únicamente los datos que dibuja.

Dirigidas B1/B2:3/3 verdes. Suite465/465,0 fallos/omisiones/cancelaciones; check:build y diffcheck aprobados. Prueba de elegibilidad demuestra comida1→opción de provisiones no disponible y comida3→disponible, sin consumir RNG ni modificar estado. No se introdujo un sistema narrativo ni cambió efecto alguno de carta. Pendiente validación integral en navegador y por SHA.

## Hallazgo B3 — construcción fallida deja listeners

**Bloqueante de ciclo de vida confirmado:** el segundo createApplication sobre el mismo documento lanza «ya están conectados» pero deja6 listeners visuales:16 en vez de10. También una inicialización que falla después de conectar deja los10 listeners yel registro marcado, impidiendo reconexión limpia. Dos pruebas rojas reproducen ambos defectos.

La corrección limpia únicamente recursos instalados por el intento fallido (sus listeners y, si llegó a instalarlo, su registro de comandos); no desconecta la aplicación anterior. Tests de ciclo3/3 verdes, suite467/467 ybuild reproducible. Sin cambio de reglas ni de flujo exitoso. B1/B2/B3 cerrados en implementación; faltan validaciones finales ydictamen.

## Preparación de CI para integrar (sin integrar)

Se amplía el workflow completo a futuros PR hacia main ypush de main, para conservar estas compuertas después de una integración autorizada. Los workflows históricos D0/D1 que ahora invocan scripts de escenarios reciben la construcción explícita del HTML QA yla instalación reproducible; no se modifica el juego. La comparación permite elegir REFERENCE_COMMIT, manteniendo57872ee por defecto, yse añade comparación directa contra main0b75d01. C12/C13/issue7/terminal existentes se incorporan al recorrido actual, además de C16/C11/partidas/offline. No se abre PR para activar esta preparación.

Resultado local directo contra main:40/40 registros iguales, excluyendo solo metadatos source; suite histórica main408/408 yactual467/467. La comparación histórica anterior57872ee también dio40/40 (451/451 referencia). Esto refuerza que las extracciones preservan estrategia, mensajes, muertes, rondas yRNG; no afirma equivalencia universal para todas las semillas.

## Ajuste del recorrido terminal histórico

La ampliación inicial del CI en352c094 invocó check-c15-terminal-browser.mjs, que exige poder escapar del diálogo de muerte mediante Tab (assert reached=true). C16 ya eliminó esa fuga; el propio workflow D0 documentaba que esa precondición histórica dejó de ser contrato vigente. Local yActions40883942064 fallaron exactamente allí, con0 errores JS; no se atribuye ese rojo a un defecto del juego ni se declara ese run aprobado.

Se conserva el script C15 sin tocar sus aserciones históricas. Un recorrido de integración separado conserva las verificaciones de hambre/residuos, exige el foco aislado vigente yademás intenta chooseLeader directamente para comprobar la defensa del motor durante fallecimiento.6/6 casos locales actuales,0 errores. Se usa ese contrato vigente en el CI, sin filtrar pruebas ni reducir la suite Node. C16 mantiene sus3 recorridos completos.

## Condición de integración: conservar el oráculo en la historia

El CI hace checkout histórico de57872ee, ancestro de esta rama pero no del main0b75d01 previo a D1/D2. Un squash/rebase seguido de limpieza de ramas experimentales podría dejar ese SHA fuera de lo que obtiene checkout fetch-depth0. **Bloquea una propuesta de squash/rebase que ignore esa dependencia**, no requiere reescribir el motor.

La descripción de PR propone merge commit convencional, cuando el creador lo autorice, para conservar la historia ylos SHA de las referencias. Así el oráculo sigue alcanzable desde main aunque se borren ramas de trabajo. Reversión futura: git revert -m1 del merge, revisando parent1; se restaura el toolchain anterior con sus propios comandos. Se consultó GitHub: allow_merge_commit=true (también permite squash/rebase); no se cambió esa configuración. No se creó tag/release/branch oficial ni se ejecutó ninguna fusión. Una estrategia distinta requeriría resolver antes la preservación del oráculo.

## Resultado de la auditoría A–D

| Área | Resultado y evidencia |
| --- | --- |
| A. Motor/estado/reglas | Importable y ejecutable sin DOM; getters globales document/window que fallan no se consultan. Datos/estado/clases por instancia, snapshots separados. Reglas y transiciones sin import de UI/agente.40/40 registros completos iguales contra cada referencia;20 pruebas D1.0 y5D1.1 conservadas. |
| B. Vista/comandos | Inventario original17 atributos estáticos+38 dinámicos migrados; nombres/argumentos/propagación/select/hover contrastados. No onclick/onchange ni globals del juego en producto. B1/B2 cierran referencias/callbacks; B3 deja10 listeners al rechazar duplicado y0 al desmontar/fallar. draw no procesa rescates ni consume RNG; ese procesamiento sigue en refresh de aplicación. |
| C. Agente | Consumidor opcional por capacidades/comandos; motor local inicia sin IA. Mismas políticas y prioridades V9.9, sin Utility AI/perfiles.40/40 resultados, eventos, mensajes y trace.step iguales;16 casos Chromium de issue7 sin errores. |
| D. Build/pruebas | esbuild0.28.2 fijado, npm ci yHTML determinista. Producto un script/estilo embebidos ysin recursos externos; offline4/4. QA separado con15 hashes de módulos iguales; producción sin eval/with/__test/testBindings.5 partidas de producto repiten clics reales sin API interna; invariantes privadas se comprueban en motor/QA, no se finge acceso interno a producción. |

### Clasificación final

| Hallazgo | Clasificación | Estado |
| --- | --- | --- |
| B1 referencias mediante prototipo de controles | Bloqueante | Corregido837e5ce; prueba reproduce escritura previa yprotección actual. |
| B2 callbacks de cartas en capacidades de vista | Bloqueante | Corregido5757a3c; efectos intactos, proyección de datos/elegibilidad por reglas. |
| B3 listeners residuales tras montaje fallido | Bloqueante | Corregidoee4b08e; dos pruebas rojas→verdes yreconexión limpia. |
| CI depende de57872ee alcanzable | Bloqueante para squash/rebase que pierda oráculo | Propuesta de integración conserva ascendencia mediante merge convencional. No se ejecutó; otra estrategia exige resolver antes esta condición. |
| Contexto interno de compatibilidad amplio | Mejora futura | Aceptar ahora; reducir cuando una funcionalidad concreta lo justifique. No seguir extrayendo por estética. |
| Schema/reglas V9.9 de dos grupos | Deuda heredada aceptada | Conservar. Singleplayer propio queda para desarrollo posterior autorizado. |
| VM/QA instrumentado yC15 con precondición superada | Deuda heredada aceptada | Conservar historia; usar contratos vigentes yHTML de producto para compuertas. No publicar QA como producto. |
| Android físico/TalkBack/otros navegadores/balance humano | Deuda heredada aceptada | No probados en esta tarea; emulación yregresión no certifican esas experiencias. |

## Validación y CI por SHA

| SHA | Prueba realizada | Resultado |
| --- | --- | --- |
| ee73d29 | npm ci/check:build/npm test al iniciar |462/462; se reprodujeron B1/B2/B3 fuera de esa cobertura inicial. |
|837e5ce | B1 dirigido y suite |463/463; B2/B3 aún no cerrados. |
|5757a3c | B1/B2 dirigidos, suite y40histórico |465/465 y40/40 iguales. |
|ee4b08e | Ciclo de vida y suite |467/467,0 omisiones. |
|352c094 | [CI40883941660](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40883941660) y[40883942064](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40883942064) | Regresión/engine aprobados; workflow completo **failure** por invocar el contrato histórico C15 que esperaba fuga de foco. No se presenta como verde. |
|6277e62 | [Regresión40884309357](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40884309357) y[arquitectura40884309718](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40884309718) | Ambos **success**, incluidos engine/browser.467/467,451/451 histórico y408/408 main;40/40 iguales contra cada referencia. |

Sobre6277e62 se repitieron localmente npm ci/check:build/npm test;467/467. Caracterización histórica conservada, sin skips ni cambios de reglas para pasar pruebas. No se disminuyó cobertura462: se añadieron5 regresiones de frontera/ciclo.

Chromium CI143.0.7499.4 ylocal154.0.8037.57:5/5 partidas QA y5/5 producto,0 errores/invariantes en recorridos;3 tamaños de producto320×640,393×852,1365×768;C16 3/3, inicio/pase6/6, C11 6/6 tamaños, C12/C13 6/6 cada uno, issue7 16/16 yterminal vigente6/6. Geometría real de dados≥44×44, sin overflow horizontal; controles/teclado/foco contrastados. Las cinco partidas conservan los resultados anteriores: IA2654435761 victoriaR4, IA1401181143 derrota moralR6; local2654435761 victoriaR2,3816266512 derrota moralR4,3189639203 victoriaR3.

file:// se intentó de nuevo localmente yChromium lo rechazó por política ERR_BLOCKED_BY_ADMINISTRATOR. EnCI:4/4 aperturas sin red, producto/QA ylocal/IA, sin solicitudes de recursos de red. No se eludió la política ni se declara aprobado localmente.

[La evidencia estructurada](evidencias/d1d2-cierre-integracion-ci.json) conserva pruebas, digests, semillas, geometría, errores, hashes, runs yel fallo histórico. Artifacts descargados ycomparados con fuentes locales:HTML producto`43b8883ad4821e4b50c40791615c5ef6c0b3030476409b4e1c6da4dbd872d692`;15 módulos compartidos idénticos entre builds. Capturas en Actions; no se añaden duplicados binarios al repositorio.

## Alcance del diff e integración propuesta

- Contra main0b75d01:108 archivos y78 commits hasta el contenido técnico6277e62; incluye muchos informes/evidencias históricas ySP-02 documental ya existente en la rama. No se implementó SP-02. El commit de cierre posterior solo añade/actualiza documentación.
- Contra57872ee: se revisaron los70 archivos de la extracción/adopción previa ylas correcciones de esta auditoría. Contra D1 originalba9a423 también se incluyen experimentos A/B; contra main, la extracción inicial del catálogo.
- Fuentes principales:src/domain (datos/estado/reglas/objetos/crisis), src/application (motor/turnos/colas/contratos/composición), src/presentation (render/eventos), src/agents (política de referencia). HTML generado, scripts/build/fixtures/pruebas yworkflows acompañan la separación. No framework ni dependencia de ejecución nueva.
- Correcciones de auditoría:837e5ce,5757a3c,ee4b08e. Preparación/validación CI:352c094 y6277e62. [Inventario con todos los SHA yarchivos](evidencias/d1d2-integracion-commits.json), rango exacto `0b75d01..6277e62`; no se propone integrar solo los últimos5 omitiendo las extracciones previas.
- main0b75d01 es ancestro de la rama actual, sin commits divergentes de main. No se hicieron merge/resets/force-push. Si main cambia antes de aprobar, esta comprobación debe repetirse.
- [PR propuesto69](69-pr-propuesto-d1-d2.md): título/descripción/riesgos/pruebas/reversión listos; base main, head rama actual. **PR no abierto**, por instrucción expresa. No se ejecutaron eventos de pull_request ni un commit de merge futuro que todavía no existe.

### Recomendación y punto de detención

**Aprobar técnicamente esta integración con historia conservada, sujeta a la revisión del creador/ChatGPT.** Los3 defectos funcionales de esta auditoría están corregidos ylas compuertas vigentes completas aprobadas. Las reservas de mantenimiento no justifican otra ronda genérica de refactor; la visión singleplayer se desarrollará cuando existan funcionalidades concretas autorizadas.

No se declara preservada una versión oficial ni iniciado el juego propio. Sin PR abierto/fusionado, cambios de main, tags o releases. **Única siguiente tarea:** revisar informe68, diff e informe69; decidir aceptación yapertura de PR. Me detengo en ese punto.

Nota de comprobación del diff: el diff de esta auditoría desdeee73d29 no tiene errores de espacios. El diff completo contra main señala dos espacios finales de Markdown enlíneas3/4 de la bitácora64: saltos de línea intencionales heredados, conservados; no se hace limpieza estética ni se presentan como error de código.
