# 50 — C16: foco de teclado en Ayuda y Fallecimiento

**Fecha:** 28/10/2026 (Montevideo). **Rama:** `fix/estabilizacion-v9-9`. **Autorización:** «Continúa con la estabilización», después de la revisión C12–C15 que recomendó corregir A1/P2. **Base:** `f1c1fc48fb71a4529b223930c7123f0138bc29f4`, PR14 draft a `refactor/arquitectura`; `main` sin cambios.

## Hallazgo y objetivo

C15 demostró en Chromium tres viewports (320×640, 393×852 y 1365×768) que el foco podía salir de los diálogos de **Ayuda** y **Fallecimiento**, llegando al tablero subyacente. La guardia C15 impedía escoger sucesor por detrás de un fallecimiento, pero el problema de foco A1 seguía sin corregirse. Evidencia histórica: `docs/evidencias/c15-foco.json` e informe49. No confundirlo con el issue #12, que cubre únicamente Inicio/Pase y sigue pendiente de aceptación administrativa.

**Objetivo C16:** confinar Tab/Shift+Tab y foco programático en el diálogo visible de mayor prioridad; marcar el fondo inerte y devolver foco al origen adecuado al cerrar, sin cambiar costos, reglas, decisiones, fases ni contenido.

## Cambios técnicos realizados

Se generalizó el aislamiento de C4/#12 sin quitar sus contratos existentes:
- `activeDialog()` respeta la prioridad **Inicio/Pase > Fallecimiento > modal normal**; el bloqueo `inert` se aplica a los demás hijos de `body` durante el diálogo.
- `focusin` devuelve el foco que intenta escapar; Tab/Shift+Tab circula por botones visibles del diálogo activo.
- Ayuda y demás modales al abrir enfocan su control; al cerrar intentan recuperar el origen de la acción, o el botón de menú si ya no está disponible.
- El aviso de fallecimiento aísla incluso un modal abierto debajo; al continuar, el foco pasa a la sucesión que corresponda o vuelve al control disponible. Escape no cierra el modal inferior durante una muerte.
- Se sincroniza también tras `paint()` y cancelación por fin de partida, protegiendo diálogos encadenados.
- Los stubs de pruebas de motor usan DOM mínimo; `?.` y listas vacías en funciones de foco evitan exigir métodos de DOM no presentes sin modificar las reglas. El fixture histórico C4 fija `Math.random` a un valor reproducible para no confundir una encrucijada inicial con una regresión de Pase.

**Archivos de código/pruebas:** `invierno_colonia_v9_9.html`, `tests/foco-modales-c16.test.mjs` (seis contratos nuevos), `tests/accesibilidad-pase-c4.test.mjs` (aislamiento/determinismo del fixture C4), `scripts/check-c16-focus-browser.mjs` (recorrido Playwright reproducible **preparado, no ejecutado** en esta revisión).

## Pruebas rojo → verde e iteraciones registradas

- **Rojo previo:** commit `b955317` con seis regresiones C16; [CI 40693804541](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40693804541) **failure**, cuatro de seis tests C16 fallaron por el defecto, dos ya pasaban en la versión previa. El total de la suite fue 404/408.
- **Primer parche:** `ee193d2`: las seis regresiones C16 pasaron, pero [CI 40694191605](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40694191605) reveló fallos del DOM mínimo (`dialog.contains` no existe) en varios tests antiguos. No se aceptó ese resultado.
- **R1 y R2:** `98e5f0c` y `e23896a`: compatibilidad con stubs que carecen de métodos propios del DOM del navegador, además de asegurar el retorno de foco después de muerte. Cayeron los fallos del resto de la suite salvo tests C4 que asumían fondo desbloqueado aun con una encrucijada inicial abierta.
- **Preparación dirigida C4:** `7a15f9f` separó la prueba de salir de Inicio del caso de una decisión inicial pendiente. [CI 40694649844](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40694649844) **success**, 408/408. El renombrado posterior de tests (`dd5663d`) detectó intermitencia C4 por azar no controlado: [CI 40695036857](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40695036857) 407/408. `265dc0d` fijó el azar de ese fixture para reproducibilidad; [CI 40695224171](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40695224171) **completed/success**, **408/408**, 0 fallidas, 0 omitidas, 0 TODO. No se quitaron aserciones de juego ni se desactivaron pruebas.

**Conclusión verificada:** seis contratos C16 verdes y suite completa 408/408 sobre `265dc0d`; los recorridos de Node no permiten afirmar que la nueva captura de foco está comprobada en Chromium real.

## Navegador: alcance no ejecutado aquí

Se añadió `scripts/check-c16-focus-browser.mjs`, que realiza mediante Playwright la secuencia Inicio → Ayuda (teclado y cierre/retorno) → muerte (aislamiento, Tab/Escape y fondo) → sucesión → pase local, en **320×640, 393×852 y 1365×768**, con recolección de errores JS y hash HTML. Usa servidor local `:8765` y `PLAYWRIGHT_MODULE`/`CHROMIUM_PATH` según el procedimiento C15. **Se preparó pero no se ejecutó con navegador en este entorno.** Tampoco se comprobó Android físico, TalkBack, otros motores o certificación WCAG.

## Dictamen y próxima tarea

**C16 implementada y validada en la suite Node/CI, con validación Chromium pendiente.** A1 deja de ser una ausencia de corrección en código, pero el cierre técnico/UX requiere ejecutar el script del navegador en la rama exacta y observar foco, prioridad de overlays y retorno en dispositivos objetivos. No dar por aprobadas pruebas no ejecutadas; clasificar cualquier defecto nuevo antes de continuar.

**Única siguiente tarea:** ejecutar y revisar independientemente `scripts/check-c16-focus-browser.mjs` en Chromium (tres viewports), repetir CI exacto después de cualquier parche, y luego presentar aceptación de C16/etapa C al creador. No cerrar issues, fusionar PR14, tocar `main`, publicar versión ni comenzar D/E/F. La matriz de fidelidad F-01/F-10/F-12/F-15 corresponde a decisiones de diseño futuras, no a C16.
