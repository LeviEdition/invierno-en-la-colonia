# H3.4.4 — Ataque, barricadas, búsqueda y movimiento

Entrada experimental con una sola partida V9.9 real. El mapa presenta el estado y envía intenciones; las reglas, dados, habilidades, bajas y exposición siguen en el motor. **H3.4.3 y H3.4.4 están pendientes de la revisión manual del creador.** Sin merge ni cambios en la referencia preservada.

## Windows / VS Code / PowerShell

Abrir la carpeta del repositorio que contiene **package.json y package-lock.json**, con Node22+ y Git. En su terminal:

```powershell
git fetch origin
git switch experiment/h3-4-4-ataque-barricadas-mapa
git pull --ff-only
npm.cmd ci
npm.cmd run dev:action-map
```

Abrir **http://127.0.0.1:8778/prototypes/action-map/**. Esta es la versión con las cuatro acciones. No requiere Python ni Live Server. `npm.cmd` evita el bloqueo de npm.ps1 en PowerShell.

Mantener la terminal abierta. **Ctrl+C** detiene el servidor. Después de actualizar código: detenerlo, iniciarlo de nuevo y recargar con Ctrl+Shift+R, porque construye al arrancar. `EADDRINUSE` significa que ese puerto ya tiene un servidor; detener el anterior o elegir otro:

```powershell
$env:ACTION_MAP_PORT = "8779"
npm.cmd run dev:action-map
```

En ese caso abrir `http://127.0.0.1:8779/prototypes/action-map/`.

## Recorrido manual para revisar ambas etapas

1. Preparar la partida y líder en V9.9; pulsar Ver mapa. Seleccionar un personaje propio. Seleccionar un rival debe ocultar las acciones. En pantallas pequeñas hay accesos rápidos inferiores y una ficha plegable; los paneles de confirmación tienen scroll interno.
2. **Atacar:** puede hacerse en la colonia inicial, donde hay zombis. Ver requisito efectivo, objetivo y dados reales; elegir uno y confirmar o cancelar/Escape. Los números Dado1/2 distinguen valores iguales. Se señala el grupo de zombis y se presentan las bajas; después, si corresponde, exposición real y daños/muerte. El dado de acción se gasta, no se vuelve a tirar. El equipo puede evitar exposición; el aviso lo diferencia de una tirada sin daño.
3. **Construir:** revisar accesos, dado1+ y cantidad prevista según habilidad/equipo; confirmar. Zombis y barricadas comparten los mismos accesos. Leo/Hugo ofrecen además **Habilidad: sin dado**, una barricada una vez por ronda; esa opción no recibe el bonus del equipo de reparación. Después de usarla queda indisponible hasta la ronda siguiente. Cancelar antes de confirmar no gasta nada.
4. **Moverse:** elegir localidad y confirmar; se conserva el recorrido de1500ms y la exposición. El dibujo no introduce caminos, distancias ni ataques a otras localidades.
5. **Buscar:** con un personaje fuera de colonia, elegir dado y confirmar. Conservar una carta o revelar otra con +1 ruido cuando esté permitido. Las demás vuelven al fondo. Revisar el **Inventario del jugador**, separado del equipo del superviviente; es de consulta, sin usar/equipar/transferir desde el mapa.
6. Mantener zoom/pan al ejecutar las acciones. Probar ratón, Tab/Enter/Escape y tacto/pinza si el dispositivo lo permite. Revisar especialmente celular horizontal y luego vertical.
7. Ante muerte, mordedura, sucesión o encrucijada no trasladada: el resultado espera **Continuar en V9.9**. Resolver allí y volver al mapa. No hay confirmación automática. Un pase de dispositivo limpia el inventario visible; J2 consulta y gasta sus propios dados.

El único objetivo legal de ataque de V9.9 es el grupo de zombis de la localidad actual. No hay zombis individuales con vida/ID ni selección de edificios remotos. Los espacios exactos son representación: el motor guarda cantidades agregadas; no se crea una regla para elegir un acceso físico.

## Celular en la misma Wi-Fi

En la PC:

```powershell
npm.cmd run dev:action-map -- --host 0.0.0.0
```

Abrir desde el teléfono la URL **de red impresa por Node**, por ejemplo `http://192.168.1.10:8778/prototypes/action-map/`. PC activa y ambos equipos en la misma red; si Windows lo solicita, permitir Node en red privada. No usar127.0.0.1 desde el teléfono. Esto describe cómo probarlo; no afirma que se haya probado un teléfono físico.

## Construcción y QA

`npm run build:action-map` construye visor y host; `npm run check:action-map-build` contrasta esa salida. `npm run check:build`, `npm test` y `npm run test:poc` comprueban la referencia y regresiones. El workflow H3.4.4 instala Playwright/Chromium externos, comprueba el head exacto y conserva evidencia.

Para QA en loopback: `node scripts/serve-action-map.mjs --qa`, después los cuatro scripts `check-h344-*.mjs` secuencialmente. QA no se sirve por LAN ni se incluye en el producto normal. No hace falta instalar Playwright para jugar.

El mismo servidor conserva `/prototypes/search-map/` (H3.4.3), `/prototypes/movement-map/`, `/prototypes/state-map/` y `/prototypes/hospital-workshop/`. No confundir la ruta de búsqueda anterior con la nueva entrada que añade ataque/construcción.

## Límites

Sin guardados nuevos: reiniciar el visor conserva la partida del host; recargar toda la página puede reiniciarla. Una solicitud de resultado incierto consulta el estado y no se reenvía. Reinicio/reconexión no repiten combate, ruido ni consumo. El encuadre se mantiene durante las acciones; reconstruir el visor restablece su encuadre inicial.

Inventario accionable, terminar turnos y otras habilidades manuales siguen en V9.9. Arte, mapa horizontal definitivo y capacidades visuales pendientes no cambian. El renderizado por software y la emulación no certifican rendimiento de un teléfono. [Informe88](../../docs/88-h3-4-4-ataque-barricadas-mapa.md), con pruebas, capturas, video y reservas.
