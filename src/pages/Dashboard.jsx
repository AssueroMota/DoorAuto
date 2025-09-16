import { useEffect, useState } from "react";
import Papa from "papaparse";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";

import "./Dashboard.css";
import logo from "../assets/logo.png";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedRelato, setSelectedRelato] = useState(null);

  // Filtros
  const [filterPorta, setFilterPorta] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterTecnico, setFilterTecnico] = useState("");
  const [filterCliente, setFilterCliente] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  // Carregar dados
  useEffect(() => {
    fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vR5LGgZ5j-zZvZpXaXMfwX1781b-KukF0SlJlGN2SSGQHPyJeuxGWNuUzwgwsHQ3cuVEiv2XrltD-tR/pub?gid=0&single=true&output=csv")
      .then((res) => res.text())
      .then((csvText) => {
        const parsed = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          delimiter: ","
        });

        const mapped = parsed.data.map((r) => ({
          OS_ID: r["OS_ID"],
          Porta: r["Porta (ID)"],
          Servico: r["Serviço"],
          TecnicoAbertura: r["Técnico (Abertura)"],
          DataAbertura: r["Data Abertura"],
          DescricaoAbertura: r["Descrição Abertura"],
          StatusOS: r["Status OS"],
          Solicitante: r["Solicitante"],
          Setor: r["Setor"],
          DescricaoFinal: r["Descrição Técnica (Finalização)"],
          TecnicoResponsavel: r["Técnico Responsável (Finalização)"],
          DataFechamento: r["Data/Hora Fechamento"],
          TempoAberto: r["Tempo em Aberto (dias)"],
        }));

        setData(mapped);
        setFiltered(mapped);
      });
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let temp = [...data];
    if (filterPorta) temp = temp.filter((d) => d.Porta === filterPorta);
    if (filterStatus) temp = temp.filter((d) => d.StatusOS === filterStatus);
    if (filterTecnico) temp = temp.filter((d) => d.TecnicoResponsavel === filterTecnico);
    if (filterCliente) temp = temp.filter((d) => d.Solicitante === filterCliente);
    if (filterStartDate) temp = temp.filter((d) => new Date(d.DataAbertura) >= new Date(filterStartDate));
    if (filterEndDate) temp = temp.filter((d) => new Date(d.DataAbertura) <= new Date(filterEndDate));
    setFiltered(temp);
  }, [filterPorta, filterStatus, filterTecnico, filterCliente, filterStartDate, filterEndDate, data]);

  return (
    <div className="dashboard-wrapper">
      {/* Header */}
      <div className="dashboard-header">
        <div className="back-arrow" onClick={() => window.history.back()} />
        <div className="logo-container">
          <img src={logo} width={320} alt="Logo" />
        </div>
      </div>

      {/* Tabela de OS */}
      <div className="table-section">
        <h2>Ordens de Serviço</h2>
        <div className="table-scroll">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>OS</th>
                <th>Status</th>
                <th>Tempo em Aberto</th>
                <th>Tipo de Manutenção</th>
                <th>Solicitante</th>
                <th>Data de Abertura</th>
                <th>Descrição da Abertura</th>
                <th>Técnico Responsável</th>
                <th>Data de Fechamento</th>
                <th>Descrição Final</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={i}>
                  <td>{row.OS_ID}</td>
                  <td>
                    {row.StatusOS?.toLowerCase().includes("aberta") ? (
                      <span style={{ background: "#fee2e2", color: "#dc2626", padding: "2px 6px", borderRadius: "6px" }}>
                        Aberta
                      </span>
                    ) : row.StatusOS?.toLowerCase().includes("fechada") ? (
                      <span style={{ background: "#dcfce7", color: "#16a34a", padding: "2px 6px", borderRadius: "6px" }}>
                        Fechada
                      </span>
                    ) : row.StatusOS || "—"}
                  </td>
                  <td>{row.TempoAberto || "—"}</td>
                  <td>{row.Servico || "—"}</td>
                  <td>{row.Solicitante || "—"}</td>
                  <td>{row.DataAbertura || "—"}</td>

                  <td
                    style={{
                      maxWidth: "200px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      cursor: "pointer",
                      color: "#1e293b",       // cinza escuro
                      textDecoration: "underline" // 👈 força o sublinhado
                    }}
                    onClick={() => setSelectedRelato(row.DescricaoAbertura)}
                  >
                    {row.DescricaoAbertura || "—"}
                  </td>

                  <td>{row.TecnicoResponsavel || "—"}</td>
                  <td>{row.DataFechamento || "—"}</td>

                  <td
                    style={{
                      maxWidth: "200px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      cursor: "pointer",
                      color: "#1e293b",       // cinza escuro
                      textDecoration: "underline" // 👈 força o sublinhado
                    }}
                    onClick={() => setSelectedRelato(row.DescricaoFinal)}
                  >
                    {row.DescricaoFinal || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de descrições */}
      {selectedRelato && (
        <div className="modal-overlay" onClick={() => setSelectedRelato(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalhes</h3>
              <button className="modal-close" onClick={() => setSelectedRelato(null)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="white"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    borderRadius: "50%",
                    padding: "4px",
                    cursor: "pointer"
                  }}
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <p>{selectedRelato}</p>
            </div>
          </div>
        </div>
      )}




      {/* KPIs */}
      <div className="kpi-section">
        <div className="kpi-card blue">
          <h3>Total de O.S</h3>
          <p>{filtered.length}</p>
        </div>

        <div className="kpi-card green">
          <h3>Preventivas</h3>
          <p>{filtered.filter((d) => d.Servico?.toLowerCase().includes("preventiva")).length}</p>
        </div>

        <div className="kpi-card yellow">
          <h3>Corretivas</h3>
          <p>{filtered.filter((d) => d.Servico?.toLowerCase().includes("corretiva")).length}</p>
        </div>
      </div>

      {/* Gráfico Abertas x Fechadas */}
      <div className="chart-card">
        <h3>Status das Ordens de Serviço</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={[
                { name: "Abertas", value: filtered.filter(d => (d.StatusOS || "").toLowerCase().startsWith("abert")).length },
                { name: "Fechadas", value: filtered.filter(d => (d.StatusOS || "").toLowerCase().startsWith("fechad")).length }
              ]}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              <Cell fill="#dc2626" /> {/* vermelho - abertas */}
              <Cell fill="#16a34a" /> {/* verde - fechadas */}
            </Pie>

            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico Preventiva x Corretiva */}
      <div className="chart-card">
        <h3>Tipos de Manutenção</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            layout="vertical"
            data={[
              { name: "Preventiva", value: filtered.filter(d => d.Servico?.toLowerCase().includes("preventiva")).length },
              { name: "Corretiva", value: filtered.filter(d => d.Servico?.toLowerCase().includes("corretiva")).length }
            ]}
            margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" />
            <Tooltip />
            <Bar dataKey="value" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top 10 Portas */}
      <div className="chart-card">
        <h3>Top 10 Portas com mais O.S</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            layout="vertical"
            data={(() => {
              const grouped = {};
              filtered.forEach(d => {
                if (d.Porta) grouped[d.Porta] = (grouped[d.Porta] || 0) + 1;
              });
              return Object.entries(grouped)
                .map(([porta, total]) => ({ porta, total }))
                .sort((a, b) => b.total - a.total)
                .slice(0, 10);
            })()}
            margin={{ top: 20, right: 30, left: -30, bottom: 20 }} // 👈 aumentei o left
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="porta" type="category" />
            <Tooltip />
            <Bar dataKey="total" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>

      </div>
    </div>
  );
};

export default Dashboard;
