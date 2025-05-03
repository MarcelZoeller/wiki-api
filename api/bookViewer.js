import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import html2pdf from "html2pdf.js";

export default function BookViewer() {
  const [content, setContent] = useState("");
  const viewerRef = useRef(null);

  useEffect(() => {
    fetch("/api/book/complete")
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Fehler ${res.status}: ${errorText}`);
        }
        return res.text();
      })
      .then((text) => setContent(text))
      .catch((err) => {
        console.error("Fehler beim Laden des Buchtexts:", err.message);
        setContent(`# Fehler beim Laden\n\n${err.message}`);
      });
  }, []);

  const downloadPDF = () => {
    const element = viewerRef.current;
    const opt = {
      margin: 0.5,
      filename: "Demonic_Buch.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">📘 Demonic – Buchansicht</h1>
        <button
          onClick={downloadPDF}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow"
        >
          📥 Als PDF speichern
        </button>
      </div>
      <div ref={viewerRef} className="prose prose-lg max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
