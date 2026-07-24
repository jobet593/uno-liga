export default function Header({ state, readOnly }) {
  const played = Math.min(state.games.length, state.totalGames);
  const finalStage = state.games.length >= state.totalGames;

  return (
    <div className="header">
      <div className="brand">
        <div className="logo-oval">
          <span>UNO</span>
        </div>
        <div>
          <h1>{state.name}</h1>
          <p>
            Partida {played} de {state.totalGames}
            {finalStage ? ' · Fase de grupos completa' : ''}
          </p>
        </div>
      </div>
      {readOnly ? (
        <span className="readonly-tag">Solo lectura</span>
      ) : (
        <div className="dots">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      )}
    </div>
  );
}
