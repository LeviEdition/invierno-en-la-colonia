# 25 — Registro de estabilización V9.9 (C1–C6)

**Fecha:** 27/10/2026. **Rama de trabajo:** `fix/estabilizacion-v9-9` (nació de `refactor/arquitectura`). **Estado:** C1–C4 con CI verde; C5 y C6 implementadas, con pruebas locales y CI remoto aprobados; revisión final de código pendiente. **No promovidos a `main`.**

## Entrega C5/C6 para revisión

Código y pruebas en [d4a6b3f](https://github.com/LeviEdition/invierno-en-la-colonia/commit/d4a6b3f45dc5c2563420980acf436a15e694775a), documentación de entrega en [64dcc2c](https://github.com/LeviEdition/invierno-en-la-colonia/commit/64dcc2c90714a5eab6c8dd1e1b4bd3d10d814dd3). Ambos subidos a `fix/estabilizacion-v9-9`. Al revisar, el PR #14 apunta a `64dcc2c`, abierto y en borrador, base `refactor/arquitectura`, sin revisiones formales. `main` sigue en `d9068f4`, blob estable `4ebaedad13d63c7a6762c524a52c0dd9695687b1`. Sin fusión, cierre de issues ni nueva versión.

**Validación:** [CI de código `d4a6b3f`](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40552155171) y [CI de entrega `64dcc2c`](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40552240429) terminaron `completed/success`. Se leyeron los logs de la segunda ejecución: **275 declaradas, 272 aprobadas, 0 fallidas/canceladas/omitidas y 3 TODO**. Los resultados de implementación de C5/C6 de abajo son históricos; este apartado determina su entrega actual.

### Revisión documental y resolución de acceso — 27/10/2026

- **Acciones y diagnóstico:** se verificaron presencia de autenticación y configuración sin imprimir valores; la consulta a la API, incluso pública, fallaba antes de autenticarse, con `Tunnel connection failed: 403 Forbidden`. La configuración restringida no incluía `api.github.com`. Se guardó únicamente ese dominio adicional, preservando los destinos existentes. Tras aplicar el cambio el usuario, se verificaron API, PR y ejecuciones CI correctamente; no se pidió otro token.
- **Decisión del usuario:** toda revisión debe terminar con el tablero actualizado y todo trabajo debe documentarse. Regla persistida en `docs/15-protocolo-revision-critica.md` y en el protocolo de cierre de `docs/18-tablero-operativo.md`.
- **Revisión de documentación:** se compararon tablero, este registro y matriz; una revisión paralela de solo lectura señaló referencias actuales obsoletas a CI pendiente, entrega local y SHA anterior del PR. Se corrigieron, conservando explícitamente los resultados históricos por etapa. No se revisó ni modificó el código del juego en este bloque.
- **Archivos modificados y motivo:** documentos 15 (regla), 18 (estado y siguiente tarea), 25 (acciones/evidencia) y 04 (cobertura y entrega). Comprobación documental: `git diff --check`. Sin repetición local de la suite ni del navegador: los archivos ejecutables no cambiaron. La subida de esta documentación y su CI se verifican por el SHA del nuevo commit, sin anticipar su resultado ni reescribir la evidencia de `64dcc2c`.
- **Límites y siguiente tarea:** revisión final de código C5/C6 pendiente; no confundir esta revisión documental ni CI verde con aprobación formal del PR. Android físico/TalkBack siguen pendientes. #5 sigue como propuesta posterior, sin política de IA decidida ni implementación autorizada. No se inició otra corrección ni se fusionó.

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
| **C5 implementada; CI aprobado** | [#8](https://github.com/LeviEdition/invierno-en-la-colonia/issues/8) + [#10](https://github.com/LeviEdition/invierno-en-la-colonia/issues/10) | Guardias y CI verificados; revisión final de código pendiente |
| **C6 implementada; CI aprobado** | [#9](https://github.com/LeviEdition/invierno-en-la-colonia/issues/9) | Bloqueo, recuperación y CI verificados; revisión final de código pendiente |
| Más adelante | [#5](https://github.com/LeviEdition/invierno-en-la-colonia/issues/5), [#13](https://github.com/LeviEdition/invierno-en-la-colonia/issues/13), [#7](https://github.com/LeviEdition/invierno-en-la-colonia/issues/7) | Estrategia IA, ergonomía móvil, selección estructurada de encrucijadas |
| Requiere al creador | [#4](https://github.com/LeviEdition/invierno-en-la-colonia/issues/4), [#6](https://github.com/LeviEdition/invierno-en-la-colonia/issues/6) | Transferencias entre grupos y momento de elección de líder inicial |

**No dar por cerrado ningún issue automáticamente:** el cambio permanece en rama, no está integrado a la versión estable. Las incidencias se podrán cerrar tras revisión/promoción y verificación correspondiente.

## Siguiente tarea única

**Revisión final del código y regresiones C5/C6 en PR #14.** Entrega y CI confirmados. Registrar su resultado en tablero y documentación al terminar, incluso si no requiere código nuevo. No fusionar, publicar una versión ni iniciar otro defecto dentro de este bloque.
