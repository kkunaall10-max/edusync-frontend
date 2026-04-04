import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SCHOOL_CLASSES, SCHOOL_SECTIONS } from '../utils/constants';
import Layout from '../components/Layout';

const API_BASE_URL = 'https://edusync.up.railway.app/api/teachers';

const TeacherList = ({ role }) => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [user, setUser] = useState(null);
    const [search, setSearch] = useState('');

    const [formData, setFormData] = useState({
        full_name: '',
        employee_id: '',
        email: '',
        phone: '',
        subject: '',
        class_assigned: '',
        section_assigned: '',
        gender: 'male',
        date_of_joining: new Date().toISOString().split('T')[0],
        address: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        checkUser();
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API_BASE_URL, { params: { search } });
            setTeachers(response.data);
        } catch (error) {
            console.error('Error fetching teachers:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTeachers();
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const handleOpenModal = (teacher = null) => {
        if (teacher) {
            setSelectedTeacher(teacher);
            setFormData({
                ...teacher,
                date_of_joining: teacher.date_of_joining ? teacher.date_of_joining.split('T')[0] : ''
            });
        } else {
            setSelectedTeacher(null);
            setFormData({
                full_name: '',
                employee_id: '',
                email: '',
                phone: '',
                subject: '',
                class_assigned: '',
                section_assigned: '',
                gender: 'male',
                date_of_joining: new Date().toISOString().split('T')[0],
                address: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (selectedTeacher) {
                await axios.put(`${API_BASE_URL}/${selectedTeacher.id}`, formData);
            } else {
                await axios.post(API_BASE_URL, formData);
            }
            setIsModalOpen(false);
            fetchTeachers();
        } catch (error) {
            alert('Error saving teacher: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this teacher?')) {
            try {
                await axios.delete(`${API_BASE_URL}/${id}`);
                fetchTeachers();
            } catch (error) {
                alert('Error deleting teacher');
            }
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
                {/* Page Title */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 m-0 tracking-tight">Teachers</h2>
                        <p className="text-sm text-slate-500 mt-1 font-medium">{teachers.length} professional educators registered</p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="relative w-full lg:max-w-md">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input 
                            className="w-full h-12 bg-white border border-slate-200 rounded-xl pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                            placeholder="Search name or employee ID..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button 
                        className="w-full lg:w-auto h-12 flex items-center justify-center gap-2 px-6 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                        onClick={() => handleOpenModal()}
                    >
                        <span className="material-symbols-outlined text-lg">person_add</span>
                        Add Teacher
                    </button>
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee ID</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Class</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-medium italic">Loading teachers...</td>
                                    </tr>
                                ) : teachers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">person_off</span>
                                                <p className="text-slate-900 font-bold">No teachers found</p>
                                                <p className="text-sm text-slate-500">Register a new educator to get started.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    teachers.map((teacher, idx) => (
                                        <tr key={teacher.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-blue-600 font-mono text-sm">{teacher.employee_id}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black ${idx % 2 === 0 ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
                                                        {getInitials(teacher.full_name)}
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-bold text-slate-900 block">{teacher.full_name}</span>
                                                        <span className="text-[10px] text-slate-400 font-medium">{teacher.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-wider">
                                                    {teacher.subject}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {teacher.class_assigned ? (
                                                    <span className="text-sm font-bold text-slate-700">
                                                        {teacher.class_assigned}-{teacher.section_assigned || 'A'}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500 font-medium">{teacher.phone || 'N/A'}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleOpenModal(teacher)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                                        <span className="material-symbols-outlined text-lg">edit</span>
                                                    </button>
                                                    <button onClick={() => handleDelete(teacher.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                                        <span className="material-symbols-outlined text-lg">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-slate-100">
                        {loading ? (
                            <div className="p-8 text-center text-slate-400 italic font-medium">Syncing faculty database...</div>
                        ) : teachers.length === 0 ? (
                            <div className="p-10 text-center">
                                <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">person_off</span>
                                <p className="text-slate-900 font-bold">No teachers found</p>
                            </div>
                        ) : (
                            teachers.map((teacher, idx) => (
                                <div key={teacher.id} className="p-5 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black uppercase ${idx % 2 === 0 ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
                                                {getInitials(teacher.full_name)}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-slate-900 leading-none">{teacher.full_name}</h4>
                                                <p className="text-[10px] font-bold text-blue-600 mt-1 uppercase tracking-wider">{teacher.employee_id}</p>
                                            </div>
                                        </div>
                                        <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg uppercase tracking-wider">{teacher.subject}</span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Class Assigned</p>
                                            <p className="text-xs font-bold text-slate-700">{teacher.class_assigned ? `${teacher.class_assigned}-${teacher.section_assigned || 'A'}` : 'N/A'}</p>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact</p>
                                            <p className="text-xs font-bold text-slate-700">{teacher.phone || 'No phone'}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleOpenModal(teacher)}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-900 rounded-xl text-xs font-black hover:bg-slate-200 transition-colors border-none"
                                        >
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                            Edit profile
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(teacher.id)}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-xl text-xs font-black hover:bg-red-100 transition-colors border-none"
                                        >
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Responsive Teacher Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] sm:p-6">
                    <div className="w-full h-full sm:h-auto sm:max-w-2xl bg-white sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-bottom border-slate-100 shrink-0">
                            <div className="flex justify-between items-center text-slate-900">
                                <div>
                                    <h3 className="text-xl font-black">{selectedTeacher ? 'Edit Teacher' : 'Add New Teacher'}</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Faculty Registration</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="material-symbols-outlined p-2 hover:bg-slate-100 rounded-full transition-colors bg-none border-none cursor-pointer">close</button>
                            </div>
                        </div>
                        <form onSubmit={handleSave} className="flex-1 overflow-y-auto">
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                                        <input 
                                            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="e.g. Sarah Jenkins" 
                                            required 
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee ID</label>
                                        <input 
                                            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="e.g. EDU-TR-101" 
                                            required 
                                            value={formData.employee_id}
                                            onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                                        <input 
                                            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none"
                                            type="email" 
                                            placeholder="sarah@edusync.edu"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                                        <input 
                                            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none"
                                            placeholder="+91 XXXXX XXXXX"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject Expertise</label>
                                        <input 
                                            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="e.g. Mathematics" 
                                            required 
                                            value={formData.subject}
                                            onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Class</label>
                                            <select 
                                                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none"
                                                value={formData.class_assigned}
                                                onChange={(e) => setFormData({...formData, class_assigned: e.target.value})}
                                            >
                                                <option value="">None</option>
                                                {SCHOOL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Section</label>
                                            <select 
                                                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none"
                                                value={formData.section_assigned}
                                                onChange={(e) => setFormData({...formData, section_assigned: e.target.value})}
                                            >
                                                <option value="">None</option>
                                                {SCHOOL_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender</label>
                                        <select 
                                            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none"
                                            value={formData.gender}
                                            onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Date of Joining</label>
                                        <input 
                                            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none"
                                            type="date"
                                            value={formData.date_of_joining}
                                            onChange={(e) => setFormData({...formData, date_of_joining: e.target.value})}
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Residential Address</label>
                                        <textarea 
                                            className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold outline-none resize-none" 
                                            placeholder="Full address..."
                                            value={formData.address}
                                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 flex gap-3 shrink-0">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-500 text-xs font-black uppercase tracking-widest bg-transparent border-none cursor-pointer">Cancel</button>
                                <button type="submit" className="flex-[2] py-4 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200 border-none cursor-pointer">Save Faculty</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default TeacherList;

