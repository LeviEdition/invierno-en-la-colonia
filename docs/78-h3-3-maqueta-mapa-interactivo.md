# 78 — H3.3: maqueta interactiva del mapa y kit recibido

**Continuación autorizada posterior:** [informe79](79-h3-3-localidades-capacidades-e-interfaz.md): capacidades visuales33/espacios36, edificios seleccionables y correcciones de interfaz. Este documento y sus capturas conservan la entrega anterior `0b5a05c`; sus36 fichas máximas quedan como dato histórico.

03/11/2026, America/Montevideo. **Entrega para revisión visual, no aceptación de H3.3.** [PR19 en borrador](https://github.com/LeviEdition/invierno-en-la-colonia/pull/19), rama `experiment/h3-3-taller-visual`, dependiente de PR18. Sin merge, motor ni H3.4.

## Encargo vigente y estado inicial

El creador autorizó expresamente todo `kit_arte_h33/PROMPT_CODEX.md` y precisó que la entrada principal debía ser la maqueta del mapa, no el taller del hospital con un modo opcional. Esa autorización supera la reserva de alcance del informe77. Los avisos superiores de74/75/77 y el tablero registran la decisión; el resto se conserva como historia, incluidas sus capturas y pruebas.

Base de esta continuación: `e974e283df12b582e50d65d2f476f1616a3cad41`, árbol limpio, PR19 OPEN/draft hacia `experiment/h3-2-phaser-hospital`. Su CI previo aprobó495 pruebas ([ejecución](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/41516552051)). Se verificaron README, protocolo15,74–77, paquete y manifiesto; no se encontró AGENTS.md aplicable. Se conservó la subida original `d9f73be0c30c2218658e50cbf5fb9bec362697ce` y todo el trabajo anterior.

Main observado: `826199d96645b95869509995772c914290d63ac7`; PR18/head `4fc7c66c1af1d053458519b5c6367a8b9224e8a0`; PR16/head `ba1d93a4ae73a91a6f07660584e2374b53043a67`. Tag anotado `v0.9.9-referencia-modular`, objeto `0fdb214612486f4cc46c1acb444390de963d05e8`, commit `62e4e85150b2416ccf07d671c186b5c421993b0b`; HTML de referencia SHA-256 `43b8883ad4821e4b50c40791615c5ef6c0b3030476409b4e1c6da4dbd872d692`. No se modifican.

El entorno inicialmente estaba iniciándose y no ofrecía terminal; luego quedó disponible. No hay evidencia para atribuir la demora a permisos Git o a un archivo del proyecto. Se reutilizó el checkout existente `/workspace/invierno-en-la-colonia`: el registro de `/tmp/invierno-h33` era obsoleto y su ruta ya no existía. Se cambió a la rama existente sin crear otro worktree ni descartar trabajo.

## Qué se implementó y por qué

La entrada `/prototypes/hospital-workshop/` abre directamente **un solo mapa continuo** `mapa-prototipo.png`. Pan, rueda, pinza, botones y teclado comparten cámara con límites; no hay rotación, colisiones, navegación de personajes ni distancias de juego. El selector centra las siete localidades sin reemplazar el mapa por tarjetas o escenas distintas. Restablecer/tecla0 vuelven al encuadre general.

El taller anterior conserva página, controles, comparaciones y recursos en `tecnico.html`; su modo recibido está en `tecnico.html?kit=uploaded`. Solo cambian sus rutas de entrada en los arneses, sin debilitar los criterios. Canvas y Phaser H3.2 permanecen intactos.

Los cuatro retratos son fichas circulares sobre edificios. No se interpretan como personas de pie ni se crean36 texturas distintas: se reutilizan cuatro imágenes con36 identificadores de demostración estables. La selección por círculo, tap o selector HTML actualiza el expediente y su aro discreto. Grupo/atributos/nombres de muestra no se importan al catálogo real.

Hay36 espacios de terreno compartidos, cada uno con **un único ocupante**: vacío, zombi o barricada. Hospital y comisaría tienen dos frontales y dos laterales visibles. Los contornos elípticos son referencias gráficas provisionales en la proyección fija; no representan geometría física ni una solución general de oclusión para cualquier edificio.

| Composición de demostración | Fichas | Zombis | Barricadas | Vacíos |
| --- | ---: | ---: | ---: | ---: |
| Hospital mixto, entrada predeterminada |12|8|2|26|
| Un zombi por localidad |12|7|0|29|
| Ocupación máxima |36|18|18|0|

En la entrada, el hospital tiene **4 retratos +2 zombis +2 barricadas**; las otras localidades aportan muestras para recorrer el mapa. El máximo representa4 retratos por exterior y12 en colonia; no modifica capacidades de la V9.9 ni la preparación de una partida. Las fichas de la colonia se distribuyen en dos filas y sus12 accesos en dos hileras de terreno.

HUD y expediente son HTML fijo, fuera de la transformación de cámara. Incluyen ronda/turno/moral/comida, objetivo/crisis, inventarios/registro/ayuda, atributos/estado/habilidad/equipo e historia desplegable. **Dados del grupo A/turno de muestra** encima de las acciones: siguen perteneciendo al grupo A al seleccionar una ficha B. Seleccionar dado o pulsar buscar/atacar/construir/moverse solo responde con feedback y registro efímero; no consume ni muta dados, recursos, ocupación o turnos.

En móvil el expediente es un panel inferior con scroll y cierre para recuperar mapa. El menú tiene scroll propio para no quedar recortado. Los controles HTML tienen44px como mínimo y foco visible; las fichas del mapa reducen su tamaño con el zoom y no garantizan44px CSS en vista lejana. El selector HTML y el centrado permiten seleccionarlas también con teclado. No hay etiquetas A1/S1/H/P en la entrada: el diagnóstico se activa explícitamente desde Menú → Depuración.

## Organización y sustitución de recursos

- `mockup/scene.json`: proyección y posiciones de presentación, encuadres, escalas y capacidades de muestra. Los rectángulos `buildingBounds` solo validan colocación, **no son colisiones**.
- `mockup/model.mjs`: valida el contrato pequeño y produce tres composiciones deterministas, nodos y selección circular. Sin reglas.
- `mockup/camera.mjs`: encuadre, límites y centrado; reutiliza las matemáticas de cámara existentes.
- `mockup/assets.mjs`: deriva el contrato de los siete originales a partir del manifiesto existente, sin copiar PNG.
- `mockup/main.mjs`, `style.css`, `index.html`: ciclo de vida, interacción y HTML temático. Se reutilizan recursos, renderer y entrada existentes, con input Phaser desactivado para no duplicar eventos.
- Build esbuild existente: entradas `mockup.mjs` y `game.mjs` (taller técnico). El guard de dependencias rechaza imports de `src/` y de las entradas de los prototipos de referencia. Phaser sigue fijado a4.2.1, esbuild0.28.2; sin dependencias nuevas.

Orden explícito: mapa profundidad0, actores3, fichas7; sombras y contornos se dibujan por separado con la misma cámara. El mapa compuesto ya contiene edificios/suelo y no permite separarlos u ocultar sprites detrás de sus píxeles. Por eso los36 accesos se colocan en terreno visible y **no se promete oclusión arbitraria**. La prueba específica delante/detrás/esquina del hospital independiente sigue disponible en el taller técnico y las referencias.

Las escalas zombi0,04 y barricada0,035 son provisionales, con apoyos heredados: zombi(718,1090), barricada(752,810). Retratos centrados, diámetro44 unidades del mapa (36 en comisaría para encajar sin deformar su techo). El recorte circular384 se genera solo en memoria. No se elimina un color para simular alfa, no se normalizan canales ni se cambia el aspecto original.

Para sustituir futuros recursos: conservar original y procedencia en el paquete/manifiesto, verificar dimensiones/hash/alfa, actualizar el contrato con su pivote y escala, ajustar coordenadas de presentación si cambia la composición y repetir validación/capturas. No hay importador arbitrario, editor, guardados ni infraestructura genérica.

## Recursos, tamaño y costo

Los siete PNG del mapa suman **17.996.335 bytes**; nueve originales contando los dos bocetos:25.986.642 bytes. El mapa RGB mide1448×1086; los cuatro retratos RGB1254²; zombi RGBA1312×1199 y barricada RGBA1536×1024. [Validación de hashes/dimensiones](evidencias/h33-maqueta/kit-validado.json) contra el manifiesto aprobado, sin cambios en `kit_arte_h33/`. Los datos completos de alfa/procedencia permanecen en77 y su evidencia.

La entrada principal no descarga el hospital o suelo anteriores. Registro de red real: exactamente los siete PNG del kit. Se conserva la preparación POT/mipmaps del candidato H3.2, aislando la comparación previa:

| Magnitud de la nueva entrada | Valor | Naturaleza |
| --- | ---: | --- |
| Bundle principal |1.438.582 bytes; gzip9 386.947|Medido, construcción local |
| SHA-256 principal |`d3f040a0f0b51043fad1122ae1f8710467affcb5917bd55fdf723dc6d2f54e63`|Medido |
| Texturas base + niveles |61.516.452 bytes ≈58,67MiB|Estimación RGBA, no VRAM medida |
| Superficies POT auxiliares |46.137.344 bytes =44MiB|Estimación de superficies, no RAM residente medida |
| Cuatro recortes circulares384 |2.359.296 bytes =2,25MiB|Estimación de superficies |

Mapa1448×1086 y zombi se alojan en2048²; barricada2048×1024; retratos384 en512². Esa adaptación y los niveles explican la diferencia frente a las dimensiones originales. **No sumar estas columnas como medición de VRAM física.** No se crean siete localidades con siete presupuestos de hospital: se mide este único mapa compuesto. La comparación acotada de texturas y sus18 muestras anteriores se repitió sobre la ruta técnica, sin reemplazar silenciosamente la solución de H3.2.

Bundle H3.2 conservado:1.412.823 bytes, SHA `7e7b90ab465bc4b7113ffb20c4c0780a9c0e9d0db1d0cfab83659b46632f5e54`. Detalle reproducible en [build.json](evidencias/h33-maqueta/build.json).

## Pruebas ejecutadas y evidencia

Entorno local: Linux x86_64, Node24.19.0, Playwright1.57.0 externo, Chromium154.0.8037.57 headless, WebGL1/ANGLE **SwiftShader software**, sin aceleración física certificada. No se extrapola a rendimiento de teléfono ni a la PC del creador.

1. `npm ci --cache /tmp/h33-npm-cache`: instalación reproducible. [Referencia inicial **495/495**](evidencias/h33-maqueta/npm-test-inicial.log); cuatro pruebas nuevas de contrato/composiciones/recursos/cámara escritas primero [en rojo](evidencias/h33-maqueta/modelo-rojo.log) (módulo aún inexistente), luego implementación mínima y revisión. Resultado final **499/499**,0 fallos/omitidas: [log](evidencias/h33-maqueta/npm-test.log).
2. `npm run check:build`, build/check de hospital y taller: aprobados, bundles reproducibles; no se modifica HTML producto.
3. Gates Chromium: [Canvas](evidencias/h33-maqueta/canvas.json), [Phaser H3.2](evidencias/h33-maqueta/phaser.json), [taller técnico](evidencias/h33-maqueta/technical.json), [kit recibido técnico](evidencias/h33-maqueta/uploaded.json), [maqueta principal](evidencias/h33-maqueta/main.json), [comparación de texturas](evidencias/h33-maqueta/textures.json): **seis JSON passed**. Los gates anteriores conservan sus pruebas visuales/funcionales.
4. Maqueta en1365×768/DPR1,393×852/DPR2 y320×640/DPR2: carga siete recursos, selección real por clic/tap, pan de ratón y arrastre de un dedo, zoom anclado/rueda/pinza CDP, teclado, reinicio, resize, cámara/actores alineados, expediente/HUD fijo, tres composiciones y conteos, colonia12, sin desbordamiento horizontal ni errores normales de consola.
5. Cinco reinicios adicionales por tamaño: listeners y objetos GL estables, una sola instancia/contexto, un comando por botón. Desmontaje:0 objetos GL/contextos activos/observers/timers de arranque; se liberan7 superficies auxiliares y4 recortes, preservando `onblur/onfocus` ajenos. Permanecen solo dos hooks de navegación necesarios. Reposo observado350ms:0 draws, no un benchmark prolongado.
6. Recurso del mapa fallido: alerta accesible con ruta exacta y reintento real que llega a ready. Sin WebGL: aviso y enlace explícito a Canvas, no fallback silencioso. Pérdida/restauración de contexto: aviso/reintento y recuperación, incluso con diálogo abierto cuyo cierre sigue operativo.
7. Cancelación mientras espera PNG: eventos de página controlados, sin publicar instancia tardía, recuperación posterior. **No se cuenta como bfcache real.** En navegación real a Canvas y vuelta, se registran `pageshow.persisted` e identidad de documento; localmente ambos confirman bfcache. Se reconstruye deliberadamente el estado inicial de demostración (hospital, selección inicial, cámara general, panel según viewport, sin dado seleccionado ni registro). No se conserva partida.

Los tiempos locales listos de una ejecución, por viewport, están en `main.json`; son observaciones de entorno software sin red limitada, no medianas ni promesas de fluidez física. El mapa con panel abierto conserva aproximadamente361px de alto en393×852 y232px en320×640. Android/iOS físico, TalkBack/VoiceOver, GPU/VRAM reales y otros navegadores quedan pendientes. No se repitieron campañas manuales ni una nueva auditoría de reglas: no cambió el motor.

### Hallazgos confirmados y revisión crítica

- **Reinicio:** Phaser elimina el canvas al destruir Game; intentar reemplazar un nodo que ya no existe fallaba. Reproducción [roja](evidencias/h33-maqueta/reinicio-rojo.json); ahora cada montaje inserta un canvas nuevo en su contenedor. Gate repite reinicios y verifica un único contexto/listener por acción.
- **Menú móvil:** el panel inferior reducía el mapa y parte del menú quedaba tapada. [Rojo](evidencias/h33-maqueta/menu-movil-rojo.json); altura limitada y scroll del menú, probado en320px con expediente abierto.
- **Arnés bfcache:** esperar un nuevo evento load después de volver desde caché producía timeout aunque la aplicación ya estaba ready. [Reproducción](evidencias/h33-maqueta/arnes-bfcache-reproduccion.json). Se espera ruta+estado observable con polling síncrono, conservando el registro persisted/identidad. Es un defecto de verificación, no evidencia de fallo del producto. El helper evita además el fallo previo de Promise<false> de Playwright registrado en77.
- **Secuencia táctil del arnés:** el arrastre CDP mueve correctamente la cámara, pero un tap inmediatamente posterior no genera click. Se reprodujo también en `about:blank` con botón/canvas y sin scripts del proyecto, incluso esperando350/1000ms antes de tocar en la variante de diagnóstico. [Rojo y eventos](evidencias/h33-maqueta/tacto-arnes-rojo.json), [repro mínimo](evidencias/h33-maqueta/repro-tacto-html-vacio.mjs), [resultado HTML vacío](evidencias/h33-maqueta/tacto-html-vacio.json). No se modifican handlers del producto para compensar el protocolo: el gate comprueba tap y arrastre como casos separados. **La secuencia arrastrar→botón en teléfono físico queda pendiente**, no se declara corregida por reordenar un test.
- Revisión posterior del diff/contratos/ciclo de vida, sin delegación: no hay imports del motor, ocupantes dobles o dados asociados a la ficha. Solo ajustes opcionales mínimos en el renderer compartido (fondo, sombra, contornos) con defaults anteriores; gates técnicos conservados. No se detectó otro defecto confirmado dentro de este alcance. Esto no reemplaza una revisión externa ni la aceptación artística.

## Capturas para revisión

Capturas completas nativas, sin ampliación posterior; [dimensiones, DPR y SHA](evidencias/h33-maqueta/capturas.json). No comparar una captura móvil DPR2 con escritorio DPR1 como si tuvieran el mismo tamaño CSS.

- [Vista general1365](evidencias/h33-maqueta/1365-general.png)
- [Hospital cercano1365](evidencias/h33-maqueta/1365-hospital.png)
- [Colonia con12 fichas1365](evidencias/h33-maqueta/1365-colonia12.png)
- [Hospital móvil393](evidencias/h33-maqueta/393-hospital.png)
- [Colonia/panel móvil320](evidencias/h33-maqueta/320-colonia12.png)

Inspección visual: composición con mapa continuo y ficha lateral/inferior, retratos sobre edificios, dos accesos frontales y dos laterales en hospital, sin etiquetas técnicas predeterminadas. Se aprecian límites de detalle del mapa al ampliar; los nombres largos de muestra pueden partirse en el expediente estrecho. El kit y las proporciones siguen sujetos al juicio del creador.

## Probar desde VS Code y PowerShell

Abrir la carpeta que contiene `package.json` **y** `package-lock.json`, conservar cambios propios antes de cambiar rama:

```powershell
git fetch origin
git switch experiment/h3-3-taller-visual
git pull --ff-only
npm.cmd ci
npm.cmd run dev:workshop
```

Mantener la terminal abierta. **Entrada principal:** http://127.0.0.1:8772/prototypes/hospital-workshop/ (también `/`). Elegir Hospital cercano; seleccionar una ficha; usar rueda/arrastre o pinza. En «Escena y selección por teclado», elegir máximo y centrar Colonia para ver12 fichas. El expediente móvil puede cerrarse con×. Menú abre inventarios/registro/ayuda/depuración/reinicio y la ruta técnica.

Taller preservado: `/prototypes/hospital-workshop/tecnico.html`; modo recibido `tecnico.html?kit=uploaded`. Canvas `/prototypes/hospital/`, Phaser H3.2 `/prototypes/hospital-phaser/`, mismo puerto. [Guía detallada](../prototypes/hospital-workshop/README.md).

No requiere Python ni cambiar políticas PowerShell: `npm.cmd` evita el bloqueo de npm.ps1. No usar doble clic/file:// en esta maqueta. Live Server requiere primero `npm.cmd run build:hospital` y `npm.cmd run build:workshop`, desde la raíz completa. Si el puerto está ocupado, detener solo el servidor propio o fijar `$env:WORKSHOP_PORT=8775` y sustituirlo en la URL.

Celular en la misma Wi-Fi: `npm.cmd run dev:workshop -- --host 0.0.0.0`; consultar `ipconfig` y abrir `http://IP_DE_LA_PC:8772/prototypes/hospital-workshop/`. No usar localhost del teléfono; permitir Node en red privada si Windows lo solicita. Son instrucciones, **no prueba en teléfono físico ni de esa red doméstica**.

### Configuración del entorno en la nube

Se aplicó la skill `cloud-environment-onboarding:setup`: las instrucciones persistidas todavía afirmaban que no existían npm, build ni suite, y exigían Python. Se guardó un **borrador** con instalación Node/npm y arranque/verificaciones comprobadas; no se cambiaron repositorios, red o secretos ni se publicó el entorno. Guardado confirmado, `requires_publish=true`. Para activarlo en futuras sesiones corresponde revisar/guardar el borrador y publicar desde la configuración del entorno; la tarea actual ya se validó independientemente. No se afirma restauración futura comprobada.

## Entrega, CI y reservas

El commit de esta entrega contiene código, capturas y documentación; su SHA exacto y checks finales se registran en la [descripción del PR19](https://github.com/LeviEdition/invierno-en-la-colonia/pull/19), evitando referir circularmente este documento a su propio SHA. El workflow H3.3 verifica explícitamente el head, conserva gates anteriores y añade el de la maqueta. La evidencia CI debe contrastarse con ambos hashes del build y distinguirse de los JSON locales aquí versionados.

**Recomendación:** revisar esta maqueta como base visual concreta, sin declarar todavía adopción definitiva de Phaser ni H3.3 aprobado. Reservas: mapa compuesto no separable en edificios, detalle nativo1448×1086 al zoom, textura estimada58,67MiB más superficies auxiliares, repetición de cuatro retratos en máximos, áreas pequeñas de fichas a zoom lejano, arte/pivotes/proporciones provisionales y dispositivos físicos pendientes. No se produjo arte definitivo ni efectos opcionales.

**Única siguiente tarea:** revisión visual del creador del mapa, hospital, colonia máxima y móvil. H3.3 sigue abierto; no iniciar H3.4, conectar el motor, fusionar PR ni modificar main/referencia/SP-03.
