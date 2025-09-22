import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import logo from "../assets/logo.png"; // ✅ importa sua logo

function Home() {
  const [showModal, setShowModal] = useState(true); // modal inicial
  const [showSenha, setShowSenha] = useState(false); // modal senha técnico
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  const handleCliente = () => {
    setShowModal(false);
    navigate("/cliente");
  };

  const handleTecnico = () => {
    if (localStorage.getItem("tecnicoAuth") === "true") {
      navigate("/tecnico-home");
    } else {
      setShowSenha(true);
    }
  };

  const handleLogin = () => {
    if (senha === "0819") {
      localStorage.setItem("tecnicoAuth", "true");
      setShowSenha(false);
      navigate("/tecnico-home");
    } else {
      alert("Senha incorreta!");
    }
  };

  return (
    <div className="home-container">
      {/* 🔹 Logo no topo */}
      <div className="logo-container">
        <img src={logo} alt="Logo da Empresa" className="logo-home" />
      </div>

      {/* <h1 className="home-title">
        Sistema de Gestão de Manutenção <br /> Portas Automáticas
      </h1> */}

      {/* Modal inicial */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Selecione sua área</h2>
            <div className="modal-options">
              <div className="card" onClick={handleCliente}>
                <span className="icon">👤</span>
                <h3>Cliente</h3>
                <p>Registrar uma solicitação de serviço</p>
              </div>
              <div className="card" onClick={handleTecnico}>
                <span className="icon">🛠️</span>
                <h3>Técnico</h3>
                <p>Acessar formulários e acompanhamento</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal senha técnico */}
      {showSenha && (
        <div className="modal-overlay">
          <div className="modal-content small">
            <h2>Área do Técnico 🔒</h2>
            <p>Digite a senha para continuar</p>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite a senha"
            />
            <div className="modal-actions">
              <button
                className="btn btn-gray"
                onClick={() => setShowSenha(false)}
              >
                Voltar
              </button>
              <button className="btn btn-blue" onClick={handleLogin}>
                Entrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
