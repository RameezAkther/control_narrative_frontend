import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { uploadDocuments, getDocuments, deleteDocument, getDocumentStatus } from "../api/documents";
import Sidebar from "../components/Sidebar";
import {
  UploadCloud, FileText, Trash2, Zap, Search, CheckCircle, Loader2, X, AlertCircle
} from "lucide-react";

export default function UploadDocument() {
  const [stagedFiles, setStagedFiles] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [progressMap, setProgressMap] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const activePolls = useRef(new Set());
  const deletedDocs = useRef(new Set()); // Track deleted document IDs
  const DEFAULT_TOTAL_STAGES = 16; 

  const prettyStatusText = (status) => {
    if (!status) return "Initializing...";
    const s = status.replace(/_/g, " "); 
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const isFinalStatus = (status) => {
    const s = status?.toLowerCase() || "";
    return s.includes("completed") || s.includes("ready") || s.includes("failed") || s.includes("error");
  };

  useEffect(() => {
    fetchDocuments(page);
  }, [page]);

  const fetchDocuments = async (page) => {
    try {
      const res = await getDocuments(page);
      const docs = res.data.documents || [];
      setDocuments(docs);
      setTotalPages(res.data.total_pages || 1);

      // Start polling only for documents that are not in final status
      docs.forEach(doc => {
        const knownStatus = progressMap[doc._id]?.status || doc.status;
        
        // Don't poll if already deleted or in final status
        if (!deletedDocs.current.has(doc._id) && !isFinalStatus(knownStatus)) {
          pollStatus(doc._id);
        }
      });
    } catch (error) {
      console.error("Failed to fetch documents", error);
    }
  };

  const pollStatus = async (documentId) => {
    // Prevent double polling for same ID
    if (activePolls.current.has(documentId)) return;
    // Don't poll deleted documents
    if (deletedDocs.current.has(documentId)) return;

    activePolls.current.add(documentId);

    const check = async () => {
      // Check if document was deleted before attempting to fetch
      if (deletedDocs.current.has(documentId)) {
        activePolls.current.delete(documentId);
        return;
      }

      try {
        const res = await getDocumentStatus(documentId);
        
        const { status, stage, progress, total_stages } = res.data;
        const total = total_stages || DEFAULT_TOTAL_STAGES;
        const message = progress?.message || prettyStatusText(status);

        let percent = 0;
        if (stage && total) {
            percent = Math.round((stage / total) * 100);
        }

        setProgressMap((prev) => ({
          ...prev,
          [documentId]: {
            status,
            stage,
            message,
            percent,
            total
          },
        }));

        const isFinal = isFinalStatus(status);
        
        if (!isFinal) {
          // Continue polling every 5 seconds until final status is reached
          setTimeout(check, 5000); 
        } else {
          // Stop polling once final status is reached
          activePolls.current.delete(documentId);
          // If completed, refresh the list to ensure metadata is synced
          if (status === "completed") fetchDocuments(page); 
        }
      } catch (error) {
        console.error(`Error checking status for ${documentId}`, error);
        // On error, stop polling (don't retry indefinitely)
        activePolls.current.delete(documentId);
      }
    };

    check();
  };

  const handleFileSelect = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file: file,
        strategy: "fast"
      }));
      setStagedFiles(prev => [...prev, ...newFiles]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeStagedFile = (id) => {
    setStagedFiles(prev => prev.filter(f => f.id !== id));
  };

  const updateStagedStrategy = (id, strategy) => {
    setStagedFiles(prev => prev.map(f => f.id === id ? { ...f, strategy } : f));
  };

  const handleUploadAll = async () => {
    if (stagedFiles.length === 0) return;
    setIsUploading(true);

    const fastFiles = stagedFiles.filter(f => f.strategy === "fast").map(f => f.file);
    const accurateFiles = stagedFiles.filter(f => f.strategy === "accurate").map(f => f.file);
    const uploadPromises = [];

    try {
      if (fastFiles.length > 0) {
        const formData = new FormData();
        fastFiles.forEach(file => formData.append("files", file));
        formData.append("parsing_strategy", "fast");
        uploadPromises.push(uploadDocuments(formData));
      }

      if (accurateFiles.length > 0) {
        const formData = new FormData();
        accurateFiles.forEach(file => formData.append("files", file));
        formData.append("parsing_strategy", "accurate");
        uploadPromises.push(uploadDocuments(formData));
      }

      const responses = await Promise.all(uploadPromises);
      
      responses.forEach(res => {
        if (res.data.documents) {
          res.data.documents.forEach(doc => pollStatus(doc.document_id));
        }
      });

      setStagedFiles([]);
      fetchDocuments(1); 
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this document?")) return;
    
    // Mark as deleted before API call to prevent polling
    deletedDocs.current.add(id);
    activePolls.current.delete(id);
    
    try {
      await deleteDocument(id);
      fetchDocuments(page);
    } catch (error) {
      console.error("Delete failed", error);
      // Remove from deleted set if deletion failed
      deletedDocs.current.delete(id);
    }
  };

  const renderStatus = (docId) => {
    const info = progressMap[docId];

    if (!info) {
      // If no progress info but doc exists, try to show doc.status if available in parent
      const doc = documents.find(d => d._id === docId);
      if (doc && isFinalStatus(doc.status)) {
         // It's done, just waiting for poll update or map sync
         return (
            <div className={`flex items-center gap-1.5 text-xs font-medium ${doc.status === 'completed' ? 'text-green-600' : 'text-red-600'}`}>
                {doc.status === 'completed' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                <span>{prettyStatusText(doc.status)}</span>
            </div>
         );
      }

      return (
        <div className="flex items-center gap-1.5 text-gray-400 text-xs">
          <Loader2 size={12} className="animate-spin" />
          <span>Initializing...</span>
        </div>
      );
    }

    const s = (info.status || "").toLowerCase();
    const isReady = s.includes("completed") || s.includes("ready");
    const isFailed = s.includes("fail") || s.includes("error");

    if (isReady) {
      return (
        <div className="flex items-center gap-1.5 text-green-600 text-xs font-medium">
          <CheckCircle size={12} />
          <span>{info.message || "Completed"}</span>
        </div>
      );
    }

    if (isFailed) {
      return (
        <div className="flex items-center gap-1.5 text-red-600 text-xs font-medium">
          <AlertCircle size={12} />
          <span>Failed</span>
        </div>
      );
    }

    return (
      <div className="flex items-start gap-2 text-blue-600 text-xs font-medium">
        <Loader2 size={12} className="animate-spin shrink-0 mt-0.5" />
        <span className="leading-tight">{info.message}</span>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
            <p className="text-gray-500 mt-1">Upload files, select parsing options, and track progress.</p>
          </div>

          {/* 📤 DROPZONE AREA */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors relative cursor-pointer group">
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center pointer-events-none group-hover:scale-105 transition-transform">
                  <div className="bg-blue-50 p-4 rounded-full mb-4">
                    <UploadCloud size={32} className="text-blue-600" />
                  </div>
                  <p className="text-lg font-medium text-gray-900">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500 mt-1">PDF, DOCX, TXT supported</p>
                </div>
              </div>
            </div>
          </div>

          {/* 📋 STAGING AREA */}
          {stagedFiles.length > 0 && (
            <div className="bg-gray-50 border-t border-gray-100 p-6 animate-in slide-in-from-top-2">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
                Ready to Upload ({stagedFiles.length})
              </h3>
              
              <div className="space-y-3 mb-6">
                {stagedFiles.map((item) => (
                  <div key={item.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="bg-gray-100 p-2 rounded">
                        <FileText size={20} className="text-gray-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]" title={item.file.name}>
                        {item.file.name}
                      </span>
                      <span className="text-xs text-gray-400">{(item.file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => updateStagedStrategy(item.id, "fast")}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                            item.strategy === "fast" ? "bg-white text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          <Zap size={12} fill={item.strategy === "fast" ? "currentColor" : "none"} /> Deterministic
                        </button>
                        <button
                          onClick={() => updateStagedStrategy(item.id, "accurate")}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                            item.strategy === "accurate" ? "bg-white text-purple-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          <Search size={12} /> IBM Docling
                        </button>
                      </div>
                      <button onClick={() => removeStagedFile(item.id)} className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors">
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleUploadAll}
                  disabled={isUploading}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isUploading ? <><Loader2 size={16} className="animate-spin" /> Uploading...</> : <><UploadCloud size={16} /> Upload All Files</>}
                </button>
              </div>
            </div>
          )}

          {/* 📂 UPLOADED DOCUMENTS LIST */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-semibold text-gray-800">Your Documents</h2>
            </div>

            {documents.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center text-gray-500">
                <FileText size={48} className="text-gray-300 mb-4" />
                <h3 className="text-gray-900 font-medium">No documents yet</h3>
                <p className="text-sm mt-1">Uploaded files will appear here.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {documents.map((doc) => (
                  <li key={doc._id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-100 text-gray-600`}>
                        <FileText size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <p className="font-medium text-gray-900 truncate pr-4">{doc.filename}</p>
                        </div>
                        {/* Render Status Badge */}
                        <div className="mt-2">
                          {renderStatus(doc._id)}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(doc._id)}
                      className="p-2 ml-4 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Document"
                    >
                      <Trash2 size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Pagination */}
            {documents.length > 0 && (
              <div className="bg-gray-50 p-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 transition">Previous</button>
                  <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 transition">Next</button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}