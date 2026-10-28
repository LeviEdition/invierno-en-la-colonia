# Matriz de auditoría funcional — V9.9

**Propósito:** revisar exhaustivamente lo que YA existe en Invierno en la Colonia antes de extraer módulos del motor. No confundir funcionalidades previstas (2D isométrico, historias persistentes, modo online) con funcionalidades ya implementadas.

**Tablero de ejecución:** [18 — Tablero operativo](18-tablero-operativo.md). **Etapa histórica de esta matriz:** A, auditoría V9.9; **A6 cerrada con reservas en [informe 24](24-cierre-auditoria-y-prioridades.md):** Android físico no validado, pero el creador autoriza continuar a C1 de estabilización. Los 21 subsistemas quedaron clasificados; V9.9 estable intacta. Los documentos de narrativa son diseño futuro y no cambian esta prioridad.

**Fecha de inicio:** 27/10/2026 · **Rama:** `refactor/arquitectura` · **Base:** `invierno_colonia_v9_9.html`

## Actualización C16/A1 — 28/10/2026

**Subsistema18 (interfaz/accesibilidad):** el defecto A1/P2 de ayuda y fallecimiento previamente observado en Chromium recibió corrección de foco y aislamiento de fondo en `fix/estabilizacion-v9-9`. **408/408 Node**, seis regresiones nuevas C16, [CI40695224171](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40695224171) completed/success sobre `265dc0d`. Regresión roja previa en cuatro de seis escenarios, historial de iteraciones en [informe50](50-c16-foco-dialogos.md). **Nueva verificación Chromium pendiente**: se añadió script específico, no se ejecutó aquí; no dar por cerrada cobertura A1 en navegador ni por validado TalkBack/Android/WCAG. La auditoría histórica C15 permanece en el apartado siguiente.

**Fuera de C16:** alternancia del primer jugador y rediseño de dados/estadísticas/comida discutidos como decisiones de producto futuras, no implementados en V9.9. C sigue oficialmente abierta, PR14 draft y `main` intacta.

## Estado vigente tras C15 — 28/10/2026

La [matriz actual de21 sistemas en informe49](49-c15-auditoria-final.md#matriz-actual-de-sistemas-y-cobertura) sustituye la clasificación operativa antigua de abajo, preservada como historia de main/auditoríaA6. **01–19 parcialmente probados;20–21 futuros/no implementados.** C12 resuelve H1, C13 integra decisiones, C14 agrega40 partidas y5UI; C15 corrige T1/P1 (colonia puede recuperar moral0 con bonus posterior) y T2/P2 (sucesor elegido por teclado detrás de muerte).

**402/402 tests local/independiente**,8 nuevos C15,0 fallos/TODO. Chromium final: dados6viewports/24mediciones, encrucijadas16, sucesiones6, cadenas6, foco3 y terminal/teclado6; lote repetido40/40 motor y5/5UI sin excepciones/invariantes, mismo resultado/ronda, no mismos eventos. [Evidencia y fuente oficial](49-c15-auditoria-final.md). Revisión documental independiente y [CI40691454445](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40691454445) del código f1a43c7 aprobados,402/402; el checkpoint documental se verifica por su propio SHA en Actions.

**Reserva vigente A1/P2 en18:** foco de ayuda/fallecimiento no aislado; setup/pase sí (#12 acotado). Guardias funcionales corregidas no equivalen a accesibilidad completa. Sin Android físico/TalkBack/balance humano/otros navegadores. Diferencias con mesa clasificadas, no corregidas automáticamente. C se presenta para aceptación con reservas, **no cerrada oficialmente**, main intacta/PR14 draft/nueve issues abiertos. No iniciar D.

## Actualización C10/#7 — 28/10/2026

**Subsistema14, decisiones de encrucijadas IA:** selección por consecuencias reales en copias aisladas y prioridades aprobadas (victoria/derrota, muertes, alimentación, moral crítica, muestras, recursos/defensas/peligro y orden estable). Sin dependencia de texto, títulos o etiquetas; elegibilidad mecánica compartida. Consecuencias humanas/locales y reglas vigentes preservadas en624 comparaciones antes/después. [Informe43](43-c10-encrucijadas-prioridades.md).

**Validación:** 358/358 suite local (52 encrucijadas), TDD rojo→verde, 624 combinaciones de conformidad evaluación/resolución, revisión independiente sin defectos confirmados y16 recorridos Chromium en escritorio/móvil emulado. CI del código `9e68862` **completed/success**, 358/358: [GitHub Actions del código `9e68862`](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40622261665). El commit final documental se comprueba también por SHA antes de entregar. **#7 implementado, abierto para aceptación del creador**; PR14 draft, sin fusión. Reserva: política inmediata/conservadora, sin balance de partidas ni Android físico/TalkBack. El resto de esta matriz conserva el historial; no interpretar su descripción de #7 por regex como el código de la rama actual. Único siguiente paso: revisar entrega #7; no iniciar #13.


## Actualización C11/#13 — 28/10/2026

**Dados y accesibilidad táctil (subsistemas18/19, sin cambiar lógica02):** ajuste solo CSS a 44×44 px/gap8; franja inferior reservada para evitar colisiones con tablero. Pool con scroll y menú por encima; fallback de página en alturas≤520 px tras corregir R1 creado por C11. DOM y JavaScript intactos; no cambia ninguna mecánica.

[Informe44](44-c11-dados-tactiles.md): componente 111/111, suite 358/358, 0 fallos/TODO; Chromium en seis tamaños con 24 conjuntos de mediciones,0 fallos/0 errores JS. Comparación antes/después y revisión independiente aprobadas tras R1. #13 implementado para revisión, **permanece abierto**, [CI 7497d70](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40625219012) completed/success,358/358. Android físico/TalkBack no comprobados. CI de C11 aprobado; habilitada auditoría de lectura, sin implementar otros issues.


## Auditoría de pendientes C tras C11 — 28/10/2026

[Informe45](45-auditoria-pendientes-estabilizacion.md): #2/#3/#8/#9/#10/#11/#12 **corregidos en rama, abiertos para aceptación/cierre**;54/54 regresiones dirigidas y 21 comprobaciones Chromium sobre siete issues/tres viewports aprobadas. #7/#13 implementados para revisión, sin cierres. GitHub conserva nueve issues abiertos; main estable sigue original.

**H1/P2 confirmado en subsistemas10/16**, con interacción de 02/06/12/18: colonia/crisis mata ambos líderes locales y el único `pendingLeader` pierde la sucesión J2. Tras elegir J1 y pasar a J2 en ronda 2, líder null con dos supervivientes vivos y sin opción de sucesión. Reproducido en 7497d70 y 2fbbc59, fuera de C11. No se programa ni se reabre #6. La clasificación actual de esas combinaciones conserva **bug vigente**, aunque las regresiones existentes pasen. C no se considera cerrada.

Se conservan el historial y sus hallazgos de main; se delimitan foco setup/pase, pruebas físicas/balance pendientes y diferencias con mesa por contrastar sin modificar reglas. **Única siguiente tarea recomendada:** H1, sucesión múltiple local, con nueva autorización; no se inicia D/E.


## C12 — actualización de sucesiones, 28/10/2026

H1 de subsistemas10/16 corregido por peticiones separadas por dueño. R1/R2 asíncronos encontrados por revisor independiente corregidos con guardias de identidad/terminal y finally.371/371 tests,13C12; Chromium6casos reales. [Informe46](46-c12-sucesiones-simultaneas.md). No cierra etapaC ni issues; CI exacto es gate previo aC13.

## C13 — integración, 28/10/2026

Subsistemas02/06/07/08/10/14/15/16/17/18: matriz por riesgo,21regresiones nuevas y392/392 suite. Guardias de decisión, cancelación de esperas/terminal y continuidad de modal corregidas; revisor independiente confirma correcciones. Chromium6cadenas,0errores. [Informe47](47-c13-integracion-profunda.md). CI del checkpoint es gate para partidasC14; no estabilidad universal ni cierreC.

## C14 — partidas completas, 28/10/2026

Los subsistemas existentes se ejercitan con create/paint/motor reales,20semillas por modo y5partidas completas de interfaz.40/40motor,5/5UI finales,0defectos confirmados del producto; dos interrupciones inicialesUI eran driver y se conservan.394/394suite, revisión aprobada. [Informe48](48-c14-partidas-completas.md). Cobertura sigue parcial: estrategia única, objetivos4/15/1 por modo, sin balancehumano, Androidfísico/TalkBack o proofuniversal. CI exacto habilita auditoríaC15, sin declararCcerrada.

## Cierre de cobertura A6 (con limitaciones documentadas)

Los **21 subsistemas** se mantienen clasificados: 01–19 con cobertura parcial (incluidos defectos abiertos en varios); **20–21 no implementados**, fuera del alcance de V9.9. En [el informe final](24-cierre-auditoria-y-prioridades.md) figuran las 12 incidencias (#2–#13), orden propuesto y excepciones. Se aceptó **continuar sin checklist físico A5-02** por autorización explícita del creador tras partidas satisfactorias, **sin declarar que la prueba móvil física ocurrió**. Al cerrar A6, la siguiente tarea era **C1/#11**, en rama separada. El estado actual de estabilización figura en las actualizaciones siguientes y en el tablero operativo.

## Actualización de estabilización C5

En `fix/estabilizacion-v9-9`, #8 y #10 tienen guardias de transición y regresiones correctivas en `tests/modo-local-privacidad.test.mjs` y `tests/modales-estados-pendientes.test.mjs`. El pase/inicio y el aviso de muerte bloquean `finishTurn()` sin mutar estado; después de confirmar, una nueva orden permite continuar. Suite local: **252 aprobadas, 0 fallidas, 3 TODO**. Chromium verificó bloqueo y continuación en local/IA, sin errores JS. [Evidencia y límites](25-registro-estabilizacion.md#c5--8-y-10-guardias-de-fin-de-turno).

Esto actualiza los defectos #8/#10 de los subsistemas 16/18 **en la rama de estabilización**, sin borrar los hallazgos históricos de auditoría que siguen abajo. `main` conserva la versión original. Entrega y CI C5/C6 confirmados abajo; revisión final posterior con hallazgos en informe 26. C6 se registra en la actualización siguiente.

## Actualización de estabilización C6

El defecto #9 (subsistema 18) queda corregido en la rama de estabilización: la curación pendiente bloquea las acciones normales mediante `playable()`, conservando elegir paciente/cancelar. **21 casos C6**, 15 de ellos fallidos antes del arreglo, cubren cinco entradas de inventario en J1, J2 y humano contra IA y la recuperación posterior. Suite local actual: **272 aprobadas, 0 fallidas y 3 TODO** (275 declaradas). Chromium verificó seis recorridos dirigidos sin errores JS. [Registro y límites](25-registro-estabilizacion.md#c6--9-acciones-durante-curación-pendiente). CI remoto aprobado para la entrega indicada abajo; `main` sin cambios. La revisión final posterior detectó la combinación bloqueada botín/curación; ver informe 26 y siguiente tarea C6-R1. Ningún defecto adicional implementado.

## Entrega de estabilización C5/C6

Código y regresiones en [d4a6b3f](https://github.com/LeviEdition/invierno-en-la-colonia/commit/d4a6b3f45dc5c2563420980acf436a15e694775a), documentación de entrega en [64dcc2c](https://github.com/LeviEdition/invierno-en-la-colonia/commit/64dcc2c90714a5eab6c8dd1e1b4bd3d10d814dd3); el PR #14 apunta a este último al revisar. `main` conserva el blob original. **CI remoto confirmado:** [ejecución sobre `64dcc2c`](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40552240429), 275 declaradas, 272 aprobadas, 0 fallidas/canceladas/omitidas y 3 TODO. El bloqueo de red a la API se resolvió permitiendo `api.github.com`; diagnóstico y acciones en [registro 25](25-registro-estabilizacion.md#revisión-documental-y-resolución-de-acceso--27102026).

**Revisión documental, 27/10/2026:** se actualizaron las referencias obsoletas a CI sin confirmar; no se repitieron pruebas ni se amplió cobertura funcional. El usuario exige registrar cada revisión en tablero y documentación ([protocolo 15](15-protocolo-revision-critica.md#registro-obligatorio-de-cada-revisión-y-trabajo)). En aquel momento la revisión final de código C5/C6 estaba pendiente; su resultado posterior se registra abajo. No atribuir aprobación del PR a un resultado CI verde.

## Revisión final C5/C6 — 27/10/2026

[Informe 26](26-revision-final-c5-c6.md): **R1/P2 (regresión C6, subsistemas 07/18)**, botín y curación simultáneos impiden elegir botín; **R2/P2 (residual C5 preexistente, subsistemas 02/06/16)**, la cola de fallecimiento no bloquea fin de turno antes de abrir el aviso. Las protecciones de pase, muerte visible y curación aislada mantienen sus pruebas; no cubren estas combinaciones. 65/65 pruebas relevantes verdes; CI de `247f819` aprobado. Ocho experimentos Chromium confirmaron hallazgos, no una certificación de funcionamiento. Solo documentación modificada en la revisión; `main` intacta, PR en borrador sin aprobación de integración. Siguiente tarea única **C6-R1**, no iniciada aquí; R2 pendiente posterior. Android físico y TalkBack siguen sin validación formal.

## Corrección C6-R1 — 27/10/2026

R1 de la revisión anterior (subsistemas 07/18) corregido en [a5043fa](https://github.com/LeviEdition/invierno-en-la-colonia/commit/a5043fadbaa686ed9d5c4cdc8c43ab90806baa52): se rechaza iniciar curación mientras se elige botín. Seis regresiones antes fallidas pasan; las rutas de ruido, elección, curar/cancelar, aislamiento de manos y nueva búsqueda permanecen verificadas. Suite: **281 declaradas, 278 aprobadas, 0 fallidas/canceladas/omitidas y 3 TODO**; modales 48/48. Chromium verificó 12 recorridos en escritorio y ventana estrecha, sin errores JS. [Informe 27 y límites](27-correccion-c6-r1.md). Revisión independiente sin defectos en el ajuste.

**CI remoto confirmado:** [GitHub Actions sobre `a5043fa`](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40556617672), `completed/success`; logs: **281 declaradas, 278 aprobadas, 0 fallidas/canceladas/omitidas y 3 TODO**.

R2 de C5 (muerte en cola) sigue pendiente; es la siguiente tarea única propuesta, sin iniciar. No se certifican todas las combinaciones, Android físico ni TalkBack. `main` intacta y PR #14 sin fusionar. El resultado de revisión 26 anterior se conserva como evidencia histórica; C6-R1 lo actualiza para R1.

## Corrección C5-R2 — 27/10/2026

Residual R2 de revisión26 (subsistemas 02/06/16) corregido en [c19916f](https://github.com/LeviEdition/invierno-en-la-colonia/commit/c19916f609498a0e058ef19b257b0f134e0c8aa5): el fin de turno rechaza muertes en cola antes de abrir el aviso, manteniendo las esperas de una transición iniciada. Siete pruebas nuevas: seis regresiones antes fallidas y un control de muerte real durante colonia. Modales55/55; suite288 declaradas, **285 aprobadas, 0 fallidas/canceladas/omitidas y 3 TODO**. Chromium12 recorridos sin errores JS; revisión independiente sin defectos. [Informe28 y límites](28-correccion-c5-r2.md).

**CI remoto confirmado:** [GitHub Actions de `c19916f`](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40557908505), `completed/success`; logs: **288 declaradas, 285 aprobadas, 0 fallidas/canceladas/omitidas y 3 TODO previos**.

Esta actualización sustituye el estado pendiente de R2 de los apartados anteriores, conservados como históricos. No se validan todas las combinaciones ni móvil físico/TalkBack. `main` intacta; PR en borrador sin aprobación formal/fusión. Siguiente tarea única propuesta: definir prioridad IA #5 antes de implementar; no iniciada aquí.

## Actualización C7 — política cooperativa de herramientas IA (#5), 27/10/2026

Los subsistemas **07 (búsquedas), 08 (objetos), 13 (crisis) y 15 (IA)** ganan cobertura mediante diez regresiones activas. La IA ahora usa sus búsquedas normales antes de evaluar la crisis de herramientas y suma aportes previos humanos + herramientas propias de mano y equipo de supervivientes vivos. Si puede completar, dona exactamente lo faltante, primero mano y después equipo; si no, conserva. No busca bonificación extra. Se eliminó el TODO #5; quedan dos TODO (#4 y #6).

**Evidencia:** [informe30](30-correccion-c7-ia-herramientas.md) y [CI 40571819429](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40571819429): 297 declaradas, 295 aprobadas, 0 fallidas, 2 TODO. No se revisó la selección estratégica de botín, ni Chromium/Android, ni balance. PR #14 sin fusionar. La revisión posterior se registra en el informe31 y sustituye ese próximo paso histórico.

## Revisión posterior de C7 — 27/10/2026

[Informe31](31-revision-critica-c7.md): verificados código, diez regresiones y [CI sobre `9907cdb3`](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40572758503) (**297 declaradas / 295 aprobadas / 0 fallidas / 2 TODO**). La entrega final de herramientas desde mano/equipo satisface la política C7 acotada por inspección. Subsistemas 07 y 15 mantienen **cobertura parcial**: H1/P2, con `beginSearch()`, revela que la elección de muestra (puntuación 10) sobre herramienta (3) puede impedir completar una crisis salvable; aún no hay regresión dinámica de ese escenario. H2: reevaluación tras búsquedas no implementada para crisis de comida/medicina/combustible (límite preexistente, sin cambio dentro de #5). No se alteraron pruebas ni motor en esta revisión; no CI nuevo de comportamiento. Tarea posterior única: decidir política acotada de elección de botín C7-R1; Android y navegador real siguen pendientes.

## Actualización C7-R1 (#5) — Selección de botín condicionada por crisis, 27/10/2026

Tras la aprobación expresa del creador, los subsistemas **07 (búsqueda), 13 (crisis), 15 (IA) y 17 (victoria inmediata)** cuentan con ocho regresiones adicionales en `tests/ia-turnos.test.mjs`. Cuando una herramienta revelada completa la crisis con recursos de IA y contribuciones humanas anteriores, la IA la prefiere. Se preserva una muestra que completa victoria de objetivo general (incluida la habilidad de investigador); la puntuación normal sigue vigente cuando la herramienta no completa o ya existen recursos suficientes. **CI de `f1e75ed`:** [40576075140](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40576075140), **305 declaradas, 303 aprobadas, 0 fallidas y 2 TODO** (#4/#6); tres fallos de botín anteriores reproducidos en [40575929242](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40575929242). [Informe32](32-correccion-c7-r1-prioridad-botin.md).

**Límites:** cobertura aún parcial, sin búsqueda dirigida por localidades, sin cambio de crisis de otros tipos, sin Chromium/Android/TalkBack recientes ni balance demostrado. Revisión crítica posterior de C7-R1 pendiente; `main` intacta, PR14 en borrador, #5 abierto. Esta actualización no altera los estados *históricos iniciales* de la tabla de auditoría A.

## Revisión posterior de C7-R1 y reserva de aceptación — 27/10/2026

[Informe33](33-revision-critica-c7-r1.md): lectura crítica posterior del sistema de puntuación, efecto de muestras e investigador, estado de herramientas propio, crisis, `stashLoot` y `botTurn`. **Sin defectos nuevos detectados** en C7-R1; los ocho tests nuevos se verificaron en [CI 40576507329](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40576507329): **305 declaradas, 303 aprobadas, cero fallidas, 2 TODO**. H1 (prioridad de botín) corregido bajo política aprobada. Estado de subsistemas 07/13/15: **parcialmente probados** hasta que se validen modales, encrucijadas y navegación real en navegador. No se cambiaron ejecutables ni casos de test en esta revisión. Siguiente única tarea: aceptación manual C7/C7-R1 en navegador, no integrar a `main` todavía.

## Smoke test adicional C7/C7-R1 en Chromium — 27/10/2026

[Informe34](34-validacion-navegador-c7-r1.md): se verificó identidad **binaria** del HTML de rama con Git blob `7ae72fc88381e5109b5f64929f6b017a2d5d5dc6` y se ejecutaron **4 recorridos en Chromium + Playwright**: colaboración 1/2 humano con herramienta equipada IA y encrucijada; elección herramienta frente a muestra no ganadora y encrucijada de búsqueda; victoria inmediata por muestra; victoria duplicada por investigador con controles táctiles emulados a 390 × 844. No se registraron errores JS ni bloqueos en estos flujos. Se detectó y resolvió legítimamente un modal inicial humano en un recorrido; el cierre de ese modal fue condición normal para habilitar los controles.

**Alcance de evidencia:** escenarios de estado preparado y temporizadores acortados; HTML inyectado en Chromium por `set_content` debido a bloqueo de `file://`; no Android físico, TalkBack, hosting ni partidas completas aleatorias. Subsistemas 07/13/15 reciben verificación de navegador **en cuatro casos**, sin certificar cobertura completa. CI previo [40577893140](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40577893140) sigue en 305/303/0/2. Siguiente tarea única: aceptación administrativa de #5; no cerrar o fusionar automáticamente.

## Aceptación funcional de C7/C7-R1 y cierre de #5 — 27/10/2026

**Estado actual tras autorización del creador:** [#5](https://github.com/LeviEdition/invierno-en-la-colonia/issues/5) **closed/completed**; [comentario con evidencias](https://github.com/LeviEdition/invierno-en-la-colonia/issues/5#issuecomment-6453435186). La selección de herramientas de la IA y su aporte en la crisis (#5) quedan **corregidos y aceptados en rama** con ocho regresiones C7-R1, diez C7, [CI 40582012525](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40582012525): 303 aprobadas, 0 fallidas y 2 TODO (#4/#6), más cuatro recorridos controlados Chromium ([informe34](34-validacion-navegador-c7-r1.md)). Android físico no es requisito de aceptación de #5, aunque su comportamiento no fue certificado. **Este cierre NO significa que código haya llegado a `main`;** PR #14 sigue draft y sin fusión. La tabla histórica inicial de defectos más abajo conserva el estado **en el momento de la auditoría original**, no debe leerse como inventario actual. Próxima decisión propuesta: #4, reglas de transferencia entre grupos; no iniciado.

## C8/#4 — Transferencias según modo: implementación y cobertura, 27/10/2026

Se reemplazó el `test.todo` del issue #4 por **14 regresiones ejecutables** en `tests/combate-equipamiento.test.mjs`: filtros y defensa frente a llamada directa humano→IA, transferencia interna humana conservada, entrega bidireccional J1↔J2 local y dentro del grupo J2, bloqueo durante pase/turno equivocado, cambios de modo/localidad/vida/categoría/objeto y doble confirmación. [CI rojo 40585772252](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40585772252): 318 declaradas, 309 aprobadas, **8 fallidas**, 1 TODO. [Parche `37d86d6`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/37d86d6bdb4707ff7ebf95a8274bd5747a08b989), filtro compartido `canReceiveTransfer` y doble comprobación apertura/confirmación. [CI verde 40585960363](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40585960363): **318 declaradas, 317 aprobadas, 0 fallidas, 1 TODO** (#6).

**Chromium real:** tres escenarios de UI verificados, incluido pase J1→J2 y cesión J2→J1 a 393 px táctiles simulados; cero errores JS. Archivo de motor exacto `32eb545cbdbca047ded8bc81d64b8e438e096a49`, verificado contra GitHub. [Informe35](35-c8-transferencias-por-modo.md). El issue #4 **sigue abierto** a espera de revisión crítica posterior y aceptación; no está integrado en `main`. La sección histórica de incidencias de auditoría más abajo conserva el estado original, no debe confundirse con la situación actual.

## Revisión crítica independiente C8/#4 — 27/10/2026

[Informe36](36-revision-critica-c8.md): auditoría de `canReceiveTransfer`, `startTransfer`, `chooseTransfer`, `pendingTransfer.itemRef`, turno/pase y 14 regresiones; **no se identificaron defectos nuevos confirmados** en C8. **Seis controles adicionales Chromium** (destino IA forzado, receptor que pasa a duplicar categoría, ítem cambiado, donante muerto, pase activo, destino con categoría complementaria) aprobaron sin excepciones JS. Sumados a los 3 anteriores del informe35: **9 pruebas de navegador acotadas**; `npm test` remoto del código auditado 318 declaradas, **317 aprobadas, 0 fallidas, 1 TODO (#6)** ([CI 40586682191](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40586682191)). **Limitaciones:** no Android/TalkBack, no partida aleatoria completa; la sincronización de otros modales queda en revisión transversal P3, sin bug demostrado de #4. Solo documentación en esta revisión. **Issue #4 permanece abierto hasta su aceptación explícita**, PR14 draft, `main` intacta.

## Estado operativo al reanudar C9/#6 — 27/10/2026

Con permiso del creador, [issue #4](https://github.com/LeviEdition/invierno-en-la-colonia/issues/4) **cerrado/completed** luego de C8, 14 regresiones, validación Chromium y [revisión crítica 36](36-revision-critica-c8.md). La corrección permanece solo en `fix/estabilizacion-v9-9` y PR14 draft, sin integración en `main`.

El siguiente defecto funcional real es [#6](https://github.com/LeviEdition/invierno-en-la-colonia/issues/6): durante turno local J2, las acciones `consume()`, `doMove()` y `playItem()` fijan el flag inicial de líder de **J1** y dejan `localLeaderChosen` inalterado. Código e interfaz inspeccionados y [alternativas A/B comentadas en el issue](https://github.com/LeviEdition/invierno-en-la-colonia/issues/6#issuecomment-6454546559). **A propuesta:** bloquear nueva elección de líder inicial tras primera acción para ambos, preservando la regla previa de J1; **B:** permitir cambiar durante toda ronda 1 para ambos. **No decidido ni corregido:** se espera criterio explícito del creador, el único `test.todo` vigente sigue siendo #6. El apartado histórico de esta matriz corresponde a la auditoría original y no muestra necesariamente estados actuales.

## C9/#6 — Política A, liderazgo inicial simétrico J1/J2 — 27/10/2026

El creador autorizó **A**: un jugador confirma a su líder inicial con la primera acción válida que antes cerraba esa elección para J1 (gastar dado, mover o usar carta); J2 local debe comportarse igual. Se convirtió el único `test.todo` #6 en **12 pruebas ejecutables** `tests/finales-lideres.test.mjs` ([rojo 40591148076](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40591148076): **331 declaradas, 327 aprobadas, 4 fallidas, 0 TODO**). [Parche `38e7ac8`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/38e7ac87832e4ca02dbf277dcc1a8acb56ce2849) introdujo `confirmStartingLeader()` que selecciona flag de J1/J2 por dueño de turno y se invoca solo después de acción exitosa; texto de UI actualizado. [Verde 40591238120](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40591238120): **331 declaradas, 331 aprobadas, 0 fallidas, 0 TODO**.

**Chromium:** cinco recorridos UI con botones reales y traspaso de dispositivo J1→J2, incluidos dos en viewport móvil simulado; **cinco aprobados sin errores JS**. Blob del HTML de la rama **`b5b9f2020c5abb73fd95e0f7441db088bb746d16`**, confirmado igual al archivo que probó Chromium. [Informe38](38-c9-lider-inicial-j2.md). El bloqueo se limita a las tres clases de acción previamente vigentes en J1; otros eventos y habilidades no forman parte de C9. La sucesión por muerte continúa con su flujo propio. **Issue #6 todavía abierto**; siguiente trabajo: revisión crítica posterior antes de aceptar/cerrar. PR14 draft, `main` intacta. La tabla original más abajo es registro histórico, no estado actual.

## Revisión crítica C9 y reparación C9-R1 — 27/10/2026

**Liderazgo humano:** elección manual del líder por cada jugador, al estilo *Dead of Winter*, **sin obligación** de mayor influencia. C9 política A sigue confirmando líder inicial al gastar dado, moverse o usar carta con éxito en ronda 1, y permite elección manual del sucesor si el líder fallece.

**P2 comprobado en revisión posterior:** la muerte del líder de J2 durante turno de J1 abría selector de J2 en la pantalla de J1 y permitía elegir por el otro. [Informe39](39-revision-critica-c9-r1.md) presenta reproducción Chromium. **C9-R1**: [tests `ed817b5`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/ed817b59825268c54aa1f183c783f19af3189c83) agregaron **5 regresiones**; [CI rojo 40593244756](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40593244756): **336 declaradas, 331 aprobadas, 5 fallidas**. [Parche `e84db6a`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/e84db6ae088f314e232e377c15cda37683cce19b): turno/propietario/menú/pase restringen quién puede nombrar sucesor. [CI verde 40593438595](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40593438595): **336 declaradas, 336 aprobadas, 0 fallidas, 0 TODO**. **Tres** escenarios nuevos Chromium con pase real, sucesión propia y automatismo IA aprobados (blob `2682f96f0d451eb0083fd9eaa3762b266f8aab60`); sin errores JS.

**Reservas:** no todas las combinaciones de muertes simultáneas de líderes ni rondas aleatorias fueron reproducidas; hay un único estado global `pendingLeader`, por lo cual esa concurrencia queda para validación cruzada de fin de etapa. No se probó dispositivo Android físico y no es paso obligatorio aquí. **Issue #6 abierto** a espera de aceptación/cierre administrativo; PR14 borrador sin fusión a `main`. La tabla histórica posterior no refleja el estado actual de los issues.

## Cierre de C9/#6 y estado de estabilización — 27/10/2026

El creador autorizó cerrar [issue #6](https://github.com/LeviEdition/invierno-en-la-colonia/issues/6), **closed/completed** (`2026-10-27T22:30:07Z`) con [comentario de cierre](https://github.com/LeviEdition/invierno-en-la-colonia/issues/6#issuecomment-6455187002). La elección humana del líder se mantiene **manual**, sin imponer mayor influencia; C9 iguala los disparadores de confirmación inicial J1/J2 y C9-R1 protege que cada jugador elija a **su propio sucesor después del pase de dispositivo**. IA sigue automatizada. [Informes38](38-c9-lider-inicial-j2.md) y [39](39-revision-critica-c9-r1.md). [CI 40594225022](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40594225022): **336 declaradas / 336 aprobadas / 0 fallidas / 0 TODO**. Cobertura Chromium acotada; muertes simultáneas de líderes quedan como riesgo por un único `pendingLeader`.

**Cierre administrativo ≠ integración.** `main` mantiene SHA `d9068f4aa8d3a10bbbf1e0a8a2527744cc6952cb`, [PR14](https://github.com/LeviEdition/invierno-en-la-colonia/pull/14) sigue abierto/draft hacia `refactor/arquitectura`. Siguiente propuesta sujeta a autorización: análisis de [#7](https://github.com/LeviEdition/invierno-en-la-colonia/issues/7), decisión IA en encrucijadas; después #13 y auditoría de alertas. La matriz histórica más abajo conserva estados de la auditoría inicial y **no** refleja necesariamente los estados presentes.

## Estado consolidado de continuidad — 27/10/2026

[Informe40](40-estado-actual-y-continuidad.md), instantánea `d09021f`: suite ejecutada aquí **336/336 aprobadas, 0 fallidas/canceladas/omitidas y 0 TODO**; [CI exacto](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40595507459) verificado con logs. Se contrastaron cambios C7/C7-R1, C8, UX combustible y C9/C9-R1 con sus informes. #5/#4/#6 aceptados y cerrados; #7/#13 pendientes. No se repitió Chromium ni se amplió cobertura al resumir el estado; dos líderes muertos simultáneamente, Android/TalkBack y balance mantienen reservas. Siguiente propuesta única: analizar/definir #7 antes de código. PR14 draft y `main` intacta.

## Estados de auditoría

- **Parcialmente probado (P):** hay pruebas automatizadas, pero faltan escenarios importantes.
- **Pendiente (N):** aún no hay pruebas de comportamiento suficientes.
- **Problema confirmado (B):** fallo reproducido; se registra sin cambiar reglas.
- **No implementado (F):** objetivo futuro; fuera de la auditoría de la versión actual.

Ningún subsistema debería declararse **completo** solo por pasar una prueba unitaria. La validación final incluye reglas, integraciones entre turnos y pruebas manuales en navegador y celular.

## Inventario histórico de funcionalidades (auditoría A6, no estado actual C15)

| Nº | Subsistema | Casos que revisaremos | Estado inicial |
| --- | --- | --- | --- |
| 01 | Inicio y objetivos | modos, selección de objetivos, valores iniciales, reparto de personajes, mazos y reinicio | **P**: seis pruebas de estado inicial |
| 02 | Turnos y rondas | orden humano/IA o J1/J2, reinicios, fases, conteo de rondas y fin | **P**: J1/J2 y ciclo humano→IA→colonia→ronda siguiente (sin encrucijadas ni DOM real) |
| 03 | Dados y comida para mejorarlos | umbrales, selección, consumo, agotamiento, mejora por cada jugador | **B**: jugador 2 local bloqueado al agotarse los dados de J1; [#3](https://github.com/LeviEdition/invierno-en-la-colonia/issues/3) |
| 04 | Movimiento | límites por turno, capacidad, inmovilidad, combustible, excepciones | **P**: cinco pruebas |
| 05 | Exposición | caras del dado, lesiones, congelación, protección por habilidad | **P**: cuatro pruebas |
| 06 | Mordeduras y muerte | orden de afectados, IA frente a humano, decisiones, moral, equipamiento y reemplazos | **P**: propagación, sacrificio, riesgo y daños |
| 07 | Búsqueda | requisitos de dado, mazos, elección, ruido, cartas devueltas y mazo agotado | **P**: 13 pruebas de búsqueda y comportamiento de cartas; integración visual pendiente |
| 08 | Catálogo y uso de objetos | comida, medicina, herramientas, armas, combustible, notas, efectos y residuos | **P**: catálogo, consumibles, manual, armas y herramientas principales; otros efectos e integraciones pendientes |
| 09 | Equipamiento e intercambios | equipar, límites, transferir, devolución/caída al morir, habilidades de equipo | **P**: límites, transferencias y equipo al morir; **definición pendiente [#4](https://github.com/LeviEdition/invierno-en-la-colonia/issues/4)** |
| 10 | Habilidades e influencia | habilidades de personajes, usos por ronda, líderes, sucesión e influencia | **P**: elección y sucesión de líderes J1/J2/IA, influencia, resistencia y ataque; inconsistencia local [#6](https://github.com/LeviEdition/invierno-en-la-colonia/issues/6) |
| 11 | Barricadas y zombis | colocación, capacidad, llegada, desbordamiento, eliminación, atraer y limpiar | **P**: ataques, defensa, desbordamiento, indefensos, atraer y limpiar; combinaciones completas pendientes |
| 12 | Fase de colonia | consumo de comida, hambre acumulada, basura, crisis, zombis y ruido | **P**: alimentación, hambre, basura, crisis, oleadas y ruido; secuencia con IA probada sin narrativa |
| 13 | Crisis y contribuciones | selección de tipo, cartas válidas, premio de sobreaporte, penalizaciones | **P**: aportes desde mano/equipo, rechazo de categoría, sobreaporte, éxito/fallo de moral; penalizaciones restantes pendientes |
| 14 | Encrucijadas narrativas | activación, disponibilidad de opciones, gastos, efectos e IA | **P + B**: 26 pruebas de cartas, disparadores, actor, elecciones J1/J2/IA y efectos; errores [#2](https://github.com/LeviEdition/invierno-en-la-colonia/issues/2) y [#7](https://github.com/LeviEdition/invierno-en-la-colonia/issues/7) |
| 15 | Inteligencia artificial | selección de acciones, objetos, búsqueda/combate, encrucijadas, bloqueos | **P**: 20 pruebas de equipamiento, decisiones, desplazamiento, combate y turno completo; narrativa y DOM pendientes; [#5](https://github.com/LeviEdition/invierno-en-la-colonia/issues/5) |
| 16 | Dos jugadores en mismo dispositivo | privacidad en pantalla de pase, manos, dados, selección, líder y cambio de turnos | **P + B**: [20 pruebas específicas A2-01](19-auditoria-modo-local.md) de manos/dados, pase y estados pendientes; **B**: dados [#3](https://github.com/LeviEdition/invierno-en-la-colonia/issues/3), liderazgo [#6](https://github.com/LeviEdition/invierno-en-la-colonia/issues/6) y salto por llamada interna [#8](https://github.com/LeviEdition/invierno-en-la-colonia/issues/8); pantalla de pase visualmente cubierta en Chromium A5-01; foco de teclado no aislado [#12](https://github.com/LeviEdition/invierno-en-la-colonia/issues/12); Android físico pendiente |
| 17 | Victoria, derrota y situaciones límite | objetivos, moral cero, sin supervivientes, límite de rondas, estados pendientes | **P + B**: [A4: 23 pruebas](21-auditoria-integracion-a4.md), victorias/derrotas, rescates y partidas dirigidas de 10 rondas; fallo de fin de IA [#11](https://github.com/LeviEdition/invierno-en-la-colonia/issues/11), integración visual pendiente |
| 18 | Interfaz y accesibilidad | clics, modales, perfil, avisos, cartas, contraste, tamaño táctil y foco | **P + B**: [A3: 21 pruebas simuladas](20-auditoria-modales-a3.md); [A5-01: Chromium real](22-auditoria-navegador-a5.md) comprobó menús, búsqueda, encrucijadas y modales. Defectos de contrato [#9](https://github.com/LeviEdition/invierno-en-la-colonia/issues/9), [#10](https://github.com/LeviEdition/invierno-en-la-colonia/issues/10) y foco de teclado [#12](https://github.com/LeviEdition/invierno-en-la-colonia/issues/12); lector de pantalla pendiente |
| 19 | Móvil y rendimiento | vista vertical, sin scroll horizontal, render y animaciones, dispositivos modestos | **P + B**: A5-01 emulación 393×852, 320×640 y 852×393 sin overflow horizontal ni errores JS; [#13](https://github.com/LeviEdition/invierno-en-la-colonia/issues/13) dados táctiles de 26×25 px. **Android físico, rendimiento y gestos reales: N** |
| 20 | Guardado, reconexión y multijugador por red | persistencia general, servidor autoritativo, WebSockets | **F**: objetivos futuros, no presentes en V9.9 |
| 21 | Narrativa persistente (prioridad creativa) y escenas 2D | historia principal, arcos conectados, memoria de decisiones, consecuencias, personajes, sprites y escenas | **F**: diseño narrativo inicial en documentos 12 y 13; **no implementado** todavía en V9.9 |

## Orden recomendado de trabajo

### Bloque 1 — Base y salud del motor (en curso)
- [x] Inicio de partida, modo local inicial y objetivos.
- [x] Movimiento, combustible y exposición básica.
- [x] Mordeduras y decisiones humanas; comportamiento automático de IA.
- [x] Reinicio de movimiento y habilidades por ronda; crisis simples.
- [x] Caracterización de turnos J1/J2 y humano/IA sin encrucijadas ni DOM real; sigue pendiente integración narrativa/visual.
- [x] Caracterización inicial de victorias, derrotas, reemplazos de emergencia y rescates (30 pruebas nuevas).

### Bloque 2 — Recursos, objetos y acciones
- [x] Caracterización inicial de búsqueda, ruido, mazos y elección de cartas (17 pruebas, junto con efectos básicos de objetos).
- [x] Caracterización parcial de objetos consumibles, armas, herramientas, transferencias y equipo al morir (22 pruebas nuevas).
- [ ] Completar dados, comida, ataque, barricadas, atraer zombis y limpieza (ataque y parte de barricadas ya probados).

### Bloque 3 — Fase de colonia e IA
- [x] Caracterización inicial de alimentación, hambre, basura, crisis y oleadas (28 pruebas nuevas); completar escenarios de integración.
- [x] Primera caracterización del turno IA: equipamiento, recursos, movimiento, acciones y vuelta a ronda siguiente (20 pruebas); narrativa todavía pendiente.
- [x] Parte de los casos límite: sin capacidad, sin cartas, sin dados, sin supervivientes y roster agotado; faltan interacciones narrativas/visuales.

### Bloque 4 — Narrativa y modos de juego
- [x] Primera auditoría de encrucijadas: 26 cartas, efectos, requisitos, J1/J2 e IA (26 pruebas; integración visual pendiente).
- [x] Caracterización inicial de líderes e influencia (J1, J2 e IA), con inconsistencia [#6](https://github.com/LeviEdition/invierno-en-la-colonia/issues/6) pendiente de definir.
- [x] Caracterización automatizada de privacidad de manos y dados en modo local (A2-01: 20 pruebas); verificación visual real pendiente A5.

### Bloque 4B — Núcleo narrativo prioritario (diseño, NO implementación)
- [x] Establecer la narrativa y el impacto de decisiones como eje del juego.
- [x] Documentar sistema de historias conectadas, memoria y consecuencias diferidas.
- [x] Proponer un arco piloto de cuatro episodios para validar tono, agencia y efectos persistentes.
- [ ] Aprobar el arco piloto y diseñar el estado serializable antes de programarlo.
- [ ] Validar dos rutas jugables con diferencias narrativas observables y consecuencias al menos dos rondas después.

### Bloque 5 — Integración y experiencia de usuario
- [x] A4: 23 pruebas dirigidas de integración, incluidas victorias, derrotas y partidas de 10 rondas; no confundir con partida sin recursos manipulados.
- [ ] Una partida natural reproducible en navegador hasta victoria/derrota, sin alterar recursos ni mazos.
- [x] A3: 21 pruebas automáticas de modales y estados pendientes (DOM simulado).
- [x] A5-01: pruebas visuales/automatizadas en Chromium real de escritorio, 1365×768 (sin errores JS en los recorridos elegidos).
- [x] A5-01: emulación táctil Chromium en 393×852, 320×640 y 852×393; es emulación, no celular físico.
- [ ] A5-02: pruebas reales en Android físico con [guía específica](23-guia-prueba-android-a5.md).
- [x] A5-01: ausencia de desplazamiento horizontal **de página** en cuatro tamaños seleccionados; revisión inicial de foco/tamaños documentada.
- [ ] Accesibilidad completa (teclado y TalkBack), rendimiento y ergonomía en dispositivo físico.

## Problemas confirmados durante la auditoría

1. [#2 — Encrucijadas rechazan objetos disponibles](https://github.com/LeviEdition/invierno-en-la-colonia/issues/2). Las manos contienen objetos, pero ciertas restricciones/efectos buscan cadenas.
2. [#3 — Mejora de dados en el jugador 2](https://github.com/LeviEdition/invierno-en-la-colonia/issues/3). `boostDie()` consulta la reserva de dados del jugador 1 para validar el turno del segundo.
3. [#4 — Transferencias entre grupos](https://github.com/LeviEdition/invierno-en-la-colonia/issues/4): el equipo se puede transferir al otro grupo aunque el texto de la interfaz diga «propio». Definir si es una regla permitida antes de cambiarla.
4. [#5 — Herramientas de IA y crisis](https://github.com/LeviEdition/invierno-en-la-colonia/issues/5): la IA equipa herramientas y luego no considera contribuirlas desde el equipo a la crisis.
5. [#6 — Liderazgo inicial de J2](https://github.com/LeviEdition/invierno-en-la-colonia/issues/6): J2 puede elegir líder después de actuar, mientras J1 queda bloqueado.
6. [#7 — Decisiones narrativas de IA basadas en texto](https://github.com/LeviEdition/invierno-en-la-colonia/issues/7): la IA no reconoce ciertos riesgos por diferencias de redacción.
7. [#8 — Lógica de pase sin guardia interna](https://github.com/LeviEdition/invierno-en-la-colonia/issues/8): `finishTurn()` permite avanzar mediante llamada directa mientras el pase está activo; no demostrado a través de controles normales.
8. [#9 — Acción de inventario durante curación pendiente](https://github.com/LeviEdition/invierno-en-la-colonia/issues/9): por invocación interna, `playItem()` no bloquea la curación.
9. [#10 — Fin de turno durante aviso de muerte](https://github.com/LeviEdition/invierno-en-la-colonia/issues/10): llamada interna a `finishTurn()` puede avanzar sin confirmar fallecimiento.
10. [#11 — IA alcanza meta y pierde antes de verificar](https://github.com/LeviEdition/invierno-en-la-colonia/issues/11): victoria con notas puede llegar demasiado tarde si la colonia reduce la moral a cero.
11. [#12 — Foco de teclado escapa de setup/pase](https://github.com/LeviEdition/invierno-en-la-colonia/issues/12): confirmado en Chromium; riesgo de accesibilidad y posible exposición a lectores de pantalla, no filtración visual demostrada.
12. [#13 — Dados con área táctil demasiado pequeña](https://github.com/LeviEdition/invierno-en-la-colonia/issues/13): 26×25 px en vistas móviles emuladas.
11. **Comportamiento de diseño a revisar** (no se declara bug): una mordedura iniciada en el turno humano puede hacer que la IA sacrifique automáticamente a su superviviente con menor influencia, cortando la cadena antes de pedir una decisión humana.

## Reglas para reportar resultados

Cada funcionalidad tendrá: **precondición → acción → estado esperado → resultado real → evidencia** (prueba automatizada o escenario manual). Los defectos se registran por separado y se corrigen en cambios específicos; no se insertan correcciones silenciosas durante la refactorización.

**Resultado histórico de A4:** la suite contenía **238 pruebas ejecutables aprobadas** (194 previas, 21 de modales A3 y 23 de integración A4), más **3 TODO** (#4, #5 y #6): **241 declaradas, 0 fallidas**. [Ejecución histórica comprobada](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40528489536). GitHub Actions verifica el conjunto. La cantidad de pruebas **no equivale a cobertura funcional completa**, y el motor narrativo persistente sigue siendo una propuesta por aprobar.
