import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Cliente from "./pages/Cliente";
import Tecnico from "./pages/Tecnico";
import Dashboard from "./pages/Dashboard";
import FechamentoOS from "./pages/AcompanhamentoOS.jsx";
import TecnicoHome from "./pages/TecnicoHome.jsx";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cliente" element={<Cliente />} />
          <Route path="/tecnico-home" element={<TecnicoHome />} />
          <Route path="/tecnico" element={<Tecnico />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/fechamento" element={<FechamentoOS />} />
          {/* rota coringa */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
