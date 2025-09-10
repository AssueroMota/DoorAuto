import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home-container">
      <h1 className="home-title">
        Contrato de Manutenção Portas Automáticas 2025 / 2026
      </h1>
      <p className="home-subtitle">Selecione uma das opções abaixo para continuar</p>

      <div className="cards">
        <div className="card">
          <span className="icon">🛠️</span>
          <h2>Formulário Técnico</h2>
          <p>Registro de manutenções preventivas e corretivas</p>
          <Link to="/tecnico" className="btn btn-blue">Acessar</Link>
        </div>

        <div className="card">
          <span className="icon">👤</span>
          <h2>Formulário Cliente</h2>
          <p>Feedback e avaliação do serviço realizado</p>
          <Link to="/cliente" className="btn btn-green">Acessar</Link>
        </div>

        <div className="card">
          <span className="icon">📊</span>
          <h2>Dashboard de Monitoramento</h2>
          <p>Acompanhe relatórios e status das portas</p>
          <Link to="/dashboard" className="btn btn-purple">Acessar</Link>
        </div>
      </div>

      <footer className="footer">
        © 2025–2026 – Sistema de Manutenção de Portas Automáticas
      </footer>
    </div>
  );
}

export default Home;
