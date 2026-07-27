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

// Convierte lo que sea que haya quedado guardado (de esta versión o de una
// anterior, o incluso datos parcialmente corruptos) en una forma consistente
// y segura de usar en la interfaz. Así el front nunca recibe algo inesperado.
function normalizeState(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const players = Array.isArray(raw.players)
    ? raw.players
        .filter((p) => p && typeof p === 'object' && p.id)
        .map((p) => ({
          id: String(p.id),
          name: typeof p.name === 'string' && p.name.trim() ? p.name : 'Jugador',
          hidden: !!p.hidden,
          points: typeof p.points === 'number' && !Number.isNaN(p.points) ? p.points : 0,
          gamesPlayed:
            typeof p.gamesPlayed === 'number' && !Number.isNaN(p.gamesPlayed) ? p.gamesPlayed : 0,
        }))
    : [];

  const games = Array.isArray(raw.games)
    ? raw.games
        .filter((g) => g && typeof g === 'object')
        .map((g, i) => {
          let order = Array.isArray(g.order) ? g.order.filter(Boolean).map(String) : [];
          if (order.length === 0 && g.positions && typeof g.positions === 'object') {
            order = [1, 2, 3, 4].map((pos) => g.positions[pos]).filter(Boolean).map(String);
          }
          const pointsAwarded = Array.isArray(g.pointsAwarded) && g.pointsAwarded.length === order.length
            ? g.pointsAwarded
            : order.map(() => 0);
          return {
            id: g.id ? String(g.id) : `game-${i}`,
            number: typeof g.number === 'number' ? g.number : i + 1,
            order,
            pointsAwarded,
            playedAt: g.playedAt || null,
          };
        })
    : [];

  return {
    name: typeof raw.name === 'string' && raw.name.trim() ? raw.name : 'Campeonato UNO',
    totalGames:
      typeof raw.totalGames === 'number' && raw.totalGames > 0 ? raw.totalGames : 6,
    players,
    games,
    createdAt: raw.createdAt || null,
  };
}

export async function getState() {
  const c = await getClient();
  const raw = await c.get(STATE_KEY);
  if (!raw) return null;
  try {
    return normalizeState(JSON.parse(raw));
  } catch (e) {
    console.error('Estado guardado corrupto, no se pudo leer:', e);
    return null;
  }
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
