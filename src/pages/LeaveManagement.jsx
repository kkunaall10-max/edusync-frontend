import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { SCHOOL_CLASSES, SCHOOL_SECTIONS } from '../utils/constants';
import { 
    Calendar, 
    Search, 
    Filter, 
    CheckCircle, 
    XCircle, 
    Clock, 
    User,
    ArrowRight,
    ChevronDown,
    FileText
} from 'lucide-react';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://edusync.up.railway.app') + '/api/leave';

const LeaveManagement = () => {
    const [loading, setLoading] = useState(false);
    const [leaves, setLeaves] = useState([]);
    const [filters, setFilters] = useState({
        status: '',
        class: '',
        section: '',
    });

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            const res = await axios.get(API_BASE_URL, { params: filters });
            setLeaves(res.data);
        } catch (error) {
            console.error('Error fetching leaves:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, [filters]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-amber-50 text-amber-600 border-amber-100';
        }
    };

    return (
        <Layout role="principal">
            <div className="flex flex-col space-y-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Leave Administration</h1>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Institutional Absence Protocol</p>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm items-end">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Status</label>
                        <select 
                            className="w-full h-12 bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-xl px-4 text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Class</label>
                        <select 
                            className="w-full h-12 bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-xl px-4 text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer"
                            value={filters.class}
                            onChange={(e) => setFilters({ ...filters, class: e.target.value })}
                        >
                            <option value="">All Classes</option>
                            {SCHOOL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Section</label>
                        <select 
                            className="w-full h-12 bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-xl px-4 text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer"
                            value={filters.section}
                            onChange={(e) => setFilters({ ...filters, section: e.target.value })}
                        >
                            <option value="">All Sections</option>
                            {SCHOOL_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <button 
                        onClick={fetchLeaves}
                        className="h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                    >
                        Refresh
                        <Clock size={16} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                        <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Querying Absence Records...</p>
                    </div>
                ) : leaves.length > 0 ? (
                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Class</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Remark</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {leaves.map((l) => (
                                        <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                                        {l.students?.full_name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900">{l.students?.full_name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Roll: {l.students?.roll_number}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-bold text-slate-600">{l.class} — {l.section}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-bold text-slate-900">{new Date(l.from_date).toLocaleDateString()}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">To {new Date(l.to_date).toLocaleDateString()}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-slate-600 max-w-xs truncate" title={l.reason}>{l.reason}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(l.status)}`}>
                                                    {l.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <p className="text-xs italic text-slate-400">{l.teacher_remark || 'No remark yet'}</p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
                        <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center text-slate-200">
                            <FileText size={48} strokeWidth={1} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">No Absence Protocol Found</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">All subjects are presently within institutional bounds</p>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default LeaveManagement;
