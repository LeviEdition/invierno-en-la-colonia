# 73 — Prueba visual aislada 2.5D: hospital

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
