# Diagnóstico técnico — Invierno en la Colonia V9.9

**Estado:** primer análisis estático, sin alterar reglas ni comportamiento.

## Punto de partida

- Código fuente de referencia: `invierno_colonia_v9_9.html`.
- Un archivo HTML con CSS y JavaScript embebidos.
- Aproximadamente 1.280 líneas y 147 KB de texto.
- Cinco clases reconocibles: `ItemCatalog`, `TurnController`, `ItemEngine`, `DeathDirector` y `CrisisManager`.
- Unas 89 declaraciones de funciones; el juego usa además expresiones y métodos.
- Modos actuales: una persona + IA y dos personas por turnos en un dispositivo.

Este documento describe **lo observado en el código**, no certifica todavía el comportamiento de cada regla.

## Mapa orientativo del código

| Bloque | Ubicación aproximada | Responsabilidad actual |
| --- | --- | --- |
| HTML/CSS | Antes de la línea 335 | Estructura de pantalla, tablero, controles y estilo |
| `ItemCatalog` | Línea 336 | Definiciones, tipos y distribución de cartas |
| `TurnController` y variables globales | Líneas 411–427 | Turnos, jugadores activos, manos y dados |
| Encrucijadas y ayudas visuales | A partir de la línea 430 | Eventos y funciones de interacción |
| `ItemEngine` | Línea 622 | Efectos de objetos y equipamiento |
| `create()`, `newRound()` | Alrededor de las líneas 668–701 | Creación de partida y rondas |
| `DeathDirector`, `kill()`, `verify()` | Líneas 706–744 | Muertes y final de partida |
| Búsqueda, combate y acciones | Alrededor de las líneas 800–950 | Acciones de los supervivientes |
| Encrucijadas: `crossDraw`, `crossTrigger`, `resolveCross` | Líneas 951–995 | Selección y resolución narrativa |
| `resolveCrisis()`, `colony()` | Líneas 1006–1033 | Crisis y fase de colonia |
| `botTurn()` | A partir de la línea 1034 | Decisiones del jugador IA |
| `renderSite()`, `paint()` | Líneas 1247–1275 | Construcción de HTML y actualización de pantalla |

Los números de línea corresponden a la V9.9 original y pueden cambiar con futuras versiones.

## Hallazgos

### 1. Un único estado global compartido

La variable `game` y otras variables como `selected`, `pendingHeal`, `pendingLoot`, `aiRunning` y `passScreenActive` están disponibles para múltiples subsistemas.

**Consecuencia:** las reglas, las decisiones pendientes y la interfaz quedan acopladas. Es difícil probar una acción sin preparar gran parte del navegador y del estado global.

### 2. Dibujar también puede ejecutar lógica

En `paint()` se llama a `processRescueQueue()`. Esa función puede influir en el estado de la partida.

**Objetivo:** que el renderizado lea el estado y lo muestre; que las acciones y reglas sean las únicas que lo modifiquen.

### 3. Reglas y navegador conviven

Hay llamadas a `document.getElementById`, `show()`, `hide()`, `paint()` y avisos visuales en medio del flujo de las acciones y de turnos.

**Objetivo:** separar motor de reglas, interfaz y coordinador de acciones, de modo que el motor se pueda ejecutar sin DOM.

### 4. Aleatoriedad no controlada

Las tiradas se basan en `Math.random()` mediante `random()` y `die()`.

**Objetivo:** poder inyectar un generador reproducible en las pruebas. No se cambiarán las probabilidades de juego al hacerlo.

### 5. Encrucijadas difíciles de persistir

Las historias contienen directamente funciones JavaScript como efecto de cada opción; algunas condiciones dependen del título de la carta.

**Objetivo futuro:** eventos identificados por ID, condiciones y efectos declarativos, para guardar decisiones y activar consecuencias diferidas.

### 6. Multijugador todavía local

El navegador es quien mantiene el estado, tira los dados y ejecuta las reglas.

**Objetivo futuro:** comandos validados en un servidor autorizado; los clientes recibirán actualizaciones del estado, sin decidir los resultados por separado.

## Fortalezas que conservaremos

- El catálogo de objetos y su distribución están relativamente centralizados.
- Existen clases reutilizables que pueden migrarse por etapas.
- Se distinguen jugadores humanos, IA y modo local.
- El juego ya tiene una versión jugable de referencia que podremos comparar durante el proceso.
- El proyecto puede seguir usando JavaScript; no necesita convertirse en otro lenguaje.

## Riesgos que verificaremos más adelante (no son defectos confirmados)

- Estados incompatibles durante ventanas de mordedura, rescate y decisiones narrativas.
- Cambios no intencionales en la secuencia de turnos al separar módulos.
- Llamadas visuales repetidas que produzcan efectos de juego repetidos.
- Diferencias en la ejecución al pasar de un único HTML a módulos ES.

## Regla de trabajo

La rama `main` conserva la V9.9 original. Todos los cambios se revisarán en una rama de desarrollo y se integrarán después de pruebas. **Refactorizar no significa rediseñar reglas.**
