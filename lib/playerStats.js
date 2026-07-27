// Calcula estadísticas de un jugador específico a partir de todas las
// partidas registradas en el estado del campeonato.
export function computePlayerStats(state, playerId) {
  const relevantGames = state.games
    .filter((g) => Array.isArray(g.order) && g.order.includes(playerId))
    .sort((a, b) => a.number - b.number);

  const positions = relevantGames.map((g) => g.order.indexOf(playerId) + 1);
  const pointsPerGame = relevantGames.map((g) => {
    const idx = g.order.indexOf(playerId);
    return Array.isArray(g.pointsAwarded) ? g.pointsAwarded[idx] || 0 : 0;
  });

  const gamesPlayed = relevantGames.length;
  const totalPoints = pointsPerGame.reduce((sum, p) => sum + p, 0);
  const avg = gamesPlayed > 0 ? totalPoints / gamesPlayed : 0;

  const firstCount = positions.filter((p) => p === 1).length;
  const secondCount = positions.filter((p) => p === 2).length;
  const thirdCount = positions.filter((p) => p === 3).length;
  const bestPosition = positions.length ? Math.min(...positions) : null;
  const worstPosition = positions.length ? Math.max(...positions) : null;

  // Racha actual: cuántas partidas seguidas (contando desde la más reciente
  // hacia atrás) terminó en 1er lugar.
  let streak = 0;
  for (let i = positions.length - 1; i >= 0; i--) {
    if (positions[i] === 1) streak++;
    else break;
  }

  return {
    gamesPlayed,
    totalPoints,
    avg,
    firstCount,
    secondCount,
    thirdCount,
    bestPosition,
    worstPosition,
    streak,
    positions,
    pointsPerGame,
    gameNumbers: relevantGames.map((g) => g.number),
  };
}
