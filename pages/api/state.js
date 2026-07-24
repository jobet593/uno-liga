import { getState } from '../../lib/kv';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Método no permitido' });
  }
  try {
    const state = await getState();
    return res.status(200).json({ state });
  } catch (err) {
    return res.status(500).json({ error: 'No se pudo leer el estado del campeonato' });
  }
}
