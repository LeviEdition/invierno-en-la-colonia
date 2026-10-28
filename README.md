# Invierno en la Colonia

Proyecto de videojuego de supervivencia en desarrollo gradual. Partimos de una **V9.9 de referencia** inspirada en la experiencia mecánica de *Dead of Winter*, con intención de crear después una versión propia **principalmente singleplayer**, con Director de Juego y consecuencias narrativas persistentes.

## Dos líneas de trabajo diferentes

- **Referencia V9.9:** estabilizar y refactorizar el código, conservar el comportamiento aprobado y validar el motor por pruebas. **D1/D2 no implementan nuevas mecánicas de la matriz F.**
- **Juego propio futuro:** revisar y aplicar selectivamente las decisiones de la **matriz F — comparación y decisiones para el juego propio**. Incluso las filas acordadas requieren autorización, implementación y pruebas separadas. La futura línea de desarrollo conservará una referencia identificable.

La matriz F no es una lista de defectos de V9.9 ni una orden para cambiar sus reglas. Además, los códigos **F-01, F-14, etc.** de esa matriz no son la **etapa F** del plan original (expansión visual y cooperativo).

## Documentación y estado

- [Tablero operativo — estado vigente y próxima tarea](docs/18-tablero-operativo.md).
- [Decisión vinculante — alcance de la matriz F](docs/61-alcance-matriz-f-juego-propio.md).
- [Dirección de producto](docs/51-rumbo-fidelidad-e-identidad.md).
- [Plan general de refactorización](docs/01-plan-refactorizacion.md).

La rama `refactor/d1-catalogo` contiene trabajo de arquitectura **todavía no fusionado a `main`**; consultar el tablero antes de autorizar el siguiente paso. El análisis de una regla no implica permiso para modificar el juego.
