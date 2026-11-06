# Mapa horizontal — partida real y ambientación

Entrada independiente sobre H3.4.4. **Revisión visual pendiente**, igual que la aceptación manual de búsqueda, ataque y barricadas. No modifica reglas ni adopta arte definitivo.

## Windows, VS Code y PowerShell

Abrir la carpeta que contiene `package.json` y `package-lock.json`. Requiere Node22+ y Git, sin Python:

```powershell
git fetch origin experiment/mapa-horizontal-ambientacion-h3
git switch experiment/mapa-horizontal-ambientacion-h3
git pull --ff-only origin experiment/mapa-horizontal-ambientacion-h3
npm.cmd ci
npm.cmd run dev:horizontal-map
```

Abrir **http://127.0.0.1:8779/prototypes/horizontal-map/**. Primero preparar la partida/líder en V9.9 y pulsar **Ver mapa**. Esta entrada reúne movimiento, búsqueda, ataque y construcción.

Mantener la terminal abierta. **Ctrl+C** detiene el servidor. Tras actualizar: detener, volver a iniciar y recargar con Ctrl+Shift+R. `npm.cmd` evita el bloqueo de npm.ps1 de PowerShell. Si Git no reconoce la rama nueva después del fetch:

```powershell
git switch --track -c experiment/mapa-horizontal-ambientacion-h3 origin/experiment/mapa-horizontal-ambientacion-h3
```

Si8779 está ocupado, detener el servidor que lo usa o elegir otro puerto:

```powershell
$env:HORIZONTAL_MAP_PORT = "8780"
npm.cmd run dev:horizontal-map
```

En ese caso cambiar8779 por8780 en el enlace. Para teléfono en la misma Wi-Fi:

```powershell
npm.cmd run dev:horizontal-map -- --host 0.0.0.0
```

Abrir en el teléfono la URL LAN que imprime Node. PC activa; permitir Node en red privada si Windows lo solicita. No usar127.0.0.1 desde el teléfono. **No se realizó una prueba física móvil.** Se prioriza orientación horizontal; vertical conserva controles y recomienda girar.

## Qué revisar

1. Arrastrar, rueda/pinza y botones de zoom/restablecer. Con foco en el mapa: flechas, más/menos y0. Seleccionar las siete localidades desde el dibujo o los selectores; Centrar localidad encuadra el sector. En móvil pliega la ficha para liberar el mapa; se puede reabrir con Ficha. En escritorio el dossier reserva un lateral.
2. Seleccionar propios y rivales: azul/J1, rojo/J2 y halo del seleccionado, identidad estable. Revisar particularmente hospital y comisaría, sus accesos y el espacio de los paneles.
3. **Moverse:** elegir destino, cancelar primero y después confirmar. Se conserva1500ms y la exposición real; las calles no crean caminos/costes.
4. **Buscar:** dado, confirmar, elegir una carta o ruido cuando sea legal e Inventario del jugador; separado del equipo individual.
5. **Atacar/Construir:** elegir dado/coste real y confirmar; exposición/bajas o barricadas según el motor. Constructor puede ofrecer la habilidad existente sin dado. No aparecen otras acciones. Muerte/encrucijadas no soportadas esperan Continuar en V9.9 explícito; resolver y volver.
6. Ambientación: apagar todo, activar individualmente, comparar Suave/Tormenta, observar el balanceo ampliado de las copas y sus bases fijas, humo de la chimenea de colonia y las tres luces locales. **Viento controla también el movimiento de vegetación.** Sonido empieza apagado; movimiento reducido desactiva animaciones al iniciar. Luces apagadas retira tanto fuente animada como iluminación cercana; las otras ventanas del arte siguen estáticas.
7. Menú → Referencia completa del arte permite comparar el original. Revisar diferencias de encaje y nitidez, sin dar por aceptada la recomposición. Las capturas de capacidad máxima están marcadas **sintéticas/QA**, no son una preparación real de partida.

## Resolución y límites

Los tres originales miden **1672×941**. Cámara fija, sin rotación; mínimo que cubre el área visible sin vacío y máximo1,5 píxeles CSS por píxel fuente —o el mínimo de cobertura si una ventana excepcionalmente grande lo exige—. Los porcentajes de la barra son relativos al encuadre inicial, no detalle adicional.

Para nitidez nativa orientar la revisión hasta≈1 CSS por píxel a DPR1; a DPR2 el mismo tamaño necesita el doble de muestras físicas. El máximo ayuda a leer fichas y controles, **no recupera** detalle de puertas, ventanas, rostros pintados o vegetación. El arte es provisional y esas zonas requerirían fuentes mayores para primeros planos nítidos; no se ampliaron los PNG fingiendo recuperarlo.

Hay ocho grupos de vegetación animados; el resto/cables/edificios/postes/cercos permanece fijo. Los doce accesos de colonia se distribuyen fuera del cerco en cuatro tramos ordenados. En horizontal el centrado incluye el perímetro; en vertical estrecho se recorren los extremos con arrastre. Los contornos de las siete localidades siguen los salientes del arte, sin reducir el área de clic.

Las tres luces animadas alternan varios segundos estables con episodios de tres titileos rápidos e independientes (≈0,70–0,94s). Observar hospital y colonia15–20s con Luces activado. Desactivar Luces retira fuente y mancha; apagar toda la ambientación detiene también el render continuo. Movimiento reducido comienza sin animaciones.

Las tres capas generadas no encajan perfectamente: se protege la silueta de edificios con recortes del mismo fondo y se conservan reservas de borde/color de la vegetación. No se rediseñó el mapa ni se ocultó el problema con nieve.

El servidor conserva **http://127.0.0.1:8779/prototypes/action-map/** para comparar H3.4.4 y las entradas previas. No reemplaza sus recursos ni main/referencia. No hay guardados nuevos: recargar la página completa puede reiniciar la partida; reiniciar solo el visor conserva el host real.

## Construcción y QA

```powershell
npm.cmd run build:horizontal-map
npm.cmd run check:horizontal-map-build
npm.cmd run check:build
npm.cmd test
npm.cmd run test:poc
```

El visor no importa el motor; usa el mismo host, controladores y contrato de H3.4.4. QA se construye con `node scripts/serve-horizontal-map.mjs --qa`, exclusivamente loopback. La biblioteca/página de capacidad sintética y las herramientas del motor no se sirven en producto.

Datos editables: `scene.json` (localidades/fichas/accesos), `environment.json` (grupos/pivotes/luces), `atmosphere.json` (nieve/viento/humo). Originales y hashes en `assets/mapa-horizontal/manifest.json`. [Informe91](../../docs/91-ajustes-visuales-mapa-horizontal.md), [historia90](../../docs/90-mapa-horizontal-ambientacion.md) y descripción del PR25 registran resultados, evidencia y CI exacto. No son una aceptación manual del creador.
