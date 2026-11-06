# Evidencia — composición integral del mapa

06/11/2026 UTC. Base **edacdf05c67967a49609e45d21dad6e9e0dcc4e0**, misma rama y [PR25 draft](https://github.com/LeviEdition/invierno-en-la-colonia/pull/25). [Informe93](../../93-composicion-integral-del-mapa.md). Sin aprobación artística/manual ni dispositivo móvil físico.

## Antes y después

Misma preparación local/recursos y tamaño1365×768/DPR1, efectos apagados mediante movimiento reducido. El enfoque nuevo incluye fichas y actores completos; su centro/zoom pueden cambiar deliberadamente. Estas capturas comparan composición, no son una afirmación de detalle nuevo del PNG.

|Localidad|Antes edacdf05|Después|
|---|---|---|
|Escuela|[Antes](antes/escuela.png)|[Después](despues/escuela.png)|
|Biblioteca|[Antes](antes/biblioteca.png)|[Después](despues/biblioteca.png)|
|Hospital|[Antes](antes/hospital.png)|[Después](despues/hospital.png)|
|Colonia|[Antes](antes/colonia.png)|[Después](despues/colonia.png)|
|Supermercado|[Antes](antes/supermercado.png)|[Después](despues/supermercado.png)|
|Gasolinera|[Antes](antes/gasolinera.png)|[Después](despues/gasolinera.png)|
|Comisaría|[Antes](antes/comisaria.png)|[Después](despues/comisaria.png)|

Generales: [antes1365](antes/general.png)/[después1365](despues/general.png); [antes1920](antes/general-1920x1080.png)/[después1920](despues/general-1920x1080.png); [antes852 horizontal](antes/general-852x393.png)/[después852](despues/general-852x393.png). En móvil DPR2 las imágenes tienen1704×786 píxeles físicos: no se comparan como si fueran DPR1.

## Máximos aislados

El gate genera12 proyecciones (tres viewports×cuatro modos) con36 supervivientes y36 accesos: exteriores vacíos,36 zombis,36 barricadas y18+18 mixtos. En cada modo captura las siete localidades: **84 capturas de máximos**, además de21 enfoques normales, tres generales y tres pruebas de señalamiento. Se ejecutan en otra página QA, con proyección sintética y sin acceso de ejecución al host real. No se cambia la preparación o capacidad del motor. Rótulos identifican cada modo.

Se incluyen aquí las siete localidades mixtas a1365 y ejemplos de los otros modos en colonia/hospital. El artifact del CI conserva la matriz completa por viewport, incluidos1920 y852 horizontal. [Resultados de composición](composicion.json) comprueban conteos, cuatro retratos únicos, ausencia de errores, independencia de estado/RNG, límites, sólidos y vecinos. [Antes](antes.json) documenta la captura de referencia, no aprobación del nuevo diseño.

Mixtos: [escuela](despues/mixto-escuela.png), [biblioteca](despues/mixto-biblioteca.png), [hospital](despues/mixto-hospital.png), [colonia12](despues/mixto-colonia.png), [supermercado](despues/mixto-supermercado.png), [gasolinera](despues/mixto-gasolinera.png), [comisaría](despues/mixto-comisaria.png).

Otros modos: [colonia vacía exterior](despues/empty-colonia.png), [colonia36zombis en el mapa](despues/zombies-colonia.png), [colonia36barricadas en el mapa](despues/barricades-colonia.png); [hospital vacío](despues/empty-hospital.png), [hospital zombis](despues/zombies-hospital.png), [hospital barricadas](despues/barricades-hospital.png). Cada localidad mantiene su12/4;36 es el total del mapa.

Móvil horizontal: [colonia](despues/mixto-colonia-852x393.png), [hospital](despues/mixto-hospital-852x393.png), [comisaría](despues/mixto-comisaria-852x393.png). [Señalamiento de biblioteca](despues/senalar-biblioteca.png); [luces de colonia](despues/luces-0.png)/[hospital](despues/luces-2.png), con su [video de luces y tormenta](luces-tormenta.webm).

Los iniciales en las escenas QA tienen códigos de dos letras distinguibles; las partidas reales conservan los nombres/IDs del motor y los cuatro retratos explícitos. No se reaprovecha la cara de un fallecido al compactar una lista.

## Reproducciones y recuperación

[Casilla sobre el garaje pequeño](reproducciones/casilla-sobre-garaje.png): captura de una primera propuesta; se añadió el anexo al inventario y se trasladó el acceso a terreno despejado. [Proximidad con fichas vecinas](reproducciones/proximidad-fichas-vecinas.png): el máximo simultáneo motivó separar las fichas de hospital/escuela y supermercado/biblioteca, además de comprobar cada localidad por separado.

[Expectativas antiguas](reproducciones/expectativas-anteriores.txt): la prueba de ancla anterior suponía centro de edificio, y la de filas exigía equidistancia exacta. El encargo ahora pide encuadre completo y colocación manual. Se mantienen las aserciones de zoom/reversibilidad y se añaden sólidos, volúmenes completos, perímetros y separación de vecinos; no se elimina cobertura ni se relajan tolerancias de alfa.

Una batería preliminar se detuvo al finalizar su caso en curso para repetir composición con los últimos ajustes. No se presenta como aprobación de las coordenadas definitivas. La desconexión transitoria del entorno se recuperó; se comprobaron archivos/resultados antes de continuar. Las suites finales usan directorios propios, sin sobrescribir los intentos históricos.

## Video y comprobaciones

[Video completo breve](vegetacion-camara.webm), a velocidad normal y sin interpolación/cortes: viento solo para leer las ramas, varias ráfagas, zoom/pan y apertura/cierre de ficha. [Metadatos](video-metadatos.json), [secuencia de ramas](secuencia-viento.jpg), [muestras temporales](video.json). La regresión de luces/tormenta se conserva aparte en [luces.json](luces.json). Tiempo visual y duración de grabación se distinguen; el render por software no representa un teléfono físico.

[Instalación](npm-ci.txt), [base629](base-629.txt), [suite final](suite.txt), [check HTML](check-build.txt), [oráculo40](oraculo.txt), [siete builds/checks](compilaciones.txt). [Acciones](acciones.json), [bordes](bordes.json), [movimiento](movimiento.json), [cámara](camara.json), [escena6 tamaños](escena.json), [confort](confort.json). Fuente, SHA/alfa y host se comprueban en las pruebas; los PNG y el lockfile están intactos. CI final sobre el SHA exacto, con artifact descargado/verificado, se registra en PR25 para evitar un commit documental circular.

El source de obstáculos solo sirve para QA: edificios, vehículos, cercos, postes, garajes, casas y parada. No es navegación/colisión del juego. Se contrastan72 cuerpos alternativos, elipses y círculos de fichas, también entre localidades. La compuerta anterior32×38/<1% de alfa fuerte se conserva y las elipses usan96 muestras con alfa máximo≤32.

## Medición controlada

[Datos](medicion.json), [resumen](medicion-resumen.json). Base edacdf05 desde checkout separado y candidata secuencialmente, canvas1055×563/DPR1, misma partida y **vista general mediante Restablecer**,500ms de calentamiento y dos muestras1500ms por perfil. El enfoque por localidad cambió; no se usa para comparar costes con cámaras distintas. Este ensayo no se compara directamente con la tabla de92, que usaba otro encuadre.

|Perfil|Base, renders/s|Candidata, renders/s|
|---|---:|---:|
|Apagado|0,00|0,00|
|Suave|13,74|14,02|
|Tormenta|13,01|12,92|

Variación≈+2,0%/−0,8%, muestras cortas sin intervalo estadístico: no una mejora demostrada. Geometría522/416 y pool132 conservados; auxiliaresRGBA5790524→5289104bytes (≈8,7% menos), sin mipmaps ni equivalencia con VRAM total.

Linux, AMD EPYC9V74, Node24.19.0, Chromium154.0.8037.57, Playwright1.57 externo, ANGLE/Vulkan/SwiftShader por software. Medidas de POST_RENDER/tiempo y CDP TaskDuration/heap, no VRAM. En el CI se identifican sus versiones por separado. No30/60FPS garantizados ni rendimiento móvil real. El PNG1672×941 sigue limitando primeros planos; no se generó detalle artificial.

`manifest.json` identifica bytes/SHA-256 de la evidencia, excluyéndose a sí mismo y a este README. **Única siguiente tarea: revisión del creador.**
