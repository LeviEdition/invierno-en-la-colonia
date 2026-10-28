# 14 — Objetivos fijos, campañas y epílogos variables

**Decisión de diseño acordada · 27/10/2026.** Este documento establece el rumbo narrativo; no representa funcionalidades implementadas. La V9.9 permanece intacta.

## Principio fundamental

**La carta de objetivo elegida al inicio fija la campaña y su condición de victoria durante toda la partida.** No introduciremos objetivos cambiantes en esta etapa. La condición de victoria de una futura campaña puede integrar **requisitos mecánicos y narrativos establecidos desde el principio**: el jugador deberá atravesar los hitos imprescindibles de la trama y reunir los recursos correspondientes.

Cumplir **el conjunto de requisitos iniciales** equivale a **ganar**. Las decisiones, recursos, supervivientes, alianzas y conflictos determinan qué **tipo de victoria** se narra en el epílogo. Una victoria puede ser esperanzadora, agridulce o sombría, pero **no se anula retroactivamente** porque el desenlace humano sea duro.

**Nota de compatibilidad:** en V9.9 ganar sigue significando llegar al contador de muestras; el requisito narrativo integrado es un acuerdo para **futuras campañas**, no algo implementado o cambiado hoy.

## Tres capas de historia

1. **Trama principal:** ligada directamente a la carta de objetivo. Avanza mediante hitos narrativos y mecánicos de la misión. Su final está conectado con el objetivo inicial.
2. **Historias secundarias vinculadas a la campaña:** conflictos, personajes, facciones y consecuencias que nacen de esa misión. Pueden modificar la dificultad, los recursos, alianzas y caminos hacia la victoria, **sin sustituir la condición de victoria**.
3. **Historias secundarias independientes:** relatos sobre los personajes, la vida cotidiana de la colonia, las relaciones y los dilemas de supervivencia; pueden tratar especialmente sobre recursos. No tienen por qué conectar con la campaña, aunque pueden cruzarse de forma orgánica.

Las cartas de encrucijada aleatorias pueden iniciar estos relatos. Una vez que una decisión abre un arco, las continuaciones importantes no dependerán solo de volver a extraer una carta por azar: se registran como hechos y eventos pendientes.

## Epílogo según decisiones

Dos partidas pueden cumplir exactamente el mismo objetivo y tener epílogos distintos:

- Se conservaron aliados, se cumplieron promesas y la colonia terminó relativamente estable: victoria con esperanza y reconstrucción.
- Se logró la misión a costa de muertes, enemistades y recursos agotados: victoria amarga.
- Se consiguió lo necesario para sobrevivir, pero quedaron conflictos internos graves: victoria precaria y sombría.

El epílogo debe basarse en **hechos específicos** de esa partida: supervivientes vivos, promesas cumplidas o rotas, facciones aliadas, relatos secundarios concluidos y estado real de la colonia. No usar una sola cifra de moral como sustituto del historial; no mencionar escenas que nunca sucedieron.

## Límite de dificultad y tono

El público pretendido es de **16 años en adelante**; la crudeza será significativa pero sin gore gratuito. Las decisiones serán grises y sus consecuencias podrán complicar mucho la supervivencia. Un jugador que anticipe riesgos y gestione bien las mecánicas deberá conservar posibilidades razonables de salir adelante. No diseñar derrotas automáticas arbitrarias por una única decisión carente de pistas.

## Situación de los objetivos existentes

En la V9.9, los tres objetivos reales son:

| Carta actual | Condición de victoria |
| --- | --- |
| Encontrar la cura | 7 muestras, límite de 8 rondas |
| Operación antídoto | 5 muestras, límite de 6 rondas |
| Última esperanza | 9 muestras, límite de 10 rondas |

**Advertencia:** hoy son variantes de recolección de muestras y dificultad, **no tres campañas narrativas ya diferenciadas**. La duración y los nuevos hitos narrativos de victoria serán parte de una implementación futura, sujeta a diseño, balance y pruebas. Más adelante decidiremos si cada uno recibe una campaña distinta conservando esas condiciones, o si revisaremos el catálogo de objetivos mediante una decisión explícita de diseño. No cambiar las reglas por nuestra cuenta.

## Duración y desarrollo de las campañas

**Decisión ampliada:** las campañas podrán ser **cortas y más mecánicas** o **largas y de mayor profundidad narrativa**, con una cantidad diferente de rondas, personajes, antagonistas y arcos. La duración se calibrará para la historia y las mecánicas, no forzando todos los argumentos a las 6–10 rondas actuales.

**Integración obligatoria entre historia y recursos:** reunir el recurso del objetivo no debe permitir ignorar su trama principal. El progreso narrativo abre oportunidades de investigación, acceso, validación y uso de recursos; a su vez, las acciones y recursos mecánicos ayudan a activar los siguientes hitos de historia.

**Decisión específica para «Encontrar la cura»:** las muestras podrían conseguirse **solo mediante acontecimientos y objetivos de la campaña**. Su disponibilidad estaría escrita en la trama; obtenerlas puede requerir expediciones, recursos, riesgos y decisiones jugables. Los demás recursos estratégicos seguirán apareciendo en los sistemas normales de supervivencia. Habrá que adaptar el catálogo, las notas de laboratorio, habilidades de investigador y las recompensas de encrucijadas para que ninguna vía accidental permita ganar sin atravesar la trama. Detalles: [Progresión narrativo-mecánica](16-progresion-narrativa-mecanica.md).

La dificultad de implementación está en mantener la libertad del jugador: no retirar recompensas conseguidas ni ocultar arbitrariamente recursos esenciales solo porque no se haya visto una escena. Las etapas de campaña deben ofrecer alternativas y contingencias si un personaje central muere o si una localidad queda inutilizada.

Las historias secundarias directamente relacionadas pueden modificar esa progresión. Las independientes aportan desarrollo de personajes, recursos y conflictos, sin convertirse en bloqueos artificiales de la victoria.

**Documento de especificación:** [Campañas variables y progresión narrativo-mecánica](16-progresion-narrativa-mecanica.md).

## Implicaciones técnicas futuras

Se propone mantener separadas estas responsabilidades:

- **Objetivo:** un identificador estable y una condición fija, evaluada por el motor de reglas.
- **Campaña:** un identificador vinculado a la carta inicial y una trama principal.
- **Director narrativo:** selecciona historias específicas de campaña e independientes y agenda consecuencias diferidas.
- **Historial narrativo:** registra hechos, decisiones, relaciones y promesas, no solo modificaciones numéricas.
- **Composición del epílogo:** interpreta el resultado mecánico y el historial real para producir escenas finales variables.

Estas son responsabilidades deseadas, **no módulos implementados**.

## Próximos pasos, antes de programar

1. Seleccionar una carta de objetivo existente como primera campaña piloto.
2. Diseñar una trama principal pequeña y coherente con ese objetivo.
3. Añadir una historia secundaria directamente relacionada y otra independiente (por ejemplo, «Los que quedaron afuera»).
4. Especificar **al menos dos rutas narrativas** con consecuencias verificables que aparezcan varias rondas después.
5. Escribir dos o tres epílogos posibles para victorias obtenidas de distintas maneras.
6. Aprobar esos ejemplos antes de implementar estado narrativo persistente y conectar el director al motor.

**No cambiar V9.9 ni fusionar el PR de auditoría como parte de este acuerdo.**
