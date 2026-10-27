# 17 — Mapa jugable de la campaña piloto «Encontrar la cura»

**Documento de discusión, NO argumento definitivo ni mecánica implementada.**
**Estado:** primer esquema para revisión crítica (27/10/2026). La V9.9 sigue intacta.

## 1. Hipótesis que queremos comprobar

Una campaña narrativa puede exigir atravesar su conflicto principal sin volverse un recorrido lineal. Las **muestras necesarias para ganar** proceden únicamente de oportunidades de investigación vinculadas a la historia, pero para obtenerlas se necesitan decisiones y acciones estratégicas.

El **objetivo es fijo**: completar la cura. Los desenlaces varían según supervivientes, decisiones, alianza/rivalidad con la secta y estado de la colonia.

**Aún no elegimos la duración.** La V9.9 pide 7 muestras antes del límite de 8 rondas; estas cifras son la línea base existente, no un balance aprobado para una campaña narrativa larga.

## 2. Grafo mínimo de la campaña

```text
N0. Indicio de una investigación viable (inicio de trama)
      |
      v
N1. Rastrear conocimiento especializado
      |-- A: rescatar/contactar investigador/a
      |-- B: recuperar archivos + buscar vía alternativa para interpretarlos
      |            (ambas rutas mantienen viva la posibilidad de ganar)
      v
N2. Se habilitan varias operaciones para obtener muestras
      |-- Hospital / investigación médica
      |-- Laboratorio / documentación recuperada
      |-- Fuente biológica en expedición de riesgo
      |-- Contacto u operación secundaria vinculada a la campaña
      |   (rutas con recompensas y riesgos distintos; NO todas obligatorias)
      v
N3. La secta interviene ante el avance de la investigación
      |-- proteger investigadores y laboratorio
      |-- negociar, engañar, infiltrarse o desviar una persecución
      |-- sufrir consecuencias por no prepararse
      |   (el conflicto debe resolverse, no necesariamente por combate)
      v
N4. Validar investigación y completar los recursos necesarios
      |-- Si faltan muestras: seguir rutas desbloqueadas, con riesgos
      |-- Si faltan conocimientos: resolver una ruta alternativa
      v
FINAL. Victoria si se reúnen los requisitos desde el inicio:
       muestras suficientes + hitos fundamentales resueltos
       |
       +-- Epílogo esperanzador / agridulce / sombrío
           (resultado concreto condicionado por decisiones)
```

Los nodos `N1`, `N2` y `N3` **no tienen por qué suceder en una secuencia rígida**: una expedición puede aportar información de la secta antes del contacto con el investigador. El diagrama muestra dependencias mínimas, no una obligación de presentar una escena por ronda.

## 3. Fuente de muestras: propuesta de prototipo

Para ensayar el sistema sin escribir toda la campaña, podemos simular **cuatro oportunidades narrativas** con recompensas máximas ilustrativas:

| Oportunidad narrativa | Máximo ilustrativo | Trabajo del jugador |
| --- | ---: | --- |
| Acceso al hospital | 2 muestras | Explorar, preparar el equipo, afrontar riesgos |
| Recuperación del laboratorio | 3 muestras | Conseguir datos/llaves, proteger la operación |
| Expedición biológica | 3 muestras | Elegir ruta y comprometer recursos |
| Colaboración con contacto | 2 muestras | Construir una relación o resolver otra tarea |

Con un máximo teórico de 10 y objetivo provisional de 7, no habría obligación de superar **las cuatro operaciones**. La distribución es **un ejemplo para experimentar**, no contenido canónico ni balance definitivo. Que sean cuatro oportunidades no obliga a que aparezcan todas en una sola partida.

**Advertencia de diseño:** no debemos garantizar que el jugador gane solo por alcanzar una escena; las muestras se entregan tras acciones o decisiones con riesgos y costos. Las fuentes accesibles, la posibilidad de perderlas y los caminos alternativos requieren pruebas de partidas completas.

## 4. Núcleo narrativo obligatorio vs. historias secundarias

**Obligatorio para el objetivo fijo:** descubrir una investigación viable, acceder al conocimiento necesario, afrontar la amenaza que interfiere en esa investigación por una ruta válida y completar el resultado científico.

**Secundarias vinculadas:** deserción de una persona de la secta, ataques contra exploradores, rescate de una investigadora concreta, documentos falsificados o intercambio de suministros por información. Pueden habilitar oportunidades, cambiar riesgos y afectar epílogos sin imponer una sola solución.

**Secundarias independientes:** disputas por raciones, vínculos entre supervivientes, un refugiado que necesita ayuda, duelo y desacuerdos sobre liderazgo. No deberían bloquear la condición de victoria por haberlas ignorado, aunque sus consecuencias puedan afectar recursos o supervivientes.

## 5. Sectarios como antagonistas: pregunta de calidad

Antes de desarrollar escenas es necesario definir:
- Qué objetivos operativos tienen, además de su interpretación de la infección como castigo divino.
- Cómo saben que la colonia investiga la cura.
- Por qué persiguen a científicos y cómo obtienen información.
- Qué personajes de esa organización están convencidos, cuáles dudan y cuáles actúan por interés, supervivencia o miedo.

Si solo aparecen al azar para robar comida y añadir zombis, **no estarán aportando una campaña narrativa distinta**. Tampoco debemos tratarlos como una representación genérica de personas religiosas; son una organización ficticia con decisiones y prácticas particulares.

## 6. Riesgos y medidas antes de escribir diálogos

| Riesgo | Qué haríamos |
| --- | --- |
| El jugador acumula muestras por medios no narrativos | En la futura implementación, revisar `sample` en mazos, `notes`, `researcher`, eventos antiguos, `gainSample()` y `verify()` |
| Una muerte bloquea la trama | Sustitutos plausibles: notas del investigador, otro especialista, interpretación difícil, costo mayor |
| La campaña es lineal | Dos rutas verificables por hito importante y más oportunidades de muestras que las estrictamente necesarias |
| Aparecen demasiadas escenas | Medir densidad narrativa; reservar acciones libres entre hitos importantes |
| Ataque inevitable de la secta | Señales, alternativas tácticas y consecuencias coherentes con exposición/decisiones |
| Escenas arbitrarias cambian la dificultad | Mostrar pistas comprensibles y permitir anticipación con exploración/preparación |
| Guion interminable | Primero prototipo vertical con pocos nodos y dos rutas; escalar después de pruebas |

## 7. Plan de trabajo gradual

**Paso A — Validación del esquema en conversación.** Ver si la estructura refleja la visión del creador, ajustar núcleos obligatorios, decidir las rutas narrativas disponibles y el papel de las muestras.

**Paso B — Elegir duración con evidencia.** Simular rondas necesarias para exploración, recolección, defensa y desarrollo de escenas. No asignar 12–16 rondas sin probar si el hambre y la llegada de zombis escalan demasiado rápido.

**Paso C — Describir solo tres escenas jugables.** Inicio que revela indicios, una elección relevante entre vías de conocimiento y una primera misión que otorgue muestras por desempeño. Preparar una variante si muere un personaje.

**Paso D — Diseñar pruebas de aceptación antes del código.** El jugador no gana obteniendo muestras ajenas a la campaña; dos rutas desbloquean operaciones; la pérdida de un investigador no bloquea injustificadamente; el progreso no depende de un sorteo obligatorio.

**Paso E — Prototipo separado de la V9.9.** Crear un módulo mínimo de estado/condiciones/efectos narrativos, con tests; recién después conectarlo a acciones reales en una rama aislada. Nunca fusionar en `main` sin revisión.

## 8. Primer punto de decisión

**¿Qué profundidad queremos para la primera versión jugable de esta campaña?**

- **Piloto mínimo:** unas pocas escenas conectadas, dos rutas y un epílogo, para probar el motor narrativo sin prometer aún una campaña completa.
- **Campaña completa:** varios arcos y personajes; conviene trabajarla después del piloto porque escribir y depurar todas sus variantes antes de validar el motor es un riesgo importante.

**Recomendación crítica:** hacer el **piloto mínimo como prueba técnica y narrativa** antes de escribir el resto. Esto no impide que la campaña definitiva tenga la extensión que necesite.
