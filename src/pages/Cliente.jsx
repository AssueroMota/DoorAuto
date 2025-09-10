import { Link } from "react-router-dom";
import "./Form.css";

function Cliente() {
  return (
    <div className="form-wrapper">
      <div className="form-card">
          <div className="back-home">
          <Link to="/" className="btn-back">← Voltar para Home</Link>
        </div>
        <h1 className="form-title">Formulário para Cliente</h1>
        <p className="form-subtitle">
          Preencha os dados abaixo para registrar sua avaliação
        </p>

        <form className="form">
          <label>
            Porta (PR)<span className="required">*</span>
            <input type="text" placeholder="Digite a identificação da porta" required />
          </label>

          <label>
            Breve Relato<span className="required">*</span>
            <textarea placeholder="Descreva brevemente a situação" required></textarea>
          </label>

          <fieldset>
            <legend>Limpeza da Área<span className="required">*</span></legend>
            <label><input type="radio" name="limpeza" value="Bom" /> Bom</label>
            <label><input type="radio" name="limpeza" value="Regular" /> Regular</label>
            <label><input type="radio" name="limpeza" value="Ruim" /> Ruim</label>
          </fieldset>

          <label>
            Observação Limpeza da Área
            <input type="text" placeholder="Digite observações adicionais" />
          </label>

          <fieldset>
            <legend>Acabamento do Serviço<span className="required">*</span></legend>
            <label><input type="radio" name="acabamento" value="Bom" /> Bom</label>
            <label><input type="radio" name="acabamento" value="Regular" /> Regular</label>
            <label><input type="radio" name="acabamento" value="Ruim" /> Ruim</label>
          </fieldset>

          <label>
            Observação Acabamento do Serviço
            <input type="text" placeholder="Digite observações adicionais" />
          </label>

          <label>
            Motivo da Corretiva
            <input type="text" placeholder="Informe o motivo" />
          </label>

          <fieldset>
            <legend>Realizado por<span className="required">*</span></legend>
            <label><input type="radio" name="realizado" value="Preventiva VGA" /> Preventiva VGA</label>
            <label><input type="radio" name="realizado" value="Corretiva VGA" /> Corretiva VGA</label>
            <label><input type="radio" name="realizado" value="Corretiva Cliente" /> Corretiva Cliente</label>
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

export default Cliente;
