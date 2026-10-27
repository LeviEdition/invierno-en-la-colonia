# 19 — Auditoría A2-01: privacidad y aislamiento del modo local V9.9

**Fecha:** 27/10/2026. **Rama:** `refactor/arquitectura`. **Estado:** caracterización automatizada **completada**; verificación visual y táctil **pendiente de A5**. No se modificó el motor ni la V9.9.

## Objetivo y metodología

Revisar el modo cooperativo de **dos personas compartiendo un dispositivo**, especialmente los límites entre J1 y J2 y las acciones durante la pantalla privada de pase.

Se ejecutó el JavaScript **real de V9.9**, sin el código de arranque automático y con un DOM simulado básico. Este bloque mantuvo activas `create()`, `newRound()`, `paint()`, `show()`, `hide()`, `renderModal()`, `finishTurn()`, `showPass()`, `confirmPass()`, `crossChoose()` y el catálogo de objetos. Se reemplazaron solo notificaciones/animaciones con equivalentes neutros.

**Pruebas agregadas:** `tests/modo-local-privacidad.test.mjs`, **16 casos**. [Ejecución CI inicial](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40523731831): **193 tests totales, 190 aprobados, 0 fallidos y 3 TODO** (los TODO son anteriores). La suite muestra los defectos presentes mediante pruebas de **caracterización**: no son regresiones esperadas para el comportamiento ya corregido.

## Matriz de comprobación

| ID | Precondición → acción | Esperado / observado | Resultado |
| --- | --- | --- | --- |
| A2-01-01 | Partida local, J1 activo; consultar inventario y dados | Mano y dados de J1 exclusivamente; controles separan reservas | **Verificado con DOM simulado** |
| A2-01-02 | J1 finaliza turno | J2 pasa a ser controlador; pantalla de pase visible, deshabilita botones de acciones y oculta dados flotantes | **Verificado con DOM simulado** |
| A2-01-03 | Pantalla de pase activa; ejecutar select/boostDie/pickFloatingDie | No cambia selección, dados ni comida durante pase | **Verificado con DOM simulado** |
| A2-01-04 | Confirmar pase para J2; abrir inventario | Mano de J2 visible, no cartas exclusivas de J1; dados J2 habilitados | **Verificado con DOM simulado** |
| A2-01-05 | J2 gasta dado de acción | Desciende botDice, no cambia reserva de J1 | **Verificado** |
| A2-01-06 | J2 tiene dados, J1 ninguno; mejorar dado | **Esperado:** J2 puede gastar comida. **Observado:** se rechaza | **Fallo conocido [#3](https://github.com/LeviEdition/invierno-en-la-colonia/issues/3)** |
| A2-01-07 | Encrucijada de ronda asignada a J2 durante pase | Queda pendiente, no se decide desde pase y se presenta al confirmar | **Verificado con DOM simulado** |
| A2-01-08 | Búsqueda o transferencia sin resolver; terminar J1 | El turno no avanza y se conserva el modal pertinente | **Verificado** |
| A2-01-09 | J1 y J2 eligen personajes distintos, transcurren sus turnos | Cada selección reaparece en su grupo tras comenzar la ronda siguiente | **Verificado** |
| A2-01-10 | J1 finaliza; luego J2 finaliza | La colonia procesa una vez y recién después empieza nueva ronda | **Verificado** |
| A2-01-11 | Se completa una ronda | Vuelve a aparecer pantalla de pase para J1 y dados flotantes ocultos | **Verificado con DOM simulado** |
| A2-01-12 | Pantalla de pase activa; invocar `finishTurn()` **directamente** de nuevo | **Esperado:** turno de J2 no avanza antes de confirmar. **Observado:** se puede saltar y procesar colonia | **Debilidad de contrato [#8](https://github.com/LeviEdition/invierno-en-la-colonia/issues/8)** |
| A2-01-13 | Reiniciar partida después de jugar con J2 | Ambas manos vuelven a siete cartas y se restaura la selección inicial | **Verificado** |

Los 13 renglones agrupan los **16 casos automatizados**; no son un conteo individual de tests.

### Protección visual y privacidad

- `controls.interactive` exige `!passScreenActive`; por eso las acciones normales quedan bloqueadas durante el pase.
- `showPass()` asigna el nombre del próximo jugador, muestra el panel y cierra el menú flotante. `confirmPass()` restablece los controles.
- `paintDice()` vacía los dados flotantes durante el pase; `renderModal('inventory')` utiliza `currentHand()`, es decir, la mano del controlador activo.
- **CSS comprobado por lectura:** `.handoverBackdrop[hidden]{display:none!important}` (línea 284 en la base) y `.handoverBackdrop` ocupa `inset:0`, `z-index:200`, con fondo opaco (línea 285). Esta es una indicación estructural, **no una captura ni una prueba visual en navegador**.
- El DOM subyacente sigue renderizando estado del jugador que recibirá el dispositivo. La confidencialidad visual depende de que la pantalla opaca esté realmente por encima de todo y no haya rutas de interacción o problemas de foco. Se comprobará **en navegador real**.
- El juego no presenta objetivos secretos individuales, pero la separación de cartas, dados y acciones sigue siendo un contrato de la interfaz.

## Hallazgos y prioridad de análisis posterior

**[#3](https://github.com/LeviEdition/invierno-en-la-colonia/issues/3) — Dado de J2:** defecto funcional previo reproducido de nuevo. `boostDie()` valida `game.dice.length` en lugar del controlador activo, aunque luego intenta operar sobre `actionDice()`. Corregir en fase C después de aprobar prioridades.

**[#8](https://github.com/LeviEdition/invierno-en-la-colonia/issues/8) — Saltar pase mediante llamada interna:** `finishTurn()` no exige `!passScreenActive`. Es una vulnerabilidad del **contrato interno de turno**, no una demostración de explotación por clic normal: el botón de fin está deshabilitado y cubierto por el pase. Debería bloquearse también en el motor antes de incorporar otras interfaces o red.

**[#6](https://github.com/LeviEdition/invierno-en-la-colonia/issues/6) — Líder inicial de J2:** defecto ya documentado y cubierto en otra suite: se puede elegir líder después de consumir acciones, distinto de J1. Fuera del foco específico A2-01.

**[#4](https://github.com/LeviEdition/invierno-en-la-colonia/issues/4) — Transferencias entre grupos:** regla por decidir. No interpretar la posibilidad de transferir entre grupos como defecto confirmado sin acuerdo.

## Qué no se ha verificado aún

1. **Pantalla real en Chrome/Firefox y celular:** visibilidad del contenido detrás del pase, orden de capas, scroll, orientación vertical y táctil.
2. **Foco y teclado:** si se puede llegar a controles detrás de la superposición usando Tab, accesibilidad y lectores de pantalla.
3. **Eventos reentrantes reales:** clics rápidos o dobles, acciones en tránsito y eventos que se solapan durante animaciones y modales.
4. **Secuencias completas de modales:** interacciones combinadas entre mordeduras, muertes, sucesiones y espera de decisiones. Corresponden al bloque **A3**.
5. **Partidas completas:** victoria/derrota real y comportamiento móvil bajo presión de recursos (A4/A5).

## Guion de revisión manual futura (A5)

Abrir la V9.9 original en navegador y comenzar **2 jugadores locales**.

1. J1 revisa sus dados y mano; toca terminar turno; verificar que el pase cubre todo y no expone J2.
2. Sin confirmar todavía, intentar tocar fuera del botón «Comenzar turno», deslizar verticalmente y, en PC, usar Tab. Ninguna vía debe revelar o activar datos privados.
3. Confirmar; J2 comprueba su inventario, dados, personajes y selección, sin acceso a la mano de J1.
4. Durante J2, abrir/cerrar menús y encrucijadas; verificar que no se mezclan controles.
5. Terminar J2 y comprobar que vuelve el pase para J1 después de una sola fase de colonia.
6. Repetir con decisiones pendientes y pantalla vertical estrecha; registrar capturas y comportamiento.

**No indicar «validado en dispositivo» sin haber ejecutado estos pasos.**

## Conclusión y continuidad

A2-01 caracteriza con 16 pruebas nuevas el aislamiento de reservas y el flujo normal de pase. Las dos incidencias funcionales relevantes son una conocida (#3) y una nueva (#8). **No se realizaron correcciones.**

La **etapa global A sigue abierta**. El bloque automatizado A2-01 puede cerrarse, dejando las pruebas visuales explícitamente pendientes para A5. La siguiente tarea única debe ser **A3-01 — Interfaz y modales de acciones pendientes**, sin abordar todavía narrativa ni refactorización.
