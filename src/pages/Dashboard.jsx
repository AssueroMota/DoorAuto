import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import "./Dashboard.css";

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

  // 🔹 Carregar dados da planilha
  useEffect(() => {
    fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vR5LGgZ5j-zZvZpXaXMfwX1781b-KukF0SlJlGN2SSGQHPyJeuxGWNuUzwgwsHQ3cuVEiv2XrltD-tR/pub?gid=0&single=true&output=csv")
      .then((res) => res.text())
      .then((csv) => {
        const rows = csv.split("\n").map((r) => r.split(","));
        const values = rows.slice(1).filter((r) => r.length > 1);

        const mapped = values.map((r) => ({
          OS_ID: r[0],
          Porta: r[1],
          Status: r[2],
          Servico: r[3],
          Tecnico: r[4],
          Data: r[5],
          Ciclos: Number(r[6] || 0),
          Custo: Number(r[7]?.replace(",", ".") || 0),
          Relato: r[8],
          StatusOS: r[9],
          NomeCliente: r[10],
          Telefone: r[11],
          Email: r[12],
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

  return (
    <div className="dashboard-wrapper">

      {/* 🔹 Header com logo inline e botão de voltar */}
      <div className="dashboard-header">
        <div className="logo-container">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 100 100" fill="#123D6D">
            <path d="M50 0 L55 20 L75 25 L55 30 L50 50 L45 30 L25 25 L45 20 Z" />
            <path d="M50 50 L70 55 L75 75 L55 70 L50 90 L45 70 L25 75 L30 55 Z" />
          </svg>
          <div className="logo-texts">
            <h1 className="company-name">PLANTIER</h1>
            <p className="company-subtitle">Manutenção e Instalações Industriais LTDA</p>
          </div>
        </div>
        <div className="back-arrow" onClick={() => window.history.back()} />
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

      {/* 🔹 Gráficos */}
      <div className="charts-grid">
        <div className="chart-container wide">
          <h3>Status das OS</h3>
          <BarChart width={600} height={250} data={statusData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" /><YAxis /><Tooltip /><Legend />
            <Bar dataKey="value">
              {statusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
            </Bar>
          </BarChart>
        </div>

        <div className="chart-container">
          <h3>Custos por Porta</h3>
          <BarChart width={350} height={250} data={custoData}>
            <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="Porta" /><YAxis /><Tooltip />
            <Bar dataKey="Custo" fill="#1e3a8a" />
          </BarChart>
        </div>

        <div className="chart-container">
          <h3>Ciclos por Porta</h3>
          <BarChart width={350} height={250} data={ciclosData}>
            <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="Porta" /><YAxis /><Tooltip />
            <Bar dataKey="Ciclos" fill="#9333ea" />
          </BarChart>
        </div>

        <div className="chart-container">
          <h3>Distribuição de Custos</h3>
          <PieChart width={350} height={250}>
            <Pie data={custoData} dataKey="Custo" nameKey="Porta" cx="50%" cy="50%" outerRadius={90} label>
              {custoData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip /><Legend />
          </PieChart>
        </div>

        <div className="chart-container wide">
          <h3>OS Abertas x Fechadas</h3>
          <LineChart width={600} height={250} data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="Data" /><YAxis /><Tooltip /><Legend />
            <Line type="monotone" dataKey="Abertas" stroke="#ef4444" />
            <Line type="monotone" dataKey="Fechadas" stroke="#22c55e" />
          </LineChart>
        </div>

        <div className="chart-container">
          <h3>OS por Técnico</h3>
          <BarChart width={350} height={250} data={tecnicoData}>
            <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="Tecnico" /><YAxis /><Tooltip /><Legend />
            <Bar dataKey="OS" fill="#2563eb" />
          </BarChart>
        </div>

        <div className="chart-container">
          <h3>Clientes mais Ativos</h3>
          <BarChart width={350} height={250} data={clienteData}>
            <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="Cliente" /><YAxis /><Tooltip />
            <Bar dataKey="OS" fill="#f97316" />
          </BarChart>
        </div>
      </div>

      {/* 🔹 Tabela de OS no final */}
      <div className="table-section">
        <h2>Ordens de Serviço</h2>
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>OS</th>
              <th>Descrição</th>
              <th>Aberta por</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={i}>
                <td>{row.OS_ID}</td>
                <td>{row.StatusOS}</td>
                <td>{row.Tecnico || row.NomeCliente || "—"}</td>
                <td>{row.Data}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Dashboard;
