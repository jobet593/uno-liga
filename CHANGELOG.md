# Historial de versiones

## v2 (actual)
- Se reemplazó `@vercel/kv` (descontinuado) por el cliente `redis` estándar de Node,
  conectándose mediante la variable de entorno `UNO_REDIS_URL`.
- Pensado para reutilizar una base de datos Redis ya existente en tu cuenta de Vercel,
  conectándola a este proyecto con el prefijo personalizado `UNO`.
- Instrucciones de despliegue actualizadas en `README.md` (sección 3).
- Sin cambios en la interfaz, el diseño ni las reglas de puntaje respecto a v1.

## v1
- Primera versión: control de puntos de campeonato UNO, panel `/admin` + vista pública
  `/` de solo lectura, responsive, pensado originalmente para Vercel KV.
