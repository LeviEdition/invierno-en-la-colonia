# 78 — Referencias visuales y acuerdos de H3.3

Fecha: 30/10/2026, Montevideo. Registro de la exploración visual realizada con el creador en ChatGPT, posterior al encargo inicial del [taller 77](77-h3-3-taller-visual-y-kit-piloto.md).

**Estado:** dirección artística y boceto de acercamiento aprobados como referencia. No es aprobación del prototipo interactivo, cierre de H3.3 ni autorización de H3.4. No modifica reglas, main, la referencia V9.9, sus releases ni los experimentos.

## Acceso a las imágenes

Los siguientes enlaces abren los archivos originales guardados en ChatGPT. **Requieren acceso a la cuenta propietaria y no son URLs públicas de assets.** Los PNG todavía NO están incorporados al repositorio. Esta entrega registra enlaces y decisiones; no debe presentarse como una subida de los binarios ni como recursos ya accesibles para Codex.

La conexión GitHub de esta sesión solo permite escribir archivos UTF-8. El intento de Git push --dry-run falló por falta de credenciales. No se sustituyeron PNG por texto base64 ni se alteraron los originales.

## Galería y evolución

| Referencia | Archivo | Evaluación y propósito |
| --- | --- | --- |
| Maqueta en planta | [Incredible Esboo-Kasi.svg](https://chatgpt.com/library?file_id=libfile_f443da77036881918cfa060ba7e53199&account_id=personal) | Original aportado por el creador desde Tinkercad. Contornos y nombres en planta; no contiene alturas ni cámara 3D. Trazos muy finos. |
| Maqueta inclinada | [Captura de Tinkercad](https://chatgpt.com/library?file_id=libfile_91223440412881919d0ef7e40c13c9d1&account_id=personal) | Referencia de posiciones y ángulo. Los bloques no fijan arquitectura o tamaños definitivos. |
| Primer mapa ilustrado | [Mapa nevado de Invierno en la Colonia.png](https://chatgpt.com/library?file_id=libfile_209eb758636c819197500840506b656f&account_id=personal) | Al creador le gusta; solicita quitar nombres y despejar exteriores. Se conserva como evolución histórica. |
| Mapa limpio | [Mapa invernal con siete ubicaciones.png](https://chatgpt.com/library?file_id=libfile_fe696bbad3788191890a5c495e34eb6c&account_id=personal) | Dirección aceptada: sin nombres incrustados, explanadas libres y más espacio fuera del cerco de la colonia. |
| Referencia de ficha | [Ficha aportada por el creador](https://chatgpt.com/library?file_id=libfile_a848028c06dc8191bfadedf03a9c7b8f&account_id=personal) | Inspiración compositiva de expediente con retrato. No importar personaje, estadísticas, texto o reglas; no es un asset propio del juego. |
| Primera interfaz | [Invierno en la colonia: mapa y dossier.png](https://chatgpt.com/library?file_id=libfile_e7854af9bd708191bb46d9687bbea75e&account_id=personal) | Barra general, retratos, menú flotante y dossier con dados encima de acciones. Error conocido: hospital y comisaría mostraban tres accesos; no copiar ese conteo. |
| Distribución lateral | [Hospital y policía con cuatro espacios.png](https://chatgpt.com/library?file_id=libfile_9996403ee8f08191adcbd74cc3ae4f15&account_id=personal) | Hospital y comisaría con dos accesos frontales y dos laterales. No tomar la reducción de edificios como tamaño final: también deben admitir cuatro retratos. |
| **Acercamiento aprobado** | [Hospital nevado: tablero de supervivencia.png](https://chatgpt.com/library?file_id=libfile_f96df181aaf08191872985f4a6f32922&account_id=personal) | El creador responde «perfecto». Cuatro retratos, dos zombis y dos barricadas, ficha abierta y continuidad del mapa fuera del encuadre. Principal referencia de experiencia de juego. |

Las ilustraciones fueron generadas mediante la herramienta de imágenes de ChatGPT usando referencias del creador y revisiones conversadas. Son conceptos visuales, no capturas de una implementación funcional. La generación puede variar geometría, texto y conteos entre versiones.

## Distribución acordada

- Fondo: escuela a la izquierda y biblioteca a la derecha.
- Zona media: hospital a la izquierda y colonia más extensa en centro/derecha.
- Frente: gasolinera, comisaría y supermercado, de izquierda a derecha.
- Calles y veredas conectan visualmente el conjunto. No crean adyacencia, distancias, caminos legales ni costos de movimiento.
- Estilo ilustrado, invernal y posapocalíptico, con materiales desgastados y luces cálidas discretas.
- La coherencia geométrica final, la resolución y los límites de zoom siguen por validar técnicamente.

## Zoom y lectura

**La mayor parte del tiempo se juega con zoom.** La vista general es táctica: no exige leer todos los retratos y detalles. No agrandar o deformar edificios únicamente para hacerlos legibles desde lejos.

Al acercar, cada localidad debe permitir selección cómoda y distinguir ocupantes y accesos. El mapa continúa fuera de pantalla; no se sustituye por pantallas independientes. Cámara fija con pan/zoom, sin rotación. Barra, menú y dossier mantienen tamaño de interfaz mientras cambia la vista del mundo.

## Ocupación y representación

| Área | Fichas de supervivientes | Accesos compartidos zombi/barricada |
| --- | ---: | ---: |
| Cada una de las seis localidades exteriores | 4 | 4 |
| Colonia | 12 | 12 |

Son 36 accesos exteriores en total. Cada acceso está vacío, ocupado por un zombi o por una barricada; no son cuatro de cada tipo.

Los supervivientes dentro de la localidad se representan con retratos circulares sobre el edificio, seleccionables. No implica cuerpos sobre el techo ni interiores visibles. Deben poder mostrarse cuatro fichas en las localidades pequeñas y doce en colonia; evaluar al zoom habitual, no únicamente en el encuadre general.

Los accesos usan contornos punteados sobre el suelo. Pueden disponerse cuatro al frente o dos al frente y dos al costado visible. Evitar oclusiones que impidan reconocerlos. Contornos y ocupantes serán elementos separados del fondo.

El creador propone un zombi inicial por localidad. Es válido como estado de muestra del boceto; al integrar se verificará la preparación existente del motor antes de cambiar cualquier regla. La prueba de dos zombis y dos barricadas representa ocupación máxima, no la preparación inicial.

## Interfaz

- Barra superior: indicadores existentes de ronda, turno y colonia; acceso a objetivo y crisis. El boceto no constituye inventario exhaustivo del HUD.
- Menú flotante: inventarios, registro, ayuda y accesos existentes.
- Dossier al seleccionar retrato: fotografía, nombre, grupo/localidad, estadísticas actuales, habilidad, heridas/estado y equipo.
- Reserva de **dados disponibles del grupo/turno inmediatamente encima de las acciones**.
- Acciones reales del motor al llegar a H3.4. No introducir porcentajes, estadísticas o reglas desde una imagen.
- Apariencia: carbón, papel envejecido gris, bordes gastados, retrato con clip/cinta y acento ámbar de selección.
- Panel lateral derecho en el boceto de escritorio. Panel inferior móvil es una propuesta pendiente de prueba.
- Mara, estadísticas, moral, comida y dados mostrados son datos ilustrativos, no validación del catálogo.
- La agregación de retratos a zoom lejano no quedó fijada: debe evaluarse, sin perder acceso a personajes.

## Ambiente: propuesta posterior, no implementación acreditada

Se conversó una muestra pequeña al final de H3.3: nieve ligera, humo y variación suave de una ventana. Extensión al mapa y animaciones en H3.5; validación de costo y reducción de movimiento en H3.6. No afirmar que ya existen ni que este registro encarga implementarlas.

Efectos en la presentación, con aleatoriedad independiente del motor. Luz/humo anclados al mundo, sin tapar controles ni retratos; sombras de edificios estables salvo cambio de iluminación justificado. Prever pausado con página oculta y costo de redibujado continuo. Máscaras o capas separadas solo donde se necesiten.

## Incorporación pendiente y siguiente trabajo

1. Descargar los originales desde los enlaces y añadirlos como PNG bajo `docs/evidencias/h33-referencias-visuales/`, con nombres estables, dimensiones y SHA-256 reales. No inventar hashes.
2. Sustituir/complementar los enlaces por imágenes relativas que GitHub y Codex puedan leer sin sesión ChatGPT.
3. Conservar las versiones históricas, destacando mapa limpio y acercamiento aprobado.
4. Revisar PR19 y contrastar el taller existente con estos acuerdos posteriores; no duplicarlo ni dar por revisada su implementación en esta entrega documental.
5. Preparar un incremento H3.3 acotado con datos de muestra: zoom, selección de retratos, dossier, dados, menú y ocupación completa.
6. Validar en navegador y tamaños móviles antes de cerrar H3.3. Sin H3.4, merge, nueva release ni cambios lógicos por este registro.

**Límites:** ninguna imagen demuestra accesibilidad, rendimiento, selección táctil, nitidez al zoom final o equivalencia lógica. El fondo limpio puede usarse provisionalmente; si hace falta oclusión o animación localizada, preparar capas y recursos adecuados. No recortar UI incrustada como sustituto de controles funcionales.
