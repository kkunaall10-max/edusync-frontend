import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import { User, Mail, Shield, Lock, Save, ChevronRight } from 'lucide-react';

const Settings = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };
        fetchUser();
    }, []);

    const role = user?.user_metadata?.role || 'User';

    return (
        <Layout role="principal">
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Settings</h1>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Platform Configuration & Security</p>
                </div>

                {/* Profile Section */}
                <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-slate-50 flex items-center gap-6">
                        <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100">
                            <User size={40} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 leading-tight">{user?.email?.split('@')[0]}</h2>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                    {role}
                                </span>
                                <span className="text-[11px] font-bold text-slate-400 italic">Institutional Access Level</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                    <Mail size={12} className="text-blue-500" />
                                    Email Identity
                                </label>
                                <div className="h-12 bg-slate-50 rounded-xl px-4 flex items-center text-sm font-bold text-slate-900 border border-transparent">
                                    {user?.email}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                    <Shield size={12} className="text-blue-500" />
                                    Account Role
                                </label>
                                <div className="h-12 bg-slate-50 rounded-xl px-4 flex items-center text-sm font-bold text-slate-900 border border-transparent capitalize">
                                    {role}
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Account Metadata</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-400">Created At</span>
                                    <span className="font-black text-slate-600">{new Date(user?.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-400">Last Sign In</span>
                                    <span className="font-black text-slate-600">{new Date(user?.last_sign_in_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Password Change Section */}
                <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-slate-50">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                            <Lock size={20} className="text-blue-600" />
                            Security Protocol
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Update Authentication Secret</p>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                    Current Password
                                </label>
                                <input 
                                    className="w-full h-12 bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-xl px-4 text-sm font-bold text-slate-900 outline-none transition-all"
                                    type="password"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                    New Password
                                </label>
                                <input 
                                    className="w-full h-12 bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-xl px-4 text-sm font-bold text-slate-900 outline-none transition-all"
                                    type="password"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button className="h-12 px-8 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2">
                                Update Secret
                                <Save size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Settings;
