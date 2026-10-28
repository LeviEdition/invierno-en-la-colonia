# 36 — Revisión crítica posterior de C8 / issue #4

**Fecha:** 27/10/2026 · **Etapa:** C — estabilización · **Rama auditada:** `fix/estabilizacion-v9-9`, commit `52f1c7160e1b82d5ddbf24dd21d29a69f75c053c` · **PR:** [#14](https://github.com/LeviEdition/invierno-en-la-colonia/pull/14), abierto y draft, base `refactor/arquitectura` · **Issue #4:** abierto a la fecha de esta revisión. **Dictamen:** no se encontró un defecto nuevo confirmado dentro de la corrección C8; revisión completada con límites explícitos.

## Alcance y verificaciones de partida

Se revisó por separado de la implementación [informe35](35-c8-transferencias-por-modo.md): `startTransfer()`, `canReceiveTransfer()`, `chooseTransfer()`, `TurnController.interactive`, `playable()`, `ownerOf()`, `equipmentOf()`, modal `transferTarget`, pantalla de pase `finishTurn()`/`confirmPass()`, `ItemEngine.equip()`, la colección de **14 pruebas C8** y los escenarios de Chromium anteriores.

Control de alcance: comparación entre la cabeza inicial C8 `5a4ff7a` y `52f1c71`: solo `invierno_colonia_v9_9.html`, `tests/combate-equipamiento.test.mjs` y cuatro archivos de documentación. No se incluyeron correcciones de otro issue. GitHub `main` permanecía en `d9068f4aa8d3a10bbbf1e0a8a2527744cc6952cb`; el ejecutable C8 tenía el **Git blob `32eb545cbdbca047ded8bc81d64b8e438e096a49`**, idéntico al HTML local empleado en Chromium.

**Evidencia CI auditada:** [run 40586682191](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40586682191), checkout `52f1c7160e1b82d5ddbf24dd21d29a69f75c053c`, `completed/success`: **318 tests declarados, 317 aprobados, 0 fallidos, 0 skipped/cancelled, 1 TODO (#6)**. Las 14 regresiones C8 están activas y verdes. La secuencia reproducible rojo→verde anterior está registrada en el [informe35](35-c8-transferencias-por-modo.md); en esta revisión **no se modificó código ni tests**.

## Lectura crítica de invariantes

1. **Dos modalidades bien separadas.** Con IA, `canReceiveTransfer` solo incluye al grupo propietario; en modo local J1+J2 permite destinos de ambos grupos. Se conserva la reorganización del equipamiento dentro de J1 y de J2. No se agrega aceptación ni negociación de la IA, como solicitó el creador.
2. **Validación tanto antes como después de mostrar destinatarios.** `startTransfer()` solo ofrece supervivientes vivos, en el mismo lugar y sin equipamiento del mismo `kind`. `chooseTransfer()` repite `canReceiveTransfer()` aun ante destinatarios manipulados, y valida que origen vivo/activo, turno interactivo, índice y referencia de ítem sean los que siguen disponibles.
3. **Sin mutación al rechazar.** La operación no ejecuta el `splice()` del objeto hasta que todos los guardas pasan; un cambio en el destinatario no puede quitar el arma al origen. Una confirmación repetida no encuentra `pendingTransfer` y no duplica.
4. **Integración con cambio de turno.** `playable()` bloquea durante `passScreenActive` o `aiRunning` y el donante debe pertenecer al controlador del turno presente. En modo local, después de confirmar el pase, J2 puede entregar a J1 con los controles de J2.
5. **Preservación de categorías.** Se permite una herramienta y un arma equipadas en el mismo personaje, pero no dos objetos de la misma categoría de equipamiento. El destino se vuelve a comprobar al confirmar, no solo cuando se abre la ventana.

## Pruebas de navegador adicionales de esta revisión

Se verificó localmente que `git hash-object` del HTML de prueba es `32eb545cbdbca047ded8bc81d64b8e438e096a49`, el blob GitHub de C8. Se ejecutó **Chromium real / Playwright**, pantalla táctil emulada de 393×852, cargando el HTML por `page.set_content()` (la navegación `file://` no está permitida en este entorno), con condiciones controladas preparadas en JS. **Seis escenarios nuevos de control**, todos aprobados sin errores `pageerror`:

| ID | Precondición → Acción | Esperado / Observado |
| --- | --- | --- |
| R1 | Modo IA, J1 pistola, `startTransfer(0)`, modificar `pendingTransfer.targets` agregando `a0`, ejecutar `chooseTransfer('a0')` | IA no recibe arma; origen conserva pistola; selección sigue pendiente para elegir receptor válido/cancelar — **aprobado** |
| R2 | Modo local, J1 pistola, modal abierto; destinatario J2 recibe otra arma (rifle), confirmar | Rechaza sin retirar pistola; no duplica categoría; `cancelTransfer()` limpia el estado — **aprobado** |
| R3 | Modo local, J1 pistola, modal abierto; cambiar ranura original a palanca, confirmar | No transfiere la palanca por accidente; mantiene estado hasta cancelar — **aprobado** |
| R4 | Modo local, J1 pistola, modal abierto; muerte del donante antes de confirmar | No transfiere desde personaje muerto ni altera equipamiento — **aprobado** |
| R5 | Modo local, J1 pistola, modal abierto; activar pase de teléfono antes de confirmar | `playable()` bloquea la entrega; conserva ambos equipamientos — **aprobado** |
| R6 | Modo local, J1 pistola y J2 palanca; confirmar transferencia de pistola J1→J2 | Permite categorías distintas (arma+herramienta), sin pérdida de objeto, pendiente queda `null` — **aprobado** |

**Total de navegación de C8:** tres recorridos anteriores de UI completos (informe35) + seis controles de navegador de esta revisión = **nueve escenarios acotados**. Los seis nuevos verifican funciones reales dentro del navegador con estado construido, **no equivalen a nueve partidas completas, ni agregan nueve pruebas a GitHub CI**. No se corrió un Android físico ni TalkBack.

## Riesgos y distinciones

- **Reserva P3 de integración, no regresión demostrada:** `playable()` no comprueba por sí solo **todos** los modales o eventos pendientes (`crossPending`, `pendingLoot`, `pendingBite`, etc.). Por tanto, las funciones de transferencia no son una barrera independiente completa contra llamadas artificiales a JS cuando existe un estado pendiente distinto. El flujo visual normal con modal prioritario no ofreció una vía de usuario confirmada para disparar estas acciones; se mantiene como posible fortalecimiento defensivo a considerar en una revisión transversal, no como bug confirmado de C8 ni cambio de alcance sin aprobación.
- **Reserva P3 de interfaz:** si se altera el estado de un personaje mientras el selector de destinatarios está abierto, el botón puede seguir visible aunque al pulsarlo ya no sea elegible. El motor rechaza de forma segura y el usuario puede cancelar. No se detectó pérdida de inventario ni bloqueo irreversible. Un refresco dinámico del modal sería mejora futura, no requisito actual.
- **Cobertura:** faltan partidas aleatorias completas en navegador, accesibilidad formal de selector con lector de pantalla, dispositivos físicos y eventual juego online; el objetivo de C8 es únicamente el modo IA vs local de un dispositivo. El `TODO` remanente de la suite corresponde a **#6**, no a C8.

## Dictamen y siguiente decisión

**C8 pasa la revisión crítica posterior en su alcance.** La política aprobada queda implementada, las 14 regresiones pasan y los nueve escenarios específicos de Chromium no muestran efectos secundarios. No se encontraron defectos críticos o de alta prioridad que requieran parche antes de pedir aceptación del issue #4.

Se registra el dictamen **sin modificar código, pruebas, reglas, `main`, PR, ni cerrar #4**. **Siguiente tarea única recomendada:** proponer al creador la **aceptación funcional y cierre administrativo del issue #4**, dejando PR #14 abierto en borrador sin fusionar. Recién después abordar #6 si lo autoriza.
