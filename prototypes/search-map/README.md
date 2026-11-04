# H3.4.3 — Buscar y moverse desde el mapa

Entrada experimental independiente. Una sola partida real vive en el host V9.9; el mapa envía intenciones acotadas y presenta lo que devuelve ese motor. No habilita atacar, construir, terminar turnos ni gestionar objetos desde el mapa. La interfaz y los prototipos anteriores siguen disponibles.

## Windows, VS Code y PowerShell

Abrir en VS Code **la carpeta que contiene package.json y package-lock.json**. Node22 o posterior, Git y navegador con WebGL. En su terminal:

```powershell
git fetch origin
git switch experiment/h3-4-3-busqueda-mapa
git pull --ff-only
npm.cmd ci
npm.cmd run dev:search-map
```

Abrir **http://127.0.0.1:8777/prototypes/search-map/**. No requiere Python ni Live Server. `npm.cmd` evita el bloqueo de `npm.ps1` por la política de PowerShell. Mantener la terminal abierta; **Ctrl+C** detiene el servidor. Este construye los bundles al arrancar: después de actualizar código, detenerlo, iniciarlo otra vez y recargar con Ctrl+Shift+R.

Si aparece `EADDRINUSE`, el puerto ya tiene un servidor. Usar su terminal para detenerlo o elegir otro puerto:

```powershell
$env:SEARCH_MAP_PORT = "8778"
npm.cmd run dev:search-map
```

En ese caso abrir `http://127.0.0.1:8778/prototypes/search-map/`. El enlace solo funciona en el equipo que ejecuta el comando.

## Recorrido para revisión

1. Preparar partida y resolver la elección inicial en V9.9. Pulsar **Ver mapa** y seleccionar un personaje propio. Buscar explica por qué está deshabilitado si está en la colonia, no hay cartas o no alcanza ningún dado.
2. **Moverse** a una localidad exterior y confirmar. Se conserva la presentación de1500ms y exposición real. Si aparece una decisión, pulsar **Continuar en V9.9**, resolverla allí y volver al mapa.
3. Con el mismo personaje, pulsar **Buscar**. Ver requisito efectivo, elegir uno de los dados reales y revisar personaje/localidad/dado. Cancelar o Escape antes de confirmar no gasta nada. Los números «Dado1», «Dado2» distinguen valores repetidos.
4. Confirmar. Tras≈750ms aparece la carta real. Conservar una, o **Revelar otra carta · +1 ruido** cuando el motor lo permita; conservar **una sola**, con las demás devueltas al fondo. El ruido no se genera por la primera revelación normal.
5. Revisar carta conservada, resumen, dados y sección **Mano del turno** —solo lectura—; pulsar Continuar. Rescates aplican reclutamiento/cola reales y lo explican. Una encrucijada general conserva el resultado en pantalla y espera una transición deliberada a V9.9.
6. Probar zoom/pan, entrada por teclado y tamaños pequeños. El panel de búsqueda se desplaza internamente cuando no caben todas las cartas; el mapa conserva su encuadre. Selección por teclado: abrir Ficha → Consultar por teclado. Tab/Enter eligen y confirman; Escape cancela solo antes de ejecutar.
7. Probar cambio de jugador desde V9.9: el pase limpia cartas/mano del mapa y J2 ve solamente su propia información. Interrumpir una elección volviendo a V9.9 y regresar recupera la elección real, sin otro robo. Ante resultado incierto se consulta el estado; no se reenvía automáticamente.

Movimiento reducido abrevia la presentación de búsqueda y desactiva los efectos iniciales. Sonido inicialmente apagado; las preferencias de ambientación no usan el RNG del juego. Después de confirmar, Escape no devuelve el dado ni elimina una decisión obligatoria.

## Celular en la misma red

En la PC:

```powershell
npm.cmd run dev:search-map -- --host 0.0.0.0
```

El servidor imprime la URL de red, por ejemplo `http://192.168.1.10:8777/prototypes/search-map/`. Abrir **esa dirección impresa**, con PC y celular en la misma Wi-Fi y el servidor activo. Si Windows lo solicita, permitir Node en la red privada. No usar `127.0.0.1` desde el teléfono. No se publica en Internet. Esta guía no constituye una prueba realizada en teléfono físico.

## Rutas conservadas y QA

Con el mismo servidor: `/prototypes/movement-map/` (H3.4.2), `/prototypes/state-map/` (H3.4.1), `/prototypes/hospital-workshop/` (maqueta H3.3). Canvas y Phaser hospital siguen en sus rutas previas. El visor nuevo no importa el motor; solo el host lo empaqueta.

Para QA, instalar Playwright/Chromium externos como indica `.github/workflows/h3-4-3-search-map.yml`, iniciar `node scripts/serve-search-map.mjs --qa` y ejecutar `node scripts/check-h343-browser.mjs`, `check-h343-edge-browser.mjs`, `check-h343-movement-browser.mjs` y `check-h343-camera-browser.mjs`. El servidor QA solo admite loopback. Esa instrumentación no está en el producto normal ni debe compartirse en LAN.

Compuertas: `npm run check:build`, `npm test`, `npm run test:poc`, `npm run check:search-map-build` tras construir con `npm run build:search-map`. El workflow repite las regresiones previas y conserva JSON, videos y trazas del head exacto. [Informe87](../../docs/87-h3-4-3-busqueda-mapa.md).

## Límites

Sin persistencia: reiniciar el visor conserva la partida del host, recargar toda la página puede reiniciarla. La mano del turno es de consulta, no permite usar/equipar/transferir. Registro completo y decisiones generales permanecen en V9.9; el registro heredado puede nombrar cartas privadas y no se transmite al mapa. La prueba no certifica aislamiento frente a herramientas de desarrollo en este juego local de dispositivo compartido.

Arte, distribución, capacidades visuales y rendimiento físico siguen pendientes. La emulación móvil/SwiftShader no demuestra fluidez en un teléfono. Falta revisión visual del creador; sin merge ni avance a combate.
