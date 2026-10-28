# 45 — Auditoría de pendientes de la etapa C

**Fecha:** 28/10/2026. **Código auditado:** `7497d704e8888609c108ffa06d7bb52ff9d02701`, rama `fix/estabilizacion-v9-9`. **Condición de inicio cumplida:** C11 terminado y documentado, suite 358/358 y [CI 40625219012](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40625219012) completed/success. [Informe44](44-c11-dados-tactiles.md).

**Conclusión:** los siete defectos originales pedidos están corregidos en la rama y continúan abiertos administrativamente. La auditoría confirma además un fallo preexistente de sucesión de ambos líderes locales (H1), no corregido. **No declarar C cerrada ni V9.9 estabilizada todavía.**

## Alcance y método

Esta fase no modifica juego, CSS, tests del repositorio, reglas o configuración. Solo lectura, ejecución de pruebas no destructivas y documentación. No se cerraron, reabrieron o crearon issues; no se fusionó el PR ni modificó `main`. No se implementa ningún hallazgo nuevo.

Se consultaron los nueve issues abiertos de GitHub y sus cuerpos (#2/#3/#7/#8/#9/#10/#11/#12/#13), código actual, tests y registros C1–C11. Los informes históricos se mantienen; sus conteos y frases de «próximo paso» pertenecen a la instantánea indicada. Todo resultado siguiente se refiere a la rama de estabilización, **no a que el parche ya esté en `main`**.

Validación:

- Suite completa del código auditado:358/358 local y CI,0 fallidas/canceladas/omitidas/TODO. No se repite tras cambios exclusivamente documentales.
- Selección dirigida de regresiones existentes: **54/54 aprobadas**, sin fallos/TODO. Comando reproducible:

```bash
node --test --test-name-pattern='C1 #11|C2 #2|C3 #3|C4 #12|C5|C6' tests/integracion-partidas-a4.test.mjs tests/encrucijadas.test.mjs tests/modo-local-privacidad.test.mjs tests/accesibilidad-pase-c4.test.mjs tests/modales-estados-pendientes.test.mjs
```

- Chromium real sobre la rama: **21 comprobaciones issue/viewport**, siete issues en 320×640, 393×852 y 1365×768, todas aprobadas,0excepciones JS. Preparación determinista de estados, azar inicial0, 45 y acciones de UI reales; las llamadas internas se usan expresamente para verificar los contratos de #8/#9/#10. No se afirma un exploit por clic normal de esos tres defectos.
- Dos reproducciones adicionales de H1, una sobre el código actual y otra sobre el HTML anterior a C11 (`2fbbc59`), confirman el mismo fallo. No se considera un test verde de corrección: son experimentos que prueban que el defecto sigue vigente.
- [JSON de auditoría](evidencias/c-auditoria-pendientes.json) y [captura del fallo de líderes](evidencias/c-auditoria-lideres.png). El auxiliar temporal `/tmp/c-phase-audit.mjs` no se incorpora como código nuevo del proyecto en esta fase; los pasos de H1 se conservan abajo.

## Issues verificados

Todos figuran **OPEN** en GitHub al revisar. «Corregido» significa implementado y probado en la rama; no autorización de cierre ni integración.

| Issue | Problema original | Corrección actual y pruebas ejecutadas | Clasificación y acción propuesta |
| --- | --- | --- | --- |
|[#2](https://github.com/LeviEdition/invierno-en-la-colonia/issues/2)|Encrucijadas buscaban cadenas, rechazando objetos estructurados y sin consumirlos correctamente.|C2 y C10: predicados por `kind()`, `crossHandIndex()` y consumo de una copia de la mano dueña. **6 regresiones C2**: recursos presentes/ausentes, objetos ajenos intactos, J2 y legado. Chromium ejecutó las tres cartas como J2 y verificó consumo propio y beneficio real en cada viewport.|**Corregido, pendiente de aceptación/cierre.** No necesita otro parche para el problema descrito.|
|[#3](https://github.com/LeviEdition/invierno-en-la-colonia/issues/3)|J2 no podía mejorar su dado cuando J1 ya no tenía dados.|C3: `boostDie()` valida `actionDice()`. **3 regresiones C3** cubren reserva propia, falta de dado/comida y límite6. Chromium: J1=[],J2=[2],comida 6→J2=[3],comida 5 mediante botón real, sin cambiar J1.|**Corregido, pendiente de aceptación/cierre.** Mecánica de coste/límite conservada.|
|[#8](https://github.com/LeviEdition/invierno-en-la-colonia/issues/8)|Una segunda llamada a `finishTurn()` durante pase podía omitir el turno de J2.|C5: guardia `passScreenActive` antes de mutar estado. **2 regresiones C5/#8** cubren llamadas repetidas y setup, junto a caracterización de pase/confirmación en la suite. Chromium: dos llamadas durante pase conservan el estado completo; Enter confirma y habilita J2.|**Corregido, pendiente de aceptación/cierre.** Las peticiones bloqueadas no se ejecutan al confirmar.|
|[#9](https://github.com/LeviEdition/invierno-en-la-colonia/issues/9)|Consumir una carta durante una elección de curación alteraba la partida.|C6: `playable()` bloquea mientras `pendingHeal`; elegir paciente/cancelar conserva su vía. **21 regresiones C6 +6 C6-R1** cubren cinco comandos en tres controladores, recuperación y botín antes de curación. Chromium: ración no se consume mientras Ada elige paciente; después de curar, la misma carta funciona.|**Corregido, pendiente de aceptación/cierre.** El bloqueo botín/curación encontrado en revisión ya tiene arreglo C6-R1.|
|[#10](https://github.com/LeviEdition/invierno-en-la-colonia/issues/10)|Se podía avanzar turno mediante llamada interna con diálogo de muerte activo.|C5 y C5-R2: se bloquean `deathDirector.active` **y su cola pendiente antes de la microtarea**. **2 C5/#10 +7 C5-R2**, incluyendo segunda muerte y colonia en curso. Chromium confirma bloqueo antes de abrir y mientras se muestra; Continuar no avanza automáticamente.|**Corregido, pendiente de aceptación/cierre.** H1 es otro problema de sucesiones múltiples, no una reaparición de esta guardia.|
|[#11](https://github.com/LeviEdition/invierno-en-la-colonia/issues/11)|La IA completaba muestras con notas, pero colonia podía matarla antes de verificar victoria.|C1: `verify()` después de la nota y salida inmediata si terminó. **2 regresiones C1**: victoria con hambre amenazante y no consumir notas sobrantes. Chromium: dos notas,meta 2, comida 0, moral 1→victoria en ronda 1, moral 1 y ninguna fase de colonia.|**Corregido, pendiente de aceptación/cierre.** No confundir con derrota simultánea causada por la propia opción: ese orden se conserva en C10.|
|[#12](https://github.com/LeviEdition/invierno-en-la-colonia/issues/12)|Tab y foco programático escapaban de setup/pase al tablero.|C4: foco inicial, ciclo Tab/Shift+Tab, `inert` en los contenedores del fondo y restauración. **5 regresiones C4**. Chromium:16pulsacionesTab/Shift+Tab por viewport, intento de foco exterior, inicio y pase con Enter; foco permanece y el fondo vuelve a estar disponible al cerrar.|**Corregido en el alcance setup/pase, pendiente de aceptación/cierre.** No equivale a una auditoría completa de todos los modales, Android o TalkBack.|

Archivos de prueba: [encrucijadas](../tests/encrucijadas.test.mjs), [modo local](../tests/modo-local-privacidad.test.mjs), [modales](../tests/modales-estados-pendientes.test.mjs), [integración](../tests/integracion-partidas-a4.test.mjs), [accesibilidad](../tests/accesibilidad-pase-c4.test.mjs). Los grupos nombrados suman54, sin contar dos veces los tests compartidos de otras verificaciones.

Los restantes abiertos también se clasifican:

- **#7/C10:** implementado,52 tests de encrucijadas en la suite; sus16 recorridos Chromium se repitieron antes y después de C11. Pendiente de aceptación y cierre por el creador. Sin cambiar prioridades, Utility o perfiles.
- **#13/C11:** implementado y revisado,44×44/gap8, seis viewports y CI exacto aprobado; R1 de pantallas bajas corregido. Pendiente de aceptación/cierre. No certifica Android físico.
- **#4/#5/#6:** ya cerrados por autorizaciones anteriores; no se reabren ni se interpretan como integrados en `main`. H1 es un hallazgo adicional de combinación, no una autorización para reabrir #6 o programarlo ahora.

## H1 — P2 confirmado: se pierde la segunda sucesión local

**Antes era un riesgo; ahora está reproducido.** Se usa una fase de colonia real, sin sustituir `colony()`, `kill()`, revisión de líderes, pase o selección:

1. Iniciar dos jugadores locales. Preparar final del turno J2, ambos líderes iniciales confirmados, comida 30 y moral 9. Mara y Bruno quedan en colonia; Leo,Iris,Ada,Sol en supermercado (cuatro plazas válidas).
2. Colonia llena de 12 zombis, sin barricadas. Otras zonas vacías. Crisis de comida incumplida, penalización `zombie`.
3. J2 termina mediante el botón real. La crisis añade dos zombis: el primero mata a Mara y el segundo a Bruno por desbordamiento. Cada grupo conserva dos supervivientes vivos fuera de colonia.
4. Confirmar el aviso de ambas muertes, pasar a J1 en ronda 2 y elegir a Leo como sucesor propio.
5. Terminar J1 y confirmar pase a J2.
6. **Observado:** `game.leaders.ai===null`, dos supervivientes J2 vivos, `pendingLeader===false`, `leaderChoiceReady()===false`; tampoco se permite elección inicial en ronda 2. J2 entra sin poder resolver la sucesión que le corresponde.

Para aislar el caso se prepara una carta de búsqueda no activable en esos inicios de turno (`Un almacén bajo el hielo`), evitando una encrucijada ajena al fallo. No hay excepción por nombre del líder o de la carta en el código propuesto: **no se propuso ni aplicó un parche durante la auditoría**.

**Causa leída en el código:** `reviewLeader()` dispone de un solo `pendingLeader/pendingLeaderSide`. Al registrar la muerte del primer líder queda ocupado por humano; la revisión del segundo sale temprano porque ya existe un pendiente. Elegir el primer sucesor borra el único pendiente y la transición al turno J2 no vuelve a registrarlo.

**Impacto:** se incumple la sucesión manual de cada dueño, aun manteniéndose correctamente los avisos de fallecimiento y el pase. El fallo es de coordinación de estados, no una decisión de balance. Confirmado con idéntico resultado en 7497d70 y 2fbbc59; además el JavaScript es idéntico entre ambos, por lo que **no es regresión de C11**. Los tests actuales pasan porque cubren sucesión individual y fallecimientos múltiples sin exigir ambas sucesiones locales juntas.

**Acción pendiente, sin implementar:** conservar las dos peticiones y resolver cada una cuando corresponda a su dueño, sin que una borre la otra. Primero añadir regresión de esta fase de colonia, después ajuste mínimo y comprobar ambos órdenes de muerte, pase, modales y modo IA. Requiere nuevo encargo; no se hace refactor general ni se cambia la política #7.

## Contrastes entre código, pruebas y documentación

1. Los cuerpos de issues abiertos describen la V9.9 original. Siguen siendo evidencia válida de `main`, que conserva su SHA; no describen todos los arreglos de esta rama. Marcar «abierto» como «sin corregir en la rama» sería incorrecto. No se editaron los issues ni se cerraron automáticamente.
2. Los registros C1–C9 con conteos antiguos y «siguienteC5» son instantáneas históricas. El estado vigente se concentra en el encabezado del tablero y estos informes. Se actualizan encabezados actuales y matriz sin borrar la historia.
3. C4 protege **setup/pase**, no todas las ventanas del juego. La propuesta amplia de aislamiento de cualquier `aria-modal` no se puede declarar completa: `handoverDialog()` solo cubre esas dos pantallas. Lectores de pantalla y modales generales requieren verificación aparte.
4. La cabecera de `tests/integracion-partidas-a4.test.mjs` todavía dice «V9.9 intacta», pero el fixture carga el HTML actual de la rama y sus expectativas C1 exigen corrección. Es una nota histórica ambigua, no ejecución del motor estable. Se documenta sin editar tests en esta fase.
5. La reserva de líderes simultáneos de informes39/40/43 deja de ser solo hipótesis: H1 prueba una pérdida de sucesión. La suite verde no demuestra ausencia de este fallo. No se revoca silenciosamente un cierre previo ni se altera el motor para ocultarlo.
6. Las campañas narrativas, objetivos futuros y memorias de docs12–17 son diseño, no mecánicas implementadas. C11/auditoría no las activa ni cambia las metas de muestras.

## Riesgos para la integración antes de declarar C estabilizada

| Prioridad | Evidencia o límite real | Verificación o decisión necesaria |
| --- | --- | --- |
|**P2, defecto confirmado**|H1 pierde la sucesión J2 cuando mueren ambos líderes locales en una crisis.|Corregir por tarea separada y añadir la regresión que hoy falta. Requisito técnico previo a recomendar estabilización completa.|
|Alta, cobertura parcial|Las esperas de IA, encrucijadas, mordedura, muerte y liderazgo interactúan. Hay contratos individuales y algunas combinaciones, pero no todas.|Recorrido transversal acotado con ambos modos y pendientes encadenados, cancelaciones/doble entrada y reinicio. No asumir que un DOM simulado certifica la UI.|
|Alta, finales|C1 y C10 verifican victoria/derrota reales; quedan múltiples fuentes de muestras, investigador, rescate y fin de ronda.|Contrastar todos los caminos con objetivo próximo, moral 0 y falta de reemplazos, manteniendo el orden actual. No cambiar el objetivo ni centralizar el motor en esta auditoría.|
|Media, dispositivos|C11 cambia el contenedor de scroll; seis viewports pasan, pero no hay Android físico, TalkBack, teclado virtual o zoom exhaustivo.|Comprobación física/lectores y gestos si se dispone, o aceptación explícita de las reservas antes de promover. Emulación no es prueba física.|
|Media, recursos|Coexisten cartas estructuradas/legado; muerte puede devolver equipo, reclutar y mezclar mazos.|Verificar pérdida/reemplazo, transferencias por modo y consumo tras resolver pendientes; mantener aislamiento de manos/dados.|
|Media, accesibilidad|Setup/pase aislados; no existe prueba equivalente para todos los modales y muerte.|Auditar foco/restauración en modales generales y fallecimiento; delimitar cualquier ampliación antes de programarla.|
|Media, IA y azar|C10 evalúa copias y ramas de reclutamiento; política inmediata/conservadora y puntaje de objetos simple.|Conservar conformidad y no mutación al añadir cartas. No confundir esta validación con balance o planificación óptima.|
|Media, aceptación y proceso|PR14 sigue draft a otra rama de auditoría, issues abiertos y `main` original.|Revisión humana, decisión expresa sobre cierres y reservas, checklist de promoción y revisión de la base real del PR. Nada se fusiona automáticamente.|
|Pendiente de comprobación|Los avisos de acciones rechazadas no tienen una auditoría integral final; existen rutas de retorno temprano.|Verificar avisos representativos y distinguir rechazo silencioso deliberado de falta de información. No se declara fallo nuevo sin reproducción.|
|Pendiente de balance|No se jugaron partidas naturales nuevas hasta victoria/derrota, ni se midió dificultad o errores de puntería humanos.|Pruebas de juego y registro de decisiones del creador; no calibrar por cuenta propia.|

GitHub Actions ejecuta Node; las comprobaciones Chromium y las capturas de este encargo son locales. CI 358/358 respalda esos tests, no certifica por sí mismo Android, fidelidad al tablero o todos los riesgos de integración.

## Fidelidad a Dead of Winter — registro separado, sin cambios de reglas

**No se consultó un reglamento oficial/edición en esta auditoría.** No se presenta una lista de discrepancias oficiales demostradas ni se corrigen reglas por memoria. Se separan adaptaciones explícitas del producto y comportamientos que requieren contraste posterior:

| Comportamiento V9.9 comprobado | Estado de diseño/contraste |
| --- | --- |
|Cooperativo humano+IA o dos locales; sin traidor, exilio ni objetivos secretos, según ayuda real.|Adaptación explícita del producto. Mantenerla; no agregar esas mecánicas durante C.|
|26 relatos, personajes y objetos propios; objetivos de muestras7/5/9 con límites8/6/10.|Contenido propio existente. Las futuras campañas no están implementadas.|
|Comida por cada dos habitantes de colonia, cocinero reduce1; si falta comida se conserva la reserva y aumenta hambre.|Regla actual documentada y testeada. Contrastar con la edición de mesa antes de proponer una diferencia; no modificarla ahora.|
|Influencia determina víctimas de desbordamiento y propagación; líderes por grupo y reemplazo del último superviviente.|Reglas actuales. Contraste oficial y decisiones sobre cualquier desviación, separados del bug H1 de coordinación.|
|Un movimiento por personaje/turno sin dado, exposición correspondiente; acciones con dados según aptitud.|Contrato existente, no «equivalencia total» demostrada. Mantener al cerrar C.|
|Crisis necesidad 2; IA usa política aprobada para herramientas; victoria por muestras con derrotas prioritarias en la misma resolución.|Adaptación/implementación actual. No balancear ni imponer una interpretación nueva de mesa sin decisión expresa.|

## Entrega y única siguiente tarea recomendada

C11 se entregó en 7497d70 con CI aprobado. Esta auditoría añade únicamente documentación y evidencia; el commit final documental se comprobará por SHA en Actions antes de informar. PR14 actualizado en título/cuerpo para C1–C11 y H1; permanece abierto/draft hacia `refactor/arquitectura`; `main` remoto conserva `d9068f4aa8d3a10bbbf1e0a8a2527744cc6952cb`. Los nueve issues siguen abiertos; #4/#5/#6 conservan sus cierres anteriores. Ningún cambio en reglas, fuente, tests, configuración, narrativa o ramas estables durante esta fase.

**Única siguiente tarea recomendada: corrección acotada de la sucesión múltiple local (H1), con autorización nueva.** Tiene un fallo de ejecución reproducido y un hueco concreto de cobertura; debe preceder a una propuesta de estabilización completa. La aceptación administrativa de #7/#13 y los otros issues permanece en manos del creador, sin cierres automáticos. No se inicia D/E.
