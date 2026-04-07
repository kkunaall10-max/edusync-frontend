import React, { useState, useEffect } from 'react';
import apiClient from '../utils/api';

const AISidebar = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState([]);
  const [error, setError] = useState(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      // Logic: Cache insights in sessionStorage for the session to prevent repeated API calls
      const cached = sessionStorage.getItem('ai_insights');
      if (cached && !isOpen) { // Only use cache if we are just opening, not refreshing
         setInsights(JSON.parse(cached));
         setLoading(false);
         return;
      }

      const res = await apiClient.post('/ai/insights');
      if (res.data.success) {
        setInsights(res.data.data.insights);
        sessionStorage.setItem('ai_insights', JSON.stringify(res.data.data.insights));
      }
    } catch (err) {
      console.error("AI Fetch Error:", err);
      setError("Failed to generate brain snippets. Verify your Groq connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const cached = sessionStorage.getItem('ai_insights');
      if (cached) {
        setInsights(JSON.parse(cached));
      } else {
        fetchInsights();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] transition-opacity"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white/80 backdrop-blur-2xl z-[101] shadow-2xl border-l border-white/20 flex flex-col transform transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
               <span className="material-symbols-outlined text-2xl">psychology</span>
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 leading-none">Smart Insights</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">AI-Powered Advisor</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-colors"
          >
            <span className="material-symbols-outlined text-slate-400 text-xl font-black">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse flex items-center px-4 gap-4">
                  <div className="w-2 h-2 bg-slate-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-200 rounded-full w-3/4" />
                    <div className="h-2 bg-slate-200 rounded-full w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="py-20 text-center">
               <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500">
                  <span className="material-symbols-outlined text-4xl">cloud_off</span>
               </div>
               <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{error}</p>
               <button 
                onClick={fetchInsights}
                className="mt-6 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors"
               >
                 Retry Analysis
               </button>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.map((insight, idx) => (
                <div 
                  key={idx} 
                  className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="text-sm font-medium text-slate-700 leading-relaxed m-0 flex gap-3 italic">
                    <span className="text-indigo-500 font-black">•</span>
                    {insight}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <button 
            disabled={loading}
            onClick={fetchInsights}
            className="w-100 w-full py-4 bg-indigo-600 text-white rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all font-black text-sm uppercase tracking-widest disabled:opacity-50"
          >
            {loading ? (
               <span className="animate-spin material-symbols-outlined">sync</span>
            ) : (
               <span className="material-symbols-outlined">auto_awesome</span>
            )}
            Refresh Analysis
          </button>
          <p className="text-[10px] text-center text-slate-400 mt-4 font-bold uppercase tracking-wider">
            Processed by Llama-3-Agent • Real-time Data Sync
          </p>
        </div>
      </div>
    </>
  );
};

export default AISidebar;
