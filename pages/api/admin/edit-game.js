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

  const { id, order } = req.body || {};
  const game = state.games.find((g) => g.id === id);
  if (!game) {
    return res.status(404).json({ error: 'Partida no encontrada.' });
  }
  if (!Array.isArray(order) || order.length < 2) {
    return res.status(400).json({ error: 'Selecciona al menos 2 jugadores en orden de finalización.' });
  }
  if (new Set(order).size !== order.length) {
    return res.status(400).json({ error: 'Cada jugador solo puede aparecer una vez en el orden.' });
  }
  const validIds = new Set(state.players.map((p) => p.id));
  if (!order.every((pid) => validIds.has(pid))) {
    return res.status(400).json({ error: 'Uno o más jugadores seleccionados no son válidos.' });
  }

  // Revertimos exactamente lo que había otorgado la versión anterior de esta partida.
  const oldOrder = Array.isArray(game.order) ? game.order : [];
  const oldPoints = Array.isArray(game.pointsAwarded) ? game.pointsAwarded : oldOrder.map(() => 0);
  oldOrder.forEach((pid, idx) => {
    const player = state.players.find((p) => p.id === pid);
    if (player) {
      player.points -= oldPoints[idx] || 0;
      player.gamesPlayed = Math.max(0, player.gamesPlayed - 1);
    }
  });

  // Aplicamos el nuevo orden.
  const newPoints = computePointsForGame(order.length);
  order.forEach((pid, idx) => {
    const player = state.players.find((p) => p.id === pid);
    if (player) {
      player.points += newPoints[idx];
      player.gamesPlayed += 1;
    }
  });

  game.order = order;
  game.pointsAwarded = newPoints;
  game.editedAt = new Date().toISOString();

  await setState(state);
  return res.status(200).json({ state });
}
