# 22 — Auditoría A5-01: navegador Chromium y pantallas móviles emuladas

**Fecha:** 27/10/2026 · **Estado:** pruebas reales de navegador Chromium y emulación táctil **ejecutadas**; **Android físico pendiente (A5-02)**. No se corrigió ni modificó V9.9.

## Identidad comprobada de la versión

Archivo original: `invierno_colonia_v9_9.html`. Se utilizó copia montada localmente que da, mediante `git hash-object`, el **SHA blob Git `4ebaedad13d63c7a6762c524a52c0dd9695687b1`**, idéntico a `main` y `refactor/arquitectura`. No se audita una reconstrucción ni la versión de otro repositorio.

## Método

- Motor visual: **Chromium real en modo headless**, automatizado con **Python Playwright**. Se ejecutó el HTML, CSS y JavaScript original con `page.set_content` (sin redefinir las funciones del juego). La navegación `file://` estaba bloqueada por el entorno de ejecución, por lo que se cargó el contenido directamente en un documento Chromium; el navegador renderizó y ejecutó el código normalmente.
- Se hicieron clics de mouse y, en vistas emuladas, `tap()` en controles reales. **No sustituye una persona utilizando un móvil físico.**
- Los recorridos de búsqueda y carta narrativa necesitaron preparar **mazos/dados reproducibles mediante el estado JS antes de clicar los controles**. No sirven para medir dificultad, probabilidad de victoria ni rendimiento en partidas largas.
- Las capturas de evidencia se tomaron con el navegador real; las comprobaciones numéricas utilizaron `getBoundingClientRect()`, `scrollWidth`, `document.activeElement`, visibilidad de superposiciones y errores JS de `pageerror`.
- En las ejecuciones con diagnóstico: **40 comprobaciones y capturas principales** distribuidas entre 4 tamaños, más **12 comprobaciones suplementarias** en 3 tamaños. Todos los guiones finalizaron sus pasos esperados, **pero algunos pasos detectaron comportamientos incorrectos**, como detallan los issues #12 y #13. Una prueba de diagnóstico exitosa no implica ausencia de defectos.

| Tamaño de viewport (px CSS) | Método | Resultado básico |
| --- | --- | --- |
| 1365 × 768 | Chromium escritorio + mouse + teclado | Recorridos completos sin error JS ni overflow horizontal |
| 393 × 852 | Chromium con `is_mobile` y `has_touch` | Recorridos táctiles simulados sin error JS ni overflow horizontal |
| 320 × 640 | Chromium con `is_mobile` y `has_touch` | Recorridos táctiles simulados sin error JS ni overflow horizontal |
| 852 × 393 | Chromium móvil horizontal emulado | Recorridos táctiles simulados sin error JS ni overflow horizontal |

**No llamar a las tres últimas filas «pruebas en Android»**: son únicamente emulación dentro de Chromium de escritorio.

## Funciones recorridas en navegador real

1. Carga inicial de la pantalla de selección de modo y botones de inicio.
2. Inicio de partida de dos jugadores en un dispositivo; cierre de encrucijada de ronda cuando apareció.
3. Tablero y desplazamiento vertical, sin `document.documentElement.scrollWidth > clientWidth` en los cuatro tamaños.
4. Menú flotante: abrir y seleccionar `Objetos`, comprobar contenido y cerrar diálogo.
5. Presentar un personaje preparado en localidad, con dado y mazo determinado; abrir `Acciones` y pulsar **Buscar**; elegir botín mediante botón.
6. Resolver encrucijada activada por la búsqueda, con opciones reales del juego.
7. Terminar turno J1 desde menú; comprobar pantalla de pase, fondo cubierto, botón de fin inhabilitado y dados flotantes ocultos.
8. Confirmar pase; verificar turno J2 y su inventario propio.
9. Esc en búsqueda pendiente: el diálogo no se cierra indebidamente.
10. Provocar una muerte no terminal con una preparación reproducible; comprobar diálogo de muerte, foco inicial en Continuar y cierre mediante botón.
11. Mientras pantalla de pase está visible, intento de clic en `#goalCard` del fondo: la superposición intercepta la interacción por puntero.
12. Registro de `pageerror`: **sin errores de JavaScript** en esos recorridos.

## Resultados positivos de interfaz

- Las pantallas inicial, tablero, inventario, búsqueda, encrucijada y pase **se renderizan** en los cuatro tamaños.
- El tablero **no introduce desplazamiento horizontal de toda la página** en esos viewports.
- Las interacciones de búsqueda y elección de encrucijada funcionan por mouse o toque emulado.
- La pantalla de pase **cubre visualmente el tablero** y bloquea intentos de clic sobre elementos detrás (sin filtración visual reproducida).
- El diálogo de muerte abre con foco inicial en **Continuar** y se cierra mediante ese botón.
- En pruebas de cierre no se vieron bloqueos de navegador ni errores JS.

## Problemas de calidad confirmados

### [#12 — Las pantallas de setup y pase no encierran el foco del teclado](https://github.com/LeviEdition/invierno-en-la-colonia/issues/12)

**Precondición:** modal `#setupScreen` abierto, atributo `aria-modal="true"`. **Acción:** presionar Tab inmediatamente.

**Observado:** el foco inicial va a `#goalCard`, que está **detrás** del modal; con **Enter** se abre un segundo modal del objetivo sin cerrar el setup. Durante `#passScreen`, Tab también permite salir de «Comenzar turno» hacia `#floatingActions`, `#goalCard`, `#crisisCard` y los botones de estadísticas.

**Esperado:** foco inicial dentro del modal, ciclo de Tab restringido al diálogo y resto del juego fuera de la navegación de teclado/árbol accesible.

**Severidad propuesta:** **media-alta por accesibilidad** y posible riesgo de privacidad accesible. El fondo sí está cubierto y la interacción de mouse sí está bloqueada; **no se ha probado lectura real de manos mediante lector de pantalla**.

### [#13 — Dados flotantes tienen zona táctil de 26 × 25 px](https://github.com/LeviEdition/invierno-en-la-colonia/issues/13)

Los botones individuales `#floatingDice .floatingDie` miden **26 px de ancho y 25 px de alto** en los tamaños móviles emulados, claramente menores que una meta ergonómica orientativa de **44 × 44 px**. Algunos botones del menú miden unos **43 px de alto**.

Los toques automatizados en el centro sí funcionaron; esto **no mide la tasa de error de un dedo humano real**. La recomendación es ampliar las áreas activas/espaciado antes de publicar como app móvil.

## Qué todavía NO está validado

- **Android real** (navegador Chrome o Samsung Internet): tacto con el dedo, rendimiento, memoria, barras del sistema, orientación, accesibilidad y scroll.
- **Lector de pantalla** (TalkBack / NVDA): confirmar consecuencias reales del defecto de foco y orden de lectura.
- **Partida real de principio a fin sin arreglos de dados/mazos/recursos**: balance y jugabilidad natural.
- Rendimiento y fluidez en teléfonos antiguos, múltiples pestañas, cierres, pérdida de conexión y gestión de suspensión/reanudación.
- Lógica de guardado y restauración que todavía no forma parte del motor V9.9.
- Evaluación exhaustiva de contraste y tamaño de todos los textos: la revisión de botones no sustituye una auditoría WCAG completa.

## Archivos y evidencia

Se generaron capturas de los cuatro tamaños para: setup, tablero, menú, inventario, acciones, búsqueda, encrucijada y pase; además, en tres tamaños, diálogo de muerte. Se conservan junto a los resultados JSON y scripts Playwright en un **archivo ZIP adjunto a la conversación** (no almacenado dentro del repositorio). El script principal contiene **40 pasos de diagnóstico con 0 fallos de ejecución**, pero detecta explícitamente que el foco puede salir del pase; el guion complementario contiene 12 comprobaciones satisfactorias de interacción.

## Criterio para seguir

**A5-01: completado solo para Chromium escritorio y emulación móvil.** La etapa **A5 sigue abierta** hasta realizar un pequeño recorrido en **Android físico (A5-02)**, consignar observado/esperado y documentar las incidencias adicionales. La guía está en [A5-02, checklist de Android](23-guia-prueba-android-a5.md).

No cambiar HTML/CSS/JS original durante la auditoría. Una vez ejecutada A5-02, pasar a **A6: matriz final de cobertura y priorización de defectos**; después empezar la etapa B de definición de comportamientos, no directamente a la implementación.
