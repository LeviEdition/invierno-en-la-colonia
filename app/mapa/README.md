# Mapa — producto

Interfaz de partida sobre el motor V9.9 (`src/`): preparación, acciones, decisiones, ciclo y final se juegan desde el mapa horizontal. No cambia reglas, IA ni arte. Guía de experiencia y revisión: [informe 99](../../docs/99-experiencia-unificada-del-mapa.md). Cómo llegó a esta carpeta: [informe 103](../../docs/103-consolidacion-mapa-producto.md).

## Correr el mapa

Requiere Node 22+ y Git. En la carpeta del repositorio:

```bash
npm ci
npm run dev:mapa
```

Abrir **http://127.0.0.1:8779/app/mapa/** y elegir **Jugar con IA** o **Dos jugadores en este dispositivo**. Mantener la terminal abierta; Ctrl+C detiene el servidor. Tras actualizar el código: detener, volver a iniciar y recargar con Ctrl+Shift+R.

### Windows, VS Code y PowerShell

`npm.cmd` evita el bloqueo de `npm.ps1`:

```powershell
git fetch origin
git switch main
git pull --ff-only
npm.cmd ci
npm.cmd run dev:mapa
```

Si 8779 está ocupado:

```powershell
$env:MAPA_PORT = "8780"
npm.cmd run dev:mapa
```

y cambiar 8779 por 8780 en el enlace.

### Celular en la misma Wi-Fi

```powershell
npm.cmd run dev:mapa -- --host 0.0.0.0
```

Abrir en el teléfono la URL «Red local» que imprime Node (no `127.0.0.1`). La PC debe seguir encendida; permitir Node en red privada si Windows lo pide. Se prioriza la orientación horizontal; en vertical se conservan los controles. La prueba física en el teléfono de referencia (Samsung Galaxy A15) sigue pendiente.

## Qué hay en esta carpeta

| Carpeta | Contenido |
|---|---|
| `index.html`, `main.mjs`, `map-view.mjs` | Página, arranque del visor y vista del mapa (Phaser) |
| `estilos/` | `maqueta.css` → `mapa.css` (importa `acciones.css` → `busqueda.css`) → `experiencia.css` → `interfaz-v2.css` (disposición v2, activa con `data-interfaz="v2"` en el `body`), en ese orden |
| `escena/` | Composición: `scene.json` (localidades, fichas, 33 accesos), `environment.json` (vegetación, luces), `atmosphere.json` (nieve, viento, humo), cámara, presentación |
| `acciones/`, `busqueda/`, `movimiento/`, `ciclo/`, `juego/`, `inventario/`, `experiencia/` | Controladores, paneles y brokers de cada parte de la partida |
| `estado/` | Proyección pública del motor y observador |
| `motor/` | `reference-host.mjs` (iframe con el motor real y los brokers), `reference-data.mjs` (capacidades del mapa inyectadas al motor en el build), `host-effects.mjs` |
| `render/` | Cámara, controles y escena de Phaser; `kit/` (contrato del arte subido, recursos), `maqueta/` (ensamblado del kit, selección, audio) |
| `qa/` | Vista sintética de capacidades; solo se construye y sirve en modo QA |

Arte en tiempo de ejecución: `assets/mapa-horizontal/` (fondo y manifiesto) y `kit_arte_h33/assets/` (barricada, zombi y cuatro retratos). Datos editables: los tres JSON de `escena/`. Las capacidades (33 accesos) están en `config/horizontal-capacities.json` y no se cambian sin decisión del creador.

## Construcción y QA

```bash
npm run build:mapa          # dist/mapa: map.mjs (visor, sin motor) y reference-host.html (motor real)
npm run check:mapa-build    # falla si dist/mapa no coincide con el código
node scripts/serve-mapa.mjs --qa   # además dist/mapa-qa (instrumentación de pruebas), solo loopback
```

El visor nunca importa el motor ni ningún archivo de prototipos; el build lo comprueba. Las baterías de navegador están en `.github/workflows/mapa.yml` y en [CLAUDE.md](../../CLAUDE.md). No hay guardado: recargar la página vuelve a la preparación; reconectar el visor conserva el motor y sus recibos, y ninguna operación se repite para recuperar su resultado.

## Límites conocidos

- El fondo activo es `mapa-2x.webp` (3342×1882), mostrado a la mitad sobre el mundo de 1671×941. El zoom máximo es 1,5 respecto del mundo (`maxZoom` en `escena/scene.json`) y el enfoque de localidad llega a 1,5 (`focusMaxZoom`), limitado también por el encuadre de cada localidad. Véase docs/112.
- Validado en Chromium con emulación móvil; falta el teléfono físico.
- El enlace «Referencia estable» de las herramientas de desarrollo (`?dev=1`) abre `invierno_colonia_v9_9.html`, que no sirve este servidor: abrirlo directamente desde el repositorio.
