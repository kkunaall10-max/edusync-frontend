import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SCHOOL_CLASSES, SCHOOL_SECTIONS } from '../utils/constants';
import Layout from '../components/Layout';

const API_BASE_URL = 'https://edusync.up.railway.app/api/students';
const TEACHERS_API_URL = 'https://edusync.up.railway.app/api/teachers';

const StudentList = ({ role }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [user, setUser] = useState(null);
    const [filters, setFilters] = useState({
        class: '',
        section: '',
        status: 'All',
        search: ''
    });

    const [formData, setFormData] = useState({
        full_name: '',
        roll_number: '',
        class: '',
        section: '',
        parent_email: '',
        parent_phone: '',
        gender: '',
        date_of_birth: '',
        address: '',
        admission_date: new Date().toISOString().split('T')[0]
    });

    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (role === 'teacher' && user) {
                try {
                    const res = await axios.get(TEACHERS_API_URL, { params: { email: user.email } });
                    if (res.data && res.data.length > 0) {
                        const teacher = res.data[0];
                        setFilters(prev => ({ 
                            ...prev, 
                            class: teacher.class_assigned || '', 
                            section: teacher.section_assigned || '' 
                        }));
                    }
                } catch (err) {
                    console.error('Error fetching teacher assignment:', err);
                }
            }
        };
        checkUser();
    }, [role]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const params = {
                class: filters.class,
                section: filters.section,
                search: filters.search
            };
            const response = await axios.get(API_BASE_URL, { params });
            setStudents(response.data);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStudents();
        }, 300);
        return () => clearTimeout(timer);
    }, [filters.class, filters.section, filters.search]);

    const handleOpenModal = (student = null) => {
        if (student) {
            setSelectedStudent(student);
            setFormData({
                ...student,
                date_of_birth: student.date_of_birth ? student.date_of_birth.split('T')[0] : '',
                admission_date: student.admission_date ? student.admission_date.split('T')[0] : ''
            });
        } else {
            setSelectedStudent(null);
            setFormData({
                full_name: '',
                roll_number: '',
                class: filters.class || '',
                section: filters.section || '',
                parent_email: '',
                parent_phone: '',
                gender: '',
                date_of_birth: '',
                address: '',
                admission_date: new Date().toISOString().split('T')[0]
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (selectedStudent) {
                await axios.put(`${API_BASE_URL}/${selectedStudent.id}`, formData);
            } else {
                await axios.post(API_BASE_URL, formData);
            }
            setIsModalOpen(false);
            fetchStudents();
        } catch (error) {
            alert('Error saving student: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                await axios.delete(`${API_BASE_URL}/${id}`);
                fetchStudents();
            } catch (error) {
                alert('Error deleting student');
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
                        <h2 className="text-3xl font-black text-slate-900 m-0 tracking-tight">Students</h2>
                        <p className="text-sm text-slate-500 mt-1 font-medium">{students.length.toLocaleString()} students enrolled</p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="relative w-full lg:max-w-md">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input 
                            className="w-full h-12 bg-white border border-slate-200 rounded-xl pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                            placeholder="Search name or roll number..." 
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                        />
                    </div>
                    <button 
                        className="w-full lg:w-auto h-12 flex items-center justify-center gap-2 px-6 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                        onClick={() => handleOpenModal()}
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                        Add Student
                    </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Class</label>
                        <select 
                            className="w-full h-10 bg-slate-50 border-none rounded-lg px-3 text-sm font-bold text-slate-900 outline-none cursor-pointer"
                            value={filters.class}
                            onChange={(e) => setFilters(prev => ({...prev, class: e.target.value}))}
                            disabled={role === 'teacher'}
                        >
                            <option value="">All Classes</option>
                            {SCHOOL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Section</label>
                        <select 
                            className="w-full h-10 bg-slate-50 border-none rounded-lg px-3 text-sm font-bold text-slate-900 outline-none cursor-pointer"
                            value={filters.section}
                            onChange={(e) => setFilters(prev => ({...prev, section: e.target.value}))}
                            disabled={role === 'teacher'}
                        >
                            <option value="">All Sections</option>
                            {SCHOOL_SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
                        </select>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status</label>
                        <select 
                            className="w-full h-10 bg-slate-50 border-none rounded-lg px-3 text-sm font-bold text-slate-900 outline-none cursor-pointer"
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({...prev, status: e.target.value}))}
                        >
                            <option value="All">All Students</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Roll No</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Class / Section</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Parent contact</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium italic">Loading students...</td>
                                    </tr>
                                ) : students.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">group_off</span>
                                                <p className="text-slate-900 font-bold">No students found</p>
                                                <p className="text-sm text-slate-500">Try adjusting your filters or search terms.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    students.map((student) => (
                                        <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-blue-600 font-mono text-sm">{student.roll_number}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-black">
                                                        {getInitials(student.full_name)}
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-900">{student.full_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                                                    {student.class}-{student.section}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500 font-medium">{student.parent_phone || 'No contact'}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleOpenModal(student)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                                        <span className="material-symbols-outlined text-lg">edit</span>
                                                    </button>
                                                    <button onClick={() => handleDelete(student.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
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
                            <div className="p-8 text-center text-slate-400 italic">Syncing records...</div>
                        ) : students.length === 0 ? (
                            <div className="p-10 text-center">
                                <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">group_off</span>
                                <p className="text-slate-900 font-bold">No students found</p>
                            </div>
                        ) : (
                            students.map((student) => (
                                <div key={student.id} className="p-5 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-black uppercase">
                                                {getInitials(student.full_name)}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-slate-900 leading-none">{student.full_name}</h4>
                                                <p className="text-[10px] font-bold text-blue-600 mt-1 uppercase tracking-wider">Roll: {student.roll_number}</p>
                                            </div>
                                        </div>
                                        <span className="px-2 py-1 bg-slate-100 text-slate-700 text-[10px] font-black rounded-lg">Class {student.class}-{student.section}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <span className="material-symbols-outlined text-sm">phone</span>
                                        {student.parent_phone || 'No contact provided'}
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button 
                                            onClick={() => handleOpenModal(student)}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-900 rounded-xl text-xs font-black hover:bg-slate-200 transition-colors border-none"
                                        >
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(student.id)}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-xl text-xs font-black hover:bg-red-100 transition-colors border-none"
                                        >
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Responsive Student Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] sm:p-6">
                    <div className="w-full h-full sm:h-auto sm:max-w-2xl bg-white sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-bottom border-slate-100 shrink-0">
                            <div className="flex justify-between items-center text-slate-900">
                                <div>
                                    <h3 className="text-xl font-black">{selectedStudent ? 'Edit Student' : 'Add New Student'}</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Institutional Enrollment</p>
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
                                            placeholder="e.g. John Doe" 
                                            required 
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Roll Number</label>
                                        <input 
                                            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="e.g. 101" 
                                            required 
                                            value={formData.roll_number}
                                            onChange={(e) => setFormData({...formData, roll_number: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Class</label>
                                        <select 
                                            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none"
                                            required
                                            value={formData.class}
                                            onChange={(e) => setFormData({...formData, class: e.target.value})}
                                        >
                                            <option value="">Select Class</option>
                                            {SCHOOL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Section</label>
                                        <select 
                                            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none"
                                            required
                                            value={formData.section}
                                            onChange={(e) => setFormData({...formData, section: e.target.value})}
                                        >
                                            <option value="">Select Section</option>
                                            {SCHOOL_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Parent Email</label>
                                        <input 
                                            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none"
                                            type="email" 
                                            placeholder="parent@example.com"
                                            value={formData.parent_email}
                                            onChange={(e) => setFormData({...formData, parent_email: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Parent Phone</label>
                                        <input 
                                            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none"
                                            placeholder="+91 XXXXX XXXXX"
                                            value={formData.parent_phone}
                                            onChange={(e) => setFormData({...formData, parent_phone: e.target.value})}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 md:col-span-2">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender</label>
                                            <select 
                                                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none"
                                                value={formData.gender}
                                                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                            >
                                                <option value="">Select</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">DOB</label>
                                            <input 
                                                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none"
                                                type="date"
                                                value={formData.date_of_birth}
                                                onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Resident Address</label>
                                        <textarea 
                                            className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold outline-none resize-none" 
                                            placeholder="Full residential address..."
                                            value={formData.address}
                                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 flex gap-3 shrink-0">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-500 text-xs font-black uppercase tracking-widest bg-transparent border-none cursor-pointer">Cancel</button>
                                <button type="submit" className="flex-[2] py-4 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200 border-none cursor-pointer">Save Records</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default StudentList;

