# 58 — D1.0: caracterización del catálogo antes de extraerlo

**Fecha:** 28/10/2026. **Autorización:** crear rama desde `main`, agregar caracterización del catálogo y semillas deterministas, ejecutar verificaciones, auditar y documentar. **Exclusiones:** no extraer `ItemCatalog`, no cambiar reglas, no fusionar a `main`.

## Punto de partida y trazabilidad

- Rama de implementación: `refactor/d1-catalogo`, creada **desde `main` SHA `0b75d01aba013cd029d9d0dd0bdbd20791be15fc`**.
- Commit de pruebas: `6ccada45413dad93d1bcfe1330f95a3470b4f7c8`.
- La comparación `main...refactor/d1-catalogo` previa a la documentación mostró exactamente **un archivo nuevo**, `tests/catalogo-caracterizacion-d1.test.mjs` (+186, −0); ningún archivo de juego, scripts o workflow modificado.
- El ejecutable `invierno_colonia_v9_9.html` conserva **blob Git `d192afb43ab216d0b63ed49fd24f1d830d03f4e7`**, idéntico a `main`.
- **`main` verificada sin alteraciones**: `0b75d01aba013cd029d9d0dd0bdbd20791be15fc`. No hay PR creado ni merges, publicación, release o tag.

## Construcción de la línea de base

Archivo [tests/catalogo-caracterizacion-d1.test.mjs](../tests/catalogo-caracterizacion-d1.test.mjs). Usa el `fixture` compartido que ejecuta el **código real** de la V9.9 desde el único script del HTML. No reimplementa las mecánicas del juego.

- **Contrato testigo:** copias literales de `definitions`, `defaults` y `distribution` tomadas del HTML estable de `main`. Son un **oráculo fijo** intencional para detectar modificaciones posteriores, no datos alternativos utilizados en producción.
- **17 IDs:** metadatos íntegros de cada carta (nombre, tipo, icono, descripción, efecto y `amount` cuando corresponde), orden de IDs y campos.
- **8 categorías/aliases:** conservación de su prioridad y resolución; resolución de `cardId`, `kind`, entradas nulas y desconocidas, y preferencia de un `cardId` explícito incluso cuando es inválido.
- **Creación/visualización:** forma plana de `{kind,cardId,...meta}`, preservación de `finderId` y `usedRound`, excepción por carta desconocida, textos de `label` y su fallback.
- **Congelado histórico superficial:** `definitions`, `defaults` y `distribution` están `Object.freeze`; entradas anidadas no lo están. **No modificar todavía**.
- **6 localidades × 20 cartas (120):** multiplicidad de IDs y orden del mapa de cada mazo; leyenda agregada por tipo y ordenada.
- **Semillas de Fisher–Yates directo:** `0`, `1`, `2654435761`, `1401181143`. Un generador LCG32 **independiente en el test** y mezcla de referencia comparan los seis mazos **carta por carta y en orden**, no solo cantidades. Después verifican que el siguiente `Math.random()` coincide, protegiendo el número de extracciones (19 por localidad).
- **Partidas iniciales:** semillas `1`, `2654435761`, `1401181143` en cada modo (`ai` y `local`): comparación de objetivo seleccionado, dos manos iniciales y **los seis mazos completos**. Se comprueba un RNG consumido para objetivo antes de mezclar.

**Total: 20 subpruebas nuevas**, dentro de la suite Node.

## CI comprobada

- [GitHub Actions 40719277668](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40719277668), rama `refactor/d1-catalogo`, commit **`6ccada45413dad93d1bcfe1330f95a3470b4f7c8`**, job `122925409445`: `completed/success`.
- Logs leídos: **428 tests, 428 pass, 0 fail, 0 cancelled, 0 skipped, 0 todo**.
- Baseline previa de `main`: 408 pruebas; incremento neto 20, sin modificarse el código del juego.

## Auditoría crítica / límites de cobertura

1. **Lo que sí fijamos:** definiciones y textos, defaults, metadatos, distribución/leyendas, forma de cartas, comportamiento de error, secuencias de mazos y consumo de RNG durante `catalog.deck` e inicialización de `create()`, para semillas declaradas y ambos modos.
2. **Contrato heredado delicado:** los `meta` de `create(id,meta)` pueden incluso reemplazar `cardId` y `kind` por el orden del spread. Caracterización **no significa aprobación de diseño**: corregirlo exigiría decisión separada y tests revisados.
3. **Congelado superficial:** las propiedades anidadas son mutables; se registra para que D1.1 no cambie la semántica silenciosamente.
4. **Aleatoriedad:** no se prueba toda semilla posible ni se demuestra distribución estadística; la secuencia de referencia usa cuatro semillas y orden completo de cada mazo.
5. **Límites:** no se volvió a ejecutar Chromium ni Android físico, porque D1.0 agregó exclusivamente pruebas. Las pruebas anteriores [Chromium 40713131565](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40713131565) verificaron el mismo HTML antes de D1.0. La extracción/packaging/HTML offline y pruebas unitarias puras de catálogo **corresponden a D1.1–D1.3**, no están hechas.
6. Los tests dependen todavía del script monolítico a través del fixture y por eso **no** prueban independencia arquitectónica: ese es justamente el cambio pendiente de D1.1.

## Dictamen y puerta

**D1.0 CERRADA CONFORME A SU ALCANCE.** La línea base es útil para detectar desviaciones del catálogo, del barajado y de la partida inicial, con **428/428** aprobadas y `main` intacta.

**ÚNICA PRÓXIMA TAREA PROPUESTA:** D1.1, **solo tras autorización expresa**: extraer fuente del catálogo y ensamblado determinista conservando un único HTML autocontenido, sin mover `ItemEngine`, modificar reglas, política IA, modo local ni el Director de Juego. No fusionar sin auditoría y aprobación posteriores.
