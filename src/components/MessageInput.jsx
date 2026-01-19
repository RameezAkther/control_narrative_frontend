import React, { useState } from "react";
import { Send, ChevronDown, CheckSquare, Square } from "lucide-react";

const MODES = [
  { key: "RAG", label: "RAG", desc: "Retrieve & answer from docs" },
  { key: "ReACT", label: "ReACT", desc: "Act + reason chains" },
  { key: "Flare", label: "Flare", desc: "Generative mode" },
];

const ARTIFACT_OPTIONS = ["Logic Extracted", "Loop Map", "Validation", "PLC Code"];

export default function MessageInput({ 
  onSend, 
  disabled, 
  mode, 
  setMode, 
  selectedDocsCount, 
  selectedContextCount,
  selectedArtifacts,      // New Prop
  setSelectedArtifacts    // New Prop
}) {
  const [text, setText] = useState("");

  // Constraint: Only active if exactly 1 doc is selected
  const areArtifactsEnabled = selectedDocsCount === 1;

  const toggleArtifact = (artifact) => {
    if (!areArtifactsEnabled) return;
    const copy = new Set(selectedArtifacts);
    if (copy.has(artifact)) copy.delete(artifact);
    else copy.add(artifact);
    setSelectedArtifacts(copy);
  };

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <div className="border-t border-gray-100 p-3 bg-white">
      {/* Info Bar & Artifact Selectors */}
      <div className="flex flex-wrap items-center gap-4 mb-3 px-1">
        {/* Counts */}
        <div className="flex items-center gap-3 border-r border-gray-200 pr-3">
            <div className="text-xs text-gray-500 flex items-center gap-1">
            <span className="font-medium text-blue-600">{selectedDocsCount}</span> Docs
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
                <span className="font-medium text-purple-600">{selectedContextCount}</span> Context
            </div>
        </div>

        {/* Artifact Options */}
        <div className="flex items-center gap-2">
            {ARTIFACT_OPTIONS.map(opt => {
                const isSelected = selectedArtifacts.has(opt);
                return (
                    <button
                        key={opt}
                        onClick={() => toggleArtifact(opt)}
                        disabled={!areArtifactsEnabled}
                        className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded flex items-center gap-1.5 border transition-all
                            ${!areArtifactsEnabled 
                                ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed' 
                                : isSelected 
                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        {areArtifactsEnabled && isSelected ? <CheckSquare size={10} /> : <Square size={10} />}
                        {opt}
                    </button>
                );
            })}
        </div>
      </div>

      <div className="flex gap-2 items-end">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
             if(e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
             }
          }}
          rows={2}
          className="flex-1 p-3 rounded-lg border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
          placeholder="Ask a question about your documents..."
        />

        <div className="flex flex-col gap-2 shrink-0">
          {/* Model Selection */}
          <div className="relative">
            <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="appearance-none w-full bg-gray-50 border border-gray-200 text-gray-700 text-xs font-medium py-2 pl-3 pr-8 rounded-md cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
                {MODES.map((m) => (
                    <option key={m.key} value={m.key}>{m.label}</option>
                ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          <button 
            onClick={handleSend} 
            disabled={disabled || !text.trim()} 
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 transition-colors h-[38px]"
          >
            <Send size={16} />
            <span className="text-sm font-medium">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}