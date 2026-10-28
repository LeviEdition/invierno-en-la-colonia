# 63 — Hoja de ruta de planificación: modo singleplayer de Invierno en la Colonia

**Creada:** 28/10/2026. **Estado:** planificación y diseño conceptual; **NO autoriza programación ni cambios de reglas**. Este documento será el **índice vivo de decisiones y pendientes del modo singleplayer**. El [tablero 18](18-tablero-operativo.md) conserva la autoridad sobre el **próximo trabajo técnico**, las autorizaciones y el estado de D1/D2.

## 1. Contexto, objetivo y límites

**Objetivo creativo:** a partir de la adaptación mecánicamente suficiente y estabilizada de *Dead of Winter* (V9.9), crear **nuestro juego propio**, fundamentalmente singleplayer, en el que el jugador **encarna al líder** de un grupo de supervivientes, dirige **dónde va cada personaje, cuándo y cómo realiza acciones, qué recursos utiliza y qué decisiones comunitarias toma**. El mundo y sus historias evolucionan a través de un **Director de Juego**, con memoria de decisiones y consecuencias algunas rondas después.

**Separación obligatoria de líneas de trabajo:**

- **Referencia V9.9:** fidelidad mecánica **aceptada para nuestro alcance** y diferencias documentadas en [informe 49](49-c15-auditoria-final.md#comparación-con-dead-of-winter). Falta completar **D1/D2** sin alterar su comportamiento, probar y preservar una versión identificable: [ruta oficial 62](62-hitos-referencia-fiel-y-juego-propio.md).
- **Diseño del singleplayer (este documento):** **sí se puede avanzar ahora, en papel**. No se aplicará a la V9.9 ni es una instrucción técnica para Codex.
- **Implementación del juego propio:** solo **después** de D1/D2, aceptación técnica y preservación de la referencia, en una línea de desarrollo separada, con autorización y pruebas específicas.
- **Matriz F:** las filas F-xx comparan alternativas para el **juego propio**; **no** son fallos de la V9.9 ni la etapa F del plan histórico. La planilla F externa conserva sus propios estados de decisión; este índice **la referencia, no la reemplaza**: [acta 61](61-alcance-matriz-f-juego-propio.md).

**Principios:** supervivencia estratégica con peso real; decisiones narrativas moralmente complejas; causas reconocibles y efectos persistentes; dificultad exigente pero con opciones coherentes; el Director **no altera resultados ni inventa castigos arbitrariamente**; un segundo grupo de IA **no es obligatorio**; no exigir rediseñar todo para validar una pequeña pieza.

## 2. Cómo registraremos las decisiones

Estados **de diseño**, no de software:

- **ACORDADO:** decisión de visión o mecánica ya expresamente tomada. **No significa implementado ni equilibrado**.
- **BASE DE REFERENCIA:** regla que existe en V9.9 y se utiliza como punto de partida; **no significa adoptada para siempre**.
- **PROPUESTA:** hipótesis para comparar, prototipar o validar; **no aprobada**.
- **PENDIENTE:** necesita discusión y decisión explícita.
- **VALIDADO EN DISEÑO:** se han revisado ejemplos, costos, escenarios límite y alternativas; falta implementación futura.

Cada decisión relevante deberá registrar: **ID SP-xx**, objetivo, comparación con V9.9, opciones/compensaciones, relación con filas F si corresponde, conclusión del creador, casos límite, impacto en otros sistemas, cómo probarla y estado. No elevar una sugerencia del asistente a regla acordada. Si aparece contradicción con la matriz F, detenerse y verificar la fila exacta antes de aprobar nada.

## 3. Secuencia de planificación (NO secuencia de commits)

| ID | Bloque de diseño | Estado actual | Entregable y puerta de salida |
| --- | --- | --- | --- |
| **SP-00** | Identidad, alcance y rol del Director | **ACORDADO en lo esencial** | Visión consolidada: jugador como líder; supervivencia + narrativa; Director del mundo, no segundo jugador obligatorio. Verificar coherencia con [12](12-vision-narrativa-persistente.md), [51](51-rumbo-fidelidad-e-identidad.md) y [62](62-hitos-referencia-fiel-y-juego-propio.md). |
| **SP-01** | Preparación, equipo y liderazgo | **ACORDADO parcialmente** | F-14: cinco candidatos aleatorios → elegir tres → designar líder manualmente. Resolver incorporación/reemplazo, sucesión y autoridad del líder en casos límite. |
| **SP-02** | **Economía de acciones, dados y atributos** | **EN DISCUSIÓN: siguiente diseño** | Especificar reserva, asignación, límites por personaje, acciones con/sin dado, comida, lesiones/muerte, probabilidades y pruebas de balance; vincular F-10/F-12/F-15. |
| **SP-03** | Ciclo completo de una ronda singleplayer | **PROPUESTA inicial** | Describir con ejemplos las etapas inicio/información → órdenes/acciones → encuentros → resolución de colonia → consecuencias/continuidad; decidir puntos de interrupción y finalización. |
| **SP-04** | Presión de supervivencia con un solo grupo | **PENDIENTE** | Ajustar y comparar crisis, comida/hambre, residuos, zombis, moral, botín y crecimiento de la colonia **sin asumir que todo se divide entre dos**. |
| **SP-05** | Director de Juego y memoria del mundo | **Visión ACORDADA; reglas PENDIENTES** | Contratos de eventos, límites del Director, cuándo interviene, frecuencia, hechos persistentes, facciones, promesas y consecuencias diferidas/contingencias. |
| **SP-06** | Campañas, progresión y condiciones de victoria | **Principios ACORDADOS; pilotos parciales** | Mantener carta/objetivo inicial como compromiso de victoria; unir trama principal y recursos; definir primer arco jugable y epílogos basados en hechos. |
| **SP-07** | Interfaz, ritmo y continuidad de partida | **PENDIENTE** | Controles de líder/dados/órdenes, claridad de avisos y decisiones, ritmo de escenas, guardado y reanudación para campañas largas, accesibilidad móvil. |
| **SP-08** | Prototipo vertical y validación con jugadores | **FUTURO; no iniciar código** | Probar una ronda jugable completa en singleplayer y un arco de 3–4 escenas con dos rutas y una consecuencia visible varias rondas después, más casos de pérdida/sucesión. |

**Dependencias de diseño:** SP-00 y SP-01 establecen responsabilidades → **SP-02 y SP-03** determinan qué puede hacer el jugador por ronda → **SP-04** ajusta presión y recursos → SP-05/06 conectan el mundo y los objetivos → SP-07 presenta esa información → SP-08 valida la integración. Se pueden discutir en paralelo los conceptos narrativos ya documentados, sin diseñar mecánicas sobre suposiciones contradictorias.

## 4. Acuerdos recuperados (NO reabrirlos sin motivo nuevo)

| ID/área | Acuerdo de diseño | Alcance / precaución |
| --- | --- | --- |
| **SP-01 / F-14** | Cinco supervivientes candidatos aleatorios; jugador elige **tres** y nombra manualmente al líder. | Solo juego propio. Revisar consecuencias en dados, progresión y reemplazos antes de implementar. [Documento 51](51-rumbo-fidelidad-e-identidad.md). |
| **SP-00 / liderazgo** | El jugador **es representado por el líder**, da órdenes y toma decisiones de la colonia; el líder también es un superviviente del grupo. | No es un administrador omnisciente ni un personaje externo al tablero. |
| **SP-01 / sucesión** | Si muere el líder, el jugador elige un sucesor entre los supervivientes disponibles. | Detallar transición, casos sin candidatos y efectos narrativos; no confundir con implementación de V9.9. |
| **SP-00 / Director** | Gestiona acontecimientos, amenazas, facciones y consecuencias con memoria, **sin imponer un segundo grupo IA obligatorio**. | No debe controlar arbitrariamente las órdenes del jugador ni alterar la dificultad sin reglas justificables. [Visión 12](12-vision-narrativa-persistente.md). |
| **SP-02 / F-10** | Para el **juego propio**, el dado expresa dificultad y el atributo de la acción debe ser **mayor o igual** al valor del dado para poder usarlo. | Atributos, probabilidades y operaciones de UI pendientes de validación; no modificar V9.9. |
| **SP-02 / F-12** | Consumir **una comida** permite **+1 al atributo para una acción**, con tope 6 y sin acumulación. | Analizar costo, disponibilidad, momentos de decisión y consecuencias sobre hambre/colonia. |
| **SP-02 / F-15** | Atributos altos significan mayor capacidad; se propuso la traducción **`nuevo = 7 - valor antiguo`**. | Validar el catálogo concreto, casos límite y balance antes de codificar; no dar por probada la conversión. |
| **SP-06 / campaña** | La carta/objetivo elegido al inicio fija la campaña y requisitos de victoria; completar el objetivo **sí es ganar**. El epílogo depende de decisiones y estado del mundo. | No sustituir objetivos a mitad de partida ni anular una victoria por un epílogo amargo. [14](14-objetivos-campanas-epilogos.md), [16](16-progresion-narrativa-mecanica.md). |
| **SP-05/06 / persistencia** | Consecuencias diferidas con causalidad reconocible, decisiones grises, historias vinculadas e independientes. | Evitar escenas con personajes muertos y rutas bloqueadas sin alternativas; campañas cortas o largas según contenido. [12](12-vision-narrativa-persistente.md), [17](17-mapa-campana-encontrar-cura.md). |

**Importante:** los IDs SP-xx son **bloques de planificación**; los IDs F-xx son **filas de la matriz de diseño propio**. No reemplazar ni dar por cerrada la planilla F externa. Las reglas F-10/F-12/F-15 aparecen aquí según acuerdos previos y deberán cotejarse con la versión actual de esa planilla antes de especificarlas para programación.

## 5. Próximo trabajo de diseño: SP-02 — decisiones por resolver

La V9.9 dispone de **una reserva de grupo de `1 + supervivientes vivos` dados por ronda**, permite acciones que consumen dado y otras que no (por ejemplo, movimiento con límites). **Esto es BASE DE REFERENCIA**, no una aprobación de balance para un juego sin segundo grupo.

**Hipótesis inicial para nuestro singleplayer:** tres supervivientes iniciales → cuatro dados disponibles, reserva común distribuida por el líder. **Estado: PROPUESTA**, aunque se apoya en V9.9. Para no introducir restricciones artificiales sin evidencia, comparar estas cuestiones:

1. **Reserva:** mantener `1 + vivos`, ajustar un mínimo, o usar otro sistema según crecimiento de grupo/lesiones. ¿Qué ocurre con los dados ya obtenidos cuando alguien muere a mitad de ronda?
2. **Distribución:** ¿un mismo superviviente puede usar varios dados de una reserva común, siempre sujeto a elegibilidad, o existe límite por personaje? No confundir «un dado por superviviente para generar la reserva» con «un dado propiedad de cada superviviente».
3. **Requisitos:** precisar qué acciones requieren atributos/dados; cómo elegir dados en F-10; si se impide seleccionar un dado inválido y cómo se informa al jugador. No añadir un sistema de fallos pagados sin decisión expresa.
4. **Comida F-12:** cuándo se paga, si una misma acción puede usar otras mejoras y qué efectos tiene sobre la alimentación de fin de ronda.
5. **Acciones sin dado:** movimiento, uso de cartas, contribuciones, habilidades y restricciones por superviviente/turno. Mantener los riesgos reales, evitar acciones infinitas.
6. **Especialización y líder:** los tres deben tener motivos jugables para existir. Evaluar si atributos 5–6 o habilidades dominantes permiten ignorar a los otros; **no asumir bonificación gratuita por ser líder**.
7. **Efectos globales:** contrastar cuatro dados y un grupo con las crisis, el botín, las oleadas, el hambre y la dificultad **antes de ajustar parámetros**.

**Entrega SP-02:** una **ficha de reglas propuestas** con estados individuales y una **simulación de 2–3 rondas sobre papel** (grupo completo, pérdida de un personaje y recursos escasos). Aceptación solo si sus decisiones no producen un personaje dominante, callejones sin salida previsibles ni incentivos triviales; registrar lo que sigue incierto.

## 6. Diseño de ronda provisional para SP-03 (no aprobado)

1. **Apertura:** presentación de crisis, recursos, peligros e indicios válidos según el estado.
2. **Órdenes del líder:** el jugador elige superviviente, ubicación, acciones y dados; resuelve reglas de riesgo sin turnos de otro grupo humano/IA obligatorios.
3. **Encuentros:** pueden dispararse por acciones o por continuidad de historias; el Director propone eventos **permitidos por estado y condiciones**, no eventos arbitrarios.
4. **Fin de jornada:** alimentación, basura, crisis, zombis, ruido, daños, derrota/victoria conforme a reglas que SP-04 termine de equilibrar.
5. **Continuidad:** actualizar hechos, relaciones, promesas y escenas pendientes, mostrar resumen y preparar siguiente ronda.

**Pendiente:** orden exacto de disparadores, cuántas decisiones narrativas soporta una ronda, prioridades entre terminales y escenas, si el tiempo narrativo equivale a ronda/día, y cómo manejar animaciones y decisiones bloqueantes. No congelar este esquema hasta haber cerrado SP-02 y revisado SP-04.

## 7. Criterios de aceptación de la PLANIFICACIÓN antes de programar el singleplayer

- [ ] **SP-01/02:** selección/liderazgo, reparto de dados y acciones definidas; reglas ambiguas identificadas con resolución del creador y casos límite.
- [ ] **SP-03/04:** una ronda completa describible y simulable; escenarios de crisis, alimentación, dos personajes y muerte/sucesión sin bloqueo.
- [ ] **SP-05:** Director con límites explícitos, prioridad de eventos y memoria de al menos una decisión que reaparece varias rondas después.
- [ ] **SP-06:** objetivo inicial, trama indispensable, una vía alternativa y victoria/epílogo coherentes, sin depender de sorteos únicos para recursos obligatorios.
- [ ] **SP-07:** interacción y continuidad suficientemente especificadas para campañas largas; interfaz y guardado no deben quedar fuera de la arquitectura sin decisión.
- [ ] **SP-08:** plan de prototipo pequeño, escenarios de aceptación, métricas de experiencia y riesgos definidos.
- [ ] **Puerta técnica separada:** D1/D2 terminadas, probadas y aceptadas; referencia preservada por decisión expresa. **La planificación puede estar lista antes; el código propio no comienza antes de esa puerta.**

## 8. Riesgos que revisaremos siempre

| Riesgo | Señal de alerta | Cómo lo abordamos |
| --- | --- | --- |
| Un superviviente hace todo | La mayoría de dados van siempre al personaje con mejor atributo | Examinar roles/ubicaciones/habilidades antes de imponer topes artificiales. |
| Eliminar IA vuelve imposible sobrevivir | Hambre, crisis y zombis crecen como si existieran dos reservas de acciones | Simular economía con un solo grupo, **no aplicar divisiones por dos automáticas**. |
| Director tramposo | Genera daños o cambia reglas sin causa/pistas/contramedidas | Eventos con precondiciones y efectos verificables en motor compartido. |
| Exceso narrativo | Más interrupciones que decisiones tácticas | Regular frecuencia, priorizar consecuencias importantes, usar resúmenes y encuentros breves. |
| Historias que se olvidan | Una ruta depende de volver a sacar aleatoriamente la misma carta | Estado persistente y agenda de consecuencias con contingencias. |
| Campaña bloqueada | Muere un personaje clave o una muestra solo se obtiene por azar | Alternativas y requisitos mecánico-narrativos establecidos al comienzo. |
| Arquitectura prematura | Pedir a Codex construir el Director durante D1/D2 | D preserva comportamiento; la especificación de SP solo comunica restricciones futuras. |

## 9. Método de trabajo y actualización

**Un bloque de diseño a la vez:** describir regla actual → objetivo de experiencia → dos alternativas cuando exista una disyuntiva → riesgos y efectos sistémicos → escena/ejemplo de prueba → **decisión explícita** → actualizar este documento y [tablero 18](18-tablero-operativo.md). Seguir el [protocolo crítico 15](15-protocolo-revision-critica.md); no aprobar por entusiasmo o por un ejemplo aislado.

- **Siguiente tarea de DISEÑO:** **SP-02**, concretamente la reserva común y asignación de dados entre supervivientes; continuar donde terminó la conversación, sin reabrir la identidad del líder ni F-14.
- **Siguiente tarea TÉCNICA:** **D1.2a** (PoC reversible con esbuild, pendiente de autorización), seguida de D1/D2 conservadores. El trabajo de diseño **no cambia** esta prioridad.
- **Siguiente documentación cuando se cierre un bloque:** actualizar su estado, las decisiones/fuentes, escenarios de aceptación y la única siguiente tarea de diseño. Los ejemplos que no obtengan aprobación siguen como propuestas.
- **No ejecutado:** ninguna especificación SP está implementada en la V9.9, no se creó rama de producto, no se cambió `main`, el catálogo, reglas, tests ni planilla XLSX por esta hoja de ruta.

## 10. Documentos relacionados

- [01 — Plan general y etapas técnicas](01-plan-refactorizacion.md)
- [12 — Visión narrativa y Director](12-vision-narrativa-persistente.md)
- [14 — Campañas y epílogos](14-objetivos-campanas-epilogos.md)
- [15 — Protocolo de revisión crítica](15-protocolo-revision-critica.md)
- [16 — Progresión narrativo-mecánica](16-progresion-narrativa-mecanica.md)
- [17 — Mapa piloto «Encontrar la cura»](17-mapa-campana-encontrar-cura.md)
- [18 — Tablero técnico operativo](18-tablero-operativo.md)
- [49 — Comparación oficial de V9.9 con el reglamento](49-c15-auditoria-final.md)
- [51 — Rumbo singleplayer y F-14](51-rumbo-fidelidad-e-identidad.md)
- [61 — Matriz F exclusiva del juego propio](61-alcance-matriz-f-juego-propio.md)
- [62 — Ruta de preservación de la referencia](62-hitos-referencia-fiel-y-juego-propio.md)
