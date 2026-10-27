# 21 — Auditoría A4: partidas e integración (V9.9)

**Fecha:** 27/10/2026 · **Estado:** 23 pruebas automatizadas de integración completadas. **No** se ha validado la experiencia en navegador o celular. La V9.9 continúa sin cambios.

## Método

Los tests ejecutan el JavaScript **original** de `invierno_colonia_v9_9.html` mediante Node `vm` con DOM simulado. Se fijaron tiradas y algunos mazos/recursos para hacer reproducibles los escenarios. Eso permite comprobar reglas y transiciones, **pero no la dificultad en partidas espontáneas ni la interfaz visual real**.

- Archivo: `tests/integracion-partidas-a4.test.mjs` — **23 pruebas**.
- [GitHub Actions](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40528489536): **241 pruebas declaradas, 238 aprobadas, 0 fallidas y 3 TODO** (estos últimos existían antes de A3/A4).

## Lo comprobado

| Área | Escenario integrado | Resultado |
| --- | --- | --- |
| Modo local | J1 → pase → J2 → colonia → siguiente ronda | Funciona en estado y DOM simulado |
| Modo local | Dos rondas consecutivas, dados y movimiento reiniciados | Funciona |
| Límites | Fin por tiempo después de ambos turnos locales | Funciona |
| Recursos | Hambruna reduce moral durante colonia y produce derrota | Funciona |
| Búsqueda | Se obtiene muestra, pasa a inventario y al usarla suma progreso | Funciona |
| Búsqueda | Mazo agotado no consume dado | Funciona |
| Victoria | Búsquedas en tres localidades preparadas; acumular 7 muestras | Funciona, escenario dirigido |
| Cooperativo | J1 y J2 contribuyen al mismo objetivo hasta ganar | Funciona, manos preparadas |
| Narrativa actual | Encrucijada disparada por búsqueda bloquea fin de turno | Funciona |
| Rescate | Refugiado espera cuando colonia llena y llega al liberar espacio | Funciona |
| IA | Ejecuta turno automático y fase de colonia | Funciona |
| IA | Encuentra muestra y avanza el contador | Funciona |
| IA | Puede ganar con notas cuando colonia resiste | Funciona **después** de colonia; ver #11 |
| IA | Puede perder por tiempo | Funciona |
| Finales | Tras victoria o derrota no se avanza ni consumen más recursos | Funciona |
| Reinicio | Nueva partida restaura objetivo y recursos | Funciona |
| Rondas máximas | **10 rondas completas local**, terminando por tiempo | Funciona con amenazas y recursos preparados |
| Rondas máximas | **10 rondas completas IA**, terminando por tiempo | Funciona con amenazas y recursos preparados |

## Defecto nuevo, prioridad ALTA

### [#11 — IA completa objetivo pero puede perder por moral antes de verificar la victoria](https://github.com/LeviEdition/invierno-en-la-colonia/issues/11)

**Precondición:** partida de J1 + IA, faltan dos muestras, IA tiene dos notas de laboratorio, comida = 0 y moral = 1; se prepara una crisis resuelta para aislar el resultado.

**Acción:** J1 termina y la IA usa dos notas, incrementando las muestras a 2/2.

**Esperado:** verificar victoria al conseguir los recursos del objetivo, igual que el uso humano de notas.

**Observado:** el camino IA usa las notas sin comprobar inmediatamente `verify()`, continúa a `colony()`, y la falta de alimento reduce la moral a cero. `verify()` declara **derrota por moral con las muestras ya completas**.

No es solo una cuestión de prioridad dentro de `verify()`: es necesario determinar **cuándo** debe comprobarse la victoria tras cada cambio de progreso. La etapa B deberá acordar una regla uniforme; corregirla en C con pruebas simétricas para IA y humano.

## Qué aún no está demostrado

- **No se midió el balance:** en las pruebas extensas se reponen recursos o se limpian amenazas expresamente para alcanzar diez rondas.
- **No son partidas humanas reales:** los mazos y la aleatoriedad se controlan, y no se ejecutan toques/clics en un navegador.
- **No están cubiertas todas las combinaciones:** muertes encadenadas + crisis + encrucijada + rescate + fin de partida bajo temporizadores reales.
- **Sin verificación móvil:** CSS, tamaños táctiles, scroll, foco, accesibilidad, superposiciones y rendimiento quedan para A5.
- El defecto #11 se reproduce en condiciones determinadas; no se ha estimado qué frecuencia tendría en juego normal.

## Recomendación

**Cerrar A4 como bloque de integración automatizada inicial**, no como certificación total de jugabilidad. Registrar #11 y avanzar hacia **A5 — Pruebas en navegador real y móvil**, después de actualizar matriz y tablero. No corregir motor ni fusionar el PR hasta cerrar la auditoría y decidir prioridades.

**Nota:** los tests que pasan y describen defectos de la V9.9 son pruebas de *caracterización* de un comportamiento incorrecto, no pruebas de que ese comportamiento sea aceptable.
