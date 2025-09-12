import "./Form.css";
import { Link } from "react-router-dom";
import { useState } from "react";

function Tecnico() {
  const [formData, setFormData] = useState({
    porta: "",
    status: "",
    servico: "",
    tecnico: "",
    ciclos: "",
    custo: "",
    relato: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (
      !formData.porta ||
      !formData.status ||
      !formData.servico ||
      !formData.tecnico ||
      !formData.ciclos ||
      !formData.custo ||
      !formData.relato
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

    // 🔹 gera automaticamente data + hora
    const now = new Date();
    const dataAtual = now.toLocaleDateString("pt-BR");
    const horaAtual = now.toLocaleTimeString("pt-BR");

    const payload = {
      action: "create",
      ...formData,
      data: `${dataAtual} ${horaAtual}`,
      statusOS: "Aberta"   // 🔹 sempre que criar, vem como Aberta
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
          porta: "",
          status: "",
          servico: "",
          tecnico: "",
          ciclos: "",
          custo: "",
          relato: ""
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
          <h1 className="form-title">Formulário para Técnico</h1>
        </div>
        <p className="form-subtitle">Preencha os dados do atendimento técnico</p>

        <form className="form" onSubmit={handleSubmit}>
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

          <fieldset>
            <legend>Status da Porta</legend>
            <label>
              <input
                type="radio"
                name="status"
                value="Ótimo"
                checked={formData.status === "Ótimo"}
                onChange={handleChange}
              />
              Ótimo
            </label>
            <label>
              <input
                type="radio"
                name="status"
                value="Manutenção"
                checked={formData.status === "Manutenção"}
                onChange={handleChange}
              />
              Manutenção
            </label>
            <label>
              <input
                type="radio"
                name="status"
                value="Parada"
                checked={formData.status === "Parada"}
                onChange={handleChange}
              />
              Parada
            </label>
          </fieldset>

          <fieldset>
            <legend>Serviço</legend>
            <label>
              <input
                type="radio"
                name="servico"
                value="Preventiva"
                checked={formData.servico === "Preventiva"}
                onChange={handleChange}
              />
              Preventiva
            </label>
            <label>
              <input
                type="radio"
                name="servico"
                value="Corretiva"
                checked={formData.servico === "Corretiva"}
                onChange={handleChange}
              />
              Corretiva
            </label>
          </fieldset>

          <label>
            Técnico Responsável
            <input
              type="text"
              name="tecnico"
              value={formData.tecnico}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Número de Ciclos
            <input
              type="number"
              name="ciclos"
              value={formData.ciclos}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Custo (R$)
            <input
              type="number"
              name="custo"
              value={formData.custo}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Relato do Serviço
            <textarea
              name="relato"
              value={formData.relato}
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
                  porta: "",
                  status: "",
                  servico: "",
                  tecnico: "",
                  ciclos: "",
                  custo: "",
                  relato: ""
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
