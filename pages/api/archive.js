import { getArchive } from '../../lib/kv';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Método no permitido' });
  }
  try {
    const archive = await getArchive();
    return res.status(200).json({ archive });
  } catch (err) {
    return res.status(500).json({ error: 'No se pudo leer el historial de campeonatos' });
  }
}
