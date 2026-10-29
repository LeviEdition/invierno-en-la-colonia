# 18 — Tablero operativo y control de etapas (fuente única del próximo paso)

## D1.2a — experimento terminado, pendiente de revisión · 29/10/2026

**Encargo vigente del creador:** PoC pequeño/reversible de esbuild, derivado de `refactor/d1-catalogo=ba9a423`, sin cambios de reglas ni otra auditoría de fidelidad. `main=0b75d01` coincide con referencia. Checkout previo limpio en rama C antigua; se creó `refactor/experiment-d1-2a-esbuild`. Los estados anteriores «pendiente de autorización» son históricos; SP-02 sigue siendo diseño separado, no implementación.

**Resultado local y revisión del experimento:** referencia433/433 inicial y439/439 con6 tests nuevos; candidato438/439, una aserción literal `class ItemCatalog` incompatible con salida del bundler. **No eliminada ni debilitada; adopción no aprobada.**40/40 configuraciones reales comparadas idénticas salvo hashes de fuente,5/5 partidas UI antes/después y3/3 viewports por variante. File local bloqueado por política de Chromium en ambas versiones; **CI4/4 aperturas aprobadas**, red desactivada. Lockfile nuevo permite npm ci. Motor/plantilla/catálogo/HTML/build de referencia intactos.

[Informe65](65-d1-2a-experimento-esbuild.md) contiene diff lógico, evidencia, riesgos, comparación y rollback. Recomendación **ajustar**, no adoptar. Implementación181903c: CI40859658496 referencia success439/439; CI40859658678 experimento failure por el único fallo de formato, browser success5UI/3viewports/4file. Artifacts cotejados con local; no declarar CI global verde. Checkpoint/prueba diagnóstica final se verifican por su SHA al entregar. **Tarea activa única:** revisión del informe/diff por el creador/ChatGPT; Codex se detiene. Prohibido avanzar D1.2b/c/d o D2 automáticamente.


## Cierre de jornada — bitácora 28/10/2026 y próximo SP-02 · 28/10/2026

**Registro completo:** [64 — Bitácora de desarrollo del 28/10/2026](64-bitacora-2026-10-28.md). Cierre de la reflexión sobre alcance: **para el primer videojuego conviene examinar conservar las mecánicas V9.9 y priorizar narrativa persistente**. **No hay aprobación irreversible** de cancelar el motor híbrido ni autorización de iniciar código singleplayer. La investigación SP-02 queda documentada sin perderse.

**REANUDACIÓN DE DISEÑO jueves 29/10/2026:** **SP-02**, no SP-05: (1) decidir si V9.9 será la referencia mecánica inicial y aparcar temporalmente híbrido; (2) revisar F-10/F-12/F-15 frente a esa decisión; (3) reserva de grupo 1 + vivos, reparto decidido por líder y tres supervivientes, **sin segundo equipo obligatorio**; (4) revisar catálogo/stats/pasivas y acciones sin dado; (5) simular 2–3 rondas sobre papel. **Vía técnica independiente sin cambios:** D1.2a reversible pendiente de autorización, luego D1/D2, sin tocar `main`.


## SP — Alcance del primer videojuego: priorizar narrativa sobre mecánicas nuevas · 28/10/2026

**Reflexión del creador, NO decisión cerrada:** siendo su primer videojuego, integrar mecánicas híbridas/nuevas estadísticas al Director y narrativa persistente puede exceder el alcance deseado. Se plantea **reutilizar mecánicas V9.9** y concentrar identidad del juego propio en singleplayer narrativo con decisiones diferidas. **Recomendación crítica:** la exploración de motores alternativos de SP-02 puede aparcarse como backlog; no eliminar el trabajo previo ni declarar mecánicas anteriores derogadas sin confirmación. [Ver 63, sección 5J](63-hoja-de-ruta-planificacion-singleplayer.md).

**Matiz:** singleplayer sin equipo rival requiere todavía adecuaciones mecánicas mínimas y validación de crisis, dados, recursos y amenazas, no solo textos. **Siguiente tarea de DISEÑO sugerida:** acordar alcance limitado del primer vertical slice narrativo (objetivo, decisiones con consecuencias diferidas, estados persistentes, epílogo y pruebas), y delimitar qué permanece idéntico de V9.9 y qué solo se adapta por necesidad. **Tarea técnica vigente separada:** D1/D2; no autorizar cambios de código o fusiones por esta reflexión.


## SP-02 — Exposición posterior al combate determinista · 28/10/2026

**Nueva hipótesis del creador:** si una defensa preparada se resuelve **sin tirada de ataque**, el superviviente **podría tirar exposición después de cada combate**, manteniendo el peligro pese a tener resultado ofensivo previsible. **No aprobado como regla ni implementado.** La mecánica recuerda a V9.9: después de ataque ordinario se tira exposición, con excepciones por equipo/condiciones. El d6 de referencia: 1 mordedura letal, 2 congelación, 3 herida, 4–6 blanco; **dos exposiciones sin mitigación implican 30,56 % de al menos una mordedura**, si ambas se realizan. La agresividad puede ser excesiva.

**Análisis y propuesta de prueba:** [63 — SP-02, sección 5I](63-hoja-de-ruta-planificacion-singleplayer.md). **No confundir** exposición por acción de combate con exposición por cada enemigo muerto; mantener separadas **eficacia de defensa** y **costo humano**. **Siguiente tarea conceptual:** simular 2–3 rondas con defensa determinista sin exposición, exposición V9.9, exposición mitigada por equipo/cobertura y combate por pool, midiendo bajas zombi y supervivencia por separado. **Técnica:** no alterar V9.9, `main`, F-10/F-12/F-15 ni vía D1/D2.


## SP-02 — Pruebas del híbrido contextual · 750.000 rondas · 28/10/2026

**Ejecución:** banco de pruebas del laboratorio SP-02 ampliado a **tres modelos** (V9.9 simplificado, tiradas por atributo puras, híbrido contextual) y **25 configuraciones × 3 métodos × 10.000 = 750.000 rondas simuladas**, **13/13 pruebas funcionales** aprobadas. Informe y advertencias detalladas: [63 — SP-02, sección 5H](63-hoja-de-ruta-planificacion-singleplayer.md).

**Reglas HÍBRIDAS SOLO DE PRUEBA:** búsqueda y movilidad por dado/atributo; mantenimiento directo con costo de orden; defensa sin tirada y sin exposición únicamente si el combatiente tiene stat ≥4 y la colonia posee al menos una barricada. Otras situaciones siguen usando dados. **No se aprobó el umbral, la inmunidad, la cantidad de acciones ni el cambio de sistema**.

**Metas comparadas, condiciones básicas de cuatro órdenes:** medicamentos **81,87 % / 71,16 % / 71,16 %**, asedio **83,17 % / 43,76 % / 62,33 %**, laboratorio **81,87 % / 61,57 % / 71,16 %** (V9 simplificado/pool/híbrido). Con éxitos escalonados y corrección de exposición: asedio **83,17 % / 59,35 % / 84,34 %**. **Crítico:** con «fortificar primero» y Damián, el híbrido llega a **100 %** en el asedio de la maqueta: la defensa determinista no tiene desgaste ni costos reales y trivializa el objetivo. Combatir en colonia sin exigir barricada también produce 100 % y es aún menos recomendable.

**ÚNICA SIGUIENTE TAREA DE DISEÑO:** probar una defensa determinista condicionada por preparación **y costos reales (desgaste, municiones, capacidad, presión zombi)** en **2–3 rondas**, sin volver a introducir tiradas para toda tarea; comparar además grupos sin un gran combatiente y el efecto de tres órdenes. Este análisis debe mantenerse separado de D1/D2 y de las decisiones F-10/F-12/F-15 no sustituidas. **No alterar V9.9 ni `main`.**


## SP-02 — Exploración de resolución híbrida contextual · 28/10/2026

**Hipótesis del creador, NO regla aprobada:** unificar la **economía de órdenes limitadas** y permitir **diversas formas de resolución**, sin tirar dados en todas las acciones. Usar reservas por atributo en acciones inciertas (búsqueda, movilidad, encuentros) y resolver **acciones rutinarias directamente** o **combates de defensa preparada por estadísticas/equipo sin tirada**. Ejemplo: atacar desde la colonia sin tirar, para evitar pérdidas recurrentes de órdenes en el prototipo de asedio. **Advertencia:** la inferioridad estadística anterior del pool en asedio surgió de modelos no equivalentes, no demuestra que «combate con dados» sea un problema real.

**Criterio de examen:** elegir resolución por las **condiciones del mundo**, no por parche de porcentajes; colonia con defensas establecidas puede justificar defensa previsible, pero cuando está invadida o colapsan defensas puede volver la incertidumbre. Un ataque sin tirada **sigue pudiendo consumir orden y recursos**, la estadística de combate debe tener efecto y el refugio no debe ser una zona de eliminaciones ilimitadas sin riesgo. Diferenciar **acción directa**, **resolución determinista por capacidades** y **prueba por atributo**.

**Documento:** [63 — SP-02, sección 5G](63-hoja-de-ruta-planificacion-singleplayer.md). **Siguiente tarea conceptual:** comparar la misma defensa con pool puro vs híbrido contextual, manteniendo constante estado/acciones y contrastando refugio preparado, amenazado e invadido; comprobar consistencia, tensión, protagonismo de stats y número de tiradas. **Implementación prohibida en esta etapa:** no alterar F-10/F-12/F-15, V9.9 ni `main`; D1/D2 por su vía separada.


## SP-02 — Informe de 480.000 simulaciones exploratorias del laboratorio · 28/10/2026

**Pruebas realizadas:** 3 escenarios × 6 configuraciones × 2 métodos × 10.000 repeticiones = **360.000 rondas**, más 6 variantes de asignación de personajes × 2 métodos × 10.000 = **120.000**; **11/11 verificaciones** del motor simplificado aprobadas y ensayo anterior de 500 rondas reproducido. Detalle: [63 — sección 5F](63-hoja-de-ruta-planificacion-singleplayer.md).

**Resultados ilustrativos con cuatro oportunidades, efectos básicos y movimiento gratis:** metas **V9.9 simplificado / nuevo pool**: medicamentos **81,87 % / 71,16 %**, asedio **83,17 % / 43,76 %**, laboratorio **81,87 % / 61,57 %**. **NO son tasas de victoria del V9.9 real ni evidencia causal de superioridad:** el clásico del laboratorio es aproximado, personajes y pasivas no equivalen, plan fijo, exposición distinta, los éxitos escalonados cambian simultáneamente recompensas y riesgo y la economía tres/cuatro órdenes no discrimina bien algunas metas. Ambos métodos ya muestran especialización; el nuevo tiene más acciones fallidas sin efecto básico.

**DICTAMEN:** mantener órdenes limitadas + pruebas por atributo como **hipótesis preferida de exploración**, sin aprobar reemplazo de F-10/F-12/F-15. **ÚNICA SIGUIENTE TAREA DE DISEÑO:** prueba con una sola variable distinta entre métodos, después prueba manual de percepción estratégica/ritmo y casos de riesgo; evitar nuevos números de balance en tanto no se aísle la causa. **Tarea TÉCNICA:** D1.2a con Codex, luego D1/D2, sin modificar V9.9 ni `main`.


## SP-02 — Evaluación de conveniencia de dados por atributo vs V9.9 · 28/10/2026

**Pedido del creador:** evaluar si **órdenes limitadas + tiradas por atributo** generan una experiencia mejor que los **dados de acción revelados al inicio** de V9.9, **sin debatir aún balance de situaciones, heridas o dificultad concreta**. [63 — sección 5E](63-hoja-de-ruta-planificacion-singleplayer.md) contrasta decisión predominante, agencia, atributos, narrativa, ritmo, costos de implementación, incertidumbre y pérdida de optimización de dados visibles. **Dictamen provisional de DISEÑO:** modelo nuevo es **candidato principal a explorar** por su potencial para especialización y consecuencias narrativas; **no está aprobado ni demostrado superior**. F-10/F-12/F-15 no se reemplazan todavía.

**Observación metodológica crítica:** V9.9 usa **1 + vivos** dados de acción y movimiento sin dado; propuesta usa **vivos** órdenes y movimiento con prueba. Para una comparación válida del **sistema de resolución**, mantener inicialmente **igual número de acciones y mismo costo de movimiento** y comparar el mismo dilema/estado con ambos modelos. Luego evaluar separadamente número de órdenes y movimiento. Evitar fallos sin ningún resultado, tiradas triviales e interrupciones que sustituyan estrategia por azar.

**ÚNICA SIGUIENTE TAREA DE DISEÑO:** evaluar el mismo escenario de supervivencia y elección de personajes con ambos sistemas, observando agencia, especialización y ritmo sin calibrar resultados todavía. **TAREA TÉCNICA SIN CAMBIOS:** D1.2a con Codex, luego D1/D2; sin modificar V9.9 ni `main` o autorizar implementación del juego propio.


## SP-02 — Nueva propuesta: acciones según supervivientes y movilidad por dados de atributo · 28/10/2026

**HIPÓTESIS EXPLÍCITA DEL CREADOR (NO APROBADA COMO REGLA FINAL):** eliminar tirada inicial de dados de acción; el líder administraría una **cantidad de acciones por ronda igual a los supervivientes activos** (tres supervivientes → tres acciones), y las acciones importantes se resolverían lanzando tantos dados como el atributo de cada personaje. Se busca integrar exposición y otros riesgos en resultados por grados. **Ejemplo:** Mara movilidad 5, tira 5d6 para llegar al hospital; 2+ éxitos = llega sin exposición, 1 = llega y tira exposición, 0 = llega con herida. El ejemplo **no** es aún una tabla aprobada.

**Revisión crítica y evidencia:** [63 — SP-02, sección 5D](63-hoja-de-ruta-planificacion-singleplayer.md) contiene probabilidades, el riesgo de que 1 éxito con mordedura resulte peor que 0 éxitos con herida, el peligro de movilidad baja, el costo de la expedición si trasladarse consume una de tres acciones, y la espiral por bajas. Compara **T1** movilidad cuesta acción, **T2** movilidad es prueba posicional pero no gasta acción, **T3** acción compuesta. Dejar F-10/F-12/F-15 **sin modificar** hasta una eventual revisión y aprobación explícitas.

**ÚNICA SIGUIENTE TAREA DE DISEÑO:** comparar una ronda T1 vs T2 con tres supervivientes y tres acciones, estableciendo si desplazarse paga acción y cómo resolver consecuencias sin doble tirada ni daño arbitrario. **TAREA TÉCNICA SIN CAMBIOS:** D1.2a con Codex, luego D1/D2, sin cambios en V9.9 ni `main`, sin merge/release ni producto propio iniciado.


## SP-02 — Alternativa de dados por atributo (dice pool) en comparación · 28/10/2026

**Nueva hipótesis del creador:** el propio sistema de dados de V9.9 puede limitar el desarrollo de estadísticas. Se estudia un enfoque de *Arkham Horror* de mesa: pruebas que tiran tantos dados como atributo, cuentan éxitos y permiten resultados escalonados. **No se aprobó** reemplazar F-10, F-12 o F-15 ni introducir atributos o reglas nuevas.

**Documento ampliado:** [63 — SP-02, sección 5C](63-hoja-de-ruta-planificacion-singleplayer.md). Compara **M1** dados preasignados del juego actual, **M2** acciones/órdenes del líder como recurso separado + pruebas de varios dados por atributo y **M3** híbrido. Registra probabilidades, riesgos de azar/frustración, costos de las acciones, pasivas, progreso narrativo y efecto sobre la tercera estadística.

**ÚNICA SIGUIENTE TAREA DE DISEÑO:** simular/contrastar los mismos escenarios de 2–3 rondas bajo M1/M2/M3, empezando por decidir **si el azar debe revelarse antes de asignar las acciones o durante su ejecución**, sin cambiar el acuerdo de liderazgo/reparto libre. **TAREA TÉCNICA SIN CAMBIOS:** D1.2a con Codex, luego D1/D2; no cambiar V9.9 o `main`, fusionar ni crear versiones propias por esta discusión.


## SP-02.1 — Evaluación de una tercera estadística relevante · 28/10/2026

**Nueva hipótesis solicitada por el creador:** considerar una **tercera estadística** únicamente si agrega decisiones activas de peso comparable a **combate y búsqueda**, de forma coherente con el juego. No hay atributo, nombre ni reglas aprobadas. La revisión [63, sección 5B](63-hoja-de-ruta-planificacion-singleplayer.md) contrasta **movilidad, resistencia, técnica y apoyo/oficio/operaciones**, favoreciendo como hipótesis de estudio una tercera familia de operaciones de supervivencia (mantenimiento, fortificación, preparación), sin adoptarla. Se comprobaron acciones de V9.9: `barricade/clean/attract` consumen un dado cualquiera; movimiento no usa dado. No imponer nuevos umbrales sin balance.

**Siguiente tarea de DISEÑO:** desarrollar **3–5 acciones concretas** candidatas de la tercera familia, su frecuencia/costo e impacto en la asignación de dados, y decidir si realmente justifica una tercera estadística. **Trabajo técnico sin cambios:** D1.2a y luego D1/D2 con Codex, sin cambio de V9.9, `main` ni permisos de merge.


## SP-02 — Análisis de estadísticas y pasivas sin reglas nuevas aprobadas · 28/10/2026

**Revisión de diseño:** se inspeccionó el catálogo real de V9.9: ataque, búsqueda, influencia y habilidades de búsqueda, ataque, construcción, curación, movilidad, cocina y resistencia. Se documentó en [63, sección 5A](63-hoja-de-ruta-planificacion-singleplayer.md#5a-análisis-de-especialización-y-pasivas-28102026--propuestas-no-acuerdos-nuevos) la distinción entre stats, pasivas, equipo y situación, dos opciones de amplitud del sistema, riesgos de monopolio y escenarios de pruebas en papel. Se detectó que el criterio F-10 `atributo >= dado` conserva probabilidades marginales de F-15, pero vuelve más difíciles los dados altos; la comparación con `atributo + dado >= 7` queda como **alternativa NO aprobada**, sin modificar el acuerdo F-10.

**Decisiones previas conservadas:** líder dirige reparto libre de dados según especialidad; pasivas contextualizan decisiones; no se aprobó tope por personaje ni stats adicionales. **Siguiente tarea de DISEÑO:** comparar alternativa mínima de dos stats con ampliación (movilidad/técnica) y seleccionar qué estadísticas producen diferencias jugables, revisando ejemplos y casos límite. **Tarea TÉCNICA sin cambios:** D1.2a y luego D1/D2; no cambios ejecutables ni `main`.


## SP-02 — Criterio táctico de reparto de dados ratificado · 28/10/2026

**DECISIÓN DE DISEÑO del creador:** el jugador personifica al **líder**, que elige qué superviviente realiza cada acción y qué dado asignarle según **stats, pasivas, necesidades y contexto**; los personajes deben aportar especializaciones útiles en **movilidad, búsqueda, ataque y otros roles**. **No se exige repartir equitativamente** los dados ni asignarlos de manera fija a cada superviviente. La afirmación de que el jugador no querrá concentrar todos los dados en uno es un objetivo a **validar con balance**, no una garantía automática. **No se aprobó un tope artificial por personaje.**

**Registro actualizado:** [63 — Hoja de ruta del singleplayer, SP-02](63-hoja-de-ruta-planificacion-singleplayer.md#5-próximo-trabajo-de-diseño-sp-02--decisiones-por-resolver). **Siguiente tarea de DISEÑO:** comparar roles/atributos/pasivas y casos de asignación dominante; después cerrar cantidad de dados y condiciones por acción con ejemplos y balance. **Siguiente tarea TÉCNICA sin cambios:** D1.2a con Codex, luego D1/D2; no iniciar implementación SP ni alterar V9.9, tests o `main`.


## SP — Hoja de ruta de planificación singleplayer creada · 28/10/2026

**Nuevo documento de DISEÑO:** [63 — Hoja de ruta de planificación singleplayer](63-hoja-de-ruta-planificacion-singleplayer.md). Organiza **SP-00 a SP-08**: rol del líder, selección F-14, economía de dados F-10/F-12/F-15, ronda, ajuste de supervivencia sin segundo grupo obligatorio, Director/memoria, campañas, interfaz/guardado y prototipo. Se distinguen **acuerdos**, **propuestas**, **pendientes** y criterios de aceptación, sin reabrir decisiones ya tomadas ni sustituir la matriz F externa.

**ÚNICA SIGUIENTE TAREA DE DISEÑO:** **SP-02 — cerrar economía de acciones y dados**, empezando por reserva común y asignación entre supervivientes. Esto **no** autoriza código ni modifica el juego. **ÚNICA SIGUIENTE TAREA TÉCNICA SIN CAMBIOS:** **D1.2a** (PoC reversible de esbuild, pendiente de autorización), después D1/D2; preservar referencia antes de iniciar producto propio. `main` intacta, sin merge ni cambios de reglas por este registro.


## Decisión vigente — fidelidad mecánica aceptada, solo D1/D2 pendiente · 28/10/2026

**ACUERDO EXPRESO DEL CREADOR:** la V9.9 estabilizada **se considera mecánicamente suficientemente fiel a la experiencia central de *Dead of Winter*** para ser nuestra referencia. **No se exige mayor fidelidad literal** ni una nueva auditoría RF para comenzar la futura versión propia. Esta es una aceptación de **alcance del producto**, no una certificación de equivalencia exacta.

**Evidencia ya disponible, no repetir:** [informe 49](49-c15-auditoria-final.md#comparación-con-dead-of-winter) comparó **14 áreas mecánicas** con el reglamento oficial y registró coincidencias y desviaciones (iniciativa fija, entradas de colonia agregadas, crisis/cooperativo simplificados y objetivos propios, entre otras). C fue estabilizada e integrada en `main`. Las 433 pruebas posteriores de D1.1 verificaron regresiones según su cobertura, no identidad de reglamento; Android físico, TalkBack, otros navegadores y balance humano permanecen reservas.

**ÚNICO TRABAJO NECESARIO PARA TERMINAR LA BASE ANTES DEL JUEGO PROPIO:** **D1 → D2**, refactor de preservación para disponer de módulos de reglas, estado, turnos, automatización e interfaz con límites claros, build reproducible y pruebas. **No cambiar reglas en D.** Si se confirma un defecto funcional grave, se gestiona como incidencia puntual con autorización, sin reabrir toda la fidelidad.

**Puertas posteriores:** una vez D1/D2 estén probadas y aceptadas, **preservar una referencia verificable** (SHA + build + tests, con autorización). Solo después iniciar **el juego propio** en rama/línea separada, aplicando selectivamente la **matriz F** y creando singleplayer/Director narrativo. Las propuestas F-01/F-14/etc. NO se aplican a esta V9.9.

**Nomenclatura:** comparación oficial histórica = **informe 49**; `RF` fue una matriz adicional propuesta, **ya no obligatoria**; `F-xx` = matriz de diseño del juego propio; etapa F histórica = expansión visual/red. No confundir.

**Fuente operativa:** [62 — Ruta ratificada](62-hitos-referencia-fiel-y-juego-propio.md), [51 — Rumbo](51-rumbo-fidelidad-e-identidad.md), [61 — Alcance F](61-alcance-matriz-f-juego-propio.md), [01 — Plan](01-plan-refactorizacion.md). Las entradas históricas que planteen otra auditoría RF obligatoria están reemplazadas por este acuerdo; se preservan para trazabilidad.

**Próximo paso técnico SIN CAMBIOS:** **D1.2a** — PoC reversible esbuild con Codex (todavía no ejecutado ni adoptado). Sin modificar motor, reglas, `main`, ni realizar merge/release por esta actualización.

## Alcance vigente de la matriz F — juego propio, NO refactor de V9.9 · 28/10/2026

**Decisión expresa del creador y corrección del rumbo documental:** la **matriz F (comparación con *Dead of Winter*)** registra **decisiones de diseño para la futura versión propia de *Invierno en la Colonia***. Las propuestas «Conservar»/«Cambiar»/«Pendiente» se interpretan respecto al **juego propio**, y **no son una lista de cambios ni errores a resolver en V9.9**. F-14 (cinco candidatos → elegir tres → líder manual), F-01, F-03b y demás filas de esa matriz quedan **fuera del alcance del refactor D1/D2**. Tampoco están autorizadas para su implementación por el hecho de figurar aprobadas como diseño.

**Dos líneas separadas:** 1) V9.9 de referencia: C estabilizada y D refactoriza preservando el comportamiento; 2) futuro juego propio principalmente singleplayer: tras conservar una línea base, se seleccionan/revalidan e implementan, en rama separada y con pruebas, las decisiones F realmente útiles y se desarrolla el Director narrativo. F-01 u otras mecánicas estrictamente de J1/J2 pueden perder vigencia en singleplayer, no deben trasladarse automáticamente.

**Nomenclatura:** «matriz F» = IDs **F-01, F-14, etc.** de comparación/diseño; «etapa F» de expansión del plan histórico = presentación, campañas y cooperativo/red. No son lo mismo.

**Acta vinculante:** [61 — Alcance de la matriz F](61-alcance-matriz-f-juego-propio.md); [51 — Rumbo de producto corregido](51-rumbo-fidelidad-e-identidad.md); [01 — Plan general actualizado](01-plan-refactorizacion.md). **Las menciones históricas más abajo que sugieran incorporar cambios F a la referencia se consideran sustituidas por este acuerdo; no se reescribe el registro histórico.**

**Próxima tarea de código (sin cambios):** D1.2a, PoC esbuild para arquitectura, **no autorizado/ejecutado todavía**; se prevé Codex cuando haya disponibilidad. La matriz F puede seguir trabajándose hoy solo como diseño. No cambiar HTML, reglas, pruebas o `main` ni fusionar PR por esta aclaración.


## D1.2 — auditoría de modularización y build, SIN CAMBIOS DE CÓDIGO · 28/10/2026

**Dictamen:** [informe 60](60-d1-2-auditoria-arquitectura-build.md). Se examinó código real de `refactor/d1-catalogo`: `src/invierno.template.html` aún tiene ~156.656 caracteres (script principal ~100.386), 52 apariciones de `onclick=`, pruebas acopladas al script clásico (15 extraen el JS y 14 exigen un solo script), y `scripts/build-game.mjs` realiza una sustitución textual de la clase, **no bundling**. Se contrastaron alternativas actual/ESM directo/esbuild/Vite+singlefile con documentación oficial.

**Decisión técnica propuesta:** preservar D1.1 como extracción válida, **no multiplicar ensamblados textuales**, y no asumir que más archivos resuelven el acoplamiento. Posponer PR/merge a `main` hasta definir la construcción a futuro; candidato razonable para experimento pequeño y descartable: `esbuild` con bundle IIFE e imports explícitos. **Bloqueo concreto:** funciones y estado accesibles para `onclick` y fixtures `vm` no sobreviven automáticamente al ámbito de módulo/IIFE. Un PoC deberá demostrar puente de interfaz acotado o listeners, tests 433+ y Chromium (5 partidas, 3 tamaños, archivo offline).

**ÚNICA TAREA SIGUIENTE:** solicitar autorización para **D1.2a, PoC reversible de bundler**, sin cambiar reglas ni fusionar. No se modificó el ejecutable, motor, CI ni dependencias en esta auditoría; `main` sigue intacta.

## D1.1 — catálogo separado y HTML autocontenido, gates verdes · 28/10/2026

**Estado:** D1.1 implementada en `refactor/d1-catalogo` y **validada, sin merge a main**. [Informe 59](59-d1-1-extraccion-catalogo.md). `src/item-catalog.mjs` aporta `ItemCatalog` independiente del DOM, game y modos; recibe `mix` mediante inyección. `src/invierno.template.html` y `scripts/build-game.mjs` generan un único `invierno_colonia_v9_9.html` autocontenido. CI ordinario comprueba build reproducible; se agregaron cinco pruebas unitarias del módulo (20 D1.0 preservadas).

**Gates de SHA `5cc07f50ceb8d3683fed583438a1978470a08b42`:** [Node 40720568281](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40720568281) **433/433**, cero fallos/omitidas/TODO; [Chromium 40720568450](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40720568450) **5/5 partidas C14**, **3/3 tamaños C16**, **2/2 aperturas file://** local/IA, cero errores JS e invariantes, [artefacto](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40720568450/artifacts/12829559449). El HTML de distribución sigue con script único. No se modificaron reglas, `ItemEngine`, IA ni Director narrativo.

**ÚNICA TAREA SIGUIENTE:** auditoría independiente D1.2–D1.4 y preparación de puerta de integración. **No** merge a `main`, D2, F/E ni release sin autorización nueva. Reservas: Android físico, TalkBack, navegadores alternativos y balance humano.

## D1.0 — caracterización de catálogo completada (sin extracción) · 28/10/2026

**Autorización:** crear rama de implementación desde `main`, añadir pruebas con RNG determinista, validar y documentar; no modificar reglas, `ItemCatalog` ni `main`. Rama `refactor/d1-catalogo` desde `main` `0b75d01aba013cd029d9d0dd0bdbd20791be15fc`. Código de pruebas `6ccada45413dad93d1bcfe1330f95a3470b4f7c8`.

**Resultado auditado:** [informe 58](58-d1-0-linea-base-catalogo.md). Archivo nuevo `tests/catalogo-caracterizacion-d1.test.mjs` únicamente: +20 tests para 17 cartas, 8 categorías, 6×20 cartas, resoluciones y metadatos, leyendas y RNG Fisher–Yates (4 semillas directas; 3 semillas para ambas modalidades). [CI 40719277668](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40719277668): **428/428**, 0 fallos/skip/TODO. El ejecutable HTML conserva blob `d192afb43ab216d0b63ed49fd24f1d830d03f4e7`, idéntico a `main`; sin PR, merge ni publicaciones. No se volvieron a ejecutar Chromium ni pruebas físicas: motor sin cambios.

**ÚNICA TAREA SIGUIENTE:** autorización específica para **D1.1**: extraer `ItemCatalog` como fuente independiente y construir el HTML autocontenido de forma determinista, preservando RNG y todos los comportamientos. No extraer `ItemEngine`, no F/E/D2, no fusionar a `main` sin auditoría posterior.

## D0-P1-I — PR #1 fusionado en main y validado · 28/10/2026

**Estado:** etapa de integración **cerrada** con reservas. Por autorización expresa del creador, PR1 se actualizó, pasó a ready y se fusionó únicamente en `main`, commit `96e2b6c3dd19d5f11846820e51948af245c99e71`. No se publicó release, tag ni se iniciaron D1/F. **Informe y evidencia:** [56](56-d0-p1-i-integracion-main.md).

**Gates post-merge:** Node [40713073359](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40713073359) sobre SHA de fusión: 408/408, 0 fallos/skip/TODO. Chromium [40713131565](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40713131565) sobre `main` después de activar trigger (sin cambios HTML): C16 3/3 viewports, C14 5/5 partidas completas, 0 errores JS/invariantes; [artifact](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40713131565/artifacts/12825993763). Persisten pendientes Android físico, TalkBack, otros motores, balance humano y fidelidad integral.

**ÚNICA TAREA SIGUIENTE:** decisión de planificación posterior a promoción; evaluar y autorizar D1 (catálogo de objetos) como cambio de arquitectura separado y conservador. No iniciar F ni identidad E automáticamente.

## D0-P1 — auditoría PR #1 hacia main completada (SIN MERGE) · 28/10/2026

**Dictamen:** [informe 55](55-d0-p1-auditoria-previa-main.md). PR1 abierto/borrador, 251 commits delante de main, 0 detrás, 125 archivos, GitHub `mergeable=true`. Suite Node 408/408 y Chromium 5/5 recorridos con 3 viewports C16 sobre refactor, pero no equivalencia física Android/TalkBack/humana. PR1 describe todavía etapa A (238 pruebas, 3 TODO): cuerpo obsoleto a corregir antes de integrar. `main` no sufrió cambios.

**ÚNICA TAREA SIGUIENTE:** D0-P1-I **solo con autorización expresa**: actualizar PR1, fijar SHA exacto, integrar controladamente únicamente en `main`, comprobar CI + humo Chromium en destino y registrar resultado. No D1, F, publicación ni release por esta auditoría.

## D0-I-V — Chromium post-merge validado · 28/10/2026

**Verificación real de navegador sobre rama integrada, sin cambiar motor.** Debido al bloqueo DNS del contenedor local, se utilizó Chromium real en GitHub Actions sobre `refactor/arquitectura`, commit `a6c3cf425363606ac68266a5b3c876e7d1616b2b` (mismo HTML del merge `c15373d4`; solo cambió workflow/documentación). [Ejecución Chromium 40711789374](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40711789374) `completed/success`; [evidencia ZIP](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40711789374/artifacts/12827075968), incluye JSON y capturas.

**Resultados:** C16 foco real en 320×640, 393×852 y 1365×768: 3 recorridos aprobados, 0 excepciones JS; pase local, Ayuda, muerte, bloqueo de diálogos y sucesión verificados. C14: **5/5 partidas completas Chromium** mediante UI, con 0 errores, 0 invariantes incumplidas y 0 interrupciones: IA semilla 2654435761 victoria ronda4; IA 1401181143 derrota moral ronda6; local 2654435761 victoria ronda2; local 3816266512 derrota moral ronda4; local 3189639203 victoria ronda3. Suite Node post-merge previamente verificada **408/408** [40709698250](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40709698250).

**Iteración de pruebas y límites:** primera ejecución [40711603986](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40711603986) falló por aserción obsoleta en `check-c15-terminal-browser.mjs`, que espera reproducir una fuga de foco ahora prohibida por C16; el runner final excluyó ese script histórico, manteniendo tests Node terminales y prueba C16 vigente. No afirmar que C15 browser completo pasó. Los recorridos de interfaz son automáticos y reproducibles, no pruebas humanas ni Android físico, TalkBack u otros motores. La ejecución se hizo en runner GitHub, no en contenedor local. Ningún cambio del motor V9.9 en D0-I-V.

**Dictamen:** D0-I queda integrada y validada **en el alcance Node + Chromium automatizado**. PR14 merged en `refactor/arquitectura`; PR1 continúa sin fusionar y `main` intacta. **ÚNICA TAREA SIGUIENTE:** auditoría independiente D0-P1 de PR1 → `main` (alcance acumulado, diff y puertas de promoción), sin merge automático ni refactor D1/cambios F.

**Actualización verificada de CI post-merge:** [Actions 40709698250](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40709698250), para el commit de integración `c15373d44f0a76affd9041be925eef48234239c3`, finalizó `completed/success`; se leyeron logs del job `122891290523` con **408 tests, 408 pass, 0 fail, 0 cancelled, 0 skipped y 0 todo**. Continúa pendiente el smoke Chromium específico sobre el árbol integrado, por lo que D0-I-V no se cierra todavía.

## D0-I — PR #14 integrado en arquitectura; validación posterior pendiente · 28/10/2026

**Autorización expresa:** el creador aprobó revisar, actualizar y fusionar solo PR14 → `refactor/arquitectura`, verificar después y documentar; `main` excluida. Se revisaron 97 patches, incluido HTML, workflow y pruebas clave; se corrigió el cuerpo obsoleto del PR14. GitHub exigió pasarlo de borrador a listo para revisión; [PR14](https://github.com/LeviEdition/invierno-en-la-colonia/pull/14) **merged** por commit `c15373d44f0a76affd9041be925eef48234239c3`. PR1 sigue abierto y sin fusionar; `main=d9068f4aa8d3a10bbbf1e0a8a2527744cc6952cb` sin cambios. A6 canónico permanece (blob `c132dd8`).

**Verificación pendiente al documentar:** [Actions 40709698250](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40709698250) estaba `in_progress` para el commit del merge; no se ha verificado su resultado ni ejecutado smoke Chromium sobre el árbol integrado. Las 408 regresiones, recorridos C14/C15 y pruebas Chromium C16 anteriores son evidencia histórica, no validación post-merge. Tampoco existen ensayos Android físico, TalkBack o balance humano certificados.

**ÚNICA TAREA SIGUIENTE:** D0-I-V, verificar por SHA la ejecución CI del merge y realizar recorridos de humo reales de ambos modos (setup, dados, decisiones, muerte, sucesión y finales), registrar resultados y cerrar formalmente D0-I solo si pasan. Luego auditar PR1 separadamente antes de considerar `main`; D1, F y Director narrativo siguen fuera de alcance.


**Última revisión:** 28/10/2026 (D0: auditoría de integración PR14 sin merge; C cerrada). **Proyecto:** Invierno en la Colonia. **Rama activa de ajustes:** `fix/estabilizacion-v9-9` (base de auditoría `refactor/arquitectura`).
**Documento operativo**: a diferencia de los documentos conceptuales, este archivo determina qué hacemos **ahora**, qué queda estacionado y qué evidencia habilita cambiar de fase.

> **NORMA DE TRABAJO:** una etapa activa, una tarea activa. No empezar una fase posterior porque surgió una idea interesante; anotar la idea y retomar lo previsto. Cambiar prioridades exige una decisión explícita registrada aquí.

> **REGISTRO OBLIGATORIO (acuerdo del usuario, 27/10/2026):** al terminar cada revisión, actualizar este tablero. Documentar acciones, decisiones, cambios, resultados, evidencia y límites en el registro pertinente, aunque no se haya modificado código. Véase [protocolo](15-protocolo-revision-critica.md#registro-obligatorio-de-cada-revisión-y-trabajo).

## D0 — auditoría de integración completada (sin merge) · 28/10/2026

**Autoriza el creador:** «Vamos con D0». Se inspeccionaron PR14→`refactor/arquitectura`, PR1→`main`, ramas/ancestro, 96 archivos del diff, workflow, tests, plan01 y el duplicado documental A6. **Resultado completo:** [informe54 — D0](54-d0-auditoria-integracion-sin-merge.md).

**Conclusión:** PR14 está `open/draft` y GitHub reporta `mergeable=true, mergeable_state=clean`. La divergencia de 1 commit es **benigna en el contenido A6**: base `0933c70` y fix `ca1d910` eliminaron independientemente `docs/24-cierre-auditoria-a6.md`, y ambas ramas conservan `docs/24-cierre-auditoria-y-prioridades.md` con idéntico blob `c132dd8`. No requiere rebase obligado. PR14 tiene 153 commits y96 archivos respecto del ancestro (68 docs,1 HTML +452/−182 líneas,14 tests,9 scripts,3 test-support,1 workflow): integración importante pero **sin conflicto Git detectado**. Último SHA ejecutable auditado `951059e` / [CI40703513314](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40703513314) `completed/success`,408/408; Chromium histórico C16 verde. **No se ejecutó un merge de prueba ni se certificó Android físico**.

**ÚNICA TAREA ACTIVA SIGUIENTE:** **D0-I solo con nueva autorización expresa:** preparar/integrar PR14 a `refactor/arquitectura`, actualizar primero descripción desactualizada de PR14 (issues ya cerrados y C aceptada), revisar código cambiado y verificar en destino CI por SHA y humo dos modos. Revisión separada PR1→`main` y promoción estable; D1/mecánicas F posteriores. **Ninguna fusión, force-push, publicación, cambios HTML/JS, inicio D1 o identidad E se ejecutó en D0.** `main` intacta.

## C1–C16: cierre formal aceptado por el creador — 28/10/2026

**Estado vigente y autorización:** el creador aprobó expresamente cerrar los nueve issues pendientes como **resueltos en la rama del PR14, aún no integrados**, y aceptar técnicamente C1–C16 con reservas («Vamos con eso»). El cierre fue ejecutado y contrastado en GitHub: issues **#2, #3, #7, #8, #9, #10, #11, #12, #13 = closed/completed**, cada uno con comentario de trazabilidad y `closed_at`; **0 issues abiertos** en el repositorio. #4/#5/#6 ya habían sido cerrados. **Etapa C CERRADA administrativamente / ACEPTADA técnicamente EN SU ALCANCE**. [Acta 53](53-cierre-formal-etapa-c.md), [dictamen previo 52](52-aceptacion-administrativa-etapa-c.md).

**Evidencia técnica preservada:** 408/408 regresiones del ejecutable, [CI40701666201](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40701666201) completed/success antes del cierre;40 partidas completas de motor y5UI en C14/C15; Chromium C16 [CI40695882583](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40695882583) success, 3 viewports/78 pasos. **Reservas**: sin Android físico, TalkBack, otros navegadores, playtesting de balance humano ni equivalencia completa con Dead of Winter. Un CI verde no convierte estas reservas en resultados probados.

**No integrado ni publicado:** PR14 sigue **open/draft** a `refactor/arquitectura`; `main=d9068f4aa8d3a10bbbf1e0a8a2527744cc6952cb` intacta, ningún merge, tag o release. La comparación previa mostraba 1 commit documental de base (`0933c70`) ausente en la rama y un PR grande; requiere revisión separada.

**ÚNICA TAREA ACTIVA SIGUIENTE (D0, solo análisis):** evaluar la integración PR14 sin fusionar (revisar divergencia de ramas, documento A6, diff y riesgos), y presentar propuesta al creador. **No comenzar refactor D ejecutable, cambios F ni Director/identidad E** sin autorización. El hito de **fidelidad funcional y estabilidad de versión de referencia antes de identidad propia** sigue definido en [51](51-rumbo-fidelidad-e-identidad.md).

## [Histórico previo] Cierre administrativo de C — revisión de nueve issues, 28/10/2026

**Dictamen de solo lectura, documentado en [informe52](52-aceptacion-administrativa-etapa-c.md):** los nueve issues abiertos [#2](https://github.com/LeviEdition/invierno-en-la-colonia/issues/2), #3, #7, #8, #9, #10, #11, #12 y #13 tienen soluciones específicas y regresiones en `fix/estabilizacion-v9-9`. C1–C16 puede **proponerse para aceptación técnica con reservas**, y los nueve issues **para cierre administrativo individual** como «resueltos en PR14, sin integrar aún». No se confunde issue abierto con defecto vigente ni código en rama con software publicado.

**Comprobaciones:** último CI previo a esta revisión `85146b8`/[40700529935](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40700529935) completed/success, **408/408**; Chromium C16 [40695882583](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40695882583) success,78 comprobaciones de teclado en tres viewports. C14/C15 cubrieron40 partidas de motor y5UI, con límites de jugador automático y prueba física detallados en52.

**Integración no trivial:** comparación GitHub `refactor/arquitectura...fix/estabilizacion-v9-9` = **145 commits por delante,1 por detrás**; el único commit de la rama base no incorporado es documental (`0933c70`, informe A6). Este dato no demuestra conflicto mecánico, pero exige reconciliación/revisión de diff antes de merge. `main` intacta, PR14 open/draft, issues aún abiertos.

**Única tarea activa siguiente:** obtener decisión explícita del creador sobre aceptar técnicamente C1–C16 y cerrar administrativamente los nueve issues pendientes con referencia al PR14; si se autoriza, registrar individualmente los cierres, actualizar tablero y confirmar CI. **Sin autorización de fusión, promoción a estable, cambios F o D/E/F.** La dirección futura sigue siendo completar fidelidad jugable antes de identidad singleplayer, según51.

## Dirección de producto ratificada — 28/10/2026 (diseño, no implementación)

**Acuerdo explícito del creador:** primero completar una versión **estable, suficientemente fiel en experiencia y núcleo táctico a `Dead of Winter`**; después comenzar a desarrollar la identidad propia de **`Invierno en la Colonia`**. La identidad futura es **principalmente singleplayer**: un jugador administra a su grupo frente a un Director de Juego que desencadena amenazas, crisis, facciones y narrativa con consecuencias persistentes, **sin exigir un segundo grupo gestionado por IA**. La referencia de mesa orienta el diseño, no presupone equivalencia total ni permite copiar contenido expresivo. [Documento de dirección51](51-rumbo-fidelidad-e-identidad.md).

**F-14 acordada para el diseño de fidelidad:** presentar **cinco supervivientes aleatorios**, elegir **tres** y **designar líder manualmente**; conservar tres personajes iniciales evita recortar de inmediato dados/acciones. El comportamiento del segundo grupo en los modos actuales se definirá antes de programarlo; esta decisión **no está implementada**. Mantener todas las propuestas F como decisiones separadas de C.

**Puertas de calidad:** aceptación administrativa C1–C16 → completar decisiones y pruebas de fidelidad sobre una referencia estable, con adaptaciones deliberadas → D refactor de preservación → E Director/narrativa e identidad propia. No forzar identidad antes del hito de estabilidad. **La única tarea operativa activa sigue siendo la aceptación de C**: revisar nueve issues abiertos y cierre por decisión del creador; no merge ni D/E/F automáticos. `main` intacta, PR14 draft.

## C16 — aislamiento de foco, estado vigente 28/10/2026

**Autorizado por el creador:** continuar estabilización para corregir A1/P2, sin tocar reglas ni comenzar D. **Implementación en rama**: ayuda y fallecimiento confinan Tab/Shift+Tab y foco exterior, el fondo queda inerte, se devuelve foco y se conserva prioridad de Inicio/Pase, Fallecimiento y decisiones del juego. Se añadió una guardia para Escape durante muerte, sin modificar resultados. [Informe50](50-c16-foco-dialogos.md).

**TDD:** cuatro de seis tests C16 rojos antes, los seis verdes después. Tres iteraciones de CI detectaron incompatibilidad con DOM mínimo de pruebas y un fixture C4 intermitente por azar; corregidas y registradas. **Última prueba de código:** `265dc0d`, [CI 40695224171](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40695224171), **408/408**, cero fallidas/omitidas/TODO. Revisión por lectura de la implementación y sus seis regresiones; no se cambió motor mecánico, balance, IA ni dados.

**Gate Chromium completado:** [Actions 40695882583](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40695882583) completed/success, Chromium156, tres viewports (320×640,393×852,1365×768), **78 pasos de teclado sin fugas**, foco programático retenido, retorno tras Ayuda y muerte→sucesión correcto, sin errores JS ni overflow. [Evidencia contrastada](evidencias/c16-chromium-verificado.json) y [artifact de ejecución](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40695882583/artifacts/12819432057). CI Node del mismo HTML [40695882411](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40695882411) success408/408. Android físico, TalkBack, otros motores y cumplimiento WCAG siguen sin certificar. La comparación y acuerdos F-01/F-10/F-12/F-15 están reservados a rediseño posterior, no se aplicaron en C16. PR14 sigue draft, main intacta, nueve issues aún abiertos, C oficialmente abierta.

**Única tarea activa siguiente:** presentar C16 técnicamente validada en Node y Chromium para aceptación del creador; decidir aceptación/cierre administrativo de nueve issues y cierre oficial C con las reservas físicas/lectores descritas. No cerrar issues, fusionar, publicar ni iniciar D sin autorización.

## Revisión de aceptación externa C12–C15 — 28/10/2026

**Estado:** revisión crítica de solo lectura terminada; **entrega técnicamente apta para aceptación con una reserva P2**, sin declarar C oficialmente cerrada. Base comprobada `f597bf2f1aa1484408215b5a320699b0c10a1ea4`; PR14 abierto/draft hacia `refactor/arquitectura`, `main=d9068f4aa8d3a10bbbf1e0a8a2527744cc6952cb` intacta.

**Verificación independiente:** se leyeron diffs reales de C12 (`f9429d1`), C13 (`3c152e8`), C14 (`d801dbb`), C15 (`f1a43c7`), HTML final, regresiones permanentes C12/C13/C15, controlador/fixture/runner de C14, informes46–49 y evidencia de CI. Los cinco CI de etapa/entrega están **completed/success**, incluido [CI documental final 40691733491](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40691733491); suite final declarada402/402 en los informes y Actions. C14 realmente emplea motor HTML y controlador reproducible sin editar recursos para forzar victoria;40 configuraciones(20/modo) y5 recorridos UI se verificaron contra evidencias, **sin repetirlos localmente en esta revisión**. Acciones/evidencia y límites detallados en [registro25](25-registro-estabilizacion.md#revision-de-aceptacion-externa-c12c15--28102026).

**Reserva pendiente A1/P2:** el foco puede escapar de ayuda/fallecimiento; C15 bloquea `chooseLeader` tras una muerte, pero no implementa un confinamiento general del foco. No confundir el cierre técnico de #12 (setup/pase) con certificación de accesibilidad de todos los diálogos. Sin Android físico, TalkBack, otros navegadores ni balance humano. Las cuarenta partidas son simuladas por controlador, no jugadores humanos. El tratamiento de una crisis como efecto atómico se conservó deliberadamente; no hubo cambio autorizado de esa regla.

**Decisiones de producto separadas:** la matriz de fidelidad discutida con el creador después del inicio de la misión propone alternar primer jugador en cada ronda y rediseñar el significado de atributos/dados/comida, entre otras decisiones. **No son defectos regresivos ni forman parte de C12–C15**; no implementarlas ni contarlas como deuda técnica a reparar automáticamente antes de cerrar C.

**Única siguiente tarea recomendada:** decisión del creador sobre A1: corregir confinamiento de foco en ayuda/fallecimiento mediante tarea acotada y tests de teclado, o aceptar expresamente la reserva P2. Después revisar aceptación administrativa de los nueve issues abiertos y decidir cierre de C **sin fusión, publicación ni inicio de D automático**.

## Misión autónoma C12 → C15 — estado actual

Autorización explícita del creador para C12→C15 en orden y correcciones técnicas localizadas con TDD/revisión/CI. No reglas nuevas, main, fusión/cierres, versión estable ni D/E/F. Se preservan los checkpoints anteriores como históricos.

| Etapa | Estado | Evidencia |
| --- | --- | --- |
| C12 | Aprobado técnicamente; f9429d1 y CI40682067180 success371/371 | [46](46-c12-sucesiones-simultaneas.md),371/371 y6casos Chromium |
| C13 | Aprobado;3c152e8/CI40684493624success392/392 | [47](47-c13-integracion-profunda.md),392/392 |
| C14 | Aprobado; d801dbb / CI40688534944 success394/394; 40 partidas motor y5UI | [48](48-c14-partidas-completas.md),394/394 |
| C15 | Completada para aceptación con reservas; f1a43c7 / CI40691454445 success402/402; revisión aprobada | [49](49-c15-auditoria-final.md), fuentes oficiales,40 motor/5UI repetidos |

**Tarea activa única:** revisión de aceptación V9.9 por el creador con checklist de informe49; decidir reservas A1/adaptaciones y cierre oficial de C. No iniciar D, fusionar ni cerrar issues automáticamente. C15 código f1a43c7 y CI40691454445 success402/402; revisión técnica/documental aprobada. La misión reemplaza la necesidad anterior de pedir autorización para H1. Main d9068f4 intacta, PR14 draft a refactor/arquitectura. Referencia sincronizada43f7c11,358/358 y CI40678862713 success.

## Resultado actual C12→C15 — 28/10/2026, Montevideo

**Entrega C15:** f1a43c7 / [CI40691454445](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40691454445) success402/402; PR14 actualizado a C1–C15. El commit documental de cierre se verifica por su SHA antes de entregar.

H1 resuelto C12. C13 protege prioridades/esperas/terminales. C14 ejecutó40 configuraciones y5UI. C15 encontró **T1/P1** (hambre/residuos llevan moral0 y bonus de crisis podía recuperarla) y **T2/P2** (teclado elegía sucesor detrás de muerte); corregidos mediante verify/retornos en colonia y guardia de sucesión.8 nuevas pruebas, **402/402**,0 fallos/TODO; revisión independiente técnica aprobada. Las siete pruebas antiguas que omitían confirmar muerte ahora realizan ese paso y mantienen sus expectativas.

Repetición final40/40 motor y5/5UI, mismos resultados/rondas, no trazas idénticas; C15 detiene eventos posteriores a derrota. Chromium: dados6viewports/24mediciones, encrucijadas16, sucesiones6, cadenas6, foco3 y terminal/teclado6. **A1/P2 queda pendiente: foco sale de ayuda/fallecimiento**, aunque las guardias funcionales comprobadas bloquean jugar/elegir líder durante muerte. Inicio/pase conservan foco. Sin Android físico/TalkBack/WCAG/balance humano.

[Informe49](49-c15-auditoria-final.md) contiene matriz actual21 sistemas, fuente oficial y comparación de reglas, checklist y propuesta para D sin implementarla. **Recomendación:** presentar C para aceptación con reservas, no cerrarla oficialmente. Aceptar o encargar corrección de A1 y confirmar adaptaciones corresponde al creador. Nueve issues abiertos (#2/#3/#7/#8/#9/#10/#11/#12/#13) tienen correcciones en rama pendientes de aceptación en su alcance; no cierres/merge/main/versión estable.

**Lectura del historial:** los apartados C1–C11 y sus frases «estado actual», «H1 pendiente» y «siguiente tarea» describen sus fechas/commits; el estado vigente es este bloque y el checkpoint C15. No borrar las evidencias anteriores ni interpretar sus358 tests como el total actual.

## Revisión de entrega C10 para preparar siguiente trabajo — 27/10/2026 (hora Uruguay)

**Lectura y comprobación de seguimiento por ChatGPT (solo revisión):** contrastados los commits `9e688624` (motor, pruebas y evidencia) y `d342f96` (documentación); se inspeccionaron `crossOptionAllowed()`, `crossTrigger()`, `evaluateCrossOptions()`, `chooseCrossOption()`, `feedingNeed()`, `gameOutcome()`, efectos de cartas y script Chromium. [GitHub Actions del SHA exacto `d342f96`](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40622432370): **358/358, 0 fallidas/TODO**; [evidencia de los 16 recorridos dirigidos](evidencias/c10-issue7-chromium.json). La interfaz local J1/J2 conserva selección humana según las pruebas registradas. Se consultó PR14 (abierto/draft, no fusionado) y `main=d9068f4` inalterada.

**Evaluación:** el cambio aborda el fallo reportado #7 sin depender de palabras del texto; los seis escenarios tienen resultados esperados y no se identificaron defectos nuevos en esta **inspección acotada**, que **no constituye ejecución independiente de Node/Chromium ni certificación completa**. El rojo inicial (11 casos fallidos) consta en el informe43 pero no se conserva como commit rojo separado; se usa como evidencia documentada de Codex, no como reproducción de esta revisión. Persisten reservas de partidas naturales completas, Android físico/TalkBack, balance y nuevos tipos de efectos de futuras cartas. **Issue #7 sigue abierto y requiere aceptación/cierre por decisión del creador**.

**Único siguiente bloque técnico recomendado para un encargo nocturno separado:** C11 / [issue #13](https://github.com/LeviEdition/invierno-en-la-colonia/issues/13), ampliar áreas táctiles de dados en móviles con una corrección CSS/interfaz mínima, TDD y Chromium (320×640, 393×852 y escritorio); sin cambiar mecánicas ni iniciar más correcciones. Al terminar, solo auditar **en modo lectura** los issues aún abiertos y preparar una propuesta priorizada. No cerrar issues, fusionar PR14 ni alterar `main`. La entrega del prompt por el usuario a Codex constituye la autorización de ese bloque acotado; hasta entonces no está iniciada su implementación.

## Encargo nocturno autorizado — C11 y auditoría, 28/10/2026

**Encargo completado: C11/#13 y auditoría de pendientes.** Autorización expresa para ajuste acotado de presentación, TDD viable, Chromium real en 320×640/393×852/1365×768, suite, revisión independiente, CI y entrega a la rama existente. Solo después de C11 terminado/documentado/aprobado: auditoría de lectura/pruebas/documentación de #2/#3/#8/#9/#10/#11/#12 y riesgos de integración. No implementar otros issues ni comenzar D/E; no cerrar #7/#13 u otros issues, fusionar o modificar `main`.

**Fase0 comprobada:** checkout limpio, avance directo de `d342f96` a `2fbbc59` (dos commits solo documentales); rama `fix/estabilizacion-v9-9`, PR14 abierto/draft a `refactor/arquitectura`; `main` remoto `d9068f4aa8d3a10bbbf1e0a8a2527744cc6952cb` intacta. Se leyó informe43, código/diff C10, issue13 y protocolo15. Suite de referencia 358/358 aprobada, sin TODO; CI exacto de 2fbbc59 [40622935501](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40622935501) success con 358/358. Sin regresión grave confirmada ni bloqueo Git. C10 sigue implementado y pendiente de aceptación humana; no se cambian sus reglas.

**Estado actual del encargo:** C11 implementado/documentado/aprobado en pruebas y CI, incluida R1; auditoría de pendientes completada sin programar otros issues. **H1 confirmado: se pierde la sucesión J2 al morir ambos líderes locales; pendiente de nueva autorización para corregir.** [Auditoría45](45-auditoria-pendientes-estabilizacion.md). [Informe44](44-c11-dados-tactiles.md). Las notas de fase0 y checkpoint siguientes son históricas.

## Revisión de la entrega nocturna C11 y fase4 — 28/10/2026

**Pedido del creador:** revisar lo que Codex implementó y auditó durante la noche, sin autorizar de momento otro cambio de juego. Se comparó la rama `2fbbc59`→`5f5514d`, inspeccionando diff CSS C11 (19 líneas), arnés `scripts/check-issue13-browser.mjs`, informes44/45, JSON de auditoría, flujo de `reviewLeader()`/`chooseLeader()`/`leaderChoiceReady()` y issues/PR. Los commits fueron `7497d70` (dados) y `5f5514d` (auditoría de solo documentación). `main=d9068f4` intacta, PR14 abierto/draft hacia `refactor/arquitectura`.

**Resultado contrastado:** C11 amplía los dados de **26×25 a 44×44 px CSS**, gap8, con franja inferior y fallback de scroll para alturas≤520; solo CSS, sin modificación de JavaScript o DOM de la aplicación. Informe44 conserva rojo inicial, R1 de pantallas bajas y revalidación Chromium en seis viewports; no se reejecutó Chromium en esta revisión. Auditoría fase4:54 regresiones dirigidas y21 comprobaciones Chromium según informe45/JSON inspeccionado. **[CI final 40627292012](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40627292012): completed/success, 358/358, cero fallidas/omitidas/TODO** (logs consultados). Los arreglos de #2/#3/#8/#9/#10/#11/#12, así como #7/#13, están en la rama y siguen pendientes de aceptación/cierre administrativo. No interpretar esto como cambios integrados en `main`.

**Nuevo defecto H1/P2 confirmado y contrastado en evidencia:** mueren los dos líderes locales por desbordamiento durante una misma crisis; `reviewLeader()` mantiene únicamente `pendingLeader/pendingLeaderSide`, descarta la segunda petición cuando la primera ya está pendiente y J2 queda con `leaders.ai=null` sin diálogo de sucesión tras el pase. El JSON `docs/evidencias/c-auditoria-pendientes.json` registra el mismo resultado en C11 y pre-C11; la lógica revisada explica la pérdida. No es una regresión CSS ni una prueba de que el issue #6 original volvió a abrirse. **No se implementó corrección H1**.

**Límites:** esta revisión fue de código, logs y evidencia del repositorio, no ejecución propia de suite/Chromium ni Android real/TalkBack/partidas completas. No se verificó equivalencia exhaustiva con el reglamento de *Dead of Winter*. **Única siguiente tarea recomendada, aún sin iniciar:** autorización de un arreglo mínimo H1 con regresión roja de sucesiones simultáneas, ambos órdenes de muerte, selección por dueño, pase, muerte, esperas y modo IA; luego CI y Chromium. No comenzar D/E, fusionar PR14, cerrar issues ni modificar `main`.

## 1. Estado comprobado y alcance

- **Estable:** `main`, `invierno_colonia_v9_9.html`, SHA Git blob `4ebaedad13d63c7a6762c524a52c0dd9695687b1`. El archivo es idéntico en `main` y `refactor/arquitectura` al revisar.
- **Auditoría:** PR [#1](https://github.com/LeviEdition/invierno-en-la-colonia/pull/1) abierto y en borrador; no fusionar por ahora.
- **Pruebas actuales de la rama C11:** **358/358** local y [CI exacto `7497d70`](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40625219012), 0 fallidas/canceladas/omitidas/TODO. Componente **111/111**; Chromium C11 en seis viewports, 24 conjuntos de mediciones y revisión independiente aprobados tras R1. Auditoría posterior: **54/54** regresiones y **21** comprobaciones issue/viewport aprobadas; **también confirmó H1 fuera de esa cobertura: no declarar C estabilizada**. [Informe44](44-c11-dados-tactiles.md) y [auditoría45](45-auditoria-pendientes-estabilizacion.md). Android físico/TalkBack y balance mantienen reservas.
- **Problemas registrados:** [#2](https://github.com/LeviEdition/invierno-en-la-colonia/issues/2), [#3](https://github.com/LeviEdition/invierno-en-la-colonia/issues/3), [#4](https://github.com/LeviEdition/invierno-en-la-colonia/issues/4), [#5](https://github.com/LeviEdition/invierno-en-la-colonia/issues/5), [#6](https://github.com/LeviEdition/invierno-en-la-colonia/issues/6), [#7](https://github.com/LeviEdition/invierno-en-la-colonia/issues/7) y [#8](https://github.com/LeviEdition/invierno-en-la-colonia/issues/8), [#9](https://github.com/LeviEdition/invierno-en-la-colonia/issues/9), [#10](https://github.com/LeviEdition/invierno-en-la-colonia/issues/10) y [#11](https://github.com/LeviEdition/invierno-en-la-colonia/issues/11), [#12](https://github.com/LeviEdition/invierno-en-la-colonia/issues/12) y [#13](https://github.com/LeviEdition/invierno-en-la-colonia/issues/13). **#4, #5 y #6 están aceptados y cerrados**; #7 está implementado para revisión, todavía abierto; #13 implementado para revisión y todavía abierto. Otras correcciones registradas conservan issues abiertos: no se cierran automáticamente por este análisis.
- **Narrativa:** visión, objetivos, campañas y bocetos registrados en `docs/12`–`docs/17`. Son **propuestas y decisiones de diseño**, no código ni campañas implementadas.

## Estado consolidado tras trabajo en otro chat — 27/10/2026

**Instantánea analizada:** `d09021f`, PR14 abierto/draft hacia `refactor/arquitectura`, `main` intacta. Se sincronizó el checkout limpio por avance directo desde `e7d0a48` (78 commits nuevos), sin reescribir historial. [Informe40](40-estado-actual-y-continuidad.md) registra fuentes, decisiones, pruebas, reservas y desajustes administrativos.

C7/C7-R1 (#5 herramientas y botín), C8 (#4 transferencias por modo), aviso de segundo movimiento con combustible y C9/C9-R1 (#6 líder inicial y sucesión del dueño) están implementados y documentados. GitHub confirma #5/#4/#6 cerrados con aceptación del creador. La suite actual y [CI exacto](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40595507459) pasan **336/336, sin TODO**. Las pruebas Chromium anteriores se leyeron en sus informes; no se repitieron aquí.

**Resultado de este análisis:** no se detectaron incoherencias materiales entre los cambios ejecutables leídos y los informes, dentro de una revisión acotada. Se actualizaron conteos y estados obsoletos de documentación. El título/cuerpo del PR14 aún dice C1–C4 y se registra como pendiente administrativo; no se editó el PR. No se implementó ni inició #7. La reserva de muertes simultáneas de ambos líderes, otras crisis y pruebas físicas/balance mantiene los límites de informe40.

**Siguiente tarea propuesta en esa instantánea histórica (sustituida por C10 al final):** autorizar análisis de #7 y acordar criterios basados en efectos estructurados antes de modificar decisiones de IA. #13 y pulido de avisos siguen después; no fusionar ni publicar por esta verificación. Las secciones que siguen conservan la evolución histórica y sus resultados por etapa.

## Entrega C5/C6 para revisión

Código y pruebas subidos en [d4a6b3f](https://github.com/LeviEdition/invierno-en-la-colonia/commit/d4a6b3f45dc5c2563420980acf436a15e694775a); documentación de entrega en [64dcc2c](https://github.com/LeviEdition/invierno-en-la-colonia/commit/64dcc2c90714a5eab6c8dd1e1b4bd3d10d814dd3). Al revisar, la rama y el [PR #14](https://github.com/LeviEdition/invierno-en-la-colonia/pull/14) apuntan a `64dcc2c`; está abierto, en borrador y con base `refactor/arquitectura`, sin revisiones formales registradas. `main` sigue en `d9068f4` y conserva el blob estable `4ebaedad13d63c7a6762c524a52c0dd9695687b1`. Sin fusión, cierre de issues ni publicación de versión.

**CI remoto confirmado:** [código `d4a6b3f`](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40552155171) y [entrega `64dcc2c`](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40552240429), ambos `completed/success`. Los logs de la entrega confirman 275 declaradas, 272 aprobadas, 0 fallidas/canceladas/omitidas y 3 TODO. La revisión final de C5/C6 se registra abajo con hallazgos; CI verde no equivale a aprobación.

### Revisión documental y resolución de acceso — 27/10/2026

Se comprobaron rama/PR/`main`, metadatos de CI y conteos en sus logs, y se corrigieron las referencias actuales que aún decían «CI sin confirmar». El rechazo previo provenía del proxy (`Tunnel connection failed: 403 Forbidden`): faltaba permitir `api.github.com`. Se guardó ese dominio en el borrador de configuración; el usuario aplicó el cambio y las consultas de API ahora funcionan. No hizo falta solicitar un token ni modificar el juego.

Por instrucción del usuario se incorporó la obligación de actualizar el tablero tras **cada revisión** y documentar todo trabajo significativo en [protocolo 15](15-protocolo-revision-critica.md#registro-obligatorio-de-cada-revisión-y-trabajo), este tablero, [registro 25](25-registro-estabilizacion.md#revisión-documental-y-resolución-de-acceso--27102026) y matriz 04. Una revisión paralela de documentación detectó las referencias obsoletas; no se delegaron cambios de código. Esta actualización solo modifica esos cuatro documentos: se comprueba `git diff --check`, sin repetir pruebas locales de código que no cambió. Los nuevos commits documentales se comprobarán en Actions por su SHA, sin atribuirles por anticipado el resultado de `64dcc2c`.

**Resultado y límites de aquella revisión documental:** acceso y CI de la entrega confirmados; documentación sincronizada. No se realizó entonces una nueva prueba de navegador o dispositivo físico ni una revisión final de código; la revisión de código posterior figura abajo. #5 sigue siendo una propuesta de trabajo posterior que requiere acordar la prioridad de la IA; no está iniciada ni autorizada su implementación.

## Continuidad confirmada: preservar la ruta A→B→C→D→E→F — 27/10/2026

**Decisión explícita del creador:** tras explorar un posible modo individual con un líder humano y un grupo de supervivientes, el creador indicó **«Sigamos avanzado con la ruta que ya teníamos»**, vinculándolo con **«finalicemos la auditoría, para asegurarnos que esta primera app funcione lo más parecido al juego de mesa y a partir de ahí vemos esta nueva identidad»**.

**Interpretación de alcance:** no iniciar ahora rediseño single-player, órdenes por líder, mundo narrativo dinámico, arquitectura nueva ni una Utility AI extensa. Son **ideas estacionadas para E/F**, no reglas aprobadas ni funcionalidades V9.9. **La fase A6 de auditoría ya había cerrado con reservas** (informe24); esta decisión significa **terminar la fase C de estabilización** y su revisión transversal antes de avanzar a **D (refactor sin alterar reglas)** y **E (prototipo narrativo)**, no rehacer toda la A desde cero.

**Objetivo de fidelidad:** conservar la dinámica táctica y cooperativa inspirada en *Dead of Winter*, contrastar expresamente las mecánicas relevantes con las reglas de mesa cuando corresponda, y registrar toda desviación voluntaria propia de la adaptación. **No** afirmar equivalencia total con el juego de mesa solo por tener CI verde o por una impresión de juego. Antes de promover V9.9, separar: defectos verificables, adaptaciones acordadas, diferencias de diseño pendientes, y límites de prueba reales (partidas completas, móvil físico, accesibilidad y balance).

**Una sola tarea activa siguiente:** abordar **#7**, todavía abierto, con el alcance mínimo de estabilización: que la IA de encrucijadas deje de depender de fragmentos literales de texto. El informe experimental de Codex sobre prioridades/Utility en seis escenarios es **exploratorio**, no política aprobada ni código integrado. Elegir la regla mínima luego de definir condiciones verificables; después regresiones **rojo→verde**, Chromium y revisión crítica. **No introducir perfiles, personajes autónomos, memoria, planificación ni motor de Utility completo durante C** sin nueva autorización. Luego #13 (dados táctiles), verificación de issues que aún aparecen abiertos aunque parte de sus parches están hechos, pulido de alertas y revisión transversal previa a propuesta de promoción.

**Control:** [PR14](https://github.com/LeviEdition/invierno-en-la-colonia/pull/14) continúa draft a `refactor/arquitectura` y `main` no cambia por esta anotación. La documentación de diseño previo sigue vigente como hipótesis, no como implementación.

## 2. Etapa activa C — misión C12→C15; aceptación del creador pendiente

**Objetivo:** saber qué hace realmente el juego, qué falla y qué no se ha probado, antes de intervenir sus reglas o extraer módulos.

### Orden operativo dentro de A

| Orden | Bloque | Resultado necesario | Situación |
| --- | --- | --- | --- |
| A1 | Caracterización automatizada de reglas y encrucijadas | Pruebas reproducibles del motor y matriz documentada | **Avanzado, no exhaustivo** |
| A2 | Modo de dos jugadores en el mismo dispositivo | Dados/manos separados, pase de turno, interacciones y bloqueo de datos privados, casos pendientes | **Cerrado como caracterización automatizada (20 pruebas); visual pendiente A5** |
| A3 | Interfaz, modales y secuencias de acciones | Pruebas de decisiones, cierre/apertura de diálogos, sucesión, mordeduras, esperas de IA y pantallas de pase | **21 pruebas automatizadas cerradas; interfaz real pendiente A5** |
| A4 | Integración de partidas completas | Reproducir al menos una victoria y una derrota, modos local e IA, con finales y casos excepcionales | **23 pruebas automatizadas cerradas, incluidas partidas dirigidas de 10 rondas; naturalidad/balance pendientes** |
| A5 | Verificación en navegador real y móvil | Lista manual/evidencia de escritorio y Android, táctil, desplazamiento horizontal, accesibilidad y rendimiento básico | **A5-01 completado; A5-02 físico diferido y documentado (no aprobado)** |
| **A6** | **Cierre de cobertura** | Matriz de 21 subsistemas actualizada con evidencia y límites explícitos; lista priorizada de defectos sin resolver | **Documentado con reservas en [24](24-cierre-auditoria-y-prioridades.md). Usuario autoriza pasar a ajustes.** |

**Importante:** A2 y A3 pueden compartir escenarios; no marcar una interacción visual como validada solo por probar funciones con DOM simulado.

### A2-01 — Completada como caracterización automatizada

**Resultado:** 20 pruebas nuevas; privacidad de manos y dados, pase de turno y estados pendientes caracterizados. **194 pruebas aprobadas, 0 fallidas y 3 TODO**. Defectos: [#3](https://github.com/LeviEdition/invierno-en-la-colonia/issues/3) previo y [#8](https://github.com/LeviEdition/invierno-en-la-colonia/issues/8) nuevo. No corregimos reglas. **La validación visual real, foco, pantalla táctil y uso del celular siguen pendientes de A5**.

**Evidencia:** [docs/19-auditoria-modo-local.md](19-auditoria-modo-local.md) y [suite CI](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40524535143).

### A3-01 — Cerrada como caracterización automatizada

**Resultado:** [informe](20-auditoria-modales-a3.md), 21 tests, defectos de contrato [#9](https://github.com/LeviEdition/invierno-en-la-colonia/issues/9) y [#10](https://github.com/LeviEdition/invierno-en-la-colonia/issues/10). Pruebas visuales pendientes.

### A4 — Cerrada como integración automatizada dirigida

**Resultado:** [informe](21-auditoria-integracion-a4.md), 23 tests, recorridos de victoria/derrota, dos partidas dirigidas de 10 rondas, defecto de victoria de IA [#11](https://github.com/LeviEdition/invierno-en-la-colonia/issues/11).

**Advertencia:** no se comprobó el balance de campañas bajo azar y recursos naturales; no se evaluó la interfaz real. **A4 automatizado completo no significa auditoría A completa.**

### A5-01 — Verificación en Chromium y emulación táctil ejecutada

**Evidencia:** [informe A5-01](22-auditoria-navegador-a5.md), 40 comprobaciones principales en cuatro viewports (1365×768, 393×852, 320×640 y 852×393) y 12 comprobaciones especiales en tres viewports. Menú, búsqueda, botín, encrucijadas, muerte, pase e inventario J2 funcionan en el navegador; sin errores JS ni desbordamiento horizontal de página en esos tamaños.

**Defectos nuevos confirmados:** [#12](https://github.com/LeviEdition/invierno-en-la-colonia/issues/12), foco de teclado sale de setup/pase; [#13](https://github.com/LeviEdition/invierno-en-la-colonia/issues/13), dados flotantes de 26×25 px para uso táctil. No se corrigieron. **Las pruebas de móvil fueron emuladas: no Android real.**

### A5-02 — Verificación física diferida; no ejecutada

**Alcance:** ejecutar [guía manual](23-guia-prueba-android-a5.md) en al menos un teléfono Android. Validar apertura, scroll vertical, acciones, dados, modales, mano del segundo jugador, pase privado, orientación y respuesta táctil. Registrar observado/esperado, modelo, navegador y capturas de fallos si se producen.

**Estado:** sin checklist de Android físico. El usuario indica que ha jugado repetidas veces con buen funcionamiento y autoriza avanzar. Se conserva como **riesgo pendiente**; no se afirma dispositivo, navegador ni pasos verificables. [Guía futura](23-guia-prueba-android-a5.md).

### A6 — Lista de prioridades documentada; B1 y C1 habilitadas

**Informe de cierre y priorización:** [24 — Cierre de auditoría V9.9](24-cierre-auditoria-y-prioridades.md). 238 pruebas ejecutables verdes, 3 TODO y 12 incidencias registradas (#2–#13), incluida una regla genuinamente ambigua (#4). A5-02 queda pendiente y no bloquea una **rama aislada** de correcciones por autorización expresa del creador.

**B1 (clasificación):** defectos de expectativa inequívoca #11, #2 y #3 pueden corregirse sin crear reglas nuevas. #4 y #6 precisan acordar comportamiento. El resto conserva clasificación y orden sugerido en el documento 24.

### Estabilización C1–C3 — completada en rama aislada y PR en borrador

En `fix/estabilizacion-v9-9` fueron corregidos **[#11](https://github.com/LeviEdition/invierno-en-la-colonia/issues/11)** (victoria IA al alcanzar muestras), **[#2](https://github.com/LeviEdition/invierno-en-la-colonia/issues/2)** (cartas de recursos y consumo de encrucijadas) y **[#3](https://github.com/LeviEdition/invierno-en-la-colonia/issues/3)** (dados J2). Cada cambio incluyó regresiones y la [suite CI](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40537729389) finalizó con **245 aprobadas, 0 fallidas y 3 TODO** (**248 declaradas**).

**Evidencia:** [registro C1–C4](25-registro-estabilizacion.md) y [PR #14 en borrador](https://github.com/LeviEdition/invierno-en-la-colonia/pull/14). **No fusionar ni sustituir `main` sin revisión**. Los defectos #4, #6 y #7 requieren decisiones y no se alteraron.

### C4 — Foco de diálogos (#12): implementado y verificado

Se enfoca el diálogo de inicio/pase, se confina Tab/Shift+Tab, se hace inerte el tablero durante el pase y se devuelve el foco al contenido al cerrar. **Cinco regresiones nuevas**, suite 250/0/3 TODO; Chromium verificó Tab, Shift+Tab y Enter en 1365×768, 393×852 y 320×640. [Registro](25-registro-estabilizacion.md). No se afirma validación con TalkBack o Android físico.

### C5 — Guardias de transición de turno (#8 y #10): R2 corregido en el seguimiento

**Estado confirmado al comenzar:** rama y referencia Git del PR #14 en `5b3a663`, C4 cerrada; `main` en `d9068f4`. La consulta del PR mediante API devolvió `Forbidden`: no se confirmó en vivo su estado ni sus checks.

**Precondición → acción → esperado → evidencia:** pase (incluido inicio) o aviso de fallecimiento activo → llamar `finishTurn()` o el atajo del menú → no cambiar partida, ronda, selección ni diálogo → tres regresiones locales fallaron antes del arreglo. Se reemplazaron las dos caracterizaciones del defecto por expectativas correctas y se añadieron inicio y fallecimiento en IA (cuatro casos C5). Tras confirmar, una nueva orden sí avanza; no se difiere una orden bloqueada.

**Corrección mínima:** añadir `passScreenActive` y `deathDirector.active` a la guardia inicial de `finishTurn()`, sin cambiar reglas ni el gestor de foco. **Validación local:** 45/45 pruebas en los dos archivos afectados; `npm test`: **252 aprobadas, 0 fallidas y 3 TODO** (255 declaradas). Chromium sobre la rama real verificó bloqueo durante fallecimiento en local/IA, Continuar y avance posterior; en local también llamadas repetidas durante pase, confirmación y llegada a ronda 2. Sin errores JS. Escenarios dirigidos, no partida completa ni Android físico.

Cambios entregados en el PR #14 para revisión, sin fusionar ni modificar `main`. CI remoto de C5/C6 confirmado en la entrega registrada arriba; los resultados de implementación anteriores son históricos. Detalles en [registro C5](25-registro-estabilizacion.md#c5--8-y-10-guardias-de-fin-de-turno).

### C6 — Acciones durante curación pendiente (#9): R1 corregido en el seguimiento

**Autorización:** el usuario indica «continuemos» después de confirmar C6 como siguiente tarea. Se conservaron los cambios locales de C5; `main` y los remotos no se modificaron.

**Precondición → acción → esperado → observado:** selección de paciente activa → consumir/equipar/aportar desde mano o equipo/iniciar transferencia mediante llamadas internas → conservar estado hasta curar o cancelar → 15 regresiones fallaron antes del arreglo, cinco por cada contexto (J1, J2, humano contra IA).

**Solución mínima:** `playable()` exige también ausencia de `pendingHeal`. `chooseHeal()` conserva la comprobación de `controls.interactive` para poder resolver la elección sin habilitar las acciones normales. Elegir paciente y cancelar mantienen sus reglas y liberan el bloqueo.

**Evidencia:** 21 casos C6 (15 de bloqueo y 6 de recuperación) reemplazan una caracterización del fallo. Suite completa `npm test`: **272 aprobadas, 0 fallidas, 0 canceladas, 0 omitidas y 3 TODO previos** (275 declaradas). Archivo de modales: 42/42 aprobadas. Chromium sobre el HTML real comprobó seis recorridos dirigidos: curar/cancelar en J1, J2 y humano contra IA, rechazo de consumo durante la elección y consumo habilitado después; sin errores JS. No valida partida completa, Android físico ni TalkBack.

Tablero, registro y matriz actualizados. Al terminar la implementación, los cambios aún estaban sin commit ni subida; la entrega posterior se registra arriba. CI remoto C6 confirmado en la entrega registrada arriba. No se cierra automáticamente #9 ni se fusiona. [Registro](25-registro-estabilizacion.md#c6--9-acciones-durante-curación-pendiente).

### Revisión final C5/C6 — realizada con hallazgos, 27/10/2026

**Alcance:** `5b3a663..247f819`, dos revisiones independientes de solo lectura y comprobación de reproducciones en Node/Chromium. [Informe 26 con precondiciones, acciones, esperado/observado y límites](26-revision-final-c5-c6.md).

- **R1, regresión C6/P2:** llamada interna `search(); special(); chooseLoot(0)` crea botín y curación simultáneos; el nuevo `playable()` impide resolver el botín y el modal no ofrece curar/cancelar. Comparado antes/después y reproducido en J1, J2 y humano contra IA. Impide recomendar integrar C6 sin corrección.
- **R2, residual C5/P2:** `kill(Leo); finishTurn()` en la misma pila avanza antes de la microtarea que abre la muerte. Preexistente; el bloqueo con diálogo ya visible sí funciona. No se afirma una explotación mediante clic normal.

**Resultados:** 65/65 pruebas relevantes aprobadas; CI de `247f819` [aprobado](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40554797945). Los ocho experimentos de Chromium confirmaron los casos, sin errores JS; no cuentan como ocho pruebas funcionales aprobadas. Las pruebas existentes no cubren estas combinaciones. No hubo modificaciones de código ni nuevas regresiones incorporadas a la suite en esta revisión: se entrega diagnóstico, no una corrección. PR #14 sigue en borrador, sin aprobación formal ni fusión; `main` intacta.

### C6-R1 — Bloqueo botín/curación: corregido y revisado, 27/10/2026

[Informe 27](27-correccion-c6-r1.md), código/pruebas [a5043fa](https://github.com/LeviEdition/invierno-en-la-colonia/commit/a5043fadbaa686ed9d5c4cdc8c43ab90806baa52). Se impide iniciar la curación médica/enfermera mientras exista `pendingLoot`, sin relajar permisos para resolver botín ni cambiar otras habilidades. Seis regresiones fallaron antes y pasan después; 48/48 pruebas del archivo de modales. `npm test`: **281 declaradas, 278 aprobadas, 0 fallidas/canceladas/omitidas y 3 TODO previos**.

Chromium completó 12 recorridos en 1365×768 y 393×852: J1/J2/humano contra IA, curar/cancelar, ruido/elección única y recuperación de búsqueda. Sin errores JS. Solo la orden tardía de habilidad se reproduce por llamada interna; las elecciones se verifican con botones reales. Una revisión independiente no encontró defectos en el ajuste. No se afirma Android físico/táctil ni todas las combinaciones de decisiones.

**CI remoto confirmado:** [GitHub Actions sobre `a5043fa`](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40556617672), `completed/success`; logs: **281 declaradas, 278 aprobadas, 0 fallidas/canceladas/omitidas y 3 TODO**.

Tablero, registro, matriz e informes 26/27 actualizados; se conserva el hallazgo original como histórico. Sin fusión, cierre de issues ni aprobación formal del PR. `main` intacta. En C6-R1 no se modificó R2 de C5; su corrección posterior se registra abajo.

### C5-R2 — Cola de fallecimiento: corregida y revisada, 27/10/2026

[Informe 28](28-correccion-c5-r2.md), código/pruebas [c19916f](https://github.com/LeviEdition/invierno-en-la-colonia/commit/c19916f609498a0e058ef19b257b0f134e0c8aa5). La guardia de `finishTurn()` comprueba también muertes en cola, antes de que su microtarea abra el aviso. No cambia el gestor de fallecimientos ni las esperas de una transición ya iniciada.

Seis regresiones fallaron antes y pasan después, con microtareas reales, J1/J2/humano contra IA, uno/dos avisos, rechazo sin mutar estado y recuperación después de confirmar todos. Un séptimo test preserva una colonia real que espera su muerte y termina solo una vez. Archivo: 55/55; `npm test`: **285 aprobadas, 0 fallidas/canceladas/omitidas y 3 TODO** (288 declaradas). Chromium: 12 recorridos en 1365×768 y 393×852, sin errores JS; confirmación/reintento mediante botones reales tras reproducir internamente la ventana. Revisión independiente sin defectos. No se afirma Android físico ni clic normal como origen del fallo.

**CI remoto confirmado:** [GitHub Actions de `c19916f`](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40557908505), `completed/success`; logs: **288 declaradas, 285 aprobadas, 0 fallidas/canceladas/omitidas y 3 TODO previos**.

Tablero, registro, matriz e informes 26/27/28 actualizados; C6-R1 conserva sus pruebas. PR #14 en borrador, sin aprobación formal ni fusión; `main` intacta. No se implementó #5.

### Definición de prioridad IA #5 — propuesta revisada, decisión pendiente

**27/10/2026:** se revisaron catálogo, crisis, secuencia del turno IA, pruebas existentes e issue#5, con revisión independiente de solo lectura. [Propuesta y escenarios en informe29](29-propuesta-prioridad-ia-herramientas.md). Un aporte insuficiente no reduce la penalización; la IA puede encontrar más herramientas durante las acciones y su bloque actual no reevalúa al final.

**Recomendación todavía no aprobada:** para crisis de herramientas, usar equipo durante las acciones y, antes de colonia, aportar exactamente lo faltante solo si mano+equipo propio pueden completar. Priorizar mano antes de equipo, permitiendo gastar la última herramienta equipada si hace falta. Si no alcanza o ya se cumplió, conservar; no buscar el bonus extra. Mantener otros tipos de recurso y reglas sin cambios.

Se presentó el costo (perder equipo valioso para evitar una penalización) y la alternativa de proteger siempre el equipo. Se solicitó decisión al creador, sin suponerla por silencio. No se implementó #5 ni se ejecutaron nuevas pruebas; no hay nueva cobertura funcional. Solo informe29, tablero y registro modificados, con `git diff --check`. Los checks del commit documental no validan una política que aún no existe en código.

### Siguiente tarea única — Decidir prioridad IA #5

Recibir y registrar la decisión del creador sobre la propuesta. Implementación y regresiones quedan para el bloque posterior a una política aprobada; no tocar #4/#6 ni fusionar.

### Continuidad verificada y segunda revisión de política #5 — 27/10/2026

**Punto inicial remoto comprobado:** `main=d9068f4` y blob original V9.9 `4ebaedad13d63c7a6762c524a52c0dd9695687b1`; `refactor/arquitectura=0933c70`; `fix/estabilizacion-v9-9=e7d0a48` (sin avances frente al SHA de referencia). PR #1 y #14 abiertos, en borrador; #14 base `refactor/arquitectura`. #5 sigue abierto. [Actions 40559396788](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40559396788) confirma en logs checkout de `e7d0a48`, **288 declaradas/285 aprobadas/0 fallidas/3 TODO**. La ejecución no valida el arreglo de #5, que aún no existe.

**Tarea C/B activa y única:** decidir prioridad IA de herramientas/crisis #5. Relectura de flujo IA, búsquedas, donaciones y catálogo confirmó además que `stashLoot()` puede equipar inmediatamente las herramientas encontradas. Crítica: donar la última herramienta equipada para evitar una penalización menor puede empeorar rondas futuras; políticas de preservar equipo o valorar severidad implican sacrificios distintos. [Informe29](29-propuesta-prioridad-ia-herramientas.md) y [registro25](25-registro-estabilizacion.md) documentan alternativas, recomendación acotada y pruebas/límites.

**Decisión pendiente del creador, ninguna aprobación implícita:** se recomienda provisoriamente donar al final solo si se completa la crisis, usando primero mano y luego equipo propio vivo, sin bonificación extra, con desempate determinista documentado; no estimar valor táctico durante C. No se modificaron mecánicas, tests ni `main`, ni se fusionaron PRs o cerraron issues. Revisión estática, **sin nueva ejecución funcional/local, Chromium ni Android/TalkBack**. Los commits documentales posteriores deben verificarse por su propio SHA y checks.

**Siguiente tarea única (sin empezar aquí):** recibir y registrar la decisión explícita del creador sobre la política #5, antes de cualquier implementación.

### C7/#5 — Política A aprobada, implementada y probada (27/10/2026)

El creador aprobó completar crisis de herramientas siempre que los aportes humanos anteriores más la mano y equipo de la IA lo permitan. La IA usa herramientas durante su turno, realiza sus búsquedas normales y **después** decide si aportar. Prioriza mano propia y luego equipo propio de supervivientes vivos en orden determinista, solo lo necesario, sin bonificación extra. Cuando no alcanza, conserva el material: en humano + IA no hay otro turno humano antes de colonia. Esto no cambia aportes parciales humanos ni modo local.

**Evidencia C7:** [informe30](30-correccion-c7-ia-herramientas.md), [código 4166716](https://github.com/LeviEdition/invierno-en-la-colonia/commit/416671673c81c4aa88d91d06209a53855efb69c8), diez regresiones nuevas, [CI 40571819429](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40571819429): **297 declaradas, 295 aprobadas, 0 fallidas, 2 TODO** (#4 y #6). No se modifica comida, medicina, combustible, decisiones de botín ni selección de lugares de búsqueda. Hallar una herramienta puede ayudar a salvar la crisis, pero la IA **no busca deliberadamente herramientas por encima de otros tipos de botín**. No se hicieron nuevos ensayos Chromium, Android físico, TalkBack ni análisis de balance. Main intacta y PR #14 en borrador; #5 permanece abierto.

**Siguiente tarea única:** revisión crítica de C7 antes de considerar integración o ampliar la estrategia de búsqueda.

### Revisión crítica posterior de C7 — 27/10/2026

Revisión de solo lectura de código, contrato de búsqueda, tests y estado CI. [Informe 31](31-revision-critica-c7.md): **la rutina de donación de herramientas satisface el alcance aprobado** (mano/equipo propio, colaboración con aportes humanos, evaluación final, aporte exacto), con 295/297 pruebas aprobadas y dos TODO en [CI sobre `9907cdb3`](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40572758503). No se ejecutaron pruebas dinámicas nuevas ni Chromium/Android/TalkBack, ni revisor externo.

**Reserva H1/P2 (selección de botín, código inspeccionado):** la IA puntúa muestra 10 y herramienta 3 incluso cuando tomar esa herramienta completaría una crisis posible (ejemplo: linterna equipada, botín muestra+palanca, crisis de herramientas 0/2). Se pierde esa oportunidad. **H2 (límite anterior, no regresión):** comida, medicina y combustible todavía se donan antes de las búsquedas y no se reconsideran después. Esto estaba fuera del alcance de #5. Ambos escenarios requieren pruebas dirigidas antes de afirmar reproducción integral.

**Estado:** revisión concluida con reserva, C7 implementada/CI verde pero #5 abierto; no modificar regla de botín ni generalizar otras crisis sin una decisión. `main` intacta, PR #14 sigue en borrador.

**Tarea única siguiente:** aprobar o ajustar una política mínima C7-R1 para elegir herramientas reveladas **cuando esa elección permitiría completar la crisis**, preservando la victoria inmediata por objetivo. Después diseñar regresiones y parche solo si queda expresamente autorizado. No iniciar aún #4/#6 ni etapa D.

### C7-R1 — Regla de selección de botín aprobada y corregida (27/10/2026)

**Aprobación expresa del creador:** elegir la herramienta revelada **solo si adquirirla permitiría completar** una crisis de herramientas con el inventario/equipo propio vivo y los aportes humanos previos. Una muestra que otorgue **victoria inmediata** tiene prioridad mayor, incluyendo el doble avance de investigador. No iniciar cambios de ruta de búsqueda ni reordenar aportes de otros tipos.

**Evidencia reproducida antes:** ocho regresiones añadidas en [`5debdbd`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/5debdbd49289b1e464e9df7a8384b6a41f95c0fc); [CI rojo 40575929242](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40575929242) documentó 3 fallos de la selección anterior. **Corrección:** [`f1e75ed`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/f1e75edc28a317a3d6745079d19e07558987a10a), puntajes condicionados dentro de `beginSearch()`, sin cambiar `botContributeTools()` ni otras clases de crisis.

**CI verde del ejecutable:** [Actions 40576075140](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40576075140): **305 declaradas, 303 aprobadas, 0 fallidas y 2 TODO** (#4/#6). [Informe32](32-correccion-c7-r1-prioridad-botin.md) registra autorización, pruebas y límites. **No se ejecutaron** pruebas nuevas de navegador, Android, TalkBack ni partida natural. PR #14 permanece en borrador, #5 abierto y `main` intacta.

**Tarea única siguiente:** revisión crítica posterior del parche C7-R1; todavía no autoriza fusión/cierre del issue ni otro defecto de estabilización.

### Revisión crítica posterior C7-R1 — 27/10/2026

[Informe33](33-revision-critica-c7-r1.md): revisión separada de la implementación [informe32](32-correccion-c7-r1-prioridad-botin.md), contrastando regla de puntuación, `gainSample`, inventarios, búsqueda, turnos, crisis y las ocho regresiones. **Dictamen:** no se encontraron fallos nuevos en el alcance del parche. H1 del informe31 (preferir muestra no ganadora sobre herramienta que permite completar crisis) queda resuelto por el parche C7-R1 y pruebas; victoria inmediata conserva prioridad, incluyendo investigador. No se cambiaron motor ni tests, solo documentos.

**Evidencia verificada:** [CI 40576507329](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40576507329) del commit auditado `46564a5`: **305 tests, 303 aprobadas, 0 fallidas y 2 TODO**. `main` intacta; PR #14 borrador; #5 aún abierto. **Limitación significativa:** la suite de IA suprime encrucijadas, esperas/modales y animaciones; no hay smoke test nuevo en navegador ni Android/TalkBack. No afirmar que la UI está aceptada.

**Única tarea siguiente:** preparar y realizar validación manual acotada en **navegador real** del flujo completo C7/C7-R1, con encrucijadas activas, antes de decidir cierre/promoción de #5. Registrar escenarios y resultados; no iniciar otros issues sin cambio explícito de prioridad.

### Smoke test C7/C7-R1 en Chromium real — 27/10/2026

[Informe34](34-validacion-navegador-c7-r1.md): se obtuvo la versión exacta del HTML de esta rama, SHA Git blob `7ae72fc88381e5109b5f64929f6b017a2d5d5dc6` verificado contra GitHub, y se ejecutó en Chromium con Playwright. **Cuatro escenarios aprobados:** completar crisis 1/2 humano con palanca IA equipada y modal de ronda; elegir herramienta frente a muestra no ganadora y superar crisis con modal de búsqueda; priorizar victoria inmediata por muestra; victoria por muestra duplicada de investigador en viewport táctil 390 px. Encrucijadas/acciones confirmadas mediante interfaz real; 0 errores JS detectados. `round`, inventario, mazo y log verificados.

**Evidencia y límites:** ensayos con estado reproducible preparado por Playwright, temporizadores de animación de 1750 ms acortados, sin Android físico/TalkBack ni partidas aleatorias completas; `file://` bloqueado en entorno, documento cargado mediante `page.set_content()`. **No** se alteraron HTML ni tests del repositorio. El CI anterior de `5eb8302` era verde: **305 declaradas, 303 aprobadas, 0 fallidas, 2 TODO**, [run 40577893140](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40577893140). El número no aumenta por los cuatro recorridos externos. PR14 borrador, `main` intacta, #5 abierto.

**Tarea única siguiente:** evaluar aceptación y cierre **administrativo** de #5, determinando si la prueba en Android físico es requisito previo para promoción. No cerrar ni fusionar sin aprobación expresa; no empezar otros issues.

### Decisión de criterio de aceptación #5 — 27/10/2026

**Criterio del creador:** **Android físico no será una prueba obligatoria para cerrar C7/C7-R1 (#5)**. Los cuatro smoke tests controlados de Chromium, la emulación táctil y las 303 pruebas aprobadas con 2 TODO previos son evidencia suficiente para proponer aceptación de esta corrección; no equivalen a certificar Android, TalkBack, toda la experiencia móvil o la versión completa. La validación en dispositivos reales se mantiene como prueba complementaria futura, no bloqueo de este issue. Ver [informe34](34-validacion-navegador-c7-r1.md#decisión-de-aceptación-sobre-android-físico).

**Tarea siguiente única:** solicitar autorización explícita para **aceptar/cerrar administrativamente el issue #5**, sin fusionar PR #14 ni alterar `main`. No cerrar automáticamente por el solo cambio del criterio.

### C7/C7-R1 — Issue #5 cerrado por decisión del creador (27/10/2026)

**Autorización y cierre:** ante la propuesta expresa de «aceptar formalmente C7 y cerrar #5 sin fusionar PR #14», el creador respondió «Continúa». Se interpretó como consentimiento para el **cierre administrativo de [#5](https://github.com/LeviEdition/invierno-en-la-colonia/issues/5)**, **no** como permiso de integración, publicación ni de abordar otro problema. Se agregó al issue el [comentario técnico 6453435186](https://github.com/LeviEdition/invierno-en-la-colonia/issues/5#issuecomment-6453435186) con política aprobada, implementación C7/C7-R1, regresiones, CI, Chromium y límites. El issue se verificó cerrado con `state_reason=completed`.

**Criterios cumplidos:** política A (contribución de herramientas tras búsquedas, completas y deterministas), prioridad condicionada de botín, victoria inmediata, suite verde [40582012525](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40582012525) (**305 declaradas / 303 aprobadas / 0 fallidas / 2 TODO**), revisión crítica e [informe34](34-validacion-navegador-c7-r1.md) (cuatro smoke tests Chromium controlados, encrucijadas reales, 0 errores JS detectados). Android físico se considera opcional para este issue; no se afirma validación Android/TalkBack ni balance exhaustivo.

**Separación esencial:** «issue cerrado» significa que se aceptó el **seguimiento funcional**, no que el parche haya entrado en la versión estable. Todos los cambios ejecutables permanecen en `fix/estabilizacion-v9-9`, [PR #14](https://github.com/LeviEdition/invierno-en-la-colonia/pull/14) **abierto y draft** hacia `refactor/arquitectura`; **`main` sigue en `d9068f4`**. La tarea se registró en este tablero y en el [registro25](25-registro-estabilizacion.md), sin iniciar otro issue.

**Único paso siguiente recomendado, aún sin aprobación para trabajarlo:** **#4 — decidir la política de transferencia de objetos entre supervivientes humanos/IA**. Es un `test.todo` real y exige distinguir cesión cooperativa entre grupos de traspasos internos antes de escribir código. Comparar alternativas y su efecto sobre partidas cooperativas; no implementar ni cerrar #4 hasta que el creador elija una regla. #6 (momento de elección del líder de J2) sigue pendiente; #7 y #13 permanecen fuera del alcance de este cierre.

### Issue #4 — Política de transferencia por modo acordada (27/10/2026)

El creador decidió: **«por ahora, contra la IA sin tradeos; entre J1 y J2 sí»**. Se distingue transferencia *entre grupos controladores* de transferencia *interna entre supervivientes propios*:
- **Contra la IA:** J1 puede reorganizar equipo entre los supervivientes que controla, pero **no puede transferirlo a supervivientes IA**, ni recibir equipo de ellos por la función manual de transferencia. El comportamiento automático de IA no se modifica.
- **Modo local J1 + J2:** transferencias de un objeto equipado **bidireccionales** J1↔J2, más los traspasos internos del grupo, autorizadas desde el **turno del dueño que entrega**. Sin trueque recíproco obligatorio ni aceptar un objeto durante el pase de teléfono.
- Restricciones conservadas: remitente y receptor vivos, misma localidad, remitente propio del turno interactivo, receptor sin equipamiento de categoría duplicada, objeto aún disponible, protección frente a acciones durante el pase/modales y confirmación. Los filtros deben aplicarse en **`startTransfer()` y `chooseTransfer()`**. Texto UI adecuado para modo local.

**Registro de decisión:** [comentario del issue #4](https://github.com/LeviEdition/invierno-en-la-colonia/issues/4#issuecomment-6453681346). **Alcance de esta intervención:** solo registrar reglas; no se cambiaron motor ni tests, no se ejecutaron nuevas regresiones, #4 permanece abierto, dos TODO (#4 y #6) sin resolver, PR14 sigue borrador y `main` intacta. Interpretación declarada, corregible antes de código: «sin tradeos con IA» **no** bloquea mover equipo dentro del grupo del J1.

**Siguiente tarea única propuesta (pendiente de autorización):** C8/#4, preparar regresiones rojo→verde para estos modos y corregir guardas en `startTransfer()`/`chooseTransfer()`, seguida de pruebas Chromium y revisión crítica. No implementar todavía ni saltar al issue #6.

### C8/#4 — Corrección aplicada y verificada, revisión crítica posterior pendiente (27/10/2026)

**Autorización:** el creador aprobó «vamos con la corrección de C8» tras definir previamente que **no hay tradeos con IA pero sí cesión J1↔J2 en modo local**, conservando transferencias internas del propio grupo humano. [Informe35](35-c8-transferencias-por-modo.md) contiene precondiciones, código, 14 pruebas y resultados navegador.

**Red primero:** [commit pruebas `5b4446f`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/5b4446ff8d6b0dad1b918ada94c0835fbed802a9), convierte el TODO #4 en 14 casos activos. [Actions rojo 40585772252](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40585772252) mostró **318 declaradas, 309 aprobadas, 8 fallidas y 1 TODO** (#6). Los fallos exponen accesos cruzados humano→IA, confirmaciones de turno/pase incorrecto, duplicación por cambio de equipo e ítem sustituido mientras está pendiente.

**Verde después:** [commit `37d86d6`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/37d86d6bdb4707ff7ebf95a8274bd5747a08b989): filtro único `canReceiveTransfer` por modo + validaciones repetidas al confirmar (turno, propiedad, receptor, misma localidad, categoría, identidad del objeto), sin añadir IA negociadora. [Actions verde 40585960363](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40585960363): **318 declaradas, 317 aprobadas, 0 fallidas y 1 TODO #6**.

**Chromium:** se verificó identidad de archivo del motor C8 Git blob **`32eb545cbdbca047ded8bc81d64b8e438e096a49`** con GitHub. **Tres recorridos de botones reales aprobados:** humano→otro superviviente propio, sin destinatarios IA; local J1→J2; local J2→J1 luego de pantalla de pase confirmada, con viewport táctil 393 × 852 px. **Sin errores JavaScript**. Pruebas con equipo preparado determinísticamente, sin Android físico ni navegación `file://`. Detalles y reservas: [35](35-c8-transferencias-por-modo.md).

**No se modificó** `main`, no se fusionó PR #14 (draft/base `refactor/arquitectura`), **#4 sigue abierto**; #6 sigue como único TODO. Se recomienda revisión crítica posterior **separada** antes de aceptar/cerrar el issue.

**Única tarea siguiente:** revisión crítica posterior C8/#4 (sin empezar otro issue). No cerrar #4 ni fusionar sin autorización.

### Revisión crítica posterior C8/#4 — 27/10/2026

[Informe36](36-revision-critica-c8.md): auditoría separada de C8, filtros de transferencia y doble comprobación al confirmar, `pendingTransfer.itemRef`, permisos de modo local y humano+IA, control del turno, modales y los 14 casos de regresión. **Dictamen:** sin defectos nuevos confirmados ni cambios adicionales requeridos para esta corrección. Se agregaron **seis controles nuevos de Chromium real** con viewport táctil emulado, todos aprobados sin excepciones JS: destino IA forzado; receptor con arma duplicada y cancelación; ítem de origen sustituido; donante muerto; pantalla de pase activa; categorías distintas (arma + herramienta). Total acumulado de C8: **3 recorridos anteriores + 6 controles nuevos = 9 escenarios** acotados, no partidas completas ni casos agregados a CI.

**Evidencia CI previa de motor:** [40586682191](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40586682191), **318 declaradas, 317 aprobadas, 0 fallidas, 1 TODO (#6)**. No se modificaron HTML o tests en esta revisión. **Límite:** hay otras ventanas/eventos pendientes que `playable()` no modela globalmente; no hay defecto C8 confirmado por la UI y no se amplía alcance sin autorización. Sin Android físico/TalkBack; `main` intacta y PR14 draft. **#4 continúa abierto**.

**Próximo paso único sujeto a aprobación:** aceptación funcional y cierre administrativo del issue #4, **sin** fusionar PR14 ni pasar automáticamente a #6.

### Corrección UX — Alerta del segundo movimiento con combustible (27/10/2026)

El creador preguntó específicamente por los **controles visibles que permiten intentar una acción ilegal**, distinguiéndolos de guardas internas. Auditoría acotada del caso reproducible: pulsar **«Usar»** en carta de combustible después de que el superviviente ya se movió rechazaba la acción **sin mensaje**, aunque `doMove()` sí avisaba. Ante su indicación, se agregó **exactamente el mismo aviso** `⚠ El superviviente ya se movió durante este turno.` en el flujo `ItemEngine.moveWithFuel()` (solo intento de jugador activo), sin gastar carta ni cambiar la regla.

**Pruebas antes:** [CI rojo 40589116325](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40589116325), **320 declaradas, 317 aprobadas, 2 fallidas nuevas, 1 TODO** (#6). [Commit tests `78c55af`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/78c55af021b970427f7372860ab7a038621dbfeb).

**Parche y pruebas después:** [commit `63cb294`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/63cb2949f979631c97152f971f7a2dda171672ba), [CI verde 40589214682](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40589214682), **320 declaradas, 319 aprobadas, 0 fallidas, 1 TODO**. Tres rutas de Chromium con botones reales —rechazo con aviso en J1, rechazo con aviso en J2 local/táctil emulado 393×852, éxito sin modificar para combustible válido—, sin JS errors; se constató que **el toast aparece visualmente**, con rol status/aria-live polite. HTML exacto Git blob `4748627825e9876809ec482cb7c10431e6c07cf9`. [Informe37](37-feedback-movimiento-con-combustible.md) especifica evidencia/límites.

**Reserva y siguiente prioridad a decidir:** esto **no certifica todos los avisos** del juego; solo se corrigió el ejemplo aprobado. Se propone auditoría priorizada **solo de acciones realmente pulsables desde interfaz** en todo C1–C8, antes de nuevos ajustes. No confundir con rechazo de llamadas artificiales ni deshabilitados por diseño. #4 sigue abierto y aceptable según revisión36, pero no fue cerrado por este cambio.

### C8/#4 cerrado; C9/#6 pasa a definición de regla — 27/10/2026

**Autorización del creador:** «sí, hagamos esto que dijiste, sigamos con la ruta», aceptando la propuesta de **cerrar administrativamente #4** y abordar después el issue #6. Se registró el [comentario de aceptación](https://github.com/LeviEdition/invierno-en-la-colonia/issues/4#issuecomment-6454516746) y GitHub confirmó [#4 cerrado/completed](https://github.com/LeviEdition/invierno-en-la-colonia/issues/4) (`2026-10-27T21:51:27Z`). El cierre significa aceptación de C8, **no integración**: PR14 sigue abierto/draft a `refactor/arquitectura`, `main=d9068f4aa8d3a10bbbf1e0a8a2527744cc6952cb` no se modificó.

**Siguiente tarea en curso, solo análisis: C9/#6 (liderazgo inicial J2).** [Issue y opciones documentadas](https://github.com/LeviEdition/invierno-en-la-colonia/issues/6#issuecomment-6454546559). Código verificado: `canPickStartingLeader()` distingue flags de J1 y J2, pero `consume()`, `doMove()` y `playItem()` solo marcan `game.leaderChosen`. **Observado:** J1 pierde la elección de líder inicial tras esas acciones; J2 local puede seguir cambiándolo. `tests/finales-lideres.test.mjs` conserva el único TODO (#6). Mensaje «Durante la primera ronda...» en modal no explica el bloqueo al actuar. [Última CI previa](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40589676353): **320 declaradas, 319 aprobadas, 0 fallidas, 1 TODO**.

**Alternativas pendientes de aprobación:**
- **A recomendada (cambio mínimo):** la primera acción que confirma el líder cierra esa selección en **J1 y J2**, con flags según turno y texto de UI coherente. Mantiene lo que ya hace J1. Precisar qué acciones cuentan (gastar dado, mover, usar carta; revisar habilidad/equipamiento para no dejar excepciones inadvertidas).
- **B:** ambos pueden decidir líder durante toda la ronda 1, aunque hayan actuado. Implica cambiar también el comportamiento actual de J1 y probarlo.

**Alcance actual:** solo comentario #6 y documentación. **No** se implementaron reglas nuevas, ni se alteró `main`, ni fusionó PR, ni cerró #6. Auditoría general de avisos se estaciona como pulido al cerrar Etapa C, no tarea activa.

**Siguiente única decisión:** que el creador apruebe A o B para preparar regresiones rojo→verde de C9/#6.

### C9 / issue #6 — Política A implementada y comprobada (27/10/2026)

El creador **aprobó explícitamente política A**: «J1 y J2 deben confirmar su líder inicial antes de realizar las acciones que bloquean la elección». Se conservó la regla previa de J1: bloquean únicamente **gastar un dado con éxito, moverse válidamente o usar con éxito carta de inventario** durante la ronda 1. Una acción rechazada no confirma el líder; elecciones de sucesor por fallecimiento no se modifican. Los otros actos previamente no bloqueantes (habilidad gratis, equipo desde ficha, contribución a crisis) no se incluyeron porque no forman parte de la regla J1 previa. [Informe38](38-c9-lider-inicial-j2.md).

**Pruebas primero:** se sustituyó el único `test.todo` #6 por **12 regresiones C9**: J1/J2 con dado, movimiento, carta, acción fallida, selección explícita, ronda 2 y texto de interfaz. [CI rojo 40591148076](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40591148076): **331 declaradas, 327 aprobadas, 4 fallidas, 0 TODO**. Fallaron tres caminos de J2 y un texto UI, confirmando defectos reales.

**Corrección:** [commit `38e7ac8`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/38e7ac87832e4ca02dbf277dcc1a8acb56ce2849). Nueva función `confirmStartingLeader()` cambia solo flag del controlador (`leaderChosen` J1 / `localLeaderChosen` J2 local), reutilizada en `consume`, `doMove` y `playItem` después del éxito. Menú «Grupo y líderes» explica «antes de gastar un dado, moverte o usar una carta». [CI verde 40591238120](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40591238120): **331 declaradas / 331 aprobadas / 0 fallidas / 0 TODO**.

**Chromium real:** cinco escenarios con botones de menú, acción y pase de J1→J2, incluidos dos en viewport móvil táctil simulado 393×852: J1 gasto dado, J2 gasto dado tras pase, intento J2 de movimiento inválido (elección permanece), J2 usa ración (bloquea elección), J2 elige líder antes de actuar (se confirma). **Cinco aprobados, sin errores JS**. Copia local del HTML verificada por Git blob **`b5b9f2020c5abb73fd95e0f7441db088bb746d16`**, igual al de GitHub. No partidas completas ni Android físico.

**Estado:** cambio implementado, issue #6 **abierto**; pendiente revisión crítica posterior independiente y aceptación del creador. PR #14 abierto/draft hacia `refactor/arquitectura`; `main` intacta.

**Siguiente único paso recomendado:** revisión crítica posterior C9/#6, sin cerrar el issue ni fusionar el PR automáticamente.

### Revisión crítica C9/#6 y corrección C9-R1 — 27/10/2026

**Decisión final del creador:** conservar la **elección manual del líder humano como en *Dead of Winter***, sin forzar nombramiento automático de mayor influencia. Se mantiene política A previamente aprobada: durante ronda 1 las acciones válidas de dado, movimiento y carta cierran la elección inicial **de cada jugador por separado**; sucesión tras muerte sigue siendo manual para humanos, automática para IA.

**Hallazgo en revisión crítica:** si el líder **de J2 muere mientras actúa J1**, el modal de sucesión se muestra a **J1** y J1 puede elegir al sucesor del otro. Se **reprodujo en Chromium real**, incluyendo clic en «Sol» durante `game.turn='human'`. Se trata de P2 de propiedad de decisión, no del cálculo de influencia. [Informe39](39-revision-critica-c9-r1.md).

**Primero las regresiones:** [tests `ed817b5`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/ed817b59825268c54aa1f183c783f19af3189c83), **5 casos** en `tests/finales-lideres.test.mjs`. [CI rojo 40593244756](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40593244756): **336 declaradas, 331 aprobadas, 5 fallidas, 0 TODO**. Se comprobó que J1 podía elegir por J2, que su turno quedaba bloqueado y que la elección propia podía verse interferida.

**Parche C9-R1:** [`e84db6a`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/e84db6ae088f314e232e377c15cda37683cce19b), añade `leaderChoiceReady()` y separa la sucesión vigente **del turno de su propietario** en `chooseLeader`, guardas de acciones, pintado/modal y `finishTurn`/`confirmPass`. Si muere líder J2 durante turno J1, **J1 puede seguir y finalizar**, se muestra **pantalla real de pase** y J2 elige su sucesor después de recibir control. **CI verde 40593438595**: **336 declaradas, 336 aprobadas, 0 fallidas, 0 TODO**.

**Chromium después de R1:** tres recorridos reales aprobados con blob exacto GitHub **`2682f96f0d451eb0083fd9eaa3762b266f8aab60`**: elección manual J2 tras pase J1→J2 en móvil 393×852, sucesión inmediata del dueño J1, IA sucesora automática. Cero excepciones JS detectadas. Incluida preparación determinista de muerte para reproducir el borde, no partidas completas ni Android físico. Total C9: **5 escenarios UI iniciales, 5 escenarios positivos adicionales de revisión y 3 positivos de R1**. Reserva pendiente para estabilización general: muertes simultáneas de dos líderes cuando existe solo un `pendingLeader` global.

**Estado:** #6 **permanece abierto** hasta que el creador lo acepte; PR14 sigue abierto/draft hacia `refactor/arquitectura`, `main` intacta. La auditoría de mensajes quedó estacionada y no se iniciaron #7/#13.

**Próximo paso único recomendado:** aprobación y cierre **administrativo** del issue #6, sin publicar ni fusionar la rama; luego elegir siguiente tarea de etapa C.

### C9/#6 aceptado y cerrado por autorización expresa — 27/10/2026

El creador indicó **«cerra el issue»** después de la propuesta explícita de aceptar C9 y cerrar #6 sin fusionar PR14. Se dejó [comentario de cierre con pruebas](https://github.com/LeviEdition/invierno-en-la-colonia/issues/6#issuecomment-6455187002) y GitHub confirmó el [issue #6](https://github.com/LeviEdition/invierno-en-la-colonia/issues/6) en estado **closed/completed** (`2026-10-27T22:30:07Z`).

**Alcance funcional aceptado:** C9 política A iguala la confirmación del líder inicial tras acciones válidas para J1 y J2, mantiene la elección manual humana al estilo *Dead of Winter*; C9-R1 impide que un jugador elija al sucesor del otro cuando este muere durante su turno, sin bloquear el pase. La IA continúa eligiendo automáticamente su líder cuando corresponde. [Informe38](38-c9-lider-inicial-j2.md) y [revisión crítica/corrección39](39-revision-critica-c9-r1.md). **Último CI verde antes del cierre:** [40594225022](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40594225022), **336 declaradas, 336 aprobadas, 0 fallidas y 0 TODO**. Se verificaron recorridos Chromium de sucesión y pase. **No** Android físico ni cobertura exhaustiva de muertes simultáneas de ambos líderes; el `pendingLeader` único queda como riesgo para revisión transversal.

**No implica publicar/integrar:** PR [#14](https://github.com/LeviEdition/invierno-en-la-colonia/pull/14) continúa **abierto/draft** sobre `refactor/arquitectura`, código de corrección solo en `fix/estabilizacion-v9-9`; `main` permanece en `d9068f4aa8d3a10bbbf1e0a8a2527744cc6952cb`. No se abrió ni empezó otro issue.

**Próximo paso único recomendado, sujeto a aprobación del creador:** analizar [#7](https://github.com/LeviEdition/invierno-en-la-colonia/issues/7), decisiones de IA en las encrucijadas según texto de consecuencias, y definir criterio determinista con efectos estructurados antes de modificar código. La accesibilidad táctil [#13](https://github.com/LeviEdition/invierno-en-la-colonia/issues/13) y auditoría general de alertas permanecen en la ruta de estabilización.

## Análisis de arquitectura #7 — propuesta Utility AI, 27/10/2026

**Pedido explícito:** analizar encrucijadas y proponer módulos, dependencias, riesgos y secuencia de pruebas; **sin modificar código ni crear commits**. [Informe41](41-propuesta-utility-ai-encrucijadas.md). Se leyeron 26 cartas/52 opciones, activación, elegibilidad, callbacks, actor/dueño y espera de IA. La selección actual todavía depende del texto; no se cambió.

**Propuesta no implementada:** catálogo con IDs y consecuencias estructuradas; contexto de solo lectura; proyección sin efectos secundarios; política de utilidad por estado; selector determinista conectado al flujo actual. Preservar reglas y decisión manual local; migrar gradualmente con conformidad de efectos, sin rediseñar todo el motor. Pesos/prioridades no aprobados automáticamente.

**Validación de la revisión:** 30/30 tests existentes de encrucijadas aprobados, incluidos tests de caracterización de la heurística errónea. No se añadieron pruebas ni se repitió navegador/suite completa. Solo documentación local, `git diff --check`; sin staging, commit o push. `main` y PR14 intactos.

**Siguiente tarea única propuesta:** acordar contrato y ejemplos de decisión del paso1 del informe41; después, implementar por bloques con sus pruebas. No se implementó #7 ni se inició #13.

## Comparación de alternativas para #7 — 27/10/2026

El creador solicita evaluar críticamente Utility AI frente a otras posibilidades. [Comparación en informe41](41-propuesta-utility-ai-encrucijadas.md#2-bis-comparación-crítica-de-alternativas--27102026). **Recomendación técnica no aprobada:** comenzar con prioridades contextuales sobre efectos estructurados, conservando una interfaz que permita Utility después. Con dos opciones por carta, puede ser más explicable y comprobable; no elimina el costo de proyectar efectos ni garantiza mejor estrategia. Utility conserva valor para compensaciones graduales; planificación de varios turnos se pospone por costo/alcance.

No se seleccionó algoritmo ni orden final de prioridades, no hubo nuevas pruebas ejecutadas y no se modificó código. Solo documentación local de esta comparación, sin commits por instrucción vigente. **Siguiente tarea única propuesta:** contrastar escenarios y decidir prioridades o Utility antes de implementar #7. Las reglas existentes, `main` y PR14 permanecen intactos.

## Comparación concreta de políticas #7 — 27/10/2026

A pedido del creador se compararon prioridades y Utility con seis escenarios de cartas actuales, usando 12 resoluciones aisladas de sus efectos reales. [Informe42](42-comparacion-politicas-encrucijadas.md): cinco acuerdos y un desacuerdo con moral baja/alimentos insuficientes; cambiar un peso Utility invierte esa elección. Son perfiles ilustrativos no aprobados, no una medida de superioridad o balance. Ambos respetan opciones legales y desenlaces terminales del juego.

Solo auxiliares temporales externos y documentación local42/41/18/25; sin cambios de código del repositorio, commits ni implementación de IA. No se repitieron suite completa o navegador. **Siguiente decisión única propuesta:** acordar cómo priorizar moral frente a reservas alimentarias cuando ninguna opción cubre el déficit, y usarlo para precisar el evaluador #7. Sin aprobar algoritmo por silencio, sin fusionar.

## 3. Etapas posteriores: una por vez

| Etapa | Propósito | Criterio para habilitar la siguiente |
| --- | --- | --- |
| **A — Auditar** | Caracterizar reglas, interfaces, turnos e integración | Matriz de cobertura actualizada, lista de pruebas manuales ejecutadas y defectos identificados; límites explícitos |
| **B — Definir reglas y priorizar defectos** | Resolver ambigüedades y clasificar fallos por gravedad | Comportamiento esperado escrito para cada corrección prioritaria; decidir qué se corrige ahora y qué se pospone |
| **C — Corregir y estabilizar** | Corregir defectos aprobados en cambios aislados con regresiones | Pruebas automáticas verdes + pruebas de humo manuales + estado jugable estable comprobado |
| **D — Refactorizar sin alterar comportamiento** | Separar estado, reglas, comandos, turnos, IA y vista en módulos | Equivalencia de comportamiento y pruebas preservadas; ningún cambio inadvertido de mecánicas |
| **E — Prototipo narrativo persistente** | Implementar una historia conectada que condicione recursos/objetivo y recuerde decisiones | Dos rutas jugables con resultados diferentes, consecuencias diferidas, pruebas y estados alternativos cuando mueren personajes |
| **F — Campañas y presentación** | Expandir campañas, personajes, epílogos, arte 2D y después juego online | Criterios y pruebas propios por subetapa, acordados al iniciar |

**Compuerta:** no dar por terminada A solo por tener muchas pruebas. Hay que demostrar cobertura en navegador real. No empezar a programar E mientras A siga abierta, salvo autorización explícita para cambiar la ruta.

## 4. Protocolo obligatorio para cada bloque

**Antes de trabajar:**
- Decir: etapa activa, ID de tarea, alcance y *qué no se va a tocar*.
- Revisar los archivos originales pertinentes, supuestos y pruebas ya existentes. Confirmar primero lo básico antes de cambiar configuración.
- Definir condiciones reproducibles de éxito y fracaso.

**Durante:**
- Una tarea a la vez y cambios pequeños.
- Documentar hallazgos con **precondición → acción → esperado → observado → prueba**.
- Si aparece una pregunta de reglas no acordada, detener solo esa decisión y consultarla; no corregirla inventando criterios.
- Toda idea interesante fuera de la etapa va al **estacionamiento**. No derivar hacia su implementación.
- Distinguir fallo confirmado, restricción técnica, propuesta creativa e hipótesis.

**Para cerrar:**
- Ejecutar pruebas del bloque y suite `npm test` si se modificaron pruebas/código.
- Comprobar resultado de GitHub Actions y SHA de V9.9 cuando haya commits.
- Actualizar este tablero tras cada revisión, incluso sin cambios de código; registrar acciones, decisiones, cambios, resultados y límites en la documentación pertinente. Actualizar la matriz cuando corresponda e incluir enlaces a commit/prueba/incidencia.
- Explicar en lenguaje claro **qué se verificó, qué NO se verificó y cuál es la única siguiente tarea**.
- No iniciar esa tarea siguiente en el mismo bloque de trabajo sin confirmación del usuario.

## 5. Registro de decisiones, defectos e ideas

**Decisiones aprobadas:** normas que el usuario confirmó. Registrar en la documentación de diseño respectiva; si afectan el comportamiento, requieren aceptación explícita antes de programarlas.

**Defectos:** GitHub Issues, con evidencia y severidad, separados de cambios de diseño. Un fallo de seguridad/privacidad o pérdida de datos puede ameritar prioridad especial; hay que informarlo.

**Ideas estacionadas (no etapa activa):**
- Narrativa central con decisiones grises, público +16 y consecuencias reales.
- Campañas con objetivos fijos, duración variable, historias secundarias y epílogos distintos.
- «Encontrar la cura»: investigación, científicos, secta antagonista y muestras disponibles mediante la trama.
- Modo cooperativo online en celulares diferentes; escenas isométricas y presentación visual.
- Arco piloto «Los que quedaron afuera», solo borrador y no canon.

Los detalles están en `docs/12`–`docs/17`. **No abrir nuevos frentes para ampliarlos durante la auditoría.**

## 6. Regla para desviaciones y cambio de prioridad

Si surge una idea fuera de la tarea activa:

> «Es una idea para la hoja de ruta, pero ahora estamos **en la tarea activa indicada en este tablero**. La registro y seguimos la estabilización. ¿Querés cambiar explícitamente la prioridad?»

Solo cambiar la etapa activa con una decisión consciente; registrar motivo, riesgos, estado de la tarea interrumpida y cómo retomarla. No es necesario prohibir las conversaciones creativas: **conversar no equivale a cambiar la etapa ni a comenzar a programar**.

## 7. Ubicación de la información

- **Qué hacemos ahora:** este archivo `docs/18-tablero-operativo.md`.
- **Qué subsistemas faltan auditar:** `docs/04-matriz-auditoria-funcional.md`.
- **Por qué y cómo refactorizaremos después:** `docs/01-plan-refactorizacion.md`.
- **Norma de evaluación objetiva:** `docs/15-protocolo-revision-critica.md`.
- **Propuestas narrativas (estacionadas):** `docs/12`–`docs/17`.
- **Defectos/decisiones por resolver:** GitHub Issues.

**Tarea activa única: entregar C10/#7 para revisión del creador, con prioridades contextuales aprobadas, pruebas locales y Chromium verdes y revisión independiente sin defectos confirmados. CI del código aprobada; entrega documental final comprobada por SHA antes de informar. Sin cierre del issue, fusión ni versión estable.**


## C10/#7 — checkpoint histórico de primera revisión, 28/10/2026

El creador aprobó prioridades del informe42, con R3→apagar la radio, desempate numérico determinista y autorización de commits/push exclusivamente a `fix/estabilizacion-v9-9`. Esto sustituye la restricción anterior de solo análisis. Utility completa, #13 y arquitectura narrativa quedan fuera del alcance.

**Primera revisión:** las consecuencias llamaban funciones globales; copiar `game` sin adaptar sus dependencias era inseguro. Se optó por un contexto explícito opcional para compartir las reglas de zombis, muerte, reemplazo/reclutamiento, alimentación y verificación, separando sus efectos de interfaz. Los requisitos se anexan a las opciones para independizarlos también del título.

**TDD comprobado:** 43 tests de encrucijadas, rojo32/43 (11 fallidos), luego verde43/43. Se ampliaron a50/50: seis aceptaciones, elegibilidad, texto independiente, aislamiento con spies de azar/UI, muertes, reemplazo, indefensos, cocinero, empate y conformidad de las52 opciones en624 combinaciones. Suite inicial349/349 antes de esta última ampliación; suite final pendiente. Experimento temporal adicional compara624 resoluciones con el HTML de `6fdb774`: sin diferencias en reglas, estados mecánicos o pendientes. Segunda revisión independiente y Chromium en curso. [Informe43](43-c10-encrucijadas-prioridades.md).

**Siguiente paso único:** terminar revisión independiente y pruebas de interfaz; corregir cualquier defecto confirmado antes de publicar para revisión en PR14. #7 permanece abierto, `main` intacta.


### C10/#7 — segunda revisión y validación final local, 28/10/2026

**Revisión crítica independiente solicitada por el creador:** otro agente revisó el diff sin editar ni crear commits. Ejecutó 312 evaluaciones con el acceso global a `game` prohibido mediante Proxy y spies que rechazan azar, mensajes y avisos de muerte; todas aprobadas. Comprobó además falta de reemplazos al completar muestras, diez candidatos de reclutamiento y derrota por desbordamiento. No encontró defectos confirmados. Se retiró una consulta redundante a `isLeader()` después de marcar al personaje muerto; no alteraba resultados. Dos casos adicionales quedan permanentes en la suite (falta de reemplazos frente a objetivo y acceso global prohibido).

**Resultado final local:** `npm test`, 358 declaradas, 358 aprobadas, 0 fallidas/canceladas/omitidas y 0 TODO; 52 de encrucijadas. Chromium 154: 16 recorridos dirigidos aprobados, 8 por viewport (1365×768 y 393×852 móvil emulado): seis casos de IA, J1 y J2 manuales con opción no permitida y pase real. Sin excepciones JavaScript. El script `scripts/check-issue7-browser.mjs` y la evidencia JSON se conservan; estados preparados, no partidas naturales ni Android físico. La repetición final tras la simplificación también aprobó los 16 recorridos.

**Integración documental:** antes del push se detectaron commits remotos `7b4de9b`/`f202184` del otro chat, solo documentos18/25. Se avanzó por fast-forward y se recuperó el trabajo local de un stash; los dos conflictos de documentación se resolvieron conservando las decisiones de continuidad y los informes nuevos. Sin reescritura de historial ni force-push. No hubo cambios de motor remotos que invaliden las pruebas.

**Límites y recomendación:** evaluación inmediata, reclutamiento conservador y puntaje simple; futuras cartas deben respetar el contexto. Sin balance exhaustivo, Android físico/TalkBack ni validación del riesgo preexistente de líderes simultáneos. Técnicamente recomendable para aceptación de #7 si CI confirma esta entrega; el issue sigue abierto por instrucción. **Único paso siguiente: revisión del creador; no comenzar #13 ni narrativa.**


### C10/#7 — publicación para aceptación, 28/10/2026

Código y evidencia subidos en **`9e68862`**, exclusivamente a `fix/estabilizacion-v9-9`. [CI 40622261665](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40622261665) **completed/success**, logs 358/358 y sin TODO. PR14 actualizado en título/cuerpo para C1–C10; sigue **abierto/draft hacia `refactor/arquitectura`**. La actualización documental de esta evidencia se verificará también por SHA en Actions, sin cambiar ejecutable.

**Recomendación final de la revisión:** #7 es técnicamente apto para aceptación, con evaluación inmediata/conservadora y límites de balance/dispositivo documentados. **Única tarea siguiente: revisión y aceptación del creador antes de cierre administrativo. #7 sigue abierto; no iniciar #13, fusionar o publicar. `main` remoto permanece `d9068f4`.**


## C11/#13 — primera revisión y corrección R1 en verificación, 28/10/2026

Referencia C10 Chromium 16/16 aprobada. Se reproduce26×25 px y gap3 px; Playwright rojo27 comprobaciones de geometría fallidas en los tres tamaños mínimos, con trazados mecánicos completos y 0 errores JS. Parche solo CSS:44×44/gap8 y franja inferior reservada, tablero desplazable y pool desplazable si excede dos filas. JavaScript idéntico al de 2fbbc59. Componente111/111 y suite 358/358 aprobados tras primer parche.

**Revisión independiente: R1/P2 confirmado y no ocultado por el verde inicial.** Fuera de los tres tamaños obligatorios, en 852×393/640×320 y 320×480 la franja podía quedar fuera de pantalla. Se reproduce antes de corregir y se añade fallback para permitir scroll de página en alturas≤520 px. Se verifica en seis viewports y segunda revisión. [Informe44](44-c11-dados-tactiles.md). Se refina el arnés para respetar recortes de overflow y no confundir dados fuera del scroll con colisiones visibles.

**Único paso siguiente:** concluir R1 y validación de C11, documentación/push/CI. Auditoría fase4 todavía no iniciada; ningún otro issue implementado, #7 sigue pendiente de aceptación y no se cierra.


## C11/#13 — validación final y segunda revisión R1, 28/10/2026

**Resultado:** dados44×44/gap8; franja inferior con espacio propio, tablero y pool desplazables, menús accesibles. Solo19líneas CSS; JavaScript y DOM idénticos a 2fbbc59. R1 corregido mediante scroll de página en altura≤520 px; no quedan defectos confirmados de C11 tras revalidación independiente.

**Evidencia final:** componente 111/111, `npm test`358/358, sin fallos/TODO. Chromium 6 viewports (320×640/393×852/1365×768 y 852×393/640×320/320×480),24 mediciones/0 fallos/0 errores JS, selección de cada dado del pool 16, consumo correcto, pase J1→J2, siete localidades y menú accesibles. Tres trazados antes/después idénticos; revisión independiente revalida R1 en las tres ventanas bajas. [Informe44 y evidencia](44-c11-dados-tactiles.md). C10 se repitió en navegador antes/después sin cambios de reglas. Sin Android físico/TalkBack.

**Única siguiente tarea:** publicar C11 y comprobar CI exacto; solo después habilitar auditoría fase4 de pendientes. #7/#13 siguen abiertos para revisión del creador, PR14 draft, `main` intacta. No empezar programación de otros issues ni D/E.


## C11 aprobado; fase4 habilitada — 28/10/2026

**Commit C11:** `7497d704e8888609c108ffa06d7bb52ff9d02701`; [Actions 40625219012](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40625219012) **completed/success**,358/358 y 0 fallos/TODO según logs. Documentado en 44, 25 y matriz; evidencia de seis viewports y revisión R1 preservada. #13 sigue abierto para aceptación, #7 también; no main/fusión/cierres.

**Única tarea activa ahora:** auditoría de lectura, pruebas no destructivas y documentación de issues abiertos, especialmente #2/#3/#8/#9/#10/#11/#12. Sin implementar otros cambios. Clasificar correcciones pendientes de cierre, fallos vigentes y límites; proponer riesgos de integración y una siguiente tarea para revisión humana.


## Auditoría fase4 completada — 28/10/2026

**Solo lectura, pruebas no destructivas y documentación.** #2/#3/#8/#9/#10/#11/#12 ya tienen arreglo en la rama:54/54 regresiones dirigidas y 21 comprobaciones Chromium (siete issues×tres viewports) aprobadas,0 errores JS. Permanecen abiertos administrativamente; no se cerró ninguno. #7/#13 implementados y pendientes de aceptación. [Tabla y evidencia45](45-auditoria-pendientes-estabilizacion.md).

**H1/P2 confirmado, fuera de C11 y sin corregir:** una crisis con dos desbordamientos mata a ambos líderes locales; se registra la sucesión J1 pero se descarta la de J2. Tras elegir J1 y pasar a J2 en ronda 2, hay dos supervivientes J2 vivos, líder null y ningún pendiente que permita elegirlo. Reproducido mediante colonia y botones reales tanto en 7497d70 como en 2fbbc59; es preexistente y no una regresión CSS. No se alteran reglas ni se reabre #6.

**Conclusión:** C11 está técnicamente terminado; C no debe considerarse cerrada por tener358 tests verdes. Se separan riesgos de integración y posibles diferencias con mesa, sin cambiar mecánicas. Se detectan ambigüedades históricas de documentación y alcance de foco limitado a setup/pase; lector de pantalla, Android y partidas naturales no certificados.

**Única siguiente tarea recomendada (no iniciada): corregir H1, sucesión múltiple local, mediante una nueva autorización y regresión previa.** Sin otro código durante la auditoría, sin main/fusión/cierres ni D/E. Entrega documental final con comprobación de CI por SHA antes de informar.


**Control final documental:** conteos y trazados cotejados contra JSON, DOM/JS idénticos a 2fbbc59 y sin cambios de código durante fase4. PR14 título/cuerpo actualizado aC1–C11, permanece abierto/draft hacia refactor/arquitectura. Se publica documentación/evidencia y se confirma CI final por SHA antes de entregar. Ningún issue cerrado, creado o reabierto. Única siguiente propuesta: H1 con autorización nueva.
