# 35 — C8: corregir transferencias según modo de partida (issue #4)

**Fecha:** 27/10/2026 · **Etapa:** C, estabilización · **Rama:** `fix/estabilizacion-v9-9` · **PR:** [#14](https://github.com/LeviEdition/invierno-en-la-colonia/pull/14), abierto/draft, base `refactor/arquitectura`. **Estado:** C8 implementada y verificada en CI/Chromium; **issue #4 aún abierto y aceptación administrativa pendiente**. Sin fusión a `main`.

## Regla aprobada y alcance

El creador indicó expresamente: **cuando se juega contra IA, por ahora no habrá tradeos entre humano e IA; entre J1 y J2 locales, sí**. Se mantiene la posibilidad previa de pasar equipamiento entre supervivientes propios del humano, porque eso es reorganización interna y no requiere negociar con la IA.

| Modo / origen → receptor | Comportamiento esperado |
| --- | --- |
| Humano + IA: J1 → superviviente propio J1 | **Permitido**, restricciones habituales |
| Humano + IA: J1 → superviviente controlado por IA | **Rechazado** tanto al abrir como al confirmar |
| Humano + IA: IA → humano por transferencia manual | **No disponible**; IA no es turno humano interactivo |
| Local J1 + J2: J1 → J2 / J2 → J1 | **Permitido**, un solo objeto equipado, desde el turno del dueño |
| Local J1 + J2: traspasos dentro de cada grupo | **Permitidos** |

Se conservan requisitos: donante propio del turno activo, origen y destino vivos, misma localidad, categoría no repetida en receptor, objeto seleccionado **todavía idéntico** y sin interacción durante pantalla de pase o turno ajeno. No se agregó trueque bilateral, consentimiento diferido del receptor ni decisión de negociación de IA. No se alteró el motor de crisis ni inventarios de mano.

## Reproducción roja antes de modificar el juego

Se sustituyó el único `test.todo` del issue #4 (en `tests/combate-equipamiento.test.mjs`) por **14 casos ejecutables**, [commit `5b4446f`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/5b4446ff8d6b0dad1b918ada94c0835fbed802a9).

[CI rojo 40585772252](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40585772252): **318 declaradas, 309 aprobadas, 8 fallidas y 1 TODO** (#6). Fallaron (a) filtro de destinatarios en modo IA, (b) intento forzado humano→IA incluso con destinatarios manipulados, (c) confirmación durante pantalla de pase, (d) confirmación por turno equivocado, (e) cambio de modo durante modal, (f) equipamiento duplicado en receptor tras abrir, (g) sustitución del objeto de origen mientras se espera. La cesión local J1↔J2 ya funcionaba antes, y se preservó explícitamente con tests.

## Corrección acotada

[Commit `37d86d6`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/37d86d6bdb4707ff7ebf95a8274bd5747a08b989):

1. **`canReceiveTransfer(from,to,it)`** reúne requisitos del receptor: distinto personaje, vivo, misma localidad, ausencia de equipo de igual categoría, y **mismo grupo salvo `game.mode==='local'`**.
2. **`startTransfer()`** aplica ese filtro a los botones ofrecidos, y guarda en `pendingTransfer` la referencia exacta `itemRef` del equipo elegido para evitar transferir otro ítem si la ranura cambia.
3. **`chooseTransfer()`** revalida `playable()`, pertenencia actual del donante, identidad de objeto y receptor mediante el mismo predicado, **antes de quitar** el objeto al origen. Impide llamadas directas que intenten saltar los filtros.
4. Mensaje de «no hay destinatarios» distingue modo local (cualquier grupo) de humano+IA (grupo propio). No se modificaron contratos J1↔J2 ni se agregó interfaz nueva.

## Resultados de verificación verde

[GitHub Actions 40585960363](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40585960363), sobre commit `37d86d6`, completó **318 declaradas, 317 aprobadas, 0 fallidas, 0 omitidas/canceladas y 1 TODO** (#6). **Las 14 regresiones C8 pasaron** y la suite anterior no presenta nuevos fallos. El TODO #4 queda convertido en tests ejecutables; solo queda TODO #6.

**Chromium real + Playwright:** se generó una copia local del HTML exacto de la rama, partiendo del archivo C7-R1 (blob anterior `7ae72fc88381e5109b5f64929f6b017a2d5d5dc6`) y aplicando únicamente el bloque C8. Se verificó el **Git blob SHA `32eb545cbdbca047ded8bc81d64b8e438e096a49`**, igual al del archivo GitHub `invierno_colonia_v9_9.html` de la rama. La UI se cargó en Chromium con `page.set_content()` por restricciones de navegación `file://` del entorno. Tres recorridos controlados, pulsando botones reales del modal:

- **B1 — humano+IA:** se equipa pistola en Mara (J1), se abre ficha y botón «Transferir», aparecen **solo Leo e Iris** (supervivientes J1), no Ada/Bruno/Sol (IA). Elegir Leo traspasa la pistola una vez; no llega a IA; sin errores JS.
- **B2 — J1→J2 local:** se equipa pistola en Mara; el modal incluye supervivientes J1 y J2; elegir Ada transfiere pistola del grupo J1 a J2, sin dejar modal pendiente ni errores JS.
- **B3 — J2→J1 local en viewport móvil simulado 393 × 852:** J1 termina turno **desde botón de interfaz**, aparece pantalla de pase y se confirma **con «COMENZAR TURNO»**; J2 puede transferir su palanca de Ada a Mara mediante botones, sin alteración del turno, bloqueo, duplicación ni error JS. Se verificó `document.documentElement.scrollWidth=window.innerWidth=393` para este estado.

Estas **tres comprobaciones Chromium son adicionales a CI**. Prepararon determinísticamente el equipo a transferir y abrieron la ficha mediante función del juego; el menú de transferencia, botones destino y pantalla de pase de J1→J2 sí se utilizaron en la interfaz real. No son partidas completas ni ensayos en Android físico.

## Revisión y límites

La comprobación por lectura del parche y los catorce casos confirma que el filtro se aplica en ambas etapas y no muta inventario antes de validar. Se comprobó además que se mantiene el `test.todo` ajeno de #6 y que no hay cambios en crisis o botín. **Reservas:** falta revisión crítica posterior separada de C8, pruebas de accesibilidad específicas para selección de receptores y validación en Android físico si en otro momento se considera conveniente. La aplicación todavía es HTML monolítico; no se puede extrapolar esta prueba a sincronización entre teléfonos.

**Decisión/estado:** #4 **permanece abierto** hasta que el creador considere aceptada C8 después de la revisión. PR #14 sigue borrador con base `refactor/arquitectura`; `main` no se modificó. **Siguiente tarea única recomendada:** revisión crítica posterior de C8, atendiendo a guardas de turno, origen, recepción y UI local; no cerrar #4 o fusionar automáticamente.

## Continuidad: revisión crítica posterior de C8 — 27/10/2026

Se realizó la revisión separada documentada en [informe36](36-revision-critica-c8.md), posterior a esta entrega. Se contrastaron guardas y tests y se ejecutaron **seis controles adicionales de Chromium** en viewport táctil 393×852 con el mismo HTML exacto: intento a IA forzando destinatarios, cambio de clase de equipamiento del receptor, sustitución de objeto original, donante fallecido, pase activo y transferencia válida entre categorías distintas. **Los seis pasaron sin excepciones JS**. La cobertura acumulada C8 es de **nueve escenarios** controlados (3 previos de UI + 6 adicionales); no significa partidas completas ni tests CI nuevos. [Actions 40586682191](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40586682191) del código auditado sigue en **318 declaradas, 317 aprobadas, 0 fallidas y 1 TODO (#6)**.

**Dictamen:** no se detectaron defectos nuevos confirmados propios del parche C8. Riesgos P3 y límites se describen en informe36; sin prueba Android física. **#4 continúa abierto** hasta que el creador autorice aceptación/cierre. PR14 borrador; `main` intacta. **Siguiente tarea única propuesta:** aceptación administrativa de #4, no fusionar automáticamente.
