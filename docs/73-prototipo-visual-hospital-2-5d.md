# 73 — Prueba visual aislada 2.5D: hospital

**29/10/2026, Montevideo. Estado: preparación; implementación bloqueada por los tres PNG no disponibles.** El creador autoriza un prototipo visual independiente y un PR en borrador, sin integración en main ni conexión con las reglas del juego.

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
