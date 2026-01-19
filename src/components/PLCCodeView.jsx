import React, { useState } from 'react';
import { 
  Terminal, 
  Copy, 
  Check, 
  FileCode, 
  Download 
} from "lucide-react";
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
// structured text is similar to pascal/vb for highlighting purposes if direct 'iecst' support varies
import delphi from "react-syntax-highlighter/dist/esm/languages/hljs/delphi";
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs'; // Dark theme

// Register language
SyntaxHighlighter.registerLanguage("iecst", delphi);

export default function PLCCodeView({ data }) {
  // Handle if data is raw string or wrapped object
  const codeContent = typeof data === 'string' ? data : (data?.code || JSON.stringify(data, null, 2));
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([codeContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated_plc_code.st';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (!codeContent) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed border-gray-300 text-gray-400">
        <FileCode size={48} className="mb-4 opacity-50" />
        <p>No PLC code generated.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1E1E1E] rounded-xl overflow-hidden shadow-lg border border-gray-700">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-b border-gray-700">
        <div className="flex items-center gap-2 text-gray-300">
          <Terminal size={16} className="text-blue-400" />
          <span className="text-sm font-mono font-medium">IEC 61131-3 (Structured Text)</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleDownload}
            className="p-2 hover:bg-gray-700 rounded-md text-gray-400 hover:text-white transition"
            title="Download .st file"
          >
            <Download size={16} />
          </button>
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-md transition"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy Code"}
          </button>
        </div>
      </div>

      {/* Code Editor View */}
      <div className="relative group">
        <SyntaxHighlighter 
          language="iecst" 
          style={vs2015} 
          showLineNumbers={true}
          wrapLines={true}
          customStyle={{
            margin: 0,
            padding: '1.5rem',
            fontSize: '0.9rem',
            lineHeight: '1.5',
            backgroundColor: '#1E1E1E', // Match container
            fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
          }}
        >
          {codeContent}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}