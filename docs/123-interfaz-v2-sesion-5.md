# 123 — Interfaz v2, sesión 5: paneles plegables, zoom, luces, contornos y tipografías

23/11/2026. Rama `feature/interfaz-v2-sesion-5`, apilada sobre `feature/interfaz-v2-sesion-4` ([122](122-interfaz-v2-sesion-4.md)). Foco en escritorio (1365×768); en 852×393 no se rompe nada. `src/` no cambió.

```bash
npm run check:build && npm test     # 918 pruebas
npm run check:mapa-build
```

## Qué cambió

**A. Paneles plegables** (`experiencia/folds.mjs`).
- **Qué se pliega:** las tarjetas de Objetivo y Crisis, la fila de recursos y la ficha. Cada una tiene una pestaña de papel en su borde, con flecha, `aria-label` y `aria-expanded`.
- **Plegadas:** quedan como una tira: «Objetivo 4/7 · R8», «Crisis 1/2», y los recursos con ícono y número.
- **Barra de acción:** se pliega a retrato, dados y «Terminar turno»; el retrato abre la ficha con todas las acciones.
- **Crisis nueva:** otra ronda u otro pedido despliega su tarjeta una vez.
- **Tecla «H»:** pliega o despliega todo. No choca con los atajos existentes (Escape, Enter, «-», «0» y las flechas). No actúa en campos de texto, con modificadores ni con una decisión modal abierta.
- **Transiciones:** usan las de la sesión 4 (`crossfade`) y respetan el movimiento reducido.
- **Cámara:** al plegar, recalcula `inset` y `slack`. El enfoque vuelve a encuadrar en el área libre nueva (hospital: 1,60 → 1,83).
- **Memoria:** el estado se guarda en `localStorage`, siempre dentro de `try/catch`. Si el almacenamiento falla, todo empieza desplegado.
- **Juego:** plegar nunca ejecuta una acción ni tira dados.

**B. Globos de las chapas** (`experiencia/stat-tips.mjs`).
- **Cuándo aparece:** al pasar el mouse, con el foco de teclado o con una pulsación larga (500 ms).
- **Qué muestra:** un globo de papel con el nombre y una línea de descripción. Va debajo de la chapa (arriba si no entra) y nunca sale de la pantalla.
- **Textos:** son los del mapa (`juego/information.mjs`, adaptados de V9), con el título de la ficha V9 (`statDetails`), como «Rondas restantes». Una prueba comprueba que los títulos coincidan con `reference-view.mjs`.
- **Texto nuevo:** solo «Turno», que no tenía ninguno.

**C y D. Cámara** (`escena/camera.mjs`).

| | Antes | Después |
|---|---|---|
| Zoom mínimo | contiene el mapa (con franjas) | **cubre** el área (sin franjas), recortado al centro |
| Vista general 1365×768 / 852×393 | 0,817 / 0,418 | 0,817 / 0,510 |
| Tope del enfoque | 1,5 (`focusMaxZoom`) | **2** = 3342/1671, un píxel del fondo por píxel CSS en DPR 1 |
| Zoom manual | 1,5 | 1,5 (sin cambio) |

- **Enfoque:** el contorno de la localidad ocupa cerca del 70 % del área libre. Nunca acerca menos que antes, y el encuadre completo (accesos y fichas) siempre cabe.
- **Valores medidos** en Edge a 1365×768 con la ficha abierta: colonia 1,14; escuela 1,94; biblioteca 1,99; hospital 1,60; supermercado 1,76; gasolinera 2,00; comisaría 1,81. Antes, todas salvo la colonia quedaban en 1,5.
- **Tope 2:** después de un enfoque a 2, desplazarse no cambia el zoom; si el jugador aleja por debajo de 1,5, el zoom manual vuelve a su tope.
- **Pruebas anteriores actualizadas** (decisiones viejas que este encargo cambia):
  - la vista general «contiene» todo;
  - el tope de enfoque es 1,5;
  - la escala se conserva al ensanchar;
  - el tamaño 852×294 de la disposición anterior pasó a 852×393.

**E. Luces** (constantes `FLICKER` y `NIGHT_LOOK`).

| | Antes | Después |
|---|---|---|
| Amplitud del parpadeo (`low`–`high`) | 60–100 % | 30–100 % |
| Salto de destello (`flashDelta`) | 0,2 | 0,3 |
| Base de día (`day`) | 35 % | 50 % |
| Resplandor (`glowAlpha` / `glowSize`) | 0,32 / 2,4 | 0,38 / 3,2 |

Se mantienen la Lámpara, la desincronización, 3 destellos por segundo, 24 cuadros por segundo, la pausa con la pestaña oculta y las luces quietas con movimiento reducido. Siguen siendo 25 luces. `glowAlpha` tiene un tope de 0,4: la ventana más el resplandor sigue por debajo de la Lámpara del contorno de selección.

**F. Contornos.** Revisé los siete contra el fondo 1×. Corregí tres, solo en `outlinePolygon`:
- **Escuela:** el lado derecho llegaba hasta el aro de básquet; ahora termina en la pared (x ≤ 540).
- **Biblioteca:** rodeaba la camioneta estacionada; se quitaron 4 vértices y cierra por la base del edificio.
- **Colonia:** las esquinas izquierda y superior derecha se salían del cerco; 7 vértices ajustados.

Hospital, supermercado, gasolinera y comisaría ya seguían su edificio. Los contornos no se superponen; los clics en escuela, biblioteca y colonia seleccionan su localidad. `scripts/contornos-localidades.mjs` dibuja cada contorno, antes y después, y el CI lo deja en el artifact (`/tmp/horizontal-contornos`).

**G. Tipografías.**
- **Archivos:** Bitter 600 y 700, y Alegreya Sans 400, 500 y 700, en `assets/fuentes/`: woff2, latino y latino extendido, con `OFL.txt` y un LEEME.
- **Origen:** Fontsource 5.3.0, los mismos archivos de Google Fonts. La licencia SIL OFL 1.1 está confirmada.
- **Carga:** `@font-face` con `font-display: swap` en `estilos/fuentes.css`, conectado a `--fuente-titulo` y `--fuente-texto`. La encrucijada dejó la Georgia provisoria. No se carga nada de servidores externos; el servidor del mapa ahora sirve `/assets/fuentes/`.
- **Peso:** 10 archivos, **205 KB en total**. En la práctica el navegador baja solo los cinco `latin` (≈109 KB): todo el español está en ese subconjunto.

## Qué se comprobó

- **918 pruebas, 0 fallos.** Hay 9 nuevas en `interfaz-v2-sesion-5.test.mjs`:
  - zoom que cubre a 1365×768 y 852×393;
  - enfoque al 70 % con tope 2;
  - plegar recalcula las franjas y no toca el juego;
  - `localStorage` que tira error;
  - crisis nueva y la tecla «H»;
  - globos;
  - luces;
  - contornos;
  - fuentes.
- `check:build`, `check:mapa-build`, `generar-papel --check` y `detectar-luces --check` en verde.
- **Batería `check-map-experience-browser`**, con Edge: pasa en 1365×768 y 852×393, con movimiento normal y reducido.

## Qué informa una herramienta

Guion propio con Edge, en modo QA:
- **Fuentes:** Bitter y Alegreya Sans cargadas.
- **Zoom:** alejar al máximo deja 0,817 (sin franjas).
- **Globo:** no tapa la chapa y queda dentro de la pantalla; con teclado muestra «Rondas restantes».
- **«H»:** pliega los cinco paneles y la partida queda idéntica. «Terminar turno» y el retrato siguen visibles. El estado sobrevive a la recarga.
- **`localStorage` bloqueado:** todo empieza desplegado, sin errores.
- **852×393:** sin desbordes, con todo plegado o desplegado.

Capturas:
- [paneles plegados](evidencias/interfaz-v2/123-plegado-1365x768.jpg)
- [globo de la comida](evidencias/interfaz-v2/123-globo-comida-1365x768.jpg)

Las de los contornos van al artifact del CI.

## Qué falta

- **CI del PR:** el resto de las baterías y el oráculo `test:poc` (EPERM en Windows).
- **Jugando en escritorio:**
  - si las tiras plegadas alcanzan;
  - si «H» resulta cómoda;
  - si el enfoque a 2 se ve nítido;
  - si los destellos se leen sin cansar;
  - los contornos nuevos.
- **En el Galaxy A15:** la pulsación larga de los globos, las pestañas de 44 px y el peso de las fuentes.
