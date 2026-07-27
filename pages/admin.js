import { useEffect, useState } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import FinalBanner from '../components/FinalBanner';
import Standings, { sortedActive } from '../components/Standings';
import GameHistory from '../components/GameHistory';
import PointsChart from '../components/PointsChart';
import PlayerStatsModal from '../components/PlayerStatsModal';

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

// Copia en el cliente de la misma fórmula del servidor (lib/kv.js),
// solo para mostrar una vista previa de puntos mientras se arma el orden.
function computePointsForGame(n) {
  if (n <= 0) return [];
  const byPosition = new Array(n + 1).fill(0);
  byPosition[n] = 0;
  for (let pos = n - 1; pos >= 3; pos--) {
    byPosition[pos] = byPosition[pos + 1] + 1;
  }
  if (n >= 3) byPosition[2] = byPosition[3] + 1;
  if (n >= 2) byPosition[1] = byPosition[2] + 2;
  else if (n === 1) byPosition[1] = 0;
  return byPosition.slice(1);
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

  // modal registrar/editar partida
  const [showModal, setShowModal] = useState(false);
  const [editingGame, setEditingGame] = useState(null); // null = registrar nueva; objeto = editando
  const [order, setOrder] = useState([]);
  const [registerError, setRegisterError] = useState('');

  // estadísticas de jugador
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);

  // aviso de confirmación
  const [toast, setToast] = useState('');

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(''), 2500);
  }

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

  function openRegisterModal() {
    setEditingGame(null);
    setOrder([]);
    setRegisterError('');
    setShowModal(true);
  }

  function openEditModal(game) {
    setEditingGame(game);
    setOrder(Array.isArray(game.order) ? [...game.order] : []);
    setRegisterError('');
    setShowModal(true);
  }

  function addToOrder(id) {
    setOrder((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  function removeFromOrder(id) {
    setOrder((prev) => prev.filter((x) => x !== id));
  }

  function moveInOrder(index, direction) {
    setOrder((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleSaveGame() {
    setRegisterError('');
    if (order.length < 2) {
      setRegisterError('Agrega al menos 2 jugadores en orden de finalización.');
      return;
    }
    try {
      if (editingGame) {
        const newState = await postJSON('/api/admin/edit-game', { id: editingGame.id, order });
        setState(newState);
        showToast('✅ ¡Partida actualizada!');
      } else {
        const newState = await postJSON('/api/admin/register-game', { order });
        setState(newState);
        showToast('✅ ¡Partida guardada!');
      }
      setShowModal(false);
      setEditingGame(null);
      setOrder([]);
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
          <p className="footer-note">
            Puntos automáticos: el último lugar siempre 0, y sube según cuántos jugaron esa
            partida.
          </p>
        </div>
      </>
    );
  }

  const active = sortedActive(state);
  const finalStage = state.games.length >= state.totalGames;
  const availablePlayers = active.filter((p) => !order.includes(p.id));
  const previewPoints = computePointsForGame(order.length);

  return (
    <>
      <Head>
        <title>{state.name} · Admin</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="wrap">
        {toast && <div className="toast">{toast}</div>}
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
              disabled={showModal}
            />
            <button className="btn-green" onClick={handleAddPlayer} disabled={showModal}>
              Agregar
            </button>
          </div>
          <div className="error-msg">{playerError}</div>
          {showModal && (
            <p className="empty-msg" style={{ padding: 0, textAlign: 'left' }}>
              No se pueden agregar ni ocultar jugadores mientras registras una partida.
            </p>
          )}
        </div>

        <Standings
          state={state}
          editable={!showModal}
          onHide={handleHide}
          onUnhide={handleUnhide}
          onSelectPlayer={setSelectedPlayerId}
        />

        <PointsChart state={state} />

        <div className="panel">
          <h2>
            <span className="bar"></span>Partidas
          </h2>
          <div className="full-btn-row">
            <button className="btn-primary" onClick={openRegisterModal}>
              Registrar nueva partida
            </button>
            <button className="btn-ghost" onClick={handleNewTournament}>
              Nuevo campeonato
            </button>
          </div>
        </div>

        <GameHistory state={state} editable onDelete={handleDeleteGame} onEdit={openEditModal} />

        <p className="footer-note">
          Puntos automáticos: el último lugar siempre 0, y sube según cuántos jugaron esa
          partida.
        </p>
        <p className="admin-link-note">
          <a href="/">Ver la vista pública ↗</a>
        </p>
      </div>

      {selectedPlayerId && (
        <PlayerStatsModal
          state={state}
          playerId={selectedPlayerId}
          onClose={() => setSelectedPlayerId(null)}
        />
      )}

      {showModal && (
        <div className="overlay">
          <div className="modal">
            <h2>
              {editingGame ? `Editar partida #${editingGame.number}` : `Registrar partida #${state.games.length + 1}`}
            </h2>
            <p className="sub">
              Toca a los jugadores en el orden en que terminaron (1º primero, hasta el
              último). Los puntos se calculan solos según cuántos participaron.
            </p>

            {order.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                {order.map((id, index) => {
                  const player = state.players.find((p) => p.id === id);
                  return (
                    <div className="pos-row" key={id}>
                      <div
                        className={`pos-badge ${index === 0 ? 'p1' : index === 1 ? 'p2' : index === 2 ? 'p3' : index === 3 ? 'p4' : ''}`}
                        style={index > 3 ? { background: '#5A5A52' } : undefined}
                      >
                        {index + 1}º
                      </div>
                      <div style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>
                        {player ? player.name : '(jugador)'}
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 14, minWidth: 28, textAlign: 'right' }}>
                        {previewPoints[index]}
                      </div>
                      <button
                        className="btn-ghost btn-sm"
                        onClick={() => moveInOrder(index, -1)}
                        disabled={index === 0}
                        title="Subir"
                      >
                        ↑
                      </button>
                      <button
                        className="btn-ghost btn-sm"
                        onClick={() => moveInOrder(index, 1)}
                        disabled={index === order.length - 1}
                        title="Bajar"
                      >
                        ↓
                      </button>
                      <button
                        className="hide-btn"
                        onClick={() => removeFromOrder(id)}
                        title="Quitar"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {availablePlayers.length > 0 && (
              <>
                <label style={{ margin: '0 0 8px' }}>
                  Toca para agregar al orden (siguiente puesto: {order.length + 1}º)
                </label>
                <div className="full-btn-row">
                  {availablePlayers.map((p) => (
                    <button className="btn-blue btn-sm" key={p.id} onClick={() => addToOrder(p.id)}>
                      {p.name}
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="error-msg">{registerError}</div>
            <div className="modal-actions">
              <button
                className="btn-ghost"
                onClick={() => {
                  setShowModal(false);
                  setEditingGame(null);
                }}
              >
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleSaveGame}>
                {editingGame ? 'Guardar cambios' : 'Guardar partida'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
