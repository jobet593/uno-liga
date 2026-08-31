import { useState } from 'react';

export function sortedActive(state) {
  // Conteo de veces en 1º, 2º y 3º lugar de cada jugador, para el desempate.
  const podiumCounts = {};
  state.players.forEach((p) => {
    podiumCounts[p.id] = { first: 0, second: 0, third: 0 };
  });
  (state.games || []).forEach((g) => {
    if (!Array.isArray(g.order)) return;
    g.order.forEach((pid, idx) => {
      if (!podiumCounts[pid]) return;
      if (idx === 0) podiumCounts[pid].first++;
      else if (idx === 1) podiumCounts[pid].second++;
      else if (idx === 2) podiumCounts[pid].third++;
    });
  });

  return [...state.players]
    .filter((p) => !p.hidden)
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const ca = podiumCounts[a.id] || { first: 0, second: 0, third: 0 };
      const cb = podiumCounts[b.id] || { first: 0, second: 0, third: 0 };
      if (cb.first !== ca.first) return cb.first - ca.first;
      if (cb.second !== ca.second) return cb.second - ca.second;
      if (cb.third !== ca.third) return cb.third - ca.third;
      return a.name.localeCompare(b.name);
    });
}

export default function Standings({ state, editable, onHide, onUnhide, onSelectPlayer }) {
  const [showHidden, setShowHidden] = useState(false);
  const active = sortedActive(state);
  const hidden = state.players.filter((p) => p.hidden);
  const finalStage = state.games.length >= state.totalGames;

  return (
    <div className="panel">
      <h2>
        <span className="bar"></span>Tabla de posiciones
      </h2>
      {active.length === 0 ? (
        <p className="empty-msg">Todavía no hay jugadores activos.</p>
      ) : (
        active.map((p, i) => {
          const rankClass = i === 0 ? 'c1' : i === 1 ? 'c2' : i === 2 ? 'c3' : i === 3 ? 'c4' : 'cx';
          const isFinalist = finalStage && i < 4;
          return (
            <div className={`player-card ${rankClass}`} key={p.id}>
              <div className="rank-badge">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</div>
              <div
                className="player-info"
                onClick={() => onSelectPlayer && onSelectPlayer(p.id)}
                style={onSelectPlayer ? { cursor: 'pointer' } : undefined}
              >
                <div className="name">
                  {p.name}
                  {isFinalist && <span className="finalist-tag">FINALISTA</span>}
                </div>
                <div className="meta">
                  {p.gamesPlayed} partida{p.gamesPlayed === 1 ? '' : 's'} jugada
                  {p.gamesPlayed === 1 ? '' : 's'}
                </div>
              </div>
              <div className="points">{p.points}</div>
              {editable && (
                <button className="hide-btn" title="Ocultar jugador" onClick={() => onHide(p.id)}>
                  ✕
                </button>
              )}
            </div>
          );
        })
      )}

      {hidden.length > 0 && (
        <>
          <button className="hidden-toggle" onClick={() => setShowHidden((v) => !v)}>
            {showHidden ? '▾' : '▸'} Jugadores ocultos ({hidden.length})
          </button>
          {showHidden && (
            <div className="hidden-list">
              {hidden.map((p) => (
                <div className="hidden-row" key={p.id}>
                  <span
                    onClick={() => onSelectPlayer && onSelectPlayer(p.id)}
                    style={onSelectPlayer ? { cursor: 'pointer' } : undefined}
                  >
                    {p.name} · {p.points} pts
                  </span>
                  {editable && (
                    <button className="btn-blue btn-sm" onClick={() => onUnhide(p.id)}>
                      Reingresar
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
