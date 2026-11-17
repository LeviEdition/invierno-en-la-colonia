# Resultados SP-04 — segunda corrida

Generados con `node lab/sp04/segunda-corrida.mjs --partidas 500 --criterio v1` (112 celdas, semillas semillaC14(1..500), 113 s). Informe: docs/107-laboratorio-sp04-segunda-corrida.md. Los CSV de la primera corrida (`../resumen.csv`, `../por-ronda.csv`) no se tocan.

- `resumen.csv`: una fila por celda (combinación × escenario × política), con los agregados de la primera corrida y los nuevos.
- `ventaja.csv`: una fila por combinación y etapa: victoria cooperativa y objetivo (promedio de A y B y por escenario), ventaja de correr y si la cooperativa alcanza el 35 %.
- `por-ronda.csv`: una fila por celda y ronda.

Criterio de elección: v1 (ver elegirMejor y docs/107 §1.5).

Combinación elegida en cada etapa:

- 0-calibracion: `variante=un-grupo;dados=v99;crisis=2;comida=v99;zombis=v99;exposicion=d12;indefensos=-;comidaInicial=-;crisisFallida=v99;moralMuerte=1;equipoMuerto=v99;rondasObjetivo=-;rescate=-;medicoCome=true;conoceIndefensos=false` (cooperativa 70.4 %, objetivo 47.5 %, ventaja -22.9 %)
- 1-muerte: `variante=un-grupo;dados=v99;crisis=2;comida=v99;zombis=v99;exposicion=d12;indefensos=2;comidaInicial=6;crisisFallida=v99;moralMuerte=1;equipoMuerto=v99;rondasObjetivo=8;rescate=-;medicoCome=true;conoceIndefensos=true` (cooperativa 42.1 %, objetivo 14.5 %, ventaja -27.6 %)
- 2-indefensos-comida: `variante=un-grupo;dados=v99;crisis=2;comida=v99;zombis=v99;exposicion=d12;indefensos=0;comidaInicial=6;crisisFallida=v99;moralMuerte=1;equipoMuerto=v99;rondasObjetivo=8;rescate=-;medicoCome=true;conoceIndefensos=true` (cooperativa 72.2 %, objetivo 41.7 %, ventaja -30.5 %)
- 3-crisis-duracion: `variante=un-grupo;dados=v99;crisis=2;comida=v99;zombis=v99;exposicion=d12;indefensos=0;comidaInicial=6;crisisFallida=v99;moralMuerte=1;equipoMuerto=v99;rondasObjetivo=10;rescate=-;medicoCome=true;conoceIndefensos=true` (cooperativa 50.5 %, objetivo 10.8 %, ventaja -39.7 %)
- 4-dados: `variante=un-grupo;dados=doble;crisis=2;comida=v99;zombis=v99;exposicion=d12;indefensos=0;comidaInicial=6;crisisFallida=v99;moralMuerte=1;equipoMuerto=v99;rondasObjetivo=10;rescate=-;medicoCome=true;conoceIndefensos=true` (cooperativa 87.3 %, objetivo 41 %, ventaja -46.3 %)
- 5-rescate: `variante=un-grupo;dados=doble;crisis=2;comida=v99;zombis=v99;exposicion=d12;indefensos=0;comidaInicial=6;crisisFallida=v99;moralMuerte=1;equipoMuerto=v99;rondasObjetivo=10;rescate=rescatar;medicoCome=true;conoceIndefensos=true` (cooperativa 85.7 %, objetivo 35.7 %, ventaja -50 %)
- 5-rescate-muerte-v99: `variante=un-grupo;dados=doble;crisis=2;comida=v99;zombis=v99;exposicion=d12;indefensos=0;comidaInicial=6;crisisFallida=v99;moralMuerte=1;equipoMuerto=v99;rondasObjetivo=10;rescate=rescatar;medicoCome=true;conoceIndefensos=true` (cooperativa 85.7 %, objetivo 35.7 %, ventaja -50 %)
