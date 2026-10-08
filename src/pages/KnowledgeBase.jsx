import { useEffect, useState } from "react";

import {
  BookOpen,
  FileText,
  Search,
  Upload,
  Trash2,
} from "lucide-react";
const API_URL = import.meta.env.VITE_API_URL;

export default function KnowledgeBase() {
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function fetchDocuments() {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/knowledge-base/documents`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }

      const data = await response.json();

      setDocuments(data);
    } catch (error) {
      console.error("Document fetch error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function handleUpload(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `${API_URL}/knowledge-base/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Upload failed");
      }

      alert("Document uploaded and indexed successfully!");

      // Reload documents from database
      await fetchDocuments();
    } catch (error) {
      console.error("Upload error:", error);
      alert(error.message || "Failed to upload document");
    }

    event.target.value = "";
  }


  async function handleDelete(document) {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${document.name}"?`
  );

  if (!confirmed) return;

  try {
    const response = await fetch(
      `${API_URL}/knowledge-base/documents/${document.id}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to delete document");
    }

    setDocuments((currentDocuments) =>
      currentDocuments.filter(
        (doc) => doc.id !== document.id
      )
    );

    alert("Document deleted successfully!");
  } catch (error) {
    console.error("Delete error:", error);
    alert(error.message || "Failed to delete document");
  }
}

  const filtered = documents.filter((doc) =>
    doc.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Knowledge Base</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage documents used by AI to answer support questions.
          </p>
        </div>

        <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
          <Upload size={17} />
          Upload Document

          <input
            type="file"
            accept=".pdf,.txt,.md"
            className="hidden"
            onChange={handleUpload}
          />
        </label>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5">
        <Search size={17} className="text-slate-400" />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search documents..."
          className="w-full text-sm outline-none"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <BookOpen className="text-blue-600" size={19} />

          <h2 className="font-semibold">Documents</h2>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-slate-500">
            Loading documents...
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-red-50 p-2 text-red-600">
                    <FileText size={20} />
                  </div>

                  <div>
                    <p className="text-sm font-medium">{doc.name}</p>

                    <p className="mt-1 text-xs text-slate-500">
                      {doc.file_type} · {doc.chunks} chunks
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                <span className="text-xs text-slate-500">
                  Updated{" "}
                  {new Date(doc.created_at).toLocaleDateString()}
                </span>

                <button
                  onClick={() => handleDelete(doc)}
                  className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                  title="Delete document"
                >
                  <Trash2 size={17} />
                </button>
              </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500">
            No documents found.
          </p>
        )}
      </div>
    </div>
  );
}