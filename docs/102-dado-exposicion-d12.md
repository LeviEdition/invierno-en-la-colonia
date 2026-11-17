# 102 — Dado de exposición D12 en movimiento y combate

16/11/2026, America/Montevideo. Rama `feature/dado-exposicion-d12`, desde `main` remoto `a898a9a66ff899d9a36af02c4222801d300a484b`. El PR25 ya estaba fusionado: se conserva su cierre del Hito3, la corrección101 de muertes y las acciones visibles en móvil. Árbol inicial limpio, sin AGENTS.md aplicable; leídos CLAUDE.md y el tablero vigente. Esta entrega no modifica `main`, no fusiona ni crea tags o publicaciones.

El motor usaba un D6 para exposición: tres blancos, una herida, una congelación y una mordedura. No implementaba las probabilidades pedidas. El mapa adopta ahora un D12 uniforme con esta distribución explícitamente autorizada:

| Caras | Resultado | Símbolo |
|---:|---|---|
| 6 | Sin efecto | Superficie lisa |
| 3 | Herida | Gota de sangre |
| 2 | Congelación | Copo de nieve |
| 1 | Mordedura | Marca de dientes |

`rollExposureDie` toma una sola muestra de azar y elige uno de doce intervalos iguales. Guarda la cara, su resultado, la etiqueta y los símbolos de las doce caras. Movimiento y combate, incluidos los llamados del motor para IA, pasan por el mismo `expose` y la misma resolución D12. La animación y el Registro reciben ese resultado; no sortean otra cara ni deducen el daño a partir del personaje seleccionado.

Se mantienen las condiciones para tirar: sigilo y combustible pueden evitar la exposición del movimiento; pistola/rifle conservan sus protecciones de combate. Resistencia conserva la cara realmente obtenida y evita el primer efecto adverso de la ronda, sin volver a tirar. Heridas, congelación, muerte y contagio siguen sus consecuencias actuales. Los dados de acción, ruido y la decisión de arriesgar el contagio conservan su D6. No se implementa el rescate del médico; la tirada y el resultado estructurado quedan disponibles para ese próximo encargo.

La referencia V9.9 continúa con su caracterización original. La selección de variante se elimina al compilarla: `npm run check:build` produce el mismo HTML preservado, SHA256 `28ee788a65d64271f3ce28bd2ff73d26dc2644aa798e51bf925f3914317be9ac`. No se edita el HTML generado. La variante horizontal del motor utiliza el D12; los prototipos históricos que montan la referencia mantienen su comportamiento previo.

El visor dibuja un dodecaedro regular de veinte vértices, treinta aristas y doce pentágonos, proyectado a SVG. Gira con el reloj visual y se detiene con la cara obtenida al frente durante la revelación. Movimiento reducido conserva la orientación final sin giro. Los símbolos son trazos vectoriales; el dado ocupa82×82 píxeles CSS y cada símbolo frontal tiene al menos18×18 píxeles CSS. Las caras lisas muestran la etiqueta exacta «Sin efecto». El visor sigue sin importar el motor: recibe también la apariencia de las doce caras en el resultado estructurado.

[Doce caras al tamaño del tablero](evidencias/exposicion-d12/doce-caras-82px.png) · [Congelación en combate móvil](evidencias/exposicion-d12/combate-movil-congelacion.png). La galería es una verificación determinista del mismo componente; las capturas de acciones proceden de partidas con fixtures QA declarados. Las restantes capturas, informes y estados van al artifact del CI, no al repositorio.

Validación local:769/769 pruebas, incluidas28 nuevas. Se enumeran las doce caras desde movimiento y combate (24 resoluciones reales), se verifican los límites de los intervalos y el reparto exacto6/3/2/1, un consumo de azar por exposición, registro único, daño y geometría/orientación. Se comprueba también que animar o consultar el resultado no cambie el estado ni consuma azar, y que las acciones mantengan sus D6.

La nueva batería `check-exposure-d12-browser.mjs` prueba movimiento y combate con los cuatro resultados en1365×768,852×393 y393×852 (DPR1/2):24 acciones, doble confirmación, orientación frontal, etiqueta, registro, coste, daño y azar. Examina además las doce caras del componente a82px en cada tamaño. En local pasaron también las dos regresiones de animaciones H3.4.4 y los ocho casos de muerte/contagio/sucesión de101. Se inspeccionaron capturas de escritorio y ambas orientaciones móviles; falta jugarlo manualmente y probar el Samsung Galaxy A15 físico.

El CI del mapa se habilita para PR contra `main`, ahora que la pilaH3 está integrada, y añade la batería D12 a las nueve existentes. Los jobs de navegador que se activan contra `main` usan Ubuntu24.04, compatible con Playwright1.57; se conserva la versión de herramienta y todas las aserciones. El SHA remoto final, ejecución y artifact se registran en el PR del encargo al concluir. Siguiente paso: revisión manual del D12; rescate del médico en un encargo posterior.
