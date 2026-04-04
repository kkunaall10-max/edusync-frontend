import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, BookOpen, Hash, Calendar, MapPin, ChevronDown } from 'lucide-react';
import { SCHOOL_CLASSES, SCHOOL_SECTIONS } from '../utils/constants';

const TeacherForm = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    subject: '',
    class_assigned: SCHOOL_CLASSES[3],
    section_assigned: SCHOOL_SECTIONS[0],
    employee_id: '',
    date_of_joining: new Date().toISOString().split('T')[0],
    gender: 'male',
    address: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        subject: '',
        class_assigned: SCHOOL_CLASSES[3],
        section_assigned: SCHOOL_SECTIONS[0],
        employee_id: '',
        date_of_joining: new Date().toISOString().split('T')[0],
        gender: 'male',
        address: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.full_name) newErrors.full_name = 'Required';
    if (!formData.email) newErrors.email = 'Required';
    if (!formData.employee_id) newErrors.employee_id = 'Required';
    if (!formData.subject) newErrors.subject = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full h-full sm:h-auto sm:max-w-2xl bg-white sm:rounded-[32px] shadow-2xl shadow-slate-900/20 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-black text-slate-900 leading-tight">
              {initialData ? 'Update Faculty Record' : 'Onboard New Educator'}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Professional Profile Matrix</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                <User size={12} className="text-blue-500" />
                Full Name
              </label>
              <input
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className={`w-full h-12 bg-slate-50 border-2 ${errors.full_name ? 'border-rose-500/50' : 'border-transparent'} focus:border-blue-600/20 focus:bg-white rounded-xl px-4 text-sm font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300`}
                placeholder="Dr. Sarah Johnson"
              />
              {errors.full_name && <p className="text-[10px] text-rose-500 font-bold px-1 uppercase">{errors.full_name}</p>}
            </div>

            {/* Employee ID */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                <Hash size={12} className="text-blue-500" />
                Employee Identity
              </label>
              <input
                name="employee_id"
                value={formData.employee_id}
                onChange={handleChange}
                className={`w-full h-12 bg-slate-50 border-2 ${errors.employee_id ? 'border-rose-500/50' : 'border-transparent'} focus:border-blue-600/20 focus:bg-white rounded-xl px-4 text-sm font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300`}
                placeholder="EMP-101"
              />
              {errors.employee_id && <p className="text-[10px] text-rose-500 font-bold px-1 uppercase">{errors.employee_id}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                <Mail size={12} className="text-blue-500" />
                Email Address
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full h-12 bg-slate-50 border-2 ${errors.email ? 'border-rose-500/50' : 'border-transparent'} focus:border-blue-600/20 focus:bg-white rounded-xl px-4 text-sm font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300`}
                placeholder="sarah@edusync.com"
              />
              {errors.email && <p className="text-[10px] text-rose-500 font-bold px-1 uppercase">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                <Phone size={12} className="text-blue-500" />
                Contact Number
              </label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full h-12 bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-xl px-4 text-sm font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                <BookOpen size={12} className="text-blue-500" />
                Primary Discipline
              </label>
              <input
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={`w-full h-12 bg-slate-50 border-2 ${errors.subject ? 'border-rose-500/50' : 'border-transparent'} focus:border-blue-600/20 focus:bg-white rounded-xl px-4 text-sm font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300`}
                placeholder="Mathematics"
              />
              {errors.subject && <p className="text-[10px] text-rose-500 font-bold px-1 uppercase">{errors.subject}</p>}
            </div>

            {/* Class & Section Assigned */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 leading-none">Class</label>
                <div className="relative">
                  <select
                    name="class_assigned"
                    value={formData.class_assigned}
                    onChange={handleChange}
                    className="w-full h-12 bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-xl px-4 text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer transition-all"
                  >
                    <option value="">None</option>
                    {SCHOOL_CLASSES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 leading-none">Section</label>
                <div className="relative">
                  <select
                    name="section_assigned"
                    value={formData.section_assigned}
                    onChange={handleChange}
                    className="w-full h-12 bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-xl px-4 text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer transition-all"
                  >
                    <option value="">None</option>
                    {SCHOOL_SECTIONS.map((s) => (
                      <option key={s} value={s}>Section {s}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Date of Joining */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                <Calendar size={12} className="text-blue-500" />
                Commencement Date
              </label>
              <input
                name="date_of_joining"
                type="date"
                value={formData.date_of_joining}
                onChange={handleChange}
                className="w-full h-12 bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-xl px-4 text-sm font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300"
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                <User size={12} className="text-blue-500" />
                Gender Node
              </label>
              <div className="relative">
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full h-12 bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-xl px-4 text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer transition-all"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="mt-6 space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
              <MapPin size={12} className="text-blue-500" />
              Residential Node
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-xl text-sm font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300 resize-none"
              placeholder="Full residential address details..."
            ></textarea>
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
              className="w-full sm:w-auto h-12 px-8 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 order-1 sm:order-2"
            >
              {initialData ? (
                <>Update Records <Save size={16} /></>
              ) : (
                <>Authorize Access <Save size={16} /></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherForm;
