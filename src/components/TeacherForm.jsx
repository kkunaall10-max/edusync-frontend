import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { SCHOOL_CLASSES, SCHOOL_SECTIONS } from '../utils/constants';

const TeacherForm = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    subject: '',
    class_assigned: SCHOOL_CLASSES[3], // Default to Class 1
    section_assigned: SCHOOL_SECTIONS[0], // Default to A
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">{initialData ? 'Edit Teacher' : 'Add New Teacher'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Full Name</label>
              <input
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${errors.full_name ? 'border-red-500' : 'border-slate-200'} focus:ring-2 focus:ring-slate-900 outline-none`}
                placeholder="Dr. Sarah Johnson"
              />
              {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Employee ID</label>
              <input
                name="employee_id"
                value={formData.employee_id}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${errors.employee_id ? 'border-red-500' : 'border-slate-200'} focus:ring-2 focus:ring-slate-900 outline-none`}
                placeholder="EMP-101"
              />
              {errors.employee_id && <p className="text-xs text-red-500 mt-1">{errors.employee_id}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Email Address</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${errors.email ? 'border-red-500' : 'border-slate-200'} focus:ring-2 focus:ring-slate-900 outline-none`}
                placeholder="sarah@edusync.com"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Phone Number</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Subject</label>
              <input
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${errors.subject ? 'border-red-500' : 'border-slate-200'} focus:ring-2 focus:ring-slate-900 outline-none`}
                placeholder="Mathematics"
              />
              {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Class</label>
                <select
                  name="class_assigned"
                  value={formData.class_assigned}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none"
                >
                  <option value="">None</option>
                  {SCHOOL_CLASSES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Section</label>
                <select
                  name="section_assigned"
                  value={formData.section_assigned}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none"
                >
                  <option value="">None</option>
                  {SCHOOL_SECTIONS.map((s) => (
                    <option key={s} value={s}>Section {s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Date of Joining</label>
              <input
                name="date_of_joining"
                type="date"
                value={formData.date_of_joining}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none resize-none"
              placeholder="Residential address"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors"
            >
              {initialData ? 'Update Teacher' : 'Add Teacher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherForm;
