import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SCHOOL_CLASSES } from '../utils/constants';

const API_BASE_URL = 'https://web-production-d7c5e.up.railway.app/api/fees';
const STUDENTS_API_URL = 'https://web-production-d7c5e.up.railway.app/api/students';

const FeeManagement = () => {
    const [fees, setFees] = useState([]);
    const [stats, setStats] = useState({ total_collected: 0, total_pending: 0, total_overdue: 0 });
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [filters, setFilters] = useState({
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: String(new Date().getFullYear()),
        status: 'All',
        class: ''
    });

    // Modals state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedFee, setSelectedFee] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    
    const [newFee, setNewFee] = useState({
        student_id: '',
        amount: '',
        fee_type: 'Tuition',
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: String(new Date().getFullYear()),
        due_date: ''
    });

    const [paymentMethod, setPaymentMethod] = useState('cash');

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const years = ['2023', '2024', '2025', '2026'];

    const navigate = useNavigate();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [feesRes, statsRes] = await Promise.all([
                axios.get(API_BASE_URL, { params: filters }),
                axios.get(`${API_BASE_URL}/stats`)
            ]);
            setFees(feesRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Error fetching fees data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await axios.get(STUDENTS_API_URL);
            setStudents(res.data.filter(s => s.is_active));
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters]);

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleAddFee = async (e) => {
        e.preventDefault();
        try {
            await axios.post(API_BASE_URL, newFee);
            setIsAddModalOpen(false);
            setNewFee({
                student_id: '',
                amount: '',
                fee_type: 'Tuition',
                month: new Date().toLocaleString('default', { month: 'long' }),
                year: String(new Date().getFullYear()),
                due_date: ''
            });
            fetchData();
            alert('Fee record created successfully');
        } catch (error) {
            alert('Error creating fee: ' + (error.response?.data?.error || error.message));
        }
    };

    const handlePayment = async () => {
        try {
            const res = await axios.put(`${API_BASE_URL}/${selectedFee.id}/pay`, { payment_method: paymentMethod });
            setIsPaymentModalOpen(false);
            setSelectedFee(null);
            fetchData();
            alert(`Payment successful! Receipt: ${res.data.receipt_number}`);
        } catch (error) {
            alert('Error processing payment: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    // Styles (Consistent with Academic Atelier)
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
        content: {padding:'32px', maxWidth:'1200px', margin:'0 auto'},
        statsGrid: {display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'24px', marginBottom:'40px'},
        statsCard: (borderColor) => ({backgroundColor:'#FFFFFF', padding:'32px', borderRadius:'16px', borderLeft:`4px solid ${borderColor}`, boxShadow:'0 1px 3px rgba(0,0,0,0.05)'}),
        statsLabel: {fontSize:'11px', fontWeight:'700', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'8px'},
        statsValue: (color) => ({fontSize:'28px', fontWeight:'800', color:color, margin:0}),
        filtersRow: {backgroundColor:'#FFFFFF', padding:'24px', borderRadius:'16px', border:'1px solid #E5E7EB', display:'flex', gap:'20px', marginBottom:'40px', alignItems:'flex-end'},
        filterItem: {flex:1},
        filterLabel: {display:'block', fontSize:'11px', fontWeight:'700', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'8px'},
        select: {width:'100%', height:'40px', border:'none', backgroundColor:'#F9FAFB', borderRadius:'8px', padding:'0 12px', fontSize:'14px', fontWeight:'600', color:'#111827', outline:'none', cursor:'pointer'},
        tableCard: {backgroundColor:'#FFFFFF', borderRadius:'24px', border:'1px solid #E5E7EB', overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,0.05)'},
        th: {backgroundColor:'#F9FAFB', padding:'16px 24px', fontSize:'11px', fontWeight:'800', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.08em', borderBottom:'1px solid #E5E7EB'},
        td: {padding:'16px 24px', fontSize:'14px', color:'#111827', borderBottom:'1px solid #F3F4F6', verticalAlign:'middle'},
        avatar: {width:'36px', height:'36px', borderRadius:'50%', backgroundColor:'#EFF6FF', color:'#2563EB', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700'},
        statusBadge: (status) => {
            const configs = {
                paid: {bg:'#DCFCE7', color:'#16A34A'},
                pending: {bg:'#FEF3C7', color:'#D97706'},
                overdue: {bg:'#FEE2E2', color:'#DC2626'},
                default: {bg:'#F3F4F6', color:'#6B7280'}
            };
            const config = configs[status.toLowerCase()] || configs.default;
            return {
                padding:'4px 12px',
                borderRadius:'9999px',
                fontSize:'10px',
                fontWeight:'800',
                textTransform:'uppercase',
                letterSpacing:'0.05em',
                backgroundColor: config.bg,
                color: config.color,
                display:'inline-block'
            };
        },
        actionBtn: {padding:'8px 16px', backgroundColor:'#16A34A', color:'#FFFFFF', border:'none', borderRadius:'8px', fontSize:'11px', fontWeight:'800', textTransform:'uppercase', letterSpacing:'0.05em', cursor:'pointer', transition:'all 0.2s'},
        modalOverlay: {position:'fixed', top:0, left:0, width:'100vw', height:'100vh', backgroundColor:'rgba(17, 24, 39, 0.4)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100},
        modalContent: {backgroundColor:'#FFFFFF', borderRadius:'32px', width:'100%', maxWidth:'500px', padding:'40px', boxShadow:'0 25px 50px -12px rgba(0,0,0,0.2)'},
        modalAddFee: {backgroundColor:'#FFFFFF', borderRadius:'32px', width:'100%', maxWidth:'600px', padding:'40px', boxShadow:'0 25px 50px -12px rgba(0,0,0,0.2)'},
        modalTitle: {fontSize:'24px', fontWeight:'800', color:'#111827', margin:'0 0 8px 0'},
        modalSubtitle: {fontSize:'14px', color:'#6B7280', margin:'0 0 32px 0'},
        formLabel: {display:'block', fontSize:'11px', fontWeight:'700', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'8px'},
        input: {width:'100%', height:'48px', backgroundColor:'#F9FAFB', border:'none', borderRadius:'12px', padding:'0 16px', fontSize:'14px', fontWeight:'600', color:'#111827', outline:'none', marginBottom:'24px'},
        modalFooter: {display:'flex', gap:'16px', marginTop:'8px'},
        cancelBtn: {flex:1, height:'48px', backgroundColor:'#FFFFFF', border:'1px solid #E5E7EB', borderRadius:'12px', fontSize:'14px', fontWeight:'700', color:'#6B7280', cursor:'pointer'},
        submitBtn: {flex:1, height:'48px', backgroundColor:'#2563EB', border:'none', borderRadius:'12px', fontSize:'14px', fontWeight:'700', color:'#FFFFFF', cursor:'pointer'}
    };

    const getInitials = (name) => {
        if (!name) return '??';
        const parts = name.split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name[0].toUpperCase();
    };

    return (
        <div style={styles.wrapper}>
            {/* Sidebar */}
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
                    <a onClick={() => navigate('/dashboard/teachers')} style={styles.navLink}>
                        <span className="material-symbols-outlined">person_book</span>
                        <span>Teachers</span>
                    </a>
                    <a onClick={() => navigate('/dashboard/attendance')} style={styles.navLink}>
                        <span className="material-symbols-outlined">calendar_today</span>
                        <span>Attendance</span>
                    </a>
                    <a onClick={() => navigate('/dashboard/fees')} style={styles.navLinkActive}>
                        <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>payments</span>
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
                    <h2 style={styles.headerTitle}>Fee Management</h2>
                    <div 
                        style={{display:'flex', alignItems:'center', gap:'16px', position: 'relative', cursor: 'pointer'}}
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <div style={{textAlign:'right'}}>
                            <p style={{fontSize:'13px', fontWeight:'600', color:'#111827', margin:0}}>School Principal</p>
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
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'32px'}}>
                        <div>
                            <h1 style={{fontSize:'32px', fontWeight:'800', color:'#111827', margin:'0 0 8px 0'}}>Institutional Billing</h1>
                            <p style={{fontSize:'14px', color:'#6B7280', margin:0, fontWeight:'500'}}>Monitor financial health and manage student billing cycles.</p>
                        </div>
                        <button 
                            onClick={() => setIsAddModalOpen(true)}
                            style={{...styles.submitBtn, padding:'0 24px', maxWidth:'160px', height:'48px'}}
                        >
                            <span className="material-symbols-outlined">add</span>
                            <span>Add Fee</span>
                        </button>
                    </div>

                    {/* Stats Bento Grid */}
                    <div style={styles.statsGrid}>
                        <div style={styles.statsCard('#16A34A')}>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
                                <span style={styles.statsLabel}>Total Collected</span>
                                <span className="material-symbols-outlined" style={{color:'#16A34A'}}>account_balance_wallet</span>
                            </div>
                            <h2 style={styles.statsValue('#111827')}>₹{stats.total_collected.toLocaleString()}</h2>
                        </div>
                        <div style={styles.statsCard('#D97706')}>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
                                <span style={styles.statsLabel}>Total Pending</span>
                                <span className="material-symbols-outlined" style={{color:'#D97706'}}>pending_actions</span>
                            </div>
                            <h2 style={styles.statsValue('#111827')}>₹{stats.total_pending.toLocaleString()}</h2>
                        </div>
                        <div style={styles.statsCard('#DC2626')}>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
                                <span style={styles.statsLabel}>Total Overdue</span>
                                <span className="material-symbols-outlined" style={{color:'#DC2626'}}>priority_high</span>
                            </div>
                            <h2 style={styles.statsValue('#111827')}>₹{stats.total_overdue.toLocaleString()}</h2>
                        </div>
                    </div>

                    {/* Filters Row */}
                    <div style={styles.filtersRow}>
                        <div style={styles.filterItem}>
                            <label style={styles.filterLabel}>Month</label>
                            <select 
                                style={styles.select}
                                value={filters.month}
                                onChange={(e) => setFilters(prev => ({...prev, month: e.target.value}))}
                            >
                                {months.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div style={styles.filterItem}>
                            <label style={styles.filterLabel}>Year</label>
                            <select 
                                style={styles.select}
                                value={filters.year}
                                onChange={(e) => setFilters(prev => ({...prev, year: e.target.value}))}
                            >
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                        <div style={styles.filterItem}>
                            <label style={styles.filterLabel}>Status</label>
                            <select 
                                style={styles.select}
                                value={filters.status}
                                onChange={(e) => setFilters(prev => ({...prev, status: e.target.value}))}
                            >
                                <option value="All">All Status</option>
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="overdue">Overdue</option>
                            </select>
                        </div>
                        <div style={styles.filterItem}>
                            <label style={styles.filterLabel}>Class</label>
                            <select 
                                style={styles.select}
                                value={filters.class}
                                onChange={(e) => setFilters(prev => ({...prev, class: e.target.value}))}
                            >
                                <option value="">All Classes</option>
                                {SCHOOL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={styles.tableCard}>
                        <div style={{overflowX:'auto'}}>
                            <table style={{width:'100%', borderCollapse:'collapse'}}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>Student</th>
                                        <th style={styles.th}>Fee Type</th>
                                        <th style={styles.th}>Amount</th>
                                        <th style={styles.th}>Month/Year</th>
                                        <th style={styles.th}>Due Date</th>
                                        <th style={{...styles.th, textAlign:'center'}}>Status</th>
                                        <th style={{...styles.th, textAlign:'right'}}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" style={{...styles.td, textAlign:'center', padding:'64px', color:'#9CA3AF'}}>Processing financial records...</td>
                                        </tr>
                                    ) : fees.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" style={{...styles.td, textAlign:'center', padding:'64px', color:'#9CA3AF'}}>No fee records found for the selection.</td>
                                        </tr>
                                    ) : (
                                        fees.map((fee) => (
                                            <tr key={fee.id} style={{transition:'background-color 0.2s'}} onMouseEnter={(e)=>e.currentTarget.style.backgroundColor='#F9FAFB'} onMouseLeave={(e)=>e.currentTarget.style.backgroundColor='transparent'}>
                                                <td style={styles.td}>
                                                    <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                                                        <div style={styles.avatar}>{getInitials(fee.student?.full_name)}</div>
                                                        <div>
                                                            <div style={{fontWeight:'700', marginBottom:'2px'}}>{fee.student?.full_name}</div>
                                                            <div style={{fontSize:'11px', color:'#6B7280', fontWeight:'600'}}>Class {fee.student?.class}-{fee.student?.section}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={styles.td}>{fee.fee_type}</td>
                                                <td style={{...styles.td, fontWeight:'800'}}>₹{fee.amount.toLocaleString()}</td>
                                                <td style={styles.td}>{fee.month} {fee.year}</td>
                                                <td style={styles.td}>{new Date(fee.due_date).toLocaleDateString()}</td>
                                                <td style={{...styles.td, textAlign:'center'}}>
                                                    <span style={styles.statusBadge(fee.status)}>{fee.status}</span>
                                                </td>
                                                <td style={{...styles.td, textAlign:'right'}}>
                                                    {fee.status.toLowerCase() !== 'paid' ? (
                                                        <button 
                                                            onClick={() => { setSelectedFee(fee); setIsPaymentModalOpen(true); }}
                                                            style={styles.actionBtn}
                                                        >
                                                            Mark Paid
                                                        </button>
                                                    ) : (
                                                        <div style={{textAlign:'right'}}>
                                                            <span style={{fontSize:'9px', fontWeight:'800', color:'#9CA3AF', textTransform:'uppercase', display:'block'}}>Receipt</span>
                                                            <span style={{fontSize:'10px', color:'#6B7280', fontFamily:'monospace'}}>{fee.receipt_number}</span>
                                                        </div>
                                                    )}
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

            {/* Add Fee Modal */}
            {isAddModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalAddFee}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px'}}>
                            <h3 style={styles.modalTitle}>Add New Fee Record</h3>
                            <button onClick={() => setIsAddModalOpen(false)} style={{border:'none', background:'none', cursor:'pointer', color:'#9CA3AF'}}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <p style={styles.modalSubtitle}>Create a new billing statement for an institutional student.</p>
                        
                        <form onSubmit={handleAddFee}>
                            <div style={{marginBottom:'24px'}}>
                                <label style={styles.formLabel}>Select Student</label>
                                <select 
                                    style={styles.input}
                                    value={newFee.student_id}
                                    onChange={(e) => setNewFee({...newFee, student_id: e.target.value})}
                                    required
                                >
                                    <option value="">Search student by name...</option>
                                    {students.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.class}-{s.section})</option>)}
                                </select>
                            </div>

                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
                                <div>
                                    <label style={styles.formLabel}>Fee Type</label>
                                    <select style={styles.input} value={newFee.fee_type} onChange={(e)=>setNewFee({...newFee, fee_type: e.target.value})}>
                                        <option value="Tuition">Tuition Fee</option>
                                        <option value="Transport">Transport Fee</option>
                                        <option value="Library">Library Fee</option>
                                        <option value="Exam">Exam Fee</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={styles.formLabel}>Amount (₹)</label>
                                    <input 
                                        type="number" 
                                        style={styles.input} 
                                        placeholder="5000"
                                        value={newFee.amount}
                                        onChange={(e)=>setNewFee({...newFee, amount:e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={styles.formLabel}>Month</label>
                                    <select style={styles.input} value={newFee.month} onChange={(e)=>setNewFee({...newFee, month: e.target.value})}>
                                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={styles.formLabel}>Due Date</label>
                                    <input 
                                        type="date" 
                                        style={styles.input}
                                        value={newFee.due_date}
                                        onChange={(e)=>setNewFee({...newFee, due_date: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={styles.modalFooter}>
                                <button type="button" onClick={() => setIsAddModalOpen(false)} style={styles.cancelBtn}>Cancel</button>
                                <button type="submit" style={styles.submitBtn}>Create Record</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {isPaymentModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <div style={{textAlign:'center', marginBottom:'32px'}}>
                            <div style={{width:'64px', height:'64px', backgroundColor:'#EFF6FF', color:'#2563EB', borderRadius:'16px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px auto'}}>
                                <span className="material-symbols-outlined" style={{fontSize:'32px'}}>payments</span>
                            </div>
                            <h3 style={styles.modalTitle}>Process Payment</h3>
                            <p style={styles.modalSubtitle}>Confirm payment of <span style={{fontWeight:'800', color:'#111827'}}>₹{selectedFee?.amount}</span> for {selectedFee?.student?.full_name}</p>
                        </div>

                        <div style={{marginBottom:'32px'}}>
                            <label style={styles.formLabel}>Payment Method</label>
                            <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'10px'}}>
                                {['cash', 'online', 'cheque'].map(m => (
                                    <button 
                                        key={m}
                                        onClick={() => setPaymentMethod(m)}
                                        style={{
                                            height:'48px',
                                            borderRadius:'12px',
                                            border: paymentMethod === m ? '2px solid #2563EB' : '1px solid #E5E7EB',
                                            backgroundColor: paymentMethod === m ? '#EFF6FF' : '#FFFFFF',
                                            color: paymentMethod === m ? '#2563EB' : '#6B7280',
                                            fontSize:'11px',
                                            fontWeight:'800',
                                            textTransform:'uppercase',
                                            cursor:'pointer'
                                        }}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={styles.modalFooter}>
                            <button onClick={() => setIsPaymentModalOpen(false)} style={styles.cancelBtn}>Cancel</button>
                            <button onClick={handlePayment} style={styles.submitBtn}>Confirm Transaction</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeeManagement;

