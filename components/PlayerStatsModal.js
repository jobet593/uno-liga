import { computePlayerStats } from '../lib/playerStats';

function StatRow({ label, value }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '9px 0',
        borderBottom: '1px solid var(--line)',
        fontSize: 14,
      }}
    >
      <span style={{ color: 'var(--ink-soft)' }}>{label}</span>
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
  );
}

export default function PlayerStatsModal({ state, playerId, onClose }) {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return null;
  const stats = computePlayerStats(state, playerId);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{player.name}</h2>
        <p className="sub">Estadísticas del campeonato</p>

        {stats.gamesPlayed === 0 ? (
          <p className="empty-msg">Todavía no ha jugado ninguna partida.</p>
        ) : (
          <div>
            <StatRow label="Puntos totales" value={player.points} />
            <StatRow
              label="Partidas jugadas"
              value={`${stats.gamesPlayed} de ${state.games.length}`}
            />
            <StatRow label="Promedio por partida" value={stats.avg.toFixed(1)} />
            <StatRow label="Veces en 1º lugar" value={`🥇 ${stats.firstCount}`} />
            <StatRow label="Veces en 2º lugar" value={`🥈 ${stats.secondCount}`} />
            <StatRow label="Veces en 3º lugar" value={`🥉 ${stats.thirdCount}`} />
            <StatRow label="Mejor puesto" value={stats.bestPosition ? `${stats.bestPosition}º` : '—'} />
            <StatRow label="Peor puesto" value={stats.worstPosition ? `${stats.worstPosition}º` : '—'} />
            <StatRow
              label="Racha actual"
              value={stats.streak > 0 ? `🔥 ${stats.streak} victoria${stats.streak === 1 ? '' : 's'} seguidas` : 'Sin racha activa'}
            />
          </div>
        )}

        <button className="btn-ghost btn-block" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
