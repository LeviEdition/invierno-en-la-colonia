# 37 — Feedback al intentar un segundo movimiento con combustible

**Fecha:** 27/10/2026. **Rama:** `fix/estabilizacion-v9-9` · **PR14:** abierto y en borrador hacia `refactor/arquitectura` · **main:** sin integrar. **Alcance:** corrección mínima de experiencia de usuario, sin alterar las reglas de movimiento ni del combustible.

## Requerimiento y problema confirmado

El creador precisó que **solo le interesan los avisos cuando el jugador puede intentar una acción mediante un control visible que las reglas rechazan**, no los bloqueos defensivos del código ante llamadas artificiales. Tras revisar C8 y otras acciones, se reprodujo este caso específico en Chromium:

- Precondición: jugador humano, carta de combustible en mano, superviviente seleccionado que ya se movió, destino distinto del actual.
- Acción: clic real en **«Usar»** de combustible en el inventario.
- Esperado: **la misma advertencia** que al intentar mover dos veces con el botón «Mover»: `⚠ El superviviente ya se movió durante este turno.`. No gastar combustible ni mover el personaje.
- Observado **antes**: `ItemEngine.moveWithFuel()` retorna `false` por `p.moved` sin mensaje; `playItem()` solo repinta. La carta y la posición permanecían intactas, pero el clic no recibía explicación. **Defecto de feedback reproducido en UI.**

## Pruebas primero (red)

[Commit `78c55af`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/78c55af021b970427f7372860ab7a038621dbfeb), archivo `tests/movimiento-exposicion.test.mjs`: se agregaron **2 pruebas** que invocan el camino real de interacción `playItem(0)` y verifican tanto el mensaje exacto en `game.last` / `game.log` como la conservación de carta, localidad, dados y residuos. Se cubrió J1 en humano+IA y J2 en modo local.

[CI rojo 40589116325](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40589116325): **320 pruebas declaradas, 317 aprobadas, 2 fallidas (ambas nuevas), 1 TODO (#6)**. Se confirma el fallo anterior antes de modificar el motor.

## Cambio mínimo (verde)

[Commit `63cb294`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/63cb2949f979631c97152f971f7a2dda171672ba), solo dentro de `ItemEngine.moveWithFuel()`:

- Rechaza `p` inexistente o fallecido como antes.
- Si `p.moved`, **emite exactamente** `⚠ El superviviente ya se movió durante este turno.` a través de `message()` **solo cuando el controlador actual es interactivo y coincide con el bando que intenta usar el combustible**; devuelve `false` sin consumir la carta ni mover el personaje.
- Para los demás casos, mantiene los requisitos previos de destino/carta/disponibilidad y las consecuencias del movimiento válido. No se tocan reglas IA ni modales ni transferencias C8.

[CI verde 40589214682](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40589214682): **320 declaradas, 319 aprobadas, 0 fallidas, 0 omitidas, 1 TODO (#6)**. Las nuevas pruebas y el resto de la suite pasan.

## Comprobación en Chromium real

Se construyó una copia local a partir del HTML C8 de Git blob `32eb545cbdbca047ded8bc81d64b8e438e096a49` aplicando exclusivamente el parche de combustible. Se verificó con `git hash-object`: **`4748627825e9876809ec482cb7c10431e6c07cf9`**, idéntico al blob GitHub del archivo corregido. Chromium/Playwright cargó el documento por `page.set_content()` debido a las restricciones `file://` del entorno.

**Tres recorridos de UI aprobados sin errores JS:**

| Precondición y clic de usuario | Observado |
| --- | --- |
| Humano+IA, J1 ya movido, seleccionar combustible en inventario y pulsar «Usar» | `game.last` y primera entrada de historial contienen exactamente la advertencia; ubicación, carta y residuos sin cambios |
| Local J2 (viewport móvil simulado 393×852), ya movido, pulsar «Usar» combustible | Misma advertencia exacta, ubicación, carta y residuos sin cambios |
| J1 no movido, combustible en mano, destino válido, pulsar «Usar» | Movimiento válido a destino, carta consumida y residuo generado; comportamiento conservado |

Además, se esperó la aparición del **toast visible en el DOM real** `#toastStack` y se confirmó el texto `⚠ El superviviente ya se movió durante este turno.`. El contenedor tiene `role="status"` y `aria-live="polite"`; no se usa `window.alert()` bloqueante. Las colas de toasts pueden retrasar brevemente un aviso.

## Límites, decisión y siguiente tarea

**Esta corrección no implica que todas las acciones tentables desde la UI tengan mensajes claros.** Se comprobó y arregló **solo el caso aprobado**: segundo movimiento con combustible. No se hizo una auditoría exhaustiva de todos los botones. No hay prueba Android física, TalkBack, partida completa ni prueba de alojamiento HTTP; viewport móvil emulado ≠ dispositivo físico.

**Issue #4 permanece abierto**, con C8 implementada/revisada y pendiente de aceptación administrativa. Este cambio UX es complementario a C8 y no representa un cambio de regla. `main` no se modificó y el PR14 sigue draft sin fusionar.

**Siguiente tarea única recomendada:** realizar una auditoría acotada y priorizada de feedback de **acciones que pueden intentarse realmente desde controles visibles**, y decidir cuáles silencios deben corregirse antes del cierre de estabilización; o retomar aprobación administrativa de #4 si el creador prefiere no ampliar alcance. No extender código de feedback sin autorización expresa.
