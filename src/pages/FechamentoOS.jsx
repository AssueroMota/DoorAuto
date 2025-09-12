import { useState } from "react";
import "./FechamentoOS.css";

function FechamentoOS() {
  const [osId, setOsId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!osId) {
      alert("⚠️ Informe o número da OS.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "https://script.google.com/macros/s/AKfycbwWEujv7p8kkcShDNV2c1cz4LIIQzu8E5CaZ2BfQ1RH596h2HhOtrCqdrBrk_fQkJu4/exec",
        {
          method: "POST",
          body: JSON.stringify({
            action: "close",
            osId: osId.trim(),
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert(`✅ OS ${osId} foi encerrada com sucesso!`);
        setOsId("");
      } else {
        alert(`❌ Não foi possível encerrar a OS: ${data.message}`);
      }
    } catch (err) {
      alert("🚨 Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fechamento-container">
      <div className="fechamento-card">
        <h1 className="fechamento-title">📌 Fechamento de OS</h1>
        <p className="fechamento-subtitle">
          Informe o número da OS e finalize o chamado.
        </p>

        <form onSubmit={handleSubmit} className="fechamento-form">
          <label htmlFor="osId">Número da OS:</label>
          <input
            type="text"
            id="osId"
            placeholder="Ex: OS-1006"
            value={osId}
            onChange={(e) => setOsId(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Finalizando..." : "Fechar OS"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default FechamentoOS;
