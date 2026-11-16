# Encargo: integrar el kit piloto de arte en H3.3

Continuá “Invierno en la Colonia”, repositorio https://github.com/LeviEdition/invierno-en-la-colonia. Leé este encargo completo y los archivos del paquete antes de implementar. Está autorizado trabajar, probar, documentar y subir cambios a una rama con PR en borrador. No ejecutar merge, modificar main ni avanzar a H3.4.

## Objetivo

Incorporar las siete imágenes de assets/ a la maqueta interactiva H3.3, aprovechando el taller existente. Obtener un mapa continuo con pan/zoom, retratos seleccionables, espacios exteriores e interfaz con datos de muestra. Priorizar un hospital cercano funcional y visualmente coherente; representar las siete localidades para comprobar distribución y capacidad. No conectar el motor real.

El mapa fue aceptado como prototipo, no como arte definitivo. Los seis recursos restantes son la primera entrega para probar en conjunto, sin validación de integración. El estilo vigente es adulto, sombrío, crudo y dibujado, con pinceladas y detalles simplificados; puede incluir sangre y violencia. No convertirlo en arte hiperrealista, pulido o infantil. Los bocetos de referencias/ orientan composición e interfaz; el acabado de assets/ es la referencia más reciente.

## 1. Inspección inicial y rama

Leé AGENTS.md si existe, convenciones, tablero operativo y documentos H3.1–H3.3. Buscá los nombres reales: docs/18-tablero-operativo.md, documentos 74–77 y posteriores pertinentes. Revisá código, documentación, comentarios y CI actual antes de diagnosticar.

Referencias históricas, no estado garantizado: PR #19; rama experiment/h3-3-taller-visual; head acd3900ab925cf575e99b66cb8b9a71640592e43; base experiment/h3-2-phaser-hospital; main 826199d96645b95869509995772c914290d63ac7. Comprobá si ya hubo una continuación: no dupliques trabajo ni borres cambios ajenos.

Continuá en la rama pertinente si sigue vigente; si necesitás otra, explicá base y dependencia. Conservá los prototipos anteriores para comparación. No force-push ni reset destructivo. Reutilizá cámara, selección, carga, limpieza y adaptador cuando corresponda; no reescribas el taller completo.

## 2. Importación del paquete

assets/ contiene los siete PNG de trabajo. referencias/ contiene dos bocetos con interfaz incrustada, que NO deben utilizarse como fondo jugable. manifest.json registra dimensiones, modos, alfa y SHA-256 medidos. Los originales se copiaron sin editar ni reescalar. No hay archivos derivados optimizados todavía.

Copiá el kit a una ubicación versionada según las convenciones del repositorio, manteniendo originales y procedencia. Registrá derivados aparte. No uses rutas temporales del chat como si existieran en el equipo del creador.

Comprobá el alfa sobre fondos claros y oscuros: tener canal alfa no garantiza un recorte visual perfecto. En particular, la barricada tiene alfa máximo 254 y puede presentar un halo/transparencia residual; el zombi alcanza 255. Inspeccioná antes de utilizar. No apliques umbrales destructivos ni normalices todo el alfa silenciosamente; documentá cualquier defecto o derivado necesario.

Los retratos son cuadrados y tienen fondo pintado: recortalos circularmente en presentación, sin modificar el original. Ajustá el encuadre para que no corte caras. Los nombres de archivo son identificadores de recursos, no identidades del catálogo real.

Definí apoyos de zombi/barricada en sus pies, no en el borde inferior del PNG. Determiná escala por el contenido visible y guardá los valores en configuración. No estires los sprites. Son poses estáticas, no animaciones.

Medí nitidez y memoria al zoom habitual. No prometas resolución final a partir del mapa general ni adoptes automáticamente atlas potencia de dos/mipmaps para todos los recursos. Documentá presupuesto y distinguí estimaciones de memoria de VRAM medida. Si el fondo pierde detalle al ampliar, registralo como límite del prototipo; no sustituyas el zoom con otra imagen independiente.

## 3. Composición y ocupación

Distribución: escuela arriba izquierda, biblioteca arriba derecha, hospital centro izquierda, colonia extensa centro derecha, gasolinera abajo izquierda, comisaría abajo centro y supermercado abajo derecha.

Un único mundo con pan/zoom sin rotación. Encuadre general, acercamiento al hospital y restablecimiento. Mantener calles y vecinos visibles en el acercamiento. No deformar edificios para acomodar fichas desde lejos: se juega principalmente con zoom y la vista lejana es táctica.

Cada localidad exterior admite cuatro retratos y cuatro espacios exteriores COMPARTIDOS entre vacío, zombi o barricada. Colonia: doce retratos y doce espacios compartidos. Total: 36 espacios exteriores. Un espacio no puede contener zombi y barricada simultáneamente.

Contornos segmentados en el suelo siguiendo la perspectiva. Hospital y comisaría: dos al frente y dos al costado visible. Ningún espacio detrás de edificios. Los retratos van sobre la localidad, sin cuerpos humanos sobre techos; selección ámbar y asociación inequívoca con su edificio. Configurá coordenadas y capacidades como datos.

Estados de muestra reproducibles: un zombi por localidad; hospital con cuatro supervivientes y dos zombis/dos barricadas; ocupación máxima de 36 retratos (6×4 + 12); combinaciones de espacios vacíos y ocupados. Repetí los cuatro retratos para probar capacidad, con IDs de personaje distintos. Estos estados no cambian la preparación ni las reglas reales.

## 4. Interfaz e interacción

Barra superior con ronda, turno, moral, comida y accesos objetivo/crisis. Menú flotante con inventarios, registro y ayuda. Panel derecho en escritorio y panel inferior adaptable/cerrable en móvil. La interfaz mantiene tamaño mientras el mundo sigue la cámara.

Ficha tipo expediente: retrato, nombre, localidad, grupo, estadísticas de muestra, habilidad, heridas/estado, equipo e historia desplegable. DADOS DISPONIBLES inmediatamente encima de acciones, etiquetados como reserva del grupo/turno, no dados propios.

Los botones deben dar feedback de demostración; no simular reglas nuevas ni fingir integración. Los paneles secundarios pueden ser simples muestras. Datos ficticios identificados como tales; leer el catálogo como referencia si hace falta, sin ejecutar el motor.

Selección por ID estable después de pan/zoom; distinguir tap/clic de arrastre. Controles accesibles, foco visible, teclado y gestos táctiles. Evitá que el panel o los efectos bloqueen el mapa. No crear interiores, movimiento libre, colisiones ni adyacencia basada en el dibujo.

## 5. Ambiente, después de validar lo básico

Muestra pequeña opcional dentro del tiempo de este encargo: nieve ligera, humo en un punto y variación suave de una luz. Sin tapar información ni interceptar controles. Botón para desactivar, respeto a reducción de movimiento, pausa con página oculta y limpieza al salir. Aleatoriedad visual independiente. No animaciones definitivas de zombi, ciclo día/noche o sombras que se muevan sin justificación. Si falta máscara o recurso, documentalo sin retrasar la entrega principal.

## 6. Restricciones y pruebas

No tocar reglas, dados, IA, crisis, balance, narrativa, turnos, guardados, privacidad ni referencia V9.9/tag/release. No importar el motor ni conectar start/dispatch/snapshot/paint. Mantener Phaser como candidato existente, sin declarar adopción definitiva ni modificar gratuitamente su adaptador. No nuevas dependencias grandes sin necesidad justificada.

Ejecutá checks exigidos y pruebas pertinentes. Comprobá cámara/reset, selección tras zoom, conteos, ocupación exclusiva, encuadre de retratos, transparencia y escala, ficha/dados, teclado, móvil 393×852 y 320×640, carga/reentrada/limpieza y ausencia de errores normales. La emulación no acredita móvil físico. Conservá la cobertura previa; no infles pruebas redundantes.

Guardá evidencia de vista general, hospital cercano, colonia con doce retratos e interfaz móvil. Inspeccioná visualmente las capturas. Registrá diferencias con los bocetos y límites del fondo. No afirmes que todo está validado solo por pasar tests.

## 7. Entrega y parada

Actualizá documentación/tablero y PR en borrador. Entregá rama y SHA final, recursos importados, cambios y limitaciones, instrucciones exactas Windows/PowerShell sin Python, capturas, pruebas y CI del SHA correcto. Si CI no es accesible, informá bloqueo y no lo declares aprobado. La descripción del PR debe reflejar el alcance final.

Detenete para revisión artística y de interacción del creador. No cerrar H3.3 ni pasar a H3.4 automáticamente. No publicar ni fusionar.
