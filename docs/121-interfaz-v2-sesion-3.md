# 121 — Interfaz v2, sesión 3: luces en Lámpara, parpadeo y atmósfera de noche

23/11/2026. Rama `feature/interfaz-v2-sesion-3`, apilada sobre `feature/interfaz-v2-sesion-2` (PR #39, [120](120-interfaz-v2-sesion-2.md)). Foco en escritorio (1365×768).

```bash
npm run check:build && npm test     # 898 pruebas
npm run check:mapa-build
node scripts/detectar-luces.mjs --check
```

## Qué cambió

**A. Color de las luces.** El giro de tono del filtro frío volvía rosadas las ventanas encendidas. Ahora, al calcular el filtro, los píxeles cálidos y brillantes se remapean al tono de la Lámpara, al 60 % de su brillo. Una ventana naranja (255,170,80) da (145,116,47); antes daba (206,143,131).
- **Peso de luz (`warmWeight`):** tono naranja entre 14° y 55°, saturación y brillo, con mezcla suave en los bordes. Grises, fríos, ladrillo apagado y el rojo de la cruz quedan igual. Los núcleos casi blancos de las ventanas también cuentan: cuanto más brillante el píxel, menos saturación hace falta.
- **Dónde vive:** en el mismo filtro y con el mismo interruptor (`MAP_COLOR_FILTER.warmLights`; con `null` vuelve el original). No cambia ningún archivo de arte.
- **Contorno de selección:** pasó de #D8A54B al 80 % a Lámpara plena (#F2C14E, opaco).

**B. Parpadeo.**
- **Detección:** `scripts/detectar-luces.mjs` decodifica con zlib la textura original 1× sin filtrar (`nuevo mapa.png`, 1671×941, que coincide con las coordenadas del mundo) y busca manchas conectadas con el mismo `warmWeight`. Escribe `app/mapa/escena/luces.json` con las 25 más grandes (posición, radio e intensidad base), junto con el sha256 de la fuente. Es determinista, no agrega dependencias y `--check` falla si el JSON quedó desactualizado.
- **Dibujo:** un resplandor aditivo teñido de Lámpara por luz, todos con una única textura de 64×64 generada por código.
- **Ritmo:** cada luz va a su ritmo, entre 60 % y 100 % de su base, con cambios cada 80–450 ms suavizados (70 ms). Las luces están desfasadas entre sí.
- **Azar visual:** `mulberry32` con semilla fija, nunca `Math.random`.
- **Seguridad:** un salto de 0,2 o más cuenta como destello y hay como mucho 3 por segundo por luz; si no, el cambio siguiente es suave. Los resplandores miden de 26 a 57 px de mundo de diámetro, lejos de una zona amplia.
- **Brillo máximo:** limitado para que la ventana más su resplandor no supere a la Lámpara del contorno.

**C. Noche (opción A).** No hizo falta tocar el motor. La señal ya existía: cada tirada nocturna llega como presentación `exposure` desde los pasos `night` (`ciclo/broker.mjs`), y la cola de presentaciones avisa cuándo queda vacía.
- **Cuándo:** la noche empieza con la primera tirada presentada (`viewer.night('begin')`) y termina cuando la cola se vacía (`'end'`). Dura al menos 1,2 s, entra en 1,2 s y amanece en 1 s.
- **Sin tiradas:** no hay presentación, así que no hay noche.
- **Pase o vista recuperada:** la cola se interrumpe y la atmósfera adopta el día sin animar (`'adopt'`).
- **Qué cambia:** una capa multiplicativa azulada (Phaser, profundidad 0,2) entre el fondo y los contornos, zombis y barricadas. Es una capa de color, no una segunda textura del mapa.
- **Luces:** de noche suben a pleno y parpadean; de día quedan al 35 %, quietas.
- **Qué no cambia:** fichas, rótulos, marcas, paneles y D12 son DOM y no se tiñen.
- **Movimiento reducido:** sin rampas ni parpadeo; luces fijas al 80 %.
- **Bucle:** el de la atmósfera ya existente (30 fps solo mientras dura la noche), en pausa con la pestaña oculta.
- **Gancho QA:** `qaNight(kind)` en `main.mjs` fuerza la noche para capturas; en el build de producto no hace nada.

## Qué se comprobó

- **898 pruebas, 0 fallos** (891 de la línea base). Siete nuevas en `tests/interfaz-v2-sesion-3.test.mjs`:
  - **Remapeo:** una luz da el tono Lámpara al 60 %; gris, frío y rojo no cambian; el recorrido de la textura da lo mismo y `null` apaga todo.
  - **Contorno:** la ventana más el resplandor máximo queda por debajo de la Lámpara.
  - **Generador:** con la misma semilla da la misma secuencia y no usa `Math.random`.
  - **Parpadeo:** 60–100 %, intervalos medios de 80–450 ms, como mucho 3 destellos por segundo y luces desincronizadas.
  - **Niveles:** día 35 %, movimiento reducido 80 %.
  - **Noche:** entra en 1,2 s, mínimo 1,2 s, amanecer de 1 s, se saltea sin tiradas, sigue si llega otra tirada durante el amanecer y adopta el día.
  - **Detector:** el JSON coincide con el detector y las luces están dentro del mundo.
- `src/` no cambió, así que el oráculo del motor queda igual (lo corre el CI). `check:build` y `check:mapa-build` en verde.
- Ninguna batería de navegador mira píxeles; no se tocó ninguna.

## Qué informa una herramienta

Edge local en modo QA, a 1365×768 con movimiento normal:
- **Brillo**, medido solo en el canvas (capas DOM ocultas un instante), como el máximo amarillo junto a las luces frente al contorno de la colonia seleccionada (242):

  | Caso | Ventanas | Contorno |
  |---|---|---|
  | Día | 198 | 242 |
  | Noche | 219 | 242 |
  | Primer plano a zoom 1,5 | 229 | 242 |

- **Costo del parpadeo:** 0,045 ms de promedio por cuadro (peor 0,2 ms) para las 25 luces, sobre 161 cuadros.
- **Amanecer:** al terminar, la capa vuelve a 0.
- **Otros tamaños:** a 852×393 y 393×852, con la noche puesta, no hay errores ni desplazamiento horizontal.

Capturas:
- [día](evidencias/interfaz-v2/121-dia-1365x768.jpg)
- [noche con la colonia seleccionada](evidencias/interfaz-v2/121-noche-colonia-seleccionada-1365x768.jpg)
- [primer plano de ventanas](evidencias/interfaz-v2/121-ventanas-primer-plano-1365x768.jpg)

La noche de las capturas se forzó con el gancho QA. El disparo real por tiradas nocturnas está cubierto por pruebas unitarias, pero no se vio en una partida.

## Qué falta

- **Ver jugando en escritorio** una ronda real con La noche (`?dev`) y alguien afuera:
  - la entrada y el amanecer;
  - si el parpadeo se siente errático y cómodo;
  - el tono de las luces.

  Nada de lo visual está aprobado hasta verlo.
- **Coincidencia de texturas:** `luces.json` usa la textura 1×. Si el arte 2× se desplazara respecto de la 1×, habría que regenerar desde otra fuente.
- **CI del PR:** baterías de navegador y oráculo.
