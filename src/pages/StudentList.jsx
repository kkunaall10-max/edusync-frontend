import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SCHOOL_CLASSES, SCHOOL_SECTIONS } from '../utils/constants';
import Layout from '../components/Layout';
import { 
  Menu, X, Bell, Users, BookOpen, GraduationCap, 
  Calendar, ClipboardCheck, TrendingUp, LogOut, ChevronRight, Search, Plus, FileSpreadsheet, Download, AlertCircle
} from 'lucide-react';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://edusync.up.railway.app') + '/api/students';
const TEACHERS_API_URL = (import.meta.env.VITE_API_URL || 'https://edusync.up.railway.app') + '/api/teachers';

const CSV_HEADERS = [
    'Full Name',
    'Roll Number',
    'Class',
    'Section',
    'Parent Email',
    'Parent Phone',
    'Gender',
    'Date of Birth'
];

const escapeCsvValue = (value) => {
    const text = String(value ?? '');
    if (/[",\n]/.test(text)) {
        return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
};

const parseCsvRow = (line) => {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
        const char = line[index];
        const nextChar = line[index + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                current += '"';
                index += 1;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
            continue;
        }

        current += char;
    }

    values.push(current.trim());
    return values;
};

const parseCsvContent = (content) => {
    const normalized = content.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
    const lines = normalized.split('\n').filter((line) => line.trim() !== '');
    if (lines.length < 2) return [];

    const headers = parseCsvRow(lines[0]);
    return lines.slice(1).map((line) => {
        const values = parseCsvRow(line);
        return headers.reduce((row, header, index) => {
            row[header] = values[index] ?? '';
            return row;
        }, {});
    });
};

const StudentList = ({ role = 'principal' }) => {
    const isTeacher = role === 'teacher';
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [user, setUser] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
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

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importPreview, setImportPreview] = useState([]);
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (isTeacher && user) {
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
        return () => window.removeEventListener('resize', handleResize);
    }, [isTeacher]);

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

    const downloadTemplate = () => {
        const templateRow = {
            'Full Name': 'Example Student',
            'Roll Number': '101',
            'Class': 'Class 5',
            'Section': 'A',
            'Parent Email': 'parent@example.com',
            'Parent Phone': '9876543210',
            'Gender': 'male',
            'Date of Birth': '2010-01-15'
        };

        const csvLines = [
            CSV_HEADERS.join(','),
            CSV_HEADERS.map((header) => escapeCsvValue(templateRow[header])).join(',')
        ];

        const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'EduSync_Student_Template.csv';
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleFileImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            if (!file.name.toLowerCase().endsWith('.csv')) {
                throw new Error('Please upload the EduSync CSV template. XLS and XLSX imports were disabled for security hardening.');
            }

            const content = await file.text();
            const rows = parseCsvContent(content);

            const mappedData = rows
                .map((row) => ({
                    full_name: row['Full Name'],
                    roll_number: String(row['Roll Number'] || ''),
                    class: row['Class'],
                    section: row['Section'],
                    parent_email: row['Parent Email'],
                    parent_phone: String(row['Parent Phone'] || ''),
                    gender: row['Gender'],
                    date_of_birth: row['Date of Birth']
                }))
                .filter((row) => row.full_name && row.roll_number && row.class && row.section);

            if (mappedData.length === 0) {
                throw new Error('The CSV did not contain any valid student rows.');
            }

            setImportPreview(mappedData);
            setImportResult(null);
            setIsImportModalOpen(true);
        } catch (err) {
            alert('Error reading CSV file: ' + err.message);
        } finally {
            e.target.value = null;
        }
    };

    const confirmBulkImport = async () => {
        setIsImporting(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/bulk-import`, { students: importPreview });
            setImportResult(res.data);
            fetchStudents();
        } catch (error) {
            alert('Error during bulk import: ' + (error.response?.data?.error || error.message));
        } finally {
            setIsImporting(false);
        }
    };

    const glass = {
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.25)',
        borderRadius: '12px'
    };

    const styles = {
        pageWrapper: {
            backgroundImage: isTeacher ? 'url(/nature-bg.jpg)' : 'none',
            backgroundColor: isTeacher ? 'transparent' : '#F8FAFC',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            minHeight: '100vh',
            fontFamily: "'Inter', sans-serif",
            color: isTeacher ? 'white' : 'inherit'
        },
        sidebar: {
            position: 'fixed',
            left: 0,
            top: 0,
            width: '220px',
            height: '100vh',
            background: isTeacher ? 'rgba(0,0,0,0.3)' : 'white',
            backdropFilter: isTeacher ? 'blur(20px)' : 'none',
            WebkitBackdropFilter: isTeacher ? 'blur(20px)' : 'none',
            border: isTeacher ? '1px solid rgba(255,255,255,0.15)' : '1px solid #E2E8F0',
            padding: '20px 14px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 100,
            transition: 'transform 0.3s ease',
            transform: isMobile ? (isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
            boxSizing: 'border-box'
        },
        navLink: {
            color: isTeacher ? 'white' : '#64748B',
            padding: '10px 12px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            marginBottom: '4px',
            fontSize: '14px',
            fontWeight: '500',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            width: '100%'
        },
        activeLink: {
            background: isTeacher ? 'rgba(255,255,255,0.25)' : '#EFF6FF',
            color: isTeacher ? 'white' : '#2563EB'
        },
        navbar: {
            position: 'fixed',
            top: 0,
            left: isMobile ? 0 : '220px',
            right: 0,
            height: '60px',
            background: isTeacher ? 'rgba(0,0,0,0.25)' : 'white',
            backdropFilter: isTeacher ? 'blur(20px)' : 'none',
            WebkitBackdropFilter: isTeacher ? 'blur(20px)' : 'none',
            borderBottom: isTeacher ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
            zIndex: 90,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            color: isTeacher ? 'white' : '#1E293B'
        },
        mainContent: {
            marginLeft: isMobile ? 0 : '220px',
            paddingTop: isMobile ? '76px' : '84px',
            paddingLeft: isMobile ? '16px' : '24px',
            paddingRight: isMobile ? '16px' : '24px',
            paddingBottom: isMobile ? '16px' : '24px'
        },
        card: {
            ...(isTeacher ? glass : { background: 'white', border: '1px solid #E2E8F0' }),
            padding: '16px'
        },
        label: {
            fontSize: '11px',
            letterSpacing: '1px',
            fontWeight: '700',
            textTransform: 'uppercase',
            color: isTeacher ? 'rgba(255,255,255,0.7)' : '#64748B',
            marginBottom: '4px',
            display: 'block'
        }
    };

    const TeacherSidebar = () => (
        <aside style={styles.sidebar}>
            <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'30px', padding:'0 5px', color:'white'}}>
                <GraduationCap size={24} />
                <span style={{fontSize:'18px', fontWeight:'800'}}>EduSync</span>
            </div>
            <nav style={{flex:1}}>
                {[
                    { label: 'Overview', icon: <TrendingUp size={18} />, path: '/dashboard/teacher' },
                    { label: 'My Students', icon: <Users size={18} />, path: '/dashboard/teacher/students' },
                    { label: 'Attendance', icon: <ClipboardCheck size={18} />, path: '/dashboard/teacher/attendance' },
                    { label: 'Homework', icon: <BookOpen size={18} />, path: '/dashboard/teacher/homework' },
                    { label: 'Marks Entry', icon: <GraduationCap size={18} />, path: '/dashboard/teacher/marks' },
                ].map((item) => (
                    <button 
                        key={item.label}
                        style={{
                            ...styles.navLink,
                            ...(window.location.pathname === item.path ? styles.activeLink : {})
                        }}
                        onClick={() => {
                            navigate(item.path);
                            if (isMobile) setIsMobileMenuOpen(false);
                        }}
                    >
                        {item.icon} {item.label}
                    </button>
                ))}
            </nav>
            <button onClick={async () => { await supabase.auth.signOut(); navigate('/login'); }} style={{...styles.navLink, color:'#FCA5A5', marginTop:'auto'}}>
                <LogOut size={18} /> Logout
            </button>
        </aside>
    );

    if (!isTeacher) {
        return (
            <Layout role="principal">
                <div className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 m-0 tracking-tight">Students</h2>
                            <p className="text-sm text-slate-500 mt-1 font-medium">{students.length.toLocaleString()} students enrolled</p>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                        <div className="relative w-full lg:max-w-md">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input 
                                className="w-full h-12 bg-white border border-slate-200 rounded-xl pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Search name or roll number..." 
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                            />
                        </div>
                        <div className="flex gap-2">
                            <button 
                                className="bg-slate-100 text-slate-700 h-12 px-4 rounded-xl font-bold hover:bg-slate-200 transition flex items-center gap-2"
                                title="Download Template"
                                onClick={downloadTemplate}
                            >
                                <Download size={18} />
                            </button>
                            <label className="bg-emerald-600 text-white h-12 px-6 rounded-xl font-bold hover:bg-emerald-700 transition cursor-pointer flex items-center gap-2">
                                <FileSpreadsheet size={18} />
                                Import CSV
                                <input type="file" accept=".csv" hidden onChange={handleFileImport} />
                            </label>
                            <button 
                                className="bg-blue-600 text-white h-12 px-6 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2"
                                onClick={() => handleOpenModal()}
                            >
                                <Plus size={18} /> Add Student
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-2xl border">
                            <label className="text-[10px] font-black text-slate-400">Class</label>
                            <select className="w-full h-10 bg-slate-50 border-none outline-none" value={filters.class} onChange={(e) => setFilters({...filters, class: e.target.value})}>
                                <option value="">All Classes</option>
                                {SCHOOL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border">
                            <label className="text-[10px] font-black text-slate-400">Section</label>
                            <select className="w-full h-10 bg-slate-50 border-none outline-none" value={filters.section} onChange={(e) => setFilters({...filters, section: e.target.value})}>
                                <option value="">All Sections</option>
                                {SCHOOL_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border">
                            <label className="text-[10px] font-black text-slate-400">Status</label>
                            <select className="w-full h-10 bg-slate-50 border-none outline-none" value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
                                <option>All Students</option>
                                <option>Active</option>
                                <option>Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border overflow-hidden">
                        <table className="w-full">
                            <thead><tr className="bg-slate-50"><th className="px-6 py-4 text-left text-[10px] uppercase">Roll</th><th className="px-6 py-4 text-left text-[10px] uppercase">Name</th><th className="px-6 py-4 text-right text-[10px] uppercase">Actions</th></tr></thead>
                            <tbody>
                                {students.map(s => (
                                    <tr key={s.id} className="border-t border-slate-100">
                                        <td className="px-6 py-4 font-bold text-blue-600">{s.roll_number}</td>
                                        <td className="px-6 py-4 font-bold">{s.full_name}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleOpenModal(s)} className="text-slate-400 hover:text-blue-600 mr-2">Edit</button>
                                            <button onClick={() => handleDelete(s.id)} className="text-slate-400 hover:text-red-500">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
                        <div className="bg-white w-full max-w-2xl rounded-3xl p-8 overflow-y-auto max-h-[90vh]">
                            <h3 className="text-2xl font-black mb-6">{selectedStudent ? 'Edit' : 'Add'} Student</h3>
                            <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
                                <input placeholder="Full Name" className="p-3 border rounded-xl" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
                                <input placeholder="Roll Number" className="p-3 border rounded-xl" value={formData.roll_number} onChange={e => setFormData({...formData, roll_number: e.target.value})} required />
                                <select className="p-3 border rounded-xl" value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} required>
                                    <option value="">Class</option>
                                    {SCHOOL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <select className="p-3 border rounded-xl" value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} required>
                                    <option value="">Section</option>
                                    {SCHOOL_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <input type="email" placeholder="Parent Email (parent@example.com)" className="p-3 border rounded-xl" value={formData.parent_email} onChange={e => setFormData({...formData, parent_email: e.target.value})} />
                                <input placeholder="Parent Phone (+91 XXXXX XXXXX)" className="p-3 border rounded-xl" value={formData.parent_phone} onChange={e => setFormData({...formData, parent_phone: e.target.value})} />
                                <div className="col-span-2">
                                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Date of Birth</label>
                                    <input type="date" className="w-full p-3 border rounded-xl" value={formData.date_of_birth} onChange={e => setFormData({...formData, date_of_birth: e.target.value})} />
                                </div>
                                <select className="p-3 border rounded-xl col-span-2" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                                <textarea placeholder="Full residential address" className="p-3 border rounded-xl col-span-2 min-h-[100px]" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                                <button type="submit" className="col-span-2 bg-blue-600 text-white p-4 rounded-xl font-bold mt-4">Save Student</button>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="col-span-2 text-slate-400 font-bold p-2">Cancel</button>
                            </form>
                        </div>
                    </div>
                )}
            </Layout>
        );
    }

    return (
        <div style={styles.pageWrapper}>
            {isMobile && isMobileMenuOpen && (
                <div 
                    style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:45}}
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <TeacherSidebar />

            <header style={styles.navbar}>
                <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                    {isMobile && <Menu onClick={() => setIsMobileMenuOpen(true)} cursor="pointer" />}
                    <h2 style={{fontSize:'16px', fontWeight:'700', margin:0}}>Learner Population</h2>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                    <Search size={18} />
                    <div style={{display:'flex', gap:'8px'}}>
                        <button 
                            onClick={downloadTemplate}
                            title="Download CSV Template"
                            style={{...glass, background:'rgba(255,255,255,0.1)', color:'white', border:'none', padding:'8px', borderRadius:'10px', cursor:'pointer'}}
                        >
                            <Download size={16} />
                        </button>
                        <label 
                            style={{...glass, background:'rgba(16,185,129,0.3)', color:'white', border:'1px solid rgba(16,185,129,0.5)', padding:'6px 12px', borderRadius:'10px', fontSize:'12px', fontWeight:'700', display:'flex', alignItems:'center', gap:'6px', cursor:'pointer'}}
                        >
                            <FileSpreadsheet size={16} /> Import CSV
                            <input type="file" accept=".csv" hidden onChange={handleFileImport} />
                        </label>
                        <button 
                            onClick={() => handleOpenModal()}
                            style={{...glass, background:'rgba(37,99,235,0.4)', color:'white', border:'1px solid rgba(37,99,235,0.5)', padding:'6px 12px', borderRadius:'10px', fontSize:'12px', fontWeight:'700', display:'flex', alignItems:'center', gap:'6px', cursor:'pointer'}}
                        >
                            <Plus size={16} /> Enroll
                        </button>
                    </div>
                    <div style={{width:'32px', height:'32px', borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', fontSize:'12px'}}>
                        {user?.email?.charAt(0).toUpperCase()}
                    </div>
                </div>
            </header>

            <main style={styles.mainContent}>
                <div style={{marginBottom:'24px'}}>
                    <div style={{...styles.card, display:'flex', alignItems:'center', gap:'12px'}}>
                        <Search size={18} opacity={0.6} />
                        <input 
                            placeholder="Identify learner by name or roll..."
                            style={{background:'none', border:'none', color:'white', fontSize:'14px', width:'100%', outline:'none'}}
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                        />
                    </div>
                </div>

                <div style={styles.card}>
                    <div style={{overflowX:'auto'}}>
                        <table style={{width:'100%', borderCollapse:'collapse'}}>
                            <thead>
                                <tr style={{borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
                                    <th style={{padding:'12px', textAlign:'left', fontSize:'11px', textTransform:'uppercase', opacity:0.6}}>Roll No</th>
                                    <th style={{padding:'12px', textAlign:'left', fontSize:'11px', textTransform:'uppercase', opacity:0.6}}>Full Identity</th>
                                    <th style={{padding:'12px', textAlign:'right', fontSize:'11px', textTransform:'uppercase', opacity:0.6}}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="3" style={{padding:'40px', textAlign:'center', opacity:0.5}}>Compiling learner list...</td></tr>
                                ) : (
                                    students.map(s => (
                                        <tr key={s.id} style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                                            <td style={{padding:'12px'}}>
                                                <span style={{color:'#60A5FA', fontSize:'14px', fontWeight:'800'}}>{s.roll_number}</span>
                                            </td>
                                            <td style={{padding:'12px'}}>
                                                <div style={{fontSize:'14px', fontWeight:'700'}}>{s.full_name}</div>
                                                <div style={{fontSize:'11px', opacity:0.5}}>Class {s.class}-{s.section}</div>
                                            </td>
                                            <td style={{padding:'12px', textAlign:'right'}}>
                                                <div style={{display:'flex', justifyContent:'flex-end', gap:'12px'}}>
                                                    <button onClick={() => handleOpenModal(s)} style={{background:'none', border:'none', color:'#60A5FA', cursor:'pointer'}}><ChevronRight size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {isModalOpen && (
                <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(5px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', zIndex:100}}>
                    <div style={{...glass, background: isTeacher ? 'rgba(40,40,40,0.8)' : 'white', border: isTeacher ? '1px solid rgba(255,255,255,0.1)' : '1px solid white', width:'100%', maxWidth:'500px', padding:'24px', position:'relative', color: isTeacher ? 'white' : 'inherit', borderRadius: '24px'}}>
                        <button onClick={() => setIsModalOpen(false)} style={{position:'absolute', right:'20px', top:'20px', background:'none', border:'none', color: isTeacher ? 'white' : '#64748B', cursor:'pointer'}}><X size={20} /></button>
                        <h3 style={{fontSize:'20px', fontWeight:'800', marginBottom:'20px'}}>Learner Dossier</h3>
                        <form onSubmit={handleSave} style={{display:'flex', flexDirection:'column', gap:'16px'}}>
                            <div>
                                <label style={styles.label}>Full Name</label>
                                <input style={{...glass, background: isTeacher ? 'rgba(255,255,255,0.05)' : '#F8FAFC', width:'100%', padding:'12px', boxSizing:'border-box', border: isTeacher ? 'none' : '1px solid #E2E8F0', color: isTeacher ? 'white' : 'black', borderRadius: '12px'}} value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
                            </div>
                            <div>
                                <label style={styles.label}>Roll Number</label>
                                <input style={{...glass, background: isTeacher ? 'rgba(255,255,255,0.05)' : '#F8FAFC', width:'100%', padding:'12px', boxSizing:'border-box', border: isTeacher ? 'none' : '1px solid #E2E8F0', color: isTeacher ? 'white' : 'black', borderRadius: '12px'}} value={formData.roll_number} onChange={e => setFormData({...formData, roll_number: e.target.value})} required />
                            </div>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
                                <div>
                                    <label style={styles.label}>Class</label>
                                    <select style={{...glass, background: isTeacher ? 'rgba(255,255,255,0.05)' : '#F8FAFC', width:'100%', padding:'12px', border: isTeacher ? 'none' : '1px solid #E2E8F0', color: isTeacher ? 'white' : 'black', borderRadius: '12px'}} value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} required>
                                        <option value="">Class</option>
                                        {SCHOOL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={styles.label}>Section</label>
                                    <select style={{...glass, background: isTeacher ? 'rgba(255,255,255,0.05)' : '#F8FAFC', width:'100%', padding:'12px', border: isTeacher ? 'none' : '1px solid #E2E8F0', color: isTeacher ? 'white' : 'black', borderRadius: '12px'}} value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} required>
                                        <option value="">Section</option>
                                        {SCHOOL_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
                                <div>
                                    <label style={styles.label}>Parent Email</label>
                                    <input type="email" placeholder="parent@example.com" style={{...glass, background: isTeacher ? 'rgba(255,255,255,0.05)' : '#F8FAFC', width:'100%', padding:'12px', boxSizing:'border-box', border: isTeacher ? 'none' : '1px solid #E2E8F0', color: isTeacher ? 'white' : 'black', borderRadius: '12px'}} value={formData.parent_email} onChange={e => setFormData({...formData, parent_email: e.target.value})} />
                                </div>
                                <div>
                                    <label style={styles.label}>Parent Phone</label>
                                    <input placeholder="+91 XXXXX XXXXX" style={{...glass, background: isTeacher ? 'rgba(255,255,255,0.05)' : '#F8FAFC', width:'100%', padding:'12px', boxSizing:'border-box', border: isTeacher ? 'none' : '1px solid #E2E8F0', color: isTeacher ? 'white' : 'black', borderRadius: '12px'}} value={formData.parent_phone} onChange={e => setFormData({...formData, parent_phone: e.target.value})} />
                                </div>
                            </div>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
                                <div>
                                    <label style={styles.label}>Date of Birth</label>
                                    <input type="date" style={{...glass, background: isTeacher ? 'rgba(255,255,255,0.05)' : '#F8FAFC', width:'100%', padding:'12px', boxSizing:'border-box', border: isTeacher ? 'none' : '1px solid #E2E8F0', color: isTeacher ? 'white' : 'black', borderRadius: '12px'}} value={formData.date_of_birth} onChange={e => setFormData({...formData, date_of_birth: e.target.value})} />
                                </div>
                                <div>
                                    <label style={styles.label}>Gender</label>
                                    <select style={{...glass, background: isTeacher ? 'rgba(255,255,255,0.05)' : '#F8FAFC', width:'100%', padding:'12px', border: isTeacher ? 'none' : '1px solid #E2E8F0', color: isTeacher ? 'white' : 'black', borderRadius: '12px'}} value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={styles.label}>Address</label>
                                <textarea placeholder="Full residential address" style={{...glass, background: isTeacher ? 'rgba(255,255,255,0.05)' : '#F8FAFC', width:'100%', padding:'12px', boxSizing:'border-box', border: isTeacher ? 'none' : '1px solid #E2E8F0', color: isTeacher ? 'white' : 'black', borderRadius: '12px', minHeight: '80px'}} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                            </div>
                            <button type="submit" style={{marginTop:'10px', background:'#2563EB', color:'white', border:'none', padding:'14px', borderRadius:'10px', fontWeight:'800', cursor:'pointer'}}>Sync Data</button>
                        </form>
                    </div>
                </div>
            )}

            {isImportModalOpen && (
                <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(5px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', zIndex:110}}>
                    <div style={{...glass, background: isTeacher ? 'rgba(30,30,30,0.9)' : 'white', width:'100%', maxWidth:'700px', padding:'32px', borderRadius:'24px', color: isTeacher ? 'white' : 'inherit', maxHeight:'80vh', overflowY:'auto'}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px'}}>
                            <h3 style={{fontSize:'22px', fontWeight:'900', margin:0}}>Import Students</h3>
                            <button onClick={() => setIsImportModalOpen(false)} style={{background:'none', border:'none', color: isTeacher ? 'white' : '#64748B', cursor:'pointer'}}><X size={24} /></button>
                        </div>

                        {!importResult ? (
                            <>
                                <p style={{fontSize:'14px', opacity:0.7, marginBottom:'20px'}}>
                                    We found <b>{importPreview.length} students</b> in your file. Please review the first few rows below:
                                </p>
                                <div style={{overflowX:'auto', marginBottom:'24px'}}>
                                    <table style={{width:'100%', borderCollapse:'collapse', fontSize:'13px'}}>
                                        <thead>
                                            <tr style={{borderBottom:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)'}}>
                                                <th style={{padding:'8px', textAlign:'left'}}>Roll</th>
                                                <th style={{padding:'8px', textAlign:'left'}}>Name</th>
                                                <th style={{padding:'8px', textAlign:'left'}}>Class</th>
                                                <th style={{padding:'8px', textAlign:'left'}}>Parent Phone</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {importPreview.slice(0, 5).map((row, idx) => (
                                                <tr key={idx} style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                                                    <td style={{padding:'8px'}}>{row.roll_number}</td>
                                                    <td style={{padding:'8px'}}>{row.full_name}</td>
                                                    <td style={{padding:'8px'}}>{row.class}-{row.section}</td>
                                                    <td style={{padding:'8px'}}>{row.parent_phone}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div style={{display:'flex', gap:'12px'}}>
                                    <button 
                                        disabled={isImporting}
                                        onClick={confirmBulkImport}
                                        style={{flex:2, background:'#10B981', color:'white', border:'none', padding:'14px', borderRadius:'12px', fontWeight:'800', cursor: isImporting ? 'not-allowed' : 'pointer', opacity: isImporting ? 0.7 : 1}}
                                    >
                                        {isImporting ? 'Processing Students...' : 'Confirm & Import All'}
                                    </button>
                                    <button 
                                        onClick={() => setIsImportModalOpen(false)}
                                        style={{flex:1, background:'rgba(255,255,255,0.1)', color: isTeacher ? 'white' : '#64748B', border:'1px solid rgba(0,0,0,0.1)', padding:'14px', borderRadius:'12px', fontWeight:'800', cursor:'pointer'}}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div style={{textAlign:'center', padding:'20px 0'}}>
                                <div style={{width:'64px', height:'64px', background:'rgba(16,185,129,0.2)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px'}}>
                                    <FileSpreadsheet size={32} color="#10B981" />
                                </div>
                                <h4 style={{fontSize:'20px', fontWeight:'900', marginBottom:'8px'}}>Import Complete</h4>
                                <p style={{fontSize:'16px', marginBottom:'24px', opacity:0.8}}>
                                    Successfully imported <b>{importResult.success}</b> students.<br/>
                                    Skipped <b>{importResult.skipped}</b> duplicates.
                                </p>
                                {importResult.errors?.length > 0 && (
                                    <div style={{textAlign:'left', background:'rgba(239,68,68,0.1)', padding:'16px', borderRadius:'12px', marginBottom:'24px', border:'1px solid rgba(239,68,68,0.2)'}}>
                                        <div style={{display:'flex', alignItems:'center', gap:'8px', color:'#EF4444', fontWeight:'700', marginBottom:'8px', fontSize:'14px'}}>
                                            <AlertCircle size={16} /> Issues encountered:
                                        </div>
                                        <ul style={{margin:0, paddingLeft:'20px', fontSize:'12px', opacity:0.8}}>
                                            {importResult.errors.map((err, i) => <li key={i}>{err.student}: {err.error}</li>)}
                                        </ul>
                                    </div>
                                )}
                                <button 
                                    onClick={() => setIsImportModalOpen(false)}
                                    style={{background:'#2563EB', color:'white', border:'none', padding:'14px 40px', borderRadius:'12px', fontWeight:'800', cursor:'pointer'}}
                                >
                                    Done
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentList;
