# 27 — C6-R1: resolver botín antes de iniciar curación

**Fecha:** 27/10/2026. **Rama:** `fix/estabilizacion-v9-9`. **Incidencia relacionada:** [#9](https://github.com/LeviEdition/invierno-en-la-colonia/issues/9), hallazgo R1 de [revisión 26](26-revision-final-c5-c6.md). **Código y regresiones:** [a5043fa](https://github.com/LeviEdition/invierno-en-la-colonia/commit/a5043fadbaa686ed9d5c4cdc8c43ab90806baa52).

**Resultado:** R1 corregido y revisado en su alcance. Se rechaza la orden de iniciar curación si todavía se está eligiendo botín. Después de terminar la búsqueda, se puede curar o cancelar normalmente. C5-R2, #5, reglas, demás habilidades y `main` quedan fuera del cambio. PR #14 permanece abierto en borrador, sin aprobación formal ni fusión.

## Seguimiento posterior — 27/10/2026

La siguiente tarea propuesta al cerrar C6-R1, C5-R2, se completó después en [c19916f](https://github.com/LeviEdition/invierno-en-la-colonia/commit/c19916f609498a0e058ef19b257b0f134e0c8aa5). [Informe28](28-correccion-c5-r2.md) registra pruebas, revisión, entrega y límites. Las pruebas y el alcance de este informe27 corresponden al cierre de C6-R1; el estado operativo actual está en el tablero18.

## Precondición → acción → esperado → observado → prueba

- **Precondición:** Mara o Ada seleccionada, paciente válido en su localidad con una herida y una congelación, botín de una búsqueda real pendiente. Se usan dos daños, no un estado de tres daños que normalmente provocaría muerte.
- **Acción:** ejecutar `special()` mientras se conserva `lootChoice`.
- **Esperado:** mantener intactos partida, botín, habilidad, dados, manos y modal; no crear `pendingHeal`. La orden rechazada no se ejecuta automáticamente al cerrar el botín.
- **Antes:** se creaba `pendingHeal`, el permiso `playable()` pasaba a falso y `chooseLoot()` no podía resolver la carta. Se confirmaron **6/6 regresiones fallidas** antes de corregir. Los escenarios finales se volvieron a contrastar con el HTML de `4b98af4` leído mediante `git show`, fuera del checkout: **0 aprobadas y 6 fallidas por la superposición de decisiones**.
- **Después:** la búsqueda mantiene ruido y elección de una carta, sin duplicaciones ni mezcla de manos. Una nueva orden de curación funciona tras resolver el botín; elegir paciente cura una sola vez, cancelar conserva la habilidad y ambas rutas permiten buscar de nuevo.

## Corrección mínima y revisión

En `special()`, dentro de la rama `medic`/`nurse`, se añade solamente `if(pendingLoot)return;` antes de calcular pacientes y asignar `pendingHeal`. Evita crear el estado incompatible en lugar de permitir que `chooseLoot()` opere con dos decisiones superpuestas. No se modifican `playable()`, `chooseLoot()`, `chooseHeal()` ni el constructor (`builder`). Tampoco se añade una guardia general de todos los diálogos.

Una revisión independiente de solo lectura examinó alternativa, parche y pruebas; no encontró defectos en este ajuste. Recomendó mejorar la precondición del test de tres a dos daños: se hizo y se volvieron a ejecutar los checks afectados. No se afirma corrección exhaustiva de todas las combinaciones de decisiones ni de R2 de C5.

## Pruebas y evidencia

**Archivo:** `tests/modales-estados-pendientes.test.mjs`, seis casos C6-R1 (J1, J2 y humano contra IA, cada uno con curar/cancelar). Comprueban rechazo reiterado sin mutación, ruido, elección única, aislamiento de manos, resolución/cancelación, bloqueo de búsqueda durante una curación válida y nueva búsqueda después. Las 21 regresiones C6 previas siguen incluidas y aprobadas.

- **Archivo de modales:** 48 aprobadas, 0 fallidas/canceladas/omitidas, 0 TODO.
- **`npm test`:** 281 declaradas, **278 aprobadas, 0 fallidas/canceladas/omitidas y 3 TODO previos**, código de salida 0.
- **Chromium:** 12 recorridos dirigidos, en viewports 1365×768 y 393×852; por tamaño, J1/J2/humano contra IA y curar/cancelar. Se usa una llamada interna para reproducir la orden tardía `special()`; buscar, ruido, conservar carta, abrir habilidad, elegir paciente/cancelar y buscar de nuevo se verifican con botones reales. También se comprueba que búsqueda y consumo durante la curación permanezcan bloqueados. Sin errores JavaScript. El segundo tamaño es ventana estrecha, no Android físico ni prueba táctil.
- **Auxiliar de navegador:** la primera ejecución no encontró «Conservar Ración» porque el nombre incluye un icono; se corrigió el selector del auxiliar externo y se completaron los 12 recorridos. No fue un fallo del producto ni requirió cambios de interfaz. Experimentos y logs en `/tmp`; las seis regresiones reproducibles sí están incorporadas a la suite del repositorio.
- **Revisión de cambios:** `git diff --check`, comprobación de rama/PR y `main`. Solo código de `special()`, seis pruebas y documentación de esta tarea. Sin cambios de workflow, dependencias, autenticación o red.

**CI remoto confirmado:** [GitHub Actions sobre `a5043fa`](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40556617672), `completed/success`; logs: **281 declaradas, 278 aprobadas, 0 fallidas/canceladas/omitidas y 3 TODO**.

## Documentación, entrega y límites

Se actualizan tablero 18, registro 25, matriz 04, seguimiento del hallazgo en informe 26 y este informe 27. El código y las pruebas se subieron a la rama de estabilización; la documentación se registra en un commit posterior. Las ejecuciones CI se comprueban por el SHA de cada commit, sin inferir su resultado del de otro commit.

El hallazgo original de revisión 26 se conserva como histórico, con seguimiento hacia esta corrección. No se cierra #9 automáticamente ni se envían comentarios/revisiones formales de GitHub. `main` conserva `d9068f4`, blob HTML `4ebaedad13d63c7a6762c524a52c0dd9695687b1`. Android físico/TalkBack, balance y partidas naturales completas no se validan en este bloque.

**Siguiente tarea propuesta al cerrar C6-R1 (histórico): C5-R2 — proteger el fin de turno cuando la muerte ya está en cola, antes de abrir el aviso.** No se inició en C6-R1; su corrección posterior consta en el seguimiento de arriba. #5 y las decisiones de IA siguen estacionadas.
