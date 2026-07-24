import { useEffect, useState } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import FinalBanner from '../components/FinalBanner';
import Standings, { sortedActive } from '../components/Standings';
import GameHistory from '../components/GameHistory';

const POLL_MS = 8000;

async function postJSON(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Ocurrió un error inesperado.');
  }
  return data.state;
}

export default function AdminPage() {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);

  // formulario de creación
  const [name, setName] = useState('');
  const [totalGames, setTotalGames] = useState(6);
  const [setupError, setSetupError] = useState('');

  // agregar jugador
  const [newPlayerName, setNewPlayerName] = useState('');
  const [playerError, setPlayerError] = useState('');

  // modal registrar partida
  const [showModal, setShowModal] = useState(false);
  const [positions, setPositions] = useState({ 1: '', 2: '', 3: '', 4: '' });
  const [registerError, setRegisterError] = useState('');

  async function fetchState() {
    try {
      const res = await fetch('/api/state');
      const data = await res.json();
      setState(data.state);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, POLL_MS);
    return () => clearInterval(interval);
  }, []);

  async function handleCreate() {
    setSetupError('');
    try {
      const newState = await postJSON('/api/admin/create', { name, totalGames });
      setState(newState);
    } catch (e) {
      setSetupError(e.message);
    }
  }

  async function handleAddPlayer() {
    setPlayerError('');
    try {
      const newState = await postJSON('/api/admin/add-player', { name: newPlayerName });
      setState(newState);
      setNewPlayerName('');
    } catch (e) {
      setPlayerError(e.message);
    }
  }

  async function handleHide(id) {
    const newState = await postJSON('/api/admin/toggle-player', { id, hidden: true });
    setState(newState);
  }

  async function handleUnhide(id) {
    const newState = await postJSON('/api/admin/toggle-player', { id, hidden: false });
    setState(newState);
  }

  async function handleDeleteGame(id) {
    if (!confirm('¿Eliminar esta partida? Se restarán los puntos que otorgó.')) return;
    const newState = await postJSON('/api/admin/delete-game', { id });
    setState(newState);
  }

  async function handleRegisterGame() {
    setRegisterError('');
    try {
      const newState = await postJSON('/api/admin/register-game', { positions });
      setState(newState);
      setShowModal(false);
      setPositions({ 1: '', 2: '', 3: '', 4: '' });
    } catch (e) {
      setRegisterError(e.message);
    }
  }

  async function handleNewTournament() {
    if (
      !confirm(
        '¿Seguro que quieres iniciar un nuevo campeonato? Esto reemplazará el actual (se perderán los datos actuales).'
      )
    )
      return;
    const newState = await postJSON('/api/admin/reset', {});
    setState(newState);
  }

  if (loading) {
    return (
      <div className="wrap">
        <p className="empty-msg" style={{ color: '#fff' }}>
          Cargando…
        </p>
      </div>
    );
  }

  if (!state) {
    return (
      <>
        <Head>
          <title>Nuevo campeonato · Admin</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div className="wrap">
          <div className="header">
            <div className="brand">
              <div className="logo-oval">
                <span>UNO</span>
              </div>
              <div>
                <h1>Campeonato UNO</h1>
                <p>Panel de administración</p>
              </div>
            </div>
          </div>
          <div className="panel setup-panel">
            <h2>
              <span className="bar"></span>Nuevo campeonato
            </h2>
            <label htmlFor="t-name">Nombre del campeonato</label>
            <input
              type="text"
              id="t-name"
              placeholder="Ej: Noche de UNO - Julio"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <label htmlFor="t-games">¿Cuántas partidas se jugarán antes de la gran final?</label>
            <input
              type="number"
              id="t-games"
              min="1"
              value={totalGames}
              onChange={(e) => setTotalGames(e.target.value)}
            />
            <div className="error-msg">{setupError}</div>
            <button className="btn-primary btn-block" onClick={handleCreate}>
              Crear campeonato
            </button>
          </div>
          <p className="footer-note">Puntos: 1º = 10, 2º = 7, 3º = 5, 4º = 3</p>
        </div>
      </>
    );
  }

  const active = sortedActive(state);
  const finalStage = state.games.length >= state.totalGames;

  return (
    <>
      <Head>
        <title>{state.name} · Admin</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="wrap">
        <Header state={state} readOnly={false} />

        {finalStage && <FinalBanner state={state} finalists={active.slice(0, 4)} />}

        <div className="panel">
          <h2>
            <span className="bar"></span>Jugadores
          </h2>
          <div className="add-player-row">
            <input
              type="text"
              placeholder="Nombre del jugador"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
            />
            <button className="btn-green" onClick={handleAddPlayer}>
              Agregar
            </button>
          </div>
          <div className="error-msg">{playerError}</div>
        </div>

        <Standings state={state} editable onHide={handleHide} onUnhide={handleUnhide} />

        <div className="panel">
          <h2>
            <span className="bar"></span>Partidas
          </h2>
          <div className="full-btn-row">
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              Registrar nueva partida
            </button>
            <button className="btn-ghost" onClick={handleNewTournament}>
              Nuevo campeonato
            </button>
          </div>
        </div>

        <GameHistory state={state} editable onDelete={handleDeleteGame} />

        <p className="footer-note">Puntos: 1º = 10, 2º = 7, 3º = 5, 4º = 3</p>
        <p className="admin-link-note">
          <a href="/">Ver la vista pública ↗</a>
        </p>
      </div>

      {showModal && (
        <div className="overlay">
          <div className="modal">
            <h2>Registrar partida #{state.games.length + 1}</h2>
            <p className="sub">
              Elige quién quedó en cada posición. Solo el 1º al 4º lugar suman puntos.
            </p>
            {[1, 2, 3, 4].map((pos) => (
              <div className="pos-row" key={pos}>
                <div className={`pos-badge p${pos}`}>{pos}º</div>
                <select
                  value={positions[pos]}
                  onChange={(e) => setPositions({ ...positions, [pos]: e.target.value })}
                >
                  <option value="">— Selecciona jugador —</option>
                  {active.map((p) => (
                    <option value={p.id} key={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            <div className="error-msg">{registerError}</div>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleRegisterGame}>
                Guardar partida
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
