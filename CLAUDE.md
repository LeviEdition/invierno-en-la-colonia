# Invierno en la Colonia — instrucciones para Claude

Videojuego de supervivencia que empezó como adaptación de *Dead of Winter* (referencia V9.9, preservada) y evoluciona hacia un singleplayer narrativo propio: el jugador encarna al líder de un grupo y sus decisiones tienen consecuencias persistentes.

**Lo vigente está en [docs/18-tablero-operativo.md](docs/18-tablero-operativo.md):** estado, próxima tarea única, cola, hallazgos abiertos y decisiones de mapa e interfaz. Leelo antes de empezar. No hace falta leer [docs/18-historico-tablero.md](docs/18-historico-tablero.md) salvo que busques el origen de una decisión.

## Reglas fijas

- Un solo motor (`src/application/reference-engine.mjs`) determina costes, tiradas y consecuencias. La interfaz solo presenta resultados reales; no recalcula ni duplica reglas.
- Ninguna animación, doble clic, toque repetido o recuperación de una respuesta puede repetir una acción ni consumir azar extra.
- En el modo de dos jugadores locales, manos, dados y registro privados no se muestran durante el pase de dispositivo.
- La referencia V9.9 (`invierno_colonia_v9_9.html`, tag `v0.9.9-referencia-modular`) no se modifica. El HTML se genera desde `src/`; nunca se edita a mano.
- El mapa vive en `app/mapa/` y no importa nada de fuera salvo `src/`, `config/`, `assets/` y `kit_arte_h33/`. Los prototipos H3.2–H3.4.4 se retiraron del árbol; se consultan en la historia (informe 103).
- Arte, paleta, tipografía y escenas narrativas nuevas siguen la [guía de estilo (109)](docs/109-guia-de-estilo.md).
- No cambiar reglas, costes, balance, capacidades (33 accesos), posiciones ni arte aprobado sin decisión explícita del creador.
- **Nada de merge, tags, releases ni publicación sin indicación expresa del creador.** Push solo a la rama de trabajo indicada.

## Comandos

Requiere Node 22 o posterior.

```bash
npm ci
npm run check:build && npm test          # construcción y suite unitaria
npm run check:mapa-build                 # build del mapa (app/mapa → dist/mapa)
npm run dev:mapa                         # http://127.0.0.1:8779/app/mapa/
```

Las baterías de navegador (`scripts/check-*-browser.mjs`) necesitan Playwright 1.57 con Chromium y el servidor en modo QA (`node scripts/serve-mapa.mjs --qa`). La lista exacta y las variables de entorno están en [.github/workflows/mapa.yml](.github/workflows/mapa.yml). Si no podés correrlas localmente, el CI del PR es la fuente de verdad: decilo en el informe en lugar de darlas por aprobadas.

## Cómo entregar

- Actualizar las secciones 1 a 5 del tablero **reemplazando** su contenido; no agregar bloques fechados.
- El detalle va en un informe numerado en `docs/` (el siguiente número libre) y en la descripción del PR. Ajustar su extensión al tamaño del cambio.
- La evidencia pesada (capturas, vídeos, JSON de pruebas) va al artifact del CI, no al repositorio, salvo las capturas que un informe cite. `tests/evidencias-enlazadas.test.mjs` falla si queda un archivo en `docs/evidencias` que ningún documento enlace.
- En el informe, distinguir qué se comprobó, qué informa una herramienta y qué falta probar jugando en escritorio y en el teléfono de referencia (Samsung Galaxy A15).

## Idioma

El creador habla español rioplatense. Informes, documentación y mensajes de commit en español.
