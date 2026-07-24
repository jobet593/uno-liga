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

## 3. Conectar Vercel KV (la base de datos)

1. Dentro del proyecto ya importado en Vercel, ve a la pestaña **Storage**.
2. Haz clic en **Create Database** → elige **KV** (Redis).
3. Dale un nombre (por ejemplo `uno-kv`) y confirma.
4. Vercel te va a preguntar a qué proyecto conectarla — selecciona `uno-campeonato`.
   Esto agrega automáticamente las variables de entorno (`KV_REST_API_URL`,
   `KV_REST_API_TOKEN`, etc.) al proyecto, no tienes que copiarlas a mano.
5. Ve a la pestaña **Deployments** y vuelve a desplegar (**Redeploy**) el último deploy para
   que tome las nuevas variables de entorno.

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

Para probar localmente con datos reales necesitas copiar las variables de entorno de Vercel
KV a un archivo `.env.local` (mismo formato que `.env.example`). Vercel te las puede generar
automáticamente con `vercel env pull .env.local` si instalas su CLI (`npm i -g vercel`) y
haces `vercel link` primero.

## Reglas de puntaje

| Posición | Puntos |
|----------|--------|
| 1.º      | 10     |
| 2.º      | 7      |
| 3.º      | 5      |
| 4.º      | 3      |
| 5.º o más| 0      |

Al llegar al número de partidas configurado al crear el campeonato, la app resalta
automáticamente a los 4 jugadores con más puntos como finalistas.
