export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Método no permitido' });
  }

  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({
      error: 'ADMIN_PASSWORD no está configurada en el servidor. Agrégala en Vercel → Settings → Environment Variables.',
    });
  }

  const { password } = req.body || {};
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Contraseña incorrecta.' });
  }

  const isProd = process.env.NODE_ENV === 'production';
  const maxAge = 60 * 60 * 24 * 30; // 30 días
  const cookie = `uno_admin_auth=ok; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${isProd ? '; Secure' : ''}`;
  res.setHeader('Set-Cookie', cookie);

  return res.status(200).json({ ok: true });
}
