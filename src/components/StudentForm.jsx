import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, ChevronDown } from 'lucide-react';
import { SCHOOL_CLASSES, SCHOOL_SECTIONS } from '../utils/constants';

const API_URL = 'http://localhost:5000/api/students';

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

    // Inline Styles based on Stitch AI Design
    const styles = {
        overlay: {
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            fontFamily: "'Inter', sans-serif"
        },
        card: {
            width: '600px',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0px 12px 32px rgba(17, 24, 39, 0.15)',
            overflow: 'hidden'
        },
        header: {
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'between',
            alignItems: 'center',
            borderBottom: '1px solid #F1F5F9'
        },
        title: {
            fontSize: '20px',
            fontWeight: '600',
            color: '#0F172A',
            margin: 0
        },
        label: {
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            color: '#64748B',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '6px'
        },
        input: {
            width: '100%',
            height: '40px',
            padding: '0 12px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            fontSize: '14px',
            color: '#1E293B',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'all 0.2s'
        },
        select: {
            appearance: 'none',
            backgroundImage: 'none'
        },
        footer: {
            padding: '24px 20px',
            backgroundColor: 'rgba(248, 250, 252, 0.5)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            borderTop: '1px solid #F1F5F9'
        },
        btnCancel: {
            height: '36px',
            padding: '0 24px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #2563EB',
            color: '#2563EB',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
        },
        btnSave: {
            height: '36px',
            padding: '0 24px',
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.1)',
            transition: 'background-color 0.2s'
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.card} className="animate-in fade-in zoom-in duration-200">
                {/* Modal Header */}
                <div style={styles.header}>
                    <h2 style={styles.title}>{initialData ? 'Edit Student' : 'Add New Student'}</h2>
                    <button 
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '8px' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Content */}
                <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
                    {error && (
                        <div style={{ padding: '12px', backgroundColor: '#FEF2F2', color: '#B91C1C', borderRadius: '12px', fontSize: '12px', marginBottom: '16px', border: '1px solid #FEE2E2' }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
                        {/* Row 1 */}
                        <div>
                            <label style={styles.label}>Full Name</label>
                            <input 
                                style={styles.input}
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                placeholder="e.g. Johnathan Smith"
                                required
                            />
                        </div>
                        <div>
                            <label style={styles.label}>Roll Number</label>
                            <input 
                                style={styles.input}
                                name="roll_number"
                                value={formData.roll_number}
                                onChange={handleChange}
                                placeholder="ED-2024-XXXX"
                                required
                            />
                        </div>

                        {/* Row 2 */}
                        <div style={{ position: 'relative' }}>
                            <label style={styles.label}>Class</label>
                            <select 
                                style={{ ...styles.input, ...styles.select }}
                                name="class"
                                value={formData.class}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Grade</option>
                                {SCHOOL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <ChevronDown size={18} style={{ position: 'absolute', right: '12px', top: '34px', color: '#94A3B8', pointerEvents: 'none' }} />
                        </div>
                        <div style={{ position: 'relative' }}>
                            <label style={styles.label}>Section</label>
                            <select 
                                style={{ ...styles.input, ...styles.select }}
                                name="section"
                                value={formData.section}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Section</option>
                                {SCHOOL_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <ChevronDown size={18} style={{ position: 'absolute', right: '12px', top: '34px', color: '#94A3B8', pointerEvents: 'none' }} />
                        </div>

                        {/* Row 3 */}
                        <div>
                            <label style={styles.label}>Parent Email</label>
                            <input 
                                style={styles.input}
                                name="parent_email"
                                value={formData.parent_email}
                                onChange={handleChange}
                                placeholder="email@example.com"
                                type="email"
                            />
                        </div>
                        <div>
                            <label style={styles.label}>Parent Phone</label>
                            <input 
                                style={styles.input}
                                name="parent_phone"
                                value={formData.parent_phone}
                                onChange={handleChange}
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>

                        {/* Row 4 */}
                        <div style={{ position: 'relative' }}>
                            <label style={styles.label}>Gender</label>
                            <select 
                                style={{ ...styles.input, ...styles.select }}
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                            <ChevronDown size={18} style={{ position: 'absolute', right: '12px', top: '34px', color: '#94A3B8', pointerEvents: 'none' }} />
                        </div>
                        <div>
                            <label style={styles.label}>Date of Birth</label>
                            <input 
                                style={styles.input}
                                name="date_of_birth"
                                value={formData.date_of_birth}
                                onChange={handleChange}
                                type="date"
                            />
                        </div>

                        {/* Row 5 Full Width */}
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={styles.label}>Address</label>
                            <input 
                                style={styles.input}
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="123 Academic Way, Education District, City"
                            />
                        </div>

                        {/* Row 6 */}
                        <div>
                            <label style={styles.label}>Admission Date</label>
                            <input 
                                style={styles.input}
                                name="admission_date"
                                value={formData.admission_date}
                                onChange={handleChange}
                                type="date"
                            />
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div style={styles.footer}>
                        <button 
                            type="button"
                            onClick={onClose}
                            style={styles.btnCancel}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            style={{ 
                                ...styles.btnSave, 
                                opacity: loading ? 0.7 : 1, 
                                cursor: loading ? 'not-allowed' : 'pointer' 
                            }}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Student'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentForm;
