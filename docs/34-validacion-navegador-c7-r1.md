# 34 — Validación de C7/C7-R1 en Chromium real

**Fecha:** 27/10/2026 · **Etapa:** C, estabilización · **Rama de código probada:** `fix/estabilizacion-v9-9` · **Git blob SHA exacto del HTML ensayado:** `7ae72fc88381e5109b5f64929f6b017a2d5d5dc6` · **PR:** [#14](https://github.com/LeviEdition/invierno-en-la-colonia/pull/14), borrador/base `refactor/arquitectura`. **Resultado:** cuatro escenarios de navegador controlados aprobados, cero errores JS capturados. Sin fusión, sin cambio de motor ni tests del repositorio.

## Procedimiento reproducible y control de versión

Se recuperó de la Biblioteca una copia exacta del archivo **estable original V9.9**, con SHA Git blob `4ebaedad13d63c7a6762c524a52c0dd9695687b1`. Se obtuvo el **patch real de HTML del PR #14** desde GitHub; se aplicaron todos sus cambios sobre la copia estable para reconstruir localmente el archivo de la rama, incluidos C1–C7 y C7-R1. **Integridad binaria contrastada:** `git hash-object` de la copia reconstruida devolvió `7ae72fc88381e5109b5f64929f6b017a2d5d5dc6`, idéntico a `fetch_file.sha` de GitHub para la rama. Así se evita probar accidentalmente la V9.9 antigua o una versión aproximada.

El entorno contiene **Chromium real** (`/usr/bin/chromium`) y Playwright Python. Chromium bloqueó navegar directamente a `file://` con `net::ERR_BLOCKED_BY_ADMINISTRATOR`; se utilizó **`page.set_content()` del HTML completo** para cargar y ejecutar el documento en Chromium. La pantalla de inicio y el tablero se renderizaron correctamente; no hubo error JavaScript de arranque. **No** se utilizó navegador de ChatGPT Work ni alojamiento web/servidor HTTP, por lo que este ensayo no certifica comportamiento de hosting.

**Interacción real del navegador:** inicio de partida desde botón «1 jugador + IA», navegación del menú flotante, «Terminar turno», aparición y continuación de modal de encrucijada, ejecución de turno de IA, aportes, colonia, siguiente ronda o victoria. Se configuró el estado de partida desde Playwright con condiciones controladas (mazo, crisis, herramientas, dados y personajes), **sin modificar el código del repositorio**. Para reducir esperas automáticas en el smoke test, solo se acortaron temporizadores de animación de 1750 ms; la ejecución JavaScript real, modales y callbacks de encrucijadas **se mantuvieron activos**.

## Escenarios → esperado → observado

| ID | Precondición y recorrido en Chromium | Esperado y observado | Estado |
| --- | --- | --- | --- |
| B1 | Crisis herramientas 1/2 aportada por humano; IA con palanca equipada; encrucijada de inicio de turno «El generador averiado», confirmada desde botón | IA aporta palanca al final; crisis 2/2, fase colonia, ronda 2; sin bloqueo ni excepción JS | **Aprobado** |
| B2 | Crisis herramientas 0/2; IA con linterna equipada y búsqueda con cartas `sample` + `crowbar`; encrucijada al buscar «La farmacia saqueada», confirmada desde botón | Elige palanca, deja muestra en mazo, aporta palanca + linterna, supera crisis y pasa a ronda 2 sin obtener muestra | **Aprobado** |
| B3 | Igual que B2, pero el objetivo está a una muestra de la victoria | Prioriza muestra, gana en ronda 1, no consume linterna ni palanca, no procesa colonia | **Aprobado** |
| B4 | **Emulación de móvil táctil** 390 × 844; investigador con bono disponible, a dos muestras del objetivo, linterna equipada, búsqueda `sample` + `crowbar`; se resolvió una encrucijada humana inicial si aparecía, luego se continuó una encrucijada IA | Tocar menú y terminar turno funciona; muestra duplicada produce victoria en ronda 1, bono gastado, herramienta conservada, sin excepciones JS; `scrollWidth=viewportWidth=390` en este estado | **Aprobado** |

**Resultados observados en ejecución:**
- B1: modal IA visible «Encrucijadas»; `round=2`, `morale=9`, palanca retirada del equipo, registro «Crisis superada: 2 aportes válidos de 2».
- B2: modal IA visible; `round=2`, `samples=0`, `decks[2]=['sample']`, equipo de Ada vacío, registro de palanca + linterna aportadas y crisis superada.
- B3: modal IA visible; `round=1`, `ended=true`, `samples=goal`, `decks[2]=['crowbar']`, linterna conservada, registro de victoria y sin fase colonia.
- B4: modal IA visible, interacción táctil simulada; `round=1`, `ended=true`, `samples=goal=7` en la ejecución, `bonusUsed=true`, linterna conservada, palanca permanece en mazo, anchura del documento de 390 px.

En B1–B3 se registraron `pageerror` y errores de consola: **cero errores**. En B4 se registraron `pageerror`: **cero excepciones**. En móvil, antes de forzar el escenario se resolvió un modal humano inicial de encrucijada mediante su botón habilitado: su bloqueo de otros controles hasta confirmar es el comportamiento previsto, no un fallo.

## Evidencia previa CI y límites

[CI del commit de código y docs auditado `5eb8302`](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40577893140): **305 pruebas declaradas, 303 aprobadas, 0 fallidas y 2 TODO (#4/#6)**. Esta validación de Chromium es **adicional**, no sustituye ni incrementa esa cifra: los 4 recorridos de navegador se ejecutaron en un entorno externo al CI GitHub y no se añadieron a la suite versionada.

**Límites:** estado controlado preparado mediante JavaScript dentro de Playwright (no cuatro partidas aleatorias de principio a fin); no se verificaron todas las combinaciones de encrucijadas, bajas, combates y rondas ni balance. No se verificó la temporización real completa de animaciones de 1750 ms; no se ejecutó Android físico ni TalkBack; emulación táctil no equivale a un teléfono real. El ensayo `set_content()` no verifica apertura por `file://` o hosting HTTP. Tampoco valida UI online entre dos celulares.

## Dictamen y estado operativo

**C7/C7-R1 supera los cuatro escenarios browser controlados con modales de encrucijadas activos y sin errores JavaScript visibles.** El defecto estratégico H1 corregido en C7-R1 queda respaldado tanto por ocho regresiones Node (informe32) como por la ruta real del navegador B2; la excepción de victoria se comprobó con B3 y B4. No surgió un defecto nuevo que justifique parche.

Se documenta este resultado **sin modificar el juego, tests, `main`, modo local ni los issues**. PR #14 continúa en borrador y #5 abierto. Recomendación como siguiente tarea **única**: evaluar los criterios de aceptación y cierre administrativo de #5 (incluido si es necesaria comprobación táctil en Android físico antes de promoción). No cerrar el issue ni fusionar unilateralmente; no iniciar otros issues o etapa D sin resolver explícitamente el cierre de esta corrección.

## Decisión de aceptación sobre Android físico — 27/10/2026

**Criterio indicado por el creador:** para **C7/C7-R1 y el issue #5** no es obligatorio superar una prueba en un dispositivo Android físico antes de considerar aceptable este arreglo. Los cuatro recorridos de Chromium y la suite automatizada constituyen evidencia suficiente para **proponer** la aceptación funcional de este issue, dadas las limitaciones explícitas. Esta decisión **no** equivale a afirmar que Android/TalkBack hayan sido verificados, ni elimina futuras pruebas de interfaz móvil en la hoja de ruta.

**Condiciones cumplidas:** políticas C7 y C7-R1 aprobadas expresamente, regresiones rojo→verde, 303 pruebas automatizadas aprobadas (2 TODO ajenos), revisión posterior sin defectos nuevos y cuatro escenarios Chromium aprobados con modales/encrucijadas activos. **Pendiente administrativo:** autorización expresa de aceptación/cierre de #5; ningún issue se cierra ni PR se fusiona por registrar este criterio. `main` queda fuera de cambios.

**Siguiente paso único recomendado:** pedir confirmación para **dar #5 por aceptado y cerrarlo administrativamente**, dejando el código solo en `fix/estabilizacion-v9-9` / PR #14 en borrador. La aceptación de un issue no equivale a publicar o fusionar la rama.

## Continuidad: cierre de issue #5 — 27/10/2026

El creador respondió «Continúa» a la pregunta expresa de aprobar el cierre de #5. Se registró el [comentario de cierre](https://github.com/LeviEdition/invierno-en-la-colonia/issues/5#issuecomment-6453435186) y GitHub confirmó [#5](https://github.com/LeviEdition/invierno-en-la-colonia/issues/5) en estado **closed**, motivo **completed**. El alcance de aceptación fue la corrección funcional C7/C7-R1, no la totalidad del videojuego. El criterio Android físico **no obligatorio** permanece; no se afirma haberlo probado. Las cuatro pruebas Chromium y las 303 aprobadas son evidencia del cierre, no pruebas nuevas agregadas en este momento.

**Estado de publicación separado:** PR #14 **draft/abierto**, `main` **sin modificación**. El cierre de issue no fusionó la corrección. Para la continuidad, el [tablero18](18-tablero-operativo.md) propone primero discutir la regla del issue #4 (transferencias entre grupos), pendiente de autorización antes de su implementación.
