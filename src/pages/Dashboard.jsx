import { useEffect, useState } from "react";
import Papa from "papaparse";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer
} from "recharts";

import "./Dashboard.css";
import logo from "../assets/logo.png";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);

  // 🔹 Filtros
  const [filterPorta, setFilterPorta] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterTecnico, setFilterTecnico] = useState("");
  const [filterCliente, setFilterCliente] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  // 🔹 Carregar dados da planilha usando PapaParse
  useEffect(() => {
    fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vR5LGgZ5j-zZvZpXaXMfwX1781b-KukF0SlJlGN2SSGQHPyJeuxGWNuUzwgwsHQ3cuVEiv2XrltD-tR/pub?gid=0&single=true&output=csv")
      .then((res) => res.text())
      .then((csvText) => {
        const parsed = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          delimiter: ","
        });

        // 🔹 Mapear dados corrigindo tipos
        const mapped = parsed.data.map((r) => ({
          OS_ID: r.OS_ID,
          Porta: r.Porta,
          Status: r.Status,
          Servico: r.Serviço,
          Tecnico: r.Técnico,
          Data: r.Data,
          Ciclos: Number(r.Ciclos || 0),
          Custo: Number(r.Custo?.replace(".", "").replace(",", ".") || 0),
          Relato: r.Relato,
          StatusOS: r.StatusOS?.trim(),
          NomeCliente: r["Nome do Cliente"],
          Telefone: r.Telefone,
          Email: r.Email
        }));

        setData(mapped);
        setFiltered(mapped);
      });
  }, []);

  // 🔹 Aplicar filtros
  useEffect(() => {
    let temp = [...data];
    if (filterPorta) temp = temp.filter((d) => d.Porta === filterPorta);
    if (filterStatus) temp = temp.filter((d) => d.Status === filterStatus);
    if (filterTecnico) temp = temp.filter((d) => d.Tecnico === filterTecnico);
    if (filterCliente) temp = temp.filter((d) => d.NomeCliente === filterCliente);
    if (filterStartDate) temp = temp.filter((d) => new Date(d.Data) >= new Date(filterStartDate));
    if (filterEndDate) temp = temp.filter((d) => new Date(d.Data) <= new Date(filterEndDate));
    setFiltered(temp);
  }, [filterPorta, filterStatus, filterTecnico, filterCliente, filterStartDate, filterEndDate, data]);

  // 🔹 KPIs
  const totalOS = filtered.length;
  const otimo = filtered.filter((d) => d.Status?.toLowerCase().includes("ótimo")).length;
  const manutencao = filtered.filter((d) => d.Status?.toLowerCase().includes("manuten")).length;
  const paradas = filtered.filter((d) => d.Status?.toLowerCase().includes("parada")).length;
  const custoTotal = filtered.reduce((acc, d) => acc + d.Custo, 0);

  const percent = (part) => totalOS > 0 ? ((part / totalOS) * 100).toFixed(1) : 0;

  // 🔹 Dados para gráficos
  const statusData = [
    { name: "Ótimo", value: otimo },
    { name: "Manutenção", value: manutencao },
    { name: "Parada", value: paradas },
  ];

  const custoData = [...filtered].sort((a, b) => b.Custo - a.Custo).map((r) => ({
    Porta: r.Porta,
    Custo: r.Custo
  }));

  const ciclosData = [...filtered].map((r) => ({
    Porta: r.Porta,
    Ciclos: r.Ciclos
  }));

  const tecnicoData = Object.values(
    filtered.reduce((acc, r) => {
      if (!acc[r.Tecnico]) acc[r.Tecnico] = { Tecnico: r.Tecnico, OS: 0, Custo: 0 };
      acc[r.Tecnico].OS += 1;
      acc[r.Tecnico].Custo += r.Custo;
      return acc;
    }, {})
  );

  const clienteData = Object.values(
    filtered.reduce((acc, r) => {
      if (!acc[r.NomeCliente]) acc[r.NomeCliente] = { Cliente: r.NomeCliente, OS: 0 };
      acc[r.NomeCliente].OS += 1;
      return acc;
    }, {})
  );

  const timelineData = Object.values(
    filtered.reduce((acc, r) => {
      const dia = r.Data?.split(" ")[0] || "";
      if (!acc[dia]) acc[dia] = { Data: dia, Abertas: 0, Fechadas: 0 };
      if (r.StatusOS?.toLowerCase().includes("aberta")) acc[dia].Abertas++;
      if (r.StatusOS?.toLowerCase().includes("fechada")) acc[dia].Fechadas++;
      return acc;
    }, {})
  );

  const COLORS = ["#22c55e", "#facc15", "#ef4444", "#1e3a8a", "#9333ea"];


  // 🔹 Agrupar serviços por dia e tipo
  const servicosData = Object.values(
    filtered.reduce((acc, row) => {
      const dia = row.Data?.split(" ")[0]; // pega só a data (sem hora)

      if (!acc[dia]) acc[dia] = { Data: dia, Corretiva: 0, Preventiva: 0 };

      if (row.Servico?.toLowerCase().includes("corretiva")) {
        acc[dia].Corretiva += 1;
      }
      if (row.Servico?.toLowerCase().includes("preventiva")) {
        acc[dia].Preventiva += 1;
      }

      return acc;
    }, {})
  );




  // 🔹 Contar motivos de manutenção corretiva
  const motivosData = Object.values(
    filtered.reduce((acc, row) => {
      if (row.Servico?.toLowerCase().includes("corretiva") && row.Relato) {
        const motivo = row.Relato.trim();
        if (!acc[motivo]) acc[motivo] = { Motivo: motivo, Total: 0 };
        acc[motivo].Total += 1;
      }
      return acc;
    }, {})
  );

  // 🔹 Agrupar serviços por técnico responsável
  const responsavelData = Object.values(
    filtered.reduce((acc, row) => {
      if (!row.Tecnico) return acc;

      if (!acc[row.Tecnico]) {
        acc[row.Tecnico] = { name: row.Tecnico, value: 0 };
      }
      acc[row.Tecnico].value += 1;

      return acc;
    }, {})
  );



  return (
    <div className="dashboard-wrapper">
      {/* 🔹 Header com logo e voltar */}
      <div className="dashboard-header">
        <div className="back-arrow" onClick={() => window.history.back()} />
        <div className="logo-container">
          <img src={logo} width={320} alt="Logo" />
        </div>
      </div>

      {/* 🔹 Filtros */}
      <div className="filters">
        <select value={filterPorta} onChange={(e) => setFilterPorta(e.target.value)}>
          <option value="">Porta</option>
          {Array.from(new Set(data.map((d) => d.Porta))).map((p, i) => (
            <option key={i}>{p}</option>
          ))}
        </select>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Status</option>
          <option value="Ótimo">Ótimo</option>
          <option value="Manutenção">Manutenção</option>
          <option value="Parada">Parada</option>
        </select>

        <select value={filterTecnico} onChange={(e) => setFilterTecnico(e.target.value)}>
          <option value="">Técnico</option>
          {Array.from(new Set(data.map((d) => d.Tecnico))).map((p, i) => (
            <option key={i}>{p}</option>
          ))}
        </select>

        <select value={filterCliente} onChange={(e) => setFilterCliente(e.target.value)}>
          <option value="">Cliente</option>
          {Array.from(new Set(data.map((d) => d.NomeCliente))).map((p, i) => (
            <option key={i}>{p}</option>
          ))}
        </select>

        <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} />
        <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} />

        <button onClick={() => {
          setFilterPorta("");
          setFilterStatus("");
          setFilterTecnico("");
          setFilterCliente("");
          setFilterStartDate("");
          setFilterEndDate("");
        }}>Limpar</button>
      </div>

      {/* 🔹 KPIs */}
      <div className="kpi-section">
        <div className="kpi-card"><h3>Total OS</h3><p>{totalOS}</p></div>
        <div className="kpi-card green"><h3>Ótimo</h3><p>{percent(otimo)}%</p></div>
        <div className="kpi-card yellow"><h3>Manutenção</h3><p>{percent(manutencao)}%</p></div>
        <div className="kpi-card red"><h3>Paradas</h3><p>{percent(paradas)}%</p></div>
        <div className="kpi-card purple"><h3>Custo Total</h3><p>R$ {custoTotal.toLocaleString()}</p></div>
      </div>

      <div className="my_Grafics">

        {/* 🔹 Gráficos */}
        <div className="chart-container wide">
          <h3>Custos de Manutenção por Porta</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={custoData}
              layout="vertical"
              margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="Porta" width={70} />
              <Tooltip />
              <Bar dataKey="Custo" fill="#9333ea" barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* 🔹 Gráficos 2 */}
        <div className="chart-container wide">
          <h3>Status Geral das Portas</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={[
                { name: "Ótimo", value: otimo, color: "#22c55e" },
                { name: "Manutenção", value: manutencao, color: "#facc15" },
                { name: "Parada", value: paradas, color: "#ef4444" },
              ]}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" />
              <Tooltip />
              <Bar dataKey="value" barSize={30} label={{ position: "right", fill: "#fff" }}>
                <Cell fill="#22c55e" /> {/* Ótimo */}
                <Cell fill="#facc15" /> {/* Manutenção */}
                <Cell fill="#ef4444" /> {/* Parada */}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* grafico 3 */}

        <div className="chart-container wide">
          <h3>Serviços por dia</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={servicosData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Data" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Corretiva" stackId="a" fill="#22c55e" />
              <Bar dataKey="Preventiva" stackId="a" fill="#6b7280" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* grafico 4 */}

        <div className="chart-container wide">
          <h3>Motivo para Corretiva</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={motivosData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="Motivo" />
              <Tooltip />
              <Bar dataKey="Total" barSize={25} fill="#9333ea" label={{ position: "right", fill: "#fff" }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* grafico 5 */}

        <div className="chart-container">
          <h3>Responsável pelas Manutenções</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={responsavelData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
              >
                {responsavelData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={["#22c55e", "#facc15", "#ef4444", "#3b82f6", "#9333ea"][index % 5]} // cores diferentes
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>




      </div>
      {/* 🔹 Tabela de OS */}
      <div className="table-section">
        <h2>Ordens de Serviço</h2>
        <div className="table-scroll">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>OS</th>
                <th>Serviço</th>
                <th>Status</th>
                <th>Aberta/Fechada</th>
                <th>Técnico / Cliente</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={i}>
                  <td>{row.OS_ID}</td>
                  <td>{row.Servico}</td>
                  <td>{row.Status}</td>
                  <td>
                    {row.StatusOS?.toLowerCase().includes("aberta") ? (
                      <span style={{ background: "#fee2e2", color: "#dc2626", padding: "2px 6px", borderRadius: "6px" }}>
                        Aberta
                      </span>
                    ) : row.StatusOS?.toLowerCase().includes("fechada") ? (
                      <span style={{ background: "#dcfce7", color: "#16a34a", padding: "2px 6px", borderRadius: "6px" }}>
                        Fechada
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{row.Tecnico || row.NomeCliente || "—"}</td>
                  <td>{row.Data}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
