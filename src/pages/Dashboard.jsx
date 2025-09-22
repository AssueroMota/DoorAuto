import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

import DatePicker, { registerLocale } from "react-datepicker";
import ptBR from "date-fns/locale/pt-BR";
import "react-datepicker/dist/react-datepicker.css";

import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // 🔹 seu firebase.js
import "./Dashboard.css";
import logo from "../assets/logo.png";

registerLocale("pt-BR", ptBR);

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedRelato, setSelectedRelato] = useState(null);

  // Filtros
  const [filterPorta, setFilterPorta] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterServico, setFilterServico] = useState("");
  const [filterStartDate, setFilterStartDate] = useState(null);
  const [filterEndDate, setFilterEndDate] = useState(null);

  // Carregar dados do Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await getDocs(collection(db, "ordensDeServico"));
        const docs = snapshot.docs.map((doc) => {
          const d = doc.data();

          const dataAbertura = d.dataAbertura?.toDate
            ? d.dataAbertura.toDate()
            : null;

          const dataFechamento = d.dataFechamento?.toDate
            ? d.dataFechamento.toDate()
            : null;

          return {
            id: doc.id,
            OS_ID: d.numeroOS || doc.id,
            Porta: d.porta || "",
            Servico: d.servico || "",
            Solicitante: d.solicitante || "",
            Setor: d.setor || "",
            StatusOS: d.statusOS || "",
            DescricaoAbertura: d.descricao || "",
            TecnicoAbertura: d.tecnico || "",
            DataAbertura: dataAbertura
              ? dataAbertura.toLocaleString("pt-BR")
              : "",
            DataAberturaISO: dataAbertura
              ? dataAbertura.toISOString().split("T")[0]
              : "",
            DescricaoFinal: d.descricaoTecnica || "",
            TecnicoResponsavel: d.tecnicoResponsavel || "",
            DataFechamento: dataFechamento
              ? dataFechamento.toLocaleString("pt-BR")
              : "",
            DataFechamentoISO: dataFechamento
              ? dataFechamento.toISOString().split("T")[0]
              : "",
          };
        });

        // Ordenar pela OS_ID
        const sorted = docs.sort((a, b) => {
          const numA = parseInt(String(a.OS_ID).replace("OS-", ""), 10) || 0;
          const numB = parseInt(String(b.OS_ID).replace("OS-", ""), 10) || 0;
          return numB - numA;
        });

        setData(sorted);
        setFiltered(sorted);
      } catch (err) {
        console.error("❌ Erro ao carregar dados:", err);
      }
    };

    fetchData();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let temp = [...data];
    if (filterPorta) temp = temp.filter((d) => d.Porta === filterPorta);
    if (filterStatus) temp = temp.filter((d) => d.StatusOS === filterStatus);
    if (filterServico) temp = temp.filter((d) => d.Servico === filterServico);

    if (filterStartDate)
      temp = temp.filter(
        (d) => d.DataAberturaISO >= filterStartDate.toISOString().split("T")[0]
      );
    if (filterEndDate)
      temp = temp.filter(
        (d) => d.DataAberturaISO <= filterEndDate.toISOString().split("T")[0]
      );

    setFiltered(temp);
  }, [filterPorta, filterStatus, filterServico, filterStartDate, filterEndDate, data]);

  // Resetar filtros
  const resetFilters = () => {
    setFilterPorta("");
    setFilterStatus("");
    setFilterServico("");
    setFilterStartDate(null);
    setFilterEndDate(null);
    setFiltered(data);
  };

  const portasDisponiveis = [
    ...new Set(data.map((d) => d.Porta).filter(Boolean)),
  ];

  return (
    <div className="dashboard-wrapper">
      {/* Header */}
      <div className="dashboard-header">
        <div className="back-arrow" onClick={() => window.history.back()} />
        <div className="logo-container">
          <img src={logo} width={320} alt="Logo" />
        </div>
      </div>

      {/* 🔹 Filtros */}
      <div className="filters">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Todos os Status</option>
          <option value="Aberta">Aberta</option>
          <option value="Fechada">Fechada</option>
          <option value="Andamento">Andamento</option>
        </select>

        <select
          value={filterServico}
          onChange={(e) => setFilterServico(e.target.value)}
        >
          <option value="">Todos os Tipos</option>
          <option value="Preventiva">Preventiva</option>
          <option value="Corretiva">Corretiva</option>
        </select>

        <select
          value={filterPorta}
          onChange={(e) => setFilterPorta(e.target.value)}
        >
          <option value="">Todas as Portas</option>
          {portasDisponiveis.map((porta, idx) => (
            <option key={idx} value={porta}>
              {porta}
            </option>
          ))}
        </select>

        <div className="date-filter">
          <label>Data Inicial</label>
          <DatePicker
            selected={filterStartDate}
            onChange={(date) => setFilterStartDate(date)}
            dateFormat="dd/MM/yyyy"
            locale="pt-BR"
            placeholderText="dd/mm/aaaa"
          />

          <label>Data Final</label>
          <DatePicker
            selected={filterEndDate}
            onChange={(date) => setFilterEndDate(date)}
            dateFormat="dd/MM/yyyy"
            locale="pt-BR"
            placeholderText="dd/mm/aaaa"
          />
        </div>

        <button onClick={resetFilters} className="btn-reset">
          Resetar
        </button>
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
                <th>Solicitante</th>
                <th>Setor</th>
                <th>Data de Abertura</th>
                <th>Porta (ID)</th>
                <th>Tipo</th>
                <th>Tempo em Aberto</th>
                <th>Descrição da Abertura</th>
                <th>Técnico Responsável</th>
                <th>Data de Fechamento</th>
                <th>Descrição Técnica</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={i}>
                  <td>{row.OS_ID}</td>
                  <td>
                    {row.StatusOS?.toLowerCase().includes("aberta") ? (
                      <span
                        style={{
                          background: "#fee2e2",
                          color: "#dc2626",
                          padding: "2px 6px",
                          borderRadius: "6px",
                        }}
                      >
                        Aberta
                      </span>
                    ) : row.StatusOS?.toLowerCase().includes("fechada") ? (
                      <span
                        style={{
                          background: "#dcfce7",
                          color: "#16a34a",
                          padding: "2px 6px",
                          borderRadius: "6px",
                        }}
                      >
                        Fechada
                      </span>
                    ) : (
                      row.StatusOS || "—"
                    )}
                  </td>
                  <td>{row.Solicitante || "—"}</td>
                  <td>{row.Setor || "—"}</td>
                  <td>{row.DataAbertura || "—"}</td>
                  <td>{row.Porta || "—"}</td>
                  <td>{row.Servico || "—"}</td>
                  <td>{row.TempoAberto || "—"}</td>
                  <td
                    style={{
                      maxWidth: "200px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      cursor: "pointer",
                      color: "#1e293b",
                      textDecoration: "underline",
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
                      color: "#1e293b",
                      textDecoration: "underline",
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
              <button
                className="modal-close"
                onClick={() => setSelectedRelato(null)}
              >
                ✖
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
          <p>
            {
              filtered.filter((d) =>
                d.Servico?.toLowerCase().includes("preventiva")
              ).length
            }
          </p>
        </div>
        <div className="kpi-card yellow">
          <h3>Corretivas</h3>
          <p>
            {
              filtered.filter((d) =>
                d.Servico?.toLowerCase().includes("corretiva")
              ).length
            }
          </p>
        </div>
      </div>

      {/* Gráfico Abertas x Fechadas */}
      <div className="chart-card">
        <h3>Status das Ordens de Serviço</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={[
                {
                  name: "Abertas",
                  value: filtered.filter((d) =>
                    (d.StatusOS || "").toLowerCase().startsWith("abert")
                  ).length,
                },
                {
                  name: "Fechadas",
                  value: filtered.filter((d) =>
                    (d.StatusOS || "").toLowerCase().startsWith("fechad")
                  ).length,
                },
              ]}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              <Cell fill="#dc2626" />
              <Cell fill="#16a34a" />
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
              {
                name: "Preventiva",
                value: filtered.filter((d) =>
                  d.Servico?.toLowerCase().includes("preventiva")
                ).length,
              },
              {
                name: "Corretiva",
                value: filtered.filter((d) =>
                  d.Servico?.toLowerCase().includes("corretiva")
                ).length,
              },
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
              filtered.forEach((d) => {
                if (d.Porta) grouped[d.Porta] = (grouped[d.Porta] || 0) + 1;
              });
              return Object.entries(grouped)
                .map(([porta, total]) => ({ porta, total }))
                .sort((a, b) => b.total - a.total)
                .slice(0, 10);
            })()}
            margin={{ top: 20, right: 30, left: -30, bottom: 20 }}
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
