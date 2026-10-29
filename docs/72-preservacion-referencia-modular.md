# 72 — Preservación formal de la referencia modular V9.9

**29/10/2026, Montevideo. Estado: publicación en curso; no declarar cerrado el hito2 hasta verificar los adjuntos públicos.** Autorización explícita del creador para tag anotado, release, comprobaciones y documentación. Sin cambios de mecánicas ni SP-03.

## Commit seleccionado y referencias

La comprobación remota confirmó main limpio en **`62e4e85150b2416ccf07d671c186b5c421993b0b`**, sin commits posteriores al cierre71 ni tags/releases previos. Se elige ese commit porque incluye el cierre D1/D2, tiene CI exacto aprobado y su código coincide con la integración validada. El merge convencional anterior es `6b8bfcadfeb99d16a10b6f4576f3b061584ee1f9`; el oráculo `57872ee279e924460a126aecbcd0ee7141b5e078` continúa siendo ancestro.

- Tag anotado publicado: [`v0.9.9-referencia-modular`](https://github.com/LeviEdition/invierno-en-la-colonia/tree/v0.9.9-referencia-modular).
- Objeto de tag: `0fdb214612486f4cc46c1acb444390de963d05e8`; destino62e4e851 confirmado mediante Git remoto y API. Anotado, sin firma criptográfica.
- Release preparada: «V9.9 — Referencia estable y modular», ID428084796, **en borrador**. [URL prevista al publicar](https://github.com/LeviEdition/invierno-en-la-colonia/releases/tag/v0.9.9-referencia-modular), no afirmar acceso público antes de publicarla.
- Producto: `invierno_colonia_v9_9.html`, **225283 bytes**.
- SHA-256: **`43b8883ad4821e4b50c40791615c5ef6c0b3030476409b4e1c6da4dbd872d692`**.
- [Manifiesto preparado](evidencias/manifest-v0.9.9-referencia-modular.json) y[evidencia estructurada](evidencias/v099-preservacion.json).

Los commits posteriores de automatización y documentación quedan fuera del tag. No se intenta incluir el SHA del propio documento; el SHA62 anterior identifica exclusivamente el código preservado. No se movió, reemplazó ni borró ninguna referencia publicada.

## Pruebas nuevas y evidencia reutilizada

| Origen | Comprobación | Resultado |
| --- | --- | --- |
| Ejecución nueva, checkout limpio62 | npm ci; check:build; npm test; build; check:build | **467/467**, cero fallos/omisiones/cancelaciones; archivos versionados intactos |
| Ejecución nueva, checkout independiente desde el tag recuperado del remoto | npm ci; build; check:build; comparación byte a byte | Mismo HTML yhash, sin modificar fuentes |
| Ejecución nueva | Inspección del producto y manifiesto | Sin `testBindings`, `__test`, `eval` o `with`; solo HTML de producto ymanifiesto preparados |
| CI exacto62 reutilizado | [40903853822](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40903853822), regresión | success |
| CI exacto62 reutilizado | [40903853712](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40903853712), motor y navegador | success; estado/head consultados nuevamente |
| Artifacts del mismo CI | 40 partidas contra57872ee y40 contra0b75d01 | 40/40 iguales por referencia; suites históricas451/451 y408/408; solo se excluyen hashes de fuentes |
| Artifacts del mismo CI | Cinco partidas QA yreproducción de esas mismas cinco entradas sobre producto | Completadas, sin errores JS ni invariantes rotas; no son diez escenarios independientes |
| Artifacts del mismo CI | Producto en320×640,393×852,1365×768; foco/pase/dados/sucesiones/integración/encrucijadas/finales | Compuertas aprobadas; geometría táctil yotros recorridos usan QA separado |
| Artifacts del mismo CI | `file://`, red desactivada, producto yQA × local/IA | 4/4; las dos aperturas de producto registran exactamente el hash43b8883a… del build nuevo |
| Pendiente | Descargar adjuntos públicos ycomparar sus bytes/hash | No ejecutada: subida local bloqueada; se prepara ejecución en runner |

Local: Node24.19.0, npm11.9.0; CI de referencia: Node22, Chromium143.0.7499.4. D1.0/D1.1 se conservan dentro de la suite actual, sin reducir cobertura. Las partidas automatizadas son regresión finita, no demostración universal de equivalencia.

## Incidencia y solución acotada de publicación

El push del tag yla API funcionaron. `gh release create` creó el borrador, pero la subida a `uploads.github.com` recibió **HTTP401 Bad credentials**. `gh release upload` volvió a fallar, también fuera del sandbox. El borrador quedó sin adjuntos yno se publicó vacío. No se cambiaron credenciales ni se ocultó el fallo.

Se añade `.github/workflows/preserve-v099-reference.yml`, exclusivamente manual, sin entradas configurables ycon serialización de ejecuciones. Usa la credencial propia del runner, permisos de contenido/escritura yacciones/lectura, sin secretos nuevos. Se restringe al commit62, tag/objeto0fdb2146 yrelease428084796 ya existentes; no crea ni mueve tags. Reconstruye el producto y ejecuta467 pruebas; exige ambos CI históricos success; comprueba hash/sin QA. Solo sube adjuntos faltantes yverifica bytes de cualquier adjunto existente sin reemplazarlo. Descarga antes de publicar el borrador ydespués de publicarlo; conserva evidencia JSON ylos dos archivos en un artifact.

Si esa vía falla, conservar el tag yborrador, registrar el error ydetener la publicación; no declarar cerrada la preservación. No hay cambio de reglas ni refactorización del juego por esta automatización. La consulta opcional de configuración de permisos de Actions devolvió403 por el alcance de la integración; no se modificó configuración del repositorio.

## Recuperar y reconstruir

Para jugar cuando esté publicado: descargar **el HTML adjunto**, abrirlo directamente con Chromium mediante «Abrir archivo» odoble clic; sin servidor, Node ni Internet durante la partida. Modos local ycontra IA. No distribuir `dist/invierno-test.html` ni `dist/reference-test-runtime.js`.

Para reconstruir: Git, Node22 oposterior ynpm; acceso al registro para instalar. El lockfile fija esbuild0.28.2.

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

El hash debe coincidir con el manifiesto. `npm test` genera su adaptador separado automáticamente. `npm run test:poc` es la comparación opcional de40 partidas con57872ee yrequiere historial completo: un ZIP de fuentes de GitHub no basta. Las notas preparadas en el borrador incluyen estas instrucciones, pruebas yreservas reales. El README del tag es histórico anterior a la publicación; este informe posterior explica el cierre sin alterar el tag.

## Reservas, revisión crítica y cierre

Reservas aceptadas: contexto de compatibilidad amplio, esquema V9.9 de dos grupos, VM solo enfixtures históricos/QA; Android físico, TalkBack, otros motores ybalance humano sin validar. El Chromium administrado local bloquea `file://`; se reutiliza evidencia UbuntuCI del SHA exacto, sin alterar políticas. No se afirma equivalencia reglamentaria completa con Dead of Winter ni se programan diferencias aceptadas.

Revisión crítica de preservación: distinguir código62 de documentación posterior; verificar producto en vez deQA; comprobar tag anotado remoto yascendencia; descarga real en vez de confiar solo en la respuesta de subida; fallar ante adjuntos inesperados odistintos; no reemplazar referencias existentes. **Pendiente el resultado de ejecución del workflow yla descarga pública.**

**Hito1:** cerrado por la integración yvalidación71. **Hito2/preservación:** en curso, no cerrado todavía. SP-03/63 permanece byte a byte idéntico (blob `c9f931dc1df295bdbebd8f509bd1c9645f58c4d7`); no incorporar nuevos acuerdos narrativos de otro chat. El siguiente trabajo, una vez cerrada la preservación, será **diseño SP-03, ciclo de ronda, seguido de SP-04, balance de un solo grupo**; ninguna implementación, rama del juego propio, narrativa jugable onueva refactorización está autorizada aquí.
