import { setState } from '../../../lib/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Método no permitido' });
  }
  await setState(null);
  return res.status(200).json({ state: null });
}
