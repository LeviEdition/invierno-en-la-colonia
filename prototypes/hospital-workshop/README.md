# Taller técnico H3.3 del hospital

Herramienta de desarrollo independiente. **Kit, perspectiva, proporciones y marcadores provisionales** hasta recibir la maqueta y aprobación artística. Phaser4.2.1 es candidato de trabajo; H3.2 no se considera visualmente aprobado ni físicamente probado por esta entrega.

## Abrir en Windows/VS Code

Con Node22+, abrir la carpeta del repositorio que contiene **package.json y package-lock.json**. Revisar `git status` y conservar cualquier trabajo. En la rama `experiment/h3-3-taller-visual`, terminal PowerShell:

```powershell
npm.cmd ci
npm.cmd run dev:workshop
```

Mantener terminal abierta. Abrir:

- Taller: http://127.0.0.1:8772/prototypes/hospital-workshop/
- Canvas sin cambios: http://127.0.0.1:8772/prototypes/hospital/
- Phaser H3.2 sin cambios: http://127.0.0.1:8772/prototypes/hospital-phaser/

`npm.cmd` evita el bloqueo de npm.ps1 sin cambiar políticas de PowerShell. No requiere Python. El servidor construye ambas entradas Phaser con esbuild existente. Ctrl+C lo detiene. Si el puerto está ocupado, usar `$env:WORKSHOP_PORT=8775` antes de ejecutar y sustituir el puerto en las URL. No usar doble clic/file:// para el taller.

Con Live Server: `npm.cmd run build:hospital` y `npm.cmd run build:workshop` antes de abrir esta página desde la raíz completa. Después de editar JS/JSON hay que reconstruir/volver a iniciar y recargar; no hay HMR ni editor de archivos dentro del taller.

Celular en la misma Wi-Fi, servidor anterior detenido:

```powershell
npm.cmd run dev:workshop -- --host 0.0.0.0
ipconfig
```

Usar la IPv4 Wi-Fi/Ethernet de la PC en lugar de127.0.0.1, mantener la terminal abierta y permitir Node en red privada si Windows lo solicita. **Son instrucciones, no una prueba de teléfono físico o de esa red.** No se despliega un sitio público.

## Controles y significado

- Arrastre, rueda/pinza, flechas, +/− y0. Enter selecciona hospital; Escape limpia selección. También se puede seleccionar cualquier recurso mediante HTML y centrarlo. «Volver al sector» evita recorrer toda la página móvil hacia arriba.
- Delante/Detrás/Esquina usan las tres posiciones de H3.2 y orden explícito. **No es una ordenación general por Y para cualquier edificio.** Mostrar ocultos transparenta el hospital.
- Cuadrícula XY: referencia de coordenadas ilustradas, paso40–160. **No es cuadrícula de movimiento ni proyección del suelo aprobada.** Ejes, apoyos, límites y etiquetas se controlan por separado.
- Los diagnósticos se dibujan sobre la ilustración; un apoyo/etiqueta puede localizar un actor oculto. Para revisar oclusión normal, desactivar guías/etiquetas/apoyos y Mostrar ocultos.
- S1–S4 son marcadores de superviviente; A1–A4, marcas compartidas de acceso. H es la guía humana y P la de puerta: no ocupantes ni arte. Los conteos indican figuras representadas en capas activas; no calculan qué fracción quedó ocluida.
- Los casos4S+4Z,4S+4B y mixto son composiciones preparadas. Un acceso de prueba contiene zombi, barricada o vacío. **No son capacidades ni reglas nuevas.** Modificar un acceso pasa al caso manual; no guarda una partida.
- La escala de figuras es un multiplicador provisional0,75–1,25. Persona104 y puerta126 son unidades ilustradas heredadas de un ensayo, **no alturas en metros ni proporciones aceptadas**.
- Perfil inicial H3.2: originales+mipmaps. Los ensayos75% y50% son optativos, visibles y aislados; conservan cámara/selección/apoyo. No reemplazan H3.2 ni aprueban pérdida de detalle. Zoom50–400% del encuadre; con mucho aumento incluso el original puede superar su resolución útil.
- Restablecer vista solo reencuadra. Reiniciar taller y volver desde bfcache restablecen el estado provisional inicial. Los cambios no persisten ni modifican archivos.

## Incorporar el próximo material sin reescribir la escena

1. **Conservar** `assets/prototipo-hospital` y ambas referencias. Añadir PNG RGB (suelo) o RGBA (recursos transparentes) nuevos bajo `assets/hospital-workshop/`, con nombres de versión claros y sin eliminar colores para crear alfa.
2. Registrar en `assets/hospital-workshop/manifest.json` un array `assets` con, por archivo: `file`, `width`, `height`, `bytes`, `sha256` y procedencia real. El esquema mínimo reutiliza el manifiesto original. Registrar el commit donde se incorporó el original, separado de cualquier commit posterior que lo describa.
3. Medir dimensiones con el visor de imágenes de VS Code. Para bytes y hash en PowerShell, sustituyendo el nombre:

   ```powershell
   (Get-Item .\assets\hospital-workshop\hospital-maqueta-v01.png).Length
   (Get-FileHash .\assets\hospital-workshop\hospital-maqueta-v01.png -Algorithm SHA256).Hash.ToLowerInvariant()
   ```

4. Actualizar **datos**, no el renderer: en `kit.json`, conservar el identificador hospital/ground/zombie; cambiar `file`, dimensiones, bytes/hash, `alpha`, `provenance.manifest`/`record` y commits verificables. La referencia4fc7c66 describe la base técnica; la procedencia de cada archivo nuevo debe señalar su propio origen.
5. Medir `pivot` en **píxeles del PNG original incluyendo márgenes transparentes**. Para una figura, usar contacto de pies; para el edificio, un apoyo identificable en el suelo. No redondear el pivote derivado: se transforma automáticamente por el factor. Ajustar `visibleBounds` respecto del original y declarar cómo se midió; los actuales vienen del alfa>16 auditado.
6. Ajustar `scale` y posiciones de presentación respecto de la misma referencia humana/proyección. Los números actuales son provisionales. Para el próximo recurso puede hacer falta mover los datos de encuadre, no cambiar reglas ni el motor.
7. Para sustituir un marcador por un PNG futuro, conservar la clave `survivor-marker` o `barricade-marker` como identificador estable, cambiar `kind` a `image` y aportar archivo, dimensiones, alfa, hash/procedencia, apoyo, límites y escala. El sufijo de la clave no aprueba el arte; la escena elige imagen o forma por `kind`, sin reescribirse.
8. Conservar los estados disponibles reales. Un PNG estático solo declara static; marcadores, marker. No inventar vistas, animaciones o capas ausentes.
9. Ejecutar `npm.cmd run check:workshop-kit`, `npm.cmd run build:workshop`, `npm.cmd run check:workshop-build` y `npm.cmd test`. Revisar presupuesto y pruebas de caracterización si cambiaron las dimensiones intencionadamente; **no debilitar las comprobaciones de las referencias congeladas**.
10. Repetir inspección visual y navegador antes de aceptar. Ángulos/proporciones definitivos y estado approved solo se incorporan cuando exista autorización artística; el contrato actual exige pending-model. No hay importación arbitraria o edición/guardado desde la página.

La derivación es uniforme: superficie `ceil(ancho×factor)`×`ceil(alto×factor)`, pivote×factor y escala de representación/factor. El redondeo añade menos de un texel de margen, no estira el contenido. Después se usa el preparador potencia-de-dos de H3.2 con un frame que conserva la superficie completa. Alfa real y originales intactos; no normalización de opacidad, recorte por color o derivados sin procedencia.

## Qué debe aportar la maqueta

- Encuadre de hospital+entorno y dimensiones originales; sin recortes de pantalla que oculten márgenes o apoyos.
- Una figura humana común y una puerta en el mismo encuadre; señalar la relación deseada, sin suponer alturas métricas todavía.
- Contacto del edificio con el suelo, esquinas y aristas de ambas fachadas, escalones/vereda y referencias de verticalidad. Marcar los apoyos donde deberían estar los pies.
- Dirección/proyección de los dos ejes de suelo a partir de esa maqueta; el taller todavía no fija sus ángulos.
- Tres posiciones de ejemplo para delante/detrás/esquina y qué debería quedar tapado. Si una marquesina, baranda o primer plano debe ocluir de forma distinta, señalarlo.
- Capas necesarias y qué archivos existen realmente: suelo opaco, edificio con alfa, figuras y, si hace falta, frente/techo/marquesina/sombra independientes. **No podemos recuperar automáticamente capas ausentes del PNG.**
- Disposición ilustrativa de4 supervivientes y4 accesos compartidos para probar lectura; no determina reglas. Identificar si el reparto resulta ilegible y dónde admite márgenes.
- Luz/sombras y si están pintadas dentro de cada recurso o separadas; confirmar alfa interior/zonas que deberían ocluir completamente. Los originales actuales tienen mucho alfa252–253 y se conservan tal cual.
- Alcance del siguiente superviviente/barricada piloto, estilo/acabado que se quiere revisar, resolución y zoom útil esperado. Ahora son formas marcadas, no diseños aprobados.

## Validación y límites

Ocho tests Node nuevos de contrato, procedencia, memoria, apoyos, ocupación y preview; se conserva toda la suite previa. QA de Chromium: `node scripts/check-h33-browser.mjs` y `node scripts/measure-h33-textures.mjs`, con Playwright externo/CHROMIUM_PATH como en el workflow. No se añade Playwright al producto.

El segundo script exporta PNG y hashes **solo a la carpeta QA** y genera recortes físicos idénticos de100/75/50% en zoom mínimo/inicial/máximo. Esos PNG no los descarga el taller: las tres variantes siguen cargando los originales6.478.691 bytes. El ahorro inicial es de textura, no de red. Memoria RGBA/mipmaps/auxiliares es estimada; no VRAM medida ni rendimiento móvil físico.

Resultados, fuente de evidencia, presupuesto provisional y revisión pendiente en [informe77](../../docs/77-h3-3-taller-visual-y-kit-piloto.md). **H3.3 no termina con esta preparación técnica.**
