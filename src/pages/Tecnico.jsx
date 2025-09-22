import "./Form.css";
import { Link } from "react-router-dom";
import { useState } from "react";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase"; // 🔹 importa seu firebase.js

function Tecnico() {
  const [formData, setFormData] = useState({
    tecnico: "",
    setor: "",
    descricao: "",
    porta: "",
  });

  const [fotos, setFotos] = useState([null, null, null]);
  const [previews, setPreviews] = useState([null, null, null]);
  const [loading, setLoading] = useState(false);

  // 🔹 Upload no Cloudinary
  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "doorauto_unsigned"); // seu preset
    data.append("folder", "ordens");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dtxkiub5i/image/upload", // troque pelo seu cloud_name
      { method: "POST", body: data }
    );

    const json = await res.json();
    return json.secure_url;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFotoChange = (index, file) => {
    const newFotos = [...fotos];
    newFotos[index] = file;
    setFotos(newFotos);

    const newPreviews = [...previews];
    newPreviews[index] = URL.createObjectURL(file);
    setPreviews(newPreviews);
  };

  const validateForm = () => {
    if (!formData.tecnico || !formData.setor || !formData.descricao || !formData.porta) {
      alert("⚠️ Preencha todos os campos antes de enviar!");
      return false;
    }
    return true;
  };

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
      const uploadedUrls = [];
      for (let i = 0; i < fotos.length; i++) {
        if (fotos[i]) {
          const url = await uploadToCloudinary(fotos[i]);
          uploadedUrls.push(url);
        }
      }

      // 🔹 Monta payload
      const payload = {
        ...formData,
        numeroOS,
        fotos: uploadedUrls.filter(Boolean),
        dataAbertura: serverTimestamp(),
        statusOS: "Aberta", // toda OS criada começa aberta
        solicitante: formData.tecnico, // 👈 sempre registra o solicitante
      };

      // 🔹 Salva no Firestore
      await addDoc(ordensRef, payload);

      alert(`✅ Solicitação enviada com sucesso! Número: ${numeroOS}`);

      // 🔹 Reseta formulário
      setFormData({
        tecnico: "",
        setor: "",
        descricao: "",
        porta: "",
      });
      setFotos([null, null, null]);
      setPreviews([null, null, null]);
    } catch (err) {
      alert("❌ Erro ao enviar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-wrapper">
      <div className="form-card">
          <Link to="/tecnico-home" className="back-arrow" aria-label="Voltar"></Link>
        <div className="form-header">
          <h1 className="form-title">Formulário do Técnico</h1>
        </div>
        <p className="form-subtitle">Preencha os dados do atendimento técnico</p>

        <form className="form" onSubmit={handleSubmit}>
          <label>
            Nome do Técnico
            <select
              name="tecnico"
              value={formData.tecnico}
              onChange={handleChange}
              required
            >
              <option value="">Selecione...</option>
              <option value="Victor Oliveira">Victor Oliveira</option>
            </select>
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

          {/* Upload de fotos */}
          <div className="upload-section">
            <p>Fotos do atendimento (máx 3)</p>
            <div className="upload-cards">
              {fotos.map((_, index) => (
                <label key={index} className="upload-card">
                  {previews[index] ? (
                    <img
                      src={previews[index]}
                      alt={`Preview ${index + 1}`}
                      className="preview-img"
                    />
                  ) : (
                    <span>+</span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) =>
                      handleFotoChange(index, e.target.files[0])
                    }
                  />
                </label>
              ))}
            </div>
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
                setFormData({
                  tecnico: "",
                  setor: "",
                  descricao: "",
                  porta: "",
                });
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

export default Tecnico;
