import "./Form.css";
import { Link } from "react-router-dom";
import { useState } from "react";

function Tecnico() {
  const [formData, setFormData] = useState({
    tecnico: "",
    setor: "",
    descricao: "",
    porta: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.tecnico || !formData.setor || !formData.descricao || !formData.porta) {
      alert("⚠️ Preencha todos os campos antes de enviar!");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    // 🔹 Data + hora automática
    const now = new Date();
    const dataAtual = now.toLocaleDateString("pt-BR");
    const horaAtual = now.toLocaleTimeString("pt-BR");

    const payload = {
      action: "create",
      ...formData,
      data: `${dataAtual} ${horaAtual}`,
      statusOS: "Aberta", // toda OS criada começa como Aberta
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
        alert(`✅ Dados enviados! Seu ID é: ${data.osId}`);
        setFormData({
          tecnico: "",
          setor: "",
          descricao: "",
          porta: "",
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
          <Link to="/tecnico-home" className="back-arrow" aria-label="Voltar"></Link>
          <h1 className="form-title">Formulário do Técnico</h1>
        </div>
        <p className="form-subtitle">Preencha os dados do atendimento técnico</p>

        <form className="form" onSubmit={handleSubmit}>
          <label>
            Nome do Técnico
            <select
              name="tecnico"
              value={formData.tecnico}
              onChange={handleChange}
              required
            >
              <option value="">Selecione...</option>
              <option value="Victor Oliveira">Victor Oliveira</option>
            </select>
          </label>


          <label>
            Setor
            <input
              type="text"
              name="setor"
              value={formData.setor}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Porta (ID)
            <select
              name="porta"
              value={formData.porta}
              onChange={handleChange}
              required
            >
              <option value="">Selecione...</option>
              {Array.from({ length: 91 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </label>

          <label>
            Descrição
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              required
            ></textarea>
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
                  tecnico: "",
                  setor: "",
                  descricao: "",
                  porta: "",
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

export default Tecnico;
