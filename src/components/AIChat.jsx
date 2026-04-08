import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../utils/api';

const AIChat = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Good morning, Principal. I have processed the latest school data. How can I assist you in your decision-making today?' }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (text = input) => {
    const messageText = typeof text === 'string' ? text : input;
    if (!messageText.trim() || loading) return;

    const userMessage = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Logic: Only send last 6 messages to save tokens/cost
      const historyForAI = messages.slice(-6).map(m => ({ 
        role: m.role, 
        content: m.content 
      }));

      const res = await apiClient.post('/ai/chat', { 
        message: messageText,
        history: historyForAI
      });

      if (res.data.success) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: res.data.data.answer 
        }]);
      }
    } catch (err) {
      console.error("AI Chat Error:", err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm having trouble connecting to the school's intelligence core. Please check back shortly." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const quickActions = [
    "Show weak students",
    "Current fee status",
    "Attendance trends"
  ];

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110]"
        onClick={onClose}
      />
      
      <div className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white/95 backdrop-blur-2xl z-[111] shadow-2xl flex flex-col border-l border-white/20 transform transition-all duration-500">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white shadow-lg">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center border border-white/30">
               <span className="material-symbols-outlined text-3xl">smart_toy</span>
             </div>
             <div>
               <h3 className="text-xl font-black tracking-tight leading-none">EduSync Intelligence</h3>
               <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Principal Assistant Online</span>
               </div>
             </div>
          </div>
          <button onClick={onClose} className="hover:rotate-90 transition-transform">
            <span className="material-symbols-outlined text-white font-black text-2xl">close</span>
          </button>
        </div>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-3xl shadow-sm ${
                m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none'
              }`}>
                <p className="text-sm font-medium leading-relaxed m-0 whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-3xl shadow-sm flex gap-1">
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
              </div>
            </div>
          )}
        </div>

        {/* Interaction Area */}
        <div className="p-6 bg-white border-t border-slate-100 shadow-up">
          {/* Quick Actions */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
             {quickActions.map(action => (
               <button 
                key={action}
                onClick={() => handleSend(action)}
                className="whitespace-nowrap px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-[11px] font-black text-slate-600 uppercase tracking-wider hover:bg-indigo-50 hover:border-indigo-200 transition-all active:scale-95"
               >
                 {action}
               </button>
             ))}
          </div>

          <div className="relative">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything about students, fees, or attendance..."
              className="w-full pl-6 pr-16 py-4 bg-slate-100 border-none rounded-2xl text-sm font-bold placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="absolute right-2 top-2 w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined font-black">send</span>
            </button>
          </div>
          <p className="text-[10px] text-center text-slate-400 mt-4 font-bold uppercase tracking-widest">
            POWERED BY EDUSYNC PRIVATE AI (LOCAL SERVER)
          </p>
        </div>
      </div>
    </>
  );
};

export default AIChat;
