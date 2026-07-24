import { useEffect, useState } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import FinalBanner from '../components/FinalBanner';
import Standings, { sortedActive } from '../components/Standings';
import GameHistory from '../components/GameHistory';

const POLL_MS = 4000;

export default function PublicPage() {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchState() {
    try {
      const res = await fetch('/api/state');
      const data = await res.json();
      setState(data.state);
    } catch (e) {
      // se ignora un fallo puntual de red; el próximo poll lo reintenta
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, POLL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Head>
        <title>{state ? state.name : 'Campeonato UNO'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="wrap">
        {loading ? (
          <p className="empty-msg" style={{ color: '#fff' }}>
            Cargando…
          </p>
        ) : !state ? (
          <div className="panel setup-panel">
            <h2>
              <span className="bar"></span>Sin campeonato activo
            </h2>
            <p className="empty-msg">Todavía no hay un campeonato en marcha. Vuelve más tarde.</p>
          </div>
        ) : (
          <>
            <Header state={state} readOnly />
            {state.games.length >= state.totalGames && (
              <FinalBanner state={state} finalists={sortedActive(state).slice(0, 4)} />
            )}
            <Standings state={state} editable={false} />
            <GameHistory state={state} editable={false} />
            <p className="footer-note">
              Se actualiza automáticamente · El último lugar siempre 0 puntos, y sube según
              cuántos jugaron cada partida
            </p>
          </>
        )}
      </div>
    </>
  );
}
