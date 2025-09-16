import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Papa from "papaparse";
import "./AcompanhamentoOS.css";

const SHEET_CSV =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vR5LGgZ5j-zZvZpXaXMfwX1781b-KukF0SlJlGN2SSGQHPyJeuxGWNuUzwgwsHQ3cuVEiv2XrltD-tR/pub?gid=0&single=true&output=csv";

const ENDPOINT =
  "https://script.google.com/macros/s/AKfycbwWEujv7p8kkcShDNV2c1cz4LIIQzu8E5CaZ2BfQ1RH596h2HhOtrCqdrBrk_fQkJu4/exec";

export default function AcompanhamentoOS() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // form
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    osId: "",
    status: "Aberto",
    descricaoTecnica: "",
    tecnicoResponsavel: "",
    servico: "", // 👈 novo campo
  });

  // carregar planilha
  useEffect(() => {
    fetch(SHEET_CSV)
      .then((r) => r.text())
      .then((csv) => {
        const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
        const data = parsed.data.map((r) => ({
          id: r["OS_ID"],
          porta: r["Porta (ID)"],
          servico: r["Serviço"],
          tecnicoAbertura: r["Técnico (Abertura)"],
          dataAbertura: r["Data Abertura"],
          descricaoAbertura: r["Descrição Abertura"],
          statusOS: r["Status OS"],
          solicitante: r["Solicitante"],
          setor: r["Setor"],
          descricaoFinal: r["Descrição Técnica (Finalização)"],
          tecnicoFinal: r["Técnico Responsável (Finalização)"],
          dataFechamento: r["Data/Hora Fechamento"],
          tempoAberto: r["Tempo em Aberto (dias)"],
        }));
        setRows(data);
      });
  }, []);

  // apenas OS em Aberta/Andamento no select
  const abertasOuAndamento = useMemo(
    () => rows.filter((r) => /aberta|andamento/i.test(r.statusOS ?? "")),
    [rows]
  );

  const handleSelectOS = (osId) => {
    setForm((p) => ({ ...p, osId }));
    const os = rows.find((r) => r.id === osId);
    setSelected(os || null);
    if (os) {
      setForm((p) => ({
        ...p,
        status: os.statusOS || "Aberto",
        servico: os.servico || "",
        descricaoTecnica: os.descricaoFinal || "",
        tecnicoResponsavel: os.tecnicoFinal || "",
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.osId) return alert("Escolha o número da O.S.");

    // se for fechar, exigir técnico e descrição
    if (form.status === "Fechado") {
      if (!form.tecnicoResponsavel)
        return alert("Informe o Técnico Responsável para fechar a O.S.");
      if (!form.descricaoTecnica.trim())
        return alert("Escreva a Descrição Técnica para fechar a O.S.");
    }

    setLoading(true);
    try {
      const payload = {
        action: "update",
        OS_ID: form.osId,
        StatusOS: form.status,
        Servico: form.servico, // 👈 envia para o script
        DescricaoTecnica: form.descricaoTecnica,
        TecnicoResponsavel: form.tecnicoResponsavel,
      };

      const res = await fetch(ENDPOINT, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        alert("✅ O.S atualizada com sucesso!");
        // recarregar planilha para refletir mudanças
        const txt = await fetch(SHEET_CSV).then((r) => r.text());
        const parsed = Papa.parse(txt, { header: true, skipEmptyLines: true });
        const dataReload = parsed.data.map((r) => ({
          id: r["OS_ID"],
          porta: r["Porta (ID)"],
          servico: r["Serviço"],
          tecnicoAbertura: r["Técnico (Abertura)"],
          dataAbertura: r["Data Abertura"],
          descricaoAbertura: r["Descrição Abertura"],
          statusOS: r["Status OS"],
          solicitante: r["Solicitante"],
          setor: r["Setor"],
          descricaoFinal: r["Descrição Técnica (Finalização)"],
          tecnicoFinal: r["Técnico Responsável (Finalização)"],
          dataFechamento: r["Data/Hora Fechamento"],
          tempoAberto: r["Tempo em Aberto (dias)"],
        }));
        setRows(dataReload);

        window.location.reload(); // 🔥 reseta a página inteira
      } else {
        alert("⚠️ Falha ao atualizar: " + (data.message || "erro"));
      }
    } catch (err) {
      alert("❌ Erro ao enviar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="os-wrapper">
      <div className="form-header" style={{alignItems:'flex-start'}}>
        <Link to="/tecnico-home" className="back-arrow" aria-label="Voltar"></Link>
        <h1>Acompanhamento de Ordens de Serviço</h1>

      </div>

      <form className="os-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>
            Número da O.S
            <select
              value={form.osId}
              onChange={(e) => handleSelectOS(e.target.value)}
              required
            >
              <option value="">Selecione...</option>
              {abertasOuAndamento.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id}
                </option>
              ))}
            </select>
          </label>

          <label>
            Status da O.S
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              required
            >
              <option value="Aberto">Aberto</option>
              <option value="Andamento">Andamento</option>
              <option value="Fechado">Fechado</option>
            </select>
          </label>
        </div>

        {/* campos somente leitura */}
        <div className="form-row">
          <label>
            Solicitante
            <input value={selected?.solicitante || ""} readOnly />
          </label>
          <label>
            Setor
            <input value={selected?.setor || ""} readOnly />
          </label>
        </div>

        <div className="form-row">
          <label>
            Data de Abertura
            <input value={selected?.dataAbertura || ""} readOnly />
          </label>
          <label>
            Porta (ID)
            <input value={selected?.porta || ""} readOnly />
          </label>
        </div>

        <label>
          Descrição da Abertura
          <textarea value={selected?.descricaoAbertura || ""} readOnly />
        </label>

        {/* campo editável */}
        <label>
          Tipo de Manutenção
          <select
            name="servico"
            value={form.servico}
            onChange={handleChange}
            required
          >
            <option value="">Selecione...</option>
            <option value="Preventiva">Preventiva</option>
            <option value="Corretiva">Corretiva</option>
          </select>
        </label>

        {/* campos editáveis */}
        <label>
          Descrição Técnica
          <textarea
            name="descricaoTecnica"
            value={form.descricaoTecnica}
            onChange={handleChange}
            placeholder="Detalhe o que foi feito, peças trocadas, testes, etc."
          />
        </label>

        <label>
          Técnico Responsável
          <select
            name="tecnicoResponsavel"
            value={form.tecnicoResponsavel}
            onChange={handleChange}
          >
            <option value="">Selecione...</option>
            <option value="Victor Oliveira">Victor Oliveira</option>
            {/* adicione outros técnicos aqui */}
          </select>
        </label>

        {/* informações finais (somente leitura) */}
        {selected?.dataFechamento && (
          <div className="form-row">
            <label>
              Data/Hora Fechamento
              <input value={selected.dataFechamento} readOnly />
            </label>
            <label>
              Tempo em Aberto (dias)
              <input value={selected.tempoAberto || ""} readOnly />
            </label>
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </div>
  );
}
