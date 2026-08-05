export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Método no permitido' });
  }
  res.setHeader('Set-Cookie', 'uno_admin_auth=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
  return res.status(200).json({ ok: true });
}
