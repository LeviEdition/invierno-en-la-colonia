# Recursos originales del nuevo escenario horizontal

**Originales recibidos el05/11/2026**, commit del creador `4f05c8f349c1973e0b786cf37d562a5685e6fca9`. Se conservaron nombres y bytes. El bloqueo del informe89 queda resuelto; la nueva entrada independiente es `prototypes/horizontal-map/`.

Archivos comprobados, todos **1672×941**:

| Original recibido | Contenido |
| --- | --- |
| `Patio nevado con portón colonial.png` | Referencia completa/RGB,2576151 bytes. |
| `Mapa nevado sin vegetación-1.png` | Fondo/RGB,2300098 bytes. |
| `Árboles y arbustos nevados aislados-2.png` | Vegetación/RGBA,1951656 bytes, alfa0–255. |

[`manifest.json`](manifest.json) registra SHA-256, dimensiones, modo y commit de procedencia. No se necesitan renombres ni ZIP. El archivo completo se conserva como referencia de comparación; el producto carga fondo y vegetación, sin sumar innecesariamente la descarga de la referencia completa.

El encaje **no es exacto**: hay vegetación sobre algunas fachadas y píxeles de alfa bajo conectan grupos alejados. La escena restituye polígonos de edificios desde el mismo fondo, sin regenerarlos. Ocho grupos vegetales tienen regiones y bases editables; el resto permanece estático. Los derivados de luces/siluetas se construyen solo en memoria a partir de estos originales. No se elimina negro ni otro color para fabricar transparencia.

Configuración de presentación: [`scene.json`](../../prototypes/horizontal-map/scene.json), [`environment.json`](../../prototypes/horizontal-map/environment.json) y [`atmosphere.json`](../../prototypes/horizontal-map/atmosphere.json). Las bases usan coordenadas del PNG; cambiar tamaño exige recalcular anclajes y polígonos, no cambiar reglas. No se reemplazó `kit_arte_h33/assets/mapa-prototipo.png`.

[Preparación histórica](../../docs/89-mapa-horizontal-ambientacion-preparacion.md) · [Entrega y reservas](../../docs/90-mapa-horizontal-ambientacion.md) · [Inicio local](../../prototypes/horizontal-map/README.md).

## Fondo aprobado — 09/11/2026

Activo: `nuevo mapa.png`, RGB1671×941, subido por el creador en dd13820. Se conserva íntegro; manifiesto con SHA/bytes. Los originales anteriores se mantienen para revertir. Este fondo incorpora vegetación: no superponer la capa aislada anterior. Véase `docs/94-integracion-fondo-aprobado.md`.
