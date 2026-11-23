# 125 — Interfaz v2, sesión 6: paneles que se abren y cierran tocándolos

23/11/2026. Rama `feature/interfaz-v2-sesion-6`, apilada sobre `feature/interfaz-v2-sesion-5` ([123](123-interfaz-v2-sesion-5.md)). Foco en escritorio (1365×768); en 852×393 no se rompe nada. `src/` no cambió. (El 124 queda para las fichas del hito de contenido, en la rama `docs/plantel-y-muestras`.)

## Qué cambió

- **Sin pestañas ni flechas.** Se quitaron las cinco pestañas con flecha de la sesión 5. Ahora se toca el panel mismo:
  - **plegado:** cualquier parte de la tira lo despliega;
  - **desplegado:** lo pliegan su encabezado o el papel libre. La ficha lateral, abierta, se cierra solo por su encabezado, para no cerrarla por accidente al leer;
  - **controles internos:** dados, «Buscar», «Atacar», «Moverse», «Más», «Terminar turno», «Aportar a crisis», el retrato y las chapas con globo nunca pliegan; ejecutan solo lo suyo.
- **Delegación** (`experiencia/folds.mjs`). Un oyente por panel: `foldTouch` mira si el toque cae en un control (`closest(FOLD_CONTROLS)`: botones, campos, `tabindex`, `data-no-fold` en los dados). No hay `stopPropagation` ni `preventDefault`: el control recibe su clic una sola vez, como antes.
- **Teclado y lectores de pantalla.** Cada panel conserva un `<button class="fold-hit">` real, invisible, con `aria-expanded` y `aria-label` («Plegar el objetivo», etc.). Al recibir el foco, el panel entero se marca en Lámpara. Enter y Espacio funcionan porque es un botón nativo. La ficha usa su botón «×/Ficha» de siempre.
- **Señal de que se puede tocar:** cursor de mano y un leve aclarado del papel al pasar el mouse por la zona que pliega (no sobre los controles). Sin íconos nuevos.
- **Doble toque:** el segundo toque sobre el mismo panel dentro de 320 ms se ignora. El panel nunca queda a mitad de camino.
- **Se conservan:** la tecla «H», `crossfade` y el movimiento reducido, el recálculo de cámara, la memoria en `localStorage` con `try/catch` y la crisis nueva que se despliega sola. La ficha pasa por el mismo camino que «×», que descarta borradores de movimiento y consultas abiertas.
- **Fila de recursos:** antes dejaba pasar los clics al mapa (`pointer-events:none`); ahora los recibe para poder plegarse.

## Qué se comprobó

- **924 pruebas, 0 fallos.** Hay 6 nuevas en `interfaz-v2-sesion-6.test.mjs`:
  - la tira despliega;
  - el encabezado y el papel libre pliegan;
  - dados, botones y chapas no cambian el plegado y ejecutan su acción una vez;
  - Enter y Espacio sobre el botón real;
  - sin pestañas ni flechas, con el foco visible;
  - el doble toque deja un estado consistente;
  - el plegado no toca el juego ni el azar.
- `check:build` y `check:mapa-build` en verde.

## Qué informa una herramienta

Un guion propio con Edge (no es una batería del CI), a 1365×768 y 852×393 emulado:
- **Tarjeta del objetivo:** se pliega desde el papel y se despliega desde la tira. Un doble clic la deja plegada.
- **Barra:** se pliega y despliega desde el papel. Tocar los dados o la chapa de comida no cambia nada.
- **Teclado:** Enter y Espacio sobre el botón de la barra funcionan y el foco se ve (`outline` sólido).
- **Fila de recursos:** se pliega desde su papel.
- **Ficha:** se cierra por su encabezado y se abre tocándola.
- **Resultado:** la partida queda idéntica, sin errores ni desbordes.

## Qué falta

- **CI del PR:** las baterías de navegador y el oráculo `test:poc` (EPERM en Windows).
- **Jugando en escritorio:**
  - si el cursor y el leve aclarado alcanzan como señal;
  - si la ficha debe cerrarse solo por su encabezado.
- **En el Galaxy A15:**
  - la fila de recursos plegada deja poco papel libre entre las chapas;
  - si tocarlas resulta cómodo.

## Ajustes (observados jugando)

**Paneles de la izquierda.** Plegaban solo si se acertaba al borde: las tarjetas eran casi enteras botones (`#objective-details`, `#crisis-details`) y las chapas tenían `tabIndex=0`, así que `foldTouch` las tomaba como controles.
- **Tarjetas:** los envoltorios pasan a `<div>`; tocar cualquier parte del papel pliega o despliega. El detalle (descripción y muestras del objetivo; requisito, entregas y consecuencia de la crisis) se muestra en el mismo globo de las chapas: mouse, foco de teclado y pulsación larga. Es el mismo texto que daba el diálogo de información; la descripción del objetivo también queda en el texto para lectores de pantalla.
- **Chapas:** tocar una pliega o despliega la fila. Siguen enfocables y con su globo; se marcan con `data-fold-pass`, que `foldTouch` deja pasar.
- **Pulsación larga** (500 ms): muestra el globo y el clic que la sigue no pliega.
- **«Aportar a crisis»** sigue siendo un botón: ejecuta y no pliega.

**Tirada de dados más lenta.** Una sola constante (`sequenceDurations` en `presentation-sequence.mjs`) sirve para moverse, atacar y el D12 nocturno.

| | Antes | Después |
|---|---|---|
| Giro | 550 ms, caras a ritmo fijo | **1200 ms con freno** (ease-out cúbico) |
| Quieto en la cara final | — | **200 ms**, antes de revelar la consecuencia |
| Movimiento reducido | 80 ms | 80 ms (`reducedDurations`) |

- **Toque durante la tirada:** la adelanta al resultado (`skipRoll`). Solo mueve el reloj visual. No vuelve a tirar ni manda nada al motor, y ese toque no hace nada más.
- **Pruebas viejas:** `h342-experience-sequence` y `h344-presentation` fijaban 550 ms; ahora usan `sequenceDurations`.

**Comprobado.**
- **930 pruebas, 0 fallos**, con 6 nuevas de ajustes en `interfaz-v2-sesion-6.test.mjs`.
- `check:build` y `check:mapa-build` en verde.
- **Guion con Edge** a 1365×768 y 852×393:
  - tocar el título del objetivo o de la crisis pliega, y la tira despliega;
  - la chapa de comida pliega y despliega;
  - los globos de las tarjetas aparecen con mouse y con foco;
  - la partida queda idéntica, sin desbordes.
- **Falta:**
  - la tirada lenta y el salto vistos en pantalla;
  - la pulsación larga en el A15;
  - las baterías de navegador y `test:poc` (EPERM en Windows), que valida el CI.
