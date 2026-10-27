# 12 — Visión narrativa persistente (PROPUESTA PARA DISCUTIR)

**Estado del documento:** dirección creativa y técnica **propuesta**, NO funcionalidades implementadas ni cambios aprobados de mecánicas.

## Declaración de intención

> *Invierno en la Colonia* será un **drama interactivo de supervivencia con sistemas estratégicos**, y no solamente un juego de recursos interrumpido por cartas de historia.

El frío, los zombis, las enfermedades, los dados y las provisiones crean presión real. Pero el centro emocional será **qué decisiones tomamos, a quién afectamos, qué prometimos y en quiénes nos convertimos para sobrevivir**.

La mecánica no se elimina. Se convierte en el lenguaje material de la historia: tomar el último botiquín debe tener un significado humano, no solo una utilidad estadística.

## 1. Pilares creativos

### Personas antes que números
Los supervivientes tienen vínculos, contradicciones, necesidades, creencias, recuerdos y motivos para desconfiar o ayudar. Un rescate no añade simplemente «+1 superviviente»; incorpora a alguien con historia, relaciones y potencial de conflicto.

### Decisiones moralmente difíciles, no «bueno vs. malo»
Las dos opciones deben ser defendibles. La compasión tiene costos; la prudencia puede salvar vidas y romper vínculos. Evitaremos convertir automáticamente ayudar en «+moral» y negarse en «−moral». Los recursos y las relaciones responden de manera distinta.

### Memoria y causalidad visibles
Cuando una decisión reaparece rondas después, el jugador debe poder relacionar causa y efecto: una frase reconocible, una persona que regresa, un objeto entregado, una promesa incumplida. El jugador no necesita conocer todas las consecuencias futuras, pero deben sentirse **justificadas**, no arbitrarias.

### Consecuencias inmediatas, diferidas y transformadoras
No basta con perder comida. Una elección puede alterar quién es aliado, qué lugar es seguro, qué información se conoce, qué personaje se atreve a colaborar, qué escenas estarán disponibles y cómo terminará una trama.

### Historia principal + tramas laterales + relatos emergentes
Una historia principal con dirección y final posible; arcos secundarios sobre personajes, grupos e instituciones; acontecimientos menores dependientes del tablero. Los eventos aleatorios **apoyan** la narración central, no la reemplazan.

### Identidad del grupo
La colonia es una comunidad que evoluciona. Sus decisiones pueden volverla solidaria pero vulnerable, organizada pero autoritaria, fragmentada, desconfiada o capaz de sostener alianzas. No lo reduciremos a un único indicador moral.

## 2. Propuesta de estructura dramática

**Nivel A — Historia principal.** Un misterio y un conflicto que evolucionan por capítulos; ejemplo de tono (no canon): una transmisión que afirma ofrecer la cura, aunque exige entregar a alguien que los habitantes quieren proteger.

**Nivel B — Arcos persistentes.** Personajes, familias, líderes, facciones, pérdidas, pactos y secretos. Cada arco tiene una cadena corta de episodios con varias rutas y consecuencias reales.

**Nivel C — Encrucijadas de supervivencia.** Las 26 historias actuales pueden conservarse como puntos de partida para decisiones contextualizadas y, cuando convenga, engancharse a un arco o dejar una huella recordable.

**Nivel D — Historias emergentes.** Nacen de lo que ya pasó en el motor: un superviviente abandona a otro ante una mordedura, una escopeta se pierde con su portador, alguien enferma por hambre, dos personajes coinciden varias rondas en el hospital.

Los niveles no son menús separados: deben sentirse como un mismo mundo.

## 3. Datos que deben persistir

En el futuro, `game.story` tendría una **versión de esquema** y campos serializables, por ejemplo:

```json
{
  "version": 1,
  "history": [
    {
      "eventId": "familia_puerta_01",
      "choiceId": "acoger",
      "round": 1,
      "actorId": "h0"
    }
  ],
  "facts": {
    "familia_acogida": true,
    "promesa_medicina": true
  },
  "arcs": {
    "familia_puerta": {
      "stage": "espera_tratamiento",
      "status": "active"
    }
  },
  "relationships": {
    "familia_mara": {
      "trust": 1,
      "grievances": []
    }
  },
  "scheduled": [
    {
      "eventId": "familia_puerta_02",
      "earliestRound": 3,
      "priority": "character"
    }
  ]
}
```

Los valores son **ilustrativos**, no datos agregados a la V9.9. Las relaciones no deberían reducir toda emoción a un medidor. El campo de confianza puede apoyar la lógica; los agravios concretos y escenas escritas transmiten la historia.

## 4. Modelo de un evento nuevo

Separaríamos **datos de historia** de **reglas ejecutables**. Una definición podría tener:

```javascript
{
  id: "familia_puerta_01",
  arcId: "familia_puerta",
  trigger: { type: "movement_finished", locationId: "colonia" },
  conditions: [],
  sceneId: "porton_helado",
  choices: [
    {
      id: "acoger",
      text: "Dejarlos entrar",
      requirements: [{ type: "free_beds", min: 2 }],
      effects: [
        { type: "adjust_resource", resource: "food", delta: -2 },
        { type: "set_fact", key: "familia_acogida", value: true },
        { type: "schedule_story", eventId: "familia_puerta_02", earliestRound: 3 }
      ]
    },
    {
      id: "no_acoger",
      text: "Indicarles un refugio cercano",
      effects: [
        { type: "set_fact", key: "familia_rechazada", value: true },
        { type: "schedule_story", eventId: "familia_puerta_ruta_02", earliestRound: 3 }
      ]
    }
  ]
}
```

Esto es un **esbozo de interfaz**, no una librería terminada. Los eventos tendrían IDs estables, condiciones explícitas, efectos estructurados y validación de esquema. No guardaríamos funciones JavaScript como parte de las partidas.

Los efectos pasan por el **mismo motor de reglas** que usa el tablero: si una escena cura una herida, coloca una barricada o mata un superviviente, debe activar las validaciones, registros y consecuencias normales. El sistema narrativo **no inventará un segundo motor**.

## 5. ¿Cómo se elige qué escena aparece?

Un futuro `StoryDirector` recibiría eventos del juego (`turn_started`, `survivor_moved`, `search_completed`, `survivor_died`, `crisis_failed`, etc.) y comprobaría:

1. Qué historias están pendientes según historial y requisitos.
2. Si las personas relevantes siguen vivas o tienen reemplazos narrativamente coherentes.
3. Si hay capacidad dramática para mostrar otra escena en ese momento.
4. Prioridad: continuación urgente de un arco > consecuencia diferida importante > encuentro contextual > evento incidental.
5. Si un evento no puede suceder ahora, reprogramarlo o resolverlo con una ruta alternativa; **no perderlo silenciosamente**.

El azar puede decidir entre varias escenas válidas, pero no debería borrar una promesa ni una consecuencia importante.

## 6. Narrativa que respeta los cambios reales del tablero

Los nombres, heridas y ubicaciones son variables del estado. Una escena que involucra a Mara debe reconocer si Mara murió, está ausente, es líder o fue sustituida. Un evento no debe mostrar automáticamente a personajes fallecidos.

Una muerte importante podría cerrar un arco, continuarlo mediante otra persona o desencadenar un duelo. El contenido necesita rutas de contingencia para partidas imprevisibles.

## 7. IA y segundo jugador

- **IA:** elegir opciones según recursos, riesgo, convicciones de su personaje, compromisos pasados y consecuencias estructuradas. No mediante búsquedas de palabras en la descripción.
- **Dos jugadores:** definir quién tiene derecho a tomar cada decisión narrativa y cómo se resuelven los asuntos comunes de la colonia. Como posibilidad futura, decisiones individuales sobre supervivientes propios y deliberaciones compartidas para decisiones que afecten a todos.
- **Transparencia:** registrar quién decidió y quién sufrió la consecuencia. Esto hará posible que dos jugadores recuerden y discutan lo que pasó.

No se implementará un mecanismo de votación hasta conversar su diseño.

## 8. Cómo se vería una consecuencia

Una decisión posterior puede aparecer con una frase contextual: «La mujer del portón reconoce la manta que le entregaste en la primera nevada». Esa frase debe depender de un hecho real de la partida, no ser un diálogo genérico para todas las rutas.

La futura presentación isométrica mostrará cambios persistentes visibles: una tienda de refugiados, una barricada improvisada, un altar, una habitación vacía tras una muerte, grafitis de una facción enemistada. **El arte es la consecuencia visible de la historia**.

## 9. Reglas para evitar falsas elecciones

- Una elección importante debe cambiar al menos **un estado narrativo duradero**, no solo sus números.
- La elección diferente debe llevar a un contenido posterior distinguible, aunque comparta escenarios.
- Los riesgos deben tener pistas suficientes; no castigar mediante sorpresas aleatorias incomprensibles.
- Algunas consecuencias pueden ser irreversibles. No todas deben serlo.
- La protagonista no tiene que salvar a todos; sí necesita margen para decidir qué clase de comunidad construye.
- Cada arco necesita un cierre o transformación. Evitaremos hilos que se olvidan porque no salió una carta adecuada.
- No usar «reputación +1» como sustituto de escenas, vínculos y hechos concretos.

## 10. Implementación incremental propuesta (aún no autorizada)

**Paso 1 — Prototipo vertical narrativo.** Diseñar **un solo arco persistente** de tres o cuatro escenas y dos rutas, con un personaje reconocible. Conservar V9.9 intacta y escribir primero pruebas que documenten elecciones y consecuencias.

**Paso 2 — Núcleo mínimo.** Guardar historial, hechos y eventos programados; resolver opciones con efectos compartidos con el motor y serializar el estado.

**Paso 3 — Integrarlo con un único disparador real** del tablero (por ejemplo, volver a la colonia tras explorar). Probar ambas rutas y la muerte de un personaje antes de un episodio.

**Paso 4 — Evaluación jugable.** ¿El jugador recuerda por qué sucedió algo tres rondas después? ¿La segunda ruta cambia escenas y decisiones? ¿Se siente como una historia, no como una pantalla de números?

**Paso 5 — Escalar cuidadosamente.** Solo después de que la pieza vertical funcione, escribir una biblia del mundo y ampliar personajes/arcos. La presentación 2D vendrá sobre un núcleo narrativo probado.

## 11. Acuerdos de tono, público y dificultad (27/10/2026)

Estas pautas **ya están definidas por la dirección creativa del proyecto**:

- **Referente emocional:** la fuerza de las decisiones y las relaciones de *The Walking Dead* de Telltale, **sin copiar personajes, escenas ni estructura de trama**.
- **Público objetivo:** jugadores de **16 años o más**. Es una intención editorial, no una clasificación oficial otorgada por un organismo. El relato admite muerte, amenaza, enfermedad, traición, temor y dilemas dolorosos, pero evita gore explícito, crueldad gratuita, violencia sexual como recurso dramático y recrearse en sufrimiento gráfico.
- **Equilibrio entre crudeza y esperanza:** un mundo peligroso donde un error puede dejar heridas difíciles de reparar, pero en el que reconstruir confianza y ayudar a otros es posible.
- **Elecciones grises y comprensibles:** ambas rutas tienen razones honestas, riesgos previsibles y costos que se manifiestan en personas, tramas y mecánicas.
- **Consecuencias graves, no derrotas arbitrarias:** una elección puede perder aliados, destruir recursos, complicar rutas, abrir un conflicto o matar a un personaje; **no debería condenar automáticamente una partida sin avisos suficientes y sin posibilidad de responder estratégicamente**.
- **La habilidad del jugador importa:** anticipar riesgos, conservar recursos, negociar, investigar, construir defensas y elegir bien permite sobrevivir incluso a consecuencias narrativas muy difíciles. No toda muerte es evitable ni toda relación reparable, pero la partida debe mantener un camino razonable de supervivencia mientras existan opciones coherentes.
- **Evitar la elección de color:** las consecuencias no pueden limitarse a una línea de diálogo distinta ni a bonificaciones numéricas; deben cambiar escenas futuras y abrir/cerrar posibilidades.
- **No prometer invulnerabilidad:** el objetivo no es garantizar victoria en todas las circunstancias. Una cadena de malas decisiones y una estrategia insuficiente pueden provocar derrota, de forma comprensible para quien juega.

### Criterios para el diseño y las pruebas

1. **Pistas antes del daño:** toda consecuencia severa debe disponer de señales narrativas o sistémicas que el jugador pueda reconocer.
2. **Crisis recuperables:** cuando una elección desencadene una crisis grave, probar al menos una respuesta estratégica viable, aunque costosa; si la derrota ya es inevitable por acumulación de errores anteriores, deberá poder explicarse.
3. **Pérdidas que transforman, no borran:** si un personaje muere, su arco debe tener consecuencias o un cierre coherente, y el juego debería permitir continuar cuando las reglas de supervivencia lo permitan.
4. **Distintos estilos de solución:** cuando tenga sentido, ofrecer vías de cooperación, planificación y riesgo; no hacer que una respuesta moral quede siempre recompensada frente a todas las demás.
5. **Revisión editorial +16:** comprobar lenguaje, tratamiento del duelo, violencia sugerida y representación de la vulnerabilidad antes de incorporar cada arco.
6. **La narrativa guía las mecánicas:** una historia difícil no se considera lograda solamente porque baja moral o hace aparecer más zombis.

## 12. Qué necesitamos acordar antes de programar

**Tono acordado:** drama de supervivencia crudo, con decisiones moralmente grises y repercusiones duraderas, orientado a mayores de 16 años. La tensión emocional es prioritaria, pero sin crueldad gráfica gratuita y con oportunidades reales de sobrevivir mediante buen juego. Las referencias estéticas y narrativas no implican copiar argumentos ni personajes de otras obras.

**Preguntas creativas restantes:** ¿qué conflicto principal impulsará la campaña? ¿Qué lugar ocupa la colonia en la historia? ¿La solución siempre consiste en obtener muestras o puede haber objetivos finales distintos? ¿Qué arco piloto representa mejor este equilibrio entre dureza y posibilidad de reconstrucción?

Este documento consagra una prioridad: **primero una historia con consecuencias reales; después multiplicar eventos y mejorar su presentación**.
