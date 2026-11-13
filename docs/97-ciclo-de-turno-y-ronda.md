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

## C — fase de colonia estructurada

Observación opcional de las cinco fases directamente en las ramas del motor. Cada paso conserva contadores públicos anteriores/posteriores y eventos ordenados: llegadas, barricada interceptora, desbordamiento, muerte y dado real de ruido. Crisis registra su resultado al resolver, sin exponer el contenido de cartas antes de ese momento. El diario no serializa manos, mazos ni cartas aportadas. No consume azar ni llama a `paint` para obtener datos.

La revisión muestra qué se resolvió, por qué y qué cambió. Siguiente paso/Ver todos solo recorren los datos; la última confirmación reconoce el recibo, sin ejecutar efectos. Resultados y diario sobreviven a reconstruir/reconectar el visor mientras el host siga vivo. El Registro del mapa presenta este diario público; el Registro original sigue disponible en V9.

Cinco regresiones adicionales comparan con el motor sin instrumentación y las mismas capacidades: estados/azar iguales con hambre, residuos, crisis válida/excepcional y los cuatro fallos; derrota que corta pasos; saturación y muertes ordenadas en gasolinera/biblioteca; dados de ruido sin repetición. Las nueve pruebas B/C y el HTML estable pasan.

## D — nueva ronda, final y continuidad

El inicio de ronda se observa después de aplicar la operación original completa, incluidos los usos reiniciados y la congelación. La actuación de IA tiene su propio paso público antes de colonia. No se serializan sus cartas ni valores de dados privados. Mientras se resuelve/revisa el ciclo, las acciones y los dados permanecen bloqueados y la ronda siguiente no aparece disponible. En local aún debe completarse el pase; cualquier sucesión u otra decisión mantiene el bloqueo después del pase.

Victoria, derrota por moral/supervivientes y tiempo conservan los puntos de verificación originales. El final presenta la causa y permite consultar mapa/Registro; no prepara otra ronda ni reinicia. Para tiempo, V9 incrementa internamente el contador para detectar el límite, pero no ejecuta `newRound`; la cabecera muestra la última ronda como finalizada. Esta versión solo tiene objetivo general público, sin resultados individuales secretos que trasladar.

Resumen y Registro usan exclusivamente datos públicos estructurados. Los paneles de búsqueda/acciones ya integrados conservan sus decisiones propias: no se redirigen al ciclo ni se ocultan sus cartas de elección al abrirse un `lootChoice`. Los resultados finales de una acción pueden continuar al final de partida del mapa. Los diálogos evitan clics al fondo, gestionan foco y tienen desplazamiento interno/controles44px. No hay animaciones largas nuevas; Ver todos y acortar las pausas nativas de IA permiten un avance ágil, sin alterar efectos o azar. Se conserva movimiento reducido.

## Flujos y límites

| Flujo | Estado |
|---|---|
|Aportar, actuar, terminar ambos turnos locales, revisar colonia y nueva ronda|Integrado desde una partida preparada|
|Humano→IA original→colonia→nueva ronda|Integrado; no hay automatismo en el renderer|
|Pase de dispositivo y privacidad|Integrado; manos/dados ocultos hasta confirmar|
|Fallecimientos y sucesión durante el ciclo|Integrados con confirmación/elección del jugador y operaciones nativas|
|Victoria/derrota y consulta del estado final|Integrados, sin reinicio ni ronda automática posterior|
|Buscar, elegir carta/ruido, inventario, ataque y construcción existentes|Conservados en sus paneles del mapa|
|Mordeduras y encrucijadas obligatorias|Retorno explícito a sus componentes originales en V9; no se elige automáticamente|
|Decisiones nativas de tratamiento, atracción o transferencia pendientes|Retorno explícito a V9; cierre bloqueado hasta resolverlas|
|Preparación de partida e intercambios entre jugadores|Permanecen en V9|
|Registro público del ciclo|Integrado; el Registro heredado completo sigue en V9 para no filtrar cartas privadas|

**No se declara integrado todo caso obligatorio.** El siguiente pendiente recomendado es trasladar mordeduras y encrucijadas reutilizando sus decisiones originales y privacidad; no crear narrativa nueva.

Reconstruir el visor conserva cámara/zoom y recupera el recibo pendiente; reconectar el puerto consulta la misma instancia del motor y no repite comandos. Las solicitudes se deduplican por identidad/generación y se revalida la revisión. El índice de revisión es visual: si se pierde, puede volver al primer paso sin repetir efectos. Una partida nueva invalida trabajos/resultados anteriores, incluso una IA suspendida. **Recargar toda la aplicación/host crea otra instancia y requiere preparación:** no hay guardado persistente nuevo. Un fallo interno de cierre sin resultado confirmado bloquea nuevos cierres del mapa y ofrece consultar V9.

## Validación de entrega

[Capturas, vídeos y resultados](evidencias/ciclo-turno-ronda/README.md). Suite683/683 y17 dirigidas del ciclo: dos de aportes, cinco de cierre/protocolo, cinco de colonia y cinco de nueva ronda/IA/final. Comparaciones con el motor sin instrumentación y capacidades33 equivalentes en estado, orden y consumo de azar. Arte, posiciones, capacidades y HTML estable conservados.

Ocho recorridos Chromium1365×768/852×393: local completo (aportar→actuar→ambos cierres→colonia→nueva ronda), IA real, muerte/sucesión y derrota por tiempo. En escritorio se añade respuesta de cierre perdida, reconstrucción del visor y reconexión durante la revisión, con mismo resultado/cámara/azar y sin reenvío. Inventario y acciones anteriores pasan en ambos tamaños. Escenarios preparados mediante QA sobre el motor real, rotulados; móvil con tacto/DPR2 emulado, sin teléfono físico.

Se corrigieron dos regresiones detectadas por los recorridos: sincronizar todos los controladores tras confirmar un estado, y delegar al panel de búsqueda/acción las decisiones que ya tenía integradas. El chequeo de cámara espera que el cartel QA haya terminado su cambio de tamaño antes de fijar la línea base. No se aumentaron esperas ni se retiraron aserciones.

Commits revisables A/B/C:cc383e8,c1f63a3,1de6bba; D, SHA exacto final y CI se registran en PR25. La aceptación manual sigue pendiente del creador. Sin main, fusión, publicación, narrativa nueva, beneficios de líder o balance adicional.
