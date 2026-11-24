# 126 — Interfaz v2, sesión 7: una sola barra para actuar y un expediente para leer

24/11/2026. Rama `feature/interfaz-v2-sesion-7`, apilada sobre `feature/interfaz-v2-sesion-6` ([125](125-interfaz-v2-sesion-6.md)). Foco en escritorio (1365×768); en 852×393 no se rompe nada.

- `src/` no cambió. No hizo falta exponer ninguna capacidad nueva: todo sale de las opciones que el motor ya proyecta.
- La guía [109 §8](109-guia-de-estilo.md) quedó actualizada.

## Paso 0: inventario de acciones y decisiones

Lo revisó el creador antes de implementar. Decisiones:
- inventario por propósitos;
- «+1» en la zona de dados;
- movimiento sin papel al centro;
- tocar una ficha no abre el expediente.

| Antes | id | Capacidad del motor | Cuándo aparece | Ahora |
|---|---|---|---|---|
| Ficha · Acciones | `search-action` | `search.options[id]` | Superviviente propio en su turno | **Barra**, siempre visible |
| Ficha · Acciones | `attack-action` | `action.options[id].attack` | Ídem | **Barra**, siempre visible |
| Ficha · Acciones | `move-action` | `movement.options[id]` | Ídem | **Barra**, siempre visible |
| Ficha · Acciones | `barricade-action` | `action.options[id].barricade` / `barricade-ability` | Ídem | **Abanico** |
| Ficha · Acciones | `clean-action` | `play.options[id].clean` | Ídem | **Abanico** |
| Ficha · Acciones | `attract-action` | `play.options[id].attract` | Ídem | **Abanico** |
| Ficha · Acciones | `special-action` | `play.options[id].special` | Médico o enfermera | **Abanico** |
| Ficha · Acciones | `return-home-action` | `play.options[id]['return-home']` | Regla activa | **Abanico** |
| Ficha · Dados | `boost-action` | `play.boost` | Turno propio | **Zona de dados de la barra**, «+1 (1 comida)», solo si está permitido |
| Ficha · Personaje | `character-inventory` (Usar, Equipar, Transferir, Aportar) | `inventory.private.options` | Superviviente del turno | Dividido por propósito (ver abajo) |
| — | `use-card-action` (nuevo) | ídem, modo `use` | Si el motor permite usar alguna carta de uso | **Abanico** → papel al centro |
| Tarjeta de crisis | `crisis-contribute` | ídem, propósito `crisis` | Siempre | Sin cambio; único lugar para aportar |
| Menú | `menu-inventory`, `menu-groups`, `menu-new-game` | — | Siempre | Sin cambio (el inventario del menú abre la vista del expediente) |
| Barra | `bar-search/attack/move` | — | — | **Quitados**: la barra usa los botones reales |
| Barra | `bar-more`, `bar-portrait`, `finish-turn` | — | — | «Más» abre el abanico; el retrato abre el expediente; «Terminar turno» sin cambio |
| Ficha | `search-panel`, `action-panel` | search / action | Durante la acción | **Papel al centro** (`#action-stage`) |
| Ficha | `move-planner` | movement | Durante el movimiento | **Papel chico sobre la barra** + tira |
| Ficha / cuerpo | `play-dialog` (loot, heal, attract, transfer, recruit, ack) y `cycle-dialog` (fin de turno, fase de colonia) | play / cycle | Decisiones | **Papel al centro**; «Grupo y líderes» queda en el expediente |
| Modal | mordedura, encrucijada, muerte, pase, final | play / cycle | Decisiones obligatorias | Sin cambio (modales al centro) |

**Inventario por propósitos.** Es un solo componente (`inventoryView` en `juego/turn-flow.mjs`):
- `use`: abanico «Usar carta». Solo cartas de uso, incluido el combustible con destino. Va en papel al centro.
- `manage`: expediente y menú. Cartas para equipar («Equipar») y equipo («Dar … a…»).
- `crisis`: tarjeta de crisis. Solo lo legal para aportar.

«Aportar a la crisis» ya no aparece en las otras vistas.

## Qué cambió

- **Barra única.** De izquierda a derecha:
  - miniaturas del grupo (la activa en Lámpara; tocar una la hace activa);
  - el superviviente activo, con tres ranuras de equipo: muestran lo que tiene y no aplican el límite «uno de cada tipo», que es regla del hito;
  - los dados y «+1»;
  - Buscar, Atacar, Moverse y «Más»;
  - «Terminar turno», separado a la derecha.

  Si no hay nadie seleccionado, las acciones actúan sobre el líder del grupo en turno, igual que la vista previa que ya mostraba la barra.
- **Abanico.** Solo lista las acciones cuyo botón el motor habilita. Se cierra al elegir, con Esc o tocando fuera. «Más» se apaga si no hay ninguna, en turno ajeno o con una acción en curso.
- **Tira de acción.** Una línea sobre la barra («Buscar en Escuela · elegí un dado de 3 o más · Cancelar (Esc)»).
  - Los dados que el motor acepta se marcan en Lámpara y los demás se apagan.
  - Tocar un dado de la barra o pulsar 1–4 lo elige a través del mismo botón del panel.
  - «Cancelar» usa el mismo camino que Esc en cada panel.
- **Papel al centro** (`#action-stage`). Se movieron los paneles existentes y se los vistió; no se reescribieron. `present()` los manda al centro cuando el diálogo resuelve una acción (`data-stage`). Las cartas reveladas al buscar van grandes y lado a lado.
- **Expediente.**
  - Es solo información: datos, mano y equipo, Registro, Ajustes y Ayuda.
  - Se abre y se cierra con el retrato o con E, y se cierra también con Esc.
  - Empieza cerrado y, cerrado, no ocupa pantalla.
  - Cerrarlo ya no cancela una acción en curso.
  - Tocar una ficha o un edificio del mapa no lo abre (hallazgo 20). Si el jugador eligió una localidad y abre el expediente, ve esa localidad; si no, ve al superviviente activo.
- **Atajos.** B, A, M, E, 1–4 y Espacio.
  - **Conflictos:** con Esc, Enter, −, +, 0, flechas y H no hay ninguno; las pruebas lo verifican tecla por tecla.
  - **Bloqueos:** ninguno actúa con Ctrl, Alt, Mayús o Meta, con autorrepetición, en campos de texto, con un modal abierto ni con la partida bloqueada (pase de dispositivo).
  - **Espacio:** sobre un botón lo activa como siempre.
  - **Documentación:** quedaron en la Ayuda y en las instrucciones del mapa.
- **Doble toque.** Un clic con `detail>1` sobre la barra se descarta en captura, antes del botón. Los atajos pasan por la traba de la barra.
- **Dado nocturno.** Va centrado en una casilla de papel: título, D12 y «Tirando…» o el resultado. `#sequence-status` conserva el texto completo para lectores de pantalla y baterías. La duración y el salto con un toque no cambiaron.
- **Objetivo y Crisis.** Una columna de grilla del ancho de la más ancha. Plegadas, las tiras se estiran a ese ancho.

## Motivos que el motor no da

Las principales apagadas muestran en el globo el código `reason` del motor (el mismo texto que tenía la ficha). En estos casos no hay motivo del motor y quedan apagadas sin globo:
1. **Superviviente ajeno, o turno de la IA o del otro jugador:** las opciones no traen entrada para ese id.
2. **Acción, búsqueda o inventario en curso:** lo traba la interfaz; no hay `reason`.
3. **Un código `reason` sin texto conocido:** antes caía en «No disponible ahora»; en la barra ya no se inventa.

Además: «Usar carta» trae motivo por carta, no global, así que el abanico simplemente no la muestra. «Más» apagado tampoco tiene motivo.

## Cambios en las baterías de navegador

No se borró ninguna. Los ids reales se conservan; solo cambió dónde viven.

| Batería | Cambio | Por qué |
|---|---|---|
| `test-support/h344-browser-checks.mjs` | `panel()` abre con el retrato (o «×/Expediente» si la barra está vacía); nuevo `more()` | El expediente empieza cerrado y no se ve; las secundarias están en el abanico |
| `check-h344`, `check-h344-edge`, `check-map-cycle`, `check-map-migration` | `t.more(p)` antes de `#barricade-action` / `#clean-action` | Abanico |
| `check-h344`, `check-h344-movement`, `check-horizontal-composition` | `.actions-section` visible → `#action-bar[data-own]` | Ya no hay sección de acciones en el expediente |
| `check-horizontal-map-comfort` | Elegir localidad ya no abre el expediente; la ida y vuelta de cámara se mide abriéndolo con el retrato y cerrándolo con «×»; barricada por el abanico | Decisión 4 |
| `check-map-experience` | `actor()` abre con el retrato; `act()` usa el abanico; «usar» por «Usar carta» | Inventario por propósitos |
| `check-map-feedback-camera` | El alternar usa el retrato; «acciones visibles» se mide en la barra | Ídem |
| `check-h344-camera`, `check-h344-presentation-stalls`, `check-horizontal-presentation`, `map-rule-presentations` | Abrir el expediente antes de usar su selector; cerrar solo si está abierto; «Regresar» por el abanico | Empieza cerrado; tocar el mapa no lo abre |

Pruebas unitarias:
- `interfaz-v2-sesion-4`: deja de buscar `bar-search/attack/move` y `barAct`.
- `interfaz-v2-sesion-6`: el globo de los motivos (`data-no-fold`) no se marca para plegar.

## Qué se comprobó

- **944 pruebas, 0 fallos.** Hay 14 nuevas en `interfaz-v2-sesion-7.test.mjs`:
  - cada acción del inventario en la barra o el abanico y nunca en el expediente;
  - el abanico solo con lo permitido;
  - inventario por propósitos;
  - principales con motivo o sin globo;
  - tira y cancelación;
  - doble toque;
  - atajos y sus bloqueos;
  - grupo y ranuras;
  - expediente;
  - papel al centro;
  - dado nocturno;
  - tarjetas del mismo ancho;
  - «+1».
- `check:build` y `check:mapa-build` en verde.

## Qué informa una herramienta

Un guion propio con Edge (no es una batería del CI) jugó una partida «un grupo» con La noche, a 1365×768 y 852×393:
- **Abanico:** con Mara en la colonia lista barricada, atraer y usar carta. El globo de Buscar dice «Fuera de colonia».
- **Expediente:** E lo abre con la ficha de Mara y Esc lo cierra.
- **Búsqueda:**
  - mover a la Escuela y la tecla B muestran la tira «Buscar en Escuela · elegí un dado de 3 o más»;
  - 1 elige el dado;
  - la carta revelada aparece grande en el centro.
- **Fin de turno:** Espacio abre «Terminar turno» al centro.
- **Noche:** el D12 queda centrado en su casilla, 0 px corrido, con el título arriba.
- **Pantalla:** sin desbordes y sin errores de página.

Capturas citadas (1365×768):
- [barra](evidencias/interfaz-v2/126-barra-1365x768.jpg)
- [abanico](evidencias/interfaz-v2/126-abanico-1365x768.jpg)
- [búsqueda con la carta al centro](evidencias/interfaz-v2/126-busqueda-cartas-1365x768.jpg)
- [expediente](evidencias/interfaz-v2/126-expediente-1365x768.jpg)
- [dado nocturno](evidencias/interfaz-v2/126-dado-nocturno-1365x768.jpg)

## Qué falta

- **CI del PR:**
  - las baterías de navegador, en particular las modificadas;
  - el oráculo `test:poc`, que en Windows falla con EPERM al crear el enlace simbólico (hallazgo 14).
- **Jugando en escritorio:**
  - si la barra completa se lee bien a 1365 (debajo de 1250 px se ocultan las miniaturas del grupo y el estado del ciclo);
  - si el papel central tapa demasiado mientras el expediente está abierto;
  - si alcanza mostrar la localidad elegida solo al abrir el expediente.
- **En el Galaxy A15:**
  - la barra compacta, sin ranuras ni grupo;
  - la tira;
  - el abanico al tacto.
