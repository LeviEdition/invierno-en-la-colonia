# Tipografías

Tipografías de la guía de estilo ([109](../../docs/109-guia-de-estilo.md), §3), autoalojadas. No se cargan desde Google Fonts ni de ningún otro servidor. El CSS está en `app/mapa/estilos/fuentes.css` y se usa con las variables `--fuente-titulo` y `--fuente-texto`.

| Familia | Uso | Pesos | Carpeta |
|---|---|---|---|
| Bitter | Títulos | 600, 700 | `bitter/` |
| Alegreya Sans | Texto | 400, 500, 700 | `alegreya-sans/` |

- **Origen:** paquetes npm `@fontsource/bitter` 5.3.0 y `@fontsource/alegreya-sans` 5.3.0 (Fontsource). Son los mismos archivos que sirve Google Fonts. Se descargaron el 23/11/2026 con `npm pack`; no son una dependencia del proyecto.
- **Formato:** woff2, en dos subconjuntos por peso: `latin` (incluye todo el español: ñ, tildes, ¿¡ y «») y `latin-ext`. Con `unicode-range`, el navegador baja solo el subconjunto que aparece en el texto.
- **Licencia:** SIL Open Font License 1.1. El texto completo, con el copyright de cada familia, está en `OFL.txt` dentro de cada carpeta.
- **Peso:** 10 archivos, 205 KB en total. Lo que se baja en la práctica son los cinco `latin` (≈109 KB).
