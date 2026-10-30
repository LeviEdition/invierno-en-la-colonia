# 73 — Prueba visual aislada 2.5D: hospital

**29/10/2026, Montevideo. Prototipo implementado y validado localmente y en CI; entregado para revisión en PR16, sin fusión.** La escena no se conecta con reglas, estado, IA, guardados ni narrativa del juego. Los registros de bloqueos anteriores se conservan al final como historia superada.

## Estado y alcance

Rama `prototype/hospital-2-5d`, creada desde main `826199d96645b95869509995772c914290d63ac7`. El creador subió los tres originales en `ed3578f31d27fbdb1e09184de0073e911765b1e1`; se sincronizó por fast-forward, sin reescribir ni descartar su trabajo. Se revisaron README, tablero18, protocolo15 e informe72; no se encontró AGENTS.md aplicable.

La referencia permanece en el tag anotado `v0.9.9-referencia-modular`, commit `62e4e85150b2416ccf07d671c186b5c421993b0b`. HTML de producto SHA-256 `43b8883ad4821e4b50c40791615c5ef6c0b3030476409b4e1c6da4dbd872d692`, sin cambios. Main y SP-03 intactos; no se modifican módulos, plantilla, dependencias o pruebas anteriores de V9.9.

## Abrir en la web, sin instalar herramientas

**[Vista previa del hospital](https://raw.githack.com/LeviEdition/invierno-en-la-colonia/901a21ea23311dc0860c4e5363836e352ae29d66/prototypes/hospital/index.html)**, servida por RawGitHack desde los archivos públicos del commit `901a21ea23311dc0860c4e5363836e352ae29d66`. Basta abrir el enlace en el navegador; no requiere iniciar un servidor en el dispositivo. Es una vista de revisión del PR mediante un servicio de terceros y queda fijada a ese commit; actualizar el código del prototipo requiere actualizar también la URL para mostrar otra versión.

### Diagnóstico del rechazo de conexión

El creador informó rechazo de conexión al abrir127.0.0.1 desde su PC y confirmó que no tiene Python instalado. Esa dirección apunta al propio equipo donde se abre el navegador: requiere que el comando del servidor haya arrancado allí y permanezca abierto. El servidor del entorno de desarrollo respondió HTTP200, pero eso no inicia un servidor en el PC del creador.

Se comprobó por HTTPS la entrega de los diez archivos de la vista web: HTML, CSS, cinco módulos y tres PNG, todos HTTP200, tipos MIME adecuados y bytes idénticos al checkout validado. [Evidencia de acceso](evidencias/hospital-acceso-web.json). No se publicó una release nueva, cambió main ni modificó el prototipo para resolver el acceso.

La prueba de navegador sobre la URL externa no pudo completarse en el Chromium administrado por `ERR_CERT_AUTHORITY_INVALID` del entorno/proxy; no se desactivó la verificación TLS. Por eso se distinguen **entrega HTTP y hashes comprobados** de **navegación externa pendiente**. La escena sí está validada localmente y en CI sobre los mismos archivos. La apertura del enlace en el navegador del creador queda por confirmar; si aparece una advertencia de certificado, conservarla y revisar el acceso, sin desactivar seguridad.

## Abrir localmente

La entrada usa módulos nativos y Canvas2D, sin dependencias nuevas ni build propio. Se puede servir desde VS Code con Live Server o mediante Python3.

### VS Code y Live Server — acceso confirmado

1. Abrir la raíz completa del repositorio en VS Code y seleccionar `prototype/hospital-2-5d`.
2. Instalar la extensión **Live Server**, de Ritwick Dey.
3. Abrir `prototypes/hospital/index.html`, clic derecho → **Open with Live Server**.
4. Usar la dirección que abre la extensión, normalmente `http://127.0.0.1:5500/prototypes/hospital/index.html`, manteniendo VS Code abierto.

El creador confirmó «listo ya pude acceder» después de estas indicaciones. Se registra acceso local resuelto; la evaluación humana de escala, oclusión y controles sigue pendiente. Esa confirmación no valida por sí sola la alternativa externa RawGitHack ni un teléfono físico. No se cambió código o arte por este registro.

### Servidor Python, como alternativa

Desde un clon nuevo con Git, Python3 y navegador:

```sh
git clone --branch prototype/hospital-2-5d https://github.com/LeviEdition/invierno-en-la-colonia.git
cd invierno-en-la-colonia
python3 -m http.server 8770 --bind 127.0.0.1
```

Abrir **http://127.0.0.1:8770/prototypes/hospital/**. Si ya se tiene el repositorio, usar un checkout limpio y actualizado de `prototype/hospital-2-5d` y ejecutar solo el servidor desde su raíz. El prototipo requiere HTTP para cargar módulos; no se entrega como HTML offline autocontenido. El HTML offline de referencia sigue funcionando por separado y no se reemplaza.

Recorrido manual: probar Delante/Detrás/Esquina; activar y desactivar Mostrar ocultos; tocar el hospital y luego suelo vacío; arrastrar sin seleccionar accidentalmente; ampliar con rueda/pinza o botones; restablecer. Todos los controles HTML aceptan teclado. Sobre el canvas: flechas desplazan la cámara, +/− amplían,0 restablece, Enter selecciona y Escape deselecciona. Las flechas no mueven al zombi.

## Archivos y decisiones

| Archivo | Responsabilidad |
| --- | --- |
| prototypes/hospital/index.html, style.css | Entrada independiente y controles HTML adaptables, con nombres accesibles, foco visible y objetivos de al menos44px |
| prototypes/hospital/scene.mjs | Imágenes, posiciones, escalas, anclajes, encuadre y orden por demostración |
| prototypes/hospital/camera.mjs | Transformaciones, arrastre, zoom anclado, pinza, límites y encuadre/restablecimiento sin DOM |
| prototypes/hospital/renderer.mjs | Carga de PNG, dibujo y selección por alfa; sombra suave separada; una transformación compartida por todas las capas |
| prototypes/hospital/controls.mjs, main.mjs | Gestos, umbral clic/arrastre, teclado y conexión de la escena visual |
| assets/prototipo-hospital/ | Tres originales renombrados sin alterar bytes; README y manifest.json de procedencia/hashes |
| tests/hospital-camera.test.mjs, hospital-assets.test.mjs | Siete pruebas geométricas y tres de integridad del arte; no se debilitaron las pruebas existentes |
| scripts/check-hospital-prototype-browser.mjs | Pruebas de interfaz y píxeles reales en Chromium, capturas y JSON |
| .github/workflows/hospital-prototype.yml | Gate visual del PR, checkout explícito de su head, herramientas externas de prueba y artifacts |

Los originales se conservaron: hospital1254×1254 y zombi1175×1338, ambos RGBA con alfa0–255; suelo1536×1024 RGB opaco. El [manifiesto](../assets/prototipo-hospital/manifest.json) vincula cada nombre claro con el nombre de subida y su hash. Las pruebas de integridad comparan los bytes; el navegador confirma alfa0–255 en ambos recortes y255 en todo el suelo decodificado. No se borraron colores ni se regeneró arte.

Se configura el hospital con escala0.65, el personaje0.095 y el anclaje del pie más bajo `(716,1218)` en su PNG, considerando sus márgenes. La silueta útil del personaje mide aproximadamente104 unidades de alto en la escena, ajustada visualmente respecto de la puerta; no se afirma una escala física definitiva. La sombra es una elipse degradada independiente. Ninguna transformación se aplica por CSS a una capa aislada.

### Profundidad y límites del método

- **Delante:** suelo → sombra → hospital → zombi. El personaje se dibuja completo aunque coincida con la fachada/escalera.
- **Detrás:** suelo → sombra → zombi → hospital. La posición está cubierta por una zona opaca del edificio.
- **Esquina:** el mismo orden de Detrás, con parte de la silueta del personaje fuera del borde izquierdo del PNG del hospital. No se corta manualmente el personaje.
- **Mostrar ocultos:** conserva ese orden y reduce la opacidad del hospital a0.28. Al desactivar vuelve la oclusión normal.

Son tres colocaciones explícitas para probar este sector. **No es una ordenación general por Y, navegación libre ni un sistema de colisiones.** Otros edificios/recorridos necesitarían criterios de oclusión propios; no se implementan aquí. El ángulo permanece fijo, sin rotación.

El zoom varía entre50% y400% del encuadre inicial. Conserva el punto del mundo bajo el cursor o el centro de la pinza, incluyendo el desplazamiento del centro. El arrastre empieza a partir de6px; la pinza cancela cualquier selección pendiente. Restablecer vista recupera cámara/zoom, conservando la demostración elegida y la opción Mostrar ocultos.

## Validación ejecutada

**Node local24.19.0 / npm11.9.0.** Siete pruebas de cámara escritas primero en preparación (rojo por módulo inexistente, luego verde); tres pruebas adicionales de PNG e integridad. `node --test tests/hospital-camera.test.mjs tests/hospital-assets.test.mjs`: **10/10**. `npm run check:build`: aprobado. `npm test`: **477/477**,0 fallos, cancelaciones u omisiones; conserva las467 pruebas de referencia. `git diff --check`: aprobado.

**Chromium local real, automatizado con Playwright:** escritorio1365×768 y móviles emulados393×852 y320×640; DPR1/2. [Evidencia JSON](evidencias/hospital-prototipo.json), que identifica versión de Chromium y hashes de los archivos ejecutados.

| Comprobación | Resultado |
| --- | --- |
| Tres posiciones | Delante100% visible; detrás0% de píxeles reconocibles; esquina aproximadamente56–57% visible respecto de la composición sin oclusión |
| Mostrar ocultos | Revela al personaje detrás; desactivar restaura oclusión normal |
| Selección | Clic y tap seleccionan; transparencia/suelo descartan; arrastrar no selecciona |
| Arrastre y capas | Comparación de píxeles antes/después: acuerdo99.81–100%, tolerancia RGB de4, sin desplazamientos independientes de edificio, personaje o sombras |
| Rueda y zoom | Punto anclado al cursor, límites superior/inferior y botones +/− verificados |
| Táctil emulado | Pinza CDP de dos dedos con escala y centro estables; arrastre posterior de un dedo sin selección accidental |
| Teclado y controles | Posiciones, checkbox, zoom, selección, flechas y restablecimiento; botones/etiqueta táctil de al menos44px |
| Viewports | Sin desplazamiento horizontal ni excepciones JavaScript en los recorridos normales |
| PNG inaccesible, fallo simulado | Aviso visible y todos los controles deshabilitados; no se sustituye la imagen |

La proporción de visibilidad compara el canvas real contra composiciones de referencia sin personaje y sin oclusión, con umbral de diferencia RGB de16 para ignorar residuos mínimos de alfa/interpolación. No se presenta como porcentaje físico exacto de superficie. El script comprueba el dibujo, además de atributos y CSS.

Comandos para repetir Node desde la raíz: `npm ci`, `npm run check:build`, `npm test`. Para repetir el gate de navegador, manteniendo el servidor8770 abierto en otra terminal:

```sh
npm install --no-save --package-lock=false playwright@1.57.0
npx playwright install --with-deps chromium
export CHROMIUM_PATH="$(node --input-type=module -e "import {chromium} from 'playwright';console.log(chromium.executablePath())")"
node scripts/check-hospital-prototype-browser.mjs
```

Playwright es herramienta de pruebas externa al producto, igual que en el CI existente; no se agrega al package.json ni al lockfile. El script guarda JSON y capturas en `/tmp/hospital-browser` (o `HOSPITAL_OUTPUT_DIR`). En este entorno se reutilizó el Playwright instalado, mediante PLAYWRIGHT_MODULE. CI usa Playwright1.57 y su Chromium propio; se consultan los checks por el SHA exacto final del PR antes de entregar, sin insertar aquí el SHA del propio documento.

### CI del código entregado

Commit de implementación **`c9452c7af55959a5373510dc6e9c7c87e308eeb9`**: los cuatro checks terminaron success. [Evidencia resumida y versionada](evidencias/hospital-ci.json).

- [Regresión40962825768](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40962825768): instalación, build y suite completa aprobados.
- [Arquitectura/V9.9,40962825739](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40962825739): engine y browser aprobados, incluyendo comparación con referencias y escenarios/offline del juego preservado.
- [Hospital visual40962825850](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40962825850): checkout explícito del head de implementación,10 pruebas de componente y gate visual aprobados. Artifact `hospital-visual-c9452c7af55959a5373510dc6e9c7c87e308eeb9` descargado e inspeccionado.

ChromiumCI143.0.7499.4 confirmó delante100%, detrás0% reconocible, esquina56–57%, ocultos y todos los controles en los tres viewports, con0 excepciones en los recorridos normales. Arrastre de capas: acuerdo de píxeles99.81–100%; pinza y desplazamiento de un dedo emulados aprobados. Esta ejecución es nueva y distinta de las pruebas locales. No sustituye teléfono real ni otros motores.

El commit posterior de cierre solo registra estos resultados y conserva el código y los PNG de c9452c7; sus propios checks se consultan por SHA antes de entregar, evitando referenciar el SHA del propio documento.

### Capturas para revisión

- [Delante, escritorio](evidencias/hospital-delante.png).
- [Esquina, escritorio](evidencias/hospital-esquina.png).
- [Esquina, móvil emulado393×852](evidencias/hospital-movil-esquina.png).

Las capturas adicionales de detrás y Mostrar ocultos quedan en los artifacts del gate visual.

## Revisión crítica y reservas

Revisión propia del alcance y del código: sin imports del motor; el estado visual es local al prototipo; originales conservados; dibujo y selección usan el alfa real; el orden está declarado por demostración; los gestos y teclado operan sobre la misma cámara; no se llama a funciones del juego. Se comprobó también el fallo de carga para evitar una pantalla vacía con controles aparentemente operativos. No se encargó una revisión a otro agente ni se presenta como independiente.

Dos diagnósticos del arnés local se corrigieron sin debilitar aserciones del juego: el primer smoke esperaba visible el indicador ya oculto y agotó30s; después la prueba de rueda usaba coordenadas fraccionarias mientras Chromium entrega coordenadas enteras. Se corrigieron la espera y el punto de entrada; el recorrido final completo pasó, incluyendo pinza y arrastre táctil.

**Reservas reales:** recursos raster provisionales; el hospital y el suelo pierden nitidez al ampliar por encima de su resolución; el zombi solo tiene una orientación y postura, sin animación. La perspectiva/iluminación no se recalculan en3D, y el suelo finito muestra sus bordes al alejar o desplazar. Hay residuos de alfa1 conservados en los originales, ignorados solo por la selección. En móvil pequeño el personaje es pequeño en el encuadre general; zoom/pinza permiten inspeccionarlo. No se validaron Android físico, TalkBack, otros motores de navegador ni accesibilidad completa; viewport y eventos táctiles emulados no los sustituyen.

**Entrega:** PR16 en borrador para revisión visual. No fusionar ni continuar otras localidades, barricadas, casillas, movimiento libre, reglas, IA, narrativa o singleplayer. **Única siguiente tarea recomendada:** el creador revisa delante/esquina, proporción del personaje y comodidad del encuadre; los ajustes posteriores se acotan a esta escena. SP-03/SP-04 mantienen su planificación separada.


<details>
<summary>Registro histórico de preparación y acceso a materiales (superado)</summary>

### Preparación anterior

**29/10/2026, Montevideo. Estado: cámara matemática implementada y probada; escena bloqueada por los tres PNG no accesibles.** El creador autoriza un prototipo visual independiente y un PR en borrador, sin integración en main ni conexión con las reglas del juego.

## Recepción de vistas previas y acceso a los originales

El creador envió después las vistas previas del suelo, zombi y hospital; primero una captura del hospital con interfaz del teléfono y luego el hospital completo. Las tres imágenes se pueden inspeccionar visualmente en el chat, pero no se exponen archivos binarios descargables en los adjuntos del entorno. No se puede certificar formato PNG o canal alfa desde la vista previa, ni copiarla como si fuera el archivo original. No se utilizó generación de imágenes, recorte o eliminación del negro para reemplazar los originales.

Se crea `assets/prototipo-hospital/README.md` para habilitar la carga directa de los tres archivos desde GitHub en esta misma rama. Hasta este commit esa carpeta no existía en los árboles comprobados; desde ahora contiene instrucciones, **todavía ningún PNG**. Los nombres propuestos son hospital.png, suelo-nevado.png y zombi.png, sin exigir que el creador los renombre para subirlos. La inspección y las decisiones geométricas siguen pendientes de los archivos reales.

CI del código de cámara `bd79053cee366ed3dd20fb51a986b69d8b05ddf0` consultado: `pruebas`, `engine` y `browser` completed/success en PR16. El navegador de ese workflow verifica V9.9, no la futura escena del hospital. Esta continuación solo modifica documentación; no repite ni presenta nuevas pruebas visuales. Main continúa en826199d, PR16 en borrador y referencia intacta.

## Continuación: ruta indicada por el creador

El creador indicó `assets/prototipo-hospital`. Se volvió a consultar Git remoto y GitHub: main sigue en826199d y la rama de esta prueba en19b5508 antes de este avance; la carpeta no existe en ninguno de los dos árboles. Las consultas de Contents para esa ruta en main y en `prototype/hospital-2-5d` devolvieron404; tampoco existe localmente ni en los adjuntos accesibles. Se solicitó la rama/commit o el enlace de GitHub para localizarla. No se interpreta esa ausencia como permiso para sustituir imágenes.

Se avanzó únicamente en la parte independiente del arte:

- `prototypes/hospital/camera.mjs`: transformación común de mundo a pantalla, inversa, arrastre por píxeles, zoom que mantiene el punto bajo el cursor incluso en los límites, pinza que sigue el centro del gesto y cálculo del encuadre inicial/restablecido. Módulo sin DOM ni conexión con el motor V9.9.
- `tests/hospital-camera.test.mjs`: siete pruebas geométricas. Se escribieron primero; la ejecución roja falló por ausencia del módulo y la verde pasó7/7 después de implementarlo. No se presenta ese rojo como reproducción de un fallo previo del juego.
- `npm test`: **474/474**, cero fallos, omisiones o cancelaciones; conserva las467 anteriores. `npm run check:build`: aprobado. HTML de referencia y SP-03 intactos.

Estos resultados verifican el cálculo de cámara, **no controles reales de rueda/pinza, renderizado, selección, oclusión ni interfaz móvil**, que siguen pendientes. No se implementó todavía una entrada HTML ni se añadieron recursos ficticios. El PR16 continúa en borrador, sin fusión; la siguiente tarea es localizar los PNG originales en la rama o commit correcto para implementar el resto del prototipo autorizado.

## Preparación inicial (histórica)

## Estado comprobado

- `git fetch origin main`: main local y remoto en `826199d96645b95869509995772c914290d63ac7`, sin commits entrantes y con árbol inicialmente limpio.
- Rama específica creada desde ese main: `prototype/hospital-2-5d`, sin modificar main.
- No se encontró `AGENTS.md` en la raíz del repositorio, sus subdirectorios ni los directorios padre comprobados. Se leyeron README, tablero18, protocolo15 e informe72 de preservación; no se inventan instrucciones de un archivo ausente.
- Tag anotado `v0.9.9-referencia-modular` intacto sobre `62e4e85150b2416ccf07d671c186b5c421993b0b`.
- HTML de referencia intacto, SHA-256 `43b8883ad4821e4b50c40791615c5ef6c0b3030476409b4e1c6da4dbd872d692`.
- Comprobación nueva: `npm run check:build` aprobada, build reproducible. No se reejecutó `npm test` ni Chromium durante esta preparación documental; no hay implementación visual que validar todavía.

## Materiales faltantes

| Material solicitado | Disponibilidad | Verificación pendiente |
| --- | --- | --- |
| Hospital PNG con transparencia | No recibido/accesible | Dimensiones, canal alfa real, márgenes, puertas/ventanas, anclaje y silueta |
| Suelo nevado PNG opaco | No recibido/accesible | Dimensiones, opacidad, perspectiva y encaje con el hospital |
| Zombi PNG con transparencia | No recibido/accesible | Dimensiones, canal alfa real, márgenes, pies y escala respecto del hospital |

El mensaje enumera los materiales, pero no expone archivos ni referencias descargables de esas imágenes. En `/workspace/attachments` solo hay cuatro textos de solicitudes anteriores. Las imágenes versionadas del repositorio son capturas históricas de pruebas, no estos recursos. No se usaron como sustitutos, no se generó arte nuevo ni se eliminaron colores para fingir transparencia.

**Desbloqueo necesario:** recibir los tres PNG originales. No se puede afirmar que conservan alfa, ajustar escala o entregar capturas de oclusión sin inspeccionarlos.

## Implementación autorizada pendiente

Una entrada HTML independiente, Canvas2D y módulos JavaScript sin dependencias nuevas. Aprovechar las herramientas existentes cuando haga falta, conservando la entrada y build de V9.9. Separar configuración de escena, cámara, renderizado y controles. Incorporar los PNG originales con nombres claros y sin reescribirlos; posición, escala y anclaje configurables por separado. La posición de los pies debe considerar los márgenes transparentes reales.

La profundidad será una demostración explícita por posición, no una solución general mediante ordenación por Y: **Delante**, hospital antes que personaje; **Detrás**, personaje antes que hospital; **Esquina**, personaje antes que hospital, con una parte de su silueta fuera de la oclusión. La geometría concreta se determinará mirando los PNG. Sombra suave independiente y opción Mostrar ocultos, manteniendo la vista normal con oclusión completa.

Cámara fija sin rotación: desplazamiento por arrastre, zoom con rueda/pinza conservando el punto del gesto, límites, acercar/alejar/restablecer; una transformación común para todas las capas. Diferenciar clic y arrastre, selección discreta del hospital y controles HTML accesibles por teclado y cómodos en móvil. Sin movimiento libre, colisiones ni búsqueda de caminos.

## Validación y entrega pendientes

Comprobar delante/detrás/esquina, Mostrar ocultos, selección, restablecer, estabilidad del zoom y alineación durante desplazamiento. Ejecutar pruebas de cámara y controles que verifiquen comportamiento, comprobaciones existentes correspondientes y recorridos Chromium en escritorio y viewport móvil. Emulación no equivale a teléfono físico. Añadir capturas de delante y esquina y documentar la nitidez al ampliar los recursos provisionales.

No existe aún una entrada jugable de este prototipo; no se proporcionan comandos de apertura de un archivo inexistente. El informe se actualizará con las instrucciones exactas, resultados y limitaciones después de implementar y probar con los PNG reales. El PR de preparación permanece en borrador y no presenta la escena como terminada.

**Límites conservados:** ningún cambio de reglas, dados, IA, crisis, objetivos, guardados, balance, narrativa jugable, interfaz actual ni SP-03. No añadir otras localidades, barricadas o casillas. No fusionar a main, mover tags ni reemplazar la referencia modular. Única siguiente tarea de esta prueba: recibir e inspeccionar los tres PNG para implementar el sector del hospital.

</details>
