# Historial de versiones

## v7 (actual)
- **Finalizar campeonato**: nuevo botón "🏆 Finalizar campeonato" en `/admin` que marca el
  campeonato como terminado con los resultados que se tengan hasta ese momento (no hace
  falta jugar todas las partidas planeadas) y muestra un podio con el top 4. No bloquea la
  edición — se puede seguir registrando/editando partidas después si hace falta.
- **Historial de campeonatos**: "Nuevo campeonato" ahora archiva el campeonato actual en vez
  de borrarlo. Nueva página `/historial` (pública) para consultar campeonatos pasados, su
  campeón, y el detalle completo de tabla de posiciones y partidas de cada uno.
- **Contraseña de administrador**: `/admin` y las rutas de la API de administración ahora
  requieren iniciar sesión con una contraseña (configurada como variable de entorno
  `ADMIN_PASSWORD` en Vercel, nunca en el código). Nueva página `/admin-login` y opción de
  "Cerrar sesión" desde el panel.
- Nuevos archivos: `middleware.js`, `pages/admin-login.js`, `pages/historial.js`,
  `pages/api/login.js`, `pages/api/logout.js`, `pages/api/archive.js`,
  `pages/api/admin/finish.js`, `components/ChampionPodium.js`.

## v6
- **Estadísticas por jugador**: al tocar el nombre de un jugador (en `/admin` o en la vista
  pública) se abre una ficha con partidas jugadas, promedio de puntos, veces en 1º/2º/3º
  lugar, mejor/peor puesto y racha actual de victorias consecutivas.
- **Editar partida**: nuevo botón ✏️ en el historial de partidas (junto al de eliminar) para
  corregir el orden de una partida ya registrada, sin borrarla y volver a crearla. Revierte
  los puntos anteriores y aplica los nuevos automáticamente.
- **Gráfica de evolución de puntos**: nueva sección "Evolución de puntos" con una línea de
  tiempo del acumulado de cada jugador, partida a partida (usa la librería `recharts`).
- Nueva dependencia: `recharts` (agregada a `package.json`).

## v5
- Ajuste al sistema de puntos ("podio suavizado"): el 1er lugar ahora recibe 2 puntos más
  que el 2do (antes 3), y el 2do recibe 1 punto más que el 3ro (antes 2). El resto de la
  escala (3er lugar hacia abajo) no cambia. Ver la tabla de ejemplos actualizada en el
  `README.md`.
- **Importante**: las partidas ya registradas ANTES de este cambio conservan los puntos que
  ya se calcularon con la fórmula anterior (no se recalculan solas). Si quieres que toda la
  tabla use la nueva fórmula desde el principio, la forma más simple es iniciar un nuevo
  campeonato.

## v4
- Medallas 🥇🥈🥉 en la tabla de posiciones para el 1º, 2º y 3º lugar.
- Aviso de confirmación ("✅ ¡Partida guardada!") al registrar una partida desde `/admin`,
  que aparece un par de segundos y desaparece solo.
- Filtro por jugador en el historial de partidas (disponible tanto en `/admin` como en la
  vista pública), para ver solo las rondas en las que participó alguien en específico.

## v3
- **Corrección de fondo**: el servidor ahora "sanea" siempre los datos que lee de la base de
  datos (rellena valores faltantes, corrige tipos, filtra registros corruptos) antes de
  enviarlos a la app, sin importar de qué versión anterior vengan. Esto evita pantallas en
  blanco por datos con una forma inesperada.
- Se agregó una pantalla de emergencia (con botón para recargar o reiniciar el campeonato)
  en vez de una página en blanco si llegara a ocurrir un error inesperado.
- Nuevo sistema de puntuación: en vez de la escala fija 10/7/5/3, los puntos de cada partida
  se calculan automáticamente según cuántos jugadores participaron en ELLA (no el total del
  campeonato). El último lugar siempre recibe 0, y sube gradualmente hasta el 1º (ver
  fórmula y tabla de ejemplos en el `README.md`).
- El registro de partida ahora pide el orden completo de todos los que jugaron esa ronda
  (ya no solo 1º-4º lugar), para poder repartir puntos a todos.
- Nueva interfaz de registro: tocas a los jugadores en el orden en que terminaron, con
  opción de reordenar (↑/↓) o quitar (✕) antes de guardar, y vista previa de puntos en vivo.
- El historial de partidas ahora muestra el orden completo con los puntos otorgados a cada
  quien, no solo el podio.
- Mientras se está registrando una partida, se bloquea temporalmente agregar/ocultar
  jugadores (para evitar inconsistencias a mitad del registro).
- Base de datos y despliegue sin cambios respecto a v2.

## v2
- Se reemplazó `@vercel/kv` (descontinuado) por el cliente `redis` estándar de Node,
  conectándose mediante la variable de entorno `UNO_REDIS_URL`.
- Pensado para reutilizar una base de datos Redis ya existente en tu cuenta de Vercel,
  conectándola a este proyecto con el prefijo personalizado `UNO`.
- Instrucciones de despliegue actualizadas en `README.md` (sección 3).
- Sin cambios en la interfaz, el diseño ni las reglas de puntaje respecto a v1.

## v1
- Primera versión: control de puntos de campeonato UNO, panel `/admin` + vista pública
  `/` de solo lectura, responsive, pensado originalmente para Vercel KV.
