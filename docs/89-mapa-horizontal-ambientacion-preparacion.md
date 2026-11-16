# 89 — Mapa horizontal y ambientación: preparación y dependencia de originales

**Actualización05/11/2026: bloqueo resuelto.** El creador subió los tres originales en `4f05c8f349c1973e0b786cf37d562a5685e6fca9`. Se preservó ese commit y se continuó en la misma rama/PR25. [Informe90](90-mapa-horizontal-ambientacion.md). El texto siguiente registra el checkpoint previo; sus estados de archivos ausentes no describen la entrega actual.

05/11/2026, America/Montevideo. **Encargo autorizado, implementación pendiente por acceso a los tres originales.** No se pide nueva aprobación del alcance. La aceptación manual de búsqueda, ataque y barricadas continúa pendiente.

## Estado comprobado

Se leyó el encargo completo del texto adjunto, README de la entrada actual, tablero18, informe88, protocolo15 y los módulos de presentación/cámara/ambientación pertinentes. No hay AGENTS.md aplicable en el repositorio ni sus directorios superiores del workspace.

Árbol inicialmente limpio en **`694b64504ca39bb00627fb4cf9964b9521ec211f`**, coincidente con la rama remota H3.4.4 y el PR24 **abierto/draft**, base H3.4.3. Su CI exacto [42021660345](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/42021660345) sigue aprobado; es evidencia de la entrega anterior, no de un mapa horizontal integrado. Se creó **`experiment/mapa-horizontal-ambientacion-h3`** desde ese SHA, para un PR documental/preparatorio draft contra `experiment/h3-4-4-ataque-barricadas-mapa`.

Main remota observada **`826199d96645b95869509995772c914290d63ac7`**. Main, tag/release de referencia, PR24 y sus prototipos permanecen intactos. No hay cambios de motor, reglas, capacidades, arte o dependencias.

## Encargo vigente

Reemplazar el escenario del nuevo experimento por un mapa continuo horizontal; conservar las siete localidades y sus IDs: colonia centro, hospital izquierda, escuela arriba izquierda, biblioteca arriba derecha, supermercado derecha, gasolinera abajo izquierda y comisaría abajo derecha. Casas, galpones, torre de agua, parada y vías son decorativos.

Adaptar polígonos seleccionables, apoyos de retratos, accesos exteriores y llegadas; representar capacidades **reales** del motor, sin introducir los cambios aplazados. Centrar cada localidad en el área útil de PC/celular horizontal con paneles, sin descubrir vacío exterior. Documentar resolución y zoom recomendable sin confundir ampliación con detalle nuevo.

Vegetación independiente o grupos pequeños, troncos anclados, movimiento de copas/ramas con amplitudes y fases distintas y el mismo viento de nieve/humo. No oscilar la capa entera. Edificios, cercos y postes fijos; cables solo si hay apoyos inequívocos. Pocas luces ámbar con fuente y mancha cercana variando juntas; eliminar el brillo fijo correspondiente antes de animar, sin focos flotantes ni brillo global.

Reutilizar tormenta/opciones/apagado/movimiento reducido; preservar selección J1/J2, movimiento1500ms/exposición, búsqueda, ataque, barricadas, consumos reales y retorno de decisiones V9.9. Sin editor de encrucijadas, otras acciones, nuevas mecánicas, fusiones o cambios en main. Entrega futura con capturas generales/siete localidades, video y validación Chromium1365×768,852×393,740×360; sin equiparar emulación con teléfono físico.

## Bloqueo concreto: imágenes visibles, archivos no accesibles

Las tres imágenes son visibles en el mensaje del creador. En este turno, únicamente el texto adjunto tiene identificador descargable; no se recibieron rutas locales ni identificadores de descarga para los tres binarios de imagen. Se inspeccionaron los archivos de adjuntos montados, los recursos del repositorio y el árbol remoto del head exacto. No se encontraron estos nuevos originales. Las ramas remotas de esta cadena mantienen los heads anteriores.

El archivo existente **`kit_arte_h33/assets/mapa-prototipo.png`** es el mapa anterior **1448×1086/RGB**, no el nuevo escenario. Los dos bocetos anteriores1672×941 están en `kit_arte_h33/referencias/`; su existencia no demuestra la recepción de estas tres imágenes nuevas. No se usaron como sustitutos.

Sin los binarios no es posible medir alfa, dimensiones originales, hashes, encaje, componentes de vegetación o detalle útil. Una previsualización incrustada no permite certificar esos datos. No se reconstruye el mapa mediante generación de imágenes, capturas o eliminación de negro para simular transparencia.

Se preparó **`assets/mapa-horizontal/README.md`** con estas rutas de destino sugeridas:

- `assets/mapa-horizontal/mapa-completo.png`.
- `assets/mapa-horizontal/fondo-sin-vegetacion.png`.
- `assets/mapa-horizontal/vegetacion.png`.

**Los tres archivos faltan; los nombres son propuestos, no nombres originales confirmados.** Basta subirlos individualmente a esta rama, sin ZIP. Si ya están en otra ubicación o rama, se necesita esa ruta/ref para obtenerlos sin reemplazar otros recursos.

## Inspección técnica realizada y continuación prevista

La entrada H3.4.4 importa directamente `hospital-workshop/mockup/scene.json`, el kit original y `movement-map/storm.json`. El escenario y los emisores siguen referidos al mapa1448×1086. Cambiar solo una imagen desalinearía selección, retratos, accesos y luces. Se necesita una configuración propia del escenario nuevo conservando las referencias anteriores.

La cámara actual limita desplazamiento al rectángulo completo y deriva zoom máximo como cinco veces el encuadre inicial. No considera en ese cálculo la resolución útil del nuevo recurso ni la oclusión por paneles. Estos ajustes deberán verificarse con dimensiones y geometría reales; no se fija un zoom definitivo a partir de las imágenes del chat.

Propuesta de implementación acotada, pendiente de los archivos:

1. Inventariar originales con dimensiones, alfa, bytes y SHA-256; comparar fondo+vegetación contra referencia y señalar diferencias concretas. Decidir qué componentes se pueden separar limpiamente sin alterar el diseño. Si una separación no sirve, documentar el recorte/corrección mínimo requerido antes de ocultarlo con efectos.
2. Preparar entrada/configuración propias reutilizando host, brokers, controladores de acciones y renderer existentes. Motor y protocolos permanecen como autoridad; no se duplican reglas. Mantener H3.4.4 recuperable en su entrada anterior.
3. Configurar siete zonas, apoyos y accesos desde el arte real. Cubrir ocupación máxima y comprobar centrado/límites en el área útil; medir nitidez a la misma escala. Ninguna coordenada del boceto se considera ya validada.
4. Agrupar vegetación donde el alfa y la alineación lo permitan; registrar recortes y pivotes. Mantener bases fijas y deformar/desplazar principalmente la parte alta. Conectar al viento existente sin RNG del juego, segundo bucle innecesario o listeners de selección.
5. Identificar luces y posibles chimeneas reales; preparar únicamente los parches/máscaras imprescindibles, preservando originales y trazabilidad. Fuente y luz cercana comparten una intensidad. Si no hay separación limpia o soporte coherente, dejar el foco estático/omitido y documentar el motivo.
6. Repetir acciones y cámaras, cancelación/deduplicación/decisiones, efectos apagados/encendidos, pausa/reinicio/reducido. Medir animaciones con entorno y método explícitos, inspeccionar capturas/video y ejecutar suite/builds/CI del head nuevo antes de presentar la implementación.

Estas son decisiones técnicas provisionales de preparación, no una implementación ni aprobación de pérdida de detalle/encaje. No se crearon derivados o animaciones con arte sustituto.

## Validación de este checkpoint

Se comprobaron Git limpio/base remota, estado/CI del PR24, ausencia de los nuevos archivos y dimensiones/modo de los recursos anteriores. Se comprueba `git diff --check` para la documentación. **No se ejecutaron nuevamente npm test, builds ni Chromium:** solo se añade documentación;605 pruebas/40 comparaciones/15 baterías pertenecen a la entrega694b645, no se atribuyen a esta etapa.

Integración del mapa, alfa/encaje, zoom, centrado, ocupación, vegetación/luces, rendimiento y nuevos recorridos de acciones permanecen **no ejecutados**. El PR de preparación se mantiene draft y registra el bloqueo. No se declara terminada ni aceptada esta etapa ni H3.4.3/H3.4.4.

**Única siguiente tarea: obtener los tres originales y continuar la implementación ya autorizada en esta rama.** No hace falta nueva autorización ni un ZIP.
