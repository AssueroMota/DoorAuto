import "./Form.css";
import { Link } from "react-router-dom";
import { useState } from "react";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase"; // seu firebase.js
import axios from "axios";

function Cliente() {
  const [formData, setFormData] = useState({
    solicitante: "",
    setor: "",
    porta: "",
    descricao: "",
    statusOS: "Aberta", // sempre começa como "Aberta"
  });

  const [fotos, setFotos] = useState([null, null, null]);
  const [previews, setPreviews] = useState([null, null, null]);
  const [loading, setLoading] = useState(false);

  // Atualizar inputs de texto
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Atualizar imagens
  const handleFotoChange = (index, file) => {
    const newFotos = [...fotos];
    const newPreviews = [...previews];
    newFotos[index] = file;
    newPreviews[index] = URL.createObjectURL(file);
    setFotos(newFotos);
    setPreviews(newPreviews);
  };

  // Upload de uma foto pro Cloudinary
  const uploadFoto = async (file) => {
    if (!file) return null;

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "doorauto_unsigned"); // seu preset
    data.append("folder", "ordens");

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/dtxkiub5i/image/upload`, // troque pelo seu cloud_name
        data
      );
      return res.data.secure_url;
    } catch (err) {
      console.error("Erro no upload:", err);
      return null;
    }
  };

  // Validação do formulário
  const validateForm = () => {
    if (!formData.solicitante || !formData.setor || !formData.porta || !formData.descricao) {
      alert("⚠️ Preencha todos os campos antes de enviar!");
      return false;
    }
    return true;
  };

  // Submit do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      // 🔹 Pega total de documentos para gerar próximo número
      const ordensRef = collection(db, "ordensDeServico");
      const snapshot = await getDocs(ordensRef);
      const total = snapshot.size;
      const numeroOS = `OS-${String(total + 1).padStart(2, "0")}`;

      // 🔹 Upload das fotos
      const uploadedUrls = await Promise.all(fotos.map((f) => uploadFoto(f)));

      // 🔹 Salvar no Firestore
      await addDoc(ordensRef, {
        ...formData,
        numeroOS,
        fotos: uploadedUrls.filter(Boolean),
        dataAbertura: serverTimestamp(),
      });

      alert(`✅ Solicitação enviada com sucesso! Número: ${numeroOS}`);
      setFormData({ solicitante: "", setor: "", porta: "", descricao: "", statusOS: "Aberta" });
      setFotos([null, null, null]);
      setPreviews([null, null, null]);
    } catch (err) {
      console.error("Erro ao enviar:", err);
      alert("❌ Erro ao salvar a solicitação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-wrapper">
      <div className="form-card">
          <Link to="/" className="back-arrow" aria-label="Voltar"></Link>
        <div className="form-header">
          <h1 className="form-title">Formulário do Cliente</h1>
        </div>
        <p className="form-subtitle">Preencha os dados da solicitação</p>

        <form className="form" onSubmit={handleSubmit}>
          <label>
            Nome do Solicitante
            <input
              type="text"
              name="solicitante"
              value={formData.solicitante}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Setor
            <input
              type="text"
              name="setor"
              value={formData.setor}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Porta (ID)
            <select
              name="porta"
              value={formData.porta}
              onChange={handleChange}
              required
            >
              <option value="">Selecione...</option>
              {Array.from({ length: 91 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </label>

          <label>
            Descrição
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              required
            ></textarea>
          </label>

          {/* Upload de Fotos */}
          <div className="upload-container">
            {previews.map((preview, index) => (
              <div key={index} className="upload-card">
                {preview ? (
                  <img src={preview} alt={`Preview ${index + 1}`} className="upload-preview" />
                ) : (
                  <span className="upload-placeholder">Foto {index + 1}</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFotoChange(index, e.target.files[0])}
                />
              </div>
            ))}
          </div>

          <div className="form-buttons">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Enviando..." : "Enviar"}
            </button>
            <button
              type="reset"
              className="btn-secondary"
              disabled={loading}
              onClick={() => {
                setFormData({ solicitante: "", setor: "", porta: "", descricao: "", statusOS: "Aberta" });
                setFotos([null, null, null]);
                setPreviews([null, null, null]);
              }}
            >
              Limpar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Cliente;
