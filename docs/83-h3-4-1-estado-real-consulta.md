# 83 — H3.4.1: mapa de consulta de una partida real

03/11/2026, America/Montevideo. Rama `experiment/h3-4-1-estado-real`, basada en **`0d7afce6abe476fef183c2e4dde148a313fd434a`**, último head remoto verificado de H3.3/PR19. Árbol inicial limpio; PR19 draft sin merge. Main826199d9 y referencia/tag/release preservados. Sin AGENTS.md aplicable.

## Autorización y límites

El creador acepta H3.3 como dirección visual, incluida la ambientación, y autoriza **H3.4.1**, inicialmente de consulta. Detalles artísticos/dispositivos físicos permanecen pendientes y no bloquean esta integración. Esto supera la espera de autorización descrita en82, sin reescribir su evidencia. PR20 es documental, sobre otra base histórica de H3.3: no se fusiona ni se sobrescribe.

Nueva rama/PR en borrador contra H3.3. Preservar la maqueta independiente. No acciones desde el mapa, reglas nuevas, cambios de balance, IA, guardados, motor alternativo, main ni merge. Preparación y acciones continúan en la interfaz existente. No avanzar a la siguiente fase.

## Contrato inspeccionado antes de implementar

- `createApplication` compone **una instancia** de `createEngine`, `createUi`, `createAgent` y el registro de comandos. Inicializa con el flujo de preparación existente.
- `createEngine.snapshot()` produce una copia completa, con manos y mazos internos: **no es el DTO a enviar al mapa**.
- `connectPresentation(factory)` admite **un receptor y lo sustituye**. No hay `subscribe` múltiple; no se usará una segunda conexión que elimine la interfaz existente.
- El receptor recibe capacidades de vista y contexto vivo protegido. Las consultas explícitas de equipo/catálogo/atributos permiten presentar datos reales.
- `paint()` procesa rescates y decisiones: **no se llama desde la cámara, la ambientación o un bucle del visor**.
- Incluso `playable()` llama a `leaderChoiceReady()` y sincroniza solicitudes de líder. El adaptador no añade esas llamadas; registra el resultado de las que la interfaz anterior ya realiza al dibujar sus dados.
- Motor: localidades por índice0–6 (Colonia, Supermercado, Hospital, Comisaría, Gasolinera, Escuela, Biblioteca), grupos `human`/`ai`, capacidades actuales12/4 y accesos12/4. La maqueta tiene posiciones provisionales distintas en gasolinera/biblioteca: no se cambian los límites del motor para adaptarlos al dibujo.
- Dados disponibles se consumen del array; no hay historial separado de usados. No se inventará. Las manos, mazos y futuras encrucijadas no se revelarán al visor.

## Adaptación acotada prevista

Una fábrica de presentación opcional en `createApplication`, con el mismo `createUi` por defecto, permite encadenar observación sin sustituir el receptor. La interfaz original se ejecuta en un host propio, con su preparación, decisiones y comandos intactos. El mapa recibe solo una proyección pública por canal de mensajes de origen verificado; no recibe motor, comandos ni enlaces internos.

Las notificaciones se coalescen después de la llamada de presentación existente. Los eventos de preparación, pase y diálogos mantienen el bloqueo y la ocultación correspondiente; no se saltean elecciones obligatorias. El visor conserva selección/cámara/ambientación fuera del motor. El ajuste de arquitectura debe demostrar conservación del receptor y limpieza mediante pruebas; la implementación y los resultados se registrarán debajo.

**Estado de este checkpoint:** inspección y primera prueba TDD de la fábrica de presentación (rojo→verde); H3.4.1 todavía en implementación. No se declara terminada ni CI aprobado para esta rama.

## Implementación entregada

La preparación y la interfaz original se ejecutan en un host HTML propio dentro de un iframe. Es **la única partida**, con el mismo motor, UI y automatismos. La fábrica opcional de presentación encadena un observador al mismo receptor, conservando getters, llamadas y disposición del UI. No hay una segunda suscripción que lo sustituya. Las notificaciones existentes se agrupan en una microtarea después de la operación; el visor no sondea ni llama reglas por fotograma.

El cambio en código de aplicación existente es de dos líneas en `src/application/create-application.mjs`: parámetro `createPresentation=createUi` y utilización de esa fábrica. Su valor por defecto conserva la composición anterior. Se regenera el HTML de **esta rama** para mantener `check:build`; no se toca el HTML publicado en la release ni su commit/tag. Primer commit acotado: **`ba86def20073384ac87dd16d0e45744714617264`**, con prueba y checkpoint documental.

`prototypes/state-map/` contiene:

| Pieza | Responsabilidad |
| --- | --- |
| `projection.mjs` | Lista explícita de datos públicos, nuevas estructuras congeladas: nunca envía snapshot completo, referencias internas, manos, mazos o cartas futuras. |
| `reference-observer.mjs` | Conserva un único receptor/UI, registra sus consultas existentes a `playable`, agrupa notificaciones, sigue bloqueos de presentación y descarta publicaciones tras desmontar. |
| `reference-host.mjs` | Crea la aplicación existente. Acepta un MessageChannel solo del padre y origen esperado; publica datos, no comandos del motor. Reemplaza/cierra canales anteriores. |
| `layout.mjs` | Correspondencia explícita índices reales→localidades ilustradas; asigna posiciones y retratos provisionales por ID; conserva excedentes. |
| `map-view.mjs` | Presenta el DTO con el renderer/cámara/controles/ambientación existentes. Selección y consultas locales, sin importar el motor. |
| `main.mjs` | Preparación/V9.9 ↔ consulta, conexión y ciclo de vida; montaje serializado/cancelable y reintento de la vista sin reinicializar la partida. |
| `index.html`, `style.css` | Controles HTML accesibles, ficha, consultas y acciones deshabilitadas. |

`scripts/build-state-map.mjs` reutiliza esbuild0.28.2 y `buildGame`, sin dependencias nuevas. El bundle del mapa no puede importar `src/`; el host debe contener el motor real y no Phaser. Genera producto y, solo con `--qa`, otro artefacto de prueba. El producto elimina `h341Test`, `testBindings` y banderas QA. El servidor normal no sirve la ruta QA y la combinación QA+LAN se rechaza. Los tests deterministas llaman al API público `dispatch` exclusivamente en ese host QA, sin modificar campos internos. No se añade un parámetro de depuración al producto.

## Flujo y correspondencia de datos

Entrada: **http://127.0.0.1:8775/prototypes/state-map/**, después de `npm.cmd run dev:state-map`. [Guía completa Windows/VSCode/LAN](../prototypes/state-map/README.md).

1. Elegir modo en la preparación original. Resolver pases y decisiones allí. **La elección inicial de líder ya era opcional hasta la primera acción:** se puede elegir desde Grupos; la primera acción confirma al actual. No se fuerza una elección adicional antes de consultar ni se introduce autoselección. La sucesión obligatoria tras fallecer un líder se conserva.
2. **Ver mapa** abre la consulta. Nombre/ID/grupo/localidad, atributos base y efectivos, heridas/congelación, habilidad y equipo equipado son reales. Los cuatro retratos se comparten por hash estable de ID y se identifican como provisionales; no transfieren su nombre artístico a otro superviviente.
3. Ronda, turno, moral, comida, objetivo, crisis y registro proceden del motor. Los dados pertenecen a la reserva del turno; cambiar la selección del mapa no cambia el personaje activo ni los dados del motor. Historial separado de usados: **no disponible en este modelo**, se informa sin inventarlo. Las manos permanecen en V9.9.
4. Preparación, pase, muerte y diálogos abren la interfaz original y **redactan el DTO visible**. Se limpian las fichas que dejan de estar visibles. Una época nueva identifica una partida nueva; una muerte elimina al personaje de las consultas sin mantener una selección antigua.
5. El mapa tiene sus cuatro acciones deshabilitadas, sin respuestas ficticias. Para actuar se vuelve a V9.9. Los cambios se reciben mediante sus notificaciones existentes, aunque el mapa esté oculto.

La capacidad real actual es12 en colonia y4 en exteriores. La representación de gasolinera2/biblioteca3 continúa provisional: no modifica reglas. El excedente muestra `+N fichas` y la localidad conserva una lista completa consultable. En la prueba real de gasolinera hay3 ocupantes,2 retratos dibujados y1 excedente, con capacidad del motor4. Zombis y barricadas usan los mismos accesos dibujados; el motor expone conteos, no IDs/posiciones individuales de cada zombi o barricada. La asignación temporal es zombis primero y barricadas después, sin inferir nuevas reglas de posición. Si exceden el dibujo, aparecen aviso y cantidades exactas. Indefensos y plazas libres conservan su distinción.

Las etiquetas de grupo se muestran cuando el retrato alcanza22px CSS; por debajo tapaban las caras en la vista general móvil. El grupo sigue consultable a cualquier escala. Ninguna capa de etiquetas captura entrada. No se modificaron las coordenadas/artes de H3.3.

## Reinicio, errores y navegación

- **Reiniciar visor** restablece cámara, selección y configuración visual. Conserva íntegra la partida del host y no crea otra conexión al motor. Tres reinicios por tamaño: un contexto gráfico, listeners/texturas/buffers sin acumulación. Los shaders se compilan a demanda y varían con los efectos que llegan a dibujarse: se comprueban cotas y liberación final, sin exigir igualdad entre fotogramas distintos.
- Desmontar: cero contextos y objetos GL vivos, cero ResizeObserver targets y cero timers de arranque; se eliminan listeners del visor/audio/controles. Los dos listeners de navegación del shell permanecen para poder restaurarlo mientras la página siga viva.
- Salir cierra el canal y destruye el visor. Con `pagehide.persisted`, el host conserva la aplicación congelada; `pageshow.persisted` reconecta el mismo host y crea una sola vista con estado visual inicial. El snapshot de la partida se conserva. Sin bfcache la navegación recarga el flujo de preparación: **no se añade persistencia ni un formato de guardado**.
- Chromium154 local permitió una restauración **real**, `pageshow.persisted=true`, mismo documento y misma partida. La prueba controlada con eventos sintéticos también pasa y se registra separada. Playwright no enumeró el frame restaurado; se inspeccionó su `contentWindow` del mismo origen para verificar el snapshot, sin alterar la aplicación para acomodar el arnés.
- PNG abortado intencionalmente: salida de carga a aviso `role=alert`, V9.9 sigue disponible y reintento recupera el mapa con la misma partida/RNG. Ese error de red esperado se distingue de errores normales, que fueron0. Sin WebGL el visor avisa y conserva V9.9; usa el arranque/cancelación de H3.2 y no crea otro renderer.

## Pruebas y evidencia local

**Entorno:** Node24.19.0, Playwright1.57 externo, Chromium154 headless/SwiftShader en Linux. Escritorio1365×768/DPR1;393×852 y320×640/DPR2, tacto emulado. [Datos del entorno](evidencias/h341/entorno.json). No teléfono físico, VRAM medida o nueva certificación de rendimiento móvil.

| Comprobación | Resultado |
| --- | --- |
| Instalación reproducible | `npm ci --cache /tmp/h341-npm-cache`, aprobada. El primer intento encontró una caché por defecto no escribible/inexistente en `/home/agent/.npm`; se usó la opción estándar de caché en `/tmp`, sin cambiar lockfile ni dependencias. En Windows basta `npm.cmd ci`. |
| Construcción | `check:build`, `check:state-map-build`, `check:hospital-build`, `check:workshop-build`, validación de kit y `git diff --check`, aprobados. |
| Suite completa | **528/528**,0 fallos/omitidas/canceladas. Base512;16 pruebas nuevas: fábrica, proyección/privacidad, observación/ciclo de vida, layout/excedentes, build/servidor y acciones legales del motor real. |
| Oráculo independiente57872ee | **40/40** partidas equivalentes, incluyendo todas las propiedades de comportamiento del comparador histórico, más ambas suites sin omitidas. [JSON](evidencias/h341/oraculo.json). |
| Chromium, tres tamaños | **3/3**, siete localidades incluyendo vacías, selección por clic/tap/selectores, pan/rueda/pinza y transformación común, dados por turno, acciones deshabilitadas, interfaz sin desbordamiento y controles mínimos44px. [JSON](evidencias/h341/chromium.json). |
| Actualizaciones reales | Movimiento desde un botón V9.9; exposición/herida y cura, equipamiento desde el perfil original, construcción legal, consumo de dados/comida, pase local y ronda2. Correspondencia del snapshot con DTO/fichas/contadores; registro abierto se actualiza. |
| Inmutabilidad | Selección/cámara/efectos/audio no cambian snapshot ni contador RNG del juego. Dos partidas con las mismas acciones legales y FX on/off: mismo estado y misma secuencia RNG,301 llamadas en ese caso. |
| Nueve casos adicionales | Excedente real; muerte y sucesión; RNG on/off; turno IA hasta ronda2; ciclo controlado; Atrás/bfcache real; error de recurso/reintento; producto sin globals QA; UI V9.9 autónoma con siete sitios. **9/9**. [JSON](evidencias/h341/casos-limite.json). |
| Referencias anteriores | Fuentes/PNG sin cambios frente a0d7afce6. Bundles H3.3, taller y H3.2 con los mismos hashes indicados debajo. Los siete gates anteriores se ejecutan además en CI sobre el nuevo head. |

La ambientación conserva el costo y reservas documentados en82. No se volvió a presentar su benchmark como rendimiento de esta integración ni de un dispositivo físico.

### TDD, fallos encontrados y segunda pasada crítica

Se conservan los primeros fallos de contrato en `docs/evidencias/h341/rojo-*.log`: API de fábrica inexistente y módulos/pruebas iniciales antes de implementarlos. La corrección del registro abierto también tiene reproducción roja. [Reproducciones y ajustes del arnés](evidencias/h341/reproducciones.json).

**Defectos nuevos confirmados y corregidos:**

- Un diálogo de Registro ya abierto permanecía con entradas antiguas. Se retiene su tipo de consulta y se repinta al recibir el DTO, sin volver a abrirlo ni cambiar reglas.
- El reinicio destruía el canvas y el siguiente montaje intentaba clonarlo desde un elemento inexistente. Se usa una plantilla estable y un lienzo nuevo por montaje, como ya hace H3.3. Se normaliza además el menú cerrado al reiniciar, para que su control no invierta un estado anterior.
- La inspección propia de capturas mostró las etiquetas de grupo superpuestas a fichas diminutas. Se limita su aparición por tamaño dibujado y se mantiene la pertenencia en consultas.

**Correcciones del arnés, no fallos del producto:** inventario usa `cardId`; equipar requiere abrir el perfil y pulsar su botón original; cerrar un modal retorna correctamente a V9.9 y exige Ver mapa; comparación de shaders compilados a demanda; acceso al iframe restaurado; espera de servidor listo. No se relajaron guardas ni reglas para facilitar pruebas. Un favicon solicitado al abrir el HTML autónomo producía404: el servidor experimental responde204, sin tocar el HTML de referencia publicado.

Segunda lectura crítica propia: se revisaron dependencias del motor, getters live del UI, consultas con efectos, privacidad, orden de notificación, selección obsoleta, listeners/contextos y controles de preparación. El hallazgo clave fue **no llamar `playable()` adicionalmente** porque sincroniza líderes. El observador registra llamadas ya realizadas por el UI; sus pruebas verifican cantidad y snapshot intacto. El mapa no importa `src/` y el canal no enruta acciones. No equivale a una revisión humana independiente ni a aprobación del creador.

### Capturas inspeccionadas

- [General escritorio](evidencias/h341/1365-general.png).
- [Hospital tras movimiento legal, herida y ficha real](evidencias/h341/1365-hospital-real.png).
- [393 móvil emulado](evidencias/h341/393-general.png) · [320 móvil emulado](evidencias/h341/320-general.png).
- [Gasolinera:3 reales,2 dibujados, lista completa](evidencias/h341/gasolinera-excedente.png).
- [Después del fallecimiento real y sucesión](evidencias/h341/tras-fallecimiento.png).

No son composiciones fijas importadas como partida: proceden del motor inicializado y de acciones legales en QA. Una captura fija no prueba suavidad; aquí se reutiliza la ambientación validada de H3.3, sin nuevos efectos.

## Preservación y CI

Base H3.3 **`0d7afce6abe476fef183c2e4dde148a313fd434a`**. Main sigue **`826199d96645b95869509995772c914290d63ac7`**; PR19 draft sin merge. PR16`ba1d93a4…`, PR18`4fc7c66c…`, tag anotado`0fdb2146…` y objetivo preservado **`62e4e85150b2416ccf07d671c186b5c421993b0b`** sin mover. SP-03 intacto. No se modifica arte, IA, reglas, balance ni guardados.

Hashes comprobados de los bundles anteriores reconstruidos:

```text
H3.3 mapa   2fabef6fc8fc4e4bbd88729454c7dfee105838dfd203b0badc5767655d7d5d72
Taller     265c882ad84347168be8df5a1d9ce421d5a1845b1d3948fe0bd683e6401454a7
H3.2       7e7b90ab465bc4b7113ffb20c4c0780a9c0e9d0db1d0cfab83659b46632f5e54
```

Workflow nuevo `h3-4-1-state-map.yml`: checkout del **head exacto**, Node22, instalación, builds,528 pruebas, oráculo y ambos gates Chromium, con artifacts incluso si falla. Se añade la rama base H3.3 al trigger del workflow existente de taller para ejecutar también sus siete gates sobre este head. No se cambian sus pruebas ni los experimentos originales.

**Evidencia CI final:** se registra en la descripción del nuevo PR draft, con SHA completo, URLs/runs y artifacts comprobados tras subir el commit. Los JSON de este informe son locales; el CI previo41703994304 corresponde únicamente a la base0d7afce6 y no sustituye esa verificación. Así se evita atribuir al propio documento el SHA de un commit que aún no existe.

## Resultado y reservas

Se recomienda **revisar H3.4.1 como integración de consulta**: el dibujo representa una sola partida real y los cambios pueden contrastarse con V9.9, sin segundo motor ni acciones nuevas. Arquitectura acotada y reversible: retirar este PR deja intacta la base H3.3; la fábrica opcional conserva su comportamiento por defecto.

Pendiente: revisión visual/funcional del creador, dispositivos físicos, mejora artística/capacidades visuales y nitidez al ampliar, evaluación definitiva de Phaser. La observación depende de los puertos de presentación actuales: si se añade una mutación que no notifique al UI habrá que mantener ese contrato y sus pruebas. El iframe y la copia del DTO son una frontera experimental pequeña, no una declaración de arquitectura final para todos los modos.

**Única siguiente tarea:** revisión del creador de este PR y de ambas rutas. Se detiene H3.4.1 aquí. No se habilita movimiento ni ninguna otra acción en el mapa, no se fusiona y no se avanza automáticamente.
