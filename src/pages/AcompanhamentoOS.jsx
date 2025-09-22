import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase"; // 🔹 seu firebase.js
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

  // Upload de fotos finais
  const [fotosFinal, setFotosFinal] = useState([null, null, null]);
  const [previewsFinal, setPreviewsFinal] = useState([null, null, null]);

  // Buscar O.S do Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await getDocs(collection(db, "ordensDeServico"));
        let docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // 🔹 Ordenar pela data de abertura (mais antigas primeiro)
        docs = docs.sort(
          (a, b) =>
            (a.dataAbertura?.seconds || 0) -
            (b.dataAbertura?.seconds || 0)
        );

        // 🔹 Filtrar apenas abertas/andamento
        const abertas = docs.filter((os) =>
          ["Aberta", "Andamento"].includes(os.statusOS)
        );

        setOrdens(abertas);
      } catch (err) {
        console.error("Erro ao carregar O.S:", err);
      }
    };
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
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleFotoFinalChange = (index, file) => {
    const newFotos = [...fotosFinal];
    newFotos[index] = file;
    setFotosFinal(newFotos);

    const newPreviews = [...previewsFinal];
    newPreviews[index] = URL.createObjectURL(file);
    setPreviewsFinal(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.osId) return alert("Escolha o número da O.S.");

    if (form.status === "Fechado") {
      if (!form.tecnicoResponsavel)
        return alert("Informe o Técnico Responsável para fechar a O.S.");
      if (!form.descricaoTecnica.trim())
        return alert("Escreva a Descrição Técnica para fechar a O.S.");
    }

    setLoading(true);
    try {
      const ref = doc(db, "ordensDeServico", form.osId);

      await updateDoc(ref, {
        statusOS: form.status,
        servico: form.servico,
        descricaoTecnica: form.descricaoTecnica,
        tecnicoResponsavel: form.tecnicoResponsavel,
        dataFechamento: form.status === "Fechado" ? serverTimestamp() : null,
        // 🔹 futuramente salvar fotos finais (Cloudinary)
      });

      alert("✅ O.S atualizada com sucesso!");
    } catch (err) {
      alert("❌ Erro ao atualizar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="os-wrapper">
      <div className="form-header" style={{ alignItems: "flex-start" }}>
        <Link to="/tecnico-home" className="back-arrow" aria-label="Voltar"></Link>
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
                      ? selected.dataAbertura.toDate().toLocaleDateString("pt-BR")
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

            {/* 🔹 Fotos iniciais (cliente/técnico) */}
            {selected?.fotos?.length > 0 && (
              <div className="upload-section">
                <p>Fotos enviadas na abertura:</p>
                <div className="upload-cards">
                  {selected.fotos.map((url, i) => (
                    <div key={i} className="upload-card">
                      <img
                        src={url}
                        alt={`foto abertura ${i + 1}`}
                        className="preview-img"
                      />
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
              Descrição Técnica
              <textarea
                name="descricaoTecnica"
                value={form.descricaoTecnica}
                onChange={handleChange}
                placeholder="Detalhe o que foi feito..."
              />
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
              </select>
            </label>

            {/* 🔹 Upload fotos finais */}
            <div className="upload-section">
              <p>Fotos da finalização (máx 3)</p>
              <div className="upload-cards">
                {fotosFinal.map((_, index) => (
                  <label key={index} className="upload-card">
                    {previewsFinal[index] ? (
                      <img
                        src={previewsFinal[index]}
                        alt={`Preview final ${index + 1}`}
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
    </div>
  );
}
