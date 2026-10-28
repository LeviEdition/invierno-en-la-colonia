# 57 — D1: auditoría previa de extracción del catálogo (SOLO DISEÑO)

**Fecha:** 28/10/2026. **Solicitud:** planificar y auditar la extracción de `ItemCatalog` sin modificar código. **Referencia auditada:** `main` en `0b75d01aba013cd029d9d0dd0bdbd20791be15fc`, ejecutable `invierno_colonia_v9_9.html` blob `d192afb43ab216d0b63ed49fd24f1d830d03f4e7`. Las comprobaciones de este documento son **lectura estática**, no nuevas pruebas ejecutadas. Esta rama contiene solo documentación; `main` queda intacta.

## Hechos verificados en V9.9

- `ItemCatalog`: líneas 355–394 del HTML de referencia. Define **17 IDs de cartas**, **8 equivalencias de categoría** y **6 distribuciones** de **20 cartas cada una** (total inicial de 120 cartas en localidades). API real: `resolve(it)`, `create(id,meta={})`, `deck(loc)`, `legend(loc)`, `label(it)`.
- `resolve` acepta ID, categoría antigua o instancia plana `{cardId,kind,...}`; devuelve `{id,name,kind,icon,desc,effect,amount?}` o `null`. `create` devuelve `{kind,cardId,...meta}` y lanza excepción para carta desconocida. Conservar semántica y orden de distribución, incluso compatibilidades heredadas.
- `deck(loc)` llama `mix(cards)`: **dependencia global oculta del aleatorizador** y punto único de desacople. Solo se invoca desde `create()` (línea 771). Mezclar exactamente una vez, con mismo algoritmo y secuencia RNG es contrato crucial.
- Consumidores: `ItemEngine` (líneas 688–744) aplica efectos; IA, encrucijadas, render del inventario, creación inicial, búsqueda, transferencia, equipos y crisis consultan el catálogo. **No** mover `ItemEngine`, `mix`, `game`, motor, reglas ni IA en D1.
- Se usan objetos planos con metadatos variables (`finderId`, `usedRound`), no instancias con prototipos. Preservar identidad, representación y JSON.
- 19 archivos `tests/*.mjs` auditados; **15** extraen código desde etiquetas `<script>` del HTML; **14** comprueban un único script embebido. La prueba `smoke-baseline` exige el texto `class ItemCatalog` en el HTML. Introducir directamente un segundo script `src=` rompe adaptadores aunque funcione el navegador.
- `test-support/game-fixture.mjs` ejecuta script con `vm.runInContext` e intercepta arranque visual. Los scripts de Chromium C14/C16 cargan el HTML por URL y usan funciones/estado expuestos por el script clásico; migrar ahora todo a ES modules rompería contratos y handlers `onclick` si no se adapta.
- [CI Node 40713073359](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40713073359): 408/408 aprobadas sobre commit de integración en main. [Chromium 40713131565](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40713131565): 5/5 partidas C14 y C16 3/3 viewports. Son **evidencias previas**, no resultados de D1.
- `docs/01-plan-refactorizacion.md` contiene encabezado histórico que todavía ubica el proyecto en A; `docs/18-tablero-operativo.md` prevalece como estado vigente.

## Alternativas consideradas

**A. Script clásico externo directo** (`<script src="src/item-catalog.js"></script>`): mínimo build, pero V9.9 dejaría de funcionar como HTML independiente; cambia requisitos de distribución offline, y obliga adaptar al menos 14 adaptadores que asumen un script único. No recomendado para primera extracción.

**B. Módulo ES nativo con `import`**: diseño moderno, pero los `onclick`/VM actuales y la apertura local `file://` pueden requerir modificaciones importantes, además de cambiar la inicialización síncrona. **Posponer hasta D2**.

**C. Archivo fuente separado + HTML autocontenido generado (RECOMENDADO)**: `src/item-catalog.js` mantiene la clase y datos, `src/invierno.template.html` mantiene el resto, y un pequeño `scripts/build-game.mjs` inserta el catálogo para producir **el mismo ejecutable público** `invierno_colonia_v9_9.html` con un único script clásico. No añadir dependencias, bundler ni servidor obligatorio. El ejecutable generado sigue versionado para descargar/abrir sin archivos auxiliares; CI comprueba generación reproducible (`npm run build` + ausencia de diff). Sacrificio: dos representaciones (fuente+artefacto), resuelto mediante generación determinista y validación de no-desactualización.

## Contrato objetivo de D1 (propuesto, no aprobado como código)

- Fuente autónoma exportable/comprobable en Node sin DOM, `game` ni `window`. Mantener la clase `ItemCatalog` y las cinco operaciones observables `resolve/create/deck/legend/label`.
- El azar **se inyecta en el borde** de `deck` (por ejemplo `deck(loc,shuffle)`, con invocación de juego `catalog.deck(loc,mix)`). El catálogo no conoce `Math.random` ni el motor. Conservar exactamente una mezcla con el mismo `mix` y orden previo.
- Para mantener el HTML clásico, puede usarse una exportación Node compatible con incrustación, sin cambiar el mecanismo global de la UI. Elegir el detalle exacto del archivo fuente en la propuesta técnica del PR, antes de codificar.
- `ItemEngine` y sus efectos continúan en el ejecutable del motor. **No** cambiar cartas, categorías, cantidades, probabilidades, algoritmo RNG, política de IA, mazos, inventarios, condiciones de victoria, habilidades, textos ni UI.
- El HTML generado es producto de build; no editarlo manualmente después de D1. Las futuras piezas de arquitectura pueden seguir el patrón hasta la transición modular total.

## Pruebas requeridas antes de aprobar el PR D1

1. **Caracterización previa sin modificar juego:** guardar resultados de API por los 17 IDs y 8 categorías (incluidos desconocidos y alias), seis distribuciones/multiconjuntos exactos, orden de leyendas, textos e iconos. Registrar mazos completos de `create()` en semillas deterministas y estados de partida iniciales/consumo de RNG. Tomar baseline reproducible desde `main`.
2. **Pruebas unitarias autónomas de catálogo:** `resolve` con ID/categoría/objeto, `create` con metadatos, error por ID desconocido, `deck` con mezclador inyectado, 6×20, `legend`, `label`, y ausencia de acceso DOM/estado global. Confirmar que no se comparten accidentalmente metadatos entre cartas.
3. **Integración y build:** `npm run build` determinista, ejecutable HTML sigue con un único script embebido y checksum reproducible; `npm test` conserva **408/408 anteriores más tests nuevos**, con 0 fail/skip/TODO; cambiar solo adaptadores estrictamente necesarios. Verificar generación limpia en Git.
4. **Regresión de motor con mismas semillas:** comparación *antes/después* de secuencias de mazos, manos iniciales, objeto elegido, consumo y orden RNG, efectos de comida/medicina, equipamientos, inventarios, muestras, crisis y conducta de IA. No aceptar solo conteo de 20 cartas.
5. **Navegador real:** Chromium setup y menús, búsqueda/revelación/ruido, mostrar y usar cartas, equipar/transferir, crisis y ambos modos; repetir C14 5/5 partidas y C16 3 viewports. Verificar **apertura offline con un solo HTML** y que la consola no tenga errores.
6. **Revisión final:** diff enfocado y no mecánico; CI y evidencias por SHA exacto; documentación técnica y criterio de retroceso si varían probabilidades, mazos o errores.

## Riesgos y contenciones

- **Alto — pérdida de ejecutable autocontenido:** elegir artefacto HTML generado, probar offline.
- **Alto — RNG o orden de mazos alterado:** preservar orden, una mezcla y snapshots de semillas en baseline.
- **Alto — fixtures rotos por cambio de scripts:** no introducir nuevo `script src` en el artefacto; verificar los 14 contratos de script único.
- **Medio — fichero generado desactualizado:** build determinista con verificación CI.
- **Medio — catálogo aún acoplado a motor por `mix`:** inyección de mezclador exclusivamente al construir mazos.
- **Medio — exportaciones, mutabilidad, metadatos y compatibilidad de cartas antiguas:** caracterización exacta, sin limpiezas oportunistas.
- **Bajo/medio — convertir D1 en refactor amplio:** limitar a catálogo, build, tests y docs. Sin `ItemEngine`, IA, narrativa ni mecánicas F.

## Plan secuenciado para implementación futura, solo si se autoriza

**D1.0** — Baseline y contratos (TDD/semillas); **D1.1** — fuente del catálogo aislada + build de HTML único; **D1.2** — integrar conservando llamada a `mix`, ajustando solo pruebas de ensamblado; **D1.3** — tests autónomos, 408+ regresiones, 5/5 partidas Chromium y checks offline; **D1.4** — revisión independiente, CI por SHA, documentación y posible PR hacia `main` con aprobación explícita posterior.

**Dictamen:** D1 es **viable con alcance pequeño**, pero no es seguro añadir directamente un segundo script externo en V9.9 por su contrato de entrega y los fixtures. Proponer opción C con compuerta previa sobre baseline RNG y HTML autocontenido. **No se ha autorizado ni ejecutado implementación.**

**Única próxima tarea:** revisar/autorizar el diseño D1 anterior y solo entonces comenzar D1.0 en una rama exclusiva de implementación, sin cambios en `main`, D2, F ni E.
