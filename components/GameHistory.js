export default function GameHistory({ state, editable, onDelete }) {
  const games = [...state.games].reverse();

  return (
    <div className="panel">
      <h2>
        <span className="bar"></span>Historial de partidas
      </h2>
      {games.length === 0 ? (
        <p className="empty-msg">Aún no se registran partidas.</p>
      ) : (
        games.map((g) => {
          const names = [1, 2, 3, 4].map((pos) => {
            const player = state.players.find((pl) => pl.id === g.positions[pos]);
            return (
              <span key={pos}>
                <b>{pos}º</b> {player ? player.name : '(jugador eliminado)'}
                {pos < 4 ? ' · ' : ''}
              </span>
            );
          });
          return (
            <div className="game-row" key={g.id}>
              <div className="game-num">#{g.number}</div>
              <div className="game-positions">{names}</div>
              {editable && (
                <button className="del-game" title="Eliminar partida" onClick={() => onDelete(g.id)}>
                  🗑
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
