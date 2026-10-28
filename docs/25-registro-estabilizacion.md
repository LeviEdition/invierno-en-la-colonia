# 25 — Registro de estabilización V9.9 (C1–C15)

**Última actualización:** 28/10/2026, Montevideo. **Rama:** `fix/estabilizacion-v9-9`. **Estado vigente:** C12/H1, C13 y C14 aprobados por pruebas/revisión/CI; auditoría C15 con T1/T2 corregidos y402/402 local/independiente, revisión documental aprobada/CI de entrega pendiente. [Informe49](49-c15-auditoria-final.md) y tablero18 determinan el próximo paso: completar entrega, luego aceptación del creador. A1 foco general permanece como reserva; C no está oficialmente cerrada. #4/#5/#6 ya aceptados/cerrados; otros nueve issues siguen abiertos. Sin integración en main, cierres nuevos ni publicación estable. Las secciones siguientes son historia de cada revisión.

## Análisis de continuidad tras otro chat — 27/10/2026

**Acciones:** comprobar copia limpia `e7d0a48`, refs GitHub y ascendencia, descargar/avanzar por fast-forward a `d09021f`; leer informes29–39, tablero, matriz, diff y tests; consultar PR/issues/comentarios y CI; ejecutar `npm test` una vez sobre el estado nuevo. Dos lecturas independientes contrastaron código/documentación sin duplicar la suite. [Informe40](40-estado-actual-y-continuidad.md) conserva detalle y límites.

**Hechos confirmados:** 78 commits nuevos; C7/C7-R1, C8, UX combustible y C9/C9-R1 presentes; #5/#4/#6 cerrados, PR14 abierto/draft sin fusión, `main=d9068f4` y blob original sin cambios. Local: **336 aprobadas, 0 fallidas/canceladas/omitidas y 0 TODO**. [CI de `d09021f`](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40595507459) y sus logs coinciden. No se ejecutó navegador aquí; verificaciones dirigidas del otro chat se mantienen como evidencia documental.

**Resultado y documentación:** se actualizaron cabeceras obsoletas de conteos/#4/etapa y este resumen; matriz04 enlaza informe40. El título/cuerpo del PR14 sigue desactualizado, pendiente administrativo no editado aquí. No hay nuevo defecto confirmado ni cobertura completa de la reserva de dos líderes muertos simultáneamente. La tarea #7 sigue como propuesta pendiente de análisis autorizado, no implementación.

**Archivos modificados por este análisis:** solo informe40, tablero18, registro25 y matriz04; `git diff --check` y entrega en rama de estabilización, con CI del commit documental comprobado por SHA. No se cambió código del juego, pruebas, reglas, workflow, issues o configuración; ninguna fusión/publicación.

## Entrega C5/C6 para revisión

Código y pruebas en [d4a6b3f](https://github.com/LeviEdition/invierno-en-la-colonia/commit/d4a6b3f45dc5c2563420980acf436a15e694775a), documentación de entrega en [64dcc2c](https://github.com/LeviEdition/invierno-en-la-colonia/commit/64dcc2c90714a5eab6c8dd1e1b4bd3d10d814dd3). Ambos subidos a `fix/estabilizacion-v9-9`. Al revisar, el PR #14 apunta a `64dcc2c`, abierto y en borrador, base `refactor/arquitectura`, sin revisiones formales. `main` sigue en `d9068f4`, blob estable `4ebaedad13d63c7a6762c524a52c0dd9695687b1`. Sin fusión, cierre de issues ni nueva versión.

**Validación:** [CI de código `d4a6b3f`](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40552155171) y [CI de entrega `64dcc2c`](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40552240429) terminaron `completed/success`. Se leyeron los logs de la segunda ejecución: **275 declaradas, 272 aprobadas, 0 fallidas/canceladas/omitidas y 3 TODO**. Los resultados de implementación de C5/C6 de abajo son históricos; este apartado determina su entrega actual.

### Revisión documental y resolución de acceso — 27/10/2026

- **Acciones y diagnóstico:** se verificaron presencia de autenticación y configuración sin imprimir valores; la consulta a la API, incluso pública, fallaba antes de autenticarse, con `Tunnel connection failed: 403 Forbidden`. La configuración restringida no incluía `api.github.com`. Se guardó únicamente ese dominio adicional, preservando los destinos existentes. Tras aplicar el cambio el usuario, se verificaron API, PR y ejecuciones CI correctamente; no se pidió otro token.
- **Decisión del usuario:** toda revisión debe terminar con el tablero actualizado y todo trabajo debe documentarse. Regla persistida en `docs/15-protocolo-revision-critica.md` y en el protocolo de cierre de `docs/18-tablero-operativo.md`.
- **Revisión de documentación:** se compararon tablero, este registro y matriz; una revisión paralela de solo lectura señaló referencias actuales obsoletas a CI pendiente, entrega local y SHA anterior del PR. Se corrigieron, conservando explícitamente los resultados históricos por etapa. No se revisó ni modificó el código del juego en este bloque.
- **Archivos modificados y motivo:** documentos 15 (regla), 18 (estado y siguiente tarea), 25 (acciones/evidencia) y 04 (cobertura y entrega). Comprobación documental: `git diff --check`. Sin repetición local de la suite ni del navegador: los archivos ejecutables no cambiaron. La subida de esta documentación y su CI se verifican por el SHA del nuevo commit, sin anticipar su resultado ni reescribir la evidencia de `64dcc2c`.
- **Límites y siguiente tarea al cerrar aquella revisión documental:** la revisión final de código C5/C6 estaba pendiente; no confundir esta revisión documental ni CI verde con aprobación formal del PR. Android físico/TalkBack siguen pendientes. #5 sigue como propuesta posterior, sin política de IA decidida ni implementación autorizada. No se inició otra corrección ni se fusionó.

## Revisión final C5/C6 — 27/10/2026

**Revisión realizada, sin aprobación de integración.** Se comparó `5b3a663..247f819`, con dos revisiones independientes de solo lectura; se verificaron los hallazgos en Node y Chromium y se consultó el estado del PR/CI. [Informe 26](26-revision-final-c5-c6.md) conserva alcance, ubicaciones, reproducciones, resultados y límites.

- **R1/P2, regresión C6:** iniciar curación mediante `special()` mientras hay botín pendiente bloquea `chooseLoot()`. Reproducido en J1, J2 y humano contra IA; comparado con `5b3a663`, donde sí se permite resolver el botín. Requiere corrección antes de recomendar integración.
- **R2/P2, residual preexistente C5:** una muerte en cola puede preceder a `finishTurn()` en la misma pila, antes de abrirse su microtarea. Reproducido con microtareas reales en Node y en Chromium local/IA; no es una regresión del parche ni un salto demostrado por clic normal.
- **Validación:** 65/65 pruebas relevantes aprobadas y [CI de `247f819`](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40554797945) verde. Ocho escenarios dirigidos Chromium confirman los hallazgos sin errores JS; no se contabilizan como pruebas aprobadas del juego. Sin nuevas pruebas en el repositorio, sin repetir suite local completa ni Android/TalkBack.
- **Cambios de este bloque:** solo informe 26, tablero 18, este registro y matriz 04, comprobados con `git diff --check` y entregados en la rama de estabilización. Código, reglas, tests, `main`, workflow y configuración intactos. No se publicaron comentarios/revisiones formales de GitHub ni se cerraron issues. La ejecución CI del commit documental se comprueba por su SHA tras subirlo.
- **Siguiente tarea única:** C6-R1, regresión y arreglo mínimo de la combinación botín/curación; no se implementó en esta revisión. R2 queda como residual posterior. #5 no iniciado ni regla de IA decidida.

## C6-R1 — Corrección del hallazgo R1, 27/10/2026

**Implementada y revisada en su alcance:** [a5043fa](https://github.com/LeviEdition/invierno-en-la-colonia/commit/a5043fadbaa686ed9d5c4cdc8c43ab90806baa52). [Informe 27](27-correccion-c6-r1.md) conserva precondición/acción/esperado/observado, pruebas, diagnóstico del auxiliar y límites. Una guardia `if(pendingLoot)return;` al iniciar la rama médica/enfermera impide superponer curación con botín; no se modificaron otros permisos, habilidades o C5-R2.

**Evidencia:** seis regresiones fallidas contra la versión anterior y aprobadas tras el arreglo. 48/48 en modales; `npm test`: **281 declaradas, 278 aprobadas, 0 fallidas/canceladas/omitidas y 3 TODO previos**. Chromium: 12 recorridos de curar/cancelar y recuperación en tres turnos, dos viewports; sin errores JS. Revisión independiente sin defectos; se refinó la precondición a paciente con dos daños no letales. No se valida móvil físico ni balance.

**CI remoto confirmado:** [GitHub Actions sobre `a5043fa`](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40556617672), `completed/success`; logs: **281 declaradas, 278 aprobadas, 0 fallidas/canceladas/omitidas y 3 TODO**.

**Documentación y entrega:** tablero 18, este registro, matriz 04, seguimiento 26 e informe 27 actualizados. Código y regresiones subidos a la rama del PR #14; documentación en commit posterior. Sin comentarios de GitHub, aprobación formal, cierre de issues, fusión o cambios a `main`. Los informes anteriores describen la revisión y fallos históricos; R1 queda corregido por esta tarea. Siguiente tarea única propuesta C5-R2, no iniciada; #5 continúa estacionada.

## C5-R2 — Corrección del residual R2, 27/10/2026

**Corregida y revisada en su alcance:** [c19916f](https://github.com/LeviEdition/invierno-en-la-colonia/commit/c19916f609498a0e058ef19b257b0f134e0c8aa5). [Informe 28](28-correccion-c5-r2.md) conserva precondición, secuencia síncrona, resultados, revisión y límites. Se añade solo `deathDirector.pending.length` a la guardia inicial de `finishTurn()`, sin alterar `DeathDirector` ni transiciones ya iniciadas.

**Evidencia:** seis regresiones fallaron antes y pasan después; un séptimo control de colonia real preserva la espera y evita duplicación. 55/55 en modales. `npm test`: **288 declaradas, 285 aprobadas, 0 fallidas/canceladas/omitidas y 3 TODO previos**. Chromium: 12 recorridos, dos viewports, tres turnos y uno/dos avisos; sin errores JS. Revisión independiente sin defectos; dos experimentos adicionales verifican esperas de colonia local e inicio de IA. No se atribuye fallo de clic normal ni validación móvil física.

**CI remoto confirmado:** [GitHub Actions de `c19916f`](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40557908505), `completed/success`; logs: **288 declaradas, 285 aprobadas, 0 fallidas/canceladas/omitidas y 3 TODO previos**.

**Registro y entrega:** tablero18, este registro, matriz04, seguimientos26/27 e informe28 actualizados. Código y siete pruebas subidos a la rama del PR14; documentación en commit posterior, cuya ejecución CI se comprueba por SHA. `git diff --check`; sin fusión, revisión formal, cierre de incidencias ni cambios en `main`, C6, reglas o configuración. Siguiente tarea única propuesta: acordar prioridad IA #5, no iniciada aquí.

## Revisión de diseño #5 — propuesta de prioridad de herramientas, 27/10/2026

**Alcance y hechos:** lectura de `botTurn()`, `CrisisManager`, `resolveCrisis()`, catálogo, fin de turno, issue#5 y su TODO. Se confirmó aporte por carta, umbral completo, costo de equipo y posibilidad de encontrar herramientas después del bloque actual de donación. Una revisión independiente de solo lectura comprobó las alternativas; sin cambios de código.

**Propuesta, no decisión:** contar herramientas al final de las acciones y aportar solo si permite completar, primero mano y luego equipo propio (incluso última herramienta), exactamente lo faltante y sin bonus. Conservar si no alcanza o ya se cumplió. Limitada a herramientas: no modificar otros recursos, reglas ni decisiones #4/#6. [Informe29](29-propuesta-prioridad-ia-herramientas.md) conserva cinco escenarios, costo estratégico y alternativa de proteger siempre el equipo.

**Estado y validación:** se pidió al creador aprobar/ajustar la política; respuesta pendiente al registrar esta revisión. No se ejecutaron pruebas nuevas ni se añadió cobertura: #5 sigue sin implementar. Solo informe29, tablero18 y registro25, `git diff --check`; se verificó PR en borrador, `main` intacta y CI existente de `9041d95` verde. La ejecución del commit documental se comprueba por SHA sin atribuirle validación de la propuesta. No hay fusión ni cierre de #5.

**Siguiente tarea única:** decidir con el creador y registrar la política; implementación/regresiones en un bloque posterior a su aprobación.

## Seguimiento de continuidad #5 — revisión crítica y verificación de repositorio (27/10/2026)

**Estado inicial confirmado:** `main=d9068f4`, `refactor/arquitectura=0933c70`, `fix/estabilizacion-v9-9=e7d0a48` (tres comparaciones idénticas a sus refs conocidas); PR #1 y PR #14 abiertos/en borrador, #14 base `refactor/arquitectura`. Blob original de V9.9 intacto. Issue #5 abierto. La ejecución [40559396788](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40559396788) fue confirmada mediante job y logs: checkout del SHA `e7d0a48`, 288 tests, 285 aprobados, 0 fallidos, 3 TODO. No significa que #5 esté arreglado.

**Hallazgo nuevo de lectura:** una herramienta hallada por la IA puede equiparse inmediatamente en `stashLoot()`; la evaluación final debe revisar mano **y** equipo. Las herramientas palanca/linterna/reparación dan beneficios futuros diferentes. Donar incluso la última herramienta para evitar una penalización pequeña puede ser perjudicial, aunque una crisis grave justifique el aporte. La recomendación sigue siendo la política simple del [informe29](29-propuesta-prioridad-ia-herramientas.md), con desempate determinista entre equipos, siempre condicionada a autorización del creador. Alternativas documentadas: proteger equipo o estimar costo-beneficio (más complejidad).

**Acciones y límites:** lectura remota de código, documentación, issue, PRs y logs; ninguna prueba nueva, navegador ni dispositivo físico en este bloque. No se alteró el HTML, tests, issues, PRs ni las ramas base; solo documentación en rama C. No fusionar ni presentar recomendaciones como política aprobada. **Siguiente tarea única:** decisión del creador para #5; regresiones/código solo en un bloque posterior si se aprueba.

## C7 / Issue #5 — Aprobación y corrección de herramientas IA

**Decisión del creador (27/10/2026):** política A. La IA debe completar toda crisis de herramientas que pueda, sumando los aportes humanos realizados antes, usando primero su mano y después su equipo de supervivientes vivos en orden determinista, exactamente lo necesario y sin buscar bonus. También se especificó **buscar objetos antes de evaluar si salva la crisis**. El humano ya jugó cuando la IA decide; si aún faltan dos aportes y solo tiene uno, no existe una acción humana posterior antes de colonia y la IA conserva esa herramienta.

**Cambio:** [4166716](https://github.com/LeviEdition/invierno-en-la-colonia/commit/416671673c81c4aa88d91d06209a53855efb69c8) introduce `botContributeTools()` al final de `botTurn()` y excluye herramientas del bloque temprano. Diez regresiones reemplazan TODO #5. Las pruebas primero detectaron fallos esperados antes del arreglo: [CI rojo](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40571566484) (7 fallos C7). Luego [CI verde 40571819429](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40571819429): 297 declaradas, 295 aprobadas, cero fallidas y dos TODO (#4 y #6). Casos y evidencias en [informe30](30-correccion-c7-ia-herramientas.md).

**Límites:** las búsquedas normales ocurren antes de decidir la donación y pueden encontrar herramientas, pero la IA aún no prioriza específicamente el botín de crisis. No se modificaron otros tipos de recursos, modo local, `main` ni configuración; no se hicieron pruebas nuevas de Chromium, Android físico, TalkBack o balance. PR #14 sigue en borrador y issue #5 abierto.

**Única tarea siguiente:** revisión crítica posterior C7 antes de considerar integración.

## Origen del trabajo

[Informe A6 y lista de prioridades](24-cierre-auditoria-y-prioridades.md). A5-02 en Android físico sigue sin checklist formal y NO se afirma realizado. El usuario autorizó avanzar con correcciones conociendo esa reserva.

**Regla de aislamiento:** el archivo `invierno_colonia_v9_9.html` de **`main` y `refactor/arquitectura` permanece original**, SHA de blob `4ebaedad13d63c7a6762c524a52c0dd9695687b1`. Los cambios al motor existen **solamente en esta rama de estabilización**. No es una versión publicada ni aprobada para reemplazar la estable.

## Correcciones

### C1 — [#11](https://github.com/LeviEdition/invierno-en-la-colonia/issues/11): victoria que llega tarde durante turno IA

**Defecto previo:** IA completa las muestras mediante notas de laboratorio, pero la fase de colonia podía reducir a cero la moral y terminar por derrota sin reconocer la victoria alcanzada.

**Cambio mínimo:** cuando `botTurn()` consume una nota de investigación, ejecuta `verify()` **antes de continuar la fase de turno o de colonia**. Si se alcanzó un final, sale del turno. Se conserva el modo local y humano.

**Regresiones:** prueba de IA con dos notas, objetivo 2/2, comida 0 y moral 1 que ahora requiere **victoria en ronda 1, moral 1, sin fase de colonia**. Otra prueba exige que, si basta la primera nota, la IA no siga consumiendo las notas restantes.

**Compromiso:** este arreglo puntual corrige la ruta observada. Cuando desacoplemos el motor habrá que centralizar y auditar todas las fuentes de progresión de objetivo para evitar verificaciones tardías.

### C2 — [#2](https://github.com/LeviEdition/invierno-en-la-colonia/issues/2): encrucijadas y cartas estructuradas

**Defecto previo:** `crossOptionAllowed()` y los efectos de `Fiebre en el refugio`, `El generador averiado` y `La guardia nocturna` buscaban literales como `hand.includes('medicina')`, aunque la mano contiene cartas estructuradas.

**Cambio mínimo:** elegibilidad con `hand.some(it=>kind(it)===tipo)`; selección/consumo con `findIndex(it=>kind(it)===tipo)`, tomando **exactamente una carta válida** del lado que juega. Se mantienen compatibles las cartas antiguas que aún llegan representadas como cadenas.

**Regresiones:** tres recursos válidos permiten las opciones y se consumen una vez; cartas no relacionadas permanecen; sin recurso la opción no se puede ejecutar; J2 no consume la medicina de J1; cartas antiguas siguen siendo aceptadas. Se actualizó el escenario A3 de «opción deshabilitada» para **retirar explícitamente la medicina**, porque su premisa antigua era incorrecta tras el arreglo.

### C3 — [#3](https://github.com/LeviEdition/invierno-en-la-colonia/issues/3): mejora de dados para J2

**Defecto previo:** `boostDie()` usaba `!game.dice.length` (dados de J1) para validar disponibilidad, aun cuando J2 usa `game.botDice`.

**Cambio mínimo:** validar la reserva activa mediante `actionDice()`, sin cambiar la regla de costo (1 comida) ni el límite de valor 6.

**Regresiones:** J2 puede subir su dado aunque J1 haya agotado los suyos; sin dados propios J2 no gasta comida; no mejora un 6; comida insuficiente impide mejorar; el aislamiento entre jugadores se conserva.

### C4 — [#12](https://github.com/LeviEdition/invierno-en-la-colonia/issues/12): foco del teclado escapa de inicio y pase

**Defecto previo:** las superposiciones `#setupScreen` y `#passScreen`, pese a declararse `aria-modal`, no enfocaban sus botones al abrir ni impedían navegar con Tab a objetivos y estadísticas del tablero. También era posible dar foco a `#goalCard` detrás del pase.

**Cambio acotado:** un gestor de accesibilidad para estas **dos pantallas de entrega**:
- El foco entra automáticamente en el primer botón al cargar o abrir el diálogo.
- Tab y Shift+Tab circulan únicamente entre sus botones; un intento de foco externo se devuelve al diálogo.
- Los hijos del `body` ajenos al diálogo activo se vuelven temporalmente `inert`; al cerrar, se restaura la navegación del tablero.
- Después del pase, el foco vuelve al menú del juego o a un modal que ya estaba abierto.
- No se cambian reglas, dados, objetos ni las demás ventanas del juego. Lectores de pantalla y Android real siguen pendientes.

**Pruebas de regresión:** `tests/accesibilidad-pase-c4.test.mjs`, **cinco casos** de foco inicial, ciclo Tab/Shift+Tab, contenido inerte, restauración y ausencia de bloqueo después de cerrar.

**Verificación en navegador:** Chromium headless ejecutó una copia local de la V9.9 estable con **solo el parche C4 de interfaz** en viewports **1365×768, 393×852 y 320×640**. Se comprobó Tab, Shift+Tab, Enter para comenzar modo local, Enter para confirmar pase, redirección del foco fuera del diálogo, desbloqueo posterior y ausencia de errores JS. La suite CI, en cambio, corre sobre **toda la rama real** con C1–C4; no se afirma que la copia visual contenía también las correcciones anteriores.

**Nota de regresión:** la primera ejecución CI detectó que un test antiguo simula `classList` sin `contains()`; se hizo opcional esa comprobación de apertura del modal. La suite completa volvió a quedar verde. Los tests nuevos con DOM simulado confirman el contrato, pero no reemplazan Chromium.

### C5 — #8 y #10: guardias de fin de turno

**Precondición:** pantalla de pase/inicio o diálogo de fallecimiento activo. **Acción:** llamada directa a `finishTurn()` o entrada `menuEndTurn()`. **Esperado:** conservar el estado hasta confirmar. **Observado antes:** el pase permitía procesar colonia y cambiar de ronda; el fallecimiento permitía pasar al siguiente jugador. Tres regresiones locales fallaron antes de cambiar el código.

**Solución:** ampliar únicamente la guardia inicial de `finishTurn()` con `passScreenActive || deathDirector.active`. El control se hace antes de abrir otros diálogos o alterar selecciones, turno y recursos. Se descarta la orden bloqueada; confirmar no termina el turno automáticamente. No se cambian `playable()`, reglas, IA estratégica ni accesibilidad C4.

**Pruebas:** las dos caracterizaciones defectuosas de A2/A3 ahora exigen estado intacto. Se añadieron bloqueo en inicio y fallecimiento en modo IA. Cuatro casos C5 comprueban llamadas reiteradas, ruta del menú y recuperación después de confirmar. El caso de pase protege también la vuelta a J1 en ronda 2. El adaptador A3 omite únicamente la demora de animación con un temporizador inmediato, conservando `botTurn()`, colonia y transición reales.

**Resultados locales:** 45/45 en los dos archivos afectados; `npm test` termina con código 0: **255 declaradas, 252 aprobadas, 0 fallidas, 0 canceladas, 0 omitidas y 3 TODO previos**. Chromium sobre el HTML de esta rama confirmó muerte/Continuar/avance en local e IA; pase/reintentos/confirmación y ronda 2 en local. Sin errores JavaScript. Escenarios dirigidos mediante preparación de estado y llamadas internas: no se afirma un fallo explotable por clic normal, partida completa, Android físico ni accesibilidad nueva.

**Revisión al cierre de la implementación C5:** cambios locales sin fusionar. `origin/main` conserva `d9068f4` y el blob estable `4ebaedad13d63c7a6762c524a52c0dd9695687b1`. En aquel momento no se había confirmado CI de C5 porque la API denegaba la consulta; la entrega actual y su CI están documentados arriba. No se cierran issues ni se publica una versión.

### C6 — #9: acciones durante curación pendiente

**Fallo comprobado:** con `pendingHeal` activo, una llamada a `playItem()` podía consumir raciones. Las entradas `equipItem()`, `contribute()`, `contributeEquipment()` y `startTransfer()` también permitían alterar mano, equipo, crisis o decisiones pendientes. Se reprodujeron los cinco comandos con recursos válidos en J1/J2 local y humano contra IA: **15 pruebas fallidas antes del parche**; las 6 pruebas de curar/cancelar ya pasaban.

**Cambio mínimo:** `playable()` añade `!pendingHeal` a la comprobación común de acciones; evita repartir la misma condición entre cinco entradas. `chooseHeal()` utiliza `controls.interactive` para que la elección de paciente siga habilitada, respetando fin de partida, pase y turno IA. El bloqueo no consume cartas ni la habilidad. La acción de curar conserva su efecto único; cancelar libera sin gastar la habilidad. No se cambia el comportamiento de otros diálogos ni reglas ambiguas.

**Pruebas y evidencia:** `tests/modales-estados-pendientes.test.mjs` reemplaza la caracterización defectuosa por **21 casos C6** (15 bloqueos y 6 recuperaciones). 42/42 pruebas en ese archivo. `npm test`: **275 declaradas, 272 aprobadas, 0 fallidas/canceladas/omitidas y 3 TODO anteriores**. Las regresiones C5 siguen verdes. Chromium, 1365×768, ejecutó seis recorridos dirigidos sobre el HTML de la rama: elegir paciente/cancelar, cada uno para J1, J2 y humano contra IA; consumo rechazado durante curación y permitido después, sin errores JavaScript. Se utilizaron los botones reales para resolver/cancelar y llamadas internas para reproducir el defecto. Preparación controlada de heridas y cartas: no partida completa ni Android/TalkBack.

**Estado al cierre de la implementación C6 (previo a la entrega registrada arriba):** se conservan todos los cambios locales de C5. C6 sin commit, subida, CI remoto ni fusión; `main` permanece original. El PR #14 todavía no contiene C5/C6. No se cierra #9 automáticamente. No se inicia otro defecto.

## Evidencia

- [CI confirmado de entrega C5/C6, `64dcc2c`](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40552240429): **275 declaradas, 272 aprobadas, 0 fallidas/canceladas/omitidas y 3 TODO**.
- [Evidencia histórica C4](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40541776775): 253 declaradas, 250 aprobadas, 0 fallidas y 3 TODO.
- Los 3 `test.todo` son anteriores y están ligados a reglas/situaciones pendientes; **no son fallas de los arreglos nuevos**.
- En los tests anteriores de caracterización se reemplazaron las expectativas defectuosas por expectativas de comportamiento correcto.
- Los informes de pruebas automatizadas **no sustituyen prueba manual en Android** ni certifican balance real.

## Pendientes de estabilización

| Prioridad siguiente | Issue | Motivo |
| --- | --- | --- |
| **C4 completada** | [#12](https://github.com/LeviEdition/invierno-en-la-colonia/issues/12) | Foco de inicio/pase corregido en rama; revisión de accesibilidad real adicional pendiente |
| **C5-R2 corregida y revisada** | [#8](https://github.com/LeviEdition/invierno-en-la-colonia/issues/8) + [#10](https://github.com/LeviEdition/invierno-en-la-colonia/issues/10) | Guardia de cola R2 añadida; regresiones, navegador y CI en informe 28 |
| **C6-R1 corregida y revisada** | [#9](https://github.com/LeviEdition/invierno-en-la-colonia/issues/9) | R1 resuelto: curación espera al botín; pruebas y revisión en informe 27 |
| **C7 y C7-R1 revisadas y probadas en Chromium; aceptación de #5 pendiente** | [#5](https://github.com/LeviEdition/invierno-en-la-colonia/issues/5) | Política A y prioridad condicional de botín aprobadas y corregidas; informes30/32 |
| Más adelante | [#13](https://github.com/LeviEdition/invierno-en-la-colonia/issues/13), [#7](https://github.com/LeviEdition/invierno-en-la-colonia/issues/7) | Ergonomía móvil, selección estructurada de encrucijadas |
| Requiere al creador | [#4](https://github.com/LeviEdition/invierno-en-la-colonia/issues/4), [#6](https://github.com/LeviEdition/invierno-en-la-colonia/issues/6) | Transferencias entre grupos y momento de elección de líder inicial |

**No dar por cerrado ningún issue automáticamente:** el cambio permanece en rama, no está integrado a la versión estable. Las incidencias se podrán cerrar tras revisión/promoción y verificación correspondiente.

## Revisión crítica posterior de C7 — 27/10/2026 (solo lectura)

Se verificó que la rama estaba en `9907cdb3`, PR #14 abierto en borrador/base `refactor/arquitectura`, issue #5 abierto y `main=d9068f4`. Se leyó el flujo real de `botTurn`, `botContributeTools`, `beginSearch`, `stashLoot`, `CrisisManager`, colonia y regresiones. [CI 40572758503](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40572758503) confirmó 297 declaradas, 295 aprobadas, 0 fallidas y dos TODO. No hubo pruebas dinámicas nuevas ni revisión externa.

[Informe 31](31-revision-critica-c7.md): **no se detectó un fallo nuevo en la donación de herramientas C7** por inspección, pero el criterio de botín de la IA puede favorecer una muestra (10 puntos) sobre una herramienta (3 puntos) incluso si esa herramienta salvaría la crisis. Hallazgo H1/P2 está fundado en lectura de código y requiere regresión integral. Separadamente, H2 describe el límite anterior: las crisis de comida, medicina y combustible no se reevalúan después de buscar; no es regresión de C7 ni está autorizado ampliar su alcance.

Se registraron escenarios precondición → acción → esperado → resultado derivado del código y límites en el informe31 y tablero18. **Solo documentación**, sin tocar código, tests, `main`, incidencias, PR o versiones. Revisión completada **con reserva estratégica H1**; no declarar issue #5 terminado. Próxima tarea única: decidir si la elección de botín favorece una herramienta cuando efectivamente completaría la crisis, sin sacrificar una victoria inmediata por muestras. No implementar antes de esa regla explícita.

## C7-R1 — Prioridad de herramienta salvadora durante elección de botín (27/10/2026)

**Decisión explícita del creador:** tras el hallazgo H1 de [revisión31](31-revision-critica-c7.md), aprobar que la IA elija una herramienta revelada cuando esta carta permita completar la crisis en la misma ronda, excepto si otra carta produce una **victoria inmediata por objetivo**. Se contabilizan aportes humanos ya efectuados y mano/equipo propio vivo, y la excepción contempla el doble aporte de la habilidad `researcher`.

**Pruebas antes:** ocho regresiones nuevas [`5debdbd`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/5debdbd49289b1e464e9df7a8384b6a41f95c0fc), [CI 40575929242](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40575929242): **305 declaradas, 300 aprobadas, 3 fallidas esperadas y 2 TODO**. Los fallos fueron selección de herramienta vs muestra y turno integrado, no fallos introducidos por un parche todavía inexistente.

**Corrección acotada:** [`f1e75ed`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/f1e75edc28a317a3d6745079d19e07558987a10a) ajusta el criterio de puntuación únicamente en `beginSearch()` cuando el turno corresponde a IA; `botContributeTools()`, modo local y tipos comida/medicina/combustible no cambian. **CI después:** [Actions 40576075140](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40576075140): **305 declaradas, 303 aprobadas, 0 fallidas, 2 TODO** (#4/#6).

**Informe y límites:** [documento32](32-correccion-c7-r1-prioridad-botin.md); no dirige las búsquedas a una localidad particular, sino que decide entre objetos efectivamente revelados. Sin prueba manual adicional en Chromium/Android, sin estadística de balance; revisión crítica posterior pendiente. No modificar `main`, fusionar PR #14 ni cerrar #5.

**Siguiente tarea única:** revisión posterior independiente de C7-R1 y no empezar otro issue.

## Revisión crítica posterior de C7-R1 — 27/10/2026

[Informe33](33-revision-critica-c7-r1.md): se contrastaron explícitamente `beginSearch()`, `stashLoot()`, `gainSample()` (incluyendo el bono investigador), `botContributeTools()`, `CrisisManager.add()`, `botTurn()`/colonia y ocho pruebas C7-R1. **No se identificaron nuevos defectos del parche por inspección**; el hallazgo H1 sobre selección de herramienta salvadora está cubierto por tests y corrección. La regla sigue limitada a cartas ya reveladas; el comportamiento anterior de otros tipos de crisis no cambia.

**Evidencia auditada:** [CI 40576507329](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40576507329), SHA del ejecutable auditado en rama `46564a5`, **305 declaradas, 303 aprobadas, 0 fallidas y 2 TODO**. Se verificó que las ocho regresiones están incluidas. **Sin nuevas ejecuciones de pruebas ni cambios en código o tests durante esta revisión.** Los fixtures de IA anulan esperas, encrucijadas y UI; no hay ejecución manual nueva en navegador/Android ni análisis de balance.

**Decisiones administrativas:** solo documentación; no hubo fusión, cambio en `main`, cierre de #5 ni apertura de nueva etapa. Próxima tarea única: validación manual con encrucijadas reales de C7/C7-R1 en navegador, evidenciando colaboración, elección de botín, prioridad de victoria y ausencia de bloqueos antes de proponer cierre/promoción.

## Validación en navegador real de C7/C7-R1 — 27/10/2026

Se completó la comprobación exigida tras [revisión33](33-revision-critica-c7-r1.md) con **Chromium y Playwright** sobre el HTML exacto de `fix/estabilizacion-v9-9`: `git hash-object` del archivo de prueba = GitHub blob `7ae72fc88381e5109b5f64929f6b017a2d5d5dc6`. La copia se obtuvo desde V9.9 estable hash `4ebaedad...` más diff del PR #14, comprobando identidad exacta, sin modificar la rama ni `main`.

[Informe34](34-validacion-navegador-c7-r1.md): **cuatro escenarios ejecutados y aprobados con DOM y callbacks reales**: IA aporta palanca equipada tras 1/2 humano con encrucijada; herramienta salvadora frente a muestra en botín y encrucijada; muestra ganadora prevalece sin colonia; investigador duplica muestra ganadora en viewport móvil táctil 390 × 844. Modales confirmados mediante botones de interfaz, 0 errores JS registrados. Se verificó la transición a ronda 2 o fin inmediato y cartas consumidas/conservadas según la regla. Se acortaron pausas de 1750 ms y se preparó el estado aleatorio mediante Playwright; `file://` bloqueado por el entorno, HTML cargado con `page.set_content()`. Sin pruebas en Android físico/TalkBack ni partida aleatoria completa. Estos recorridos **no** son ocho pruebas Node nuevas ni se agregaron a CI.

**Evidencia CI preexistente sobre motor:** [40577893140](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40577893140), 305 declaradas, 303 aprobadas, 0 fallidas y 2 TODO (#4/#6). **Acciones en repo:** solo documentación; no parche, suite de GitHub, fusión, cambio de `main` ni cierre de #5. **Próxima tarea única:** decidir criterios de aceptación administrativa y si Android físico es requisito previo a promoción, sin avanzar a otro issue.

## Criterio de aceptación #5: Android físico no obligatorio — 27/10/2026

El creador indicó que **no considera necesaria una prueba obligatoria en Android físico** para la corrección C7/C7-R1. Se adopta ese criterio **para el issue #5**, sin extenderlo a cualquier entrega futura: la suite Node (305 declaradas, 303 aprobadas, 0 fallidas, 2 TODO #4/#6), las revisiones técnicas y los cuatro escenarios de Chromium controlados (informe34) bastan para **proponer** la aceptación. Android real y TalkBack **no fueron comprobados** y conservan su carácter de pruebas complementarias de interfaz; no se afirma compatibilidad completa.

**Acciones:** actualizados [informe34](34-validacion-navegador-c7-r1.md) y [tablero18](18-tablero-operativo.md) para que la condición anterior no aparezca como bloqueo. No hubo cambios en HTML, pruebas, `main`, PR ni estado del issue; #5 permanece abierto y PR14 borrador.

**Próxima decisión única:** solicitar consentimiento para considerar #5 aceptado y cerrarlo administrativamente, **sin fusionar PR14 ni publicar la versión**. Cerrar el seguimiento no modifica por sí solo el código estable.

## Cierre administrativo del issue #5 — 27/10/2026

**Permiso:** en respuesta a «¿Aprobás que cierre el issue #5?» el creador contestó «Continúa»; se aplicó exclusivamente al cierre acordado, sin presumir fusión, integración o autorización de empezar otro issue.

**Acción efectuada:** agregado [comentario técnico de cierre 6453435186](https://github.com/LeviEdition/invierno-en-la-colonia/issues/5#issuecomment-6453435186) documentando política C7, prioridad C7-R1, pruebas rojo→verde, último CI verde, revisión, escenarios Chromium, límites y Android no obligatorio. [Issue #5](https://github.com/LeviEdition/invierno-en-la-colonia/issues/5) **cerrado con motivo `completed`**, observado `closed_at=2026-10-27T21:00:41Z`. **No se modificó** código, tests, estructura de ramas ni otros issues.

**Evidencia que habilitó cierre:** [informe30](30-correccion-c7-ia-herramientas.md), [informe32](32-correccion-c7-r1-prioridad-botin.md), [informe33](33-revision-critica-c7-r1.md), [informe34](34-validacion-navegador-c7-r1.md), [CI 40582012525](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40582012525): **305 declaradas, 303 aprobadas, 0 fallidas, 2 TODO**. Cuatro escenarios de Chromium aprobados con encrucijadas y elección de botín. Android físico opcional para el issue; no hay certificación en dispositivo real.

**Control de integración:** `main=d9068f4aa8d3a10bbbf1e0a8a2527744cc6952cb` sin modificación. [PR #14](https://github.com/LeviEdition/invierno-en-la-colonia/pull/14) sigue **abierto/draft**, base `refactor/arquitectura` y cabeza `fix/estabilizacion-v9-9`. Cerrar #5 **no incorpora código a `main`**.

**Próximo bloque único propuesto, no iniciado:** [#4](https://github.com/LeviEdition/invierno-en-la-colonia/issues/4), decidir la norma para transferir herramientas/armas entre supervivientes de distintos grupos. Hay un `test.todo` de contrato; primero acordar regla y luego registrar pruebas, sin inventar diseño ni saltar a cambios de código. Issue #6 conserva su TODO independiente.

## Definición de regla #4 — Transferencia por modo, 27/10/2026

El creador indicó expresamente: **«por ahora cuando se juegue contra la IA no se pueda realizar tradeos [...] Pero J1 con J2 sí»**, debido a la complejidad de negociar con IA. Se registra como decisión de política, interpretando «tradeo» como **transferencia entre grupos**, distinta de reorganizar equipo entre dos supervivientes controlados por el mismo J1.

**Comportamiento objetivo sin cambiar el motor todavía:**
- Humano + IA: no hay transferencias manuales J1→IA ni IA→J1; las transferencias **entre supervivientes del propio grupo humano siguen permitidas**. El sistema automático de IA administra su propio equipo sin negociar.
- Local J1+J2: permiten cesión equipada J1↔J2 desde el turno interactivo del **donante**, además de intra-grupo. No es trueque instantáneo ni se agrega diálogo de aceptación del destinatario.
- Conserva las garantías: ambos vivos, misma localidad, categoría de equipamiento no repetida en destino, mismo objeto existente y mismo origen elegible al confirmar, sin ejecutar durante pantalla de pase u otro estado bloqueante. Proteger ambas fases `startTransfer()` y `chooseTransfer()` y el texto modal.

[Issue #4, comentario 6453681346](https://github.com/LeviEdition/invierno-en-la-colonia/issues/4#issuecomment-6453681346). Evidencia del defecto inicial: `startTransfer()` usa `alive()` de ambos grupos y `chooseTransfer()` solo comprueba identidad y localidad, permitiendo actualmente J1→IA en modo IA. **No se cambió HTML ni pruebas ni `test.todo`** porque la tarea de esta intervención fue acordar el criterio; no se reclamó CI nuevo para el comportamiento no implementado. PR #14 sigue borrador, `main` intacta; #4 permanece abierto.

**Siguiente bloque único, sujeto a permiso:** C8/#4, escribir primero tests que exijan la nueva regla, observar CI rojo esperado y corregir las guardas; revisar UI en Chromium real. No cerrar #4 ni fusionar automáticamente y no avanzar a #6.

## C8 — Transferencias diferenciadas para IA y modo local (#4), 27/10/2026

**Autorización del creador:** «vamos con la corrección de C8», siguiendo la norma de no permitir negociaciones con IA, pero sí transferencia entre J1 y J2 local, además de cesiones internas del humano. No se modificó #6 u otro issue.

**Primero regresiones:** `tests/combate-equipamiento.test.mjs` reemplazó el único TODO #4 por **14 casos** de filtro en IA, cesión entre supervivientes J1, transferencia J1→J2/J2→J1, transferencia propia de J2, turno/pantalla de pase, variación de modo, localidad, muerte, duplicación por categoría, identidad del objeto y doble confirmación. [Commit `5b4446f`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/5b4446ff8d6b0dad1b918ada94c0835fbed802a9); [CI rojo 40585772252](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40585772252): **318 declaradas, 309 aprobadas, 8 fallidas y 1 TODO** (#6). Los fallos se atribuyen a validaciones ausentes en el código anterior.

**Parche:** [`37d86d6`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/37d86d6bdb4707ff7ebf95a8274bd5747a08b989) introduce `canReceiveTransfer` dependiente de `game.mode`, reutilizado por `startTransfer` y `chooseTransfer` al generar candidatos y confirmar. `chooseTransfer` comprueba además `playable()`, pertenencia del donante al turno y que el objeto pendiente no fue sustituido. Mensaje de falta de receptores distingue modo local del modo con IA. No agrega negociación/aceptación de IA.

**Verificación:** [CI verde 40585960363](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40585960363) **318 declaradas, 317 aprobadas, 0 fallidas y 1 TODO (#6)**. El antiguo TODO #4 quedó convertido en regresiones. **Chromium Playwright:** tres recorridos reales de selección por botón aprobados (humano→humano sin mostrar IA; local J1→J2; local J2→J1 tras pantalla de pase de teléfono, en viewport táctil 393 × 852), con cero errores JS observados. Se contrastó **Git blob C8 `32eb545cbdbca047ded8bc81d64b8e438e096a49`** contra GitHub; se prepararon determinísticamente las cartas y se cargó HTML por `set_content()` debido a las restricciones `file://` del entorno. No Android físico ni partida libre completa. [Informe35](35-c8-transferencias-por-modo.md).

**Controles:** solo código de transferencias, sus pruebas y documentación; `main` intacta, PR #14 permanece abierto/draft y **#4 abierto**. No se ha completado la revisión crítica posterior independiente, no se ha aprobado integración.

**Siguiente tarea única:** revisión crítica posterior C8/#4; no cierre de issue ni avance a #6 sin aprobación.

## Revisión crítica posterior de C8/#4 — 27/10/2026

Se revisaron **por separado** las garantías de `canReceiveTransfer`, `startTransfer`, `chooseTransfer`, `playable`, dueño del turno, objeto seleccionado y equipamientos, y se contrastaron con los **14 tests activos C8** (informe35). No apareció defecto nuevo comprobado en esta corrección; no se modificó motor ni pruebas. [CI 40586682191](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40586682191), commit auditado `52f1c71`: **318 declaradas, 317 aprobadas, 0 fallidas y 1 TODO (#6)**.

Se ejecutaron **seis controles adicionales en Chromium/Playwright real** con viewport táctil emulado 393×852 y el HTML de Git blob verificado `32eb545cbdbca047ded8bc81d64b8e438e096a49`: no transferir a IA ni aunque se manipule lista; receptor con categoría duplicada; ítem cambiado mientras modal abierto; donante fallecido; protección de pantalla de pase; recepción válida de arma junto a herramienta. **Seis aprobados, cero excepciones JS**. Con los tres recorridos originales de C8: **9 escenarios acotados**, no nueve partidas completas ni aumento de casos CI. [Informe36](36-revision-critica-c8.md) registra condiciones, observado, riesgos y límites.

**Reserva P3:** `playable()` no bloquea *por sí solo* todos los estados modales; se considera posible refuerzo transversal, no regresión demostrada de C8. En interfaz, un destinatario que deja de ser apto después de abrir el modal puede permanecer visible, pero se rechaza sin pérdida de objeto y se puede cancelar. Sin Android físico/lector de pantalla ni rondas aleatorias completas. **Solo documentación:** #4 sigue abierto, `main` intacta, PR14 abierto/draft. La siguiente decisión única recomendada es **aceptación/cierre administrativo de #4** con aprobación del creador, no empezar #6 automáticamente.

## UX — Mensaje al intentar usar combustible para moverse por segunda vez, 27/10/2026

Ante pregunta del creador sobre **acciones todavía pulsables desde la UI pero ilegales**, se identificó un silencio real: al usar una carta combustible desde el inventario cuando el superviviente ya había utilizado su movimiento, `moveWithFuel()` retornaba `false` sin aviso. El creador aprobó explícitamente igualar la advertencia existente de `doMove()`: **«El superviviente ya se movió durante este turno.»**.

**Regresiones primero:** `tests/movimiento-exposicion.test.mjs` suma dos casos para J1 y J2 local, verifican mensaje y preservación de carta, localidad, dado y residuos, [commit `78c55af`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/78c55af021b970427f7372860ab7a038621dbfeb); [CI rojo 40589116325](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40589116325), **320 declaradas, 317 aprobadas, 2 fallidas, 1 TODO**.

**Cambio mínimo:** [`63cb294`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/63cb2949f979631c97152f971f7a2dda171672ba): en `ItemEngine.moveWithFuel()`, si `p.moved` se registra y presenta la misma advertencia usando el sistema toast/historial para el jugador del turno activo; no consume ni mueve. **CI verde 40589214682:** **320 declaradas, 319 aprobadas, 0 fallidas, 1 TODO (#6)**. Chromium real validó 3 recorridos desde botón «Usar» (J1 y J2 rechazos con aviso, J1 combustible válido), sin errores JS; **toast visible comprobado** (`role=status aria-live=polite`). Blob Git del HTML en rama = prueba `4748627825e9876809ec482cb7c10431e6c07cf9`. [Informe37](37-feedback-movimiento-con-combustible.md).

**Estado:** solo cambio de feedback, no de reglas; los demás casos de UI no fueron auditados exhaustivamente. #4 sigue abierto, #6 único TODO, PR14 borrador y `main` intacta. **Única tarea propuesta:** auditar el resto de rechazos silenciosos que un jugador puede intentar realmente desde la UI, sin ampliar el motor sin aprobación.

## C8/#4 aceptado y cerrado; C9/#6 iniciado como análisis de política — 27/10/2026

**Consentimiento:** «sí, hagamos esto que dijiste, sigamos con la ruta» tras recomendación explícita de cerrar #4 y pasar al análisis de #6. Se publicó el [comentario de cierre #4](https://github.com/LeviEdition/invierno-en-la-colonia/issues/4#issuecomment-6454516746), se verificó el [issue #4 cerrado (completed)](https://github.com/LeviEdition/invierno-en-la-colonia/issues/4) en `2026-10-27T21:51:27Z`. Política C8 funcionalmente aceptada: sin intercambio humano↔IA, sí transferencias bidireccionales J1↔J2 local, guardas en apertura y confirmación. No significa que el código esté en `main`.

**C9/#6 — revisión de estado real, sin implementación:** `canPickStartingLeader()` permite elegir líder inicial durante ronda 1 si el flag del controlador (`leaderChosen` J1, `localLeaderChosen` J2) está en falso. `consume()`, `doMove()`, `playItem()` marcan solo `leaderChosen=true`, de modo que J1 queda bloqueado al actuar y J2 sigue habilitado. El modal afirma «Durante la primera ronda podés designar tu líder inicial», que no explica la restricción para J1. [Issue #6, comentario de análisis y alternativas](https://github.com/LeviEdition/invierno-en-la-colonia/issues/6#issuecomment-6454546559).

**Alternativas sujetas al creador:**
- **A, recomendada por alcance mínimo:** primera acción que consolida liderazgo bloquea elección inicial para ambos jugadores de igual manera; ajustar flag por controlador y texto UI; definir cobertura de otros comandos especiales.
- **B:** libertad de cambiar líder durante toda la primera ronda para ambos, incluso después de actuar; se cambia también J1.

No se implementó ninguna opción, no se cambió HTML/tests, no se cerró #6 y no se inventaron pruebas. [CI previa 40589676353](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40589676353): **320 declaradas, 319 aprobadas, 0 fallidas y único TODO #6**. [PR14](https://github.com/LeviEdition/invierno-en-la-colonia/pull/14) abierto/draft con base `refactor/arquitectura`; `main` permanece en `d9068f4aa8d3a10bbbf1e0a8a2527744cc6952cb`. La auditoría general de feedback UI queda estacionada como pulido antes de cerrar estabilización.

**Siguiente única decisión:** solicitar al creador elección **A/B** y solo entonces implementar C9 con tests rojo→verde, CI y revisión Chromium.

## C9/#6 — Política A aceptada, regresiones rojo→verde y Chromium, 27/10/2026

**Decisión:** el creador aprobó expresamente «J1 y J2 deben confirmar su líder inicial antes de realizar las acciones que bloquean la elección». El criterio iguala a J2 con la regla existente de J1: cerrar elección del líder predeterminado en primera ronda al **gastar dado válido, realizar movimiento válido o usar carta con éxito**; no bloquear al fallar. Los otros tipos de acción antes no bloqueaban a J1 y no se redefinen. Sucesión por fallecimiento mantiene prioridad sobre líder inicial.

**Red:** [commit test `ffd14ca`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/ffd14ca2b74148f1cc83692956aa373b28dedc5c), `tests/finales-lideres.test.mjs`, convierte el TODO #6 en **12 regresiones activas**. [CI 40591148076](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40591148076): **331 declaradas, 327 aprobadas, 4 fallidas, cero TODO**. Defectos reproducidos en acciones de J2 y texto UI.

**Green:** [commit código `38e7ac8`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/38e7ac87832e4ca02dbf277dcc1a8acb56ce2849) en `invierno_colonia_v9_9.html`: `confirmStartingLeader()` elige flag por controlador y sustituye asignación fija de `leaderChosen=true` en `consume`, `doMove` y `playItem` solo tras éxito; se corrigió la explicación del menú. [CI 40591238120](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40591238120): **331 declaradas, 331 aprobadas, 0 fallidas, 0 TODO**.

**Browser:** cinco escenarios Chromium/Playwright con botones de interfaz; J1 y J2 tras pase de teléfono, opción disponible antes de actuar, bloqueada tras dado/carta válida, conservada si el movimiento es rechazado; selección voluntaria de Ada antes de actuar. Dos pruebas en viewport móvil simulado 393×852; **cinco aprobadas, cero pageerrors**. `git hash-object` local `b5b9f2020c5abb73fd95e0f7441db088bb746d16`, mismo blob C9 GitHub. [Informe38](38-c9-lider-inicial-j2.md) recopila escenarios, límites y cambios.

**Estado:** no se modificó `main` ni fusionó PR14 (abierto/draft, base `refactor/arquitectura`); issue #6 sigue abierto; falta **revisión crítica posterior** y aceptación del creador. Auditoría general de mensajes queda como pulido al final de estabilización.

**Siguiente única tarea:** revisión crítica posterior C9/#6 antes de cierre administrativo.

## Revisión crítica posterior C9 y reparación C9-R1 — 27/10/2026

El creador precisó que **se mantiene el liderazgo humano manual al estilo *Dead of Winter***. Se preserva la política A aplicada en C9: primera acción válida de dado/movimiento/carta fija líder inicial de J1 o J2, pero no se prohíbe a los jugadores seleccionar manualmente un sucesor si muere el líder. La IA mantiene sucesión automática.

**Defecto crítico de propiedad descubierto:** al morir **el líder de J2 durante turno de J1**, el modal pedía elegir líder de J2 **sin mostrar pantalla de pase** y J1 podía designar al sucesor; se reprodujo con botones reales en Chromium antes del parche. [Informe39](39-revision-critica-c9-r1.md) documenta precondición, reproducción y reserva de simultaneidad.

**Tests antes de corregir:** [commit `ed817b5`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/ed817b59825268c54aa1f183c783f19af3189c83), **5 regresiones** de propiedad de sucesor, continuidad del otro jugador, elección inicial propia y visibilidad de modal; [CI rojo 40593244756](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40593244756) **336 declaradas, 331 aprobadas, 5 fallidas, 0 TODO**.

**Corrección C9-R1:** [commit `e84db6a`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/e84db6ae088f314e232e377c15cda37683cce19b): añade `leaderChoiceReady()` sensible a propietario del turno y pantalla de pase; `chooseLeader` distingue sucesión propia de elección inicial; acciones y `finishTurn` dejan continuar J1 si pendiente de otro grupo; modal solo aparece al iniciar turno dueño. [CI verde 40593438595](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40593438595): **336 declaradas, 336 aprobadas, 0 fallidas, 0 TODO**.

**Chromium extra:** tres recorridos positivos con HTML exacto blob `2682f96f0d451eb0083fd9eaa3762b266f8aab60`: J2 escoge sucesor manualmente después de pase real y J1 puede seguir jugando (móvil 393×852), J1 sigue eligiendo sucesor propio al instante y la IA designa automáticamente a mayor influencia. Sin errores JS. Escenarios controlados, no partida completa ni Android físico. **Reserva:** no se probó exhaustivamente muerte simultánea de líderes J1 y J2 en mismo episodio, ya que la implementación usa una sola solicitud `pendingLeader`. No se cambió la política de sucesión ni se inició otro issue.

**Estado:** C9 y C9-R1 implementadas con revisión crítica y regresiones. Falta **aceptación y cierre administrativo de #6**; PR14 draft hacia `refactor/arquitectura`, `main` intacta. Auditoría integral de alertas postergada para pulido de etapa C. **Próximo paso único:** solicitar cierre #6 con autorización explícita.

## Cierre autorizado del issue #6 — 27/10/2026

Ante propuesta expresa de aceptar y cerrar administrativamente C9/#6, el creador respondió **«cerra el issue»**. Se publicó [comentario técnico de cierre](https://github.com/LeviEdition/invierno-en-la-colonia/issues/6#issuecomment-6455187002), con decisiones y verificaciones de [C9](38-c9-lider-inicial-j2.md) y [C9-R1](39-revision-critica-c9-r1.md), y GitHub confirmó [#6 closed/completed](https://github.com/LeviEdition/invierno-en-la-colonia/issues/6), `closed_at=2026-10-27T22:30:07Z`.

**Regla final aceptada:** líderes humanos elegidos manualmente al estilo *Dead of Winter*, sin automatizar por mayor influencia; en ronda 1, primera acción válida de dado, movimiento o carta confirma al líder inicial de cada jugador, y la elección manual de un sucesor queda exclusivamente a cargo del dueño del grupo cuando le toca turno. IA mantiene sucesión automática. La muerte simultánea de dos líderes, potencialmente afectada por el estado único `pendingLeader`, queda como **reserva transversal no certificada**.

**Última CI verificada antes del cierre:** [40594225022](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40594225022), **336 declaradas, 336 aprobadas, 0 fallidas, 0 TODO**, con escenarios Chromium de pase y sucesión documentados. No se afirma que Android físico, partidas completas ni todas las combinaciones simultáneas estén ensayadas.

**Control de versiones:** cierre administrativo no integra cambios. `main=d9068f4aa8d3a10bbbf1e0a8a2527744cc6952cb` permanece inalterada; `fix/estabilizacion-v9-9` contiene las correcciones; [PR14](https://github.com/LeviEdition/invierno-en-la-colonia/pull/14) sigue abierto/draft con base `refactor/arquitectura`. **No se comenzó #7**, ni se cerró PR, ni se publicó release.

**Siguiente tarea única propuesta (pendiente de aprobación):** estudiar [issue #7](https://github.com/LeviEdition/invierno-en-la-colonia/issues/7) sobre elección de encrucijadas de IA y definir su política según efectos en lugar de palabras. Luego continuar #13 y pulido de alertas según prioridad de estabilización, sin iniciar varios issues a la vez.

## Confirmación de continuidad de ruta y alcance C — 27/10/2026

**Pedido del creador:** «finalicemos la auditoría, para asegurarnos que esta primera app funcione lo más parecido al juego de mesa y a partir de ahí vemos esta nueva identidad»; después aclara **«Sigamos avanzado con la ruta que ya teníamos»**. Se revisó estado existente en rama `fix/estabilizacion-v9-9`: A6 ya **cerrada con reservas** ([informe24](24-cierre-auditoria-y-prioridades.md)), etapa C **en desarrollo**, C1–C9 implementadas con regresiones; [PR14](https://github.com/LeviEdition/invierno-en-la-colonia/pull/14) en borrador sobre `refactor/arquitectura`; `main` estable no modificado. Issues #7 y #13 abiertos; varios otros abiertos conservan arreglos ya registrados y requieren verificación administrativa posterior.

**Decisión de proceso:** retomar **A→B→C→D→E→F** sin iniciar reorientación de modos ni narrativa avanzada. La idea de un modo single-player con un líder que ordena acciones a varios supervivientes, y humanos en cooperativo, se estaciona como **propuesta para el diseño futuro**, no regla implementada. V9.9 busca una adaptación fiel en su núcleo táctico; **no se declara equivalencia demostrada con *Dead of Winter*** hasta comparar deliberadamente reglas críticas y excepciones de la adaptación.

**Tarea C siguiente, única y acotada:** [#7](https://github.com/LeviEdition/invierno-en-la-colonia/issues/7), reemplazar en decisiones de encrucijadas de IA la coincidencia de palabras por un criterio basado en efectos verificables, **sin construir ahora una super IA** ni agregar Utility compleja, memoria o perfiles como requisito. Se debe definir y aprobar el comportamiento antes de cambiar código; luego probar rojo→verde, CI, Chromium y revisión posterior. Los experimentos de comparación de prioridades/Utility compartidos por Codex son **evidencia de diseño**, no política aprobada ni pruebas del ejecutable. A continuación #13, revisión de estados pendientes, avisos, validación transversal y decisión separada para promover a estable.

**Acciones de esta revisión:** se verificaron en GitHub el PR/branch, issues abiertos, el último GitHub Actions exitoso para la rama, documentos24/40 y el tablero18. **Solo documentación** actualizada en la rama de trabajo. No se ejecutaron nuevas pruebas locales ni navegador; no se alteraron HTML, tests, dependencias, issues, `main` ni el PR. GitHub Actions del commit de documentación se comprobará por su SHA. El registro se añade sin borrar resultados históricos.

## Revisión de aceptación C10 y preparación de encargo nocturno C11 — 27/10/2026, Uruguay

**Solicitud:** revisar cambios terminados por Codex en #7 y preparar siguiente prompt acotado. Se verificó [PR14](https://github.com/LeviEdition/invierno-en-la-colonia/pull/14) sobre cabeza `d342f96` abierta/draft, `main=d9068f4` intacta; contraste de diff desde `f202184`: dos commits (implementación `9e68862` y documentación `d342f96`). Código revisado: requisitos anexos a opciones, evaluación aislada, clasificación terminal, alimentación, callbacks y script de Chromium; informe43 y JSON de 16 recorridos dirigidos consultados. [Actions del SHA documental final](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40622432370) `completed/success`; **358/358 aprobados, cero fallos/omitidos/TODO** según logs. El issue #7 permanece abierto y sin cierre automático.

**Resultado:** corrección técnicamente consistente con el alcance aprobado, seis decisiones de aceptación y modos locales conservados en la evidencia revisada; **ningún defecto nuevo demostrado en esta lectura acotada**. Los once casos rojos originales fueron reportados por Codex en el informe43, no reejecutados en esta consulta ni guardados como commit independiente. Esta revisión no ejecutó test local, Chromium, Android real, TalkBack ni partida natural/balance; no debe presentarse como certificación total.

**Siguiente tarea única propuesta para delegar:** C11/#13 — tamaño y accesibilidad táctil de dados móviles, pruebas de geometría/layout e interacción real de Chromium en viewports 320×640, 393×852 y escritorio. Si aparece un fallo crítico nuevo en C10, reportarlo antes de modificar código. Tras C11, permitir solo inventario/diagnóstico de otros issues abiertos, sin implementar. Prohibidos cambios de reglas, `main`, fusión, cierres automáticos, narrativa y refactor general. La propuesta no constituye aprobación de cierre #7 ni de promoción de V9.9; pedir confirmación al creador para esos actos.

**Acciones realizadas:** lectura de repositorio/PR/issues/logs y documentación de revisión en tablero18 y este registro, sin editar ejecutable, tests, configuración, PR o issues. Registro de seguimiento para que Codex pueda comenzar desde SHA actualizado si el usuario envía el prompt.

## Revisión matutina de C11 y auditoría fase4 — 28/10/2026

**Acción:** a pedido del creador se revisaron los dos commits nocturnos desde `2fbbc59`: [`7497d70`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/7497d704e8888609c108ffa06d7bb52ff9d02701) de C11 CSS/arnés/evidencia y [`5f5514d`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/5f5514d76ca35964679464f744f489aa7973ee83) de auditoría documental. Se inspeccionaron diffs reales, código de liderazgo, informes44/45 y su JSON de reproducción, PR14 e issues. No se ejecutaron pruebas locales ni Chromium nuevos en esta revisión; se verificó [CI exacto del SHA nocturno](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40627292012) `completed/success`, logs **358/358, 0 fail/skipped/TODO**. No se declaró equivalencia completa con juego de mesa ni validación Android físico.

**Hallazgos validados por inspección:** C11 cambia solo19 líneas CSS del juego, aumenta dados a44×44 gap8, reserva franja y contempla alturas bajas; regresión R1 encontrada y corregida por Codex, con evidencia de seis viewports. La auditoría reporta54 regresiones y21 recorridos Chromium sobre siete issues históricos, clasificados como corregidos en rama pero abiertos administrativamente. H1/P2 está confirmado por JSON reproducido en `2fbbc59` y `7497d70`: dos muertes de líderes locales durante una crisis pierden el segundo pendiente por el único `pendingLeader`; el código revisado concuerda. Ningún parche H1 ni prueba permanente de regresión todavía. Los issues #7 y #13 tampoco se cerraron. PR14 draft, `main` intacta.

**Resultado y límite:** revisión favorable de C11 en su alcance; H1 impide recomendar cierre completo de etapa C. **Única siguiente tarea propuesta:** corrección específica H1 mediante prueba rojo→verde, validación de ambos dueños/órdenes de muertes, navegador/CI y nueva revisión. Requiere autorización separada. Ninguna modificación de HTML, tests, configuración, reglas, issues ni PR durante este análisis; se actualizan solo tablero18 y registro25 por el protocolo de documentación.

## Siguiente tarea única

**Estado histórico al comenzar el análisis:** faltaba aprobar la política de #7. La autorización posterior y el resultado C10 se registran al final; no iniciar #13 ni D/E por esta entrega.

## Propuesta de arquitectura Utility AI #7 — 27/10/2026

Por solicitud del creador se analizó el sistema actual y se preparó [informe41](41-propuesta-utility-ai-encrucijadas.md): condiciones, consecuencias, cinco piezas modulares, puntuación contextual, dependencias y siete pasos pequeños con pruebas. Se mantienen las reglas, decisiones humanas, propietarios y flujo de confirmación; se identifican riesgos de efectos globales al proyectar, divergencia descriptor/callback, azar, desbordamientos y esperas de IA. No se aprueban pesos o preferencias por el hecho de proponer arquitectura.

**Evidencia:** lectura del HTML local en `6fdb774`, auxiliares, documentación y pruebas existentes. `node --test tests/encrucijadas.test.mjs`: 30 aprobadas, 0 fallidas/canceladas/omitidas, 0 TODO. No hubo nuevas pruebas ni evaluación de una Utility AI implementada. Se actualizan solo documentos41/18/25, `git diff --check`, sin staging/commits/push por instrucción expresa. Código, reglas, `main`, configuración y PR14 sin cambios.

**Siguiente tarea única propuesta:** acordar contrato y escenarios de decisión (paso1), antes de implementar. No iniciar otro bloque en esta revisión ni fusionar.

## Comparación crítica de alternativas a Utility AI #7 — 27/10/2026

El creador solicita alternativas a su propuesta Utility. Se compararon prioridades contextuales, Utility y búsqueda de varios turnos; [informe41](41-propuesta-utility-ai-encrucijadas.md) registra ventajas/costos y diferencia entre secuenciación de comportamiento y evaluación de opciones. Se recomienda como punto de partida una política de prioridades basada en consecuencias/contexto y sustituible posteriormente; no una lista por carta ni una vuelta a interpretar textos. No es decisión del creador, preferencia estratégica aprobada ni prueba de superioridad en balance.

**Acciones:** revisión de propuesta anterior y contexto de 26 cartas/dos opciones, documentación de alternativas y actualización del tablero. Sin código, nuevas pruebas, staging, commits, push, cambios de reglas o PR. La orden previa de no crear commits continúa vigente; los documentos locales de la revisión anterior se conservan. **Siguiente tarea única:** contrastar escenarios y acordar política (prioridades o Utility) antes de implementar #7.

## Comparación por escenarios de prioridades y Utility #7 — 27/10/2026

Solicitud del creador: comparar ambas alternativas para evaluar su resultado. [Informe42](42-comparacion-politicas-encrucijadas.md) registra seis escenarios/12 resoluciones reales aisladas mediante fixture VM, perfiles explícitos, tratamiento terminal compartido, cinco acuerdos, desacuerdo R3 y sensibilidad de peso. No se evalúa la IA actual ni se afirma que los perfiles sean óptimos. Se diferencia el orden de prioridades del desempate numérico y se conserva la falta de aprobación estratégica.

**Trabajo/validación:** auxiliares en `/tmp`, sin editar ejecutables o tests del proyecto; documentación42/41/18/25, `git diff --check`, sin staging/commits/push por instrucción vigente. No se repitió suite completa ni Chromium. **Siguiente decisión única propuesta:** preferencia R3 y orden de urgencias antes de elegir/implementar la política #7. `main` y PR14 intactos.


## C10/#7 — aprobación y primera revisión técnica, 28/10/2026

Autorización explícita del creador: implementar solo #7 con prioridades contextuales del informe42, desempate determinista, pruebas TDD, revisión independiente, navegador, documentación y commits/push en la rama existente. No cerrar #7 ni fusionar PR14. Se preservan informes41/42 como históricos.

Se inspeccionaron26 cartas/52 opciones, condiciones, zombis, muerte, reclutamiento, `verify()`, modos y protocolo15. Se confirma el riesgo de callbacks globales y se introduce contexto explícito opcional; no se intercambia `game`. Elegibilidad en predicados mecánicos anexos. Reclutamiento evalúa todas sus ramas inmediatas y usa la peor, sin consumir el azar vivo. Las reglas terminales y de alimentación se comparten con resolución real.

TDD inicial `node --test tests/encrucijadas.test.mjs`:43 tests,32aprobados/11fallidos antes de implementación;43/43 después. Suite inicial `npm test`:349/349. Ampliación50/50 encrucijadas:624 combinaciones de conformidad y aislamiento (52 opciones×3 estados×2 dueños×2 modos). Comparación temporal separada contra `6fdb774`:624/624 resoluciones con mismos resultados, incluidos pendientes de liderazgo/selección/muerte. Los auxiliares/logs de diagnóstico quedan en `/tmp`; no son nuevas dependencias del proyecto. Navegador y segunda revisión en curso, no se declaran aprobados todavía. Informe43 registra entrega final.


### C10/#7 — segunda revisión y validación final local, 28/10/2026

**Revisión crítica independiente solicitada por el creador:** otro agente revisó el diff sin editar ni crear commits. Ejecutó 312 evaluaciones con el acceso global a `game` prohibido mediante Proxy y spies que rechazan azar, mensajes y avisos de muerte; todas aprobadas. Comprobó además falta de reemplazos al completar muestras, diez candidatos de reclutamiento y derrota por desbordamiento. No encontró defectos confirmados. Se retiró una consulta redundante a `isLeader()` después de marcar al personaje muerto; no alteraba resultados. Dos casos adicionales quedan permanentes en la suite (falta de reemplazos frente a objetivo y acceso global prohibido).

**Resultado final local:** `npm test`, 358 declaradas, 358 aprobadas, 0 fallidas/canceladas/omitidas y 0 TODO; 52 de encrucijadas. Chromium 154: 16 recorridos dirigidos aprobados, 8 por viewport (1365×768 y 393×852 móvil emulado): seis casos de IA, J1 y J2 manuales con opción no permitida y pase real. Sin excepciones JavaScript. El script `scripts/check-issue7-browser.mjs` y la evidencia JSON se conservan; estados preparados, no partidas naturales ni Android físico. La repetición final tras la simplificación también aprobó los 16 recorridos.

**Integración documental:** antes del push se detectaron commits remotos `7b4de9b`/`f202184` del otro chat, solo documentos18/25. Se avanzó por fast-forward y se recuperó el trabajo local de un stash; los dos conflictos de documentación se resolvieron conservando las decisiones de continuidad y los informes nuevos. Sin reescritura de historial ni force-push. No hubo cambios de motor remotos que invaliden las pruebas.

**Límites y recomendación:** evaluación inmediata, reclutamiento conservador y puntaje simple; futuras cartas deben respetar el contexto. Sin balance exhaustivo, Android físico/TalkBack ni validación del riesgo preexistente de líderes simultáneos. Técnicamente recomendable para aceptación de #7 si CI confirma esta entrega; el issue sigue abierto por instrucción. **Único paso siguiente: revisión del creador; no comenzar #13 ni narrativa.**

**Revisión documental final independiente:** conteos de suite/aceptación/conformidad/navegador y límites consistentes en18/25/04/43, script y JSON, sin carencias bloqueantes. Se etiquetó como histórico el primer checkpoint C10 del tablero. La configuración de fetch heredada solo seguía `main`; para incorporar la rama se verificó `FETCH_HEAD` explícito, sin cambiar configuración ni solicitar credenciales. Se verificará CI por SHA antes de entregar.


## C10/#7 — entrega en rama y CI de código confirmada, 28/10/2026

**Commit:** `9e688624714ae96791dfc9571da14fa168522362`. Push normal a `fix/estabilizacion-v9-9` desde base remota incorporada `f202184`, sin force-push. **GitHub Actions 40622261665 completed/success**, SHA exacto, logs 358/358 aprobadas,0 fallidas/canceladas/omitidas/TODO. Suite local final 358/358 y Chromium 16/16 ya comprobados; no se repiten tras documentos únicamente. Tablero18, matriz04 e informe43 registran la evidencia. Se verificará también el commit documental final por su SHA en Actions antes de responder; las ejecuciones quedan vinculadas a la rama en informe43.

PR14 título/cuerpo actualizados para C1–C10 con foco en #7 y pruebas/límites, conservando borrador y base `refactor/arquitectura`. La CLI `gh pr edit` devolvió error de Projects classic retirados; se completó la misma actualización autorizada por REST, sin alterar permisos, tokens o configuración. Se verificó `main` remoto en `d9068f4`; no hay rama local `main` que modificar en este checkout. Issue7 continúa abierto. Los informes41/42 locales del análisis anterior se conservaron y publicaron como históricos junto a43 y evidencia JSON/script.

**Recomendación:** listo para aceptación del creador; cerrar #7 solo después de su revisión/autorización. Sin nuevas tareas, perfiles, narrativa, fusión ni versión estable. La reserva sobre dos líderes y pruebas físicas/balance no cambia.


## Encargo nocturno C11 y auditoría — fase0, 28/10/2026

El creador autoriza completar C11/#13 y sus regresiones, publicar exclusivamente en `fix/estabilizacion-v9-9`, y después auditar pendientes sin programarlos. No cerrar issues, tocar `main`, fusionar ni avanzar a D/E. Se verificó checkout limpio y remoto; fast-forward `d342f96`→`2fbbc59` sin pérdidas, stash ni reescrituras (solo 18/25 remotos). Se usó FETCH_HEAD explícito porque el refspec heredado solo sigue main. PR14 confirmado abierto/draft hacia refactor/arquitectura; main remoto conserva d9068f4.

Se revisaron protocolo15, informe43, diff/código C10, issue13, CSS del panel y flujo de selección/consumo. `npm test` de referencia:358/358 aprobadas,0 fallidas/canceladas/omitidas/TODO. CI 2fbbc59 [40622935501](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40622935501) success y logs358/358. No regresión grave ni Git inconsistente: habilitado iniciar C11. Se preparan mediciones reales y repetición dirigida de C10 en Chromium, todavía sin modificar código del juego. Los informes previos se conservan como históricos.


## C11/#13 — rojo→verde inicial y revisión R1, 28/10/2026

Se repitieron16 recorridos C10/0 errores sin cambios de reglas. Probe y arnés reproducen26×25 px/gap3 y colisiones reales previas. Referencia roja definitiva:27 comprobaciones geométricas fallidas, tres viewports completos y 0excepciones; se corrigieron previamente dos errores del propio arnés de preparación/espera de toque. Se agregan14líneas CSS iniciales para44×44/gap8, franja reservada y pool de hasta dos filas con scroll; se conserva JavaScript y DOM. Componente111/111 y suite 358/358 aprobados.

Revisión independiente confirma R1/P2 nuevo en alturas bajas: franja fuera del viewport por bodyoverflowhidden y cabecera/franja rígidas. Prueba roja adicional reproduce en 852×393 luego de los tres mínimos verdes. Se añade fallback solo para altura≤520, con desplazamiento de página y tablero50dvh, y se amplía a 852×393/640×320/320×480. Los falsos positivos de cinco colisiones del primer verde se resuelven corrigiendo el arnés para intersectar ancestros con overflow; no se ignoran colisiones reales. Informe44 creado con evidencia y estado en verificación. No se inicia auditoría de pendientes hasta C11 aprobado, ni se implementan otros issues.


## C11/#13 — final local aprobado, 28/10/2026

R1 fue corregido y sometido a segunda revisión independiente:852×393/640×320/320×480, 16 dados, rueda/tap reales, siete entradas de menú y Acciones con dado correcto,0 errores. Se preservó evidencia roja adicional y JSON independiente. No quedan defectos confirmados de C11. El cambio final comprende19líneas CSS, sin alterar DOM ni JavaScript; SHA256 de script 8ec55e4a29e90c6542f57ab5076f854664ac50248b7404582d7929d445a09f7e igual a 2fbbc59.

Validación final:111/111 componente y 358/358 suite,0 fallos/canceladas/omitidas/TODO. Chromium seis tamaños/24 mediciones,0 fallos/0 errores, pool 4/16, menús, selección, consumo, ocultamiento no interactivo, pase y siete localidades. Trazados antes/después idénticos en los tres tamaños originales; C10 Chromium 16/16 antes y después. El arnés respeta recortes de overflow y hit testing de cada botón, no toma null como hit. Se conservaron scripts, JSON rojo/verde/R1 y capturas en informe44/evidencias.

Incidencia de infraestructura: el servidor HTTP heredado8765 devolvió respuesta vacía al perder su transporte; se reinició solo el servidor de prueba con logs en/tmp y se repitió el script. Revisor utilizó8876 independiente. El script ahora obtiene HTML antes de abrir Chromium, evitando un navegador huérfano si falla HTTP. No se afectó configuración cloud, credenciales o aplicación. `git diff --check` aprobado. CI exacto pendiente de push; la auditoría de otros issues aún no empieza hasta su aprobación. No hay cierres, main sin cambios, PR14 draft.


## C11 — CI exacto y apertura de auditoría de lectura, 28/10/2026

Commit `7497d704e8888609c108ffa06d7bb52ff9d02701` subido por push normal exclusivamente a fix/estabilizacion-v9-9. [Actions 40625219012](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40625219012) completed/success, SHA exacto y logs358/358, 0 fallidas/canceladas/omitidas/TODO. Árbol de trabajo limpio al verificarCI. C11 se considera terminado técnicamente y documentado, no aceptado/cerrado administrativamente. Se actualizó44/tablero/matriz con elCI antes de iniciar fase4. Habilitada exclusivamente auditoría de lectura, pruebas no destructivas y documentación; ningún otro motor/issue se implementará en esta tarea.


## Auditoría de pendientes y H1 confirmado — 28/10/2026

La fase4 comenzó solo tras documentar elCI exacto de C11 aprobado. Se consultaron los nueve issues abiertos y cuerpos de #2/#3/#8/#9/#10/#11/#12, implementaciones, regresiones y registros. Selección dirigida54/54 aprobada:6 C2, 3 C3, 2 C5/#8, 21 C6+6 C6-R1, 2 C5/#10+7 C5-R2, 2 C1 y 5 C4. Chromium ejecutó los siete casos en 320×640/393×852/1365×768:21 comprobaciones aprobadas,0excepcionesJS. Llamadas internas verifican contratos de pase/curación/muerte; acciones normales usan botones reales. El arnés temporal se ajustó para comprobar `inert` heredado de un contenedor, no la propiedad propia del botón; esa corrección del test no es defecto del producto. Se conserva JSON de resultados, sin añadir código al repositorio durante esta fase.

**Hallazgo H1/P2:** se reproduce con colonia real y crisisfallida que añade dos zombis; Mara yBruno están en colonia llena y los otros cuatro en supermercado. Ambos líderes mueren, pendiente humano ocupa el único estado global y el de J2 se descarta. Tras confirmar muerte, pasar a J1/elegir sucesor y pasar a J2 en ronda 2, `leaders.ai=null`, dos vivos y `pendingLeader=false`; no se permite elegir líder inicial. Mismo resultado en 7497d70 y 2fbbc59, 0 errores JS. Es defecto preexistente, noC11; no se arregla ni se reabre issue6 sin autorización. Captura/JSON y pasos en informe45. El riesgo antes reservado queda confirmado.

Se clasifican siete issues como corregidos en rama/pendientes de aceptación-cierre; #7/#13 también pendientes administrativos. Se delimita #12 a setup/pase y se registra cabecera histórica ambigua del fixtureA4, sin editar tests. Se actualiza matriz/tablero y se separan adaptaciones del producto de reglas de mesa por contrastar, sin consulta de reglamento oficial ni cambios de reglas. Se enumeran riesgos reales: H1, pendientes encadenados, todos los caminos de muestras/finales, accesibilidad general, dispositivos, mezcla de inventarios, avisos y balance. No afirmar estabilización total porCI verde.

**Única próxima tarea recomendada:** corrección acotada deH1 con nuevo encargo y prueba roja previa. C11 entregado; resto de esta fase solo documentos/evidencia. No main, fusión, cierre/creación/reapertura de issues, force-push, narrativa o D/E. Se comprobará CI del commit documental final por SHA. PR14 actualizado por API REST para reflejar C1–C11 y el hallazgo pendiente; respuesta confirma abierto/draft y base refactor/arquitectura.


**Revisión documental final del encargo:** se contrastaron datos de evidencia con los informes: rojo27/verde0, seis viewports/24 mediciones de 44×44/gap8, trazados idénticos en los tres originales,21 comprobaciones de issues y H1 en ambas versiones, tres revalidaciones independientes deR1. Comparación completa fuera de `<style>` confirma DOM/JavaScript intactos; diff desde7497d70 confirma que la fase4no modificó juego, scripts, tests, package o workflow. Se conservan capturas y JSON. La última actualización documental se sube por push normal a la rama autorizada y se verificará por SHA en Actions; sin repetir tests locales por documentos únicamente.


## Misión C12→C15 — checkpoint C12, 28/10/2026 Montevideo

Autorización completa leída del archivo adjunto: avanzar C12→C15 solo con gates aprobados; sin main/fusión/cierres/reglas nuevas/D/E. Sincronización limpia5f5514d→43f7c11, PR y main verificados; npm358/358, CI43f7c11 success. C12 registra sucesiones por dueño, conserva manual/automática y libera todas las esperas. TDD10casos:8rojos iniciales; revisión independiente detectóR1/P1 cruce de partida tras reinicio yR2/P2 acciones tras terminal. Tres regresiones adicionales y guardias de identidad/terminal/finally los corrigen; mordedura usa resolución real. Revisión revalidada, suite371/371 y Chromium6/6,0errores. Informe46 y evidencia/script; fixtures antiguos migran solicitud de sucesión sin alterarasserts. CI exacto pendiente de commit/push; no comenzarC13hasta aprobación. El informe45 permanece como histórico del defecto.

## Checkpoint C13 — 28/10/2026 Montevideo

GateC12 confirmado f9429d1/CI40682067180 success371/371. Matriz de integración por riesgo en47;21tests permanentes nuevos,392/392 final. Nueve fallos iniciales confirman guardias omitidas, esperas perdidas y acciones tras terminal; limpieza terminal tiene otro rojo. Revisor encontró UI siguiente oculta y prioridad de sucesión/cancelaciones (cinco rojos nuevos); corregidos y revalidados en Chrome, suite independiente392/392. Playwright6recorridos reales,0errores. Fixtures C9 confirman muerte real antes de actuar, mantienenasserts; soporte natural conserva create/paint/primeraencrucijada paraC14. Sin cambios de reglas, fuente de azar, costes o balance. Informe47, scripts/evidencia, matriz y tablero actualizados. CI exacto pendiente; C14solo tras gate aprobado.

## Checkpoint C14 — 28/10/2026 Montevideo

GateC13 3c152e8/CI40684493624 success392. No cambios al motor: controlador explícito sobre create/paint/azar/acciones reales.40configuraciones únicas(20/modo),AI15V/5Dmorales,local17V/2Dmorales/1tiempo,0interrupciones/excepciones/violaciones finales.394/394suite con dos tests agregados20partidas cadauno.5partidas completas con botones en Chromium(2IA/3local),0errores y finales coincidentes conVM. Primer intentoUI2AIinterrumpidospor race deldriverSaltarIA,2localcompletos; corregido sinforzarinteracciones, preservadoevidencia. Avisorecluta despuésvictoria eraomisión delcontrolador; ahoraconfirmaUIlegítima, mismoassertdequiescencia, sinmodificarmotor. Revisorindependiente aprobó fidelidad/replay/invariantes/metadatos y394/394. Informe48/script/JSONL40/resumen/5UI/capturas guardados. No balance ni Androidfísico. CI exacto siguiente gateparaC15.


## Gate C14 → C15 — 28/10/2026, Montevideo

CI exacto d801dbb / [40688534944](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40688534944) completed/success, 394/394. C14 aprobado en su alcance; se inicia C15 por autorización explícita. Auditoría funcional, fuentes oficiales de mesa y riesgo final, sin modificar reglas ni iniciar D. Se reejecutan recorridos relevantes sobre el HTML actual; resultados y reservas en informe49 al completar.


## C15 — auditoría final y dos correcciones técnicas, 28/10/2026

**Acciones:** revisión funcional/matriz21 sistemas, lectura de reglamento oficial base inglés Plaid Hat Games (PDF20p, SHA256 en informe49), GitHub/refs/CI; repetición Chromium y lotes de motor/interfaz. No se sustituyen reglas por las de mesa: se documentan coincidencias, adaptaciones aprobadas/existentes y decisiones futuras.

**T1/P1:** comida0/moral1/crisis4de2 llegaba a0 por hambre y volvía a1 por bonus. Seis pruebas rojas previas; verificación terminal entre pasos/oleadas/ruido de colonia y guardia de entrada, sin tocar efectos atómicos de crisis/cartas ni kill/addZombie. **T2/P2 de revisión independiente:** Tab/Enter permitía elegir sucesor detrás de fallecimiento. Guardia deathWaiting en chooseLeader y dos regresiones de cola/visible. Ocho rojas contra d801dbb, ocho verdes final. Primera suite395/402 por siete preparaciones antiguas sin confirmar muerte; ajustadas a confirmar legítimamente, asserts intactos. Suite final **402/402**,0 fallidas/canceladas/omitidas/TODO, también independiente.

**Navegador final:**6 viewports dados/24 mediciones,16 encrucijadas,6 sucesiones,6 cadenas,3 foco y6 terminal/teclado;0 errores JS. Inicio/pase aíslan foco; **A1/P2 confirmado en ayuda/fallecimiento** sigue pendiente, no se declara WCAG. Dos errores del nuevo arnés (inert del botón en lugar de ancestro y aviso log/last considerado recurso) corregidos/documentados, sin atribuirlos al juego.

**Lote final:** mismas40 configuraciones/20 por modo y5UI repetidas;40/40 y5/5 completas,0 excepciones/invariantes. IA15 victorias/5 moral;local17/2moral/1tiempo. Mismo resultado/rondas pero eventos distintos: IA73→72 muertes, local44→42 crisis y4→2 indefensos por detener pasos posteriores a derrota. No contar80 configuraciones distintas ni usar porcentaje como balance humano. Informes/evidencias C14 originales conservados.

**Archivos y decisión:** HTML localizado, tests C15/preparación de liderazgo, scripts de foco/terminal, evidencias C15, informe49 y04/18/25/48. Revisión técnica independiente aprobada; revisión documental y CI de publicación son gate final. Recomendación con reservas para aceptación del creador, sin cierre oficial de C, issues/merge/main ni D. Fuente y checklist explican decisiones humanas pendientes. Pruebas físicas/TalkBack/otros navegadores/rendimiento/humanos no ejecutadas.


**Revisión final independiente C15 completada:** código, informe49, diffs04/18/25, JSON, hashes y fuente oficial contrastados;402/402 independientes, cinco UI coherentes con VM,40 configuraciones repetidas sin inflar muestra. Sin inexactitudes materiales ni otro defecto funcional confirmado. A1/P2 y decisiones de adaptación explícitas. Aprobada para presentar tras CI del SHA final, sin cierre oficial de C/D.
