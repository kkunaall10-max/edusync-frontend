import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SCHOOL_CLASSES } from '../utils/constants';
import Layout from '../components/Layout';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://edusync.up.railway.app') + '/api/fees';
const STUDENTS_API_URL = (import.meta.env.VITE_API_URL || 'https://edusync.up.railway.app') + '/api/students';

const FeeManagement = ({ role }) => {
    const [fees, setFees] = useState([]);
    const [stats, setStats] = useState({ total_collected: 0, total_pending: 0, total_overdue: 0 });
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [filters, setFilters] = useState({
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: String(new Date().getFullYear()),
        status: 'All',
        class: ''
    });

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedFee, setSelectedFee] = useState(null);
    
    const [newFee, setNewFee] = useState({
        student_id: '',
        amount: '',
        fee_type: 'Tuition',
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: String(new Date().getFullYear()),
        due_date: ''
    });

    const [paymentMethod, setPaymentMethod] = useState('cash');

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const years = ['2023', '2024', '2025', '2026'];

    const navigate = useNavigate();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [feesRes, statsRes] = await Promise.all([
                axios.get(API_BASE_URL, { params: filters }),
                axios.get(`${API_BASE_URL}/stats`)
            ]);
            setFees(feesRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Error fetching fees data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await axios.get(STUDENTS_API_URL);
            setStudents(res.data.filter(s => s.is_active));
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters]);

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleAddFee = async (e) => {
        e.preventDefault();
        try {
            await axios.post(API_BASE_URL, newFee);
            setIsAddModalOpen(false);
            setNewFee({
                student_id: '',
                amount: '',
                fee_type: 'Tuition',
                month: new Date().toLocaleString('default', { month: 'long' }),
                year: String(new Date().getFullYear()),
                due_date: ''
            });
            fetchData();
            alert('Fee record created successfully');
        } catch (error) {
            alert('Error creating fee: ' + (error.response?.data?.error || error.message));
        }
    };

    const handlePayment = async () => {
        try {
            const res = await axios.put(`${API_BASE_URL}/${selectedFee.id}/pay`, { payment_method: paymentMethod });
            setIsPaymentModalOpen(false);
            setSelectedFee(null);
            fetchData();
            alert(`Payment successful! Receipt: ${res.data.receipt_number}`);
        } catch (error) {
            alert('Error processing payment: ' + (error.response?.data?.error || error.message));
        }
    };

    const getInitials = (name) => {
        if (!name) return '??';
        const parts = name.split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name[0].toUpperCase();
    };

    return (
        <Layout role="principal">
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight m-0">Billing</h1>
                        <p className="text-sm md:text-base text-slate-500 mt-1 font-medium italic">"Financial transparency drives institutional growth."</p>
                    </div>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-full md:w-auto h-12 px-8 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">add_card</span>
                        Add Fee Record
                    </button>
                </div>

                {/* Stats Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-3xl border-l-4 border-emerald-500 border-y border-r border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Collected</span>
                            <span className="material-symbols-outlined text-emerald-500">account_balance_wallet</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">₹{stats.total_collected.toLocaleString()}</h2>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border-l-4 border-amber-500 border-y border-r border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Pending</span>
                            <span className="material-symbols-outlined text-amber-500">pending_actions</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">₹{stats.total_pending.toLocaleString()}</h2>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border-l-4 border-rose-500 border-y border-r border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Overdue</span>
                            <span className="material-symbols-outlined text-rose-500">priority_high</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">₹{stats.total_overdue.toLocaleString()}</h2>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 md:p-6 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Month</label>
                        <select 
                            className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-900 outline-none cursor-pointer"
                            value={filters.month}
                            onChange={(e) => setFilters(prev => ({...prev, month: e.target.value}))}
                        >
                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Year</label>
                        <select 
                            className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-900 outline-none cursor-pointer"
                            value={filters.year}
                            onChange={(e) => setFilters(prev => ({...prev, year: e.target.value}))}
                        >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Status</label>
                        <select 
                            className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-900 outline-none cursor-pointer"
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({...prev, status: e.target.value}))}
                        >
                            <option value="All">All Statuses</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="overdue">Overdue</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Class</label>
                        <select 
                            className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-900 outline-none cursor-pointer"
                            value={filters.class}
                            onChange={(e) => setFilters(prev => ({...prev, class: e.target.value}))}
                        >
                            <option value="">All Classes</option>
                            {SCHOOL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                {/* Table / Cards */}
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                    {/* Desktop View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-bottom border-slate-100">
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Fee Type</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</th>
                                    <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic">Syncing ledger...</td></tr>
                                ) : fees.length === 0 ? (
                                    <tr><td colSpan="6" className="px-6 py-20 text-center text-slate-400">No records found.</td></tr>
                                ) : (
                                    fees.map(fee => (
                                        <tr key={fee.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-[10px]">{getInitials(fee.student?.full_name)}</div>
                                                    <div>
                                                        <div className="text-sm font-black text-slate-900 tracking-tight">{fee.student?.full_name}</div>
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{fee.student?.class}-{fee.student?.section}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-600">{fee.fee_type}</td>
                                            <td className="px-6 py-4 text-sm font-black text-slate-900">₹{fee.amount.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-sm text-slate-500 font-medium">{new Date(fee.due_date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                    fee.status === 'paid' ? 'bg-emerald-50 text-emerald-600' :
                                                    fee.status === 'overdue' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                                                }`}>
                                                    {fee.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {fee.status !== 'paid' ? (
                                                    <button 
                                                        onClick={() => { setSelectedFee(fee); setIsPaymentModalOpen(true); }}
                                                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all"
                                                    >
                                                        Mark Paid
                                                    </button>
                                                ) : (
                                                    <div className="text-right">
                                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block">Receipt</span>
                                                        <span className="text-[10px] font-mono text-slate-500 font-bold">{fee.receipt_number}</span>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile/Tablet View */}
                    <div className="md:hidden divide-y divide-slate-100">
                        {loading ? (
                            <div className="p-8 text-center text-slate-400 italic">Syncing daily records...</div>
                        ) : fees.length === 0 ? (
                            <div className="p-10 text-center text-slate-400">No records matched filters.</div>
                        ) : (
                            fees.map(fee => (
                                <div key={fee.id} className="p-5 flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">{getInitials(fee.student?.full_name)}</div>
                                            <div>
                                                <h4 className="text-sm font-black text-slate-900 leading-none">{fee.student?.full_name}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{fee.student?.class}-{fee.student?.section} | {fee.fee_type}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                            fee.status === 'paid' ? 'bg-emerald-50 border-emerald-500 text-emerald-600' :
                                            fee.status === 'overdue' ? 'bg-rose-50 border-rose-500 text-rose-600' : 'bg-amber-50 border-amber-500 text-amber-600'
                                        }`}>
                                            {fee.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Amount Due</p>
                                            <p className="text-base font-black text-slate-900">₹{fee.amount.toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Due On</p>
                                            <p className="text-xs font-bold text-slate-900">{new Date(fee.due_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    {fee.status !== 'paid' ? (
                                        <button 
                                            onClick={() => { setSelectedFee(fee); setIsPaymentModalOpen(true); }}
                                            className="w-full h-11 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-100"
                                        >
                                            Process Payment
                                        </button>
                                    ) : (
                                        <div className="flex justify-between items-center text-[10px]">
                                            <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Transaction Complete</span>
                                            <span className="font-mono text-slate-900 font-black">{fee.receipt_number}</span>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 m-0">New Billing</h3>
                                <p className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-widest">Institutional Fee Registry</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleAddFee} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Select Student</label>
                                <select 
                                    className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-900 outline-none"
                                    value={newFee.student_id}
                                    onChange={(e) => setNewFee({...newFee, student_id: e.target.value})}
                                    required
                                >
                                    <option value="">Search student...</option>
                                    {students.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.class}-{s.section})</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Fee Type</label>
                                    <select className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-900 outline-none" value={newFee.fee_type} onChange={(e)=>setNewFee({...newFee, fee_type: e.target.value})}>
                                        <option value="Tuition">Tuition Fee</option>
                                        <option value="Transport">Transport Fee</option>
                                        <option value="Library">Library Fee</option>
                                        <option value="Exam">Exam Fee</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Amount (₹)</label>
                                    <input 
                                        type="number" 
                                        className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-900 outline-none"
                                        placeholder="5000"
                                        value={newFee.amount}
                                        onChange={(e)=>setNewFee({...newFee, amount:e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Month</label>
                                    <select className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-900 outline-none" value={newFee.month} onChange={(e)=>setNewFee({...newFee, month: e.target.value})}>
                                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Due Date</label>
                                    <input 
                                        type="date" 
                                        className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-900 outline-none"
                                        value={newFee.due_date}
                                        onChange={(e)=>setNewFee({...newFee, due_date: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 h-12 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all">Cancel</button>
                                <button type="submit" className="flex-2 h-12 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex-grow-[2]">Create Statement</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isPaymentModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <span className="material-symbols-outlined text-3xl">payments</span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Process Transaction</h3>
                            <p className="text-sm text-slate-500 font-medium">Record payment of <span className="text-blue-600 font-black">₹{selectedFee?.amount?.toLocaleString()}</span> for {selectedFee?.student?.full_name}</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">Confirm Methodology</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['cash', 'online', 'cheque'].map(m => (
                                        <button 
                                            key={m}
                                            onClick={() => setPaymentMethod(m)}
                                            className={`h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                                paymentMethod === m ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'
                                            }`}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setIsPaymentModalOpen(false)} className="flex-1 h-12 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all">Abort</button>
                            <button onClick={handlePayment} className="flex-1 h-12 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">Finalize</button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default FeeManagement;

