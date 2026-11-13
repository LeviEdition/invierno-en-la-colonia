# 96 — Capacidades exteriores e inventario desde el mapa

La distribución visual de de4d1c8 fue aceptada expresamente. Misma rama/PR25 draft; remoto/local limpios y CI43439050557 success verificados. Sin cambios posteriores al iniciar. No se modifica el fondo, las posiciones, las escalas ni la distribución aceptada.

## Bloque1 — capacidades verificadas

`config/horizontal-capacities.json` define los33 accesos: colonia12, supermercado/hospital/comisaría/escuela4, gasolinera2 y biblioteca3. El host horizontal y la configuración de presentación usan esa fuente; la construcción rechaza una geometría con otra cantidad de casillas. Las plazas de supervivientes conservan12/4. El host de acciones y la referencia estable conservan sus datos12/4; el HTML estable sigue reproducible y sin cambios.

Auditoría de reglas: incorporación de zombis, accesos libres, constructor, barricadas pagadas, hacha/manual, atracción, encrucijadas, oleadas, consultas, proyección e IA usan `zcap`/`openAccess`; no se sustituyen sus resoluciones. A saturación, un zombi rompe una barricada si existe; sin ella, se mantiene la selección de víctima y consecuencias originales. No se elimina un zombi existente.

No hay persistencia de partidas, importador ni API de restauración: `snapshot` solo consulta; reconectar recupera la misma instancia viva. Recargar el host requiere preparar otra partida. Los estados anteriores incompatibles que se proyecten conservan todos los conteos, libres negativos y aviso de excedentes; no hay truncamiento ni desbordamiento retroactivo. Las nuevas incorporaciones siguen la regla de saturación con la capacidad vigente. Una futura importación requerirá una política explícita, fuera de este encargo.

Verificación previa a inventario:655/655, tres regresiones nuevas sobre las siete localidades, pureza/rechazo sin coste, mezcla llena, incorporación, barricada y desbordamiento. HTML estable reproducible. Chromium1365×768/852×393: gasolinera1Z+1B y biblioteca2Z+1B, libres0 y capacidad compartida exacta. Escenarios controlados en motor real, móvil emulado.

Bloque1: commit **c1f2666**, completado y verificado antes de implementar inventario.

## Bloque2 — operaciones auditadas e implementadas

| Operación de V9.9 | Desde el mapa | Condiciones y efectos conservados |
|---|---|---|
|Comida y conservas|Implementada|Reserva común; consume una copia y genera1 residuo. Sin elegir personaje.|
|Vendas, botiquín y tratamiento térmico|Implementada|Superviviente propio que necesite ese tratamiento; cantidades, heridas primero y bonus de paramédico originales.|
|Manual y notas|Implementada|Residuos/accesos libres, investigación y bonus de investigador originales. Consumo y residuos reales.|
|Muestra|Implementada|Conserva al descubridor y su bonus; solo pide personaje si falta el descubridor. Sin residuo.|
|Rescate en mano|Implementada|Reclutamiento original con plaza y personaje disponible. Los rescates obtenidos al buscar conservan su resolución automática.|
|Combustible contextual|Implementada|Pide superviviente y destino legal; consume el bidón elegido, genera1 residuo y marca movimiento sin exposición ni dado. Un segundo movimiento se rechaza. Moverse normal conserva su comportamiento.|
|Equipar armas/herramientas|Implementada|Un objeto por tipo según V9.9; sin coste/dado nuevo. Modificadores efectivos inmediatos en ataque, búsqueda y construcción.|
|Transferir equipo dentro del propio grupo|Implementada|Receptor vivo en la misma localidad, sin ese tipo de equipo. Conserva la identidad y uso por ronda del objeto.|
|Aportar carta de mano o equipo a la crisis|Implementada|Tipo y máximo originales; utiliza CrisisManager, consume la copia/equipo y no genera residuos ni gasta dado.|
|Retirar equipo a la mano / sustituir directamente|No existen en V9.9|No se ofrecen. El comando nativo de retirar solo informa que debe transferirse.|
|Transferencia entre jugadores locales|Pendiente de flujo propio|Existe en V9.9 local y sigue accesible allí; este panel limita receptores al grupo activo.|
|Usos automáticos del equipo|Conservados en el motor|Linterna, armas, hacha, herramientas y estados de uso por ronda se ejecutan en sus acciones originales.|
|Encrucijadas, sucesiones y otras decisiones generales|Retorno explícito a V9.9|El resultado indica el límite y ofrece Continuar; no se resuelve automáticamente.|

Acceso desde la barra y la ficha del personaje. Mano compartida separada del equipo de cada superviviente; cada copia tiene identidad propia. El diálogo conserva cámara, zoom y selección, tiene desplazamiento interno/controles44px y bloquea los clics al mapa. Antes de confirmar muestra objetivos, equipo actual, efecto y consumo. Escape/cancelación no consumen recursos.

La extensión se compila únicamente en el host horizontal. Utiliza `ItemEngine.use`, `CrisisManager` y la transferencia nativa; las consultas de legalidad permanecen en el motor, sin consumir azar ni cambiar la partida. La vista solo presenta consultas y envía intenciones. Sesión/revisión, propiedad, carta, personaje, destino y estado se revalidan; los identificadores de solicitud deduplican confirmaciones. Una respuesta desconocida obliga a consultar el estado/recibo antes de permitir otra operación. Las copias de objetos usan identidad de instancia; cartas legadas primitivas se identifican por ámbito/posición y revisión. No hay importador nuevo.

El inventario privado se borra del panel al cambiar de turno, partida, ocultar página o salir de la vista; no se proyecta la mano rival. El resultado de un objeto que finaliza la partida permanece consultable y deriva explícitamente a V9.9. No se implementan cierre de turno/ronda, habilidades nuevas ni narrativa.

## Verificación y evidencia

[Capturas, resultados y vídeo](evidencias/capacidades-e-inventario/README.md). Suite completa666/666; once pruebas nuevas de inventario, incluyendo equivalencia de doce usos/equipamientos y aportes de mano/equipo con igual estado y azar que V9.9. Se comprueban objetivos inválidos, cancelación, duplicados, descarte/residuos, modificadores, transferencia, privacidad, obsolescencia, reemplazo por copia igual, doble confirmación, recuperación objeto que termina la partida y cola de rescates sin procesamiento adicional al publicar el recibo. Tres pruebas de capacidades recorren las siete localidades. HTML estable y mapa reproducibles.

Chromium1365×768 y852×393: gasolinera/biblioteca saturadas; buscar y conservar una carta, consultarla, tratar una herida, equipar palanca y buscar después gastando un dado2 (requisito modificado3→2), cancelar con Escape, rechazar tratamiento innecesario, doble confirmación, cámara/selección estables y controles44px. Recuperación sin reenvío comprobada además en escritorio. Regresión original de movimiento, ataque/exposición, barricadas y búsqueda aprobada en ambos tamaños.

El primer recorrido detectó una revisión desactualizada tras reconocer la búsqueda: el cliente no incorporaba la revisión devuelta por ese comando. El host rechazó correctamente la operación sin consumo. Se actualiza el controlador de inventario con cada estado confirmado; el recorrido buscar→inventario conserva esa regresión. No se aumentaron esperas ni se retiraron aserciones.

Linux/Node24.19.0/Chromium154/SwiftShader; móvil con tacto/DPR2 emulados, sin teléfono físico. Los escenarios con cartas/estados concretos están marcados como QA y separados de una partida normal. La aceptación manual del inventario queda pendiente. SHA exacto, CI y artifact del head se registran en PR25; sin main, fusión o publicación.
