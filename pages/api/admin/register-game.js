import { randomUUID } from 'crypto';
import { getState, setState, POINTS_BY_POSITION } from '../../../lib/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Método no permitido' });
  }
  const state = await getState();
  if (!state) {
    return res.status(400).json({ error: 'No hay un campeonato activo.' });
  }
  const positions = req.body?.positions;
  if (!positions) {
    return res.status(400).json({ error: 'Datos inválidos.' });
  }

  const ids = [1, 2, 3, 4].map((pos) => positions[pos]);
  if (ids.some((id) => !id)) {
    return res.status(400).json({ error: 'Selecciona un jugador para cada posición.' });
  }
  if (new Set(ids).size !== 4) {
    return res.status(400).json({ error: 'Cada jugador solo puede ocupar una posición.' });
  }

  for (const pos of [1, 2, 3, 4]) {
    const player = state.players.find((p) => p.id === positions[pos]);
    if (player) {
      player.points += POINTS_BY_POSITION[pos];
      player.gamesPlayed += 1;
    }
  }

  state.games.push({
    id: randomUUID(),
    number: state.games.length + 1,
    positions,
    playedAt: new Date().toISOString(),
  });

  await setState(state);
  return res.status(200).json({ state });
}
