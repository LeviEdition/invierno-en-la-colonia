# 97 — Ciclo de turno y ronda desde el mapa

Base303bf26ef647bb42f412bb16210f23c36586a7b5, remoto/local limpios y CI43452381777 success verificados. Misma rama/PR25 draft; sin avances posteriores al iniciar. Capacidades experimentales33 y plazas12/4 conservadas. Arte, geometría y referencia estable preservados. Sin AGENTS.md aplicable.

## Auditoría del motor V9.9

La aportación existente acepta solo el tipo exigido y hasta necesidad+2 cartas, desde mano o equipo, sin dado/residuos. No existe recuperación de lo entregado. Se conserva incluso la aportación extra estratégica; no se añade una restricción al alcanzar la necesidad. El contador público es cartas entregadas; no se publica su contenido ni un cálculo de aportes válidos.

Terminar turno bloquea partida terminada, IA activa, pase sin confirmar, muertes pendientes, sucesión y decisiones de tratamiento/búsqueda/mordedura/atracción/transferencia/encrucijada. Puede terminarse con dados restantes. En local, J1→J2 aplica congelación del entrante, reemplazos y verificación; prepara su encrucijada y pide pase. J2→colonia espera confirmaciones de muerte; incrementa ronda y termina por tiempo o inicia ronda. Finalmente pide pase a J1. En modo IA, se usa el automatismo original: turno IA, pausas/decisiones, colonia, pausa y nueva ronda; no nace del renderer.

Colonia: **alimentación → residuos → crisis → llegadas por habitantes (en orden de localidades) → ruido (en orden de localidades)**. Alimentación suficiente consume necesidad; insuficiente conserva comida, incrementa hambre y pierde esa cantidad de moral. Residuos≥10 pierden piso(residuos/10) de moral sin retirar residuos. Crisis aplica su resolución original y vacía los aportes. Llegadas: techo(habitantes de colonia/2), luego una por superviviente exterior. Ruido se limpia y tira una exposición de aparición por ficha;1–3 incorpora zombi. Se verifica fin después de alimentación, residuos, crisis y cada incorporación/tirada; una derrota corta los pasos restantes.

Nueva ronda: jugador humano, revisiones de líderes, reinicio de movimiento/habilidades/equipo usado, crisis, dados de ambos grupos, encrucijada humana, congelación humana/reemplazos/verificación y activación de encrucijada de ronda. Victoria/moral/sin reemplazo se comprueban por `verify`; tiempo al incrementar ronda sobre el máximo. No se adelantan tiradas para presentar.

## A — aportaciones y dependencias de interfaz

Resumen persistente público de objetivo y crisis, acceso Aportar a crisis y acceso por inventario. Vista de aportación filtrada por consultas legales del motor, revisión/cancelación y advertencia de entrega definitiva. Inventario/Registro/herramientas permanecen en el desplegable V9; inventario contextual conservado. No se exponen tipos de aportes ni manos rivales. Pruebas dirigidas de extras legales y cancelación, junto a las once regresiones de inventario existentes.

## B — terminar turno, pase e IA

Botón principal fuera de herramientas, confirmación con dados restantes y cancelación pura. Puente de comandos acotado al motor original, sin ejecutar IA desde renders. Identidad de solicitud, revisión de estado y generación deduplican cierres y recuperan estado tras respuesta perdida. El pase nativo mantiene ocultas manos/dados; comandos salientes se bloquean. Muertes y sucesión disponen de confirmación/elección sobre las operaciones originales; mordeduras, encrucijadas y decisiones de acciones conservan retorno explícito a V9.9. La opción de acortar pausas usa `skipAutomation` existente.

Verificación del bloque: cuatro pruebas de equivalencia, privacidad, dados restantes, cancelación, obsolescencia/doble confirmación/recuperación y partida nueva. Chromium escritorio: terminar/cancelar/pasar dentro del mapa, sin consumir al cancelar ni salir de la vista al confirmar pase. Referencia HTML reproducible. Las consecuencias detalladas de colonia y nueva ronda se completan en C/D.
