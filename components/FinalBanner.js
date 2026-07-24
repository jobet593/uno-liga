export default function FinalBanner({ state, finalists }) {
  return (
    <div className="final-banner">
      <h2>🏁 ¡Llegó la gran final!</h2>
      <p>
        Se jugaron {state.games.length} de {state.totalGames} partidas planeadas. Estos son
        los 4 finalistas:
      </p>
      <div className="final-list">
        {finalists.length === 0 ? (
          <span className="final-chip">Sin jugadores suficientes aún</span>
        ) : (
          finalists.map((p) => (
            <div className="final-chip" key={p.id}>
              {p.name} · {p.points} pts
            </div>
          ))
        )}
      </div>
    </div>
  );
}
