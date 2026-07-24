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
  const { id, hidden } = req.body || {};
  const player = state.players.find((p) => p.id === id);
  if (!player) {
    return res.status(404).json({ error: 'Jugador no encontrado.' });
  }
  player.hidden = !!hidden;

  await setState(state);
  return res.status(200).json({ state });
}
