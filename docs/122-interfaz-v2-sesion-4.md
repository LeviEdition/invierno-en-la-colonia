# 122 — Interfaz v2, sesión 4: barra de acción, tarjetas y papel viejo

23/11/2026. Rama `feature/interfaz-v2-sesion-4`, apilada sobre `feature/interfaz-v2-sesion-3` (PR #40, [121](121-interfaz-v2-sesion-3.md)). Foco en escritorio (1365×768); en 852×393 no se rompe nada.

```bash
npm run check:build && npm test     # 909 pruebas
npm run check:mapa-build
node scripts/generar-papel.mjs --check
```

## Qué cambió

**A. Papel viejo (reemplaza la nieve de los paneles).**
- **Nieve:** sale de todos los paneles y queda solo en el mapa. La chapa sigue en la fila superior.
- **Papel:** crema amarillento que oscurece hacia los bordes, con fibra y grano finos, un pliegue suave y el borde rasgado (el mismo `clip-path` de la sesión 2). Tres variantes: barra, tarjeta y ficha.
- **Generación:** `scripts/generar-papel.mjs` lo genera una vez, con `mulberry32` y semilla, y lo guarda en `assets/interfaz/papel/`. El navegador no calcula filtros: dibuja un tono por variante, de baja resolución y estirado, y encima un grano de 128×128 en mosaico multiplicado.
- **Peso:** 8 archivos, **35,8 KB en total** (papel 24,0 KB, manchas 11,8 KB).
- **Sangre seca:**
  - Marrón oxidado desaturado (`#643228`, anillo `#4C241C`, con transparencia), más oscuro y menos saturado que Sangre fría.
  - Capa aparte: cada mancha es su propio elemento `.mancha`, entre el papel y el contenido. Su posición está en `manchas.css`, generado por el mismo script.
  - Una por panel, en una esquina que la disposición deja libre: barra, objetivo y ficha abajo o arriba a la derecha; la de Crisis es más grande.
  - Posiciones fijas, sorteadas con la semilla; no cambian al abrir ni al cerrar.
- **Tipografía:** variables `--fuente-texto` y `--fuente-titulo` con respaldo serif. No se agregaron fuentes.

**B. Transiciones** (se amplió `experiencia/transitions.mjs`, no hay otro sistema).
- **Paneles:**
  - Entran con fundido y 8–12 px desde su borde (`--v2-shift`): barra desde abajo, tarjetas desde la izquierda, ficha desde la derecha y menú desde arriba.
  - La entrada dura 200 ms y la salida 180 ms, ambas `ease-out`.
  - La salida parte de la opacidad y el desplazamiento del instante, así que una salida a mitad de una entrada no salta.
- **Cambio de superviviente:** fundido cruzado de 200 ms (retrato, nombre, rol, localidad y heridas), con una copia inerte de lo viejo; el panel no cambia de tamaño.
- **Dados:** el elegido muestra el borde Lámpara con fundido y un pulso de escala 1 → 1,06 → 1; el usado pasa a gris con fundido de 200 ms. Ambos cambios llegan de la proyección.
- **Tarjetas:** la barra de progreso avanza con `transform` en 300 ms y el texto cambia con fundido.
- **«Terminar turno»:** los dados del estado siguiente entran con fundido corto.
- **Reglas comunes:**
  - Solo se animan `opacity`, `transform` y `translate`.
  - `will-change` se pone solo durante una transición, desde el código.
  - Con movimiento reducido no hay desplazamiento, escala ni copia: el cambio es instantáneo o con fundidos de 60 ms.

**C. Barra de acción permanente.**
- **Contenido:** retrato, nombre, rol, localidad y heridas (♥ y ❄ sobre chapa oscura, con sus colores de señal); los dados con puntos; «Buscar», «Atacar», «Moverse», «Más» y «Terminar turno» en Lámpara sólida.
- **Superviviente activo:** el seleccionado. Si no hay, se muestra al líder del grupo en turno como vista previa: el retrato va con borde punteado, y al usar la barra se lo elige sin abrir la ficha.
- **Botones:** activan los mismos botones de la ficha, con sus controladores y sus validaciones del motor; la barra no calcula costes ni reglas. Un mismo control queda trabado 450 ms después de activarse.
- **Ficha lateral:** pasa a ser detalle. Se abre con «Más» o con el retrato, y no perdió contenido. Termina arriba de la barra.
- **Dados usados:** salen de los eventos `die` que el motor emite al gastar un dado, desde el último comienzo de ronda o turno. El dado gastado queda gris en su lugar.
- **Pase de dispositivo:** la proyección llega bloqueada y vacía, así que la barra no muestra superviviente, dados ni registro.

**D. Tarjetas de Objetivo y Crisis.** Arriba a la izquierda, en papel:
- **Objetivo:** «Encontrar la cura · 4 de 7 muestras · R8» y su barra.
- **Crisis:** «Crisis · 2 medicinas · 1 de 2», su barra, la consecuencia y «Aportar a crisis».
- **Datos:** los que el motor ya proyectaba; los textos anteriores siguen, ocultos a la vista, para los lectores de pantalla.

**E. Recurso en peligro: hecho para la comida, no para los residuos.**
- **Comida:** el motor ya sabe cuándo está en peligro. En la fase de colonia calcula `feedingNeed(game)` y comprueba `food>=need`. Ahora `feedingNeed` es una capacidad de solo lectura, como `noiseLimit` (`viewCapabilities`, HTML regenerado). La proyección expone `resources.food:{need,danger}` con esa misma condición.
- **Cómo se ve:** la chapa de comida lleva anillo y número en insignia en `#B5473F`.
- **Residuos no se hizo:** el umbral es un literal dentro de `colony()` (`game.waste>=10`). Exponerlo obligaría a copiar ese número o a tocar el motor; queda para que decidas.

## Qué se comprobó

- **909 pruebas, 0 fallos.** Hay 8 nuevas en `interfaz-v2-sesion-4.test.mjs`:
  - **Peligro de comida:** sale de `feedingNeed` y es la misma condición del motor; el contexto es de solo lectura; proyectar no tira.
  - **Privacidad:** en el pase y demás bloqueos, la barra y las tarjetas quedan vacías.
  - **Barra:** superviviente activo, vista previa y textos de las tarjetas.
  - **Dado usado por el camino real:** motor → broker → barra; repetir la solicitud no gasta otro dado.
  - **Traba de doble clic.**
  - **Transiciones:** solo opacity y transform, 8–12 px, y nada con movimiento reducido.
  - **Papel y manchas:** reproducibles, al día, peso, color lejos de la señal, una por panel en esquina, capa aparte y sin nieve.
  - **Estructura:** se conservan los ids.
- **Pruebas anteriores:** se actualizó una de la sesión 2, porque el pino ahora está anclado a la barra de acción.
- `check:build`, `check:mapa-build`, `generar-papel --check` y `detectar-luces --check` en verde.
- **Batería `check-map-experience-browser`**, corrida localmente con Edge: pasa en 1365×768 y 852×393, con movimiento normal y reducido.

## Qué informa una herramienta

Edge local en modo QA, a 1365×768 (guion propio, no es una batería del repositorio):
- **Contraste**, medido contra el papel real bajo cada texto (tinta oculta un instante, percentil 5 del fondo):
  - mínimo **6,23:1** con la ficha de localidad y **6,35:1** con la ficha de búsqueda, en 30 textos;
  - el único caso bajo 4,5:1 es el símbolo ♥ (Sangre fría sobre chapa oscura, 3,47:1). Es la señal gráfica aprobada de los globos del mapa y supera el 3:1 de los gráficos.
- **Manchas:** ninguna de las cuatro toca texto, botón, dado ni retrato de su panel, con la ficha cerrada y abierta.
- **Doble clic en «Buscar»:** abre un solo borrador. Al elegir un dado, la barra lo marca; al confirmar, el motor lo gasta y la barra lo pasa a gris en su lugar.
- **Transición a mitad**, congelada a 100 de 200 ms: opacidad 0,68 y desplazamiento 3,8 px.
- **Movimiento reducido:** ninguna animación en la ficha ni en la barra.
- **852×393:** sin desbordes; las tarjetas quedan arriba de la barra.

Capturas:
- [barra y tarjetas](evidencias/interfaz-v2/122-barra-tarjetas-1365x768.jpg)
- [ficha abierta con el dado elegido](evidencias/interfaz-v2/122-ficha-abierta-1365x768.jpg)
- [mancha de Crisis](evidencias/interfaz-v2/122-mancha-crisis-1365x768.jpg)
- [la ficha entrando, a mitad](evidencias/interfaz-v2/122-transicion-ficha-1365x768.jpg)

## Qué falta

- **CI del PR:** el resto de las baterías de navegador (algunas graban vídeo y acá no hay ffmpeg) y el oráculo `test:poc`, que no corre en Windows (hallazgo 14). `src/` solo cambió en la lista `viewCapabilities`.
- **Jugando en escritorio:**
  - el tono del papel y si la sangre se lee como sangre seca y no como señal;
  - la vista previa del líder en la barra;
  - el ritmo de las transiciones;
  - si tocar una ficha del mapa debe seguir abriendo la ficha lateral (hoy sí la abre; la barra no).
- **En el Galaxy A15:** el peso y la nitidez del papel estirado, los objetivos táctiles de 44 px de la barra y la memoria.
- **Decisión pendiente:** los residuos en peligro (pieza E).
