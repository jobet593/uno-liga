import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = [
  '#ED1C24',
  '#0B6EB5',
  '#0A8A3C',
  '#C99400',
  '#8b5cf6',
  '#f97316',
  '#14b8a6',
  '#ec4899',
  '#64748b',
  '#84cc16',
];

export default function PointsChart({ state }) {
  const activePlayers = state.players.filter((p) => !p.hidden);
  const sortedGames = [...state.games]
    .filter((g) => Array.isArray(g.order) && g.order.length > 0)
    .sort((a, b) => a.number - b.number);

  if (sortedGames.length === 0 || activePlayers.length === 0) {
    return (
      <div className="panel">
        <h2>
          <span className="bar"></span>Evolución de puntos
        </h2>
        <p className="empty-msg">Aún no hay suficientes partidas para mostrar la evolución.</p>
      </div>
    );
  }

  const running = {};
  activePlayers.forEach((p) => {
    running[p.id] = 0;
  });

  const data = [
    { game: 0, ...Object.fromEntries(activePlayers.map((p) => [p.name, 0])) },
  ];

  sortedGames.forEach((g) => {
    g.order.forEach((pid, idx) => {
      if (running[pid] !== undefined) {
        running[pid] += g.pointsAwarded?.[idx] || 0;
      }
    });
    data.push({
      game: g.number,
      ...Object.fromEntries(activePlayers.map((p) => [p.name, running[p.id] ?? 0])),
    });
  });

  return (
    <div className="panel">
      <h2>
        <span className="bar"></span>Evolución de puntos
      </h2>
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e0d0" />
            <XAxis
              dataKey="game"
              tick={{ fontSize: 11 }}
              label={{ value: 'Partida', position: 'insideBottom', offset: -3, fontSize: 11 }}
            />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {activePlayers.map((p, i) => (
              <Line
                key={p.id}
                type="monotone"
                dataKey={p.name}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
