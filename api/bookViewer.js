import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import html2pdf from "html2pdf.js";
import remarkGfm from 'remark-gfm';

export default function BookViewer() {
  const [content, setContent] = useState("");
  const viewerRef = useRef(null);

  useEffect(() => {
    fetch("/api/book")
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
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition-colors"
        >
          📥 Als PDF speichern
        </button>
      </div>
      <div ref={viewerRef} className="prose prose-lg max-w-none dark:prose-invert">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({node, ...props}) => <h1 className="text-4xl font-bold mb-4" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-3xl font-bold mb-3" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-2xl font-bold mb-2" {...props} />,
            p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4" {...props} />,
            li: ({node, ...props}) => <li className="mb-2" {...props} />,
            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4" {...props} />,
            code: ({node, ...props}) => <code className="bg-gray-100 dark:bg-gray-800 rounded px-2 py-1" {...props} />,
            pre: ({node, ...props}) => <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto my-4" {...props} />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
