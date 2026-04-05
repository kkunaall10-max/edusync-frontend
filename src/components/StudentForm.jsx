import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, ChevronDown, Save, User, Phone, Mail, Calendar, MapPin, Hash, GraduationCap } from 'lucide-react';
import { SCHOOL_CLASSES, SCHOOL_SECTIONS } from '../utils/constants';

const API_URL = (import.meta.env.VITE_API_URL || 'https://edusync.up.railway.app') + '/api/students';

const StudentForm = ({ isOpen, onClose, onSuccess, initialData }) => {
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

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                date_of_birth: initialData.date_of_birth ? initialData.date_of_birth.split('T')[0] : '',
                admission_date: initialData.admission_date ? initialData.admission_date.split('T')[0] : ''
            });
        } else {
            setFormData({
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
        }
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (initialData) {
                await axios.put(`${API_URL}/${initialData.id}`, formData);
            } else {
                await axios.post(API_URL, formData);
            }
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save student data');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div className="w-full h-full sm:h-auto sm:max-w-2xl bg-white sm:rounded-[32px] shadow-2xl shadow-slate-900/20 overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 leading-tight">
                            {initialData ? 'Academic Record Update' : 'New Enrollment'}
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Student Profile Matrix</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 md:p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold text-center">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                <User size={12} className="text-blue-500" />
                                Full Identity
                            </label>
                            <input 
                                className="w-full h-12 bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-xl px-4 text-sm font-bold text-slate-900 outline-none transition-all"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                placeholder="e.g. Johnathan Smith"
                                required
                            />
                        </div>

                        {/* Roll Number */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                <Hash size={12} className="text-blue-500" />
                                Roll Sequence
                            </label>
                            <input 
                                className="w-full h-12 bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-xl px-4 text-sm font-bold text-slate-900 outline-none transition-all"
                                name="roll_number"
                                value={formData.roll_number}
                                onChange={handleChange}
                                placeholder="ED-2024-XXXX"
                                required
                            />
                        </div>

                        {/* Class */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                <GraduationCap size={12} className="text-blue-500" />
                                Academic Grade
                            </label>
                            <div className="relative">
                                <select 
                                    className="w-full h-12 bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-xl px-4 text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer transition-all"
                                    name="class"
                                    value={formData.class}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Grade</option>
                                    {SCHOOL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Section */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                <Hash size={12} className="text-blue-500" />
                                Sub-Section
                            </label>
                            <div className="relative">
                                <select 
                                    className="w-full h-12 bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-xl px-4 text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer transition-all"
                                    name="section"
                                    value={formData.section}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Section</option>
                                    {SCHOOL_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Parent Email */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                <Mail size={12} className="text-blue-500" />
                                Guardian Email
                            </label>
                            <input 
                                className="w-full h-12 bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-xl px-4 text-sm font-bold text-slate-900 outline-none transition-all"
                                name="parent_email"
                                value={formData.parent_email}
                                onChange={handleChange}
                                placeholder="email@example.com"
                                type="email"
                            />
                        </div>

                        {/* Parent Phone */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                <Phone size={12} className="text-blue-500" />
                                Guardian Contact
                            </label>
                            <input 
                                className="w-full h-12 bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-xl px-4 text-sm font-bold text-slate-900 outline-none transition-all"
                                name="parent_phone"
                                value={formData.parent_phone}
                                onChange={handleChange}
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>

                        {/* Gender */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                <User size={12} className="text-blue-500" />
                                Gender
                            </label>
                            <div className="relative">
                                <select 
                                    className="w-full h-12 bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-xl px-4 text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer transition-all"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* DOB */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                <Calendar size={12} className="text-blue-500" />
                                Date of Birth
                            </label>
                            <input 
                                className="w-full h-12 bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-xl px-4 text-sm font-bold text-slate-900 outline-none transition-all"
                                name="date_of_birth"
                                value={formData.date_of_birth}
                                onChange={handleChange}
                                type="date"
                            />
                        </div>

                        {/* Address - Full width */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                <MapPin size={12} className="text-blue-500" />
                                Residential Node
                            </label>
                            <input 
                                className="w-full h-12 bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-xl px-4 text-sm font-bold text-slate-900 outline-none transition-all"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="123 Academic Way, Education District, City"
                            />
                        </div>

                        {/* Admission Date */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                <Calendar size={12} className="text-blue-500" />
                                Enrollment Date
                            </label>
                            <input 
                                className="w-full h-12 bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-xl px-4 text-sm font-bold text-slate-900 outline-none transition-all"
                                name="admission_date"
                                value={formData.admission_date}
                                onChange={handleChange}
                                type="date"
                            />
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="w-full sm:w-auto h-12 px-8 bg-white border-2 border-blue-600 text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-colors order-2 sm:order-1"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className={`w-full sm:w-auto h-12 px-8 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 order-1 sm:order-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            disabled={loading}
                        >
                            {loading ? (
                                'Synchronizing...'
                            ) : (
                                <>
                                    Commit Changes
                                    <Save size={16} />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentForm;

