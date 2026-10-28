# 42 — Comparación de prioridades y Utility en seis escenarios

**Fecha:** 27/10/2026. **Base:** HTML local de `6fdb774`. **Solicitud:** comparar alternativas con situaciones concretas, sin implementar IA, modificar código del repositorio ni crear commits. **Estado:** experimento de diseño; ninguna política ni peso aprobados.

## Método y supuestos declarados

Se ejecutaron los callbacks reales de cada opción mediante `resolveCross()` en contextos VM independientes, con el fixture existente de `tests/encrucijadas.test.mjs` adaptado únicamente en un auxiliar fuera del checkout. Cada comparación parte de idéntico estado para ambas opciones; se verificaron activación, elegibilidad y resolución. Se obtuvieron 12 resultados para seis escenarios, no una simulación de partidas completas. No se llamó a estos callbacks sobre un clon conectado al juego vivo.

Las dos políticas reciben los mismos resultados y comparten el mismo filtro: solo opciones legales; preferir victoria inmediata real; si no la hay, evitar derrota inmediata cuando exista opción no derrotada. La clasificación viene de `verify()` real, incluidas sus prioridades de derrota/victoria. Este filtro compartido es una preferencia estratégica de ejemplo, no una nueva regla del juego ni un argumento contra Utility.

**Prioridades de ejemplo**, después del filtro: menos muertes inmediatas; poder cubrir la próxima necesidad de comida; recuperar moral cuando parte de 3 o menos; progreso de muestras; después un desempate de recursos/defensas/peligro, con orden estable si persiste igualdad. La cobertura de comida usa la población real tras cada opción, sin simular futuras búsquedas, crisis o llegada de zombis. No predice con certeza todo el resto del turno.

**Utility de ejemplo, números no calibrados ni aprobados:**

`U = wComida × Δcomida + wMoral × Δmoral + 4 × Δmuestras − Δzombis + 0,5 × Δbarricadas − 10 × muertes`

- `wComida=4` si falta comida para la necesidad actual de colonia; en caso contrario `0,5`.
- `wMoral=3` si la moral inicial es 3 o menos; en caso contrario `1`.
- Se usan cambios reales después de aplicar efectos, no números leídos del texto; la pérdida de moral por muerte forma parte del resultado y el término de muertes valora además la pérdida del personaje.
- Es un perfil ilustrativo limitado a estas cartas, no la implementación completa del modelo de informe41. No incorpora todos los recursos ni peligros futuros; usa umbrales sencillos y no demuestra transiciones suaves. Una Utility mejor calibrada puede producir otras decisiones.
- Para hacer el desempate de prioridades reproducible, su último criterio usa `0,5×Δcomida + Δmoral + 0,5×Δbarricadas − Δzombis`. Solo opera si empatan los criterios anteriores: es una política lexicográfica ilustrativa con desempate numérico, no una afirmación de que las prioridades jamás puedan usar números.

Los perfiles se declararon antes de comparar; los escenarios exploran acuerdo, diferencias y efectos condicionales, no sirven para asignar un porcentaje de aciertos.

## Escenarios y resultados

En todos los casos se mantiene el modo humano+IA, dueño de la carta IA, condiciones de activación válidas y ambos grupos con supervivientes. El actor de búsqueda está en supermercado; los escenarios alimentarios necesitan 3 comidas para la población en colonia. Las localidades parten sin zombis/barricadas salvo los casos indicados.

| Caso | Carta y situación | Consecuencias reales relevantes | Prioridades | Utility del ejemplo |
| --- | --- | --- | --- | --- |
| R1 | Radio; comida1, moral8, sitio para los zombis | Confiar: comida3 y +2 zombis; apagar: comida1 y moral9 | Confiar: cubre la necesidad actual | Confiar: 6 puntos frente a 1 |
| R2 | Radio; comida8, moral2 | Confiar: comida10 y +2 zombis; apagar: moral3 | Apagar: alimento suficiente, moral urgente | Apagar: 3 frente a −1 |
| R3 | Radio; comida0, moral2, se necesitan3 comidas | Confiar deja comida2/moral2 y +2 zombis; apagar deja comida0/moral3. Ninguna cubre la necesidad | Apagar: sigue faltando comida en ambas; prioriza margen de moral | Confiar: 6 frente a 3; valora reunir dos comidas aunque no alcancen todavía |
| M1 | Mensaje en la pared; muestras4/5, moral8, hospital con espacio | Investigar añade muestra5 y dos zombis sin muerte: victoria real | Investigar | Investigar; filtro terminal compartido |
| M2 | Mensaje; muestras4/5, moral1, hospital lleno de zombis y Leo expuesto | Investigar mata a Leo por desbordamiento y deja moral0: derrota pese a muestras5. Evitar da comida y mantiene partida | Evitar | Evitar; filtro terminal compartido |
| S1 | Señal del mando; no hay acceso libre en colonia, comida3, moral5 | Organizar guardia no añade barricada ni moral; racionar da dos comidas | Racionar | Racionar: 1 frente a 0 |

**Acuerdo: cinco de seis escenarios.** No significa que ninguna política tenga una tasa de éxito de 5/6: las decisiones esperadas todavía son parte del diseño. R3 admite dos preferencias defendibles: margen de moral inmediato o reserva alimentaria con más zombis. La evaluación del ejemplo no compara toda su consecuencia a largo plazo.

## Sensibilidad y conclusión

En R3, cambiar solo el peso de comida de 4 a 2 cambia Utility: confiar obtiene `2×2−2=2`; apagar sigue en3. Ahora ambas políticas eligen apagar. No cambia ninguna regla ni consecuencia de la carta; cambia una preferencia numérica. Tampoco esto prueba que peso2 sea correcto: harían falta más escenarios y la preferencia del creador.

Las prioridades hacen explícito que una urgencia domina otra; Utility permite compensarlas y controlar cuánto vale cada ganancia. Ambas necesitan diseño y pruebas. La representación fiel de consecuencias sigue siendo necesaria en cualquiera de las alternativas. No se demuestra una política universalmente superior con seis estados preparados.

**Recomendación actual, no decisión aprobada:** usar prioridades contextuales como primer evaluador pequeño y explicable, con una interfaz intercambiable y un desempate explícito. Adoptar Utility completa si el creador quiere compensaciones graduales que los escenarios muestren difíciles de expresar mediante prioridades, no por su nombre o supuesta mayor inteligencia. No ampliar a personalidades, planificación de varios turnos o aprendizaje en este arreglo.

## Registro y siguiente decisión

- Los auxiliares y resultados están fuera del checkout: `/tmp/crossroads-policy-experiment.mjs` y `/tmp/crossroads-policy-comparison.json`. Son experimentos temporales, no nuevas pruebas de la suite ni una IA integrada al juego.
- Se ejecutaron 12 resoluciones de opciones en VM y comparación/sensibilidad de perfiles ilustrativos. No se ejecutó de nuevo la suite completa o Chromium: no hay cambios del ejecutable. No se atribuyen estos resultados al comportamiento de la IA actual.
- Se actualizan solo documentos42/41/18/25 y se comprueba `git diff --check`. Se conservan los documentos locales de las revisiones anteriores. Sin staging, commits, push, cambios de reglas, código/pruebas del repositorio, configuración, `main` o PR14.

**Siguiente decisión única propuesta:** acordar la preferencia de R3 y el orden general de urgencias, y entonces elegir/precisar el evaluador de #7. No se implementa ni se considera aprobado ningún perfil en esta revisión.
