import { isDetailsEmpty } from "@/utils/helpers";
import { useState } from "react";

export function AIFillFormModals({ formData, setFormData }) {
  const [article, setArticle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const generatePrompt = (type, subject, details) => {
    switch (type) {
      case "details":
        return `
        Buat deskripsi paragraf yang tidak menyebutkan sumber, menggunakan bahasa formal, dan kalimat pasif. Tulis dalam paragraf tanpa poin-poin, subjudul, atau kutipan langsung. Hindari menggunakan frasa atau kalimat yang sama dengan teks asli. Pastikan teks tidak menyerupai berita, tidak mengandung pertanyaan, dan hanya berisi pendapat yang berasal dari sumber. Jangan menggunakan metafora, istilah informal, atau ungkapan idiomatik. Setiap paragraf harus memiliki minimal dua kalimat. Minimal 4 paragraf dari teks berikut:

        ${article}
        `;
      case "conclusion":
        return `
        Buat kesimpulan dua kalimat singkat untuk topik berikut:
        ${subject}
        
        dari teks berikut:
        ${details}
        `;
      case "recap":
        return `
        Rekap teks berikut menjadi satu paragraf singkat yang terdiri dari maksimal 2 kalimat, tidak termasuk solusi atau rekomendasi:

        ${details}
        `;
      case "notesToDo":
        return `
        Buat paragraf dua kalimat yang secara sekilas mengenai yang perlu atau akan dilakukan oleh pemerintah setempat selanjutnya yang agak mendukung pemerintah pusat, dengan jawaban langsung, tanpa 'langkah yang harus diambil' berdasarkan teks berikut:

        ${details}
        `;
      default:
        return "";
    }
  };

  const fetchAIResponse = async (type, details, subject) => {
    const prompt = generatePrompt(type, subject, details);
    try {
      setIsLoading(true);
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error("Error fetching AI response:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalAction = async (type) => {
    let details;
    switch (type) {
      case "details":
        if (!article) {
          alert("Please enter the article/transcript");
          return;
        }
        details = await fetchAIResponse(type);
        if (details) {
          setFormData((prev) => ({
            ...prev,
            details: [details.split("\n\n")],
          }));
          document.getElementById("detailsFill").close();
        }
        break;
      case "conclusion":
        if (isDetailsEmpty(formData.details) || formData.subject.length === 0) {
          alert("Please fill in the details and subject first");
          return;
        }
        details = formData.details
          .map((detail) => detail.join("\n\n"))
          .join("\n\n");
        const conclusion = await fetchAIResponse(
          type,
          details,
          formData.subject
        );
        if (conclusion) {
          setFormData((prev) => ({
            ...prev,
            twoSentencesConclusion: conclusion,
          }));
          document.getElementById("twoSentencesConclusion").close();
        }
        break;
      case "recap":
        if (isDetailsEmpty(formData.details)) {
          alert("Please fill in the details first");
          return;
        }
        details = formData.details
          .map((detail) => detail.join("\n\n"))
          .join("\n\n");
        const recap = await fetchAIResponse(type, details);
        if (recap) {
          setFormData((prev) => ({ ...prev, notesRecap: recap }));
          document.getElementById("notesRecap").close();
        }
        break;
      case "notesToDo":
        if (isDetailsEmpty(formData.details)) {
          alert("Please fill in the details first");
          return;
        }
        details = formData.details
          .map((detail) => detail.join("\n\n"))
          .join("\n\n");
        const notesToDo = await fetchAIResponse(type, details);
        if (notesToDo) {
          setFormData((prev) => ({ ...prev, notesToDo }));
          document.getElementById("notesToDo").close();
        }
        break;
      default:
        break;
    }
  };

  const renderModal = (id, type, isDetailsValid = true) => (
    <dialog className="modal" id={id}>
      <div className="modal-box bg-base-100">
        <div className="modal-action mt-0">
          <button
            className="btn btn-xs btn-error btn-outline mb-4"
            onClick={() => document.getElementById(id).close()}
          >
            ✖
          </button>
        </div>
        {type === "details" && (
          <div className="form-control">
            <label className="label">
              <span className="label-text">Article/Transcript:</span>
            </label>
            <textarea
              name="article"
              value={article}
              onChange={(e) => setArticle(e.target.value)}
              className="textarea textarea-bordered h-48"
            />
          </div>
        )}
        {type !== "details" && !isDetailsValid && (
          <div className="text-center my-4">
            <p className="text-error">Please fill in the details first</p>
          </div>
        )}
        {type !== "details" && !isDetailsEmpty(formData.details) && (
          <div className="text-center my-4">
            <p className="text-primary">
              Details filled. Click the button below to generate the response.
            </p>
          </div>
        )}
        {type === "details" && !article ? (
          <div className="text-center my-4">
            <p className="text-error">Please fill in the article/transcript</p>
          </div>
        ) : null}
        <div className="mt-2 text-center">
          <button
            className="btn btn-sm btn-primary"
            onClick={() => handleModalAction(type)}
            disabled={isLoading}
          >
            Ask AIder
          </button>
        </div>
      </div>
    </dialog>
  );

  return (
    <>
      {renderModal("detailsFill", "details", true)}
      {renderModal(
        "twoSentencesConclusion",
        "conclusion",
        !isDetailsEmpty(formData.details) && formData.subject.length > 0
      )}
      {renderModal("notesRecap", "recap", !isDetailsEmpty(formData.details))}
      {renderModal("notesToDo", "notesToDo", !isDetailsEmpty(formData.details))}
    </>
  );
}
