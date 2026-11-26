# Tipografías

Tipografías de la guía de estilo ([109](../../docs/109-guia-de-estilo.md), §3), autoalojadas. No se cargan desde Google Fonts ni de ningún otro servidor. El CSS está en `app/mapa/estilos/fuentes.css` y se usa con las variables `--fuente-titulo` y `--fuente-texto`.

| Familia | Uso | Pesos | Carpeta |
|---|---|---|---|
| Bitter | Títulos | 600, 700 | `bitter/` |
| Alegreya Sans | Texto | 400, 500, 700 | `alegreya-sans/` |
| Caveat | Lápiz (frases cortas) | 500, 700 | `caveat/` |
| Stardos Stencil | Esténcil | 700 | `stardos-stencil/` |
| Special Elite | Máquina de escribir | 400 | `special-elite/` |
| Permanent Marker | Marcador | 400 | `permanent-marker/` |

- **Origen:** paquetes npm `@fontsource/bitter` 5.3.0 y `@fontsource/alegreya-sans` 5.3.0 (Fontsource). Son los mismos archivos que sirve Google Fonts. Se descargaron el 23/11/2026 con `npm pack`; no son una dependencia del proyecto.
- **Formato:** woff2, en dos subconjuntos por peso: `latin` (incluye todo el español: ñ, tildes, ¿¡ y «») y `latin-ext`. Con `unicode-range`, el navegador baja solo el subconjunto que aparece en el texto.
- **Licencia:** SIL Open Font License 1.1. El texto completo, con el copyright de cada familia, está en `OFL.txt` dentro de cada carpeta.
- **Peso:** 10 archivos, 205 KB en total. Lo que se baja en la práctica son los cinco `latin` (≈109 KB).

## Sesión 8 (informe 127): dirección «objetos a carbón»

- **Origen:** `@fontsource/caveat`, `stardos-stencil`, `special-elite` y `permanent-marker`, 5.3.0, bajadas el 26/11/2026 con `npm pack`. No son una dependencia del proyecto.
- **Licencias:** Caveat y Stardos Stencil, SIL OFL 1.1 (`OFL.txt`); Special Elite y Permanent Marker, Apache 2.0 (`LICENSE-Apache-2.0.txt`).
- **Peso:** caveat 138 KB, stardos-stencil 14 KB, special-elite 77 KB, permanent-marker 29 KB. Lo que se baja en la práctica es el subconjunto latino de cada una.
- **Uso:** solo frases cortas, nunca reglas largas (guía 109, §8.1).
