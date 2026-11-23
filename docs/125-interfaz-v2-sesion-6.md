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
