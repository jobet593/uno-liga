import { useState } from 'react';

export default function GameHistory({ state, editable, onDelete }) {
  const [filterId, setFilterId] = useState('all');

  const allGames = [...state.games].reverse();
  const games = filterId === 'all' ? allGames : allGames.filter((g) => {
    const order = Array.isArray(g.order) ? g.order : [];
    return order.includes(filterId);
  });

  const playersInOrder = [...state.players].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="panel">
      <h2>
        <span className="bar"></span>Historial de partidas
      </h2>

      {state.players.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <label htmlFor="game-filter" style={{ margin: '0 0 6px' }}>
            Filtrar por jugador
          </label>
          <select id="game-filter" value={filterId} onChange={(e) => setFilterId(e.target.value)}>
            <option value="all">Todos los jugadores</option>
            {playersInOrder.map((p) => (
              <option value={p.id} key={p.id}>
                {p.name}
                {p.hidden ? ' (oculto)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {games.length === 0 ? (
        <p className="empty-msg">
          {filterId === 'all' ? 'Aún no se registran partidas.' : 'Ese jugador no tiene partidas registradas.'}
        </p>
      ) : (
        games.map((g) => {
          // Compatibilidad con partidas guardadas por una versión anterior
          // de la app (formato { positions: {1:id,2:id,3:id,4:id} }).
          const order =
            Array.isArray(g.order) && g.order.length > 0
              ? g.order
              : g.positions
              ? [1, 2, 3, 4].map((pos) => g.positions[pos]).filter(Boolean)
              : [];
          const pointsAwarded = Array.isArray(g.pointsAwarded)
            ? g.pointsAwarded
            : order.map(() => null);

          const parts = order.map((playerId, index) => {
            const player = state.players.find((pl) => pl.id === playerId);
            const pos = index + 1;
            const pts = pointsAwarded[index];
            const isFiltered = filterId !== 'all' && playerId === filterId;
            return (
              <span key={`${g.id}-${playerId}`} style={isFiltered ? { fontWeight: 800 } : undefined}>
                <b>{pos}º</b> {player ? player.name : '(jugador eliminado)'}
                {pts !== null && pts !== undefined ? ` (${pts})` : ''}
                {pos < order.length ? ' · ' : ''}
              </span>
            );
          });

          return (
            <div className="game-row" key={g.id}>
              <div className="game-num">#{g.number}</div>
              <div className="game-positions">
                {parts.length > 0 ? parts : '(sin datos de esta partida)'}
              </div>
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
