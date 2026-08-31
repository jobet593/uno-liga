import { useState } from 'react';
import { exportToExcel, exportToPdf } from '../lib/exportUtils';

export default function ExportButtons({ state }) {
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  async function handle(kind) {
    setError('');
    setBusy(kind);
    try {
      if (kind === 'excel') await exportToExcel(state);
      else await exportToPdf(state);
    } catch (e) {
      setError('No se pudo generar el archivo. Intenta de nuevo.');
    } finally {
      setBusy('');
    }
  }

  return (
    <div>
      <div className="full-btn-row">
        <button className="btn-green btn-sm" onClick={() => handle('excel')} disabled={busy !== ''}>
          {busy === 'excel' ? 'Generando…' : '📊 Exportar a Excel'}
        </button>
        <button className="btn-blue btn-sm" onClick={() => handle('pdf')} disabled={busy !== ''}>
          {busy === 'pdf' ? 'Generando…' : '📄 Exportar a PDF'}
        </button>
      </div>
      {error && <div className="error-msg">{error}</div>}
    </div>
  );
}
