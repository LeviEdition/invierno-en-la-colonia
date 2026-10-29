# 65 — D1.2a: experimento reversible de esbuild

**29/10/2026. Rama:** `refactor/experiment-d1-2a-esbuild`, derivada de `ba9a4238d22ad968edbe74d0445949f9a631ec70`. **Estado:** PoC ejecutado localmente, pendiente CI del SHA de publicación. **Recomendación provisional: AJUSTAR; no adoptar todavía como build principal.** Hay una incompatibilidad de la suite del candidato que no se ocultó ni corrigió debilitando pruebas.

## 1. Estado inicial y autorización

Los SHA remotos coinciden exactamente con los aportados por el creador:

- `main`: `0b75d01aba013cd029d9d0dd0bdbd20791be15fc`.
- `refactor/d1-catalogo`: `ba9a4238d22ad968edbe74d0445949f9a631ec70`.

La copia local estaba limpia en `fix/estabilizacion-v9-9`, commitf597bf2 de la misión anterior. No era la rama actual del proyecto. Se descargó la referencia D1 y se creó una rama experimental desde ba9a423, sin reset, merge, force-push ni descarte de trabajo. La referencia local remota de main estaba atrasada y se actualizó mediante fetch; no se creó ni modificó una rama local main. No se alteró la rama original D1.

Se leyeron tablero18, auditoría60, ruta62, planificación63 y bitácora64 antes de programar. **No hay contradicción de alcance:** el siguiente trabajo de diseño SP-02 y el trabajo técnico D1.2a son vías separadas. Los documentos históricos dicen «pendiente de autorización»; el encargo actual autoriza únicamente este PoC y exige detenerse al terminar. Se acepta la fidelidad de V9.9 como referencia, sin nueva auditoría ni cambios de reglas.

Referencia comprobada: `npm run check:build` aprobado; **433/433 tests** locales. [CI ba9a423](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40786217861) completed/success según metadatos; la API de logs devolvió contenido vacío en esta consulta, por lo que el conteo433 se atribuye a la ejecución local. Cinco partidas Chromium HTTP completas y tres tamaños C16 aprobados antes de cambiar el ejecutable.

`npm ci` inicial falla por ausencia de package-lock.json. Al incorporar la dependencia del experimento se añade lockfile y posteriormente pasa. Otro problema del entorno fue la caché npm predeterminada inaccesible; se utilizó `npm_config_cache=/tmp/d12a-npm-cache`, sin cambiar configuración del usuario.

## 2. Diseño del PoC y límites

Se conserva **sin cambios** el catálogo `src/item-catalog.mjs`, la plantilla `src/invierno.template.html`, el ensamblador `scripts/build-game.mjs` y el HTML de referencia `invierno_colonia_v9_9.html`. `npm run build` y `check:build` siguen utilizando el sistema anterior.

La entrada nueva `src/catalog-poc-entry.mjs` importa y exporta ItemCatalog mediante ESM real. `scripts/build-esbuild-poc.mjs` usa esbuild0.28.2, fijado como dependencia de desarrollo con integridad/versión en lockfile. Opciones: bundle, IIFE, browser, ES2022, sin minificación/source maps ni chunks externos; UTF-8. Inserta el bundle en el marcador de catálogo y genera **`dist/invierno-esbuild-poc.html`**, separado de la referencia. Dist se genera y publica como artifact de CI, no se versiona otro HTML grande.

Una IIFE es una función que se ejecuta al cargar el script y mantiene sus nombres internos fuera del ámbito exterior. El bundle exporta internamente el constructor; un cierre pequeño crea la instancia `catalog` usando el mezclador existente. **No publica CatalogModule ni game en window**. La instancia mantiene el mismo lugar dentro del script, sin consumir azar adicional.

El resto del script conserva su ámbito clásico, incluidos los handlers de atributos HTML. Se contaron **53 apariciones de fuente:52 onclick y1 onchange**, incluidas cadenas del render, no53 botones simultáneos. [Inventario](evidencias/d12a-build.json).

**No se empaquetó el motor completo ni se creó GameUI.** Un test separado demuestra que envolver todo el script en IIFE oculta startGame/show/search/game y altera el anclaje de arranque usado por los fixtures. Resolver ese contrato corresponde a D1.2b si se autoriza después; hacerlo ahora convertiría el experimento en una migración general.

Los fixtures existentes no se editaron: siguen leyendo el HTML y usando vm.runInContext. El runner de PoC copia la misma suite/fuentes a un directorio temporal, sustituye únicamente el HTML por el candidato y propaga cualquier fallo. No filtra archivos, no cambia expectativas ni añade skip/TODO. La copia se elimina al terminar; el checkout de referencia no se modifica.

## 3. Archivos del experimento

| Archivo | Motivo |
| --- | --- |
|`src/catalog-poc-entry.mjs`|Entrada mínima con import/export reales del único módulo ya separado |
|`scripts/build-esbuild-poc.mjs`|Bundle IIFE e inserción en HTML separado; construcción/verificación repetible |
|`scripts/check-esbuild-poc-regressions.mjs`|Suite intacta sobre candidato y comparación de40 partidas reales, conservando salida no cero ante fallo |
|`tests/build-esbuild-poc.test.mjs`|Seis contratos nuevos: entradas ESM, ámbito, bytes, determinismo, sintaxis alternativa y límite de IIFE global |
|`package.json`, `package-lock.json`|esbuild0.28.2 de desarrollo y comandos build:poc/check:poc/test:poc |
|`scripts/check-d1-offline-browser.mjs`|Seleccionar archivo/módulo Playwright, desactivar red, registrar solicitudes y hash; conserva y refuerza aserciones previas |
|`.github/workflows/pruebas.yml`|npm ci antes de la suite que ahora importa la herramienta de build |
|`.github/workflows/d12a-esbuild-poc.yml`|CI experimental: suite del candidato sin tolerar fallos, comparación del motor, HTTP/file y artifacts |
|18/60/64/65 y evidencias d12a|Estado operativo, decisión pendiente y resultados reproducibles |

No se modifica ninguna prueba histórica. Tampoco dados, ataque, búsqueda, exposición, supervivientes, crisis, objetivos, IA o narrativa. No se crea estructura D2 ni módulo de Director.

## 4. Resultados locales

| Comprobación | Referencia | PoC |
| --- | --- | --- |
|npm ci|Inicialmente imposible sin lockfile; después aprobado con lockfile|Misma instalación fijada,2 paquetes instalados en esta máquina |
|check:build|Aprobado; HTML original idéntico|Se conserva; el candidato se verifica por check:poc |
|build:poc y check:poc|No reemplaza referencia|Aprobados, bytes idénticos en construcciones repetidas |
|Suite original antes del cambio|433/433|Comparada sin eliminar casos |
|Suite completa después de añadir6 tests|**439/439**|**438/439,1 fallida** |
|Caracterización D1.0 + módulo D1.1|25/25 ejecución dirigida (20+5)|Incluidas y aprobadas en la suite del candidato |
|Partidas completas del motor|40/40|40/40; mismas acciones/estados/eventos/mensajes/finales al excluir solo hashes de fuente |
|Cinco partidas Chromium HTTP|5/5 completas|5/5 completas, finales idénticos a referencia,0 errores/invariantes |
|Interfaz/foco C16|3/3:320×640,393×852,1365×768|3/3 en esos tamaños,0 errores JavaScript |
|file:// local + IA|Bloqueada por política del navegador local|Mismo bloqueo; **no validada localmente**, pendiente comprobar en CI |

### Incompatibilidad confirmada: prueba de forma de fuente

`tests/smoke-baseline.test.mjs` exige que el HTML contenga literalmente `class ItemCatalog`. Esbuild emite `var ItemCatalog = class { ... }` dentro de la IIFE. La clase funciona en las caracterizaciones y partidas, pero esa aserción estructural falla. No es evidencia de un fallo mecánico; **sí es un contrato de la suite no satisfecho por el candidato**.

No se añade un comentario artificial con la firma, una clase puente inútil ni se cambia el regex para conseguir verde. `npm run test:poc` sale con código1 y el workflow experimental conserva ese resultado rojo, sin continue-on-error. [Resumen de suite](evidencias/d12a-poc-suite.json). La adopción queda **no aprobada**. El resultado del experimento puede revisarse sin presentar sus439 comprobaciones como aprobadas.

Los otros formatos frágiles se conservaron al no mover el script principal: un único script y el bootstrap que eliminan los fixtures. La prueba de IIFE completa identifica problemas adicionales futuros; no prueba que ya se hayan migrado.

### Comparación de partidas

Son **40 configuraciones únicas** (20 semillas por modo) ejecutadas en ambos artefactos, no80 configuraciones distintas. Se comparó el JSON íntegro de cada partida salvo `source`, que contiene hashes necesariamente diferentes: secuencia de comandos, estados finales, mensajes, eventos, excepciones, invariantes y pendientes. **40/40 digests de comportamiento iguales**. [Comparación](evidencias/d12a-engine-comparison.json). Los JSONL completos de ambos lados se conservan como artifacts de CI/runner.

| Modo | Completas por artefacto | Victorias | Derrotas |
| --- | --- | --- | --- |
|Humano automatizado+IA|20/20|15|5 moral |
|Dos controladores locales|20/20|17|2 moral,1 tiempo |

Son controladores de prueba usando el motor real, no humanos ni un simulador de reglas. No se usan porcentajes para cambiar balance.

Las cinco UI repiten las semillas2654435761/1401181143 en IA y2654435761/3816266512/3189639203 en local; incluyen victoria y derrota de cada modo y confirmación informativa final. Los finales coinciden, sin errores/invariantes incumplidas. [Referencia](evidencias/d12a-browser-reference.json), [PoC](evidencias/d12a-browser-poc.json), [foco referencia](evidencias/d12a-focus-reference.json), [foco PoC](evidencias/d12a-focus-poc.json), [captura escritorio](evidencias/d12a-poc-desktop.png), [captura móvil](evidencias/d12a-poc-mobile.png).

**file://:** Chromium local responde `net::ERR_BLOCKED_BY_ADMINISTRATOR` antes de cargar ambos HTML. No se desactiva ni elude esa política y no se cuentan los intentos como dos aprobaciones. El workflow prueba las dos versiones en un Chromium de GitHub Actions, con red desactivada y modo local/IA. Su resultado debe verificarse en el SHA publicado; hasta entonces queda pendiente. No Android físico/TalkBack/otros navegadores.

## 5. Comparación técnica y costo

| Aspecto | Ensamblador D1.1 | PoC esbuild |
| --- | --- | --- |
|Módulos|Elimina literalmente una firma export; no resuelve imports|Resuelve imports/exports y dependencias reales; se ensayaron alias y export separado |
|Complejidad actual|Un script pequeño, sin herramientas externas|Una dependencia fijada/binary por plataforma, entrada mínima y build alternativo; Node≥18 para herramienta |
|Mantenimiento|Simple con una clase, frágil al crecer|Menos sustitución de sintaxis JS; aún incrusta bundle en una plantilla y conserva motor monolítico |
|Handlers|Funcionan como globals clásicos|Se preservan porque están fuera del bundle; **no** demuestra contrato UI modular resuelto |
|Fixtures|433 pruebas compatibles con forma monolítica|432 originales compatibles;1 aserción de forma falla; fixtures generales siguen acoplados |
|Reproducibilidad|check:build compara artefacto versionado con fuentes|Versión/lockfile fijados; check:poc compara archivo generado y dos construcciones; artifact separado, no HTML versionado |
|Distribución|Un HTML sin npm en máquina del jugador|Un HTML sin npm en máquina del jugador; file local bloqueado ambientalmente, pendiente CI |
|Reversión|Referencia vigente|Rama aislada, build original y fuentes de juego intactos |

Tamaños **en bytes UTF-8**, no caracteres/comprimidos: plantilla157.556, referencia162.499, candidato164.177 (**+1.678 bytes**). Hashes: referencia `726a929502debe38d5a2c81c0ad12838b2424e4ac1ad19b27a44131f88831014`; PoC `614295431619ffb6be7612ea04aaeaf7574bd57accd3663355e0f5d285fd5245`.

[Datos de build](evidencias/d12a-build.json) incluyen cinco mediciones orientativas: sustitución en memoria ~0,01–0,02ms; llamadas al bundler ~3–13ms. **No son un benchmark justo de velocidad:** el tramo textual excluye lectura/escritura y esbuild sí lee módulos/usa servicio. No justifican elección por rendimiento ni miden FPS/carga/jugabilidad. El costo relevante es contratos/fixtures y mantenimiento de herramienta.

## 6. Revisión crítica del experimento

- El resultado positivo está limitado al catálogo. Mantener el resto del juego clásico permite comprobar un paso reversible, pero no resuelve la arquitectura completa ni prepara por sí solo el futuro singleplayer.
- La única incompatibilidad reproducida de suite se identifica por nombre y causa; permanece roja. No se interpreta439/439 de referencia como439/439 del PoC.
- No se introducen más globals de UI ni se publica el estado vivo en un namespace nuevo. Los globals antiguos persisten deliberadamente; quitarlos exigiría el trabajo posterior autorizado por separado.
- La comparación de40 partidas y caracterización protege orden de RNG, catálogo y efectos observables; no demuestra todos los estados posibles. Los recorridos UI/emulación no sustituyen hardware físico.
- La convivencia de dos builds sirve para el experimento, pero no se recomienda mantenerla indefinidamente. Adoptar uno, ajustar o descartar exige revisión del creador.
- El bloqueo file local y la ausencia inicial de lockfile son hechos del entorno/base, no regresiones atribuidas a esbuild.

**Dictamen provisional: AJUSTAR, no adoptar todavía.** Esbuild demuestra viabilidad como empaquetador del catálogo y salida autocontenida HTTP. La cobertura mecánica comparada es favorable; la compatibilidad completa de la suite y el contrato de aplicación aún no están resueltos. Si CI confirma file://, sería evidencia adicional para considerar D1.2b; nunca autorización automática. Descartarlo sigue siendo una alternativa válida si el costo de migrar contratos no compensa.

## 7. Reproducción, reversión y punto de control

Desde esta rama:

```sh
npm ci
npm run check:build
npm test
npm run build:poc
npm run check:poc
npm run test:poc
```

**El último comando termina con1 por la aserción no modificada**, guarda suite.tap, summary.json, comparison.json y lotes de partidas en `/tmp/d12a-poc-regressions/`. No ejecutar un `|| true` para presentarlo como validación aprobada. Los scripts Chromium aceptan `PLAYWRIGHT_MODULE` externo y `CHROMIUM_PATH`; PoC HTTP por `GAME_URL=http://127.0.0.1:8765/dist/invierno-esbuild-poc.html`; offline por `GAME_FILE_URL=file:///ruta/al/dist/invierno-esbuild-poc.html`. Servir raíz con Python http.server8765. El workflow contiene comandos completos y versión de Playwright de prueba1.57.0, sin incorporarla al producto.

**Rollback preferido:** con árbol limpio, volver a `refactor/d1-catalogo`; sigue en ba9a423 y conserva su build. Si se mantiene esta rama, `npm run build` sigue generando la referencia original sin utilizar esbuild. No se requiere revertir reglas, migrar partidas, restaurar main ni borrar datos. `dist` es regenerable. No usar reset destructivo. Si posteriormente se decide eliminar el experimento mediante commits, revertir sus commits en orden inverso, incluyendo lockfile/configuración de CI/comandos; documentar esa decisión sin merge automático.

**Punto de control obligatorio:** terminar D1.2a entregando informe/diff/CI, y **detenerse**. No iniciar D1.2b/c/d, D2, SP-02 ni otro subsistema. El único próximo paso es la revisión del creador con ChatGPT para decidir adoptar/ajustar/descartar y autorizar lo que corresponda.

## 8. Publicación y CI

Pendiente: crear commit experimental, subir solo esta rama y consultar Actions por su SHA exacto. Se espera que la suite de referencia esté verde y el job de regresiones del candidato esté rojo por la incompatibilidad registrada; el job de navegador/file es independiente. No afirmar CI global aprobado si ese fallo permanece. Las evidencias y resultados remotos se incorporarán aquí al conocerlos.
