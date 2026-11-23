# Materiales de la interfaz

Texturas para la interfaz v2 (guía de estilo [109](../../docs/109-guia-de-estilo.md), §8).

| Archivo | Uso |
|---|---|
| `chapa.jpg` | Chapa corrugada y oxidada (768×320). Barras y marcos. Mostrarla en mosaico a la mitad de su tamaño (`384px 160px`) para que se vea nítida; nunca estirada |
| `nieve.png` | Borde de nieve acumulada (1200×60, con transparencia). Desde el informe 122 ya no se usa en los paneles: la nieve queda en el mapa |
| `papel/papel-grano.png` | Grano y fibra finos del papel viejo (128×128, gris), en mosaico y multiplicado sobre el tono |
| `papel/papel-barra.png`, `papel-tarjeta.png`, `papel-ficha.png` | Tono del papel por variante (crema que oscurece hacia los bordes, con un pliegue). Baja resolución, estirados al tamaño del panel |
| `papel/sangre-*.png` | Manchas de sangre seca, una por tipo de panel, en capa aparte (`.mancha`, posiciones en `app/mapa/estilos/manchas.css`) |
| `pinos-izq.png`, `pinos-der.png`, `pinos-abajo.png` | Recortes de `assets/mapa-horizontal/Árboles y arbustos nevados aislados-2.png`. Decoración en esquinas de paneles, con moderación |

`chapa.jpg` y `nieve.png` se generaron por código el 17/11/2026; los pinos son recortes del arte aprobado. La carpeta `papel/` la genera `node scripts/generar-papel.mjs` (determinista, con semilla; `--check` comprueba que esté al día): 8 archivos, 35,8 KB.
