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

## Cierre

En implementación. No se declara migración completa hasta cotejar matriz final, equivalencia, recorridos sin pantalla V9 y CI del SHA exacto.
