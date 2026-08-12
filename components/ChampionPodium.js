import { sortedActive } from './Standings';

const MEDALS = ['🥇', '🥈', '🥉', '🏅'];
// Alturas de cada escalón según el puesto (índice 0 = 1er lugar, etc).
const HEIGHTS = [130, 95, 70, 48];
const BAR_CLASS = ['rank1', 'rank2', 'rank3', 'rank4'];

// Reordena para el layout visual clásico de podio: 2º - 1º - 3º - 4º...
function toPodiumOrder(top) {
  if (top.length < 3) return top.map((p, i) => ({ player: p, rank: i }));
  const [first, second, third, ...rest] = top;
  return [
    { player: second, rank: 1 },
    { player: first, rank: 0 },
    { player: third, rank: 2 },
    ...rest.map((p, i) => ({ player: p, rank: i + 3 })),
  ].filter((c) => c.player);
}

export default function ChampionPodium({ state }) {
  const top = sortedActive(state).slice(0, 4);
  if (top.length === 0) return null;
  const columns = toPodiumOrder(top);

  return (
    <div className="final-banner" style={{ background: 'linear-gradient(135deg, #C99400, #ED1C24)' }}>
      <h2>🏆 ¡Campeonato finalizado!</h2>
      <p>
        {state.finishedAt
          ? `Terminó el ${new Date(state.finishedAt).toLocaleDateString('es-EC', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}. `
          : ''}
        Estos son los resultados finales:
      </p>

      <div className="podium">
        {columns.map(({ player, rank }) => (
          <div className="podium-col" key={player.id}>
            <div className="podium-medal">{MEDALS[rank] || '🎖️'}</div>
            <div className="podium-name">{player.name}</div>
            <div className="podium-pts">{player.points} pts</div>
            <div
              className={`podium-bar ${BAR_CLASS[rank] || 'rank4'}`}
              style={{ height: HEIGHTS[rank] ?? 45 }}
            >
              {rank + 1}º
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
