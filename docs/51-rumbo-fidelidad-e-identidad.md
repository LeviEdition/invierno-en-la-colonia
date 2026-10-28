# 51 — Rumbo del producto: primero fidelidad estable, después identidad propia

**Acuerdo de diseño del creador · 28/10/2026 · `Invierno en la Colonia`.** Documento de dirección de producto y registro de alcance; no es código implementado ni una aprobación de cerrar la etapa C.

## Decisión estratégica confirmada

El objetivo **inmediato** es terminar una adaptación digital **estable, completa y cercana en experiencia y núcleo táctico a `Dead of Winter`**, como base verificable para aprender ingeniería de software y comprobar reglas, turnos, recursos, personajes, crisis, supervivencia y consecuencias. El parecido es **funcional y de experiencia**, no equivalencia exacta automática: cualquier diferencia del reglamento deberá clasificarse como defecto, adaptación voluntaria documentada o cuestión pendiente.

**Solo después de contar con esa referencia estable y suficientemente probada** se comenzará a forjar la identidad propia del juego: principalmente **singleplayer**, donde una persona toma decisiones sobre su grupo y un **Director de Juego** administra condiciones del mundo, amenazas, crisis, facciones, eventos y narrativa con consecuencias que pueden aparecer rondas más tarde. El Director **no** es un segundo jugador cooperativo ni necesita un grupo de IA obligatorio. La presencia futura de IA aliada o cooperativo online es una opción de diseño, no una obligación arquitectónica.

Esta orientación es consistente con la decisión histórica de preservar la ruta A→B→C→D→E→F y no reorientar el motor mientras se estabiliza V9.9. Se aclara ahora que la visión singleplayer es la **dirección de producto a largo plazo**, pero no una mecánica autorizada para programarse durante C.

## F-14 — Selección inicial: decisión funcional confirmada, pendiente de implementación

1. Al iniciar, ofrecer **cinco candidatos supervivientes elegidos aleatoriamente** del conjunto disponible.
2. El jugador **elige tres** para su equipo.
3. El jugador **designa a un líder** de esos tres, manualmente.
4. Los otros candidatos no se incorporan al grupo y deben volver al conjunto disponible conforme a la política del catálogo que se defina al implementar.
5. **Conservar tres supervivientes iniciales por grupo** por ahora, para no reducir automáticamente el conjunto de dados o acciones de V9.9.
6. En la adaptación actual con J1/J2 o humano/IA, los detalles de selección automática de la IA, repetición de candidatos y reemplazo deben diseñarse y probarse **antes** de codificar; no imponer un segundo grupo en el singleplayer futuro.

Este acuerdo **no** cambia todavía la V9.9 ni autoriza código sin diseño de interacción, pruebas, balance y revisión. La alternativa de `Dead of Winter` (cuatro candidatos/escoger dos) es referencia de mesa, no la elección adoptada para este producto.

## Criterios para considerar «base fiel y estable»

- Comportamientos críticos comprobables con tests de reglas, integración, partidas completas y navegadores: no solo número de tests verdes.
- Diferencias frente al reglamento oficial y adaptaciones explícitas (por ejemplo F-14 y futuro sistema de dados) documentadas y aceptadas; «muy parecido» no significa copiado literal.
- Sin defectos P1 conocidos sin resolver y con reservas P2 transparentes; accesibilidad móvil real y balance humano se declaran límites si no se prueban.
- Procesos de C y PR14 cerrados mediante aceptación explícita y control de versiones; no se interpreta CI verde como aprobación de merge.
- Motor lo suficientemente modular para cambiar topología de grupos, turnos y dirección de eventos sin destruir las reglas consolidadas: **D es refactorización con preservación de comportamiento**, no la introducción de singleplayer/Director de Juego.
- Antes de una publicación con identidad propia, textos, cartas, arte, marca y ambientación serán originales o usados con licencias apropiadas, no copia de contenido expresivo del juego de mesa.

## Secuencia de trabajo — sin saltarse las puertas de calidad

**Puerta inmediata:** revisar aceptación administrativa de C1–C16 y los nueve issues abiertos; la etapa C todavía no tiene cierre oficial y `main` sigue intacta. Esta sigue siendo la **única tarea operativa activa**.

**Diseño de fidelidad (matriz F):** seguir decidiendo caso a caso qué conservar y qué cambiar. F-14 se considera acordada; F-01, F-03b, F-10, F-12, F-15 y otras propuestas deben conservar estado de diseño según sus acuerdos, sin tratar una casilla de «Cambiar» como implementación autorizada. Las decisiones todavía abiertas F-24 y F-57 requieren análisis. Programar cambios de reglas solo con alcance y pruebas propias.

**Hito de referencia:** una versión jugable estable y suficientemente fiel en su experiencia a `Dead of Winter`, incorporando únicamente adaptaciones voluntarias probadas. La planificación técnica precisa para incorporar los cambios de la matriz y el refactor D se decide sin fusionarlos con C.

**Etapa D:** extraer módulos y desacoplar el motor de la interfaz y de la suposición rígida de dos grupos, conservando primero el comportamiento aprobado. Esto facilita *después* singleplayer, cooperativo y Director de Juego; no es una orden de implementar ya esos modos.

**Etapa E y evolución:** prototipar la identidad propia: Director de Juego, agencia y consecuencias diferidas, memoria de decisiones, facciones y narrativa persistente; validar un arco pequeño antes de expandir contenido.

**Etapa F y posteriores:** cooperativo online y otras modalidades opcionales según prioridades, sin desviar el eje principal singleplayer.

## Razones y riesgos

La referencia conocida simplifica validar reglas y encontrar bugs. El grupo de tres elegido entre cinco ofrece agencia y rejugabilidad sin eliminar de inmediato acciones. **Riesgo principal:** confundir estabilidad técnica con fidelidad, o introducir ahora una arquitectura de Director que imponga más cambios de los que podemos verificar. **Contramedida:** separar baseline probado, cambios de fidelidad aprobados, refactor de preservación y prototipo narrativo; no acumularlos en un mismo PR.

## Registro de autorización

- **Aprobado como rumbo:** primero adaptación estable y cercana al juego de mesa, después identidad propia principalmente singleplayer con Director de Juego; F-14 cinco aleatorios → elegir tres → líder manual.
- **No aprobado/implementado en esta decisión:** eliminar hoy a la IA compañera, crear ya el Director de Juego, modificar dados, cambiar condiciones de victoria, cerrar issues, fusionar PR14, tocar `main` ni iniciar D/E/F.
- **Evidencia necesaria futura:** pruebas específicas del flujo F-14, comparación de acciones/dados, pilotos de balance y, más adelante, escenas narrativas con consecuencias observables.
