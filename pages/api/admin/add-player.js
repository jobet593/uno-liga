import { randomUUID } from 'crypto';
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
  const name = (req.body?.name || '').trim();
  if (!name) {
    return res.status(400).json({ error: 'Ingresa un nombre.' });
  }
  const exists = state.players.some(
    (p) => !p.hidden && p.name.toLowerCase() === name.toLowerCase()
  );
  if (exists) {
    return res.status(400).json({ error: 'Ya hay un jugador activo con ese nombre.' });
  }

  state.players.push({
    id: randomUUID(),
    name,
    hidden: false,
    points: 0,
    gamesPlayed: 0,
  });

  await setState(state);
  return res.status(200).json({ state });
}
