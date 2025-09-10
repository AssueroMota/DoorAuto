import "./Form.css";

function Dashboard() {
  return (
    <div className="form-container">
      <h1 className="form-title">Dashboard</h1>
      <p className="form-subtitle">
        Aqui você poderá acompanhar relatórios e status das portas.
      </p>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h2>Total de Portas</h2>
          <p>86</p>
        </div>
        <div className="dashboard-card">
          <h2>Custos de Manutenção</h2>
          <p>R$ 108.085</p>
        </div>
        <div className="dashboard-card">
          <h2>Em Ótimo Estado</h2>
          <p>52%</p>
        </div>
      </div>

      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Porta</th>
            <th>Status</th>
            <th>Serviço</th>
            <th>Técnico</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>PR14</td>
            <td>Ótimo</td>
            <td>Preventiva</td>
            <td>João</td>
            <td>2025-09-09</td>
          </tr>
          <tr>
            <td>PR22</td>
            <td>Parada</td>
            <td>Corretiva</td>
            <td>Maria</td>
            <td>2025-09-08</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
