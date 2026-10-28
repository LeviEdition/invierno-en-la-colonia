# 23 — Guía A5-02: prueba manual en Android físico (pendiente)

**Estado:** NO EJECUTADA en un teléfono real. Este documento es una lista de verificación para que alguien pruebe V9.9 desde Android y comunique evidencias. **No contar los pasos como aprobados antes de ejecutarlos.**

## Antes de empezar

1. Usar la **V9.9 original sin correcciones**. Puede abrirse desde el archivo HTML entregado en la conversación y descargado al dispositivo (opción «Abrir con» el navegador disponible), o desde una ubicación web confiable donde esté alojada exactamente esa versión. Si el navegador no admite HTML local, registrar la limitación; no instalar apps desconocidas para solucionarla.
2. Registrar **marca/modelo**, versión aproximada de Android, navegador (Chrome/Samsung Internet u otro) y si se usa modo vertical u horizontal.
3. Si es posible, sacar una captura solo del juego cuando algo no funcione; **evitar información personal** en las capturas. No hace falta grabar toda una partida.
4. Conviene cerrar pestañas pesadas. No manipular mazos ni recursos: en esta prueba buscamos comportamiento cotidiano.

## Checklist para ejecutar en el celular

Marcar cada comprobación **OK**, **FALLA** o **NO PROBADA**. Si algo falla, indicar los pasos exactos.

| ID | Acción del usuario | Resultado esperado |
| --- | --- | --- |
| M1 | Abrir HTML en modo vertical e iniciar «2 jugadores locales» | Setup legible, tablero carga y se puede comenzar |
| M2 | Desplazarse hacia el final del tablero y volver | Scroll vertical responde; no hay desplazamiento lateral inesperado ni elementos cortados |
| M3 | Tocar un superviviente y el menú flotante; abrir Acciones | Los controles son visibles y se pueden tocar sin elegir otro por error |
| M4 | Tocar los dados flotantes, seleccionar diferentes dados y cerrar el menú | Se distingue qué dado está seleccionado; los dedos no disparan un dado vecino |
| M5 | Abrir inventario y otro modal, cerrarlos; usar la ayuda | Textos legibles; la ventana se puede desplazar y cerrar sin quedar atrapada |
| M6 | Hacer una búsqueda real (si el juego y los dados permiten); elegir botín | La selección ocurre una vez y el juego vuelve al tablero |
| M7 | Resolver una encrucijada cuando aparezca | Se leen las dos opciones, se diferencia la deshabilitada y solo se ejecuta la elegida |
| M8 | Terminar el turno de J1 | Pantalla de pase cubre completamente el tablero, sin mostrar la mano de J2 de antemano |
| M9 | Entregar el celular al segundo jugador y tocar «Comenzar turno» | Aparecen solo sus objetos y dados, y puede terminar el turno sin errores |
| M10 | Girar el móvil a horizontal y volver a vertical, incluso con un modal abierto | Botones y texto siguen accesibles, sin perder la acción pendiente |
| M11 | Abrir/cerrar una ventana larga (Acciones o Reglas) con pantalla pequeña | Se puede acceder a la parte inferior mediante scroll; botón Cerrar accesible |
| M12 | Dejar el juego en segundo plano 30 segundos y volver | No se reinicia inesperadamente ni queda bloqueado; anotar si el navegador recarga |
| M13 | Observar las animaciones y los tiempos de respuesta durante dos turnos | No se congela el juego ni hay toques que tarden excesivamente |
| M14 | Si se da una muerte/mordedura, completar el diálogo | La decisión aparece completa y puede confirmarse; si no aparece naturalmente, marcar NO PROBADA |

**Aclaración:** la condición «se puede utilizar cómodamente con el dedo» debe juzgarse en el teléfono real. Chromium emulado ya encontró dados de solo **26 × 25 px**, de modo que especialmente **M4** es una prueba de usabilidad y probablemente requiera una revisión del diseño.

## Plantilla de respuesta breve

```text
Modelo de celular:
Android y navegador:
Modo vertical: OK / FALLA / NO PROBADO
Modo horizontal: OK / FALLA / NO PROBADO
M1 ... M14: (anotar solo los fallos y los no probados)
Qué ocurrió:
Cómo repetirlo:
Captura (si existe):
```

No es necesario escribir un informe largo: con «M4: cuesta elegir dados; se selecciona otro al tocar cerca» y modelo/navegador alcanza para documentar un hallazgo reproducible.

## Criterio de finalización

Para dar **A5-02** por ejecutada necesitamos observaciones **de al menos un Android físico** sobre inicio, tablero/scroll, menú/objetos, pase de turno e interacciones táctiles. Las demás situaciones se registrarán como cubiertas o pendientes. Después corresponde A6 — cierre de la matriz y clasificación de defectos.

**No confundir:** A5-01 = Chromium real con emulación móvil, ejecutada; A5-02 = Android físico, **pendiente**. Ningún resultado de emulación debe convertirse artificialmente en validación física.
