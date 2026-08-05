import { randomUUID } from 'crypto';
import { getState, setState, getArchive, setArchive } from '../../../lib/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const current = await getState();

  // Si había un campeonato con algo de contenido, lo guardamos en el
  // historial en vez de simplemente borrarlo.
  if (current && (current.players.length > 0 || current.games.length > 0)) {
    const archive = await getArchive();
    const snapshot = {
      ...current,
      id: randomUUID(),
      finished: !!current.finished,
      finishedAt: current.finished && current.finishedAt ? current.finishedAt : new Date().toISOString(),
      abandoned: !current.finished,
    };
    archive.unshift(snapshot);
    await setArchive(archive);
  }

  await setState(null);
  return res.status(200).json({ state: null });
}
