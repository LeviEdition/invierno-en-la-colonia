# 13 — Arco narrativo piloto: «Los que quedaron afuera»

**PROPUESTA DE GUION Y DISEÑO — NO CANON, NO IMPLEMENTADO.** Sirve para discutir tono, agencia y consecuencias. Partimos de la encrucijada existente `Golpes en la puerta` y la transformamos en una pequeña historia de varias rondas.

## Premisa

Primera nevada fuerte. Alguien golpea con los nudillos una chapa del portón. Afuera esperan **Vera**, una mujer agotada, y **Simón**, un adolescente que sostiene una mochila vacía. La familia huyó de un refugio donde alguien enfermó y la distribución de alimentos dejó de ser equitativa.

Vera no es heroína ni villana. Oculta una parte de la verdad por miedo a que los rechacen; sus decisiones posteriores dependerán de cómo la colonia la trate.

La escena aparece cuando los jugadores regresan a la colonia tras una expedición o se cierra una ronda con la colonia amenazada. El sistema evita iniciar el arco si el portón ya está dentro de otra escena inaplazable.

### Episodio I — El portón

> «No queremos quedarnos para siempre», dice Vera. «Solo pasar la noche. Después encontraremos nuestro camino». Simón no levanta la mirada. Sobre su mano, bajo la manga, hay una venda húmeda.

**Opción A: recibirlos.** La colonia reserva espacio y alimentos. Vera promete ayudar a reparar el muro. Algunos habitantes agradecen la decisión; otros consideran que el líder puso a todos en peligro.

**Opción B: darles provisiones para llegar a la gasolinera.** No se instala a nuevos habitantes, pero los jugadores se comprometen a dejar una señal luminosa esa noche para indicar que el camino está seguro. Un compañero advierte que encenderla podría atraer muertos.

Ambas decisiones tienen un motivo humano reconocible. Ninguna recibe automáticamente la etiqueta «buena» o «mala». El gasto concreto de recursos se fijará más adelante, con balance jugable.

**Datos que quedan:** `familia_acogida` o `familia_derivada`; quién tomó la decisión; `promesa_senal` en ruta B; relación inicial con Vera; ronda; personajes presentes.

### Episodio II — Lo que no se dijo (unas dos rondas después)

**Si fueron recibidos:** Simón tiene fiebre. No es seguro que se trate de una mordedura. Vera admite que el refugio anterior los dejó marchar después de acusarlos de ocultar una infección. Pide medicina, pero la colonia tiene otros enfermos. El jugador puede atenderlo, aislarlo con cuidados limitados o dedicar los recursos a otro caso urgente. Vera recuerda **cómo se le respondió y por qué**.

**Si fueron enviados afuera:** la señal no se encendió (si el jugador incumplió la promesa) o un grupo vio la luz desde una calle próxima (si la cumplió). Al explorar, aparece una mochila con el nombre de Simón y un mensaje apresurado. Se ofrece continuar su rastro, regresar con suministros o desentenderse para cumplir el objetivo de muestras. No es un simple «−1 moral»: puede cambiar qué escena ocurrirá luego y qué información tendrá la colonia.

**El disparador no depende únicamente del azar.** Queda programado en la historia y se activa cuando encaja con la situación del tablero.

### Episodio III — La deuda (dos o tres rondas más tarde)

Las rutas convergen en una **situación común con significado diferente**. Un pequeño convoy llega a un cruce; sus miembros tienen medicinas y buscan a una mujer llamada Vera. Entre ellos está un hombre que la acusa de abandonar a otros refugiados.

- Si la colonia ayudó y Vera sigue allí, puede hablar por ella, investigar su pasado o entregarla al convoy.
- Si la colonia los rechazó y Simón logró sobrevivir, el joven reconoce a alguien del grupo. Puede ayudar a encontrar el convoy, negarse a colaborar o exigir explicaciones si se incumplió la promesa.
- Si Vera murió o desapareció, Simón o un objeto que ella dejó conserva el conflicto. La trama **no la revive para mostrar una escena genérica**.

La decisión sobre el convoy altera aliados, rutas seguras, información y personajes: además de comida o moral, cambian las posibilidades de los episodios siguientes.

### Episodio IV — Epílogo variable

El arco termina, pero sus resultados permanecen. Algunos ejemplos:

- Vera puede convertirse en una aliada capaz de trabajar en un refugio médico, si sobrevivió y se ganó su confianza.
- Simón puede sentirse ligado a un superviviente que lo ayudó o guardar un agravio persistente.
- Un convoy puede abrir una ruta de abastecimiento, convertirse en rival o mantenerse neutral.
- La colonia puede cargar con una promesa rota que un personaje mencione en el futuro.
- El final de la campaña puede hacer referencia a esas personas: quién fue acogido, quién se marchó y quién quedó atrás.

No se trata de inventar veinte finales enteramente separados. **El mismo final general tiene escenas, personas presentes y consecuencias distintas según lo vivido.**

## Matriz de memoria mínima del arco

| Dato | Ejemplos de valores | Para qué sirve |
| --- | --- | --- |
| `familia_puerta.estado` | `iniciada`, `desarrollo`, `resuelta` | Saber qué escenas quedan |
| `familia_puerta.decision_inicial` | `acoger`, `derivar` | Cambiar episodios posteriores |
| `familia_puerta.promesa` | `ninguna`, `pendiente`, `cumplida`, `rota` | Hacer que la colonia recuerde compromisos |
| `vera.estado` | `viva`, `desaparecida`, `muerta` | Evitar incoherencias |
| `simon.estado` | `vivo`, `enfermo`, `desaparecido`, `muerto` | Adaptar escenas a lo sucedido |
| `vera.relacion` | `desconfia`, `agradecida`, `ambivalente` | Variar diálogos y decisiones |
| `convoy.relacion` | `desconocido`, `aliado`, `neutral`, `hostil` | Modificar la campaña |
| `proximo_evento` | ID + ronda mínima | Garantizar continuidad |

Esta matriz describe **información dramática**, no solo un sistema de puntos. Es necesario registrar motivos concretos: `promesa_no_cumplida` cuenta más que reducir `reputacion` en 1.

## Integración con las mecánicas sin volverlas protagonistas absolutas

- **Comida:** la escasez vuelve difícil acoger; no decide por el jugador.
- **Medicina:** se transforma en un compromiso interpersonal, no solo un consumible.
- **Exploración:** permite descubrir el pasado del convoy y modificar el curso de la historia.
- **Zombis:** la ruta, el ruido y el peligro hacen físicamente costosas las promesas.
- **Heridas y muerte:** pueden alterar qué personas llegan al episodio III.
- **Dos jugadores:** una decisión que cambia a toda la colonia debería reconocer quién la tomó y cómo afecta al otro; su gobernanza cooperativa debe acordarse.

## Reglas narrativas específicas de este piloto

1. Las rutas A y B deben tener **al menos dos escenas posteriores distintas** y una consecuencia persistente observable.
2. Cada escena debe comprobar precondiciones reales (personas vivas, localidades, recursos, sucesos previos).
3. Si un personaje muere o no se puede acceder a la escena prevista, una alternativa válida permite continuar o cerrar el arco.
4. El jugador puede sorprenderse, pero la causa debe ser rastreable a decisiones anteriores.
5. Una escena no debe asegurar que un personaje está presente si murió o se fue en otra acción.
6. La presentación debe poder mostrar un pequeño resumen del pasado: «En la ronda 1 le prometimos una señal».
7. Un evento importante no debe perderse porque se robó otra carta aleatoria.

## Aplicación del tono +16 y del desafío justo

El arco debe sostener una intensidad emocional cercana a la de las grandes aventuras narrativas de supervivencia, **sin recrearse en gore ni violencia extrema**. Vera y Simón pueden sufrir pérdidas graves, pero el diseño no debe usarlos como castigo automático para quien ejerce la compasión.

**Ejemplo de dificultad justa en la ruta de acogida:** la colonia obtiene un compromiso humano valioso, pero la nueva demanda de comida y medicina coincide con una crisis. Una partida bien gestionada puede anticiparse al consumo, organizar una expedición al hospital, negociar un suministro alternativo o mejorar la defensa mientras alguien cuida a Simón. La decisión inicial tiene un costo real, pero **no determina por sí sola una derrota inevitable**.

**Ejemplo en la ruta de derivación:** los jugadores preservan camas y comida, pero prometen una señal que puede atraer zombis. Pueden preparar barricadas, llevar combustible, coordinar una expedición o decidir conscientemente romper la promesa. Si la rompen, quizá pierdan la confianza de Simón; esa relación no se recupera con una simple donación de +1 moral.

Las consecuencias más severas deben tener **pistas identificables** y oportunidades de respuesta. No todas las personas están obligadas a sobrevivir, y una sucesión de errores puede cerrar rutas o conducir a la derrota, pero un jugador que entiende y utiliza bien las mecánicas debe conservar posibilidades razonables de salir adelante.

## Prueba de aceptación del arco piloto

Al terminar **dos partidas de ejemplo** (una por cada decisión inicial), debería ser posible comparar:

- Qué elección inicial tomó cada jugador y por qué.
- Qué cambió dos o más rondas después.
- Qué personajes confiaron, sospecharon, murieron o permanecieron.
- Qué escenas, recursos y alternativas se habilitaron o bloquearon.
- Qué parte de la conclusión cambió por decisiones anteriores.
- Qué señales anticipaban cada peligro grave y qué alternativas estratégicas permitían mitigar su impacto.
- Si una decisión moralmente defendible produjo una partida desafiante pero recuperable, en lugar de una derrota forzada.
- Si el contenido mantiene una intensidad adecuada para un público objetivo de mayores de 16 años, sin violencia gráfica gratuita.

Si únicamente varían los números de comida y moral, **habremos fallado el objetivo narrativo**, aunque las pruebas técnicas pasen.

## Qué debemos conversar antes de escribirlo como guion definitivo

Este arco es una **maqueta narrativa**. Podemos cambiar protagonistas, escenario, conflicto, nombres y final. No se ha añadido al juego; solo propone una manera de construir historias que evolucionan.

La decisión artística abierta es el **nivel de realismo, dureza y esperanza**: qué intensidad emocional queremos y cuánto espacio dejamos para la reconstrucción de vínculos después del desastre.
