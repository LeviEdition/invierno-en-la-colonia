# 24 — A6: cierre de cobertura, riesgos y prioridades de corrección

**Fecha:** 27/10/2026 · **Estado:** cierre de auditoría técnica **con limitaciones declaradas**, aprobado para avanzar a estabilización después de la instrucción explícita del usuario («Luego que termines la lista, comienza los ajustes»). La V9.9 en `main` sigue intacta.

## 1. Evidencia y alcance del cierre

**Línea base:** `invierno_colonia_v9_9.html`, SHA blob `4ebaedad13d63c7a6762c524a52c0dd9695687b1`. El archivo coincide en `main` y `refactor/arquitectura`.

**Suite:** `npm test` en GitHub Actions: **241 casos declarados, 238 aprobados, 0 fallidos y 3 TODO**. Fuente de evidencia: [ejecución CI](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40535133447).

**Bloques:**
- **A1:** reglas, objetos, búsquedas, turnos, IA, finales y 26 encrucijadas caracterizados, sin exhaustividad matemática.
- **A2:** 20 pruebas automáticas del modo local y privacidad de estados; [informe](19-auditoria-modo-local.md).
- **A3:** 21 pruebas de ventanas, decisiones y cancelación, con DOM simulado; [informe](20-auditoria-modales-a3.md).
- **A4:** 23 pruebas de integración, victorias, derrotas y partidas dirigidas de diez rondas; [informe](21-auditoria-integracion-a4.md). No representan partidas de balance natural.
- **A5-01:** 52 comprobaciones de interacción y presentación en **Chromium real** con cuatro tamaños (tres emulados como móviles); [informe](22-auditoria-navegador-a5.md).
- **A5-02:** **NO ejecutada formalmente** en Android físico según [guía](23-guia-prueba-android-a5.md). El usuario informa haber jugado varias veces la V9.9 y que funciona bastante bien. Esto es **evidencia cualitativa de uso**, no registro de cada prueba ni evaluación formal de accesibilidad/táctil. Por decisión del usuario, esta brecha se acepta de forma provisional para avanzar con arreglos, **no se marca como prueba aprobada**.

**Criterio de cierre:** no afirmar «juego sin errores»; los fallos conocidos y los límites son explícitos, y la corrección puede empezar en una rama aislada. A6 cierra **el relevamiento de línea base**, no una certificación total.

## 2. Estado de los 21 subsistemas

| IDs de la matriz | Cobertura y riesgo residual |
| --- | --- |
| 01–02: inicio, objetivos y turnos | Caracterización e integración dirigida; pasan las pruebas, faltan combinaciones/uso prolongado real |
| 03: dados | **Defecto #3 confirmado** en modo local |
| 04–06: movimiento, exposición, daño y muerte | Caracterizados; estrés simultáneo de modales/muerte no exhaustivo |
| 07–09: búsqueda, objetos, equipamiento | Caracterizados; **regla #4** de transferencias entre grupos sin decisión |
| 10: habilidades y liderazgo | **Defecto #6**, cambio de líder inicial J2 inconsistente |
| 11–13: zombis, colonia, crisis | Cobertura dirigida, IA omite material de crisis equipable (**#5**); balance no medido |
| 14: encrucijadas | 26 cartas caracterizadas; **#2 y #7**, comportamiento incorrecto / estrategia frágil de IA |
| 15: IA | Turno completo con escenarios controlados; **#5, #7, #11** |
| 16: dos jugadores locales | Manos/dados/pase cubiertos por pruebas; **#3, #6, #8**; accesibilidad foco **#12** |
| 17: finales | 23 pruebas de integración; **#11** compromete coherencia de victoria |
| 18: interfaz y accesibilidad | Chromium real, menús y modales; **#9, #10, #12**; lector de pantalla no probado |
| 19: móvil y rendimiento | Emulación a 320/393 px, sin overflow horizontal en escenarios probados; **#13**, ergonomía y rendimiento físico sin medir |
| 20: red y guardado | **No implementado** en V9.9: fuera de alcance de auditoría |
| 21: narrativa persistente y 2D | **No implementado** en V9.9: documentos de visión, fuera de alcance |

## 3. Lista priorizada de problemas y decisiones

**Prioridad propuesta por impacto y reproducibilidad, no por orden de descubrimiento.** Las prioridades son una recomendación de la auditoría; la etapa B fija comportamientos antes de modificar reglas.

| Orden | Issue | Evidencia y efecto | Tratamiento propuesto |
| --- | --- | --- | --- |
| **P0** | [#11](https://github.com/LeviEdition/invierno-en-la-colonia/issues/11) | **Victoria IA** por muestras se puede convertir en derrota por hambre antes de verificar la condición alcanzada | **Primero**: verificar inmediatamente al otorgar progreso del objetivo y detener procesamiento cuando termine |
| **P1** | [#2](https://github.com/LeviEdition/invierno-en-la-colonia/issues/2) | Encrucijadas rechazan medicina, combustible o herramientas existentes y no pueden consumirse por formato de objeto | Elegibilidad y consumo basados en tipo de objeto, con una sola extracción, y regresiones |
| **P1** | [#3](https://github.com/LeviEdition/invierno-en-la-colonia/issues/3) | J2 local no puede mejorar dados si J1 agotó su reserva | Usar `actionDice()` y prueba simétrica J1/J2 |
| **P1 accesibilidad** | [#12](https://github.com/LeviEdition/invierno-en-la-colonia/issues/12) | Foco de teclado atraviesa setup/pase | Retener foco en diálogo, bloquear elementos de fondo en la navegación |
| **P2** | [#8](https://github.com/LeviEdition/invierno-en-la-colonia/issues/8) | Invocación interna de fin de turno puede saltarse pantalla de pase | Guardia interna; prueba de reentrada |
| **P2** | [#10](https://github.com/LeviEdition/invierno-en-la-colonia/issues/10) | Invocación interna avanza con diálogo de muerte abierto | Guardia interna coordinada con #8 |
| **P2** | [#5](https://github.com/LeviEdition/invierno-en-la-colonia/issues/5) | IA equipa herramientas que podrían aportar a crisis, sin evaluar equipamiento | Orden de prioridad de recursos de IA; test de regresión |
| **P2 / diseño** | [#6](https://github.com/LeviEdition/invierno-en-la-colonia/issues/6) | Liderazgo inicial J1/J2 tiene reglas de bloqueo diferentes | Antes de modificar: confirmar si primer movimiento/acción bloquea a ambos |
| **P2 / diseño narrativo** | [#7](https://github.com/LeviEdition/invierno-en-la-colonia/issues/7) | IA elige encrucijadas por coincidencias de texto | Diseñar consecuencias estructuradas, no parchear regex a ciegas |
| **P2 móvil** | [#13](https://github.com/LeviEdition/invierno-en-la-colonia/issues/13) | Dados tienen zonas táctiles de 26×25 px | Aumentar áreas de interacción y validar diseño responsive |
| **P3** | [#9](https://github.com/LeviEdition/invierno-en-la-colonia/issues/9) | `playItem()` permite acción interna durante curación pendiente, no explotación por clic habitual demostrada | Guardias de acciones coherentes, sin bloquear resolución del modal |
| **Por definir, no bug confirmado** | [#4](https://github.com/LeviEdition/invierno-en-la-colonia/issues/4) | Transferir equipamiento entre grupos puede ser colaboración deliberada | Consultar al diseñador; no cambiar sin regla explícita |

**No reproducido**: filtración visual de manos en pase mediante mouse, errores JS al recorrer las pantallas probadas, overflow horizontal de página en tamaños usados. Eso no prueba ausencia universal de tales fallos.

## 4. Decisión de avance y protocolo de correcciones

**La autorización actual cubre iniciar ajustes de defectos claros después de crear esta lista.** No presupone aprobación de cambios de reglas ambiguas.

1. Mantener `main` y el archivo de V9.9 original sin modificaciones.
2. Cerrar esta auditoría dentro de `refactor/arquitectura` y conservar el PR #1 en borrador como línea base.
3. Abrir **rama separada de estabilización** `fix/estabilizacion-v99` a partir del commit de auditoría, y PR en borrador hacia `refactor/arquitectura`.
4. Corregir **un fallo por paso**, añadiendo o ajustando prueba regresiva que compruebe lo esperado (no seguir afirmando el fallo antiguo).
5. Ejecutar suite completa en CI tras cada corrección, conservar los resultados y no fusionar nada automáticamente.
6. **Primer ajuste autorizado:** #11, coherencia entre progreso científico logrado por la IA y fin de la partida.
7. Solo continuar con #2 y #3 tras confirmar la primera regresión. Dejar #4, #6 y la política narrativa #7 como decisiones explícitas.

## 5. Límites para versiones futuras

El guardado/reconexión, el modo cooperativo online desde celulares distintos, las campañas narrativas y la vista isométrica son funciones **futuras**, no defectos de V9.9. El hecho de que la versión pueda jugarse en móvil no invalida los riesgos de foco (#12) y tamaño de objetivos táctiles (#13).

**Salida del bloque A6:** auditoría de línea base cerrada con incidencias; **entrada a B/C:** reglas no ambiguas priorizadas y primer ciclo de estabilización #11. Al resolver una regla ambigua, documentar el acuerdo antes de programarla.
