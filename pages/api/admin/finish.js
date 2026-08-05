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
  if (state.players.length === 0) {
    return res.status(400).json({ error: 'Agrega al menos un jugador antes de finalizar.' });
  }

  state.finished = true;
  state.finishedAt = new Date().toISOString();

  await setState(state);
  return res.status(200).json({ state });
}
