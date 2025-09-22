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
import { db } from "../firebase";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  // 🔹 Carregar dados do Firestore
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

            // Strings formatadas
            DataAbertura: dataAbertura
              ? dataAbertura.toLocaleString("pt-BR")
              : "",
            DataAberturaISO: dataAbertura
              ? dataAbertura.toISOString().split("T")[0]
              : "",
            DataFechamento: dataFechamento
              ? dataFechamento.toLocaleString("pt-BR")
              : "",
            DataFechamentoISO: dataFechamento
              ? dataFechamento.toISOString().split("T")[0]
              : "",

            // Objetos Date (para cálculos)
            DataAberturaObj: dataAbertura || null,
            DataFechamentoObj: dataFechamento || null,

            // Outros
            DescricaoFinal: d.descricaoTecnica || "",
            TecnicoResponsavel: d.tecnicoResponsavel || "",
            fotos: d.fotos || [],
            fotosFinais: d.fotosFinal || [],
          };
        });

        // Ordenar pela numeração da OS
        const sorted = docs.sort((a, b) => {
          const numA = parseInt(String(a.OS_ID).replace("OS-", ""), 10) || 0;
          const numB = parseInt(String(b.OS_ID).replace("OS-", ""), 10) || 0;
          return numB - numA;
        });

        setData(sorted);
        setFiltered(sorted);
      } catch (err) {
        console.error("❌ Erro ao carregar Firestore:", err);
      }
    };

    fetchData();
  }, []);



  // Função para abrir modal
  const openModal = (title, content) => {
    setModalTitle(title);
    setModalContent(content || "—");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalContent("");
    setModalTitle("");
  };


  // 🔹 Gerar PDF no estilo do print
  const generatePDF = (row) => {
    const doc = new jsPDF("p", "mm", "a4");

    // 🔹 Calcular tempo total (em horas:minutos)
    let tempoTotal = "—";
    if (row.DataAberturaObj && row.DataFechamentoObj) {
      try {
        const diffMs = row.DataFechamentoObj - row.DataAberturaObj;
        const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutos = Math.floor((diffMs / (1000 * 60)) % 60);
        tempoTotal = `${diffHoras}h ${diffMinutos}min`;
      } catch (e) {
        console.error("Erro ao calcular tempo total:", e);
      }
    }

    // Logo
    doc.addImage(logo, "PNG", 14, 10, 50, 20);

    // Cabeçalho
    doc.setFontSize(16);
    doc.text("ORDEM DE SERVIÇO", 105, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Nº OS: ${row.OS_ID}`, 195, 15, { align: "right" });
    doc.text(`Status: ${row.StatusOS}`, 195, 20, { align: "right" });

    const headerBlue = {
      fillColor: [83, 104, 132],
      textColor: 255,
      halign: "center",
    };

    // Descrição da Solicitação
    autoTable(doc, {
      startY: 35,
      theme: "grid",
      head: [
        ["Nome do solicitante", "Tipo de manutenção", "Área", "Data/Hora"],
      ],
      body: [
        [
          row.Solicitante || "—",
          row.Servico || "—",
          row.Setor || "—",
          row.DataAbertura || "—",
        ],
      ],
      headStyles: headerBlue,
      bodyStyles: { halign: "center" },
    });

    // Equipamento
    autoTable(doc, {
      theme: "grid",
      head: [["Porta ID", "Descrição de Abertura", "Status"]],
      body: [[row.Porta || "—", row.DescricaoAbertura || "—", row.StatusOS || "—"]],
      headStyles: headerBlue,
      bodyStyles: { halign: "center" },
    });


    // Descrição do Técnico
    autoTable(doc, {
      theme: "grid",
      head: [["Descrição do Técnico"]],
      body: [[row.DescricaoFinal || "—"]],
      headStyles: headerBlue,
    });


    // Serviços
    autoTable(doc, {
      theme: "grid",
      head: [
        [
          "Nome do Técnico",
          "Data inicial",
          "Hora inicial",
          "Data final",
          "Hora final"

        ],
      ],
      body: [
        [
          row.TecnicoResponsavel || "—",
          row.DataAbertura ? row.DataAbertura.split(" ")[0] : "—",
          row.DataAbertura ? row.DataAbertura.split(" ")[1] : "—",
          row.DataFechamento ? row.DataFechamento.split(" ")[0] : "—",
          row.DataFechamento ? row.DataFechamento.split(" ")[1] : "—"
        ],
      ],
      headStyles: headerBlue,
      bodyStyles: { halign: "center" },
    });

    let y = doc.lastAutoTable.finalY + 10;

    // Fotos Abertura
    if (row.fotos?.length) {
      doc.text("Fotos da Abertura:", 14, y);
      y += 5;
      row.fotos.forEach((url, i) => {
        try {
          doc.addImage(url, "JPEG", 14 + i * 60, y, 50, 40);
        } catch (err) {
          console.error("Erro ao adicionar foto de abertura:", err);
        }
      });
      y += 50;
    }

    // Fotos Finalização
    if (row.fotosFinais?.length) {
      doc.text("Fotos da Finalização:", 14, y);
      y += 5;
      row.fotosFinais.forEach((url, i) => {
        try {
          doc.addImage(url, "JPEG", 14 + i * 60, y, 50, 40);
        } catch (err) {
          console.error("Erro ao adicionar foto final:", err);
        }
      });
      y += 50;
    }

    // Rodapé
    doc.setFontSize(8);
    doc.text(`Emitido em ${new Date().toLocaleString("pt-BR")}`, 14, 290);
    doc.text("Página 1 de 1", 200, 290, { align: "right" });

    doc.save(`${row.OS_ID}.pdf`);
  };

  // 🔹 Aplicar filtros
  useEffect(() => {
    let temp = [...data];
    if (filterPorta) temp = temp.filter((d) => d.Porta === filterPorta);
    if (filterStatus) temp = temp.filter((d) => d.StatusOS === filterStatus);
    if (filterServico) temp = temp.filter((d) => d.Servico === filterServico);

    if (filterStartDate)
      temp = temp.filter(
        (d) =>
          d.DataAberturaISO >= filterStartDate.toISOString().split("T")[0]
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
        <div className="back-arrow" onClick={() => window.history.back()} />
      <div className="dashboard-header">
        <div className="logo-container">
          <img src={logo} width={320} alt="Logo" />
        </div>
      </div>


      {modalOpen && (
        <div
          className="modal-overlay"
          onClick={closeModal} // Fecha ao clicar no fundo
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()} // Impede fechar se clicar dentro
          >
            <h3>{modalTitle}</h3>
            <p>{modalContent}</p>
            <button onClick={closeModal} className="btn-close">Fechar</button>
          </div>
        </div>
      )}


      {/* Filtros */}
      <div className="filters">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Todos os Status</option>
          <option value="Aberta">Aberta</option>
          <option value="Fechado">Fechado</option>
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

      {/* Tabela */}
      <div className="table-section">
        <h2>Ordens de Serviço</h2>
        <div className="table-scroll">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>OS</th>
                <th>Status</th>
                <th>Data de Abertura</th>
                <th>Porta (ID)</th>
                <th>Tipo</th>
                <th>Solicitante</th>
                <th>Setor</th>
                <th>Descrição Abertura</th>
                <th>Técnico Responsável</th>
                <th>Data de Fechamento</th>
                <th>Descrição do Técnico</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={i}>
                  <td
                    style={{ cursor: "pointer", textDecoration: "underline" }}
                    onClick={() => generatePDF(row)}
                  >
                    {row.OS_ID}
                  </td>
                  <td>{row.StatusOS}</td>
                  <td>{row.DataAbertura || "—"}</td>
                  <td>{row.Porta || "—"}</td>
                  <td>{row.Servico || "—"}</td>
                  <td>{row.Solicitante || "—"}</td>
                  <td>{row.Setor || "—"}</td>

                  {/* 🔹 Célula clicável (Descrição Abertura) */}
                  <td
                    style={{ cursor: "pointer", textDecoration: "underline"  }}
                    onClick={() => openModal("Descrição de Abertura", row.DescricaoAbertura)}
                  >
                    {row.DescricaoAbertura || "—"}
                  </td>

                  <td>{row.TecnicoResponsavel || "—"}</td>
                  <td>{row.DataFechamento || "—"}</td>

                  {/* 🔹 Célula clicável (Descrição Técnica) */}
                  <td
                    style={{ cursor: "pointer",  textDecoration: "underline" }}
                    onClick={() => openModal("Descrição Técnica", row.DescricaoFinal)}
                  >
                    {row.DescricaoFinal || "—"}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

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
