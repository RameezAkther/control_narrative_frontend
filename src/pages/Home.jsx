import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { UploadCloud, FileText, MessageCircle, ArrowRight, Clock } from "lucide-react";
import { getDocuments, getDocumentStatus } from "../api/documents"; 

export default function Home() {
  const [recentDocs, setRecentDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  const isFinalStatus = (status) => {
    const s = status?.toLowerCase() || "";
    return s.includes("completed") || s.includes("ready") || s.includes("failed") || s.includes("error");
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const res = await getDocuments(1);
        
        if (!mounted) return;
        const docs = res.data.documents?.slice(0, 5) || [];
        const docsWithStatus = await Promise.all(
          docs.map(async (doc) => {
            try {
              if (isFinalStatus(doc.status)) {
                return doc;
              }
              const statusRes = await getDocumentStatus(doc._id);
              return { 
                ...doc, 
                status: statusRes.data.status,
                stage: statusRes.data.stage
              };
            } catch (err) {
              console.warn(`Could not fetch status for ${doc._id}`);
              return { ...doc, status: "unknown" };
            }
          })
        );

        if (mounted) {
          setRecentDocs(docsWithStatus);
        }

      } catch (e) {
        console.error("Failed to load documents", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => (mounted = false);
  }, []);

  return (
    <div className="flex">
      <Sidebar />

      <main className="p-6 flex-1">
        <section className="relative bg-gradient-to-r from-blue-50 via-white to-purple-50 rounded-xl p-8 overflow-hidden mb-6 shadow-sm">
          <div className="absolute -right-24 -top-12 w-72 h-72 rounded-full bg-gradient-to-br from-blue-200 to-purple-200 opacity-40 transform rotate-45 animate-pulse"></div>

          <div className="relative z-10 flex items-start gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-extrabold text-gray-900">Control Narrative Parser</h1>
              <p className="mt-2 text-gray-600 max-w-xl">
                Quickly upload and parse control narrative documents, extract control logic, and chat with your document to get precise answers.
              </p>

              <div className="mt-4 flex items-center gap-3">
                <Link to="/upload" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow transition-transform transform hover:-translate-y-0.5">
                  <UploadCloud size={16} /> Upload Documents
                </Link>

                <Link to="/documents" className="inline-flex items-center gap-2 text-blue-600 border border-blue-200 px-3 py-2 rounded-md hover:bg-blue-50 transition">
                  <FileText size={14} /> View Documents
                </Link>
              </div>
            </div>

            <div className="w-48 p-4 bg-white rounded-lg shadow-sm transform hover:scale-105 transition-all">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 rounded-full p-2">
                  <Clock size={20} className="text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Quick Workflow</div>
                  <div className="text-xs text-gray-400">Upload → Parse → Chat</div>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                Tip: Use the "Accurate" parsing strategy for complex narratives to get better control extraction.
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Link to="/upload" className="bg-white rounded-lg p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition">
            <div className="p-3 rounded-full bg-blue-50 text-blue-600">
              <UploadCloud size={20} />
            </div>
            <div>
              <div className="text-sm font-semibold">Upload Document</div>
              <div className="text-xs text-gray-400">Start a new parsing job</div>
            </div>
            <div className="ml-auto text-blue-400">
              <ArrowRight size={16} className="animate-bounce" />
            </div>
          </Link>

          <Link to="/documents" className="bg-white rounded-lg p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition">
            <div className="p-3 rounded-full bg-purple-50 text-purple-600">
              <FileText size={20} />
            </div>
            <div>
              <div className="text-sm font-semibold">Your Documents</div>
              <div className="text-xs text-gray-400">Manage uploads & statuses</div>
            </div>
            <div className="ml-auto text-purple-400">
              <ArrowRight size={16} className="animate-bounce" />
            </div>
          </Link>

          <Link to="/chat" className="bg-white rounded-lg p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition">
            <div className="p-3 rounded-full bg-green-50 text-green-600">
              <MessageCircle size={20} />
            </div>
            <div>
              <div className="text-sm font-semibold">Chat with Document</div>
              <div className="text-xs text-gray-400">Ask questions about parsed docs</div>
            </div>
            <div className="ml-auto text-green-400">
              <ArrowRight size={16} className="animate-bounce" />
            </div>
          </Link>
        </section>

        <section className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Recent Documents</h3>
            <Link to="/documents" className="text-xs text-gray-500 hover:underline">View all</Link>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : recentDocs.length === 0 ? (
            <div className="text-sm text-gray-500">No recent uploads. Start by uploading a document.</div>
          ) : (
            <ul className="space-y-2">
              {recentDocs.map((d) => (
                <li key={d._id} className="p-2 rounded hover:bg-gray-50 transition flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                    <FileText size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium truncate max-w-md">{d.filename}</div>
                    <div className="text-xs text-gray-400">
                      Uploaded: {new Date(d.created_at || d.uploaded_at?.$date || Date.now()).toLocaleString()}
                    </div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full border ${
                    d.status === "ready / completed" 
                      ? "bg-green-50 text-green-600 border-green-100" 
                      : "bg-blue-50 text-blue-600 border-blue-100"
                  }`}>
                    {d.status || "Queued"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}