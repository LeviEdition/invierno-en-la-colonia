# 117 — Reglas de prueba y modo «un grupo»

18/11/2026. Rama `feature/reglas-de-prueba`, dos commits. Ficha de la regla aprobada en [116](116-ficha-regla-la-noche.md).

```bash
npm run check:build && npm test     # 838 pruebas
npm run check:mapa-build
node scripts/check-reglas-de-prueba-browser.mjs   # batería nueva (CI)
```

## Qué cambió

**Fase 1 — cuatro reglas de prueba, todas apagadas por defecto.** Viven en el motor único y se activan por configuración de partida; la interfaz solo presenta.

| Regla | Valores | Efecto |
|---|---|---|
| `comidaInicial` | 6 (actual), 8, 10 | Reserva de salida |
| `laNoche` | apagada / encendida | Una tirada del D12 por localidad exterior ocupada al cerrar la colonia ([116](116-ficha-regla-la-noche.md)) |
| `regreso` | apagada / encendida | Acción «Regresar a la colonia»: un dado de cualquier valor, sin exposición |
| `crisisParcial` | apagada / encendida | Con la mitad de los aportes (hacia arriba) sin completarla, media consecuencia hacia abajo |

Consecuencias de la crisis parcial, con lo pedido en 2: moral 1→0, zombis 2→1, comida 2→1, herida 1→0. Media consecuencia de 1 es ninguna, así que moral y herida quedan en nada.

**Fase 2 — modo «un grupo (sin IA)».** Un solo grupo humano: sin turno, dados, mano, líder ni encrucijada del bando de la IA. La ronda pasa del turno del jugador directo a la fase de colonia. Mismo objetivo, crisis, comida, tablero y supervivientes iniciales que el modo contra la IA. Reimplementado en el motor a partir del comportamiento de la variante «un-grupo» del laboratorio ([106](106-laboratorio-sp04-un-grupo.md)); no se copió el parche.

**Panel «Reglas de prueba»** en la pantalla de partida nueva, visible solo con `?dev` en la dirección. El botón «Un grupo (sin IA)» vive en el mismo panel. Los valores elegidos quedan en `game.testRules` y se anuncian en el registro de la partida.

**Presentación mínima, sin diseño nuevo:** en la ficha, «dormirá afuera» en quienes quedan a la intemperie y «hace guardia esta noche» en quien recibiría la tirada; botón «Regresar a la colonia» junto a las demás acciones; cada tirada nocturna como aviso normal.

## Qué se comprobó

- **45 pruebas unitarias nuevas** (31 de reglas, 14 del modo). 838 en total, 0 fallos.
- **Con todo apagado, una partida con semilla fija es idéntica**, y los modos contra la IA y dos jugadores locales conservan grupo, mano, dados y líder de la IA.
- **La noche:** una tirada por localidad exterior ocupada y ninguna en la colonia; dos personas en el mismo lugar reciben una sola; menor influencia con empate por orden del grupo; ninguna tirada por el grupo de la IA; las cuatro caras del D12 producen su efecto; apagada no tira nunca; en dos jugadores locales no se aplica.
- **Mordedura nocturna:** entra al flujo normal (muere, cuesta una moral, revisa el liderazgo). En soledad se resuelve sola y la noche sigue; con acompañantes deja la decisión abierta y corta las tiradas restantes de esa noche.
- **Regresar:** cuesta un dado de cualquier valor, no tira exposición, **no consume azar**, funciona haya movido o no, exige estar afuera y solo lleva a la colonia. El movimiento normal sigue gratis y con exposición.
- **Crisis parcial:** las cuatro consecuencias a la mitad; con cero aportes falla entera; con los aportes completos se supera; apagada, media crisis sigue fallando entera.
- **Un grupo:** arranca sin bots, mano, dados ni líder de la IA; el bando vacío no es derrota; el reemplazo de emergencia lo ignora; la ronda nueva no consume azar por sus dados; dos rondas completas pasan del turno del jugador a la colonia sin ningún aviso que mencione a la IA o a un segundo jugador; semilla fija, partida idéntica.
- `check:build` y `check:mapa-build` en verde; el HTML se regeneró desde `src/`.

## Qué falta probar jugando

- **La batería de navegador nueva no se corrió localmente**: no hay Chromium en este entorno y la política del proyecto es no instalarlo acá. Queda registrada en el workflow `d12a-esbuild-poc` y **el CI del PR es la fuente de verdad**. Cubre dos escenarios: activar las reglas desde el panel en modo contra la IA y terminar una ronda con alguien afuera verificando el aviso nocturno; y jugar dos rondas en modo «un grupo». No doy por aprobado nada de eso.
- **Comida inicial 6 u 8**: la decisión es de mesa, no de simulación ([116](116-ficha-regla-la-noche.md)).
- **Si «Regresar a la colonia» debe marcar al superviviente como movido.** Hoy no lo marca; la justificación y el riesgo están en la ficha.
- **Escritorio y Samsung Galaxy A15 a mano**: la noche con mordedura y sucesión en el teléfono, el botón de regreso en la ficha móvil y el panel `?dev` en pantalla chica. Nada de esto se vio en un dispositivo real.
- **El mapa no se tocó.** El visor sigue ofreciendo los dos modos actuales; «un grupo» se eligió desde la pantalla del motor. Llevar el modo y los rótulos al mapa es trabajo aparte.

## Reserva

`node_modules` está versionado como enlace simbólico en el repositorio y `npm ci` lo reemplaza por un directorio real, así que aparece como borrado en `git status`. No se incluyó en ningún commit; conviene revisarlo aparte.
