import "./Form.css";
import { Link } from "react-router-dom";
import { useState } from "react";

function Cliente() {
  const [formData, setFormData] = useState({
    solicitante: "",
    setor: "",
    porta: "",
    descricao: "",
    statusOS: "Aberta", // 🔹 sempre começa como "Aberta"
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.solicitante || !formData.setor || !formData.porta || !formData.descricao) {
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
      data: `${dataAtual} ${horaAtual}`,
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
          solicitante: "",
          setor: "",
          porta: "",
          descricao: "",
          statusOS: "Aberta",
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
            Nome do Solicitante
            <input
              type="text"
              name="solicitante"
              value={formData.solicitante}
              onChange={handleChange}
              required
            />
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
          <div style={{display:"flex",flexDirection:'Column',gap:'32px'}}>

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

          </div>
          <label>
            Descrição
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              required
            ></textarea>
          </label>

          {/* 🔹 Campo Status OS fixo como "Aberta" */}
          <input type="hidden" name="statusOS" value={formData.statusOS} readOnly />

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
                  solicitante: "",
                  setor: "",
                  porta: "",
                  descricao: "",
                  statusOS: "Aberta",
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
