# 51 — Rumbo del producto: adaptación fiel y modular como base del juego propio

**Acuerdo de diseño del creador · 28/10/2026 · `Invierno en la Colonia`.** Documento de dirección de producto y registro de alcance; no es código implementado.

> **ACLARACIÓN DE ALCANCE POSTERIOR (vigente):** la **matriz F de fidelidad** es una herramienta de comparación y **diseño de las mecánicas de nuestro juego propio**. Sus filas **no se implementan en la V9.9 de referencia ni en la refactorización D de preservación**, aunque estén acordadas como propuestas de diseño. El acta vinculante del alcance F es [61 — Alcance de la matriz F](61-alcance-matriz-f-juego-propio.md). **La ruta oficial de los tres hitos es [62 — Referencia fiel y modular → preservación → juego propio](62-hitos-referencia-fiel-y-juego-propio.md).** Las referencias antiguas a F como requisito de fidelidad de la V9.9 quedan corregidas por esta aclaración.

## Decisión estratégica confirmada

El **primer hito de producto** es alcanzar una adaptación digital **muy parecida a `Dead of Winter` en experiencia, reglas centrales y decisiones tácticas**, con estabilidad demostrada y una **arquitectura modular/escalable**, como base para aprender y evolucionar nuestro videojuego. La **V9.9 actual es el punto de partida estabilizado, NO está certificada como la referencia de fidelidad definitiva**. Refactorizamos su comportamiento mediante D1/D2; luego auditamos las diferencias importantes del reglamento frente a evidencia concreta y las corregimos, si corresponde, en tareas de **fidelidad de referencia** explícitas y separadas de D. La meta es semejanza funcional evaluable, no copia literal ni equivalencia exacta sin pruebas.

**Solo después de contar con esa referencia estable y suficientemente probada** se comenzará a forjar la identidad propia del juego: principalmente **singleplayer**, donde una persona toma decisiones sobre su grupo y un **Director de Juego** administra condiciones del mundo, amenazas, crisis, facciones, eventos y narrativa con consecuencias que pueden aparecer rondas más tarde. El Director **no** es un segundo jugador cooperativo ni necesita un grupo de IA obligatorio. La presencia futura de IA aliada o cooperativo online es una opción de diseño, no una obligación arquitectónica.

Esta orientación es consistente con la decisión histórica de preservar la ruta A→B→C→D→E→F y no reorientar el motor mientras se estabiliza V9.9. Se aclara ahora que la visión singleplayer es la **dirección de producto a largo plazo**, pero no una mecánica autorizada para programarse durante C.

## F-14 — Selección inicial para la versión propia: diseño acordado, no implementado

1. Al iniciar, ofrecer **cinco candidatos supervivientes elegidos aleatoriamente** del conjunto disponible.
2. El jugador **elige tres** para su equipo.
3. El jugador **designa a un líder** de esos tres, manualmente.
4. Los otros candidatos no se incorporan al grupo y deben volver al conjunto disponible conforme a la política del catálogo que se defina al implementar.
5. **Partir de tres supervivientes iniciales controlados por el jugador** en el diseño propio; revisar su impacto en acciones, dados y ritmo del futuro singleplayer antes de implementarlo.
6. **No trasladar este flujo a J1/J2 o humano/IA de la V9.9 de referencia.** La selección para un eventual grupo de IA solo se diseñaría si ese modo formara parte del producto propio.

Este acuerdo **no aplica cambios a la V9.9 de referencia**, ahora ni al finalizar D. La implementación futura en el juego propio requerirá un diseño de interacción, pruebas, balance, revisión y autorización específicos. La alternativa de `Dead of Winter` (cuatro candidatos/escoger dos) es referencia de mesa, no la elección adoptada para este producto.

## Hito 1: criterios para considerar una base fiel, estable y modular

- Comportamientos críticos comprobables con tests de reglas, integración, partidas completas y navegadores: no solo número de tests verdes.
- **Matriz RF de fidelidad de referencia** (a crear con autorización, distinta de la matriz F): contraste de los sistemas críticos con las reglas de mesa, clasificación de equivalencias, desviaciones aceptadas, discrepancias por corregir y pendientes. Cada corrección prioritaria exige decisión, prueba y revisión independientes.
- Diferencias mecánicas **críticas para la experiencia** resueltas o aceptadas explícitamente con justificación; «muy parecido» no significa equivalencia exacta. **F-14 y las nuevas reglas de dados de la matriz F quedan reservadas exclusivamente para el juego propio**, no para corregir la referencia.
- Sin defectos P1 conocidos sin resolver y con reservas P2 transparentes; accesibilidad móvil real y balance humano se declaran límites si no se prueban.
- Integraciones y cambios de fidelidad de referencia respaldados por decisiones explícitas, control de versiones y tests. C/PR14 ya se integraron con reservas; CI verde **no basta** para certificar fidelidad ni para autorizar merge o declarar completo este hito.
- Motor lo suficientemente modular para cambiar topología de grupos, turnos y dirección de eventos sin destruir las reglas consolidadas: **D es refactorización con preservación de comportamiento**. Las **correcciones RF** de fidelidad de referencia pueden cambiar reglas, pero solo en tareas posteriores/aisladas y autorizadas; no son Director de Juego ni cambios de la matriz F.
- Antes de una publicación con identidad propia, textos, cartas, arte, marca y ambientación serán originales o usados con licencias apropiadas, no copia de contenido expresivo del juego de mesa.

## Secuencia de trabajo — sin saltarse las puertas de calidad

**Estado vigente:** C1–C16 ya fue integrada a la referencia de `main` con reservas; la tarea técnica siguiente está en [tablero 18](18-tablero-operativo.md): evaluar D1.2a, experimento de construcción con esbuild. Los párrafos históricos anteriores al cierre de C no indican el estado actual.

**Matriz F — comparación y decisiones para la versión propia:** seguir examinando qué ideas del juego de mesa conviene conservar o cambiar **para nuestro futuro videojuego**. F-14 conserva el acuerdo de diseño indicado arriba; otras filas mantienen el grado de decisión registrado individualmente en la matriz. **«Conservar» y «Cambiar» no ordenan modificar la V9.9, no constituyen defectos de referencia y tampoco autorizan implementación en la versión propia.**

**Hito 1 — Referencia fiel y modular:** completar D1/D2 conservadores y una **auditoría RF** de fidelidad, seguida de correcciones mecánicas prioritarias de referencia, aceptadas y probadas en tareas distintas. Solo entonces podremos afirmar, con reservas explicitadas, que contamos con una adaptación suficientemente parecida al juego de mesa. Las **433 pruebas del estado D1.1 no certifican esa fidelidad**. No aplicar decisiones de la matriz F.

**Hito 2 — Referencia preservada:** conservar esa versión con un SHA/etiqueta o equivalente autorizado, construcción reproducible, criterios de fidelidad y evidencia de tests antes de ramificar el producto. **No se crea tag ni release automáticamente**.

**Etapa D (solo referencia):** extraer módulos y desacoplar el motor de la interfaz y de la suposición rígida de dos grupos, **preservando el comportamiento actual, sin implementar filas F**. Esto facilita *después* singleplayer, cooperativo y Director de Juego; no es una orden de implementar ya esos modos.

**Hito 3 — Juego propio (línea de desarrollo separada; matriz F y etapa E):** seleccionar e implementar cambios F que sigan siendo útiles para singleplayer y prototipar la identidad propia: Director de Juego, agencia y consecuencias diferidas, memoria de decisiones, facciones y narrativa persistente; validar un arco pequeño antes de expandir contenido.

**Etapa F del plan original (distinta de los IDs F-01, F-14, etc.) y posteriores:** cooperativo online y otras modalidades opcionales según prioridades, sin desviar el eje principal singleplayer.

## Razones y riesgos

La referencia conocida simplifica validar reglas y encontrar bugs. El grupo de tres elegido entre cinco ofrece agencia y rejugabilidad sin eliminar de inmediato acciones. **Riesgo principal:** dar por fiel a la V9.9 solo porque pasan sus tests, o tratar las decisiones F del juego propio como correcciones de la referencia; también introducir demasiado pronto un Director que imponga cambios no verificables. **Contramedida:** conservar baseline y refactor D sin cambiar reglas; **auditar fidelidad RF y corregir por separado** las diferencias relevantes antes de preservar la referencia; implementar decisiones F **solo en la futura línea propia** tras revisar su valor para singleplayer. No acumular diferentes propósitos en un mismo PR.

## Registro de autorización

- **Aprobado como rumbo:** primero **completar una adaptación muy parecida al juego de mesa, estable y modular (D + contraste y correcciones RF)**, luego preservar esa referencia y **después, en la versión propia**, evolucionar al singleplayer con Director de Juego y considerar F-14 (cinco aleatorios → elegir tres → líder manual). El acuerdo F-14 es de **diseño propio**, no de código de referencia.
- **No aprobado/implementado por la matriz F:** alterar selección de personajes, dados, turnos o cualquier regla de V9.9; crear ya el Director de Juego; implementar filas F en D1/D2; fusionar o publicar. Las integraciones técnicas posteriores de C/D tienen sus actas específicas y no se revierten por esta aclaración.
- **Evidencia necesaria futura:** para Hito 1, auditoría RF basada en el reglamento, correcciones aprobadas, regresiones y pruebas de jugabilidad; para Hito 2, SHA/compilación/test reproducible; para Hito 3, pruebas específicas de los cambios F (por ejemplo F-14), pilotos de balance y escenas narrativas con consecuencias observables.
