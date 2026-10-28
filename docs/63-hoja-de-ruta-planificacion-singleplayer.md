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
| **SP-02** | **Economía de acciones, dados y atributos** | **REPARTO ACORDADO; balance y detalles PENDIENTES** | El líder elige qué dado usar y qué superviviente ejecuta cada acción según atributos, pasivas, ubicación y necesidad; diseñar roles complementarios, reserva, acciones con/sin dado, comida, muerte y balance; vincular F-10/F-12/F-15. |
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
| **SP-02 / asignación** | **El jugador personifica al líder y decide libremente qué dado de la reserva emplear, con cuál de sus supervivientes y para qué acción elegible, atendiendo a sus stats, pasivas y necesidades.** La diversidad de especializaciones (movilidad, búsqueda, ataque, etc.) debería incentivar repartir tareas con sentido, no por obligación. | Acuerdo de control y filosofía de especialización; **no significa que el balance ya esté demostrado**. No se acordó un límite fijo de dados por personaje ni una bonificación automática para el líder. |
| **SP-02 / F-10** | Para el **juego propio**, el dado expresa dificultad y el atributo de la acción debe ser **mayor o igual** al valor del dado para poder usarlo. | Atributos, probabilidades y operaciones de UI pendientes de validación; no modificar V9.9. |
| **SP-02 / F-12** | Consumir **una comida** permite **+1 al atributo para una acción**, con tope 6 y sin acumulación. | Analizar costo, disponibilidad, momentos de decisión y consecuencias sobre hambre/colonia. |
| **SP-02 / F-15** | Atributos altos significan mayor capacidad; se propuso la traducción **`nuevo = 7 - valor antiguo`**. | Validar el catálogo concreto, casos límite y balance antes de codificar; no dar por probada la conversión. |
| **SP-06 / campaña** | La carta/objetivo elegido al inicio fija la campaña y requisitos de victoria; completar el objetivo **sí es ganar**. El epílogo depende de decisiones y estado del mundo. | No sustituir objetivos a mitad de partida ni anular una victoria por un epílogo amargo. [14](14-objetivos-campanas-epilogos.md), [16](16-progresion-narrativa-mecanica.md). |
| **SP-05/06 / persistencia** | Consecuencias diferidas con causalidad reconocible, decisiones grises, historias vinculadas e independientes. | Evitar escenas con personajes muertos y rutas bloqueadas sin alternativas; campañas cortas o largas según contenido. [12](12-vision-narrativa-persistente.md), [17](17-mapa-campana-encontrar-cura.md). |

**Importante:** los IDs SP-xx son **bloques de planificación**; los IDs F-xx son **filas de la matriz de diseño propio**. No reemplazar ni dar por cerrada la planilla F externa. Las reglas F-10/F-12/F-15 aparecen aquí según acuerdos previos y deberán cotejarse con la versión actual de esa planilla antes de especificarlas para programación.

## 5. Próximo trabajo de diseño: SP-02 — decisiones por resolver

La V9.9 dispone de **una reserva de grupo de `1 + supervivientes vivos` dados por ronda**, permite acciones que consumen dado y otras que no (por ejemplo, movimiento con límites). **Esto es BASE DE REFERENCIA**, no una aprobación de balance para un juego sin segundo grupo.

**ACUERDO de dirección táctica:** el jugador **personifica al líder**, decide **a qué superviviente asignar cada dado y en qué acción utilizarlo** según las necesidades, atributos y pasivas individuales. Se busca que las diferencias de especialización (movilidad, búsqueda, combate, etc.) proporcionen razones reales para alternar personajes. No se busca imponer un reparto de dados idéntico por personaje. **No se ha acordado un tope específico de dados por personaje**, ni demostrado todavía que la especialización baste por sí sola para evitar estrategias dominantes.

**Hipótesis numérica todavía pendiente:** tres supervivientes iniciales → cuatro dados disponibles según la referencia `1 + vivos`; reserva compartida y asignación decidida por el líder **sí encajan con el acuerdo**, pero la cantidad de dados y el equilibrio siguen como **PROPUESTA**. Pendientes para validar:

1. **Reserva:** mantener `1 + vivos`, ajustar un mínimo, o usar otro sistema según crecimiento de grupo/lesiones. ¿Qué ocurre con los dados ya obtenidos cuando alguien muere a mitad de ronda?
2. **Distribución / especialización:** ya acordado que **el líder elige el personaje y la acción de cada dado** y que los supervivientes ofrecen **stats y pasivas diferentes**. Evaluar si un mismo superviviente puede consumir todos los dados en casos especiales o si ciertos límites surgen **de las acciones/ubicación/condiciones**, sin imponer topes arbitrarios; comprobar que existen incentivos verdaderos para usar otros personajes. No confundir «un dado por superviviente para generar la reserva» con «un dado propiedad de cada superviviente».
3. **Requisitos:** precisar qué acciones requieren atributos/dados; cómo elegir dados en F-10; si se impide seleccionar un dado inválido y cómo se informa al jugador. No añadir un sistema de fallos pagados sin decisión expresa.
4. **Comida F-12:** cuándo se paga, si una misma acción puede usar otras mejoras y qué efectos tiene sobre la alimentación de fin de ronda.
5. **Acciones sin dado:** movimiento, uso de cartas, contribuciones, habilidades y restricciones por superviviente/turno. Mantener los riesgos reales, evitar acciones infinitas.
6. **Especialización y líder:** diferenciar **stats** (probabilidades o elegibilidad) de **pasivas** (ventajas situacionales como movilidad, búsqueda, ataque, riesgo, eficiencia o apoyo), procurando que cada personaje aporte valor según el contexto y que ningún personaje sea sistemáticamente mejor en todo. Evaluar si atributos 5–6 o pasivas dominantes permiten ignorar a otros; **no asumir bonificación gratuita por ser líder**.
7. **Efectos globales:** contrastar cuatro dados y un grupo con las crisis, el botín, las oleadas, el hambre y la dificultad **antes de ajustar parámetros**.

**Entrega SP-02:** una **ficha de reglas propuestas** con estados individuales y una **simulación de 2–3 rondas sobre papel** (grupo completo, pérdida de un personaje y recursos escasos). Comparar al menos tres situaciones: búsqueda urgente, combate/defensa urgente y expedición con movilidad; registrar qué personaje recibe cada dado y por qué. Si todos los dados van repetidamente al mismo personaje, primero examinar especialización, ubicación, riesgo y diseño de acciones; **no introducir un tope automático sin evidencia**. Aceptación solo si las opciones presentan costos reales, sin personajes universalmente dominantes, callejones sin salida previsibles ni incentivos triviales.

## 5A. Análisis de especialización y pasivas (28/10/2026) — PROPUESTAS, NO ACUERDOS NUEVOS

**Pregunta:** ¿cómo conseguir que el jugador, como líder, encuentre motivos reales para utilizar distintos supervivientes y no concentre todos los dados en una única persona? El **reparto libre basado en stats y pasivas** ya está acordado; el equilibrio **no**.

### Punto de partida comprobado en V9.9

El catálogo en `src/invierno.template.html` define **ataque, búsqueda, influencia y una habilidad particular**; no tiene todavía atributos numéricos independientes de movilidad/técnica. Ejemplos concretos:

- **Iris:** búsqueda favorable en la escala actual + habilidad `scout` que roba dos objetos y permite elegir uno.
- **Damián:** ataque favorable + habilidad `fighter` que reduce el requisito de ataque.
- **Mara:** habilidad `medic` que cura una herida en la localidad una vez por ronda, **sin dado**.
- **Valeria:** habilidad `silent` que evita exposición en su primer movimiento de ronda.
- **Leo:** habilidad `builder` que construye una barricada sin dado.
- **Tomás:** `cook` reduce el consumo de comida si está en la colonia.

Las pasivas actuales cubren combate/búsqueda, mitigación de riesgo, acciones gratuitas, efectos sobre recursos y ventajas por ubicación. No afirmar que el futuro sistema de stats de movilidad o técnica ya exista.

### Marco de evaluación

**Estadística:** elegibilidad o capacidad cuantificada en una familia de acciones. **Pasiva:** excepción o ventaja contextual (calidad del resultado, riesgo, ahorro, posición, acción adicional), con condición y frecuencia explícitas. **Equipamiento:** beneficios de objetos existentes. **Situación:** ubicación, heridas, crisis, mazos y amenazas. Deben influir conjuntamente en la decisión de asignar dados.

**Alternativa A, mínima:** conservar principalmente stats de combate/búsqueda, influencia y pasivas variadas; movilidad, apoyo, sanación, cocina y construcción se diferencian al principio por reglas y habilidades contextuales. **Beneficio:** menos complejidad y más reutilización de V9.9. **Riesgo:** algunas tareas no tienen progresión numérica y ciertas pasivas quedan muy potentes.

**Alternativa B, ampliada:** añadir atributos de movilidad/técnica/resistencia y nuevas acciones o comprobaciones. **Beneficio:** más perfiles y progresión. **Riesgo:** si no crean decisiones reales, son números decorativos; añaden reglas, interfaces y balance, alteran el motor y pueden solaparse con pasivas. **Recomendación del análisis, NO aprobada:** probar primero A, introducir cada atributo nuevo solo cuando tenga efecto autónomo comprobable.

**Tipos posibles de pasivas:** (1) mejorar éxito/umbral; (2) mejorar calidad del resultado; (3) ahorrar recursos o dados; (4) reducir riesgos; (5) aportar ventajas posicionales/de cooperación; (6) transformar opciones de encuentros. Cada habilidad debe tener desencadenante, alcance, costo/límite y casos extremos. Pasivas que potencian una estadística ya máxima (Iris/Damián) requieren pruebas de dominancia y saturación.

**F-10/F-15, observación matemática crítica:** con umbral antiguo `t`, superar un d6 exige `d >= t`; tras convertir `stat = 7-t`, el sistema acordado F-10 (`stat >= d`) **conserva la cantidad de caras favorables en un dado uniforme** pero convierte las caras **altas en difíciles**. Ejemplo: antiguo `t=2` y nuevo `stat=5` dan éxito en 5/6 caras, pero con números opuestos. Una alternativa intuitiva a comparar, **sin sustituir F-10 salvo acuerdo explícito**, es `stat + d >= 7` (alto stat y alto dado son beneficiosos, misma probabilidad básica). La economía de reserva visible y asignación libre altera estrategias aunque coincidan probabilidades marginales.

**Qué evita «spam» sin topes artificiales:** distintos objetivos simultáneos, distancias/localidades, límites de movimiento y de objetivos disponibles, riesgo/exposición, salud, inventario/equipo, ventajas especializadas y habilidades limitadas por ronda. Un turno de emergencia concentrado en un personaje puede ser correcto; la señal problemática es **monopolio sistemático en escenarios variados**.

**Escenarios mínimos de validación en papel:** (A) escasez de medicamentos y búsqueda, (B) defensa y barricadas ante oleada, (C) expedición con movilidad/riesgo y crisis de recursos, (D) pérdida de un superviviente / sucesión, (E) cinco candidatos donde el jugador elige una combinación sin especialista obvio. Para cada dado anotar personaje, acción, beneficio, recurso/costo, alternativas rechazadas y razón del reparto. Verificar que todos los roles aporten en situaciones diferentes y que elegir tres entre cinco no cause derrotas inevitables. No exigir participación igualitaria en cada ronda.

**Decisiones aún abiertas:** número de stats activas; cómo opera movilidad sin consumir dado; nivel de pasivas (inherente, equipada, limitada); progresión y equipo; qué hace la influencia del líder sin restringir la agencia del jugador; elección entre F-10 original y alternativa solo si el creador desea reexaminarla; fórmula/cantidad de dados y límites por personaje. **No programar durante D1/D2.**

## 5B. Tercera estadística con peso equivalente — hipótesis de diseño (28/10/2026)

**Planteamiento del creador:** explorar **exactamente una tercera estadística**, porque ampliaría las posibilidades tácticas, **solo si resulta consistente con la supervivencia y comparable en importancia a ataque y búsqueda**. **NO se aprobó aún un nombre, una acción nueva, ni el cambio del catálogo.** No interpretar el interés como decisión cerrada.

**Criterio fundamental:** una estadística debe abrir una **familia de decisiones activas frecuentes y relevantes** donde compita por los mismos dados de acción. Un atributo que solamente reduce daño, modifica movimiento gratuito o sirve para una escena ocasional puede resultar importante temáticamente, pero no necesariamente está a la altura táctica de ataque/búsqueda.

### Comparación crítica de candidatas

| Candidata | Justificación | Obstáculo de diseño |
| --- | --- | --- |
| **Movilidad** | Rutas, riesgos y traslados; importancia temática constante | Moverse actualmente no gasta dado, máximo una vez por turno; para que compita en la economía de dados habría que rediseñar movimientos y evitar un impuesto por desplazarse. |
| **Resistencia** | Exposición, heridas, frío y cansancio | Tiende a funcionar como defensa pasiva o chequeo de daño; no ofrece por sí sola un uso recurrente de dados que el jugador elija. |
| **Técnica** | Barricadas, reparaciones, herramientas y tareas de campo | Si se aplica solo a dos acciones poco frecuentes puede resultar secundaria; no convertir curación, gestión de personas y exploración en actividades «técnicas» arbitrariamente. |
| **Apoyo / Oficio / Operaciones (nombres de trabajo)** | Tercera función económica: sostener/preparar la colonia, resolver problemas materiales y transformar recursos en capacidad futura | Riesgo de atributo comodín demasiado amplio; exige delimitar acciones y profesiones coherentemente. |

**Hipótesis preferida para estudiar, no para adoptar automáticamente:** tres pilares **combate (afrontar amenazas), búsqueda (obtener recursos) y operaciones/oficio (fortificar, mantener, reparar, preparar)**. Los nombres son provisionales; buscar una denominación diegética consistente antes de implementar.

**Hechos V9.9 relevantes:** `search()` y `attack()` consumen dados con umbral basado en atributo; `barricade()`, `clean()` y `attract()` gastan **cualquier dado** (`consume(1)`), sin umbral propio; movimiento es gratis en dados con límite/riesgo; curación de Mara puede ser gratis una vez por ronda; crisis recibe objetos sin exigir una tercera estadística. **Introducir un nuevo umbral obligatorio para estas tareas cambia las reglas y puede aumentar injustamente la dificultad:** no hacerlo en D1/D2 y, si se propone para el juego propio, prever acceso básico aun sin especialistas.

### Prueba conceptual antes de aprobación

- **Tres usos realmente diferentes y recurrentes:** (i) fortificar/barricadas (acción existente); (ii) mantenimiento del refugio/limpieza y mitigación de consecuencias (acción existente con efecto a reconsiderar); (iii) manipular o reparar infraestructura, dispositivos y obstáculos de una misión (funcionalidad **futura**, NO existente como familia general). Una habilidad médica específica no se convierte automáticamente en prueba genérica de «técnica».
- **Nivel básico accesible:** evaluar permitir una acción de mantenimiento básica con cualquier dado, mientras la estadística determina variantes avanzadas, eficiencia o condiciones especiales. Es solo alternativa para evitar cierres injustos y debe evaluarse con F-10 y pasivas existentes.
- **Costo de oportunidad real:** en una ronda con cuatro dados, evaluar decisiones `dos búsquedas + un ataque + una operación` frente a `una búsqueda + dos ataques + una operación` u otras distribuciones. Ninguna familia debería ser obligación fija de «un dado por ronda».
- **Profundidad entre personajes:** los tres personajes seleccionados entre cinco pueden cubrir necesidades de manera distinta; personajes sin especialización en operaciones aún deben tener caminos viables para mantener la colonia.
- **Antisolapamiento:** distinguir tercer atributo de las pasivas de constructor, médico, cocinero, explorador y equipo; evitar que sea una «estadística para todo» y que transforme en inútiles las habilidades existentes.
- **Paridad de importancia, no de uso idéntico:** una familia pasa la prueba si hay decisiones significativas de invertir dados en ella en distintos tipos de ronda, con consecuencias visibles y alternativas. Medir mediante partidas de papel con distintos grupos/amenazas; no inferir paridad solo de que tenga tres acciones nominales.

**Siguiente microdecisión de SP-02.1:** formular un catálogo de **3–5 acciones concretas de la tercera familia**, distinguiendo acciones existentes de nuevas, su frecuencia, costo en dados, requisito y resultados, para decidir si merece una estadística independiente. Comparar entonces «Técnica» (especialización más estrecha) con «Oficio/Operaciones» (sostén de colonia) y descartarlas si ninguna supera el criterio. Esta conversación **no autorizó** implementar ni cambiar F-10/F-12/F-15.

## 5C. Alternativa de sistema de dados: pruebas por atributo estilo *Arkham Horror* (28/10/2026) — EN EVALUACIÓN

**Aporte del creador:** puede que la limitación para ampliar las estadísticas no sea la cantidad de atributos, sino el **mecanismo de dados** heredado de *Dead of Winter*. Referencia conceptual: tiradas por capacidad del investigador, donde un atributo 3 permite lanzar tres dados y se cuentan éxitos; distintos umbrales y resultados pueden producir éxito parcial, completo o complicaciones. **No es aprobación de un cambio de motor ni de F-10.**

**Distinción crítica:**
- **Economía de acciones:** cuántas órdenes o intentos puede realizar el líder en una ronda; en V9.9 esta cantidad está atada a la reserva de dados compartida.
- **Resolución de acciones:** tirada nueva asociada al atributo del personaje para determinar resultado, grados de éxito y consecuencias. Un sistema `dice pool` puede separar esta resolución del recurso de acciones.

**Referencia mecánica verificada (juego de mesa Arkham Horror, no el LCG):** atributo + modificadores determina cantidad de d6; habitualmente un 5 o 6 cuenta como éxito; las pruebas pueden exigir al menos un éxito y algunos efectos dependen del número total de éxitos. Ejemplos explicativos ajenos a la identidad narrativa de nuestro producto. Fuente de consulta: https://zatu.com/en-us/blogs/how-to-play/how-to-play-arkham-horror-third-edition; https://github.com/Lehi-Innovation/boardgame-rules/blob/main/rules/arkham-horror-third-edition.md.

### Tres alternativas que debemos comparar en la MISMA situación jugable

| Modelo | Recurso que administra el líder | Resolución | A favor | Riesgo |
| --- | --- | --- | --- | --- |
| **M1 — V9.9 / F-10** | Dados con valores conocidos de la ronda | Asigna un dado válido a una acción según atributo, sin nueva tirada | Planificación visible, continuidad de motor | Limita familias de atributos y variedad de efectos; los dados altos de F-10 son difíciles |
| **M2 — Reserva de acciones + pruebas por atributo** | Un número de acciones/órdenes (cantidad y titularidad **a definir**) | Cada acción elegible tira tantos d6 como su atributo; cuentan los 5/6 | Permite especialización, dificultades variables, grados de resultado y encuentros con pruebas | Más azar y tiradas; perder una acción por fallo puede frustrar; requiere nuevo balance |
| **M3 — Híbrido** | Retiene reserva de dados/acciones; algunas acciones o escenas hacen tiradas por atributo | Mecanismos mixtos según contexto | Migración gradual, menos cambios inmediatos | Dos reglas de dado distintas pueden confundir; oportunidades de dados duplicados/bonos apilados |

**Hipótesis ilustrativa de M2, NO aprobada:** con 3 supervivientes, el líder dispone de **cuatro órdenes de acción por ronda** (referencia conceptual `1 + vivos`, no balance confirmado). Decide el actor y la orden; se descuenta una orden; el personaje con **técnica 3** tira **3d6**, y los 5/6 aportan un éxito cada uno. Movimiento y habilidades sin acción deben ser objeto de regla separada; no suponer que mover y tirar siempre son gratuitos. Los resultados `0/1/2+` pueden determinar fallo con consecuencia, logro parcial, logro amplio o bonificación dependiendo de la acción; **no todos los 0 fallos deben bloquear una campaña**.

### Probabilidades para discutir balance (d6 independientes; éxito en 5–6; p = 1/3 por dado)

| Atributo = dados | P(al menos 1 éxito) | P(al menos 2 éxitos) |
| --- | ---: | ---: |
| 2 | 55,6 % | 11,1 % |
| 3 | 70,4 % | 25,9 % |
| 4 | 80,2 % | 40,7 % |
| 5 | 86,8 % | 53,9 % |

**Advertencia de experiencia:** si una investigación imprescindible exige **dos** éxitos y el mejor personaje tiene atributo 3, el éxito inmediato ocurre solo ~26 % de las veces; repetir intentos consumiría muchas acciones y podría romper el ritmo. Los requisitos y grados de éxito deberán comunicarse, permitir preparación, apoyo, herramientas, rutas alternativas o progreso parcial según contexto.

### Qué cambia frente a F-10, F-12, F-15 y SP-02.1

- **F-10** (`atributo >= dado`): se convertiría en una regla diferente; **queda vigente hasta decisión explícita de reemplazo**, no se reinterpreta automáticamente.
- **F-12** (comida +1 a un atributo para una acción): en el nuevo modelo pasaría a añadir **un dado a la reserva de la prueba** o a cambiar la calidad del resultado, según decisión; analizar costo y escala de hambre, no trasladar sin evaluar.
- **F-15** (`nuevo = 7 - antiguo`): inversión de números **no produce balance equivalente** al cambiar a probabilidades de 1+ o 2+ éxitos con reservas nuevas; se necesita calibración, no una conversión automática.
- **Tercera estadística:** el pool permite probar `combate / búsqueda / operaciones` como tres familias de pruebas, o considerar otras capacidades usadas en encuentros; **no garantiza** por sí solo que cada una sea igual de relevante. Medir frecuencia de acciones y consecuencias de cada una.
- **Pasivas/equipo:** podrían otorgar un dado adicional, permitir repetir, convertir un resultado o modificar consecuencias; cuidado con acumular bonificaciones que anulen el riesgo.
- **Director narrativo:** una encrucijada puede contener pruebas con resultados diferenciados, pero debe respetar la decisión del jugador y no transformar toda historia en una ruleta.

### Evaluación requerida ANTES de decidir

**Prueba de diseño A/B/C:** simular las **mismas 2–3 rondas**, mismo grupo, cuatro acciones ilustrativas, misma crisis y mismos eventos, usando M1, M2 y M3. Registrar: variedad de asignación de personajes, número de decisiones interesantes, frecuencia de fallos frustrantes, costo de resolver crisis, cantidad de tiradas por ronda, comprensión en móvil y capacidad de sostener historias con consecuencias diferenciadas. Evitar aprobar un sistema por intuición o por una única escena vistosa.

**Siguiente discusión concreta:** ¿queremos que el azar suceda **principalmente antes de asignar dados** (estrategia de combinarlos) o **al ejecutar la acción** (tirada por competencia y riesgo)? Una vez aclarado, definir economía de acciones independiente, fracaso y éxitos escalonados. No autorizar implementación ni cerrar el modelo todavía.

## 5D. Propuesta concreta del creador: órdenes por superviviente + tiradas por atributo y exposición integrada (28/10/2026) — EN ANÁLISIS

**Visión propuesta, NO aprobada como regla final:** dejar de tirar dados de acción al comenzar cada ronda. El **número de acciones de grupo** disponibles por ronda sería igual al **número de supervivientes bajo el mando del líder** (ejemplo: tres supervivientes → **tres acciones**); el líder elige qué personaje ejecuta cada orden, sin propiedad obligatoria de una orden por personaje. Las acciones importantes (movimiento, búsqueda, combate y potencialmente tareas técnicas) se resuelven mediante **tantos d6 como el valor de la estadística** pertinente. Un resultado puede producir **grados de éxito, avance con costo o consecuencias**, en vez de una mera elegibilidad por un dado inicial. Esta propuesta **reemplazaría**, si se aprueba, las hipótesis de cuatro dados/órdenes y el umbral F-10; hasta decisión expresa, no modifica V9.9 ni acuerdos de la matriz F.

**Ejemplo exacto aportado por el creador:** `Mara: Movilidad 5`, viaja al hospital y tira **5d6**. Con **dos o más éxitos llega sin exposición**; con **un éxito llega y tira el dado de exposición**; con **cero éxitos llega con una herida**. Es una **ilustración de intención**, no una tabla adoptada para todos los desplazamientos. Bajo la hipótesis de éxitos en 5–6 en d6, se obtendría:

| Movilidad / dados | 0 éxitos | 1 éxito | 2+ éxitos |
| --- | ---: | ---: | ---: |
| 1 | 66,7 % | 33,3 % | 0,0 % |
| 2 | 44,4 % | 44,4 % | 11,1 % |
| 3 | 29,6 % | 44,4 % | 25,9 % |
| 4 | 19,8 % | 39,5 % | 40,7 % |
| 5 | 13,2 % | 32,9 % | 53,9 % |
| 6 | 8,8 % | 26,3 % | 64,9 % |

**Deducciones críticas:**

1. **Paradoja de gravedad:** `1 éxito` aún puede causar una mordedura letal en la tirada de exposición, mientras `0 éxitos` garantiza solo una herida; así **un resultado mejor puede terminar siendo peor**. Si buscamos consecuencias estrictamente escalonadas, definir un resultado de riesgo que no sea potencialmente peor que el fracaso, o diferenciar riesgo narrativo y gravedad final.
2. **Movilidad baja / bloqueo práctico:** con movilidad 1 nunca alcanzaría dos éxitos y tendría 66,7 % de recibir una herida al moverse. Si desplazarse es frecuente, esto perjudica brutalmente a personajes no especializados, especialmente con heridas acumulables y muerte. Evaluar escalas, dados mínimos/bonos, dificultad por ruta, consecuencias no siempre físicas y opciones de preparación.
3. **Tirar dos veces vs reemplazar exposición:** el ejemplo conserva la **tirada de exposición cuando hay un éxito**. Una versión de **resolución única** asignaría consecuencias directamente a la primera tirada y evitaría otra capa azarosa; ambas necesitan pruebas y aprobación explícita.
4. **Tres acciones y movimiento:** si moverse **consume una** de las tres órdenes de grupo, ida al hospital + búsqueda + regreso gastaría todas las acciones del equipo, sin combate/defensa ese día. Si el traslado es **una acción posicional separada** (por ejemplo, cada superviviente se puede mover una vez por ronda), la prueba de Movilidad aún determina peligro, pero no compite con las tres órdenes. **Separar siempre “requiere una prueba” de “consume orden de acción”**; resolver este punto antes de balancear.
5. **Crecimiento y muertes:** una acción por superviviente activo crea incentivo fuerte para reclutar y una posible espiral tras perder personajes (tres → dos → uno). Definir si cuenta **equipo activo, personajes vivos totales o habitantes de la colonia**; límites/capacidad, sucesión, incorporación y recuperación. No asumir que civiles/indefensos aportan acciones.
6. **Fallos que avanzan:** llegar al hospital a pesar de un resultado bajo es un modo potente de sostener la narrativa. No convertir automáticamente todo fracaso en una herida inevitable ni otorgar recompensas completas sin coste.
7. **Significado de atributo alto:** bajo el sistema de reservas por habilidad, `Movilidad` podría ser un tercer atributo principal tan relevante como Combate y Búsqueda, si los desplazamientos/riesgos ocurren regularmente. Reabrir la comparación con `Operaciones` como tercera estadística; **no crear automáticamente cuatro o más** hasta medir frecuencia y valor.
8. **La mecánica de tiradas y el balance deben diseñarse juntos:** si ya no hay dados de ronda, F-10 (elegibilidad dado <= stat), F-12 (comida para +1) y F-15 (conversión de stats) necesitan **revisión explícita y calibración**, no migración silenciosa. En particular, +1 de atributo en una tirada de éxito 5–6 implica **un dado adicional**, que no es equivalente a la mejora previa.
9. **Pasivas y equipo:** deberían distinguir resultados, riesgos y capacidades; evitar que una pasiva de inmunidad de exposición convierta automáticamente la Movilidad en irrelevante o que un solo especialista monopolice todas las acciones.

**Tres modelos a contrastar antes de aprobar:**

- **T1 — Movilidad consume acción de grupo:** tres órdenes para todas las acciones importantes, incluidos los movimientos. La tensión será intensa, pero puede penalizar cualquier expedición.
- **T2 — Movilidad probada, sin consumir orden de grupo:** cada superviviente tiene un movimiento posicional limitado, sujeto a prueba; las tres órdenes del grupo pagan búsquedas, combates y otras acciones. Conserva una diferencia heredada de V9.9 entre movimiento y actividad, pero cambia su riesgo.
- **T3 — Acciones compuestas:** mover y realizar una actividad en un mismo comando, con reglas claras para riesgo y alcance; añade complejidad y puede beneficiar demasiado a especialistas.

**Entrega siguiente de SP-02:** simular **una ronda con tres supervivientes y tres órdenes** bajo T1 y T2 usando los mismos personajes, dados hipotéticos, amenazas, búsqueda y comida; comparar costo de desplazarse, diversidad de acciones, probabilidad de daño, agencia del líder, heridas acumuladas y resiliencia si uno muere. Solo después decidir si el sistema de órdenes y dados por stat reemplaza F-10 y qué atributos justifican ser centrales.

## 5E. Evaluación de conveniencia del sistema por tiradas frente a V9.9 (28/10/2026) — JUICIO PROVISIONAL

**Alcance solicitado por el creador:** comparar **si el mecanismo nuevo mejora la experiencia de juego**, dejando para después balance por situaciones, umbrales concretos, costos de movimiento y tablas de daño. No cambiar de tema hacia consecuencias particulares de exposición.

### Qué experiencia produce cada diseño

| Eje | V9.9 real: dados de acción revelados al comenzar | Hipótesis nueva: órdenes según supervivientes + tirada por atributo |
| --- | --- | --- |
| Decisión predominante | Optimizar la reserva de valores visibles según umbrales y capacidades; elegir uso de cada dado | Priorizar objetivos, elegir actor y asumir incertidumbre sobre el resultado |
| Agencia | Buena previsibilidad de acciones legales una vez obtenido un dado válido; aún hay azar en exposición, cartas y eventos | Mayor expresión de competencias, pero menos garantía de resultado; exige control real sobre preparación, recursos y riesgos |
| Identidad de personajes | Umbrales de combate/búsqueda, ubicación, equipo y habilidades especiales | Los atributos modulan directamente las probabilidades y grados de resultado, además de pasivas y equipo |
| Economía/escasez | Dados iniciales limitados y dependientes de vivos: `1 + supervivientes` por equipo | Órdenes limitadas, propuestas como `supervivientes activos`; acción fallida también podría consumir orden |
| Ritmo | Planificación de dados iniciales seguida de acciones; resolución relativamente directa | Más tiradas/feedback durante la ronda; riesgo de ralentizar y frustrar si cada intento dispara un minijuego |
| Narrativa | Encrucijadas existentes y efectos, con azar localizado | Pruebas integradas en encuentros, resultados matizados y consecuencias; la elección moral sigue siendo del jugador |
| Riesgo de diseño | Rompecabezas de asignación puede dominar la caracterización de supervivientes | El azar puede dominar la planificación, los personajes óptimos pueden monopolizar intentos y los fallos pueden sentirse como turnos vacíos |
| Coste de implementación futura | Menor al conservar V9.9 | Alto: implica sustituir resolución, acciones/economía, exposición y rebalancear habilidades, progresión y campañas |

**Evaluación independiente:** para el **juego propio centrado en singleplayer y Director de Juego**, la segunda opción es la **hipótesis preferente de exploración**, no una mejora demostrada ni una mecánica autorizada. Su ventaja real es que las capacidades personales y los acontecimientos pueden afectar la misma resolución, creando decisiones sobre **quién actúa y qué riesgo acepta**. No se afirma que V9.9 carezca de estrategia, agencia ni incertidumbre.

### Condiciones para que la nueva opción resulte efectivamente mejor

1. **La decisión pesa más que el azar:** elegir al actor, la preparación, el equipo y la prioridad debe influir significativamente; no dejar al jugador con muchas rondas de resultados nulos.
2. **Las pruebas son significativas:** una tirada solo debe ocurrir cuando existe incertidumbre útil; no añadir animaciones/aleatoriedad a tareas triviales para hacer el sistema parecer profundo.
3. **El fracaso no es siempre vacío:** cuando corresponda, resultados parciales, avance con costo o información obtenida; sin convertir todo fallo en daño gratuito ni entregar siempre éxito completo.
4. **Conservar escasez y trade-offs:** la desaparición de dados de acción iniciales no debe eliminar la necesidad de priorizar; las órdenes limitadas y los recursos deben generar decisiones reales, incluso con resultados inciertos.
5. **Pasivas y equipo realmente aportan:** diferenciación contextual y no solo «un dado más» en todos los casos; evitar especialistas obligatorios para toda partida.
6. **Respeto de agencia narrativa:** las decisiones del líder son elecciones; las pruebas determinan ejecución y complicaciones dentro de reglas transparentes, no la moralidad decidida por el Director.
7. **Fácil de entender en móvil:** anunciar actor, atributo, objetivo de la prueba, resultado y consecuencia en un flujo breve; evitar cadenas de tiradas que interrumpan la partida.

### Cómo evaluar justamente sin mezclar cambios

**Advertencia de comparación causal:** V9.9 con 3 supervivientes ofrece **4 dados de acción** (`1 + vivos`) y normalmente movimiento sin gastar dado; la propuesta nueva contempla **3 órdenes** y movimiento por prueba. Cambiar simultáneamente **cantidad de órdenes + coste del movimiento + azar de resolución** invalidaría cualquier conclusión sobre cuál *sistema de dados* mejora el juego. **En la primera comparación conceptual, mantener constante el presupuesto de acciones y el costo del movimiento** para aislar únicamente la diferencia entre «dado conocido asignado» y «tirada de atributo en el momento». Luego comparar economía de 3 vs 4 acciones y movilidad en ensayos separados.

**Tres escenas para el primer experimento:** (1) escasez de comida e investigación/búsqueda, (2) defensa simultánea y atención médica, (3) decisión narrativa con una ejecución peligrosa. Usar el mismo grupo, estado, recursos y opciones. Juzgar: cantidad y calidad de decisiones previas a cada tirada, peso de pasivas/equipo, opciones tras fracaso, consistencia narrativa y cansancio de interacción. No hacen falta porcentajes ni calibración exacta para esta evaluación de conveniencia; sí deben anotarse las hipótesis.

**Decisión de trabajo propuesta:** dejar M2 (órdenes limitadas + tiradas por atributo) como **candidato principal para el futuro singleplayer**, mantener M1 como referencia de comparación y no descartar M3 prematuramente. **No implica reemplazo aprobado de F-10/F-12/F-15, ninguna estadística adicional aprobada ni ejecución de código**. La próxima conversación puede evaluar el *mismo dilema* bajo ambos sistemas sin discutir aún tablas de exposición.

## 5F. Resultado de simulación exploratoria del laboratorio SP-02 — 28/10/2026

**Encargo:** probar diferentes escenarios y evaluar **conveniencia** del nuevo método por tiradas, sin balancear definitivamente las situaciones. **Ejecución real sobre el código del laboratorio HTML**, con Node ejecutando sus funciones originales: **10.000 rondas por combinación** de 3 escenarios × 6 configuraciones × 2 sistemas (= **360.000 rondas**) y 6 variaciones de personaje × 2 sistemas × 10.000 (= **120.000** adicionales). Total **480.000**. **11/11 controles de lógica** y reproducción exacta del ensayo previo de 500 rondas. El laboratorio es una **simplificación** de V9.9: no confundirse con un test del juego completo.

### Comparación de referencia: cuatro oportunidades por sistema, movimiento sin orden y efectos básicos

| Objetivo cumplido | V9.9 simplificado | Pool por atributo |
| --- | ---: | ---: |
| Medicamentos | **81,87 %** | **71,16 %** |
| Asedio | **83,17 %** | **43,76 %** |
| Laboratorio | **81,87 %** | **61,57 %** |

**Causas plausibles observadas en el código:** el clásico usa dados iniciales para **habilitar acciones que entonces tienen efecto seguro**, mientras que el pool consume una orden aun con cero éxitos. En asedio el pool genera **0,99 intentos sin resultado por ronda** (promedio) y necesita éxitos consecutivos en ataques y barricada. En los casos de medicamentos/laboratorio se lanzan **~6 d6 por ronda en clásico contra ~23,6 en pool**; importa para UX, no es medida directa de espera o diversión.

### Sensibilidad y sesgos identificados

- **Éxitos graduales:** el pool pasa a **84,02 % medicamentos, 62,66 % asedio, 72,73 % laboratorio**; **NO** es mejora atribuible solo a recompensas: en esta configuración el prototipo **omite la exposición al combatir** para el pool mientras que el clásico la conserva, y además concede más efectos con 2+ éxitos.
- **Tres órdenes vs cuatro:** si **mover es gratis**, las metas del plan fijo dan **los mismos porcentajes** porque la cuarta orden suele estar ligada a una barricada no exigida en la meta. Este banco es insuficiente para medir el valor de la cuarta acción. Si mover **cuesta una orden** y solo hay tres, el laboratorio tiene **0 %** de cumplimiento por imposibilidad estructural del plan (traslado + dos búsquedas + ataque = cuatro acciones necesarias): no es un resultado probabilístico.
- **Especialización probada:** si **Iris / Mara / Damián** buscan dos veces, las metas de medicamentos son **81,87 / 73,81 / 33,79 %** en clásico y **71,16 / 60,71 / 27,43 %** en pool; en asedio, dos ataques de **Damián / Mara / Iris** dan **83,17 / 47,44 / 33,79 %** en clásico y **43,76 / 24,12 / 18,17 %** en pool. **Ambos sistemas** ya diferencian los personajes; no se demostró que el pool lo haga más.
- **Riesgos metodológicos:** modelo «clásico» sin catálogo de cartas, pasivas completas, crisis, ubicaciones y motor real; estadísticas del pool **inventadas para la maqueta** (incluye **cuatro atributos**, cuando el juego propio aún discute una tercera); órdenes con planes fijos y sin adaptación; exposición distinta entre sistemas, hambre sin consecuencias mecánicas, sin decisiones narrativas persistentes, sin pruebas con humanos. No usar porcentajes de victoria para «aprobar» o «rechazar» el diseño.

### Conclusión de revisión (NO aprobación del nuevo sistema)

La implementación conceptual de **órdenes limitadas + pruebas por atributo** funciona y justifica continuar explorándola **como candidata preferente del singleplayer**, no da todavía prueba de mayor profundidad/diversión. Promete ligar competencia, riesgo y grados de resultado, pero si consume órdenes en fallos sin progreso o multiplica tiradas puede **empeorar agencia y ritmo**. Conservar la estrategia de V9.9 como referencia positiva. **Siguiente prueba recomendada:** escenario con igual presupuesto/ubicaciones/exposición/pasivas/recursos, variando **solo** la mecánica de resolución; después modificar **un factor por vez** (éxitos escalonados, tres órdenes, movilidad) y realizar playtests manuales para agencia y ritmo. **F-10/F-12/F-15, D1/D2 y código sin modificaciones**.

## 5G. Resolución híbrida por tipo de acción y situación — alternativa del creador (28/10/2026, NO APROBADA)

**Propuesta del creador tras revisar el laboratorio SP-02:** valorar un motor de **acciones limitadas** que **no obliga a tirar dados siempre**. Las acciones inciertas o narrativamente riesgosas (búsqueda, movilidad, encuentros, quizá combate fuera de posiciones seguras) utilizan **reservas de dados por atributo**, permitiendo introducir más atributos que importan a la trama. Otras acciones se resuelven automáticamente o en función **determinista de los atributos/equipo y el contexto**. Ejemplo explícito propuesto: **atacar/defender en la colonia sin tirada**, usando estadísticas del PJ. Motivo: disminuir fallos vacíos y no repetir la desventaja de asedio del primer prototipo. **Se acepta como hipótesis a explorar, no como regla cerrada ni autorización de implementación.**

### Taxonomía candidata de resolución

1. **Directa:** ejecución sin azar cuando la capacidad y condiciones están claras (p. ej., limpiar o usar una medicina en un objetivo accesible); **no equivale a acción gratuita** ni a efecto ilimitado. Definir costo de orden/recurso por acción independientemente de si hay tirada.
2. **Determinista por capacidades:** umbral o resultado calculable con atributo, equipo, defensas, objetivo y estado del mundo; ejemplo: **defender una entrada preparada de la colonia**, cuyo resultado puede conocerse de antemano; consume recursos u orden, y las amenazas se mantienen por presión, cantidad, desgaste, municiones, brechas y consecuencias del turno.
3. **Prueba por atributo:** lanzar dados proporcionales al atributo si hay incertidumbre material y consecuencias relevantes (p. ej., buscar, cruzar un lugar peligroso, escapar o enfrentarse fuera de cobertura). Los éxitos crean resultados y costos diferenciados; **no convertir todo fallo en turno vacío**.

**Regla central a validar:** el tipo de resolución se decide por **la ficción y condiciones objetivas de la situación** (control del lugar, preparación, intensidad de amenaza, objetivo), **no arbitrariamente para que un resultado estadístico parezca mejor**. Caso importante: **una colonia defendida/preparada puede permitir resolución determinista; una colonia invadida o con defensas rotas puede exigir prueba**. Evitar el exploit de «dejar entrar zombis para matarlos siempre sin riesgo». En caso de ataque sin tirada, la estadística de combate debe tener una función explícita (eficacia, capacidad, tácticas habilitadas), no quedar decorativa.

**Hallazgo del primer laboratorio:** la diferencia en asedio (modelo V9 simplificado ~83,17 % vs pool básico ~43,76 %) se obtiene en simuladores **no equivalentes** y con planes fijos; **no prueba por sí sola que el combate por tirada sea defectuoso**. Ponerlo determinista podría mejorar flujo, pero también elimina tensión, penalizaciones o valor de especialistas si se hace indiscriminadamente. Diseñar/hacer pruebas sin que el balance dicte cada nueva excepción.

### Comparación futura concreta — sin cerrar balance ahora

- **H1: pool total**, todas las acciones inciertas incluidas peleas en colonia gastan orden y tiran stat.
- **H2: híbrido contextual**, defender desde posiciones preparadas resuelve por stats/equipo sin tirar, búsqueda y movilidad expuesta con pool, y labores rutinarias automáticamente.
- **H3: resolución directa amplia**, menos tiradas incluso para combates externos cuando la ventaja es clara; la incertidumbre solo entra con riesgo material.

**Prueba:** mantener exactamente la **misma cantidad de acciones, amenazas, estadísticas, equipo, ubicaciones y objetivos**; medir decisiones del líder, resultados y sensación de agencia y tensión; anotar número de tiradas por ronda, fallos sin progreso, facilidad de explicación de reglas y presión efectiva de zombis. Añadir luego escenarios con colonia preparada, defensas parcialmente comprometidas y colonia invadida para comprobar coherencia. No concluir que más deterministicidad es siempre mejor.

**Estado de acuerdos anteriores:** siguen en evaluación tres órdenes por tres supervivientes, el uso de atributos como cantidad de dados y el reemplazo de exposición. F-10/F-12/F-15 y V9.9 quedan intactos hasta aprobación expresa. Tampoco se aprobó una nueva lista de estadísticas (p. ej., técnica, movilidad, combate, búsqueda).

## 5H. Experimentos del híbrido contextual: 750.000 rondas (28/10/2026)

**Encargo del creador:** reproducir las pruebas del laboratorio SP-02 incorporando **acciones sin tirada**, **defensa por competencia dentro de la colonia** y **pruebas por atributo para búsqueda, movilidad y encuentros riesgosos**. Se amplió el **laboratorio aislado**, no el motor completo V9.9. **No se aprobó ninguna regla nueva.**

**Ensayo efectuado:** **25 condiciones × 3 métodos × 10.000 repeticiones = 750.000 rondas**; **13/13 comprobaciones funcionales** aprobaron. Archivo de laboratorio: `simulador_sp02_hibrido.html`, con tercer panel interactivo (V9.9 simplificado / pool puro / híbrido), y runner reproducible `sp02_hibrido_tests.js`. Se conserva el motor base de la maqueta, con extensión localizada y corrección del error anterior que quitaba exposición al atacar con éxitos escalonados.

**Reglas de prueba, NO oficiales:** cuatro órdenes igualadas, movimiento sin gasto de orden; búsqueda y movimiento por pool (5 o 6 = éxito); limpiar y fortificar son acciones **directas que sí gastan orden**. Un superviviente con **Combate ≥4**, que **ataca desde la colonia con al menos una barricada**, elimina un zombi sin tirada ni exposición, gastando una orden; en otros contextos ataca por pool. Se comparó además la regla más permisiva de ataque sin dados desde la colonia aun sin barricada. Estas condiciones inventadas para el test NO deben trasladarse directamente al juego.

### Resultado básico: meta de la maqueta cumplida por escenario

| Objetivo | V9.9 simplificado | Pool puro | Híbrido contextual |
| --- | ---: | ---: | ---: |
| Medicamentos | **81,87 %** | **71,16 %** | **71,16 %** |
| Asedio | **83,17 %** | **43,76 %** | **62,33 %** |
| Laboratorio | **81,87 %** | **61,57 %** | **71,16 %** |

**Causalidad importante:** en el **asedio básico**, los ataques preceden a construir barricada. Por tanto, la mejora del híbrido (43,76 → 62,33 %) proviene de que **fortificar ya no puede fallar**, no de una defensa automática. En el laboratorio, Damián sí está en colonia con barricada y su ataque es determinista. Medicamentos no mejora porque se necesitan dos búsquedas y ambas siguen siendo inciertas.

**Éxitos escalonados con exposición corregida:** medicamentos **81,87 / 84,02 / 84,02 %**, asedio **83,17 / 59,35 / 84,34 %**, laboratorio **81,87 / 72,73 / 84,02 %** (orden: clásico/pool/híbrido). **Cuidado:** mejora el efecto del pool y del híbrido frente al clásico, así que no son sistemas equivalentes aunque se corrija el sesgo de exposición.

### Prueba decisiva de preparación y dominancia

| Asedio (misma meta y tres supervivientes) | V9.9 simplificado | Pool puro | Híbrido contextual |
| --- | ---: | ---: | ---: |
| **Sin barricada, atacar primero** | 83,17 % | 43,76 % | 62,33 % |
| **Sin barricada, fortificar primero** | 83,17 % | 43,93 % | **100 %** |
| **Con una barricada inicial** | 83,17 % | 62,33 % | **100 %** |
| **Fuera de la colonia** (laboratorio) | 63,78 % | 56,62 % | 56,62 % |

El **100 %** del híbrido surge porque Damián mata un zombi por orden sin riesgo ni consumo/desgaste de barricada ni munición, y la maqueta no resuelve ofensivas enemigas al final. Es **señal de sobrepotencia y falta de simulación de costos**, no validación de que el híbrido balancee automáticamente la defensa. La alternativa «en la colonia siempre, sin requerir barricada» también genera **100 %** incluso atacando primero con el refugio desprotegido: resulta todavía menos consistente.

**Variación de personajes con defensa preparada, en dos ataques:** Mara Combate 3: **57,32 / 40,75 / 40,75 %**, Iris Combate 2: **33,79 / 25,76 / 25,76 %**, Damián Combate 5: **83,17 / 62,33 / 100 %** (clásico/pool/híbrido). **Problema:** un umbral rígido de Combate ≥4 cambia el resultado de una forma drástica. El valor de la especialización es evidente, pero requerimos costos, condiciones y alternativas que no vuelvan obligatorio al combatiente alto.

**Ritmo teórico del asedio básico:** dados individuales lanzados en promedio **5,83 / 15,88 / 10,88** y acciones anotadas sin efecto **0 / 0,99 / 0,25** (clásico/pool/híbrido). Es útil como indicador de carga mecánica, **no mide diversión ni duración real**.

**Tres órdenes y movimiento:** para los objetivos actuales, tres órdenes con movimiento gratis dan las mismas tasas que cuatro (la cuarta acción no es necesaria para esos objetivos). Tres órdenes con movimiento que consume orden causan **0 % en laboratorio**, pues el plan fijo exige cuatro órdenes imprescindibles. El test **no demuestra** si tres acciones son buenas o malas.

### Dictamen y siguiente control

- El híbrido **sí es técnicamente viable** y puede reducir tiradas innecesarias y fallos vacíos, dando una ventaja tangible a la preparación.
- El híbrido **no está validado como mejor sistema**: los supuestos de defensa son demasiado poderosos, el laboratorio carece de desgaste, oleadas, equipo real, pasivas y narrativa persistente, y los planes automáticos no se adaptan.
- **No aprobar** «atacar en colonia sin tirada = enemigo eliminado sin costo». Probar **defensa determinista con costo o límite contextual** y con barricadas, recursos y amenazas que evolucionan durante **2–3 rondas**, antes de decidir.
- Mantener el estado de SP-02 como **alternativa híbrida prioritaria para explorar**, no reglamento aprobado. La conservación V9.9 y el trabajo D1/D2 permanecen separados; F-10/F-12/F-15 no fueron revocados.

## 5I. Idea del creador: defensa determinista con exposición posterior al combate (28/10/2026) — POR VALIDAR

**Aporte del creador:** si el combate en una colonia preparada puede resolverse **sin tirar para acertar/eliminar al zombi**, eso **no** implica ausencia de peligro: **después de cada combate se podría resolver exposición**, de modo que la defensa eficaz siga desgastando y poniendo en riesgo a los supervivientes. Esta es una **hipótesis explícita, no una regla aprobada ni una orden de modificar el motor**.

**Base comprobada de V9.9:** `ItemEngine.attack()` elimina uno o dos zombis según arma, luego normalmente llama a `expose()`. Pistola y rifle (con sus condiciones y límites) pueden evitar una exposición por ronda; `expose()` usa d6: **1 mordedura** (muere e inicia riesgo de contagio en esa localidad), **2 congelación**, **3 herida**, **4–6 blanco**; al acumular 3 daños hay muerte. Ese riesgo es **elevado** para automatizar combates frecuentes: dos exposiciones independientes sin protección implican **30,56 %** de al menos una mordedura `1-(5/6)^2` y **75 %** de al menos un resultado adverso `1-(3/6)^2`. Esto presupone que las dos tiradas llegan a realizarse; en juego real una mordedura previa puede detener el segundo combate.

**Flujo candidato del híbrido:** (1) gastar orden de combate, (2) calcular resultado determinista por competencia, equipo, defensa y amenazas, (3) aplicar bajas zombi y costos/materiales, (4) **comprobar exposición por acción de combate**, salvo protección pertinente, y (5) actualizar heridas, personajes y estado. **No confundir** una exposición *por orden/combate* con una por zombi derrotado; el último criterio puede provocar castigo desproporcionado a armas multiobjetivo.

**Por qué mejora la hipótesis de pruebas anterior:** el asedio híbrido llegó a 100 % de cumplimiento **de meta de bajas y barricada**, porque no se modelaron adecuadamente daño/desgaste, oleadas ni supervivencia del grupo. Recuperar exposición puede disociar **eficiencia defensiva** de **costo humano**, manteniendo tensión y valorando protección. Sin embargo, **no asegura balance**: usar riesgo letal 1/6 tras cada combate puede generar espiral rápida de pérdidas.

**Próxima prueba requerida:** comparar la misma defensa durante 2–3 rondas entre (A) determinista sin exposición, (B) determinista + exposición V9.9, (C) determinista + exposición contextual mitigada por cobertura/equipo y (D) combate por pool. **Medir por separado** zombis eliminados, acciones gastadas, daños, mordeduras, muertes, presión de oleadas, recursos consumidos y misión completada. Conservar preparativos/equipo constantes y definir quién cuenta como protegido. **No hay porcentajes de nuevas simulaciones en esta entrada**.

## 5J. Replanteo del alcance para el primer videojuego: priorizar identidad narrativa (28/10/2026) — RECOMENDACIÓN / REFLEXIÓN, NO DECISIÓN FORMAL

**Reflexión del creador:** dado que *Invierno en la Colonia* es su primer videojuego, sumar un motor alternativo de acciones, estadísticas y pruebas por dados a un Director de Juego y narrativa persistente quizá aumente excesivamente la complejidad. Considera **concentrarse en narrativa** y **conservar las mecánicas de V9.9** como base. Lo expresó de modo tentativo; **NO interpretar como una orden irrevocable de descartar las alternativas M2/híbrida** ni como autorización para programar.

**Evaluación de producto:** recomendable tratar la **estabilidad mecánica como ventaja**, evitar rediseñar simultáneamente balance y narrativa, y centrar el primer hito propio en consecuencias causales diferidas, vínculos de personajes, decisiones del líder y campaña. Un sistema de dados propio es una **investigación de futuro aparcada**, no una condición para un buen primer singleplayer; se puede retomar tras validar la experiencia narrativa.

**Matiz técnico necesario:** pasar de la referencia V9.9 a **un solo líder sin equipo rival** requiere **adaptaciones mínimas** en crisis, número de acciones/recursos, amenazas, objetivos, reclutamiento, victoria y dificultad. No prometer que basta solo con agregar textos o historias sin revisar el equilibrio. Mantener la economía de dados de referencia como **punto de partida**, no como obligación dogmática.

**Vertical slice propuesta, no aprobada:** un objetivo/campaña breve, grupo inicial 3 de 5 y líder elegido, un par de encrucijadas con consecuencias diferidas que modifican eventos/recursos/relaciones en rondas posteriores, epílogo dependiente de decisiones. Director con **estado verificable y reglas** para las consecuencias; no depender de improvisación libre que altere la legalidad del juego. Reusar ataque/búsqueda/exposición/acciones de V9.9 salvo necesidad concreta demostrada.

**Próxima decisión de alcance:** confirmar si el creador quiere **congelar explícitamente SP-02 (mecánicas nuevas) como backlog** y trasladar el foco del juego propio a SP-03/SP-05/SP-06 (ronda singleplayer, Director de Juego, narrativa persistente/campaña), mientras D1/D2 sigue por su vía técnica. Hasta la confirmación, **la nueva dirección es recomendación**, no compromiso definitivo. **No tocar código ni `main`.**

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

- **Siguiente tarea de DISEÑO:** **SP-02 — especialización efectiva y economía de acciones**: después de acordar que el líder decide asignación por atributos, pasivas y contexto, comparar roles complementarios, acciones con/sin dado y escenarios en que un personaje podría monopolizar los dados. Dejar la **cantidad exacta de reserva y cualquier tope por personaje como cuestiones a validar**, sin reabrir liderazgo ni F-14.
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
- [64 — Bitácora de cierre del 28/10/2026 y continuación SP-02](64-bitacora-2026-10-28.md)
- [49 — Comparación oficial de V9.9 con el reglamento](49-c15-auditoria-final.md)
- [51 — Rumbo singleplayer y F-14](51-rumbo-fidelidad-e-identidad.md)
- [61 — Matriz F exclusiva del juego propio](61-alcance-matriz-f-juego-propio.md)
- [62 — Ruta de preservación de la referencia](62-hitos-referencia-fiel-y-juego-propio.md)
