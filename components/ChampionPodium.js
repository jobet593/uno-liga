import { sortedActive } from './Standings';

const MEDALS = ['🥇', '🥈', '🥉', '🏅'];

export default function ChampionPodium({ state }) {
  const top = sortedActive(state).slice(0, 4);
  if (top.length === 0) return null;

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
      <div className="final-list">
        {top.map((p, i) => (
          <div className="final-chip" key={p.id}>
            {MEDALS[i]} {p.name} · {p.points} pts
          </div>
        ))}
      </div>
    </div>
  );
}
