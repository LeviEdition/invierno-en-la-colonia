# 87 — H3.4.3: Buscar desde el mapa

04/11/2026, America/Montevideo. Encargo autorizado por el creador después de aceptar los ajustes de H3.4.2. **Entrega experimental para revisión; sin aprobación visual, merge ni avance a combate.**

## Base y alcance

Rama `experiment/h3-4-3-busqueda-mapa`, creada desde el remoto limpio **`c8d4e59321bac099306c99f53d18caba3fcd9e9d`**, H3.4.2/PR22 draft contra H3.4.1. Se leyeron README, tablero, protocolo15, informes84–86 y código vigente; no se encontró AGENTS.md aplicable. Main comprobada en **`826199d96645b95869509995772c914290d63ac7`**. Tag anotado `0fdb214612486f4cc46c1acb444390de963d05e8` → referencia preservada **`62e4e85150b2416ccf07d671c186b5c421993b0b`**. No se toca main, tag/release ni PR anteriores.

La revisión independiente de545 pruebas sobre1141b89 se conserva como historia: **no valida c8d4 ni esta entrega**. Antes de modificar se ejecutaron **npm ci, check:build y555/555** sobre la base real, más Chromium propio: experiencia5, cámara9, recuperación5, movimiento3 y bordes9. También se comprobó el CI exacto de c8d4, [41882424709](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/41882424709), success/artifact verificado previamente. Ese CI es evidencia reutilizada de la base; las ejecuciones locales aquí descritas son nuevas.

Implementación **`4138153963bba8201a2f0635f42990f1b20f240f`**; este informe y evidencia pertenecen al commit documental posterior. PR nuevo en borrador **contra `experiment/h3-4-2-movimiento-mapa`**; el enlace, head completo, CI del head y comprobación del artifact se registran en la descripción del PR para evitar atribuir el CI de un ancestro al commit entregado.

## Reglas recuperadas del código, sin rediseñarlas

- Buscar requiere personaje propio vivo fuera de colonia, fase interactiva, ausencia de decisiones, mazo no vacío y dado suficiente. Puede buscar aunque ya se haya movido. Se gasta **un dado existente**, no hay nueva tirada de acción ni exposición de búsqueda.
- Requisito efectivo del motor: búsqueda base con modificadores existentes de Clara/biblioteca y palanca, mínimo1. Iris/explorador revela otra carta; linterna equipada añade otra una vez por ronda. Esos beneficios iniciales no generan ruido.
- Se revela una carta normal y las adicionales que correspondan. Durante la elección, revelar otra cuesta **+1 ruido** mientras el ruido sea menor que4 y quede mazo. Se conserva **una sola**; las demás vuelven al **fondo**.
- El objeto normal entra en la mano; las muestras conservan su identidad de hallazgo. Un rescate ejecuta el reclutamiento o cola del motor, sin inventar un objeto de mano. Después se evalúan encrucijada, fin de partida y avisos originales.

Fuentes: `search`, `effectiveSearch`, `consume`, `beginSearch`, `addNoiseSearch`, `chooseLoot`, `stashLoot` y reglas de objetos del motor. No se analiza el texto del registro para reconstruir consecuencias.

## Implementación y autoridad

Entrada independiente **`/prototypes/search-map/`**, conservando H3.4.2. El host empaqueta el motor real; el visor no importa módulos de `src/`. Se reutilizan cámara, renderer, controles, identidad, tormenta, layout estable, controlador de movimiento y secuencia de exposición. La pequeña composición de presentación propia evita cambiar los experimentos aprobados; no es un segundo motor.

El cambio de motor comparte la ejecución de búsqueda nativa con la nueva entrada: `consume(min, índice)` conserva el valor predeterminado anterior; `executeSearch` sigue llamando las mismas consecuencias. Una consulta pura `searchOptions(ID)` expone requisito, localidad y dados indexados. `searchById` revalida generación, ronda, turno, origen, versión de reserva, índice/valor, pertenencia, vida y bloqueos antes de ejecutar. Dados iguales se identifican por **índice dentro de esa versión**, no por valor ni personaje activo del host. Se extrajo el bloqueo común de consulta que ya usaba movimiento; no llama `playable`, `decisionKind`, `paint` ni RNG para preguntar legalidad.

El diario efímero de búsqueda registra ID de operación, propietario, actor, dado, cartas efectivamente reveladas y resultado estructurado. Se actualiza junto a las funciones originales y **no forma parte del snapshot ni añade guardados**. Las decisiones comprueban operación y paso actuales, actor vivo/ubicación y referencia de la elección pendiente. Una reconsulta puede recuperar elección o resultado sin ejecutar otra búsqueda.

`MessageChannel` usa protocolo `iec-search-map/v1`. Lista cerrada: `move`, `search`, `search-noise`, `search-choose`, `search-dismiss`; sesiones, revisión, campos y tipos validados. No hay dispatcher genérico en producto. IDs de petición/fingerprint evitan doble ejecución; reutilizar ID con otros datos se rechaza. Caché acotada128, revisada también contra generación/ronda/propietario para no devolver un resultado privado de otro turno. Confirmaciones repetidas quedan bloqueadas en cliente y receptor.

Una espera de respuesta de8s solo pide un snapshot; **no reenvía** una acción de resultado desconocido. No es un límite de ejecución del motor. Una respuesta tardía se acepta solo para la petición vigente y su ámbito. El temporizador compartido se cancela únicamente al coincidir la respuesta con la solicitud pendiente.

## Presentación y privacidad

Seleccionar propio → Buscar → requisito/dados reales → revisar personaje/localidad/dado → confirmar →≈750ms → carta/elección → resumen → Continuar. Cancelar/Escape antes de confirmar no envía comando ni altera snapshot/RNG. El panel superpuesto no cambia el tamaño del escenario. Después de ejecutar, Escape no deshace ni evita la decisión obligatoria. Botones con etiquetas, foco y mínimo táctil44px; las listas largas se desplazan internamente.

Nombre/tipo/descripción provienen del catálogo existente. La carta elegida permanece visible hasta continuar; se informa ruido y si entró en la mano o se resolvió automáticamente. Solo lectura de **Mano del turno**: usar/equipar/transferir/donar siguen en V9.9. Una encrucijada general deja visible el resultado y espera **Continuar en V9.9**; no se confirma automáticamente. Al resolverla, el mapa se actualiza. Rescates habituales se presentan en el mapa y se cierra su aviso original al continuar.

El visor recibe únicamente cartas ya reveladas y la mano autorizada del turno; nunca mazos, cartas futuras o mano rival. El registro heredado **incluye nombres privados**: esta entrada omite `log` y `last` completos, sin intentar redactarlos mediante palabras. Registro completo permanece en V9.9. Pase/turno/nueva partida/inactividad limpian cartas, resultado y mano del DOM y del controlador; pagehide además descarta el estado privado antes de desmontar. La proyección pública retenida durante una presentación tampoco guarda la mano privada. Las respuestas atrasadas no repueblan información anterior.

Interrupción de presentación recupera el resultado real sin repetirla; volver de V9.9 o reconstruir el visor recupera una elección obligatoria. Ocultar la página detiene la presentación; el ciclo gráfico/ambiente existente conserva su pausa. Movimiento reducido acorta la presentación a100ms; audio apagado al inicio. No se invoca RNG del juego desde efectos o presentación.

## TDD, problemas encontrados y revisión crítica propia

Las primeras pruebas del motor/protocolo/controlador quedaron **rojas por falta del contrato**; se conservan esos resultados y las pruebas finales. No se presentan como defectos previos de las reglas nativas.

**Regresión confirmada durante integración:** en la nueva entrada, el bloqueo por muerte cortaba inmediatamente una presentación de movimiento ya aceptada. El gate de experiencia falló esperando revelar exposición, con video/JSON conservados. Corrección mínima: limpiar información privada en esa barrera sin cancelar la secuencia de movimiento del mismo ámbito; se mantiene la revelación y el botón deliberado antes de V9.9. El mismo gate vuelve a comprobar blanco, herida, congelación, decisión y muerte.

**Ajustes de arnés diferenciados:** el primer recorrido normal usó una semilla que disparaba una encrucijada real de movimiento y esperaba incorrectamente `idle`; se preparó una secuencia sin ese evento y se conserva el evento en el caso dirigido. Otra repetición concurrente perdió la ventana breve de exposición bajo carga de varios Chromium y venció el timeout; se repitió secuencialmente, conservando el fallo original en el registro de trabajo. No se atribuye ese timeout a una nueva regla ni se debilitan las aserciones. El workflow ejecuta los gates secuencialmente.

Se revisaron límites entre host/visor, retorno de cartas, rescates, linterna por ronda, duplicados, ID estable frente a selección original, datos obsoletos, privacidad del registro/caché/DOM, desmontaje y convivencia con movimiento. Se rechazó duplicar búsqueda, inferir hallazgos desde logs o reenviar al reconectar. La revisión es **propia**, no una nueva revisión humana independiente. La autorización no adopta definitivamente Phaser ni cierra H3.3/artísticamente.

## Validación y evidencia

Linux, Node24.19.0, Chromium154.0.8037.57, Playwright1.57 externo, SwiftShader/software. Escritorio1365×768/DPR1;393×852 y320×640/DPR2 con tacto **emulado**. Sin teléfono físico, VRAM medida ni promesa60FPS. [Evidencia con hashes y videos](evidencias/h343-busqueda/README.md).

| Comprobación | Resultado local |
| --- | --- |
| Suite completa | **576/576**,21 nuevas; sin fallos, omisiones o canceladas. |
| Motor/broker/controlador/build |9+4+6+2 nuevas: equivalencia nativa/snapshot/RNG, índices repetidos, insuficiente/ausente/consumido, rival/muerto/obsoleto, cancelación pura, habilidades/equipo, ruido4/mazo agotado, rescate/cola, privacidad, deduplicación y producto sin QA. |
| Oráculo57872ee | **40/40** configuraciones iguales; suite histórica451/451 y candidata576/576 ejecutadas en este trabajo. |
| Búsqueda Chromium | **3 tamaños**: mover→buscar, teclado/ratón/tacto, cancelar/Escape, dado repetido, doble confirmar/ruido, conservar una, mano y pase J1/J2, sin errores/desbordamiento. |
| Recuperación y bordes nuevos | **9+1 casos**: vista original, visibilidad controlada, reconexión controlada, respuesta perdida, estado obsoleto, explorador, movimiento reducido/audiooff, encrucijada deliberada, búsqueda J2 y tres reinicios con listeners estables. |
| Movimiento en la entrada nueva | **5/5**,1500ms/exposición/daños/muerte/decisión, sin adelantar consecuencias, mismo RNG durante presentación. |
| Cámara en la entrada nueva | **9/9**,3 tamaños×apagado/Suave/Tormenta;0 cambios de ficha sin nuevo cuadro de mapa, selección posterior correcta,0 escrituras de fichas en reposo y0 renders continuos con efectos apagados. |
| Regresión entradas anteriores | H3.4.2 **3+9** y H3.4.1 **3+9**, locales y aprobadas; los gates adicionales previos se repiten en el CI exacto del PR. |
| Construcción | HTML de referencia regenerado desde fuente; builds/checks correspondientes y nuevo bundle aislado, sin dependencias nuevas. |

Los videos completos incluyen búsqueda normal y una segunda con ruido, en los tres tamaños. Se inspeccionaron capturas y secuencias de200ms del escritorio; las trazas por RAF confirman modo mapa/una sola ficha, mismo encuadre/área y ninguna carta durante `presenting`. Duración observada de la presentación normal≈766–817ms en las primeras trazas; no es un benchmark de fluidez. Una captura fija no se usa como prueba de ausencia de pestañeo. La grabación comprimida25FPS no descarta cualquier artefacto subcuadro en otras GPU.

Sin nuevos PNG, derivados ni texturas: hashes de bundles H3.3 maqueta `2fabef6f…`, taller `265c882a…` y Phaser hospital `7e7b90ab…` conservados respecto de la base. El nuevo bundle medido tiene1.489.504bytes,403.670gzip9, frente a1.477.710/400.092 del mapa de movimiento:≈11,8kB crudos/3,6kB comprimidos adicionales, sin extrapolar memoria o rendimiento físico. Los hosts sí se reconstruyen con el soporte mínimo del motor.

El nuevo workflow instala Node22, comprueba el **head exacto**, suite/oráculo, cinco builds y los gates nuevos y previos H3.4.1/H3.4.2, subiendo JSON/videos/trazas. Resultado global, run y artifact descargado se verifican en la descripción del nuevo PR; **no se reemplazan por el CI de c8d4 ni4138153 si el head documental es posterior**.

## Probar y reservas

`npm.cmd ci` → **`npm.cmd run dev:search-map`** → **http://127.0.0.1:8777/prototypes/search-map/**. [Guía exacta Windows/VSCode/LAN y recorrido manual](../prototypes/search-map/README.md). Detener servidor anterior con Ctrl+C, reiniciar y recargar tras actualizar. No usar la ruta8776 para revisar Buscar.

No persistencia nueva, inventario accionable, combate ni terminar turnos desde el mapa. Decisiones generales/IA siguen en V9.9. La privacidad está diseñada para el pase local; no es protección frente a herramientas de desarrollo del mismo navegador. Reconexión/visibilidad nuevas son pruebas controladas, **no una certificación nueva de bfcache real**; se mantiene evidencia anterior por separado. Arte, capacidades visuales, mapa horizontal y pruebas físicas siguen pendientes. La política de reglas y la referencia preservada no se alteran.

**Única siguiente tarea: revisión del creador de H3.4.3 en el nuevo PR draft.** No fusionar ni iniciar otra acción.
