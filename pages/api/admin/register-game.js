import { randomUUID } from 'crypto';
import { getState, setState, computePointsForGame } from '../../../lib/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Método no permitido' });
  }
  const state = await getState();
  if (!state) {
    return res.status(400).json({ error: 'No hay un campeonato activo.' });
  }

  const order = req.body?.order;
  if (!Array.isArray(order) || order.length < 2) {
    return res.status(400).json({ error: 'Selecciona al menos 2 jugadores en orden de finalización.' });
  }
  if (new Set(order).size !== order.length) {
    return res.status(400).json({ error: 'Cada jugador solo puede aparecer una vez en el orden.' });
  }
  const validIds = new Set(state.players.filter((p) => !p.hidden).map((p) => p.id));
  if (!order.every((id) => validIds.has(id))) {
    return res.status(400).json({ error: 'Uno o más jugadores seleccionados no son válidos.' });
  }

  const pointsAwarded = computePointsForGame(order.length);

  order.forEach((playerId, index) => {
    const player = state.players.find((p) => p.id === playerId);
    if (player) {
      player.points += pointsAwarded[index];
      player.gamesPlayed += 1;
    }
  });

  state.games.push({
    id: randomUUID(),
    number: state.games.length + 1,
    order,
    pointsAwarded,
    playedAt: new Date().toISOString(),
  });

  await setState(state);
  return res.status(200).json({ state });
}
