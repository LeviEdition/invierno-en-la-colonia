# Recursos originales del nuevo escenario horizontal

**Originales recibidos el05/11/2026**, commit del creador `4f05c8f349c1973e0b786cf37d562a5685e6fca9`. Se conservaron nombres y bytes. El bloqueo del informe89 queda resuelto; la nueva entrada independiente es `app/mapa/escena/`.

Archivos comprobados, todos **1672×941**:

| Original recibido | Contenido |
| --- | --- |
| `Patio nevado con portón colonial.png` | Referencia completa/RGB,2576151 bytes. |
| `Mapa nevado sin vegetación-1.png` | Fondo/RGB,2300098 bytes. |
| `Árboles y arbustos nevados aislados-2.png` | Vegetación/RGBA,1951656 bytes, alfa0–255. |

[`manifest.json`](manifest.json) registra SHA-256, dimensiones, modo y commit de procedencia. No se necesitan renombres ni ZIP. El archivo completo se conserva como referencia de comparación; el producto carga fondo y vegetación, sin sumar innecesariamente la descarga de la referencia completa.

El encaje **no es exacto**: hay vegetación sobre algunas fachadas y píxeles de alfa bajo conectan grupos alejados. La escena restituye polígonos de edificios desde el mismo fondo, sin regenerarlos. Ocho grupos vegetales tienen regiones y bases editables; el resto permanece estático. Los derivados de luces/siluetas se construyen solo en memoria a partir de estos originales. No se elimina negro ni otro color para fabricar transparencia.

Configuración de presentación: [`scene.json`](../../app/mapa/escena/scene.json), [`environment.json`](../../app/mapa/escena/environment.json) y [`atmosphere.json`](../../app/mapa/escena/atmosphere.json). Las bases usan coordenadas del PNG; cambiar tamaño exige recalcular anclajes y polígonos, no cambiar reglas. No se reemplazó `kit_arte_h33/assets/mapa-prototipo.png`.

[Preparación histórica](../../docs/89-mapa-horizontal-ambientacion-preparacion.md) · [Entrega y reservas](../../docs/90-mapa-horizontal-ambientacion.md) · [Inicio local](../../app/mapa/README.md).

## Fondo aprobado — 09/11/2026

Activo: `nuevo mapa.png`, RGB1671×941, subido por el creador en dd13820. Se conserva íntegro; manifiesto con SHA/bytes. Los originales anteriores se mantienen para revertir. Este fondo incorpora vegetación: no superponer la capa aislada anterior. Véase `docs/94-integracion-fondo-aprobado.md`.

## Mapa en doble resolución — 17/11/2026

Activo: `mapa-2x.webp`, RGB **3342×1882**, 1 092 582 bytes, exactamente el doble de `nuevo mapa.png` (1671×941).

- **Origen:** ampliación 2× de `nuevo mapa.png` con Upscayl (modelo *digital-art-4x*), aprobada por el creador sin retoques. El PNG ampliado (`nuevo mapa_upscayl_2x_digital-art-4x.png`, 9 001 436 bytes, SHA-256 `66d18a69…174f`) **no entra al repositorio**; su SHA queda en el manifiesto.
- **Codificación:** WebP calidad 90 con sharp 0.34.4 (libwebp 1.6.0, effort 6). PSNR 39,6 dB frente al PNG ampliado.
- **Uso:** el mundo conserva su tamaño lógico 1671×941; la textura se dibuja a escala 0,5. Accesos, barricadas, zombis, retratos y rótulos siguen en coordenadas de `nuevo mapa.png`, que se conserva íntegro como referencia y para revertir (`previousActiveMap` en el manifiesto).
- **Zoom máximo:** 1,5 respecto del tamaño lógico (`maxZoom` en [`scene.json`](../../app/mapa/escena/scene.json)). A ese zoom, un píxel de la textura ocupa 0,75 píxel CSS.

Véase el informe 112.
