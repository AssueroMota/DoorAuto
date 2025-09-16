import { Link, useNavigate } from "react-router-dom";
import "./Home.css";

function TecnicoHome() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("tecnicoAuth");
    navigate("/");
  };

  return (
    <div className="home-container">
      <h1 className="home-title">Área Técnica</h1>
      <p className="home-subtitle">Escolha abaixo</p>

      <div className="cards">
        <div className="card">
          <span className="icon">📝</span>
          <h2>Formulário Técnico</h2>
          <p>Registrar manutenções preventivas/corretivas</p>
          <Link to="/tecnico" className="btn btn-blue">Acessar</Link>
        </div>

        <div className="card">
          <span className="icon">✅</span>
          <h2>Acompanhamento</h2>
          <p>Atualizar e encerrar ordens de serviço</p>
          <Link to="/fechamento" className="btn btn-green">Acessar</Link>
        </div>

        <div className="card">
          <span className="icon">📊</span>
          <h2>Dashboard</h2>
          <p>Visualizar métricas e relatórios</p>
          <Link to="/dashboard" className="btn btn-purple">Acessar</Link>
        </div>
      </div>

      <footer className="footer">
        <button className="btn btn-red" onClick={handleLogout}>Sair</button>
      </footer>
    </div>
  );
}

export default TecnicoHome;
