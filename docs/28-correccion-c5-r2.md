# 28 — C5-R2: bloquear el turno desde que se encola la muerte

**Fecha:** 27/10/2026. **Rama:** `fix/estabilizacion-v9-9`. **Incidencia relacionada:** [#10](https://github.com/LeviEdition/invierno-en-la-colonia/issues/10), residual R2 de [revisión 26](26-revision-final-c5-c6.md). **Código y pruebas:** [c19916f](https://github.com/LeviEdition/invierno-en-la-colonia/commit/c19916f609498a0e058ef19b257b0f134e0c8aa5).

**Resultado:** C5-R2 corregido y revisado en su alcance. La transición se rechaza mientras exista una muerte pendiente de abrir o confirmar. Confirmar no ejecuta automáticamente las órdenes rechazadas: hace falta una nueva orden. C6-R1 se conserva; #5 y sus decisiones de estrategia no se implementan en este bloque.

## Problema y corrección mínima

**Precondición → acción:** partida en marcha y sin decisiones pendientes; ejecutar `kill(game.humans[1], 'regresión C5-R2'); finishTurn();` en la misma pila JavaScript, sin esperar entre las llamadas.

**Esperado:** conservar turno, ronda, selecciones, recursos y estados pendientes hasta confirmar el fallecimiento. **Antes:** `DeathDirector.record()` encolaba la muerte y programaba su apertura con `queueMicrotask`; mientras `active=false` y `pending.length=1`, la guardia permitía iniciar otra transición. Seis regresiones fallaron por ese motivo antes del ajuste.

**Cambio:** añadir únicamente `deathDirector.pending.length` a la guardia de entrada de `finishTurn()`, junto a `deathDirector.active`. El criterio coincide con el usado por `DeathDirector.wait()`. No se usa `scheduled` como bloqueo porque puede quedar una microtarea programada sin avisos pendientes.

No se cambian `record()`, `open()`, `continue()`, `wait()`, `playable()` ni el flujo interno de una transición ya iniciada. Esta guardia tampoco adelanta, consume ni abre el aviso: mantiene los mecanismos existentes.

## Pruebas y revisión

**Archivo:** `tests/modales-estados-pendientes.test.mjs`. El fixture acepta `realMicrotasks=false`; solo los casos nuevos activan `queueMicrotask` nativa y los anteriores conservan su simulación.

- **Seis regresiones:** J1 local, J2 local y humano contra IA; un aviso o segundo fallecimiento encolado durante el primero. La muerte y los intentos de transición se ejecutan en una misma llamada al contexto, antes de cualquier `await`. Se captura explícitamente `active=false,pending=1` y estado intacto. Se prueban llamadas reiteradas y la entrada del menú, apertura de microtarea real, rechazo durante el aviso, confirmación de todos los avisos y recuperación con una nueva orden. **Antes: 0 aprobadas y 6 fallidas; después: 6 aprobadas.**
- **Un control adicional:** una crisis real de colonia causa la tercera herida de Sol, sin sustituir `colony()`. La transición ya iniciada espera el aviso, rechaza reentradas y luego completa una sola fase de colonia y una ronda. Su propósito es proteger las esperas internas, no reproducir otro defecto.
- **Pruebas del archivo:** 55 aprobadas, 0 fallidas/canceladas/omitidas, 0 TODO.
- **`npm test`:** 288 declaradas, **285 aprobadas, 0 fallidas/canceladas/omitidas y 3 TODO previos**, código de salida 0. Conserva C5/C6 y C6-R1.
- **Revisión independiente de solo lectura:** sin defectos en el parche ni las siete pruebas. Dos experimentos adicionales en Node comprobaron muertes durante colonia local y al comenzar la IA: ambas transiciones originales esperaron y continuaron hasta ronda 2. No se contabilizan como pruebas nuevas de la suite.
- **Chromium:** 12 recorridos dirigidos en 1365×768 y 393×852; tres turnos × uno/dos avisos × dos viewports. Llamadas internas reproducen la ventana de cola y sus reintentos; botones reales «Continuar» y «Terminar turno» verifican confirmación y recuperación. Se usa el mecanismo nativo de microtareas, sin errores JavaScript. Ventana estrecha no equivale a prueba táctil ni Android físico.

**CI remoto confirmado:** [GitHub Actions de `c19916f`](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40557908505), `completed/success`; logs: **288 declaradas, 285 aprobadas, 0 fallidas/canceladas/omitidas y 3 TODO previos**.

## Registro, entrega y límites

Se actualizan tablero 18, registro 25, matriz 04, seguimientos 26/27 y este informe. Se comprueban `git diff --check`, rama, PR y estable. Código/pruebas subidos en `c19916f`; documentación en commit posterior cuya ejecución CI se verifica por su propio SHA.

R2 era una defensa interna residual: no se demostró un salto iniciado por clics normales, porque las microtareas se procesan entre eventos de usuario. El ajuste garantiza el contrato también para llamadas internas. No se certifican todas las combinaciones del motor, balance, partidas naturales completas, Android físico ni TalkBack.

PR #14 sigue abierto y en borrador, sin aprobación formal, cierre automático de incidencias ni fusión. `main` permanece en `d9068f4`, blob HTML `4ebaedad13d63c7a6762c524a52c0dd9695687b1`. No hubo cambios de reglas, dependencias, workflow, credenciales o red.

**Siguiente tarea única propuesta: definir la prioridad de la IA para aportar herramientas a la crisis (#5), antes de programar ese cambio.** La decisión entre donar, equipar y conservar necesita acuerdo del creador. No se inició en C5-R2; #4 y #6 mantienen sus decisiones pendientes.
