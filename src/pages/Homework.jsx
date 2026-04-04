import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SCHOOL_CLASSES, SCHOOL_SECTIONS } from '../utils/constants';
import Layout from '../components/Layout';

const API_BASE_URL = 'https://edusync.up.railway.app/api/homework';

const Homework = ({ role }) => {
    const [homework, setHomework] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [filters, setFilters] = useState({
        class: '',
        section: '',
        subject: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();
    }, []);

    const fetchHomework = async () => {
        setLoading(true);
        try {
            const params = {
                class: filters.class || undefined,
                section: filters.section || undefined,
                subject: filters.subject || undefined
            };
            const res = await axios.get(API_BASE_URL, { params });
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

    return (
        <Layout role={role}>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight m-0 uppercase">Homework</h1>
                        <p className="text-sm md:text-base text-slate-500 mt-1 font-medium italic">"Academic progress is measured in consistent effort."</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 md:p-6 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                            placeholder="Filter by Subject..."
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
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Issue Date</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Assignment Details</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Group</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-400 italic">Synchronizing logs...</td></tr>
                                ) : homework.length === 0 ? (
                                    <tr><td colSpan="4" className="px-6 py-20 text-center text-slate-400 font-bold">No assignments found for these filters.</td></tr>
                                ) : (
                                    homework.map(hw => (
                                        <tr key={hw.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-bold text-slate-500 whitespace-nowrap">{new Date(hw.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-black text-slate-900 tracking-tight">{hw.title}</div>
                                                <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{hw.description}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                    {hw.class} - {hw.section} • {hw.subject}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="text-[9px] font-black text-rose-300 uppercase tracking-widest mb-0.5">Deadline</div>
                                                <div className="text-xs font-black text-rose-600">{new Date(hw.due_date).toLocaleDateString()}</div>
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
                            <div className="p-8 text-center text-slate-400 italic font-medium">Syncing institutional records...</div>
                        ) : homework.length === 0 ? (
                            <div className="p-10 text-center text-slate-400 font-bold">No assignments matched filters.</div>
                        ) : (
                            homework.map(hw => (
                                <div key={hw.id} className="p-5 space-y-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <div className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase tracking-widest mb-2 border border-blue-100">
                                                {hw.class}-{hw.section} | {hw.subject}
                                            </div>
                                            <h4 className="text-sm font-black text-slate-900 leading-tight tracking-tight">{hw.title}</h4>
                                            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">{hw.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block">Issued</span>
                                            <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">{new Date(hw.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between bg-rose-50/50 p-3 rounded-xl border border-rose-100/50">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-rose-500 text-lg">event_busy</span>
                                            <span className="text-[10px] font-black text-rose-700 uppercase tracking-widest">Submission Deadline</span>
                                        </div>
                                        <span className="text-xs font-black text-rose-600">{new Date(hw.due_date).toLocaleDateString()}</span>
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

export default Homework;

