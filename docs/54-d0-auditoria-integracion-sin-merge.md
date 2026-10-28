# 54 — D0: auditoría de integración de PR14 (SIN MERGE)

**Fecha:** 28/10/2026, Montevideo. **Autorización del creador:** «Vamos con D0». D0 es **análisis y plan de integración**, no autorización de fusión, de refactor ejecutable ni de ajustes a reglas F. La etapa C1–C16 ya fue aceptada/cerrada formalmente, con nueve issues cerrados (acta53). Se consultaron GitHub, el diff completo de PR14, las dos ramas, PR1, el workflow, la suite y el plan técnico01.

## Instantánea verificada de ramas y PR

| Elemento | Estado y SHA |
| --- | --- |
| `main` | `d9068f4aa8d3a10bbbf1e0a8a2527744cc6952cb`, inalterada |
| `refactor/arquitectura` | `0933c703ea0af1ab39cc5506e29a42ef1240de91` |
| `fix/estabilizacion-v9-9` | `951059e72c448ef666fcc4ffb8fa3653e4933833` al iniciar D0 |
| [PR14](https://github.com/LeviEdition/invierno-en-la-colonia/pull/14) | `fix/estabilizacion-v9-9` → `refactor/arquitectura`, **open/draft**, `mergeable=true`, `mergeable_state=clean`, `rebaseable=false` (dato de API, no inferir que un rebase sería seguro) |
| [PR1](https://github.com/LeviEdition/invierno-en-la-colonia/pull/1) | `refactor/arquitectura` → `main`, **open/draft**, no fusionado |
| Issues del producto | **0 abiertos** al iniciar D0, #2–#13 cerrados en el alcance aprobado |

**Resultado estructural:** fusionar PR14 **no** modifica automáticamente `main`; modifica `refactor/arquitectura`. Posteriormente PR1 puede ofrecer el checkpoint integrado a `main` con aprobación independiente. Ninguna de estas fusiones se efectuó en D0.

## Divergencia A6: un commit detrás, pero contenido final reconciliado

GitHub `compare refactor/arquitectura...fix/estabilizacion-v9-9` devuelve **diverged: ahead 153, behind 1**, `merge_base=66ac8f61162979702f23ee833c74f6a24097c363`.

El commit exclusivo de la base `0933c70` elimina `docs/24-cierre-auditoria-a6.md` (informe duplicado). **La rama de estabilización eliminó independientemente ese mismo archivo** en `ca1d910af0ba582cfb5c01b997e7d0abbebc4972`. En **ambos extremos**:
- `docs/24-cierre-auditoria-a6.md` no existe;
- el documento canónico `docs/24-cierre-auditoria-y-prioridades.md` sí existe y su blob SHA es idéntico: `c132dd8e2a630b9feddd2c399955208fb1431624`.

**Conclusión:** el `behind 1` refleja caminos diferentes hacia el mismo contenido final en A6; **no es en sí un conflicto funcional ni hace necesario reescribir historia**. El listado de archivos de `compare` se calcula respecto del ancestro común y muestra la eliminación de A6 aunque el archivo **ya está eliminado en ambas ramas**. No interpretar ese listado como que el merge volverá a eliminar un documento que existe en la base. GitHub actualmente informa PR14 **mergeable/clean**, pero eso es una señal del servidor, no una prueba de integración ejecutada por nosotros.

## Superficie real del PR14

`compare` contabiliza **96 archivos** modificados con respecto al ancestro común, **153 commits**, unas **35 070 líneas añadidas y 325 eliminadas** (cuenta de diff de GitHub, incluye documentación/evidencias, no solo código):
- **68 archivos `docs/`**: ~32 614 líneas añadidas y 90 eliminadas, muy principalmente informes, JSON de evidencia y capturas binarias;
- **1 HTML ejecutable:** `invierno_colonia_v9_9.html`, **+452/−182 líneas**, 22 bloques de diff en CSS, estado, decisiones, turnos, IA, muerte, UI;
- **14 archivos `tests/`**: +1 187/−53 líneas; la caracterización y regresiones de C siguen juntas;
- **9 scripts**, **3 archivos `test-support/`**, **1 workflow** ajustado.
- `package.json` **sin cambios**: `npm test` ejecuta `node --test` sin dependencias instaladas obligatorias. Las pruebas de navegador especializadas **no** están incluidas en el CI Node ordinario.

**Riesgos de revisión:** volumen documental elevado, cambios de reglas preexistentes y UI en HTML monolítico, posibilidades de interacciones no cubiertas y dependencia de revisar la semántica de PR14 (C1–C16). No se detectaron en la comparación archivos del motor fuera del HTML ni cambios de dependencias; no equivale a revisión exhaustiva de las 153 confirmaciones.

## Evidencia de CI y alcance verdadero

**CI exacto en la punta inicial `951059e`:** [GitHub Actions 40703513314](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40703513314) `completed/success`, **408/408**, cero fail/skipped/TODO (logs del job leídos en D0). Los 40 recorridos de motor y cinco UI completos de C14/C15 siguen como evidencia histórica; no se repitieron en D0.

**Chromium real en C16:** [Actions 40695882583](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40695882583), tres viewports/78 pasos de teclado/0 errores de navegador en escenarios probados. **No es un gate automático permanente:** `.github/workflows/pruebas.yml` ejecuta solo Node sobre pushes a `main`, `refactor/**`, `fix/**`, y eventos `pull_request` cuyo destino sea `main`. PR14 orientado a `refactor/arquitectura` no recibe necesariamente un `pull_request` CI dedicado, pero los **pushes** a su rama sí corren npm test. C16 Chromium se ejecutó por workflow temporal ya retirado, y su script/evidencia permanecen versionados.

**Límites:** no hay Android físico/TalkBack, otros navegadores o pruebas humanas de balance; las adaptaciones de mesa y la selección F-14 son posteriores. No se ejecutó un merge de prueba ni se validó el árbol resultante como commit real: `mergeable=clean` es dato de GitHub, no test nuestro.

## Riesgos y medidas para integración

| Riesgo | Severidad | Medida propuesta |
| --- | --- | --- |
| Integrar en destino equivocado | Alto | Primero PR14 → `refactor/arquitectura`; PR1 → `main` **solo mediante revisión y autorización posteriores** |
| Tratar la divergencia documental como conflicto irresoluble | Bajo | Ambas ramas eliminaron el mismo duplicado; no forzar rebase ni reintroducir A6 |
| Aceptar CI de cabeza como CI del resultado fusionado | Medio | Tras cualquier merge, leer SHA de destino y reejecutar/confirmar CI 408/408 **sobre ese SHA**, más navegación de humo con los dos modos |
| Tamaño de 153 commits/96 archivos | Medio | Conservar trazabilidad de TDD y revisar los cambios ejecutables clave, tests y documentos canónicos; no aprobar solo por número de tests |
| Descripción del PR14 históricamente desactualizada | Bajo/Medio | **Actualizar texto antes de merge:** el cuerpo sigue afirmando que nueve issues están abiertos y que C no se ha cerrado; aclarar que C está aceptada, los issues cerrados y quedan reservas de publicación |
| PR1 pendiente de main | Alto de proceso | Revisar el alcance acumulado de PR1 una vez integradas C; no presentarlo como merge de la simple corrección C sin explicar auditoría y docs |
| Refactor D o ajustes F mezclados con integración | Alto | Congelar comportamientos C1–C16 como baseline, tratar D1 catálogo como PR pequeño **posterior** y separar cambios F de fidelidad del motor sin regla explícita |
| Compatibilidad/ergonomía sin probar físicamente | Reserva conocida | Marcar expresamente Android, lector, otros navegadores y balance humano como pendientes; no confundir con fallos nuevos |

## Recomendación y puerta de salida D0

**Dictamen: PR14 APTO PARA PROPONER UNA INTEGRACIÓN CONTROLADA en `refactor/arquitectura`, con condiciones.** No hay conflictos Git detectados ni un bloqueo de código demostrado por la divergencia de A6. Pero **no declaramos el merge aprobado** por existir una puerta de autorización explícita, necesidad de validar el resultado tras integrar y de actualizar metadatos desfasados.

**Secuencia recomendada, en tareas separadas:**
1. **D0 cerrado por análisis:** presentar el presente informe al creador, con riesgos, mapa PR14→refactor→PR1→main y condiciones.
2. **D0-I (si el creador lo aprueba):** refrescar descripción de PR14, revisar su diff de código, integrar **solo** PR14 en `refactor/arquitectura` mediante operación revisable, sin rebase forzado ni intervención en `main`; ejecutar CI y humo de Inicio, J1/J2 local, IA, dados, muerte/sucesión, encrucijada y final en navegador. Confirmar head SHA y que A6 canónico permanezca.
3. **Puerta de promoción:** revisar PR1 (que tendrá un alcance combinado) hacia `main`, comparar con baseline y tener aceptación independiente. Solo después evaluar la versión estable de referencia.
4. **D1 posterior:** seleccionar un módulo de bajo acoplamiento (catálogo de objetos propuesto en plan01) y refactorizar preservando comportamiento, con tests antes/después. No implementar F-14 ni Director de Juego durante la integración.

**No se autorizan ni se ejecutan aquí:** merge, PR listo para revisión, retargeting, rebase, force-push, actualización de código, issues, tags, releases o publicación. D0 modifica solo documentación de auditoría y tablero.
