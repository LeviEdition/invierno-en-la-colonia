# H3.4.1 — Mapa de consulta de una partida real

Entrada independiente, experimental. Usa el motor, la preparación, la IA y la interfaz V9.9 existentes. El mapa solo consulta: seleccionar una ficha no cambia el personaje activo del motor. La maqueta H3.3 con sus datos de demostración sigue en otra ruta.

## Windows / VS Code / PowerShell

Abrir en VS Code la carpeta que contiene `package.json` **y** `package-lock.json`. Con Node22 o posterior, conservar los cambios locales antes de cambiar de rama:

```powershell
git fetch origin
git switch experiment/h3-4-1-estado-real
git pull --ff-only
npm.cmd ci
npm.cmd run dev:state-map
```

Mantener la terminal abierta. Abrir **http://127.0.0.1:8775/prototypes/state-map/**.

1. Elegir «2 jugadores locales» o «1 jugador + IA» en la preparación V9.9 que aparece primero. Resolver los pases y decisiones en esa misma interfaz.
2. Se conserva el comportamiento original: el líder inicial puede elegirse desde Grupos antes de actuar; la primera acción confirma al actual. Esta entrega no añade una elección automática ni obliga a elegir antes de consultar.
3. Pulsar **Ver mapa**. Seleccionar edificios/retratos, o usar los selectores del panel. Las fichas muestran identidad real y grupo, con retratos provisionales compartidos.
4. Usar arrastre, rueda/pinza, flechas, `+`, `−`, `0`, controles de cámara y localidades. En móvil, cerrar la ficha con × libera espacio para el mapa.
5. Menú: objetivo, crisis y registro reales; el equipo consultable es el equipado. Las manos se consultan en V9.9. La reserva de dados corresponde al turno, no al retrato seleccionado; no existe historial separado de usados.
6. Para hacer una acción, volver a **Preparación y acciones V9.9**. Los cuatro botones del mapa están deshabilitados. Al volver a Ver mapa se muestran los cambios reales. Un pase o diálogo pendiente retorna a V9.9 y oculta los datos del mapa hasta resolverlo.
7. Ambientación en el panel: controles independientes, apagado total y sonido opcional. Con movimiento reducido inicia sin efectos. No afecta al azar de la partida.

**Reiniciar visor** reinicia cámara/selección/configuración visual, pero conserva la partida del host V9.9. Recargar toda la página inicia de nuevo el flujo existente: esta integración no añade persistencia. Atrás puede restaurar la partida si el navegador conserva la página en bfcache; no debe usarse como sistema de guardado.

**Ctrl+C** detiene el servidor. Si8775 está ocupado, cerrar la otra terminal o elegir otro puerto:

```powershell
$env:STATE_MAP_PORT=8776
npm.cmd run dev:state-map
```

Cambiar8775 por8776 en el enlace. Después de modificar fuentes, detener y ejecutar otra vez el comando para reconstruir.

## Referencias conservadas en el mismo servidor

- Maqueta H3.3 independiente: http://127.0.0.1:8775/prototypes/hospital-workshop/
- Taller técnico: http://127.0.0.1:8775/prototypes/hospital-workshop/tecnico.html
- Canvas: http://127.0.0.1:8775/prototypes/hospital/
- Hospital Phaser H3.2: http://127.0.0.1:8775/prototypes/hospital-phaser/
- Interfaz V9.9 autónoma de esta rama: http://127.0.0.1:8775/invierno_colonia_v9_9.html

El HTML de la release/tag preservados se recupera desde su release; no se reemplaza por estos experimentos. La entrada integrada requiere HTTP, sin doble clic/file:// ni Python.

## Teléfono en la misma red

Detener el servidor anterior y ejecutar:

```powershell
npm.cmd run dev:state-map -- --host 0.0.0.0
```

Usar en el teléfono la URL «Red local» que imprime el comando. Deben estar en la misma Wi-Fi; si Windows pregunta por el firewall, limitar el acceso a la red privada. `127.0.0.1` en el teléfono apunta al teléfono. Esta posibilidad no implica una prueba física realizada.

## Construcción y validación

```powershell
npm.cmd run build:state-map
npm.cmd run check:state-map-build
npm.cmd run check:build
npm.cmd test
```

El servidor construye automáticamente con esbuild existente y Phaser4.2.1 fijado, sin otro bundler. El visor importa presentación/arte, nunca `src/`; el host separado importa el motor real y el UI original, sin Phaser. Un único receptor encadena observación a la interfaz. El canal entrega una lista explícita de datos públicos, sin comandos.

La instrumentación para acciones deterministas solo existe en otro artefacto QA, construido con `node scripts/build-state-map.mjs --qa` y servido con `node scripts/serve-state-map.mjs --qa`, exclusivamente en loopback. El producto no expone `h341Test`, estado interno ni comandos; no hay parámetro URL que active QA. Las comprobaciones Chromium y su instalación externa están en `.github/workflows/h3-4-1-state-map.yml`.

## Reservas

Las posiciones de fichas y accesos son presentación provisional: el motor da conteos, no posiciones individuales de zombis/barricadas. Se asignan visualmente zombis y luego barricadas a los accesos compartidos. Las capacidades reales12/4 prevalecen sobre las posiciones del dibujo; cualquier excedente tiene aviso y lista completa. Cuatro retratos se comparten de modo estable por ID, sin cambiar nombres. El mapa1448×1086 conserva la limitación de nitidez al ampliar y el costo de texturas de H3.3. Sin WebGL se conserva la interfaz V9.9 con aviso/reintento del visor. Sin teléfono físico ni medición de VRAM. Acciones desde el mapa quedan fuera de H3.4.1.
