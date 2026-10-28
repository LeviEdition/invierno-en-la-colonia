# 59 — D1.1: extracción del catálogo y construcción autocontenida (sin merge)

**Fecha:** 28/10/2026. **Alcance autorizado:** continuación D1 tras D1.0: extraer `ItemCatalog` en la rama `refactor/d1-catalogo`, conservar comportamiento y entrega de un único HTML, ejecutar pruebas y documentar. **No se modifica `main`, no se fusiona PR, no se implementan D2, F ni Director de Juego.**

## Referencias del repositorio y arquitectura

- **Base inmutable de D1:** `main` SHA `0b75d01aba013cd029d9d0dd0bdbd20791be15fc`, HTML original blob `d192afb43ab216d0b63ed49fd24f1d830d03f4e7`.
- **Código fuente separado:** `src/item-catalog.mjs` exporta `ItemCatalog`, clase autónoma importable en Node sin DOM, estado `game` ni lógica de los jugadores. Conserva los 17 tipos, 8 aliases, 6 distribuciones, `resolve`, `create`, `deck`, `legend` y `label`.
- **Inyección de dependencia:** el constructor acepta un mezclador; `deck` llama exactamente una vez a `this.shuffle(cards)`. El HTML generado instancia `new ItemCatalog(cards=>mix(cards))`. Es una función diferida y se resuelve cuando `mix` ya está inicializada; así se conserva el mismo algoritmo y orden de consumo RNG sin que el módulo conozca `mix`.
- **Fuente de aplicación:** `src/invierno.template.html` mantiene el HTML monolítico salvo un marcador donde antes estaba la clase; `scripts/build-game.mjs` inserta código de `src/item-catalog.mjs` y produce `invierno_colonia_v9_9.html`. El artefacto generado conserva **un único script clásico embebido**. Se puede abrir con `file://` sin servidor, empaquetador externo ni múltiples archivos.
- `npm run build` regenera y `npm run check:build` compara byte a byte el ejecutable comprometido. El CI ordinario corre `check:build` antes de `npm test`.
- `tests/item-catalog-modulo-d1.test.mjs` aporta **5 pruebas autónomas** de consulta, metadatos, distribución, objetos separados, inyección de mezclador y ausencia de dependencia global. Se conservaron las 20 pruebas D1.0 de caracterización.
- `scripts/check-d1-offline-browser.mjs` valida apertura real desde archivo en dos modos; `.github/workflows/d1-catalogo-chromium.yml` ejecuta ese recorrido además de C14 y C16.

## Evidencias ejecutadas

### Node y build
- [Actions 40720568281](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40720568281), SHA `5cc07f50ceb8d3683fed583438a1978470a08b42`, job `122930010040`: **433/433 tests**, 0 fail, 0 skipped, 0 todo, 0 cancelled.
- Log explícito: `Build reproducible: HTML autocontenido actualizado`. Las 408 pruebas históricas + 20 D1.0 + 5 D1.1 pasan.
- La verificación de fuentes comparó el código generado con lo comprometido y confirmó igualdad exacta; un script embebido.

### Chromium real (runner GitHub Actions)
- [Actions 40720568450](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40720568450), SHA `5cc07f50ceb8d3683fed583438a1978470a08b42`, job `122930010101`: **`completed/success`**.
- Apertura `file://` en **local** y **IA**: ambos inician, catálogo de 17 definiciones, 6×20 cartas, 7 objetos iniciales, 0 `pageerror`.
- C16: **3/3 viewports** (320×640, 393×852, 1365×768) para foco/ayuda/pase/fallecimiento/sucesión, 0 errores JavaScript.
- C14: **5/5 partidas completas** sin errores, invariantes ni interrupciones; IA victoria ronda 4 y derrota por moral ronda 6; local victoria ronda 2, derrota moral ronda 4 y victoria ronda 3.
- [Artefacto ZIP de Chromium 12829559449](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40720568450/artifacts/12829559449) con JSON y capturas C14/C16.
- No se ejecutaron Android físico, TalkBack, Safari/Firefox ni playtesting humano: fuera de alcance.

## Auditoría técnica y consideraciones

1. **D1.1 cumple separación del catálogo, no del motor:** la entrega final aún incluye el JavaScript integrado dentro del HTML, intencionalmente; `ItemEngine`, IA, turnos, efectos de cartas y reglas no se movieron ni reformularon.
2. **El catálogo no conoce modos ni Director narrativo:** introduce la dependencia del mezclador por inyección y permite reutilización futura singleplayer. No se han añadido atributos ni mecánicas nuevas.
3. **No se altera la secuencia RNG observable:** D1.0 conserva snapshots completos de 6 mazos en cuatro semillas de barajado directo y tres semillas para inicio local/IA; todos pasan. C14 repitió cinco partidas con resultados equivalentes. Esto no demuestra equivalencia para todas las semillas posibles.
4. **Compatibilidad heredada intacta:** `create(id,meta)` mantiene la posibilidad de sobrescribir `kind`/ `cardId` con metadatos y las definiciones conservan congelado superficial; son comportamientos caracterizados, no necesariamente ideales.
5. **Deuda técnica:** el template duplica casi todo el HTML con el artefacto generado; debe mantenerse la regla de no editar el archivo generado manualmente. `check:build` evita divergencia silenciosa. La importación ESM se usa para Node y se inserta como script clásico generado para navegador.
6. **Evidencia delimitada:** el cambio jugable se restringe a cómo se construye `ItemCatalog` con el mezclador inyectado; no es una migración a módulos ESM del juego entero. Pruebas verificadas sobre SHA de la rama; no implica aprobación para merge.

## Dictamen y próxima tarea

**D1.1 IMPLEMENTADA Y VALIDADA** en el alcance de catálogo separado + HTML autocontenido y regresiones Node/Chromium. **No merge ni cambios en `main`.**

**ÚNICA SIGUIENTE TAREA:** auditoría independiente D1.2–D1.4 de integración y diff final contra `main` (incluidos riesgos de build, estabilidad del RNG, calidad de fixtures y compuertas de promoción). No fusionar a `main` sin autorización posterior del creador.
