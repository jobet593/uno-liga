import { useEffect, useState } from 'react';

export default function QrModal({ onClose }) {
  const [dataUrl, setDataUrl] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const publicUrl = typeof window !== 'undefined' ? window.location.origin + '/' : '';
    setUrl(publicUrl);
    import('qrcode')
      .then((QRCode) => QRCode.toDataURL(publicUrl, { width: 320, margin: 1 }))
      .then(setDataUrl)
      .catch(() => setError('No se pudo generar el código QR.'));
  }, []);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
        <h2>Escanea para ver la tabla</h2>
        <p className="sub">Comparte este código con los jugadores</p>
        {error ? (
          <p className="empty-msg">{error}</p>
        ) : dataUrl ? (
          <img src={dataUrl} alt="Código QR de la vista pública" style={{ width: '100%', maxWidth: 260, margin: '0 auto', borderRadius: 12, border: '2px solid var(--ink)' }} />
        ) : (
          <p className="empty-msg">Generando…</p>
        )}
        <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', wordBreak: 'break-all', margin: '14px 0' }}>{url}</p>
        <button className="btn-ghost btn-block" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
