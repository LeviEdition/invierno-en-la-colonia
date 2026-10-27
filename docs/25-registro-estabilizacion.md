# 25 — Registro de estabilización V9.9 (C1–C4)

**Fecha:** 27/10/2026. **Rama de trabajo:** `fix/estabilizacion-v9-9` (nació de `refactor/arquitectura`). **Estado:** cuatro ajustes realizados, con pruebas de regresión y CI verde. **No promovidos a `main`.**

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

## Evidencia

- [Última ejecución GitHub Actions sobre rama de estabilización](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40541776775): **253 tests declarados, 250 aprobados, 0 fallidos, 3 TODO**.
- Los 3 `test.todo` son anteriores y están ligados a reglas/situaciones pendientes; **no son fallas de los arreglos nuevos**.
- En los tests anteriores de caracterización se reemplazaron las expectativas defectuosas por expectativas de comportamiento correcto.
- Los informes de pruebas automatizadas **no sustituyen prueba manual en Android** ni certifican balance real.

## Pendientes de estabilización

| Prioridad siguiente | Issue | Motivo |
| --- | --- | --- |
| **C4 completada** | [#12](https://github.com/LeviEdition/invierno-en-la-colonia/issues/12) | Foco de inicio/pase corregido en rama; revisión de accesibilidad real adicional pendiente |
| C5 | [#8](https://github.com/LeviEdition/invierno-en-la-colonia/issues/8) + [#10](https://github.com/LeviEdition/invierno-en-la-colonia/issues/10) | Fortalecer guardias del motor para pase/fallecimiento |
| C6 | [#9](https://github.com/LeviEdition/invierno-en-la-colonia/issues/9) | Acciones durante curación pendiente |
| Más adelante | [#5](https://github.com/LeviEdition/invierno-en-la-colonia/issues/5), [#13](https://github.com/LeviEdition/invierno-en-la-colonia/issues/13), [#7](https://github.com/LeviEdition/invierno-en-la-colonia/issues/7) | Estrategia IA, ergonomía móvil, selección estructurada de encrucijadas |
| Requiere al creador | [#4](https://github.com/LeviEdition/invierno-en-la-colonia/issues/4), [#6](https://github.com/LeviEdition/invierno-en-la-colonia/issues/6) | Transferencias entre grupos y momento de elección de líder inicial |

**No dar por cerrado ningún issue automáticamente:** el cambio permanece en rama, no está integrado a la versión estable. Las incidencias se podrán cerrar tras revisión/promoción y verificación correspondiente.

## Siguiente tarea única

**C5 — [#8](https://github.com/LeviEdition/invierno-en-la-colonia/issues/8) y [#10](https://github.com/LeviEdition/invierno-en-la-colonia/issues/10): fortalecer las guardias de fin de turno ante pantalla de pase o fallecimiento.** Escribir antes regresiones, modificar solo transición de turno y comprobar modo local e IA. No mezclar con correcciones de IA estratégica, móviles ni narrativa.
