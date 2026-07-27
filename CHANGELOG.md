# Historial de versiones

## v4 (actual)
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
