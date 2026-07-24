import { createClient } from 'redis';

// Reutilizamos una sola conexión entre invocaciones de la función serverless
// (patrón recomendado para evitar agotar conexiones en Vercel).
let client;

async function getClient() {
  if (!client) {
    client = createClient({ url: process.env.UNO_REDIS_URL });
    client.on('error', (err) => console.error('Redis Client Error', err));
  }
  if (!client.isOpen) {
    await client.connect();
  }
  return client;
}

const STATE_KEY = 'uno-tournament-state';

export async function getState() {
  const c = await getClient();
  const raw = await c.get(STATE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function setState(state) {
  const c = await getClient();
  if (state === null) {
    await c.del(STATE_KEY);
  } else {
    await c.set(STATE_KEY, JSON.stringify(state));
  }
}

// Calcula los puntos de cada posición para una partida con `n` participantes,
// siguiendo las reglas del campeonato:
// - El último lugar siempre recibe 0 puntos.
// - Entre el último lugar y el 3er lugar hay 1 punto de diferencia por posición.
// - El 2do lugar recibe 2 puntos más que el 3ro.
// - El 1er lugar recibe 3 puntos más que el 2do.
// Devuelve un arreglo de longitud n, donde el índice 0 = 1er lugar, índice n-1 = último lugar.
export function computePointsForGame(n) {
  if (n <= 0) return [];
  const byPosition = new Array(n + 1).fill(0); // índice 1..n = posición 1ª..última
  byPosition[n] = 0; // último lugar
  for (let pos = n - 1; pos >= 3; pos--) {
    byPosition[pos] = byPosition[pos + 1] + 1;
  }
  if (n >= 3) {
    byPosition[2] = byPosition[3] + 2;
  }
  if (n >= 2) {
    byPosition[1] = byPosition[2] + 3;
  } else if (n === 1) {
    byPosition[1] = 0;
  }
  return byPosition.slice(1); // [puntos 1º, puntos 2º, ..., puntos último]
}
