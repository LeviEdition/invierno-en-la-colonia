# 92 — Vegetación natural, espacio útil y lectura del mapa

06/11/2026, UTC. Entrega experimental para revisión del creador en [PR25](https://github.com/LeviEdition/invierno-en-la-colonia/pull/25), en borrador contra H3.4.4. No aceptación artística/manual, merge ni cierre de etapa.

## Base comprobada y alcance

Árbol inicialmente limpio en `experiment/mapa-horizontal-ambientacion-h3`, **64bbe2c53b93a1efb61f5bbe474c25edaa2f50fa**, coincidente con el head remoto. PR25 abierto/draft, base `experiment/h3-4-4-ataque-barricadas-mapa`/**694b64504ca39bb00627fb4cf9964b9521ec211f**. Main **826199d96645b95869509995772c914290d63ac7** y tag/release de referencia intactos. Sin AGENTS.md aplicable; revisión de README, protocolo15, tablero18 e informes90/91.

La solicitud vigente autoriza seis ajustes de presentación: vegetación, ancho del panel cerrado, interfaz horizontal compacta, jerarquía de accesos, contornos y revisión de muestreo/nitidez. Conserva las reglas,36 apoyos y36 accesos, acciones, contratos, azar, capacidad y PNG originales. No se cambia SP-03 ni se inicia otra etapa. Los informes90/91 y su evidencia conservan sus resultados históricos; esta entrega sustituye su implementación de balanceo, no sus registros.

## Vegetación: causa y cambio

La envolvente anterior inmovilizaba el techo y los laterales de cada rectángulo. Una prueba dirigida reproduce una copa inmóvil en el límite aunque su interior se desplace: aumentar amplitud no elimina esa causa de la sensación de goma.

Se sustituyen los ocho rectángulos por ocho siluetas poligonales sobre la **misma textura original**. La malla estática ocupa su complemento; cada silueta se divide en bandas de22px fuente. Earcut público de Phaser4.2.1 triangula ambas partes. No se recorta ni modifica el PNG, no se genera otra imagen ni se añade una dependencia. Las UV siguen apuntando al original1672×941.

Solo se desplaza horizontalmente la vegetación por encima de `bendFromY`; el peso aumenta de forma cuadrática hasta la punta. Raíz y franja inferior permanecen fijas, incluidas las sombras pintadas bajo cada apoyo. Los laterales y la punta quedan libres. Fases, amplitudes y frecuencias distintas comparten el reloj y el viento ya usado por la nieve. Dos arbustos tienen amplitudes2,4/2,8 frente a7–10px fuente de los árboles; la ráfaga y la cámara modulan el desplazamiento final.

|Grupo|Situación en el mapa|Apoyo fuente x,y|Tipo|
|---|---|---|---|
|arbol-oeste|Entre el borde oeste y el hospital|222,456|Árbol|
|arbol-noroeste|Borde superior izquierdo|161,153|Árbol|
|arbol-norte|Norte, hacia la torre de agua|780,148|Árbol|
|arbol-noreste|Sector noreste, sobre el supermercado|1322,351|Árbol|
|arbol-sureste|Este, sobre la comisaría|1430,594|Árbol|
|arbusto-sur-oeste|Sur de la gasolinera|434,799|Arbusto|
|arbol-sur-este|Borde inferior, al sudeste|1003,875|Árbol|
|arbusto-centro-este|Entre colonia y comisaría|1078,620|Arbusto|

Las siluetas se prepararon inspeccionando el alfa original; muescas específicas evitan cortar el arbusto vecino del noroeste y el árbol oeste. La comprobación del contorno móvil muestrea cuatro puntos por píxel y exige alfa≤32 fuera de la banda fija. Ese umbral admite ruido tenue del original, no certifica coincidencia perfecta de cada píxel antialias. Los pinos y conjuntos que no se separan con seguridad quedan estáticos; no se prometió animar cada árbol. Edificios, suelo, cercos, postes y cables no se deforman.

Las máscaras de restauración de edificios tienen ahora su propio `occlusionPolygon`. Se ajustan a su silueta para no cortar árboles próximos; permanecen separadas del área cómoda de clic y del marco dibujado. Los pequeños errores de borde/color entre las capas generadas siguen siendo una reserva artística.

Durante el desarrollo se detectó un fallo nuevo: declarar como ordenados los triángulos arbitrarios de Earcut producía cuñas diagonales. Se conserva la captura roja y se corrige con **`Mesh2D.buildOrderedIndices(1)`**, API pública, antes de habilitar el batch ordenado. La prueba verifica la topología de cada pareja. No se modifica el adaptador protegido HospitalGame.

## Cámara, ficha y espacio móvil

Confirmado en la base: cerrar la ficha mantenía el lateral310px reservado. La variante horizontal usa ahora una columna al cerrarla y conserva un botón Ficha de56×44px. Abrir/cerrar conserva la localidad, el apoyo deseado del encuadre y el zoom solicitado; los límites del mapa evitan nieve vacía. Si la vista general necesita ampliar su mínimo para cubrir el ancho liberado, el aumento es temporal: al reabrir vuelve al zoom elegido. Es una restricción geométrica explícita, no una promesa de zoom idéntico cuando impediría cubrir el lienzo.

Se conserva el centro deseado por separado del centro limitado por los bordes: así un ciclo de cierre/apertura no acumula deriva. No se reinicia Phaser. Se mide el viewport padre y la geometría del panel, el backing del canvas y la cámara se confirman juntos en **PRE_RENDER público**; los retratos siguen usando POST_RENDER. Este comportamiento es optativo de la variante horizontal; las otras entradas conservan su disposición.

La prueba de fotogramas reprodujo primero estiramiento CSS/backing y después una franja sin dibujar durante el cambio de ancho. La comprobación final exige que tamaño CSS, viewport padre y backing/DPR coincidan también durante las transiciones. Se conserva el rojo. El foco de los botones de acción se restaura al revelar realmente el panel; Escape/cancelación no modifican la partida. Una regresión de Constructor esperaba el foco inmediatamente después del clic, antes de ese cuadro; se conserva su rojo y se cambia únicamente la espera para observar el foco final, manteniendo la aserción original. Se comprueba además Escape en movimiento, ataque y construcción.

|Viewport|Mapa antes, ficha abierta/cerrada|Mapa después, abierta|Mapa después, cerrada|
|---|---|---|---|
|1365×768|1055×563 /1055×563|1055×618|1365×618|
|1920×1080|1610×875 /1610×875|1610×930|1920×930|
|852×393|852×226|852×294, ficha superpuesta|852×294|

En móvil horizontal las barras pasan de146 a99px; el área útil aumenta68px, aproximadamente30%. Ronda, turno, moral, comida, objetivo y crisis siguen visibles. Localidad, cámara y botones conservan44px de alto. La navegación de desarrollo y Volver a V9.9 pasan al Menú durante el mapa; permanecen accesibles. El resultado breve de una acción se superpone sin cambiar la altura de la escena. La ficha tiene scroll interno; no se recortan acciones para ganar espacio.

## Lectura de accesos y contornos

Las casillas vacías de otras localidades se dibujan con línea fina, discontinua y alfa reducido; aumentan moderadamente con el zoom. La localidad seleccionada y los lugares implicados en la intención de movimiento/ataque/construcción usan contorno continuo más grueso. Los accesos ocupados mantienen contorno continuo y sus zombis/barricadas: no se atenúan los sprites. Se diferencia por forma y grosor además del color. No se consultan reglas nuevas para inventar destinos legales.

Se mantienen exactamente posiciones y capacidades del informe91. Los siete marcos se revisan en capturas enfocadas; la biblioteca incorpora el saliente de la cabina del frente, que la línea anterior atravesaba. El trazo pasa a1,3px CSS constante, independiente del zoom y separado de la zona amplia de clic. Las máscaras de oclusión se revisan por separado. Los trazados son manuales sobre arte aplanado, no una segmentación certificada píxel a píxel.

## Muestreo y límite del original

Se comprueban antialias activado, `pixelArt:false`, `roundPixels:false`, backing igual a CSS×DPR sin doble escala, magnificación LINEAR y reducción LINEAR_MIPMAP_LINEAR. No se cambia de filtro para disimular detalle ausente ni se aplica enfoque, halos o ampliación de los originales. El problema reproducido de escalado transitorio se corrige con la actualización atómica del viewport.

La barra indica ahora escala **nativa**:100% significa un píxel CSS por píxel fuente;150% es el máximo habitual. Antes indicaba porcentaje relativo al encuadre inicial, que podía cambiar al abrir/cerrar la ficha. El zoom jugable se conserva. En1920px sin ficha incluso la vista general amplía un original de1672px; parte de la suavidad es inevitable.

Como referencia matemática, para llenar todo el mapa al máximo1,5CSS/fuente sin ampliar texeles físicos:

|DPR previsto|Dimensión fuente mínima equivalente|
|---|---|
|1|2508×1412|
|2|5016×2823|
|3|7524×4235|

Son recomendaciones de resolución para una futura fuente artística con detalle real, no nuevos assets ni garantía de calidad. No conviene subir tamaños sin revisar límite GPU, textura POT/mipmaps y memoria: por ejemplo una textura POT8192×8192RGBA con todos sus niveles ronda341MiB lógicos. El presupuesto y la producción de arte permanecen pendientes; no se implementa un sistema de tiles ni se extrapola una GPU física desde SwiftShader.

## Validación y coste

- `npm ci --cache /tmp/iec-npm-cache`; línea base623/623 y entrega **629/629**, seis pruebas nuevas. Se actualizan las expectativas antiguas de borde fijo y partición rectangular a puntas libres y cobertura triangular; no se retiran casos. La perceptibilidad verifica puntas de árboles≥6px fuente y arbustos≥2px bajo ráfaga, con raíces/faja fija en0.
- `npm run check:build`, siete builds/checks de prototipos y oráculo57872ee: **40/40** configuraciones equivalentes. Host de producto idéntico a H3.4.4: `e4962a6b898582e84d90d1ab9074ee3182db4582e037b7652f3d25c831b38a9c`.
- Acciones reales **3 tamaños**1365×768/1920×1080/852×393: movimiento, búsqueda, ataque/exposición y construcción, cancelación, ejecución única y cámara estable. Bordes/recuperación **13 casos** y movimiento **5 recorridos**, incluyendo decisiones/muerte.
- Cámara **9 combinaciones**1365/393/320×apagado/Suave/Tormenta, sin fichas adelantadas al cuadro del mapa; reposo sin escrituras innecesarias.
- Escena **6 tamaños**1365×768,1920×1080,852×393,740×360,393×852 y320×640:42 consultas de localidad, pan/pinza/teclado, capacidad sintética36+36, reinicios sin acumulación, pausa controlada y movimiento reducido.
- Confort **3 tamaños** solicitados:21 focos, catorce ciclos de ficha en escritorio más vista general, anchos/zoom/restauración, muestras de resize sin franja ni estiramiento, estilos de casillas, Escape/foco, muestreo, alfa de máscaras y topología. Sin errores de consola normales ni mutaciones de estado/RNG.
- La regresión temporal anterior de luces/tormenta y el nuevo video de varias ráfagas se conservan en el índice de evidencia. Los resultados temporales y el coste medido se detallan abajo; CI del nuevo head exacto en PR25.

[Índice de evidencia](evidencias/mapa-natural-confort/README.md): capturas comparables antes/después, siete localidades por tamaño, rojos conservados, JSON, video breve y medición controlada. Las pruebas automáticas no sustituyen la aceptación visual del creador.

Medición controlada secuencial, base64bbe2c frente a candidata: canvas **1055×563/DPR1**, misma partida y cámara/zoom;500ms de calentamiento y dos muestras de1500ms por perfil. Renders POST_RENDER divididos por tiempo real, con CDP TaskDuration/heap. No se compara el ancho nuevo con el anterior como si fuera una optimización del renderer.

|Perfil|Antes, renders/s|Después, renders/s|
|---|---:|---:|
|Apagado|0,00|0,00|
|Suave|14,44|10,64|
|Tormenta|13,65|10,98|

Esta ejecución registra aproximadamente26%/20% menos cuadros en software. Es un coste medido y una reserva de la entrega, no una mejora de fluidez. Son muestras cortas en entorno compartido, sin intervalo estadístico; una exploración previa también mostró coste, con magnitud distinta. La geometría pasa de256 vértices/216 triángulos a **522/416**, conservando nueve meshes de vegetación y el pool132. No se añadió otro bucle. Con apagado total vuelve al render bajo demanda.

Las superficies auxiliares RGBA contabilizadas pasan de6344200 a **5790524 bytes** por las máscaras más ajustadas:≈8,7% menos. Es memoria lógica de superficies fuente/POT, sin sus mipmaps, no VRAM ni memoria total del proceso. Los originales y su preparación mipmap no cambian. La memoria JS se registra como rangos de muestras, sin atribuir diferencias de GC a una reducción garantizada.

El nuevo recorrido temporal mide **22,059s visuales/146 muestras**, varias ráfagas, raíces/franja fija en0, pan/zoom y cuatro cambios de ficha sin recrear la escena. Apagado posterior:0 renders ociosos; estado/RNG intactos. Se conserva además la regresión anterior de140 muestras de luces/tormenta. El video breve tiene cortes identificados, a velocidad normal; el completo permanece en el artifact. La suavidad final y el coste en hardware real requieren revisión del creador.

Linux, AMD EPYC9V74, Node24.19.0, Chromium154.0.8037.57, Playwright1.57 externo, ANGLE/Vulkan/SwiftShader por software. Escritorio DPR1 y móvil horizontal DPR2/tacto emulado. No prueba física móvil, VRAM medida ni garantía30/60FPS. La comprobación de visibilidad sigue siendo controlada; no se certifica nuevamente bfcache.

## Reproducir, revisar y revertir

[Guía Windows/VSCode/LAN](../prototypes/horizontal-map/README.md). En la rama actualizada, detener servidor previo con Ctrl+C, ejecutar `npm.cmd ci` y **`npm.cmd run dev:horizontal-map`**. Abrir **http://127.0.0.1:8779/prototypes/horizontal-map/** y recargar con Ctrl+Shift+R. Node22+; sin Python. Preparar V9.9 y pulsar Ver mapa.

Revisar las siete localidades y la vista general; cerrar/reabrir Ficha varias veces; observar Viento/Tormenta durante al menos30s y luego desactivarlo; probar pan/zoom con copas libres; comparar Suave y apagar todo. Seleccionar personajes, cancelar y ejecutar movimiento/búsqueda/ataque/barricada, según legalidad real. En móvil horizontal revisar el espacio recuperado y los44px; en vertical recorrer el mapa con pan.

El commit entregado, SHA del CI, run, artifact y su comprobación se registran en PR25 después de publicar el head, evitando un SHA circular en este documento. El CI verde de64bbe2c es evidencia anterior, no de esta entrega. La reversión es `git revert <commit-de-esta-entrega-en-PR25>`; conserva historia, main y referencias publicadas.

**Única siguiente tarea: revisión visual del creador de estos seis ajustes en PR25 draft.** Sin merge, cierre de etapa ni nuevas acciones.
