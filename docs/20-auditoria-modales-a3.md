# 20 — Auditoría A3: modales, decisiones pendientes y diálogos (V9.9)

**Fecha:** 27/10/2026. **Estado:** bloque **A3 automatizado completado**; pruebas visuales en navegador / táctiles **pendientes de A5**. El juego V9.9 permanece intacto.

## Objetivo

Caracterizar el circuito `show()` → `renderModal()` → decisión → `hide()`, con múltiples estados pendientes, cambios de turno y diálogo de muerte. No incorporar funciones nuevas ni corregir reglas en esta etapa.

## Método y evidencia

- **Fuente bajo prueba:** script de `invierno_colonia_v9_9.html`, SHA Git blob `4ebaedad13d63c7a6762c524a52c0dd9695687b1`.
- **Archivo de pruebas:** `tests/modales-estados-pendientes.test.mjs` (**21 casos nuevos**).
- **Herramienta:** Node.js `node:test`, `vm`, DOM simulado de mínima; las funciones reales `show`, `hide`, `renderModal`, `paint`, `finishTurn` y decisiones siguen activas. No usar resultados como prueba de accesibilidad visual.
- [Ejecución A3 verificada](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40526289477): 218 tests declarados, **215 aprobados**, 0 fallidos y 3 TODO. Los TODO son anteriores.
- [Suite posterior conjunta con A4](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40528489536): **238 aprobados**, 0 fallidos, 3 TODO.

## Matriz: precondición → acción → esperado/observado

| Categoría | Prueba | Resultado |
| --- | --- | --- |
| Apertura/cierre | Modal `help` → `hide()`; abrir `goal` y después `crisis` | Se abre, actualiza el título y se cierra con coherencia |
| Botín | `pendingLoot` activo; intentar abrir ayuda o cerrar | Prioriza diálogo de botín y bloquea cierre; inválidos rechazados |
| Búsqueda/ruido | Añadir ruido reiteradamente | Máximo 4; el diálogo conserva selección; cartas no elegidas regresan al mazo |
| Curación | `pendingHeal` activo; intentar cerrar; cancelar | Bloquea cierre, cancela sin usar habilidad |
| Curación | Elegir paciente y repetir clic | Cura una vez, marca habilidad usada, estado pendiente eliminado |
| Transferencia | Iniciar, cancelar o confirmar dos veces | Sin duplicación de equipo; la cancelación lo conserva |
| Atracción | Comenzar, cancelar y resolver | Consume dado al comenzar; cancelar no lo devuelve (comportamiento actual) |
| Encrucijadas | Bloquear cierre, elección inválida, doble elección | Bloqueo y no duplicación de efectos confirmados |
| Prioridad | Mordedura + sucesión + botín + curación pendientes | Prioridad del modal: mordedura → líder → botín → curación |
| Mordedura | Pendiente de riesgo; intentar terminar; elegir riesgo | No termina hasta resolver; riesgo blanco permite continuar |
| Líder | Sucesión pendiente y doble elección | Acepta una sola designación |
| Muerte | `kill()` y `deathDirector.open()`; continuar | Presenta diálogo y lo cierra cuando corresponde |
| Pase local | Superposición activa; intentar abrir acciones | Bloquea acciones normales; ayuda puede abrirse detrás del pase |

Estos resultados reflejan **funciones y estado con DOM simulado**, no un control del navegador real.

## Defectos y debilidades descubiertos

### [#9](https://github.com/LeviEdition/invierno-en-la-colonia/issues/9) — Acciones de inventario durante curación pendiente

**Precondición:** `pendingHeal` y modal de curación activos. **Acción:** invocar directamente `playItem(0)` con una ración en mano. **Esperado:** bloquear acciones ajenas al diálogo. **Observado:** se consume la ración y aumenta comida mientras sigue pendiente la curación.

El modal habitual no muestra la acción de inventario en ese momento, por lo que **no se comprobó explotación por los controles normales**. Riesgo de contrato interno.

### [#10](https://github.com/LeviEdition/invierno-en-la-colonia/issues/10) — Fin de turno durante pantalla de muerte

**Precondición:** `deathDirector.active=true`, fallecimiento visible, partida aún en marcha. **Acción:** llamada directa a `finishTurn()`. **Esperado:** no avanzar hasta confirmar «Continuar». **Observado:** pasa a J2 con el diálogo de muerte todavía activo.

También es un riesgo de contrato interno: la superposición normal debería impedir la interacción habitual y falta comprobarlo en navegador.

### Relación con [#8](https://github.com/LeviEdition/invierno-en-la-colonia/issues/8)

La misma `finishTurn()` no valida internamente la pantalla de pase. Estos problemas sugieren revisar **una guardia única de transición de turnos** en la etapa de estabilización, con pruebas de regresión. No corregir durante A3.

## No verificado todavía

1. Navegación con Tab y foco mientras hay superposiciones y modales.
2. Doble clic o toque rápido en navegador real durante animaciones.
3. Solapamientos entre muerte, mordedura, elección de líder y fase de colonia con `queueMicrotask` y tiempos reales.
4. Lectores de pantalla, contraste, resolución móvil, scroll y bloqueo por capas CSS.
5. Acceso inadvertido a controles detrás de la superposición. Se programará en A5.

**Decisión:** A3 automatizado termina con evidencia y riesgos registrados; **no se declara la interfaz validada en dispositivos reales**. Seguimos A4 y luego A5.

## Resumen de alcance

**21 pruebas nuevas; 2 issues nuevos (#9 y #10); V9.9 sin modificar.** Los 21 casos pasan porque caracterizan el comportamiento existente, incluido el incorrecto; «test aprobado» no significa «sin defecto».
