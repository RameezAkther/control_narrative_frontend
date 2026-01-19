import React, { useEffect, useRef } from "react";
import { FileText, Database, Cpu, Layers } from "lucide-react";

export default function ChatWindow({ messages = [], isTyping }) {
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="h-[56vh] overflow-y-auto p-2" ref={listRef}>
      {messages.length === 0 && (
        <div className="text-center text-gray-400 mt-8 text-sm">No messages yet — start the conversation.</div>
      )}

      <div className="space-y-6">
        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.role === 'assistant' ? 'items-start' : 'items-end'}`}>
            
            {/* Message Bubble */}
            <div className={`max-w-[80%] p-3 rounded-lg shadow-sm ${m.role === 'assistant' ? 'bg-white border border-gray-100 text-gray-800' : 'bg-blue-600 text-white'}`}>
              <div className="whitespace-pre-wrap text-sm">{m.text}</div>
            </div>

            {/* Metadata Footer (Only for Assistant) */}
            {m.role === 'assistant' && (
              <div className="mt-1 ml-1 flex flex-wrap items-center gap-2">
                
                {/* 1. Mode Badge */}
                <span className="text-[10px] font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200 uppercase">
                    {m.mode || "RAG"}
                </span>

                {/* 2. Stats Badges */}
                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <span className="flex items-center gap-0.5"><FileText size={10}/> {m.docCount || 0}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5"><Layers size={10}/> {m.ctxCount || 0}</span>
                </div>

                {/* 3. Artifact Badges (Logic, Loop Map etc) */}
                {m.artifacts && m.artifacts.length > 0 && (
                    <div className="flex gap-1">
                        {m.artifacts.map(art => (
                            <span key={art} className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100">
                                {art}
                            </span>
                        ))}
                    </div>
                )}

                {/* 4. Context Tooltip (Hover to see retrieved chunks) */}
                {m.citations && m.citations.length > 0 && (
                    <div className="relative group">
                        <button className="text-[10px] flex items-center gap-1 text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded hover:bg-blue-100 transition-colors">
                            <Database size={10} />
                            View Context
                        </button>
                        
                        {/* Tooltip Content */}
                        <div className="absolute bottom-6 left-0 w-80 bg-gray-900 text-white text-xs rounded-md shadow-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            <div className="font-bold mb-2 pb-1 border-b border-gray-700">Retrieved Context ({m.citations.length} chunks)</div>
                            <div className="max-h-48 overflow-y-auto space-y-3 custom-scrollbar">
                                {m.citations.map((cit, idx) => (
                                    <div key={idx} className="space-y-1">
                                        <div className="font-mono text-[10px] text-gray-400">
                                            Source: {cit.source?.split('/').pop()} (Page {cit.page})
                                        </div>
                                        <div className="text-gray-300 italic pl-2 border-l-2 border-blue-500">
                                            "{cit.content.slice(0, 150)}..."
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-[50%] p-3 rounded-lg bg-gray-50 border border-gray-100 text-gray-500 text-sm flex items-center gap-2">
              <Cpu size={14} className="animate-spin" />
              <span>Analyzing documents...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}