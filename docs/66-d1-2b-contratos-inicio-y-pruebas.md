# 66 — D1.2b: primer contrato de inicio/pase y cargador de pruebas

**29/10/2026. Base918e24183a441c127ce23c75ea36d97f7f90f347. Rama `refactor/experiment-d1-2b-contracts`.** Primer bloque acotado implementado y aprobado en pruebas locales y CI exacto8b738df; listo para revisión. No adopta el build experimental ni inicia D2.

## Autorización y estado inicial

Tras entregar D1.2a y explicar la siguiente tarea —resolver contratos entre módulos, botones y pruebas—, el creador indicó «Bueno prodigamos» (continuar). Se interpretó y anunció como autorización del siguiente bloque pequeño D1.2b, **no** como aprobación de cambiar reglas, sustituir la construcción principal, migrar todos los subsistemas o iniciar D2/singleplayer.

Árbol limpio en918e241; remotos main0b75d01, D1ba9a423 y experimentoA918e241 sin cambios. Se descargó la referencia A y se creó rama B separada. Referencia local439/439, check:build y npm ci aprobados; la incompatibilidad conocida del PoC era438/439 por la búsqueda literal de `class ItemCatalog`. Informe65 conserva esa instantánea histórica.

El alcance se fijó antes de programar: **cargador compartido, sustitución justificada de una comprobación textual por contrato real y piloto de tres botones** (inicio IA, inicio local, confirmar pase). Se eligió ese límite para no convertir la adaptación de pruebas en una reescritura del motor.

## Cambios y propósito

| Archivo | Cambio y motivo |
| --- | --- |
|`test-support/game-source.mjs`|Centraliza lectura de un HTML autocontenido, preparación del script y hashes; también admite fuente JS explícita con el arranque clásico conocido |
|`test-support/game-fixture.mjs`|Utiliza ese cargador y permite inyectar un programa; conserva DOM mínimo, RNG, microtareas y opciones anteriores. Devuelve metadatos del programa concreto |
|`test-support/game-runtime-contract.mjs`|Comprueba interfaces de los cinco componentes/puntos de entrada y operaciones reales, sin exigir cómo se escribe la declaración de clase |
|`tests/smoke-baseline.test.mjs`|Conserva sus cuatro casos; el control de clases/entradas pasa de regex a ejecución del contrato, sin stub de paint. El control de script único/sintaxis usa el cargador compartido |
|`src/handover-ui.mjs`|Adaptador de tres botones que recibe solo dos capacidades: startGame y confirmPass. No recibe ni exporta game |
|Entrada y build del PoC|Incluyen ese módulo y registran el adaptador en la composición experimental. El catálogo puro no importa UI; plantilla, motor y build principal siguen intactos |
|`tests/game-source-contract-d12b.test.mjs`|12 casos nuevos: entrada HTML/JS, catálogo privado, rechazo de formatos incompatibles, seis defectos deliberados y ciclo de vida/eventos del adaptador |
|`scripts/check-d12b-handover-browser.mjs`|Prueba real en Chromium con handlers globales sustituidos por funciones que fallan; comprueba los comandos capturados |
|Workflow experimental|Incluye la rama B y seis recorridos nuevos; no omite fallos ni introduce continue-on-error |

No dependencias nuevas, modificaciones de reglas ni cambios del HTML/build de referencia. `ItemCatalog` y la plantilla conservan sus bytes. El resto de fixtures y handlers no se migró masivamente.

## Cómo se conectan los botones

El módulo recibe funciones concretas y registra un listener de captura sobre document. Para los tres botones previstos, intercepta el clic **antes** del atributo onclick legado, evita ejecutarlo una segunda vez y llama a la capacidad recibida. Los demás controles siguen su recorrido previo. También maneja clics sobre hijos del botón y la activación por teclado, que genera un clic normal.

Se conservan temporalmente los atributos onclick como identificadores y compatibilidad con los selectores de prueba. **No se afirma haber eliminado los handlers globales del juego completo.** Es un piloto reversible: tres botones dejan de resolver su comando mediante el nombre global al recibir el evento. No hay eval nuevo en producción ni un objeto window.GameUI con el estado vivo.

Se valida que ambos comandos sean invocables; una segunda conexión sobre el mismo document se rechaza. La función de desconexión es idempotente y permite reconectar, evitando listeners duplicados. Cambiar de partida no reinstala el módulo: la instancia de catálogo/composición se crea una sola vez al cargar el HTML.

**Límite del piloto:** los selectores aún reconocen el atributo onclick legado. No se generaliza este mecanismo a todos los controles; antes de extenderlo conviene acordar identificadores de comandos/atributos estables y el ciclo de vida completo. Tampoco se ha encapsulado todo el motor en IIFE.

## Por qué el contrato nuevo no consiste en borrar una prueba

La comprobación anterior encontraba las palabras `class ItemCatalog`, pero no detectaba un método roto. Ahora se comprueban constructores/interfaz, métodos requeridos y puntos de entrada invocables; además se ejercitan resolución de cartas, selección de grupo, consulta de equipo, inicialización de muerte y elegibilidad de crisis. El catálogo puede estar privado dentro de IIFE: se comprueba su constructor a través de la instancia real.

El smoke utiliza paint real. Si lo sustituyera por un stub, podría ocultar que falta ese punto de entrada. Las cuatro pruebas smoke y todas las regresiones previas permanecen; no se añaden skip/TODO.

Se introdujeron seis defectos **solo dentro de partidas aisladas de prueba**, uno por caso: resolución incorrecta del catálogo, TurnController ausente, ItemEngine.attack ausente, interfaz de muerte incompleta, crisis que acepta cualquier carta y paint ausente. El contrato detectó todos. No se alteró el motor distribuido para fabricar estos resultados. Los25 casos de caracterización D1.0/módulo D1.1 también se conservan en la suite.

## Pruebas y comparación

| Comprobación local | Resultado |
| --- | --- |
|npm ci / check:build|Aprobados; sin cambios de dependencias o artefacto principal |
|build:poc / check:poc|Aprobados, salida determinista |
|npm test sobre referencia|**451/451**,0 fallidas/canceladas/omitidas/TODO |
|Suite completa sobre PoC|**451/451**, mismos casos/aserciones que referencia, sin filtros |
|Partidas del motor comparadas|40/40,20 por modo, mismos estados/acciones/eventos/mensajes/finales salvo hashes de fuente |
|Comparación con evidencia D1.2a|Los40 digests de comportamiento coinciden también con los históricos |
|Cinco partidas Chromium UI|5/5 completas, finales iguales a D1.2a;0 errores JS/invariantes/reintentos |
|C16 interfaz/foco|3/3:320×640,393×852,1365×768,0 errores |
|Contrato nuevo de inicio/pase|6/6:los tres tamaños × local/IA; una creación por inicio,0 llamadas a handlers globales sustituidos |
|file://|Bloqueo local conocido; **4/4 aprobadas en CI8b738df**, referencia/PoC × local/IA, red desactivada/sin solicitudes HTTP |

**439 existentes+12 nuevas=451**, no40 tests adicionales por repetir partidas. El rojo arquitectónico se reprodujo antes del adaptador en el PoC A: al sustituir deliberadamente los handlers globales, el primer inicio local llamaba al fallback y no creaba partida. Después, los seis casos pasan con0 fallbacks y una creación exacta. Esto es una prueba de desacoplamiento bajo fallo inyectado, **no un bug mecánico descubierto en V9.9**.

Las pruebas de pase preparan explícitamente el estado para terminar turno; no se presentan como partidas naturales. Los cinco recorridos completos y las40 partidas del motor usan sus controladores existentes y el motor real. La emulación móvil no es Android físico/TalkBack.

[Suite PoC](evidencias/d12b-suite.json), [comparación40](evidencias/d12b-engine-comparison.json), [5UI](evidencias/d12b-browser.json), [foco3](evidencias/d12b-focus.json), [contrato6](evidencias/d12b-handover.json), [metadatos/límites](evidencias/d12b-local.json). Los artifacts de CI conservan TAP, JSONL completos y verificaciones file. [Resultados remotos por SHA](evidencias/d12b-ci.json).

## Revisión crítica y limitaciones

- El contrato se amplía a comportamiento real, con seis controles negativos, en lugar de aceptar solamente otro regex de salida de esbuild. No demuestra toda la lógica del juego por sí solo; lo complementa la suite de regresión.
- El cargador compartido sigue utilizando vm y reconoce el bootstrap clásico. **Rechaza una IIFE completa sin adaptador explícito**, en lugar de recortar código buscando patrones internos del bundler. Se soportan la referencia y el PoC actual, no cualquier bundle futuro.
- Se migró el fixture compartido y el smoke; otros archivos mantienen adaptadores propios. No se declara terminada la migración de pruebas.
- Se capturan dos comandos de inicio/pase, no todos los botones. Otros controles conservan globals y asignaciones inline; la aplicación completa sigue parcialmente monolítica.
- El listener de captura detiene la propagación de esos tres clics para evitar la doble acción. C16, la prueba dirigida y las partidas verifican las rutas actuales; no se extiende a otros controles sin revisar sus eventos.
- Durante una aplicación de parche se interrumpió el transporte del entorno. Se releyó Git/archivos, se confirmó que ese parche no se había aplicado y se reintentó tras recuperar conexión; sin reset ni pérdida de cambios.
- Esta es autorrevisión técnica con pruebas, no una revisión independiente de ChatGPT ni autorización de adoptar el build.

**Resultado técnico:** el primer bloque elimina la incompatibilidad concreta de D1.2a sin cambiar las reglas y demuestra un contrato UI pequeño. La construcción principal sigue sin sustituirse. No iniciar D2 ni migrar otros subsistemas automáticamente.

## Reproducción, rollback y checkpoint

`npm ci`, `npm run check:build`, `npm run build:poc`, `npm run check:poc`, `npm test`, `npm run test:poc`. A diferencia de la instantánea A, el último comando ahora debe terminar con0 y451 aprobadas. Se conserva la evidencia roja A como historia; no se reescribe para parecer que siempre estuvo verde.

Con servidor8765, ejecutar `check-d12b-handover-browser.mjs`, `check-c16-focus-browser.mjs` y `check-c14-browser.mjs` contra `/dist/invierno-esbuild-poc.html`, con PLAYWRIGHT_MODULE/CHROMIUM_PATH cuando sean externos. La comprobación file requiere un Chromium cuya política permita cargar archivos; CI realiza apertura local/IA con red desactivada.

**Rollback:** con árbol limpio, `git switch --detach 918e24183a441c127ce23c75ea36d97f7f90f347` devuelve el experimento A y su fallo conocido. Para la referencia D1 sin experimentos: ba9a4238d22ad968edbe74d0445949f9a631ec70. Main y D1 remotas no cambian; no hay migración de datos ni release que deshacer.

**Checkpoint:** publicar solo la rama B y comprobar CI por SHA; luego detener este bloque para revisión. La siguiente decisión será cuánto ampliar del contrato UI/fixtures o si aceptar el enfoque. No se autoriza automáticamente D1.2c/d, adopción del build ni D2. El resto del plan singleplayer permanece como diseño.

## Entrega remota

**Código:** `8b738df4bb9490726cceabd3b40c9a8a00327c40`, publicado solo en rama B. [Diff desde A](https://github.com/LeviEdition/invierno-en-la-colonia/compare/918e24183a441c127ce23c75ea36d97f7f90f347...refactor/experiment-d1-2b-contracts).

| CI del SHA exacto8b738df | Resultado comprobado |
| --- | --- |
|[40865297188 — referencia](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40865297188)|completed/success, logs451/451,0 fallidas/omitidas/TODO |
|[40865297184 — candidato y navegador](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40865297184)|completed/success, ambos jobs aprobados; PoC451/451 y40/40 comparaciones |
|Navegador del mismo run|5/5 partidas,3/3 C16,6/6 comandos capturados,4/4 file offline;0 errores/invariantes/reintentos |

Se descargaron los artifacts y se cotejaron datos: hash PoC `bbf71aae0198d3c5bc72f73e3e2219c8f603f63a04b895880fea67de93c87fc5` idéntico a local; cinco finales coincidentes; seis casos de handlers sin fallback; cuatro aperturas file con red desactivada. Fuente/plantilla/catálogo/build/HTML principal intactos. Main0b75d01, D1ba9a423 y experimentoA918e241 conservados; sin PR/merge/release ni cierre de issues.

**Checkpoint final:** primer bloque D1.2b terminado para revisión; no declarar migrada toda la UI/pruebas ni adoptar el build principal. El commit documental de este checkpoint no cambia código y se verifica por su propio SHA en Actions antes de entregar. La única siguiente tarea es revisar este diff y delimitar otra ampliación; D1.2c/d y D2 no iniciadas.
