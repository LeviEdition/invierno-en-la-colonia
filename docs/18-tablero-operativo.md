# 18 — Tablero operativo y control de etapas (fuente única del próximo paso)

**Última revisión:** 27/10/2026. **Proyecto:** Invierno en la Colonia. **Rama activa de ajustes:** `fix/estabilizacion-v9-9` (base de auditoría `refactor/arquitectura`).
**Documento operativo**: a diferencia de los documentos conceptuales, este archivo determina qué hacemos **ahora**, qué queda estacionado y qué evidencia habilita cambiar de fase.

> **NORMA DE TRABAJO:** una etapa activa, una tarea activa. No empezar una fase posterior porque surgió una idea interesante; anotar la idea y retomar lo previsto. Cambiar prioridades exige una decisión explícita registrada aquí.

> **REGISTRO OBLIGATORIO (acuerdo del usuario, 27/10/2026):** al terminar cada revisión, actualizar este tablero. Documentar acciones, decisiones, cambios, resultados, evidencia y límites en el registro pertinente, aunque no se haya modificado código. Véase [protocolo](15-protocolo-revision-critica.md#registro-obligatorio-de-cada-revisión-y-trabajo).

## 1. Estado comprobado y alcance

- **Estable:** `main`, `invierno_colonia_v9_9.html`, SHA Git blob `4ebaedad13d63c7a6762c524a52c0dd9695687b1`. El archivo es idéntico en `main` y `refactor/arquitectura` al revisar.
- **Auditoría:** PR [#1](https://github.com/LeviEdition/invierno-en-la-colonia/pull/1) abierto y en borrador; no fusionar por ahora.
- **Pruebas actuales de estabilización:** C7-R1/#5, **303 aprobadas, 0 fallidas y 2 TODO** (305 declaradas), [CI 40576075140](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40576075140) sobre `f1e75ed`. Los resultados C7 295/2 y C5-R2 285/3 son históricos; Android físico/TalkBack pendientes.
- **Problemas registrados:** [#2](https://github.com/LeviEdition/invierno-en-la-colonia/issues/2), [#3](https://github.com/LeviEdition/invierno-en-la-colonia/issues/3), [#4](https://github.com/LeviEdition/invierno-en-la-colonia/issues/4), [#5](https://github.com/LeviEdition/invierno-en-la-colonia/issues/5), [#6](https://github.com/LeviEdition/invierno-en-la-colonia/issues/6), [#7](https://github.com/LeviEdition/invierno-en-la-colonia/issues/7) y [#8](https://github.com/LeviEdition/invierno-en-la-colonia/issues/8), [#9](https://github.com/LeviEdition/invierno-en-la-colonia/issues/9), [#10](https://github.com/LeviEdition/invierno-en-la-colonia/issues/10) y [#11](https://github.com/LeviEdition/invierno-en-la-colonia/issues/11), [#12](https://github.com/LeviEdition/invierno-en-la-colonia/issues/12) y [#13](https://github.com/LeviEdition/invierno-en-la-colonia/issues/13). El #4 requiere resolver una ambigüedad de reglas, no presumir que es un bug.
- **Narrativa:** visión, objetivos, campañas y bocetos registrados en `docs/12`–`docs/17`. Son **propuestas y decisiones de diseño**, no código ni campañas implementadas.

## Entrega C5/C6 para revisión

Código y pruebas subidos en [d4a6b3f](https://github.com/LeviEdition/invierno-en-la-colonia/commit/d4a6b3f45dc5c2563420980acf436a15e694775a); documentación de entrega en [64dcc2c](https://github.com/LeviEdition/invierno-en-la-colonia/commit/64dcc2c90714a5eab6c8dd1e1b4bd3d10d814dd3). Al revisar, la rama y el [PR #14](https://github.com/LeviEdition/invierno-en-la-colonia/pull/14) apuntan a `64dcc2c`; está abierto, en borrador y con base `refactor/arquitectura`, sin revisiones formales registradas. `main` sigue en `d9068f4` y conserva el blob estable `4ebaedad13d63c7a6762c524a52c0dd9695687b1`. Sin fusión, cierre de issues ni publicación de versión.

**CI remoto confirmado:** [código `d4a6b3f`](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40552155171) y [entrega `64dcc2c`](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40552240429), ambos `completed/success`. Los logs de la entrega confirman 275 declaradas, 272 aprobadas, 0 fallidas/canceladas/omitidas y 3 TODO. La revisión final de C5/C6 se registra abajo con hallazgos; CI verde no equivale a aprobación.

### Revisión documental y resolución de acceso — 27/10/2026

Se comprobaron rama/PR/`main`, metadatos de CI y conteos en sus logs, y se corrigieron las referencias actuales que aún decían «CI sin confirmar». El rechazo previo provenía del proxy (`Tunnel connection failed: 403 Forbidden`): faltaba permitir `api.github.com`. Se guardó ese dominio en el borrador de configuración; el usuario aplicó el cambio y las consultas de API ahora funcionan. No hizo falta solicitar un token ni modificar el juego.

Por instrucción del usuario se incorporó la obligación de actualizar el tablero tras **cada revisión** y documentar todo trabajo significativo en [protocolo 15](15-protocolo-revision-critica.md#registro-obligatorio-de-cada-revisión-y-trabajo), este tablero, [registro 25](25-registro-estabilizacion.md#revisión-documental-y-resolución-de-acceso--27102026) y matriz 04. Una revisión paralela de documentación detectó las referencias obsoletas; no se delegaron cambios de código. Esta actualización solo modifica esos cuatro documentos: se comprueba `git diff --check`, sin repetir pruebas locales de código que no cambió. Los nuevos commits documentales se comprobarán en Actions por su SHA, sin atribuirles por anticipado el resultado de `64dcc2c`.

**Resultado y límites de aquella revisión documental:** acceso y CI de la entrega confirmados; documentación sincronizada. No se realizó entonces una nueva prueba de navegador o dispositivo físico ni una revisión final de código; la revisión de código posterior figura abajo. #5 sigue siendo una propuesta de trabajo posterior que requiere acordar la prioridad de la IA; no está iniciada ni autorizada su implementación.

## 2. Etapa activa C — estabilización; C6-R1 y C5-R2 corregidas y revisadas

**Objetivo:** saber qué hace realmente el juego, qué falla y qué no se ha probado, antes de intervenir sus reglas o extraer módulos.

### Orden operativo dentro de A

| Orden | Bloque | Resultado necesario | Situación |
| --- | --- | --- | --- |
| A1 | Caracterización automatizada de reglas y encrucijadas | Pruebas reproducibles del motor y matriz documentada | **Avanzado, no exhaustivo** |
| A2 | Modo de dos jugadores en el mismo dispositivo | Dados/manos separados, pase de turno, interacciones y bloqueo de datos privados, casos pendientes | **Cerrado como caracterización automatizada (20 pruebas); visual pendiente A5** |
| A3 | Interfaz, modales y secuencias de acciones | Pruebas de decisiones, cierre/apertura de diálogos, sucesión, mordeduras, esperas de IA y pantallas de pase | **21 pruebas automatizadas cerradas; interfaz real pendiente A5** |
| A4 | Integración de partidas completas | Reproducir al menos una victoria y una derrota, modos local e IA, con finales y casos excepcionales | **23 pruebas automatizadas cerradas, incluidas partidas dirigidas de 10 rondas; naturalidad/balance pendientes** |
| A5 | Verificación en navegador real y móvil | Lista manual/evidencia de escritorio y Android, táctil, desplazamiento horizontal, accesibilidad y rendimiento básico | **A5-01 completado; A5-02 físico diferido y documentado (no aprobado)** |
| **A6** | **Cierre de cobertura** | Matriz de 21 subsistemas actualizada con evidencia y límites explícitos; lista priorizada de defectos sin resolver | **Documentado con reservas en [24](24-cierre-auditoria-y-prioridades.md). Usuario autoriza pasar a ajustes.** |

**Importante:** A2 y A3 pueden compartir escenarios; no marcar una interacción visual como validada solo por probar funciones con DOM simulado.

### A2-01 — Completada como caracterización automatizada

**Resultado:** 20 pruebas nuevas; privacidad de manos y dados, pase de turno y estados pendientes caracterizados. **194 pruebas aprobadas, 0 fallidas y 3 TODO**. Defectos: [#3](https://github.com/LeviEdition/invierno-en-la-colonia/issues/3) previo y [#8](https://github.com/LeviEdition/invierno-en-la-colonia/issues/8) nuevo. No corregimos reglas. **La validación visual real, foco, pantalla táctil y uso del celular siguen pendientes de A5**.

**Evidencia:** [docs/19-auditoria-modo-local.md](19-auditoria-modo-local.md) y [suite CI](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40524535143).

### A3-01 — Cerrada como caracterización automatizada

**Resultado:** [informe](20-auditoria-modales-a3.md), 21 tests, defectos de contrato [#9](https://github.com/LeviEdition/invierno-en-la-colonia/issues/9) y [#10](https://github.com/LeviEdition/invierno-en-la-colonia/issues/10). Pruebas visuales pendientes.

### A4 — Cerrada como integración automatizada dirigida

**Resultado:** [informe](21-auditoria-integracion-a4.md), 23 tests, recorridos de victoria/derrota, dos partidas dirigidas de 10 rondas, defecto de victoria de IA [#11](https://github.com/LeviEdition/invierno-en-la-colonia/issues/11).

**Advertencia:** no se comprobó el balance de campañas bajo azar y recursos naturales; no se evaluó la interfaz real. **A4 automatizado completo no significa auditoría A completa.**

### A5-01 — Verificación en Chromium y emulación táctil ejecutada

**Evidencia:** [informe A5-01](22-auditoria-navegador-a5.md), 40 comprobaciones principales en cuatro viewports (1365×768, 393×852, 320×640 y 852×393) y 12 comprobaciones especiales en tres viewports. Menú, búsqueda, botín, encrucijadas, muerte, pase e inventario J2 funcionan en el navegador; sin errores JS ni desbordamiento horizontal de página en esos tamaños.

**Defectos nuevos confirmados:** [#12](https://github.com/LeviEdition/invierno-en-la-colonia/issues/12), foco de teclado sale de setup/pase; [#13](https://github.com/LeviEdition/invierno-en-la-colonia/issues/13), dados flotantes de 26×25 px para uso táctil. No se corrigieron. **Las pruebas de móvil fueron emuladas: no Android real.**

### A5-02 — Verificación física diferida; no ejecutada

**Alcance:** ejecutar [guía manual](23-guia-prueba-android-a5.md) en al menos un teléfono Android. Validar apertura, scroll vertical, acciones, dados, modales, mano del segundo jugador, pase privado, orientación y respuesta táctil. Registrar observado/esperado, modelo, navegador y capturas de fallos si se producen.

**Estado:** sin checklist de Android físico. El usuario indica que ha jugado repetidas veces con buen funcionamiento y autoriza avanzar. Se conserva como **riesgo pendiente**; no se afirma dispositivo, navegador ni pasos verificables. [Guía futura](23-guia-prueba-android-a5.md).

### A6 — Lista de prioridades documentada; B1 y C1 habilitadas

**Informe de cierre y priorización:** [24 — Cierre de auditoría V9.9](24-cierre-auditoria-y-prioridades.md). 238 pruebas ejecutables verdes, 3 TODO y 12 incidencias registradas (#2–#13), incluida una regla genuinamente ambigua (#4). A5-02 queda pendiente y no bloquea una **rama aislada** de correcciones por autorización expresa del creador.

**B1 (clasificación):** defectos de expectativa inequívoca #11, #2 y #3 pueden corregirse sin crear reglas nuevas. #4 y #6 precisan acordar comportamiento. El resto conserva clasificación y orden sugerido en el documento 24.

### Estabilización C1–C3 — completada en rama aislada y PR en borrador

En `fix/estabilizacion-v9-9` fueron corregidos **[#11](https://github.com/LeviEdition/invierno-en-la-colonia/issues/11)** (victoria IA al alcanzar muestras), **[#2](https://github.com/LeviEdition/invierno-en-la-colonia/issues/2)** (cartas de recursos y consumo de encrucijadas) y **[#3](https://github.com/LeviEdition/invierno-en-la-colonia/issues/3)** (dados J2). Cada cambio incluyó regresiones y la [suite CI](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40537729389) finalizó con **245 aprobadas, 0 fallidas y 3 TODO** (**248 declaradas**).

**Evidencia:** [registro C1–C4](25-registro-estabilizacion.md) y [PR #14 en borrador](https://github.com/LeviEdition/invierno-en-la-colonia/pull/14). **No fusionar ni sustituir `main` sin revisión**. Los defectos #4, #6 y #7 requieren decisiones y no se alteraron.

### C4 — Foco de diálogos (#12): implementado y verificado

Se enfoca el diálogo de inicio/pase, se confina Tab/Shift+Tab, se hace inerte el tablero durante el pase y se devuelve el foco al contenido al cerrar. **Cinco regresiones nuevas**, suite 250/0/3 TODO; Chromium verificó Tab, Shift+Tab y Enter en 1365×768, 393×852 y 320×640. [Registro](25-registro-estabilizacion.md). No se afirma validación con TalkBack o Android físico.

### C5 — Guardias de transición de turno (#8 y #10): R2 corregido en el seguimiento

**Estado confirmado al comenzar:** rama y referencia Git del PR #14 en `5b3a663`, C4 cerrada; `main` en `d9068f4`. La consulta del PR mediante API devolvió `Forbidden`: no se confirmó en vivo su estado ni sus checks.

**Precondición → acción → esperado → evidencia:** pase (incluido inicio) o aviso de fallecimiento activo → llamar `finishTurn()` o el atajo del menú → no cambiar partida, ronda, selección ni diálogo → tres regresiones locales fallaron antes del arreglo. Se reemplazaron las dos caracterizaciones del defecto por expectativas correctas y se añadieron inicio y fallecimiento en IA (cuatro casos C5). Tras confirmar, una nueva orden sí avanza; no se difiere una orden bloqueada.

**Corrección mínima:** añadir `passScreenActive` y `deathDirector.active` a la guardia inicial de `finishTurn()`, sin cambiar reglas ni el gestor de foco. **Validación local:** 45/45 pruebas en los dos archivos afectados; `npm test`: **252 aprobadas, 0 fallidas y 3 TODO** (255 declaradas). Chromium sobre la rama real verificó bloqueo durante fallecimiento en local/IA, Continuar y avance posterior; en local también llamadas repetidas durante pase, confirmación y llegada a ronda 2. Sin errores JS. Escenarios dirigidos, no partida completa ni Android físico.

Cambios entregados en el PR #14 para revisión, sin fusionar ni modificar `main`. CI remoto de C5/C6 confirmado en la entrega registrada arriba; los resultados de implementación anteriores son históricos. Detalles en [registro C5](25-registro-estabilizacion.md#c5--8-y-10-guardias-de-fin-de-turno).

### C6 — Acciones durante curación pendiente (#9): R1 corregido en el seguimiento

**Autorización:** el usuario indica «continuemos» después de confirmar C6 como siguiente tarea. Se conservaron los cambios locales de C5; `main` y los remotos no se modificaron.

**Precondición → acción → esperado → observado:** selección de paciente activa → consumir/equipar/aportar desde mano o equipo/iniciar transferencia mediante llamadas internas → conservar estado hasta curar o cancelar → 15 regresiones fallaron antes del arreglo, cinco por cada contexto (J1, J2, humano contra IA).

**Solución mínima:** `playable()` exige también ausencia de `pendingHeal`. `chooseHeal()` conserva la comprobación de `controls.interactive` para poder resolver la elección sin habilitar las acciones normales. Elegir paciente y cancelar mantienen sus reglas y liberan el bloqueo.

**Evidencia:** 21 casos C6 (15 de bloqueo y 6 de recuperación) reemplazan una caracterización del fallo. Suite completa `npm test`: **272 aprobadas, 0 fallidas, 0 canceladas, 0 omitidas y 3 TODO previos** (275 declaradas). Archivo de modales: 42/42 aprobadas. Chromium sobre el HTML real comprobó seis recorridos dirigidos: curar/cancelar en J1, J2 y humano contra IA, rechazo de consumo durante la elección y consumo habilitado después; sin errores JS. No valida partida completa, Android físico ni TalkBack.

Tablero, registro y matriz actualizados. Al terminar la implementación, los cambios aún estaban sin commit ni subida; la entrega posterior se registra arriba. CI remoto C6 confirmado en la entrega registrada arriba. No se cierra automáticamente #9 ni se fusiona. [Registro](25-registro-estabilizacion.md#c6--9-acciones-durante-curación-pendiente).

### Revisión final C5/C6 — realizada con hallazgos, 27/10/2026

**Alcance:** `5b3a663..247f819`, dos revisiones independientes de solo lectura y comprobación de reproducciones en Node/Chromium. [Informe 26 con precondiciones, acciones, esperado/observado y límites](26-revision-final-c5-c6.md).

- **R1, regresión C6/P2:** llamada interna `search(); special(); chooseLoot(0)` crea botín y curación simultáneos; el nuevo `playable()` impide resolver el botín y el modal no ofrece curar/cancelar. Comparado antes/después y reproducido en J1, J2 y humano contra IA. Impide recomendar integrar C6 sin corrección.
- **R2, residual C5/P2:** `kill(Leo); finishTurn()` en la misma pila avanza antes de la microtarea que abre la muerte. Preexistente; el bloqueo con diálogo ya visible sí funciona. No se afirma una explotación mediante clic normal.

**Resultados:** 65/65 pruebas relevantes aprobadas; CI de `247f819` [aprobado](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40554797945). Los ocho experimentos de Chromium confirmaron los casos, sin errores JS; no cuentan como ocho pruebas funcionales aprobadas. Las pruebas existentes no cubren estas combinaciones. No hubo modificaciones de código ni nuevas regresiones incorporadas a la suite en esta revisión: se entrega diagnóstico, no una corrección. PR #14 sigue en borrador, sin aprobación formal ni fusión; `main` intacta.

### C6-R1 — Bloqueo botín/curación: corregido y revisado, 27/10/2026

[Informe 27](27-correccion-c6-r1.md), código/pruebas [a5043fa](https://github.com/LeviEdition/invierno-en-la-colonia/commit/a5043fadbaa686ed9d5c4cdc8c43ab90806baa52). Se impide iniciar la curación médica/enfermera mientras exista `pendingLoot`, sin relajar permisos para resolver botín ni cambiar otras habilidades. Seis regresiones fallaron antes y pasan después; 48/48 pruebas del archivo de modales. `npm test`: **281 declaradas, 278 aprobadas, 0 fallidas/canceladas/omitidas y 3 TODO previos**.

Chromium completó 12 recorridos en 1365×768 y 393×852: J1/J2/humano contra IA, curar/cancelar, ruido/elección única y recuperación de búsqueda. Sin errores JS. Solo la orden tardía de habilidad se reproduce por llamada interna; las elecciones se verifican con botones reales. Una revisión independiente no encontró defectos en el ajuste. No se afirma Android físico/táctil ni todas las combinaciones de decisiones.

**CI remoto confirmado:** [GitHub Actions sobre `a5043fa`](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40556617672), `completed/success`; logs: **281 declaradas, 278 aprobadas, 0 fallidas/canceladas/omitidas y 3 TODO**.

Tablero, registro, matriz e informes 26/27 actualizados; se conserva el hallazgo original como histórico. Sin fusión, cierre de issues ni aprobación formal del PR. `main` intacta. En C6-R1 no se modificó R2 de C5; su corrección posterior se registra abajo.

### C5-R2 — Cola de fallecimiento: corregida y revisada, 27/10/2026

[Informe 28](28-correccion-c5-r2.md), código/pruebas [c19916f](https://github.com/LeviEdition/invierno-en-la-colonia/commit/c19916f609498a0e058ef19b257b0f134e0c8aa5). La guardia de `finishTurn()` comprueba también muertes en cola, antes de que su microtarea abra el aviso. No cambia el gestor de fallecimientos ni las esperas de una transición ya iniciada.

Seis regresiones fallaron antes y pasan después, con microtareas reales, J1/J2/humano contra IA, uno/dos avisos, rechazo sin mutar estado y recuperación después de confirmar todos. Un séptimo test preserva una colonia real que espera su muerte y termina solo una vez. Archivo: 55/55; `npm test`: **285 aprobadas, 0 fallidas/canceladas/omitidas y 3 TODO** (288 declaradas). Chromium: 12 recorridos en 1365×768 y 393×852, sin errores JS; confirmación/reintento mediante botones reales tras reproducir internamente la ventana. Revisión independiente sin defectos. No se afirma Android físico ni clic normal como origen del fallo.

**CI remoto confirmado:** [GitHub Actions de `c19916f`](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40557908505), `completed/success`; logs: **288 declaradas, 285 aprobadas, 0 fallidas/canceladas/omitidas y 3 TODO previos**.

Tablero, registro, matriz e informes 26/27/28 actualizados; C6-R1 conserva sus pruebas. PR #14 en borrador, sin aprobación formal ni fusión; `main` intacta. No se implementó #5.

### Definición de prioridad IA #5 — propuesta revisada, decisión pendiente

**27/10/2026:** se revisaron catálogo, crisis, secuencia del turno IA, pruebas existentes e issue#5, con revisión independiente de solo lectura. [Propuesta y escenarios en informe29](29-propuesta-prioridad-ia-herramientas.md). Un aporte insuficiente no reduce la penalización; la IA puede encontrar más herramientas durante las acciones y su bloque actual no reevalúa al final.

**Recomendación todavía no aprobada:** para crisis de herramientas, usar equipo durante las acciones y, antes de colonia, aportar exactamente lo faltante solo si mano+equipo propio pueden completar. Priorizar mano antes de equipo, permitiendo gastar la última herramienta equipada si hace falta. Si no alcanza o ya se cumplió, conservar; no buscar el bonus extra. Mantener otros tipos de recurso y reglas sin cambios.

Se presentó el costo (perder equipo valioso para evitar una penalización) y la alternativa de proteger siempre el equipo. Se solicitó decisión al creador, sin suponerla por silencio. No se implementó #5 ni se ejecutaron nuevas pruebas; no hay nueva cobertura funcional. Solo informe29, tablero y registro modificados, con `git diff --check`. Los checks del commit documental no validan una política que aún no existe en código.

### Siguiente tarea única — Decidir prioridad IA #5

Recibir y registrar la decisión del creador sobre la propuesta. Implementación y regresiones quedan para el bloque posterior a una política aprobada; no tocar #4/#6 ni fusionar.

### Continuidad verificada y segunda revisión de política #5 — 27/10/2026

**Punto inicial remoto comprobado:** `main=d9068f4` y blob original V9.9 `4ebaedad13d63c7a6762c524a52c0dd9695687b1`; `refactor/arquitectura=0933c70`; `fix/estabilizacion-v9-9=e7d0a48` (sin avances frente al SHA de referencia). PR #1 y #14 abiertos, en borrador; #14 base `refactor/arquitectura`. #5 sigue abierto. [Actions 40559396788](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40559396788) confirma en logs checkout de `e7d0a48`, **288 declaradas/285 aprobadas/0 fallidas/3 TODO**. La ejecución no valida el arreglo de #5, que aún no existe.

**Tarea C/B activa y única:** decidir prioridad IA de herramientas/crisis #5. Relectura de flujo IA, búsquedas, donaciones y catálogo confirmó además que `stashLoot()` puede equipar inmediatamente las herramientas encontradas. Crítica: donar la última herramienta equipada para evitar una penalización menor puede empeorar rondas futuras; políticas de preservar equipo o valorar severidad implican sacrificios distintos. [Informe29](29-propuesta-prioridad-ia-herramientas.md) y [registro25](25-registro-estabilizacion.md) documentan alternativas, recomendación acotada y pruebas/límites.

**Decisión pendiente del creador, ninguna aprobación implícita:** se recomienda provisoriamente donar al final solo si se completa la crisis, usando primero mano y luego equipo propio vivo, sin bonificación extra, con desempate determinista documentado; no estimar valor táctico durante C. No se modificaron mecánicas, tests ni `main`, ni se fusionaron PRs o cerraron issues. Revisión estática, **sin nueva ejecución funcional/local, Chromium ni Android/TalkBack**. Los commits documentales posteriores deben verificarse por su propio SHA y checks.

**Siguiente tarea única (sin empezar aquí):** recibir y registrar la decisión explícita del creador sobre la política #5, antes de cualquier implementación.

### C7/#5 — Política A aprobada, implementada y probada (27/10/2026)

El creador aprobó completar crisis de herramientas siempre que los aportes humanos anteriores más la mano y equipo de la IA lo permitan. La IA usa herramientas durante su turno, realiza sus búsquedas normales y **después** decide si aportar. Prioriza mano propia y luego equipo propio de supervivientes vivos en orden determinista, solo lo necesario, sin bonificación extra. Cuando no alcanza, conserva el material: en humano + IA no hay otro turno humano antes de colonia. Esto no cambia aportes parciales humanos ni modo local.

**Evidencia C7:** [informe30](30-correccion-c7-ia-herramientas.md), [código 4166716](https://github.com/LeviEdition/invierno-en-la-colonia/commit/416671673c81c4aa88d91d06209a53855efb69c8), diez regresiones nuevas, [CI 40571819429](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40571819429): **297 declaradas, 295 aprobadas, 0 fallidas, 2 TODO** (#4 y #6). No se modifica comida, medicina, combustible, decisiones de botín ni selección de lugares de búsqueda. Hallar una herramienta puede ayudar a salvar la crisis, pero la IA **no busca deliberadamente herramientas por encima de otros tipos de botín**. No se hicieron nuevos ensayos Chromium, Android físico, TalkBack ni análisis de balance. Main intacta y PR #14 en borrador; #5 permanece abierto.

**Siguiente tarea única:** revisión crítica de C7 antes de considerar integración o ampliar la estrategia de búsqueda.

### Revisión crítica posterior de C7 — 27/10/2026

Revisión de solo lectura de código, contrato de búsqueda, tests y estado CI. [Informe 31](31-revision-critica-c7.md): **la rutina de donación de herramientas satisface el alcance aprobado** (mano/equipo propio, colaboración con aportes humanos, evaluación final, aporte exacto), con 295/297 pruebas aprobadas y dos TODO en [CI sobre `9907cdb3`](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40572758503). No se ejecutaron pruebas dinámicas nuevas ni Chromium/Android/TalkBack, ni revisor externo.

**Reserva H1/P2 (selección de botín, código inspeccionado):** la IA puntúa muestra 10 y herramienta 3 incluso cuando tomar esa herramienta completaría una crisis posible (ejemplo: linterna equipada, botín muestra+palanca, crisis de herramientas 0/2). Se pierde esa oportunidad. **H2 (límite anterior, no regresión):** comida, medicina y combustible todavía se donan antes de las búsquedas y no se reconsideran después. Esto estaba fuera del alcance de #5. Ambos escenarios requieren pruebas dirigidas antes de afirmar reproducción integral.

**Estado:** revisión concluida con reserva, C7 implementada/CI verde pero #5 abierto; no modificar regla de botín ni generalizar otras crisis sin una decisión. `main` intacta, PR #14 sigue en borrador.

**Tarea única siguiente:** aprobar o ajustar una política mínima C7-R1 para elegir herramientas reveladas **cuando esa elección permitiría completar la crisis**, preservando la victoria inmediata por objetivo. Después diseñar regresiones y parche solo si queda expresamente autorizado. No iniciar aún #4/#6 ni etapa D.

### C7-R1 — Regla de selección de botín aprobada y corregida (27/10/2026)

**Aprobación expresa del creador:** elegir la herramienta revelada **solo si adquirirla permitiría completar** una crisis de herramientas con el inventario/equipo propio vivo y los aportes humanos previos. Una muestra que otorgue **victoria inmediata** tiene prioridad mayor, incluyendo el doble avance de investigador. No iniciar cambios de ruta de búsqueda ni reordenar aportes de otros tipos.

**Evidencia reproducida antes:** ocho regresiones añadidas en [`5debdbd`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/5debdbd49289b1e464e9df7a8384b6a41f95c0fc); [CI rojo 40575929242](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40575929242) documentó 3 fallos de la selección anterior. **Corrección:** [`f1e75ed`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/f1e75edc28a317a3d6745079d19e07558987a10a), puntajes condicionados dentro de `beginSearch()`, sin cambiar `botContributeTools()` ni otras clases de crisis.

**CI verde del ejecutable:** [Actions 40576075140](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40576075140): **305 declaradas, 303 aprobadas, 0 fallidas y 2 TODO** (#4/#6). [Informe32](32-correccion-c7-r1-prioridad-botin.md) registra autorización, pruebas y límites. **No se ejecutaron** pruebas nuevas de navegador, Android, TalkBack ni partida natural. PR #14 permanece en borrador, #5 abierto y `main` intacta.

**Tarea única siguiente:** revisión crítica posterior del parche C7-R1; todavía no autoriza fusión/cierre del issue ni otro defecto de estabilización.

### Revisión crítica posterior C7-R1 — 27/10/2026

[Informe33](33-revision-critica-c7-r1.md): revisión separada de la implementación [informe32](32-correccion-c7-r1-prioridad-botin.md), contrastando regla de puntuación, `gainSample`, inventarios, búsqueda, turnos, crisis y las ocho regresiones. **Dictamen:** no se encontraron fallos nuevos en el alcance del parche. H1 del informe31 (preferir muestra no ganadora sobre herramienta que permite completar crisis) queda resuelto por el parche C7-R1 y pruebas; victoria inmediata conserva prioridad, incluyendo investigador. No se cambiaron motor ni tests, solo documentos.

**Evidencia verificada:** [CI 40576507329](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40576507329) del commit auditado `46564a5`: **305 tests, 303 aprobadas, 0 fallidas y 2 TODO**. `main` intacta; PR #14 borrador; #5 aún abierto. **Limitación significativa:** la suite de IA suprime encrucijadas, esperas/modales y animaciones; no hay smoke test nuevo en navegador ni Android/TalkBack. No afirmar que la UI está aceptada.

**Única tarea siguiente:** preparar y realizar validación manual acotada en **navegador real** del flujo completo C7/C7-R1, con encrucijadas activas, antes de decidir cierre/promoción de #5. Registrar escenarios y resultados; no iniciar otros issues sin cambio explícito de prioridad.

### Smoke test C7/C7-R1 en Chromium real — 27/10/2026

[Informe34](34-validacion-navegador-c7-r1.md): se obtuvo la versión exacta del HTML de esta rama, SHA Git blob `7ae72fc88381e5109b5f64929f6b017a2d5d5dc6` verificado contra GitHub, y se ejecutó en Chromium con Playwright. **Cuatro escenarios aprobados:** completar crisis 1/2 humano con palanca IA equipada y modal de ronda; elegir herramienta frente a muestra no ganadora y superar crisis con modal de búsqueda; priorizar victoria inmediata por muestra; victoria por muestra duplicada de investigador en viewport táctil 390 px. Encrucijadas/acciones confirmadas mediante interfaz real; 0 errores JS detectados. `round`, inventario, mazo y log verificados.

**Evidencia y límites:** ensayos con estado reproducible preparado por Playwright, temporizadores de animación de 1750 ms acortados, sin Android físico/TalkBack ni partidas aleatorias completas; `file://` bloqueado en entorno, documento cargado mediante `page.set_content()`. **No** se alteraron HTML ni tests del repositorio. El CI anterior de `5eb8302` era verde: **305 declaradas, 303 aprobadas, 0 fallidas, 2 TODO**, [run 40577893140](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40577893140). El número no aumenta por los cuatro recorridos externos. PR14 borrador, `main` intacta, #5 abierto.

**Tarea única siguiente:** evaluar aceptación y cierre **administrativo** de #5, determinando si la prueba en Android físico es requisito previo para promoción. No cerrar ni fusionar sin aprobación expresa; no empezar otros issues.

### Decisión de criterio de aceptación #5 — 27/10/2026

**Criterio del creador:** **Android físico no será una prueba obligatoria para cerrar C7/C7-R1 (#5)**. Los cuatro smoke tests controlados de Chromium, la emulación táctil y las 303 pruebas aprobadas con 2 TODO previos son evidencia suficiente para proponer aceptación de esta corrección; no equivalen a certificar Android, TalkBack, toda la experiencia móvil o la versión completa. La validación en dispositivos reales se mantiene como prueba complementaria futura, no bloqueo de este issue. Ver [informe34](34-validacion-navegador-c7-r1.md#decisión-de-aceptación-sobre-android-físico).

**Tarea siguiente única:** solicitar autorización explícita para **aceptar/cerrar administrativamente el issue #5**, sin fusionar PR #14 ni alterar `main`. No cerrar automáticamente por el solo cambio del criterio.

### C7/C7-R1 — Issue #5 cerrado por decisión del creador (27/10/2026)

**Autorización y cierre:** ante la propuesta expresa de «aceptar formalmente C7 y cerrar #5 sin fusionar PR #14», el creador respondió «Continúa». Se interpretó como consentimiento para el **cierre administrativo de [#5](https://github.com/LeviEdition/invierno-en-la-colonia/issues/5)**, **no** como permiso de integración, publicación ni de abordar otro problema. Se agregó al issue el [comentario técnico 6453435186](https://github.com/LeviEdition/invierno-en-la-colonia/issues/5#issuecomment-6453435186) con política aprobada, implementación C7/C7-R1, regresiones, CI, Chromium y límites. El issue se verificó cerrado con `state_reason=completed`.

**Criterios cumplidos:** política A (contribución de herramientas tras búsquedas, completas y deterministas), prioridad condicionada de botín, victoria inmediata, suite verde [40582012525](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40582012525) (**305 declaradas / 303 aprobadas / 0 fallidas / 2 TODO**), revisión crítica e [informe34](34-validacion-navegador-c7-r1.md) (cuatro smoke tests Chromium controlados, encrucijadas reales, 0 errores JS detectados). Android físico se considera opcional para este issue; no se afirma validación Android/TalkBack ni balance exhaustivo.

**Separación esencial:** «issue cerrado» significa que se aceptó el **seguimiento funcional**, no que el parche haya entrado en la versión estable. Todos los cambios ejecutables permanecen en `fix/estabilizacion-v9-9`, [PR #14](https://github.com/LeviEdition/invierno-en-la-colonia/pull/14) **abierto y draft** hacia `refactor/arquitectura`; **`main` sigue en `d9068f4`**. La tarea se registró en este tablero y en el [registro25](25-registro-estabilizacion.md), sin iniciar otro issue.

**Único paso siguiente recomendado, aún sin aprobación para trabajarlo:** **#4 — decidir la política de transferencia de objetos entre supervivientes humanos/IA**. Es un `test.todo` real y exige distinguir cesión cooperativa entre grupos de traspasos internos antes de escribir código. Comparar alternativas y su efecto sobre partidas cooperativas; no implementar ni cerrar #4 hasta que el creador elija una regla. #6 (momento de elección del líder de J2) sigue pendiente; #7 y #13 permanecen fuera del alcance de este cierre.

### Issue #4 — Política de transferencia por modo acordada (27/10/2026)

El creador decidió: **«por ahora, contra la IA sin tradeos; entre J1 y J2 sí»**. Se distingue transferencia *entre grupos controladores* de transferencia *interna entre supervivientes propios*:
- **Contra la IA:** J1 puede reorganizar equipo entre los supervivientes que controla, pero **no puede transferirlo a supervivientes IA**, ni recibir equipo de ellos por la función manual de transferencia. El comportamiento automático de IA no se modifica.
- **Modo local J1 + J2:** transferencias de un objeto equipado **bidireccionales** J1↔J2, más los traspasos internos del grupo, autorizadas desde el **turno del dueño que entrega**. Sin trueque recíproco obligatorio ni aceptar un objeto durante el pase de teléfono.
- Restricciones conservadas: remitente y receptor vivos, misma localidad, remitente propio del turno interactivo, receptor sin equipamiento de categoría duplicada, objeto aún disponible, protección frente a acciones durante el pase/modales y confirmación. Los filtros deben aplicarse en **`startTransfer()` y `chooseTransfer()`**. Texto UI adecuado para modo local.

**Registro de decisión:** [comentario del issue #4](https://github.com/LeviEdition/invierno-en-la-colonia/issues/4#issuecomment-6453681346). **Alcance de esta intervención:** solo registrar reglas; no se cambiaron motor ni tests, no se ejecutaron nuevas regresiones, #4 permanece abierto, dos TODO (#4 y #6) sin resolver, PR14 sigue borrador y `main` intacta. Interpretación declarada, corregible antes de código: «sin tradeos con IA» **no** bloquea mover equipo dentro del grupo del J1.

**Siguiente tarea única propuesta (pendiente de autorización):** C8/#4, preparar regresiones rojo→verde para estos modos y corregir guardas en `startTransfer()`/`chooseTransfer()`, seguida de pruebas Chromium y revisión crítica. No implementar todavía ni saltar al issue #6.

### C8/#4 — Corrección aplicada y verificada, revisión crítica posterior pendiente (27/10/2026)

**Autorización:** el creador aprobó «vamos con la corrección de C8» tras definir previamente que **no hay tradeos con IA pero sí cesión J1↔J2 en modo local**, conservando transferencias internas del propio grupo humano. [Informe35](35-c8-transferencias-por-modo.md) contiene precondiciones, código, 14 pruebas y resultados navegador.

**Red primero:** [commit pruebas `5b4446f`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/5b4446ff8d6b0dad1b918ada94c0835fbed802a9), convierte el TODO #4 en 14 casos activos. [Actions rojo 40585772252](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40585772252) mostró **318 declaradas, 309 aprobadas, 8 fallidas y 1 TODO** (#6). Los fallos exponen accesos cruzados humano→IA, confirmaciones de turno/pase incorrecto, duplicación por cambio de equipo e ítem sustituido mientras está pendiente.

**Verde después:** [commit `37d86d6`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/37d86d6bdb4707ff7ebf95a8274bd5747a08b989): filtro único `canReceiveTransfer` por modo + validaciones repetidas al confirmar (turno, propiedad, receptor, misma localidad, categoría, identidad del objeto), sin añadir IA negociadora. [Actions verde 40585960363](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40585960363): **318 declaradas, 317 aprobadas, 0 fallidas y 1 TODO #6**.

**Chromium:** se verificó identidad de archivo del motor C8 Git blob **`32eb545cbdbca047ded8bc81d64b8e438e096a49`** con GitHub. **Tres recorridos de botones reales aprobados:** humano→otro superviviente propio, sin destinatarios IA; local J1→J2; local J2→J1 luego de pantalla de pase confirmada, con viewport táctil 393 × 852 px. **Sin errores JavaScript**. Pruebas con equipo preparado determinísticamente, sin Android físico ni navegación `file://`. Detalles y reservas: [35](35-c8-transferencias-por-modo.md).

**No se modificó** `main`, no se fusionó PR #14 (draft/base `refactor/arquitectura`), **#4 sigue abierto**; #6 sigue como único TODO. Se recomienda revisión crítica posterior **separada** antes de aceptar/cerrar el issue.

**Única tarea siguiente:** revisión crítica posterior C8/#4 (sin empezar otro issue). No cerrar #4 ni fusionar sin autorización.

### Revisión crítica posterior C8/#4 — 27/10/2026

[Informe36](36-revision-critica-c8.md): auditoría separada de C8, filtros de transferencia y doble comprobación al confirmar, `pendingTransfer.itemRef`, permisos de modo local y humano+IA, control del turno, modales y los 14 casos de regresión. **Dictamen:** sin defectos nuevos confirmados ni cambios adicionales requeridos para esta corrección. Se agregaron **seis controles nuevos de Chromium real** con viewport táctil emulado, todos aprobados sin excepciones JS: destino IA forzado; receptor con arma duplicada y cancelación; ítem de origen sustituido; donante muerto; pantalla de pase activa; categorías distintas (arma + herramienta). Total acumulado de C8: **3 recorridos anteriores + 6 controles nuevos = 9 escenarios** acotados, no partidas completas ni casos agregados a CI.

**Evidencia CI previa de motor:** [40586682191](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40586682191), **318 declaradas, 317 aprobadas, 0 fallidas, 1 TODO (#6)**. No se modificaron HTML o tests en esta revisión. **Límite:** hay otras ventanas/eventos pendientes que `playable()` no modela globalmente; no hay defecto C8 confirmado por la UI y no se amplía alcance sin autorización. Sin Android físico/TalkBack; `main` intacta y PR14 draft. **#4 continúa abierto**.

**Próximo paso único sujeto a aprobación:** aceptación funcional y cierre administrativo del issue #4, **sin** fusionar PR14 ni pasar automáticamente a #6.

### Corrección UX — Alerta del segundo movimiento con combustible (27/10/2026)

El creador preguntó específicamente por los **controles visibles que permiten intentar una acción ilegal**, distinguiéndolos de guardas internas. Auditoría acotada del caso reproducible: pulsar **«Usar»** en carta de combustible después de que el superviviente ya se movió rechazaba la acción **sin mensaje**, aunque `doMove()` sí avisaba. Ante su indicación, se agregó **exactamente el mismo aviso** `⚠ El superviviente ya se movió durante este turno.` en el flujo `ItemEngine.moveWithFuel()` (solo intento de jugador activo), sin gastar carta ni cambiar la regla.

**Pruebas antes:** [CI rojo 40589116325](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40589116325), **320 declaradas, 317 aprobadas, 2 fallidas nuevas, 1 TODO** (#6). [Commit tests `78c55af`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/78c55af021b970427f7372860ab7a038621dbfeb).

**Parche y pruebas después:** [commit `63cb294`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/63cb2949f979631c97152f971f7a2dda171672ba), [CI verde 40589214682](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40589214682), **320 declaradas, 319 aprobadas, 0 fallidas, 1 TODO**. Tres rutas de Chromium con botones reales —rechazo con aviso en J1, rechazo con aviso en J2 local/táctil emulado 393×852, éxito sin modificar para combustible válido—, sin JS errors; se constató que **el toast aparece visualmente**, con rol status/aria-live polite. HTML exacto Git blob `4748627825e9876809ec482cb7c10431e6c07cf9`. [Informe37](37-feedback-movimiento-con-combustible.md) especifica evidencia/límites.

**Reserva y siguiente prioridad a decidir:** esto **no certifica todos los avisos** del juego; solo se corrigió el ejemplo aprobado. Se propone auditoría priorizada **solo de acciones realmente pulsables desde interfaz** en todo C1–C8, antes de nuevos ajustes. No confundir con rechazo de llamadas artificiales ni deshabilitados por diseño. #4 sigue abierto y aceptable según revisión36, pero no fue cerrado por este cambio.

### C8/#4 cerrado; C9/#6 pasa a definición de regla — 27/10/2026

**Autorización del creador:** «sí, hagamos esto que dijiste, sigamos con la ruta», aceptando la propuesta de **cerrar administrativamente #4** y abordar después el issue #6. Se registró el [comentario de aceptación](https://github.com/LeviEdition/invierno-en-la-colonia/issues/4#issuecomment-6454516746) y GitHub confirmó [#4 cerrado/completed](https://github.com/LeviEdition/invierno-en-la-colonia/issues/4) (`2026-10-27T21:51:27Z`). El cierre significa aceptación de C8, **no integración**: PR14 sigue abierto/draft a `refactor/arquitectura`, `main=d9068f4aa8d3a10bbbf1e0a8a2527744cc6952cb` no se modificó.

**Siguiente tarea en curso, solo análisis: C9/#6 (liderazgo inicial J2).** [Issue y opciones documentadas](https://github.com/LeviEdition/invierno-en-la-colonia/issues/6#issuecomment-6454546559). Código verificado: `canPickStartingLeader()` distingue flags de J1 y J2, pero `consume()`, `doMove()` y `playItem()` solo marcan `game.leaderChosen`. **Observado:** J1 pierde la elección de líder inicial tras esas acciones; J2 local puede seguir cambiándolo. `tests/finales-lideres.test.mjs` conserva el único TODO (#6). Mensaje «Durante la primera ronda...» en modal no explica el bloqueo al actuar. [Última CI previa](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40589676353): **320 declaradas, 319 aprobadas, 0 fallidas, 1 TODO**.

**Alternativas pendientes de aprobación:**
- **A recomendada (cambio mínimo):** la primera acción que confirma el líder cierra esa selección en **J1 y J2**, con flags según turno y texto de UI coherente. Mantiene lo que ya hace J1. Precisar qué acciones cuentan (gastar dado, mover, usar carta; revisar habilidad/equipamiento para no dejar excepciones inadvertidas).
- **B:** ambos pueden decidir líder durante toda la ronda 1, aunque hayan actuado. Implica cambiar también el comportamiento actual de J1 y probarlo.

**Alcance actual:** solo comentario #6 y documentación. **No** se implementaron reglas nuevas, ni se alteró `main`, ni fusionó PR, ni cerró #6. Auditoría general de avisos se estaciona como pulido al cerrar Etapa C, no tarea activa.

**Siguiente única decisión:** que el creador apruebe A o B para preparar regresiones rojo→verde de C9/#6.

### C9 / issue #6 — Política A implementada y comprobada (27/10/2026)

El creador **aprobó explícitamente política A**: «J1 y J2 deben confirmar su líder inicial antes de realizar las acciones que bloquean la elección». Se conservó la regla previa de J1: bloquean únicamente **gastar un dado con éxito, moverse válidamente o usar con éxito carta de inventario** durante la ronda 1. Una acción rechazada no confirma el líder; elecciones de sucesor por fallecimiento no se modifican. Los otros actos previamente no bloqueantes (habilidad gratis, equipo desde ficha, contribución a crisis) no se incluyeron porque no forman parte de la regla J1 previa. [Informe38](38-c9-lider-inicial-j2.md).

**Pruebas primero:** se sustituyó el único `test.todo` #6 por **12 regresiones C9**: J1/J2 con dado, movimiento, carta, acción fallida, selección explícita, ronda 2 y texto de interfaz. [CI rojo 40591148076](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40591148076): **331 declaradas, 327 aprobadas, 4 fallidas, 0 TODO**. Fallaron tres caminos de J2 y un texto UI, confirmando defectos reales.

**Corrección:** [commit `38e7ac8`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/38e7ac87832e4ca02dbf277dcc1a8acb56ce2849). Nueva función `confirmStartingLeader()` cambia solo flag del controlador (`leaderChosen` J1 / `localLeaderChosen` J2 local), reutilizada en `consume`, `doMove` y `playItem` después del éxito. Menú «Grupo y líderes» explica «antes de gastar un dado, moverte o usar una carta». [CI verde 40591238120](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40591238120): **331 declaradas / 331 aprobadas / 0 fallidas / 0 TODO**.

**Chromium real:** cinco escenarios con botones de menú, acción y pase de J1→J2, incluidos dos en viewport móvil táctil simulado 393×852: J1 gasto dado, J2 gasto dado tras pase, intento J2 de movimiento inválido (elección permanece), J2 usa ración (bloquea elección), J2 elige líder antes de actuar (se confirma). **Cinco aprobados, sin errores JS**. Copia local del HTML verificada por Git blob **`b5b9f2020c5abb73fd95e0f7441db088bb746d16`**, igual al de GitHub. No partidas completas ni Android físico.

**Estado:** cambio implementado, issue #6 **abierto**; pendiente revisión crítica posterior independiente y aceptación del creador. PR #14 abierto/draft hacia `refactor/arquitectura`; `main` intacta.

**Siguiente único paso recomendado:** revisión crítica posterior C9/#6, sin cerrar el issue ni fusionar el PR automáticamente.

### Revisión crítica C9/#6 y corrección C9-R1 — 27/10/2026

**Decisión final del creador:** conservar la **elección manual del líder humano como en *Dead of Winter***, sin forzar nombramiento automático de mayor influencia. Se mantiene política A previamente aprobada: durante ronda 1 las acciones válidas de dado, movimiento y carta cierran la elección inicial **de cada jugador por separado**; sucesión tras muerte sigue siendo manual para humanos, automática para IA.

**Hallazgo en revisión crítica:** si el líder **de J2 muere mientras actúa J1**, el modal de sucesión se muestra a **J1** y J1 puede elegir al sucesor del otro. Se **reprodujo en Chromium real**, incluyendo clic en «Sol» durante `game.turn='human'`. Se trata de P2 de propiedad de decisión, no del cálculo de influencia. [Informe39](39-revision-critica-c9-r1.md).

**Primero las regresiones:** [tests `ed817b5`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/ed817b59825268c54aa1f183c783f19af3189c83), **5 casos** en `tests/finales-lideres.test.mjs`. [CI rojo 40593244756](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40593244756): **336 declaradas, 331 aprobadas, 5 fallidas, 0 TODO**. Se comprobó que J1 podía elegir por J2, que su turno quedaba bloqueado y que la elección propia podía verse interferida.

**Parche C9-R1:** [`e84db6a`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/e84db6ae088f314e232e377c15cda37683cce19b), añade `leaderChoiceReady()` y separa la sucesión vigente **del turno de su propietario** en `chooseLeader`, guardas de acciones, pintado/modal y `finishTurn`/`confirmPass`. Si muere líder J2 durante turno J1, **J1 puede seguir y finalizar**, se muestra **pantalla real de pase** y J2 elige su sucesor después de recibir control. **CI verde 40593438595**: **336 declaradas, 336 aprobadas, 0 fallidas, 0 TODO**.

**Chromium después de R1:** tres recorridos reales aprobados con blob exacto GitHub **`2682f96f0d451eb0083fd9eaa3762b266f8aab60`**: elección manual J2 tras pase J1→J2 en móvil 393×852, sucesión inmediata del dueño J1, IA sucesora automática. Cero excepciones JS detectadas. Incluida preparación determinista de muerte para reproducir el borde, no partidas completas ni Android físico. Total C9: **5 escenarios UI iniciales, 5 escenarios positivos adicionales de revisión y 3 positivos de R1**. Reserva pendiente para estabilización general: muertes simultáneas de dos líderes cuando existe solo un `pendingLeader` global.

**Estado:** #6 **permanece abierto** hasta que el creador lo acepte; PR14 sigue abierto/draft hacia `refactor/arquitectura`, `main` intacta. La auditoría de mensajes quedó estacionada y no se iniciaron #7/#13.

**Próximo paso único recomendado:** aprobación y cierre **administrativo** del issue #6, sin publicar ni fusionar la rama; luego elegir siguiente tarea de etapa C.

## 3. Etapas posteriores: una por vez

| Etapa | Propósito | Criterio para habilitar la siguiente |
| --- | --- | --- |
| **A — Auditar** | Caracterizar reglas, interfaces, turnos e integración | Matriz de cobertura actualizada, lista de pruebas manuales ejecutadas y defectos identificados; límites explícitos |
| **B — Definir reglas y priorizar defectos** | Resolver ambigüedades y clasificar fallos por gravedad | Comportamiento esperado escrito para cada corrección prioritaria; decidir qué se corrige ahora y qué se pospone |
| **C — Corregir y estabilizar** | Corregir defectos aprobados en cambios aislados con regresiones | Pruebas automáticas verdes + pruebas de humo manuales + estado jugable estable comprobado |
| **D — Refactorizar sin alterar comportamiento** | Separar estado, reglas, comandos, turnos, IA y vista en módulos | Equivalencia de comportamiento y pruebas preservadas; ningún cambio inadvertido de mecánicas |
| **E — Prototipo narrativo persistente** | Implementar una historia conectada que condicione recursos/objetivo y recuerde decisiones | Dos rutas jugables con resultados diferentes, consecuencias diferidas, pruebas y estados alternativos cuando mueren personajes |
| **F — Campañas y presentación** | Expandir campañas, personajes, epílogos, arte 2D y después juego online | Criterios y pruebas propios por subetapa, acordados al iniciar |

**Compuerta:** no dar por terminada A solo por tener muchas pruebas. Hay que demostrar cobertura en navegador real. No empezar a programar E mientras A siga abierta, salvo autorización explícita para cambiar la ruta.

## 4. Protocolo obligatorio para cada bloque

**Antes de trabajar:**
- Decir: etapa activa, ID de tarea, alcance y *qué no se va a tocar*.
- Revisar los archivos originales pertinentes, supuestos y pruebas ya existentes. Confirmar primero lo básico antes de cambiar configuración.
- Definir condiciones reproducibles de éxito y fracaso.

**Durante:**
- Una tarea a la vez y cambios pequeños.
- Documentar hallazgos con **precondición → acción → esperado → observado → prueba**.
- Si aparece una pregunta de reglas no acordada, detener solo esa decisión y consultarla; no corregirla inventando criterios.
- Toda idea interesante fuera de la etapa va al **estacionamiento**. No derivar hacia su implementación.
- Distinguir fallo confirmado, restricción técnica, propuesta creativa e hipótesis.

**Para cerrar:**
- Ejecutar pruebas del bloque y suite `npm test` si se modificaron pruebas/código.
- Comprobar resultado de GitHub Actions y SHA de V9.9 cuando haya commits.
- Actualizar este tablero tras cada revisión, incluso sin cambios de código; registrar acciones, decisiones, cambios, resultados y límites en la documentación pertinente. Actualizar la matriz cuando corresponda e incluir enlaces a commit/prueba/incidencia.
- Explicar en lenguaje claro **qué se verificó, qué NO se verificó y cuál es la única siguiente tarea**.
- No iniciar esa tarea siguiente en el mismo bloque de trabajo sin confirmación del usuario.

## 5. Registro de decisiones, defectos e ideas

**Decisiones aprobadas:** normas que el usuario confirmó. Registrar en la documentación de diseño respectiva; si afectan el comportamiento, requieren aceptación explícita antes de programarlas.

**Defectos:** GitHub Issues, con evidencia y severidad, separados de cambios de diseño. Un fallo de seguridad/privacidad o pérdida de datos puede ameritar prioridad especial; hay que informarlo.

**Ideas estacionadas (no etapa activa):**
- Narrativa central con decisiones grises, público +16 y consecuencias reales.
- Campañas con objetivos fijos, duración variable, historias secundarias y epílogos distintos.
- «Encontrar la cura»: investigación, científicos, secta antagonista y muestras disponibles mediante la trama.
- Modo cooperativo online en celulares diferentes; escenas isométricas y presentación visual.
- Arco piloto «Los que quedaron afuera», solo borrador y no canon.

Los detalles están en `docs/12`–`docs/17`. **No abrir nuevos frentes para ampliarlos durante la auditoría.**

## 6. Regla para desviaciones y cambio de prioridad

Si surge una idea fuera de la tarea activa:

> «Es una idea para la hoja de ruta, pero ahora estamos **definiendo la regla del issue #6**. La registro y seguimos la estabilización. ¿Querés cambiar explícitamente la prioridad?»

Solo cambiar la etapa activa con una decisión consciente; registrar motivo, riesgos, estado de la tarea interrumpida y cómo retomarla. No es necesario prohibir las conversaciones creativas: **conversar no equivale a cambiar la etapa ni a comenzar a programar**.

## 7. Ubicación de la información

- **Qué hacemos ahora:** este archivo `docs/18-tablero-operativo.md`.
- **Qué subsistemas faltan auditar:** `docs/04-matriz-auditoria-funcional.md`.
- **Por qué y cómo refactorizaremos después:** `docs/01-plan-refactorizacion.md`.
- **Norma de evaluación objetiva:** `docs/15-protocolo-revision-critica.md`.
- **Propuestas narrativas (estacionadas):** `docs/12`–`docs/17`.
- **Defectos/decisiones por resolver:** GitHub Issues.

**Próxima decisión única propuesta: aceptar y cerrar administrativamente #6 tras C9 y C9-R1 validadas (informe39). Manual de liderazgo humano preservado; PR14 sigue draft y `main` intacta. No iniciar #7 sin autorización.**
