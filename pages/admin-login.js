import { useState } from 'react';
import Head from 'next/head';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo iniciar sesión.');
      }
      window.location.href = '/admin';
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Acceso admin · Campeonato UNO</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="wrap">
        <div className="header">
          <div className="brand">
            <div className="logo-oval">
              <span>UNO</span>
            </div>
            <div>
              <h1>Campeonato UNO</h1>
              <p>Acceso de administrador</p>
            </div>
          </div>
        </div>
        <div className="panel setup-panel">
          <h2>
            <span className="bar"></span>Ingresa la contraseña
          </h2>
          <label htmlFor="pwd">Contraseña de administrador</label>
          <input
            type="password"
            id="pwd"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            autoFocus
          />
          <div className="error-msg">{error}</div>
          <button className="btn-primary btn-block" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Verificando…' : 'Entrar'}
          </button>
        </div>
      </div>
    </>
  );
}
