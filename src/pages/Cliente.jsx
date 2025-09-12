import "./Form.css";
import { Link } from "react-router-dom";
import { useState } from "react";

function Cliente() {
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
    porta: "",
    problema: "",
    statusOS: "Aberta" // 🔹 sempre começa como "Aberta"
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (
      !formData.nome ||
      !formData.telefone ||
      !formData.email ||
      !formData.porta ||
      !formData.problema
    ) {
      alert("⚠️ Preencha todos os campos antes de enviar!");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    const now = new Date();
    const dataAtual = now.toLocaleDateString("pt-BR");
    const horaAtual = now.toLocaleTimeString("pt-BR");

    const payload = {
      action: "create",
      ...formData,
      data: `${dataAtual} ${horaAtual}`
    };

    try {
      const res = await fetch(
        "https://script.google.com/macros/s/AKfycbwWEujv7p8kkcShDNV2c1cz4LIIQzu8E5CaZ2BfQ1RH596h2HhOtrCqdrBrk_fQkJu4/exec",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert(`✅ Solicitação enviada! Seu ID é: ${data.osId}`);
        setFormData({
          nome: "",
          telefone: "",
          email: "",
          porta: "",
          problema: "",
          statusOS: "Aberta" // 🔹 reset continua como Aberta
        });
      } else {
        alert("⚠️ Houve um problema ao salvar.");
      }
    } catch (err) {
      alert("❌ Erro ao enviar: " + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-wrapper">
      <div className="form-card">
        <div className="form-header">
          <Link to="/" className="back-arrow" aria-label="Voltar"></Link>
          <h1 className="form-title">Formulário do Cliente</h1>
        </div>
        <p className="form-subtitle">Preencha os dados da solicitação</p>

        <form className="form" onSubmit={handleSubmit}>
          <label>
            Nome do Cliente
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Telefone
            <input
              type="text"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Porta (PR)
            <input
              type="text"
              name="porta"
              value={formData.porta}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Descrição do Problema
            <textarea
              name="problema"
              value={formData.problema}
              onChange={handleChange}
              required
            ></textarea>
          </label>

          {/* 🔹 Campo Status OS fixo como "Aberta" */}
          <label style={{display:'none'}}>
            Status OS
            <input
              type="text"
              name="statusOS"
              value={formData.statusOS}
              readOnly
            />
          </label>

          <div className="form-buttons">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Enviando..." : "Enviar"}
            </button>
            <button
              type="reset"
              className="btn-secondary"
              disabled={loading}
              onClick={() =>
                setFormData({
                  nome: "",
                  telefone: "",
                  email: "",
                  porta: "",
                  problema: "",
                  statusOS: "Aberta"
                })
              }
            >
              Limpar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Cliente;
