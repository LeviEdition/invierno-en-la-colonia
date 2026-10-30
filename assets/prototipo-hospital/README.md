# Recursos originales de la prueba del hospital

Recibidos en el commit `ed3578f31d27fbdb1e09184de0073e911765b1e1`, conservado en la historia de `prototype/hospital-2-5d` (PR16). Se renombraron con `git mv`, **sin recortar, reescalar, convertir ni modificar sus bytes**. [Manifiesto de originales](manifest.json): nombres de subida, dimensiones, canal alfa, tamaño y SHA-256.

| Archivo | Dimensiones | Formato comprobado |
| --- | --- | --- |
| hospital.png | 1254×1254 | PNG RGBA, alfa0–255 |
| suelo-nevado.png | 1536×1024 | PNG RGB, opaco |
| zombi.png | 1175×1338 | PNG RGBA, alfa0–255 |

No se eliminaron colores para simular transparencia. La inspección de alfa se hizo sobre los archivos, no sobre el fondo negro de una vista previa. Hay márgenes transparentes y residuos alfa1 alrededor de los recortes; se mantienen en los originales. La selección ignora alfa menor de16 sin alterar la imagen dibujada.

Configuración de posición, escala y anclajes: `prototypes/hospital/scene.mjs`. El zombi se ancla al pie más bajo, aproximadamente `(716,1218)` en el PNG original. Los recursos son provisionales: suelo finito, perspectivas fijas y pérdida de nitidez al ampliar; no representan arte final ni un modelo3D.

Para abrir y validar la escena, ver [informe73](../../docs/73-prototipo-visual-hospital-2-5d.md). Esta carpeta no modifica el producto V9.9 ni sus recursos empaquetados.
