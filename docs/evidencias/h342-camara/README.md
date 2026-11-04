# Pan/zoom y fichas — evidencia de H3.4.2

[Informe86](../../86-h3-4-2-sincronizacion-camara-fichas.md). Base74b40e0; implementación **8665740bb8241e4fd1d431eda131dfbd9a9d2897**. Documentación posterior. [Manifest de tamaños/hashes](manifest.json). Los datos de rutas `/tmp/...` conservan las ubicaciones originales de los arneses; los medios copiados se enlazan aquí.

## Reproducción y comparación

- [Video aportado por el creador, original](muestra-creador.mp4):970×422/30FPS/146cuadros. [Rastreo auxiliar ficha S/chimenea](rastreo-video-creador.json), [recorte alineado por chimenea](recorte-creador-alineado.png). Misma escala entre recortes, sin retocar recursos. La ficha cambia≈11px relativos en el extremo registrado. Es una medida orientativa de video comprimido mediante búsqueda local de plantilla; no certifica precisión subpíxel ni FPS de un dispositivo.
- Antes de corregir: [video propio](antes-pan-zoom.webm), [traza por RAF](antes-frames.json), [resultado rojo](antes.json), [fallo](rojo-camara.txt). **30 muestras** en las que cambió la transformación de la ficha sin avanzar el contador POST_RENDER del mapa. No se movió el personaje en el motor.
- Después: [escritorio1365](1365/pan-zoom-perfiles.webm), [393 emulado](393/pan-zoom-perfiles.webm), [320 emulado](320/pan-zoom-perfiles.webm). Cada video recorre apagado/Suave/Tormenta con pan y zoom. Las cámaras se centran en colonia antes de cada perfil; no se compara una vista general con un acercamiento distinto.
- Capturas finales: [1365](1365/despues.png), [393](393/despues.png), [320](320/despues.png). Una imagen fija no demuestra suavidad: los videos y las trazas durante el gesto son la evidencia temporal.

[Resultados posteriores](despues.json): **9/9 combinaciones**,0 cambios de cámara de la ficha sin nuevo cuadro de mapa; movimiento efectivo, selección por clic posterior, una sola ficha por ID, misma partida y RNG, sin errores/desbordamiento. Cada carpeta tiene `off-frames.json`, `soft-frames.json` y `storm-frames.json` con tiempos, contador real de renders de Phaser, cámara solicitada y posición/tamaño DOM de la ficha estática observada.

El criterio se aplica durante el arrastre/zoom, no solo después de soltar. Mide **desfase de capas**, no un objetivo de60FPS. La animación de viaje de un actor sí cambia su posición de mundo deliberadamente y se comprueba por separado.

Reposo: tras200ms de estabilización, un MutationObserver vigila350ms las fichas: **0 escrituras** en los nueve casos, aunque la nieve siga dibujándose. Apagado:0 cuadros de mapa en esa ventana. Son comprobaciones acotadas de actividad innecesaria, no mediciones de energía, VRAM o rendimiento sostenido.

## Regresiones y entorno

- [555/555 Node](suite.txt), sin fallos/omisiones; builds/checks aprobados.
- [Experiencia5/5](experiencia.json), [recuperación5/5](recuperacion.json), [regresión3 tamaños](regresion.json) y [9 casos límite](casos-limite.json), aprobados.
- Node24.19.0, Chromium154.0.8037.57, Playwright1.57 externo, Linux/SwiftShader software.1365×768/DPR1;393×852/320×640/DPR2 con tacto y pinza CDP emulados. Audio inicialmente apagado. Visibilidad/reconexión controladas, como en85. **Sin teléfono físico**.
- El motor y las fuentes gráficas anteriores no cambian. El oráculo40/40 de74b40 es evidencia reutilizada localmente; CI vuelve a comprobarlo sobre el nuevo head. El CI actual y el artifact descargado se registran en [PR22](https://github.com/LeviEdition/invierno-en-la-colonia/pull/22), distinguiendo pasos ejecutados del estado global que publique GitHub.

Para jugar: [guía Windows/VSCode](../../../prototypes/movement-map/README.md), sin Python. Para repetir este gate con las herramientas externas de QA instaladas como en el workflow existente:

```sh
node scripts/serve-movement-map.mjs --qa
```

Otra terminal, desde la raíz:

```sh
node scripts/check-h342-camera-browser.mjs
```

En este entorno: `PLAYWRIGHT_MODULE=/opt/codex/cua_node/lib/node_modules/playwright-core/index.mjs`, `PLAYWRIGHT_BROWSERS_PATH=/tmp/h342-playwright`, Chromium`/usr/bin/chromium`. Son rutas de QA del entorno, no requisitos del usuario de Windows. El workflow instala Chromium/FFmpeg/Playwright externos. QA se sirve solo en loopback y no forma parte del producto normal.

Queda pendiente que el creador pruebe la corrección en su equipo. No se declara H3.4.2 aprobada ni se fusiona el PR.
