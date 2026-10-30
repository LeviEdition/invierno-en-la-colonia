# 75 — Plan incremental del Hito 3: identidad visual y experiencia jugable

**Propuesta del29/10/2026, Montevideo. Actualización posterior: H3.1 aceptada y H3.2 autorizada; las demás etapas siguen sujetas a revisión.** Cada etapa posterior exige revisión del resultado anterior y autorización del creador. [Diagnóstico y decisiones74](74-h3-1-auditoria-identidad-visual.md) · [tablero 18](18-tablero-operativo.md).

## Actualización de acuerdos y autorización

**H3.1 aceptada con ajustes; H3.2 autorizada exclusivamente.** Objetivo visual: tablero ilustrado2D por capas, mapa continuo de siete localidades, cámara fija con pan/zoom, elementos físicos independientes y personajes estáticos posibles. Sin3D/rotación, navegación libre, distancias, colisiones o reglas nuevas. En móvil se admiten botones de centrado y paneles; un resumen de sectores no reemplaza el mapa continuo.

Se conserva el plan original como historia. H3.2 compara solo el hospital con Phaser como candidato principal y versión fija, sin PixiJS paralelo salvo bloqueo documentado. No fusionar PR16/17, publicar, conectar motor ni construir siete localidades. H3.3 decidirá la aprobación artística; no se promete mejora visual por cambiar de renderizador. H3.3–H3.6 siguen pendientes de autorización.

La esquina debe compararse con la fracción medida en Canvas, no solo con10–90%. Se medirán carga/tamaño/navegación/reposo/recursos e identificarán condiciones y equipo; WebGL ausente, recursos fallidos, resize, reinicio y limpieza tendrán pruebas. Acceso sencillo desde VS Code/navegador sin exigir Python.

## 1. Qué significa este hito

El encargo actual denomina Hito 3 a la identidad visual/experiencia jugable. El plan01 y acta62 usaban «Hito 3» para el desarrollo propio más amplio y proponían SP-03/SP-04 como siguiente diseño. Se registra esta **priorización visual explícita**, sin borrar la historia ni declarar cerradas o aprobadas aquellas decisiones. Los bloques SP siguen siendo planificación separada; H3 visual no autoriza cambiar reglas o implementar el singleplayer.

La aceptación del hospital como base experimental no autoriza su merge ni convierte sus tres posiciones en un sistema de movimiento. Se conserva el PR #16 aislado. Los pasos siguientes son una ruta propuesta, no una lista de tareas ya aprobadas.

## 2. Resumen de etapas

| Etapa | Objetivo y salida concreta | Dependencias | Criterio de salida y pruebas |
| --- | --- | --- | --- |
| **H3.1 — Auditoría y dirección preliminar** | Informe74, inventario, arquitectura propuesta, evidencia y este plan | Main preservado y snapshot de PR #16 | Documentación sin implementación, fuentes/SHA trazables, propuestas diferenciadas de acuerdos; revisión del creador |
| **H3.2 — Evaluación del renderizador** | Comparación reproducible Canvas/Phaser en el sector del hospital, versión candidata fija y decisión adoptar/ajustar/descartar | Aprobación H3.1 y autorización V-01; primer perfil de dispositivos/distribución | Tres posiciones, cámara, selección, alfa y controles equivalentes; mediciones de costo; no motor duplicado ni reglas conectadas todavía |
| **H3.3 — Kit visual y recursos piloto** | Guía visual aprobable, lámina de escala, pivotes/capas y manifiesto; mínimo hospital/suelo/zombi reutilizados y propuestas de superviviente/barricada | Decisión de renderer, V-02 y presupuesto V-06 | Escala/perspectiva coherentes y legibles en tres tamaños; originales preservados; derivados/atlas trazables; aprobación artística antes de producir todo el catálogo |
| **H3.4 — Un sector conectado al motor** | Un único motor, coordinador de presentación y sector piloto con HUD/decisiones HTML | H3.2/H3.3 aceptados, diseño V-03 y contrato de proyección | Igualdad lógica y de consumo de RNG, render sin mutación, comandos vigentes, decisiones/foco/pase/sucesión sin regresión; entradas de referencia conservadas |
| **H3.5 — Ampliación de representación** | Las siete áreas actuales, actores/estados/contadores y paneles del inventario, por bloques pequeños | Piloto aprobado y recursos suficientes | Conteos/capacidades idénticos al estado; selección por ID; oclusión saturada y cambio de sector coherentes; sin distancias, colisiones o caminos con reglas nuevas |
| **H3.6 — Validación y cierre visual** | Validación de experiencia, móvil/accesibilidad/rendimiento y formato de entrega acordado; informe final | H3.5, perfiles físicos V-04 y distribución V-05 | Regresión completa, navegador, dispositivo acordado, carga/zoom/gestos/teclado/lectura y recuperación de recursos; aceptación del creador antes de integración/publicación |

No se asignan fechas ni se prometen horas sin resolver recursos y equipos. Los bloques internos que siguen limitan tamaño y permiten detener/revertir una extracción si falla.

## 3. H3.2 — PoC acotado antes de adoptar Phaser

**Alcance propuesto:** una escena aislada, los tres PNG originales y los controles ya conocidos. Nada de siete localidades, reglas, nueva IA, física o navegación. Otra rama de experimento solo si el creador la autoriza; no fusionar PR #16 por conveniencia para traer los recursos.

1. Fijar versión candidata y backend a probar. Punto de partida observado: Phaser 4.2.1, WebGL; Canvas interno está deprecado. Revisar esbuild existente y carga local sin añadir framework UI o bundler por defecto.
2. Replicar delante/detrás/esquina, sombra, Mostrar ocultos y selección con los mismos pivotes. Mantener Canvas como baseline. No asumir que `setDepth(y)` resuelve un edificio ni copiar matricesv3.
3. Probar rueda/pinza y traducción de coordenadas del renderer. Elegir una ruta de input; no conectar a la vez el gesto DOM existente y un segundo drag de Phaser.
4. Adaptar el arnés a una observación del render independiente de `getContext('2d')`, conservando sus criterios. Mantener las pruebas Canvas originales sin borrarlas.
5. Medir carga, parseo, texturas, reposo, navegación y un estrés puramente gráfico con copias de sprites. Ese estrés **no es una partida válida** ni cambia las capacidades del motor.

**Aceptación verificable:** frente≥99% reconocible, detrás≤2%, esquina entre10–90%, Mostrar ocultos revela y desactivar restaura; comparación visual tolerante a diferencias de rasterización entre backends. Zoom conserva el punto de entrada con desviación≤1 px CSS, límites y reset reproducibles. Controles≥44 px, teclado y 0 overflow horizontal en 1365×768,393×852 y 320×640;0 excepciones normales. No afirmar prueba física por usar CDP.

**Salida:** tabla medida del mismo escenario y decisión razonada sobre renderer/costo. Si no hay ventaja para el alcance acordado o hay un bloqueo de compatibilidad, proponer Canvas o ajustar el plan. No continuar a integrar todo el motor para justificar una elección previa.

## 4. H3.3 — Kit artístico mínimo antes de escalar producción

1. Probar una lámina con puerta, adulto, zombi, barricada y marcas de contacto; acordar perspectiva y proporciones. Los ratios del informe 74 son hipótesis.
2. Clasificar recursos: original de trabajo, PNG/atlas derivado, pivote y límites de oclusión, escala, estados disponibles. Conservar hashes/procedencia y coordenadas respecto del original.
3. Proponer un superviviente piloto y una barricada, sin rediseñar roster/habilidades. Si se necesita tejado/fachada separados, presupuestar arte que realmente falta en el PNG.
4. Probar lectura con nombre, dueño, selección, heridas/frío y accesibilidad; mantener HUD a tamaño CSS estable al alejar el mundo.

**Aceptación:** originales idénticos y alfa real; pies/sombras alineados sin salto al usar derivados; sin bordes de atlas ni pérdidas de pivote por recorte; muestra en los tres viewports y con zoom mínimo/máximo. Contrastes medidos contra 4.5:1 para texto normal/3:1 donde corresponda, además de lectura real. Icono/color no son la única señal. El creador aprueba el kit antes de extenderlo a todos los edificios/personajes.

## 5. H3.4 — Integración vertical de un sector

1. Definir el mínimo RenderModel por audiencia usando el contexto protegido actual, no parseando HTML ni historias. Mantener un único `createEngine` y una sola conexión de presentación.
2. Montar coordinador, escena y DOM. Mantener efectos requeridos: modales, cola de muerte, pases, notificaciones y foco. Si falta una consulta/resultado en la API, proponer el cambio pequeño antes de duplicar reglas.
3. Traducir actorId a índice vigente cuando el comando lo requiera. Cámara/hover/posiciones se guardan en presentación; no se escriben en game ni se convierten en reglas.
4. Renderizar estados aceptados de selección, movimiento, daño y defensa. Animación opcional e interrumpible; el loop no ejecuta turnos, `paint()`, exposición o lógica de rescates.

**Pruebas de salida:**100 refrescos/zoom no cambian snapshot ni consumen RNG de motor; un clic produce un comando; montar/desmontar no deja listeners/motores duplicados; selección permanece correcta tras muertes/reclutamiento/pase. Comandos aceptados/rechazados conservan consecuencias. Mantener ambas modalidades actuales y sus prioridades de decisión.

Ejecutar suite existente completa, pruebas de contrato nuevas y comparación de trazas/estados con las mismas semillas y entradas. Los40 casos por referencia y cinco recorridos completos existentes son un punto de partida, no demostración universal. Las diferencias de píxel por renderer no justifican normalizar decisiones, tiradas o mensajes del motor. Verificar que no se revelan encrucijadas/inventarios antes de tiempo.

## 6. H3.5 — Ampliar sin cambiar el juego

Bloques propuestos, uno revisable cada vez:

- Resumen de siete localidades y cambio de sector según V-03. Sus carreteras/decorados no imponen adyacencia o costo nuevo.
- Todos los actores de la partida por ID y localidad, con estados y propiedad correctos. El catálogo actual tiene16 definiciones, no16 sprites terminados.
- Zombis, barricadas, accesos, ruido, indefensos y rescates como representación del estado agregado. No inventar puertas o entidades lógicas persistentes para justificar arte.
- Integrar inventario, objetivo, crisis, grupos, perfiles, registro y ayuda con el tema aprobado; los diálogos críticos conservan su precedencia.

**Aceptación:** cada área muestra ocupación/capacidad y suma de elementos coherentes con motor; colocación saturada legible y repetible, sin personajes desaparecidos por oclusión o selección obsoleta. Una cuenta agrupada, si se aprueba para densidad, conserva el total y el acceso a la información individual disponible. Probar cambios de sector, estado, selección y privacidad; carga/destrucción de recursos sin acumulación de listeners/texturas. Bloquear la ampliación si falta arte indispensable o su sustituto no fue aprobado.

## 7. H3.6 — Compatibilidad y experiencia medibles

Antes de medir, V-04 debe identificar equipo y navegador: PC de referencia, móvil mínimo Android físico y navegador principal; definir si se exige otro motor. La emulación verifica geometría/entrada, no presupuesto de GPU, temperatura, memoria real o TalkBack.

**Presupuestos iniciales propuestos, por aprobar antes del PoC y no ajustar después para ocultar fallos:** interacción a feedback P95≤100 ms; objetivo de 60 fps en PC y al menos30 fps en móvil mínimo en el escenario acordado. Registrar P50/P95 de frame y pausas, carga fría/caliente, bytes transferidos, DPR y memoria; definir el techo de memoria con el hardware elegido. Comparar reposo y navegación, no solo una captura estática. El Canvas actual redibuja a demanda; un loop continuo puede costar más batería en una escena pequeña.

Pruebas de cierre:

- Flujos completos actuales en humano+IA y dos locales; pérdida/selección de líder, muerte, mordedura, botín y terminales. Sin regresión de reglas o RNG.
- Tres tamaños, vertical/horizontal cuando se acuerde, teclado, foco/inert, objetivos táctiles, avisos sin tapar decisiones y pruebas de lectura/contraste.
- Pinza, cancelación de pointer y retorno tras cambio de aplicación; pérdida/restauración de contexto WebGL en QA y conducta si no hay GPU compatible.
- V-05: reconstrucción reproducible y prueba del formato acordado (HTML único o paquete local/web). No sustituir el offline por depender de un CDN. Conservar la release de referencia sin cambios.
- Memoria/listeners/texturas tras varios cambios de sector y reinicios, sin crecimiento injustificado ni acciones duplicadas.

**Si falta hardware o una compuerta:** dejar pendiente o solicitar aceptación explícita de la reserva, sin decir que pasó. La salida es un informe de resultados y aceptación humana; no crea automáticamente tags, releases, merge o campañas.

## 8. Control de alcance y próxima decisión

H3.1 entrega solo documentos, capturas y evidencia. H3.2 todavía **no está autorizado**. No se implementó Phaser ni se prepararon módulos, perfiles, Director, cambios de balance o guardados. Main, referencia, PR #16 y SP-03 se conservan.

**Única siguiente tarea:** el creador revisa74/75, ajusta V-01–V-06 y decide si autoriza el PoC H3.2. Detener el trabajo técnico en este punto de control.
