# 72 — Preservación formal de la referencia modular V9.9

**29/10/2026, Montevideo. Hitos 1 y 2 cerrados: D1/D2 integradas y referencia publicada, recuperable y reproducible.** El creador autorizó expresamente tag anotado, release, verificaciones y documentación. No se modificaron reglas ni SP-03, ni se inició el juego propio.

## Commit seleccionado y publicación

La comprobación remota confirmó `main` limpio en **`62e4e85150b2416ccf07d671c186b5c421993b0b`**, sin commits posteriores al cierre71 ni tags/releases previos. Se elige ese commit porque incluye el cierre D1/D2, tiene CI exacto aprobado y su código coincide con la integración validada. El merge convencional anterior es `6b8bfcadfeb99d16a10b6f4576f3b061584ee1f9`; el oráculo `57872ee279e924460a126aecbcd0ee7141b5e078` continúa siendo ancestro.

| Referencia | Valor comprobado |
| --- | --- |
| Tag anotado publicado | [`v0.9.9-referencia-modular`](https://github.com/LeviEdition/invierno-en-la-colonia/tree/v0.9.9-referencia-modular) |
| Objeto de tag | `0fdb214612486f4cc46c1acb444390de963d05e8`; anotado, sin firma criptográfica |
| Commit destino | `62e4e85150b2416ccf07d671c186b5c421993b0b`, confirmado mediante Git remoto y API |
| Release pública | [V9.9 — Referencia estable y modular](https://github.com/LeviEdition/invierno-en-la-colonia/releases/tag/v0.9.9-referencia-modular), ID428084796, sin borrador ni prerelease |
| Publicación | 29/10/2026 13:06 Montevideo, `2026-10-29T16:06:00Z` |
| Producto offline | `invierno_colonia_v9_9.html`, **225283 bytes** |
| SHA-256 del producto descargado | **`43b8883ad4821e4b50c40791615c5ef6c0b3030476409b4e1c6da4dbd872d692`** |
| Manifiesto adjunto | `manifest-v0.9.9-referencia-modular.json`, 300 bytes; [copia versionada](evidencias/manifest-v0.9.9-referencia-modular.json) |
| SHA-256 del manifiesto descargado | `2dc121b1bb29b3e80d08626e0dfd7a1c2b1335289df1dd4ad55b9bd449d6fddc` |

Ambos adjuntos descargados coinciden **byte a byte** con los archivos preparados desde el build limpio. El manifiesto identifica archivo, hash, tamaño y commit. Solo se publicaron esos dos adjuntos: ningún HTML ni adaptador QA.

Los commits posteriores de automatización y documentación quedan fuera del tag. `c46f13fdd3f71cecc12db60cf60aae2a95898b1c` agrega la automatización y el registro de publicación en curso; este informe se actualiza después con el resultado. El SHA del documento final se obtiene del historial y de la entrega, evitando la referencia circular a su propio commit. No se movió, reemplazó ni borró ninguna referencia publicada.

## Pruebas nuevas y evidencia reutilizada

| Origen | Comprobación | Resultado |
| --- | --- | --- |
| Ejecución nueva, checkout limpio62 | `npm ci`; `check:build`; `npm test`; `build`; `check:build` | **467/467**, cero fallos/omisiones/cancelaciones; archivos versionados intactos |
| Ejecución nueva, checkout independiente desde el tag recuperado del remoto | `npm ci`; `build`; `check:build`; comparación byte a byte | Mismo HTML y hash, sin modificar fuentes |
| Ejecución nueva | Inspección del producto y manifiesto | Sin `testBindings`, `__test`, `eval` o `with`; solo producto y manifiesto preparados |
| Ejecución nueva en runner | [Publicación40908114721](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40908114721), workflow de `c46f13f` que hace checkout del **código62** | **success**: instalación/build/check y **467/467**; tag, ascendencia, hash y CI previo comprobados |
| Ejecución nueva en runner | Descargas antes y después de publicar | Ambos adjuntos idénticos; HTML hash43b8883a…; [evidencia estructurada](evidencias/v099-preservacion.json) |
| Ejecución nueva local tras publicación | `gh release download`, SHA-256 y `cmp` de ambos adjuntos | Ambos idénticos al build y al manifiesto preparados; misma huella que declara GitHub |
| CI exacto62 reutilizado | [40903853822](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40903853822), regresión | success; estado y SHA consultados nuevamente |
| CI exacto62 reutilizado | [40903853712](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40903853712), motor y navegador | success; artifacts contrastados con el producto preservado |
| Artifacts del mismo CI | 40 partidas contra57872ee y 40 contra0b75d01 | **40/40 iguales por referencia**; suites históricas451/451 y408/408; solo se excluyen hashes de fuentes |
| Artifacts del mismo CI | Cinco partidas QA y reproducción de esas mismas cinco entradas sobre producto | Completadas, sin errores JS ni invariantes rotas; no son diez escenarios independientes |
| Artifacts del mismo CI | Producto en320×640,393×852,1365×768; foco/pase/dados/sucesiones/integración/encrucijadas/finales | Compuertas aprobadas; geometría táctil también medida en producto; otros estados preparados usan QA separado |
| Artifacts del mismo CI | `file://`, red desactivada, producto y QA × local/IA | **4/4**; las dos aperturas de producto registran el mismo hash43b8883a… que el adjunto |

Local: Node24.19.0, npm11.9.0; CI de referencia: Node22, Chromium143.0.7499.4. D1.0/D1.1 se conservan dentro de la suite actual, sin reducir cobertura. Las partidas automatizadas son regresión finita, no demostración universal de equivalencia. Las compuertas de navegador/offline se **reutilizaron**, no se presentan como ejecuciones nuevas de este encargo.

El CI de los commits posteriores de publicación/documentación se consulta por el SHA exacto de `main` antes de entregar, además del CI inmutable62. Sus resultados quedan en Actions y en la entrega final; no se incorpora al documento el SHA de su propio commit ni se confunde con el destino del tag.

## Incidencia resuelta y automatización acotada

El push del tag y la API funcionaron. `gh release create` creó el borrador, pero la subida a `uploads.github.com` recibió **HTTP401 Bad credentials**. `gh release upload` volvió a fallar, también fuera del sandbox. Se conservó el tag y no se publicó una release vacía. No se cambiaron ni expusieron credenciales.

La solución fue `.github/workflows/preserve-v099-reference.yml`: tarea exclusivamente manual, sin entradas configurables y con serialización de ejecuciones. Usa la credencial propia del runner, con permisos de contenido/escritura y acciones/lectura, sin secretos nuevos. Se restringe al commit62, tag/objeto0fdb2146 y release428084796 ya existentes; no crea ni mueve tags. Reconstruye el producto y ejecuta467 pruebas; exige ambos CI históricos aprobados y comprueba el hash y la ausencia de QA. Solo sube adjuntos faltantes; descarga y compara los que ya existan, sin reemplazarlos. Verifica descargas antes de publicar el borrador y después de publicarlo.

[Run40908114721](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40908114721) terminó **success**, publicó los dos adjuntos y conservó el resultado JSON, HTML y manifiesto en el artifact `v099-reference-publication-40908114721`, descargado e inspeccionado. La descarga local posterior también fue correcta. La credencial de subida local sigue siendo una limitación del entorno; no afecta la referencia publicada ni su recuperación. El workflow queda limitado a esta referencia, no como publicador genérico de futuras versiones.

Dos incidencias auxiliares se conservan como evidencia: la consulta opcional de permisos de Actions devolvió403 por el alcance de la integración, sin modificar configuración; el primer dispatch devolvió404 durante el registro del nuevo workflow y el segundo se ejecutó correctamente. No son fallos del juego. Si una reejecución encuentra un adjunto distinto o inesperado, debe detenerse para revisión; nunca usar `--clobber`, mover el tag o reemplazar referencias publicadas.

## Recuperar y reconstruir

Para jugar: descargar **el HTML adjunto** desde la release y abrirlo directamente en Chromium mediante «Abrir archivo» o doble clic. No requiere servidor, Node ni Internet durante la partida. Conserva los modos local y contra IA. No distribuir `dist/invierno-test.html` ni `dist/reference-test-runtime.js` como producto.

Para reconstruir: Git, Node22 o posterior y npm; acceso al registro para instalar. El lockfile fija esbuild0.28.2.

```sh
git clone https://github.com/LeviEdition/invierno-en-la-colonia.git
cd invierno-en-la-colonia
git checkout --detach v0.9.9-referencia-modular
git rev-parse HEAD
# 62e4e85150b2416ccf07d671c186b5c421993b0b
npm ci
npm run check:build
npm test
npm run build
npm run check:build
node --input-type=module -e "import{readFileSync}from'node:fs';import{createHash}from'node:crypto';console.log(createHash('sha256').update(readFileSync('invierno_colonia_v9_9.html')).digest('hex'))"
```

El hash debe coincidir con el manifiesto publicado. `npm test` genera su adaptador separado automáticamente. `npm run test:poc` es la comparación opcional de40 partidas con57872ee y requiere historial completo: un ZIP de fuentes de GitHub no basta. La recuperación se verificó en un worktree independiente del tag remoto con instalación limpia y en el runner con checkout e historial completo. Las notas de la release contienen los requisitos y comandos reales, pruebas y reservas. El README del tag es histórico anterior a la publicación; la documentación posterior explica el cierre sin alterar el tag.

## Reservas, revisión crítica y cierre

Reservas aceptadas: contexto de compatibilidad amplio, esquema V9.9 de dos grupos, VM solo en fixtures históricos/QA; Android físico, TalkBack, otros motores y balance humano sin validar. El Chromium administrado local bloquea `file://`; se reutiliza evidencia UbuntuCI del SHA exacto, sin alterar políticas. No se afirma equivalencia reglamentaria completa con Dead of Winter ni se programan diferencias aceptadas.

La revisión crítica comprobó los puntos de riesgo propios de esta preservación: código62 separado de documentación posterior; producto en lugar de QA; tag anotado remoto y ascendencia; reconstrucción independiente; descarga real en lugar de confiar en la respuesta de subida; detención ante adjuntos inesperados o distintos; publicación sin reemplazar referencias. **No se detectó defecto funcional nuevo dentro de esta cobertura.** No constituye una nueva auditoría general de fidelidad ni una revisión por otro agente.

**Archivos cambiados:** README; documentos01,18,25,62; este informe72; manifiesto y evidencia JSON en `docs/evidencias/`; workflow manual de preservación. Informes anteriores conservados; módulos, plantilla, HTML de producto, dependencias y pruebas intactos.

**Hito1:** cerrado por la integración y validación71. **Hito2/preservación:** cerrado con publicación y descarga verificadas. SP-03/63 permanece byte a byte idéntico (blob `c9f931dc1df295bdbebd8f509bd1c9645f58c4d7`); no se incorporan nuevos acuerdos narrativos de otro chat. El próximo trabajo será **diseño SP-03, ciclo de ronda, seguido de SP-04, balance de un solo grupo**, en una entrega separada. Ninguna implementación, rama del juego propio, narrativa jugable o nueva refactorización está autorizada por este cierre.
