# 79 — H3.3: localidades seleccionables, capacidades e interfaz

**Continuación:** [pasada visual80](80-h3-3-ambientacion-visual.md), con efectos opcionales y sin corregir capacidades exteriores. Este informe conserva la evidencia de `c61be77`.

03/11/2026, America/Montevideo. [PR19 draft](https://github.com/LeviEdition/invierno-en-la-colonia/pull/19), rama `experiment/h3-3-taller-visual`. **Pendiente de aprobación visual del creador**, sin H3.4, merge o conexión al motor. Continúa la maqueta del [informe78](78-h3-3-maqueta-mapa-interactivo.md), que conserva la evidencia anterior.

## Encargo y base comprobada

Se leyó el encargo adjunto completo. HEAD local y remoto eran `0b5a05cfd487e8130f47d38947a1f42ca736b8cf`, PR19 OPEN/draft hacia `experiment/h3-2-phaser-hospital`, sin commits posteriores que sobrescribir. Única modificación local: dos pruebas iniciadas antes de la pausa solicitada, sin código ni commits subidos. Se adaptaron al nuevo encargo: **capacidad máxima**, no ocupación inicial. No se descarta trabajo útil ni se retrocede la rama.

Sin AGENTS.md aplicable. Revisados README, protocolo15, tablero,74–78 y archivos del taller. Referencias conservadas: main `826199d96645b95869509995772c914290d63ac7`, PR18 `4fc7c66c1af1d053458519b5c6367a8b9224e8a0`, PR16 `ba1d93a4ae73a91a6f07660584e2374b53043a67`, tag anotado sobre `62e4e85150b2416ccf07d671c186b5c421993b0b`. Se conservan arte original, V9.9, SP-03, dependencias y lockfile.

## Capacidades visuales independientes

| Localidad | Supervivientes máximos | Espacios exteriores compartidos |
| --- | ---: | ---: |
| Gasolinera |2|4|
| Biblioteca |3|4|
| Hospital |4|4|
| Escuela |4|4|
| Comisaría |4|4|
| Supermercado |4|4|
| Colonia |12|12|
| **Total** |**33**|**36**|

`mockup/scene.json` declara **`survivorCapacity` y `exteriorCapacity` por separado**, además de posiciones, encuadres y polígonos de selección. Validar una lista de retratos ya no determina la longitud de los accesos. En gasolinera se centra un par y en biblioteca un trío, redistribuidos respecto de las cuatro posiciones anteriores, sin huecos ficticios.

La composición predeterminada sigue teniendo12 supervivientes en total: hospital4, colonia3 y una ficha en cada otra localidad. Por ejemplo, su ficha de gasolinera muestra **1/2** y biblioteca **1/3**. El caso máximo tiene33 supervivientes,18 zombis y18 barricadas en36 espacios; colonia conserva12. El hospital inicial conserva4 retratos y2Z/2B. Ninguno de estos datos cambia reglas o preparación de la V9.9.

## Selección y detalle de localidades

Los siete edificios tienen `selectionPolygon` configurado y ajustado a su silueta en el mapa actual. No se usan los amplios rectángulos de diagnóstico como zonas de clic; se evitan calles, terrenos vacíos y edificios vecinos. Son polígonos de presentación aproximados al arte, **no colisiones, distancias ni navegación**. Requerirán revisión si cambia la composición.

Un clic/tap aplica, en orden: **retrato circular → edificio → limpiar selección**. El arrastre conserva el umbral de entrada existente y no selecciona al soltar. Un contorno ámbar fino identifica la localidad, y el panel lateral/inferior alterna título/contenido entre Localidad y Superviviente. Se cierra con×. No hay listeners por cada ocupante: la lista HTML usa delegación y se libera con el resto de la instancia.

La ficha deriva del fixture actual: nombre, ambientación breve marcada **provisional**, supervivientes presentes/capacidad, retratos que abren su expediente, zombis, barricadas, vacíos y capacidad exterior total. Cambiar composición actualiza los valores. No inventa inventarios, probabilidades, bonificaciones, habilidades ni reglas.

Seleccionar sobre el mapa o usar **Consultar localidad** conserva la cámara cuando el viewport no cambia. Abrir/cerrar el panel puede cambiar el tamaño del viewport: se conserva el centro del mundo y el zoom absoluto hasta los límites de cámara, sin un centrado automático sobre el edificio. El selector superior indica **seleccionar y centrar** y sí encuadra la localidad por decisión explícita del usuario. Consultar localidad y superviviente están también en los controles HTML secundarios, utilizables con teclado.

## Reproducción de la revisión independiente y correcciones

Referencia de esa revisión: Chromium153,1365×768/393×852/320×640 y499 pruebas. Nuevo diagnóstico local sobre el mismo commit: **Chromium154.0.8037.57**, Linux, fuentes disponibles del entorno, sin afirmar ejecución de153/Windows. [Mediciones iniciales](evidencias/h33-localidades/antes.json).

| Observación | Reproducción local inicial | Ajuste y criterio |
| --- | --- | --- |
| Acciones parcialmente fuera en escritorio768 |**Confirmada**: primera fila termina en790,5px y segunda en845,5px |Expediente compacto, retrato80px, atributos en fila, detalles/ensayos secundarios; acciones completas sin scroll inicial |
| Restablecer recortado≈20px a320 |**No reproducido en carga inicial154**: borde derecho316px |Barra con columnas explícitas y selector flexible; comprobar cada control dentro del viewport y sus ancestros que recortan, también tras resize/selección |
| Arnés detenido por tamaño de Objetivo móvil |**No reproducido en carga inicial154**:61×44px en ambos móviles |Mínimo44 estricto conservado; misión sin encogimiento, alto44 y comprobación de dimensiones/contención. No atribuir una causa sin evidencia de153 |
| Nombres largos partidos |Estilo previo `overflow-wrap:anywhere`, ancho reducido por retrato grande; defecto visible en capturas78 |Nombre largo a20px, retrato más pequeño y reparto ancho; comprobar cada palabra con Range, sin fragmentos en distintas líneas |
| Exceso de avisos/controles |Visible en la composición anterior |Una marca Maqueta global; información repetida reducida; composición y diagnóstico secundarios |
| Espacios poco contrastados |Inspección sobre nieve en capturas iniciales |Trazo central oscuro1,2px y halo claro2,4px CSS, misma elipse/perspectiva; juicio visual pendiente |

No se declara retrospectivamente reproducido el fallo de Objetivo153 ni el recorte inicial de Restablecer en ese navegador. Se refuerza la estructura y se comprueba el resultado en los navegadores realmente ejecutados. No se baja el mínimo para lograr verde. La contención permite solo1px por redondeo en bordes; el tamaño mínimo sigue siendo44×44 sin rebaja.

Dados representados con puntos en una cuadrícula3×3; `aria-label` conserva valor, índice y grupo/turno, y `aria-pressed` señala selección. Sus valores siguen siendo2/3/5/6 y pertenecen al grupo A al seleccionar una ficha B. Las acciones tienen iconos SVG lineales y texto, sin emojis, archivos de arte o dependencias nuevas. Mantienen feedback de demostración sin mutar el fixture.

En móvil el expediente mantiene scroll interno y cierre, con texto local compacto para aprovechar su altura. No se fuerza todo el contenido de colonia12 en una sola pantalla: se puede recorrer la ficha. La vista general conserva mapa y proporciones, sin estirar ni recortar localidades.

## Implementación y revisión crítica

- `scene.json`: capacidades, posiciones centradas, siete polígonos y descripciones provisionales.
- `model.mjs`: validación independiente, selección poligonal y detalle puro derivado del fixture, sin mutación.
- `main.mjs`/`index.html`: selección alternable, lista de ocupantes, cámara sin recentrado implícito, puntos de dados y SVG de acciones.
- `style.css`: barra acotada, controles44px, expediente compacto, nombres completos y avisos reducidos.
- `renderer.mjs`: parámetro opcional de contorno de localidad y contraste de los espacios de la maqueta. Los modos técnicos sin ese parámetro conservan su presentación anterior; no se modifica el adaptador Phaser ni los prototipos de referencia.
- Pruebas Node y gate Chromium extendidos; helper de QA verifica controles completos y palabras, sin importar el motor.

Revisión posterior: separación efectiva de capacidades; selección de retrato antes de polígono; no cambio de fixture al seleccionar o accionar; datos de localidad recalculados tras cambiar composición; listeners de ocupantes delegados; límites de cámara/DPR comunes para dibujo y selección. No se incorporan reglas ni una segunda simulación. Los arneses se ajustaron también al texto abreviado de grupo y al nuevo total33 de personajes, conservando explícitamente36 IDs de accesos. Esto no sustituye una revisión humana independiente.

## Validación y evidencia

Local: Node24.19.0, Playwright1.57.0 externo, Chromium154 headless/SwiftShader software. No teléfono físico, GPU/VRAM real ni certificación de153/Windows. Pruebas nuevas primero [en rojo](evidencias/h33-localidades/modelo-rojo.log) y después verdes. Las dos pruebas pausadas se ajustaron a la autorización antes de implementar.

- **501/501 Node**,0 fallos/omitidas; conserva las499 anteriores y añade dos casos de capacidades/selección y detalle. [Log final](evidencias/h33-localidades/npm-test.log).
- `npm run check:build`, builds/checks de hospital y taller: reproducibles. Mismo Phaser4.2.1/esbuild0.28.2 y siete PNG, sin dependencia nueva.
- Gate de la maqueta en1365×768/DPR1,393×852/DPR2 y320×640/DPR2: siete edificios por clic/tap y HTML/teclado, prioridad de retratos, calles sin selección, drag sin selección, alternancia de ficha, cámara estable, máximos2/3/4/12=33,36 accesos independientes, gasolinera/biblioteca completas y colonia12.
- Tamaños/contención de controles, Objetivo y Restablecer enteros, acciones visibles inicialmente en escritorio, palabras sin cortes, dados por puntos/etiquetas, iconos y feedback sin consumir, pan/rueda/pinza/arrastre emulados, resize, errores normales0.
- Se conservan las comprobaciones anteriores de reinicios, limpieza de contextos/listeners, pérdida/restauración de contexto, fallos de recursos, cancelación y navegación bfcache. La reserva de secuencia tap después de drag CDP registrada en78 sigue separada de una prueba física.

Los seis JSON finales locales (Canvas, H3.2, técnico, kit técnico, maqueta, texturas) se conservan en [evidencias](evidencias/h33-localidades/). El resultado y el artifact CI sobre el **head exacto** se registran en la [descripción actualizada del PR19](https://github.com/LeviEdition/invierno-en-la-colonia/pull/19), diferenciados de los JSON locales, sin autorreferencia circular al SHA de este documento.

Se inspeccionan visualmente las nuevas capturas nativas, no solo sus aserciones: [general escritorio](evidencias/h33-localidades/1365-general.png), [hospital seleccionado](evidencias/h33-localidades/1365-localidad-hospital.png), [gasolinera2/2](evidencias/h33-localidades/1365-gasolinera-completa.png), [biblioteca3/3](evidencias/h33-localidades/1365-biblioteca-completa.png), [colonia12](evidencias/h33-localidades/393-colonia12.png) y [hospital móvil320](evidencias/h33-localidades/320-localidad-hospital.png). [Antes escritorio](evidencias/h33-localidades/1365-antes.png) y [metadatos](evidencias/h33-localidades/capturas.json). DPR2 móvil no es una ampliación posterior ni un teléfono físico.

## Probar desde Windows/VS Code

Carpeta con `package.json` y `package-lock.json`, conservar cambios propios. Terminal PowerShell:

```powershell
git fetch origin
git switch experiment/h3-3-taller-visual
git pull --ff-only
npm.cmd ci
npm.cmd run dev:workshop
```

Abrir **http://127.0.0.1:8772/prototypes/hospital-workshop/** y dejar la terminal abierta. Clic en edificio/retrato; el selector superior selecciona y centra. En el panel, **Composición y selección por teclado** permite consultar sin mover la cámara o elegir el máximo. Elegir máximo y centrar gasolinera/biblioteca/colonia para comparar2/3/12. Las acciones y los dados solo responden como maqueta. [Guía de uso](../prototypes/hospital-workshop/README.md).

Taller técnico separado: `/prototypes/hospital-workshop/tecnico.html`, kit `tecnico.html?kit=uploaded`; Canvas `/prototypes/hospital/`, H3.2 `/prototypes/hospital-phaser/`, mismo servidor. No Python ni doble clic/file://. Live Server requiere antes build:hospital y build:workshop.

Teléfono en la misma Wi-Fi: `npm.cmd run dev:workshop -- --host 0.0.0.0`, `ipconfig`, abrir `http://IP_DE_LA_PC:8772/prototypes/hospital-workshop/`; permitir Node en red privada si Windows lo solicita. Son instrucciones, **no prueba realizada en tu red o dispositivo**.

## Dirección posterior y reservas

**Registrar para después:** explorar una distribución más horizontal del mapa en una revisión de composición artística. Esta entrega conserva1448×1086, todos los edificios y sus proporciones, sin regenerar arte. Posiciones/encuadres/polígonos quedan configurables para redistribuirlos cuando se apruebe ese trabajo. No inicia H3.4 ni autoriza arte definitivo.

Persisten el detalle limitado del mapa al ampliar, edificios integrados en una imagen, pivotes/proporciones provisionales, repetición de cuatro retratos y texturas estimadas≈58,67MiB más auxiliares (no VRAM medida). Esta revisión no agrega texturas WebGL ni cambia los PNG. Bundle principal1.444.017 bytes/gzip9 388.898, SHA-256 `20fc34f3685f05d48312dd152a5611e573dd05564560fbbfea7af7be8a848ba8`; técnico `54d51277e8c2ac653a2a430442afb57d754601de0956bb1d671b5e0b467dc4bb`. H3.2 conserva `7e7b90ab465bc4b7113ffb20c4c0780a9c0e9d0db1d0cfab83659b46632f5e54`. [Build](evidencias/h33-localidades/build.json). La densidad/contraste y el encaje final requieren juicio del creador; emulación no demuestra rendimiento o accesibilidad física.

**Única siguiente tarea:** revisión visual del creador de esta entrega. Mantener PR19 en borrador, main y referencia intactos, sin merge y sin motor/H3.4.
