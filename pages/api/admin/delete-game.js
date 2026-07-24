import { getState, setState } from '../../../lib/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Método no permitido' });
  }
  const state = await getState();
  if (!state) {
    return res.status(400).json({ error: 'No hay un campeonato activo.' });
  }
  const { id } = req.body || {};
  const game = state.games.find((g) => g.id === id);
  if (!game) {
    return res.status(404).json({ error: 'Partida no encontrada.' });
  }

  game.order.forEach((playerId, index) => {
    const player = state.players.find((p) => p.id === playerId);
    if (player) {
      player.points -= game.pointsAwarded[index];
      player.gamesPlayed = Math.max(0, player.gamesPlayed - 1);
    }
  });

  state.games = state.games.filter((g) => g.id !== id);
  state.games.forEach((g, i) => {
    g.number = i + 1;
  });

  await setState(state);
  return res.status(200).json({ state });
}
