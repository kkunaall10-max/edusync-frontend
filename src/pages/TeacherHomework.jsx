import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { SCHOOL_CLASSES, SCHOOL_SECTIONS } from '../utils/constants';

const API_BASE_URL = 'https://edusync.up.railway.app/api/homework';
const TEACHERS_API_URL = 'https://edusync.up.railway.app/api/teachers';

const TeacherHomework = () => {
    const [homework, setHomework] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [teacherProfile, setTeacherProfile] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        subject: '',
        class: '',
        section: ''
    });

    const navigate = useNavigate();

    const fetchTeacherProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            try {
                const res = await axios.get(TEACHERS_API_URL, { params: { email: user.email } });
                if (res.data && res.data.length > 0) {
                    const profile = res.data[0];
                    setTeacherProfile(profile);
                    setFormData(prev => ({ 
                        ...prev, 
                        subject: profile.subject_assigned || '', 
                        class: profile.class_assigned || '', 
                        section: profile.section_assigned || '' 
                    }));
                }
            } catch (err) { console.error('Error fetching teacher info:', err); }
        }
    };

    const fetchHomework = async () => {
        setLoading(true);
        try {
            const params = teacherProfile ? { 
                class: teacherProfile.class_assigned, 
                section: teacherProfile.section_assigned 
            } : {};
            const res = await axios.get(API_BASE_URL, { params });
            setHomework(res.data);
        } catch (err) { console.error('Error fetching homework:', err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchTeacherProfile(); }, []);
    useEffect(() => { if (teacherProfile) fetchHomework(); }, [teacherProfile]);

    const handleAddHomework = async (e) => {
        e.preventDefault();
        try {
            await axios.post(API_BASE_URL, formData);
            setIsModalOpen(false);
            setFormData({ ...formData, title: '', description: '', dueDate: '' });
            fetchHomework();
        } catch (err) { alert('Error adding homework: ' + (err.response?.data?.error || err.message)); }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this assignment?')) {
            try { await axios.delete(`${API_BASE_URL}/${id}`); fetchHomework(); }
            catch (err) { alert('Error deleting assignment'); }
        }
    };

    return (
        <Layout role="teacher">
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Homework</h1>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
                            Assign and manage scholarly tasks
                        </p>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-100 transition-all hover:-translate-y-1"
                    >
                        New Assignment
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full py-20 text-center">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading Assignments...</p>
                            </div>
                        </div>
                    ) : homework.length === 0 ? (
                        <div className="col-span-full py-20 bg-white rounded-[32px] border border-slate-100 text-center">
                            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No assignments found</p>
                        </div>
                    ) : (
                        homework.map((hw) => (
                            <div key={hw.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black">
                                        <span className="material-symbols-outlined">assignment</span>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(hw.id)}
                                        className="text-slate-300 hover:text-rose-500 transition-colors"
                                    >
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                                <h3 className="text-lg font-black text-slate-900 mb-2 truncate">{hw.title}</h3>
                                <p className="text-sm text-slate-500 mb-6 line-clamp-2">{hw.description}</p>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</span>
                                        <span className="text-xs font-black text-slate-900">{new Date(hw.due_date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-2xl">
                                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Target</span>
                                        <span className="text-xs font-black text-blue-600">{hw.class}-{hw.section} • {hw.subject}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <div className="bg-white w-full max-w-lg rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                            <h2 className="text-2xl font-black text-slate-900 mb-6">New Assignment</h2>
                            <form onSubmit={handleAddHomework} className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Assignment Title</label>
                                    <input 
                                        required 
                                        className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/10 transition-all"
                                        value={formData.title} 
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Detailed Instructions</label>
                                    <textarea 
                                        required 
                                        className="w-full h-32 bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/10 transition-all resize-none"
                                        value={formData.description} 
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Submission Deadline</label>
                                    <input 
                                        type="date" 
                                        required 
                                        className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/10 transition-all"
                                        value={formData.dueDate} 
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} 
                                    />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button 
                                        type="submit" 
                                        className="flex-1 h-12 bg-blue-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-colors"
                                    >
                                        Create Task
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 h-12 bg-slate-100 text-slate-400 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default TeacherHomework;
