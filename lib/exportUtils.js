import { sortedActive } from '../components/Standings';

function gameRows(state) {
  return [...state.games]
    .sort((a, b) => a.number - b.number)
    .map((g) => {
      const order = Array.isArray(g.order) ? g.order : [];
      const pointsAwarded = Array.isArray(g.pointsAwarded) ? g.pointsAwarded : [];
      const detalle = order
        .map((pid, idx) => {
          const player = state.players.find((p) => p.id === pid);
          return `${idx + 1}º ${player ? player.name : '(jugador eliminado)'} (${pointsAwarded[idx] ?? 0})`;
        })
        .join(' · ');
      return { numero: g.number, detalle };
    });
}

export async function exportToExcel(state) {
  const XLSX = await import('xlsx');
  const standings = sortedActive(state);

  const standingsData = standings.map((p, i) => ({
    Puesto: i + 1,
    Jugador: p.name,
    Puntos: p.points,
    'Partidas jugadas': p.gamesPlayed,
  }));

  const gamesData = gameRows(state).map((g) => ({
    'Partida #': g.numero,
    Resultado: g.detalle,
  }));

  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.json_to_sheet(standingsData);
  const ws2 = XLSX.utils.json_to_sheet(gamesData);
  XLSX.utils.book_append_sheet(wb, ws1, 'Tabla de posiciones');
  XLSX.utils.book_append_sheet(wb, ws2, 'Historial de partidas');

  XLSX.writeFile(wb, `${state.name.replace(/\s+/g, '-')}-resultados.xlsx`);
}

export async function exportToPdf(state) {
  const { jsPDF } = await import('jspdf');
  await import('jspdf-autotable');

  const doc = new jsPDF();
  const standings = sortedActive(state);

  doc.setFontSize(16);
  doc.text(state.name, 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    state.finished && state.finishedAt
      ? `Finalizado el ${new Date(state.finishedAt).toLocaleDateString('es-EC')}`
      : `Partidas jugadas: ${state.games.length} de ${state.totalGames}`,
    14,
    25
  );

  doc.autoTable({
    startY: 32,
    head: [['Puesto', 'Jugador', 'Puntos', 'Partidas jugadas']],
    body: standings.map((p, i) => [i + 1, p.name, p.points, p.gamesPlayed]),
    headStyles: { fillColor: [237, 28, 36] },
    styles: { fontSize: 10 },
  });

  const rows = gameRows(state);
  if (rows.length > 0) {
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Partida #', 'Resultado']],
      body: rows.map((g) => [g.numero, g.detalle]),
      headStyles: { fillColor: [11, 110, 181] },
      styles: { fontSize: 9 },
      columnStyles: { 1: { cellWidth: 150 } },
    });
  }

  doc.save(`${state.name.replace(/\s+/g, '-')}-resultados.pdf`);
}
