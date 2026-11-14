# 99 — Experiencia unificada del mapa

## Auditoría previa ·14/11/2026

Rama local/remota limpia enef99f3c2e0d2063f0a94c45d02fdce43e284148d; PR25 abierto/draft contra694b645, CI43502182729 success verificado. Main826199d intacto. Sin AGENTS.md aplicable. El encargo autoriza reorganizar la presentación y sustituye el siguiente paso anterior de revisión manual; conserva reglas, costes, azar, IA, privacidad,33 accesos/plazas, geometría/arte y referencia estable.

Antes de editar se ejecutó la **versión normal** en1365×768,852×393 y393×852, con animaciones habituales, sin hooks QA ni parches de estado. Azar controlado para reproducir resultados; todas las acciones y decisiones se pulsaron en la interfaz. Preparación → seleccionar Mara → ataque/herida → habilidad de tratamiento → usar comida → equipar → transferir a J2 → aportar → limpiar → atraer parcialmente/terminar → mejorar dado → mover → buscar/conservar → Registro → turnos/colonia/sucesiones/final. Otros seis recorridos normales reproducen mordedura/sacrificio/sucesión y encrucijada activada por movimiento. [Capturas y pulsaciones previas](evidencias/experiencia-unificada/antes/). Se distinguen cambios de selector y scroll de las pulsaciones de botones registradas; estas no son una medida de tiempo humano.

|Tamaño|Cabecera|Objetivo/crisis/turno|Cámara en fila propia|Mapa CSS antes|
|---|---:|---:|---:|---|
|1365×768|68px|55px|57px|1055×563|
|852×393|50px|49px|49px|852×245|
|393×852|75,25px|124,59px|53px|393×576|

Hallazgos observados: Inventario en cabecera/menú/personaje/mano; objetivo/crisis repetidos en botones y resumen; cuatro atajos flotantes duplican acciones de ficha y ocultan las restantes; ambientación/audio/lista de mano y consultas técnicas mezclados con personaje. El menú expone comparación/taller/mapa anterior/arte/reconexión/reinicio. Equipar/transferir/limpiar/tratar/mejorar/aportar exigen reconocer un resultado sin elección nueva. Un ataque móvil cierra la ficha y obliga a reabrirla para encontrar otras acciones. La limpieza/tratamiento usan un modal de “Decisión de la partida” y mensajes genéricos, con contadores no pertinentes. Inventario recorre personajes sin equipo y ofrece aportar en todas las cartas. Selector de un solo objetivo en ataque; cámara ocupa casi todo el ancho móvil. Hambre/residuos están dispersos en ayuda. El Registro mezcla cronologías de dos diarios y muestra demasiado detalle de entrada. El final se encabeza como “Ciclo de turno y ronda”. Pasar las pruebas funcionales no resuelve estos problemas de usabilidad.

## Reorganización autorizada

Una cabecera compacta, objetivo/crisis con detalles desde su resumen, cámara sobre el mapa y un solo panel contextual para selección, borradores, inventario y consultas. Menú: Inventario, Grupo y líderes, Registro, Ajustes, Ayuda y Nueva partida separada. Herramientas técnicas en acceso de desarrollo independiente; recuperación solo en el error pertinente. Modales para mordedura/encrucijada/pase/sucesión/abandono/final y confirmación de fallecimientos. Los resultados rutinarios se mantienen en el contexto/Registro y su reconocimiento técnico usa el mismo comando de presentación, sin repetir efectos.

Implementación y verificación en curso. Las comparaciones y el SHA/CI exactos se completarán antes de entregar; no se declara aceptación manual ni se fusiona/publica.
