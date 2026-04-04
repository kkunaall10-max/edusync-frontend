import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SCHOOL_CLASSES, SCHOOL_SECTIONS } from '../utils/constants';

const API_BASE_URL = 'http://localhost:5000/api/teachers';

const TeacherList = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [user, setUser] = useState(null);
    const [search, setSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

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

    // Side Effects
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

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    // Styles (Consistent with Principal Dashboard and Student List)
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
        tableCard: {backgroundColor:'#FFFFFF', borderRadius:'24px', border:'1px solid #E5E7EB', overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,0.05)'},
        th: {backgroundColor:'#F9FAFB', padding:'16px 24px', fontSize:'11px', fontWeight:'800', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.08em', borderBottom:'1px solid #E5E7EB'},
        td: {padding:'16px 24px', fontSize:'14px', color:'#111827', borderBottom:'1px solid #F3F4F6'},
        avatar: (color) => ({width:'40px', height:'40px', borderRadius:'50%', backgroundColor:color.bg || '#EFF6FF', color:color.text || '#2563EB', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:'700'}),
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
                    <a onClick={() => navigate('/dashboard/students')} style={styles.navLink}>
                        <span className="material-symbols-outlined">group</span>
                        <span>Students</span>
                    </a>
                    <a onClick={() => navigate('/dashboard/teachers')} style={styles.navLinkActive}>
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
                    <h2 style={styles.headerTitle}>Teacher Management</h2>
                    <div 
                        style={{display:'flex', alignItems:'center', gap:'16px', position: 'relative', cursor: 'pointer'}}
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <div style={{textAlign:'right'}}>
                            <p style={{fontSize:'13px', fontWeight:'600', color:'#111827', margin:0}}>{user?.email?.split('@')[0] || 'Administrator'}</p>
                            <p style={{fontSize:'10px', color:'#6B7280', margin:0, textTransform:'uppercase'}}>Institutional Admin</p>
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
                        <h2 style={styles.pageTitle}>Teachers</h2>
                        <p style={styles.pageSubtitle}>{teachers.length} professional educators registered</p>
                    </div>

                    <div style={styles.topToolBar}>
                        <div style={styles.searchContainer}>
                            <span className="material-symbols-outlined" style={{position:'absolute', left:'16px', top:'12px', color:'#9CA3AF'}}>search</span>
                            <input 
                                style={styles.searchInput} 
                                placeholder="Search by name or employee ID..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button style={styles.btnPrimary} onClick={() => handleOpenModal()}>
                            <span className="material-symbols-outlined">person_add</span>
                            Add Teacher
                        </button>
                    </div>

                    <div style={styles.tableCard}>
                        <div style={{overflowX:'auto'}}>
                            <table style={{width:'100%', borderCollapse:'collapse'}}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>Employee ID</th>
                                        <th style={styles.th}>Full Name</th>
                                        <th style={styles.th}>Subject</th>
                                        <th style={styles.th}>Assigned Class</th>
                                        <th style={styles.th}>Phone</th>
                                        <th style={{...styles.th, textAlign:'right'}}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" style={{...styles.td, textAlign:'center', padding:'64px', color:'#9CA3AF'}}>Loading data...</td>
                                        </tr>
                                    ) : teachers.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" style={{...styles.td, textAlign:'center', padding:'64px', color:'#9CA3AF'}}>
                                                <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                                                    <span className="material-symbols-outlined" style={{fontSize:'48px', marginBottom:'16px'}}>person_off</span>
                                                    <p style={{fontWeight:'600', fontSize:'16px', color:'#111827'}}>No teachers found</p>
                                                    <p style={{fontSize:'13px'}}>Register a new educator to get started.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        teachers.map((teacher, idx) => (
                                            <tr key={teacher.id} style={{transition:'background-color 0.2s'}} onMouseEnter={(e)=>e.currentTarget.style.backgroundColor='#F9FAFB'} onMouseLeave={(e)=>e.currentTarget.style.backgroundColor='transparent'}>
                                                <td style={{...styles.td, fontWeight:'700', color:'#2563EB', fontFamily:'monospace'}}>{teacher.employee_id}</td>
                                                <td style={styles.td}>
                                                    <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                                                        <div style={styles.avatar(idx % 2 === 0 ? {bg:'#EFF6FF', text:'#2563EB'} : {bg:'#FFF1F2', text:'#E11D48'})}>
                                                            {getInitials(teacher.full_name)}
                                                        </div>
                                                        <div>
                                                            <span style={{fontWeight:'600', display:'block'}}>{teacher.full_name}</span>
                                                            <span style={{fontSize:'11px', color:'#6B7280', fontStyle:'italic'}}>{teacher.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={styles.badge({backgroundColor:'#F0F9FF', color:'#0369A1', border:'1px solid #E0F2FE'})}>
                                                        {teacher.subject}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    {teacher.class_assigned ? (
                                                        <span style={{fontWeight:'600', color:'#374151'}}>
                                                            {teacher.class_assigned}-{teacher.section_assigned || 'A'}
                                                        </span>
                                                    ) : (
                                                        <span style={{color:'#9CA3AF', fontStyle:'italic'}}>Unassigned</span>
                                                    )}
                                                </td>
                                                <td style={{...styles.td, color:'#6B7280'}}>{teacher.phone || 'N/A'}</td>
                                                <td style={{...styles.td, textAlign:'right'}}>
                                                    <div style={{display:'flex', justifyContent:'flex-end', gap:'8px'}}>
                                                        <button onClick={() => handleOpenModal(teacher)} style={{background:'none', border:'none', padding:'8px', cursor:'pointer', color:'#9CA3AF'}} className="hover-blue">
                                                            <span className="material-symbols-outlined text-sm">edit</span>
                                                        </button>
                                                        <button onClick={() => handleDelete(teacher.id)} style={{background:'none', border:'none', padding:'8px', cursor:'pointer', color:'#9CA3AF'}} className="hover-red">
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

            {/* Integrated Teacher Modal */}
            {isModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalCard}>
                        <div style={styles.modalHeader}>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                <div>
                                    <h3 style={{fontSize:'20px', fontWeight:'800', color:'#111827', margin:0}}>{selectedTeacher ? 'Edit Teacher' : 'Add Teacher'}</h3>
                                    <p style={{fontSize:'13px', color:'#6B7280', margin:0, marginTop:'4px'}}>Institution Faculty Management</p>
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
                                            placeholder="e.g. Sarah Jenkins" 
                                            required 
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label style={styles.formLabel}>Employee ID</label>
                                        <input 
                                            style={styles.formInput} 
                                            placeholder="e.g. EDU-TR-101" 
                                            required 
                                            value={formData.employee_id}
                                            onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label style={styles.formLabel}>Email Address</label>
                                        <input 
                                            style={styles.formInput} 
                                            type="email" 
                                            placeholder="sarah@edusync.edu"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label style={styles.formLabel}>Phone Number</label>
                                        <input 
                                            style={styles.formInput} 
                                            placeholder="+91 XXXXX XXXXX"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label style={styles.formLabel}>Subject</label>
                                        <input 
                                            style={styles.formInput} 
                                            placeholder="e.g. Mathematics" 
                                            required 
                                            value={formData.subject}
                                            onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                        />
                                    </div>
                                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
                                        <div>
                                            <label style={styles.formLabel}>Class</label>
                                            <select 
                                                style={styles.formInput}
                                                value={formData.class_assigned}
                                                onChange={(e) => setFormData({...formData, class_assigned: e.target.value})}
                                            >
                                                <option value="">None</option>
                                                {SCHOOL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={styles.formLabel}>Section</label>
                                            <select 
                                                style={styles.formInput}
                                                value={formData.section_assigned}
                                                onChange={(e) => setFormData({...formData, section_assigned: e.target.value})}
                                            >
                                                <option value="">None</option>
                                                {SCHOOL_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label style={styles.formLabel}>Gender</label>
                                        <select 
                                            style={styles.formInput}
                                            value={formData.gender}
                                            onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={styles.formLabel}>Date of Joining</label>
                                        <input 
                                            style={styles.formInput} 
                                            type="date"
                                            value={formData.date_of_joining}
                                            onChange={(e) => setFormData({...formData, date_of_joining: e.target.value})}
                                        />
                                    </div>
                                    <div style={{gridColumn:'span 2'}}>
                                        <label style={styles.formLabel}>Address</label>
                                        <textarea 
                                            style={{...styles.formInput, height:'80px', paddingTop:'12px'}} 
                                            placeholder="Residential address..."
                                            value={formData.address}
                                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                            <div style={styles.modalFooter}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{padding:'10px 24px', backgroundColor:'transparent', border:'none', color:'#6B7280', fontWeight:'700', cursor:'pointer'}}>Cancel</button>
                                <button type="submit" style={styles.btnPrimary}>Save Teacher</button>
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

export default TeacherList;
