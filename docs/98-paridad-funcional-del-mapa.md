# 98 — Migración funcional del mapa

## A · Auditoría previa (13/11/2026)

Base local/remota31ffaf6758e7bfb5a6fae258e6d17da4e3af012e; PR25 abierto en borrador contra694b645, CI43486325893 completed/success. Main826199d intacto. No AGENTS.md aplicable. Se leyeron tablero18 y composición93. Este encargo autoriza los seis bloques, sin fusión/publicación ni cambios de reglas, arte, geometría o referencia estable.

Inventario obtenido de `commandNames`, `reference-view`, `reference-state`, `reference-rules`, `reference-items`, `reference-turns` y todos los brokers/paneles del mapa. La tabla registra primero la situación **antes de implementar**; se añadirá el cierre con evidencias reales. Los comandos de selección/presentación se agrupan por función; ninguno se omite.

|Función / comandos del motor|Acceso V9|Equivalente inicial del mapa|Estado inicial / evidencia existente|
|---|---|---|---|
|Preparación: showSetup/startGame/create|Pantalla inicial: IA o dos locales|Exige preparar V9 y Ver mapa|Pendiente|
|Nueva partida|Ayuda → confirmar → preparación|Retorno V9|Pendiente|
|Formación de grupos, objetivo, recursos iniciales|create: grupos fijos, objetivo/mazos aleatorios; NO hay editor de grupos ni dificultad|Consulta después de preparar V9|Parcial; no inventar opciones|
|Líder inicial: chooseLeader/canPickStartingLeader|Grupos, ventana de primera ronda|Solo sucesión obligatoria|Parcial|
|Seleccionar/ficha/destino: select/profile/destination|Tablero/ficha/acciones|Fichas, edificios, selectores, cámara|Integrado; H3.4.4/presentación|
|Dados: pickActionDie/pickFloatingDie/consume|Reserva y diálogo de acciones|Reserva por acción|Integrado; acciones/inventario|
|Mejorar dado: boostDie|Acciones → +1 por comida|Ninguno|Pendiente|
|Mover: doMove/executeMovement|Acciones|Ficha → Moverse|Integrado; H3.4.2/acciones|
|Buscar/ruido/botín: search/addNoiseSearch/chooseLoot|Acciones/elección|Panel búsqueda|Integrado; H3.4.3/inventario|
|Ataque: attack/executeAttack|Acciones|Ficha → Atacar|Integrado; H3.4.4|
|Barricada/dado o constructor: barricade/special|Acciones|Ficha → Construir|Integrado; H3.4.4|
|Limpiar: clean|Acciones|Ninguno|Pendiente|
|Atracción: attract/chooseAttract/cancelAttract|Acciones/diálogo; terminar conserva dado consumido|Retorno V9|Pendiente|
|Médico/enfermero: special/chooseHeal/cancelHeal|Acciones/elección paciente|Retorno V9|Pendiente|
|Habilidades automáticas: investigador, explorador, etc.|Descripción y efectos originales|Ficha y efectos de operaciones integradas|Integrado; sin activación manual|
|Usar/equipar: playItem/equipItem/itemEngine.use|Inventario/ficha|Inventario accionable|Integrado; map-inventory|
|Retirar equipo: unequipItem|Solo mensaje: no existe retirada libre|No ofrece una operación inexistente|Exclusivamente informativo|
|Transferir equipo propio: startTransfer/chooseTransfer/cancelTransfer|Ficha del propietario|Inventario|Integrado; map-inventory|
|Transferir equipo entre jugadores locales|Ficha del propietario|Se filtra receptor al grupo propio|Parcial; pendiente receptor local|
|Aportes: contribute/contributeEquipment|Inventario/crisis|Resumen e inventario|Integrado; map-cycle-contributions|
|Mordedura: chooseBite/biteNext|Diálogo sacrificio/riesgo|Continuar en V9|Pendiente; prioridad auditada en31ffaf6|
|Encrucijada: crossChoose/crossAiContinue|Carta activada / decisión IA|Continuar en V9|Pendiente; carta futura debe permanecer oculta|
|Muerte/sucesión: deathContinue/chooseLeader|Confirmación y selección|Ciclo|Integrado; map-cycle-round|
|Rescate/reemplazo: recruit/processRescueQueue/dismissRecruit|Aviso y grupos|Resultado búsqueda, sin aviso genérico completo|Parcial|
|Terminar/pasar: finishTurn/confirmPass|Menú/pase|Control principal/ciclo|Integrado; map-cycle-engine|
|IA/pausas: skipAutomation|Menú de IA|Ciclo → Acortar pausas|Integrado; map-cycle-round|
|Colonia/newRound/final/verify|Motor y resumen|Ciclo estructurado|Integrado; map-cycle-colony/round|
|Objetivo/crisis y estadísticas públicas|Menú/cabecera/tooltips|Resúmenes, fichas; faltan algunas explicaciones/contadores|Parcial|
|Grupos/líderes/rescates pendientes|Menú Grupos|Consulta dispersa|Pendiente acceso unificado|
|Registro: message/log|Registro completo, mezcla datos privados|Diario público solo ciclo|Parcial; migrar eventos estructurados, NO copiar log|
|Ayuda/estadísticas|Ayuda/statDetails|Texto reducido del mapa|Parcial|
|show/hide/renderModal/toggleFab/statInfo|Controles de presentación V9|Paneles/diálogos/desplegable|Exclusivamente presentación; adaptar accesos|
|Reconexión/recibos/resultado desconocido|Host/puertos|Recuperación parcial; error de ciclo remite V9|Parcial; bloqueo seguro si no hay resultado|
|QA, dispose, rebuild y comparación estable|Herramientas técnicas|Menú/QA separados|Exclusivamente técnico|

No existen compraventa, transferencias de mano, configuración de dificultad, selección manual de objetivo o editor inicial de personajes. La preparación ofrece únicamente IA/local; los grupos iniciales son los de V9 y la elección de líder ocurre dentro de su ventana legal. La IA no acepta transferencias humanas en su modo. Se preservarán estas restricciones.

Retornos detectados: shell initial/reference-mode, applyAuthority/showReference, showDecision, movimiento resolve-decision, action-native, search-native, inventario onNative, ciclo native/recovery; textos de ayuda y fallo WebGL. Se reemplazarán al conectar cada flujo, conservando los prototipos históricos como referencias independientes.

## Bloques implementados

- **A ·7dce17e:** inventario anterior a los cambios, comandos, accesos y retornos explícitos/indirectos.
- **B ·4350d41:** decisiones propias de mordedura y encrucijada, opciones originales, audiencia/activación y prioridad de muerte abierta → mordedura → muertes en espera → sucesión del turno → decisiones de acción → encrucijada. Una sucesión de otro grupo local espera su turno y no oculta la carta actual. Riesgo usa una sola tirada real; ni render ni resumen vuelven a tirar.
- **C ·46bfb32:** limpiar con dado1+ y hasta3 residuos; atracción con coste inicial único y finalización sin devolución; médico/enfermero con pacientes/alcance/uso por ronda nativos; mejora de un dado identificado con comida y límite6. Constructor permanece en su panel previo; las otras habilidades se describen como automáticas.
- **D ·65794bf:** receptores locales del otro grupo conforme a `canReceiveTransfer`; mismo objeto y `usedRound`, sin mano/trueque/IA añadidos. Menú de grupos, miembros, líder inicial en ventana nativa y rescates pendientes. Sucesión del ciclo conservada.
- **E ·2a4d69d:** preparación y otra partida en el mapa, modos originales, grupos fijos, objetivo aleatorio, confirmación de abandono. Mismo motor; generación nueva invalida solicitudes/recibos/continuaciones anteriores, incluida IA suspendida.
- **F ·SHA en PR25:** registro estructurado, ayuda/estadísticas y frecuencias iniciales públicas de objetos; consulta de encrucijadas sin revelar cartas futuras; decisiones de rescate, transferencia o botín sin operación previa también cubiertas. Host mínimo sin tablero/controles DOM de V9. Recuperación dentro del mapa, nuevas pruebas y evidencia. El SHA/run/artifact exactos se consignan en el PR para evitar un hash circular en este documento.

## Matriz final

`integrado` significa acceso en el mapa y operación original, con revalidación al confirmar. Los prototipos anteriores y la referencia estable permanecen separados. No se declara una función jugable pendiente ni un retorno obligatorio a V9.

|Función / operación original|Acceso final del mapa|Estado|Prueba / evidencia|
|---|---|---|---|
|Preparar/startGame; modos y preparación originales|Diálogo inicial con dos modos y grupos reales|Integrado|[setup](../tests/map-play-setup.test.mjs); recorridos normal/local/IA|
|Nueva partida/abandonar|Menú, final y ciclo de IA; confirmar modo/abandono|Integrado|setup: rechazo sin confirmar, una generación, IA vieja invalidada; local/victoria|
|Líder inicial/chooseLeader|Menú → Grupos y líderes, solo ventana legal|Integrado|[grupos](../tests/map-play-groups.test.mjs); local|
|Grupos, liderazgo y rescates|Menú y fichas públicas|Integrado|grupos, interrupciones y búsqueda previa|
|Selección, ficha, destinos, datos y equipo público|Fichas sobre edificios y selectores existentes|Integrado|regresiones de presentación/acciones y consulta por teclado|
|Dados disponibles y elección exacta|Paneles de acción y mejora|Integrado|H3.4.3/H3.4.4 y [acciones nuevas](../tests/map-play-actions.test.mjs)|
|boostDie/comida|Ficha → Mejorar dado, selección y confirmación|Integrado|acciones: sin comida,6 y token obsoleto; local|
|Movimiento/doMove|Ficha → Moverse|Integrado conservado|H3.4.2 y recorrido de acciones|
|search/addNoiseSearch/chooseLoot|Buscar → dado → ruido/elección|Integrado conservado|H3.4.3, inventario y acciones; cartas solo propias|
|Loot sin operation previa|Diálogo de elección legal del mapa|Integrado|adaptador consulta `pendingLoot`; no carta futura|
|attack|Ficha → Atacar|Integrado conservado|H3.4.4, interrupciones, costes y exposición reales|
|barricade/constructor|Ficha → Construir, dado o habilidad existente|Integrado conservado|H3.4.4 con límites experimentales iguales|
|clean|Ficha → Limpiar residuos|Integrado|acciones: fuera de colonia/sin residuos sin consumo; local|
|attract/chooseAttract/cancelAttract|Ficha → Atraer; orígenes, destino y accesos, terminar sin devolución|Integrado|acciones: parcial/saturación/finalización; local|
|special/chooseHeal/cancelHeal|Ficha → Tratamiento → paciente; cancelar sin gastar habilidad|Integrado|acciones: médico/enfermero, alcance y límite; local|
|Habilidades automáticas|Descripción de ficha y efectos originales; sin activación manual|Integrado conservado|acciones y pruebas originales de objetos/combate/búsqueda|
|playItem/equipItem y todos los efectos del catálogo|Inventario → objeto → objetivos legales → confirmar|Integrado conservado|map-inventory, regresión inventario y victoria|
|unequipItem|Explicación de transferencia; no ofrece retirada libre inexistente|Exclusivamente informativo|map-inventory: tipos y restricciones originales|
|startTransfer/chooseTransfer/cancelTransfer|Inventario de propietario → receptor; diálogo pendiente si existe|Integrado|grupos/información: local/IA, localidad, tipo, objeto vivo y usado|
|contribute/contributeEquipment|Crisis visible e inventario|Integrado conservado|map-cycle-contributions; solo cuenta pública antes de resolver|
|chooseBite/biteNext|Diálogo sacrificio/riesgo y tiradas reales de cadena|Integrado|[decisiones](../tests/map-play-decisions.test.mjs); interrupciones y antiguo caso bite|
|crossChoose/crossAiContinue|Carta activada, requisitos y decisión nativa de IA|Integrado|decisiones/información: legal/ilegal/IA, estado y azar; cross/IA|
|deathContinue/chooseLeader/sucesión|Confirmar fallecimientos → elegir sucesor cuando corresponde|Integrado conservado|map-cycle-round, decisiones y cadena con líder muerto|
|recruit/processRescueQueue/dismissRecruit|Resultado de búsqueda/aviso y grupos; incorporación nativa|Integrado|inventario, ciclo e interrupciones con carta de rescate|
|finishTurn/confirmPass/skipAutomation|Control principal y diálogo de ciclo|Integrado conservado|map-cycle-engine/round; normal/local/IA|
|colony/newRound/verify y finales|Resumen de fases, nueva ronda o causa final|Integrado conservado|map-cycle-colony/round; victoria y derrota controladas|
|Objetivo/crisis y contadores públicos|Resúmenes visibles, localidad y Ayuda|Integrado|ciclo y consulta estructurada|
|Registro completo por audiencia|Menú → Registro: acciones, objetos, habilidades, tiradas, decisiones, turnos, colonia y final|Integrado|[información](../tests/map-play-information.test.mjs): secreto heredado/IA no cruzan frontera|
|Ayuda/statDetails/leyendas iniciales|Menú → Ayuda, fichas y Encrucijadas|Integrado|información, datos originales y capturas del mapa|
|show/hide/pickActionDie/pickFloatingDie y comandos visuales|Paneles, selección, teclado/tacto y diálogos nuevos|Integrado como presentación|35 dirigidas + recorridos y regresiones anteriores|
|Resultado desconocido/reconexión/reconstrucción|Consultar estado de la misma instancia; recibo y bloqueo si no se determina|Integrado|información: pérdida, excepción con/sin recibo; local con respuesta perdida/reconexión/reconstrucción|
|Host, QA, dispose, referencia estable y prototipos anteriores|Conexión interna mínima y herramientas de comparación separadas|Exclusivamente técnico|host sin DOM V9, límite visor/motor y guardia de navegador|

## Consistencia, privacidad y recuperación

Los comandos nuevos llevan sesión, revisión, generación y solicitud. La legalidad, propiedad, turno, paciente, dado concreto y receptor se revalidan en el motor. Un doble clic no consume dos veces. Las respuestas obsoletas no se aplican; tras respuesta perdida se consulta estado/recibo antes de habilitar otra operación. Una excepción sin recibo determinable bloquea repetir y explica el problema; no declara éxito ni reinicia. La reconstrucción conserva cámara/selección válidas y vuelve a consultar la misma autoridad. El visor no importa reglas ni ejecuta IA; el host conserva una instancia del motor V9, sin montar su pantalla antigua.

El registro nuevo **no interpreta ni copia `game.log`**. Los eventos se emiten en las ramas reales de acciones/objetos/mordeduras/decisiones y el ciclo ya estructurado. Acciones, dados gastados, uso de equipo, resultados, muertes, transferencias y destino del equipo de fallecidos son públicos. Cartas reveladas/conservadas solo se proyectan al grupo que las encontró. Durante IA la audiencia es el humano, nunca la mano/dados de IA. Aportes previos a resolver solo muestran número de cartas; no su tipo/contenido. Durante pase se eliminan mano, dados, borradores, recibos y eventos privados del saliente; al confirmar solo se proyecta la audiencia entrante. Se conservan200 eventos y80 pasos de ciclo; la ayuda explica este límite.

La selección de una ficha fallecida se limpia sin seleccionar otra automáticamente en el visor. La selección interna histórica del motor no sustituye la elección explícita por ID de las acciones del mapa. Los diálogos son modales, con controles44px, foco y Escape; cerrar visualmente no resuelve una decisión obligatoria. Atracción ya iniciada solo permite terminar sin devolver el coste original.

Reconectar el puerto o reiniciar el visor conserva la partida mientras siga vivo el host. **Recargar la aplicación completa pierde esa instancia y vuelve a preparación.** No hay guardado persistente nuevo, ni recuperación prometida después de destruir el host. Un fallo interno sin resultado determinable permanece bloqueado tras consultar; no se inventa una compensación.

## Verificación y revisión

[Evidencia, vídeos y resultados](evidencias/migracion-funcional/README.md). Equivalencia con el motor sin instrumentación y las mismas capacidades experimentales33, en estado, coste, orden y azar. Referencia HTML/PNG/scene/lockfile conservados. La CI del SHA exacto y su artifact se cotejan en PR25; la aceptación manual permanece pendiente.

La guardia de navegador falla ante navegación/popup V9, cambio a presentación V9, iframe visible o clic en un control heredado; además exige que el host no contenga su tablero/preparación. Sondeos aislados comprueban que detecta un retorno inyectado y la navegación a la referencia. Los recorridos incluyen dos rondas hasta el inicio de la tercera sin parches de estado (azar QA fijo), acciones/intercambio local, IA y su carta real, contagio encadenado/muerte de líder/sucesión, opción de encrucijada deshabilitada, victoria, derrota y otra partida sin recarga. Todos los escenarios con recursos/cartas preparados están rotulados QA; móvil es Chromium con tacto/DPR2 emulado, sin teléfono físico.

La regresión anterior `bite` deja de esperar un retorno V9: conserva ataque/azar/muerte/continuidad y ahora exige el diálogo del mapa. Las otras aserciones de ciclo/presentación/cámara/capacidad/inventario/acciones se mantienen. Los helpers horizontales preparan y eligen líder por el mapa; los prototipos históricos conservan su camino anterior. Se corrigieron recibo terminal oculto por la antigua compuerta `waiting`, conservación del recibo y ocultación de manos/registros al ganar J2, audiencia/dados de IA y consultas que sincronizaban solicitudes de líder. La prueba de navegador espera la confirmación del líder/carta antes de leer el motor y consulta/pulsa el control vigente de IA atómicamente, comprobando el objetivo de ronda en ese mismo paso; no se amplían esperas ni se quitan aserciones.

Revisión manual sugerida:

1. Actualizar y levantar el servidor con los comandos de la guía; elegir modo sin abrir la referencia estable. Verificar objetivo, crisis, miembros, inventario y elección inicial de líder.
2. Seleccionar una ficha propia; revisar los costes, cancelar un borrador y después ejecutar. Probar limpieza/tratamiento/mejora cuando sean legales. En atracción comparar cancelar antes de confirmar con terminar después de consumir el dado.
3. Equipar y transferir un objeto a un receptor local legal; comprobar que mantiene su estado de uso. Revisar Registro/Ayuda/Encrucijadas desde Menú.
4. Terminar ambos turnos; comprobar pase privado, orden alimentación→residuos→crisis→llegadas→ruido y nueva ronda. Repetir con IA, confirmando su carta cuando se active.
5. Comparar la evidencia QA de mordeduras/fallecimientos/sucesión y finales. Usar Nueva partida y cancelar primero el abandono; luego confirmar. No recargar la aplicación si se quiere conservar la partida activa.

Sin fusión, publicación, main, cambios de reglas/IA/balance, narrativa, beneficios nuevos de líder ni arte adicional.
