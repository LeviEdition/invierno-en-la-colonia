# 44 — C11 / issue #13: dados accesibles al tacto

**Fecha:** 28/10/2026. **Base:** `2fbbc59`. **Rama:** `fix/estabilizacion-v9-9`. **Estado:** implementación, pruebas locales y Chromium aprobadas; revisión independiente sin defectos pendientes tras corregir R1. CI pendiente de publicar/comprobar. Issue13 abierto para revisión humana.

## Alcance autorizado y comprobaciones iniciales

Solo #13 y las regresiones producidas por C11. Después, y únicamente con C11 terminado/documentado/aprobado, auditar pendientes mediante lectura, pruebas no destructivas y documentación. Sin cambiar mecánicas, reglas de #7, balance u objetivos; sin comenzar D/E, narrativa, fusión o cierres de issues.

Checkout inicialmente limpio; fast-forward `d342f96`→`2fbbc59`, dos commits documentales del otro chat, sin stash ni reescrituras. PR14 abierto/draft hacia `refactor/arquitectura`; `main` remoto `d9068f4aa8d3a10bbbf1e0a8a2527744cc6952cb` intacta. Leídos protocolo15, informe43, diff/código C10, issue13 y CSS/flujo de dados.

Referencia: **358/358 pruebas locales**, sin fallos/canceladas/omitidas/TODO; [CI exacto de2fbbc59](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40622935501) success con358/358. C10 se comprobó además con sus16 recorridos Chromium antes y después de C11,0errores en ambos. Sin regresión grave observada ni bloqueo Git; #7 sigue pendiente de aceptación, no se cambian sus prioridades ni se cierra.

## Problema y corrección

`getBoundingClientRect()` reproduce **26×25px CSS** y separación3px en los tres tamaños pedidos. En320×640 el panel fijo ya tapaba supervivientes; con más dados podía alcanzar otros controles. Aumentar solamente ancho/alto agravaría ese problema.

Se mantienen dados y menú abajo, ahora en una franja que reserva espacio. El tablero conserva sus cartas y se desplaza dentro de su contenedor, por encima de la franja. **Dados44×44 y separación8px**, cuatro columnas; hasta dos filas visibles y desplazamiento propio si hay más dados. El menú se despliega por encima de la franja, con altura limitada y scroll si lo necesita. El menú abierto continúa cubriendo temporalmente parte del tablero como antes; es un despliegue intencional que se cierra para jugar. No invade dados ni botón☰.

En alturas≤520px se permite desplazar la página y el tablero ocupa50dvh. La franja puede quedar inicialmente fuera de vista, pero se recupera desplazando; evita recortar definitivamente controles en ventanas bajas. No se promete que sea fija en esas alturas.

El cambio ejecutable se limita a **19 líneas CSS**. **DOM y JavaScript íntegramente idénticos a2fbbc59**; SHA256 del script `8ec55e4a29e90c6542f57ab5076f854664ac50248b7404582d7929d445a09f7e`. No cambian valores, tiradas, selección, consumo, acciones, turnos, objetivos ni estados del juego. No se añaden dependencias npm, workflows o configuración cloud.

## TDD y comparación antes/después

El nuevo [script Playwright](../scripts/check-issue13-browser.mjs) usa Chromium real con estados reproducibles y azar inicial fijo0,45. No sustituye funciones del juego. Obtiene dimensiones de elementos reales, respeta el recorte de sus ancestros de overflow y realiza toques/clics sobre los controles de interfaz.

**Rojo previo al parche:** tres viewports completos, **27 comprobaciones geométricas fallidas**,0excepciones JS. Tamaño y separación insuficientes en los tres; colisiones en320 y con pool16 en393. Los trazados de selección, consumo y pase se completaron; no se atribuyen esos fallos a reglas del motor. [JSON antes](evidencias/c11-antes.json).

**Verde final:** seis viewports, **24 conjuntos de mediciones**,0fallos y0excepciones JS. Para los tres tamaños de referencia los trazados mecánicos antes/después son idénticos: selección del6, limpieza que consume solo ese dado, reservas separadas J1/J2 y agotamiento/fin. El script completo y el DOM se mantienen sin cambios; no se agregan tests Node que pretendan medir CSS por expresiones regulares. [JSON final](evidencias/c11-final.json).

Dos problemas del arnés inicial se corrigieron antes de conservar la referencia roja completa: despejar el pendiente narrativo antes de cerrar su modal y esperar el clic sintetizado de la entrada táctil. Al evaluar colisiones se corrigió además el uso de rectángulos fuera del recorte de scroll; esos rectángulos no son controles visibles. No se ignoraron colisiones reales ni se modificó el producto para esconderlas.

## Evidencia por tamaño

| Viewport CSS | Entrada | Dados antes→después | Separación final | Panel, menú y controles |
| --- | --- | --- | --- | --- |
|320×640|Táctil emulado|26×25→44×44|8px|Sin colisiones visibles, sin scroll horizontal, siete localidades alcanzables|
|393×852|Táctil emulado|26×25→44×44|8px|Sin colisiones visibles, sin scroll horizontal, siete localidades alcanzables|
|1365×768|Clic escritorio|26×25→44×44|8px|Sin colisiones visibles, sin scroll horizontal, siete localidades alcanzables|
|852×393|Táctil emulado|44×44 final|8px|Fallback de página; franja recuperable y menú desplazable|
|640×320|Táctil emulado|44×44 final|8px|Fallback de página; franja recuperable y menú desplazable|
|320×480|Táctil emulado|44×44 final|8px|Fallback de página; franja recuperable y menú desplazable|

Cada viewport cubre4dados y16dados, menú cerrado/abierto, selección de cada uno de los16 mediante interacción real sin consumirlos, siete destinos del tablero y acceso a las siete entradas del menú. En móvil se toca también un punto cercano a la esquina del dado. El pool16 se inyecta para probar presentación de una cantidad posible con15supervivientes y un compañero, sin afirmar que se jugó una partida natural con esa población.

Las seis vistas del menú abren mediante sus botones reales. Acciones refleja el dado seleccionado; limpiar gasta exactamente uno y retira3residuos. Terminar turno abre pase real aJ2, que conserva su reserva independiente. Se comprueba ocultamiento durante IA, curación pendiente, pase y fin; dados gastados no reaparecen. La UI previa ocultaba los no interactivos y no generaba dados con atributo disabled; se conserva ese contrato y su estilo CSS, sin crear estados nuevos.

Capturas conservadas: [320 antes](evidencias/c11-320-antes.png), [320 después](evidencias/c11-320-despues.png), [393 menú](evidencias/c11-393-menu.png). Contienen avisos iniciales transitorios del juego, con pointer-events desactivado como antes.

## Revisión crítica independiente y corrección R1

Otro agente revisó diff y código, ejecutó comprobaciones propias y no editó ni hizo commits. Detectó **R1/P2, regresión creada por C11:** con altura fija y overflow oculto, cabecera y franja no encogibles dejaban☰ fuera del viewport. El tablero se reducía a19px.

| Reproducción | Antes2fbbc59,4dados | C11 inicial,4dados |
| --- | --- | --- |
|852×393|☰y327–379, recibe interacción|☰y399–451, no recibe interacción|
|640×320|☰y254–306, recibe interacción|☰y399–451, no recibe interacción|

También fallaba320×480 con16dados. Se agregó prueba roja antes de corregir: después de pasar los tres tamaños mínimos,852×393 no permitía recuperar☰ con rueda real. [Rojo R1](evidencias/c11-r1-rojo.json). La corrección añade únicamente el fallback de altura descrito arriba; no se cambian mecánicas.

**Revalidación independiente R1 aprobada en852×393/640×320/320×480**, con16dados: rueda real recupera la franja,☰ recibe hit, dado16 acepta toque y conserva la reserva, las siete entradas del menú reciben hit, y Acciones muestra el dado elegido. Captura640×320 inspeccionada visualmente.0excepciones JS. [JSON independiente](evidencias/c11-revision-independiente.json). No quedan defectos confirmados de C11 en el alcance revisado; se recomienda continuar con CI/entrega.

Durante las pruebas el servidor HTTP heredado8765 dejó de responder al cortarse su transporte de ejecución. Se reinició únicamente ese servidor de pruebas con logs en/tmp; el revisor usó además un servidor independiente8876. Se repitió el arnés final; no se presenta el fallo de infraestructura como regresión del juego. El script obtiene el HTML antes de lanzar Chromium para evitar dejar un navegador abierto ante un fallo HTTP inicial.

## Pruebas automatizadas y reproducción

- **Referencia:**358/358,0fallos/TODO.
- **Componente afectado:**111/111 (modo local, colonia/turnos, modales y accesibilidad de pase), repetido después de R1.
- **Suite final `npm test`:358/358**,0fallidas/canceladas/omitidas/TODO, después de R1.
- **Chromium final:** seis viewports,24conjuntos de geometría, todos los flujos completados,0fallos/0erroresJS.
- **C10 en Chromium:**16/16 antes y16/16 después del cambio,0erroresJS.
- Comparación de JavaScript/DOM: idénticos a2fbbc59; comparación de trazados mecánicos en los tres tamaños originales: idénticos.
- `git diff --check`: aprobado. CI exacto de entrega: pendiente de publicación/verificación en este commit.

Reproducir: servir raíz con `python -m http.server 8765 --bind 127.0.0.1`; ejecutar `PLAYWRIGHT_MODULE=/ruta/a/playwright-core/index.mjs node scripts/check-issue13-browser.mjs`. Admite `CHROMIUM_PATH`, `ISSUE13_URL`, `C11_OUTPUT_DIR` y `C11_LABEL`. Genera JSON y capturas; sale con código no cero si falla cualquier condición. La referencia previa puede servirse desde un directorio temporal extraído con `git show 2fbbc59:invierno_colonia_v9_9.html`, sin cambiar el checkout.

## Límites, control y siguiente paso

No Android físico, TalkBack, puntería real de dedos humanos ni validación universal de zoom/safe-area/teclado virtual. La emulación no sustituye esas pruebas. C11 no declara balance ni V9.9 estable. La reserva preexistente de dos líderes simultáneos y otros riesgos se mantienen para la auditoría posterior, sin corregirlos aquí.

Entrega exclusivamente a `fix/estabilizacion-v9-9`; PR14 abierto/draft a `refactor/arquitectura`. No se modificó `main`, cerró issue alguno, fusionó ni publicó versión. **Siguiente paso único: confirmar CI de C11; solo entonces iniciar auditoría de lectura/pruebas/documentación autorizada.** Los informes anteriores se conservan.
