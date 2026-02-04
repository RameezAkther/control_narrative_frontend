import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";
import RightSidebar from "../components/RightSidebar";
import { createChat, sendMessage, getChats, getChatMessages } from "../api/chat";
import { PlusCircle } from "lucide-react";

export default function ChatPage() {
  const [mode, setMode] = useState("RAG");
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chats, setChats] = useState([]);
  
  const [selectedDocs, setSelectedDocs] = useState(new Set());
  const [selectedContextIds, setSelectedContextIds] = useState(new Set());
  const [selectedArtifacts, setSelectedArtifacts] = useState(new Set());

  const scrollRef = useRef(null);

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
     if (messages.length >= 2) {
        const lastMsg = messages[messages.length - 1];
        const prevMsg = messages[messages.length - 2];
        if (lastMsg.role === 'assistant' && prevMsg.role === 'user') {
            setSelectedContextIds(prev => new Set(prev).add(prevMsg.id));
        }
     }
  }, [messages]);

  useEffect(() => {
      if (selectedDocs.size !== 1) {
          setSelectedArtifacts(new Set());
      }
  }, [selectedDocs.size]);

  const loadChats = async () => {
    try {
      const res = await getChats();
      setChats(res.data || []);
    } catch (e) {
      console.error("Failed to load chats", e);
    }
  };

  const resetSession = () => {
      setChatId(null);
      setMessages([]);
      setSelectedContextIds(new Set());
      setSelectedArtifacts(new Set());
  };

  const handleCreateNewChat = async () => {
    if (messages.length > 0) {
        resetSession();
    }
  };

const handleLoadChat = async (id) => {
     try {
         setChatId(id);
         const res = await getChatMessages(id);
         
         const loadedMessages = res.data.map(m => ({
             ...m,
             id: m.id || m._id, 
             text: m.content,
             citations: m.citations || [],
             docCount: m.document_ids?.length || 0,
             mode: m.mode || "RAG"
         }));
         setMessages(loadedMessages);
         setSelectedContextIds(new Set());
     } catch (e) {
         console.error("Failed to load chat history", e);
     }
  };

 const handleSend = async (text) => {
    if (!text.trim()) return;
    
    let currentChatId = chatId;
    
    if (!currentChatId) {
        try {
            const res = await createChat({ 
                name: text.slice(0, 30), 
                mode, 
                document_ids: Array.from(selectedDocs) 
            });
            currentChatId = res.data._id || res.data.id; 
            setChatId(currentChatId);
            setChats(prev => [res.data, ...prev]);
        } catch(e) {
            console.error("Failed to init chat", e);
            return;
        }
    }
const userMsg = { id: Math.random().toString(36).slice(2), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const safeContextIds = Array.from(selectedContextIds).filter(id => id);

      const payload = {
        message: text,
        mode,
        document_ids: Array.from(selectedDocs),
        active_context_ids: safeContextIds,
        artifacts: Array.from(selectedArtifacts) 
      };

      const res = await sendMessage(currentChatId, payload);
      
      const assistant = { 
          id: res.data._id || Math.random().toString(36).slice(2), 
          role: 'assistant', 
          text: res.data.content || 'Response...',
          mode: mode,
          docCount: selectedDocs.size,
          ctxCount: safeContextIds.length,
          artifacts: Array.from(selectedArtifacts),
          citations: res.data.citations || []
      };

      setMessages(prev => [...prev, assistant]);
    } catch (e) {
      console.error("Send failed", e);
      setMessages(prev => [...prev, { id: Math.random(), role: 'assistant', text: "Error: failed to get response" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10">
            <div>
                <h2 className="text-xl font-semibold text-gray-800">Chat with Documents</h2>
                {chatId && <div className="text-xs text-gray-400">Session: {chatId}</div>}
            </div>
            
            {messages.length > 0 && (
                <button 
                    onClick={handleCreateNewChat}
                    className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm transition-all shadow-sm"
                >
                    <PlusCircle size={16} />
                    <span>New Chat</span>
                </button>
            )}
        </header>

        <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0 bg-white">
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <ChatWindow messages={messages} isTyping={isTyping} />
                    <div ref={scrollRef} />
                </div>
                
                <div className="shrink-0">
                    <MessageInput 
                        onSend={handleSend} 
                        disabled={isTyping} 
                        mode={mode} 
                        setMode={setMode}
                        selectedDocsCount={selectedDocs.size} 
                        selectedContextCount={selectedContextIds.size}
                        // New Props
                        selectedArtifacts={selectedArtifacts}
                        setSelectedArtifacts={setSelectedArtifacts}
                    />
                </div>
            </div>

            <div className="w-80 border-l border-gray-200 bg-white shrink-0">
                <RightSidebar
                    chats={chats}
                    currentMessages={messages}
                    selectedDocs={selectedDocs}
                    setSelectedDocs={setSelectedDocs}
                    selectedContextIds={selectedContextIds}
                    setSelectedContextIds={setSelectedContextIds}
                    onLoadChat={handleLoadChat}
                    onRefreshChats={loadChats}
                />
            </div>
        </div>
      </main>
    </div>
  );
}