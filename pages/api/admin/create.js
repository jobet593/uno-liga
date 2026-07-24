import { setState } from '../../../lib/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Método no permitido' });
  }
  const { name, totalGames } = req.body || {};
  const trimmedName = (name || '').trim();
  const games = parseInt(totalGames, 10);

  if (!trimmedName) {
    return res.status(400).json({ error: 'Ingresa un nombre para el campeonato.' });
  }
  if (!games || games < 1) {
    return res.status(400).json({ error: 'Ingresa un número válido de partidas.' });
  }

  const state = {
    name: trimmedName,
    totalGames: games,
    players: [],
    games: [],
    createdAt: new Date().toISOString(),
  };

  await setState(state);
  return res.status(200).json({ state });
}
