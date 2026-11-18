# 112 — Mapa en doble resolución

17/11/2026. Rama `feature/mapa-2x`, desde `main` `27ef968`. Cambia la textura del fondo y el zoom máximo; motor, reglas, 33 accesos, posiciones e interfaz se conservan. Número 112 porque el 111 ya está tomado por la cuarta corrida del laboratorio, que sigue en su rama.

## Qué cambia

- **Textura:** `assets/mapa-horizontal/mapa-2x.webp`, RGB **3342×1882**, 1 092 582 bytes.
  - Origen: la ampliación 2× de `nuevo mapa.png` aprobada por el creador (Upscayl, *digital-art-4x*), sin retoques.
  - Codificación: WebP calidad 90 con sharp 0.34.4 (libwebp 1.6.0). PSNR 39,6 dB frente al PNG ampliado.
  - El PNG ampliado (9,0 MB) no entra al repositorio; su SHA-256 queda en `manifest.json`. `nuevo mapa.png` (1671×941) se conserva íntegro (`previousActiveMap`).
- **Mundo sin cambios:** el mundo sigue en 1671×941. El asset del mapa declara las medidas de la textura y se dibuja a escala 0,5 (`mapTextureScale = 1671/3342`), que equivale a `setDisplaySize`. Si la textura no conserva la proporción del mundo, la carga falla.
- **Zoom máximo:** 1,5 respecto del tamaño lógico, como constante en `app/mapa/escena/scene.json` (`maxZoom`). A ese zoom, un píxel de la textura ocupa 0,75 píxel CSS. El rótulo pasa a medir respecto del tamaño lógico: 100 % es 1:1 y el máximo muestra 150 % (antes 100 % era el máximo).
- **Enfoque de localidad:** tope propio `focusMaxZoom: 1.5` (decisión del creador, 17/11: al elegir una localidad, centrarla y acercar un poco más). El encuadre de la localidad sigue limitando: en 852×393 queda entre 1,14 y 1,5 según la localidad, y la colonia en 0,81 porque su recuadro es más grande. Cerca de los bordes del mapa la cámara no puede centrar del todo, porque no se desplaza más allá del arte.
- **Pantallas más grandes que el mapa** (por ejemplo 2560×1440): la vista general ahora llena la pantalla hasta 1,5 en lugar de quedar en 1:1 con márgenes. Es la consecuencia directa del tope nuevo y la limitación que el arte de 1671×941 no permitía resolver. En 1365×768, 852×393 y 393×852, ajuste y enfoque quedan idénticos a `main`.
- **Servidor:** `serve-mapa.mjs` sirve `.webp` como `image/webp`.
- **Guarda:** luces y vegetación dinámicas recortan el fondo en coordenadas del mundo. Hoy están desactivadas (`environment.json`); si se reactivan con una textura de otra escala, la escena falla con un mensaje claro en lugar de dibujar recortes corridos.

## Comprobado

- `npm run check:build`, `npm test` (756/756) y `npm run check:mapa-build` en verde (Windows).
- **Batería nueva `scripts/check-map-2x-browser.mjs`** (Edge, 1365×768, 852×393 y 393×852):
  - el archivo activo decodifica a 3342×1882, el renderer usa esa textura a escala 0,5 y el mundo mide 1671×941;
  - a zoom de ajuste, los 33 accesos (y zombis, barricadas y retratos) quedan en las mismas posiciones de pantalla que en `main`, con tolerancia de 0,01 px. La referencia `test-support/mapa-2x-ajuste.json` se grabó con la misma batería contra el build de `main` `27ef968`;
  - zoom máximo 1,5, «+» deshabilitado y rótulo «150 %»;
  - capturas a zoom máximo en 852×393 y 1365×768, que en el CI van al artifact (`/tmp/horizontal-mapa-2x/`).
- **Baterías existentes en local** (Edge): presentación, capacidades, cámara y avisos (ajustada al tope nuevo), muertes durante acciones y D12. Las que graban vídeo (ciclo, inventario, migración, experiencia y H3.4.4) no se corren en esta PC: decide el CI del PR.
- Se miraron las capturas a zoom máximo: contornos, zombis, retratos y fachadas coinciden con el arte, sin desplazamientos.

## Falta probar

- Jugar en escritorio y en el **Samsung Galaxy A15**. La textura entra en una superficie potencia de dos de **4096×2048** (unos 32 MB de GPU, antes 8 MB): cabe en el límite habitual de 4096 de los móviles, pero hay que confirmar memoria y fluidez en el teléfono.
