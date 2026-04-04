import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ChevronDown, ShieldCheck, GraduationCap, Users, LogIn } from 'lucide-react';

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

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single();

            if (profileError) {
                console.error('Error fetching profile:', profileError);
                const selectedRole = role.toLowerCase();
                navigate(`/dashboard/${selectedRole}`);
                return;
            }

            const dbRole = profile.role.toLowerCase();
            const selectedRole = role.toLowerCase();

            if (dbRole !== selectedRole) {
                throw new Error(`Unauthorized: You are registered as a ${dbRole}, not a ${selectedRole}.`);
            }

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

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 font-inter relative overflow-hidden">
            {/* Ambient Backdrops */}
            <div className="absolute -top-[10%] -left-[5%] w-2/5 h-2/5 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute -bottom-[10%] -right-[5%] w-2/5 h-2/5 bg-slate-500/5 rounded-full blur-[100px] pointer-events-none"></div>

            <main className="w-full max-w-[440px] relative z-10">
                <div className="flex flex-col items-center">
                    {/* Branding */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200 mb-6 group transition-transform hover:scale-105 duration-500">
                            <GraduationCap className="text-white w-8 h-8" />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">EduSync</h1>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Institutional Portal</p>
                    </div>

                    {/* Login Card */}
                    <div className="w-full bg-white rounded-[32px] border border-slate-100 p-8 md:p-10 shadow-2xl shadow-slate-200/50">
                        <form onSubmit={handleLogin} className="space-y-6">
                            {/* Role Select */}
                            <div className="space-y-2">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Access Level</label>
                                <div className="relative group">
                                    <select 
                                        className="w-full h-14 bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-2xl px-5 text-sm font-bold text-slate-900 outline-none cursor-pointer appearance-none transition-all"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        required
                                    >
                                        <option value="Principal">Principal</option>
                                        <option value="Teacher">Teacher</option>
                                        <option value="Parent">Parent</option>
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
                                        <ChevronDown size={20} />
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Institutional Email</label>
                                <input 
                                    className="w-full h-14 bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-2xl px-5 text-sm font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="name@edusync.edu" 
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Secret Key</label>
                                    <a href="#" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">Recover?</a>
                                </div>
                                <input 
                                    className="w-full h-14 bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-2xl px-5 text-sm font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="••••••••" 
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Error Alert */}
                            {error && (
                                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold text-center animate-shake">
                                    {error}
                                </div>
                            )}

                            {/* Submit */}
                            <button 
                                className={`w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2 italic">
                                        Authenticating...
                                    </span>
                                ) : (
                                    <>
                                        Authorized Sign In
                                        <LogIn size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Secondary */}
                        <div className="mt-8 pt-8 border-top border-slate-50 text-center">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                                System Inquiry? <a href="#" className="text-blue-600 font-black hover:underline ml-1">Contact Protocol</a>
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <footer className="mt-10 text-center space-y-4">
                        <div className="flex items-center justify-center gap-2 text-slate-300">
                            <ShieldCheck size={14} />
                            <p className="text-[9px] font-black uppercase tracking-[0.2em]">End-to-End Encrypted Node</p>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400">© 2026 EduSync Core. All Rights Reserved.</p>
                    </footer>
                </div>
            </main>

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
                .animate-shake { animation: shake 0.2s cubic-bezier(.36,.07,.19,.97) both; }
            `}</style>
        </div>
    );
};

export default Login;
