# 88 — H3.4.4: ataque y barricadas desde el mapa

05/11/2026, America/Montevideo. Implementación autorizada por el creador. **Entrega técnica para revisión: H3.4.3 y H3.4.4 siguen pendientes de validación manual.** Autorizar esta continuación no acepta retrospectivamente la experiencia de búsqueda ni permite fusionar.

## Estado inicial y alcance

Árbol limpio y rama H3.4.3 en **`4357df8d60d45bf13ed966add489e79c0f27ad45`**, idéntica al remoto y al head del PR23, abierto/draft contra H3.4.2. CI exacto [41924037076](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/41924037076) aprobado. Se leyeron README, tablero, informe87, protocolo15 y código; sin AGENTS.md aplicable. Main observada **`826199d96645b95869509995772c914290d63ac7`**, tag anotado `0fdb214612486f4cc46c1acb444390de963d05e8` → referencia **`62e4e85150b2416ccf07d671c186b5c421993b0b`**. No se modifican main, tag/release ni PR anteriores.

Se creó **`experiment/h3-4-4-ataque-barricadas-mapa`** desde ese SHA; nuevo PR en borrador **contra `experiment/h3-4-3-busqueda-mapa`**. Implementación **`b8b9214a00786acab29c7933618a3c8ef7e9637a`**, ajuste de atribución **`1419077d507eac9a0052e655ee03c680f23165de`**; informe/evidencia en commit posterior. El head completo entregado y su CI se registran en la descripción del PR, diferenciándolos del commit de implementación y del CI de la base.

Antes de modificar: instalación reproducible, check:build y **576/576** propios; Chromium de búsqueda en3 tamaños y11 bordes. El primer intento del caso de respuesta perdida descubrió una carrera del **arnés**: capturaba el estado antes de ejecutar el host. Se añadió espera de la operación real antes de capturar, manteniendo las aserciones de no repetición. Los11 casos pasaron al repetir; rojo y resultado conservados. No fue un defecto reproducido del motor ni se marca H3.4.3 aceptada.

## Reglas encontradas y preservadas

| Acción | Comportamiento de V9.9 usado |
| --- | --- |
| Ataque |Un superviviente propio vivo ataca los **zombis de su localidad actual**, incluida colonia. Consume un dado real suficiente para `effectiveAttack`. No existe tirada de acierto adicional. El motor trabaja con cantidades, sin zombis individuales ni ataques a edificios remotos. |
| Modificadores |Combatiente reduce requisito1; rifle/hacha reducen1 según la regla existente, mínimo1. Escopeta elimina hasta2 en lugar de1. Pistola evita la primera exposición de ataque de la ronda; rifle lo hace fuera de colonia. Resistencia puede evitar el primer daño perjudicial; hacha puede añadir una barricada en colonia después del combate, con sus condiciones reales. |
| Exposición |Se aplica después de las bajas cuando corresponde. Puede no haber tirada por equipo; si la hay, se presenta el valor real y su efecto. Herida, congelación, mordedura, muerte, propagación y sucesión conservan el orden del motor. |
| Construcción con dado |Un dado1+; cantidad máxima `(guardia?2:1) + herramientas de reparación`, recortada por los accesos realmente libres. No exige gastar una carta de herramientas ni comida. Zombis y barricadas comparten el límite de accesos. |
| Habilidad de constructor |Leo/Hugo, una vez por ronda, **una** barricada sin dado mediante la habilidad ya existente. No aplica bonus de herramientas, no confirma líder inicial ni dispara una encrucijada adicional: reproduce `special()` tal como era. La opción queda deshabilitada al usarla. Otras habilidades manuales siguen en V9.9. |

Fuentes: `attack`, `barricade`, `special`, `consume`, `effectiveAttack`, `openAccess`, `ItemEngine.attack`, `expose`, `crossAction` y reglas de muerte. Se comprobó equivalencia de snapshot y secuencia aleatoria con las acciones originales; no se reinterpretan reglas del juego de mesa ni se añade balance.

**Objetivos:** el selector muestra el único objetivo agregado legal, por ejemplo «Zombis de Hospital (2)». No se inventa una elección de víctima individual ni una regla de alcance. La ubicación exacta de una barricada es presentación del conteo: el motor no guarda direcciones individuales de accesos. Las capacidades exteriores actuales del dibujo y motor coinciden en **4 por localidad exterior/12 en colonia**. Las pruebas llenan esos accesos; no se encontró un bloqueo de representación para estas acciones. Las diferencias de plazas de supervivientes en gasolinera/biblioteca siguen pendientes y no se corrigen aquí.

## Arquitectura y ejecución

Entrada nueva **`/prototypes/action-map/`**. Conserva las entradas anteriores y reutiliza gráficos, PNG, cámara, controles, tormenta, layout/identidad y controlador de búsqueda/movimiento. El visor no importa el motor. Una composición de presentación separada evita reescribir los prototipos de comparación; la lógica de juego permanece única en el host V9.9.

El motor añade consultas puras `actionOptions(ID, tipo)`, ejecución `actById` y un diario efímero de resultados. Se revalidan partida/generación, ronda, turno, propiedad, vida, fase/decisiones, origen/objetivo, requisito y referencia de dado **por índice+valor dentro de su versión**, incluso con valores repetidos. La construcción gratuita valida habilidad/uso/capacidad y referencias de dado nulas. No usa `playable`, `paint`, `decisionKind` ni RNG para consultar legalidad.

Las rutas nativas y nuevas comparten `executeAttack`, `executeBarricade` y `executeBuilder`. `ItemEngine.attack` conserva su retorno booleano y orden de consecuencias, añadiendo únicamente un callback opcional para recuperar exposición/bajas reales. El diario está fuera de `Game.snapshot`, no añade guardados y se invalida al cambiar de partida/turno/ronda o ejecutar otra acción que lo sustituye. Reconocer un resultado modifica solo ese diario; no consume recursos ni RNG.

El broker nuevo compone el de búsqueda y traduce una revisión común. Mensajes nuevos cerrados: `attack`, `barricade`, **`barricade-ability`** y `action-dismiss`, además de los cinco anteriores. `barricade-ability` solo permite la construcción de Leo/Hugo; **no expone `special` ni un dispatcher genérico**. Valida campos/tipos, sesión, revisión, actor, objetivo y dado. Caché acotada128/fingerprint y ámbito generación/ronda/propietario impiden doble ejecución o respuestas privadas de otro turno. Las confirmaciones repetidas se bloquean también en cliente.

Tras8s sin respuesta se consulta el estado, **sin reenviar** una acción de resultado desconocido. Reconectar o reiniciar recupera el resultado real y no repite ni simula una segunda exposición. Respuestas tardías deben coincidir con la petición vigente; una respuesta vieja de ataque no cancela un reconocimiento nuevo.

Inventario del jugador —solo cartas autorizadas del turno— y equipo de cada superviviente se distinguen en interfaz. Se mantiene la privacidad de búsqueda: sin mano rival, mazos completos o cartas futuras; `log/last` heredados siguen omitidos porque pueden nombrar cartas privadas. Pase/turno/nueva partida limpian lo privado. El resultado público de ataque puede permanecer durante una muerte pendiente, sin conservar cartas en pantalla.

## Presentación y continuidad

Propio → Atacar/Construir → objetivo/coste → dado o habilidad gratuita → confirmar/cancelar. La confirmación es previa al consumo. Escape cancela solo la preparación. Enemigos no muestran acciones. Se señala el objetivo, se conservan cámara y selección y no se reconstruye Phaser para ejecutar una acción.

El ataque usa≈550ms de señal inicial; después muestra las bajas reales y reutiliza la tensión/revelación de exposición existente. El actor no camina. Heridas/muerte se aplican visualmente después de revelar, aunque el motor ya haya resuelto la acción una sola vez. Se informa cuándo pistola/rifle evitan exposición **sin tirar**, y se diferencian de blanco/resistencia.

La construcción revela la barricada en el acceso de presentación libre, con aparición gradual durante la breve señal y resumen persistente. Solo se añade opacidad opcional por nodo al renderer compartido, predeterminada1; PNG y efectos no cambian. El reloj compartido admite duraciones inicial/de resultado opcionales, conservando **1500ms** y comportamiento previo por defecto para movimiento. Movimiento reducido abrevia la secuencia; audio inicial apagado y ambientación/azar siguen separados.

Muerte, mordedura, sucesión y encrucijadas no trasladadas esperan **Continuar en V9.9**. No se cambia automáticamente a esa pantalla ni se resuelven decisiones. Después de resolverlas se puede volver al mapa con datos actualizados. La víctima desaparece y se limpia su selección después de la revelación, sin confundirla con otro retrato. Reiniciar/reconectar recupera por ID al actor vivo del resultado; si murió, no se selecciona un sustituto implícito.

En horizontal se compacta la cabecera, la ficha es plegable y hay accesos rápidos a las mismas cuatro acciones, mediante los botones primarios y una sola ejecución. El panel aparece al lado opuesto al personaje y usa scroll propio; al iniciar se pliega la ficha móvil. Pan/pinza continúan disponibles. Las capas de señal no capturan clics. Vertical sigue utilizable. El inventario es de grupo; los dados no se reasignan al superviviente seleccionado.

## TDD y revisión crítica propia

Se conservan pruebas rojas anteriores a los contratos de motor, protocolo, controlador y habilidad gratuita. Las primeras validan una API todavía ausente, no supuestos defectos de las reglas anteriores. Se revisaron especialmente la idempotencia, la traducción de revisiones, el retorno de decisiones, el coste gratuito, el orden de exposición, la privacidad y la convivencia con búsqueda.

Defectos propios confirmados durante la integración y corregidos:

- **Bloqueo del panel durante búsqueda:** el cálculo de disponibilidad consultaba una variable antes de inicializarla al bloquear otras acciones, con errores de consola y elección sin completar. Se corrigió la referencia; el recorrido de las cuatro acciones pasó de nuevo en los cinco tamaños. Rojo y resultado conservados.
- **Carrera de foco por teclado:** el enfoque inicial programado podía ejecutarse después de elegir un dado y quitar el foco de Confirmar. Se invalida ese enfoque pendiente al elegir; aplica también al panel de búsqueda compartido. El gate comprueba el foco después de varios fotogramas, manteniendo todas las aserciones de ejecución.
- **Atribución de un resultado recuperado:** si V9.9 ejecutaba con otro personaje, el título podía usar la selección visual anterior. Se reprodujo y corrigió para tomar el actor del resultado estructurado; el resumen y el título coinciden aunque la selección visual sea otra. Se conserva rojo→verde.
- **Continuidad al reconstruir:** el resultado recuperado identificaba al actor pero no restauraba su selección. Se reutiliza su ID vivo, sin seleccionar fallecidos; comprobaciones dirigidas de reinicio/reconexión añadidas.

El primer arranque de servidor nuevo usó por error el servidor delegado y no exponía la ruta nueva; se corrigió su fábrica y se cubren HTTP200/rutas anteriores/QA no publicado/traversal en tests. No se atribuye a la instalación del usuario ni se cambia Python/políticas de Windows.

No se agregan ataques a distancia, munición, desplazamiento libre, capacidades, habilidades nuevas o arte. Se descartó duplicar el combate en la vista o inferir resultados desde el registro. La revisión es **propia**, no una revisión humana independiente. La calidad artística/experiencia manual sigue reservada al creador.

## Validación

Linux, Node24.19.0, Chromium154.0.8037.57, Playwright1.57 externo y SwiftShader/software. Escritorio1365×768/DPR1; horizontal **852×393/740×360**, vertical393×852/320×640, DPR2/tacto emulado. No se probó un teléfono físico ni se midió rendimiento móvil real/VRAM.

| Comprobación | Resultado propio |
| --- | --- |
| Línea base | npm ci/check:build,576/576; búsqueda3 tamaños y11 casos después del ajuste del arnés. |
| Suite | **605/605**,29 nuevas, sin fallos/omisiones/canceladas. Motor13, broker5, controlador7, build2, presentación/layout2. |
| Oráculo57872ee | **40/40** configuraciones iguales y RNG conservado; suite histórica451 y candidata605 ejecutadas. |
| Recorrido de las cuatro acciones | **5 viewports**, ratón/teclado/tacto, cancelar/Escape sin cambios, dados repetidos, doble clic, exposición real/herida después de revelar, aparición gradual, movimiento+búsqueda+ruido+inventario y cámara/área/selección estables. |
| Bordes dirigidos |13 casos: constructor gratuito, muerte, encrucijada, pistola una vez por ronda, hospital lleno1z+3b, J2/herramientas, respuesta perdida, estado obsoleto, reinicio, visibilidad/reconexión controladas, movimiento reducido y atribución del actor al recuperar una acción nativa. |
| Movimiento y cámara |Gate de experiencia5 y cámara9 —tres tamaños×apagado/Suave/Tormenta—, preservando la sincronización POST_RENDER,1500ms y0 escrituras de fichas en reposo/0 renders continuos al apagar. Repetición final5+9 aprobada y regresión local H3.4.3 en3 tamaños+11 casos. El CI repite además las baterías anteriores. |
| Construcción |Seis builds/checks, HTML de referencia regenerado desde fuente, visor sin motor/host único, QA separado y solo loopback. Sin dependencias nuevas. |

Las tablas reflejan ejecuciones reales identificadas en la [evidencia](evidencias/h344-acciones/README.md); los JSON finales de regresión y el CI del head se comprueban antes de entregar. El workflow repite **las once baterías previas H3.4.1/H3.4.2/H3.4.3 y las cuatro nuevas**, suite/oráculo y seis builds, de forma secuencial. SHA final, run global y artifact descargado/hashes comparados se registran en la descripción del PR. El CI de4357df8 es evidencia de base y no reemplaza esa comprobación.

Se inspeccionaron capturas propias de PC/horizontal/vertical y secuencias temporales del video de ataque, exposición y construcción. Las trazas exigen una instancia, una ficha del actor, mismo encuadre/área y ausencia de cambios fugaces a V9.9. La opacidad intermedia se contrasta con el objeto renderizado. La grabación25FPS/SwiftShader y estas aserciones **no certifican60FPS ni ausencia de cualquier artefacto en otra GPU**.

## Probar, límites y siguiente paso

**`npm.cmd ci` → `npm.cmd run dev:action-map` → http://127.0.0.1:8778/prototypes/action-map/**. Detener el servidor anterior con Ctrl+C, reiniciar tras actualizar y recargar. [Guía Windows/VSCode/LAN y lista manual para ambas etapas](../prototypes/action-map/README.md). Las rutas previas permanecen disponibles; no usar la entrada8777 de búsqueda para revisar ataque/construcción.

Sin inventario accionable, terminar turnos, otras habilidades manuales, guardados nuevos o integración narrativa. Reiniciar el visor conserva la partida pero restablece su encuadre inicial; recargar la página completa puede reiniciar la partida. Las pruebas de visibilidad/reconexión nuevas son controladas, no una certificación nueva de bfcache real. No se cambian arte, efectos, mapa/capacidades pendientes ni referencia estable.

**Única siguiente tarea: revisión manual del creador de H3.4.3 y H3.4.4 en el nuevo PR draft.** No declarar aprobación ni fusionar o iniciar otra acción.
