# Invierno en la Colonia

Proyecto de videojuego de supervivencia desarrollado gradualmente, tomando como punto de partida la experiencia mecánica de *Dead of Winter*.

## Nuestro objetivo en tres hitos

1. **Construir una adaptación muy parecida al juego de mesa, estable y modular.** La V9.9 actual está estabilizada como punto de partida, pero **todavía no está certificada como adaptación fiel definitiva**. D1/D2 separan módulos **sin cambiar reglas**; después una **auditoría RF de fidelidad de referencia** contrastará las mecánicas centrales con el reglamento, y se resolverán las diferencias relevantes con cambios y pruebas autorizados por separado.
2. **Preservar la versión de referencia** aceptada con un SHA/versión identificable, construcción reproducible y pruebas/documentación, antes de modificarla para el juego propio.
3. **Crear nuestro videojuego propio**, principalmente singleplayer, con Director de Juego, memoria narrativa, consecuencias persistentes y decisiones mecánicas propias.

**No confundir dos registros:** la **futura matriz RF** es para verificar/corregir la fidelidad de nuestra **adaptación de referencia**. La **matriz F** (F-01, F-14, etc.) compara mecánicas y recoge decisiones para **nuestro juego propio**: no son bugs de V9.9 ni tareas para aplicar durante D. La **etapa F** del plan original es expansión visual/red, distinta de ambas matrices.

## Estado y documentación

- [Tablero operativo — tarea vigente](docs/18-tablero-operativo.md).
- [Ruta oficial — tres hitos, criterios de fidelidad y preservación](docs/62-hitos-referencia-fiel-y-juego-propio.md).
- [Dirección de producto](docs/51-rumbo-fidelidad-e-identidad.md).
- [Alcance de la matriz F del juego propio](docs/61-alcance-matriz-f-juego-propio.md).
- [Plan general](docs/01-plan-refactorizacion.md).

La rama `refactor/d1-catalogo` contiene trabajo de arquitectura aún no fusionado con `main`. La próxima tarea técnica propuesta es **D1.2a (experimento reversible de esbuild, pendiente de autorización)**. No se inicia RF, se modifican reglas ni se publica una versión por actualizar esta documentación.
