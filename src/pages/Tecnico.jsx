import "./Form.css";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";


function Tecnico() {
  return (

    <div className="form-wrapper">
      <div className="form-card">
        {/* Botão de voltar para home */}
        <div className="back-home">
          <Link to="/" className="btn-back">VOLTAR</Link>
        </div>
        <h1 className="form-title">Formulário para Técnico</h1>
        <p className="form-subtitle">Preencha os dados do atendimento técnico</p>

        <form className="form">
          <label>
            Porta (PR)<span className="required">*</span>
            <input type="text" placeholder="Digite a identificação da porta" required />
          </label>

          <fieldset>
            <legend>Status da Porta<span className="required">*</span></legend>
            <label><input type="radio" name="status" value="Ótimo" /> Em ótimo estado</label>
            <label><input type="radio" name="status" value="Manutenção" /> Precisando de manutenção</label>
            <label><input type="radio" name="status" value="Parada" /> Parada por falta de peças</label>
          </fieldset>

          <div className="form-row">
            <label>
              Hora de Entrada<span className="required">*</span>
              <input type="time" required />
            </label>
            <label>
              Hora de Saída<span className="required">*</span>
              <input type="time" required />
            </label>
          </div>

          <label>
            Área de Instalação/Manutenção<span className="required">*</span>
            <input type="text" placeholder="Ex: Entrada principal" required />
          </label>

          <label>
            Número de Ciclos<span className="required">*</span>
            <input type="number" placeholder="Ex: 1200" required />
          </label>

          <fieldset>
            <legend>Descrição do Serviço<span className="required">*</span></legend>
            <label><input type="radio" name="tipo" value="Preventiva" /> Manutenção Preventiva</label>
            <label><input type="radio" name="tipo" value="Corretiva" /> Manutenção Corretiva</label>
          </fieldset>

          <label>
            Relato do Serviço
            <textarea placeholder="Digite detalhes do atendimento"></textarea>
          </label>

          <fieldset>
            <legend>Contratempos<span className="required">*</span></legend>
            <label><input type="radio" name="contratempos" value="Sim" /> Sim</label>
            <label><input type="radio" name="contratempos" value="Não" /> Não</label>
          </fieldset>

          <fieldset>
            <legend>Serviço Concluído<span className="required">*</span></legend>
            <label><input type="radio" name="concluido" value="Sim" /> Sim</label>
            <label><input type="radio" name="concluido" value="Não" /> Não</label>
          </fieldset>

          <div className="form-buttons">
            <button type="submit" className="btn-primary">Enviar</button>
            <button type="reset" className="btn-secondary">Limpar</button>
          </div>
        </form>




      </div>

    </div>
  );
}

export default Tecnico;
