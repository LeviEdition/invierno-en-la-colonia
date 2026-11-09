# 94 — Fondo aprobado y distribución exterior

09/11/2026, America/Montevideo. Misma rama `experiment/mapa-horizontal-ambientacion-h3`, PR25 en borrador. Encargo recibido como texto y fondo subido por el creador en `dd13820a08ca1d4f495b3d54961b4fbe05589c4b`; segundo commit remoto `76c210bcdce170b2691f9a74425b3af7d828832a`. Avance rápido desde89f2c45, sin perder commits. Sin AGENTS.md aplicable.

## Capacidades y discrepancia de reglas

El usuario confirmó expresamente las cantidades exteriores después de contrastar los informes79/83/88. Las capacidades de supervivientes y exteriores son independientes.

| Localidad | Supervivientes: maqueta79 / motor actual | Exteriores confirmados para este mapa | Exteriores del motor actual |
|---|---:|---:|---:|
|Colonia|12 /12|12|12|
|Escuela|4 /4|4|4|
|Gasolinera|2 /4|2|4|
|Biblioteca|3 /4|3|4|
|Hospital|4 /4|4|4|
|Supermercado|4 /4|4|4|
|Comisaría|4 /4|4|4|
|Total|33 /36|33|36|

**Fuentes:** informe79, tabla «Capacidades visuales independientes», confirma2/3 para supervivientes de la maqueta y4 exteriores; informe83, «Capacidad real», y88 mantienen4 en el motor. La nueva confirmación del creador reemplaza4 exteriores por2/3 para la distribución del mapa; no autoriza cambiar resultados del motor. `src/domain/reference-data.mjs` y el HTML estable se preservan. El visor sigue representando hasta36 supervivientes del motor: no restringe movimientos ni altera preparación.

Si una partida real ocupa3/4 exteriores en gasolinera o4 en biblioteca, el mapa conserva los conteos, muestra `+N exteriores` y el panel distingue casillas del mapa y límite actual de partida. No se inventan casillas ni se ocultan los conteos. **Queda pendiente una decisión de reglas separada para reconciliar el motor con esas capacidades**, con sus regresiones y revisión de consecuencias; esta entrega no la implementa silenciosamente.

## Integración del original y capas

Se usa exactamente `assets/mapa-horizontal/nuevo mapa.png`, RGB **1671×941**, sin escalar, recortar ni regenerar píxeles. Bytes/SHA/dimensiones en manifiesto. Los tres originales anteriores permanecen intactos. `activeMap` y su commit señalan la procedencia del recurso nuevo.

La vegetación está integrada: el kit deja de cargar la capa antigua y la vista no crea sus meshes ni máscaras de restitución de edificios. Se desactivan también las tres luces dinámicas antiguas y sus manchas, que no coinciden con el arte. Se conservan las luces pintadas del fondo, sin fingir que se apagan. Nieve, viento ambiental, sonido inicialmente apagado, pausa y movimiento reducido conservados; humo reubicado en la boca de chimenea de colonia(972,280). No se inicia otra animación de árboles.

## Distribución manual e interacción

Coordenadas nuevas medidas sobre el original, sin transformación global de las antiguas. Escala uniforme previa de zombis(altura visible28,05px fuente) y barricadas conservada en todo el mapa; no hay excepciones por localidad para obtener espacio. Referencias visuales: puertas peatonales del hospital/comisaría y automóviles, no el portón de colonia. No es una calibración antropométrica del dibujo generativo.

- Colonia: cuatro detrás separados del techo, dos por lateral y cuatro delante fuera del cerco. Frente dividido para dejar legible el portón. Se conservan los índices0–11, orden y IDs derivados; las etiquetas de lados no añaden reglas. Doce fichas en una fila compacta dentro del patio, sin tapar portón ni ventanas.
- Escuela: cuatro dentro del patio, delante de la fachada y detrás de la valla frontal. Se evita aro, columpios, postes y entrada. La primera propuesta rozaba fachada; se corrigió usando cuerpos completos, no reduciendo actores.
- Hospital: tres delanteras y una lateral despejada; ambulancia, automóvil y acceso conservados. Fichas repartidas arriba sin invadir la valla escolar: se corrigió el primer ensayo.
- Gasolinera: dos delante del edificio, dejando surtidores, columnas y vehículo libres. Biblioteca: tres en el frente útil sin ocupar escalinata/entrada.
- Supermercado: grupo con separación variable alrededor del frente útil, evitando carritos; comisaría: cuatro delante, patrullero y acceso lateral abiertos.

Contornos manuales detallados, clic y oclusión actualizados. Las oclusiones no generan capas sobre este fondo ya integrado; quedan coherentes con las siluetas nuevas. Los obstáculos adicionales son únicamente QA: no colisiones ni navegación. Se verifican66 volúmenes alternativos(33 zombis y33 barricadas), elipses y separación de cuerpos/fichas entre localidades.

Enfoques incluyen edificios, apoyos, fichas y cuerpos completos. La vista general móvil anterior ocultaba el centro de escuela: reproducido en Chromium antes de corregir; el ancla general vertical pasa a415 sobre el nuevo mapa. Se mantiene cámara de cobertura, zoom y reversibilidad de panel310px. **Límite:** la vista general en móvil horizontal recorta márgenes del fondo, incluida parte del extremo superior escolar, por la relación de aspecto; los siete centros son visibles y cada enfoque muestra su localidad completa. Se preserva el archivo íntegro; no se deforma ni recorta el PNG para ocultarlo. En vertical estrecho se conserva pan para recorrer el perímetro.

## Validación y evidencia

Suite local643/643,0 fallos/omitidas/TODO; oráculo57872ee40/40 y `check:build` reproducible. Dos regresiones nuevas: capacidad impar sin actores fraccionarios y excedentes reales conservados cuando las posiciones visuales son menores. Los controles previos se adaptan al arte y a33 exteriores: no se usa el alfa de árboles de otro mapa como prueba de que este fondo RGB está libre. Se conservan volúmenes, sólidos manuales, elipses, separación y capturas.

Los primeros fallos de cámara y la corrección están registrados en la evidencia; la expectativa de ancla antigua836 se adapta a835,5 por el ancho real1671. No se atribuye el CI del head89f2c45 a esta entrega. Chromium: composición3 tamaños/21 enfoques/12 máximos/84 capturas; confort3 tamaños; acciones reales en1365×768 y852×393: movimiento, búsqueda con ruido/elección, ataque/exposición y barricadas. Cancelación pura, una sola ejecución, mismo consumo/azar/resultados y cámara estable. Escena6 tamaños, construcciones y CI se registran al concluir.

Capturas, JSON y registros: [índice](evidencias/fondo-aprobado/README.md). Linux, Node24.19.0, Chromium154, Playwright externo y SwiftShader por software; móvil horizontal emulado, no dispositivo físico. No se declara aceptación artística por aprobar tests.

**Única siguiente tarea después de validar:** revisión visual del creador del fondo y su distribución. PR25 permanece draft; sin merge, publicación ni modificación de main.
