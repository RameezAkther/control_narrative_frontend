import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { getDocuments, deleteDocument, getDocumentStatus } from "../api/documents";
import Sidebar from "../components/Sidebar";
import { FileText, Calendar, Eye, Trash2, Loader2, FileCode } from "lucide-react";

export default function DocumentList() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const deletedDocs = useRef(new Set());

  const isFinalStatus = (status) => {
    const s = status?.toLowerCase() || "";
    return s.includes("completed") || s.includes("ready") || s.includes("failed") || s.includes("error");
  };

  useEffect(() => {
    fetchDocs();
  }, [page]);

  useEffect(() => {
    const activeDocs = documents.filter(doc => 
      !isFinalStatus(doc.status) && !deletedDocs.current.has(doc._id)
    );
    if (activeDocs.length === 0) return;

    const timer = setTimeout(async () => {
      const updates = await Promise.all(
        activeDocs.map(async (doc) => {
          try {
            const res = await getDocumentStatus(doc._id);
            return { id: doc._id, ...res.data };
          } catch (err) {
            console.warn(`Failed to fetch status for ${doc._id}`);
            return null;
          }
        })
      );
      setDocuments(prevDocs => 
        prevDocs.map(doc => {
          const update = updates.find(u => u?.id === doc._id);
          if (update) {
            return { ...doc, status: update.status, stage: update.stage };
          }
          return doc;
        })
      );
    }, 5000);
    return () => clearTimeout(timer);
  }, [documents]);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const res = await getDocuments(page);
      const basicDocs = res.data.documents || [];
      setTotalPages(res.data.total_pages || 1);
      const mergedDocs = await Promise.all(
        basicDocs.map(async (doc) => {
          if (isFinalStatus(doc.status)) {
            return doc;
          }
          try {
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

      setDocuments(mergedDocs);
    } catch (error) {
      console.error("Error fetching docs", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      deletedDocs.current.add(id);
      
      await deleteDocument(id);
      if (documents.length === 1 && page > 1) {
        setPage(p => p - 1);
      } else {
        fetchDocs();
      }
    } catch (error) {
      console.error("Delete failed", error);
      deletedDocs.current.delete(id);
    }
  };

  const formatDate = (dateInput) => {
    if (!dateInput) return "Unknown date";
    const dateStr = dateInput?.$date || dateInput;
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase() || "";
    if (s.includes("ready") || s.includes("completed")) return "bg-green-100 text-green-700 border-green-200";
    if (s.includes("error") || s.includes("failed")) return "bg-red-100 text-red-700 border-red-200";
    return "bg-blue-50 text-blue-600 border-blue-100";
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto flex flex-col">
        <div className="max-w-7xl mx-auto flex flex-col space-y-6 flex-1 w-full">
            
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Documents</h1>
            <p className="text-gray-500 mt-1">View and manage your processed control narratives.</p>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
          ) : documents.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200 shadow-sm p-8">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <FileText size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No documents found</h3>
              <p className="text-gray-500 mt-2">Go to the upload tab to add new files.</p>
              <Link to="/upload" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700">
                Upload New
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc) => (
                <div key={doc._id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden group">
                  <div className="p-6 pb-4 flex items-start justify-between">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                      <FileCode size={24} />
                    </div>
                    <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wide border ${getStatusColor(doc.status)}`}>
                          {doc.status || 'Queued'}
                        </span>
                    </div>
                  </div>

                  <div className="px-6 flex-1">
                    <h3 className="font-semibold text-gray-900 truncate" title={doc.filename}>
                      {doc.filename}
                    </h3>
                    <div className="flex items-center text-gray-500 text-sm mt-2 gap-2">
                      <Calendar size={14} />
                      <span>{formatDate(doc.uploaded_at || doc.created_at)}</span>
                    </div>
                  </div>

                  <div className="p-6 pt-4 mt-2 flex items-center gap-3 border-t border-gray-50">
                    <Link 
                      to={`/documents/${doc._id}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                      <Eye size={16} /> View Details
                    </Link>
                    <button 
                      onClick={(e) => handleDelete(e, doc._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {documents.length > 0 && totalPages > 1 && (
            <div className="flex justify-center gap-4 mt-8">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)} 
                className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-white bg-gray-50 text-sm font-medium"
              >
                Previous
              </button>
              <span className="py-2 text-sm text-gray-600">Page {page} of {totalPages}</span>
              <button 
                disabled={page === totalPages} 
                onClick={() => setPage(p => p + 1)} 
                className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-white bg-gray-50 text-sm font-medium"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}