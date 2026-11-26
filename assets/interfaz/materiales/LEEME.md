# Materiales de la interfaz (dirección «objetos a carbón»)

Texturas de color con el relieve ya horneado (luz rasante desde arriba a la izquierda), 1024×1024, **repetibles**, para los objetos de la interfaz decididos el 25/11/2026 (tablero «7 · Objetos a carbón» del lienzo de dirección de arte). Se usan **oscurecidas y desaturadas** por CSS para el tono a carbón; el color base no se toca en el archivo.

| Archivo | Objeto | Peso | Fuente | Licencia |
|---|---|---|---|---|
| `chapa-oxidada.webp` | Sin uso desde el informe 128 (la chapa pasó a galvanizada, generada por código) | 213 KB | TextureCan, «Corroded Iron Sheet with Rusty Scratches» (Metal 0022) — https://www.texturecan.com/details/196/ | CC0 1.0 |
| `carton.webp` | Cartón de la crisis | 53 KB | TextureCan, «Carton Box Cardboard Texture» (Paper 0025) — https://texturecan.com/details/513 | CC0 1.0 |
| `tablas-gastadas.webp` | Tablón de la barra de acción (recomendada) | 293 KB | Poly Haven, «Weathered Brown Planks» — https://polyhaven.com/a/weathered_brown_planks | CC0 1.0 |
| `tablon-crudo.webp` | Alternativa más clara (cajones, carteles) | 77 KB | Poly Haven, «Raw Plank Wall» (Dimitrios Savva) — https://polyhaven.com/a/raw_plank_wall | CC0 1.0 |

TextureCan y Poly Haven publican estas texturas bajo CC0: uso comercial, sin atribución obligatoria, redistribución permitida. Se deja el crédito igual.

## Cómo se generaron

25/11/2026, con Python (Pillow y NumPy), a partir de los paquetes 2K que entregó el creador. Los originales (paquetes 2K, archivos `.blend`, EXR) **no** están en el repositorio.

- TextureCan: color 2K reducido a 1024 px × luz `max(0, n·L)/L.z` del mapa de normales OpenGL con `L = (-0.45, 0.45, 0.77)` normalizado, normalizada a media 1 e intensidad 0,8, × oclusión ambiental (`0.6 + 0.4·AO`, normalizada).
- Poly Haven: color 2K reducido a 1024 px × la misma luz calculada desde el gradiente del mapa de desplazamiento (`disp`), intensidad 0,8.

Desde el [informe 128](../../../docs/128-interfaz-v2-sesion-8-ajustes.md) la chapa galvanizada, la lona y la manta se generan por código con semilla fija (`app/mapa/experiencia/carbon.mjs`), sin archivos.

Notas de uso: la chapa viene pintada de blanco con rayas de óxido; para el tono a carbón conviene `brightness` bajo y `saturate` alrededor de 0,6. El cartón viene liso: las marcas, la cinta y el marcador se dibujan encima.
