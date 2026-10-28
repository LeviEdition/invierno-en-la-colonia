# 49 — C15: auditoría final de estabilización V9.9

**28/10/2026, Montevideo. Rama `fix/estabilizacion-v9-9`, PR14 draft a `refactor/arquitectura`.** Base de misión43f7c11, base de esta auditoría d801dbb. Este informe consolida C12–C15; no sustituye las evidencias históricas ni declara C cerrada.

## Dictamen ejecutivo

Recomiendo **presentar C para aceptación técnica con reservas explícitas**. No quedan bloqueos graves confirmados en los recorridos comprobados después de las correcciones. No recomiendo una declaración de accesibilidad completa, equivalencia total con mesa o versión estable. El creador debe revisar las reservas y decidir el cierre oficial; D no se ha iniciado.

C12 conserva las dos sucesiones por dueño. C13 protege y encadena decisiones, libera esperas y evita continuaciones de partidas antiguas. C14 aporta cuarenta configuraciones completas reproducibles del motor y cinco recorridos completos de interfaz. C15 contrasta reglas oficiales, repite la cobertura relevante y encuentra/corrige dos defectos adicionales. **402/402 tests, cero fallidas/canceladas/omitidas/TODO**, incluida revisión independiente. El CI exacto del código f1a43c7 está aprobado: [CI40691454445](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40691454445),402/402; el checkpoint documental se verifica también por su SHA en Actions al entregar.

Permanece una **reserva P2 de accesibilidad**: el foco puede salir de ayuda y fallecimiento. Inicio/pase sí lo aíslan. C15 bloquea la elección de sucesor que esa fuga permitía durante una muerte; no implementa un sistema universal de foco. No llamar a #12 una auditoría completa de todos los diálogos.

## Qué se revisó y qué cambió

Se leyeron protocolo15, tablero18, registro25, informes43–48, matriz04 y funciones reales de inicio/objetivos, turnos, acciones/costes, habilidades, objetos, colonia, crisis, exposición, muerte, reemplazos, sucesiones, finales, IA y decisiones. Se consultaron PR/issues/CI y refs GitHub. No se cambiaron balance, objetivos, política C10 ni consecuencias de cartas.

| Hallazgo de la misión | Resultado y evidencia |
| --- | --- |
| C12 H1: una sola petición perdía al segundo líder | Cola por dueño;13 regresiones. [46](46-c12-sucesiones-simultaneas.md) |
| C12 R1/P1 y R2/P2 de revisión: IA antigua actúa tras reinicio/final | Identidad de partida y terminal al reanudar; regresiones y nueva revisión. [46](46-c12-sucesiones-simultaneas.md) |
| C13: acciones durante decisiones, esperas perdidas, IA después del final | Guardias compartidas, cancelación/liberación y21 regresiones. [47](47-c13-integracion-profunda.md) |
| C13: siguiente diálogo oculto y resoluciones fuera de prioridad | Pintado de la siguiente decisión y guardias; incluidos en las21 pruebas. [47](47-c13-integracion-profunda.md) |
| C15 T1/P1: moral cero por hambre/residuos podía recuperarse con bonus posterior de crisis | `colony()` comprueba `verify()` y retorna entre pasos; también detiene oleadas/ruido y rechaza colonia ya terminada |
| C15 T2/P2: Tab→Enter podía elegir líder detrás de fallecimiento | `chooseLeader()` rechaza `deathWaiting()`, tanto en cola como visible |
| C15 A1/P2: foco sale de ayuda/fallecimiento | Confirmado y pendiente; no se declara resuelto por la guardia funcional |

### C15 T1: precondición, rojo y arreglo

Comida0, moral1, crisis con4 aportes válidos para necesidad2, zonas vacías. La alimentación llevaba moral a0; después el bonus de crisis la devolvía a1 y la partida continuaba. El reglamento oficial p14, la ayuda del producto y la prueba vigente «moral cero provoca derrota inmediata» respaldan la derrota. No era una nueva decisión de balance.

Primero se escribieron seis regresiones de colonia: **6/6 fallidas** sobre d801dbb. Luego se aplicaron retornos locales al detectar terminal después de alimentación, residuos, crisis, cada aparición de oleada y cada tirada de ruido. Se mantuvieron `resolveCrisis()`, `kill()`, `addZombie()` y callbacks C10 intactos: una consecuencia de carta/crisis sigue siendo atómica, como antes. No se insertó verificación global dentro de las muertes ni se alteró propagación de mordedura.

Las fichas de ruido de la zona en curso siguen retirándose juntas antes de sus tiradas, semántica previa; al terminar no se procesan tiradas restantes ni zonas posteriores. La prueba de fichas posteriores comprueba la **zona siguiente**, no extracción literal ficha por ficha del reglamento.

### C15 T2 y revisión independiente

El revisor reprodujo en Chromium393×852: Mara con dos heridas se mueve, muere por exposición, deja sucesión y encrucijada; Tab sale de Continuar hacia un botón de líder debajo del aviso y Enter podía cambiar líder/cola durante `deathDirector.active`. La guardia localizada ahora conserva ambos. Tras confirmar fallecimiento, elegir líder y resolver la siguiente encrucijada se recuperan las acciones.

Dos regresiones permanentes cubren fallecimiento en cola/visible. Las **ocho pruebas C15 fallan contra una copia exacta d801dbb y pasan después**; esta comparación posterior complementa el rojo previo de las seis de colonia y la reproducción UI del revisor. [Tests](../tests/terminales-colonia-c15.test.mjs).

La primera suite con la guardia dio395/402: siete escenarios antiguos intentaban elegir sucesor sin confirmar muerte. Se corrigió solo su preparación con `deathDirector.open()/continue()`; las expectativas de dueño, líder y cola permanecen iguales. No se eliminaron tests, ni se añadieron skip/TODO. Después **402/402** local e independiente.

## Matriz actual de sistemas y cobertura

**P significa probado parcialmente**, con límites; no «todo correcto». La tabla original de04 describe la auditoría histórica, mientras esta tabla corresponde a la rama actual. Los scripts Chromium son comprobaciones separadas de los402 tests Node.

| ID | Sistema y contrato revisado | Evidencia actual y límite |
| --- | --- | --- |
|01|Inicio/objetivos/reinicio|P: `estado-inicial`, C12/C13 reinicio, C14/C15 create real; tres objetivos, distribución4/15/1 por modo |
|02|Turnos/rondas|P: `colonia-turnos`, `modo-local-privacidad`, C12/C13 y40 partidas; no todas las intercalaciones posibles |
|03|Dados/mejora/consumo|P: #3, C13 consumo/decisión, C11/C15 taps y geometría; no dispositivo físico |
|04|Movimiento/capacidad/combustible|P: `movimiento-exposicion`, C13 muerte encadenada y partidas; entradas preparadas y naturales diferenciadas |
|05|Exposición|P: resultados y habilidades en tests, partidas con LCG; equivalencia probabilística con dado físico no demostrada |
|06|Mordedura/muerte|P: `rondas-mordeduras`, C12/C13 esperas/reemplazo, C15 teclado; no todas las combinaciones de personajes |
|07|Búsqueda/botín/ruido|P: `busqueda-objetos`, C13 cadena y confirmación repetida, partidas UI |
|08|Objetos/recursos|P: `combate-equipamiento`, catálogo, C13 y observadores C14; identidad no detecta toda clonación imaginable |
|09|Equipo/transferencia|P: C8/#4, consumo/doble confirmación C13 y UI; transferencia no forzada en estrategia C14 |
|10|Habilidades/influencia/liderazgo|P: `finales-lideres`, C12 H1 y C15 muerte; habilidades propias, no reproducción de todas las cartas de mesa |
|11|Zombis/barricadas/desbordamiento|P: `colonia-turnos`, C12/C13 crisis real, C15 terminal; colonia agregada difiere de seis entradas |
|12|Alimentación/hambre/residuos/colonia|P: tests específicos y8 nuevos C15,6 recorridos UI C15; consecuencias de crisis conservan atomicidad |
|13|Crisis/aportes|P: cartas válidas/equipo/IA/premios/penalizaciones y partidas; sin sabotaje ni crisis oficiales completas |
|14|Encrucijadas|P:52 tests,624 conformidades C10,16 recorridos reejecutados C15 y partidas; nuevas cartas futuras requieren repetir conformidad |
|15|IA|P: `ia-turnos`, C10 prioridades, C12/C13 terminal/reinicio y20 partidas; decisiones de un turno, sin prueba de estrategia óptima |
|16|Dos jugadores/pase/propiedad|P: C3/C4/C5/C9/C12/C13,20 partidas y3 comprobaciones de foco; sin prueba física de privacidad durante un pase real |
|17|Victoria/derrota/finales|P: `finales-lideres`, A4, C13 y C15 T1; ocho derrotas/32 victorias en lote, no todos los finales posibles |
|18|Interfaz/modales/accesibilidad|P: UI real,6 cadenas C13 y6 C15; A1 pendiente para ayuda/fallecimiento, no certificación WCAG/TalkBack |
|19|Móvil/rendimiento|P: seis viewports de dados y móvil393×852 completo; sin Android físico, perfiles de rendimiento o compatibilidad de otros navegadores |
|20|Guardado/reconexión/red|Futuro: no implementado, fuera V9.9; no prometer persistencia tras recargar |
|21|Narrativa persistente/escenas2D|Futuro: diseño, no implementado; E/F no iniciadas |

## Pruebas y evidencia final

Referencia de misión **358/358**; C12 **371/371** (+13); C13 **392/392** (+21); C14 **394/394** (+2 tests agregados que ejecutan40 partidas); C15 **402/402** (+8). Total **44 tests permanentes nuevos**, no cuarenta tests extra por cada repetición del lote. Logs de rojo y verde se resumen en [evidencia de regresiones](evidencias/c15-regresiones.json); los tests y scripts quedan versionados para reproducirlos.

Chromium154, HTML final SHA256 `4181e974c276de36d08bb0bbc99b0a877bec49317d5777734905eb83ca09bff7`:

| Verificación repetida después del parche C15 | Resultado/evidencia |
| --- | --- |
|Dados, taps, seleccionado/deshabilitado/gastado, menús/paneles/scroll|6 viewports:320×640,393×852,1365×768,852×393,640×320,320×480;24 mediciones,44×44 mínimo/gap8,0 colisiones indebidas/overflow/errores. [JSON](evidencias/c15-dados.json) |
|Encrucijadas C10|16 casos, incluidos R1/R2/R3/M1/M2/S1 y decisiones locales,0 errores. [JSON](evidencias/c15-encrucijadas.json) |
|Sucesión múltiple C12|6 casos, dos órdenes y automático IA,393/1365,0 errores. [JSON](evidencias/c15-sucesiones.json) |
|Cadenas C13|6 casos,393/1365,0 errores. [JSON](evidencias/c15-integracion.json) |
|Foco setup/pase y observación de A1|3 viewports,13 Tab/Shift+Tab por pantalla, foco exterior rechazado en pase; A1 confirmado. [JSON](evidencias/c15-foco.json), [script](../scripts/check-c15-accessibility.mjs) |
|Terminal hambre/residuos y teclado detrás de muerte|6 casos,393/1365,0 errores; continuidad legítima comprobada. [JSON](evidencias/c15-terminal-browser.json), [script](../scripts/check-c15-terminal-browser.mjs) |
|Partidas completas mediante botones|5/5 completas, sin errores/invariantes/reintentos. [JSON](evidencias/c15-partidas-ui.json) |

Son escenarios preparados salvo las partidas completas. C11 usa taps; C14/C15 partidas usan clics sobre interfaz real con emulación móvil. Ninguno equivale a Android físico, TalkBack o jugadores humanos. Dos fallos del nuevo arnés de foco se corrigieron antes de aceptar resultados: consultaba `.inert` en el botón en vez de su ancestro y trataba un aviso legítimo en log/last como mutación mecánica. No eran fallos del juego.

### Repetición completa del lote tras C15

Se conservaron C14/informe48 y su JSONL original. Se volvió a ejecutar **la misma** estrategia/40 semillas contra el motor corregido; son40 configuraciones únicas repetidas, no80 diferentes. [JSONL final](evidencias/c15-partidas.jsonl), [resumen](evidencias/c15-resumen.json), [comparación](evidencias/c15-comparacion-partidas.json).

| Modo | Completas | Victorias | Derrotas | Interrumpidas | Rondas min/media/max |
| --- | --- | --- | --- | --- | --- |
|Humano automatizado+IA|20/20|15|5 moral|0|2/3,60/6|
|Dos controladores locales|20/20|17|2 moral,1 tiempo|0|1/3,05/9|

Mismo resultado/ronda en40/40; **no trazas idénticas**. IA pasa de73 a72 muertes de personajes; local de44 a42 crisis y de4 a2 muertes de indefensos: ya no suceden eventos posteriores a la derrota. Finales, pendientes e invariantes quedan válidos,0 excepciones. Las cinco UI finales coinciden con sus casos VM en resultado/ronda/comida/moral/muestras/meta. No se deduce balance humano del75%/85%.

## Comparación con Dead of Winter

**Fuente primaria consultada:** [reglamento inglés del juego base, servidor oficial Plaid Hat Games](https://www.plaidhatgames.com/images/games/dead-of-winter/rules.pdf), HTTP200,20 páginas; consulta28/10/2026. SHA256 `41f37d18f07bf04303c364916dcc0bab62d379b85373661650b0118be5812ca7`,24.044.267 bytes, metadato de creación29/01/2014. Los números citados coinciden con páginas impresas/PDF. [Ficha reproducible](evidencias/c15-fuente-oficial.json). No se verificaron FAQs posteriores, otras traducciones ni expansiones; no se adjunta el PDF completo al repositorio.

**Categorías:** coincidencia comprobada en el contrato citado; adaptación aprobada con evidencia de decisión; contenido/adaptación existente cuyo detalle no se presume formalmente aprobado; diferencia que necesita decisión antes de cambiar. No se convierten diferencias de fidelidad en bugs automáticamente.

| Mecánica | Mesa, fuente | V9.9 comprobada | Clasificación/decisión |
| --- | --- | --- | --- |
|Objetivo y momento de victoria|p12: comprobar objetivo en colonia, después de añadir zombis; p14: moral0 termina antes de comprobar objetivo|Tres metas de muestras7/5/9 con8/6/10 rondas; verify reconoce muestras inmediatamente y derrota domina|Objetivos propios existentes; victoria inmediata preservada por C1/#11 y política C10 aprobada. **No equivalencia temporal con mesa** |
|Moral0|p14: «the game ends immediately»|T1 permitía recuperarla con bonus posterior; ahora termina entre pasos de colonia|Defecto técnico confirmado/corregido; no cambio de balance |
|Rondas/primer jugador|p8 dos fases; p12–13 siete pasos de colonia y pasar ficha de primer jugador|J1/humano primero cada ronda; alimentación→residuos→crisis→zombis, verify y nueva ronda|Simplificación existente; rotación de iniciativa y equivalencia de fase requieren decisión, no se añaden |
|Dados/acciones|p8: un dado+uno por superviviente, umbrales de ataque; p10–11 acciones con/sin dado|Reserva por grupo, consumo único/umbral; comida mejora dado, tope6 digital|Núcleo comprobado; no afirmar equivalencia de todas las habilidades/limitaciones |
|Movimiento/combustible|p11 un movimiento por superviviente/turno con exposición; carta Fuel ilustrada p10 evita exposición|Sin dado, capacidad y una vez; combustible conserva límite y evita exposición|Coincidencia de estos contratos; habilidades digitales propias |
|Búsqueda/ruido|p10 ejemplo: robar, ruido para otra carta, elegir una y devolver otra al fondo|Mazo real, opciones/ruido y devolución; habilidades propias|Coincidencia del ciclo básico, sin equivalencia de contenido de mazos |
|Comida/hambre/residuos|p12 ceil(habitantes colonia/2), indefensos cuentan; si falta comida no retirar ninguna, sumar hambre y perder por fichas; floor(residuos/10)|Mismas bases; cocinero reduce1; T1 impide bonus después de derrota|Coincidencia base y habilidad propia. **Retener comida insuficiente no es un bug** |
|Crisis|p11–12 cartas boca abajo, válidas+1/incorrectas−1, umbral jugadores no exiliados y bonus+2|Necesidad2, solo tipos válidos visibles, bonus+2, penalizaciones propias|Adaptación cooperativa existente; sin sabotaje. Fidelidad a crisis oficiales requiere decisión, no se cambia |
|Llegadas/ruido|p12 colonia ceil(habitantes/2), exterior uno/habitante, ruido aparece con1–3|Mismas cantidades base y umbral; ahora detiene pasos tras terminal|Coincidencia de esos cálculos; no distribución espacial |
|Entradas/desbordamiento|p13 seis entradas de colonia, repartir cíclicamente; barricada sustituye llegada; menor influencia antes de indefensos|Una reserva agregada de12 accesos, sin seis entradas; menor influencia y después indefensos|Coinciden víctima/barricada, **difiere táctica espacial**. Mantener o diseñar entradas es decisión futura |
|Exposición/mordedura/congelación|p11 iconos blanco/herida/congelación/mordedura; propagación al menor, sacrificio o volver a tirar; congelación agrega herida al inicio propio|d6:1 mordedura,2 congelación,3 herida,4–6 blanco; riesgo salva4–6; mismo ciclo de influencia/turno|Efectos básicos contrastados; equivalencia de probabilidades del dado físico no demostrada. No ajustarla sin decisión |
|Muerte/equipo/reemplazo|p14 tres heridas,−1 moral; equipo a mano en colonia o mazo local; último superviviente descarta mano y recibe nuevo|Coincide base; reemplazo de emergencia puede ir al exterior si colonia llena; si no hay candidato/espacio declara derrota|Base contrastada; salida de capacidad/agotamiento es manejo digital existente sin equivalente explícito en estas páginas, pendiente de diseño si se pretende literalidad |
|Líder inicial/sucesor|p6 elige uno de sus supervivientes; p14 elige sucesor de seguidores|C9 elección humana por dueño, única opción automática; IA elige influencia; C12 conserva ambas peticiones|Coincidencia de elección humana, automatismo digital aprobado C9; no afirmar que mesa obliga a elegir al de mayor influencia |
|Dos jugadores/cooperativo|p15 cooperativo sin secretos/exilio, objetivo hardcore; variante2 jugadores7 cartas y3 supervivientes elegidos de4|Dos grupos de3/7, personajes/manos fijos, objetivos propios, compañero IA o pase local|Comparte cantidades/idea cooperativa; no implementa la variante oficial completa ni traidor/exilio |
|Encrucijadas/contenido|p12 disparador después de acción, opción legal y efecto inmediato; p15 texto de carta prevalece|Cartas propias con elegibilidad mecánica; IA C10 evalúa consecuencias aisladas/prioridades deterministas|Mecanismo contrastado, contenido/IA propios. No Utility completa, narrativa persistente ni traducción del mazo oficial |

El cotejo no permite decir «idéntico al juego de mesa». Tampoco autoriza sustituir los parámetros actuales por los oficiales. Antes de D conviene fijar por escrito si V9.9 conserva estas adaptaciones; cualquier cambio de regla sería otra tarea aprobada, no refactor.

## Issues y riesgos pendientes

GitHub mantiene **nueve issues abiertos**, sin cierres automáticos. Sus descripciones originales pueden seguir narrando el defecto de main; la corrección existe en la rama, no integrada.

| Issue | Estado técnico comprobado | Respaldo y pendiente |
| --- | --- | --- |
|#2|Elegibilidad/consumo de cartas corregidos C2|`encrucijadas`,16 UI C15; aceptación/cierre humano |
|#3|Dados propios J2 corregidos C3|`modo-local-privacidad`, dados/pase C15; aceptación/cierre |
|#7|IA por consecuencias corregida C10|52 tests/624 conformidades,16 UI y partidas; aceptación de política/cierre |
|#8|Pase bloquea avance C5|`modo-local-privacidad`, C12/C13/UI/foco C15; aceptación/cierre |
|#9|Curación bloquea uso C6/C6-R1|`modales-estados-pendientes`, C13; aceptación/cierre |
|#10|Muerte bloquea fin C5-R2|Tests de modales/C12/C13; C15 además bloquea elegir sucesor; aceptación/cierre |
|#11|Notas IA verifican victoria C1|A4/IA, C10 M1/M2, partidas; aceptación/cierre |
|#12|Foco de inicio/pase corregido C4|5 tests de contrato y3 UI C15; aceptar **solo ese alcance**, A1 ayuda/muerte permanece |
|#13|Dados44×44/gap8 corregidos C11|6 viewports/24 mediciones repetidas; aceptación/cierre |

#4/#5/#6 ya estaban cerrados por decisión del creador; esta misión no los reabre. H1 está corregido C12, no confundirlo con el cierre administrativo de #6. T1/T2 se documentan aquí sin crear/cerrar automáticamente incidencias.

| Riesgo residual | Clasificación y consecuencia |
| --- | --- |
|A1 foco de ayuda/muerte|Defecto conocido P2 de accesibilidad; guardias funcionales comprobadas, sin promesa de todos los lectores de pantalla. Aceptar reserva o encargar corrección de foco antes de cierre |
|Android físico/TalkBack/otros navegadores|Cobertura incompleta; autorización histórica permitió continuar sin prueba física, no prueba aprobada |
|Diferencias de mesa|Decisiones de producto, especialmente victoria inmediata, colonia agregada, iniciativa, exposición y contenido; no son correcciones autorizadas por esta auditoría |
|Balance/estrategias|Una estrategia automatizada, objetivos no equilibrados; sin sesiones humanas ni afirmación de dificultad correcta |
|Globales/async/pintado con efectos|Deuda conocida: paint procesa rescates, funciones comparten game/pendientes; mayor riesgo al extraer módulos o añadir cartas. Guardias actuales no son prueba de todas las secuencias |
|Persistencia/red|No implementadas; recargar pierde partida. No prometer continuidad, multijugador remoto o seguridad frente a consola |
|Contenido futuro|Requiere conformidad de efectos, elegibilidad y consecuencias reales; no inferir que C10 sirve sin cambios a cualquier carta futura |

## Checklist de aceptación y preparación para D

- [x] C12–C15 ejecutadas en orden; errores técnicos reproducidos y correcciones localizadas.
- [x]402/402 local e independiente;40/40 motor y5/5 UI finales, sin pendientes/excepciones/invariantes incumplidas en la cobertura declarada.
- [x] Comparación oficial y reservas diferenciadas; informes46–48 conservados, tablero/registro/matriz actualizados.
- [x] CI exacto del código f1a43c7,402/402, y revisión final del informe confirmados (ver checkpoint); documentación final se comprueba por su propio SHA en Actions.
- [ ] Creador revisa A1/accesibilidad y diferencias de adaptación; decide aceptar reservas o encargar tarea concreta.
- [ ] Creador acepta técnicamente los issues abiertos; sus cierres siguen siendo manuales/autorizados.
- [ ] Creador decide cierre oficial de C. No implica fusión ni publicación.
- [ ] Autorización posterior para D; no iniciada por esta misión.

**Única siguiente tarea recomendada:** revisión de aceptación V9.9 por el creador usando este checklist y el PR14. Es necesaria para decidir las reservas de producto/accesibilidad; el CI no puede aceptarlas por él.

**Preparación propuesta para D, sin ejecutar:** congelar los contratos actuales aceptados; mantener HTML/motor y semillas como referencia; extraer primero una pieza pura pequeña (p.ej. clasificación terminal) sin cambiar reglas; comparar comportamiento con pruebas de conformidad antes/después, suite y UI; seguir por catálogo/acciones/colonia solo en bloques separados. Separar efectos de paint/esperas requerirá especial revisión. No introducir narrativa/Utility ni red dentro de esa extracción. Cada paso necesitaría alcance autorizado y su propio checkpoint.

## Entrega y trazabilidad

| Etapa | Commit | CI exacto |
| --- | --- | --- |
|C12|f9429d1|[40682067180](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40682067180), success371/371 |
|C13|3c152e8|[40684493624](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40684493624), success392/392 |
|C14|d801dbb|[40688534944](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40688534944), success394/394 |
|C15|f1a43c7|[CI40691454445](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40691454445), success402/402 |

Archivos principales: HTML, tres suites nuevas C12/C13/C15, dos tests agregados C14, soporte real/controles de prueba, scripts Chromium y evidencias, informes46–49 y04/18/25. Cambios exclusivamente en rama autorizada; `main=d9068f4aa8d3a10bbbf1e0a8a2527744cc6952cb`, blob estable `4ebaedad13d63c7a6762c524a52c0dd9695687b1`. PR14 permanece abierto/draft, sin fusión ni publicación estable.

**Reproducción:** `npm test`; `C14_OUTPUT_DIR=/tmp/c15-games node scripts/run-c14-games.mjs`; con servidor local8765 y `PLAYWRIGHT_MODULE` apuntando a Playwright, ejecutar scripts `check-issue13-browser`, `check-issue7-browser`, `check-c12-browser`, `check-c13-browser`, `check-c14-browser`, `check-c15-accessibility` y `check-c15-terminal-browser` (`.mjs`). El resultado rojo puede reproducirse copiando el test C15 y fixture a un directorio temporal con `git show d801dbb:invierno_colonia_v9_9.html`; no hacer reset del checkout.

**Revisión documental independiente final aprobada:** informe49, diffs04/18/25, JSON/hash/fuente/conteos contrastados; sin inexactitud material confirmada. Dictamen: apto para presentar a aceptación con A1 y decisiones de adaptación pendientes, condicionado al CI exacto.

**Checkpoint final C15:** código f1a43c738e25e5c840799c7ffa7f70418c9061fe y CI40691454445 completed/success, logs402/402 sin fallidas/canceladas/omitidas/TODO. Revisión independiente técnica/documental aprobada. PR14 actualizado a C1–C15, abierto/draft hacia refactor/arquitectura; nueve issues abiertos y main remoto/origin/main d9068f4 con blob original intactos. No existe rama local main en este checkout; se verificó su referencia remota, sin crearla ni modificarla. La documentación de este checkpoint no cambia el motor; se comprueba su propio SHA/CI antes de entregar mediante [Actions de la rama](https://github.com/LeviEdition/invierno-en-la-colonia/actions?query=branch%3Afix%2Festabilizacion-v9-9), sin atribuirle anticipadamente el CI de código.

**Misión C12–C15 completada técnicamente para revisión, con reservas.** Próximo paso único: aceptación del creador mediante checklist. C permanece oficialmente abierta; D no iniciada. A1 requiere aceptar el alcance o una tarea de corrección antes del cierre según decisión del creador.
