# 62 — Ruta oficial: referencia fiel y modular → referencia preservada → juego propio

**Decisión del creador (28/10/2026).** Este documento complementa la [dirección del producto (51)](51-rumbo-fidelidad-e-identidad.md), precisa el [alcance de la matriz F (61)](61-alcance-matriz-f-juego-propio.md) y gobierna la planificación futura junto con el [tablero operativo (18)](18-tablero-operativo.md).

## Objetivo de producto sin ambigüedad

**Primero queremos un videojuego MUY parecido al juego de mesa *Dead of Winter* en experiencia, reglas centrales y dinámica táctica, estable y con una arquitectura escalable. Después queremos conservarlo como referencia y usar esa base para transformarlo en *Invierno en la Colonia*, con identidad propia, principalmente singleplayer y con Director de Juego/narrativa persistente.**

- La **V9.9 actual**, aun con estabilización C y tests verdes, **no está certificada como la adaptación fiel definitiva**. Es el punto de partida comprobado.
- La **refactorización D1/D2** tiene alcance de **preservación de comportamiento**: se separan dependencias, estado, reglas e interfaz, pero no se introducen a escondidas cambios de jugabilidad.
- **Después de establecer una base técnica segura**, las diferencias mecánicas importantes con el juego de mesa se auditan y, si corresponde, se corrigen en tareas explícitas de fidelidad de referencia, con pruebas antes/después. El análisis comparativo puede comenzar en paralelo, pero sus cambios ejecutables deben tener alcance separado de D.
- La **matriz F existente (F-01, F-14, etc.) NO es la lista de correcciones de fidelidad de referencia**. Registra las ideas que deseamos **conservar/cambiar para nuestro juego propio**. Una decisión de esa matriz puede resultar incompatible con el futuro singleplayer y deberá revisarse nuevamente al implementarla.
- «Muy parecido» **no significa copia literal, equivalencia completa sin pruebas, ni reproducción de textos, personajes, ilustraciones o cartas protegidos**. Lo evaluamos según una selección explícita de reglas centrales y experiencia real; las diferencias deliberadas deben quedar justificadas.

## Hito 1 — Adaptación de referencia fiel, estable y modular

**Objetivo:** llegar a un juego digital que conserve los ciclos y decisiones esenciales del juego de mesa, además de funcionar y poder evolucionar técnicamente.

### Trabajo de arquitectura (D1/D2, sin alterar reglas)

- Completar D1 (catálogo y decisión de build) y avanzar en D2 (estado, validaciones, acciones, turnos, presentación y automatización desacoplados), por entregas pequeñas.
- Probar que el motor de reglas no necesita el DOM ni un segundo jugador obligatorio en sus módulos reutilizables; durante D debe conservar **el funcionamiento actual** incluso cuando sus limitaciones queden aisladas.
- Mantener pruebas unitarias, de integración, de partidas completas, de distribución y de navegador; registrar limitaciones de Android físico, accesibilidad y balance, sin convertir CI verde en certificación de jugabilidad.

### Trabajo de fidelidad de referencia (distinto de la matriz F)

**Crear una matriz específica de contraste de referencia**, con identificadores diferentes a F (por ejemplo `RF-001`), **cuando se autorice la auditoría**. No declarar aquí que ya está completa o contrastada con fuentes primarias.

Para cada mecánica candidata, registrar:
1. Fuente del reglamento de mesa consultada (edición, página/sección y alcance), sin copiar contenido expresivo extenso.
2. Qué hace la versión digital realmente, con prueba o evidencia observable.
3. **Estado:** equivalente funcional / desviación deliberada aceptable / discrepancia relevante por corregir / sin verificar.
4. Impacto en la experiencia, prioridad, riesgos de balance y compatibilidad con el motor.
5. Decisión explícita del creador: corregir para la referencia, aceptar la desviación o posponer con motivo.
6. Tests de aceptación y resultado posterior para cada corrección aprobada.

**Núcleos mínimos a contrastar (sin afirmar fidelidad previa):** preparación y elección inicial; supervivientes, acciones y dados; movimiento y exposición; búsqueda, ruido y mazos; recursos, hambre y moral; heridas, mordeduras y muertes; crisis, rondas y fase de colonia; encrucijadas; objetivos, victoria y derrota; interacción de grupos/modos que ofrezca la adaptación.

**Puerta para llamar «referencia suficientemente fiel y estable»:**
- Las mecánicas críticas de esa lista tienen comparación documentada y no hay discrepancias críticas sin resolución; desviaciones voluntarias están aceptadas con sus razones.
- Correcciones de referencia aprobadas se implementaron en PRs delimitados, con comparación antes/después y regresiones. No modificar silenciosamente las aserciones de la línea base histórica.
- Sin defectos críticos/P1 conocidos sin resolver y con resultados verificables de partidas completas en navegador; pruebas de experiencia/jugabilidad y equilibrio registradas o reservas explícitas según el alcance del hito.
- El diseño modular permite introducir después singleplayer, eventos y consecuencias sin reconstruir todos los sistemas de supervivencia. Esto requiere evidencia de contratos y pruebas, no solo carpetas separadas.
- **La aceptación formal del hito corresponde al creador.** Cumplir 433/433 tests del estado actual no demuestra por sí solo fidelidad ni autoriza certificar este hito.

## Hito 2 — Preservar la versión de referencia

**Objetivo:** mantener una base verificable que NO cambie silenciosamente cuando evolucione nuestro videojuego.

- Elegir con autorización explícita una referencia Git inmutable/identificable (por ejemplo, tag con SHA exacto y documentación de build/tests) y conservar su ejecutable, código fuente e informe de diferencias aceptadas.
- No crear ahora tag, release, rama nueva ni fusionar en `main` por haber escrito este plan; decidir repositorio/ramas de largo plazo antes de promover versiones.
- Guardar evidencia de cómo regenerar y ejecutar la referencia, sus reglas deliberadas, límites conocidos y resultados de prueba.
- Mantener su línea base de pruebas independiente de la futura evolución de reglas del juego propio.

**Puerta:** referencia con SHA identificable, construcción reproducible, auditoría de fidelidad aceptada, pruebas y reservas documentadas, aprobada expresamente.

## Hito 3 — Juego propio basado en esa referencia

**Objetivo:** usar las piezas técnicas y el aprendizaje de la adaptación como punto de partida, no como un límite creativo.

- Abrir una línea de desarrollo separada y explícitamente autorizada desde la referencia preservada.
- Revisar **la matriz F del juego propio**: qué conservar, cambiar, descartar o prototipar; incorporar solo las decisiones validadas frente al singleplayer y su economía de acciones.
- Diseñar un jugador que gestiona supervivientes, con un **Director de Juego que afecta al mundo y la narrativa, no que se comporta obligatoriamente como el segundo grupo de la adaptación**.
- Probar un pequeño arco de decisiones y consecuencias diferidas antes de ampliar campañas, visuales o cooperativo online.
- Los cambios deliberados de reglas requieren nuevas expectativas y pruebas **en el juego propio**, sin reescribir la historia de la referencia.

**Puerta inicial:** versión de referencia preservada + decisión de crear línea propia + primer plan de mecánicas F y vertical slice narrativo aprobado.

## Orden operativo y límites

`C estabilizada → D1/D2 conservador (la auditoría de fidelidad puede planificarse en paralelo) → correcciones de fidelidad de referencia por alcance independiente → aceptación de referencia fiel/estable/modular → preservación verificable → rama y desarrollo del juego propio (matriz F + E) → expansión posterior`.

- El orden entre tramos internos de D2 y correcciones de fidelidad **se decidirá técnicamente** para minimizar retrabajo; en ningún caso mezclarlas sin marcar qué cambios conservan comportamiento y cuáles lo alteran intencionalmente.
- La próxima tarea de código **sigue siendo D1.2a**, experimento reversible esbuild (cuando se autorice/disponga de Codex). No se adelantan modificaciones RF ni F, ni se crea un Director.
- El contraste de fidelidad **RF** y la matriz de diseño propio **F** tienen objetivos y criterios de aceptación distintos; no mezclar IDs, etapas ni PRs.
- La etapa F de la hoja de ruta original (presentación/red) **no es** la matriz F de decisiones.
- Esta decisión **corrige documentos antiguos que llamaban «base fiel definitiva» a la V9.9 actual o proponían aplicar F-14 a la referencia**, sin borrar el registro histórico.

**Estado de este documento:** decisión y plan únicamente; no se ha ejecutado ninguna auditoría RF exhaustiva, cambio de reglas, bifurcación del producto ni promoción.
