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
          const parts = g.order.map((playerId, index) => {
            const player = state.players.find((pl) => pl.id === playerId);
            const pos = index + 1;
            return (
              <span key={playerId}>
                <b>{pos}º</b> {player ? player.name : '(jugador eliminado)'} (
                {g.pointsAwarded[index]})
                {pos < g.order.length ? ' · ' : ''}
              </span>
            );
          });
          return (
            <div className="game-row" key={g.id}>
              <div className="game-num">#{g.number}</div>
              <div className="game-positions">{parts}</div>
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
