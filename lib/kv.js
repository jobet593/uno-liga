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

export const POINTS_BY_POSITION = { 1: 10, 2: 7, 3: 5, 4: 3 };
