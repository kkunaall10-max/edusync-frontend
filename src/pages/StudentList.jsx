import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SCHOOL_CLASSES, SCHOOL_SECTIONS } from '../utils/constants';

const API_BASE_URL = 'https://web-production-d7c5e.up.railway.app/api/students';
const TEACHERS_API_URL = 'https://web-production-d7c5e.up.railway.app/api/teachers';

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
    const [showDropdown, setShowDropdown] = useState(false);

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

    // Side Effects
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
            
            // Local filtering for status if needed (mocked for now as per design)
            let filtered = response.data;
            if (filters.status !== 'All') {
                // Mock: just filter by index parity for demo purposes if DB doesn't have status
                // Real: response.data.filter(s => s.status === filters.status)
            }
            setStudents(filtered);
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

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    // Styles (Consistent with Principal Dashboard)
    const styles = {
        wrapper: {display:'flex', minHeight:'100vh', backgroundColor:'#F9FAFB', fontFamily:'Inter, sans-serif'},
        sidebar: {width:'240px', minHeight:'100vh', backgroundColor:'#FFFFFF', borderRight:'1px solid #E5E7EB', padding:'24px 16px', display:'flex', flexDirection:'column', position:'fixed', top:0, left:0},
        logoArea: {marginBottom:'32px'},
        logoText: {fontSize:'22px', fontWeight:'700', color:'#2563EB', margin:0},
        portalLabel: {fontSize:'11px', color:'#6B7280', textTransform:'uppercase', margin:0, letterSpacing:'0.05em'},
        navLink: {display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderRadius:'8px', color:'#6B7280', textDecoration:'none', fontSize:'14px', fontWeight:'500', marginBottom:'4px', cursor:'pointer'},
        navLinkActive: {display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderRadius:'8px', color:'#2563EB', backgroundColor:'#EFF6FF', textDecoration:'none', fontSize:'14px', fontWeight:'600', marginBottom:'4px', cursor:'pointer'},
        main: {marginLeft:'240px', flex:1},
        header: {height:'64px', backgroundColor:'#FFFFFF', borderBottom:'1px solid #E5E7EB', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 32px', position:'sticky', top:0, zIndex:10},
        headerTitle: {fontSize:'18px', fontWeight:'600', color:'#111827', margin:0},
        content: {padding:'32px'},
        pageTitle: {fontSize:'32px', fontWeight:'800', color:'#111827', margin:0, letterSpacing:'-0.02em'},
        pageSubtitle: {fontSize:'14px', color:'#6B7280', marginTop:'4px', margin:0},
        topToolBar: {display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px'},
        searchContainer: {position:'relative', width:'400px'},
        searchInput: {width:'100%', height:'48px', backgroundColor:'#FFFFFF', border:'1px solid #E5E7EB', borderRadius:'12px', paddingLeft:'44px', paddingRight:'16px', fontSize:'14px', color:'#111827', outline:'none', boxShadow:'0 1px 2px rgba(0,0,0,0.05)'},
        btnPrimary: {display:'flex', alignItems:'center', gap:'8px', padding:'12px 24px', backgroundColor:'#2563EB', color:'#FFFFFF', border:'none', borderRadius:'12px', fontSize:'14px', fontWeight:'700', cursor:'pointer', transition:'all 0.2s', boxShadow:'0 4px 12px rgba(37, 99, 235, 0.2)'},
        filtersRow: {display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'24px', marginBottom:'32px'},
        filterCard: {backgroundColor:'#FFFFFF', padding:'16px', borderRadius:'16px', border:'1px solid #E5E7EB', boxShadow:'0 1px 3px rgba(0,0,0,0.05)'},
        filterLabel: {display:'block', fontSize:'11px', fontWeight:'700', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'8px'},
        select: {width:'100%', height:'40px', border:'none', backgroundColor:'#F9FAFB', borderRadius:'8px', padding:'0 12px', fontSize:'14px', fontWeight:'600', color:'#111827', outline:'none', cursor:'pointer'},
        tableCard: {backgroundColor:'#FFFFFF', borderRadius:'24px', border:'1px solid #E5E7EB', overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,0.05)'},
        th: {backgroundColor:'#F9FAFB', padding:'16px 24px', fontSize:'11px', fontWeight:'800', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.08em', borderBottom:'1px solid #E5E7EB'},
        td: {padding:'16px 24px', fontSize:'14px', color:'#111827', borderBottom:'1px solid #F3F4F6'},
        avatar: {width:'36px', height:'36px', borderRadius:'50%', backgroundColor:'#EFF6FF', color:'#2563EB', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700'},
        badge: (color) => ({display:'inline-flex', padding:'4px 12px', borderRadius:'9999px', fontSize:'10px', fontWeight:'800', textTransform:'uppercase', letterSpacing:'0.05em', ...color}),
        modalOverlay: {position:'fixed', inset:0, backgroundColor:'rgba(17, 24, 39, 0.4)', backdropFilter:'blur(8px)', display:'flex', itemsCenter:'center', justifyContent:'center', zIndex:'100', padding:'24px'},
        modalCard: {width:'100%', maxWidth:'640px', backgroundColor:'#FFFFFF', borderRadius:'24px', display:'flex', flexDirection:'column', maxHeight:'90vh', boxShadow:'0 25px 50px -12px rgba(0,0,0,0.2)'},
        modalHeader: {padding:'24px 32px', borderBottom:'1px solid #F3F4F6'},
        modalBody: {padding:'32px', overflowY:'auto'},
        modalFooter: {padding:'24px 32px', backgroundColor:'#F9FAFB', borderTop:'1px solid #F3F4F6', display:'flex', justifyContent:'flex-end', gap:'12px'},
        formLabel: {display:'block', fontSize:'11px', fontWeight:'700', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'8px'},
        formInput: {width:'100%', height:'44px', backgroundColor:'#F9FAFB', border:'1px solid #E5E7EB', borderRadius:'12px', padding:'0 16px', fontSize:'14px', outline:'none', transition:'all 0.2s'}
    };

    const getInitials = (name) => {
        if (!name) return '??';
        const parts = name.split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name[0].toUpperCase();
    };

    const statusColors = {
        Paid: {backgroundColor:'#ECFDF5', color:'#059669'},
        Overdue: {backgroundColor:'#FEF2F2', color:'#DC2626'},
        Pending: {backgroundColor:'#FFFBEB', color:'#D97706'},
        'N/A': {backgroundColor:'#F3F4F6', color:'#6B7280'}
    };

    return (
        <div style={styles.wrapper}>
            {/* Sidebar Replicated */}
            <aside style={styles.sidebar}>
                <div style={styles.logoArea}>
                    <h1 style={styles.logoText}>EduSync</h1>
                    <p style={styles.portalLabel}>Management Portal</p>
                </div>
                <nav style={{flex:1}}>
                    <a onClick={() => navigate('/dashboard/principal')} style={styles.navLink}>
                        <span className="material-symbols-outlined">dashboard</span>
                        <span>Overview</span>
                    </a>
                    <a onClick={() => navigate('/dashboard/students')} style={styles.navLinkActive}>
                        <span className="material-symbols-outlined">group</span>
                        <span>Students</span>
                    </a>
                    <a onClick={() => navigate('/dashboard/teachers')} style={styles.navLink}>
                        <span className="material-symbols-outlined">person</span>
                        <span>Teachers</span>
                    </a>
                    <a onClick={() => navigate('/dashboard/attendance')} style={styles.navLink}>
                        <span className="material-symbols-outlined">calendar_today</span>
                        <span>Attendance</span>
                    </a>
                    <a onClick={() => navigate('/dashboard/fees')} style={styles.navLink}>
                        <span className="material-symbols-outlined">payments</span>
                        <span>Fees</span>
                    </a>
                    <a onClick={() => navigate('/dashboard/homework')} style={styles.navLink}>
                        <span className="material-symbols-outlined">assignment</span>
                        <span>Homework</span>
                    </a>
                    <a onClick={() => navigate('/dashboard/marks')} style={styles.navLink}>
                        <span className="material-symbols-outlined">grade</span>
                        <span>Marks</span>
                    </a>
                    <a onClick={() => navigate('/dashboard/reports')} style={styles.navLink}>
                        <span className="material-symbols-outlined">assessment</span>
                        <span>Reports</span>
                    </a>
                </nav>
            </aside>

            <div style={styles.main}>
                <header style={styles.header}>
                    <h2 style={styles.headerTitle}>Student Management</h2>
                    <div 
                        style={{display:'flex', alignItems:'center', gap:'16px', position: 'relative', cursor: 'pointer'}}
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <div style={{textAlign:'right'}}>
                            <p style={{fontSize:'13px', fontWeight:'600', color:'#111827', margin:0}}>{user?.email?.split('@')[0] || 'Administrator'}</p>
                            <p style={{fontSize:'10px', color:'#6B7280', margin:0, textTransform:'uppercase'}}>{role === 'teacher' ? 'Class Teacher' : 'Institutional Admin'}</p>
                        </div>
                        <div style={{width:'36px', height:'36px', backgroundColor:'#F3F4F6', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#9CA3AF'}}>
                            <span className="material-symbols-outlined">account_circle</span>
                        </div>

                        {showDropdown && (
                            <div style={{
                                position: 'absolute',
                                top: '48px',
                                right: 0,
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #E5E7EB',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                padding: '8px',
                                zIndex: 100,
                                minWidth: '140px'
                            }}>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        textAlign: 'left',
                                        background: 'none',
                                        border: 'none',
                                        color: '#DC2626',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        borderRadius: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                <main style={styles.content}>
                    <div style={{marginBottom:'40px'}}>
                        <h2 style={styles.pageTitle}>Students</h2>
                        <p style={styles.pageSubtitle}>{students.length.toLocaleString()} students enrolled</p>
                    </div>

                    <div style={styles.topToolBar}>
                        <div style={styles.searchContainer}>
                            <span className="material-symbols-outlined" style={{position:'absolute', left:'16px', top:'12px', color:'#9CA3AF'}}>search</span>
                            <input 
                                style={styles.searchInput} 
                                placeholder="Search by name or roll number..." 
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                            />
                        </div>
                        <button style={styles.btnPrimary} onClick={() => handleOpenModal()}>
                            <span className="material-symbols-outlined">add</span>
                            Add Student
                        </button>
                    </div>

                    <div style={styles.filtersRow}>
                        <div style={styles.filterCard}>
                            <label style={styles.filterLabel}>Class</label>
                            <select 
                                style={styles.select}
                                value={filters.class}
                                onChange={(e) => setFilters(prev => ({...prev, class: e.target.value}))}
                                disabled={role === 'teacher'}
                            >
                                <option value="">All Classes</option>
                                {SCHOOL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div style={styles.filterCard}>
                            <label style={styles.filterLabel}>Section</label>
                            <select 
                                style={styles.select}
                                value={filters.section}
                                onChange={(e) => setFilters(prev => ({...prev, section: e.target.value}))}
                                disabled={role === 'teacher'}
                            >
                                <option value="">All Sections</option>
                                {SCHOOL_SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
                            </select>
                        </div>
                        <div style={styles.filterCard}>
                            <label style={styles.filterLabel}>Status</label>
                            <select 
                                style={styles.select}
                                value={filters.status}
                                onChange={(e) => setFilters(prev => ({...prev, status: e.target.value}))}
                            >
                                <option value="All">All Students</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div style={styles.tableCard}>
                        <div style={{overflowX:'auto'}}>
                            <table style={{width:'100%', borderCollapse:'collapse'}}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>Roll No</th>
                                        <th style={styles.th}>Full Name</th>
                                        <th style={styles.th}>Class</th>
                                        <th style={styles.th}>Section</th>
                                        <th style={styles.th}>Parent Phone</th>
                                        <th style={styles.th}>Fee Status</th>
                                        <th style={{...styles.th, textAlign:'right'}}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" style={{...styles.td, textAlign:'center', padding:'64px', color:'#9CA3AF'}}>Loading data...</td>
                                        </tr>
                                    ) : students.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" style={{...styles.td, textAlign:'center', padding:'64px', color:'#9CA3AF'}}>
                                                <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                                                    <span className="material-symbols-outlined" style={{fontSize:'48px', marginBottom:'16px'}}>group_off</span>
                                                    <p style={{fontWeight:'600', fontSize:'16px', color:'#111827'}}>No students found</p>
                                                    <p style={{fontSize:'13px'}}>Adjust your filters or add a new record.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        students.map((student) => (
                                            <tr key={student.id} style={{transition:'background-color 0.2s'}} onMouseEnter={(e)=>e.currentTarget.style.backgroundColor='#F9FAFB'} onMouseLeave={(e)=>e.currentTarget.style.backgroundColor='transparent'}>
                                                <td style={{...styles.td, fontWeight:'700', color:'#2563EB', fontFamily:'monospace'}}>{student.roll_number}</td>
                                                <td style={styles.td}>
                                                    <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                                                        <div style={styles.avatar}>{getInitials(student.full_name)}</div>
                                                        <span style={{fontWeight:'600'}}>{student.full_name}</span>
                                                    </div>
                                                </td>
                                                <td style={styles.td}>{student.class}</td>
                                                <td style={styles.td}>{student.section}</td>
                                                <td style={{...styles.td, color:'#6B7280'}}>{student.parent_phone || 'N/A'}</td>
                                                <td style={styles.td}>
                                                    <span style={styles.badge(statusColors['N/A'])}>Pending</span>
                                                </td>
                                                <td style={{...styles.td, textAlign:'right'}}>
                                                    <div style={{display:'flex', justifyContent:'flex-end', gap:'8px'}}>
                                                        <button onClick={() => handleOpenModal(student)} style={{background:'none', border:'none', padding:'8px', cursor:'pointer', color:'#9CA3AF'}} className="hover-blue">
                                                            <span className="material-symbols-outlined text-sm">edit</span>
                                                        </button>
                                                        <button onClick={() => handleDelete(student.id)} style={{background:'none', border:'none', padding:'8px', cursor:'pointer', color:'#9CA3AF'}} className="hover-red">
                                                            <span className="material-symbols-outlined text-sm">delete</span>
                                                        </button>
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
            </div>

            {/* Integrated Student Modal */}
            {isModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalCard}>
                        <div style={styles.modalHeader}>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                <div>
                                    <h3 style={{fontSize:'20px', fontWeight:'800', color:'#111827', margin:0}}>{selectedStudent ? 'Edit Student' : 'Add Student'}</h3>
                                    <p style={{fontSize:'13px', color:'#6B7280', margin:0, marginTop:'4px'}}>Institution Enrollment System</p>
                                </div>
                                <span onClick={() => setIsModalOpen(false)} className="material-symbols-outlined" style={{cursor:'pointer', color:'#9CA3AF'}}>close</span>
                            </div>
                        </div>
                        <form onSubmit={handleSave}>
                            <div style={styles.modalBody}>
                                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px'}}>
                                    <div>
                                        <label style={styles.formLabel}>Full Name</label>
                                        <input 
                                            style={styles.formInput} 
                                            placeholder="e.g. John Doe" 
                                            required 
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label style={styles.formLabel}>Roll Number</label>
                                        <input 
                                            style={styles.formInput} 
                                            placeholder="e.g. 101" 
                                            required 
                                            value={formData.roll_number}
                                            onChange={(e) => setFormData({...formData, roll_number: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label style={styles.formLabel}>Class</label>
                                        <select 
                                            style={styles.formInput} 
                                            required
                                            value={formData.class}
                                            onChange={(e) => setFormData({...formData, class: e.target.value})}
                                        >
                                            <option value="">Select Class</option>
                                            {SCHOOL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={styles.formLabel}>Section</label>
                                        <select 
                                            style={styles.formInput} 
                                            required
                                            value={formData.section}
                                            onChange={(e) => setFormData({...formData, section: e.target.value})}
                                        >
                                            <option value="">Select Section</option>
                                            {SCHOOL_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={styles.formLabel}>Parent Email</label>
                                        <input 
                                            style={styles.formInput} 
                                            type="email" 
                                            placeholder="parent@example.com"
                                            value={formData.parent_email}
                                            onChange={(e) => setFormData({...formData, parent_email: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label style={styles.formLabel}>Parent Phone</label>
                                        <input 
                                            style={styles.formInput} 
                                            placeholder="+91 XXXXX XXXXX"
                                            value={formData.parent_phone}
                                            onChange={(e) => setFormData({...formData, parent_phone: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label style={styles.formLabel}>Gender</label>
                                        <select 
                                            style={styles.formInput}
                                            value={formData.gender}
                                            onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={styles.formLabel}>Date of Birth</label>
                                        <input 
                                            style={styles.formInput} 
                                            type="date"
                                            value={formData.date_of_birth}
                                            onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                                        />
                                    </div>
                                    <div style={{gridColumn:'span 2'}}>
                                        <label style={styles.formLabel}>Address</label>
                                        <textarea 
                                            style={{...styles.formInput, height:'80px', paddingTop:'12px'}} 
                                            placeholder="Street, City, Zip"
                                            value={formData.address}
                                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                            <div style={styles.modalFooter}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{padding:'10px 24px', backgroundColor:'transparent', border:'none', color:'#6B7280', fontWeight:'700', cursor:'pointer'}}>Cancel</button>
                                <button type="submit" style={styles.btnPrimary}>Save Student</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .hover-blue:hover { color: #2563EB !important; background-color: #EFF6FF; border-radius: 8px; }
                .hover-red:hover { color: #EF4444 !important; background-color: #FEF2F2; border-radius: 8px; }
            `}</style>
        </div>
    );
};

export default StudentList;

