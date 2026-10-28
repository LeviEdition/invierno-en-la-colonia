# 48 — C14: partidas completas reproducibles

**28/10/2026, Montevideo. Motor base3c152e8, gateC13 [CI40684493624](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40684493624) success392/392.** C14 no modifica el juego: agrega controladores, observadores, pruebas y evidencia. Revisión independiente y [CI exacto d801dbb](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40688534944) aprobados, 394/394.

## Qué se ejecutó

El arnés carga el script real del HTML y llama create con una semilla. No sustituye costes, mazos, acciones, exposición, crisis, colonia, reclutamiento, sucesiones o IA. El modo natural del fixture conserva paint y sus efectos existentes, y no borra la encrucijada inicial. Solo se omiten toasts y demoras de animación en VM; los diálogos y esperas del motor se resuelven mediante sus funciones reales.

La semilla usa LCG32 (`x=1664525*x+1013904223 mod2^32`, random=x/2^32), inyectado como Math.random desde la creación. Veinte semillas predefinidas por `imul(i,2654435761)>>>0`,i1..20, compartidas entre modos. El orden de consumos de azar depende de las acciones reales; no se eligen tiradas ni se reordenan cartas. Los hashes HTML/JS y RNG constan por partida.

**Controlador cooperativa-v1:** entrega muestras/notas pronto, aporta hasta completar crisis, trata heridas y equipa, mantiene un defensor por grupo, explora biblioteca/hospital y otras localidades si hace falta, defiende ante riesgo, mejora dados con excedente y construye/limpia. Arriesga mordeduras, elige sucesor por influencia, puntúa botín por una preferencia fija y encrucijadas con la política contextual existente. Usa exclusivamente entradas seleccionadas (`selected/target/picked`) y comandos reales; no cambia recursos/posiciones/dados/resultados. La IA compañera usa botTurn original. No se implementa otra IA en el producto ni se tunea balance.

## Resultados de cuarenta configuraciones únicas

| Modo | Intentadas/completas | Victorias | Derrotas | Interrumpidas | Rondas iniciadas min/media/max |
| --- | --- | --- | --- | --- | --- |
| Humano automatizado + IA |20/20|15|5por moral|0|2/3,60/6|
| Dos controladores locales |20/20|17|2por moral,1por tiempo|0|1/3,05/9|

Las repeticiones de los mismos casos para reproducibilidad/CI no aumentan el tamaño de la muestra. Cada partida inicia realmente en ronda1 y llega a un final; no son escenarios de final preparados. En la derrota por tiempo se cuentan las rondas jugadas, no la ronda adicional que marca el final.

| Eventos reales | Humano+IA | Local |
| --- | --- | --- |
|Muertes de personajes|73|38|
|Muertes de indefensos|3|4|
|Reclutamientos totales|39|27|
|Reemplazos de último superviviente (incluidos en anteriores)|11|7|
|Cambios de líder manuales/automáticos|32|18|
|Crisis resueltas|56|44|
|Crisis superadas|39|25|
|Encrucijadas activadas/resueltas|71/71|63/63|

**0excepciones,0incumplimientos de las invariantes implementadas,0pendientes al finalizar**, incluidos aviso informativo de rescate y modal abierto. Se conservan semilla, estrategia, rondas, resultado, evolución moral/comida/muestras, secuencia de comandos y mensajes completos, muertes/reemplazos/líderes/crisis/encrucijadas y estado final: [JSONL40partidas](evidencias/c14-partidas.jsonl), [resumen](evidencias/c14-resumen.json).

Los tres objetivos aparecen, pero con distribución4/15/1 por modo (Cura/Antídoto/Última esperanza). No es una muestra equilibrada ni una estimación de dificultad humana. La estrategia no busca todas las acciones posibles: por ejemplo no fuerza ruido voluntario ni transferencias; esas interacciones se cubren en C13 preparado. No se ajusta ninguna regla a partir del75%/85% observado.

## Invariantes y límites de la instrumentación

Se comprueban valores finitos/no negativos, dados1..6, zonas/barricadas/ruido, capacidad incluyendo indefensos, ids/propiedad por grupo, daños válidos, categorías de equipo únicas, muertos sin equipo, aportes sincronizados y que un grupo sin líder conserve su petición. Los observadores llaman a las funciones originales y verifican567usos unitarios de carta por ItemEngine y656consumos unitarios de dado por consume, sin alterar la otra reserva. Los dados de la IA se gastan por su ruta original; esa cifra656no pretende contar todos los dados IA.

La identidad de objetos detecta la misma referencia en dos contenedores; no demuestra ausencia de toda clonación posible ni de duplicaciones textuales de cartas antiguas. Los tests específicos de consumo/legado y confirmaciones repetidas de C2/C13 completan parte de esa cobertura. Se comprueban estados entre pasos del controlador, no cada instrucción interna de colonia.

Las listas de eventos excluyen previews C10 mediante su env. El revisor no encontró reglas sustituidas ni escrituras de recursos para fabricar resultados. Repitió una semilla dos veces por modo con registros idénticos; maxSteps1 declara interrupción, no partida completa. El registro de interrupción conserva motivo y deja clasificación juego/controlador pendiente de investigar.

## Partidas completas en Chromium con interfaz real

Cinco casos finales, elegidos del lote para incluir victoria/derrota de ambos modos y rescate al final. Los controladores planifican entradas sin aplicar acciones; luego Playwright selecciona personaje, destino y dado, abre menú y pulsa botones reales. También pulsa opciones de mordedura, encrucijadas, líder, paciente, muerte y pase. La IA continúa por su botTurn real; SaltarIA solo acelera presentación.

| Modo/vista | Semilla | Final | Ronda |
| --- | --- | --- | --- |
|IA,1365×768|2654435761|Victoria|4|
|IA,1365×768|1401181143|Derrota moral|6|
|Local,393×852|2654435761|Victoria|2|
|Local,393×852|3816266512|Derrota moral|4|
|Local,393×852|3189639203|Victoria y aviso de rescate confirmado|3|

**5/5 completos,0excepciones/violaciones**. Coinciden con VM en ronda, resultado, comida, moral, muestras y meta. [JSONfinalUI](evidencias/c14-browser-final.json), [capturaIA](evidencias/c14-ai-final.png), [capturalocal](evidencias/c14-local-final.png). La vista móvil usa clics automatizados en DOM real, no mide puntería de dedos; los taps geométricos pertenecen a C11. No Android físico/TalkBack.

### Fallos del arnés investigados, no atribuidos al juego

El primer intento UI contenía cuatro casos: dos locales completos y dos AI interrumpidos al intentar pulsar SaltarIA justo cuando aparecía una encrucijada. Se conservan [intentos iniciales](evidencias/c14-browser-intento-inicial.json). El driver respetó la superposición; se corrigió para reevaluar prioridad, no forzar clics y registrar reintentos. Los cinco finales no necesitaron reintentos. Son nueve intentos UI en total, siete completados y dos interrupciones de arnés; solo cinco configuraciones finales distintas, no siete casos nuevos.

Una comprobación final ampliada detectó seed3189639203 con recruitSuccess después de victoria. El juego había terminado legítimamente; el controlador no confirmaba el aviso informativo final. Se redujo al paso rescate→encrucijada que completa objetivo y se corrigió el controlador para pulsar Continuar incluso después del final, sin ejecutar una acción de juego. Se mantuvo la misma aserción de pendientes vacíos y no se cambió el motor. El caso queda incluido en el lote y en el quinto recorrido UI.

## Revisión, pruebas y reproducción

Revisión independiente:40registros, reproducibilidad, metadatos/finales y cinco UI comprobados; sin defectos confirmados del juego ni sustitución de reglas. Observaciones sobre invariantes y estados informativos incorporadas; suite independiente **394/394**,0fallidas/canceladas/omitidas/TODO.

Dos tests agregados permanentes ejecutan20partidas por modo, sin inflar el contador a40tests. Suite final394/394. [Controlador](../test-support/autoplay-controller.mjs), [runner](../test-support/run-game.mjs), [tests](../tests/partidas-completas-c14.test.mjs). Reproducir lote: `node scripts/run-c14-games.mjs` (C14_COUNT/C14_OUTPUT_DIR opcionales). UI: `PLAYWRIGHT_MODULE=/ruta/playwright-core/index.mjs node scripts/check-c14-browser.mjs`, servidor local como C11; cinco casos por defecto. No agrega dependencias del producto.

**Checkpoint:** completado técnicamente en resultados locales/UI/revisión y CI exacto d801dbb success394/394. Gate aprobado: se inicia C15 por autorización de la misión. No se recomienda balance ni cierre oficial de C aquí; C15 clasificará reservas y reglas mediante fuentes verificables, sin modificar mecánicas.
