import { Component } from 'react';
import '../styles/globals.css';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Error capturado por el ErrorBoundary:', error, info);
  }

  async handleReset() {
    try {
      await fetch('/api/admin/reset', { method: 'POST' });
    } catch (e) {
      // si falla el reset igual recargamos, no hay mucho más que hacer aquí
    }
    window.location.href = '/admin';
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="wrap">
          <div className="panel setup-panel">
            <h2>
              <span className="bar"></span>Algo salió mal
            </h2>
            <p className="empty-msg" style={{ textAlign: 'left' }}>
              Ocurrió un error inesperado al cargar los datos del campeonato. Puedes intentar
              recargar la página, o si el problema sigue, reiniciar el campeonato (esto borra
              los datos guardados y empieza uno nuevo).
            </p>
            <div className="full-btn-row" style={{ marginTop: 12 }}>
              <button className="btn-blue" onClick={() => window.location.reload()}>
                Recargar página
              </button>
              <button className="btn-primary" onClick={() => this.handleReset()}>
                Reiniciar campeonato
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}
