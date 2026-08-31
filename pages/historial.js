import { useEffect, useState } from 'react';
import Head from 'next/head';
import Standings, { sortedActive } from '../components/Standings';
import GameHistory from '../components/GameHistory';
import ExportButtons from '../components/ExportButtons';

export default function HistorialPage() {
  const [archive, setArchive] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetch('/api/archive')
      .then((r) => r.json())
      .then((data) => {
        setArchive(data.archive || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <Head>
        <title>Historial de campeonatos</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="wrap">
        <div className="header">
          <div className="brand">
            <div className="logo-oval">
              <span>UNO</span>
            </div>
            <div>
              <h1>Historial de campeonatos</h1>
              <p>Campeonatos anteriores</p>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="empty-msg" style={{ color: '#fff' }}>
            Cargando…
          </p>
        ) : archive.length === 0 ? (
          <div className="panel">
            <p className="empty-msg">Todavía no hay campeonatos guardados en el historial.</p>
          </div>
        ) : (
          archive.map((t) => {
            const standings = sortedActive(t);
            const champion = standings[0];
            const isOpen = expandedId === t.id;
            return (
              <div className="panel" key={t.id}>
                <h2>
                  <span className="bar"></span>
                  {t.name}
                </h2>
                <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: '0 0 10px' }}>
                  {t.abandoned ? 'Terminado anticipadamente' : 'Campeonato completado'}
                  {t.finishedAt
                    ? ` · ${new Date(t.finishedAt).toLocaleDateString('es-EC', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}`
                    : ''}
                </p>
                {champion && (
                  <p style={{ fontWeight: 800, fontSize: 15, margin: '0 0 14px' }}>
                    🏆 Campeón: {champion.name} ({champion.points} pts)
                  </p>
                )}
                <button className="btn-ghost btn-sm" onClick={() => setExpandedId(isOpen ? null : t.id)}>
                  {isOpen ? 'Ocultar detalle' : 'Ver tabla y partidas'}
                </button>
                {isOpen && (
                  <div style={{ marginTop: 14 }}>
                    <Standings state={t} editable={false} />
                    <GameHistory state={t} editable={false} />
                    <ExportButtons state={t} />
                  </div>
                )}
              </div>
            );
          })
        )}

        <p className="admin-link-note">
          <a href="/">← Volver a la vista principal</a>
        </p>
      </div>
    </>
  );
}
