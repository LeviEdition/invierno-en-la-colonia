# Invierno en la Colonia

Proyecto de videojuego de supervivencia en desarrollo gradual. Primero usamos una adaptación funcional de *Dead of Winter* como referencia; después construiremos una experiencia original principalmente singleplayer, con Director de Juego y consecuencias narrativas persistentes.

## Rumbo acordado

1. **Fidelidad mecánica de la V9.9: ACEPTADA para nuestro objetivo.** La estabilización C está integrada y la [comparación de 14 áreas con el reglamento oficial](docs/49-c15-auditoria-final.md#comparación-con-dead-of-winter) documenta semejanzas y diferencias. El creador acepta esta fidelidad **suficiente**, sin exigir copia literal, reauditoría RF desde cero ni reproducir todas las reglas oficiales. Las reservas sobre Android físico, accesibilidad y balance siguen documentadas.
2. **Trabajo pendiente: completar D1 y D2.** Separar reglas, estado, acciones, turnos, IA/interfaz; conservar el comportamiento y demostrar que el motor es modular, escalable y comprobable. **No modificar reglas ni introducir mecánicas nuevas** durante este refactor.
3. **Preservar la referencia resultante.** Una vez aceptada la arquitectura, conservar una versión identificable y reproducible (SHA, build y pruebas) con autorización.
4. **Comenzar nuestro juego propio.** En otra línea de desarrollo, revisar la **matriz F** (F-01, F-14, etc.) e implementar cambios propios, singleplayer, Director y narrativa persistente por etapas.

**Distinguir conceptos:** el informe 49 es la comparación mecánica ya realizada; una nueva matriz RF **no es requisito**. La matriz **F** registra decisiones de diseño **para el juego propio**, no bugs de la V9.9. La etapa F histórica (ampliación/presentación/red) tampoco es esa matriz.

## Documentación y estado

- [Tablero operativo — próxima tarea](docs/18-tablero-operativo.md)
- [Decisión vigente — fidelidad aceptada y D1/D2 pendientes](docs/62-hitos-referencia-fiel-y-juego-propio.md)
- [Dirección de producto](docs/51-rumbo-fidelidad-e-identidad.md)
- [Alcance de la matriz F del juego propio](docs/61-alcance-matriz-f-juego-propio.md)
- [Plan general](docs/01-plan-refactorizacion.md)

La rama `refactor/d1-catalogo` incluye trabajo D1 todavía sin fusionar a `main`. La próxima tarea técnica propuesta es **D1.2a: experimento reversible con esbuild**, a evaluar con Codex. Esta actualización documental no cambia el ejecutable ni autoriza merges o publicaciones.
