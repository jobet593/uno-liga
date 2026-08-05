# Campeonato UNO — control de puntos

App para llevar el control de puntos de un campeonato de UNO (modalidad de puntos, sin
eliminados). Tiene dos vistas:

- **`/`** — vista pública, de solo lectura, con auto-actualización. Este es el link que compartes.
- **`/admin`** — panel de administración con todos los controles (crear campeonato, agregar
  jugadores, registrar partidas, etc). Este es el que usas tú, no lo compartas.

> Nota: no hay contraseña en `/admin`. La separación es que nadie más conoce ni visita esa
> ruta. Si en algún momento quieres protegerla con una clave, dímelo y lo agregamos.

## 1. Subir el código a GitHub

Desde esta carpeta del proyecto:

```bash
git init
git add .
git commit -m "Campeonato UNO v1"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/uno-campeonato.git
git push -u origin main
```

(Antes crea el repositorio vacío en GitHub, sin README, y reemplaza la URL de arriba por la tuya).

## 2. Importar el proyecto en Vercel

1. Entra a [vercel.com/new](https://vercel.com/new).
2. Selecciona el repositorio `uno-campeonato` que acabas de subir.
3. Vercel detecta que es un proyecto Next.js automáticamente. No cambies ninguna
   configuración, solo dale a **Deploy**.
4. Este primer deploy va a funcionar a medias porque todavía no existe la base de datos
   (Vercel KV) — lo resolvemos en el siguiente paso.

## 3. Conectar tu base de datos Redis

Vercel KV ya no existe como producto; ahora las bases de datos Redis se manejan desde el
**Marketplace** (por ejemplo, vía Redis Cloud o Upstash). Si ya tienes una base de datos
Redis creada en tu cuenta de Vercel (de otro proyecto), **no necesitas crear otra** — el
plan gratuito suele permitir solo una, pero una misma base puede conectarse a varios
proyectos sin problema, siempre que cada proyecto use un prefijo de variable de entorno
distinto para no pisarse los datos.

1. Dentro del proyecto `uno-campeonato` en Vercel, ve a la pestaña **Storage**.
2. Busca tu base de datos Redis existente en la lista y selecciona **Connect Project** (o
   entra a la base de datos desde "Databases" de tu cuenta y haz lo mismo).
3. En el diálogo de configuración:
   - **Environments**: deja `Production, Preview`.
   - **Custom Environment Variable Prefix**: escribe `UNO` (importante: distinto al que uses
     en tus otros proyectos, para que no se mezclen las variables).
4. Haz clic en **Connect Project**. Esto crea la variable de entorno `UNO_REDIS_URL` en tu
   proyecto automáticamente.
5. Ve a la pestaña **Deployments** y vuelve a desplegar (**Redeploy**) el último deploy para
   que tome la nueva variable de entorno.

## 4. Usar la app

- Comparte con los demás la URL principal que te da Vercel, por ejemplo:
  `https://uno-campeonato.vercel.app` → esa es la vista pública de solo lectura.
- Tú entra a `https://uno-campeonato.vercel.app/admin` para crear el campeonato, agregar
  jugadores y registrar partidas.
- La vista pública se actualiza sola cada pocos segundos, no hace falta que nadie recargue
  la página manualmente.

## Desarrollo local (opcional)

```bash
npm install
npm run dev
```

Para probar localmente con datos reales necesitas copiar la variable `UNO_REDIS_URL` de
Vercel a un archivo `.env.local` (mismo formato que `.env.example`). Vercel te la puede
generar automáticamente con `vercel env pull .env.local` si instalas su CLI
(`npm i -g vercel`) y haces `vercel link` primero.

## Reglas de puntaje

Los puntos de cada partida se calculan automáticamente según cuántos jugadores participaron
en ella (no según el total del campeonato):

- El último lugar siempre recibe **0 puntos**.
- Entre el último lugar y el 3er lugar hay **1 punto de diferencia** por cada posición.
- El 2do lugar recibe **1 punto más** que el 3ro.
- El 1er lugar recibe **2 puntos más** que el 2do.

Ejemplos (primer lugar → último lugar):

| Jugadores en la partida | Puntos por posición   |
|--------------------------|------------------------|
| 4                         | 4 – 2 – 1 – 0           |
| 5                         | 5 – 3 – 2 – 1 – 0       |
| 6                         | 6 – 4 – 3 – 2 – 1 – 0   |
| 8                         | 8 – 6 – 5 – 4 – 3 – 2 – 1 – 0 |

Al registrar una partida desde `/admin`, ordenas a todos los que jugaron esa ronda (1º al
último) y la app calcula los puntos sola.

## Otras funcionalidades

- **Estadísticas por jugador**: toca el nombre de cualquier jugador (en `/admin` o en la
  vista pública) para ver sus partidas jugadas, promedio de puntos, veces en el podio,
  mejor/peor puesto y racha actual de victorias.
- **Editar una partida**: desde `/admin`, el botón ✏️ en el historial permite corregir el
  orden de una partida ya registrada sin tener que borrarla y crearla de nuevo.
- **Gráfica de evolución de puntos**: muestra cómo fueron subiendo los puntos de cada
  jugador partida a partida, tanto en `/admin` como en la vista pública.

Al llegar al número de partidas configurado al crear el campeonato, la app resalta
automáticamente a los 4 jugadores con más puntos como finalistas.

## Finalizar campeonato y podio

En cualquier momento (no hace falta llegar al número de partidas planeado) puedes hacer clic
en **"🏆 Finalizar campeonato"** desde `/admin`. Esto no borra ni bloquea nada — solo marca el
campeonato como finalizado y muestra un podio con los 4 mejores puntajes actuales, tanto en
`/admin` como en la vista pública. Puedes seguir registrando o editando partidas después si
lo necesitas.

## Historial de campeonatos

Cuando haces clic en **"Iniciar nuevo campeonato"**, el campeonato actual (jugadores,
partidas, resultados) se guarda automáticamente en el historial en vez de borrarse. Puedes
consultarlo en `/historial` (accesible para cualquiera con el link), donde se muestra el
campeón de cada campeonato pasado y, si quieres, el detalle completo de su tabla de
posiciones y partidas.

## Contraseña de administrador

`/admin` ahora requiere una contraseña para entrar (las rutas de la API de administración
también quedan protegidas). Para configurarla:

1. Ve a tu proyecto en Vercel → **Settings → Environment Variables**.
2. Agrega una variable llamada `ADMIN_PASSWORD` con el valor que quieras usar como
   contraseña.
3. Selecciona los entornos **Production** y **Preview**, y guarda.
4. Vuelve a desplegar (**Redeploy**) para que tome la nueva variable.

Sin esta variable configurada, `/admin` seguirá pidiendo la contraseña pero ningún valor
será aceptado — asegúrate de configurarla antes de compartir la app.
