import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { SCHOOL_CLASSES, SCHOOL_SECTIONS } from '../utils/constants';
import Layout from '../components/Layout';
import { 
  BookOpen, Search, Filter, Plus, Calendar, 
  ChevronRight, ArrowRight, Download, Trash2, Edit
} from 'lucide-react';

const API_BASE = 'https://edusync.up.railway.app/api';

const Homework = () => {
    const [loading, setLoading] = useState(true);
    const [homework, setHomework] = useState([]);
    const [filters, setFilters] = useState({
        class: SCHOOL_CLASSES[4], // Default to Class 5
        section: SCHOOL_SECTIONS[0],
        subject: ''
    });

    const fetchHomework = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/homework`, { 
                params: { 
                    class: filters.class, 
                    section: filters.section,
                    subject: filters.subject 
                } 
            });
            setHomework(res.data);
        } catch (err) {
            console.error('Error fetching homework:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHomework();
    }, [filters.class, filters.section, filters.subject]);

    const exportCSV = () => {
        const headers = ['Title', 'Subject', 'Class', 'Section', 'Due Date', 'Description'];
        const rows = homework.map(h => [
            h.title, h.subject, h.class, h.section, new Date(h.due_date).toLocaleDateString(), h.description
        ]);
        const csv = [headers, ...rows]
            .map(r => r.join(','))
            .join('\n');
        const blob = new Blob([csv], {type:'text/csv'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `homework-assignments.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Layout role="principal">
            <div className="space-y-8 animate-in fade-in duration-700">
                {/* Header section with Premium White UI */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Curriculum Assignments</h1>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1 italic">
                            Institutional Scholarly Task Management
                        </p>
                    </div>
                </div>

                {/* Filter Controls */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Class</label>
                        <select 
                            className="h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/10"
                            value={filters.class} 
                            onChange={(e) => setFilters({...filters, class: e.target.value})}
                        >
                            {SCHOOL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Section</label>
                        <select 
                            className="h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/10"
                            value={filters.section} 
                            onChange={(e) => setFilters({...filters, section: e.target.value})}
                        >
                            {SCHOOL_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Subject</label>
                        <input 
                            placeholder="All Subjects"
                            className="h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/10"
                            value={filters.subject} 
                            onChange={(e) => setFilters({...filters, subject: e.target.value})}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Report</label>
                        <button 
                            onClick={exportCSV}
                            className="h-12 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-[0.98]"
                        >
                            <Download size={14} /> Export Assignments
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full py-20 text-center">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compiling Curricula...</p>
                            </div>
                        </div>
                    ) : homework.length === 0 ? (
                        <div className="col-span-full py-20 bg-white rounded-[32px] border border-slate-100 text-center shadow-lg shadow-slate-200/40">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Zero tasks issued for this division</p>
                        </div>
                    ) : (
                        homework.map((hw) => (
                            <div key={hw.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all group border-b-4 border-b-blue-600">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black">
                                       <BookOpen size={20} />
                                    </div>
                                    <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        {hw.subject}
                                    </div>
                                </div>
                                
                                <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tighter truncate">{hw.title}</h3>
                                <p className="text-sm font-medium text-slate-500 line-clamp-3 mb-8 leading-relaxed italic border-l-2 border-slate-100 pl-4">
                                    {hw.description}
                                </p>
                                
                                <div className="space-y-4 pt-6 border-t border-slate-50">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submission Window</span>
                                        <div className="flex items-center gap-2 text-xs font-black text-rose-500">
                                            <Calendar size={12} />
                                            {new Date(hw.due_date).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Issued By</span>
                                        <span className="text-xs font-black text-slate-900">Faculty Member</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Homework;
