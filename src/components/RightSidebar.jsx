import React, { useEffect, useState, useMemo } from "react";
import { getDocuments } from "../api/documents";
import { updateChatName, deleteChat } from "../api/chat"; // Import API
import { Trash2, Edit2, Check, X } from "lucide-react"; // Import Icons

export default function RightSidebar({ 
  chats = [], 
  currentMessages = [],
  selectedDocs, 
  setSelectedDocs, 
  selectedContextIds, 
  setSelectedContextIds,
  onLoadChat,
  onRefreshChats // <--- NEW PROP: Callback to reload chat list
}) {
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  
  // State for renaming
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await getDocuments(1);
        setDocuments(res.data.documents || []);
      } catch (e) {
        console.error("Failed to load documents", e);
      } finally {
        setLoadingDocs(false);
      }
    })();
  }, []);

  // --- Context Logic ---
  const messagePairs = useMemo(() => {
    const pairs = [];
    for (let i = 0; i < currentMessages.length; i++) {
        const msg = currentMessages[i];
        if (msg.role === 'user') {
            const response = currentMessages[i+1]?.role === 'assistant' ? currentMessages[i+1] : null;
            if (response) {
                pairs.push({ user: msg, assistant: response, id: msg.id });
            }
        }
    }
    return pairs;
  }, [currentMessages]);

  const toggleDoc = (id) => {
    const copy = new Set(selectedDocs);
    if (copy.has(id)) copy.delete(id);
    else copy.add(id);
    setSelectedDocs(copy);
  };

  const toggleContextPair = (id) => {
    const copy = new Set(selectedContextIds);
    if (copy.has(id)) copy.delete(id);
    else copy.add(id);
    setSelectedContextIds(copy);
  };

  // --- Chat Management Handlers ---

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Prevent triggering onLoadChat
    if (!window.confirm("Are you sure you want to delete this chat?")) return;

    try {
        await deleteChat(id);
        if (onRefreshChats) onRefreshChats(); // Reload list
    } catch (err) {
        console.error("Failed to delete chat", err);
    }
  };

  const startEdit = (e, chat) => {
    e.stopPropagation();
    setEditingId(chat._id || chat.id);
    setEditName(chat.name);
  };

  const cancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
    setEditName("");
  };

  const saveEdit = async (e) => {
    e.stopPropagation();
    if (!editName.trim()) return;
    
    try {
        await updateChatName(editingId, editName);
        setEditingId(null);
        if (onRefreshChats) onRefreshChats(); // Reload list
    } catch (err) {
        console.error("Failed to update name", err);
    }
  };

  return (
    <div className="p-4 h-full flex flex-col gap-6 overflow-y-auto bg-white border-l border-gray-200">
      
      {/* Section 1: Chat History */}
      <div>
        <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-bold text-gray-800">Previous Chats</div>
        </div>
        
        <div className="space-y-1 text-sm max-h-40 overflow-y-auto custom-scrollbar pr-1">
          {chats.length === 0 ? <div className="text-gray-400 italic text-xs">No history</div> : chats.map(c => {
            const actualId = c._id || c.id;
            const isEditing = editingId === actualId;
            
            return (
                <div 
                    key={actualId} 
                    onClick={() => !isEditing && onLoadChat(actualId)}
                    className={`group flex items-center justify-between p-2 rounded cursor-pointer transition-all ${isEditing ? 'bg-blue-50 ring-1 ring-blue-100' : 'hover:bg-gray-100'}`}
                >
                    {isEditing ? (
                        <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                            <input 
                                autoFocus
                                type="text" 
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter') saveEdit(e);
                                    if(e.key === 'Escape') cancelEdit(e);
                                }}
                                className="flex-1 min-w-0 bg-white border border-gray-300 rounded px-1 py-0.5 text-xs focus:outline-none focus:border-blue-500"
                            />
                            <button onClick={saveEdit} className="text-green-600 hover:bg-green-100 p-1 rounded"><Check size={12} /></button>
                            <button onClick={cancelEdit} className="text-red-500 hover:bg-red-100 p-1 rounded"><X size={12} /></button>
                        </div>
                    ) : (
                        <>
                            <div className="truncate text-gray-700 flex-1 mr-2" title={c.name}>
                                {c.name || `Chat ${actualId.slice(-4)}`}
                            </div>
                            
                            {/* Actions (Visible on Hover) */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={(e) => startEdit(e, c)}
                                    className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-1 rounded"
                                    title="Rename"
                                >
                                    <Edit2 size={12} />
                                </button>
                                <button 
                                    onClick={(e) => handleDelete(e, actualId)}
                                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1 rounded"
                                    title="Delete"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            );
          })}
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Section 2: Active Context */}
      <div>
        <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-bold text-gray-800">Conversation Context</div>
            <span className="text-xs text-gray-400" title="Select pairs to include in memory">{selectedContextIds.size} selected</span>
        </div>
        
        {messagePairs.length === 0 ? (
            <div className="text-gray-400 italic text-xs bg-gray-50 p-3 rounded-md border border-dashed border-gray-200">
                Start chatting to build context.
            </div>
        ) : (
            <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1 custom-scrollbar">
                {messagePairs.map(pair => (
                    <label 
                        key={pair.id} 
                        className={`flex gap-2 p-2 rounded-md border text-xs cursor-pointer transition-all ${selectedContextIds.has(pair.id) ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100 hover:border-gray-300'}`}
                    >
                        <input 
                            type="checkbox" 
                            className="mt-1"
                            checked={selectedContextIds.has(pair.id)} 
                            onChange={() => toggleContextPair(pair.id)} 
                        />
                        <div className="flex-1 overflow-hidden">
                            <div className="font-semibold text-gray-700 truncate">Q: {pair.user.text}</div>
                            <div className="text-gray-500 truncate">A: {pair.assistant.text}</div>
                        </div>
                    </label>
                ))}
            </div>
        )}
      </div>

      <hr className="border-gray-100" />

      {/* Section 3: Documents */}
      <div>
        <div className="text-sm font-bold text-gray-800 mb-3">Knowledge Base</div>
        {loadingDocs ? (
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse" />
          </div>
        ) : (
          <div className="space-y-2 text-sm max-h-[30vh] overflow-y-auto custom-scrollbar">
            {documents.map(d => (
              <label key={d._id} className="flex items-center gap-2 cursor-pointer group">
                <input 
                    type="checkbox" 
                    className="rounded text-blue-600 focus:ring-blue-500"
                    checked={selectedDocs.has(d._id)} 
                    onChange={() => toggleDoc(d._id)} 
                />
                <span className={`truncate transition-colors ${selectedDocs.has(d._id) ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                    {d.filename}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}