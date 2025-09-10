import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from "recharts";
import "./Dashboard.css";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);

  // Filtros
  const [filterPorta, setFilterPorta] = useState("");
  const [filterSetor, setFilterSetor] = useState("");
  const [filterArea, setFilterArea] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  useEffect(() => {
    fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vR5LGgZ5j-zZvZpXaXMfwX1781b-KukF0SlJlGN2SSGQHPyJeuxGWNuUzwgwsHQ3cuVEiv2XrltD-tR/pub?gid=0&single=true&output=csv")
      .then(res => res.text())
      .then(csv => {
        const rows = csv.split("\n").map(r => r.split(","));
        const values = rows.slice(1).filter(r => r.length > 1);

        const mapped = values.map(r => ({
          Porta: r[0],
          Status: r[1],
          Servico: r[2],
          Tecnico: r[3],
          Data: r[4],
          Ciclos: Number(r[5] || 0),
          Custo: Number(r[6] || 0),
          Relato: r[7],
          Setor: r[8] || "Geral",
          Area: r[9] || "Não informado"
        }));

        setData(mapped);
        setFiltered(mapped);
      });
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let temp = [...data];
    if (filterPorta) temp = temp.filter(d => d.Porta === filterPorta);
    if (filterSetor) temp = temp.filter(d => d.Setor === filterSetor);
    if (filterArea) temp = temp.filter(d => d.Area === filterArea);
    if (filterStatus) temp = temp.filter(d => d.Status === filterStatus);
    if (filterStartDate) temp = temp.filter(d => new Date(d.Data) >= new Date(filterStartDate));
    if (filterEndDate) temp = temp.filter(d => new Date(d.Data) <= new Date(filterEndDate));
    setFiltered(temp);
  }, [filterPorta, filterSetor, filterArea, filterStatus, filterStartDate, filterEndDate, data]);

  // KPIs
  const totalPortas = filtered.length;
  const otimo = filtered.filter(d => d.Status.toLowerCase().includes("ótimo")).length;
  const manutencao = filtered.filter(d => d.Status.toLowerCase().includes("manuten")).length;
  const paradas = filtered.filter(d => d.Status.toLowerCase().includes("parada")).length;
  const custoTotal = filtered.reduce((acc, d) => acc + d.Custo, 0);

  // Dados para gráficos
  const statusData = [
    { name: "Ótimo", value: otimo },
    { name: "Manutenção", value: manutencao },
    { name: "Parada", value: paradas }
  ];

  // Serviços por dia
  const temporalData = Object.values(
    filtered.reduce((acc, row) => {
      if (!acc[row.Data]) {
        acc[row.Data] = { Data: row.Data, Preventiva: 0, Corretiva: 0 };
      }
      if (row.Servico?.toLowerCase().includes("preventiva")) {
        acc[row.Data].Preventiva += 1;
      } else if (row.Servico?.toLowerCase().includes("corretiva")) {
        acc[row.Data].Corretiva += 1;
      }
      return acc;
    }, {})
  );

  // Motivos da Corretiva
  const motivosData = Object.values(
    filtered.reduce((acc, row) => {
      if (row.Servico?.toLowerCase().includes("corretiva")) {
        const motivo = row.Relato || "Não informado";
        if (!acc[motivo]) acc[motivo] = { Motivo: motivo, Qtd: 0 };
        acc[motivo].Qtd += 1;
      }
      return acc;
    }, {})
  );

  // Responsável pela corretiva (simples: conta serviços preventivos vs corretivos)
  const responsavelData = [
    { name: "Preventiva", value: filtered.filter(r => r.Servico?.toLowerCase().includes("preventiva")).length },
    { name: "Corretiva", value: filtered.filter(r => r.Servico?.toLowerCase().includes("corretiva")).length }
  ];

  // Top e bottom ciclos
  const maioresCiclos = [...filtered].sort((a, b) => b.Ciclos - a.Ciclos).slice(0, 10);
  const menoresCiclos = [...filtered].sort((a, b) => a.Ciclos - b.Ciclos).slice(0, 10);

  const COLORS = ["#28a745", "#ffc107", "#dc3545", "#6f42c1", "#20c997"];

  return (
    <div className="dashboard-wrapper">

      {/* FILTROS */}
      <div className="filters">
        <select value={filterPorta} onChange={e => setFilterPorta(e.target.value)}>
          <option value="">Porta</option>
          {Array.from(new Set(data.map(d => d.Porta))).map((p, i) => (
            <option key={i} value={p}>{p}</option>
          ))}
        </select>

        <select value={filterSetor} onChange={e => setFilterSetor(e.target.value)}>
          <option value="">Setor</option>
          {Array.from(new Set(data.map(d => d.Setor))).map((p, i) => (
            <option key={i} value={p}>{p}</option>
          ))}
        </select>

        <select value={filterArea} onChange={e => setFilterArea(e.target.value)}>
          <option value="">Área</option>
          {Array.from(new Set(data.map(d => d.Area))).map((p, i) => (
            <option key={i} value={p}>{p}</option>
          ))}
        </select>

        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Status</option>
          <option value="Ótimo">Ótimo</option>
          <option value="Manutenção">Manutenção</option>
          <option value="Parada">Parada</option>
        </select>

        <input type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} />
        <input type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} />

        <button onClick={() => {
          setFilterPorta("");
          setFilterSetor("");
          setFilterArea("");
          setFilterStatus("");
          setFilterStartDate("");
          setFilterEndDate("");
        }}>Limpar</button>
      </div>

      {/* SEÇÃO 1 - KPIs + Gráficos */}
      <section className="dashboard-section">
        <h2>KPI’s</h2>
        <div className="kpi-cards">
          <div className="kpi-card"><h3>Total de Portas</h3><div className="kpi-value">{totalPortas}</div></div>
          <div className="kpi-card"><h3>Ótimo Estado</h3><div className="kpi-value">{otimo}</div></div>
          <div className="kpi-card"><h3>Precisa de Manutenção</h3><div className="kpi-value">{manutencao}</div></div>
          <div className="kpi-card"><h3>Paradas</h3><div className="kpi-value">{paradas}</div></div>
          <div className="kpi-card"><h3>Custo Total</h3><div className="kpi-value">R$ {custoTotal.toLocaleString()}</div></div>
        </div>

        <div className="charts-grid">
          <div className="chart-container">
            <h3>Status das Portas</h3>
            <BarChart layout="vertical" width={400} height={250} data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" />
              <Tooltip />
              <Bar dataKey="value">
                {statusData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </div>

          <div className="chart-container">
            <h3>Custo por Porta</h3>
            <BarChart width={400} height={250} data={filtered}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Porta" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Custo" fill="#6f42c1" />
            </BarChart>
          </div>

          <div className="chart-container">
            <h3>Distribuição de Custos</h3>
            <PieChart width={350} height={250}>
              <Pie data={filtered} dataKey="Custo" nameKey="Porta" cx="50%" cy="50%" outerRadius={90} label>
                {filtered.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        </div>
      </section>

      {/* SEÇÃO 2 - Análise Temporal */}
      <section className="dashboard-section">
        <h2>Análise Temporal</h2>
        <div className="charts-grid">
          <div className="chart-container wide">
            <h3>Serviços por Dia</h3>
            <BarChart width={700} height={300} data={temporalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Data" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Preventiva" fill="#6c757d" />
              <Bar dataKey="Corretiva" fill="#28a745" />
            </BarChart>
          </div>

          <div className="chart-container">
            <h3>Motivo para Corretiva</h3>
            <BarChart layout="vertical" width={400} height={300} data={motivosData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="Motivo" />
              <Tooltip />
              <Bar dataKey="Qtd" fill="#6f42c1" />
            </BarChart>
          </div>

          <div className="chart-container">
            <h3>Responsável pela Corretiva</h3>
            <PieChart width={350} height={300}>
              <Pie data={responsavelData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {responsavelData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        </div>
      </section>

      {/* SEÇÃO 3 - Análise Categórica */}
      <section className="dashboard-section">
        <h2>Análise Categórica</h2>
        <div className="charts-grid">
          <div className="chart-container">
            <h3>Portas com Maiores Ciclos</h3>
            <BarChart width={400} height={300} data={maioresCiclos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Porta" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Ciclos" fill="#20c997" />
            </BarChart>
          </div>

          <div className="chart-container">
            <h3>Portas com Menores Ciclos</h3>
            <BarChart width={400} height={300} data={menoresCiclos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Porta" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Ciclos" fill="#dc3545" />
            </BarChart>
          </div>
        </div>
      </section>

      {/* TABELA FINAL */}
      <section className="dashboard-section">
        <h2>Últimos Serviços</h2>
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Porta</th>
              <th>Status</th>
              <th>Serviço</th>
              <th>Técnico</th>
              <th>Data</th>
              <th>Ciclos</th>
              <th>Custo</th>
              <th>Relato</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={i}>
                <td>{row.Porta}</td>
                <td>{row.Status}</td>
                <td>{row.Servico}</td>
                <td>{row.Tecnico}</td>
                <td>{row.Data}</td>
                <td>{row.Ciclos}</td>
                <td>R$ {row.Custo}</td>
                <td>{row.Relato}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default Dashboard;
