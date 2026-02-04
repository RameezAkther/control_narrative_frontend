import React, { useEffect, useRef } from "react";
import { FileText, Database, Cpu, Layers } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function ChatWindow({ messages = [], isTyping }) {
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const CodeBlock = ({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || "");
    return !inline && match ? (
      <SyntaxHighlighter language={match[1]} style={vscDarkPlus} PreTag="div" {...props}>
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <code className="bg-gray-100 rounded px-1 py-0.5 text-sm">{children}</code>
    );
  };

  const LinkComp = ({ href, children, ...props }) => (
    <a href={href} target="_blank" rel="noreferrer noopener" className="text-blue-600 hover:underline" {...props}>
      {children}
    </a>
  );

  const ImgComp = ({ src, alt, ...props }) => (
    <img src={src} alt={alt} className="max-w-full rounded" {...props} />
  );

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
              <div className="text-sm">
                {m.role === 'assistant' ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock, a: LinkComp, img: ImgComp }}>
                    {m.text || ""}
                  </ReactMarkdown>
                ) : (
                  <div className="whitespace-pre-wrap">{m.text}</div>
                )}
              </div>
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

                {/* 4. Context Tooltip (Updated to show full content) */}
                {m.citations && m.citations.length > 0 && (
                    <div className="relative group">
                        <button className="text-[10px] flex items-center gap-1 text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded hover:bg-blue-100 transition-colors">
                            <Database size={10} />
                            View Context
                        </button>
                        
                        {/* Tooltip Content */}
                        {/* CHANGE: Increased width (w-96) and z-index to ensure visibility */}
                        <div className="absolute bottom-6 left-0 w-96 bg-gray-900 text-white text-xs rounded-md shadow-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[60]">
                            <div className="font-bold mb-2 pb-1 border-b border-gray-700 flex justify-between">
                                <span>Retrieved Context</span>
                                <span className="text-gray-400 font-normal">{m.citations.length} chunks</span>
                            </div>
                            
                            {/* CHANGE: Increased max-height (max-h-64) for better scrolling view */}
                            <div className="max-h-64 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                                {m.citations.map((cit, idx) => (
                                    <div key={idx} className="space-y-1">
                                        <div className="font-mono text-[10px] text-blue-300">
                                            Source: {cit.source?.split('/').pop()} (Page {cit.page})
                                        </div>
                                        {/* CHANGE: Removed slice(), added whitespace-pre-wrap to preserve formatting */}
                                        <div className="text-gray-300 italic pl-2 border-l-2 border-blue-500 whitespace-pre-wrap">
                                            "{cit.content}"
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