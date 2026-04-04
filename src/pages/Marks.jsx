import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SCHOOL_CLASSES, SCHOOL_SECTIONS } from '../utils/constants';
import Layout from '../components/Layout';

const MARKS_API_URL = 'https://edusync.up.railway.app/api/marks';

const Marks = ({ role }) => {
    const [marks, setMarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [filters, setFilters] = useState({
        class: '',
        section: '',
        subject: '',
        examType: 'Mid Term'
    });

    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();
    }, []);

    const fetchMarks = async () => {
        setLoading(true);
        try {
            const params = {
                class: filters.class || undefined,
                section: filters.section || undefined,
                subject: filters.subject || undefined,
                exam_type: filters.examType
            };
            const res = await axios.get(MARKS_API_URL, { params });
            setMarks(res.data);
        } catch (err) {
            console.error('Error fetching marks:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMarks();
    }, [filters.class, filters.section, filters.subject, filters.examType]);

    return (
        <Layout role={role}>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight m-0 uppercase italic">Performance</h1>
                        <p className="text-sm md:text-base text-slate-500 mt-1 font-medium italic">"Precision in evaluation, excellence in education."</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 md:p-6 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Exam Type</label>
                        <select 
                            className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-900 outline-none cursor-pointer"
                            value={filters.examType}
                            onChange={(e) => setFilters({...filters, examType: e.target.value})}
                        >
                            <option>Mid Term</option>
                            <option>Final Exam</option>
                            <option>Unit Test</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Class</label>
                        <select 
                            className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-900 outline-none cursor-pointer"
                            value={filters.class}
                            onChange={(e) => setFilters({...filters, class: e.target.value})}
                        >
                            <option value="">All Classes</option>
                            {SCHOOL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Section</label>
                        <select 
                            className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-900 outline-none cursor-pointer"
                            value={filters.section}
                            onChange={(e) => setFilters({...filters, section: e.target.value})}
                        >
                            <option value="">All Sections</option>
                            {SCHOOL_SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Subject</label>
                        <input 
                            type="text"
                            placeholder="Search subject..."
                            className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-900 outline-none"
                            value={filters.subject}
                            onChange={(e) => setFilters({...filters, subject: e.target.value})}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-bottom border-slate-100">
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Exam</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Grade</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">Syncing academic records...</td></tr>
                                ) : marks.length === 0 ? (
                                    <tr><td colSpan="5" className="px-6 py-20 text-center text-slate-400 font-bold tracking-tight">No institutional records found.</td></tr>
                                ) : (
                                    marks.map(r => (
                                        <tr key={r.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase">{r.student_name}</div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-tight">{r.exam_type}</td>
                                            <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-tight">{r.subject}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-black text-slate-900">{r.marks_obtained}</span>
                                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">/ {r.total_marks}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                                    {r.grade}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile/Tablet Card View */}
                    <div className="md:hidden divide-y divide-slate-100">
                        {loading ? (
                            <div className="p-8 text-center text-slate-400 italic font-medium">Syncing results...</div>
                        ) : marks.length === 0 ? (
                            <div className="p-10 text-center text-slate-400 font-bold">No records matched filters.</div>
                        ) : (
                            marks.map(r => (
                                <div key={r.id} className="p-5 space-y-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-none">{r.student_name}</h4>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-black uppercase tracking-widest">{r.exam_type}</span>
                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-black uppercase tracking-widest">{r.subject}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest border border-blue-100 shadow-sm shadow-blue-100/50">
                                                {r.grade}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-slate-400 text-lg">fact_check</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Achieved Score</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-base font-black text-slate-900">{r.marks_obtained}</span>
                                            <span className="text-[11px] font-bold text-slate-300">/ {r.total_marks}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Marks;

