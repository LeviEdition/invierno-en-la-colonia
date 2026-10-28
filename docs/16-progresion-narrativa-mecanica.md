# 16 — Campañas de duración variable y progresión narrativo-mecánica

**Acuerdos de diseño del usuario · 27/10/2026.** Especificación conceptual, **no código implementado**. No alterar V9.9 ni `main`.

## Qué quedó establecido

1. **Campañas con distinta duración y complejidad.** No todas necesitan el mismo número de rondas, cantidad de escenas o profundidad narrativa. Algunas pueden ser breves y centrarse más en supervivencia estratégica; otras ser largas, complejas y priorizar personajes, antagonistas y arcos conectados.
2. **Profundidad de personajes y antagonistas.** Pueden desarrollarse durante la campaña de manera ambiciosa, siempre que su contenido sea relevante, coherente y jugable. Extensión por sí sola no equivale a calidad; cada subtrama debe justificar su costo.
3. **Objetivo fijo durante la partida.** La carta inicial define la campaña y sus requisitos de victoria; no se sustituyen arbitrariamente a mitad de la partida.
4. **Atravesar la trama principal es indispensable para ganar.** Reunir por azar o por explotación eficiente todos los recursos mecánicos no debería permitir ignorar acontecimientos narrativos esenciales.
5. **Progresión coordinada.** El motor debe vincular los recursos y requisitos de la misión (por ejemplo, muestras, información, acceso, investigación) con hitos narrativos, y permitir que los avances de cada sistema influyan sobre el otro.
6. **Decisiones y epílogos variables.** Los acontecimientos centrales deben abordarse, pero la ruta concreta para resolverlos puede variar. Cumplir el objetivo da una victoria; el estado narrativo determina la calidad del epílogo.
7. **Historias secundarias de dos clases.** Algunas nacen de la campaña y pueden influir en su resolución; otras son independientes y aportan personajes, recursos y conflictos, sin convertirse por defecto en requisitos de victoria.

## Distinción técnica imprescindible

**Acuerdo específico para la campaña «Encontrar la cura»: las muestras del objetivo pueden existir solamente como recompensas o hallazgos de la trama**, ya que no tienen una utilidad de supervivencia independiente. Esta restricción **no se aplica** a comida, medicinas, armas, combustible, herramientas u otros recursos estratégicos; esos siguen obteniéndose mediante las mecánicas habituales.

Las muestras no tendrían por qué estar en los mazos generales de búsqueda. Su **fuente** sería una escena, investigación, expedición o consecuencia narrativa específica; **su obtención efectiva** puede exigir que el jugador explore, supere un riesgo, proteja a alguien, gaste recursos o realice una acción relevante. Una escena no equivale necesariamente a una muestra entregada gratis.

Una **muestra recolectada** no tiene por qué equivaler a una **muestra que el proyecto de investigación ya puede utilizar**. Para evitar complejidad innecesaria, primero habrá que decidir si es suficiente contar muestras obtenidas por hitos y registrar progreso narrativo, o si una etapa de validación científica aporta decisiones nuevas y justifica otro contador.

Propuesta para el piloto «Encontrar la cura»:

- `collectedSamples`: materiales obtenidos explorando; el jugador conserva la posibilidad de encontrarlos antes de conocer su utilidad.
- `researchProgress`: avances de investigación, conocimientos disponibles, pruebas validadas.
- `campaignMilestones`: acontecimientos narrativos resueltos, con información de la ruta elegida.
- `objectiveStatus`: progreso de la condición fija de victoria; se evalúa con recursos **y** los hitos necesarios desde el comienzo.

No significa necesariamente añadir cuatro contadores visibles. Se trata de separar los hechos para no confundir «tener objetos» con «haber desarrollado una cura».

### Ejemplo orientativo (no balance aprobado)

| Hito | Lo narrativo abre o exige | Lo mecánico permite |
| --- | --- | --- |
| I. Indicios | Evidencia creíble de una línea de investigación; pistas de personas necesarias | Reunir materiales y desbloquear investigación |
| II. Contacto | Localizar a un investigador **o una ruta equivalente hacia sus conocimientos** | Analizar muestras, obtener información o mejorar su aprovechamiento |
| III. Amenaza | Afrontar un conflicto desencadenado por la secta; resolverlo mediante decisiones y estrategia | Nuevas oportunidades o restricciones de exploración, acceso, equipo y recursos |
| IV. Resolución | Disponer de la investigación imprescindible para formular la cura | Completar muestras útiles y comprobar victoria |

**La victoria del piloto futuro requeriría ambos:** recursos suficientes para la carta y la investigación indispensable resuelta. **Los requisitos compuestos son parte del objetivo inicial; no se cambian a mitad de campaña.**

### Regla de oro: evitar bloqueos arbitrarios

**Para «Encontrar la cura», es válido retirar las muestras del mazo aleatorio general** y vincular su disponibilidad a eventos de campaña. El riesgo real no es esa vinculación, sino que todos los avances se reduzcan a «esperar hasta que aparezca la siguiente escena» o se vuelvan imposibles por haber rechazado una opción o perdido a un personaje.

La muestra debe estar ligada a una causa de la trama, pero el jugador debe tener participación relevante en obtenerla. No habrá una dependencia de un sorteo aleatorio para conseguir **un recurso obligatorio** y la campaña debe ofrecer rutas de contingencia en sus puntos críticos.

En cambio:

- Permitir buscar materiales, investigar y prepararse incluso antes de activar una escena importante.
- Usar hitos narrativos para **habilitar usos**, revelar información, procesar materiales, abrir localidades o activar nuevos recursos cuando tenga sentido dentro de la ficción.
- Si un recurso esencial solo aparece después de un hito, garantizar un camino jugable y suficientemente claro para conseguirlo, sin depender de una única carta aleatoria.
- Si el jugador obtiene muestras tempranamente mediante alguna ruta narrativa válida, conservarlas; no confiscarlas para forzar el ritmo de la trama.
- La cantidad, el tipo y la disponibilidad de muestras se podrán establecer por arco o hito narrativo; algunas recompensas pueden variar según desempeño y decisiones, pero el camino a la victoria debe seguir siendo viable.
- No imponer siete escenas obligatorias por exigir siete muestras: una expedición podría proporcionar varias; el número debe equilibrarse con duración y tensión de la campaña.
- Diseñar alternativas coherentes cuando mueren personajes importantes, se pierde el hospital o se rechaza a un contacto.
- Prever claramente los casos en que el jugador pierde por haber agotado tiempo o recursos tras decisiones repetidas, no por un evento obligatorio inaccesible.
- No hacer que las historias secundarias independientes detengan la victoria principal si el jugador las ignora.

## Impacto sobre la V9.9 que habrá que revisar antes de implementar

Actualmente las muestras **sí** pueden llegar por distintos canales no narrativos. En una futura implementación no basta con retirar cartas `sample` de los mazos:

- **Mazos de localidades:** contienen cartas `sample` que pueden salir en búsquedas ordinarias.
- **Notas de laboratorio (`notes`):** su efecto de investigación permite incrementar la cantidad de muestras mediante un consumible obtenido explorando.
- **Habilidad `researcher`:** la primera muestra obtenida por un personaje con esa habilidad cuenta doble; podría alterar un progreso guionado y permitir llegar al total previsto antes de terminar la trama.
- **Encrucijadas:** algunas dan muestras o las generan directamente, por lo que habría que decidir cuáles pertenecen a la campaña y cuáles ya no deben otorgar progreso de objetivo libremente.
- **`gainSample()` y `verify()`:** actualmente no comprueban de qué evento procede cada muestra ni los hitos narrativos; verificar una victoria con el número suficiente puede terminar la partida antes de completar la historia.

Propuesta: el futuro motor registra **la procedencia de cada avance**, concede muestras por hitos o acciones justificadas y comprueba las condiciones fijas de la campaña al declarar victoria. No programar todavía esta migración ni romper la V9.9.

## Acuerdo creativo y límite técnico

La campaña puede desarrollar personajes y antagonistas todo lo necesario para alcanzar una buena calidad dramática, pero **cada ruta adicional** genera trabajo de escritura, interacciones con reglas, efectos persistentes, variantes de diálogo y pruebas. La expansión se decidirá por **valor narrativo y viabilidad**, no mediante un número ilimitado de escenas.

No hay actualmente un límite de rondas definido para campañas futuras. Las cifras de 6, 8 y 10 rondas pertenecen a los tres objetivos de V9.9, que hoy son **variantes de recolección de muestras**, no campañas completas. Su duración podrá revisarse en una modificación futura **expresa**; las nuevas campañas no quedan restringidas a estos valores.

## Arquitectura sugerida

Un descriptor de campaña podría contener:

```js
{
  id: "encontrar_cura",
  objectiveId: "encontrar_cura",
  roundLimit: null, // Por definir tras prototipar y medir ritmo.
  requiredSamples: 7, // Valor actual de V9.9, sujeto a balance futuro.
  requiredMilestones: ["evidencia_cura", "investigacion_resuelta"],
  storyArcIds: ["cura_principal", "investigadores", "secta"],
  independentStoryPool: ["familia_puerta", "crisis_raciones"]
}
```

Esto es **un ejemplo de contrato futuro, no el formato definitivo ni datos existentes**. La victoria se calcula en el motor de reglas, mientras el director narrativo registra y resuelve hitos.

Pseudorregla propuesta:

```text
victoria =
    objetivo_mecanico_completo
    Y
    hitos_narrativos_obligatorios_resueltos
    Y
    partida_no_derrotada
```

No exigir personajes concretos vivos salvo que esté indicado con claridad y existan rutas de contingencia. No todas las subtramas pertenecen a `requiredMilestones`: solo la trama principal y sus requisitos narrativos indispensables.

## Caso del antagonista: secta opuesta a la investigación

El boceto de campaña plantea una organización que interpreta la infección como castigo divino y persigue a investigadores. Puede ser un hilo conductor potente, pero exige **revisión crítica**:

- Su motivación necesita consistencia y conflictos internos, no maldad genérica o equivalencia automática entre religiosidad y violencia.
- La facción debe reaccionar a eventos reales: investigadores protegidos, información divulgada, refugios explorados y elecciones del jugador.
- La persecución no debe dispararse siempre de manera idéntica o inevitable solo para bloquear la victoria.
- Sus intervenciones pueden generar historias secundarias vinculadas a la campaña: desertores, ataques, contactos engañosos, negociaciones, pérdidas y venganzas diferidas.
- Sus consecuencias deben poder enfrentarse estratégicamente. El objetivo es tensión y drama, no secuencias de castigo arbitrario.

## Condiciones mínimas de aceptación del primer prototipo

1. El jugador no puede ganar por recolección aleatoria de muestras ajena a la campaña; si por rutas narrativas válidas alcanza el número antes de completar todos los hitos indispensables, el juego explica qué falta y no declara victoria prematura.
2. El jugador atraviesa los hitos por más de una ruta y llega a la misma condición de victoria con epílogos distintos.
3. Una historia secundaria independiente puede ignorarse sin impedir el objetivo principal.
4. Morir un investigador no destruye forzosamente una partida que aún tenga alternativas narrativas razonables.
5. La **disponibilidad de muestras** depende de la trama, pero la **obtención** puede requerir acciones y estrategia; los demás recursos de supervivencia siguen accesibles por juego ordinario y no únicamente por esperar escenas.
6. Las escenas importantes no dependen de que una carta aleatoria concreta salga en el turno correcto.
7. Se mide el ritmo con partidas completas: duración, densidad de decisiones, frecuencia de escenas y casos de bloqueo.
8. Las pruebas automatizadas reproducen al menos dos rutas completas, con consecuencias y final compatibles con el objetivo fijo.

## Propuesta de siguiente tarea

Diseñar **el mapa de dependencias de una sola campaña piloto**: qué conoce el grupo en cada etapa, qué decisión desbloquea qué recurso/acción, qué sucede si muere un investigador, dónde aparece la secta y cuáles son los caminos alternativos hacia la victoria. Esto es más útil ahora que escribir diálogos largos sin haber validado todavía el flujo del juego.

No ejecutar cambios de reglas en la V9.9 hasta aprobar la especificación del piloto y trabajar en una implementación aislada con pruebas.
