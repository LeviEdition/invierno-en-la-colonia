# 76 — H3.2: comparación técnica del hospital con Phaser

**Entrega experimental para revisión.** H3.1 aceptada con las precisiones del creador; H3.2 autorizada, H3.3 no iniciada. [Tablero](18-tablero-operativo.md) · [auditoría74](74-h3-1-auditoria-identidad-visual.md) · [plan75](75-plan-hito-3-identidad-visual.md).

## Resultado y recomendación

El hospital funciona con **Phaser4.2.1, WebGL**, conservando composición, pivotes, cámara y controles de Canvas. La escena sigue aislada del motor V9.9. No hay mapa completo, reglas nuevas, movimiento libre, colisiones, física ni arte nuevo.

**Recomendación: ajustar antes de adoptar definitivamente.** Phaser es viable como candidato para el futuro tablero continuo y ofrece administración de escenas/texturas, cámara y herramientas de feedback. En esta escena de tres imágenes no demostró una ventaja de fluidez frente a Canvas y añade descarga, inicialización y mantenimiento. La versión4.2.1 requirió un adaptador de ciclo de vida y liberación explícita del contexto. Conservar este PoC para revisión y comprobar hardware móvil real antes de comprometer el renderer del producto. No se implementó PixiJS: no apareció un bloqueo que justificara otro PoC.

Esto cierra el experimento técnico para revisión, no aprueba la apariencia ni autoriza H3.3. Proporciones, contacto con el suelo, profundidad artística y kit superviviente/barricada corresponden a esa etapa. El renderer no mejora por sí solo el arte.

## Estado inicial, procedencia y límites

- Main remoto comprobado: `826199d96645b95869509995772c914290d63ac7`, sin avances. Árbol del creador limpio en `prototype/hospital-2-5d`; se trabajó en otro worktree, `/tmp/invierno-h32`.
- Primero se registró el acuerdo de mapa continuo y H3.1 aceptada en74/75/18, rama documental PR17: `77d2fc5479957364adbb99719c550f567203d85d` y `cde237d481f1eadb716ea158a4194bb9e633eecc`. Sus checks de regresión/engine/browser terminaron success. Se preservaron las propuestas anteriores como históricas.
- Rama experimental independiente `experiment/h3-2-phaser-hospital`, derivada de ese estado documental y, por ascendencia, de main. No se fusionaron PR16/17. La dependencia documental queda visible en el diff hacia main.
- Canvas y PNG proceden exactamente de PR16/head `ba1d93a4ae73a91a6f07660584e2374b53043a67`. Se copiaron archivos por snapshot, sin merge ni edición de la rama aprobada. [Manifiesto verificable](../test-support/h32-reference.json): fuentes Canvas, tests, PNG, manifiesto y evidencia histórica. El informe73 se incorpora sin reescribir sus resultados; sus checkpoints son historia.
- Tag anotado `v0.9.9-referencia-modular` conserva objeto `0fdb214612486f4cc46c1acb444390de963d05e8` y commit `62e4e85150b2416ccf07d671c186b5c421993b0b`. HTML V9.9 conserva SHA-256 `43b8883ad4821e4b50c40791615c5ef6c0b3030476409b4e1c6da4dbd872d692`. Release y sus dos adjuntos sin cambios; oráculo57872ee permanece en la ascendencia. Documento63/SP-03 idéntico a main.

Dirección aceptada: tablero ilustrado2D por capas, **mapa continuo de siete localidades**, cámara fija y elementos independientes. El hospital es el sector de prueba, no un sustituto del mapa por sectores separados. Botones de centrado y paneles móviles son compatibles con ese objetivo. No hay autorización de merge, publicación, H3.3 ni integración con el motor.

## Archivos y decisiones de implementación

| Componente | Responsabilidad |
| --- | --- |
| `prototypes/hospital/` y `assets/prototipo-hospital/` | Referencia Canvas y originales inalterados del snapshot auditado |
| `prototypes/hospital-phaser/index.html`, `style.css` | Entrada independiente; controles, textos, foco y avisos siguen en HTML |
| `main.mjs` | Montaje, estado visual local, ResizeObserver, controles, reinicio y disposición |
| `renderer.mjs` | Objetos Phaser, transformación única de cámara, capas, sombra y selección |
| `game.mjs` | Adaptador pequeño de arranque/visibilidad de Phaser4.2.1; sin reglas de juego |
| `scripts/build-hospital-phaser.mjs` | Esbuild0.28.2 existente; ESM minificado local, metadatos/hash y comprobación reproducible |
| `scripts/serve-hospital.mjs` | Servidor Node de ambas escenas, limitado a sus rutas; build al iniciar, sin Python |
| `scripts/check-h32-browser.mjs`, `check-h32-lifecycle.mjs` | Composición, entrada, fallos, cámara y recursos en Chromium real |
| `scripts/measure-h32-renderers.mjs` | Ensayos secuenciales de carga fría/caliente, reposo, navegación y heap |
| `test-support/h32-pixels.mjs`, `h32-reference.json`; tests H3.2 | Comparación de píxeles entre backends y conservación de bytes/servidor/build |
| `.github/workflows/h3-2-hospital.yml` | Compuerta del head exacto; artifacts de pruebas y medición, sin deployment |

Phaser se fija como devDependency exacta4.2.1; lockfile fija también su dependencia eventemitter3. No se añadió otro framework/bundler. El bundle local de `dist/hospital-phaser/` es generado e ignorado por Git; el producto V9.9 y su build no importan Phaser. No se carga CDN en ejecución.

Se importan directamente la configuración/pivotes, matemática de cámara, carga de imágenes, hit-test alfa y `bindControls` de Canvas. Los plugins Phaser de mouse/touch/keyboard/gamepad quedan desactivados. **Una única ruta PointerEvents** resuelve arrastre, clic y pinza; no se conecta otro drag de Phaser. Botones HTML y teclado llegan a la misma cámara. El input de demostración no genera comandos del motor.

Cámara Phaser con origen0,0, zoom visual×DPR y scroll inverso de la traslación. Su `getWorldPoint()` se contrasta con la inversa de la cámara de referencia; suelo, hospital, personaje, sombra y selección comparten esa cámara. El personaje conserva ancla716,1218 y escala0,095; hospital630,1148 y0,65. No se recortaron imágenes ni se eliminaron colores. PNG hospital/zombi mantienen alfa real, suelo opaco; pruebas de activos y hashes preservadas.

**Capas explícitas:** delante = suelo/sombra/hospital/zombi; detrás y esquina = suelo/sombra/zombi/hospital. Mostrar ocultos lleva el hospital a alfa0,28. La sombra se dibuja separadamente como textura radial derivada, con el mismo centro y extensión de la elipse original. No se presenta `depth=y` como solución general a edificios. El ancla por pies y los márgenes originales permanecen intactos.

## Comparación de composición y calibración

Se obtiene cada composición real WebGL y sus variantes diagnósticas sin actor/con actor al frente; se repite con el renderer Canvas original, mismos recursos, cámara, viewport y DPR. Se cuentan píxeles reconocibles por diferencia RGB L1>16. La fracción visible se normaliza contra el actor completo **dentro de cada backend**, para evitar confundir el distinto filtrado del fondo con oclusión. Estas variantes solo están disponibles con `?diagnostics=1`; no cambian la escena normal ni las reglas.

**Rojo conservado:** la tolerancia inicial de trabajo±2pp falló en320px: Canvas56,08%, Phaser53,68%, diferencia2,40pp. Esa cifra inicial fue propuesta técnica nuestra, no un requisito numérico del creador. [Evidencia previa](evidencias/h32-calibracion-inicial.json). No se cambió la posición para hacerlo pasar.

**Criterio calibrado: ±3 puntos porcentuales**, alrededor de la fracción Canvas del mismo viewport/DPR. Es una banda de6 puntos, muy inferior al intervalo10–90% rechazado. El actor es pequeño y se reduce una imagen de1338px de alto a unas decenas de píxeles; Canvas y WebGL LINEAR no producen exactamente los mismos bordes/contraste. En320px, la medida inicial pasó de699 píxeles reconocibles completos Canvas a598 WebGL. La discrepancia de2,40pp cabe en la banda, pero se informa, no se afirma identidad píxel a píxel.

La tolerancia se acompaña de comprobaciones independientes: posiciones, escalas y orígenes exactos; inversa de cámara con error≤0,02 unidades de mundo; zoom anclado; traslado de **todo el framebuffer** con acuerdo≥99,5%. Así se evita usar una banda ampliada para ocultar un error geométrico. La hipótesis de diferencia de rasterización está respaldada por esa geometría y por el filtrado observado; no se ha aislado cada contribución del driver.

| Viewport / DPR | Delante / detrás Phaser | Esquina Canvas | Esquina Phaser | Diferencia | Acuerdo pan framebuffer |
| --- | --- | --- | --- | --- | --- |
| 1365×768 / 1 | 100% / 0% | 56.74% | 54.74% | 2.00pp | 100.00% |
| 393×852 / 2 | 100% / 0% | 56.68% | 54.85% | 1.83pp | 100.00% |
| 320×640 / 2 | 100% / 0% | 56.08% | 53.68% | 2.40pp | 100.00% |

Mostrar ocultos revela99,9–100% reconocible en Phaser; desactivarlo vuelve a0% detrás. [Delante](evidencias/h32-phaser-delante.png) · [esquina](evidencias/h32-phaser-esquina.png) · [esquina móvil emulada](evidencias/h32-phaser-movil-esquina.png).

Las capturas de compositor sirven para oclusión y revisión humana. Para comprobar traslación se lee el framebuffer dentro de POST_RENDER: la caja CSS tiene altura fraccionaria y capturar su reescalado introduce diferencias. La primera comparación por screenshots obtuvo98,37%; no era una capa desplazada. La prueba corregida usa píxeles físicos antes de la reescala CSS, sin cambiar la cámara o el arte.

## Pruebas ejecutadas y alcance de la evidencia

- `npm ci`, `npm run check:build`, `npm test`: **480/480**, cero fallos/omisiones/cancelaciones. Son467 del juego +10 del snapshot hospital +3 nuevas de servidor/build/conservación. No se redujo cobertura.
- `npm run build:hospital` y `npm run check:hospital-build`: bundle byte a byte reproducible; HTML V9.9 intacto. El test del servidor primero reprodujo404 por una normalización incorrecta de la raíz; corrección mínima y dos pruebas verdes.
- Gate Canvas original ejecutado nuevamente sin editarlo: tres viewports, poses, alfa, cámara, selección, teclado, rueda, límites, pinza y arrastre CDP; sin excepciones. [JSON Canvas](evidencias/h32-canvas.json).
- Gate nuevo: **1365×768 DPR1,393×852 DPR2,320×640 DPR2**, delante/detrás/esquina, mostrar/restaurar ocultos, botones≥44px, teclado, rueda anclada, cámara real Phaser, pan con comparación de framebuffer, pinza CDP y arrastre móvil, resize, reset, tres reinicios por viewport, disposición/reapertura y0 overflow horizontal. Cero pageerror/console.error en recorridos normales. [JSON Phaser](evidencias/h32-browser.json).
- PNG de hospital bloqueado por red: aviso accesible, controles deshabilitados, solo reinicio disponible; desbloquear/reintentar recupera la escena sin app parcial.
- WebGL simulado no disponible: aviso y enlace a la referencia Canvas funcional; no se usa el backend Canvas deprecado de Phaser ni se oculta el cambio mediante fallback automático.
- Prueba específica de ciclo de vida: cinco reinicios con recuentos estables de listeners/ResizeObserver/objetos GL; selección real sobre alfa y zona vacía antes/después de zoom; límites de zoom; pérdida/restauración de contexto; disposición final sin listeners propios, observers ni objetos GL activos; handlers previos `window.onblur/onfocus` preservados. [JSON ciclo de vida](evidencias/h32-lifecycle.json).

**Condiciones locales:** Playwright-core1.57.0, Chromium154.0.8037.57 headless; Node24.19.0, Linux y CPU identificados en el JSON de medición. WebGL1 mediante ANGLE/SwiftShader Vulkan software, textura máxima8192. No son mediciones de una GPU física ni de un teléfono Android. CDP y viewports móviles son emulación. El CI usa Node22 y su Chromium descargado, registra sus propias condiciones; no se mezclan sus números con los locales.

## Costo medido y comparación

[Datos crudos locales](evidencias/h32-performance.json) · [bundle reproducible](evidencias/h32-build.json). Valores de tabla: mediana de tres ensayos; rangos de frío entre paréntesis.

| Viewport | Renderer | Listo frío ms (rango) | Listo caliente ms | P95 intervalo navegación ms | Draw calls reposo3s | Heap JS tras GC MiB |
| --- | --- | --- | --- | --- | --- | --- |
| 1365 | Canvas | 181 (155–219) | 55 | 16.7 | 0 | 1.57 |
| 1365 | Phaser-demand | 378 (373–453) | 250 | 16.7 | 0 | 4.73 |
| 1365 | Phaser-continuous | 381 (377–383) | 241 | 16.8 | 174 | 4.94 |
| 393 | Canvas | 207 (171–224) | 44 | 16.8 | 0 | 1.61 |
| 393 | Phaser-demand | 401 (399–404) | 230 | 16.8 | 0 | 4.78 |
| 393 | Phaser-continuous | 370 (368–394) | 255 | 16.8 | 169 | 4.98 |

JavaScript servido: Canvas5 módulos **13.102 bytes**, gzip9 por archivo5.316; Phaser bundle **1,409,348 bytes**, gzip9 **376,966** (medición local, el servidor de prueba no comprime). Esbuild conserva aviso legal MIT. SHA-256 bundle `e0afde9f6f41d7e85bcb08d617cc14abdea0f586a3a4d31a46dde6a029a1939f`. Más dos estilos y HTML en Phaser, conservados en los ResourceTiming. El paquete completo no se envía al navegador.

Método: tres ensayos por configuración y viewport, orden rotativo Canvas/Phaser bajo demanda/Phaser continuo; contexto nuevo para carga fría y reload para caliente; HTTP localhost sin compresión ni throttling. Tiempo hasta ocultar el indicador de carga medido con MutationObserver. Incluye módulos, decode y preparación del renderer; **no es una medición aislada de parseo**. Cache caliente usa revalidación ETag del servidor. Los ResourceTiming y bytes transferidos están completos en el JSON.

Reposo3s, navegación4s: eventos DOM de teclado por rAF, dirección alternada y zoom periódico; no son acciones humanas. P50/P95 son intervalos del rAF de carga, **no tiempos de ejecución GPU ni una certificación de FPS del dispositivo**. Los contadores drawImage/drawArrays/drawElements y tiempo de envío CPU ayudan a comprobar trabajo real del renderer. Heap CDP después de GC forzada, no memoria total del proceso ni VRAM. Sin otros tests/builds de esta tarea durante los ensayos finales; host compartido con carga externa no controlada. Primeros ensayos exploratorios, solapados con diagnóstico/cambios, se descartaron de la tabla final.

Canvas dibuja bajo demanda. Phaser continuo produjo172 cuadros en3s en la prueba exploratoria: trabajo evitable para una escena estática. Por defecto el adaptador duerme el loop tras POST_RENDER y lo despierta al cambiar estado/cámara. `?loop=continuous` permite repetir la comparación; no es otra escena. Futuros tweens/animaciones necesitarían mantener despierto el loop mientras duren, trabajo no implementado ahora.

Los tres PNG suman6.478.691 bytes, comunes a ambos renderizadores. Base RGBA estimada18.870.120 bytes (~18MiB), más sombra128×64×4=32.768 bytes. **Estimación dimensional**, no VRAM medida: excluye copias CPU, backbuffers, internos Phaser, DPR y posibles mipmaps. El conteo de objetos/texturas no mide su memoria. El paquete npm Phaser instalado ocupa unos112,5MB de archivos en este entorno; solo el bundle y recursos servidos llegan al navegador.

No se extrapola esta escena de un edificio/un zombi al mapa de siete localidades. Atlas, culling efectivo, límites de memoria, carga por zonas y animaciones siguen sin validar. No se añadieron sprites de estrés ni un kit artístico fuera del alcance.

## Reinicio, limpieza y reservas del framework

La prueba encontró dos detalles de Phaser4.2.1 que una comparación solo visual no detecta:

1. `src/core/VisibilityHandler.js` registra `visibilitychange` sin cancelarlo en destroy y asigna `window.onblur/onfocus`. Se reproduce el crecimiento por reinicio en la [evidencia roja](evidencias/h32-lifecycle-inicial.json). `HospitalGame` reemplaza el método protegido `Game.start()` con su arranque WebGL y tres suscripciones cancelables; no parchea globalmente EventTarget ni edita node_modules. La versión queda fijada. **Es un costo real de mantenimiento:** revisar este adaptador antes de cambiar Phaser.
2. `WebGLTextureUnitsWrapper.init()` crea una textura temporal1×1 no guardada en wrappers. `Game.destroy()` elimina los recursos registrados, pero la prueba detectó un handle restante por contexto. Tras destruir se libera explícitamente el contexto mediante `WEBGL_lose_context`; ya no quedan listeners de recuperación. Los conteos finales verifican objetos GL activos, distinguiendo `delete*` de liberación por pérdida de contexto. Si la extensión falta, se elimina canvas y toda referencia de la app; la liberación restante depende del navegador/GC, no se promete liberación inmediata. No se midió VRAM.

La prueba usa instrumentación QA externa de listeners/GL y filtra suscripciones propias, no los listeners internos de Playwright. Tras restaurar un contexto, los handles anteriores dejan de ser objetos válidos; el conteo usa `isTexture/isBuffer/...`, no solo «create menos delete».

`Restablecer vista` solo ajusta cámara. `Reiniciar escena` cancela RAF pendiente, aborta controles HTML y PointerEvents, desconecta ResizeObserver, destruye Game y monta una copia limpia del canvas accesible; reinicia la pose/selección/ocultos. Fallo de carga no deja controles activos ni instancia parcial. Navegar fuera libera la escena; la partida V9.9 no participa.

## Cómo reproducir

Desde la raíz de esta rama con Node22+:

```sh
npm ci
npm run check:build
npm test
npm run build:hospital
npm run check:hospital-build
npm run dev:hospital
```

Abrir **http://127.0.0.1:8771/prototypes/hospital-phaser/**. Comparar con **http://127.0.0.1:8771/prototypes/hospital/**. Mantener el servidor abierto; Ctrl+C para detenerlo. VS Code: abrir carpeta y Terminal → Nueva terminal. Alternativa Live Server: construir con `npm run build:hospital`, luego «Open with Live Server» sobre `prototypes/hospital-phaser/index.html` con la raíz completa disponible. No se requiere Python, CDN ni servidor de V9.9. El bundle no se reconstruye solo al editar: repetir build/reiniciar servidor y recargar. [README](../README.md#probar-h32-desde-vs-code-sin-python) incluye puerto alternativo y PowerShell.

Para repetir QA, instalar Playwright como herramienta temporal, sin guardarlo en lockfile:

```sh
npm install --no-save --package-lock=false playwright@1.57.0
npx playwright install chromium
```

Con el servidor en otra terminal:

```sh
node scripts/check-h32-browser.mjs
node scripts/check-h32-lifecycle.mjs
node scripts/measure-h32-renderers.mjs
```

Los scripts usan `CHROMIUM_PATH`, por defecto `/usr/bin/chromium`. Si se usa el Chromium de Playwright, definir la ruta que imprime `node --input-type=module -e "import {chromium} from 'playwright';console.log(chromium.executablePath())"`; PowerShell `$env:CHROMIUM_PATH='ruta impresa'`, bash `export CHROMIUM_PATH='ruta impresa'`. `H32_ORIGIN` cambia el origen; salidas por defecto `/tmp/h32-browser`, `/tmp/h32-lifecycle`, `/tmp/h32-performance` (variables H32_OUTPUT_DIR/H32_LIFECYCLE_DIR/H32_PERF_DIR). Las instrucciones normales para abrir no requieren instalar QA.

Este prototipo usa HTTP con módulos/PNG, no apertura file://. El HTML V9.9 offline publicado conserva sus instrucciones y bytes. No se volvió a publicar ni a certificar la release.

## Revisión crítica y pendientes

Se hizo una segunda lectura del diff y contratos después de las pruebas, sin otro agente/revisor independiente en esta entrega. Se comprobaron: ningún import del motor, ausencia de consumo de RNG de juego, una ruta de input, transformación compartida, fixtures originales intactos, limpieza real y fallos visibles. Los defectos de ciclo de vida confirmados se corrigieron y se conservaron las pruebas rojas. Los fallos del arnés por scroll fuera del viewport y escala CSS de screenshots se corrigieron en QA, sin alterar el producto para forzar resultados.

Reservas: método protegido del framework fijado, WebGL requerido, minificación con detalle/aliasing distinto, nitidez limitada al ampliar los PNG, filtrado y sombra sin identidad píxel a píxel. Sin Android/iOS físicos, Safari/Firefox, TalkBack, GPU de hardware, perfil de batería ni medición VRAM. Tampoco se ensayaron todas las fallas posibles del driver o la extensión de pérdida de contexto ausente. No existe evidencia para afirmar que este renderer escalará sin problemas al mapa completo.

**Siguiente tarea única: revisión del creador del PoC, informe y diff, y decisión sobre renderer/H3.3.** No iniciar arte, conexión de reglas o mapa antes de esa autorización. PR16/17 y este experimento permanecen sin merge, sin publicación automática. Para revertir la evaluación, cambiar a main: sus fuentes, build y referencia no se tocaron; no se mueve ningún tag.

## Commits, PR y CI

Implementación: `678fd0cd1b6b9c569fad1d507b97d8547468192d`. La documentación y evidencia local se añaden en un commit posterior de la misma rama experimental. No se escribe aquí el SHA de este mismo documento; el head exacto, checks y enlaces de ejecución se registran en el PR de borrador y en la evidencia de entrega posterior. Así se evita una referencia circular al commit que contiene este texto. El workflow H3.2 hace checkout explícito de `pull_request.head.sha`; los workflows existentes de regresión D1/D2 conservan sus contratos.
