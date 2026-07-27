import { useState } from 'react';

export function sortedActive(state) {
  return [...state.players]
    .filter((p) => !p.hidden)
    .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
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
