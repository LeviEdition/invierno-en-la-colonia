# 104 — Informe de avances del modo singleplayer (17/11/2026)

> Informe redactado por el creador en una conversación de diseño e incorporado al repositorio el 17/11/2026 sin cambios de contenido. Las notas de incorporación al final corrigen datos que quedaron atrasados. Ninguna regla queda aprobada por este documento: las decisiones vigentes se registran en [63](63-hoja-de-ruta-planificacion-singleplayer.md) y en la [ficha del capítulo piloto (105)](105-ficha-capitulo-la-ultima-guardia.md).

## Texto original
### Informe de cambios del modo singleplayer
**17 de noviembre de 2026 · Diseño, evidencia y decisiones pendientes**

La campaña sigue a una colonia cuyos integrantes pueden morir, irse o incorporarse. El jugador controla a varios supervivientes y decide desde lo que cada uno puede observar. El caso que mejor expresa el cambio es el rescate del médico: si quien lo salva muere, la colonia conserva tanto la pista que comunicó como la ayuda de la persona que logró rescatar.

#### Avances por bloque

| Bloque | Decisión y efecto en la partida | Estado |
|---|---|---|
| SP-00 y SP-01 · Identidad y preparación | La hoja de ruta recoge cinco candidatos aleatorios, elección de tres y designación de líder. Para el piloto, la continuidad narrativa recae en la colonia. Un relevo de líder permite seguir la historia con los hechos acumulados. | Preparación documentada. Cambio de protagonista acordado en el chat. El papel mecánico del líder queda abierto. |
| SP-02 · Acciones y dados | Conservamos la economía de acciones de V9.9 como base para el primer singleplayer. Las pruebas por atributo y el modelo híbrido quedaron como alternativas estudiadas. | Base acordada en el documento 63. Balance de un grupo pendiente. |
| SP-03 · Ronda y activación | El jugador toma una decisión a la vez. Un encuentro aparece cuando coinciden una acción, un lugar y los hechos que conoce la colonia. Saber el apellido de Elena permite buscarla directamente en el registro. | Acuerdo de diseño y recorrido probado por chat. Falta reconciliar el ciclo escrito con el piloto. |
| SP-04 · Presión de supervivencia | Se compararon la economía de dos grupos y la de uno sobre el motor real. El laboratorio permite repetir escenarios con las mismas semillas. | Experimento ejecutado y resultados guardados en una rama propia. Sigue abierta la elección del primer ajuste de balance. |
| SP-05 · Director y memoria | El Director puede conservar pistas comunicadas, testigos, decisiones, bajas y personas incorporadas. La campaña admite elencos variables. Dejamos de lado la reputación personal con el líder para este piloto. | Criterio acordado en el chat. Implementación del Director pendiente. |
| SP-06 · Campaña | Diseñamos Una luz de esperanza y recorrimos su primer capítulo, La última guardia. Cada avance debe poder explicarse a partir de algo que un superviviente observó, dedujo o comunicó. | Prototipo narrativo por chat. Falta probarlo dentro de una partida. |
| SP-07 y SP-08 · Interfaz y validación | Objetivo visible y diario con pistas conocidas. El jugador conserva libertad para investigar en distinto orden. La validación completa requiere jugar el arco junto a las rondas, las crisis y la gestión de recursos. | Orientación de interfaz definida para el piloto. Prueba jugable pendiente. |

#### Qué reveló el laboratorio SP-04

El informe 102 registra **37.000 partidas simuladas** en 74 combinaciones de escenario y política, con 500 partidas por combinación. En la comparación documentada, al pasar de dos grupos a uno, las partidas con hambre subieron del 25 % al 49 % y las crisis fallidas pasaron de 1,8 a 4,1 por partida. Aun así, una política centrada en conseguir muestras podía ganar con frecuencia.

La pregunta de balance es concreta: **¿cuándo vale la pena gastar hoy un dado en alimentar a la colonia si dedicarlo al objetivo puede terminar la partida antes de que la escasez decida el resultado?** Las simulaciones detectan ese incentivo bajo políticas automáticas. Queda por elegir qué variable explorar primero —dados, crisis, comida o reclutamiento— y contrastar el resultado con jugadores.

#### El capítulo piloto y su decisión central

El médico acompaña al grupo desde la colonia hasta el hospital. Busca el rastro de Elena Varela, que llevaba cuadernos de una investigación sobre una posible cura. En Admisión, el mensaje del tablón permite identificar el último traslado de Maternidad. Quien recuerde el apellido puede consultar directamente el registro. El vehículo salió rumbo a la escuela. Su llegada sigue siendo una pregunta abierta. El hallazgo se comunica antes del rescate, de modo que la campaña puede continuar aunque muera quien lo descubrió.

| Decisión en la puerta del hospital | Consecuencia acordada |
|---|---|
| Retirarse | El superviviente permanece en la localidad del hospital. El destino del médico queda desconocido. |
| Ayudar estando a una herida de morir | El primer intento revela la gravedad de la situación y abre una segunda decisión. El jugador todavía puede retirarse. |
| Comprometerse con el rescate | El médico escapa. Una única tirada de exposición resuelve qué le ocurre al rescatista. El regreso forma parte del encuentro. Si ambos sobreviven, vuelven juntos y el superviviente queda disponible la ronda siguiente. Si muere, el médico vuelve solo. |

La incorporación del médico habilita **Atención médica**. La propuesta es curar una herida normal a un superviviente herido presente en la colonia, priorizando al de mayor influencia. La frecuencia y la primera activación requieren balance. El llamado por radio quedó como posibilidad para el capítulo siguiente. La intervención de la secta requiere una causa que permita explicar cómo obtuvo información sobre la colonia.

El D12 es una pieza reutilizable de este diseño. La PR 27 implementó la exposición para movimiento y combate con seis caras lisas, tres heridas, dos congelaciones y una mordedura. En la revisión del commit 89aa31d, sus cinco workflows estaban aprobados y la PR seguía en borrador. El rescate todavía requiere su propia integración.

#### Dónde está guardado y qué conviene actualizar

- **Plan de diseño en main.** El documento 63 contiene la secuencia SP-00 a SP-08, la exploración de dados y los acuerdos iniciales del ciclo. [Hoja de ruta de planificación singleplayer](https://github.com/LeviEdition/invierno-en-la-colonia/blob/main/docs/63-hoja-de-ruta-planificacion-singleplayer.md)
- **Laboratorio en la rama experiment/sp04-laboratorio-un-grupo.** El informe documenta método, resultados y limitaciones. El simulador se ejecuta con `node lab/sp04/correr.mjs` y sus tablas están en `lab/sp04/resultados/`. [Informe 102](https://github.com/LeviEdition/invierno-en-la-colonia/blob/experiment/sp04-laboratorio-un-grupo/docs/102-laboratorio-sp04-un-grupo.md) · [Código y resultados](https://github.com/LeviEdition/invierno-en-la-colonia/tree/experiment/sp04-laboratorio-un-grupo/lab/sp04)
- **Entrega del dado.** El código y las comprobaciones del D12 se pueden seguir independientemente del diseño del encuentro. [PR 27](https://github.com/LeviEdition/invierno-en-la-colonia/pull/27)
- **Diseño más reciente.** Los acuerdos sobre la colonia protagonista, el conocimiento compartido y el rescate se tomaron en el chat y quedan reunidos en este informe. El prompt de traspaso anterior también recoge estas decisiones.

**Próximo paso recomendado.** Actualizar el documento 63 en dos puntos: el rol narrativo del jugador y el significado de «encuentro». La versión histórica usa ese término para historias secundarias de personajes; en el piloto lo usamos para escenas de campaña activadas por condiciones. Después, registrar La última guardia como ficha de capítulo con sus disparadores y desenlaces. Eso permite implementar y probar un solo capítulo sin convertir hipótesis de balance en reglas definitivas.

---

## Notas de incorporación (17/11/2026)

1. **Numeración.** Hay dos informes «102»: el del laboratorio SP-04, en la rama `experiment/sp04-laboratorio-un-grupo`, y el del dado D12, en el [PR #27](https://github.com/LeviEdition/invierno-en-la-colonia/pull/27). El D12 conserva el 102; el laboratorio tomará el siguiente número libre cuando se integre. Este informe es el 104 y la ficha del capítulo, el 105.
2. **Primer ajuste de balance: ya decidido en parte.** El 16/11 el creador decidió que **la muerte de un superviviente debe pesar** y que abastecer y resolver crisis tienen que estar justificados. La segunda corrida del laboratorio probará indefensos fijos en la colonia, comida inicial baja, crisis con consecuencias agravadas, costo de muerte mayor y duración del objetivo (6 y 10 rondas), no dados, crisis, comida o reclutamiento por separado.
3. **D12.** El PR #27 cambia la exposición del mapa de D6 a D12 (mordedura 17 % → 8 %, herida 17 % → 25 %, congelación igual, sin efecto igual). Las simulaciones del laboratorio usaron el D6 de la referencia; la segunda corrida debe usar el D12.
4. **Rescate del médico.** Tal como está escrito, morir en el rescate no cuesta nada dentro del encuentro: el médico vuelve igual y aporta Atención médica. Se registra como problema abierto en la ficha 105, con alternativas.
