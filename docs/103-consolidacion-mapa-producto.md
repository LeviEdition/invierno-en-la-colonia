# 103 — Consolidación del mapa como producto y aligeramiento del repositorio

16/11/2026. Rama `experiment/mantenimiento-mapa-producto` desde `main` (`a898a9a`, Hito 3 cerrado). PR en borrador hacia `main`; sin merge, tags ni publicación; sin reescribir la historia.

Objetivo: que el mapa horizontal viva en una carpeta de producto con imports directos, que los prototipos intermedios salgan del árbol (siguen en la historia), que la evidencia deje de crecer y que el clon de `main` pese menos. Sin ningún cambio de jugabilidad, interfaz, arte ni textos.

## 1. Inventario (antes de mover nada)

### 1.1 Qué es el producto

El mapa horizontal se arma con dos bundles y cinco hojas de estilo. La lista de módulos sale de `dist/horizontal-map/build.json` (entradas reales de esbuild) y la de recursos en tiempo de ejecución, de una captura de todas las URL que pide la página al preparar una partida, abrir el mapa, la ayuda y los ajustes (Chromium, modos producto y QA):

| Pieza | Origen | Contenido |
|---|---|---|
| Bundle del visor `map.mjs` | `prototypes/action-map/main.mjs` | 58 módulos: `action-map` (main, map-view, action-controller/panel/presentation), `cycle-map` (4), `experience-map` (4), `inventory-map` (controller, panel), `play-map` (controller, information, panel), `search-map` (controller, panel), `movement-map` (controller, presentation-sequence, dice, layout, stable-layout, storm-model, storm-view, nonce), `state-map/layout`, `horizontal-map` (scene-configuration, camera, presentation, environment-model/view, vegetation-geometry, scene/environment/atmosphere.json), `hospital` (camera, controls, scene), `hospital-phaser` (game, dispose-game, startup, texture-quality, renderer), `hospital-workshop` (kit, resources, renderer, slot-contours, uploaded-kit.json, mockup/assets, mockup/model, mockup/atmosphere-audio, mockup/scene.json), `config/horizontal-capacities.json`, `assets/mapa-horizontal/manifest.json`, `kit_arte_h33/manifest.json`, Phaser |
| Bundle del motor `reference-host.html` | `prototypes/action-map/reference-host.mjs` | `src/` completo (motor, vista de referencia, agente), más los brokers (`play-map`, `cycle-map`, `inventory-map`, `action-map`, `search-map`, `movement-map`), `play-map/host-effects`, `state-map/projection`, `state-map/reference-observer`, `horizontal-map/reference-data` (capacidades de 33 accesos inyectadas al motor en el build) |
| Página | `prototypes/horizontal-map/index.html` | Más `style.css` → `@import action-map/style.css` → `@import search-map/style.css`; `experience.css`; y `hospital-workshop/mockup/style.css` enlazada desde el HTML |
| Arte en tiempo de ejecución | `assets/mapa-horizontal/nuevo mapa.png`; `kit_arte_h33/assets/{barricada, zombi, retrato-mara, retrato-superviviente-02, -03, -04}.png` | Solo esos siete archivos; el resto del kit y `assets/prototipo-hospital/` no se piden nunca |
| QA | `horizontal-map/capacity-preview.mjs` | Solo en `dist/horizontal-map-qa` |

Fuera del bundle quedan 40 archivos de `prototypes/`: las páginas y entradas de cada prototipo intermedio (`index.html`, `main.mjs`, `map-view.mjs`, `reference-host.mjs`, `style.css`, README) de `hospital` (H3.2 canvas), `hospital-phaser` (H3.2), `hospital-workshop` y su `mockup` (H3.3: `main`, `kit.json`, `tecnico.html`, `atmosphere-model/view`, `camera`, `atmosphere.json`), `state-map` (H3.4.1), `movement-map` (H3.4.2, incluido `storm.json`), `search-map` (H3.4.3) y `action-map` (H3.4.4: `index.html`, `scene-configuration.mjs`).

### 1.2 Las tres cadenas

1. **Imports:** `horizontal-map` importa de `action-map`, que importa de `search-map`, `movement-map`, `state-map`, `hospital-workshop`, `hospital-phaser`, `hospital`. Cada capa fue un hito.
2. **Build:** `build-horizontal-map` llama a `build-action-map` con `variant:'horizontal-map'` y un plugin de esbuild que, cuando `action-map/map-view.mjs` importa `./scene-configuration.mjs`, lo sustituye por el de `horizontal-map`. Otro plugin inyecta `horizontal-map/reference-data.mjs` en lugar de `src/domain/reference-data.mjs` dentro del motor (33 accesos). El primero desaparece con la consolidación; el segundo se conserva, porque es la forma de dar al motor las capacidades del mapa sin tocar `src/`.
3. **Servidor:** `serve-horizontal-map` construye los siete prototipos y delega en `serve-action-map` → `serve-search-map` → `serve-movement-map` → `serve-state-map` → `serve-workshop` → `serve-hospital`, cada uno con sus prefijos. El producto solo necesita cinco prefijos.

### 1.3 Pruebas y baterías, por lo que importan

| Grupo | Archivos | Decisión |
|---|---|---|
| Pruebas que importan solo módulos del producto | `h32-startup`, `h33-audio`, `h33-uploaded-art`, `h341-layout/observer/projection`, `h342-experience-*`, `h342-protocol`, `h343-search-*`, `h344-action-*`, `h344-presentation`, `horizontal-*`, `hospital-camera`, `map-*`, `presentation-frame-stalls` (41) | Se conservan; solo cambian rutas |
| Pruebas de prototipos retirados | `h32-preview`, `h32-reference`, `h33-kit`, `h33-mockup`, `h33-atmosphere`, `h33-preview`, `h341-build-preview`, `h342-build`, `h343-build`, `h344-build`, `hospital-assets`, y la parte de `h341-engine-integration` y `h342-visual` que lee `mockup/atmosphere.json` y `movement-map/storm.json` | Se retiran o se reapuntan (ver §4) |
| Baterías del workflow del mapa (9) | `check-horizontal-presentation`, `check-map-capacities`, `-inventory`, `-cycle`, `-migration`, `-experience`, `-feedback-camera`, `-death-decisions`, `check-h344-browser` | Se conservan; cambian rutas y `modulePath` |
| Baterías del producto fuera del workflow | `check-horizontal-map`, `-comfort`, `-composition`, `check-h344-camera/edge/movement/presentation-stalls`, `record-*`, `measure-horizontal-map` | Se conservan con rutas nuevas |
| Baterías de prototipos retirados | `check-h32-*`, `check-h33-*`, `check-hospital-prototype`, `measure-h32/h33`, `check-workshop-kit`, `check-h341-*`, `check-h342-*`, `check-h343-*`, `measure-h342-storm` y sus `test-support/h32-pixels`, `h32-startup-faults`, `h33-*`, `h341/h342/h343-browser-checks`, `h32/h33-reference.json` | Se retiran |
| Workflows | `h3-2-hospital` y `h3-3-workshop` corren en PR a `main` cuando cambia `prototypes/**` y construyen los prototipos; `h3-4-1…4` y `d0/d1` apuntan a ramas viejas; `horizontal-map.yml` corre solo en PR a `experiment/h3-4-4-…`, **no en PR a `main`** | Se retiran los de prototipos; `horizontal-map.yml` pasa a `mapa.yml` sobre `main` |

### 1.4 Evidencia

`docs/evidencias`: 1188 archivos, 543 MB, todos versionados. Enlazados desde algún documento (`docs/*.md`, README, CLAUDE) o desde un fixture de pruebas: 368 archivos, 99 MB. Sin ningún enlace: 820 archivos, 440 MB. Ninguna batería escribe en `docs/evidencias` (todas usan `/tmp/*`, que el workflow sube como artifact); el crecimiento vino de copias manuales en cada entrega. Un clon superficial de `main` pesa 1,2 GB (543 MB de árbol más 557 MB de pack).

Enlaces a evidencia que ya estaban rotos antes de esta entrega: `docs/evidencias/h33-393-*.png` y `docs/evidencias/h341/rojo-*.log` (patrones sin archivo), y dos anclas internas de `mapa-integral/README.md`.

## 2. Plan

1. **Evidencia:** borrar del árbol los 820 archivos sin enlace; prueba `tests/evidencias-enlazadas.test.mjs` que falla si aparece un archivo en `docs/evidencias` que ningún documento o fixture enlace. Regla en CLAUDE.md: capturas y JSON al artifact del CI; al repositorio solo lo que un informe cita.
2. **Carpeta de producto `app/mapa/`:**

```
app/mapa/
  index.html  main.mjs  map-view.mjs  README.md
  estilos/      maqueta.css  busqueda.css  acciones.css  mapa.css  experiencia.css   (misma cadena @import, mismo orden)
  escena/       scene-configuration, camera, presentation, environment-model, environment-view, vegetation-geometry, scene.json, environment.json, atmosphere.json
  acciones/     action-controller, action-panel, action-presentation, action-broker
  busqueda/     search-controller, search-panel, search-broker
  movimiento/   movement-controller, movement-broker, presentation-sequence, dice, layout, stable-layout, storm-model, storm-view, nonce
  ciclo/  juego/  inventario/  experiencia/  estado/     (sin cambios internos)
  motor/        reference-host.mjs, reference-data.mjs, host-effects.mjs
  render/       camera, controls, scene (hospital) · phaser/ (game, dispose-game, startup, texture-quality, renderer) · kit/ (kit, resources, renderer, slot-contours, uploaded-kit.json) · maqueta/ (assets, model, atmosphere-audio, scene.json)
  qa/           capacity-preview.mjs
```

   Los archivos se mueven con `git mv` (la historia sigue por `--follow`) y un reescritor recalcula cada import relativo a partir de la ruta resuelta; ningún archivo del producto importa desde `prototypes/`. `scripts/build-mapa.mjs` y `scripts/serve-mapa.mjs` reemplazan la cadena: un build (sin plugin de variante; se conserva el de `reference-data`), un servidor con cinco prefijos. Salida en `dist/mapa` y `dist/mapa-qa`. URL: `http://127.0.0.1:8779/app/mapa/`. npm: `build:mapa`, `check:mapa-build`, `dev:mapa`.
3. **Retirar** los 40 archivos de prototipos, sus scripts, pruebas, fixtures y workflows (§1.3), y `assets/prototipo-hospital/` (6,2 MB, solo lo usaban H3.2/H3.3). Tabla de consulta en §5.
4. **Documentos:** README, CLAUDE.md, tablero, `app/mapa/README.md` (guía de Windows, VS Code y celular). Los informes 73–93 describen los prototipos con sus rutas de entonces: se dejan como están, con una nota en esta tabla de que esas rutas se consultan en la historia.

## 3. Resultado

(Se completa al final de la entrega: estructura, tamaño antes y después, CI.)
