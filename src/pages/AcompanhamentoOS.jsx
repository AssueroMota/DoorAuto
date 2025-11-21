import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import axios from "axios";
import "./AcompanhamentoOS.css";

export default function AcompanhamentoOS() {
  const [ordens, setOrdens] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    osId: "",
    status: "Aberta",
    descricaoTecnica: "",
    tecnicoResponsavel: "",
    servico: "",
  });
  const [loading, setLoading] = useState(false);

  // Lightbox (fotos da abertura)
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Fotos finais
  const [fotosFinal, setFotosFinal] = useState([null, null, null]);
  const [previewsFinal, setPreviewsFinal] = useState([null, null, null]);

  // ================================
  // 🔥 FUNÇÃO DE UPLOAD PARA CLOUDINARY
  // ================================
  const uploadFoto = async (file) => {
    if (!file) return null;

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "doorauto_unsigned"); // seu preset
    data.append("folder", "ordens/finalizacao");

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/dtxkiub5i/image/upload`,
        data
      );
      return res.data.secure_url;
    } catch (err) {
      console.error("Erro ao enviar para Cloudinary:", err);
      return null;
    }
  };

  // Buscar ordens
  const fetchData = async () => {
    try {
      const snapshot = await getDocs(collection(db, "ordensDeServico"));
      let docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // ordenar pela data de abertura
      docs = docs.sort(
        (a, b) =>
          (a.dataAbertura?.seconds || 0) -
          (b.dataAbertura?.seconds || 0)
      );

      // apenas abertas/andamento
      const abertas = docs.filter((os) =>
        ["Aberta", "Andamento"].includes(os.statusOS)
      );

      setOrdens(abertas);
    } catch (err) {
      console.error("Erro ao carregar OS:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectOS = (osId) => {
    const os = ordens.find((r) => r.id === osId);
    setSelected(os || null);

    if (os) {
      setForm({
        osId: os.id,
        status: os.statusOS || "Aberta",
        servico: os.servico || "",
        descricaoTecnica: os.descricaoTecnica || "",
        tecnicoResponsavel: os.tecnicoResponsavel || "",
      });

      setPreviewsFinal([
        os.fotosFinal?.[0] || null,
        os.fotosFinal?.[1] || null,
        os.fotosFinal?.[2] || null,
      ]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFotoFinalChange = async (index, file) => {
    const newFotos = [...fotosFinal];
    newFotos[index] = file;
    setFotosFinal(newFotos);

    if (file) {
      const previewURL = URL.createObjectURL(file);
      const newPreviews = [...previewsFinal];
      newPreviews[index] = previewURL;
      setPreviewsFinal(newPreviews);
    }
  };

  // ================================
  // 🔥 SUBMIT — ENVIO FINALIZAÇÃO
  // ================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.osId) return alert("Escolha a O.S.");

    if (form.status === "Fechado") {
      if (!form.tecnicoResponsavel)
        return alert("Informe o Técnico Responsável");
      if (!form.descricaoTecnica.trim())
        return alert("Descreva o serviço realizado");
    }

    setLoading(true);

    try {
      const refDoc = doc(db, "ordensDeServico", form.osId);

      // Envio para cloudinary (fotos finais)
      const fotosURLs = [null, null, null];

      for (let i = 0; i < 3; i++) {
        if (fotosFinal[i]) {
          const url = await uploadFoto(fotosFinal[i]);
          fotosURLs[i] = url;
        } else if (previewsFinal[i]) {
          fotosURLs[i] = previewsFinal[i];
        }
      }

      // Atualizar OS
      await updateDoc(refDoc, {
        statusOS: form.status,
        servico: form.servico,
        descricaoTecnica: form.descricaoTecnica,
        tecnicoResponsavel: form.tecnicoResponsavel,
        fotosFinal: fotosURLs,
        dataFechamento:
          form.status === "Fechado" ? serverTimestamp() : null,
      });

      alert("✅ O.S atualizada com sucesso!");
      fetchData();

      setForm({
        osId: "",
        status: "Aberta",
        servico: "",
        descricaoTecnica: "",
        tecnicoResponsavel: "",
      });

      setSelected(null);
      setFotosFinal([null, null, null]);
      setPreviewsFinal([null, null, null]);

    } catch (err) {
      console.error(err);
      alert("❌ Erro: " + err.message);
    }

    setLoading(false);
  };

  // =====================================================================
  // ============================= RENDER ================================
  // =====================================================================

  return (
    <div className="os-wrapper">
      <div className="back-arrow" onClick={() => window.history.back()} />
      <div className="form-header">
        <h1>Acompanhamento de Ordens de Serviço</h1>
      </div>

      <form className="os-form" onSubmit={handleSubmit}>
        <label>
          Número da O.S
          <select
            value={form.osId}
            onChange={(e) => handleSelectOS(e.target.value)}
            required
          >
            <option value="">Selecione...</option>

            {ordens.map((r, idx) => (
              <option key={r.id} value={r.id}>
                {`OS-${String(idx + 1).padStart(2, "0")}`} -{" "}
                {r.dataAbertura?.toDate
                  ? r.dataAbertura.toDate().toLocaleDateString("pt-BR")
                  : ""}
              </option>
            ))}
          </select>
        </label>

        {selected && (
          <>
            <div className="form-row">
              <label>
                Solicitante
                <input value={selected.solicitante || ""} readOnly />
              </label>
              <label>
                Setor
                <input value={selected.setor || ""} readOnly />
              </label>
            </div>

            <div className="form-row">
              <label>
                Data de Abertura
                <input
                  value={
                    selected.dataAbertura?.toDate
                      ? selected.dataAbertura
                        .toDate()
                        .toLocaleDateString("pt-BR")
                      : ""
                  }
                  readOnly
                />
              </label>
              <label>
                Porta (ID)
                <input value={selected.porta || ""} readOnly />
              </label>
            </div>

            <label>
              Descrição da Abertura
              <textarea value={selected.descricao || ""} readOnly />
            </label>

            {/* FOTOS DA ABERTURA */}
            {selected?.fotos?.length > 0 && (
              <div className="upload-section">
                <p>Fotos enviadas na abertura:</p>
                <div className="upload-cards">
                  {selected.fotos.map((url, i) => (
                    <div
                      key={i}
                      className="upload-card"
                      onClick={() => {
                        setLightboxImage(url);
                        setLightboxOpen(true);
                      }}
                    >
                      <img src={url} alt="" className="preview-img" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <label>
              Tipo de Manutenção
              <select
                name="servico"
                value={form.servico}
                onChange={handleChange}
                required
              >
                <option value="">Selecione...</option>
                <option value="Preventiva">Preventiva</option>
                <option value="Corretiva">Corretiva</option>
              </select>
            </label>

            <label>
              Status da O.S
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                required
              >
                <option value="Aberta">Aberta</option>
                <option value="Andamento">Andamento</option>
                <option value="Fechado">Fechado</option>
              </select>
            </label>

            <label>
              Descrição Técnica
              <textarea
                name="descricaoTecnica"
                value={form.descricaoTecnica}
                onChange={handleChange}
                placeholder="Detalhe o que foi feito..."
              ></textarea>
            </label>

            <label>
              Técnico Responsável
              <select
                name="tecnicoResponsavel"
                value={form.tecnicoResponsavel}
                onChange={handleChange}
                required
              >
                <option value="">Selecione...</option>
                <option value="Victor Oliveira">Victor Oliveira</option>
                <option value="Thiago Luiz">Thiago Luiz</option>
                <option value="Júlio Gomes">Júlio Gomes</option>
                <option value="Raimundo Oliveira">Raimundo Oliveira</option>
              </select>
            </label>


            {/* FOTOS FINAIS */}
            <div className="upload-section">
              <p>Fotos da finalização (máx 3)</p>
              <div className="upload-cards">
                {previewsFinal.map((preview, index) => (
                  <label key={index} className="upload-card">
                    {preview ? (
                      <img
                        src={preview}
                        alt=""
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
                        handleFotoFinalChange(index, e.target.files[0])
                      }
                    />
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </>
        )}
      </form>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="lightbox-overlay"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={lightboxImage} alt="" />
            <button
              className="btn-close"
              onClick={() => setLightboxOpen(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
