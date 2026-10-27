# 25 — Registro de estabilización V9.9 (C1–C7)

**Fecha:** 27/10/2026. **Rama de trabajo:** `fix/estabilizacion-v9-9` (nació de `refactor/arquitectura`). **Estado:** C1–C4 con CI verde; C5 y C6 implementadas, con pruebas locales y CI remoto aprobados; C6-R1 y C5-R2 corregidas y revisadas, con CI aprobado. **No promovidos a `main`.**

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

## Siguiente tarea única

**Solicitar autorización de aceptación y cierre administrativo de #5; Android físico optativo para este issue, PR14 sin fusionar y `main` intacta.** R1/R2 ya corregidos. Actualizar tablero y registro al cerrar cada revisión; no fusionar ni iniciar otro defecto.
