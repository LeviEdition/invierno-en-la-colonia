# H3.4.2 — Movimiento desde el mapa

Prototipo conectado al motor real V9.9. Solo habilita **Moverse**: no buscar, atacar, construir, consumir dados/equipo ni finalizar turnos desde esta vista.

## Windows / VS Code / PowerShell

Node22 o posterior. Abrir la carpeta con **package.json y package-lock.json**; conservar trabajo local antes de cambiar de rama:

```powershell
git fetch origin
git switch experiment/h3-4-2-movimiento-mapa
git pull --ff-only
npm.cmd ci
npm.cmd run dev:movement-map
```

Abrir **http://127.0.0.1:8776/prototypes/movement-map/**. No requiere Python. Mantener la terminal abierta; Ctrl+C detiene el servidor. `npm.cmd` evita el bloqueo de npm.ps1 sin cambiar políticas.

1. Preparar la partida en V9.9. Elegir líder desde Grupos si se desea, conservando su flujo original; resolver allí los pases y decisiones.
2. Pulsar **Ver mapa**, seleccionar un superviviente propio y **Moverse**.
3. Se iluminan simultáneamente los edificios legales. Tocá uno para proponerlo; el contorno y relleno más intensos distinguen ese destino. El selector secundario «Elegir destino por teclado» ofrece la misma consulta del motor; las posiciones del dibujo no establecen capacidad.
4. Revisar **nombre, origen y destino**. «Elegir otro destino» o Escape vuelve a la elección; «Salir de Mover» o un segundo Escape sale sin modificar la partida. En móvil la ficha se contrae durante la elección para dejar mapa utilizable y se recupera al salir.
5. El motor resuelve una sola vez. Tras aceptar: recorrido de **1,5 segundos** → animación del dado → resultado real visible → consecuencia. Una habilidad que evita tirar se explica sin inventar un dado. Si hay una decisión pendiente, el mapa espera: pulsá **Continuar en V9.9**, resolvela allí y después Ver mapa. Ninguna decisión se confirma automáticamente. Movimiento reducido usa una transición breve.
6. Fuera de Moverse, seleccionar un edificio sigue consultando la localidad. Un rival muestra su información sin sección de acciones. Para un personaje propio, Moverse explica sus restricciones reales; las otras tres acciones permanecen deshabilitadas.

Mientras resuelve, no se admiten confirmaciones repetidas. Si se interrumpe la conexión no se reenvía la acción: se consulta el estado actual. El mensaje puede indicar resultado desconocido hasta recuperar esa consulta. **Reiniciar visor** conserva la partida, limpia la elección visual y no repite movimientos. Cambiar de vista, ocultar la pestaña o reconectar durante la presentación recupera el estado real sin repetir animación, movimiento ni tirada. Recargar toda la página no añade persistencia/guardados.

## Identidad y ambientación

- J1: círculo azul; J2/IA: rojo. Selección con borde más grueso y halo suave estático. J1/J2 e identificación por nombre/grupo siguen en etiquetas, ficha y selectores.
- Asignación explícita provisional: Mara `h0`→retrato1, Leo `h1`→2, Bruno `a1`→3 y Ada `a0`→4. Iris, Sol y nuevas incorporaciones usan iniciales/nombre accesible. No se compacta ni se reutiliza un retrato al morir su dueño. El kit original no se modifica.
- Perfiles **Suave** y **Tormenta**, esta última inicial. Tormenta aumenta densidad, velocidad/diagonal, ráfagas continuas irregulares y nieve arrastrada; algunos copos grandes dan profundidad. Pool fijo **158** objetos de partículas, reutilizados. Humo y luces conservan sus anclajes; sin humo inventado en hospital.
- Preferencia de movimiento reducido: efectos inicialmente apagados. Controles individuales y apagado total; apagado vuelve al renderizado bajo demanda. Sonido de ventisca opcional, **apagado al inicio**.
- Dados con puntos para1–6; cualquier otro valor real se muestra numéricamente, sin recortarlo. Los dados siguen perteneciendo al turno, no al personaje seleccionado.

## Rutas anteriores conservadas

En el mismo servidor8776:

- H3.4.1 de consulta: `/prototypes/state-map/`.
- Maqueta H3.3 independiente: `/prototypes/hospital-workshop/`.
- Taller técnico: `/prototypes/hospital-workshop/tecnico.html`.
- Canvas / Phaser H3.2: `/prototypes/hospital/` y `/prototypes/hospital-phaser/`.
- V9.9 autónoma de esta rama: `/invierno_colonia_v9_9.html`.

Las fuentes de esos prototipos permanecen intactas. El motor compartido tiene una consulta pura y un ingreso específico por ID; el flujo anterior usa las mismas consecuencias extraídas. El HTML de esta rama se regenera para mantener el build; no es una nueva release ni reemplaza el HTML preservado.

## Otro puerto / teléfono en la misma Wi-Fi

Si8776 está ocupado, detener la otra terminal o elegir otro puerto:

```powershell
$env:MOVEMENT_MAP_PORT=8777
npm.cmd run dev:movement-map
```

Para servir a la red privada, detener el servidor y ejecutar:

```powershell
npm.cmd run dev:movement-map -- --host 0.0.0.0
```

Abrir en el teléfono la URL «Red local» que imprime el comando. `127.0.0.1` en el teléfono apunta al propio teléfono. Windows puede requerir permitir Node en la red **privada**. Los identificadores no requieren `crypto.randomUUID`, que puede faltar en HTTP de LAN. La compatibilidad técnica no equivale a una prueba física realizada.

## Construir / comprobar

```powershell
npm.cmd run build
npm.cmd run check:build
npm.cmd run build:movement-map
npm.cmd run check:movement-map-build
npm.cmd test
```

Se usan esbuild0.28.2 y Phaser4.2.1 existentes, sin nuevas dependencias. Reiniciar el servidor después de cambiar fuentes recompila las entradas. No abrir mediante doble clic/file://.

El QA separado (`node scripts/serve-movement-map.mjs --qa`) solo admite loopback y añade artefactos de prueba; el servidor normal no los sirve. No hay parámetro URL que habilite un dispatcher del motor en producto. Los scripts Chromium y el workflow `h3-4-2-movement-map.yml` documentan la instalación externa de Playwright y sus recorridos.

Pendientes: revisión visual del creador, teléfono físico, nitidez del mapa al ampliar, proporciones/arte/capacidades visuales definitivas y mapa más horizontal. No hay navegación por calles, distancias, colisiones ni animación de caminata. No avanzar a otras acciones sin autorización.

La revisión de continuidad, los videos anteriores/posteriores, la estructura de exposición y sus reservas están en [informe85](../../docs/85-h3-4-2-experiencia-movimiento.md). La interpolación es de una ficha de tablero, no representa caminos ni movimiento físico.

Corrección de pan/zoom: [informe86](../../docs/86-h3-4-2-sincronizacion-camara-fichas.md). Tras actualizar, detener el servidor con Ctrl+C, ejecutar `git pull --ff-only` desde esta rama, volver a iniciar `npm.cmd run dev:movement-map` y recargar con Ctrl+Shift+R. Esto recompila el bundle: dejar el servidor anterior abierto conserva su construcción anterior. La cámara de las fichas ahora se publica junto al cuadro de Phaser; no se aumenta el límite de FPS.
