# Papel: fuentes reales para la textura de los paneles

Capas en escala de grises, **sin teñir**, para dar realismo al papel de los paneles (guía [109](../../../docs/109-guia-de-estilo.md), materiales). El color crema, el oscurecido de bordes y las manchas de sangre se aplican al integrarlas; estas capas solo aportan relieve y grano. Gris medio (128) = sin efecto: pensadas para mezclarse en modo *overlay* / *soft-light* o multiplicadas alrededor de 1.

| Archivo | Qué es | Tamaño | Peso | Repetible |
|---|---|---|---|---|
| `papel-arrugas.webp` | Relieve de papel arrugado con un pliegue horizontal: luz rasante desde arriba a la izquierda calculada sobre el mapa de normales, combinada con la oclusión ambiental | 1024×1024 | 17 KB | Sí (la fuente es repetible) |
| `papel-grano.webp` | Grano y motas de un escaneo real de papel viejo: paso alto (se quitaron las manchas grandes y lo que quedaba del texto borrado) | 1024×1024 | 168 KB | No: usar como fondo de un panel, no en mosaico |

## Origen y licencia

- **Arrugas:** «Unfolded and Crumpled Paper Texture with Crease Mark (Paper 0004)», TextureCan — https://www.texturecan.com/details/63/ . Mapas usados: `normal_opengl` y `ao` (2K). Licencia **CC0 1.0** (https://texturecan.com/terms): uso comercial, sin atribución obligatoria, redistribución permitida.
- **Grano:** «Old paper sheet texture», Yael Atletl Bueno Rojas (810), OpenGameArt — https://opengameart.org/content/old-paper-sheet-texture . La página la ofrece bajo varias licencias a elección; se usa bajo **CC0**. El autor pide, si se lo acredita, un enlace a su cuenta: se deja este crédito igual. Archivo recibido: `paper.jpg` 2007×2576; recorte 1090×1090 de la zona inferior derecha.

## Cómo se generaron

24/11/2026, con Python (Pillow y NumPy), a partir de los originales que entregó el creador. Los originales (14 MB y 2K) **no** están en el repositorio.

- Arrugas: normal OpenGL a 1024 px; `lambert = max(0, n·L)` con `L = (-0.45, 0.45, 0.77)` normalizado; `sombra = lambert / L.z × (0.55 + 0.45·AO)`; normalizado a media 1 y llevado a `128 + (sombra − 1)·128·1.4`.
- Grano: recorte (900, 1150)–(1990, 2240), reducido a 1024 px; `escaneo − desenfoque gaussiano(10)`, normalizado a desvío 14 alrededor de 128.
