# 71 — Integración en main y cierre de D1/D2

**Fecha:** 29/10/2026 (America/Montevideo).

**Resultado:** D1 y D2 integradas y validadas en main mediante el PR #15. El creador aprobó expresamente la integración después de la revisión independiente de ChatGPT. **Hito 1 cerrado. El próximo paso es preservar formalmente la referencia modular; todavía no se creó tag, release ni rama del juego propio.**

## 1. Autorización y comprobaciones antes de fusionar

Se exigió el head exacto `7f3ac7c813fb3bf392595a6e5db13397c4d8f427` y que main continuara en `0b75d01aba013cd029d9d0dd0bdbd20791be15fc`. Antes de ejecutar se consultaron otra vez el PR, la referencia remota de main, mergeabilidad y todos los checks: OPEN, no draft, MERGEABLE/CLEAN, seis checks SUCCESS y árbol local limpio. No se sustituyó esa autorización por una aprobación automática ni por una revisión distinta.

Se usó el endpoint de merge de GitHub con `sha` igual al head autorizado y `merge_method=merge`; no squash ni rebase. [PR #15 fusionado](https://github.com/LeviEdition/invierno-en-la-colonia/pull/15).

## 2. Commit de integración comprobado

- **Merge:** `6b8bfcadfeb99d16a10b6f4576f3b061584ee1f9`.
- **Padre 1:** `0b75d01aba013cd029d9d0dd0bdbd20791be15fc` — main anterior.
- **Padre 2:** `7f3ac7c813fb3bf392595a6e5db13397c4d8f427` — head aprobado.
- **Árbol integrado:** `cd43af6298971bf5d433546fa557f2671ef8c16b`, idéntico al árbol del head aprobado. Ningún cambio adicional de código o documentación entró en el merge.
- **Oráculo:** `57872ee279e924460a126aecbcd0ee7141b5e078` comprobado como ancestro de main. La historia quedó conservada, independientemente de la existencia de ramas experimentales.

Después se hizo checkout de main desde origin/main y se ejecutó la validación sobre ese commit real, no solo sobre el head del PR o el merge sintético de sus checks. El commit posterior de cierre actualiza únicamente documentación y README; se distingue del merge y no cambia el ejecutable. Su SHA final y checks quedan asociados a la revisión actual de main y se comprueban antes de entregar.

## 3. Pruebas posteriores al merge

| Comprobación en 6b8bfca | Resultado |
| --- | --- |
| npm ci local y CI | Aprobado, lockfile y esbuild fijados |
| npm run check:build | Aprobado, HTML reproducible byte a byte |
| npm test local y CI | **467/467**, cero fallos, omisiones o cancelaciones |
| Comparación contra 57872ee | **40/40 registros iguales**, suite histórica 451/451 |
| Comparación directa contra V9.9/main anterior 0b75d01 | **40/40 registros iguales**, suite histórica 408/408 |
| Chromium QA | Cinco partidas completas, sin errores JS ni invariantes rotas |
| Chromium producto | Cinco reproducciones de los clics reales, mismos recursos/objetivo/resultado visibles |
| Interfaz del producto | 320×640, 393×852 y 1365×768; dados ≥44×44, selección, menús y sin overflow horizontal |
| C16 foco/teclado | 3/3 tamaños |
| Inicio/pase | 6/6 casos |
| C11 táctil | 6/6 tamaños, estados y solapamientos comprobados |
| C12/C13/issue7/terminal vigente | 6/6, 6/6, 16/16 y 6/6 |
| file:// sin red en CI | 4/4: producto/QA y local/IA, sin recursos de red |
| Workflow histórico D0 actualizado | Cinco partidas QA y foco C16 adicionales aprobados |

Los cuarenta casos son veinte semillas por modo, repetidos contra cada referencia. La igualdad compara el registro completo del harness (resultados, trazas, acciones, mensajes y eventos); solo excluye los metadatos source. No se normalizó el orden de microtareas ni se cambiaron reglas para obtener igualdad.

Las cinco partidas de Chromium mantienen los resultados previos: IA2654435761 victoria R4; IA1401181143 derrota por moral R6; local2654435761 victoria R2; local3816266512 derrota por moral R4; local3189639203 victoria R3. No se codificaron excepciones por nombre o semilla.

## 4. GitHub Actions sobre el merge real

Todos corresponden exactamente a `6b8bfcadfeb99d16a10b6f4576f3b061584ee1f9`:

- [Regresión40902075722](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40902075722): **success**.
- [Arquitectura40902075714](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40902075714): **success**, jobs engine y browser.
- [Chromium postintegración40902075817](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40902075817): **success**.

Artifacts descargados y cotejados con los archivos locales: HTML producto SHA256 `43b8883ad4821e4b50c40791615c5ef6c0b3030476409b4e1c6da4dbd872d692`, idéntico al de la rama aprobada y al abierto en CI. Los quince módulos compartidos por producto/QA coinciden con sus fuentes. Capturas completas disponibles en los artifacts de Actions.

[Evidencia estructurada de integración](evidencias/d1d2-integracion-main.json): preflight, padres, igualdad de árboles, suites, digests, semillas, resultados, geometría, offline y hashes. No se reescriben las evidencias anteriores de los informes67–70.

## 5. SP-03 preservado

`docs/63-hoja-de-ruta-planificacion-singleplayer.md` tiene el mismo blob Git en el head aprobado y en el merge: `c9f931dc1df295bdbebd8f509bd1c9645f58c4d7`. El cierre documental tampoco modifica ese archivo: toda la planificación queda preservada byte a byte.

Se conservan como acuerdos conceptuales la base V9.9, las tres categorías narrativas, campaña reactiva y la cronología de encrucijadas condicionadas —máximo una por ronda, sin cancelación retroactiva—. El ciclo completo, los Encuentros reutilizables, su frecuencia/prioridades y las contingencias de muerte continúan con sus estados de propuesta o pendiente. No se aprobaron mecánicas nuevas por integrar documentación.

## 6. Cierre, riesgos y límite del siguiente paso

**D1/D2 cerradas:** arquitectura integrada, aceptada por el creador y validada sobre main. No continuar un refactor genérico para perfeccionar el futuro singleplayer. El paquete V9.9 sigue representando dos grupos y existe un contexto interno de compatibilidad; son reservas de mantenimiento aceptadas, no autorización de nuevas mecánicas.

Persisten las limitaciones ya declaradas: VM en fixtures históricos, emulación Chromium sin Android físico/TalkBack ni otros navegadores, balance con jugadores humanos y regresión finita (no demostración universal para todos los estados). Los callbacks y globals de QA no se publican en el HTML de producto.

La preservación formal todavía requiere elegir y autorizar su identificación y alcance. **No se creó tag, release, versión oficial ni rama del juego propio.** No se modificaron reglas, dados, IA, crisis, objetivos, balance o narrativa jugable.

**Única siguiente tarea:** preservar formalmente esta referencia modular después de revisar estos resultados y autorizar ese paso. Detenerse aquí; no iniciar el juego propio.

Si fuera necesario retirar la integración, la propuesta histórica sigue siendo `git revert -m 1 <SHA-del-merge>` en una rama de corrección, comprobando parent1 y revisando conflictos. El cierre posterior es un commit documental separado: debe evaluarse también al revertir. No se ejecutó ningún revert ni reset.
