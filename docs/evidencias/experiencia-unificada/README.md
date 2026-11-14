# Experiencia unificada · comparación y pruebas

[Informe y tabla de accesos](../../99-experiencia-unificada-del-mapa.md). Auditoría previa enef99f3c; implementación enc2014569ec3e288345727a87376c0ebd36f1b453, con cierre visual968e5cb/838ce09. Vídeos y capturas normales repetidos sobre838ce09. El SHA final y su ejecución exacta de Actions se registran enPR25. Sin merge ni publicación del juego.

## Espacio del mapa

Píxeles CSS, misma ventana. Cámara sobre el mapa; su altura deja de sumarse a las franjas superiores. Sidebar340px estable en escritorio y ficha móvil superpuesta ampliable. Fuente de medidas: JSON de auditoría antes/después.

|Ventana|Franjas antes → después|Mapa antes → después|Ganancia de altura|
|---|---|---|---|
|1365×768|180 →96,08|1055×563 →1025×672|109px|
|852×393|148 →86,08|852×245 →852×307|62px (+25,3%)|
|393×852|252,84 →193,16|393×576 →393×659|83px|

|Captura|Antes|Después|
|---|---|---|
|Escritorio|[Personaje](antes/1365x768/personaje.png)|[Personaje](despues/1365x768/personaje.png)|
|Móvil horizontal|[Personaje](antes/852x393/personaje.png)|[Personaje](despues/852x393/personaje.png)|
|Móvil vertical|[Personaje](antes/393x852/personaje.png)|[Personaje](despues/393x852/personaje.png)|
|Ataque|[Modal/controles](antes/1365x768/ataque.png)|[Un solo contexto](despues/1365x768/ataque.png)|
|Transferencia|[Selección](antes/852x393/transferencia.png)|[Receptor y coste](despues/852x393/transferencia.png)|
|Registro|[Listado](antes/1365x768/registro.png)|[Rondas y detalles](despues/1365x768/registro.png)|

## Pulsaciones y confirmaciones

Botones efectivamente pulsados; no se cuentan cambios de selector, scroll ni tiempo humano. Mismo recorrido y azar controlado. Medición conservadora: el arnés pulsa también dados que ya están preseleccionados, aunque ese toque sea opcional. Los datos brutos incluyen las comprobaciones adicionales de consultas/foco.

|Recorrido|Escritorio antes → después|Móvil antes → después|
|---|---|---|
|Seleccionado → atacar|4 →3|4 →3|
|Tratamiento por habilidad|4 →3|5 →3|
|Usar objeto|5 →4|5 →4|
|Equipar al seleccionado|4 →3|4 →3|
|Transferir equipo|4 →3|4 →3|
|Aportar desde crisis|5 →4|5 →4|
|Limpiar|4 →3|4 →3|
|Atraer una vez y terminar|6 →5|6 →5|
|Mejorar dado|4 →3|4 →3|
|Moverse|2 →2|3 →2|
|Buscar/conservar|5 →4|5 →4|
|Registro y volver|3 →3|3 →3|
|Terminar turno y confirmar|2 →2|2 →2|
|Revisar colonia y nueva ronda local, sin expandir detalles|6 pulsaciones (5 avances y cierre), o2 con Ver todos →1 cierre|Igual|
|Mordedura/encrucijada/pase/sucesión|Se conserva cada elección real|Igual|

Se elimina el reconocimiento rutinario adicional, no la confirmación de coste. El pase privado y la confirmación de fallecimientos se conservan. El auto recorrido hasta derrota mezcla decisiones, consultas opcionales y pulsaciones durante transiciones; **no mide una sola fase de colonia**: registra42→48 en escritorio y41→48 en ambos móviles. Antes se detenía al primer aviso de final; ahora también confirma los fallecimientos pendientes y comprueba Registro tras el final. No se usa esa cifra para atribuir una mejora de pasos de colonia. Se conservan las trazas completas para revisión.

## Vídeo y decisiones

- [Turno con acciones, inventario, crisis, colonia y final · escritorio](despues/1365x768/turno-y-colonia.mp4).
- [Mismo recorrido · móvil horizontal](despues/852x393/turno-y-colonia.mp4).
- [Mismo recorrido · móvil vertical](despues/393x852/turno-y-colonia.mp4).
- [Colonia](despues/1365x768/colonia.png), [mordedura](despues/1365x768/mordedura.png), [encrucijada](despues/1365x768/encrucijada.png), [sucesión](despues/393x852/sucesion.png) y [final](despues/393x852/final.png).

Los vídeos se codifican a12FPS para revisión; las acciones se ejecutaron con animaciones habituales. La codificación agrega como máximo un píxel de borde por compatibilidad con H.264. No es una medida de rendimiento ni una prueba de teléfono físico.

## Resultado local

- Suite729/729; diez regresiones nuevas de experiencia, con reconocimiento puro, elecciones únicas sin envío, bloqueo por decisión ajena, recuperación sin reenvío y cadenas de mordedura separadas.
- HTML estable reproducible; SHA25628ee788a65d64271f3ce28bd2ff73d26dc2644aa798e51bf925f3914317be9ac. Fondo activo idéntico:0c5268c189068b5eb7bf51a1fbc871a87782b75e02dc86fe6d21aeeb272e4222.
- Presentación2 tamaños, capacidades4 escenarios, inventario2, ciclo10, animaciones de acciones2 y migración dirigida12, todos aprobados. Las comprobaciones de estado, RNG, privacidad, duplicación y cámara permanecen.
- Versión normal:6 recorridos (3 tamaños × movimiento habitual/reducido), sin fixtures/hooks QA, más6 recorridos normales de mordedura/encrucijada/sucesión. Guardia anti-V9 activa. [Auditoría final](despues/auditoria.json), [decisiones](despues/decisiones.json), [resultados dirigidos](pruebas/).

Chromium/emulación táctil. Sin Android físico, TalkBack, auditoría completa de lector de pantalla ni certificación de balance. Comodidad y composición requieren aceptación manual. La compuerta de Actions repite las baterías sobre el SHA final; el artifact correspondiente conserva sus capturas y resultados.

Cierre posterior de foco y elecciones legales: código1cda12a070cc9b27da30476cf568b9562c319c52, [presentación final](pruebas/presentacion-final.json), [inventario final](pruebas/inventario-final.json), [21 dirigidas](pruebas/elecciones-21.txt) y [constructor/filtros normales](pruebas/consultas-y-constructor.json). Los dos CI rojos se preservan en el informe; la aprobación final corresponde al nuevo SHA y su ejecución completa.
