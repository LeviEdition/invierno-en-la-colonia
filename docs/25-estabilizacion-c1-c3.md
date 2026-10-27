# 25 — Estabilización C1–C3: resultados verificados

**Fecha:** 27/10/2026 · **Rama:** `fix/estabilizacion-v9-9` · **Estado:** tres correcciones comprobadas en GitHub Actions; **PR [#14](https://github.com/LeviEdition/invierno-en-la-colonia/pull/14) en borrador** hacia `refactor/arquitectura`. La V9.9 de `main` permanece intacta; no se fusionó ni publicó versión nueva.

## Criterio y proceso

La [auditoría A6](24-cierre-auditoria-y-prioridades.md) clasifica 12 incidencias/decisiones abiertas de V9.9 y especifica los límites de comprobación. El usuario autorizó continuar con ajustes una vez creada la lista.

Cada defecto se atendió con una modificación delimitada del archivo bajo pruebas en **rama aislada**, actualización de tests que describían el comportamiento incorrecto y ejecución de la suite.

## Cambios

### C1 — [#11: verificación de victoria de la IA](https://github.com/LeviEdition/invierno-en-la-colonia/issues/11)

La IA podía usar suficientes notas para ganar y, sin embargo, perder cuando la colonia bajaba la moral antes de ejecutar `verify()`.

**Corrección:** tras el uso exitoso de una nota de investigación, `botTurn()` llama a `verify()` inmediatamente; si el objetivo está cumplido, retorna sin continuar consumiendo objetos, moviendo personajes ni procesando la colonia.

**Regresiones:** victoria con hambre extrema, meta completada antes de colonia y detener la utilización de notas restantes cuando ya se ganó.

### C2 — [#2: recursos de encrucijadas](https://github.com/LeviEdition/invierno-en-la-colonia/issues/2)

Las decisiones de `Fiebre en el refugio`, `El generador averiado` y `La guardia nocturna` comprobaban objetos como si las manos guardaran cadenas simples, ignorando cartas estructuradas.

**Corrección:** localizar y comprobar por tipo con `kind()`; el consumo remueve **una sola carta** correspondiente. `kind()` también soporta las recompensas históricas almacenadas como cadenas.

**Regresiones:** cada tipo habilita la opción cuando hay carta válida, consume una sola copia, respeta la mano del J2 local, rechaza opciones sin recurso y conserva compatibilidad con cartas antiguas.

**No se rediseñaron el resto de las 26 historias, sus textos ni las decisiones de la IA.**

### C3 — [#3: dados del segundo jugador](https://github.com/LeviEdition/invierno-en-la-colonia/issues/3)

`boostDie()` comprobaba `game.dice.length` —la reserva de J1— en vez del jugador activo.

**Corrección:** ahora consulta `actionDice().length`, dejando igual el resto de la mecánica.

**Regresiones:** J2 mejora un dado sin dados J1, J2 sin dados no puede gastar comida aunque J1 tenga, límite 6 y falta de comida.

## Pruebas y estado

[GitHub Actions — última suite validada](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40537729389):

| Métrica | Resultado |
| --- | ---: |
| Pruebas declaradas | 248 |
| Aprobadas | **245** |
| Fallidas | **0** |
| TODO preexistentes | 3 |

Durante el desarrollo las pruebas **fallaron temporalmente** cuando se cambiaron las expectativas antes del código, y cuando un test antiguo de modales todavía asumía que la medicina era inutilizable. Se corrigió la preparación del test: su escenario «sin recurso» ahora quita expresamente la medicina. La suite terminó verde.

### Límites

- La comprobación automatizada usa en gran medida DOM simulado; los arreglos C1–C3 **todavía no cuentan con una nueva pasada manual de navegador y Android físico**.
- El ajuste de la IA está dirigido al uso de **notas de investigación**; todavía hará falta auditar integralmente dónde se incrementan muestras para una arquitectura futura de campañas narrativas.
- El objetivo y las reglas ambiguas (**#4, #6, #7**) no se modificaron.

## Próximo bloque único

**C4 — [#12, foco de diálogos](https://github.com/LeviEdition/invierno-en-la-colonia/issues/12).** Diseñar guardia de foco para setup/pase, comprobar Tab/Shift+Tab y Enter en Chromium real, probar con teclado y resolución móvil simulada, y ejecutar suite de regresión. No corregir otros defectos en el mismo bloque.

**Salida:** mantener PR #14 en borrador hasta comprobar la versión candidata y decidir su integración. No sustituir la V9.9 de `main` de manera automática.
