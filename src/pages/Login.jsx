import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogIn, Key, Mail, ChevronDown, ShieldCheck, GraduationCap, Users } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Principal');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            // Fetch user role from profiles table
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single();

            if (profileError) {
                console.error('Error fetching profile:', profileError);
                // Fallback redirection based on selected role
                const selectedRole = role.toLowerCase();
                navigate(`/dashboard/${selectedRole}`);
                return;
            }

            const dbRole = profile.role.toLowerCase();
            const selectedRole = role.toLowerCase();

            if (dbRole !== selectedRole) {
                throw new Error(`Unauthorized: You are registered as a ${dbRole}, not a ${selectedRole}.`);
            }

            // Route based on role
            if (dbRole === 'principal') navigate('/dashboard/principal');
            else if (dbRole === 'teacher') navigate('/dashboard/teacher');
            else if (dbRole === 'parent') navigate('/dashboard/parent');
            else navigate('/dashboard/student');

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Premium Inline Styles (Academic Atelier System)
    const styles = {
        shell: {
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            backgroundColor: '#F9FAFB',
            fontFamily: "'Inter', sans-serif",
            position: 'relative',
            overflow: 'hidden'
        },
        main: {
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 10
        },
        canvas: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%'
        },
        branding: {
            textAlign: 'center',
            marginBottom: '32px'
        },
        title: {
            fontFamily: "'Manrope', sans-serif",
            fontSize: '32px',
            fontWeight: '800',
            color: '#2563EB',
            letterSpacing: '-0.025em',
            lineHeight: '1',
            margin: '0 0 8px 0'
        },
        subtitle: {
            fontSize: '14px',
            color: '#6B7280',
            fontWeight: '500',
            letterSpacing: '0.025em',
            margin: 0
        },
        card: {
            width: '400px',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            padding: '40px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07), 0 10px 15px -3px rgba(0, 0, 0, 0.04)',
            boxSizing: 'border-box'
        },
        formGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        },
        inputBox: {
            display: 'flex',
            flexDirection: 'column'
        },
        label: {
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '6px'
        },
        input: {
            width: '100%',
            height: '44px',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            padding: '0 12px',
            fontSize: '14px',
            outline: 'none',
            backgroundColor: '#FFFFFF',
            transition: 'border-color 0.2s',
            boxSizing: 'border-box'
        },
        select: {
            appearance: 'none',
            cursor: 'pointer'
        },
        selectIcon: {
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94A3B8',
            pointerEvents: 'none'
        },
        submitBtn: {
            width: '100%',
            height: '44px',
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginTop: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
        },
        errorAlert: {
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#FEF2F2',
            color: '#B91C1C',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '500',
            border: '1px solid #FEE2E2',
            textAlign: 'center'
        },
        forgotLink: {
            fontSize: '13px',
            color: '#6B7280',
            textDecoration: 'none',
            transition: 'color 0.2s'
        },
        footer: {
            marginTop: '32px',
            textAlign: 'center'
        },
        footerText: {
            fontSize: '11px',
            color: '#94A3B8',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
        },
        bgGradient: (pos) => ({
            position: 'absolute',
            width: '40%',
            height: '40%',
            backgroundColor: pos === 'top' ? 'rgba(37, 99, 235, 0.05)' : 'rgba(73, 92, 149, 0.05)',
            borderRadius: '50%',
            filter: 'blur(100px)',
            zIndex: 1,
            pointerEvents: 'none',
            ...(pos === 'top' ? { top: '-10%', left: '-5%' } : { bottom: '-10%', right: '-5%' })
        })
    };

    return (
        <div style={styles.shell}>
            {/* Visual Background Elements */}
            <div style={styles.bgGradient('top')}></div>
            <div style={styles.bgGradient('bottom')}></div>

            <main style={styles.main}>
                <div style={styles.canvas}>
                    {/* Branding Header */}
                    <div style={styles.branding}>
                        <h1 style={styles.title}>EduSync</h1>
                        <p style={styles.subtitle}>School Management Platform</p>
                    </div>

                    {/* Login Card */}
                    <div style={styles.card}>
                        <form onSubmit={handleLogin} style={styles.formGroup}>
                            {/* Role Dropdown */}
                            <div style={styles.inputBox}>
                                <label style={styles.label}>Role</label>
                                <div style={{ position: 'relative' }}>
                                    <select 
                                        style={{ ...styles.input, ...styles.select }}
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        required
                                    >
                                        <option value="Principal">Principal</option>
                                        <option value="Teacher">Teacher</option>
                                        <option value="Parent">Parent</option>
                                    </select>
                                    <div style={styles.selectIcon}>
                                        <ChevronDown size={18} />
                                    </div>
                                </div>
                            </div>

                            {/* Email Field */}
                            <div style={styles.inputBox}>
                                <label style={styles.label}>Email Address</label>
                                <input 
                                    style={styles.input}
                                    placeholder="name@edusync.edu" 
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Password Field */}
                            <div style={styles.inputBox}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <label style={{ ...styles.label, marginBottom: 0 }}>Password</label>
                                    <a href="#" style={styles.forgotLink}>Forgot password?</a>
                                </div>
                                <input 
                                    style={styles.input}
                                    placeholder="••••••••" 
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Submit Button */}
                            <button 
                                style={{ 
                                    ...styles.submitBtn, 
                                    opacity: loading ? 0.7 : 1, 
                                    cursor: loading ? 'not-allowed' : 'pointer' 
                                }} 
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Authenticating...' : 'Sign In'}
                            </button>
                        </form>

                        {/* Error Handling */}
                        {error && (
                            <div style={styles.errorAlert}>
                                {error}
                            </div>
                        )}

                        {/* Secondary Links */}
                        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #F1F5F9', textAlign: 'center' }}>
                            <p style={{ fontSize: '12px', color: '#94A3B8' }}>
                                Need an account? <a href="#" style={{ color: '#2563EB', fontWeight: '600', textDecoration: 'none' }}>Contact administration</a>
                            </p>
                        </div>
                    </div>

                    {/* Simple Footer */}
                    <footer style={styles.footer}>
                        <p style={styles.footerText}>Secured by EduSync Infrastructure</p>
                    </footer>
                </div>
            </main>
        </div>
    );
};

export default Login;
