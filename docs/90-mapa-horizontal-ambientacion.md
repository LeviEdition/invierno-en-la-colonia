# 90 — Escenario horizontal y ambientación sobre H3.4.4

> Historia de la primera entrega hasta8113b557. La solicitud posterior de copas, accesos exteriores, marcos y titileos se registra en [informe91](91-ajustes-visuales-mapa-horizontal.md), que actualiza esos apartados. La fila dentro del patio y la variación lenta descritas aquí ya no son la presentación vigente.

05/11/2026, America/Montevideo. Entrega experimental **para revisión del creador**, no aprobación de arte ni aceptación manual de H3.4.3/H3.4.4. PR25 draft contra `experiment/h3-4-4-ataque-barricadas-mapa`, rama `experiment/mapa-horizontal-ambientacion-h3`. Sin merge, cambios en main/tag/release, reglas/capacidades/IA/balance/narrativa/guardados o editor de encrucijadas.

## Base y originales

Base funcional **694b64504ca39bb00627fb4cf9964b9521ec211f**, PR24 abierto/draft con CI42021660345 success. La preparación documental89/bb8a6a7 detectó ausencia de binarios; el creador la resolvió con **4f05c8f349c1973e0b786cf37d562a5685e6fca9**. Se sincronizó por avance rápido desde árbol limpio, sin sobrescribir su subida. Implementación **5b3a661e9c2233854134cd2b35f094bb686d08aa**; documentación/evidencia posterior se distingue del commit de implementación. El head final/run/artifact se registran en la descripción del PR25 para evitar un SHA circular del propio informe.

No hay AGENTS.md aplicable. Se leyeron encargo adjunto, README, tablero18, protocolo15, informes88/89 y módulos implicados. Main remota observada826199d96645b95869509995772c914290d63ac7; referencia publicada62e4e85150b2416ccf07d671c186b5c421993b0b. Se preservaron.

Los originales se conservan con sus nombres en `assets/mapa-horizontal/`; todos1672×941:

| Archivo | Modo/bytes | SHA-256 |
| --- | --- | --- |
| Mapa nevado sin vegetación-1.png |RGB/2300098|20dfb9774e2044fbd68919a13d73ceb7f8836ec90a20edadc857aba19ad44fba|
| Árboles y arbustos nevados aislados-2.png |RGBA/1951656; alfa0–255|e0423d46d734d07b225e70bbeec84ec3bb06e9d547b179623ab77273de9a4daf|
| Patio nevado con portón colonial.png |RGB/2576151|9210918870edf44e9088a9c2a057c21c13f0103cbf3fd3c632ed68e47b1c6f4c|

Manifiesto verificable con commit/procedencia, dimensiones/modos/hashes. No conversión de negro en alfa, originales reescritos, nuevas imágenes generadas ni aumento artificial de resolución. El producto carga fondo+vegetación y recursos previos; la referencia completa se abre expresamente para comparar, evitando su descarga adicional al iniciar.

## Encaje: comprobado, corregido y reservado

Tener el mismo tamaño **no hizo equivalentes las capas**. La composición directa de fondo+alfa difiere de la referencia completa: diferencia RGB absoluta media≈9,59 sobre255; este número no prueba calidad o equivalencia geométrica. La inspección mostró vegetación sobre fachadas. La componente alfa>0 más grande ocupa el rectángulo completo por conexiones de baja opacidad; no equivale a un único árbol ni permite separar automáticamente cada tronco por islas.

Se restituyen los **siete polígonos de edificios desde el mismo fondo**, en las mismas coordenadas, encima de la vegetación. Son recortes con máscara construidos en memoria; no se redibuja el edificio ni se mueven fachadas, cercos o postes. Se anima solo la vegetación identificada; la distribución aprobada permanece como referencia y no se regenera el mapa.

Persisten diferencias de silueta/color entre la separación generativa y la imagen completa, incluido borde tenue en parte de la vegetación. Requieren revisión visual y, si se exige coincidencia exacta, recortes/máscaras locales corregidos a partir de originales coherentes. Más nieve no es la solución ni se presenta la recomposición como producción final. Cables sin extremos/capa inequívocos y vegetación restante se mantienen estáticos.

## Escena y cámara

Entrada **`/prototypes/horizontal-map/`**; se conserva `/prototypes/action-map/` y todo experimento previo. `scene.json` es presentación: siete IDs existentes, colonia central; hospital/escuela al oeste, biblioteca al noreste, supermercado al este, gasolinera al suroeste y comisaría al sureste. Casas, galpones, torre de agua, parada y vías no se convierten en localidades.

Polígonos de selección, apoyos de fichas, accesos y llegadas se actualizan juntos. Se muestran **36 apoyos y36 accesos**,12/12 en colonia y4/4 por exterior, de acuerdo con las capacidades **actuales** del motor. Los máximos anteriores2/3 de la maqueta no se convierten en reglas: aquí se representan las cuatro plazas reales, sin cambiar `capacity` o `zcap`. Cada acceso sigue compartido entre un zombi o una barricada. La fila de colonia usa terreno del patio, evitando colocar barricadas encima del cerco; no añade una distancia, capacidad o navegación nueva.

Mínimo de cámara por **cobertura** del viewport y desplazamiento limitado: no se revela vacío fuera del PNG. Centrado de localidad considera su posición respecto a los bordes y limita el zoom antes de calcular el desplazamiento. Una prueba roja reprodujo desplazamientos incorrectos al calcular con un zoom sin limitar; se corrigió antes de entregar. Escritorio reserva el dossier lateral; en móvil el comando de centrar pliega la ficha superpuesta, que puede reabrirse. El usuario conserva pan/rueda/pinza/teclado/restablecer, sin rotación/cámara automática durante acciones.

Máximo normal **1,5 CSS por píxel fuente**; el mínimo de cobertura prevalece si una ventana excepcionalmente grande lo requiere. El porcentaje de UI es relativo al encuadre inicial. Nitidez nativa aproximada hasta1 CSS/píxel a DPR1; a DPR2 hace falta el doble de muestras físicas. Ampliar no recupera detalle. Puertas, ventanas, vegetación y superficies pequeñas necesitan fuentes mayores si se requieren primeros planos nítidos. Se permite ampliar para leer fichas/controles, con esa reserva explícita, sin fabricar detalle. La revisión detectó accesos recortados al forzar el centro exacto en horizontal: se prioriza encuadrar el sector completo y se aplica el centrado más cercano permitido por los bordes. Rojo→verde de los36 accesos; ajuste4f821d65983fd1ce4fb2883e178c66c46ce868d4.

## Vegetación, nieve, humo y luces

Ocho grupos definidos en `environment.json`: árbol oeste, arbusto al sur del hospital, arbusto central sur, árbol este, arbusto sur este, pino del borde este, grupo suroeste y arbusto sur oeste. Cada uno tiene región, base, amplitud y fase editables. Se comparten las muestras originales de la textura, **sin duplicar la capa ni trasladarla como bloque**. Mesh2D es la API pública2D de Phaser4.2.1: deforma principalmente la parte alta; bases y bordes quedan fijos. No hay modelos3D, rotación ni shader/motor nuevo.

La geometría estática se resta de los rectángulos animados y se particiona sin huecos/solapamientos; los bordes de las regiones no se mueven. Una prueba de área y no intersección cubre la partición. Primera versión:4032 vértices/alta subdivisión; el coste en software justificó reducir a geometría estática simple y subdividir únicamente los grupos. Se conservó evidencia del primer montaje y se repitió la medición; el tamaño de PNG no cambió.

Se usa el reloj/viento del modelo de tormenta existente; una consulta visual pequeña evita copiar todo el pool cada cuadro. Nieve/humo/grupos responden a las mismas ráfagas, con perfiles Suave/Tormenta y fases propias. Pool fijo **132 partículas**:112 nieve,12 humo y8 estelas. Los objetos se reutilizan; no hay bucle de juego nuevo ni RNG del motor. Las estelas se limitan a tres zonas configuradas de terreno/calle. Humo únicamente en la boca de la chimenea de ladrillo de colonia **949,306**; no se inventa una salida en el hospital.

Tres luces: colonia oeste, colonia este y entrada del hospital, con polígonos de fuente y manchas dirigidas sobre superficies/terreno. Los derivados neutralizan el color/brillo cálido fijo en la región correspondiente y restituyen la luz mediante una única intensidad lenta e irregular para fuente y mancha. No se ilumina uniformemente todo el mapa; biblioteca y otras luces del arte quedan estáticas.

La inspección propia corrigió también una atenuación azul de borde duro: las máscaras neutralizan solo zonas cálidas, conservan suelo frío y suavizan los bordes. Los polígonos finales se ajustaron a ventanas/reflejos cálidos medidos en el PNG, sin dejar la franja superior fuera. Se conservó captura roja. La revisión detectó que el primer apagado retiraba la mancha pero dejaba la fuente restaurada al100%; el JSON rojo conserva fuente1/mancha0. Se corrigió a **fuente0/mancha0**, y se comprueba igualdad de ambos canales también al apagar, no solo durante el titileo. Pausar mantiene el mismo cuadro; al reanudar no acumula ráfagas. Movimiento reducido empieza sin animaciones; sonido opcional apagado. Al apagar todo se conserva renderizado bajo demanda, sin render continuo en reposo. Ningún elemento ambiental recibe entrada táctil/ratón.

## Autoridad y mantenimiento

No cambió ningún archivo `src/` ni la lógica de acciones. Se reutilizan host V9.9, MessageChannel, brokers, consultas/validadores, controladores, deduplicación y exposición de H3.4.4. El host nuevo y el anterior tienen **el mismo SHA-256 de build**, comprobado también contra el artifact CI de694b645: `e4962a6b898582e84d90d1ab9074ee3182db4582e037b7652f3d25c831b38a9c`; el visor no importa motor. No se alteran RNG, tiempos1500ms de movimiento, consumos o decisiones; las pendientes siguen esperando el botón explícito Continuar en V9.9.

El build existente recibe una de dos variantes explícitas e intercambia solo la configuración de presentación. No se añadió bundler/framework/dependencia. La selección de configuración normaliza separadores Windows/POSIX; una prueba lógica de rutas lo respalda, sin afirmar una ejecución física en Windows. Los defaults anteriores se conservan: configuración H3.4.4 propia, tamaños de contornos opcionales por zona, soporte de dimensiones positivas en la tormenta, consulta de reloj visual y plegado al centrar solo cuando lo solicita la escena nueva. Los arneses permiten seleccionar el bundle de la variante para repetir **las mismas pruebas de acciones**.

La página/biblioteca de capacidad máxima es **solo QA**, usa la misma vista con una proyección sintética y no ejecuta comandos.36 fichas+18 zombis+18 barricadas no son una nueva preparación de partida. No se sirve por LAN/producto ni se publica como motor paralelo.

## Revisión de interacción en horizontal

El primer gate de movimiento conservaba el punto280,475 del hospital anterior: ahora está fuera de su polígono y la aserción de confirmación falló. El arnés admite un punto/viewport explícitos para cada escenario; las aserciones de duración, fases, RNG, cámara y una ficha se mantienen.

Después de adaptar el punto, el toque852×393 reprodujo un defecto de presentación: el planificador lateral interceptaba el hospital y la ficha seguía abierta por un umbral anterior de800px. Se corrigió **solo mediante opciones/estilo de la variante nueva**: planificador central compacto con scroll y ficha plegada al preparar movimiento hasta950px. No se cambia el viewport durante el gesto ni se hace pan automático. La misma prueba de toque sobre la silueta y de cámara/rectángulo estable se repite como regresión. Ajuste **83bcab0075169e231e0d355e0cd2b19914aebe43**, grabación reproducible5638bbbc5e2813e0cd86b5bbfef5d8431bc841a7.

## Verificación y evidencia

Línea base propia: instalación reproducible, check:build y **605/605** antes de cambiar código. El primer `npm ci` falló al usar la caché del home no disponible; se corrigió con caché en `/tmp/iec-npm-cache`, sin tocar lockfile ni versiones. Primera grabación no encontró FFmpeg en el home: se usó el directorio externo Playwright ya instalado; no fue un fallo del producto.

Entrega local: **618/618**,13 nuevas; oráculo57872ee **40/40**, suite histórica451 y candidata618; siete builds/checks y cinco variantes QA. Los nuevos tests cubren cámara/centrado/cobertura, capacidades/apoyos, bases vegetales, luz acotada, partición sin huecos, originales/hashes/alfa, separación de motor/host y rutas/QA.

Chromium154.0.8037.57, Node24.19.0, Playwright1.57 externo, Linux/headless, ANGLE/SwiftShader/Vulkan/software.1365×768/DPR1,852×393 y740×360/DPR2/tacto **emulado**. Se prueban siete localidades, selección, cámara/teclado/pinza,36+36 máximos sintéticos, fuente/mancha sincronizadas, pausa controlada, dos reinicios por tamaño sin acumulación de instancias/listeners/GL y movimiento reducido. No se afirma teléfono físico, VRAM medida,60FPS o nueva certificación de bfcache real.

Se conservan reproducciones del arnés: reloj capturado antes del evento de pausa permitía un último cuadro; la referencia se toma ahora al aplicar la pausa. Comparar igualdad exacta de shaders tras reconstruir confundía compilación perezosa con fuga: hubo **menos**, no más, recursos. Se compara contra el máximo calentado, errores de limpieza, texturas liberadas y un solo contexto. No se presentan como defectos confirmados del motor.

Resultados finales de navegador, medición, capturas y video se registran en [evidencias](evidencias/mapa-horizontal/README.md). El workflow repite regresiones H3.4.4, las mismas cuatro baterías sobre el mapa nuevo y la comprobación de escena, de forma secuencial; suite/oráculo/siete builds. **CI del head exacto y artifact descargado se verifican y registran en la descripción del PR25**, sin sustituirlos por el verde de la base. Una prueba en software no sustituye la aceptación visual del creador.

### Coste medido localmente

|Viewport|Apagado, renders/s|Suave|Tormenta|
|---|---:|---:|---:|
|1365×768|0.0|14.5|12.3|
|852×393|0.0|12.2|13.9|
|740×360|0.0|15.4|14.7|

Estas muestras cortas, secuenciales y con video separado usan el mismo estado/cámara/DPR por perfil. En SwiftShader/software **no se sostiene30FPS**; no se declara rendimiento móvil aprobado. Apagado mantiene0 renders continuos en reposo. La geometría final es256 vértices/216 triángulos y las texturas principales con mipmaps≈58,67MiB **estimados**, más derivados/auxiliares. No VRAM medida. Datos, TaskDuration/heap, entorno, límites y diagnóstico inicial en la evidencia. La confirmación de fluidez en GPU/teléfono reales queda pendiente de revisión; se conservan perfiles/apagado y no se aumenta el pool para disimularlo.

## Probar y continuar

**`npm.cmd ci` → `npm.cmd run dev:horizontal-map` → http://127.0.0.1:8779/prototypes/horizontal-map/**. Detener servidor previo con Ctrl+C y reiniciar/recargar tras actualizar. [Guía exacta Windows/VSCode/LAN y lista manual](../prototypes/horizontal-map/README.md). El mapa anterior permanece en el mismo servidor bajo `/prototypes/action-map/`.

**Única siguiente tarea:** revisión visual/manual del creador del escenario y de movimiento/búsqueda/ataque/barricadas. Quedan reservas de encaje y detalle del arte, rendimiento en GPU/dispositivo físico y capacidades/rediseños previamente aplazados; no se convierten en cambios de reglas. Sin merge, cierre de etapa o implementación de otras mecánicas.
