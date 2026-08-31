import { useEffect, useRef, useState } from 'react';
import { sortedActive } from './Standings';

const MEDALS = ['🥇', '🥈', '🥉', '🏅'];
const HEIGHTS = [130, 95, 70, 48];
const BAR_CLASS = ['rank1', 'rank2', 'rank3', 'rank4'];

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
  const podiumRef = useRef(null);
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState('');
  const firedConfetti = useRef(false);

  useEffect(() => {
    if (firedConfetti.current || top.length === 0) return;
    firedConfetti.current = true;
    let cancelled = false;
    import('canvas-confetti').then(({ default: confetti }) => {
      if (cancelled) return;
      const colors = ['#ED1C24', '#FFCC00', '#0A8A3C', '#0B6EB5'];
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 }, colors });
      setTimeout(() => {
        if (!cancelled) confetti({ particleCount: 60, spread: 100, origin: { y: 0.6 }, colors });
      }, 250);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.finishedAt]);

  async function handleShare() {
    if (!podiumRef.current) return;
    setSharing(true);
    setShareError('');
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(podiumRef.current, { pixelRatio: 2, backgroundColor: '#12241A' });

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `podio-${state.name.replace(/\s+/g, '-')}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: state.name,
          text: `Resultados finales de ${state.name} 🏆`,
        });
      } else {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = file.name;
        link.click();
      }
    } catch (e) {
      if (e && e.name !== 'AbortError') {
        setShareError('No se pudo generar la imagen. Intenta de nuevo.');
      }
    } finally {
      setSharing(false);
    }
  }

  if (top.length === 0) return null;
  const columns = toPodiumOrder(top);

  return (
    <div
      className="final-banner"
      style={{ background: 'linear-gradient(135deg, #C99400, #ED1C24)' }}
      ref={podiumRef}
    >
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

      <button
        className="btn-ghost btn-sm"
        style={{ marginTop: 14, background: 'rgba(255,255,255,0.15)', color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}
        onClick={handleShare}
        disabled={sharing}
      >
        {sharing ? 'Generando imagen…' : '📤 Compartir podio'}
      </button>
      {shareError && <div className="error-msg" style={{ color: '#fff' }}>{shareError}</div>}
    </div>
  );
}
