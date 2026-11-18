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
- **Escritorio y Samsung Galaxy A15 a mano**: la noche con mordedura y sucesión en el teléfono, el botón de regreso en la ficha móvil y el panel `?dev` en pantalla chica. Nada de esto se vio en un dispositivo real.

## Reserva

`node_modules` está versionado como enlace simbólico en el repositorio y `npm ci` lo reemplaza por un directorio real, así que aparece como borrado en `git status`. No se incluyó en ningún commit; conviene revisarlo aparte.

## Informe — reglas en el mapa y dos correcciones (18/11)

Tercera entrega de la rama. Un commit.

**Las reglas y el modo llegaron al mapa.** `app/mapa/` no duplica nada: pregunta al motor y presenta.

- **Preparar partida con `?dev`**: botón «Un grupo (sin IA)» junto a los dos modos actuales y las cuatro reglas (comida 6/8/10 y los tres interruptores). Sin `?dev` el mapa es idéntico a hoy. El motor expone `preparation.modes`, `preparation.testRules` y `preparation.testRuleOptions`; el panel solo dibuja y manda `test-rules`.
- **Ficha del superviviente**: «Dormirá afuera» y «Hace guardia esta noche · recibe la tirada» salen de `characters[].night`, que la proyección arma con `nightEnabled()` y `nightWatch()` del motor. Botón «Regresar a la colonia» en la grilla de acciones, con su coste en la pista («Dado 1+ · cuenta como movimiento»); se oculta cuando la regla está apagada.
- **Tiradas nocturnas**: la noche usa el mismo `resolveMapExposure` que movimiento y combate, así que llegan como avisos normales con el D12 y su animación, y la mordedura abre el flujo de mordedura y sucesión existente.
- **Rótulos**: en «un grupo» la proyección no publica el bando vacío de la IA y la etiqueta del grupo es «Tu grupo». El ciclo muestra «Tu turno» en lugar de «Turno de …», y la fase «Actúa la IA» no puede aparecer porque el modo no pasa por el turno de la IA.
- **Sin estilos nuevos**: los controles reutilizan `.actions button` y los botones del diálogo, que ya traen alturas de 48px y 44px. La batería mide las alturas reales en 852×393.

**Corrección 1 — la noche no se corta.** Antes, una mordedura pendiente descartaba las localidades que faltaban. Ahora `beginNight` las anota en `game.nightRemaining` y `continueNight` las retoma; `finishNight` (en el motor) espera la decisión y sigue hasta terminarlas, en el mismo orden y con la misma secuencia de azar. La ronda siguiente no abre antes. El centinela de cada localidad se elige al tirar, así que si murió en una tirada anterior la localidad se saltea sola.

**Corrección 2 — regresar cuenta como movimiento.** `returnHome` marca `moved`. Sigue disponible haya movido o no, pero después ya no puede moverse esa ronda; la ficha lo muestra como «Ya se movió» y el movimiento queda con el motivo `already-moved`.

**Al pasar:** elegir reglas con una partida en curso ya no se rechaza. No podía afectarla —la partida lee su copia `game.testRules`— y rechazarlo obligaba a recargar la página entre pruebas; ahora se aceptan y el registro aclara que valen para la próxima partida.

### Qué se comprobó

- **851 pruebas, 0 fallos** (9 nuevas del adaptador del mapa y 5 del motor). `check:build` y `check:mapa-build` en verde.
- **La noche reanudada**: mordedura en la primera localidad con una segunda ocupada → al resolver la decisión, la segunda tira; el orden se conserva con tres localidades; si el centinela que faltaba murió antes, se saltea; `nightRemaining` queda vacío al terminar.
- **Regresar**: deja `moved` en true y el movimiento posterior se rechaza sin gastar nada.
- **Mapa**: la preparación ofrece los tres modos y las cuatro reglas; elegirlas llega al tablero; una regla o un valor inválidos se rechazan sin tocar nada; «un grupo» no proyecta el bando de la IA y su etiqueta es «Tu grupo»; los modos actuales siguen con seis personajes y sin dato nocturno; la ficha recibe guardia y afuera del motor; regresar consume un dado de cualquier valor, no consume azar y deja la acción en `home`.
- **Paridad**: empezar «un grupo» desde el mapa da el mismo estado y el mismo azar que `startGame('solo')` en el motor (la prueba de paridad existente ahora cubre los tres modos).

### Qué falta

- **La batería nueva del mapa (`check-map-reglas-de-prueba-browser.mjs`) no se corrió localmente**: no hay Chromium en este entorno. Está registrada en el workflow `mapa` y **el CI del PR es la fuente de verdad**. Cubre 852×393 y 1365×768: partida nueva con `?dev` en «un grupo» con la noche y regresar activos, rótulos de la ficha, alturas táctiles, regresar y comprobar que no puede moverse, y terminar una ronda con alguien afuera para ver el aviso nocturno. **No doy por aprobado nada de eso.**
- **La animación del D12 en la noche no se vio.** La tirada entra por el mismo camino que movimiento y combate, así que debería presentarse igual, pero eso solo se confirma mirando.
- **Jugar en el teléfono de referencia** sigue pendiente, y con él la decisión de comida inicial.

### Corrección acotada del CI del PR #37

1. **Oráculo:** `finishNight` agregaba esperas aun sin noche pendiente ni mordedura. Ahora retorna inmediatamente en ese caso y los tres cierres de turno evitan también el `await` de la llamada vacía. Se regeneró el HTML desde `src/`. Dos regresiones comprueban el cierre sin espera y la mordedura pendiente, incluso en la última localidad.
2. **Navegador del motor:** la preparación solo anulaba la encrucijada humana. La IA robaba «El último botiquín» y esperaba «Continuar»; `skipAutomation` no resuelve decisiones. Se aisló esa encrucijada en la batería, sin cambiar el motor para saltarla.
3. **Navegador del mapa:** la proyección anunciaba preparación antes de dibujar sus controles. La batería espera el diálogo visible y el botón de modo antes de contarlos; así obtiene los dos botones sin `?dev`.

**Comprobado por herramientas:** Node 24, `check:build`, suite completa de 853 pruebas sin fallos y `check:mapa-build`; oráculo histórico 40/40 y comparación con `0b75d01aba013cd029d9d0dd0bdbd20791be15fc` 40/40, incluyendo `step`. La batería del motor pasó en 1365×768 y 393×852.

**Pendiente del mapa:** se redujo la batería a comprobar que sin `?dev` no aparecen novedades (0 botones de «un grupo», 0 paneles de reglas y 2 modos), y que con `?dev` se inicia «un grupo» con La noche y Regresar activos, en 852×393 y 1365×768. Se retiraron la lectura de `projection.log` (vacío por privacidad), las alturas táctiles, los rótulos de la ficha, la ejecución de Regresar y el cierre de ronda para ver el aviso nocturno. Esas comprobaciones, incluida la animación y el registro del resultado real, quedan para jugar a mano en escritorio y Samsung Galaxy A15. Cada espera tiene un límite de 15 s y el paso propio del CI tiene 2 minutos. El recorrido completo se conserva para ejecución manual desde GitHub Actions. No se ejecutaron navegadores localmente ni se abrieron capturas; la aprobación automática depende del CI del PR.

### Presentación de Regresar y La noche

Regresar reutiliza el desplazamiento y el reloj del movimiento normal. Cada localidad nocturna conserva instantáneas públicas antes y después de su tirada y la cara real del motor; la cola reutiliza el visor del D12 de combate, en orden, y muestra el daño y las decisiones después de revelar el dado. Una mordedura permite decidir antes de presentar la siguiente localidad. Las consultas repetidas, las interrupciones y los toques durante la presentación no reenvían acciones ni tiran otra vez.

La cobertura unitaria verifica eventos, instantáneas, orden, caras sin efecto/congelación/herida/mordedura, pausa y continuación, recuperación y ausencia de azar visual. La batería existente del D12 incorpora solo Regresar y una noche con mordedura seguida de otra localidad, con esperas de hasta 15 s; la batería breve de preparación queda intacta. HTML regenerado desde las fuentes, sin cambiar reglas ni el oráculo.

Por decisión del creador, los PR ejecutan la preparación breve y un D12 reducido en escritorio y móvil horizontal: movimiento, combate, Regresar y la noche, sin capturas ni galería, con un límite de 5 minutos para ese paso. El recorrido completo conserva todas sus baterías y se ejecuta desde **Actions → Mapa — baterías de navegador → Run workflow**, eligiendo la rama; ya no se repite automáticamente en cada PR.

**Pendiente de ver jugando:** no se abrieron capturas ni se ejecutaron navegadores localmente. El CI comprueba estados y transiciones; **la animación no se da por aprobada visualmente**. El ritmo, la duración del viaje y la legibilidad del D12 deben confirmarse a ojo en escritorio y Samsung Galaxy A15.

### Gracia para la congelación nocturna

La reproducción previa al cambio confirmó el problema: la tirada nocturna dejaba congelación 1 y el inicio inmediato de la ronda 2 añadía herida 1. Ahora, con `testRules.laNoche`, una primera congelación nocturna marca `frostFresh`; el inicio inmediato consume esa marca sin herida y el siguiente cobra normalmente. El Registro avisa que el frío pasará factura la ronda que viene.

El frío que ya existía conserva su cobro: otra congelación nocturna no renueva la gracia. Una congelación diurna adicional elimina la marca y vuelve al cobro normal; tratar realmente la congelación también la elimina, con cartas o enfermera. Curar solo heridas conserva la marca. Los tres daños acumulados siguen matando inmediatamente. La marca no se crea con la regla apagada y no se agrega azar ni lógica de reglas a la interfaz.

**Balance:** este ajuste baja la letalidad de La noche. No se re-corrió el laboratorio de balance; debe confirmarse jugando en escritorio y A15. Se añadieron regresiones unitarias; no se ejecutaron navegadores localmente ni se abrieron capturas.

La comprobación adicional del primitivo interno de tratamiento de IA se detuvo tras dos accesos fallidos: ese símbolo no está expuesto por el adaptador VM. Se verifica la eliminación de la marca mediante enfermera y cartas; la limpieza en el primitivo de IA se revisó en código.
